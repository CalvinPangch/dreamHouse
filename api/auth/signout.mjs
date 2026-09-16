/** Drops the session on the server and clears the cookie. */
import { readCookies, clearCookie, json, fail } from '../_lib/http.mjs';
import { destroySession, SESSION_COOKIE } from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'method_not_allowed', 'Use POST.');

  const id = readCookies(req)[SESSION_COOKIE];
  clearCookie(res, SESSION_COOKIE);
  try {
    await destroySession(id);
  } catch {
    // The cookie is already gone from the browser; a stale server record expires on its own.
  }
  json(res, 200, { signedOut: true });
}
