/* ==========================================================================
   Theme art - one small illustration per lighting theme, drawn to the same
   standard as the daily scenes (reference/autumn-valley.js): layered depth,
   lit masses with shadow / mid / highlight tones, organic edges from a
   displacement filter, haze between layers, and a paper grain on top.

   themeArt(id, name) -> SVG string, 320x200, meant to be cropped with
   preserveAspectRatio "slice" into whatever tile holds it (the dock keys are
   nearly square, the pop-out tiles are wide), so every subject sits in the
   middle third.

   Every SVG gets its own id prefix: many of these sit in one document, and
   gradient or filter ids that collide would paint one tile with another's.
   ========================================================================== */
(function(){
"use strict";
const VW = 320, VH = 200;
let UID = 0;

function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hx = c => { c = c.replace("#", ""); return [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16)); };
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.max(0, Math.min(255, Math.round(v + (B[i] - v) * t))).toString(16).padStart(2, "0")).join(""); };
const hash = s => { let h = 7; for(const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

/* A drawing context: defs collected once, ids unique to this tile. */
function Ctx(seed){
  const id = "ta" + (++UID) + "_", r = rng(seed);
  const defs = [], body = [];
  const C = {
    r, id,
    def(s){ defs.push(s); },
    add(s){ body.push(s); },
    lin(stops, x2 = 0, y2 = 1){ const n = id + "g" + defs.length;
      defs.push(`<linearGradient id="${n}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`);
      return `url(#${n})`; },
    rad(cx, cy, rr, stops){ const n = id + "g" + defs.length;
      defs.push(`<radialGradient id="${n}" cx="${cx}" cy="${cy}" r="${rr}" gradientUnits="userSpaceOnUse">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</radialGradient>`);
      return `url(#${n})`; },
    blob(cx, cy, rx, ry, n){
      n = n || 7 + Math.floor(r() * 4); const pts = [];
      for(let i = 0; i < n; i++){ const a = i / n * 6.283 + r() * .3, k = .8 + r() * .35; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
      let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
      for(let i = 0; i < n; i++){ const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n], mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = mx - cx, dy = my - cy, L = Math.hypot(dx, dy) || 1, b = .45 * Math.hypot(x1 - x0, y1 - y0);
        d += ` Q${(mx + dx / L * b).toFixed(1)},${(my + dy / L * b).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`; }
      return d + "Z";
    },
    // smooth ridge from a few sines
    ridge(base, amp, ph, fr = [60, 27, 13]){ const w = [.6, .3, .1]; return x => base - fr.reduce((s, f, i) => s + (Math.sin(x / f + ph * (i + 1)) * .5 + .5) * w[i], 0) * amp; },
    peaks(base, amp, ph){ return x => base - ((1 - Math.abs(Math.sin(x / 48 + ph))) * .65 + (1 - Math.abs(Math.sin(x / 21 + ph * 2))) * .35) * amp; },
    path(fn, bottom = VH){ let d = `M0,${bottom} L0,${fn(0).toFixed(1)}`; for(let x = 0; x <= VW; x += 4) d += ` L${x},${fn(x).toFixed(1)}`; return d + ` L${VW},${bottom}Z`; },
    filt: { leafy: `url(#${id}leafy)`, cloud: `url(#${id}cloud)`, blur: `url(#${id}blur)`, soft: `url(#${id}soft)` },
  };
  defs.push(
    `<filter id="${id}leafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".35" numOctaves="2" seed="${seed % 97}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>`,
    `<filter id="${id}cloud" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="${seed % 89}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".8"/></filter>`,
    `<filter id="${id}blur"><feGaussianBlur stdDeviation="6"/></filter>`,
    `<filter id="${id}soft"><feGaussianBlur stdDeviation="1.4"/></filter>`,
    `<filter id="${id}grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>`);
  C.svg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid slice" width="100%" height="100%"><defs>${defs.join("")}</defs>${body.join("")}` +
    `<rect width="${VW}" height="${VH}" fill="${C.lin([[0, "#000", .0], [.7, "#000", 0], [1, "#000", .28]])}"/>` +
    `<rect width="${VW}" height="${VH}" filter="url(#${id}grain)" opacity=".1" style="mix-blend-mode:multiply"/></svg>`;
  return C;
}

/* ------------------------------------------------------------ the pieces */
function sky(C, stops){ C.add(`<rect width="${VW}" height="${VH}" fill="${C.lin(stops.map((c, i) => [i / (stops.length - 1), c]))}"/>`); }
function glow(C, x, y, rr, col, a = .7){ C.add(`<circle cx="${x}" cy="${y}" r="${rr}" fill="${C.rad(x, y, rr, [[0, col, a], [.35, col, a * .35], [1, col, 0]])}"/>`); }
function sun(C, x, y, rr, col = "#fff6d6", halo = "#ffe9b0"){ glow(C, x, y, rr * 7, halo, .75); C.add(`<circle cx="${x}" cy="${y}" r="${rr}" fill="${col}"/>`); }
function moon(C, x, y, rr, col = "#f4f1e0", halo = "#c9d4ff"){ glow(C, x, y, rr * 6, halo, .45); C.add(`<circle cx="${x}" cy="${y}" r="${rr}" fill="${col}"/><circle cx="${x - rr * .3}" cy="${y - rr * .2}" r="${rr * .2}" fill="#000" opacity=".07"/><circle cx="${x + rr * .25}" cy="${y + rr * .3}" r="${rr * .14}" fill="#000" opacity=".06"/>`); }
function stars(C, n, maxY = 120, bright = 1){ let s = ""; for(let i = 0; i < n; i++){ const x = C.r() * VW, y = Math.pow(C.r(), 1.4) * maxY, big = C.r() < .08;
  s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${big ? 1.1 : .55}" fill="#fff" opacity="${((.35 + C.r() * .6) * bright).toFixed(2)}"/>`; } C.add(s); }
function cloud(C, x, y, w, top = "#fbfcff", under = "#c6d3e6", hi = "#ffffff"){
  let s = `<g filter="${C.filt.cloud}">`; const L = [];
  for(let k = 0; k < 7; k++){ const t = k / 6; L.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .17 * (.6 + C.r() * .7), w * (.1 + C.r() * .07)]); }
  s += `<ellipse cx="${x}" cy="${y + w * .05}" rx="${w * .55}" ry="${w * .07}" fill="${under}"/>`;
  L.forEach(([a, b, R]) => s += `<ellipse cx="${a}" cy="${b + R * .35}" rx="${R * 1.15}" ry="${R * .75}" fill="${under}"/>`);
  L.forEach(([a, b, R]) => s += `<ellipse cx="${a}" cy="${b}" rx="${R}" ry="${R * .85}" fill="${top}"/>`);
  L.forEach(([a, b, R]) => s += `<ellipse cx="${a - R * .25}" cy="${b - R * .35}" rx="${R * .6}" ry="${R * .4}" fill="${hi}" opacity=".8"/>`);
  C.add(s + "</g>");
}
function land(C, fn, top, bot, rim){ C.add(`<path d="${C.path(fn)}" fill="${C.lin([[0, top], [1, bot]])}"/>`);
  if(rim){ let d = ""; for(let x = 0; x <= VW; x += 4) d += (x ? " L" : "M") + x + "," + fn(x).toFixed(1); C.add(`<path d="${d}" stroke="${rim}" stroke-width=".9" fill="none" opacity=".55"/>`); } }
function haze(C, y, h, col, a = .45){ C.add(`<rect x="0" y="${y}" width="${VW}" height="${h}" fill="${C.lin([[0, col, 0], [.6, col, a], [1, col, 0]])}"/>`); }
/* mountains with a shadow face from each peak down to the next valley */
function mountains(C, fn, top, bot, shadeCol, lightLeft = true, snow){
  C.add(`<path d="${C.path(fn)}" fill="${C.lin([[0, top], [1, bot]])}"/>`);
  const pts = []; for(let x = 0; x <= VW; x += 2) pts.push([x, fn(x)]);
  let s = "";
  for(let i = 1; i < pts.length - 1; i++){
    if(!(pts[i][1] < pts[i - 1][1] && pts[i][1] <= pts[i + 1][1])) continue;
    let j = i; if(lightLeft){ while(j < pts.length - 1 && pts[j + 1][1] >= pts[j][1]) j++; } else { while(j > 0 && pts[j - 1][1] >= pts[j][1]) j--; }
    const seg = lightLeft ? pts.slice(i, j + 1) : pts.slice(j, i + 1).reverse();
    const [px, py] = pts[i], [vx, vy] = pts[j], foot = Math.max(vy, py) + 40;
    s += `<path d="M${seg.map(p => p[0] + "," + p[1].toFixed(1)).join(" L")} L${vx},${foot} L${px + (vx - px) * .12},${foot}Z" fill="${shadeCol}" opacity=".22"/>`;
  }
  // Snow: the same ridge, filled white above a ragged snowline, so the caps
  // sit on the peaks instead of floating over them. Shaded faces stay cooler.
  if(snow){
    const cid = C.id + "sn" + Math.floor(C.r() * 1e6);
    let line = `M0,0 L${VW},0`; for(let x = VW; x >= 0; x -= 8) line += ` L${x},${(snow + Math.sin(x / 7) * 3 + (C.r() - .5) * 4).toFixed(1)}`;
    C.def(`<clipPath id="${cid}"><path d="${line}Z"/></clipPath>`);
    C.add(`<g clip-path="url(#${cid})"><path d="${C.path(fn)}" fill="#f2f6fb"/>${s.replace(/fill="[^"]*" opacity="\.22"/g, 'fill="#9fb4cc" opacity=".55"')}</g>`);
    s = "";
  }
  C.add(s);
}
/* many small lit trees following a ridge: the far-forest texture */
function forest(C, fn, size, pal, hazeCol, hz, rows = 2, conifer = .15){
  const t = [];
  for(let row = 0; row < rows; row++) for(let x = -6; x < VW + 6; x += size * (.9 + C.r() * .5)) t.push([x + C.r() * size * .4, fn(x) + row * size * .7 + size * .35, size * (.75 + C.r() * .45)]);
  t.sort((a, b) => a[1] - b[1]);
  let s = "";
  t.forEach(([x, y, z]) => {
    if(C.r() < conifer){ const c = mix("#2f4a2e", hazeCol, hz); s += `<path d="M${x},${y - z * 1.9} L${x + z * .55},${y} L${x - z * .55},${y}Z" fill="${c}"/><path d="M${x},${y - z * 1.9} L${x + z * .55},${y} L${x},${y}Z" fill="${mix(c, "#000", .2)}"/>`; return; }
    const c = mix(pal[Math.floor(C.r() * pal.length)], hazeCol, hz);
    s += `<path d="${C.blob(x + z * .12, y + z * .1, z * .95, z * .8, 6)}" fill="${mix(c, "#1a1008", .35)}"/><path d="${C.blob(x, y - z * .08, z * .85, z * .72, 6)}" fill="${c}"/><path d="${C.blob(x - z * .25, y - z * .35, z * .4, z * .28, 5)}" fill="${mix(c, "#fff3c8", .3)}"/>`;
  });
  C.add(`<g filter="${C.filt.leafy}">${s}</g>`);
}
/* a proper tree: trunk, limbs, a crown of lit leaf clusters */
function tree(C, x, y, s, ramp, trunk = "#4a2e1e"){
  let o = `<path d="M${x - 4 * s},${y} C${x - 3 * s},${y - 14 * s} ${x - 4 * s},${y - 24 * s} ${x - 1.5 * s},${y - 32 * s} L${x + 2 * s},${y - 32 * s} C${x + 3 * s},${y - 24 * s} ${x + 3.5 * s},${y - 14 * s} ${x + 5 * s},${y}Z" fill="${trunk}"/>`;
  [[-1, 24], [1, 26]].forEach(([d, a]) => o += `<path d="M${x},${y - a * s} q${d * 6 * s},${-5 * s} ${d * 12 * s},${-12 * s}" stroke="${trunk}" stroke-width="${1.6 * s}" fill="none" stroke-linecap="round"/>`);
  const cx = x, cy = y - 46 * s, L = [];
  for(let i = 0; i < 70; i++){ const a = C.r() * 6.283, d = Math.sqrt(C.r()); const px = cx + Math.cos(a) * d * 26 * s, py = cy + Math.sin(a) * d * 20 * s;
    const lit = ((-(px - cx) / (26 * s)) * .55 - ((py - cy) / (20 * s)) * .8) * .5 + .5; L.push([px, py, Math.max(0, Math.min(.999, lit * .8 + (C.r() - .5) * .3)), (3.2 + C.r() * 3) * s]); }
  L.sort((a, b) => a[2] - b[2]);
  o += `<g filter="${C.filt.leafy}">` + L.map(([a, b, v, R]) => `<path d="${C.blob(a, b, R, R * .82, 6)}" fill="${ramp[Math.floor(v * ramp.length)]}"/>`).join("") + "</g>";
  C.add(o);
}
/* a tiered conifer: jagged tiers, lit and shaded sides, optional snow */
function pine(C, x, y, h, col, lightLeft = true, snowy = false){
  const w = h * .34, lit = mix(col, "#e8f2d8", .22), dk = mix(col, "#000", .28);
  let s = `<rect x="${x - w * .07}" y="${y - h * .16}" width="${w * .14}" height="${h * .18}" fill="#3a2718"/>`;
  const tiers = 5;
  for(let t = 0; t < tiers; t++){
    const ty = y - h * .14 - t * h * .8 / tiers, tw = w * (1 - t / tiers * .8), top = ty - h * .32;
    const jag = k => ty + (k % 2 ? -h * .03 : h * .02);
    const Lp = `M${x},${top} L${x - tw},${ty} L${x - tw * .66},${jag(1)} L${x - tw * .33},${jag(2)} L${x},${jag(3)}Z`;
    const Rp = `M${x},${top} L${x + tw},${ty} L${x + tw * .66},${jag(1)} L${x + tw * .33},${jag(2)} L${x},${jag(3)}Z`;
    s += `<path d="${Lp}" fill="${lightLeft ? lit : dk}"/><path d="${Rp}" fill="${lightLeft ? dk : lit}"/>`;
    if(snowy) s += `<path d="M${x},${top} L${x - tw * .6},${ty - h * .09} L${x - tw * .25},${ty - h * .12} L${x},${ty - h * .08} L${x + tw * .3},${ty - h * .12} L${x + tw * .6},${ty - h * .09}Z" fill="#f1f6fb"/>`;
  }
  C.add(s);
}
function water(C, y, top, bot, refl){ C.add(`<rect x="0" y="${y}" width="${VW}" height="${VH - y}" fill="${C.lin([[0, top], [1, bot]])}"/>`);
  let s = ""; if(refl){ const [rx, rw, rc] = refl; for(let k = 0; k < 14; k++){ const yy = y + 3 + k * 4.2, w = rw * (1.2 - k * .04) * (.6 + C.r() * .8); s += `<rect x="${rx - w}" y="${yy}" width="${w * 2}" height="1.4" rx=".7" fill="${rc}" opacity="${(.6 - k * .035).toFixed(2)}"/>`; } }
  for(let k = 0; k < 26; k++) s += `<rect x="${(C.r() * VW).toFixed(1)}" y="${(y + 2 + C.r() * (VH - y)).toFixed(1)}" width="${(10 + C.r() * 34).toFixed(1)}" height=".7" fill="#fff" opacity="${(.06 + C.r() * .1).toFixed(2)}"/>`;
  C.add(s); }
function grass(C, fn, dark, light, n = 160){ let s = ""; for(let i = 0; i < n; i++){ const x = C.r() * VW, y = fn(x) + 2 + C.r() * 40, h = 3 + C.r() * 5;
  s += `<path d="M${x.toFixed(1)},${y.toFixed(1)} q${(-1 + C.r() * 2).toFixed(1)},${(-h * .6).toFixed(1)} ${(-2 + C.r() * 4).toFixed(1)},${(-h).toFixed(1)}" stroke="${C.r() < .5 ? light : dark}" stroke-width=".8" fill="none" opacity=".75"/>`; } C.add(s); }
function cabin(C, x, y, s, wall, roof, lightCol, snowRoof){
  let o = `<rect x="${x - 16 * s}" y="${y - 14 * s}" width="${32 * s}" height="${14 * s}" fill="${wall}"/><rect x="${x + 2 * s}" y="${y - 14 * s}" width="${14 * s}" height="${14 * s}" fill="#000" opacity=".18"/>`;
  for(let k = 1; k < 5; k++) o += `<rect x="${x - 16 * s}" y="${y - 14 * s + k * 2.8 * s}" width="${32 * s}" height="${.5 * s}" fill="#000" opacity=".18"/>`;
  o += `<path d="M${x - 19 * s},${y - 13 * s} L${x},${y - 27 * s} L${x + 19 * s},${y - 13 * s}Z" fill="${roof}"/>`;
  if(snowRoof) o += `<path d="M${x - 19.5 * s},${y - 13 * s} L${x},${y - 27.5 * s} L${x + 19.5 * s},${y - 13 * s} L${x + 17 * s},${y - 11.5 * s} L${x},${y - 24 * s} L${x - 17 * s},${y - 11.5 * s}Z" fill="#f1f6fb"/>`;
  o += `<rect x="${x + 7 * s}" y="${y - 30 * s}" width="${3.5 * s}" height="${8 * s}" fill="#5a4034"/>`;
  if(lightCol){ glow(C, x - 6 * s, y - 8 * s, 22 * s, lightCol, .5); }
  o += `<rect x="${x - 11 * s}" y="${y - 11 * s}" width="${6 * s}" height="${5 * s}" fill="${lightCol || "#6a8aa8"}"/><rect x="${x + 4 * s}" y="${y - 11 * s}" width="${6 * s}" height="${5 * s}" fill="${lightCol || "#6a8aa8"}"/><rect x="${x - 3 * s}" y="${y - 9 * s}" width="${5 * s}" height="${9 * s}" fill="#4a2e20"/>`;
  C.add(o);
}
function smoke(C, x, y, col = "#e6e2dc"){ C.add(`<g opacity=".45" filter="${C.filt.soft}">${[0, 1, 2, 3].map(k => `<circle cx="${x + k * 2.5}" cy="${y - k * 7}" r="${2 + k * 1.6}" fill="${col}"/>`).join("")}</g>`); }
function rain(C, n, col = "#dbe6f2"){ let s = ""; for(let i = 0; i < n; i++){ const x = C.r() * VW, y = C.r() * VH, l = 5 + C.r() * 9; s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - l * .22).toFixed(1)}" y2="${(y + l).toFixed(1)}" stroke="${col}" stroke-width=".6" opacity="${(.2 + C.r() * .35).toFixed(2)}"/>`; } C.add(s); }
function snowfall(C, n){ let s = ""; for(let i = 0; i < n; i++) s += `<circle cx="${(C.r() * VW).toFixed(1)}" cy="${(C.r() * VH).toFixed(1)}" r="${(.4 + C.r() * 1.3).toFixed(2)}" fill="#fff" opacity="${(.45 + C.r() * .5).toFixed(2)}"/>`; C.add(s); }
function pumpkin(C, x, y, s, lit){
  let o = `<ellipse cx="${x + 2 * s}" cy="${y + 1 * s}" rx="${13 * s}" ry="${2.5 * s}" fill="#000" opacity=".25"/>`;
  [[-7, "#c9570f"], [7, "#c9570f"], [-3.5, "#e06a16"], [3.5, "#e06a16"], [0, "#ef7d22"]].forEach(([dx, c]) => o += `<ellipse cx="${x + dx * s}" cy="${y - 7 * s}" rx="${6.5 * s}" ry="${7.5 * s}" fill="${c}"/>`);
  o += `<ellipse cx="${x - 3 * s}" cy="${y - 11 * s}" rx="${2 * s}" ry="${3 * s}" fill="#ffb05a" opacity=".6"/><path d="M${x - 1 * s},${y - 14 * s} q${1 * s},${-4 * s} ${3 * s},${-5 * s}" stroke="#4a5a1e" stroke-width="${1.6 * s}" fill="none" stroke-linecap="round"/>`;
  if(lit){ glow(C, x, y - 7 * s, 26 * s, "#ffb43a", .55);
    o += `<path d="M${x - 6 * s},${y - 9 * s} l${2.5 * s},${-3 * s} l${2.5 * s},${3 * s}Z M${x + 1 * s},${y - 9 * s} l${2.5 * s},${-3 * s} l${2.5 * s},${3 * s}Z M${x - 6 * s},${y - 5 * s} q${6 * s},${4 * s} ${12 * s},0 l${-2 * s},${1.5 * s} ${-2 * s},${-1 * s} ${-2 * s},${1 * s} ${-2 * s},${-1 * s} ${-2 * s},${1 * s}Z" fill="#ffd66a"/>`; }
  C.add(o);
}
const AUT = ["#c8452a", "#d85a26", "#e0702a", "#e98a2c", "#eaa032", "#f2c648", "#a13a2a", "#8a9a3c"];
const GREEN = ["#3f7a34", "#4f8c3a", "#5f9a40", "#6fa84a", "#86b653", "#2f6a30"];
const RAMP_AUT = ["#5e1a12", "#86261a", "#ac3520", "#cc4a22", "#e0662a", "#ee8a30", "#f6b24a", "#fcd97e"];
const RAMP_GRN = ["#1f3d1c", "#2c5426", "#3a6a2e", "#4c8036", "#62963f", "#7eac4c", "#9cc25e", "#c4dc86"];

/* ----------------------------------------------------------- the themes */
const T = {};

T.fall = C => {
  sky(C, ["#3b78c0", "#7fb3e0", "#e6dcc0", "#f4d9a8"]); sun(C, 118, 34, 9);
  cloud(C, 70, 40, 90); cloud(C, 250, 30, 100);
  mountains(C, C.peaks(118, 34, 1.3), "#8aa2c6", "#b9c3cf", "#50607a");
  haze(C, 100, 40, "#f4dcae");
  const h1 = C.ridge(128, 16, .7); land(C, h1, "#b59a62", "#9c8450"); forest(C, h1, 5, AUT, "#f4dcae", .35, 2);
  const h2 = C.ridge(150, 14, 2.1); land(C, h2, "#a0893f", "#7d6a30", "#e8c878"); forest(C, h2, 7, AUT, "#f4dcae", .12, 1);
  const m = x => 176 + Math.sin(x / 40) * 3 - Math.max(0, 40 - Math.abs(x - 160)) * .25;
  land(C, m, "#b8a452", "#65602a");
  // barn
  C.add(`<path d="M52,168 L52,154 L57,146 L68,141 L79,146 L84,154 L84,168Z" fill="#a8352a"/><path d="M68,168 L84,168 L84,154 L68,154Z" fill="#000" opacity=".16"/><rect x="63" y="156" width="10" height="12" fill="#f1e6d2"/><rect x="64.5" y="157.5" width="7" height="10.5" fill="#8a2a22"/><rect x="88" y="138" width="7" height="30" fill="#b9b4a8"/><rect x="92" y="138" width="3" height="30" fill="#8f8a80"/><path d="M88,138 Q91.5,133 95,138Z" fill="#7a8088"/>`);
  tree(C, 168, m(168) + 2, 1.9, RAMP_AUT);
  [[222, 176], [238, 179], [104, 175]].forEach(([x, y]) => C.add(`<rect x="${x - 6}" y="${y - 6}" width="12" height="8" rx="4" fill="#d8b456"/><ellipse cx="${x - 5}" cy="${y - 2}" rx="2" ry="4" fill="#e8c96a"/>`));
  grass(C, m, "#6a6228", "#c8b262");
};

T.forest = C => {
  sky(C, ["#8fc8e8", "#cfe8e0", "#eef4d8"]);
  glow(C, 250, 20, 180, "#fff6d0", .55);
  const h0 = C.ridge(96, 20, .4); land(C, h0, "#8fb09a", "#9fbca4"); forest(C, h0, 4, GREEN, "#e6f0e0", .55, 2, .5);
  haze(C, 90, 40, "#e6f0e0", .5);
  const h1 = C.ridge(128, 18, 1.8); land(C, h1, "#5f8a4a", "#4a7038"); forest(C, h1, 6, GREEN, "#e6f0e0", .25, 2, .45);
  // god rays
  C.add(`<g opacity=".18" filter="${C.filt.blur}">${[0, 1, 2, 3].map(k => `<path d="M${230 - k * 26},0 L${250 - k * 26},0 L${170 - k * 30},200 L${140 - k * 30},200Z" fill="#fffbe0"/>`).join("")}</g>`);
  const f = x => 182 + Math.sin(x / 50) * 3; land(C, f, "#4e7a34", "#2f4a20");
  C.add(`<path d="M150,200 C152,188 170,184 162,176 C158,172 160,168 166,166 L172,166 C168,170 168,174 172,178 C182,186 172,192 178,200Z" fill="#c9b58a" opacity=".85"/>`);
  [[120, 188, 60, true], [214, 186, 58, true], [34, 190, 120, true], [80, 196, 90, true], [266, 192, 110, true], [300, 198, 130, true]].forEach(([x, y, h, l]) => pine(C, x, y, h, "#3f7a3a", l));
  // ferns
  let s = ""; for(let i = 0; i < 14; i++){ const x = C.r() * VW, y = 186 + C.r() * 14; for(let k = -2; k <= 2; k++) s += `<path d="M${x},${y} q${k * 3},-6 ${k * 6},-9" stroke="#6fa84a" stroke-width="1.2" fill="none"/>`; } C.add(s);
};

T.ocean = C => {
  sky(C, ["#2f8fd8", "#7cc6ec", "#e4f4f4"]); sun(C, 238, 44, 10, "#fffbe8", "#fff2c0");
  cloud(C, 80, 48, 110); cloud(C, 200, 70, 70, "#ffffff", "#cfe0ee");
  C.add(`<path d="M0,120 Q40,110 70,114 T130,112 L130,122 L0,122Z" fill="#6f9a7a" opacity=".7"/>`);
  water(C, 120, "#39b6d8", "#0a5680", [238, 16, "#fff4c8"]);
  // waves
  let s = ""; for(let row = 0; row < 7; row++){ const y = 132 + row * 10; let d = `M-10,${y}`; for(let x = -10; x <= VW + 10; x += 20) d += ` q10,${-3 - row * .4} 20,0`; s += `<path d="${d}" stroke="#bff0ff" stroke-width="${.7 + row * .2}" fill="none" opacity="${(.25 + row * .06).toFixed(2)}"/>`; } C.add(s);
  // island + palms
  C.add(`<path d="M20,130 Q60,108 104,128 Z" fill="#3e7a44"/><path d="M20,130 Q60,112 104,128 L104,131 L20,131Z" fill="#e8d9a0"/>`);
  [[58, 124, 1, -.2], [72, 126, .8, .3]].forEach(([x, y, sc, lean]) => { const tx = x + lean * 30 * sc, ty = y - 34 * sc;
    let p = `<path d="M${x - 1.5 * sc},${y} Q${x + lean * 8},${y - 18 * sc} ${tx - .8},${ty} L${tx + .8},${ty} Q${x + lean * 8 + 2},${y - 18 * sc} ${x + 1.5 * sc},${y}Z" fill="#5a4030"/>`;
    for(let k = 0; k < 7; k++){ const a = -Math.PI * (.05 + k / 6 * .9), L = 16 * sc; p += `<path d="M${tx},${ty} Q${tx + Math.cos(a) * L * .5},${ty + Math.sin(a) * L * .6 - 3} ${tx + Math.cos(a) * L},${ty + Math.sin(a) * L * .5 + L * .35}" stroke="${k % 2 ? "#2f6a30" : "#3f8a3a"}" stroke-width="${2.2 * sc}" fill="none" stroke-linecap="round"/>`; }
    C.add(p); });
  // sailboat
  C.add(`<path d="M196,150 L232,150 L226,157 L202,157Z" fill="#23384a"/><path d="M214,150 L214,112 L236,148Z" fill="#fbfdff"/><path d="M214,112 L236,148 L226,148Z" fill="#cfe0ec"/><path d="M212,150 L212,120 L198,148Z" fill="#e9f3f8"/><rect x="213" y="110" width="1.4" height="42" fill="#3a2a20"/>`);
};

T.rainy = C => {
  sky(C, ["#51606f", "#7a8796", "#a7b0b8"]);
  cloud(C, 80, 40, 150, "#8e99a6", "#6a7684", "#a6b0bb"); cloud(C, 240, 30, 170, "#8e99a6", "#6a7684", "#a6b0bb");
  const h0 = C.ridge(112, 18, .9); land(C, h0, "#6e7d7c", "#7c8a88"); forest(C, h0, 5, ["#5b6d5a", "#667a62", "#4f604f"], "#a7b0b8", .45, 2, .4);
  haze(C, 100, 50, "#a7b0b8", .6);
  const f = x => 150 + Math.sin(x / 60) * 3; land(C, f, "#4c5a48", "#303a2e");
  cabin(C, 212, f(212) + 2, 1.5, "#6a4a3a", "#3a3a44", "#ffcf7a");
  smoke(C, 224, 100, "#c6ccd2");
  // puddle with the windows reflected
  C.add(`<ellipse cx="190" cy="178" rx="70" ry="9" fill="#8898a4" opacity=".55"/><rect x="199" y="172" width="8" height="10" fill="#ffcf7a" opacity=".45"/><rect x="221" y="172" width="8" height="10" fill="#ffcf7a" opacity=".45"/>`);
  [[40, 176, 70, true], [70, 184, 50, true], [292, 182, 76, false]].forEach(([x, y, h, l]) => pine(C, x, y, h, "#34453a", l));
  rain(C, 260);
  let s = ""; for(let i = 0; i < 16; i++){ const x = 130 + C.r() * 120, y = 172 + C.r() * 12; s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(2 + C.r() * 3).toFixed(1)}" ry=".7" fill="none" stroke="#dfe8f0" stroke-width=".5" opacity=".6"/>`; } C.add(s);
};

T.starry = C => {
  sky(C, ["#050818", "#141a44", "#2a2c5c"]);
  // the milky way: a soft diagonal band, then dense stars along it
  C.add(`<g filter="${C.filt.blur}" opacity=".55"><path d="M-20,150 C80,90 190,60 340,-10 L340,30 C200,90 90,120 -20,190Z" fill="#8f86d8"/><path d="M40,120 C120,80 200,55 300,10" stroke="#f4d6ff" stroke-width="14" fill="none" opacity=".45"/></g>`);
  stars(C, 170, 150); let s = ""; for(let i = 0; i < 160; i++){ const t = C.r(), x = -10 + t * 330, y = 150 - t * 150 + (C.r() - .5) * 40; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.3 + C.r() * .6).toFixed(2)}" fill="#fff" opacity="${(.4 + C.r() * .5).toFixed(2)}"/>`; } C.add(s);
  mountains(C, C.peaks(142, 50, .8), "#1c2448", "#141a36", "#000", false, 110);
  water(C, 150, "#1a2250", "#070a1c");
  // reflected stars and mountains
  let rr = ""; for(let i = 0; i < 40; i++) rr += `<rect x="${(C.r() * VW).toFixed(1)}" y="${(152 + C.r() * 46).toFixed(1)}" width="${(1 + C.r() * 5).toFixed(1)}" height=".6" fill="#dfe4ff" opacity="${(.2 + C.r() * .3).toFixed(2)}"/>`; C.add(rr);
  [[24, 176, 80], [44, 180, 58], [296, 178, 84]].forEach(([x, y, h]) => pine(C, x, y, h, "#0b1024", false));
  // a small tent glow on the shore
  glow(C, 250, 150, 26, "#ffcf7a", .6); C.add(`<path d="M240,151 L250,138 L260,151Z" fill="#ffb85a"/><path d="M250,138 L260,151 L253,151Z" fill="#d88a3a"/>`);
};

T.aurora = C => {
  sky(C, ["#030b16", "#0a2434", "#1c4450"]); stars(C, 150, 120);
  C.add(`<g filter="${C.filt.blur}" style="mix-blend-mode:screen">` + [0, 1, 2].map(k => { let d = `M-10,${60 + k * 14}`; for(let x = -10; x <= 330; x += 20) d += ` L${x},${60 + k * 14 + Math.sin(x / 40 + k) * 16}`;
    return `<path d="${d}" stroke="${k === 2 ? "#a47cff" : "#4dffb0"}" stroke-width="${22 - k * 5}" fill="none" opacity="${(.7 - k * .15).toFixed(2)}"/>`; }).join("") + `</g>`);
  let ray = ""; for(let x = 0; x < VW; x += 3){ const y0 = 64 + Math.sin(x / 40) * 16; ray += `<line x1="${x}" y1="${y0 - 30 - C.r() * 20}" x2="${x}" y2="${y0 + 4}" stroke="#7affc4" stroke-width="1" opacity="${(.05 + C.r() * .12).toFixed(2)}"/>`; } C.add(ray);
  mountains(C, C.peaks(132, 46, 2.2), "#1e3444", "#16283a", "#000", true, 104);
  water(C, 142, "#1d4a4a", "#061018");
  C.add(`<g opacity=".35" filter="${C.filt.soft}"><path d="M-10,150 C80,146 160,158 330,148" stroke="#4dffb0" stroke-width="10" fill="none"/></g>`);
  const f = x => 176 + Math.sin(x / 30) * 3; land(C, f, "#c9d6e2", "#9fb0c2");
  [[30, 182, 86], [58, 186, 60], [282, 184, 90], [306, 190, 70]].forEach(([x, y, h]) => pine(C, x, y, h, "#10261e", true, true));
  cabin(C, 176, f(176) + 1, 1.3, "#5a3a2a", "#2a2a34", "#ffc36a", true); smoke(C, 186, 120, "#c6d2dc");
};

T.snow = C => {
  sky(C, ["#9cc4e4", "#d6e8f4", "#f2f6fa"]); sun(C, 70, 40, 8, "#ffffff", "#f4f8ff");
  mountains(C, C.peaks(120, 60, 1.1), "#c8d8ea", "#e4ecf4", "#5a7090", true, 110);
  haze(C, 100, 40, "#f2f6fa", .6);
  const h1 = C.ridge(140, 14, 1.4); land(C, h1, "#f2f6fa", "#dfe8f0", "#ffffff");
  let s = ""; for(let x = 0; x < VW; x += 7) s += `<path d="M${x},${h1(x) + 4} l3,-12 l3,12Z" fill="#6a8a8a" opacity=".6"/><path d="M${x + 1.2},${h1(x) - 3} l1.8,-5 l1.8,5Z" fill="#ffffff" opacity=".8"/>`; C.add(s);
  const f = x => 172 + Math.sin(x / 45) * 4; land(C, f, "#ffffff", "#d8e4ee");
  C.add(`<path d="M0,190 C80,178 160,196 320,184 L320,200 L0,200Z" fill="#c4d4e2" opacity=".6"/>`);
  [[40, 182, 96], [72, 186, 66], [250, 180, 92], [286, 188, 110]].forEach(([x, y, h]) => pine(C, x, y, h, "#24483a", true, true));
  // a deer, small, lit from the left
  C.add(`<g transform="translate(170,170)"><ellipse cx="0" cy="-8" rx="9" ry="4" fill="#8a5a3a"/><ellipse cx="-2" cy="-9.5" rx="7" ry="2" fill="#a8744c"/><rect x="-7" y="-6" width="1.6" height="8" fill="#6a4228"/><rect x="5" y="-6" width="1.6" height="8" fill="#6a4228"/><path d="M8,-10 L11,-17 L14,-16 L12,-9Z" fill="#8a5a3a"/><path d="M12,-17 l-1,-5 M12,-19 l2,-3 M13,-17 l3,-4" stroke="#6a4a30" stroke-width=".7"/></g>`);
  snowfall(C, 90);
};

T.christmas = C => {
  sky(C, ["#0c1430", "#1e2a58", "#3a4270"]); stars(C, 90, 90); moon(C, 262, 34, 9);
  const h1 = C.ridge(128, 14, .6); land(C, h1, "#9aa8c4", "#7a88a8");
  let s = ""; for(let x = 0; x < VW; x += 6) s += `<path d="M${x},${h1(x) + 3} l2.6,-10 l2.6,10Z" fill="#1c3040"/>`; C.add(s);
  const f = x => 170 + Math.sin(x / 50) * 3; land(C, f, "#e8eef6", "#b8c6d8");
  // village
  [[60, 1.2], [104, 1], [230, 1.1], [272, 1.3]].forEach(([x, sc]) => cabin(C, x, f(x) + 1, sc, "#7a3a2e", "#2a2a38", "#ffcf6a", true));
  // the tree, lit
  const tx = 164, ty = f(164) + 2;
  glow(C, tx, ty - 40, 70, "#ffd27a", .35);
  pine(C, tx, ty, 92, "#1f5a34", true, true);
  const cols = ["#ff4a4a", "#ffd24a", "#4ad2ff", "#ff8ad2", "#ffffff"];
  let b = ""; for(let i = 0; i < 34; i++){ const t = C.r(), y = ty - 12 - t * 70, half = (1 - t) * 26 + 3, x = tx + (C.r() * 2 - 1) * half * .8; b += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + C.r() * .9).toFixed(1)}" fill="${cols[i % 5]}"/>`; }
  C.add(`<g filter="${C.filt.soft}" opacity=".7">${b}</g>` + b);
  C.add(`<path d="M${tx},${ty - 100} l2.4,5 5.4,.8 -4,3.8 1,5.4 -4.8,-2.6 -4.8,2.6 1,-5.4 -4,-3.8 5.4,-.8Z" fill="#ffe27a"/>`);
  glow(C, tx, ty - 96, 16, "#ffe27a", .8);
  [[152, ty, "#c8352a"], [174, ty + 1, "#2f7a4a"], [184, ty, "#e8c24a"]].forEach(([x, y, c]) => C.add(`<rect x="${x - 5}" y="${y - 8}" width="10" height="8" fill="${c}"/><rect x="${x - .7}" y="${y - 8}" width="1.4" height="8" fill="#fff" opacity=".8"/>`));
  snowfall(C, 70);
};

T.halloween = C => {
  sky(C, ["#140a26", "#3a1a4a", "#8a3a4a"]); stars(C, 70, 90); moon(C, 214, 50, 20, "#ffe6b0", "#ffb86a");
  const h1 = C.ridge(128, 16, 1.2); land(C, h1, "#3a2240", "#2a1830"); forest(C, h1, 5, ["#4a2a40", "#5a3040", "#3a2238"], "#8a3a4a", .35, 2, .5);
  // haunted house on a hill
  const hill = x => 150 - Math.max(0, 60 - Math.abs(x - 112)) * .45 + Math.sin(x / 30) * 2;
  land(C, hill, "#241430", "#12081a");
  C.add(`<g fill="#140a1c"><rect x="92" y="98" width="42" height="26"/><path d="M88,100 L113,80 L138,100Z"/><rect x="120" y="70" width="12" height="32"/><path d="M118,72 L126,56 L134,72Z"/><rect x="98" y="88" width="3" height="10"/></g>
    <rect x="100" y="106" width="6" height="7" fill="#ffb43a"/><rect x="118" y="106" width="6" height="7" fill="#ffb43a" opacity=".8"/><rect x="124" y="80" width="4" height="6" fill="#ffd66a"/>`);
  glow(C, 112, 108, 30, "#ffb43a", .35);
  // bare tree
  C.add(`<path d="M246,176 Q250,140 244,120 M244,130 Q232,118 222,116 M245,138 Q260,124 272,122 M246,124 Q252,106 262,98 M244,122 Q238,104 230,96" stroke="#0e0614" stroke-width="3.2" fill="none" stroke-linecap="round"/>`);
  // graves
  [[160, 170], [176, 174], [196, 168]].forEach(([x, y]) => C.add(`<path d="M${x - 5},${y} L${x - 5},${y - 9} Q${x},${y - 14} ${x + 5},${y - 9} L${x + 5},${y}Z" fill="#5a4a60"/><path d="M${x + 1},${y} L${x + 1},${y - 11} Q${x + 3},${y - 10} ${x + 5},${y - 9} L${x + 5},${y}Z" fill="#000" opacity=".25"/>`));
  pumpkin(C, 60, 186, 1.2, true); pumpkin(C, 282, 190, 1, true); pumpkin(C, 88, 192, .8, true);
  let bt = ""; [[200, 48, 1], [230, 70, .8], [188, 70, .7], [248, 40, .6]].forEach(([x, y, k]) => bt += `<path transform="translate(${x},${y}) scale(${k})" d="M0,0 q-4,-5 -10,-3 q2,2 2,4 q-3,-1 -5,2 q6,-1 13,2 q7,-3 13,-2 q-2,-3 -5,-2 q0,-2 2,-4 q-6,-2 -10,3z" fill="#0a0410"/>`); C.add(bt);
};

T.pumpkin = C => {
  sky(C, ["#f0a050", "#f8c878", "#fde2a8"]); sun(C, 250, 70, 12, "#fff2c8", "#ffd88a");
  cloud(C, 90, 40, 100, "#ffe8c8", "#e8a878", "#fff4e0");
  const h1 = C.ridge(116, 16, .5); land(C, h1, "#c49a5a", "#b08a4a"); forest(C, h1, 5, AUT, "#fde2a8", .35, 2);
  haze(C, 108, 30, "#fde2a8", .5);
  const f = x => 142 + Math.sin(x / 50) * 3; land(C, f, "#9a7a3a", "#6a4a20", "#f0c878");
  C.add(`<path d="M232,142 L232,124 L238,116 L252,110 L266,116 L272,124 L272,142Z" fill="#a8352a"/><path d="M252,142 L272,142 L272,124 L252,124Z" fill="#000" opacity=".15"/><rect x="246" y="128" width="12" height="14" fill="#f1e6d2"/><rect x="247.5" y="129.5" width="9" height="12.5" fill="#8a2a22"/>`);
  // vines and a field of pumpkins, bigger toward the front
  let v = ""; for(let i = 0; i < 26; i++){ const x = C.r() * VW, y = 150 + C.r() * 46; v += `<path d="${C.blob(x, y, 5, 2.4, 5)}" fill="#4a6a24" opacity=".85"/>`; } C.add(v);
  const P = []; for(let i = 0; i < 22; i++){ const y = 150 + C.r() * 44; P.push([C.r() * VW, y, .4 + (y - 150) / 44 * .9]); }
  P.sort((a, b) => a[1] - b[1]).forEach(([x, y, s]) => pumpkin(C, x, y, s, false));
  C.add(`<path d="M20,200 Q60,184 110,192 T200,196 L200,200Z" fill="#3a2a10" opacity=".25"/>`);
};

T.fire = C => {
  sky(C, ["#0a0612", "#1a0e20", "#2a1420"]); stars(C, 60, 80);
  const h1 = C.ridge(110, 20, .8); land(C, h1, "#1a1020", "#120a16");
  [[20, 150, 110], [50, 156, 90], [280, 150, 120], [304, 158, 90], [90, 146, 70], [238, 144, 76]].forEach(([x, y, h]) => pine(C, x, y, h, "#140c14", false));
  const f = x => 162 + Math.sin(x / 40) * 2; land(C, f, "#3a2418", "#1a0e0a");
  glow(C, 160, 150, 130, "#ff7a1f", .55); glow(C, 160, 156, 50, "#ffc05a", .6);
  // logs + stones
  C.add(`<g><ellipse cx="160" cy="170" rx="36" ry="6" fill="#000" opacity=".4"/>${[[-26, 0], [-14, 3], [0, 4], [14, 3], [26, 0]].map(([dx, dy]) => `<ellipse cx="${160 + dx}" cy="${168 + dy}" rx="6" ry="4" fill="#6a6260"/><ellipse cx="${159 + dx}" cy="${166.5 + dy}" rx="3.5" ry="1.8" fill="#ffae6a" opacity=".45"/>`).join("")}
    <path d="M136,166 L182,154 L184,160 L138,172Z" fill="#5a3a24"/><path d="M184,168 L140,154 L138,160 L182,172Z" fill="#6a4228"/><ellipse cx="183" cy="157" rx="2.5" ry="3.2" fill="#ff8a3a"/></g>`);
  // layered flames: dark orange, orange, yellow, white core
  const flame = (h, w, col, dx = 0) => `<path d="M${160 + dx - w},160 C${160 + dx - w},${160 - h * .4} ${160 + dx - w * .3},${160 - h * .6} ${160 + dx - w * .1},${160 - h} C${160 + dx + w * .2},${160 - h * .7} ${160 + dx + w * .7},${160 - h * .55} ${160 + dx + w * .4},${160 - h * .9} C${160 + dx + w * 1.1},${160 - h * .5} ${160 + dx + w},${160 - h * .2} ${160 + dx + w},160Z" fill="${col}"/>`;
  C.add(`<g filter="${C.filt.soft}">${flame(64, 22, "#d8401a")}${flame(50, 17, "#ff7a1f", 2)}${flame(36, 12, "#ffb43a", -1)}${flame(22, 7, "#ffe27a")}${flame(11, 3.5, "#fffbe0")}</g>`);
  let sp = ""; for(let i = 0; i < 26; i++){ const x = 150 + (C.r() - .5) * 60, y = 40 + C.r() * 90; sp += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.4 + C.r() * .8).toFixed(1)}" fill="#ffc05a" opacity="${(.4 + C.r() * .6).toFixed(2)}"/>`; } C.add(sp);
};

T.candlelight = C => {
  sky(C, ["#1a0e0a", "#2e1a10", "#1a0e08"]);
  // bokeh
  let bk = ""; for(let i = 0; i < 22; i++){ const x = C.r() * VW, y = 20 + C.r() * 110, r = 6 + C.r() * 16; bk += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${["#ffb45a", "#ff8a3a", "#ffd27a"][i % 3]}" opacity="${(.08 + C.r() * .14).toFixed(2)}"/>`; } C.add(`<g filter="${C.filt.soft}">${bk}</g>`);
  // table
  C.add(`<rect x="0" y="150" width="${VW}" height="50" fill="${C.lin([[0, "#5a3420"], [1, "#2a160c"]])}"/><rect x="0" y="150" width="${VW}" height="2" fill="#a8683a" opacity=".6"/>`);
  let grain = ""; for(let i = 0; i < 14; i++) grain += `<path d="M0,${156 + i * 3.2} Q160,${154 + i * 3.2 + C.r() * 3} 320,${156 + i * 3.2}" stroke="#1a0c06" stroke-width=".5" fill="none" opacity=".4"/>`; C.add(grain);
  const candle = (x, h, w) => { const top = 150 - h;
    glow(C, x, top - 10, 60, "#ffb44a", .55);
    C.add(`<rect x="${x - w}" y="${top}" width="${w * 2}" height="${h}" fill="${C.lin([[0, "#f6e8cc"], [.5, "#ead6b0"], [1, "#b89870"]], 1, 0)}"/>
      <ellipse cx="${x}" cy="${top}" rx="${w}" ry="${w * .28}" fill="#fff2dc"/><path d="M${x - w * .6},${top} q-1,6 0,${10}" stroke="#f6e8cc" stroke-width="2.4" fill="none"/>
      <rect x="${x - .5}" y="${top - 5}" width="1" height="5" fill="#2a1a10"/>
      <g filter="${C.filt.soft}"><path d="M${x},${top - 22} C${x + 5},${top - 14} ${x + 4},${top - 6} ${x},${top - 4} C${x - 4},${top - 6} ${x - 5},${top - 14} ${x},${top - 22}Z" fill="#ff9a3a"/></g>
      <path d="M${x},${top - 18} C${x + 3},${top - 12} ${x + 2.5},${top - 6} ${x},${top - 5} C${x - 2.5},${top - 6} ${x - 3},${top - 12} ${x},${top - 18}Z" fill="#ffe27a"/>
      <ellipse cx="${x}" cy="${top - 8}" rx="1.2" ry="2.6" fill="#fffbe8"/>
      <ellipse cx="${x}" cy="${152 + h * .08}" rx="${w * 1.8}" ry="2" fill="#ffb45a" opacity=".25"/>`); };
  candle(126, 56, 9); candle(164, 78, 10); candle(200, 42, 8);
  C.add(`<path d="M232,150 q10,-4 20,0 l-2,-3 q-8,-3 -16,0Z" fill="#8a2a3a"/><ellipse cx="96" cy="150" rx="12" ry="2" fill="#000" opacity=".3"/>`);
};

T.cozy = C => {
  sky(C, ["#1c2442", "#4a4a6a", "#c88a6a"]); stars(C, 30, 50);
  const h1 = C.ridge(112, 16, 1.6); land(C, h1, "#3a3a50", "#2e2e42"); forest(C, h1, 5, ["#3a3a4a", "#44405a", "#34384a"], "#c88a6a", .3, 2, .6);
  haze(C, 104, 30, "#c88a6a", .35);
  const f = x => 164 + Math.sin(x / 50) * 3; land(C, f, "#3a3428", "#1e1a14");
  const x = 160, y = f(160) + 2, s = 2.4;
  glow(C, x, y - 20, 90, "#ffb45a", .45);
  // bigger cabin with a porch and a lantern
  C.add(`<rect x="${x - 34}" y="${y - 34}" width="68" height="34" fill="#6a4432"/>${[1, 2, 3, 4, 5, 6].map(k => `<rect x="${x - 34}" y="${y - 34 + k * 5.4}" width="68" height="1" fill="#000" opacity=".2"/>`).join("")}
    <rect x="${x + 4}" y="${y - 34}" width="30" height="34" fill="#000" opacity=".16"/>
    <path d="M${x - 42},${y - 32} L${x},${y - 62} L${x + 42},${y - 32}Z" fill="#3a2a2a"/><path d="M${x - 42},${y - 32} L${x},${y - 62} L${x - 8},${y - 62} L${x - 46},${y - 34}Z" fill="#fff" opacity=".06"/>
    <rect x="${x + 16}" y="${y - 70}" width="8" height="16" fill="#5a4034"/>
    <rect x="${x - 26}" y="${y - 26}" width="14" height="12" fill="#ffc36a"/><rect x="${x + 12}" y="${y - 26}" width="14" height="12" fill="#ffc36a"/>
    <path d="M${x - 26},${y - 20} h14 M${x - 19},${y - 26} v12 M${x + 12},${y - 20} h14 M${x + 19},${y - 26} v12" stroke="#6a4432" stroke-width="1.2"/>
    <rect x="${x - 6}" y="${y - 22}" width="12" height="22" fill="#4a2c1e"/><rect x="${x - 4}" y="${y - 20}" width="8" height="8" fill="#ffc36a" opacity=".7"/>
    <rect x="${x - 40}" y="${y - 2}" width="80" height="3" fill="#4a3020"/>`);
  glow(C, x + 34, y - 18, 14, "#ffd27a", .9); C.add(`<rect x="${x + 32}" y="${y - 21}" width="4" height="6" fill="#ffe8a0"/>`);
  smoke(C, x + 20, y - 76, "#b8b0b0");
  // woodpile
  let wp = ""; for(let r = 0; r < 3; r++) for(let k = 0; k < 5 - r; k++) wp += `<circle cx="${x - 58 + k * 5 + r * 2.5}" cy="${y - 3 - r * 4.6}" r="2.4" fill="#8a5a36"/><circle cx="${x - 58 + k * 5 + r * 2.5}" cy="${y - 3 - r * 4.6}" r="1.2" fill="#c49060"/>`; C.add(wp);
  [[30, 186, 80], [290, 188, 90]].forEach(([px, py, h]) => pine(C, px, py, h, "#1a2420", false));
};

T.desert = C => {
  sky(C, ["#f08a5a", "#f8b878", "#fde0a8"]); sun(C, 96, 84, 16, "#fff0c8", "#ffc878");
  mountains(C, x => 118 - (x > 180 && x < 280 ? 34 : 0) - (x > 20 && x < 70 ? 22 : 0) - Math.sin(x / 9) * 1.2, "#c46a4a", "#a45a3a", "#5a2a1a", true);
  haze(C, 100, 30, "#fde0a8", .5);
  const d1 = C.ridge(140, 16, .9); land(C, d1, "#e8a060", "#c47a3a", "#ffd8a0");
  const d2 = x => 168 + Math.sin(x / 55 + 1) * 8; land(C, d2, "#d88a4a", "#a45a2a", "#ffcc88");
  // ripples
  let rp = ""; for(let i = 0; i < 12; i++){ const y = 176 + i * 2.2; rp += `<path d="M0,${y} Q80,${y - 3} 160,${y} T320,${y}" stroke="#8a4a20" stroke-width=".5" fill="none" opacity=".3"/>`; } C.add(rp);
  const cactus = (x, y, h) => { const w = h * .12;
    C.add(`<rect x="${x - w}" y="${y - h}" width="${w * 2}" height="${h}" rx="${w}" fill="#3f6a3a"/><rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="${w * .5}" fill="#2f5a2e"/>
      <path d="M${x - w},${y - h * .45} h${-w * 1.6} q${-w},0 ${-w},${-w} v${-h * .3}" stroke="#3f6a3a" stroke-width="${w * 1.6}" fill="none" stroke-linecap="round"/>
      <path d="M${x + w},${y - h * .6} h${w * 1.4} q${w},0 ${w},${-w} v${-h * .22}" stroke="#2f5a2e" stroke-width="${w * 1.6}" fill="none" stroke-linecap="round"/>
      <ellipse cx="${x + 4}" cy="${y}" rx="${h * .3}" ry="2" fill="#6a3a1a" opacity=".35"/>`); };
  cactus(228, d2(228) + 2, 64); cactus(270, d2(270) + 3, 40); cactus(48, d2(48) + 2, 34);
};

T.sunset = C => {
  sky(C, ["#2a2060", "#8a3a7a", "#f06a5a", "#ffb86a"]); sun(C, 160, 112, 22, "#ffe8a0", "#ffb05a");
  cloud(C, 70, 60, 110, "#ff9a8a", "#8a3a6a", "#ffc0a0"); cloud(C, 250, 44, 120, "#ff9a8a", "#8a3a6a", "#ffc0a0");
  mountains(C, C.peaks(122, 36, 2), "#5a2a5a", "#7a3a5a", "#1a0a2a", false);
  water(C, 124, "#e07a6a", "#2a1a40", [160, 22, "#ffd88a"]);
  const f = x => 176 + Math.sin(x / 30) * 2 - Math.max(0, 50 - Math.abs(x - 40)) * .5; land(C, f, "#2a1430", "#140a1c");
  [[26, 150, 1.1, .2], [54, 160, .8, -.2]].forEach(([x, y, sc, lean]) => { const tx = x + lean * 30 * sc, ty = y - 50 * sc;
    let p = `<path d="M${x - 2 * sc},${y + 20} Q${x + lean * 10},${y - 20 * sc} ${tx - .8},${ty} L${tx + .8},${ty} Q${x + lean * 10 + 2},${y - 20 * sc} ${x + 2 * sc},${y + 20}Z" fill="#140a1c"/>`;
    for(let k = 0; k < 8; k++){ const a = -Math.PI * (.05 + k / 7 * .9), L = 22 * sc; p += `<path d="M${tx},${ty} Q${tx + Math.cos(a) * L * .5},${ty + Math.sin(a) * L * .6 - 3} ${tx + Math.cos(a) * L},${ty + Math.sin(a) * L * .5 + L * .35}" stroke="#140a1c" stroke-width="${2.6 * sc}" fill="none" stroke-linecap="round"/>`; }
    C.add(p); });
  let bd = ""; [[196, 80], [206, 74], [214, 82]].forEach(([x, y]) => bd += `<path d="M${x - 4},${y} q2,-2 4,0 q2,-2 4,0" stroke="#2a1030" stroke-width=".9" fill="none"/>`); C.add(bd);
};

T.bluesky = C => {
  sky(C, ["#2f7ad0", "#6fb4ec", "#d4ecf8"]); sun(C, 270, 30, 9);
  cloud(C, 80, 44, 130); cloud(C, 210, 70, 110); cloud(C, 300, 40, 60);
  const h0 = C.ridge(128, 18, .3); land(C, h0, "#8ab8a0", "#98c2a8"); forest(C, h0, 4, GREEN, "#d4ecf8", .5, 1, .3);
  haze(C, 118, 30, "#d4ecf8", .5);
  const h1 = x => 156 + Math.sin(x / 70 + 1) * 10; land(C, h1, "#8ac25a", "#5a9a3a", "#d4f0a0");
  const h2 = x => 180 + Math.sin(x / 50) * 6; land(C, h2, "#6aac44", "#3a7a2a", "#c4e888");
  tree(C, 220, h1(220) + 3, 1.3, RAMP_GRN);
  // fence
  let fc = ""; for(let x = 40; x < 150; x += 12){ const y = h2(x) - 2; fc += `<rect x="${x}" y="${y - 12}" width="2" height="13" fill="#f4efe4"/>`; if(x + 12 < 150) fc += `<path d="M${x},${y - 9} L${x + 12},${h2(x + 12) - 11} M${x},${y - 4} L${x + 12},${h2(x + 12) - 6}" stroke="#f4efe4" stroke-width="1.4"/>`; } C.add(fc);
  // sheep
  [[90, 190], [118, 186], [260, 192]].forEach(([x, y]) => C.add(`<g filter="${C.filt.leafy}"><path d="${C.blob(x, y - 5, 7, 4.4, 8)}" fill="#f6f4ee"/></g><ellipse cx="${x + 6.5}" cy="${y - 5.5}" rx="2.2" ry="1.8" fill="#2a2a2a"/><rect x="${x - 4}" y="${y - 2}" width="1.2" height="4" fill="#2a2a2a"/><rect x="${x + 3}" y="${y - 2}" width="1.2" height="4" fill="#2a2a2a"/>`));
  grass(C, h2, "#3a7a2a", "#a8d870");
};

T.rainbow = C => {
  sky(C, ["#5a86b8", "#9cc4de", "#e8f0e8"]);
  cloud(C, 60, 36, 120, "#e8eef4", "#9aaac0", "#ffffff");
  // the bow, drawn as soft concentric arcs
  const cols = ["#ff5a5a", "#ffa04a", "#ffe45a", "#6ad86a", "#4ab4ff", "#7a6aff"];
  C.add(`<g opacity=".62" filter="${C.filt.soft}">${cols.map((c, i) => `<path d="M40,170 A${130 - i * 5},${120 - i * 5} 0 0 1 ${300 - i * 10},170" stroke="${c}" stroke-width="5.4" fill="none"/>`).join("")}</g>`);
  mountains(C, C.peaks(132, 30, .6), "#6a8a98", "#8aa4ae", "#2a4050");
  haze(C, 120, 30, "#e8f0e8", .5);
  const h1 = C.ridge(150, 14, 1.2); land(C, h1, "#6aac54", "#4a8a3a", "#c8ec98"); forest(C, h1, 6, GREEN, "#e8f0e8", .15, 1, .2);
  // waterfall off a cliff, into a pool
  C.add(`<path d="M220,150 L236,120 L260,118 L270,150Z" fill="#6a7a78"/><path d="M236,120 L260,118 L256,126 L240,128Z" fill="#8a9a96"/>
    <rect x="244" y="122" width="10" height="44" fill="${C.lin([[0, "#e8f6ff"], [1, "#9fd8f0"]])}"/><ellipse cx="249" cy="168" rx="26" ry="5" fill="#7fc6e0"/><ellipse cx="249" cy="166" rx="12" ry="2.4" fill="#ffffff" opacity=".7"/>`);
  const h2 = x => 182 + Math.sin(x / 40) * 4; land(C, h2, "#5a9a3a", "#2f6a24");
  let fl = ""; for(let i = 0; i < 40; i++){ const x = C.r() * VW, y = h2(x) + 4 + C.r() * 14; fl += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.1" fill="${cols[i % 6]}"/>`; } C.add(fl);
};

T.romantic = C => {
  sky(C, ["#3a2a5a", "#b05a8a", "#ffa8a0", "#ffd0b0"]); sun(C, 160, 118, 14, "#fff0d8", "#ffb8a8");
  cloud(C, 80, 58, 100, "#ffc8c8", "#a85a8a", "#ffe0e0");
  const h1 = C.ridge(118, 16, 1.4); land(C, h1, "#8a4a6a", "#7a3a5a"); forest(C, h1, 5, ["#9a4a6a", "#b85a7a", "#7a3a5a", "#d88aa0"], "#ffd0b0", .3, 1, .2);
  water(C, 124, "#e8909a", "#3a2050", [160, 16, "#ffe0c8"]);
  // two swans
  const swan = (x, y, dir) => C.add(`<g transform="translate(${x},${y}) scale(${dir},1)"><path d="M-10,0 Q-6,-8 6,-6 Q10,-5 12,0 Z" fill="#fbf6f4"/><path d="M-2,-6 Q-10,-8 -9,-2 L-8,0Z" fill="#e8dce0"/><path d="M6,-5 Q4,-14 8,-18 Q11,-20 12,-17" stroke="#fbf6f4" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M12,-17 l3,1" stroke="#f08a3a" stroke-width="1.6"/><ellipse cx="0" cy="1.5" rx="12" ry="1.4" fill="#fff" opacity=".35"/></g>`);
  swan(146, 160, 1); swan(176, 160, -1);
  // floating lanterns
  let ln = ""; for(let i = 0; i < 18; i++){ const x = 40 + C.r() * 240, y = 20 + C.r() * 80, s = .6 + C.r() * .8; ln += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(6 * s).toFixed(1)}" fill="#ffb87a" opacity=".25"/><rect x="${(x - 1.6 * s).toFixed(1)}" y="${(y - 2.4 * s).toFixed(1)}" width="${(3.2 * s).toFixed(1)}" height="${(4.4 * s).toFixed(1)}" rx="${s.toFixed(1)}" fill="#ffd8a0"/>`; } C.add(ln);
  const f = x => 186 + Math.sin(x / 30) * 3; land(C, f, "#3a2040", "#1e1024");
  let rs = ""; for(let i = 0; i < 12; i++){ const x = C.r() * 90 + (i % 2 ? 230 : 0), y = f(x) - 2; rs += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="#e04a6a"/><circle cx="${(x - .6).toFixed(1)}" cy="${(y - .6).toFixed(1)}" r="1" fill="#ff8aa0"/>`; } C.add(rs);
};

T.party = C => {
  sky(C, ["#0a0620", "#1e1040", "#3a1a5a"]); stars(C, 40, 60);
  // fireworks
  const burst = (x, y, r, col) => { let s = ""; for(let k = 0; k < 22; k++){ const a = k / 22 * 6.283, rr = r * (.8 + C.r() * .3); s += `<line x1="${x + Math.cos(a) * r * .15}" y1="${y + Math.sin(a) * r * .15}" x2="${(x + Math.cos(a) * rr).toFixed(1)}" y2="${(y + Math.sin(a) * rr).toFixed(1)}" stroke="${col}" stroke-width="1.1" stroke-linecap="round"/><circle cx="${(x + Math.cos(a) * rr).toFixed(1)}" cy="${(y + Math.sin(a) * rr).toFixed(1)}" r="1.1" fill="#fff"/>`; }
    glow(C, x, y, r * 1.4, col, .35); C.add(`<g filter="${C.filt.soft}" opacity=".6">${s}</g>${s}`); };
  burst(90, 50, 34, "#ff4a9a"); burst(210, 40, 40, "#4ad2ff"); burst(270, 80, 24, "#ffd24a"); burst(150, 76, 20, "#8aff6a");
  // skyline with neon windows
  let sk = "", x = 0; const r = C.r;
  while(x < VW){ const w = 14 + r() * 26, h = 30 + r() * 60, y = 170; sk += `<rect x="${x.toFixed(1)}" y="${(y - h).toFixed(1)}" width="${w.toFixed(1)}" height="${(h + 30).toFixed(1)}" fill="#140a26"/>`;
    for(let wy = y - h + 5; wy < y - 3; wy += 6) for(let wx = x + 3; wx < x + w - 3; wx += 5) if(r() < .35) sk += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="2" height="3" fill="${["#ff4a9a", "#4ad2ff", "#ffd24a", "#b07aff"][Math.floor(r() * 4)]}" opacity="${(.6 + r() * .4).toFixed(2)}"/>`;
    x += w + 2; }
  C.add(sk);
  water(C, 170, "#2a1a4a", "#0a0618");
  let rf = ""; for(let i = 0; i < 50; i++) rf += `<rect x="${(r() * VW).toFixed(1)}" y="${(172 + r() * 26).toFixed(1)}" width="${(2 + r() * 8).toFixed(1)}" height=".9" fill="${["#ff4a9a", "#4ad2ff", "#ffd24a"][i % 3]}" opacity="${(.3 + r() * .4).toFixed(2)}"/>`; C.add(rf);
};

T.reading = C => {
  // a sunny window seat: bright, clean, the white-light theme you read by
  sky(C, ["#f6f1e6", "#efe6d4", "#e6dac4"]);
  glow(C, 110, 60, 200, "#fffbe8", .8);
  // window with the view out
  C.add(`<rect x="40" y="18" width="150" height="112" fill="#fdfbf6"/><rect x="48" y="26" width="134" height="96" fill="${C.lin([[0, "#8cc8ee"], [1, "#d6ecf6"]])}"/>
    <path d="M48,100 Q90,86 130,96 T182,90 L182,122 L48,122Z" fill="#8ab86a"/><path d="M48,110 Q100,102 182,108 L182,122 L48,122Z" fill="#6a9a4a"/>
    <ellipse cx="80" cy="46" rx="18" ry="6" fill="#fff" opacity=".9"/><ellipse cx="150" cy="40" rx="14" ry="5" fill="#fff" opacity=".85"/>
    <rect x="113" y="26" width="4" height="96" fill="#fdfbf6"/><rect x="48" y="72" width="134" height="4" fill="#fdfbf6"/>`);
  // sunbeam onto the desk
  C.add(`<path d="M48,122 L182,122 L270,200 L100,200Z" fill="#fff6d0" opacity=".45"/>`);
  C.add(`<rect x="0" y="140" width="${VW}" height="60" fill="${C.lin([[0, "#c8a47a"], [1, "#9a7a54"]])}"/><rect x="0" y="140" width="${VW}" height="2" fill="#e6c89a"/>`);
  // open book
  C.add(`<path d="M120,166 Q150,158 160,164 Q170,158 200,166 L200,172 Q170,166 160,172 Q150,166 120,172Z" fill="#6a3a2a"/><path d="M122,164 Q150,154 160,160 L160,168 Q150,162 122,168Z" fill="#fbf8f0"/><path d="M198,164 Q170,154 160,160 L160,168 Q170,162 198,168Z" fill="#f2ece0"/>
    ${[0, 1, 2, 3].map(k => `<path d="M128,${164 - k * 1.7 + 2} Q142,${158 - k * 1.7 + 2} 156,${161 - k * 1.7 + 2}" stroke="#b8b0a0" stroke-width=".5" fill="none"/><path d="M164,${161 - k * 1.7 + 2} Q178,${158 - k * 1.7 + 2} 192,${164 - k * 1.7 + 2}" stroke="#b8b0a0" stroke-width=".5" fill="none"/>`).join("")}`);
  // mug + plant
  C.add(`<rect x="222" y="150" width="16" height="16" rx="2" fill="#f4f0e8"/><path d="M238,154 q6,0 6,5 t-6,5" stroke="#f4f0e8" stroke-width="2" fill="none"/><ellipse cx="230" cy="150" rx="8" ry="1.6" fill="#6a4030"/>
    <path d="M260,166 L262,146 L282,146 L284,166Z" fill="#c8704a"/><path d="M260,146 h24" stroke="#a85a3a" stroke-width="2"/>`);
  let lv = ""; for(let i = 0; i < 12; i++){ const a = -Math.PI * (.1 + i / 11 * .8), L = 18 + C.r() * 12; lv += `<path d="M272,146 Q${272 + Math.cos(a) * L * .5},${146 + Math.sin(a) * L * .7} ${272 + Math.cos(a) * L},${146 + Math.sin(a) * L}" stroke="${i % 2 ? "#4a8a3a" : "#6aaa4a"}" stroke-width="3" fill="none" stroke-linecap="round"/>`; } C.add(lv);
  C.add(`<path d="M232,146 q-3,-6 0,-10 q3,-5 0,-10" stroke="#fff" stroke-width="1.2" fill="none" opacity=".6"/>`);
};

T.white = C => {
  // clean white light: a whitewashed village over a blue sea at noon
  sky(C, ["#5aa8e8", "#a8d4f4", "#eef6fb"]); sun(C, 60, 26, 9, "#ffffff", "#fffbe8");
  water(C, 112, "#2f8fcf", "#1a5a9a", [60, 10, "#ffffff"]);
  const hill = x => 128 + (x - 160) * (x - 160) * .0016; land(C, hill, "#e8e0d0", "#c8bca8");
  const houses = []; for(let i = 0; i < 18; i++){ const x = 30 + C.r() * 260, y = hill(x) + 10 + C.r() * 56; houses.push([x, y, 12 + C.r() * 14]); }
  houses.sort((a, b) => a[1] - b[1]).forEach(([x, y, w]) => C.add(`<rect x="${(x - w / 2).toFixed(1)}" y="${(y - w * .7).toFixed(1)}" width="${w.toFixed(1)}" height="${(w * .7 + 4).toFixed(1)}" fill="#fbfbf8"/><rect x="${(x + w * .1).toFixed(1)}" y="${(y - w * .7).toFixed(1)}" width="${(w * .4).toFixed(1)}" height="${(w * .7 + 4).toFixed(1)}" fill="#dfe4ea"/><rect x="${(x - w * .3).toFixed(1)}" y="${(y - w * .35).toFixed(1)}" width="${(w * .18).toFixed(1)}" height="${(w * .25).toFixed(1)}" fill="#2f6fb8"/>`));
  // the domed chapel
  C.add(`<rect x="150" y="116" width="30" height="26" fill="#fbfbf8"/><rect x="166" y="116" width="14" height="26" fill="#dfe4ea"/><path d="M150,117 A15,15 0 0 1 180,117Z" fill="#2f6fcf"/><path d="M165,102 A15,15 0 0 1 180,117 L165,117Z" fill="#1f5aaa"/><rect x="164" y="96" width="2" height="7" fill="#fbfbf8"/><rect x="161.5" y="98" width="7" height="1.6" fill="#fbfbf8"/><rect x="161" y="128" width="8" height="14" rx="4" fill="#2f6fb8"/>`);
  let bg = ""; for(let i = 0; i < 16; i++){ const x = 30 + C.r() * 260, y = hill(x) + 16 + C.r() * 50; bg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 + C.r() * 2).toFixed(1)}" fill="${i % 2 ? "#e0409a" : "#c83a8a"}" opacity=".85"/>`; } C.add(bg);
};

const ALIAS = { autumn: "fall", harvest: "fall", thanksgiving: "fall", candle: "candlelight", lights: "christmas", xmas: "christmas", sky: "bluesky", clear: "bluesky", stars: "starry", night: "starry", rain: "rainy", storm: "rainy", warm: "cozy", night_light: "cozy", valentine: "romantic", spring: "forest", beach: "ocean", flame: "fire", bonfire: "fire" };
function pick(id, name){
  const k = String(id || "").toLowerCase();
  if(T[k]) return k;
  const n = String(name || id || "").toLowerCase();
  for(const key of Object.keys(T)) if(n.includes(key)) return key;
  for(const [a, b] of Object.entries(ALIAS)) if(n.includes(a)) return b;
  return null;
}
const CACHE = {};
/* SVG markup for a theme, or null when there is nothing drawn for it (the
   caller keeps whatever art it had). Cached per theme: each is ~20-60KB. */
window.themeArt = function(id, name){
  const k = pick(id, name);
  if(!k) return null;
  if(!CACHE[k]){ const C = Ctx(hash(k) || 1); T[k](C); CACHE[k] = {svg: C.svg(), id: C.id}; }
  // Fresh ids for every copy: the same theme can be on screen twice (a dock
  // key and its pop-out tile), and if the first copy is hidden, a second one
  // pointing at its gradients would paint blank.
  return CACHE[k].svg.split(CACHE[k].id).join("ta" + (++UID) + "_");
};
window.themeArtKeys = () => Object.keys(T);
})();
