"""Run every test suite for the lights dashboard.

    py run_tests.py             # safe: nothing touches a bulb
    py run_tests.py --write     # adds one live round-trip on Table Lamp
    py run_tests.py --shot      # adds a real-browser render at 1280x800

Three layers, because each catches a different class of failure:

  ui        index.html in jsdom against a fake lightd. Records what the page
            puts on the wire. This is the layer that catches a control sending
            the wrong payload while still looking fine on screen - the bug that
            made every switch report success and change nothing.
  server    serve.py in-process against a fake lightd. Routing, the token never
            reaching the page, cache, rate guard, timeouts, error passthrough.
  contract  the real lightd. Everything the dashboard believes about the API.
            Read-only unless --write.
"""
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
PY = sys.executable


def run(label, cmd):
    print("\n" + "=" * 62)
    print("  " + label)
    print("=" * 62)
    t0 = time.time()
    r = subprocess.run(cmd, cwd=str(HERE))
    return label, r.returncode == 0, time.time() - t0


def main():
    write = "--write" in sys.argv
    shot = "--shot" in sys.argv
    results = []

    results.append(run("ui       index.html in a headless DOM",
                       ["node", str(HERE / "tests" / "ui_test.js")]))
    results.append(run("server   serve.py against a fake lightd",
                       [PY, str(HERE / "tests" / "server_test.py")]))

    contract = [PY, str(HERE / "tests" / "contract_test.py")]
    if write:
        contract.append("--write")
    results.append(run("contract the real lightd" + (" (with a live write)" if write else " (read-only)"),
                       contract))

    if shot:
        results.append(run("render   real browser at 1280x800",
                           [PY, str(HERE / "tests" / "render_test.py")]))

    print("\n" + "=" * 62)
    bad = 0
    for label, good, secs in results:
        print("  %s  %-52s %5.1fs" % ("PASS" if good else "FAIL", label, secs))
        bad += 0 if good else 1
    print("=" * 62)
    if not write:
        print("  (contract ran read-only; `--write` proves the power payload on a real bulb)")
    if not shot:
        print("  (`--shot` renders the page in Edge and checks the real layout)")
    print("  %d suite(s) failed" % bad if bad else "  everything passed")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
