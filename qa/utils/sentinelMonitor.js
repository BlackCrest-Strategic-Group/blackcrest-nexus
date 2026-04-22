import fs from 'node:fs';
import path from 'node:path';

const EVENTS_FILE = path.resolve('qa/reports/summaries/sentinel-events.json');

function ensureEventLog() {
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.mkdirSync(path.dirname(EVENTS_FILE), { recursive: true });
    fs.writeFileSync(EVENTS_FILE, '[]');
  }
}

function appendEvent(event) {
  ensureEventLog();
  const existing = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
  existing.push(event);
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(existing, null, 2));
}

export function attachSentinelMonitor(page, testInfo) {
  const observed = {
    consoleErrors: [],
    pageErrors: [],
    failedApiResponses: []
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      observed.consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (error) => {
    observed.pageErrors.push(error.message);
  });

  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      observed.failedApiResponses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  return {
    async assertNoBlankScreen() {
      const bodyText = ((await page.textContent('body')) || '').trim();
      if (!bodyText || bodyText.length < 8) {
        throw new Error('Blank screen detected: body text is empty or too short.');
      }
    },

    async assertNoStuckLoading(maxMs = 12000) {
      const loading = page.getByText(/loading|please wait|checking your secure session/i).first();
      const started = Date.now();

      while (Date.now() - started < maxMs) {
        if (!(await loading.isVisible().catch(() => false))) {
          return;
        }
        await page.waitForTimeout(350);
      }

      if (await loading.isVisible().catch(() => false)) {
        throw new Error(`Stuck loading state detected after ${maxMs}ms.`);
      }
    },

    async flush(status) {
      appendEvent({
        testName: testInfo.title,
        suite: testInfo.titlePath,
        status,
        timestamp: new Date().toISOString(),
        url: page.url(),
        observed
      });
    },

    observed
  };
}

export async function saveFailureArtifacts(page, testInfo, observed) {
  if (testInfo.status === testInfo.expectedStatus) {
    return;
  }

  const slug = testInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const stamp = new Date().toISOString().replace(/[.:]/g, '-');
  const basename = `${stamp}-${slug}`;

  const screenshotPath = path.resolve(`qa/reports/screenshots/${basename}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const jsonPath = path.resolve(`qa/reports/summaries/${basename}.error.json`);
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        testName: testInfo.title,
        timestamp: new Date().toISOString(),
        route: page.url(),
        screenshot: screenshotPath,
        video: testInfo.attachments.find((a) => a.name === 'video')?.path || null,
        errors: observed
      },
      null,
      2
    )
  );
}
