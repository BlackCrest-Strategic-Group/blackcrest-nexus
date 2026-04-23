import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';

const router = Router();
router.get('/', authRequired, enforceSeatLimits, getDashboard);
export default router;
