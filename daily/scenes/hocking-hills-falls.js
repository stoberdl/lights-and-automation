/* Hocking Hills Falls: a waterfall at the head of a Blackhand sandstone gorge in
   the Hocking Hills of southeast Ohio, in peak October colour (the week of Oct
   19, 2026: the city at peak, the hills peaking Oct 21-26). Seen from a
   sandstone ledge by the creek, 4 m above the water: the creek winds out of a
   plunge pool toward us between slump blocks and leaf-strewn banks; the gorge
   walls (buff sandstone with horizontal bedding, honeycomb pits, black seep
   stains and moss at the foot) close in from both sides to a horseshoe
   headwall, where the creek drops 24 m through a notch in the rim. Hemlocks
   stand on the talus, a railed trail runs along the right ledge, a mossy log
   lies across the creek, and the rim is crowded with oak, maple, beech and
   hemlock in full colour. Upstream, the notch the creek has cut opens a window
   to the sky and a far blue ridge.
   opts.time === "night": that evening, a waxing gibbous moon in the notch
   right above the falls, stars, a silvered curtain of water and a moon glade
   on the pool.
   The land is one world3d() raster (reference/scene-helpers.js), shaded per
   pixel; trees, boulders, the falls, the log and the railing are placed in
   metres by the same camera. The reflection is traced here so the walls show
   in the pool beyond the water (the shared mirror pass stops at water).
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".       */
function hockingHillsFallsArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1019;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17), rb = rng(seed + 31);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const WY = 405, EYE = 4, FL = 1800;
  const MX = 1196, MY = 104, MR = 25;                      // the moon, in the notch above the falls
  const LX = NIGHT ? MX : -190, LY = NIGHT ? MY : 34;
  const T = c => NIGHT ? mix(mix(c, "#6a7290", .45), "#081030", .6) : c;
  const HZ = NIGHT ? "#26325a" : "#d8dee6", RIM = NIGHT ? "#c0ccf0" : "#fff2cc", SHADE = NIGHT ? "#04060e" : "#2a2a3c";
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

  /* ---------------- sky: clear October blue, or a moonlit night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040820"/><stop offset=".45" stop-color="#0c1840"/><stop offset=".8" stop-color="#1e2c58"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#3c78c0"/><stop offset=".4" stop-color="#78aedc"/><stop offset=".75" stop-color="#bcd6e8"/><stop offset="1" stop-color="#eae6d8"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#d0dcff" stop-opacity=".38"/><stop offset=".22" stop-color="#9aaae0" stop-opacity=".13"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff8dc" stop-opacity=".95"/><stop offset=".18" stop-color="#fff0c4" stop-opacity=".45"/><stop offset=".55" stop-color="#ffe4a8" stop-opacity=".12"/><stop offset="1" stop-color="#ffe4a8" stop-opacity="0"/>`;
  let s = `<defs id="hhdefs">
    <linearGradient id="hhSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="hhLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 820 : 1500}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="hhHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".7"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="hhWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#1e2a50"/><stop offset=".35" stop-color="#121c3c"/><stop offset="1" stop-color="#080e24"/>`
      : `<stop offset="0" stop-color="#5a6a58"/><stop offset=".3" stop-color="#46584c"/><stop offset=".7" stop-color="#34463e"/><stop offset="1" stop-color="#26362e"/>`}</linearGradient>
    <radialGradient id="hhMist"><stop offset="0" stop-color="${NIGHT ? "#b4c0e4" : "#ffffff"}" stop-opacity="1"/><stop offset=".55" stop-color="${NIGHT ? "#8a98c4" : "#f2f4f4"}" stop-opacity=".5"/><stop offset="1" stop-color="${NIGHT ? "#8a98c4" : "#f2f4f4"}" stop-opacity="0"/></radialGradient>
    <radialGradient id="hhMoon" cx=".42" cy=".4"><stop offset="0" stop-color="#fffef6"/><stop offset=".7" stop-color="#f2eedc"/><stop offset="1" stop-color="#d8d4c4"/></radialGradient>
    <clipPath id="hhCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="hhLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hhNeedle" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".3" numOctaves="2" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hhCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".017" numOctaves="3" seed="37" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="hhFlow" x="-20%" y="-5%" width="140%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".25 .012" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".5"/></filter>
    <filter id="hhRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .08" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".8"/></filter>
    <filter id="hhPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="hhSoft"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="hhFog" x="-30%" y="-80%" width="160%" height="260%"><feTurbulence type="fractalNoise" baseFrequency=".01 .04" numOctaves="3" seed="12" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="4"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hhSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 620; i++) { const x = rs() * W, y = Math.pow(rs(), 1.25) * 380, big = rs() < .07;
      if (Math.hypot(x - MX, y - MY) < 140 && rs() < .85) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.2 + rs() * .6 * (1 - y / 420))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#hhLight)"/>`;
    // a waxing gibbous moon (about 62% lit, lit side to the lower right), soft maria
    s += `<circle cx="${MX}" cy="${MY}" r="${MR * 1.7}" fill="#fffbe8" opacity=".14" filter="url(#hhSoft)"/>`;
    s += `<circle cx="${MX}" cy="${MY}" r="${MR}" fill="url(#hhMoon)"/>`;
    [[-8, -6, 7, .1], [5, 3, 9, .09], [-3, 9, 5, .08], [9, -8, 4, .07]].forEach(([dx, dy, R, o]) => s += `<ellipse cx="${MX + dx}" cy="${MY + dy}" rx="${R}" ry="${R * .8}" fill="#9a9a90" opacity="${o}"/>`);
    { const a = -.5, ca = Math.cos(a), sa = Math.sin(a), k = .25;   // terminator: the dark limb on the upper left
      const p = (u, v) => `${F(MX + u * ca - v * sa)},${F(MY + u * sa + v * ca)}`;
      s += `<path d="M${p(0, -MR)} A${MR},${MR} 0 0 0 ${p(0, MR)} A${F(MR * k)},${MR} ${F(a * 57.3)} 0 1 ${p(0, -MR)}Z" fill="#1a2238" opacity=".72"/>`; }
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#hhLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#hhSoft)">`;
    for (let k = 0; k < 6; k++) { const a = .1 + k * .085, L = 1900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .022) * L)},${F(LY + Math.sin(a - .022) * L)} L${F(LX + Math.cos(a + .022) * L)},${F(LY + Math.sin(a + .022) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a few small fair-weather heaps, thin over the text corners ---------------- */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#hhCloudy)">`;
    const lobes = [];
    if (NIGHT) {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#162044"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#202c56"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .3)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .15)}" fill="#4a5a8c" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 8; k++) { const t = k / 7; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .1 * (.6 + rs() * .7), w * (.07 + rs() * .06)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#b8c8dc"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .7)}" fill="#ccd8e6"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .8)}" fill="#f6f6f2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .32)}" cy="${F(ly - R * .3)}" rx="${F(R * .56)}" ry="${F(R * .34)}" fill="#fffbec"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(560, 120, 260, "drift1") + cloud(1380, 58, 300, "drift2") + cloud(2050, 105, 380, "drift3") + cloud(2440, 200, 180, "drift1");
  if (!NIGHT) {   // turkey vultures riding the thermals over the gorge
    s += `<g class="birds" fill="none" stroke="#2a2626" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".75">`;
    [[1010, 92, 1.1, .1], [1090, 64, .9, -.15], [1335, 110, .8, .2]].forEach(([x, y, k, tilt]) =>
      s += `<path transform="rotate(${F(tilt * 30)} ${x} ${y})" d="M${F(x - 16 * k)},${F(y - 5 * k)} q${F(8 * k)},${F(3 * k)} ${F(16 * k)},${F(5 * k)} q${F(8 * k)},${F(-2 * k)} ${F(16 * k)},${F(-5 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 4 m above the creek on a ledge; metres, x right, y up, z away. The
     falls drop from a notch in the headwall at (XF, ZF); the gorge flares
     toward us and the creek winds out to a pool under our feet. */
  const XF = -12, ZF = 175, LIP = 24;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.25, .6, .45] : [-.62, .55, -.36], tone: T, fog: HZ, fogK: .0006,
    shadow: SHADE, rim: RIM, shade: .5, hi: .25, night: NIGHT, lamp: "#ffc868" });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  /* the land never rises above yLim on screen: low over the text corners, open in the middle */
  const cen = u => Math.exp(-(((u - 1190) / 360) ** 2));                                  // 1 behind the falls, 0 toward the corners
  const yLim = u => 262 - 222 * Math.exp(-(((u - 1190) / 310) ** 2));
  const capH = (x, z) => EYE + (WY - yLim(sx(x, z))) * z / FL * (.95 + .05 * N3(x / 60, z / 60));
  const ax = z => XF + 7 * Math.sin((ZF - z) / 55);                                      // gorge axis
  const hw = z => 22 + .6 * Math.max(0, ZF - 14 - z) + 3 * N1(z / 25, 1.7);               // half width to the wall foot
  const ZH = x => ZF + .012 * (x - XF) ** 2 + 3 * N2(x / 18, 4.2);                        // the horseshoe headwall
  const smin = (a, b, k) => -k * Math.log(Math.exp(-a / k) + Math.exp(-b / k));
  const xc = z => XF + 5 * Math.sin((ZF - z) / 34) + 3 * Math.sin((ZF - z) / 13 + 1) + Math.max(0, 60 - z) * .25;
  const cw = z => 3.4 + 1.4 * Math.sin(z / 21) + Math.max(0, 42 - z) * .62;
  const MF = mountainField({ seed: 619, scale: 1700, oct: 5, peaks: [
    { x: -900, z: 2600, h: 120, rx: 1500, rz: 900 }, { x: 900, z: 3400, h: 150, r: 1600 }, { x: -3200, z: 3600, h: 140, r: 1800 } ] });
  const geo = (x, z) => {
    const e = smin(hw(z) - Math.abs(x - ax(z)), ZH(x) - z, 4);
    const nearF = Math.hypot((x - XF) / 1.6, Math.max(0, ZF - 34 - z) * .9);
    const tal = (8 + 3 * N2(x / 20, z / 20)) * sm(nearF / 16);
    return { e, tal }; };
  const hT = (x, z) => {
    const { e, tal } = geo(x, z);
    // the rim stands full height round the headwall and steps down along the side walls,
    // where a wooded slope climbs away behind a lower cliff
    const rimH = 7 + 2 * N1(x / 40, z / 40) + (20 + 2.5 * N3(x / 50, z / 50)) * cen(sx(x, z));
    let h;
    if (e >= 0) {
      h = .5 + .45 * N2(x / 7, z / 7) + .25 * N1(x / 2.3, z / 2.3);
      if (e < tal) h += (5 + 2 * N1(x / 25, z / 25)) * Math.pow(1 - e / tal, 1.6);
      const cd = Math.min(Math.abs(x - xc(z)) - cw(z), Math.hypot((x - XF) / 1.25, z - (ZF - 8)) - 11) + 1.2 * N3(x / 9, z / 9);
      if (cd < 0) h = -1; else if (cd < 2.5) h = -.6 + (h + .6) * sm(cd / 2.5);
    } else {
      const d = -e, base = tal > .5 ? 5.2 + 2 * N1(x / 25, z / 25) : .4;
      const rv = Math.abs(x - XF - 2 * N1(z / 40, 6)), rav = z > ZF - 8 ? 1 - sm((rv - 3) / 13) : 0;
      const top = rimH - (rimH - LIP) * rav, CW = 3.4 + N2(x / 30, z / 30);
      if (d < CW) { const q = d / CW, q2 = q + .035 * Math.sin(q * Math.PI * 8);   // a few bedding ledges
        h = base + (top - base) * (1 - Math.pow(1 - Math.max(0, Math.min(1, q2)), 1.25)); }
      else h = top + Math.min(40, (d - CW) * .14) * (1 - rav) + 1.4 * N2(x / 30, z / 30) * sm((d - CW) / 10);
    }
    if (z > 450) { const far = MF(x, z) * sm((z - 450) / 900); if (far > h) h = far; }
    return h > 0 ? Math.min(h, capH(x, z)) : h; };

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const AUT = ["#a8321e", "#c8542a", "#de8a2c", "#e6b03a", "#cfc048", "#8a3424", "#7a7a30", "#b86a2a", "#d49a36"].map(H3);
  const HEM = ["#1e3428", "#2a4432", "#36523a"].map(H3);
  const SAND = ["#dcbc88", "#c8a06a", "#ae8452", "#8e6a42"].map(H3), STAIN = H3("#3e342c"), MOSS = H3("#5e7434"), MOSS2 = H3("#3e5a2c");
  const LITTER = ["#7a5434", "#9a6430", "#b8742c", "#c49a3c", "#6a4a30", "#8a7a3a"].map(H3), WETS = H3("#6a5e4c"), SANDY = H3("#b8a07a");
  const woods = (x, z) => { const tx = N2(x / 3.2, z / 3.2) * .3 + N3(x / 1.4, z / 1.4) * .2 + .5;
    const a = (N3(x / 16, z / 16) * .6 + N1(x / 7, z / 7) * .4) * .5 + .5, ai = a * (AUT.length - 1), i0 = Math.floor(ai);
    let c = L3(HEM[0], HEM[2], N1(x / 30, z / 30) * .5 + .5);
    const ac = L3(AUT[i0], AUT[Math.min(AUT.length - 1, i0 + 1)], ai - i0);
    c = L3(c, ac, sm((N2(x / 22 + 5, z / 22) * .5 + .5) * 1.7 - .15) * .9);
    return c.map(v => v * (.72 + .46 * tx)); };
  const stone = (x, y, z) => {
    const al = x - z * .7, t = y + 1.3 * N1(al / 30, 3.3);
    const band = .5 + .3 * Math.sin(t * 2.4) + .2 * Math.sin(t * 6.1 + 1);
    let c = L3(SAND[0], SAND[2], band * .7 + .3 * (N2(al / 4, y / 2) * .5 + .5));
    if (N3(al / .9, y / .9) > .3) c = c.map(v => v * .8);                                 // honeycomb pits
    const st = N1(al / 3.4, y / 20) + .3 * N2(al / 1.2, y / 6);                           // black seep streaks
    if (st > .22) c = L3(c, STAIN, Math.min(.78, (st - .22) * 2.4));
    if (y < 7) c = L3(c, MOSS, sm((7 - y) / 5) * .55 * (N2(al / 5, y / 3) * .5 + .5));    // moss at the wet foot
    return c; };
  const col = (x, y, z, n) => {
    const steep = 1 - n[1];
    if (z > 320 || steep < .5 && geo(x, z).e < -3) return woods(x, z);
    if (steep > .45 && y > 1.2) return stone(x, y, z);
    if (y < .3) return L3(WETS, SANDY, .5 + .5 * N3(x / 1.5, z / 1.5));                   // wet sand and gravel at the water
    if (y > 2.2) {                                                                        // talus: needles, moss, slabs
      const k = N1(x / 4, z / 4) * .5 + .5;
      return L3(L3(MOSS2, LITTER[4], k), SAND[3], sm((N2(x / 3, z / 3) - .2) * 3)).map(v => v * (.85 + .2 * N3(x, z))); }
    const k = (N2(x / 2.5, z / 2.5) * .5 + .5) * (LITTER.length - 1), i0 = Math.floor(k);     // leaf litter on the floor
    return L3(LITTER[i0], LITTER[Math.min(LITTER.length - 1, i0 + 1)], k - i0).map(v => v * (.8 + .3 * N3(x / .8, z / .8))); };
  const rt = rgbTone(T);
  w.raster({ z0: 7, z1: 420, step: .0007, minStep: .03, scale: .75, top: 0, bottom: H, h: hT, col, tone: rt, fog: HZ, fogK: .0006, amb: NIGHT ? .5 : .42, noRefl: true });
  w.raster({ z0: 420, z1: 5000, step: .002, scale: .75, top: 0, bottom: WY + 20, h: hT, col, tone: rt, fog: HZ, fogK: .0006, amb: NIGHT ? .5 : .42, noRefl: true });

  /* the reflection, traced here: water is see-through in the mirror, so the walls and
     the far bank show in the pool; each sample fills only rows not yet taken */
  const mirrorImg = () => {
    const sc = .5, Wd = W * sc, Hd = Math.round((H - WY) * sc), Lr = (v => { const l = Math.hypot(...v); return v.map(q => q / l); })(NIGHT ? [-.25, .6, .45] : [-.62, .55, -.36]);
    const cv = document.createElement("canvas"); cv.width = Wd; cv.height = Hd;
    const ctx = cv.getContext("2d"), img = ctx.createImageData(Wd, Hd), D = img.data, FOGR = H3(HZ);
    for (let i = 0; i < Wd; i++) {
      const dx = (i / sc + .5 - 1280) / FL, filled = new Uint8Array(Hd); let prev = null, left = Hd;
      for (let z = 8; z < 900 && left > 0; z += Math.max(.12, z * .004)) {
        const x = dx * z, hg = hT(x, z);
        if (hg <= 0) { prev = null; continue; }
        const ys = FL * (EYE + hg) / z * sc, lo = prev === null ? ys : Math.min(ys, prev), hi = prev === null ? ys + 1 : Math.max(ys, prev) + 1;
        prev = ys;
        if (lo >= Hd) continue;
        const y0 = Math.max(0, Math.floor(lo)), y1 = Math.min(Hd, Math.ceil(hi));
        let any = false; for (let y = y0; y < y1; y++) if (!filled[y]) { any = true; break; }
        if (!any) continue;
        const e = Math.max(.05, z * .0015), nn = [-(hT(x + e, z) - hg) / e, 1, -(hT(x, z + e) - hg) / e], L = Math.hypot(...nn);
        const nv = nn.map(v => v / L), l = Math.max(0, nv[0] * Lr[0] + nv[1] * Lr[1] + nv[2] * Lr[2]), k = (NIGHT ? .5 : .42) + (NIGHT ? .5 : .58) * l;
        const t = 1 - Math.exp(-z * .0006);
        const c = rt(col(x, hg, z, nv).map((v, j) => Math.min(255, v * k) * (1 - t) + FOGR[j] * t));
        for (let y = y0; y < y1; y++) if (!filled[y]) { filled[y] = 1; left--; const p = (y * Wd + i) * 4; D[p] = c[0]; D[p + 1] = c[1]; D[p + 2] = c[2]; D[p + 3] = 255; }
      }
    }
    ctx.putImageData(img, 0, 0);
    return `<image href="${cv.toDataURL("image/png")}" x="0" y="${WY}" width="${W}" height="${H - WY}" preserveAspectRatio="none"/>`; };

  /* ---------- 2D drawings placed as sprites ---------- */
  const MAPLE = ["#4a1408", "#6a1e0c", "#8a2a12", "#a83a18", "#c45222", "#d8702e", "#e89444", "#f4bc6c"];
  const GOLDR = ["#4a3a14", "#6a5418", "#8a7020", "#a88a28", "#c4a234", "#d8b84a", "#e8d070", "#f6e8a4"];
  const BEECH = ["#4a2a10", "#6a3e16", "#8a541c", "#a86c24", "#c48a30", "#d8a444", "#e8c064", "#f4dc98"];
  const OAK = ["#3a2414", "#4e3018", "#683e1c", "#82501e", "#9c6424", "#b47c32", "#c89448", "#dcb070"];
  const RAMPS = [MAPLE, GOLDR, BEECH, OAK, GOLDR, MAPLE];
  const lxW = -1;                                     // light from the left by day; the moon is ahead at night
  const broadleaf = (x, y, hp, RAMP, fog, n) => {
    const sd = lxW, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .035), ty = y - hp * .4;
    g += `<ellipse cx="${F(x - sd * hp * .1)}" cy="${F(y + 1)}" rx="${F(hp * .26)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .55)},${F(ty)} L${F(x + tb * .55)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#6a6058")}"/>`;
    g += `<path d="M${F(x - sd * tb * .1)},${F(y)} L${F(x - sd * tb * .1)},${F(ty)} L${F(x - sd * tb * .55)},${F(ty)} L${F(x - sd * tb)},${F(y)}Z" fill="${Tf("#3e3830")}"/>`;
    for (let k = 0; k < 4; k++) { const a = -1.2 + k * .8 + (r() - .5) * .3; g += `<path d="M${F(x)},${F(ty + hp * .05)} L${F(x + Math.sin(a) * hp * .22)},${F(ty - Math.cos(a) * hp * .2)}" stroke="${Tf("#4a4038")}" stroke-width="${F(Math.max(.8, tb * .5))}"/>`; }
    const cx = x, cy = y - hp * .64, rx = hp * .34, ry = hp * .3, ux = sd * .8, uy = -.6, cs = [];
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
    return g + `<g filter="url(#hhLeafy)">${cg}</g>`; };
  /* a small far tree: a dark irregular mass with shaded, mid and lit clumps */
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1e1a08", sz < 9 ? .22 : .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .1), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    const m = Math.max(2, Math.min(26, Math.round(sz / 2.2)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) * lxW + (y - sz * .5 - py) * .8, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .12 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };
  /* an eastern hemlock: a straight dark trunk, tiers of drooping, jagged needle sprays
     (lit on the left, shaded on the right) and the nodding leader hemlocks are known by */
  const HEMC = ["#14261c", "#1e3426", "#2a4430", "#38553a", "#4a6844", "#62804e"];
  const hemlock = (x, y, hp, fog) => {
    const Tf = c => T(mix(c, HZ, fog)), wd = hp * (.2 + r() * .06); let g = "", ng = "";
    g += `<ellipse cx="${F(x + hp * .06)}" cy="${F(y + 1)}" rx="${F(wd * 1.1)}" ry="${F(Math.max(1, hp * .025))}" fill="#000" opacity=".25"/>`;
    const tb = Math.max(1, hp * .022);
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .3)},${F(y - hp * .96)} L${F(x + tb * .3)},${F(y - hp * .96)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#4a3228")}"/>`;
    g += `<path d="M${F(x)},${F(y)} L${F(x + tb * .1)},${F(y - hp * .96)} L${F(x + tb * .3)},${F(y - hp * .96)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#2a1c16")}"/>`;
    const n = Math.max(5, Math.min(15, Math.round(hp / 9)));
    for (let i = 0; i < n; i++) { const t = i / (n - 1), ty = y - hp * (.14 + .8 * t), half = wd * Math.pow(1 - t * .92, .9) * (.8 + r() * .35) + hp * .02;
      [-1, 1].forEach(sd => { const L = half * (.85 + r() * .3), dr = L * (.28 + r() * .12), m = Math.max(4, Math.round(L / 3));
        const lit = sd < 0 ? 3 + (r() < .4 ? 1 : 0) : 1 + (r() < .3 ? 1 : 0);
        let d = `M${F(x)},${F(ty - hp * .012)} Q${F(x + sd * L * .55)},${F(ty - dr * .35)} ${F(x + sd * L)},${F(ty + dr)}`;
        for (let k = m; k >= 0; k--) { const u = k / m, px = x + sd * L * u, py = ty + dr * Math.pow(u, 1.4) + hp * .03 * (1 - u * .3) + (k % 2 ? hp * .018 : 0); d += ` L${F(px)},${F(py)}`; }
        ng += `<path d="${d}Z" fill="${Tf(HEMC[lit])}"/>`;
        if (sd < 0 || r() < .3) { // lit upper fringe of the spray
          ng += `<path d="M${F(x + sd * L * .15)},${F(ty - hp * .006)} Q${F(x + sd * L * .55)},${F(ty - dr * .25)} ${F(x + sd * L * .92)},${F(ty + dr * .85)}" stroke="${Tf(HEMC[Math.min(5, lit + 2)])}" stroke-width="${F(Math.max(.8, hp * .012))}" fill="none" stroke-linecap="round" opacity=".8"/>`; } }); }
    const tt = y - hp;   // the nodding leader
    ng += `<path d="M${F(x)},${F(tt + hp * .08)} Q${F(x + hp * .005)},${F(tt)} ${F(x + hp * .035)},${F(tt + hp * .02)}" stroke="${Tf(HEMC[2])}" stroke-width="${F(Math.max(.8, hp * .012))}" fill="none"/>`;
    return g + `<g filter="url(#hhNeedle)">${ng}</g>`; };
  /* a sandstone slump block: lit top and face, dark underside, moss and a few leaves on top */
  /* a block that has fallen off the wall: a lit top, a front face and a shaded side,
     rounded corners, bedding lines and a cap of moss with a few fallen leaves */
  const boulder = (x, y, R, fog, hR) => { const Tf = c => T(mix(c, HZ, fog)), hh = R * hR, n = 9;
    // an irregular rounded outline, flat where it sits; shade the right and lower part, light the top-left
    const P = Array.from({ length: n }, (_, i) => { const a = Math.PI + i / (n - 1) * Math.PI, k = .78 + rb() * .3;
      return [x + Math.cos(a) * R * k, Math.min(y, y - hh * .5 + Math.sin(a) * hh * .62 * k)]; });
    const path = pts => "M" + pts.map(p => `${F(p[0])},${F(p[1])}`).join(" L") + "Z";
    const body = [[P[0][0], y], ...P, [P[n - 1][0], y]];
    let g = `<ellipse cx="${F(x + R * .25)}" cy="${F(y)}" rx="${F(R * 1.2)}" ry="${F(Math.max(1, R * .1))}" fill="#000" opacity=".3"/>`;
    g += `<path d="${path(body)}" fill="${Tf("#9a7a52")}" stroke="${Tf("#9a7a52")}" stroke-width="${F(R * .14)}" stroke-linejoin="round"/>`;
    const sh = [[x + R * .1, y], ...P.slice(Math.floor(n * .55)).map(([px, py]) => [px, py + hh * .1]), [P[n - 1][0], y]];
    g += `<path d="${path(sh)}" fill="${Tf("#6a4e34")}" stroke="${Tf("#6a4e34")}" stroke-width="${F(R * .1)}" stroke-linejoin="round" opacity=".9"/>`;
    g += `<path d="${path(P.slice(1, Math.floor(n * .6)).map(([px, py]) => [px + R * .06, py + hh * .08]).concat([[x + R * .05, y - hh * .52], [x - R * .55, y - hh * .38]]))}" fill="${Tf("#c9a676")}" stroke="${Tf("#c9a676")}" stroke-width="${F(R * .1)}" stroke-linejoin="round"/>`;
    g += `<path d="${blobP(x - R * .12, y - hh * .9, R * .5, hh * .14 + 1, 9, rb)}" fill="${Tf(rb() < .6 ? "#5e7434" : "#6e8038")}"/>`;
    for (let k = 0; k < 3 + R / 5; k++) g += `<path d="${blobP(x + (rb() - .6) * R * .9, y - hh * (.82 + rb() * .14), R * .05 + 1, R * .025 + .7, 5, rb)}" fill="${Tf(["#c8542a", "#e6b03a", "#a8321e"][Math.floor(rb() * 3)])}"/>`;
    return g; };

  const seen = (x, z, y0 = hT(x, z)) => { const yS = sy(y0, z) - 1.5;
    for (let q = 9; q < z * .985; q += Math.max(.3, q * .012)) { const xq = x * q / z, hq = hT(xq, q); if (hq < 0) continue; if (sy(hq, q) < yS) return false; }
    return true; };
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);
  const okTop = (x, z, topY) => topY > yLim(sx(x, z)) - 22;          // keep crowns out of the text corners

  /* ---------- the falls: a curtain off the notch, a dark wet streak behind it, foam at the foot ---------- */
  const ZFW = ZH(XF) - 1.2;
  w.sprite({ x: XF, z: ZFW, y: 0, bias: -1, fn: (px, py, k) => {
    const top = py - LIP * k, w0 = 3.2 * k, w1 = 5.6 * k;
    const WC = NIGHT ? ["#e2eaff", "#c4d2f4", "#9eb0dc", "#7a8cbc"] : ["#ffffff", "#f0f6f8", "#d8e8ee", "#b4ccd6"];
    let g = `<path d="M${F(px - w0 * 1.4)},${F(top - k * .3)} L${F(px + w0 * 1.4)},${F(top - k * .3)} L${F(px + w1 * 1.5)},${F(py)} L${F(px - w1 * 1.5)},${F(py)}Z" fill="${T("#2e2a24")}" opacity=".55"/>`;
    g += `<g filter="url(#hhFlow)">`;
    for (let i = 0; i < 90; i++) { const u = r() - .5, xt = px + u * w0 * 2, xb = px + u * w1 * 2 + (r() - .5) * k * .8, bow = k * (.4 + r() * .5);
      g += `<path d="M${F(xt)},${F(top)} C${F(xt + u * k * .6)},${F(top + bow)} ${F(xb)},${F(top + (py - top) * .35)} ${F(xb)},${F(py - k * .6)}" stroke="${WC[Math.floor(r() * WC.length)]}" stroke-width="${F(k * (.12 + r() * .3))}" fill="none" opacity="${F(.3 + r() * .6)}"/>`; }
    g += `</g>`;
    g += `<ellipse cx="${F(px)}" cy="${F(top + k * .2)}" rx="${F(w0 * 1.15)}" ry="${F(k * .35)}" fill="${WC[0]}" opacity=".8"/>`;
    for (let i = 0; i < 46; i++) { const a = r() * Math.PI, R = k * (.4 + r() * 1.1);   // churned foam
      g += `<ellipse cx="${F(px + Math.cos(a) * w1 * 1.6 * r())}" cy="${F(py - k * .3 - Math.sin(a) * k * r() * 1.4)}" rx="${F(R)}" ry="${F(R * .55)}" fill="${WC[Math.floor(r() * 2)]}" opacity="${F(.4 + r() * .5)}"/>`; }
    return g; } });
  // spray drifting off the foot, and foam lines spreading over the pool
  w.sprite({ x: XF, z: ZFW - 2, y: 0, bias: -2, noRefl: true, fn: (px, py, k) => {
    let g = ""; for (let i = 0; i < 9; i++) { const R = k * (4 + r() * 6);
      g += `<ellipse cx="${F(px + (r() - .5) * k * 10)}" cy="${F(py - k * (1 + r() * 4))}" rx="${F(R)}" ry="${F(R * .5)}" fill="url(#hhMist)" opacity="${F(NIGHT ? .3 : .45)}" filter="url(#hhFog)"/>`; }
    return g; } });
  for (let i = 0; i < 26; i++) { const a = -Math.PI * (.1 + r() * .8), R = 3 + r() * 9, x = XF + Math.cos(a) * R * 1.2, z = ZFW + Math.sin(a) * R;
    w.sprite({ x, z, y: 0, bias: -.5, noRefl: true, fn: (px, py, k) => `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(k * (1 + r() * 2.5))}" ry="${F(Math.max(.6, k * .12))}" fill="${NIGHT ? "#a8b6dc" : "#eef4f4"}" opacity="${F(.25 + r() * .35)}"/>` }); }
  used.push([XF, ZF - 8, 12]);

  /* ---------- a mossy fallen log across the creek, and the railed trail on the right ledge ---------- */
  { const zL = 104, x0 = xc(zL) - cw(zL) - 3.5, x1 = xc(zL) + cw(zL) + 4, z0 = zL - 2.5, z1 = zL + 3.5, R = .45, n = 8, faces = [];
    const y0 = Math.max(.2, hT(x0, z0)) + R * .6, y1 = Math.max(.2, hT(x1, z1)) + R * .6;
    const ring = (x, y, z) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [x, y + Math.sin(a) * R, z + Math.cos(a) * R]; });
    const A = ring(x0, y0, z0), B = ring(x1, y1, z1);
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push({ P: [A[i], A[j], B[j], B[i]], c: Math.sin((i + .5) / n * Math.PI * 2) > .4 ? "#5e7034" : "#5a4636" }); }
    faces.push({ P: A, c: "#b0926a" }); w.add(faces, { center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });
    used.push([(x0 + x1) / 2, zL, 6]); }
  { const pts = []; for (let z = 66; z <= 158; z += 2.4) { const x = ax(z) + hw(z) - 2.6; pts.push([x, hT(x, z), z]); }
    const POST = NIGHT ? "#4a3a30" : "#7a5a3c";
    pts.forEach(([x, g, z], i) => { if (g < 1) return; w.line([[x, g, z], [x, g + 1.05, z]], POST, .12, { min: .8 });
      if (i) { const [xp, gp, zp] = pts[i - 1]; if (gp < 1) return; w.line([[xp, gp + 1, zp], [x, g + 1, z]], POST, .08, { min: .7 }); w.line([[xp, gp + .55, zp], [x, g + .55, z]], POST, .06, { min: .6 }); } }); }

  /* ---------- trees: the rim crowded with hardwood in colour and hemlock ---------- */
  for (let k = 0, n = 0; k < 60000 && n < 5200; k++) { const z = 120 + Math.pow(r(), 1.4) * 900, x = (r() - .5) * 1.5 * z;
    const { e } = geo(x, z); if (e > -4) continue;
    const rv = Math.abs(x - XF - 2 * N1(z / 40, 6)); if (z > ZF - 10 && rv < 17) continue;          // the creek's notch stays open
    const y0 = hT(x, z); if (y0 < 10 || !seen(x, z, y0)) continue;
    const hem = r() < .3, hM = (hem ? 16 : 13) + r() * 9, topS = sy(y0 + hM, z);
    if (!okTop(x, z, topS)) continue; n++;
    if (hem) { w.sprite({ x, z, y: y0 - .3, fn: (px, py, kk, fog) => hM * kk > 40 ? hemlock(px, py, hM * kk, fog) : clump(px, py, Math.min(70, hM * kk * .45), fog, HEMC.concat(HEMC.slice(3))) }); continue; }
    const bc = woods(x, z).map(v => Math.max(0, Math.min(255, Math.round(v * (.95 + r() * .25))))), base = "#" + bc.map(v => v.toString(16).padStart(2, "0")).join("");
    const OWN = [mix(base, "#140c04", .55), mix(base, "#140c04", .4), mix(base, "#140c04", .25), mix(base, "#140c04", .12), base, mix(base, "#fff0c0", .2), mix(base, "#fff0c0", .34), mix(base, "#fff0c0", .46)];
    const RAMP = r() < .25 ? RAMPS[Math.floor(r() * RAMPS.length)] : OWN;
    w.sprite({ x, z, y: y0 - .3, fn: (px, py, kk, fog) => hM * kk > 46 ? broadleaf(px, py, hM * kk, RAMP, fog, Math.min(140, Math.round(hM * kk * .8))) : clump(px, py, Math.min(70, hM * kk * .5), fog, RAMP) }); }
  // hemlocks and a few young beech and maple on the talus and the gorge floor
  for (let k = 0, n = 0; k < 30000 && n < 170; k++) { const z = 40 + Math.pow(r(), .6) * 150, x = ax(z) + (r() - .5) * 2 * hw(z);
    const { e, tal } = geo(x, z); if (e < .5 || e > tal + 3 + 8 * r() * r()) continue;
    if (Math.abs(x - xc(z)) < cw(z) + 3) continue;
    const y0 = hT(x, z); if (y0 < .4 || !free(x, z, 2.2) || !seen(x, z, y0)) continue;
    const sxx = sx(x, z); if (sxx < -80 || sxx > W + 80) continue;
    const hem = r() < .72, hM = hem ? 9 + r() * 15 : 6 + r() * 7, topS = sy(y0 + hM, z);
    if (!okTop(x, z, topS)) continue;
    if (Math.abs(sxx - sx(XF, ZF)) < 140 && topS < sy(LIP, ZF) + 60) continue;     // keep the falls in view
    used.push([x, z, 2.2]); n++;
    if (hem) w.sprite({ x, z, y: y0 - .2, fn: (px, py, kk, fog) => hemlock(px, py, hM * kk, fog) });
    else { const RAMP = [GOLDR, BEECH, MAPLE][Math.floor(r() * 3)]; w.sprite({ x, z, y: y0 - .2, fn: (px, py, kk, fog) => broadleaf(px, py, hM * kk, RAMP, fog, Math.min(150, Math.round(hM * kk * .7))) }); } }
  // small trees rooted on the ledges of the walls
  for (let k = 0, n = 0; k < 8000 && n < 40; k++) { const z = 70 + r() * 130, x = (r() - .5) * 1.6 * z;
    const { e } = geo(x, z); if (e > -.6 || e < -3) continue;
    const y0 = hT(x, z); if (y0 < 8 || y0 > LIP - 2 || !seen(x, z, y0)) continue;
    const hM = 3 + r() * 4, topS = sy(y0 + hM, z); if (!okTop(x, z, topS) || Math.abs(sx(x, z) - sx(XF, ZF)) < 70) continue; n++;
    const hem = r() < .6; w.sprite({ x, z: z - .8, y: y0 - .2, fn: (px, py, kk, fog) => hem ? hemlock(px, py, hM * kk, fog) : clump(px, py, hM * kk * .55, fog, BEECH) }); }

  /* ---------- slump blocks on the floor and in the creek, ferns, leaves floating on the pool ---------- */
  for (let k = 0, n = 0; k < 6000 && n < 46; k++) { const z = 22 + Math.pow(r(), .7) * 160, x = ax(z) + (r() - .5) * 2 * hw(z);
    const { e } = geo(x, z); if (e < 1) continue;
    const y0 = hT(x, z), R = .6 + Math.pow(r(), 2) * 2.2; if (!free(x, z, R + 1) || sx(x, z) < -100 || sx(x, z) > W + 100) continue;
    if (Math.abs(sx(x, z) - sx(XF, ZF)) < 120 && z > 120) continue;
    used.push([x, z, R]); n++; const hR = .7 + r() * .5, yb = Math.max(-.3, y0 - .3);
    w.sprite({ x, z, y: yb, fn: (px, py, kk, fog) => boulder(px, py, R * kk, fog, hR) }); }
  for (let k = 0; k < 120; k++) { const z = 9 + Math.pow(r(), 1.3) * 60, x = xc(z) + (r() - .5) * 2 * cw(z);
    if (hT(x, z) > -.5) continue; const L = .18 + r() * .2, cc = ["#c8542a", "#e6b03a", "#a8321e", "#de8a2c", "#8a3424"][Math.floor(r() * 5)], rot = r() * 180;
    w.sprite({ x, z, y: 0, bias: -.3, noRefl: true, fn: (px, py, kk) => { const a = Math.max(1.2, L * kk);
      return `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(a)}" ry="${F(a * .32)}" transform="rotate(${F((rot - 90) * .15)} ${F(px)} ${F(py)})" fill="${T(cc)}" opacity=".9"/>`; } }); }
  for (let k = 0, n = 0; k < 4000 && n < 90; k++) { const z = 12 + r() * 90, x = ax(z) + (r() - .5) * 2 * hw(z);   // Christmas ferns, still green
    const { e, tal } = geo(x, z); const y0 = hT(x, z); if (e < 0 || y0 < .5 || e > tal + 10) continue; n++;
    const sz = .55 + r() * .4;
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => { const L = sz * kk; let g = "";
      for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i / 8 - .5) * 2.6, ex = px + Math.cos(a) * L, ey = py + Math.sin(a) * L * .8;
        g += `<path d="M${F(px)},${F(py)} Q${F(px + Math.cos(a) * L * .6)},${F(py + Math.sin(a) * L * .7 - L * .15)} ${F(ex)},${F(ey + L * .15)}" stroke="${T(mix(i % 2 ? "#3e6a34" : "#4e7a3a", HZ, fog))}" stroke-width="${F(Math.max(.8, L * .08))}" fill="none" stroke-linecap="round"/>`; }
      return g; } }); }

  /* ---------- mist over the pool and down the creek ---------- */
  for (let k = 0; k < 26; k++) { const z = 60 + r() * 115, x = xc(z) + (r() - .5) * 18; const wm = 26 + r() * 40, hm = 2 + r() * 2.5, op = (NIGHT ? .22 : .26) * (.5 + r() * .5);
    w.sprite({ x, z, y: .6, bias: -1, noRefl: true, fn: (px, py, kk) => `<ellipse cx="${F(px)}" cy="${F(py - hm * kk * .3)}" rx="${F(wm * kk * .5)}" ry="${F(hm * kk * .5)}" fill="url(#hhMist)" opacity="${F(op)}" filter="url(#hhFog)"/>` }); }

  /* ---------------- assemble: water, the mirrored world, the land, then everything on it ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#hhWater)"/>`;
  s += `<g clip-path="url(#hhCW)"><g opacity="${NIGHT ? .75 : .7}" filter="url(#hhRipple)">${mirrorImg()}${w.draw({ mirror: true, where: notR })}</g></g>`;
  if (NIGHT) s += `<g opacity=".45" filter="url(#hhSoft)"><rect x="${MX - 26}" y="${sy(0, ZF)}" width="52" height="${H}" fill="#c8d4f4"/></g>`;
  s += `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="url(#hhWater)" opacity=".22"/>`;
  for (let k = 0; k < 90; k++) { const y = 460 + Math.pow(r(), .8) * (H - 460), t = (y - 460) / (H - 460);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(14 + r() * 70 * (.4 + t))}" height="${F(1 + t * 1.2)}" rx="1" fill="${NIGHT ? "#7a8ac0" : "#e8f0ec"}" opacity="${F(.05 + r() * .1)}"/>`; }
  s += w.draw({ where: isR });
  s += `<rect x="0" y="330" width="${W}" height="150" fill="url(#hhHaze)" opacity=".18"/>`;
  s += w.draw({ where: notR });

  s += `<rect width="${W}" height="${H}" fill="url(#hhLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#hhPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
