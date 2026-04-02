/**
 * Truth Serum Service
 * Provides helper functions for calculating supplier performance metrics
 * and building aggregated summaries.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Calculates derived performance metrics from raw delivery data.
 *
 * @param {object} record - Raw payload with date fields
 * @param {string|Date} record.promisedDate
 * @param {string|Date} record.actualDeliveryDate
 * @param {string|Date} [record.erpReceiptDate]
 * @returns {{ delayDays: number, onTime: boolean, receiptLagDays: number }}
 */
export function calculatePerformanceMetrics(record) {
  const promised = new Date(record.promisedDate);
  const actual = new Date(record.actualDeliveryDate);

  const delayMs = actual - promised;
  const delayDays = Math.round(delayMs / MS_PER_DAY);
  const onTime = actual <= promised;

  let receiptLagDays = 0;
  if (record.erpReceiptDate) {
    const receipt = new Date(record.erpReceiptDate);
    const lagMs = receipt - actual;
    receiptLagDays = Math.max(0, Math.round(lagMs / MS_PER_DAY));
  }

  return { delayDays, onTime, receiptLagDays };
}

/**
 * Aggregates an array of SupplierPerformance records into a summary object.
 *
 * @param {object[]} records - Array of SupplierPerformance documents
 * @returns {object} Summary with on-time rate, average delay, total records, etc.
 */
export function buildSupplierSummary(records) {
  const total = records.length;
  if (total === 0) {
    return {
      totalRecords: 0,
      onTimeCount: 0,
      lateCount: 0,
      onTimeRate: 0,
      averageDelayDays: 0,
      averageReceiptLagDays: 0,
    };
  }

  const onTimeCount = records.filter((r) => r.onTime).length;
  const lateCount = total - onTimeCount;
  const onTimeRate = Math.round((onTimeCount / total) * 100);

  const totalDelayDays = records.reduce((sum, r) => sum + (r.delayDays || 0), 0);
  const averageDelayDays = Math.round(totalDelayDays / total);

  const totalReceiptLagDays = records.reduce((sum, r) => sum + (r.receiptLagDays || 0), 0);
  const averageReceiptLagDays = Math.round(totalReceiptLagDays / total);

  return {
    totalRecords: total,
    onTimeCount,
    lateCount,
    onTimeRate,
    averageDelayDays,
    averageReceiptLagDays,
  };
}
