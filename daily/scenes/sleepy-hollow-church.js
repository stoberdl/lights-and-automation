/* Sleepy Hollow Church: the Old Dutch Church of Sleepy Hollow, New York
   (1685-97), in October. Standing in its burying ground, the camera looks up
   a gravel path between leaning slate, brownstone and marble headstones to the
   fieldstone church: Flemish gambrel roof, clapboarded gable, arched door and
   windows, an open octagonal belfry with its bell and weathervane. A fieldstone
   wall runs away up the left side; old maples and oaks stand over the graves;
   the burying ground climbs a knoll behind the church into the Pocantico
   woods, with the blue Hudson Highlands beyond. Morning: the sun is low off
   the right edge, mist lies in the hollow, crows go over.
   opts.time === "night": a young crescent moon low on the right, stars, bats,
   the church lit for a lantern tour, jack-o'-lanterns on the steps and the
   wall, ground mist between the stones.
   The land is one world3d() raster (reference/scene-helpers.js); the church,
   wall, headstones and trees are placed in metres by the same camera.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function sleepyHollowChurchArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 4417;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17), rp = rng(seed + 29), rg = rng(seed + 41);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const MOX = 1700, MOY = 266;   // the crescent: just clear of the woods and of the headline corner
  const LX = NIGHT ? MOX : 2720, LY = NIGHT ? MOY : 190, WY = 440;
  const T = c => NIGHT ? mix(mix(c, "#76788e", .4), "#0a0e2a", .6) : c;
  const HZ = NIGHT ? "#262a50" : "#e2dccc", RIM = NIGHT ? "#b8c4ec" : "#fff0c8", LAMP = "#ffb44a", SHADE = NIGHT ? "#04050e" : "#3a3450";
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
  const STONES = [["#363a44", "#4e535e", "#727884"], ["#5a3a30", "#86574a", "#a87862"], ["#9a968c", "#cac6ba", "#eeeadf"], ["#5a564e", "#7e7a70", "#a29d90"]];

  /* ---------------- sky: clear autumn morning, or a crescent-moon night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#05061a"/><stop offset=".45" stop-color="#0e1236"/><stop offset=".82" stop-color="#20264e"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#4c76ae"/><stop offset=".4" stop-color="#86a8cc"/><stop offset=".76" stop-color="#cdd4d2"/><stop offset="1" stop-color="#f0e2c4"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#c8c8e8" stop-opacity=".2"/><stop offset=".25" stop-color="#8a8ac0" stop-opacity=".08"/><stop offset="1" stop-color="#7a6aa8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff4cc" stop-opacity=".95"/><stop offset=".2" stop-color="#ffe2a8" stop-opacity=".5"/><stop offset=".6" stop-color="#ffd09a" stop-opacity=".14"/><stop offset="1" stop-color="#ffd09a" stop-opacity="0"/>`;
  let s = `<defs id="shcdefs">
    <linearGradient id="shcSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="shcLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 900 : 1600}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="shcHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".75"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="shcGlow"><stop offset="0" stop-color="#ffd890" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".4"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="shcMoonG"><stop offset="0" stop-color="#f4ecd0" stop-opacity=".5"/><stop offset=".3" stop-color="#c8c8e8" stop-opacity=".12"/><stop offset="1" stop-color="#c8c8e8" stop-opacity="0"/></radialGradient>
    ${STONES.map((c, i) => `<linearGradient id="shcSt${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T(c[0])}"/><stop offset=".5" stop-color="${T(c[1])}"/><stop offset="1" stop-color="${T(c[2])}"/></linearGradient>`).join("")}
    <mask id="shcMoonM"><circle cx="${MOX}" cy="${MOY}" r="15" fill="#fff"/><circle cx="${MOX - 7}" cy="${MOY - 8}" r="15" fill="#000"/></mask>
    <filter id="shcLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="shcCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".015" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.4"/></filter>
    <filter id="shcPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="shcSoft"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="shcMist"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shcSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 750; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 400, big = rs() < .07;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.25 + rs() * .6 * (1 - y / 440))}"/>`; }
    s += `<path d="M200,0 C800,140 1600,220 2560,260" stroke="#8a90c8" stroke-width="170" fill="none" opacity=".05" filter="url(#shcSoft)"/>`;
    s += `<rect width="${W}" height="${H}" fill="url(#shcLight)"/>`;
    // a four-day crescent, lit edge toward the sun below the horizon; earthshine on the rest
    s += `<circle cx="${MOX}" cy="${MOY}" r="110" fill="url(#shcMoonG)"/><circle cx="${MOX}" cy="${MOY}" r="15" fill="#6a6c8a" opacity=".35"/><circle cx="${MOX}" cy="${MOY}" r="15" fill="#f6eed6" mask="url(#shcMoonM)"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#shcLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#shcSoft)">`;
    for (let k = 0; k < 6; k++) { const a = Math.PI + .02 + k * .07, L = 2000;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: soft fair-weather heaps lit from the right; crows or bats ---------------- */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#shcCloudy)">`;
    const lobes = [];
    for (let k = 0; k < 12; k++) { const t = k / 11; lobes.push([x + (t - .5) * w * (.9 + rs() * .2), y - Math.sin(t * Math.PI) * w * (.08 + rs() * .07), w * (.07 + rs() * .06)]); }
    if (NIGHT) {
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#141838"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.3)}" ry="${F(R * .6)}" fill="#1a1e44"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .35)}" cy="${F(ly - R * .15)}" rx="${F(R * .8)}" ry="${F(R * .3)}" fill="#3a4072" opacity=".55"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .56)}" ry="${F(w * .04)}" fill="#a6b2c6"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .2)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.25)}" ry="${F(R * .75)}" fill="#c6d0dc"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .1)}" cy="${F(ly - R * .05)}" rx="${F(R * 1.05)}" ry="${F(R * .65)}" fill="#eef0f0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .4)}" cy="${F(ly - R * .25)}" rx="${F(R * .55)}" ry="${F(R * .34)}" fill="#fff8e6"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(430, 150, 520, "drift1") + cloud(1130, 64, 360, "drift2") + cloud(1990, 128, 560, "drift3") + cloud(2430, 236, 260, "drift1") + cloud(700, 262, 240, "drift2");
  if (NIGHT) {   // bats round the belfry
    s += `<g class="birds">`;
    [[1040, 120, 1.8], [1110, 196, 1.3], [1190, 92, 1.2], [1250, 222, 1.5], [1300, 70, 1.0], [1470, 120, 1.4], [1520, 290, 1.0], [980, 230, 1.1]].forEach(([x, y, k], i) => {
      const fl = i % 2 ? -1 : 1, wy = fl * 1.5 * k;
      const wing = sd => `M${F(x + sd * 1 * k)},${F(y - k)} Q${F(x + sd * 6 * k)},${F(y - 6 * k - wy)} ${F(x + sd * 12 * k)},${F(y - 3 * k - wy)} Q${F(x + sd * 10 * k)},${F(y)} ${F(x + sd * 9 * k)},${F(y + 1.2 * k)} Q${F(x + sd * 7.5 * k)},${F(y - .6 * k)} ${F(x + sd * 6 * k)},${F(y + 1.6 * k)} Q${F(x + sd * 4 * k)},${F(y - .2 * k)} ${F(x + sd * 1 * k)},${F(y + 1.2 * k)}Z`;
      s += `<path d="${wing(-1)} ${wing(1)}" fill="#05050c" opacity=".9"/><ellipse cx="${x}" cy="${F(y)}" rx="${F(1.6 * k)}" ry="${F(2.6 * k)}" fill="#05050c"/>`; });
    s += `</g>`;
  } else {       // crows going over
    s += `<g class="birds" fill="none" stroke="#2a2630" stroke-width="2.3" stroke-linecap="round" opacity=".8">`;
    [[1150, 70, 1], [1186, 52, .9], [1222, 82, .85], [1262, 60, .8], [1120, 96, .7]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 12 * k)},${F(y - 2 * k)} q${F(6 * k)},${F(-6 * k)} ${F(12 * k)},${F(2 * k)} q${F(5 * k)},${F(-6 * k)} ${F(12 * k)},${F(-2 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 1.7 m above the burying ground, horizon on WY; metres, x right, y up, z away.
     The church stands at (CX, CZ) turned CYAW so its west gable faces down the path and its
     long north wall shows toward the centre. */
  const EYE = 1.7, FL = 1900;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [.75, .35, -.25] : [.7, .48, -.45], tone: T, fog: HZ, fogK: .00022,
    shadow: SHADE, rim: RIM, shade: .5, hi: .26, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const CX = 3, CZ = 90, CYAW = 18, CG = 1.0, MW = 13, MD = 17, MH = 6.4, MRH = 6.2;
  const ca = Math.cos(CYAW * Math.PI / 180), sa = Math.sin(CYAW * Math.PI / 180);
  const toLocal = (x, z) => { const dx = x - CX, dz = z - CZ; return [dx * ca + dz * sa, -dx * sa + dz * ca]; };
  const toWorld = (lx, lz) => [CX + lx * ca - lz * sa, CZ + lx * sa + lz * ca];
  const DOOR = toWorld(0, -MD / 2 - 1.6);
  const pathX = z => { const t = (z - 10) / (DOOR[1] - 10); return .4 + (DOOR[0] - .4) * t + 2.4 * Math.sin(Math.PI * t); };
  const wallX = z => -6.5 - 17 * (z - 10) / 150 + .5 * N1(z / 20, 1.7);
  const yLim = u => 292 - 70 * Math.exp(-(((u - .03) / .26) ** 2)) + 8 * Math.sin(u * 13 + .7);
  const capH = (x, z) => EYE + (WY - yLim(x / z)) * z / FL * (.93 + .07 * N3(x / 160, z / 160));
  const MF = mountainField({ seed: 1777, scale: 2400, oct: 6, peaks: [
    { x: -3800, z: 5200, h: 480, rx: 2600, rz: 1500 }, { x: -200, z: 6800, h: 900, rx: 1500, rz: 2600 }, { x: 4200, z: 5600, h: 520, r: 2200 }, { x: -1500, z: 9000, h: 1100, r: 3200 } ] });
  const hT = (x, z) => {
    let h = .9 * sm((z - 14) / 60) + .25 * N2(x / 22, z / 22) * sm(z / 30);
    const [lx, lz] = toLocal(x, z), pad = sm(Math.max(Math.abs(lx) - MW / 2 - 1, Math.abs(lz) - MD / 2 - 1) / 10);
    h = CG + (h - CG) * pad;                                                            // the church's level pad
    h += 12 * sm((z - 100) / 150) * (.75 + .35 * N1(x / 80, z / 80));                  // the knoll behind it
    h += 42 * sm((z - 230) / 600) * (.7 + .5 * N2(x / 260, z / 260)) + 7 * N3(x / 90, z / 90) * sm((z - 260) / 200);   // the wooded hills
    if (z > 1800) { const far = MF(x, z) * sm((z - 1800) / 2600); if (far > h) h = far; }
    return Math.max(.02, Math.min(h, capH(x, z))); };       // never below 0: the raster would read it as water and leave a hole
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;

  /* trees standing over the graves (x, z, height m, ramp) */
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const GOLD = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const OAK = ["#2a2a14", "#3a3a18", "#4e4a1e", "#646024", "#7a722c", "#94863a", "#ae9e52", "#c8bc78"];
  const TREES = [[-10, 78, 15, MAPLE], [19, 118, 11, GOLD], [-26, 125, 12, RUST], [30, 96, 9, OAK], [-38, 110, 9, GOLD]];

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const FOR = ["#3a4a2a", "#4e4c26", "#b8662a", "#9a3020", "#d09a32", "#7e3c20", "#dc7e2c"].map(H3);
  const GR1 = H3("#7a8a46"), GR2 = H3("#9e9c52"), GR3 = H3("#5e6e38"), GRAV = H3("#b6a688"), LEAF = H3("#c8642a"), LEAF2 = H3("#d89a36"), BLUE = H3("#5a6a8a");
  const woods = (x, z) => { const k = N1(x / 30, z / 30) * .5 + .5, t = N2(x / 6, z / 6) * .5 + .5;
    let c = L3(FOR[0], FOR[1], k);
    c = L3(c, FOR[2 + Math.floor(hash(Math.floor(x / 18), Math.floor(z / 18)) * 5)], sm((N3(x / 45 + 4, z / 45) + .25) / .45) * .9);
    return c.map(v => v * (.74 + .5 * t)); };
  const lawn = (x, z) => z < 225 + 30 * N1(x / 50, 3.1);
  const col = (x, y, z, n) => {
    if (z > 2200) return L3(woods(x, z), BLUE, .45 + sm((z - 2200) / 3000) * .45);
    if (!lawn(x, z)) return woods(x, z);
    let c = L3(GR1, GR2, .5 + .6 * N2(x / 9, z / 9)); c = L3(c, GR3, .5 * N3(x / 2.5, z / 2.5) + .2);
    const lf = Math.max(...TREES.map(([tx, tz, hm]) => sm(1 - Math.hypot(x - tx, z - tz) / (hm * .6)))), wl = sm(1 - Math.abs(x - wallX(z)) / 3) * (z < 160 ? 1 : 0);
    const lk = Math.max(lf, wl * .8) * (.6 + .5 * N1(x / 3, z / 3));
    if (lk > 0) c = L3(c, N2(x / 4, z / 4) > 0 ? LEAF : LEAF2, lk);
    if (z > 10 && z < DOOR[1] + .6) { const pd = Math.abs(x - pathX(z)); if (pd < 1.2) c = L3(GRAV.map(v => v * (.9 + .15 * N1(x * 1.3, z * 1.3))), c, sm((pd - .85 - .15 * N3(z / 2, x)) / .3)); }
    return c; };
  w.raster({ z0: 10, z1: 16000, step: .0011, minStep: .15, scale: .75, top: 200, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00014, amb: NIGHT ? .55 : .42, noRefl: true });

  /* ---------- 2D drawings placed as sprites ---------- */
  const broadleaf = (x, y, hp, RAMP, fog, n) => {     // trunk, limbs and a crown of many lit leaf clumps
    const sd = LX < x ? -1 : 1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .03), ty = y - hp * .22;
    g += `<ellipse cx="${F(x - hp * .14)}" cy="${F(y + 1)}" rx="${F(hp * .32)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .55)},${F(ty)} L${F(x + tb * .55)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5a4a3a")}"/>`;
    g += `<path d="M${F(x - sd * tb * .1)},${F(y)} L${F(x - sd * tb * .1)},${F(ty)} L${F(x - sd * tb * .55)},${F(ty)} L${F(x - sd * tb)},${F(y)}Z" fill="${Tf("#3a2e24")}"/>`;
    for (let k = 0; k < 4; k++) { const a = -1.2 + k * .8 + (r() - .5) * .3; g += `<path d="M${F(x)},${F(ty + hp * .05)} L${F(x + Math.sin(a) * hp * .22)},${F(ty - Math.cos(a) * hp * .2)}" stroke="${Tf("#4a3c30")}" stroke-width="${F(Math.max(.8, tb * .5))}"/>`; }
    const cx = x, cy = y - hp * .56, rx = hp * .4, ry = hp * .36, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.026 + r() * .026)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx - sd * a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#shcLeafy)">${cg}</g>`; };
  /* a small far tree: a dark irregular mass with shaded, mid and lit clumps (lit on the right) */
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1e1008", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(48, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) + (y - sz * .5 - py) * .6, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };
  /* a headstone: slate, brownstone, marble or fieldstone, shouldered tympanum top, leaning a little,
     lit from the right, with lichen, a carved death's head or urn and worn lettering */
  const headstone = (px, py, kk, fog, o) => {
    const wd = o.w * kk, ht = o.h * kk, sdv = px > 1280 ? -1 : 1;
    if (ht < 1.5) return `<rect x="${F(px - wd / 2)}" y="${F(py - ht)}" width="${F(Math.max(.6, wd))}" height="${F(Math.max(.6, ht))}" fill="${T(mix(STONES[o.m][1], HZ, fog))}"/>`;
    let g = `<ellipse cx="${F(px - wd * .1)}" cy="${F(py)}" rx="${F(wd * .75)}" ry="${F(Math.max(.8, wd * .12))}" fill="#000" opacity=".28"/>`;
    g += `<path d="M${F(px - wd / 2)},${F(py)} L${F(px + wd / 2)},${F(py)} L${F(px - wd * .25)},${F(py - Math.max(1, ht * .16))} L${F(px - wd * 1.2)},${F(py - Math.max(1, ht * .16))}Z" fill="#000" opacity=".14"/>`;
    const a = wd / 2, sh = ht * (o.ob ? .82 : .76);
    const shape = o.ob
      ? `M${F(-a * .6)},0 L${F(-a * .42)},${F(-sh)} L0,${F(-ht)} L${F(a * .42)},${F(-sh)} L${F(a * .6)},0Z`
      : `M${F(-a)},0 L${F(-a)},${F(-sh)} Q${F(-a)},${F(-sh - ht * .08)} ${F(-a * .7)},${F(-sh - ht * .07)} C${F(-a * .6)},${F(-ht * 1.02)} ${F(a * .6)},${F(-ht * 1.02)} ${F(a * .7)},${F(-sh - ht * .07)} Q${F(a)},${F(-sh - ht * .08)} ${F(a)},${F(-sh)} L${F(a)},0Z`;
    g += `<g transform="translate(${F(px)},${F(py)}) rotate(${F(o.tilt)})">`;
    const th = Math.max(.6, .1 * kk);   // the edge facing the centre
    g += `<path d="${shape}" fill="${T(mix(STONES[o.m][0], HZ, fog))}" transform="translate(${F(sdv * th)},${F(-th * .3)})"/>`;
    g += `<path d="${shape}" fill="url(#shcSt${o.m})"/>`;
    if (wd > 12) {
      const ink = T(mix(STONES[o.m][0], "#000000", .35));
      if (!o.ob) { const my = -sh + ht * .02;   // the tympanum carving: a winged death's head or an urn
        g += `<circle cx="0" cy="${F(my)}" r="${F(wd * .09)}" fill="none" stroke="${ink}" stroke-width="${F(Math.max(.6, wd * .02))}" opacity=".45"/>`;
        g += `<path d="M${F(-wd * .1)},${F(my)} q${F(-wd * .14)},${F(-wd * .1)} ${F(-wd * .28)},${F(wd * .02)} M${F(wd * .1)},${F(my)} q${F(wd * .14)},${F(-wd * .1)} ${F(wd * .28)},${F(wd * .02)}" stroke="${ink}" stroke-width="${F(Math.max(.6, wd * .02))}" fill="none" opacity=".4"/>`;
        g += `<path d="M${F(-a * .8)},${F(-sh + ht * .1)} L${F(a * .8)},${F(-sh + ht * .1)}" stroke="${ink}" stroke-width="${F(Math.max(.5, wd * .012))}" opacity=".3"/>`; }
      for (let i = 0; i < 4; i++) { const yy = -ht * (.62 - i * .1), hw = a * (.55 - i * .06) * (.8 + rg() * .3);
        g += `<path d="M${F(-hw)},${F(yy)} L${F(hw)},${F(yy)}" stroke="${ink}" stroke-width="${F(Math.max(.5, ht * .022))}" opacity="${F(.18 + rg() * .14)}" stroke-dasharray="${F(wd * .05)} ${F(wd * .025)}"/>`; }
      for (let i = 0; i < 5; i++) g += `<path d="${blobP((rg() - .5) * wd * .8, -rg() * ht * .9, wd * (.04 + rg() * .06), wd * (.03 + rg() * .05), 6, rg)}" fill="${T(rg() < .5 ? "#b8a050" : "#8a9a74")}" opacity=".45"/>`;
    }
    g += `</g>`;
    if (ht > 8) for (let i = 0; i < 7; i++) { const gx = px + (rg() - .5) * wd * 1.2, hh = ht * (.05 + rg() * .1);
      g += `<path d="M${F(gx)},${F(py + 1)} q${F((rg() - .5) * hh)},${F(-hh * .6)} ${F((rg() - .5) * hh * .8)},${F(-hh)}" stroke="${T(rg() < .5 ? "#6a7a3a" : "#9a9a52")}" stroke-width="${F(Math.max(.6, ht * .012))}" fill="none"/>`; }
    if (fog > .02) g = `<g>${g}</g>`;
    return g; };
  const pumpkin = (px, py, kk, sz, carved) => { const R = Math.max(2.2, sz * kk), cy = py - R * .82;
    const body = T(["#d86a1c", "#e07a24", "#c85a18", "#e88a2c"][Math.floor(rp() * 4)]);
    let g = `<ellipse cx="${F(px - R * .3)}" cy="${F(py)}" rx="${F(R * 1.3)}" ry="${F(R * .22)}" fill="#000" opacity=".3"/>`;
    if (carved && NIGHT) g += `<circle cx="${F(px)}" cy="${F(cy)}" r="${F(R * 5)}" fill="url(#shcGlow)" opacity=".55"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R * 1.15)}" ry="${F(R * .86)}" fill="${body}"/>`;
    g += `<ellipse cx="${F(px - R * .25)}" cy="${F(cy + R * .05)}" rx="${F(R * .8)}" ry="${F(R * .8)}" fill="${mix(body, "#3a1408", .35)}" opacity=".55"/>`;
    g += `<ellipse cx="${F(px + R * .35)}" cy="${F(cy - R * .1)}" rx="${F(R * .45)}" ry="${F(R * .65)}" fill="${mix(body, NIGHT ? "#ff9a40" : "#ffd28a", .4)}" opacity=".7"/>`;
    g += `<path d="M${F(px)},${F(cy - R * .8)} q${F(R * .1)},${F(-R * .4)} ${F(R * .35)},${F(-R * .5)}" stroke="${T("#4a5a24")}" stroke-width="${F(Math.max(1, R * .22))}" fill="none" stroke-linecap="round"/>`;
    if (carved) { const fc = NIGHT ? "#ffe07a" : "#5a2a0a";
      g += `<path d="M${F(px - R * .55)},${F(cy - R * .05)} l${F(R * .2)},${F(-R * .32)} l${F(R * .2)},${F(R * .32)}Z M${F(px + R * .15)},${F(cy - R * .05)} l${F(R * .2)},${F(-R * .32)} l${F(R * .2)},${F(R * .32)}Z M${F(px - R * .6)},${F(cy + R * .2)} q${F(R * .6)},${F(R * .45)} ${F(R * 1.2)},0 l${F(-R * .2)},${F(R * .1)} l${F(-R * .2)},${F(-R * .08)} l${F(-R * .2)},${F(R * .08)} l${F(-R * .2)},${F(-R * .08)}Z" fill="${fc}"/>`; }
    return g; };
  const shock = (px, py, kk) => { const h = 2.3 * kk, wd = 1.0 * kk; let g = `<ellipse cx="${F(px - wd * .4)}" cy="${F(py)}" rx="${F(wd * 1.1)}" ry="${F(wd * .16)}" fill="#000" opacity=".28"/>`;
    for (let i = 0; i < 26; i++) { const t = i / 25, bx = px + (t - .5) * wd * 2, lit = t > .55, tx = px + (t - .5) * wd * .35, ty = py - h * .62;
      g += `<path d="M${F(bx)},${F(py)} L${F(tx)},${F(ty)} L${F(px + (t - .5) * wd * .9 + (rp() - .5) * wd * .3)},${F(py - h * (.92 + rp() * .1))}" stroke="${T(lit ? (rp() < .5 ? "#e0c070" : "#d2ae5a") : (rp() < .5 ? "#9a7a3a" : "#7e6230"))}" stroke-width="${F(Math.max(1, kk * .1))}" fill="none"/>`; }
    g += `<path d="M${F(px - wd * .2)},${F(py - h * .62)} L${F(px + wd * .2)},${F(py - h * .62)}" stroke="${T("#6a4a22")}" stroke-width="${F(Math.max(1, kk * .12))}"/>`;
    return g; };

  /* is the ground at (x, z) seen, or hidden behind nearer land? */
  const seen = (x, z) => { const y0 = sy(hT(x, z), z) - 1.5;
    for (let q = 12; q < z * .985; q += Math.max(.5, q * .012)) { const xq = x * q / z, hq = hT(xq, q); if (sy(hq, q) < y0) return false; }
    return true; };
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);

  /* ---------- the church: fieldstone walls, clapboarded gambrel gable, arched door and windows ---------- */
  const STONE = "#968a76", TRIMC = "#ece6d8", CLAP = "#dcd6c8";
  const archQ = (q, u, v0, v1, hw, c, ex) => { q(u - hw, v0, u + hw, v1, c, ex);
    for (let k = 0; k < 6; k++) { const a0 = k / 6 * Math.PI / 2, a1 = (k + 1) / 6 * Math.PI / 2, ww = hw * Math.cos((a0 + a1) / 2);
      q(u - ww, v1 + hw * Math.sin(a0) - .01, u + ww, v1 + hw * Math.sin(a1), c, ex); } };
  const churchX = (n, q, len) => {
    for (let i = 0; i < len * 9; i++) { const u = rl() * len, v = rl() * (MH - .2), sw = .35 + rl() * .6;     // fieldstones
      q(u, v, Math.min(len, u + sw), Math.min(MH - .15, v + .22 + rl() * .22), rl() < .4 ? "#b4a892" : rl() < .5 ? "#7a7060" : "#a6886a", { off: .03, op: .5 }); }
    if (n === "front") {
      const A = MW / 2;   // the clapboarded upper gable, following the gambrel profile
      for (let y = MH + .02; y < MH + MRH - .25; y += .3) { const t = y - MH, hw = t < .66 * MRH ? A - .42 * A * t / (.66 * MRH) : .58 * A * (1 - (t - .66 * MRH) / (.34 * MRH));
        q(len / 2 - hw + .15, y, len / 2 + hw - .15, y + .3, rl() < .5 ? CLAP : "#cfc9bb", { off: .03 });
        q(len / 2 - hw + .15, y, len / 2 + hw - .15, y + .04, "#8a8478", { off: .035, op: .55 }); }
      const um = len / 2, yb = MH + MRH * .28, lt = NIGHT;
      q(um - .55, yb, um + .55, yb + .9, TRIMC, { off: .05 }); q(um - .4, yb + .1, um + .4, yb + .8, lt ? LAMP : "#3a3c46", { glow: lt, off: .07 });
      archQ(q, um, 0, 2.6, 1.05, "#c8b08a", { off: .05 });
      archQ(q, um, 0, 2.5, .85, NIGHT ? "#e09040" : "#4a2e20", { off: .07, glow: NIGHT });
      q(um - .03, 0, um + .03, 3.3, NIGHT ? "#a05a20" : "#2a1a12", { off: .08 });
      [um - 3.6, um + 3.6].forEach(u => { const lw = NIGHT && rl() < .9;
        archQ(q, u, 2.4, 4.4, .7, TRIMC, { off: .05 }); archQ(q, u, 2.5, 4.4, .56, lw ? LAMP : "#3a3c46", { off: .07, glow: lw });
        q(u - .03, 2.5, u + .03, 4.9, TRIMC, { off: .08 }); q(u - .56, 3.45, u + .56, 3.52, TRIMC, { off: .08 }); });
    } else if (n === "left" || n === "right") {
      for (let u = 2.4; u < len - 1.5; u += 4.1) { const lw = NIGHT && rl() < .8;
        archQ(q, u, 2.1, 4.6, .78, TRIMC, { off: .05 }); archQ(q, u, 2.2, 4.6, .62, lw ? LAMP : "#3a3c46", { off: .07, glow: lw });
        for (let k = 1; k < 4; k++) q(u - .62, 2.2 + k * .6, u + .62, 2.25 + k * .6, TRIMC, { off: .08 });
        q(u - .03, 2.2, u + .03, 5.2, TRIMC, { off: .08 }); }
    } };
  const church = w.house({ x: CX, z: CZ, y: CG, fy: -.9, yaw: CYAW, gable: true, roof3: "gambrel", w: MW, d: MD, h: MH, rh: MRH, ov: .55,
    wall: STONE, roof: "#5a4a44", trim: "#d8d0c0", stone: "#7a7064", clap: false, door: false, win: () => false, extra: churchX, rng: rl });
  used.push([CX, CZ, 11]);
  // steps up to the door
  [[0, -MD / 2 - .7, 3.6, 1.4, .5], [0, -MD / 2 - 1.5, 4.4, 1.2, .25]].forEach(([lx, lz, sw, sd, sh], i) => { const [x, z] = toWorld(lx, lz);
    const ob = w.box({ x, z, y: CG - .25, yaw: CYAW, w: sw, d: sd, h: sh + .25, c: "#a49a88", top: "#bcb2a0" }); ob.key = church.key - .1 - i * .1; });
  /* the open octagonal belfry on the west end of the ridge: base, eight posts, the bell, an ogee cap, weathervane */
  { const [bx, bz] = toWorld(0, -MD / 2 + 2.0), BY = CG + MH + MRH, BY2 = BY + .9, K = church.key;
    const order = (ob, i) => { ob.key = K - .5 - i * .01; return ob; };
    order(w.box({ x: bx, z: bz, y: BY - .6, yaw: CYAW, w: 2.4, d: 2.4, h: 1.5, c: "#e6e0d2", top: "#5a4a44" }), 0);
    order(w.cyl({ x: bx, z: bz, y: BY2, r0: 1.2, h: .2, n: 8, rot: Math.PI / 8, c: "#e6e0d2" }), 1);
    order(w.cyl({ x: bx, z: bz, y: BY2 + .75, r0: .34, r1: .2, h: .75, n: 10, c: "#5a4a2a" }), 3);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, px = bx + Math.cos(a) * 1.08, pz = bz + Math.sin(a) * 1.08;
      w.line([[px, BY2 + .2, pz], [px, BY2 + 1.95, pz]], "#f2ede2", .16, { min: .9, bias: (K - .5 - (pz < bz ? 5 : 2) * .01) - pz }); }
    order(w.cyl({ x: bx, z: bz, y: BY2 + 1.95, r0: 1.32, h: .24, n: 8, rot: Math.PI / 8, c: "#e6e0d2" }), 6);
    order(w.cyl({ x: bx, z: bz, y: BY2 + 2.19, r0: 1.26, r1: .62, h: .8, n: 8, rot: Math.PI / 8, c: "#4a3e3a" }), 7);
    order(w.cyl({ x: bx, z: bz, y: BY2 + 2.99, r0: .62, r1: .06, h: 1.1, n: 8, rot: Math.PI / 8, c: "#4a3e3a" }), 8);
    w.line([[bx, BY2 + 4.0, bz], [bx, BY2 + 5.0, bz]], "#2a2622", .06, { min: 1.2, bias: (K - .6) - bz });
    w.sprite({ x: bx, z: bz, y: BY2 + 4.75, bias: (K - .61) - bz, fn: (px, py, kk) => {
      const c = NIGHT ? "#1a1a24" : "#3a3028", L = .75 * kk;
      return `<circle cx="${F(px)}" cy="${F(py + .3 * kk)}" r="${F(Math.max(1.5, .13 * kk))}" fill="${NIGHT ? "#6a6a7a" : "#c8a040"}"/>`
        + `<path d="M${F(px - L)},${F(py)} L${F(px + L)},${F(py)}" stroke="${c}" stroke-width="${F(Math.max(1, .05 * kk))}"/>`
        + `<path d="M${F(px + L)},${F(py)} l${F(-.22 * kk)},${F(-.12 * kk)} l0,${F(.24 * kk)}Z M${F(px - L)},${F(py)} l${F(.25 * kk)},${F(-.18 * kk)} l${F(.1 * kk)},${F(.18 * kk)} l${F(-.1 * kk)},${F(.18 * kk)}Z" fill="${c}"/>`
        + `<path d="M${F(px - .1 * kk)},${F(py)} q${F(.05 * kk)},${F(-.32 * kk)} ${F(.24 * kk)},${F(-.36 * kk)} l${F(.06 * kk)},${F(.12 * kk)} q${F(.16 * kk)},${F(.02 * kk)} ${F(.12 * kk)},${F(.24 * kk)}Z" fill="${c}"/>`; } }); }
  // corn shocks either side of the door, jack-o'-lanterns on the steps
  [[-2.6, -MD / 2 - .5], [2.6, -MD / 2 - .5]].forEach(([lx, lz]) => { const [x, z] = toWorld(lx, lz); w.sprite({ x, z, y: CG, bias: -1.5, fn: (px, py, kk) => shock(px, py, kk) }); });
  [[-1.5, -MD / 2 - .9, CG + .5, .3, 1], [1.4, -MD / 2 - .9, CG + .5, .26, 1], [-2, -MD / 2 - 1.7, CG + .25, .34, 1], [1.9, -MD / 2 - 1.8, CG + .25, .24, 0], [2.3, -MD / 2 - 1.6, CG + .25, .3, 1]].forEach(([lx, lz, y, sz, cv]) => {
    const [x, z] = toWorld(lx, lz); w.sprite({ x, z, y, bias: -1.8, fn: (px, py, kk) => pumpkin(px, py, kk, sz, !!cv) }); });
  if (NIGHT) { const [x, z] = toWorld(0, -MD / 2 - .3), [gx, gy] = w.proj([x, CG + 1.6, z]);
    w.sprite({ x, z, y: CG + 1.6, bias: -1.9, fn: () => `<circle cx="${F(gx)}" cy="${F(gy)}" r="60" fill="url(#shcGlow)" opacity=".85"/>` }); }

  /* ---------- the fieldstone wall running away up the left side, jack-o'-lanterns on its cap ---------- */
  for (let z = 10.5; z < 160;) { const L = 2.6 + rl() * 1.2, z2 = Math.min(160, z + L), ax = wallX(z), bx = wallX(z2);
    const g0 = Math.min(hT(ax, z), hT(bx, z2)) - .25, g1 = Math.max(hT(ax, z), hT(bx, z2)), hw = 1.0 + rl() * .15, len = Math.hypot(bx - ax, z2 - z) + .06;
    const yaw = Math.atan2(z2 - z, bx - ax) * 180 / Math.PI, hh = g1 - g0 + hw;
    w.box({ x: (ax + bx) / 2, z: (z + z2) / 2, y: g0, yaw, w: len, d: .75, h: hh, c: "#6a6256", top: "#9a8e7c",
      dec: (fc, Pf) => { fc[0].dec = Array.from({ length: Math.round(len * hh * 5) }, () => { const u = (rl() - .5) * len, v = rl() * (hh - .15), sw = .25 + rl() * .45, sh2 = .14 + rl() * .16;
        return { P: [[u, v, -.4], [u + sw, v, -.4], [u + sw, Math.min(hh, v + sh2), -.4], [u, Math.min(hh, v + sh2), -.4]].map(Pf), c: ["#a49884", "#8e8472", "#b6aa92", "#7a7262", "#9a8a72"][Math.floor(rl() * 5)], op: .85 }; });
        fc[4].dec = Array.from({ length: Math.round(len * 2) }, () => { const u = (rl() - .5) * len, sw = .3 + rl() * .4;
          return { P: [[u, hh + .01, -.36], [u + sw, hh + .01, -.36], [u + sw, hh + .01, .36], [u, hh + .01, .36]].map(Pf), c: rl() < .5 ? "#aea290" : "#857a68", op: .8 }; }); } });
    used.push([(ax + bx) / 2, (z + z2) / 2, 1.2]); z = z2; }
  [[16, .34, 1], [17.2, .26, 0], [24, .3, 1], [33, .36, 1], [34.1, .24, 1], [47, .32, 1], [63, .3, 0], [64.2, .34, 1]].forEach(([z, sz, cv]) => {
    const x = wallX(z), y = Math.max(hT(x, z), hT(x, z + 3)) + 1.0;
    w.sprite({ x, z, y, bias: -.6, fn: (px, py, kk) => pumpkin(px, py, kk, sz, !!cv) }); });
  // bittersweet and sumac hugging the outside of the wall
  const SUMAC = ["#3a0e0a", "#5a160e", "#7a2012", "#9e2a16", "#bc3a1c", "#d6522a", "#e8763e", "#f4a062"];
  for (let k = 0; k < 110; k++) { const z = 45 + Math.pow(r(), 1.3) * 120, x = wallX(z) - .7 - r() * 1.6, y0 = hT(x, z), hM = .7 + r() * 1.2, q = r(), RAMP = q < .45 ? SUMAC : q < .7 ? RUST : q < .85 ? GOLD : OAK;
    w.sprite({ x, z, y: y0 - .1, fn: (px, py, kk, fog) => `<g filter="url(#shcLeafy)">${clump(px, py, Math.max(2.5, hM * kk), fog, RAMP)}</g>` }); }

  /* a hedgerow on an old field wall crossing the meadow outside the burying ground, low enough to keep the corner calm */
  for (let x = -24; x > -125; x -= .9 + r() * .9) { const z = 138 + 10 * N2(x / 40, 5.5) + (x + 24) * -.12, y0 = hT(x, z), hM = 1.6 + r() * 2.2 + (r() < .12 ? 2 : 0), q = r();
    const RAMP = q < .3 ? SUMAC : q < .55 ? RUST : q < .75 ? GOLD : OAK;
    w.sprite({ x, z, y: y0 - .2, fn: (px, py, kk, fog) => `<g filter="url(#shcLeafy)">${clump(px, py, Math.max(2.5, hM * kk), fog, RAMP)}</g>` }); }

  /* ---------- a lantern post by the path ---------- */
  { const z = 34, x = pathX(z) + 1.6, gy = hT(x, z); used.push([x, z, .8]);
    w.box({ x, z, y: gy, w: .12, d: .12, h: 2.5, c: "#2a2a2e" });
    w.sprite({ x, z, y: gy + 2.5, bias: -.2, fn: (px, py, kk) => (NIGHT ? `<circle cx="${F(px)}" cy="${F(py)}" r="${F(kk * 2.6)}" fill="url(#shcGlow)" opacity=".9"/>` : "")
      + `<path d="M${F(px - .18 * kk)},${F(py + .2 * kk)} L${F(px + .18 * kk)},${F(py + .2 * kk)} L${F(px + .22 * kk)},${F(py - .3 * kk)} L${F(px - .22 * kk)},${F(py - .3 * kk)}Z" fill="${NIGHT ? "#ffe0a0" : "#4a4e56"}" stroke="#1e1e22" stroke-width="${F(.04 * kk)}"/>`
      + `<path d="M${F(px - .28 * kk)},${F(py - .3 * kk)} L${F(px)},${F(py - .5 * kk)} L${F(px + .28 * kk)},${F(py - .3 * kk)}Z" fill="#1e1e22"/>` }); }

  /* ---------- trees over the graves, then the woods on the hills ---------- */
  TREES.forEach(([x, z, hM, RAMP]) => { const y0 = hT(x, z); used.push([x, z, 2.5]);
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => broadleaf(px, py, hM * kk, RAMP, fog, Math.min(260, Math.round(hM * kk * .7))) }); });
  for (let k = 0, n = 0; k < 40000 && n < 3400; k++) { const z = 200 + Math.pow(r(), 2.2) * 1400, u = (r() - .5) * 1.35, x = u * z;
    const y0 = hT(x, z); if (lawn(x, z)) continue;
    if (!free(x, z, 1.4) || !seen(x, z)) continue; n++;
    const q = r(), RAMP = q < .28 ? MAPLE : q < .5 ? GOLD : q < .72 ? RUST : OAK, room = (sy(y0, z) - (yLim(x / z) + 12 + 26 * N1(x / 30, z / 60))) * z / FL;
    const hM = Math.max(3.5, Math.min(7 + r() * 6, room));
    w.sprite({ x, z, y: y0 - .4, fn: (px, py, kk, fog) => hM * kk > 70 ? broadleaf(px, py, hM * kk * 1.1, RAMP, fog, Math.min(170, Math.round(hM * kk * .55)))
      : hM * kk > 30 ? `<g filter="url(#shcLeafy)">${clump(px, py, hM * kk, fog * .9, RAMP)}</g>` : clump(px, py, Math.max(2.5, hM * kk), fog * .9, RAMP) }); }
  // understory along the wood's edge (dogwood, sumac, young maples) so the front row's trunks don't stand like a fence
  for (let k = 0, n = 0; k < 9000 && n < 900; k++) { const u = (r() - .5) * 1.35, z0 = 200 + r() * 70, x = u * z0;
    if (lawn(x, z0)) continue; const z = z0 + r() * 12, y0 = hT(x, z); if (!free(x, z, .5)) continue; n++;
    const hM = 2 + r() * 3.2, q = r(), RAMP = q < .35 ? SUMAC : q < .6 ? GOLD : q < .8 ? RUST : OAK;
    w.sprite({ x, z, y: y0 - .2, bias: -2, fn: (px, py, kk, fog) => `<g filter="url(#shcLeafy)">${clump(px, py, Math.max(2.5, hM * kk), fog, RAMP)}</g>` }); }

  /* ---------- the headstones: loose, leaning rows from the near lawn up the knoll ---------- */
  for (let z = 13; z < 185; z *= 1.055 + rg() * .035) {
    for (let x = wallX(z) + 1.4 + rg() * 2; x < z * .7; x += 1.4 + rg() * 2.6) {
      const gx = x + (rg() - .5) * .8, gz = z + (rg() - .5) * 1.4;
      if (gx < wallX(gz) + 1.1 || rg() < .28) continue;
      const [lx, lz] = toLocal(gx, gz);
      if (Math.abs(lx) < MW / 2 + 1.8 && lz > -MD / 2 - (Math.abs(lx) < 4.5 ? 6 : 2.8) && lz < MD / 2 + 2) continue;
      if (gz < DOOR[1] + 2 && Math.abs(gx - pathX(gz)) < 1.8) continue;
      if (!free(gx, gz, .55)) continue;
      if (gz > 95 && !seen(gx, gz)) continue;
      const q = rg(), m = q < .42 ? 0 : q < .72 ? 1 : q < .86 ? 2 : 3, ob = rg() < .05;
      const o = { m, ob, w: ob ? .55 : .45 + rg() * .45, h: ob ? 1.6 + rg() * .6 : .55 + rg() * .6 + (rg() < .1 ? .4 : 0), tilt: (rg() - .5) * 13 };
      w.sprite({ x: gx, z: gz, y: hT(gx, gz) - .04, fn: (px, py, kk, fog) => headstone(px, py, kk, fog, o) }); } }

  /* ---------------- assemble: the land, haze and mist in the hollow, then everything on it ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  s += w.draw({ where: isR });
  s += `<rect x="0" y="300" width="${W}" height="120" fill="url(#shcHaze)" opacity=".3"/>`;
  s += `<g filter="url(#shcMist)" opacity="${NIGHT ? .45 : .6}">`;
  for (let k = 0; k < 22; k++) { const x = r() * W, y = 392 + r() * 34, rx = 140 + r() * 280;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(rx)}" ry="${F(4 + r() * 8)}" fill="${NIGHT ? "#6e76a8" : "#fbf4e6"}" opacity="${F(.25 + r() * .35)}"/>`; }
  s += `</g>`;
  // fallen leaves lying flat on the lawn, thickest under the trees
  for (let k = 0; k < 900; k++) { const z = 11 + Math.pow(r(), .8) * 110, x = (r() - .5) * z * 1.35;
    const near = Math.max(...TREES.map(([tx, tz, hm]) => 1 - Math.hypot(x - tx, z - tz) / (hm * .9)));
    if (r() > .12 + Math.max(0, near) * .9 || !lawn(x, z)) continue;
    const py = sy(hT(x, z), z), px = sx(x, z), R = Math.max(.8, FL * (.07 + r() * .07) / z);
    s += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(R)}" ry="${F(Math.max(.5, R * EYE / z * 3))}" fill="${T(["#c85a22", "#d89a30", "#a83a1e", "#e0b040", "#8a4a20"][Math.floor(r() * 5)])}" opacity=".85"/>`; }
  s += w.draw({ where: notR });
  if (NIGHT) {   // ground mist between the stones
    s += `<g filter="url(#shcMist)" opacity=".4">`;
    for (let k = 0; k < 30; k++) { const x = r() * W, y = 455 + r() * 90, rx = 120 + r() * 300;
      s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(rx)}" ry="${F(5 + r() * 10)}" fill="#7e86b8" opacity="${F(.2 + r() * .3)}"/>`; }
    s += `</g>`;
  }
  // long autumn grass along the bottom edge
  { let g = "";
    for (let i = 0; i < 240; i++) { const x = r() * W, y = 700 + r() * 30, hh = 40 + r() * 80, bend = (r() - .5) * 36;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(["#7a7a3a", "#a09048", "#5e6a32", "#b8a058"][Math.floor(r() * 4)])}" stroke-width="${F(1.5 + r() * 2)}" fill="none" stroke-linecap="round"/>`; }
    s += g; }

  s += `<rect width="${W}" height="${H}" fill="url(#shcLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#shcPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
