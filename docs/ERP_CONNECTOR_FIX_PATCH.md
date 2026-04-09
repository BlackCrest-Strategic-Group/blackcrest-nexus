# ERP Connector Fix Patch

Use the following changes to enforce hard read-only behavior in all ERP connectors.

## Goal

- keep token-based authentication
- keep encrypted token storage
- allow read-only GET access
- block all write operations even if a future route tries to call them

## 1) backend/connectors/infor.js

Replace the write helper and write export with the following pattern:

```js
import axios from "axios";

const ERP_READ_ONLY = process.env.ERP_READ_ONLY !== "false";

function assertReadOnly(path, method = "WRITE") {
  if (ERP_READ_ONLY) {
    throw new Error(`Infor SyteLine: ${method} operations are disabled in read-only ERP mode for ${path}.`);
  }
}

async function ionGet(tenantUrl, path, accessToken, params = {}) {
  const url = `${tenantUrl.replace(/\/$/, "")}${path}`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    params,
    timeout: 20000
  });
  return response.data;
}

async function ionPost(tenantUrl, path, accessToken, body) {
  assertReadOnly(path, "POST");
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

export async function createPurchaseOrder(tenantUrl, accessToken, orderData) {
  assertReadOnly("/api/v1/procurement/purchase-orders", "POST");
  return ionPost(tenantUrl, "/api/v1/procurement/purchase-orders", accessToken, orderData);
}
```

## 2) backend/connectors/oracle.js

```js
import axios from "axios";

const ERP_READ_ONLY = process.env.ERP_READ_ONLY !== "false";

function assertReadOnly(path, method = "WRITE") {
  if (ERP_READ_ONLY) {
    throw new Error(`Oracle ERP: ${method} operations are disabled in read-only ERP mode for ${path}.`);
  }
}

async function erpPost(tenantUrl, path, accessToken, body) {
  assertReadOnly(path, "POST");
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

export async function createPurchaseOrder(tenantUrl, accessToken, orderData) {
  assertReadOnly("/fscmRestApi/resources/11.13.18.05/purchaseOrders", "POST");
  return erpPost(
    tenantUrl,
    "/fscmRestApi/resources/11.13.18.05/purchaseOrders",
    accessToken,
    orderData
  );
}
```

## 3) backend/connectors/sap.js

```js
import axios from "axios";

const ERP_READ_ONLY = process.env.ERP_READ_ONLY !== "false";

function assertReadOnly(path, method = "WRITE") {
  if (ERP_READ_ONLY) {
    throw new Error(`SAP ERP: ${method} operations are disabled in read-only ERP mode for ${path}.`);
  }
}

async function odataPost(tenantUrl, path, accessToken, body) {
  assertReadOnly(path, "POST");
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

export async function createPurchaseOrder(tenantUrl, accessToken, orderData) {
  assertReadOnly(
    "/sap/opu/odata4/sap/api_purchase_order_2/srvd_a2x/sap/purchase_order/0001/PurchaseOrder",
    "POST"
  );
  return odataPost(
    tenantUrl,
    "/sap/opu/odata4/sap/api_purchase_order_2/srvd_a2x/sap/purchase_order/0001/PurchaseOrder",
    accessToken,
    orderData
  );
}
```

## 4) .env / Render environment variable

Add:

```env
ERP_READ_ONLY=true
```

## 5) Optional route-level hard stop in backend/routes/erp.js

Add a write-guard even though no write routes currently exist:

```js
const enforceReadOnlyErp = (req, res, next) => {
  const method = req.method.toUpperCase();
  const allowedWriteEndpoints = new Set(["/", "/:id/reconnect", "/:id/test"]);

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const safePath = req.route?.path;
    if (!allowedWriteEndpoints.has(safePath)) {
      return res.status(403).json({
        success: false,
        error: "ERP write operations are disabled. This integration is read-only."
      });
    }
  }

  next();
};

router.use(enforceReadOnlyErp);
```

## Why this fixes the issue

- token-based auth stays intact
- credentials still are not stored
- accidental future ERP writes are blocked
- sales conversation becomes easier because the connector is provably read-only

## Best setting for production

Keep `ERP_READ_ONLY=true` in production and never advertise a write mode unless you later build separate admin-only write workflows with much tighter controls.
