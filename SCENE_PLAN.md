# Scene rework plan

Everything below is about the **background scenery** (`#sky`) and the
**theme artwork** (`.hero-art`) in `Desktop\Lights\index.html`.

Written because the last four attempts added props to a 130px strip and
called it a landscape. The props were never the problem.

---

## Why it currently looks cheap

Four causes, in order of how much damage each does.

**1. There is no room.** The bar deck occupies y=104–590 of a 720px screen.
That leaves **130px of open ground** and 104px of open sky. Every prop is
either crammed into the letterbox or muted behind translucent glass. No amount
of detail survives that.

**2. Each prop is an independent sticker.** Every object is its own `<svg>` at
its own arbitrary size, absolutely positioned. They do not overlap in a
composed way, do not share a horizon, and do not share a light direction. A
sticker sheet, not an illustration.

**3. Nothing is lit.** Every prop is a single flat `currentColor` fill. Real
silhouette art has a lit edge and a shadowed body, and sits in a contact
shadow where it meets the ground. Flat fills read as clip-art at any level of
detail.

**4. The detail that exists is at the wrong scale.** A tree is three circles
and a fork. Fine at 40px; embarrassing at 400px, which is the size they are
now.

---

## The four steps

Do them in this order. Steps 2–4 are close to worthless before step 1.

### Step 1 — Reclaim the space *(root cause)*

| | now | after |
|---|---|---|
| deck top | 14.4% (104px) | 13.3% (96px) |
| deck bottom | 82% (590px) | 73.3% (528px) |
| open ground | **130px** | **192px** (+48%) |
| open sky | 104px | 96px |

Where the 62px comes from:

- `html.bar .view .panel` padding `.85rem 1rem` → `.7rem .9rem` (−5px/panel)
- `html.bar .bar-con .console-out` line-height 1.6 → 1.5
- prompt chips from 2 rows to 1 (`nth-child(n+2)` hidden)
- `.bar-now .acts` button height 58 → 54px

**Cost:** the console loses roughly one visible transcript line (9 → 8).
**Acceptance:** the console idle readout still fits without scrolling; every
tap target stays ≥44px; run the hit-test probe again to confirm.

**If the deck height turns out to be untouchable**, skip this and do 2–4
inside 130px. It will help but will not fully fix it — say so rather than
pretending otherwise.

### Step 2 — One composed scene, not thirty stickers

Replace the ~30 individually positioned `.prop` divs per season with **one
authored `<svg viewBox="0 0 2560 320">`** per season, `preserveAspectRatio
="xMidYMax slice"`, spanning the full width.

Inside it, three `<g>` bands with real composition:

```
<g class="band-far">   small, pale, hazy, sits ON the ridge line
<g class="band-mid">   the body of the scene
<g class="band-near">  large, dark, runs off both edges and the bottom
```

Rules that make it a picture rather than a row:

- **One horizon path** shared by all three bands, drawn once, that every
  object's base sits on — not each prop guessing its own `bottom:2vh`.
- **Deliberate overlap.** Objects must occlude each other. A tree in front of
  the barn, a headstone half behind another. Currently nothing overlaps.
- **Irregular rhythm.** Cluster 3–4 objects, leave a gap, then 1. Even spacing
  is what makes it read as a toolbar.
- **Negative space over the middle.** Keep x≈1000–1700 sparse so the busiest
  panels sit over quiet ground.

**Bonus:** ~30 DOM nodes and 30 style recalcs collapse into 1 per season.

### Step 3 — Light it *(highest quality-per-line change)*

Every object gets three parts instead of one fill:

1. **body** — the base ink
2. **lit edge** — a lighter stroke/shape on the side facing the sun or moon,
   one consistent direction per scene (autumn: upper-left; halloween: upper-
   right, from the moon)
3. **contact shadow** — a soft ellipse under it on the ground

Plus **atmospheric perspective** as a real gradient, not the current
`opacity/blur` hack: far band tinted toward the sky colour via
`color-mix(in srgb, var(--ink-prop) 45%, var(--sky-1))`.

The moon/sun position is already known per mood, so the lit edge can flip with
it. That one detail is what will make it look drawn rather than assembled.

### Step 4 — Then, and only then, detail

Per season, in priority order:

- **autumn** — bark texture on trunks; individual leaf clusters at the canopy
  edge instead of smooth circles; weathervane and plank lines on the barn;
  corn tassels; a fence that follows the horizon instead of being a straight
  bar; pumpkins in the field
- **halloween** — shingles and window mullions on the house; a sagging porch;
  inscriptions on the headstones; a broken fence section; a cat on a stone;
  a witch crossing the moon (one slow pass every ~40s)
- **winter** — snow *sitting on* branches rather than a triangle over them;
  footprints; icicles on the cabin eaves; woodpile
- **spring** — individual blossoms at the canopy edge; a stream; lambs

---

## Hero / quick-apply artwork

Same three problems, same fixes, smaller. After step 3 lands on the
background, port the lit-edge + contact-shadow treatment to `ART_OBJECTS`, and
give **fall its own art family** — it currently borrows `desert`, which is why
the Fall key shows cacti. New `autumn` entry in `SCENE_ART` with turning
trees, a fence and a haystack.

---

## Already fixed (2026-09-08)

- **Flashing** — `flicker`/`strobe` drove the whole artwork's opacity 0.3↔0.95
  three times a second. Removed; replaced with one 9–12s 85%↔100% warm-up on
  the two light-source families. Lit windows, jack-o'-lantern faces and
  Christmas bulbs calmed the same way.
- **Red autumn hill** — `--leaf-2` was `#b0592a` (red-brown) running into the
  pasture gradient's two hardcoded greens. Now dry gold → olive
  (`#dcc264`/`#a89442`/`#7d6b2c`), with all three ridges overridden. Red stays
  on the trees, which have their own colours.
- **Rain that would not clear** — `rained_within(3)` kept the rain theme for
  three hours after a twenty-minute shower. Now `rained_within(0.4)` ≈ 25 min.
- **Rain that would not clear, properly this time** — the shorter window was
  treating a symptom. Home Assistant's `condition` is a summary of the hour's
  character, not an observation of water: it read `rainy` for **5h 31m** on a
  day it rained for twenty minutes, and stuck there. `weather.py` now gates
  every wet condition on the hourly forecast's `precipitation` in mm
  (`WET_MM = 0.1`) before it counts as rain, in both `observe()` and
  `rain_expected_within()`. The memory moved to a new key (`last_rain`) so the
  bad stamps already on disk are never read again, `raining_now()` requires the
  confirmation, and the "Rainy day → rain blues" automation dropped from a
  3-hour window to 1. When the forecast is unavailable the condition is still
  believed — missing real rain is the worse of the two mistakes.
- **Art that did not match its own word** — five families. `fall` matched the
  *desert* row, so the Fall key showed cacti; `glow` (reading) and `sky`
  (bluesky) were routed to art families **that did not exist**, so both themes
  rendered as an empty panel; `cozy` fell through to `fire`, a campfire on open
  ground; `romantic` shared the flower meadow with cherry blossom. New
  `autumn`, `glow`, `sky`, `hearth` and `romantic` families — and three of them
  are **rooms, not landscapes**, which is the point: not every theme is a hill.
- **Keys that read as black rectangles** — the darker families are warm amber
  light in the room, but at 216×74 Candlelight and Cozy were unreadable. The
  quick-apply key now washes the artwork with the theme's own first colour, so
  a key looks like the light it applies.
- **Every season standing on the same three domes** — `.pasture`'s
  `border-radius` was written once and never overridden, so all four seasons
  were one silhouette in four palettes. Each has its own horizon now: autumn
  broad and low (the trees are the subject, not the ground), winter **flat**
  (snow settles level — a rolling snow dome is summer painted white), spring
  the gentlest roll and the tallest, Halloween a bleak flat with one rise.
  The green ground-glow and green foot-shade in `box-shadow` are overridden
  per season too — they were putting a green halo under a snowfield.
- **The autumn scene was a farm** — barn, silo, corn, scarecrow, haystacks.
  That is *harvest* imagery, not autumn imagery: it reads as one specific day
  in September rather than as the season, and every one of those props was
  standing in the space the trees needed. It is a wood now — two broadleaf
  shapes plus a bare one so it is not one tree stamped nine times, clustered
  in two stands with a gap, scattered leaf litter, and a fallen log in the
  quiet middle.
- **Trees whose canopies were all behind the glass** — on the bar only the
  bottom ~190px of the 320-unit scene frame is not covered by the deck, so a
  tree at scale 1 contributed a bare trunk and nothing else. That is why a wood
  rendered as an empty field. Mid trees now sit at ~0.5, which puts the whole
  tree inside the visible strip.
- **Autumn read as a desert** — and this had been wrong in *both* directions.
  Rust `#b0592a` made a muddy hill; the fix went to wheat gold, and gold hills
  under a low warm sun is a dune field. Then olive-green, which stopped being a
  desert by stopping being autumn.
  The distinguishing thing is **contrast, not hue** — a desert is one smooth
  warm gradient under a warm sky; a wood in October is warm canopies against a
  *cold* sky, over a floor that falls away to near-black, cut up by dark
  trunks. Same oranges, different picture. So the ground is amber → russet →
  **`#291608`**, that last near-black stop doing most of the work; the sky is
  cool grey-blue; the scene bands are warm dark browns; and the saturated
  colour lives in the canopies and the leaf litter, never in a flat field.
- **Devices split three ways** — on the bar it is one list (lit, then dark,
  then no-reading) with counts on one status line. Every card already states
  its own condition. Desktop view unchanged.

---

## Order of work

1. Step 1 (space) — small, mechanical, unblocks everything
2. Step 3 (lighting) on the *existing* props — proves the approach cheaply
3. Step 2 (composition) per season, autumn first, then halloween
4. Step 4 (detail) per season, same order
5. Port to hero art; add the `autumn` art family

Check each step against a 2560×720 screenshot **and** a 1600×1000 desktop
screenshot before moving on — the two crop very differently and the bar is the
one that has been wrong.
