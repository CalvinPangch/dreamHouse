/**
 * One terrace unit: structure, both floor plans, roof, facade and furniture.
 * Authored in feet; the caller scales the whole model to metres.
 */
import * as THREE from 'three';
import { DIM, LEVEL, UPPER_DEPTH } from './config.js';
import { GROUND, UPPER } from './plan.js';
import { box, buildWall, railing, stairs, labelSprite } from './build.js';
import { makeFurniture } from './furniture.js';

const RAD = Math.PI / 180;
const BASE_W = DIM.widthStandard; // plans are drawn on the 21' lot

/** Coordinate transform for lot width + mirrored (handed) units. */
function frameFor(width, mirror) {
  const sx = width / BASE_W;
  return {
    width,
    mirror,
    sx,
    X: (x) => (mirror ? width - x * sx : x * sx),
    // rotation of a furniture item, in degrees
    R: (deg) => (mirror ? -deg : deg),
  };
}

function transformSeg(seg, F) {
  const x1 = F.X(seg.x1);
  const x2 = F.X(seg.x2);
  const alongX = Math.abs(seg.z1 - seg.z2) < 1e-6;
  const len = Math.hypot(x2 - x1, seg.z2 - seg.z1);
  const openings = (seg.openings || []).map((op) => {
    const at = op.at * (alongX ? F.sx : 1);
    const w = op.w;
    return { ...op, at: alongX && F.mirror ? Math.max(0, len - at - w) : at, w };
  });
  return { seg: { x1, z1: seg.z1, x2, z2: seg.z2 }, openings };
}

/** Slab with rectangular voids cut out of it (stair well). */
function slab(parent, rect, voids, y, thickness, mat) {
  const zCuts = new Set([rect.z1, rect.z2]);
  for (const v of voids) {
    zCuts.add(Math.max(rect.z1, v.z1));
    zCuts.add(Math.min(rect.z2, v.z2));
  }
  const zs = [...zCuts].sort((a, b) => a - b);
  for (let i = 0; i < zs.length - 1; i++) {
    const z1 = zs[i];
    const z2 = zs[i + 1];
    if (z2 - z1 < 1e-3) continue;
    const zc = (z1 + z2) / 2;
    const active = voids.filter((v) => v.z1 <= zc && v.z2 >= zc);
    const xs = [rect.x1];
    active
      .sort((a, b) => a.x1 - b.x1)
      .forEach((v) => {
        xs.push(Math.max(rect.x1, v.x1), Math.min(rect.x2, v.x2));
      });
    xs.push(rect.x2);
    for (let k = 0; k < xs.length; k += 2) {
      const x1 = xs[k];
      const x2 = xs[k + 1];
      if (x2 - x1 < 1e-3) continue;
      parent.add(
        box(x2 - x1, thickness, z2 - z1, mat, {
          x: (x1 + x2) / 2,
          y: y - thickness / 2,
          z: zc,
        })
      );
    }
  }
}

function addFloor(parent, floorPlan, F, opts) {
  const { baseY, mats, thickness } = opts;
  for (const seg of floorPlan.walls) {
    if (seg.railing) {
      const t = transformSeg(seg, F);
      railing(parent, t.seg, mats, { baseY, height: DIM.railing });
      continue;
    }
    const t = transformSeg(seg, F);
    buildWall(parent, t.seg, t.openings, {
      height: floorPlan.height,
      thickness: seg.ext ? DIM.wallExt : DIM.wallInt,
      baseY,
      mats,
      material: seg.ext ? mats.plaster : mats.plasterShade,
    });
  }
}

function addFurniture(parent, list, F, baseY, mats, sink) {
  for (const item of list) {
    const g = makeFurniture(item, mats);
    if (!g) continue;
    g.position.set(F.X(item.x), baseY, item.z);
    g.rotation.y = F.R(item.rot || 0) * RAD;
    parent.add(g);
    sink.push(g);
  }
}

function addLabels(parent, rooms, F, y, scale) {
  for (const r of rooms) {
    const s = labelSprite(r.name, r.cn, scale);
    s.position.set(F.X((r.x1 + r.x2) / 2), y, (r.z1 + r.z2) / 2);
    parent.add(s);
  }
}

function buildRoof(unit, W, mats, { overhangLeft, overhangRight }) {
  const g = new THREE.Group();
  const p = DIM.roofPitch * RAD;
  const eaveY = LEVEL.eaves;
  const ridgeY = eaveY + (W / 2) * Math.tan(p);
  const zFront = UPPER_DEPTH + DIM.roofFrontOverhang;
  const zRear = -DIM.roofFrontOverhang;
  const depth = zFront - zRear;
  const zc = (zFront + zRear) / 2;

  // ceiling under the roof (revealed as the upper floor plan when hidden)
  g.add(box(W, 0.35, UPPER_DEPTH, mats.slab, { x: W / 2, y: eaveY + 0.17, z: UPPER_DEPTH / 2 }));

  const slope = (overhang, side) => {
    const run = W / 2 + overhang;
    const len = run / Math.cos(p);
    const eaveEdgeY = ridgeY - run * Math.tan(p);
    const cx = side < 0 ? (W / 2 - overhang) / 2 : (W / 2 + W + overhang) / 2;
    const mesh = box(len, DIM.roofThickness, depth, mats.roof, {
      x: cx,
      y: (ridgeY + eaveEdgeY) / 2,
      z: zc,
      rz: side < 0 ? p : -p,
    });
    g.add(mesh);
    // fascia board at the eave
    g.add(
      box(0.35, 0.85, depth, mats.trim, {
        x: side < 0 ? -overhang : W + overhang,
        y: eaveEdgeY - 0.3,
        z: zc,
      })
    );
    return { len, eaveEdgeY, run };
  };
  const left = slope(overhangLeft, -1);
  const right = slope(overhangRight, 1);

  // ridge capping
  g.add(box(0.9, 0.5, depth, mats.trim, { x: W / 2, y: ridgeY + 0.28, z: zc }));

  // gable end walls (front + rear) and their dark rake trims
  const gable = (z, faceOut) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, eaveY);
    shape.lineTo(W, eaveY);
    shape.lineTo(W / 2, ridgeY);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: DIM.wallExt, bevelEnabled: false });
    const mesh = new THREE.Mesh(geo, mats.plaster);
    mesh.position.set(0, 0, z - (faceOut > 0 ? 0 : DIM.wallExt));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);

    // dark rake trim following the roof line
    const rakeLen = (W / 2) / Math.cos(p);
    const zt = z + (faceOut > 0 ? 0.35 : -0.35);
    for (const side of [-1, 1]) {
      g.add(
        box(rakeLen, 0.55, 0.5, mats.trim, {
          x: W / 2 + side * (W / 4),
          y: (eaveY + ridgeY) / 2 + 0.1,
          z: zt,
          rz: side < 0 ? p : -p,
        })
      );
    }
    g.add(box(W, 0.5, 0.5, mats.trim, { x: W / 2, y: eaveY - 0.2, z: zt }));
  };
  gable(UPPER_DEPTH, 1);
  gable(0, -1);

  g.userData.ridgeY = ridgeY;
  void left;
  void right;
  return g;
}

/** Facade detailing: columns, banding, steps, service ledges. */
function buildFacade(parent, upperParent, W, F, mats) {
  const yG = LEVEL.ground;
  const upperY = LEVEL.upper;

  // porch columns supporting the cantilever
  for (const x of [1.3, W - 1.3]) {
    parent.add(
      box(1.15, upperY - DIM.slab, 1.15, mats.plaster, {
        x,
        y: (upperY - DIM.slab) / 2,
        z: UPPER_DEPTH - 1.1,
      })
    );
  }

  // dark band between the two storeys (brochure facade accent) - belongs to
  // the first floor so it disappears with it in the ground floor plan view
  upperParent.add(box(W, 1.1, 0.45, mats.charcoal, { x: W / 2, y: upperY - 0.2, z: UPPER_DEPTH + 0.18 }));
  upperParent.add(box(W, 0.9, 0.4, mats.charcoal, { x: W / 2, y: upperY - 0.2, z: DIM.builtUp + 0.2 }));

  // entrance steps up to the raised platform
  const doorX = F.X(4.25);
  for (let i = 0; i < 2; i++) {
    parent.add(
      box(6, yG / 2, 1.2 - i * 0.35, mats.slab, {
        x: doorX,
        y: (yG / 2) * (i + 0.5) - yG / 2 + yG / 2,
        z: DIM.builtUp + 1.6 - i * 0.9,
      })
    );
  }

  // house platform + porch threshold
  parent.add(box(W, yG, DIM.builtUp + 1.2, mats.slab, { x: W / 2, y: yG / 2, z: (DIM.builtUp + 1.2) / 2 }));

  // air-conditioner ledge at the rear
  upperParent.add(box(3.2, 0.4, 2, mats.plasterShade, { x: F.X(18), y: upperY + 3, z: -1 }));
  upperParent.add(box(2.4, 2, 1.6, mats.metal, { x: F.X(18), y: upperY + 4.2, z: -1 }));
}

/**
 * @param {object} o { width, mirror, isLast, isFirst, mats, unitLabel }
 */
export function buildUnit(o) {
  const { width: W, mirror, isFirst, isLast, mats } = o;
  const F = frameFor(W, mirror);
  const unit = new THREE.Group();

  const groundG = new THREE.Group();
  const upperG = new THREE.Group();
  const labelG = new THREE.Group();
  const labelGroundG = new THREE.Group();
  const labelUpperG = new THREE.Group();
  labelG.add(labelGroundG, labelUpperG);
  const furniture = [];
  labelG.visible = false;

  // ---- ground floor ------------------------------------------------------
  buildFacade(groundG, upperG, W, F, mats);
  groundG.add(
    box(W - 0.8, 0.12, DIM.builtUp - 0.8, mats.interiorFloor, {
      x: W / 2,
      y: LEVEL.ground + 0.06,
      z: DIM.builtUp / 2,
      cast: false,
    })
  );
  addFloor(groundG, GROUND, F, { baseY: LEVEL.ground, mats });
  stairs(
    groundG,
    { x1: F.mirror ? W - 4 * F.sx : 0, z1: GROUND.stair.z1, x2: F.mirror ? W : 4 * F.sx, z2: GROUND.stair.z2 },
    mats,
    { fromY: LEVEL.ground, toY: LEVEL.upper }
  );
  addFurniture(groundG, GROUND.furniture, F, LEVEL.ground + 0.12, mats, furniture);

  // ---- party walls (shared, centred on the lot boundary) -----------------
  // split per storey so each half hides with its floor in the plan views
  const party = (x) => {
    const lowerH = LEVEL.upper - LEVEL.ground;
    const upperH = LEVEL.eaves - LEVEL.upper;
    groundG.add(
      box(DIM.wallExt, lowerH, DIM.builtUp, mats.plaster, {
        x,
        y: LEVEL.ground + lowerH / 2,
        z: DIM.builtUp / 2,
      })
    );
    upperG.add(
      box(DIM.wallExt, upperH, UPPER_DEPTH, mats.plaster, {
        x,
        y: LEVEL.upper + upperH / 2,
        z: UPPER_DEPTH / 2,
      })
    );
  };
  party(0);
  if (isLast) party(W);

  // ---- first floor -------------------------------------------------------
  const voids = UPPER.voids.map((v) => ({
    x1: Math.min(F.X(v.x1), F.X(v.x2)),
    x2: Math.max(F.X(v.x1), F.X(v.x2)),
    z1: v.z1,
    z2: v.z2,
  }));
  slab(upperG, { x1: 0, z1: 0, x2: W, z2: UPPER_DEPTH }, voids, LEVEL.upper, DIM.slab, mats.slab);
  slab(
    upperG,
    { x1: 0.4, z1: 0.4, x2: W - 0.4, z2: UPPER_DEPTH - 0.4 },
    voids,
    LEVEL.upper + 0.12,
    0.12,
    mats.interiorFloor
  );
  addFloor(upperG, UPPER, F, { baseY: LEVEL.upper, mats });
  addFurniture(upperG, UPPER.furniture, F, LEVEL.upper + 0.12, mats, furniture);

  // ---- roof --------------------------------------------------------------
  const roofG = buildRoof(unit, W, mats, {
    overhangLeft: isFirst ? DIM.roofEaveOverhang : 0.35,
    overhangRight: isLast ? DIM.roofEaveOverhang : 0.35,
  });

  // ---- plan labels -------------------------------------------------------
  addLabels(labelGroundG, GROUND.rooms, F, LEVEL.ground + 6.5, 0.62);
  addLabels(labelUpperG, UPPER.rooms, F, LEVEL.upper + 6.5, 0.62);

  unit.add(groundG, upperG, roofG, labelG);
  unit.userData = {
    ground: groundG,
    upper: upperG,
    roof: roofG,
    labels: labelG,
    labelsGround: labelGroundG,
    labelsUpper: labelUpperG,
    furniture,
    width: W,
  };
  return unit;
}
