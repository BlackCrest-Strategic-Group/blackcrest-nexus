const allowedExtensions = new Set(['.xlsx', '.xls', '.csv']);
const allowedMimeTypes = new Set([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/csv',
  'application/octet-stream'
]);

function hasAllowedExtension(filename = '') {
  const lowered = filename.toLowerCase();
  return [...allowedExtensions].some((ext) => lowered.endsWith(ext));
}

export function validateSpreadsheetUpload(req, res, next) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, error: 'File is required' });
  }

  if (!hasAllowedExtension(file.originalname || '')) {
    return res.status(400).json({ success: false, error: 'Invalid file extension' });
  }

  if (file.mimetype && !allowedMimeTypes.has(file.mimetype)) {
    return res.status(400).json({ success: false, error: 'Invalid file type' });
  }

  if (!file.buffer || file.buffer.length === 0) {
    return res.status(400).json({ success: false, error: 'Uploaded file is empty' });
  }

  return next();
}

export default validateSpreadsheetUpload;
