import mongoose from 'mongoose';

const marketplaceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.MarketplaceCategory || mongoose.model('MarketplaceCategory', marketplaceCategorySchema);
