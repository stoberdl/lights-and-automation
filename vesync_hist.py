import json, time, datetime
from vesync_raw import call
y = datetime.date.today() - datetime.timedelta(days=1)
ts = int(time.mktime(y.timetuple()))
for b in [{"date": y.isoformat()}, {"syncTS": ts}, {"timestamp": ts}, {"queryTime": ts}, {"dateTS": ts}, {"day": y.isoformat()}, {"recordDate": y.isoformat()}, {"queryDate": y.isoformat()}, {"startTime": ts, "endTime": ts + 86399}]:
    r = call("/cloud/v1/getDailyIntakeCalorieByApp", b).get("result") or {}
    print(list(b), r.get("calorieK"), r.get("syncTS"), r.get("exerciseKcalTotal"))
