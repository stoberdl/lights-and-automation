/* ==========================================================================
   THE WINDOW - ?view=window. The bar as one full-bleed scene.

   The day's scene fills the whole 2560x720 strip; everything else floats on
   it. Like barLayout, this moves the page's existing nodes rather than
   rebuilding them: Quick apply, the media widget and the console keep their
   own render code and handlers, they just live somewhere else. What is new
   here is only the scene, the weather readout drawn from state the page
   already has (S.wx, S.cast, S.fc), and the animated weather on top.

   Scenes come from /daily/days.json, written by the daily script. A day
   names a scene file and function (daily/scenes/*.js, same shape as
   daily/reference/autumn-valley.js), optionally a night version, and the
   headline that says why today is worth looking at.

   Everything is inside this closure on purpose: index.html owns a lot of
   short global names ($, S, DAYS, MEDIA...), and the scene scripts are
   evaluated in their own Function scope for the same reason.
   ========================================================================== */
(function(){
"use strict";
const W = 2560, H = 720;
const FALLBACK = {
  kind: "Outside this week", title: "Autumn in the valley", detail: "", chips: [],
  scene: { file: "reference/autumn-valley.js", fn: "fallArt", opts: {} },
  fx: ["leaves"],
};

const CSS = `
html.win, html.win body{height:100%;overflow:hidden;background:#000}
html.win #sky, html.win #sky-front, html.win header, html.win .navwrap,
html.win main, html.win #tray, html.win #fs, html.win .rail{display:none!important}
html.win #toast{z-index:200}
#win{position:fixed;inset:0;background:#000;overflow:hidden;z-index:50;
  font-family:Outfit,"Segoe UI",system-ui,sans-serif;color:#fff}
.win-stage{position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0}
.wl{position:absolute;inset:0;width:${W}px;height:${H}px;display:block;pointer-events:none}
.wl-art{object-fit:cover}
#wl-clouds{animation:w-drift 120s ease-in-out infinite alternate}
@keyframes w-drift{from{transform:translateX(-70px)}to{transform:translateX(90px)}}
#wl-sky,#wl-land,#wl-clouds,#wl-art{transition:filter 1.5s ease}
#wl-tint{transition:background 1.5s ease}
#wl-aur{filter:blur(3px)}
.wl-shade{background:
  linear-gradient(90deg,rgba(0,0,0,.42),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 62%,rgba(0,0,0,.42)),
  linear-gradient(180deg,rgba(0,0,0,0) 58%,rgba(0,0,0,.3))}
.ts{text-shadow:0 2px 18px rgba(0,0,0,.5)}
.glass{background:rgba(14,20,34,.48);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);border-radius:30px}

/* top left: the weather */
.w-wx{position:absolute;left:64px;top:40px}
.w-clock{font-size:26px;letter-spacing:.08em;text-transform:uppercase;font-weight:500;opacity:.92}
.w-row{display:flex;align-items:flex-start;gap:30px;margin-top:4px}
.w-temp{font-size:190px;font-weight:200;line-height:.84;letter-spacing:-.05em}
.w-side{padding-top:14px}
.w-cond{font-size:40px;font-weight:500}
.w-hl{font-size:24px;opacity:.88;margin-top:4px}
.w-dry{display:inline-flex;gap:10px;align-items:center;margin-top:14px;font-size:22px;padding:8px 18px;
  border-radius:22px;background:rgba(14,20,34,.4)}
.w-dry:empty{display:none}

/* up and left: what's playing, only while something is */
.w-player{position:absolute;left:64px;top:300px;width:660px;padding:18px;display:flex;gap:20px;align-items:center;
  animation:w-pop .45s ease both}
.w-player[hidden]{display:none}
@keyframes w-pop{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
.w-player .media-art{width:200px;height:112px;border-radius:18px;flex:none;position:relative;overflow:hidden;
  background:linear-gradient(135deg,#2d3a52,#151c2a);display:grid;place-items:center}
.w-player.has-art .media-art{background:var(--art) center/cover no-repeat}
.w-player.has-art .media-art .plate-ring{display:none}
.w-player .media-art .plate-ring svg{width:56px;height:56px;opacity:.8}
.w-player .media{all:unset;display:block;flex:1;min-width:0}
.w-player .media, .w-player .media-src, .w-player .media-title, .w-player .media-by{color:#fff!important}
.w-player .media-state{font-size:14px;padding:3px 10px;border-radius:10px;background:rgba(93,255,154,.2);color:#b8ffd2!important;letter-spacing:.1em}
.w-player .mbtn{color:#fff!important}
.w-player .mbtn.play{color:#141a26!important}
.w-player .media-head{display:flex;gap:10px;align-items:center;font-size:17px;letter-spacing:.1em;text-transform:uppercase;opacity:.8}
.w-player .media-title{font-size:27px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:4px}
.w-player .media-by{font-size:20px;opacity:.82;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.w-player .media-controls{display:flex;align-items:center;gap:10px;margin-top:10px}
.w-player .mbtn{width:50px;height:50px;border-radius:50%;border:0;background:rgba(255,255,255,.15);color:#fff;
  display:grid;place-items:center;padding:0;cursor:pointer;flex:none}
.w-player .mbtn svg{width:24px;height:24px;fill:currentColor}
.w-player .mbtn.play{background:#fff;color:#141a26}
.w-player .media .i-pause,.w-player .media.paused .i-play{display:block}
.w-player .media .i-play,.w-player .media.paused .i-pause{display:none}
.w-player .media .i-mute,.w-player .media.muted .i-vol{display:none}
.w-player .media .i-vol,.w-player .media.muted .i-mute{display:block}
.w-player #media-vol{flex:1;min-width:0;accent-color:#fff;height:28px}

/* bottom left: the next two hours, only when something is due */
.w-cast{position:absolute;left:64px;bottom:44px;width:720px;padding:22px 28px}
.w-cast[hidden]{display:none}
.w-cast .h{font-size:32px;font-weight:600;display:flex;gap:12px;align-items:center}
.w-cast .d{font-size:20px;opacity:.85;margin:4px 0 10px}

/* top right: why today */
.w-today{position:absolute;right:64px;top:40px;text-align:right;max-width:1060px}
.w-kind{display:inline-flex;align-items:center;gap:10px;font-size:20px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;padding:8px 18px;border-radius:20px;background:rgba(14,20,34,.38);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.w-title{font-size:86px;font-weight:600;letter-spacing:-.025em;line-height:1;margin-top:14px;text-wrap:balance}
.w-detail{font-size:26px;opacity:.92;margin-top:10px;line-height:1.3}
.w-chips{display:flex;justify-content:flex-end;gap:10px;margin-top:14px;flex-wrap:wrap}
.w-chips span{font-size:19px;padding:6px 14px;border-radius:16px;background:rgba(14,20,34,.42);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}

/* bottom right: the dock */
.w-dock{position:absolute;right:64px;bottom:44px;display:flex;gap:14px;padding:14px;align-items:stretch}
#w-quick{flex:none}
.w-dock .quick{display:flex!important;flex-wrap:nowrap!important;gap:12px;margin:0!important;
  grid-template-columns:none!important;width:auto!important;max-width:none!important;min-width:0!important}
.w-dock .qb{flex:none!important}
.w-dock .qb{width:150px!important;height:128px!important;min-height:0!important;border-radius:22px!important;
  overflow:hidden;position:relative;padding:0!important;margin:0!important;border:0;cursor:pointer;flex:none}
.w-dock .qb .nm2{position:absolute;left:14px;bottom:10px;font-size:22px;font-weight:600;color:#fff;
  text-shadow:0 2px 8px rgba(0,0,0,.65);z-index:2}
.w-dock .qb .qstar{position:absolute;top:8px;right:10px;font-size:22px;z-index:2;color:#fff;
  text-shadow:0 1px 6px rgba(0,0,0,.6)}
.w-dock .qb .hero-art{position:absolute;inset:0}
.w-side2{display:flex;flex-direction:column;justify-content:space-between;width:330px;gap:10px;flex:none}
.w-master{display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:18px;background:rgba(255,255,255,.1)}
.w-master .qa-k{font-size:15px;letter-spacing:.14em;font-weight:600;opacity:.8}
.w-master input{flex:1;min-width:0;accent-color:#fff;height:30px}
.w-master .qa-v{font-size:22px;font-weight:600;width:62px;text-align:right}
.w-more{position:relative}
.w-more .row{display:flex;gap:8px;margin:0!important;align-items:center}
.w-more select{display:none!important}
.w-more .picker{flex:1;min-width:0;position:relative}
.w-more .pick-btn{width:100%;height:56px;border-radius:16px;border:0;background:rgba(255,255,255,.14);color:#fff;
  font:500 20px Outfit,"Segoe UI",sans-serif;text-align:left;padding:0 16px;cursor:pointer}
.w-more .pick-menu{position:absolute;right:0;bottom:64px;width:420px;max-height:560px;overflow:auto;padding:8px;
  border-radius:20px;background:rgba(14,20,34,.92);backdrop-filter:blur(18px);box-shadow:0 12px 40px rgba(0,0,0,.5);z-index:10}
.w-more .pick-row{font-size:22px;padding:12px 16px;border-radius:12px;cursor:pointer}
.w-more .pick-row.on,.w-more .pick-row:hover{background:rgba(255,255,255,.15)}
.w-more .btn{height:56px;min-width:56px;border-radius:16px;border:0;background:rgba(255,255,255,.14);color:#fff;
  font:600 20px Outfit,"Segoe UI",sans-serif;padding:0 16px;cursor:pointer}
.w-ask{width:128px;border-radius:24px;border:0;background:rgba(255,255,255,.94);color:#1a2230;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer;
  font:600 17px Outfit,"Segoe UI",sans-serif;letter-spacing:.06em}
.w-ask svg{width:52px;height:52px}
.w-ask.rec{background:#ff5b5b;color:#fff}
.w-menu{position:absolute;right:18px;top:8px;width:44px;height:44px;border-radius:50%;border:0;
  background:rgba(14,20,34,.35);color:#fff;font-size:22px;cursor:pointer;opacity:.55}

/* the console, when you ask for it or while Claude is working */
.w-con{position:absolute;right:64px;top:40px;width:1060px;height:440px;padding:20px 24px;display:flex;flex-direction:column}
.w-con[hidden]{display:none}
.w-con > .panel{all:unset;display:flex;flex-direction:column;flex:1;min-height:0}
.w-con h2{font-size:20px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;margin:0}
.w-con .console{flex:1;min-height:0;display:flex;flex-direction:column;margin-top:10px;background:transparent!important;border:0!important}
.w-con .console-out{flex:1;min-height:0;overflow:auto;font-size:20px;line-height:1.45}
.w-con .console-in{display:flex;gap:10px;align-items:flex-end;margin-top:10px}
.w-con textarea{flex:1;font:400 22px Outfit,"Segoe UI",sans-serif;color:#fff;background:rgba(255,255,255,.1);
  border:0;border-radius:14px;padding:12px 14px;resize:none}
.w-con .console-in button{width:56px;height:56px;border-radius:14px;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:22px}
.w-con .chips{display:none}
.w-close{position:absolute;right:16px;top:14px;width:44px;height:44px;border-radius:50%;border:0;
  background:rgba(255,255,255,.14);color:#fff;font-size:22px;cursor:pointer;z-index:2}
`;

/* ------------------------------------------------------------ small bits */
// index.html declares its state as a top-level `const S`, which is a global
// binding but not a property of window - so it is read by name, guarded.
const ST = () => (typeof S !== "undefined" ? S : {});
const q = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; };
const escH = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const R = (a, b) => a + Math.random() * (b - a);
const pad = n => String(n).padStart(2, "0");
const dateKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const DAYN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const hm = d => { let h = d.getHours(); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${pad(d.getMinutes())} ${ap}`; };
const ICON = {
  drop: '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" fill="#9fd8ff"/></svg>',
  snow: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/></svg>',
  bolt: '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="#ffd84a"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/></svg>',
};

/* ---------------------------------------------------------------- scenes */
const TEXT = {};
const getText = u => TEXT[u] || (TEXT[u] = fetch(u, {cache: "no-store"}).then(r => r.ok ? r.text() : Promise.reject(new Error(u + " " + r.status))));
async function sceneFn(spec){
  const code = await getText("/daily/" + spec.file);
  const helpers = await getText("/daily/reference/scene-helpers.js");
  try { return new Function(helpers + "\n;" + code + "\n;return " + spec.fn + ";")(); }
  catch(e){ return new Function(code + "\n;return " + spec.fn + ";")(); }   // a scene with its own helpers
}
const svgURL = s => URL.createObjectURL(new Blob([s], {type: "image/svg+xml"}));
const BUILT = {};
async function buildScene(spec){
  const key = JSON.stringify(spec);
  if(BUILT[key]) return BUILT[key];
  const f = await sceneFn(spec);
  const out = {};
  for(const part of ["sky", "clouds", "land"]) out[part] = svgURL(f({...(spec.opts || {}), part}));
  return (BUILT[key] = out);
}

/* ------------------------------------------------------------------ state */
const WS = { day: null, key: "", shown: "", fx: [], mode: "clear", night: false };

async function loadDay(){
  const key = dateKey(new Date());
  let days = {};
  try { days = await (await fetch("/daily/days.json", {cache: "no-store"})).json(); } catch {}
  WS.day = Object.assign({}, FALLBACK, days[key] || {});
  WS.key = key; WS.shown = "";
  paintToday();
  await paintScene();
}
async function paintScene(){
  const d = WS.day; if(!d) return;
  const night = ST().mood === "night";
  const spec = d.art ? {art: d.art} : (night && d.night) ? d.night : d.scene;
  const want = JSON.stringify(spec) + "|" + night;
  if(WS.shown === want) return;
  WS.shown = want; WS.night = night;
  const art = q("#wl-art");
  if(spec.art){
    art.hidden = false; art.src = "/daily/" + spec.art; art.style.objectPosition = d.focus || "center";
    ["#wl-sky", "#wl-clouds", "#wl-land"].forEach(s => q(s).removeAttribute("src"));
  } else {
    art.hidden = true;
    try {
      const u = await buildScene(spec);
      q("#wl-sky").src = u.sky; q("#wl-clouds").src = u.clouds; q("#wl-land").src = u.land;
    } catch(e){
      console.warn("scene failed, using the fallback", e);
      if(spec !== FALLBACK.scene){ const u = await buildScene(FALLBACK.scene);
        q("#wl-sky").src = u.sky; q("#wl-clouds").src = u.clouds; q("#wl-land").src = u.land; }
    }
  }
  // A day scene after dark without a night version of its own: take the
  // light out of it rather than show noon at midnight.
  WS.graded = night && !(d.night || d.art);
  WS.fx = (night && d.nightFx) ? d.nightFx : (d.fx || []);
  resetFx();
  paintWeather();
}
function paintToday(){
  const d = WS.day;
  q("#w-kind").textContent = d.kind || "";
  q("#w-kind").hidden = !d.kind;
  q("#w-title").textContent = d.title || "";
  q("#w-detail").textContent = d.detail || "";
  q("#w-chips").innerHTML = (d.chips || []).map(c => `<span>${escH(c)}</span>`).join("");
}

/* ------------------------------------------------------- weather readout */
function family(cond){
  const c = String(cond || "").toLowerCase();
  if(/lightning|thunder/.test(c)) return "storm";
  if(/snow|sleet|hail/.test(c)) return "snow";
  if(/rain|pouring|drizzle|shower/.test(c)) return "rain";
  if(/fog|mist|haze/.test(c)) return "fog";
  return "clear";
}
function paintWeather(){
  const S_ = ST(), wx = S_.wx || {}, c = S_.cast || null;
  const now = new Date();
  q("#w-clock").textContent = `${DAYN[now.getDay()]} ${MON[now.getMonth()]} ${now.getDate()} · ${hm(now)}`;
  q("#w-temp").textContent = wx.temp != null ? wx.temp + "°" : "--";
  let word = wx.cond || "";
  try { if(typeof wxArt === "function") word = wxArt(wx.cond).word || word; } catch {}
  if(wx.obs && wx.obs.text) word = wx.obs.text;
  q("#w-cond").textContent = word;
  const rows = (S_.fc || []).filter(r => r && r.temperature != null && new Date(r.time).toDateString() === now.toDateString());
  const bits = [];
  if(rows.length > 1){ const t = rows.map(r => Math.round(r.temperature)); bits.push(`H ${Math.max(...t)}° · L ${Math.min(...t)}°`); }
  if(typeof wx.mins === "number" && wx.mins > 0) bits.push("Sunset " + hm(new Date(now.getTime() + wx.mins * 60000)));
  q("#w-hl").textContent = bits.join(" · ");

  const mm = (c && Array.isArray(c.minutes)) ? c.minutes : [];
  const due = mm.some(b => b.mm >= 0.1) || (c && /starting|stopping|thunder|alert/.test(c.kind || ""));
  const card = q("#w-cast");
  if(due){
    const fam = family(c.kind === "thunder" ? "thunder" : wx.cond);
    const ico = c.kind === "alert" || fam === "storm" ? ICON.bolt : fam === "snow" ? ICON.snow : ICON.drop;
    card.innerHTML = `<div class="h">${ico}${escH(c.headline)}</div><div class="d">${escH(c.detail || "")}</div>${chart(mm, fam === "snow" ? "#ffffff" : "#9fd8ff")}`;
    card.hidden = false;
    q("#w-dry").innerHTML = "";
  } else {
    card.hidden = true;
    q("#w-dry").innerHTML = c ? `${ICON.drop.replace('width="30" height="30"', 'width="22" height="22"')} ${escH(c.headline === "Clear" || !c.detail ? "Dry for the next 2 hours" : c.detail)}` : "";
  }

  // The animated layer follows the sky the page already decided on.
  let mode = family(wx.cond);
  if(c && c.kind === "thunder") mode = "storm";
  if(mode !== WS.mode){ WS.mode = mode; resetFx(); }
  const dim = { clear: "none", fog: "brightness(.92) saturate(.7) contrast(.9)", rain: "brightness(.74) saturate(.72)",
                snow: "brightness(.9) saturate(.55)", storm: "brightness(.55) saturate(.6) contrast(1.05)" }[mode];
  const night = WS.graded ? " brightness(.42) saturate(.65) hue-rotate(-12deg)" : "";
  const f = (dim === "none" ? "" : dim) + night || "none";
  ["#wl-sky", "#wl-land", "#wl-clouds", "#wl-art"].forEach(s => q(s).style.filter = f);
  q("#wl-tint").style.background = {
    clear: WS.graded ? "rgba(10,20,60,.28)" : "transparent",
    fog: "linear-gradient(180deg,rgba(220,225,232,.25),rgba(220,225,232,.12))",
    rain: "linear-gradient(180deg,rgba(40,60,90,.28),rgba(20,30,50,.18))",
    snow: "linear-gradient(180deg,rgba(200,215,235,.22),rgba(220,230,240,.1))",
    storm: "linear-gradient(180deg,rgba(20,24,40,.45),rgba(10,14,24,.25))" }[mode];
}
function chart(mm, col){
  const w = 664, h = 104, fs = 16, plotH = h - fs - 10, n = 48, vals = mm.map(b => b.mm || 0);
  const val = k => { const x = k / (n - 1) * (vals.length - 1), i = Math.floor(x), f = x - i; return (vals[i] || 0) * (1 - f) + (vals[i + 1] || 0) * f; };
  const bw = w / n; let s = "";
  for(let k = 0; k < n; k++){ const v = val(k), bh = v <= .02 ? 0 : Math.max(3, Math.min(1, v / 1.6) * (plotH - 6));
    if(bh) s += `<rect x="${(k * bw + bw * .18).toFixed(1)}" y="${(plotH - bh).toFixed(1)}" width="${(bw * .64).toFixed(1)}" height="${bh.toFixed(1)}" rx="${(bw * .3).toFixed(1)}" fill="${col}"/>`; }
  const grid = [.25, .5, .75].map(p => `<line x1="${p * w}" y1="0" x2="${p * w}" y2="${plotH}" stroke="rgba(255,255,255,.3)" stroke-dasharray="2 4"/>`).join("");
  const lab = ["Now", "30m", "1h", "1h 30m", "2h"].map((t, i) => `<text x="${i / 4 * w}" y="${h - 2}" fill="rgba(255,255,255,.75)" font-size="${fs}" text-anchor="${i === 0 ? "start" : i === 4 ? "end" : "middle"}">${t}</text>`).join("");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${grid}<line x1="0" y1="${plotH}" x2="${w}" y2="${plotH}" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-dasharray="3 3"/>${s}${lab}</svg>`;
}

/* ---------------------------------------------------------------- effects */
const FX = { parts: [], splashes: [], flash: 0, bolt: null, nextBolt: 3, T: 0, t0: performance.now() };
let g, ga;
const LEAF = ["#c4461f", "#e0662a", "#ee8a30", "#f6b24a", "#ac3520", "#fcd97e"];
let flake;
function mkRain(d, top){ const sp = [700, 1150, 1700][d];
  return {k: "rain", d, x: R(-200, 2700), y: top ? R(-720, 0) : R(-60, 720), vy: sp * R(.9, 1.1), len: [12, 22, 40][d], a: [.16, .26, .34][d], w: [1, 1.4, 2.2][d], gy: R(560, 730)}; }
function mkSnow(d, top){ const sp = [26, 48, 85][d];
  return {k: "snow", d, x: R(0, 2560), y: top ? R(-720, 0) : R(-20, 720), vy: sp * R(.8, 1.2), r: [2.6, 4.6, 9][d] * R(.7, 1.3), sw: R(.4, 1.1), ph: R(0, 6.3), amp: [10, 22, 40][d], a: [.5, .75, .85][d]}; }
function leafBox(){ const f = (WS.fx || []).find(x => typeof x === "object" && x.leaves) ; return f ? f.leaves : [1180, 200, 1680, 440]; }
function mkLeaf(crown){ const [x0, y0, x1, y1] = leafBox();
  return {k: "leaf", x: crown ? R(x0, x1) : R(-100, 600), y: crown ? R(y0, y1) : R(-40, 200), vx: R(18, 60), vy: R(28, 62), rot: R(0, 6.3), vr: R(-2.2, 2.2), fl: R(0, 6.3), fs: R(2, 5), s: R(5, 9), c: LEAF[Math.floor(Math.random() * LEAF.length)], ph: R(0, 6.3)}; }
const has = name => (WS.fx || []).some(x => x === name || (typeof x === "object" && x[name]));
function resetFx(){
  FX.parts = []; FX.splashes = [];
  const m = WS.mode;
  if(m === "rain" || m === "storm"){ (m === "storm" ? [260, 200, 60] : [180, 130, 34]).forEach((c, d) => { for(let i = 0; i < c; i++) FX.parts.push(mkRain(d, false)); }); }
  if(m === "snow") [220, 120, 26].forEach((c, d) => { for(let i = 0; i < c; i++) FX.parts.push(mkSnow(d, false)); });
  if(has("leaves") && m !== "snow") for(let i = 0; i < 14; i++) FX.parts.push(mkLeaf(i % 3 !== 0));
  FX.flash = 0; FX.bolt = null; FX.nextBolt = 2.5;
  q("#wl-aur").style.display = has("aurora") ? "block" : "none";
}
function makeBolt(){ let x = R(700, 1900), y = 0; const pts = [[x, y]], br = [];
  while(y < R(330, 470)){ x += R(-38, 38); y += R(18, 40); pts.push([x, y]);
    if(Math.random() < .12){ let bx = x, by = y; const b = [[bx, by]]; for(let k = 0; k < 5; k++){ bx += R(-40, 40); by += R(15, 30); b.push([bx, by]); } br.push(b); } }
  return {pts, br, t: 0}; }
function step(dt){
  FX.T += dt; const T = FX.T, m = WS.mode, wind = m === "storm" ? .22 : .12;
  g.clearRect(0, 0, W, H);
  if(m === "storm"){
    FX.nextBolt -= dt;
    if(FX.nextBolt <= 0){ FX.bolt = makeBolt(); FX.flash = 1; FX.nextBolt = R(6, 13); }
    if(FX.bolt){ FX.bolt.t += dt; if(FX.bolt.t > .12 && FX.bolt.t < .16) FX.flash = Math.max(FX.flash, .7); if(FX.bolt.t > .5) FX.bolt = null; }
    FX.flash = Math.max(0, FX.flash - dt * 2.6);
    if(FX.flash > 0){ g.fillStyle = `rgba(210,220,255,${FX.flash * .42})`; g.fillRect(0, 0, W, H); }
    if(FX.bolt && FX.bolt.t < .35){ g.save(); g.strokeStyle = `rgba(235,240,255,${1 - FX.bolt.t / .35})`; g.shadowColor = "#b8c8ff"; g.shadowBlur = 28; g.lineJoin = "round";
      [[FX.bolt.pts, 4], ...FX.bolt.br.map(b => [b, 2])].forEach(([pts, w]) => { g.lineWidth = w; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }); g.restore(); }
  }
  const groundY = 600;
  for(const p of FX.parts){
    if(p.k === "rain"){
      p.y += p.vy * dt; p.x -= p.vy * wind * dt;
      if(p.d > 0 && p.y > p.gy){ if(Math.random() < .5) FX.splashes.push({x: p.x, y: p.gy, t: 0, s: p.d}); Object.assign(p, mkRain(p.d, true), {y: R(-80, -10)}); continue; }
      if(p.y > 740){ Object.assign(p, mkRain(p.d, true), {y: R(-80, -10)}); continue; }
      g.strokeStyle = `rgba(210,225,245,${p.a})`; g.lineWidth = p.w; g.lineCap = "round";
      g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + p.len * wind, p.y - p.len); g.stroke();
    } else if(p.k === "snow"){
      p.y += p.vy * dt; p.x += (Math.sin(T * p.sw + p.ph) * p.amp - 12) * dt;
      if(p.y > 730 || p.x < -20){ Object.assign(p, mkSnow(p.d, true), {y: R(-30, -5)}); continue; }
      g.globalAlpha = p.a; g.drawImage(flake, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); g.globalAlpha = 1;
    } else if(p.k === "leaf"){
      const gust = (m === "rain" || m === "storm") ? 2.2 : 1;
      p.x += (p.vx * gust + Math.sin(T * 1.3 + p.ph) * 26) * dt; p.y += (p.vy + Math.sin(T * 2 + p.ph) * 12) * dt; p.rot += p.vr * dt; p.fl += p.fs * dt;
      if(p.y > groundY + R(0, 90) || p.x > 2620){ Object.assign(p, mkLeaf(Math.random() < .7)); continue; }
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, Math.cos(p.fl));
      g.fillStyle = p.c; g.beginPath(); g.moveTo(-p.s, 0); g.quadraticCurveTo(0, -p.s * .75, p.s, 0); g.quadraticCurveTo(0, p.s * .75, -p.s, 0); g.fill();
      g.strokeStyle = "rgba(60,30,10,.5)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-p.s, 0); g.lineTo(p.s * 1.3, 0); g.stroke(); g.restore();
    }
  }
  FX.splashes = FX.splashes.filter(s => (s.t += dt * 4) < 1);
  g.lineWidth = 1.2;
  for(const s of FX.splashes){ g.strokeStyle = `rgba(220,230,245,${(1 - s.t) * .45})`; g.beginPath(); g.ellipse(s.x, s.y, 2 + s.t * (s.s * 5 + 4), .8 + s.t * 2.4, 0, Math.PI, 0); g.stroke(); }
  if(has("aurora")) aurora(T);
}
function aurora(T){
  ga.clearRect(0, 0, 1280, 360);
  ga.globalCompositeOperation = "lighter";
  for(const [base, amp, ph, rgb] of [[92, 42, 0, "80,255,170"], [110, 30, 1.7, "60,220,160"], [74, 26, 3.1, "170,120,255"]]){
    for(let x = 0; x < 1280; x += 3){
      const y = base + Math.sin(x / 150 + T * .12 + ph) * amp + Math.sin(x / 55 - T * .35 + ph) * amp * .3;
      const k = .35 + .65 * (Math.sin(x / 37 + T * .9 + ph * 2) * .5 + .5) * (Math.sin(x / 210 - T * .2) * .5 + .5);
      const h = 60 + k * 70, gr = ga.createLinearGradient(0, y, 0, y - h);
      gr.addColorStop(0, `rgba(${rgb},${.32 * k})`); gr.addColorStop(.25, `rgba(${rgb},${.2 * k})`); gr.addColorStop(1, `rgba(${rgb},0)`);
      ga.fillStyle = gr; ga.fillRect(x, y - h, 3, h + 6);
    }
  }
  ga.globalCompositeOperation = "source-over";
}
function loop(now){ const dt = Math.min(.05, (now - FX.t0) / 1000); FX.t0 = now; step(dt); requestAnimationFrame(loop); }

/* ----------------------------------------------------------------- layout */
function fit(){
  const st = q("#win-stage"); if(!st) return;
  const k = Math.min(innerWidth / W, innerHeight / H);
  st.style.transform = `translate(${(innerWidth - W * k) / 2}px,${(innerHeight - H * k) / 2}px) scale(${k})`;
}
function windowLayout(){
  document.documentElement.classList.add("win");
  const style = el("style"); style.textContent = CSS; document.head.appendChild(style);
  if(!document.querySelector('link[href*="family=Outfit"]')){
    const f = el("link"); f.rel = "stylesheet";
    f.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap";
    document.head.appendChild(f);
  }
  const root = el("div"); root.id = "win";
  root.innerHTML = `<div class="win-stage" id="win-stage">
    <img class="wl" id="wl-sky" alt="">
    <canvas class="wl" id="wl-aur" width="1280" height="360"></canvas>
    <img class="wl" id="wl-clouds" alt="">
    <img class="wl" id="wl-land" alt="">
    <img class="wl wl-art" id="wl-art" alt="" hidden>
    <div class="wl" id="wl-tint"></div>
    <canvas class="wl" id="wl-fx" width="${W}" height="${H}"></canvas>
    <div class="wl wl-shade"></div>
    <div class="w-wx ts">
      <div class="w-clock" id="w-clock"></div>
      <div class="w-row"><div class="w-temp" id="w-temp">--</div>
        <div class="w-side"><div class="w-cond" id="w-cond"></div><div class="w-hl" id="w-hl"></div></div></div>
      <div class="w-dry" id="w-dry"></div>
    </div>
    <div class="w-cast glass" id="w-cast" hidden></div>
    <div class="w-today ts" id="w-today">
      <div class="w-kind" id="w-kind"></div><div class="w-title" id="w-title"></div>
      <div class="w-detail" id="w-detail"></div><div class="w-chips" id="w-chips"></div>
    </div>
    <div class="w-con glass" id="w-con" hidden><button class="w-close" id="w-close" aria-label="Close">✕</button></div>
    <div class="w-dock glass" id="w-dock">
      <div id="w-quick"></div>
      <div class="w-side2">
        <div class="w-master"><span class="qa-k">ALL</span>
          <input type="range" id="q-master" min="0" max="100" step="5" value="100" aria-label="brightness for every light">
          <span class="qa-v" id="q-master-v">100%</span></div>
        <div class="w-more" id="w-more"></div>
      </div>
      <button class="w-ask" id="w-ask" aria-label="Ask Claude">${ICON.mic}ASK</button>
    </div>
    <button class="w-menu" id="w-menu" title="Full controls" aria-label="Full controls">☰</button>
  </div>`;
  document.body.appendChild(root);

  // Quick apply: the four keys, then the rest of the list behind a picker.
  const quick = q("#quick"); if(quick) q("#w-quick").appendChild(quick);
  const moreRow = q("#q-more") && q("#q-more").closest(".row");
  if(moreRow){ q("#w-more").appendChild(moreRow); const fav = q("#q-fav"); if(fav) fav.hidden = true; }
  if(typeof wirePicker === "function") wirePicker();
  if(typeof wireMaster === "function") wireMaster();

  // The player, up and left. paintMedia finds its column by .bar-media and
  // shows or hides it, so this card is that column.
  const player = el("div", "w-player glass bar-media"); player.id = "w-player"; player.hidden = true;
  const artI = el("i", "media-art"); artI.setAttribute("aria-hidden", "true");
  player.append(artI);
  const mw = q("#media-w"); if(mw) player.append(mw);
  q("#win-stage").appendChild(player);
  // paintMedia marks the column with has-art; mirror it into the card class
  // the CSS reads (it is the same element, so this is just the variable).

  // The console: out of the way until you ask, or while Claude is working.
  const con = q("#mini-console") && q("#mini-console").closest(".panel");
  if(con) q("#w-con").appendChild(con);
  const openCon = () => { q("#w-con").hidden = false; q("#w-today").style.visibility = "hidden"; };
  const closeCon = () => { if(ST().run) return; q("#w-con").hidden = true; q("#w-today").style.visibility = ""; };
  q("#w-close").onclick = closeCon;
  q("#w-ask").onclick = () => {
    openCon();
    const mic = q("#mini-mic");
    if(mic && !mic.hidden) mic.click(); else { const t = q("#mini-prompt"); if(t) t.focus(); }
  };
  q("#w-menu").onclick = () => { location.search = "?view=bar"; };

  // Effects canvases.
  g = q("#wl-fx").getContext("2d"); ga = q("#wl-aur").getContext("2d");
  flake = document.createElement("canvas"); flake.width = flake.height = 32;
  const fc = flake.getContext("2d"), gr = fc.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.35, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  fc.fillStyle = gr; fc.fillRect(0, 0, 32, 32);

  addEventListener("resize", fit); fit();
  loadDay();
  requestAnimationFrame(loop);
  // One slow tick for everything read from state the page keeps fresh.
  setInterval(() => {
    paintWeather();
    if(dateKey(new Date()) !== WS.key) loadDay(); else paintScene();
    if(ST().run) openCon();
    const mic = q("#mini-mic"); q("#w-ask").classList.toggle("rec", !!(mic && mic.classList.contains("rec")));
  }, 3000);
  setTimeout(paintWeather, 800);
}
window.windowLayout = windowLayout;
})();
