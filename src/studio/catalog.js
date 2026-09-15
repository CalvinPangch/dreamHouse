/**
 * The oak & linen collection: every piece the studio can place.
 *
 * Dimensions are metric and authoritative - each piece is built from the house
 * furniture builders (which are authored in feet) and then scaled to exactly the
 * width/depth/height declared here, so the numbers in the inspector are the model.
 */
import { TONE } from '../design.js';

/** Finish swatches. `body` on a piece names the colour a finish replaces. */
export const FINISHES = [
  { id: 'linen', name: 'Natural linen', color: '#efe9de' },
  { id: 'mist', name: 'Grey mist', color: '#c7cdc9' },
  { id: 'clay', name: 'Clay', color: TONE.clay },
  { id: 'cream', name: 'Bone cream', color: '#fbf7f0' },
  { id: 'charcoal', name: 'Charcoal', color: '#787b72' },
  { id: 'sage', name: 'Sage', color: TONE.sage },
  { id: 'oak', name: 'Oak', color: TONE.oak },
  { id: 'walnut', name: 'Walnut', color: TONE.walnut },
];

export const FINISH_BY_ID = new Map(FINISHES.map((f) => [f.id, f]));

const SOFT = ['linen', 'mist', 'clay', 'cream', 'charcoal', 'sage'];
const TIMBER = ['oak', 'walnut', 'linen', 'cream', 'charcoal'];
const PAINTED = ['linen', 'cream', 'sage', 'mist', 'clay', 'charcoal'];

export const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'seating', name: 'Seating' },
  { id: 'tables', name: 'Tables' },
  { id: 'objects', name: 'Objects' },
  { id: 'storage', name: 'Storage' },
  { id: 'bedroom', name: 'Bedroom' },
];

/**
 * build  - arguments handed to makeFurniture()
 * body   - the colour in the built model that a finish swatch replaces
 * mount  - 'floor' (default) or 'ceiling'
 */
export const CATALOG = [
  {
    id: 'linen-sofa', name: 'Linen sofa', category: 'seating',
    w: 2.3, d: 0.94, h: 0.84, build: { type: 'sofa', w: 7.5, d: 3.1 },
    body: '#efe9de', finishes: SOFT, finish: 'linen',
  },
  {
    id: 'lounge-chair', name: 'Lounge chair', category: 'seating',
    w: 0.85, d: 0.86, h: 0.78, build: { type: 'armchair' },
    body: TONE.sage, finishes: SOFT, finish: 'sage',
  },
  {
    id: 'dining-chair', name: 'Oak dining chair', category: 'seating',
    w: 0.48, d: 0.53, h: 0.86, build: { type: 'chair' },
    body: TONE.oat, finishes: TIMBER, finish: 'oak',
  },
  {
    id: 'ottoman', name: 'Round ottoman', category: 'seating',
    w: 0.62, d: 0.62, h: 0.42, build: { type: 'ottoman' },
    body: TONE.oat, finishes: SOFT, finish: 'clay', round: true,
  },
  {
    id: 'daybed', name: 'Reading daybed', category: 'seating',
    w: 1.9, d: 0.86, h: 0.72, build: { type: 'daybed', w: 6, d: 3 },
    body: TONE.linen, finishes: SOFT, finish: 'linen',
  },
  {
    id: 'bench', name: 'Hallway bench', category: 'seating',
    w: 1.2, d: 0.4, h: 0.45, build: { type: 'bench', w: 4 },
    body: TONE.oat, finishes: TIMBER, finish: 'oak',
  },

  {
    id: 'gathering-table', name: 'Gathering table', category: 'tables',
    w: 1.8, d: 0.9, h: 0.75, build: { type: 'diningTable', w: 3, d: 6, chairs: 0 },
    body: TONE.walnut, finishes: TIMBER, finish: 'oak',
  },
  {
    id: 'coffee-table', name: 'Low coffee table', category: 'tables',
    w: 1.2, d: 0.65, h: 0.38, build: { type: 'coffeeTable', w: 4, d: 2.2 },
    body: TONE.walnut, finishes: TIMBER, finish: 'oak',
  },
  {
    id: 'writing-desk', name: 'Writing desk', category: 'tables',
    w: 1.4, d: 0.65, h: 0.74, build: { type: 'desk', w: 4.6, d: 2.1 },
    body: TONE.walnut, finishes: TIMBER, finish: 'walnut',
  },
  {
    id: 'side-table', name: 'Side table', category: 'tables',
    w: 0.45, d: 0.45, h: 0.55, build: { type: 'sideTable' },
    body: TONE.walnut, finishes: TIMBER, finish: 'oak', round: true,
  },
  {
    id: 'island', name: 'Kitchen island', category: 'tables',
    w: 2.2, d: 0.95, h: 0.92, build: { type: 'islandLow', w: 7, d: 3 },
    body: TONE.linen, finishes: PAINTED, finish: 'cream',
  },

  {
    id: 'sideboard', name: 'Oak sideboard', category: 'storage',
    w: 1.8, d: 0.45, h: 0.78, build: { type: 'sideboard', w: 6, d: 1.5 },
    body: TONE.linen, finishes: PAINTED, finish: 'linen',
  },
  {
    id: 'bookshelf', name: 'Open bookshelf', category: 'storage',
    w: 1.6, d: 0.34, h: 1.9, build: { type: 'bookshelf', w: 5.2, h: 6.2 },
    body: TONE.linen, finishes: PAINTED, finish: 'cream',
  },
  {
    id: 'wardrobe', name: 'Wardrobe', category: 'storage',
    w: 1.6, d: 0.6, h: 2.2, build: { type: 'wardrobe', w: 5.2, h: 7.2 },
    body: TONE.linen, finishes: PAINTED, finish: 'linen',
  },
  {
    id: 'shoe-cabinet', name: 'Shoe cabinet', category: 'storage',
    w: 1.0, d: 0.35, h: 0.85, build: { type: 'shoeCabinet', w: 3.3, h: 2.8 },
    body: TONE.linen, finishes: PAINTED, finish: 'sage',
  },

  {
    id: 'double-bed', name: 'Double bed', category: 'bedroom',
    w: 1.6, d: 2.05, h: 0.95, build: { type: 'bed', w: 5.2, d: 6.7 },
    body: TONE.linen, finishes: SOFT, finish: 'linen',
  },
  {
    id: 'nightstand', name: 'Nightstand', category: 'bedroom',
    w: 0.45, d: 0.4, h: 0.52, build: { type: 'nightstand' },
    body: TONE.walnut, finishes: TIMBER, finish: 'walnut',
  },

  {
    id: 'floor-lamp', name: 'Floor lamp', category: 'objects',
    w: 0.4, d: 0.4, h: 1.65, build: { type: 'floorLamp' },
    body: '#f6ead2', finishes: ['cream', 'linen', 'sage', 'clay'], finish: 'cream', round: true,
  },
  {
    id: 'plant', name: 'Potted plant', category: 'objects',
    w: 0.6, d: 0.6, h: 1.4, build: { type: 'plant', h: 3.6 },
    body: TONE.terracotta, finishes: ['clay', 'cream', 'charcoal', 'sage'], finish: 'clay', round: true,
  },
  {
    id: 'rug', name: 'Wool rug', category: 'objects',
    w: 2.4, d: 1.7, h: 0.02, build: { type: 'rug', w: 8, d: 5.6 },
    body: TONE.oat, finishes: SOFT, finish: 'linen', flat: true,
  },
  {
    id: 'pendant', name: 'Pendant light', category: 'objects',
    w: 0.35, d: 0.35, h: 0.32, build: { type: 'pendant', count: 1 },
    body: '#f2dcb2', finishes: ['cream', 'linen', 'sage', 'clay', 'charcoal'], finish: 'cream',
    mount: 'ceiling', drop: 0.85,
  },
];

export const CATALOG_BY_ID = new Map(CATALOG.map((p) => [p.id, p]));

/** "230 × 94 cm", the way the catalogue lists a piece. */
export const cmLabel = (piece) => `${Math.round(piece.w * 100)} × ${Math.round(piece.d * 100)} cm`;
