# Interior design review — Sunny Half House

Reviewed 12 September 2026. Scope: both furnished floor plans, room programme,
materials, lighting narrative, and agreement between the notes and the model.

## Overall assessment

The warm oak, linen, plaster and muted green palette gives the home a coherent
identity. The generous living room, kitchen/dining relationship, separate wet kitchen,
and television-free family hall make a convincing domestic concept. The material
studies and room locators now explain that concept more clearly.

The plan still needs spatial coordination. In particular, the kitchen and wardrobe
have furniture arrangements that prevent normal circulation. Do not treat the
polished presentation as evidence that these layouts have been resolved.

## Method and limits

Measurements below use the actual generated furniture bounds, including worktop
overhangs, transformed into the room coordinate system. Dimensions in the design
data are feet; metric conversions use 0.3048. These are model-space measurements,
not surveyed site dimensions. Wall thickness and door swings can reduce usable
clearance further. Doors are represented as openings, without swing envelopes.

Source: `src/design.js`, furniture geometry in `src/furniture.js`, and floor/wall
assembly in `src/house.js`. Both floors were inspected in the browser in top-down
view, with labels off and furniture visible.

## Priority findings

| Priority | Finding and evidence | Proposed correction |
| --- | --- | --- |
| High | **Open kitchen: unusable side aisle.** The side-counter worktop ends at x=1.99 ft; the island worktop starts at x=2.15 ft. The gap is only 0.16 ft, approximately **49 mm**, where they overlap in depth. The rear counter also spans the wet-kitchen opening at z=12, x=6.5–9.5. | Replan the whole kitchen arrangement around the wet-kitchen door, appliance operation and circulation. Test a smaller island or peninsula after reserving those routes. Do not shrink the model's people or ignore worktop overhangs to make the layout appear to fit. |
| High | **Walk-in wardrobe: obstructed circulation and entrances.** The island spans x=2.9–8.1 ft; the cabinet faces are at x=1.95 and 9.05 ft. Each side gap is 0.95 ft, approximately **290 mm**. The east cabinet occupies the landing opening at x=11, z=14–17. The north cabinet overlaps the Bedroom 2 opening at z=12, x=3–6. | Remove the central island in the next layout revision and reserve the door routes before laying out cabinet runs. Resolve whether this is a private dressing room or shared circulation. |
| High | **Bedroom 2 and common-bath access need replanning.** Bedroom 2's only opening leads into the walk-in wardrobe, and its desk spans x=0.5–5.5, z=9.8–11.8, immediately in front of the opening at z=12, x=3–6. The common bath is reached through the utility room. | Provide a coherent shared route from the landing to bedrooms and the common bath. Move the desk clear of the bedroom entrance. This is a plan decision, not a decorative adjustment. |
| High | **Parking does not fit the drawn porch.** Both cars are 13.6 ft long, spanning z=37.2–50.8. The porch spans only z=40–48: each car projects **2.8 ft / 853 mm** into the house footprint and the same distance beyond the outer boundary. | Establish the actual site, access and parking envelope before resizing the forecourt or changing parking orientation. Keep the entrance route separate from parked vehicles. |
| High | **Master-bath tub crosses the room boundary.** The tub spans z=35–41, while the bathroom ends at z=40. It extends **1 ft / 305 mm** through the bathroom boundary toward the balcony. | Reposition or rotate the tub within the bathroom, then coordinate access around it with the basins, shower and window. |
| Medium | **Common bath: entry and privacy claims are unresolved.** The basin spans z=5.5–7.3, beyond the room boundary at z=7, and overlaps part of the doorway's x=14–16.5 range. The model has no separate WC compartment or external basin zone despite the note promising three simultaneous private uses. | Reposition the basin clear of the entry. Either design the separate compartments and their access, or describe this as a compact shared bathroom. |
| Medium | **Stair and landing are schematic.** The stair builder uses 12 steps at fixed 0.75 ft vertical increments, independent of the 10.4 ft storey parameter. The landing contains another stair object rather than a coordinated floor opening, and only intermittent rail posts are modeled. | Coordinate stair rise, run, landing, floor opening, headroom and continuous guarding as one assembly before treating the model as a resolved interior. |
| Medium | **Daylight and lighting are illustrative.** Window glass is added onto the full-height wall geometry; the window definitions do not cut voids in those walls. The sun cycle has no site orientation or location input. Several room notes describe lighting layers that are not individually modeled. | Coordinate actual window openings and distinguish proposed lighting from rendered fixtures. Use the lighting presets for mood comparison, not daylight-performance conclusions. |

## Programme and narrative corrections included in this commit

- Corrected the overview from four bedrooms/four bathrooms to **three bedrooms plus
  a study, and three bathrooms**. The study's daybed gives guest flexibility but
  does not make it a fourth dedicated bedroom.
- Clarified area: two 30 × 48 ft footprints total 2,880 sq ft; subtracting the
  30 × 8 ft porch and balcony leaves the stated **2,400 sq ft enclosed programme**.
  This is simple model-area arithmetic, not a measured net-area calculation.
- Removed the master-bath note's incorrect claim that a floor fall clears steam.
  Drainage and ventilation serve separate functions; the review does not assign
  an unverified drainage specification.

## Material and lighting direction to retain

Keep the main living spaces visually connected with a consistent oak finish and use
linen, woven textures and restrained green accents for variation. Let the kitchen
and bathrooms introduce more durable surfaces without turning every room into a
different colour scheme. The current material boards are abstract illustrations,
not product or finish specifications.

Preserve the intention of layered lighting: useful task light at worktops and desks,
reading light near seats and beds, and softer ambient light elsewhere. The family
hall's quieter reading/play identity is a useful contrast to the ground-floor living
room. Coordinate fixture positions with the revised furniture layout.

## Revision order

1. Resolve shared circulation, bedroom/bathroom access, stairs and the site/porch envelope.
2. Refit kitchen cabinetry, wardrobe storage and bathroom fixtures around clear routes.
3. Coordinate windows and lighting with the revised furniture plan.
4. Finalize finishes and align every room note with the agreed design.

This commit records the review and corrects the programme/narrative facts. It does
not silently change room boundaries, door locations, stairs or parking assumptions.
Those layout findings remain open.
