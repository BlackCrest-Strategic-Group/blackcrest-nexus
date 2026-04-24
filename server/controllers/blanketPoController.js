import axios from "axios";
import { buildBlanketStructure } from "../../backend/services/blanketpo/buildBlanketStructure.js";
import { parseExcel } from "../../backend/services/blanketpo/parseExcel.js";
import { validateBlanketData } from "../../backend/services/blanketpo/validateBlanketData.js";

function toCsvCell(value) {
  const text = value == null ? "" : String(value);
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

function mapExternalBlankets(blanketRecommendations = []) {
  return blanketRecommendations.map((recommendation) => ({
    supplier: recommendation.vendor || "Unknown Supplier",
    blanketStartDate: "",
    blanketEndDate: "",
    releaseCount: Number(recommendation.lineCount || 0),
    itemCount: Number(recommendation.includedItemCount || 0),
    totalValue: Number(recommendation.totalSpend || 0),
    items: []
  }));
}

function normalizeExternalUploadResponse(data = {}) {
  return {
    success: true,
    blankets: Array.isArray(data.blankets) ? data.blankets : mapExternalBlankets(data.blanketRecommendations),
    validationErrors: Array.isArray(data.validationErrors)
      ? data.validationErrors
      : (data.validationIssues || []).map((entry) => ({
          rowNumber: entry.rowNumber,
          message: Array.isArray(entry.issues) ? entry.issues.join("; ") : (entry.code || "validation_error")
        })),
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
    summary: data.summary || {
      suppliers: Number(data.blanketRecommendations?.length || 0),
      totalItems: Number(data.metrics?.uniqueItems || 0),
      totalReleases: Number(data.metrics?.lineCount || 0),
      totalValue: Number(data.metrics?.totalSpend || 0)
    }
  };
}

async function uploadToExternalBlanketBuilder(fileBuffer, originalName) {
  const endpoint = `${process.env.BLANKET_PO_BUILDER_URL.replace(/\/$/, "")}/upload`;
  const formData = new FormData();
  formData.append("file", new Blob([fileBuffer]), originalName || "blanket-po.xlsx");
  const response = await axios.post(endpoint, formData, {
    headers: formData.getHeaders ? formData.getHeaders() : undefined,
    timeout: 45_000
  });
  return normalizeExternalUploadResponse(response.data);
}

async function exportToExternalErp(provider, blankets = []) {
  const endpoint = `${process.env.BLANKET_PO_BUILDER_URL.replace(/\/$/, "")}/erp/${provider}/export`;
  const { data } = await axios.post(
    endpoint,
    { blanketRecommendations: blankets },
    { timeout: 30_000 }
  );
  return data;
}

export async function getBlanketPoHealth(_req, res) {
  const status = {
    localEngine: "ok",
    externalBuilder: {
      configured: Boolean(process.env.BLANKET_PO_BUILDER_URL),
      reachable: false,
      url: process.env.BLANKET_PO_BUILDER_URL || null
    }
  };

  if (!process.env.BLANKET_PO_BUILDER_URL) {
    return res.status(200).json(status);
  }

  try {
    const endpoint = `${process.env.BLANKET_PO_BUILDER_URL.replace(/\/$/, "")}/health`;
    await axios.get(endpoint, { timeout: 5_000 });
    status.externalBuilder.reachable = true;
  } catch (_error) {
    status.externalBuilder.reachable = false;
  }

  return res.status(200).json(status);
}

export async function uploadBlanketPo(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        error: "Spreadsheet file is required"
      });
    }

    if (process.env.BLANKET_PO_BUILDER_URL) {
      try {
        const externalResult = await uploadToExternalBlanketBuilder(req.file.buffer, req.file.originalname);
        return res.status(200).json({
          ...externalResult,
          engine: "external-blanket-builder"
        });
      } catch (externalError) {
        console.warn("[blanket-po] external builder unavailable, falling back to local parser:", externalError.message);
      }
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
      engine: "local",
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

export async function exportBlanketErp(req, res) {
  const { provider } = req.params;
  const supportedProviders = ["sap", "oracle", "infor", "dynamics"];
  if (!supportedProviders.includes(provider)) {
    return res.status(400).json({
      success: false,
      error: `Unsupported provider "${provider}". Supported providers: ${supportedProviders.join(", ")}`
    });
  }

  if (!process.env.BLANKET_PO_BUILDER_URL) {
    return res.status(501).json({
      success: false,
      error: "External blanket PO builder is not configured. Set BLANKET_PO_BUILDER_URL."
    });
  }

  try {
    const { blankets = [] } = req.body || {};
    if (!Array.isArray(blankets) || blankets.length === 0) {
      return res.status(400).json({
        success: false,
        error: "blankets payload is required"
      });
    }

    const mappedPayload = await exportToExternalErp(provider, blankets);
    return res.status(200).json({
      success: true,
      provider,
      mappedPayload
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: "Failed to export blanket PO payload to ERP adapter",
      details: error.message
    });
  }
}
