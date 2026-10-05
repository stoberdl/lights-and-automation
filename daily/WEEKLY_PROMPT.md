# Daily Window: weekly build

You are building next week's backgrounds for the lights bar, the 2560×720
touch strip that shows the apartment dashboard. Each day gets a scene and a
short headline that answers "what's going on today". Work in
`C:\Users\user\Desktop\Lights\daily\`. Run unattended: nobody will answer
questions, so decide and log your reasons.

Read `..\CLAUDE.md` first for how the dashboard and lightd work. Do not edit
`..\index.html`, and never rewrite any file through PowerShell
`Get-Content`/`Set-Content`. Use your file tools.

---

## 1. The week

Cover the next 7 days, Monday to Sunday, starting from the next Monday after
today, unless the request names specific dates; then do exactly those dates.
The result goes into `days.json` (section 8). Keep every existing entry you
were not asked to rebuild, and never change a day marked `"locked": true`.

Location for anything local (sky, sunset, nature, weather) is the city, Ohio
(weather station the local station). Times are America/New_York.

## 2. What counts as news

Collect candidates for every day, then pick one headline per day (section 3).
Every candidate needs a source URL you actually opened, and a date you
confirmed there. **If you cannot confirm a date, drop the candidate.** A
blank ordinary day is fine; a wrong release date is not.

| Kind | Include | Where to confirm |
|---|---|---|
| `holiday` | Major US holidays, plus Lunar New Year, Diwali, Hanukkah, Día de Muertos, Halloween, the solstices and equinoxes. Countdown chips 30, 14 and 7 days out, and daily in the last 7. | timeanddate.com |
| `sky` | Named full moons, supermoons, eclipses visible from Ohio, meteor shower peaks, bright planets worth finding, ISS passes over the city after dark. | timeanddate.com, in-the-sky.org, NASA |
| `aurora` | Kp 6+ forecast for a night, meaning it might be visible this far south. | NOAA SWPC 27-day outlook, then re-checked on the day by the live layer |
| `game` | **Only these series:** World of Warcraft, Overwatch, League of Legends, Apex Legends, Slay the Spire, Borderlands, The Elder Scrolls (Skyrim etc.), Grand Theft Auto. Count launches, expansions and new seasons. The only other game allowed is a PC launch that is front-page news everywhere, at the size of a new GTA or Elder Scrolls. **When in doubt, leave it out.** The user rejected Aion 2, Gears of War: E-Day and Dragon Ball as noise. No sports games. | Steam store page, publisher news, the game's official site |
| `anime` | Premieres and season finales of shows that are genuinely big: in AniList's top 50 by popularity for their season. Prefer non-shonen. Use a shonen show only for a finale or premiere, and only if nothing else is on that week. Dragon Ball was rejected. | AniList (`graphql.anilist.co`), Crunchyroll schedule |
| `weather` | Notable days ahead in the forecast: first frost, first snow, a heat wave, a storm system. Live warnings are handled by the dashboard, not by you. | api.weather.gov for the local station / the city |
| `daylight` | Clock changes, the shortest and longest day, first sunset after 8 PM (or before 5 PM). | timeanddate.com |
| `nature` | What's happening outside around the city that week: blossom, fireflies, cicadas, leaf colour, geese heading south, first snowdrops. | Ohio DNR, extension services, general knowledge (mark as `approximate`) |
| `place` | A place in the world at its best this week: blossom season in Kyoto, Lofoten in the dark season, Venice during Carnival. | general knowledge; no date needed |
| `history` | A real anniversary with a strong picture (the Moon landing, first flight). | Wikipedia "On this day" |
| `fun` | Weird and fun holidays: National Cat Day, Talk Like a Pirate Day, Pi Day, May the 4th, Nacho Day. Pick ones with a picture worth drawing and a wink in the headline. **About once a week, never two in a row.** The user asked for these occasionally, for variety. | nationaltoday.com, checkiday.com (confirm the date) |

**No sports, ever.**

## 3. Picking each day's headline

Highest first:
1. `weather`: a notable forecast day
2. `holiday`
3. `sky` / `aurora`: something to see tonight
4. `game` / `anime`: releases
5. `place`
6. `nature`
7. `history`
8. `fun`: weird holidays. Can outrank `place`, `nature` and `history` about once a week, so a week does not go by without one; otherwise use them to fill a quiet day. Never two in a row.

**Variety is the point.** Within a week, avoid repeating a kind on back-to-back days where there is a choice, and spread the kinds out across the week.

The winner sets the scene and the headline. Up to two runners-up become
`chips`, short tags such as `"Orionid meteors still active"`. Countdown chips
come from `holiday`.

Balance the week. Most days should be landscapes, but no more than 3 in a
row with the same kind of subject. Aim for at least one night scene and one
non-landscape subject (a city, architecture, something close-up) each week.
Never repeat the same scene within 14 days; check the previous two calendar
files.

## 4. The scene for each day

Every day uses exactly one of these:

**a. Official art: game and anime days only.** The point is that you can
tell what it is before reading the title.
- Games: `https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/library_hero.jpg`, or the largest official key art from the publisher.
- Anime: AniList `bannerImage`. If it is under 1900px wide, look for an official key visual at least 2560 wide instead, and say which you used.
- Save it to `art\{date}-{slug}.jpg`. Set `focus`, the CSS background position that keeps the subject clear of the top-left and top-right text corners.
- Reject art that is mostly a logo or text, or that is under 1280px wide.

**b. A library scene.** Reuse any file in `scenes\` whose subject fits,
recoloured through its options (time of day, season) if it has them.
Never use `scenes\covered-bridge-creek.js` or `reference\autumn-valley.js`
for a day: they are the dashboard's default backgrounds, so a day built on
them looks like no scene at all. Do not reuse a scene that appears in
days.json within 7 days either side. Every day must end up with its own
picture; if no library scene fits, write a new one (c).

**c. A new illustrated scene.** Write it only when nothing in the library
fits and the day deserves one. At most **2 new scenes per week**, unless the
request gives a different limit. Each is a JavaScript file
`scenes\{slug}.js` in the same shape as `reference\autumn-valley.js`: exactly
one top-level function, named in camelCase after the file (for example
`harvestMoonArt`), that returns SVG, with `opts.part` of `"sky"`, `"clouds"`
or `"land"` so the page can animate the layers separately. Do not declare
anything else at the top level; the page evaluates the file together with
`reference\scene-helpers.js`, and a duplicate name breaks both. You may use
`rng()` and `mix()` from the helpers. `scenes\hunters-moon-lake.js` has the
mountain shading that fixed the "vertical seams" fault; copy its approach.

**Day and night.** The bar is on around the clock and switches to its night
look after sunset. Every illustrated day needs a night version: either the
same function drawing night when `opts.time === "night"` (moon for sun, lit
windows, stars, deep blue grading), or a separate night scene file. A day
without one gets a crude darkening filter, which looks bad; avoid it.

## 5. The art style (read this before writing any scene)

The target is **cartoony but high-fidelity**, like a storybook background.
`reference\autumn-valley.js` and `.png` are the standard. The user saw it and
said they could look at that style every day. Earlier attempts were rejected,
and the reasons are the rules below.

### What made the autumn valley work
- **Five or more depth layers:** sky → distant mountains → a far forest band → a mid forest band → fields and buildings → near meadow → the subject. Each layer further back is paler, bluer and lower in contrast, with a haze band between layers.
- **Built from many small pieces, not a few big ones.** The maple crown is about 950 small leaf clusters. The far hills are hundreds of tiny trees. Detail gets denser toward the viewer.
- **Every mass is lit.** Each tree, cloud and building has a shadow tone, a mid tone and a highlight tone, all from one light source. The maple uses an 8-step colour ramp chosen by which way each cluster faces the sun.
- **Organic edges.** A turbulence displacement filter (`#leafy`, `#cloudy`) roughens foliage and clouds so nothing reads as a perfect geometric shape.
- **Small story details:** a barn with trim and a silo, round hay bales with shadows, a fence, a winding road, chimney smoke, a line of birds. Each is small, but it makes the place feel lived in.
- **Finish:** a soft-light glow from the light source, faint light rays, and a paper-grain multiply at about 10%.

### What got rejected, so never do it
- **Trees or bushes made of one or a few circles.** The user called these "horrible".
- **Plain triangle pine trees, especially in the foreground.** This is why the aurora night was rejected. A near conifer needs tiered, jagged branch layers, a lit side and a shaded side, a visible trunk, and snow resting on the tiers when it's winter.
- **Flat single-colour silhouettes** for anything larger than about 60px on screen.
- **Mountains with vertical stripes, or boxy plateaus.** Shade peaks with triangular faces running from the peak down to the next valley.
- **Rain or snow drawn into the scene.** Weather is a separate animated layer on the page; scenes are always drawn dry.
- **People.** Landscapes, buildings, objects and animals only.

### Depth and perspective (every scene so far has gotten this wrong)

**Read `scenes/CATALOG.md` before choosing a scene and append a row after adding one; a new scene must differ from its pool on at least three columns.** **Use the `scene-3d` skill** (`.claude/skills/scene-3d/SKILL.md`): place land, buildings, piers, boats and trees in world metres with `world3d()` from `reference/scene-helpers.js` instead of drawing them as flat elevations. `scenes/harbor-lighthouse-fall.js` is the worked example. The rules below still describe what a correct result looks like.

The user's standing complaint is that the "3D" looks off. The autumn valley
works because it is **layered 2.5D**: flat elevations stacked in bands, with
depth carried by size, haze and overlap, not by drawn perspective. Rules:
- **One camera, at eye level.** The horizon line is the eye line. Never mix a
  top-down view (tiled rock shelves, docks or roads seen from above) with
  eye-level buildings in the same picture.
- **Objects are elevations.** Draw buildings, lighthouses, boats and trees
  front-on. A building may show one narrow side wall only toward the centre
  vanishing point: left of centre shows its right side, right of centre its
  left side, never both ways in one scene, and the side never wider than
  about a quarter of the front.
- **Size follows the baseline.** Anything standing on the ground or water is
  scaled by how far its base is below the horizon:
  `scale = (baseY - horizonY) / (refY - horizonY)`, with refY the foreground
  reference row. Two boats at different depths must differ in size by that
  ratio; a far shore's houses are a fraction of the near ones.
- **Ground planes foreshorten.** A dock, road or shoreline recedes by getting
  thinner vertically and narrower toward the horizon, its side edges aimed at
  one vanishing point on the horizon. If that is hard, keep it parallel to
  the horizon (a pier seen side-on) instead of angled.
- **Reflections sit directly below** what they mirror: same x, flipped about
  the object's own waterline, compressed slightly, darker and fading. Never
  offset sideways.
- **Draw back to front**, by baseline y, so nearer things overlap farther ones.
- **Mountains look like terrain, not paper triangles.** Each range is an
  irregular ridgeline (many peaks of different heights, saddles, shoulders,
  no symmetric cones), sitting on the horizon with its base hidden by haze or
  the next band. Two to four ranges, each farther one paler, bluer, lower
  contrast and smaller. Light comes from one side: faces turned to the sun
  are lighter, the others in shadow, split along ridges and gullies that run
  from the peaks down. Snow follows the terrain (thicker on shaded faces and
  in gullies, ragged lower edge), never a flat cap.
- **Nothing looks pasted on.** Every object sits in its band: a contact
  shadow or grass/water line at its base, the same light direction, and the
  same haze as its distance.
- In section 6 checks, add a line: "Perspective: one eye level, sizes follow
  baselines, reflections aligned, no top-down planes." Fail the scene if not.

### Composition: the bar's text and controls sit on top
The canvas is 2560×720.
- **Top-left**, x 0–900, y 0–260: the temperature. Keep it calm (sky or distant hills).
- **Top-right**, x 1500–2560, y 0–260: the headline. Keep it calm.
- **Bottom**, y 520–720: the weather card sits at x 64–790, the player card at about 810–1450, and the theme buttons at 1470–2500. Everything there may be covered.
- **The subject** goes in x 900–1700, y 150–560, big enough to read at a glance (250–500px tall).
- **The horizon** sits between y 380 and 480.

### Animation hooks
Don't animate inside the SVG. Declare what the page should animate in the
calendar entry's `fx` list, from: `leaves` (with emitter box and colours),
`aurora`, `smoke` (point), `water-shimmer` (band), `fireflies` (box),
`lanterns` (box), `stars-twinkle`, `birds`. The page already has `leaves`,
`aurora` and the clouds drift; list anything new under `fx_todo` so it can be
built.

## 6. Check your own work

For every new scene:
1. Render it with `render.ps1 <test-page> <out.png>`. Write a small HTML page that loads the helpers and your scene and renders `part` unset.
2. Open the PNG and check it against every rule in section 5, one line per rule, in `calendar\YYYY-Www.review.md`.
3. Also check it next to `reference\autumn-valley.png`. Would the two sit on the same wall? If not, say what differs and fix it.
4. Composition check: the scene must not read as a hard-edged rectangle or flat front-on slab (the covered-bridge lesson). Things recede, overlap and sit in perspective.
5. Fix and re-render at most twice. If it still fails, use a library scene for that day, keep the failed file as `scenes\_rejected\{slug}.js`, and write down why.

For official art, open the downloaded image and confirm it is the right
game or show, is wide enough, and leaves the two text corners readable.

## 7. Lights

Only a **holiday** day may change the apartment's lights. Set
`"lights": {"theme": "<existing theme id>", "from": "19:00"}` using a theme
lightd already has (`GET http://127.0.0.1:8790/api/lightd/themes`). Pick the
closest match; do not create themes or automations. Every other day has
`"lights": null`.

## 8. Output format

`days.json` is one object keyed by local date. This is exactly what the bar
reads (`daily\window.js`), so keep to these field names:

```json
{
  "2026-10-31": {
    "kind": "Holiday",
    "title": "Halloween",
    "detail": "Lights go to Pumpkin at 7. Back to normal tomorrow.",
    "chips": ["Clocks go back tomorrow, 2 AM"],
    "scene": { "file": "scenes/halloween-hollow.js", "fn": "halloweenHollowArt", "opts": {} },
    "night": { "file": "scenes/halloween-hollow.js", "fn": "halloweenHollowArt", "opts": { "time": "night" } },
    "fx": ["leaves"],
    "nightFx": [],
    "lights": { "theme": "pumpkin", "from": "19:00" },
    "sources": ["https://www.timeanddate.com/holidays/us/halloween"],
    "confidence": "confirmed",
    "locked": false
  }
}
```

- `kind` is the label shown in the pill above the headline, written for a person: `Holiday`, `Tonight's sky`, `Out today`, `Anime · season finale`, `Outside this week`, `Somewhere else`, `On this day`.
- `scene.file` is relative to `daily\`. `fn` is the function name in that file.
- `night` is the scene used after dark. Use `null` only for official-art days.
- For official art, leave out `scene` and `night`, and set `"art": "art/2026-11-19-gta6.jpg"` and `"focus": "right center"` (a CSS object-position).
- `fx` and `nightFx` are what the bar animates on top: `"leaves"` (optionally `{"leaves": [x0, y0, x1, y1]}`, the box they fall from, usually the tree crown) and `"aurora"`. Put any effect the bar doesn't have yet in the review under "Effects to build".
- `confidence` is `"confirmed"` (date checked at the source) or `"approximate"` (nature items only).
- `detail` is one plain sentence under 90 characters. `title` is under 32 characters.
- Write the file as UTF-8 JSON with your file tools, never through PowerShell.

## 8b. The default backgrounds (cycle.json)

When the user taps the background button, the bar draws a random scene from
`cycle.json`: pools by time of year (`fall`, `halloween`, `thanksgiving`,
`christmas-season`, `christmas-week`, `new-year`, `winter`, `valentines`,
`spring`, `july-4`, `summer`), each with `from`/`to` as `MM-DD`. Every pool
covering the date is in the draw.

**Every daily run adds one new scene to the default pool for right now**, on
top of the day's own scene. That is how the default list grows: a little each
day, always for the current time of year. Pick the pool covering today; if
more than one does, the holiday pool first (the end-of-year holidays matter
most to the user), else the one with the fewest scenes. Only if every current
pool already has 12+ scenes, add to the next pool that starts within 21 days.
A good day scene of yours that fits the season may also be added to its pool
(it counts as that run's addition only if it has a night version).

Rules for these:
- Same format and art rules as section 4c and 5, with a day version and an
  `opts.time === "night"` version.
- Vary them: a different place, palette, composition and take on the theme
  from every scene already in that pool (for Halloween: classic haunted
  house, cozy pumpkin patch, and uncommon takes; not four graveyards).
- Never write people into them.
- Render and check them as in section 6.

Add each to its pool in `cycle.json` with the file tools, keeping the format:
`{"id", "name" (2-4 words), "scene", "night", "fx", "nightFx"}`. A scene can
sit in more than one pool. Never remove or reorder existing entries.

## 8c. Open work (TODO.md)

Read `..\TODO.md` at the start. Do any open item about scenes or the default
pools that fits this run (for example a scene marked below standard, a
broken scene, a missing pool scene) as that run's pool addition. When you
finish one, mark it `[x]` with the date, in place, using Edit. That file is
append-only: never rewrite it, reorder it or delete lines. Add a new line at
the bottom for anything you could not finish.

## 9. Finish

End with a short summary in `calendar\{first date}.review.md`: each day's
headline, which scenes are new, what you rejected and why, and anything you
couldn't confirm. Render every new scene (day and night) into
`calendar\{date}-day.png` and `calendar\{date}-night.png` so a person can
look at the result without opening the bar.
