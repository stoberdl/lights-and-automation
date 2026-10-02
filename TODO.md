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
