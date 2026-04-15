import path from "path";
import xlsx from "xlsx";

const SUPPORTED_EXTENSIONS = new Set([".xlsx", ".xls", ".csv"]);

const COLUMN_MAP = {
  supplier: ["supplier"],
  partNumber: ["part number", "partnumber", "part #", "part no", "part"],
  description: ["description", "item description"],
  qty: ["qty", "quantity"],
  unitPrice: ["unit price", "price", "unitprice"],
  releaseDate: ["release date", "release", "date"],
  uom: ["uom", "unit of measure", "unit"],
  blanketStartDate: ["blanket start date", "start date", "blanket start"],
  blanketEndDate: ["blanket end date", "end date", "blanket end"]
};

export function isSupportedSpreadsheet(filename = "") {
  const extension = path.extname(filename || "").toLowerCase();
  return SUPPORTED_EXTENSIONS.has(extension);
}

function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function resolveHeaderMap(headers = []) {
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

function parseExcelDate(value) {
  if (value == null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    const parsed = xlsx.SSF.parse_date_code(value);
    if (parsed) {
      const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toNumber(value) {
  if (value == null || value === "") return NaN;
  if (typeof value === "number") return value;
  const normalized = String(value).replace(/[$,]/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function parseExcel(buffer) {
  const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return {
      sheetName: null,
      rawRows: [],
      mappedRows: [],
      resolvedHeaders: {},
      missingColumns: []
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(sheet, {
    defval: "",
    raw: true,
    blankrows: false
  });

  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const resolvedHeaders = resolveHeaderMap(headers);

  const mappedRows = rawRows.map((row, index) => ({
    rowNumber: index + 2,
    supplier: String(row[resolvedHeaders.supplier] ?? "").trim(),
    partNumber: String(row[resolvedHeaders.partNumber] ?? "").trim(),
    description: String(row[resolvedHeaders.description] ?? "").trim(),
    qty: toNumber(row[resolvedHeaders.qty]),
    unitPrice: toNumber(row[resolvedHeaders.unitPrice]),
    releaseDate: parseExcelDate(row[resolvedHeaders.releaseDate]),
    uom: String(row[resolvedHeaders.uom] ?? "").trim(),
    blanketStartDate: parseExcelDate(row[resolvedHeaders.blanketStartDate]),
    blanketEndDate: parseExcelDate(row[resolvedHeaders.blanketEndDate])
  }));

  const requiredColumns = ["supplier", "partNumber", "qty", "unitPrice"];
  const missingColumns = requiredColumns.filter((column) => !resolvedHeaders[column]);

  return {
    sheetName,
    rawRows,
    mappedRows,
    resolvedHeaders,
    missingColumns
  };
}
