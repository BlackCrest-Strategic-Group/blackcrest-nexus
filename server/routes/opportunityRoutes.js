import { Router } from 'express';
import { analyzeOpportunity, deleteOpportunity, listOpportunities, saveOpportunity, uploadMemoryPdf } from '../controllers/opportunityController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.post('/analyze', authRequired, uploadMemoryPdf, analyzeOpportunity);
router.post('/save', authRequired, saveOpportunity);
router.get('/history', authRequired, listOpportunities);
router.delete('/:id', authRequired, deleteOpportunity);
export default router;
