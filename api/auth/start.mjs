/** Kicks off Sign in with ChatGPT: mints a PKCE transaction and redirects. */
import { originOf, safeReturnTo, setCookie, fail } from '../_lib/http.mjs';
import {
  accountsConfigured, endpoints, pkce, randomId, saveTransaction, TXN_COOKIE, SCOPE,
} from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'method_not_allowed', 'Use GET.');
  if (!accountsConfigured()) {
    return fail(res, 501, 'not_configured',
      'This deployment has no OpenAI credentials or no store, so account saving is off.');
  }

  const origin = originOf(req);
  const url = new URL(req.url, origin);
  const returnTo = safeReturnTo(url.searchParams.get('returnTo'));

  try {
    const { authorize } = await endpoints();
    const { verifier, challenge } = pkce();
    const state = randomId();
    const txnId = randomId();

    await saveTransaction(txnId, { state, verifier, returnTo });
    setCookie(res, TXN_COOKIE, txnId, { maxAge: 600 });

    const target = new URL(authorize);
    target.searchParams.set('response_type', 'code');
    target.searchParams.set('client_id', process.env.OPENAI_CLIENT_ID);
    target.searchParams.set('redirect_uri', `${origin}/api/auth/callback`);
    target.searchParams.set('scope', SCOPE);
    target.searchParams.set('state', state);
    target.searchParams.set('code_challenge', challenge);
    target.searchParams.set('code_challenge_method', 'S256');

    res.statusCode = 302;
    res.setHeader('Location', target.toString());
    res.setHeader('Cache-Control', 'no-store');
    res.end();
  } catch (err) {
    return fail(res, 502, 'sign_in_unavailable', err.message);
  }
}
