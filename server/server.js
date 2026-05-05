const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Papa = require('papaparse');
const XLSX = require('xlsx');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

const marketplaceSuppliers = [
  { name: 'Atlas Components', category: 'Electronics', region: 'US' },
  { name: 'ForgeSteel', category: 'Metals', region: 'US' },
  { name: 'Nova Plastics', category: 'Plastics', region: 'MX' },
  { name: 'Quantum Fasteners', category: 'Hardware', region: 'US' },
  { name: 'CircuitWave', category: 'Electronics', region: 'TW' },
  { name: 'BlueRiver Textiles', category: 'Textiles', region: 'IN' },
  { name: 'Prime Bearings', category: 'Mechanical', region: 'DE' },
  { name: 'CarbonCore', category: 'Composites', region: 'US' },
  { name: 'Metro Packaging', category: 'Packaging', region: 'US' },
  { name: 'Zenith Tools', category: 'Hardware', region: 'CA' }
];

const categoryRules = {
  Electronics: ['pcb', 'sensor', 'circuit', 'chip', 'board'],
  Hardware: ['bolt', 'nut', 'screw', 'fastener', 'tool'],
  Mechanical: ['bearing', 'shaft', 'motor', 'pump'],
  Metals: ['steel', 'aluminum', 'metal', 'alloy'],
  Plastics: ['plastic', 'poly', 'resin'],
  Packaging: ['box', 'pack', 'carton', 'label']
};

const toNumber = (v) => Number(String(v ?? '').replace(/[^0-9.-]/g, '')) || 0;

const assignCategory = (description = '') => {
  const d = description.toLowerCase();
  for (const [cat, words] of Object.entries(categoryRules)) {
    if (words.some((w) => d.includes(w))) return cat;
  }
  return 'General';
};

const analyze = (rows) => {
  const validRows = rows.filter((r) => r.part_number);
  const itemMargins = validRows.map((item) => {
    const quantity = toNumber(item.quantity);
    const cost = toNumber(item.cost);
    const price = toNumber(item.price);
    const leadTime = toNumber(item.lead_time);
    const marginPct = price > 0 ? ((price - cost) / price) * 100 : 0;
    return { ...item, quantity, cost, price, lead_time: leadTime, marginPct, category: assignCategory(item.description) };
  });

  const avgPrice = itemMargins.reduce((a, i) => a + i.price, 0) / (itemMargins.length || 1);
  const lowMarginItems = itemMargins.filter((i) => i.marginPct < 15);
  const overpricedItems = itemMargins.filter((i) => i.price > avgPrice * 1.2);
  const riskySuppliers = [...new Set(itemMargins.filter((i) => i.lead_time > 30).map((i) => i.supplier))];

  const potentialSavings = lowMarginItems.reduce((sum, i) => sum + Math.max(0, (i.cost * 1.1 - i.price) * i.quantity), 0)
    + overpricedItems.reduce((sum, i) => sum + (i.price - avgPrice) * i.quantity * 0.1, 0);

  const totalSpend = itemMargins.reduce((s, i) => s + i.cost * i.quantity, 0);
  const avgMargin = itemMargins.reduce((s, i) => s + i.marginPct, 0) / (itemMargins.length || 1);

  const categories = itemMargins.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + i.cost * i.quantity;
    return acc;
  }, {});

  return {
    items: itemMargins,
    kpis: {
      totalSpend,
      detectedSavings: potentialSavings,
      atRiskSuppliers: riskySuppliers.length,
      avgMargin
    },
    insights: {
      lowMarginItems,
      overpricedItems,
      riskySuppliers,
      potentialSavings
    },
    categories
  };
};

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File required' });
  const ext = req.file.originalname.split('.').pop().toLowerCase();
  let rows = [];

  if (ext === 'csv') {
    const parsed = Papa.parse(req.file.buffer.toString('utf-8'), { header: true, skipEmptyLines: true });
    rows = parsed.data;
  } else if (ext === 'xlsx' || ext === 'xls') {
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws);
  } else {
    return res.status(400).json({ error: 'Supported: csv, xlsx, xls' });
  }

  return res.json(analyze(rows));
});

app.get('/api/marketplace', (req, res) => {
  const { category } = req.query;
  const data = category ? marketplaceSuppliers.filter((s) => s.category === category) : marketplaceSuppliers;
  res.json(data);
});

app.post('/api/request-quote', (req, res) => {
  console.log('RFQ logged:', req.body);
  res.json({ message: 'Quote request logged successfully.' });
});

app.post('/api/funding-match', (req, res) => {
  const poValue = toNumber(req.body.poValue);
  const neededCapital = toNumber(req.body.neededCapital);
  const ratio = neededCapital / (poValue || 1);
  const approval = ratio <= 0.6 ? 'High' : ratio <= 0.8 ? 'Moderate' : 'Conditional';
  res.json({ partner: 'Crestline Capital Partners', estimatedApproval: approval });
});

app.listen(4000, () => console.log('API running on http://localhost:4000'));
