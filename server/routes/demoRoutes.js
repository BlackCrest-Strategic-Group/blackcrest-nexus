import { Router } from 'express';
import { getDemoModePayload } from '../services/demoModeData.js';
import { authRequired } from '../middleware/auth.js';
import { requireActiveSubscription } from '../middleware/subscriptionGate.js';

const router = Router();
const CORE_ROUTES = [
  '/api/auth/profile',
  '/api/sentinel/overview',
  '/api/sentinel/opportunities',
  '/api/procurement-intelligence/summary',
  '/api/reports/generate',
  '/api/erp-connectors',
  '/api/blanket-po/health'
];

router.get('/', (_req, res) => {
  return res.json(getDemoModePayload());
});

router.get('/readiness', authRequired, requireActiveSubscription, (req, res) => {
  return res.json({
    auth: 'ok',
    tenant: req.user?.tenantId ? 'ok' : 'missing',
    subscription: ['trialing', 'active'].includes(req.user?.tenant?.subscriptionStatus) ? 'ok' : 'missing',
    routes: CORE_ROUTES,
    demoData: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router;
