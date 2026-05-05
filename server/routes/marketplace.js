const express = require('express');
const router = express.Router();

router.get('/', (_, res) => {
  res.json({ module: 'marketplace', data: [{ id: 1, name: 'marketplace item', status: 'active' }], generatedAt: new Date().toISOString() });
});

module.exports = router;
