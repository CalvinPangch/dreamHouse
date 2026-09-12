# Sunny Half House

An interior design for a double storey **semi-detached** home, presented as a warm,
illustrated 3D dollhouse you can walk around, light up and read.

Two floors, twenty rooms, 30' × 48' per floor (2,400 sq ft built-up), designed in a
cream "Japandi" palette — oak, oat, clay and sage.

The model contains three dedicated bedrooms, a study with a daybed, and three
bathrooms. The 2,400 sq ft figure excludes the porch and balcony.

```bash
python3 -m http.server 8080     # or: npx http-server -p 8080
# then open http://localhost:8080
```

> Serve it over `http://` — ES modules and import maps don't run from `file://`.

## What's in it

**Walkthrough** — the isometric dollhouse. Click a room (or its label, or a chip)
and the camera eases in, the room lifts out of the palette and the detail panel
shows its material palette. The previous/next buttons browse every room on the current
floor. `Walls` raises the walls to full height and glazes the windows; `Furniture`
toggles furnishings; `Labels` clears the annotations for an unobstructed view.

**Design notes** — the design brief, room by room: the idea, the materials,
and how each space is lit. Each material study includes a floor locator drawn from
the room coordinates. `Read the design story` opens the selected room's article;
`Explore this room` returns to its 3D view.

**Floor plan** — a top-down view that preserves your wall, furniture, and label settings.
Drag to pan; room and floor changes keep the top-down orientation.

**The day** — the slider runs 05:00 to 23:00. The sun swings round and changes colour,
lamps warm up at dusk, the whole interface turns to evening, and Ethan and Mia move
through the house on their own timetable — coffee at the island at 08:24, sunbathing on
the balcony at two, a film on the sofa at eight. Weather (☀️ ☁️ 🌧️) re-lights the scene.
Morning, Golden hour, and After dark presets pause playback and set a specific time.

The interface pairs self-hosted Cormorant and Manrope fonts with abstract CSS material
samples. These samples illustrate material categories, not exact product finishes.
Font licenses are included in `assets/fonts/`. Entry and camera animations respect
the device's reduced-motion preference.

## The design

**Ground floor** — foyer · living · dining · open kitchen with island · wet kitchen ·
laundry · powder room · study/guest · stair · porch and garden.

**First floor** — master · master bath with a freestanding tub · walk-in wardrobe ·
family hall · bedroom 2 · kids' room · common bath · utility · landing · balcony.

Some of the moves: the living room's sofa floats off the wall so a walking loop runs
behind it; the kitchen island doubles as the family's second table and faces the dining
table so the cook is never shut away; the wet kitchen keeps the wok smoke behind fluted
glass; the family hall has no television, just a wall of books and a big rug; the master
keeps a 1.5 m bay window seat as the quietest corner of the house; the kids' room pushes
all its furniture to the walls to leave the floor free.

Every room's note, palette and furniture list lives in `src/design.js` — that single
file is the design document, and the model is generated from it.

See [the interior design review](docs/interior-design-review.md) for measured
circulation conflicts, room-access issues, and the proposed order of revisions.
The existing plan is a concept study with unresolved spatial coordination.

## How it is built

```
index.html          the interface: tabs, chips, detail card, day bar
src/design.js       THE DESIGN - rooms, palette, notes, furniture, residents
src/build.js        soft rounded volumes, and walls derived from the room plan
src/furniture.js    35 pieces of furniture, all soft-cornered
src/house.js        assembles one floor: plinth, floors, walls, windows, furniture
src/people.js       Ethan and Mia
src/labels.js       HTML room labels pinned to the model
src/materials.js    material studies and room-location diagrams
src/styles.css      typography, textures, responsive layout and motion
src/main.js         scene, camera, day cycle, interaction
assets/fonts/       self-hosted fonts and SIL Open Font Licenses
vendor/three/       three.js r169 (module build, OrbitControls, RoundedBoxGeometry)
```

Walls are never authored by hand: each room is a rectangle, every room edge becomes a
wall, shared edges merge, and the doors listed in `design.js` punch the openings. Move a
room boundary and the walls follow.

Everything is modelled in feet and scaled by 0.3048 at the root, so the scene is metric
while the design reads in the units it was drawn in.

## Deploying

Static, no build step. `vercel.json` sets it up for Vercel (`framework: null`, output
directory `.`), so a dashboard import works with no further settings.

**Production always tracks `main`.** The control that decides this is in the Vercel
dashboard, not this repo: *Project → Settings → Git → Production Branch → `main`*. Vercel
seeds that field from the repository's default branch when the project is created and
then keeps its own copy, so check it rather than assuming it followed a later change.
Every other branch gets a preview URL instead.

`vercel.json` also carries `git.deploymentEnabled: { "main": true }`, which pins `main`
as a deploying branch. Note that the CLI ignores all of this: `vercel --prod` promotes
whatever is in your working directory from any branch, as does the *Promote to
Production* button on a deployment. Use plain `vercel` for previews and let Git drive
production.
