/* Hollow Mill Pond: Halloween at an old stone gristmill. Seen from a skiff on
   the mill pond, a three-storey fieldstone mill stands on its quay across the
   water with an overshot waterwheel on its front, fed by a wooden flume on
   trestles that runs off to the left along the bank. Jack-o'-lanterns line the
   quay, a string of lanterns hangs from the flume, corn shocks stand by the
   door, and the miller's house sits beside it. The hollow's wooded sides
   (crimson, orange, gold) close in left and right and open to blue ridges up
   the valley. Late afternoon: the sun is low off the left edge, mist rises on
   the pond and crows head home.
   opts.time === "night": moonless, stars, bats, lit mill windows, glowing
   jack-o'-lanterns and lantern string, all reflected in the pond.
   The land is one world3d() raster (reference/scene-helpers.js); the mill,
   flume, quay, house and trees are placed in metres by the same camera.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function hollowMillPondArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 3187;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17), rp = rng(seed + 29);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -180, LY = 300, WY = 452;
  const T = c => NIGHT ? mix(mix(c, "#7a7488", .4), "#0c0e2e", .62) : c;
  const HZ = NIGHT ? "#2c2c52" : "#e6c6aa", RIM = NIGHT ? "#a8b0e0" : "#ffe2b0", LAMP = "#ffb44a", SHADE = NIGHT ? "#04050e" : "#3a2a48";
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

  /* ---------------- sky: apricot late afternoon, or a moonless starry night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#05061a"/><stop offset=".45" stop-color="#0e1036"/><stop offset=".82" stop-color="#22224e"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#46679e"/><stop offset=".38" stop-color="#8aa2c4"/><stop offset=".7" stop-color="#e2bca6"/><stop offset="1" stop-color="#f6d2a2"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#7a6aa8" stop-opacity=".14"/><stop offset="1" stop-color="#7a6aa8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2c8" stop-opacity=".95"/><stop offset=".2" stop-color="#ffd89a" stop-opacity=".5"/><stop offset=".6" stop-color="#ffbc80" stop-opacity=".14"/><stop offset="1" stop-color="#ffbc80" stop-opacity="0"/>`;
  let s = `<defs id="hmdefs">
    <linearGradient id="hmSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="hmLight" cx="${LX}" cy="${LY}" r="1500" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="hmHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".75"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="hmWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#2a2a52"/><stop offset=".2" stop-color="#14163a"/><stop offset="1" stop-color="#05071a"/>`
      : `<stop offset="0" stop-color="#d8bca4"/><stop offset=".16" stop-color="#8a8e8a"/><stop offset=".55" stop-color="#4a5a58"/><stop offset="1" stop-color="#2a3634"/>`}</linearGradient>
    <radialGradient id="hmGlow"><stop offset="0" stop-color="#ffd890" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".4"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <clipPath id="hmCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="hmLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hmCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="3" seed="33" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="hmRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".003 .08" numOctaves="2" seed="12" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".9"/></filter>
    <filter id="hmPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="hmSoft"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="hmMist"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hmSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 700; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 420, big = rs() < .07;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.25 + rs() * .6 * (1 - y / 460))}"/>`; }
    s += `<path d="M300,0 C700,160 1500,240 2560,300" stroke="#8a90c8" stroke-width="170" fill="none" opacity=".05" filter="url(#hmSoft)"/>`;
    s += `<rect width="${W}" height="${H}" fill="url(#hmLight)"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#hmLight)"/>`;
    s += `<g class="rays" opacity=".08" filter="url(#hmSoft)">`;
    for (let k = 0; k < 6; k++) { const a = -.12 + k * .07, L = 1900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: long sunset-lit strata, thin in the text corners; crows or bats ---------------- */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#hmCloudy)">`;
    const lobes = [];
    for (let k = 0; k < 10; k++) { const t = k / 9; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .06 * (.6 + rs() * .7), w * (.06 + rs() * .05)]); }
    if (NIGHT) {
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .028)}" fill="#14163a"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .38)}" fill="#1c1e46"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .3)}" cy="${F(ly - R * .1)}" rx="${F(R * .9)}" ry="${F(R * .14)}" fill="#34386a" opacity=".6"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .03)}" rx="${F(w * .55)}" ry="${F(w * .04)}" fill="#b89ab0"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .25)}" rx="${F(R * 1.3)}" ry="${F(R * .5)}" fill="#d8aab0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.1)}" ry="${F(R * .5)}" fill="#f2c8a8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .4)}" cy="${F(ly - R * .18)}" rx="${F(R * .6)}" ry="${F(R * .24)}" fill="#ffe6c0"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(520, 175, 560, "drift1") + cloud(1180, 70, 420, "drift2") + cloud(1950, 150, 600, "drift3") + cloud(2430, 250, 300, "drift1") + cloud(1640, 300, 260, "drift2");
  if (NIGHT) {   // bats over the mill
    s += `<g class="birds">`;
    [[1010, 120, 1.9], [1080, 182, 1.4], [1160, 96, 1.2], [1225, 205, 1.6], [1320, 60, 1.1], [1395, 150, 1.5], [1460, 230, 1.0], [960, 230, 1.1]].forEach(([x, y, k], i) => {
      const fl = i % 2 ? -1 : 1, wy = fl * 1.5 * k;
      const wing = sd => `M${F(x + sd * 1 * k)},${F(y - k)} Q${F(x + sd * 6 * k)},${F(y - 6 * k - wy)} ${F(x + sd * 12 * k)},${F(y - 3 * k - wy)} Q${F(x + sd * 10 * k)},${F(y)} ${F(x + sd * 9 * k)},${F(y + 1.2 * k)} Q${F(x + sd * 7.5 * k)},${F(y - .6 * k)} ${F(x + sd * 6 * k)},${F(y + 1.6 * k)} Q${F(x + sd * 4 * k)},${F(y - .2 * k)} ${F(x + sd * 1 * k)},${F(y + 1.2 * k)}Z`;
      s += `<path d="${wing(-1)} ${wing(1)}" fill="#05050c" opacity=".9"/><ellipse cx="${x}" cy="${F(y)}" rx="${F(1.6 * k)}" ry="${F(2.6 * k)}" fill="#05050c"/>`;
      s += `<path d="M${F(x - 1.2 * k)},${F(y - 2 * k)} l${F(.3 * k)},${F(-1.6 * k)} l${F(.6 * k)},${F(1.2 * k)} M${F(x + 1.2 * k)},${F(y - 2 * k)} l${F(-.3 * k)},${F(-1.6 * k)} l${F(-.6 * k)},${F(1.2 * k)}" fill="#05050c" stroke="#05050c" stroke-width="1"/>`; });
    s += `</g>`;
  } else {       // crows heading home over the hollow
    s += `<g class="birds" fill="none" stroke="#2a2230" stroke-width="2.3" stroke-linecap="round" opacity=".8">`;
    [[950, 232, 1], [990, 214, .9], [1024, 240, .85], [1062, 205, .8], [1100, 226, .7], [918, 254, .75]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 12 * k)},${F(y - 2 * k)} q${F(6 * k)},${F(-6 * k)} ${F(12 * k)},${F(2 * k)} q${F(5 * k)},${F(-6 * k)} ${F(12 * k)},${F(-2 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 2.6 m above the pond (a skiff), horizon on WY; metres, x right, y up, z away.
     The far shore is zb(x); behind it a valley floor runs up the hollow (axis xv(z))
     between wooded sides, with blue ridges beyond. */
  const EYE = 2.6, FL = 2000;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: [-.82, .4, -.3], tone: T, fog: HZ, fogK: .00016,
    shadow: SHADE, rim: RIM, shade: .52, hi: .28, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const MX = 2, MZ = 101.5, WX = MX - 3.6, WZ = 95.7, WCY = 4.6, WR = 4.1;            // mill centre; wheel centre and radius
  const nearMill = x => sm(1 - Math.abs(x - 2) / 34);
  const zb = x => 95 + (1 - nearMill(x)) * (3 + 5 * N1(x / 30, 3.3) + Math.max(0, Math.abs(x) - 40) * .25);
  const xv = z => 10 + .12 * (z - 100);
  const yLim = u => 318 + 40 * Math.exp(-(((u - .02) / .22) ** 2)) + 10 * Math.sin(u * 11 + 1);
  const capH = (x, z) => EYE + (WY - yLim(x / z)) * z / FL * (.92 + .08 * N3(x / 140, z / 140));
  const MF = mountainField({ seed: 913, scale: 2200, oct: 5, peaks: [
    { x: -2000, z: 3400, h: 170, rx: 1700, rz: 1200 }, { x: 2400, z: 3800, h: 190, r: 1800 }, { x: 300, z: 5600, h: 240, r: 2600 }, { x: -5200, z: 6400, h: 260, r: 2600 } ] });
  const floorH = (x, z) => 1.5 + .006 * Math.max(0, z - 100);
  const onFloor = (x, z) => { const a = x - xv(z); return Math.abs(a) < (a < 0 ? 22 : 36) + 6 * N1(x / 40, z / 40); };   // the open valley floor
  const hT = (x, z) => {
    if (Math.abs(x - WX) < 4.5 && z < 96.4) return -1;                                   // the tailrace under the wheel
    const d = z - zb(x); if (d < 0) return -1;
    const fl = floorH(x, z), a = x - xv(z), off = a < 0 ? 26 : 40, A = Math.abs(a);
    const side = (a < 0 ? 70 : 64) * sm((A - off - .05 * d) / (170 + .25 * d)) * (.8 + .35 * N2(x / 90, z / 90)) * sm(d / 45);   // the sides climb away from the water, never a cliff at it
    let h = fl + side + 2.2 * N2(x / 26, z / 26) * sm((A - 20) / 40) * sm(d / 12);
    h = d < 2.5 ? -.6 + (h + .6) * sm(d / 2.5) : h;
    if (z > 900) { const far = MF(x, z) * sm((z - 900) / 1800); if (far > h) h = far; }
    return h > 0 ? Math.min(h, capH(x, z)) : h; };
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const FOR = ["#34442a", "#4a4a24", "#b4622a", "#962e1e", "#cc9630", "#7a3a20", "#d87a2a"].map(H3);
  const MEAD = H3("#b0a058"), MEAD2 = H3("#8a8a44"), MUD = H3("#6a5a48"), STONE = H3("#8e8474");
  const woods = (x, z) => { const k = N1(x / 30, z / 30) * .5 + .5, t = N2(x / 6, z / 6) * .5 + .5;
    let c = L3(FOR[0], FOR[1], k);
    c = L3(c, FOR[2 + Math.floor(hash(Math.floor(x / 18), Math.floor(z / 18)) * 5)], sm((N3(x / 45 + 4, z / 45) + .25) / .45) * .9);
    return c.map(v => v * (.74 + .5 * t)); };
  const col = (x, y, z, n) => {
    const steep = 1 - n[1], fl = floorH(x, z);
    if (y < .5) return L3(MUD, STONE, .5 + .5 * N3(x / 2, z / 2));
    if (z > 1400) return woods(x, z);
    if (onFloor(x, z) && steep < .2) return L3(MEAD, MEAD2, .5 + .6 * N2(x / 14, z / 14));
    return woods(x, z); };
  w.raster({ z0: 40, z1: 16000, step: .0011, minStep: .2, scale: .75, top: 40, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00016, amb: NIGHT ? .55 : .4, noRefl: true });

  /* ---------- 2D drawings placed as sprites ---------- */
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const GOLD = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const OAK = ["#2a2a14", "#3a3a18", "#4e4a1e", "#646024", "#7a722c", "#94863a", "#ae9e52", "#c8bc78"];
  const broadleaf = (x, y, hp, RAMP, fog, n) => {     // trunk, limbs and a crown of many lit leaf clumps
    const sd = LX < x ? -1 : 1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .03), ty = y - hp * .22;
    g += `<ellipse cx="${F(x + hp * .12)}" cy="${F(y + 1)}" rx="${F(hp * .3)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".22"/>`;
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
    return g + `<g filter="url(#hmLeafy)">${cg}</g>`; };
  /* a small far tree: a dark irregular mass with shaded, mid and lit clumps */
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1e1008", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(48, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (x - px) + (y - sz * .5 - py) * .6, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };
  /* a dead snag: forked trunk and crooked bare limbs, lit on the sun side */
  const snag = (x, y, hp) => { let g = `<ellipse cx="${F(x + hp * .1)}" cy="${F(y + 1)}" rx="${F(hp * .12)}" ry="${F(hp * .02)}" fill="#000" opacity=".25"/>`;
    const limb = (bx, by, a, L, wd, dep) => { if (dep > 5 || L < 3) return;
      const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L, mx = (bx + ex) / 2 + (r() - .5) * L * .25, my = (by + ey) / 2 + (r() - .5) * L * .2;
      g += `<path d="M${F(bx)},${F(by)} Q${F(mx)},${F(my)} ${F(ex)},${F(ey)}" stroke="${T("#3e3430")}" stroke-width="${F(wd)}" fill="none" stroke-linecap="round"/>`;
      if (wd > 2.2) g += `<path d="M${F(bx - wd * .3)},${F(by)} Q${F(mx - wd * .3)},${F(my)} ${F(ex - wd * .25)},${F(ey)}" stroke="${T(NIGHT ? "#6a6488" : "#b8a080")}" stroke-width="${F(wd * .3)}" fill="none" stroke-linecap="round" opacity=".7"/>`;
      const nb = 2 + (r() < .4 ? 1 : 0);
      for (let i = 0; i < nb; i++) limb(ex, ey, a + (i - (nb - 1) / 2) * (.6 + r() * .4) + (r() - .5) * .3, L * (.55 + r() * .2), wd * .62, dep + 1); };
    limb(x, y, -Math.PI / 2 + .04, hp * .42, Math.max(3, hp * .045), 0);
    return g; };
  /* a jack-o'-lantern (carved and lit, or not), a corn shock, a lantern bulb */
  const pumpkin = (px, py, kk, sz, carved) => { const R = Math.max(2.2, sz * kk), cy = py - R * .82;
    const body = T(["#d86a1c", "#e07a24", "#c85a18", "#e88a2c"][Math.floor(rp() * 4)]);
    let g = `<ellipse cx="${F(px + R * .3)}" cy="${F(py)}" rx="${F(R * 1.3)}" ry="${F(R * .22)}" fill="#000" opacity=".3"/>`;
    if (carved && NIGHT) g += `<circle cx="${F(px)}" cy="${F(cy)}" r="${F(R * 5)}" fill="url(#hmGlow)" opacity=".55"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R * 1.15)}" ry="${F(R * .86)}" fill="${body}"/>`;
    g += `<ellipse cx="${F(px + R * .25)}" cy="${F(cy + R * .05)}" rx="${F(R * .8)}" ry="${F(R * .8)}" fill="${mix(body, "#3a1408", .35)}" opacity=".55"/>`;
    g += `<ellipse cx="${F(px - R * .35)}" cy="${F(cy - R * .1)}" rx="${F(R * .45)}" ry="${F(R * .65)}" fill="${mix(body, NIGHT ? "#ff9a40" : "#ffd28a", .4)}" opacity=".7"/>`;
    g += `<path d="M${F(px)},${F(cy - R * .8)} q${F(R * .1)},${F(-R * .4)} ${F(R * .35)},${F(-R * .5)}" stroke="${T("#4a5a24")}" stroke-width="${F(Math.max(1, R * .22))}" fill="none" stroke-linecap="round"/>`;
    if (carved) { const fc = NIGHT ? "#ffe07a" : "#5a2a0a", gl = "";
      g += `<path d="M${F(px - R * .55)},${F(cy - R * .05)} l${F(R * .2)},${F(-R * .32)} l${F(R * .2)},${F(R * .32)}Z M${F(px + R * .15)},${F(cy - R * .05)} l${F(R * .2)},${F(-R * .32)} l${F(R * .2)},${F(R * .32)}Z M${F(px - R * .6)},${F(cy + R * .2)} q${F(R * .6)},${F(R * .45)} ${F(R * 1.2)},0 l${F(-R * .2)},${F(R * .1)} l${F(-R * .2)},${F(-R * .08)} l${F(-R * .2)},${F(R * .08)} l${F(-R * .2)},${F(-R * .08)}Z" fill="${fc}"${gl}/>`; }
    return g; };
  const shock = (px, py, kk) => { const h = 2.3 * kk, wd = 1.0 * kk; let g = `<ellipse cx="${F(px + wd * .4)}" cy="${F(py)}" rx="${F(wd * 1.1)}" ry="${F(wd * .16)}" fill="#000" opacity=".28"/>`;
    for (let i = 0; i < 26; i++) { const t = i / 25, bx = px + (t - .5) * wd * 2, lit = t < .45, tx = px + (t - .5) * wd * .35, ty = py - h * .62;
      g += `<path d="M${F(bx)},${F(py)} L${F(tx)},${F(ty)} L${F(px + (t - .5) * wd * .9 + (rp() - .5) * wd * .3)},${F(py - h * (.92 + rp() * .1))}" stroke="${T(lit ? (rp() < .5 ? "#e0c070" : "#d2ae5a") : (rp() < .5 ? "#9a7a3a" : "#7e6230"))}" stroke-width="${F(Math.max(1, kk * .1))}" fill="none"/>`; }
    g += `<path d="M${F(px - wd * .2)},${F(py - h * .62)} L${F(px + wd * .2)},${F(py - h * .62)}" stroke="${T("#6a4a22")}" stroke-width="${F(Math.max(1, kk * .12))}"/>`;
    return g; };

  /* is the ground at (x, z) seen, or hidden behind nearer land? */
  const seen = (x, z) => { const y0 = sy(hT(x, z), z) - 1.5;
    for (let q = 90; q < z * .985; q += Math.max(.5, q * .012)) { const xq = x * q / z, hq = hT(xq, q); if (hq < 0) continue; if (sy(hq, q) < y0) return false; }
    return true; };
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);

  /* ---------- the mill: fieldstone, three storeys and a loft, gable roof, overshot wheel on its front ---------- */
  const MW = 15, MD = 10, MH = 12.4, MY = 1.5;
  const WALLC = "#a89a84", TRIMC = "#e6dcc4";
  const millWin = (n, q, len) => {
    for (let i = 0; i < 90; i++) { const u = rl() * len, v = rl() * MH, sw = .5 + rl() * .7;     // stone patches
      q(u, v, Math.min(len, u + sw), Math.min(MH, v + .28 + rl() * .2), rl() < .5 ? "#bcae96" : "#8a7e6c", { off: .03, op: .35 }); }
    if (n === "front") {
      const rows = [[1.9, 3.5], [5.4, 7.0], [8.9, 10.5]], DU = 11.7;
      rows.forEach(([v0, v1], ri) => { for (let u = 1.6; u < len - .9; u += 2.25) {
        if (Math.abs(u - DU) < 1.3 && ri !== 1) continue; if (ri < 2 && u < 8.9) continue;
        const lt = NIGHT && rl() < .75;
        q(u - .75, v1 + .02, u + .75, v1 + .38, "#cabea4", { off: .05 });
        q(u - .58, v0 - .1, u + .58, v1 + .04, TRIMC, { off: .05 });
        q(u - .47, v0, u + .47, v1, lt ? LAMP : "#3a363e", { glow: lt, off: .07 });
        q(u - .47, (v0 + v1) / 2 - .05, u + .47, (v0 + v1) / 2 + .05, TRIMC, { off: .08 });
        q(u - .04, v0, u + .04, v1, TRIMC, { off: .08 }); } });
      q(DU - 1.2, 0, DU + 1.2, 3.0, TRIMC); q(DU - 1.05, 0, DU + 1.05, 2.85, NIGHT ? "#a85a20" : "#6a3a24", { off: .07, glow: NIGHT });
      q(DU - .03, 0, DU + .03, 2.85, "#3a2016", { off: .08 });
      q(DU - .85, 8.7, DU + .85, 10.9, TRIMC); q(DU - .72, 8.8, DU + .72, 10.8, "#6a3a24", { off: .07 });
      q(DU - 1.4, 11.6, DU + 1.4, 11.9, "#5a4030", { off: .3 });
    } else if (n === "right") {
      [[1.9, 3.5], [5.4, 7.0], [8.9, 10.5]].forEach(([v0, v1]) => { for (let u = 1.7; u < len - .9; u += 2.6) { const lt = NIGHT && rl() < .6;
        q(u - .58, v0 - .1, u + .58, v1 + .04, TRIMC, { off: .05 }); q(u - .47, v0, u + .47, v1, lt ? LAMP : "#3a363e", { glow: lt, off: .07 }); } });
    } };
  w.house({ x: MX, z: MZ, y: MY, fy: -2.8, yaw: 0, w: MW, d: MD, h: MH, rh: 5.6, wall: WALLC, roof: "#4a3c3a", trim: "#c8bca4", stone: "#7a7064",
    clap: false, door: false, win: () => false, extra: millWin, chim: .82, chimC: "#8a7e6c", rng: rl });
  used.push([MX, MZ, 10]);
  // the wheel: rim, buckets lit from the left, spokes, hub; water pouring from the flume
  const wheelSprite = (px, py, kk) => { const R = WR * kk, R2 = (WR - .75) * kk, aL = Math.atan2(-.45, -.9);
    const WD = ["#2a1c14", "#3a281c", "#4c3424", "#5e422c", "#725238", "#8a6646", "#a07a56", "#b8946c"].map(T);
    let g = `<circle cx="${F(px + R * .16)}" cy="${F(py + R * .08)}" r="${F(R * 1.02)}" fill="#000" opacity=".26"/>`;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .2;
      g += `<path d="M${F(px)},${F(py)} L${F(px + Math.cos(a) * R2)},${F(py + Math.sin(a) * R2)}" stroke="${WD[2]}" stroke-width="${F(.24 * kk)}"/>`; }
    g += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(R2)}" fill="none" stroke="${WD[3]}" stroke-width="${F(.2 * kk)}"/>`;
    const n = 30;
    for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = a0 + Math.PI * 2 / n * .78, sh = Math.cos(a0 - aL) * .5 + .5;
      const P = [[R, a0], [R, a1], [R2, a1 + .04], [R2, a0 + .04]].map(([q, a]) => `${F(px + Math.cos(a) * q)},${F(py + Math.sin(a) * q)}`);
      g += `<path d="M${P.join("L")}Z" fill="${WD[Math.min(7, 1 + Math.floor(sh * 6.9))]}"/>`; }
    g += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(R)}" fill="none" stroke="${WD[4]}" stroke-width="${F(.16 * kk)}"/><circle cx="${F(px)}" cy="${F(py)}" r="${F(R2)}" fill="none" stroke="${WD[1]}" stroke-width="${F(.12 * kk)}"/>`;
    g += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(.55 * kk)}" fill="${WD[3]}"/><circle cx="${F(px - .12 * kk)}" cy="${F(py - .12 * kk)}" r="${F(.25 * kk)}" fill="${WD[6]}"/>`;
    // water: a sheet off the flume onto the top buckets, then spilling down the left side
    const wc = NIGHT ? "#8a98c8" : "#e8f2f4";
    g += `<path d="M${F(px + .3 * kk)},${F(py - R - .3 * kk)} Q${F(px - R * .55)},${F(py - R * 1.02)} ${F(px - R * .92)},${F(py - R * .25)}" stroke="${wc}" stroke-width="${F(.35 * kk)}" fill="none" opacity=".55"/>`;
    for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 - rp() * 2.3, q = R + rp() * .3 * kk;
      g += `<circle cx="${F(px + Math.cos(a) * q)}" cy="${F(py + Math.sin(a) * q)}" r="${F(.06 * kk + rp() * .08 * kk)}" fill="${wc}" opacity="${F(.4 + rp() * .4)}"/>`; }
    g += `<ellipse cx="${F(px - R * .3)}" cy="${F(py + R + .1 * kk)}" rx="${F(R * .7)}" ry="${F(.22 * kk)}" fill="${wc}" opacity=".45"/>`;
    return g; };
  w.sprite({ x: WX, z: WZ, y: WCY, bias: -2.2, fn: (px, py, kk) => wheelSprite(px, py, kk) });

  /* ---------- the flume on trestles, from the wheel's crown off to the left, and its end pier ---------- */
  /* two runs: along the mill front from the wheel's crown, then turning back up the hollow to a stone
     pier on the rising hillside, so it recedes instead of standing across the picture like a gate */
  const FY = WCY + WR + .25, FZ = 95.6, FP = [[WX + .4, FZ], [-9, FZ], [-36, 131]];
  const deg = 180 / Math.PI;
  for (let i = 0; i < 2; i++) { const [ax, az] = FP[i], [bx, bz] = FP[i + 1], L = Math.hypot(bx - ax, bz - az) + (i ? 0 : .6), yaw = Math.atan2(bz - az, bx - ax) * deg;
    w.box({ x: (ax + bx) / 2, z: (az + bz) / 2, y: FY, yaw, w: L, d: 1.2, h: .8, c: "#6a4e36", top: "#4a5a6a" }); }
  const fAt = t => { const L1 = Math.hypot(FP[1][0] - FP[0][0], FP[1][1] - FP[0][1]), L2 = Math.hypot(FP[2][0] - FP[1][0], FP[2][1] - FP[1][1]), u = t * (L1 + L2);
    if (u <= L1) return [FP[0][0] + (FP[1][0] - FP[0][0]) * u / L1, FP[0][1]];
    const v = (u - L1) / L2; return [FP[1][0] + (FP[2][0] - FP[1][0]) * v, FP[1][1] + (FP[2][1] - FP[1][1]) * v]; };
  const FLEN = Math.hypot(FP[1][0] - FP[0][0], 0) + Math.hypot(FP[2][0] - FP[1][0], FP[2][1] - FP[1][1]);
  const posts = [];
  for (let u = 4.8; u < FLEN - 1.5; u += 3.2) { const [x, z] = fAt(u / FLEN); if (x > WX - WR - .3) continue;
    const gy = Math.max(-.8, hT(x, z)); if (FY - gy < .6) continue; posts.push([x, z, gy]);
    w.box({ x, z, y: gy, w: .34, d: .34, h: FY - gy, c: "#5a4230", wet: true });
    w.box({ x: x + .9, z, y: gy, w: .3, d: .3, h: FY - gy, c: "#4e3a2a", wet: true }); }
  posts.forEach(([x, z, gy], i) => { if (!posts[i + 1]) return; const [x2, z2, gy2] = posts[i + 1];
    w.line(i % 2 ? [[x, gy + .4, z - .2], [x2, FY - .15, z2 - .2]] : [[x, FY - .15, z - .2], [x2, gy2 + .4, z2 - .2]], "#5a4230", .14);
    w.line([[x, (gy + FY) / 2, z - .2], [x2, (gy2 + FY) / 2, z2 - .2]], "#4e3a2a", .1); });
  { const [x, z] = FP[2], gy = hT(x, z) - .5; w.box({ x, z, y: gy, w: 2.6, d: 2.6, h: FY + .9 - gy, c: "#8e8270", top: "#9a8e7c" }); used.push([x, z, 3]); }
  // the lantern string swagged between the trestle posts
  posts.forEach(([x, z], i) => { if (!posts[i + 1]) return; const [x2, z2] = posts[i + 1];
    const pts = Array.from({ length: 9 }, (_, k) => { const t = k / 8; return [x + (x2 - x) * t, FY - .35 - Math.sin(t * Math.PI) * .8, z + (z2 - z) * t - .75]; });
    w.line(pts, "#2a2420", .03, { min: .6 });
    for (let k = 1; k < 5; k++) { const [bx, by, bz] = pts[k * 2];
      w.sprite({ x: bx, z: bz, y: by, bias: -1.5, fn: (px, py, kk) => (NIGHT ? `<circle cx="${F(px)}" cy="${F(py)}" r="${F(kk * .9)}" fill="url(#hmGlow)" opacity=".8"/>` : "")
        + `<circle cx="${F(px)}" cy="${F(py + kk * .12)}" r="${F(Math.max(1.2, kk * .13))}" fill="${NIGHT ? "#ffd27a" : ["#e07a24", "#c84a2a", "#7a4a8a"][k % 3]}"/>` }); } });

  /* ---------- the quay in front of the mill, broken by the tailrace ---------- */
  [[-15, WX - 4.6], [WX + 4.6, 24]].forEach(([a, b]) => w.box({ x: (a + b) / 2, z: 94.6, y: -1.2, w: b - a, d: 1.6, h: 2.8, c: "#8a8072", top: "#a49a88", wet: true,
    dec: (fc, Pf) => { fc[0].dec = Array.from({ length: Math.round((b - a) * 3) }, () => { const u = (rl() - .5) * (b - a), v = -1.1 + rl() * 2.6, wd = .4 + rl() * .6;
      return { P: [[u, v, -.82], [u + wd, v, -.82], [u + wd, v + .25, -.82], [u, v + .25, -.82]].map(Pf), c: rl() < .5 ? "#a49884" : "#6e665a", op: .45 }; }); } }));
  // the wheel pit walls either side of the tailrace
  [WX - 4.7, WX + 4.7].forEach(x => w.box({ x, z: 95.4, y: -1.2, w: .5, d: 2.2, h: 2.9, c: "#857a6c", top: "#9e9482", wet: true }));

  /* ---------- the miller's house, a woodshed, corn shocks and jack-o'-lanterns ---------- */
  { const o = w.randomHouse(rl, { x: 27, z: 109, y: 1.5, fy: -.7, yaw: -4, kind: "cottage", rng: rl, porch: true });
    o.wall = "#e8dcc4"; o.roof = "#3e3a3a"; o.shut = "#2a3a32"; o.w = Math.min(o.w, 9.5); w.house(o); used.push([27, 109, 8]);
    if (NIGHT) { const [gx, gy] = w.proj([27 - .5, 3.6, 109 - o.d / 2 - 2.6]); w.sprite({ x: 27, z: 109 - o.d / 2 - 3, y: 3.4, bias: -1, fn: () => `<circle cx="${F(gx)}" cy="${F(gy)}" r="26" fill="url(#hmGlow)" opacity=".8"/>` }); } }
  { const SX = -31, SZ = 104, gy = hT(SX, SZ);
    w.box({ x: SX, z: SZ, y: gy - .3, w: 4.2, d: 3, h: 2.9, c: "#5a4232", top: "#3e3430" });
    w.add([{ P: [[SX - 2.3, gy + 3.1, SZ - 1.7], [SX + 2.3, gy + 3.1, SZ - 1.7], [SX + 2.3, gy + 2.2, SZ + 1.6], [SX - 2.3, gy + 2.2, SZ + 1.6]], c: "#4a3c38", two: true, up: true }]);
    for (let i = 0; i < 9; i++) w.box({ x: SX - 1.7 + i * .45, z: SZ - 1.8, y: gy - .1, w: .42, d: .4, h: 1.3 + (i % 3) * .15, c: "#8a6a48", top: "#c8a878" });
    used.push([SX, SZ, 4]); }
  [[MX + 7.6, 96.9], [MX + 12.3, 96.9], [21.5, 104.5], [33, 104]].forEach(([x, z]) => w.sprite({ x, z, y: 1.5, bias: -1, fn: (px, py, kk) => shock(px, py, kk) }));
  // jack-o'-lanterns along the quay top, on the mill step and by the house porch
  const pk = [];
  for (let x = -14; x < 23; x += 2.1 + rp() * 1.8) { if (Math.abs(x - WX) < 5.2) continue; pk.push([x + (rp() - .5) * .5, 94.4 + rp() * .5, 1.6, .26 + rp() * .16]); }
  [[MX + 8.8, 96.6, .34], [MX + 11.1, 96.6, .3], [MX + 9.4, 96.3, .22], [22.5, 104.2, .3], [24, 104, .24], [31.8, 104.2, .36]].forEach(([x, z, sz]) => pk.push([x, z, 1.5, sz]));
  pk.forEach(([x, z, y, sz]) => { const carved = rp() < .75; w.sprite({ x, z, y, bias: -1.2, fn: (px, py, kk) => pumpkin(px, py, kk, sz, carved) }); });
  // a lamp over the mill door
  { const [lx, ly] = w.proj([MX - MW / 2 + 11.7, MY + 3.5, MZ - MD / 2 - .3]);
    w.sprite({ x: MX + 4.2, z: MZ - MD / 2 - .4, y: MY + 3.3, bias: -.6, fn: () => (NIGHT ? `<circle cx="${F(lx)}" cy="${F(ly)}" r="34" fill="url(#hmGlow)" opacity=".9"/>` : "")
      + `<rect x="${F(lx - 3)}" y="${F(ly - 5)}" width="6" height="9" rx="1.5" fill="${NIGHT ? "#ffe0a0" : "#2a2a30"}"/>` }); }

  /* ---------- trees: maples beside the mill, the wood's edge on the hillsides, a dead snag ---------- */
  [[-11, 117, 17, MAPLE], [17, 123, 18, GOLD], [40, 116, 15, RUST], [-30, 112, 13, GOLD], [55, 104, 12, MAPLE]].forEach(([x, z, hM, RAMP]) => {
    const y0 = hT(x, z); used.push([x, z, 4]);
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => broadleaf(px, py, hM * kk, RAMP, fog, Math.min(200, Math.round(hM * kk * .7))) }); });
  w.sprite({ x: -17, z: 97.6, y: hT(-17, 97.6), bias: -.5, fn: (px, py, kk) => snag(px, py, 11 * kk) }); used.push([-17, 97.6, 1.5]);
  /* the wood: crowns packed on the hillsides (no trunks showing, as in a real wood's canopy), a few in the meadow;
     each crown is kept below the land cap so the text corners stay calm */
  for (let k = 0, n = 0; k < 40000 && n < 3600; k++) { const z = 100 + Math.pow(r(), 2.2) * 1300, u = (r() - .5) * 1.35, x = u * z;
    if (z < zb(x) + 3) continue; const y0 = hT(x, z);
    if (y0 < .3 || (onFloor(x, z) && r() > .04)) continue;
    if (!free(x, z, 1.4) || !seen(x, z)) continue; n++;
    const q = r(), RAMP = q < .3 ? MAPLE : q < .55 ? GOLD : q < .75 ? RUST : OAK, room = (sy(y0, z) - (yLim(x / z) - 70)) * z / FL;
    const hM = Math.max(4, Math.min(8 + r() * 6, room));
    w.sprite({ x, z, y: y0 - .4, fn: (px, py, kk, fog) => hM * kk > 70 ? broadleaf(px, py, hM * kk * 1.15, RAMP, fog, Math.min(170, Math.round(hM * kk * .55)))
      : hM * kk > 30 ? `<g filter="url(#hmLeafy)">${clump(px, py, hM * kk, fog * .9, RAMP)}</g>` : clump(px, py, Math.max(2.5, hM * kk), fog * .9, RAMP) }); }

  // understory along the water's edge: sumac, dogwood and young maples hide the front row's trunks
  const SUMAC = ["#3a0e0a", "#5a160e", "#7a2012", "#9e2a16", "#bc3a1c", "#d6522a", "#e8763e", "#f4a062"];
  for (let k = 0, n = 0; k < 9000 && n < 1300; k++) { const u = (r() - .5) * 1.35, z0 = 98 + r() * 40, x = u * z0, z = zb(x) + 1.5 + r() * 9;
    if (onFloor(x, z) && r() > .15) continue; if (Math.abs(x - MX) < 12 && z < 108) continue; if (Math.abs(x - 27) < 11 && z < 122) continue;
    const y0 = hT(x, z); if (y0 < .2 || !free(x, z, .4)) continue; n++;
    const hM = 1.6 + r() * 2.6, q = r(), RAMP = q < .4 ? SUMAC : q < .6 ? GOLD : q < .8 ? RUST : OAK;
    w.sprite({ x, z, y: y0 - .2, fn: (px, py, kk, fog) => `<g filter="url(#hmLeafy)">${clump(px, py, Math.max(2.5, hM * kk), fog, RAMP)}</g>` }); }

  /* ---------------- assemble: water, reflections, the land, then everything on it ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  const SY0 = sy(0, 95), K = .8;
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#hmWater)"/>`;
  s += `<g clip-path="url(#hmCW)"><g opacity="${NIGHT ? .7 : .55}" filter="url(#hmRipple)">`
    + `<g transform="matrix(1,0,0,${-K},0,${F(SY0 * (1 + K))})">${w.draw({ where: isR })}</g>${w.draw({ mirror: true })}</g></g>`;
  s += `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="url(#hmWater)" opacity=".25"/>`;
  for (let k = 0; k < 160; k++) { const y = WY + 3 + Math.pow(r(), .8) * (H - WY - 3), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(30 + r() * 160 * (.4 + t))}" height="${F(1 + t * 1.2)}" rx="1" fill="${NIGHT ? "#6a70a8" : "#f4e4d4"}" opacity="${F(.05 + r() * .1)}"/>`; }
  // floating leaves and lily pads, flat on the water
  for (let k = 0; k < 140; k++) { const z = 8 + Math.pow(r(), .7) * 80, x = (r() - .5) * z * 1.3, py = sy(0, z), px = sx(x, z), R = Math.max(1, FL * (.08 + r() * .1) / z);
    s += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(R)}" ry="${F(R * EYE / z * 3)}" fill="${T(["#c85a22", "#d89a30", "#a83a1e", "#e0b040"][Math.floor(r() * 4)])}" opacity=".85"/>`; }
  for (let k = 0; k < 26; k++) { const z = 10 + r() * 30, x = (r() < .5 ? -1 : 1) * (2 + r() * z * .55), py = sy(0, z), px = sx(x, z), R = FL * (.25 + r() * .2) / z;
    s += `<path d="M${F(px)},${F(py)} m${F(-R)},0 a${F(R)},${F(R * EYE / z * 2.4)} 0 1 0 ${F(R * 2)},0 l${F(-R)},0Z" fill="${T(r() < .5 ? "#5a6a30" : "#6e7a3a")}" opacity=".85"/>`; }
  s += w.draw({ where: isR });
  s += `<rect x="0" y="310" width="${W}" height="150" fill="url(#hmHaze)" opacity=".32"/>`;
  s += w.draw({ where: notR });
  // mist lifting off the pond in front of the quay
  s += `<g filter="url(#hmMist)" opacity="${NIGHT ? .5 : .55}">`;
  for (let k = 0; k < 26; k++) { const x = r() * W, y = 500 + r() * 30, rx = 120 + r() * 260;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(rx)}" ry="${F(5 + r() * 9)}" fill="${NIGHT ? "#6e76a8" : "#fff2e4"}" opacity="${F(.25 + r() * .3)}"/>`; }
  s += `</g>`;
  // the near reeds and cattails at the bottom corners
  const reeds = (x0, x1) => { let g = "";
    for (let i = 0; i < 70; i++) { const x = x0 + r() * (x1 - x0), y = 690 + r() * 40, hh = 90 + r() * 120, bend = (r() - .5) * 40;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#7a6a32" : "#a08a44")}" stroke-width="${F(2 + r() * 2.5)}" fill="none" stroke-linecap="round"/>`;
      if (r() < .25) g += `<rect x="${F(x + bend - 4)}" y="${F(y - hh + 6)}" width="8" height="${F(22 + r() * 10)}" rx="4" fill="${T("#5a3a22")}"/>`; }
    return g; };
  s += reeds(0, 260) + reeds(2330, 2560);

  s += `<rect width="${W}" height="${H}" fill="url(#hmLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#hmPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
