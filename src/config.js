/**
 * Dimensions for the "Double Storey Terrace" from the sales brochure.
 *
 * Everything in this project is authored in FEET (the unit used on the
 * brochure: 21' x 60' and 23' x 60' lots). The root group is scaled by FT
 * in main.js so the scene itself is metric.
 */

export const FT = 0.3048;
export const ft = (v) => v * FT;

/** Headline specs printed on the brochure. */
export const SPEC = {
  title: '双层排屋 · Double Storey Terrace',
  price: 'RM 6xxk',
  landSizes: ["21' x 60'", "23' x 60'"],
  bedrooms: 4,
  bathrooms: 3,
  tenure: '永久地契 · Freehold',
  security: '24小时围篱保安 · 24-Hour Gated & Guarded',
};

/** Plan geometry, in feet. */
export const DIM = {
  // Lot: 60' deep = 6' rear yard + 34' built-up + 20' car porch / front yard.
  lotDepth: 60,
  rearYard: 6,
  builtUp: 34,
  frontYard: 20,

  // First floor cantilevers 6' over the car porch (see brochure facade).
  overhang: 6,

  widthStandard: 21,
  widthWide: 23,

  wallExt: 0.75,
  wallInt: 0.4,
  railing: 3.2,

  platform: 1.5, // finished floor level above the garden
  groundHeight: 10,
  slab: 0.8,
  upperHeight: 10,

  roofPitch: 34, // degrees
  roofEaveOverhang: 1.4,
  roofFrontOverhang: 1.6,
  roofThickness: 0.45,
};

/** Level heights derived from DIM (feet, measured from garden level). */
export const LEVEL = {
  ground: DIM.platform,
  upper: DIM.platform + DIM.groundHeight + DIM.slab,
  eaves: DIM.platform + DIM.groundHeight + DIM.slab + DIM.upperHeight + DIM.slab,
};

/** Depth of the first floor plate (body + cantilever). */
export const UPPER_DEPTH = DIM.builtUp + DIM.overhang;

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
