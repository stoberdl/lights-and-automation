/* Stone Viaduct Gorge: a curved sandstone railway viaduct strides across a
   wooded river valley in full October colour, seen from a meadow bluff 14 m up.
   It bows toward us, so the middle arches are biggest and both ends sweep back
   and shrink into the valley sides; a heritage steam train is crossing, the
   river winds out from under it toward us, mist lies on the valley floor, and
   a stone farmhouse and barn sit by the lane just beyond the arches. The valley
   recedes upstream between paler hills, seen through the arches.
   The land is one world3d() raster (reference/scene-helpers.js), shaded per
   pixel; the viaduct, train, farm and trees are placed in metres by the same
   camera, and the river mirrors them.
   opts.time === "night": a high moon ahead (backlight), stars, moonlit mist,
   lit carriages and firebox, farmhouse windows, a red signal lamp.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function stoneViaductGorgeArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 5183;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = NIGHT ? 1010 : -160, LY = NIGHT ? 108 : 70, WY = 440;
  const T = c => NIGHT ? mix(mix(c, "#6a7088", .45), "#0a1230", .58) : c;
  const HZ = NIGHT ? "#28345a" : "#d6dce0", RIM = NIGHT ? "#b8c8f0" : "#fff0c8", LAMP = "#ffc868", SHADE = NIGHT ? "#04060e" : "#2a2838";
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
    ? `<stop offset="0" stop-color="#050a1c"/><stop offset=".45" stop-color="#0e1a40"/><stop offset=".82" stop-color="#22305a"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#4a82c4"/><stop offset=".45" stop-color="#86b6de"/><stop offset=".8" stop-color="#c8dae2"/><stop offset="1" stop-color="#f0e4c8"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#c8d4ff" stop-opacity=".32"/><stop offset=".25" stop-color="#9aaae0" stop-opacity=".12"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d8" stop-opacity=".9"/><stop offset=".2" stop-color="#fff0c4" stop-opacity=".42"/><stop offset=".6" stop-color="#ffe4a8" stop-opacity=".1"/><stop offset="1" stop-color="#ffe4a8" stop-opacity="0"/>`;
  let s = `<defs id="svdefs">
    <linearGradient id="svSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="svLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 900 : 1300}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="svHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".65" stop-color="${HZ}" stop-opacity=".7"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="svWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#2a3a64"/><stop offset=".3" stop-color="#162244"/><stop offset="1" stop-color="#0a1028"/>`
      : `<stop offset="0" stop-color="#b8ccd4"/><stop offset=".25" stop-color="#7ea2ac"/><stop offset=".6" stop-color="#4e727a"/><stop offset="1" stop-color="#304c54"/>`}</linearGradient>
    <radialGradient id="svGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".32"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="svRed"><stop offset="0" stop-color="#ff5a3a" stop-opacity=".95"/><stop offset=".4" stop-color="#ff3a2a" stop-opacity=".3"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></radialGradient>
    <radialGradient id="svMist"><stop offset="0" stop-color="${NIGHT ? "#a8b4d8" : "#f6f4ee"}" stop-opacity="1"/><stop offset=".55" stop-color="${NIGHT ? "#8a96c0" : "#eef0ee"}" stop-opacity=".5"/><stop offset="1" stop-color="${NIGHT ? "#8a96c0" : "#eef0ee"}" stop-opacity="0"/></radialGradient>
    <radialGradient id="svMoon" cx=".42" cy=".4"><stop offset="0" stop-color="#fffef6"/><stop offset=".7" stop-color="#f2eedc"/><stop offset="1" stop-color="#d8d4c4"/></radialGradient>
    <clipPath id="svCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="svLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="svCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".017" numOctaves="3" seed="31" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="svRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".003 .07" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".9"/></filter>
    <filter id="svPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="svSoft"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="svFog" x="-30%" y="-80%" width="160%" height="260%"><feTurbulence type="fractalNoise" baseFrequency=".008 .03" numOctaves="3" seed="12" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="5"/></filter>
    <filter id="svPuff" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="15" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.6"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#svSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 560; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 400, big = rs() < .07;
      if (Math.hypot(x - LX, y - LY) < 150 && rs() < .85) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.2 + rs() * .6 * (1 - y / 440))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#svLight)"/>`;
    // a waxing gibbous moon with soft maria, high over the valley (clear of both text corners)
    s += `<circle cx="${LX}" cy="${LY}" r="44" fill="#fffbe8" opacity=".12" filter="url(#svSoft)"/>`;
    s += `<circle cx="${LX}" cy="${LY}" r="30" fill="url(#svMoon)"/>`;
    [[-9, -6, 8, .1], [6, 4, 10, .09], [-4, 10, 6, .08], [10, -9, 5, .07]].forEach(([dx, dy, R, o]) => s += `<ellipse cx="${LX + dx}" cy="${LY + dy}" rx="${R}" ry="${R * .8}" fill="#9a9a90" opacity="${o}"/>`);
    s += `<path d="M${LX + 22},${LY - 20} A30,30 0 0 1 ${LX + 22},${LY + 20} A40,40 0 0 0 ${LX + 22},${LY - 20}Z" fill="#20283c" opacity=".55"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#svLight)"/>`;
    s += `<g class="rays" opacity=".08" filter="url(#svSoft)">`;
    for (let k = 0; k < 6; k++) { const a = .04 + k * .09, L = 1900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .025) * L)},${F(LY + Math.sin(a - .025) * L)} L${F(LX + Math.cos(a + .025) * L)},${F(LY + Math.sin(a + .025) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a few high fair-weather heaps, thin in the text corners ---------------- */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#svCloudy)">`;
    const lobes = [];
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#162044"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#202c56"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .3)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .15)}" fill="#4a5a8c" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .1 * (.6 + rs() * .7), w * (.07 + rs() * .06)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#bccadc"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .7)}" fill="#ccd6e4"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .8)}" fill="#f6f6f2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .32)}" cy="${F(ly - R * .3)}" rx="${F(R * .56)}" ry="${F(R * .34)}" fill="#fffbec"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(640, 165, 300, "drift1") + cloud(1420, 70, 360, "drift2") + cloud(2150, 150, 420, "drift3") + cloud(980, 250, 180, "drift2") + cloud(2480, 230, 200, "drift1");
  if (!NIGHT) {   // a skein of geese heading south down the valley
    s += `<g class="birds" fill="none" stroke="#2c2a30" stroke-width="2" stroke-linecap="round" opacity=".7">`;
    [[1080, 172, 1], [1106, 182, .9], [1130, 191, .85], [1056, 184, .9], [1032, 195, .8], [1154, 201, .75], [1008, 205, .7]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 9 * k)},${F(y - 2 * k)} q${F(5 * k)},${F(-4 * k)} ${F(9 * k)},${F(2 * k)} q${F(4 * k)},${F(-4 * k)} ${F(9 * k)},${F(-2 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 14 m above the river on a meadow bluff, horizon on WY; metres, x right,
     y up, z away. The valley runs away from us; the viaduct crosses it at Z0. */
  const EYE = 14, FL = 2200, Z0 = 250;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.6, .55, .22] : [-.75, .42, -.35], tone: T, fog: HZ, fogK: .00016,
    shadow: SHADE, rim: RIM, shade: .5, hi: .25, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  /* the valley runs away from us and wanders: s = metres across it from its centre line,
     t = metres up it from the viaduct (negative = between us and the viaduct) */
  const VX = z => 45 * Math.sin(z / 650 - .4) - 45 * Math.sin(Z0 / 650 - .4);
  const sOf = (x, z) => x - VX(z), tOf = (x, z) => z - Z0;
  const at = (sv, tv) => [sv + VX(tv + Z0), tv + Z0];
  const riverS = t => 16 * Math.sin(t / 150) + 7 * Math.sin(t / 57 + 1), riverW = t => 12 + Math.max(0, -t) * .01;
  const roadS = t => -52 + 8 * Math.sin(t / 110 + .6);
  const halfW = t => 84 + Math.max(0, t) * .04 + Math.max(0, -t) * .3 + 12 * N1(t / 260, 3.1);
  /* the land never rises above yLim on screen: lowest in the text corners */
  const yLim = u => 292 - 62 * Math.exp(-(((u + .05) / .13) ** 2));
  const capH = (x, z) => EYE + (WY - yLim(x / z)) * z / FL * (.94 + .06 * N3(x / 160, z / 160));
  const MF = mountainField({ seed: 413, scale: 2300, oct: 5, peaks: [
    { x: -2600, z: 4800, h: 190, rx: 2200, rz: 1500 }, { x: 2900, z: 4200, h: 170, rx: 2000, rz: 1500 },
    { x: -400, z: 8200, h: 260, r: 2800 }, { x: 4600, z: 9000, h: 280, r: 3000 }, { x: -6200, z: 9500, h: 250, r: 2800 } ] });
  const hT = (x, z) => {
    const sv = sOf(x, z), tv = tOf(x, z);
    const e = Math.abs(sv - riverS(tv)) - riverW(tv);
    let h = 2.9 + .8 * N2(x / 45, z / 45);
    if (e < 0) h = -1; else if (e < 6) h = -.6 + (h + .6) * sm(e / 6);
    const e2 = Math.abs(sv) - halfW(tv);
    if (e2 > 0) h += 56 * sm(e2 / 110) + 5 * N2(x / 70, z / 70) * sm(e2 / 50) + 7 * N1(x / 300, z / 300) * sm(e2 / 120);
    if (z > 1700) { const far = MF(x, z) * sm((z - 1700) / 2200); if (far > h) h = far; }
    return h > 0 ? Math.min(h, capH(x, z)) : h; };
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;

  /* colour: the raster lights it; this picks the material. Floodplain fields
     run with the valley, the lane and the river gravel follow their curves, and
     the slopes are mixed hardwood in full October colour. */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const AUT = ["#a8321e", "#c8542a", "#de8a2c", "#e6b03a", "#cfc048", "#8a3424", "#7a7a30", "#b86a2a", "#d49a36"].map(H3);
  const GRN = ["#2e4a2c", "#3e5a30", "#4e6a34"].map(H3);
  const FIELD = ["#8aa048", "#c4b46a", "#9a8458", "#6e9040", "#a8a058", "#b8a070"].map(H3);
  const GRAV = H3("#a49a88"), LANE = H3("#c8bea8"), MUD = H3("#6e6454");
  /* canopy: smooth multi-scale colour patches (no hard cells, which stretched into
     streaks at grazing angles), with fine crown-sized texture on top */
  const woods = (x, z) => { const k = N1(x / 30, z / 30) * .5 + .5, tx = N2(x / 3.2, z / 3.2) * .3 + N3(x / 1.4, z / 1.4) * .2 + .5;
    const a = (N3(x / 16, z / 16) * .6 + N1(x / 7, z / 7) * .4) * .5 + .5, ai = a * (AUT.length - 1), i0 = Math.floor(ai);
    let c = L3(GRN[0], GRN[2], k);
    const ac = L3(AUT[i0], AUT[Math.min(AUT.length - 1, i0 + 1)], ai - i0);
    c = L3(c, ac, sm((N2(x / 22 + 5, z / 22) * .5 + .5) * 1.6 - .1) * .88);
    return c.map(v => v * (.74 + .46 * tx)); };
  const col = (x, y, z, n) => {
    const steep = 1 - n[1], sv = sOf(x, z), tv = tOf(x, z), det = sm((1300 - z) / 800);
    if (y < .9) return L3(MUD, GRAV, .5 + .5 * N3(x / 2, z / 2));                               // river gravel and mud
    if (z > 2000) { const fk = N2(x / 600, z / 500); if (fk > .3 && steep < .2) return L3(FIELD[Math.floor(hash(Math.floor(x / 280), Math.floor(z / 240)) * 4)], GRN[1], .3);
      return woods(x, z); }
    const e2 = Math.abs(sv) - halfW(tv);
    if (e2 > 6 + 6 * N3(x / 30, z / 30) || steep > .3 || y > 6.5) return woods(x, z).map(v => v * (.58 + .42 * sm((z - 500) / 900)));   // shade between near crowns
    if (Math.abs(sv - roadS(tv)) < 2.6 && Math.abs(x) + z > 60) return L3(LANE, MUD, .2 * N2(x, z));
    // fields: cells across and along the valley, with darker hedge margins
    const fs = (sv + 9 * N1(tv / 80, 1)) / 62, ft = (tv + 12 * N1(sv / 80, 2)) / 85, fi = hash(Math.floor(fs), Math.floor(ft));
    let c = FIELD[Math.floor(fi * FIELD.length)];
    const edge = Math.min(fs - Math.floor(fs), Math.ceil(fs) - fs, ft - Math.floor(ft), Math.ceil(ft) - ft);
    c = c.map(v => v * (.9 + .16 * N2(x / 6, z / 6)));
    if (fi < .35) { const row = Math.sin(tv * Math.PI * 2 / 2.4); c = c.map(v => v * (1 + det * row * .05)); }
    if (edge < .035) c = L3(c, GRN[1], .6);
    return c; };
  w.raster({ z0: 22, z1: 16000, step: .0011, minStep: .25, scale: .75, top: 60, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00016, amb: NIGHT ? .55 : .42 });

  /* ---------- 2D drawings placed as sprites ---------- */
  const MAPLE = ["#4a1408", "#6a1e0c", "#8a2a12", "#a83a18", "#c45222", "#d8702e", "#e89444", "#f4bc6c"];
  const GOLDR = ["#4a3a14", "#6a5418", "#8a7020", "#a88a28", "#c4a234", "#d8b84a", "#e8d070", "#f6e8a4"];
  const OAK = ["#26341a", "#344620", "#465a26", "#5a6e2c", "#748636", "#8e9c44", "#aab45a", "#c8cc7c"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const RAMPS = [MAPLE, GOLDR, OAK, RUST, MAPLE, RUST];
  const lxW = -1;                           // crowns are lit from the left (sun by day, moon by night)
  const broadleaf = (x, y, hp, RAMP, fog, n) => {     // trunk, limbs and a crown of many lit leaf clumps
    const sd = lxW, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .035), ty = y - hp * .4;
    g += `<ellipse cx="${F(x - sd * hp * .1)}" cy="${F(y + 1)}" rx="${F(hp * .28)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .55)},${F(ty)} L${F(x + tb * .55)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5a4a3a")}"/>`;
    g += `<path d="M${F(x - sd * tb * .1)},${F(y)} L${F(x - sd * tb * .1)},${F(ty)} L${F(x - sd * tb * .55)},${F(ty)} L${F(x - sd * tb)},${F(y)}Z" fill="${Tf("#3a2e24")}"/>`;
    for (let k = 0; k < 4; k++) { const a = -1.2 + k * .8 + (r() - .5) * .3; g += `<path d="M${F(x)},${F(ty + hp * .05)} L${F(x + Math.sin(a) * hp * .22)},${F(ty - Math.cos(a) * hp * .2)}" stroke="${Tf("#4a3c30")}" stroke-width="${F(Math.max(.8, tb * .5))}"/>`; }
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
    return g + `<g filter="url(#svLeafy)">${cg}</g>`; };
  /* a small far tree: a dark irregular mass with shaded, mid and lit clumps */
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1e1a08", sz < 9 ? .22 : .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .1), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    const m = Math.max(2, Math.min(26, Math.round(sz / 2.2)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) * lxW + (y - sz * .5 - py) * .8, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .12 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };

  const seen = (x, z) => { const y0 = sy(hT(x, z), z) - 1.5;
    for (let q = 30; q < z * .985; q += Math.max(.5, q * .012)) { const xq = x * q / z, hq = hT(xq, q); if (hq < 0) continue; if (sy(hq, q) < y0) return false; }
    return true; };
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);

  /* ---------- the viaduct: piers, arch rings, spandrels, intrados, parapets ----------
     It curves on radius RC round (CX, ZC), bowing toward us, so the middle arches are
     nearest and both ends sweep back into the valley sides. Each span is a straight
     chord in its own frame: local x along the deck, front face (toward us) at z = -DW/2. */
  const DECK = 34, DW = 8.4, PITCH = 19, PW = 2.2, RAD = (PITCH - 2 * PW) / 2, CROWN = DECK - 2.4, SPRING = CROWN - RAD;
  const RC = 180, CX = 20, ZC = Z0 + RC, DPH = 2 * Math.asin(PITCH / 2 / RC), deg = 180 / Math.PI;
  const arcP = (ph, off = 0) => [CX + (RC - off) * Math.sin(ph), ZC - (RC - off) * Math.cos(ph)];   // off < 0: out toward us
  const STONE = NIGHT ? "#b4a690" : "#c8b696", STONE2 = NIGHT ? "#a09280" : "#ae9a7c", RING = NIGHT ? "#c8b8a0" : "#dac9a8", COURSE = "#6e5e4a";
  const gP = ph => Math.max(hT(...arcP(ph, DW / 2)), hT(...arcP(ph, -DW / 2)), hT(...arcP(ph)));
  const gMin = ph => Math.min(hT(...arcP(ph, DW / 2)), hT(...arcP(ph, -DW / 2)), hT(...arcP(ph)));
  // piers every PITCH along the curve, out to where the valley side comes up to the deck
  const piers = [DPH / 2]; for (const sg of [-1, 1]) for (let k = sg < 0 ? 0 : 1; k < 40; k++) { const ph = DPH / 2 + sg * (k + (sg < 0 ? 1 : 0)) * DPH; if (Math.abs(ph) > 1.25 || gP(ph) > DECK - 5) break; piers.push(ph); }
  piers.sort((a, b) => a - b);
  const frameAt = (ph, off = 0) => { const p = arcP(ph, off); return w.frame({ x: p[0], z: p[1], yaw: ph * deg }); };
  const ARC = 14, arcPts = (uL, uR, zl, rr = RAD) => { const m = (uL + uR) / 2, out = [];
    for (let i = 0; i <= ARC; i++) { const a = Math.PI * i / ARC; out.push([m + Math.cos(a) * rr, SPRING + Math.sin(a) * rr, zl]); } return out; };  // right to left
  const zF = -DW / 2, zB = DW / 2;
  const coursesOn = (VP, u0, u1, y0, y1, zl) => { const out = [];
    for (let y = Math.ceil(y0 / 1.1) * 1.1; y < y1; y += 1.1) out.push({ P: [VP([u0, y, zl - .03]), VP([u1, y, zl - .03])], c: COURSE, ln: .06, min: .35, op: .35 });
    return out; };
  const parapets = (ph, L) => { const yw = ph * deg;
    [zF + .35, zB - .35].forEach(zl => { const p = frameAt(ph).P([0, 0, zl]);
      w.box({ x: p[0], z: p[2], y: DECK, yaw: yw, w: L + .4, d: .7, h: 1.2, c: RING, dec: (fc, Pf) => {
        fc[0].dec = []; for (let u = -L / 2 + 1.2; u < L / 2; u += 2.6) fc[0].dec.push({ P: [Pf([u, 0, -.38]), Pf([u, 1.2, -.38])], c: COURSE, ln: .05, min: .3, op: .3 }); } }); });
    const p = frameAt(ph).P([0, 0, zF - .15]); w.box({ x: p[0], z: p[2], y: DECK - .6, yaw: yw, w: L + .3, d: .5, h: .55, c: RING }); };
  // a solid stretch of wall (approach spans, abutments), with a blind arch so the rhythm carries on
  const wallSeg = (ph, L, g) => { const p = frameAt(ph).P([0, 0, 0]), hh = DECK - g;
    w.box({ x: p[0], z: p[2], y: g, yaw: ph * deg, w: L, d: DW, h: hh, c: STONE, dec: (fc, Pf) => {
      fc[0].dec = []; for (let y = 1.1; y < hh; y += 1.1) fc[0].dec.push({ P: [Pf([-L / 2, y, -DW / 2 - .03]), Pf([L / 2, y, -DW / 2 - .03])], c: COURSE, ln: .06, min: .35, op: .35 });
      if (SPRING - g > 2 && L > PITCH * .8) { const ring = []; for (let i = 0; i <= ARC; i++) { const a = Math.PI * i / ARC; ring.push(Pf([Math.cos(a) * RAD * .8, SPRING - g + Math.sin(a) * RAD * .8, -DW / 2 - .05])); }
        ring.push(Pf([-RAD * .8, Math.max(0, SPRING - g - 6), -DW / 2 - .05]), Pf([RAD * .8, Math.max(0, SPRING - g - 6), -DW / 2 - .05]));
        fc[0].dec.push({ P: ring, c: STONE2 }); } } });
    parapets(ph, L); };
  // spans: an arch between consecutive piers, or solid wall where the ground is already up near the springing
  for (let i = 0; i < piers.length - 1; i++) { const a = piers[i], b = piers[i + 1], m = (a + b) / 2, g = Math.max(gP(a), gP(b), gP(m));
    if (g > SPRING - 1.5) { wallSeg(m, PITCH + .2, Math.min(gMin(a), gMin(b)) - 2); continue; }
    const VP = frameAt(m, RC * (1 - Math.cos(DPH / 2))).P, uL = -PITCH / 2, uR = PITCH / 2, SC = mix(STONE, STONE2, rl() * .45);
    // spandrel polygon: deck edge left->right, down the right pier line, arch back right->left, up the left pier line
    const spF = [[uL, DECK, zF], [uR, DECK, zF], [uR, SPRING, zF], ...arcPts(uL + PW, uR - PW, zF), [uL, SPRING, zF]];
    const ringF = arcPts(uL + PW, uR - PW, zF - .05, RAD + 1.1).concat(arcPts(uL + PW, uR - PW, zF - .05).reverse());
    const vous = []; for (let k = 1; k < 18; k++) { const an = Math.PI * k / 18;
      vous.push({ P: [VP([Math.cos(an) * RAD, SPRING + Math.sin(an) * RAD, zF - .07]), VP([Math.cos(an) * (RAD + 1.1), SPRING + Math.sin(an) * (RAD + 1.1), zF - .07])], c: COURSE, ln: .07, min: .4, op: .5 }); }
    const faces = [{ P: spF.map(VP), c: SC, dec: [{ P: ringF.map(VP), c: RING }, ...vous, ...coursesOn(VP, uL, uR, CROWN + 1.2, DECK, zF)] }];
    faces.push({ P: [[uL, DECK, zB], [uR, DECK, zB], [uR, SPRING, zB], ...arcPts(uL + PW, uR - PW, zB), [uL, SPRING, zB]].map(VP), c: SC });
    const A = arcPts(uL + PW, uR - PW, zF), B = arcPts(uL + PW, uR - PW, zB);
    for (let k = 0; k < ARC; k++) faces.push({ P: [A[k], A[k + 1], B[k + 1], B[k]].map(VP), c: STONE2, two: true, back: mix(STONE2, "#000000", .35), sh: .65 });
    w.add(faces, { center: VP([0, CROWN + 6, 0]) });
    parapets(m, PITCH); }
  // piers: stone columns on a plinth, a pilaster up the spandrel, a cutwater where they stand in the river
  piers.forEach(ph => { const g = gMin(ph) - 1.2;
    if (g > SPRING - 3) return;                                   // the approach wall already covers it
    const p = arcP(ph), hh = SPRING - g, yw = ph * deg;
    w.box({ x: p[0], z: p[1], y: g, yaw: yw, w: PW * 2 + .5, d: DW + .5, h: Math.min(hh, 3), c: STONE2 });
    w.box({ x: p[0], z: p[1], y: g + 2.9, yaw: yw, w: PW * 2, d: DW, h: hh - 2.9 + .05, c: STONE, dec: (fc, Pf) => {
      [0, 1, 3].forEach(fi => { const side = fi === 0; fc[fi].dec = [];
        for (let y = 1.1; y < hh - 2.9; y += 1.1) fc[fi].dec.push({ P: side ? [Pf([-PW, y, -DW / 2 - .03]), Pf([PW, y, -DW / 2 - .03])] : [Pf([(fi === 1 ? 1 : -1) * (PW + .03), y, -DW / 2]), Pf([(fi === 1 ? 1 : -1) * (PW + .03), y, DW / 2])], c: COURSE, ln: .06, min: .35, op: .35 }); });
      fc[0].dec.push({ P: [Pf([-PW - .1, hh - 3.3, -DW / 2 - .06]), Pf([PW + .1, hh - 3.3, -DW / 2 - .06]), Pf([PW + .1, hh - 2.95, -DW / 2 - .06]), Pf([-PW - .1, hh - 2.95, -DW / 2 - .06])], c: RING }); } });
    w.box({ x: p[0], z: p[1], y: SPRING - .4, yaw: yw, w: 1.1, d: DW + .3, h: DECK - .6 - SPRING + .4, c: STONE2 });
    if (hT(...arcP(ph, -DW / 2 - 1)) < 0) { const q = arcP(ph, -DW / 2 - .3); w.cyl({ x: q[0], z: q[1], y: -1.5, r0: PW * .95, r1: PW * .55, h: 4.4, n: 4, rot: ph + Math.PI / 4, c: STONE2, wet: true }); } });
  // the abutments, dug into the valley sides at both ends
  [[piers[0], -1], [piers[piers.length - 1], 1]].forEach(([ph, sg]) => { const pm = ph + sg * 7 / RC;
    wallSeg(pm, 14, Math.min(gMin(ph), gMin(pm)) - 3); });
  const PHMAX = piers[piers.length - 1];

  /* ---------- the train: a steam engine and three maroon coaches heading left round the curve ---------- */
  const PHF = -21 / deg, phS = sA => PHF + sA / RC;
  const TRp = (sA, zl = 0) => { const p = arcP(phS(sA), zl); return [p[0], 0, p[1]]; };
  const car = (s0, s1, o) => { const sc = (s0 + s1) / 2, p = TRp(sc), L = s1 - s0;
    return w.box({ x: p[0], z: p[2], y: DECK + .6, yaw: phS(sc) * deg, w: L, ...o }); };
  [[19.3, 37.3], [38.1, 56.1], [56.9, 74.9]].forEach(([s0, s1]) => { const L = s1 - s0;
    car(s0, s1, { d: 2.9, h: 3.4, c: "#6e2222", top: "#3a3a3e", dec: (fc, Pf) => {
      fc[0].dec = [{ P: [Pf([-L / 2, 2.0, -1.5]), Pf([L / 2, 2.0, -1.5]), Pf([L / 2, 2.9, -1.5]), Pf([-L / 2, 2.9, -1.5])], c: "#e6d4aa" }];
      for (let x = -L / 2 + 1.2; x < L / 2 - 1; x += 1.7) { const lt = NIGHT && rl() < .9;
        fc[0].dec.push({ P: [Pf([x, 2.05, -1.52]), Pf([x + 1.1, 2.05, -1.52]), Pf([x + 1.1, 2.85, -1.52]), Pf([x, 2.85, -1.52])], c: lt ? LAMP : "#3a4656", glow: lt }); } } }); });
  car(12.1, 18.5, { d: 2.8, h: 2.7, c: "#1e2024", top: "#2a2a2e" });                                                   // tender
  car(8.5, 11.5, { d: 3, h: 3.9, c: "#22252a", top: "#3a3a40", dec: (fc, Pf) => {                                      // cab
    fc[0].dec = [{ P: [Pf([-.8, 2.5, -1.52]), Pf([.9, 2.5, -1.52]), Pf([.9, 3.4, -1.52]), Pf([-.8, 3.4, -1.52])], c: NIGHT ? "#ff9a40" : "#4a5260", glow: NIGHT }]; } });
  { // boiler: an octagonal barrel along the track, smokebox door at the front
    const faces = [], n = 8, R = 1.05, yc = DECK + 2.55, s0 = .8, s1 = 8.5;
    const ringAt = sA => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, pp = TRp(sA, Math.cos(a) * R); return [pp[0], yc + Math.sin(a) * R, pp[2]]; });
    const A = ringAt(s0), B = ringAt(s1);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push({ P: [A[i], A[j], B[j], B[i]], c: "#202328" }); }
    faces.push({ P: A, c: "#2a2d33" });
    const pc = TRp((s0 + s1) / 2); w.add(faces, { center: [pc[0], yc, pc[2]] });
    [2.4, 6.2].forEach(sA => { const r1 = ringAt(sA); w.line([r1[6], r1[0], r1[2]], "#b08a3a", .12); });
    const ch = TRp(1.7); w.cyl({ x: ch[0], z: ch[2], y: yc + R - .2, r0: .36, r1: .44, h: 1.25, n: 10, c: "#1a1c20" });
    const dm = TRp(4.6); w.cyl({ x: dm[0], z: dm[2], y: yc + R - .25, r0: .5, r1: .38, h: .7, n: 10, c: "#b08a3a" });
    car(.1, .6, { d: 3, h: 1, c: "#7a1e1a" });
    if (NIGHT) { const hl = TRp(0); w.sprite({ x: hl[0], z: hl[2] - .5, y: yc, bias: -2, fn: (px, py, kk) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(5, kk * 1.6))}" fill="url(#svGlow)"/>` });
      const fb = TRp(10, -1.6); w.sprite({ x: fb[0], z: fb[2], y: DECK + 1.6, bias: -2, fn: (px, py, kk) => `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(kk * 2.6)}" ry="${F(kk * 1.6)}" fill="url(#svGlow)" opacity=".7"/>` }); }
    // the smoke plume trails back over the coaches and lifts in the breeze
    w.sprite({ x: ch[0], z: ch[2] - 1, y: yc + R + 1.1, bias: -3, fn: (px, py, kk) => { let g = `<g filter="url(#svPuff)">`;
      for (let i = 0; i < 26; i++) { const t = i / 25, R2 = kk * (.7 + t * 3.2), x = px + t * kk * 44 + Math.sin(t * 7) * kk * .8, y = py - kk * (1 + t * 9 + Math.sin(t * 3) * 1.5);
        const c0 = NIGHT ? mix("#8a96b8", "#4a5478", t) : mix("#f4f2ee", "#d8dce4", t), c1 = NIGHT ? "#2e3654" : mix("#a8a8b0", "#c4c8d0", t);
        g += `<ellipse cx="${F(x + R2 * .15)}" cy="${F(y + R2 * .2)}" rx="${F(R2)}" ry="${F(R2 * .75)}" fill="${c1}" opacity="${F(.6 * (1 - t * .7))}"/>`;
        g += `<ellipse cx="${F(x + R2 * .15 * lxW)}" cy="${F(y - R2 * .12)}" rx="${F(R2 * .8)}" ry="${F(R2 * .6)}" fill="${c0}" opacity="${F(.8 * (1 - t * .75))}"/>`; }
      return g + `</g>`; } }); }

  /* ---------- a stone farmhouse and its barn by the lane just beyond the arches, a signal post ---------- */
  const onGround = o => { const { P } = w.frame({ ...o, y: 0 }), c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => P([a * o.w / 2, 0, b * o.d / 2]));
    const hs = c.map(p => hT(p[0], p[2])), top = Math.max(...hs), low = Math.min(...hs); return { ...o, y: top, fy: low - top - .3 }; };
  { const [fx0, fz0] = at(roadS(150) - 15, 150), yaw = -Math.atan(fx0 / fz0) * deg + 8;
    w.house(onGround({ x: fx0, z: fz0, yaw, w: 11, d: 7, h: 5.8, rh: 3.6, wall: "#cbbc9e", roof: "#3c3a40", trim: "#e8e0cc", door: .4, clap: false, chim: .85, shut: "#3a4a3a", winGap: 2.6, stone: "#8a7e6c", rng: rl }));
    const [bx, bz] = at(roadS(178) - 17, 178);
    w.house(onGround({ x: bx, z: bz, yaw: yaw - 6, w: 10, d: 7, h: 4.6, rh: 3.6, roof3: "gambrel", wall: "#8a3a2a", roof: "#4a3e3a", trim: "#e8e0cc", door: .5, winGap: 4, rng: rl }));
    used.push([fx0, fz0, 12], [bx, bz, 10]);
    if (NIGHT) w.sprite({ x: fx0, z: fz0 - 6, y: hT(fx0, fz0) + 2, bias: -1, noRefl: true, fn: (px, py, kk) => `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(kk * 9)}" ry="${F(kk * 4)}" fill="url(#svGlow)" opacity=".35"/>` }); }
  { const [qx, qz] = arcP(PHMAX + 16 / RC, -DW / 2 - 1.5), g0 = Math.min(DECK, hT(qx, qz));
    w.box({ x: qx, z: qz, y: g0, w: .25, d: .25, h: DECK - g0 + 3.6, c: "#3a3a3e" });
    w.box({ x: qx - .5, z: qz, y: DECK + 2.6, w: 1.2, d: .2, h: .35, c: "#c8302a" });
    if (NIGHT) w.sprite({ x: qx, z: qz - .4, y: DECK + 3.4, bias: -1, fn: (px, py, kk) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(5, kk * 1.8))}" fill="url(#svRed)"/>` }); }
  /* ---------- trees: the hardwood on both valley sides, hedgerows, river sycamores ---------- */
  // dense and small, so they read as a crowded canopy rather than dots on a backdrop
  for (let k = 0, n = 0; k < 90000 && n < 9500; k++) { const z = 160 + Math.pow(r(), 1.3) * 1900, u = (r() - .5) * 1.3, x = u * z;
    const sv = sOf(x, z), tv = tOf(x, z), e2 = Math.abs(sv) - halfW(tv); if (e2 < 4) continue;
    if (!free(x, z, 1) || !seen(x, z)) continue; n++;
    const hM = 11 + r() * 8, RAMP = RAMPS[Math.floor(r() * RAMPS.length)], y0 = hT(x, z);
    const pxS = sx(x, z), topS = sy(y0, z) - Math.min(70, hM * FL / z * .5);   // keep crowns out of the text corners
    if (topS < 268 && (pxS < 900 || pxS > 1500)) continue;
    // each crown takes the canopy colour under it, nudged a little, so the slope reads as one wood
    const bc = woods(x, z).map(v => Math.max(0, Math.min(255, Math.round(v * (.9 + r() * .25))))), base = "#" + bc.map(v => v.toString(16).padStart(2, "0")).join("");
    const OWN = [mix(base, "#140c04", .55), mix(base, "#140c04", .4), mix(base, "#140c04", .25), mix(base, "#140c04", .12), base, mix(base, "#fff0c0", .18), mix(base, "#fff0c0", .32), mix(base, "#fff0c0", .45)];
    w.sprite({ x, z, y: y0 - .3, fn: (px, py, kk, fog) => clump(px, py, Math.min(70, Math.max(2, hM * kk * .5)), fog * .9, r() < .12 ? RAMP : OWN) }); }
  // hedgerows along the field edges and the lane, and trees on the river banks
  for (let k = 0, n = 0; k < 9000 && n < 340; k++) { const tv = -260 + r() * 900, edge = r();
    let sv; if (edge < .35) sv = roadS(tv) + (r() < .5 ? -4 : 4);
    else if (edge < .75) sv = riverS(tv) + (riverW(tv) + 4 + r() * 5) * (r() < .5 ? -1 : 1);
    else sv = Math.round((r() - .5) * 4) * 62 - 9 * N1(tv / 80, 1);
    const [x, z] = at(sv, tv); if (z < 215 || Math.abs(sv) > halfW(tv) + 2 || hT(x, z) < .5) continue;
    if (!free(x, z, 2.5) || sx(x, z) < -60 || sx(x, z) > W + 60) continue;
    // keep the arch rhythm readable: no tall trees just in front of the viaduct's middle
    const tooClose = tv > -140 && tv < 5 && sx(x, z) > 650 && sx(x, z) < 2050; if (tooClose && r() < .85) continue;
    used.push([x, z, 2.5]); n++;
    const hM = (edge < .75 ? 9 : 7) + r() * 8, RAMP = RAMPS[Math.floor(r() * RAMPS.length)], y0 = hT(x, z);
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => hM * kk > 34 ? broadleaf(px, py, hM * kk, RAMP, fog, Math.min(130, Math.round(hM * kk))) : clump(px, py, hM * kk * .7, fog, RAMP) }); }
  // a few big trees near us, kept to the outer thirds so the viaduct stays clear
  [[-74, 132, MAPLE, 17], [-88, 168, GOLDR, 14], [70, 128, RUST, 18], [96, 170, MAPLE, 15], [-112, 205, OAK, 14]].forEach(([x, z, RAMP, hM]) => {
    if (hT(x, z) < .5) return; used.push([x, z, 4]);
    w.sprite({ x, z, y: hT(x, z), fn: (px, py, kk, fog) => broadleaf(px, py, hM * kk, RAMP, fog, 160) }); });
  // gravel bars and rocks in the river
  for (let k = 0; k < 40; k++) { const tv = -250 + r() * 700, side = r() < .5 ? -1 : 1, sv = riverS(tv) + side * (riverW(tv) - 1 - r() * 3), [x, z] = at(sv, tv);
    if (z < 90) continue; const rr2 = .5 + r() * 1.1;
    w.sprite({ x, z, y: -.1, fn: (px, py, kk, fog) => { const R = rr2 * kk, c = T(mix("#8a8478", HZ, fog));
      return `<path d="${blobP(px, py - R * .3, R, R * .55, 7)}" fill="${c}"/><path d="${blobP(px - lxW * -R * .2, py - R * .5, R * .55, R * .3, 6)}" fill="${T(mix("#b4ac9c", HZ, fog))}"/>`; } }); }

  /* ---------- mist lying on the valley floor, thickest along the river and under the arches ---------- */
  for (let k = 0; k < 90; k++) { const tv = -110 + Math.pow(r(), .8) * 1500, sv = riverS(tv) + (r() - .5) * 140, [x, z] = at(sv, tv);
    if (z < 240) continue; const wm = 90 + r() * 160, hm = 4 + r() * 5, op = (NIGHT ? .3 : .36) * (.5 + r() * .5);
    w.sprite({ x, z, y: 1.5, bias: -1, noRefl: true, fn: (px, py, kk) => `<ellipse cx="${F(px)}" cy="${F(py - hm * kk * .3)}" rx="${F(wm * kk * .5)}" ry="${F(hm * kk * .5)}" fill="url(#svMist)" opacity="${F(op)}" filter="url(#svFog)"/>` }); }

  /* ---------------- assemble: water, the mirrored world, the land, then everything on it ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#svWater)"/>`;
  if (NIGHT) s += `<g opacity=".5" filter="url(#svSoft)"><rect x="${LX - 30}" y="${WY}" width="60" height="${H - WY}" fill="#c8d0f0"/></g>`;
  s += `<g clip-path="url(#svCW)"><g opacity="${NIGHT ? .7 : .55}" filter="url(#svRipple)">${w.draw({ mirror: true })}</g></g>`;
  s += `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="url(#svWater)" opacity=".25"/>`;
  for (let k = 0; k < 110; k++) { const y = WY + 40 + Math.pow(r(), .8) * (H - WY - 40), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(20 + r() * 90 * (.4 + t))}" height="${F(1 + t * 1.2)}" rx="1" fill="${NIGHT ? "#7a8ac0" : "#f0f6f4"}" opacity="${F(.05 + r() * .1)}"/>`; }
  s += w.draw({ where: isR });
  s += `<rect x="0" y="300" width="${W}" height="140" fill="url(#svHaze)" opacity=".35"/>`;
  s += w.draw({ where: notR });

  s += `<rect width="${W}" height="${H}" fill="url(#svLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#svPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
