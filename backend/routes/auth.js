import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase();
}

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    jwtSecret(),
    { expiresIn: '8h' }
  );
}

function safeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company
  };
}

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!name || !email || password.length < 8) {
      return res.status(400).json({ error: 'Name, a valid email, and a password of at least 8 characters are required.' });
    }

    if (await User.exists({ email })) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const user = new User({ name, email, role: 'viewer' });
    await user.setPassword(password);
    await user.save();

    return res.status(201).json({ ok: true, token: signToken(user), user: safeUser(user) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    console.error('[auth] registration failed:', error.message);
    return res.status(500).json({ error: 'Registration is temporarily unavailable.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !user.isActive || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    user.lastLoginAt = new Date();
    await user.save();
    return res.json({ ok: true, token: signToken(user), user: safeUser(user) });
  } catch (error) {
    console.error('[auth] login failed:', error.message);
    return res.status(500).json({ error: 'Login is temporarily unavailable.' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const payload = jwt.verify(token, jwtSecret());
    const user = await User.findById(payload.id);
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid session.' });
    return res.json({ token: signToken(user), user: safeUser(user) });
  } catch {
    return res.status(401).json({ error: 'Invalid session.' });
  }
});

export default router;