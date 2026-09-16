/**
 * The account store.
 *
 * Talks the Redis REST protocol over plain fetch, which both Vercel KV and
 * Upstash Redis speak, so the project keeps its zero-dependency deploy. If no
 * store is configured the API says so and the studio hides account saving
 * rather than failing halfway through one.
 */

const URL_VARS = ['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL', 'REDIS_REST_URL'];
const TOKEN_VARS = ['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN', 'REDIS_REST_TOKEN'];

const pick = (names) => {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value.replace(/\/$/, '');
  }
  return null;
};

export const storeConfigured = () => Boolean(pick(URL_VARS) && pick(TOKEN_VARS));

async function command(args) {
  const base = pick(URL_VARS);
  const token = pick(TOKEN_VARS);
  if (!base || !token) throw Object.assign(new Error('No store configured'), { code: 'store_unconfigured' });

  const res = await fetch(base, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Store returned an unreadable response (${res.status}).`);
  }
  if (!res.ok || payload.error) {
    throw new Error(payload.error || `Store request failed (${res.status}).`);
  }
  return payload.result;
}

const parse = (value) => {
  if (value === null || value === undefined) return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

export const setJson = (key, value, ttlSeconds) =>
  command(ttlSeconds ? ['SET', key, JSON.stringify(value), 'EX', String(ttlSeconds)] : ['SET', key, JSON.stringify(value)]);

export const getJson = async (key) => parse(await command(['GET', key]));

export const del = (key) => command(['DEL', key]);

export const hsetJson = (key, field, value) => command(['HSET', key, field, JSON.stringify(value)]);

export const hdel = (key, field) => command(['HDEL', key, field]);

export const hlen = (key) => command(['HLEN', key]);

/** HGETALL comes back as a flat [field, value, ...] array. */
export async function hgetAllJson(key) {
  const flat = await command(['HGETALL', key]);
  const out = {};
  if (Array.isArray(flat)) {
    for (let i = 0; i < flat.length; i += 2) out[flat[i]] = parse(flat[i + 1]);
  } else if (flat && typeof flat === 'object') {
    for (const [field, value] of Object.entries(flat)) out[field] = parse(value);
  }
  return out;
}
