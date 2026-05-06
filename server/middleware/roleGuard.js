const allowedRoles = new Set(['Admin', 'Executive', 'Buyer', 'Supplier', 'Auditor']);

export function roleGuard(requiredRoles = []) {
  return (req, res, next) => {
    const role = req.header('x-demo-role') || 'Buyer';
    if (!allowedRoles.has(role)) return res.status(403).json({ error: 'Invalid role' });
    if (requiredRoles.length && !requiredRoles.includes(role)) return res.status(403).json({ error: 'Access denied for role' });
    req.role = role;
    next();
  };
}
