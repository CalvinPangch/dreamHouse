/** The two residents: soft little figures that move through the day. */
import * as THREE from 'three';
import { soft, cyl, sphere } from './build.js';
import { PEOPLE } from './design.js';

export function makePerson(person) {
  const g = new THREE.Group();
  g.add(cyl(0.55, 0.7, 1.9, person.tint, { y: 0.95 }));
  g.add(soft(1.3, 0.9, 0.9, person.tint, { y: 1.75, radius: 0.4 }));
  g.add(sphere(0.62, '#f6e0cc', { y: 2.7 }));
  const hair = sphere(0.66, '#4a3b31', { y: 2.85, sy: 0.7 });
  g.add(hair);
  g.userData.person = person;
  return g;
}

/** Where a person is at a given hour: the last entry on or before it. */
export function scheduleAt(person, hour) {
  let current = person.day[person.day.length - 1];
  for (const slot of person.day) {
    if (hour >= slot.h) current = slot;
  }
  return current;
}

export function createPeople() {
  return PEOPLE.map((p) => ({ def: p, mesh: makePerson(p), target: new THREE.Vector3(), slot: null }));
}
