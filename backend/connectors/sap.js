/**
 * SAP ERP Connector
 *
 * Authenticates via OAuth 2.0 Resource Owner Password Credentials (ROPC) grant
 * against SAP Cloud Platform. The user's credentials are used ONCE to obtain a
 * short-lived access token and are NEVER stored by this application.
 */

import axios from "axios";

/**
 * Exchange a user's ERP credentials for an access token (ROPC grant).
 * Credentials are used only for this call and never persisted.
 */
export async function getTokenFromCredentials({ tokenUrl, clientId, username, password, scope }) {
  if (!tokenUrl || !username || !password) {
    throw new Error("SAP ERP: tokenUrl, username, and password are required.");
  }

  const params = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    ...(scope ? { scope } : {})
  });

  // SAP typically requires clientId via HTTP Basic auth for ROPC
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  if (clientId) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:`).toString("base64")}`;
  }

  const response = await axios.post(tokenUrl, params.toString(), { headers, timeout: 15000 });

  if (!response.data.access_token) {
    throw new Error("SAP ERP: No access token returned from the token endpoint.");
  }

  return {
    accessToken: response.data.access_token,
    expiresIn: response.data.expires_in ?? 3600
  };
}

// Generic authenticated OData GET helper.
async function odataGet(tenantUrl, path, accessToken, params = {}) {
  const url = `${tenantUrl.replace(/\/$/, "")}${path}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    },
    params: { $format: "json", ...params },
    timeout: 20000
  });
  return response.data;
}

// Generic authenticated POST helper for SAP REST/OData.
async function odataPost(tenantUrl, path, accessToken, body) {
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

// Fetch purchase orders from SAP S/4HANA Procurement (OData v4).
export async function getPurchaseOrders(tenantUrl, accessToken, options = {}) {
  const { top = 50, skip = 0, filter } = options;
  return odataGet(
    tenantUrl,
    "/sap/opu/odata4/sap/api_purchase_order_2/srvd_a2x/sap/purchase_order/0001/PurchaseOrder",
    accessToken,
    {
      $top: top,
      $skip: skip,
      ...(filter ? { $filter: filter } : {})
    }
  );
}

// Create a purchase order in SAP S/4HANA.
export async function createPurchaseOrder(tenantUrl, accessToken, orderData) {
  return odataPost(
    tenantUrl,
    "/sap/opu/odata4/sap/api_purchase_order_2/srvd_a2x/sap/purchase_order/0001/PurchaseOrder",
    accessToken,
    orderData
  );
}

// Sanitize a string for safe inclusion in OData $filter expressions.
function sanitizeODataString(val) {
  return String(val).replace(/'/g, "''");
}

// Fetch supplier master data from SAP Business Partner API.
export async function getSuppliers(tenantUrl, accessToken, options = {}) {
  const { top = 50, skip = 0, search } = options;
  return odataGet(
    tenantUrl,
    "/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_Supplier",
    accessToken,
    {
      $top: top,
      $skip: skip,
      ...(search
        ? { $filter: `contains(Supplier,'${sanitizeODataString(search)}')` }
        : {})
    }
  );
}

// Fetch supplier invoices from SAP Finance.
export async function getInvoices(tenantUrl, accessToken, options = {}) {
  const { top = 50, skip = 0, filter } = options;
  return odataGet(
    tenantUrl,
    "/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV/A_SupplierInvoice",
    accessToken,
    {
      $top: top,
      $skip: skip,
      ...(filter ? { $filter: sanitizeODataString(filter) } : {})
    }
  );
}

// Fetch profit centers and margin data from SAP COPA / Controlling.
export async function getProfitCenters(tenantUrl, accessToken, options = {}) {
  const { top = 50, skip = 0 } = options;
  return odataGet(
    tenantUrl,
    "/sap/opu/odata/sap/API_PROFITCENTER_SRV/A_ProfitCenter",
    accessToken,
    { $top: top, $skip: skip }
  );
}

/**
 * Test connectivity using a pre-obtained access token.
 * Pings the API with the stored token to confirm it is still valid.
 */
export async function testConnection(tenantUrl, accessToken) {
  await odataGet(
    tenantUrl,
    "/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_Supplier",
    accessToken,
    { $top: 1 }
  );
  return { ok: true };
}
