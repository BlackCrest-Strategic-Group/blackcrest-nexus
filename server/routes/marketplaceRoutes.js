import { Router } from 'express';
import nodemailer from 'nodemailer';
import MarketplaceCategory from '../models/MarketplaceCategory.js';
import MarketplaceSupplier from '../models/MarketplaceSupplier.js';
import MarketplaceRequest from '../models/MarketplaceRequest.js';
import { authRequired, permissionRequired } from '../middleware/auth.js';

const router = Router();

const defaultCategories = [
  'Paper & Packaging',
  'Industrial Supplies',
  'Fasteners',
  'Raw Materials'
];

function slugify(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function ensureCategories() {
  for (const name of defaultCategories) {
    await MarketplaceCategory.updateOne({ slug: slugify(name) }, { $setOnInsert: { name, slug: slugify(name) } }, { upsert: true });
  }
}

router.get('/categories', authRequired, async (_req, res) => {
  await ensureCategories();
  const categories = await MarketplaceCategory.find().sort({ name: 1 }).lean();
  res.json(categories);
});

router.get('/suppliers', authRequired, async (req, res) => {
  const { category, location, q } = req.query;
  const query = {};
  if (category) {
    const normalized = String(category).toLowerCase();
    const mapped = defaultCategories.find((name) => slugify(name) === normalized) || category;
    query.category = mapped;
  }
  if (location) query['location.city'] = new RegExp(location, 'i');
  if (q) query.$text = { $search: q };

  const suppliers = await MarketplaceSupplier.find(query).sort({ isVerified: -1, createdAt: -1 }).lean();
  res.json(suppliers);
});

router.get('/suppliers/:id', authRequired, async (req, res) => {
  const supplier = await MarketplaceSupplier.findById(req.params.id).lean();
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  return res.json(supplier);
});

router.post('/suppliers', authRequired, permissionRequired('admin:manage_users'), async (req, res) => {
  const supplier = await MarketplaceSupplier.create(req.body);
  res.status(201).json(supplier);
});

router.post('/request', authRequired, async (req, res) => {
  const request = await MarketplaceRequest.create(req.body);
  try {
    const transport = nodemailer.createTransport({ jsonTransport: true });
    await transport.sendMail({
      to: process.env.MARKETPLACE_ALERT_EMAIL || 'ops@blackcrestai.com',
      from: process.env.MARKETPLACE_FROM_EMAIL || 'noreply@blackcrestai.com',
      subject: `New marketplace request: ${request.productNeeded}`,
      text: `New request from ${request.email} for ${request.productNeeded}, quantity ${request.quantity}, location ${request.location}, urgency ${request.urgency}.`
    });
  } catch (_error) {
    // Non-blocking placeholder email transport.
  }
  res.status(201).json({ message: 'Request submitted successfully', requestId: request._id });
});

export default router;
