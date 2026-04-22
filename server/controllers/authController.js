import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserPreferences from '../models/UserPreferences.js';
import { seedDemoData } from '../services/seedService.js';
import { getRoleMeta, ROLE_CATALOG } from '../config/rbac.js';

function sign(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

function toSafeUser(userDoc) {
  if (!userDoc) return null;
  const user = typeof userDoc.toObject === 'function' ? userDoc.toObject() : userDoc;
  const { password, __v, ...safeUser } = user;
  return { ...safeUser, ...getRoleMeta(safeUser.role) };
}

export async function register(req, res) {
  const { email, password, name, company, role, procurementFocus, categoriesOfInterest, marketType } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Account already exists' });

  const normalizedRole = ROLE_CATALOG[role] ? role : 'buyer';
  const user = await User.create({
    email,
    password,
    name,
    company,
    role: normalizedRole,
    procurementFocus,
    categoriesOfInterest: Array.isArray(categoriesOfInterest) ? categoriesOfInterest : [],
    marketType: marketType || 'mixed'
  });

  await UserPreferences.create({ userId: user._id, dashboardFocus: user.categoriesOfInterest });
  await seedDemoData(user._id, normalizedRole);
  return res.status(201).json({ token: sign(user._id), user: toSafeUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  await seedDemoData(user._id, user.role);
  return res.json({ token: sign(user._id), user: toSafeUser(user) });
}

export async function profile(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, user: toSafeUser(user) });
}

export async function updateProfile(req, res) {
  const allowed = ['name', 'company', 'procurementFocus', 'categoriesOfInterest', 'marketType'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, user: toSafeUser(user) });
}

export async function logout(_req, res) {
  return res.json({ success: true, message: 'Logged out' });
}

export function getRoles(_req, res) {
  return res.json({ roles: Object.entries(ROLE_CATALOG).map(([key, value]) => ({ key, label: value.label, group: value.group })) });
}
