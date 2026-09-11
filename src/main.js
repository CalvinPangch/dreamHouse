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
  if (instant) {
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
  document.querySelectorAll('[data-floor]').forEach((b) => b.classList.toggle('is-on', b.dataset.floor === id));
}

function applyDisplay() {
  for (const [, f] of floors) {
    f.cutWalls.visible = !state.walls;
    f.fullWalls.visible = state.walls;
    f.glazing.visible = state.walls;
    f.furniture.visible = state.furniture;
  }
  $('#btn-walls').classList.toggle('is-on', state.walls);
  $('#btn-furniture').classList.toggle('is-on', state.furniture);
}

/* --------------------------------------------------------- room selection */
function selectRoom(id) {
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
  flyTo(new THREE.Vector3(room.centre.x * FT, 0, room.centre.z * FT), THREE.MathUtils.clamp(FRUSTUM / (size * 1.9), 0.8, 3.2));
  renderDetail(d);
  buildChips();
}

function renderDetail(d) {
  const el = $('#detail');
  if (!d) {
    el.innerHTML = `
      <h3>整屋 <small>WHOLE HOUSE</small></h3>
      <p class="mood">30' × 48' · 双层半独立式 · 4 房 4 卫</p>
      <button class="go" id="go">选一个房间看看 <span>→</span></button>
      <div class="sep"></div>
      <div class="lede">此刻</div>
      <div class="row"><span class="ico">🛋</span><b>一层</b><span>客厅 · 餐厅 · 西厨 · 书房</span></div>
      <div class="row"><span class="ico">🛏</span><b>二层</b><span>主卧 · 衣帽间 · 儿童房</span></div>`;
    $('#go')?.addEventListener('click', () => {
      const first = floors.get(state.floor).def.rooms[0];
      selectRoom(first.id);
    });
    return;
  }
  el.innerHTML = `
    <h3>${d.name} <small>${d.en.toUpperCase()}</small></h3>
    <p class="mood">${d.mood}</p>
    <button class="go" id="go">走进这个房间 <span>→</span></button>
    <div class="sep"></div>
    <div class="lede">和家，打个招呼</div>
    <div class="row"><span class="ico">✦</span><b>${(d.materials || [])[0] || '设计中'}</b><span>›</span></div>
    <div class="row"><span class="ico">💡</span><b>${d.name}灯</b>
      <button class="switch ${state.roomLight ? 'is-on' : ''}" id="sw-light"></button></div>
    <div class="row"><span class="ico">▦</span><b>完整墙体</b>
      <button class="switch ${state.walls ? 'is-on' : ''}" id="sw-walls"></button></div>`;
  $('#go').addEventListener('click', () => {
    const size = Math.max(d.x2 - d.x1, d.z2 - d.z1) * FT;
    flyTo(
      new THREE.Vector3(((d.x1 + d.x2) / 2) * FT, 0, ((d.z1 + d.z2) / 2) * FT),
      THREE.MathUtils.clamp(FRUSTUM / (size * 1.1), 1.2, 5),
      new THREE.Vector3(1, 0.55, 1).normalize()
    );
  });
  $('#sw-light').addEventListener('click', () => {
    state.roomLight = !state.roomLight;
    $('#sw-light').classList.toggle('is-on', state.roomLight);
    setHour(state.hour);
  });
  $('#sw-walls').addEventListener('click', () => {
    state.walls = !state.walls;
    applyDisplay();
    $('#sw-walls').classList.toggle('is-on', state.walls);
  });
}

function buildChips() {
  const wrap = $('#chips');
  wrap.innerHTML = '';
  for (const r of floors.get(state.floor).def.rooms) {
    const b = document.createElement('button');
    b.textContent = r.name;
    b.className = state.room === r.id ? 'is-on' : '';
    b.addEventListener('click', () => selectRoom(r.id));
    wrap.appendChild(b);
  }
}

/* -------------------------------------------------------------- the notes */
function renderNotes() {
  const wrap = $('#notes');
  wrap.innerHTML = '';
  for (const r of floors.get(state.floor).def.rooms) {
    const card = document.createElement('article');
    card.className = 'note';
    card.innerHTML = `
      <div class="tag" style="background:${r.accent}"></div>
      <h4>${r.name}<small>${r.en.toUpperCase()}</small></h4>
      <div class="mood">${r.mood}</div>
      <p>${r.note}</p>
      <ul>${(r.materials || []).map((m) => `<li>${m}</li>`).join('')}</ul>
      <div class="light">💡 ${r.light || ''}</div>`;
    card.addEventListener('click', () => {
      setTab('roam');
      selectRoom(r.id);
    });
    wrap.appendChild(card);
  }
}

/* ------------------------------------------------------------------ views */
function resetView() {
  flyTo(HOUSE_CENTRE.clone(), 1.05);
}
function topView() {
  flyTo(HOUSE_CENTRE.clone(), 1.15, new THREE.Vector3(0.001, 1, 0.001).normalize());
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('is-on', b.dataset.tab === tab));
  const roam = tab === 'roam';
  const plan = tab === 'plan';
  $('#notes').classList.toggle('hidden', tab !== 'notes');
  labelLayer.classList.toggle('hidden', tab === 'notes');
  $('#detail').classList.toggle('hidden', tab === 'notes');
  $('#dock').classList.toggle('hidden', tab === 'notes');
  $('#hero').classList.toggle('hidden', !roam);
  $('#walkhint').classList.toggle('hidden', !roam);
  if (tab === 'notes') renderNotes();
  if (plan) topView();
  if (roam) resetView();
}

/* -------------------------------------------------------------- day cycle */
const PHASES = [
  [6.5, '天刚亮'], [9, '晨光轻轻'], [11.5, '上午好光'], [14, '午后暖暖'],
  [17, '斜阳半窗'], [19, '黄昏来了'], [21, '灯都亮了'], [24, '夜深了'],
];

function phaseOf(h) {
  for (const [limit, name] of PHASES) if (h < limit) return name;
  return '夜深了';
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

  // the page itself warms and cools with the hour
  const bg = night
    ? 'radial-gradient(120% 80% at 50% 0%, #3c3a44 0%, #2e2c36 55%, #232129 100%)'
    : dusk > 0.35
      ? 'radial-gradient(120% 80% at 50% 0%, #fff1df 0%, #f6e0c9 55%, #e9cdb2 100%)'
      : 'radial-gradient(120% 80% at 50% 0%, #fffaf2 0%, #faf5ed 55%, #f0e7da 100%)';
  document.body.style.background = bg;
  document.body.style.color = night ? '#f4efe6' : '';
  document.documentElement.style.setProperty('--card', night ? 'rgba(58,55,66,.92)' : '#fffdf9');
  document.documentElement.style.setProperty('--ink', night ? '#f6f1e8' : '#4a4038');
  document.documentElement.style.setProperty('--ink-soft', night ? '#ddd4c6' : '#6f6458');
  document.documentElement.style.setProperty('--line', night ? 'rgba(255,255,255,.12)' : '#ece3d4');
  document.documentElement.style.setProperty('--cream-2', night ? 'rgba(255,255,255,.10)' : '#f3ece1');

  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  const clock = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  $('#clock').textContent = clock;
  $('#clock2').textContent = clock;
  $('#phase').textContent = phaseOf(h);
  $('#phase2').textContent = phaseOf(h);
  $('#time').value = String(h);

  placePeople();
}

/* ----------------------------------------------------------------- people */
function placePeople(instant = false) {
  const f = floors.get(state.floor);
  const cast = $('#cast');
  cast.innerHTML = '';
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
    const who = document.createElement('div');
    who.className = 'who';
    who.innerHTML = `<div class="face">${p.def.id === 'he' ? '🧒' : '👧'}</div>
      <div><b>${p.def.name}</b><span>${slot.act}</span></div>`;
    who.addEventListener('click', () => {
      if (slot.floor !== state.floor) showFloor(slot.floor);
      selectRoom(slot.room);
    });
    cast.appendChild(who);
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
$('#btn-top').addEventListener('click', () => { state.room = null; renderDetail(null); buildChips(); resetView(); });
$('#btn-walls').addEventListener('click', () => { state.walls = !state.walls; applyDisplay(); });
$('#btn-furniture').addEventListener('click', () => { state.furniture = !state.furniture; applyDisplay(); });
$('#time').addEventListener('input', (e) => setHour(Number(e.target.value)));
$('#play').addEventListener('click', () => {
  state.playing = !state.playing;
  $('#play').textContent = state.playing ? '❚❚' : '▶';
});
document.querySelectorAll('[data-speed]').forEach((b) =>
  b.addEventListener('click', () => {
    state.speed = Number(b.dataset.speed);
    document.querySelectorAll('[data-speed]').forEach((x) => x.classList.toggle('is-on', x === b));
  })
);
document.querySelectorAll('[data-wx]').forEach((b) =>
  b.addEventListener('click', () => {
    state.weather = b.dataset.wx;
    document.querySelectorAll('[data-wx]').forEach((x) => x.classList.toggle('is-on', x === b));
    $('#wx-now').textContent = b.textContent;
    setHour(state.hour);
  })
);

/* ----------------------------------------------------------------- resize */
function resize() {
  const rect = canvas.getBoundingClientRect();
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
window.addEventListener('resize', resize);

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
    p.mesh.position.y = 0.3 + Math.abs(Math.sin(performance.now() / 420)) * 0.08;
  }

  controls.update();
  renderer.render(scene, camera);
  const rect = canvas.getBoundingClientRect();
  if (state.tab !== 'notes') updateLabels(labels, camera, rect, FT, state.room);
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ start */
resize();
showFloor('ground');
setHour(state.hour);
flyTo(HOUSE_CENTRE.clone(), 1.05, ISO_DIR, true);
setTab('roam');
tick();

window.home = { scene, camera, controls, state, floors, selectRoom, showFloor, setHour, renderer };
