import CategorySnapshot from '../models/CategorySnapshot.js';
import SupplierProfile from '../models/SupplierProfile.js';
import SupplierAnalysis from '../models/SupplierAnalysis.js';
import OpportunityAnalysis from '../models/OpportunityAnalysis.js';
import WatchlistItem from '../models/WatchlistItem.js';
import ActionItem from '../models/ActionItem.js';
import UserPreferences from '../models/UserPreferences.js';

export async function getDashboard(req, res) {
  const [categories, suppliers, supplierInsights, opportunities, watchlist, actions, preferences] = await Promise.all([
    CategorySnapshot.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(4),
    SupplierProfile.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(4),
    SupplierAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(4),
    OpportunityAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(4),
    WatchlistItem.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(6),
    ActionItem.find({ userId: req.user._id, status: 'open' }).sort({ priority: -1, createdAt: -1 }).limit(6),
    UserPreferences.findOne({ userId: req.user._id })
  ]);

  return res.json({
    personalization: {
      name: req.user.name,
      company: req.user.company,
      procurementFocus: req.user.procurementFocus,
      categoriesOfInterest: req.user.categoriesOfInterest,
      marketType: req.user.marketType,
      moduleOrder: preferences?.moduleOrder || []
    },
    widgets: {
      highPriorityActions: actions,
      suppliersToReview: suppliers,
      categoryRisks: categories,
      opportunitiesWorthPursuing: opportunities,
      supplierInsights,
      watchlist
    },
    disclaimer: 'Designed for Non-Classified Use Only'
  });
}
