/**
 * Rooms saved to a ChatGPT account.
 *
 *   GET    /api/rooms          list the summaries the Project menu shows
 *   GET    /api/rooms?id=...   one room, in full
 *   PUT    /api/rooms          create or replace a room
 *   DELETE /api/rooms?id=...   remove one
 *
 * Every key is namespaced by the account's `sub`, so one session can only ever
 * read or write its own rooms.
 */
import { readCookies, readJsonBody, json, fail, originOf } from './_lib/http.mjs';
import { accountsConfigured, readSession, SESSION_COOKIE } from './_lib/auth.mjs';
import { getJson, setJson, del, hsetJson, hdel, hgetAllJson, hlen } from './_lib/store.mjs';
import { sanitiseDoc, summarise, validId } from './_lib/room.mjs';

const MAX_ROOMS = 100;

const indexKey = (sub) => `studio:index:${sub}`;
const roomKey = (sub, id) => `studio:room:${sub}:${id}`;

export default async function handler(req, res) {
  if (!accountsConfigured()) {
    return fail(res, 501, 'not_configured', 'Account saving is off on this deployment.');
  }

  let session;
  try {
    session = await readSession(readCookies(req)[SESSION_COOKIE]);
  } catch {
    return fail(res, 503, 'store_unavailable', 'The account store could not be reached.');
  }
  if (!session?.sub) {
    return fail(res, 401, 'signed_out', 'Sign in with ChatGPT to use account saving.');
  }

  const url = new URL(req.url, originOf(req));
  const id = url.searchParams.get('id');

  try {
    if (req.method === 'GET') return id ? await getRoom(res, session.sub, id) : await listRooms(res, session.sub);
    if (req.method === 'PUT' || req.method === 'POST') return await putRoom(req, res, session.sub);
    if (req.method === 'DELETE') return await deleteRoom(res, session.sub, id);
    return fail(res, 405, 'method_not_allowed', 'Use GET, PUT or DELETE.');
  } catch (err) {
    if (err.status === 413) return fail(res, 413, 'too_large', 'That room is too big to save.');
    return fail(res, 502, 'store_error', err.message || 'The account store could not be reached.');
  }
}

async function listRooms(res, sub) {
  const index = await hgetAllJson(indexKey(sub));
  const rooms = Object.values(index)
    .filter(Boolean)
    .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  return json(res, 200, { rooms });
}

async function getRoom(res, sub, id) {
  if (!validId(id)) return fail(res, 400, 'bad_id', 'That is not a room id.');
  const doc = await getJson(roomKey(sub, id));
  if (!doc) return fail(res, 404, 'not_found', 'That room is not in your account.');
  return json(res, 200, { doc, updatedAt: doc.updatedAt });
}

async function putRoom(req, res, sub) {
  const body = await readJsonBody(req);
  const doc = sanitiseDoc(body?.doc);
  if (!doc) return fail(res, 400, 'bad_document', 'That room could not be read.');

  const existing = await getJson(roomKey(sub, doc.id));
  if (!existing) {
    const count = await hlen(indexKey(sub));
    if (Number(count) >= MAX_ROOMS) {
      return fail(res, 409, 'too_many', `You already have ${MAX_ROOMS} rooms saved. Delete one to make room.`);
    }
  }

  await setJson(roomKey(sub, doc.id), doc);
  await hsetJson(indexKey(sub), doc.id, summarise(doc, doc.updatedAt));
  return json(res, 200, { id: doc.id, updatedAt: doc.updatedAt });
}

async function deleteRoom(res, sub, id) {
  if (!validId(id)) return fail(res, 400, 'bad_id', 'That is not a room id.');
  await del(roomKey(sub, id));
  await hdel(indexKey(sub), id);
  return json(res, 200, { deleted: id });
}
