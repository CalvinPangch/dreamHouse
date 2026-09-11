/**
 * Dimensions for the double storey SEMI-DETACHED house, taken from the
 * architect's floor plan.
 *
 * Everything is authored in FEET (the plan is dimensioned in feet and inches);
 * the root group is scaled by FT in main.js so the scene itself is metric.
 *
 * Plan dimension chains, both of which close exactly:
 *   width  29'11" = 11'0" + 5'5" + 13'6"   (ground)
 *                 = 5'11" + 12'0" + 12'0"  (first floor)
 *   depth  47'10" = 14'10" + 5'3" + 10'0" + 17'9", plus 16'5" porch / balcony
 */

export const FT = 0.3048;
export const ft = (v) => v * FT;
/** feet + inches -> feet */
export const fi = (f, i = 0) => f + i / 12;

export const SPEC = {
  title: '双层半独立式洋房 · Double Storey Semi-Detached',
  size: "29'11\" x 47'10\"",
  bedrooms: 4,
  bathrooms: 4,
  tenure: '永久地契 · Freehold',
};

export const DIM = {
  unitWidth: fi(29, 11), // 29.9167

  // depth bands, rear -> front
  bandA: fi(14, 10), // rear: kitchen | bedroom 4   (upper: bedrooms 2 & 3)
  bandB: fi(5, 3),   // utility | bathrooms
  bandC: 10,         // dining                      (upper: family hall)
  bandD: fi(17, 9),  // living                      (upper: master bedroom)
  front: fi(16, 5),  // car porch, balcony above

  // the rear strip beside the party wall is single storey - "RC ROOF" on the plan
  rcStrip: fi(5, 11),

  lotWidth: 40,
  lotDepth: 80,

  wallExt: 0.75,
  wallInt: 0.4,
  railing: 3.4,
  parapet: 2.6,

  platform: 1.5,
  groundHeight: 10.5,
  slab: 0.85,
  upperHeight: 10,

  roofPitch: 22, // degrees - one slope per unit, ridge over the party wall
  roofEaveOverhang: 1.6,
  roofEndOverhang: 1.6,
  roofThickness: 0.45,
};

/** Built-up depth: 47'10". */
export const BUILT = DIM.bandA + DIM.bandB + DIM.bandC + DIM.bandD;
/** Depth including the car porch / balcony: 64'3". */
export const TOTAL_DEPTH = BUILT + DIM.front;

/** Band boundaries along z (0 = rear wall, +z towards the street). */
export const Z = {
  rear: 0,
  a: DIM.bandA,                                     // 14'10"
  b: DIM.bandA + DIM.bandB,                         // 20'1"
  c: DIM.bandA + DIM.bandB + DIM.bandC,             // 30'1"
  front: BUILT,                                     // 47'10"
  porch: TOTAL_DEPTH,                               // 64'3"
};

/** Key offsets across the unit (0 = party wall, +x outwards). */
export const X = {
  party: 0,
  rc: DIM.rcStrip,          // 5'11"  - stair / void strip, RC roof at the rear
  kitchen: 11,              // 11'0"  - kitchen width on the ground floor
  passage: fi(16, 5),       // 16'5"  - 11'0" + 5'5"
  bed2: DIM.rcStrip + 12,   // 17'11" - bedroom 2 | bedroom 3
  wc: DIM.unitWidth - 6,    // 23'11" - bathroom strip against the outer wall
  outer: DIM.unitWidth,
};

/** Floor levels, measured from garden level. */
export const LEVEL = {
  ground: DIM.platform,
  upper: DIM.platform + DIM.groundHeight + DIM.slab,
  eaves: DIM.platform + DIM.groundHeight + DIM.slab + DIM.upperHeight + DIM.slab,
};

export const PALETTE = {
  plaster: 0xf1efe9,
  plasterShade: 0xe2ded4,
  charcoal: 0x2b2f34,
  trim: 0x1e2226,
  timber: 0x6d4a2d,
  roof: 0x24272b,
  glass: 0x1d2b34,
  slab: 0xd8d4cb,
  interiorFloor: 0xd9cfc0,
  grass: 0x4e7a3a,
  hedge: 0x3d6b31,
  paver: 0x9d9a92,
  road: 0x3a3b3e,
  kerb: 0xbfbcb4,
};
