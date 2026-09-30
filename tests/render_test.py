"""Real-browser layout test at 1280x800 (the mini monitor).

jsdom has no layout engine, so it can prove the page *behaves* but not that
anything fits. This serves index.html against a stub lightd, renders it in
headless Edge at the panel's exact size, and measures the result with real
Blink layout: overflow, overlap, font sizes, tap targets.

It also drops a screenshot next to the tests so the page can be eyeballed.

    py tests/render_test.py
"""
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SHOT = HERE / "render-1280x800.png"

W, H = 1280, 800
PASS, FAILS = 0, []

EDGE = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]


def ok(name, cond, extra=""):
    global PASS
    if cond:
        PASS += 1
        print("  [ok] " + name)
    else:
        FAILS.append(name + ((" -- " + str(extra)) if extra else ""))
        print("  [FAIL] " + name + (("  (" + str(extra) + ")") if extra else ""))


# ---------------------------------------------------------------- stub lightd
DEVICES = [
    {"id": "AA:%d" % i, "name": nm, "sku": sku, "virtual": False, "transports": [tr],
     "capabilities": caps, "ranges": {"colorTemperatureK": {"min": 2700, "max": 6500}},
     "scene_count": 94}
    for i, (nm, sku, tr, caps) in enumerate([
        ("Table Lamp", "H6022", "cloud", ["brightness", "colorRgb", "colorTemperatureK", "lightScene"]),
        ("Bedroom Lamp", "H6008", "cloud", ["brightness", "colorRgb", "colorTemperatureK", "lightScene"]),
        ("Living Room TV Backlig", "H6199", "cloud", ["brightness", "colorRgb", "lightScene"]),
        ("Table Lamp living room", "H6022", "cloud", ["brightness", "colorRgb", "colorTemperatureK"]),
        ("Kitchen Top Lights", "H6159", "cloud", ["brightness", "colorRgb"]),
        ("Bathroom light 1", "H615C", "cloud", ["brightness"]),
        ("Bathroom light 2", "H615C", "cloud", ["brightness"]),
        ("Bathroom light 3", "H615C", "cloud", ["brightness"]),
        ("Bathroom light 4", "H615C", "cloud", ["brightness"]),
        ("Under bed lights", "H6199", "cloud", ["brightness", "colorRgb", "lightScene"]),
        ("Aroma Diffuser Pro", "H7161", "cloud", ["brightness", "colorRgb"]),
        ("Bookcase light", "H6046", "cloud", ["brightness", "colorRgb", "lightScene"]),
        ("Living room fan", "H7102", "cloud", ["brightness"]),
        ("Couch light", "H6046", "cloud", ["brightness", "colorRgb", "lightScene"]),
        ("Floor Lamp", "H6076", "cloud", ["brightness", "colorRgb", "colorTemperatureK"]),
        ("TV Light Bars", "H6047", "cloud", ["brightness", "colorRgb", "lightScene"]),
        ("Kitchen light 1", "H6159", "cloud", ["brightness"]),
        ("Kitchen light 2", "H6159", "cloud", ["brightness"]),
        ("Table Light", "H6104", "bluetooth", ["brightness", "colorRgb"]),
        ("BLE Strip B", "H6110", "bluetooth", ["brightness"]),
    ])
]
SCHEDULE = {
    "current": {"band": "afternoon", "theme": "reading", "brightness": 95},
    "hours": [{"hour": "%02d:00" % h, "band": ["deep night", "pre-dawn", "sunrise", "morning",
                                               "afternoon", "golden hour", "evening",
                                               "wind down", "late night"][h % 9],
               "theme": "reading", "brightness": 5 + (h * 4) % 96,
               "lights_off": ["Kitchen light 1", "Bathroom light 1"] if (h >= 23 or h < 7) else [],
               "devices": [{"device": d["name"], "scene": "Sunrise"} for d in DEVICES[:6]]}
              for h in range(24)],
}
THEMES = {"themes": [{"id": t, "name": t.capitalize(), "description": "auto"} for t in
                     ["aurora", "bluesky", "christmas", "cozy", "desert", "fall", "fire",
                      "forest", "halloween", "ocean", "party", "rainbow", "reading",
                      "romantic", "snow", "starry", "sunset"]]}
AUTOS = {"automations": [
    {"id": "a1", "name": "Time of day", "status": "approved", "enabled": True,
     "trigger": {"type": "cron", "hour": "*", "minute": 0}, "action": {"type": "timeofday"},
     "last_result": {"summary": {"ok": 13, "failed": 0, "skipped": 5}}},
    {"id": "a2", "name": "Evening 100% hold until 10pm", "status": "approved", "enabled": True,
     "trigger": {"type": "cron", "hour": 19, "minute": 30},
     "action": {"type": "theme", "theme": "fire"}},
    {"id": "a3", "name": "A proposal waiting on the phone", "status": "pending", "enabled": False,
     "trigger": {"type": "sun", "event": "sunset", "offset_min": -15},
     "action": {"type": "theme", "theme": "cozy"}},
], "scheduled": [{"id": "a1", "next_run": "17:00"}]}
QUIET = {"configured": True, "active": False, "from": "23:00", "to": "07:00",
         "max_brightness": 5,
         "kept_off": ["Kitchen light 1", "Kitchen light 2", "Kitchen Top Lights",
                      "Bathroom light 1", "Bathroom light 2", "Bathroom light 3",
                      "Bathroom light 4"]}

# Injected after the page's own script. Waits for the grid to fill, then measures
# with real layout and parks the answer where --dump-dom will carry it out.
PROBE = """
<script>
(function(){
  function measure(){
    const R = {checks:{}, worst:[]};
    const de = document.documentElement;
    R.checks.pageScrollX = de.scrollWidth - de.clientWidth;
    R.checks.viewport = de.clientWidth + 'x' + de.clientHeight;
    R.checks.deviceCards = document.querySelectorAll('.dev').length;
    R.checks.hourRows = document.querySelectorAll('.hr').length;
    R.checks.themeButtons = document.querySelectorAll('#themes button').length;
    R.checks.autoCards = document.querySelectorAll('.auto').length;

    const hdr = document.querySelector('header');
    R.checks.headerH = Math.round(hdr.getBoundingClientRect().height);
    R.checks.headerOverflow = hdr.scrollWidth - hdr.clientWidth;
    const nav = document.querySelector('nav');
    R.checks.navH = Math.round(nav.getBoundingClientRect().height);
    R.checks.mainH = Math.round(document.querySelector('main').getBoundingClientRect().height);

    // Anything whose content is wider than its own box, ignoring the places we
    // deliberately clip with an ellipsis and the panes that are meant to scroll.
    const clipped = new Set(['nm','band']);
    const scrollers = new Set(['view','scenelist','hours']);
    const over = [];
    document.querySelectorAll('#app *').forEach(el => {
      const cls = [...el.classList];
      if (cls.some(c => clipped.has(c) || scrollers.has(c))) return;
      if (el.tagName === 'SELECT' || el.tagName === 'INPUT') return;
      const d = el.scrollWidth - el.clientWidth;
      if (d > 2 && el.clientWidth > 0)
        over.push({tag:el.tagName, cls:cls.join('.'), by:d, w:el.clientWidth});
    });
    over.sort((a,b) => b.by - a.by);
    if (over.length){
      const el = [...document.querySelectorAll('#app *')].find(e =>
        e.scrollWidth - e.clientWidth === over[0].by &&
        [...e.classList].join('.') === over[0].cls);
      if (el) over[0].detail = {
        own: Math.round(el.clientWidth), scroll: el.scrollWidth,
        kids: [...el.children].map(k => ({
          c: [...k.classList].join('.') || k.tagName,
          w: Math.round(k.getBoundingClientRect().width), sw: k.scrollWidth,
          gk: [...k.children].map(g => ({
            c: [...g.classList].join('.') || g.tagName,
            w: Math.round(g.getBoundingClientRect().width), sw: g.scrollWidth }))
        }))
      };
    }
    R.checks.overflowing = over.length;
    R.worst = over.slice(0, 6);

    // Real computed font sizes - the rem maths could still land too small.
    let min = 99, minSel = '';
    document.querySelectorAll('#app *').forEach(el => {
      if (!el.textContent.trim() || el.children.length) return;
      const px = parseFloat(getComputedStyle(el).fontSize);
      if (px && px < min){ min = px; minSel = el.className || el.tagName; }
    });
    R.checks.minFontPx = Math.round(min * 10) / 10;
    R.checks.minFontOn = minSel;

    // Tap targets. This is a touch-adjacent panel; nothing should be a sliver.
    const small = [...document.querySelectorAll('button')]
      .map(b => ({b, r:b.getBoundingClientRect()}))
      .filter(x => x.r.height > 0 && x.r.height < 20)
      .map(x => (x.b.id || x.b.className || x.b.textContent.slice(0,14)) +
                ' ' + Math.round(x.r.height) + 'px');
    R.checks.smallButtons = small.length;
    R.checks.smallButtonList = small.slice(0, 5);

    // Device cards must not collide or spill out of the grid.
    // Cards inside the collapsed "not answering" drawer have no layout at all, so
    // measure only the ones on screen - and check separately that the drawer is
    // genuinely hidden rather than merely empty.
    const allCards = [...document.querySelectorAll('.dev')];
    const cards = allCards.map(e => e.getBoundingClientRect()).filter(r => r.height > 0);
    R.checks.cardsLaidOut = cards.length;
    R.checks.cardsInDrawer = document.querySelectorAll('#silent-grid .dev').length;
    const drawer = document.getElementById('silent-body');
    R.checks.drawerCollapsed = !!drawer && drawer.hidden;
    R.checks.drawerCardsHaveNoLayout =
      [...document.querySelectorAll('#silent-grid .dev')]
        .every(e => e.getBoundingClientRect().height === 0);
    R.checks.cardMinH = cards.length ? Math.round(Math.min(...cards.map(c => c.height))) : 0;
    R.checks.cardMaxRight = cards.length ? Math.round(Math.max(...cards.map(c => c.right))) : 0;
    R.checks.cardCols = cards.length
      ? new Set(cards.map(c => Math.round(c.left))).size : 0;

    // Switches sit at the right edge of their card header; prove they landed
    // inside it rather than being pushed out by a long device name.
    let swOut = 0;
    document.querySelectorAll('.dev').forEach(card => {
      const sw = card.querySelector('.sw'); if (!sw) return;
      const a = sw.getBoundingClientRect(), b = card.getBoundingClientRect();
      if (a.right > b.right + 1 || a.left < b.left) swOut++;
    });
    R.checks.switchesOutsideCard = swOut;

    const now = document.querySelector('.hr.now');
    if (now){
      const r = now.getBoundingClientRect();
      R.checks.nowRowVisible = r.top >= 0 && r.bottom <= window.innerHeight;
      R.checks.nowRowTop = Math.round(r.top);
    } else R.checks.nowRowVisible = null;

    const ghosts = [...document.querySelectorAll('[hidden]')]
      .filter(el => el.getBoundingClientRect().width > 0 ||
                    getComputedStyle(el).display !== 'none')
      .map(el => (el.id || el.className || el.tagName) + ' ' +
                 Math.round(el.getBoundingClientRect().width) + 'px');
    R.checks.visibleHidden = ghosts.length;
    R.checks.visibleHiddenList = ghosts.slice(0, 5);
    return R;
  }

  function show(v){
    const b = [...document.querySelectorAll('nav button')].find(x => x.dataset.v === v);
    if (b) b.click();
  }

  let tries = 0;
  (function poll(){
    tries++;
    // Wait for every section boot() fills, not just the first. The device grid
    // renders before the automations load, so checking only for .dev measured a
    // half-built page and the automation count came back zero.
    const ready = document.querySelectorAll('.dev').length > 0 &&
                  document.querySelectorAll('.hr').length > 0 &&
                  document.querySelectorAll('#themes button').length > 0 &&
                  document.querySelectorAll('.auto').length > 0 &&
                  document.getElementById('dev-note').textContent.indexOf('read so far') === -1;
    if (!ready && tries < 200) return void setTimeout(poll, 50);
    // Measure each tab while it is the visible one - a hidden section has no
    // layout at all, and measuring it would silently pass everything.
    const all = {};
    for (const v of ['today','lights','autos','claude','about']){
      show(v);
      all[v] = measure();
    }
    // Leave the page on whichever tab the URL asked for, so the screenshot pass
    // captures that view rather than wherever the measuring loop finished.
    const want = (location.hash || '#today').slice(1);
    if (want === 'silent'){
      show('lights');
      const t = document.getElementById('b-silent');
      if (t) t.click();
      const view = document.getElementById('v-lights');
      if (view) view.scrollTop = view.scrollHeight;
    } else show(want);
    const merged = all.lights;
    merged.perTab = {};
    for (const v in all) merged.perTab[v] = {
      overflowing: all[v].checks.overflowing,
      worst: all[v].worst.slice(0,3),
      pageScrollX: all[v].checks.pageScrollX,
      minFontPx: all[v].checks.minFontPx,
      minFontOn: all[v].checks.minFontOn,
      smallButtons: all[v].checks.smallButtons,
      visibleHidden: all[v].checks.visibleHidden,
      visibleHiddenList: all[v].checks.visibleHiddenList,
    };
    merged.checks.hourRows = all.today.checks.hourRows;
    merged.checks.nowRowVisible = all.today.checks.nowRowVisible;
    merged.checks.nowRowTop = all.today.checks.nowRowTop;
    merged.checks.themeButtons = all.today.checks.themeButtons;
    merged.checks.autoCards = all.autos.checks.autoCards;
    document.body.setAttribute('data-report', JSON.stringify(merged));
    document.title = 'MEASURED';
  })();
})();
</script>
"""


class Stub(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass

    def send(self, status, data, ctype):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        self.do_GET()

    def do_GET(self):
        p = self.path.split("?")[0]
        if p in ("/", "/index.html"):
            html = (ROOT / "index.html").read_text(encoding="utf-8") + PROBE
            return self.send(200, html.encode("utf-8"), "text/html; charset=utf-8")
        if p == "/api/config":
            return self.json({"lightd_url": "http://stub", "actor": "frontend:test",
                              "beatsaber": True, "claude": True, "has_token": True})
        l = p.replace("/api/lightd", "")
        if l == "/manifest":
            return self.json({"devices": DEVICES, "counts": {}, "notes": ""})
        if l == "/themes":
            return self.json(THEMES)
        if l == "/quiet":
            return self.json(QUIET)
        if l == "/schedule/today":
            return self.json(SCHEDULE)
        if l == "/automations":
            return self.json(AUTOS)
        m = re.match(r"^/devices/([^/]+)/state$", l)
        if m:
            import urllib.parse
            name = urllib.parse.unquote(m.group(1))
            i = [d["name"] for d in DEVICES].index(name) if name in [d["name"] for d in DEVICES] else 0
            return self.json({"device": name, "transport": "cloud", "normalized": {
                "online": i % 5 != 3, "power": i % 3 != 0,
                "brightness": 20 + (i * 7) % 80, "kelvin": 2700 + (i * 200) % 3800, "rgb": None}})
        return self.json({"ok": True})

    def json(self, obj):
        self.send(200, json.dumps(obj).encode(), "application/json")


class Quiet(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def free_port():
    import socket
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    p = s.getsockname()[1]
    s.close()
    return p


def main():
    exe = next((e for e in EDGE if os.path.exists(e)), None)
    if not exe:
        print("  no Edge or Chrome found; skipping the render test")
        return 0

    port = free_port()
    srv = Quiet(("127.0.0.1", port), Stub)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = "http://127.0.0.1:%d/" % port
    profile = tempfile.mkdtemp(prefix="lights-render-")

    base = [exe, "--headless=new", "--disable-gpu", "--no-first-run",
            "--no-default-browser-check", "--hide-scrollbars",
            "--user-data-dir=" + profile,
            "--window-size=%d,%d" % (W, H),
            "--force-device-scale-factor=1",
            "--virtual-time-budget=20000"]

    print("\n[rendering %dx%d in %s]" % (W, H, Path(exe).name))
    dom = subprocess.run(base + ["--dump-dom", url], capture_output=True, timeout=180)
    out = dom.stdout.decode("utf-8", "replace")
    subprocess.run(base + ["--screenshot=" + str(SHOT), url], capture_output=True, timeout=180)
    for tab in ("lights", "autos", "claude", "silent"):
        shot = HERE / ("render-%s.png" % tab)
        subprocess.run(base + ["--screenshot=" + str(shot), url + "#" + tab],
                       capture_output=True, timeout=180)
    srv.shutdown()
    shutil.rmtree(profile, ignore_errors=True)

    m = re.search(r'data-report="([^"]*)"', out)
    if not m:
        print("  the page never reported; it probably threw during boot.")
        print("  dumped %d bytes" % len(out))
        return 1
    import html as htmlmod
    R = json.loads(htmlmod.unescape(m.group(1)))
    c = R["checks"]
    if "--dump" in sys.argv:
        print(json.dumps(R, indent=2)[:6000])

    vw, vh = (int(x) for x in c["viewport"].split("x"))
    print("\n[content rendered]  viewport %dx%d" % (vw, vh))
    ok("viewport is close to the panel", vw >= W - 60 and vh >= H - 120, c["viewport"])
    ok("all 20 device cards drawn", c["deviceCards"] == 20, c["deviceCards"])
    ok("24 schedule rows drawn", c["hourRows"] == 24, c["hourRows"])
    ok("17 theme buttons drawn", c["themeButtons"] == 17, c["themeButtons"])
    ok("3 automations drawn", c["autoCards"] == 3, c["autoCards"])
    ok("the current hour is on screen without scrolling",
       c.get("nowRowVisible") is True, "row top at %s" % c.get("nowRowTop"))

    print("\n[fit]")
    ok("the page does not scroll sideways", c["pageScrollX"] <= 0, c["pageScrollX"])
    ok("the header fits its width", c["headerOverflow"] <= 0, c["headerOverflow"])
    for tab, t in R.get("perTab", {}).items():
        ok("no [hidden] element is still visible on the %s tab" % tab,
           t["visibleHidden"] == 0, t["visibleHiddenList"])
        ok("nothing overflows on the %s tab" % tab, t["overflowing"] == 0,
           "; ".join("%s.%s by %dpx" % (x["tag"], x["cls"], x["by"]) for x in t["worst"]))
        ok("the %s tab does not scroll sideways" % tab, t["pageScrollX"] <= 0, t["pageScrollX"])
    ok("header leaves the content room", c["headerH"] <= 80, c["headerH"])
    ok("nav is a thin strip", c["navH"] <= 56, c["navH"])
    ok("main gets most of the screen", c["mainH"] >= vh - 130,
       "%d of %d" % (c["mainH"], vh))

    print("\n[legibility at arm's length]")
    for tab, t in R.get("perTab", {}).items():
        ok("nothing below 10px on the %s tab" % tab, t["minFontPx"] >= 10,
           "%spx on .%s" % (t["minFontPx"], t["minFontOn"]))
    ok("no sliver buttons", c["smallButtons"] == 0, c["smallButtonList"])

    print("\n[device grid]")
    ok("cards are a sensible height", c["cardMinH"] >= 60, c["cardMinH"])
    ok("the silent drawer starts collapsed", c["drawerCollapsed"] is True)
    ok("its cards are grouped out of the main grid", c["cardsInDrawer"] > 0, c["cardsInDrawer"])
    ok("and take no space while collapsed", c["drawerCardsHaveNoLayout"] is True)
    ok("the visible cards are the answering ones",
       c["cardsLaidOut"] == c["deviceCards"] - c["cardsInDrawer"],
       "%s laid out, %s total, %s in drawer" % (c["cardsLaidOut"], c["deviceCards"], c["cardsInDrawer"]))
    ok("cards stay inside the viewport", c["cardMaxRight"] <= vw, c["cardMaxRight"])
    ok("the grid uses several columns", c["cardCols"] >= 3, c["cardCols"])
    ok("every power switch sits inside its card", c["switchesOutsideCard"] == 0,
       c["switchesOutsideCard"])

    print("\n[screenshot]")
    ok("screenshot written", SHOT.exists() and SHOT.stat().st_size > 20000,
       SHOT.stat().st_size if SHOT.exists() else "missing")
    if SHOT.exists():
        print("       " + str(SHOT))

    print("\n" + "-" * 56)
    print("%d passed, %d failed" % (PASS, len(FAILS)))
    for f in FAILS:
        print("  - " + f)
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
