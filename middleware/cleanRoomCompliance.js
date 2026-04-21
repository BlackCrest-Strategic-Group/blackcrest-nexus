const RESTRICTED_KEYWORDS = ["internal", "proprietary", "confidential", "ERP", "SAP"];
const DISCLAIMER = "This analysis is based solely on user-provided and publicly available data.";

function containsRestrictedTerms(value) {
  if (value == null) return false;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return RESTRICTED_KEYWORDS.some((term) => lower.includes(term.toLowerCase()));
  }
  if (Array.isArray(value)) {
    return value.some((item) => containsRestrictedTerms(item));
  }
  if (typeof value === 'object') {
    return Object.values(value).some((item) => containsRestrictedTerms(item));
  }
  return false;
}

export function cleanRoomCompliance(req, res, next) {
  const combinedInput = {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      'x-data-source': req.get('x-data-source') || ''
    }
  };

  if (containsRestrictedTerms(combinedInput)) {
    return res.status(400).json({
      error: 'Proprietary or restricted data is not permitted.',
      disclaimer: DISCLAIMER
    });
  }

  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      return originalJson({ ...payload, disclaimer: payload.disclaimer || DISCLAIMER });
    }
    return originalJson({ data: payload, disclaimer: DISCLAIMER });
  };

  return next();
}

export { DISCLAIMER, RESTRICTED_KEYWORDS };
