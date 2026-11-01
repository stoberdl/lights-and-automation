/* Janitzio on Lake Pátzcuaro for Día de Muertos (Michoacán, Mexico). Seen
   from a canoe out on the lake: the island rises as a steep dome packed with
   white-walled, terracotta-roofed houses (some with the red-ochre wainscot
   band of the lake towns), stone lanes spiralling up, ash and cypress trees,
   the stone landing at the foot, the white church and its panteón (graves
   heaped with cempasúchil marigolds, marigold arches, crosses) on the lower
   right slope, and José María Morelos's 40 m statue on the summit, fist
   raised. Low islands lie behind, the pine-and-oak hills of the far shores
   ring the lake. Near the viewer a dugout canoe carries marigold bundles, an
   arch of flowers and candles, its two butterfly nets standing up like wings;
   a second net canoe further off, marigold petals floating, tule reeds.
   Sun low off the right edge (late afternoon, dry season), clean blue, egrets.
   opts.time === "night": the vigil. Moonless (the moon rises after midnight),
   stars and a faint Milky Way, the panteón ablaze with candles, lit windows
   up the island, the statue floodlit, candle-lit canoes crossing the water
   with their light streaks, the near canoe's candles lit.
   Land is two rasters (island, far shores) placed by world3d() (eye 2.2 m on
   the water, f 1900, horizon 430); houses, church and landing are solids,
   statue, canoes, graves and trees are sprites. Reflections of the island
   and far shores are the land flipped about each band's own waterline.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), hexRGB(), rgbTone(), mountainField() and mountainColor() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function janitzioNocheDeMuertosArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1102;
  const r = rng(seed), rs = rng(seed + 7), rh = rng(seed + 19), rl = rng(seed + 31), rt = rng(seed + 53), rc = rng(seed + 71), rv = rng(seed + 89);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 2820, LY = 236, WY = 430, FL = 1900, EYE = 2.2;
  const T = c => NIGHT ? mix(mix(c, "#6a7090", .42), "#080e2a", .62) : c;
  const HZ = NIGHT ? "#262a4c" : "#e4dccb", RIM = NIGHT ? "#a8b8e0" : "#fff2d0", LAMP = "#ffc060", FLAME = "#ffd474";
  const FOGK = .00009;
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
  const blobP = (cx, cy, rx, ry, n, rr = r) => {
    n = n || 7 + Math.floor(rr() * 4);
    const pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + rr() * .3, k = .8 + rr() * .35;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    let d = `M${F(pts[0][0])},${F(pts[0][1])}`;
    for (let i = 0; i < n; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n];
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = mx - cx, dy = my - cy, L = Math.hypot(dx, dy) || 1, b = .45 * Math.hypot(x1 - x0, y1 - y0);
      d += ` Q${F(mx + dx / L * b)},${F(my + dy / L * b)} ${F(x1)},${F(y1)}`; }
    return d + "Z";
  };

  /* ---------------- sky ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040720"/><stop offset=".45" stop-color="#0e183e"/><stop offset=".84" stop-color="#22284e"/><stop offset="1" stop-color="#3a3052"/>`
    : `<stop offset="0" stop-color="#2f66ae"/><stop offset=".42" stop-color="#7aa4d2"/><stop offset=".84" stop-color="#d2d6d2"/><stop offset="1" stop-color="${HZ}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#ffb860" stop-opacity=".22"/><stop offset=".4" stop-color="#ff9a40" stop-opacity=".06"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff0c8" stop-opacity=".95"/><stop offset=".2" stop-color="#ffe4b4" stop-opacity=".45"/><stop offset=".6" stop-color="#f8dca8" stop-opacity=".1"/><stop offset="1" stop-color="#f8dca8" stop-opacity="0"/>`;
  let s = `<defs id="jzdefs">
    <linearGradient id="jzSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="jzLight" cx="${NIGHT ? 1500 : LX}" cy="${NIGHT ? 420 : LY}" r="${NIGHT ? 900 : 1500}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="jzHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".65" stop-color="${HZ}" stop-opacity=".7"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="jzWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#32365a"/><stop offset=".2" stop-color="#1a2248"/><stop offset="1" stop-color="#060a20"/>`
      : `<stop offset="0" stop-color="#c6cac2"/><stop offset=".15" stop-color="#8aa0a0"/><stop offset=".6" stop-color="#4e6a6a"/><stop offset="1" stop-color="#2c4446"/>`}</linearGradient>
    <radialGradient id="jzGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffa040" stop-opacity=".3"/><stop offset="1" stop-color="#ffa040" stop-opacity="0"/></radialGradient>
    <radialGradient id="jzFlood"><stop offset="0" stop-color="#ffe8c0" stop-opacity=".45"/><stop offset=".5" stop-color="#ffd8a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffd8a0" stop-opacity="0"/></radialGradient>
    <radialGradient id="jzVigil"><stop offset="0" stop-color="#ffb050" stop-opacity=".55"/><stop offset=".45" stop-color="#ff9030" stop-opacity=".18"/><stop offset="1" stop-color="#ff9030" stop-opacity="0"/></radialGradient>
    <clipPath id="jzCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="jzLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".13" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="jzCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="3" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="jzRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .12" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1"/></filter>
    <filter id="jzPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="jzSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="jzMilky"><feGaussianBlur stdDeviation="34"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#jzSky)"/>`;
  if (NIGHT) {
    // a faint Milky Way rising out of the south-west, left of the island
    // patchy clouds of light along a curve, with a dark rift, and a denser dusting of faint stars
    const mw = t => [120 + t * 700 + Math.sin(t * 5) * 40, -40 + t * 470];
    s += `<g filter="url(#jzMilky)" opacity=".32">`;
    for (let i = 0; i < 26; i++) { const t = rs(), [x, y] = mw(t), off = (rs() - .5) * 160;
      s += `<ellipse cx="${F(x + off)}" cy="${F(y - off * .5)}" rx="${F(70 + rs() * 110)}" ry="${F(40 + rs() * 60)}" fill="${rs() < .4 ? "#8a90b8" : "#5a6290"}" opacity="${F(.4 + rs() * .5)}"/>`; }
    for (let i = 0; i < 6; i++) { const [x, y] = mw(.15 + i * .13); s += `<ellipse cx="${F(x + 20)}" cy="${F(y)}" rx="${F(40 + rs() * 30)}" ry="${F(18 + rs() * 12)}" fill="#060a24" opacity=".6"/>`; }
    s += `</g>`;
    for (let i = 0; i < 700; i++) { const [x, y] = mw(rs()), d = (rs() - .5) * (rs() - .5) * 600;
      if (y + d * .5 > 420) continue;
      s += `<circle cx="${F(x + d)}" cy="${F(y - d * .5)}" r="${F(.4 + rs() * .45)}" fill="#dfe4ff" opacity="${F(.15 + rs() * .3)}"/>`; }
    for (let i = 0; i < 520; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 410, big = rs() < .07;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.6 : F(.5 + rs() * .55)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F((.25 + rs() * .6) * (1 - y / 450))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#jzLight)"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#jzLight)"/>`;
    s += `<g class="rays" opacity=".05" filter="url(#jzSoft)">`;
    for (let k = 0; k < 6; k++) { const a = Math.PI + .1 - k * .08, L = 1600;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .025) * L)},${F(LY + Math.sin(a - .025) * L)} L${F(LX + Math.cos(a + .025) * L)},${F(LY + Math.sin(a + .025) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: scattered fair-weather heaps, lit from the right ---------------- */
  const cloud = (x, y, w, flat, cls) => {
    let c = `<g class="${cls}"><g filter="url(#jzCloudy)">`;
    const lobes = [], nL = 8 + Math.floor(rs() * 4);
    for (let k = 0; k < nL; k++) { const t = k / (nL - 1); lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * flat * (.6 + rs() * .8), w * (.06 + rs() * .06)]); }
    if (NIGHT) {
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .035)}" fill="#161c40" opacity=".8"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.3)}" ry="${F(R * .45)}" fill="#20264a" opacity=".85"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .04)}" rx="${F(w * .55)}" ry="${F(w * .06)}" fill="#aab2c4"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .2)}" cy="${F(ly + R * .3)}" rx="${F(R * 1.15)}" ry="${F(R * .7)}" fill="#c2c6d0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .8)}" fill="#eeeeea"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .35)}" cy="${F(ly - R * .3)}" rx="${F(R * .55)}" ry="${F(R * .38)}" fill="#fff8e6"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .55)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="#f2d4a0" opacity=".35"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(360, 128, 520, .12, "drift1") + cloud(1980, 96, 560, .1, "drift2") + cloud(2400, 262, 300, .14, "drift3") + cloud(1060, 62, 280, .09, "drift1") + cloud(620, 318, 240, .12, "drift2") + cloud(1760, 326, 220, .12, "drift3");
  if (!NIGHT) {   // great egrets crossing toward the island
    s += `<g class="birds" stroke-linecap="round">`;
    [[1540, 236, 1], [1590, 214, .85], [1640, 248, .8], [700, 270, .7], [742, 252, .6]].forEach(([x, y, k]) => {
      const fl = rs() < .5 ? 1 : -1;
      s += `<path d="M${F(x - 18 * k)},${F(y - 2 * k)} q${F(9 * k)},${F(-10 * k * fl)} ${F(18 * k)},${F(2 * k)} q${F(9 * k)},${F(-10 * k * fl)} ${F(18 * k)},${F(-2 * k)}" stroke="#f8f6f0" stroke-width="${F(3.4 * k)}" fill="none"/>`;
      s += `<path d="M${F(x)},${F(y + k)} l${F(-9 * k)},${F(-1 * k)} M${F(x)},${F(y + k)} l${F(10 * k)},${F(1.5 * k)}" stroke="#e8e4da" stroke-width="${F(2 * k)}" fill="none"/>`;
      s += `<path d="M${F(x + 10 * k)},${F(y + 2.5 * k)} l${F(5 * k)},${F(.5 * k)}" stroke="#d8a830" stroke-width="${F(1.2 * k)}"/>`; });
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ---------------- the water ---------------- */
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#jzWater)"/>`;
  const reflAt = s.length;

  /* ================= the 3D world =================
     Eye 2.2 m above the lake, horizon on WY, f 1900. x right, y up, z away; water at y = 0. */
  const w = world3d({ h: EYE, hy: WY, f: FL, fog: HZ, fogK: FOGK, rim: RIM, shade: .5, hi: .25, night: NIGHT, lamp: LAMP,
    light: [.7, .5, -.45], tone: T, shadow: NIGHT ? "#04060e" : "#3a3048" });
  const N1 = noise2(1103), N2 = noise2(1104), N3 = noise2(1105), RG = hexRGB;
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));

  /* Janitzio: a steep dome, about 660 m across and 88 m high, its foot ragged with rocks */
  const IZ = 740, IRX = 330, IRZ = 250;
  const iD = (x, z) => Math.hypot(x / IRX, (z - IZ) / IRZ);
  const hI = (x, z) => { const d = iD(x, z); if (d > 1.25) return -3;
    return 88 * Math.pow(Math.max(0, 1 - d * .97), 1.25) + 4 * N1(x / 70, z / 70) + 1.2 * N3(x / 18, z / 18) - 2; };
  const GR1 = RG("#8e8a4c"), GR2 = RG("#aa9c5c"), EARTH = RG("#8a6a4a"), LANE = RG("#b4a68a"), ROCK = RG("#6e6456"), TREEG = RG("#3e5230");
  w.raster({ z0: 380, z1: 1250, top: 90, bottom: 445, scale: .6, step: .0014, minStep: .25, amb: .5, fog: HZ, fogK: FOGK, tone: rgbTone(T), tag: "isl",
    h: hI, col: (x, y, z, n, ao) => {
      const k = N1(x / 8, z / 8) * .5 + N3(x / 26, z / 26) * .5;
      if (y < 2.2) return lerp(ROCK, EARTH, k + .4);
      const d = iD(x, z), ang = Math.atan2((z - IZ) / IRZ, x / IRX) / (Math.PI * 2);
      const lane = Math.abs(((d * 5.2 + ang) % 1 + 1) % 1 - .5) < .035;
      let c = lerp(GR1, GR2, .5 + k);
      c = lerp(c, EARTH, (N3(x / 12 + 5, z / 12) - .1) * 1.6);
      c = lerp(c, TREEG, (N2(x / 20, z / 20) - .2) * 1.4);
      return lane ? lerp(LANE, c, .25) : c; } });

  /* the far lake: two low wooded islands, then the shores and the pine-and-oak hills around */
  const ISL = [[-980, 2150, 270, 170, 30], [1350, 2700, 220, 150, 22], [-2300, 3400, 300, 160, 18]];
  const zS = x => 4300 + 1100 * N2(x / 2400, .7) - (x < -2400 ? (-2400 - x) * .45 : 0) - (x > 3000 ? (x - 3000) * .3 : 0);
  const MF = mountainField({ seed: 1106, scale: 2300, oct: 7, peaks: [{ x: -5200, z: 9800, h: 430, r: 3000 }, { x: -1900, z: 12800, h: 360, r: 2600 },
    { x: 2500, z: 9000, h: 400, r: 2300 }, { x: 6300, z: 11200, h: 560, r: 3200 }, { x: 400, z: 17500, h: 640, r: 4200 }, { x: -9000, z: 15000, h: 520, r: 3800 }] });
  const hFar = (x, z) => { let h = -1;
    for (const [cx, cz, rx, rz, hh] of ISL) { const d = Math.hypot((x - cx) / rx, (z - cz) / rz); if (d < 1.15) h = Math.max(h, hh * Math.pow(Math.max(0, 1 - d), 1.1) + 3 * N2(x / 80, z / 80) - 1.5); }
    const zs = zS(x); if (z > zs) { const t = z - zs; h = Math.max(h, 2 + 14 * sm(t / 320) + MF(x, z) * sm((t - 150) / 2600)); }
    return h; };
  const MC = mountainColor({ seed: 1107, tree: 2600, forest: "#34482e", gold: "#9a8c48", goldK: .3, grass: "#9c9658", rock: "#7a7062", rock2: "#5a5248", scree: "#8a8272" });
  const FOR1 = RG("#2e4228"), FOR2 = RG("#56683a"), SHORE = RG("#7a6c50");
  w.raster({ z0: 1250, z1: 40000, top: 200, bottom: 440, scale: .6, step: .002, minStep: 2, amb: .5, fog: HZ, fogK: FOGK, tone: rgbTone(T), tag: "far",
    h: hFar, col: (x, y, z, n, ao) => {
      if (z < zS(x)) return y < 1.5 ? SHORE : lerp(FOR1, FOR2, N2(x / 30, z / 30) * .9 + .45).map(v => v * (1 + N1(x / 9, z / 9) * .2));
      if (z - zS(x) < 120 && y < 6) return lerp(SHORE, RG("#9a9658"), (z - zS(x)) / 120);
      return MC(x, y, z, n, ao); } });
  // villages along the far shore: tiny white walls and tile roofs (lit windows at night)
  for (let i = 0; i < 160; i++) {
    const x = -7000 + rv() * 14000, zs = zS(x), z = zs + 40 + Math.pow(rv(), 1.6) * 600, sx = 1280 + FL * x / z;
    if (sx < 0 || sx > W) continue;
    const y = hFar(x, z); if (y < 1) continue;
    const lit = rv() < .6, wd = 7 + rv() * 6;
    w.sprite({ x, z, y, tag: "far", fn: (px, py, k, fog) => { const ww = Math.max(1.4, wd * k), hh = Math.max(1, 4 * k);
      return NIGHT ? (lit ? `<rect x="${F(px - ww / 2)}" y="${F(py - hh)}" width="${F(ww)}" height="${F(Math.max(1, hh * .7))}" fill="#ffc870" opacity="${F(.5 + rv() * .4)}"/>` : "")
        : `<rect x="${F(px - ww / 2)}" y="${F(py - hh)}" width="${F(ww)}" height="${F(hh)}" fill="${mix("#f2ede2", HZ, fog * .7)}"/><rect x="${F(px - ww / 2)}" y="${F(py - hh - Math.max(.6, 1.2 * k))}" width="${F(ww)}" height="${F(Math.max(.6, 1.2 * k))}" fill="${mix("#a8583a", HZ, fog * .7)}"/>`; } }); }

  /* ---------------- painterly trees ---------------- */
  const fogC = (c, fog) => T(mix(c, HZ, fog * .85));
  const LDIR = [.8, -.6];
  const LEAF = ["#1c2c18", "#26381e", "#324826", "#40582e", "#506a38", "#648044", "#7c9450"];
  const CYP = ["#142216", "#1c2c1c", "#263a24", "#30482c", "#3c5634"];
  const broad = (x, y, hp, fog, rr) => {
    let g = `<ellipse cx="${F(x - hp * .1)}" cy="${F(y + .5)}" rx="${F(hp * .3)}" ry="${F(Math.max(.8, hp * .03))}" fill="#000" opacity=".18"/>`;
    const tw = Math.max(.6, hp * .035);
    g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .5)},${F(y - hp * .5)} L${F(x + tw * .5)},${F(y - hp * .5)} L${F(x + tw)},${F(y)}Z" fill="${fogC("#4a3a2e", fog)}"/>`;
    const nB = Math.max(9, Math.min(70, Math.round(hp * 2)));
    for (let i = 0; i < nB; i++) { const a = rr() * Math.PI * 2, q = Math.pow(rr(), .6), tx = x + Math.cos(a) * q * hp * .36, ty = y - hp * .64 + Math.sin(a) * q * hp * .28;
      const side = ((tx - x) * LDIR[0] + (ty - y + hp * .64) * LDIR[1]) / (hp * .36), R = hp * (.06 + rr() * .06);
      const idx = Math.max(0, Math.min(6, Math.round(3 + side * 2.6 + (rr() - .5) * 1.2)));
      g += `<path d="${blobP(tx, ty, R * (1 + rr() * .5), R * .75, 6, rr)}" fill="${fogC(LEAF[idx], fog)}"/>`; }
    return hp > 16 ? `<g filter="url(#jzLeafy)">${g}</g>` : g; };
  const cypress = (x, y, hp, fog, rr) => {
    let g = `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - hp * .2)}" stroke="${fogC("#3a2c24", fog)}" stroke-width="${F(Math.max(.6, hp * .04))}"/>`;
    const nB = Math.max(8, Math.min(40, Math.round(hp * 1.6)));
    for (let i = 0; i < nB; i++) { const v = i / nB, ty = y - hp * (.12 + v * .86), wd = hp * .13 * Math.sin(Math.min(1, (1 - v) * 1.6) * Math.PI / 2 + .2) * (.8 + rr() * .4);
      const off = (rr() - .5) * wd * .6, side = off / (wd || 1);
      g += `<path d="${blobP(x + off, ty, wd, hp * .05, 6, rr)}" fill="${fogC(CYP[Math.max(0, Math.min(4, Math.round(2 + side * 2 + (rr() - .5))))], fog)}"/>`; }
    return g; };
  const treeFn = (hM, kind, sd) => (px, py, kk, fog) => { const hp = hM * kk, rr = rng(sd);
    return kind === "cyp" ? cypress(px, py, hp, fog, rr) : broad(px, py, hp, fog, rr); };

  /* ---------------- the island: houses, church, panteón, landing ---------------- */
  const visible = (x, z, m = .1) => { const e = 1.5, h0 = hI(x, z), n = [-(hI(x + e, z) - h0) / e, 1, -(hI(x, z + e) - h0) / e], v = [-x, EYE - h0, -z];
    return (n[0] * v[0] + n[1] * v[1] + n[2] * v[2]) / (Math.hypot(...n) * Math.hypot(...v)) > m; };
  const onGround = (x, z, wd, dp) => { const hs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => hI(x + a * wd / 2, z + b * dp / 2)); const top = Math.max(...hs);
    return { y: top, fy: Math.min(...hs) - top - .4 }; };
  const lots = [[0, IZ, 34]];
  // the church: white nave, a bell tower with a small dome, gable to the lake
  const CHX = 168, CHZ = 588;
  { const g = onGround(CHX, CHZ, 11, 24), yaw = Math.atan2(-CHX, CHZ) * 180 / Math.PI;
    w.house({ x: CHX, z: CHZ, ...g, yaw, w: 11, d: 24, h: 8, rh: 3.6, gable: true, wall: "#f4f0e6", roof: "#a4482c", trim: "#e8d8b8", rng: rl, clap: false, winTall: 1.4, winGap: 3.2, door: .5, doorC: "#5a3424", tag: "isl" });
    const a = yaw * Math.PI / 180, tx = CHX + (-7.5) * Math.cos(a) - (-10) * Math.sin(a), tz = CHZ + (-7.5) * Math.sin(a) + (-10) * Math.cos(a), ty = hI(tx, tz);
    w.box({ x: tx, z: tz, y: ty - 2, yaw, w: 4.6, d: 4.6, h: 15, c: "#f2eee4", top: "#e4dccc", dec: (fc, P) => { fc[0].dec = [{ P: [P([-.8, 12, -2.36]), P([.8, 12, -2.36]), P([.8, 14.2, -2.36]), P([-.8, 14.2, -2.36])], c: NIGHT ? LAMP : "#3a3036", glow: NIGHT }]; } });
    w.box({ x: tx, z: tz, y: ty + 13, yaw, w: 5.2, d: 5.2, h: .5, c: "#e8dcc0" });
    w.cyl({ x: tx, z: tz, y: ty + 13.5, r0: 2.1, r1: .5, h: 2.6, n: 12, c: "#e8d8b8" });
    w.line([[tx, ty + 16.1, tz], [tx, ty + 18, tz]], "#3a3036", .1, { min: .6 });
    w.line([[tx - .6, ty + 17.3, tz], [tx + .6, ty + 17.3, tz]], "#3a3036", .1, { min: .6 });
    lots.push([CHX, CHZ, 16], [tx, tz, 5]); }
  // the panteón below and left of the church: graves heaped with marigolds, arches, crosses, candles at night
  const graves = [], PX0 = 64, PX1 = 150, PZ0 = 548, PZ1 = 600;
  for (let i = 0; i < 1200 && graves.length < 150; i++) {
    const x = PX0 + rc() * (PX1 - PX0), z = PZ0 + rc() * (PZ1 - PZ0);
    if (hI(x, z) < 3 || graves.some(([a, b]) => Math.abs(x - a) < 2.1 && Math.abs(z - b) < 2.6)) continue;
    graves.push([x, z]); }
  lots.push([(PX0 + PX1) / 2, (PZ0 + PZ1) / 2, 40]);
  const MARI = ["#e8740e", "#f08a16", "#f6a424", "#ffbe3a"], MAG = "#b0205a";
  graves.forEach(([x, z], i) => { const sd = 3000 + i, arch = rc() < .35, cross = rc() < .55, nC = 2 + Math.floor(rc() * 5);
    w.sprite({ x, z, y: hI(x, z), tag: "isl", fn: (px, py, k, fog) => { const rr = rng(sd); let g = "";
      const C = c => NIGHT ? mix(c, "#2a1a20", .35) : T(mix(c, HZ, fog * .6));
      g += `<ellipse cx="${F(px)}" cy="${F(py - k * .2)}" rx="${F(k * 1.05)}" ry="${F(k * .42)}" fill="${C("#6a4a34")}"/>`;
      for (let j = 0; j < 7; j++) g += `<circle cx="${F(px + (rr() - .5) * k * 1.7)}" cy="${F(py - k * (.25 + rr() * .3))}" r="${F(Math.max(.5, k * (.22 + rr() * .12)))}" fill="${C(rr() < .15 ? MAG : MARI[Math.floor(rr() * 4)])}"/>`;
      if (arch) g += `<path d="M${F(px - k * .8)},${F(py - k * .3)} Q${F(px)},${F(py - k * 2.6)} ${F(px + k * .8)},${F(py - k * .3)}" stroke="${C(MARI[1])}" stroke-width="${F(Math.max(.6, k * .28))}" fill="none"/>`;
      if (cross) g += `<path d="M${F(px)},${F(py - k * .3)} L${F(px)},${F(py - k * 1.5)} M${F(px - k * .35)},${F(py - k * 1.15)} L${F(px + k * .35)},${F(py - k * 1.15)}" stroke="${C("#ece6da")}" stroke-width="${F(Math.max(.5, k * .14))}"/>`;
      if (NIGHT) for (let j = 0; j < nC; j++) { const cx = px + (rr() - .5) * k * 2, cy = py - k * (.35 + rr() * .2);
        g += `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(k * 1.1)}" fill="url(#jzGlow)" opacity=".55"/><circle cx="${F(cx)}" cy="${F(cy)}" r="${F(Math.max(.6, k * .12))}" fill="#fff2c0"/>`; }
      return g; } }); });
  // the panteón wall along its lower edge
  for (let x = PX0 - 2; x < PX1 + 2; x += 3) { const z = PZ0 - 3 + (x - PX0) * .05, y = hI(x, z);
    if (y > 1) w.box({ x, z, y: y - .4, w: 3.05, d: .5, h: 1.3, c: "#e8e0d0", top: "#d8ccb8", tag: "isl" }); }
  // the stone landing at the foot of the island, canoes tied alongside
  const LZ = 484;
  w.box({ x: -6, z: LZ, y: -.6, w: 46, d: 9, h: 1.7, c: "#9a9080", top: "#8a8272", wet: true, tag: "isl" });
  w.box({ x: 22, z: LZ - 8, y: -.6, w: 6, d: 16, h: 1.6, c: "#a09684", top: "#8e8676", wet: true, tag: "isl" });
  // houses: white walls, terracotta roofs, many with the red-ochre band, all over the front of the dome
  const WALLS = ["#f4efe4", "#f2ece0", "#ece4d2", "#f6f2ea", "#e8dcc4", "#dfe2dc", "#f0e2c4"];
  const ROOFS = ["#a8482a", "#b85a34", "#94402a", "#c0683e", "#9c4e34", "#b0603c", "#8a3e2a"];
  const BANDS = ["#9a3424", "#8a2e22", "#a84a2a", "#6a3a5a", "#2e5a6a"];
  for (let i = 0, n = 0; i < 6000 && n < 270; i++) {
    const x = (rh() * 2 - 1) * IRX, z = IZ - rh() * IRZ * 1.05, d = iD(x, z);
    if (d > .95 || d < .14) continue;
    const h0 = hI(x, z); if (h0 < 2.4) continue;
    if (!visible(x, z, .06)) continue;
    const wd = 6 + rh() * 5, dp = 5 + rh() * 3.5;
    if (lots.some(([a, b, R]) => Math.hypot(x - a, z - b) < R + Math.max(wd, dp) * .5 + 1.2)) continue;
    if (rh() > (d < .4 ? .8 : 1)) continue;
    const two = rh() < .38, band = rh() < .55, hip = rh() < .5, yaw = Math.atan2(-x, z) * 180 / Math.PI + (rh() - .5) * 36;
    const bandC = BANDS[Math.floor(rh() * BANDS.length)], doorF = .25 + rh() * .5;
    const g = onGround(x, z, wd + .6, dp + .6);
    // the wainscot band runs round the walls but stops either side of the front door
    const bandF = (nm, q, len) => { if (nm !== "front") return q(0, 0, len, 1.05, bandC, { off: .03 });
      const du = doorF * len; q(0, 0, Math.max(0, du - .66), 1.05, bandC, { off: .03 }); q(Math.min(len, du + .66), 0, len, 1.05, bandC, { off: .03 }); };
    w.house({ x, z, ...g, yaw, w: wd, d: dp, h: two ? 5.4 + rh() * .6 : 2.7 + rh() * .6, rh: hip ? 1.6 + rh() * .8 : 1.6 + rh() * 1.2, roof3: hip ? "hip" : "gable", gable: !hip && rh() < .3,
      wall: WALLS[Math.floor(rh() * WALLS.length)], roof: ROOFS[Math.floor(rh() * ROOFS.length)], trim: "#f6f0e2", stone: "#8a7c68", clap: false, shingle: false,
      door: doorF, doorC: rh() < .5 ? "#5a3424" : "#2e5a6a", winGap: 2.6 + rh() * 1.2, winTall: .8 + rh() * .3, rng: rl,
      extra: band ? bandF : undefined });
    lots.push([x, z, Math.max(wd, dp) * .55]); n++; }
  // trees between the houses: ash crowns, a few cypresses (more around the panteón)
  for (let i = 0, n = 0; i < 8000 && n < 120; i++) {
    const x = (rt() * 2 - 1) * IRX, z = IZ - rt() * IRZ * 1.05, d = iD(x, z);
    if (d > .97 || d < .12) continue;
    const h0 = hI(x, z); if (h0 < 1.5 || !visible(x, z, .04)) continue;
    if (lots.some(([a, b, R]) => Math.hypot(x - a, z - b) < R * .8 + 1.5)) continue;
    const nearP = Math.abs(x - 106) < 60 && Math.abs(z - 575) < 40, kind = rt() < (nearP ? .6 : .15) ? "cyp" : "broad", hM = kind === "cyp" ? 10 + rt() * 6 : 7 + rt() * 6;
    w.sprite({ x, z, y: h0 - .3, tag: "isl", fn: treeFn(hM, kind, 7000 + i) });
    lots.push([x, z, 3]); n++; }
  // the panteón cypresses on its edges and a lamp of vigil light over it at night
  [[58, 562, 13], [156, 570, 12], [60, 592, 11], [146, 602, 14]].forEach(([x, z, hM], i) => w.sprite({ x, z, y: hI(x, z) - .3, tag: "isl", fn: treeFn(hM, "cyp", 7700 + i) }));
  if (NIGHT) w.sprite({ x: 106, z: PZ0 - 6, y: hI(106, 575) + 3, bias: -30, tag: "isl", fn: (px, py, k) => `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(k * 70)}" ry="${F(k * 26)}" fill="url(#jzVigil)" style="mix-blend-mode:screen"/>` });

  /* Morelos on the summit: a 40 m stone figure on a drum pedestal, right fist raised */
  { const sz = IZ - 6, sy0 = hI(0, sz);
    w.sprite({ x: 0, z: sz, y: sy0 - .5, tag: "isl", fn: (sx, sy, k, fog) => {
      const P = (u, v) => [sx + u * k, sy - v * k], pl = pts => poly(pts.map(([u, v]) => P(u, v)));
      const C = c => NIGHT ? mix(mix(c, "#d0a070", .35), "#1a1020", .3) : T(mix(c, HZ, fog * .6));
      const BASE = C("#cdc4b0"), BASEL = C("#f0e8d6"), BASED = C("#8a8274"), ST = C("#b8ae9a"), STL = C("#e6dece"), STD = C("#746c60");
      let g = NIGHT ? `<ellipse cx="${F(sx)}" cy="${F(sy - 20 * k)}" rx="${F(17 * k)}" ry="${F(27 * k)}" fill="url(#jzFlood)"/>` : "";
      // pedestal: a wide drum on a step, then a narrower drum, slit windows
      g += `<path d="${pl([[-9, -1], [-9, 1.2], [9, 1.2], [9, -1]])}" fill="${BASED}"/>`;
      g += `<path d="${pl([[-7.6, 1.2], [-7.6, 5.4], [7.6, 5.4], [7.6, 1.2]])}" fill="${BASE}"/><path d="${pl([[2.8, 1.2], [2.8, 5.4], [7.6, 5.4], [7.6, 1.2]])}" fill="${BASEL}" opacity=".75"/><path d="${pl([[-7.6, 1.2], [-7.6, 5.4], [-5, 5.4], [-5, 1.2]])}" fill="${BASED}" opacity=".55"/>`;
      g += `<path d="${pl([[-8, 5.4], [-8, 6.1], [8, 6.1], [8, 5.4]])}" fill="${BASEL}"/>`;
      g += `<path d="${pl([[-5.8, 6.1], [-5.8, 9.4], [5.8, 9.4], [5.8, 6.1]])}" fill="${BASE}"/><path d="${pl([[2, 6.1], [2, 9.4], [5.8, 9.4], [5.8, 6.1]])}" fill="${BASEL}" opacity=".7"/><path d="${pl([[-5.8, 6.1], [-5.8, 9.4], [-3.8, 9.4], [-3.8, 6.1]])}" fill="${BASED}" opacity=".5"/>`;
      [-5.2, -2.6, 0, 2.6, 5.2].forEach(u => g += `<path d="${pl([[u - .35, 2.2], [u - .35, 4.3], [u + .35, 4.3], [u + .35, 2.2]])}" fill="${NIGHT ? "#ffc870" : C("#4a443c")}"/>`);
      // the cloaked figure
      const body = [[-5.2, 9.4], [-4.8, 16], [-4.2, 23], [-3.8, 28.6], [-2.8, 31], [2.9, 31], [3.9, 28.6], [4.4, 23], [5, 16], [5.6, 9.4]];
      g += `<path d="${pl(body)}" fill="${ST}"/>`;
      g += `<path d="${pl([[1.3, 9.4], [1.1, 18], [1.3, 27], [2.1, 31], [2.9, 31], [3.9, 28.6], [4.4, 23], [5, 16], [5.6, 9.4]])}" fill="${STL}" opacity=".8"/>`;
      g += `<path d="${pl([[-5.2, 9.4], [-4.8, 16], [-4.2, 23], [-3.8, 28.6], [-2.8, 31], [-2, 31], [-2.7, 22], [-3.3, 9.4]])}" fill="${STD}" opacity=".6"/>`;
      [[-2.2, -1.8], [-.7, -.5], [.6, .4], [2.4, 1.9], [3.8, 3.1]].forEach(([a, b]) => g += `<path d="M${P(a, 9.6).map(F).join(",")} Q${P(a + .4, 18).map(F).join(",")} ${P(b, 27.5).map(F).join(",")}" stroke="${STD}" stroke-width="${F(Math.max(.5, k * .3))}" fill="none" opacity=".5"/>`);
      g += `<path d="${pl([[-5.3, 9.4], [-5.2, 10.6], [5.6, 10.6], [5.7, 9.4]])}" fill="${STD}" opacity=".45"/>`;
      // the left arm folded across the chest, holding the cloak
      g += `<path d="M${P(3.4, 28.4).map(F).join(",")} Q${P(1.6, 24.6).map(F).join(",")} ${P(-1.6, 25.4).map(F).join(",")}" stroke="${STD}" stroke-width="${F(Math.max(.8, k * 1))}" fill="none" opacity=".75" stroke-linecap="round"/>`;
      // neck, head, the knotted bandana
      g += `<path d="${pl([[-1.1, 30.8], [-1, 32], [1, 32], [1.1, 30.8]])}" fill="${ST}"/>`;
      g += `<path d="${blobP(P(0, 33.6)[0], P(0, 33.6)[1], k * 2, k * 2.2, 9, rng(4))}" fill="${ST}"/>`;
      g += `<path d="${blobP(P(.8, 33.9)[0], P(.8, 33.9)[1], k * 1.1, k * 1.7, 7, rng(5))}" fill="${STL}" opacity=".75"/>`;
      g += `<path d="${pl([[-2.1, 34.4], [-.4, 35.9], [2.1, 35], [2, 34.2], [-1.8, 34.0]])}" fill="${STD}" opacity=".6"/><path d="${pl([[-2, 34.2], [-3.4, 33.4], [-3.1, 32.6], [-1.9, 33.4]])}" fill="${STD}" opacity=".7"/>`;
      // the raised right arm (on the left as we see it), forearm up, fist
      g += `<path d="${pl([[-2.8, 30.6], [-4.7, 33.2], [-5.6, 38.8], [-3.9, 39.1], [-3.3, 34.4], [-1.4, 31.4]])}" fill="${ST}"/>`;
      g += `<path d="${pl([[-4.1, 34], [-3.4, 34.4], [-3.9, 39.1], [-4.5, 39]])}" fill="${STL}" opacity=".6"/><path d="${pl([[-2.8, 30.6], [-4.7, 33.2], [-5.6, 38.8], [-5.1, 38.9], [-4.4, 33.4], [-2.4, 31]])}" fill="${STD}" opacity=".5"/>`;
      g += `<path d="${blobP(P(-4.75, 40.2)[0], P(-4.75, 40.2)[1], k * 1.35, k * 1.5, 8, rng(6))}" fill="${ST}"/><path d="${blobP(P(-4.3, 40.4)[0], P(-4.3, 40.4)[1], k * .7, k * 1.1, 6, rng(7))}" fill="${STL}" opacity=".7"/>`;
      return g; } });
    lots.push([0, sz, 20]); }

  /* ---------------- canoes ---------------- */
  // a dugout seen broadside: hull, load of marigolds and candles, optional arch and butterfly nets
  const canoe = o => (sx, sy, k, fog) => {
    const P = (u, v) => [sx + u * k, sy - v * k], pl = pts => poly(pts.map(([u, v]) => P(u, v))), rr = rng(o.sd);
    const C = c => T(mix(c, HZ, fog * .6)), hl = o.L / 2;
    const ln = (pts, c, wM, op = 1, minW = .5) => `<path d="M${pts.map(([u, v]) => P(u, v).map(F).join(",")).join(" L")}" stroke="${c}" stroke-width="${F(Math.max(minW, wM * k))}" fill="none" stroke-linecap="round"${op < 1 ? ` opacity="${op}"` : ""}/>`;
    let g = "";
    if (o.nets) {   // two round-framed nets on poles, splayed like a butterfly's wings
      [-1, 1].forEach(sg => {
        const cu = o.nu + sg * 1.75, cv = 3.1, rx = 1.75, ry = 2.25, a = sg * .3, ca = Math.cos(a), sa = Math.sin(a);
        const Q = (x, y) => [cu + x * ca - y * sa, cv + x * sa + y * ca];
        const ring = Array.from({ length: 28 }, (_, i) => { const t = i / 28 * Math.PI * 2; return Q(Math.cos(t) * rx, Math.sin(t) * ry); });
        g += `<path d="${pl(ring)}" fill="${NIGHT ? "#2a2e48" : C("#e8e4d6")}" opacity="${NIGHT ? .35 : .22}"/>`;
        for (let x = -rx + .3; x < rx; x += .3) { const yy = ry * Math.sqrt(1 - (x / rx) ** 2); g += ln([Q(x, -yy), Q(x, yy)], NIGHT ? "#4a4e6a" : C("#d8d2c0"), .025, .55, .35); }
        for (let y = -ry + .3; y < ry; y += .3) { const xx = rx * Math.sqrt(1 - (y / ry) ** 2); g += ln([Q(-xx, y), Q(xx, y)], NIGHT ? "#4a4e6a" : C("#d8d2c0"), .025, .55, .35); }
        g += ln([...ring, ring[0]], C("#3e3024"), .09);
        g += ln([[o.nu, .5], Q(0, -ry), Q(0, ry * .6)], C("#5a4630"), .08);
        // the bag of the net sagging at the bottom
        g += `<path d="${pl([Q(-rx * .7, -ry * .7), Q(0, -ry - .5), Q(rx * .7, -ry * .7)])}" fill="${C("#cfc8b4")}" opacity=".25"/>`; }); }
    const hull = [[-hl, .82], [-hl + .7, .52], [hl - .8, .52], [hl, .78], [hl - .35, .22], [hl - 1.4, -.05], [-hl + 1.4, -.05], [-hl + .3, .28]];
    g += `<path d="${pl(hull)}" fill="${C("#4a3222")}"/>`;
    g += `<path d="${pl([[-hl + .7, .52], [hl - .8, .52], [hl - .6, .4], [-hl + .6, .4]])}" fill="${C("#7a5a3c")}"/>`;
    g += ln([[-hl, .82], [-hl + .7, .54], [hl - .8, .54], [hl, .78]], C("#a07a52"), .07, .9);
    g += `<path d="${pl([[-hl + 1.4, .2], [hl - 1.4, .2], [hl - 1.4, -.05], [-hl + 1.4, -.05]])}" fill="${C("#2a1c14")}" opacity=".6"/>`;
    // the load: marigold bundles and a few magenta cockscombs, white candles
    // one flower head: a shaded disc, a lit cap toward the light, a dark eye (tiny canoes just get the disc)
    const MSH = ["#a8420a", "#c4560c", "#d86a10", "#e47e16"], MLT = ["#f6a428", "#ffbe40", "#ffd060", "#ffd878"];
    const head = (u, v, R, mag) => { const [x, y] = P(u, v), Rp = R * k, glowN = NIGHT && o.lit;
      const sh = mag ? "#7a1640" : MSH[Math.floor(rr() * 4)], lt = mag ? "#d8407a" : MLT[Math.floor(rr() * 4)];
      const Cf = c => glowN ? mix(c, "#2a1408", .3) : C(c);
      let q = `<circle cx="${F(x)}" cy="${F(y)}" r="${F(Math.max(.5, Rp))}" fill="${Cf(sh)}"/>`;
      if (Rp > 1.6) q += `<circle cx="${F(x + Rp * .25)}" cy="${F(y - Rp * .25)}" r="${F(Rp * .62)}" fill="${Cf(lt)}"/>`;
      if (Rp > 3) q += `<circle cx="${F(x + Rp * .1)}" cy="${F(y - Rp * .1)}" r="${F(Rp * .16)}" fill="${Cf("#6a2a08")}" opacity=".7"/>`;
      return q; };
    // the load: bundles of marigold heads with a few magenta cockscombs, leaves showing between
    const nb = Math.round(o.L * 1.1);
    for (let b = 0; b < nb; b++) { const bu = -hl + 1.3 + (b + rr() * .6) / nb * (o.L - 2.8), mag = rr() < .14;
      g += `<path d="${blobP(...P(bu, .62), .42 * k, .2 * k, 6, rr)}" fill="${C("#3a4a22")}"/>`;
      for (let j = 0; j < 9; j++) g += head(bu + (rr() - .5) * .7, .62 + rr() * .42, .07 + rr() * .05, mag && j % 2 === 0); }
    if (o.arch) { const au = -hl + 1.7;
      g += ln(Array.from({ length: 13 }, (_, i) => { const t = i / 12 * Math.PI; return [au + Math.cos(t) * .95, .55 + Math.sin(t) * 1.35]; }), C("#5a4630"), .05);
      for (let i = 0; i <= 44; i++) { const t = i / 44 * Math.PI, wob = (rr() - .5) * .12;
        g += head(au + Math.cos(t) * (.95 + wob), .55 + Math.sin(t) * (1.35 + wob), .08 + rr() * .04, rr() < .08); } }
    (o.candles || []).forEach(u => { g += ln([[u, .7], [u, 1.25]], NIGHT ? "#f4ead0" : C("#f4eee0"), .09);
      if (NIGHT && o.lit) { const [fx, fy] = P(u, 1.38); g += `<circle cx="${F(fx)}" cy="${F(fy)}" r="${F(k * 1.4)}" fill="url(#jzGlow)" opacity=".8"/><ellipse cx="${F(fx)}" cy="${F(fy)}" rx="${F(Math.max(.7, k * .06))}" ry="${F(Math.max(1, k * .12))}" fill="#fff4c8"/>`; } });
    if (o.paddle) g += ln([[hl - 1.2, .55], [hl - 3.4, 1.25]], C("#8a6a48"), .07) + `<path d="${pl([[hl - 3.4, 1.25], [hl - 4.1, 1.5], [hl - 4.0, 1.68], [hl - 3.3, 1.38]])}" fill="${C("#8a6a48")}"/>`;
    return g; };
  // the near canoe, its nets up, laden for the panteón
  w.sprite({ x: 12.5, z: 60, y: 0, tag: "near", fn: canoe({ sd: 51, L: 9, nets: true, nu: .6, arch: true, candles: [-2.1, -1.2, .1, 1.3, 2.4, 3.1], lit: true, paddle: true }) });
  // a second net canoe further off on the left
  w.sprite({ x: -34, z: 150, y: 0, tag: "near", fn: canoe({ sd: 52, L: 7.5, nets: true, nu: -.4, candles: [-1.4, .9], lit: true }) });
  // canoes tied at the island landing
  [[-24, LZ - 6.5, 6.5, 61], [-8, LZ - 6.5, 7, 62], [34, LZ - 12, 6, 63]].forEach(([x, z, L, sd]) => w.sprite({ x, z, y: 0, tag: "isl", fn: canoe({ sd, L, candles: [] }) }));
  // at night: candle-lit canoes crossing to the island
  const procession = [];
  if (NIGHT) {
    for (let i = 0; i < 80 && procession.length < 15; i++) {
      const x = -280 + rc() * 600, z = 90 + Math.pow(rc(), 1.5) * 360, sx = 1280 + FL * x / z;
      if (sx < 860 || sx > 2240 || (Math.abs(x - 12.5) < 30 && z < 120)) continue;
      if (procession.some(([a, b]) => Math.abs(x - a) < 14 && Math.abs(z - b) < 40)) continue;
      const L = 6 + rc() * 2.5, cand = Array.from({ length: 3 + Math.floor(rc() * 5) }, () => -L / 2 + 1.2 + rc() * (L - 2.4));
      procession.push([x, z]);
      w.sprite({ x, z, y: 0, tag: "near", fn: canoe({ sd: 80 + i, L, candles: cand, lit: true, arch: rc() < .4 }) }); } }
  // tule reeds near the camera, both lower corners
  const reeds = (sd, n) => (px, py, k, fog) => { const rr = rng(sd); let g = "";
    for (let i = 0; i < n; i++) { const bx = px + (rr() - .5) * k * 2.4, ht = k * (.55 + rr() * .8), lean = (rr() - .5) * k * .5, c = T(["#5a6a34", "#76804a", "#9a9258", "#b4a468", "#4a5a2c"][Math.floor(rr() * 5)]);
      g += `<path d="M${F(bx - k * .02)},${F(py)} Q${F(bx + lean * .3)},${F(py - ht * .6)} ${F(bx + lean)},${F(py - ht)} Q${F(bx + lean * .3 + k * .03)},${F(py - ht * .6)} ${F(bx + k * .03)},${F(py)}Z" fill="${c}"/>`; }
    return g; };
  [[-5.4, 10, 40], [-4.2, 8.6, 34], [-6.6, 12.5, 34], [6.6, 10.5, 34], [5.6, 9, 28], [7.6, 13, 28]].forEach(([x, z, n], i) => {
    const sx = 1280 + FL * x / z; if (sx > 380 && sx < 2200) return;
    w.sprite({ x, z, y: 0, tag: "near", fn: reeds(400 + i, n) }); });

  /* ---- water: reflections (the land flipped about its own waterline; near things mirrored), chop, petals, light paths ---- */
  // solids (houses, church, landing) carry no tag, so "isl" is everything that is neither far nor near
  const flip = (where, yw) => `<g transform="matrix(1,0,0,-1,0,${F(2 * yw)})">${w.draw({ where })}</g>`;
  let wtr = `<g clip-path="url(#jzCW)"><g opacity="${NIGHT ? .5 : .4}" filter="url(#jzRipple)">`;
  wtr += flip(o => o.tag === "far", WY + FL * EYE / 4600) + flip(o => o.tag !== "far" && o.tag !== "near", WY + FL * EYE / 560);
  wtr += w.draw({ mirror: true, where: o => o.tag === "near" });
  wtr += `</g></g>`;
  wtr += `<rect x="0" y="${WY}" width="${W}" height="14" fill="url(#jzHaze)" opacity=".5"/>`;
  for (let k = 0; k < 240; k++) { const y = WY + 6 + Math.pow(r(), .8) * (H - WY - 6), t = (y - WY) / (H - WY);
    wtr += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(26 + r() * 140 * (.4 + t))}" height="${F(1 + t * 1.6)}" rx="1" fill="${NIGHT ? (r() < .5 ? "#5a6898" : "#0a1030") : (r() < .55 ? "#e6eeec" : "#2a4446")}" opacity="${F(.08 + r() * .14)}"/>`; }
  // marigold petals and flower heads drifting on the water near the canoe
  for (let i = 0; i < 180; i++) { const z = 6 + Math.pow(rv(), .7) * 70, x = (rv() - .45) * z * 1.1, [px, py] = w.proj([x, 0, z]), k = FL / z;
    if (px < 0 || px > W || py > H) continue;
    const head = rv() < .2, R = (head ? .045 : .02) * k;
    wtr += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(Math.max(.8, R))}" ry="${F(Math.max(.5, R * EYE / z * 4))}" fill="${NIGHT ? mix(MARI[i % 4], "#1a1030", .55) : MARI[i % 4]}" opacity="${F(.6 + rv() * .4)}"/>`; }
  wtr += `<g filter="url(#jzRipple)">`;
  const streak = (x, y0, len, wd, c, o) => { let q = "";
    for (let y = y0; y < Math.min(H, y0 + len); y += 2.4 + (y - WY) * .02) { const t = (y - y0) / len, Lr = wd * (.4 + r() * .9);
      q += `<rect x="${F(x + (r() - .5) * wd * .6 - Lr / 2)}" y="${F(y)}" width="${F(Lr)}" height="${F(1.2 + (y - WY) / 200)}" rx="1" fill="${c}" opacity="${F(o * (1 - t * .8) * (.5 + r() * .5))}"/>`; }
    return q; };
  if (NIGHT) {
    // the panteón's glow, the statue, the lit windows and every candle canoe
    const [gx] = w.proj([106, 0, 575]);
    for (let k = 0; k < 9; k++) wtr += streak(gx - 120 + k * 30, WY + 7, 150 + r() * 80, 36, "#ffb050", .5);
    wtr += streak(w.proj([0, 0, IZ])[0], WY + 6, 120, 18, "#ffe0a8", .35);
    for (let k = 0; k < 40; k++) wtr += streak(1280 + (r() - .5) * 1300, WY + 6, 40 + r() * 70, 8, "#ffc870", .3);
    [[12.5, 60], [-34, 150], ...procession].forEach(([x, z]) => { const [px, py] = w.proj([x, 0, z]), k = FL / z;
      wtr += streak(px, py + 1, k * 4.5, k * 3.5, "#ffc860", .7); });
  } else {
    // the low sun's glitter off to the right
    for (let y = WY + 4; y < H; y += 3 + (y - WY) * .025) { const t = (y - WY) / (H - WY), n = 2 + Math.floor(t * 5);
      for (let k = 0; k < n; k++) { const x = W - r() * 760 * (1 - t * .3), Lr = 8 + r() * (24 + t * 60);
        wtr += `<rect x="${F(x)}" y="${F(y)}" width="${F(Lr)}" height="${F(1.2 + t * 1.6)}" rx="1" fill="#fff4d8" opacity="${F((.55 - (W - x) / 1520) * (1 - t * .5))}"/>`; } }
  }
  wtr += `</g>`;
  s = s.slice(0, reflAt) + wtr + s.slice(reflAt);
  s += w.draw();
  s += `<rect x="0" y="${WY - 24}" width="${W}" height="34" fill="url(#jzHaze)" opacity="${NIGHT ? .2 : .32}"/>`;

  /* light + paper */
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#jzLight)" style="mix-blend-mode:soft-light" opacity=".8"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".06"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#jzPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
