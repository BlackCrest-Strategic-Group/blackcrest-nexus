import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';
import {
  addSupplierFollowUp,
  createCategoryPlan,
  createContract,
  createSavings,
  createSupplierFormRecord,
  getProcurementSummary,
  listCategoryPlans,
  listContracts,
  listSavings,
  listSupplierFormData
} from '../controllers/procurementIntelligenceController.js';

const router = Router();

router.get('/summary', authRequired, enforceSeatLimits, getProcurementSummary);

router.get('/suppliers', authRequired, enforceSeatLimits, listSupplierFormData);
router.post('/suppliers', authRequired, enforceSeatLimits, createSupplierFormRecord);
router.post('/suppliers/follow-ups', authRequired, enforceSeatLimits, addSupplierFollowUp);

router.get('/categories', authRequired, enforceSeatLimits, listCategoryPlans);
router.post('/categories', authRequired, enforceSeatLimits, createCategoryPlan);

router.get('/contracts', authRequired, enforceSeatLimits, listContracts);
router.post('/contracts', authRequired, enforceSeatLimits, createContract);

router.get('/savings', authRequired, enforceSeatLimits, listSavings);
router.post('/savings', authRequired, enforceSeatLimits, createSavings);

export default router;
