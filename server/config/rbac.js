export const ROLE_GROUPS = {
  executive: ['ceo', 'coo', 'cfo', 'cpo'],
  director: ['director_procurement', 'director_operations', 'director_strategic_sourcing', 'director_supply_chain'],
  manager: ['procurement_manager', 'sourcing_manager', 'category_manager', 'commodity_manager'],
  operational: ['buyer', 'junior_buyer', 'procurement_analyst', 'procurement_coordinator'],
  admin: ['system_administrator', 'platform_owner']
};

export const ROLE_CATALOG = {
  ceo: { label: 'CEO', group: 'executive' },
  coo: { label: 'COO', group: 'executive' },
  cfo: { label: 'CFO', group: 'executive' },
  cpo: { label: 'CPO', group: 'executive' },
  director_procurement: { label: 'Director of Procurement', group: 'director' },
  director_operations: { label: 'Director of Operations', group: 'director' },
  director_strategic_sourcing: { label: 'Strategic Sourcing Director', group: 'director' },
  director_supply_chain: { label: 'Supply Chain Director', group: 'director' },
  procurement_manager: { label: 'Procurement Manager', group: 'manager' },
  sourcing_manager: { label: 'Sourcing Manager', group: 'manager' },
  category_manager: { label: 'Category Manager', group: 'manager' },
  commodity_manager: { label: 'Commodity Manager', group: 'manager' },
  buyer: { label: 'Buyer', group: 'operational' },
  junior_buyer: { label: 'Junior Buyer', group: 'operational' },
  procurement_analyst: { label: 'Procurement Analyst', group: 'operational' },
  procurement_coordinator: { label: 'Procurement Coordinator', group: 'operational' },
  system_administrator: { label: 'System Administrator', group: 'admin' },
  platform_owner: { label: 'Platform Owner', group: 'admin' }
};

export const ROLE_PERMISSIONS = {
  executive: ['dashboard:view', 'briefings:view', 'alerts:view', 'kpis:view', 'forecasting:view', 'financial_exposure:view'],
  director: ['dashboard:view', 'briefings:view', 'alerts:view', 'kpis:view', 'ops_visibility:view', 'compliance:view', 'team_performance:view'],
  manager: ['dashboard:view', 'briefings:view', 'alerts:view', 'rfq:manage', 'suppliers:view', 'category_intelligence:view', 'workflows:manage'],
  operational: ['dashboard:view', 'tasks:view', 'purchase_orders:view', 'approvals:execute', 'workflows:execute', 'alerts:view'],
  admin: ['dashboard:view', 'users:manage', 'roles:assign', 'audit_logs:view', 'api_status:view', 'system:monitor']
};

export const ROLE_NAVIGATION = {
  executive: [
    { label: 'Executive Overview', path: '/dashboard', permission: 'dashboard:view' },
    { label: 'Procurement Intelligence', path: '/intelligence', permission: 'kpis:view' },
    { label: 'Financial Exposure', path: '/analytics', permission: 'financial_exposure:view' },
    { label: 'AI Briefings', path: '/opportunities', permission: 'briefings:view' },
    { label: 'Supplier Risk', path: '/suppliers', permission: 'alerts:view' }
  ],
  director: [
    { label: 'Team Performance', path: '/dashboard', permission: 'team_performance:view' },
    { label: 'Procurement Operations', path: '/opportunities', permission: 'ops_visibility:view' },
    { label: 'Compliance', path: '/analytics', permission: 'compliance:view' },
    { label: 'Supplier Performance', path: '/suppliers', permission: 'kpis:view' },
    { label: 'Escalations', path: '/intelligence', permission: 'alerts:view' }
  ],
  manager: [
    { label: 'Category Dashboard', path: '/dashboard', permission: 'dashboard:view' },
    { label: 'RFQs', path: '/opportunities', permission: 'rfq:manage' },
    { label: 'Supplier Analysis', path: '/suppliers', permission: 'suppliers:view' },
    { label: 'Category Intelligence', path: '/analytics', permission: 'category_intelligence:view' },
    { label: 'Negotiation Tracking', path: '/intelligence', permission: 'workflows:manage' }
  ],
  operational: [
    { label: 'Daily Workflow', path: '/dashboard', permission: 'dashboard:view' },
    { label: 'Tasks', path: '/opportunities', permission: 'tasks:view' },
    { label: 'Purchase Orders', path: '/suppliers', permission: 'purchase_orders:view' },
    { label: 'Approvals', path: '/intelligence', permission: 'approvals:execute' }
  ],
  admin: [
    { label: 'Admin Overview', path: '/dashboard', permission: 'dashboard:view' },
    { label: 'User Management', path: '/settings', permission: 'users:manage' },
    { label: 'Sentinel Monitoring', path: '/intelligence', permission: 'system:monitor' },
    { label: 'Audit Logs', path: '/analytics', permission: 'audit_logs:view' }
  ]
};

export function getRoleMeta(role = 'buyer') {
  const normalizedRole = ROLE_CATALOG[role] ? role : 'buyer';
  const group = ROLE_CATALOG[normalizedRole].group;
  return {
    role: normalizedRole,
    roleLabel: ROLE_CATALOG[normalizedRole].label,
    roleGroup: group,
    permissions: ROLE_PERMISSIONS[group] || [],
    navigation: ROLE_NAVIGATION[group] || []
  };
}

export function hasPermission(role, permission) {
  const { permissions } = getRoleMeta(role);
  return permissions.includes(permission);
}
