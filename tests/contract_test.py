"""Contract tests against the REAL lightd.

Everything the dashboard believes about the API is asserted here, so if lightd
changes its mind the failure lands in this file rather than in a light that
silently ignores you.

Read-only by default. `--write` adds one round-trip on a single device (Table
Lamp) and restores whatever it found - that is the only way to prove the power
payload actually works, since HTTP 200 does not mean the bulb obeyed.

    py tests/contract_test.py
    py tests/contract_test.py --write
"""
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
CFG = json.loads((HERE.parent / "lightd.config.json").read_text(encoding="utf-8"))
BASE = CFG["lightd_url"].rstrip("/")
PROBE = "Table Lamp"          # cloud, always online here, and not a quiet-hours light

PASS, FAILS, NOTES = 0, [], []


def ok(name, cond, extra=""):
    global PASS
    if cond:
        PASS += 1
        print("  [ok] " + name)
    else:
        FAILS.append(name + ((" -- " + str(extra)) if extra else ""))
        print("  [FAIL] " + name + (("  (" + str(extra) + ")") if extra else ""))


def eq(name, got, want):
    ok(name, got == want, "got %r, want %r" % (got, want))


def call(method, path, body=None, timeout=60):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, method=method, data=data)
    r.add_header("Authorization", "Bearer " + CFG["token"])
    r.add_header("X-Actor", CFG["actor"])
    if data:
        r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r, timeout=timeout) as x:
            return x.status, json.loads(x.read().decode("utf-8", "replace") or "null")
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw}
    except Exception as e:
        return 0, {"error": str(e)}


def dev(name):
    return "/devices/" + urllib.parse.quote(name)


def state(name):
    s, b = call("GET", dev(name) + "/state")
    return b.get("normalized") if s == 200 else None


def main():
    write = "--write" in sys.argv

    print("\n[reachability]")
    s, manifest = call("GET", "/manifest")
    eq("GET /manifest", s, 200)
    if s != 200:
        print("lightd is not answering; nothing else can be checked.")
        return 1

    print("\n[manifest shape]")
    ok("manifest has devices", isinstance(manifest.get("devices"), list))
    devs = manifest["devices"]
    real = [d for d in devs if not d.get("virtual")]
    ok("there are real devices", len(real) > 0, len(real))
    ok("virtual aliases are flagged, not hidden", any(d.get("virtual") for d in devs))
    need = {"id", "name", "sku", "virtual", "transports", "capabilities"}
    missing = [d.get("name") for d in devs if not need.issubset(set(d))]
    ok("every device carries the fields the cards read", not missing, missing[:3])
    ok("transports are a list", all(isinstance(d["transports"], list) for d in devs))
    ok("capabilities are a list", all(isinstance(d["capabilities"], list) for d in devs))
    ok("the probe device is present", any(d["name"] == PROBE for d in devs), PROBE)
    known_caps = {"brightness", "colorRgb", "colorTemperatureK", "diyScene", "lightScene",
                  "musicMode", "powerSwitch", "segmentedColorRgb", "snapshot", "toggle",
                  "nightlightScene", "gradientToggle", "presetScene", "dreamViewToggle",
                  # seen on the Aroma Diffuser Pro and the multi-zone lamps; the
                  # dashboard deliberately does not render these
                  "baseLightToggle", "bottomLightToggle", "lackWaterEvent",
                  "pillarLightToggle", "rippleLightToggle", "segmentedBrightness",
                  "sideLightToggle"}
    seen = {c for d in devs for c in d["capabilities"]}
    unknown = seen - known_caps
    ok("no capability the UI has never seen", not unknown, sorted(unknown))

    print("\n[state shape - what the cards and the readback rely on]")
    s, b = call("GET", dev(PROBE) + "/state")
    eq("GET /devices/{name}/state", s, 200)
    ok("state is addressable by friendly name", b.get("device") == PROBE, b.get("device"))
    n = b.get("normalized") or {}
    for key in ("online", "power", "brightness", "kelvin"):
        ok("normalized carries " + key, key in n, sorted(n))
    ok("online is a bool", isinstance(n.get("online"), bool), repr(n.get("online")))
    ok("power is a bool or None", n.get("power") is None or isinstance(n.get("power"), bool),
       repr(n.get("power")))
    # The id form has to work too - the manifest gives ids, the UI uses names.
    did = next(d["id"] for d in devs if d["name"] == PROBE)
    s2, b2 = call("GET", "/devices/" + urllib.parse.quote(did, safe="") + "/state")
    eq("state is also addressable by id", s2, 200)
    ok("both forms name the same device", b2.get("device") == PROBE)

    print("\n[the endpoints the dashboard calls]")
    for path, key in [("/themes", "themes"), ("/schedule/today", "hours"),
                      ("/automations", "automations"), ("/daycycle", None),
                      ("/daycycle/now", None), (dev(PROBE) + "/scenes", "scenes")]:
        s, b = call("GET", path)
        ok("GET " + path + " answers 200", s == 200, s)
        if key:
            ok("  ...and carries " + key, key in (b or {}), sorted(b or {})[:6])

    print("\n[overnight ceiling - removed from the UI, and not depended on]")
    s, q = call("GET", "/quiet")
    if s == 404:
        # The host has taken the endpoint away entirely. This is only worth a note
        # rather than a failure precisely because the dashboard stopped depending
        # on it - the checks below prove that.
        ok("a missing /quiet does not break the dashboard", True)
        NOTES.append("lightd no longer serves /quiet (404). The page does not call it, "
                     "so nothing on the dashboard depends on it.")
    elif s == 200:
        ok("quiet says whether it is configured", "configured" in q, sorted(q))
        if q.get("configured") is False:
            ok("an unconfigured host sends no policy fields",
               not ({"from", "to", "max_brightness"} & set(q)), sorted(q))
        else:
            for key in ("active", "from", "to", "max_brightness", "kept_off"):
                ok("quiet carries " + key, key in q, sorted(q))
            ok("active is a bool", isinstance(q.get("active"), bool))
            ok("kept_off is a list of names", isinstance(q.get("kept_off"), list))
            ok("the ceiling is low", q.get("max_brightness", 100) <= 10, q.get("max_brightness"))
    else:
        ok("/quiet answers 200 or 404", False, s)
    page = (HERE.parent / "index.html").read_text(encoding="utf-8")
    ok("the page no longer renders an overnight ceiling panel",
       "quiet-card" not in page)
    ok("nor an overnight pill in the header", "p-quiet" not in page)
    ok("and it does not fetch /quiet any more", "api(" + chr(39) + "/quiet" + chr(39) + ")" not in page)
    ok("but a clamped response is still reported as trimmed",
       "trimmed by quiet hours" in page)

    print("\n[schedule shape]")
    s, sched = call("GET", "/schedule/today")
    eq("the day has 24 hours", len(sched.get("hours", [])), 24)
    h0 = sched["hours"][0]
    for key in ("hour", "band", "theme", "brightness"):
        ok("each hour carries " + key, key in h0, sorted(h0))
    ok("current band is named", (sched.get("current") or {}).get("band"), sched.get("current"))
    ok("brightness is a number", isinstance(h0["brightness"], (int, float)))

    print("\n[automations - and the limits the UI states out loud]")
    s, autos = call("GET", "/automations")
    for a in autos.get("automations", []):
        for key in ("id", "name", "status", "enabled", "trigger", "action"):
            ok("automation '%s' carries %s" % (a.get("name"), key), key in a, sorted(a))
        break
    trig_types = {a["trigger"]["type"] for a in autos.get("automations", []) if a.get("trigger")}
    act_types = {a["action"]["type"] for a in autos.get("automations", []) if a.get("action")}
    ok("triggers stay within cron/sun/interval",
       trig_types <= {"cron", "sun", "interval"}, sorted(trig_types))
    ok("actions stay within theme/command/timeofday",
       act_types <= {"theme", "command", "timeofday"}, sorted(act_types))
    # The Automations tab tells the user there is no "if". The dangerous part is
    # that lightd does not REFUSE a condition block - it drops it and schedules the
    # action unconditionally, which is worse than a rejection. Pin that behaviour,
    # and clean up by name so a failed assertion cannot leave a pending automation
    # sitting on the owner's phone.
    PROBE_NAME = "contract-probe-delete-me"

    def purge():
        _, listing = call("GET", "/automations")
        for a in (listing or {}).get("automations", []):
            if str(a.get("name", "")).startswith("contract-probe"):
                call("DELETE", "/automations/" + a["id"])

    purge()
    s, r = call("POST", "/automations", {
        "name": PROBE_NAME + "-webhook",
        "trigger": {"type": "cron", "hour": 3, "minute": 0},
        "action": {"type": "webhook", "url": "http://example.com/x"},
    })
    ok("an external-URL action is refused", s >= 400, "got %s %s" % (s, str(r)[:120]))

    s, r = call("POST", "/automations", {
        "name": PROBE_NAME + "-cond",
        "trigger": {"type": "cron", "hour": 3, "minute": 0},
        "condition": {"if": "power", "device": PROBE},
        "action": {"type": "theme", "theme": "cozy"},
    })
    if s >= 400:
        ok("a conditional automation is refused outright", True)
    else:
        _, listing = call("GET", "/automations")
        made = [a for a in listing.get("automations", [])
                if a.get("name") == PROBE_NAME + "-cond"]
        ok("the conditional probe was created", len(made) == 1, len(made))
        if made:
            ok("lightd DROPS the condition instead of honouring it",
               "condition" not in made[0], "it kept: %r" % made[0].get("condition"))
            ok("which is why the UI refuses to offer conditionals at all",
               made[0].get("status") == "pending", made[0].get("status"))
    purge()
    _, listing = call("GET", "/automations")
    ok("no probe automation is left behind",
       not [a for a in listing.get("automations", [])
            if str(a.get("name", "")).startswith("contract-probe")])

    print("\n[themes]")
    s, th = call("GET", "/themes")
    tl = th.get("themes") or th
    ok("themes have id and name", all("id" in t and "name" in t for t in tl), tl[:1])
    tid = tl[0]["id"]
    s, pv = call("GET", "/themes/%s/preview" % tid)
    eq("preview answers 200", s, 200)
    ok("preview changes nothing (it only lists steps)", "steps" in pv, sorted(pv)[:6])

    print("\n[auth]")
    bad = urllib.request.Request(BASE + "/manifest")
    bad.add_header("Authorization", "Bearer not-a-real-token")
    try:
        urllib.request.urlopen(bad, timeout=20)
        ok("a bad token is rejected", False, "it was accepted")
    except urllib.error.HTTPError as e:
        ok("a bad token is rejected", e.code in (401, 403), e.code)
    except Exception as e:
        ok("a bad token is rejected", False, str(e))

    if not write:
        print("\n[write round-trip]  skipped - pass --write to run it")
        print("\n" + "-" * 56)
        print("%d passed, %d failed" % (PASS, len(FAILS)))
        for f in FAILS:
            print("  - " + f)
        return 1 if FAILS else 0

    print("\n[write round-trip on %s - restores whatever it finds]" % PROBE)
    if q.get("active"):
        print("  quiet hours are active; the host would clamp these. Skipping.")
    else:
        start = state(PROBE)
        ok("the probe device is online", start and start.get("online") is True, start)
        if start and start.get("online"):
            # THE regression. 'off' is a non-empty string and lightd reads the
            # value for truthiness, so the string form turns a light ON.
            s, r = call("POST", dev(PROBE) + "/command", {"action": "power", "value": False})
            eq("power false is accepted", s, 200)
            time.sleep(3)
            after = state(PROBE)
            ok("power:false actually switches the light OFF", after.get("power") is False,
               "device reports power=%r" % after.get("power"))

            s, _ = call("POST", dev(PROBE) + "/command", {"action": "power", "value": "off"})
            time.sleep(3)
            after2 = state(PROBE)
            if after2.get("power") is False:
                NOTES.append('lightd now honours the string "off" as well as false; '
                             'the UI still sends booleans, which is still correct.')
            else:
                NOTES.append('CONFIRMED TRAP: {"value":"off"} returns HTTP %s and leaves the '
                             'light ON. Only booleans work. This is why the UI never sends '
                             'the string form.' % s)

            call("POST", dev(PROBE) + "/command", {"action": "power", "value": True})
            time.sleep(3)
            ok("power:true switches it back on", (state(PROBE) or {}).get("power") is True)

            want = 40
            call("POST", dev(PROBE) + "/command", {"action": "brightness", "value": want})
            time.sleep(3)
            got = (state(PROBE) or {}).get("brightness")
            ok("brightness takes an int and lands", abs((got or 0) - want) <= 1, got)

            if start.get("kelvin"):
                call("POST", dev(PROBE) + "/command", {"action": "kelvin", "value": 5000})
                time.sleep(3)
                got = (state(PROBE) or {}).get("kelvin")
                ok("kelvin takes an int and lands", abs((got or 0) - 5000) <= 200, got)

            # Put it back exactly as it was.
            for action, value in (("brightness", start.get("brightness")),
                                  ("kelvin", start.get("kelvin")),
                                  ("power", start.get("power"))):
                if value is not None:
                    call("POST", dev(PROBE) + "/command", {"action": action, "value": value})
                    time.sleep(2)
            end = state(PROBE)
            ok("the device was restored", end and end.get("power") == start.get("power")
               and end.get("brightness") == start.get("brightness"),
               "start %s / end %s" % (start, end))

    print("\n" + "-" * 56)
    for note in NOTES:
        print("NOTE: " + note)
    print("%d passed, %d failed" % (PASS, len(FAILS)))
    for f in FAILS:
        print("  - " + f)
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
