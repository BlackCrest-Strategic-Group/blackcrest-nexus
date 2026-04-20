import SupplierProfile from '../models/SupplierProfile.js';
import SupplierAnalysis from '../models/SupplierAnalysis.js';
import { buildSupplierOutput } from '../services/analysisService.js';

export async function createSupplier(req, res) {
  const payload = { ...req.body, userId: req.user._id };
  const supplier = await SupplierProfile.create(payload);
  return res.status(201).json(supplier);
}

export async function listSuppliers(req, res) {
  const q = req.query.q || '';
  const filter = { userId: req.user._id };
  if (q) filter.name = { $regex: q, $options: 'i' };
  const suppliers = await SupplierProfile.find(filter).sort({ updatedAt: -1 });
  return res.json(suppliers);
}

export async function getSupplier(req, res) {
  const supplier = await SupplierProfile.findOne({ _id: req.params.id, userId: req.user._id });
  if (!supplier) return res.status(404).json({ message: 'Not found' });
  return res.json(supplier);
}

export async function analyzeSupplier(req, res) {
  const supplier = await SupplierProfile.findOne({ _id: req.params.id, userId: req.user._id });
  if (!supplier) return res.status(404).json({ message: 'Not found' });
  const output = buildSupplierOutput({ supplier, ...req.body });
  return res.json({ supplier, output });
}

export async function saveSupplierAnalysis(req, res) {
  const analysis = await SupplierAnalysis.create({ userId: req.user._id, ...req.body });
  return res.status(201).json(analysis);
}

export async function compareSuppliers(req, res) {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const suppliers = await SupplierProfile.find({ _id: { $in: ids }, userId: req.user._id });
  const comparison = suppliers.map((s) => ({ id: s._id, name: s.name, relationshipScore: s.relationshipScore, riskCount: s.risks.length, capabilityCount: s.capabilities.length }));
  return res.json(comparison);
}

export async function deleteSupplier(req, res) {
  await SupplierProfile.deleteOne({ _id: req.params.id, userId: req.user._id });
  await SupplierAnalysis.deleteMany({ supplierId: req.params.id, userId: req.user._id });
  return res.json({ success: true });
}
