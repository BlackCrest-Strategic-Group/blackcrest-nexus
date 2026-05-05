const express = require('express');
const router = express.Router();

router.get('/', (_, res) => {
  res.json({ module: 'procurement', data: [{ id: 1, name: 'procurement item', status: 'active' }], generatedAt: new Date().toISOString() });
});

module.exports = router;
