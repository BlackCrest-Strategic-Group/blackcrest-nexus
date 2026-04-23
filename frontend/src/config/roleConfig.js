export const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'procurement_specialist', label: 'Procurement Specialist' },
  { value: 'category_manager', label: 'Category Manager' },
  { value: 'sourcing_manager', label: 'Sourcing Manager' },
  { value: 'procurement_director', label: 'Procurement Director' },
  { value: 'executive_leadership', label: 'Executive Leadership' },
  { value: 'compliance_officer', label: 'Compliance Officer' },
  { value: 'system_administrator', label: 'System Administrator' }
];

export function hasPermission(user, permission) {
  return Boolean(user?.permissions?.includes(permission));
}
