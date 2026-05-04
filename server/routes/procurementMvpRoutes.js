import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const suppliersPath = path.join(__dirname, '..', 'data', 'demoSuppliers.json');

const fxRates = { USD: 1, EUR: 1.08 };

function loadSuppliers() {
  const raw = fs.readFileSync(suppliersPath, 'utf8');
  return JSON.parse(raw);
}

function scoreSupplier(supplier) {
  const usdCost = supplier.cost * (fxRates[supplier.currency] || 1);
  const costScore = Math.max(0, 40 - usdCost / 5000);
  const leadScore = Math.max(0, 25 - supplier.leadTimeDays / 2);
  const capacityScore = supplier.capacity * 0.25;
  const marginScore = Math.max(0, 15 - supplier.marginPercent / 2);
  return Number((costScore + leadScore + capacityScore + marginScore).toFixed(2));
}

function enrichSupplier(s) {
  const costUsd = Number((s.cost * (fxRates[s.currency] || 1)).toFixed(2));
  const riskFlags = [];
  if (costUsd > 130000) riskFlags.push('High cost');
  if (s.capacity < 80) riskFlags.push('Low capacity');
  if (s.leadTimeDays > 30) riskFlags.push('Long lead time');
  return { ...s, costUsd, score: scoreSupplier(s), riskFlags, riskLevel: riskFlags.length >= 2 ? 'High' : riskFlags.length === 1 ? 'Medium' : 'Low' };
}

function parseRfpText(text) {
  const lower = text.toLowerCase();
  const checks = [
    { label: 'Compliance requirements identified', pass: /compliance|far|dfars|iso|nist/.test(lower) },
    { label: 'Pricing structure defined', pass: /price|pricing|cost|budget|fee/.test(lower) },
    { label: 'Delivery timeline detected', pass: /delivery|timeline|days|weeks|deadline/.test(lower) },
    { label: 'Risk terms present', pass: /penalty|liquidated|risk|damages|termination/.test(lower) }
  ];
  const riskFlags = [];
  if (/penalty|liquidated damages/.test(lower)) riskFlags.push('Penalty clauses detected');
  if (/expedite|urgent|immediate/.test(lower)) riskFlags.push('Aggressive delivery requirement');
  if (!/budget|pricing|cost/.test(lower)) riskFlags.push('Missing budget clarity');
  const passed = checks.filter((item) => item.pass).length;
  const bidScore = Math.round((passed / checks.length) * 100 - riskFlags.length * 10);
  return {
    checklist: checks,
    bidScore,
    recommendation: bidScore >= 70 ? 'Bid' : 'No-Bid',
    riskFlags,
    summary: `RFP readiness score ${bidScore}/100. ${passed} of ${checks.length} key procurement criteria identified.`
  };
}

router.get('/suppliers', (req, res) => {
  const region = req.query.region;
  const suppliers = loadSuppliers().map(enrichSupplier).filter((s) => !region || s.region === region);
  const bestValueSupplier = suppliers.slice().sort((a, b) => b.score - a.score)[0] || null;
  const highRiskSupplier = suppliers.find((s) => s.riskLevel === 'High') || null;
  res.json({ suppliers, fxRates, bestValueSupplier, highRiskSupplier, erpConnected: req.query.mode === 'erp' });
});

router.post('/suppliers', (req, res) => {
  const suppliers = loadSuppliers();
  const payload = req.body;
  const newSupplier = {
    id: `sup-${String(Date.now()).slice(-6)}`,
    name: payload.name,
    region: payload.region,
    cost: Number(payload.cost),
    currency: payload.currency,
    leadTimeDays: Number(payload.leadTimeDays),
    capacity: Number(payload.capacity),
    marginPercent: Number(payload.marginPercent)
  };
  suppliers.push(newSupplier);
  fs.writeFileSync(suppliersPath, JSON.stringify(suppliers, null, 2));
  res.status(201).json({ supplier: enrichSupplier(newSupplier) });
});

router.post('/analyze-rfp', upload.single('rfpFile'), async (req, res, next) => {
  try {
    let inputText = req.body.rfpText || '';
    if (req.file) {
      const parsed = await pdfParse(req.file.buffer);
      inputText = `${inputText}\n${parsed.text}`.trim();
    }
    if (!inputText) return res.status(400).json({ error: 'Provide RFP text or PDF file.' });
    return res.json(parseRfpText(inputText));
  } catch (error) {
    return next(error);
  }
});

router.get('/insights', (req, res) => {
  const suppliers = loadSuppliers().map(enrichSupplier);
  const best = suppliers.slice().sort((a, b) => b.score - a.score)[0];
  const avgCost = suppliers.reduce((sum, s) => sum + s.costUsd, 0) / suppliers.length;
  const avgCapacity = suppliers.reduce((sum, s) => sum + s.capacity, 0) / suppliers.length;
  const riskAlerts = suppliers.filter((s) => s.riskFlags.length).map((s) => `${s.name}: ${s.riskFlags.join(', ')}`);
  res.json({
    recommendation: best ? `Best supplier recommendation: ${best.name} (score ${best.score})` : 'No supplier data.',
    tradeoff: `Average normalized cost is $${avgCost.toFixed(0)} with average capacity ${avgCapacity.toFixed(0)}%.`,
    riskAlerts
  });
});

export default router;
