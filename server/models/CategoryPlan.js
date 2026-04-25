import mongoose from 'mongoose';

const categoryPlanSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  categoryName: { type: String, required: true },
  manager: { type: String, default: '' },
  annualBudget: { type: Number, default: 0 },
  targetSavingsPct: { type: Number, default: 0 },
  strategy: { type: String, default: '' },
  priority: { type: String, default: 'medium' }
}, { timestamps: true });

categoryPlanSchema.index({ tenantId: 1, categoryName: 1, createdAt: -1 });

const CategoryPlan = mongoose.models.CategoryPlan || mongoose.model('CategoryPlan', categoryPlanSchema);

export default CategoryPlan;
