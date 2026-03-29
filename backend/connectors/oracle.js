/**
 * Oracle ERP Cloud Connector
 *
 * Authenticates via OAuth 2.0 Resource Owner Password Credentials (ROPC) grant
 * against Oracle Identity Cloud Service (IDCS). The user's credentials are used
 * ONCE to obtain a short-lived access token and are NEVER stored by this application.
 */

import axios from "axios";

/**
 * Exchange a user's ERP credentials for an access token (ROPC grant).
 * Credentials are used only for this call and never persisted.
 */
export async function getTokenFromCredentials({ tokenUrl, clientId, username, password, scope }) {
  if (!tokenUrl || !username || !password) {
    throw new Error("Oracle ERP: tokenUrl, username, and password are required.");
  }

  const params = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    ...(scope ? { scope } : {})
  });

  // Oracle IDCS uses HTTP Basic auth with clientId (if provided) for ROPC
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  if (clientId) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:`).toString("base64")}`;
  }

  const response = await axios.post(tokenUrl, params.toString(), { headers, timeout: 15000 });

  if (!response.data.access_token) {
    throw new Error("Oracle ERP: No access token returned from the token endpoint.");
  }

  return {
    accessToken: response.data.access_token,
    expiresIn: response.data.expires_in ?? 3600
  };
}

// Generic authenticated GET helper for Oracle ERP Cloud REST APIs.
async function erpGet(tenantUrl, path, accessToken, params = {}) {
  const url = `${tenantUrl.replace(/\/$/, "")}${path}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    },
    params,
    timeout: 20000
  });
  return response.data;
}

// Generic authenticated POST helper.
async function erpPost(tenantUrl, path, accessToken, body) {
  const url = `${tenantUrl.replace(/\/$/, "")}${path}`;
  const response = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    timeout: 20000
  });
  return response.data;
}

// Sanitize a string value for inclusion in Oracle FIQL/OData query strings.
function sanitizeQueryValue(val) {
  return String(val).replace(/['";<>\\]/g, "");
}

// Fetch purchase orders from Oracle Procurement Cloud.
export async function getPurchaseOrders(tenantUrl, accessToken, options = {}) {
  const { offset = 0, limit = 50, status, supplierName } = options;
  const queryParts = [];
  if (status) queryParts.push(`Status=${sanitizeQueryValue(status)}`);
  if (supplierName) queryParts.push(`SupplierName=${sanitizeQueryValue(supplierName)}`);
  return erpGet(
    tenantUrl,
    "/fscmRestApi/resources/11.13.18.05/purchaseOrders",
    accessToken,
    {
      offset,
      limit,
      ...(queryParts.length > 0 ? { q: queryParts.join(";") } : {})
    }
  );
}

// Create a purchase order in Oracle Procurement Cloud.
export async function createPurchaseOrder(tenantUrl, accessToken, orderData) {
  return erpPost(
    tenantUrl,
    "/fscmRestApi/resources/11.13.18.05/purchaseOrders",
    accessToken,
    orderData
  );
}

// Fetch suppliers from Oracle Supplier Model.
export async function getSuppliers(tenantUrl, accessToken, options = {}) {
  const { offset = 0, limit = 50, search } = options;
  return erpGet(tenantUrl, "/fscmRestApi/resources/11.13.18.05/suppliers", accessToken, {
    offset,
    limit,
    ...(search ? { q: `SupplierName=*${sanitizeQueryValue(search)}*` } : {})
  });
}

// Fetch invoices from Oracle Financials.
export async function getInvoices(tenantUrl, accessToken, options = {}) {
  const { offset = 0, limit = 50, status, invoiceDateFrom, invoiceDateTo } = options;
  const queryParts = [];
  if (status) queryParts.push(`InvoiceStatus=${sanitizeQueryValue(status)}`);
  if (invoiceDateFrom) queryParts.push(`InvoiceDate>=${sanitizeQueryValue(invoiceDateFrom)}`);
  if (invoiceDateTo) queryParts.push(`InvoiceDate<=${sanitizeQueryValue(invoiceDateTo)}`);
  return erpGet(
    tenantUrl,
    "/fscmRestApi/resources/11.13.18.05/invoices",
    accessToken,
    {
      offset,
      limit,
      ...(queryParts.length > 0 ? { q: queryParts.join(";") } : {})
    }
  );
}

// Fetch supply chain inventory positions.
export async function getInventoryPositions(tenantUrl, accessToken, options = {}) {
  const { offset = 0, limit = 50 } = options;
  return erpGet(
    tenantUrl,
    "/fscmRestApi/resources/11.13.18.05/inventoryBalances",
    accessToken,
    { offset, limit }
  );
}

/**
 * Test connectivity using a pre-obtained access token.
 * Pings the API with the stored token to confirm it is still valid.
 */
export async function testConnection(tenantUrl, accessToken) {
  await erpGet(tenantUrl, "/fscmRestApi/resources/11.13.18.05/suppliers", accessToken, { limit: 1 });
  return { ok: true };
}
