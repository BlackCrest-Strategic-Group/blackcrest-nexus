import { Router } from 'express';
import { analyzeOpportunity, deleteOpportunity, listOpportunities, saveOpportunity, uploadMemoryPdf } from '../controllers/opportunityController.js';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';

const router = Router();
router.post('/analyze', authRequired, enforceSeatLimits, uploadMemoryPdf, analyzeOpportunity);
router.post('/save', authRequired, enforceSeatLimits, saveOpportunity);
router.get('/history', authRequired, enforceSeatLimits, listOpportunities);
router.delete('/:id', authRequired, enforceSeatLimits, deleteOpportunity);
export default router;
