import crypto from 'crypto';

export function requestContext(req, res, next) {
  req.requestId = crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  return next();
}

export default requestContext;
