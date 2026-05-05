const express = require('express');
const router = express.Router();

router.get('/', (_, res) => {
  res.json({ module: 'category', data: [{ id: 1, name: 'category item', status: 'active' }], generatedAt: new Date().toISOString() });
});

module.exports = router;
