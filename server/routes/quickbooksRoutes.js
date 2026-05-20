import crypto from 'crypto';
import { Router } from 'express';
import QuickBooksConfig from '../models/QuickBooksConfig.js';
import { syncQBData } from '../services/quickbooksConnector.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

const QB_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const QB_SCOPES = 'com.intuit.quickbooks.accounting';

// Short-lived in-memory store for CSRF state nonces (keyed by random hex string)
const stateStore = new Map();

function pruneExpiredState() {
  const now = Date.now();
  for (const [key, val] of stateStore) {
    if (val.expires < now) stateStore.delete(key);
  }
}

// GET /api/erp/quickbooks/connect
router.get('/quickbooks/connect', authRequired, (req, res) => {
  pruneExpiredState();

  if (!process.env.QB_CLIENT_ID || !process.env.QB_REDIRECT_URI) {
    return res.status(503).json({ error: 'QuickBooks integration is not configured.' });
  }

  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, { userId: req.user.userId, expires: Date.now() + 10 * 60 * 1000 });

  const params = new URLSearchParams({
    client_id: process.env.QB_CLIENT_ID,
    redirect_uri: process.env.QB_REDIRECT_URI,
    response_type: 'code',
    scope: QB_SCOPES,
    state,
  });

  return res.redirect(`${QB_AUTH_URL}?${params}`);
});

// GET /api/erp/quickbooks/callback  (Intuit redirects here after authorization)
router.get('/quickbooks/callback', async (req, res) => {
  const { code, state, realmId, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (error) {
    console.error('[QB OAUTH] authorization denied:', error);
    return res.redirect(`${clientUrl}/settings?qb_error=${encodeURIComponent(String(error))}`);
  }

  const stateEntry = stateStore.get(String(state));
  if (!stateEntry || stateEntry.expires < Date.now()) {
    console.error('[QB OAUTH] invalid or expired state');
    return res.redirect(`${clientUrl}/settings?qb_error=invalid_state`);
  }
  stateStore.delete(String(state));

  const { userId } = stateEntry;

  if (!realmId) {
    console.error('[QB OAUTH] missing realmId from callback');
    return res.redirect(`${clientUrl}/settings?qb_error=missing_realm_id`);
  }

  try {
    const credentials = Buffer.from(
      `${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResp = await fetch(QB_TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: process.env.QB_REDIRECT_URI || '',
      }),
    });

    if (!tokenResp.ok) {
      const body = await tokenResp.text();
      console.error('[QB OAUTH] token exchange failed:', body);
      return res.redirect(`${clientUrl}/settings?qb_error=token_exchange_failed`);
    }

    const tokenData = await tokenResp.json();

    await QuickBooksConfig.findOneAndUpdate(
      { userId },
      {
        userId,
        realmId: String(realmId),
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
      { upsert: true, new: true }
    );

    console.log(`[QB OAUTH] connected — user ${userId}, realm ${realmId}`);
    return res.redirect(`${clientUrl}/settings?qb_connected=true`);
  } catch (err) {
    console.error('[QB OAUTH] unexpected error:', err.message);
    return res.redirect(`${clientUrl}/settings?qb_error=server_error`);
  }
});

// GET /api/erp/mt/sync-suppliers  — fetch QB vendors and return them
router.get('/mt/sync-suppliers', authRequired, async (req, res) => {
  try {
    const result = await syncQBData(req.user.userId);
    return res.json(result);
  } catch (err) {
    console.error('[QB SYNC] sync-suppliers:', err.message);
    const status = err.message.includes('realm ID not found') ? 400 : 500;
    return res.status(status).json({ success: false, error: err.message });
  }
});

// GET /api/erp/mt/sync-bom  — fetch QB bills and return them
router.get('/mt/sync-bom', authRequired, async (req, res) => {
  try {
    const result = await syncQBData(req.user.userId);
    return res.json({
      success: result.success,
      billCount: result.billCount,
      bills: result.bills,
      syncedAt: result.syncedAt,
    });
  } catch (err) {
    console.error('[QB SYNC] sync-bom:', err.message);
    const status = err.message.includes('realm ID not found') ? 400 : 500;
    return res.status(status).json({ success: false, error: err.message });
  }
});

export default router;
