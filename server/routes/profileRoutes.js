import { Router } from 'express';
import { getHistory, getProfile, updatePreferences, updateUser } from '../controllers/profileController.js';
import { authRequired } from '../middleware/auth.js';
import { enforceSeatLimits } from '../middleware/seatGate.js';

const router = Router();
router.get('/profile', authRequired, enforceSeatLimits, getProfile);
router.put('/profile', authRequired, enforceSeatLimits, updateUser);
router.put('/settings', authRequired, enforceSeatLimits, updatePreferences);
router.get('/history', authRequired, enforceSeatLimits, getHistory);
export default router;
