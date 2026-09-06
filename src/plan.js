/**
 * Floor plans, authored on the 21' x 60' lot (feet).
 *
 * Local coordinates of one unit:
 *   x : 0 .. width, left party wall -> right party wall
 *   z : 0 = rear wall, +z towards the street
 *       0 .. 34  built-up area
 *      34 .. 40  first floor cantilever over the car porch
 *      34 .. 54  car porch / front yard (ground level)
 *
 * Wall segments: { x1, z1, x2, z2, ext?, openings? }
 * Openings are measured from (x1,z1) along the wall:
 *   { at, w, type: 'door'|'glass'|'window'|'opening', sill, head }
 */

import { DIM, UPPER_DEPTH } from './config.js';

const D = DIM.builtUp; // 34

export const GROUND = {
  height: DIM.groundHeight,
  depth: D,
  walls: [
    // ---- envelope -------------------------------------------------------
    {
      x1: 0, z1: 0, x2: 21, z2: 0, ext: true,
      openings: [
        { at: 2, w: 3, type: 'door', sill: 0, head: 7.5 },
        { at: 11, w: 5, type: 'window', sill: 3, head: 7.5 },
      ],
    },
    {
      x1: 0, z1: D, x2: 21, z2: D, ext: true,
      openings: [
        { at: 2.5, w: 3.5, type: 'door', sill: 0, head: 8 },
        { at: 8.5, w: 10.5, type: 'glass', sill: 0.4, head: 9 },
      ],
    },

    // ---- partitions -----------------------------------------------------
    // wet kitchen / yard divider
    { x1: 0, z1: 5, x2: 21, z2: 5, openings: [{ at: 6.5, w: 3.5, type: 'opening', sill: 0, head: 7.5 }] },
    // bathroom + store block along the right wall
    { x1: 15, z1: 5, x2: 15, z2: 14, openings: [{ at: 1.5, w: 2.6, type: 'door', sill: 0, head: 7 }, { at: 6.4, w: 2.6, type: 'door', sill: 0, head: 7 }] },
    { x1: 15, z1: 10, x2: 21, z2: 10 },
    // kitchen / dining
    { x1: 0, z1: 14, x2: 15, z2: 14, openings: [{ at: 6, w: 6, type: 'opening', sill: 0, head: 8 }] },
  ],
  rooms: [
    { name: 'Wet Kitchen / Yard', cn: '后院 · 湿厨房', x1: 0, z1: 0, x2: 21, z2: 5 },
    { name: 'Dry Kitchen', cn: '干厨房', x1: 0, z1: 5, x2: 15, z2: 14 },
    { name: 'Bathroom 1', cn: '浴室 1', x1: 15, z1: 5, x2: 21, z2: 10 },
    { name: 'Store', cn: '储藏室', x1: 15, z1: 10, x2: 21, z2: 14 },
    { name: 'Stairs', cn: '楼梯', x1: 0, z1: 14, x2: 4, z2: 24 },
    { name: 'Dining', cn: '餐厅', x1: 4, z1: 14, x2: 21, z2: 24 },
    { name: 'Living', cn: '客厅', x1: 0, z1: 24, x2: 21, z2: D },
    { name: 'Car Porch', cn: '停车位', x1: 0, z1: D, x2: 21, z2: 54 },
  ],
  stair: { x1: 0, z1: 14, x2: 4, z2: 24 },
  furniture: [
    { type: 'sofa', x: 17.6, z: 29.5, rot: -90, w: 8, d: 3 },
    { type: 'rug', x: 10.5, z: 29.5, w: 8, d: 7 },
    { type: 'console', x: 1.5, z: 29.5, rot: 90, w: 7, d: 1.4 },
    { type: 'table', x: 12, z: 19, w: 6, d: 3.2, chairs: 6 },
    { type: 'counter', x: 7.5, z: 5.9, rot: 0, w: 13.5, d: 2 },
    { type: 'counter', x: 1.2, z: 9.5, rot: 90, w: 8, d: 2 },
    { type: 'fridge', x: 13.4, z: 8.4, rot: 0 },
    { type: 'toilet', x: 16.2, z: 6.2, rot: 0 },
    { type: 'sink', x: 20, z: 8.5, rot: 90 },
    { type: 'car', x: 10.5, z: 43.5, rot: 0 },
  ],
};

export const UPPER = {
  height: DIM.upperHeight,
  depth: UPPER_DEPTH, // 40
  walls: [
    // ---- envelope -------------------------------------------------------
    {
      x1: 0, z1: 0, x2: 21, z2: 0, ext: true,
      openings: [
        { at: 2.5, w: 5, type: 'window', sill: 3, head: 8 },
        { at: 13.5, w: 5, type: 'window', sill: 3, head: 8 },
      ],
    },
    // front face of the cantilever: master bathroom wall + recessed balcony
    {
      x1: 0, z1: 40, x2: 8, z2: 40, ext: true,
      openings: [{ at: 2.5, w: 3, type: 'window', sill: 4.5, head: 8 }],
    },
    { x1: 8, z1: 40, x2: 21, z2: 40, railing: true },

    // ---- partitions -----------------------------------------------------
    // rear bedrooms
    {
      x1: 0, z1: 11, x2: 21, z2: 11,
      openings: [
        { at: 3, w: 2.8, type: 'door', sill: 0, head: 7.5 },
        { at: 14.5, w: 2.8, type: 'door', sill: 0, head: 7.5 },
      ],
    },
    { x1: 10.5, z1: 0, x2: 10.5, z2: 11 },
    // corridor / bath / bedroom 2
    {
      x1: 4, z1: 14, x2: 21, z2: 14,
      openings: [
        { at: 1.6, w: 2.6, type: 'door', sill: 0, head: 7.5 },
        { at: 11.5, w: 2.8, type: 'door', sill: 0, head: 7.5 },
      ],
    },
    { x1: 10, z1: 14, x2: 10, z2: 24 },
    { x1: 4, z1: 19, x2: 10, z2: 19, openings: [{ at: 1.5, w: 3.5, type: 'opening', sill: 0, head: 7.5 }] },
    // master suite
    {
      x1: 0, z1: 24, x2: 21, z2: 24,
      openings: [{ at: 1.5, w: 2.8, type: 'door', sill: 0, head: 7.5 }],
    },
    {
      x1: 0, z1: 36, x2: 21, z2: 36,
      openings: [
        { at: 3, w: 2.6, type: 'door', sill: 0, head: 7.5 },
        { at: 11.5, w: 6, type: 'glass', sill: 0, head: 8.2 },
      ],
    },
    { x1: 8, z1: 36, x2: 8, z2: 40 },
  ],
  rooms: [
    { name: 'Bedroom 3', cn: '卧室 3', x1: 0, z1: 0, x2: 10.5, z2: 11 },
    { name: 'Bedroom 4', cn: '卧室 4', x1: 10.5, z1: 0, x2: 21, z2: 11 },
    { name: 'Corridor', cn: '走廊', x1: 0, z1: 11, x2: 21, z2: 14 },
    { name: 'Void / Stairs', cn: '楼梯口', x1: 0, z1: 14, x2: 4, z2: 24 },
    { name: 'Bathroom 2', cn: '浴室 2', x1: 4, z1: 14, x2: 10, z2: 19 },
    { name: 'Family Area', cn: '家庭厅', x1: 4, z1: 19, x2: 10, z2: 24 },
    { name: 'Bedroom 2', cn: '卧室 2', x1: 10, z1: 14, x2: 21, z2: 24 },
    { name: 'Master Bedroom', cn: '主人房', x1: 0, z1: 24, x2: 21, z2: 36 },
    { name: 'Master Bath', cn: '主人浴室', x1: 0, z1: 36, x2: 8, z2: 40 },
    { name: 'Balcony', cn: '阳台', x1: 8, z1: 36, x2: 21, z2: 40 },
  ],
  /** Openings cut through the first floor slab. */
  voids: [{ x1: 0.4, z1: 14.4, x2: 4, z2: 23.6 }],
  /** Areas of the slab that are outdoor / uncovered by the ceiling. */
  furniture: [
    { type: 'bed', x: 10.5, z: 31, rot: 0, w: 6.5, d: 7 },
    { type: 'wardrobe', x: 19.4, z: 28, rot: 90, w: 8, d: 2 },
    { type: 'bed', x: 15.5, z: 19, rot: 0, w: 5, d: 6.5 },
    { type: 'bed', x: 5.2, z: 5.5, rot: 0, w: 5, d: 6.5 },
    { type: 'bed', x: 15.8, z: 5.5, rot: 0, w: 5, d: 6.5 },
    { type: 'wardrobe', x: 9.6, z: 8.5, rot: 90, w: 4.5, d: 2 },
    { type: 'wardrobe', x: 11.4, z: 8.5, rot: -90, w: 4.5, d: 2 },
    { type: 'toilet', x: 5, z: 15.2, rot: 0 },
    { type: 'sink', x: 9, z: 17.5, rot: -90 },
    { type: 'shower', x: 5.6, z: 17.8, rot: 0 },
    { type: 'toilet', x: 1.6, z: 37.2, rot: 0 },
    { type: 'sink', x: 6.6, z: 37, rot: 0 },
    { type: 'shower', x: 6.2, z: 39, rot: 0 },
    { type: 'sofa', x: 7, z: 22.4, rot: 180, w: 4.5, d: 2.6 },
  ],
};

/** Facade band positions (dark timber-look accents) taken from the brochure. */
export const FACADE = {
  gableTrim: 0.55,
  bandHeight: 1.1,
};
