const parseNumber = (value, defaultValue = null) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : defaultValue;
  }

  const normalized = String(value).replace(/[$,%\s,]/g, '').trim();
  if (!normalized) {
    return defaultValue;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const parsePercentage = (value, defaultValue = 0) => {
  const parsed = parseNumber(value, defaultValue);
  return parsed === null ? defaultValue : parsed;
};

const cleanString = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
};

module.exports = {
  parseNumber,
  parsePercentage,
  cleanString
};
