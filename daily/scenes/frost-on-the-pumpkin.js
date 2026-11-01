/* Frost on the Pumpkin: first frost in a central-Ohio pumpkin patch, just
   after sunrise (Oct 18, 2026: widespread frost before 10 AM). The title is
   James Whitcomb Riley's 1883 poem, "When the Frost Is on the Punkin" -- "and
   the fodder's in the shock". Seen from low down among the vines: a group of
   pumpkins on frost-wilted vines (a big pale giant, a carved jack-o'-lantern),
   a tall corn shock behind them, a field of shocks and scattered pumpkins
   running back to a zig-zag rail fence with crows, a frosted stubble field, a
   white farmhouse with a windpump and chimney smoke, woodlots in colour,
   ground mist and low blue hills. Sun just risen off the left edge; frost is
   pink-white in the sun and blue in the long shadows.
   opts.time === "night": that evening, a first-quarter moon over the field,
   stars, silver frost and mist, the jack-o'-lantern lit, a lantern on the
   fence and the farmhouse windows.
   Ground is two world3d() rasters; pumpkins, shocks, fence, buildings and
   trees are placed in metres by the same camera (eye 0.45 m). Same shape as
   reference/autumn-valley.js. Needs rng(), mix(), world3d(), noise2(),
   mountainField(), hexRGB() and rgbTone() from reference/scene-helpers.js.
   opts.carved === false: no carved face (the Thanksgiving pool's version);
   the jack-o'-lantern is a plain field pumpkin, unlit at night.
   opts.part = "sky" | "clouds" | "land".                                    */
function frostOnThePumpkinArt(opts = {}) {
  const NIGHT = opts.time === "night", CARVED = opts.carved !== false;
  const seed = opts.seed || 1018;
  const r = rng(seed), rs = rng(seed + 5), rp = rng(seed + 29), rg = rng(seed + 41);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -170, LY = 368, WY = 404;
  const T = c => NIGHT ? mix(mix(c, "#7884a8", .45), "#081030", .6) : c;
  const HZ = NIGHT ? "#2a3458" : "#ece2dc", RIM = NIGHT ? "#b8c8f0" : "#fff0d8", SHADE = NIGHT ? "#04060e" : "#3a4060", LAMP = "#ffc46a";
  const FROST = NIGHT ? "#d0dcf8" : "#f4f8fc", FROSTB = NIGHT ? "#8a9ac8" : "#b8c8e0";
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

  /* ---------------- sky: clear frosty dawn, or a first-quarter moon night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#030620"/><stop offset=".5" stop-color="#0a1238"/><stop offset=".86" stop-color="#1e2a58"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#5e8cc0"/><stop offset=".45" stop-color="#94b6d4"/><stop offset=".78" stop-color="#d4dce2"/><stop offset=".92" stop-color="#f2dccc"/><stop offset="1" stop-color="#f8e4cc"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#c8d4ff" stop-opacity=".22"/><stop offset=".3" stop-color="#8a9ad8" stop-opacity=".08"/><stop offset="1" stop-color="#8a9ad8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fffaf0" stop-opacity="1"/><stop offset=".1" stop-color="#ffe8c0" stop-opacity=".7"/><stop offset=".38" stop-color="#ffd2a8" stop-opacity=".22"/><stop offset="1" stop-color="#ffd2a8" stop-opacity="0"/>`;
  const MX = 1392, MY = 170, MR = 19;
  let s = `<defs id="fpdefs">
    <linearGradient id="fpSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="fpLight" cx="${NIGHT ? MX : LX}" cy="${NIGHT ? MY : LY}" r="${NIGHT ? 700 : 1700}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="fpHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".9"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="fpMist" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${NIGHT ? "#8a9ac8" : "#fff0e2"}"/><stop offset=".5" stop-color="${NIGHT ? "#6a7aa8" : "#f2eef0"}"/><stop offset="1" stop-color="${NIGHT ? "#5a6a98" : "#e4e8f0"}"/></linearGradient>
    <radialGradient id="fpGlow"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".42"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="fpWarm"><stop offset="0" stop-color="#ffb860" stop-opacity=".55"/><stop offset=".5" stop-color="#ff9a40" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient>
    <radialGradient id="fpMoon"><stop offset="0" stop-color="#e8eeff" stop-opacity=".5"/><stop offset=".3" stop-color="#b0c0f0" stop-opacity=".12"/><stop offset="1" stop-color="#b0c0f0" stop-opacity="0"/></radialGradient>
    <filter id="fpLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="17" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="fpCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="3" seed="53" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.5"/></filter>
    <filter id="fpCirrus" x="-10%" y="-60%" width="120%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".004 .05" numOctaves="3" seed="29" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="3"/></filter>
    <filter id="fpPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="19"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="fpSoft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="fpBlur2"><feGaussianBlur stdDeviation="2.5"/></filter>
    <filter id="fpBlur8"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fpSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 1000; i++) { const x = rs() * W, y = Math.pow(rs(), 1.25) * 410, big = rs() < .06, dm = Math.hypot(x - MX, y - MY) < 260 ? .35 : 1;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.8 : F(.5 + rs() * .7)}" fill="${rs() < .18 ? "#ffe6c4" : "#e6ecff"}" opacity="${F((.25 + rs() * .6) * (1 - y / 460) * dm)}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#fpLight)"/>`;
    // first quarter: the right half lit, the terminator tipped toward the set sun (west, right)
    s += `<circle cx="${MX}" cy="${MY}" r="${MR * 8}" fill="url(#fpMoon)"/>
      <g transform="rotate(28 ${MX} ${MY})"><circle cx="${MX}" cy="${MY}" r="${MR}" fill="#323a62" opacity=".7"/>
      <path d="M${MX},${MY - MR} A${MR},${MR} 0 0 1 ${MX},${MY + MR} A${MR * .1},${MR} 0 0 1 ${MX},${MY - MR}Z" fill="#f4f2e6"/>
      <circle cx="${MX + MR * .45}" cy="${MY - MR * .3}" r="${MR * .16}" fill="#c8c6c0" opacity=".55"/><circle cx="${MX + MR * .3}" cy="${MY + MR * .35}" r="${MR * .22}" fill="#c8c6c0" opacity=".45"/></g>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#fpLight)"/>`;
    s += `<g class="rays" opacity=".09" filter="url(#fpSoft)">`;
    for (let k = 0; k < 7; k++) { const a = -.16 + k * .07, L = 2400;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .015) * L)},${F(LY + Math.sin(a - .015) * L)} L${F(LX + Math.cos(a + .015) * L)},${F(LY + Math.sin(a + .015) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a few dawn-lit wisps low down, faint cirrus high ---------------- */
  {
    s += `<g class="drift1" filter="url(#fpCirrus)">`;
    for (let i = 0; i < 12; i++) { const x = 300 + rs() * 1900, y = 70 + rs() * 170, L = 240 + rs() * 460, b = (rs() - .5) * 30;
      s += `<path d="M${F(x)},${F(y)} q${F(L * .5)},${F(b - 14)} ${F(L)},${F(b)}" stroke="${NIGHT ? "#222a58" : "#fff4ec"}" stroke-width="${F(4 + rs() * 10)}" fill="none" stroke-linecap="round" opacity="${F(NIGHT ? .3 : .2 + rs() * .22)}"/>`; }
    s += `</g>`;
  }
  const wisp = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#fpCloudy)">`;
    const n = 6 + Math.floor(rs() * 3), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.08 + rs() * .06) * (1 - Math.abs(t - .5) * .8);
      lobes.push([x + (t - .5) * w, y - R * (.2 + rs() * .3), R]); }
    if (NIGHT) {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.3)}" ry="${F(R * .5)}" fill="#1a2250"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly - R * .15)}" rx="${F(R * .7)}" ry="${F(R * .25)}" fill="#3a4680" opacity=".5"/>`);
    } else {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .1)}" cy="${F(ly + R * .15)}" rx="${F(R * 1.35)}" ry="${F(R * .5)}" fill="#c8bcc8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.2)}" ry="${F(R * .45)}" fill="#ecdcd8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .4)}" cy="${F(ly - R * .14)}" rx="${F(R * .6)}" ry="${F(R * .24)}" fill="#fff0e0"/>`);
    }
    return c + `</g></g>`;
  };
  s += `<g opacity="${NIGHT ? .75 : .85}">` + wisp(520, 318, 380, "drift2") + wisp(1060, 296, 260, "drift3") + wisp(1820, 312, 340, "drift2") + wisp(2300, 330, 260, "drift3") + `</g>`;
  if (!NIGHT) {   // a skein of geese heading south
    s += `<g class="birds" fill="none" stroke="#2a2a36" stroke-width="2.2" stroke-linecap="round" opacity=".8">`;
    [[1100, 230, 1], [1124, 220, .9], [1148, 211, .85], [1172, 203, .8], [1126, 242, .9], [1152, 252, .85], [1178, 261, .8], [1204, 268, .75]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 10 * k)},${F(y - 2)} q${F(5 * k)},${F(-6 * k)} ${F(10 * k)},${F(2)} q${F(5 * k)},${F(-6 * k)} ${F(10 * k)},${F(-2)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 0.45 m above the patch (y = 0); metres, x right, y up, z away.
     Pumpkins z 10-14, the big shock at 16.5, the field of shocks to z 160, fence at z 34. */
  const EYE = .45, FL = 2300;
  const LIGHT = NIGHT ? [.25, .55, .8] : [-.8, .3, -.45];
  const w = world3d({ h: EYE, hy: WY, f: FL, light: LIGHT, tone: T, fog: HZ, fogK: .0007,
    shadow: SHADE, rim: RIM, shade: .5, hi: .3, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const capY = px => 262 - 90 * Math.exp(-(((px - 1240) / 320) ** 2));
  const MF = mountainField({ seed: 4471, scale: 2200, oct: 5, peaks: [
    { x: -5200, z: 7000, h: 230, rx: 3000, rz: 1800 }, { x: -600, z: 9000, h: 190, r: 2600 }, { x: 4200, z: 6400, h: 260, r: 2400 }, { x: 9000, z: 12000, h: 380, r: 4200 } ] });
  const hG = (x, z) => {
    if (z < 60) return .03 + .02 * N3(x / 3, z / 3);
    const roll = sm((z - 90) / 300) * (1.8 + 1.6 * N1(x / 260, z / 260));
    return Math.max(.03, .03 + roll + MF(x, z) * sm((z - 2400) / 3000)); };

  /* ground colour: frosted matted vines and grass, frosted stubble, woods, a patchwork beyond */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const FR = H3(NIGHT ? "#c4d0ec" : "#eef0f2"), FRP = H3("#f8e6dc"), FRB = H3("#bccae0"), GR = H3("#6a7448"), GR2 = H3("#8a8456"),
        STUB = H3("#b89e6a"), STUB2 = H3("#8a7650"), PAST = H3("#8a9a5a"), PLOW = H3("#6e5440");
  const FOR = ["#3a4628", "#5a5026", "#b0602a", "#943420", "#c8942e", "#7a4220"].map(H3);
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const col = (x, y, z, n) => {
    const tex = 1 / (1 + z / 30), sun = NIGHT ? 0 : sm((-x / z + .2) * 1.2) * .5;   // the left of the view catches the sun
    if (z < 60) {   // white where the rime is thick, grass and dead vine showing through in patches, blue in the hollows
      // fine grain is laid out in screen terms (about 5 px each way at any depth), so it never streaks into ripples
      const fine = N3(x * FL / (5 * z), z * FL * EYE / (5 * z * z)) * .7 + N3(x / .5 + 9, z / .5) * .3 * sm(1 - z / 25);
      const fr = .52 + .22 * N2(x / 6, z / 6) + .4 * fine + .12 * N1(x / 14, z / 14);
      let c = L3(L3(GR, GR2, .5 + .7 * N2(x / 1.5, z / 1.5) + .4 * fine), FR, fr);
      c = L3(c, FRB, .35 * (N1(x / 5 + 7, z / 5) * .5 + .5) * (1 - sun));
      return L3(c, NIGHT ? FRB : FRP, sun * .6); }
    if (z < 420 && y < 6) {                                                          // the frosted stubble field, rows running away
      const row = Math.sin(x * Math.PI * 2 / .76) * sm(1 - z / 140) * .5;
      let c = L3(STUB, STUB2, .45 + row + .4 * N3(x / 4, z / 4) * tex);
      c = L3(c, FR, .5 + .25 * N2(x / 30, z / 30) - row * .4); return L3(c, NIGHT ? FRB : FRP, sun * .6); }
    if (y > 14) {                                                                    // the hills: woods in colour, dulled by the cold
      const k = N1(x / 300, z / 300) * .5 + .5; let c = L3(FOR[0], FOR[1], k);
      c = L3(c, FOR[2 + Math.floor(hash(Math.floor(x / 140), Math.floor(z / 140)) * 4)], sm((N3(x / 420, z / 420) + .2) / .4) * .75);
      return c.map(v => v * (.8 + .4 * (N2(x / 40, z / 40) * .5 + .5))); }
    const cell = hash(Math.floor((x + 3000) / 190), Math.floor(z / 150));             // the patchwork, frosted pale
    const c = cell < .35 ? STUB : cell < .6 ? PAST : cell < .78 ? PLOW : STUB2;
    return L3(c, FR, .45 + .2 * N2(x / 60, z / 60)); };
  const far = w.raster({ z0: 1400, z1: 26000, step: .0016, minStep: 2, scale: .6, top: 230, bottom: WY + 8, h: hG, col, tone: rgbTone(T), fog: HZ, fogK: .00028, amb: NIGHT ? .6 : .55, noRefl: true, key: 1e7 });
  const near = w.raster({ z0: 2.5, z1: 1400, step: .0011, minStep: .03, scale: .75, top: 230, bottom: H, h: hG, col, tone: rgbTone(T), fog: HZ, fogK: .0007, amb: NIGHT ? .55 : .68, noRefl: true, key: 5e6 });
  const seen = (x, z, y) => { const y0 = sy(y, z) - 1.2;
    for (let q = 60; q < z * .985; q += Math.max(.5, q * .01)) { const xq = x * q / z; if (sy(hG(xq, q), q) < y0) return false; }
    return true; };

  /* ---------- painterly pieces drawn as sprites ---------- */
  const fogC = (c, fog) => T(mix(c, HZ, fog));
  const ORG = ["#5a200a", "#86300c", "#ac4410", "#cc5a16", "#e2731e", "#f08e2e", "#f8ac52", "#fcca86"];
  const DEEP = ["#4a1a08", "#6e280a", "#90380c", "#b04a12", "#cc6018", "#e07a26", "#ee9a44", "#f8c07a"];
  const GIANT = ["#6a3a1a", "#8a4e22", "#ac682e", "#c8823c", "#dc9a52", "#eab06a", "#f4c88a", "#fce0b0"];
  const WHT = ["#6a6250", "#8a8270", "#a8a08c", "#c4bca6", "#d8d2be", "#e8e4d4", "#f4f0e2", "#fffcf2"];
  const GRN = ["#1e2a14", "#2a3a1a", "#3a4c20", "#4e6028", "#647432", "#7c8a40", "#98a456", "#b6bc74"];
  const pickPumpkin = () => { const q = rp(); return q < .55 ? ORG : q < .78 ? DEEP : q < .9 ? WHT : GRN; };
  /* a ribbed pumpkin sitting on (px, py); R in px. sq = height/width, jack: carved face (lit at night). Frost on its top and shaded side. */
  const pumpkin = (px, py, R, fog, RAMP, jack, sq, nr) => {
    const ry = R * (sq || (.72 + rp() * .14)), cy = py - ry, C = i => fogC(RAMP[Math.max(0, Math.min(7, i))], fog);
    let g = `<ellipse cx="${F(px + R * .25)}" cy="${F(py)}" rx="${F(R * 1.15)}" ry="${F(Math.max(.8, R * .16))}" fill="#000" opacity=".25"/>`;
    if (R < 2.2) return g + `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(4)}"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(2)}"/>`;
    nr = nr || (R > 9 ? 5 : 3);
    for (let i = 0; i < nr; i++) { const u = (i + .5) / nr * 2 - 1, rx = R * (1 - Math.abs(u) * .55) / nr * 1.25;
      g += `<ellipse cx="${F(px + u * R * .62)}" cy="${F(cy)}" rx="${F(rx)}" ry="${F(ry * (.97 - Math.abs(u) * .08))}" fill="${C(u < -.3 ? 6 : u < .2 ? 5 : u < .6 ? 4 : 3)}"/>`; }
    if (R > 14) for (let i = 1; i < nr; i++) { const u = i / nr * 2 - 1;      // creases between the ribs
      g += `<path d="M${F(px + u * R * .7)},${F(cy - ry * .92 * Math.sqrt(1 - u * u * .6))} Q${F(px + u * R * .86)},${F(cy)} ${F(px + u * R * .7)},${F(cy + ry * .92 * Math.sqrt(1 - u * u * .6))}" stroke="${C(1)}" stroke-width="${F(R * .025)}" fill="none" opacity=".55"/>`; }
    if (R > 5) g += `<ellipse cx="${F(px - R * .42)}" cy="${F(cy - ry * .38)}" rx="${F(R * .2)}" ry="${F(ry * .14)}" fill="${C(7)}" opacity=".7"/>`;
    g += `<path d="M${F(px - R * .06)},${F(cy - ry * .9)} q${F(R * .02)},${F(-R * .22)} ${F(R * .16)},${F(-R * .3)} l${F(R * .06)},${F(R * .06)} q${F(-R * .1)},${F(R * .1)} ${F(-R * .08)},${F(R * .26)}Z" fill="${fogC("#4a4a2a", fog)}"/>`;
    if (jack && CARVED && R > 5) {
      const fc = NIGHT ? "#ffd070" : fogC("#3a1606", fog);
      g += `<path d="M${F(px - R * .5)},${F(cy - ry * .12)} l${F(R * .18)},${F(-R * .28)} l${F(R * .18)},${F(R * .28)}Z M${F(px + R * .14)},${F(cy - ry * .12)} l${F(R * .18)},${F(-R * .28)} l${F(R * .18)},${F(R * .28)}Z M${F(px - R * .56)},${F(cy + ry * .18)} q${F(R * .56)},${F(ry * .5)} ${F(R * 1.12)},0 l${F(-R * .2)},${F(ry * .14)} l${F(-R * .18)},${F(-ry * .12)} l${F(-R * .18)},${F(ry * .12)} l${F(-R * .18)},${F(-ry * .12)} l${F(-R * .2)},${F(ry * .14)}Z" fill="${fc}"/>`;
      if (NIGHT) g += `<circle cx="${F(px)}" cy="${F(cy)}" r="${F(R * 4)}" fill="url(#fpGlow)" opacity=".6"/>`; }
    // frost: a pale rime along the top and stipple on the shaded (right) side
    if (R > 4) {
      g += `<path d="M${F(px - R * .8)},${F(cy - ry * .55)} Q${F(px)},${F(cy - ry * 1.18)} ${F(px + R * .85)},${F(cy - ry * .5)}" stroke="${fogC(FROST, fog)}" stroke-width="${F(Math.max(.8, R * .07))}" fill="none" opacity="${NIGHT ? .45 : .6}" stroke-linecap="round"/>`;
      // a soft bloom of rime over the top, then fine crystals, densest on the top and the shaded side
      g += `<ellipse cx="${F(px + R * .1)}" cy="${F(cy - ry * .45)}" rx="${F(R * .8)}" ry="${F(ry * .42)}" fill="${fogC(FROST, fog)}" opacity="${NIGHT ? .12 : .16}"/>`;
      const m = Math.min(420, Math.round(R * R * .14));
      for (let i = 0; i < m; i++) { const a = rp() * Math.PI * 2, q = Math.sqrt(rp()), x = Math.cos(a) * q, y = Math.sin(a) * q;
        if (y > -.1 && x < .35 && rp() < .85) continue;
        g += `<circle cx="${F(px + x * R * .95)}" cy="${F(cy + y * ry * .95)}" r="${F(Math.max(.4, R * (.005 + rp() * .008)))}" fill="${fogC(x > .2 ? FROSTB : FROST, fog)}" opacity="${F(.35 + rp() * .45)}"/>`; } }
    return g; };
  /* a pumpkin leaf lying on the ground, wilted and rimed: palmate, squashed by the low view */
  const leaf = (px, py, R, fog, ang, sq) => {
    const pts = [];
    for (let k = 0; k < 5; k++) { const a = ang + (k - 2) * .62, tip = R * (.8 + rp() * .3), a2 = a + .31;
      pts.push([Math.cos(a) * tip, Math.sin(a) * tip], [Math.cos(a2) * R * .42, Math.sin(a2) * R * .42]); }
    const P = pts.map(([x, y]) => [px + x, py + y * sq]);
    let d = `M${F(px)},${F(py)}`; P.forEach(([x, y], i) => { const [x0, y0] = i ? P[i - 1] : [px, py]; d += ` Q${F((x0 + x) / 2 + (rp() - .5) * R * .15)},${F((y0 + y) / 2 + (rp() - .5) * R * .1 * sq)} ${F(x)},${F(y)}`; });
    d += "Z";
    const base = mix(["#3e4e2a", "#4e5630", "#5a5a32", "#4a4a36"][Math.floor(rp() * 4)], "#9aa6a0", .15 + rp() * .25);
    let g = `<path d="${d}" fill="${fogC(base, fog)}" stroke="${fogC(FROST, fog)}" stroke-width="${F(Math.max(.5, R * .03))}" stroke-opacity=".5"/>`;
    for (let k = 0; k < 10; k += 2) g += `<path d="M${F(px)},${F(py)} L${F(P[k][0])},${F(P[k][1])}" stroke="${fogC(mix(base, "#e8eef4", .5), fog)}" stroke-width="${F(Math.max(.4, R * .03))}" opacity=".7"/>`;
    return g; };
  /* a corn shock: stalks stood up in a teepee and tied, leaves hanging, rime on the shaded side */
  const STRAW = ["#3a2c1a", "#524026", "#6c5630", "#86703c", "#a08848", "#b89e5a", "#d0b672", "#e6cc8e"];
  const shock = (px, py, hp, fog) => {
    const C = STRAW.map(c => fogC(c, fog)), FW = fogC(FROST, fog), FB = fogC(FROSTB, fog);
    const bw = hp * (.6 + rp() * .12), tie = py - hp * (.58 + rp() * .05), lean = (rp() - .5) * hp * .05, top = py - hp, tx = px + lean;
    const hw = y => y >= tie ? bw / 2 * (1 - (py - y) / (py - tie) * .84) * (1 + .12 * Math.sin((py - y) / (py - tie) * Math.PI)) : bw / 2 * (.16 + (tie - y) / (tie - top) * .5);
    const cxAt = y => px + (y < tie ? lean : lean * (py - y) / (py - tie));
    const sideC = (c, u) => u > .55 ? mix(c, FB, (u - .55) * .5) : c;
    let g = `<ellipse cx="${F(px + hp * .25)}" cy="${F(py)}" rx="${F(bw * .7)}" ry="${F(Math.max(1, hp * .04))}" fill="#000" opacity=".22"/>`;
    // dark body underneath, so gaps between stalks read as depth
    const L = [], R2 = [];
    for (let k = 0; k <= 14; k++) { const y = py - (py - top - hp * .08) * k / 14; L.push([cxAt(y) - hw(y) * .9, y]); R2.push([cxAt(y) + hw(y) * .9, y]); }
    g += `<path d="M${L.map(p => F(p[0]) + "," + F(p[1])).join(" L")} L${R2.reverse().map(p => F(p[0]) + "," + F(p[1])).join(" L")}Z" fill="${C[1]}"/>`;
    const n = Math.max(10, Math.min(230, Math.round(hp * .62))), sw = Math.max(.6, hp * .008);
    for (let i = 0; i < n; i++) { const u = cl((i + rp() * .8) / n), bx = px + (u - .5) * bw * .96, ttx = tx + (u - .5) * bw * .18;
      const lit = cl((1 - u) * .85 + (rp() - .5) * .35 + .08);
      g += `<path d="M${F(bx)},${F(py)} Q${F((bx + ttx) / 2 + (u - .5) * bw * .2)},${F((py + tie) / 2)} ${F(ttx)},${F(tie)}" stroke="${sideC(C[Math.floor(lit * 7.99)], u)}" stroke-width="${F(sw)}" fill="none"/>`; }
    for (let i = 0; i < n * .6; i++) { const u = rp(), x0 = tx + (u - .5) * bw * .16, ex = tx + (u - .5) * bw * .62 + (rp() - .5) * hp * .05, ey = top + rp() * hp * .1 + Math.abs(u - .5) * hp * .2;
      const lit = cl((1 - u) * .85 + (rp() - .5) * .3 + .1), c = sideC(C[Math.floor(lit * 7.99)], u);
      g += `<path d="M${F(x0)},${F(tie)} Q${F((x0 + ex) / 2)},${F((tie + ey) / 2)} ${F(ex)},${F(ey)}" stroke="${c}" stroke-width="${F(sw * .9)}" fill="none"/>`;
      if (hp > 120 && rp() < .5) for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k - 1) * .5 + (u - .5); g += `<path d="M${F(ex)},${F(ey)} l${F(Math.cos(a) * hp * .03)},${F(Math.sin(a) * hp * .03)}" stroke="${C[6]}" stroke-width="${F(sw * .6)}"/>`; } }
    const nl = Math.round(n * 1.1);
    for (let i = 0; i < nl; i++) { const y0 = py - Math.pow(rp(), .8) * (py - top) * .92, side = rp() < .5 ? -1 : 1, x0 = cxAt(y0) + side * hw(y0) * (.5 + rp() * .5);
      const Ll = hp * (.08 + rp() * .15), droop = .4 + rp() * .7, ex = x0 + side * Ll * (.6 + rp() * .35), ey = y0 + Ll * droop * .8 - Ll * .1;
      const cxp = x0 + side * Ll * .55, cyp = y0 - Ll * (.12 + rp() * .2), lw = Math.max(.8, hp * (.007 + rp() * .008));
      const lit = side < 0 ? .6 + rp() * .38 : .12 + rp() * .4, c = side > 0 ? mix(C[Math.floor(lit * 7.99)], FB, .25) : C[Math.floor(lit * 7.99)];
      g += `<path d="M${F(x0)},${F(y0)} Q${F(cxp)},${F(cyp)} ${F(ex)},${F(ey)} Q${F(cxp)},${F(cyp + lw * 2.2)} ${F(x0)},${F(y0 + lw * 1.6)}Z" fill="${c}"/>`;
      if (side > 0 || rp() < .3) g += `<path d="M${F(x0)},${F(y0)} Q${F(cxp)},${F(cyp)} ${F(ex)},${F(ey)}" stroke="${FW}" stroke-width="${F(Math.max(.4, lw * .4))}" fill="none" opacity="${NIGHT ? .4 : .6}"/>`; }
    const tw = hw(tie) * 1.1, tcx = cxAt(tie);
    g += `<path d="M${F(tcx - tw)},${F(tie - hp * .01)} Q${F(tcx)},${F(tie + hp * .025)} ${F(tcx + tw)},${F(tie - hp * .01)}" stroke="${fogC("#5a3e22", fog)}" stroke-width="${F(Math.max(.8, hp * .016))}" fill="none"/>`;
    g += `<path d="M${F(tcx - tw)},${F(tie - hp * .016)} Q${F(tcx)},${F(tie + hp * .018)} ${F(tcx + tw * .3)},${F(tie + hp * .006)}" stroke="${fogC("#c8b088", fog)}" stroke-width="${F(Math.max(.5, hp * .006))}" fill="none"/>`;
    return g; };

  /* ---------- trees (woodlots and fence-row trees): many lit leaf clumps ---------- */
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const GOLDR = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const OAK = ["#22281a", "#2e361c", "#3e4620", "#525a26", "#68702e", "#80843a", "#9c9c52", "#bab874"];
  const LDIR = NIGHT ? [.35, -.6] : [-.9, -.2];
  const broadleaf = (x, y, hp, RAMP, fog, n) => {
    const Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .032), ty = y - hp * .3;
    g += `<ellipse cx="${F(x + hp * .3)}" cy="${F(y + 1)}" rx="${F(hp * .42)}" ry="${F(Math.max(1, hp * .035))}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .5)},${F(ty)} L${F(x + tb * .5)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5a4c40")}"/>`;
    g += `<path d="M${F(x + tb * .1)},${F(y)} L${F(x + tb * .1)},${F(ty)} L${F(x + tb * .5)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#30261e")}"/>`;
    const cx = x, cy = y - hp * .58, rx = hp * .42, ry = hp * .38, cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * LDIR[0] + (py - cy) / ry * LDIR[1]) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.024 + r() * .024)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx + a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#fpLeafy)">${cg}</g>`; };
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1a1820", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .15), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(48, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) * LDIR[0] + (py - y + sz * .5) * LDIR[1] * .6, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    if (sz > 14) g += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - sz * .2)}" stroke="${mix(c, "#000000", .55)}" stroke-width="${F(Math.max(1, sz * .05))}"/>`;
    return g; };
  const pickRamp = q => q < .3 ? MAPLE : q < .55 ? GOLDR : q < .75 ? RUST : OAK;
  const treeFn = (hM, RAMP) => (px, py, kk, fog) => { const hp = hM * kk;
    return hp > 60 ? broadleaf(px, py, hp, RAMP, fog, Math.min(240, Math.round(hp * .6)))
      : hp > 26 ? `<g filter="url(#fpLeafy)">${clump(px, py, hp, fog * .9, RAMP)}</g>` : clump(px, py, Math.max(2.5, hp), fog * .9, RAMP); };
  const room = (x, z, y0) => (sy(y0, z) - capY(sx(x, z))) * z / FL;
  const plant = (x, z, hM, tag) => { if (z < 60) return; const y0 = hG(x, z), u = sx(x, z); if (u < -120 || u > W + 120) return;
    const rm = room(x, z, y0); if (rm < hM * .8) return; const h = Math.min(hM, rm);
    if (!seen(x, z, y0 + h * .7)) return;
    w.sprite({ x, z, y: y0 - .3, tag, fn: treeFn(h, pickRamp(r())) });
    const ub = h * (.28 + r() * .14), UR = r() < .5 ? OAK : RUST;
    w.sprite({ x: x + (r() - .5) * 3, z: z - .8, y: y0 - .2, tag, fn: (px, py, kk, fog) => clump(px, py, Math.max(2, ub * kk), Math.min(1, fog * .9 + .06), UR) }); };
  // a woodlot on the right, a hedgerow behind the field, a far tree line and scattered woods beyond
  const lot = (x, z) => N2(x / 340 + 2.7, z / 340) > -.05 + .1 * Math.sin(x / 80);
  for (let i = 0; i < 420; i++) { const x = 40 + r() * 260, z = 170 + Math.pow(r(), .7) * 260; if (N2(x / 110, z / 110 + 3) > -.25) plant(x, z, 13 + r() * 11, "far"); }
  for (let i = 0; i < 160; i++) { const x = -260 + r() * 300; if (Math.sin(x / 19) > -.1) plant(x, 300 + r() * 14, 10 + r() * 9, "far"); }
  for (let i = 0; i < 1500; i++) { const z = 520 + r() * 1300, x = (r() - .5) * 1.4 * z; if (lot(x, z)) plant(x, z, 13 + r() * 13, "far"); }

  /* ---------- the farm across the field: white farmhouse, windpump, a slatted corn crib ---------- */
  { const hr = rng(seed + 61);
    w.house({ ...w.randomHouse(hr, { x: -88, z: 262, yaw: 18, rng: hr, kind: "farm" }), wall: "#f2ece0", roof: "#3e4048", h: 6.0, rh: 3.6, w: 10, d: 7.5, roof3: "gable", gable: false, porch: true, chim: .78, shut: "#2a3a32", tag: "far" });
    w.house({ x: -66, z: 280, yaw: -12, w: 7, d: 4, h: 3.6, rh: 1.6, wall: "#8a6a4a", roof: "#6a6e72", trim: "#6a5040", clap: false, winGap: 9, door: .5, doorC: "#5a4030", rng: hr, tag: "far",
      extra: (n, q, len) => { if (n !== "front") return; for (let u = .3; u < len - .2; u += .35) q(u, .3, u + .12, 3.3, "#4a3828", { off: .06 }); } });
    // windpump: a four-legged lattice tower with the wheel and vane at the top
    const tx = -75, tz = 252, th = 11;
    [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]].forEach(([dx, dz]) => w.line([[tx + dx, 0, tz + dz], [tx + dx * .15, th, tz + dz * .15]], "#5a5e64", .12, { bias: 0 }));
    for (let k = 1; k < 5; k++) { const y = th * k / 5, s0 = 1.1 * (1 - .85 * k / 5);
      w.line([[tx - s0, y, tz - s0], [tx + s0, y, tz - s0]], "#5a5e64", .07); }
    w.sprite({ x: tx, z: tz - .3, y: th, fn: (px, py, k, fog) => { const R = 1.5 * k, C = fogC("#6a6e74", fog), C2 = fogC("#9aa0a6", fog); let g = "";
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; g += `<path d="M${F(px)},${F(py)} L${F(px + Math.cos(a) * R)},${F(py + Math.sin(a) * R)}" stroke="${i % 2 ? C : C2}" stroke-width="${F(Math.max(.8, k * .16))}"/>`; }
      g += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(R)}" fill="none" stroke="${C}" stroke-width="${F(Math.max(.6, k * .08))}"/><path d="M${F(px)},${F(py)} L${F(px + R * 1.5)},${F(py - R * .1)} L${F(px + R * 1.9)},${F(py - R * .5)} L${F(px + R * 1.9)},${F(py + R * .3)} L${F(px + R * 1.5)},${F(py + R * .1)}Z" fill="${C}"/>`;
      return g; } });
  }

  /* ---------- the field of shocks and the pumpkins scattered through the patch ---------- */
  const SHX = -.35, SHZ = 16.5;
  for (let j = 0; j < 9; j++) for (let i = -9; i <= 9; i++) {
    const z = 26 + j * 15 + (rp() - .5) * 5, x = i * 7.5 + (rp() - .5) * 3 + j * 2.1;
    if (Math.abs(x / z) > .6 || rp() < .22) continue;
    const px = sx(x, z); if (Math.abs(px - 1235) < 190 && z < 40) continue;
    const hM = 2.2 + rp() * .45; if (sy(hM, z) < capY(px) + 4) continue;
    w.sprite({ x, z, y: hG(x, z) - .05, tag: "mid", fn: (px2, py, k, fog) => shock(px2, py, hM * k, fog) }); }
  // the hero shock behind the pumpkin group
  w.sprite({ x: SHX, z: SHZ, y: 0, fn: (px, py, k, fog) => shock(px, py, 2.55 * k, fog) });
  // scattered pumpkins on their vines, thinning with distance
  const scat = [];
  for (let i = 0; i < 250; i++) { const z = 12.8 + Math.pow(rg(), 1.4) * 90, x = (rg() - .5) * 1.25 * z;
    if (Math.abs(sx(x, z) - 1240) < 120 && z < 18) continue; scat.push([x, z]); }
  scat.forEach(([x, z]) => { const sz = .26 + rp() * .2, RAMP = pickPumpkin(), a = rp() * 6, lr = .3 + rp() * .2;
    w.sprite({ x: x + .3, z: z + .25, y: 0, fn: (px, py, k, fog) => leaf(px, py, lr * k, fog, a, .32) });
    w.sprite({ x, z, y: 0, fn: (px, py, k, fog) => pumpkin(px, py, sz * k / 2, fog, RAMP, false) }); });
  // vines: curling runners across the frosted ground
  for (let i = 0; i < 70; i++) { const z0 = 9 + Math.pow(rg(), 1.3) * 40, x0 = (rg() - .5) * 1.1 * z0; const pts = [];
    let x = x0, z = z0, a = rg() * 6;
    for (let k = 0; k < 8; k++) { pts.push([x, .03, z]); a += (rg() - .5) * 1.8; x += Math.cos(a) * .16 * z0 / 12; z += Math.sin(a) * .3; }
    w.line(pts, mix("#5a5a34", "#9aa4a0", .35), .025, { min: .5, bias: .3 }); }

  /* ---------- the group at the front: a giant, a jack-o'-lantern, field pumpkins, leaves ---------- */
  const group = [[.95, 11.4, .9, GIANT, false, .64, 7], [-1.15, 10.7, .4, ORG, true], [-.35, 11.9, .44, DEEP, false], [2.1, 12.4, .36, ORG, false],
    [-2.2, 12.0, .34, WHT, false], [.15, 10.4, .3, ORG, false], [-1.7, 13.0, .42, ORG, false], [1.9, 10.9, .26, GRN, false], [-.75, 13.6, .3, DEEP, false]];
  // leaves and a tangle of vine around them first, so the pumpkins sit on top
  for (let i = 0; i < 60; i++) { const z = 9.6 + rg() * 4.8, x = -2.8 + rg() * 5.6, a = rg() * 6, lr = .22 + rg() * .2;
    w.sprite({ x, z, y: .02, bias: .4, fn: (px, py, k, fog) => leaf(px, py, lr * k, fog, a, .3) }); }
  for (let i = 0; i < 14; i++) { const pts = []; let x = -2.6 + rg() * 5.2, z = 9.8 + rg() * 4, a = rg() * 6;
    for (let k = 0; k < 7; k++) { pts.push([x, .04, z]); a += (rg() - .5) * 2; x += Math.cos(a) * .1; z += Math.sin(a) * .2; }
    w.line(pts, mix("#5e5a30", "#a8b0a8", .3), .022, { min: .6, bias: .2 });
    // curly tendrils
    const [ex, , ez] = pts[pts.length - 1]; w.sprite({ x: ex, z: ez, y: .05, bias: .1, fn: (px, py, k, fog) => {
      const R = .06 * k; return `<path d="M${F(px)},${F(py)} q${F(R)},${F(-R)} ${F(R * .4)},${F(-R * 1.6)} q${F(-R * .8)},${F(-R * .2)} ${F(-R * .3)},${F(-R * .9)}" stroke="${fogC("#6a6838", fog)}" stroke-width="${F(Math.max(.6, k * .006))}" fill="none"/>`; } }); }
  group.forEach(([x, z, sz, RAMP, jack, sq, nr]) => w.sprite({ x, z, y: 0, fn: (px, py, k, fog) => pumpkin(px, py, sz * k / 2 * (sq ? 1.45 : 1), fog, RAMP, jack, sq, nr) }));
  // the giant's thick curled stem
  { const p = w.proj([.95, .9 * .64 * 1.45 + .02, 11.4]), k = FL / 11.4;
    s; w.sprite({ x: .95, z: 11.35, y: 0, bias: -.2, fn: () => `<path d="M${F(p[0] - k * .05)},${F(p[1] + k * .04)} q${F(k * .02)},${F(-k * .14)} ${F(k * .12)},${F(-k * .18)} q${F(k * .1)},${F(-k * .02)} ${F(k * .14)},${F(k * .06)} l${F(-k * .04)},${F(k * .02)} q${F(-k * .06)},${F(-k * .06)} ${F(-k * .1)},${F(-k * .02)} q${F(-k * .06)},${F(k * .04)} ${F(-k * .06)},${F(k * .16)}Z" fill="${T("#5a5a32")}"/><path d="M${F(p[0] - k * .05)},${F(p[1] + k * .02)} q${F(k * .02)},${F(-k * .14)} ${F(k * .12)},${F(-k * .18)}" stroke="${T(FROST)}" stroke-width="${F(k * .01)}" fill="none" opacity=".6"/>` }); }

  /* ---------- the zig-zag rail fence running away on the right, with crows ---------- */
  const FA = [8.6, 38], FB = [60, 150], FLn = Math.hypot(FB[0] - FA[0], FB[1] - FA[1]), FU = [(FB[0] - FA[0]) / FLn, (FB[1] - FA[1]) / FLn], FP = [-FU[1], FU[0]];
  const fenceAt = t => [FA[0] + FU[0] * t, FA[1] + FU[1] * t];
  { const pts = [];
    for (let t = 0, i = 0; t <= FLn; t += 2.9, i++) { const [x, z] = fenceAt(t), o = i % 2 ? .65 : -.65; pts.push([x + FP[0] * o, z + FP[1] * o]); }
    for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
      for (let k = 0; k < 5; k++) { const y = .12 + k * .24 + (i % 2) * .12, c = ["#7a7266", "#8a8274", "#6a645a", "#948a7a"][(i + k) % 4];
        w.line([[x0 - (x1 - x0) * .08, y, z0 - (z1 - z0) * .08], [x1 + (x1 - x0) * .08, y + (rp() - .5) * .06, z1 + (z1 - z0) * .08]], c, .11, { min: .6 });
        w.line([[x0, y + .06, z0], [x1, y + .06, z1]], FROST, .035, { min: .4, op: .75 }); } }
    // crows on the top rail
    [[1.5, 1], [2.6, .9], [13, 1.05], [27, .95]].forEach(([t, kk]) => { const [x, z] = fenceAt(t); w.sprite({ x, z: z - .3, y: 1.32, bias: -1, fn: (px, py, k, fog) => {
      const m = v => v * k * .5 * kk, C = fogC("#16161c", fog);
      return `<path d="M${F(px - m(.3))},${F(py - m(.2))} q${F(m(.1))},${F(-m(.25))} ${F(m(.42))},${F(-m(.24))} l${F(m(.14))},${F(-m(.03))} l${F(-m(.08))},${F(m(.09))} q${F(m(.03))},${F(m(.16))} ${F(-m(.12))},${F(m(.2))} l${F(-m(.2))},${F(m(.06))}Z" fill="${C}"/><path d="M${F(px - m(.02))},${F(py - m(.06))} l0,${F(m(.06))} M${F(px + m(.06))},${F(py - m(.06))} l0,${F(m(.06))}" stroke="${C}" stroke-width="${F(Math.max(.5, m(.02)))}"/>`; } }); });
    if (NIGHT) { const [x, z] = fenceAt(5.8); w.sprite({ x, z: z - .5, y: 1.25, bias: -1.2, fn: (px, py, k) => `<circle cx="${F(px)}" cy="${F(py - k * .2)}" r="${F(k * 1.6)}" fill="url(#fpGlow)"/><rect x="${F(px - k * .08)}" y="${F(py - k * .32)}" width="${F(k * .16)}" height="${F(k * .24)}" rx="${F(k * .03)}" fill="#ffe2a0"/><path d="M${F(px)},${F(py - k * .32)} l0,${F(-k * .08)}" stroke="#2a2a2a" stroke-width="1"/>` }); }
  }

  /* ---------- frosted grass among the vines ---------- */
  for (let k = 0, n = 0; k < 9000 && n < 8000; k++) {
    const z = 4.5 + Math.pow(r(), .6) * 34, x = (r() - .5) * 1.3 * z; n++;
    const len = .025 + r() * .045;
    w.sprite({ x, z, y: 0, bias: .05, fn: (px, py, k2) => { const L = len * k2, Cs = ["#7a8452", "#9a9660", "#6a7448", "#b0a46a"]; let g = "";
      for (let b = 0; b < 3; b++) { const bend = (r() - .5) * L * .8, x0 = px + (r() - .5) * L * .6, c = T(mix(Cs[Math.floor(r() * Cs.length)], bend < 0 && !NIGHT ? RIM : FROSTB, .25));
        g += `<path d="M${F(x0)},${F(py)} q${F(bend * .3)},${F(-L * .55)} ${F(bend)},${F(-L)}" stroke="${c}" stroke-width="${F(Math.max(.7, L * .08))}" fill="none" stroke-linecap="round"/>`;
        if (L > 3) g += `<path d="M${F(x0 + bend * .55)},${F(py - L * .7)} q${F(bend * .2)},${F(-L * .15)} ${F(bend * .45)},${F(-L * .3)}" stroke="${T(FROST)}" stroke-width="${F(Math.max(.6, L * .06))}" fill="none" stroke-linecap="round" opacity=".8"/>`; }
      return g; } }); }

  /* ---------------- assemble ---------------- */
  const isFar = o => o === far, isNear = o => o === near, isFarObj = o => !o.raster && o.tag === "far", isMid = o => !o.raster && o.tag === "mid", rest = o => !o.raster && o.tag !== "far" && o.tag !== "mid";
  s += `<rect x="0" y="${WY - 2}" width="${W}" height="${H - WY + 2}" fill="${T("#d8d4d0")}"/>`;
  s += w.draw({ where: isFar });
  s += `<rect x="0" y="${WY - 50}" width="${W}" height="70" fill="url(#fpHaze)" opacity=".55"/>`;
  s += w.draw({ where: isNear });
  s += w.draw({ where: isFarObj });
  // ground mist lying along the bottomland in front of the woods
  s += `<g filter="url(#fpBlur8)" opacity="${NIGHT ? .45 : .6}">`;
  for (let i = 0; i < 26; i++) { const x = rs() * W, y = WY + 2 + rs() * 12, rx = 140 + rs() * 260;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(rx)}" ry="${F(5 + rs() * 7)}" fill="url(#fpMist)"/>`; }
  s += `</g>`;
  // long cast shadows: the sun is low off the left (blue frost behind each thing); the moon at night is ahead and right
  { const L = LIGHT, hz = Math.hypot(L[0], L[2]), dx = -L[0] / hz, dz = -L[2] / hz, len = H0 => H0 * hz / L[1], px = -dz, pz = dx;
    const shadow = (x, z, hw, H0, tip) => { const e = len(H0), P = [[x + px * hw, z + pz * hw], [x + dx * e + px * hw * tip, z + dz * e + pz * hw * tip], [x + dx * e - px * hw * tip, z + dz * e - pz * hw * tip], [x - px * hw, z - pz * hw]];
      return "M" + P.map(([a, b]) => { const q = w.proj([a, .02, Math.max(2.6, b)]); return F(q[0]) + "," + F(q[1]); }).join("L") + "Z"; };
    const c = NIGHT ? "#02040c" : "#5a6c9c", op = NIGHT ? .45 : .32;
    s += `<g filter="url(#fpBlur2)" fill="${c}" opacity="${op}"><path d="${shadow(SHX, SHZ, .9, 2.55, .15)}"/>`;
    group.forEach(([x, z, sz, , , sq]) => s += `<path d="${shadow(x, z, sz * (sq ? .65 : .5), sz * (sq ? .95 : .8), .5)}"/>`);
    s += `</g>`; }
  s += w.draw({ where: isMid });
  s += w.draw({ where: rest });
  if (NIGHT) {   // frost glitter under the moon
    for (let i = 0; i < 500; i++) { const y = WY + 10 + Math.pow(rs(), .7) * (H - WY - 10), x = rs() * W;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(.5 + rs() * .9 * (y - WY) / 300)}" fill="#e8f0ff" opacity="${F(.2 + rs() * .5)}"/>`; }
  }
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#fpLight)" style="mix-blend-mode:soft-light" opacity=".8"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#fpPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
