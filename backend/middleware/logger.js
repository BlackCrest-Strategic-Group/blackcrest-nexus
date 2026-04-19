export function requestLogger(req, _res, next) {
  req.requestStartedAt = Date.now();
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
}

export function responseLogger(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    const duration = Date.now() - (req.requestStartedAt || Date.now());
    console.log(`[RES] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    return originalJson(payload);
  };
  next();
}
