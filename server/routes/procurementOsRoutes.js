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

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

router.get('/investor-demo/summary', (_req, res) => {
  return res.json({ ...getInvestorDemoData(), procurementObjectModel });
});

router.post('/procurement-ingest/upload', authRequired, enforceSeatLimits, requireActiveSubscription, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'file is required' });
  const rows = parseUploadFile(req.file);
  const normalized = normalizeProcurementRows(rows);
  return res.json({
    uploadType: req.body.uploadType || 'generic',
    ...normalized
  });
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
    copy: 'BlackCrest is designed for customer-controlled ERP connectivity. Default demo mode uses synthetic/public data. Production connections should be reviewed and approved by the customer’s IT/security team.',
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
