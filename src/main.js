import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { FT, HOUSE, TONE, FLOORS, PEOPLE } from './design.js';
import { buildFloor } from './house.js';
import { lamps } from './furniture.js';
import { createPeople, scheduleAt } from './people.js';
import { createLabels, updateLabels } from './labels.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#view');
const labelLayer = $('#labels');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function setPressed(button, on) {
  if (!button) return;
  button.classList.toggle('is-on', on);
  button.setAttribute('aria-pressed', String(on));
}

/* ------------------------------------------------------------- renderer */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();

const FRUSTUM = 17; // metres of vertical view at zoom 1
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -400, 800);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = true;
controls.minPolarAngle = 0.1;
controls.maxPolarAngle = Math.PI / 2 - 0.08;
controls.minZoom = 0.45;
controls.maxZoom = 6;

/* -------------------------------------------------------------- lighting */
const hemi = new THREE.HemisphereLight(0xfff3e2, 0xd8c9b0, 1.15);
scene.add(hemi);
const ambient = new THREE.AmbientLight(0xfff6ea, 0.5);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff0d8, 2.1);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0009;
sun.shadow.normalBias = 0.03;
const sc = sun.shadow.camera;
sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 120;
sc.updateProjectionMatrix();
scene.add(sun, sun.target);
const rim = new THREE.DirectionalLight(0xd9e6f2, 0.35);
rim.position.set(-30, 24, -26);
scene.add(rim);

// warm pools that switch on with the lamps in the evening
const indoorLights = [[8, 11], [22, 11], [9, 30], [23, 30], [15, 44]].map(([x, z]) => {
  const l = new THREE.PointLight(0xffd8a0, 0, 9, 2);
  l.position.set(x * FT, 2.6, z * FT);
  scene.add(l);
  return l;
});

/* ----------------------------------------------------------------- model */
const model = new THREE.Group();
model.scale.setScalar(FT);
scene.add(model);

const floors = new Map();
for (const def of FLOORS) {
  const built = buildFloor(def);
  built.group.visible = false;
  model.add(built.group);
  floors.set(def.id, { def, ...built });
}

const people = createPeople();

const state = {
  floor: 'ground',
  room: null,
  tab: 'roam',
  walls: false,
  furniture: true,
  labels: true,
  hour: 8.4,
  playing: false,
  speed: 24,
  weather: 'sun',
  roomLight: true,
};

const HOUSE_CENTRE = new THREE.Vector3((HOUSE.width / 2) * FT, 0, (HOUSE.depth / 2) * FT);
const ISO_DIR = new THREE.Vector3(1, 0.92, 1).normalize();

let labels = [];

/* ------------------------------------------------------------ camera fly */
const fly = { on: false, t: 0, dur: 0.9, fromT: new THREE.Vector3(), toT: new THREE.Vector3(), fromZ: 1, toZ: 1, fromP: new THREE.Vector3(), toP: new THREE.Vector3() };

function flyTo(target, zoom, dir = ISO_DIR, instant = false) {
  const pos = target.clone().addScaledVector(dir, 60);
  if (instant || reducedMotion.matches) {
    fly.on = false;
    controls.target.copy(target);
    camera.position.copy(pos);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    controls.update();
    return;
  }
  fly.fromT.copy(controls.target); fly.toT.copy(target);
  fly.fromP.copy(camera.position); fly.toP.copy(pos);
  fly.fromZ = camera.zoom; fly.toZ = zoom;
  fly.t = 0; fly.on = true;
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ------------------------------------------------------------ floor swap */
function showFloor(id) {
  state.floor = id;
  for (const [fid, f] of floors) f.group.visible = fid === id;
  state.room = null;
  buildChips();
  const f = floors.get(id);
  labels = createLabels(labelLayer, f.rooms, selectRoom);
  applyDisplay();
  placePeople(true);
  renderDetail(null);
  resetView();
  document.querySelectorAll('[data-floor]').forEach((b) => setPressed(b, b.dataset.floor === id));
  $('#view-floor').textContent = id === 'ground' ? 'Ground floor' : 'Upper floor';
  if (state.tab === 'notes') renderNotes();
}

function applyDisplay() {
  for (const [, f] of floors) {
    f.cutWalls.visible = !state.walls;
    f.fullWalls.visible = state.walls;
    f.glazing.visible = state.walls;
    f.furniture.visible = state.furniture;
  }
  setPressed($('#btn-walls'), state.walls);
  setPressed($('#sw-walls'), state.walls);
  setPressed($('#btn-furniture'), state.furniture);
}

/* --------------------------------------------------------- room selection */
function selectRoom(id) {
  if (state.tab === 'notes') setTab('roam');
  const f = floors.get(state.floor);
  const room = f.rooms.get(id);
  if (!room) return;
  state.room = id;

  for (const [rid, r] of f.rooms) {
    const on = rid === id;
    r.plate.material.color.copy(r.plate.userData.baseColor);
    if (on) r.plate.material.color.lerp(new THREE.Color('#ffffff'), 0.34);
    else r.plate.material.color.lerp(new THREE.Color(TONE.shellWarm), 0.42);
  }

  const d = room.def;
  const size = Math.max(d.x2 - d.x1, d.z2 - d.z1) * FT;
  flyTo(new THREE.Vector3(room.centre.x * FT, 0, room.centre.z * FT), THREE.MathUtils.clamp(FRUSTUM / (size * 1.9), 0.8, 3.2) * viewportScale(), state.tab === 'plan' ? PLAN_DIR : ISO_DIR);
  renderDetail(d);
  buildChips();
}

/** A room's footprint, e.g. 19' × 18'. */
function sizeOf(d) {
  return `${Math.round(d.x2 - d.x1)}' × ${Math.round(d.z2 - d.z1)}'`;
}

function renderDetail(d) {
  const el = $('#detail');
  if (!d) {
    el.innerHTML = `
      <span class="room-index">The whole house</span>
      <h3>Room to live.<small>4 BEDROOMS · 4 BATHROOMS</small></h3>
      <p class="mood">From the first coffee to the last light. Explore the spaces that make a home.</p>
      <button class="go" id="go">Explore ${state.floor === 'ground' ? 'ground' : 'upper'} floor <span aria-hidden="true">→</span></button>
      <div class="sep"></div>
      <div class="lede">WHAT'S INSIDE</div>
      <div class="floor-summary"><span class="number">01</span><b>Ground floor</b><span class="description">Living, dining, kitchen & study</span></div>
      <div class="floor-summary"><span class="number">02</span><b>Upper floor</b><span class="description">Bedrooms, wardrobe & family space</span></div>`;
    $('#go')?.addEventListener('click', () => {
      const first = floors.get(state.floor).def.rooms[0];
      selectRoom(first.id);
    });
    return;
  }
  el.innerHTML = `
    <span class="room-index">${state.floor === 'ground' ? '01 / Ground floor' : '02 / Upper floor'}</span>
    <h3>${d.name} <small>${sizeOf(d)}</small></h3>
    <p class="mood">${d.mood}</p>
    <button class="go" id="go">Look closer <span aria-hidden="true">↗</span></button>
    <div class="sep"></div>
    <div class="lede">IN THIS ROOM</div>
    <div class="row"><span class="ico" aria-hidden="true">◇</span><b>${(d.materials || [])[0] || 'In design'}</b></div>
    <div class="row"><span class="ico" aria-hidden="true">☼</span><b>House lights</b>
      <button class="switch ${state.roomLight ? 'is-on' : ''}" id="sw-light" aria-label="House lights" aria-pressed="${state.roomLight}"></button></div>
    <div class="row"><span class="ico">▦</span><b>Full walls</b>
      <button class="switch ${state.walls ? 'is-on' : ''}" id="sw-walls" aria-label="Full walls" aria-pressed="${state.walls}"></button></div>`;
  $('#go').addEventListener('click', () => {
    const size = Math.max(d.x2 - d.x1, d.z2 - d.z1) * FT;
    flyTo(
      new THREE.Vector3(((d.x1 + d.x2) / 2) * FT, 0, ((d.z1 + d.z2) / 2) * FT),
      THREE.MathUtils.clamp(FRUSTUM / (size * 1.1), 1.2, 5) * viewportScale(),
      state.tab === 'plan' ? PLAN_DIR : new THREE.Vector3(1, 0.55, 1).normalize()
    );
  });
  $('#sw-light').addEventListener('click', () => {
    state.roomLight = !state.roomLight;
    setPressed($('#sw-light'), state.roomLight);
    setHour(state.hour);
  });
  $('#sw-walls').addEventListener('click', () => {
    state.walls = !state.walls;
    applyDisplay();
  });
}

function buildChips() {
  const wrap = $('#chips');
  const focusedRoom = wrap.contains(document.activeElement) ? document.activeElement.dataset.room : null;
  wrap.innerHTML = '';
  for (const r of floors.get(state.floor).def.rooms) {
    const b = document.createElement('button');
    b.textContent = r.name;
    b.className = state.room === r.id ? 'is-on' : '';
    b.dataset.room = r.id;
    b.setAttribute('aria-pressed', String(state.room === r.id));
    b.addEventListener('click', () => selectRoom(r.id));
    wrap.appendChild(b);
    if (focusedRoom === r.id) b.focus({ preventScroll: true });
  }
}

/* -------------------------------------------------------------- the notes */
function renderNotes() {
  const wrap = $('#notes');
  wrap.innerHTML = `<div class="notes-heading"><div><div class="eyebrow">The design journal / ${state.floor === 'ground' ? '01' : '02'}</div><h2>${state.floor === 'ground' ? 'Ground' : 'Upper'} floor, considered.</h2></div><p>Materials, light, and the way we live.</p></div><div class="notes-grid"></div>`;
  for (const r of floors.get(state.floor).def.rooms) {
    const card = document.createElement('article');
    card.className = 'note';
    card.innerHTML = `
      <div class="tag" style="background:${r.accent}"></div>
      <h3>${r.name}<small>${sizeOf(r)}</small></h3>
      <div class="mood">${r.mood}</div>
      <p>${r.note}</p>
      <ul>${(r.materials || []).map((m) => `<li>${m}</li>`).join('')}</ul>
      <div class="light">${r.light || ''}</div>
      <button class="note-link" aria-label="Explore ${r.name}">Explore this room <span aria-hidden="true">↗</span></button>`;
    card.querySelector('button').addEventListener('click', () => {
      setTab('roam');
      selectRoom(r.id);
      $('#go').focus({ preventScroll: true });
      if (matchMedia('(max-width: 760px)').matches) $('#viewport').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
    wrap.querySelector('.notes-grid').appendChild(card);
  }
}

/* ------------------------------------------------------------------ views */
const PLAN_DIR = new THREE.Vector3(0, 1, 0.001).normalize();
function viewportScale() {
  return Math.min(1, .82 * canvas.clientWidth / Math.max(1, canvas.clientHeight));
}
function resetView() {
  if (state.tab === 'notes') return;
  if (state.tab === 'plan') return topView();
  flyTo(HOUSE_CENTRE.clone(), 1.05 * viewportScale());
}
function topView() {
  flyTo(HOUSE_CENTRE.clone(), 1.0 * viewportScale(), PLAN_DIR);
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll('[data-tab]').forEach((b) => setPressed(b, b.dataset.tab === tab));
  const roam = tab === 'roam';
  const plan = tab === 'plan';
  $('#notes').classList.toggle('hidden', tab !== 'notes');
  labelLayer.classList.toggle('hidden', tab === 'notes' || !state.labels);
  $('#stage').classList.toggle('is-notes', tab === 'notes');
  $('#info-panel').inert = tab === 'notes';
  $('#viewport').inert = tab === 'notes';
  $('#view-mode').textContent = plan ? 'Top-down view' : 'Isometric view';
  controls.enableRotate = !plan;
  controls.minPolarAngle = plan ? 0.001 : 0.1;
  $('#detail').classList.toggle('hidden', tab === 'notes');
  $('#dock').classList.toggle('hidden', tab === 'notes');
  $('#walkhint').innerHTML = plan ? 'Drag to pan <span>·</span> Scroll to zoom <span>·</span> Select a room to explore' : 'Drag to orbit <span>·</span> Scroll to zoom <span>·</span> Select a room to explore';
  controls.mouseButtons.LEFT = plan ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
  controls.touches.ONE = plan ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
  resize();
  if (tab === 'notes') renderNotes();
  if (plan) topView();
  if (roam) resetView();
}

/* -------------------------------------------------------------- day cycle */
const PHASES = [
  [6.5, 'First light'], [9, 'Soft morning light'], [11.5, 'Bright and clear'], [14, 'Warm afternoon'],
  [17, 'Low sun on the walls'], [19, 'Dusk settling in'], [21, 'Lamps are on'], [24, 'Late and quiet'],
];

function phaseOf(h) {
  for (const [limit, name] of PHASES) if (h < limit) return name;
  return 'Late and quiet';
}

const WX = {
  sun: { sun: 2.1, hemi: 1.15, tint: '#fff0d8', shadow: true },
  cloud: { sun: 0.75, hemi: 1.5, tint: '#f3ecdf', shadow: true },
  rain: { sun: 0.4, hemi: 1.35, tint: '#dfe6ea', shadow: false },
};

function setHour(h) {
  state.hour = h;
  const t = THREE.MathUtils.clamp((h - 5) / 18, 0, 1);
  const elev = Math.sin(Math.PI * t) * 68 * (Math.PI / 180);
  const azim = (-115 + t * 230) * (Math.PI / 180);
  const day = THREE.MathUtils.clamp(Math.sin(Math.PI * t), 0, 1);
  const night = h < 6.2 || h > 19.3;
  const dusk = THREE.MathUtils.clamp(1 - day * 2.1, 0, 1);
  const w = WX[state.weather];

  const dir = new THREE.Vector3(
    Math.sin(azim) * Math.cos(elev),
    Math.max(Math.sin(elev), 0.08),
    Math.cos(azim) * Math.cos(elev) * 0.8 + 0.3
  ).normalize();
  sun.position.copy(HOUSE_CENTRE).addScaledVector(dir, 42);
  sun.target.position.copy(HOUSE_CENTRE);
  sun.target.updateMatrixWorld();
  sun.castShadow = w.shadow && !night;

  sun.intensity = night ? 0.18 : (0.5 + day * 1.9) * (w.sun / 2.1);
  sun.color.set(w.tint).lerp(new THREE.Color('#ffc98a'), dusk * 0.7);
  hemi.intensity = night ? 0.4 : w.hemi * (0.7 + day * 0.5);
  ambient.intensity = night ? 0.34 : 0.42 + day * 0.22;
  renderer.toneMappingExposure = night ? 1.0 : 1.06 + day * 0.12;

  // evening lamps
  const warmth = state.roomLight ? (night ? 1 : dusk * 0.85) : 0;
  for (const m of lamps) m.emissiveIntensity = warmth * 2.2;
  for (const l of indoorLights) l.intensity = warmth * 7;

  document.documentElement.dataset.light = night ? 'night' : dusk > 0.35 ? 'dusk' : 'day';

  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const clock = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  $('#clock2').textContent = clock;
  $('#phase2').textContent = phaseOf(h);
  $('#time').value = String(h);
  $('#time').setAttribute('aria-valuetext', `${clock}, ${phaseOf(h)}`);

  placePeople();
}

/* ----------------------------------------------------------------- people */
function placePeople(instant = false) {
  const f = floors.get(state.floor);
  const cast = $('#cast');
  for (const p of people) {
    const slot = scheduleAt(p.def, state.hour);
    p.slot = slot;
    const onThisFloor = slot.floor === state.floor;
    if (p.mesh.parent !== f.group) f.group.add(p.mesh);
    p.mesh.visible = onThisFloor;
    const room = f.rooms.get(slot.room);
    if (room && onThisFloor) {
      const jitterX = ((p.def.id.charCodeAt(0) % 5) - 2) * 0.6;
      p.target.set(room.centre.x + jitterX, 0.3, room.centre.z + 1.2);
      if (instant) p.mesh.position.copy(p.target);
    }
    let who = cast.querySelector(`[data-person="${p.def.id}"]`);
    if (!who) {
      who = document.createElement('button');
      who.className = 'who';
      who.dataset.person = p.def.id;
      who.innerHTML = `<span class="face" aria-hidden="true">${p.def.name[0]}</span>
        <span><b>${p.def.name}</b><span class="activity"></span></span>`;
      who.addEventListener('click', () => {
        const current = p.slot;
        if (current.floor !== state.floor) showFloor(current.floor);
        selectRoom(current.room);
      });
      cast.appendChild(who);
    }
    who.setAttribute('aria-label', `Find ${p.def.name}: ${slot.act}`);
    who.title = `Find ${p.def.name}: ${slot.act}`;
    who.querySelector('.activity').textContent = slot.act;
  }
}

/* ------------------------------------------------------------ interaction */
const ray = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downAt = null;

canvas.addEventListener('pointerdown', (e) => (downAt = { x: e.clientX, y: e.clientY }));
canvas.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  downAt = null;
  if (moved > 5 || state.tab === 'notes') return;
  const rect = canvas.getBoundingClientRect();
  pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(pointer, camera);
  const hits = ray.intersectObjects(floors.get(state.floor).picks, false);
  if (hits.length) selectRoom(hits[0].object.userData.roomId);
});

document.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
document.querySelectorAll('[data-floor]').forEach((b) => b.addEventListener('click', () => showFloor(b.dataset.floor)));
$('#btn-reset').addEventListener('click', resetView);
$('#btn-top').addEventListener('click', () => {
  state.room = null;
  for (const [, r] of floors.get(state.floor).rooms) r.plate.material.color.copy(r.plate.userData.baseColor);
  renderDetail(null); buildChips(); resetView();
});
$('#btn-walls').addEventListener('click', () => { state.walls = !state.walls; applyDisplay(); });
$('#btn-furniture').addEventListener('click', () => { state.furniture = !state.furniture; applyDisplay(); });
$('#btn-labels').addEventListener('click', () => {
  state.labels = !state.labels;
  setPressed($('#btn-labels'), state.labels);
  labelLayer.classList.toggle('hidden', !state.labels);
});
$('#time').addEventListener('input', (e) => setHour(Number(e.target.value)));
$('#play').addEventListener('click', () => {
  state.playing = !state.playing;
  $('#play').textContent = state.playing ? '❚❚' : '▶';
  $('#play').setAttribute('aria-label', `${state.playing ? 'Pause' : 'Play'} daylight simulation`);
  setPressed($('#play'), state.playing);
});
document.querySelectorAll('[data-speed]').forEach((b) =>
  b.addEventListener('click', () => {
    state.speed = Number(b.dataset.speed);
    document.querySelectorAll('[data-speed]').forEach((x) => setPressed(x, x === b));
  })
);
document.querySelectorAll('[data-wx]').forEach((b) =>
  b.addEventListener('click', () => {
    state.weather = b.dataset.wx;
    document.querySelectorAll('[data-wx]').forEach((x) => setPressed(x, x === b));
    setHour(state.hour);
  })
);

/* ----------------------------------------------------------------- resize */
function resize() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  renderer.setSize(w, h, false);
  const aspect = w / h;
  camera.left = (-FRUSTUM * aspect) / 2;
  camera.right = (FRUSTUM * aspect) / 2;
  camera.top = FRUSTUM / 2;
  camera.bottom = -FRUSTUM / 2;
  camera.updateProjectionMatrix();
}
let previousWidth = 0;
let previousHeight = 0;
new ResizeObserver(() => {
  if (!canvas.clientWidth || !canvas.clientHeight) return;
  if (previousWidth === canvas.clientWidth && previousHeight === canvas.clientHeight) return;
  previousWidth = canvas.clientWidth;
  previousHeight = canvas.clientHeight;
  resize();
  if (state.room) selectRoom(state.room);
  else resetView();
}).observe($('#viewport'));

/* ------------------------------------------------------------------- loop */
const clock = new THREE.Clock();
function tick() {
  const dt = Math.min(clock.getDelta(), 0.1);

  if (fly.on) {
    fly.t = Math.min(1, fly.t + dt / fly.dur);
    const e = ease(fly.t);
    controls.target.lerpVectors(fly.fromT, fly.toT, e);
    camera.position.lerpVectors(fly.fromP, fly.toP, e);
    camera.zoom = THREE.MathUtils.lerp(fly.fromZ, fly.toZ, e);
    camera.updateProjectionMatrix();
    if (fly.t >= 1) fly.on = false;
  }

  if (state.playing) {
    let h = state.hour + (dt * state.speed) / 60;
    if (h > 23) h = 5;
    setHour(h);
  }

  for (const p of people) {
    if (!p.mesh.visible) continue;
    p.mesh.position.lerp(p.target, 1 - Math.pow(0.001, dt));
    p.mesh.position.y = reducedMotion.matches ? 0.3 : 0.3 + Math.abs(Math.sin(performance.now() / 420)) * 0.08;
  }

  controls.update();
  if (state.tab !== 'notes') {
    renderer.render(scene, camera);
    if (state.labels) updateLabels(labels, camera, canvas.getBoundingClientRect(), FT, state.room);
  }
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ start */
resize();
showFloor('ground');
setHour(state.hour);
flyTo(HOUSE_CENTRE.clone(), 1.05 * viewportScale(), ISO_DIR, true);
setTab('roam');
tick();

window.home = { scene, camera, controls, state, floors, selectRoom, showFloor, setHour, renderer };
