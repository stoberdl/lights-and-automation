# Perspective fix brief (one scene at a time)

You are redrawing an existing SVG scene so its depth looks natural. The user
said every scene's "3D" is off: mountains, docks and perspective "really off,
not natural". They like the subjects; fix how they are drawn.

Read first:
- `WEEKLY_PROMPT.md` section 5, especially **Depth and perspective**: these are
  the rules you are fixing toward.
- `reference\autumn-valley.png`: the approved look. Layered 2.5D: flat
  elevations in bands, depth from size, haze and overlap.
- The scene file and its current renders in `scenes\_drafts\` (if any).

Fix, in this order:
1. One eye-level camera. Anything drawn from above (tiled rock slabs, angled
   docks, roads seen from overhead) becomes an eye-level elevation, or a
   proper foreshortened plane toward one vanishing point on the horizon.
2. Size by baseline: `scale = (baseY - horizonY) / (refY - horizonY)` for every
   house, tree, boat, animal and rock.
3. Mountains: irregular ridgelines, 2-4 ranges with atmospheric fade, lit and
   shaded faces split along ridges, snow following terrain. No paper
   triangles, no symmetric cones.
4. Reflections directly below, flipped about each object's waterline.
5. Building side walls only toward the centre, narrow.
6. Contact shadows and base lines so nothing looks pasted on.

Keep the subject, palette, the day/night switch (`opts.time`), the part
switch (`opts.part`), the one-top-level-function format, and calm text
corners (x 0-900 and 1500-2560, y 0-260). No people, no rain or snow falling.

**Sanity check, element by element (the user rejected a pass that skipped
this).** After each render, crop and open close-ups (left third, middle,
right third, and anything structural) with PIL, and for every object ask:
- What is it standing on? Is there ground, grass, rock or water directly
  under its base, with a contact shadow? Nothing hangs on a wall face or
  floats.
- Could it exist? A pier needs water under it and a way to reach it; a shore
  needs the land to meet the water at a believable height; rocks are rounded
  boulders or ledges, never a staircase of rectangles.
- Is it repeated? Vary copies (size, shape, roof pitch, colour, detail).
- Night: does any beam, glow or light cross the moon or the text corners?
Write the answers down and fix every "no" before reporting.

Render day and night one at a time with
`powershell -NoProfile -ExecutionPolicy Bypass -File render.ps1 "scenes\test-<slug>.html[?time=night]" "scenes\_drafts\<slug>-day|night.png"`
(write the test page if missing; copy `scenes\test-covered-bridge-creek.html`
and keep the `?time=` pass-through). Check against the rules and the autumn
valley. At most 3 fix rounds. Never delete files; edit only the scene file and
its test page.

Report in 3 lines: what changed, whether day and night render, any weakness
left.
