export function generateReport(type, context = {}) {
  const generatedAt = new Date().toISOString();
  const base = {
    generatedAt,
    type,
    printableLabel: 'Print / Save as PDF',
    preview: '',
    json: {},
    csv: null
  };

  if (type === 'Executive Summary') {
    base.preview = `Executive summary generated at ${generatedAt}. Leakage: $${context.totalEstimatedLeakage || 0}.`;
    base.json = { kpis: context.kpis || {}, topAlerts: context.alerts?.slice(0, 5) || [] };
  } else if (type === 'Margin Leak Report') {
    base.preview = `Detected ${context.alerts?.length || 0} leakage alerts.`;
    base.json = { alerts: context.alerts || [] };
    base.csv = 'type,severity,estimatedLeakageAmount\n' + (context.alerts || []).map((a) => `${a.type},${a.severity},${a.estimatedLeakageAmount}`).join('\n');
  } else if (type === 'RFP Analysis Report') {
    base.preview = context.executiveSummary || 'RFP analysis summary preview';
    base.json = context;
  } else {
    base.preview = `${type} ready for preview.`;
    base.json = context;
  }

  return base;
}
