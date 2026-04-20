import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserPreferences from '../models/UserPreferences.js';
import { seedDemoData } from '../services/seedService.js';

function sign(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

export async function register(req, res) {
  const { email, password, name, company, role, procurementFocus, categoriesOfInterest, marketType } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Account already exists' });

  const user = await User.create({
    email,
    password,
    name,
    company,
    role,
    procurementFocus,
    categoriesOfInterest: Array.isArray(categoriesOfInterest) ? categoriesOfInterest : [],
    marketType: marketType || 'mixed'
  });

  await UserPreferences.create({ userId: user._id, dashboardFocus: user.categoriesOfInterest });
  await seedDemoData(user._id);
  return res.status(201).json({ token: sign(user._id), user });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  await seedDemoData(user._id);
  return res.json({ token: sign(user._id), user });
}
