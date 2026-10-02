"""vesync_raw.py - direct VeSync cloud calls with the saved session.
Usage: python vesync_raw.py <path> [json-extra]   e.g. /cloud/v1/deviceManaged/devices
Prints the response with token-like fields removed."""
import json, os, sys, time, uuid, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
tok = json.load(open(os.path.join(HERE, ".vesync.token.json")))
TOKEN, ACCT = tok["token"], str(tok["account_id"])

def call(path, extra=None, method=None):
    body = {"acceptLanguage": "en", "accountID": ACCT, "appVersion": "5.6.60", "phoneBrand": "SM N9005",
            "phoneOS": "Android", "timeZone": "America/New_York", "token": TOKEN, "traceId": str(int(time.time())),
            "userCountryCode": "US", "method": method or path.rsplit("/", 1)[-1], "pageNo": 1, "pageSize": 100,
            "debugMode": False, "terminalId": "2" + uuid.uuid4().hex[:31]}
    body.update(extra or {})
    req = urllib.request.Request("https://smartapi.vesync.com" + path, data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json; charset=UTF-8", "accountId": ACCT, "tk": TOKEN,
                 "User-Agent": "okhttp/3.12.1"}, method="POST")
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)

def scrub(o):
    if isinstance(o, dict):
        return {k: ("<hidden>" if any(s in k.lower() for s in ("token", "tk", "password", "email", "account")) else scrub(v)) for k, v in o.items()}
    if isinstance(o, list): return [scrub(x) for x in o]
    return o

if __name__ == "__main__":
    extra = json.loads(sys.argv[2]) if len(sys.argv) > 2 else None
    print(json.dumps(scrub(call(sys.argv[1], extra)), indent=1)[:6000])
