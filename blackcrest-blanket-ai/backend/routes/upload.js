const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const { processDemandRows } = require('../services/blanketService');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});

const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded. Provide a single Excel file as "file".' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return res.status(400).json({ message: 'Workbook has no worksheets.' });
    }

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values.slice(1).map((cell) => (cell || '').toString().trim());

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowData = {};
      headers.forEach((header, idx) => {
        rowData[header] = row.getCell(idx + 1).value?.text ?? row.getCell(idx + 1).value ?? '';
      });

      if (Object.values(rowData).some((value) => value !== null && value !== undefined && String(value).trim() !== '')) {
        rows.push(rowData);
      }
    });

    const result = processDemandRows(rows);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to process file.',
      error: error.message
    });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

module.exports = router;
