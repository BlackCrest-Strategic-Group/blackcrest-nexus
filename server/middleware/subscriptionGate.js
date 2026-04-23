export function requireActiveSubscription(req, res, next) {
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
