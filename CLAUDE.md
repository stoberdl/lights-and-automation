# The apartment dashboard

This directory serves the lighting dashboard on this machine (BUDGERIGAR).
You are usually invoked from the **Send** box on that page, so your output is
rendered in a browser panel, not a terminal — and often on a wall tablet with
nobody sitting in front of it.

## Vocabulary: a theme is not a scene

These are two different things and they must never be used interchangeably.
Getting this wrong wastes the user's time correcting you, so use the right word
every time — in code, in comments, and when talking to them.

- **Scene** — a Govee firmware effect that lives *on one device*, addressed by
  its display name (`"Blue Sky & White Clouds"`, `"Aurora-A"`). Libraries are
  per-model and wildly uneven: 240 scenes on the H6099, 63 on a bathroom bulb.
  Govee never reports which scene is running. Only `themes.py` and the device
  capability calls deal in these.
- **Theme** — an apartment-wide *intent*, declared in `themes/*.yaml` as a
  ranked `match` list that the resolver turns into whichever scene each device
  actually owns, with fallbacks. Lowercase ids (`rainy`, `bluesky`, `fall`).
  This is what the day cycle applies and what the user picks.

Everything the user touches on the dashboard is a **theme**: the Quick Apply
tiles, their starred favourites, the picker that says "More themes…", the
per-band dropdowns in the day strip. So it is the *Rainy theme tile*, never
"the rainy scene".

One trap in `index.html`: the tile illustrations are drawn by `sceneArt(name)`
and keyed off `data-art`, and the wallpaper behind the whole board is `.scene`.
Those names are about *artwork*, not about Govee scenes, and neither of them
makes the thing on screen a scene. It is still a theme tile.

## Start here, every time

**Go through the dashboard's own proxy on port 8790, not lightd directly.**
`serve.py` attaches the bearer token itself, so you never read it, never build
an `Authorization` header, and never risk printing it:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8790/api/lightd/context
Invoke-RestMethod -Uri http://127.0.0.1:8790/api/lightd/levers
```

Every lightd path works under `/api/lightd/…`, with the same methods and
bodies. POST looks like:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8790/api/lightd/expr/test -Method Post `
  -ContentType 'application/json' -Body '{"expr":"after_sunset()"}'
```

This matters practically as well as for safety: a shell hook on this machine
blocks string interpolation and subexpressions, so assembling a header inline
tends to fail. The proxy sidesteps that entirely.

`/context` carries findings that cost real work and should never be
re-derived. `/levers` is every control grouped by intent, with live values.
Between them they answer most questions without further exploration.

If you ever do need lightd directly it is on `http://127.0.0.1:8787` and the
token is in `lightd.config.json` — but you should not need to, and the token
must never be printed.

## The service

lightd runs on `http://127.0.0.1:8787` on this machine. It owns Govee scenes,
themes, the day cycle, and all automation. Home Assistant (LAN address in `D:\lightd\data\ha.host`,
port 80) supplies live state and fast local control; lightd already routes to
it automatically, so drive everything through lightd rather than calling HA
directly.

Useful endpoints beyond the two above:

```
GET  /today                     everything happening today, one call
GET  /live                      every device's state
GET  /devices/{id}/capabilities  what one device can be told to do
POST /devices/{id}/capability    drive any of them
POST /expr/test                 evaluate a condition against live state
POST /automations               create one — live immediately from here
GET  /handoff                   the full generated briefing
```

## Things that will bite you

- **HTTP 200 does not mean a light obeyed.** Govee returns success for offline
  devices. Use `?verify=true` on applies and report `summary.confirmed` /
  `summary.unconfirmed`. Six of nineteen lights here are usually unreachable —
  four bathroom, one kitchen, one couch, all on wall switches. That is normal.
- **You cannot read back which scene is running.** Govee never reports it, and
  neither does Home Assistant — `govee_light_local` speaks the LAN protocol,
  which has no scene concept. So **the duties are split**: HA observes power,
  brightness and reachability and those are trustworthy; colour it cannot see.
  After any scene, HA's `rgb`/`kelvin` is a stale leftover from whatever was
  last set *through* HA, and it never refreshes. `/live` says so per device:
  check **`color_trusted`** before believing `rgb`/`kelvin`, and read
  **`intent`** for the scene lightd last sent (with the theme it came from).
  Intent persists across restarts (a restart does not change what the bulb is
  running) and is cleared when the override watcher sees a change lightd did
  not make.
- **Off the home network, HA calls fail fast on purpose.** A circuit breaker in
  `ha.py` remembers the first transport failure and short-circuits the next 20
  seconds, then lets one call through to look again. Without it a single
  `/today` touched HA several times and took half a minute, and the dashboard
  reported "can't reach lightd" — which was false; lightd was answering, just
  blocked. `GET /ha`'s summary reports `breaker_open`. A breaker that is open
  means the network is gone, not that HA said no.
- **Media players have their own endpoints.** `GET /media` lists every player
  with `supports` — the `supported_features` bitmask already decoded into
  action names. `POST /media/{entity_id}/{action}` drives one, and refuses an
  action the player does not advertise. Do not build the mask yourself.
- **Set a scene before brightness, never after** — a scene carries its own level.
- **A device changed by hand is held for 3 hours** and the schedule skips it.
  A held light showing the "wrong" theme is correct behaviour, not a bug.
- **Conditions are expressions**: `{"type":"expr","expr":"after_sunset() and
  lights_on() > 0"}`. Test with `POST /expr/test` first. Prefer this over
  asking for a new condition type.
- **Automations created from here are live immediately.** There is no phone
  approval step; that mechanism was removed. Never tell the user to approve
  anything on their phone.

## How to answer

Your text lands in a panel on the dashboard, so be brief and concrete. Say
what actually changed, with the confirmed/unconfirmed counts. If something did
not work, say so plainly rather than reporting the command you sent as if it
were the outcome.

If you learn something durable, write it back so the next session does not
rediscover it:

```
POST /context/facts/{key}   {"value": ..., "why": "how you know"}
```
