/** Shared materials. Glass materials are collected so night mode can light them up. */
import * as THREE from 'three';
import { PALETTE } from './config.js';
import * as TEX from './textures.js';

export const litGlass = [];

function std(params) {
  return new THREE.MeshStandardMaterial(params);
}

export function createMaterials() {
  const glass = std({
    color: PALETTE.glass,
    roughness: 0.08,
    metalness: 0.25,
    transparent: true,
    opacity: 0.55,
    emissive: new THREE.Color(0xffcf8a),
    emissiveIntensity: 0,
  });
  const glassRail = glass.clone();
  glassRail.opacity = 0.32;
  litGlass.length = 0;
  litGlass.push(glass);

  return {
    plaster: std({ map: TEX.plaster([2, 2]), color: PALETTE.plaster, roughness: 0.92 }),
    plasterShade: std({ map: TEX.plaster([2, 2], '#e6e2d9'), color: 0xffffff, roughness: 0.94 }),
    charcoal: std({ color: PALETTE.charcoal, roughness: 0.7, metalness: 0.15 }),
    trim: std({ color: PALETTE.trim, roughness: 0.55, metalness: 0.3 }),
    frame: std({ color: 0x191c1f, roughness: 0.45, metalness: 0.5 }),
    timber: std({ map: TEX.timber(), roughness: 0.6 }),
    roof: std({ map: TEX.roofTiles(), color: 0xffffff, roughness: 0.85 }),
    slab: std({ color: PALETTE.slab, roughness: 0.9 }),
    interiorFloor: std({ map: TEX.floorTiles(), color: 0xffffff, roughness: 0.55 }),
    glass,
    glassRail,
    grass: std({ map: TEX.grass(), color: 0xffffff, roughness: 1 }),
    hedge: std({ color: PALETTE.hedge, roughness: 1 }),
    paver: std({ map: TEX.pavers(), color: 0xffffff, roughness: 0.85 }),
    road: std({ map: TEX.asphalt(), color: 0xffffff, roughness: 0.95 }),
    kerb: std({ color: PALETTE.kerb, roughness: 0.9 }),
    metal: std({ color: 0x2a2d31, roughness: 0.4, metalness: 0.75 }),
    white: std({ color: 0xf7f6f2, roughness: 0.7 }),
    fabric: std({ color: 0x8d99a6, roughness: 0.95 }),
    fabricWarm: std({ color: 0xc9b8a2, roughness: 0.95 }),
    wood: std({ color: 0x8a6440, roughness: 0.7 }),
    trunk: std({ color: 0x5a4630, roughness: 0.95 }),
    foliage: std({ color: 0x4a7c3f, roughness: 1, flatShading: true }),
    foliageDark: std({ color: 0x3c6634, roughness: 1, flatShading: true }),
    carBody: std({ color: 0xb9c2cb, roughness: 0.35, metalness: 0.6 }),
    carGlass: std({ color: 0x223038, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.7 }),
    tyre: std({ color: 0x15171a, roughness: 0.95 }),
    lamp: std({ color: 0x33383d, roughness: 0.5, metalness: 0.6 }),
    lampGlow: std({ color: 0xffe6b0, emissive: 0xffd08a, emissiveIntensity: 0.2, roughness: 0.4 }),
    accentRed: std({ color: 0xd12b3c, roughness: 0.6 }),
  };
}
