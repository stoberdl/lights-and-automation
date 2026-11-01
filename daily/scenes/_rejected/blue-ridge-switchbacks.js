/* Blue Ridge Switchbacks: from a stone overlook high on one side of an
   Appalachian valley we look across to a hardwood hillside in full October
   colour, where a mountain road climbs in tight switchbacks to a fire lookout
   tower on the crest. Ridge after ridge fades into blue haze behind it; a
   white church, a few farms and a creek sit on the valley floor below.
   Late-afternoon sun from the right, low and golden.
   The land is one world3d() raster (reference/scene-helpers.js): the road legs
   are cut into the slope as benches, so they are shaded by the same light and
   recede with the hill. Houses, church, tower, cars and trees are placed in
   metres by the same camera.
   opts.time === "night": a thin crescent moon, stars, ridges in deep blue,
   headlights and tail lights on the switchbacks, lit windows, a red beacon.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), mountainColor(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function blueRidgeSwitchbacksArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 7291;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = NIGHT ? 1130 : 2640, LY = NIGHT ? 104 : 250, WY = 400;
  const T = c => NIGHT ? mix(mix(c, "#6a7090", .45), "#0a1232", .6) : c;
  const HZ = NIGHT ? "#253258" : "#b9c6dc", RIM = NIGHT ? "#b8c8f0" : "#fff0c4", LAMP = "#ffc868", SHADE = NIGHT ? "#04060e" : "#2c2a44";
  const cl = v => Math.max(0, Math.min(.999, v));
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
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
    ? `<stop offset="0" stop-color="#040918"/><stop offset=".5" stop-color="#0c173a"/><stop offset=".85" stop-color="#1e2c56"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#4f7fbe"/><stop offset=".45" stop-color="#8db2d8"/><stop offset=".8" stop-color="#d4d6dc"/><stop offset="1" stop-color="#f2dcb8"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#c8d4ff" stop-opacity=".22"/><stop offset=".3" stop-color="#9aaae0" stop-opacity=".08"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2cc" stop-opacity=".95"/><stop offset=".22" stop-color="#ffe0a0" stop-opacity=".45"/><stop offset=".6" stop-color="#ffd890" stop-opacity=".12"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/>`;
  let s = `<defs id="brdefs">
    <linearGradient id="brSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="brLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 800 : 1500}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="brHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".75"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="brGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".95"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".32"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="brHead"><stop offset="0" stop-color="#fffbe8" stop-opacity="1"/><stop offset=".3" stop-color="#fff0c0" stop-opacity=".4"/><stop offset="1" stop-color="#fff0c0" stop-opacity="0"/></radialGradient>
    <radialGradient id="brRed"><stop offset="0" stop-color="#ff5a3a" stop-opacity=".95"/><stop offset=".4" stop-color="#ff3a2a" stop-opacity=".3"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></radialGradient>
    <radialGradient id="brMoon" cx=".42" cy=".4"><stop offset="0" stop-color="#fffef6"/><stop offset=".7" stop-color="#f2eedc"/><stop offset="1" stop-color="#d8d4c4"/></radialGradient>
    <filter id="brLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="brCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="3" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="brPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="brSoft"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="brPuff" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="15" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.4"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#brSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 620; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 380, big = rs() < .07;
      if (Math.hypot(x - LX, y - LY) < 110 && rs() < .85) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.2 + rs() * .6 * (1 - y / 420))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#brLight)"/>`;
    // a thin crescent lit from the lower right, earthshine on the rest
    s += `<circle cx="${LX}" cy="${LY}" r="40" fill="#fffbe8" opacity=".1" filter="url(#brSoft)"/>`;
    s += `<circle cx="${LX}" cy="${LY}" r="22" fill="#2a3456" opacity=".85"/>`;
    s += `<path d="M${LX - 6},${LY - 21.2} A22,22 0 1 1 ${LX - 16},${LY + 15} A20,22 0 0 0 ${LX - 6},${LY - 21.2}Z" fill="url(#brMoon)"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#brLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#brSoft)">`;
    for (let k = 0; k < 6; k++) { const a = Math.PI + .1 + k * .07, L = 1700;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a few flat-based fair-weather heaps, gold underneath ---------------- */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#brCloudy)">`;
    const lobes = [];
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#142042"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#1e2a52"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .3)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .15)}" fill="#46568a" opacity=".6"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .1 * (.6 + rs() * .7), w * (.07 + rs() * .06)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#c8b8b4"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .7)}" fill="#d8cccc"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .8)}" fill="#f8f2ea"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .32)}" cy="${F(ly - R * .3)}" rx="${F(R * .56)}" ry="${F(R * .34)}" fill="#fff6e0"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(520, 130, 340, "drift1") + cloud(1300, 80, 300, "drift2") + cloud(1980, 120, 420, "drift3") + cloud(880, 225, 170, "drift2") + cloud(2420, 210, 230, "drift1");
  if (!NIGHT) {   // two hawks circling on the updraft over the switchbacks
    s += `<g class="birds" fill="none" stroke="#2c2830" stroke-width="2.2" stroke-linecap="round" opacity=".75">`;
    [[1180, 185, 1.2], [1250, 160, 1]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 13 * k)},${F(y + 1 * k)} q${F(6 * k)},${F(-5 * k)} ${F(13 * k)},${F(-1 * k)} q${F(7 * k)},${F(-4 * k)} ${F(13 * k)},${F(1 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 50 m above the valley floor at a stone overlook; horizon on WY. Metres,
     x right, y up, z away. The valley floor (y about 0) runs across the view;
     the switchback hill faces us at z 1000-1400; ridges stack up behind it. */
  const EYE = 50, FL = 2000;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.15, .6, .5] : [.8, .45, -.25], tone: T, fog: HZ, fogK: .00016,
    shadow: SHADE, rim: RIM, shade: .5, hi: .25, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;

  /* the switchback hill: a ramp up from the valley floor, highest in the middle */
  /* the mountainside: a long flank across the view, low on the left and climbing to the
     right into the ridges behind, with spurs and hollows */
  const HM = 170, ZA = 985, ZD = 420;
  const prof = x => .15 + .85 * Math.exp(-(((x - 80) / (x < 80 ? 650 : 360)) ** 2));   // broad, steeper on the right
  const zOff = x => 45 * N1(x / 260, .5) + 25 * N2(x / 90, 4.2);
  const NR = noise2(seed + 21);
  const spurs = (x, z) => { const n = 1 - Math.abs(NR(x / 75, z / 110)); return 22 * n * n - 9; };   // ridges and hollows down the face
  const hill = (x, z) => HM * prof(x) * sm((z - ZA - zOff(x)) / ZD);
  const hillG = (x, z) => { const t = (z - ZA - zOff(x)) / ZD; return t <= 0 || t >= 1 ? .01 : HM * prof(x) * 6 * t * (1 - t) / ZD; };
  /* the road: K legs, each climbing D metres across the face from one hairpin to the next,
     zig-zagging either side of XC */
  const K = 5, LA = 6, D = 18, XR = 120, XC = 80;
  const level = (k, x) => LA + k * D + (k % 2 ? (XR - (x - XC)) / (2 * XR) : (x - XC + XR) / (2 * XR)) * D;
  const RW = 4;
  const road = (x, z) => {             // -> { k, d (metres off the centre line), L } or null
    if (z < 900 || z > 1550) return null;
    const hb = hill(x, z), g = Math.max(.05, hillG(x, z)), u = x - XC, lim = u => Math.abs(u) <= XR + 2;
    let best = null;
    for (let k = 0; k < K; k++) {
      const okX = lim(u) || (k === 0 && u < 0 && u > -XR - 420) || (k === K - 1 && u > 0 && u < XR + 200 && (K - 1) % 2 === 0) || (k === K - 1 && u < 0 && u > -XR - 200 && (K - 1) % 2 === 1);
      if (!okX) continue;
      const L = level(k, x), d = Math.abs(hb - L) / g;
      if (d < 12 && (!best || d < best.d)) best = { k, d, L }; }
    return best; };
  const MF = mountainField({ seed: 829, scale: 2600, oct: 6, warp: .5, peaks: [
    { x: -2400, z: 3600, h: 330, rx: 2600, rz: 700 }, { x: 2600, z: 3300, h: 300, rx: 2400, rz: 650 },
    { x: 300, z: 6200, h: 560, rx: 4200, rz: 900 }, { x: -5200, z: 7600, h: 600, rx: 3500, rz: 1000 }, { x: 5600, z: 8200, h: 640, rx: 3800, rz: 1000 },
    { x: -1500, z: 12500, h: 900, rx: 6000, rz: 1500 }, { x: 7000, z: 14000, h: 950, rx: 5000, rz: 1500 } ] });
  const yLim = u => 268 - 70 * Math.exp(-(((u - .02) / .2) ** 2));
  const capH = (x, z) => EYE + (WY - yLim(x / z)) * z / FL * (.95 + .05 * N3(x / 200, z / 200));
  const creekZ = x => 720 + 70 * Math.sin(x / 260 + .7) + 25 * Math.sin(x / 97);
  const hT = (x, z) => {
    let h = 1.2 + 1.4 * N2(x / 160, z / 160) + .4 * N3(x / 30, z / 30);
    const ce = Math.abs(z - creekZ(x)) - 5; if (ce < 0) h = -1; else if (ce < 8) h = -.4 + (h + .4) * sm(ce / 8);
    const t0 = (z - ZA - zOff(x)) / ZD;
    let hb = hill(x, z) + 4 * N1(x / 60, z / 60) * sm((z - ZA) / 120) + spurs(x, z) * sm(t0 * 4) * prof(x);
    const rd = road(x, z);
    if (rd) { const b = 1 - sm((rd.d - RW - .8) / 4.5); hb += (rd.L - hill(x, z)) * b; }
    h = Math.max(h, hb);
    if (z > 1500) { const far = MF(x, z) * sm((z - 1500) / 2400); if (far > h) h = far; }
    return h > 0 ? Math.min(h, capH(x, z)) : h; };

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const AUT = ["#9a2a1c", "#c04a26", "#d8782a", "#e2a034", "#d6bc46", "#a8a03c", "#7a6a2c", "#b85a24", "#cc8a30"].map(H3);
  const GRN = ["#2a4228", "#3a5230", "#4c6634"].map(H3);
  const FIELD = ["#9aa850", "#c8b46a", "#a88e5a", "#7a9844", "#b4a85c"].map(H3);
  const ASPH = H3("#8e8a82"), LINE = H3("#e8dca0"), STONEW = H3("#9a9284"), MUD = H3("#6a6250");
  const woods = (x, z) => { const k = N1(x / 30, z / 30) * .5 + .5, tx = N2(x / 3.2, z / 3.2) * .3 + N3(x / 1.4, z / 1.4) * .2 + .5;
    const a = (N3(x / 16, z / 16) * .6 + N1(x / 7, z / 7) * .4) * .5 + .5, ai = a * (AUT.length - 1), i0 = Math.floor(ai);
    let c = L3(GRN[0], GRN[2], k);
    c = L3(c, L3(AUT[i0], AUT[Math.min(AUT.length - 1, i0 + 1)], ai - i0), sm((N2(x / 22 + 5, z / 22) * .5 + .5) * 1.7 - .1) * .9);
    return c.map(v => v * (.74 + .46 * tx)); };
  const ridgeCol = mountainColor({ seed: 31, tree: 2000, goldK: .4, forest: "#34483c", gold: "#b88a40", rock: "#8a8070", rock2: "#5e5850" });
  const col = (x, y, z, n, ao) => {
    if (z > 1700) return ridgeCol(x, y, z, n, ao);
    if (y < .3) return L3(MUD, STONEW, .4 + .4 * N3(x / 3, z / 3));                               // creek banks
    const rd = road(x, z);
    if (rd && rd.d < RW) return rd.d < .12 && (Math.floor((x + 400) / 5) % 2) ? LINE : ASPH.map(v => v * (.92 + .1 * N2(x / 4, z / 4)));
    if (rd && rd.d < RW + 3 && y < rd.L) return L3(STONEW, MUD, .3 + .3 * N3(x / 2, z / 2));     // the cut and fill below each leg
    if (y > 8 || z > 1400) return woods(x, z).map(v => v * (.6 + .4 * sm((z - 1300) / 900)));  // shade between crowns
    // the valley floor: small fields with hedge margins
    const fs = (x + 14 * N1(z / 90, 1)) / 70, ft = (z + 10 * N1(x / 90, 2)) / 46, fi = hash(Math.floor(fs), Math.floor(ft));
    let c = fi < .28 ? woods(x, z) : FIELD[Math.floor(fi * FIELD.length)];
    const edge = Math.min(fs - Math.floor(fs), Math.ceil(fs) - fs, ft - Math.floor(ft), Math.ceil(ft) - ft);
    c = c.map(v => v * (.9 + .16 * N2(x / 6, z / 6)));
    if (edge < .025) c = L3(c, GRN[1], .45);
    return c; };
  w.raster({ z0: 6, z1: 26000, step: .0012, minStep: .3, scale: .75, top: 120, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00016, amb: NIGHT ? .55 : .4 });

  /* ---------- 2D drawings placed as sprites ---------- */
  const MAPLE = ["#4a1408", "#6a1e0c", "#8a2a12", "#a83a18", "#c45222", "#d8702e", "#e89444", "#f4bc6c"];
  const GOLDR = ["#4a3a14", "#6a5418", "#8a7020", "#a88a28", "#c4a234", "#d8b84a", "#e8d070", "#f6e8a4"];
  const SUMAC = ["#3a0a0a", "#5a1010", "#7a1614", "#9a1e18", "#b42a1e", "#cc3e24", "#e0603a", "#f08a5a"];
  const lxW = NIGHT ? -.3 : 1;             // crowns lit from the right by day
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1a1408", sz < 9 ? .22 : .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    const m = Math.max(2, Math.min(26, Math.round(sz / 2.2)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) * lxW + (y - sz * .5 - py) * .8, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .12 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };
  const broadleaf = (x, y, hp, RAMP, fog, n) => {
    const sd = lxW >= 0 ? 1 : -1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .035), ty = y - hp * .4;
    g += `<ellipse cx="${F(x - sd * hp * .1)}" cy="${F(y + 1)}" rx="${F(hp * .28)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .55)},${F(ty)} L${F(x + tb * .55)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5a4a3a")}"/>`;
    g += `<path d="M${F(x - sd * tb * .1)},${F(y)} L${F(x - sd * tb * .1)},${F(ty)} L${F(x - sd * tb * .55)},${F(ty)} L${F(x - sd * tb)},${F(y)}Z" fill="${Tf("#3a2e24")}"/>`;
    const cx = x, cy = y - hp * .64, rx = hp * .36, ry = hp * .3, ux = sd * .8, uy = -.6, cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.028 + r() * .028)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx - sd * a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#brLeafy)">${cg}</g>`; };

  const seen = (x, z) => { const y0 = sy(hT(x, z), z) - 1.5;
    for (let q = 40; q < z * .985; q += Math.max(.6, q * .012)) { const xq = x * q / z, hq = hT(xq, q); if (hq < 0) continue; if (sy(hq, q) < y0) return false; }
    return true; };
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);
  const onGround = o => { const { P } = w.frame({ ...o, y: 0 }), c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => P([a * o.w / 2, 0, b * o.d / 2]));
    const hs = c.map(p => hT(p[0], p[2])), top = Math.max(...hs), low = Math.min(...hs); return { ...o, y: top, fy: low - top - .3 }; };
  /* where leg k crosses x: solve hill(x, z) = level(k, x) along z */
  const legZ = (k, x) => { const L = level(k, x); let a = ZA - 60, b = ZA + ZD + 80;
    for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (hill(x, m) < L) a = m; else b = m; } return (a + b) / 2; };

  /* ---------- the fire lookout on the crest: steel legs, braces, a glazed cab ---------- */
  { const tx = 40, tz = ZA + zOff(40) + ZD * .97, g = hT(tx, tz) - .4, TH = 18, B0 = 3.2, B1 = 1.6, STEEL = "#4a4c52";
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) w.line([[tx + a * B0, g, tz + b * B0], [tx + a * B1, g + TH, tz + b * B1]], STEEL, .22);
    for (let lv = 0; lv < 4; lv++) { const y0 = g + lv * TH / 4, y1 = y0 + TH / 4, k0 = B0 + (B1 - B0) * lv / 4, k1 = B0 + (B1 - B0) * (lv + 1) / 4;
      w.line([[tx - k0, y0, tz - k0], [tx + k1, y1, tz - k1]], STEEL, .1); w.line([[tx + k0, y0, tz - k0], [tx - k1, y1, tz - k1]], STEEL, .1);
      w.line([[tx - k1, y1, tz - k1], [tx + k1, y1, tz - k1]], STEEL, .1); }
    w.box({ x: tx, z: tz, y: g + TH, w: 4.2, d: 4.2, h: .9, c: "#7a6a58", dec: fc => { fc[0].dec = []; } });
    w.box({ x: tx, z: tz, y: g + TH + .9, w: 4, d: 4, h: 2.1, c: "#8a7a64", dec: (fc, Pf) => {
      fc[0].dec = [{ P: [Pf([-1.8, .3, -2.03]), Pf([1.8, .3, -2.03]), Pf([1.8, 1.8, -2.03]), Pf([-1.8, 1.8, -2.03])], c: NIGHT ? LAMP : "#aec4d4", glow: NIGHT }];
      fc[1].dec = [{ P: [Pf([2.03, .3, -1.8]), Pf([2.03, .3, 1.8]), Pf([2.03, 1.8, 1.8]), Pf([2.03, 1.8, -1.8])], c: NIGHT ? LAMP : "#c8d8e2", glow: NIGHT }]; } });
    w.cyl({ x: tx, z: tz, y: g + TH + 3, r0: 3.3, r1: 0, h: 1.6, n: 4, rot: Math.PI / 4, c: "#6a3a2e" });
    used.push([tx, tz, 7]);
    if (NIGHT) w.sprite({ x: tx, z: tz - .5, y: g + TH + 5, bias: -3, fn: (px, py, kk) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(5, kk * 2.4))}" fill="url(#brRed)"/>` }); }

  /* ---------- cars on the switchbacks (lights at night) ---------- */
  const CARS = ["#b8302a", "#e8e4dc", "#2e4a6a", "#3a3c40", "#c89a2a"];
  [[0, -50, 1], [1, 60, -1], [2, -90, -1], [4, 20, 1]].forEach(([k, u, dir], i) => {
    const x = XC + u, z = legZ(k, x), y = level(k, x);
    const yaw = dir > 0 ? 0 : 180, c = CARS[i % CARS.length];
    w.box({ x, z, y: y + .35, yaw, w: 4.4, d: 1.8, h: .75, c });
    w.box({ x: x - dir * .3, z, y: y + 1.1, yaw, w: 2.4, d: 1.6, h: .55, c: mix(c, "#202028", .25), dec: (fc, Pf) => { fc[0].dec = [{ P: [Pf([-1.1, .08, -.82]), Pf([1.1, .08, -.82]), Pf([1.1, .48, -.82]), Pf([-1.1, .48, -.82])], c: "#5a6a7a" }]; } });
    if (NIGHT) { const hx = x + dir * 2.3, tx2 = x - dir * 2.3;
      w.sprite({ x: hx, z: z - 1, y: y + .8, bias: -2, fn: (px, py, kk) => `<ellipse cx="${F(px + dir * kk * 4)}" cy="${F(py)}" rx="${F(Math.max(6, kk * 7))}" ry="${F(Math.max(3, kk * 2.2))}" fill="url(#brHead)" opacity=".85"/>` });
      w.sprite({ x: tx2, z: z - 1, y: y + .8, bias: -2, fn: (px, py, kk) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(2.5, kk * 1.2))}" fill="url(#brRed)"/>` }); }
    used.push([x, z, 4]); });

  /* ---------- the valley floor: a white church, farms, a lane, hedgerow trees ---------- */
  { const cx0 = -330, cz0 = 975, g = hT(cx0, cz0), yaw = -Math.atan2(cx0, cz0) * 180 / Math.PI;
    w.house(onGround({ x: cx0, z: cz0, yaw, w: 8, d: 14, h: 5.6, rh: 4.4, gable: true, wall: "#f2eee4", roof: "#3a3c44", trim: "#f6f2ea", door: .5, winGap: 2.8, winTall: 1.3, clap: true, rng: rl }));
    const { P } = w.frame({ x: cx0, z: cz0, yaw }), bt = P([0, 0, -6.2]), gy = g;
    w.box({ x: bt[0], z: bt[2], y: gy, yaw, w: 3.2, d: 3.2, h: 12, c: "#f2eee4", dec: (fc, Pf) => { fc[0].dec = [{ P: [Pf([-.6, 8.4, -1.62]), Pf([.6, 8.4, -1.62]), Pf([.6, 10.4, -1.62]), Pf([-.6, 10.4, -1.62])], c: NIGHT ? LAMP : "#3a3c44", glow: NIGHT }]; } });
    w.cyl({ x: bt[0], z: bt[2], y: gy + 12, r0: 1.9, r1: 0, h: 8.5, n: 8, rot: Math.PI / 8 + yaw * Math.PI / 180, c: "#3a3c44" });
    used.push([cx0, cz0, 14]); }
  [[-560, 905, "farm"], [-470, 940, "village"], [240, 930, "farm"], [420, 960, "village"], [-160, 880, "village"], [610, 905, "farm"], [-700, 960, "cottage"]].forEach(([x, z, kind]) => {
    if (!free(x, z, 10)) return;
    const yaw = -Math.atan2(x, z) * 180 / Math.PI + (rl() - .5) * 24;
    w.house(onGround(w.randomHouse(rl, { x, z, yaw, kind, rng: rl, fy: 0 })));
    used.push([x, z, 12]);
    if (kind === "farm" && rl() < .8) { const bx = x + 26, bz = z + 14;
      w.house(onGround({ x: bx, z: bz, yaw: yaw + 8, w: 12, d: 8, h: 4.4, rh: 4, roof3: "gambrel", wall: rl() < .5 ? "#8a3a2a" : "#7a7468", roof: "#4a4040", trim: "#e8e0cc", door: .5, winGap: 4, rng: rl })); used.push([bx, bz, 10]); } });
  // trees: hardwood crowns over the hill and its flanks, dense and in their own canopy colours
  for (let k = 0, n = 0; k < 120000 && n < 11000; k++) { const z = 880 + Math.pow(r(), 1.2) * 900, x = (r() - .5) * 1.45 * z;
    const hb = hT(x, z); if (hb < 7 && z < 1400) continue;
    const rd = road(x, z); if (rd && (rd.d < RW + 4 || (rd.d < RW + 15 && hb < rd.L))) continue;   // keep the legs open from below
    if (!free(x, z, 1.5) || !seen(x, z)) continue;
    const hM = 12 + r() * 8, pxS = sx(x, z), topS = sy(hb, z) - Math.min(30, hM * FL / z * .4);
    if (topS < 262 && (pxS < 900 || pxS > 1500)) continue;
    n++;
    const bc = woods(x, z).map(v => Math.max(0, Math.min(255, Math.round(v * (.9 + r() * .25))))), base = "#" + bc.map(v => v.toString(16).padStart(2, "0")).join("");
    const OWN = [mix(base, "#140c04", .55), mix(base, "#140c04", .4), mix(base, "#140c04", .25), mix(base, "#140c04", .12), base, mix(base, "#fff0c0", .18), mix(base, "#fff0c0", .32), mix(base, "#fff0c0", .45)];
    w.sprite({ x, z, y: hb - .4, fn: (px, py, kk, fog) => clump(px, py, Math.min(30, Math.max(2, hM * kk * .4)), fog * .9, r() < .03 ? [MAPLE, GOLDR][Math.floor(r() * 2)] : OWN) }); }
  // hedgerow and creek-side trees on the valley floor
  for (let k = 0, n = 0; k < 6000 && n < 110; k++) { const x = (r() - .5) * 1800, edge = r();
    const z = edge < .45 ? creekZ(x) + (r() < .5 ? -1 : 1) * (8 + r() * 6) : 560 + r() * 420;
    if (edge >= .45 && Math.abs(((x + 14 * N1(z / 90, 1)) / 70) % 1) > .08 && Math.abs(((z + 10 * N1(x / 90, 2)) / 46) % 1) > .1) continue;
    if (hT(x, z) < .4 || hT(x, z) > 6 || !free(x, z, 4) || sx(x, z) < -60 || sx(x, z) > W + 60) continue;
    used.push([x, z, 3]); n++;
    const hM = 9 + r() * 8, RAMP = [MAPLE, GOLDR, SUMAC, GOLDR][Math.floor(r() * 4)];
    w.sprite({ x, z, y: hT(x, z), fn: (px, py, kk, fog) => clump(px, py, Math.max(3, hM * kk * .32), fog, RAMP) }); }

  /* ---------- the overlook: a dry-stone wall along the bottom, sumac and a maple at its ends ---------- */
  { const ZW = 6.5, yW = EYE - 1.6;      // we stand on the overlook (ground 1.6 m below the eye); the wall top is at 0.8 m
    w.box({ x: 0, z: ZW + .45, y: yW - 3.2, w: 30, d: .9, h: 3.8, c: "#9a9284", top: "#b4ac9c", dec: (fc, Pf) => { fc[0].dec = [];
      for (let y = .4; y < 3.8; y += .3) for (let u = -15 + (y * 7 % 1.2); u < 15; u += .4 + rl() * .5)
        fc[0].dec.push({ P: [Pf([u, y, -.47]), Pf([u, y + .27, -.47])], c: "#5e584e", ln: .02, min: .5, op: .55 });
      for (let y = .4; y < 3.8; y += .3) fc[0].dec.push({ P: [Pf([-15, y, -.47]), Pf([15, y, -.47])], c: "#5e584e", ln: .03, min: .6, op: .5 }); } });
    [[-4.9, ZW + 2, SUMAC, 2.9], [-3.6, ZW + 2.6, GOLDR, 2.5], [5.1, ZW + 2.2, SUMAC, 3]].forEach(([x, z, RAMP, hM]) =>
      w.sprite({ x, z, y: yW - 1.5, noRefl: true, fn: (px, py, kk, fog) => broadleaf(px, py, hM * kk, RAMP, 0, 140) })); }

  /* ---------------- assemble ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  s += w.draw({ where: isR });
  s += `<rect x="0" y="${WY - 120}" width="${W}" height="150" fill="url(#brHaze)" opacity=".4"/>`;
  s += w.draw({ where: notR });
  if (!NIGHT) s += `<g class="smoke" filter="url(#brPuff)" opacity=".5">${[0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${F(sx(-560, 905) + 4 + i * 5)}" cy="${F(sy(hT(-560, 905) + 10, 905) - i * 9)}" rx="${3 + i * 1.6}" ry="${2.4 + i}" fill="#eae6e2" opacity="${F(.6 - i * .08)}"/>`).join("")}</g>`;
  s += `<rect width="${W}" height="${H}" fill="url(#brLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#brPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
