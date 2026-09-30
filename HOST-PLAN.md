# Plan: conditional automations in lightd

Hand this to a Claude session running **on the host (BUDGERIGAR)**, where the
lightd source lives. It cannot be applied from the dashboard PC — the dashboard
only has the HTTP API, and the API has no endpoint that accepts a change like
this.

---

## Context

lightd's automation model is currently exactly: **one cron trigger + one action**.
There is no way to read state before acting.

The request that exposed this, from the dashboard:

> 100% on lights until 10pm in evenings 5:30 to 10pm
> — with: **candlelight if `Living room fan` is on, otherwise `fall`**

Neither half is expressible today:

1. **No conditions.** The fan branch collapses into a coin flip fixed when the
   automation is authored.
2. **No windows.** The hourly `timeofday` automation re-asserts band brightness
   every hour on the hour, so a "hold" must be re-applied just after each hour
   boundary. Covering 17:30–22:00 needs **six** automations chasing the clock.
   Three already exist (`Evening 100% hold` at 19:31, 20:01, 21:01).

Everything below was checked against the live API on 2026-09-03, not from docs.

---

## P0 — Reject unknown keys (ship this first, independently)

`POST /automations` **accepts a `condition` key and silently discards it.**

Reproduced: posted an automation with a `condition` block. Response was HTTP 200,
`status: pending`, and the created object came back with `trigger` and `action`
only — no condition, no warning. It would have fired unconditionally every day.
(Probe automation `f08c6bdc0b5a`, since deleted.)

This is the most urgent item on the page. Silent field-dropping in a system whose
entire safety story is "the owner approves what runs unattended" means the thing
the owner approved is not the thing that was described to them.

Fix: strict validation on `POST` and `PATCH /automations` — any undefined key,
top-level or nested, is a 422 in the existing envelope:

```json
{"detail": {"validation_failed": ["unknown field: condition"]}}
```

---

## P4 — Serialize applies (also independent, also worth shipping now)

A full apply takes **~70s** — measured 57.1s across 17 cloud devices plus 12.9s
across 2 Bluetooth, because lightd paces to the 2 cmd/s per-device limit.

The cycle fires at `:00`. The holds fire at `:01`. **They overlap.**

```
20:00:00  ├──────── Time of day → evening, 45% ────────┤ (~70s)
20:01:00                              ├──────── hold → 100% ────────┤
                                      └─ overlap, order undefined ─┘
```

In that overlap the tail of the cycle's per-device writes lands *after* the hold
has already set some devices to 100%, leaving those devices at 45%. It is
device-order dependent, so it is intermittent — the kind of fault nobody
reproduces on demand. Evidence in the run log: `Time of day` last_run
`2026-09-04T01:01:03Z` for the 21:00 trigger; `hold - 20:00` last_run
`2026-09-04T00:01:24Z` for a `:01` trigger.

Fix: single-flight apply queue. One apply in flight at a time; a queued apply of
higher priority **supersedes** a pending lower-priority one rather than both
running.

---

## P1 — Condition grammar

A tree of leaves and combinators. Leaves read the same `normalized` block that
`GET /devices/{id}/state` already returns, so there is no new state plumbing.

**Leaves**

| Form | Fields | Notes |
|---|---|---|
| device | `device, field, op, value` | `field` ∈ online, power, brightness, kelvin. `op` ∈ eq, ne, lt, lte, gt, gte. `device` takes a Govee id or friendly name, as elsewhere in the API. |
| band | `band` | True when the day cycle's active band matches, e.g. `"evening"`. |
| between | `between: [from, until]` | Local wall-clock window, `"17:30"`–`"22:00"`. Handles the half-hour band edges cron cannot. |

**Combinators:** `{"all": [...]}`, `{"any": [...]}`, `{"not": {...}}`. Depth
capped at 4. No arithmetic, no string matching, and per the existing rule,
nothing that can reach an external URL.

**Deliberately absent:** any leaf testing which scene is running. Govee never
reports `lightScene`, so such a condition could never be evaluated truthfully.
Conditions must only test what the host can actually observe.

---

## P2 — Branches, not just gates

A bare run/skip gate would force the fan case into two mutually exclusive
automations that must be kept in sync — and each edit drops both back to
`pending` for another phone tap. A branch list expresses it once.

```json
{
  "name": "Evening hold — 5:30 to 10pm",
  "trigger": { "type": "cron", "hour": "17-21", "minute": 1 },
  "branches": [
    {
      "when": { "device": "Living room fan", "field": "power",
                "op": "eq", "value": true },
      "action": { "type": "theme", "theme": "candlelight", "brightness": 100 }
    }
  ],
  "otherwise": {
    "action": { "type": "theme", "theme": "fall", "brightness": 100 }
  },
  "on_unknown": "otherwise"
}
```

**Evaluation contract**

1. Collect distinct devices referenced across all branches. Cap: 5 per automation.
2. Take **one** state snapshot per evaluation, shared by every branch, max age
   30s. A branch never sees a device change mid-evaluation.
3. Per-device read timeout 5s. A timeout yields *unknown*, not `false`.
4. Branches evaluate in order; first true `when` runs its action. No match runs
   `otherwise`. No `otherwise` means skip.
5. `last_result` records `branch_taken`, the values read with their ages, and any
   devices that came back unknown.

**The semantic that will bite you:** six of the twenty lights here are usually
unreachable. A verified apply on 2026-09-03 confirmed 13 of 19 — Bathroom 1–4,
Kitchen light 1 and Couch light all reported offline. So "is device X on?" has
**three** answers, not two. `on_unknown` must be explicit rather than defaulted
into silently: `"otherwise"` (recommended default), `"skip"`, `"false"`. A
condition on a chronically offline device should be a validation *warning* at
create time, surfaced on the approval card.

---

## P3 — Hold windows and precedence

This is the fix for "many automations". The minute-1 pattern exists only because
`timeofday` overwrites brightness at minute 0 and nothing arbitrates. Give
automations a **priority** and a **window**:

```json
"trigger": {
  "type": "hold",
  "from": "17:30",
  "until": "22:00",
  "days": "*",
  "priority": 10
}
```

The day cycle runs at `priority: 0`. Inside an active higher-priority window, a
lower-priority apply is **suppressed and logged**, not executed-then-overwritten.
At `until`, control hands back to the cycle on its next tick — no separate
"release" automation to author or approve.

| | Today | With P2 + P3 |
|---|---|---|
| Automations for this window | 6 | 1 |
| Pattern | one per hour boundary at minute 1 | one hold window 17:30 → 22:00 |
| Approve taps | 6 | 1 |
| Band edges (17:30, 21:30) | awkward cron times | wall-clock |
| Fan condition | inexpressible | branches |
| Cycle race | yes (see P4) | cycle suppressed, never queued |

**Quiet hours stay above all of this.** A hold window overlapping 23:00–07:00 is
still clamped to 5%, and kitchen and bathroom lights still may not be switched
on. Priority arbitrates between automations; it does not outrank the overnight
ceiling. Windows crossing 23:00 should warn at create time.

---

## P5 — Endpoints

| Endpoint | Change | Behaviour |
|---|---|---|
| `POST /automations/evaluate` | new | Dry run. Takes an inline condition or `{"id": …}`. Returns which branch would fire right now, every value read with its age, and which devices were unknown. Changes nothing — same idiom as `/themes/{id}/preview`, which is how this API already teaches people to check before acting. |
| `GET /automations/{id}/runs` | new | Last N runs with `branch_taken`, the reads that decided it, and the confirmed/unconfirmed summary. Without this, "why is the room the wrong colour?" is unanswerable after the fact. |
| `POST /automations` | fix | Accepts `branches`, `otherwise`, `on_unknown`, `trigger.type: "hold"`. Rejects unknown keys with 422 (P0). |
| `GET /automations` | additive | Gains `schema_version`. Existing automations with no `branches` behave exactly as today. |

```json
// POST /automations/evaluate — response
{
  "would_run": true,
  "branch_taken": 0,
  "action": { "type": "theme", "theme": "candlelight", "brightness": 100 },
  "reads": [
    { "device": "Living room fan", "field": "power",
      "value": true, "age_seconds": 3 }
  ],
  "unknown": [],
  "warnings": []
}
```

**Caps.** Condition evaluation costs device reads against a 120 req/min token
budget. Alongside the existing `max: 40` and `min_interval_minutes: 1`: at most 5
distinct devices per automation, condition depth 4, and a shared evaluation
budget so a minute in which many automations fire cannot exhaust the rate limit.
Reads come from the shared snapshot cache, so ten automations testing the same
fan cost one read.

---

## P6 — Approval and compatibility

Conditional automations stay gated exactly as now: created `pending`, armed only
by the owner's tap, localhost, or a valid `X-Auth-Code`; any edit to `branches`,
`otherwise`, `on_unknown` or the window drops it back to `pending`.

What changes is what the phone shows. "Evening hold — theme" is no longer an
adequate description of a thing that picks between two behaviours. Render the
logic in words:

> **Evening hold — 5:30 to 10pm**
> Every day 5:30pm–10pm, holding the lights at 100%.
> If *Living room fan* is on → candlelight. Otherwise → fall.
> If the fan can't be reached → fall.
> Suppresses the day cycle inside this window.

**Backward compatibility is total.** Every field here is optional. The four
automations defined today — `Time of day` and the three `Evening 100% hold`
entries — keep running unchanged with no `branches` key. Migration is a
convenience, not a requirement: the six minute-1 holds *can* collapse into one
hold window, but only when someone chooses to, at the cost of one Approve tap.

---

## Suggested order

| # | Item | Depends on |
|---|---|---|
| P0 | Reject unknown keys (422) | Nothing. Closes a silent-failure hole that exists today. |
| P4 | Single-flight apply queue | Nothing. Fixes an existing intermittent fault, useful even without conditions. |
| P1 | Condition grammar + snapshot cache | P0 |
| P2 | Branches, `otherwise`, `on_unknown` | P1 |
| P5 | `/evaluate` and `/runs` | P1, P2 — build alongside, not after; the dry run is how P1 gets tested |
| P3 | Hold windows and priority | P4 |
| P6 | Approval card rendering | P2, P3 |

P0 and P4 are worth doing regardless of whether the rest is ever built.

---

## Also worth knowing

- A `candlelight` theme does not exist yet, but the scene does: `Candlelight`
  covers 13 of 15 scene-capable devices (`GET /themes/suggest?keyword=candlelight`).
  It can be generated with `POST /themes/candlelight {"keyword":"candlelight"}`.
  The existing `cozy` theme already leads its match list with `Candlelight`.
- `Evening 100% hold - 21:00` (`909c193d31b8`) has been `pending` since
  2026-09-01 and has never run. It needs an Approve tap on the phone.

*Written 2026-09-03 against the live API: 20 controllable devices, 4 automations
defined, day cycle in the `evening` band. Nothing here is implemented — this is a
proposal for the host.*
