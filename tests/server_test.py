"""Tests for serve.py, the local proxy.

Imports serve.py in-process and points it at a fake lightd, so the real handler
code is exercised without touching the real controller or the real token.

    py tests/server_test.py
"""
import json
import sys
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

PASS, FAILS = 0, []


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


# ---------------------------------------------------------------- fake lightd
SEEN = []           # every request the proxy made upstream
NEXT = {}           # path -> (status, obj) override for the next call


class FakeLightd(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass

    def handle_one(self, method):
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b""
        try:
            body = json.loads(raw) if raw else None
        except Exception:
            body = raw.decode("utf-8", "replace")
        SEEN.append({
            "method": method,
            "path": self.path,
            "auth": self.headers.get("Authorization"),
            "actor": self.headers.get("X-Actor"),
            "body": body,
        })
        path = self.path.split("?")[0]
        status, obj = NEXT.pop(path, (200, {"path": path, "method": method}))
        data = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    do_GET = lambda s: s.handle_one("GET")
    do_POST = lambda s: s.handle_one("POST")
    do_PATCH = lambda s: s.handle_one("PATCH")
    do_DELETE = lambda s: s.handle_one("DELETE")


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


# ---------------------------------------------------------------- the request helper
def req(base, path, method="GET", body=None):
    url = base + path
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, method=method, data=data)
    if data:
        r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r, timeout=60) as x:
            return x.status, x.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")
    except Exception as e:
        return 0, "ERR " + str(e)


def main():
    fake_port = free_port()
    fake = Quiet(("127.0.0.1", fake_port), FakeLightd)
    threading.Thread(target=fake.serve_forever, daemon=True).start()

    import serve

    # Point the real handler at the fake controller with a token that is not the
    # real one, so nothing here can reach the flat or leak the live secret.
    TOKEN = "test-token-not-the-real-one"
    serve.CFG["lightd_url"] = "http://127.0.0.1:%d" % fake_port
    serve.CFG["token"] = TOKEN
    serve.CFG["actor"] = "frontend:test"
    serve.CACHE.clear()
    serve.BUCKET.clear()

    port = free_port()
    srv = serve.Server(("127.0.0.1", port), serve.Handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = "http://127.0.0.1:%d" % port
    time.sleep(0.3)

    print("\n[static]")
    s, b = req(base, "/")
    ok("/ serves the dashboard", s == 200 and "<title>Apartment Lights</title>" in b, s)
    ok("/ is the real index.html", "commandAndVerify" in b)
    s, _ = req(base, "/favicon.ico")
    ok("/favicon.ico serves the icon", s in (200, 404), s)
    s, b = req(base, "/nope")
    eq("unknown route is 404", s, 404)

    print("\n[config endpoint]")
    s, b = req(base, "/api/config")
    cfg = json.loads(b)
    eq("/api/config is 200", s, 200)
    ok("reports a token is held", cfg.get("has_token") is True)
    ok("but never sends the token", TOKEN not in b, b[:120])
    ok("no key called token at all", "token" not in [k.lower() for k in cfg if k.lower() == "token"])
    ok("names the actor", cfg.get("actor") == "frontend:test")

    print("\n[proxy adds the credentials]")
    SEEN.clear()
    s, b = req(base, "/api/lightd/manifest")
    eq("manifest proxies 200", s, 200)
    eq("upstream saw one request", len(SEEN), 1)
    eq("bearer token added server-side", SEEN[0]["auth"], "Bearer " + TOKEN)
    eq("X-Actor added server-side", SEEN[0]["actor"], "frontend:test")
    eq("path passed through", SEEN[0]["path"], "/manifest")

    print("\n[bodies survive the hop]")
    SEEN.clear()
    # The whole power bug was a value type. Prove the proxy does not coerce it.
    req(base, "/api/lightd/devices/Table%20Lamp/command", "POST",
        {"action": "power", "value": False})
    eq("POST body forwarded intact", SEEN[-1]["body"], {"action": "power", "value": False})
    ok("false stays a boolean, not a string", SEEN[-1]["body"]["value"] is False,
       repr(SEEN[-1]["body"]["value"]))
    ok("device name stays url-encoded", SEEN[-1]["path"] == "/devices/Table%20Lamp/command",
       SEEN[-1]["path"])

    SEEN.clear()
    req(base, "/api/lightd/themes/cozy/apply?verify=true&brightness=70", "POST")
    eq("query string forwarded", SEEN[-1]["path"], "/themes/cozy/apply?verify=true&brightness=70")

    SEEN.clear()
    req(base, "/api/lightd/automations/a1", "DELETE")
    eq("DELETE is routed", SEEN[-1]["method"], "DELETE")
    req(base, "/api/lightd/automations/a1", "PATCH", {"name": "x"})
    eq("PATCH is routed", SEEN[-1]["method"], "PATCH")

    print("\n[refusals reach the page verbatim]")
    NEXT["/devices/x/command"] = (409, {"reason": "quiet hours: bathroom is held off"})
    s, b = req(base, "/api/lightd/devices/x/command", "POST", {"action": "power", "value": True})
    eq("409 status passed through", s, 409)
    ok("409 reason passed through", "quiet hours" in b, b[:120])

    NEXT["/devices/x/command"] = (403, {"reason": "actor_not_bound"})
    s, b = req(base, "/api/lightd/devices/x/command", "POST", {})
    eq("403 status passed through", s, 403)
    ok("403 reason passed through", "actor_not_bound" in b, b[:120])

    NEXT["/manifest"] = (500, {"detail": "boom"})
    serve.CACHE.clear()
    s, b = req(base, "/api/lightd/manifest")
    eq("500 passed through, not swallowed", s, 500)

    print("\n[cache]")
    serve.CACHE.clear()
    SEEN.clear()
    req(base, "/api/lightd/manifest")
    req(base, "/api/lightd/manifest")
    req(base, "/api/lightd/manifest")
    eq("manifest is fetched once, not per request", len(SEEN), 1)
    SEEN.clear()
    req(base, "/api/lightd/themes")
    req(base, "/api/lightd/themes")
    eq("themes cached too", len(SEEN), 1)
    SEEN.clear()
    req(base, "/api/lightd/devices/Table%20Lamp/state")
    req(base, "/api/lightd/devices/Table%20Lamp/state")
    eq("live state is never cached", len(SEEN), 2)
    SEEN.clear()
    req(base, "/api/lightd/devices/x/command", "POST", {"action": "power", "value": True})
    req(base, "/api/lightd/manifest")
    ok("a write invalidates the cache", any(x["path"] == "/manifest" for x in SEEN))

    print("\n[rate guard]")
    serve.BUCKET.clear()
    serve.CACHE.clear()
    codes = [req(base, "/api/lightd/devices/d%d/state" % i)[0] for i in range(serve.RATE_MAX + 6)]
    ok("stays under the 120/min lightd budget", serve.RATE_MAX <= 110, serve.RATE_MAX)
    ok("guards locally before lightd does", 429 in codes,
       "no 429 in %d requests" % len(codes))
    eq("first request was allowed", codes[0], 200)
    serve.BUCKET.clear()

    print("\n[timeouts]")
    eq("a verified apply gets the long leash",
       serve.timeout_for("/themes/cozy/apply"), serve.SLOW_TIMEOUT)
    eq("a manifest refresh gets the long leash",
       serve.timeout_for("/manifest/refresh"), serve.SLOW_TIMEOUT)
    eq("a state read gets the short leash",
       serve.timeout_for("/devices/Table Lamp/state"), serve.FAST_TIMEOUT)
    eq("a plain command gets the short leash",
       serve.timeout_for("/devices/Table Lamp/command"), serve.FAST_TIMEOUT)
    ok("the short leash will not freeze the poller", serve.FAST_TIMEOUT <= 30, serve.FAST_TIMEOUT)
    ok("the long leash still covers a 90s apply", serve.SLOW_TIMEOUT >= 120, serve.SLOW_TIMEOUT)

    print("\n[lightd unreachable]")
    fake.shutdown()
    fake.server_close()          # release the port, so this is refused not hung
    serve.CACHE.clear()
    s, b = req(base, "/api/lightd/devices/y/state")
    eq("returns 502, not a hang", s, 502)
    try:
        offline = json.loads(b).get("offline") is True
    except Exception:
        offline = False
    ok("says it is offline", offline, b[:140])
    ok("does not leak the token in the error", TOKEN not in b)

    srv.shutdown()
    print("\n" + "-" * 56)
    print("%d passed, %d failed" % (PASS, len(FAILS)))
    if FAILS:
        print("\nFAILED:")
        for f in FAILS:
            print("  - " + f)
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
