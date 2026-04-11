import SupplierPerformance from "../models/SupplierPerformance.js";
import {
  calculatePerformanceMetrics,
  buildSupplierSummary,
} from "../services/truthSerumService.js";

/**
 * POST /api/supplierPerformance
 * Ingest a single supplier performance record.
 */
export async function ingestPerformanceRecord(req, res) {
  try {
    const payload = req.body;

    const metrics = calculatePerformanceMetrics(payload);

    const record = await SupplierPerformance.create({
      supplierId: payload.supplierId,
      supplierName: payload.supplierName,
      poNumber: payload.poNumber,
      trackingNumber: payload.trackingNumber || "",
      carrier: payload.carrier || "Other",
      promisedDate: payload.promisedDate,
      actualDeliveryDate: payload.actualDeliveryDate,
      erpReceiptDate: payload.erpReceiptDate || null,
      source: payload.source || "manual",
      notes: payload.notes || "",
      ...metrics,
    });

    return res.status(201).json({
      success: true,
      message: "Truth Serum performance record created",
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to ingest performance record",
    });
  }
}

/**
 * POST /api/supplierPerformance/bulk
 * Bulk ingest multiple supplier performance records.
 */
export async function bulkIngestPerformanceRecords(req, res) {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "records array is required",
      });
    }

    const prepared = records.map((record) => {
      const metrics = calculatePerformanceMetrics(record);

      return {
        supplierId: record.supplierId,
        supplierName: record.supplierName,
        poNumber: record.poNumber,
        trackingNumber: record.trackingNumber || "",
        carrier: record.carrier || "Other",
        promisedDate: record.promisedDate,
        actualDeliveryDate: record.actualDeliveryDate,
        erpReceiptDate: record.erpReceiptDate || null,
        source: record.source || "manual",
        notes: record.notes || "",
        ...metrics,
      };
    });

    const inserted = await SupplierPerformance.insertMany(prepared, { ordered: false });

    return res.status(201).json({
      success: true,
      message: "Truth Serum bulk ingest complete",
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Bulk ingest failed",
    });
  }
}

/**
 * GET /api/supplierPerformance/supplier/:supplierId
 * Fetch truth score summary and recent records for a specific supplier.
 */
export async function getSupplierTruthScore(req, res) {
  try {
    const { supplierId } = req.params;

    const records = await SupplierPerformance.find({ supplierId }).sort({
      actualDeliveryDate: -1,
    });

    if (!records.length) {
      return res.status(404).json({
        success: false,
        message: "No Truth Serum records found for this supplier",
      });
    }

    const summary = buildSupplierSummary(records);

    return res.json({
      success: true,
      supplierId,
      supplierName: records[0].supplierName,
      summary,
      recentRecords: records.slice(0, 10),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch supplier truth score",
    });
  }
}

/**
 * GET /api/supplierPerformance/report
 * Generate a full truth serum report across all suppliers.
 */
export async function getTruthSerumReport(req, res) {
  try {
    const allRecords = await SupplierPerformance.find().sort({ actualDeliveryDate: -1 });

    if (!allRecords.length) {
      return res.json({
        success: true,
        message: "No performance records found",
        totalRecords: 0,
        suppliers: [],
        overallSummary: buildSupplierSummary([]),
      });
    }

    // Group records by supplierId
    const bySupplier = allRecords.reduce((acc, record) => {
      const key = record.supplierId.toString();
      if (!acc[key]) {
        acc[key] = { supplierName: record.supplierName, records: [] };
      }
      acc[key].records.push(record);
      return acc;
    }, {});

    const suppliers = Object.entries(bySupplier).map(([supplierId, { supplierName, records }]) => ({
      supplierId,
      supplierName,
      summary: buildSupplierSummary(records),
      recentRecords: records.slice(0, 10),
    }));

    const overallSummary = buildSupplierSummary(allRecords);

    return res.json({
      success: true,
      totalRecords: allRecords.length,
      suppliers,
      overallSummary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate Truth Serum report",
    });
  }
}
