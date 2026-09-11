import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { FT, ft, DIM, LEVEL } from './config.js';
import { createMaterials, litGlass } from './materials.js';
import { buildTerrace } from './terrace.js';
import { buildSite } from './site.js';
import { createSky } from './sky.js';
import { disposeTree } from './build.js';
import { initUI } from './ui.js';

const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe0ee, 120, 620);

const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 6000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.minDistance = 3;
controls.maxDistance = 400;

// ---------------------------------------------------------------- lighting
const sky = createSky();
scene.add(sky.mesh);

const hemi = new THREE.HemisphereLight(0xbfd8f2, 0x6d7a5a, 1.0);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.05;
scene.add(sun);
scene.add(sun.target);

const ambient = new THREE.AmbientLight(0xffffff, 0.18);
scene.add(ambient);

// two lamps switched on only for the interior walk-through
const interiorLights = [0, 1].map(() => {
  const l = new THREE.PointLight(0xffe3bd, 0, ft(45), 2);
  scene.add(l);
  return l;
});

const fill = new THREE.DirectionalLight(0xa9c6e8, 0.35);
fill.position.set(-60, 40, -80);
scene.add(fill);

// -------------------------------------------------------------- the model
const mats = createMaterials();
const model = new THREE.Group();
model.scale.setScalar(FT); // authored in feet, displayed in metres
scene.add(model);

const state = {
  units: 6,
  roof: true,
  upper: true,
  labels: false,
  furniture: true,
  hour: 15,
  totalWidth: 0,
  focusUnit: 0,
  interior: false,
};

let terrace = null;
let site = null;

function build(count) {
  if (terrace) {
    model.remove(terrace.group);
    disposeTree(terrace.group);
  }
  if (site) {
    model.remove(site);
    disposeTree(site);
  }
  const built = buildTerrace(count, mats);
  terrace = built;
  model.add(built.group);
  site = buildSite(mats, built.row);
  model.add(site);
  state.totalWidth = built.row.totalWidth;
  const mid = Math.floor(count / 2);
  state.focusUnit = Math.max(0, mid - (mid % 2)); // even index = unmirrored plan
  applyToggles();
  frameShadows();
}

function eachUnit(fn) {
  terrace?.row.units.forEach(({ unit }, i) => fn(unit.userData, i));
}

function applyToggles() {
  eachUnit((u, i) => {
    u.roof.visible = state.roof;
    u.upper.visible = state.upper;
    // labels would be unreadable on every unit at once - annotate one show unit
    u.labels.visible = state.labels && i === state.focusUnit;
    u.labelsGround.visible = !state.upper;
    u.labelsUpper.visible = state.upper;
    u.furniture.forEach((f) => (f.visible = state.furniture));
  });
  ambient.intensity = state.interior ? 0.24 : 0.18;
  setHour(state.hour);
  interiorLights.forEach((l) => (l.intensity = state.interior ? 45 : 0));
}

function frameShadows() {
  const w = ft(state.totalWidth) / 2 + 30;
  const cam = sun.shadow.camera;
  cam.left = -w;
  cam.right = w;
  cam.top = w;
  cam.bottom = -w;
  cam.near = 1;
  cam.far = w * 4;
  cam.updateProjectionMatrix();
}

// --------------------------------------------------------- time of day
function setHour(h) {
  state.hour = h;
  const centre = new THREE.Vector3(ft(state.totalWidth / 2), 0, ft(20));
  // 6h -> sunrise (east), 18h -> sunset (west)
  const t = (h - 6) / 12; // 0..1 across the day
  const elev = Math.sin(Math.PI * t) * 72 * (Math.PI / 180);
  const azim = (-100 + t * 200) * (Math.PI / 180);
  const r = ft(260);
  const dir = new THREE.Vector3(
    Math.sin(azim) * Math.cos(elev),
    Math.max(Math.sin(elev), -0.25),
    Math.cos(azim) * Math.cos(elev) * 0.9 + 0.25
  ).normalize();

  sun.position.copy(centre).addScaledVector(dir, r);
  sun.target.position.copy(centre);
  sun.target.updateMatrixWorld();

  const day = THREE.MathUtils.clamp(Math.sin(Math.PI * t), 0, 1);
  const dusk = THREE.MathUtils.clamp(1 - day * 2.4, 0, 1);
  const night = h < 6.4 || h > 18.6;

  sun.intensity = night ? 0.15 : 1.15 + day * 2.2;
  sun.color.setHSL(0.09 - 0.02 * day, 0.55 - 0.35 * day, 0.55 + 0.35 * day);
  hemi.intensity = night ? 0.26 : 0.45 + day * 0.95;
  renderer.toneMappingExposure = (night ? 0.95 : 1.05 + day * 0.2) * (state.interior ? 0.72 : 1);

  const top = new THREE.Color().setHSL(0.6, 0.62, night ? 0.08 : 0.28 + day * 0.24);
  const bottom = new THREE.Color().setHSL(0.58 - dusk * 0.5, 0.5, night ? 0.05 : 0.62 + day * 0.2);
  sky.uniforms.top.value.copy(top);
  sky.uniforms.bottom.value.copy(bottom);
  sky.uniforms.sun.value.copy(dir);
  sky.uniforms.sunColor.value.setHSL(0.08, 0.8, night ? 0.05 : 0.55 - day * 0.15);
  scene.fog.color.copy(bottom);
  renderer.setClearColor(bottom);

  const lit = night ? 1 : dusk * 0.55;
  litGlass.forEach((g) => (g.emissiveIntensity = lit));
  mats.lampGlow.emissiveIntensity = night ? 1.4 : dusk * 0.8;
  mats.carGlass.emissiveIntensity = 0;
}

// ------------------------------------------------------------- camera views
const flight = { active: false, t: 0, from: new THREE.Vector3(), to: new THREE.Vector3(), fromT: new THREE.Vector3(), toT: new THREE.Vector3() };

function flyTo(pos, target, instant = false) {
  if (instant) {
    camera.position.copy(pos);
    controls.target.copy(target);
    controls.update();
    return;
  }
  flight.from.copy(camera.position);
  flight.to.copy(pos);
  flight.fromT.copy(controls.target);
  flight.toT.copy(target);
  flight.t = 0;
  flight.active = true;
}

const V = (x, y, z) => new THREE.Vector3(ft(x), ft(y), ft(z));

function view(name, instant = false) {
  const cx = state.totalWidth / 2;
  const focus = terrace.row.units[state.focusUnit];
  // plan views frame the annotated unit and its neighbours, not the whole row
  const planDist = 150;
  const planX = focus.x + focus.width / 2;
  const fov = { street: 50, facade: 45, aerial: 50, cutaway: 45, ground: 26, upper: 26, interior: 68 };
  camera.fov = fov[name] ?? 50;
  camera.updateProjectionMatrix();

  switch (name) {
    case 'street':
      setMode({ roof: true, upper: true, labels: false, interior: false });
      flyTo(V(cx - 55, 24, 132), V(cx - 6, 12, 30), instant);
      break;
    case 'facade':
      setMode({ roof: true, upper: true, labels: false, interior: false });
      flyTo(V(cx, 20, 118), V(cx, 15, 36), instant);
      break;
    case 'aerial':
      setMode({ roof: true, upper: true, labels: false, interior: false });
      flyTo(V(cx + 95, 120, 175), V(cx, 6, 22), instant);
      break;
    case 'cutaway':
      setMode({ roof: false, upper: true, labels: true, interior: false });
      flyTo(V(cx - 70, 78, 138), V(cx - 4, 8, 26), instant);
      break;
    case 'ground':
      setMode({ roof: false, upper: false, labels: true, interior: false });
      flyTo(V(planX, planDist * 0.96, 24 + planDist * 0.26), V(planX, 0, 24), instant);
      break;
    case 'upper':
      setMode({ roof: false, upper: true, labels: true, interior: false });
      flyTo(V(planX, planDist * 0.96, 24 + planDist * 0.26), V(planX, 0, 24), instant);
      break;
    case 'interior': {
      setMode({ roof: true, upper: true, labels: false, interior: true });
      const x = focus.x + focus.width / 2;
      interiorLights[0].position.set(ft(x), ft(LEVEL.ground + 8.5), ft(29));
      interiorLights[1].position.set(ft(x), ft(LEVEL.ground + 8.5), ft(17));
      flyTo(V(x - 1, LEVEL.ground + 5.4, 32.8), V(x, LEVEL.ground + 4, 10), instant);
      break;
    }
  }
}

function setMode({ roof, upper, labels, interior }) {
  state.roof = roof;
  state.upper = upper;
  state.labels = labels;
  state.interior = interior;
  applyToggles();
  ui?.sync(state);
}

// ------------------------------------------------------------------ startup
let ui = null;

build(state.units);
setHour(state.hour);
view('street', true);

ui = initUI({
  state,
  setUnits(n) {
    state.units = n;
    build(n);
    view('street');
  },
  setToggle(key, value) {
    state[key] = value;
    applyToggles();
  },
  setHour,
  setView: (v) => view(v),
  resetCamera: () => view('street'),
});
ui.sync(state);

// -------------------------------------------------------------------- loop
function resize() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  if (canvas.width !== w * renderer.getPixelRatio() || canvas.height !== h * renderer.getPixelRatio()) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
window.addEventListener('resize', resize);

const clock = new THREE.Clock();
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function tick() {
  const dt = clock.getDelta();
  if (flight.active) {
    flight.t = Math.min(1, flight.t + dt / 1.2);
    const e = ease(flight.t);
    camera.position.lerpVectors(flight.from, flight.to, e);
    controls.target.lerpVectors(flight.fromT, flight.toT, e);
    if (flight.t >= 1) flight.active = false;
  }
  resize();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
resize();
tick();

document.getElementById('loading')?.remove();

// expose for console tinkering
window.dreamHouse = { renderer, scene, camera, controls, state, view, setHour, DIM, LEVEL, ft };
