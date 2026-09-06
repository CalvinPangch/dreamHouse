/** Low level geometry helpers. All arguments are in feet. */
import * as THREE from 'three';

export function box(w, h, d, material, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
  if (opts.rx) mesh.rotation.x = opts.rx;
  if (opts.ry) mesh.rotation.y = opts.ry;
  if (opts.rz) mesh.rotation.z = opts.rz;
  mesh.castShadow = opts.cast !== false;
  mesh.receiveShadow = opts.receive !== false;
  if (opts.name) mesh.name = opts.name;
  return mesh;
}

export function plane(w, d, material, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
  mesh.receiveShadow = true;
  return mesh;
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * Build a wall segment with door / window openings.
 *
 * seg      : { x1, z1, x2, z2 }
 * openings : [{ at, w, type, sill, head }] measured from (x1,z1)
 */
export function buildWall(parent, seg, openings, o) {
  const { height, thickness, baseY, mats } = o;
  const wallMat = o.material || mats.plaster;
  const dx = seg.x2 - seg.x1;
  const dz = seg.z2 - seg.z1;
  const len = Math.hypot(dx, dz);
  if (len < 1e-4) return;
  const ang = Math.atan2(-dz, dx);
  const cx = (seg.x1 + seg.x2) / 2;
  const cz = (seg.z1 + seg.z2) / 2;
  const ux = dx / len;
  const uz = dz / len;

  const place = (offset, pieceLen, y0, h, material, thick = thickness) => {
    if (pieceLen <= 1e-3 || h <= 1e-3) return null;
    const c = offset + pieceLen / 2 - len / 2;
    const mesh = box(pieceLen, h, thick, material, {
      x: cx + ux * c,
      y: baseY + y0 + h / 2,
      z: cz + uz * c,
      ry: ang,
    });
    parent.add(mesh);
    return mesh;
  };

  const list = (openings || [])
    .map((op) => ({
      at: clamp(op.at, 0, len),
      end: clamp(op.at + op.w, 0, len),
      sill: op.sill ?? 0,
      head: Math.min(op.head ?? height, height),
      type: op.type || 'opening',
    }))
    .filter((op) => op.end - op.at > 0.05)
    .sort((a, b) => a.at - b.at);

  let cursor = 0;
  for (const op of list) {
    if (op.at > cursor) place(cursor, op.at - cursor, 0, height, wallMat);
    const w = op.end - op.at;
    if (op.sill > 0.01) place(op.at, w, 0, op.sill, wallMat);
    if (op.head < height - 0.01) place(op.at, w, op.head, height - op.head, wallMat);

    const midOffset = op.at + w / 2 - len / 2;
    const px = cx + ux * midOffset;
    const pz = cz + uz * midOffset;
    const oy = baseY + (op.sill + op.head) / 2;
    const oh = op.head - op.sill;

    if (op.type === 'glass' || op.type === 'window') {
      parent.add(glazing(w, oh, thickness, mats, { x: px, y: oy, z: pz, ry: ang }));
    } else if (op.type === 'door') {
      parent.add(doorLeaf(w, oh, thickness, mats, { x: px, y: oy, z: pz, ry: ang }));
    }
    cursor = op.end;
  }
  if (cursor < len) place(cursor, len - cursor, 0, height, wallMat);
}

/** A glazed panel with a dark aluminium frame and mullions. */
export function glazing(w, h, thickness, mats, pose) {
  const g = new THREE.Group();
  g.position.set(pose.x, pose.y, pose.z);
  g.rotation.y = pose.ry || 0;
  const f = 0.28; // frame width
  const t = Math.max(thickness * 0.55, 0.22);

  g.add(box(w, h, t * 0.5, mats.glass, { x: 0, y: 0, z: 0, cast: false }));
  g.add(box(w, f, t, mats.frame, { y: h / 2 - f / 2 }));
  g.add(box(w, f, t, mats.frame, { y: -h / 2 + f / 2 }));
  g.add(box(f, h, t, mats.frame, { x: -w / 2 + f / 2 }));
  g.add(box(f, h, t, mats.frame, { x: w / 2 - f / 2 }));

  const bays = Math.max(1, Math.round(w / 3.6));
  for (let i = 1; i < bays; i++) {
    g.add(box(f * 0.6, h, t, mats.frame, { x: -w / 2 + (i * w) / bays, cast: false }));
  }
  if (h > 6.5) g.add(box(w, f * 0.6, t, mats.frame, { y: -h / 2 + h * 0.32, cast: false }));
  return g;
}

/** Timber door leaf with a slim handle. */
export function doorLeaf(w, h, thickness, mats, pose) {
  const g = new THREE.Group();
  g.position.set(pose.x, pose.y, pose.z);
  g.rotation.y = pose.ry || 0;
  g.add(box(w - 0.15, h - 0.1, thickness * 0.6, mats.timber, {}));
  g.add(box(w - 0.9, h - 1.6, 0.06, mats.trim, { z: thickness * 0.35, cast: false }));
  g.add(box(0.12, 1.1, 0.12, mats.metal, { x: w / 2 - 0.65, y: -0.2, z: thickness * 0.45, cast: false }));
  return g;
}

/** Glass balustrade with a metal top rail. */
export function railing(parent, seg, mats, o) {
  const { baseY, height = 3.2 } = o;
  const dx = seg.x2 - seg.x1;
  const dz = seg.z2 - seg.z1;
  const len = Math.hypot(dx, dz);
  const ang = Math.atan2(-dz, dx);
  const cx = (seg.x1 + seg.x2) / 2;
  const cz = (seg.z1 + seg.z2) / 2;
  parent.add(box(len, 0.5, 0.55, mats.plaster, { x: cx, y: baseY + 0.25, z: cz, ry: ang }));
  parent.add(box(len, height - 0.85, 0.12, mats.glassRail, { x: cx, y: baseY + 0.5 + (height - 0.85) / 2, z: cz, ry: ang, cast: false }));
  parent.add(box(len, 0.22, 0.3, mats.metal, { x: cx, y: baseY + height - 0.1, z: cz, ry: ang }));
}

/** Straight flight of stairs rising between two levels. */
export function stairs(parent, rect, mats, o) {
  const { fromY, toY } = o;
  const rise = toY - fromY;
  const steps = 16;
  const stepRise = rise / steps;
  const runTotal = rect.z2 - rect.z1;
  const going = runTotal / steps;
  const width = rect.x2 - rect.x1 - 0.5;
  const cx = (rect.x1 + rect.x2) / 2;
  for (let i = 0; i < steps; i++) {
    const z = rect.z2 - going * (i + 0.5);
    parent.add(
      box(width, stepRise, going, mats.slab, {
        x: cx,
        y: fromY + stepRise * (i + 0.5),
        z,
      })
    );
  }
  // stringer wall on the open side
  parent.add(
    box(0.35, 3.2, runTotal, mats.glassRail, {
      x: rect.x2 - 0.1,
      y: fromY + rise / 2 + 1.6,
      z: (rect.z1 + rect.z2) / 2,
      rz: 0,
      cast: false,
    })
  );
}

/** Billboard label used by the floor-plan views. */
export function labelSprite(en, cn, scale = 1) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 192;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(17,22,28,0.82)';
  const r = 26;
  ctx.beginPath();
  ctx.roundRect(6, 6, c.width - 12, c.height - 12, r);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 62px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(cn, c.width / 2, 92, c.width - 60);
  ctx.fillStyle = '#ffd35c';
  ctx.font = '600 46px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(en.toUpperCase(), c.width / 2, 152, c.width - 60);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false, transparent: true })
  );
  sprite.scale.set(9 * scale, 3.375 * scale, 1);
  sprite.renderOrder = 999;
  return sprite;
}

export function disposeTree(obj) {
  obj.traverse((n) => {
    if (n.geometry) n.geometry.dispose();
  });
}
