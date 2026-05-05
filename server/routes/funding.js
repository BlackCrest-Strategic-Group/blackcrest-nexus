const express = require('express');
const router = express.Router();

router.get('/', (_, res) => {
  res.json({ module: 'funding', data: [{ id: 1, name: 'funding item', status: 'active' }], generatedAt: new Date().toISOString() });
});

module.exports = router;
