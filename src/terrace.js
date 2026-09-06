/** Assembles a row of terrace units: corner lots are 23' wide, intermediates 21'. */
import * as THREE from 'three';
import { DIM } from './config.js';
import { buildUnit } from './house.js';
import { disposeTree } from './build.js';

export function buildTerrace(count, mats) {
  const group = new THREE.Group();
  const units = [];
  let x = 0;
  for (let i = 0; i < count; i++) {
    const isFirst = i === 0;
    const isLast = i === count - 1;
    const width = isFirst || isLast ? DIM.widthWide : DIM.widthStandard;
    const unit = buildUnit({
      width,
      mirror: i % 2 === 1,
      isFirst,
      isLast,
      mats,
    });
    unit.position.x = x;
    group.add(unit);
    units.push({ unit, x, width, index: i });
    x += width;
  }
  group.userData.units = units;
  return { group, row: { units, totalWidth: x } };
}

export function disposeTerrace(group) {
  disposeTree(group);
  group.parent?.remove(group);
}
