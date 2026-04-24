import { buildBlanketStructure } from "../services/blanketpo/buildBlanketStructure.js";
import { parseExcel } from "../services/blanketpo/parseExcel.js";
import { validateBlanketData } from "../services/blanketpo/validateBlanketData.js";

function toCsvCell(value) {
  const text = value == null ? "" : String(value);
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function uploadBlanketPo(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        error: "Spreadsheet file is required"
      });
    }

    const { rows, missingColumns, mappedColumns, sheetName } = parseExcel(req.file);
    const { validRows, validationErrors, warnings } = validateBlanketData(rows, missingColumns);
    const { blankets, summary } = buildBlanketStructure(validRows);

    return res.status(200).json({
      success: true,
      sheetName,
      mappedColumns,
      blankets,
      validationErrors,
      warnings,
      summary: {
        ...summary,
        totalRows: rows.length,
        validRows: validRows.length,
        invalidRows: validationErrors.filter((entry) => entry.rowNumber).length
      }
    });
  } catch (error) {
    console.error("[blanket-po/upload] error:", error.message);
    const status = error?.code === "MISSING_OPTIONAL_DEPENDENCY" ? 503 : 500;
    return res.status(status).json({
      success: false,
      error: error?.code === "MISSING_OPTIONAL_DEPENDENCY"
        ? error.message
        : "Failed to process blanket PO upload"
    });
  }
}

export function exportBlanketCsv(req, res) {
  const { blankets = [] } = req.body || {};

  if (!Array.isArray(blankets) || blankets.length === 0) {
    return res.status(400).json({
      success: false,
      error: "blankets payload is required"
    });
  }

  const rows = [
    [
      "supplier",
      "blanketStartDate",
      "blanketEndDate",
      "item",
      "description",
      "uom",
      "unitPrice",
      "releaseDate",
      "qty",
      "lineValue"
    ]
  ];

  blankets.forEach((blanket) => {
    (blanket.items || []).forEach((item) => {
      (item.releases || []).forEach((release) => {
        rows.push([
          blanket.supplier,
          blanket.blanketStartDate,
          blanket.blanketEndDate,
          item.item,
          item.description,
          item.uom,
          item.unitPrice,
          release.releaseDate,
          release.qty,
          release.lineValue
        ]);
      });
    });
  });

  const csv = rows
    .map((row) => row.map((cell) => toCsvCell(cell)).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=blanket-po-export.csv");
  return res.status(200).send(csv);
}
