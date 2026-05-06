export const roleAccess = {
  Admin: ['*'],
  Executive: ['dashboard', 'modules', 'proposals', 'exports'],
  Buyer: ['dashboard', 'modules', 'proposals'],
  Supplier: ['dashboard', 'messages'],
  Auditor: ['dashboard', 'audit', 'exports']
};

export function canAccess(role, area) {
  const grants = roleAccess[role] || [];
  return grants.includes('*') || grants.includes(area);
}
