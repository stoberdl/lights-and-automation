/* Badlands fossil dig: a dinosaur quarry in the Hell Creek badlands of eastern
   Montana in mid-October, for National Fossil Day. Standing on the floor of a
   dry wash, a low bench has been cut into the toe of a striped butte; its back
   wall is a working quarry face with a Triceratops skull, a run of vertebrae and
   ribs and a thigh bone exposed in the rock, strung with a metre grid and pin
   flags. Plaster jackets, buckets, a sieve and a wheelbarrow wait on the bench.
   Banded buttes (buff, grey bentonite, tan sandstone, lignite seams, red
   clinker) step back to a golden cottonwood bottom and the high prairie; the
   crew's wall tents and pickup sit up the wash on the left. Afternoon sun from
   the upper left, a field of fair-weather cumulus in perspective, ravens.
   opts.time === "night": a four-day crescent low in the west, stars and a faint
   Milky Way, a lantern on the bench lighting the skull, lit tents.
   The land is two world3d() rasters (reference/scene-helpers.js); everything
   standing on it is placed in metres by the same camera. Same shape as
   reference/autumn-valley.js. Needs rng(), mix(), world3d(), noise2(),
   mountainField(), hexRGB() and rgbTone() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                      */
function badlandsFossilDigArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 6143;
  const r = rng(seed), rs = rng(seed + 5), rt = rng(seed + 17), rb = rng(seed + 29);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -260, LY = 120, WY = 430;
  const T = c => NIGHT ? mix(mix(c, "#6e7488", .45), "#0a0e2a", .66) : c;
  const HZ = NIGHT ? "#262c4a" : "#e6dcc8", RIM = NIGHT ? "#a8b4e0" : "#fff2d0", SHADE = NIGHT ? "#04060e" : "#3a3048";
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
  const poly = P => "M" + P.map(p => F(p[0]) + "," + F(p[1])).join("L") + "Z";
  const smooth = P => {           // closed Catmull-Rom through the points
    let d = `M${F(P[0][0])},${F(P[0][1])}`;
    for (let i = 0; i < P.length; i++) { const p0 = P[(i - 1 + P.length) % P.length], p1 = P[i], p2 = P[(i + 1) % P.length], p3 = P[(i + 2) % P.length];
      d += ` C${F(p1[0] + (p2[0] - p0[0]) / 6)},${F(p1[1] + (p2[1] - p0[1]) / 6)} ${F(p2[0] - (p3[0] - p1[0]) / 6)},${F(p2[1] - (p3[1] - p1[1]) / 6)} ${F(p2[0])},${F(p2[1])}`; }
    return d + "Z"; };

  /* moon: four days after the Oct 10 new moon, a thin crescent low in the west after dusk */
  const MX = 960, MYc = 132, MR = 26;

  /* ---------------- sky: big clear prairie blue, or a crescent night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#03051a"/><stop offset=".5" stop-color="#0b1236"/><stop offset=".86" stop-color="#22284e"/><stop offset="1" stop-color="#3a3858"/>`
    : `<stop offset="0" stop-color="#2f62a8"/><stop offset=".42" stop-color="#6a9ccc"/><stop offset=".8" stop-color="#b8d0e0"/><stop offset="1" stop-color="#ece2cc"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e8b878" stop-opacity=".22"/><stop offset=".4" stop-color="#b07a68" stop-opacity=".08"/><stop offset="1" stop-color="#b07a68" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset=".2" stop-color="#ffe4aa" stop-opacity=".5"/><stop offset=".55" stop-color="#ffd494" stop-opacity=".14"/><stop offset="1" stop-color="#ffd494" stop-opacity="0"/>`;
  let s = `<defs id="bfdefs">
    <linearGradient id="bfSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="bfLight" cx="${NIGHT ? 300 : LX}" cy="${NIGHT ? WY + 40 : LY}" r="${NIGHT ? 1100 : 1800}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="bfHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".8"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="bfLamp"><stop offset="0" stop-color="#ffd890" stop-opacity=".95"/><stop offset=".25" stop-color="#ffb860" stop-opacity=".45"/><stop offset=".6" stop-color="#e08a40" stop-opacity=".12"/><stop offset="1" stop-color="#e08a40" stop-opacity="0"/></radialGradient>
    <radialGradient id="bfMoonG"><stop offset="0" stop-color="#f4ecd0" stop-opacity=".4"/><stop offset=".3" stop-color="#c8c8e0" stop-opacity=".1"/><stop offset="1" stop-color="#c8c8e0" stop-opacity="0"/></radialGradient>
    <filter id="bfLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".14" numOctaves="2" seed="6" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="bfCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="31" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.6"/></filter>
    <filter id="bfRough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="12" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="bfPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="bfSoft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="bfBlur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bfSky)"/>`;
  if (NIGHT) {
    s += `<rect width="${W}" height="${H}" fill="url(#bfLight)"/>`;
    // a faint Milky Way standing up out of the south-west
    s += `<g filter="url(#bfSoft)" opacity=".3">`;
    for (let i = 0; i < 60; i++) { const t = rs(), x = 1500 + t * 500 + (rs() - .5) * 160, y = WY - t * 470 + (rs() - .5) * 60;
      s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(40 + rs() * 80)}" ry="${F(30 + rs() * 50)}" fill="${rs() < .5 ? "#5a6498" : "#7a82b4"}" opacity="${F(.2 + rs() * .3)}"/>`; }
    s += `</g>`;
    for (let i = 0; i < 950; i++) { const x = rs() * W, y = Math.pow(rs(), 1.15) * 420, big = rs() < .05;
      if (Math.hypot(x - MX, y - MYc) < 70) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.8 : F(.5 + rs() * .7)}" fill="${rs() < .18 ? "#ffe6c4" : "#e6ecff"}" opacity="${F(.25 + rs() * .6 * (1 - y / 460))}"/>`; }
    // the crescent: lit limb toward the set sun, lower right; earthshine on the rest
    s += `<circle cx="${MX}" cy="${MYc}" r="${MR * 7}" fill="url(#bfMoonG)"/>
      <circle cx="${MX}" cy="${MYc}" r="${MR}" fill="#3c4060" opacity=".75"/>
      <path d="M${F(MX - MR * .62)},${F(MYc + MR * .78)} A${MR},${MR} 0 1 0 ${F(MX + MR * .78)},${F(MYc - MR * .62)} A${F(MR * .9)},${F(MR * .9)} 0 1 1 ${F(MX - MR * .62)},${F(MYc + MR * .78)}Z" fill="#f6eed4"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#bfLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#bfSoft)">`;
    for (let k = 0; k < 6; k++) { const a = .12 + k * .07, L = 2400;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a field of flat-based cumulus at 1,600 m, shrinking toward the horizon ---------------- */
  const EYE0 = 1.8, FL = 2100;
  const cumulus = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#bfCloudy)">`;
    const n = 5 + Math.floor(rs() * 4), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.13 + rs() * .1) * (1 - Math.abs(t - .5) * .9);
      lobes.push([x + (t - .5) * w, y - R * (.35 + rs() * .5), R]); }
    if (NIGHT) {
      c += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#141a38"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .7)}" fill="#1a2044"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .2)}" cy="${F(ly - R * .2)}" rx="${F(R * .6)}" ry="${F(R * .35)}" fill="#2a3060" opacity=".55"/>`);
    } else {
      c += `<ellipse cx="${F(x)}" cy="${F(y + w * .015)}" rx="${F(w * .56)}" ry="${F(w * .055)}" fill="#a8aec4"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .15)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.05)}" ry="${F(R * .78)}" fill="#c6c8d6"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .05)}" cy="${F(ly)}" rx="${F(R * .95)}" ry="${F(R * .72)}" fill="#eeeef2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .35)}" cy="${F(ly - R * .25)}" rx="${F(R * .5)}" ry="${F(R * .38)}" fill="#fffaee"/>`);
    }
    return c + `</g></g>`;
  };
  { const cs = [];
    for (let k = 0; k < 400 && cs.length < 26; k++) {
      const z = 6500 + Math.pow(rs(), .7) * 42000, x = (rs() - .5) * z * 1.4, w = (900 + rs() * 1300) * FL / z;
      const px = 1280 + FL * x / z, py = WY - FL * (1600 - EYE0) / z;
      if (px < -200 || px > W + 200 || py < 20) continue;
      if ((px < 900 || px > 1500) && py < 250 && rs() < .7) continue;      // keep the text corners mostly clear
      if (NIGHT && Math.hypot(px - MX, py - MYc) < w * .6 + 60) continue;
      cs.push([z, px, py, w]); }
    cs.sort((a, b) => b[0] - a[0]).forEach(([, px, py, w], i) => { s += cumulus(px, py, w, "drift" + (1 + i % 3)); }); }
  if (!NIGHT) {   // ravens over the butte
    s += `<g class="birds" fill="#1e1a20">`;
    [[1395, 196, 1], [1452, 222, .8], [1342, 238, .7]].forEach(([x, y, k]) => {
      s += `<path d="M${x},${y} q${F(-10 * k)},${F(-9 * k)} ${F(-24 * k)},${F(-4 * k)} q${F(12 * k)},${F(1 * k)} ${F(22 * k)},${F(7 * k)} l${F(4 * k)},${F(1 * k)} q${F(10 * k)},${F(-8 * k)} ${F(24 * k)},${F(-6 * k)} q${F(-12 * k)},${F(3 * k)} ${F(-22 * k)},${F(8 * k)}Z"/>`; });
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 1.6 m above the floor of a dry wash (floor at y = G0); metres, x right, y up, z away.
     The quarry bench is cut into the toe of the butte straight ahead. */
  const G0 = .2, EYE = G0 + 1.6;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: [-.72, .5, -.48], tone: T, fog: HZ, fogK: .0004,
    shadow: SHADE, rim: RIM, shade: .52, hi: .3, night: NIGHT, lamp: "#ffc868" });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9), N4 = noise2(seed + 13);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const NC = noise2(seed + 41);
  const capY = px => 262 + 26 * (NC(px / 160, .5) * .5 + .5) - 230 * sm((px - 880) / 170) * sm((1500 - px) / 170);   // calm text corners, tall in the middle
  const capH = (x, z) => EYE + (WY - capY(sx(x, z))) * z / FL;
  const softCap = (h, m, k) => h < m - k ? h : m - k * Math.exp(-(h - m + k) / k);
  const MF = mountainField({ seed: 7713, scale: 110, oct: 5, warp: .45, peaks: [
    { x: 14, z: 112, h: 19, rx: 20, rz: 22 }, { x: -12, z: 150, h: 21, rx: 28, rz: 26 }, { x: 34, z: 130, h: 12, rx: 16, rz: 16 }, { x: -52, z: 96, h: 10, rx: 13, rz: 12 }, { x: 34, z: 66, h: 9, rx: 12, rz: 10 },
    { x: 80, z: 175, h: 13, rx: 30, rz: 28 }, { x: -95, z: 210, h: 13, rx: 36, rz: 30 }, { x: 160, z: 300, h: 17, rx: 46, rz: 40 }, { x: -210, z: 340, h: 15, rx: 55, rz: 45 },
    { x: -40, z: 420, h: 20, rx: 90, rz: 60 }, { x: -330, z: 560, h: 22, rx: 100, rz: 70 }, { x: 300, z: 620, h: 26, rx: 110, rz: 80 },
    { x: 60, z: 820, h: 30, rx: 170, rz: 110 }, { x: -600, z: 900, h: 34, rx: 190, rz: 110 } ] });
  const FARM = mountainField({ seed: 3391, scale: 2400, oct: 4, peaks: [
    { x: -4200, z: 7200, h: 70, rx: 2600, rz: 1400 }, { x: 900, z: 9000, h: 95, rx: 2200, rz: 1500 }, { x: 5600, z: 6400, h: 60, rx: 2000, rz: 1200 } ] });
  const QX = -.2, QW = 3.9;                                                              // quarry centre and half width
  const terrace = h => { const sct = 2.4, t = h / sct, i = Math.floor(t), f = t - i;
    const g = f < .55 ? f * .2 / .55 : .2 + (f - .55) / .45 * .8; return (i + g) * sct * .75 + h * .25; };
  const hRaw = (x, z) => {
    let h = G0 + .12 * N1(x / 9, z / 9) + .05 * N3(x / 2.5, z / 2.5);
    // the toe of the butte the quarry is cut into
    const lat = sm((7 - Math.abs(x + .3)) / 3.5);
    const toe = z < 10 ? 0 : (sm((z - 10) / 4) * 1.6 + Math.min(z - 14, 8.5) * .36 * sm((z - 14) / 2)) * sm((36 - z) / 9);
    const bt = toe * lat, bm = terrace(Math.max(0, MF(x, z)));
    let b = Math.max(bt, bm);
    if (b > 1.6) { const e = sm((b - 1.6) / 4) * (bt > bm ? .3 : 1), k = 1 + b / 16, fr = sm((230 - z) / 150), fg = sm((1300 - z) / 700);
      b += (Math.pow(1 - Math.abs(N4(x / 2.2, z / 5)), 4) * 2.4 - .8) * e * k * fr;            // rills running down every face (faded out far off, where they would alias)
      b += (Math.pow(1 - Math.abs(N2(x / 8, z / 12)), 3) * 3 - 1.1) * e * k * fg;               // fins and gullies
      b += .35 * N3(x / 1.1, z / 1.1) * e * sm((160 - z) / 100); }
    return Math.max(h, G0 + b); };
  const hNear = (x, z) => {
    let h = hRaw(x, z);
    // the quarry cut: a flat bench at 1.4 m with a steep working face at z 21
    const ex = sm((QW + .7 - Math.abs(x - QX)) / .7);
    if (ex > 0 && z > 11) { const cut = 1.4 + Math.max(0, z - 21) * 3.4 + .06 * N3(x / .8, z / .8);
      if (h > cut) h = h * (1 - ex) + cut * ex; }
    if (h > 1.3) h = softCap(h, capH(x, z), 1.6);
    return h; };
  const hFar = (x, z) => { const m = FARM(x, z) * sm((z - 2500) / 3000); return Math.max(G0 + 1, m); };

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const BANDS = [["#dcc49a", 1.5], ["#9e9aa8", 1.1], ["#cfa46e", 1.2], ["#3a302a", .3], ["#b0a89e", .9], ["#e8d6ae", .8], ["#8a5a3a", .45],
    ["#8e94a4", 1.3], ["#d6a860", 1], ["#40342a", .25], ["#c4bab0", 1.1], ["#b4502e", .6], ["#e0c898", 1.2], ["#8a8a9a", .8]].map(([c, t]) => [H3(c), t]);
  const BT = BANDS.reduce((a, b) => a + b[1], 0), AVG = H3("#c0b098");
  const band = y => { let q = ((y % BT) + BT) % BT;
    for (let i = 0; i < BANDS.length; i++) { const [c, t] = BANDS[i]; if (q < t) { const nx = BANDS[(i + 1) % BANDS.length][0]; return L3(c, nx, sm((q - t + .12) / .24) * .5); } q -= t; }
    return BANDS[0][0]; };
  const SILT = H3("#d6ccb6"), SILT2 = H3("#bcae94"), CRACK = H3("#a69a84"), GRASS = H3("#c4a868"), GRASS2 = H3("#a89058"), SAGE = H3("#8a9478"), CLINK = H3("#a84a2c");
  const colNear = (x, y, z, n) => {
    const steep = 1 - n[1], yy = y + .45 * N2(x / 70, z / 70) + z * .004;
    let c;
    if (y < G0 + .35 && steep < .2) {                                                     // floor of the wash: dried silt, cracked mud, gravel
      c = L3(SILT, SILT2, .5 + .6 * N1(x / 6, z / 6));
      const crack = z > 9 && Math.abs(N3(x / .9, z / .9)) < .05; if (crack) c = L3(c, CRACK, .6);
      c = L3(c, SAGE, sm((N2(x / 4 + 5, z / 4) - .35) / .2) * .5);
    } else {
      c = band(yy);
      c = L3(c, AVG, sm((z - 300) / 900) * .7);                                           // bands blur together far off
      if (steep < .12 && y > 2) c = L3(c, L3(GRASS, GRASS2, .5 + N1(x / 5, z / 5)), sm((.12 - steep) / .06) * .9);   // grass on the flats and caps
      else if (steep < .3) c = L3(c, L3(SAGE, GRASS, .5 + N3(x / 3, z / 3)), sm((N2(x / 8, z / 8) - .1) / .3) * .45);
      if (N4(x / 40 + 2, z / 40) > .45 && y > 6) c = L3(c, CLINK, .35);                    // baked red clinker patches
    }
    return c.map(v => v * (.93 + .14 * N3(x / 1.7, z / 1.7))); };
  const PRAIRIE = H3("#c8b080"), PRAIRIE2 = H3("#a89468"), BRAKE = H3("#9a8a7a");
  const colFar = (x, y, z, n) => { const steep = 1 - n[1], k = N1(x / 500, z / 500) * .5 + .5;
    let c = L3(PRAIRIE, PRAIRIE2, k); if (steep > .1) c = L3(c, BRAKE, sm((steep - .1) / .15));
    return c.map(v => v * (.88 + .2 * (N2(x / 80, z / 80) * .5 + .5))); };
  const far = w.raster({ z0: 1600, z1: 30000, step: .0018, minStep: 3, scale: .6, top: 330, bottom: WY + 4, h: hFar, col: colFar, tone: rgbTone(T), fog: HZ, fogK: .00016, amb: NIGHT ? .62 : .55, noRefl: true, key: 1e7 });
  const near = w.raster({ z0: 3.5, z1: 1600, step: .0011, minStep: .06, scale: .72, top: 30, bottom: H, h: hNear, col: colNear, tone: rgbTone(T), fog: HZ, fogK: .00028, amb: NIGHT ? .55 : .44, noRefl: true, key: 5e6 });

  /* is ground at (x, z, y) seen from the eye, or hidden by nearer land? */
  const seen = (x, z, y) => { const y0 = sy(y, z) - 1.5;
    for (let q = 4; q < z * .985; q += Math.max(.15, q * .012)) { const xq = x * q / z; if (sy(hNear(xq, q), q) < y0) return false; }
    return true; };
  const slope = (x, z) => { const e = Math.max(.2, z * .01), h0 = hNear(x, z); return Math.hypot(hNear(x + e, z) - h0, hNear(x, z + e) - h0) / e; };

  /* ---------- plants: junipers, sage, a far line of cottonwoods ---------- */
  const JUN = ["#121a1a", "#1a2626", "#22322e", "#2c3e36", "#384a3e", "#4a5a48", "#5e6c56", "#7a8468"];
  const SAGEC = ["#4a5244", "#5e6656", "#727a68", "#8a907c", "#a2a690", "#b8baa4"];
  const COTT = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const juniper = (x, y, hp, fog) => {        // a shaggy Rocky Mountain juniper: trunk, then many dark scale-leaf tufts lit on the left
    const Tf = c => T(mix(c, HZ, fog)); let g = `<ellipse cx="${F(x + hp * .25)}" cy="${F(y)}" rx="${F(hp * .45)}" ry="${F(Math.max(1, hp * .05))}" fill="#000" opacity=".22"/>`;
    const tb = Math.max(1, hp * .05);
    g += `<path d="M${F(x - tb)},${F(y)} q${F(-hp * .05)},${F(-hp * .2)} ${F(tb * .3)},${F(-hp * .42)} l${F(tb)},0 q${F(hp * .02)},${F(hp * .22)} ${F(tb)},${F(hp * .42)}Z" fill="${Tf("#5a4436")}"/>`;
    const n = Math.max(6, Math.min(170, Math.round(hp * 2.6)));
    const lean = (r() - .5) * hp * .12;
    let cg = "";
    for (let k = 0; k < 4; k++) { const t = .25 + k * .2; cg += `<path d="${blobP(x + lean * t + (r() - .5) * hp * .08, y - hp * t - hp * .08, hp * .26 * (1 - t * .6), hp * .12, 7)}" fill="${Tf(JUN[0])}"/>`; }
    const pts = [];
    for (let i = 0; i < n; i++) { const t = Math.pow(r(), 1.3), wd = hp * .46 * (1 - Math.pow(t, 1.1) * .7) * (.6 + .6 * Math.abs(Math.sin(t * 7 + x))), px = x + lean * t + (r() * 2 - 1) * wd, py = y - hp * (.16 + t * .84);
      const lit = cl(.5 - (px - x - lean * t) / (wd * 2 + 1) * .9 + (r() - .5) * .35 + (1 - t) * -.1); pts.push([px, py, lit, hp * (.035 + r() * .045)]); }
    pts.sort((a, b) => a[2] - b[2]).forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${Tf(JUN[Math.floor(v * JUN.length)])}"/>`);
    return g + (hp > 18 ? `<g filter="url(#bfLeafy)">${cg}</g>` : cg); };
  const sage = (x, y, hp, fog) => { const Tf = c => T(mix(c, HZ, fog)); let g = `<ellipse cx="${F(x + hp * .3)}" cy="${F(y)}" rx="${F(hp * .9)}" ry="${F(Math.max(.8, hp * .1))}" fill="#000" opacity=".18"/>`;
    const n = Math.max(3, Math.min(30, Math.round(hp * 1.2)));
    for (let i = 0; i < n; i++) { const a = r() * Math.PI, d = Math.sqrt(r()), px = x - Math.cos(a) * d * hp * .8, py = y - Math.sin(a) * d * hp * .75, R = hp * (.16 + r() * .12);
      g += `<path d="${blobP(px, py, R, R * .75, 6)}" fill="${Tf(SAGEC[Math.min(5, Math.floor(cl(.45 - (px - x) / hp * .5 + (y - py) / hp * .3 + (r() - .5) * .3) * 6))])}"/>`; }
    return g; };
  const cotton = (x, y, hp, fog) => { const Tf = c => T(mix(c, HZ, fog)); let g = `<path d="${blobP(x, y - hp * .5, hp * .55, hp * .45, 9)}" fill="${Tf(COTT[2])}"/>`;
    const n = Math.max(4, Math.min(30, Math.round(hp)));
    for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * hp * .5, py = y - hp * .5 + Math.sin(a) * q * hp * .4, R = hp * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${Tf(COTT[Math.min(7, 2 + Math.floor(cl(.5 - (px - x) / hp * .8 + (r() - .5) * .3) * 6))])}"/>`; }
    return g; };
  // the cottonwood bottom: a winding line far off, along the river under the prairie
  for (let k = 0; k < 900; k++) { const z = 1700 + r() * 2600, x = (r() - .5) * z * 1.3, y0 = hFar(x, z), rv = Math.sin(x / 700 + z / 900) * 300;
    if (Math.abs(z - 2600 - rv) > 260 + 200 * N1(x / 600, 2)) continue;
    w.sprite({ x, z, y: y0 - .5, tag: "far", fn: (px, py, kk, fog) => cotton(px, py, Math.max(2.5, (14 + r() * 10) * kk), Math.min(.9, fog * 1.1)) }); }
  // junipers and sage on the badlands: on gentle ground, seen from the eye
  for (let k = 0, nj = 0, ns = 0; k < 30000 && (nj < 160 || ns < 420); k++) {
    const z = 16 + Math.pow(r(), .8) * 700, x = (r() - .5) * z * 1.35, y0 = hNear(x, z);
    if (Math.abs(x - QX) < QW + 3 && z < 40) continue;                                      // the quarry and the butte above it stay bare
    const sl = slope(x, z); if (sl > .45) continue;
    if (y0 > G0 + 2.5 && N2(x / 30, z / 30) < .1) continue;                                 // badlands are mostly bare: plants in patches
    const isJ = r() < .3; if (isJ ? nj >= 160 : ns >= 420) continue;
    if (isJ && z < 32) continue;
    if (isJ && r() < .45) continue;
    const hM = isJ ? 1.2 + r() * 1.6 : .25 + r() * .3;
    if (isJ && sy(y0 + hM, z) < capY(sx(x, z))) continue;
    if (!seen(x, z, y0 + hM * .6)) continue;
    if (isJ) { nj++; w.sprite({ x, z, y: y0 - .05, fn: (px, py, kk, fog) => juniper(px, py, Math.max(2, hM * kk), fog) }); }
    else { ns++; w.sprite({ x, z, y: y0 - .02, fn: (px, py, kk, fog) => sage(px, py, Math.max(1, hM * kk), fog) }); } }
  // pronghorn grazing on a far bench, left
  [[-62, 205], [-58.5, 209], [-66, 214]].forEach(([x, z], i) => { const y0 = hNear(x, z);
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => { const k = kk * 1.3, c = T(mix("#b07a48", HZ, fog)), wt = T(mix("#f2e8d8", HZ, fog)), dk = T(mix("#3a2a20", HZ, fog)), dir = i === 1 ? -1 : 1;
      return `<g transform="translate(${F(px)},${F(py)}) scale(${F(dir * k / 10)},${F(k / 10)})"><path d="M-6,-8 q6,-3 12,0 l1,3 q-6,3 -13,0Z" fill="${c}"/><path d="M-6,-6 q6,3 13,0 l0,2 q-7,2 -13,0Z" fill="${wt}"/>
        <path d="M5,-9 l3,-5 l2,0 l-1,5Z" fill="${c}"/><path d="M7.6,-14 l0,-3 M9.4,-14 l.4,-3" stroke="${dk}" stroke-width=".7"/><path d="M-5,-4 l0,4 M-3,-4 l0,4 M4,-4 l0,4 M6,-4 l0,4" stroke="${c}" stroke-width=".9"/></g>`; } }); });

  /* ---------- the camp up the wash: two wall tents, a table, an old pickup ---------- */
  const CANVAS = "#e8dcc0", CANVAS2 = "#d6c8a4";
  const tent = (x, z, yaw, wd, dp) => { const y0 = hNear(x, z);
    w.house({ x, z, y: y0, yaw, w: wd, d: dp, h: 1.5, rh: 1.25, gable: true, wall: CANVAS, roof: CANVAS2, trim: "#b8a882", clap: false, door: false, shingle: false, ov: .15, fy: -.3, stone: "#8a7a62",
      extra: (side, q, len) => { if (side !== "front") return;
        q(len / 2 - .55, 0, len / 2 + .55, 1.85, NIGHT ? "#ffc070" : "#4a3e30", { glow: NIGHT, off: .06 });
        q(len / 2 - .9, 0, len / 2 - .55, 1.7, "#cabc96", { off: .08 }); } }); };
  tent(-26, 56, 28, 3.2, 4.4); tent(-34, 66, 22, 3.6, 4.8);
  { const x = -21, z = 50, y0 = hNear(x, z); w.box({ x, z, y: y0 + .72, yaw: 30, w: 1.9, d: .8, h: .06, c: "#8a6a4a" });
    w.box({ x, z, y: y0, yaw: 30, w: 1.7, d: .08, h: .72, c: "#6a5038" }); }
  { // pickup: bed and cab as solids, wheels as discs in the side planes
    const x = -31, z = 76, y0 = hNear(x, z) + .02, yaw = 58, BODY = "#7a8a96";
    const o = { x, z, y: y0, yaw }, { P } = w.frame(o);
    w.box({ ...o, y: y0 + .45, w: 5.2, d: 1.9, h: .7, c: BODY, top: mix(BODY, "#000000", .15) });
    w.box({ x: x + Math.cos(yaw * Math.PI / 180) * -1.0, z: z + Math.sin(yaw * Math.PI / 180) * -1.0, y: y0 + 1.15, yaw, w: 1.7, d: 1.8, h: .75, c: BODY,
      dec: (faces, Pp) => { faces.slice(0, 4).forEach((Fc, i) => { const q4 = Fc.P; const a = q4[0], b = q4[1], cc = q4[2], d = q4[3];
        const L = (p, q, t) => p.map((v, j) => v + (q[j] - v) * t), lo = .25, hi = .85;
        Fc.dec = [{ P: [L(L(a, b, .1), L(d, cc, .1), lo), L(L(a, b, .9), L(d, cc, .9), lo), L(L(a, b, .85), L(d, cc, .85), hi), L(L(a, b, .15), L(d, cc, .15), hi)], c: NIGHT ? "#1a2030" : "#3a4a5a" }]; }); } });
    [[1.6, 1], [1.6, -1], [-1.7, 1], [-1.7, -1]].forEach(([u, sd]) => { const pts = [];
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; pts.push(P([u + Math.cos(a) * .4, .4 + Math.sin(a) * .4, sd * .97])); }
      w.add([{ P: pts, c: "#1e1c1c", two: true }], { center: P([u, .4, 0]) }); }); }

  /* ---------- the quarry: tools on the bench ---------- */
  const BY = 1.4;
  w.cyl({ x: -2.6, z: 16.6, y: BY, r0: .15, r1: .17, h: .37, n: 14, c: "#e07a2a", top: "#4a3626" });
  w.cyl({ x: -2.2, z: 17.4, y: BY, r0: .15, r1: .17, h: .37, n: 14, c: "#e8e4dc", top: "#5a4a3a" });
  w.cyl({ x: 3.0, z: 18.6, y: BY, r0: .15, r1: .17, h: .37, n: 14, c: "#2a5a8a", top: "#4a3e30" });
  // sieve on legs
  { const o = { x: 2.2, z: 15.4, y: BY, yaw: -12 };
    [[-.45, -.3], [.45, -.3], [-.45, .3], [.45, .3]].forEach(([u, v]) => { const { P } = w.frame(o); w.line([P([u, 0, v]), P([u, .72, v])], "#6a5038", .045); });
    w.box({ ...o, y: BY + .72, w: 1.0, d: .7, h: .1, c: "#8a6a48", top: "#7a7468" }); }
  // plaster jackets: lumpy white domes with burlap seams
  const jacket = (x, z, wm, hm) => w.sprite({ x, z, y: BY, fn: (px, py, kk) => { const wd = wm * kk, ht = hm * kk;
    let g = `<ellipse cx="${F(px + wd * .2)}" cy="${F(py)}" rx="${F(wd * .62)}" ry="${F(Math.max(1, ht * .14))}" fill="#000" opacity=".25"/>`;
    const sh = `M${F(px - wd / 2)},${F(py)} C${F(px - wd * .52)},${F(py - ht * .9)} ${F(px - wd * .2)},${F(py - ht * 1.08)} ${F(px + wd * .05)},${F(py - ht)} C${F(px + wd * .35)},${F(py - ht * .95)} ${F(px + wd * .54)},${F(py - ht * .7)} ${F(px + wd / 2)},${F(py)}Z`;
    g += `<path d="${sh}" fill="${T("#e4ded0")}"/>`;
    g += `<path d="M${F(px + wd * .02)},${F(py - ht * .98)} C${F(px + wd * .3)},${F(py - ht * .9)} ${F(px + wd * .5)},${F(py - ht * .65)} ${F(px + wd / 2)},${F(py)} L${F(px + wd * .1)},${F(py)}Z" fill="${T("#a8a29a")}" opacity=".7"/>`;
    g += `<path d="M${F(px - wd * .4)},${F(py - ht * .5)} C${F(px - wd * .3)},${F(py - ht * .95)} ${F(px - wd * .1)},${F(py - ht)} ${F(px)},${F(py - ht * .98)}" stroke="${T("#fffaf0")}" stroke-width="${F(Math.max(1, wd * .03))}" fill="none" opacity=".8"/>`;
    for (let k = 1; k < 5; k++) { const t = k / 5; g += `<path d="M${F(px - wd / 2 + wd * t)},${F(py)} q${F(-wd * .04)},${F(-ht * .55)} ${F(wd * .02 - (t - .5) * wd * .2)},${F(-ht * (.95 - Math.abs(t - .5) * .5))}" stroke="${T("#b8ae9a")}" stroke-width="${F(Math.max(.6, wd * .012))}" fill="none"/>`; }
    g += `<text x="${F(px - wd * .15)}" y="${F(py - ht * .38)}" font-family="Arial" font-weight="bold" font-size="${F(ht * .22)}" fill="${T("#2a2a36")}" opacity=".75">BF-26</text>`;
    return `<g filter="url(#bfRough)">${g}</g>`; } });
  jacket(2.5, 17.2, 1.3, .55); jacket(-.9, 15.8, .8, .38);
  // wheelbarrow, side-on to the camera
  w.sprite({ x: -3.5, z: 15.0, y: BY, fn: (px, py, kk) => { const k = kk; let g = "";
    g += `<ellipse cx="${F(px + .2 * k)}" cy="${F(py)}" rx="${F(.8 * k)}" ry="${F(.06 * k)}" fill="#000" opacity=".25"/>`;
    g += `<path d="M${F(px - .55 * k)},${F(py - .38 * k)} L${F(px + .45 * k)},${F(py - .38 * k)} L${F(px + .3 * k)},${F(py - .7 * k)} L${F(px - .75 * k)},${F(py - .72 * k)}Z" fill="${T("#2e6a4a")}"/>`;
    g += `<path d="M${F(px - .75 * k)},${F(py - .72 * k)} L${F(px + .3 * k)},${F(py - .7 * k)} L${F(px + .28 * k)},${F(py - .66 * k)} L${F(px - .72 * k)},${F(py - .68 * k)}Z" fill="${T("#5a9a72")}"/>`;
    g += `<path d="M${F(px - .1 * k)},${F(py - .38 * k)} L${F(px + .1 * k)},${F(py)} M${F(px + .3 * k)},${F(py - .5 * k)} L${F(px + 1.1 * k)},${F(py - .62 * k)}" stroke="${T("#3a3a3a")}" stroke-width="${F(.04 * k)}"/>`;
    g += `<circle cx="${F(px - .55 * k)}" cy="${F(py - .2 * k)}" r="${F(.2 * k)}" fill="${T("#1e1e1e")}"/><circle cx="${F(px - .55 * k)}" cy="${F(py - .2 * k)}" r="${F(.07 * k)}" fill="${T("#8a8a8a")}"/>`;
    g += `<path d="M${F(px - .7 * k)},${F(py - .74 * k)} q${F(.4 * k)},${F(-.16 * k)} ${F(.9 * k)},${F(-.02 * k)}" stroke="${T("#a89a84")}" stroke-width="${F(.1 * k)}" fill="none"/>`;
    return g; } });
  // a shovel and a pick leaning on the face
  w.line([[-3.1, BY, 18.2], [-3.3, BY + 1.45, 21.25]], "#7a5a3a", .04); w.line([[-3.1, BY, 18.2], [-3.13, BY + .28, 18.6]], "#5a5a62", .2);
  w.line([[3.5, BY, 19.4], [3.35, BY + 1.0, 21.2]], "#7a5a3a", .045); w.line([[3.15, BY + 1.0, 21.15], [3.6, BY + 1.05, 21.2]], "#5a5a62", .06);
  // the night lantern on an upturned bucket
  const LAMP = [.9, BY + .42, 19.2];
  w.cyl({ x: LAMP[0], z: LAMP[2], y: BY, r0: .14, r1: .15, h: .34, n: 12, c: "#c8c2b4", top: "#8a8478" });
  w.sprite({ x: LAMP[0], z: LAMP[2], y: BY + .34, fn: (px, py, kk) => { const k = kk;
    return `<path d="M${F(px - .06 * k)},${F(py)} l${F(.12 * k)},0 l${F(-.01 * k)},${F(-.2 * k)} l${F(-.1 * k)},0Z" fill="${NIGHT ? "#ffd890" : T("#b8c0c4")}" stroke="${T("#2a2a2a")}" stroke-width="${F(.012 * k)}"/>
      <path d="M${F(px - .07 * k)},${F(py - .2 * k)} l${F(.14 * k)},0 l${F(-.04 * k)},${F(-.05 * k)} l${F(-.06 * k)},0Z" fill="${T("#3a3a3a")}"/>
      <path d="M${F(px - .05 * k)},${F(py - .25 * k)} q${F(.05 * k)},${F(-.08 * k)} ${F(.1 * k)},0" stroke="${T("#3a3a3a")}" stroke-width="${F(.01 * k)}" fill="none"/>`; } });

  /* ---------- the bones in the working face ----------
     The face rises from the bench (y 1.4, z 21) at 3.4 m per metre back, so a point at height y on it
     sits at z = 21 + (y - 1.4) / 3.4. Bones are drawn front-on in that plane. */
  const onWall = (x, y) => { const z = 21 + Math.max(0, y - BY) / 3.4; return [sx(x, z), sy(y, z)]; };
  const BONE = NIGHT ? ["#3a2418", "#6a4428", "#9a6a3e", "#d0a066"] : ["#2e1e16", "#54341f", "#7e5232", "#b07e4c"];
  let bones = "", bshadow = "", bdig = "";
  const TB = c => NIGHT ? mix(mix(c, "#7a6a68", .25), "#141026", .42) : c;
  const boneG = (id, P) => {      // a gradient across the bone, lit from the upper left
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${F(x0)}" y1="${F(y0)}" x2="${F(x1)}" y2="${F(y1)}"><stop offset="0" stop-color="${TB(BONE[3])}"/><stop offset=".45" stop-color="${TB(BONE[2])}"/><stop offset="1" stop-color="${TB(BONE[1])}"/></linearGradient>`; };
  // at night the bones sit in the lantern's light, so they are toned less than the land
  let gid = 0, gdefs = "";
  const bone = (Pw, opt = {}) => {     // Pw: points on the wall in metres; drawn as a smooth lit shape with a dug-out halo
    const P = Pw.map(([x, y]) => onWall(x, y)), id = "bfB" + gid++;
    gdefs += boneG(id, P);
    const d = opt.sharp ? poly(P) : smooth(P);
    bdig += `<path d="${d}" fill="none" stroke="${T("#6e6252")}" stroke-width="${F(opt.halo ?? 9)}" stroke-linejoin="round" opacity=".55"/>`;
    bshadow += `<path d="${d}" transform="translate(4,5)" fill="${T("#1e1610")}" opacity=".55"/>`;
    bones += `<path d="${d}" fill="url(#${id})" stroke="${TB(BONE[0])}" stroke-width="1.2" stroke-linejoin="round"/>`;
    if (!opt.noHi) bones += `<path d="${d}" transform="translate(-1.6,-1.6)" fill="none" stroke="${TB(BONE[3])}" stroke-width="1.4" opacity=".45" stroke-dasharray="${F(20 + r() * 30)} ${F(30 + r() * 40)}"/>`;
    return P; };
  const hole = (Pw, op = .9) => { const P = Pw.map(([x, y]) => onWall(x, y)); bones += `<path d="${smooth(P)}" fill="${T("#1a120c")}" opacity="${op}"/>`; };
  const ell = (cx, cy, rx, ry, n = 14, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; const ux = Math.cos(a) * rx, uy = Math.sin(a) * ry;
    return [cx + ux * Math.cos(rot) - uy * Math.sin(rot), cy + ux * Math.sin(rot) + uy * Math.cos(rot)]; });
  // Triceratops skull, side-on, beak to the left: local (u along, v up) in metres from the jaw corner
  { const X0 = -3.55, Y0 = 1.72, S = 2.15, K = (u, v) => [X0 + u * S, Y0 + v * S];
    // the frill: a broad fan sweeping up and back, its edge scalloped with epoccipitals
    const fr = [];
    for (let i = 0; i <= 26; i++) { const a = -.1 + i / 26 * 1.95, R = .46 + .03 * (i % 2);
      fr.push(K(.74 + Math.cos(a) * R, .36 + Math.sin(a) * R * 1.08)); }
    fr.push(K(.5, .42), K(.62, .1));
    bone(fr);
    // the face, cheek and jaw
    const face = [K(0, .12), K(.03, .2), K(.1, .3), K(.18, .34), K(.26, .4), K(.36, .5), K(.46, .56), K(.56, .52), K(.66, .34), K(.7, .12), K(.62, -.02), K(.44, -.08), K(.24, -.06), K(.1, -.02), K(.02, .04)];
    bone(face);
    bone([K(-.08, .1), K(-.02, .2), K(.08, .26), K(.06, .12), K(.0, .02)], { halo: 6 });          // the parrot beak
    bone([K(.15, .32), K(.17, .5), K(.2, .52), K(.23, .38)], { halo: 6 });                              // nose horn
    bone([K(.36, .5), K(.18, .9), K(.06, 1.12), K(.1, 1.1), K(.26, .92), K(.47, .58)], { halo: 7 });     // brow horns, the far one a little behind
    bone([K(.42, .54), K(.28, .86), K(.2, 1.0), K(.24, 1.0), K(.36, .86), K(.52, .58)], { halo: 6 });
    hole(ell(...K(.43, .37), .07 * S, .05 * S, 12, -.3));                                              // orbit
    hole(ell(...K(.12, .2), .035 * S, .025 * S, 10, -.4), .8);                                          // nostril
    hole(ell(...K(.62, .26), .04 * S, .07 * S, 10, .2), .7);                                            // temporal opening
    hole(ell(...K(.8, .62), .07 * S, .05 * S, 10, .5), .55);                                            // fenestra in the frill
    // teeth row along the jaw
    for (let k = 0; k < 9; k++) { const [px, py] = onWall(...K(.24 + k * .045, -.005)); bones += `<path d="M${F(px)},${F(py)} l${F(3)},${F(5)} l${F(3)},${F(-5)}" fill="${T(BONE[3])}" opacity=".8"/>`; }
    // cracks across the skull
    for (let k = 0; k < 12; k++) { const u = .1 + rb() * .8, v = rb() * .8; const [px, py] = onWall(...K(u, v)); let d = `M${F(px)},${F(py)}`;
      let cx = px, cy = py; for (let j = 0; j < 4; j++) { cx += (rb() - .5) * 18; cy += 4 + rb() * 8; d += ` L${F(cx)},${F(cy)}`; }
      bones += `<path d="${d}" stroke="${T(BONE[0])}" stroke-width="1" fill="none" opacity=".6"/>`; } }
  // the backbone: a gentle arc of vertebrae with spines up and ribs curving down
  { const n = 13;
    for (let i = 0; i < n; i++) { const t = i / (n - 1), x = -1.0 + t * 4.25, y = 3.55 - .35 * Math.sin(t * Math.PI) + t * .15, sz = .17 - t * .03;
      if (i > 2 && i < 11) { const rl = .9 - Math.abs(t - .45) * .8, sw = .11 + t * .05;    // a rib, drawn first so the centrum overlaps
        bone([[x - .03, y - .05], [x + sw * .6, y - rl * .45], [x + sw, y - rl], [x + sw + .05, y - rl - .02], [x + sw * .7 + .06, y - rl * .45], [x + .06, y - .05]], { halo: 5, noHi: true }); }
      bone([[x - sz, y - sz * .6], [x + sz, y - sz * .6], [x + sz * 1.05, y + sz * .5], [x - sz * .95, y + sz * .55]], { halo: 6 });
      bone([[x - sz * .45, y + sz * .4], [x - sz * .15, y + sz * 2.5], [x + sz * .2, y + sz * 2.6], [x + sz * .5, y + sz * .4]], { halo: 5, noHi: true }); } }
  // a thigh bone lying across the lower face, and a few loose bits
  bone([[-.85, 1.86], [-.7, 2.02], [-.45, 1.98], [.6, 2.22], [1.6, 2.38], [1.84, 2.32], [1.98, 2.5], [2.12, 2.26], [1.94, 2.1], [1.7, 2.12], [.6, 1.98], [-.4, 1.74], [-.62, 1.66], [-.86, 1.72]]);
  [[2.6, 2.0, .12], [2.9, 2.7, .09], [-.2, 2.95, .1], [3.3, 3.1, .08], [.4, 2.65, .07]].forEach(([x, y, q]) => bone(ell(x, y, q * 1.4, q * .8, 9, rb() - .5), { halo: 4, noHi: true }));
  // grid strings, nails, pin flags and a scale bar
  let grid = "";
  const gx0 = -3.75, gx1 = 3.75;
  for (let y = 2; y <= 4; y += 1) { const a = onWall(gx0, y), b = onWall(gx1, y); grid += `<path d="M${F(a[0])},${F(a[1])} Q${F((a[0] + b[0]) / 2)},${F((a[1] + b[1]) / 2 + 3)} ${F(b[0])},${F(b[1])}" stroke="${NIGHT ? "#6a6e88" : "#f4f0e4"}" stroke-width="1.1" fill="none" opacity="${NIGHT ? .4 : .75}"/>`; }
  for (let x = -3; x <= 3; x += 1) { const a = onWall(x, 4.05), b = onWall(x, 1.55); grid += `<path d="M${F(a[0])},${F(a[1])} L${F(b[0])},${F(b[1])}" stroke="${NIGHT ? "#6a6e88" : "#f4f0e4"}" stroke-width="1" opacity="${NIGHT ? .3 : .55}"/>`;
    for (let y = 2; y <= 4; y += 1) { const p = onWall(x, y); grid += `<circle cx="${F(p[0])}" cy="${F(p[1])}" r="2.2" fill="${T("#c8c8cc")}"/>`; } }
  [[-1.3, 3.05, "#ff5a8a"], [.15, 2.85, "#ff8a2a"], [2.45, 2.15, "#ff5a8a"], [2.95, 3.0, "#ffd02a"], [-2.6, 1.9, "#ff8a2a"], [3.5, 3.4, "#ff5a8a"], [.6, 2.55, "#ffd02a"]].forEach(([x, y, c]) => {
    const p = onWall(x, y); grid += `<path d="M${F(p[0])},${F(p[1])} l${F(-6)},${F(-26)}" stroke="${T("#9a9a9a")}" stroke-width="1"/><path d="M${F(p[0] - 6)},${F(p[1] - 26)} l14,3 l-12,7Z" fill="${NIGHT ? T(c) : c}"/>`; });
  { const a = onWall(-3.6, 1.5); let bar = ""; for (let k = 0; k < 5; k++) bar += `<rect x="${F(a[0] + k * 10)}" y="${F(a[1] - 6)}" width="10" height="5" fill="${k % 2 ? "#f4f0e4" : "#2a2a2a"}"/>`; grid += `<g opacity="${NIGHT ? .35 : .9}">${bar}</g>`; }
  // tool marks and fresh spoil on the face
  let marks = "";
  for (let k = 0; k < 140; k++) { const x = -3.8 + rb() * 7.6, y = 1.5 + rb() * 2.7, [px, py] = onWall(x, y);
    marks += `<path d="M${F(px)},${F(py)} l${F(4 + rb() * 10)},${F((rb() - .5) * 4)}" stroke="${T(rb() < .5 ? "#8a7e6c" : "#e4dac4")}" stroke-width="${F(.8 + rb())}" opacity=".45"/>`; }
  for (let k = 0; k < 70; k++) { const x = -3.8 + rb() * 7.6, z = 19.5 + rb() * 1.4, y0 = BY, [px, py] = [sx(x, z), sy(y0, z)];
    marks += `<path d="${blobP(px, py - 2, 4 + rb() * 9, 2 + rb() * 3, 6, rb)}" fill="${T(rb() < .5 ? "#bcb09a" : "#9a8e7a")}"/>`; }

  /* ---------------- assemble ---------------- */
  const isFarR = o => o === far, isFarS = o => o.tag === "far", isNear = o => o === near, rest = o => !o.raster && o.tag !== "far";
  s += `<defs>${gdefs}</defs>`;
  s += w.draw({ where: isFarR });
  s += w.draw({ where: isFarS });
  s += `<rect x="0" y="${WY - 60}" width="${W}" height="80" fill="url(#bfHaze)" opacity=".5"/>`;
  s += w.draw({ where: isNear });
  s += marks + `<g filter="url(#bfBlur3)">${bdig}</g><g filter="url(#bfBlur3)">${bshadow}</g><g filter="url(#bfRough)">${bones}</g>` + grid;
  s += w.draw({ where: rest });
  // stones and ironstone concretions washed out onto the floor of the wash, lit from the upper left
  { let g = "";
    for (let k = 0, n = 0; k < 6000 && n < 650; k++) {
      const z = 4 + Math.pow(r(), 1.3) * 60, x = (r() - .5) * z * 1.35, y0 = hNear(x, z);
      if (y0 > G0 + .3 || (Math.abs(x - QX) < QW + 1 && z > 11)) continue;
      const R = FL * (.04 + Math.pow(r(), 3) * .3) / z; if (R < 1) continue; n++;
      const px = sx(x, z), py = sy(y0, z), c = ["#8a6a4a", "#a89a86", "#6e5a48", "#c8bca4", "#7a4a32"][Math.floor(r() * 5)];
      g += `<ellipse cx="${F(px + R * .3)}" cy="${F(py)}" rx="${F(R * 1.2)}" ry="${F(R * .25)}" fill="#000" opacity=".22"/>`;
      g += `<path d="${blobP(px, py - R * .3, R, R * .55, 7)}" fill="${T(mix(c, SHADE, .3))}"/><path d="${blobP(px - R * .25, py - R * .45, R * .6, R * .3, 6)}" fill="${T(mix(c, RIM, .2))}"/>`; }
    s += g; }
  // grass and rabbitbrush at the bottom corners, under the cards
  const tuft = (x0, x1) => { let g = "";
    for (let i = 0; i < 80; i++) { const x = x0 + r() * (x1 - x0), y = 702 + r() * 26, hh = 40 + r() * 80, bend = (r() - .5) * 34;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#a89058" : "#c8b070")}" stroke-width="${F(1.5 + r() * 2)}" fill="none" stroke-linecap="round"/>`;
      if (r() < .2) g += `<circle cx="${F(x + bend)}" cy="${F(y - hh)}" r="${F(3 + r() * 3)}" fill="${T(r() < .7 ? "#e0b830" : "#f0e6c0")}"/>`; }
    return g; };
  s += tuft(0, 280) + tuft(2300, 2560);
  if (NIGHT) {   // the lantern's pool of light on the face and the bench, and the tents' glow
    const [lx, ly] = w.proj(LAMP);
    s += `<ellipse cx="${F(lx - 60)}" cy="${F(ly - 90)}" rx="620" ry="330" fill="url(#bfLamp)" style="mix-blend-mode:screen" opacity=".55"/>`;
    s += `<circle cx="${F(lx)}" cy="${F(ly)}" r="90" fill="url(#bfLamp)" style="mix-blend-mode:screen" opacity=".7"/>`;
    s += `<circle cx="${F(lx)}" cy="${F(ly - 4)}" r="7" fill="#fff4d0" opacity=".9" filter="url(#bfBlur3)"/>`;
    [[-26, 56], [-34, 66]].forEach(([x, z]) => { const [px, py] = w.proj([x, hNear(x, z) + 1, z]); s += `<circle cx="${F(px)}" cy="${F(py)}" r="90" fill="url(#bfLamp)" style="mix-blend-mode:screen" opacity=".6"/>`; });
  }
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#bfLight)" style="mix-blend-mode:soft-light"/>`;
  else s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".06"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#bfPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
