/** Markup for the studio's panels. Pure functions - main.js owns the state. */
import { CATALOG, CATEGORIES, FINISH_BY_ID, cmLabel, CATALOG_BY_ID } from './catalog.js';
import { relativeTime } from './saver.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ----------------------------------------------------------- catalogue */

export function categoryButtons(active) {
  return CATEGORIES.map(
    (c) =>
      `<button data-cat="${c.id}" class="${c.id === active ? 'is-on' : ''}" aria-pressed="${c.id === active}">${esc(c.name)}</button>`
  ).join('');
}

export function catalogueCards(category, thumbs) {
  const list = category === 'all' ? CATALOG : CATALOG.filter((p) => p.category === category);
  return list
    .map((p) => {
      const thumb = thumbs.get(p.id);
      const art = thumb
        ? `<img src="${thumb}" alt="" loading="lazy" />`
        : `<span class="st-card-fallback" style="background:${FINISH_BY_ID.get(p.finish).color}"></span>`;
      return `<div class="st-card" role="listitem">
        <button class="st-card-art" data-add="${p.id}" aria-label="Add ${esc(p.name)} to the room">
          ${art}<span class="st-card-plus" aria-hidden="true">+</span>
        </button>
        <span class="st-card-name">${esc(p.name)}</span>
        <span class="st-card-dims">${cmLabel(p)}</span>
      </div>`;
    })
    .join('');
}

/* ----------------------------------------------------------- inspector */

export function inspector(item, { mode, thumbs }) {
  if (!item) {
    return `<div class="st-inspector-empty">
      <h2>Nothing selected</h2>
      <p>${mode === '3d'
        ? 'This is a camera view. Return to the 2D plan to select and arrange furniture.'
        : 'Click a piece on the plan to change its finish, rotation and position.'}</p>
    </div>`;
  }

  const piece = CATALOG_BY_ID.get(item.catalogId);
  const thumb = thumbs.get(piece.id);
  const swatches = piece.finishes
    .map((id) => {
      const f = FINISH_BY_ID.get(id);
      const on = id === item.finish;
      return `<button class="st-swatch ${on ? 'is-on' : ''}" data-finish="${id}" style="--swatch:${f.color}"
        title="${esc(f.name)}" aria-label="${esc(f.name)}" aria-pressed="${on}"></button>`;
    })
    .join('');

  return `<div class="st-inspector-head">
      <h2>Selected item</h2>
      <button id="deselect" class="st-icon" aria-label="Clear selection"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    </div>
    <div class="st-preview">${thumb ? `<img src="${thumb}" alt="${esc(piece.name)}" />` : ''}</div>
    <h3 class="st-piece-name">${esc(piece.name)}</h3>
    <p class="st-piece-collection">Oak &amp; linen collection</p>

    <dl class="st-dims">
      <div><dt>Width</dt><dd>${piece.w.toFixed(2)} m</dd></div>
      <div><dt>Depth</dt><dd>${piece.d.toFixed(2)} m</dd></div>
      <div><dt>Height</dt><dd>${piece.h.toFixed(2)} m</dd></div>
    </dl>

    <div class="st-field">
      <span>Position</span>
      <output>${item.x.toFixed(2)}, ${item.z.toFixed(2)} m</output>
    </div>
    <div class="st-field">
      <span>Rotation</span>
      <output>${Math.round(item.rot)}°</output>
      <button id="rotate-reset" class="st-icon st-icon-sm" aria-label="Reset rotation to 0 degrees" ${item.rot === 0 ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></svg>
      </button>
    </div>

    <div class="st-finishes">
      <span class="st-field-label">Finish</span>
      <div class="st-swatches">${swatches}</div>
    </div>

    ${mode === '3d'
      ? `<p class="st-inspector-note">Camera controls only.<br>Return to 2D to arrange furniture.</p>`
      : `<div class="st-piece-actions">
           <button id="duplicate-item" class="st-ghost">Duplicate</button>
           <button id="remove-item" class="st-ghost st-danger">Remove</button>
         </div>`}`;
}

/* ------------------------------------------------------- the save state */

/**
 * The single source of truth for what the header says about saving.
 * `device` and `account` are described separately and never conflated.
 */
export function describeSave(saver, account, now = Date.now()) {
  const when = relativeTime(saver.savedAt, now);

  if (saver.stage === 'saving') return { tone: 'busy', label: 'Saving…', detail: '' };

  if (saver.stage === 'failed') {
    return { tone: 'error', label: 'Not saved', detail: saver.deviceError || 'The save did not go through.' };
  }

  if (saver.stage === 'new') {
    return {
      tone: 'new',
      label: 'Not saved yet',
      detail: 'This room only exists in this tab.',
    };
  }

  if (saver.stage === 'dirty') {
    return {
      tone: 'dirty',
      label: 'Unsaved changes',
      detail: saver.savedAt ? `Last saved on this device ${when}` : '',
    };
  }

  // saved
  if (saver.accountError) {
    return {
      tone: 'warn',
      label: 'Saved on this device',
      detail: 'Your account copy is out of date.',
    };
  }
  if (saver.scope === 'account') {
    return {
      tone: 'account',
      label: 'Saved to your account',
      detail: `On this device too · ${when}`,
    };
  }
  return {
    tone: 'saved',
    label: 'Saved on this device',
    detail: account.signedIn ? `${when} · not yet in your account` : when,
  };
}

/** The popover behind the save chip: exactly where the room lives, and where it does not. */
export function savePopover(saver, account, doc, now = Date.now()) {
  const deviceSaved = saver.savedAt && saver.stage !== 'new' && saver.stage !== 'failed';
  const dirty = saver.isDirty;

  const deviceRow = deviceSaved
    ? row('ok', 'This device', `Saved ${relativeTime(saver.savedAt, now)}${dirty ? ' — with changes since' : ''}`,
        'Kept in this browser only. Clearing site data, or opening the studio somewhere else, will not find it.')
    : row('off', 'This device', saver.deviceError ? saver.deviceError : 'Not saved yet',
        saver.deviceAvailable
          ? 'Press Save to keep this room in this browser.'
          : 'This browser is blocking site storage, so nothing can be kept here.');

  let accountRow;
  if (!account.configured) {
    accountRow = row('off', 'Your account', 'Not available on this deployment',
      'Account saving needs OpenAI credentials and a store configured on the server.');
  } else if (!account.signedIn) {
    accountRow = row('off', 'Your account', 'Not signed in',
      'Sign in with ChatGPT to keep your rooms and reopen them on any device.');
  } else if (saver.accountError) {
    accountRow = row('bad', 'Your account', 'Last sync failed', esc(saver.accountError));
  } else if (saver.syncedAt && saver.scope === 'account' && !dirty) {
    accountRow = row('ok', 'Your account', `Saved ${relativeTime(saver.syncedAt, now)}`,
      `Signed in as ${esc(account.user?.name || account.user?.email || 'your ChatGPT account')}.`);
  } else {
    accountRow = row('warn', 'Your account', saver.syncedAt ? `Out of date — last sent ${relativeTime(saver.syncedAt, now)}` : 'Nothing sent yet',
      'The next save will send this room to your account.');
  }

  const cta = !account.configured
    ? ''
    : account.signedIn
      ? `<button class="st-ghost" data-act="signout">Sign out of ${esc(account.user?.email || 'ChatGPT')}</button>`
      : `<button class="st-chatgpt" data-act="signin">${chatgptMark()} Sign in with ChatGPT</button>
         <p class="st-pop-fineprint">Optional. Everything works without it — signing in adds a copy you can reopen anywhere.</p>`;

  return `<h3 class="st-pop-title">${esc(doc.name)}</h3>
    <div class="st-where">${deviceRow}${accountRow}</div>
    <div class="st-pop-cta">${cta}</div>`;
}

function row(state, title, status, note) {
  const icons = {
    ok: '<path d="m5 13 4 4 10-10"/>',
    warn: '<path d="M12 8v5m0 3h.01"/><circle cx="12" cy="12" r="9"/>',
    bad: '<path d="m8 8 8 8M16 8l-8 8"/><circle cx="12" cy="12" r="9"/>',
    off: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  };
  return `<div class="st-where-row is-${state}">
    <svg class="st-where-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[state]}</svg>
    <div>
      <b>${esc(title)}</b>
      <span class="st-where-status">${status}</span>
      <span class="st-where-note">${note}</span>
    </div>
  </div>`;
}

export const chatgptMark = () =>
  `<svg class="st-oai" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2a4 4 0 0 1 3.6 2.2 4 4 0 0 1 3.1 6 4 4 0 0 1-3.1 6 4 4 0 0 1-7.2 0 4 4 0 0 1-3.1-6 4 4 0 0 1 3.1-6A4 4 0 0 1 12 3.2Z"/><path d="M12 8.1v7.8M8.6 10v4M15.4 10v4"/></svg>`;

/* -------------------------------------------------------- project menu */

export function projectMenu({ deviceRooms, accountRooms, account, currentId, loadingAccount }) {
  const item = (room, source) =>
    `<button class="st-menu-room ${room.id === currentId ? 'is-current' : ''}" data-open="${esc(room.id)}" data-source="${source}" role="menuitem">
      <span class="st-menu-room-name">${esc(room.name)}</span>
      <span class="st-menu-room-meta">${room.items} ${room.items === 1 ? 'piece' : 'pieces'} · ${relativeTime(room.savedAt)}</span>
    </button>`;

  const deviceList = deviceRooms.length
    ? deviceRooms.map((r) => item(r, 'device')).join('')
    : '<p class="st-menu-empty">Nothing saved in this browser yet.</p>';

  let accountList;
  if (!account.configured) accountList = '';
  else if (!account.signedIn) {
    accountList = `<div class="st-menu-section">
      <h4>Your account</h4>
      <button class="st-chatgpt st-chatgpt-sm" data-act="signin">${chatgptMark()} Sign in with ChatGPT</button>
      <p class="st-menu-empty">Keep your rooms and reopen them on any device.</p>
    </div>`;
  } else {
    accountList = `<div class="st-menu-section">
      <h4>Your account <span>${esc(account.user?.email || '')}</span></h4>
      ${loadingAccount
        ? '<p class="st-menu-empty">Loading…</p>'
        : accountRooms.length
          ? accountRooms.map((r) => item(r, 'account')).join('')
          : '<p class="st-menu-empty">No rooms saved to your account yet.</p>'}
    </div>`;
  }

  return `<div class="st-menu-actions">
      <button data-act="new" role="menuitem"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg> New room</button>
      <button data-act="duplicate" role="menuitem"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/></svg> Duplicate</button>
      <button data-act="delete" role="menuitem" class="st-danger"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></svg> Delete this room</button>
    </div>
    <div class="st-menu-section">
      <h4>On this device</h4>
      ${deviceList}
    </div>
    ${accountList}
    ${account.signedIn ? '<div class="st-menu-actions st-menu-foot"><button data-act="signout" role="menuitem">Sign out</button></div>' : ''}`;
}
