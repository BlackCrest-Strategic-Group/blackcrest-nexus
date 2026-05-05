const express = require('express');
const router = express.Router();

router.get('/', (_, res) => {
  res.json({ module: 'proposal', data: [{ id: 1, name: 'proposal item', status: 'active' }], generatedAt: new Date().toISOString() });
});

module.exports = router;
