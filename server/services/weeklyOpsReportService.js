import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Tenant from '../models/Tenant.js';
import AuditLog from '../models/AuditLog.js';
import WorkflowRun from '../models/WorkflowRun.js';
import SavingsRecord from '../models/SavingsRecord.js';
import OpportunityAnalysis from '../models/OpportunityAnalysis.js';

function round(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export async function buildWeeklyReliabilityAndRoiReport({ now = new Date() } = {}) {
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [activeTenantCount, totalTenantCount, auditWindow, workflows, savings, opportunityRuns] = await Promise.all([
    Tenant.countDocuments({ subscriptionStatus: { $in: ['active', 'trialing'] } }),
    Tenant.countDocuments({}),
    AuditLog.find({ createdAt: { $gte: sevenDaysAgo }, entityType: 'api_request' }).select('metadata').lean(),
    WorkflowRun.find({ createdAt: { $gte: sevenDaysAgo } }).select('status tenantId').lean(),
    SavingsRecord.find({ createdAt: { $gte: sevenDaysAgo } }).select('tenantId realizedSavings baselineCost negotiatedCost').lean(),
    OpportunityAnalysis.find({ createdAt: { $gte: sevenDaysAgo } }).select('tenantId').lean()
  ]);

  const requestCount = auditWindow.length;
  const errorCount = auditWindow.filter((entry) => Number(entry?.metadata?.statusCode || 200) >= 500).length;
  const p95DurationMs = (() => {
    const durations = auditWindow.map((entry) => Number(entry?.metadata?.durationMs || 0)).filter((n) => n > 0).sort((a, b) => a - b);
    if (!durations.length) return 0;
    const idx = Math.floor(0.95 * (durations.length - 1));
    return durations[idx];
  })();

  const completedWorkflows = workflows.filter((run) => run.status === 'completed').length;
  const blockedWorkflows = workflows.filter((run) => run.status === 'blocked').length;
  const realizedSavingsUsd = savings.reduce((sum, item) => sum + Number(item.realizedSavings || 0), 0);
  const modeledSavingsUsd = savings.reduce((sum, item) => {
    const baseline = Number(item.baselineCost || 0);
    const negotiated = Number(item.negotiatedCost || 0);
    return sum + Math.max(0, baseline - negotiated);
  }, 0);

  return {
    generatedAt: now.toISOString(),
    reportingWindowStart: sevenDaysAgo.toISOString(),
    reliability: {
      requestCount,
      errorRatePct: requestCount ? round((errorCount / requestCount) * 100) : 0,
      p95DurationMs,
      workflowCompletionRatePct: workflows.length ? round((completedWorkflows / workflows.length) * 100) : 0,
      blockedWorkflowCount: blockedWorkflows
    },
    roi: {
      activeTenantCount,
      totalTenantCount,
      opportunityAnalysesCompleted: opportunityRuns.length,
      realizedSavingsUsd: round(realizedSavingsUsd),
      modeledSavingsUsd: round(modeledSavingsUsd)
    }
  };
}

export async function writeWeeklyReliabilityAndRoiReport({ now = new Date() } = {}) {
  const report = await buildWeeklyReliabilityAndRoiReport({ now });
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outDir = path.resolve(__dirname, '../../qa/reports/weekly');
  await fs.mkdir(outDir, { recursive: true });

  const dateLabel = now.toISOString().slice(0, 10);
  const outPath = path.join(outDir, `weekly-reliability-roi-${dateLabel}.md`);
  const body = `# Weekly Reliability + ROI Report\n\nGenerated: ${report.generatedAt}\nWindow start: ${report.reportingWindowStart}\n\n## Reliability\n- API requests: ${report.reliability.requestCount}\n- API error rate (%): ${report.reliability.errorRatePct}\n- p95 request latency (ms): ${report.reliability.p95DurationMs}\n- Workflow completion rate (%): ${report.reliability.workflowCompletionRatePct}\n- Blocked workflows: ${report.reliability.blockedWorkflowCount}\n\n## ROI\n- Active tenants: ${report.roi.activeTenantCount}/${report.roi.totalTenantCount}\n- Opportunity analyses completed: ${report.roi.opportunityAnalysesCompleted}\n- Realized savings (USD): ${report.roi.realizedSavingsUsd}\n- Modeled savings (USD): ${report.roi.modeledSavingsUsd}\n`;

  await fs.writeFile(outPath, body, 'utf8');
  return { report, outPath };
}
