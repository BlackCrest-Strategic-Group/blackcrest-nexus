import mongoose from 'mongoose';

const erpUploadSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sourceName: { type: String, default: '' },
  uploadType: { type: String, default: 'generic' },
  mappedColumns: { type: mongoose.Schema.Types.Mixed, default: {} },
  unmappedColumns: { type: [String], default: [] },
  normalizedRows: { type: [mongoose.Schema.Types.Mixed], default: [] },
  summaryMetrics: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

erpUploadSchema.index({ tenantId: 1, createdAt: -1 });

const ErpUpload = mongoose.models.ErpUpload || mongoose.model('ErpUpload', erpUploadSchema);

export default ErpUpload;
