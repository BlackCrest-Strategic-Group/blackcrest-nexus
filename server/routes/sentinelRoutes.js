import { Router } from 'express';
import { getSentinelOpportunities, getSentinelOverview, getSentinelSuppliers } from '../controllers/sentinelController.js';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';

const router = Router();

router.get('/overview', authRequired, enforceSeatLimits, getSentinelOverview);
router.get('/suppliers', authRequired, enforceSeatLimits, getSentinelSuppliers);
router.get('/opportunities', authRequired, enforceSeatLimits, getSentinelOpportunities);

export default router;
