/**
 * Client for the account half of saving: who is signed in, and the rooms kept
 * against their ChatGPT account.
 *
 * The whole flow is optional. When the deployment has no OAuth credentials or
 * no store configured, /api/auth/session reports `configured: false` and the
 * studio hides the account UI rather than offering a button that cannot work.
 */

const json = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Unexpected response from the server (${res.status}).`);
  }
};

async function call(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch {
    throw new Error('No connection. Check your network and try again.');
  }
  const body = await json(res);
  if (!res.ok) {
    const err = new Error(body.message || `Request failed (${res.status}).`);
    err.status = res.status;
    err.code = body.error;
    throw err;
  }
  return body;
}

/** `{ configured, signedIn, user }`. Never throws - a dead API just means signed out. */
export async function fetchSession() {
  try {
    return await call('/api/auth/session');
  } catch {
    return { configured: false, signedIn: false, user: null };
  }
}

/** Leaves the page for OpenAI's consent screen and comes back to `returnTo`. */
export function startSignIn(returnTo) {
  const url = new URL('/api/auth/start', window.location.origin);
  url.searchParams.set('returnTo', returnTo || window.location.pathname);
  window.location.assign(url.toString());
}

export const signOut = () => call('/api/auth/signout', { method: 'POST' });

export const listAccountRooms = () => call('/api/rooms');

export const fetchAccountRoom = (id) => call(`/api/rooms?id=${encodeURIComponent(id)}`);

export const saveAccountRoom = (doc) =>
  call('/api/rooms', { method: 'PUT', body: JSON.stringify({ doc }) });

export const deleteAccountRoom = (id) =>
  call(`/api/rooms?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
