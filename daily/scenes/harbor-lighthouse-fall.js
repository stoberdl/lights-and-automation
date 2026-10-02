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
    <clipPath id="hlCPt"><rect x="1200" y="0" width="1360" height="${H}"/></clipPath>
    <linearGradient id="hlFaceR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NIGHT ? "#141826" : "#3e3a36"}" stop-opacity=".55"/><stop offset=".5" stop-color="${NIGHT ? "#141826" : "#4a4640"}" stop-opacity=".35"/><stop offset="1" stop-color="${NIGHT ? "#141826" : "#4a4640"}" stop-opacity="0"/></linearGradient>
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
  const conifer = (x, y, h, fog = 0) => {
    const sd = LX < x ? -1 : 1; let g = "", Tf = c => T(mix(c, HZ, fog));
    const trunk = Tf("#3e2a1e"), dark = Tf("#16261c"), mid = Tf("#22382a"), lit = Tf("#3a5a3a"), hl = Tf("#a8b070");
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

  /* boulders seen side-on: flat waterline base, rounded top, lit cap toward the light, shaded
     lower front, rockweed at the base, a reflection straight below; width scales with baseline */
  const GR = ["#4a403c", "#86766a", "#b4a290", "#e6d4bc"];
  const boulder = (x, y, w, hh) => {
    const ls = LX < x ? -1 : 1, n = 10, P = [[x - w / 2, y]];
    for (let k = 1; k < n; k++) { const t = k / n; P.push([x - w / 2 + w * t + (r() - .5) * w * .05, y - Math.pow(Math.sin(Math.PI * t), .55) * hh * (.86 + r() * .2)]); }
    P.push([x + w / 2, y]);
    let g = `<path d="${poly(P.map(([px, py]) => [px, y + (y - py) * .7]))}" fill="${T(NIGHT ? "#0a0e1c" : "#2a3a44")}" opacity=".38" filter="url(#hlRipple)"/>`;
    g += `<ellipse cx="${F(x)}" cy="${F(y + 1)}" rx="${F(w * .56)}" ry="${F(Math.max(2, w * .03))}" fill="#000" opacity=".25"/>`;
    g += `<path d="${poly(P)}" fill="${T(mix(GR[1], GR[2], r() * .3))}"/>`;
    const top = P.slice(1, n), lit = top.filter(([px]) => (px - x) * ls > -w * .3);
    g += `<path d="${poly([...lit, ...lit.slice().reverse().map(([px, py]) => [px - ls * w * .03, py + hh * .26])])}" fill="${T(GR[2])}"/>`;
    const hi = lit.filter(([px]) => (px - x) * ls > w * .05);
    if (hi.length > 1) g += `<path d="${poly([...hi, ...hi.slice().reverse().map(([px, py]) => [px, py + hh * .09])])}" fill="${T(GR[3])}" opacity=".8"/>`;
    g += `<path d="${poly(P.map(([px, py]) => [px, Math.max(py, y - hh * .4)]))}" fill="${T(GR[0])}" opacity=".5"/>`;
    const dk = P.filter(([px]) => (px - x) * ls < -w * .22);
    g += `<path d="${poly([...dk, [x - ls * w * .22, y]])}" fill="${T(GR[0])}" opacity=".45"/>`;
    g += `<path d="M${F(x + (r() - .5) * w * .3)},${F(y - hh * .75)} l${F((r() - .5) * w * .1)},${F(hh * .4)} l${F((r() - .5) * w * .1)},${F(hh * .25)}" stroke="${T(GR[0])}" stroke-width="1.3" fill="none" opacity=".6"/>`;
    g += `<rect x="${F(x - w / 2)}" y="${F(y - Math.max(3, hh * .12))}" width="${F(w)}" height="${F(Math.max(3, hh * .12))}" fill="${T("#3a3418")}" opacity=".75"/>`;
    for (let k = 0; k < w / 6; k++) { const px = x - w * .48 + r() * w * .96; g += `<path d="M${F(px)},${F(y)} q${F(-1 + r() * 2)},${F(-hh * .1)} ${F(-2 + r() * 4)},${F(-hh * (.12 + r() * .12))}" stroke="${T(r() < .5 ? "#6a5a24" : "#8a7a30")}" stroke-width="${F(1.2 + w * .008)}" fill="none"/>`; }
    return g; };

  /* ================= the 3D world: everything built, growing or floating =================
     One camera (eye 5 m above the water, horizon on WY) projects every object, so sizes,
     convergence, occlusion and reflections are computed, not drawn by eye. Metres:
     x right, y up, z away; sea level y = 0. See world3d() in reference/scene-helpers.js. */
  const w = world3d({ h: 5, hy: WY, f: 2200, light: [-.62, .6, -.25], tone: T, fog: "#ecd8b8", fogK: .0009,
    shadow: NIGHT ? "#04060e" : "#3a3048", rim: RIM, shade: .5, hi: .25, night: NIGHT, lamp: LAMP });
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const n2 = (x, z) => Math.sin(x / 23 + 1.3) * Math.sin(z / 31 + .7) + .5 * Math.sin(x / 9.7 + z / 13.1 + 2) + .25 * Math.sin(x / 4.1 - z / 5.3);
  const face = (x, z) => Math.atan2(-x, z) * 180 / Math.PI;      // yaw that turns a front toward the viewer

  /* the lighthouse point (right): a granite headland, rock ledges into the water, a grassy top */
  const shoreP = x => 170 + 6 * Math.sin(x / 11 + 1) + 3 * Math.sin(x / 4.3) + (x < 6 ? Math.pow(6 - x, 1.5) * 4 : 0);
  const edgeP = z => -8 + (z - 200) * .12;
  const dP = (x, z) => Math.min(z - shoreP(x), (x - edgeP(z)) * 1.4);
  const hP = (x, z) => { const d = dP(x, z); if (d < 0) return d * .3 - .4;
    const top = 6 + 1.6 * Math.sin(x / 37 + .5) + 1.1 * n2(x, z) + Math.max(0, x - 50) * .05;
    return top * sm(d / 38) + (d < 24 ? Math.max(0, n2(x * 1.3, z * 1.1)) * 1.2 * (1 - d / 24) : 0); };
  /* the village hill (left), rising away from its own shore */
  const shoreV = x => 285 + 8 * Math.sin(x / 17) + 4 * Math.sin(x / 6.1 + 1) - Math.max(0, -150 - x) * .5;
  const edgeV = z => -32 - (z - 285) * .06;
  const dV = (x, z) => Math.min(z - shoreV(x), (edgeV(z) - x) * 1.3);
  const hV = (x, z) => { const d = dV(x, z); if (d < 0) return d * .3 - .4;
    return (1.8 + 44 * (1 - Math.exp(-d / 240)) + Math.max(0, -x - 90) * .05 * sm(d / 60) + 1.8 * n2(x, z) * sm(d / 30)) * sm(d / 6); };
  const GRASS = ["#9a9448", "#a6a052", "#8a8a3c", "#b2a858", "#86843e"], BRACK = ["#b0702a", "#9a5a24", "#c08a3a"];
  const ground = (fieldy) => (x, y, z, n) => { const k = Math.max(0, Math.min(.999, .5 + .32 * n2(x * 1.7 + 40, z * 1.3) + (r() - .5) * .18));
    if (y < .8) return mix("#3a3424", "#54482e", k);                                   // wet rockweed band
    if (y < 1.7 || n[1] < .6) return mix(mix(GR[1], GR[2], k * .8), "#7a7448", y > 2 && n[1] > .7 ? .5 : 0);   // granite
    if (n2(x * .7, z * .5) > .95) return BRACK[Math.floor(r() * 3)];                   // bracken in autumn
    return mix(GRASS[Math.floor(k * GRASS.length)], fieldy, sm((z - 400) / 500) * .5); };
  w.terrain({ x0: z => edgeP(z) - 6, x1: z => z * .62 + 30, z0: 150, z1: 1100, nx: 96, nz: 56, h: hP, col: ground("#6a6a34"), shade: .3 });
  w.terrain({ x0: z => -z * .62 - 30, x1: z => edgeV(z) + 6, z0: 230, z1: 1100, nx: 96, nz: 50, h: hV, col: ground("#5e6430"), shade: .3 });

  /* a solid on uneven ground sits on the highest corner; a stone foundation fills down to the lowest */
  const onGround = (o, hf) => { const { P } = w.frame({ ...o, y: 0 }), c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => P([a * o.w / 2, 0, b * o.d / 2]));
    const hs = c.map(p => hf(p[0], p[2])), top = Math.max(...hs), low = Math.min(...hs);
    return { ...o, y: top, fy: low - top - .3 }; };
  const ok = [];                                   // footprints already used: [x, z, radius]
  const free = (x, z, R) => ok.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);

  /* trees: painterly sprites standing on the terrain, scaled and hazed by distance */
  const MAPLE = ["#4a1810", "#6e2216", "#94301c", "#b8401e", "#d65a22", "#ea7a2a", "#f4a03a", "#fcc860"];
  const ORANGE = ["#5a2810", "#7e3a16", "#a44e1c", "#c86a22", "#e0862a", "#f0a232", "#f8c04a", "#fde08a"];
  const GOLD = ["#5a4a14", "#7a6418", "#9a7e1e", "#b89a26", "#d4b232", "#e8c840", "#f4dc62", "#fcee9a"];
  const RAMPS = [MAPLE, ORANGE, GOLD, MAPLE];
  const tree = (x, z, hf, hM, conif) => { const R = RAMPS[Math.floor(r() * 4)];
    w.sprite({ x, z, y: hf(x, z) - .3, fn: (sx, sy, k, fog) => {
      const hp = hM * k;
      if (conif) return conifer(sx, sy, hp * 1.1, fog * .9);
      const ramp = R.map(c => mix(c, HZ, fog * .9));
      if (hp < 40) { const sd = LX < sx ? -1 : 1;
        return `<rect x="${F(sx - hp * .025)}" y="${F(sy - hp * .45)}" width="${F(hp * .05)}" height="${F(hp * .45)}" fill="${T(mix("#3e2a1c", HZ, fog))}"/>` +
          `<path d="${blobP(sx, sy - hp * .6, hp * .36, hp * .32, 7)}" fill="${T(ramp[2])}"/><path d="${blobP(sx + sd * hp * .05, sy - hp * .66, hp * .3, hp * .26, 7)}" fill="${T(ramp[4])}"/><path d="${blobP(sx - sd * hp * .1, sy - hp * .76, hp * .16, hp * .12, 6)}" fill="${T(ramp[6])}"/>`; }
      return leafTree(sx, sy, hp, Math.min(130, Math.round(hp * 1.1)), ramp); } }); };

  /* ---- the lighthouse, its keeper's house, the oil house ---- */
  const TXw = 22, TZw = 232, gT = hP(TXw, TZw) - .2, TOP = gT + 23.4, aC = Math.atan2(-TZw, -TXw);
  ok.push([TXw, TZw, 6]);
  w.cyl({ x: TXw, z: TZw, y: gT - 1.2, r0: 3.4, h: 1.6, n: 28, c: "#a89c8c" });
  w.cyl({ x: TXw, z: TZw, y: gT + .4, r0: 3.0, r1: 2.1, h: 23, n: 32, c: "#f6f2ea" });
  [[8, 3.0 - 8 / 23 * .9], [15.5, 3.0 - 15.5 / 23 * .9]].forEach(([y, rad]) => {   // two windows on the side toward us
    const o3 = [TXw + Math.cos(aC) * (rad + .06), gT + .4 + y, TZw + Math.sin(aC) * (rad + .06)], U = [-Math.sin(aC), 0, Math.cos(aC)], N = [Math.cos(aC), 0, Math.sin(aC)];
    w.add([{ P: w.quad(o3, U, [0, 1, 0], N, -.42, -.15, .42, 1.55, 0), c: "#e8e2d8", two: true },
           { P: w.quad(o3, U, [0, 1, 0], N, -.3, 0, .3, 1.4, .02), c: NIGHT ? LAMP : "#2a2e38", glow: NIGHT, two: true }], { bias: -.3 }); });
  w.cyl({ x: TXw, z: TZw, y: TOP, r0: 2.95, h: .45, n: 28, c: "#2a2c32", bottom: "#1e2026" });
  w.cyl({ x: TXw, z: TZw, y: TOP + .45, r0: 1.55, h: 2.5, n: 10, c: NIGHT ? "#fff0b8" : "#9ab2c4", glow: NIGHT, top: "#2a2c32" });
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; w.line([[TXw + Math.cos(a) * 1.58, TOP + .45, TZw + Math.sin(a) * 1.58], [TXw + Math.cos(a) * 1.58, TOP + 2.95, TZw + Math.sin(a) * 1.58]], "#1e2026", .1); }
  w.cyl({ x: TXw, z: TZw, y: TOP + 2.95, r0: 1.85, r1: .3, h: 1.6, n: 24, c: "#2e3036" });
  w.cyl({ x: TXw, z: TZw, y: TOP + 4.5, r0: .38, r1: .12, h: .8, n: 12, c: "#24262c" });
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, b = (i + 1) / 24 * Math.PI * 2, R2 = 2.85, p = (ang, y) => [TXw + Math.cos(ang) * R2, y, TZw + Math.sin(ang) * R2];
    w.line([p(a, TOP + .45), p(a, TOP + 1.6)], "#24262c", .06);
    w.line([p(a, TOP + 1.6), p(b, TOP + 1.6)], "#24262c", .08); w.line([p(a, TOP + 1.05), p(b, TOP + 1.05)], "#24262c", .05); }
  w.house({ x: TXw + Math.cos(aC) * 4.1, z: TZw + Math.sin(aC) * 4.1, y: gT, yaw: face(TXw, TZw), w: 2.6, d: 2.4, h: 2.7, rh: 1.4, gable: true, wall: "#f6f2ea", roof: "#2e3036", win: () => false, doorC: "#5a2a22", rng: rl });
  const keeper = onGround({ x: 37, z: 238, yaw: -8, w: 9.5, d: 7, h: 6.2, rh: 3.6, wall: "#f4eee2", roof: "#9a3a2a", shut: "#2a3a32", chim: .25, door: .5, rng: rl }, hP);
  w.house(keeper); ok.push([37, 238, 7]);
  w.house({ ...onGround({ x: 15, z: 236, yaw: 12, w: 2.6, d: 2.6, h: 2.6, rh: 1.3, gable: true }, hP), wall: "#a0503a", roof: "#3a3a40", clap: false, win: () => false, doorC: "#3a2a22" }); ok.push([15, 236, 3]);
  [[64, 282, -14, "#9a9a94", "#3e4048", null, 8], [92, 252, 6, "#d2a448", "#4a3e3a", "#2a3a2a", 9], [128, 330, -20, "#f2ece0", "#5a3a2e", "#5a1e1a", 10], [80, 380, 4, "#6a8098", "#3a3e46", null, 8]].forEach(([x, z, yaw, wall, roof, shut, W2], i) => {
    w.house({ ...onGround({ x, z, yaw, w: W2, d: 6.5, h: i % 2 ? 4.6 : 6, rh: 3, gable: i === 2 }, hP), wall, roof, shut, chim: .7, door: .35, rng: rl }); ok.push([x, z, 7]); });
  for (let k = 0; k < 320 && ok.length < 130; k++) {
    const z = 250 + Math.pow(r(), 1.6) * 800, x = edgeP(z) + 14 + r() * (z * .62 + 20 - edgeP(z));
    if (dP(x, z) < 30 || !free(x, z, 4)) continue;
    if (Math.abs(x - TXw) < 16 && z < 330) continue;                                // keep the tower clear
    ok.push([x, z, 2.5]); tree(x, z, hP, 11 + r() * 7, r() < .35); }

  /* ---- the village: houses on the slope facing the harbour, a white church ---- */
  const PAL = [["#f2ece0", "#3e4048", "#2a3a32"], ["#9a3a2a", "#3e3a3a", null], ["#d2a448", "#4a3e3a", "#2a3a2a"], ["#6a8098", "#3a3e46", null], ["#a8aaa4", "#4a4448", null], ["#8a9a78", "#3e3e44", null], ["#f2ece0", "#5a3a2e", "#5a1e1a"], ["#e8e0cc", "#2e3036", "#2a2e3a"]];
  const vok = [];
  { const ch = onGround({ x: -112, z: 430, yaw: -6, w: 8, d: 14, h: 7, rh: 4.5, gable: true }, hV);
    w.house({ ...ch, wall: "#f4f0e6", roof: "#3a3c44", door: .5, rng: rl });
    const { P } = w.frame(ch), b = P([0, 0, -7 + 2]);
    w.box({ x: b[0], z: b[2], y: ch.y + 7, yaw: -6, w: 3, d: 3, h: 6.5, c: "#f4f0e6" });
    w.box({ x: b[0], z: b[2], y: ch.y + 13.5, yaw: -6, w: 2.4, d: 2.4, h: 2.4, c: "#e8e4da" });
    w.cyl({ x: b[0], z: b[2], y: ch.y + 15.9, r0: 1.75, r1: 0, h: 8, n: 4, rot: Math.PI / 4 - 6 * Math.PI / 180, c: "#3a3c44" });
    vok.push([-112, 430, 12]); }
  for (let k = 0; k < 400 && vok.length < 26; k++) {
    const x = -230 + r() * 200, z = 300 + Math.pow(r(), 1.3) * 260, sx = 1280 + 2200 * x / z;
    if (sx < -40 || sx > 1010 || dV(x, z) < 9 || vok.some(([a, b, q]) => Math.hypot(x - a, z - b) < q + 8)) continue;
    const Pc = PAL[Math.floor(r() * PAL.length)], two = r() < .45, G = r() < .4;
    w.house({ ...onGround({ x, z, yaw: -18 + r() * 34, w: 7 + r() * 4, d: 6 + r() * 3, h: two ? 6 : 4.4, rh: 2.6 + r() * 1.4, gable: G }, hV),
      wall: Pc[0], roof: Pc[1], shut: Pc[2], chim: r() < .7 ? .2 + r() * .6 : undefined, door: .3 + r() * .4, rng: rl });
    vok.push([x, z, 6]); }
  for (let k = 0; k < 900 && vok.length < 210; k++) {
    const z = 292 + Math.pow(r(), 1.5) * 780, x = -z * .62 - 20 + r() * (edgeV(z) - 2 + z * .62 + 20);
    if (dV(x, z) < 6 || vok.some(([a, b, q]) => Math.hypot(x - a, z - b) < q + 3)) continue;
    vok.push([x, z, 2]); tree(x, z, hV, 10 + r() * 7, r() < .3); }

  /* ---- the wharf: a pier on pilings running out from the left shore, a fish shack on its end ---- */
  const PX0 = -66, PZ0 = 86, PX1 = -22, PZ1 = 170, PL = Math.hypot(PX1 - PX0, PZ1 - PZ0), ux = (PX1 - PX0) / PL, uz = (PZ1 - PZ0) / PL;
  const pYaw = Math.atan2(uz, ux) * 180 / Math.PI, PW = 4.2, DY = 2.1;
  const pAt = (s, t) => [PX0 + ux * s - uz * t, PZ0 + uz * s + ux * t];
  const WOOD = "#7a6048", WOODT = ["#a88c6c", "#9a8062", "#b09474"], WOODD = "#3e3024";
  for (let s = 0; s < PL - .1; s += 3) { const [x, z] = pAt(s + 1.5, 0);
    w.box({ x, z, y: DY, yaw: pYaw, w: 3.02, d: PW, h: .3, c: WOOD, top: WOODT[Math.floor(r() * 3)], dec: (fc, P) => {
      fc[4].dec = [1, 2, 3, 4, 5].map(i => ({ P: [P([-1.5 + i * .5, .31, -PW / 2]), P([-1.5 + i * .5, .31, PW / 2])], c: WOODD, ln: .03, min: .3, op: .5 })); } });
    [-1, 1].forEach(sd => { const [bx, bz] = pAt(s + 1.5, sd * (PW / 2 - .1)); w.box({ x: bx, z: bz, y: DY - .45, yaw: pYaw, w: 3.02, d: .22, h: .45, c: WOODD }); }); }
  for (let s = 0; s <= PL; s += 3) [-1, 1].forEach(sd => { const [x, z] = pAt(s, sd * (PW / 2 - .1));
    w.cyl({ x, z, y: -1, r0: .2, h: DY + 1, n: 7, c: "#4a3a2a", wet: true });
    w.cyl({ x, z, y: -1, r0: .215, h: 1.5, n: 7, c: "#2e3a24", wet: true, top: false, bias: -.05 });
    if (s + 3 <= PL) { const [x2, z2] = pAt(s + 3, sd * (PW / 2 - .1));
      w.line([[x, DY - .45, z], [x2, .5, z2]], "#2e2418", .12, { bias: .1 }); w.line([[x2, DY - .45, z2], [x, .5, z]], "#2e2418", .12, { bias: .1 }); } });
  for (let s = 6; s < PL - 8; s += 9) { const [x, z] = pAt(s, -PW / 2 + .25); w.cyl({ x, z, y: DY + .3, r0: .17, h: .45, n: 8, c: "#2a2a2e" }); }
  { const [sx, sz] = pAt(PL - 4.2, .3), BUOY = ["#e0402a", "#f4d040", "#3a8ac8", "#f4f0e8", "#3aa060", "#e87a2a"];
    w.house({ x: sx, z: sz, y: DY + .3, yaw: pYaw, w: 6, d: 3.4, h: 3.1, rh: 1.7, wall: "#9a3a2a", roof: "#3a3a40", door: .22, rng: rl, ao: false,
      win: (u, ri, n) => n !== "front" || u > .6, extra: (n, q, len) => { if (n !== "front") return;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const u = len * (.42 + i * .07), v = 2.3 - j * .9, c = BUOY[(i * 2 + j * 3) % 6];
          q(u - .13, v - .5, u + .13, v, c, { off: .12 }); q(u - .13, v - .3, u + .13, v - .2, "#f4f0e8", { off: .13 }); } } });
    // stacked lobster traps on the deck in front of the shack
    [[PL - 9, -1.2, 0, "#3a6a4a"], [PL - 9.9, -1.2, 0, "#c8a830"], [PL - 9.45, -1.2, .5, "#3a6a4a"], [PL - 12, -.9, 0, "#b8402a"], [PL - 12, .3, 0, "#3a6a4a"]].forEach(([s, t, dy, c]) => {
      const [x, z] = pAt(s, t); w.box({ x, z, y: DY + .3 + dy, yaw: pYaw + 90, w: .7, d: .9, h: .5, c, dec: (fc, P) => { fc.slice(0, 4).forEach(F => F.dec = [{ P: [P([-.35, .25, -.45]), P([.35, .25, -.45]), P([.35, .25, .45]), P([-.35, .25, .45]), P([-.35, .25, -.45])], c: "#000000", ln: .03, min: .3, op: .4 }]); } }); });
    const [lx, lz] = pAt(PL - .4, -PW / 2 + .2);
    w.box({ x: lx, z: lz, y: DY + .3, w: .14, d: .14, h: 4, c: "#2a2a2e" });
    w.box({ x: lx, z: lz, y: DY + 4.3, w: .45, d: .45, h: .5, c: NIGHT ? LAMP : "#3a3a40", glow: NIGHT });
    if (NIGHT) w.sprite({ x: lx, z: lz - .5, y: DY + 4.5, noRefl: true, bias: -2, fn: (sx, sy, k) => `<circle cx="${F(sx)}" cy="${F(sy)}" r="${F(k * 5)}" fill="url(#hlGlow)" opacity=".75"/>` }); }

  /* ---- lobster boats at their moorings, all swung to the same breeze ---- */
  const boat = (bx, bz, yawD, hull, cab) => {
    const { P } = w.frame({ x: bx, z: bz, yaw: yawD });
    const st = [[-5.4, 1.5, 1.2], [-3.4, 1.75, 1.22], [-1, 1.82, 1.3], [1.5, 1.68, 1.45], [3.4, 1.2, 1.68], [4.8, .55, 1.9], [5.5, 0, 2.02]];
    const faces = [];
    for (let i = 0; i < st.length - 1; i++) [-1, 1].forEach(sd => {
      const [a, b] = [st[i], st[i + 1]];
      faces.push({ P: [[a[0], 0, sd * a[1] * .88], [b[0] - (i === st.length - 2 ? .3 : 0), 0, sd * b[1] * .88], [b[0], b[2], sd * b[1]], [a[0], a[2], sd * a[1]]].map(P), c: hull,
        dec: [{ P: [[a[0], 0, sd * a[1] * .89], [b[0] - (i === st.length - 2 ? .3 : 0), 0, sd * b[1] * .89], [b[0], .28, sd * b[1] * .91], [a[0], .28, sd * a[1] * .91]].map(P), c: "#a8302a" },
              { ln: .07, min: .4, c: "#3a3a3e", P: [[a[0], a[2] - .04, sd * a[1] * 1.01], [b[0], b[2] - .04, sd * b[1] * 1.01]].map(P) }] }); });
    faces.push({ P: [[-5.4, 0, -1.32], [-5.4, 0, 1.32], [-5.4, 1.2, 1.5], [-5.4, 1.2, -1.5]].map(P), c: hull });
    faces.push({ P: [...st.map(([x, hb, y]) => [x, y - .2, -hb * .95]), ...st.slice().reverse().map(([x, hb, y]) => [x, y - .2, hb * .95])].map(P), c: "#8a8274", up: true });
    const hb = w.add(faces, { center: P([0, .7, 0]) });
    const cb = P([1.4, 0, 0]);
    const cabin = w.box({ x: cb[0], z: cb[2], y: 1.45, yaw: yawD, w: 3.2, d: 2.5, h: 1.9, c: cab, top: "#e8e4dc", dec: (fc, Pc) => {
      [[0, -1.3], [2, 1.3]].forEach(([fi, zz]) => fc[fi].dec = [0, 1, 2].map(k => ({ P: [[-1.35 + k, 1, zz], [-.7 + k, 1, zz], [-.7 + k, 1.6, zz], [-1.35 + k, 1.6, zz]].map(Pc), c: NIGHT && k === 1 ? LAMP : "#2a3a4a", glow: NIGHT && k === 1 })));
      fc[1].dec = [{ P: [[1.65, 1, -1], [1.65, 1, 1], [1.65, 1.6, 1], [1.65, 1.6, -1]].map(Pc), c: "#2a3a4a" }]; } });
    cabin.key = hb.key - .2;
    const rf = P([1.2, 0, 0]), an = P([1.0, 0, 0]);
    w.box({ x: rf[0], z: rf[2], y: 3.35, yaw: yawD, w: 3.9, d: 2.9, h: .14, c: "#e8e4dc" }).key = hb.key - .3;
    w.line([[an[0], 3.5, an[2]], [an[0], 5.6, an[2]]], "#2a2a30", .06, { bias: -.4 });
    [[-3.6, -.5, "#3a6a4a"], [-3.6, .45, "#c8a830"], [-2.7, 0, "#3a6a4a"]].forEach(([lx, lz2, c]) => { const p = P([lx, 0, lz2]);
      w.box({ x: p[0], z: p[2], y: 1.15, yaw: yawD, w: .9, d: .7, h: .5, c }).key = hb.key - .1; });
    if (NIGHT) { w.cyl({ x: an[0], z: an[2], y: 5.6, r0: .12, h: .2, n: 6, c: "#fff8e0", glow: true }); }
  };
  const fleet = [[8, 126, 32, "#f2efe8", "#f4f0e8"], [pAt(PL - 15, -6.5)[0], pAt(PL - 15, -6.5)[1], pYaw, "#2a3e5e", "#f4f0e8"], [46, 128, 26, "#2e5a4a", "#f4f0e8"], [-9, 236, 36, "#f2efe8", "#f4f0e8"], [-52, 226, 30, "#f2efe8", "#e8d8b8"], [-18, 98, 44, "#f2efe8", "#f4f0e8"]];
  fleet.forEach(([x, z, yaw, hull, cab]) => boat(x, z, yaw, hull, cab));

  /* ---- foreground: rounded granite boulders on our side, bottom corners ---- */
  for (let k = 0; k < 18; k++) { const z = 46 + r() * 34, x = (1960 + r() * 700 - 1280) * z / 2200;
    w.sprite({ x, z, noRefl: true, fn: (sx, sy, kk) => { const ww = (3 + r() * 5) * kk; return boulder(sx, sy, ww, ww * (.3 + r() * .16)); } }); }
  for (let k = 0; k < 9; k++) { const z = 44 + r() * 16, x = (-60 + r() * 420 - 1280) * z / 2200;
    w.sprite({ x, z, noRefl: true, fn: (sx, sy, kk) => { const ww = (2.4 + r() * 4) * kk; return boulder(sx, sy, ww, ww * (.28 + r() * .14)); } }); }

  /* ---- water: reflections of the whole world, then wind ripples and the sun path ---- */
  let wtr = `<g opacity=".4" filter="url(#hlRipple)">${w.draw({ mirror: true })}</g>`;
  for (let k = 0; k < 170; k++) { const y = WY + 6 + Math.pow(r(), .8) * (H - WY - 6), t = (y - WY) / (H - WY);
    wtr += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(30 + r() * 150 * (.4 + t))}" height="${F(1 + t * 1.5)}" rx="1" fill="${NIGHT ? (r() < .5 ? "#8a9ad0" : "#1a2448") : (r() < .55 ? "#e8f2f6" : "#2a4a62")}" opacity="${F(.08 + r() * .14)}"/>`; }
  wtr += `<g filter="url(#hlRipple)">`;
  for (let y = WY + 3; y < H; y += 3 + (y - WY) * .02) { const t = (y - WY) / (H - WY), ww = 50 + t * 260, n = 2 + Math.floor(t * 6);
    for (let k = 0; k < n; k++) { const off = (r() * 2 - 1) * ww * Math.pow(r(), .6), Lr = 10 + r() * (30 + t * 70);
      wtr += `<rect x="${F(LX + off - Lr / 2)}" y="${F(y)}" width="${F(Lr)}" height="${F(1.3 + t * 2)}" rx="1" fill="${NIGHT ? "#dce6ff" : "#fff8e0"}" opacity="${F((.75 - Math.abs(off) / ww * .5) * (1 - t * .4))}"/>`; } }
  wtr += `</g>`;
  s = s.slice(0, reflAt) + wtr + s.slice(reflAt);
  s += w.draw();

  /* night: lamp glow and soft beams from the lighthouse */
  if (NIGHT) { const [lx, ly] = w.proj([TXw, TOP + 1.7, TZw]);
    s += `<circle cx="${F(lx)}" cy="${F(ly)}" r="110" fill="url(#hlGlow)" opacity=".9"/><circle cx="${F(lx)}" cy="${F(ly)}" r="26" fill="#fff6d0" opacity=".5"/>`;
    s += `<g filter="url(#hlSoft)"><path d="M${F(lx)},${F(ly - 2)} L800,${F(ly + 70)} L812,${F(ly + 138)} Z" fill="url(#hlBeamL)"/><path d="M${F(lx)},${F(ly)} L2150,${F(ly + 28)} L2140,${F(ly + 88)} Z" fill="url(#hlBeamR)" opacity=".7"/></g>`; }

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
