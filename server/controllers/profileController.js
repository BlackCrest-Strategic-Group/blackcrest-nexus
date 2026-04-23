import User from '../models/User.js';
import UserPreferences from '../models/UserPreferences.js';
import CategorySnapshot from '../models/CategorySnapshot.js';
import SupplierAnalysis from '../models/SupplierAnalysis.js';
import OpportunityAnalysis from '../models/OpportunityAnalysis.js';

export async function getProfile(req, res) {
  const preferences = await UserPreferences.findOne({ userId: req.user._id, tenantId: req.user.tenantId });
  return res.json({ user: req.user, preferences });
}

export async function updatePreferences(req, res) {
  const preferences = await UserPreferences.findOneAndUpdate(
    { userId: req.user._id, tenantId: req.user.tenantId },
    { ...req.body, tenantId: req.user.tenantId },
    { upsert: true, new: true }
  );
  return res.json(preferences);
}

export async function updateUser(req, res) {
  const allowed = ['name', 'company', 'role', 'procurementFocus', 'categoriesOfInterest', 'marketType'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
  return res.json(user);
}

export async function getHistory(req, res) {
  const [categories, supplierAnalyses, opportunities] = await Promise.all([
    CategorySnapshot.find({ userId: req.user._id, tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(50),
    SupplierAnalysis.find({ userId: req.user._id, tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(50).populate('supplierId'),
    OpportunityAnalysis.find({ userId: req.user._id, tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(50)
  ]);
  return res.json({ categories, supplierAnalyses, opportunities });
}
