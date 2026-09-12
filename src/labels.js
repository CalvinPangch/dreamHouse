/** HTML room labels pinned to the model, in the style of the reference UI. */
import * as THREE from 'three';
import { projectToScreen } from './build.js';

export function createLabels(layer, rooms, onPick) {
  layer.innerHTML = '';
  const entries = [];
  for (const [id, room] of rooms) {
    const el = document.createElement('button');
    el.className = 'room-label';
    el.type = 'button';
    el.innerHTML = `<i></i>${room.def.name}`;
    el.addEventListener('click', () => onPick(id));
    layer.appendChild(el);
    entries.push({ id, el, pos: room.centre.clone() });
  }
  return entries;
}

export function updateLabels(entries, camera, rect, scale, activeId) {
  const occupied = [];
  // Keep the selected room legible; other labels yield when their bounds overlap.
  const ordered = [...entries].sort((a, b) => Number(b.id === activeId) - Number(a.id === activeId));
  for (const e of ordered) {
    const p = projectToScreen(new THREE.Vector3(e.pos.x * scale, 2.2 * scale, e.pos.z * scale), camera, rect.width, rect.height);
    const w = e.el.offsetWidth;
    const h = e.el.offsetHeight;
    const box = { left: p.x - w / 2 - 3, right: p.x + w / 2 + 3, top: p.y - h / 2 - 3, bottom: p.y + h / 2 + 3 };
    const visible = p.visible && box.left > 8 && box.right < rect.width - 8 && box.top > 65 && box.bottom < rect.height - 105 && !occupied.some(b => box.left < b.right && box.right > b.left && box.top < b.bottom && box.bottom > b.top);
    if (visible) occupied.push(box);
    e.el.style.transform = `translate(-50%, -50%) translate(${p.x}px, ${p.y}px)`;
    e.el.classList.toggle('is-active', e.id === activeId);
    e.el.setAttribute('aria-pressed', String(e.id === activeId));
    e.el.style.visibility = visible ? 'visible' : 'hidden';
  }
}
