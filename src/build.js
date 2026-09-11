/** Geometry helpers: soft rounded volumes and walls derived from the room plan. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const matCache = new Map();

/** Matte material, cached per colour, in the soft clay finish the whole model uses. */
export function mat(color, opts = {}) {
  const key = `${color}|${opts.rough ?? 0.92}|${opts.metal ?? 0}|${opts.opacity ?? 1}|${opts.emissive || ''}`;
  if (!matCache.has(key)) {
    matCache.set(
      key,
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: opts.rough ?? 0.92,
        metalness: opts.metal ?? 0,
        transparent: (opts.opacity ?? 1) < 1,
        opacity: opts.opacity ?? 1,
        emissive: new THREE.Color(opts.emissive || '#000000'),
        emissiveIntensity: opts.emissiveIntensity ?? 0,
      })
    );
  }
  return matCache.get(key);
}

export function clearMaterialCache() {
  matCache.clear();
}

/** Soft-cornered box - the shape everything in this house is made of. */
export function soft(w, h, d, color, opts = {}) {
  const r = Math.min(opts.radius ?? 0.12, w / 2.2, h / 2.2, d / 2.2);
  const geo = new RoundedBoxGeometry(w, h, d, opts.segments ?? 2, Math.max(r, 0.01));
  const mesh = new THREE.Mesh(geo, typeof color === 'string' ? mat(color, opts) : color);
  mesh.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
  if (opts.rot) mesh.rotation.y = opts.rot;
  if (opts.rx) mesh.rotation.x = opts.rx;
  if (opts.rz) mesh.rotation.z = opts.rz;
  mesh.castShadow = opts.cast !== false;
  mesh.receiveShadow = opts.receive !== false;
  return mesh;
}

export function cyl(rTop, rBottom, h, color, opts = {}) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBottom, h, opts.seg ?? 18),
    typeof color === 'string' ? mat(color, opts) : color
  );
  mesh.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
  if (opts.rot) mesh.rotation.y = opts.rot;
  if (opts.rx) mesh.rotation.x = opts.rx;
  if (opts.rz) mesh.rotation.z = opts.rz;
  mesh.castShadow = opts.cast !== false;
  mesh.receiveShadow = opts.receive !== false;
  return mesh;
}

export function sphere(r, color, opts = {}) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(r, opts.seg ?? 18, opts.seg2 ?? 14),
    typeof color === 'string' ? mat(color, opts) : color
  );
  mesh.position.set(opts.x || 0, opts.y || 0, opts.z || 0);
  mesh.scale.set(opts.sx ?? 1, opts.sy ?? 1, opts.sz ?? 1);
  mesh.castShadow = opts.cast !== false;
  mesh.receiveShadow = opts.receive !== false;
  return mesh;
}

/* ------------------------------------------------------------------ walls */

const key = (axis, at) => `${axis}|${at}`;

function mergeRuns(list) {
  const sorted = [...list].sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const [a, b] of sorted) {
    const last = out[out.length - 1];
    if (last && a <= last[1] + 1e-6) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

function subtract(runs, holes) {
  let out = runs;
  for (const [ha, hb] of holes) {
    const next = [];
    for (const [a, b] of out) {
      if (hb <= a || ha >= b) {
        next.push([a, b]);
        continue;
      }
      if (ha > a) next.push([a, ha]);
      if (hb < b) next.push([hb, b]);
    }
    out = next;
  }
  return out.filter(([a, b]) => b - a > 0.05);
}

/**
 * Walls are not authored by hand: every room edge becomes a wall line, shared
 * edges merge, and the doors listed in the design punch the openings.
 *
 * Returns [{ x1, z1, x2, z2, exterior }]
 */
export function deriveWalls(rooms, doors = []) {
  const lines = new Map();
  const add = (k, a, b) => {
    if (!lines.has(k)) lines.set(k, []);
    lines.get(k).push([Math.min(a, b), Math.max(a, b)]);
  };

  for (const r of rooms) {
    if (r.open) continue;
    add(key('z', r.x1), r.z1, r.z2); // wall at constant x, running along z
    add(key('z', r.x2), r.z1, r.z2);
    add(key('x', r.z1), r.x1, r.x2); // wall at constant z, running along x
    add(key('x', r.z2), r.x1, r.x2);
  }

  const holes = new Map();
  for (const d of doors) {
    const k = d.axis === 'x' ? key('x', d.at) : key('z', d.at);
    if (!holes.has(k)) holes.set(k, []);
    holes.get(k).push([d.from, d.to]);
  }

  const bounds = rooms.reduce(
    (b, r) => ({
      x1: Math.min(b.x1, r.x1), x2: Math.max(b.x2, r.x2),
      z1: Math.min(b.z1, r.z1), z2: Math.max(b.z2, r.z2),
    }),
    { x1: Infinity, x2: -Infinity, z1: Infinity, z2: -Infinity }
  );

  const walls = [];
  for (const [k, list] of lines) {
    const [axis, atStr] = k.split('|');
    const at = Number(atStr);
    const runs = subtract(mergeRuns(list), holes.get(k) || []);
    for (const [a, b] of runs) {
      const exterior =
        axis === 'z' ? at === bounds.x1 || at === bounds.x2 : at === bounds.z1 || at === bounds.z2;
      walls.push(
        axis === 'z'
          ? { x1: at, z1: a, x2: at, z2: b, exterior, axis }
          : { x1: a, z1: at, x2: b, z2: at, exterior, axis }
      );
    }
  }
  return walls;
}

/** Screen-space projection used to pin the HTML room labels to the model. */
export function projectToScreen(vec3, camera, width, height) {
  const v = vec3.clone().project(camera);
  return {
    x: (v.x * 0.5 + 0.5) * width,
    y: (-v.y * 0.5 + 0.5) * height,
    visible: v.z < 1,
  };
}
