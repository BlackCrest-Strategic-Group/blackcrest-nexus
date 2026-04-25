import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { getRoleMeta, hasPermission } from '../config/rbac.js';

function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET || '';
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('JWT_SECRET is required in production');
  }
  return secret || 'dev-secret';
}

export async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const payload = jwt.verify(token, resolveJwtSecret());
    const user = await User.findById(payload.userId).lean();
    if (!user) return res.status(401).json({ message: 'Invalid token user' });

    let tenant = null;
    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId).lean();
    }
    if (!tenant) return res.status(403).json({ message: 'Tenant context not found' });

    req.user = { ...user, ...getRoleMeta(user.role), tenant };
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
