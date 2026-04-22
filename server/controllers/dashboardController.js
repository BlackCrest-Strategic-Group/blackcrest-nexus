import CategorySnapshot from '../models/CategorySnapshot.js';
import SupplierProfile from '../models/SupplierProfile.js';
import SupplierAnalysis from '../models/SupplierAnalysis.js';
import OpportunityAnalysis from '../models/OpportunityAnalysis.js';
import WatchlistItem from '../models/WatchlistItem.js';
import ActionItem from '../models/ActionItem.js';
import UserPreferences from '../models/UserPreferences.js';

function roleContentByGroup(group, totals) {
  const shared = {
    kpis: [
      { label: 'Open Workflows', value: String(totals.actions || 0) },
      { label: 'Supplier Signals', value: String(totals.suppliers || 0) },
      { label: 'Active Opportunities', value: String(totals.opportunities || 0) },
      { label: 'Category Risk Nodes', value: String(totals.categories || 0) }
    ],
    workflows: [
      { name: 'RFQ Creation', status: 'in_progress' },
      { name: 'Supplier Evaluation', status: 'queued' },
      { name: 'Contract Tracking', status: 'active' }
    ]
  };

  if (group === 'executive') {
    return {
      dashboardTitle: 'Executive Procurement Command Center',
      briefing: 'Financial exposure remains elevated in two categories. Recommended action: diversify suppliers and accelerate renewal planning.',
      alerts: ['Margin exposure increased by 2.1%.', 'Supplier dependency threshold exceeded in semiconductor category.', 'Sourcing disruption risk detected for APAC route.'],
      intelligence: ['Procurement health score: 83/100', 'Enterprise pipeline: 14 strategic pursuits', 'Forecasted EBIT protection: $3.2M'],
      ...shared
    };
  }

  if (group === 'director') {
    return {
      dashboardTitle: 'Director Operations Intelligence',
      briefing: 'Team throughput improved this week, but compliance cycle time slipped in two business units.',
      alerts: ['KPI deviation in PO cycle time (+8%).', 'Three contract renewals require leadership escalation.', 'Compliance warning triggered for missing supplier attestations.'],
      intelligence: ['Sourcing performance index: 78', 'Operational bottlenecks: 5 active', 'Team productivity trend: +6.4%'],
      ...shared
    };
  }

  if (group === 'manager') {
    return {
      dashboardTitle: 'Manager Sourcing Workbench',
      briefing: 'Two category events are ready for negotiation. Savings opportunity identified in packaging and IT peripherals.',
      alerts: ['RFQ-229 response window closes in 18 hours.', 'Supplier risk moved to high for Delta Logistics.', 'Negotiation variance exceeds target by 3.7%.'],
      intelligence: ['Commodity movement index: +1.3%', 'Sourcing events in flight: 9', 'Modeled savings pipeline: $1.1M'],
      ...shared
    };
  }

  if (group === 'admin') {
    return {
      dashboardTitle: 'Platform Administration Command Center',
      briefing: 'Sentinel monitors are healthy. One API dependency is degraded and requires remediation tracking.',
      alerts: ['Audit log volume spike detected.', 'Two stale user sessions auto-terminated.', 'External integration latency above SLA threshold.'],
      intelligence: ['Users online: 42', 'API availability: 99.4%', 'Sentinel monitors active: 12'],
      ...shared
    };
  }

  return {
    dashboardTitle: 'Buyer Execution Workspace',
    briefing: 'Focus on expediting delayed POs and clearing pending approvals before 3:00 PM cut-off.',
    alerts: ['5 overdue procurement actions.', '2 purchase orders delayed in transit.', '4 approvals pending manager sign-off.'],
    intelligence: ['Daily tasks due: 11', 'Supplier updates pending: 3', 'Expediting alerts: 2'],
    ...shared
  };
}

export async function getDashboard(req, res) {
  const [categories, suppliers, supplierInsights, opportunities, watchlist, actions, preferences] = await Promise.all([
    CategorySnapshot.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(4),
    SupplierProfile.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(4),
    SupplierAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(4),
    OpportunityAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(4),
    WatchlistItem.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(6),
    ActionItem.find({ userId: req.user._id, status: 'open' }).sort({ priority: -1, createdAt: -1 }).limit(6),
    UserPreferences.findOne({ userId: req.user._id })
  ]);

  const roleDashboard = roleContentByGroup(req.user.roleGroup, {
    categories: categories.length,
    suppliers: suppliers.length,
    opportunities: opportunities.length,
    actions: actions.length
  });

  return res.json({
    platform: 'BlackCrest ProcurementOS',
    role: {
      id: req.user.role,
      label: req.user.roleLabel,
      group: req.user.roleGroup,
      permissions: req.user.permissions,
      navigation: req.user.navigation
    },
    personalization: {
      name: req.user.name,
      company: req.user.company,
      procurementFocus: req.user.procurementFocus,
      categoriesOfInterest: req.user.categoriesOfInterest,
      marketType: req.user.marketType,
      moduleOrder: preferences?.moduleOrder || []
    },
    roleDashboard,
    sentinel: {
      monitoringStatus: 'active',
      anomalyDetection: 'enabled',
      escalationWorkflows: ['supplier_dependency', 'rfq_deadline', 'compliance_breach']
    },
    widgets: {
      highPriorityActions: actions,
      suppliersToReview: suppliers,
      categoryRisks: categories,
      opportunitiesWorthPursuing: opportunities,
      supplierInsights,
      watchlist
    },
    disclaimer: 'Designed for Non-Classified Use Only'
  });
}
