import json
from vesync_raw import call, scrub
for cm in ("WB_SCL_EFS-A591S_US", "VS_BT_SCL_ENS-C551S-SUS_US"):
    r = call("/cloud/v2/deviceManaged/getWeighingDataV2", {"configModule": cm, "allData": True, "page": 1, "pageSize": 5}, "getWeighingDataV2")
    print(cm, r.get("code"), r.get("msg"), json.dumps(scrub(r.get("result")))[:1500])
