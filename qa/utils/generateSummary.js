import fs from 'node:fs';
import path from 'node:path';
import { calculateDemoReadiness } from './scoring.js';

const PLAYWRIGHT_JSON = path.resolve('qa/reports/summaries/playwright-report.json');
const SENTINEL_EVENTS = path.resolve('qa/reports/summaries/sentinel-events.json');
const OUT_JSON = path.resolve('qa/reports/summaries/demo-readiness.json');
const OUT_MD = path.resolve('qa/reports/summaries/demo-readiness.md');

function safeReadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function flattenSpecs(suites = [], bucket = []) {
  for (const suite of suites) {
    if (Array.isArray(suite.specs)) {
      for (const spec of suite.specs) {
        const tests = Array.isArray(spec.tests) ? spec.tests : [];
        for (const t of tests) {
          bucket.push({
            title: spec.title,
            outcome: t.results?.[0]?.status || t.status || 'unknown'
          });
        }
      }
    }
    if (Array.isArray(suite.suites)) flattenSpecs(suite.suites, bucket);
  }
  return bucket;
}

function categorize(title) {
  const t = title.toLowerCase();
  if (/(login|logout|protected|session|auth)/.test(t)) return 'auth';
  if (/(tab|navigation|route|landing|intelligence)/.test(t)) return 'navigation';
  if (/(upload|analysis|search)/.test(t)) return 'analysis';
  if (/(mobile)/.test(t)) return 'mobile';
  return 'navigation';
}

function summarizeResults(specs) {
  const categories = { auth: { passed: 0, total: 0 }, navigation: { passed: 0, total: 0 }, analysis: { passed: 0, total: 0 }, mobile: { passed: 0, total: 0 } };

  for (const spec of specs) {
    const key = categorize(spec.title);
    categories[key].total += 1;
    if (spec.outcome === 'passed') categories[key].passed += 1;
  }

  return categories;
}

function countObserved(events) {
  return events.reduce((acc, e) => {
    acc.consoleErrors += e.observed?.consoleErrors?.length || 0;
    acc.pageErrors += e.observed?.pageErrors?.length || 0;
    acc.failedApiResponses += e.observed?.failedApiResponses?.length || 0;
    return acc;
  }, { consoleErrors: 0, pageErrors: 0, failedApiResponses: 0 });
}

const playwright = safeReadJson(PLAYWRIGHT_JSON, { suites: [] });
const events = safeReadJson(SENTINEL_EVENTS, []);
const specs = flattenSpecs(playwright.suites || []);
const categories = summarizeResults(specs);
const totals = countObserved(events);
const readiness = calculateDemoReadiness({ categories, totals });

const statusLine = readiness.score >= 85
  ? 'Demo readiness is strong.'
  : readiness.score >= 70
    ? 'Demo readiness is moderate; fix high-risk issues before May 11, 2026.'
    : 'Demo readiness is at risk; critical stabilization is required before May 11, 2026.';

const summary = {
  generatedAt: new Date().toISOString(),
  runDateTarget: 'May 11, 2026',
  testsExecuted: specs.length,
  testsPassed: specs.filter((x) => x.outcome === 'passed').length,
  testsFailed: specs.filter((x) => x.outcome !== 'passed').length,
  categories,
  totals,
  readiness,
  statusLine
};

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2));

const markdown = `# BlackCrest Sentinel Demo Readiness Summary

- **Generated:** ${summary.generatedAt}
- **Demo Target:** ${summary.runDateTarget}
- **Tests Executed:** ${summary.testsExecuted}
- **Passed:** ${summary.testsPassed}
- **Failed/Flaky:** ${summary.testsFailed}

## Demo Readiness Score

**${readiness.score}/100**

${statusLine}

## Weighted Breakdown

- Auth reliability (${readiness.weights.authReliability}%): **${readiness.breakdown.authReliability}%**
- Navigation stability (${readiness.weights.navigationStability}%): **${readiness.breakdown.navigationStability}%**
- Upload/analysis success (${readiness.weights.uploadAnalysisSuccess}%): **${readiness.breakdown.uploadAnalysisSuccess}%**
- Console/network cleanliness (${readiness.weights.consoleNetworkCleanliness}%): **${readiness.breakdown.consoleNetworkCleanliness}%**
- Mobile/UI sanity (${readiness.weights.mobileUiSanity}%): **${readiness.breakdown.mobileUiSanity}%**

## Observed Runtime Issues

- Console errors: ${totals.consoleErrors}
- Page errors: ${totals.pageErrors}
- Failed API responses: ${totals.failedApiResponses}

## Plain-English Assessment

${statusLine} Focus first on any failing auth and navigation tests, then clean up API failures and UI loading stalls so the live demo path stays smooth for technical and non-technical reviewers.
`;

fs.writeFileSync(OUT_MD, markdown);
console.log(`Sentinel summary generated:\n- ${OUT_JSON}\n- ${OUT_MD}`);
