import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';
import { analyzeOperationalProcurementRows, parseCsv } from '../services/liveProcurementIntelligenceService.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/analyze-upload', authRequired, enforceSeatLimits, upload.single('file'), async (req, res) => {
  try {
    let rows = [];

    if (req.file?.buffer) {
      rows = parseCsv(req.file.buffer);
    } else if (Array.isArray(req.body?.rows)) {
      rows = req.body.rows;
    } else if (typeof req.body?.csv === 'string') {
      rows = parseCsv(req.body.csv);
    }

    const analysis = analyzeOperationalProcurementRows(rows, {
      source: req.file?.originalname || 'manual upload'
    });

    return res.json({
      tenantId: req.user?.tenant?._id,
      uploadedFile: req.file?.originalname || null,
      uploadedRowCount: rows.length,
      analysis
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to analyze procurement upload',
      error: error.message
    });
  }
});

router.post('/analyze-json', authRequired, enforceSeatLimits, async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    const analysis = analyzeOperationalProcurementRows(rows, {
      source: 'json-api'
    });

    return res.json(analysis);
  } catch (error) {
    return res.status(400).json({
      message: 'Unable to analyze JSON procurement payload',
      error: error.message
    });
  }
});

export default router;
