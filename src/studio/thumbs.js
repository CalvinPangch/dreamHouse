/**
 * Catalogue thumbnails, rendered from the same models the room uses, so the
 * card in the sidebar and the piece on the plan are never out of step.
 *
 * One throwaway renderer draws every piece at startup and is then disposed.
 * If WebGL is unavailable the cards fall back to a CSS block - the studio's 3D
 * view will already have said so more loudly.
 */
import * as THREE from 'three';
import { CATALOG } from './catalog.js';
import { buildPiece, disposePiece } from './piece.js';

const W = 300;
const H = 220;

export function renderThumbnails() {
  const out = new Map();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return out;
  }

  try {
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfffaf0, 0xd8d0c0, 1.5));
    const key = new THREE.DirectionalLight(0xfff4e2, 1.35);
    key.position.set(3, 5, 4);
    scene.add(key, new THREE.AmbientLight(0xfff6e6, 0.5));

    const camera = new THREE.PerspectiveCamera(30, W / H, 0.05, 60);
    const holder = new THREE.Group();
    scene.add(holder);

    for (const piece of CATALOG) {
      const model = buildPiece(piece.id, piece.finish);
      if (!model) continue;
      holder.add(model);

      // frame the piece on its longest dimension, seen from a gentle three-quarter
      const reach = Math.max(piece.w, piece.d, piece.h);
      const dist = reach * 3.1 + 0.9;
      const centre = new THREE.Vector3(0, piece.h / 2, 0);
      camera.position.set(dist * 0.62, piece.h / 2 + reach * 0.85 + 0.35, dist * 0.78);
      camera.lookAt(centre);

      renderer.render(scene, camera);
      try {
        out.set(piece.id, renderer.domElement.toDataURL('image/png'));
      } catch {
        /* tainted or unsupported - the card falls back */
      }
      holder.remove(model);
      disposePiece(model);
    }
  } catch {
    /* leave whatever was rendered before the failure */
  } finally {
    renderer.dispose();
    renderer.forceContextLoss?.();
  }

  return out;
}
