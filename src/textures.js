/** Procedural canvas textures - keeps the project dependency-free. */
import * as THREE from 'three';

function canvas(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')];
}

function toTexture(c, repeat = [1, 1], aniso = 8) {
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = aniso;
  return tex;
}

function noise(ctx, size, amount, alpha = 0.06) {
  for (let i = 0; i < amount; i++) {
    const v = Math.random() * 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
}

/** Dark concrete roof tiles, laid in courses. */
export function roofTiles(repeat = [4, 10]) {
  const size = 256;
  const [c, ctx] = canvas(size);
  ctx.fillStyle = '#1d2023';
  ctx.fillRect(0, 0, size, size);
  const rows = 8;
  const h = size / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * h;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#33383d');
    g.addColorStop(0.75, '#262a2e');
    g.addColorStop(1, '#15181a');
    ctx.fillStyle = g;
    ctx.fillRect(0, y + 1, size, h - 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 2;
    const cols = 6;
    for (let i = 0; i <= cols; i++) {
      const x = (i * size) / cols + (r % 2 ? size / cols / 2 : 0);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.stroke();
    }
  }
  noise(ctx, size, 1600, 0.05);
  return toTexture(c, repeat);
}

/** Fine off-white render / plaster. */
export function plaster(repeat = [2, 2], base = '#f2f0ea') {
  const size = 256;
  const [c, ctx] = canvas(size);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, 6000, 0.04);
  return toTexture(c, repeat);
}

/** Driveway / porch pavers. */
export function pavers(repeat = [4, 8]) {
  const size = 256;
  const [c, ctx] = canvas(size);
  ctx.fillStyle = '#8e8b84';
  ctx.fillRect(0, 0, size, size);
  const n = 4;
  const s = size / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const shade = 150 + Math.random() * 40;
      ctx.fillStyle = `rgb(${shade},${shade - 4},${shade - 12})`;
      ctx.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
    }
  }
  noise(ctx, size, 2500, 0.05);
  return toTexture(c, repeat);
}

/** Lawn. */
export function grass(repeat = [40, 40]) {
  const size = 128;
  const [c, ctx] = canvas(size);
  ctx.fillStyle = '#4c7838';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 4000; i++) {
    const g = 60 + Math.random() * 70;
    ctx.fillStyle = `rgba(${40 + Math.random() * 30},${g + 40},${45},0.5)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 3);
  }
  return toTexture(c, repeat);
}

/** Asphalt road. */
export function asphalt(repeat = [8, 40]) {
  const size = 128;
  const [c, ctx] = canvas(size);
  ctx.fillStyle = '#37383b';
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, 5000, 0.12);
  return toTexture(c, repeat);
}

/** Interior floor tiles. */
export function floorTiles(repeat = [6, 10]) {
  const size = 256;
  const [c, ctx] = canvas(size);
  ctx.fillStyle = '#ded5c6';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(140,130,115,0.6)';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, size, size);
  noise(ctx, size, 4000, 0.05);
  return toTexture(c, repeat);
}

/** Dark stained timber for doors and facade accents. */
export function timber(repeat = [1, 1]) {
  const size = 256;
  const [c, ctx] = canvas(size);
  ctx.fillStyle = '#6a4728';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = `rgba(${60 + Math.random() * 60},${35 + Math.random() * 30},${18},0.35)`;
    ctx.lineWidth = 1 + Math.random() * 3;
    const x = Math.random() * size;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 8, size / 3, x - 8, (size * 2) / 3, x, size);
    ctx.stroke();
  }
  return toTexture(c, repeat);
}
