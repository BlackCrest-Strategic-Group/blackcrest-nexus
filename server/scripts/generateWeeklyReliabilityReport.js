import { connectDB } from '../../backend/config/db.js';
import { loadEnv } from '../../backend/utils/loadEnv.js';
import { writeWeeklyReliabilityAndRoiReport } from '../services/weeklyOpsReportService.js';

loadEnv();

if (!process.env.MONGODB_URI && process.env.MONGO_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
}

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is required to generate weekly reliability report.');
  process.exit(1);
}

await connectDB();
const { outPath, report } = await writeWeeklyReliabilityAndRoiReport({ now: new Date() });
console.log(`[weekly-report] written: ${outPath}`);
console.log(`[weekly-report] reliability errorRatePct=${report.reliability.errorRatePct}, p95Ms=${report.reliability.p95DurationMs}`);
console.log(`[weekly-report] roi realizedSavingsUsd=${report.roi.realizedSavingsUsd}, opportunityAnalyses=${report.roi.opportunityAnalysesCompleted}`);
process.exit(0);
