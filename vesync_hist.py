import json
from vesync_raw import call, scrub
for b in [{"configModel": "VS_BT_SCL_ENS-C551S-SUS_US", "page": 1, "pageSize": 20, "syncTimestamp": 0},
          {"configModel": "", "page": 1, "pageSize": 20, "syncTimestamp": 0},
          {"page": 1, "pageSize": 20, "syncTimestamp": 0}]:
    r = call("/cloud/v1/deviceManaged/nutritionScale/getNutritionDailyRecord", b)
    print(list(b), r.get("code"), r.get("msg"), json.dumps(scrub(r.get("result")))[:2500])
    if r.get("code") == 0: break
