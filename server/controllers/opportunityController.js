import multer from 'multer';
import OpportunityAnalysis from '../models/OpportunityAnalysis.js';
import { buildOpportunityOutput } from '../services/analysisService.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadMemoryPdf = upload.single('file');

export async function analyzeOpportunity(req, res) {
  const title = req.body.title || 'Untitled Opportunity';
  const text = req.body.text || '';
  const fileName = req.file?.originalname || null;
  const inputSize = (text?.length || 0) + (req.file?.size || 0);
  const output = buildOpportunityOutput({ title });
  return res.json({
    title,
    output,
    privacy: {
      notice: 'PDFs are processed in memory only and never stored by default.',
      transientInputSize: inputSize,
      transientFile: fileName
    }
  });
}

export async function saveOpportunity(req, res) {
  const item = await OpportunityAnalysis.create({ userId: req.user._id, ...req.body });
  return res.status(201).json(item);
}

export async function listOpportunities(req, res) {
  const items = await OpportunityAnalysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return res.json(items);
}

export async function deleteOpportunity(req, res) {
  await OpportunityAnalysis.deleteOne({ _id: req.params.id, userId: req.user._id });
  return res.json({ success: true });
}
