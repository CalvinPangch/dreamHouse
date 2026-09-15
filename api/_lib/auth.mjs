/**
 * Sign in with ChatGPT.
 *
 * Standard OpenID Connect authorization-code flow with PKCE, run as a
 * confidential client: the code exchange happens here so the client secret
 * never reaches the browser, and the browser only ever holds an opaque session
 * id in an HttpOnly cookie. No OpenAI token is sent to the page.
 */
import crypto from 'node:crypto';
import { getJson, setJson, del, storeConfigured } from './store.mjs';

export const SESSION_COOKIE = 'studio_session';
export const TXN_COOKIE = 'studio_oauth';

const SESSION_TTL = 60 * 60 * 24 * 30;   // 30 days
const TXN_TTL = 60 * 10;                 // 10 minutes to finish signing in

const ISSUER = (process.env.OPENAI_ISSUER || 'https://auth.openai.com').replace(/\/$/, '');
const SCOPE = process.env.OPENAI_SCOPE || 'openid profile email';

export const oauthConfigured = () =>
  Boolean(process.env.OPENAI_CLIENT_ID && process.env.OPENAI_CLIENT_SECRET);

export const accountsConfigured = () => oauthConfigured() && storeConfigured();

/* ---------------------------------------------------------- discovery */

let discovery = null;
let discoveredAt = 0;

/** Endpoints come from the issuer's own metadata rather than being hardcoded. */
export async function endpoints() {
  if (discovery && Date.now() - discoveredAt < 60 * 60 * 1000) return discovery;
  const res = await fetch(`${ISSUER}/.well-known/openid-configuration`);
  if (!res.ok) throw new Error(`Could not reach the sign-in service (${res.status}).`);
  const meta = await res.json();
  if (!meta.authorization_endpoint || !meta.token_endpoint) {
    throw new Error('The sign-in service did not advertise the endpoints we need.');
  }
  discovery = {
    issuer: meta.issuer || ISSUER,
    authorize: meta.authorization_endpoint,
    token: meta.token_endpoint,
  };
  discoveredAt = Date.now();
  return discovery;
}

/* --------------------------------------------------------------- PKCE */

const b64url = (buf) => buf.toString('base64url');

export function pkce() {
  const verifier = b64url(crypto.randomBytes(32));
  return {
    verifier,
    challenge: b64url(crypto.createHash('sha256').update(verifier).digest()),
  };
}

export const randomId = () => b64url(crypto.randomBytes(32));

/* -------------------------------------------------- the sign-in attempt */

export const saveTransaction = (id, data) => setJson(`studio:txn:${id}`, data, TXN_TTL);

export async function takeTransaction(id) {
  if (!id) return null;
  const key = `studio:txn:${id}`;
  const data = await getJson(key);
  await del(key);            // one shot, whether or not it was found
  return data;
}

/* ------------------------------------------------------------ sessions */

export async function createSession(user) {
  const id = randomId();
  await setJson(`studio:sess:${id}`, { ...user, createdAt: Date.now() }, SESSION_TTL);
  return { id, maxAge: SESSION_TTL };
}

export const readSession = (id) => (id ? getJson(`studio:sess:${id}`) : Promise.resolve(null));

export const destroySession = (id) => (id ? del(`studio:sess:${id}`) : Promise.resolve());

/* ------------------------------------------------------- token exchange */

export async function exchangeCode({ code, verifier, redirectUri }) {
  const { token } = await endpoints();
  const res = await fetch(token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.OPENAI_CLIENT_ID,
      client_secret: process.env.OPENAI_CLIENT_SECRET,
      code_verifier: verifier,
    }),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error_description || payload.error || `Token exchange failed (${res.status}).`);
  }
  return payload;
}

/**
 * Reads the claims out of an id_token.
 *
 * The token came straight from the token endpoint over TLS, with the client
 * authenticating itself, which is the case OpenID Connect Core 3.1.3.7 allows
 * to stand in for checking the signature. Issuer, audience and expiry are still
 * checked here, because those say whether the token was meant for us.
 */
export async function claimsFromIdToken(idToken) {
  if (typeof idToken !== 'string') throw new Error('The sign-in service did not return an identity token.');
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('The identity token was malformed.');

  let claims;
  try {
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    throw new Error('The identity token could not be read.');
  }

  const { issuer } = await endpoints();
  if (claims.iss && claims.iss.replace(/\/$/, '') !== issuer.replace(/\/$/, '')) {
    throw new Error('The identity token came from an unexpected issuer.');
  }
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audience.includes(process.env.OPENAI_CLIENT_ID)) {
    throw new Error('The identity token was issued for a different application.');
  }
  if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now() - 60_000) {
    throw new Error('The identity token had already expired.');
  }
  if (!claims.sub) throw new Error('The identity token carried no account id.');

  return {
    sub: String(claims.sub),
    email: typeof claims.email === 'string' ? claims.email : null,
    name: typeof claims.name === 'string' ? claims.name : null,
  };
}

export { SCOPE };
