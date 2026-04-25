function buildError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = 'VALIDATION_ERROR';
  error.expose = true;
  return error;
}

export function validateRequest({ body, params, query } = {}) {
  return (req, _res, next) => {
    try {
      if (typeof body === 'function') body(req.body, req);
      if (typeof params === 'function') params(req.params, req);
      if (typeof query === 'function') query(req.query, req);
      return next();
    } catch (err) {
      return next(buildError(err.message || 'Invalid request payload'));
    }
  };
}

export default validateRequest;
