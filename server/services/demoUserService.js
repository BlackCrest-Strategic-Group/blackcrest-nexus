import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Blackcrest!2026';

const DEMO_USERS = [
  { email: 'demo@blackcrest.ai', name: 'BlackCrest Demo Admin', role: 'system_administrator', company: 'BlackCrest Demo Workspace' },
  { email: 'viewer.demo@blackcrest.local', name: 'Avery Viewer', role: 'viewer', company: 'BlackCrest Holdings' },
  { email: 'buyer.demo@blackcrest.local', name: 'Riley Buyer', role: 'buyer', company: 'BlackCrest Operations' },
  { email: 'specialist.demo@blackcrest.local', name: 'Jordan Specialist', role: 'procurement_specialist', company: 'BlackCrest Procurement' },
  { email: 'director.demo@blackcrest.local', name: 'Taylor Director', role: 'procurement_director', company: 'BlackCrest Procurement' },
  { email: 'compliance.demo@blackcrest.local', name: 'Casey Compliance', role: 'compliance_officer', company: 'BlackCrest Governance' },
  { email: 'admin.demo@blackcrest.local', name: 'Morgan Admin', role: 'system_administrator', company: 'BlackCrest Platform' }
];

function toDemoSlug(email = '') {
  return `demo-${email.split('@')[0].replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`.replace(/-+/g, '-');
}

async function ensureDemoTenant(user) {
  const tenantName = user.company || 'BlackCrest Demo Workspace';
  const slug = toDemoSlug(user.email);

  const update = {
    name: tenantName,
    subscriptionStatus: 'trialing',
    plan: 'enterprise',
    seats: 10
  };

  if (user.tenantId) {
    const tenant = await Tenant.findById(user.tenantId);
    if (tenant) {
      tenant.name = tenantName;
      tenant.subscriptionStatus = 'trialing';
      tenant.plan = 'enterprise';
      tenant.seats = Math.max(Number(tenant.seats || 0), 10);
      await tenant.save();
      return tenant;
    }
  }

  return Tenant.findOneAndUpdate(
    { slug },
    {
      $set: update,
      $max: { seats: 10 },
      $setOnInsert: { slug }
    },
    { new: true, upsert: true }
  );
}

export async function seedRoleDemoUsers() {
  await Promise.all(
    DEMO_USERS.map(async (user) => {
      const existing = await User.findOne({ email: user.email });
      const tenant = await ensureDemoTenant(user);

      if (!existing) {
        await User.create({
          ...user,
          password: DEMO_PASSWORD,
          marketType: 'mixed',
          tenantId: tenant._id,
          isTenantAdmin: true
        });
        return;
      }

      existing.name = user.name;
      existing.company = user.company;
      existing.role = user.role;
      existing.password = DEMO_PASSWORD;
      existing.marketType = existing.marketType || 'mixed';
      existing.tenantId = tenant._id;
      existing.isTenantAdmin = true;
      await existing.save();
    })
  );
}
