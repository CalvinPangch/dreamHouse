/**
 * Floor plans of one semi-detached unit, transcribed from the architect's drawing.
 *
 * Local coordinates (feet):
 *   x : 0 = party wall (shared with the other half of the pair)
 *       -> 29'11" at the outer wall
 *   z : 0 = rear wall -> 47'10" at the front wall -> 64'3" at the porch edge
 *
 * Wall segments: { x1, z1, x2, z2, ext?, railing?, parapet?, openings? }
 * Openings run from (x1,z1) along the wall:
 *   { at, w, type: 'door'|'glass'|'window'|'opening', sill, head }
 */

import { DIM, X, Z, BUILT, TOTAL_DEPTH } from './config.js';

const W = DIM.unitWidth;

export const GROUND = {
  height: DIM.groundHeight,
  depth: BUILT,
  walls: [
    // ---- envelope -------------------------------------------------------
    {
      x1: 0, z1: Z.rear, x2: W, z2: Z.rear, ext: true,
      openings: [
        { at: 2.5, w: 5, type: 'window', sill: 3, head: 7.5 },      // kitchen
        { at: 12.2, w: 3.2, type: 'door', sill: 0, head: 7.5 },     // yard door
        { at: 20, w: 6, type: 'window', sill: 3, head: 7.5 },       // bedroom 4
      ],
    },
    {
      x1: W, z1: Z.rear, x2: W, z2: Z.front, ext: true,
      openings: [
        { at: 4, w: 6, type: 'window', sill: 3, head: 7.5 },        // bedroom 4
        { at: 15.6, w: 2.6, type: 'window', sill: 5, head: 7.5 },   // B/WC 4
        { at: 22, w: 6, type: 'window', sill: 2.5, head: 8 },       // dining
        { at: 33, w: 12, type: 'glass', sill: 0.5, head: 8.5 },     // living
      ],
    },
    {
      x1: 0, z1: Z.front, x2: W, z2: Z.front, ext: true,
      openings: [
        { at: 4, w: 3.6, type: 'door', sill: 0, head: 8 },          // entrance
        { at: 10.5, w: 15, type: 'glass', sill: 0.5, head: 9 },     // living
      ],
    },

    // ---- rear band: kitchen | yard passage | bedroom 4 -------------------
    { x1: X.kitchen, z1: Z.rear, x2: X.kitchen, z2: Z.a, openings: [{ at: 5, w: 3, type: 'door', sill: 0, head: 7.5 }] },
    { x1: X.passage, z1: Z.rear, x2: X.passage, z2: Z.a },
    {
      x1: 0, z1: Z.a, x2: W, z2: Z.a,
      openings: [
        { at: 7.5, w: 3.2, type: 'opening', sill: 0, head: 7.5 },   // kitchen -> utility
        { at: 12.5, w: 3.4, type: 'opening', sill: 0, head: 7.5 },  // yard -> hall
        { at: 21, w: 3, type: 'door', sill: 0, head: 7.5 },         // bedroom 4
      ],
    },

    // ---- service band: stair | utility | hall | B/WC 4 | store -----------
    { x1: X.kitchen, z1: Z.a, x2: X.kitchen, z2: Z.b, openings: [{ at: 1.5, w: 2.8, type: 'door', sill: 0, head: 7.5 }] },
    { x1: X.passage, z1: Z.a, x2: X.passage, z2: Z.b, openings: [{ at: 1.4, w: 2.6, type: 'door', sill: 0, head: 7 }] },
    { x1: X.wc, z1: Z.a, x2: X.wc, z2: Z.b },
    {
      x1: X.rc, z1: Z.b, x2: W, z2: Z.b,
      openings: [
        { at: 1.5, w: 3.4, type: 'opening', sill: 0, head: 7.5 },   // stair hall -> dining
        { at: 8, w: 3.2, type: 'opening', sill: 0, head: 7.5 },
        { at: 19.5, w: 2.6, type: 'door', sill: 0, head: 7 },       // store
      ],
    },
  ],
  rooms: [
    { name: 'Kitchen', cn: '厨房', x1: 0, z1: Z.rear, x2: X.kitchen, z2: Z.a },
    { name: 'Yard', cn: '后院', x1: X.kitchen, z1: Z.rear, x2: X.passage, z2: Z.a },
    { name: 'Bedroom 4', cn: '卧室 4', x1: X.passage, z1: Z.rear, x2: W, z2: Z.a },
    { name: 'Utility', cn: '工作间', x1: X.rc, z1: Z.a, x2: X.kitchen, z2: Z.b },
    { name: 'B/WC 4', cn: '浴室 4', x1: X.passage, z1: Z.a, x2: X.wc, z2: Z.b },
    { name: 'Store', cn: '储藏室', x1: X.wc, z1: Z.a, x2: W, z2: Z.b },
    { name: 'Stairs', cn: '楼梯', x1: 0, z1: Z.a, x2: X.rc, z2: Z.a + 10 },
    { name: 'Dining', cn: '餐厅', x1: X.rc, z1: Z.b, x2: W, z2: Z.c },
    { name: 'Living', cn: '客厅', x1: 0, z1: Z.c, x2: W, z2: Z.front },
    { name: 'Car Porch', cn: '停车位', x1: 0, z1: Z.front, x2: W, z2: Z.porch },
  ],
  stair: { x1: 0, z1: Z.a, x2: X.rc, z2: Z.a + 10 },
  furniture: [
    // kitchen
    { type: 'counter', x: 5.5, z: 1.3, rot: 0, w: 9.5, d: 2.1 },
    { type: 'counter', x: 1.3, z: 8, rot: 90, w: 10, d: 2.1 },
    { type: 'fridge', x: 9.3, z: 12.6, rot: 0 },
    // yard
    { type: 'sink', x: 14, z: 12.4, rot: 180 },
    // bedroom 4
    { type: 'bed', x: 23.5, z: 8.5, rot: 0, w: 5.6, d: 7 },
    { type: 'wardrobe', x: 28.4, z: 3.5, rot: 90, w: 6, d: 2 },
    { type: 'toilet', x: 17.8, z: 16, rot: 0 },
    { type: 'sink', x: 22.2, z: 18.6, rot: 180 },
    // dining
    { type: 'table', x: 19, z: 25, w: 7, d: 3.4, chairs: 6 },
    // living
    { type: 'rug', x: 15, z: 38, w: 13, d: 10 },
    { type: 'sofa', x: 15, z: 43.5, rot: 180, w: 9, d: 3.2 },
    { type: 'sofa', x: 6.5, z: 38.5, rot: 90, w: 6.5, d: 3 },
    { type: 'console', x: 26.5, z: 38, rot: -90, w: 8, d: 1.5 },
    // car porch - the plan parks two cars side by side
    { type: 'car', x: 7.5, z: 55.5, rot: 0 },
    { type: 'car', x: 21.5, z: 55.5, rot: 0 },
  ],
};

export const UPPER = {
  height: DIM.upperHeight,
  depth: BUILT,
  /** the first floor stops short of the rear party-wall strip - that is the RC roof */
  plate: [
    { x1: X.rc, z1: Z.rear, x2: W, z2: Z.a },
    { x1: 0, z1: Z.a, x2: W, z2: Z.front },
  ],
  rcRoof: { x1: 0, z1: Z.rear, x2: X.rc, z2: Z.a },
  balcony: { x1: 0, z1: Z.front, x2: W, z2: Z.porch },
  walls: [
    // ---- envelope -------------------------------------------------------
    {
      x1: X.rc, z1: Z.rear, x2: W, z2: Z.rear, ext: true,
      openings: [
        { at: 2.5, w: 6, type: 'window', sill: 3, head: 8 },        // bedroom 2
        { at: 14.5, w: 6, type: 'window', sill: 3, head: 8 },       // bedroom 3
      ],
    },
    // wall facing the flat RC roof
    {
      x1: X.rc, z1: Z.rear, x2: X.rc, z2: Z.a, ext: true,
      openings: [{ at: 5, w: 4, type: 'window', sill: 3, head: 8 }],
    },
    {
      x1: W, z1: Z.rear, x2: W, z2: Z.front, ext: true,
      openings: [
        { at: 4, w: 6, type: 'window', sill: 3, head: 8 },          // bedroom 3
        { at: 15.6, w: 2.6, type: 'window', sill: 5, head: 8 },     // B/WC 3
        { at: 22, w: 6, type: 'window', sill: 2.5, head: 8 },       // family hall
        { at: 32, w: 2.6, type: 'window', sill: 5, head: 8 },       // B/WC 1
        { at: 39, w: 7, type: 'window', sill: 2.5, head: 8 },       // master
      ],
    },
    {
      x1: 0, z1: Z.front, x2: W, z2: Z.front, ext: true,
      openings: [
        { at: 6, w: 8, type: 'glass', sill: 0, head: 8.5 },         // to the balcony
        { at: 18, w: 8, type: 'window', sill: 2, head: 8.5 },       // master
      ],
    },

    // ---- rear band: bedroom 2 | bedroom 3 -------------------------------
    { x1: X.bed2, z1: Z.rear, x2: X.bed2, z2: Z.a },
    {
      x1: X.rc, z1: Z.a, x2: W, z2: Z.a,
      openings: [
        { at: 3.5, w: 3, type: 'door', sill: 0, head: 7.5 },        // bedroom 2
        { at: 15, w: 3, type: 'door', sill: 0, head: 7.5 },         // bedroom 3
      ],
    },

    // ---- bathroom band: B/WC 2 | corridor | B/WC 3 ----------------------
    { x1: X.rc + 6, z1: Z.a, x2: X.rc + 6, z2: Z.b, openings: [{ at: 1.4, w: 2.6, type: 'door', sill: 0, head: 7 }] },
    { x1: X.wc, z1: Z.a, x2: X.wc, z2: Z.b, openings: [{ at: 1.4, w: 2.6, type: 'door', sill: 0, head: 7 }] },
    {
      x1: X.rc, z1: Z.b, x2: W, z2: Z.b,
      openings: [{ at: 5.5, w: 5, type: 'opening', sill: 0, head: 7.5 }],
    },

    // ---- middle band: wardrobe | family hall ----------------------------
    { x1: X.rc, z1: Z.b, x2: X.rc, z2: Z.c, openings: [{ at: 3, w: 3, type: 'door', sill: 0, head: 7.5 }] },
    { x1: X.bed2, z1: Z.b, x2: X.bed2, z2: Z.c, openings: [{ at: 5.5, w: 3.4, type: 'opening', sill: 0, head: 7.5 }] },

    // ---- master suite ---------------------------------------------------
    {
      x1: 0, z1: Z.c, x2: W, z2: Z.c,
      openings: [
        { at: 8, w: 3.2, type: 'door', sill: 0, head: 7.5 },        // into the master
        { at: 25.5, w: 2.8, type: 'door', sill: 0, head: 7 },       // into B/WC 1
      ],
    },
    { x1: X.wc, z1: Z.c, x2: X.wc, z2: Z.c + 8 },
    { x1: X.wc, z1: Z.c + 8, x2: W, z2: Z.c + 8 },

    // ---- balcony --------------------------------------------------------
    { x1: 0, z1: Z.porch, x2: W, z2: Z.porch, railing: true },
    { x1: W, z1: Z.front, x2: W, z2: Z.porch, railing: true },
  ],
  rooms: [
    { name: 'Bedroom 2', cn: '卧室 2', x1: X.rc, z1: Z.rear, x2: X.bed2, z2: Z.a },
    { name: 'Bedroom 3', cn: '卧室 3', x1: X.bed2, z1: Z.rear, x2: W, z2: Z.a },
    { name: 'RC Roof', cn: '平台屋顶', x1: 0, z1: Z.rear, x2: X.rc, z2: Z.a },
    { name: 'B/WC 2', cn: '浴室 2', x1: X.rc, z1: Z.a, x2: X.rc + 6, z2: Z.b },
    { name: 'Corridor', cn: '走廊', x1: X.rc + 6, z1: Z.a, x2: X.wc, z2: Z.b },
    { name: 'B/WC 3', cn: '浴室 3', x1: X.wc, z1: Z.a, x2: W, z2: Z.b },
    { name: 'Void / Stairs', cn: '楼梯口', x1: 0, z1: Z.a, x2: X.rc, z2: Z.a + 10 },
    { name: 'Wardrobe', cn: '衣帽间', x1: X.rc, z1: Z.b, x2: X.bed2, z2: Z.c },
    { name: 'Family Hall', cn: '家庭厅', x1: X.bed2, z1: Z.b, x2: W, z2: Z.c },
    { name: 'Master Bedroom', cn: '主人房', x1: 0, z1: Z.c, x2: X.wc, z2: Z.front },
    { name: 'B/WC 1', cn: '主人浴室', x1: X.wc, z1: Z.c, x2: W, z2: Z.c + 8 },
    { name: 'Balcony', cn: '阳台', x1: 0, z1: Z.front, x2: W, z2: Z.porch },
  ],
  /** stair well cut through the first floor slab */
  voids: [{ x1: 0.4, z1: Z.a + 0.4, x2: X.rc, z2: Z.a + 9.6 }],
  furniture: [
    // bedroom 2 & 3
    { type: 'bed', x: 11, z: 8, rot: 0, w: 5.6, d: 7 },
    { type: 'wardrobe', x: 16.9, z: 3.5, rot: -90, w: 6, d: 2 },
    { type: 'bed', x: 23.5, z: 8, rot: 0, w: 5.6, d: 7 },
    { type: 'wardrobe', x: 19, z: 3.5, rot: 90, w: 6, d: 2 },
    // bathrooms
    { type: 'toilet', x: 7.3, z: 16, rot: 0 },
    { type: 'shower', x: 10, z: 18, rot: 0 },
    { type: 'sink', x: 25.3, z: 16, rot: 0 },
    { type: 'toilet', x: 28.4, z: 18.6, rot: 180 },
    // wardrobe run + family hall
    { type: 'wardrobe', x: 7.3, z: 25, rot: 90, w: 8, d: 2 },
    { type: 'wardrobe', x: 16.5, z: 25, rot: -90, w: 8, d: 2 },
    { type: 'sofa', x: 24, z: 28.5, rot: 180, w: 6.5, d: 3 },
    { type: 'console', x: 24, z: 21.5, rot: 0, w: 6, d: 1.4 },
    // master suite
    { type: 'rug', x: 12, z: 40, w: 12, d: 10 },
    { type: 'bed', x: 12, z: 35.5, rot: 0, w: 7, d: 7.5 },
    { type: 'wardrobe', x: 1.6, z: 41, rot: -90, w: 9, d: 2 },
    { type: 'toilet', x: 25.3, z: 32, rot: 0 },
    { type: 'shower', x: 28, z: 36, rot: 0 },
    { type: 'sink', x: 28.3, z: 33.5, rot: 180 },
  ],
};

export { W as UNIT_WIDTH, TOTAL_DEPTH };
