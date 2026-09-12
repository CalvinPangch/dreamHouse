/** Abstract material samples derived from the room's design brief. */
function materialKind(name) {
  if (/rattan|cane/i.test(name)) return 'weave';
  if (/oak|timber|wood|walnut/i.test(name)) return 'wood';
  if (/linen|cotton|wool|rug|curtain|upholster|carpet/i.test(name)) return 'textile';
  if (/glass|mirror/i.test(name)) return 'glass';
  if (/stainless|steel|metal/i.test(name)) return 'metal';
  if (/tile|terrazzo/i.test(name)) return 'tile';
  return 'stone';
}

export function materialBoard(materials, compact = false) {
  return `<div class="material-board ${compact ? 'is-compact' : ''}" aria-label="Material palette">
    ${materials.slice(0, 3).map(name => `<div class="material-sample"><div class="sample-surface sample-${materialKind(name)}" aria-hidden="true"></div><span>${name}</span></div>`).join('')}
  </div>`;
}

export function roomLocator(room, floor) {
  return `<svg class="room-locator" viewBox="-3 -3 36 54" role="img" aria-label="${room.name} location on this floor">
    ${floor.rooms.map(r => `<rect x="${r.x1}" y="${r.z1}" width="${r.x2-r.x1}" height="${r.z2-r.z1}" class="${r.id === room.id ? 'locator-active' : ''}"/>`).join('')}
  </svg>`;
}
