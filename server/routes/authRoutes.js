import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getRoles, login, logout, profile, register, updateProfile } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

const authWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please wait and retry.' }
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait and retry.' }
});

router.post('/register', authWriteLimiter, register);
router.get('/roles', getRoles);
router.post('/login', loginLimiter, login);
router.post('/logout', authRequired, logout);
router.get('/profile', authRequired, profile);
router.patch('/profile', authRequired, updateProfile);
export default router;
