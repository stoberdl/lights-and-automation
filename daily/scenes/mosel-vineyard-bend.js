/* Mosel Vineyard Bend: harvest time on a German wine river. Seen from the low
   bank, the river loops round a steep spur: a slate-roofed village with a tall
   church spire sits on the flat inside of the bend, terraced vineyards in
   yellow, gold and rust climb the slate slope behind it to a castle ruin and
   the wooded plateau, and the river's two arms run away left and right
   between paler hills. A passenger boat waits at the landing.
   The land is one world3d() raster (reference/scene-helpers.js), shaded per
   pixel, with the vine rows, terrace walls and plots coloured by the real
   slope; the village, church, castle, boats and trees are placed in metres by
   the same eye-level camera, and the river mirrors all of it.
   opts.time === "night": no moon (it is a thin morning crescent this week),
   stars, floodlit church and castle, lit windows and quay lamps.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function moselVineyardBendArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 2741;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -140, LY = 90, WY = 420;
  const T = c => NIGHT ? mix(mix(c, "#7a7a8a", .4), "#0b1232", .6) : c;
  const HZ = NIGHT ? "#2a365c" : "#d4d8d4", RIM = NIGHT ? "#a8b8e8" : "#fff0c8", LAMP = "#ffc868", SHADE = NIGHT ? "#04060e" : "#2a2838";
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
    ? `<stop offset="0" stop-color="#040818"/><stop offset=".5" stop-color="#0c1638"/><stop offset=".85" stop-color="#1e2c52"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#3a74bc"/><stop offset=".42" stop-color="#78aedc"/><stop offset=".78" stop-color="#c4d8e2"/><stop offset="1" stop-color="#ece2c8"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#8090c0" stop-opacity=".12"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d8" stop-opacity=".9"/><stop offset=".2" stop-color="#fff0c4" stop-opacity=".42"/><stop offset=".6" stop-color="#ffe4a8" stop-opacity=".1"/><stop offset="1" stop-color="#ffe4a8" stop-opacity="0"/>`;
  let s = `<defs id="mvdefs">
    <linearGradient id="mvSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="mvLight" cx="${LX}" cy="${LY}" r="1300" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="mvHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".65" stop-color="${HZ}" stop-opacity=".7"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="mvWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#26345c"/><stop offset=".25" stop-color="#141e40"/><stop offset="1" stop-color="#080c22"/>`
      : `<stop offset="0" stop-color="#b4c8cc"/><stop offset=".2" stop-color="#7a9ea4"/><stop offset=".6" stop-color="#4a7078"/><stop offset="1" stop-color="#2e4a52"/>`}</linearGradient>
    <radialGradient id="mvGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".32"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="mvFlood"><stop offset="0" stop-color="#ffd890" stop-opacity=".5"/><stop offset=".5" stop-color="#ffc070" stop-opacity=".15"/><stop offset="1" stop-color="#ffc070" stop-opacity="0"/></radialGradient>
    <clipPath id="mvCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="mvLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="mvCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".017" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="mvRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".003 .07" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".9"/></filter>
    <filter id="mvPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="mvSoft"><feGaussianBlur stdDeviation="16"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#mvSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 620; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 400, big = rs() < .07;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.25 + rs() * .6 * (1 - y / 440))}"/>`; }
    s += `<path d="M0,250 C600,180 1300,120 2560,40" stroke="#8a96c8" stroke-width="150" fill="none" opacity=".05" filter="url(#mvSoft)"/>`;
    s += `<rect width="${W}" height="${H}" fill="url(#mvLight)"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#mvLight)"/>`;
    s += `<g class="rays" opacity=".08" filter="url(#mvSoft)">`;
    for (let k = 0; k < 6; k++) { const a = .05 + k * .1, L = 1800;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .025) * L)},${F(LY + Math.sin(a - .025) * L)} L${F(LX + Math.cos(a + .025) * L)},${F(LY + Math.sin(a + .025) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: soft fair-weather heaps, thin in the text corners ---------------- */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#mvCloudy)">`;
    const lobes = [];
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#141c3c"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#1e2850"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .3)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .15)}" fill="#3a4878" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .11 * (.6 + rs() * .7), w * (.075 + rs() * .06)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .055)}" fill="#bccadc"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .7)}" fill="#ccd6e4"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .8)}" fill="#f6f6f2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .32)}" cy="${F(ly - R * .3)}" rx="${F(R * .56)}" ry="${F(R * .34)}" fill="#fffbec"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(560, 200, 380, "drift1") + cloud(1180, 95, 300, "drift2") + cloud(2010, 175, 440, "drift3") + cloud(2440, 92, 220, "drift1") + cloud(1720, 262, 200, "drift2");
  if (!NIGHT) {   // a skein of crows over the castle hill
    s += `<g class="birds" fill="none" stroke="#2c2a30" stroke-width="2.2" stroke-linecap="round" opacity=".75">`;
    [[1300, 215, 1], [1336, 226, .85], [1368, 210, .9], [1402, 232, .75], [1270, 236, .7]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 11 * k)},${F(y - 2 * k)} q${F(6 * k)},${F(-5 * k)} ${F(11 * k)},${F(2 * k)} q${F(5 * k)},${F(-5 * k)} ${F(11 * k)},${F(-2 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 7 m above the river, horizon on WY; metres, x right, y up, z away.
     The spur's bank (the inside of the bend) is zs(x); the river is WR wide
     round it, so its arms run off into the distance on both sides. */
  const EYE = 7, FL = 2200;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: [-.7, .5, -.38], tone: T, fog: HZ, fogK: .00011,
    shadow: SHADE, rim: RIM, shade: .5, hi: .25, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const BK = .0018, zs = x => 240 + BK * x * x, bs = x => 2 * BK * x, WR = 175;
  const ds = (x, z) => (z - zs(x)) / Math.sqrt(1 + bs(x) ** 2);            // + on the spur: metres from its bank
  const Pu = (x, z) => 80 + 9 * N1(x / 260, z / 260);                                // the plateau above the slopes
  /* the land never rises above yLim on screen: high behind the village, plateau-flat
     and low in the text corners (the cap rises with distance like the real skyline) */
  const yLim = u => 272 - 126 * Math.exp(-(((u + .03) / .15) ** 2));
  const capH = (x, z) => EYE + (WY - yLim(x / z)) * z / 2200 * (.93 + .07 * N3(x / 160, z / 160));
  const KX = -60, KZ = 700;                                                 // the castle knob
  const MF = mountainField({ seed: 77, scale: 2600, oct: 5, peaks: [
    { x: -3200, z: 6000, h: 230, rx: 2600, rz: 1800 }, { x: 3600, z: 5200, h: 200, rx: 2400, rz: 1600 },
    { x: -800, z: 9800, h: 300, r: 3200 }, { x: 5200, z: 11000, h: 330, r: 3400 }, { x: -7000, z: 11000, h: 280, r: 3000 } ] });
  const hSpur = (x, z, d) => { const rise = sm((d - 70) / 330), P = Pu(x, z);
    const knob = 10 * Math.exp(-(((x - KX) / 50) ** 2 + ((z - KZ) / 50) ** 2));
    return 2.6 + (P - 2.6) * Math.pow(rise, .85) + knob * rise + 2.5 * N2(x / 55, z / 55) * rise; };
  const hOuter = (x, z, e) => 1.6 + 115 * sm((e - 90) / 420) + 6 * N2(x / 90, z / 90) * sm((e - 60) / 60);
  const hT = (x, z) => { const d = ds(x, z); let h;
    if (d >= 0) h = d < 5 ? -.6 + (hSpur(x, z, d) + .6) * sm(d / 5) : hSpur(x, z, d);
    else { const e = -d - WR; if (e < 0) h = -1; else h = e < 5 ? -.6 + (hOuter(x, z, e) + .6) * sm(e / 5) : hOuter(x, z, e); }
    if (z > 2000) { const far = MF(x, z) * sm((z - 2000) / 2200); if (far > h) h = far; }
    return h > 0 ? Math.min(h, capH(x, z)) : h; };
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;

  /* colour: the raster lights it; this picks the material. Vineyards: plots climb the
     slope in contour terraces, rows run straight down the fall line, slate shows on
     the steepest faces; woods on the plateau; gardens and the river road below. */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const VINES = ["#9aa43c", "#b4ae3a", "#cdb036", "#dca234", "#c47c2c", "#aa5c2c", "#8c9a3e", "#d6be4a", "#c89a30"].map(H3);
  const SOIL = H3("#5e5450"), SLATE = H3("#565660"), STONE = H3("#a49884"), MEAD = H3("#94a050"), ROADC = H3("#c4baa8"), GARDEN = H3("#76903e");
  const FOR = ["#2c442e", "#3c5832", "#6e6c2c", "#b07e2a", "#8e4c24", "#c89c36"].map(H3);
  const FIELD = ["#a8a868", "#8a9a50", "#c4b07a", "#7a8a48"].map(H3);
  const forestY = (x, z, spur) => Math.min(spur ? Pu(x, z) - 8 : 70, capH(x, z) - 8) + 6 * N3(x / 70, z / 70);
  const woods = (x, z) => { const k = N1(x / 35, z / 35) * .5 + .5, t = N2(x / 7, z / 7) * .5 + .5;
    let c = L3(FOR[0], FOR[1], k);
    c = L3(c, FOR[2 + Math.floor(hash(Math.floor(x / 22), Math.floor(z / 22)) * 4)], sm((N3(x / 55 + 4, z / 55) + .05) / .45) * .85);
    return c.map(v => v * (.78 + .44 * t)); };
  const col = (x, y, z, n) => {
    const steep = 1 - n[1], dd = ds(x, z), spur = dd >= 0, det = sm((1150 - z) / 750);
    if (y < 1.3) return L3(H3("#6e675a"), H3("#9a907e"), .5 + .5 * N3(x / 2, z / 2));                 // quay stone and gravel
    if (z > 2400 && y > forestY(x, z, false) - 30) {                                                       // far hills: woods and fields
      const fk = N2(x / 700, z / 500); if (fk > .25 && steep < .25) return L3(FIELD[Math.floor(hash(Math.floor(x / 300), Math.floor(z / 260)) * 4)], FOR[1], .25);
      return woods(x, z); }
    if (y > forestY(x, z, spur)) return woods(x, z);
    if (y < 4.6 && steep < .22) {                                                                          // the flat bank
      if (spur && dd > 6 && dd < 13) return ROADC;
      return L3(MEAD, GARDEN, .5 + .5 * N2(x / 8, z / 8)); }
    const ty = y / 8.5 + .25 * N2(x / 40, z / 40), wall = ty - Math.floor(ty);
    const pid = Math.floor((x + 15 * N1(z / 60, x / 60)) / 34), hsh = hash(pid, Math.floor(ty));
    let leaf = VINES[Math.floor(hsh * VINES.length)];
    if (hsh > .94) leaf = L3(SOIL, MEAD, .45);                                                             // a fallow plot
    const gn = Math.hypot(n[0], n[2]) || 1, tc = (x * n[2] - z * n[0]) / gn, row = Math.sin(tc * Math.PI * 2 / 1.9);
    let c = L3(SOIL, leaf, .64 + det * (row > -.25 ? .36 : -.5));
    c = L3(c, SLATE, sm((steep - .55) / .2) * .75);
    if (wall < .085) c = L3(c, STONE, .3 + det * .6);
    return c; };
  w.raster({ z0: 22, z1: 16000, step: .0011, minStep: .25, scale: .75, top: 40, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00011, amb: NIGHT ? .55 : .42 });

  /* ---------- 2D drawings placed as sprites ---------- */
  const PLANE = ["#4a3a14", "#6a5418", "#8a7020", "#a88a28", "#c4a234", "#d8b84a", "#e8d070", "#f6e8a4"];
  const WALNUT = ["#26341a", "#344620", "#465a26", "#5a6e2c", "#748636", "#8e9c44", "#aab45a", "#c8cc7c"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const broadleaf = (x, y, hp, RAMP, fog, n) => {     // trunk, limbs and a crown of many lit leaf clumps
    const sd = LX < x ? -1 : 1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .035), ty = y - hp * .5;
    g += `<ellipse cx="${F(x - sd * hp * .1)}" cy="${F(y + 1)}" rx="${F(hp * .28)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .55)},${F(ty)} L${F(x + tb * .55)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5a4a3a")}"/>`;
    g += `<path d="M${F(x + sd * tb * .1)},${F(y)} L${F(x + sd * tb * .1)},${F(ty)} L${F(x + sd * tb * .55)},${F(ty)} L${F(x + sd * tb)},${F(y)}Z" fill="${Tf("#3a2e24")}"/>`;
    for (let k = 0; k < 4; k++) { const a = -1.2 + k * .8 + (r() - .5) * .3; g += `<path d="M${F(x)},${F(ty + hp * .05)} L${F(x + Math.sin(a) * hp * .22)},${F(ty - Math.cos(a) * hp * .2)}" stroke="${Tf("#4a3c30")}" stroke-width="${F(Math.max(.8, tb * .5))}"/>`; }
    // the crown is 3-5 irregular lobes (never one ball), each a cloud of small lit clumps
    const cx = x, cy = y - hp * .64, rx = hp * .36, ry = hp * .3, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.028 + r() * .028)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx + sd * a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#mvLeafy)">${cg}</g>`; };
  /* a small far tree: a dark irregular mass with shaded, mid and lit clumps (more pieces the bigger it is) */
  const clump = (x, y, sz, fog, RAMP) => { const lsd = x < LX ? -1 : 1, c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1e1a08", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .1), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(14, Math.round(sz / 2.2)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) * lsd + (y - sz * .5 - py) * .8, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .12 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };

  /* is the ground at (x, z) seen, or hidden behind nearer land? */
  const seen = (x, z) => { const y0 = sy(hT(x, z), z) - 1.5;
    for (let q = 30; q < z * .985; q += Math.max(.5, q * .012)) { const xq = x * q / z, hq = hT(xq, q); if (hq < 0) continue; if (sy(hq, q) < y0) return false; }
    return true; };
  const onGround = o => { const { P } = w.frame({ ...o, y: 0 }), c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => P([a * o.w / 2, 0, b * o.d / 2]));
    const hs = c.map(p => hT(p[0], p[2])), top = Math.max(...hs), low = Math.min(...hs); return { ...o, y: top, fy: low - top - .3 }; };
  const deg = 180 / Math.PI, faceYaw = (x, z, k = .25) => -Math.atan(x / z) * deg + Math.max(-14, Math.min(14, Math.atan(bs(x)) * deg * k));
  const atBank = (x, d) => [x, zs(x) + d * Math.sqrt(1 + bs(x) ** 2)];
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);

  /* ---------- the church: nave, west tower and slate spire with pinnacles ---------- */
  const CHX = 10, [, CHZ] = atBank(10, 40), chYaw = faceYaw(CHX, CHZ, 0);
  { const nave = onGround({ x: CHX, z: CHZ + 15, yaw: chYaw, w: 11, d: 24 });
    const WALLC = NIGHT ? "#f0d8a8" : "#efe7d4";
    w.house({ ...nave, h: 9.5, rh: 6.8, gable: true, wall: WALLC, roof: "#363a44", trim: "#d4c8ac", door: false, winGap: 4, winTall: 1.6, glass: "#4a5466", stone: "#8a8070", rng: rl, clap: false });
    const { P } = w.frame({ x: CHX, z: CHZ + 15, yaw: chYaw, y: nave.y }), base = P([0, 0, -12 - 3.2]), TW = 6.4, TH = 25;
    const ty0 = hT(base[0], base[2]), q = (Pf, u0, v0, u1, v1, zl, c, glow) => ({ P: [[u0, v0, zl], [u1, v0, zl], [u1, v1, zl], [u0, v1, zl]].map(Pf), c, glow });
    w.box({ x: base[0], z: base[2], y: ty0, yaw: chYaw, w: TW, d: TW, h: TH, c: WALLC, glow: false, dec: (fc, Pf) => {
      fc[0].dec = [q(Pf, -1.1, 0, 1.1, 3.4, -TW / 2 - .06, "#d4c8ac"), q(Pf, -.85, 0, .85, 3.1, -TW / 2 - .08, "#4a2a1e"),
        q(Pf, -1.1, 18.4, 1.1, 20.6, -TW / 2 - .06, "#d4c8ac"), q(Pf, -.9, 18.6, .9, 20.4, -TW / 2 - .08, "#f6f2e8"), q(Pf, -.08, 19.4, .08, 20.2, -TW / 2 - .1, "#2a2a2a"), q(Pf, -.08, 19.4, .5, 19.56, -TW / 2 - .1, "#2a2a2a"),
        q(Pf, -.5, 9, .5, 11.5, -TW / 2 - .06, "#4a5466")];
      [0, 1, 2, 3].forEach(i => { const zl = -TW / 2 - .06; const D = q(Pf, -.75, 21.4, .75, 24, zl, NIGHT ? "#2a1a10" : "#2a2a30");
        const Pi = p => { const a = i * Math.PI / 2, c = Math.cos(a), sn = Math.sin(a); return Pf([p[0] * c - p[2] * sn, p[1], p[0] * sn + p[2] * c]); };
        fc[i].dec = (fc[i].dec || []).concat([{ P: [[-.75, 21.4, zl], [.75, 21.4, zl], [.75, 24, zl], [-.75, 24, zl]].map(Pi), c: D.c }]); });
    } });
    const top = ty0 + TH, rot = (chYaw / deg) + Math.PI / 8;
    w.box({ x: base[0], z: base[2], y: top, yaw: chYaw, w: TW + .5, d: TW + .5, h: .5, c: "#d4c8ac" });
    w.cyl({ x: base[0], z: base[2], y: top + .5, r0: TW * .62, r1: 0, h: 21, n: 8, rot, c: "#3a3e4a" });
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { const c = w.frame({ x: base[0], z: base[2], yaw: chYaw }).P([a * TW * .42, 0, b * TW * .42]);
      w.cyl({ x: c[0], z: c[2], y: top + .5, r0: .75, r1: 0, h: 5.5, n: 4, rot, c: "#3a3e4a" }); });
    const tipY = top + .5 + 21;
    w.line([[base[0], tipY - .2, base[2]], [base[0], tipY + 2.6, base[2]]], "#c8a040", .18);
    w.line([[base[0] - .8 * Math.cos(chYaw / deg), tipY + 1.8, base[2] - .8 * Math.sin(chYaw / deg)], [base[0] + .8 * Math.cos(chYaw / deg), tipY + 1.8, base[2] + .8 * Math.sin(chYaw / deg)]], "#c8a040", .15);
    used.push([CHX, CHZ, 22], [CHX, CHZ + 16, 14]);
    if (NIGHT) { const [gx, gy] = w.proj([base[0], ty0 + 14, base[2] - 5]); w.sprite({ x: base[0], z: base[2] - 6, y: 0, noRefl: false, bias: -30, fn: () => `<ellipse cx="${F(gx)}" cy="${F(gy)}" rx="140" ry="190" fill="url(#mvFlood)"/>` }); }
  }

  /* ---------- the village: three rows of houses along the river road, slate roofs, some half-timbered ---------- */
  const MWALL = ["#f2ece0", "#ebe0c4", "#e8d2a0", "#dcc6a8", "#f0dccc", "#cfd6cc", "#e6c89a", "#f6f2ea", "#d8b890", "#e4d4c4"];
  const MROOF = ["#3a3d46", "#2f3239", "#454852", "#3e3a40", "#4a4448"];
  const halfTimber = (h) => (n, q, len) => { if (n !== "front" && n !== "left" && n !== "right") return; const B = "#3e2c22", v0 = Math.min(h - .3, 3);
    for (let u = .25; u < len - .1; u += 1.25) q(u - .09, v0, u + .09, h - .15, B, { off: .06 });
    q(.1, v0 - .1, len - .1, v0 + .1, B, { off: .06 }); q(.1, h - .3, len - .1, h - .12, B, { off: .06 });
    for (let u = .25; u < len - 1.3; u += 2.5) q(u + .3, v0 + (h - v0) * .45, u + 1.0, v0 + (h - v0) * .55, B, { off: .06 }); };
  const houses = [];
  [[24, 22, 230], [42, 17, 190], [59, 11, 140]].forEach(([d, n, span], row) => {
    for (let k = 0; k < n * 6 && houses.filter(h => h.row === row).length < n; k++) {
      const x = 10 + (r() * 2 - 1) * span * (.4 + .6 * Math.sqrt(r())), [hx, hz] = atBank(x, d + (r() - .5) * 5);
      if (sx(hx, hz) < -40 || sx(hx, hz) > W + 40 || !free(hx, hz, 5.5)) continue;
      used.push([hx, hz, 5.5]); houses.push({ x: hx, z: hz, row }); } });
  houses.forEach(({ x, z, row }) => {
    const yaw = faceYaw(x, z), o = w.randomHouse(rl, { x, z, yaw, kind: "village", rng: rl, porch: false });
    o.wall = MWALL[Math.floor(rl() * MWALL.length)]; o.roof = MROOF[Math.floor(rl() * MROOF.length)];
    if (o.roof3 === "gambrel" || o.roof3 === "shed") o.roof3 = "gable";
    o.clap = false; o.gable = o.roof3 === "gable" && rl() < .55;                       // plastered, often gable to the street
    o.w = Math.min(o.w, 9); o.h = 5.6 + rl() * 3; o.rh = Math.max(o.rh, (o.gable ? o.w : o.d) * .55);
    o.shut = rl() < .25 ? ["#5a3a2a", "#3a4a3a", "#7a2a22"][Math.floor(rl() * 3)] : null;
    if (rl() < .35 && o.h > 5) o.extra = halfTimber(o.h);
    w.house(onGround(o)); });

  /* ---------- the castle ruin on its knob: keep, broken curtain wall, roofless hall ---------- */
  { const ky = hT(KX, KZ), STN = NIGHT ? "#e8c890" : "#b4a68e", STD = NIGHT ? "#c8a070" : "#8e8270", glow = NIGHT;
    w.cyl({ x: KX, z: KZ, y: ky - 2, r0: 6.4, r1: 5.9, h: 27, n: 14, c: STN, glow });
    for (let i = 0; i < 14; i += 2) { const a = i / 14 * Math.PI * 2; w.box({ x: KX + Math.cos(a) * 5.6, z: KZ + Math.sin(a) * 5.6, y: ky + 25, yaw: -a * deg, w: 1.8, d: 1.1, h: 1.8, c: STN, glow }); }
    w.box({ x: KX, z: KZ - 6.5, y: ky + 12, w: 1, d: .3, h: 1.8, c: "#2a2420" });
    const seg = (x0, z0, x1, z1, hh, hr) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 2.4), ya = Math.atan2(z1 - z0, x1 - x0) * deg;
      for (let i = 0; i < n; i++) { const t = (i + .5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, gy = hT(x, z);
        const hh2 = hh * (.55 + .45 * Math.abs(Math.sin(i * 1.7 + hr))) + (rl() < .3 ? -2 : 0);
        w.box({ x, z, y: gy - 1.5, yaw: -ya, w: L / n + .05, d: 1.6, h: hh2 + 1.5, c: i % 3 ? STN : STD, glow }); } };
    seg(KX + 5, KZ - 2, KX + 34, KZ - 8, 8, 1); seg(KX - 5, KZ - 1, KX - 26, KZ + 6, 7, 3);
    const hy0 = hT(KX + 20, KZ + 6);
    w.box({ x: KX + 20, z: KZ + 6, y: hy0 - 1.5, w: 15, d: 8, h: 12.5, c: STN, glow, dec: (fc, Pf) => {
      fc[0].dec = [-5, -1.5, 2, 5.5].map(u => ({ P: [[u - .55, 7, -4.06], [u + .55, 7, -4.06], [u + .55, 9.6, -4.06], [u - .55, 9.6, -4.06]].map(Pf), c: NIGHT ? "#4a2e18" : "#2e2a28" })); } });
    for (let i = 0; i < 6; i++) w.box({ x: KX + 13.5 + i * 2.6, z: KZ + 2, y: hy0 + 11, w: 1.1, d: 1, h: 1 + (i % 2) * 1.2, c: STN, glow });
    used.push([KX + 5, KZ, 40]);
    if (NIGHT) { const [gx, gy] = w.proj([KX + 6, ky + 8, KZ - 6]); w.sprite({ x: KX, z: KZ - 30, y: 0, noRefl: true, bias: -40, fn: () => `<ellipse cx="${F(gx)}" cy="${F(gy)}" rx="120" ry="70" fill="url(#mvFlood)"/>` }); }
  }

  /* ---------- little vineyard huts on the slope ---------- */
  [[-160, 470], [120, 520], [-30, 455], [230, 700], [-270, 680]].forEach(([x, z]) => {
    if (ds(x, z) < 90 || !seen(x, z) || !free(x, z, 6)) return;
    const o = onGround({ x, z, yaw: faceYaw(x, z), w: 3.2, d: 3, gable: rl() < .5 });
    w.house({ ...o, h: 2.5, rh: 1.7, wall: rl() < .5 ? "#d8ccb8" : "#e8e0d0", roof: "#3a3d46", trim: "#c8bca4", door: .5, winGap: 9, rng: rl }); used.push([x, z, 5]); });

  /* ---------- boats: the passenger boat at the landing, a barge on the right arm ---------- */
  const prism = (o, pts, y0, y1, c, top, extra = {}) => { const { P } = w.frame(o), faces = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length];
      faces.push({ P: [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]].map(P), c, wet: extra.wet, glow: extra.glow, dec: extra.dec ? extra.dec(a, b, P) : undefined }); }
    faces.push({ P: pts.map(p => P([p[0], y1, p[1]])), c: top || c, up: true });
    return w.add(faces, { center: P([0, (y0 + y1) / 2, 0]) }); };
  const hullPts = (L, B) => [[-L / 2, -B / 2], [L / 2 - B * .9, -B / 2], [L / 2, 0], [L / 2 - B * .9, B / 2], [-L / 2, B / 2], [-L / 2 - .4, 0]];
  { const bx = -95, [x, z] = atBank(bx, -9), yaw = Math.atan(bs(bx)) * deg, o = { x, z, yaw: yaw + 180 };   // bow upstream (left)
    const band = (a, b, P) => [{ P: [[a[0], .9, a[1]], [b[0], .9, b[1]], [b[0], 1.25, b[1]], [a[0], 1.25, a[1]]].map(p => P([p[0] * 1.001, p[1], p[2] * 1.001])), c: "#2a5a8a" }];
    prism(o, hullPts(34, 6.6), -1.2, 1.4, "#f2f0ea", "#c8c0b0", { wet: true, dec: band });
    const win = (a, b, P) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 3) return []; const out = [];
      for (let t = .6; t < L - .6; t += 1.5) { const u0 = t / L, u1 = (t + 1) / L, p0 = [a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0], p1 = [a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1];
        const lt = NIGHT && rl() < .8; out.push({ P: [[p0[0], 2.0, p0[1]], [p1[0], 2.0, p1[1]], [p1[0], 3.2, p1[1]], [p0[0], 3.2, p0[1]]].map(p => P([p[0] * 1.004, p[1], p[2] * 1.004])), c: lt ? LAMP : "#3a4a5e", glow: lt }); }
      return out; };
    prism(o, [[-14, -2.7], [10, -2.7], [10, 2.7], [-14, 2.7]], 1.4, 3.8, "#f6f4ee", "#e0dcd2", { dec: win });
    prism(o, [[4, -1.8], [8.5, -1.8], [8.5, 1.8], [4, 1.8]], 3.8, 5.8, "#f6f4ee", "#d0c8b8", { dec: (a, b, P) => [{ P: [[a[0], 4.6, a[1]], [b[0], 4.6, b[1]], [b[0], 5.4, b[1]], [a[0], 5.4, a[1]]].map(p => P([p[0] * 1.004, p[1], p[2] * 1.004])), c: NIGHT ? LAMP : "#3a4a5e", glow: NIGHT }] });
    const { P } = w.frame(o); w.line([P([-14, 4.6, -2.7]), P([4, 4.6, -2.7])], "#d0ccc4", .06); w.line([P([-14, 4.6, 2.7]), P([4, 4.6, 2.7])], "#d0ccc4", .06);
    w.line([P([-15.5, 3.8, 0]), P([-15.5, 6.4, 0])], "#8a8a8a", .07); w.line([P([-15.5, 6.3, 0]), P([-15.5, 5.6, 0]), P([-14.4, 6.0, 0])], "#c83a2a", .12);
    // the landing stage it is tied to
    const [lx, lz] = atBank(bx, -2.5); w.box({ x: lx, z: lz, y: -.4, yaw, w: 14, d: 3.5, h: 1.3, c: "#5a5a5e", top: "#8a8478", wet: true }); }

  /* ---------- trees: plane trees on the river road, walnuts and fruit trees in the gardens, the woods' edge ---------- */
  for (let x = -215; x < 240; x += 15 + r() * 9) { const [tx, tz] = atBank(x, 4.5 + r() * 1.5);
    if (Math.abs(x + 95) < 12 || sx(tx, tz) < -60 || sx(tx, tz) > W + 60 || Math.abs(sx(tx, tz) - sx(CHX, CHZ)) < 70) continue;
    const hM = 12 + r() * 5, y0 = hT(tx, tz);
    w.sprite({ x: tx, z: tz, y: y0, fn: (px, py, kk, fog) => broadleaf(px, py, hM * kk, r() < .7 ? PLANE : WALNUT, fog, Math.min(160, Math.round(hM * kk * .8))) }); }
  for (let k = 0; k < 160; k++) { const x = -300 + r() * 600, d = 14 + r() * 70, [tx, tz] = atBank(x, d);
    if (!free(tx, tz, 2.5) || sx(tx, tz) < -40 || sx(tx, tz) > W + 40) continue; used.push([tx, tz, 2.5]);
    const hM = 6 + r() * 7, y0 = hT(tx, tz), RAMP = [WALNUT, PLANE, RUST][Math.floor(r() * 3)];
    w.sprite({ x: tx, z: tz, y: y0, fn: (px, py, kk, fog) => hM * kk > 30 ? broadleaf(px, py, hM * kk, RAMP, fog, Math.min(110, Math.round(hM * kk))) : clump(px, py, hM * kk * .7, fog, RAMP) }); }
  // the wood's edge along the plateau rim, and copses between the plots, only where the ground is seen
  for (let k = 0, n = 0; k < 16000 && n < 2600; k++) { const z = 300 + Math.pow(r(), 1.2) * 2400, u = (r() - .5) * 1.25, x = u * z, d = ds(x, z);
    if (d < 70) continue; const y0 = hT(x, z), fY = d >= 0 ? forestY(x, z, true) : forestY(x, z, false);
    if (y0 < fY - 2.5 && r() > .004) continue; if (!free(x, z, 1) || !seen(x, z)) continue; n++;
    const q = r(), hM = 9 + r() * 8, RAMP = q < .72 ? WALNUT : q < .9 ? PLANE : RUST;
    w.sprite({ x, z, y: y0 - .3, fn: (px, py, kk, fog) => clump(px, py, Math.max(2.5, hM * kk * .22), fog * .9, RAMP) }); }

  /* ---------- quay lamps and our own bank: reeds, a willow, harvest tubs ---------- */
  for (let x = -230; x < 260; x += 26) { const [lx, lz] = atBank(x, 3); if (Math.abs(x + 95) < 10) continue;
    const y0 = hT(lx, lz); w.box({ x: lx, z: lz, y: y0, w: .14, d: .14, h: 3.6, c: "#2a2a30" }); w.box({ x: lx, z: lz, y: y0 + 3.6, w: .45, d: .45, h: .5, c: NIGHT ? LAMP : "#3a3a40", glow: NIGHT });
    if (NIGHT) w.sprite({ x: lx, z: lz - .3, y: y0 + 3.85, bias: -1, fn: (px, py, kk) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(5, kk * 2.6))}" fill="url(#mvGlow)" opacity=".85"/>` }); }
  for (let k = 0; k < 520; k++) { const x = (r() - .5) * 90, z = 23 + r() * 45, d = ds(x, z); if (-d - WR < 1) continue;
    w.sprite({ x, z, y: hT(x, z), fn: (px, py, kk) => { const hh = (.3 + r() * .5) * kk; let g = "";
      for (let i = 0; i < 4; i++) { const bx = px + (r() - .5) * hh * .6; g += `<path d="M${F(bx)},${F(py)} q${F(-2 + r() * 4)},${F(-hh * .6)} ${F(-5 + r() * 10)},${F(-hh)}" stroke="${T(r() < .5 ? "#c8b468" : "#6e7432")}" stroke-width="${F(Math.max(1.2, kk * .03))}" fill="none" stroke-linecap="round" opacity=".85"/>`; }
      return g; } }); }
  [[-16, 30], [-13.5, 31], [15, 29]].forEach(([x, z], i) => { const y0 = hT(x, z);
    w.cyl({ x, z, y: y0, r0: .42, r1: .5, h: .75, n: 14, c: i === 2 ? "#3a6a8a" : "#8a5a32", top: "#5a1e2a" });
    w.sprite({ x, z: z - .2, y: y0 + .76, bias: -1, fn: (px, py, kk) => { let g = ""; for (let j = 0; j < 9; j++) g += `<circle cx="${F(px + (r() - .5) * kk * .6)}" cy="${F(py - r() * kk * .12)}" r="${F(kk * .06)}" fill="${T(r() < .5 ? "#d4c060" : "#b8a84a")}"/>`; return g; } }); });
  w.sprite({ x: -24, z: 34, y: hT(-24, 34), fn: (px, py, kk, fog) => broadleaf(px, py, 9 * kk, PLANE, fog, 160) });

  /* ---------------- assemble: water, the mirrored world, the land, then everything on it ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#mvWater)"/>`;
  s += `<g clip-path="url(#mvCW)"><g opacity="${NIGHT ? .75 : .6}" filter="url(#mvRipple)">${w.draw({ mirror: true })}</g></g>`;
  s += `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="url(#mvWater)" opacity=".28"/>`;
  for (let k = 0; k < 150; k++) { const y = WY + 3 + Math.pow(r(), .8) * (H - WY - 3), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(30 + r() * 160 * (.4 + t))}" height="${F(1 + t * 1.2)}" rx="1" fill="${NIGHT ? "#7a8ac0" : "#f0f6f4"}" opacity="${F(.05 + r() * .1)}"/>`; }
  s += w.draw({ where: isR });
  s += `<rect x="0" y="300" width="${W}" height="130" fill="url(#mvHaze)" opacity=".3"/>`;
  s += w.draw({ where: notR });

  s += `<rect width="${W}" height="${H}" fill="url(#mvLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#mvPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
