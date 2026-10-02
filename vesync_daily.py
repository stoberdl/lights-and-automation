"""vesync_daily.py - hourly: record today's calorie totals and sync weigh-ins.

VeSync only answers "today" for calories (getDailyIntakeCalorieByApp ignores
any date), so history is built here: one row per local date, overwritten each
hour, so the last poll of the day is that day's total.
Writes vesync_calories.json and vesync_weights.json (both gitignored).
Exit code 2 = the session was refused; vesync-daily.ps1 logs in again."""
import datetime, json, os, sys, time
from vesync_raw import call

HERE = os.path.dirname(os.path.abspath(__file__))
CAL = os.path.join(HERE, "vesync_calories.json")

r = call("/cloud/v1/getDailyIntakeCalorieByApp")
if r.get("code") != 0:
    print("calories refused:", r.get("code"), r.get("msg")); sys.exit(2)
x = r["result"]
day = datetime.date.today().isoformat()
try: hist = json.load(open(CAL))
except Exception: hist = {"days": {}}
hist["days"][day] = {"kcal": x.get("calorieK"), "goal": x.get("goalCaloriesK"), "exercise": x.get("exerciseKcalTotal"),
                     "protein": x.get("proteinG"), "fat": x.get("fatG"), "carbs": x.get("carbsG"), "at": int(time.time())}
hist["updated"] = int(time.time())
json.dump(hist, open(CAL, "w"), indent=1)
print(day, hist["days"][day]["kcal"], "/", hist["days"][day]["goal"], "kcal")

import vesync_sync  # noqa: E402,F401  (pulls weigh-ins on import)
