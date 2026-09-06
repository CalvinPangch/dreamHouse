/** Blocky furniture - enough to read the layout without hurting the frame rate. */
import * as THREE from 'three';
import { box } from './build.js';

function group() {
  return new THREE.Group();
}

const builders = {
  sofa(item, m) {
    const g = group();
    const w = item.w || 7;
    const d = item.d || 3;
    g.add(box(w, 0.9, d, m.fabric, { y: 0.45 }));
    g.add(box(w, 1.6, 0.6, m.fabric, { y: 1.2, z: -d / 2 + 0.3 }));
    g.add(box(0.6, 1.3, d, m.fabric, { x: -w / 2 + 0.3, y: 1.05 }));
    g.add(box(0.6, 1.3, d, m.fabric, { x: w / 2 - 0.3, y: 1.05 }));
    return g;
  },
  rug(item, m) {
    const g = group();
    g.add(box(item.w || 8, 0.06, item.d || 5, m.fabricWarm, { y: 0.03, cast: false }));
    return g;
  },
  console(item, m) {
    const g = group();
    const w = item.w || 6;
    g.add(box(w, 1.4, item.d || 1.4, m.wood, { y: 0.7 }));
    g.add(box(w * 0.75, w * 0.42, 0.15, m.trim, { y: 3.6 }));
    return g;
  },
  table(item, m) {
    const g = group();
    const w = item.w || 6;
    const d = item.d || 3;
    g.add(box(w, 0.2, d, m.wood, { y: 2.4 }));
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        g.add(box(0.25, 2.4, 0.25, m.trim, { x: (sx * (w / 2 - 0.5)), y: 1.2, z: sz * (d / 2 - 0.5) }));
      }
    }
    const chairs = item.chairs || 0;
    const per = Math.ceil(chairs / 2);
    for (let i = 0; i < chairs; i++) {
      const side = i < per ? -1 : 1;
      const idx = i % per;
      const x = -w / 2 + (w * (idx + 0.5)) / per;
      const z = side * (d / 2 + 0.9);
      g.add(box(1.4, 0.18, 1.4, m.wood, { x, y: 1.5, z }));
      g.add(box(1.4, 1.8, 0.16, m.wood, { x, y: 2.4, z: z + side * 0.6 }));
    }
    return g;
  },
  counter(item, m) {
    const g = group();
    const w = item.w || 8;
    const d = item.d || 2;
    g.add(box(w, 2.9, d, m.white, { y: 1.45 }));
    g.add(box(w + 0.1, 0.18, d + 0.1, m.trim, { y: 3.0 }));
    g.add(box(w, 1.8, d * 0.6, m.plasterShade, { y: 6.2, z: -d * 0.2 }));
    return g;
  },
  fridge(item, m) {
    const g = group();
    g.add(box(2.6, 6, 2.4, m.metal, { y: 3 }));
    return g;
  },
  toilet(item, m) {
    const g = group();
    g.add(box(1.4, 1.3, 2.2, m.white, { y: 0.65 }));
    g.add(box(1.5, 2.4, 0.6, m.white, { y: 1.2, z: -0.9 }));
    return g;
  },
  sink(item, m) {
    const g = group();
    g.add(box(2.4, 0.4, 1.6, m.white, { y: 2.6 }));
    g.add(box(2.2, 2.6, 1.4, m.plasterShade, { y: 1.3 }));
    g.add(box(1.8, 2.6, 0.12, m.glassRail, { y: 5.2, z: -0.75, cast: false }));
    return g;
  },
  shower(item, m) {
    const g = group();
    g.add(box(3, 0.2, 3, m.white, { y: 0.1 }));
    g.add(box(0.12, 7, 3, m.glassRail, { x: 1.5, y: 3.5, cast: false }));
    g.add(box(3, 7, 0.12, m.glassRail, { z: 1.5, y: 3.5, cast: false }));
    return g;
  },
  bed(item, m) {
    const g = group();
    const w = item.w || 5;
    const d = item.d || 6.5;
    g.add(box(w, 1.1, d, m.wood, { y: 0.55 }));
    g.add(box(w - 0.3, 0.7, d - 0.4, m.fabricWarm, { y: 1.45 }));
    g.add(box(w, 3, 0.4, m.trim, { y: 1.5, z: -d / 2 + 0.2 }));
    const pw = (w - 1) / 2;
    for (const s of [-1, 1]) {
      g.add(box(pw - 0.2, 0.5, 1.4, m.white, { x: (s * (pw + 0.2)) / 2, y: 1.95, z: -d / 2 + 1.2 }));
    }
    return g;
  },
  wardrobe(item, m) {
    const g = group();
    g.add(box(item.w || 6, 7.5, item.d || 2, m.plasterShade, { y: 3.75 }));
    g.add(box((item.w || 6) - 0.3, 7.2, 0.1, m.wood, { y: 3.75, z: (item.d || 2) / 2 }));
    return g;
  },
  car(item, m) {
    const g = group();
    g.add(box(5.9, 2.1, 14.2, m.carBody, { y: 2.1 }));
    g.add(box(5.4, 1.9, 7.6, m.carGlass, { y: 3.9, z: -0.4 }));
    g.add(box(5.7, 0.5, 13.6, m.trim, { y: 1.1, cast: false }));
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.8, 18), m.tyre);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(sx * 2.85, 1.05, sz * 4.4);
        wheel.castShadow = true;
        g.add(wheel);
      }
    }
    return g;
  },
};

export function makeFurniture(item, mats) {
  const fn = builders[item.type];
  if (!fn) return null;
  const g = fn(item, mats);
  g.userData.furniture = true;
  return g;
}
