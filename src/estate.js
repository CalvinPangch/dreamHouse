/**
 * Semi-detached pairs along a street.
 *
 * A pair is two mirrored units sharing the party wall on the pair's centre
 * line; each unit sits on a 40' x 80' lot, so a pair occupies 80' of frontage.
 */
import * as THREE from 'three';
import { DIM, LEVEL, X, Z, TOTAL_DEPTH } from './config.js';
import { buildUnit, ridgeY } from './house.js';
import { box, disposeTree } from './build.js';

const W = DIM.unitWidth;

function buildPair(mats) {
  const pair = new THREE.Group();
  const left = buildUnit({ mirror: true, mats });
  const right = buildUnit({ mirror: false, mats });
  pair.add(left, right);

  const shared = new THREE.Group();
  // the part of the party wall inside the roof space belongs to the roof, so
  // it disappears with it instead of standing up as a fin in the plan views
  const roofShared = new THREE.Group();

  const wallH = LEVEL.eaves - LEVEL.ground;
  shared.add(
    box(DIM.wallExt, wallH, Z.front, mats.plaster, {
      x: 0,
      y: LEVEL.ground + wallH / 2,
      z: Z.front / 2,
    })
  );
  const gableH = ridgeY - LEVEL.eaves;
  roofShared.add(
    box(DIM.wallExt, gableH, Z.front, mats.plaster, {
      x: 0,
      y: LEVEL.eaves + gableH / 2,
      z: Z.front / 2,
    })
  );
  // privacy wall between the two balconies
  shared.add(
    box(DIM.wallExt, 7, DIM.front, mats.plaster, {
      x: 0,
      y: LEVEL.upper + 3.5,
      z: (Z.front + Z.porch) / 2,
    })
  );
  // ridge capping over the party wall
  roofShared.add(
    box(1.2, 0.5, Z.front + 2 * DIM.roofEndOverhang, mats.trim, {
      x: 0,
      y: ridgeY + 0.3,
      z: Z.front / 2,
    })
  );
  pair.add(shared, roofShared);

  pair.userData = { units: [left, right], shared, roofShared };
  return pair;
}

export function buildEstate(pairCount, mats) {
  const group = new THREE.Group();
  const pairs = [];
  const units = [];
  const pitch = 2 * DIM.lotWidth; // 80' of frontage per pair

  for (let i = 0; i < pairCount; i++) {
    const pair = buildPair(mats);
    const centre = i * pitch + DIM.lotWidth;
    pair.position.x = centre;
    group.add(pair);
    pairs.push({ pair, centre, roofShared: pair.userData.roofShared });
    // left half first so units read left-to-right along the street
    units.push(
      { unit: pair.userData.units[0], x: centre, mirror: true, index: units.length },
      { unit: pair.userData.units[1], x: centre, mirror: false, index: units.length + 1 }
    );
  }

  const totalWidth = pairCount * pitch;
  group.userData = { pairs, units };
  return {
    group,
    row: {
      units,
      pairs,
      totalWidth,
      lots: pairCount * 2,
      unitWidth: W,
      depth: TOTAL_DEPTH,
    },
  };
}

export function disposeEstate(group) {
  disposeTree(group);
  group.parent?.remove(group);
}

export { X, Z };
