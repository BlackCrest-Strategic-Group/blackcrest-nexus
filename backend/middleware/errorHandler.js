export function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'API route not found' });
  }
  return next();
}

export function errorHandler(err, _req, res, _next) {
  console.error('[ERROR]', err);
  return res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
}
