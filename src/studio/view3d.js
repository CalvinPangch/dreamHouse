/**
 * The 3D room. Camera only - arranging happens on the 2D plan, so this view
 * never mutates the document except to record where the camera is looking,
 * which is part of what a saved project restores.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TONE } from '../design.js';
import { soft } from '../build.js';
import { WALL_HEIGHT } from './project.js';
import { buildPiece, disposePiece } from './piece.js';
import { CATALOG_BY_ID } from './catalog.js';

export class View3D extends EventTarget {
  constructor(canvas, doc) {
    super();
    this.canvas = canvas;
    this.doc = doc;
    this.running = false;
    this.shellKey = '';

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 40;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    this.controls.addEventListener('end', () => this._recordCamera());

    this.shell = new THREE.Group();
    this.furniture = new THREE.Group();
    this.scene.add(this.shell, this.furniture);
    this._light();

    this._tick = this._tick.bind(this);
  }

  _light() {
    this.scene.add(new THREE.HemisphereLight(0xfdf6e8, 0xcfc6b4, 1.25));
    const sun = new THREE.DirectionalLight(0xfff2da, 1.5);
    sun.position.set(6, 9, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 45;
    const extent = 12;
    Object.assign(sun.shadow.camera, { left: -extent, right: extent, top: extent, bottom: -extent });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0015;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xfff6e6, 0.35));
  }

  setDoc(doc) {
    this.doc = doc;
    this.rebuild();
  }

  /* --------------------------------------------------------------- scene */

  rebuild() {
    this._buildShell();
    this._buildFurniture();
    this._applyCamera();
  }

  _buildShell() {
    const { w, d, floor } = this.doc.room;
    const key = `${w}|${d}|${floor}`;
    if (key === this.shellKey) return;
    this.shellKey = key;

    for (const child of [...this.shell.children]) {
      this.shell.remove(child);
      disposePiece(child);
    }

    const t = 0.12;
    const floorColor = floor === 'stone' ? '#ded8cc' : floor === 'walnut' ? TONE.oakDeep : TONE.oak;
    const board = soft(w, t, d, floorColor, { x: w / 2, y: -t / 2, z: d / 2, radius: 0.01, cast: false });
    this.shell.add(board);

    // back and left walls only - the room stays open towards the camera
    const back = soft(w + t, WALL_HEIGHT, t, TONE.shell, {
      x: w / 2, y: WALL_HEIGHT / 2, z: -t / 2, radius: 0.01, cast: false,
    });
    const left = soft(t, WALL_HEIGHT, d, TONE.shellWarm, {
      x: -t / 2, y: WALL_HEIGHT / 2, z: d / 2, radius: 0.01, cast: false,
    });
    this.shell.add(back, left);

    // a window on the back wall, for scale and for somewhere for the light to come from
    const winW = Math.min(1.9, w * 0.42);
    const frame = new THREE.Group();
    const sill = 0.95;
    const winH = 1.25;
    const fr = 0.07;
    const cx = w * 0.68;
    for (const [bw, bh, by] of [[winW + fr * 2, fr, sill - fr / 2], [winW + fr * 2, fr, sill + winH + fr / 2]])
      frame.add(soft(bw, bh, 0.1, TONE.linen, { x: cx, y: by, z: 0.02, radius: 0.01, cast: false }));
    for (const s of [-1, 1])
      frame.add(soft(fr, winH + fr * 2, 0.1, TONE.linen, {
        x: cx + s * (winW / 2 + fr / 2), y: sill + winH / 2, z: 0.02, radius: 0.01, cast: false,
      }));
    frame.add(soft(winW, winH, 0.03, '#eef4f4', { x: cx, y: sill + winH / 2, z: 0.03, radius: 0.005, cast: false, receive: false }));
    this.shell.add(frame);

    // skirting
    this.shell.add(soft(w, 0.09, 0.03, TONE.cream, { x: w / 2, y: 0.045, z: 0.05, radius: 0.005, cast: false }));
    this.shell.add(soft(0.03, 0.09, d, TONE.cream, { x: 0.05, y: 0.045, z: d / 2, radius: 0.005, cast: false }));
  }

  _buildFurniture() {
    for (const child of [...this.furniture.children]) {
      this.furniture.remove(child);
      disposePiece(child);
    }
    for (const item of this.doc.items) {
      const piece = CATALOG_BY_ID.get(item.catalogId);
      const group = buildPiece(item.catalogId, item.finish);
      if (!group) continue;
      group.position.set(item.x, piece.mount === 'ceiling' ? WALL_HEIGHT - (piece.drop || 0.8) : 0, item.z);
      group.rotation.y = (-item.rot * Math.PI) / 180;
      group.traverse((n) => {
        if (n.isMesh && piece.id !== 'rug') { n.castShadow = true; n.receiveShadow = true; }
      });
      this.furniture.add(group);
    }
  }

  /* -------------------------------------------------------------- camera */

  _applyCamera() {
    const { w, d } = this.doc.room;
    const { theta, phi, dist } = this.doc.view.orbit;
    const target = new THREE.Vector3(w / 2, 1.05, d / 2);
    this.controls.target.copy(target);
    this.camera.position.set(
      target.x + dist * Math.sin(phi) * Math.sin(theta),
      target.y + dist * Math.cos(phi),
      target.z + dist * Math.sin(phi) * Math.cos(theta)
    );
    this.controls.update();
  }

  _recordCamera() {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const dist = offset.length();
    if (!dist) return;
    const orbit = {
      dist,
      phi: Math.acos(Math.min(1, Math.max(-1, offset.y / dist))),
      theta: Math.atan2(offset.x, offset.z),
    };
    const prev = this.doc.view.orbit;
    const same =
      Math.abs(prev.dist - orbit.dist) < 1e-3 &&
      Math.abs(prev.phi - orbit.phi) < 1e-3 &&
      Math.abs(prev.theta - orbit.theta) < 1e-3;
    this.doc.view.orbit = orbit;
    if (!same) this.dispatchEvent(new CustomEvent('viewchange'));
  }

  resetCamera() {
    const { w, d } = this.doc.room;
    this.doc.view.orbit = { theta: 0.86, phi: 1.02, dist: Math.max(6, Math.hypot(w, d) * 1.22) };
    this._applyCamera();
    this.dispatchEvent(new CustomEvent('viewchange'));
  }

  /* ------------------------------------------------------------ lifecycle */

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(rect.width, rect.height, false);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.resize();
    this._tick();
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  _tick() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this._tick);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
