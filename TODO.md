# TODO — the user's list

> **Claude: append only.** Never rewrite, reorder or delete entries in this
> file. Add new items at the bottom; mark finished ones `[x]` with the date and
> commit hash, and leave them in place. Only the user removes items.

## Waiting on the user (needs them in person)

- [ ] **VeSync login** — run `vesync-login.ps1` (opens a Windows login box),
      enter the VeSync app email + password. Saved DPAPI-encrypted to
      `.vesync.cred` (gitignored). Then:
  - [ ] Body weight: pull weigh-in history via pyvesync 3.4.2 (unofficial
        library; scale support exists). Show on the dashboard. *(minor)*
  - [ ] Calories: pyvesync does not cover the app's food/nutrition log. Find
        the endpoint the app uses and report whether it is reachable.
        *(main ask)*
- [ ] **TV true volume** — add HA's *Android TV Remote* integration for the
      Living Room TV (needs the pairing code shown on the TV screen). Cast only
      knows volume set through Cast, so remote changes leave the bar stale.
      Then read volume from that entity instead of `media_player.living_room_tv`.

## Open (Claude can do these)

- [ ] Daily scene build logs end with exit code 1 (permission denials for
      Bash in the run log). Investigate after the first 4am run (2026-10-02).
- [ ] Prompt rule: scenes must not be a hard-edged rectangle / flat
      perspective (covered-bridge-creek lesson).
- [ ] Add more night-capable scenes to the default day/night cycle.

## Done

- [x] 2026-10-01 — Daily 4am scheduled task "Lights Daily Scene" (5366b1e).
- [x] 2026-10-02 — TV volume stale 0 shown as "—"; next/previous on Cast (76de8d5).

## Added 2026-10-02 — seasonal default backgrounds (agents hit the usage limit)

- [ ] `scenes/new-years-skyline.js` has a syntax error — fix, then add to the
      `new-year` pool in cycle.json.
- [ ] Not written yet: `first-sunrise-lake` (New Year), `snowy-pines-lodge`
      (Christmas season), `village-skating-pond` (Winter),
      `main-street-thanksgiving` (Thanksgiving — pool has only 1 scene).
      The daily script also tops up thin pools 21 days ahead (WEEKLY_PROMPT 8b).
- [ ] frozen-falls-pass, trick-or-treat-lane, harvest-farm-thanksgiving were
      cut off mid-review — look them over.
- [ ] Spring / summer / Valentine's / July 4 pools are empty (script fills later).
- [x] 2026-10-02 — Daily build exit code: 4am run exited 0; resolved.
- [x] 2026-10-02 — new-years-skyline fixed (precedence error) and in the New Year pool.
- [x] 2026-10-02 — trick-or-treat-lane, harvest-farm-thanksgiving reviewed: OK.
- [ ] frozen-falls-pass is below standard (blocky cliff, flat front-on bridge,
      empty foreground). Pulled from pools; redo, then add back to winter.
- [x] 2026-10-02 — VeSync login saved; body scale weigh-ins sync
      (`vesync_sync.py` → `vesync_weights.json`, 235 rows, last 2026-01-09).
- [ ] Calories: food-log endpoints are not public. Options: (a) Apple Health
      bridge (VeSync → Health → "Health Auto Export" app POSTs to serve.py),
      (b) capture the VeSync app's traffic once to find the diary endpoint.
- [ ] Show weight (and calories) on the dashboard — decide where.
- [x] 2026-10-02 — Calories found: `/cloud/v1/getDailyIntakeCalorieByApp`
      (today only: kcal, goal, exercise, macros). Hourly task "Lights VeSync"
      records each day into `vesync_calories.json`; weigh-ins sync too.
      Calories item above superseded (no Apple Health).
- [ ] Past-day calories: `/cloud/v1/deviceManaged/nutritionScale/getNutritionDailyRecord`
      exists but its parameters are unknown (all guesses "illegal argument").
- [x] 2026-10-02 — Past days solved: params {configModel, page, pageSize,
      syncTimestamp} (decoded from the app). `vesync_history.py`, 220 days.
- [x] 2026-10-02 — Bar: kcal line + weekly weight arrow beside the clock;
      evening flash (FOOD_WEEKDAY / FOOD_WEEKEND in daily/window.js).
- [ ] Perspective pass (user, 2026-10-02: "the 3D effect is off on all of
      them"; likes the harbor lighthouse otherwise). Redraw to the new
      "Depth and perspective" rules in WEEKLY_PROMPT section 5, keeping each
      scene's subject and palette. One per run, in this order:
      harbor-lighthouse-fall (top-down rock point, dock angle, boat sizes,
      offset reflections), marblehead-lighthouse, then every other scene in
      cycle.json.
- 2026-10-02: user: "all of them, really off and not natural, mountains, dock
  completely" — redoing all now, one agent at a time, brief in
  daily/FIX_BRIEF.md. Queue (tick as done): harbor-lighthouse-fall,
  golden-aspen-lake, covered-bridge-creek, hunters-moon-lake,
  marblehead-lighthouse, perkins-observatory, haunted-hill-manor,
  pumpkin-patch-farm, bayou-witch-cottage, trick-or-treat-lane,
  halloween-hollow, harvest-farm-thanksgiving, christmas-market-square,
  tree-farm-snow, city-ice-rink, christmas-eve-rooftops,
  christmas-morning-farm, new-years-skyline, winter-aurora-cabin,
  frozen-falls-pass. If a session stops partway, the 4am run continues it.
- [ ] Weighed foods (foodList) kcal formula only checked on quick-add days —
      compare a weighed day against the app.
- Note 2026-10-02: the 4am daily run now adds one scene a day to the current
  default pool and works these items itself (WEEKLY_PROMPT 8b/8c).
