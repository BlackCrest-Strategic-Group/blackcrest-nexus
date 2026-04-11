/**
 * Capacity Assessment Service
 *
 * Evaluates a company's available capacity after accounting for current
 * utilization and any Lean-driven hours savings.
 */

/**
 * @param {number} monthlyCapacityHours  - Total monthly capacity hours for the team.
 * @param {number} currentUtilization    - Current utilization as a percentage (0–100).
 * @param {number} leanSavingsHours      - Monthly hours freed up through Lean improvements.
 * @returns {{ availableCapacity: number, adjustedUtilization: number, status: string }}
 */
export function assessCapacity(monthlyCapacityHours, currentUtilization, leanSavingsHours) {
  if (
    typeof monthlyCapacityHours !== "number" ||
    typeof currentUtilization !== "number" ||
    typeof leanSavingsHours !== "number"
  ) {
    throw new Error("assessCapacity: all arguments must be numbers");
  }

  const usedHours = monthlyCapacityHours * (currentUtilization / 100);
  const availableCapacity = monthlyCapacityHours - usedHours + leanSavingsHours;
  const adjustedUtilization =
    monthlyCapacityHours > 0
      ? ((usedHours - leanSavingsHours) / monthlyCapacityHours) * 100
      : 0;

  let status;
  if (adjustedUtilization < 70) {
    status = "GREEN";
  } else if (adjustedUtilization <= 85) {
    status = "YELLOW";
  } else {
    status = "RED";
  }

  return {
    availableCapacity: Math.round(availableCapacity * 100) / 100,
    adjustedUtilization: Math.round(adjustedUtilization * 100) / 100,
    status
  };
}
