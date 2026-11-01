/* Cranberry Bog Harvest: wet-harvest day on a Plymouth County bog, Massachusetts.
   Seen from the sand dike at the near edge, the flooded bed is one sheet of
   floating crimson berries. A yellow floating boom has swept a loop of them into
   the corner by the shore, where a steel conveyor lifts them into a trailer. On
   the low upland behind stands the old cedar-shingled screenhouse with its
   cupola, under pitch pines and scarlet red maples; the bog's far reaches run
   back left and right to a sand dike, a harvested bed of maroon vines and the
   pine-and-oak woods, with the low Pine Hills beyond. Crisp late-October
   morning, sun high off the left edge, Canada geese heading south.
   opts.time === "night": a 97% waning gibbous moon rising left of the
   screenhouse, stars, a work floodlight on the corral, lit screenhouse and
   farmhouse windows, truck marker lights.
   The land is one world3d() raster (reference/scene-helpers.js); the berry
   carpet is its own per-pixel layer on the flooded bed; buildings, the truck,
   the conveyor, the boom and the trees are placed in metres by the same camera.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function cranberryBogHarvestArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 5821;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17), rp = rng(seed + 29);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -260, LY = 120, WY = 430, MOX = 985, MOY = 236;
  const T = c => NIGHT ? mix(mix(c, "#6e7490", .42), "#0a0e2c", .62) : c;
  const HZ = NIGHT ? "#262a50" : "#dfe6ea", RIM = NIGHT ? "#b0b8e8" : "#fff4dc", LAMP = "#ffc060", SHADE = NIGHT ? "#04050e" : "#2e2c44";
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

  /* ---------------- sky: crisp October blue, or a moonlit night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#050820"/><stop offset=".45" stop-color="#0e1640"/><stop offset=".8" stop-color="#1e2858"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#3a66a6"/><stop offset=".4" stop-color="#6e98cc"/><stop offset=".78" stop-color="#b4cce2"/><stop offset="1" stop-color="#e6ece6"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#c8d0ff" stop-opacity=".22"/><stop offset=".25" stop-color="#8a96d0" stop-opacity=".08"/><stop offset="1" stop-color="#8a96d0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fffbe8" stop-opacity=".95"/><stop offset=".2" stop-color="#fff0c8" stop-opacity=".45"/><stop offset=".6" stop-color="#ffe2b0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe2b0" stop-opacity="0"/>`;
  const GX = NIGHT ? MOX : LX, GY = NIGHT ? MOY : LY;
  let s = `<defs id="cbdefs">
    <linearGradient id="cbSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="cbLight" cx="${GX}" cy="${GY}" r="${NIGHT ? 900 : 1600}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="cbHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".75"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="cbWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#2a3260"/><stop offset=".25" stop-color="#141a40"/><stop offset="1" stop-color="#060a1e"/>`
      : `<stop offset="0" stop-color="#d6e2ea"/><stop offset=".2" stop-color="#8aa6c0"/><stop offset=".6" stop-color="#4e6a86"/><stop offset="1" stop-color="#34485e"/>`}</linearGradient>
    <radialGradient id="cbGlow"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".4"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="cbMoon"><stop offset="0" stop-color="#e8ecff" stop-opacity=".5"/><stop offset=".35" stop-color="#a8b4f0" stop-opacity=".16"/><stop offset="1" stop-color="#a8b4f0" stop-opacity="0"/></radialGradient>
    <clipPath id="cbCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="cbLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".13" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="cbNeedle" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".3" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="cbCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".014" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="cbRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2" seed="15" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".8"/></filter>
    <filter id="cbPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="cbSoft"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="cbBlur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#cbSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 520; i++) { const x = rs() * W, y = Math.pow(rs(), 1.25) * 410, big = rs() < .06, dm = Math.hypot(x - MOX, y - MOY);
      if (dm < 120) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.6 : F(.5 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F((.2 + rs() * .55) * (1 - y / 450) * Math.min(1, dm / 420))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#cbLight)"/>`;
    // the moon, 97% lit, a thin dark sliver on the upper right
    s += `<circle cx="${MOX}" cy="${MOY}" r="150" fill="url(#cbMoon)"/>`;
    s += `<circle cx="${MOX}" cy="${MOY}" r="27" fill="#f2f0e2"/>`;
    s += `<path d="M${MOX + 4},${MOY - 27} A27,27 0 0 1 ${MOX + 4},${MOY + 27} A27,24 0 0 0 ${MOX + 4},${MOY - 27}Z" transform="rotate(-40 ${MOX} ${MOY})" fill="#4a4e6a" opacity=".55"/>`;
    [[-8, -6, 7, .14], [6, 7, 5, .12], [-3, 10, 4, .1], [9, -9, 3.5, .09], [-12, 6, 3, .1]].forEach(([dx, dy, rr, o]) =>
      s += `<circle cx="${MOX + dx}" cy="${MOY + dy}" r="${rr}" fill="#8a8a9a" opacity="${o}"/>`);
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#cbLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#cbSoft)">`;
    for (let k = 0; k < 6; k++) { const a = .02 + k * .08, L = 1900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: fair-weather cumulus, small and flat in the text corners; geese ---------------- */
  const cumulus = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#cbCloudy)">`;
    const lobes = [], n = 7 + Math.floor(rs() * 5);
    for (let k = 0; k < n; k++) { const t = k / (n - 1); lobes.push([x + (t - .5) * w * .9, y - Math.sin(t * Math.PI) * w * (.1 + rs() * .1), w * (.09 + rs() * .07)]); }
    if (NIGHT) {
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .52)}" ry="${F(w * .05)}" fill="#161c44"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .7)}" fill="#1e2652"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .25)}" cy="${F(ly - R * .3)}" rx="${F(R * .6)}" ry="${F(R * .35)}" fill="#3e4a84" opacity=".55"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .52)}" ry="${F(w * .055)}" fill="#a4b0c8"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .15)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.05)}" ry="${F(R * .78)}" fill="#c8d2e2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .05)}" cy="${F(ly - R * .02)}" rx="${F(R * .9)}" ry="${F(R * .7)}" fill="#eef2f6"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .35)}" cy="${F(ly - R * .3)}" rx="${F(R * .5)}" ry="${F(R * .38)}" fill="#ffffff"/>`);
    }
    return c + `</g></g>`;
  };
  s += cumulus(560, 210, 300, "drift1") + cumulus(1180, 92, 260, "drift2") + cumulus(1880, 200, 360, "drift3") + cumulus(2390, 120, 200, "drift1")
     + cumulus(260, 300, 220, "drift2") + cumulus(1620, 330, 180, "drift1") + cumulus(2200, 330, 240, "drift2");
  if (!NIGHT) {   // a skein of Canada geese heading south over the bog
    s += `<g class="birds" fill="none" stroke="#2a2a34" stroke-width="2.2" stroke-linecap="round" opacity=".82">`;
    const gx = 1240, gy = 128;
    for (let i = 0; i < 15; i++) { const side = i % 2 ? 1 : -1, k = Math.ceil(i / 2), x = gx + k * 26 + rs() * 4, y = gy + side * k * (side > 0 ? 13 : 9) + rs() * 3, sc = 1 - k * .02;
      s += `<path d="M${F(x - 9 * sc)},${F(y - 2 * sc)} q${F(4.5 * sc)},${F(-4 * sc)} ${F(9 * sc)},${F(1.5 * sc)} q${F(4.5 * sc)},${F(-5 * sc)} ${F(9 * sc)},${F(-2 * sc)}"/>`; }
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 3.4 m above the flooded bed (standing on the near dike), horizon on WY; metres, x right,
     y up, z away. The bed is water (h < 0) out to its shore zb(x): a low upland juts in at the
     middle to z 108 with the screenhouse on it; left and right the bed runs back to 260 / 230 m. */
  const EYE = 3.4, FL = 2400;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: [-.78, .55, -.3], tone: T, fog: HZ, fogK: .00018,
    shadow: SHADE, rim: RIM, shade: .5, hi: .26, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9), NB = noise2(seed + 41), NC = noise2(seed + 57);
  const zb = x => x < -22 ? Math.min(260, 108 + (-22 - x) * 4 * (1 - .25 * sm((-x - 45) / 15))) + 3 * N1(x / 20, 1.7)
    : Math.min(230, 108 + 21 * Math.log(1 + Math.exp((x - 30) / 7))) + 1.5 * N1(x / 12, 2.2) * (1 - sm((x - 30) / 20)) + 3 * N1(x / 20, 4.1) * sm((x - 30) / 20);
  const farL = x => sm((-x - 54) / 12);                       // the far-left bog: dike, then a harvested bed
  const wsZ = x => {                                           // where the woods begin
    const a = zb(x) + 16 + 6 * N2(x / 25, 1.3), L = 334 + 6 * N2(x / 30, 7), R = 262 + 6 * N2(x / 30, 9);
    let v = a; v = v + (L - v) * farL(x); v = v + (R - v) * sm((x - 64) / 14);
    if (x > -26 && x < 34) v = Math.max(v, 146 + 6 * N2(x / 14, 5));   // the screenhouse yard
    return v; };
  const yLim = u => { const sx = 1280 + FL * u; return sx > 930 && sx < 1480 ? 190 : sx > 860 && sx < 1560 ? 190 + 70 * sm(Math.max(930 - sx, sx - 1480) / 70) : 262; };
  const capH = (x, z) => EYE + (WY - yLim(x / z)) * z / FL;
  const MF = mountainField({ seed: 4471, scale: 2600, oct: 5, peaks: [
    { x: -2600, z: 5200, h: 95, rx: 2600, rz: 1600 }, { x: 900, z: 6800, h: 120, r: 2600 }, { x: 4200, z: 6000, h: 80, r: 2200 } ] });
  const crown = (x, z) => {                                    // canopy domes, one per 5 m cell
    const cx = Math.floor(x / 5), cz = Math.floor(z / 5), hh = Math.sin(cx * 127.1 + cz * 311.7) * 43758.5453, q = hh - Math.floor(hh);
    const jx = (cx + .3 + q * .4) * 5, jz = (cz + .3 + ((q * 7.3) % 1) * .4) * 5, d = Math.hypot(x - jx, z - jz), R = 2.3 + q * .7;
    return [d < R ? (1 - (d / R) ** 2) * (1.6 + q * 1.6) : 0, q]; };
  /* the bare ground (trees stand on this), then the land the raster draws: ground + canopy */
  const ground = (x, z) => {
    const b = zb(x); if (z < b) return -1;
    const d = z - b, fl = farL(x);
    if (fl > .5 && d < 74) {                                   // far-left: dike, harvested bed, ditch
      if (d < 6) return 1.1 * sm(d / 1.5) * sm((6 - d) / 1.5) + .12;
      if (d < 68) return .14 + .05 * N3(x / 3, z / 3);
      if (z < wsZ(x)) return -.5; }
    return .2 + .8 * sm(d / 7) + .008 * Math.max(0, z - 120) * (1 - fl) + .5 * N3(x / 40, z / 40) * sm(d / 10); };
  const hT = (x, z) => {
    let h = ground(x, z); if (h <= 0) return h;
    const ws = wsZ(x);
    if (z > ws) { const [dome] = crown(x, z), k = sm((z - ws) / 7);
      h += k * (9 + 2.5 * N2(x / 60, z / 60) + 1.4 * N1(x / 14, z / 14) + dome * .45 + .7 * N3(x / 2.2, z / 2.2)); }
    else if (farL(x) < .5 || z - zb(x) > 74) h += .5 * sm((z - ws + 14) / 14) * (.6 + .4 * N1(x / 4, z / 4));   // scrub before the woods
    if (z > 1600) { const far = MF(x, z) * sm((z - 1600) / 2200); if (far > h) h = far; }
    return Math.min(h, capH(x, z) * (.94 + .06 * N3(x / 120, z / 120))); };
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const PINE = H3("#2c3c26"), PINE2 = H3("#3e4e2c"), OAKB = H3("#7a5226"), OAKR = H3("#8a4a22"), MAPR = H3("#b42a1a"), MAPO = H3("#d0602a"), GOLDC = H3("#c49a32");
  const SAND = H3("#d8c49a"), SAND2 = H3("#bca878"), BLUE = H3("#b07a44"), HUCK = H3("#8a2c22"), BAYB = H3("#5e6438"), VINE = H3("#5e1c22"), VINE2 = H3("#7a2a2a");
  const woods = (x, z) => { const [, q] = crown(x, z), edge = sm(1 - (z - wsZ(x)) / 40), t = N2(x / 3, z / 3) * .5 + .5;
    let c = q < .5 - .25 * edge ? L3(PINE, PINE2, t) : q < .66 ? L3(OAKB, OAKR, t) : q < .74 + .14 * edge ? L3(MAPR, MAPO, t * .7) : q < .86 ? GOLDC : L3(PINE, OAKB, .4);
    return c.map(v => v * (.72 + .36 * t + .22 * N1(x / 1.3, z / 1.3))); };
  const col = (x, y, z, n) => {
    const b = zb(x), d = z - b, ws = wsZ(x), fl = farL(x), steep = 1 - n[1];
    if (z > ws + 1.5 && y > 2.2) return woods(x, z);
    if (fl > .5 && d < 74 && d >= 6) return L3(VINE, VINE2, .5 + .6 * N1(x / 5, z / 5)).map(v => v * (.85 + .3 * hash(Math.floor(x * 2), Math.floor(z))));
    if (d < (fl > .5 ? 6 : 2.2 + 1.2 * N2(x / 6, 3)) || (Math.abs(d - 9 - 2 * N1(x / 15, 8)) < 1.3 && x > -24 && x < 30)) return L3(SAND, SAND2, .5 + .6 * N3(x / 2, z / 2) + steep);   // sand banks, the yard track
    const k = N1(x / 9, z / 9), k2 = N2(x / 3.5, z / 3.5);
    let c = L3(BLUE, BAYB, .5 + k);
    if (k2 > .25) c = L3(c, HUCK, (k2 - .25) * 2.2);
    return c.map(v => v * (.85 + .3 * (N3(x / 1.2, z / 1.2) * .5 + .5))); };
  w.raster({ z0: 60, z1: 14000, step: .0011, minStep: .2, scale: .75, top: 60, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00018, amb: NIGHT ? .55 : .42, noRefl: true });

  /* ---------- 2D drawings placed as sprites ---------- */
  const MAPLE = ["#3e0e0c", "#5e1410", "#821c12", "#a62616", "#c6381c", "#dc5426", "#ec7a3a", "#f6a868"];
  const GOLD = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const OAK = ["#2e1c0e", "#463014", "#5e3e18", "#76501e", "#8e6226", "#a87a36", "#c0964e", "#d8b878"];
  const PP = ["#141e14", "#1c2a1a", "#26361e", "#304426", "#3e522c", "#4e6234", "#62763e", "#7e8e52"];
  const toward = (x, y) => { const dl = Math.hypot(LX - x, LY - y); return [(LX - x) / dl, (LY - y) / dl]; };
  const broadleaf = (x, y, hp, RAMP, fog, n) => {     // trunk, limbs and a crown of many lit leaf clumps
    const sd = LX < x ? -1 : 1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .03), ty = y - hp * .24;
    g += `<ellipse cx="${F(x + hp * .1)}" cy="${F(y + 1)}" rx="${F(hp * .28)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .55)},${F(ty)} L${F(x + tb * .55)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5e5248")}"/>`;
    g += `<path d="M${F(x - sd * tb * .1)},${F(y)} L${F(x - sd * tb * .1)},${F(ty)} L${F(x - sd * tb * .55)},${F(ty)} L${F(x - sd * tb)},${F(y)}Z" fill="${Tf("#3a322c")}"/>`;
    for (let k = 0; k < 4; k++) { const a = -1.2 + k * .8 + (r() - .5) * .3; g += `<path d="M${F(x)},${F(ty + hp * .05)} L${F(x + Math.sin(a) * hp * .22)},${F(ty - Math.cos(a) * hp * .2)}" stroke="${Tf("#4a3e34")}" stroke-width="${F(Math.max(.8, tb * .5))}"/>`; }
    const cx = x, cy = y - hp * .57, rx = hp * .38, ry = hp * .36, [ux, uy] = toward(cx, cy), cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.024 + r() * .024)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx - sd * a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#cbLeafy)">${cg}</g>`; };
  /* a pitch pine: crooked trunk with orange plated bark, a few twisting limbs ending in flat
     irregular tufts of needles, lit from the left, a ragged open top */
  const pitchPine = (x, y, hp, fog) => {
    const Tf = c => T(mix(c, HZ, fog)); let g = "", tufts = [];
    g += `<ellipse cx="${F(x + hp * .12)}" cy="${F(y + 1)}" rx="${F(hp * .22)}" ry="${F(Math.max(1, hp * .025))}" fill="#000" opacity=".22"/>`;
    const tb = Math.max(1.4, hp * .028), lean = (r() - .5) * .12;
    const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([x + Math.sin(t * 3 + r()) * hp * .025 + lean * hp * t, y - hp * .78 * t]); }
    for (let i = 0; i < 6; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], w0 = tb * (1 - i / 7.5), w1 = tb * (1 - (i + 1) / 7.5);
      g += `<path d="M${F(x0 - w0)},${F(y0)} L${F(x1 - w1)},${F(y1)} L${F(x1 + w1)},${F(y1)} L${F(x0 + w0)},${F(y0)}Z" fill="${Tf("#6a4030")}"/>`;
      g += `<path d="M${F(x0 + w0 * .1)},${F(y0)} L${F(x1 + w1 * .1)},${F(y1)} L${F(x1 + w1)},${F(y1)} L${F(x0 + w0)},${F(y0)}Z" fill="${Tf("#3e2820")}"/>`;
      g += `<path d="M${F(x0 - w0 * .7)},${F(y0)} L${F(x1 - w1 * .7)},${F(y1)}" stroke="${Tf("#b0704a")}" stroke-width="${F(Math.max(.6, w0 * .35))}" opacity=".7"/>`; }
    const nb = 5 + Math.floor(r() * 3);
    for (let k = 0; k < nb; k++) { const t = .32 + k / nb * .66, i = Math.min(5, Math.floor(t * 6)), [bx, by] = pts[i], sd = k % 2 ? 1 : -1;
      const L = hp * (.16 + r() * .16) * (1.1 - t * .5), ex = bx + sd * L, ey = by - L * (.25 + r() * .35);
      g += `<path d="M${F(bx)},${F(by)} Q${F(bx + sd * L * .5)},${F(by - L * .02)} ${F(ex)},${F(ey)}" stroke="${Tf("#4a3428")}" stroke-width="${F(Math.max(.7, tb * .45))}" fill="none" stroke-linecap="round"/>`;
      tufts.push([ex, ey, hp * (.1 + r() * .05)]); }
    tufts.push([pts[6][0], pts[6][1] - hp * .04, hp * .13]);
    let tg = "";
    tufts.forEach(([tx, ty, R]) => {
      tg += `<path d="${blobP(tx + R * .1, ty + R * .15, R * 1.15, R * .55, 9)}" fill="${Tf(PP[1])}"/>`;
      const m = Math.max(6, Math.min(60, Math.round(R * .9)));
      const [ux, uy] = toward(tx, ty);
      for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = tx + Math.cos(a) * q * R * 1.05, py = ty + Math.sin(a) * q * R * .5;
        const v = cl(((px - tx) / R * ux + (py - ty) / (R * .5) * uy) * .32 + .45 + (r() - .5) * .3 - (py > ty ? .15 : 0));
        tg += `<path d="${blobP(px, py, R * (.16 + r() * .1), R * (.1 + r() * .06), 6)}" fill="${Tf(PP[Math.floor(v * PP.length)])}"/>`; } });
    return g + `<g filter="url(#cbNeedle)">${tg}</g>`; };
  /* a small far tree or shrub: a dark irregular mass with shaded, mid and lit clumps */
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1a1008", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .46, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(44, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (x - px) + (y - sz * .5 - py) * .6, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };

  const seen = (x, z) => { const y0 = sy(ground(x, z) + 4, z);
    for (let q = 100; q < z * .985; q += Math.max(.5, q * .012)) { const xq = x * q / z, hq = hT(xq, q); if (hq < 0) continue; if (sy(hq, q) < y0) return false; }
    return true; };
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);

  /* ---------- the screenhouse: weathered cedar shingles, three floors, gable roof, cupola ---------- */
  const SHX = 7, SHZ = 117, SHY = 1.0, SW_ = 16, SD = 10, SHH = 8, SRH = 4.6;
  const SHING = "#8e877a", TRIMC = "#ece6d8";
  const shExtra = (n, q, len) => {
    for (let v = .3; v < SHH + SRH; v += .32) q(0, v, len, v + .05, "#5e584e", { off: .025, op: .45 });   // shingle courses
    for (let i = 0; i < 160; i++) { const u = rl() * len, v = rl() * SHH, sw = .25 + rl() * .4;
      q(u, v, Math.min(len, u + sw), Math.min(SHH, v + .3), rl() < .5 ? "#a8a090" : "#6e675c", { off: .03, op: .4 }); }
    const win = (u, v0, v1, lt) => { q(u - .6, v0 - .12, u + .6, v1 + .12, TRIMC, { off: .05 });
      q(u - .48, v0, u + .48, v1, lt ? LAMP : "#2e343c", { glow: lt, off: .07 });
      q(u - .04, v0, u + .04, v1, TRIMC, { off: .08 }); q(u - .48, (v0 + v1) / 2 - .04, u + .48, (v0 + v1) / 2 + .04, TRIMC, { off: .08 }); };
    if (n === "front") {
      [[3.2, 4.4], [5.9, 7.0]].forEach(([v0, v1], ri) => { for (let u = 1.4; u < len - 1; u += 2.1) win(u, v0, v1, NIGHT && ri === 0 && (u < 6 || rl() < .35)); });
      [[3.6, 7.4], [9.4, 13.2]].forEach(([a, b], k) => {   // the two big sliding doors on rails
        q(a - .12, 0, b + .12, 2.75, TRIMC, { off: .05 });
        q(a, 0, b, 2.6, k === 0 && NIGHT ? "#c87a30" : "#5a3a2a", { off: .07, glow: k === 0 && NIGHT });
        if (!(k === 0 && NIGHT)) for (let u = a + .45; u < b; u += .45) q(u - .02, 0, u + .02, 2.6, "#3e2a20", { off: .08 });
        q(a, 1.2, b, 1.32, TRIMC, { off: .08 });
        q(a - .4, 2.78, b + .4, 2.9, "#3a3a3a", { off: .1 }); });
      q(len / 2 - 1.9, SHH - .9, len / 2 + 1.9, SHH - .25, "#f4f0e4", { off: .09 });   // the farm's sign board
      q(len / 2 - 1.75, SHH - .82, len / 2 + 1.75, SHH - .33, "#a8182c", { off: .1, op: .9 });
    } else if (n === "left") {
      [[3.2, 4.4], [5.9, 7.0]].forEach(([v0, v1]) => { for (let u = 1.8; u < len - 1; u += 2.6) win(u, v0, v1, NIGHT && rl() < .5); });
      win(len / 2, SHH + 1.2, SHH + 2.3, NIGHT);
      q(len - 2.6, 0, len - 1.2, 2.3, "#4a3226", { off: .07 });
    } };
  w.house({ x: SHX, z: SHZ, y: SHY, fy: -.6, yaw: -3, w: SW_, d: SD, h: SHH, rh: SRH, wall: SHING, roof: "#4e4a48", trim: TRIMC, stone: "#9a9284",
    clap: false, door: false, win: () => false, extra: shExtra, rng: rl, porch: false });
  used.push([SHX, SHZ, 11]);
  { // the cupola on the ridge: louvred box, pyramid roof, a cranberry weathervane
    const by = SHY + SHH + SRH - .5, cx = SHX - .3, cz = SHZ;
    w.box({ x: cx, z: cz, y: by, yaw: -3, w: 2.2, d: 2.2, h: 1.9, c: "#e8e2d4", top: "#e8e2d4", bias: -1.5,
      dec: (fc, Pf) => { [0, 3].forEach(i => { fc[i].dec = [0, 1, 2, 3, 4].map(k => ({ P: [[-.8, .5 + k * .24, -1.13], [.8, .5 + k * .24, -1.13], [.8, .6 + k * .24, -1.13], [-.8, .6 + k * .24, -1.13]].map(p => i === 3 ? Pf([-1.13, p[1], -p[0]]) : Pf(p)), c: "#6a645a", op: .7 })); }); } });
    w.cyl({ x: cx, z: cz, y: by + 1.9, r0: 1.75, r1: .02, h: 1.5, n: 4, rot: Math.PI / 4 - .05, c: "#4e4a48", bias: -1.6 });
    w.line([[cx, by + 3.4, cz], [cx, by + 4.4, cz]], "#2a2a2a", .05, { bias: -1.7 });
    w.sprite({ x: cx, z: cz - .2, y: by + 4.2, bias: -1.8, fn: (px, py, kk) => `<path d="M${F(px - .55 * kk)},${F(py)} L${F(px + .6 * kk)},${F(py)} M${F(px + .6 * kk)},${F(py - .12 * kk)} l${F(.25 * kk)},${F(.12 * kk)} l${F(-.25 * kk)},${F(.12 * kk)}" stroke="${T("#2a2420")}" stroke-width="${F(Math.max(1, .07 * kk))}" fill="none"/><circle cx="${F(px - .55 * kk)}" cy="${F(py)}" r="${F(Math.max(1.4, .16 * kk))}" fill="${T("#a8182c")}"/>` }); }
  // a lean-to shed on the right end
  w.house({ x: SHX + SW_ / 2 + 2.4, z: SHZ + 1, y: SHY, fy: -.4, yaw: -3, w: 4.6, d: 7, h: 3.2, rh: 1.1, roof3: "shed", wall: "#7e786c", roof: "#5a5450", trim: TRIMC,
    clap: false, door: false, win: () => false, rng: rl, extra: (n, q, len) => { for (let v = .3; v < 4; v += .32) q(0, v, len, v + .05, "#56514a", { off: .025, op: .45 }); if (n === "front") q(.8, 0, 3.4, 2.4, "#3e3026", { off: .06 }); } });
  if (NIGHT) { const [gx, gy] = w.proj([SHX - 3.5, SHY + 1.4, SHZ - SD / 2 - 2]);
    w.sprite({ x: SHX - 3.5, z: SHZ - SD / 2 - 2.2, y: SHY, bias: -1, fn: () => `<ellipse cx="${F(gx)}" cy="${F(gy + 14)}" rx="70" ry="16" fill="url(#cbGlow)" opacity=".7"/>` }); }

  /* ---------- the trailer and truck on the shore track, and the conveyor out of the corral ---------- */
  const TX = -10, TZ = 114.5, TY = 1.0;
  w.box({ x: TX - 6.6, z: TZ, y: TY, w: 2.4, d: 2.5, h: 1.15, c: "#2a2a2e", bias: -.1 });                                // cab chassis
  w.box({ x: TX - 6.9, z: TZ, y: TY + 1.15, w: 1.8, d: 2.5, h: 1.55, c: "#b8b4ac", top: "#c8c4bc", bias: -.2,
    dec: (fc, Pf) => { fc[3].dec = [{ P: [[-1.13, .3, -.95], [-1.13, .3, .95], [-1.13, 1.2, .95], [-1.13, 1.2, -.95]].map(Pf), c: NIGHT ? "#3a3a4a" : "#3a4a5a", op: .9 }];
      fc[0].dec = [{ P: [[-.7, .3, -1.27], [.5, .3, -1.27], [.5, 1.2, -1.27], [-.7, 1.2, -1.27]].map(Pf), c: "#3a4a5a", op: .9 }]; } });
  w.box({ x: TX - 8.1, z: TZ, y: TY, w: .9, d: 2.4, h: 1.15, c: "#a8a49c", bias: -.25 });                                  // hood
  w.box({ x: TX, z: TZ, y: TY + .6, w: 11, d: 2.6, h: 2.5, c: "#7a8288", top: "#5a1a22", bias: -.1,                       // open trailer, heaped with berries
    dec: (fc, Pf) => { fc[0].dec = Array.from({ length: 12 }, (_, k) => ({ P: [[-5.5 + k * .92, .1, -1.32], [-5.5 + k * .92, 2.4, -1.32]].map(Pf), c: "#5a6268", ln: .06, min: .5 })); } });
  w.add([{ P: [[TX - 5.3, TY + 3.1, TZ - 1.2], [TX + 5.3, TY + 3.1, TZ - 1.2], [TX + 5.3, TY + 3.1, TZ + 1.2], [TX - 5.3, TY + 3.1, TZ + 1.2]], c: "#8e1424", up: true }], { bias: -.3 });
  [[TX - 7.4, TZ - 1.25], [TX - 4, TZ - 1.25], [TX + 2.5, TZ - 1.25], [TX + 4, TZ - 1.25]].forEach(([x, z]) =>
    w.cyl({ x, z: z - .05, y: TY + .5, r0: .5, h: .3, n: 12, c: "#1a1a1c", top: "#2e2e30", bias: -.4, rot: 0 }));
  if (NIGHT) [[TX - 8.5, TY + 1.7], [TX - 5.4, TY + 3.2], [TX + 5.4, TY + 3.2]].forEach(([x, y]) => {
    const [gx, gy] = w.proj([x, y, TZ - 1.4]);
    w.sprite({ x, z: TZ - 1.5, y, bias: -.6, fn: () => `<circle cx="${F(gx)}" cy="${F(gy)}" r="9" fill="url(#cbGlow)"/><circle cx="${F(gx)}" cy="${F(gy)}" r="2" fill="#ffb040"/>` }); });
  // the conveyor: twin steel rails on a frame, a red belt of berries, the hopper in the water
  const CA = [-12.5, .2, 99.5], CB = [-10.6, TY + 3.6, 113.2];
  const cAt = t => [CA[0] + (CB[0] - CA[0]) * t, CA[1] + (CB[1] - CA[1]) * t, CA[2] + (CB[2] - CA[2]) * t];
  [-.45, .45].forEach(o => w.line([[CA[0] + o, CA[1] + .3, CA[2]], [CB[0] + o, CB[1] + .3, CB[2]]], "#9aa2a8", .1, { bias: -2 }));
  w.line([cAt(0), cAt(1)].map(p => [p[0], p[1] + .36, p[2]]), "#a01828", .7, { bias: -2.1 });
  for (let t = .08; t < 1; t += .1) { const p = cAt(t); w.line([[p[0] - .5, p[1] + .3, p[2]], [p[0] + .5, p[1] + .3, p[2]]], "#6a7278", .06, { bias: -2.2 }); }
  [.35, .62, .86].forEach(t => { const p = cAt(t), gy = t < .5 ? 0 : TY; w.line([[p[0], gy, p[2]], [p[0], p[1] + .2, p[2]]], "#7a8288", .14, { bias: -1.9 }); });
  w.box({ x: CA[0], z: CA[2] - .5, y: -.3, w: 2.2, d: 1.6, h: .9, c: "#d8a828", top: "#5a1420", wet: true, bias: -2 });
  // a work floodlight on a pole by the corral
  const FLX = -15.8, FLZ = 107.5, FLH = 7.2;
  w.line([[FLX, 1.2, FLZ], [FLX, FLH, FLZ]], "#6a6460", .16);
  w.box({ x: FLX + .3, z: FLZ - .2, y: FLH - .3, w: .9, d: .35, h: .5, c: "#3a3a3a", top: "#4a4a4a", glow: false });
  if (NIGHT) { const [gx, gy] = w.proj([FLX + .3, FLH - .1, FLZ - .4]);
    w.sprite({ x: FLX, z: FLZ - .6, y: FLH, bias: -3, fn: () => `<circle cx="${F(gx)}" cy="${F(gy)}" r="60" fill="url(#cbGlow)" opacity=".85"/><rect x="${F(gx - 9)}" y="${F(gy - 4)}" width="18" height="8" fill="#fff4d0"/>` }); }
  // a stack of bog boards and the water reel parked on the bank
  for (let i = 0; i < 6; i++) w.box({ x: 16.6, z: 113.2, y: ground(16.6, 113.2) + i * .12, yaw: -3, w: 3.2, d: .9, h: .11, c: i % 2 ? "#9a8a6c" : "#8a7a5e", top: "#b0a080" });
  { const RX = 24.5, RZ = 123, RY = ground(24.5, 123);   // the reel: a frame on two wheels with a drum of tines
    w.box({ x: RX, z: RZ, y: RY + .6, w: 2.2, d: 1.4, h: .7, c: "#c8a028", top: "#d8b438" });
    w.box({ x: RX + .4, z: RZ, y: RY + 1.3, w: .9, d: .9, h: .5, c: "#2a2a2c" });
    w.sprite({ x: RX - 1.6, z: RZ - .9, y: RY, bias: -.5, fn: (px, py, kk) => { let g = "";
      const R = .55 * kk; g += `<ellipse cx="${F(px)}" cy="${F(py - R)}" rx="${F(R * 1.3)}" ry="${F(R)}" fill="${T("#4a4a4c")}"/>`;
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; g += `<path d="M${F(px)},${F(py - R)} L${F(px + Math.cos(a) * R * 1.3)},${F(py - R + Math.sin(a) * R)}" stroke="${T("#8a8a8c")}" stroke-width="${F(Math.max(.6, .05 * kk))}"/>`; }
      return g + `<circle cx="${F(px)}" cy="${F(py - R)}" r="${F(R * .25)}" fill="${T("#c8a028")}"/>`; } });
    [-.9, .9].forEach(dz => w.cyl({ x: RX + .6, z: RZ + dz * .9, y: RY, r0: .32, h: .25, n: 10, c: "#1e1e20" }));
    used.push([RX, RZ, 3]); }

  /* ---------- the boom: yellow floats sweeping a loop of berries into the corner ---------- */
  const BK = [[-40.5, 176], [-35, 128], [-28, 92], [-18, 76], [-6, 77], [2, 88], [5, 100], [6.2, 107]];
  const BOOM = []; for (let i = 0; i < BK.length - 1; i++) { const p0 = BK[Math.max(0, i - 1)], p1 = BK[i], p2 = BK[i + 1], p3 = BK[Math.min(BK.length - 1, i + 2)];
    for (let k = 0; k < 10; k++) { const t = k / 10, t2 = t * t, t3 = t2 * t;
      BOOM.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
  BOOM.push(BK[BK.length - 1]);
  const POLY = BOOM.concat([[6.2, 108.5], [-22, 108.5], [-40.5, 180]]);
  const inCorral = (x, z) => { let c = false; for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const [xi, zi] = POLY[i], [xj, zj] = POLY[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
  for (let i = 0; i < BOOM.length - 1; i++) { const [x0, z0] = BOOM[i], [x1, z1] = BOOM[i + 1];
    w.line([[x0, .02, z0 + .25], [x1, .02, z1 + .25]], "#3a0a14", .5, { op: .5, noRefl: true });
    w.line([[x0, .14, z0], [x1, .14, z1]], i % 3 === 2 ? "#a88418" : "#f2c42c", .26, { min: 1.4, noRefl: true }); }

  /* ---------- trees: pitch pines and red maples about the yard, the wood's edge, shore scrub ---------- */
  [[-20, 124, 9.5], [21, 135, 8.5], [-5, 140, 10], [-36, 156, 8.5]].forEach(([x, z, hM]) => {
    const y0 = ground(x, z); used.push([x, z, 3]);
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => pitchPine(px, py, hM * kk, fog) }); });
  [[16.5, 129, 8.5, MAPLE], [-27, 136, 8, MAPLE], [-13, 132, 7.5, OAK], [29, 146, 7, MAPLE]].forEach(([x, z, hM, RAMP]) => {
    const y0 = ground(x, z); used.push([x, z, 3.5]);
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => broadleaf(px, py, hM * kk, RAMP, fog, Math.min(190, Math.round(hM * kk * .7))) }); });
  // trees along the wood's edge, so its front is made of trees, not a cut-off band
  for (let k = 0, n = 0; k < 30000 && n < 2200; k++) { const u = (r() - .5) * 1.25, z0 = 110 + Math.pow(r(), 1.6) * 700, x = u * z0, ws = wsZ(x), z = ws - 2 + r() * 10;
    if (z < 112) continue; const y0 = ground(x, z); if (y0 < .3 || !free(x, z, 1.4) || !seen(x, z)) continue; n++;
    const q = r(), near = z - zb(x) < 40, RAMP = q < .42 ? PP : q < .6 ? OAK : q < (near ? .85 : .74) ? MAPLE : GOLD;
    const room = (sy(y0, z) - (yLim(x / z) + 8)) * z / FL, hM = Math.max(3, Math.min(8 + r() * 4, room));
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => { const hp = hM * kk;
      if (hp > 45) return RAMP === PP ? pitchPine(px, py, hp, fog) : broadleaf(px, py, hp, RAMP, fog, Math.min(150, Math.round(hp * .6)));
      if (hp > 18) return `<g filter="url(#cbLeafy)">${clump(px, py, hp * .8, fog * .9, RAMP)}</g>`;
      return clump(px, py, Math.max(2.5, hp * .8), fog * .9, RAMP); } }); }
  // shore scrub: huckleberry, sweet gale, bayberry and young red maples along the bog's edge
  const HUCKR = ["#2e0a08", "#4a120c", "#661a10", "#842416", "#a2301c", "#be4a28", "#d46a3a", "#e89660"];
  const BAY = ["#1e2214", "#2a3018", "#383e1e", "#484e26", "#5a602e", "#6e7238", "#868846", "#a0a05a"];
  for (let k = 0, n = 0; k < 9000 && n < 1100; k++) { const u = (r() - .5) * 1.3, z0 = 108 + r() * 160, x = u * z0, b = zb(x), z = b + 1.2 + r() * 10;
    if (farL(x) > .5) continue; if (x > -24 && x < 34 && z < b + 22 && r() > .25) continue;
    const y0 = ground(x, z); if (y0 < .2 || z > wsZ(x) - 1 || !free(x, z, .4)) continue; n++;
    const hM = .5 + r() * 1.0, q = r(), RAMP = q < .45 ? HUCKR : q < .75 ? BAY : q < .9 ? MAPLE : GOLD;
    w.sprite({ x, z, y: y0 - .15, fn: (px, py, kk, fog) => clump(px, py, Math.max(2.2, hM * kk), fog, RAMP) }); }
  // a Cape house among the trees across the bog on the right, and one on the far left
  [[96, 249, -6], [-120, 352, 8]].forEach(([x, z, yaw]) => { const o = w.randomHouse(rl, { x, z, y: ground(x, z) - .1, fy: -.4, yaw, kind: "cottage", rng: rl });
    o.wall = x > 0 ? "#f2eee4" : "#8e8a80"; o.roof = "#3e3e44"; o.w = 10; w.house(o); used.push([x, z, 9]);
    if (NIGHT) { const [gx, gy] = w.proj([x, 2.2, z - 3]); w.sprite({ x, z: z - 4, y: 1, bias: -1, fn: () => `<circle cx="${F(gx)}" cy="${F(gy)}" r="14" fill="url(#cbGlow)" opacity=".7"/>` }); } });
  // the far dike's pump house
  { const x = -98, z = 268; w.box({ x, z, y: ground(x, z), w: 3, d: 3, h: 2.4, c: "#8a8276", top: "#4a4442" }); }

  /* ---------- the berry carpet: a per-pixel layer on the flooded bed ---------- */
  const SKYR = NIGHT ? H3("#3a4474") : H3("#c8d6e4");
  const CRIM = H3("#b8142e"), SCAR = H3("#dc2c3e"), DARK = H3("#760a20"), PINK = H3("#e8687a"), BURG = H3("#4a0614"), BLUSH = H3("#f0a0a0");
  const toneR = rgbTone(T);
  const berries = () => {
    const Hh = H - WY, cv = document.createElement("canvas"); cv.width = W; cv.height = Hh;
    const ctx = cv.getContext("2d"), img = ctx.createImageData(W, Hh), D = img.data;
    const OCT = [[.06, .55], [.18, .7], [.6, .85], [2, 1], [7, .9]];
    const [FLx, FLz] = [FLX + .3, FLZ - 3];
    for (let j = 0; j < Hh; j++) {
      const z = FL * EYE / (j + .5), fz = z * z / (FL * EYE), haze = 1 - Math.exp(-z * .00018);
      for (let i = 0; i < W; i++) {
        const x = (i + .5 - 1280) * z / FL; if (z >= zb(x)) continue;
        let n = 0, ws = 0;
        for (let k = 0; k < OCT.length; k++) { const [sc, a] = OCT[k], wt = sm(sc / (fz * 1.3) - .6) * a; if (wt <= 0) continue; n += wt * NB(x / sc + k * 7.1, z / sc - k * 3.3); ws += a; }
        n = ws ? n / ws * 1.6 : 0;
        const corral = inCorral(x, z), shore = sm(1 - (zb(x) - z) / 4);
        let d = corral ? 1.25 : .9 + .3 * NC(x / 4, z / 9) + .16 * n + .25 * shore;
        let a = cl((d - .42) * 2.6); a = 1 - Math.pow(1 - a, 1 + fz * 2.5);
        if (a <= .01) continue;
        const big = NC(x / 14 + 3, z / 30) * .5 + .5;
        let c = L3(CRIM, SCAR, big + n * .3);
        if (NC(x / 3 + 9, z / 6) > .35) c = L3(c, PINK, (NC(x / 3 + 9, z / 6) - .35) * 1.4);
        if (corral) c = L3(c, DARK, .32 - n * .2);
        c = L3(c, BURG, cl(-n * .5 - .05));
        const lit = .8 + .36 * n + .12 * NC(x / 12, z / 1.6) + (corral ? .05 * Math.sin(z * 1.3 + x * .4) : 0);
        c = c.map(v => v * lit);
        c = L3(c, SKYR, .18 * sm(fz / 1.6) + .06);                    // sheen at grazing angles
        const hg = hash(i, j), gl = sm(.6 - fz) * (.035 + .05 * sm((900 - i) / 900));
        if (!NIGHT && hg > 1 - gl) c = L3(c, BLUSH, .75);
        c = toneR(c);
        if (NIGHT) { const fd = Math.hypot(x - FLx, (z - FLz) * .8), fk = Math.exp(-((fd / 24) ** 2));
          if (fk > .01) c = L3(c, L3(SCAR, H3("#ffa070"), .15 + .25 * n).map(v => v * (.9 + .2 * n)), fk * .85);
          const mx = 1280 + (MOX - 1280) * 1, mk = Math.exp(-(((i - mx) / (60 + j * .9)) ** 2)) * .35;
          if (hg > 1 - .05 * mk * 3) c = L3(c, H3("#e6e8ff"), .7); }
        const p = (j * W + i) * 4; D[p] = c[0]; D[p + 1] = c[1]; D[p + 2] = c[2]; D[p + 3] = Math.round(a * 255); } }
    ctx.putImageData(img, 0, 0);
    return `<image href="${cv.toDataURL("image/png")}" x="0" y="${WY}" width="${W}" height="${Hh}" preserveAspectRatio="none"/>`; };

  /* ---------------- assemble: water, reflections, the land, berries, then everything on it ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  const SY0 = sy(0, 108), K = .8;
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#cbWater)"/>`;
  s += `<g clip-path="url(#cbCW)"><g opacity="${NIGHT ? .7 : .6}" filter="url(#cbRipple)">`
    + `<g transform="matrix(1,0,0,${-K},0,${F(SY0 * (1 + K))})">${w.draw({ where: isR })}</g>${w.draw({ mirror: true })}</g></g>`;
  for (let k = 0; k < 90; k++) { const y = WY + 3 + Math.pow(r(), .8) * (H - WY - 3), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(30 + r() * 140 * (.4 + t))}" height="${F(1 + t)}" rx="1" fill="${NIGHT ? "#6a74b0" : "#f4f6fa"}" opacity="${F(.05 + r() * .1)}"/>`; }
  if (NIGHT) s += `<rect x="${MOX - 40}" y="${WY}" width="80" height="${H - WY}" fill="#c8d0ff" opacity=".06" filter="url(#cbSoft)"/>`;
  s += w.draw({ where: isR });
  s += berries();
  s += `<rect x="0" y="340" width="${W}" height="120" fill="url(#cbHaze)" opacity=".3"/>`;
  s += w.draw({ where: notR });
  // the near dike's grass at the bottom corners: little bluestem and sweet gale
  const grass = (x0, x1) => { let g = "";
    for (let i = 0; i < 90; i++) { const x = x0 + r() * (x1 - x0), y = 700 + r() * 30, hh = 50 + r() * 110, bend = (r() - .3) * 50;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(["#b0703a", "#c48a4a", "#8a5a30", "#d0a060"][Math.floor(r() * 4)])}" stroke-width="${F(1.8 + r() * 2.4)}" fill="none" stroke-linecap="round"/>`; }
    return g; };
  s += grass(0, 240) + grass(2340, 2560);

  s += `<rect width="${W}" height="${H}" fill="url(#cbLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".06"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#cbPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
