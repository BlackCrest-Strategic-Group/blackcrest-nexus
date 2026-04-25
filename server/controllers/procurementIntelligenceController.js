import ErpUpload from '../models/ErpUpload.js';
import SupplierProfile from '../models/SupplierProfile.js';
import SupplierFollowUp from '../models/SupplierFollowUp.js';
import CategoryPlan from '../models/CategoryPlan.js';
import ProcurementContract from '../models/ProcurementContract.js';
import SavingsRecord from '../models/SavingsRecord.js';

const asNumber = (value) => Number(value || 0);

function buildPoStatus(rows = []) {
  const now = new Date();
  let openPos = 0;
  let latePos = 0;
  let totalSpend = 0;

  rows.forEach((row) => {
    const status = String(row.status || '').toLowerCase();
    const isClosed = ['closed', 'received', 'complete', 'completed'].includes(status);
    const promised = row.promisedDate ? new Date(row.promisedDate) : null;
    const isLate = promised && promised < now && !isClosed;

    if (!isClosed) openPos += 1;
    if (isLate) latePos += 1;
    totalSpend += asNumber(row.extendedValue || row.total || 0);
  });

  return { totalRows: rows.length, openPos, latePos, totalSpend };
}

function buildSpendByYear(rows = []) {
  const byYear = rows.reduce((acc, row) => {
    const rawDate = row.orderDate || row.createdAt || row.poDate;
    const date = rawDate ? new Date(rawDate) : null;
    const year = Number.isFinite(date?.getFullYear?.()) ? date.getFullYear() : new Date().getFullYear();
    acc[year] = (acc[year] || 0) + asNumber(row.extendedValue || row.total || 0);
    return acc;
  }, {});

  return Object.entries(byYear)
    .map(([year, spend]) => ({ year: Number(year), spend }))
    .sort((a, b) => a.year - b.year);
}

async function getTenantRows(req) {
  const latestUpload = await ErpUpload.findOne({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  return latestUpload?.normalizedRows || [];
}

export async function getProcurementSummary(req, res) {
  const [rows, contracts, savings] = await Promise.all([
    getTenantRows(req),
    ProcurementContract.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(200),
    SavingsRecord.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(200)
  ]);

  const po = buildPoStatus(rows);
  const realizedSavings = savings.reduce((sum, item) => sum + asNumber(item.realizedSavings), 0);

  return res.json({
    dataSource: rows.length ? 'customer_upload' : 'demo',
    poStatus: po,
    spendByYear: buildSpendByYear(rows),
    contractCount: contracts.length,
    expiringContracts: contracts.filter((c) => c.endDate && new Date(c.endDate) < new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)).length,
    savings: {
      initiatives: savings.length,
      realized: realizedSavings
    }
  });
}

export async function listSupplierFormData(req, res) {
  const [suppliers, followUps, rows] = await Promise.all([
    SupplierProfile.find({ tenantId: req.user.tenantId }).sort({ updatedAt: -1 }),
    SupplierFollowUp.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 }).limit(200),
    getTenantRows(req)
  ]);

  const poStatus = buildPoStatus(rows);
  return res.json({ suppliers, followUps, spendByYear: buildSpendByYear(rows), poStatus });
}

export async function createSupplierFormRecord(req, res) {
  const payload = { ...req.body, userId: req.user._id, tenantId: req.user.tenantId };
  const supplier = await SupplierProfile.create(payload);
  return res.status(201).json(supplier);
}

export async function addSupplierFollowUp(req, res) {
  const payload = {
    ...req.body,
    supplierName: req.body.supplierName || req.params.supplierName,
    userId: req.user._id,
    tenantId: req.user.tenantId
  };
  if (!payload.supplierName) return res.status(400).json({ message: 'supplierName is required' });
  const followUp = await SupplierFollowUp.create(payload);
  return res.status(201).json(followUp);
}

export async function listCategoryPlans(req, res) {
  const plans = await CategoryPlan.find({ tenantId: req.user.tenantId }).sort({ updatedAt: -1 });
  return res.json(plans);
}

export async function createCategoryPlan(req, res) {
  const plan = await CategoryPlan.create({ ...req.body, userId: req.user._id, tenantId: req.user.tenantId });
  return res.status(201).json(plan);
}

export async function listContracts(req, res) {
  const contracts = await ProcurementContract.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  return res.json(contracts);
}

export async function createContract(req, res) {
  const contract = await ProcurementContract.create({ ...req.body, userId: req.user._id, tenantId: req.user.tenantId });
  return res.status(201).json(contract);
}

export async function listSavings(req, res) {
  const savings = await SavingsRecord.find({ tenantId: req.user.tenantId }).sort({ createdAt: -1 });
  return res.json(savings);
}

export async function createSavings(req, res) {
  const payload = { ...req.body, userId: req.user._id, tenantId: req.user.tenantId };
  payload.realizedSavings = payload.realizedSavings || Math.max(asNumber(payload.baselineCost) - asNumber(payload.negotiatedCost), 0);
  const savings = await SavingsRecord.create(payload);
  return res.status(201).json(savings);
}
