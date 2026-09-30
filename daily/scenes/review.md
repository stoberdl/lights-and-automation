# Scene review: halloween-hollow, hunters-moon-lake, winter-aurora-cabin

Checked against WEEKLY_PROMPT.md section 5, one line per rule, then side by side with
`reference/autumn-valley.png` (section 6). Each scene was rendered at 2560x720 with
`render.ps1` from its test page (`scenes/test-<slug>.html`, `part` unset). Close-ups were
rendered through `scenes/zoom.html` for inspection only. Earlier renders are in `scenes/_drafts/`.

Fix budget (section 6.4: at most two fix-and-re-render passes) was used in full on all three.

---

## 1. halloween-hollow.js — `halloweenHollowArt(opts)` — **FAIL on one rule (mountains)**

Moonlit Victorian house with a tower on a knoll, a gnarled oak with a hanging lantern,
gravestones, a pumpkin patch, corn shocks, a far farmhouse, jack-o'-lanterns and bats
across a full moon.

| Rule | Result |
|---|---|
| Five or more depth layers, paler/bluer further back, haze between | PASS: sky > 2 mountain ranges > far forest > mid forest > fields > knoll/house > near meadow. Purple haze bands between them |
| Built from many small pieces, denser toward viewer | PASS: about 1,000 far/mid trees of 5-7 clumps each, 420 knoll grass strokes, 34 patch pumpkins, shingle scallops, siding lines, 70-clump bushes |
| Every mass lit (shadow/mid/highlight, one source) | PASS: the moon is the single key light. House wall gradient and roof planes, tower, pumpkin ribs, gravestones, clouds and trees are all toned from the moon side. Windows and lanterns add warm fill |
| Organic edges (turbulence filters) | PASS: `#hhLeafy`/`#hhLeafyS` on foliage, bushes and the oak; `#hhCloudy` on clouds |
| Small story details | PASS: tower weathervane, crooked shutter, porch rail, chimney, lantern posts, rickety fence, corn shocks, graves, lit farmhouse, bats |
| Finish: soft-light glow, faint rays, paper grain ~10% | PASS |
| No trees/bushes of one or a few circles | PASS: far trees use 7 blobs each, as in the reference |
| No plain triangle pines, esp. foreground | PASS: only small, tiered conifers in the forest bands, none in the foreground |
| No flat single-colour silhouettes > 60px | MARGINAL: the bottom-right foreground bush renders very dark (near-black clumps), though it is built from 70 toned clumps |
| **No mountains with vertical stripes / boxy plateaus** | **FAIL**: in the second (nearer) range, face edges drop straight down from each valley, which gives vertical seams and flat-topped blocks (clearest around x 1700-2300). I found this only after both fixes were spent. The same fault was found and fixed in hunters-moon-lake (see below); the fix is a one-line change to the two face polygons in `mountains()` |
| No rain/snow drawn | PASS |
| No people | PASS |
| Top-left 0-900 x 0-260 calm | PASS: sky, clouds and stars only |
| Top-right 1500-2560 x 0-260 calm | MARGINAL: the thin oak branch tips reach about y 205 between x 1500 and 1850. Fix 2 cut this down from about y 166 |
| Subject in x 900-1700, y 150-560, 250-500px tall | PASS: house from the spire (~y 180) to its base (y 474), about 290px, plus the oak beside it |
| Horizon between y 380 and 480 | PASS: about y 440-470 |
| Same wall as autumn-valley? | Mostly yes: the same layer stack, clump-built trees, patchwork fields, soft light and grain. The fault is the boxy front mountain range |

Fixes: (1) removed a stray facet that made dark "flags" on peaks, shortened the oak crown and re-hung the lantern on a real limb; (2) redrew the bats (they read as flat bars), shortened the oak's left limb so it no longer crosses the house, and lowered the crown again.

**Section 6.4 outcome:** it still fails after two fixes, so a copy is kept as
`scenes/_rejected/halloween-hollow.js`. `scenes/halloween-hollow.js` is left in place because this
task asked for it there. Suggested fix: in `mountains()`, change the two face paths from
`poly([...seg[i - 1], Fp, [L[0], B]])` / `poly([...seg[i], [R[0], B], Fp])` to
`poly([...seg[i - 1], Fp])` / `poly([...seg[i], Fp])`. Fx for the calendar: `stars-twinkle`, `smoke@1457,295` (chimney), `birds:bats` (fx_todo), `lanterns` box around the path.

---

## 2. hunters-moon-lake.js — `huntersMoonLakeArt(opts)` — **PASS (one caveat)**

A huge orange moon (r 150) rising behind far hills over a still lake. A wooded left shore with a
log cabin, dock and rowboat, a rocky pine point on the right, a canoe in the moon path,
geese crossing the moon, reeds and rocks in front.

| Rule | Result |
|---|---|
| Five or more depth layers with haze | PASS: sky > far range > near range > waterline tree band > lake with reflections > left/right shores > foreground rocks and reeds. Warm haze bands between them |
| Many small pieces | PASS: about 450 waterline trees, shore trees of 34 leaf clumps each, several hundred moon-path dashes, ripple streaks, reeds, dock planks and log courses |
| Every mass lit | PASS: backlit by the low moon. Every conifer, rock and mountain face is lit on the side toward x 1300 with a warm rim, and clouds are lit from below |
| Organic edges | PASS: `#hmLeafyS` on trees, `#hmCloudy` on clouds, `#hmRipple` displacement on the reflections |
| Small story details | PASS: cabin with lit window and chimney smoke, dock, moored rowboat, drifting canoe, geese, cattails |
| Finish | PASS: soft-light moon glow, faint rays (turned down in fix 1), paper grain at 10% |
| No one-or-few-circle trees | PASS |
| No plain triangle pines, esp. foreground | PASS WITH CAVEAT: the tall pine at x 2260 has 13 tiers, lit and shaded sides, a rim light, a trunk and a cast shadow under each tier. Up close the tiers read as overlapping scales, and the overall outline is still close to a cone. Better than a triangle, but not as clearly stepped as the winter spruces |
| No flat silhouettes > 60px | PASS: the cabin, big pine and rocks all have 3 or more tones plus a rim |
| Mountains faceted, no vertical stripes/plateaus | PASS after fix 1 (this is where the valley-seam fault was found and fixed) |
| No rain/snow | PASS |
| No people | PASS: the canoe and rowboat are empty |
| Top-left calm | PASS: stars and one cloud |
| Top-right calm | PASS: stars and one cloud. The big pine tops out at about y 275 |
| Subject in the box, 250-500px | PASS: moon disc about 300px, centre (1300, 318), bottom hidden behind the hills |
| Horizon 380-480 | PASS: waterline at y 470 |
| Same wall as autumn-valley? | Yes: the same painterly layer stack, clump trees and soft glow, recoloured for night |

Fixes: (1) mountain faces now end on a slanted foot instead of dropping vertically from the valley, the front range is taller and more jagged, the moon's maria are softened, and the rays are fainter; (2) conifer tiers are flared, with more layers and cast shadows, and the moon's crater ray burst was moved into view. Fx: `water-shimmer` band y 470-720 around x 1000-1600, `smoke@657,405`, `stars-twinkle`, `birds`.

---

## 3. winter-aurora-cabin.js — `winterAuroraCabinArt(opts)` — **PASS**

A snowbound log cabin in a spruce clearing under a three-curtain aurora. A small moon sits upper left of
centre. Snowy faceted mountains, snowy spruce bands, a woodpile, a toboggan, a stump with an axe, a
lantern, a fence, a trail with footprints, and a deer.

| Rule | Result |
|---|---|
| Five or more depth layers with haze | PASS: sky and aurora > far snowy range > near range > far spruce band > mid spruce band > clearing with cabin and big spruces > foreground spruces and shrubs. Teal haze between them |
| Many small pieces | PASS: about 800 aurora rays, 700 stars, a few hundred spruces, each with 3-8 tiers plus needle strokes and snow lumps, 220 wind ripples, stalks and rocks |
| Every mass lit | PASS: the moon at (930, 105) is the key light. Lit and shaded mountain faces and snow caps, spruce sides, log ends and roof snow are all toned from it, with a green aurora wash over the top |
| Organic edges | PASS: `#waLeafyS` on spruces, `#waLeafy` on shrubs, `#waCloudy`, and `#waAur` displacement on the curtains |
| Small story details | PASS: woodpile, toboggan, stump and axe, lantern, fence with snow caps, footprints, chimney smoke, icicles, deer, cast tree shadows |
| Finish | PASS: soft-light moon glow and aurora glow, faint rays, paper grain at 10% |
| No one-or-few-circle trees/bushes | PASS: shrubs are 80 clumps each |
| **Near conifers: tiered, jagged, lit/shaded, visible trunk, snow on tiers** | PASS: a new `spruce()` with stepped, flared tiers, drooping tips, a dark cast band under each tier, lit and shaded halves, a trunk, a snow shelf on every tier and snow lumps at the tips. This is the rule the earlier aurora night was rejected for |
| No flat silhouettes > 60px | PASS: the deer (about 100px) was redrawn in fix 2 with a lit neck and head, chest, ears and antlers |
| Mountains faceted, no vertical stripes | PASS: uses the corrected facet code, with snow caps split lit and shaded along the peak spine |
| No rain/snow drawn | PASS: snow lies on the ground and trees only. Nothing is falling |
| No people | PASS |
| Top-left calm | PASS: the aurora fades out by x 780. Only stars, the moon (x 930, just right of the zone) and a thin wisp remain |
| Top-right calm | PASS: the aurora fades from x 1530 and is gone by 1930. One cloud wisp remains, as in the reference |
| Subject in the box | PASS: the cabin and chimney (about y 300-556) with spruces at x 1040 and 1560 (tops about y 230-250). The group is roughly x 900-1700 |
| Horizon 380-480 | PASS: mountain feet at about y 430-460 |
| Same wall as autumn-valley? | Yes: the closest match of the three in density and finish |

Fixes: (1) narrowed the aurora out of both text corners, made the bead-like cloud wisps irregular, detailed the snowfield (ripples, stalks, rocks, tree shadows), added texture to the roof snow, and changed a sled that read as a red ladder into a toboggan; (2) redrew the deer. Fx: `aurora`, `smoke@1385,300`, `stars-twinkle`.

---

## Process notes
- `render.ps1` calls `Remove-Item` on an existing output PNG. To avoid ever triggering it, each earlier
  render was moved to `scenes/_drafts/<slug>-vN.png` with `Move-Item` before re-rendering.
- `render.ps1` leaves a full Edge profile folder `prof-<name>` in `daily/` for every output name
  (11 folders from this run, including the zoom renders). They were not removed, because deletion is not allowed here.
