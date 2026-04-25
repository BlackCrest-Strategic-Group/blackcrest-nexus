import logger from '../services/logging/logger.js';

export function requestLogger(req, res, next) {
  const startedAt = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    logger.info('api_request_completed', {
      requestId: req.requestId,
      method,
      path: originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip
    });
  });

  return next();
}

export default requestLogger;
