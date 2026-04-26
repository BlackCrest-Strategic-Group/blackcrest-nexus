const ROLE_PRIORITIES = {
  buyer: ['shortages', 'po_follow_up', 'urgent_risk', 'supplier_action'],
  manager: ['supplier_trend', 'workload', 'bottleneck', 'operational_flow'],
  director: ['savings', 'category_exposure', 'sourcing_effectiveness', 'supplier_concentration'],
  executive: ['margin_exposure', 'operational_health', 'risk_posture', 'forecast_disruption'],
  admin: ['governance', 'audit', 'security', 'platform_health']
};

export function filterIntelligenceByRole(intelligence = [], roleGroup = 'buyer') {
  const priorities = ROLE_PRIORITIES[roleGroup] || ROLE_PRIORITIES.buyer;
  return intelligence.filter((item) => item.tags?.some((tag) => priorities.includes(tag) || tag === 'shared'));
}

export function prioritiesForRole(roleGroup = 'buyer') {
  return ROLE_PRIORITIES[roleGroup] || ROLE_PRIORITIES.buyer;
}
