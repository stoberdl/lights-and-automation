"""Local server for the lights dashboard.

Holds the lightd token so it never reaches the page, proxies the API, and
launches local things the browser cannot: Claude Code, the Beat Saber song
browser.

  python serve.py            # http://127.0.0.1:8790
  python serve.py --port 9100 --no-browser
"""
import argparse, json, os, shutil, socket, subprocess, sys, threading, time, webbrowser
import urllib.request, urllib.error, urllib.parse
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE     = Path(__file__).resolve().parent
CFG_PATH = HERE / "lightd.config.json"
PROMPTS  = HERE / "prompts"

# Launched from the desktop shortcut this runs under pythonw.exe, where
# sys.stdout and sys.stderr are None - writing a log line would then raise
# mid-response and truncate it. Send the log to a file instead.
if sys.stderr is None or sys.stdout is None:
    _log = open(HERE / "dashboard.log", "a", buffering=1, encoding="utf-8", errors="replace")
    sys.stdout = sys.stderr = _log
    sys.stderr.write("\n--- started %s ---\n" % time.strftime("%Y-%m-%d %H:%M:%S"))

DEFAULTS = {
    # lightd runs on this machine now, so loopback is the shortest path. The
    # LAN address still works and is what a tablet would use if it ever talked
    # to lightd directly - it does not; it talks to this server instead.
    "lightd_url":   "http://127.0.0.1:8787",
    "token":        "",
    "actor":        "frontend:dashboard",
    "port":         8790,
    # 0.0.0.0 so a tablet on the wall can reach it. This is the change that
    # turns a personal dashboard into a household one, and it means the page
    # is served to anything on the wifi - the lightd token stays here, but
    # anyone who can load the page can drive the lights.
    "host":         "0.0.0.0",
    # Shared secret for the browser bridge (ytbridge/, the extension on the
    # main PC). Generated on first run and written back to the config file -
    # see ensure_browser_token. The extension ships with a copy of it, which is
    # why that folder is as sensitive as this file.
    "browser_token": "",
    "beatsaber_ui": "",
    "claude_exe":   r"C:\Users\user\.local\bin\claude.exe",
    # Claude Code runs here, with this directory as its working directory.
    "claude_model": "",
}

# lightd allows 120 req/min on this token. Stay under it: the page is the only
# client, but a stuck poll loop should hit a local wall, not a remote one.
BUCKET, BUCKET_LOCK = deque(), threading.Lock()
RATE_MAX, RATE_WINDOW = 100, 60.0

# /manifest and /themes change only when the hardware does. The briefing is
# explicit about not re-fetching the manifest per request.
CACHE, CACHE_LOCK = {}, threading.Lock()
CACHE_TTL = {"manifest": 600.0, "themes": 600.0, "daycycle": 600.0,
             # The three the page polls on a timer. Every screen showing the
             # dashboard asks for these every few seconds, and they all get the
             # same answer - so one upstream call serves them all rather than
             # each viewer spending its own slot out of the 100/min guard
             # below. Any POST clears the whole cache (see proxy), so an action
             # is never read back stale: this only ever collapses idle polling.
             "today": 2.0, "live": 2.0, "media": 3.0}


def load_config():
    cfg = dict(DEFAULTS)
    if CFG_PATH.exists():
        try:
            # utf-8-sig, not utf-8: PowerShell's Set-Content writes a BOM, and
            # json.loads rejects it. That failure used to land here silently as
            # "using defaults", which means an empty token and a dashboard that
            # 401s on every call with nothing pointing at the cause.
            cfg.update(json.loads(CFG_PATH.read_text(encoding="utf-8-sig")))
        except Exception as e:
            print("!! %s is unreadable (%s)" % (CFG_PATH.name, e))
            print("!! falling back to defaults - THERE WILL BE NO TOKEN and "
                  "every lightd call will return 401")
    else:
        # First run: adopt the token the bootstrap left in .lightd.env.
        env = HERE / ".lightd.env"
        if env.exists():
            for line in env.read_text(encoding="utf-8").splitlines():
                if line.startswith("LIGHTD_TOKEN="):
                    cfg["token"] = line.split("=", 1)[1].strip()
                elif line.startswith("LIGHTD_URL="):
                    cfg["lightd_url"] = line.split("=", 1)[1].strip()
        CFG_PATH.write_text(json.dumps(cfg, indent=2), encoding="utf-8")
        print("wrote %s - the token lives there, not in the page" % CFG_PATH.name)
    if not cfg.get("claude_exe") or not Path(cfg["claude_exe"]).exists():
        cfg["claude_exe"] = shutil.which("claude") or cfg.get("claude_exe", "")
    return cfg


def ensure_browser_token():
    """A secret for the browser bridge, made once and kept.

    The extension runs on another machine and posts what its YouTube tabs are
    doing to this server. That is a write from off-box, so it carries a token;
    everything the page itself does stays unauthenticated, exactly as before.
    """
    if CFG.get("browser_token"):
        return CFG["browser_token"]
    import secrets
    CFG["browser_token"] = secrets.token_urlsafe(24)
    try:
        on_disk = {}
        if CFG_PATH.exists():
            on_disk = json.loads(CFG_PATH.read_text(encoding="utf-8-sig"))
        on_disk["browser_token"] = CFG["browser_token"]
        CFG_PATH.write_text(json.dumps(on_disk, indent=2), encoding="utf-8")
    except Exception as e:
        print("!! could not save browser_token (%s) - it will change on restart" % e)
    return CFG["browser_token"]


CFG = load_config()


def rate_ok():
    now = time.time()
    with BUCKET_LOCK:
        while BUCKET and now - BUCKET[0] > RATE_WINDOW:
            BUCKET.popleft()
        if len(BUCKET) >= RATE_MAX:
            return False
        BUCKET.append(now)
        return True


# A verified theme apply walks every device and reads each one back: measured at
# 60-90s. Everything else answers in under a second, so it gets a short leash -
# a host that accepts the connection but never replies must not freeze the live
# poller for three minutes.
SLOW_PATHS = ("/apply", "/manifest/refresh")
SLOW_TIMEOUT, FAST_TIMEOUT = 180, 20


def timeout_for(path):
    return SLOW_TIMEOUT if any(k in path for k in SLOW_PATHS) else FAST_TIMEOUT


def lightd(method, path, query="", body=None):
    """One call to lightd. Returns (status, bytes, content_type).

    Never raises for an HTTP error - the page needs to see 409 quiet-hours and
    403 actor_not_bound verbatim, with their reason bodies intact.
    """
    url = CFG["lightd_url"].rstrip("/") + "/" + path.lstrip("/")
    if query:
        url += "?" + query
    req = urllib.request.Request(url, method=method, data=body)
    req.add_header("Authorization", "Bearer " + CFG["token"])
    req.add_header("X-Actor", CFG["actor"])
    if body is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout_for(path)) as r:
            return r.status, r.read(), r.headers.get("Content-Type", "application/json")
    except urllib.error.HTTPError as e:
        return e.code, e.read(), e.headers.get("Content-Type", "application/json")
    except Exception as e:
        return 502, json.dumps({"detail": "lightd unreachable: %s" % e,
                                "offline": True}).encode(), "application/json"


# ------------------------------------------------------------- media agent
# What this PC is playing, and the controls for it. This server is started by
# a scheduled task at boot, so it lives in session 0: no desktop, no audio
# endpoint, and no media sessions - the browser playing something on the actual
# screen is invisible from here, and no amount of permission fixes that. So the
# part that has to see the desktop is mediaagent.py, which runs in the
# interactive session, and this proxies to it.
#
# Short timeouts: the agent may simply not be running (nobody logged in yet),
# and the widget asking about it must never be what makes the page feel slow.
AGENT_URL = "http://127.0.0.1:8791"
AGENT_HEADER = ("X-Media-Agent", "1")   # refuses anything without it; see the agent
AGENT_TIMEOUT = 3.0


def media_agent(method, path, body=None):
    """One call to the media agent. Returns (status, dict)."""
    req = urllib.request.Request(AGENT_URL + path, method=method,
                                 data=json.dumps(body or {}).encode() if method == "POST" else None)
    req.add_header(*AGENT_HEADER)
    if method == "POST":
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=AGENT_TIMEOUT) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b"{}")
        except ValueError:
            return e.code, {"detail": "agent error %s" % e.code}
    except Exception as e:
        # Not an error worth shouting about: the widget hides itself when
        # there is nothing playing, and an agent that is not running is one
        # more way for there to be nothing playing.
        return 200, {"found": False, "agent": False,
                     "detail": "media agent not running: %s" % e}


# ---------------------------------------------------------- browser bridge
# What the main PC's browser is playing. The dashboard cannot ask a browser on
# another machine anything - there is nothing listening there - so the traffic
# runs the other way: the extension posts its state every couple of seconds and
# collects any pending commands in the reply. That single exchange is both
# directions, needs no inbound port on that PC, and survives it sleeping.
#
# State is deliberately not persisted. "What is playing" is only true for a few
# seconds; a stale answer read off disk after a restart would be a lie.
BROWSER = {"at": 0.0, "state": None, "queue": [], "who": ""}
BROWSER_LOCK = threading.Lock()
BROWSER_TTL = 12.0          # no report for this long and nothing is playing

# The VMware host adapters. The standing rule for this box is that the VM does
# not get to reach the dashboard, and a bridge that accepts state from anything
# on the wire would be the way around it.
BLOCKED_PREFIXES = ("192.168.159.", "192.168.247.")


# ------------------------------------------------------------- favourites
# Which four themes get a key on the launcher. This lived in the page's
# localStorage first, which was wrong twice over: it is per browser profile, so
# the bar by the door and a phone in the kitchen disagreed about the apartment's
# own favourites - and nothing outside that one browser could see them, which
# meant a screenshot of the board could never show what the board shows.
FAV_PATH = HERE / "favourites.json"
FAV_LOCK = threading.Lock()
FAV_MAX = 4


def favourites():
    with FAV_LOCK:
        try:
            v = json.loads(FAV_PATH.read_text(encoding="utf-8"))
        except Exception:
            return []
    return [str(x) for x in v][:FAV_MAX] if isinstance(v, list) else []


def save_favourites(ids):
    keep, seen = [], set()
    for x in ids or []:
        s = str(x)[:64]
        if s and s not in seen:
            seen.add(s)
            keep.append(s)
    keep = keep[:FAV_MAX]
    with FAV_LOCK:
        try:
            FAV_PATH.write_text(json.dumps(keep, indent=2), encoding="utf-8")
        except Exception as e:
            print("!! could not save favourites (%s)" % e)
    return keep


def browser_state():
    """The current browser report, or None once it has gone stale."""
    with BROWSER_LOCK:
        if not BROWSER["state"] or time.time() - BROWSER["at"] > BROWSER_TTL:
            return None
        return dict(BROWSER["state"], host=BROWSER["who"],
                    age=round(time.time() - BROWSER["at"], 1))


def cached(path):
    key = path.strip("/")
    ttl = CACHE_TTL.get(key)
    if ttl is None:
        return None
    with CACHE_LOCK:
        hit = CACHE.get(key)
        if hit and time.time() - hit[0] < ttl:
            return hit[1]
    got = lightd("GET", path)
    if got[0] == 200:
        with CACHE_LOCK:
            CACHE[key] = (time.time(), got)
    return got


# ---------------------------------------------------------------- Claude Code
# Claude used to be launched into its own console window, which meant the
# dashboard could start a run and then had no idea what happened. On a wall
# tablet there is no console to look at, so that is no longer good enough:
# the run has to be visible in the page.
#
# `--output-format stream-json` emits one JSON object per event as it happens -
# thinking, text, each tool call and its result, then a final summary with cost
# and duration. That is far better to render than raw terminal output: the page
# can style a tool call differently from prose instead of colouring ANSI codes.
#
# One run at a time. Not for memory - a run is ~500MB - but because two Claudes
# editing the same files at once is a genuinely bad idea.

# CLAUDE.md in this directory carries the standing context, so the preamble
# only has to say what is specific to this invocation. Repeating the briefing
# here would just be a second copy to keep in sync.
PREAMBLE = """This request came from the Send box on the apartment dashboard,
so your reply is rendered in a browser panel - often on a wall tablet with
nobody sitting in front of it. Be brief and concrete.

Read CLAUDE.md in this directory first if you have not. The short version:
reach lightd through this dashboard's proxy at http://127.0.0.1:{port}/api/lightd/...
which attaches the token for you - start with /context and /levers.

--- request from the dashboard ---
{prompt}
"""

RUNS, RUNS_LOCK = {}, threading.Lock()
RUN_ORDER = deque(maxlen=25)
RUN_ACTIVE = threading.Lock()       # serialises: one Claude at a time


class Run:
    """One Claude Code invocation, and everything it emitted."""

    def __init__(self, run_id, prompt):
        self.id = run_id
        self.prompt = prompt
        self.started = time.time()
        self.events = []            # parsed stream-json objects, in order
        self.done = False
        self.error = None
        self.proc = None
        self.cond = threading.Condition()

    def emit(self, obj):
        with self.cond:
            self.events.append(obj)
            self.cond.notify_all()

    def finish(self, error=None):
        with self.cond:
            self.error = error
            self.done = True
            self.cond.notify_all()

    def summary(self):
        return {"id": self.id, "prompt": self.prompt, "started": self.started,
                "done": self.done, "error": self.error,
                "events": len(self.events)}


def _pump(run, exe, full_prompt):
    """Run Claude and turn its stdout into events. Runs on its own thread."""
    args = [exe, "-p", full_prompt,
            "--output-format", "stream-json", "--verbose"]
    if CFG.get("claude_model"):
        args += ["--model", CFG["claude_model"]]
    try:
        # CREATE_NO_WINDOW: the whole point is that it renders in the page, so
        # a console flashing up on the host would be noise.
        flags = getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0
        run.proc = subprocess.Popen(
            args, cwd=str(HERE), stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True, encoding="utf-8", errors="replace", bufsize=1,
            creationflags=flags,
        )
    except Exception as e:
        run.emit({"type": "dashboard_error", "text": "could not start Claude: %s" % e})
        run.finish(str(e))
        RUN_ACTIVE.release()
        return

    try:
        for line in run.proc.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                run.emit(json.loads(line))
            except json.JSONDecodeError:
                # Anything not JSON is still worth showing rather than losing.
                run.emit({"type": "raw", "text": line})
        run.proc.wait()
        if run.proc.returncode not in (0, None):
            tail = (run.proc.stderr.read() or "").strip()[-1500:]
            run.emit({"type": "dashboard_error",
                      "text": "claude exited %s\n%s" % (run.proc.returncode, tail)})
            run.finish("exit %s" % run.proc.returncode)
        else:
            run.finish()
    except Exception as e:
        run.emit({"type": "dashboard_error", "text": str(e)})
        run.finish(str(e))
    finally:
        RUN_ACTIVE.release()


def start_claude(prompt):
    exe = CFG.get("claude_exe") or ""
    if not exe or not Path(exe).exists():
        exe = shutil.which("claude") or ""
    if not exe:
        return None, "claude executable not found; set claude_exe in lightd.config.json"
    if not RUN_ACTIVE.acquire(blocking=False):
        return None, "a Claude run is already going - wait for it to finish"

    run_id = time.strftime("%Y%m%d-%H%M%S")
    full = PREAMBLE.format(port=CFG.get("port", 8790), prompt=prompt)
    PROMPTS.mkdir(exist_ok=True)
    try:
        (PROMPTS / (run_id + ".md")).write_text(full, encoding="utf-8")
    except Exception:
        pass

    run = Run(run_id, prompt)
    with RUNS_LOCK:
        RUNS[run_id] = run
        RUN_ORDER.append(run_id)
        for old in list(RUNS):
            if old not in RUN_ORDER:
                RUNS.pop(old, None)

    threading.Thread(target=_pump, args=(run, exe, full), daemon=True).start()
    return run, None


def launch_beatsaber():
    bat = CFG.get("beatsaber_ui") or ""
    if not bat or not Path(bat).exists():
        return False, "song browser not found at " + str(bat)
    try:
        subprocess.Popen(["cmd", "/c", "start", "", bat], cwd=str(Path(bat).parent))
        return True, "launching"
    except Exception as e:
        return False, str(e)


class Server(ThreadingHTTPServer):
    # Windows will happily let a second process bind the same port when this is
    # on, and then requests land on whichever instance answers first - half of
    # them on stale code. Fail loudly instead.
    allow_reuse_address = False
    daemon_threads = True


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        sys.stderr.write("  " + (fmt % args) + "\n")

    def send_json(self, status, obj):
        self.send_bytes(status, json.dumps(obj).encode(), "application/json")

    def send_bytes(self, status, data, ctype):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        # The bridge is called from an extension's own origin, so its answers
        # need the header the preflight above promised. Nothing else on this
        # server is cross-origin readable.
        if self.path.startswith("/api/media/browser"):
            self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin", "*"))
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionAbortedError):
            pass

    def read_body(self):
        n = int(self.headers.get("Content-Length") or 0)
        return self.rfile.read(n) if n else None

    # ---- routing -------------------------------------------------------
    def do_GET(self):
        parts = urllib.parse.urlsplit(self.path)
        p, q = parts.path, parts.query

        if p in ("/", "/index.html"):
            f = HERE / "index.html"
            if not f.exists():
                return self.send_json(404, {"detail": "index.html missing"})
            return self.send_bytes(200, f.read_bytes(), "text/html; charset=utf-8")

        # Any other .html in this directory, so a diagnostic harness can be
        # loaded same-origin and read the dashboard's own layout.
        if p.endswith(".html") and "/" not in p.strip("/"):
            f = HERE / p.lstrip("/")
            if f.exists():
                return self.send_bytes(200, f.read_bytes(), "text/html; charset=utf-8")

        if p == "/favicon.ico":
            ico = HERE / "lights.ico"
            if ico.exists():
                return self.send_bytes(200, ico.read_bytes(), "image/x-icon")
            return self.send_json(404, {"detail": "no icon"})

        if p == "/api/config":
            # Deliberately no token. The page never needs it.
            return self.send_json(200, {
                "lightd_url": CFG["lightd_url"],
                "actor": CFG["actor"],
                "beatsaber": bool(CFG.get("beatsaber_ui") and Path(CFG["beatsaber_ui"]).exists()),
                "claude": bool(CFG.get("claude_exe")),
                "has_token": bool(CFG.get("token")),
                # Shown on the console's idle readout. A model name is not a
                # secret and the alternative is the page guessing at it.
                "claude_model": CFG.get("claude_model") or "default",
                "host": socket.gethostname(),
            })

        # The launcher's four keys. No token, like everything else the page
        # reads: this is a preference, and anyone who can load the page can
        # already drive every light in the flat.
        if p == "/api/favourites":
            return self.send_json(200, {"favourites": favourites()})

        if p == "/api/claude/runs":
            with RUNS_LOCK:
                return self.send_json(200, {"runs": [RUNS[r].summary()
                                                     for r in reversed(RUN_ORDER)
                                                     if r in RUNS]})

        if p == "/api/claude/stream":
            run_id = urllib.parse.parse_qs(q).get("id", [""])[0]
            return self.stream_run(run_id)

        if p == "/api/media/local":
            status, body = media_agent("GET", "/session")
            if status == 200 and "agent" not in body:
                body["agent"] = True
            return self.send_json(200 if status == 200 else status, body)

        # What the main PC's browser is playing, for the media widget. No token
        # on the read: anyone who can load this page can already drive every
        # light in the apartment, so the title of a video is not the line worth
        # defending. The write is the one that carries a secret.
        if p == "/api/media/browser":
            st = browser_state()
            return self.send_json(200, st or {"found": False, "bridge": False})

        if p.startswith("/api/lightd/"):
            return self.proxy("GET", p[len("/api/lightd"):], q, None)

        return self.send_json(404, {"detail": "no route " + p})

    def stream_run(self, run_id):
        """Server-sent events for one Claude run, replayed from the start.

        Replaying matters: the tablet may connect after the run began, or
        reconnect after its screen slept, and half a transcript is worse than
        none.
        """
        with RUNS_LOCK:
            run = RUNS.get(run_id)
        if not run:
            return self.send_json(404, {"detail": "no such run"})

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Accel-Buffering", "no")
        self.send_header("Connection", "close")
        self.end_headers()

        sent = 0
        try:
            while True:
                with run.cond:
                    while len(run.events) <= sent and not run.done:
                        run.cond.wait(timeout=10.0)
                        if len(run.events) <= sent and not run.done:
                            # Keep-alive: a long tool call looks idle, and an
                            # idle stream gets dropped by phone browsers.
                            self.wfile.write(b": keepalive\n\n")
                            self.wfile.flush()
                    batch = run.events[sent:]
                    finished = run.done
                    sent += len(batch)
                for obj in batch:
                    payload = json.dumps(obj, ensure_ascii=False)
                    self.wfile.write(("data: %s\n\n" % payload).encode("utf-8"))
                self.wfile.flush()
                if finished and sent >= len(run.events):
                    end = {"type": "dashboard_done", "error": run.error,
                           "seconds": round(time.time() - run.started, 1)}
                    self.wfile.write(("data: %s\n\n" % json.dumps(end)).encode())
                    self.wfile.flush()
                    return
        except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
            return          # the tablet slept; the run carries on regardless

    def do_POST(self):
        parts = urllib.parse.urlsplit(self.path)
        p, q = parts.path, parts.query
        body = self.read_body()

        if p == "/api/claude":
            try:
                prompt = (json.loads(body or b"{}").get("prompt") or "").strip()
            except Exception:
                prompt = ""
            if not prompt:
                return self.send_json(400, {"detail": "empty prompt"})
            run, err = start_claude(prompt)
            if err:
                return self.send_json(409, {"ok": False, "detail": err})
            return self.send_json(200, {"ok": True, "id": run.id,
                                        "stream": "/api/claude/stream?id=" + run.id})

        if p == "/api/claude/stop":
            run_id = (json.loads(body or b"{}").get("id") or "")
            with RUNS_LOCK:
                run = RUNS.get(run_id)
            if not run or not run.proc:
                return self.send_json(404, {"detail": "no such run"})
            try:
                run.proc.terminate()
                return self.send_json(200, {"ok": True, "stopped": run_id})
            except Exception as e:
                return self.send_json(500, {"detail": str(e)})

        if p.startswith("/api/media/local/"):
            action = p[len("/api/media/local/"):].strip("/").lower()
            if action not in ("play", "pause", "playpause", "next", "previous",
                              "volume", "mute", "unmute"):
                return self.send_json(400, {"detail": "unknown action " + action})
            try:
                payload = json.loads(body or b"{}")
            except ValueError:
                payload = {}
            status, out = media_agent("POST", "/" + action, payload)
            return self.send_json(status, out)

        if p == "/api/favourites":
            try:
                payload = json.loads(body or b"{}")
            except ValueError:
                return self.send_json(400, {"detail": "bad json"})
            got = payload.get("favourites")
            if not isinstance(got, list):
                return self.send_json(400, {"detail": "favourites must be a list"})
            return self.send_json(200, {"favourites": save_favourites(got)})

        # ---- the browser bridge ----------------------------------------
        # One exchange, both directions: the extension says what it is playing
        # and is handed whatever the panel pressed since it last checked.
        if p == "/api/media/browser":
            client = self.client_address[0]
            if any(client.startswith(x) for x in BLOCKED_PREFIXES):
                return self.send_json(403, {"detail": "not from here"})
            try:
                payload = json.loads(body or b"{}")
            except ValueError:
                return self.send_json(400, {"detail": "bad json"})
            want = CFG.get("browser_token") or ""
            got = payload.get("token") or self.headers.get("X-Bridge-Token") or ""
            # compare_digest so a wrong token cannot be found a character at a
            # time by timing the answer.
            import hmac
            if not want or not hmac.compare_digest(str(got), want):
                return self.send_json(403, {"detail": "bad bridge token"})
            with BROWSER_LOCK:
                BROWSER["state"] = payload.get("state") or None
                BROWSER["at"]    = time.time()
                BROWSER["who"]   = str(payload.get("host") or client)
                queued, BROWSER["queue"] = BROWSER["queue"], []
            return self.send_json(200, {"ok": True, "commands": queued})

        if p.startswith("/api/media/browser/"):
            action = p[len("/api/media/browser/"):].strip("/").lower()
            if action not in ("play", "pause", "playpause", "next", "previous",
                              "volume", "mute", "unmute"):
                return self.send_json(400, {"detail": "unknown action " + action})
            try:
                value = json.loads(body or b"{}").get("value")
            except ValueError:
                value = None
            with BROWSER_LOCK:
                # Checked inline rather than through browser_state(): that
                # helper takes this same lock, and threading.Lock is not
                # reentrant - calling it here would deadlock the request.
                fresh = BROWSER["state"] and time.time() - BROWSER["at"] <= BROWSER_TTL
                if not fresh:
                    return self.send_json(409, {"ok": False, "detail": "no browser bridge"})
                # Bounded: if the extension has gone away, commands must not
                # pile up and then all fire at once when it comes back.
                BROWSER["queue"] = (BROWSER["queue"] + [{"action": action, "value": value}])[-8:]
            return self.send_json(200, {"ok": True, "queued": action})

        if p == "/api/beatsaber":
            ok, info = launch_beatsaber()
            return self.send_json(200 if ok else 500, {"ok": ok, "detail": info})

        if p.startswith("/api/lightd/"):
            return self.proxy("POST", p[len("/api/lightd"):], q, body)

        return self.send_json(404, {"detail": "no route " + p})

    def do_OPTIONS(self):
        """Preflight, for the browser bridge only.

        A Chrome extension with this host in its permissions is normally
        exempt from CORS, but Brave and any future MV3 change are not promises
        - and answering a preflight for these two paths costs nothing. Every
        other path is left to fail the check, which is what keeps a random web
        page from posting here.
        """
        p = urllib.parse.urlsplit(self.path).path
        if not p.startswith("/api/media/browser"):
            return self.send_json(404, {"detail": "no route"})
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin", "*"))
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Bridge-Token")
        self.send_header("Access-Control-Allow-Methods", "GET, POST")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_PUT(self):
        # Was missing, so PUT /themes/{id} and PUT /daycycle/config - the two
        # ways the dashboard writes rather than reads - came back 501 from
        # BaseHTTPRequestHandler before ever reaching lightd.
        parts = urllib.parse.urlsplit(self.path)
        if parts.path.startswith("/api/lightd/"):
            return self.proxy("PUT", parts.path[len("/api/lightd"):], parts.query, self.read_body())
        return self.send_json(404, {"detail": "no route"})

    def do_PATCH(self):
        parts = urllib.parse.urlsplit(self.path)
        if parts.path.startswith("/api/lightd/"):
            return self.proxy("PATCH", parts.path[len("/api/lightd"):], parts.query, self.read_body())
        return self.send_json(404, {"detail": "no route"})

    def do_DELETE(self):
        parts = urllib.parse.urlsplit(self.path)
        if parts.path.startswith("/api/lightd/"):
            return self.proxy("DELETE", parts.path[len("/api/lightd"):], parts.query, self.read_body())
        return self.send_json(404, {"detail": "no route"})

    def proxy(self, method, path, query, body):
        if method == "GET" and not query:
            hit = cached(path)
            if hit:
                return self.send_bytes(hit[0], hit[1], hit[2])
        if not rate_ok():
            return self.send_json(429, {"detail": "local rate guard: over 100 req/min to lightd"})
        t0 = time.time()
        status, data, ctype = lightd(method, path, query, body)
        sys.stderr.write("  -> lightd %s %s%s  %s  %.1fs\n" % (
            method, path, ("?" + query) if query else "", status, time.time() - t0))
        if status >= 400:
            sys.stderr.write("     %s\n" % data[:300].decode("utf-8", "replace"))
        if method != "GET":
            with CACHE_LOCK:
                CACHE.clear()
        self.send_bytes(status, data, ctype)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=CFG.get("port", 8790))
    ap.add_argument("--host", default=CFG.get("host", "0.0.0.0"))
    ap.add_argument("--no-browser", action="store_true")
    a = ap.parse_args()

    if not CFG.get("token"):
        print("no token in lightd.config.json - the dashboard will read nothing")
    ensure_browser_token()      # made once, then it lives in the config file
    try:
        srv = Server((a.host, a.port), Handler)
    except OSError as e:
        print("cannot bind %s:%d: %s" % (a.host, a.port, e))
        print("another dashboard is already running - use it, or close it first.")
        return
    url = "http://127.0.0.1:%d/" % a.port
    print("dashboard  " + url)
    if a.host == "0.0.0.0":
        import socket as _s
        try:
            probe = _s.socket(_s.AF_INET, _s.SOCK_DGRAM)
            probe.connect(("8.8.8.8", 80))
            print("on the wall  http://%s:%d/" % (probe.getsockname()[0], a.port))
            probe.close()
        except Exception:
            pass
    print("lightd     %s  (actor %s)" % (CFG["lightd_url"], CFG["actor"]))
    print("claude     %s" % (CFG.get("claude_exe") or "not found"))
    if not a.no_browser:
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()
