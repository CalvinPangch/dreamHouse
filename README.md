# Dream House — Double Storey Terrace (双层排屋) 3D Model

An interactive [three.js](https://threejs.org) model of the double storey terrace house
from the sales brochure: a row of gable-roofed units on 21' × 60' and 23' × 60' lots,
4 bedrooms / 3 bathrooms, with the car porch, gated frontage and streetscape modelled.

No build step, no npm install — open it on any static server.

```bash
npx http-server -p 8080      # or: python3 -m http.server 8080
# then open http://localhost:8080
```

> Opening `index.html` straight from the file system will not work: ES modules and
> import maps need an `http://` origin.

## Deploying to Vercel

The repo is a static site with no build step, and `vercel.json` configures it as such
(`framework: null`, output directory `.`), so a deploy needs no dashboard settings.

### Continuous deployment (GitHub Actions)

`.github/workflows/deploy.yml` deploys on every push:

| Branch | Result |
| --- | --- |
| the repository's default branch | production deployment |
| any other branch | its own Vercel preview URL |

Each run first serves the site and loads it in headless Chromium
(`scripts/smoke.mjs`): it walks all seven views, checks every asset responds and
that each frame actually rendered geometry, and fails on any console error or
uncaught exception. A static site returns 200 even when the scene is broken, so
nothing deploys until that passes. Screenshots of every view are attached to the
run as an artifact, and the deployment URL is printed in the run summary.

**One-time setup** — add three repository secrets under
*Settings → Secrets and variables → Actions*:

| Secret | Where it comes from |
| --- | --- |
| `VERCEL_TOKEN` | Vercel → *Account Settings → Tokens* → create a token |
| `VERCEL_ORG_ID` | run `vercel link` locally, then read `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | same file |

```bash
npm i -g vercel
vercel link          # creates .vercel/project.json (gitignored)
cat .vercel/project.json
```

> **Pick one deploy path.** If you *also* connect the repo in Vercel's dashboard,
> both Vercel's Git integration and this workflow will deploy every push, giving
> you two deployments per commit. Either skip connecting the repo to Git in
> Vercel (the token-based workflow doesn't need it), or turn Vercel's own
> trigger off by adding `"git": { "deploymentEnabled": false }` to `vercel.json`.

### Deploying by hand

**From the CLI**

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production
```

**From the dashboard** — *Add New… → Project*, import `CalvinPangch/dreamHouse`, and
deploy. Leave Framework Preset on *Other* and the build/output fields empty; `vercel.json`
supplies them. Pick the branch you want under *Settings → Git → Production Branch*
(this work lives on `claude/threejs-3d-model-layout-p3k263`; every branch also gets its
own preview URL automatically).

`vercel.json` also sets the caching the model wants: `vendor/` (three.js) is immutable
for a year, `src/` always revalidates, so redeploys ship your changes instantly while the
1 MB library stays cached.

There is deliberately **no `package.json` at the repo root** — that keeps Vercel on the
zero-install static path. The CI-only test dependency lives in `scripts/package.json`,
outside the directory Vercel inspects. If you add a root `package.json` later, make sure
it has no `build` script or set the build command to empty, otherwise the deploy will
fail looking for build output.

## What is modelled

| Brochure spec | In the model |
| --- | --- |
| 双层排屋 · Double storey terrace | Two 10' storeys, gable roof at 34°, party walls shared between units |
| 21'×60' & 23'×60' | Intermediate lots 21' wide, the two corner lots 23'; every lot 60' deep (6' rear yard + 34' built-up + 20' car porch) |
| 4 房 3 厕 · 4 bed 3 bath | Master + ensuite, bedrooms 2–4, common bath upstairs, powder room downstairs |
| Facade | White render, dark charcoal banding and gable trim, black-framed glazing, first floor cantilevered 6' over the porch on two columns |
| 围篱保安 · Gated & guarded | Boundary walls, per-lot piers and sliding gates, guard house and boom gate at the entrance |
| Streetscape | Paver driveways, cars, kerbs, walkway, road, street lamps, trees and hedges |

### Floor plans

**Ground floor** — car porch · living · dining · staircase · dry kitchen · wet kitchen /
yard · bathroom 1 · store.

**First floor** — master bedroom with master bath and recessed balcony over the porch ·
bedroom 2 · bedroom 3 · bedroom 4 · bathroom 2 · family area · corridor · stair void.

Units alternate handedness (mirrored pairs), the way a real terrace row is laid out.

## Controls

| | |
| --- | --- |
| Orbit / zoom / pan | drag · scroll · right-drag |
| Views | `1` street · `2` facade · `3` aerial · `4` cutaway · `5` ground plan · `6` upper plan · `7` interior |
| Panel | `h` hides it, `r` resets the camera |

The panel also toggles the roof, the first floor, room labels and furniture, sets the
number of units in the row (2–10), and drives a time-of-day slider that moves the sun,
recolours the sky and lights the windows at night.

Room labels are drawn on one unit only (the middle unmirrored one) so the plan views
stay readable.

## Layout of the code

```
index.html          page shell, control panel, import map
src/config.js       lot & storey dimensions (feet), palette
src/plan.js         the floor plans: wall segments, openings, rooms, furniture
src/build.js        wall/opening/railing/stair/label primitives
src/house.js        one unit: structure, both floors, roof, facade
src/terrace.js      the row of units
src/site.js         driveways, gates, road, landscaping, guard house
src/furniture.js    blocky furniture and cars
src/materials.js    shared materials
src/textures.js     procedural canvas textures (roof tiles, plaster, pavers, grass…)
src/sky.js          gradient sky dome shader
src/main.js         scene, lighting, views, time of day, wiring
vendor/three/       three.js r169 (module build + OrbitControls)
vercel.json         static deploy config (no build step, cache headers)
preview.png         social/OG preview image
scripts/smoke.mjs   browser smoke test run by CI before every deploy
.github/workflows/  deploy pipeline
```

Everything is authored in **feet**, matching the brochure; `main.js` scales the root
group by `0.3048` so the scene itself is metric.

### Changing the design

* Room sizes and doors/windows live in `src/plan.js` — wall segments are
  `{ x1, z1, x2, z2, openings: [{ at, w, type, sill, head }] }`, with `x` across the
  lot and `z` from the rear wall towards the street.
* Storey heights, lot widths, setbacks and the roof pitch are in `src/config.js`.
* Colours and finishes are in `src/materials.js` / `src/textures.js`.

Plans are drawn on the 21' lot and scaled across for the 23' corner lots.

### three.js source

`vendor/three` holds three.js r169 so the model runs offline. To load it from a CDN
instead, swap the two entries in the import map at the bottom of `index.html` for the
jsDelivr URLs noted in the comment above it.
