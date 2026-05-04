import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const dataPath = path.resolve(process.cwd(), 'server/data/demoProcurementData.json');

const mvpStore = { rfqs: [], responses: [] };
const mockSuppliers = [
  { id: 'sup-1', name: 'ForgeLine Metals', category: 'Metals', rating: 4.7, location: 'Ohio' },
  { id: 'sup-2', name: 'BoltCore', category: 'Fasteners', rating: 4.9, location: 'Texas' },
  { id: 'sup-3', name: 'CircuitWorks', category: 'Electronics', rating: 4.6, location: 'California' }
];

function parseCsv(text) {
  const [header, ...rows] = text.trim().split(/\r?\n/);
  const keys = header.split(',').map((v) => v.trim());
  return rows.map((row) => {
    const values = row.split(',');
    const out = {};
    keys.forEach((k, i) => { out[k] = values[i]; });
    return out;
  });
}

function normalizeRows(rows = []) {
  return rows.map((r) => ({
    ...r,
    unitPrice: Number(r.unitPrice),
    quantity: Number(r.quantity),
    leadTimeDays: Number(r.leadTimeDays),
    onTimeDeliveryRate: Number(r.onTimeDeliveryRate)
  }));
}

function analyze(rows) {
  const byItem = new Map();
  rows.forEach((r) => {
    if (!byItem.has(r.item)) byItem.set(r.item, []);
    byItem.get(r.item).push(r);
  });

  const anomalies = [];
  byItem.forEach((group, item) => {
    const avg = group.reduce((s, r) => s + r.unitPrice, 0) / group.length;
    group.forEach((r) => {
      const variancePct = ((r.unitPrice - avg) / avg) * 100;
      if (variancePct > 10) anomalies.push({ item, supplier: r.supplier, unitPrice: r.unitPrice, averagePrice: Number(avg.toFixed(2)), variancePct: Number(variancePct.toFixed(1)) });
    });
  });

  const supplierPerformance = Object.values(rows.reduce((acc, r) => {
    acc[r.supplier] ??= { supplier: r.supplier, avgOnTimeDelivery: 0, avgLeadTimeDays: 0, score: 0, count: 0 };
    acc[r.supplier].avgOnTimeDelivery += r.onTimeDeliveryRate;
    acc[r.supplier].avgLeadTimeDays += r.leadTimeDays;
    acc[r.supplier].count += 1;
    return acc;
  }, {})).map((s) => {
    s.avgOnTimeDelivery = Number((s.avgOnTimeDelivery / s.count).toFixed(2));
    s.avgLeadTimeDays = Number((s.avgLeadTimeDays / s.count).toFixed(1));
    s.score = Math.round((s.avgOnTimeDelivery * 70) + Math.max(0, 30 - s.avgLeadTimeDays));
    return s;
  });

  const riskFlags = rows.flatMap((r) => {
    const flags = [];
    if (r.leadTimeDays > 30) flags.push({ supplier: r.supplier, item: r.item, type: 'late_delivery', message: `Lead time ${r.leadTimeDays}d exceeds threshold` });
    if (r.onTimeDeliveryRate < 0.85) flags.push({ supplier: r.supplier, item: r.item, type: 'delivery_reliability', message: `On-time rate ${(r.onTimeDeliveryRate * 100).toFixed(0)}% below 85%` });
    return flags;
  });

  const alternativeSuppliers = anomalies.map((a) => ({
    item: a.item,
    currentSupplier: a.supplier,
    suggested: mockSuppliers.filter((s) => s.name !== a.supplier).slice(0, 2).map((s) => s.name)
  }));

  const totalSavings = anomalies.reduce((sum, a) => sum + Math.max(0, (a.unitPrice - a.averagePrice) * 100), 0);
  const rfqActivity = rows.reduce((acc, r) => { acc[r.rfqStatus] = (acc[r.rfqStatus] || 0) + 1; return acc; }, {});

  return { anomalies, supplierPerformance, riskFlags, alternativeSuppliers, summary: { totalSavingsOpportunity: Math.round(totalSavings), rfqActivity } };
}

router.get('/demo', (_req, res) => {
  const rows = normalizeRows(JSON.parse(fs.readFileSync(dataPath, 'utf8')));
  res.json({ mode: 'demo', rows, analysis: analyze(rows) });
});

router.post('/analyze', upload.single('file'), (req, res) => {
  let rows = [];
  if (req.file) {
    const text = req.file.buffer.toString('utf8');
    rows = req.file.mimetype.includes('json') ? JSON.parse(text) : parseCsv(text);
  } else if (req.body?.rows) {
    rows = Array.isArray(req.body.rows) ? req.body.rows : JSON.parse(req.body.rows);
  } else {
    return res.status(400).json({ error: 'Upload a CSV/JSON file or provide rows payload.' });
  }
  const normalized = normalizeRows(rows);
  return res.json({ rows: normalized, analysis: analyze(normalized) });
});

router.get('/marketplace/suppliers', (_req, res) => res.json(mockSuppliers));
router.get('/marketplace/rfqs', (_req, res) => res.json(mvpStore.rfqs));
router.post('/marketplace/rfqs', (req, res) => {
  const rfq = { id: `rfq-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
  mvpStore.rfqs.unshift(rfq);
  res.status(201).json(rfq);
});
router.post('/marketplace/rfqs/:id/respond', (req, res) => {
  const response = { id: `rsp-${Date.now()}`, rfqId: req.params.id, ...req.body, createdAt: new Date().toISOString() };
  mvpStore.responses.unshift(response);
  res.status(201).json(response);
});

export default router;
