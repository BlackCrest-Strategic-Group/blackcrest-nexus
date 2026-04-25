export const PLAN_CATALOG = {
  starter: {
    key: 'starter',
    label: 'Starter',
    monthlyPriceUsd: Number(process.env.PLAN_STARTER_PRICE_USD || 499),
    annualPriceUsd: Number(process.env.PLAN_STARTER_ANNUAL_USD || 4990),
    seatLimit: Number(process.env.PLAN_STARTER_SEAT_LIMIT || 5),
    features: [
      'Single tenant workspace',
      'Core dashboard and opportunity intelligence',
      'Seat-gated collaboration for small teams',
      'Standard support'
    ]
  },
  growth: {
    key: 'growth',
    label: 'Growth',
    monthlyPriceUsd: Number(process.env.PLAN_GROWTH_PRICE_USD || 1499),
    annualPriceUsd: Number(process.env.PLAN_GROWTH_ANNUAL_USD || 14990),
    seatLimit: Number(process.env.PLAN_GROWTH_SEAT_LIMIT || 20),
    features: [
      'Everything in Starter',
      'Watchlist and governance workflows',
      'Expanded report center usage',
      'Priority support'
    ]
  },
  enterprise: {
    key: 'enterprise',
    label: 'Enterprise',
    monthlyPriceUsd: Number(process.env.PLAN_ENTERPRISE_PRICE_USD || 3999),
    annualPriceUsd: Number(process.env.PLAN_ENTERPRISE_ANNUAL_USD || 39990),
    seatLimit: Number(process.env.PLAN_ENTERPRISE_SEAT_LIMIT || 100),
    features: [
      'Everything in Growth',
      'Enterprise deployment support',
      'Advanced governance visibility',
      'Dedicated success and onboarding'
    ]
  }
};

export function getPlanCatalogArray() {
  return Object.values(PLAN_CATALOG);
}
