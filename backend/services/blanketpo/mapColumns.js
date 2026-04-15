export const COLUMN_MAP = {
  supplier: ["supplier"],
  partNumber: ["part number", "partnumber", "part #", "part no", "part"],
  description: ["description", "item description"],
  qty: ["qty", "quantity"],
  unitPrice: ["unit price", "price", "unitprice"],
  releaseDate: ["release date", "release", "date"],
  uom: ["uom", "unit of measure", "unit"]
};

export function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function resolveHeaderMap(headers = []) {
  const normalizedHeaders = headers.reduce((acc, header) => {
    acc[normalizeHeader(header)] = header;
    return acc;
  }, {});

  const resolved = {};

  for (const [field, aliases] of Object.entries(COLUMN_MAP)) {
    const matchedAlias = aliases.find((alias) => normalizedHeaders[alias]);
    if (matchedAlias) {
      resolved[field] = normalizedHeaders[matchedAlias];
    }
  }

  return resolved;
}
