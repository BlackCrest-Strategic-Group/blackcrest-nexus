const express = require('express');
const router = express.Router();

router.get('/', (_, res) => {
  res.json({ module: 'sourcing', data: [{ id: 1, name: 'sourcing item', status: 'active' }], generatedAt: new Date().toISOString() });
});

module.exports = router;
