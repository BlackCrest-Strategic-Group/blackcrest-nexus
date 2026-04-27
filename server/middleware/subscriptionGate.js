function isDemoTenant(user = {}) {
  const email = String(user?.email || '').toLowerCase();
  const tenantName = String(user?.tenant?.name || '').toLowerCase();
  return email === 'demo@blackcrest.ai'
    || email.endsWith('.demo@blackcrest.local')
    || tenantName.includes('demo workspace');
}

export function requireActiveSubscription(req, res, next) {
  if (isDemoTenant(req.user)) {
    return next();
  }

  const status = req.user?.tenant?.subscriptionStatus;
  if (!status) {
    return res.status(403).json({ message: "Tenant subscription not found" });
  }

  if (status === "active" || status === "trialing") {
    return next();
  }

  return res.status(402).json({
    message: "Active subscription required",
    subscriptionStatus: status
  });
}

export default requireActiveSubscription;
