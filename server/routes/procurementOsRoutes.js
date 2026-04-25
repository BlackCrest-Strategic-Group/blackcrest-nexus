import { Router } from 'express';
import multer from 'multer';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';
import { requireActiveSubscription } from '../middleware/subscriptionGate.js';
import { getInvestorDemoData } from '../services/procurementDemoData.js';
import { parseUploadFile, normalizeProcurementRows } from '../services/procurementIngestionService.js';
import { analyzeMarginLeaks } from '../services/marginLeakService.js';
import { buildSupplierRecommendations } from '../services/supplierRecommendationEngine.js';
import { createErpConnector, listErpConnectors } from '../services/erpConnectorService.js';
import { generateReport } from '../services/reportCenterService.js';
import { analyzeRfpText } from '../services/rfpAnalysisService.js';
import { procurementObjectModel } from '../services/procurementObjectModel.js';
import ErpUpload from '../models/ErpUpload.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

router.get('/investor-demo/summary', (_req, res) => {
  return res.json({ ...getInvestorDemoData(), procurementObjectModel, dataSource: 'demo' });
});


router.post('/procurement-ingest/upload', authRequired, enforceSeatLimits, requireActiveSubscription, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'file is required' });
    const rows = await parseUploadFile(req.file);
    const normalized = normalizeProcurementRows(rows);
    const uploadType = req.body.uploadType || 'generic';
    const persisted = await ErpUpload.create({
      tenantId: req.user.tenantId,
      userId: req.user._id,
      sourceName: req.file.originalname,
      uploadType,
      mappedColumns: normalized.mappedColumns,
      unmappedColumns: normalized.unmappedColumns,
      normalizedRows: normalized.normalizedRows,
      summaryMetrics: normalized.summaryMetrics
    });

    return res.json({
      uploadId: persisted._id,
      uploadType,
      persisted: true,
      ...normalized
    });
  } catch (error) {
    const status = error?.code === 'MISSING_OPTIONAL_DEPENDENCY' ? 503 : 500;
    return res.status(status).json({ message: error.message || 'Unable to parse upload file.' });
  }
});

router.post('/margin-leaks/analyze', authRequired, enforceSeatLimits, requireActiveSubscription, (req, res) => {
  const result = analyzeMarginLeaks(req.body.rows || []);
  return res.json(result);
});

router.post('/supplier-recommendations/analyze', authRequired, enforceSeatLimits, requireActiveSubscription, (req, res) => {
  const demo = getInvestorDemoData();
  const result = buildSupplierRecommendations({ ...req.body, catalog: demo.suppliers });
  return res.json(result);
});

router.get('/erp-connectors', authRequired, enforceSeatLimits, requireActiveSubscription, (_req, res) => {
  return res.json({
    copy: 'ERP connectors are CSV now, API later. Customer IT controls and approves API cutover when integration is ready.',
    connectors: listErpConnectors()
  });
});

router.post('/erp-connectors', authRequired, enforceSeatLimits, requireActiveSubscription, (req, res) => {
  if (!req.body.provider) return res.status(400).json({ message: 'provider is required' });
  return res.status(201).json(createErpConnector(req.body));
});

router.post('/reports/generate', authRequired, enforceSeatLimits, requireActiveSubscription, (req, res) => {
  const { reportType, context = {} } = req.body || {};
  if (!reportType) return res.status(400).json({ message: 'reportType is required' });
  const report = reportType === 'RFP Analysis Report' && context.content
    ? generateReport(reportType, analyzeRfpText({ title: context.title, content: context.content }))
    : generateReport(reportType, context);
  return res.json(report);
});

export default router;
