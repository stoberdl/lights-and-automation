/* Mayflower II at Plymouth: a Thanksgiving pool scene. Seen from a boat in
   Plymouth Harbor on a late-November afternoon: the full-rigged replica of the
   1620 ship lies broadside at State Pier, bow to the left, sails furled on the
   yards (spritsail under the bowsprit, fore and main courses and topsails, the
   lateen mizzen), shrouds and ratlines, stays to the bowsprit, the English
   flag at the fore and a long pennant at the main. Her hull: tarred bottom,
   black wales, honey-brown planking, closed gunports, a painted band under the
   rails, the stern gallery windows and the big stern lantern. On the shore to
   the left the granite portico over Plymouth Rock stands on the seawall below
   Cole's Hill; Water Street runs along the waterfront, the town climbs the hill
   behind (clapboard and brick houses, the white steeple of the Church of the
   Pilgrimage, the stone tower of First Parish below Burial Hill) among bare
   elms and maples, bronze oaks holding their last leaves and white pines. The
   shore falls away at both ends to a thin far shore. A lobster boat and a
   sloop lie on moorings in the foreground. Gulls.
   Sun low off the left edge (south-west); cold blue over a pale gold horizon.
   opts.time === "night": a waxing gibbous moon left of the ship, stars, the
   stern lantern and gallery windows lit, pier and Water Street lamps, the
   floodlit portico, lit windows up the hill, light streaks on the water.
   The ship is a painterly elevation in metres placed by world3d() (eye 3.5 m
   on the water, f 2000, horizon 440); land is a raster, the seawall, pier,
   portico, churches, houses and boats are solids, trees are sprites.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), hexRGB() and rgbTone() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                    */
function mayflowerPlymouthHarborArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1620;
  const r = rng(seed), rs = rng(seed + 7), rk = rng(seed + 19), rl = rng(seed + 31), rt = rng(seed + 53), rb = rng(seed + 71);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -240, LY = 300, WY = 440, FL = 2000, EYE = 3.5;
  const T = c => NIGHT ? mix(mix(c, "#707890", .42), "#0a1232", .6) : c;
  const HZ = NIGHT ? "#2a3054" : "#e8dcc4", RIM = NIGHT ? "#b8c8f0" : "#fff0cc", LAMP = "#ffc464";
  const cl = v => Math.max(0, Math.min(.999, v));
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
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
  const MX = 1000, MY = 196;   // the moon (night)

  /* ---------------- sky ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#060a22"/><stop offset=".45" stop-color="#122046"/><stop offset=".82" stop-color="#2a3058"/><stop offset="1" stop-color="#3e3c5e"/>`
    : `<stop offset="0" stop-color="#3a64a0"/><stop offset=".42" stop-color="#7e9ec4"/><stop offset=".8" stop-color="#d4cec0"/><stop offset="1" stop-color="${HZ}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#dfe6ff" stop-opacity=".3"/><stop offset=".3" stop-color="#9aa8d8" stop-opacity=".1"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff0c8" stop-opacity=".95"/><stop offset=".2" stop-color="#ffe2b0" stop-opacity=".45"/><stop offset=".6" stop-color="#f8d8a0" stop-opacity=".1"/><stop offset="1" stop-color="#f8d8a0" stop-opacity="0"/>`;
  let s = `<defs id="mfdefs">
    <linearGradient id="mfSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="mfLight" cx="${NIGHT ? MX : LX}" cy="${NIGHT ? MY : LY}" r="${NIGHT ? 700 : 1500}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="mfHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".65" stop-color="${HZ}" stop-opacity=".7"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="mfWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#363a5c"/><stop offset=".2" stop-color="#1c2650"/><stop offset="1" stop-color="#080e26"/>`
      : `<stop offset="0" stop-color="#c2c4ba"/><stop offset=".16" stop-color="#8a9ca2"/><stop offset=".6" stop-color="#4c6676"/><stop offset="1" stop-color="#2c4454"/>`}</linearGradient>
    <radialGradient id="mfGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="mfFlood"><stop offset="0" stop-color="#fff0d0" stop-opacity=".5"/><stop offset=".5" stop-color="#ffe0b0" stop-opacity=".14"/><stop offset="1" stop-color="#ffe0b0" stop-opacity="0"/></radialGradient>
    <radialGradient id="mfMoonG"><stop offset="0" stop-color="#f4f0e0" stop-opacity=".5"/><stop offset=".3" stop-color="#c8d0f0" stop-opacity=".14"/><stop offset="1" stop-color="#c8d0f0" stop-opacity="0"/></radialGradient>
    <clipPath id="mfCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="mfLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="mfCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="mfRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .11" numOctaves="2" seed="6" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.1"/></filter>
    <filter id="mfPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="mfSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="mfBlur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#mfSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 420; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 400, big = rs() < .07, dm = Math.hypot(x - MX, y - MY);
      if (dm < 60) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.6 : F(.5 + rs() * .55)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F((.25 + rs() * .55) * (1 - y / 460) * Math.min(1, dm / 260))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#mfLight)"/>`;
    // the waxing gibbous moon, lit from the right (the sun is below the western horizon... east of it at this hour)
    s += `<circle cx="${MX}" cy="${MY}" r="150" fill="url(#mfMoonG)"/><circle cx="${MX}" cy="${MY}" r="24" fill="#f2eedc"/>`;
    s += `<path d="M${MX - 3},${MY - 24} A24,24 0 0 0 ${MX - 3},${MY + 24} A15,24 0 0 1 ${MX - 3},${MY - 24}Z" fill="#9aa0b8" opacity=".55"/>`;
    [[-6, -8, 5], [7, 5, 4], [2, -12, 3], [-3, 10, 3.5], [10, -4, 2.5]].forEach(([dx, dy, R]) => s += `<circle cx="${MX + dx}" cy="${MY + dy}" r="${R}" fill="#b8b8b0" opacity=".35"/>`);
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#mfLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#mfSoft)">`;
    for (let k = 0; k < 6; k++) { const a = -.05 + k * .09, L = 1500;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .025) * L)},${F(LY + Math.sin(a - .025) * L)} L${F(LX + Math.cos(a + .025) * L)},${F(LY + Math.sin(a + .025) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a stratocumulus deck breaking up, lit gold underneath ---------------- */
  const cloud = (x, y, w, flat, cls) => {
    let c = `<g class="${cls}"><g filter="url(#mfCloudy)">`;
    const lobes = [];
    const nL = 8 + Math.floor(rs() * 4);
    for (let k = 0; k < nL; k++) { const t = k / (nL - 1); lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * flat * (.6 + rs() * .7), w * (.06 + rs() * .06)]); }
    if (NIGHT) {
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .035)}" fill="#1e2448"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.3)}" ry="${F(R * .45)}" fill="#2c3058"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly - R * .18)}" rx="${F(R * .8)}" ry="${F(R * .16)}" fill="#7a82a8" opacity="${F(.5 * Math.max(.2, 1 - Math.abs(lx - MX) / 900))}"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .04)}" rx="${F(w * .55)}" ry="${F(w * .06)}" fill="#a8acbc"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .3)}" rx="${F(R * 1.15)}" ry="${F(R * .7)}" fill="#bcbcc4"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .8)}" fill="#ecebe6"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .35)}" cy="${F(ly - R * .3)}" rx="${F(R * .55)}" ry="${F(R * .38)}" fill="#fff6e0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .55)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="#f0c890" opacity=".45"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(420, 120, 520, .1, "drift1") + cloud(1880, 84, 640, .08, "drift2") + cloud(2350, 230, 360, .12, "drift3") + cloud(1560, 290, 260, .14, "drift1") + cloud(150, 300, 260, .12, "drift2") + cloud(700, 330, 220, .1, "drift3");
  if (!NIGHT) {   // gulls over the harbor
    s += `<g class="birds" stroke-linecap="round">`;
    [[1620, 300, 1], [1676, 276, .85], [1730, 318, .8], [1560, 336, .7], [820, 360, .7], [760, 330, .6]].forEach(([x, y, k]) => {
      const fl = rs() < .5 ? 1 : -1;
      s += `<path d="M${F(x - 16 * k)},${F(y - 3 * k)} q${F(8 * k)},${F(-9 * k * fl)} ${F(16 * k)},${F(3 * k)} q${F(8 * k)},${F(-9 * k * fl)} ${F(16 * k)},${F(-3 * k)}" stroke="#8a8e98" stroke-width="${F(3 * k)}" fill="none"/>`;
      s += `<path d="M${F(x - 16 * k)},${F(y - 3 * k)} q${F(3 * k)},${F(-4 * k * fl)} ${F(6 * k)},${F(-3 * k * fl)} M${F(x + 16 * k)},${F(y - 3 * k)} q${F(-3 * k)},${F(-4 * k * fl)} ${F(-6 * k)},${F(-3 * k * fl)}" stroke="#2a2a30" stroke-width="${F(2.6 * k)}" fill="none"/>`;
      s += `<ellipse cx="${F(x)}" cy="${F(y + k)}" rx="${F(5 * k)}" ry="${F(2.4 * k)}" fill="#fbfaf6"/>`; });
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ---------------- the water ---------------- */
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#mfWater)"/>`;
  const reflAt = s.length;

  /* ================= the 3D world =================
     Eye 3.5 m above the water, horizon on WY, f 2000. x right, y up, z away; water at y = 0. */
  const w = world3d({ h: EYE, hy: WY, f: FL, fog: HZ, fogK: .00085, rim: RIM, shade: .5, hi: .25, night: NIGHT, lamp: LAMP,
    light: [-.75, .45, -.5], tone: T, shadow: NIGHT ? "#04060e" : "#363048" });
  const N1 = noise2(1621), N2 = noise2(1622), N3 = noise2(1623), RG = hexRGB;
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));

  /* the shore: Water Street along a granite seawall, falling away at both ends of the harbor */
  const zS = x => 208 + .0006 * x * x + (x > 100 ? (x - 100) * 2.2 : 0) + (x < -150 ? (-150 - x) * 2 : 0);
  const COLE = [-72, 48], BUR = [-40, 235];
  const hG = (x, z) => {
    const d = z - zS(x);
    if (d < 0) { const zf = 3700 + 700 * N2(x / 1800, 1.3);   // the far shore across the bay
      return z > zf ? 4 + 22 * (N2(x / 900, 3.1) * .5 + .5) * sm((z - zf) / 1400) : -1; }
    const up = sm((d - 14) / 10);
    return 2.4 + up * (24 * sm((d - 24) / 330)
      + 9 * Math.exp(-(((x - COLE[0]) / 62) ** 2 + ((d - COLE[1]) / 30) ** 2))
      + 9 * Math.exp(-(((x - BUR[0]) / 95) ** 2 + ((d - BUR[1]) / 85) ** 2))
      + 1.4 * N1(x / 60, z / 60) * sm(d / 60));
  };
  const street = (x, d) => (d > 3 && d < 15) || (d > 15 && Math.abs(x - (34 + d * .06)) < 4.2 && d < 330) || (d > 128 && d < 136 && x > -30 && x < 170);
  const coles = (x, d) => x > -140 && x < -18 && d > 15 && d < 105;
  const G1 = RG("#8e8a52"), G2 = RG("#a49a62"), LEAF = RG("#8a6a3e"), ASPH = RG("#6c6a68"), WALK = RG("#a8a49c"), GRAN = RG("#bab2a2"),
        WOOD = RG("#7c6e66"), BRZ = RG("#8a5c38"), PINEC = RG("#3c4a38"), YARD = RG("#8a8658");
  w.raster({ z0: 196, z1: 9000, top: 300, bottom: 480, scale: .6, step: .0018, minStep: .15, amb: .5, fog: HZ, fogK: .00085, tone: rgbTone(T),
    h: hG, col: (x, y, z, n, ao) => {
      const d = z - zS(x), k = N1(x / 9, z / 9) * .5 + N3(x / 30, z / 30) * .5;
      const woods = lerp(lerp(WOOD, BRZ, N3(x / 70, z / 70) * 1.4 + .1), PINEC, N2(x / 90 + 4, z / 90) * 1.6 - .2).map(v => v * (1 + N1(x / 6, z / 6) * .25));
      if (d < 0) return woods;
      if (d < 3) return lerp(GRAN, WALK, k + .3);
      if (street(x, d)) return d > 13 && d < 15 ? WALK : lerp(ASPH, WALK, k * .3);
      let c = coles(x, d) ? lerp(G1, G2, .5 + k) : lerp(YARD, G2, .5 + k * .8);
      c = lerp(c, LEAF, (N3(x / 11 + 3, z / 11) - .15) * 1.4);
      return lerp(c, woods, sm((z - 560) / 360)); } });

  /* the seawall: granite blocks with a coping, under Water Street */
  for (let x = -250; x < 236; x += 5) { const z0 = zS(x), z1 = zS(x + 5);
    if (z0 > 640) continue;
    const dec = [.8, 1.6].map(v => ({ P: [[x, v, z0], [x + 5, v, z1]], c: "#6a6458", ln: .04, min: .3, op: .45 }));
    w.add([{ P: [[x, -.6, z0], [x + 5, -.6, z1], [x + 5, 2.4, z1], [x, 2.4, z0]], c: (x / 5) % 3 ? "#a29a8a" : "#b0a898", wet: true, seam: true, dec },
           { P: [[x, -.05, z0], [x + 5, -.05, z1], [x + 5, .8, z1], [x, .8, z0]], c: "#3e3c2c", seam: true, wet: true, op: .55 }], { center: [x, 1, z0 + 20] }); }

  /* Plymouth Rock's granite portico on the seawall below Cole's Hill (a Roman Doric canopy, 1921) */
  { const px = -70, pz = zS(-70) + 4, GRT = "#d2c8b2", y0 = 2.4;
    w.box({ x: px, z: pz - 4.6, y: -.6, w: 7, d: .6, h: 2.9, c: "#3a3630", noRefl: false });          // the opening down to the rock
    w.box({ x: px, z: pz, y: y0, w: 14.5, d: 10.5, h: .9, c: "#c4baa4", top: "#b8ae98" });
    w.box({ x: px, z: pz + .4, y: y0 + .9, w: 12, d: 8, h: 7, c: "#4a453e" });                   // shadow inside the colonnade
    [-5.6, -1.9, 1.9, 5.6].forEach(u => [-4.3, 4.3].forEach(v => w.cyl({ x: px + u, z: pz + v, y: y0 + .9, r0: .5, r1: .42, h: 7, n: 12, c: GRT })));
    [-1.45, 1.45].forEach(v => [-5.6, 5.6].forEach(u => w.cyl({ x: px + u, z: pz + v, y: y0 + .9, r0: .5, r1: .42, h: 7, n: 12, c: GRT })));
    w.box({ x: px, z: pz, y: y0 + 7.9, w: 13.4, d: 9.6, h: 1.5, c: GRT, top: "#c8bea8", dec: (fc, P) => {
      fc[0].dec = [{ P: [P([-6.7, .55, -4.86]), P([6.7, .55, -4.86])], c: "#8a826e", ln: .06, min: .4, op: .6 },
        ...Array.from({ length: 12 }, (_, i) => { const u = -6.1 + i * 1.1; return { P: [P([u - .16, .7, -4.86]), P([u + .16, .7, -4.86]), P([u + .16, 1.25, -4.86]), P([u - .16, 1.25, -4.86])], c: "#a89e88" }; })]; } });
    w.box({ x: px, z: pz, y: y0 + 9.4, w: 14, d: 10.2, h: .5, c: "#ddd4c0" });
    w.box({ x: px, z: pz, y: y0 + 9.9, w: 12.6, d: 8.8, h: 1.1, c: GRT, top: "#b4aa96" });
    if (NIGHT) w.sprite({ x: px, z: pz - 7, y: y0 + 4, bias: -6, noRefl: true, fn: (sx, sy, k) => `<ellipse cx="${F(sx)}" cy="${F(sy)}" rx="${F(k * 11)}" ry="${F(k * 7)}" fill="url(#mfFlood)" style="mix-blend-mode:screen"/>` }); }

  /* State Pier, behind the ship: concrete deck on timber fenders, a railing, a ticket shed, lamps */
  { const pz = 166, pw = 96, pd = 20;
    w.box({ x: 2, z: pz, y: -.8, w: pw, d: pd, h: 3.4, c: "#a29c8e", top: "#8e887c", wet: true, dec: (fc, P) => {
      fc[0].dec = Array.from({ length: 38 }, (_, i) => { const u = -pw / 2 + 1.2 + i * (pw - 2.4) / 37; return { P: [P([u - .18, 0, -pd / 2 - .08]), P([u + .18, 0, -pd / 2 - .08]), P([u + .18, 3.3, -pd / 2 - .08]), P([u - .18, 3.3, -pd / 2 - .08])], c: "#5a4a38" }; }); } });
    w.line([[-46, 3.6, pz - 9.6], [50, 3.6, pz - 9.6]], "#3a3a3a", .06, { min: .5 });
    for (let x = -46; x <= 50; x += 3) w.line([[x, 2.6, pz - 9.6], [x, 3.6, pz - 9.6]], "#3a3a3a", .05, { min: .4 });
    w.house({ x: 30, z: pz + 2, y: 2.6, w: 7, d: 4.5, h: 2.8, rh: 1.6, wall: "#8a8e8a", roof: "#4a4a4e", trim: "#ece6d6", rng: rl, door: .3, winGap: 2.4 });
    [-40, -24, 22, 42].forEach(x => { w.line([[x, 2.6, pz - 9], [x, 7.2, pz - 9]], "#2a2c2e", .14, { min: .6 });
      w.sprite({ x, z: pz - 9.2, y: 7.3, bias: -.5, fn: (sx, sy, k) => NIGHT ? `<circle cx="${F(sx)}" cy="${F(sy)}" r="${F(k * 5)}" fill="url(#mfGlow)" opacity=".85"/><circle cx="${F(sx)}" cy="${F(sy)}" r="${F(k * .4)}" fill="#fff4d0"/>` : `<rect x="${F(sx - k * .3)}" y="${F(sy - k * .3)}" width="${F(k * .6)}" height="${F(k * .5)}" fill="${T("#e8e2d0")}"/>` }); }); }

  /* Water Street lamps */
  const lamps = [];
  for (let x = -236; x < 200; x += 21) { const z = zS(x) + 4.5; if (z > 520 || Math.abs(x + 70) < 10) continue;
    lamps.push([x, z]);
    w.line([[x, 2.4, z], [x, 6.4, z]], "#24282a", .13, { min: .5 });
    w.sprite({ x, z: z - .2, y: 6.5, bias: -.5, fn: (sx, sy, k) => NIGHT ? `<circle cx="${F(sx)}" cy="${F(sy)}" r="${F(k * 4.5)}" fill="url(#mfGlow)" opacity=".8"/><circle cx="${F(sx)}" cy="${F(sy)}" r="${F(Math.max(1, k * .35))}" fill="#fff4d0"/>` : `<circle cx="${F(sx)}" cy="${F(sy)}" r="${F(Math.max(.8, k * .3))}" fill="${T("#efe8d8")}"/>` }); }

  /* buildings: a row of shopfronts on Water Street, then houses up the hill, the two churches */
  const onGround = (x, z, wd, dp) => { const hs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => hG(x + a * wd / 2, z + b * dp / 2)); const top = Math.max(...hs);
    return { y: top, fy: Math.min(...hs) - top - .4 }; };
  const lots = [];
  const BRICK = ["#9a4a36", "#8a3e30", "#a85a42"], CLAP = ["#f2ece0", "#e8e0cc", "#6a8098", "#a8aaa4", "#c8b89a", "#4a5a6a", "#e4d8b0", "#8a9a88"];
  for (let x = 4; x < 150; ) { const wd = 9 + rb() * 6, z = zS(x + wd / 2) + 22, dp = 10 + rb() * 4, brick = rb() < .5;
    const g = onGround(x + wd / 2, z, wd, dp), ht = 6.5 + rb() * 4;
    w.house({ x: x + wd / 2, z, ...g, yaw: Math.atan(.0012 * (x + wd / 2) + (x > 100 ? 2.2 : 0)) * 180 / Math.PI * .6, w: wd, d: dp, h: ht, rh: brick ? .9 : 3.2, roof3: brick ? "shed" : "gable",
      wall: brick ? BRICK[Math.floor(rb() * 3)] : CLAP[Math.floor(rb() * CLAP.length)], roof: brick ? "#3a3a3c" : "#3e4048", trim: "#efe8d6", rng: rl, door: .5, winGap: 2.2 + rb() * .6, clap: !brick });
    lots.push([x + wd / 2, z, 9]); x += wd + .6 + rb() * 2; }
  // Church of the Pilgrimage: white meeting house with a tower and spire, gable to the harbor
  { const cx = -78, cz = 418, g = onGround(cx, cz, 15, 26);
    w.house({ x: cx, z: cz, ...g, w: 15, d: 26, h: 9, rh: 6, gable: true, wall: "#f2efe6", roof: "#4a4a50", trim: "#ffffff", rng: rl, winTall: 1.5, winGap: 3, door: false, chim: undefined });
    const ty = g.y, tz = cz - 13 - 2.6;
    w.box({ x: cx, z: tz, y: ty + g.fy, w: 5.4, d: 5.4, h: 15 - g.fy, c: "#f2efe6", top: "#e6e2d8", dec: (fc, P) => {
      fc[0].dec = [{ P: [P([-1.1, 1 - g.fy, -2.76]), P([1.1, 1 - g.fy, -2.76]), P([1.1, 3.6 - g.fy, -2.76]), P([-1.1, 3.6 - g.fy, -2.76])], c: "#5a3a2a" },
        { P: [P([-.7, 8 - g.fy, -2.76]), P([.7, 8 - g.fy, -2.76]), P([.7, 10 - g.fy, -2.76]), P([-.7, 10 - g.fy, -2.76])], c: NIGHT ? LAMP : "#3e5266", glow: NIGHT }]; } });
    w.box({ x: cx, z: tz, y: ty + 15, w: 4.2, d: 4.2, h: 4.4, c: "#f4f1e8", dec: (fc, P) => { fc[0].dec = [{ P: [P([-1.1, .8, -2.16]), P([1.1, .8, -2.16]), P([1.1, 3.6, -2.16]), P([-1.1, 3.6, -2.16])], c: "#3a3a40" }]; } });
    w.box({ x: cx, z: tz, y: ty + 19.4, w: 4.8, d: 4.8, h: .5, c: "#ffffff" });
    w.cyl({ x: cx, z: tz, y: ty + 19.9, r0: 1.9, r1: 0, h: 15, n: 8, c: "#f4f1e8", rot: Math.PI / 8 });
    w.line([[cx, ty + 34.9, tz], [cx, ty + 36.4, tz]], "#c8a040", .1, { min: .6 });
    lots.push([cx, cz, 16], [cx, tz, 6]); }
  // First Parish: fieldstone church with a square crenellated tower, under Burial Hill
  { const cx = -128, cz = 468, g = onGround(cx, cz, 16, 28), ST = "#8e887a";
    w.house({ x: cx, z: cz, ...g, w: 16, d: 28, h: 10, rh: 7, gable: true, wall: ST, roof: "#3e3e44", trim: "#b8b2a4", rng: rl, clap: false, winTall: 1.8, winGap: 3.4, door: false });
    const tz = cz - 14 - 3.2;
    w.box({ x: cx + 3, z: tz, y: g.y + g.fy, w: 6.4, d: 6.4, h: 24 - g.fy, c: ST, top: "#7a7468", dec: (fc, P) => {
      fc[0].dec = [...[3, 6, 9, 12, 15, 18, 21].map(v => ({ P: [P([-3.2, v - g.fy, -3.26]), P([3.2, v - g.fy, -3.26])], c: "#6a6458", ln: .05, min: .3, op: .45 })),
        { P: [P([-1.2, 1 - g.fy, -3.26]), P([1.2, 1 - g.fy, -3.26]), P([1.2, 4.4 - g.fy, -3.26]), P([-1.2, 4.4 - g.fy, -3.26])], c: "#3a2a22" },
        { P: [P([-.9, 17 - g.fy, -3.26]), P([.9, 17 - g.fy, -3.26]), P([.9, 20.6 - g.fy, -3.26]), P([-.9, 20.6 - g.fy, -3.26])], c: "#2e2c30" }]; } });
    [[-2.6, -2.6], [0, -2.6], [2.6, -2.6], [-2.6, 2.6], [2.6, 2.6], [-2.6, 0], [2.6, 0]].forEach(([a, b]) => w.box({ x: cx + 3 + a, z: tz + b, y: g.y + 24, w: 1.2, d: 1.2, h: 1.3, c: ST }));
    lots.push([cx, cz, 17], [cx + 3, tz, 6]); }
  // houses up the hill
  for (let i = 0; i < 2600 && lots.length < 74; i++) {
    const x = -250 + rb() * 470, d = 34 + Math.pow(rb(), 1.15) * 400, z = zS(x) + d;
    if (z > 640 || coles(x, d + 6) || street(x, d) || street(x, d - 6) || street(x, d + 6)) continue;
    if (Math.abs(x) < 24 && d < 70) continue;                                // behind the hull, keep it light
    const dens = x > -20 && x < 170 ? .9 : .45;
    if (rb() > dens) continue;
    if (lots.some(([a, b, R]) => Math.hypot(x - a, z - b) < R + 9)) continue;
    const spec = w.randomHouse(rb, { x, z, y: 0, fy: 0, rng: rl, kind: rb() < .15 ? "grand" : "village", yaw: (rb() - .5) * 24 + (rb() < .3 ? 90 : 0) });
    spec.wall = CLAP[Math.floor(rb() * CLAP.length)];
    const g = onGround(x, z, spec.w + 1, spec.d + 1);
    w.house({ ...spec, ...g });
    lots.push([x, z, Math.max(spec.w, spec.d) * .55]); }

  /* trees: bare elms and maples, bronze oaks holding their last leaves, white pines */
  const fogC = (c, fog) => T(mix(c, HZ, fog * .85));
  const LDIR = [-.8, -.6];
  const TWIG = ["#3e3430", "#4e4240", "#5e5250", "#6e6060", "#7e7070", "#8e8080", "#a09090"];
  const BRONZE = ["#3a2010", "#542e16", "#6e3e1c", "#8a5226", "#a46a32", "#bc8442", "#d0a058"];
  const PINE = ["#18241a", "#223020", "#2c3c28", "#384a30", "#46583a", "#5a6c46"];
  const bare = (x, y, hp, fog, rr) => { const tc = fogC("#4a3e3a", fog), lt = fogC(NIGHT ? "#5a6280" : "#a8927e", fog);
    let g = `<ellipse cx="${F(x + hp * .12)}" cy="${F(y + 1)}" rx="${F(hp * .3)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".16"/>`;
    // the fine twig mass first, as a soft purple-grey haze, then the limbs over it
    const nH = Math.max(2, Math.min(9, Math.round(hp / 8)));
    for (let i = 0; i < nH; i++) { const a = rr() * Math.PI * 2, q = Math.sqrt(rr()) * .55;
      g += `<path d="${blobP(x + Math.cos(a) * q * hp * .32, y - hp * .64 + Math.sin(a) * q * hp * .26, hp * (.16 + rr() * .1), hp * (.14 + rr() * .08), 8, rr)}" fill="${fogC(TWIG[3 + Math.floor(rr() * 4)], fog)}" opacity="${F(.28 + rr() * .2)}"/>`; }
    if (hp > 12) { const tw = Math.max(.8, hp * .03);
      g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .4)},${F(y - hp * .42)} L${F(x + tw * .4)},${F(y - hp * .42)} L${F(x + tw)},${F(y)}Z" fill="${tc}"/>`;
      g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .4)},${F(y - hp * .42)} L${F(x - tw * .05)},${F(y - hp * .42)} L${F(x - tw * .2)},${F(y)}Z" fill="${lt}" opacity=".6"/>`;
      const br = (bx, by, a, L, wd, dpt) => { if (dpt > 4 || L < 1.6) return; const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L, bend = (rr() - .5) * L * .3;
        g += `<path d="M${F(bx)},${F(by)} Q${F((bx + ex) / 2 + bend)},${F((by + ey) / 2)} ${F(ex)},${F(ey)}" stroke="${dpt < 2 && Math.cos(a) < -.1 ? lt : tc}" stroke-width="${F(Math.max(.45, wd))}" fill="none" stroke-linecap="round"/>`;
        br(ex, ey, a - .32 - rr() * .3, L * .7, wd * .62, dpt + 1); br(ex, ey, a + .28 + rr() * .3, L * .66, wd * .6, dpt + 1);
        if (dpt < 2 && rr() < .5) br(ex, ey, a + (rr() - .5) * .2, L * .55, wd * .5, dpt + 2); };
      const nL = 3 + Math.floor(rr() * 2);
      for (let k = 0; k < nL; k++) br(x, y - hp * (.36 + k * .07), -Math.PI / 2 + (k - (nL - 1) / 2) * .5 + (rr() - .5) * .3, hp * (.26 + rr() * .06), tw * .75, 0); }
    else g += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - hp * .55)}" stroke="${tc}" stroke-width="${F(Math.max(.5, hp * .05))}"/>`;
    return g; };
  const oak = (x, y, hp, fog, rr) => { let g = bare(x, y, hp, fog, rr);
    const nT = Math.max(4, Math.min(60, Math.round(hp * 1.1)));
    for (let i = 0; i < nT; i++) { const a = rr() * Math.PI * 2, q = Math.pow(rr(), .6), tx = x + Math.cos(a) * q * hp * .38, ty = y - hp * .62 + Math.sin(a) * q * hp * .3;
      const side = (tx - x) * LDIR[0] + (ty - y + hp * .62) * LDIR[1], R = hp * (.045 + rr() * .05);
      const c = fogC(BRONZE[side > hp * .05 ? 5 + Math.floor(rr() * 2) : side > -hp * .08 ? 3 + Math.floor(rr() * 2) : 1 + Math.floor(rr() * 2)], fog);
      g += `<path d="${blobP(tx, ty, R * (1 + rr() * .6), R * .7, 6, rr)}" fill="${c}" opacity="${F(.75 + rr() * .25)}"/>`; }
    return hp > 18 ? `<g filter="url(#mfLeafy)">${g}</g>` : g; };
  const pine = (x, y, hp, fog, rr) => { const tc = fogC("#3a2c24", fog);
    let g = `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - hp * .95)}" stroke="${tc}" stroke-width="${F(Math.max(.6, hp * .03))}"/>`;
    const tiers = Math.max(3, Math.min(9, Math.round(hp / 5)));
    for (let t = 0; t < tiers; t++) { const v = t / tiers, ty = y - hp * (.2 + v * .76), wd = hp * .3 * (1 - v * .7) * (.75 + rr() * .5), off = (rr() - .5) * wd * .5;
      g += `<path d="${blobP(x + off + wd * .1, ty + hp * .015, wd, hp * .065, 8, rr)}" fill="${fogC(PINE[1], fog)}"/>`;
      g += `<path d="${blobP(x + off - wd * .05, ty, wd * .85, hp * .05, 7, rr)}" fill="${fogC(PINE[3], fog)}"/>`;
      g += `<path d="${blobP(x + off - wd * .4, ty - hp * .02, wd * .45, hp * .035, 6, rr)}" fill="${fogC(PINE[NIGHT ? 4 : 5], fog)}"/>`; }
    return hp > 20 ? `<g filter="url(#mfLeafy)">${g}</g>` : g; };
  const treeFn = (hM, kind, sd) => (px, py, kk, fog) => { const hp = hM * kk, rr = rng(sd);
    return kind === "pine" ? pine(px, py, hp, fog, rr) : kind === "oak" ? oak(px, py, hp, fog, rr) : bare(px, py, hp, fog, rr); };
  const trees = [];
  for (let i = 0; i < 9000 && trees.length < 340; i++) {
    const x = -330 + rt() * 680, d = 12 + Math.pow(rt(), .9) * 560, z = zS(x) + d;
    if (z > 900 || street(x, d) || d < 17) continue;
    const sx = 1280 + FL * x / z; if (sx < -40 || sx > W + 40) continue;
    if (lots.some(([a, b, R]) => Math.hypot(x - a, z - b) < R + 2.5)) continue;
    if (Math.abs(x + 70) < 12 && d < 30) continue;                         // keep the portico clear
    if (trees.some(([a, b]) => Math.hypot(x - a, z - b) < 6.5)) continue;
    const q = rt(), kind = coles(x, d) ? (q < .7 ? "bare" : "oak") : q < .5 ? "bare" : q < .78 ? "oak" : "pine";
    const hM = (kind === "pine" ? 15 : 13) + rt() * 9;
    trees.push([x, z]);
    w.sprite({ x, z, y: hG(x, z) - .3, fn: treeFn(hM, kind, 9000 + i) }); }

  /* ================= Mayflower II: an elevation in metres (u along the hull, bow to the left; v up from the waterline) ================= */
  const SHIPX = -1, SHIPZ = 150;
  const ship = (sx, sy, k, fog) => {
    const P = (u, v) => [sx + u * k, sy - v * k], pl = pts => poly(pts.map(([u, v]) => P(u, v)));
    const C = c => T(mix(c, HZ, fog * .6));
    const ln = (pts, c, wM, op = 1, minW = .6) => `<path d="M${pts.map(([u, v]) => P(u, v).map(F).join(",")).join(" L")}" stroke="${c}" stroke-width="${F(Math.max(minW, wM * k))}" fill="none" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ""}/>`;
    const sag = (a, b, dv, n = 8) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * dv]; });
    const ROPE = C("#2a2018"), ROPEL = C("#5a4a38");
    const MAST = C("#a07a4a"), MASTL = C("#d2aa78"), MASTD = C("#5e4228"), SAIL = C("#e6dcc2"), SAILD = C("#a89a7c"), SAILL = C("#fff6e2");
    let g = "";
    /* masts, tops and yards with furled sails (behind the hull) */
    const masts = [{ u: -9, b: 4, lt: 16.2, top: 24.6, tw: 2.8 }, { u: -1, b: 4, lt: 19, top: 30.6, tw: 3.4 }, { u: 7.4, b: 6.4, lt: 17.6, top: 17.6, tw: 0 }];
    // stays and backstays first, so the masts and yards sit over them
    const stay = (a, b, wM = .07, dv = .15) => g += ln(sag(a, b, dv), ROPE, wM, .9);
    stay([-9, 16.4], [-16.6, 7.6], .09); stay([-9, 24.4], [-23.4, 11.2], .06, .3); stay([-1, 19.2], [-8.4, 6.4], .09);
    stay([-1, 30.4], [-9, 16.8], .06, .2); stay([7.4, 17.4], [-1, 13.2], .06); stay([-1, 29.6], [5, 7.4], .05, .2); stay([-1, 28.6], [8.6, 8.2], .05, .2); stay([-9, 23.6], [-4.4, 4.9], .05, .15);
    masts.forEach(M => {
      const pole = (v0, v1, w0, w1) => { g += `<path d="${pl([[M.u - w0 / 2, v0], [M.u - w1 / 2, v1], [M.u + w1 / 2, v1], [M.u + w0 / 2, v0]])}" fill="${MAST}"/>`;
        g += `<path d="${pl([[M.u - w0 / 2, v0], [M.u - w1 / 2, v1], [M.u - w1 * .1, v1], [M.u - w0 * .1, v0]])}" fill="${MASTL}" opacity=".75"/>`;
        g += `<path d="${pl([[M.u + w0 * .25, v0], [M.u + w1 * .25, v1], [M.u + w1 / 2, v1], [M.u + w0 / 2, v0]])}" fill="${MASTD}" opacity=".6"/>`; };
      pole(M.b, M.lt + 1.6, .62, .44);
      if (M.top > M.lt) { pole(M.lt - .6, M.top, .36, .2); g += `<path d="${pl([[M.u - .3, M.top], [M.u + .3, M.top], [M.u + .25, M.top + .4], [M.u - .25, M.top + .4]])}" fill="${MASTD}"/>`; }
      [M.lt - 3, M.lt - 6, M.lt - 9].forEach(v => v > M.b + 1 && (g += ln([[M.u - .34, v], [M.u + .34, v]], ROPE, .12)));       // woldings
      if (M.tw) { g += `<path d="${pl([[M.u - M.tw / 2, M.lt], [M.u + M.tw / 2, M.lt], [M.u + M.tw / 2 - .3, M.lt - .55], [M.u - M.tw / 2 + .3, M.lt - .55]])}" fill="${MASTD}"/>`;
        g += `<path d="${pl([[M.u - M.tw / 2, M.lt], [M.u + M.tw / 2, M.lt], [M.u + M.tw / 2, M.lt + .7], [M.u - M.tw / 2, M.lt + .7]])}" fill="${MAST}" opacity=".85"/>`;
        for (let u = -M.tw / 2 + .2; u < M.tw / 2; u += .45) g += ln([[M.u + u, M.lt], [M.u + u, M.lt + .7]], MASTD, .06, .8); } });
    const yard = (u0, v0, u1, v1, wM, sailM) => {
      const du = u1 - u0, dv = v1 - v0, L = Math.hypot(du, dv), nx = -dv / L, ny = du / L;
      const Q = (t, o) => [u0 + du * t + nx * o, v0 + dv * t + ny * o];
      g += `<path d="${pl([Q(0, wM * .25), Q(.5, wM * .55), Q(1, wM * .25), Q(1, -wM * .25), Q(.5, -wM * .55), Q(0, -wM * .25)])}" fill="${MASTD}"/>`;
      // the furled sail: a rolled bundle on top of the yard, lit above, shaded below, with gaskets
      const top = [], bot = [];
      for (let i = 0; i <= 12; i++) { const t = .06 + .88 * i / 12, th = sailM * (.35 + .65 * Math.sin(t * Math.PI)) * (.9 + rk() * .2);
        top.push(Q(t, wM * .3 + th)); bot.push(Q(t, wM * .2 - th * .35)); }
      g += `<path d="${pl([...top, ...bot.reverse()])}" fill="${SAIL}"/>`;
      bot.reverse();
      g += `<path d="${pl([...top.map((p, i) => [p[0] * .45 + bot[i][0] * .55, p[1] * .45 + bot[i][1] * .55]), ...bot.slice().reverse()])}" fill="${SAILD}" opacity=".75"/>`;
      g += ln(top.map(([u, v]) => [u - nx * .08, v - ny * .08]), SAILL, .14, .7);
      for (let t = .12; t < .92; t += 1.1 / L) { const a = Q(t, wM * .2 - sailM * .3), b = Q(t + .01, wM * .3 + sailM * (.35 + .65 * Math.sin(t * Math.PI)));
        g += ln([a, b], C("#7a6a50"), .07, .7); }
      // lifts to the masthead are added by the caller; footropes hang under the yard
      g += ln(sag(Q(.08, -wM * .3), Q(.48, -wM * .3), .5, 6), ROPEL, .04, .7) + ln(sag(Q(.52, -wM * .3), Q(.92, -wM * .3), .5, 6), ROPEL, .04, .7); };
    // bowsprit and spritsail yard
    g += `<path d="${pl([[-10.6, 5.5], [-23.8, 11.4], [-23.9, 11.0], [-10.8, 4.9]])}" fill="${MAST}"/><path d="${pl([[-10.6, 5.5], [-23.8, 11.4], [-23.82, 11.3], [-10.7, 5.3]])}" fill="${MASTL}" opacity=".8"/>`;
    g += ln([[-21.4, 10.3], [-21.4, 8.6]], ROPE, .08);
    yard(-25.6, 8.4, -17.2, 8.4, .26, .5);
    // fore and main courses and topsails, the lateen mizzen
    yard(-16.4, 13.2, -1.6, 13.2, .36, .72); yard(-13.8, 21.4, -4.2, 21.4, .26, .55);
    yard(-9.8, 15.8, 7.8, 15.8, .4, .82); yard(-6.6, 26.5, 4.6, 26.5, .28, .6);
    yard(2.6, 9.0, 13.4, 20.6, .26, .5);
    [[-9, 16.2, -16.2, 13.2], [-9, 16.2, -1.8, 13.2], [-9, 24.4, -13.6, 21.4], [-9, 24.4, -4.4, 21.4], [-1, 19, -9.6, 15.8], [-1, 19, 7.6, 15.8], [-1, 30.4, -6.4, 26.5], [-1, 30.4, 4.4, 26.5]].forEach(([a, b, c, d]) => g += ln([[a, b], [c, d]], ROPEL, .04, .7));
    // braces running aft from the yard arms
    [[-1.6, 13.2, 1.8, 18.6], [7.8, 15.8, 12.2, 17.2], [4.6, 26.5, 7.4, 17.4], [-4.2, 21.4, -1.2, 23.6]].forEach(([a, b, c, d]) => g += ln(sag([a, b], [c, d], .2, 6), ROPEL, .04, .6));

    /* the hull */
    const HULLP = [[12.4, 0], [13.8, 2.4], [14.7, 5.2], [15.2, 7.9], [15.5, 8.6], [9.4, 8.3], [9.2, 7.1], [5.6, 6.8], [5.4, 5.3], [-7.6, 4.8], [-7.8, 6.1], [-13.4, 6.6], [-14.4, 6.4], [-14.6, 5.5], [-14.1, 3.6], [-13.1, 1.6], [-11.8, 0]];
    const id = "mfHull" + Math.round(sx);
    const sheer = u => .0048 * (u - .5) * (u - .5);
    const along = (v, c, wM, op = 1, u0 = -15, u1 = 16) => { const pts = []; for (let u = u0; u <= u1; u += 1) pts.push([u, v + sheer(u)]); return ln(pts, c, wM, op, .5); };
    // the beakhead under the bowsprit
    g += `<path d="${pl([[-14.2, 5.4], [-17.8, 4.9], [-18.1, 4.4], [-14.0, 3.5]])}" fill="${C("#5a3a22")}"/><path d="${pl([[-14.2, 5.4], [-17.8, 4.9], [-17.9, 4.7], [-14.2, 5.0]])}" fill="${C("#c8a050")}"/>`;
    g += ln([[-14.3, 6.2], [-17.6, 5.6], [-17.9, 4.9]], C("#3a2a1c"), .1);
    g += `<defs><clipPath id="${id}"><path d="${pl(HULLP)}"/></clipPath></defs>`;
    g += `<path d="${pl(HULLP)}" fill="${C("#7e5030")}"/>`;
    g += `<g clip-path="url(#${id})">`;
    // upper works a little lighter, the tarred bottom at the waterline
    g += `<path d="${pl([[-16, 4.3 + sheer(-16)], ...Array.from({ length: 33 }, (_, i) => [-16 + i, 4.3 + sheer(-16 + i)]), [16, 10], [-16, 10]])}" fill="${C("#946238")}"/>`;
    for (let v = .45; v < 9; v += .32) g += along(v, C("#4a2e1a"), .035, .45);
    g += `<path d="${pl([[-16, -1], [16, -1], [16, .5], [-16, .5]])}" fill="${C("#2e2820")}"/>`;
    g += along(.55, C("#5a5040"), .1, .6);
    // wales (thick black strakes), with a lit top edge
    [[1.5, .32], [2.6, .32], [4.25, .28], [6.2, .2]].forEach(([v, t]) => { g += along(v, C("#1e1610"), t); g += along(v + t * .45, C("#6a5038"), .05, .7); });
    // a painted band under the rails: ochre, red and blue panels
    const band = (u0, u1, vt) => { for (let u = u0; u < u1; u += .8) { const c = ["#c89a3a", "#a83a26", "#c89a3a", "#2e4a6a"][Math.round((u - u0) / .8) % 4];
      g += `<path d="${pl([[u + .06, vt - .12], [u + .74, vt - .12], [u + .74, vt - .55], [u + .06, vt - .55]])}" fill="${C(c)}" opacity=".85"/>`; } };
    band(-13.2, -7.9, 6.5); band(-7.4, 5.3, 4.7); band(5.7, 9.1, 6.7); band(9.5, 15.2, 8.2);
    // closed gunports, outlined in red
    [-5.4, -2.6, .2, 3, 11.8].forEach(u => { const v = u > 10 ? 5.4 : 3.05 + sheer(u);
      g += `<path d="${pl([[u - .42, v - .4], [u + .42, v - .4], [u + .42, v + .4], [u - .42, v + .4]])}" fill="${C("#8a2a1c")}"/><path d="${pl([[u - .32, v - .3], [u + .32, v - .3], [u + .32, v + .3], [u - .32, v + .3]])}" fill="${C("#5a3a22")}"/>`; });
    // the stern quarter: gallery windows, carved panel
    [12.0, 13.0, 14.0].forEach(u => { const lt = NIGHT;
      g += `<path d="${pl([[u - .38, 6.3], [u + .38, 6.3], [u + .38, 7.2], [u - .38, 7.2]])}" fill="${lt ? "#ffcc70" : C("#3a4250")}"/>`;
      g += ln([[u, 6.3], [u, 7.2]], C("#c8a050"), .05) + ln([[u - .38, 6.75], [u + .38, 6.75]], C("#c8a050"), .05); });
    g += `<path d="${pl([[11.4, 7.4], [14.6, 7.4], [14.6, 7.7], [11.4, 7.7]])}" fill="${C("#c8a050")}"/>`;
    // the rudder and the light falling off along the hull (lit toward the bow)
    g += `<path d="${pl([[12.2, -1], [13.4, -1], [14.6, 4], [13.6, 4]])}" fill="${C("#4a3220")}" opacity=".6"/>`;
    g += `<path d="${pl([[-16, -1], [-16, 10], [-10, 10], [-10, -1]])}" fill="${C("#fff0d0")}" opacity="${NIGHT ? .04 : .12}"/>`;
    g += `<path d="${pl([[6, -1], [6, 10], [16, 10], [16, -1]])}" fill="${C("#1a1020")}" opacity=".12"/>`;
    g += `</g>`;
    // rail caps along the top, and the channels with deadeyes for the shrouds
    g += ln([[15.5, 8.6], [9.4, 8.3], [9.2, 7.1], [5.6, 6.8], [5.4, 5.3], [-7.6, 4.8], [-7.8, 6.1], [-13.4, 6.6], [-14.4, 6.4]], C("#c8a050"), .16);
    const chains = [[-11.4, -6.6, 4.95], [-3.8, 1.8, 4.75], [5.8, 9, 6.9]];
    chains.forEach(([a, b, v]) => { g += `<path d="${pl([[a, v], [b, v], [b, v - .3], [a, v - .3]])}" fill="${C("#3a2618")}"/>`; });
    // anchor at the cathead
    { const [ax, ay] = P(-12.8, 4.6), kk = k;
      g += `<path d="M${F(ax)},${F(ay)} l0,${F(kk * 2.6)} M${F(ax - kk * .9)},${F(ay + kk * 2.2)} q${F(kk * .9)},${F(kk * .8)} ${F(kk * 1.8)},0 M${F(ax - kk * .5)},${F(ay + kk * .3)} l${F(kk)},0" stroke="${C("#1e1a18")}" stroke-width="${F(Math.max(1, kk * .18))}" fill="none" stroke-linecap="round"/>`; }
    /* shrouds and ratlines on the near side */
    const shroudSet = (mu, mv, a, b, v, n) => {
      const feet = Array.from({ length: n }, (_, i) => [a + (b - a) * i / (n - 1), v]);
      feet.forEach(([fu, fv]) => { g += ln([[fu, fv], [mu, mv]], ROPE, .07, .95); g += `<circle cx="${F(P(fu, fv + .25)[0])}" cy="${F(P(fu, fv + .25)[1])}" r="${F(Math.max(.6, k * .16))}" fill="${C("#2a1c12")}"/>`; });
      for (let vv = v + .8; vv < mv - .9; vv += .5) { const t = (vv - v) / (mv - v), ua = a + (mu - a) * t, ub = b + (mu - b) * t;
        g += ln([[ua, vv], [ub, vv]], ROPE, .03, .55, .4); } };
    shroudSet(-9, 16, chains[0][0], chains[0][1], 4.95, 6); shroudSet(-1, 18.8, chains[1][0], chains[1][1], 4.75, 7); shroudSet(7.4, 14, chains[2][0], chains[2][1], 6.9, 4);
    [[-9, 24.2, 2.8, 16.3], [-1, 30.2, 3.4, 19.1]].forEach(([mu, mv, tw, lt]) => { [-1, -.5, .5, 1].forEach(f => g += ln([[mu + f * tw / 2, lt + .6], [mu, mv]], ROPE, .04, .85));
      for (let vv = lt + 1.2; vv < mv - 1; vv += .5) { const t = (vv - lt - .6) / (mv - lt - .6); g += ln([[mu - tw / 2 * (1 - t), vv], [mu + tw / 2 * (1 - t), vv]], ROPE, .025, .45, .35); } });
    /* mooring lines back to the pier, sagging */
    g += ln(sag([-13.2, 4.6], [-21, 2.7], .5), C("#d8ccb0"), .07) + ln(sag([-10.5, 4.5], [-16, 2.7], .3), C("#d8ccb0"), .06);
    g += ln(sag([14.8, 6.4], [21.5, 2.7], .6), C("#d8ccb0"), .07) + ln(sag([11, 7.6], [17.5, 2.7], .4), C("#d8ccb0"), .06);
    /* flags: the English flag at the fore, a long pennant at the main, a small one on the lateen yard; stern lantern */
    g += ln([[-9, 24.9], [-9, 27]], MASTD, .08);
    { const fx = -9, fy = 27, fw = 2.6, fh = 1.6, wave = t => Math.sin(t * 5) * .15;
      const fp = Array.from({ length: 9 }, (_, i) => [fx - fw * i / 8, fy + wave(i / 8)]), fb = fp.map(([u, v]) => [u, v - fh]);
      g += `<path d="${pl([...fp, ...fb.reverse()])}" fill="${C("#f2eee4")}"/>`;
      g += `<path d="${pl([[fx - fw * .44, fy + wave(.44)], [fx - fw * .56, fy + wave(.56)], [fx - fw * .56, fy - fh + wave(.56)], [fx - fw * .44, fy - fh + wave(.44)]])}" fill="${C("#b8282a")}"/>`;
      g += `<path d="${pl([[fx, fy - fh * .4], [fx - fw, fy - fh * .4 + wave(1)], [fx - fw, fy - fh * .6 + wave(1)], [fx, fy - fh * .6]])}" fill="${C("#b8282a")}"/>`; }
    g += ln([[-1, 30.9], [-1, 33]], MASTD, .08);
    { const pts = Array.from({ length: 16 }, (_, i) => { const t = i / 15; return [-1 - t * 9, 33 - t * .7 + Math.sin(t * 9) * .3 * t]; });
      g += `<path d="${pl([...pts.map(([u, v], i) => [u, v + .35 * (1 - i / 15)]), ...pts.slice().reverse().map(([u, v], i) => [u, v - .35 * (i / 15)])])}" fill="${C("#b8282a")}"/>`;
      g += ln(pts, C("#f2eee4"), .12, .9); }
    { const lx = 15.9, ly = 9.3;
      g += ln([[15.3, 8.6], [lx, ly - .7]], C("#2a1c12"), .1);
      if (NIGHT) g += `<circle cx="${F(P(lx, ly)[0])}" cy="${F(P(lx, ly)[1])}" r="${F(k * 3.4)}" fill="url(#mfGlow)"/>`;
      g += `<path d="${pl([[lx - .45, ly - .7], [lx + .45, ly - .7], [lx + .55, ly + .5], [lx, ly + 1.1], [lx - .55, ly + .5]])}" fill="${NIGHT ? "#ffd884" : C("#d8c088")}"/>`;
      g += ln([[lx - .45, ly - .7], [lx + .45, ly - .7]], C("#2a1c12"), .1) + ln([[lx, ly - .7], [lx, ly + 1.1]], C("#2a1c12"), .05); }
    if (NIGHT) {   // the pier lamps behind wash the hull's upper works, the gallery glows
      g += `<circle cx="${F(P(13, 6.8)[0])}" cy="${F(P(13, 6.8)[1])}" r="${F(k * 2.4)}" fill="url(#mfGlow)" opacity=".6"/>`; }
    return g; };
  w.sprite({ x: SHIPX, z: SHIPZ, y: 0, fn: ship });

  /* moored boats: a lobster boat on the right, a sloop on the left, mooring balls */
  { const bx = 36, bz = 94, yaw = 24;
    w.box({ x: bx, z: bz, y: -.5, yaw, w: 11.5, d: 3.8, h: 2.0, c: "#f0ece4", wet: true, dec: (fc, P) => {
      fc[0].dec = [{ P: [P([-5.75, .55, -1.96]), P([5.75, .55, -1.96]), P([5.75, .85, -1.96]), P([-5.75, .85, -1.96])], c: "#a8302a" }, { P: [P([-5.75, 1.75, -1.96]), P([5.75, 1.75, -1.96]), P([5.75, 2, -1.96]), P([-5.75, 2, -1.96])], c: "#3a5a7a" }]; } });
    w.add([{ P: [[-5.75, -.5, -1.9], [-8.2, 1.3, 0], [-5.75, -.5, 1.9]].map(p => { const a = yaw * Math.PI / 180; return [bx + p[0] * Math.cos(a) - p[2] * Math.sin(a), p[1] + .5, bz + p[0] * Math.sin(a) + p[2] * Math.cos(a)]; }), c: "#e8e4dc", two: true, wet: true },
           { P: [[-5.75, 1.5, -1.9], [-8.2, 1.5, 0], [-5.75, 1.5, 1.9]].map(p => { const a = yaw * Math.PI / 180; return [bx + p[0] * Math.cos(a) - p[2] * Math.sin(a), p[1], bz + p[0] * Math.sin(a) + p[2] * Math.cos(a)]; }), c: "#d8d2c4", up: true }], { center: [bx - 6, .5, bz] });
    const a = yaw * Math.PI / 180, at = (u, z) => [bx + u * Math.cos(a) - z * Math.sin(a), bz + u * Math.sin(a) + z * Math.cos(a)];
    const [cx1, cz1] = at(-2.2, 0);
    w.box({ x: cx1, z: cz1, yaw, y: 1.5, w: 3.6, d: 3.2, h: 2.1, c: "#f4f0e8", top: "#e4dccc", dec: (fc, P) => {
      fc[0].dec = [-1.3, 0, 1.3].map(u => ({ P: [P([u - .5, 1.1, -1.66]), P([u + .5, 1.1, -1.66]), P([u + .5, 1.8, -1.66]), P([u - .5, 1.8, -1.66])], c: NIGHT ? LAMP : "#2e3a46", glow: NIGHT })); } });
    w.box({ x: cx1, z: cz1, yaw, y: 3.6, w: 4.4, d: 3.8, h: .2, c: "#e8e2d4" });
    const [mx1, mz1] = at(-1.6, 0); w.line([[mx1, 3.8, mz1], [mx1, 6.4, mz1]], "#3a3a3e", .08);
    [[1.6, -.6, "#d8b030"], [2.9, .4, "#3a7a5a"], [2.3, .9, "#d8b030"], [3.9, -.4, "#c84a2a"]].forEach(([u, z, c], i) => { const [tx, tz] = at(u, z);
      w.box({ x: tx, z: tz, yaw: yaw + 4 * i, y: 1.5 + (i === 2 ? .7 : 0), w: 1.1, d: .8, h: .7, c, top: mix(c, "#000000", .2) }); }); }
  { const bx = -40, bz = 120, yaw = -16, a = yaw * Math.PI / 180, at = (u, z) => [bx + u * Math.cos(a) - z * Math.sin(a), bz + u * Math.sin(a) + z * Math.cos(a)];
    w.box({ x: bx, z: bz, y: -.4, yaw, w: 7.5, d: 2.6, h: 1.25, c: "#f2eee6", wet: true, dec: (fc, P) => {
      fc[0].dec = [{ P: [P([-3.75, .9, -1.36]), P([3.75, .9, -1.36]), P([3.75, 1.12, -1.36]), P([-3.75, 1.12, -1.36])], c: "#1e3a62" }]; } });
    const [cx2, cz2] = at(-.6, 0); w.box({ x: cx2, z: cz2, yaw, y: .85, w: 2.4, d: 1.8, h: .7, c: "#ece6da", dec: (fc, P) => { fc[0].dec = [{ P: [P([-.8, .25, -.96]), P([.8, .25, -.96]), P([.8, .5, -.96]), P([-.8, .5, -.96])], c: NIGHT ? LAMP : "#2e3a46", glow: NIGHT }]; } });
    const [mx2, mz2] = at(-1, 0), [bx2, bz2] = at(2.6, 0);
    w.line([[mx2, .9, mz2], [mx2, 11.6, mz2]], "#cfcac0", .1, { min: .8 });
    w.line([[mx2, 2.1, mz2], [bx2, 2.3, bz2]], "#1e3a62", .3, { min: 1.4 });                 // the boom under its blue sail cover
    [-4.1, 3.6].forEach(u => { const [ex, ez] = at(u, 0); w.line([[mx2, 11.4, mz2], [ex, 1, ez]], "#3a3a40", .025, { min: .4 }); });   // forestay, backstay
    if (NIGHT) w.sprite({ x: mx2, z: mz2 - .1, y: 11.7, bias: -.5, fn: (sx, sy, k) => `<circle cx="${F(sx)}" cy="${F(sy)}" r="${F(k * .5)}" fill="url(#mfGlow)" opacity=".7"/><circle cx="${F(sx)}" cy="${F(sy)}" r="${F(Math.max(1.2, k * .08))}" fill="#fff8e0"/>` }); }
  [[-14, 84, "#f2eee8"], [14, 70, "#e8702a"], [70, 140, "#f2eee8"], [-92, 160, "#e8702a"], [-66, 96, "#f2eee8"]].forEach(([x, z, c]) =>
    w.sprite({ x, z, y: 0, fn: (sx, sy, k) => `<ellipse cx="${F(sx)}" cy="${F(sy - k * .25)}" rx="${F(k * .32)}" ry="${F(k * .28)}" fill="${T(c)}"/><ellipse cx="${F(sx - k * .1)}" cy="${F(sy - k * .34)}" rx="${F(k * .12)}" ry="${F(k * .08)}" fill="${T("#ffffff")}" opacity=".6"/>` }));

  /* ---- water: the mirrored world, then chop and the light paths ---- */
  let wtr = `<g opacity="${NIGHT ? .5 : .42}" filter="url(#mfRipple)">${w.draw({ mirror: true })}</g>`;
  wtr += `<rect x="0" y="${WY}" width="${W}" height="14" fill="url(#mfHaze)" opacity=".5"/>`;
  for (let k = 0; k < 240; k++) { const y = WY + 6 + Math.pow(r(), .8) * (H - WY - 6), t = (y - WY) / (H - WY);
    wtr += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(26 + r() * 140 * (.4 + t))}" height="${F(1 + t * 1.6)}" rx="1" fill="${NIGHT ? (r() < .5 ? "#6a78a8" : "#0a1030") : (r() < .55 ? "#e6eef0" : "#28404e")}" opacity="${F(.08 + r() * .14)}"/>`; }
  wtr += `<g filter="url(#mfRipple)">`;
  if (NIGHT) {   // the moon glade, the stern lantern, the pier and street lamps
    const streaks = [[MX, "#e8ecff", .8], [w.proj([SHIPX + 15.9, 9, SHIPZ])[0], "#ffd070", .9], ...[-40, -24, 22, 42].map(x => [w.proj([x, 7, 157])[0], "#ffd890", .5]),
      ...lamps.map(([x, z]) => [w.proj([x, 6, z])[0], "#ffd890", .3])];
    streaks.forEach(([x, c, o]) => {
      for (let y = WY + 4; y < H; y += 3 + (y - WY) * .03) { const t = (y - WY) / (H - WY), Lr = 6 + r() * (20 + t * 60);
        wtr += `<rect x="${F(x + (r() - .5) * (16 + t * 90) - Lr / 2)}" y="${F(y)}" width="${F(Lr)}" height="${F(1.2 + t * 1.8)}" rx="1" fill="${c}" opacity="${F(o * (.7 - t * .45) * (.5 + r() * .5))}"/>`; } });
  } else {       // the low sun's glitter off to the left
    for (let y = WY + 4; y < H; y += 3 + (y - WY) * .025) { const t = (y - WY) / (H - WY), n = 2 + Math.floor(t * 5);
      for (let k = 0; k < n; k++) { const x = r() * 720 * (1 - t * .3), Lr = 8 + r() * (24 + t * 60);
        wtr += `<rect x="${F(x)}" y="${F(y)}" width="${F(Lr)}" height="${F(1.2 + t * 1.6)}" rx="1" fill="#fff4d8" opacity="${F((.55 - x / 1440) * (1 - t * .5))}"/>`; } }
  }
  wtr += `</g>`;
  s = s.slice(0, reflAt) + wtr + s.slice(reflAt);
  s += w.draw();
  s += `<rect x="0" y="${WY - 30}" width="${W}" height="40" fill="url(#mfHaze)" opacity="${NIGHT ? .25 : .35}"/>`;

  /* light + paper */
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#mfLight)" style="mix-blend-mode:soft-light" opacity=".8"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#mfPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
