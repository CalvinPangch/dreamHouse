# 暖阳半院 · Sunny Half House

An interior design for a double storey **semi-detached** home, presented as a warm,
illustrated 3D dollhouse you can walk around, light up and read.

Two floors, twenty rooms, 30' × 48' per floor (2,400 sq ft built-up), designed in a
cream "Japandi" palette — oak, oat, clay and sage.

```bash
python3 -m http.server 8080     # or: npx http-server -p 8080
# then open http://localhost:8080
```

> Serve it over `http://` — ES modules and import maps don't run from `file://`.

## What's in it

**全屋漫游 / Roam** — the isometric dollhouse. Click a room (or its label, or a chip)
and the camera eases in, the room lifts out of the palette and the card on the right
tells you what it's made of. `完整墙体` raises the walls to full height and glazes the
windows; `家具` strips the furniture out to read the plan.

**房间手记 / Room notes** — the design brief, room by room: the idea, the materials,
and how each space is lit.

**户型图 / Floor plan** — straight down, walls cut, labels on.

**The day** — the slider runs 05:00 to 23:00. The sun swings round and changes colour,
lamps warm up at dusk, the whole interface turns to evening, and 小禾 and 小满 move
through the house on their own timetable — coffee at the island at 08:24, sunbathing on
the balcony at two, a film on the sofa at eight. Weather (☀️ ☁️ 🌧️) re-lights the scene.

## The design

**Ground floor** — 玄关 foyer · 客厅 living · 餐厅 dining · 西厨 open kitchen with island ·
中厨 wet kitchen · 洗衣房 laundry · 客卫 powder room · 书房 study/guest · 楼梯 stair ·
停车与庭院 porch and garden.

**First floor** — 主卧 master · 主卫 master bath with a freestanding tub · 衣帽间 walk-in ·
家庭厅 family hall · 次卧 bedroom 2 · 儿童房 kids' room · 公卫 common bath · 家政间 utility ·
楼梯厅 landing · 阳台 balcony.

Some of the moves: the living room's sofa floats off the wall so a walking loop runs
behind it; the kitchen island doubles as the family's second table and faces the dining
table so the cook is never shut away; the wet kitchen keeps the wok smoke behind fluted
glass; the family hall has no television, just a wall of books and a big rug; the master
keeps a 1.5 m bay window seat as the quietest corner of the house; the kids' room pushes
all its furniture to the walls to leave the floor free.

Every room's note, palette and furniture list lives in `src/design.js` — that single
file is the design document, and the model is generated from it.

## How it is built

```
index.html          the interface: tabs, chips, detail card, day bar
src/design.js       THE DESIGN - rooms, palette, notes, furniture, residents
src/build.js        soft rounded volumes, and walls derived from the room plan
src/furniture.js    35 pieces of furniture, all soft-cornered
src/house.js        assembles one floor: plinth, floors, walls, windows, furniture
src/people.js       小禾 and 小满
src/labels.js       HTML room labels pinned to the model
src/main.js         scene, camera, day cycle, interaction
vendor/three/       three.js r169 (module build, OrbitControls, RoundedBoxGeometry)
```

Walls are never authored by hand: each room is a rectangle, every room edge becomes a
wall, shared edges merge, and the doors listed in `design.js` punch the openings. Move a
room boundary and the walls follow.

Everything is modelled in feet and scaled by 0.3048 at the root, so the scene is metric
while the design reads in the units it was drawn in.

## Deploying

Static, no build step. `vercel.json` sets it up for Vercel (`framework: null`, output
directory `.`), so `vercel --prod` or a dashboard import both work with no settings.
