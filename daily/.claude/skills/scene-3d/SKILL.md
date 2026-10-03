---
name: scene-3d
description: Draw or redraw a daily background scene (daily/scenes/*.js) with real 3D perspective using world3d() from reference/scene-helpers.js, then run the element-by-element sanity check. Use for any new scene, perspective fix, or pool scene.
---

# Scene drawing with world3d

Hand-placed 2D "elevations" kept failing the user's eye: docks, houses and
mountains looked pasted on or bent. Every built, growing or floating thing is
now placed in **world metres** and projected by one camera. The reference is
`scenes/harbor-lighthouse-fall.js` (sky/clouds stay 2D; land is world3d).

## Camera and units
- `const w = world3d({ h, hy: WY, f: 2200, light, tone: T, fog, fogK, shadow, rim, night: NIGHT, lamp })`
- x right, y up, z away from the viewer; sea/ground level y = 0; camera at x=0, z=0.
- `h` eye height (3-8 m). `hy` = horizon screen y. Screen x = 1280 + f*x/z;
  water at distance z lands at y = hy + f*h/z (z=47 is the bottom edge at h=5).
- `yaw` in degrees turns a solid about its vertical; `Math.atan2(-x, z)` faces the viewer.

## Building blocks
- `w.terrain({ x0(z), x1(z), z0, z1, nx, nz, h(x,z), col(x,y,z,n), shade: .3 })`:
  heightfield, clipped at the waterline automatically. Shape coasts with a
  distance-inland function and `smoothstep`; keep slopes natural (rise over 30+ m),
  colour from smooth noise, never per-cell random alone.
- **Mountains and big far terrain: `w.raster({ z0, z1, top, bottom, h, col, tone: rgbTone(T), fog, fogK, step: .0011, scale: .75 })`**
  with `h = mountainField({ seed, scale, oct, peaks: [{ x, z, h, r | rx, rz }] })` and
  `col = mountainColor({ seed, snow, tree, goldK, forest, gold, rock, rock2 })`. Shaded per
  pixel (ridges, gullies, tree line, snow by slope), so no facets or stair-steps. Never draw
  mountains as polygon terrain or 2D silhouettes again. Pick a new seed and peak layout per
  scene; keep peaks out of the text corners (screen y = hy - f*h/z). Worked example:
  `scenes/golden-aspen-lake.js`.
- **Houses: `w.randomHouse(r, { x, z, yaw, rng, kind })` then `w.house(...)`** gives a varied
  style (gable, front gable, gambrel, saltbox, hip, shed), size, colours, porch, chimney and
  shutters. Hand-pin a field only when the subject needs it.
- `w.house({ x, z, y, yaw, w, d, h, rh, gable, wall, roof, trim, shut, chim, door, fy })`:
  windows, door, clapboards, trim, chimney, contact shadow. On slopes wrap in
  an `onGround()` helper (base = highest corner, foundation down to the lowest).
- `w.box`, `w.cyl` (frustum/cone, `n` sides, `rot`), `w.line(points, colour, widthM)`,
  `w.add(faces)` for custom solids (boat hull: see `boat()` in the harbor scene).
- `w.sprite({ x, z, y, fn(sx, sy, pxPerMetre, fog) })` for painterly 2D things
  (trees, boulders): drawn at the right size and depth, standing on `y`.
- `w.draw({ mirror: true })` inside a ripple filter after the water = correct
  reflections; then `w.draw()`. `w.proj([x,y,z])` for 2D overlays (beams, glows).
- Painter order is by nearest depth; a part that sits on another (cabin on a
  hull) sets `obj.key = base.key - .2` so it draws after.

## Variety (the user does not want the same designs over and over)
- Read `scenes/CATALOG.md` first. A new scene differs from every scene in its pool on at least
  three columns and does not reuse an "Overused" motif as its subject. Append its row.
- New seeds for every generator; vary eye height (2-40 m), focal length (1600-2800),
  horizon height and where the subject sits. Do not copy another scene's layout numbers.
- Repeated objects inside a scene come from generators (randomHouse, trees with varied
  ramps and heights), never one hand-made object copied.

## Sanity check (required; the user rejects work that skips it)
Render day and night, crop left / middle / right with PIL and look at each.
For every object answer and fix every "no":
1. What does it stand on? Ground, deck or water directly under it; nothing floats or overlaps.
2. Could it exist? Piers reach water and shore; boats in water, not on land or through piers.
3. Sizes agree with distance (the camera does this; check anything placed as a sprite).
4. Repeats varied (sizes, colours, roof types, yaw).
5. Night: lights and beams clear of the moon and the text corners (x 0-900 and 1500-2560, y 0-260).
