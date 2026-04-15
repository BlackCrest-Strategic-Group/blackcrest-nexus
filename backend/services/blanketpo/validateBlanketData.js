const REQUIRED_FIELDS = ["supplier", "partNumber", "qty", "unitPrice"];

function buildDuplicateKey(row) {
  return [
    row.supplier?.toLowerCase(),
    row.partNumber?.toLowerCase(),
    row.description?.toLowerCase(),
    row.uom?.toLowerCase(),
    row.qty,
    row.unitPrice,
    row.releaseDate,
    row.blanketStartDate,
    row.blanketEndDate
  ].join("|");
}

export function validateBlanketData(rows = [], missingColumns = []) {
  const errors = [];

  if (missingColumns.length > 0) {
    errors.push({
      type: "missing_columns",
      message: `Missing required columns: ${missingColumns.join(", ")}`
    });
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

    if (!Number.isFinite(row.unitPrice) || row.unitPrice < 0) {
      rowErrors.push("unitPrice must be a number greater than or equal to 0");
    }

    if (row.releaseDate && Number.isNaN(new Date(row.releaseDate).getTime())) {
      rowErrors.push("releaseDate must be a valid date");
    }

    if (row.blanketStartDate && Number.isNaN(new Date(row.blanketStartDate).getTime())) {
      rowErrors.push("blanketStartDate must be a valid date");
    }

    if (row.blanketEndDate && Number.isNaN(new Date(row.blanketEndDate).getTime())) {
      rowErrors.push("blanketEndDate must be a valid date");
    }

    if (row.blanketStartDate && row.blanketEndDate) {
      const start = new Date(row.blanketStartDate);
      const end = new Date(row.blanketEndDate);
      if (start > end) {
        rowErrors.push("blanketStartDate must be before or equal to blanketEndDate");
      }
    }

    const duplicateKey = buildDuplicateKey(row);
    if (seenDuplicates.has(duplicateKey)) {
      rowErrors.push("duplicate line detected");
    } else {
      seenDuplicates.add(duplicateKey);
    }

    if (rowErrors.length > 0 || missingColumns.length > 0) {
      errors.push({
        type: "validation",
        rowNumber: row.rowNumber,
        message: rowErrors.join("; ") || "Row skipped because required columns are missing"
      });
      continue;
    }

    validRows.push(row);
  }

  return {
    validRows,
    errors
  };
}
