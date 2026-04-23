import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemType: { type: String, enum: ['category', 'supplier', 'opportunity'], required: true },
  itemId: { type: String, required: true },
  label: { type: String, required: true },
  status: { type: String, enum: ['stable', 'watch', 'risk', 'action needed', 'promising'], default: 'watch' },
  notes: { type: String, default: '' }
}, { timestamps: true });

watchlistItemSchema.index({ tenantId: 1, userId: 1, itemType: 1, itemId: 1 }, { unique: true });

const WatchlistItem = mongoose.models.WatchlistItem || mongoose.model('WatchlistItem', watchlistItemSchema);
export default WatchlistItem;
