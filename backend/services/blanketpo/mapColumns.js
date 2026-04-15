const INTERNAL_FIELD_ALIASES = {
  supplier: [
    "supplier",
    "supplier name",
    "vendor",
    "vendor name",
    "manufacturer",
    "seller"
  ],
  item: [
    "item",
    "item number",
    "item no",
    "part",
    "part number",
    "part no",
    "part #",
    "sku",
    "product code",
    "material"
  ],
  qty: [
    "qty",
    "quantity",
    "order qty",
    "release qty",
    "units",
    "amount"
  ],
  unitPrice: [
    "unit price",
    "price",
    "unit cost",
    "cost",
    "unitprice",
    "rate"
  ],
  releaseDate: [
    "release date",
    "need by",
    "delivery date",
    "ship date",
    "date"
  ],
  blanketStartDate: [
    "blanket start",
    "blanket start date",
    "start date",
    "po start",
    "agreement start"
  ],
  blanketEndDate: [
    "blanket end",
    "blanket end date",
    "end date",
    "po end",
    "agreement end",
    "expiration date"
  ],
  description: [
    "description",
    "item description",
    "details",
    "line description"
  ],
  uom: [
    "uom",
    "unit",
    "unit of measure",
    "measure"
  ]
};

export function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function resolveColumnMap(headers = []) {
  const normalizedToOriginal = new Map();

  headers.forEach((header) => {
    normalizedToOriginal.set(normalizeHeader(header), header);
  });

  const resolved = {};

  for (const [field, aliases] of Object.entries(INTERNAL_FIELD_ALIASES)) {
    const match = aliases.find((alias) => normalizedToOriginal.has(alias));
    if (match) {
      resolved[field] = normalizedToOriginal.get(match);
    }
  }

  return resolved;
}

export function getMissingRequiredColumns(resolvedMap = {}) {
  const required = ["supplier", "item", "qty", "unitPrice", "releaseDate"];
  return required.filter((field) => !resolvedMap[field]);
}
