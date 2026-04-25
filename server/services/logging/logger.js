const redactPattern = /(authorization|token|password|secret|api[_-]?key)/i;

function sanitizeMeta(meta = {}) {
  const output = {};
  for (const [key, value] of Object.entries(meta)) {
    output[key] = redactPattern.test(key) ? '[REDACTED]' : value;
  }
  return output;
}

function log(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizeMeta(meta)
  };
  // Keep stdout/stderr behavior compatible with Render log pipelines.
  const serialized = JSON.stringify(entry);
  if (level === 'error') {
    console.error(serialized);
  } else {
    console.log(serialized);
  }
}

export const logger = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta)
};

export default logger;
