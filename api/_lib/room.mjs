/**
 * Server-side validation for a saved room.
 *
 * Deliberately independent of the browser code: this is the trust boundary, so
 * it re-derives the document shape from scratch rather than importing the
 * client's idea of it. Anything unrecognised is dropped, not rejected, so a
 * room saved by a newer build still comes back usable.
 */

const MAX_ITEMS = 200;
const MAX_NAME = 80;
const MAX_ID = 64;
const ID_SHAPE = /^[A-Za-z0-9_-]{1,64}$/;

const num = (value, fallback, min, max) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

const str = (value, fallback, max) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;

export const validId = (value) => typeof value === 'string' && ID_SHAPE.test(value);

/** Returns a clean document, or null when there is nothing usable in it. */
export function sanitiseDoc(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (!validId(raw.id)) return null;

  const room = raw.room && typeof raw.room === 'object' ? raw.room : {};
  const w = num(room.w, 6, 1, 40);
  const d = num(room.d, 5, 1, 40);

  const view = raw.view && typeof raw.view === 'object' ? raw.view : {};
  const orbit = view.orbit && typeof view.orbit === 'object' ? view.orbit : {};
  const pan = view.pan && typeof view.pan === 'object' ? view.pan : {};

  const items = Array.isArray(raw.items) ? raw.items : [];

  return {
    version: 1,
    id: raw.id.slice(0, MAX_ID),
    name: str(raw.name, 'Untitled room', MAX_NAME),
    room: {
      w, d,
      floor: str(room.floor, 'oak', 24),
      wall: str(room.wall, 'shell', 24),
    },
    items: items
      .filter((it) => it && typeof it === 'object' && validId(it.catalogId))
      .slice(0, MAX_ITEMS)
      .map((it) => ({
        uid: validId(it.uid) ? it.uid : `p${Math.random().toString(36).slice(2, 12)}`,
        catalogId: it.catalogId.slice(0, MAX_ID),
        x: num(it.x, w / 2, -40, 40),
        z: num(it.z, d / 2, -40, 40),
        rot: ((num(it.rot, 0, -1e6, 1e6) % 360) + 360) % 360,
        finish: validId(it.finish) ? it.finish.slice(0, MAX_ID) : 'linen',
      })),
    view: {
      mode: view.mode === '3d' ? '3d' : '2d',
      grid: view.grid !== false,
      dims: view.dims !== false,
      orbit: {
        theta: num(orbit.theta, -0.85, -13, 13),
        phi: num(orbit.phi, 0.95, 0.05, 1.55),
        dist: num(orbit.dist, 11.5, 1, 80),
      },
      pan: { x: num(pan.x, 0, -5000, 5000), y: num(pan.y, 0, -5000, 5000) },
      zoom: num(view.zoom, 1, 0.2, 6),
    },
    createdAt: num(raw.createdAt, Date.now(), 0, Number.MAX_SAFE_INTEGER),
    updatedAt: Date.now(),
  };
}

/** The short form the Project menu lists. */
export const summarise = (doc, updatedAt) => ({
  id: doc.id,
  name: doc.name,
  items: doc.items.length,
  room: { w: doc.room.w, d: doc.room.d },
  savedAt: updatedAt,
});
