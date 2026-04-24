import path from "path";
import { createRequire } from "module";
import { getMissingRequiredColumns, resolveColumnMap } from "./mapColumns.js";

const require = createRequire(import.meta.url);
let xlsx;

try {
  xlsx = require("xlsx");
} catch (error) {
  if (error?.code !== "MODULE_NOT_FOUND") {
    throw error;
  }
}

function parseExcelDate(value) {
  if (value == null || value === "") return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    const parsed = xlsx?.SSF?.parse_date_code ? xlsx.SSF.parse_date_code(value) : null;
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

  const normalized = String(value)
    .replace(/[$,]/g, "")
    .trim();

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function isSupportedFile(filename = "") {
  const ext = path.extname(filename).toLowerCase();
  return [".xlsx", ".xls", ".csv"].includes(ext);
}

export function parseExcel(file) {
  if (!xlsx) {
    const dependencyError = new Error(
      "Missing optional dependency 'xlsx'. Install it with `npm install xlsx` to process blanket PO spreadsheets."
    );
    dependencyError.code = "MISSING_OPTIONAL_DEPENDENCY";
    throw dependencyError;
  }

  const { buffer, originalname = "" } = file || {};
  if (!buffer || !isSupportedFile(originalname)) {
    return {
      rows: [],
      missingColumns: ["supplier", "item", "qty", "unitPrice", "releaseDate"],
      sheetName: null
    };
  }

  const workbook = xlsx.read(buffer, {
    type: "buffer",
    cellDates: true,
    raw: true,
    codepage: 65001
  });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      rows: [],
      missingColumns: ["supplier", "item", "qty", "unitPrice", "releaseDate"],
      sheetName: null
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rawRows = xlsx.utils.sheet_to_json(sheet, {
    defval: "",
    blankrows: false,
    raw: true
  });

  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const mappedColumns = resolveColumnMap(headers);
  const missingColumns = getMissingRequiredColumns(mappedColumns);

  const rows = rawRows.map((row, index) => {
    const releaseDate = parseExcelDate(row[mappedColumns.releaseDate]);
    const blanketStartDate = parseExcelDate(row[mappedColumns.blanketStartDate]);
    const blanketEndDate = parseExcelDate(row[mappedColumns.blanketEndDate]);

    return {
      rowNumber: index + 2,
      supplier: String(row[mappedColumns.supplier] ?? "").trim(),
      item: String(row[mappedColumns.item] ?? "").trim(),
      qty: toNumber(row[mappedColumns.qty]),
      unitPrice: toNumber(row[mappedColumns.unitPrice]),
      releaseDate,
      blanketStartDate,
      blanketEndDate,
      description: String(row[mappedColumns.description] ?? "").trim(),
      uom: String(row[mappedColumns.uom] ?? "").trim()
    };
  });

  return {
    rows,
    missingColumns,
    sheetName,
    mappedColumns
  };
}
