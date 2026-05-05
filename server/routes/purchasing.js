const express = require('express');
const router = express.Router();

router.get('/', (_, res) => {
  res.json({ module: 'purchasing', data: [{ id: 1, name: 'purchasing item', status: 'active' }], generatedAt: new Date().toISOString() });
});

module.exports = router;
