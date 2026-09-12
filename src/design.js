/**
 * Sunny Half House
 * The interior design brief: palette, room programme, and the notes that
 * appear in the Design Notes tab.
 *
 * A double storey semi-detached house, 30' x 48' built-up, designed in a warm
 * cream "Japandi" palette - oak, oat, clay and sage, with soft daylight.
 *
 * Coordinates in feet: x 0 (party wall) -> 30, z 0 (rear) -> 48 (street).
 */

export const FT = 0.3048;
export const ft = (v) => v * FT;

export const HOUSE = { width: 30, depth: 48, wallCut: 4.4, wallFull: 9.6, storey: 10.4 };

/** The palette every room is mixed from. */
export const TONE = {
  shell: '#f6f1e8',      // plaster
  shellWarm: '#efe7d9',
  oak: '#e0c9a6',        // floors
  oakDeep: '#c9a97e',
  oat: '#ecdcbe',
  sage: '#bcd1b0',
  clay: '#e9b394',
  butter: '#f6d98f',
  mist: '#b7d0dd',
  rose: '#f0c4c0',
  cream: '#fbf7f0',
  ink: '#4a4038',
  linen: '#f3ece1',
  moss: '#93a98a',
  terracotta: '#c98b6b',
  walnut: '#9a7550',
};

const GROUND = [
  {
    id: 'living', name: "Living Room", en: 'Living Room', mood: "Where the afternoon light lands on the sofa",
    x1: 0, z1: 22, x2: 19, z2: 40, accent: TONE.sage, floor: TONE.oak,
    note: "A full wall of sliding doors borrows the garden. The sofa floats off the wall so a walking loop runs behind it. Off-white linen upholstery over an oat wool rug; the TV wall is one run of timber veneer with open niches, so the electronics disappear and only books and ceramics stay out.",
    materials: ["Oak floor", "Linen upholstery", "Rattan & ceramic"],
    light: "No ceiling light - floor lamp, sconces and a cove, in three layers",
    furniture: [
      { type: 'rug', x: 9, z: 31, w: 13, d: 10, color: TONE.oat },
      { type: 'sofa', x: 9, z: 35.5, rot: 180, w: 10, d: 3.4, color: '#efe9de' },
      { type: 'armchair', x: 3.2, z: 27.5, rot: 55, color: TONE.sage },
      { type: 'armchair', x: 15, z: 27.2, rot: -55, color: TONE.clay },
      { type: 'coffeeTable', x: 9, z: 31, w: 5, d: 2.6 },
      { type: 'tvWall', x: 9, z: 22.6, w: 12 },
      { type: 'floorLamp', x: 15.6, z: 35.5 },
      { type: 'plant', x: 1.6, z: 38, h: 5.2 },
      { type: 'plant', x: 17.4, z: 23.6, h: 3.4 },
      { type: 'sideTable', x: 2.4, z: 31.5 },
    ],
  },
  {
    id: 'dining', name: "Dining", en: 'Dining', mood: "One long table, for evenings that run late",
    x1: 19, z1: 12, x2: 30, z2: 28, accent: TONE.clay, floor: TONE.oak,
    note: "The long table sits at an angle to the kitchen island, so whoever is cooking is never shut away. Three small pendants hang low and everything beyond the table falls dark. A full-height sideboard on the side wall swallows the everyday clutter.",
    materials: ["Solid oak table", "Rattan chairs", "Matt tile"],
    light: "Three low pendants at 2700K",
    furniture: [
      { type: 'rug', x: 24.5, z: 20, w: 9, d: 11, color: TONE.linen },
      { type: 'diningTable', x: 24.5, z: 20, w: 3.6, d: 8, chairs: 6 },
      { type: 'sideboard', x: 29, z: 20, rot: -90, w: 10, d: 1.6 },
      { type: 'pendant', x: 24.5, z: 20, count: 3, spread: 5 },
      { type: 'plant', x: 20.4, z: 26.6, h: 3.8 },
    ],
  },
  {
    id: 'kitchen', name: "Open Kitchen", en: 'Open Kitchen', mood: "The island is the second dining table",
    x1: 0, z1: 12, x2: 11, z2: 22, accent: TONE.butter, floor: TONE.oakDeep,
    note: "The open island faces the dining room: breakfast, homework and conversation all happen here. Upper cabinets become open timber shelves, lower ones go handleless. Off-white quartz for the worktop - hardwearing without feeling cold.",
    materials: ["Quartz worktop", "Handleless oak", "Zellige tile"],
    light: "Island pendants plus shelf strip lighting",
    furniture: [
      { type: 'counter', x: 5.5, z: 12.9, rot: 0, w: 10, d: 2.1 },
      { type: 'counter', x: 0.9, z: 17, rot: 90, w: 8, d: 2.1 },
      { type: 'island', x: 6.4, z: 18.6, w: 8, d: 3, stools: 3 },
      { type: 'fridge', x: 10, z: 13.4 },
      { type: 'pendant', x: 6.4, z: 18.6, count: 2, spread: 3.4 },
    ],
  },
  {
    id: 'wetkitchen', name: "Wet Kitchen", en: 'Wet Kitchen', mood: "Keep the wok smoke behind a door",
    x1: 0, z1: 0, x2: 11, z2: 12, accent: TONE.mist, floor: TONE.oakDeep,
    note: "The smoke from a hot wok stays behind the glass door. Three runs of counter make a U-shaped working line, and the sink faces the rear window so there is daylight while you wash.",
    materials: ["Stainless worktop", "Fluted glass door", "Anti-slip tile"],
    light: "Flat ceiling panel, strip light over the worktop",
    furniture: [
      { type: 'counter', x: 5.5, z: 0.9, rot: 0, w: 10, d: 2.1 },
      { type: 'counter', x: 0.9, z: 6, rot: 90, w: 9, d: 2.1 },
      { type: 'counter', x: 10.1, z: 6, rot: -90, w: 9, d: 2.1 },
      { type: 'stove', x: 5.5, z: 1.1 },
      { type: 'plant', x: 9.4, z: 10.6, h: 2.6 },
    ],
  },
  {
    id: 'laundry', name: "Laundry", en: 'Laundry', mood: "Housework, tucked behind one door",
    x1: 11, z1: 0, x2: 19, z2: 6, accent: TONE.oat, floor: TONE.oakDeep,
    note: "Washer and dryer stacked, with a cabinet above for cleaning supplies and a gap left for ironing. Close the door and the mess and the noise stay inside.",
    materials: ["Moisture-proof cabinets", "Terrazzo floor"],
    light: "One ceiling light - bright is all it needs",
    furniture: [
      { type: 'washer', x: 12.6, z: 1.3 },
      { type: 'washer', x: 15.2, z: 1.3 },
      { type: 'counter', x: 17.4, z: 1.2, rot: 0, w: 3, d: 2 },
    ],
  },
  {
    id: 'powder', name: "Powder Room", en: 'Powder Room', mood: "A small courtesy for guests",
    x1: 11, z1: 6, x2: 19, z2: 12, accent: TONE.mist, floor: TONE.oakDeep,
    note: "Wet and dry separated. The basin floats off the floor so the room feels lighter. Micro-cement to the walls, a round mirror and one warm sconce.",
    materials: ["Micro-cement", "Round black-framed mirror"],
    light: "Mirror sconce, Ra95 for colour",
    furniture: [
      { type: 'basin', x: 12.6, z: 10.6, rot: 180 },
      { type: 'toilet', x: 17.4, z: 7.6, rot: 90 },
      { type: 'shower', x: 17, z: 10.4 },
    ],
  },
  {
    id: 'study', name: "Study", en: 'Study', mood: "A corner to be alone in",
    x1: 19, z1: 0, x2: 30, z2: 12, accent: TONE.clay, floor: TONE.oak,
    note: "A full wall of shelving and a long desk facing the window. A daybed in the corner turns the room into a guest room when someone stays: a reading seat by day, a bed at night.",
    materials: ["White oak shelving", "Linen curtain"],
    light: "LED bar over the desk, strips in the shelving",
    furniture: [
      { type: 'bookshelf', x: 29.1, z: 6, rot: -90, w: 11, h: 7.5 },
      { type: 'desk', x: 24, z: 1.6, rot: 0, w: 7, d: 2.4 },
      { type: 'chair', x: 24, z: 3.6, rot: 180 },
      { type: 'daybed', x: 21, z: 9, rot: 90, w: 6, d: 3 },
      { type: 'plant', x: 20.2, z: 1.4, h: 3.6 },
    ],
  },
  {
    id: 'stair', name: "Stairs", en: 'Stairs', mood: "One step at a time, back upstairs",
    x1: 11, z1: 12, x2: 19, z2: 22, accent: TONE.oat, floor: TONE.oakDeep,
    note: "Oak treads with a slim black steel rail, and open book niches down the side. Nothing is stored under the stair - the space is left for one tall plant.",
    materials: ["Oak treads", "Slim steel rail"],
    light: "Strip lighting down the side of each tread",
    furniture: [
      { type: 'staircase', x: 15, z: 17, w: 6, d: 10 },
    ],
  },
  {
    id: 'foyer', name: "Foyer", en: 'Foyer', mood: "Put the day down at the door",
    x1: 19, z1: 28, x2: 30, z2: 40, accent: TONE.oat, floor: TONE.oakDeep,
    note: "Full-height shoe cabinets with an open shelf cut through the middle, so keys, masks and parcels all have somewhere to land. A long bench to sit down on, and a mirror to stretch the hallway.",
    materials: ["Timber veneer", "Hex tile"],
    light: "Sensor strip under the cabinets",
    furniture: [
      { type: 'shoeCabinet', x: 29.1, z: 34, rot: -90, w: 10, h: 7.2 },
      { type: 'bench', x: 21.4, z: 33, rot: 90, w: 5 },
      { type: 'plant', x: 20.6, z: 29.4, h: 3.2 },
    ],
  },
  {
    id: 'porch', name: "Porch & Garden", en: 'Porch & Garden', mood: "The last twenty steps home",
    x1: 0, z1: 40, x2: 30, z2: 48, accent: TONE.moss, floor: '#d8d2c6', open: true,
    note: "Permeable pavers for the car, with a strip of grass let into the middle. Fine-leaved planting along the boundary wall, lit from below at night, so the first thing you see coming home is green.",
    materials: ["Permeable paver", "Fine-leaf planting"],
    light: "In-ground uplights and a sconce at the door",
    furniture: [
      { type: 'car', x: 8, z: 44 },
      { type: 'car', x: 21, z: 44 },
      { type: 'plant', x: 27.6, z: 41.4, h: 4.4 },
      { type: 'plant', x: 1.8, z: 41.4, h: 4 },
    ],
  },
];

const UPPER = [
  {
    id: 'master', name: "Master Bedroom", en: 'Master Bedroom', mood: "For a dream the colour of cream",
    x1: 0, z1: 22, x2: 19, z2: 40, accent: TONE.rose, floor: TONE.oak,
    note: "A full upholstered headboard wall with matching sconces either side - no need to get out of bed to turn off the light. A 1.5 m bay window seat with cushions and a small table: the quietest corner of the house.",
    materials: ["Upholstered headboard", "Sheer + blackout linen"],
    light: "Sconces and a cove - the ceiling light barely goes on",
    furniture: [
      { type: 'rug', x: 9, z: 30, w: 12, d: 9, color: TONE.linen },
      { type: 'bed', x: 9, z: 27.5, rot: 0, w: 7, d: 7.5 },
      { type: 'nightstand', x: 4.6, z: 24.6 },
      { type: 'nightstand', x: 13.4, z: 24.6 },
      { type: 'bench', x: 9, z: 32, rot: 0, w: 5 },
      { type: 'armchair', x: 16, z: 37, rot: -140, color: TONE.oat },
      { type: 'sideTable', x: 13.6, z: 37.6 },
      { type: 'plant', x: 1.8, z: 37.6, h: 4.2 },
      { type: 'floorLamp', x: 17.2, z: 34.6 },
    ],
  },
  {
    id: 'masterbath', name: "Master Bath", en: 'Master Bath', mood: "Put the bathtub by the window",
    x1: 19, z1: 26, x2: 30, z2: 40, accent: TONE.mist, floor: '#e6ded2',
    note: "The freestanding tub sits at the window and the two basins stand apart. Fluted glass screens the shower, and the floor falls 1% to the drain so the steam clears quickly.",
    materials: ["Micro-cement", "Freestanding tub", "Fluted glass"],
    light: "Mirror light plus anti-fog downlights",
    furniture: [
      { type: 'bathtub', x: 24.5, z: 38, rot: 0 },
      { type: 'basin', x: 29, z: 31, rot: -90 },
      { type: 'basin', x: 29, z: 34, rot: -90 },
      { type: 'shower', x: 20.8, z: 27.8 },
      { type: 'toilet', x: 24, z: 27.2, rot: 0 },
      { type: 'plant', x: 20.6, z: 38.4, h: 2.8 },
    ],
  },
  {
    id: 'walkin', name: "Walk-in Wardrobe", en: 'Walk-in Wardrobe', mood: "Hang each thing in its place",
    x1: 0, z1: 12, x2: 11, z2: 22, accent: TONE.oat, floor: TONE.oak,
    note: "A U-shaped open wardrobe with an island in the middle for jewellery and perfume. Everything runs to the ceiling, with seasonal boxes on the top shelf; the internal lighting comes on as the door opens.",
    materials: ["Oak shelving", "Brass rail"],
    light: "Sensor strips, chosen for colour rendering",
    furniture: [
      { type: 'wardrobe', x: 0.9, z: 17, rot: 90, w: 9, h: 8 },
      { type: 'wardrobe', x: 10.1, z: 17, rot: -90, w: 9, h: 8 },
      { type: 'wardrobe', x: 5.5, z: 12.8, rot: 0, w: 8, h: 8 },
      { type: 'islandLow', x: 5.5, z: 18.4, w: 5, d: 2.4 },
    ],
  },
  {
    id: 'family', name: "Family Hall", en: 'Family Hall', mood: "Everyone doing their own thing",
    x1: 19, z1: 12, x2: 30, z2: 26, accent: TONE.sage, floor: TONE.oak,
    note: "No television here - a full wall of shelving and a big rug instead. A low sofa and floor cushions: children building Lego on the floor, adults reading beside them.",
    materials: ["Wool rug", "Open shelving"],
    light: "Two floor lamps, warm white",
    furniture: [
      { type: 'rug', x: 24.5, z: 19.5, w: 9, d: 10, color: TONE.sage },
      { type: 'sofa', x: 24.5, z: 15.4, rot: 0, w: 7, d: 3, color: TONE.linen },
      { type: 'bookshelf', x: 29.1, z: 21, rot: -90, w: 8, h: 7 },
      { type: 'ottoman', x: 22.4, z: 21.8 },
      { type: 'ottoman', x: 26.4, z: 22.6 },
      { type: 'floorLamp', x: 20.4, z: 13.4 },
    ],
  },
  {
    id: 'bed2', name: "Bedroom 2", en: 'Bedroom 2', mood: "The room we keep for my parents",
    x1: 0, z1: 0, x2: 12, z2: 12, accent: TONE.mist, floor: TONE.oak,
    note: "A standard double with a desk that doubles as a dressing table. A firmer mattress, two-way switches and USB at the bedhead; the wardrobe runs full height but stays clear of the bed.",
    materials: ["Oak furniture", "Plain linen"],
    light: "Two-way switch at the bed, reading sconce",
    furniture: [
      { type: 'bed', x: 5.6, z: 4, rot: 0, w: 6, d: 7 },
      { type: 'nightstand', x: 1.8, z: 1.4 },
      { type: 'nightstand', x: 9.4, z: 1.4 },
      { type: 'wardrobe', x: 11.1, z: 8, rot: -90, w: 7, h: 8 },
      { type: 'desk', x: 3, z: 10.8, rot: 180, w: 5, d: 2 },
      { type: 'plant', x: 10.4, z: 11.2, h: 2.8 },
    ],
  },
  {
    id: 'kids', name: "Kids' Room", en: "Kids' Room", mood: "A floor you can sit down on",
    x1: 19, z1: 0, x2: 30, z2: 12, accent: TONE.butter, floor: TONE.oak,
    note: "The bed goes against the wall and the furniture hugs the edges, leaving the largest possible run of clear floor. Low shelves so they can reach their own books, and a pegboard wall they can do what they like with.",
    materials: ["Rounded timber", "Washable paint"],
    light: "Softened ceiling light plus a night light",
    furniture: [
      { type: 'bed', x: 22.6, z: 3.6, rot: 0, w: 4.6, d: 6.4 },
      { type: 'wardrobe', x: 29.1, z: 4, rot: -90, w: 7, h: 7.5 },
      { type: 'bookshelfLow', x: 25.6, z: 11.2, rot: 180, w: 5 },
      { type: 'rug', x: 25, z: 7.6, w: 7, d: 6, color: TONE.butter },
      { type: 'ottoman', x: 27.6, z: 8.6 },
      { type: 'plant', x: 19.8, z: 11.2, h: 2.6 },
    ],
  },
  {
    id: 'bath2', name: "Common Bath", en: 'Common Bath', mood: "The first thing in the morning",
    x1: 12, z1: 0, x2: 19, z2: 7, accent: TONE.mist, floor: '#e6ded2',
    note: "Three-way separation: basin outside, WC and shower each in their own compartment. Three people can use it at once on a school morning.",
    materials: ["Subway tile", "Black-framed glass"],
    light: "Anti-fog mirror light",
    furniture: [
      { type: 'basin', x: 13.6, z: 6.4, rot: 180 },
      { type: 'toilet', x: 17.6, z: 1.4, rot: 0 },
      { type: 'shower', x: 17.4, z: 5 },
    ],
  },
  {
    id: 'utility', name: "Utility", en: 'Utility', mood: "Home of the linen and towels",
    x1: 12, z1: 7, x2: 19, z2: 12, accent: TONE.oat, floor: TONE.oakDeep,
    note: "A full-height store for four seasons of bedding and spare towels, with the bottom shelf left free to charge the vacuum.",
    materials: ["Melamine board"],
    light: "A single downlight",
    furniture: [
      { type: 'wardrobe', x: 18.1, z: 9.5, rot: -90, w: 4.6, h: 8 },
      { type: 'washer', x: 13.4, z: 8.4 },
    ],
  },
  {
    id: 'stairhall', name: "Landing", en: 'Landing', mood: "Even a hallway deserves a lamp",
    x1: 11, z1: 12, x2: 19, z2: 22, accent: TONE.oat, floor: TONE.oakDeep,
    note: "A gallery wall of family photographs at the top of the stairs, and a narrow console with a small lamp at the end - so the corridor is more than a corridor.",
    materials: ["Gallery wall", "Narrow console"],
    light: "Wall washers over the photographs",
    furniture: [
      { type: 'staircase', x: 15, z: 17, w: 6, d: 10, down: true },
      { type: 'sideboard', x: 11.8, z: 20, rot: 90, w: 4, d: 1.2 },
    ],
  },
  {
    id: 'balcony', name: "Balcony", en: 'Balcony', mood: "Good weather for airing the quilts",
    x1: 0, z1: 40, x2: 30, z2: 48, accent: TONE.moss, floor: '#ded7c9', open: true,
    note: "Half for drying, half for tea. A run of fixed planters and two folding chairs; glass balustrade with a timber handrail, so the view stays open when you sit down.",
    materials: ["Timber decking", "Glass balustrade"],
    light: "Sconce and a string of festoon lights",
    furniture: [
      { type: 'dryingRack', x: 7, z: 44 },
      { type: 'armchair', x: 20, z: 43.4, rot: 150, color: TONE.linen },
      { type: 'armchair', x: 24, z: 43.4, rot: -150, color: TONE.linen },
      { type: 'sideTable', x: 22, z: 45.4 },
      { type: 'plant', x: 27.4, z: 41.6, h: 3.4 },
      { type: 'plant', x: 16.6, z: 41.6, h: 2.8 },
    ],
  },
];

export const FLOORS = [
  { id: 'ground', name: "Ground", en: 'Ground Floor', rooms: GROUND },
  { id: 'upper', name: "Upper", en: 'First Floor', rooms: UPPER },
];

/**
 * Doors and openings. `axis` is the direction the opening runs, `at` is the
 * line it sits on: axis 'x' -> the wall at z = at, axis 'z' -> the wall at x = at.
 */
export const DOORS = {
  ground: [
    { axis: 'x', at: 12, from: 6.5, to: 9.5 },              // wet kitchen
    { axis: 'x', at: 12, from: 21, to: 27, wide: true },    // study -> dining
    { axis: 'z', at: 11, from: 2, to: 4.6 },                // laundry
    { axis: 'z', at: 11, from: 8, to: 10.4 },               // powder
    { axis: 'z', at: 11, from: 16, to: 20, wide: true },    // kitchen -> stair
    { axis: 'z', at: 19, from: 4, to: 7 },                  // study
    { axis: 'z', at: 19, from: 15, to: 19, wide: true },    // stair -> dining
    { axis: 'x', at: 22, from: 2, to: 9, wide: true },      // kitchen -> living
    { axis: 'x', at: 22, from: 12, to: 16 },                // stair -> living
    { axis: 'x', at: 28, from: 20, to: 28, wide: true },    // dining -> foyer
    { axis: 'z', at: 19, from: 30, to: 34 },                // foyer -> living
    { axis: 'x', at: 40, from: 3, to: 13, wide: true },     // living -> garden
    { axis: 'x', at: 40, from: 22, to: 25 },                // front door
  ],
  upper: [
    { axis: 'x', at: 12, from: 3, to: 6 },                  // bedroom 2
    { axis: 'x', at: 12, from: 13.5, to: 16 },              // utility
    { axis: 'x', at: 12, from: 21, to: 24 },                // kids
    { axis: 'x', at: 7, from: 14, to: 16.5 },               // common bath
    { axis: 'z', at: 11, from: 14, to: 17 },                // walk-in
    { axis: 'z', at: 19, from: 14, to: 18, wide: true },    // landing -> family
    { axis: 'x', at: 22, from: 4, to: 7 },                  // walk-in -> master
    { axis: 'x', at: 22, from: 12, to: 15.5 },              // landing -> master
    { axis: 'z', at: 19, from: 30, to: 33 },                // master -> master bath
    { axis: 'x', at: 40, from: 4, to: 12, wide: true },     // master -> balcony
  ],
};

/** Exterior windows. The wall on x = 0 is the party wall, so it has none. */
export const WINDOWS = {
  ground: [
    { axis: 'x', at: 0, from: 2, to: 8 },      // rear: wet kitchen
    { axis: 'x', at: 0, from: 21, to: 27 },    // rear: study
    { axis: 'z', at: 30, from: 2, to: 9 },     // side: study
    { axis: 'z', at: 30, from: 14, to: 26 },   // side: dining
    { axis: 'z', at: 30, from: 30, to: 38 },   // side: foyer
  ],
  upper: [
    { axis: 'x', at: 0, from: 2, to: 9 },      // rear: bedroom 2
    { axis: 'x', at: 0, from: 21, to: 28 },    // rear: kids
    { axis: 'z', at: 30, from: 2, to: 9 },     // side: kids
    { axis: 'z', at: 30, from: 14, to: 24 },   // side: family hall
    { axis: 'z', at: 30, from: 28, to: 38 },   // side: master bath
  ],
};

/** The two residents and what they are doing through the day. */
export const PEOPLE = [
  {
    id: 'he', name: "Ethan", tint: '#8fae86',
    day: [
      { h: 6.5, floor: 'upper', room: 'master', act: "Just awake, staring out of the window" },
      { h: 7.5, floor: 'upper', room: 'masterbath', act: "Washing up in the bathroom" },
      { h: 8.4, floor: 'ground', room: 'kitchen', act: "Making coffee at the island" },
      { h: 9.5, floor: 'ground', room: 'study', act: "Working in the study" },
      { h: 13, floor: 'ground', room: 'dining', act: "Lunch at the long table" },
      { h: 15, floor: 'ground', room: 'study', act: "Reading in the study" },
      { h: 18.5, floor: 'ground', room: 'wetkitchen', act: "Cooking dinner in the wet kitchen" },
      { h: 20, floor: 'ground', room: 'living', act: "A film on the sofa" },
      { h: 22.5, floor: 'upper', room: 'master', act: "Heading to bed" },
    ],
  },
  {
    id: 'man', name: "Mia", tint: '#d3a07e',
    day: [
      { h: 6.5, floor: 'upper', room: 'kids', act: "Still fast asleep" },
      { h: 8, floor: 'upper', room: 'bath2', act: "Brushing teeth in the common bath" },
      { h: 8.6, floor: 'ground', room: 'dining', act: "Having a snack at the dining table" },
      { h: 10, floor: 'upper', room: 'family', act: "Building Lego in the family hall" },
      { h: 12.5, floor: 'ground', room: 'dining', act: "Lunch at the long table" },
      { h: 14, floor: 'upper', room: 'balcony', act: "Sunbathing on the balcony" },
      { h: 17, floor: 'upper', room: 'kids', act: "Drawing in her room" },
      { h: 19, floor: 'ground', room: 'living', act: "Rolling around on the rug" },
      { h: 21, floor: 'upper', room: 'kids', act: "Asleep after her story" },
    ],
  },
];

export const WEATHER = [
  { id: 'sun', label: 'Clear', icon: '☀️' },
  { id: 'cloud', label: 'Cloudy', icon: '☁️' },
  { id: 'rain', label: 'Rain', icon: '🌧️' },
];
