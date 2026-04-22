import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getRoleMeta, hasPermission } from '../config/rbac.js';

export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(payload.userId).lean();
    if (!user) return res.status(401).json({ message: 'Invalid token user' });

    req.user = { ...user, ...getRoleMeta(user.role) };
    return next();
  } catch (_err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function permissionRequired(permission) {
  return (req, res, next) => {
    if (!req.user?.role || !hasPermission(req.user.role, permission)) {
      return res.status(403).json({ message: `Missing permission: ${permission}` });
    }
    return next();
  };
}
