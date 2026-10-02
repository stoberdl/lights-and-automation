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
