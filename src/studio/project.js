/**
 * The project document, and the history around it.
 *
 * A project is the single unit the studio saves: the room's dimensions, the
 * furniture in it with each piece's finish, and the view settings. Everything
 * the save indicator talks about is derived from this module - `revision`
 * counts edits, and a save records the revision it captured.
 */
import { CATALOG_BY_ID } from './catalog.js';

export const DOC_VERSION = 1;

export const ROOM_SIZES = [
  { w: 3, d: 3, name: '3 × 3 m' },
  { w: 4, d: 3.5, name: '4 × 3.5 m' },
  { w: 5, d: 4, name: '5 × 4 m' },
  { w: 6, d: 5, name: '6 × 5 m' },
  { w: 7, d: 5.5, name: '7 × 5.5 m' },
  { w: 8, d: 6, name: '8 × 6 m' },
  { w: 10, d: 7, name: '10 × 7 m' },
];

export const WALL_HEIGHT = 2.7;

const uid = () =>
  `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function newProject(name = 'Untitled room') {
  return {
    version: DOC_VERSION,
    id: uid(),
    name,
    room: { w: 6, d: 5, floor: 'oak', wall: 'shell' },
    items: [],
    view: {
      mode: '2d',
      grid: true,
      dims: true,
      orbit: { theta: 0.86, phi: 1.02, dist: 9.6 },
      pan: { x: 0, y: 0 },
      zoom: 1,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Normalises anything that claims to be a project - a document from
 * localStorage, or one that came back from the account - into a shape the app
 * can render. Unknown catalogue pieces and out-of-range numbers are dropped
 * rather than allowed to break the canvas.
 */
export function normalise(raw) {
  const base = newProject();
  if (!raw || typeof raw !== 'object') return base;

  const num = (v, fallback, min, max) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

  const room = raw.room || {};
  const w = num(room.w, base.room.w, 2, 20);
  const d = num(room.d, base.room.d, 2, 20);

  const view = raw.view || {};
  const orbit = view.orbit || {};
  const pan = view.pan || {};

  const items = Array.isArray(raw.items) ? raw.items : [];

  return {
    version: DOC_VERSION,
    id: typeof raw.id === 'string' && raw.id ? raw.id : base.id,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 80) : base.name,
    room: {
      w, d,
      floor: typeof room.floor === 'string' ? room.floor : base.room.floor,
      wall: typeof room.wall === 'string' ? room.wall : base.room.wall,
    },
    items: items
      .filter((it) => it && CATALOG_BY_ID.has(it.catalogId))
      .slice(0, 200)
      .map((it) => {
        const piece = CATALOG_BY_ID.get(it.catalogId);
        return {
          uid: typeof it.uid === 'string' && it.uid ? it.uid : uid(),
          catalogId: it.catalogId,
          x: num(it.x, w / 2, -20, 20),
          z: num(it.z, d / 2, -20, 20),
          rot: ((num(it.rot, 0, -100000, 100000) % 360) + 360) % 360,
          finish: piece.finishes.includes(it.finish) ? it.finish : piece.finish,
        };
      }),
    view: {
      mode: view.mode === '3d' ? '3d' : '2d',
      grid: view.grid !== false,
      dims: view.dims !== false,
      orbit: {
        theta: num(orbit.theta, base.view.orbit.theta, -Math.PI * 4, Math.PI * 4),
        phi: num(orbit.phi, base.view.orbit.phi, 0.05, 1.55),
        dist: num(orbit.dist, base.view.orbit.dist, 2, 60),
      },
      pan: { x: num(pan.x, 0, -5000, 5000), y: num(pan.y, 0, -5000, 5000) },
      zoom: num(view.zoom, 1, 0.2, 6),
    },
    createdAt: num(raw.createdAt, Date.now(), 0, Number.MAX_SAFE_INTEGER),
    updatedAt: num(raw.updatedAt, Date.now(), 0, Number.MAX_SAFE_INTEGER),
  };
}

/** Places a catalogue piece in the middle of the room, nudged off anything already there. */
export function placeItem(doc, catalogId) {
  const piece = CATALOG_BY_ID.get(catalogId);
  if (!piece) return null;

  let x = doc.room.w / 2;
  let z = doc.room.d / 2;
  const taken = (px, pz) =>
    doc.items.some((it) => Math.abs(it.x - px) < 0.25 && Math.abs(it.z - pz) < 0.25);
  for (let i = 0; i < 40 && taken(x, z); i++) {
    x = doc.room.w / 2 + ((i % 8) - 3.5) * 0.35;
    z = doc.room.d / 2 + (Math.floor(i / 8) - 2) * 0.35;
  }

  return {
    uid: uid(),
    catalogId,
    x: clamp(x, piece.w / 2, doc.room.w - piece.w / 2),
    z: clamp(z, piece.d / 2, doc.room.d - piece.d / 2),
    rot: 0,
    finish: piece.finish,
  };
}

export const clamp = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));

/** Footprint of a placed item after rotation, used for snapping and hit-testing. */
export function footprint(item) {
  const piece = CATALOG_BY_ID.get(item.catalogId);
  const rad = (item.rot * Math.PI) / 180;
  const c = Math.abs(Math.cos(rad));
  const s = Math.abs(Math.sin(rad));
  return { w: piece.w * c + piece.d * s, d: piece.w * s + piece.d * c };
}

/** Keeps a piece inside the room after a move, a rotate, or a room resize. */
export function confine(item, room) {
  const fp = footprint(item);
  item.x = clamp(item.x, fp.w / 2, room.w - fp.w / 2);
  item.z = clamp(item.z, fp.d / 2, room.d - fp.d / 2);
  return item;
}

export const duplicateUid = uid;

/* --------------------------------------------------------------- history */

/**
 * Undo/redo over whole-document snapshots. Projects are small (a few hundred
 * numbers), so snapshotting is simpler and safer than a command log.
 */
export class History {
  constructor(doc, limit = 60) {
    this.limit = limit;
    this.past = [];
    this.future = [];
    this.present = clone(doc);
  }

  reset(doc) {
    this.past = [];
    this.future = [];
    this.present = clone(doc);
  }

  /** Call before mutating, with the document as it currently stands. */
  commit(doc) {
    this.past.push(this.present);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
    this.present = clone(doc);
  }

  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }

  undo() {
    if (!this.canUndo) return null;
    this.future.unshift(this.present);
    this.present = this.past.pop();
    return clone(this.present);
  }

  redo() {
    if (!this.canRedo) return null;
    this.past.push(this.present);
    this.present = this.future.shift();
    return clone(this.present);
  }
}

export const clone = (doc) => JSON.parse(JSON.stringify(doc));

/** Everything a save needs to compare, without the timestamps that always differ. */
export function fingerprint(doc) {
  return JSON.stringify({ n: doc.name, r: doc.room, i: doc.items, v: doc.view });
}
