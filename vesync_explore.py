"""Try candidate VeSync endpoints for the body scale and the food log."""
import json, time
from vesync_raw import call, scrub

BODY = {"configModule": "WB_SCL_EFS-A591S_US", "uuid": "00:00:00:00:00:00", "deviceType": "EFS-A591S"}
FOOD = {"configModule": "VS_BT_SCL_ENS-C551S-SUS_US", "uuid": "00000000-0000-0000-0000-000000000000", "deviceType": "ENS-C551S-SUS"}
now = int(time.time())
tries = [
    ("/cloud/v1/deviceManaged/fatScale/getWeighData", dict(BODY, weighDataFrom=0, page=1, pageSize=10, allData=True)),
    ("/cloud/v2/deviceManaged/getWeighData", dict(BODY, weighDataFrom=0, page=1, pageSize=10)),
    ("/cloud/v1/user/getUserInfo", {}),
    ("/cloud/v1/user/fitness/getUserProfile", {}),
    ("/cloud/v1/deviceManaged/nutritionScale/getDietRecord", dict(FOOD, startTime=now - 86400 * 7, endTime=now)),
    ("/cloud/v1/nutrition/getDietRecords", {"startTime": now - 86400 * 7, "endTime": now}),
]
for path, extra in tries:
    try:
        r = call(path, extra)
        s = json.dumps(scrub(r))
        print(path, "->", r.get("code"), r.get("msg"), "|", s[:700])
    except Exception as e:
        print(path, "-> EXC", e)
