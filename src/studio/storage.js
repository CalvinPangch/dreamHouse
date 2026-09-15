/**
 * Where a project lives on this device.
 *
 * Two separate things are kept in localStorage, and the difference is the whole
 * point of the save indicator:
 *
 *   saved projects  - what the person pressed Save on. Durable, listed in the
 *                     Project menu, and what "Saved on this device" refers to.
 *   the open draft  - a crash-safe copy of the editor as it stands right now,
 *                     written continuously. It is never presented as a save; on
 *                     reload it is offered back as "unsaved changes".
 */
import { normalise, fingerprint } from './project.js';

const PROJECTS_KEY = 'studio.projects.v1';
const DRAFT_KEY = 'studio.draft.v1';
const LAST_KEY = 'studio.lastOpened.v1';

/** localStorage throws in private mode and when the quota is gone. */
function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function drop(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing to do - the value is already unreachable */
  }
}

/** True when this browser will actually keep what we write. */
export function deviceStorageWorks() {
  try {
    const probe = '__studio_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------- saved projects */

function allProjects() {
  const map = read(PROJECTS_KEY);
  return map && typeof map === 'object' && !Array.isArray(map) ? map : {};
}

export function listDeviceProjects() {
  return Object.values(allProjects())
    .map((entry) => ({
      id: entry.doc?.id,
      name: entry.doc?.name || 'Untitled room',
      savedAt: entry.savedAt || 0,
      items: entry.doc?.items?.length || 0,
      room: entry.doc?.room || { w: 0, d: 0 },
    }))
    .filter((p) => p.id)
    .sort((a, b) => b.savedAt - a.savedAt);
}

export function loadDeviceProject(id) {
  const entry = allProjects()[id];
  return entry?.doc ? normalise(entry.doc) : null;
}

/** Returns the save timestamp, or null if this browser refused to store it. */
export function saveDeviceProject(doc) {
  const map = allProjects();
  const savedAt = Date.now();
  map[doc.id] = { doc, savedAt, mark: fingerprint(doc) };
  if (!write(PROJECTS_KEY, map)) return null;
  write(LAST_KEY, doc.id);
  return savedAt;
}

export function deleteDeviceProject(id) {
  const map = allProjects();
  delete map[id];
  write(PROJECTS_KEY, map);
  if (read(LAST_KEY) === id) drop(LAST_KEY);
}

/** The fingerprint of the last save, so the editor knows whether it has drifted. */
export function deviceSaveMark(id) {
  const entry = allProjects()[id];
  return entry ? { mark: entry.mark, savedAt: entry.savedAt } : null;
}

export const lastOpenedId = () => read(LAST_KEY);
export const rememberOpened = (id) => write(LAST_KEY, id);

/* ----------------------------------------------------------- open draft */

export function writeDraft(doc) {
  write(DRAFT_KEY, { doc, at: Date.now() });
}

export function readDraft() {
  const entry = read(DRAFT_KEY);
  return entry?.doc ? { doc: normalise(entry.doc), at: entry.at || 0 } : null;
}

export const clearDraft = () => drop(DRAFT_KEY);
