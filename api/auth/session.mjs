/** Who is signed in - and whether account saving exists on this deployment at all. */
import { readCookies, json, fail } from '../_lib/http.mjs';
import { accountsConfigured, readSession, SESSION_COOKIE } from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'method_not_allowed', 'Use GET.');

  if (!accountsConfigured()) {
    return json(res, 200, { configured: false, signedIn: false, user: null });
  }

  try {
    const session = await readSession(readCookies(req)[SESSION_COOKIE]);
    if (!session) return json(res, 200, { configured: true, signedIn: false, user: null });
    return json(res, 200, {
      configured: true,
      signedIn: true,
      user: { id: session.sub, email: session.email, name: session.name },
    });
  } catch {
    // The store is unreachable; account saving cannot work right now.
    return json(res, 200, { configured: false, signedIn: false, user: null });
  }
}
