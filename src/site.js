/** Streetscape: driveways, boundary fencing, landscaping, guard post. */
import * as THREE from 'three';
import { DIM } from './config.js';
import { box } from './build.js';

const D = DIM.builtUp;
const FRONT = DIM.lotDepth - DIM.rearYard; // 54' - front boundary line
const REAR = -DIM.rearYard;

function tree(mats, h = 18) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, h * 0.45, 8), mats.trunk);
  trunk.position.y = (h * 0.45) / 2;
  trunk.castShadow = true;
  g.add(trunk);
  const blobs = 3;
  for (let i = 0; i < blobs; i++) {
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
    const frond = box(9, 0.25, 1.8, mats.foliage, {
      x: Math.cos((i / 7) * Math.PI * 2) * 4.5,
      y: h - 0.5,
      z: Math.sin((i / 7) * Math.PI * 2) * 4.5,
      ry: -(i / 7) * Math.PI * 2,
      rz: 0.35,
    });
    g.add(frond);
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
  const head = box(2.4, 0.6, 1.4, mats.lampGlow, { x: 3.4, y: 19.6 });
  head.name = 'lampHead';
  g.add(head);
  return g;
}

/** Sliding gate + low boundary wall for one lot. */
function frontage(parent, x0, width, mats) {
  const wallH = 3.2;
  const pierW = 1.2;
  const gateW = width - 2 * pierW - 0.4;
  for (const px of [x0 + pierW / 2, x0 + width - pierW / 2]) {
    parent.add(box(pierW, wallH + 1.2, 1.2, mats.plaster, { x: px, y: (wallH + 1.2) / 2, z: FRONT }));
    parent.add(box(pierW + 0.3, 0.3, 1.5, mats.charcoal, { x: px, y: wallH + 1.35, z: FRONT }));
  }
  // gate frame
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

  // lawn / context ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), mats.grass);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(total / 2, -0.05, 20);
  ground.receiveShadow = true;
  site.add(ground);

  // road, kerb and walkway in front of the row
  const roadZ = FRONT + 5 + 13;
  const road = box(total + 260, 0.3, 26, mats.road, { x: total / 2, y: 0.05, z: roadZ, cast: false });
  site.add(road);
  for (const s of [-1, 1]) {
    site.add(
      box(total + 260, 0.75, 1.2, mats.kerb, { x: total / 2, y: 0.37, z: roadZ + s * 13.6, cast: false })
    );
  }
  site.add(box(total + 260, 0.4, 5, mats.paver, { x: total / 2, y: 0.2, z: FRONT + 2.5, cast: false }));
  // dashed centre line
  for (let i = -12; i < 12; i++) {
    site.add(box(6, 0.06, 0.5, mats.white, { x: total / 2 + i * 12, y: 0.22, z: roadZ, cast: false }));
  }

  // per-lot driveway, garden strips, boundary
  for (const u of row.units) {
    site.add(
      box(u.width - 1.6, 0.35, FRONT - D - 2, mats.paver, {
        x: u.x + u.width / 2,
        y: 0.18,
        z: (D + FRONT) / 2 + 0.6,
        cast: false,
      })
    );
    frontage(site, u.x, u.width, mats);
    // planter beside the porch
    site.add(box(1.4, 1.6, 8, mats.hedge, { x: u.x + 0.9, y: 0.8, z: FRONT - 7 }));
    // rear yard boundary wall
    site.add(box(u.width, 6.5, 0.5, mats.plasterShade, { x: u.x + u.width / 2, y: 3.25, z: REAR }));
  }

  // side boundary walls
  for (const x of [0, total]) {
    site.add(box(0.5, 6.5, DIM.lotDepth - 6, mats.plasterShade, { x, y: 3.25, z: (REAR + FRONT) / 2 }));
  }

  // street landscaping - kept clear of the facades so the row stays readable
  for (let i = 0; i <= row.units.length; i += 2) {
    const x = i === 0 ? -4 : row.units[i - 1].x + row.units[i - 1].width;
    site.add(placed(lampPost(mats), x, 0, FRONT + 4.4));
  }
  for (const x of [-14, total + 14]) {
    site.add(placed(tree(mats, 20), x, 0, FRONT + 6));
    site.add(placed(palm(mats, 24), x + (x < 0 ? -14 : 14), 0, FRONT - 4));
  }
  // far side of the road - left open opposite the row so the facade stays clear
  for (let x = -80; x < total + 90; x += 26) {
    if (x > -18 && x < total + 18) continue;
    site.add(placed(tree(mats, 16 + Math.random() * 8), x, 0, roadZ + 17 + Math.random() * 3));
  }
  for (let i = 0; i < 8; i++) {
    site.add(placed(palm(mats, 20 + Math.random() * 8), -60 - i * 22, 0, roadZ + 34 + Math.random() * 30));
    site.add(placed(tree(mats, 20 + Math.random() * 10), total + 40 + i * 20, 0, roadZ + 34 + Math.random() * 40));
  }
  // hedge line across the street
  site.add(box(total + 240, 5, 4, mats.hedge, { x: total / 2, y: 2.5, z: roadZ + 26 }));

  // guard house at the entrance of the gated community
  site.add(guardHouse(mats, -34, roadZ - 20));

  return site;
}

function placed(obj, x, y, z) {
  obj.position.set(x, y, z);
  return obj;
}

function guardHouse(mats, x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.add(box(12, 0.6, 10, mats.paver, { y: 0.3 }));
  g.add(box(11, 9, 9, mats.plaster, { y: 5 }));
  g.add(box(12.5, 0.6, 10.5, mats.charcoal, { y: 9.6 }));
  g.add(box(6, 4, 0.3, mats.glass, { y: 6, z: 4.6, cast: false }));
  g.add(box(6, 4, 0.3, mats.glass, { x: 5.6, y: 6, ry: Math.PI / 2, cast: false }));
  g.add(box(4, 1.2, 0.4, mats.accentRed, { y: 11, z: 4.5 }));
  // boom gate
  g.add(box(1.2, 3.5, 1.2, mats.metal, { x: 8, y: 1.75, z: 6 }));
  g.add(box(22, 0.5, 0.5, mats.accentRed, { x: 19, y: 3.4, z: 6 }));
  return g;
}
