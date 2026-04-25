import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import UserPreferences from '../models/UserPreferences.js';
import Tenant from '../models/Tenant.js';
import { seedDemoData } from '../services/seedService.js';
import { getRoleMeta, ROLE_CATALOG } from '../config/rbac.js';
import Stripe from 'stripe';

function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET || '';
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('JWT_SECRET is required in production');
  }
  return secret || 'dev-secret';
}

function validatePasswordStrength(password = '') {
  const minLength = password.length >= 10;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return minLength && hasUpper && hasLower && hasNumber;
}

function sign(userId) {
  return jwt.sign({ userId }, resolveJwtSecret(), { expiresIn: '7d' });
}

function toSafeUser(userDoc) {
  if (!userDoc) return null;
  const user = typeof userDoc.toObject === 'function' ? userDoc.toObject() : userDoc;
  const { password, __v, ...safeUser } = user;
  return { ...safeUser, ...getRoleMeta(safeUser.role) };
}

function createTenantSlug(company = '', email = '') {
  const base = (company || email.split('@')[0] || 'tenant')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'tenant';
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

async function createStripeCustomerForTenant({ tenantName, email }) {
  if (!process.env.STRIPE_SECRET_KEY) return { stripeCustomerId: '' };
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const customer = await stripe.customers.create({
      name: tenantName,
      email,
      metadata: { source: 'blackcrest-register' }
    });
    return { stripeCustomerId: customer.id };
  } catch (error) {
    console.warn(`[billing] failed to create stripe customer: ${error.message}`);
    return { stripeCustomerId: '' };
  }
}

export async function register(req, res) {
  const { email, password, name, company, role, procurementFocus, categoriesOfInterest, marketType } = req.body;
  if (!validatePasswordStrength(password)) {
    return res.status(400).json({
      message: 'Weak password. Use at least 10 characters with uppercase, lowercase, and a number.'
    });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Account already exists' });

  const normalizedRole = ROLE_CATALOG[role] ? role : 'buyer';
  const tenantName = company || `${name}'s Workspace`;
  const { stripeCustomerId } = await createStripeCustomerForTenant({ tenantName, email });
  const tenant = await Tenant.create({
    name: tenantName,
    slug: createTenantSlug(company, email),
    stripeCustomerId
  });

  const user = await User.create({
    email,
    password,
    name,
    company,
    tenantId: tenant._id,
    isTenantAdmin: true,
    role: normalizedRole,
    procurementFocus,
    categoriesOfInterest: Array.isArray(categoriesOfInterest) ? categoriesOfInterest : [],
    marketType: marketType || 'mixed'
  });

  await UserPreferences.create({ userId: user._id, tenantId: tenant._id, dashboardFocus: user.categoriesOfInterest });
  await seedDemoData(user._id, tenant._id);
  return res.status(201).json({ token: sign(user._id), user: toSafeUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.tenantId) {
    const tenantName = user.company || `${user.name}'s Workspace`;
    const { stripeCustomerId } = await createStripeCustomerForTenant({ tenantName, email: user.email });
    const tenant = await Tenant.create({
      name: tenantName,
      slug: createTenantSlug(user.company, user.email),
      stripeCustomerId
    });
    user.tenantId = tenant._id;
    user.isTenantAdmin = true;
    await user.save();
  }

  await seedDemoData(user._id, user.tenantId);
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
