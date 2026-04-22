import User from '../models/User.js';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Blackcrest!2026';

const DEMO_USERS = [
  { email: 'ceo.demo@blackcrest.local', name: 'Avery CEO', role: 'ceo', company: 'BlackCrest Holdings' },
  { email: 'director.demo@blackcrest.local', name: 'Jordan Director', role: 'director_procurement', company: 'BlackCrest Procurement' },
  { email: 'manager.demo@blackcrest.local', name: 'Taylor Category', role: 'category_manager', company: 'BlackCrest Procurement' },
  { email: 'buyer.demo@blackcrest.local', name: 'Riley Buyer', role: 'buyer', company: 'BlackCrest Operations' },
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
