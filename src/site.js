/** Streetscape for the semi-detached scheme: lots, driveways, terraces, road. */
import * as THREE from 'three';
import { DIM, Z, TOTAL_DEPTH } from './config.js';
import { box } from './build.js';

const W = DIM.unitWidth;
const REAR = -12.75;                 // rear boundary
const FRONT = Z.porch + 3;           // front boundary / gate line  (lot = 80' deep)
const ROAD_Z = FRONT + 5 + 14;

function tree(mats, h = 18) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, h * 0.45, 8), mats.trunk);
  trunk.position.y = (h * 0.45) / 2;
  trunk.castShadow = true;
  g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const r = h * (0.3 - i * 0.05);
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), i % 2 ? mats.foliageDark : mats.foliage);
    m.position.set((Math.random() - 0.5) * 3, h * 0.5 + i * r * 0.75, (Math.random() - 0.5) * 3);
    m.castShadow = true;
    g.add(m);
  }
  return g;
}

function palm(mats, h = 22) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.7, h, 8), mats.trunk);
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  g.add(trunk);
  for (let i = 0; i < 7; i++) {
    g.add(
      box(9, 0.25, 1.8, mats.foliage, {
        x: Math.cos((i / 7) * Math.PI * 2) * 4.5,
        y: h - 0.5,
        z: Math.sin((i / 7) * Math.PI * 2) * 4.5,
        ry: -(i / 7) * Math.PI * 2,
        rz: 0.35,
      })
    );
  }
  return g;
}

function lampPost(mats) {
  const g = new THREE.Group();
  g.add(box(0.8, 0.6, 0.8, mats.lamp, { y: 0.3 }));
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 20, 10), mats.lamp);
  pole.position.y = 10;
  pole.castShadow = true;
  g.add(pole);
  g.add(box(4, 0.35, 0.6, mats.lamp, { x: 1.8, y: 20 }));
  g.add(box(2.4, 0.6, 1.4, mats.lampGlow, { x: 3.4, y: 19.6 }));
  return g;
}

/** Boundary wall, piers and sliding gate across one lot. */
function frontage(parent, x0, width, mats) {
  const wallH = 3.4;
  const pierW = 1.3;
  for (const px of [x0 + pierW / 2, x0 + width - pierW / 2]) {
    parent.add(box(pierW, wallH + 1.3, 1.3, mats.plaster, { x: px, y: (wallH + 1.3) / 2, z: FRONT }));
    parent.add(box(pierW + 0.3, 0.3, 1.6, mats.charcoal, { x: px, y: wallH + 1.45, z: FRONT }));
  }
  const gateW = width - 2 * pierW - 0.4;
  const gx = x0 + width / 2;
  parent.add(box(gateW, 0.35, 0.35, mats.metal, { x: gx, y: wallH - 0.2, z: FRONT }));
  parent.add(box(gateW, 0.35, 0.35, mats.metal, { x: gx, y: 0.3, z: FRONT }));
  const bars = Math.floor(gateW / 0.9);
  for (let i = 0; i <= bars; i++) {
    parent.add(
      box(0.16, wallH - 0.4, 0.16, mats.metal, {
        x: x0 + pierW + 0.2 + (i * gateW) / bars,
        y: wallH / 2,
        z: FRONT,
        cast: false,
      })
    );
  }
}

export function buildSite(mats, row) {
  const site = new THREE.Group();
  const total = row.totalWidth;

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), mats.grass);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(total / 2, -0.05, 20);
  ground.receiveShadow = true;
  site.add(ground);

  // road, kerbs, footpath
  site.add(box(total + 320, 0.3, 28, mats.road, { x: total / 2, y: 0.05, z: ROAD_Z, cast: false }));
  for (const s of [-1, 1]) {
    site.add(box(total + 320, 0.75, 1.2, mats.kerb, { x: total / 2, y: 0.37, z: ROAD_Z + s * 14.6, cast: false }));
  }
  site.add(box(total + 320, 0.4, 5, mats.paver, { x: total / 2, y: 0.2, z: FRONT + 2.5, cast: false }));
  for (let i = -14; i < 14; i++) {
    site.add(box(6, 0.06, 0.5, mats.white, { x: total / 2 + i * 13, y: 0.22, z: ROAD_Z, cast: false }));
  }

  // per lot: driveway, side terrace, garden, boundary
  for (const u of row.units) {
    const sign = u.mirror ? -1 : 1;
    const inner = u.x;                       // party wall
    const outer = u.x + sign * W;            // outer wall
    const lotEdge = u.x + sign * DIM.lotWidth;
    const mid = (inner + outer) / 2;

    // driveway from the gate, under the car porch
    site.add(
      box(W - 1, 0.35, FRONT - Z.front, mats.paver, {
        x: mid,
        y: 0.18,
        z: (Z.front + FRONT) / 2,
        cast: false,
      })
    );
    // side terrace along the outer wall ("TERRACE" on the plan)
    site.add(
      box(5, 0.35, Z.front - Z.b, mats.paver, {
        x: outer + sign * 2.7,
        y: 0.18,
        z: (Z.b + Z.front) / 2,
        cast: false,
      })
    );
    // rear terrace + service yard
    site.add(
      box(W, 0.35, 6, mats.paver, { x: mid, y: 0.18, z: -3.2, cast: false })
    );
    // planting in the side garden
    for (let i = 0; i < 3; i++) {
      site.add(
        box(2.6, 1.5, 6, mats.hedge, {
          x: lotEdge - sign * 2,
          y: 0.75,
          z: 8 + i * 14,
        })
      );
    }
    // side and rear boundary walls
    site.add(box(0.5, 6.5, TOTAL_DEPTH - REAR + 3, mats.plasterShade, { x: lotEdge, y: 3.25, z: (REAR + FRONT) / 2 }));
    site.add(box(DIM.lotWidth, 6.5, 0.5, mats.plasterShade, { x: (u.x + lotEdge) / 2, y: 3.25, z: REAR }));
    frontage(site, Math.min(u.x, lotEdge), DIM.lotWidth, mats);
  }

  // street planting: one tree and a lamp on each lot boundary
  for (let i = 0; i <= row.lots; i++) {
    const x = i * DIM.lotWidth;
    // trees sit in the gap between pairs, lamps on the party wall line, so
    // neither stands in front of a facade
    if (i % 2 === 0) site.add(placed(tree(mats, 15 + Math.random() * 4), x, 0, FRONT + 7));
    else site.add(placed(lampPost(mats), x, 0, FRONT + 4.6));
  }
  for (let x = -90; x < total + 100; x += 28) {
    if (x > -20 && x < total + 20) continue;
    site.add(placed(tree(mats, 16 + Math.random() * 8), x, 0, ROAD_Z + 18 + Math.random() * 4));
  }
  for (let i = 0; i < 6; i++) {
    site.add(placed(palm(mats, 20 + Math.random() * 8), -70 - i * 24, 0, ROAD_Z + 34 + Math.random() * 28));
    site.add(placed(tree(mats, 20 + Math.random() * 10), total + 50 + i * 22, 0, ROAD_Z + 34 + Math.random() * 36));
  }
  site.add(box(total + 280, 5, 4, mats.hedge, { x: total / 2, y: 2.5, z: ROAD_Z + 28 }));

  return site;
}

function placed(obj, x, y, z) {
  obj.position.set(x, y, z);
  return obj;
}
