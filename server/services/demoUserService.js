import User from '../models/User.js';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Blackcrest!2026';

const DEMO_USERS = [
  { email: 'viewer.demo@blackcrest.local', name: 'Avery Viewer', role: 'viewer', company: 'BlackCrest Holdings' },
  { email: 'buyer.demo@blackcrest.local', name: 'Riley Buyer', role: 'buyer', company: 'BlackCrest Operations' },
  { email: 'specialist.demo@blackcrest.local', name: 'Jordan Specialist', role: 'procurement_specialist', company: 'BlackCrest Procurement' },
  { email: 'director.demo@blackcrest.local', name: 'Taylor Director', role: 'procurement_director', company: 'BlackCrest Procurement' },
  { email: 'compliance.demo@blackcrest.local', name: 'Casey Compliance', role: 'compliance_officer', company: 'BlackCrest Governance' },
  { email: 'admin.demo@blackcrest.local', name: 'Morgan Admin', role: 'system_administrator', company: 'BlackCrest Platform' }
];

export async function seedRoleDemoUsers() {
  await Promise.all(
    DEMO_USERS.map(async (user) => {
      const existing = await User.findOne({ email: user.email });
      if (existing) return;
      await User.create({ ...user, password: DEMO_PASSWORD, marketType: 'mixed' });
    })
  );
}
