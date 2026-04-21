import { Router } from 'express';
import { getDemoModePayload } from '../services/demoModeData.js';

const router = Router();

router.get('/', (_req, res) => {
  return res.json(getDemoModePayload());
});

export default router;
