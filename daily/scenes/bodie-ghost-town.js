/* Bodie ghost town: the gold-rush camp in the high desert east of the Sierra
   Nevada (California), kept in "arrested decay" since 1962. Standing at the
   edge of town where Green Street comes in, the weathered Methodist church
   and its steeple stand left of centre, unpainted board houses and
   false-front stores scatter across a sagebrush bowl along the dirt street,
   leaning power poles carry a sagging wire, a rusted 1930s truck sits in the
   sage, and the corrugated-tin Standard stamp mill steps down the hill on the
   right under a mine headframe on the far rise. Bare sage hills close the
   bowl, with the snowy Sierra crest showing through a saddle on the left.
   Late golden sun off the right edge, lenticular clouds over the crest,
   rabbitbrush in yellow bloom, ravens.
   opts.time === "night": a moonless high-desert sky, the Milky Way, Orion
   rising low in the east with Orionid meteors streaking out of it, one
   ranger's house lit with a jack-o'-lantern on its porch, bats round the
   steeple.
   Land is world3d() rasters (reference/scene-helpers.js); everything standing
   on it is placed in metres by the same camera. Same shape as
   reference/autumn-valley.js. Needs rng(), mix(), world3d(), noise2(),
   mountainField(), hexRGB() and rgbTone() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                      */
function bodieGhostTownArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 8821;
  const r = rng(seed), rs = rng(seed + 7), rb = rng(seed + 19), rh = rng(seed + 31);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 2760, LY = 250, WY = 418;
  const T = c => NIGHT ? mix(mix(c, "#6a7090", .45), "#080c26", .68) : c;
  const HZ = NIGHT ? "#1e2444" : "#ead8bc", RIM = NIGHT ? "#9aa8d8" : "#fff0cc", SHADE = NIGHT ? "#04060e" : "#3e2e2c";
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

  /* ---------------- sky: deep high-altitude blue warming to amber, or a moonless star field ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#02031a"/><stop offset=".55" stop-color="#081034"/><stop offset=".88" stop-color="#1a2250"/><stop offset="1" stop-color="#2c2e58"/>`
    : `<stop offset="0" stop-color="#2556a4"/><stop offset=".42" stop-color="#5a90ca"/><stop offset=".78" stop-color="#bccdd6"/><stop offset="1" stop-color="#f0d6ac"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#6a78b8" stop-opacity=".12"/><stop offset="1" stop-color="#6a78b8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2cc" stop-opacity=".95"/><stop offset=".22" stop-color="#ffd890" stop-opacity=".5"/><stop offset=".55" stop-color="#ffc878" stop-opacity=".14"/><stop offset="1" stop-color="#ffc878" stop-opacity="0"/>`;
  let s = `<defs id="bgdefs">
    <linearGradient id="bgSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="bgLight" cx="${NIGHT ? 1200 : LX}" cy="${NIGHT ? WY : LY}" r="${NIGHT ? 1300 : 1900}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="bgHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".8"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="bgLamp"><stop offset="0" stop-color="#ffd890" stop-opacity=".95"/><stop offset=".25" stop-color="#ffb860" stop-opacity=".45"/><stop offset=".6" stop-color="#e08a40" stop-opacity=".12"/><stop offset="1" stop-color="#e08a40" stop-opacity="0"/></radialGradient>
    <radialGradient id="bgStar"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="#dfe6ff" stop-opacity=".25"/><stop offset="1" stop-color="#dfe6ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="bgMet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfe0ff" stop-opacity="0"/><stop offset=".75" stop-color="#e8f0ff" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity="1"/></linearGradient>
    <filter id="bgLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".16" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="bgCloudy" x="-20%" y="-60%" width="140%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".012 .05" numOctaves="3" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="bgWisp" x="-20%" y="-60%" width="140%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".004 .06" numOctaves="3" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="4"/></filter>
    <filter id="bgRough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="12" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="bgPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="bgSoft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="bgSoft6"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="bgBlur3"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="bgBlur1"><feGaussianBlur stdDeviation="1.1"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgSky)"/>`;
  /* Orion rising in the east (left), lying on its side as it does when it clears the horizon */
  const OR = { x: 560, y: 318, k: 1.15, a: -.95 };
  const orion = (u, v) => { const c = Math.cos(OR.a), sn = Math.sin(OR.a); return [OR.x + (u * c - v * sn) * OR.k, OR.y + (u * sn + v * c) * OR.k]; };
  const RAD = orion(-20, -118);                              // the Orionid radiant, north of Betelgeuse
  if (NIGHT) {
    s += `<rect width="${W}" height="${H}" fill="url(#bgLight)"/>`;
    // the Milky Way: a soft band from the lower left up across the sky, with a dark rift down it
    const mw = t => [180 + t * 1900, 660 - t * 760 + Math.sin(t * 3) * 40];
    s += `<g filter="url(#bgSoft)" opacity=".5">`;
    for (let i = 0; i < 140; i++) { const t = rs(), [x, y] = mw(t), off = (rs() - .5) * 230;
      s += `<ellipse cx="${F(x + off * .45)}" cy="${F(y + off * .9)}" rx="${F(50 + rs() * 110)}" ry="${F(30 + rs() * 60)}" fill="${rs() < .5 ? "#4a5490" : "#7078ac"}" opacity="${F((.18 + rs() * .3) * (1 - Math.abs(off) / 160))}"/>`; }
    s += `</g><g filter="url(#bgSoft6)" opacity=".55">`;
    for (let i = 0; i < 90; i++) { const t = .15 + rs() * .75, [x, y] = mw(t), off = (rs() - .3) * 60;
      s += `<ellipse cx="${F(x + off * .45)}" cy="${F(y + off * .9)}" rx="${F(14 + rs() * 40)}" ry="${F(8 + rs() * 16)}" fill="#04061c" opacity="${F(.3 + rs() * .4)}"/>`; }
    s += `</g>`;
    // stars, thicker along the band
    for (let i = 0; i < 1500; i++) { let x = rs() * W, y = Math.pow(rs(), 1.1) * 440;
      if (i % 3 === 0) { const t = rs(), p = mw(t), off = (rs() - .5) * 200; x = p[0] + off * .45; y = p[1] + off * .9; if (y > 430 || y < 0) continue; }
      const big = rs() < .04;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.45 + rs() * .7)}" fill="${rs() < .2 ? "#ffe2c0" : "#e4eaff"}" opacity="${F(.25 + rs() * .65 * (1 - y / 470))}"/>`; }
    // Orion: belt, shoulders, feet and the sword's nebula
    const ST = [[-34, -60, 3.2, "#ffb880"], [36, -56, 2.4, "#dfe6ff"], [-8, -4, 2.2, "#eaf0ff"], [0, 0, 2.3, "#eaf0ff"], [8, 4, 2.2, "#eaf0ff"],
      [-30, 58, 2.2, "#dfe6ff"], [40, 62, 3.0, "#cfe0ff"], [2, -84, 1.4, "#e4eaff"], [3, 24, 1.2, "#f0d8ff"], [3, 32, 1.0, "#e4eaff"]];
    ST.forEach(([u, v, R, c]) => { const [x, y] = orion(u, v);
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R * 5)}" fill="url(#bgStar)" opacity=".7"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(R * .7)}" fill="${c}"/>`; });
    { const [x, y] = orion(3, 28); s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="7" ry="4" fill="#d8b8f0" opacity=".25" filter="url(#bgBlur3)"/>`; }
    // Orionid meteors: thin streaks pointing straight back at the radiant
    const MET = [[1020, 120, 170], [1240, 70, 220], [1350, 210, 140], [880, 190, 110], [1560, 300, 190], [1170, 268, 90], [690, 150, 70]];
    MET.forEach(([hx, hy, L], i) => { const dx = hx - RAD[0], dy = hy - RAD[1], d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
      const tx = hx - ux * L, ty = hy - uy * L, ang = Math.atan2(uy, ux) * 180 / Math.PI;
      s += `<g transform="translate(${F(tx)},${F(ty)}) rotate(${F(ang)})"><path d="M0,0 L${F(L)},${F(-1.4)} L${F(L + 1.5)},0 L${F(L)},${F(1.4)}Z" fill="url(#bgMet)" opacity="${i < 3 ? .95 : .7}"/>
        <circle cx="${F(L)}" cy="0" r="6" fill="url(#bgStar)"/></g>`;
      if (i === 1) s += `<path d="M${F(tx)},${F(ty)} L${F(hx)},${F(hy)}" stroke="#9ad8c8" stroke-width="5" opacity=".08" filter="url(#bgBlur3)"/>`; });
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#bgLight)"/>`;
    s += `<g class="rays" opacity=".06" filter="url(#bgSoft)">`;
    for (let k = 0; k < 6; k++) { const a = Math.PI - .1 - k * .06, L = 2600;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .018) * L)},${F(LY + Math.sin(a - .018) * L)} L${F(LX + Math.cos(a + .018) * L)},${F(LY + Math.sin(a + .018) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: lenticular stacks standing over the Sierra, and high cirrus ---------------- */
  const lens = (cx, cy, w, hgt, n, cls) => {    // a stack of smooth lens-shaped plates, lit from the right
    let c = `<g class="${cls}"><g filter="url(#bgCloudy)">`;
    for (let k = 0; k < n; k++) { const t = k / Math.max(1, n - 1), ww = w * (1 - Math.abs(t - .45) * .55) * (.9 + rs() * .2), y = cy - k * hgt * .62, x = cx + (rs() - .5) * w * .08 + k * w * .02;
      const P = (h1, h2, dx = 0, dy = 0) => `M${F(x - ww / 2 + dx)},${F(y + dy)} Q${F(x - ww * .1 + dx)},${F(y - hgt * h1 + dy)} ${F(x + ww / 2 + dx)},${F(y + dy)} Q${F(x + dx)},${F(y + hgt * h2 + dy)} ${F(x - ww / 2 + dx)},${F(y + dy)}Z`;
      if (NIGHT) { c += `<path d="${P(1, .45)}" fill="#141a3c" opacity=".85"/><path d="${P(.8, .1, ww * .06, -2)}" fill="#20285a" opacity=".6"/>`; continue; }
      c += `<path d="${P(1, .5)}" fill="#a898b4"/>`;
      c += `<path d="${P(.95, .2, -ww * .01, -1)}" fill="#e2d4dc"/>`;
      c += `<path d="${P(.75, -.05, ww * .05, -hgt * .12)}" fill="#fff4e4"/>`;
      c += `<path d="M${F(x + ww * .18)},${F(y - hgt * .32)} Q${F(x + ww * .38)},${F(y - hgt * .18)} ${F(x + ww * .5)},${F(y)}" stroke="#ffd8a0" stroke-width="${F(hgt * .12)}" fill="none" opacity=".75"/>`; }
    return c + `</g></g>`; };
  if (!NIGHT) {
    s += `<g filter="url(#bgWisp)" opacity=".28">`;
    [[260, 92, 520], [640, 170, 360], [1880, 70, 620], [2300, 150, 420], [1660, 210, 300]].forEach(([x, y, w0]) => {
      s += `<ellipse cx="${x}" cy="${y}" rx="${w0}" ry="${F(w0 * .025)}" fill="#ffffff" opacity=".7"/><ellipse cx="${x + w0 * .2}" cy="${y + 14}" rx="${F(w0 * .6)}" ry="${F(w0 * .018)}" fill="#fff6e8" opacity=".6"/>`; });
    s += `</g>`;
  }
  s += lens(1190, 168, 560, 30, 4, "drift1");
  s += lens(1575, 292, 300, 18, 2, "drift2");
  s += lens(640, 312, 360, 16, 2, "drift3");
  if (!NIGHT) {   // ravens over the mill hill
    s += `<g class="birds" fill="#1a161c">`;
    [[1545, 236, 1], [1602, 252, .8], [1505, 266, .65]].forEach(([x, y, k]) => {
      s += `<path d="M${x},${y} q${F(-10 * k)},${F(-9 * k)} ${F(-24 * k)},${F(-4 * k)} q${F(12 * k)},${F(1 * k)} ${F(22 * k)},${F(7 * k)} l${F(4 * k)},${F(1 * k)} q${F(10 * k)},${F(-8 * k)} ${F(24 * k)},${F(-6 * k)} q${F(-12 * k)},${F(3 * k)} ${F(-22 * k)},${F(8 * k)}Z"/>`; });
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 3 m above the floor of the bowl (y = 0); metres, x right, y up, z away.
     Green Street comes in from the bottom and runs away past the church. */
  const EYE = 3, FL = 2200;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.3, .7, .2] : [.78, .42, .12], tone: T, fog: HZ, fogK: .00045,
    shadow: SHADE, rim: RIM, shade: .55, hi: .32, night: false, lamp: "#ffc868" });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9), N4 = noise2(seed + 13);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const NC = noise2(seed + 41);
  // the highest the hills may reach on screen: calm in the text corners, a saddle on the left for the Sierra
  const capY = px => 292 + 22 * (NC(px / 150, .5) * .5 + .5) - 52 * sm((px - 860) / 160) * sm((1520 - px) / 160) + 62 * sm((px - 250) / 140) * sm((820 - px) / 140);
  const capH = (x, z) => EYE + (WY - capY(sx(x, z))) * z / FL;
  const softCap = (h, m, k) => h < m - k ? h : m - k * Math.exp(-(h - m + k) / k);
  const roadX = z => 2.5 + 5 * Math.sin(z / 110) - z * .018;
  const HILLS = mountainField({ seed: 5507, scale: 520, oct: 6, warp: .35, peaks: [
    { x: -520, z: 900, h: 120, rx: 300, rz: 220 }, { x: -60, z: 1300, h: 170, rx: 420, rz: 300 }, { x: 420, z: 1000, h: 150, rx: 330, rz: 260 },
    { x: 950, z: 1500, h: 210, rx: 500, rz: 380 }, { x: -1300, z: 1700, h: 190, rx: 520, rz: 420 }, { x: 210, z: 640, h: 70, rx: 160, rz: 120 },
    { x: -250, z: 600, h: 48, rx: 150, rz: 110 } ] });
  const SIERRA = mountainField({ seed: 6611, scale: 3800, oct: 7, warp: .4, peaks: [
    { x: -14000, z: 42000, h: 1400, rx: 7000, rz: 5000 }, { x: -6000, z: 47000, h: 1250, rx: 6000, rz: 5000 }, { x: -22000, z: 50000, h: 1350, rx: 8000, rz: 6000 }, { x: 2000, z: 52000, h: 1100, rx: 9000, rz: 6000 } ] });
  const hNear = (x, z) => {
    let h = .3 * N1(x / 34, z / 34) + .1 * N3(x / 7, z / 7);
    const right = 30 * sm((x - 25 - .1 * (z - 200)) / 110) * sm((z - 110) / 170);        // the mill hill
    const left = 9 * sm((-x - 70) / 90) * sm((z - 50) / 120);                              // a low rise on the left
    const back = HILLS(x, z) * sm((z - 380) / 300);
    h += Math.max(right + left, back + right * .6);
    // the street is graded a little below the sage
    const rd = Math.abs(x - roadX(z)); if (rd < 4.5) h -= .12 * sm((4.5 - rd) / 1.5);
    if (h > 4) h = softCap(h, capH(x, z), 6);
    return Math.max(.02, h); };                              // never below 0: the raster reads that as water
  const hFar = (x, z) => Math.max(0, SIERRA(x, z) * sm((z - 30000) / 8000) + 60);

  /* colour: tawny bunchgrass and grey sage on the flats, the hills mottled with sage; snow on the crest */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const GR1 = H3("#ccae74"), GR2 = H3("#b09062"), SAGE1 = H3("#7e8670"), SAGE2 = H3("#9aa08a"), DIRT = H3("#b8a080"), RUT = H3("#94805e"), ROCK = H3("#8a8074"), RUST = H3("#a8744a");
  const SAGEAVG = L3(GR1, SAGE1, .45);
  const colNear = (x, y, z, n) => {
    const steep = 1 - n[1];
    let c = L3(GR1, GR2, .5 + .7 * N1(x / 12, z / 12));
    // sagebrush: fine dark mottling that blends to an average far off (it would alias)
    const sg = sm((N2(x / 2.4, z / 2.4) + .05) / .3), far = sm((z - 260) / 500);
    c = L3(c, L3(L3(SAGE1, SAGE2, .5 + N3(x / 1.3, z / 1.3)), SAGEAVG, far), sg * (.75 - far * .35));
    c = L3(c, SAGEAVG, far * .55);
    // far off the sage reads as patches and stipple across the hills, darker in the draws
    c = L3(c, H3("#5e6656"), (sm((N2(x / 16, z / 16) + .05) / .25) * .3 + sm((N1(x / 5.5, z / 5.5) - .1) / .25) * .25) * far);
    if (steep > .28) c = L3(c, L3(ROCK, RUST, .5 + N4(x / 9, z / 9)), sm((steep - .28) / .15) * .7);          // outcrops
    if (z > 300 && z < 1400) c = L3(c, H3("#c4a46a"), sm((N4(x / 90 + 4, z / 90) - .25) / .3) * .45);          // tawny grass slopes
    const rd = Math.abs(x - roadX(z));
    if (rd < 3.6 && z < 520) { const rut = Math.abs(rd - 1.1) < .28 ? .55 : 0;
      c = L3(c, L3(DIRT, RUT, rut + .3 * N3(x / 1.5, z / 1.5)), sm((3.6 - rd) / .8)); }
    if (y > 20 && z > 260 && z < 420 && x > 60 && x < 130) c = L3(c, H3("#a48a70"), .45);                   // mill tailings
    return c.map(v => v * (.93 + .14 * N3(x / 1.9, z / 1.9))); };
  const SNOWC = H3("#f4f2f6"), GRAN = H3("#8a8ca0"), PINE = H3("#4a5a5a");
  const colFar = (x, y, z, n) => { const steep = 1 - n[1], k = N1(x / 900, z / 900) * .5 + .5;
    let c = L3(GRAN, PINE, sm((900 - y) / 300) * .6);
    const sn = (y - 820) / 200 + k * .6 - steep * 1.4;
    if (sn > 0) c = L3(c, SNOWC, sn * 2.5);
    return c; };
  const far = w.raster({ z0: 30000, z1: 70000, step: .003, minStep: 40, scale: .55, top: 300, bottom: WY + 4, h: hFar, col: colFar, tone: rgbTone(T), fog: NIGHT ? "#2a3060" : "#c8cede", fogK: .00002, amb: NIGHT ? .6 : .55, noRefl: true, key: 1e7, light: [.78, .42, .12] });
  const near = w.raster({ z0: 5, z1: 4000, step: .0011, minStep: .05, scale: .72, top: 150, bottom: H, h: hNear, col: colNear, tone: rgbTone(T), fog: HZ, fogK: .00042, amb: NIGHT ? .58 : .46, noRefl: true, key: 5e6 });

  const seen = (x, z, y) => { const y0 = sy(y, z) - 1.5;
    for (let q = 6; q < z * .985; q += Math.max(.2, q * .012)) { const xq = x * q / z; if (sy(hNear(xq, q), q) < y0) return false; }
    return true; };
  const slope = (x, z) => { const e = Math.max(.2, z * .01), h0 = hNear(x, z); return Math.hypot(hNear(x + e, z) - h0, hNear(x, z + e) - h0) / e; };
  const ground = (x, z, hw) => Math.max(hNear(x - hw, z - hw), hNear(x + hw, z - hw), hNear(x - hw, z + hw), hNear(x + hw, z + hw));
  const low = (x, z, hw) => Math.min(hNear(x - hw, z - hw), hNear(x + hw, z - hw), hNear(x - hw, z + hw), hNear(x + hw, z + hw));

  /* ---------- plants: big sagebrush and rabbitbrush in yellow bloom ---------- */
  const SAGEC = ["#3e463c", "#525c4c", "#68705e", "#7e8672", "#969c88", "#b0b49e", "#c8cab4"];
  const RABC = ["#6a6a3a", "#8a8a44", "#b0a034", "#d0b02a", "#e8c838", "#f4dc6a"];
  const sage = (x, y, hp, fog) => { const Tf = c => T(mix(c, HZ, fog));
    let g = `<ellipse cx="${F(x - hp * .3)}" cy="${F(y)}" rx="${F(hp * .95)}" ry="${F(Math.max(.8, hp * .1))}" fill="#000" opacity=".2"/>`;
    if (hp > 14) for (let k = 0; k < 4; k++) g += `<path d="M${F(x + (k - 1.5) * hp * .12)},${F(y)} q${F((k - 1.5) * hp * .1)},${F(-hp * .3)} ${F((k - 1.5) * hp * .22)},${F(-hp * .55)}" stroke="${Tf("#4a3e34")}" stroke-width="${F(Math.max(.8, hp * .03))}" fill="none"/>`;
    const n = Math.max(3, Math.min(70, Math.round(hp * 1.4)));
    for (let i = 0; i < n; i++) { const a = r() * Math.PI, d = Math.sqrt(r()), px = x - Math.cos(a) * d * hp * .85, py = y - hp * .1 - Math.sin(a) * d * hp * .72, R = hp * (.13 + r() * .11);
      const v = cl(.42 + (px - x) / hp * .5 + (y - py) / hp * .35 + (r() - .5) * .3);
      g += `<path d="${blobP(px, py, R, R * .72, 6)}" fill="${Tf(SAGEC[Math.floor(v * SAGEC.length)])}"/>`; }
    return hp > 16 ? `<g filter="url(#bgLeafy)">${g}</g>` : g; };
  const rabbit = (x, y, hp, fog) => { const Tf = c => T(mix(c, HZ, fog));
    let g = `<ellipse cx="${F(x - hp * .3)}" cy="${F(y)}" rx="${F(hp * .8)}" ry="${F(Math.max(.8, hp * .09))}" fill="#000" opacity=".18"/>`;
    const n = Math.max(3, Math.min(14, Math.round(hp * .5)));
    for (let k = 0; k < n; k++) { const t = (k + .5) / n - .5; g += `<path d="M${F(x + t * hp * .2)},${F(y)} q${F(t * hp * .3)},${F(-hp * .4)} ${F(t * hp * 1.1)},${F(-hp * .8)}" stroke="${Tf("#6a7a50")}" stroke-width="${F(Math.max(.6, hp * .025))}" fill="none"/>`; }
    const m = Math.max(4, Math.min(50, Math.round(hp * 1.2)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI, d = Math.sqrt(r()), px = x - Math.cos(a) * d * hp * .75, py = y - hp * .45 - Math.sin(a) * d * hp * .45, R = hp * (.08 + r() * .08);
      const v = cl(.45 + (px - x) / hp * .55 + (y - py) / hp * .3 + (r() - .5) * .3);
      g += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${Tf(RABC[Math.floor(v * RABC.length)])}"/>`; }
    return hp > 16 ? `<g filter="url(#bgLeafy)">${g}</g>` : g; };
  for (let k = 0, n = 0; k < 40000 && n < 1500; k++) {
    const z = 7 + Math.pow(r(), 1.5) * 650, x = (r() - .5) * z * 1.3, y0 = hNear(x, z);
    if (Math.abs(x - roadX(z)) < 4.2 && z < 520) continue;
    if (slope(x, z) > .5) continue;
    const isR = r() < .2, hM = isR ? .55 + r() * .5 : .45 + r() * .55;
    if (sy(y0 + hM, z) < capY(sx(x, z)) - 4) continue;
    if (z > 30 && !seen(x, z, y0 + hM * .6)) continue;
    n++;
    w.sprite({ x, z, y: y0 - .03, fn: (px, py, kk, fog) => (isR ? rabbit : sage)(px, py, Math.max(1, hM * kk), fog) }); }

  /* ---------- the town: weathered board houses and false-front stores along Green Street ---------- */
  const WOOD = ["#8a7660", "#9a8468", "#76644f", "#a8927a", "#6a5848", "#b29a80", "#8e8070", "#7e6a58"];
  const TIN = ["#7a4a32", "#8a5838", "#6a4a3e", "#5e544e", "#94603a", "#6e3e2c", "#7a7068"];
  const pick = (a, rr) => a[Math.floor(rr() * a.length)];
  const CH = { x: roadX(150) - 13, z: 150 };                  // the Methodist church
  const RG = { x: roadX(104) - 30, z: 104 };                 // the ranger's house
  const homes = [[RG.x, RG.z, 5]];
  const store = (o, rr) => {                                 // a false front: a flat board facade standing taller than the gable behind it
    const { P } = w.frame(o), top = o.h + o.rh * .85 + .6;
    const v = [[-o.w / 2 - .2, 0, -o.d / 2 - .12], [o.w / 2 + .2, 0, -o.d / 2 - .12], [o.w / 2 + .2, top, -o.d / 2 - .12], [-o.w / 2 - .2, top, -o.d / 2 - .12]];
    const v2 = v.map(p => [p[0], p[1], p[2] - .18]);
    const wall = o.wall, faces = [];
    faces.push({ P: v2.map(P), c: wall, dec: [
      { P: [P([-o.w / 2 - .2, top - .1, -o.d / 2 - .32]), P([o.w / 2 + .2, top - .1, -o.d / 2 - .32])], c: mix(wall, "#000000", .35), ln: .22, min: .6 },
      { P: [P([-o.w / 2 + .3, top - .9, -o.d / 2 - .32]), P([o.w / 2 - .3, top - .9, -o.d / 2 - .32])], c: mix(wall, "#000000", .25), ln: .08, min: .4 },
      ...Array.from({ length: Math.floor(top / .3) }, (_, i) => ({ P: [P([-o.w / 2 - .2, .3 + i * .3, -o.d / 2 - .32]), P([o.w / 2 + .2, .3 + i * .3, -o.d / 2 - .32])], c: mix(wall, "#000000", .2), ln: .025, min: .3, op: .5 })) ] });
    faces.push({ P: [v[0], v[1], v2[1], v2[0]].map(P), c: wall });
    faces.push({ P: [v[1], v[2], v2[2], v2[1]].map(P), c: wall }, { P: [v[0], v[3], v2[3], v2[0]].map(P), c: wall });
    // a plank awning over the boardwalk
    faces.push({ P: [[-o.w / 2, 3, -o.d / 2 - .3], [o.w / 2, 3, -o.d / 2 - .3], [o.w / 2, 2.7, -o.d / 2 - 2.2], [-o.w / 2, 2.7, -o.d / 2 - 2.2]].map(P), c: pick(TIN, rr), two: true, back: "#3a2e28" });
    [-o.w / 2 + .2, o.w / 2 - .2].forEach(u => faces.push({ P: [P([u, 0, -o.d / 2 - 2.1]), P([u, 2.72, -o.d / 2 - 2.1])], c: "#5a4a3a", ln: .14, min: .5 }));
    faces.push({ P: [[-o.w / 2, .25, -o.d / 2 - .3], [o.w / 2, .25, -o.d / 2 - .3], [o.w / 2, .25, -o.d / 2 - 2.2], [-o.w / 2, .25, -o.d / 2 - 2.2]].map(P), c: "#7a6a58", up: true });
    w.add(faces, { center: P([0, top / 2, -o.d / 2 - .3]), bias: -.4 }); };
  const building = (x, z, side, rr, kind) => {
    const y0 = ground(x, z, 3), base = low(x, z, 3);
    const yaw = (side < 0 ? 90 : -90) + (rr() - .5) * 14;
    const o = w.randomHouse(rr, { x, z, y: y0, yaw, fy: Math.min(-.2, base - y0 - .1), rng: rr, kind: kind === "store" ? "village" : "cottage" });
    o.wall = pick(WOOD, rr); o.roof = pick(TIN, rr); o.trim = mix(o.wall, "#d8ccb8", .3); o.shut = null; o.doorC = mix(o.wall, "#000000", .35);
    o.glass = "#2a2c30"; o.stone = "#7a7268"; o.chimC = "#6a5a4e";
    if (kind === "store") { o.roof3 = "gable"; o.gable = true; o.porch = false; o.h = 4 + rr() * 1.2; o.rh = 1.8 + rr(); o.w = 6 + rr() * 3; o.d = 9 + rr() * 5; }
    // a few windows boarded over
    o.extra = (sideN, q, len) => { if (rr() < .4) { const u = len * (.2 + rr() * .6); q(u - .5, 1, u + .5, 2.2, mix(o.wall, "#000000", .15), { off: .09 });
      for (let k = 0; k < 3; k++) q(u - .55, 1.1 + k * .38, u + .55, 1.32 + k * .38, mix(o.wall, "#ffffff", .1), { off: .1 }); } };
    w.house(o);
    if (kind === "store") store(o, rr);
    homes.push([x, z, Math.max(o.w, o.d) / 2]);
    return o; };
  // keep the line to the church clear: nothing nearer than it may cover its screen span
  const blocksChurch = (x, z, hw) => (z < CH.z + 6 && Math.abs(sx(x, z) - sx(CH.x, CH.z)) < FL * hw / z + 150)
    || (z < 290 && sx(x, z) + FL * hw / z > 1700 && sx(x, z) - FL * hw / z < 1960 && FL * 7 / z > 60);      // and the mill
  for (let z = 92; z < 430; z += 13 + rh() * 16) {
    [-1, 1].forEach(side => {
      if (rh() < .38) return;
      const x = roadX(z) + side * (8 + rh() * 9), hw = 5;
      if (Math.hypot(x - CH.x, z - CH.z) < 18 || homes.some(([hx, hz, hw]) => Math.hypot(hx - x, hz - z) < hw + 9)) return;
      if (blocksChurch(x, z, hw)) return;
      if (x > 40 && z > 200 && z < 420) return;              // the mill yard
      if (slope(x, z) > .25) return;
      building(x, z, side, rh, z > 110 && z < 260 && rh() < .5 ? "store" : "house"); }); }
  // a second row off the street, scattered further back
  for (let k = 0, n = 0; k < 400 && n < 16; k++) {
    const z = 140 + rh() * 330, x = roadX(z) + (rh() < .5 ? -1 : 1) * (26 + rh() * 70);
    if (homes.some(([hx, hz, hw]) => Math.hypot(hx - x, hz - z) < hw + 9)) continue;
    if (Math.hypot(x - CH.x, z - CH.z) < 22 || blocksChurch(x, z, 5)) continue;
    if (x > 40 && z > 200 && z < 420) continue;
    if (slope(x, z) > .25 || sx(x, z) < 120 || sx(x, z) > 2440) continue;
    n++; building(x, z, x < roadX(z) ? -1 : 1, rh, "house"); }

  /* the church: board-and-batten nave, gable to the street, a square tower and spire on the front */
  { const y0 = ground(CH.x, CH.z, 5), base = low(CH.x, CH.z, 5), yaw = -28, WALL = NIGHT ? "#a89c8c" : "#c4b6a0", ROOF = "#6a4434";
    const o = { x: CH.x, z: CH.z, y: y0, yaw, w: 8.5, d: 15, h: 6.2, rh: 4.4, gable: true, wall: WALL, roof: ROOF, trim: "#e2d8c6", clap: true, door: false,
      glass: "#2a2c34", fy: Math.min(-.3, base - y0 - .1), stone: "#7a7268", winGap: 3.2, winTall: 1.5, chim: undefined,
      win: (u, ri, side) => side !== "front" || ri === 1 };
    w.house(o);
    const { P } = w.frame(o), fz = -o.d / 2;
    // tower: three stages, the belfry open with louvres, then a tall four-sided spire
    const TW = 3.1, t0 = 0, t1 = 10.6, t2 = 13.4;
    const tower = (y0l, y1l, wd, c) => { const v = [[-wd, y0l, fz - 1.2 - wd], [wd, y0l, fz - 1.2 - wd], [wd, y0l, fz - 1.2 + wd], [-wd, y0l, fz - 1.2 + wd], [-wd, y1l, fz - 1.2 - wd], [wd, y1l, fz - 1.2 - wd], [wd, y1l, fz - 1.2 + wd], [-wd, y1l, fz - 1.2 + wd]].map(P);
      return [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 6, 7]].map(q => ({ P: q.map(i => v[i]), c })); };
    const f1 = tower(t0, t1, TW / 2, WALL);
    // the tower front: double doors, a lancet window, battens
    const Q = (u0, v0, u1, v1, c, off = .06, ex = {}) => ({ P: [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => P([u, v, fz - 1.2 - TW / 2 - off])), c, ...ex });
    f1[0].dec = [Q(-.85, 0, .85, 2.9, "#e2d8c6"), Q(-.72, 0, .72, 2.75, "#4a3428", .08), Q(-.03, 0, .03, 2.75, "#2a1e18", .1),
      Q(-.5, 4.3, .5, 6.4, "#e2d8c6"), Q(-.38, 4.4, .38, 6.25, NIGHT ? "#1a1c2a" : "#2a2c34", .08), Q(-.5, 7.6, .5, 8.6, "#e2d8c6"), Q(-.38, 7.7, .38, 8.5, "#2a2c34", .08),
      ...Array.from({ length: 9 }, (_, i) => ({ P: [P([-TW / 2 + .17 + i * .345, 0, fz - 1.2 - TW / 2 - .04]), P([-TW / 2 + .17 + i * .345, t1, fz - 1.2 - TW / 2 - .04])], c: mix(WALL, "#000000", .18), ln: .04, min: .3, op: .6 }))];
    w.add(f1, { center: P([0, t1 / 2, fz - 1.2]), bias: -1 });
    const f2 = tower(t1, t2, TW / 2 - .15, WALL);
    f2.slice(0, 4).forEach(Fc => { const [a, b, , d] = Fc.P, L = (p, q, t) => p.map((v, j) => v + (q[j] - v) * t);
      const U = t => L(a, b, t), up = (p, k) => [p[0], p[1] + (t2 - t1) * k, p[2]];
      Fc.dec = [{ P: [up(U(.22), .15), up(U(.78), .15), up(U(.78), .82), up(U(.22), .82)], c: "#1a1614" },
        ...[.3, .45, .6, .74].map(k => ({ P: [up(U(.22), k), up(U(.78), k)], c: "#8a7a68", ln: .07, min: .4 }))]; });
    w.add(f2, { center: P([0, (t1 + t2) / 2, fz - 1.2]), bias: -1.1 });
    w.box({ ...o, ...(() => { const c = P([0, 0, fz - 1.2]); return { x: c[0], z: c[2] }; })(), y: y0 + t2, w: TW + .3, d: TW + .3, h: .3, c: "#e2d8c6", bias: -1.2 });
    { const c = P([0, 0, fz - 1.2]); w.cyl({ x: c[0], z: c[2], y: y0 + t2 + .3, r0: TW * .74, r1: 0, h: 5.6, n: 4, rot: Math.PI / 4 + yaw * Math.PI / 180, c: ROOF, bias: -1.3 });
      w.line([[c[0], y0 + t2 + 5.8, c[2]], [c[0], y0 + t2 + 6.6, c[2]]], "#3a3030", .08, { bias: -1.4 }); } }

  /* the ranger's house: the one home still lived in (lit at night, a jack-o'-lantern on the porch) */
  if (!blocksChurch(RG.x, RG.z, 4)) {
    const y0 = ground(RG.x, RG.z, 4);
    w.house({ x: RG.x, z: RG.z, y: y0, yaw: 64, w: 7.5, d: 6.5, h: 3.4, rh: 2.6, wall: "#9a8a72", roof: "#5e544e", trim: "#d8ccb4", porch: true, chim: .75, chimC: "#6a5a4e",
      fy: -.3, stone: "#7a7268", win: () => false, doorC: "#4a3428",
      extra: (side, q, len) => { if (side !== "front" && side !== "left") return;
        [.22, .8].forEach(t => { const u = len * t; if (side === "front" && Math.abs(u - len / 2) < 1.4) return;
          q(u - .55, .95, u + .55, 2.3, "#d8ccb4"); q(u - .43, 1.05, u + .43, 2.2, NIGHT ? "#ffc060" : "#2a2c30", { glow: NIGHT, off: .07 });
          if (NIGHT) q(u - .02, 1.05, u + .02, 2.2, "#7a4a20", { off: .08 }); }); } });
  }
  // outhouses and woodsheds behind a few homes
  homes.slice(0, 14).forEach(([x, z, hw], i) => { if (i % 2) return; const ox = x + (x < roadX(z) ? -1 : 1) * (hw + 4), oz = z + 4;
    if (blocksChurch(ox, oz, 1.5)) return;
    const y0 = ground(ox, oz, .8); w.house({ x: ox, z: oz, y: y0, yaw: (rb() - .5) * 30, w: 1.4, d: 1.4, h: 2.2, rh: .5, roof3: "shed", wall: pick(WOOD, rb), roof: pick(TIN, rb), trim: "#8a7a68", clap: true, door: .5, win: () => false, ao: true, shingle: false, chim: undefined }); });

  /* power poles along the street, leaning a little, with a sagging wire */
  { const tops = [];
    for (let z = 92; z < 360; z += 30) { const x = roadX(z) + 5.2, y0 = hNear(x, z), lean = (rb() - .5) * .5, hp = 8.5 + rb();
      if (blocksChurch(x, z, .4)) { tops.push(null); continue; }
      const top = [x + lean, y0 + hp, z];
      w.line([[x, y0, z], top], "#5a4636", .24);
      w.line([[x + lean - 1.1, y0 + hp - .5, z], [x + lean + 1.1, y0 + hp - .45, z]], "#5a4636", .14);
      tops.push(top); }
    for (let i = 0; i < tops.length - 1; i++) { const a = tops[i], b = tops[i + 1]; if (!a || !b) continue;
      for (const dx of [-.9, .9]) { const P = [];
        for (let k = 0; k <= 8; k++) { const t = k / 8; P.push([a[0] + (b[0] - a[0]) * t + dx, a[1] - .5 + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * .7, a[2] + (b[2] - a[2]) * t]); }
        w.line(P, "#2a2420", .03, { min: .5, op: .7 }); } } }

  /* the Standard stamp mill, stepping down the hill on the right: tin-clad sheds, an ore bin, a stack */
  { const secs = [[64, 298, 8, 10, 6], [73, 310, 9, 10, 8.5], [83, 322, 8, 10, 10], [93, 334, 7, 9, 7]];
    secs.forEach(([x, z, wd, dp, ht], i) => { const y0 = ground(x, z, 4), b = low(x, z, 4);
      const yTop = Math.max(3, Math.min(ht, (WY - 268) * z / FL + EYE - y0 - 3.4));
      w.house({ x, z, y: y0, yaw: -14, w: wd, d: dp, h: yTop, rh: 3.4, roof3: i === 2 ? "gable" : "shed", wall: ["#9a6a48", "#8a7468", "#8a5a40", "#a08870"][i], roof: ["#7e3e2c", "#6a6460", "#6e4a3a", "#8a4a30"][i], trim: "#5e4a3e",
        fy: Math.min(-.3, b - y0 - .2), stone: "#6a625a", winGap: 2.2, winTall: .9, glass: "#24262a", door: i === 0 ? .4 : false, clap: true }); });
    const sx0 = 92, sz0 = 330, y0 = ground(sx0, sz0, 2), stH = Math.min(16, (WY - 262) * sz0 / FL + EYE - y0);
    w.cyl({ x: sx0, z: sz0, y: y0, r0: .75, r1: .6, h: stH, n: 10, c: "#4a3a34", top: "#1a1414" });
    // the ore bin and tram trestle climbing toward the headframe
    const bx = 60, bz = 286, by = ground(bx, bz, 2);
    w.box({ x: bx, z: bz, y: by + 4, yaw: -14, w: 5, d: 4, h: 4, c: "#7a5a42", top: "#5a4032" });
    for (let k = 0; k < 4; k++) { const u = k % 2 ? 2.2 : -2.2, v = k < 2 ? 1.8 : -1.8, c = [bx + u, by, bz + v]; w.line([c, [c[0], by + 4.05, c[2]]], "#4a3a2e", .2); } }
  /* a headframe on the far rise, left of the town */
  { const hx = -178, hz = 640, y0 = ground(hx, hz, 3), hTop = Math.min(13, (WY - 266) * hz / FL + EYE - y0);
    if (hTop > 5) { const legs = [[-2, -2], [2, -2], [2, 2], [-2, 2]].map(([u, v]) => [hx + u, y0, hz + v]), top = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => [hx + u, y0 + hTop, hz + v]);
      legs.forEach((p, i) => w.line([p, top[i]], "#4a3a30", .35));
      for (let k = 1; k < 4; k++) { const t = k / 4; for (let i = 0; i < 4; i++) { const a = legs[i].map((v, j) => v + (top[i][j] - v) * t), b = legs[(i + 1) % 4].map((v, j) => v + (top[(i + 1) % 4][j] - v) * t); w.line([a, b], "#4a3a30", .18); } }
      w.line([[hx - 4, y0, hz - 5], [hx, y0 + hTop, hz]], "#4a3a30", .3);
      w.box({ x: hx + 5, z: hz + 2, y: y0, w: 7, d: 6, h: 4, c: "#8a5a40", top: "#6e4a3a" }); } }

  /* a rusted 1930s truck nosed into the sage left of the street */
  { const x = roadX(64) - 7.5, z = 64, y0 = hNear(x, z), yaw = 38, RUSTB = "#8a4a2a";
    const o = { x, z, y: y0, yaw }, { P } = w.frame(o);
    const at = (u, v) => { const p = P([u, 0, v]); return { x: p[0], z: p[2] }; };
    w.box({ ...at(.9, 0), y: y0 + .55, yaw, w: 2.3, d: 1.7, h: .55, c: "#6a5a4a", top: "#5a4a3c" });                 // the flatbed
    w.box({ ...at(-.7, 0), y: y0 + .6, yaw, w: 1.2, d: 1.6, h: 1.25, c: RUSTB, top: "#6a3a22",
      dec: faces => faces.slice(0, 4).forEach(Fc => { const [a, b, cc, d] = Fc.P, L = (p, q, t) => p.map((v, j) => v + (q[j] - v) * t);
        Fc.dec = [{ P: [L(L(a, b, .15), L(d, cc, .15), .45), L(L(a, b, .85), L(d, cc, .85), .45), L(L(a, b, .85), L(d, cc, .85), .9), L(L(a, b, .15), L(d, cc, .15), .9)], c: "#1e1a18" }]; }) });
    w.box({ ...at(-1.9, 0), y: y0 + .55, yaw, w: 1.3, d: 1.0, h: .75, c: "#7a3e22", top: "#6a3418" });             // the hood
    [[1.4, 1], [1.4, -1], [-1.8, 1], [-1.8, -1]].forEach(([u, sd]) => { const pts = [];
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; pts.push(P([u + Math.cos(a) * .38, .36 + Math.sin(a) * .36, sd * .86])); }
      w.add([{ P: pts, c: "#1e1c1c", two: true }], { center: P([u, .4, 0]) }); });
    [[-1.4, .9], [-1.4, -.9]].forEach(([u, sd]) => { const pts = [];          // fenders
      for (let i = 0; i <= 6; i++) { const a = Math.PI * i / 6; pts.push(P([u - .1 + Math.cos(a) * .6 - .4, .4 + Math.sin(a) * .45, sd])); }
      w.add([{ P: pts, c: "#6a3418", two: true }], { center: P([u, .5, 0]) }); }); }

  /* a split-rail fence running along the street in front of the first houses */
  { for (let z = 22; z < 70; z += 3.4) { const x = roadX(z) - 5.4, y0 = hNear(x, z), z2 = z + 3.4, x2 = roadX(z2) - 5.4, y2 = hNear(x2, z2);
      w.line([[x, y0, z], [x, y0 + 1.25, z]], "#6a5848", .11);
      if (rb() < .85) w.line([[x, y0 + .95, z], [x2, y2 + .95 + (rb() - .5) * .1, z2]], "#8a7660", .07);
      if (rb() < .7) w.line([[x, y0 + .5, z], [x2, y2 + .5 + (rb() - .5) * .2, z2]], "#7a6652", .07); } }

  /* ---------------- assemble ---------------- */
  const isFar = o => o === far, isNear = o => o === near, rest = o => !o.raster;
  s += w.draw({ where: isFar });
  s += `<rect x="0" y="${WY - 110}" width="${W}" height="130" fill="url(#bgHaze)" opacity=".55"/>`;
  s += w.draw({ where: isNear });
  s += `<rect x="0" y="${WY - 70}" width="${W}" height="110" fill="url(#bgHaze)" opacity=".25"/>`;
  s += w.draw({ where: rest });
  // bunchgrass at the bottom corners, under the cards
  const tuft = (x0, x1) => { let g = "";
    for (let i = 0; i < 90; i++) { const x = x0 + r() * (x1 - x0), y = 700 + r() * 30, hh = 40 + r() * 90, bend = (r() - .5) * 40;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#b8985e" : "#d8bc84")}" stroke-width="${F(1.5 + r() * 2)}" fill="none" stroke-linecap="round"/>`; }
    return g; };
  s += tuft(0, 300) + tuft(2260, 2560);
  if (NIGHT) {
    // the ranger's lit windows spill onto the porch; a jack-o'-lantern by the steps
    const [rx, ry] = w.proj([RG.x, ground(RG.x, RG.z, 4) + 1.6, RG.z]);
    s += `<ellipse cx="${F(rx)}" cy="${F(ry + 10)}" rx="190" ry="90" fill="url(#bgLamp)" style="mix-blend-mode:screen" opacity=".5"/>`;
    const jp = w.proj(w.frame({ x: RG.x, z: RG.z, y: ground(RG.x, RG.z, 4), yaw: 64 }).P([-2.6, .45, -3.25 - 2.3]));
    const k = FL / RG.z * .42;
    s += `<circle cx="${F(jp[0])}" cy="${F(jp[1] - k * .4)}" r="${F(k * 2.4)}" fill="url(#bgLamp)" style="mix-blend-mode:screen" opacity=".8"/>
      <ellipse cx="${F(jp[0])}" cy="${F(jp[1] - k * .45)}" rx="${F(k * .62)}" ry="${F(k * .48)}" fill="#c4581a"/>
      <path d="M${F(jp[0] - k * .32)},${F(jp[1] - k * .55)} l${F(k * .12)},${F(-k * .14)} l${F(k * .12)},${F(k * .14)}Z M${F(jp[0] + k * .08)},${F(jp[1] - k * .55)} l${F(k * .12)},${F(-k * .14)} l${F(k * .12)},${F(k * .14)}Z M${F(jp[0] - k * .32)},${F(jp[1] - k * .32)} q${F(k * .32)},${F(k * .2)} ${F(k * .64)},0 l-${F(k * .1)},${F(k * .08)} l-${F(k * .12)},-${F(k * .06)} l-${F(k * .12)},${F(k * .06)} l-${F(k * .12)},-${F(k * .06)}Z" fill="#ffd060"/>`;
    // bats round the steeple
    const [bx, by] = w.proj([CH.x, 20, CH.z]);
    s += `<g fill="#05060e">`;
    [[-70, -30, .42], [60, -60, .34], [110, 10, .28], [-130, 30, .25]].forEach(([dx, dy, k2]) =>
      s += `<path transform="translate(${F(bx + dx)},${F(by + dy)}) scale(${k2})" d="M0,0 q-10,-12 -24,-8 q6,4 4,10 q-8,-2 -12,4 q14,-2 32,6 q18,-8 32,-6 q-4,-6 -12,-4 q-2,-6 4,-10 q-14,-4 -24,8z"/>`);
    s += `</g>`;
  }
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#bgLight)" style="mix-blend-mode:soft-light"/>`;
  else s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".06"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#bgPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
