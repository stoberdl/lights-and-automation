"""Whatever this PC is playing, and the controls for it.

Why this is its own process
---------------------------
Windows exposes every app's transport controls through GSMTC - the same thing
the volume flyout shows - and per-app volume through Core Audio. Both are
scoped to a *logon session*. The dashboard server and lightd are started by a
scheduled task at boot, so they run in session 0, which has no desktop, no
audio endpoint and no media sessions at all: from there the browser playing
YouTube on the actual screen is invisible. Nothing about that is fixable with
permissions, so the part that has to see the desktop lives here and runs in the
interactive session, and serve.py asks it over loopback.

  python mediaagent.py            # http://127.0.0.1:8791

Security: bound to 127.0.0.1 only, and every request must carry
X-Media-Agent: 1. That header is what stops a random web page in the browser
from POSTing to this port - a form post cannot set a custom header, and
anything that tries is stopped by the CORS preflight, which is refused.

Single threaded on purpose: WinRT and COM both want an initialised apartment
per thread, and one media widget polling every few seconds needs no more.
"""
import asyncio, base64, json, sys, threading, time
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, HTTPServer

import comtypes
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, ISimpleAudioVolume

from winrt.windows.storage.streams import Buffer, DataReader, InputStreamOptions
from winrt.windows.media.control import (
    GlobalSystemMediaTransportControlsSessionManager as MediaManager,
    GlobalSystemMediaTransportControlsSessionPlaybackStatus as Status,
)

PORT = 8791
GUARD = ("X-Media-Agent", "1")

# The dashboard normally reaches this through serve.py, which is the path that
# also works from a phone. The page may additionally call here directly, and is
# allowed to only from these two origins - the dashboard served on this same
# machine, which is the only browser whose media sessions this agent can see
# anyway. Every other origin fails the preflight below, so a page from anywhere
# else cannot reach this port even to fire a request it ignores the answer to.
ORIGINS = {"http://127.0.0.1:8790", "http://localhost:8790"}

# The app ids Windows reports for the browsers, lowercased. A browser is not
# treated as special beyond this: whatever it is playing is what the widget
# shows, because "the tab that is making noise" is the thing you want to pause
# and there is no way to ask which site it is - GSMTC reports the app, the
# title and the artist, never a URL.
BROWSERS = {"msedge.exe": "Edge", "chrome.exe": "Chrome", "firefox.exe": "Firefox",
            "brave.exe": "Brave", "opera.exe": "Opera", "vivaldi.exe": "Vivaldi"}

STATUS_NAME = {
    Status.CLOSED: "closed", Status.OPENED: "opened", Status.CHANGING: "changing",
    Status.STOPPED: "stopped", Status.PLAYING: "playing", Status.PAUSED: "paused",
}


def _app(session):
    aid = (session.source_app_user_model_id or "").strip()
    return aid, BROWSERS.get(aid.lower(), aid.rsplit("!", 1)[-1] or "unknown")


async def _sessions():
    mgr = await MediaManager.request_async()
    return mgr, list(mgr.get_sessions())


def _rank(session):
    """Playing beats paused, and a browser beats everything else.

    The point of the widget is the video you are watching, not the notification
    sound some app registered an hour ago and never cleared.
    """
    aid, _ = _app(session)
    playing = session.get_playback_info().playback_status == Status.PLAYING
    return (2 if playing else 0) + (1 if aid.lower() in BROWSERS else 0)


async def _pick(prefer=None):
    mgr, sessions = await _sessions()
    if not sessions:
        return None
    if prefer:
        for s in sessions:
            if (s.source_app_user_model_id or "").lower() == prefer.lower():
                return s
    return max(sessions, key=_rank)


def _audio_for(exe):
    """Every audio session belonging to that executable.

    A browser has one per process that is actually making sound, and which
    process owns the tab is not knowable from here - so the level is read from
    the first and written to all of them, which is what "the volume of the
    thing that is playing" means in practice.
    """
    out = []
    for s in AudioUtilities.GetAllSessions():
        try:
            if s.Process and s.Process.name().lower() == exe.lower():
                out.append(cast(s._ctl.QueryInterface(ISimpleAudioVolume),
                                POINTER(ISimpleAudioVolume)))
        except Exception:
            continue
    return out


MAX_THUMB = 1_500_000          # a still, not a download


async def _thumbnail(props):
    """The artwork Windows shows in its own volume flyout, as a data: URI.

    For a YouTube tab that is the video's still, which is the one picture of
    what is playing that exists on this machine - GSMTC hands out a stream,
    never a URL, so there is nothing to link to and it has to be encoded and
    sent inline. Anything that fails here is simply "no artwork": half the
    sessions Windows reports have none, and the widget is built to say so.
    """
    ref = getattr(props, "thumbnail", None)
    if ref is None:
        return None
    stream = await ref.open_read_async()
    size = int(stream.size or 0)
    if not size or size > MAX_THUMB:
        return None
    buf = Buffer(size)
    await stream.read_async(buf, size, InputStreamOptions.NONE)
    out = bytearray(buf.length)
    DataReader.from_buffer(buf).read_bytes(out)      # fills, does not return
    raw = bytes(out)
    if not raw:
        return None
    # Sniffed, not trusted: content_type on the stream is usually empty, and a
    # data: URI with the wrong type is silently dropped by the browser.
    mime = "image/png" if raw[:8] == b"\x89PNG\r\n\x1a\n" else "image/jpeg"
    return f"data:{mime};base64,{base64.b64encode(raw).decode()}"


async def _describe():
    s = await _pick()
    if s is None:
        return {"playing": False, "found": False}
    aid, app = _app(s)
    info = s.get_playback_info()
    status = STATUS_NAME.get(info.playback_status, "unknown")
    thumb = None
    try:
        props = await s.try_get_media_properties_async()
        title, artist = props.title or "", props.artist or ""
        try:
            thumb = await _thumbnail(props)
        except Exception:
            thumb = None
    except Exception:
        title = artist = ""
    controls = info.controls
    out = {
        "found": True,
        "app": app, "app_id": aid, "is_browser": aid.lower() in BROWSERS,
        "title": title, "artist": artist, "thumb": thumb,
        "status": status, "playing": status == "playing",
        "can": {
            "play": bool(controls.is_play_enabled),
            "pause": bool(controls.is_pause_enabled),
            "next": bool(controls.is_next_enabled),
            "previous": bool(controls.is_previous_enabled),
        },
        "volume": None, "muted": None,
    }
    try:
        tl = s.get_timeline_properties()
        pos, end = tl.position.total_seconds(), tl.end_time.total_seconds()
        if end > 0:
            out["position"], out["duration"] = round(pos), round(end)
    except Exception:
        pass
    vols = _audio_for(aid) if aid.lower().endswith(".exe") else []
    if vols:
        out["volume"] = round(vols[0].GetMasterVolume(), 3)
        out["muted"] = bool(vols[0].GetMute())
    return out


async def _command(action, value):
    s = await _pick()
    if s is None:
        return {"ok": False, "error": "nothing is playing"}
    if action in ("play", "pause", "playpause", "next", "previous"):
        fn = {
            "play": s.try_play_async,
            "pause": s.try_pause_async,
            "playpause": s.try_toggle_play_pause_async,
            "next": s.try_skip_next_async,
            "previous": s.try_skip_previous_async,
        }[action]
        ok = bool(await fn())
        return {"ok": ok, "did": action}
    aid, _ = _app(s)
    vols = _audio_for(aid)
    if not vols:
        return {"ok": False, "error": f"no audio session for {aid}"}
    if action == "volume":
        level = max(0.0, min(1.0, float(value)))
        for v in vols:
            v.SetMasterVolume(level, None)
            v.SetMute(0, None)      # a level you chose implies not muted
        return {"ok": True, "did": "volume", "volume": round(level, 3)}
    if action in ("mute", "unmute"):
        for v in vols:
            v.SetMute(1 if action == "mute" else 0, None)
        return {"ok": True, "did": action}
    return {"ok": False, "error": f"unknown action {action}"}


"""One worker thread, and it must be MTA.

Importing comtypes puts whatever thread does it into a single-threaded
apartment, and an STA thread only receives cross-process COM replies while it
pumps window messages - which an HTTP server does not. Everything here was
in-process enough not to care until the thumbnail: reading it opens a stream
that lives in the *browser*, and that call went out from the STA thread and
never came back. It did not time out, it deadlocked, which is why it has to be
this rather than a retry. So the COM work happens on one dedicated thread
initialised multi-threaded, and the request handlers wait on it.

Still exactly one thread, for the same reason as before: one media widget
polling every few seconds does not need two, and COM is happier this way.
"""
def _worker_init():
    comtypes.CoInitializeEx(0)                       # COINIT_MULTITHREADED


COM = ThreadPoolExecutor(max_workers=1, initializer=_worker_init,
                         thread_name_prefix="media-com")


def run_com(coro_factory):
    """Run a coroutine on the COM thread and wait for its result."""
    return COM.submit(lambda: asyncio.run(coro_factory())).result(timeout=20)


class Handler(BaseHTTPRequestHandler):
    server_version = "mediaagent/1"

    def log_message(self, *a):
        pass                                   # the console is not a log file

    def _guard(self):
        if self.headers.get(GUARD[0]) != GUARD[1]:
            self.send_json(403, {"detail": "missing agent header"})
            return False
        return True

    def _origin(self):
        o = self.headers.get("Origin")
        return o if o in ORIGINS else None

    def send_json(self, code, body):
        raw = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        allow = self._origin()
        if allow:
            self.send_header("Access-Control-Allow-Origin", allow)
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        """The preflight, which is the whole access control for browsers.

        A page can only send the X-Media-Agent header if this answers, and this
        only answers for the dashboard's own origin - so refusing here is what
        keeps every other site off this port.
        """
        allow = self._origin()
        if not allow:
            return self.send_json(403, {"detail": "origin not allowed"})
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", allow)
        self.send_header("Access-Control-Allow-Headers", "X-Media-Agent, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()

    def do_GET(self):
        if not self._guard():
            return
        if self.path.split("?")[0] not in ("/", "/session"):
            return self.send_json(404, {"detail": "not found"})
        try:
            self.send_json(200, run_com(_describe))
        except Exception as e:
            self.send_json(500, {"detail": f"{type(e).__name__}: {e}"})

    def do_POST(self):
        if not self._guard():
            return
        action = self.path.split("?")[0].strip("/").lower()
        n = int(self.headers.get("Content-Length") or 0)
        try:
            body = json.loads(self.rfile.read(n) or b"{}")
        except ValueError:
            body = {}
        try:
            value = body.get("value")
            self.send_json(200, run_com(lambda: _command(action, value)))
        except Exception as e:
            self.send_json(500, {"detail": f"{type(e).__name__}: {e}"})


def main():
    # No CoInitialize here on purpose: the COM apartment that matters is the
    # worker's, and this thread only serves HTTP. See run_com above.
    srv = HTTPServer(("127.0.0.1", PORT), Handler)
    srv.serve_forever()


if __name__ == "__main__":
    main()
