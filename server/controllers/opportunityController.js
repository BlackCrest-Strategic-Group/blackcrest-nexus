import multer from 'multer';
import OpportunityAnalysis from '../models/OpportunityAnalysis.js';
import { buildOpportunityOutput } from '../services/analysisService.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadMemoryPdf = upload.single('file');

export async function analyzeOpportunity(req, res) {
  const source = req.body.source || 'user_input';
  if (!['user_input', 'public_rfp_upload'].includes(source)) {
    return res.status(400).json({ error: 'Unsupported input source. Only public RFP uploads and user text inputs are allowed.' });
  }

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

export async function saveOpportunity(_req, res) {
  return res.json({
    success: true,
    demoMode: true,
    message: 'Saved in demo session only.'
  });
}

export async function listOpportunities(_req, res) {
  return res.json({ history: [] });
}

export async function deleteOpportunity(_req, res) {
  return res.json({ success: true });
}
