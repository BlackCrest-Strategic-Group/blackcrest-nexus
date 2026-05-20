/**
 * QuickBooks Real Integration Service
 *
 * Pulls actual vendor and bill data from QB API using OAuth tokens.
 * Place this file at: apps/api/src/services/quickbooksConnector.js
 */

const QB_API_BASE = 'https://quickbooks.api.intuit.com/v2/company';

/**
 * Fetch vendors from QB API
 * @param {string} realmId - QB Company/Realm ID (from OAuth callback)
 * @param {string} accessToken - QB OAuth access token
 * @returns {Array} List of QB vendors
 */
export async function fetchQBVendors(realmId, accessToken) {
  const query = `SELECT * FROM Vendor MAXRESULTS 100`;
  const encoded = encodeURIComponent(query);
  const url = `${QB_API_BASE}/${realmId}/query?query=${encoded}`;

  console.log(`[QB] Fetching vendors from realm ${realmId}...`);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`[QB ERROR] ${res.status}: ${error}`);
    throw new Error(`QB API failed: ${res.status} - ${error}`);
  }

  const data = await res.json();
  const vendors = data.QueryResponse?.Vendor ?? [];
  console.log(`[QB] ✓ Fetched ${vendors.length} vendors`);

  return vendors;
}

/**
 * Fetch bills (purchase orders) from QB API
 * @param {string} realmId - QB Company/Realm ID
 * @param {string} accessToken - QB OAuth access token
 * @returns {Array} List of QB bills
 */
export async function fetchQBBills(realmId, accessToken) {
  const query = `SELECT * FROM Bill MAXRESULTS 100`;
  const encoded = encodeURIComponent(query);
  const url = `${QB_API_BASE}/${realmId}/query?query=${encoded}`;

  console.log(`[QB] Fetching bills from realm ${realmId}...`);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`[QB ERROR] ${res.status}: ${error}`);
    throw new Error(`QB API failed: ${res.status} - ${error}`);
  }

  const data = await res.json();
  const bills = data.QueryResponse?.Bill ?? [];
  console.log(`[QB] ✓ Fetched ${bills.length} bills`);

  return bills;
}

/**
 * Transform QB Vendor object to Nexus Supplier format
 */
export function transformQBVendor(qbVendor) {
  return {
    id: qbVendor.Id,
    name: qbVendor.DisplayName || 'Unknown Vendor',
    email: qbVendor.PrimaryEmailAddr?.Address || '',
    phone: qbVendor.PrimaryPhone?.FreeFormNumber || '',
    website: qbVendor.WebAddr?.URI || '',
    active: !qbVendor.Active || qbVendor.Active === true,
    QB_ID: qbVendor.Id, // Store original QB ID for reference
  };
}

/**
 * Transform QB Bill object to Nexus Invoice format
 */
export function transformQBBill(qbBill) {
  const lineItems = (qbBill.Line || [])
    .filter(line => line.DetailType && line.DetailType !== 'TaxLineDetail')
    .map(line => {
      const amount = line.Amount || 0;
      return {
        description: line.Description || line.DetailType || 'Service',
        quantity: line.Quantity || 1,
        unitPrice: line.UnitPrice || amount,
        amount: amount,
        account: line.AccountBasedLineDetail?.AccountRef?.name || '',
      };
    });

  return {
    id: qbBill.Id,
    vendorName: qbBill.VendorRef?.name || 'Unknown Vendor',
    vendorId: qbBill.VendorRef?.value || '',
    invoiceNumber: qbBill.DocNumber || '',
    amount: qbBill.TotalAmt || 0,
    billDate: qbBill.MetaData?.CreateTime || new Date().toISOString(),
    dueDate: qbBill.DueDate || '',
    status: qbBill.SyncToken ? 'synced' : 'draft',
    items: lineItems,
    QB_ID: qbBill.Id, // Store original QB ID for reference
  };
}

/**
 * Sync QB vendors to Nexus database
 * @param {string} tenantId - Tenant ID (for multi-tenant isolation)
 * @param {string} orgId - Organization ID
 * @param {Array} vendors - Transformed vendor data
 * @param {Function} query - Database query function
 */
export async function syncVendorsToDatabase(tenantId, orgId, vendors, query) {
  console.log(`[SYNC] Saving ${vendors.length} vendors to database...`);

  for (const vendor of vendors) {
    try {
      await query(tenantId, `
        INSERT INTO suppliers (tenant_id, org_id, name, contact_email, phone, website, active, external_id, source, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (external_id) DO UPDATE SET
          name = EXCLUDED.name,
          contact_email = EXCLUDED.contact_email,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website,
          active = EXCLUDED.active,
          updated_at = NOW()
      `, [tenantId, orgId, vendor.name, vendor.email, vendor.phone, vendor.website, vendor.active, vendor.QB_ID, 'quickbooks']);
    } catch (err) {
      console.error(`[SYNC ERROR] Failed to sync vendor ${vendor.name}:`, err.message);
    }
  }

  console.log(`[SYNC] ✓ Vendors synced`);
}

/**
 * Sync QB bills to Nexus database
 * @param {string} tenantId - Tenant ID
 * @param {string} orgId - Organization ID
 * @param {Array} bills - Transformed bill data
 * @param {Function} query - Database query function
 */
export async function syncBillsToDatabase(tenantId, orgId, bills, query) {
  console.log(`[SYNC] Saving ${bills.length} bills to database...`);

  for (const bill of bills) {
    try {
      await query(tenantId, `
        INSERT INTO invoices (tenant_id, org_id, vendor_name, vendor_id, invoice_number, amount, bill_date, due_date, items_json, external_id, source, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (external_id) DO UPDATE SET
          amount = EXCLUDED.amount,
          items_json = EXCLUDED.items_json,
          updated_at = NOW()
      `, [tenantId, orgId, bill.vendorName, bill.vendorId, bill.invoiceNumber, bill.amount, bill.billDate, bill.dueDate, JSON.stringify(bill.items), bill.QB_ID, 'quickbooks']);
    } catch (err) {
      console.error(`[SYNC ERROR] Failed to sync bill ${bill.invoiceNumber}:`, err.message);
    }
  }

  console.log(`[SYNC] ✓ Bills synced`);
}

/**
 * Complete QB sync flow: fetch from API, transform, save to DB
 * @param {string} tenantId
 * @param {string} orgId
 * @param {string} realmId
 * @param {string} accessToken
 * @param {Function} query - Database query function
 * @returns {Object} Sync result summary
 */
export async function syncQBData(tenantId, orgId, realmId, accessToken, query) {
  try {
    console.log(`\n[QB SYNC START] Tenant: ${tenantId}, Org: ${orgId}, Realm: ${realmId}`);

    // Fetch from QB API
    const qbVendors = await fetchQBVendors(realmId, accessToken);
    const qbBills = await fetchQBBills(realmId, accessToken);

    // Transform
    const vendors = qbVendors.map(transformQBVendor);
    const bills = qbBills.map(transformQBBill);

    // Save to DB
    await syncVendorsToDatabase(tenantId, orgId, vendors, query);
    await syncBillsToDatabase(tenantId, orgId, bills, query);

    const result = {
      success: true,
      vendorCount: vendors.length,
      billCount: bills.length,
      vendors: vendors.slice(0, 10), // Return top 10 for demo
      bills: bills.slice(0, 10),
      syncedAt: new Date().toISOString(),
    };

    console.log(`[QB SYNC COMPLETE] ${vendors.length} vendors, ${bills.length} bills\n`);
    return result;
  } catch (err) {
    console.error(`[QB SYNC ERROR]`, err);
    throw err;
  }
}
