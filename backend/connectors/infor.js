/**
 * Infor SyteLine ERP Connector
 *
 * Authenticates via OAuth 2.0 Resource Owner Password Credentials (ROPC) grant
 * against the Infor ION API gateway. The user's credentials are used ONCE to
 * obtain a short-lived access token and are NEVER stored by this application.
 */

import axios from "axios";

/**
 * Exchange a user's ERP credentials for an access token (ROPC grant).
 * Credentials are used only for this call and never persisted.
 */
export async function getTokenFromCredentials({ tokenUrl, clientId, username, password, scope }) {
  if (!tokenUrl || !username || !password) {
    throw new Error("Infor SyteLine: tokenUrl, username, and password are required.");
  }

  const params = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    ...(clientId ? { client_id: clientId } : {}),
    ...(scope ? { scope } : {})
  });

  const response = await axios.post(tokenUrl, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 15000
  });

  if (!response.data.access_token) {
    throw new Error("Infor SyteLine: No access token returned from the token endpoint.");
  }

  return {
    accessToken: response.data.access_token,
    expiresIn: response.data.expires_in ?? 3600
  };
}

// Generic authenticated GET helper for the Infor ION REST API.
async function ionGet(tenantUrl, path, accessToken, params = {}) {
  const url = `${tenantUrl.replace(/\/$/, "")}${path}`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    params,
    timeout: 20000
  });
  return response.data;
}

// Generic authenticated POST helper.
async function ionPost(tenantUrl, path, accessToken, body) {
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

// Fetch open purchase orders from SyteLine.
export async function getPurchaseOrders(tenantUrl, accessToken, options = {}) {
  const { page = 1, pageSize = 50, status } = options;
  return ionGet(tenantUrl, "/api/v1/procurement/purchase-orders", accessToken, {
    page,
    pageSize,
    ...(status ? { status } : {})
  });
}

// Create a purchase order in SyteLine.
export async function createPurchaseOrder(tenantUrl, accessToken, orderData) {
  return ionPost(tenantUrl, "/api/v1/procurement/purchase-orders", accessToken, orderData);
}

// Fetch supplier list from SyteLine.
export async function getSuppliers(tenantUrl, accessToken, options = {}) {
  const { page = 1, pageSize = 50, search } = options;
  return ionGet(tenantUrl, "/api/v1/procurement/suppliers", accessToken, {
    page,
    pageSize,
    ...(search ? { search } : {})
  });
}

// Fetch invoices from SyteLine.
export async function getInvoices(tenantUrl, accessToken, options = {}) {
  const { page = 1, pageSize = 50, status, fromDate, toDate } = options;
  return ionGet(tenantUrl, "/api/v1/financials/invoices", accessToken, {
    page,
    pageSize,
    ...(status ? { status } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {})
  });
}

/**
 * Test connectivity using a pre-obtained access token.
 * Pings the API with the stored token to confirm it is still valid.
 */
export async function testConnection(tenantUrl, accessToken) {
  await ionGet(tenantUrl, "/api/v1/procurement/suppliers", accessToken, { pageSize: 1 });
  return { ok: true };
}
