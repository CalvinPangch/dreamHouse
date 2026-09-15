/**
 * The 2D plan: a top-down canvas you arrange the room on.
 *
 * Room coordinates are metres with the origin at the room's back-left corner,
 * x running right and z running towards the viewer - the same axes the 3D view
 * uses, so a piece never jumps when you switch between them.
 */
import { CATALOG_BY_ID, FINISH_BY_ID } from './catalog.js';
import { clamp, confine, footprint } from './project.js';

const GRID = 0.5;          // metres between grid lines
const STEP = 0.05;         // movement quantum
const SNAP = 0.09;         // how close an edge has to be to stick
const PAD = 86;            // px of margin around the room at zoom 1

const SEATING = new Set(['linen-sofa', 'lounge-chair', 'dining-chair', 'daybed', 'bench', 'double-bed']);

export class Plan2D extends EventTarget {
  constructor(canvas, doc) {
    super();
    this.canvas = canvas;
    this.doc = doc;
    this.selected = null;
    this.hover = null;
    this.placing = null;       // catalogue id armed for the next click
    this.guides = [];
    this.drag = null;
    this.pan = null;
    this.dpr = 1;

    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    this._onWheel = this._onWheel.bind(this);

    canvas.addEventListener('pointerdown', this._onDown);
    canvas.addEventListener('pointermove', this._onMove);
    canvas.addEventListener('pointerup', this._onUp);
    canvas.addEventListener('pointercancel', this._onUp);
    canvas.addEventListener('pointerleave', () => { this.hover = null; this.draw(); });
    canvas.addEventListener('wheel', this._onWheel, { passive: false });
  }

  setDoc(doc) {
    this.doc = doc;
    if (this.selected && !doc.items.some((it) => it.uid === this.selected)) this.selected = null;
    this.draw();
  }

  select(uid) {
    if (this.selected === uid) return;
    this.selected = uid;
    this.draw();
    this.dispatchEvent(new CustomEvent('select', { detail: uid }));
  }

  /* ------------------------------------------------------------ geometry */

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * this.dpr));
    this.cssW = rect.width;
    this.cssH = rect.height;
    this.draw();
  }

  /** Pixels per metre before the user's own zoom. */
  get baseScale() {
    const { w, d } = this.doc.room;
    return Math.min((this.cssW - PAD * 2) / w, (this.cssH - PAD * 2) / d);
  }

  get scale() {
    return this.baseScale * this.doc.view.zoom;
  }

  toScreen(x, z) {
    const s = this.scale;
    const { w, d } = this.doc.room;
    return [
      this.cssW / 2 + (x - w / 2) * s + this.doc.view.pan.x,
      this.cssH / 2 + (z - d / 2) * s + this.doc.view.pan.y,
    ];
  }

  toRoom(px, py) {
    const s = this.scale;
    const { w, d } = this.doc.room;
    return [
      (px - this.cssW / 2 - this.doc.view.pan.x) / s + w / 2,
      (py - this.cssH / 2 - this.doc.view.pan.y) / s + d / 2,
    ];
  }

  pointer(ev) {
    const rect = this.canvas.getBoundingClientRect();
    return this.toRoom(ev.clientX - rect.left, ev.clientY - rect.top);
  }

  /** Topmost item under a room-space point, honouring rotation. */
  hit(x, z) {
    for (let i = this.doc.items.length - 1; i >= 0; i--) {
      const it = this.doc.items[i];
      const piece = CATALOG_BY_ID.get(it.catalogId);
      const rad = (-it.rot * Math.PI) / 180;
      const dx = x - it.x;
      const dz = z - it.z;
      const lx = dx * Math.cos(rad) - dz * Math.sin(rad);
      const lz = dx * Math.sin(rad) + dz * Math.cos(rad);
      if (Math.abs(lx) <= piece.w / 2 && Math.abs(lz) <= piece.d / 2) return it;
    }
    return null;
  }

  /* --------------------------------------------------------- interaction */

  /** Arms a catalogue piece so the next click on the plan drops it there. */
  arm(catalogId) {
    this.placing = catalogId;
    this.canvas.style.cursor = catalogId ? 'crosshair' : 'default';
    this.dispatchEvent(new CustomEvent('armchange', { detail: catalogId }));
  }

  _onDown(ev) {
    if (ev.button !== 0 && ev.button !== 1) return;
    const [x, z] = this.pointer(ev);

    if (this.placing && ev.button === 0) {
      const catalogId = this.placing;
      this.arm(null);
      this.dispatchEvent(new CustomEvent('place', { detail: { catalogId, x, z } }));
      return;
    }

    this.canvas.setPointerCapture(ev.pointerId);
    const target = ev.button === 1 ? null : this.hit(x, z);

    if (target) {
      this.select(target.uid);
      this.drag = { uid: target.uid, dx: target.x - x, dz: target.z - z, moved: false };
      this.dispatchEvent(new CustomEvent('editstart'));
    } else {
      if (ev.button === 0) this.select(null);
      const rect = this.canvas.getBoundingClientRect();
      this.pan = {
        px: ev.clientX - rect.left,
        py: ev.clientY - rect.top,
        ox: this.doc.view.pan.x,
        oy: this.doc.view.pan.y,
      };
    }
    this.draw();
  }

  _onMove(ev) {
    const rect = this.canvas.getBoundingClientRect();
    if (this.drag) {
      const [x, z] = this.pointer(ev);
      const item = this.doc.items.find((it) => it.uid === this.drag.uid);
      if (!item) return;
      const snapped = this._snap(item, x + this.drag.dx, z + this.drag.dz, ev.altKey);
      item.x = snapped.x;
      item.z = snapped.z;
      confine(item, this.doc.room);
      this.drag.moved = true;
      this.draw();
      this.dispatchEvent(new CustomEvent('editing'));
      return;
    }
    if (this.pan) {
      this.doc.view.pan.x = this.pan.ox + (ev.clientX - rect.left - this.pan.px);
      this.doc.view.pan.y = this.pan.oy + (ev.clientY - rect.top - this.pan.py);
      this.draw();
      this.dispatchEvent(new CustomEvent('viewchange'));
      return;
    }
    const [x, z] = this.pointer(ev);
    const over = this.hit(x, z);
    const uid = over ? over.uid : null;
    if (uid !== this.hover) {
      this.hover = uid;
      if (!this.placing) this.canvas.style.cursor = uid ? 'grab' : 'default';
      this.draw();
    }
  }

  _onUp(ev) {
    if (this.canvas.hasPointerCapture?.(ev.pointerId)) this.canvas.releasePointerCapture(ev.pointerId);
    const wasDrag = this.drag;
    this.drag = null;
    this.pan = null;
    this.guides = [];
    if (wasDrag) {
      this.dispatchEvent(new CustomEvent(wasDrag.moved ? 'editend' : 'editcancel'));
    }
    this.draw();
  }

  _onWheel(ev) {
    ev.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    const before = this.toRoom(px, py);
    const factor = Math.exp(-ev.deltaY * 0.0014);
    this.doc.view.zoom = clamp(this.doc.view.zoom * factor, 0.35, 5);
    const after = this.toRoom(px, py);
    this.doc.view.pan.x += (after[0] - before[0]) * this.scale;
    this.doc.view.pan.y += (after[1] - before[1]) * this.scale;
    this.draw();
    this.dispatchEvent(new CustomEvent('viewchange'));
  }

  resetView() {
    this.doc.view.zoom = 1;
    this.doc.view.pan = { x: 0, y: 0 };
    this.draw();
    this.dispatchEvent(new CustomEvent('viewchange'));
  }

  /**
   * Sticks the dragged piece to the walls and to the pieces already placed,
   * falling back to a 5 cm grid. Alt drags freely.
   */
  _snap(item, x, z, free) {
    if (free) return { x, z };
    const fp = footprint(item);
    const room = this.doc.room;
    const guides = [];

    const edges = { x: [0, room.w], z: [0, room.d] };
    for (const other of this.doc.items) {
      if (other.uid === item.uid) continue;
      const ofp = footprint(other);
      edges.x.push(other.x, other.x - ofp.w / 2, other.x + ofp.w / 2);
      edges.z.push(other.z, other.z - ofp.d / 2, other.z + ofp.d / 2);
    }
    edges.x.push(room.w / 2);
    edges.z.push(room.d / 2);

    const fix = (value, half, candidates, axis) => {
      let best = null;
      for (const edge of candidates) {
        for (const anchor of [value - half, value, value + half]) {
          const delta = edge - anchor;
          if (Math.abs(delta) < SNAP && (!best || Math.abs(delta) < Math.abs(best.delta))) {
            best = { delta, edge };
          }
        }
      }
      if (!best) return Math.round(value / STEP) * STEP;
      guides.push({ axis, at: best.edge });
      return value + best.delta;
    };

    const nx = fix(x, fp.w / 2, edges.x, 'x');
    const nz = fix(z, fp.d / 2, edges.z, 'z');
    this.guides = guides;
    return { x: nx, z: nz };
  }

  /* ------------------------------------------------------------- drawing */

  draw() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx || !this.cssW) return;
    const css = getComputedStyle(document.documentElement);
    const tone = (name, fallback) => (css.getPropertyValue(name) || fallback).trim();

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.cssW, this.cssH);

    const { w, d } = this.doc.room;
    const s = this.scale;
    const [ox, oy] = this.toScreen(0, 0);
    const line = tone('--line', '#dfdacf');
    const ink = tone('--ink', '#393d32');
    const muted = tone('--muted', '#727468');
    const accent = tone('--accent', '#87632f');

    // floor
    ctx.fillStyle = tone('--plan-floor', '#fbf7ef');
    ctx.fillRect(ox, oy, w * s, d * s);

    if (this.doc.view.grid) {
      ctx.strokeStyle = line;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = GRID; gx < w - 1e-6; gx += GRID) {
        ctx.moveTo(Math.round(ox + gx * s) + 0.5, oy);
        ctx.lineTo(Math.round(ox + gx * s) + 0.5, oy + d * s);
      }
      for (let gz = GRID; gz < d - 1e-6; gz += GRID) {
        ctx.moveTo(ox, Math.round(oy + gz * s) + 0.5);
        ctx.lineTo(ox + w * s, Math.round(oy + gz * s) + 0.5);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // flat pieces first: a rug belongs under whatever stands on it
    const order = [...this.doc.items].sort(
      (a, b) => Number(Boolean(CATALOG_BY_ID.get(b.catalogId).flat)) - Number(Boolean(CATALOG_BY_ID.get(a.catalogId).flat))
    );
    for (const item of order) this._drawItem(ctx, item, s, ink);

    // walls last, so nothing overlaps them
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(ox, oy, w * s, d * s);

    if (this.guides.length) {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (const g of this.guides) {
        if (g.axis === 'x') {
          const gx = Math.round(ox + g.at * s) + 0.5;
          ctx.moveTo(gx, oy - 20);
          ctx.lineTo(gx, oy + d * s + 20);
        } else {
          const gy = Math.round(oy + g.at * s) + 0.5;
          ctx.moveTo(ox - 20, gy);
          ctx.lineTo(ox + w * s + 20, gy);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    if (this.doc.view.dims) this._drawDims(ctx, ox, oy, w, d, s, muted);
  }

  _drawItem(ctx, item, s, ink) {
    const piece = CATALOG_BY_ID.get(item.catalogId);
    const finish = FINISH_BY_ID.get(item.finish) || FINISH_BY_ID.get(piece.finish);
    const [cx, cy] = this.toScreen(item.x, item.z);
    const pw = piece.w * s;
    const pd = piece.d * s;
    const isSel = item.uid === this.selected;
    const isHover = item.uid === this.hover;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((item.rot * Math.PI) / 180);

    const r = Math.min(6, pw / 4, pd / 4);
    const box = () => {
      ctx.beginPath();
      ctx.roundRect(-pw / 2, -pd / 2, pw, pd, Math.max(1, r));
    };

    if (piece.id === 'rug') {
      box();
      ctx.fillStyle = finish.color;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = ink;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    } else if (piece.round || piece.mount === 'ceiling') {
      ctx.beginPath();
      ctx.ellipse(0, 0, pw / 2, pd / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = finish.color;
      ctx.fill();
      if (piece.mount === 'ceiling') ctx.setLineDash([3, 3]);
      ctx.strokeStyle = ink;
      ctx.globalAlpha = piece.mount === 'ceiling' ? 0.45 : 0.28;
      ctx.lineWidth = 1.35;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = finish.color;
      box();
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1.25;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // a back rail on anything you sit or lie on, so orientation reads at a glance
      if (SEATING.has(piece.id)) {
        const rail = Math.min(pd * 0.24, 9);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.roundRect(-pw / 2, -pd / 2, pw, rail, [Math.max(1, r), Math.max(1, r), 1, 1]);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    if (isSel || isHover) {
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#87632f';
      ctx.lineWidth = isSel ? 2 : 1.5;
      ctx.globalAlpha = isSel ? 1 : 0.6;
      ctx.beginPath();
      ctx.roundRect(-pw / 2 - 3, -pd / 2 - 3, pw + 6, pd + 6, Math.max(2, r + 2));
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    if (isSel) {
      ctx.save();
      ctx.font = '500 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#87632f';
      const fp = footprint(item);
      ctx.fillText(piece.name, cx, cy - (fp.d * s) / 2 - 10);
      ctx.restore();
    }
  }

  _drawDims(ctx, ox, oy, w, d, s, muted) {
    ctx.save();
    ctx.strokeStyle = muted;
    ctx.fillStyle = muted;
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 1;
    ctx.font = '500 11px system-ui, sans-serif';
    ctx.textAlign = 'center';

    const off = 26;
    ctx.beginPath();
    ctx.moveTo(ox, oy - off); ctx.lineTo(ox + w * s, oy - off);
    ctx.moveTo(ox, oy - off - 4); ctx.lineTo(ox, oy - off + 4);
    ctx.moveTo(ox + w * s, oy - off - 4); ctx.lineTo(ox + w * s, oy - off + 4);
    ctx.moveTo(ox - off, oy); ctx.lineTo(ox - off, oy + d * s);
    ctx.moveTo(ox - off - 4, oy); ctx.lineTo(ox - off + 4, oy);
    ctx.moveTo(ox - off - 4, oy + d * s); ctx.lineTo(ox - off + 4, oy + d * s);
    ctx.stroke();

    ctx.fillText(`${w.toFixed(2)} m`, ox + (w * s) / 2, oy - off - 7);
    ctx.translate(ox - off - 7, oy + (d * s) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${d.toFixed(2)} m`, 0, 0);
    ctx.restore();
  }
}
