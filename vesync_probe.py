"""vesync_probe.py - log in to VeSync and list what the account has.
Credentials come from the environment (VS_USER / VS_PASS), set by
vesync-run.ps1 from the DPAPI-encrypted .vesync.cred. Never prints secrets."""
import asyncio, json, os
from pyvesync import VeSync

async def main():
    async with VeSync(os.environ["VS_USER"], os.environ["VS_PASS"]) as m:
        await m.login()
        await m.get_devices()
        out = []
        for d in m.devices:
            out.append({"name": getattr(d, "device_name", None), "type": getattr(d, "device_type", None),
                        "category": type(d).__name__, "product": getattr(d, "product_type", None)})
        print(json.dumps({"logged_in": True, "devices": out}, indent=1))
        # Keep the session for raw API calls, so the password is not needed again.
        auth = getattr(m, "auth", None) or m
        tok = {k: getattr(auth, k, None) for k in ("token", "account_id", "country_code", "_token", "_account_id")}
        with open(os.path.join(os.path.dirname(__file__), ".vesync.token.json"), "w") as f:
            json.dump({k: v for k, v in tok.items() if v}, f)
        print("session saved:", sorted(k for k, v in tok.items() if v))

asyncio.run(main())
