import CategorySnapshot from '../models/CategorySnapshot.js';
import { buildCategoryOutput } from '../services/analysisService.js';

export async function analyzeCategory(req, res) {
  const { categoryName, product, notes, geography } = req.body;
  const output = buildCategoryOutput({ categoryName, product, geography });
  const assumptions = req.body?.assumptions || [];
  return res.json({
    input: { categoryName, product, notes: notes || '', geography: geography || '', assumptions },
    output,
    privacy: 'Raw inputs are processed statelessly and not stored unless you click Save.'
  });
}

export async function saveCategorySnapshot(_req, res) {
  return res.json({
    success: true,
    demoMode: true,
    message: 'Saved in demo session only.'
  });
}

export async function listCategorySnapshots(_req, res) {
  return res.json({ history: [] });
}

export async function deleteCategorySnapshot(_req, res) {
  return res.json({ success: true });
}
