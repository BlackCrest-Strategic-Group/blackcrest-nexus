const REQUIRED_FIELDS = [
  "supplier",
  "partNumber",
  "description",
  "qty",
  "unitPrice",
  "releaseDate",
  "uom"
];

function buildDuplicateKey(row) {
  return [
    row.supplier?.toLowerCase(),
    row.partNumber?.toLowerCase(),
    row.description?.toLowerCase(),
    row.uom?.toLowerCase(),
    row.qty,
    row.unitPrice,
    row.releaseDate
  ].join("|");
}

export function validateBlanketData(rows = [], missingColumns = []) {
  const errors = [];

  if (missingColumns.length > 0) {
    errors.push({
      type: "missing_columns",
      message: `Missing required columns: ${missingColumns.join(", ")}`
    });
    return {
      validRows: [],
      errors
    };
  }

  const seenDuplicates = new Set();
  const validRows = [];

  for (const row of rows) {
    const rowErrors = [];

    for (const field of REQUIRED_FIELDS) {
      if (
        row[field] == null ||
        row[field] === "" ||
        (typeof row[field] === "number" && Number.isNaN(row[field]))
      ) {
        rowErrors.push(`${field} is required`);
      }
    }

    if (!Number.isFinite(row.qty) || row.qty <= 0) {
      rowErrors.push("qty must be greater than 0");
    }

    if (!Number.isFinite(row.unitPrice) || row.unitPrice <= 0) {
      rowErrors.push("unitPrice must be greater than 0");
    }

    if (!row.releaseDate || Number.isNaN(new Date(row.releaseDate).getTime())) {
      rowErrors.push("releaseDate must be a valid date");
    }

    const duplicateKey = buildDuplicateKey(row);
    if (seenDuplicates.has(duplicateKey)) {
      rowErrors.push("duplicate line detected");
    } else {
      seenDuplicates.add(duplicateKey);
    }

    if (rowErrors.length > 0) {
      errors.push({
        type: "validation",
        rowNumber: row.rowNumber,
        message: rowErrors.join("; ")
      });
      continue;
    }

    validRows.push(row);
  }

  const suppliers = new Set(validRows.map((row) => row.supplier.toLowerCase()));
  if (suppliers.size > 1) {
    errors.push({
      type: "validation",
      message: "Upload must contain a single supplier per blanket PO"
    });
  }

  return {
    validRows: suppliers.size > 1 ? [] : validRows,
    errors
  };
}
