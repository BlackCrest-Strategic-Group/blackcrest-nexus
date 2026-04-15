import { parseExcel } from "../services/blanketpo/parseExcel.js";
import { validateBlanketData } from "../services/blanketpo/validateBlanketData.js";
import { buildBlanketStructure } from "../services/blanketpo/buildBlanketStructure.js";

export function uploadBlanketPo(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        error: "Excel file is required"
      });
    }

    const { rows, missingColumns } = parseExcel(req.file.buffer);
    const { validRows, errors } = validateBlanketData(rows, missingColumns);
    const { header, lines } = buildBlanketStructure(validRows);

    return res.status(200).json({
      success: true,
      header,
      lines,
      errors
    });
  } catch (error) {
    console.error("[blanket-po/upload] error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to process blanket PO upload"
    });
  }
}
