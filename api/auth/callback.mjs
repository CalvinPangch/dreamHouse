/**
 * Comes back from OpenAI with an authorization code, trades it for tokens on
 * the server, and leaves the browser holding nothing but a session id.
 */
import { originOf, safeReturnTo, setCookie, clearCookie, readCookies, fail } from '../_lib/http.mjs';
import {
  accountsConfigured, takeTransaction, exchangeCode, claimsFromIdToken,
  createSession, SESSION_COOKIE, TXN_COOKIE,
} from '../_lib/auth.mjs';

/** Always land back in the studio - the page tells the person what happened. */
function back(res, returnTo, params) {
  const target = new URL(returnTo, 'https://placeholder.invalid');
  for (const [key, value] of Object.entries(params)) {
    if (value) target.searchParams.set(key, value);
  }
  res.statusCode = 302;
  res.setHeader('Location', target.pathname + target.search);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'method_not_allowed', 'Use GET.');
  if (!accountsConfigured()) return fail(res, 501, 'not_configured', 'Account saving is off on this deployment.');

  const origin = originOf(req);
  const url = new URL(req.url, origin);
  const txnId = readCookies(req)[TXN_COOKIE];
  clearCookie(res, TXN_COOKIE);

  const txn = await takeTransaction(txnId).catch(() => null);
  const returnTo = safeReturnTo(txn?.returnTo);

  const denied = url.searchParams.get('error');
  if (denied) {
    return back(res, returnTo, { auth: 'cancelled', reason: url.searchParams.get('error_description') || denied });
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!txn) return back(res, returnTo, { auth: 'failed', reason: 'the sign-in attempt expired' });
  if (!code || !state || state !== txn.state) {
    return back(res, returnTo, { auth: 'failed', reason: 'the response did not match the request' });
  }

  try {
    const tokens = await exchangeCode({
      code,
      verifier: txn.verifier,
      redirectUri: `${origin}/api/auth/callback`,
    });
    const user = await claimsFromIdToken(tokens.id_token);
    const session = await createSession(user);
    setCookie(res, SESSION_COOKIE, session.id, { maxAge: session.maxAge });
    back(res, returnTo, { auth: 'ok' });
  } catch (err) {
    back(res, returnTo, { auth: 'failed', reason: err.message });
  }
}
