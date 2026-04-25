import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import { getPlanCatalogArray, PLAN_CATALOG } from '../config/pricingCatalog.js';

function monthWindow(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function round(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export async function getCommercialProofSnapshot({ now = new Date() } = {}) {
  const plans = getPlanCatalogArray();
  const activeStatuses = ['active', 'trialing'];
  const periodStart = monthWindow(now);
  const priorPeriodStart = new Date(periodStart);
  priorPeriodStart.setMonth(priorPeriodStart.getMonth() - 1);

  const tenants = await Tenant.find({}).select('plan subscriptionStatus seats trialEndsAt updatedAt createdAt').lean();
  const activeTenants = tenants.filter((tenant) => activeStatuses.includes(tenant.subscriptionStatus));
  const planCounts = plans.reduce((acc, plan) => ({ ...acc, [plan.key]: 0 }), {});

  let mrr = 0;
  for (const tenant of activeTenants) {
    const plan = PLAN_CATALOG[tenant.plan] || PLAN_CATALOG.starter;
    planCounts[plan.key] = (planCounts[plan.key] || 0) + 1;
    mrr += plan.monthlyPriceUsd;
  }

  const arr = mrr * 12;
  const canceledThisMonth = tenants.filter((tenant) => tenant.subscriptionStatus === 'canceled' && new Date(tenant.updatedAt) >= periodStart).length;
  const canceledLastMonth = tenants.filter((tenant) => tenant.subscriptionStatus === 'canceled' && new Date(tenant.updatedAt) >= priorPeriodStart && new Date(tenant.updatedAt) < periodStart).length;
  const openingTenantBase = Math.max(1, tenants.filter((tenant) => new Date(tenant.createdAt) < periodStart).length);
  const churnRatePct = round((canceledThisMonth / openingTenantBase) * 100);

  const topConcentration = activeTenants
    .map((tenant) => ({
      tenantId: tenant._id,
      plan: tenant.plan,
      estimatedMonthlyRevenueUsd: (PLAN_CATALOG[tenant.plan] || PLAN_CATALOG.starter).monthlyPriceUsd
    }))
    .sort((a, b) => b.estimatedMonthlyRevenueUsd - a.estimatedMonthlyRevenueUsd)
    .slice(0, 5);

  const totalUsers = await User.countDocuments({});

  return {
    generatedAt: now.toISOString(),
    metrics: {
      mrrUsd: round(mrr),
      arrUsd: round(arr),
      churnRatePct,
      activeTenantCount: activeTenants.length,
      canceledThisMonth,
      canceledLastMonth,
      totalUserCount: totalUsers
    },
    planMix: planCounts,
    concentration: {
      method: 'Plan-weighted tenant concentration using configured plan pricing.',
      topAccounts: topConcentration,
      concentrationNotes: [
        'Attach customer names and contracted ACV in investor data room if available.',
        'Replace modeled plan pricing with invoiced MRR for diligence-grade metrics.'
      ]
    },
    pipelineTemplate: {
      requiredFields: ['accountName', 'stage', 'owner', 'expectedCloseDate', 'expectedACVUsd', 'probabilityPct'],
      recommendation: 'Store pipeline rows in CRM and export weekly into docs/INVESTOR_DATA_ROOM.md.'
    },
    plans
  };
}
