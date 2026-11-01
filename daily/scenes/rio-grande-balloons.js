/* Rio Grande Balloons: Balloon Fiesta morning in Albuquerque. From a low sandy
   bank on the west side we look east across the Rio Grande in its autumn low
   flow (braided channels, sandbars with willow scrub and a few sandhill
   cranes) to the bosque, a wall of golden cottonwoods. Beyond, the city climbs
   toward the long granite face of the Sandia Mountains, with Tijeras Canyon
   and the lower Manzanitas to the right. One balloon skims the water
   ("splash and dash"), two more hang low over the river and dozens rise
   behind. Two stand inflated on the far beach. The sun is low on the right.
   All land is one world3d() raster (reference/scene-helpers.js); balloons,
   the front row of cottonwoods, cranes and brush are sprites placed in world
   metres, so they size by distance and reflect in the river.
   opts.time === "night": a balloon glow. Seven balloons stand lit on the far
   beach and four Dawn Patrol balloons burn overhead. Moonless sky, city lights
   along the foothills, red beacons on Sandia Crest.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function rioGrandeBalloonsArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 2609;
  const rs = rng(seed + 5), rb = rng(seed + 11), rt = rng(seed + 19), rl = rng(seed + 23);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const WY = 430, EYE = 10, FL = 2000, LX = 2780, LY = 240;
  const T = c => NIGHT ? mix(mix(c, "#4a5478", .5), "#060a22", .72) : c;
  const HZ = NIGHT ? "#262a4a" : "#cfd0da", LAMP = "#ffc868";
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const LB = (() => { const v = [.85, .45, .15], l = Math.hypot(...v); return v.map(q => q / l); })();

  /* ---------------- sky ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#03061a"/><stop offset=".5" stop-color="#0b1434"/><stop offset=".86" stop-color="#232647"/><stop offset="1" stop-color="#4a3a4c"/>`
    : `<stop offset="0" stop-color="#5a8cca"/><stop offset=".45" stop-color="#94b8e0"/><stop offset=".83" stop-color="#d8dae0"/><stop offset="1" stop-color="#f2dcc0"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#ffb070" stop-opacity=".22"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2cc" stop-opacity=".95"/><stop offset=".22" stop-color="#ffe2a8" stop-opacity=".5"/><stop offset=".6" stop-color="#ffd890" stop-opacity=".14"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/>`;
  const water = NIGHT
    ? `<stop offset="0" stop-color="#3a3048"/><stop offset=".3" stop-color="#1c2040"/><stop offset="1" stop-color="#0a1028"/>`
    : `<stop offset="0" stop-color="#e6dcd0"/><stop offset=".3" stop-color="#c4ccd8"/><stop offset="1" stop-color="#7c9cc6"/>`;
  let s = `<defs id="rgdefs">
    <linearGradient id="rgSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="rgLight" cx="${NIGHT ? 1280 : LX}" cy="${NIGHT ? WY : LY}" r="${NIGHT ? 1300 : 1600}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="rgWater" x1="0" y1="${WY + 40}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">${water}</linearGradient>
    <linearGradient id="rgMist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".75"/><stop offset="1" stop-color="${HZ}" stop-opacity=".2"/></linearGradient>
    <radialGradient id="rgSpec"><stop offset="0" stop-color="#fffaf0" stop-opacity=".55"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></radialGradient>
    <radialGradient id="rgFlame" cx=".5" cy=".8" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#fff0a0"/><stop offset=".7" stop-color="#ffa030"/><stop offset="1" stop-color="#ff6a10" stop-opacity="0"/></radialGradient>
    <radialGradient id="rgGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffa850" stop-opacity=".3"/><stop offset="1" stop-color="#ffa850" stop-opacity="0"/></radialGradient>
    <radialGradient id="rgHalo"><stop offset="0" stop-color="#ffc070" stop-opacity=".5"/><stop offset=".45" stop-color="#ff9a50" stop-opacity=".16"/><stop offset="1" stop-color="#ff9a50" stop-opacity="0"/></radialGradient>
    <radialGradient id="rgRed"><stop offset="0" stop-color="#ff5a3a" stop-opacity=".95"/><stop offset=".4" stop-color="#ff3a2a" stop-opacity=".3"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></radialGradient>
    <filter id="rgCloudy" x="-20%" y="-60%" width="140%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".014 .03" numOctaves="3" seed="31" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="3"/></filter>
    <filter id="rgLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="rgRipple" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004 .16" numOctaves="2" seed="12" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="B"/></filter>
    <filter id="rgPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="rgSoft"><feGaussianBlur stdDeviation="16"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#rgSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 620; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 380, big = rs() < .05;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.6 : F(.45 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(Math.max(.08, (.2 + rs() * .6) * (1 - y / 430)))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#rgLight)"/>`;   // city skyglow on the horizon
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#rgLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#rgSoft)">`;
    for (let k = 0; k < 6; k++) { const a = Math.PI - .16 + k * .07, L = 2200;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .018) * L)},${F(LY + Math.sin(a - .018) * L)} L${F(LX + Math.cos(a + .018) * L)},${F(LY + Math.sin(a + .018) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a few thin morning wisps ---------------- */
  const wisp = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#rgCloudy)" opacity="${NIGHT ? .35 : .85}">`;
    for (let k = 0; k < 7; k++) { const t = k / 6, lx = x + (t - .5) * w, ly = y + (rs() - .5) * w * .03, R = w * (.06 + rs() * .05);
      c += NIGHT ? `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.8)}" ry="${F(R * .28)}" fill="#1c2448"/>`
        : `<ellipse cx="${F(lx)}" cy="${F(ly + R * .12)}" rx="${F(R * 1.8)}" ry="${F(R * .3)}" fill="#e2d4cc"/><ellipse cx="${F(lx - R * .2)}" cy="${F(ly)}" rx="${F(R * 1.5)}" ry="${F(R * .22)}" fill="#fbf4ea"/>`; }
    return c + `</g></g>`; };
  s += wisp(520, 120, 520, "drift1") + wisp(1240, 58, 380, "drift2") + wisp(2080, 140, 560, "drift3") + wisp(1700, 300, 260, "drift1");
  if (!NIGHT) {   // a V of sandhill cranes coming down to the river
    s += `<g class="birds" fill="none" stroke="#3a3440" stroke-width="2" stroke-linecap="round" opacity=".7">`;
    [[640, 300, 1], [662, 309, .9], [684, 318, .9], [618, 309, .9], [596, 318, .85], [706, 327, .8]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 11 * k)},${F(y + 2 * k)} q${F(5 * k)},${F(-4 * k)} ${F(11 * k)},${F(-1 * k)} q${F(6 * k)},${F(-3 * k)} ${F(11 * k)},${F(1 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 10 m above the river, horizon on WY. Metres: x right (south), y up, z away (east).
     Near water's edge about z 100, far edge about 420, the bosque from about 440,
     the city ramping up from 2.5 km to the foot of the Sandias at about 17 km. */
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.2, .8, .3] : [.85, .45, .15], tone: T, fog: HZ, fogK: .00004,
    shadow: NIGHT ? "#04060e" : "#3a3050", rim: NIGHT ? "#b8c8f0" : "#fff0d0", shade: .5, hi: .25, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9), N4 = noise2(seed + 15);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z, wx = (px, z) => (px - 1280) * z / FL;
  const zNB = x => 100 + 9 * Math.sin(x / 37 + .4) + 5 * N1(x / 20, 3);
  const zFB = x => 420 + 22 * Math.sin(x / 110 + 1) + 12 * N1(x / 45, 7);
  const BOSQ0 = x => zFB(x) + 16 + 6 * N2(x / 30, 1);
  const bosqEnd = x => 1500 + 300 * N2(x / 500, 9);
  const inBosque = (x, z) => z > BOSQ0(x) && z < bosqEnd(x) && (z < BOSQ0(x) + 80 || N3(x / 140, z / 140) < .38);
  const ramp = z => 340 * sm((z - 2500) / 15500);
  /* the Sandias: a tilted block, steep granite face toward us, long crest; Tijeras gap; Manzanitas */
  const crestH = x => Math.max(0,
      1760 * sm((x + 12000) / 5000) * (1 - .18 * sm((x + 1500) / 5000)) * (1 - sm((x - 4300) / 1900)),
      720 * sm((x - 6200) / 1500) * (.8 + .25 * Math.sin(x / 1300))) + 150 * N3(x / 2200, 2) + 70 * N3(x / 700, 5) + 25 * N3(x / 200, 8);
  const mount = (x, z) => {
    const zc = 20500 + 900 * Math.sin(x / 6000 + .5), d = z - zc;
    const prof = d < 0 ? Math.pow(sm(1 + d / 4200), 1.15) : 1 - .55 * sm(d / 7000);
    if (prof <= 0) return 0;
    const g = 1 - Math.abs(N4(x / 520, z / 620));                   // ridged spurs and gullies on the face
    return crestH(x) * prof * (.88 + .12 * N1(x / 900, z / 900)) + (90 * g + 45 * N1(x / 260, z / 300) + 18 * N2(x / 80, z / 80)) * prof; };
  /* every cottonwood behind the front row is a lumpy lit dome in the heightfield */
  const CS = 13;
  const crown = (x, z) => { const gx = Math.floor(x / CS), gz = Math.floor(z / CS); let best = 0, id = -1;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const i = gx + a, j = gz + b;
      const cx = (i + .15 + .7 * hash(i, j)) * CS, cz = (j + .15 + .7 * hash(j + 3.1, i)) * CS, R = CS * (.55 + .35 * hash(i + 7, j));
      const d2 = ((x - cx) ** 2 + (z - cz) ** 2) / (R * R); if (d2 >= 1) continue;
      const hh = 1 + (1 - d2) * (1 + .35 * d2) * (13 + 7 * hash(i, j + 5));   /* finite slope at the rim, so the raster can sample it */ if (hh > best && inBosque(cx, cz)) { best = hh; id = i * 7919 + j; } }
    return [best, id]; };
  const bar = (x, z) => N3(x / 85, z / 26) + .35 * N2(x / 28, z / 10);
  const hT = (x, z) => {
    const nb = zNB(x);
    if (z < nb) return 1.4 * sm((nb - z) / 22) + .25 * N2(x / 6, z / 6) * sm((nb - z) / 8) + .05;      // our bank
    const fb = zFB(x);
    if (z < fb) { const b = bar(x, z), e = Math.min(z - nb, fb - z);                                   // the river
      if (b > .52 && e > 14) { let h = .4 * sm((b - .52) / .1);
        if (b > .66) h += 1.8 * sm((b - .66) / .1) * (.6 + .4 * N1(x / 2.5, z / 2.5));                 // willow scrub on the bars
        return h; }
      return -1; }
    if (z < 1900) { const g = z < BOSQ0(x) ? .5 + .2 * N2(x / 9, z / 9) : 1 + .4 * N1(x / 50, z / 50), [cb] = crown(x, z);   // beach, then bosque (crowns may overhang the beach)
      return cb > 0 ? Math.max(g, cb + 1.6 * N3(x / 2.6, z / 2.6) + .7 * N2(x / 1.2, z / 1.2) + 2.2 * N1(x / 6, z / 6)) : g; }
    if (z < 2600) return 1 + .6 * N1(x / 120, z / 120);
    return Math.max(1, ramp(z) + 6 * N2(x / 400, z / 400), mount(x, z)); };

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const GOLD = ["#e8c84a", "#dab038", "#c89a2a", "#e0bc3e", "#d8b850", "#b8862a", "#a8a03a", "#8a8a3a", "#c87a2a", "#eed25a"].map(H3);
  const SAND = H3("#d8c4a0"), WET = H3("#9a8a70"), DUNG = H3("#3e3222"), BARK = H3("#6a5a48"), DRY = H3("#b4a466"), WIL = H3("#a8a050"), WIL2 = H3("#a86a3a");
  const SOIL = H3("#c4b096"), SOIL2 = H3("#a8987e"), STREET = H3("#8a8680"), TREEG = H3("#5e6a48"), FIELD = H3("#b0a868"), FIELD2 = H3("#8e9a58");
  const ROOFS = ["#e2d6c4", "#b87a5a", "#cfc4b0"].map(H3);
  const GRAN = H3("#bc9484"), GRAN2 = H3("#8a6a6a"), PJ = H3("#5e6a4a"), CONIF = H3("#3a4a3e"), FOOT = H3("#b0a080");
  const col = (x, y, z, n, ao) => {
    if (z > 2600) {
      const rz = ramp(z);
      if (y > rz + 20) { const k = N1(x / 120, z / 120) * .5 + N2(x / 35, z / 35) * .25, steep = 1 - n[1];   // the mountains
        let c = L3(GRAN, GRAN2, .45 + k + steep * .4 - ao * .3);
        const veg = (.42 - steep) * 3 + k * .8 + (y > 1450 ? .5 : 0);
        if (veg > 0) c = L3(c, (y > 1350 ? CONIF : PJ).map(v => v * (1 + N3(x / 8, z / 8) * .3)), Math.min(1, veg) * .85);
        if (y < rz + 160) c = L3(c, FOOT, .5 * (1 - (y - rz) / 160));
        return c; }
      const cell = hash(Math.floor(x / 14), Math.floor(z / 14));                                   // the city
      let c = L3(SOIL, SOIL2, .5 + .5 * N2(x / 300, z / 300));
      if (cell < .35) c = L3(c, ROOFS[Math.floor(cell / .35 * 3)], .7); else if (cell > .76) c = L3(c, TREEG, .8);
      if (((x % 160) + 160) % 160 < 9 || ((z % 160) + 160) % 160 < 9) c = L3(c, STREET, .5);
      return c; }
    const nb = zNB(x), fb = zFB(x);
    if (z < nb) { const t = sm((nb - z) / 6);                                                          // our bank: sand going to dry grass
      return L3(L3(WET, SAND, t), DRY, sm((nb - z - 8) / 10) * (.5 + .5 * N1(x / 3, z / 3))).map(v => v * (.92 + .1 * N2(x / 1.5, z / 1.5))); }
    if (z < fb) { if (y > .5) return L3(WIL, WIL2, .5 + N1(x / 6, z / 6)).map(v => v * (.85 + .2 * N2(x / 1.2, z / 1.2)));
      return L3(WET, SAND, sm(y / .25)).map(v => v * (.95 + .1 * N2(x / 4, z / 2))); }
    if (z < 1900) { const [cb, id] = crown(x, z);
      if (z < BOSQ0(x) && (cb <= 0 || y < 1.2)) return L3(SAND, WET, sm((z - fb) / -2 + 1) * .6);
      if (cb > 0 && y > 5.5 + 1.2 * N1(x / 4, z / 4)) { const k = Math.floor(hash(id, 1.7) * GOLD.length);
        return GOLD[k].map(q => q * (.86 + .18 * hash(id, 3.3)) * (.8 + .2 * sm((y - 6) / 12))); }
      if (cb > 0) return L3(DUNG, BARK, .25 + .35 * N2(x / 3, z / 3)).map(v => v * (.75 + .25 * sm((y - 1) / 4)));   // shade under the canopy
      return z < bosqEnd(x) ? L3(DRY, FIELD2, .5 + N1(x / 30, z / 30)) : L3(FIELD, FIELD2, .5 + .5 * N2(x / 90, z / 90)); }
    return L3(FIELD, TREEG, .4 + .5 * N1(x / 60, z / 60)); };
  // two rasters: fine steps up to the end of the bosque so the steep crown fronts are sampled, coarse beyond
  w.raster({ z0: 2600, z1: 27000, step: .0011, minStep: .25, scale: .75, top: 200, bottom: 446, noRefl: true, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00004, amb: NIGHT ? .55 : .5 });
  w.raster({ z0: 12, z1: 2600, step: .00025, minStep: .06, scale: .75, top: 300, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00004, amb: NIGHT ? .55 : .5 });

  /* ---------- the front row of cottonwoods on the far bank: trunks, limbs, lit leaf clusters ---------- */
  const RAMPS = {
    gold: ["#4a3a1a", "#6a5220", "#8e6c22", "#b08a26", "#cca232", "#e0bc3e", "#eed25a", "#f8e48a"],
    lime: ["#3a3e1a", "#545a22", "#6e742a", "#8a8c32", "#a8a23a", "#c4b848", "#d8cc64", "#ece08a"],
    rust: ["#4a2a14", "#6a3a18", "#8e5020", "#b06a26", "#c88630", "#dca040", "#ecba5a", "#f6d488"] };
  const TREES = [];
  const cottonwood = Tr => (px, py, k, fog) => {
    const rr = rng(Tr.seed), C = c => T(mix(c, HZ, fog)), ramp8 = RAMPS[Tr.ramp];
    let o = `<g filter="url(#rgLeafy)"><ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(Tr.cw * .42 * k)}" ry="${F(Math.max(1.2, .7 * k))}" fill="#000" opacity=".22"/>`;
    const lean = Tr.lean * k, fx0 = px + lean, fy0 = py - Tr.fork * k, bw = 1.4 * k, tw = .9 * k;
    o += `<path d="M${F(px - bw / 2)},${F(py)} Q${F(px - bw * .2 + lean * .4)},${F(py - Tr.fork * k * .5)} ${F(fx0 - tw / 2)},${F(fy0)} L${F(fx0 + tw / 2)},${F(fy0)} Q${F(px + bw * .3 + lean * .4)},${F(py - Tr.fork * k * .5)} ${F(px + bw / 2)},${F(py)}Z" fill="${C("#4e4236")}"/>`;
    o += `<path d="M${F(px + bw * .1)},${F(py)} Q${F(px + bw * .25 + lean * .4)},${F(py - Tr.fork * k * .5)} ${F(fx0 + tw * .15)},${F(fy0)} L${F(fx0 + tw / 2)},${F(fy0)} Q${F(px + bw * .3 + lean * .4)},${F(py - Tr.fork * k * .5)} ${F(px + bw / 2)},${F(py)}Z" fill="${C("#8a7a66")}" opacity=".8"/>`;
    Tr.lobes.forEach(([dx, dy]) => { const ex = px + dx * k, ey = py - dy * k;
      o += `<path d="M${F(fx0)},${F(fy0)} Q${F((fx0 + ex) / 2 + (rr() - .5) * 2 * k)},${F((fy0 + ey) / 2 + k)} ${F(ex)},${F(ey)}" stroke="${C("#4a3e32")}" stroke-width="${F(Math.max(.6, .45 * k))}" fill="none" stroke-linecap="round"/>`; });
    const rc = Math.max(1.4, .8 * k), cl = [];
    Tr.lobes.forEach(([dx, dy, rx, ry]) => {
      const n = Math.max(8, Math.min(140, Math.round(rx * ry * k * k / (rc * rc * 1.25))));
      for (let i = 0; i < n; i++) { const a = rr() * Math.PI * 2, d = Math.sqrt(rr()), u = Math.cos(a) * d, v = Math.sin(a) * d;
        const nz = -Math.sqrt(Math.max(0, 1 - u * u - v * v)), b = .25 + .75 * Math.max(0, u * LB[0] + v * LB[1] + nz * LB[2] * .6 + .25);
        cl.push([px + (dx + u * rx) * k, py - (dy + v * ry) * k, b + (rr() - .5) * .18]); } });
    cl.sort((a, b) => a[2] - b[2]).forEach(([x, y, b]) => {
      const i = Math.max(0, Math.min(7, Math.floor(b * 8))), R = rc * (.7 + rr() * .6);
      o += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(R)}" ry="${F(R * (.6 + rr() * .3))}" transform="rotate(${F(rr() * 180)} ${F(x)} ${F(y)})" fill="${C(ramp8[i])}"/>`; });
    return o + `</g>`; };
  for (let row = 0; row < 2; row++) for (let x = -360; x < 360; x += (row ? 11 : 7) + rt() * 13) {
    const z = BOSQ0(x) + (row ? 10 + rt() * 10 : rt() * 6), p = sx(x, z);
    if (p < -150 || p > W + 150 || rt() < .16) continue;
    const h = 15 + rt() * 7, cw = 12 + rt() * 8, fork = 3.5 + rt() * 2.5, lobes = [[0, (fork + h) / 2 + 1, cw * .42, (h - fork) * .42]];
    const nl = 3 + Math.floor(rt() * 3);
    for (let i = 0; i < nl; i++) { const rx = 3.2 + rt() * 2.6, ry = 2.8 + rt() * 2;
      lobes.push([(rt() - .5) * (cw - rx * 1.6), fork + ry + rt() * (h - fork - ry * 2), rx, ry]); }
    const rp = rt(), Tr = { x, z, h, cw, fork, lobes, lean: (rt() - .5) * 2, seed: Math.floor(rt() * 1e6), ramp: rp < .6 ? "gold" : rp < .85 ? "lime" : "rust" };
    TREES.push(Tr);
    w.sprite({ x, z, y: .5, fn: cottonwood(Tr) }); }

  /* ---------- hot-air balloons ---------- */
  const PATCH = ["#d8342c", "#f4c430", "#2a7ac0", "#4aa84a", "#f08a24", "#8a3aa0", "#f2eee6"];
  const PATS = [
    g => ["#d8342c", "#f08a24", "#f4c430", "#4aa84a", "#2a7ac0", "#6a4aa8"][g % 6],          // rainbow gores
    g => g % 2 ? "#f2eee6" : "#c8282a",                                                      // red and white
    (g, t) => t < .3 ? "#f4c430" : t < .62 ? "#d8342c" : "#24508a",                          // three bands
    (g, t) => Math.abs(t - (g % 2 ? .52 : .4)) < .07 ? "#f6f2ea" : "#2a6ab8",                // blue, white zigzag
    g => g % 4 < 2 ? "#2e8a4a" : "#f0c838",                                                  // green and gold
    (g, t) => t < .18 ? "#f4d03a" : g % 2 ? "#8a3aa0" : "#e8609a",                           // purple/pink, gold crown
    g => g % 3 === 0 ? "#1e1e24" : "#f07a1a",                                                // orange and black
    (g, t) => PATCH[(g * 7 + Math.floor(t * 5) * 3) % PATCH.length],                         // patchwork
    (g, t) => t > .55 ? "#1a3a6a" : g % 2 ? "#e83a3a" : "#f6f2ea",                           // stripes over navy
    (g, t) => Math.floor(t * 6 + g * .5) % 2 ? "#18a0a8" : "#f8f2e4" ];                      // turquoise spiral
  const YTH = 5.35;
  const balloon = B => (px, py, k, fog) => {
    const R = B.R, Ytop = YTH + 2.25 * R, kR = k * R, glow = NIGHT ? (B.glow || 0) : 0;
    const C = c => T(mix(c, HZ, fog));
    const shadeDay = (c, b) => b < .62 ? mix(c, "#3a2c48", (.62 - b) * 1.1) : mix(c, "#fff4e0", (b - .62) * .6);
    const shadeNight = (c, b) => mix(mix(c, "#000000", .7), mix(c, "#fff0d0", .28), Math.min(1, b));
    let o = "";
    if (NIGHT && glow > .3) o += `<circle cx="${F(px)}" cy="${F(py - k * (Ytop - R))}" r="${F(kR * 3.4)}" fill="url(#rgHalo)" opacity="${F(Math.min(1, glow * 1.15))}"/>`;
    if (kR < 3.5) {                                   // a speck: one shaded teardrop
      const c = PATS[B.pat](1, .4), cy = py - k * (Ytop - R);
      return o + `<path d="M${F(px - kR)},${F(cy)} A${F(kR)},${F(kR * 1.05)} 0 1 1 ${F(px + kR)},${F(cy)} L${F(px + kR * .2)},${F(py - k * YTH)} L${F(px - kR * .2)},${F(py - k * YTH)}Z" fill="${NIGHT ? shadeNight(c, glow * .8) : C(shadeDay(c, .55))}"/>`
        + `<path d="M${F(px)},${F(cy - kR)} A${F(kR)},${F(kR * 1.05)} 0 0 1 ${F(px + kR)},${F(cy)} L${F(px + kR * .2)},${F(py - k * YTH)} L${F(px)},${F(py - k * YTH)}Z" fill="${NIGHT ? shadeNight(c, glow) : C(shadeDay(c, .85))}" opacity=".8"/>`
        + `<rect x="${F(px - Math.max(.5, .7 * k))}" y="${F(py - Math.max(.8, 1.1 * k))}" width="${F(Math.max(1, 1.4 * k))}" height="${F(Math.max(.8, 1.1 * k))}" fill="${C("#5a4028")}"/>`; }
    const small = kR < 10, prof = [];
    (small ? [0, 30, 60, 90, 115] : [0, 10, 20, 30, 42, 54, 66, 78, 90, 102, 115]).forEach(d => { const a = d * Math.PI / 180; prof.push([R * Math.sin(a), Ytop - R * (1 - Math.cos(a))]); });
    const [r0, y0] = prof[prof.length - 1], ns = small ? 2 : 5;
    for (let i = 1; i <= ns; i++) { const u = i / ns; prof.push([r0 + (.2 * R - r0) * Math.pow(u, 1.25), y0 + (YTH - y0) * u]); }
    const P = (rho, phi, Y) => F(px + k * rho * Math.sin(phi)) + "," + F(py - k * Y);
    const nG = small ? 10 : B.nG, step = Math.PI * 2 / nG, wrap = a => { a = (a + Math.PI) % (Math.PI * 2); if (a < 0) a += Math.PI * 2; return a - Math.PI; };
    // skirt and cables behind the throat, then the basket
    const skC = NIGHT ? shadeNight("#2a2830", glow * .6) : C("#2e2c34");
    o += `<path d="M${P(.2 * R, -Math.PI / 2, YTH)} L${P(.2 * R, Math.PI / 2, YTH)} L${F(px + k * .26 * R)},${F(py - k * 3.75)} L${F(px - k * .26 * R)},${F(py - k * 3.75)}Z" fill="${skC}"/>`;
    const cab = NIGHT ? "#6a4a30" : C("#3a3430"), cw = F(Math.max(.4, .06 * k));
    [[-.26 * R, -.7], [.26 * R, .7], [-.1 * R, -.25], [.1 * R, .25]].forEach(([a, b]) =>
      o += `<line x1="${F(px + a * k)}" y1="${F(py - 3.75 * k)}" x2="${F(px + b * k)}" y2="${F(py - 1.15 * k)}" stroke="${cab}" stroke-width="${cw}"/>`);
    o += `<rect x="${F(px - .4 * k)}" y="${F(py - 3.05 * k)}" width="${F(.8 * k)}" height="${F(.4 * k)}" fill="${NIGHT ? "#3a3438" : C("#5a5a60")}"/>`;
    const wick = NIGHT ? mix("#8a6a42", "#000000", .4 - glow * .3) : C("#8a6a42");
    o += `<rect x="${F(px - .75 * k)}" y="${F(py - 1.15 * k)}" width="${F(1.5 * k)}" height="${F(1.15 * k)}" fill="${wick}"/>`
      + `<rect x="${F(px + .3 * k)}" y="${F(py - 1.15 * k)}" width="${F(.45 * k)}" height="${F(1.15 * k)}" fill="${NIGHT ? mix(wick, "#ffc070", glow * .3) : C("#b08a5a")}" opacity=".8"/>`
      + `<rect x="${F(px - .8 * k)}" y="${F(py - 1.25 * k)}" width="${F(1.6 * k)}" height="${F(Math.max(.6, .2 * k))}" fill="${NIGHT ? "#2a1a10" : C("#4a2a18")}"/>`;
    if (k > 6) for (let i = 1; i < 6; i++) o += `<line x1="${F(px - .75 * k + i * .25 * k)}" y1="${F(py - 1.05 * k)}" x2="${F(px - .75 * k + i * .25 * k)}" y2="${F(py)}" stroke="#000" stroke-opacity=".18" stroke-width="${F(.05 * k)}"/>`;
    if (B.flame) { const fy = py - 3.05 * k;
      o += `<circle cx="${F(px)}" cy="${F(fy - .9 * k)}" r="${F(2.6 * k)}" fill="url(#rgGlow)" opacity="${NIGHT ? .95 : .55}"/>`
        + `<path d="M${F(px - .3 * k)},${F(fy)} Q${F(px - .35 * k)},${F(fy - 1 * k)} ${F(px)},${F(fy - 2.1 * k)} Q${F(px + .35 * k)},${F(fy - 1 * k)} ${F(px + .3 * k)},${F(fy)}Z" fill="url(#rgFlame)"/>`; }
    // the envelope: gores in the pattern, each strip lit as a surface of revolution
    for (let g = 0; g < nG; g++) {
      const p0 = Math.max(-Math.PI / 2, wrap(B.rot + g * step)), p1 = Math.min(Math.PI / 2, wrap(B.rot + g * step) + step);
      if (p1 <= p0) continue;
      const pm = (p0 + p1) / 2;
      for (let j = 0; j + 1 < prof.length; j++) {
        const [ra, ya] = prof[j], [rb2, yb] = prof[j + 1], dr = rb2 - ra, dy = yb - ya, l = Math.hypot(dr, dy) || 1;
        const nr = -dy / l, ny = dr / l, n = [nr * Math.sin(pm), ny, -nr * Math.cos(pm)];
        const t = (Ytop - (ya + yb) / 2) / (Ytop - YTH), c = PATS[B.pat](g, t);
        let fill;
        if (NIGHT) fill = shadeNight(c, glow * (.3 + .7 * Math.cos(pm)) * (.45 + .6 * t) + .05);
        else { const d = n[0] * LB[0] + n[1] * LB[1] + n[2] * LB[2], b = .4 + .62 * Math.max(0, d) + .1 * Math.max(0, -d); fill = C(shadeDay(c, b)); }
        o += `<path d="M${P(ra, p0, ya)} L${P(ra, p1, ya)} L${P(rb2, p1, yb)} L${P(rb2, p0, yb)}Z" fill="${fill}" stroke="${fill}" stroke-width=".6" stroke-linejoin="round"/>`; } }
    if (kR > 20) {            // load tapes on the seams
      let tp = "";
      for (let g = 0; g < nG; g++) { const a = wrap(B.rot + g * step); if (a < -Math.PI / 2 || a > Math.PI / 2) continue;
        tp += `<path d="M${prof.map(([r, y]) => P(r, a, y)).join(" L")}" fill="none"/>`; }
      o += `<g stroke="#1a1418" stroke-opacity=".28" stroke-width="${F(Math.max(.5, .05 * k))}">${tp}</g>`; }
    if (!NIGHT && !small) o += `<ellipse cx="${F(px + .48 * kR)}" cy="${F(py - k * (Ytop - .58 * R))}" rx="${F(.4 * kR)}" ry="${F(.55 * kR)}" fill="url(#rgSpec)"/>`;
    return o; };

  const boxes = [], BAL = [];
  const overl = b => boxes.some(q => { const ix = Math.max(0, Math.min(b[2], q[2]) - Math.max(b[0], q[0])), iy = Math.max(0, Math.min(b[3], q[3]) - Math.max(b[1], q[1]));
    return ix * iy > .1 * Math.min((b[2] - b[0]) * (b[3] - b[1]), (q[2] - q[0]) * (q[3] - q[1])); });
  const bbox = (x, z, alt, R) => { const k = FL / z, Ht = YTH + 2.25 * R, p = sx(x, z), q = sy(alt, z); return [p - R * k, q - Ht * k, p + R * k, q]; };
  const hidden = (x, z, alt) => {        // is the basket behind the bosque or a front-row tree?
    const p = sx(x, z), q = sy(alt, z);
    for (let d = 380; d < Math.min(z, 2600); d += Math.max(1, d * .006)) { const h = hT(wx(p, d), d); if (h >= 0 && sy(h, d) < q + 3) return true; }
    return TREES.some(Tr => Tr.z < z && Math.abs(sx(Tr.x, Tr.z) - p) < Tr.cw * .55 * FL / Tr.z && q > sy(Tr.h + 1, Tr.z)); };
  const place = (B, keep) => { const b = bbox(B.x, B.z, B.alt, B.R); if (!keep && overl(b)) return false; boxes.push(b); BAL.push(B); return true; };
  const atScreen = (p, z) => wx(p, z);
  const onBeach = p => { let z = 430; for (let i = 0; i < 4; i++) z = zFB(wx(p, z)) + 4.5; return z; };   // open sand, in front of the trees

  if (!NIGHT) {
    place({ x: atScreen(1190, 165), z: 165, alt: 2.6, R: 8.2, pat: 0, nG: 24, rot: .1, flame: true }, true);       // splash and dash
    place({ x: atScreen(1420, 270), z: 270, alt: 23.5, R: 7.6, pat: 3, nG: 20, rot: .3 }, true);
    place({ x: atScreen(965, 340), z: 340, alt: 19.9, R: 7.2, pat: 5, nG: 18, rot: .05 }, true);
    [[620, 1, 0], [1930, 4, 1]].forEach(([p, pat, i]) => { const z = onBeach(p); place({ x: wx(p, z), z, alt: .5, R: 7.4, pat, nG: 20, rot: .2 * i, stand: true }, true); });
    for (let a = 0, n = 0; a < 4000 && n < 46; a++) {
      const z = 230 * Math.pow(5200 / 230, Math.pow(rb(), .8)), p = Math.max(80, Math.min(W - 80, 1280 + (rb() + rb() + rb() - 1.5) * 1500));
      const qB = 110 + rb() * 330, x = wx(p, z), alt = EYE + (WY - qB) * z / FL, R = 6.6 + rb() * 2.4;
      const overLand = z > zFB(x); if (alt < (overLand ? 30 : 4) || alt > 1600) continue;
      const b = bbox(x, z, alt, R); if (b[1] < 30 || b[3] - b[1] > 170) continue;
      if (b[1] < 262 && (b[0] < 900 || b[2] > 1500)) continue;        // keep the text corners calm
      if (overl(b) || (overLand && hidden(x, z, alt))) continue;
      place({ x, z, alt, R, pat: Math.floor(rb() * PATS.length), nG: [16, 18, 20, 24][Math.floor(rb() * 4)], rot: rb() * 6, flame: rb() < .12 }); n++; }
  } else {
    [[300, 3, 0], [640, 0, 7], [905, 8, 2], [1330, 4, 11], [1575, 5, 0], [1990, 1, 5], [2310, 9, 9]].forEach(([p, pat, dz], i) => {
      const z = onBeach(p) + dz * .3; place({ x: wx(p, z), z, alt: .5, R: 7 + (i % 3) * .5, pat, nG: 20, rot: i * .4, stand: true, glow: .75 + (i % 3) * .12, flame: i % 3 !== 1 }, true); });
    [[1120, 190, 700, 0], [1400, 290, 1100, 2], [960, 330, 900, 6], [1230, 120, 1500, 7]].forEach(([p, q, z, pat], i) =>
      place({ x: wx(p, z), z, alt: EYE + (WY - q) * z / FL, R: 7.5, pat, nG: 18, rot: i, glow: i === 3 ? .35 : .85, flame: i !== 3 }, true));
  }
  BAL.forEach(B => w.sprite({ x: B.x, z: B.z, y: B.alt, bias: -.5, fn: balloon(B) }));
  /* contact shadows and beach glow under the standing balloons; a chase truck by each one by day */
  BAL.filter(B => B.stand).forEach((B, i) => {
    w.sprite({ x: B.x, z: B.z - .2, y: .5, bias: -.3, noRefl: true, fn: (px, py, k) => NIGHT
      ? `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(B.R * 2.2 * k)}" ry="${F(1.4 * k)}" fill="url(#rgGlow)" opacity=".55"/>`
      : `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(B.R * .7 * k)}" ry="${F(.5 * k)}" fill="#000" opacity=".25"/>` });
    if (!NIGHT) { const tx = B.x + (i ? -13 : 12), tz = B.z - 1, yaw = 90;
      w.box({ x: tx, z: tz, y: .5, yaw, w: 5.2, d: 2, h: 1, c: i ? "#2e4a6a" : "#e8e4dc" });
      w.box({ x: tx + (i ? .9 : -.9), z: tz, y: 1.5, yaw, w: 2, d: 1.9, h: .8, c: i ? "#2a3a50" : "#d8d4cc" });
      w.box({ x: tx + (i ? -4.8 : 4.8), z: tz, y: .5, yaw, w: 3.2, d: 1.8, h: .7, c: "#5a5a60" }); } });

  /* ---------- sandhill cranes on a sandbar (day) ---------- */
  if (!NIGHT) {
    let spot = null;
    for (let a = 0; a < 3000 && !spot; a++) { const p = 1460 + rl() * 340, z = 230 + rl() * 120, x = wx(p, z), h = hT(x, z);
      if (h > .15 && h < .45 && hT(x + 4, z) > .1 && hT(x - 4, z) > .1) spot = [x, z]; }
    if (spot) for (let i = 0; i < 5; i++) { const x = spot[0] + (rl() - .5) * 8, z = spot[1] + (rl() - .5) * 4, fl = rl() < .5 ? 1 : -1, down = i === 2;
      w.sprite({ x, z, y: .3, fn: (px, py, k) => { const g = T("#8a8a92"), d = T("#5a5a62");
        const bx = px, by = py - 1 * k, hx = px + fl * (down ? .6 : .25) * k, hy = py - (down ? .7 : 1.6) * k;
        return `<line x1="${F(px - .1 * k)}" y1="${F(py)}" x2="${F(px - .05 * k)}" y2="${F(by)}" stroke="${d}" stroke-width="${F(Math.max(.5, .06 * k))}"/>`
          + `<line x1="${F(px + .12 * k)}" y1="${F(py)}" x2="${F(px + .05 * k)}" y2="${F(by)}" stroke="${d}" stroke-width="${F(Math.max(.5, .06 * k))}"/>`
          + `<ellipse cx="${F(bx)}" cy="${F(by - .1 * k)}" rx="${F(.55 * k)}" ry="${F(.26 * k)}" fill="${g}"/>`
          + `<ellipse cx="${F(bx - fl * .3 * k)}" cy="${F(by - .05 * k)}" rx="${F(.3 * k)}" ry="${F(.18 * k)}" fill="${d}"/>`
          + `<line x1="${F(bx + fl * .35 * k)}" y1="${F(by - .15 * k)}" x2="${F(hx)}" y2="${F(hy)}" stroke="${g}" stroke-width="${F(Math.max(.6, .1 * k))}"/>`
          + `<circle cx="${F(hx)}" cy="${F(hy)}" r="${F(Math.max(.6, .1 * k))}" fill="#c83a2a"/>`
          + `<line x1="${F(hx)}" y1="${F(hy)}" x2="${F(hx + fl * .22 * k)}" y2="${F(hy + .05 * k)}" stroke="${d}" stroke-width="${F(Math.max(.4, .04 * k))}"/>`; } }); }
  }

  /* ---------- our bank: chamisa (rabbitbrush) in yellow bloom, dry grass ---------- */
  for (let a = 0, n = 0; a < 400 && n < 34; a++) { const z = 70 + rl() * 26, x = wx(rl() * W, z);
    if (z > zNB(x) - 4) continue;
    const sz = .8 + rl() * .7, sd = Math.floor(rl() * 1e6); n++;
    w.sprite({ x, z, y: hT(x, z), noRefl: true, fn: (px, py, k) => { const r2 = rng(sd), m = sz * k;
      let o = `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(m * 1.1)}" ry="${F(m * .18)}" fill="#000" opacity=".2"/>`;
      for (let i = 0; i < 14; i++) { const a2 = -Math.PI / 2 + (r2() - .5) * 1.8; o += `<line x1="${F(px)}" y1="${F(py)}" x2="${F(px + Math.cos(a2) * m * .9)}" y2="${F(py + Math.sin(a2) * m * .9)}" stroke="${T("#7a8466")}" stroke-width="${F(Math.max(.5, .04 * k))}"/>`; }
      const cl = [];
      for (let i = 0; i < 46; i++) { const a2 = r2() * Math.PI, d = Math.sqrt(r2()); const u = Math.cos(a2) * d, v = Math.sin(a2) * d;
        cl.push([px + u * m, py - m * .35 - v * m * .65, .3 + .7 * Math.max(0, u * .8 + v * .5) + (r2() - .5) * .2]); }
      cl.sort((p, q) => p[2] - q[2]).forEach(([cx, cy, b]) => { const R = Math.max(.8, m * (.1 + r2() * .06));
        o += `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(R)}" fill="${T(b < .45 ? "#8a8a4a" : b < .7 ? "#d8b830" : b < .9 ? "#ecd048" : "#f8e888")}"/>`; });
      return o; } }); }

  /* ---------------- assemble ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  s += `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="url(#rgWater)"/>`;
  { // the bosque mass mirrored under the far bank (the raster's mirror pass stops at the water line)
    let top = "", bot = "";
    for (let p = -20; p <= W + 20; p += 20) { const z = zFB(wx(p, 430)); top += `${p},${F(sy(0, z))} `; bot = `${p},${F(sy(-17 - 4 * N1(p / 90, 3), z + 40))} ` + bot; }
    s += `<defs><linearGradient id="rgBosqR" x1="0" y1="470" x2="0" y2="${NIGHT ? 560 : 565}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${T("#3e3424")}" stop-opacity=".85"/><stop offset=".35" stop-color="${T("#9a8030")}" stop-opacity=".75"/><stop offset="1" stop-color="${T("#c8a848")}" stop-opacity=".25"/></linearGradient></defs>`;
    s += `<g filter="url(#rgRipple)"><polygon points="${top}${bot}" fill="url(#rgBosqR)"/></g>`; }
  s += `<g filter="url(#rgRipple)" opacity="${NIGHT ? .9 : .78}">${w.draw({ mirror: true })}</g>`;
  s += `<g opacity="${NIGHT ? .25 : .5}">`;
  for (let i = 0; i < 150; i++) { const y = 480 + Math.pow(rs(), .8) * 160, x = NIGHT ? rs() * W : W * (.35 + .65 * Math.pow(rs(), .6)), l = 20 + rs() * 90 * (y - 440) / 200;
    s += `<rect x="${F(x)}" y="${F(y)}" width="${F(l)}" height="1.3" fill="${NIGHT ? "#ffd0a0" : "#fff6e6"}" opacity="${F(.1 + rs() * .3)}"/>`; }
  s += `</g>`;
  s += w.draw({ where: isR });
  s += `<rect x="0" y="300" width="${W}" height="96" fill="url(#rgMist)" opacity="${NIGHT ? .3 : .42}"/>`;
  if (NIGHT) {   // city lights up the slope to the foothills, red beacons on Sandia Crest
    const sky = {}, skyl = p => { const c = Math.round(p / 3); if (sky[c] !== undefined) return sky[c]; let m = 1e9;
      for (let d = 380; d < 2600; d += Math.max(1, d * .006)) { const h = hT(wx(c * 3, d), d); if (h >= 0) m = Math.min(m, sy(h, d)); } return sky[c] = m; };
    s += `<g>`;
    for (let i = 0; i < 2600; i++) { const z = 5000 + 13000 * Math.pow(rl(), .8), x = (rl() - .5) * 1.3 * z, g = ramp(z) + 4;
      if (mount(x, z) > g) continue;
      const p = sx(x, z), q = sy(g, z); if (p < 0 || p > W || q > skyl(p) - 1) continue;
      const c = rl(); s += `<circle cx="${F(p)}" cy="${F(q)}" r="${F(.5 + rl() * .8)}" fill="${c < .6 ? "#ffb860" : c < .85 ? "#ffe0a8" : "#f0f4ff"}" opacity="${F(.45 + rl() * .5)}"/>`; }
    [-2600, -2450, -2300].forEach((x, i) => { let best = [0, 0]; for (let z = 18000; z < 23000; z += 50) { const h = mount(x, z); if (h > best[0]) best = [h, z]; }
      const p = sx(x, best[1]), q = sy(best[0] + 40, best[1]);
      s += `<circle cx="${F(p)}" cy="${F(q)}" r="${i === 1 ? 7 : 5}" fill="url(#rgRed)"/><circle cx="${F(p)}" cy="${F(q)}" r="1.1" fill="#ff8a6a"/>`; });
    s += `</g>`;
  }
  s += w.draw({ where: notR });
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#rgLight)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#rgPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrapS = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrapS(skyPart);
  if (opts.part === "clouds") return wrapS(cloudPart);
  if (opts.part === "land") return wrapS(s);
  return wrapS(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
