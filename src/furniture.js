/** Furniture, built from soft rounded volumes in the house palette. */
import * as THREE from 'three';
import { soft, cyl, sphere, mat } from './build.js';
import { TONE } from './design.js';

const G = () => new THREE.Group();
const oak = TONE.walnut;
const fabric = '#efe9de';

/** Anything with a warm bulb registers here so the evening can light it. */
export const lamps = [];

function bulb(group, x, y, z, r = 0.22) {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#fff3d6'),
    emissive: new THREE.Color('#ffd79a'),
    emissiveIntensity: 0,
    roughness: 0.4,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m);
  mesh.position.set(x, y, z);
  group.add(mesh);
  lamps.push(m);
  return mesh;
}

const B = {
  rug: (it) => {
    const g = G();
    g.add(soft(it.w || 8, 0.08, it.d || 6, it.color || TONE.oat, { y: 0.05, radius: 0.05, cast: false }));
    return g;
  },

  sofa: (it) => {
    const g = G();
    const w = it.w || 8;
    const d = it.d || 3.2;
    const c = it.color || fabric;
    g.add(soft(w, 1.05, d, c, { y: 0.62, radius: 0.28 }));
    g.add(soft(w, 1.5, 0.7, c, { y: 1.5, z: -d / 2 + 0.3, radius: 0.3 }));
    for (const s of [-1, 1]) g.add(soft(0.7, 1.15, d, c, { x: (s * (w - 0.7)) / 2, y: 1.35, radius: 0.28 }));
    const cushions = Math.max(2, Math.round(w / 3));
    for (let i = 0; i < cushions; i++) {
      const cx = -w / 2 + (w / cushions) * (i + 0.5);
      g.add(soft(w / cushions - 0.3, 0.42, d - 0.9, '#f7f3ea', { x: cx, y: 1.2, z: 0.15, radius: 0.18 }));
    }
    g.add(soft(1.2, 1.1, 0.35, TONE.clay, { x: -w / 2 + 1.2, y: 1.55, z: -d / 2 + 0.75, radius: 0.16, rz: 0.2 }));
    return g;
  },

  armchair: (it) => {
    const g = G();
    const c = it.color || TONE.sage;
    g.add(soft(2.8, 0.9, 2.8, c, { y: 0.75, radius: 0.32 }));
    g.add(soft(2.8, 1.5, 0.5, c, { y: 1.6, z: -1.15, radius: 0.25 }));
    for (const s of [-1, 1]) g.add(soft(0.45, 0.8, 2.6, c, { x: s * 1.2, y: 1.4, radius: 0.2 }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      g.add(cyl(0.09, 0.09, 0.6, oak, { x: sx * 1, y: 0.3, z: sz * 1 }));
    return g;
  },

  ottoman: () => {
    const g = G();
    g.add(soft(2, 1.1, 2, TONE.oat, { y: 0.55, radius: 0.4 }));
    return g;
  },

  coffeeTable: (it) => {
    const g = G();
    const w = it.w || 4.5;
    const d = it.d || 2.4;
    g.add(soft(w, 0.22, d, oak, { y: 1.35, radius: 0.1 }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      g.add(cyl(0.1, 0.1, 1.3, oak, { x: sx * (w / 2 - 0.45), y: 0.65, z: sz * (d / 2 - 0.4) }));
    g.add(soft(0.9, 0.2, 0.6, TONE.terracotta, { y: 1.55, x: -w / 4, radius: 0.08 }));
    g.add(cyl(0.28, 0.34, 0.5, '#f7f3ea', { x: w / 5, y: 1.7 }));
    return g;
  },

  sideTable: () => {
    const g = G();
    g.add(cyl(0.85, 0.85, 0.18, oak, { y: 1.8 }));
    g.add(cyl(0.16, 0.22, 1.8, oak, { y: 0.9 }));
    return g;
  },

  tvWall: (it) => {
    const g = G();
    const w = it.w || 10;
    g.add(soft(w, 7.2, 0.5, TONE.shellWarm, { y: 3.6, radius: 0.06 }));
    g.add(soft(w * 0.52, 2.9, 0.16, '#3b3a38', { y: 4.4, z: 0.35, radius: 0.08 }));
    g.add(soft(w * 0.8, 0.9, 1.3, oak, { y: 0.5, z: 0.6, radius: 0.12 }));
    for (let i = 0; i < 3; i++)
      g.add(soft(w * 0.22, 0.14, 0.9, oak, { x: -w * 0.3 + i * w * 0.3, y: 6.4, z: 0.35, radius: 0.05 }));
    g.add(soft(0.35, 0.8, 0.35, TONE.sage, { x: -w * 0.3, y: 6.9, z: 0.35, radius: 0.12 }));
    return g;
  },

  floorLamp: () => {
    const g = G();
    g.add(cyl(0.55, 0.62, 0.14, '#3b3a38', { y: 0.07 }));
    g.add(cyl(0.07, 0.07, 5, '#3b3a38', { y: 2.5 }));
    g.add(cyl(0.75, 0.55, 1.1, '#f6ead2', { y: 5.3 }));
    bulb(g, 0, 5.1, 0, 0.28);
    return g;
  },

  pendant: (it) => {
    const g = G();
    const n = it.count || 1;
    const spread = it.spread || 3;
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? 0 : -spread / 2 + (spread / (n - 1)) * i;
      g.add(cyl(0.02, 0.02, 3.2, '#3b3a38', { x, y: 7.6 }));
      g.add(cyl(0.55, 0.3, 0.75, '#f2dcb2', { x, y: 5.7 }));
      bulb(g, x, 5.4, 0, 0.2);
    }
    return g;
  },

  plant: (it) => {
    const g = G();
    const h = it.h || 3.5;
    g.add(cyl(0.62, 0.5, 0.95, TONE.terracotta, { y: 0.48 }));
    g.add(cyl(0.55, 0.5, 0.16, '#6b5744', { y: 0.95 }));
    g.add(cyl(0.07, 0.09, h * 0.6, '#7d8f6a', { y: 0.95 + (h * 0.6) / 2 }));
    const leaves = Math.round(4 + h);
    for (let i = 0; i < leaves; i++) {
      const a = (i / leaves) * Math.PI * 2 + i * 0.7;
      const lift = 0.95 + h * (0.4 + 0.55 * (i / leaves));
      const leaf = sphere(0.62, i % 2 ? TONE.moss : '#7f9a74', {
        x: Math.cos(a) * (0.5 + h * 0.11),
        y: lift,
        z: Math.sin(a) * (0.5 + h * 0.11),
        sy: 0.38,
        sx: 1.15,
      });
      leaf.rotation.set(0.4 * Math.sin(a), a, 0.35);
      g.add(leaf);
    }
    return g;
  },

  /* ------------------------------------------------------------ dining */
  diningTable: (it) => {
    const g = G();
    const w = it.w || 3.6;
    const d = it.d || 7;
    g.add(soft(w, 0.24, d, oak, { y: 2.4, radius: 0.1 }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      g.add(cyl(0.13, 0.13, 2.3, oak, { x: sx * (w / 2 - 0.4), y: 1.15, z: sz * (d / 2 - 0.5) }));
    const n = it.chairs || 6;
    for (let i = 0; i < n; i++) {
      const side = i < n / 2 ? -1 : 1;
      const idx = i % (n / 2);
      const z = -d / 2 + (d / (n / 2)) * (idx + 0.5);
      const c = G();
      c.position.set(side * (w / 2 + 1), 0, z);
      c.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      c.add(soft(1.5, 0.18, 1.5, TONE.oat, { y: 1.5, radius: 0.1 }));
      c.add(soft(1.5, 1.6, 0.16, TONE.oat, { y: 2.3, z: -0.65, radius: 0.1 }));
      for (const sx of [-1, 1]) for (const sz of [-1, 1])
        c.add(cyl(0.07, 0.07, 1.5, oak, { x: sx * 0.6, y: 0.75, z: sz * 0.6 }));
      g.add(c);
    }
    g.add(cyl(0.4, 0.3, 0.5, '#f7f3ea', { y: 2.75 }));
    g.add(sphere(0.3, TONE.moss, { y: 3.2, sy: 0.9 }));
    return g;
  },

  sideboard: (it) => {
    const g = G();
    g.add(soft(it.w || 8, 3, it.d || 1.6, TONE.linen, { y: 1.5, radius: 0.12 }));
    g.add(soft((it.w || 8) - 0.2, 0.14, (it.d || 1.6) + 0.1, oak, { y: 3.05, radius: 0.05 }));
    g.add(cyl(0.35, 0.28, 0.75, TONE.clay, { x: -(it.w || 8) / 4, y: 3.45 }));
    g.add(soft(1.4, 1.8, 0.12, oak, { x: (it.w || 8) / 4, y: 4, radius: 0.06 }));
    return g;
  },

  /* ----------------------------------------------------------- kitchen */
  counter: (it) => {
    const g = G();
    const w = it.w || 8;
    const d = it.d || 2.1;
    g.add(soft(w, 2.85, d, TONE.linen, { y: 1.43, radius: 0.08 }));
    g.add(soft(w, 0.22, d + 0.08, '#f0ece3', { y: 2.95, radius: 0.06 }));
    const doors = Math.max(2, Math.round(w / 2.2));
    for (let i = 0; i < doors; i++)
      g.add(soft(w / doors - 0.16, 2.4, 0.08, TONE.oat, { x: -w / 2 + (w / doors) * (i + 0.5), y: 1.45, z: d / 2, radius: 0.05 }));
    return g;
  },

  island: (it) => {
    const g = G();
    const w = it.w || 7;
    const d = it.d || 3;
    g.add(soft(w, 2.85, d, TONE.oat, { y: 1.43, radius: 0.1 }));
    g.add(soft(w + 0.5, 0.26, d + 0.4, '#f2eee5', { y: 3, radius: 0.08 }));
    g.add(soft(1.6, 0.1, 1.1, '#cfd3cf', { y: 3.12, x: -w / 4, radius: 0.04 }));
    const n = it.stools || 3;
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (w / n) * (i + 0.5);
      g.add(cyl(0.6, 0.6, 0.2, oak, { x, y: 2.1, z: d / 2 + 1.2 }));
      g.add(cyl(0.1, 0.14, 2, '#3b3a38', { x, y: 1, z: d / 2 + 1.2 }));
    }
    return g;
  },

  islandLow: (it) => {
    const g = G();
    g.add(soft(it.w || 5, 2.6, it.d || 2.4, TONE.linen, { y: 1.3, radius: 0.1 }));
    g.add(soft((it.w || 5) + 0.2, 0.16, (it.d || 2.4) + 0.2, oak, { y: 2.7, radius: 0.06 }));
    return g;
  },

  fridge: () => {
    const g = G();
    g.add(soft(2.6, 6.2, 2.4, '#eae7e0', { y: 3.1, radius: 0.16 }));
    g.add(soft(0.1, 3, 0.1, '#b9b4aa', { x: 1.2, y: 4.4, z: 1.1 }));
    return g;
  },

  stove: () => {
    const g = G();
    g.add(soft(2.6, 0.12, 2, '#3b3a38', { y: 3.05, radius: 0.05 }));
    g.add(soft(2.8, 1.6, 1.6, '#e8e4dc', { y: 6.4, radius: 0.1 }));
    return g;
  },

  washer: () => {
    const g = G();
    g.add(soft(2.2, 3, 2.2, '#eceae4', { y: 1.5, radius: 0.14 }));
    g.add(cyl(0.65, 0.65, 0.14, '#cdd9e0', { y: 1.7, z: 1.1, rx: Math.PI / 2 }));
    return g;
  },

  /* ---------------------------------------------------------- bathroom */
  basin: () => {
    const g = G();
    g.add(soft(2.6, 1.5, 1.7, TONE.linen, { y: 2.1, radius: 0.12 }));
    g.add(soft(2.8, 0.16, 1.8, '#f2eee5', { y: 2.92, radius: 0.06 }));
    g.add(cyl(0.55, 0.62, 0.42, '#fbf9f4', { y: 3.1 }));
    g.add(cyl(0.06, 0.06, 0.9, '#b5ada0', { y: 3.5, z: -0.6 }));
    g.add(cyl(0.85, 0.85, 0.1, '#efe9dd', { y: 5.4, z: -0.8, rx: Math.PI / 2 }));
    return g;
  },

  toilet: () => {
    const g = G();
    g.add(soft(1.5, 1.3, 2.1, '#fbf9f4', { y: 0.7, radius: 0.28 }));
    g.add(soft(1.5, 2.4, 0.7, '#fbf9f4', { y: 1.2, z: -1, radius: 0.2 }));
    return g;
  },

  shower: () => {
    const g = G();
    g.add(soft(3.2, 0.16, 3.2, '#e4ded2', { y: 0.08, radius: 0.05 }));
    const glass = mat('#cfe0e6', { opacity: 0.34, rough: 0.1 });
    g.add(soft(0.1, 7, 3.2, glass, { x: 1.6, y: 3.5, cast: false }));
    g.add(soft(3.2, 7, 0.1, glass, { z: 1.6, y: 3.5, cast: false }));
    g.add(cyl(0.5, 0.5, 0.1, '#d9d3c8', { y: 6.6, z: -1.2 }));
    return g;
  },

  bathtub: () => {
    const g = G();
    g.add(soft(3.2, 2, 6, '#fbf9f4', { y: 1, radius: 0.55 }));
    g.add(soft(2.4, 0.3, 5.2, '#e7eef0', { y: 1.9, radius: 0.3, cast: false }));
    g.add(cyl(0.07, 0.07, 1.6, '#b5ada0', { y: 2.4, z: -2.6 }));
    return g;
  },

  /* ----------------------------------------------------------- bedroom */
  bed: (it) => {
    const g = G();
    const w = it.w || 6;
    const d = it.d || 7;
    g.add(soft(w, 1, d, oak, { y: 0.5, radius: 0.12 }));
    g.add(soft(w - 0.3, 0.8, d - 0.5, '#f7f3ea', { y: 1.35, z: 0.15, radius: 0.22 }));
    g.add(soft(w - 0.3, 0.35, d * 0.45, TONE.oat, { y: 1.8, z: d * 0.24, radius: 0.16 }));
    g.add(soft(w + 0.4, 3.4, 0.5, TONE.linen, { y: 1.9, z: -d / 2 - 0.1, radius: 0.2 }));
    const pw = (w - 1.2) / 2;
    for (const s of [-1, 1])
      g.add(soft(pw, 0.55, 1.5, '#fbf9f4', { x: (s * (pw + 0.3)) / 2, y: 1.95, z: -d / 2 + 1.2, radius: 0.24 }));
    return g;
  },

  nightstand: () => {
    const g = G();
    g.add(soft(1.8, 1.7, 1.5, oak, { y: 0.9, radius: 0.14 }));
    g.add(cyl(0.42, 0.32, 0.62, '#f6ead2', { y: 2.1 }));
    bulb(g, 0, 2.05, 0, 0.18);
    return g;
  },

  wardrobe: (it) => {
    const g = G();
    const w = it.w || 6;
    const h = it.h || 8;
    g.add(soft(w, h, 2, TONE.linen, { y: h / 2, radius: 0.1 }));
    const doors = Math.max(2, Math.round(w / 2.2));
    for (let i = 0; i < doors; i++)
      g.add(soft(w / doors - 0.14, h - 0.3, 0.1, TONE.oat, { x: -w / 2 + (w / doors) * (i + 0.5), y: h / 2, z: 1, radius: 0.05 }));
    return g;
  },

  bench: (it) => {
    const g = G();
    const w = it.w || 4;
    g.add(soft(w, 0.3, 1.4, oak, { y: 1.5, radius: 0.1 }));
    g.add(soft(w - 0.3, 0.35, 1.2, TONE.oat, { y: 1.78, radius: 0.15 }));
    for (const s of [-1, 1]) g.add(cyl(0.09, 0.09, 1.5, oak, { x: s * (w / 2 - 0.4), y: 0.75 }));
    return g;
  },

  daybed: (it) => {
    const g = G();
    const w = it.w || 6;
    const d = it.d || 3;
    g.add(soft(w, 1.1, d, oak, { y: 0.55, radius: 0.12 }));
    g.add(soft(w - 0.2, 0.6, d - 0.2, TONE.linen, { y: 1.4, radius: 0.2 }));
    for (let i = 0; i < 3; i++)
      g.add(soft(1.3, 1.3, 0.35, i % 2 ? TONE.clay : TONE.sage, { x: -w / 2 + 1.1 + i * 1.6, y: 2.1, z: -d / 2 + 0.4, radius: 0.14, rz: 0.15 }));
    return g;
  },

  /* -------------------------------------------------------------- work */
  desk: (it) => {
    const g = G();
    const w = it.w || 6;
    const d = it.d || 2.2;
    g.add(soft(w, 0.2, d, oak, { y: 2.4, radius: 0.08 }));
    for (const s of [-1, 1]) g.add(soft(0.16, 2.4, d - 0.2, oak, { x: s * (w / 2 - 0.3), y: 1.2, radius: 0.05 }));
    g.add(soft(1.9, 1.2, 0.12, '#3b3a38', { y: 3.1, z: -0.4, radius: 0.06 }));
    g.add(cyl(0.3, 0.36, 0.45, TONE.terracotta, { x: w / 2 - 1, y: 2.7 }));
    return g;
  },

  chair: () => {
    const g = G();
    g.add(soft(1.6, 0.2, 1.6, TONE.oat, { y: 1.5, radius: 0.1 }));
    g.add(soft(1.6, 1.7, 0.16, TONE.oat, { y: 2.35, z: -0.7, radius: 0.1 }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      g.add(cyl(0.07, 0.07, 1.5, oak, { x: sx * 0.6, y: 0.75, z: sz * 0.6 }));
    return g;
  },

  bookshelf: (it) => {
    const g = G();
    const w = it.w || 8;
    const h = it.h || 7;
    g.add(soft(w, h, 1.2, TONE.linen, { y: h / 2, radius: 0.08 }));
    const shelves = Math.round(h / 1.6);
    for (let s = 1; s < shelves; s++) {
      const y = (h / shelves) * s;
      g.add(soft(w - 0.3, 0.1, 1.1, oak, { y, z: 0.05, radius: 0.03 }));
      const books = Math.floor(w / 0.5);
      for (let i = 0; i < books; i++) {
        if (Math.random() > 0.72) continue;
        const hh = 0.9 + Math.random() * 0.5;
        const colors = [TONE.clay, TONE.sage, TONE.butter, TONE.mist, TONE.rose, TONE.linen];
        g.add(
          soft(0.3, hh, 0.85, colors[(i + s) % colors.length], {
            x: -w / 2 + 0.4 + i * 0.42, y: y + hh / 2 + 0.05, z: 0.1, radius: 0.03,
          })
        );
      }
    }
    return g;
  },

  bookshelfLow: (it) => B.bookshelf({ ...it, h: 3.2, w: it.w || 5 }),

  shoeCabinet: (it) => {
    const g = G();
    const w = it.w || 8;
    const h = it.h || 7;
    g.add(soft(w, h * 0.42, 1.6, TONE.linen, { y: h * 0.21, radius: 0.1 }));
    g.add(soft(w, h * 0.4, 1.6, TONE.linen, { y: h * 0.8, radius: 0.1 }));
    g.add(soft(w - 0.4, 0.12, 1.5, oak, { y: h * 0.45, radius: 0.04 }));
    g.add(cyl(0.3, 0.24, 0.5, TONE.sage, { x: -w / 4, y: h * 0.51 }));
    g.add(soft(0.9, 0.5, 0.9, TONE.clay, { x: w / 5, y: h * 0.48, radius: 0.12 }));
    return g;
  },

  staircase: (it) => {
    const g = G();
    const w = it.w || 6;
    const d = it.d || 10;
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      g.add(
        soft(w * 0.8, 0.55, d / steps, oak, {
          x: 0, y: 0.3 + i * 0.75, z: d / 2 - (d / steps) * (i + 0.5), radius: 0.06,
        })
      );
    }
    for (let i = 0; i < steps; i += 2) {
      g.add(cyl(0.05, 0.05, 2.6, '#3b3a38', { x: w * 0.4, y: 1.6 + i * 0.75, z: d / 2 - (d / steps) * (i + 0.5) }));
    }
    return g;
  },

  dryingRack: () => {
    const g = G();
    for (const s of [-1, 1]) g.add(cyl(0.08, 0.08, 5, '#d8d2c6', { x: s * 2, y: 2.5 }));
    g.add(cyl(0.06, 0.06, 4, '#d8d2c6', { y: 4.8, rz: Math.PI / 2 }));
    for (let i = 0; i < 3; i++)
      g.add(soft(1.1, 2.2, 0.1, i % 2 ? '#eef0ea' : TONE.mist, { x: -1.3 + i * 1.3, y: 3.6, radius: 0.08 }));
    return g;
  },

  car: () => {
    const g = G();
    g.add(soft(5.8, 2, 13.6, '#e8e4dc', { y: 2.1, radius: 0.6 }));
    g.add(soft(5.2, 1.7, 7, '#cdd9e0', { y: 3.7, z: -0.4, radius: 0.5 }));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const wheel = cyl(1, 1, 0.7, '#3b3a38', { x: sx * 2.8, y: 1, z: sz * 4.2, rz: Math.PI / 2, seg: 16 });
      g.add(wheel);
    }
    return g;
  },
};

export function makeFurniture(item) {
  const fn = B[item.type];
  if (!fn) return null;
  const g = fn(item);
  g.userData.furniture = true;
  return g;
}

export function resetLamps() {
  lamps.length = 0;
}
