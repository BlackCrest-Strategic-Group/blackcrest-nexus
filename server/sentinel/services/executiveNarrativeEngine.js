export function buildExecutiveNarratives({ marginLeak, supplierRisks, activeAlerts = [] }) {
  const worstSupplier = supplierRisks[0];
  const highestDriver = marginLeak?.topDrivers?.[0];

  const headline = highestDriver
    ? `Margin exposure is trending up, led by ${highestDriver.driver} pressure.`
    : 'Margin exposure remains stable this week.';

  const supplierLine = worstSupplier
    ? `Supplier concentration risk is elevated around ${worstSupplier.supplierName} in ${worstSupplier.category}.`
    : 'Supplier concentration risk remains within operating thresholds.';

  const alertLine = `Sentinel is tracking ${activeAlerts.length} active intelligence alerts requiring human review.`;

  return [headline, supplierLine, alertLine];
}
