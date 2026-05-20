import QuickBooksConfig from '../models/QuickBooksConfig.js';

const QB_BASE = process.env.QB_ENVIRONMENT === 'production'
  ? 'https://quickbooks.api.intuit.com/v3/company'
  : 'https://sandbox-quickbooks.api.intuit.com/v3/company';

const TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

async function refreshTokenIfNeeded(config) {
  if (config.tokenExpiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    return config;
  }
  const credentials = Buffer.from(
    `${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`
  ).toString('base64');
  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
    }),
  });
  if (!resp.ok) throw new Error(`QB token refresh failed: ${resp.status}`);
  const data = await resp.json();
  config.accessToken = data.access_token;
  if (data.refresh_token) config.refreshToken = data.refresh_token;
  config.tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);
  await config.save();
  return config;
}

async function qbQuery(config, query) {
  const c = await refreshTokenIfNeeded(config);
  const url = `${QB_BASE}/${c.realmId}/query?query=${encodeURIComponent(query)}&minorversion=65`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${c.accessToken}`, Accept: 'application/json' },
  });
  if (!resp.ok) throw new Error(`QB API failed: ${resp.status}`);
  return resp.json();
}

function normalizeVendor(v) {
  return {
    qbId: v.Id,
    name: v.DisplayName || v.CompanyName || v.PrintOnCheckName || 'Unknown',
    email: v.PrimaryEmailAddr?.Address || null,
    phone: v.PrimaryPhone?.FreeFormNumber || null,
    balance: v.Balance ?? 0,
    active: v.Active ?? true,
    source: 'quickbooks',
  };
}

function normalizeBill(b) {
  return {
    qbId: b.Id,
    vendorId: b.VendorRef?.value || null,
    vendorName: b.VendorRef?.name || null,
    totalAmount: b.TotalAmt ?? 0,
    balance: b.Balance ?? 0,
    dueDate: b.DueDate || null,
    txnDate: b.TxnDate || null,
    docNumber: b.DocNumber || null,
    status: b.Balance === 0 ? 'paid' : 'open',
    source: 'quickbooks',
  };
}

export async function syncQBData(userId) {
  const config = await QuickBooksConfig.findOne({ userId });
  if (!config) throw new Error('QB realm ID not found. Please reconnect QuickBooks.');

  const [vendorData, billData] = await Promise.all([
    qbQuery(config, 'SELECT * FROM Vendor MAXRESULTS 1000'),
    qbQuery(config, 'SELECT * FROM Bill MAXRESULTS 1000'),
  ]);

  const vendors = (vendorData.QueryResponse?.Vendor || []).map(normalizeVendor);
  const bills = (billData.QueryResponse?.Bill || []).map(normalizeBill);

  return {
    success: true,
    vendorCount: vendors.length,
    billCount: bills.length,
    vendors: vendors.slice(0, 10),
    bills: bills.slice(0, 10),
    syncedAt: new Date().toISOString(),
  };
}
