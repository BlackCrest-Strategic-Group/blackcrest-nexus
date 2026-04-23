import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  moduleOrder: {
    type: [String],
    default: ['dashboard', 'category-intelligence', 'supplier-intelligence', 'opportunity-intelligence', 'watchlist']
  },
  dashboardFocus: { type: [String], default: [] },
  personalizedNotes: { type: String, default: '' }
}, { timestamps: true });

const UserPreferences = mongoose.models.UserPreferences || mongoose.model('UserPreferences', userPreferencesSchema);
export default UserPreferences;
