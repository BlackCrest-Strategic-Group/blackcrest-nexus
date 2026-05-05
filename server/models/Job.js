import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['queued', 'processing', 'done'], default: 'queued' },
    input: { type: String, default: '' },
    result: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Job', jobSchema);
