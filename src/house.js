/** Builds one floor of the house as a dollhouse: plinth, floors, walls, furniture. */
import * as THREE from 'three';
import { soft, mat, deriveWalls } from './build.js';
import { makeFurniture } from './furniture.js';
import { HOUSE, TONE, DOORS, WINDOWS } from './design.js';

const WALL_T = 0.42;

export function buildFloor(floorDef) {
  const group = new THREE.Group();
  const rooms = new Map();
  const cutWalls = new THREE.Group();
  const fullWalls = new THREE.Group();
  const glazing = new THREE.Group();
  const furniture = new THREE.Group();
  const picks = [];

  // ---- plinth: the warm slab the whole model sits on ---------------------
  const pad = 1.6;
  group.add(
    soft(HOUSE.width + pad * 2, 1.1, HOUSE.depth + pad * 2, TONE.shellWarm, {
      x: HOUSE.width / 2,
      y: -0.55,
      z: HOUSE.depth / 2,
      radius: 0.45,
      receive: true,
    })
  );
  group.add(
    soft(HOUSE.width + pad * 2 - 0.5, 0.5, HOUSE.depth + pad * 2 - 0.5, TONE.oakDeep, {
      x: HOUSE.width / 2,
      y: -1.2,
      z: HOUSE.depth / 2,
      radius: 0.3,
      cast: false,
    })
  );

  // ---- per room floor plates --------------------------------------------
  for (const r of floorDef.rooms) {
    const w = r.x2 - r.x1;
    const d = r.z2 - r.z1;
    // each room takes its own tint: the accent, warmed back towards the floor
    const plateColor = '#' + new THREE.Color(r.accent).lerp(new THREE.Color(r.floor), 0.28).getHexString();
    const plate = soft(w, 0.3, d, plateColor, {
      x: (r.x1 + r.x2) / 2,
      y: 0.15,
      z: (r.z1 + r.z2) / 2,
      radius: 0.05,
      cast: false,
    });
    plate.userData.roomId = r.id;
    plate.material = plate.material.clone(); // room highlight tints this
    plate.userData.baseColor = new THREE.Color(plateColor);
    group.add(plate);
    picks.push(plate);

    // a soft rug of accent colour marks the room's character
    const accent = soft(w - 0.6, 0.06, d - 0.6, r.accent, {
      x: (r.x1 + r.x2) / 2,
      y: 0.31,
      z: (r.z1 + r.z2) / 2,
      radius: 0.04,
      cast: false,
    });
    accent.material = mat(r.floor, { opacity: 0.5 });
    accent.material.transparent = true;
    group.add(accent);

    rooms.set(r.id, {
      def: r,
      plate,
      centre: new THREE.Vector3((r.x1 + r.x2) / 2, 0, (r.z1 + r.z2) / 2),
    });

    // ---- furniture -------------------------------------------------------
    for (const item of r.furniture || []) {
      const g = makeFurniture(item);
      if (!g) continue;
      g.position.set(item.x, 0.3, item.z);
      g.rotation.y = ((item.rot || 0) * Math.PI) / 180;
      g.userData.roomId = r.id;
      furniture.add(g);
    }
  }

  // ---- walls -------------------------------------------------------------
  const walls = deriveWalls(floorDef.rooms, DOORS[floorDef.id] || []);
  for (const w of walls) {
    const len = Math.hypot(w.x2 - w.x1, w.z2 - w.z1);
    if (len < 0.1) continue;
    const alongX = Math.abs(w.z2 - w.z1) < 1e-6;
    const cx = (w.x1 + w.x2) / 2;
    const cz = (w.z1 + w.z2) / 2;
    const size = alongX ? [len, WALL_T] : [WALL_T, len];

    const low = soft(size[0], HOUSE.wallCut, size[1], TONE.shell, {
      x: cx, y: HOUSE.wallCut / 2 + 0.3, z: cz, radius: 0.07,
    });
    cutWalls.add(low);

    const tall = soft(size[0], HOUSE.wallFull, size[1], TONE.shell, {
      x: cx, y: HOUSE.wallFull / 2 + 0.3, z: cz, radius: 0.07,
    });
    fullWalls.add(tall);

    // warm cap line along the top of the cut walls
    cutWalls.add(
      soft(size[0] + 0.08, 0.18, size[1] + 0.08, TONE.oakDeep, {
        x: cx, y: HOUSE.wallCut + 0.34, z: cz, radius: 0.05, cast: false,
      })
    );
  }

  // ---- windows, only meaningful once the walls are full height -----------
  const glass = mat('#d6e6ec', { opacity: 0.5, rough: 0.15 });
  for (const win of WINDOWS[floorDef.id] || []) {
    const len = win.to - win.from;
    const mid = (win.from + win.to) / 2;
    const alongX = win.axis === 'x';
    const pos = alongX ? { x: mid, z: win.at } : { x: win.at, z: mid };
    const size = alongX ? [len, WALL_T + 0.2] : [WALL_T + 0.2, len];
    glazing.add(soft(size[0], 4.4, size[1], glass, { ...pos, y: 4.6, radius: 0.06, cast: false }));
    glazing.add(
      soft(size[0] + 0.2, 0.24, size[1] + 0.2, TONE.oakDeep, { ...pos, y: 2.3, radius: 0.06, cast: false })
    );
  }

  group.add(cutWalls, fullWalls, glazing, furniture);
  fullWalls.visible = false;
  glazing.visible = false;

  return { group, rooms, cutWalls, fullWalls, glazing, furniture, picks };
}
