"""vesync_history.py - every food-diary day from getNutritionDailyRecord.
Parameters decoded from the app (NutritionQueryParam: configModel, page,
pageSize, syncTimestamp = records changed since). Raw records are cached in
vesync_diary.json (gitignored); day totals go into vesync_calories.json."""
import json, os, sys
from vesync_raw import call

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "vesync_diary.json")
LISTS = ("quickFoodList", "foodList", "recipeFoodList", "mealList", "mealPlanFoodList", "mealPrepFoodList")

def item_kcal(f):
    k = f.get("caloriesKcal") or 0
    # A weighed food stores kcal for one listed serving (foodWeightG grams);
    # dailyServing is what was eaten, in dailyFoodUnit.
    if f.get("dailyFoodUnit") == "g" and f.get("foodWeightG") and f.get("dailyServing") is not None:
        return k * f["dailyServing"] / f["foodWeightG"]
    if f.get("dailyServing") is not None and f.get("serving"):
        return k * f["dailyServing"] / f["serving"]
    return k

def day_kcal(rec):
    return round(sum(item_kcal(f) for l in LISTS for f in (rec.get(l) or [])))

def pull(since=0):
    out, page = [], 1
    while True:
        r = call("/cloud/v1/deviceManaged/nutritionScale/getNutritionDailyRecord",
                 {"configModel": "VS_BT_SCL_ENS-C551S-SUS_US", "page": page, "pageSize": 100, "syncTimestamp": since})
        if r.get("code") != 0: raise SystemExit(f"diary refused: {r.get('code')} {r.get('msg')}")
        got = (r.get("result") or {}).get("nutritionDailyRecordList") or []
        out += got
        if len(got) < 100: return out
        page += 1

if __name__ == "__main__":
    try: raw = json.load(open(RAW))
    except Exception: raw = {"since": 0, "days": {}}
    recs = pull(raw.get("since", 0))
    for rec in recs:
        if rec.get("isDeleted"): raw["days"].pop(rec["dailyTimesDate"], None)
        else: raw["days"][rec["dailyTimesDate"]] = rec
        raw["since"] = max(raw.get("since", 0), rec.get("syncTimestamp") or 0)
    json.dump(raw, open(RAW, "w"))
    try: cal = json.load(open(os.path.join(HERE, "vesync_calories.json")))
    except Exception: cal = {"days": {}}
    for d, rec in raw["days"].items():
        row = cal["days"].setdefault(d, {})
        row["diary_kcal"] = day_kcal(rec)
        if "kcal" not in row: row["kcal"] = row["diary_kcal"]
    json.dump(cal, open(os.path.join(HERE, "vesync_calories.json"), "w"), indent=1)
    ds = sorted(raw["days"])
    print(len(recs), "records pulled;", len(ds), "days", ds[0] if ds else "-", "to", ds[-1] if ds else "-")
    for d in ds[-8:]: print(" ", d, cal["days"][d].get("diary_kcal"), "(live", cal["days"][d].get("kcal"), ")")
