import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../server/app.js';
import User from '../server/models/User.js';
import Tenant from '../server/models/Tenant.js';
import CategorySnapshot from '../server/models/CategorySnapshot.js';
import SupplierProfile from '../server/models/SupplierProfile.js';
import OpportunityAnalysis from '../server/models/OpportunityAnalysis.js';
import ActionItem from '../server/models/ActionItem.js';
import ErpUpload from '../server/models/ErpUpload.js';
import ProcurementContract from '../server/models/ProcurementContract.js';
import SavingsRecord from '../server/models/SavingsRecord.js';

function createSortLimitChain(result) {
  return {
    sort: () => ({ limit: async () => result })
  };
}

test('demo readiness smoke flow returns non-error statuses', async () => {
  const original = {
    userFindOne: User.findOne,
    userFindById: User.findById,
    tenantFindById: Tenant.findById,
    categoryExists: CategorySnapshot.exists,
    categoryCreate: CategorySnapshot.create,
    supplierInsertMany: SupplierProfile.insertMany,
    oppCreate: OpportunityAnalysis.create,
    actionInsertMany: ActionItem.insertMany,
    erpFindOne: ErpUpload.findOne,
    contractFind: ProcurementContract.find,
    savingsFind: SavingsRecord.find,
    userCountDocuments: User.countDocuments
  };

  const demoTenant = { _id: '64b7f9b3c12a4d5e6f708901', name: 'BlackCrest Demo Workspace', subscriptionStatus: 'trialing', plan: 'enterprise', seats: 10 };
  const demoUser = {
    _id: '64b7f9b3c12a4d5e6f708902',
    email: 'demo@blackcrest.ai',
    name: 'BlackCrest Demo Admin',
    role: 'system_administrator',
    tenantId: demoTenant._id,
    isTenantAdmin: true,
    comparePassword: async (password) => password === 'Blackcrest!2026'
  };

  User.findOne = async ({ email }) => (email === 'demo@blackcrest.ai' ? demoUser : null);
  User.findById = (id) => {
    if (id !== demoUser._id) return { lean: async () => null };
    return { ...demoUser, lean: async () => demoUser };
  };
  Tenant.findById = (id) => ({ lean: async () => (id === demoTenant._id ? demoTenant : null) });
  CategorySnapshot.exists = async () => true;
  CategorySnapshot.create = async () => ({});
  SupplierProfile.insertMany = async () => [];
  OpportunityAnalysis.create = async () => ({});
  ActionItem.insertMany = async () => [];
  ErpUpload.findOne = () => ({ sort: async () => null });
  ProcurementContract.find = () => createSortLimitChain([]);
  SavingsRecord.find = () => createSortLimitChain([]);
  User.countDocuments = async () => 1;

  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'demo@blackcrest.ai', password: 'Blackcrest!2026' })
    });
    assert.equal(login.status, 200, `login returned ${login.status}`);
    const loginBody = await login.json();
    const token = loginBody.token;
    assert.ok(token, 'missing auth token');

    const endpoints = [
      '/api/auth/profile',
      '/api/sentinel/overview',
      '/api/sentinel/opportunities',
      '/api/procurement-intelligence/summary',
      '/api/demo-mode/readiness'
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      assert.ok(![401, 403, 404, 500].includes(response.status), `${endpoint} returned ${response.status}`);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
    User.findOne = original.userFindOne;
    User.findById = original.userFindById;
    Tenant.findById = original.tenantFindById;
    CategorySnapshot.exists = original.categoryExists;
    CategorySnapshot.create = original.categoryCreate;
    SupplierProfile.insertMany = original.supplierInsertMany;
    OpportunityAnalysis.create = original.oppCreate;
    ActionItem.insertMany = original.actionInsertMany;
    ErpUpload.findOne = original.erpFindOne;
    ProcurementContract.find = original.contractFind;
    SavingsRecord.find = original.savingsFind;
    User.countDocuments = original.userCountDocuments;
  }
});
