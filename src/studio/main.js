/**
 * Architecture Studio - arrange a room, save it, and pick it back up later.
 *
 * Saving has two independent destinations and the interface never blurs them:
 * this device always gets a copy, and a ChatGPT account gets one too if you
 * have signed in. Both states are reported honestly, including when the second
 * one fails.
 */
import { CATALOG_BY_ID } from './catalog.js';
import {
  newProject, normalise, placeItem, confine, clamp, clone, History, ROOM_SIZES,
} from './project.js';
import {
  listDeviceProjects, loadDeviceProject, deleteDeviceProject, lastOpenedId,
  rememberOpened, writeDraft, readDraft, clearDraft,
} from './storage.js';
import { Saver } from './saver.js';
import * as account from './account.js';
import { Plan2D } from './plan2d.js';
import { View3D } from './view3d.js';
import { renderThumbnails } from './thumbs.js';
import * as ui from './ui.js';

const $ = (id) => document.getElementById(id);
const MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const state = {
  doc: newProject(),
  history: null,
  saver: new Saver(),
  account: { configured: false, signedIn: false, user: null },
  accountRooms: [],
  loadingAccountRooms: false,
  category: 'all',
  thumbs: new Map(),
  selected: null,
  plan: null,
  view3d: null,
};

/* ------------------------------------------------------------------ boot */

async function boot() {
  state.thumbs = renderThumbnails();

  $('categories').innerHTML = ui.categoryButtons(state.category);
  $('room-size').innerHTML = ROOM_SIZES.map(
    (s) => `<option value="${s.w}x${s.d}">${s.name}</option>`
  ).join('');
  if (MAC === false) $('dup-key').textContent = 'Ctrl+D';

  await openInitialProject();

  state.plan = new Plan2D($('plan'), state.doc);
  state.view3d = new View3D($('scene'), state.doc);
  wirePlan();
  wireView3D();
  wireChrome();
  wireKeyboard();

  renderCatalogue();
  renderAll();

  window.addEventListener('resize', onResize);
  onResize();

  // a saved room reopens in the view it was saved in
  applyViewFromDoc();

  // keep relative times ("4 min ago") honest without a re-render storm
  setInterval(renderSaveState, 30000);

  state.saver.addEventListener('change', () => {
    renderSaveState();
    if (!$('save-pop').classList.contains('is-hidden')) renderSavePopover();
  });

  account.fetchSession().then((session) => {
    state.account = session;
    renderSaveState();
    if (session.signedIn) refreshAccountRooms();
    handleReturnFromSignIn();
  });

  window.addEventListener('beforeunload', (ev) => {
    if (!state.saver.isDirty) return;
    ev.preventDefault();
    ev.returnValue = '';
  });
}

/**
 * Decides which room opens: an account room named in the URL, an unsaved draft
 * from last time, the last room saved here, or a blank one.
 */
async function openInitialProject() {
  const params = new URLSearchParams(window.location.search);
  const wanted = params.get('room');

  if (wanted) {
    try {
      const res = await account.fetchAccountRoom(wanted);
      adopt(normalise(res.doc), { scope: 'account', savedAt: res.updatedAt, syncedAt: res.updatedAt });
      return;
    } catch {
      toast('That room could not be opened from your account.', 'warn');
    }
  }

  const draft = readDraft();
  const lastId = lastOpenedId();

  if (draft) {
    const saved = lastId ? loadDeviceProject(draft.doc.id) : null;
    adopt(draft.doc, { scope: 'none' });
    state.saver.syncFromDevice(draft.doc);
    if (state.saver.isDirty) {
      toast(saved
        ? 'Reopened with the changes you had not saved.'
        : 'Reopened an unsaved room from last time.', 'info');
    }
    return;
  }

  const last = lastId ? loadDeviceProject(lastId) : null;
  if (last) {
    adopt(last, { scope: 'none' });
    state.saver.syncFromDevice(last);
    return;
  }

  adopt(newProject(), { scope: 'none' });
  state.saver.reset();
}

/** Swaps in a document and resets everything derived from it. */
function adopt(doc, { scope, savedAt, syncedAt } = {}) {
  state.doc = doc;
  state.history = new History(doc);
  state.selected = null;
  if (scope && scope !== 'none') {
    state.saver.adopt(doc, { scope, savedAt: savedAt || Date.now(), syncedAt });
  }
  if (state.plan) state.plan.setDoc(doc);
  if (state.view3d) state.view3d.setDoc(doc);
  rememberOpened(doc.id);
}

/* ---------------------------------------------------------------- edits */

/** Every document mutation goes through here, so history and save state stay true. */
function edit(mutate) {
  mutate(state.doc);
  state.history.commit(state.doc);
  afterChange();
}

/** A change already applied (a finished drag) - commit and refresh. */
function commit() {
  state.history.commit(state.doc);
  afterChange();
}

function afterChange() {
  state.saver.touch(state.doc);
  writeDraft(state.doc);
  renderAll();
}

/** A view-only change: recorded and saveable, but it does not enter undo. */
function viewChanged() {
  state.saver.touch(state.doc);
  writeDraft(state.doc);
  renderSaveState();
}

function undo() {
  const doc = state.history.undo();
  if (!doc) return;
  swapDoc(doc);
}

function redo() {
  const doc = state.history.redo();
  if (!doc) return;
  swapDoc(doc);
}

function swapDoc(doc) {
  state.doc = doc;
  if (!doc.items.some((it) => it.uid === state.selected)) state.selected = null;
  state.plan.setDoc(doc);
  state.view3d.setDoc(doc);
  afterChange();
}

const selectedItem = () => state.doc.items.find((it) => it.uid === state.selected) || null;

/* ------------------------------------------------------------- plan wiring */

function wirePlan() {
  const plan = state.plan;
  plan.addEventListener('select', (ev) => {
    state.selected = ev.detail;
    renderInspector();
  });
  plan.addEventListener('editing', () => renderInspector());
  plan.addEventListener('editend', () => commit());
  plan.addEventListener('viewchange', () => viewChanged());
  plan.addEventListener('place', (ev) => {
    const { catalogId, x, z } = ev.detail;
    const piece = CATALOG_BY_ID.get(catalogId);
    const item = placeItem(state.doc, catalogId);
    if (!item) return;
    item.x = clamp(x, piece.w / 2, state.doc.room.w - piece.w / 2);
    item.z = clamp(z, piece.d / 2, state.doc.room.d - piece.d / 2);
    edit((doc) => doc.items.push(item));
    state.selected = item.uid;
    plan.select(item.uid);
    renderInspector();
  });
  plan.addEventListener('armchange', () => renderCatalogue());
}

function wireView3D() {
  state.view3d.addEventListener('viewchange', () => viewChanged());
}

/* --------------------------------------------------------------- chrome */

function wireChrome() {
  $('project-name').addEventListener('input', (ev) => {
    state.doc.name = ev.target.value.slice(0, 80) || 'Untitled room';
    state.saver.touch(state.doc);
    writeDraft(state.doc);
    renderSaveState();
  });
  $('project-name').addEventListener('change', () => commit());

  $('categories').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-cat]');
    if (!btn) return;
    state.category = btn.dataset.cat;
    $('categories').innerHTML = ui.categoryButtons(state.category);
    renderCatalogue();
  });

  $('catalogue').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-add]');
    if (!btn) return;
    const id = btn.dataset.add;
    if (state.doc.view.mode === '3d') setMode('2d');
    state.plan.arm(state.plan.placing === id ? null : id);
  });

  $('room-size').addEventListener('change', (ev) => {
    const [w, d] = ev.target.value.split('x').map(Number);
    edit((doc) => {
      doc.room.w = w;
      doc.room.d = d;
      for (const item of doc.items) confine(item, doc.room);
    });
    state.view3d.rebuild();
  });

  $('tab-2d').addEventListener('click', () => setMode('2d'));
  $('tab-3d').addEventListener('click', () => setMode('3d'));
  $('back-to-2d').addEventListener('click', () => setMode('2d'));

  $('toggle-grid').addEventListener('click', () => {
    state.doc.view.grid = !state.doc.view.grid;
    state.plan.draw();
    viewChanged();
    renderViewTools();
  });
  $('toggle-dims').addEventListener('click', () => {
    state.doc.view.dims = !state.doc.view.dims;
    state.plan.draw();
    viewChanged();
    renderViewTools();
  });

  $('reset-view').addEventListener('click', () => {
    if (state.doc.view.mode === '3d') state.view3d.resetCamera();
    else state.plan.resetView();
  });

  $('undo').addEventListener('click', undo);
  $('redo').addEventListener('click', redo);
  $('save').addEventListener('click', () => saveNow());

  $('save-state').addEventListener('click', () => togglePop('save-pop', 'save-state'));
  $('project-menu-btn').addEventListener('click', () => togglePop('project-pop', 'project-menu-btn'));

  $('save-pop').addEventListener('click', onPopAction);
  $('project-pop').addEventListener('click', onPopAction);

  $('inspector').addEventListener('click', onInspectorClick);

  document.addEventListener('pointerdown', (ev) => {
    for (const [pop, btn] of [['save-pop', 'save-state'], ['project-pop', 'project-menu-btn']]) {
      if ($(pop).classList.contains('is-hidden')) continue;
      if (!$(pop).contains(ev.target) && !$(btn).contains(ev.target)) closePop(pop, btn);
    }
  });
}

function wireKeyboard() {
  document.addEventListener('keydown', (ev) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName);
    const meta = ev.metaKey || ev.ctrlKey;

    if (meta && ev.key.toLowerCase() === 's') {
      ev.preventDefault();
      saveNow();
      return;
    }
    if (meta && ev.key.toLowerCase() === 'z') {
      ev.preventDefault();
      ev.shiftKey ? redo() : undo();
      return;
    }
    if (ev.key === 'Escape') {
      state.plan.arm(null);
      closePop('save-pop', 'save-state');
      closePop('project-pop', 'project-menu-btn');
      return;
    }
    if (typing) return;

    if (meta && ev.key.toLowerCase() === 'd') {
      ev.preventDefault();
      duplicateSelected();
      return;
    }
    if (ev.key.toLowerCase() === 'v') {
      setMode(state.doc.view.mode === '2d' ? '3d' : '2d');
      return;
    }
    if (ev.key.toLowerCase() === 'r') {
      rotateSelected(ev.shiftKey ? 90 : 15);
      return;
    }
    if (ev.key === 'Backspace' || ev.key === 'Delete') {
      ev.preventDefault();
      removeSelected();
    }
  });
}

function onInspectorClick(ev) {
  const finish = ev.target.closest('[data-finish]');
  if (finish) {
    const item = selectedItem();
    if (!item) return;
    edit(() => { item.finish = finish.dataset.finish; });
    if (state.doc.view.mode === '3d') state.view3d.rebuild();
    return;
  }
  if (ev.target.closest('#rotate-reset')) return rotateSelected(null);
  if (ev.target.closest('#duplicate-item')) return duplicateSelected();
  if (ev.target.closest('#remove-item')) return removeSelected();
  if (ev.target.closest('#deselect')) {
    state.selected = null;
    state.plan.select(null);
    renderInspector();
  }
}

function rotateSelected(by) {
  const item = selectedItem();
  if (!item) return;
  edit(() => {
    item.rot = by === null ? 0 : (((item.rot + by) % 360) + 360) % 360;
    confine(item, state.doc.room);
  });
  if (state.doc.view.mode === '3d') state.view3d.rebuild();
}

function duplicateSelected() {
  const item = selectedItem();
  if (!item) return;
  const copy = placeItem(state.doc, item.catalogId);
  Object.assign(copy, { finish: item.finish, rot: item.rot, x: item.x + 0.3, z: item.z + 0.3 });
  confine(copy, state.doc.room);
  edit((doc) => doc.items.push(copy));
  state.selected = copy.uid;
  state.plan.select(copy.uid);
  if (state.doc.view.mode === '3d') state.view3d.rebuild();
  renderInspector();
}

function removeSelected() {
  const item = selectedItem();
  if (!item) return;
  edit((doc) => { doc.items = doc.items.filter((it) => it.uid !== item.uid); });
  state.selected = null;
  state.plan.select(null);
  if (state.doc.view.mode === '3d') state.view3d.rebuild();
  renderInspector();
}

function setMode(mode, { quiet = false, force = false } = {}) {
  if (state.doc.view.mode === mode && !force) return;
  state.doc.view.mode = mode;
  state.plan.arm(null);

  const is3d = mode === '3d';
  $('plan').classList.toggle('is-hidden', is3d);
  $('scene').classList.toggle('is-hidden', !is3d);
  $('tab-2d').classList.toggle('is-on', !is3d);
  $('tab-3d').classList.toggle('is-on', is3d);
  $('tab-2d').setAttribute('aria-pressed', String(!is3d));
  $('tab-3d').setAttribute('aria-pressed', String(is3d));
  $('back-to-2d').classList.toggle('is-hidden', !is3d);
  $('view-tools').classList.toggle('is-hidden', is3d);
  $('view-caption').textContent = is3d ? 'Room perspective' : 'Plan · 1:50';
  $('view-hint').textContent = is3d ? 'Drag to orbit · Scroll to zoom' : 'Drag furniture · Scroll to zoom';
  $('hint-main').textContent = is3d
    ? 'Looking around only — return to the 2D plan to move furniture.'
    : 'Drag furniture to rearrange your room.';
  $('reset-label').textContent = is3d ? 'Reset camera' : 'Reset view';

  if (is3d) {
    state.view3d.rebuild();
    state.view3d.start();
    state.view3d.resize();
  } else {
    state.view3d.stop();
    state.plan.resize();
  }
  if (!quiet) viewChanged();
  renderInspector();
}

function onResize() {
  state.plan.resize();
  if (state.doc.view.mode === '3d') state.view3d.resize();
}

/* ---------------------------------------------------------------- saving */

async function saveNow() {
  if (state.saver.stage === 'saving') return;
  const toAccount = state.account.configured && state.account.signedIn;
  await state.saver.save(state.doc, { toAccount });

  if (state.saver.stage === 'failed') {
    toast(state.saver.deviceError, 'error');
  } else if (state.saver.accountError) {
    toast(`Saved on this device. Your account copy failed: ${state.saver.accountError}`, 'warn');
  } else if (state.saver.scope === 'account') {
    toast('Saved to your account and this device.', 'ok');
  } else {
    toast('Saved on this device.', 'ok');
  }

  rememberOpened(state.doc.id);
  if (toAccount) refreshAccountRooms();
  renderAll();
}

async function refreshAccountRooms() {
  state.loadingAccountRooms = true;
  try {
    const res = await account.listAccountRooms();
    state.accountRooms = res.rooms || [];
  } catch {
    state.accountRooms = [];
  } finally {
    state.loadingAccountRooms = false;
    if (!$('project-pop').classList.contains('is-hidden')) renderProjectMenu();
  }
}

/** After the OAuth round trip, offer to put the room they were working on into the account. */
function handleReturnFromSignIn() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('auth');
  if (!status) return;

  params.delete('auth');
  params.delete('reason');
  const rest = params.toString();
  window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));

  if (status === 'ok') {
    toast(`Signed in as ${state.account.user?.name || state.account.user?.email || 'your ChatGPT account'}. Save to keep this room in your account.`, 'ok');
  } else {
    const reason = new URLSearchParams(window.location.search).get('reason');
    toast(`Sign in did not complete${reason ? `: ${reason}` : '.'} Your room is untouched.`, 'warn');
  }
}

/* ------------------------------------------------------------- popovers */

function togglePop(pop, btn) {
  const hidden = $(pop).classList.contains('is-hidden');
  closePop('save-pop', 'save-state');
  closePop('project-pop', 'project-menu-btn');
  if (!hidden) return;

  if (pop === 'save-pop') renderSavePopover();
  else {
    renderProjectMenu();
    if (state.account.signedIn) refreshAccountRooms();
  }
  $(pop).classList.remove('is-hidden');
  $(btn).setAttribute('aria-expanded', 'true');
}

function closePop(pop, btn) {
  $(pop).classList.add('is-hidden');
  $(btn).setAttribute('aria-expanded', 'false');
}

async function onPopAction(ev) {
  const act = ev.target.closest('[data-act]')?.dataset.act;
  const open = ev.target.closest('[data-open]');

  if (open) {
    await openRoom(open.dataset.open, open.dataset.source);
    closePop('project-pop', 'project-menu-btn');
    return;
  }
  if (!act) return;

  if (act === 'signin') {
    if (state.saver.isDirty) writeDraft(state.doc);
    account.startSignIn(window.location.pathname);
    return;
  }
  if (act === 'signout') {
    try {
      await account.signOut();
    } catch { /* the cookie is cleared server-side or already gone */ }
    state.account = { ...state.account, signedIn: false, user: null };
    state.accountRooms = [];
    if (state.saver.scope === 'account') state.saver.scope = 'device';
    toast('Signed out. This room is still saved on this device.', 'info');
    renderAll();
    renderSavePopover();
    renderProjectMenu();
    return;
  }
  if (act === 'new') {
    if (!confirmDiscard()) return;
    adopt(newProject(), { scope: 'none' });
    state.saver.reset();
    clearDraft();
    applyViewFromDoc();
    state.plan.resetView();
    renderAll();
    closePop('project-pop', 'project-menu-btn');
    return;
  }
  if (act === 'duplicate') {
    const copy = normalise({ ...clone(state.doc), id: undefined, name: `${state.doc.name} copy` });
    adopt(copy, { scope: 'none' });
    state.saver.reset();
    applyViewFromDoc();
    renderAll();
    closePop('project-pop', 'project-menu-btn');
    toast('Duplicated. Save it to keep the copy.', 'info');
    return;
  }
  if (act === 'delete') {
    if (!window.confirm(`Delete "${state.doc.name}"? This removes it from this device${state.account.signedIn ? ' and from your account' : ''}.`)) return;
    deleteDeviceProject(state.doc.id);
    if (state.account.signedIn) {
      try { await account.deleteAccountRoom(state.doc.id); } catch { /* may never have reached the account */ }
      refreshAccountRooms();
    }
    clearDraft();
    adopt(newProject(), { scope: 'none' });
    state.saver.reset();
    renderAll();
    closePop('project-pop', 'project-menu-btn');
    toast('Room deleted.', 'info');
  }
}

async function openRoom(id, source) {
  if (!confirmDiscard()) return;
  try {
    if (source === 'account') {
      const res = await account.fetchAccountRoom(id);
      const doc = normalise(res.doc);
      adopt(doc, { scope: 'account', savedAt: res.updatedAt, syncedAt: res.updatedAt });
    } else {
      const doc = loadDeviceProject(id);
      if (!doc) throw new Error('That room is no longer on this device.');
      adopt(doc, { scope: 'none' });
      state.saver.syncFromDevice(doc);
    }
    clearDraft();
    applyViewFromDoc();
    renderAll();
  } catch (err) {
    toast(err.message || 'That room could not be opened.', 'error');
  }
}

/** Restores the saved view settings - the mode, and the camera or pan/zoom with it. */
function applyViewFromDoc() {
  setMode(state.doc.view.mode, { quiet: true, force: true });
  state.plan.resize();
}

/**
 * Only ask when there is something to lose. A blank, untouched room is not
 * work in progress, so leaving it behind needs no ceremony.
 */
function confirmDiscard() {
  if (!state.saver.isDirty) return true;
  const untouched =
    state.saver.stage === 'new' && !state.doc.items.length && state.doc.name === 'Untitled room';
  if (untouched) return true;
  return window.confirm('This room has unsaved changes. Leave them behind?');
}

/* -------------------------------------------------------------- render */

function renderAll() {
  $('project-name').value = state.doc.name;
  const { w, d } = state.doc.room;
  $('room-size').value = `${w}x${d}`;
  $('room-area').textContent = `${(w * d).toFixed(1)} m²`;
  $('catalogue-count').textContent = `${state.doc.items.length} ${state.doc.items.length === 1 ? 'piece' : 'pieces'}`;
  $('plan-empty').classList.toggle('is-hidden', state.doc.items.length > 0 || state.doc.view.mode === '3d');
  $('plan-empty').querySelector('p').textContent = `An empty room, ${w} × ${d} m.`;
  $('undo').disabled = !state.history.canUndo;
  $('redo').disabled = !state.history.canRedo;
  renderViewTools();
  renderSaveState();
  renderInspector();
  state.plan.draw();
}

function renderCatalogue() {
  $('catalogue').innerHTML = ui.catalogueCards(state.category, state.thumbs);
  const armed = state.plan?.placing;
  for (const btn of $('catalogue').querySelectorAll('[data-add]')) {
    btn.closest('.st-card').classList.toggle('is-armed', btn.dataset.add === armed);
  }
  $('hint-main').textContent = armed
    ? `Click the plan to place the ${CATALOG_BY_ID.get(armed).name.toLowerCase()}. Esc to cancel.`
    : state.doc.view.mode === '3d'
      ? 'Looking around only — return to the 2D plan to move furniture.'
      : 'Drag furniture to rearrange your room.';
}

function renderViewTools() {
  for (const [id, on] of [['toggle-grid', state.doc.view.grid], ['toggle-dims', state.doc.view.dims]]) {
    $(id).classList.toggle('is-on', on);
    $(id).setAttribute('aria-pressed', String(on));
  }
}

function renderSaveState() {
  const info = ui.describeSave(state.saver, state.account);
  const chip = $('save-state');
  chip.dataset.tone = info.tone;
  $('save-state-text').textContent = info.label;
  chip.title = info.detail ? `${info.label} — ${info.detail}` : info.label;

  let detail = chip.querySelector('.st-savedetail');
  if (!detail) {
    detail = document.createElement('span');
    detail.className = 'st-savedetail';
    chip.append(detail);
  }
  detail.textContent = info.detail;

  const saving = state.saver.stage === 'saving';
  const retry = Boolean(state.saver.accountError) || state.saver.stage === 'failed';
  $('save').disabled = saving;
  $('save-label').textContent = saving ? 'Saving…' : retry ? 'Try again' : state.saver.isDirty ? 'Save' : 'Saved';
  $('save').classList.toggle('is-quiet', !state.saver.isDirty && !saving && !retry);
}

function renderSavePopover() {
  $('save-pop').innerHTML = ui.savePopover(state.saver, state.account, state.doc);
}

function renderProjectMenu() {
  $('project-pop').innerHTML = ui.projectMenu({
    deviceRooms: listDeviceProjects(),
    accountRooms: state.accountRooms,
    account: state.account,
    currentId: state.doc.id,
    loadingAccount: state.loadingAccountRooms,
  });
}

function renderInspector() {
  $('inspector').innerHTML = ui.inspector(selectedItem(), {
    mode: state.doc.view.mode,
    thumbs: state.thumbs,
  });
}

/* --------------------------------------------------------------- toasts */

function toast(message, tone = 'info') {
  const el = document.createElement('div');
  el.className = `st-toast is-${tone}`;
  el.textContent = message;
  $('toasts').append(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => {
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 400);
  }, tone === 'ok' || tone === 'info' ? 3800 : 6500);
}

boot();
