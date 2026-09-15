/**
 * The save state machine.
 *
 * Everything the header says about saving comes from here, and it only ever
 * reports what actually happened. The device save and the account save are
 * tracked separately, because they fail separately: a room can be safely on
 * this device while the account copy is stale, and the person needs to be told
 * which of the two they are looking at.
 *
 * Stages:
 *   'new'     nothing saved anywhere yet
 *   'dirty'   edited since the last save
 *   'saving'  a save is in flight
 *   'saved'   the current document is on this device (and in the account, if
 *             `scope` says 'account')
 *   'failed'  the device save itself could not be written
 */
import { fingerprint } from './project.js';
import { saveDeviceProject, deviceSaveMark, deviceStorageWorks, clearDraft } from './storage.js';
import { saveAccountRoom } from './account.js';

export class Saver extends EventTarget {
  constructor() {
    super();
    this.stage = 'new';
    this.scope = 'none';        // 'none' | 'device' | 'account'
    this.savedAt = null;        // when this device last took a copy
    this.syncedAt = null;       // when the account last took a copy
    this.savedMark = null;      // fingerprint of what was saved
    this.deviceError = null;
    this.accountError = null;   // device save succeeded, account did not
    this.deviceAvailable = deviceStorageWorks();
  }

  get isDirty() {
    return this.stage === 'dirty' || this.stage === 'new';
  }

  emit() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  /** Called after every edit. Compares against what was last written. */
  touch(doc) {
    if (this.stage === 'saving') return;
    const mark = fingerprint(doc);
    if (this.savedMark && mark === this.savedMark) {
      if (this.stage !== 'saved') {
        this.stage = 'saved';
        this.emit();
      }
      return;
    }
    if (this.stage !== 'dirty' && this.savedMark) {
      this.stage = 'dirty';
      this.emit();
    } else if (!this.savedMark && this.stage !== 'new') {
      this.stage = 'new';
      this.emit();
    }
  }

  /** Adopt a document that is known to be already saved (just opened, say). */
  adopt(doc, { scope = 'device', savedAt = Date.now(), syncedAt = null } = {}) {
    this.stage = 'saved';
    this.scope = scope;
    this.savedAt = savedAt;
    this.syncedAt = syncedAt;
    this.savedMark = fingerprint(doc);
    this.deviceError = null;
    this.accountError = null;
    this.emit();
  }

  /** A fresh, never-saved document. */
  reset() {
    this.stage = 'new';
    this.scope = 'none';
    this.savedAt = null;
    this.syncedAt = null;
    this.savedMark = null;
    this.deviceError = null;
    this.accountError = null;
    this.emit();
  }

  /**
   * Saves to this device, then to the account when `toAccount` is set.
   * Resolves with the stage it settled on.
   */
  async save(doc, { toAccount = false } = {}) {
    const mark = fingerprint(doc);
    this.stage = 'saving';
    this.deviceError = null;
    this.accountError = null;
    this.emit();

    doc.updatedAt = Date.now();
    const savedAt = saveDeviceProject(doc);

    if (savedAt === null) {
      this.stage = 'failed';
      this.deviceError = this.deviceAvailable
        ? 'This browser ran out of space for saved rooms.'
        : 'This browser is blocking site storage, so the room cannot be kept here.';
      this.emit();
      return this.stage;
    }

    this.savedAt = savedAt;
    this.savedMark = mark;
    this.scope = 'device';
    clearDraft();

    if (toAccount) {
      try {
        const res = await saveAccountRoom(doc);
        this.syncedAt = res.updatedAt || Date.now();
        this.scope = 'account';
      } catch (err) {
        this.accountError = err.message || 'Could not reach your account.';
      }
    }

    this.stage = 'saved';
    this.emit();
    return this.stage;
  }

  /** Re-reads what the device holds for this project, after a reload. */
  syncFromDevice(doc) {
    const entry = deviceSaveMark(doc.id);
    if (!entry) {
      this.reset();
      return;
    }
    this.savedAt = entry.savedAt;
    this.savedMark = entry.mark;
    this.scope = 'device';
    this.stage = entry.mark === fingerprint(doc) ? 'saved' : 'dirty';
    this.emit();
  }
}

/** "just now", "4 min ago", "yesterday at 21:07" - the detail the header shows. */
export function relativeTime(ts, now = Date.now()) {
  if (!ts) return '';
  const secs = Math.round((now - ts) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs} sec ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const then = new Date(ts);
  const time = then.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (hours < 48) return `yesterday at ${time}`;
  return `${then.toLocaleDateString([], { day: 'numeric', month: 'short' })} at ${time}`;
}
