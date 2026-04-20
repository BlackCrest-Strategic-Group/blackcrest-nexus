import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemType: { type: String, enum: ['category', 'supplier', 'opportunity'], required: true },
  itemId: { type: String, required: true },
  label: { type: String, required: true },
  status: { type: String, enum: ['stable', 'watch', 'risk', 'action needed', 'promising'], default: 'watch' },
  notes: { type: String, default: '' }
}, { timestamps: true });

const WatchlistItem = mongoose.models.WatchlistItem || mongoose.model('WatchlistItem', watchlistItemSchema);
export default WatchlistItem;
