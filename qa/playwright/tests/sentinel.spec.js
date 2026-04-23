import path from 'node:path';
import { test, expect } from '@playwright/test';
import { attachSentinelMonitor, saveFailureArtifacts } from '../../utils/sentinelMonitor.js';
import { ensurePersonaAccount, loadPersonas } from '../../utils/personas.js';

const personas = loadPersonas();
const demoDan = personas['Demo Dan'];
const mobileMike = personas['Mobile Mike'];
const monitorByTitle = new Map();
const monitorKey = (testInfo) => `${testInfo.project.name}:${testInfo.titlePath.join(' > ')}`;

async function loginAs(page, persona) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(persona.email);
  await page.getByTestId('login-password').fill(persona.password);
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/dashboard|\/app/);
  await expect(page.getByTestId('shell-root')).toBeVisible();
}

test.beforeAll(async ({ request, baseURL }) => {
  for (const persona of Object.values(personas)) {
    await ensurePersonaAccount(request, baseURL, persona);
  }
});

test.beforeEach(async ({ page }, testInfo) => {
  const monitor = attachSentinelMonitor(page, testInfo);
  testInfo.setTimeout(60_000);
  testInfo.annotations.push({ type: 'persona', description: demoDan.name });
  monitorByTitle.set(monitorKey(testInfo), monitor);
});

test.afterEach(async ({ page }, testInfo) => {
  const key = monitorKey(testInfo);
  const monitor = monitorByTitle.get(key);
  if (monitor) {
    await saveFailureArtifacts(page, testInfo, monitor.observed);
    await monitor.flush(testInfo.status);
    monitorByTitle.delete(key);
  }
});

test('landing page load @smoke', async ({ page }, testInfo) => {
  const monitor = monitorByTitle.get(monitorKey(testInfo));
  await page.goto('/');
  await expect(page.getByTestId('landing-hero')).toBeVisible();
  await expect(page.getByTestId('landing-signin')).toBeVisible();
  await monitor.assertNoBlankScreen();
  await monitor.assertNoStuckLoading();
});

test('login flow + protected route guard', async ({ page }, testInfo) => {
  const monitor = monitorByTitle.get(monitorKey(testInfo));
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);

  await loginAs(page, demoDan);
  await monitor.assertNoBlankScreen();
});

test('session persistence across route changes', async ({ page }, testInfo) => {
  const monitor = monitorByTitle.get(monitorKey(testInfo));
  await loginAs(page, demoDan);

  await page.getByTestId('nav-intelligence').click();
  await expect(page).toHaveURL(/\/intelligence/);
  await page.reload();
  await expect(page).toHaveURL(/\/intelligence/);
  await expect(page.getByTestId('shell-root')).toBeVisible();

  await page.getByTestId('nav-dashboard').click();
  await expect(page).toHaveURL(/\/dashboard/);
  await monitor.assertNoStuckLoading();
});

test('logout flow', async ({ page }) => {
  await loginAs(page, demoDan);
  await page.getByTestId('logout-button').click();
  await expect(page).toHaveURL(/\/login/);
});

test('major tab navigation stays healthy', async ({ page }, testInfo) => {
  const monitor = monitorByTitle.get(monitorKey(testInfo));
  await loginAs(page, demoDan);

  const routes = [
    ['dashboard', /\/dashboard/],
    ['intelligence', /\/intelligence/],
    ['category-intelligence', /\/category-intelligence/],
    ['supplier-intelligence', /\/supplier-intelligence/],
    ['opportunity-intelligence', /\/opportunity-intelligence/],
    ['watchlist', /\/watchlist/],
    ['history', /\/history/]
  ];

  for (const [slug, urlPattern] of routes) {
    await page.getByTestId(`nav-${slug}`).click();
    await expect(page).toHaveURL(urlPattern);
    await monitor.assertNoBlankScreen();
  }
});

test('intelligence sub-tab uniqueness and duplicate rendering protection', async ({ page }, testInfo) => {
  const monitor = monitorByTitle.get(monitorKey(testInfo));
  await loginAs(page, demoDan);
  await page.goto('/intelligence');

  const expectations = [
    ['category-intelligence', /Category History/i],
    ['supplier-intelligence', /No suppliers yet|Add a supplier/i],
    ['opportunity-intelligence', /No opportunity analysis yet|Opportunity title/i]
  ];

  for (const [tab, uniqueText] of expectations) {
    await page.getByTestId(`intelligence-tab-${tab}`).click();
    await expect(page.getByTestId(`tabpanel-${tab}`)).toBeVisible();
    await expect(page.getByText(uniqueText).first()).toBeVisible();

    const dupes = page.getByTestId(`tabpanel-${tab}`);
    await expect(dupes).toHaveCount(1);
  }

  await monitor.assertNoBlankScreen();
});

test('upload flow smoke + analysis workflow smoke', async ({ page }, testInfo) => {
  const monitor = monitorByTitle.get(monitorKey(testInfo));
  await loginAs(page, demoDan);
  await page.goto('/opportunity-intelligence');

  const uploadPath = path.resolve('qa/fixtures/upload-sample.txt');
  await page.getByTestId('opportunity-upload').setInputFiles(uploadPath);
  await expect(page.getByTestId('opportunity-file-selected')).toContainText('upload-sample.txt');

  await page.getByTestId('opportunity-title').fill('Sentinel Demo Opportunity');
  await page.getByTestId('opportunity-text').fill('Need AI procurement analytics support with compliance checks.');
  await page.getByTestId('analyze-opportunity').click();

  await expect(page.getByTestId('opportunity-panel')).toBeVisible();
  await monitor.assertNoStuckLoading();
});

test('analysis/search workflow via category intelligence', async ({ page }, testInfo) => {
  const monitor = monitorByTitle.get(monitorKey(testInfo));
  await loginAs(page, demoDan);
  await page.goto('/category-intelligence');

  await page.getByTestId('category-categoryName').fill('Cybersecurity');
  await page.getByTestId('category-product').fill('Managed SIEM');
  await page.getByTestId('category-notes').fill('Focus on federal + commercial shared controls.');
  await page.getByTestId('category-geography').fill('US');
  await page.getByTestId('analyze-category').click();

  await expect(page.getByTestId('category-panel')).toBeVisible();
  await monitor.assertNoBlankScreen();
});

test('mobile viewport smoke test @mobile @smoke', async ({ page }, testInfo) => {
  const monitor = monitorByTitle.get(monitorKey(testInfo));
  await loginAs(page, mobileMike);
  await expect(page.getByTestId('shell-root')).toBeVisible();
  await page.getByTestId('nav-intelligence').click();
  await expect(page.getByTestId('intelligence-tablist')).toBeVisible();
  await monitor.assertNoBlankScreen();
});

test('investor demo and procurement OS centers load @smoke', async ({ page }, testInfo) => {
  const monitor = monitorByTitle.get(monitorKey(testInfo));
  await page.goto('/investor-demo');
  await expect(page.getByText(/Investor Demo Mode/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'CEO' })).toBeVisible();

  await loginAs(page, demoDan);
  await page.goto('/blanket-po-builder');
  await expect(page.getByText(/upload/i).first()).toBeVisible();

  await page.goto('/report-center');
  await expect(page.getByText(/Report Export Center/i)).toBeVisible();

  await page.goto('/erp-connector-center');
  await expect(page.getByText(/ERP Connector Center/i)).toBeVisible();

  await monitor.assertNoBlankScreen();
});
