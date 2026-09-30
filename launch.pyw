"""Quick launch for the lights dashboard.

Run by pythonw.exe, so there is no console window. If the dashboard is already
up it just opens the tab; otherwise it starts serve.py detached, waits for the
port, and opens the tab. Closing the browser leaves the server running - stop it
from Task Manager, or run serve.py from Dashboard.bat when you want a window.
"""
import ctypes, json, socket, subprocess, sys, time, webbrowser
from pathlib import Path

HERE = Path(__file__).resolve().parent
PORT = 8790
try:
    # utf-8-sig: PowerShell writes this file with a BOM, and plain utf-8
    # would fail here and silently fall back to the default port.
    PORT = int(json.loads((HERE / "lightd.config.json").read_text(encoding="utf-8-sig")).get("port", PORT))
except Exception:
    pass
URL = "http://127.0.0.1:%d/" % PORT


def alive():
    with socket.socket() as s:
        s.settimeout(0.4)
        return s.connect_ex(("127.0.0.1", PORT)) == 0


def complain(msg):
    ctypes.windll.user32.MessageBoxW(0, msg, "Lights Dashboard", 0x10)


def main():
    if alive():
        webbrowser.open(URL)
        return

    # sys.executable is pythonw.exe here, which is what keeps this windowless.
    exe = sys.executable
    script = HERE / "serve.py"
    if not script.exists():
        return complain("serve.py is missing from\n%s" % HERE)

    flags = 0x08000000 | 0x00000008  # CREATE_NO_WINDOW | DETACHED_PROCESS
    try:
        subprocess.Popen([exe, str(script), "--no-browser"], cwd=str(HERE),
                         creationflags=flags, close_fds=True)
    except Exception as e:
        return complain("Could not start the dashboard:\n%s" % e)

    for _ in range(40):          # up to ~10s
        if alive():
            webbrowser.open(URL)
            return
        time.sleep(0.25)
    complain("The dashboard did not come up on port %d.\n\n"
             "Run Dashboard.bat to see why - it keeps its window open." % PORT)


if __name__ == "__main__":
    main()
