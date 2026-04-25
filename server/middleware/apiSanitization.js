const blockedKeys = new Set(['__proto__', 'prototype', 'constructor']);

function sanitizeObject(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item));
  }

  if (value && typeof value === 'object') {
    const output = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      if (blockedKeys.has(key)) continue;
      output[key] = sanitizeObject(nestedValue);
    }
    return output;
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return value;
}

export function sanitizeApiInput(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  return next();
}

export default sanitizeApiInput;
