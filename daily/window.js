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

/* The plain day/night background, for when today's special scene is not
   wanted: one place, drawn by day and by night, following the sun. */
const CYCLE = {
  scene: { file: "scenes/covered-bridge-creek.js", fn: "coveredBridgeCreekArt", opts: {} },
  night: { file: "scenes/covered-bridge-creek.js", fn: "coveredBridgeCreekArt", opts: { time: "night" } },
  fx: [], nightFx: [],
};
const store = { get(k){ try { return localStorage.getItem(k); } catch { return null; } },
                set(k, v){ try { localStorage.setItem(k, v); } catch {} } };

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
.w-player{position:absolute;left:64px;top:318px;width:660px;padding:18px;display:flex;gap:20px;align-items:center;
  animation:w-pop .45s ease both;transition:top .4s ease}
/* When rain is due the dry line goes and the rain card takes the bottom, so
   the player moves up into the space the dry line left. */
.win-stage.has-cast .w-player{top:240px}
.w-player[hidden]{display:none}
@keyframes w-pop{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:none}}
.w-player .media-art{width:200px;height:112px;border-radius:18px;flex:none;position:relative;overflow:hidden;
  background:linear-gradient(135deg,#2d3a52,#151c2a);display:grid;place-items:center}
/* Full art: the still fills the whole card, darkened on the left where the
   text sits, the way the old media column did. Without art (the Chromecast
   never sends any) the card stays glass with the small glyph plate. */
/* Full art: the card is the still's own 16:9 shape and the still fills all
   of it, sharp and uncropped. Title and controls sit at the foot over a
   scrim, as on the old media column. */
.w-player.has-art{width:540px;height:304px;padding:18px 20px;overflow:hidden;align-items:flex-end;
  background:#0a0e18 var(--art-full, var(--art)) no-repeat;
  background-size:var(--art-size, cover);background-position:var(--art-pos, center);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),0 12px 30px rgba(0,0,0,.4);transition:none}
.w-player.has-art::before{content:"";position:absolute;inset:0;z-index:0;
  background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 42%,rgba(0,0,0,.82) 100%)}
.w-player > *{position:relative;z-index:1}
.w-player.has-art .media-art{display:none}
.w-player.has-art .media{text-shadow:0 2px 10px rgba(0,0,0,.7)}
.win-stage.has-cast .w-player.has-art{width:412px;height:230px;padding-top:10px;padding-bottom:12px}
.win-stage.has-cast .w-player .media-by{display:none}
.win-stage.has-cast .w-player .media-controls{margin-top:6px}
.win-stage.has-cast .w-vol{margin-top:6px}
.w-player .media-art .plate-ring svg{width:56px;height:56px;opacity:.8}
.w-player .media{all:unset;display:block;flex:1;min-width:0;position:relative;z-index:2}
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
/* volume: its own full-width row, a thumb you can grab, 1% buttons either
   side, and the figure always showing */
.w-vol{display:flex;align-items:center;gap:10px;margin-top:10px}
.w-vb{width:52px;height:52px;flex:none;border-radius:50%;border:0;background:rgba(255,255,255,.18);color:#fff;
  font:500 30px/1 Outfit,"Segoe UI",sans-serif;display:grid;place-items:center;cursor:pointer;padding:0;touch-action:none;user-select:none}
.w-vb:active{background:rgba(255,255,255,.34)}
.w-player #media-vol{flex:1;min-width:0;height:52px;margin:0}
.w-player #media-vol::-webkit-slider-runnable-track{height:12px;border-radius:99px;border:0;
  background:linear-gradient(90deg,#fff var(--fill,100%),rgba(255,255,255,.25) var(--fill,100%))}
.w-player #media-vol::-webkit-slider-thumb{width:36px;height:36px;margin-top:-12px;border-radius:50%;background:#fff;border:0;
  box-shadow:0 2px 10px rgba(0,0,0,.5)}
.w-player .vol-val{opacity:1!important;visibility:visible!important;display:block!important;font-size:22px;font-weight:600;
  min-width:62px;text-align:right;font-variant-numeric:tabular-nums;color:#fff!important}

/* bottom left: the next two hours, only when something is due */
.w-cast{position:absolute;left:64px;bottom:44px;width:720px;padding:16px 26px 14px}
.w-cast[hidden]{display:none}
.w-cast .h{font-size:30px;font-weight:600;display:flex;gap:12px;align-items:center}
.w-cast .d{font-size:19px;opacity:.85;margin:2px 0 6px}

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
.w-more .row[hidden]{display:none!important}
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
.w-bgmode{position:absolute;right:70px;top:8px;width:44px;height:44px;border-radius:50%;border:0;padding:0;
  background:rgba(14,20,34,.35);color:#fff;cursor:pointer;opacity:.55;display:grid;place-items:center}
.w-bgmode svg{width:24px;height:24px}
.w-bgmode:hover,.w-menu:hover{opacity:.9}
.w-bgtip{position:absolute;right:124px;top:14px;font-size:18px;padding:5px 12px;border-radius:14px;
  background:rgba(14,20,34,.6);opacity:0;transition:opacity .3s;pointer-events:none;white-space:nowrap}
.w-bgtip.on{opacity:1}

/* new theme art on the dock keys */
.w-dock .qb .hero-art > *:not(svg){display:none}
.w-dock .qb .hero-art svg{position:absolute;inset:0;width:100%;height:100%}
.w-dock .qb::before,.w-dock .qb::after{display:none!important}
.w-dock .qb{background:#222!important}
.w-dock .qb.busy{opacity:.6}
.w-alltheme{width:100%;height:56px;border-radius:16px;border:0;cursor:pointer;color:#fff;
  background:rgba(255,255,255,.16);font:600 20px Outfit,"Segoe UI",sans-serif;display:flex;align-items:center;gap:12px;padding:0 16px}
.w-alltheme svg{width:26px;height:26px;flex:none}
.w-alltheme[aria-expanded="true"]{background:#fff;color:#141a26}

/* every theme, as pictures: the pop-out */
.w-pop{position:absolute;right:64px;bottom:200px;width:1524px;padding:18px 20px 20px;z-index:30;
  transform-origin:78% 100%;background:rgba(10,14,24,.72)}
.w-pop[hidden]{display:none}
.w-pop.open{animation:w-popin .38s cubic-bezier(.2,.9,.25,1.12) both}
.w-pop.closing{animation:w-popout .2s ease-in both}
@keyframes w-popin{from{opacity:0;transform:translateY(40px) scale(.9)}to{opacity:1;transform:none}}
@keyframes w-popout{to{opacity:0;transform:translateY(24px) scale(.96)}}
.w-pop-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.w-pop-h b{font-size:20px;letter-spacing:.14em;text-transform:uppercase;font-weight:600}
.w-pop-h span{font-size:18px;opacity:.7;margin-left:16px}
.w-pop .w-close{position:static}
.w-pop-grid{display:grid;grid-template-columns:repeat(7,200px);gap:14px}
.w-pt{position:relative;width:200px;height:125px;border-radius:20px;overflow:hidden;border:0;padding:0;cursor:pointer;
  background:#222;box-shadow:0 8px 20px rgba(0,0,0,.35);animation:w-tile .42s cubic-bezier(.2,.9,.3,1.15) both;
  animation-delay:calc(var(--i) * 16ms);transition:transform .15s ease, box-shadow .15s ease}
.w-pt:hover,.w-pt:focus-visible{transform:translateY(-4px) scale(1.03);box-shadow:0 14px 30px rgba(0,0,0,.45),0 0 0 3px #fff;outline:none}
.w-pt:active{transform:scale(.97)}
@keyframes w-tile{from{opacity:0;transform:translateY(22px) scale(.92)}to{opacity:1;transform:none}}
.w-pt svg{position:absolute;inset:0;width:100%;height:100%}
.w-pt .nm{position:absolute;left:12px;bottom:9px;font-size:21px;font-weight:600;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.7);z-index:2}
.w-pt .st{position:absolute;right:8px;top:6px;width:34px;height:34px;display:grid;place-items:center;font-size:20px;z-index:2;
  color:#fff;border-radius:50%;background:rgba(0,0,0,.28);opacity:.75}
.w-pt .st.on{color:#ffd24a;opacity:1}
.w-pt.busy::after{content:"";position:absolute;inset:0;background:rgba(255,255,255,.25);z-index:3}
@media (prefers-reduced-motion:reduce){.w-pop.open,.w-pop.closing,.w-pt{animation:none}}

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
const WS = { day: null, key: "", shown: "", fx: [], mode: "clear", night: false, cycle: store.get("win-bg") === "cycle" };

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
  if(!WS.day) return;
  const d = WS.cycle ? CYCLE : WS.day;               // the headline stays; only the picture changes
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
    card.innerHTML = `<div class="h">${ico}${escH(c.headline)}</div><div class="d">${escH(c.detail || "")}</div>${chart(c, fam === "snow" ? "#ffffff" : "#9fd8ff")}`;
    card.hidden = false;
    q("#w-dry").innerHTML = "";
    if(!q("#win-stage").classList.contains("has-cast")){ q("#win-stage").classList.add("has-cast"); FRAME.url = ""; setTimeout(frameArt, 0); }
  } else {
    card.hidden = true;
    if(q("#win-stage").classList.contains("has-cast")){ q("#win-stage").classList.remove("has-cast"); setTimeout(frameArt, 0); }
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
/* The next-hour chart, drawn to agree with the sentence above it.
   The forecast arrives as 15-minute buckets ({in, mm}, `in` = minutes from
   now to the bucket's start), but the headline says "stopping in 10 min" -
   so the rain is laid out minute by minute and then cut at the nowcast's own
   start and stop times. Blurring bucket into bucket used to paint rain for
   half an hour after the card said it would stop. The height scales to the
   heaviest minute shown, and the time axis zooms to one hour when everything
   happens inside it, the way the iPhone's does. */
function chart(c, col){
  const mm = (c && Array.isArray(c.minutes)) ? c.minutes : [];
  const grid = (c && c.grid_min) || 15;
  const num = (v, re, s) => v != null ? v : (m => m ? Number(m[1]) : null)(re.exec(s || ""));
  const text = ((c && c.headline) || "") + " " + ((c && c.detail) || "");
  const stops = num(c && c.stops_in, /stopping in (\d+)\s*min/i, text);
  const starts = num(c && c.starts_in, /starting in (\d+)\s*min/i, text);
  const lasts = num(c && c.lasts, /(?:for about|about) (\d+)\s*min/i, text);
  const at = t => { const b = mm.find(b => t >= b.in && t < b.in + grid); return b ? (b.mm || 0) : 0; };
  let prof = Array.from({length: 120}, (_, t) => at(t));
  if(stops != null) prof = prof.map((v, t) => t < stops ? Math.max(v, .15) : 0);
  if(starts != null) prof = prof.map((v, t) => {
    if(t < starts) return 0;
    if(lasts != null) return t < starts + lasts ? Math.max(v, .15) : 0;
    return t < starts + grid ? Math.max(v, .15) : v;      // no length given: trust the buckets
  });
  const lastWet = prof.reduce((a, v, t) => v > .02 ? t : a, -1);
  const span = Math.max(stops || 0, (starts || 0) + (lasts || 0), lastWet + 1) <= 55 ? 60 : 120;
  prof = prof.slice(0, span);
  const peak = Math.max(.6, ...prof);                 // light rain stays modest
  const w = 664, h = 86, fs = 15, plotH = h - fs - 8, n = 60, bw = w / n, per = span / n;
  let s = "";
  for(let k = 0; k < n; k++){
    const v = Math.max(...prof.slice(Math.floor(k * per), Math.floor((k + 1) * per)).concat(0));
    if(v <= .02) continue;
    const bh = Math.max(plotH * .3, v / peak * (plotH - 6));   // light rain still reads as rain
    s += `<rect x="${(k * bw + bw * .18).toFixed(1)}" y="${(plotH - bh).toFixed(1)}" width="${(bw * .64).toFixed(1)}" height="${bh.toFixed(1)}" rx="${(bw * .3).toFixed(1)}" fill="${col}"/>`;
  }
  const labels = span === 60 ? ["Now", "15m", "30m", "45m", "1h"] : ["Now", "30m", "1h", "1h 30m", "2h"];
  const gl = [.25, .5, .75].map(p => `<line x1="${p * w}" y1="0" x2="${p * w}" y2="${plotH}" stroke="rgba(255,255,255,.3)" stroke-dasharray="2 4"/>`).join("");
  const lab = labels.map((t, i) => `<text x="${i / 4 * w}" y="${h - 2}" fill="rgba(255,255,255,.75)" font-size="${fs}" text-anchor="${i === 0 ? "start" : i === 4 ? "end" : "middle"}">${t}</text>`).join("");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${gl}<line x1="0" y1="${plotH}" x2="${w}" y2="${plotH}" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-dasharray="3 3"/>${s}${lab}</svg>`;
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

/* ---------------------------------------------------- player art framing
   A thumbnail is often a tall picture on a dark 16:9 field (vertical video,
   album art). Find where the picture actually is - the columns and rows that
   are not near-black - and zoom so that region fills the card edge to edge,
   centred, a little high so faces and titles survive the crop. */
const FRAME = { url: "", box: null, w: 0, h: 0 };
function contentBox(img){
  const W = 160, H = Math.round(160 * img.naturalHeight / img.naturalWidth) || 90;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d", {willReadFrequently: true}); x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, lum = (i) => .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2];
  const col = new Array(W).fill(0), row = new Array(H).fill(0);
  for(let yy = 0; yy < H; yy++) for(let xx = 0; xx < W; xx++){ if(lum((yy * W + xx) * 4) > 38){ col[xx]++; row[yy]++; } }
  const on = (a, n) => a.map(v => v / n > .06);
  const cs = on(col, H), rs = on(row, W);
  let x0 = cs.indexOf(true), x1 = cs.lastIndexOf(true), y0 = rs.indexOf(true), y1 = rs.lastIndexOf(true);
  if(x0 < 0 || y0 < 0) return null;
  const pad = 2; x0 = Math.max(0, x0 - pad); x1 = Math.min(W - 1, x1 + pad); y0 = Math.max(0, y0 - pad); y1 = Math.min(H - 1, y1 + pad);
  return { x: x0 / W, y: y0 / H, w: (x1 - x0 + 1) / W, h: (y1 - y0 + 1) / H };
}
function frameArt(){
  const p = q("#w-player"); if(!p || p.hidden || !p.classList.contains("has-art")) return;
  const raw = (p.style.getPropertyValue("--art-full") || p.style.getPropertyValue("--art") || "").trim();
  const m = /url\("(.*)"\)/.exec(raw); if(!m) return;
  const cw = p.clientWidth, ch = p.clientHeight;
  const place = () => {
    const b = FRAME.box; if(!b || !FRAME.w){ p.style.removeProperty("--art-size"); p.style.removeProperty("--art-pos"); return; }
    const bw = b.w * FRAME.w, bh = b.h * FRAME.h, s = Math.max(cw / bw, ch / bh);
    const iw = FRAME.w * s, ih = FRAME.h * s;
    const ox = -(b.x * iw) + (cw - bw * s) / 2, oy = -(b.y * ih) + (ch - bh * s) * .35;
    p.style.setProperty("--art-size", `${iw.toFixed(1)}px ${ih.toFixed(1)}px`);
    p.style.setProperty("--art-pos", `${ox.toFixed(1)}px ${oy.toFixed(1)}px`);
  };
  if(FRAME.url === m[1]) return place();
  FRAME.url = m[1]; FRAME.box = null; FRAME.w = 0;
  const img = new Image(); img.crossOrigin = "anonymous";
  img.onload = () => { if(FRAME.url !== m[1]) return; FRAME.w = img.naturalWidth; FRAME.h = img.naturalHeight;
    try { FRAME.box = contentBox(img); } catch { FRAME.box = null; }   // a host without CORS: plain cover
    place(); };
  img.src = m[1];
}

/* ------------------------------------------------------------ theme art */
let artReady = null;
function loadThemeArt(){
  if(window.themeArt) return Promise.resolve();
  return artReady || (artReady = new Promise(res => {
    const s = document.createElement("script"); s.src = "/daily/theme-art.js";
    s.onload = res; s.onerror = res;            // no art: the keys keep their old pictures
    document.head.appendChild(s);
  }));
}
function decorateKeys(){
  if(!window.themeArt) return;
  document.querySelectorAll("#quick .qb").forEach(b => {
    if(b.dataset.ta === b.dataset.t) return;
    const nm = (b.querySelector(".nm2") || {}).textContent || b.dataset.t;
    const svg = themeArt(b.dataset.t, nm), box = b.querySelector(".hero-art");
    if(svg && box){ box.innerHTML = svg; b.dataset.ta = b.dataset.t; }
  });
}
let THEMES = null;
async function themeList(){
  if(THEMES) return THEMES;
  try {
    const r = await fetch("/api/lightd/themes", {cache: "no-store"}), j = await r.json();
    const list = Array.isArray(j) ? j : (j.themes || []);
    THEMES = list.map(t => ({id: t.id, name: t.name || t.id})).sort((a, b) => a.name.localeCompare(b.name));
  } catch { THEMES = []; }
  return THEMES;
}
const favList = () => { try { return typeof favs === "function" ? favs() : []; } catch { return []; } };
function paintStars(){
  const f = favList();
  document.querySelectorAll("#w-pop-grid .w-pt").forEach(t => {
    const on = f.includes(t.dataset.t), st = t.querySelector(".st");
    st.classList.toggle("on", on); st.textContent = on ? "★" : "☆";
    st.setAttribute("aria-label", (on ? "Remove " : "Keep ") + t.dataset.n + (on ? " from the dock" : " in the dock"));
  });
}
async function openPop(){
  await loadThemeArt();
  const list = await themeList(), grid = q("#w-pop-grid");
  if(grid.dataset.n !== String(list.length)){
    grid.innerHTML = list.map((t, i) => `<button class="w-pt" style="--i:${i}" data-t="${escH(t.id)}" data-n="${escH(t.name)}" aria-label="${escH(t.name)}">${(window.themeArt && themeArt(t.id, t.name)) || ""}<span class="nm">${escH(t.name)}</span><span class="st" role="button">☆</span></button>`).join("");
    grid.dataset.n = String(list.length);
  } else grid.querySelectorAll(".w-pt").forEach(t => { t.style.animation = "none"; void t.offsetWidth; t.style.animation = ""; });
  paintStars();
  const pop = q("#w-pop");
  pop.classList.remove("closing"); pop.hidden = false; void pop.offsetWidth; pop.classList.add("open");
  q("#w-alltheme").setAttribute("aria-expanded", "true");
  q("#w-today").style.visibility = "hidden";
}
function closePop(){
  const pop = q("#w-pop"); if(pop.hidden) return;
  pop.classList.remove("open"); pop.classList.add("closing");
  q("#w-alltheme").setAttribute("aria-expanded", "false");
  setTimeout(() => { pop.hidden = true; pop.classList.remove("closing"); if(q("#w-con").hidden) q("#w-today").style.visibility = ""; }, 200);
}

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
    <button class="w-bgmode" id="w-bgmode"></button>
    <span class="w-bgtip" id="w-bgtip"></span>
  </div>`;
  document.body.appendChild(root);

  // Quick apply: the favourite keys, redrawn with the new theme art whenever
  // the page repaints them (paintQuick rebuilds the row on every star).
  const quick = q("#quick"); if(quick) q("#w-quick").appendChild(quick);
  loadThemeArt().then(() => { decorateKeys(); if(quick) new MutationObserver(decorateKeys).observe(quick, {childList: true}); });
  // The rest of the list: one button, which opens every theme as a picture.
  // The old <select> row stays in the DOM (the page still fills it) but is
  // not shown here.
  const moreRow = q("#q-more") && q("#q-more").closest(".row");
  if(moreRow){ moreRow.hidden = true; q("#w-more").appendChild(moreRow); }
  const all = el("button", "w-alltheme", `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>All themes`);
  all.id = "w-alltheme"; all.setAttribute("aria-expanded", "false"); all.setAttribute("aria-controls", "w-pop");
  q("#w-more").appendChild(all);
  if(typeof wireMaster === "function") wireMaster();

  // The player, up and left. paintMedia finds its column by .bar-media and
  // shows or hides it, so this card is that column.
  const player = el("div", "w-player glass bar-media"); player.id = "w-player"; player.hidden = true;
  const artI = el("i", "media-art"); artI.setAttribute("aria-hidden", "true");
  player.append(artI);
  const mw = q("#media-w"); if(mw) player.append(mw);
  q("#win-stage").appendChild(player);

  // Volume gets its own row with 1% steps. The buttons move the page's own
  // slider and fire its own events, so the send-on-release logic in
  // index.html is still the one that talks to the player.
  const vol = q("#media-vol");
  if(vol && mw){
    const row = el("div", "w-vol");
    const minus = el("button", "w-vb", "−"), plus = el("button", "w-vb", "+");
    minus.setAttribute("aria-label", "Volume down 1%"); plus.setAttribute("aria-label", "Volume up 1%");
    row.append(minus, vol, plus);
    const vv = q("#media-vol-v"); if(vv) row.append(vv);
    mw.appendChild(row);
    let sendT = null, rep = null, repT = null;
    const nudge = d => {
      if(vol.disabled) return;
      vol.value = Math.max(0, Math.min(100, Number(vol.value) + d));
      vol.dispatchEvent(new Event("input"));
      clearTimeout(sendT); sendT = setTimeout(() => vol.dispatchEvent(new Event("change")), 450);
    };
    const hold = (btn, d) => {
      const stop = () => { clearTimeout(repT); clearInterval(rep); };
      btn.addEventListener("pointerdown", e => { e.preventDefault(); nudge(d); stop();
        repT = setTimeout(() => { rep = setInterval(() => nudge(d), 90); }, 380); });
      ["pointerup", "pointerleave", "pointercancel"].forEach(ev => btn.addEventListener(ev, stop));
      btn.addEventListener("keydown", e => { if(e.key === "Enter" || e.key === " "){ e.preventDefault(); nudge(d); } });
    };
    hold(minus, -1); hold(plus, 1);
    // Keep the figure current even when nobody is touching it.
    const showV = () => { const v = q("#media-vol-v"); if(v && !vol.matches(":active")) v.textContent = vol.value + "%"; };
    setInterval(showV, 1000); showV();
  }
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
  q("#w-menu").onclick = () => { location.search = "?view=classic"; };

  // Background: today's special scene, or the plain day/night cycle.
  const ICON_TODAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/><path d="M12 13l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 15.3l2-.3z" fill="currentColor" stroke="none"/></svg>';
  const ICON_CYCLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8" cy="12" r="3.2"/><path d="M8 5v1.5M8 17.5V19M2.8 12h1.4M3.9 7.9l1 1M3.9 16.1l1-1"/><path d="M19.5 14.5A5 5 0 0 1 14 8a5 5 0 1 0 5.5 6.5z" fill="currentColor" stroke="none"/></svg>';
  const bg = q("#w-bgmode"), tip = q("#w-bgtip");
  const paintBg = () => {
    bg.innerHTML = WS.cycle ? ICON_CYCLE : ICON_TODAY;
    const label = WS.cycle ? "Background: day/night cycle" : "Background: today's scene";
    bg.title = label + " (tap to switch)"; bg.setAttribute("aria-label", label + ", tap to switch");
    tip.textContent = WS.cycle ? "Day/night cycle" : "Today's scene";
  };
  let tipT = null;
  bg.onclick = e => {
    e.stopPropagation();
    WS.cycle = !WS.cycle; store.set("win-bg", WS.cycle ? "cycle" : "today");
    paintBg(); WS.shown = ""; paintScene();
    tip.classList.add("on"); clearTimeout(tipT); tipT = setTimeout(() => tip.classList.remove("on"), 1800);
  };
  paintBg();

  // Every theme, as pictures.
  const pop = el("div", "w-pop glass"); pop.id = "w-pop"; pop.hidden = true;
  pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "All themes");
  pop.innerHTML = `<div class="w-pop-h"><div><b>All themes</b><span>Tap one to set every light · ★ keeps it in the dock</span></div>
    <button class="w-close" id="w-pop-x" aria-label="Close">✕</button></div><div class="w-pop-grid" id="w-pop-grid"></div>`;
  q("#win-stage").appendChild(pop);
  all.onclick = e => { e.stopPropagation(); pop.hidden ? openPop() : closePop(); };
  q("#w-pop-x").onclick = closePop;
  pop.addEventListener("click", e => e.stopPropagation());
  q("#win-stage").addEventListener("click", () => { if(!pop.hidden) closePop(); });
  document.addEventListener("keydown", e => { if(e.key === "Escape" && !pop.hidden) closePop(); });
  q("#w-pop-grid").addEventListener("click", e => {
    const t = e.target.closest(".w-pt"); if(!t) return;
    const id = t.dataset.t, nm = t.dataset.n;
    if(e.target.closest(".st")){
      if(typeof toggleFav === "function") toggleFav(id, nm);
      setTimeout(paintStars, 250);
      return;
    }
    if(typeof applyTheme !== "function") return;
    t.classList.add("busy");
    applyTheme(id, null).finally(() => t.classList.remove("busy"));
    setTimeout(closePop, 350);
  });

  // Effects canvases.
  g = q("#wl-fx").getContext("2d"); ga = q("#wl-aur").getContext("2d");
  flake = document.createElement("canvas"); flake.width = flake.height = 32;
  const fc = flake.getContext("2d"), gr = fc.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.35, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  fc.fillStyle = gr; fc.fillRect(0, 0, 32, 32);

  addEventListener("resize", fit); fit();
  if(location.hash === "#cycle"){ WS.cycle = true; paintBg(); }      // preview the cycle without tapping
  loadDay();
  requestAnimationFrame(loop);
  // One slow tick for everything read from state the page keeps fresh.
  setInterval(() => {
    paintWeather();
    frameArt();
    if(dateKey(new Date()) !== WS.key) loadDay(); else paintScene();
    if(ST().run) openCon();
    const mic = q("#mini-mic"); q("#w-ask").classList.toggle("rec", !!(mic && mic.classList.contains("rec")));
  }, 3000);
  setTimeout(paintWeather, 800);
  // #allthemes opens the pop-out on load: a preview for a panel nobody is
  // standing at.
  if(location.hash === "#allthemes") setTimeout(openPop, 1200);
}
window.windowLayout = windowLayout;
})();
