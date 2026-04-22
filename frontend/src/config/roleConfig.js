export const ROLE_OPTIONS = [
  { value: 'ceo', label: 'CEO' },
  { value: 'coo', label: 'COO' },
  { value: 'cfo', label: 'CFO' },
  { value: 'cpo', label: 'CPO' },
  { value: 'director_procurement', label: 'Director of Procurement' },
  { value: 'director_operations', label: 'Director of Operations' },
  { value: 'director_strategic_sourcing', label: 'Strategic Sourcing Director' },
  { value: 'director_supply_chain', label: 'Supply Chain Director' },
  { value: 'procurement_manager', label: 'Procurement Manager' },
  { value: 'sourcing_manager', label: 'Sourcing Manager' },
  { value: 'category_manager', label: 'Category Manager' },
  { value: 'commodity_manager', label: 'Commodity Manager' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'junior_buyer', label: 'Junior Buyer' },
  { value: 'procurement_analyst', label: 'Procurement Analyst' },
  { value: 'procurement_coordinator', label: 'Procurement Coordinator' },
  { value: 'system_administrator', label: 'System Administrator' },
  { value: 'platform_owner', label: 'Platform Owner' }
];

export function hasPermission(user, permission) {
  return Boolean(user?.permissions?.includes(permission));
}
