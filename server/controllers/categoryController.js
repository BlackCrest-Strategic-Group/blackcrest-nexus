import CategorySnapshot from '../models/CategorySnapshot.js';
import { buildCategoryOutput } from '../services/analysisService.js';

export async function analyzeCategory(req, res) {
  const { categoryName, product, notes, geography } = req.body;
  const output = buildCategoryOutput({ categoryName, product, geography });
  return res.json({
    input: { categoryName, product, notes: notes || '', geography: geography || '' },
    output,
    privacy: 'Raw inputs are processed statelessly and not stored unless you click Save.'
  });
}

export async function saveCategorySnapshot(req, res) {
  const { categoryName, product, notes, geography, output } = req.body;
  const item = await CategorySnapshot.create({ userId: req.user._id, categoryName, product, notes, geography, output });
  return res.status(201).json(item);
}

export async function listCategorySnapshots(req, res) {
  const items = await CategorySnapshot.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return res.json(items);
}

export async function deleteCategorySnapshot(req, res) {
  await CategorySnapshot.deleteOne({ _id: req.params.id, userId: req.user._id });
  return res.json({ success: true });
}
