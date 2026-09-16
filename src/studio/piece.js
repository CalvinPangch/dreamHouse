/**
 * Turns a catalogue entry into a three.js group sized in metres.
 *
 * The house builders are authored in feet at whatever proportions suited the
 * dollhouse, so every piece is measured and rescaled to the exact width, depth
 * and height the catalogue advertises. That keeps the 3D model, the 2D
 * footprint and the inspector's numbers describing the same object.
 */
import * as THREE from 'three';
import { makeFurniture } from '../furniture.js';
import { CATALOG_BY_ID, FINISH_BY_ID } from './catalog.js';

const EPS = 1e-4;

/** Swap the piece's body colour for the chosen finish, leaving accents alone. */
function applyFinish(group, bodyColor, finishColor) {
  const target = new THREE.Color(bodyColor);
  const swap = new Map();
  group.traverse((node) => {
    const m = node.material;
    if (!m || !m.color || !m.color.equals(target)) return;
    if (!swap.has(m)) {
      const clone = m.clone();
      clone.color = new THREE.Color(finishColor);
      swap.set(m, clone);
    }
    node.material = swap.get(m);
  });
}

/**
 * Scale to the catalogue dimensions and re-origin so the piece is centred on
 * its footprint with its base on y = 0.
 */
function fit(group, w, d, h) {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  const size = box.getSize(new THREE.Vector3());
  const inner = new THREE.Group();
  inner.add(group);

  inner.scale.set(
    size.x > EPS ? w / size.x : 1,
    size.y > EPS ? h / size.y : 1,
    size.z > EPS ? d / size.z : 1
  );
  const centre = box.getCenter(new THREE.Vector3());
  group.position.set(-centre.x, -box.min.y, -centre.z);
  return inner;
}

/** A placed piece, ready to drop into the room at (0, 0). */
export function buildPiece(catalogId, finishId) {
  const piece = CATALOG_BY_ID.get(catalogId);
  if (!piece) return null;

  const raw = makeFurniture({ ...piece.build });
  if (!raw) return null;

  const finish = FINISH_BY_ID.get(finishId) || FINISH_BY_ID.get(piece.finish);
  if (finish) applyFinish(raw, piece.body, finish.color);

  const model = fit(raw, piece.w, piece.d, piece.h);
  const holder = new THREE.Group();
  holder.add(model);
  holder.userData.catalogId = catalogId;
  return holder;
}

/** Geometry only - materials come from the shared cache in build.js. */
export function disposePiece(group) {
  group.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
  });
}
