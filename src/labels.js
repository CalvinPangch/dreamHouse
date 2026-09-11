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
  for (const e of entries) {
    const p = projectToScreen(new THREE.Vector3(e.pos.x * scale, 2.2 * scale, e.pos.z * scale), camera, rect.width, rect.height);
    e.el.style.transform = `translate(-50%, -50%) translate(${p.x}px, ${p.y}px)`;
    e.el.classList.toggle('is-active', e.id === activeId);
    e.el.style.opacity = p.visible ? '1' : '0';
  }
}
