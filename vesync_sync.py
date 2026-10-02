"""vesync_sync.py - pull every body-scale weigh-in into vesync_weights.json
(gitignored). Uses the saved session from vesync_probe.py."""
import json, os, time
from vesync_raw import call

HERE = os.path.dirname(os.path.abspath(__file__))
rows, page = [], 1
while True:
    r = call("/cloud/v2/deviceManaged/getWeighingDataV2",
             {"configModule": "WB_SCL_EFS-A591S_US", "allData": True, "page": page, "pageSize": 100}, "getWeighingDataV2")
    got = (r.get("result") or {}).get("weightDatas") or []
    rows += [{"t": d["timestamp"], "lb": round(d["weightG"] / 453.592, 1), "impedance": d.get("impedance")} for d in got]
    if len(got) < 100: break
    page += 1
rows.sort(key=lambda x: x["t"])
json.dump({"updated": int(time.time()), "weights": rows}, open(os.path.join(HERE, "vesync_weights.json"), "w"))
last = rows[-1] if rows else None
print(len(rows), "weigh-ins;", "first", time.strftime("%Y-%m-%d", time.localtime(rows[0]["t"])) if rows else "-",
      "; last", time.strftime("%Y-%m-%d", time.localtime(last["t"])) if last else "-", last and last["lb"], "lb")
