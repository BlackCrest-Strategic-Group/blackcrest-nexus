import fs from 'node:fs';
import path from 'node:path';

const files = [
  'qa/reports/summaries/sentinel-events.json',
  'qa/reports/summaries/playwright-report.json',
  'qa/reports/summaries/demo-readiness.json',
  'qa/reports/summaries/demo-readiness.md'
];

for (const file of files) {
  const full = path.resolve(file);
  if (fs.existsSync(full)) fs.rmSync(full, { force: true });
}

fs.mkdirSync(path.resolve('qa/reports/summaries'), { recursive: true });
fs.writeFileSync(path.resolve('qa/reports/summaries/sentinel-events.json'), '[]');
console.log('Sentinel run artifacts reset.');
