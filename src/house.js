/**
 * One semi-detached unit: structure, both floor plans, pitched roof, facade
 * and furniture. Authored in feet; the caller scales the model to metres.
 *
 * The unit is built with its party wall on x = 0 and its outer wall at
 * x = +29'11". The other half of the pair is the same unit with mirror: true,
 * which maps x -> -x, so the two share the wall on x = 0.
 */
import * as THREE from 'three';
import { DIM, LEVEL, X, Z, BUILT, TOTAL_DEPTH } from './config.js';
import { GROUND, UPPER } from './plan.js';
import { box, buildWall, railing, stairs, labelSprite } from './build.js';
import { makeFurniture } from './furniture.js';

const RAD = Math.PI / 180;
const W = DIM.unitWidth;
const PITCH = DIM.roofPitch * RAD;
const TAN = Math.tan(PITCH);

/** Height of the roof plane above garden level at a distance x from the ridge. */
export const ridgeY = LEVEL.eaves + W * TAN;
const roofY = (x) => ridgeY - Math.abs(x) * TAN;

function frameFor(mirror) {
  return {
    mirror,
    X: (x) => (mirror ? -x : x),
    R: (deg) => (mirror ? -deg : deg),
  };
}

function transformSeg(seg, F) {
  const x1 = F.X(seg.x1);
  const x2 = F.X(seg.x2);
  const alongX = Math.abs(seg.z1 - seg.z2) < 1e-6;
  const len = Math.hypot(x2 - x1, seg.z2 - seg.z1);
  const openings = (seg.openings || []).map((op) =>
    alongX && F.mirror ? { ...op, at: Math.max(0, len - op.at - op.w) } : { ...op }
  );
  return { seg: { x1, z1: seg.z1, x2, z2: seg.z2 }, openings };
}

/** Rectangular slab, with rectangular voids cut out of it. */
function slab(parent, rect, voids, y, thickness, mat) {
  const zCuts = new Set([rect.z1, rect.z2]);
  for (const v of voids) {
    if (v.z2 <= rect.z1 || v.z1 >= rect.z2) continue;
    zCuts.add(Math.max(rect.z1, v.z1));
    zCuts.add(Math.min(rect.z2, v.z2));
  }
  const zs = [...zCuts].sort((a, b) => a - b);
  for (let i = 0; i < zs.length - 1; i++) {
    const z1 = zs[i];
    const z2 = zs[i + 1];
    if (z2 - z1 < 1e-3) continue;
    const zc = (z1 + z2) / 2;
    const active = voids
      .filter((v) => v.z1 <= zc && v.z2 >= zc && v.x2 > rect.x1 && v.x1 < rect.x2)
      .sort((a, b) => a.x1 - b.x1);
    const xs = [rect.x1];
    for (const v of active) xs.push(Math.max(rect.x1, v.x1), Math.min(rect.x2, v.x2));
    xs.push(rect.x2);
    for (let k = 0; k < xs.length; k += 2) {
      const x1 = xs[k];
      const x2 = xs[k + 1];
      if (x2 - x1 < 1e-3) continue;
      parent.add(
        box(x2 - x1, thickness, z2 - z1, mat, { x: (x1 + x2) / 2, y: y - thickness / 2, z: zc })
      );
    }
  }
}

function addFloor(parent, floorPlan, F, baseY, mats) {
  for (const seg of floorPlan.walls) {
    const t = transformSeg(seg, F);
    if (seg.railing) {
      railing(parent, t.seg, mats, { baseY, height: DIM.railing });
      continue;
    }
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

/**
 * Half of the pitched roof: one plane falling from the ridge over the party
 * wall to the outer eave, clipped around the single-storey RC roof strip.
 */
function buildRoof(mats, F) {
  const g = new THREE.Group();
  const eaveX = W + DIM.roofEaveOverhang;
  const zRear = -DIM.roofEndOverhang;
  const zFront = Z.front + DIM.roofEndOverhang;

  const plane = (x0, x1, z0, z1) => {
    const run = x1 - x0;
    const len = run / Math.cos(PITCH);
    const depth = z1 - z0;
    // the slope falls away from the ridge, so the mirrored half tilts the other way
    const mesh = box(len, DIM.roofThickness, depth, mats.roof, {
      x: F.X((x0 + x1) / 2),
      y: (roofY(x0) + roofY(x1)) / 2,
      z: (z0 + z1) / 2,
      rz: F.mirror ? PITCH : -PITCH,
    });
    g.add(mesh);
  };

  // main slope over the two storey mass, and the clipped strip at the rear
  plane(0, eaveX, Z.a, zFront);
  plane(X.rc, eaveX, zRear, Z.a);

  // fascia along the eave
  g.add(
    box(0.4, 0.9, zFront - zRear, mats.trim, {
      x: F.X(eaveX),
      y: roofY(eaveX) - 0.35,
      z: (zRear + zFront) / 2,
    })
  );

  // ceiling below the roof - revealed as the first floor plan when hidden
  for (const p of UPPER.plate) {
    g.add(
      box(p.x2 - p.x1, 0.35, p.z2 - p.z1, mats.slab, {
        x: F.X((p.x1 + p.x2) / 2),
        y: LEVEL.eaves + 0.17,
        z: (p.z1 + p.z2) / 2,
      })
    );
  }

  // gable end walls: right triangles between the wall head and the roof plane
  const gable = (z, x0, x1, faceOut) => {
    const pts = [
      [x0, LEVEL.eaves],
      [x1, LEVEL.eaves],
      [x1, roofY(x1)],
      [x0, roofY(x0)],
    ].map(([px, py]) => [F.X(px), py]);
    if (F.mirror) pts.reverse(); // keep the winding consistent after mirroring
    const shape = new THREE.Shape();
    shape.moveTo(pts[0][0], pts[0][1]);
    for (const [px, py] of pts.slice(1)) shape.lineTo(px, py);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: DIM.wallExt, bevelEnabled: false });
    const mesh = new THREE.Mesh(geo, mats.plaster);
    mesh.position.set(0, 0, z - (faceOut > 0 ? 0 : DIM.wallExt));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);

    // dark rake board following the slope
    const run = x1 - x0;
    g.add(
      box(run / Math.cos(PITCH), 0.55, 0.5, mats.trim, {
        x: F.X((x0 + x1) / 2),
        y: (roofY(x0) + roofY(x1)) / 2 + 0.1,
        z: z + (faceOut > 0 ? 0.35 : -0.35),
        rz: F.mirror ? PITCH : -PITCH,
      })
    );
  };
  gable(Z.front, 0, W, 1);
  gable(Z.rear, X.rc, W, -1);

  // wall closing the gap above the RC roof, below the slope
  const topY = roofY(X.rc);
  g.add(
    box(DIM.wallExt, topY - LEVEL.eaves, Z.a, mats.plaster, {
      x: F.X(X.rc),
      y: (LEVEL.eaves + topY) / 2,
      z: Z.a / 2,
    })
  );

  return g;
}

function buildFacade(groundG, upperG, F, mats) {
  const yG = LEVEL.ground;
  const under = LEVEL.upper - DIM.slab;

  // house platform
  groundG.add(
    box(W, yG, BUILT + 1.2, mats.slab, { x: F.X(W / 2), y: yG / 2, z: (BUILT + 1.2) / 2 })
  );

  // porch columns carrying the balcony slab
  for (const x of [1.6, W / 2, W - 1.6]) {
    groundG.add(box(1.3, under, 1.3, mats.plaster, { x: F.X(x), y: under / 2, z: Z.porch - 1 }));
  }
  groundG.add(box(1.3, under, 1.3, mats.plaster, { x: F.X(W - 1.6), y: under / 2, z: Z.front + 3 }));

  // entrance steps
  for (let i = 0; i < 2; i++) {
    groundG.add(
      box(7, yG / 2, 1.3 - i * 0.35, mats.slab, {
        x: F.X(5.8),
        y: (yG / 2) * (i + 0.5),
        z: Z.front + 1.7 - i * 0.95,
      })
    );
  }

  // banding between the storeys
  upperG.add(box(W, 1.1, 0.45, mats.charcoal, { x: F.X(W / 2), y: LEVEL.upper - 0.2, z: Z.porch + 0.2 }));
  upperG.add(
    box(0.45, 1.1, TOTAL_DEPTH - Z.a, mats.charcoal, {
      x: F.X(W + 0.2),
      y: LEVEL.upper - 0.2,
      z: (Z.a + TOTAL_DEPTH) / 2,
    })
  );

  // air-conditioner condensers on the flat RC roof (as drawn on the plan)
  for (const x of [1.8, 4.2]) {
    upperG.add(box(2, 0.35, 1.8, mats.plasterShade, { x: F.X(x), y: LEVEL.upper + 0.2, z: 2.4 }));
    upperG.add(box(1.8, 1.8, 1.5, mats.metal, { x: F.X(x), y: LEVEL.upper + 1.2, z: 2.4 }));
  }
}

/** @param {object} o { mirror, mats } */
export function buildUnit(o) {
  const { mirror, mats } = o;
  const F = frameFor(mirror);
  const unit = new THREE.Group();

  const groundG = new THREE.Group();
  const upperG = new THREE.Group();
  const labelG = new THREE.Group();
  const labelGroundG = new THREE.Group();
  const labelUpperG = new THREE.Group();
  labelG.add(labelGroundG, labelUpperG);
  labelG.visible = false;
  const furniture = [];

  const mx = (a, b) => F.X((a + b) / 2);

  // ---- ground floor ------------------------------------------------------
  buildFacade(groundG, upperG, F, mats);
  groundG.add(
    box(W - 0.8, 0.12, BUILT - 0.8, mats.interiorFloor, {
      x: mx(0, W),
      y: LEVEL.ground + 0.06,
      z: BUILT / 2,
      cast: false,
    })
  );
  addFloor(groundG, GROUND, F, LEVEL.ground, mats);
  stairs(
    groundG,
    {
      x1: Math.min(F.X(0.3), F.X(X.rc - 0.3)),
      z1: GROUND.stair.z1,
      x2: Math.max(F.X(0.3), F.X(X.rc - 0.3)),
      z2: GROUND.stair.z2,
    },
    mats,
    { fromY: LEVEL.ground, toY: LEVEL.upper }
  );
  addFurniture(groundG, GROUND.furniture, F, LEVEL.ground + 0.12, mats, furniture);

  // ---- first floor -------------------------------------------------------
  const voids = UPPER.voids.map((v) => ({
    x1: Math.min(F.X(v.x1), F.X(v.x2)),
    x2: Math.max(F.X(v.x1), F.X(v.x2)),
    z1: v.z1,
    z2: v.z2,
  }));
  for (const p of UPPER.plate) {
    const rect = { x1: Math.min(F.X(p.x1), F.X(p.x2)), x2: Math.max(F.X(p.x1), F.X(p.x2)), z1: p.z1, z2: p.z2 };
    slab(upperG, rect, voids, LEVEL.upper, DIM.slab, mats.slab);
    slab(
      upperG,
      { x1: rect.x1 + 0.4, x2: rect.x2 - 0.4, z1: rect.z1 + 0.4, z2: rect.z2 - 0.4 },
      voids,
      LEVEL.upper + 0.12,
      0.12,
      mats.interiorFloor
    );
  }

  // flat RC roof over the single storey rear strip, with its parapet
  const rc = UPPER.rcRoof;
  upperG.add(
    box(X.rc, DIM.slab, Z.a, mats.slab, { x: mx(rc.x1, rc.x2), y: LEVEL.upper - DIM.slab / 2, z: Z.a / 2 })
  );
  upperG.add(
    box(X.rc, DIM.parapet, 0.5, mats.plaster, { x: mx(rc.x1, rc.x2), y: LEVEL.upper + DIM.parapet / 2, z: 0.25 })
  );

  // balcony slab over the car porch
  const bal = UPPER.balcony;
  upperG.add(
    box(W, DIM.slab, DIM.front, mats.slab, {
      x: mx(bal.x1, bal.x2),
      y: LEVEL.upper - DIM.slab / 2,
      z: (Z.front + Z.porch) / 2,
    })
  );
  upperG.add(
    box(W - 0.6, 0.12, DIM.front - 0.6, mats.paver, {
      x: mx(bal.x1, bal.x2),
      y: LEVEL.upper + 0.06,
      z: (Z.front + Z.porch) / 2,
      cast: false,
    })
  );

  addFloor(upperG, UPPER, F, LEVEL.upper, mats);
  addFurniture(upperG, UPPER.furniture, F, LEVEL.upper + 0.12, mats, furniture);

  // ---- roof --------------------------------------------------------------
  const roofG = buildRoof(mats, F);

  // ---- labels ------------------------------------------------------------
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
    mirror,
  };
  return unit;
}
