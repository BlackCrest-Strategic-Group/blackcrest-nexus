export const ROLE_GROUPS = {
  viewer: ['viewer'],
  buyer: ['buyer'],
  specialist: ['procurement_specialist'],
  category: ['category_manager'],
  sourcing: ['sourcing_manager'],
  director: ['procurement_director'],
  executive: ['executive_leadership'],
  compliance: ['compliance_officer'],
  admin: ['system_administrator']
};

export const ROLE_CATALOG = {
  viewer: { label: 'Viewer', group: 'viewer' },
  buyer: { label: 'Buyer', group: 'buyer' },
  procurement_specialist: { label: 'Procurement Specialist', group: 'specialist' },
  category_manager: { label: 'Category Manager', group: 'category' },
  sourcing_manager: { label: 'Sourcing Manager', group: 'sourcing' },
  procurement_director: { label: 'Procurement Director', group: 'director' },
  executive_leadership: { label: 'Executive Leadership', group: 'executive' },
  compliance_officer: { label: 'Compliance Officer', group: 'compliance' },
  system_administrator: { label: 'System Administrator', group: 'admin' }
};

const LEGACY_ROLE_ALIASES = {
  ceo: 'executive_leadership',
  coo: 'executive_leadership',
  cfo: 'executive_leadership',
  cpo: 'executive_leadership',
  director_procurement: 'procurement_director',
  director_operations: 'procurement_director',
  director_strategic_sourcing: 'sourcing_manager',
  director_supply_chain: 'procurement_director',
  procurement_manager: 'procurement_specialist',
  commodity_manager: 'category_manager',
  junior_buyer: 'buyer',
  procurement_analyst: 'procurement_specialist',
  procurement_coordinator: 'procurement_specialist',
  platform_owner: 'system_administrator'
};

export const ROLE_PERMISSIONS = {
  viewer: ['dashboard:view', 'recommendations:view'],
  buyer: ['dashboard:view', 'recommendations:view', 'recommendations:approve', 'supplier_risk:view'],
  specialist: ['dashboard:view', 'recommendations:view', 'recommendations:approve', 'override:request', 'escalation:request', 'export:limited', 'supplier_risk:view'],
  category: ['dashboard:view', 'recommendations:view', 'recommendations:approve', 'override:execute', 'escalation:request', 'export:full', 'supplier_risk:view', 'governance:reporting:view'],
  sourcing: ['dashboard:view', 'recommendations:view', 'recommendations:approve', 'override:execute', 'escalation:execute', 'export:full', 'supplier_risk:view', 'governance:dashboard:view'],
  director: ['dashboard:view', 'recommendations:view', 'recommendations:approve', 'override:execute', 'escalation:execute', 'export:full', 'supplier_risk:view', 'governance:dashboard:view', 'governance:reporting:view'],
  executive: ['dashboard:view', 'recommendations:view', 'recommendations:approve', 'override:execute', 'escalation:execute', 'export:full', 'supplier_risk:view', 'governance:dashboard:view', 'governance:reporting:view', 'executive:approval'],
  compliance: ['dashboard:view', 'recommendations:view', 'recommendations:approve', 'override:execute', 'escalation:execute', 'supplier_risk:view', 'governance:dashboard:view', 'governance:reporting:view', 'compliance:review', 'audit_logs:view'],
  admin: ['dashboard:view', 'recommendations:view', 'recommendations:approve', 'override:execute', 'escalation:execute', 'export:full', 'supplier_risk:view', 'governance:dashboard:view', 'governance:reporting:view', 'audit_logs:view', 'admin:routes']
};

export const ROLE_NAVIGATION = {
  viewer: [{ label: 'Dashboard', path: '/dashboard', permission: 'dashboard:view' }],
  buyer: [{ label: 'Dashboard', path: '/dashboard', permission: 'dashboard:view' }, { label: 'Opportunities', path: '/opportunities', permission: 'recommendations:view' }],
  specialist: [{ label: 'Dashboard', path: '/dashboard', permission: 'dashboard:view' }, { label: 'Intelligence', path: '/intelligence', permission: 'recommendations:view' }, { label: 'Suppliers', path: '/suppliers', permission: 'supplier_risk:view' }],
  category: [{ label: 'Dashboard', path: '/dashboard', permission: 'dashboard:view' }, { label: 'Analytics', path: '/analytics', permission: 'governance:reporting:view' }],
  sourcing: [{ label: 'Dashboard', path: '/dashboard', permission: 'dashboard:view' }, { label: 'Intelligence', path: '/intelligence', permission: 'recommendations:view' }, { label: 'Governance', path: '/governance', permission: 'governance:dashboard:view' }],
  director: [{ label: 'Dashboard', path: '/dashboard', permission: 'dashboard:view' }, { label: 'Suppliers', path: '/suppliers', permission: 'supplier_risk:view' }, { label: 'Governance', path: '/governance', permission: 'governance:dashboard:view' }],
  executive: [{ label: 'Executive Dashboard', path: '/dashboard', permission: 'dashboard:view' }, { label: 'Governance', path: '/governance', permission: 'governance:dashboard:view' }],
  compliance: [{ label: 'Compliance', path: '/analytics', permission: 'compliance:review' }, { label: 'Governance', path: '/governance', permission: 'governance:dashboard:view' }],
  admin: [
    { label: 'Dashboard', path: '/dashboard', permission: 'dashboard:view' },
    { label: 'Intelligence', path: '/intelligence', permission: 'recommendations:view' },
    { label: 'Opportunities', path: '/opportunities', permission: 'recommendations:view' },
    { label: 'Suppliers', path: '/suppliers', permission: 'supplier_risk:view' },
    { label: 'Analytics', path: '/analytics', permission: 'governance:reporting:view' },
    { label: 'Governance', path: '/governance', permission: 'governance:dashboard:view' },
    { label: 'Report Center', path: '/report-center', permission: 'dashboard:view' },
    { label: 'ERP Connector Center', path: '/erp-connector-center', permission: 'dashboard:view' },
    { label: 'Blanket PO Builder', path: '/blanket-po-builder', permission: 'supplier_risk:view' },
    { label: 'Settings', path: '/settings', permission: 'admin:routes' }
  ]
};

function normalizeRole(role = 'buyer') {
  if (ROLE_CATALOG[role]) return role;
  return LEGACY_ROLE_ALIASES[role] || 'buyer';
}

export function getRoleMeta(role = 'buyer') {
  const normalizedRole = normalizeRole(role);
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
