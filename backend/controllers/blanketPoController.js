import { isSupportedSpreadsheet, parseExcel } from "../services/blanketpo/parseExcel.js";
import { validateBlanketData } from "../services/blanketpo/validateBlanketData.js";

export function uploadBlanketPo(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        error: "Spreadsheet file is required"
      });
    }

    if (!isSupportedSpreadsheet(req.file.originalname)) {
      return res.status(400).json({
        success: false,
        error: "Unsupported file type. Allowed file types: .xlsx, .xls, .csv"
      });
    }

    const { sheetName, rawRows, mappedRows, missingColumns } = parseExcel(req.file.buffer);
    const { validRows, errors } = validateBlanketData(mappedRows, missingColumns);

    const summary = {
      sheetName,
      totalRows: mappedRows.length,
      validRows: validRows.length,
      invalidRows: mappedRows.length - validRows.length,
      missingColumns
    };

    return res.status(200).json({
      success: true,
      rawRows,
      mappedRows,
      errors,
      summary
    });
  } catch (error) {
    console.error("[blanket-po/upload] error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to process blanket PO upload"
    });
  }
}
