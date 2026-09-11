# Dream House — Double Storey Semi-Detached (双层半独立式洋房) 3D Model

An interactive [three.js](https://threejs.org) model built from the architect's floor
plan: a double storey semi-detached pair, 29'11" × 47'10" built-up per unit on a
40' × 80' lot, 4 bedrooms and 4 bathrooms, with the car porch, balcony, flat RC roof,
gated frontage and streetscape modelled.

> An earlier version of this project modelled the double storey **terrace** house from
> the sales brochure (6-unit row, 21'/23' × 60' lots). It is still in the history at
> commit `2351b92` / local tag `v1-terrace` if you want it back.

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
supplies them. Production deploys from `main`; every other branch gets its own preview URL
automatically (change this under *Settings → Git → Production Branch*).

`vercel.json` also sets the caching the model wants: `vendor/` (three.js) is immutable
for a year, `src/` always revalidates, so redeploys ship your changes instantly while the
1 MB library stays cached.

There is deliberately **no `package.json` at the repo root** — that keeps Vercel on the
zero-install static path. The CI-only test dependency lives in `scripts/package.json`,
outside the directory Vercel inspects. If you add a root `package.json` later, make sure
it has no `build` script or set the build command to empty, otherwise the deploy will
fail looking for build output.

## What is modelled

Both dimension chains on the drawing close exactly, and the model uses them directly:

| Plan dimension | Value | Where it goes |
| --- | --- | --- |
| Unit width | 29'11" | 11'0" + 5'5" + 13'6" on the ground floor; 5'11" + 12'0" + 12'0" upstairs |
| Built-up depth | 47'10" | 14'10" (rear rooms) + 5'3" (bathrooms) + 10'0" (dining) + 17'9" (living) |
| Car porch / balcony | 16'5" | in front of the built-up area, balcony directly over the porch |
| Lot | 40' × 80' | 10'1" side garden beside each unit, so a pair occupies 80' of frontage |

Other features taken from the drawing: the **RC ROOF** — the rear strip beside the party
wall is single storey, with a flat concrete roof, a parapet and the air-conditioner
condensers on it — the recessed **balcony** over the car porch with its privacy wall on
the party line, the side and rear **terraces**, and two cars parked side by side in the
porch.

The roof is a single pitch per unit falling from a ridge over the party wall to the
outer eave, which is what makes the pair read as one symmetrical gable from the street.

### Floor plans

**Ground floor** — kitchen · yard · bedroom 4 + B/WC 4 · utility · store · stairs ·
dining · living · car porch.

**First floor** — master bedroom + B/WC 1 · wardrobe · bedroom 2 + B/WC 2 ·
bedroom 3 + B/WC 3 · family hall · corridor · stair void · balcony · RC roof.

The two halves of each pair are mirrored about the shared party wall, as drawn.

### What I had to infer

The drawing dimensions the envelope and names the rooms but does not dimension every
internal partition, so a few things are my reading of it rather than measured:

* exact positions of internal doors and windows;
* the split of the service band into utility / B/WC 4 / store, and of the master suite
  into bedroom, wardrobe and B/WC 1;
* storey heights (10'6" ground, 10'0" first) and the 22° roof pitch, none of which are
  on the plan;
* wall thicknesses (9" external, 5" internal).

All of it lives in `src/plan.js` and `src/config.js` — send me corrected dimensions and
they are a one-line change each.

## Controls

| | |
| --- | --- |
| Orbit / zoom / pan | drag · scroll · right-drag |
| Views | `1` street · `2` facade · `3` aerial · `4` cutaway · `5` ground plan · `6` upper plan · `7` interior |
| Panel | `h` hides it, `r` resets the camera |

The panel also toggles the roof, the first floor, room labels and furniture, sets how
many semi-detached pairs stand on the street (1–4), and drives a time-of-day slider that
moves the sun, recolours the sky and lights the windows at night.

Room labels are drawn on one half of the first pair only — the unmirrored one, so the
labelled plan reads the same way round as the drawing.

## Layout of the code

```
index.html          page shell, control panel, import map
src/config.js       lot & storey dimensions (feet), palette
src/plan.js         the floor plans: wall segments, openings, rooms, furniture
src/build.js        wall/opening/railing/stair/label primitives
src/house.js        one unit: structure, both floors, roof, facade
src/estate.js       mirrored pairs and the street of pairs
src/site.js         lots, driveways, terraces, gates, road, landscaping
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
  `{ x1, z1, x2, z2, openings: [{ at, w, type, sill, head }] }`, with `x` measured from
  the party wall and `z` from the rear wall towards the street.
* Band boundaries (`Z`), key offsets across the unit (`X`), storey heights, lot sizes
  and the roof pitch are in `src/config.js`, written as feet + inches via `fi(14, 10)`.
* Colours and finishes are in `src/materials.js` / `src/textures.js`.

### three.js source

`vendor/three` holds three.js r169 so the model runs offline. To load it from a CDN
instead, swap the two entries in the import map at the bottom of `index.html` for the
jsDelivr URLs noted in the comment above it.
