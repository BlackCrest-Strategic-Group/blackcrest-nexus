import multer from 'multer';
import logger from '../services/logging/logger.js';

export function notFoundHandler(req, res) {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Endpoint not found', code: 'NOT_FOUND' });
  }
  return res.status(404).end();
}

export function errorHandler(err, req, res, _next) {
  logger.error('api_request_failed', {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || 500,
    error: err.message
  });

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message || 'Invalid upload payload', code: 'UPLOAD_ERROR' });
  }

  if (err.statusCode && err.expose) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code || 'REQUEST_ERROR' });
  }

  return res.status(500).json({ message: 'Unexpected server error', code: 'SERVER_ERROR' });
}

export default errorHandler;
