import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { getRecentHistory, storeMessage } from '../services/memory.js';
import { routeTJ } from '../services/router.js';

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const { message = '', mode = 'business' } = req.body;
  await storeMessage({ userId: req.user.id, mode, role: 'user', text: message });
  const recent = await getRecentHistory(req.user.id);
  const response = routeTJ({ mode, message, history: recent });
  await storeMessage({ userId: req.user.id, mode, role: 'assistant', text: response.text });
  res.json({ ...response, history: recent });
});

export default router;
