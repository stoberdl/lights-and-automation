/* Harbor Lighthouse, Fall: a New England fishing harbor in October. A white
   conical lighthouse with a black lantern stands on a granite point (right of
   centre) with its keeper's house and oil house; a clapboard village climbs
   the hill on the left among red and orange maples, with a wharf, a fish shack
   hung with buoys and stacked traps; lobster boats ride at their moorings,
   gulls wheel overhead, granite ledges and kelp in front.
   opts.time === "night": full moon in the same place as the day's sun, moon
   path on the water, the lighthouse lamp lit with soft beams, lit windows,
   a wharf lamp and stars.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function harborLighthouseFallArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1107;
  const r = rng(seed), rs = rng(seed + 7), rl = rng(seed + 13);   // land / sky / night-only streams
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 1060, LY = 128, WY = 446;
  const T = c => NIGHT ? mix(mix(c, "#7a7a8a", .4), "#0c1434", .58) : c;
  const RIM = NIGHT ? "#b8c8f4" : "#fff0c8", LAMP = "#ffc868", SHADE = NIGHT ? "#04060e" : "#2a2438";
  const cl = v => Math.max(0, Math.min(.999, v));
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
  const angP = (cx, cy, rx, ry, n) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r() * .45, k = .72 + r() * .32; p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return p; };
  const wave = (ph, fr, am) => x => fr.reduce((s, f, i) => s + Math.sin(x / f + ph[i]) * am[i], 0);
  const ridgePath = (fn, close = H, x0 = 0, x1 = W) => { let d = `M${x0},${close} L${x0},${F(fn(x0))}`;
    for (let x = x0; x <= x1; x += 16) d += ` L${x},${F(fn(x))}`; return d + ` L${x1},${F(fn(x1))} L${x1},${close}Z`; };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
  const line = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L");

  const SKY_H = NIGHT ? "#3a4a78" : "#f3d6a8", HZ = NIGHT ? "#33416a" : "#ecd8b8";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#060b20"/><stop offset=".45" stop-color="#0f1a40"/><stop offset=".8" stop-color="#26365f"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#3474bc"/><stop offset=".42" stop-color="#7cb0dc"/><stop offset=".76" stop-color="#d6dccc"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#dfe8ff" stop-opacity=".5"/><stop offset=".15" stop-color="#b8c8f0" stop-opacity=".2"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".06"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d6" stop-opacity=".9"/><stop offset=".18" stop-color="#ffefc0" stop-opacity=".45"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="hldefs">
    <linearGradient id="hlSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="hlLight" cx="${LX}" cy="${LY}" r="780" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="hlHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    ${g2("hlFar1", NIGHT ? "#25305a" : "#9aa8c4", NIGHT ? "#2c3860" : "#bcc2c8")}
    ${g2("hlFar2", NIGHT ? "#1f2a52" : "#8a9cb0", NIGHT ? "#28345c" : "#aab2ae")}
    ${g2("hlBack", T("#a49a6a"), T("#8a8452"))}
    ${g2("hlHill", T("#a6a052"), T("#6e7034"))}
    ${g2("hlGrass", T("#b2aa5a"), T("#7a7838"))}
    <linearGradient id="hlWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#3a4a76"/><stop offset=".25" stop-color="#22305a"/><stop offset="1" stop-color="#0c1430"/>`
      : `<stop offset="0" stop-color="#a6c0cc"/><stop offset=".18" stop-color="#6e9ab2"/><stop offset=".6" stop-color="#3e6a88"/><stop offset="1" stop-color="#22465e"/>`}</linearGradient>
    <linearGradient id="hlTower" x1="1466" y1="0" x2="1534" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#fffaf0")}"/><stop offset=".38" stop-color="${T("#f2ede2")}"/><stop offset=".72" stop-color="${T("#c6c2c0")}"/><stop offset="1" stop-color="${T("#96949e")}"/></linearGradient>
    <linearGradient id="hlCap" x1="1476" y1="0" x2="1524" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#6a6e76")}"/><stop offset=".4" stop-color="${T("#30343c")}"/><stop offset="1" stop-color="${T("#16181e")}"/></linearGradient>
    <linearGradient id="hlBeamL" x1="1500" y1="0" x2="760" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff2c0" stop-opacity=".55"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></linearGradient>
    <linearGradient id="hlBeamR" x1="1500" y1="0" x2="2150" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff2c0" stop-opacity=".45"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></linearGradient>
    <radialGradient id="hlGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <clipPath id="hlCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <clipPath id="hlC482"><rect x="0" y="482" width="${W}" height="${H - 482}"/></clipPath>
    <clipPath id="hlC500"><rect x="0" y="500" width="${W}" height="${H - 500}"/></clipPath>
    <filter id="hlLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hlLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hlCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="32" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="hlRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.2"/></filter>
    <filter id="hlPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="hlSoft"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hlSky)"/>`;

  /* sun, or a full moon with stars */
  if (NIGHT) {
    for (let i = 0; i < 440; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 420, d = Math.hypot(x - LX, y - LY), big = rs() < .08, o = .2 + rs() * .6 * (1 - y / 470);
      if (d < 170) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 36;
    s += `<rect width="${W}" height="${H}" fill="url(#hlLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 20}" fill="#cfdcff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#f2f5fc"/>`;
    [[-12, -10, 9, 6], [8, -14, 7, 5], [-2, 8, 10, 6], [-17, 12, 5, 5], [15, 6, 5, 8]].forEach(([dx, dy, a, b]) => s += `<path d="${blobP(LX + dx, LY + dy, a, b, 7, rs)}" fill="#9aa4bc" opacity=".22"/>`);
    s += `<circle cx="${LX}" cy="${LY}" r="${R - 1}" fill="none" stroke="#ffffff" stroke-width="2" opacity=".4"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#hlLight)"/><circle cx="${LX}" cy="${LY}" r="40" fill="#fffbe8"/>`;
    s += `<g class="rays" opacity=".1" filter="url(#hlSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .5 + k * .3, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: sea-breeze cumulus by day, thin moonlit strata by night */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#hlCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#1a2244"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#26305a"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="#5a6a9c" opacity=".8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .16)}" rx="${F(R * .4)}" ry="${F(R * .07)}" fill="#a8b8e4" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .14 * (.6 + rs() * .7), w * (.085 + rs() * .07)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .07)}" fill="#bcc8da"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#c9d2e0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .85)}" fill="#f7f6f2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .35)}" rx="${F(R * .6)}" ry="${F(R * .4)}" fill="#fffbea"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(470, 175, 440, "drift1") + cloud(1880, 110, 540, "drift2") + cloud(2340, 225, 290, "drift3") + cloud(210, 262, 230, "drift2");
  /* gulls wheeling over the harbour (day) */
  if (!NIGHT) {
    s += `<g class="birds" stroke-linecap="round">`;
    [[1150, 250, 1.1], [1196, 228, .9], [1262, 262, 1], [1320, 236, .8], [1238, 300, .75], [1100, 300, .7], [960, 330, .65]].forEach(([x, y, k]) => {
      const fl = rs() < .5 ? 1 : -1;
      s += `<path d="M${F(x - 16 * k)},${F(y - 3 * k)} q${F(8 * k)},${F(-9 * k * fl)} ${F(16 * k)},${F(3 * k)} q${F(8 * k)},${F(-9 * k * fl)} ${F(16 * k)},${F(-3 * k)}" stroke="#8a8e98" stroke-width="${F(3 * k)}" fill="none"/>`;
      s += `<path d="M${F(x - 16 * k)},${F(y - 3 * k)} q${F(3 * k)},${F(-4 * k * fl)} ${F(6 * k)},${F(-3 * k * fl)} M${F(x + 16 * k)},${F(y - 3 * k)} q${F(-3 * k)},${F(-4 * k * fl)} ${F(-6 * k)},${F(-3 * k * fl)}" stroke="#2a2a30" stroke-width="${F(2.6 * k)}" fill="none"/>`;
      s += `<ellipse cx="${F(x)}" cy="${F(y + 1 * k)}" rx="${F(5 * k)}" ry="${F(2.4 * k)}" fill="#fbfaf6"/>`; });
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ---------- helpers for the land ---------- */
  const AUT = ["#c8452a", "#d85a26", "#e0702a", "#e98a2c", "#eaa032", "#f2c648", "#a13a2a", "#8a9a3c", "#6f8a36", "#b8302a"];
  const forest = (fn, rows, size, haze, conifer, x0 = -10, x1 = W + 10) => {
    let f = ""; const trees = [];
    for (let row = 0; row < rows; row++) for (let x = x0; x < x1; x += size * (.9 + r() * .5)) {
      const y = fn(x) + row * size * .72 + size * .4 + r() * size * .3, sz = size * (.75 + r() * .45);
      trees.push([x + r() * size * .4, y, sz]); }
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(([x, y, sz]) => {
      const lsd = x < LX ? 1 : -1;
      if (r() < conifer) {
        const c = T(mix("#2e4a30", HZ, haze));
        f += `<path d="M${F(x)},${F(y - sz * 1.9)} L${F(x + sz * .3)},${F(y - sz * 1.2)} L${F(x + sz * .2)},${F(y - sz * 1.2)} L${F(x + sz * .55)},${F(y)} L${F(x - sz * .55)},${F(y)} L${F(x - sz * .2)},${F(y - sz * 1.2)} L${F(x - sz * .3)},${F(y - sz * 1.2)}Z" fill="${c}"/><path d="M${F(x)},${F(y - sz * 1.9)} L${F(x - lsd * sz * .3)},${F(y - sz * 1.2)} L${F(x - lsd * sz * .2)},${F(y - sz * 1.2)} L${F(x - lsd * sz * .55)},${F(y)} L${F(x)},${F(y)}Z" fill="${mix(c, "#000000", .2)}"/>`;
        return; }
      const base = AUT[Math.floor(r() * AUT.length)], c = T(mix(base, HZ, haze)), dk = mix(c, NIGHT ? "#050814" : "#2a1a10", .36), lt = mix(c, RIM, NIGHT ? .22 : .32);
      f += `<path d="${blobP(x - lsd * sz * .12, y + sz * .1, sz * .95, sz * .8, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz * .08, sz * .85, sz * .72, 7)}" fill="${c}"/><path d="${blobP(x + lsd * sz * .25, y - sz * .35, sz * .42, sz * .3, 6)}" fill="${lt}"/>`;
    });
    return f;
  };
  /* deciduous tree from many small leaf clumps, lit from the light */
  const leafTree = (x, y, h, n, RAMP, o = {}) => {
    let g = "";
    const cx = x, cy = y - h * .64, rx = h * .38 * (o.wide || 1), ry = h * .32, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, sd = ux > 0 ? 1 : -1;
    g += `<ellipse cx="${F(x - ux * h * .12)}" cy="${F(y + 3)}" rx="${F(h * .5)}" ry="${F(h * .05)}" fill="${NIGHT ? "#02040c" : "#2a2a10"}" opacity=".25"/>`;
    const tb = h * .05, tt = h * .025, ty = y - h * .56, tc = T(o.trunk || "#3e2a1c");
    g += `<path d="M${F(x - tb)},${F(y)} C${F(x - tb * .7)},${F(y - h * .25)} ${F(x - tt * 1.4)},${F(y - h * .4)} ${F(x - tt)},${F(ty)} L${F(x + tt)},${F(ty)} C${F(x + tt * 1.4)},${F(y - h * .4)} ${F(x + tb * .7)},${F(y - h * .25)} ${F(x + tb)},${F(y)}Z" fill="${tc}"/>`;
    g += `<path d="M${F(x + sd * tb * .6)},${F(y)} Q${F(x + sd * tt * 1.3)},${F(y - h * .3)} ${F(x + sd * tt * .7)},${F(ty)}" stroke="${mix(tc, RIM, .4)}" stroke-width="${F(Math.max(1, tb * .45))}" fill="none"/>`;
    [[-1, .5, .26, .18], [1, .52, .28, .16], [-1, .6, .18, .22], [1, .62, .2, .22]].forEach(([d, at, dx, dy]) => g += `<path d="M${F(x)},${F(y - h * at)} Q${F(x + d * h * dx * .4)},${F(y - h * at - h * dy * .6)} ${F(x + d * h * dx)},${F(y - h * at - h * dy)}" stroke="${tc}" stroke-width="${F(h * .022)}" fill="none" stroke-linecap="round"/>`);
    const crown = [[cx, cy, rx, ry * .8], [cx - rx * .62, cy + ry * .2, rx * .55, ry * .6], [cx + rx * .62, cy + ry * .15, rx * .58, ry * .62], [cx - rx * .1, cy - ry * .55, rx * .55, ry * .5], [cx + rx * .3, cy - ry * .42, rx * .5, ry * .45], [cx, cy + ry * .45, rx * .85, ry * .42]];
    const inC = (px, py) => crown.some(([a, b, c, d]) => ((px - a) / c) ** 2 + ((py - b) / d) ** 2 < 1);
    const cs = [];
    for (let i = 0; i < n * 3 && cs.length < n; i++) { const px = cx - rx * 1.25 + r() * rx * 2.5, py = cy - ry * 1.3 + r() * ry * 2.3;
      if (!inC(px, py)) continue;
      const nx = (px - cx) / (rx * 1.2), ny = (py - cy) / (ry * 1.2), lit = (nx * ux + ny * uy) * .5 + .5, edge = Math.min(1, Math.hypot(nx, ny));
      cs.push([px, py, cl(lit * .72 + edge * .15 + (r() - .5) * .3), h * (.03 + r() * .028)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = "";
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${T(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#hlLeafy)">${cg}</g>`;
  };
  /* tiered spruce: jagged branch layers, lit + shaded side, visible trunk */
  const conifer = (x, y, h) => {
    const sd = LX < x ? -1 : 1; let g = "";
    const trunk = T("#3e2a1e"), dark = T("#16261c"), mid = T("#22382a"), lit = T("#3a5a3a"), hl = T("#a8b070");
    const tw = Math.max(1.5, h * .04), th = h * .12;
    g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .6)},${F(y - th * 2.2)} L${F(x + tw * .6)},${F(y - th * 2.2)} L${F(x + tw)},${F(y)}Z" fill="${trunk}"/>`;
    const tiers = Math.max(3, Math.min(12, Math.round(h / 18))), top = y - h, bot = y - th, span = bot - top;
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - span * u * .9, ya = t === tiers - 1 ? top : Math.max(top, yb - span * (.3 - .1 * u)), w = h * .3 * (1 - u * .8) * (.85 + r() * .3);
      const A = [x + (r() - .5) * w * .08, ya], th2 = yb - ya, m = Math.max(2, Math.round(w / 7)) * 2, edge = [];
      for (let k = 0; k <= m; k++) { const px = x - w + 2 * w * k / m, d = Math.abs(px - x) / w;
        edge.push([px + (r() - .5) * w * .05, yb + (k % 2 ? -th2 * (.1 + r() * .08) : d * th2 * .16 + r() * 2)]); }
      const Lm = [x - w * .3, ya + th2 * .55], Rm = [x + w * .3, ya + th2 * .55];
      if (t > 0 && h > 40) g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mix(dark, "#000000", .4)}" opacity=".6" transform="translate(${F(-sd * th2 * .06)},${F(th2 * .12)})"/>`;
      g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mid}"/>`;
      const shade = sd < 0 ? [A, [x, yb - 2], ...edge.filter(p => p[0] > x), Rm] : [A, Lm, ...edge.filter(p => p[0] < x), [x, yb - 2]];
      g += `<path d="${poly(shade)}" fill="${dark}"/>`;
      const le = edge.filter(p => (p[0] - x) * sd > w * .5); if (sd > 0) le.reverse();
      g += `<path d="${poly([A, sd < 0 ? Lm : Rm, ...le, [x + sd * w * .38, yb - th2 * .3]])}" fill="${lit}"/>`;
      for (let k = 0; k < w / 3; k++) { const py = ya + th2 * (.35 + r() * .6), lim = w * (py - ya) / th2, px = x + (r() - .5) * 2 * lim * .9, s2 = px < x ? -1 : 1;
        g += `<path d="M${F(px)},${F(py)} l${F(s2 * 3.5)},${F(4 + r() * 3)}" stroke="${s2 === sd ? mix(lit, hl, .3) : mix(dark, "#000000", .3)}" stroke-width="1.2" opacity=".7"/>`; }
    }
    return g;
  };
  /* granite boulder/ledge: angular facets, lit on the side toward the light */
  const GR = ["#4a403c", "#86766a", "#b4a290", "#e6d4bc"];
  const granite = (x, y, R, flat = .55) => {
    const sd = LX < x ? -1 : 1;
    let g = `<path d="${poly(angP(x, y, R, R * flat, 7))}" fill="${T(GR[0])}"/>`;
    g += `<path d="${poly(angP(x + sd * R * .1, y - R * flat * .22, R * .82, R * flat * .62, 6))}" fill="${T(GR[1])}"/>`;
    g += `<path d="${poly(angP(x + sd * R * .28, y - R * flat * .45, R * .5, R * flat * .32, 5))}" fill="${T(GR[2])}"/>`;
    g += `<path d="${poly(angP(x + sd * R * .38, y - R * flat * .58, R * .22, R * flat * .14, 4))}" fill="${T(GR[3])}" opacity=".85"/>`;
    g += `<path d="M${F(x - R * .3)},${F(y - R * flat * .3)} l${F(R * .12)},${F(R * flat * .5)} l${F(R * .1)},${F(R * flat * .2)}" stroke="${T(GR[0])}" stroke-width="1.2" fill="none" opacity=".6"/>`;
    return g;
  };
  /* clapboard house in perspective: a gable end and a long side, local coords, then placed */
  const house = (x, y, s, o) => {
    const m = o.m || 1, gw = o.gw || 44, sw = o.sw || 66, h = o.h || 36, rh = o.rh || 26;
    const A = [0, 0], B = [-m * gw, -gw * .1], C = [m * sw, -sw * .15];
    const up = (p, v) => [p[0], p[1] - v];
    const G = (u, v) => [B[0] * u, B[1] * u - h * v], S = (u, v) => [C[0] * u, C[1] * u - h * v];
    const q = (f, u0, v0, u1, v1) => poly([f(u0, v0), f(u1, v0), f(u1, v1), f(u0, v1)]);
    const R1 = [B[0] / 2, B[1] / 2 - h - rh], R2 = [R1[0] + C[0], R1[1] + C[1]];
    const gLit = (LX < x) === (m > 0);
    const wl = T(o.wall), wG = gLit ? mix(wl, RIM, .18) : mix(wl, SHADE, .3), wS = gLit ? mix(wl, SHADE, .26) : mix(wl, RIM, .14), tr = T(o.trim || "#f4f0e6"), rf = T(o.roof);
    let g = `<g transform="translate(${F(x)},${F(y)}) scale(${F(s)})">`;
    g += `<ellipse cx="${F(m * sw * .45)}" cy="0" rx="${F(sw * .85)}" ry="5" fill="#000" opacity=".2"/>`;
    g += `<path d="${poly([A, B, up(B, h), R1, up(A, h)])}" fill="${wG}"/><path d="${poly([A, C, up(C, h), up(A, h)])}" fill="${wS}"/>`;
    for (let k = 1; k < 10; k++) { const v = k / 10;
      g += `<path d="${line([G(0, v), G(1, v)])}" stroke="${mix(wG, "#000000", .18)}" stroke-width=".8"/><path d="${line([S(0, v), S(1, v)])}" stroke="${mix(wS, "#000000", .18)}" stroke-width=".8"/>`; }
    g += `<path d="${line([A, up(A, h)])}" stroke="${tr}" stroke-width="2.4"/><path d="${line([B, up(B, h)])}" stroke="${tr}" stroke-width="2"/><path d="${line([C, up(C, h)])}" stroke="${tr}" stroke-width="2"/>`;
    const win = (f, u0, v0, u1, v1) => {
      const lit = NIGHT && rl() < .72, du = (u1 - u0) * .14, dv = (v1 - v0) * .1;
      let w = `<path d="${q(f, u0, v0, u1, v1)}" fill="${tr}"/><path d="${q(f, u0 + du, v0 + dv, u1 - du, v1 - dv)}" fill="${lit ? LAMP : T("#4a5e74")}"/>`;
      if (!lit) w += `<path d="${q(f, u0 + du, (v0 + v1) / 2, (u0 + u1) / 2, v1 - dv)}" fill="${T("#a8c0d0")}" opacity=".45"/>`;
      w += `<path d="${line([f((u0 + u1) / 2, v0 + dv), f((u0 + u1) / 2, v1 - dv)])} ${line([f(u0 + du, (v0 + v1) / 2), f(u1 - du, (v0 + v1) / 2)])}" stroke="${tr}" stroke-width="1"/>`;
      if (o.shut && f === S) w += `<path d="${q(f, u0 - .045, v0, u0 - .005, v1)}" fill="${T(o.shut)}"/><path d="${q(f, u1 + .005, v0, u1 + .045, v1)}" fill="${T(o.shut)}"/>`;
      if (lit) { const c = f((u0 + u1) / 2, (v0 + v1) / 2); w += `<circle cx="${F(c[0])}" cy="${F(c[1])}" r="${F(gw * .5)}" fill="url(#hlGlow)" opacity=".55"/>`; }
      return w; };
    const rows = h > 50 ? [[.14, .4], [.58, .84]] : [[.3, .72]];
    rows.forEach(([v0, v1], ri) => { (o.wins || [.2, .5, .78]).forEach(u => g += win(S, u - .06, v0, u + .06, v1));
      if (ri || rows.length === 1) g += win(G, .58, v0, .78, v1); });
    if (rows.length === 1 || true) g += win(G, .38, 1.06, .62, 1.06 + rh / h * .5);
    g += `<path d="${q(G, .16, 0, .34, h > 50 ? .32 : .6)}" fill="${T(o.door || "#5a3424")}"/>`;
    const ov = [m * 4, 3];
    g += `<path d="${poly([[A[0] + ov[0] * .3, A[1] - h + ov[1]], [C[0] + ov[0], C[1] - h + ov[1]], [R2[0] + ov[0], R2[1] - 1], [R1[0], R1[1] - 1]])}" fill="${rf}"/>`;
    for (let k = 1; k < 6; k++) { const t = k / 6, a = [A[0] + (R1[0] - A[0]) * t, (A[1] - h) + (R1[1] - (A[1] - h)) * t];
      g += `<path d="${line([a, [a[0] + C[0], a[1] + C[1]]])}" stroke="${mix(rf, "#000000", .3)}" stroke-width=".9" opacity=".7"/>`; }
    g += `<path d="${poly([[A[0], A[1] - h], [C[0], C[1] - h], [R2[0], R2[1]], [R1[0], R1[1]]])}" fill="${gLit ? "#000" : RIM}" opacity="${gLit ? .12 : .1}"/>`;
    g += `<path d="${line([up(B, h), R1, up(A, h)])}" stroke="${tr}" stroke-width="2.6" fill="none" stroke-linejoin="round"/><path d="${line([R1, R2])}" stroke="${mix(rf, "#000000", .35)}" stroke-width="2.4"/>`;
    g += `<path d="${line([[A[0], A[1] - h + 1], [C[0], C[1] - h + 1]])}" stroke="${tr}" stroke-width="1.8"/>`;
    if (o.chim) { const t = o.chim, P = [R1[0] + (R2[0] - R1[0]) * t, R1[1] + (R2[1] - R1[1]) * t];
      g += `<path d="${poly([[P[0] - 4, P[1] + 4], [P[0] + 4, P[1] + 3], [P[0] + 4, P[1] - 14], [P[0] - 4, P[1] - 13]])}" fill="${T("#8a4a36")}"/><path d="${poly([[P[0] + (gLit ? 1 : -4), P[1] + 3.5], [P[0] + (gLit ? 4 : -1), P[1] + 3], [P[0] + (gLit ? 4 : -1), P[1] - 14], [P[0] + (gLit ? 1 : -4), P[1] - 13.5]])}" fill="#000" opacity=".25"/><rect x="${F(P[0] - 5)}" y="${F(P[1] - 16)}" width="10" height="3" fill="${T("#5a3426")}"/>`; }
    if (o.extra) g += o.extra(G, S, q);
    return g + `</g>`;
  };

  /* ---------- far shore across the bay ---------- */
  const f1 = wave([1, 3, 5], [280, 120, 50], [10, 5, 2.5]), f2 = wave([4, 2, 0], [340, 140, 60], [7, 4, 2]);
  const farA = x => 420 + f1(x) - Math.max(0, 1 - Math.abs(x - 1250) / 900) * 16, farB = x => 436 + f2(x);
  let far = `<path d="${ridgePath(farA, 450)}" fill="url(#hlFar1)"/>`;
  far += `<g filter="url(#hlLeafyS)" opacity=".75">${forest(farA, 1, 6, .7, .25)}</g>`;
  far += `<path d="${ridgePath(farB, 450)}" fill="url(#hlFar2)"/>`;
  far += `<g filter="url(#hlLeafyS)" opacity=".85">${forest(farB, 1, 7, .55, .25)}</g>`;
  // a far white steeple and a few houses on the far shore
  [[1120, 436], [1160, 438], [1205, 437], [1265, 439]].forEach(([x, y]) => far += `<rect x="${x}" y="${y - 6}" width="9" height="6" fill="${T(mix("#f0ead8", HZ, .45))}"/><path d="M${x - 1},${y - 6} l5.5,-4 l5.5,4Z" fill="${T(mix("#6a5a5a", HZ, .5))}"/>`);
  far += `<rect x="${WY - WY}" y="400" width="${W}" height="60" fill="url(#hlHaze)" opacity=".8"/>`;
  s += far;

  /* ---------- the water ---------- */
  s += `<rect x="0" y="${WY - 2}" width="${W}" height="${H - WY + 2}" fill="url(#hlWater)"/>`;
  s += `<g clip-path="url(#hlCW)"><g transform="matrix(1,0,0,-1,0,${WY * 2})" opacity=".4" filter="url(#hlRipple)">${far}</g></g>`;
  const reflAt = s.length;

  /* ---------- the lighthouse point (right) ---------- */
  const pw = wave([2, 5, 1], [220, 90, 40], [5, 3, 1.5]);
  const wlR = x => x < 1980 ? 482 + pw(x) * .4 : 482 + Math.pow((x - 1980) / 580, 1.5) * 128 + pw(x) * .4;
  const topR = x => { if (x < 1250) return 490; const a = Math.min(1, (x - 1250) / 200), sm = a * a * (3 - 2 * a);
    return 488 - sm * 90 + pw(x) - Math.min(1, Math.max(0, x - 1740) / 520) * 30; };
  let pt = "";
  { let d = `M1240,${F(wlR(1240))}`; for (let x = 1240; x <= W; x += 12) d += ` L${x},${F(topR(x))}`;
    d += ` L${W},${F(wlR(W))}`; for (let x = W; x >= 1240; x -= 12) d += ` L${x},${F(wlR(x))}`;
    pt += `<path d="${d}Z" fill="${T("#5e5650")}"/>`;
    let gpath = `M1240,${F(topR(1240))}`; for (let x = 1240; x <= W; x += 12) gpath += ` L${x},${F(topR(x))}`;
    for (let x = W; x >= 1240; x -= 12) gpath += ` L${x},${F(Math.min(wlR(x) - 6, topR(x) + 26 + pw(x * 2) * 3))}`;
    pt += `<path d="${gpath}Z" fill="url(#hlGrass)"/>`; }
  // far tree row along the top of the point
  pt += `<g filter="url(#hlLeafyS)">${forest(x => topR(x) - 6, 2, 11, .2, .3, 1720, W + 10)}</g>`;
  // granite ledges stepping down to the water: many faceted pieces
  { const rocks = [];
    for (let x = 1250; x < W; x += 22 + r() * 26) { const t0 = topR(x) + 24, t1 = wlR(x) - 2; if (t1 - t0 < 6) continue;
      const n = 1 + Math.floor((t1 - t0) / 34);
      for (let k = 0; k < n; k++) { const y = t0 + (k + r()) / n * (t1 - t0), R = 20 + r() * 20 + (y - 400) * .2; rocks.push([x + (r() - .5) * 14, y, R]); } }
    rocks.sort((a, b) => a[1] - b[1]);
    rocks.forEach(([x, y, R]) => { pt += granite(x, y, R * 1.3, .32 + r() * .14);
      for (let k = 0; k < 3; k++) if (r() < .5) pt += `<ellipse cx="${F(x + (r() - .5) * R)}" cy="${F(y - R * .2 - r() * R * .15)}" rx="${F(2 + r() * 4)}" ry="${F(1 + r() * 1.5)}" fill="${T(r() < .5 ? "#d8a040" : "#b8b070")}" opacity=".7"/>`; });
    // bayberry and sumac shrubs tumbling down between the ledges
    for (let x = 1290; x < W; x += 40 + r() * 70) { const y = topR(x) + 24 + r() * 16, R = 14 + r() * 14, c = r() < .5 ? ["#3a1610", "#7a2818", "#b8401e", "#e0702a"] : ["#2a3018", "#4a5228", "#7a7a3a", "#a8a058"];
      let b = ""; for (let k = 0; k < 18; k++) { const px = x + (r() * 2 - 1) * R, py = y + (r() * 2 - 1) * R * .45, v = cl(.5 - (py - y) / R + (r() - .5) * .5 + (LX < x ? -(px - x) : (px - x)) / R * .2);
        b += `<path d="${blobP(px, py, R * .3, R * .22, 6)}" fill="${T(c[Math.floor(v * 4)])}"/>`; }
      pt += `<g filter="url(#hlLeafyS)">${b}</g>`; }
    // wet dark band, weed and a lit lip along the waterline
    let wl = `M1240,${F(wlR(1240))}`; for (let x = 1240; x <= W; x += 10) wl += ` L${x},${F(wlR(x) - 2)}`;
    pt += `<path d="${wl}" stroke="${T("#3a3424")}" stroke-width="7" fill="none" opacity=".8"/><path d="${wl}" stroke="${T("#6a5a2a")}" stroke-width="2.5" fill="none" opacity=".8" transform="translate(0,-4)"/>`;
    for (let x = 1250; x < W; x += 4 + r() * 5) { const y = wlR(x) - 3; pt += `<path d="M${F(x)},${F(y)} q${F(-1 + r() * 2)},${F(-4 - r() * 4)} ${F(-2 + r() * 4)},${F(-7 - r() * 6)}" stroke="${T(r() < .5 ? "#5a5228" : "#7a6a30")}" stroke-width="1.6" fill="none"/>`; } }
  // grass tufts and asters on the point
  for (let x = 1260; x < W; x += 4 + r() * 7) { const y = topR(x) + 2 + r() * 24, hh = 5 + r() * 9;
    pt += `<path d="M${F(x)},${F(y)} q${F(-2 + r() * 4)},${F(-hh * .6)} ${F(-3 + r() * 6)},${F(-hh)}" stroke="${T(r() < .5 ? "#d0c070" : "#6a6a2a")}" stroke-width="1.5" fill="none" opacity=".8"/>`; }
  // keeper's house, oil house, picket fence, the tower
  const TX = 1500, TB = topR(1500) + 6;
  const items = [];
  items.push([TB - 1, () => house(1418, topR(1418) + 8, .5, { m: -1, wall: "#9a4a36", roof: "#3a3a40", trim: "#d8c8b0", gw: 40, sw: 44, h: 34, rh: 20, wins: [.5] })]);
  items.push([TB + 2, () => house(1608, TB + 2, .95, { m: 1, wall: "#f4eee2", roof: "#9a3a2a", gw: 50, sw: 92, h: 56, rh: 30, wins: [.2, .5, .8], chim: .25, shut: "#2a3a32" })]);
  items.push([TB, () => {
    let g = `<ellipse cx="${TX + 30}" cy="${TB + 2}" rx="70" ry="6" fill="#000" opacity=".2"/>`;
    g += `<path d="M1466,${TB} L1476,192 L1524,192 L1534,${TB}Z" fill="url(#hlTower)"/>`;
    for (let y = TB - 14; y > 200; y -= 15) { const t = (TB - y) / (TB - 192), hw = 34 - t * 10;
      g += `<path d="M${F(TX - hw)},${F(y)} Q${TX},${F(y + 4)} ${F(TX + hw)},${F(y)}" stroke="#000" stroke-width="1" fill="none" opacity=".07"/>`; }
    g += `<path d="M1468,${TB - 10} L1476,196" stroke="${RIM}" stroke-width="2" opacity=".5"/>`;
    [[318, 1494], [252, 1497]].forEach(([wy, wx]) => { const lit = NIGHT;
      g += `<rect x="${wx - 1}" y="${wy - 1}" width="10" height="17" rx="4" fill="${T("#e8e2d8")}"/><rect x="${wx}" y="${wy}" width="8" height="15" rx="3.5" fill="${lit ? LAMP : T("#2a2e38")}"/>`; });
    // entry vestibule
    g += `<path d="${poly([[1446, TB + 2], [1446, TB - 26], [1470, TB - 28], [1470, TB + 1]])}" fill="${T("#f4efe4")}"/><path d="${poly([[1442, TB - 25], [1458, TB - 40], [1474, TB - 28]])}" fill="${T("#2e3036")}"/><rect x="1452" y="${TB - 20}" width="10" height="20" fill="${NIGHT ? mix(LAMP, "#5a3424", .3) : T("#5a2a22")}"/>`;
    // gallery, railing, lantern, cap
    g += `<path d="M1470,192 L1474,198 L1526,198 L1530,192Z" fill="${T("#2a2c32")}"/><rect x="1462" y="186" width="76" height="7" fill="${T("#24262c")}"/><rect x="1462" y="186" width="30" height="2" fill="${RIM}" opacity=".4"/>`;
    for (let k = 0; k <= 12; k++) { const a = k / 12 * Math.PI, x = TX - Math.cos(a) * 37; g += `<rect x="${F(x - .7)}" y="170" width="1.4" height="16" fill="${T("#2a2c32")}"/>`; }
    g += `<path d="M1463,170 L1537,170 M1463,178 L1537,178" stroke="${T("#2a2c32")}" stroke-width="2"/>`;
    g += `<rect x="1478" y="174" width="44" height="12" fill="url(#hlCap)"/>`;
    g += `<rect x="1480" y="150" width="40" height="25" fill="${NIGHT ? "#fff0b8" : T("#9ab2c4")}"/>`;
    if (!NIGHT) g += `<path d="M1482,172 L1494,152 L1500,152 L1488,172Z" fill="#e8f2f8" opacity=".55"/><rect x="1506" y="150" width="14" height="25" fill="#000" opacity=".2"/>`;
    else g += `<rect x="1486" y="154" width="28" height="18" fill="#ffffff" opacity=".8"/>`;
    for (let k = 0; k <= 6; k++) { const a = k / 6 * Math.PI, x = TX - Math.cos(a) * 20; g += `<rect x="${F(x - 1)}" y="150" width="2" height="25" fill="${T("#1e2026")}"/>`; }
    g += `<path d="M1474,152 Q1478,128 1500,123 Q1522,128 1526,152Z" fill="url(#hlCap)"/><path d="M1477,150 Q1481,131 1498,125" stroke="${RIM}" stroke-width="1.6" fill="none" opacity=".6"/>`;
    g += `<rect x="1472" y="150" width="56" height="3" fill="${T("#1a1c22")}"/><circle cx="1500" cy="120" r="5" fill="url(#hlCap)"/><path d="M1500,115 L1500,100" stroke="${T("#1a1c22")}" stroke-width="1.6"/>`;
    return g; }]);
  // picket fence along the crest
  items.push([TB + 14, () => { let g = ""; const x0 = 1380, x1 = 1780;
    for (let x = x0; x <= x1; x += 7) { const y = topR(x) + 16; g += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - 11)} L${F(x + 1.5)},${F(y - 13)} L${F(x + 3)},${F(y - 11)} L${F(x + 3)},${F(y)}Z" fill="${T("#f4f0e8")}"/><rect x="${F(x + 2)}" y="${F(y - 11)}" width="1" height="11" fill="#000" opacity=".15"/>`; }
    let a = `M${x0},${F(topR(x0) + 12)}`, b = `M${x0},${F(topR(x0) + 6)}`; for (let x = x0; x <= x1; x += 20) { a += ` L${x},${F(topR(x) + 12)}`; b += ` L${x},${F(topR(x) + 6)}`; }
    return g + `<path d="${a} ${b}" stroke="${T("#e8e2d8")}" stroke-width="1.6" fill="none"/>`; }]);
  // cottages and trees on the rest of the point
  items.push([topR(1960) + 26, () => house(1960, topR(1960) + 26, .78, { m: -1, wall: "#9a9a94", roof: "#3e4048", gw: 44, sw: 70, h: 40, wins: [.3, .7], chim: .6 })]);
  items.push([topR(2330) + 30, () => house(2330, topR(2330) + 30, .86, { m: 1, wall: "#d2a448", roof: "#4a3e3a", gw: 46, sw: 74, h: 40, wins: [.25, .55, .82], chim: .3, shut: "#2a3a2a" })]);
  const MAPLE = ["#4a1810", "#6e2216", "#94301c", "#b8401e", "#d65a22", "#ea7a2a", "#f4a03a", "#fcc860"];
  const ORANGE = ["#5a2810", "#7e3a16", "#a44e1c", "#c86a22", "#e0862a", "#f0a232", "#f8c04a", "#fde08a"];
  const GOLD = ["#5a4a14", "#7a6418", "#9a7e1e", "#b89a26", "#d4b232", "#e8c840", "#f4dc62", "#fcee9a"];
  const RAMPS = [MAPLE, ORANGE, GOLD, MAPLE];
  for (let x = 1730; x < W + 20; x += 30 + r() * 40) {
    if (Math.abs(x - 1960) < 52 || Math.abs(x - 2330) < 58) continue;
    const y = topR(x) + 10 + r() * 30, h = (60 + r() * 60) * (1 + (y - 400) / 300);
    if (r() < .38) items.push([y, () => conifer(x, y, h * 1.15)]);
    else { const R = RAMPS[Math.floor(r() * 4)]; items.push([y, () => leafTree(x, y, h, 140, R)]); }
  }
  items.sort((a, b) => a[0] - b[0]);
  items.forEach(([, f]) => pt += f());

  /* ---------- the village hill (left) ---------- */
  const vw = wave([3, 1, 4], [260, 110, 45], [10, 5, 2]);
  const vh = x => 342 + vw(x) + Math.pow(Math.max(0, x - 620) / 420, 2) * 140;
  const wlL = x => 500 + Math.sin(x / 90) * 1.5;
  const vb = x => 314 + vw(x * 1.3 + 400) * .8 + Math.pow(Math.max(0, x - 380) / 420, 2) * 150;
  let vg = `<path d="${ridgePath(vb, 520, 0, 900)}" fill="url(#hlBack)"/>`;
  vg += `<g filter="url(#hlLeafyS)">${forest(vb, 2, 10, .32, .22, -10, 860)}</g>`;
  vg += `<rect x="0" y="300" width="1000" height="70" fill="url(#hlHaze)" opacity=".55"/>`;
  { let d = `M0,${F(wlL(0) + 4)} L0,${F(vh(0))}`; let x = 0;
    for (; x <= 1100 && vh(x) < wlL(x); x += 12) d += ` L${x},${F(vh(x))}`;
    d += ` L${x},${F(wlL(x) + 4)} L0,${F(wlL(0) + 4)}Z`;
    vg += `<path d="${d}" fill="url(#hlHill)"/>`; }
  vg += `<g filter="url(#hlLeafyS)">${forest(vh, 2, 13, .1, .18, -10, 820)}</g>`;
  // a lane climbing the hill
  vg += `<path d="M620,${F(wlL(620) - 6)} C520,470 300,468 200,446 C120,428 80,420 0,416" stroke="${T("#c8b48a")}" stroke-width="7" fill="none" opacity=".85"/><path d="M620,${F(wlL(620) - 6)} C520,470 300,468 200,446 C120,428 80,420 0,416" stroke="${T("#8a7454")}" stroke-width="1.5" fill="none" opacity=".6" transform="translate(0,4)"/>`;
  const PAL = [["#f2ece0", "#3e4048", "#2a3a32"], ["#9a3a2a", "#3e3a3a", null], ["#d2a448", "#4a3e3a", "#2a3a2a"], ["#6a8098", "#3a3e46", "#f4f0e6"], ["#a8aaa4", "#4a4448", null], ["#8a9a78", "#3e3e44", "#f4f0e6"], ["#f2ece0", "#5a3a2e", "#5a1e1a"], ["#e8e0cc", "#2e3036", "#2a2e3a"]];
  const vit = [];
  for (let row = 0; row < 4; row++) { const sc = .44 + row * .15, off = 30 + row * 34;
    for (let x = 30 + r() * 60; x < 1000; x += (90 + row * 36) * (.85 + r() * .5)) {
      const y = vh(x) + off; if (y > wlL(x) - 12) continue;
      const P = PAL[Math.floor(r() * PAL.length)], m = r() < .5 ? 1 : -1, tall = r() < .3;
      vit.push([y, () => house(x, y, sc, { m, wall: P[0], roof: P[1], shut: P[2], h: tall ? 56 : 38, gw: 40 + r() * 10, sw: 58 + r() * 22, wins: tall ? [.25, .55, .82] : [.3, .7], chim: r() < .6 ? .3 + r() * .4 : 0 })]);
    } }
  for (let k = 0; k < 46; k++) { const x = r() * 1020, top = vh(x) + 14, bot = wlL(x) - 6; if (bot - top < 10) continue;
    const y = top + r() * (bot - top), h = 40 + (y - 340) * .55 + r() * 30;
    if (r() < .25) vit.push([y, () => conifer(x, y, h * 1.1)]);
    else { const R = RAMPS[Math.floor(r() * 4)]; vit.push([y, () => leafTree(x, y, h, 80 + Math.floor(h), R)]); } }
  vit.sort((a, b) => a[0] - b[0]);
  vit.forEach(([, f]) => vg += f());
  // seawall of granite blocks along the village shore
  for (let x = 0; x < 660; x += 18 + r() * 10) { const y = wlL(x) - 4 + r() * 4, w = 16 + r() * 10, hh = 7 + r() * 4, c = GR[1 + Math.floor(r() * 2)];
    vg += `<rect x="${F(x)}" y="${F(y - hh)}" width="${F(w)}" height="${F(hh)}" rx="1.5" fill="${T(c)}"/><rect x="${F(x)}" y="${F(y - hh)}" width="${F(w)}" height="1.6" fill="${T(GR[3])}" opacity=".7"/>`; }
  vg += `<path d="M0,${F(wlL(0) + 1)} L1080,${F(wlL(1080) + 1)}" stroke="${T("#3a3424")}" stroke-width="4" opacity=".6"/>`;

  /* reflections of the point and the village, then the shores themselves */
  const refl = `<g clip-path="url(#hlC482)"><g transform="matrix(1,0,0,-1,0,964)" opacity=".3" filter="url(#hlRipple)">${pt}</g></g>` +
               `<g clip-path="url(#hlC500)"><g transform="matrix(1,0,0,-1,0,1000)" opacity=".3" filter="url(#hlRipple)">${vg}</g></g>`;
  let wtr = refl;
  // wind ripples and sparkle
  for (let k = 0; k < 170; k++) { const y = WY + 6 + Math.pow(r(), .8) * (H - WY - 6), t = (y - WY) / (H - WY);
    wtr += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(30 + r() * 150 * (.4 + t))}" height="${F(1 + t * 1.5)}" rx="1" fill="${NIGHT ? (r() < .5 ? "#8a9ad0" : "#1a2448") : (r() < .55 ? "#e8f2f6" : "#2a4a62")}" opacity="${F(.08 + r() * .14)}"/>`; }
  wtr += `<g filter="url(#hlRipple)">`;
  for (let y = WY + 3; y < H; y += 3 + (y - WY) * .02) { const t = (y - WY) / (H - WY), w = 50 + t * 260, n = 2 + Math.floor(t * 6);
    for (let k = 0; k < n; k++) { const off = (r() * 2 - 1) * w * Math.pow(r(), .6), L = 10 + r() * (30 + t * 70);
      wtr += `<rect x="${F(LX + off - L / 2)}" y="${F(y)}" width="${F(L)}" height="${F(1.3 + t * 2)}" rx="1" fill="${NIGHT ? "#dce6ff" : "#fff8e0"}" opacity="${F((.75 - Math.abs(off) / w * .5) * (1 - t * .4))}"/>`; } }
  wtr += `</g>`;
  if (NIGHT) for (let k = 0; k < 18; k++) { const x = 40 + rl() * 900, y = 504 + rl() * 10;
    wtr += `<rect x="${F(x)}" y="${F(y)}" width="${F(3 + rl() * 4)}" height="${F(20 + rl() * 50)}" fill="${LAMP}" opacity="${F(.12 + rl() * .2)}" filter="url(#hlRipple)"/>`; }
  s = s.slice(0, reflAt) + wtr + s.slice(reflAt);
  s += pt + vg;

  /* ---------- the wharf, fish shack, traps and buoys ---------- */
  { const FE0 = [640, 492], FE1 = [1000, 534], NE0 = [608, 506], NE1 = [962, 558];
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    s += `<path d="${poly([NE0, NE1, [NE1[0] + 30, NE1[1] + 22], [NE0[0] + 30, NE0[1] + 14]])}" fill="#000" opacity=".22"/>`;
    for (let t = 0; t <= 1.001; t += .06) { const p = lerp(NE0, NE1, t), q2 = lerp(FE0, FE1, t), len = 14 + t * 18;
      s += `<rect x="${F(q2[0] - 2)}" y="${F(q2[1])}" width="3.5" height="${F(len * .7)}" fill="${T("#3a2c22")}"/>`;
      s += `<rect x="${F(p[0] - 3)}" y="${F(p[1] + 6)}" width="${F(4 + t * 3)}" height="${F(len)}" fill="${T("#4a3828")}"/><rect x="${F(p[0] - 3)}" y="${F(p[1] + 6)}" width="1.6" height="${F(len)}" fill="${T("#8a7050")}" opacity=".8"/>`;
      s += `<rect x="${F(p[0] - 3)}" y="${F(p[1] + 6 + len - 6)}" width="${F(4 + t * 3)}" height="6" fill="${T("#2a3a2a")}" opacity=".7"/>`; }
    s += `<path d="${poly([NE0, NE1, [NE1[0], NE1[1] + 7], [NE0[0], NE0[1] + 6]])}" fill="${T("#5a4430")}"/>`;
    s += `<path d="${poly([FE0, FE1, NE1, NE0])}" fill="${T("#9a8064")}"/>`;
    for (let t = .02; t < 1; t += .028) { const a = lerp(FE0, FE1, t), b = lerp(NE0, NE1, t); s += `<path d="${line([a, b])}" stroke="${T("#6a5440")}" stroke-width="1"/>`; }
    s += `<path d="${line([NE0, NE1])}" stroke="${RIM}" stroke-width="1.4" opacity=".5"/>`;
    // the fish shack near the end, hung with buoys
    const BUOY = ["#e0402a", "#f4d040", "#3a8ac8", "#f4f0e8", "#3aa060", "#e87a2a"];
    s += house(918, 536, .82, { m: -1, wall: "#9a3a2a", roof: "#3a3a40", trim: "#e8e0d0", gw: 52, sw: 66, h: 40, rh: 24, wins: [.5], extra: (G, S2, q) => {
      let e = "";
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const u = .14 + i * .22 + (j % 2) * .06, v = .82 - j * .26, c = S2(u, v), bc = BUOY[(i * 3 + j * 2) % BUOY.length], bc2 = BUOY[(i + j + 3) % BUOY.length];
        e += `<path d="M${F(c[0])},${F(c[1] - 6)} v-3" stroke="${T("#2a2a2a")}" stroke-width=".8"/><rect x="${F(c[0] - 3)}" y="${F(c[1] - 6)}" width="6" height="13" rx="3" fill="${T(bc)}"/><rect x="${F(c[0] - 3)}" y="${F(c[1] - 1)}" width="6" height="3" fill="${T(bc2)}"/><rect x="${F(c[0] - 3)}" y="${F(c[1] - 6)}" width="2" height="13" rx="1" fill="#fff" opacity=".35"/>`; }
      return e; } });
    // stacked lobster traps on the wharf
    const trap = (x, y, c) => `<rect x="${F(x)}" y="${F(y - 10)}" width="17" height="10" fill="${T(c)}"/><rect x="${F(x)}" y="${F(y - 10)}" width="17" height="2" fill="${T(mix(c, "#ffffff", .35))}"/><path d="M${F(x + 4)},${F(y - 10)} v10 M${F(x + 8.5)},${F(y - 10)} v10 M${F(x + 13)},${F(y - 10)} v10 M${F(x)},${F(y - 5)} h17" stroke="${T(mix(c, "#000000", .35))}" stroke-width=".8"/><rect x="${F(x + 12)}" y="${F(y - 10)}" width="5" height="10" fill="#000" opacity=".18"/>`;
    [[790, 524, "#3a6a4a"], [808, 526, "#c8a830"], [799, 516, "#3a6a4a"], [826, 528, "#b8402a"], [817, 518, "#c8a830"], [740, 518, "#3a6a4a"], [757, 520, "#3a6a4a"], [748, 510, "#b8402a"]].forEach(([x, y, c]) => s += trap(x, y, c));
    // bollard, coil of rope, a lamp post on the end of the wharf
    s += `<rect x="985" y="530" width="6" height="10" rx="2" fill="${T("#2a2a2e")}"/><ellipse cx="868" cy="546" rx="8" ry="3" fill="none" stroke="${T("#c8b080")}" stroke-width="2.4"/>`;
    s += `<rect x="976" y="486" width="3" height="48" fill="${T("#2a2a2e")}"/><path d="M972,486 h11 l-2,-8 h-7Z" fill="${NIGHT ? LAMP : T("#3a3a40")}"/>`;
    if (NIGHT) s += `<circle cx="977" cy="484" r="60" fill="url(#hlGlow)" opacity=".7"/><ellipse cx="985" cy="600" rx="18" ry="60" fill="${LAMP}" opacity=".18" filter="url(#hlRipple)"/>`;
    // a gull on a piling, one on the shack roof
    const perch = (x, y, k) => `<ellipse cx="${F(x)}" cy="${F(y - 6 * k)}" rx="${F(7 * k)}" ry="${F(4 * k)}" fill="${T("#f8f6f0")}"/><path d="M${F(x - 7 * k)},${F(y - 7 * k)} q${F(8 * k)},${F(-3 * k)} ${F(14 * k)},${F(1 * k)} l${F(3 * k)},${F(2 * k)} q${F(-8 * k)},${F(2 * k)} ${F(-14 * k)},0Z" fill="${T("#9a9ea8")}"/><path d="M${F(x + 9 * k)},${F(y - 5 * k)} l${F(4 * k)},${F(1 * k)}" stroke="${T("#2a2a30")}" stroke-width="${F(2 * k)}"/><circle cx="${F(x - 6 * k)}" cy="${F(y - 11 * k)}" r="${F(3.4 * k)}" fill="${T("#fbfaf6")}"/><path d="M${F(x - 9 * k)},${F(y - 11 * k)} l${F(-4 * k)},${F(1 * k)}" stroke="${T("#e8b030")}" stroke-width="${F(1.4 * k)}"/><path d="M${F(x - 1 * k)},${F(y - 2 * k)} v${F(3 * k)} M${F(x + 2 * k)},${F(y - 2 * k)} v${F(3 * k)}" stroke="${T("#e09060")}" stroke-width="1"/>`;
    const pe = lerp(NE0, NE1, 1.0); s += perch(pe[0] - 1, pe[1] + 5, 1);
    s += perch(700, 500, .8);
  }

  /* ---------- lobster boats at their moorings ---------- */
  const boat = (x, y, s2, d, hull) => {
    const g = `<path d="M-80,-24 Q0,-29 86,-40 Q0,-35 -76,-30Z" fill="${T("#8a8274")}"/>` +
      `<path d="M-80,-24 Q0,-29 86,-40 Q76,-18 58,0 L-74,0 Q-79,-10 -80,-24Z" fill="${T(hull)}"/>` +
      `<path d="M-79,-14 Q0,-16 80,-24 Q72,-10 58,0 L-74,0 Q-78,-6 -79,-14Z" fill="#000" opacity=".14"/>` +
      `<path d="M-79,-21 Q0,-25.5 84,-36" stroke="${RIM}" stroke-width="2" fill="none" opacity=".5"/>` +
      `<path d="M-75,-5 L60,-5 Q59,-2 57,0 L-74,0Z" fill="${T("#a8302a")}"/>` +
      `<path d="M-80,-24 Q0,-29 86,-40" stroke="${T("#3a3a3e")}" stroke-width="3" fill="none"/>` +
      `<path d="${poly([[4, -30], [46, -34], [46, -68], [4, -65]])}" fill="${T("#f4f0e8")}"/><path d="${poly([[46, -34], [54, -36], [54, -68], [46, -68]])}" fill="${T("#c8c4bc")}"/>` +
      `<path d="${poly([[0, -64], [50, -69], [58, -70], [8, -66]])}" fill="${T("#4a4a50")}"/><path d="${poly([[0, -66], [58, -71], [58, -74], [0, -69]])}" fill="${T("#e8e4dc")}"/>` +
      [[8, 18], [21, 31], [34, 43]].map(([a, b]) => `<path d="${poly([[a, -60 - a * .08], [b, -61 - b * .08], [b, -48 - b * .08], [a, -47 - a * .08]])}" fill="${NIGHT && a === 21 ? LAMP : T("#2a3a4a")}"/>`).join("") +
      `<path d="${poly([[47, -62], [53, -63], [53, -50], [47, -49]])}" fill="${T("#3a4a5a")}"/>` +
      `<path d="M22,-72 L22,-104 M14,-96 L30,-97" stroke="${T("#2a2a30")}" stroke-width="2"/><rect x="14" y="-88" width="16" height="5" rx="2" fill="${T("#e8e4dc")}"/>` +
      (NIGHT ? `<circle cx="22" cy="-105" r="3" fill="#fff8e0"/><circle cx="22" cy="-105" r="16" fill="url(#hlGlow)" opacity=".6"/>` : "") +
      `<rect x="-66" y="-44" width="18" height="12" fill="${T("#3a6a4a")}"/><rect x="-46" y="-42" width="18" height="11" fill="${T("#c8a830")}"/><rect x="-60" y="-54" width="18" height="11" fill="${T("#3a6a4a")}"/>` +
      `<path d="M-62,-44 v12 M-56,-44 v12 M-42,-42 v11 M-36,-42 v11 M-55,-54 v11" stroke="#000" stroke-width=".8" opacity=".3"/>` +
      `<path d="M-10,-32 L-10,-46 L-2,-46" stroke="${T("#2a2a30")}" stroke-width="2.4" fill="none"/>`;
    const tr = `translate(${F(x)},${F(y)}) scale(${F(d * s2)},${F(s2)})`;
    let b = `<g transform="translate(${F(x)},${F(y)}) scale(${F(d * s2)},${F(-s2 * .9)})" opacity=".35" filter="url(#hlRipple)">${g}</g>`;
    b += `<ellipse cx="${F(x)}" cy="${F(y + 1)}" rx="${F(80 * s2)}" ry="${F(3 * s2)}" fill="#000" opacity=".2"/><g transform="${tr}">${g}</g>`;
    b += `<path d="M${F(x - 70 * s2)},${F(y + 2)} q${F(70 * s2)},${F(4 * s2)} ${F(140 * s2)},0" stroke="${NIGHT ? "#8a9ad0" : "#eef6f8"}" stroke-width="1.4" fill="none" opacity=".5"/>`;
    b += `<circle cx="${F(x + d * 110 * s2)}" cy="${F(y - 2 * s2)}" r="${F(5 * s2)}" fill="${T("#f4f0e8")}"/><path d="M${F(x + d * 86 * s2)},${F(y - 36 * s2)} Q${F(x + d * 100 * s2)},${F(y - 10 * s2)} ${F(x + d * 110 * s2)},${F(y - 4 * s2)}" stroke="${T("#5a4a3a")}" stroke-width="1" fill="none"/>`;
    return b;
  };
  s += boat(1150, 508, .38, 1, "#f2efe8") + boat(1272, 470, .2, -1, "#f2efe8") + boat(1800, 520, .5, -1, "#2e5a4a") + boat(1330, 552, .66, -1, "#f2efe8") + boat(760, 600, .62, 1, "#2a3e5e") + boat(1080, 620, .9, 1, "#f2efe8");

  /* night: lamp glow and soft beams from the lighthouse */
  if (NIGHT) {
    s += `<circle cx="1500" cy="162" r="120" fill="url(#hlGlow)" opacity=".9"/><circle cx="1500" cy="162" r="30" fill="#fff6d0" opacity=".5"/>`;
    s += `<g filter="url(#hlSoft)"><path d="M1500,158 L780,108 L790,196 Z" fill="url(#hlBeamL)"/><path d="M1500,162 L2150,190 L2140,250 Z" fill="url(#hlBeamR)" opacity=".7"/></g>`;
    s += `<ellipse cx="1500" cy="560" rx="16" ry="90" fill="${LAMP}" opacity=".16" filter="url(#hlRipple)"/>`;
  }

  /* ---------- foreground granite and kelp, corners ---------- */
  const fg = [];
  for (let k = 0; k < 22; k++) { const x = 1920 + r() * 680, y = Math.max(wlR(x) + 20, 610) + r() * 100, R = 26 + r() * 46; fg.push([x, y, R]); }
  for (let k = 0; k < 14; k++) { const x = -20 + r() * 520, y = 650 + r() * 80, R = 24 + r() * 44; fg.push([x, y, R]); }
  fg.sort((a, b) => a[1] - b[1]);
  fg.forEach(([x, y, R]) => {
    s += `<path d="${blobP(x, y + R * .22, R * 1.1, R * .22, 9)}" fill="${T("#3a3418")}"/>`;
    for (let k = 0; k < R / 3; k++) { const px = x - R + r() * R * 2, py = y + R * .12 + r() * R * .14;
      s += `<path d="${blobP(px, py, 3 + r() * 4, 2 + r() * 2, 5)}" fill="${T(r() < .5 ? "#6a5a24" : "#8a7a30")}"/>`; }
    s += granite(x, y, R * 1.15, .44); });
  // traps and buoys left on the near rocks, a bushy sumac on the right
  s += `<g transform="translate(2140,640)"><rect x="0" y="-22" width="38" height="22" fill="${T("#c8a830")}"/><rect x="0" y="-22" width="38" height="4" fill="${T("#f0d870")}"/><path d="M9,-22 v22 M19,-22 v22 M29,-22 v22 M0,-11 h38" stroke="${T("#6a5a1a")}" stroke-width="1.2"/><rect x="28" y="-22" width="10" height="22" fill="#000" opacity=".2"/></g>`;
  s += `<rect x="2196" y="626" width="9" height="20" rx="4.5" fill="${T("#e0402a")}"/><rect x="2196" y="633" width="9" height="5" fill="${T("#f4f0e8")}"/><path d="M2200,626 v-10" stroke="${T("#3a3a3a")}" stroke-width="2"/>`;
  [[2470, 640, 90], [70, 690, 70]].forEach(([x, y, R]) => {
    let b = ""; const cs = [];
    for (let i = 0; i < 260 && cs.length < 90; i++) { const px = x + (r() * 2 - 1) * R, py = y + (r() * 2 - 1) * R * .6; if (((px - x) / R) ** 2 + ((py - y) / (R * .6)) ** 2 > 1) continue;
      const lit = ((LX < x ? -1 : 1) * (px - x) / R * .5 - (py - y) / (R * .6) * .6) * .5 + .5; cs.push([px, py, cl(lit * .85 + (r() - .5) * .3)]); }
    cs.sort((a, b2) => a[2] - b2[2]);
    b += `<path d="${blobP(x + 6, y + 6, R, R * .6)}" fill="${T("#3a1610")}"/>`;
    cs.forEach(([px, py, v]) => b += `<path d="${blobP(px, py, R * .15, R * .11, 6)}" fill="${T(MAPLE[Math.floor(v * 8)])}"/>`);
    s += `<g filter="url(#hlLeafyS)">${b}</g>`; });

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#hlLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#hlPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
