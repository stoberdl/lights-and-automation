/* New Year's Skyline: a generic city across a wide river. Three hero towers
   in the middle (a stepped deco tower with a spire, a glass tower with a
   slanted crown, a slim needle), layers of hazier towers behind, brownstones
   and bare trees along the far embankment. A suspension bridge strides in
   from the near left and a steel arch bridge from the near right, both hung
   with bunting by day; a little ferry crosses; the city sits in the water.
   Day: a crisp, clear winter afternoon, low sun on the left, ice floes.
   opts.time === "night": midnight. A sky full of layered fireworks (gold,
   magenta, cyan, white) over the towers with drifting smoke, all reflected in
   the river; lit windows, coloured crown lights, pearl lights on the cables.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".     */
function newYearsSkylineArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 101;
  const r = rng(seed), rs = rng(seed + 7), rw = rng(seed + 13);   // land, sky, windows
  const W = 2560, H = 720, F = v => (+v).toFixed(1), CX = 1280, WY = 492;   // WY: far waterline
  const LX = NIGHT ? 1280 : 820, LY = NIGHT ? 200 : 150;
  const HZ = NIGHT ? "#2a2456" : "#dfe6ee";
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
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
  const line = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L");
  const FW = ["#ffd060", "#ff4ac0", "#40e8ff", "#ffffff", "#ff6a4a", "#7aff9a", "#b07aff"];
  const halo = (id, c, a = .9) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${a}"/><stop offset=".35" stop-color="${c}" stop-opacity="${a * .3}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;

  /* ---------------------------------------------------------------- sky */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#02041a"/><stop offset=".4" stop-color="#0a0f36"/><stop offset=".78" stop-color="#1e1c4e"/><stop offset="1" stop-color="#3a2a5e"/>`
    : `<stop offset="0" stop-color="#2f6fc0"/><stop offset=".42" stop-color="#78aee0"/><stop offset=".78" stop-color="#cfe0ee"/><stop offset="1" stop-color="#f3e6d2"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#ff9ad8" stop-opacity=".22"/><stop offset=".3" stop-color="#8a6ad8" stop-opacity=".1"/><stop offset="1" stop-color="#6a5ac0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6dc" stop-opacity=".9"/><stop offset=".16" stop-color="#ffefc8" stop-opacity=".45"/><stop offset=".55" stop-color="#ffe4b0" stop-opacity=".1"/><stop offset="1" stop-color="#ffe4b0" stop-opacity="0"/>`;
  let s = `<defs id="nydefs">
    <linearGradient id="nySky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="nyLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 1000 : 800}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="nyHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".65" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="nyWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#2a2050"/><stop offset=".3" stop-color="#121434"/><stop offset="1" stop-color="#060a1e"/>`
      : `<stop offset="0" stop-color="#9ab8d4"/><stop offset=".3" stop-color="#5a82a8"/><stop offset="1" stop-color="#2a4a6a"/>`}</linearGradient>
    <linearGradient id="nyGlass" x1="0" y1="0" x2="1" y2="1">${NIGHT
      ? `<stop offset="0" stop-color="#1a2a4e"/><stop offset="1" stop-color="#0c1430"/>`
      : `<stop offset="0" stop-color="#c8e0f4"/><stop offset=".45" stop-color="#7aa6d0"/><stop offset=".55" stop-color="#5a86b4"/><stop offset="1" stop-color="#3a6090"/>`}</linearGradient>
    <linearGradient id="nyGlassS" x1="0" y1="0" x2="1" y2="1">${NIGHT
      ? `<stop offset="0" stop-color="#121c3a"/><stop offset="1" stop-color="#080e24"/>`
      : `<stop offset="0" stop-color="#5a7ea6"/><stop offset="1" stop-color="#2c4a70"/>`}</linearGradient>
    <linearGradient id="nyTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="${NIGHT ? .04 : .22}"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
    <pattern id="nyWin" width="9" height="11" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="5" height="6" fill="${NIGHT ? "#0a0e22" : "#2a3c5a"}" opacity="${NIGHT ? .7 : .35}"/></pattern>
    <pattern id="nyWinS" width="6" height="11" patternUnits="userSpaceOnUse"><rect x="1" y="2" width="3.5" height="6" fill="${NIGHT ? "#0a0e22" : "#1a2840"}" opacity="${NIGHT ? .6 : .3}"/></pattern>
    <pattern id="nyBand" width="4" height="7" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="1.2" fill="${NIGHT ? "#000" : "#2a3c5a"}" opacity=".25"/></pattern>
    ${halo("nyGlow", "#ffc870", .8)}${FW.map((c, i) => halo("nyF" + i, c, .55)).join("")}
    <clipPath id="nyWaterClip"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="nyLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="nyCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="32" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="nyRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .1" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.3"/></filter>
    <filter id="nyPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="nySoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="nyBlur"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="nyBlur2"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="nySmoke" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="9"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#nySky)"/>`;

  /* fireworks: kept in a string so the river can reflect them too */
  let fw = "";
  if (NIGHT) {
    for (let i = 0; i < 320; i++) { const x = rs() * W, y = Math.pow(rs(), 1.6) * 300;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${rs() < .06 ? 1.5 : F(.5 + rs() * .6)}" fill="#e8eeff" opacity="${F(.15 + rs() * .5 * (1 - y / 340))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#nyLight)"/>`;
    const burst = (cx, cy, R, ci, kind, dim = 1, ci2 = ci) => {
      const c = FW[ci], c2 = FW[ci2]; let g = `<circle cx="${cx}" cy="${cy}" r="${F(R * 1.6)}" fill="url(#nyF${ci})" opacity="${F(.75 * dim)}"/>`;
      const n = kind === "ring" ? 40 : kind === "willow" ? 46 : Math.round(56 + rs() * 34), droopK = kind === "willow" ? .7 : kind === "ring" ? .08 : .2;
      for (let i = 0; i < n; i++) {
        const a = i / n * 6.283 + (rs() - .5) * .12, L = R * (kind === "ring" ? .96 + rs() * .06 : .62 + rs() * .42), r0 = R * .1;
        const end = [cx + Math.cos(a) * L, cy + Math.sin(a) * L + R * droopK * (L / R) ** 2], mid = [cx + Math.cos(a) * L * .62, cy + Math.sin(a) * L * .62];
        const P = t => { const u = 1 - t, s0 = [cx + Math.cos(a) * r0, cy + Math.sin(a) * r0]; return [u * u * s0[0] + 2 * u * t * mid[0] + t * t * end[0], u * u * s0[1] + 2 * u * t * mid[1] + t * t * end[1]]; };
        const s0 = P(0), p6 = P(.62), cc = i % 3 === 0 ? c2 : c;
        g += `<path d="M${F(s0[0])},${F(s0[1])} Q${F(mid[0])},${F(mid[1])} ${F(end[0])},${F(end[1])}" stroke="${cc}" stroke-width="${kind === "willow" ? 1.4 : 1.1}" fill="none" opacity="${F((kind === "willow" ? .5 : .3) * dim)}"/>`;
        g += `<path d="M${F(p6[0])},${F(p6[1])} Q${F((p6[0] + end[0]) / 2)},${F((p6[1] + end[1]) / 2 - 1)} ${F(end[0])},${F(end[1])}" stroke="${mix(cc, "#ffffff", .25)}" stroke-width="2" fill="none" stroke-linecap="round" opacity="${F(.85 * dim)}"/>`;
        g += `<circle cx="${F(end[0])}" cy="${F(end[1])}" r="${F(1.4 + rs() * 1.3)}" fill="${mix(cc, "#ffffff", .55)}" opacity="${F(dim)}"/>`;
        if (kind === "willow" || rs() < .25) for (let k = 0; k < 3; k++) { const q = P(.3 + rs() * .65); g += `<circle cx="${F(q[0] + (rs() - .5) * 6)}" cy="${F(q[1] + rs() * 6)}" r="${F(.6 + rs() * .8)}" fill="${mix(cc, "#ffffff", .6)}" opacity="${F(.7 * dim)}"/>`; }
      }
      g += `<circle cx="${cx}" cy="${cy}" r="${F(R * .12)}" fill="#ffffff" opacity="${F(.35 * dim)}" filter="url(#nyBlur2)"/>`;
      return g;
    };
    const trail = (x0, y0, x1, y1, ci) => { let d = `M${x0},${y0}`; for (let t = .1; t <= 1.001; t += .1) d += ` L${F(x0 + (x1 - x0) * t + Math.sin(t * 9) * 3)},${F(y0 + (y1 - y0) * t)}`;
      return `<path d="${d}" stroke="${mix(FW[ci], "#ffffff", .5)}" stroke-width="1.6" fill="none" opacity=".45" stroke-dasharray="6 5"/>`; };
    // smoke drifting from older bursts, lit from inside
    fw += `<g filter="url(#nySmoke)" opacity=".5">${[[1080, 240, 220, 70, "#6a4a7a"], [1450, 200, 260, 60, "#4a5a8a"], [1280, 330, 300, 50, "#7a5a6a"], [820, 300, 160, 40, "#4a4a6a"], [1760, 300, 200, 50, "#5a4a7a"]].map(([x, y, rx, ry, c]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`).join("")}</g>`;
    // back layer: bigger, dimmer, older
    fw += burst(1180, 150, 168, 1, "peony", .55, 3) + burst(1520, 128, 140, 2, "peony", .5) + burst(880, 230, 100, 0, "willow", .45);
    // main layer
    fw += burst(1090, 200, 132, 0, "peony", 1, 3) + burst(1400, 150, 124, 1, "peony", 1, 2) + burst(1640, 240, 104, 2, "ring", .95, 3) + burst(1280, 290, 96, 0, "willow", .9);
    fw += burst(960, 330, 64, 2, "peony", .9, 3) + burst(1500, 320, 70, 6, "peony", .9) + burst(1200, 370, 48, 4, "peony", .85, 0) + burst(1820, 330, 58, 0, "peony", .7) + burst(720, 330, 50, 1, "ring", .6) + burst(2060, 350, 40, 5, "peony", .5) + burst(480, 360, 36, 2, "peony", .45);
    fw += trail(1340, 470, 1360, 400, 0) + trail(1560, 470, 1548, 420, 2) + trail(1030, 470, 1050, 410, 1);
    s += fw;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#nyLight)"/><circle cx="${LX}" cy="${LY}" r="40" fill="#fffbe8"/>`;
    s += `<g opacity=".1" filter="url(#nySoft)">`;
    for (let k = 0; k < 7; k++) { const a = .45 + k * .3, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: a few crisp cumulus by day, thin lit strata by night */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#nyCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#120e30"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#1e1a44"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .2)}" rx="${F(R * .9)}" ry="${F(R * .14)}" fill="#6a3a7a" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .14 * (.6 + rs() * .7), w * (.09 + rs() * .07)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .07)}" fill="#b4c4da"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#c8d4e4"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .85)}" fill="#f6f8fb"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .35)}" rx="${F(R * .6)}" ry="${F(R * .4)}" fill="#ffffff"/>`);
    }
    return c + `</g></g>`;
  };
  s += NIGHT ? cloud(380, 120, 600, "drift1") + cloud(2200, 100, 640, "drift2") + cloud(2000, 230, 360, "drift3")
             : cloud(430, 170, 420, "drift1") + cloud(1980, 120, 460, "drift2") + cloud(2350, 250, 260, "drift3") + cloud(180, 270, 220, "drift2");
  if (!NIGHT) {
    s += `<g class="birds" fill="none" stroke="#3a4050" stroke-width="2" stroke-linecap="round" opacity=".7">`;
    [[1720, 300, 1], [1748, 288, .8], [1770, 306, .9], [640, 330, .8]].forEach(([x, y, k]) =>
      s += `<path d="M${x - 9 * k},${y - 3 * k} q${5 * k},${-4 * k} ${9 * k},${3 * k} q${4 * k},${-7 * k} ${9 * k},${-3 * k}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* --------------------------------------------------------------- land */
  const FAC = ["#d8c8b0", "#a8b0bc", "#b07a60", "#e8e6e0", "#c4a888", "#8a96a8", "#c8b8a0", "#9aa4ac"];
  const NFAC = ["#1a1c38", "#22203a", "#1c2440", "#262238", "#181a30"];
  const LITW = ["#ffd68a", "#ffe8b0", "#fff4d8", "#cfe4ff", "#ffc870"];
  /* a tower block: front face, side face toward the middle of the view, windows, roof details */
  const tower = (x, yb, w, h, o = {}) => {
    const hz = o.hz || 0, cx = x + w / 2, sr = cx < CX, sw = Math.max(3, Math.min(26, Math.abs(cx - CX) / CX * (o.depth || 40)));
    const Hc = c => mix(c, HZ, hz);
    const glass = o.glass, base = NIGHT ? NFAC[Math.floor(r() * NFAC.length)] : FAC[Math.floor(r() * FAC.length)];
    const front = glass ? "url(#nyGlass)" : Hc(base), side = glass ? "url(#nyGlassS)" : Hc(NIGHT ? mix(base, "#000", .35) : sr ? mix(base, "#1a2238", .38) : mix(base, "#fff4dc", .2));
    const top = yb - h; let g = "";
    const sp = sr ? [[x + w, yb], [x + w, top], [x + w + sw, top + sw * .12], [x + w + sw, yb]] : [[x, yb], [x, top], [x - sw, top + sw * .12], [x - sw, yb]];
    g += `<path d="${poly(sp)}" fill="${side}"${glass && hz ? ` opacity="${F(1 - hz * .5)}"` : ""}/>`;
    g += `<rect x="${F(x)}" y="${F(top)}" width="${F(w)}" height="${F(h)}" fill="${front}"/>`;
    if (glass && hz) g += `<rect x="${F(x)}" y="${F(top)}" width="${F(w)}" height="${F(h)}" fill="${HZ}" opacity="${F(hz)}"/>`;
    if (hz < .5) {
      g += `<rect x="${F(x)}" y="${F(top)}" width="${F(w)}" height="${F(h)}" fill="url(#${glass ? "nyBand" : "nyWin"})" opacity="${F(1 - hz * 1.4)}"/>`;
      if (sw > 6) g += `<path d="${poly(sp)}" fill="url(#nyWinS)" opacity="${F(1 - hz * 1.4)}"/>`;
    }
    if (!NIGHT && !glass) g += `<rect x="${F(x)}" y="${F(top)}" width="${F(w)}" height="${F(Math.min(h, 60))}" fill="url(#nyTop)"/><rect x="${F(x)}" y="${F(top)}" width="2" height="${F(h)}" fill="#fff" opacity="${F(.3 * (1 - hz))}"/>`;
    if (!NIGHT && glass) { g += `<path d="${poly([[x, top + h * .35], [x + w * .6, top], [x + w, top], [x + w, top + h * .1], [x, top + h * .6]])}" fill="#ffffff" opacity="${F(.18 * (1 - hz))}"/>`;
      for (let k = 1; k < w / 8; k++) g += `<rect x="${F(x + k * 8)}" y="${F(top)}" width=".8" height="${F(h)}" fill="#ffffff" opacity="${F(.25 * (1 - hz))}"/>`; }
    // lit windows at night; a few sun-glints by day
    if (NIGHT) { const cw = 9, chh = 11, p = o.lit ?? .32;
      for (let wy = Math.ceil(top / chh) * chh + 2; wy < yb - 8; wy += chh) for (let wx = Math.ceil(x / cw) * cw + 2; wx < x + w - 5; wx += cw)
        if (rw() < p) g += `<rect x="${wx}" y="${wy}" width="5" height="6" fill="${mix(LITW[Math.floor(rw() * LITW.length)], HZ, hz * .8)}" opacity="${F((.55 + rw() * .45) * (1 - hz * .5))}"/>`;
      if (sw > 6) for (let wy = top + 6; wy < yb - 8; wy += 11) for (let k = 0; k < sw / 6 - 1; k++) if (rw() < p * .7) { const wx = sr ? x + w + 1.5 + k * 6 : x - sw + 1.5 + k * 6;
        g += `<rect x="${F(wx)}" y="${F(wy + (sr ? k * .7 : -k * .7))}" width="3.5" height="6" fill="${mix(LITW[0], HZ, hz)}" opacity="${F(.5 * (1 - hz * .5))}"/>`; } }
    else if (hz < .4) for (let k = 0; k < w * h / 900; k++) { const wx = x + 2 + Math.floor(rw() * (w - 6) / 9) * 9, wy = top + 2 + Math.floor(rw() * (h - 10) / 11) * 11;
      g += `<rect x="${F(wx)}" y="${F(wy)}" width="5" height="6" fill="#fff4d0" opacity="${F(.55 * (1 - hz))}"/>`; }
    // roof details
    if (o.roof !== false && w > 26) {
      const kind = r();
      if (kind < .3) { const tx = x + w * (.2 + r() * .4); g += `<path d="M${F(tx)},${F(top)} l0,-10 M${F(tx + 10)},${F(top)} l0,-10" stroke="${Hc(NIGHT ? "#0a0c1c" : "#5a4a40")}" stroke-width="1.4"/><path d="${poly([[tx - 3, top - 10], [tx + 13, top - 10], [tx + 12, top - 24], [tx - 2, top - 24]])}" fill="${Hc(NIGHT ? "#1a1424" : "#8a6a52")}"/><path d="M${F(tx - 3)},${F(top - 24)} L${F(tx + 5)},${F(top - 30)} L${F(tx + 13)},${F(top - 24)}Z" fill="${Hc(NIGHT ? "#120e1c" : "#5a4436")}"/>`; }
      else if (kind < .55) g += `<rect x="${F(x + w * .3)}" y="${F(top - 8)}" width="${F(w * .3)}" height="8" fill="${Hc(NIGHT ? "#141630" : mix(base, "#000", .2))}"/>`;
      else if (kind < .7) { const ax = x + w * (.3 + r() * .4); g += `<path d="M${F(ax)},${F(top)} v-${F(16 + r() * 22)}" stroke="${Hc(NIGHT ? "#0a0c1c" : "#4a4a52")}" stroke-width="1.4"/>`;
        if (NIGHT) g += `<circle cx="${F(ax)}" cy="${F(top - 20)}" r="2" fill="#ff3a3a"/>`; }
      g += `<rect x="${F(x - 1)}" y="${F(top - 2)}" width="${F(w + 2)}" height="3" fill="${Hc(NIGHT ? "#262848" : "#e8e4dc")}" opacity=".8"/>`;
    }
    return g;
  };

  let city = "";
  /* far layer: hazy, many, low */
  for (let x = -30; x < W + 30;) { const w = 24 + r() * 46, env = Math.exp(-(((x - 1300) / 700) ** 2)), h = 50 + r() * 90 + env * 120;
    city += tower(x, WY - 22, w, h, { hz: NIGHT ? .55 : .6, roof: r() < .5, lit: .22 }); x += w + r() * 6; }
  city += `<rect x="0" y="${WY - 160}" width="${W}" height="150" fill="url(#nyHaze)" opacity=".7"/>`;
  /* mid layer */
  for (let x = -40; x < W + 40;) { const w = 34 + r() * 58, env = Math.exp(-(((x - 1300) / 620) ** 2)), h = 70 + r() * 110 + env * 120;
    if (!(x > 960 && x < 1640 && r() < .4)) city += tower(x, WY - 14, w, h, { hz: NIGHT ? .3 : .32, glass: r() < .25 }); x += w + 4 + r() * 16; }
  city += `<rect x="0" y="${WY - 110}" width="${W}" height="100" fill="url(#nyHaze)" opacity=".45"/>`;

  /* hero towers */
  const hero = [];
  { // slim needle (back right)
    const x = 1580, yb = WY - 12; let g = "";
    g += tower(x - 34, yb, 68, 250, { glass: true, roof: false, depth: 50, lit: .45 });
    g += `<path d="${poly([[x - 34, yb - 250], [x + 34, yb - 250], [x + 22, yb - 286], [x - 22, yb - 286]])}" fill="${NIGHT ? "#1a2448" : "#9ab4cc"}"/><path d="${poly([[x + 4, yb - 250], [x + 34, yb - 250], [x + 22, yb - 286], [x + 4, yb - 286]])}" fill="#000" opacity=".15"/>`;
    g += `<rect x="${x - 10}" y="${yb - 306}" width="20" height="20" fill="${NIGHT ? "#141c3a" : "#c8d4e0"}"/><path d="M${x},${yb - 306} v-90" stroke="${NIGHT ? "#2a3050" : "#7a8494"}" stroke-width="3"/><path d="M${x},${yb - 340} v-56" stroke="${NIGHT ? "#2a3050" : "#9aa4b4"}" stroke-width="1.6"/>`;
    if (NIGHT) { for (let k = 0; k < 6; k++) g += `<rect x="${x - 34}" y="${yb - 250 + 40 + k * 34}" width="68" height="2.5" fill="#ff4ac0" opacity=".7"/>`;
      g += `<path d="${poly([[x - 34, yb - 250], [x + 34, yb - 250], [x + 22, yb - 286], [x - 22, yb - 286]])}" fill="#ff4ac0" opacity=".45"/><circle cx="${x}" cy="${yb - 396}" r="3" fill="#ff3a3a"/><circle cx="${x}" cy="${yb - 396}" r="12" fill="url(#nyF4)"/>`; }
    hero.push(g);
  }
  { // glass tower with slanted crown (centre)
    const x = 1330, yb = WY - 10, w = 128; let g = "";
    g += tower(x - w / 2, yb, w, 270, { glass: true, roof: false, depth: 30, lit: .5 });
    const top = yb - 270;
    g += `<path d="${poly([[x - w / 2, top], [x + w / 2, top], [x + w / 2, top - 30], [x - w / 2, top - 78]])}" fill="${NIGHT ? "#1a2a52" : "url(#nyGlass)"}"/>`;
    g += `<path d="${poly([[x - w / 2, top - 78], [x + w / 2, top - 30], [x + w / 2 + 3, top - 30], [x - w / 2 + 3, top - 80]])}" fill="${NIGHT ? "#40e8ff" : "#ffffff"}" opacity="${NIGHT ? .9 : .7}"/>`;
    for (let k = 1; k < w / 8; k++) { const px = x - w / 2 + k * 8; g += `<path d="M${px},${top} L${px},${F(top - 78 + (px - x + w / 2) / w * 48)}" stroke="#fff" stroke-width=".8" opacity="${NIGHT ? .1 : .3}"/>`; }
    g += `<path d="M${x + 30},${top - 46} v-60" stroke="${NIGHT ? "#2a3050" : "#7a8494"}" stroke-width="2.4"/>`;
    if (NIGHT) g += `<circle cx="${x + 30}" cy="${top - 106}" r="2.6" fill="#ff3a3a"/><path d="M${x - w / 2},${top} h${w}" stroke="#40e8ff" stroke-width="2" opacity=".8"/>`;
    hero.push(g);
  }
  { // stepped deco tower with arched crown and spire (left of centre)
    const x = 1060, yb = WY - 10; let g = "";
    const tiers = [[116, 190], [92, 60], [70, 44]];
    let y = yb;
    tiers.forEach(([w, h], i) => { g += tower(x - w / 2, y, w, h, { roof: false, depth: 30, lit: .4 });
      if (!NIGHT) for (let k = 1; k < w / 12; k++) g += `<rect x="${x - w / 2 + k * 12 - 1}" y="${y - h}" width="2" height="${h}" fill="#fff" opacity=".18"/>`;
      g += `<rect x="${x - w / 2 - 3}" y="${y - h - 3}" width="${w + 6}" height="5" fill="${NIGHT ? "#2a2848" : "#efe8dc"}"/>`; y -= h; });
    const cr = NIGHT ? "#e8c060" : "#d8dce4", crS = NIGHT ? "#a8822a" : "#9aa4b4";
    for (let k = 0; k < 4; k++) { const w = 64 - k * 14, h = 26 - k * 2, yy = y - k * 22;
      g += `<path d="M${x - w / 2},${yy} L${x - w / 2},${yy - h * .4} Q${x},${yy - h * 1.5} ${x + w / 2},${yy - h * .4} L${x + w / 2},${yy}Z" fill="${cr}"/><path d="M${x + 2},${yy} L${x + 2},${yy - h * .95} Q${x + w * .35},${yy - h * .9} ${x + w / 2},${yy - h * .4} L${x + w / 2},${yy}Z" fill="${crS}" opacity=".7"/>`;
      for (let j = -2; j <= 2; j++) g += `<path d="M${x + j * w / 6},${yy - 3} l-2,-7 h4Z" fill="${NIGHT ? "#fff2c0" : "#3a4458"}" opacity="${NIGHT ? .9 : .6}"/>`; }
    const sTop = y - 4 * 22 - 70;
    g += `<path d="${poly([[x - 6, y - 4 * 22 + 4], [x, sTop], [x + 6, y - 4 * 22 + 4]])}" fill="${cr}"/><path d="${poly([[x, sTop], [x + 6, y - 4 * 22 + 4], [x + 1, y - 4 * 22 + 4]])}" fill="${crS}"/>`;
    if (NIGHT) g += `<circle cx="${x}" cy="${y - 50}" r="70" fill="url(#nyF0)" opacity=".7"/>`;
    hero.push(g);
  }
  city += hero.join("");
  /* near layer on the far bank: brownstones and low blocks, bare trees, embankment */
  for (let x = -20; x < W + 20;) { const w = 30 + r() * 44, h = 26 + r() * 46;
    city += tower(x, WY - 4, w, h, { hz: NIGHT ? .1 : .08, depth: 18, lit: .55 }); x += w + 1 + r() * 4; }
  let trees = "";
  for (let x = 6; x < W; x += 26 + r() * 30) { const h = 26 + r() * 22, c = mix(NIGHT ? "#141628" : "#5a4a48", HZ, .15);
    trees += `<path d="M${F(x)},${WY - 2} v-${F(h * .45)}" stroke="${c}" stroke-width="2"/><path d="${blobP(x, WY - h * .66, h * .32, h * .34, 8)}" fill="${c}" opacity=".55"/><path d="${blobP(x - h * .08, WY - h * .74, h * .18, h * .2, 7)}" fill="${NIGHT ? "#2a2a4a" : "#9a8a80"}" opacity=".45"/>`;
    if (NIGHT && r() < .55) for (let k = 0; k < 7; k++) trees += `<circle cx="${F(x + (r() - .5) * h * .5)}" cy="${F(WY - h * (.45 + r() * .4))}" r="1.1" fill="#fff0c0" opacity=".9"/>`; }
  city += `<g filter="url(#nyLeafyS)">${trees}</g>`;
  city += `<rect x="0" y="${WY - 4}" width="${W}" height="10" fill="${NIGHT ? "#1c1a30" : "#a89a8a"}"/><rect x="0" y="${WY - 4}" width="${W}" height="2" fill="${NIGHT ? "#3a3450" : "#e0d4c4"}"/><rect x="0" y="${WY + 4}" width="${W}" height="2" fill="#000" opacity=".25"/>`;
  for (let x = 20; x < W; x += 64) { city += `<rect x="${x}" y="${WY - 24}" width="2" height="20" fill="${NIGHT ? "#2a2a40" : "#3a3a44"}"/><circle cx="${x + 1}" cy="${WY - 25}" r="2.4" fill="${NIGHT ? "#ffe2a0" : "#e8e4d8"}"/>`;
    if (NIGHT) city += `<circle cx="${x + 1}" cy="${WY - 25}" r="14" fill="url(#nyGlow)"/>`; }
  s += city;

  /* the river: city and fireworks reflected, sky colour, ice floes or light streaks */
  s += `<rect x="0" y="${WY + 6}" width="${W}" height="${H - WY - 6}" fill="url(#nyWater)"/>`;
  s += `<g clip-path="url(#nyWaterClip)"><g transform="matrix(1,0,0,-1,0,${(WY + 6) * 2})" opacity="${NIGHT ? .55 : .42}" filter="url(#nyRipple)">${city}${NIGHT ? fw : ""}</g></g>`;
  s += `<rect x="0" y="${WY + 6}" width="${W}" height="${H - WY - 6}" fill="${NIGHT ? "#0a0c24" : "#2a4a6a"}" opacity="${NIGHT ? .25 : .2}"/>`;
  for (let k = 0; k < 220; k++) { const y = WY + 8 + Math.pow(r(), .8) * (H - WY - 8), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(20 + r() * 120 * (.4 + t))}" height="${F(1 + t * 1.6)}" rx="1" fill="${NIGHT ? FW[Math.floor(r() * 4)] : "#ffffff"}" opacity="${F(NIGHT ? .05 + r() * .12 : .06 + r() * .14)}"/>`; }
  if (!NIGHT) for (let k = 0; k < 26; k++) { const y = 520 + r() * 190, t = (y - WY) / (H - WY), x = r() * W, rx = (10 + r() * 26) * (.5 + t), ry = rx * (.18 + r() * .1);
    s += `<path d="${blobP(x + 2, y + 2, rx, ry, 8)}" fill="#2a4a6a" opacity=".4"/><path d="${blobP(x, y, rx, ry, 8)}" fill="#e8f0f6"/><path d="${blobP(x - rx * .2, y - ry * .3, rx * .6, ry * .4, 6)}" fill="#ffffff"/>`; }

  /* the ferry */
  { const bx = 1430, by = 600; let g = `<g transform="matrix(1,0,0,-1,0,${by * 2 + 8})" opacity=".35" filter="url(#nyRipple)">`;
    const boat = () => { let b = `<path d="M${bx - 80},${by - 22} L${bx + 86},${by - 22} L${bx + 70},${by} L${bx - 70},${by}Z" fill="${NIGHT ? "#3a1a22" : "#a8322a"}"/><path d="M${bx - 80},${by - 22} L${bx + 86},${by - 22} L${bx + 84},${by - 16} L${bx - 78},${by - 16}Z" fill="${NIGHT ? "#d8d4e0" : "#f4f0e8"}"/>`;
      b += `<rect x="${bx - 54}" y="${by - 46}" width="104" height="24" fill="${NIGHT ? "#2a2a40" : "#f4f0e8"}"/><rect x="${bx + 20}" y="${by - 46}" width="30" height="24" fill="#000" opacity=".1"/><rect x="${bx - 30}" y="${by - 64}" width="52" height="18" fill="${NIGHT ? "#2a2a40" : "#e8e4dc"}"/>`;
      for (let k = 0; k < 8; k++) b += `<rect x="${bx - 50 + k * 12.5}" y="${by - 41}" width="8" height="9" fill="${NIGHT ? "#ffd68a" : "#4a6080"}"/>`;
      for (let k = 0; k < 3; k++) b += `<rect x="${bx - 26 + k * 16}" y="${by - 60}" width="10" height="8" fill="${NIGHT ? "#fff0c0" : "#4a6080"}"/>`;
      b += `<rect x="${bx + 30}" y="${by - 82}" width="12" height="36" fill="${NIGHT ? "#3a1a22" : "#c8382a"}"/><rect x="${bx + 30}" y="${by - 82}" width="12" height="5" fill="#1a1a1e"/>`;
      return b; };
    g += boat() + `</g>` + boat();
    g += `<path d="M${bx - 74},${by + 2} q-60,8 -150,6 M${bx - 70},${by + 6} q-80,10 -200,12" stroke="#ffffff" stroke-width="2" fill="none" opacity=".4"/>`;
    if (NIGHT) g += `<circle cx="${bx - 6}" cy="${by - 40}" r="80" fill="url(#nyGlow)" opacity=".5"/><circle cx="${bx - 78}" cy="${by - 26}" r="2.4" fill="#ff4040"/><circle cx="${bx + 84}" cy="${by - 26}" r="2.4" fill="#40ff80"/><circle cx="${bx + 36}" cy="${by - 88}" r="2" fill="#ffffff"/>`;
    s += g; }

  /* bunting: swags of little triangle flags between hang points */
  const BUNT = ["#d8242a", "#f2c230", "#2a62c8", "#ffffff", "#2a9a4a"];
  const bunting = (pts, k) => { let b = "";
    for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], sag = 9 * k, n = Math.max(3, Math.round(Math.hypot(bx - ax, by - ay) / (8 * k)));
      const Q = t => [ax + (bx - ax) * t, ay + (by - ay) * t + Math.sin(t * Math.PI) * sag];
      b += `<path d="${line(Array.from({ length: 11 }, (_, j) => Q(j / 10)))}" stroke="${NIGHT ? "#0a0a14" : "#3a3a40"}" stroke-width="${F(.7 * k)}" fill="none"/>`;
      for (let j = 0; j < n; j++) { const [px, py] = Q((j + .5) / n), c = BUNT[(i * 3 + j) % BUNT.length];
        b += `<path d="M${F(px - 3 * k)},${F(py)} L${F(px + 3 * k)},${F(py)} L${F(px)},${F(py + 7 * k)}Z" fill="${NIGHT ? mix(c, "#101028", .6) : c}"/>`; } }
    return b; };

  /* suspension bridge from the near left to the far bank */
  { const N = [-80, 672], Fb = [820, WY + 2], P = t => [N[0] + (Fb[0] - N[0]) * (1 - Math.pow(1 - t, 1.35)), N[1] + (Fb[1] - N[1]) * (1 - Math.pow(1 - t, 1.35))], K = t => 1.6 - 1.28 * t;
    const steel = NIGHT ? "#2a2a4a" : "#6a7a8e", steelL = NIGHT ? "#4a4a70" : "#a8b8c8", steelD = NIGHT ? "#14142a" : "#3a4658", deck = NIGHT ? "#1a1a30" : "#4a5466";
    let g = "", T1 = .2, T2 = .7;
    const top = t => { const [x, y] = P(t); return [x, y - 300 * K(t) * .78]; };
    // piers + towers
    [T1, T2].forEach(t => { const [x, y] = P(t), k = K(t);
      g += `<rect x="${F(x - 14 * k)}" y="${F(y)}" width="${F(28 * k)}" height="${F(36 * k)}" fill="${NIGHT ? "#1a1828" : "#8a8278"}"/><rect x="${F(x + 4 * k)}" y="${F(y)}" width="${F(10 * k)}" height="${F(36 * k)}" fill="#000" opacity=".2"/>`; });
    // deck (thick, receding)
    const ts = Array.from({ length: 41 }, (_, i) => i / 40 * .98);
    g += `<path d="${poly([...ts.map(t => { const [x, y] = P(t); return [x, y - 4 * K(t)]; }), ...ts.slice().reverse().map(t => { const [x, y] = P(t); return [x, y + 10 * K(t)]; })])}" fill="${deck}"/>`;
    g += `<path d="${line(ts.map(t => { const [x, y] = P(t); return [x, y - 4 * K(t)]; }))}" stroke="${steelL}" stroke-width="2" fill="none"/>`;
    for (let i = 0; i < 40; i++) { const [x, y] = P(ts[i]), k = K(ts[i]); g += `<path d="M${F(x)},${F(y - 3 * k)} l${F(6 * k)},${F(12 * k)}" stroke="${steelD}" stroke-width="${F(1.2 * k)}"/>`; }
    // towers
    [T1, T2].forEach(t => { const [x, y] = P(t), k = K(t), h = 300 * k * .78, tw = 13 * k;
      g += `<path d="${poly([[x - tw, y], [x - tw * .6, y - h], [x + tw * .6, y - h], [x + tw, y]])}" fill="${steel}"/><path d="${poly([[x - tw, y], [x - tw * .6, y - h], [x - tw * .1, y - h], [x - tw * .3, y]])}" fill="${steelL}"/>`;
      for (let j = 1; j < 4; j++) g += `<rect x="${F(x - tw)}" y="${F(y - h * j / 3.4)}" width="${F(tw * 2)}" height="${F(4 * k)}" fill="${steelD}"/>`;
      g += `<path d="M${F(x - tw * .4)},${F(y - h * .5)} l0,${F(-h * .2)} q${F(tw * .4)},${F(-tw * .8)} ${F(tw * .8)},0 l0,${F(h * .2)}Z" fill="${NIGHT ? "#0a0a18" : "#cfd8e2"}" opacity=".7"/>`;
      g += `<rect x="${F(x - tw * .8)}" y="${F(y - h - 5 * k)}" width="${F(tw * 1.6)}" height="${F(6 * k)}" fill="${steelD}"/>`; });
    // main cable + suspenders
    const cable = [];
    const A0 = P(0), Aend = P(.97), t1 = top(T1), t2 = top(T2);
    for (let i = 0; i <= 12; i++) { const u = i / 12; cable.push([A0[0] + (t1[0] - A0[0]) * u, A0[1] - 6 + (t1[1] - A0[1] + 6) * Math.pow(u, 1.4)]); }
    for (let i = 1; i <= 24; i++) { const u = i / 24, [x] = [t1[0] + (t2[0] - t1[0]) * u], ty = t1[1] + (t2[1] - t1[1]) * u, [, dy] = P(T1 + (T2 - T1) * u); cable.push([x, ty + (dy - 20 * K(T1 + (T2 - T1) * u) - ty) * Math.sin(u * Math.PI) * .9]); }
    for (let i = 1; i <= 10; i++) { const u = i / 10; cable.push([t2[0] + (Aend[0] - t2[0]) * u, t2[1] + (Aend[1] - 4 - t2[1]) * Math.pow(u, .7)]); }
    const hangT = []; for (let t = .03; t < .96; t += .022) hangT.push(t);
    const cableY = x => { for (let i = 0; i < cable.length - 1; i++) if (cable[i][0] <= x && cable[i + 1][0] >= x) { const u = (x - cable[i][0]) / (cable[i + 1][0] - cable[i][0] || 1); return cable[i][1] + (cable[i + 1][1] - cable[i][1]) * u; } return null; };
    hangT.forEach(t => { const [x, y] = P(t), cy = cableY(x); if (cy !== null && cy < y - 6) g += `<path d="M${F(x)},${F(cy)} L${F(x)},${F(y - 4 * K(t))}" stroke="${steelD}" stroke-width="${F(Math.max(.6, .9 * K(t)))}"/>`; });
    g += `<path d="${line(cable)}" stroke="${steelD}" stroke-width="4" fill="none"/><path d="${line(cable)}" stroke="${steelL}" stroke-width="1.4" fill="none" transform="translate(0,-1.5)"/>`;
    // bunting on the railing by day, pearl lights by night
    const rail = []; for (let t = .02; t < .97; t += .06) { const [x, y] = P(t); rail.push([x, y - 12 * K(t)]); }
    if (!NIGHT) { g += `<path d="${line(rail)}" stroke="${steelD}" stroke-width="1.2" fill="none"/>`; for (let i = 0; i < rail.length - 1; i++) g += bunting([rail[i], rail[i + 1]], K(.02 + i * .06) * .9); }
    else { cable.forEach(([x, y], i) => { if (i % 2) return; g += `<circle cx="${F(x)}" cy="${F(y)}" r="7" fill="url(#nyGlow)"/><circle cx="${F(x)}" cy="${F(y)}" r="1.8" fill="#fff4d0"/>`; });
      rail.forEach(([x, y]) => g += `<circle cx="${F(x)}" cy="${F(y + 6)}" r="1.6" fill="#ffe0a0"/>`); }
    s += g; }

  /* steel arch bridge from the far bank to the near right */
  { const Fb = [1800, WY + 2], N = [2660, 640], P = t => [Fb[0] + (N[0] - Fb[0]) * Math.pow(t, 1.3), Fb[1] + (N[1] - Fb[1]) * Math.pow(t, 1.3)], K = t => .38 + 1.1 * Math.pow(t, 1.3);
    const steel = NIGHT ? "#2a2440" : "#4a7a9a", steelL = NIGHT ? "#4a4468" : "#8ab8d4", steelD = NIGHT ? "#120e22" : "#2a4a62", deck = NIGHT ? "#1a1a30" : "#4a5466";
    let g = "";
    const ts = Array.from({ length: 41 }, (_, i) => i / 40);
    [.1, .86].forEach(t => { const [x, y] = P(t), k = K(t); g += `<rect x="${F(x - 16 * k)}" y="${F(y)}" width="${F(32 * k)}" height="${F(40 * k)}" fill="${NIGHT ? "#1a1828" : "#8a8278"}"/><rect x="${F(x - 16 * k)}" y="${F(y)}" width="${F(10 * k)}" height="${F(40 * k)}" fill="#fff" opacity=".1"/>`; });
    const arch = t => { const u = (t - .1) / .76, [x, y] = P(t); return [x, y - Math.sin(Math.max(0, Math.min(1, u)) * Math.PI) * 190 * K(t) * .8]; };
    const at = Array.from({ length: 31 }, (_, i) => .1 + i / 30 * .76);
    // hangers
    at.forEach((t, i) => { if (i % 2) return; const [x, y] = P(t), [, ay] = arch(t); g += `<path d="M${F(x)},${F(ay)} L${F(x)},${F(y - 4 * K(t))}" stroke="${steelD}" stroke-width="${F(.9 * K(t))}"/>`; });
    // arch rib (two curves, truss between)
    const outer = at.map(t => { const [x, y] = arch(t); return [x, y - 9 * K(t)]; }), inner = at.map(t => arch(t));
    g += `<path d="${poly([...outer, ...inner.slice().reverse()])}" fill="${steel}"/>`;
    for (let i = 0; i < at.length - 1; i++) g += `<path d="M${F(inner[i][0])},${F(inner[i][1])} L${F(outer[i + 1][0])},${F(outer[i + 1][1])}" stroke="${steelD}" stroke-width="${F(.9 * K(at[i]))}"/>`;
    g += `<path d="${line(outer)}" stroke="${steelL}" stroke-width="1.6" fill="none"/>`;
    g += `<path d="${poly([...ts.map(t => { const [x, y] = P(t); return [x, y - 4 * K(t)]; }), ...ts.slice().reverse().map(t => { const [x, y] = P(t); return [x, y + 9 * K(t)]; })])}" fill="${deck}"/>`;
    g += `<path d="${line(ts.map(t => { const [x, y] = P(t); return [x, y - 4 * K(t)]; }))}" stroke="${steelL}" stroke-width="1.6" fill="none"/>`;
    const rail = []; for (let t = 0; t <= 1.001; t += .05) { const [x, y] = P(t); rail.push([x, y - 11 * K(t)]); }
    if (!NIGHT) { g += `<path d="${line(rail)}" stroke="${steelD}" stroke-width="1.2" fill="none"/>`; for (let i = 0; i < rail.length - 1; i++) g += bunting([rail[i], rail[i + 1]], K(i * .05) * .9);
      g += bunting(outer.filter((_, i) => i % 5 === 0), 1); }
    else { outer.forEach(([x, y], i) => { const c = FW[i % 2 ? 2 : 1]; g += `<circle cx="${F(x)}" cy="${F(y)}" r="8" fill="url(#nyF${i % 2 ? 2 : 1})"/><circle cx="${F(x)}" cy="${F(y)}" r="1.8" fill="${mix(c, "#ffffff", .5)}"/>`; });
      rail.forEach(([x, y]) => g += `<circle cx="${F(x)}" cy="${F(y + 5)}" r="1.6" fill="#ffe0a0"/>`); }
    s += g; }

  /* near quay along the bottom: stone balustrade */
  { let g = `<rect x="0" y="700" width="${W}" height="20" fill="${NIGHT ? "#141224" : "#8a8070"}"/><rect x="0" y="696" width="${W}" height="6" fill="${NIGHT ? "#2a2640" : "#c8bca8"}"/>`;
    for (let x = 4; x < W; x += 14) g += `<path d="M${x},696 q-3,-8 0,-14 q3,-6 0,-12 l6,0 q-3,6 0,12 q3,6 0,14Z" fill="${NIGHT ? "#1c1a30" : "#b4a894"}"/>`;
    g += `<rect x="0" y="664" width="${W}" height="7" fill="${NIGHT ? "#2a2640" : "#d8ccb8"}"/>`;
    s += g; }

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#nyLight)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#nyPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
