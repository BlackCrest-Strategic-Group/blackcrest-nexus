function normalizedKey(value) {
  return String(value || "").trim().toLowerCase();
}

function hasValidDate(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function toTimestamp(value) {
  const date = new Date(value);
  return date.getTime();
}

export function validateBlanketData(rows = [], missingColumns = []) {
  const validationErrors = [];
  const warnings = [];

  if (missingColumns.length) {
    validationErrors.push({
      type: "missing_columns",
      message: `Missing required columns: ${missingColumns.join(", ")}`
    });

    return {
      validRows: [],
      validationErrors,
      warnings
    };
  }

  const duplicateSet = new Set();
  const validRows = [];

  rows.forEach((row) => {
    const errors = [];

    if (!row.supplier) errors.push("supplier is required");
    if (!row.item) errors.push("item is required");
    if (!Number.isFinite(row.qty) || row.qty <= 0) errors.push("qty must be a positive number");
    if (!Number.isFinite(row.unitPrice) || row.unitPrice < 0) errors.push("unitPrice must be zero or greater");
    if (!hasValidDate(row.releaseDate)) errors.push("releaseDate must be a valid date");

    const hasStart = hasValidDate(row.blanketStartDate);
    const hasEnd = hasValidDate(row.blanketEndDate);

    if (row.blanketStartDate && !hasStart) errors.push("blanketStartDate is invalid");
    if (row.blanketEndDate && !hasEnd) errors.push("blanketEndDate is invalid");

    if (hasStart && hasEnd && toTimestamp(row.blanketStartDate) > toTimestamp(row.blanketEndDate)) {
      errors.push("blanketStartDate must be on or before blanketEndDate");
    }

    if (hasStart && hasValidDate(row.releaseDate) && toTimestamp(row.releaseDate) < toTimestamp(row.blanketStartDate)) {
      errors.push("releaseDate cannot be earlier than blanketStartDate");
    }

    if (hasEnd && hasValidDate(row.releaseDate) && toTimestamp(row.releaseDate) > toTimestamp(row.blanketEndDate)) {
      errors.push("releaseDate cannot be later than blanketEndDate");
    }

    const duplicateKey = [
      normalizedKey(row.supplier),
      normalizedKey(row.item),
      row.qty,
      row.unitPrice,
      row.releaseDate
    ].join("|");

    if (duplicateSet.has(duplicateKey)) {
      warnings.push({
        type: "duplicate_row",
        rowNumber: row.rowNumber,
        message: "Potential duplicate row detected"
      });
    } else {
      duplicateSet.add(duplicateKey);
    }

    if (errors.length) {
      validationErrors.push({
        type: "validation",
        rowNumber: row.rowNumber,
        message: errors.join("; ")
      });
      return;
    }

    validRows.push(row);
  });

  return {
    validRows,
    validationErrors,
    warnings
  };
}
