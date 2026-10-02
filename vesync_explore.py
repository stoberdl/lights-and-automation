"""Try candidate VeSync food-diary endpoints (found in the app's code)."""
import json, time, datetime
from vesync_raw import call, scrub

today = datetime.date.today()
d = today.isoformat(); w = (today - datetime.timedelta(days=6)).isoformat()
ts0 = int(time.mktime((today - datetime.timedelta(days=6)).timetuple())); ts1 = int(time.time())
FOOD = {"configModule": "VS_BT_SCL_ENS-C551S-SUS_US"}
paths = ["/cloud/v1/getDailyIntakeCalorieByApp",
         "/cloud/v1/deviceManaged/nutritionScale/getNutritionDailyRecord",
         "/iot/api/nutrition/v1/getNutritionDailyTdeeList",
         "/operation/v1/wellnessNotifyManaged/getUserCalorieStatus"]
bodies = [{}, dict(FOOD), {"date": d}, {"startDate": w, "endDate": d}, dict(FOOD, startDate=w, endDate=d),
          {"startTime": ts0, "endTime": ts1}, dict(FOOD, startTime=ts0, endTime=ts1), {"recordDate": d},
          {"dateList": [d]}, {"queryDate": d}, {"beginDate": w, "endDate": d}]
for p in paths:
    for b in bodies:
        try: r = call(p, b)
        except Exception as e: print(p, list(b), "EXC", e); continue
        ok = r.get("code") == 0
        print(p, list(b), r.get("code"), r.get("msg"), "|", json.dumps(scrub(r.get("result")))[:400] if ok else "")
        if ok: break
