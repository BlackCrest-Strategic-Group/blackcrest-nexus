export function validateOpportunityRequest(req, res, next) {
  const { text, noticeId, contractValue } = req.body || {};

  if (!text && !noticeId) {
    return res.status(400).json({ success: false, error: "Either 'text' or 'noticeId' is required." });
  }

  if (text && String(text).trim().length < 40) {
    return res.status(400).json({ success: false, error: "Opportunity text must be at least 40 characters." });
  }

  if (contractValue !== undefined && (Number.isNaN(Number(contractValue)) || Number(contractValue) < 0)) {
    return res.status(400).json({ success: false, error: "contractValue must be a positive number." });
  }

  return next();
}
