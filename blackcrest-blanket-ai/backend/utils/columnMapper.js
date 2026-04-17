const FIELD_ALIASES = {
  item: ['item', 'part', 'material', 'sku', 'item number'],
  vendor: ['vendor', 'supplier', 'vendor name'],
  quantityToOrder: ['qty', 'quantity', 'qty to order', 'quantity to order', 'order qty'],
  scrapPercentage: ['scrap', 'scrap percentage', 'scrap %'],
  pricing: ['pricing', 'unit price', 'price', 'cost'],
  demand: ['demand', 'current demand', 'forecast demand'],
  project: ['project', 'project id'],
  task: ['task', 'task id', 'work package'],
  needDate: ['need date', 'required date', 'due date'],
  uom: ['uom', 'unit', 'unit of measure'],
  description: ['description', 'item description'],
  buyer: ['buyer', 'purchaser'],
  leadTime: ['lead time', 'leadtime', 'days lead time']
};

const normalizeHeader = (header = '') =>
  String(header)
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildColumnMap = (headers = []) => {
  const normalizedHeaders = headers.map((h) => normalizeHeader(h));
  const mapping = {};

  Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
    const index = normalizedHeaders.findIndex((header) => aliases.includes(header));
    mapping[field] = index >= 0 ? headers[index] : null;
  });

  return mapping;
};

module.exports = {
  FIELD_ALIASES,
  normalizeHeader,
  buildColumnMap
};
