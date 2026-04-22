const WEIGHTS = {
  authReliability: 30,
  navigationStability: 25,
  uploadAnalysisSuccess: 20,
  consoleNetworkCleanliness: 15,
  mobileUiSanity: 10
};

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function ratio(passed, total) {
  if (!total) return 100;
  return (passed / total) * 100;
}

export function calculateDemoReadiness(summary) {
  const { totals = {}, categories = {} } = summary;

  const authReliability = ratio(categories.auth?.passed || 0, categories.auth?.total || 0);
  const navigationStability = ratio(categories.navigation?.passed || 0, categories.navigation?.total || 0);
  const uploadAnalysisSuccess = ratio(categories.analysis?.passed || 0, categories.analysis?.total || 0);

  const cleanlinessPenalties = (totals.consoleErrors || 0) * 2 + (totals.pageErrors || 0) * 3 + (totals.failedApiResponses || 0);
  const consoleNetworkCleanliness = clamp(100 - cleanlinessPenalties);

  const mobileUiSanity = ratio(categories.mobile?.passed || 0, categories.mobile?.total || 0);

  const weighted = (
    authReliability * WEIGHTS.authReliability +
    navigationStability * WEIGHTS.navigationStability +
    uploadAnalysisSuccess * WEIGHTS.uploadAnalysisSuccess +
    consoleNetworkCleanliness * WEIGHTS.consoleNetworkCleanliness +
    mobileUiSanity * WEIGHTS.mobileUiSanity
  ) / 100;

  return {
    score: Number(weighted.toFixed(2)),
    breakdown: {
      authReliability: Number(authReliability.toFixed(2)),
      navigationStability: Number(navigationStability.toFixed(2)),
      uploadAnalysisSuccess: Number(uploadAnalysisSuccess.toFixed(2)),
      consoleNetworkCleanliness: Number(consoleNetworkCleanliness.toFixed(2)),
      mobileUiSanity: Number(mobileUiSanity.toFixed(2))
    },
    weights: WEIGHTS
  };
}
