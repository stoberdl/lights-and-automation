/* Blue Ridge Switchbacks: from a high overlook we look along an Appalachian
   valley. On the right a long hardwood ridge runs in from beyond the frame and
   recedes toward the middle; a mountain road climbs its flank in five
   switchbacks to a fire lookout on the crest. To the left the valley opens on a
   white church and farms, and four ranges of ridges stack up behind, each
   paler and bluer. Late-afternoon sun low on the left lights the flank.
   All land is one world3d() raster (reference/scene-helpers.js): every crown in
   the forest is a small lit dome in the heightfield, so the canopy is shaded by
   the same sun as the hills; the road legs are benches cut into the slope.
   opts.time === "night": moonless (new moon Oct 10), Milky Way, Draconid
   meteors from the north-west, headlights on the switchbacks, lit windows and
   a red beacon on the lookout.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), mountainColor(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function blueRidgeSwitchbacksArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 4417;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = NIGHT ? 1180 : -220, LY = NIGHT ? -200 : 300, WY = 410;
  const T = c => NIGHT ? mix(mix(c, "#6a7090", .45), "#0a1232", .62) : c;
  const HZ = NIGHT ? "#1c2850" : "#a9bcd8", RIM = NIGHT ? "#b8c8f0" : "#fff0c4", LAMP = "#ffc868", SHADE = NIGHT ? "#04060e" : "#2a2c48";
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };

  /* ---------------- sky ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#030714"/><stop offset=".45" stop-color="#0a1432"/><stop offset=".85" stop-color="#18244a"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#5a88c4"/><stop offset=".45" stop-color="#98b8de"/><stop offset=".82" stop-color="#cfd9e6"/><stop offset="1" stop-color="#eee2c8"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#8090c0" stop-opacity="0"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2cc" stop-opacity=".95"/><stop offset=".22" stop-color="#ffe0a0" stop-opacity=".5"/><stop offset=".6" stop-color="#ffd890" stop-opacity=".14"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/>`;
  let s = `<defs id="brdefs">
    <linearGradient id="brSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="brLight" cx="${LX}" cy="${LY}" r="1500" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="brMist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".55" stop-color="${HZ}" stop-opacity=".7"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="brGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".95"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".32"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="brHead"><stop offset="0" stop-color="#fffbe8" stop-opacity="1"/><stop offset=".3" stop-color="#fff0c0" stop-opacity=".4"/><stop offset="1" stop-color="#fff0c0" stop-opacity="0"/></radialGradient>
    <radialGradient id="brRed"><stop offset="0" stop-color="#ff5a3a" stop-opacity=".95"/><stop offset=".4" stop-color="#ff3a2a" stop-opacity=".3"/><stop offset="1" stop-color="#ff3a2a" stop-opacity="0"/></radialGradient>
    <linearGradient id="brMet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfe0ff" stop-opacity="0"/><stop offset=".75" stop-color="#e8f0ff" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity=".95"/></linearGradient>
    <filter id="brCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="3" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="brPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="brSoft"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="brWay" x="-20%" y="-50%" width="140%" height="200%"><feTurbulence type="fractalNoise" baseFrequency=".008 .02" numOctaves="4" seed="41" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="90" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="18"/></filter>
    <filter id="brPuff" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="15" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.4"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#brSky)"/>`;
  if (NIGHT) {
    // the Milky Way, rising steeply from the south-west through the middle of the sky
    s += `<g filter="url(#brWay)" opacity=".2"><path d="M560,430 C800,300 1040,170 1300,-40 L1520,-40 C1250,190 1000,330 760,440Z" fill="#b8c4e8"/></g>`;
    for (let i = 0; i < 900; i++) { let x, y;
      if (i < 260) { const t = rs(); x = 660 + t * 760 + (rs() - .5) * 160; y = 430 - t * 470 + (rs() - .5) * 90; }
      else { x = rs() * W; y = Math.pow(rs(), 1.25) * 400; }
      const big = rs() < .05;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.6 : F(.45 + rs() * .65)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(Math.max(.1, .25 + rs() * .6 * (1 - y / 440)))}"/>`; }
    // Draconids: streaks pointing away from the radiant, high in the north-west (off the top left)
    const RX = 300, RY = -420;
    [[1010, 120, 120], [1180, 70, 90], [1330, 175, 140], [1090, 225, 70], [1420, 95, 60]].forEach(([x, y, L]) => {
      const a = Math.atan2(y - RY, x - RX) * 180 / Math.PI;
      s += `<g transform="translate(${x},${y}) rotate(${F(a)})"><path d="M${-L},-.5 L0,-1.2 L0,1.2 L${-L},.5Z" fill="url(#brMet)"/><circle r="2.2" fill="#fff" opacity=".9"/><circle r="6" fill="#dfe8ff" opacity=".25"/></g>`; });
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#brLight)"/>`;
    s += `<g class="rays" opacity=".06" filter="url(#brSoft)">`;
    for (let k = 0; k < 6; k++) { const a = -.12 + k * .06, L = 1900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: thin fair-weather heaps, gold underneath on the sun side ---------------- */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#brCloudy)">`;
    const lobes = [];
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#101a38" opacity=".8"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#18224a" opacity=".8"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .09 * (.6 + rs() * .7), w * (.07 + rs() * .055)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#cdb8ac"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .7)}" fill="#dccbc4"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .8)}" fill="#f8f2ea"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .32)}" cy="${F(ly - R * .3)}" rx="${F(R * .56)}" ry="${F(R * .34)}" fill="#fff4dc"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(640, 110, 320, "drift1") + cloud(1420, 70, 260, "drift2") + cloud(2120, 130, 380, "drift3") + cloud(1040, 205, 150, "drift2") + cloud(2460, 60, 220, "drift1");
  if (!NIGHT) {   // two hawks riding the updraft off the flank
    s += `<g class="birds" fill="none" stroke="#2c2830" stroke-width="2.2" stroke-linecap="round" opacity=".75">`;
    [[1060, 250, 1.1], [1125, 228, .9]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 13 * k)},${F(y + 1 * k)} q${F(6 * k)},${F(-5 * k)} ${F(13 * k)},${F(-1 * k)} q${F(7 * k)},${F(-4 * k)} ${F(13 * k)},${F(1 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 60 m above the valley floor; horizon on WY. Metres, x right, y up, z away.
     The ridge: a crest line from (600, 650) receding along D; u runs along it, v is
     the distance out over its west flank (toward the camera and the sun). */
  const EYE = 110, FL = 2000;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.2, .8, .3] : [-.85, .42, -.2], tone: T, fog: HZ, fogK: .00015,
    shadow: SHADE, rim: RIM, shade: .5, hi: .25, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9), NR = noise2(seed + 21);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const DX = -.3594, DZ = .9332, NX = -.9332, NZ = -.3594, CX0 = 600, CZ0 = 650, WV = 520, WE = 320;
  const UV = (x, z) => { const a = x - CX0, b = z - CZ0; return [a * DX + b * DZ, a * NX + b * NZ]; };
  const XZ = (u, v) => [CX0 + u * DX + v * NX, CZ0 + u * DZ + v * NZ];
  const crest = u => (145 + .07 * u + 16 * N3(u / 170, 9.3)) * (1 - sm((u - 1850) / 700));
  const ridgeUV = (u, v) => {
    const hc = crest(u); if (hc <= 0) return 0;
    const p = v >= 0 ? 1 - sm(v / WV) : 1 - sm(-v / WE);
    const sp = NR(u / 130, v / 260) + .4 * NR(u / 55 + 4, v / 120);   // spurs and hollows running down the face
    return hc * p + 16 * sp * 4 * p * (1 - p) + 8 * N1(u / 260, v / 260) * p; };
  /* the road: five legs joined by hairpins, as polylines in (u, v) */
  const UA = 700, UB = 1350, RW = 3.6;
  const LEGS = [[[150, 470], [UB, 354]], [[UB, 328], [UA, 302]], [[UA, 276], [UB, 250]], [[UB, 224], [UA, 198]], [[UA, 172], [UB, 146], [1600, 12]]];
  const PINS = [[UB, 341, 1], [UA, 289, -1], [UB, 237, 1], [UA, 185, -1]];
  const road = (u, v) => {            // -> { d metres off the centre line, vc: centre v here, s: + downhill side } or null
    if (u < 120 || u > 1640 || v < -10 || v > 500) return null;
    let best = null;
    const take = (d, cu, cv, sgn) => { if (d < 16 && (!best || d < best.d)) best = { d, cu, cv, s: sgn }; };
    for (const L of LEGS) for (let i = 0; i + 1 < L.length; i++) { const [u0, v0] = L[i], [u1, v1] = L[i + 1];
      const du = u1 - u0, dv = v1 - v0, t = Math.max(0, Math.min(1, ((u - u0) * du + (v - v0) * dv) / (du * du + dv * dv)));
      const cu = u0 + du * t, cv = v0 + dv * t; take(Math.hypot(u - cu, v - cv), cu, cv, v - cv); }
    for (const [pu, pv, side] of PINS) { if ((u - pu) * side < 0) continue;
      const a = Math.atan2(v - pv, u - pu), cu = pu + Math.cos(a) * 13, cv = pv + Math.sin(a) * 13;
      take(Math.abs(Math.hypot(u - pu, v - pv) - 13), cu, cv, Math.hypot(u - pu, v - pv) - 13); }
    return best; };
  /* the valley floor: small fields with hedgerows, a creek, woodlots */
  const creekZ = x => 1080 + 160 * Math.sin(x / 420 + .7) + 40 * Math.sin(x / 130) + .25 * x;
  const field = (x, z) => { const fs = (x + 14 * N1(z / 90, 1)) / 70, ft = (z + 10 * N1(x / 90, 2)) / 46;
    return { fi: hash(Math.floor(fs), Math.floor(ft)), edge: Math.min(fs - Math.floor(fs), Math.ceil(fs) - fs, ft - Math.floor(ft), Math.ceil(ft) - ft) }; };
  const valley = (x, z) => { let h = 1.1 + 1.5 * N2(x / 180, z / 180) + .35 * N3(x / 35, z / 35);
    const ce = Math.abs(z - creekZ(x)) - 4; if (ce < 0) h = -1; else if (ce < 7) h = -.4 + (h + .4) * sm(ce / 7);
    return h; };
  /* every crown a lit dome; a crown exists where the wood is at its centre */
  const CS = 7;
  const wooded = (x, z) => { const [u, v] = UV(x, z);
    if (v < WV - 40 && v > -WE && crest(u) > 20) return true;                       // the ridge
    if (z > 3200) return false;
    if (Math.abs(z - creekZ(x)) < 12) return true;                                   // along the creek
    const ft = (z + 10 * N1(x / 90, 2)) / 46, e = Math.min(ft - Math.floor(ft), Math.ceil(ft) - ft);
    return field(x, z).fi < .1 || (e < .06 && hash(Math.round(ft), 4.4) < .45); };  // woodlots, some hedgerows
  const crown = (x, z) => { const gx = Math.floor(x / CS), gz = Math.floor(z / CS); let best = 0, id = -1;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const i = gx + a, j = gz + b;
      const cx = (i + .15 + .7 * hash(i, j)) * CS, cz = (j + .15 + .7 * hash(j + 3.1, i)) * CS, R = CS * (.6 + .3 * hash(i + 7, j));
      const d2 = ((x - cx) ** 2 + (z - cz) ** 2) / (R * R); if (d2 >= 1) continue;
      const hh = Math.pow(1 - d2, .75) * (2.2 + 2 * hash(i, j + 5)); if (hh > best && wooded(cx, cz)) { best = hh; id = i * 7919 + j; } }
    return [best, id]; };
  /* the far ridges: four ranges, each a long crest with knobs and saddles */
  const PK = [], rP = rng(seed + 33);
  [[3700, 210, -3600, 1600, 700, 560], [6600, 470, -7500, 3000, 1300, 1000], [11200, 860, -13000, 6000, 2100, 1600], [18500, 1450, -21000, 11000, 3400, 2500]].forEach(([z, h, xa, xb, sp, rz]) => {
    for (let x = xa; x < xb; x += sp * (.6 + rP() * .7)) PK.push({ x, z: z + (rP() - .5) * rz * .6, h: h * (.8 + rP() * .4), rx: sp * (.8 + rP() * .7), rz }); });
  const MF = mountainField({ seed: 613, scale: 5200, oct: 4, warp: .3, peaks: PK });
  const hNat = (x, z) => { const [u, v] = UV(x, z); return Math.max(valley(x, z), ridgeUV(u, v)); };
  const hT = (x, z) => {
    const [u, v] = UV(x, z);
    let h = Math.max(valley(x, z), ridgeUV(u, v));
    if (z > 2600) { const far = MF(x, z) * sm((z - 2600) / 1600); if (far > h) h = far; }
    if (h < 0) return h;
    let clear = 1;
    const rd = z < 2400 ? road(u, v) : null;
    if (rd) { const [rx, rz] = XZ(rd.cu, rd.cv), surf = ridgeUV(rd.cu, rd.cv), b = 1 - sm((rd.d - RW) / 5);
      h += (surf - h) * b; clear = sm((rd.d - RW - (rd.s > 0 ? 5 : 2)) / (rd.s > 0 ? 6 : 3)); }
    if (z < 3200) { const [cb] = crown(x, z); if (cb > 0) h += (1 + cb) * clear; }
    return h; };

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const AUT = ["#3a5230", "#5a6a2e", "#8a8a34", "#c4a234", "#d8862c", "#c45a24", "#a8341c", "#8a2618", "#b87a2c", "#d6b048"].map(H3);
  const FIELD = ["#9aa850", "#c8b46a", "#a88e5a", "#7a9844", "#b4a85c", "#8a9a4c"].map(H3);
  const ASPH = H3("#a8a298"), CUT = H3("#9a8466"), STONE = H3("#8e8676"), MUD = H3("#6a6250"), GAP = H3("#2e2a1c"), VERGE = H3("#8c9a50");
  const farCol = mountainColor({ seed: 57, tree: 3000, goldK: .45, forest: "#2e4a3c", gold: "#a8823c", rock: "#7a7468", rock2: "#5a5650" });
  const col = (x, y, z, n, ao) => {
    if (z > 3200) { const c = farCol(x, y, z, n, ao), k = 1 - sm((z - 3200) / 6000);   // autumn patches fading with distance
      if (k <= 0) return c;
      const a = (N3(x / 70, z / 70) * .5 + .5) * 9, m = L3(AUT[Math.floor(a)], AUT[Math.min(9, Math.floor(a) + 1)], a % 1);
      return L3(c, m.map(q => q * (.75 + .4 * (N1(x / 18, z / 18) * .5 + .5))), k * .45); }
    if (y < .3) return L3(MUD, STONE, .4 + .4 * N3(x / 3, z / 3));                 // creek banks
    const [u, v] = UV(x, z), rd = z < 2400 ? road(u, v) : null;
    if (rd && rd.d < RW) return ASPH.map(q => q * (.94 + .08 * N2(x / 4, z / 4)));
    if (rd && rd.d < RW + 2.5) return L3(CUT, STONE, .3 + .4 * N3(x / 2, z / 2));    // cut bank and fill
    if (rd && rd.s > 0 && rd.d < RW + 6) return L3(VERGE, GAP, .2 + .3 * N2(x / 5, z / 5));   // mown verge below the leg
    const [cb, id] = crown(x, z);
    if (cb > 0 || wooded(x, z)) {
      if (cb <= 0) return GAP;
      const reg = (N1(x / 300, z / 300) * .5 + .5) * .75 + sm((y - 40) / 140) * .35;  // colour comes on higher up
      const k = Math.max(0, Math.min(AUT.length - 1, Math.floor(reg * 7 + (hash(id, 1.7) - .5) * 2.4)));
      return AUT[k].map(q => q * (.88 + .16 * hash(id, 3.3)) * (.82 + .18 * cb / 4.2)); }
    const f = field(x, z);
    let c = FIELD[Math.floor(f.fi * FIELD.length)].map(q => q * (.9 + .14 * N2(x / 6, z / 6)));
    if (f.edge < .1) c = L3(c, GAP, .25);
    return c; };
  w.raster({ z0: 300, z1: 30000, step: .0012, minStep: .3, scale: .75, top: 100, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00015, amb: NIGHT ? .55 : .42 });

  /* ---------- placing things ---------- */
  const seen = (x, z) => { const y0 = sy(hT(x, z), z) - 1.5;
    for (let q = 660; q < z * .985; q += Math.max(.8, q * .01)) { const xq = x * q / z, hq = hT(xq, q); if (hq < 0) continue; if (sy(hq, q) < y0) return false; }
    return true; };
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);
  const open = (x, z) => { const [u, v] = UV(x, z); return ridgeUV(u, v) < 2 && Math.abs(z - creekZ(x)) > 20 && !wooded(x, z); };
  const onGround = o => { const { P } = w.frame({ ...o, y: 0 }), c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => P([a * o.w / 2, 0, b * o.d / 2]));
    const hs = c.map(p => hNat(p[0], p[2])), top = Math.max(...hs), low = Math.min(...hs); return { ...o, y: top, fy: low - top - .3 }; };

  /* ---------- the fire lookout on the crest: steel legs, braces, a glazed cab ---------- */
  { const [tx, tz] = XZ(1600, 0), g = hNat(tx, tz) + 3, TH = 20, B0 = 3.2, B1 = 1.6, STEEL = "#4a4c52";
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) w.line([[tx + a * B0, g, tz + b * B0], [tx + a * B1, g + TH, tz + b * B1]], STEEL, .3);
    for (let lv = 0; lv < 4; lv++) { const y0 = g + lv * TH / 4, y1 = y0 + TH / 4, k0 = B0 + (B1 - B0) * lv / 4, k1 = B0 + (B1 - B0) * (lv + 1) / 4;
      w.line([[tx - k0, y0, tz - k0], [tx + k1, y1, tz - k1]], STEEL, .14); w.line([[tx + k0, y0, tz - k0], [tx - k1, y1, tz - k1]], STEEL, .14); }
    w.box({ x: tx, z: tz, y: g + TH, w: 4.4, d: 4.4, h: .9, c: "#7a6a58" });
    w.box({ x: tx, z: tz, y: g + TH + .9, w: 4, d: 4, h: 2.2, c: "#8a7a64", dec: (fc, Pf) => {
      fc[0].dec = [{ P: [Pf([-1.8, .3, -2.03]), Pf([1.8, .3, -2.03]), Pf([1.8, 1.9, -2.03]), Pf([-1.8, 1.9, -2.03])], c: NIGHT ? LAMP : "#bcd0dc", glow: NIGHT }]; } });
    w.cyl({ x: tx, z: tz, y: g + TH + 3.1, r0: 3.3, r1: 0, h: 1.8, n: 4, rot: Math.PI / 4, c: "#6a3a2e" });
    if (NIGHT) w.sprite({ x: tx, z: tz - .5, y: g + TH + 5.4, bias: -3, fn: (px, py, kk) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(6, kk * 2.6))}" fill="url(#brRed)"/>` }); }

  /* ---------- cars on the switchbacks ---------- */
  const CARS = ["#b8302a", "#e8e4dc", "#2e4a6a", "#c89a2a", "#3a3c40"];
  [[0, .55, 1], [1, .35, -1], [2, .7, 1], [3, .25, -1], [4, .4, 1]].forEach(([k, t, dir], i) => {
    const [[u0, v0], [u1, v1]] = LEGS[k], u = u0 + (u1 - u0) * t, v = v0 + (v1 - v0) * t, [x, z] = XZ(u, v), y = ridgeUV(u, v);
    const fwd = (u1 > u0 ? 1 : -1) * dir, yaw = fwd > 0 ? 111 : -69, c = CARS[i % CARS.length];
    w.box({ x, z, y: y + .35, yaw, w: 4.4, d: 1.8, h: .75, c });
    w.box({ x: x - fwd * DX * .3, z: z - fwd * DZ * .3, y: y + 1.1, yaw, w: 2.4, d: 1.6, h: .55, c: mix(c, "#202028", .3) });
    if (NIGHT) { const hx = x + fwd * DX * 2.4, hz = z + fwd * DZ * 2.4, bx = x - fwd * DX * 2.4, bz = z - fwd * DZ * 2.4;
      w.sprite({ x: hx, z: hz - 1, y: y + .8, bias: -2, fn: (px, py, kk) => `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(Math.max(7, kk * 8))}" ry="${F(Math.max(3, kk * 2.6))}" fill="url(#brHead)" opacity=".9"/>` });
      w.sprite({ x: bx, z: bz - 1, y: y + .8, bias: -2, fn: (px, py, kk) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(2.6, kk * 1.3))}" fill="url(#brRed)"/>` }); } });

  /* ---------- the valley floor: a white church, farms ---------- */
  { const cx0 = -640, cz0 = 2250, g = hNat(cx0, cz0), yaw = -Math.atan2(cx0, cz0) * 180 / Math.PI;
    w.house(onGround({ x: cx0, z: cz0, yaw, w: 9, d: 16, h: 6, rh: 4.6, gable: true, wall: "#f2eee4", roof: "#3a3c44", trim: "#f6f2ea", door: .5, winGap: 2.8, winTall: 1.4, rng: rl }));
    const { P } = w.frame({ x: cx0, z: cz0, yaw }), bt = P([0, 0, -7.2]);
    w.box({ x: bt[0], z: bt[2], y: g, yaw, w: 3.4, d: 3.4, h: 13, c: "#f2eee4", dec: (fc, Pf) => { fc[0].dec = [{ P: [Pf([-.6, 9, -1.72]), Pf([.6, 9, -1.72]), Pf([.6, 11.2, -1.72]), Pf([-.6, 11.2, -1.72])], c: NIGHT ? LAMP : "#3a3c44", glow: NIGHT }]; } });
    w.cyl({ x: bt[0], z: bt[2], y: g + 13, r0: 2, r1: 0, h: 9, n: 8, rot: Math.PI / 8 + yaw * Math.PI / 180, c: "#3a3c44" });
    used.push([cx0, cz0, 18]); }
  const FARMS = [];
  for (let k = 0, n = 0; k < 4000 && n < 16; k++) {
    const z = 1500 + Math.pow(rl(), 1.3) * 1700, x = -z * (.1 + rl() * .9);
    if (!open(x, z) || !free(x, z, 40) || sy(0, z) > 560 || sx(x, z) < 30 || !seen(x, z)) continue;
    const kind = rl() < .55 ? "farm" : rl() < .6 ? "village" : "cottage", yaw = -Math.atan2(x, z) * 180 / Math.PI + (rl() - .5) * 40;
    w.house(onGround(w.randomHouse(rl, { x, z, yaw, kind, rng: rl, fy: 0 })));
    used.push([x, z, 14]); n++; FARMS.push([x, z]);
    if (kind === "farm") { const bx = x + 22 + rl() * 10, bz = z + 12 + rl() * 10;
      if (open(bx, bz)) { w.house(onGround({ x: bx, z: bz, yaw: yaw + 8, w: 13, d: 9, h: 4.6, rh: 4.2, roof3: rl() < .6 ? "gambrel" : "gable", wall: rl() < .45 ? "#8a3a2a" : rl() < .5 ? "#7a7468" : "#e8e0d0", roof: "#4a4040", trim: "#e8e0cc", door: .5, winGap: 4, rng: rl })); used.push([bx, bz, 12]); }
      if (rl() < .6) { const qx = x - 14, qz = z + 16; if (open(qx, qz)) { w.cyl({ x: qx, z: qz, y: hNat(qx, qz), r0: 2.6, r1: 2.6, h: 13, n: 10, c: "#9aa0a4", top: false });
        w.cyl({ x: qx, z: qz, y: hNat(qx, qz) + 13, r0: 2.7, r1: 0, h: 2.2, n: 10, c: "#7a8086" }); } } }
    if (NIGHT && rl() < .7) { const g = hNat(x, z) + 5; w.sprite({ x: x + 6, z: z - 4, y: g, bias: -3, fn: (px, py, kk) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(5, kk * 5))}" fill="url(#brGlow)" opacity=".8"/>` }); }
  }

  /* ---------------- assemble ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  s += w.draw({ where: isR });
  s += `<rect x="0" y="${WY - 140}" width="${W}" height="110" fill="url(#brMist)" opacity="${NIGHT ? .25 : .35}"/>`;
  s += w.draw({ where: notR });
  if (!NIGHT && FARMS.length) { const [fx0, fz0] = FARMS[0], bx = sx(fx0, fz0), by = sy(hNat(fx0, fz0) + 9, fz0);
    s += `<g class="smoke" filter="url(#brPuff)" opacity=".5">${[0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${F(bx + 3 + i * 5)}" cy="${F(by - i * 8)}" rx="${F(2.5 + i * 1.5)}" ry="${F(2 + i)}" fill="#eae6e2" opacity="${F(.6 - i * .08)}"/>`).join("")}</g>`; }
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#brLight)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#brPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
