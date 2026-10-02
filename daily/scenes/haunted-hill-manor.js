/* Haunted Hill Manor: a crooked Victorian manor alone on a bald hill above a
   valley village. A leaning spired tower, a round turret, a mansard roof with
   iron cresting, an iron fence and gate round the crown, gnarled dead trees on
   the slopes, gravestones, bats over the tower, fog pooled in the valley.
   Day is a brooding late-October afternoon (slate sky, low warm sun breaking
   through heavy cloud); opts.time === "night" is a cold teal moonlit night with
   a big moon behind the tower, lit village windows and glowing fog.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function hauntedHillManorArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1313;
  const r = rng(seed), rs = rng(seed + 7);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = NIGHT ? 1080 : 820, LY = NIGHT ? 168 : 196;
  const T = c => NIGHT ? mix(mix(c, "#6c7c90", .42), "#07142a", .6) : c;
  const RIM = NIGHT ? "#bfd8e6" : "#ffdcae", LAMP = "#ffc35a", GHOST = "#9cf2c8";
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
  const wave = (ph, fr, am) => x => fr.reduce((s, f, i) => s + Math.sin(x / f + ph[i]) * am[i], 0);
  const ridgePath = (fn, close = H, x0 = 0, x1 = W) => { let d = `M${x0},${close} L${x0},${F(fn(x0))}`;
    for (let x = x0; x <= x1; x += 16) d += ` L${x},${F(fn(x))}`; return d + ` L${x1},${F(fn(x1))} L${x1},${close}Z`; };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
  const line = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L");
  const cl = v => Math.max(0, Math.min(.999, v));
  const ss = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);

  /* ------------------------------------------------------------ defs + sky */
  const SKY_H = NIGHT ? "#38566e" : "#efcfa6", HZ = NIGHT ? "#2e4a62" : "#d8c6b4";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040916"/><stop offset=".4" stop-color="#0b1a32"/><stop offset=".78" stop-color="#1e3652"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#4c5c7e"/><stop offset=".38" stop-color="#7f8aa6"/><stop offset=".72" stop-color="#c9b8b4"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e4fff4" stop-opacity=".55"/><stop offset=".14" stop-color="#b8e0dc" stop-opacity=".22"/><stop offset=".5" stop-color="#6a9aa8" stop-opacity=".07"/><stop offset="1" stop-color="#6a9aa8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff0cc" stop-opacity=".9"/><stop offset=".18" stop-color="#ffd8a0" stop-opacity=".42"/><stop offset=".55" stop-color="#f0b880" stop-opacity=".12"/><stop offset="1" stop-color="#f0b880" stop-opacity="0"/>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="mnDefs">
    <linearGradient id="mnSky" x1="0" y1="0" x2="0" y2="470" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="mnLight" cx="${LX}" cy="${LY}" r="820" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="mnHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="mnHill" x1="780" y1="0" x2="1860" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#9a9462")}"/><stop offset=".38" stop-color="${T("#8a8656")}"/><stop offset=".62" stop-color="${T("#6a6a44")}"/><stop offset="1" stop-color="${T("#4a4c34")}"/></linearGradient>
    <linearGradient id="mnHillV" x1="0" y1="390" x2="0" y2="600" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${RIM}" stop-opacity=".14"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    ${g2("mnVal", T("#8a7e56"), T("#6e6644"))}
    <linearGradient id="mnFore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T("#7a6e44")}"/><stop offset=".5" stop-color="${T("#5a5232")}"/><stop offset="1" stop-color="${T("#34301e")}"/></linearGradient>
    <linearGradient id="mnCyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T("#a49aa6")}"/><stop offset=".35" stop-color="${T("#8e8494")}"/><stop offset="1" stop-color="${T("#4e4656")}"/></linearGradient>
    <linearGradient id="mnCone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T("#5a5868")}"/><stop offset=".4" stop-color="${T("#44424e")}"/><stop offset="1" stop-color="${T("#24222c")}"/></linearGradient>
    <linearGradient id="mnFacadeSh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${RIM}" stop-opacity=".14"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <linearGradient id="mnEave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".42"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <radialGradient id="mnPane" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#ffc45a"/><stop offset="1" stop-color="#d8782a"/></radialGradient>
    <radialGradient id="mnPaneG" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#eafff2"/><stop offset=".6" stop-color="#8ef0c0"/><stop offset="1" stop-color="#3a9a80"/></radialGradient>
    <radialGradient id="mnGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".85"/><stop offset=".35" stop-color="#ffa848" stop-opacity=".28"/><stop offset="1" stop-color="#ffa848" stop-opacity="0"/></radialGradient>
    <radialGradient id="mnGlowG"><stop offset="0" stop-color="${GHOST}" stop-opacity=".8"/><stop offset=".35" stop-color="${GHOST}" stop-opacity=".22"/><stop offset="1" stop-color="${GHOST}" stop-opacity="0"/></radialGradient>
    <radialGradient id="mnMoonD" cx=".42" cy=".4" r=".66"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef6ec"/><stop offset="1" stop-color="#c4d8d0"/></radialGradient>
    <filter id="mnLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="mnLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="mnCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="mnFog" x="-20%" y="-100%" width="140%" height="300%"><feTurbulence type="fractalNoise" baseFrequency=".008 .03" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="60" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="9"/></filter>
    <filter id="mnPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="mnSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="mnBlur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#mnSky)"/>`;

  if (NIGHT) {
    for (let i = 0; i < 460; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 420, d = Math.hypot(x - LX, y - LY), big = rs() < .08, o = .2 + rs() * .6 * (1 - y / 470);
      if (d < 200) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#fff0d0" : "#e4f0ff"}" opacity="${F(o)}"/>`; }
    const R = 66;
    s += `<rect width="${W}" height="${H}" fill="url(#mnLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 26}" fill="#cfeee4" opacity=".1"/><circle cx="${LX}" cy="${LY}" r="${R + 10}" fill="#cfeee4" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="url(#mnMoonD)"/>`;
    s += `<g filter="url(#mnBlur3)">`;
    [[-22, -18, 20, 14], [14, -26, 16, 12], [20, 8, 22, 16], [-10, 16, 18, 13], [-34, 10, 10, 9], [4, 34, 12, 8]].forEach(([dx, dy, a, b]) => s += `<path d="${blobP(LX + dx, LY + dy, a, b, 8, rs)}" fill="#9fb4ae" opacity=".42"/>`);
    s += `</g>`;
    for (let k = 0; k < 12; k++) { const a = rs() * 6.28, d = Math.sqrt(rs()) * R * .85, cr = 1.5 + rs() * 3.5;
      s += `<circle cx="${F(LX + Math.cos(a) * d)}" cy="${F(LY + Math.sin(a) * d)}" r="${F(cr)}" fill="#8aa29c" opacity=".3"/>`; }
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#mnLight)"/><circle cx="${LX}" cy="${LY}" r="46" fill="#fff4dc" opacity=".55"/><circle cx="${LX}" cy="${LY}" r="34" fill="#fff8e8"/>`;
    s += `<g class="rays" opacity=".13" filter="url(#mnSoft)">`;
    for (let k = 0; k < 8; k++) { const a = .3 + k * .3, L = 1000;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .035) * L)},${F(LY + Math.sin(a - .035) * L)} L${F(LX + Math.cos(a + .035) * L)},${F(LY + Math.sin(a + .035) * L)}Z" fill="#fff4dc"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------------------------------------------------------- clouds */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#mnCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .045 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#0e1a2e"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .42)}" fill="#1c2c44"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .18)}" fill="#4a6a80" opacity=".85"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .18)}" rx="${F(R * .42)}" ry="${F(R * .08)}" fill="#a8d0d4" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 10; k++) { const t = k / 9; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .13 * (.6 + rs() * .7), w * (.08 + rs() * .07)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .56)}" ry="${F(w * .075)}" fill="#6a6c84"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#86889e"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .82)}" fill="#b4b0bc"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .35)}" rx="${F(R * .62)}" ry="${F(R * .4)}" fill="#e8d6c8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .45)}" cy="${F(ly - R * .5)}" rx="${F(R * .3)}" ry="${F(R * .18)}" fill="#fff0dc"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(430, 150, 560, "drift1") + cloud(1880, 110, 720, "drift2") + cloud(2380, 250, 330, "drift3") + cloud(1500, 260, 300, "drift3") + cloud(170, 280, 260, "drift2");
  /* bats round the tower */
  s += `<g class="bats">`;
  [[1090, 252, .9], [1128, 226, .7], [1222, 118, .8], [1262, 92, .6], [1300, 132, .55], [1490, 128, .75], [1530, 166, .6], [1560, 104, .5], [1430, 92, .45], [1040, 200, .5], [1640, 210, .55], [1012, 140, .45]].forEach(([x, y, k]) => {
    const fl = rs() < .5 ? 1 : -.5;
    s += `<path transform="translate(${x},${y}) scale(${k})" d="M0,2 C-6,-4 -14,${-10 * fl} -30,${-8 * fl} C-24,-4 -26,0 -22,4 C-18,1 -14,4 -12,7 C-8,4 -4,6 0,8 C4,6 8,4 12,7 C14,4 18,1 22,4 C26,0 24,-4 30,${-8 * fl} C14,${-10 * fl} 6,-4 0,2Z" fill="${NIGHT ? "#04060e" : "#2a2230"}"/><ellipse cx="${x}" cy="${F(y + 3 * k)}" rx="${F(3 * k)}" ry="${F(4.5 * k)}" fill="${NIGHT ? "#04060e" : "#2a2230"}"/><path transform="translate(${x},${y}) scale(${k})" d="M-2,-1 l-1,-4 l2,2 l2,-2 l-1,4" fill="${NIGHT ? "#04060e" : "#2a2230"}"/>`; });
  s += `</g>`;
  const cloudPart = s; s = DEFS;

  /* ------------------------------------------------------------ land kits */
  const mountains = o => {
    const key = []; let x = -180, pk = false;
    while (x < W + 260) { key.push([x, pk ? o.hi + r() * (o.lo - o.hi) : 0, pk]); x += o.step * (.6 + r() * .8); pk = !pk; }
    key.forEach((k, i) => { if (k[2]) return; const n = [key[i - 1], key[i + 1]].filter(Boolean).map(p => p[1]);
      const low = n.length ? Math.max(...n) : o.lo; k[1] = low + (o.base - low) * (.25 + r() * .4); });
    const seg = [];
    for (let i = 0; i < key.length - 1; i++) { const [ax, ay] = key[i], [bx, by] = key[i + 1], a = [];
      for (let q = 0; q <= 5; q++) { const t = q / 5, j = q % 5 ? 1 : 0; a.push([ax + (bx - ax) * t + j * (r() - .5) * 10, ay + (by - ay) * t + j * (r() - .5) * o.step * .06]); }
      seg.push(a); }
    const B = o.base + 6; let m = `<path d="${poly([[0, B], ...seg.flat(), [W, B]])}" fill="${o.mid}"/>`;
    for (let i = 1; i < key.length - 1; i++) { if (!key[i][2]) continue;
      const P = key[i], L = key[i - 1], R = key[i + 1], fx = P[0] + (r() - .5) * o.step * .2, Fp = [fx, B];
      const litL = LX < P[0], lc = litL ? o.lit : o.dark, rc = litL ? o.dark : o.lit;
      m += `<path d="${poly([...seg[i - 1], Fp])}" fill="${lc}"/><path d="${poly([...seg[i], Fp])}" fill="${rc}"/>`;
      m += `<path d="${poly([P, seg[i - 1][2], [(fx + L[0]) / 2, B]])}" fill="${mix(lc, o.mid, .5)}" opacity=".75"/>`;
      m += `<path d="${poly([P, seg[i][3], [(fx + R[0]) / 2, B]])}" fill="${mix(rc, o.mid, .5)}" opacity=".75"/>`;
      m += `<path d="${line(litL ? seg[i - 1] : seg[i])}" stroke="${o.rim}" stroke-width="2" fill="none" opacity=".5"/>`; }
    return m;
  };
  /* many-clump deciduous tree, lit from the light */
  const leafTree = (x, y, h, n, RAMP) => {
    let g = ""; const cx = x, cy = y - h * .64, rx = h * .38, ry = h * .32, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl;
    g += `<ellipse cx="${F(x - ux * 20)}" cy="${F(y + 2)}" rx="${F(h * .6)}" ry="${F(h * .05)}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - h * .05)},${F(y)} C${F(x - h * .03)},${F(y - h * .3)} ${F(x - h * .02)},${F(y - h * .45)} ${F(x)},${F(y - h * .6)} C${F(x + h * .02)},${F(y - h * .45)} ${F(x + h * .03)},${F(y - h * .3)} ${F(x + h * .05)},${F(y)}Z" fill="${T("#3a2a20")}"/>`;
    const cr = [[cx, cy, rx, ry * .85], [cx - rx * .55, cy + ry * .25, rx * .55, ry * .55], [cx + rx * .58, cy + ry * .2, rx * .55, ry * .58], [cx, cy - ry * .5, rx * .6, ry * .5]];
    const inC = (px, py) => cr.some(([a, b, c, d]) => ((px - a) / c) ** 2 + ((py - b) / d) ** 2 < 1);
    const c = [];
    for (let i = 0; i < n * 3 && c.length < n; i++) { const px = cx - rx * 1.2 + r() * rx * 2.4, py = cy - ry * 1.2 + r() * ry * 2.2;
      if (!inC(px, py)) continue;
      const nx = (px - cx) / (rx * 1.2), ny = (py - cy) / (ry * 1.2), lit = (nx * ux + ny * uy) * .5 + .5, e = Math.min(1, Math.hypot(nx, ny));
      c.push([px, py, cl(lit * .72 + e * .15 + (r() - .5) * .3), h * (.04 + r() * .035)]); }
    c.sort((a, b) => a[2] - b[2]);
    let cg = ""; c.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${T(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#mnLeafyS)">${cg}</g>`;
  };
  /* gnarled dead tree: tapered limbs, each with a lit edge toward the light and a shaded edge away */
  const deadTree = (x, y, h, o = {}) => {
    const dark = T(o.dark || "#241c1c"), mid = T(o.mid || "#3e3230"), lit = T(o.lit || "#8a7464");
    let g = `<ellipse cx="${F(x + (x < LX ? 1 : -1) * h * .12)}" cy="${F(y + 2)}" rx="${F(h * .3)}" ry="${F(h * .03)}" fill="#000" opacity=".25"/>`;
    const maxD = o.depth || 5;
    const br = (x0, y0, a, L, w, d) => {
      const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L, nx = -Math.sin(a), ny = Math.cos(a);
      const bend = (r() - .5) * L * .4, mx = (x0 + x1) / 2 + nx * bend, my = (y0 + y1) / 2 + ny * bend, w1 = Math.max(.7, w * .62);
      const sg = (nx * (LX - x0) + ny * (LY - y0)) > 0 ? 1 : -1;
      g += `<path d="M${F(x0 + nx * w / 2)},${F(y0 + ny * w / 2)} Q${F(mx + nx * (w + w1) / 4)},${F(my + ny * (w + w1) / 4)} ${F(x1 + nx * w1 / 2)},${F(y1 + ny * w1 / 2)} L${F(x1 - nx * w1 / 2)},${F(y1 - ny * w1 / 2)} Q${F(mx - nx * (w + w1) / 4)},${F(my - ny * (w + w1) / 4)} ${F(x0 - nx * w / 2)},${F(y0 - ny * w / 2)}Z" fill="${mid}"/>`;
      if (w > 2.2) {
        g += `<path d="M${F(x0 - sg * nx * w * .28)},${F(y0 - sg * ny * w * .28)} Q${F(mx - sg * nx * (w + w1) * .14)},${F(my - sg * ny * (w + w1) * .14)} ${F(x1 - sg * nx * w1 * .28)},${F(y1 - sg * ny * w1 * .28)}" stroke="${dark}" stroke-width="${F(w * .42)}" fill="none" stroke-linecap="round"/>`;
        g += `<path d="M${F(x0 + sg * nx * w * .32)},${F(y0 + sg * ny * w * .32)} Q${F(mx + sg * nx * (w + w1) * .16)},${F(my + sg * ny * (w + w1) * .16)} ${F(x1 + sg * nx * w1 * .32)},${F(y1 + sg * ny * w1 * .32)}" stroke="${lit}" stroke-width="${F(Math.max(.8, w * .2))}" fill="none" stroke-linecap="round" opacity=".9"/>`;
        if (w > 9) for (let k = 0; k < w / 3; k++) { const t = r(), px = x0 + (x1 - x0) * t + nx * (r() - .5) * w * .5, py = y0 + (y1 - y0) * t + ny * (r() - .5) * w * .5;
          g += `<path d="M${F(px)},${F(py)} l${F(Math.cos(a) * (4 + r() * 8))},${F(Math.sin(a) * (4 + r() * 8))}" stroke="${dark}" stroke-width="1.2" opacity=".6"/>`; }
      }
      if (d >= maxD) { for (let k = 0; k < 3; k++) { const b = a + (r() - .5) * 1.6, l = L * (.3 + r() * .4);
          g += `<path d="M${F(x1)},${F(y1)} q${F(Math.cos(b) * l * .5 + (r() - .5) * 4)},${F(Math.sin(b) * l * .5)} ${F(Math.cos(b) * l)},${F(Math.sin(b) * l)}" stroke="${mid}" stroke-width=".9" fill="none"/>`; }
        return; }
      const n = d === 0 ? 3 : r() < .3 ? 3 : 2;
      for (let k = 0; k < n; k++) { let b = a + (k - (n - 1) / 2) * (.55 + r() * .35) + (r() - .5) * .35;
        if (o.droop && d >= 2) b += (Math.cos(b) > 0 ? .25 : -.25);
        br(x1, y1, b, L * (.62 + r() * .16), w1, d + 1); }
    };
    // root flare
    const tw = h * .1;
    g += `<path d="M${F(x - tw * 1.6)},${F(y + 2)} Q${F(x - tw * .6)},${F(y - tw * .3)} ${F(x - tw * .45)},${F(y - tw * 1.4)} L${F(x + tw * .45)},${F(y - tw * 1.4)} Q${F(x + tw * .6)},${F(y - tw * .3)} ${F(x + tw * 1.7)},${F(y + 2)}Z" fill="${mid}"/>`;
    g += `<path d="M${F(x + (x < LX ? 1 : -1) * tw * .2)},${F(y + 2)} Q${F(x + (x < LX ? 1 : -1) * tw * .5)},${F(y - tw * .3)} ${F(x + (x < LX ? 1 : -1) * tw * .45)},${F(y - tw * 1.4)} L${F(x + (x < LX ? 1 : -1) * tw * .9)},${F(y - tw * .2)} L${F(x + (x < LX ? 1 : -1) * tw * 1.6)},${F(y + 2)}Z" fill="${dark}"/>`;
    br(x, y - tw * .5, -Math.PI / 2 + (o.lean || 0), h * .36, tw * 1.05, 0);
    return g;
  };
  /* small village house seen from the front-left: lit front, shaded side, two-tone roof */
  const house = (x, y, w, h, wall, roof, o = {}) => {
    const d = w * .45, rh = h * .75;
    let g = `<ellipse cx="${F(x + w * .2)}" cy="${F(y + 1)}" rx="${F(w * .75)}" ry="${F(h * .08)}" fill="#000" opacity=".2"/>`;
    g += `<path d="${poly([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x, y - h - rh], [x - w / 2, y - h]])}" fill="${T(wall)}"/>`;
    g += `<path d="${poly([[x + w / 2, y], [x + w / 2 + d, y - d * .18], [x + w / 2 + d, y - h - d * .18], [x + w / 2, y - h]])}" fill="${T(mix(wall, "#2a2030", .38))}"/>`;
    g += `<path d="${poly([[x, y - h - rh], [x + d, y - h - rh - d * .18], [x + w / 2 + d + 3, y - h - d * .18 + 2], [x + w / 2 + 3, y - h + 2]])}" fill="${T(roof)}"/>`;
    g += `<path d="M${F(x - w / 2 - 2)},${F(y - h + 2)} L${F(x)},${F(y - h - rh - 1)} L${F(x + w / 2 + 3)},${F(y - h + 2)}" stroke="${T(mix(roof, "#000", .2))}" stroke-width="2.5" fill="none"/>`;
    g += `<path d="M${F(x - w / 2 - 2)},${F(y - h + 2)} L${F(x)},${F(y - h - rh - 1)}" stroke="${RIM}" stroke-width="1.2" opacity=".55"/>`;
    g += `<path d="M${F(x)},${F(y - h - rh)} L${F(x + d)},${F(y - h - rh - d * .18)}" stroke="${RIM}" stroke-width="1" opacity=".45"/>`;
    const ww = Math.max(3, w * .14), wh = ww * 1.3;
    [[-.28, .42], [.12, .42]].forEach(([fx, fy], i) => { const lit = NIGHT && (o.lit ?? .7) > i * .4;
      g += `<rect x="${F(x + fx * w)}" y="${F(y - h * fy - wh / 2)}" width="${F(ww)}" height="${F(wh)}" fill="${lit ? LAMP : T("#4a5468")}"/>`;
      if (lit) g += `<circle cx="${F(x + fx * w + ww / 2)}" cy="${F(y - h * fy)}" r="${F(ww * 3)}" fill="url(#mnGlow)" opacity=".5"/>`; });
    if (o.chim) g += `<rect x="${F(x + w * .18)}" y="${F(y - h - rh * .8)}" width="${F(w * .1)}" height="${F(rh * .55)}" fill="${T("#7a4a3a")}"/><rect x="${F(x + w * .18)}" y="${F(y - h - rh * .8)}" width="${F(w * .04)}" height="${F(rh * .55)}" fill="${T("#a86a4a")}"/>`;
    return g;
  };

  /* ------------------------------------------------------------- far land */
  s += mountains({ base: 432, hi: 318, lo: 372, step: 170, lit: T("#9a98ae"), mid: T("#85849c"), dark: T("#6c6c86"), rim: RIM });
  s += `<rect x="0" y="330" width="${W}" height="120" fill="url(#mnHaze)" opacity=".9"/>`;
  s += mountains({ base: 452, hi: 372, lo: 410, step: 110, lit: T("#8a8698"), mid: T("#76748a"), dark: T("#5e5c74"), rim: RIM });
  s += `<rect x="0" y="400" width="${W}" height="80" fill="url(#mnHaze)" opacity=".8"/>`;

  const SERE = ["#8a5a3a", "#a0683a", "#7a6a48", "#6a5a3a", "#9a7a4a", "#b07a3a", "#5a4a38", "#8a4a2e", "#6e6a44"];
  const forest = (fn, rows, size, haze, bare) => {
    let f = ""; const trees = [];
    for (let row = 0; row < rows; row++) for (let x = -10; x < W + 10; x += size * (.9 + r() * .5)) {
      const y = fn(x) + row * size * .72 + size * .4 + r() * size * .3, sz = size * (.75 + r() * .45);
      trees.push([x + r() * size * .4, y, sz]); }
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(([x, y, sz]) => {
      const lsd = x < LX ? -1 : 1, hz = NIGHT ? "#2e4a62" : "#d8c6b4";
      if (r() < bare) { const c = T(mix("#3e3230", hz, haze));
        f += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - sz * 1.5)} M${F(x)},${F(y - sz * .7)} L${F(x - sz * .5)},${F(y - sz * 1.3)} M${F(x)},${F(y - sz * .9)} L${F(x + sz * .45)},${F(y - sz * 1.4)} M${F(x - sz * .25)},${F(y - sz * 1)} L${F(x - sz * .2)},${F(y - sz * 1.45)}" stroke="${c}" stroke-width="${F(Math.max(.8, sz * .09))}" fill="none"/>`; return; }
      const c = T(mix(SERE[Math.floor(r() * SERE.length)], hz, haze)), dk = mix(c, NIGHT ? "#030814" : "#1e1410", .38), lt = mix(c, RIM, .3);
      f += `<path d="${blobP(x + lsd * sz * .12, y + sz * .1, sz * .95, sz * .8, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz * .08, sz * .85, sz * .72, 7)}" fill="${c}"/><path d="${blobP(x - lsd * sz * .25, y - sz * .35, sz * .42, sz * .3, 6)}" fill="${lt}"/>`;
    });
    return f;
  };
  const h1 = wave([2, 4, 0], [300, 130, 55], [12, 6, 3]), h2 = wave([5, 1, 3], [380, 160, 70], [10, 5, 2]);
  const band1 = x => 452 + h1(x), band2 = x => 486 + h2(x);
  s += `<path d="${ridgePath(band1)}" fill="${T("#8a7e60")}"/>`;
  s += `<g filter="url(#mnLeafyS)">${forest(band1, 3, 10, .45, .3)}</g>`;
  s += `<rect x="0" y="452" width="${W}" height="70" fill="url(#mnHaze)" opacity=".55"/>`;
  s += `<path d="${ridgePath(band2)}" fill="url(#mnVal)"/>`;
  // valley fields: dim patchwork strips
  [[0, 300, "#a08a52"], [300, 640, "#8a8448"], [640, 900, "#9a7a48"], [1700, 2050, "#a08a52"], [2050, 2340, "#8a8040"], [2340, 2560, "#96784a"]].forEach(([a, b, c]) => {
    const ya = band2(a) + 10, yb = band2(b) + 10;
    s += `<path d="M${a},${F(ya)} L${b},${F(yb)} L${b + 30},560 L${a - 30},560Z" fill="${T(c)}"/>`;
    for (let k = 1; k < 6; k++) s += `<path d="M${a - k * 5},${F(ya + k * 9)} L${b + k * 5},${F(yb + k * 9)}" stroke="${T(mix(c, "#2a2010", .25))}" stroke-width="1.4" opacity=".5"/>`; });
  s += `<g filter="url(#mnLeafyS)">${forest(x => band2(x) - 6, 1, 15, .18, .35)}</g>`;

  /* the village at the foot of the hill: left and right clusters, a church spire */
  const WALLS = ["#d8ccb4", "#c8b89a", "#b89a7a", "#a86a4a", "#c8bca8", "#9a8a78"], ROOFS = ["#4a4858", "#5a4a4a", "#3e4250", "#6a4a3a"];
  let vil = "";
  const VR = rng(seed + 3);
  const vhouses = [];
  for (let x = 250; x < 860; x += 34 + VR() * 30) vhouses.push([x, 528 + VR() * 26, 34 + VR() * 18]);
  for (let x = 1790; x < 2440; x += 34 + VR() * 30) vhouses.push([x, 528 + VR() * 26, 34 + VR() * 18]);
  vhouses.sort((a, b) => a[1] - b[1]);
  // church on the left
  { const x = 560, y = 530;
    vil += `<path d="${poly([[x - 40, y], [x + 30, y], [x + 30, y - 40], [x - 40, y - 40]])}" fill="${T("#c4b8a2")}"/><path d="${poly([[x + 30, y], [x + 60, y - 6], [x + 60, y - 46], [x + 30, y - 40]])}" fill="${T("#8a7e70")}"/>`;
    vil += `<path d="${poly([[x - 44, y - 40], [x - 6, y - 70], [x + 26, y - 76], [x + 64, y - 46]])}" fill="${T("#4a4654")}"/><path d="M${x - 44},${y - 40} L${x - 6},${y - 70}" stroke="${RIM}" stroke-width="1.2" opacity=".5"/>`;
    vil += `<path d="${poly([[x - 52, y], [x - 26, y], [x - 26, y - 92], [x - 52, y - 92]])}" fill="${T("#d0c4ae")}"/><path d="${poly([[x - 26, y], [x - 18, y - 2], [x - 18, y - 94], [x - 26, y - 92]])}" fill="${T("#8e8272")}"/>`;
    vil += `<path d="${poly([[x - 54, y - 92], [x - 39, y - 168], [x - 39, y - 92]])}" fill="${T("#5a5868")}"/><path d="${poly([[x - 39, y - 168], [x - 24, y - 92], [x - 16, y - 94], [x - 39, y - 92]])}" fill="${T("#34323e")}"/>`;
    vil += `<path d="M${x - 39},${y - 168} v-12 M${x - 44},${y - 175} h10" stroke="${T("#3a3640")}" stroke-width="2"/>`;
    vil += `<path d="M${x - 44},${y - 70} v-8 a5,5 0 0 1 10,0 v8Z" fill="${NIGHT ? LAMP : T("#3a3442")}"/>`;
    [[x - 30, y - 30], [x - 12, y - 30], [x + 6, y - 30]].forEach(([wx, wy]) => vil += `<path d="M${wx},${wy + 16} v-11 a4,4 0 0 1 8,0 v11Z" fill="${NIGHT ? "#ffb85a" : T("#4a5068")}"/>`);
    if (NIGHT) vil += `<circle cx="${x - 10}" cy="${y - 22}" r="50" fill="url(#mnGlow)" opacity=".4"/>`; }
  const VT = ["#3a2a1a", "#5a3a22", "#8a4a26", "#a85a2a", "#c87a32", "#d89a40", "#e8b858"];
  vhouses.forEach(([x, y, w], i) => {
    if (VR() < .35) vil += leafTree(x - w * .6, y + 4, 50 + VR() * 30, 50, VT);
    vil += house(x, y, w, w * .62, WALLS[Math.floor(VR() * WALLS.length)], ROOFS[Math.floor(VR() * ROOFS.length)], { chim: VR() < .6, lit: VR() });
  });
  s += vil;
  // chimney smoke from the village
  s += `<g class="smoke" opacity="${NIGHT ? .3 : .45}">${[0, 1, 2, 3, 4].map(k => `<circle cx="${F(420 + k * 6)}" cy="${F(488 - k * 18)}" r="${5 + k * 4}" fill="${NIGHT ? "#8aa0b0" : "#ddd6d0"}" opacity="${F(.55 - k * .1)}"/>`).join("")}</g>`;

  /* fog pooled in the valley, behind the hill */
  const fog = (y0, n, op) => { let f = `<g filter="url(#mnFog)" opacity="${op}">`;
    for (let k = 0; k < n; k++) { const x = r() * W, w = 160 + r() * 360;
      f += `<ellipse cx="${F(x)}" cy="${F(y0 + (r() - .5) * 30)}" rx="${F(w)}" ry="${F(10 + r() * 14)}" fill="${NIGHT ? "#a8d8d4" : "#f2eee8"}"/>`; }
    return f + `</g>`; };
  s += fog(540, 16, NIGHT ? .32 : .5);

  /* the hill */
  const hw = wave([1, 3, 5], [210, 90, 40], [6, 3, 1.5]);
  const hill = x => 395 + 168 * ss((Math.abs(x - 1300) - 170) / 520) + hw(x) * ss((Math.abs(x - 1300) - 120) / 200);
  s += `<path d="${ridgePath(hill)}" fill="url(#mnHill)"/>`;
  s += `<path d="${ridgePath(hill)}" fill="url(#mnHillV)"/>`;
  s += `<path d="${line(Array.from({ length: 50 }, (_, i) => [640 + i * 14, hill(640 + i * 14) + 1]))}" stroke="${RIM}" stroke-width="2.2" fill="none" opacity="${NIGHT ? .35 : .45}"/>`;
  // grass texture on the hill, lit on the left slope
  for (let k = 0; k < 2000; k++) { const x = 560 + r() * 1480, top = hill(x); if (top > 566) continue;
    const y = top + 4 + Math.pow(r(), 1.3) * (650 - top), lit = x < 1300 ? .65 : .25, hh = 4 + r() * 7 * (y - 380) / 140;
    s += `<path d="M${F(x)},${F(y)} q${F(-1 + r() * 2)},${F(-hh * .6)} ${F(-2 + r() * 4)},${F(-hh)}" stroke="${T(r() < lit ? "#c0b06a" : "#4a4a2c")}" stroke-width="1.4" fill="none" opacity=".7"/>`; }
  // rock outcrops
  const rock = (x, y, R) => { const sd = x < LX ? -1 : 1;
    return `<path d="${blobP(x, y, R, R * .55, 8)}" fill="${T("#4a4648")}"/><path d="${blobP(x - sd * R * .2, y - R * .15, R * .7, R * .36, 7)}" fill="${T("#7a746e")}"/><path d="${blobP(x - sd * R * .38, y - R * .28, R * .34, R * .16, 6)}" fill="${T("#aaa294")}"/>`; };
  [[880, 520, 16], [1060, 452, 12], [1560, 450, 14], [1720, 500, 18], [1130, 486, 9], [960, 498, 8], [1630, 482, 10]].forEach(([x, y, R]) => s += rock(x, y, R));
  // winding path up the hill
  const PATH = [[1240, 640], [1150, 600], [1110, 560], [1210, 520], [1340, 490], [1360, 456], [1290, 430], [1300, 404]];
  { let d = `M${PATH[0][0]},${PATH[0][1]}`; for (let i = 1; i < PATH.length; i++) { const [x0, y0] = PATH[i - 1], [x1, y1] = PATH[i]; d += ` Q${F((x0 + x1) / 2 + (i % 2 ? -30 : 30))},${F((y0 + y1) / 2)} ${x1},${y1}`; }
    s += `<path d="${d}" stroke="${T("#5e5236")}" stroke-width="16" fill="none" stroke-linecap="round" opacity=".55"/><path d="${d}" stroke="${T("#b8a682")}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${RIM}" stroke-width="2" fill="none" opacity=".35" transform="translate(-2,-2)"/>`; }
  // gravestones on the right slope
  const grave = (x, y, k, tilt) => {
    let g = `<g transform="rotate(${tilt} ${x} ${y})"><ellipse cx="${F(x + 6 * k)}" cy="${F(y)}" rx="${F(12 * k)}" ry="${F(2.5 * k)}" fill="#000" opacity=".25"/>`;
    g += `<path d="M${F(x - 7 * k)},${F(y)} L${F(x - 7 * k)},${F(y - 16 * k)} Q${F(x)},${F(y - 26 * k)} ${F(x + 7 * k)},${F(y - 16 * k)} L${F(x + 7 * k)},${F(y)}Z" fill="${T("#8a8a8e")}"/>`;
    g += `<path d="M${F(x + 7 * k)},${F(y)} L${F(x + 7 * k)},${F(y - 16 * k)} L${F(x + 10 * k)},${F(y - 17 * k)} L${F(x + 10 * k)},${F(y - 1 * k)}Z" fill="${T("#5a5a62")}"/>`;
    g += `<path d="M${F(x - 7 * k)},${F(y - 2)} L${F(x - 7 * k)},${F(y - 16 * k)} Q${F(x - 3 * k)},${F(y - 23 * k)} ${F(x + 2 * k)},${F(y - 23.5 * k)}" stroke="${RIM}" stroke-width="1.3" fill="none" opacity=".7"/>`;
    g += `<path d="M${F(x - 3 * k)},${F(y - 13 * k)} h${F(6 * k)} M${F(x - 3 * k)},${F(y - 9 * k)} h${F(6 * k)}" stroke="${T("#5a5a60")}" stroke-width="1"/>`;
    return g + `</g>`; };
  [[1470, 446, .9, -6], [1500, 458, 1, 4], [1536, 470, 1.1, -3], [1452, 474, 1.15, 8], [1490, 490, 1.25, -5], [1580, 496, 1.2, 5], [1546, 512, 1.35, -8]].forEach(([x, y, k, t]) => s += grave(x, y, k, t));
  // a stone cross
  s += `<g transform="rotate(7 1610 470)"><rect x="1606" y="436" width="8" height="34" fill="${T("#8a8a8e")}"/><rect x="1597" y="444" width="26" height="7" fill="${T("#8a8a8e")}"/><rect x="1606" y="436" width="3" height="34" fill="${RIM}" opacity=".45"/><rect x="1612" y="436" width="2" height="34" fill="#000" opacity=".3"/></g>`;

  /* dead trees on the slopes */
  s += deadTree(1006, hill(1006) + 8, 220, { lean: -.18, depth: 5 });
  s += deadTree(890, hill(890) + 6, 110, { lean: .1, depth: 4 });
  s += deadTree(1770, hill(1770) + 8, 150, { lean: .2, depth: 4, droop: true });
  s += deadTree(720, hill(720) + 4, 80, { lean: -.1, depth: 4 });
  s += deadTree(1880, hill(1880) + 4, 90, { lean: .12, depth: 4 });

  /* ------------------------------------------------------------ the manor */
  const GY = 396;
  const TRIM = "#d6ccc0", CLAP = "#8e8496", CLAP_S = "#5a5266", ROOF = "#3a3644", ROOF_L = "#5c5866", BRICK = "#7a4038";
  const win = (x, y, w, h, o = {}) => {
    const fr = o.arch ? `M${F(x - 3)},${F(y + h + 3)} L${F(x - 3)},${F(y + w / 2)} A${F(w / 2 + 3)},${F(w / 2 + 3)} 0 0 1 ${F(x + w + 3)},${F(y + w / 2)} L${F(x + w + 3)},${F(y + h + 3)}Z`
      : `M${F(x - 3)},${F(y - 3)} h${F(w + 6)} v${F(h + 6)} h${F(-w - 6)}Z`;
    const gl = o.arch ? `M${F(x)},${F(y + h)} L${F(x)},${F(y + w / 2)} A${F(w / 2)},${F(w / 2)} 0 0 1 ${F(x + w)},${F(y + w / 2)} L${F(x + w)},${F(y + h)}Z`
      : `M${F(x)},${F(y)} h${F(w)} v${F(h)} h${F(-w)}Z`;
    const lit = NIGHT && o.lit;
    let g = "";
    if (lit) g += `<circle cx="${F(x + w / 2)}" cy="${F(y + h / 2)}" r="${F(Math.max(w, h) * 1.4)}" fill="url(#${o.lit === "g" ? "mnGlowG" : "mnGlow"})" opacity=".55"/>`;
    g += `<path d="${fr}" fill="${T(TRIM)}"/><path d="${gl}" fill="${lit ? (o.lit === "g" ? "url(#mnPaneG)" : "url(#mnPane)") : T("#262a38")}"/>`;
    if (!lit) g += `<path d="M${F(x)},${F(y + h * .55)} L${F(x + w)},${F(y + h * .2)} L${F(x + w)},${F(y + h * .4)} L${F(x)},${F(y + h * .75)}Z" fill="${T("#8a98b0")}" opacity=".35"/>`;
    g += `<path d="M${F(x + w / 2)},${F(y + (o.arch ? 2 : 0))} v${F(h - (o.arch ? 2 : 0))} M${F(x)},${F(y + h * .5)} h${F(w)}" stroke="${T(mix(TRIM, "#000", .3))}" stroke-width="1.4"/>`;
    g += `<rect x="${F(x - 5)}" y="${F(y + h + 2)}" width="${F(w + 10)}" height="3.5" fill="${T(TRIM)}"/><rect x="${F(x - 5)}" y="${F(y + h + 5.5)}" width="${F(w + 10)}" height="2" fill="#000" opacity=".3"/>`;
    if (o.board) g += `<path d="M${F(x - 2)},${F(y + h * .3)} L${F(x + w + 2)},${F(y + h * .5)} M${F(x - 2)},${F(y + h * .72)} L${F(x + w + 2)},${F(y + h * .6)}" stroke="${T("#6a5040")}" stroke-width="4"/><path d="M${F(x - 2)},${F(y + h * .3 - 1.5)} L${F(x + w + 2)},${F(y + h * .5 - 1.5)}" stroke="${T("#a88a6a")}" stroke-width="1"/>`;
    if (o.shutter) g += `<path d="M${F(x - 3 - w * .45)},${F(y)} h${F(w * .45)} v${F(h)} h${F(-w * .45)}Z" fill="${T("#3a4038")}" transform="rotate(${o.shutter} ${F(x - 3)} ${F(y)})"/>`;
    return g; };
  const clap = (pts, x0, x1, y0, y1, col) => { const id = "mnC" + Math.floor(x0) + "_" + Math.floor(y0);
    let g = `<clipPath id="${id}"><path d="${poly(pts)}"/></clipPath><path d="${poly(pts)}" fill="${T(col)}"/><g clip-path="url(#${id})">`;
    for (let y = y0 + 5; y < y1; y += 5.5) g += `<path d="M${x0},${F(y)} L${x1},${F(y)}" stroke="${T(mix(col, "#000", .25))}" stroke-width="1" opacity=".7"/><path d="M${x0},${F(y + 1.2)} L${x1},${F(y + 1.2)}" stroke="${T(mix(col, "#fff", .18))}" stroke-width=".6" opacity=".6"/>`;
    for (let k = 0; k < (x1 - x0) / 8; k++) g += `<rect x="${F(x0 + r() * (x1 - x0))}" y="${F(y0 + r() * (y1 - y0))}" width="${F(1 + r() * 2)}" height="${F(8 + r() * 24)}" fill="#000" opacity="${F(.05 + r() * .08)}"/>`;
    return g + `</g>`; };
  const shingles = (pts, x0, x1, y0, y1, col, step = 6) => { const id = "mnS" + Math.floor(x0) + "_" + Math.floor(y0);
    let g = `<clipPath id="${id}"><path d="${poly(pts)}"/></clipPath><path d="${poly(pts)}" fill="${T(col)}"/><g clip-path="url(#${id})">`;
    for (let y = y0 + step, row = 0; y < y1 + step; y += step, row++) { let d = ""; for (let x = x0 - (row % 2) * step * .6; x < x1; x += step * 1.2) d += `M${F(x)},${F(y)} a${F(step * .6)},${F(step * .7)} 0 0 0 ${F(step * 1.2)},0 `;
      g += `<path d="${d}" stroke="${T(mix(col, "#000", .35))}" stroke-width="1" fill="none" opacity=".8"/>`; }
    return g + `</g>`; };

  let mn = "";
  mn += `<ellipse cx="1320" cy="${GY + 4}" rx="230" ry="12" fill="#000" opacity=".28"/>`;
  // rear chimney stacks (behind roof)
  const chimney = (x, y0, y1, lean) => `<g transform="skewX(${lean})" style="transform-origin:${x}px ${y1}px"><rect x="${x - 9}" y="${y0}" width="18" height="${y1 - y0}" fill="${T(BRICK)}"/><rect x="${x - 9}" y="${y0}" width="7" height="${y1 - y0}" fill="${T("#a86050")}"/><rect x="${x + 4}" y="${y0}" width="5" height="${y1 - y0}" fill="#000" opacity=".25"/>${Array.from({ length: Math.floor((y1 - y0) / 6) }, (_, k) => `<path d="M${x - 9},${y0 + 6 + k * 6} h18" stroke="${T("#4a2420")}" stroke-width=".8" opacity=".6"/>`).join("")}<rect x="${x - 12}" y="${y0 - 5}" width="24" height="6" fill="${T("#4a3a3a")}"/><rect x="${x - 12}" y="${y0 - 5}" width="24" height="1.6" fill="${RIM}" opacity=".5"/></g>`;
  mn += chimney(1232, 168, 222, -4) + chimney(1384, 176, 222, 5);
  // side wall (shaded, receding right)
  mn += clap([[1404, 266], [1452, 276], [1452, GY - 4], [1404, GY]], 1400, 1456, 262, GY, CLAP_S);
  mn += `<path d="${poly([[1404, 266], [1452, 276], [1452, 290], [1404, 282]])}" fill="url(#mnEave)"/>`;
  [[1414, 296], [1434, 300], [1414, 352], [1434, 356]].forEach(([x, y], i) => { const lit = NIGHT && i === 1;
    mn += `<path d="${poly([[x, y], [x + 11, y + 2], [x + 11, y + 28], [x, y + 26]])}" fill="${T(TRIM)}" opacity=".8"/><path d="${poly([[x + 2, y + 2], [x + 9, y + 3.5], [x + 9, y + 25], [x + 2, y + 24]])}" fill="${lit ? LAMP : T("#1e222e")}"/>`; });
  // main front
  mn += clap([[1196, 266], [1404, 266], [1404, GY], [1196, GY]], 1196, 1404, 266, GY, CLAP);
  mn += `<rect x="1196" y="266" width="208" height="${GY - 266}" fill="url(#mnFacadeSh)"/>`;
  mn += `<rect x="1196" y="266" width="208" height="16" fill="url(#mnEave)"/>`;
  mn += `<rect x="1194" y="326" width="212" height="5" fill="${T(TRIM)}"/><rect x="1194" y="331" width="212" height="2" fill="#000" opacity=".25"/>`;
  mn += `<rect x="1192" y="${GY - 10}" width="216" height="10" fill="${T("#5a5050")}"/><rect x="1192" y="${GY - 10}" width="216" height="2" fill="${RIM}" opacity=".35"/>`;
  [[1206, 284, "y"], [1232, 284, 0], [1352, 284, "g"], [1378, 284, 0]].forEach(([x, y, l], i) => mn += win(x, y, 15, 32, { arch: true, lit: l, board: i === 3, shutter: i === 1 ? 14 : 0 }));
  // mansard roof with iron cresting
  mn += shingles([[1186, 268], [1414, 268], [1398, 220], [1204, 220]], 1186, 1414, 220, 268, ROOF);
  mn += `<path d="${poly([[1186, 268], [1414, 268], [1398, 220], [1204, 220]])}" fill="url(#mnFacadeSh)"/>`;
  mn += shingles([[1414, 268], [1460, 278], [1446, 230], [1398, 220]], 1396, 1462, 220, 280, "#2a2632");
  mn += `<path d="M1186,268 L1204,220" stroke="${RIM}" stroke-width="2" opacity=".6"/><path d="M1184,269 L1416,269 L1462,279" stroke="${T("#2a2632")}" stroke-width="4" fill="none"/><path d="M1184,267 L1416,267" stroke="${RIM}" stroke-width="1" opacity=".4"/>`;
  mn += `<path d="M1202,220 L1400,220 L1448,230" stroke="${T("#2a2632")}" stroke-width="4" fill="none"/>`;
  for (let x = 1206; x < 1446; x += 7) { const y = x < 1400 ? 218 : 218 + (x - 1400) * .2;
    mn += `<path d="M${x},${F(y)} v-9 M${x - 2},${F(y - 7)} l2,-4 l2,4" stroke="${T("#1e1c24")}" stroke-width="1.4" fill="none"/>`; }
  mn += `<path d="M1206,214 L1400,214 L1446,224" stroke="${T("#1e1c24")}" stroke-width="1.2" fill="none"/>`;
  // dormers
  [[1238, 230], [1362, 230]].forEach(([x, y]) => {
    mn += `<path d="${poly([[x - 13, y + 34], [x - 13, y + 8], [x, y - 8], [x + 13, y + 8], [x + 13, y + 34]])}" fill="${T(CLAP)}"/><path d="${poly([[x + 13, y + 8], [x + 18, y + 10], [x + 18, y + 34], [x + 13, y + 34]])}" fill="${T(CLAP_S)}"/>`;
    mn += win(x - 6, y + 10, 12, 20, { arch: true, lit: x > 1300 && NIGHT ? "y" : 0 });
    mn += `<path d="M${x - 17},${y + 11} L${x},${y - 11} L${x + 20},${y + 12}" stroke="${T(ROOF)}" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M${x - 17},${y + 10} L${x},${y - 12}" stroke="${RIM}" stroke-width="1.2" opacity=".6"/>`; });
  // central projecting bay with a steep gable
  mn += clap([[1262, GY], [1262, 250], [1300, 192], [1338, 250], [1338, GY]], 1262, 1338, 192, GY, mix(CLAP, "#ffffff", .08));
  mn += `<rect x="1330" y="250" width="8" height="${GY - 250}" fill="#000" opacity=".18"/>`;
  mn += win(1274, 284, 14, 34, { arch: true, lit: "y" }) + win(1312, 284, 14, 34, { arch: true, lit: 0 });
  mn += `<circle cx="1300" cy="230" r="11" fill="${T(TRIM)}"/><circle cx="1300" cy="230" r="8" fill="${NIGHT ? "url(#mnPaneG)" : T("#262a38")}"/><path d="M1292,230 h16 M1300,222 v16" stroke="${T("#6a6060")}" stroke-width="1.2"/>`;
  if (NIGHT) mn += `<circle cx="1300" cy="230" r="30" fill="url(#mnGlowG)" opacity=".6"/>`;
  mn += `<path d="M1252,256 L1300,186 L1348,256" stroke="${T(ROOF)}" stroke-width="9" fill="none" stroke-linejoin="round"/><path d="M1252,254 L1300,184" stroke="${RIM}" stroke-width="1.6" opacity=".65"/>`;
  for (let k = 0; k < 9; k++) { const t = (k + .5) / 9, x = 1254 + t * 46, y = 252 - t * 64, x2 = 1346 - t * 46;
    mn += `<path d="M${F(x + 2)},${F(y + 3)} l0,6 M${F(x2 - 2)},${F(y + 3)} l0,6" stroke="${T(TRIM)}" stroke-width="1.6"/>`; }
  mn += `<path d="M1300,186 v-16" stroke="${T("#1e1c24")}" stroke-width="2"/><circle cx="1300" cy="168" r="3" fill="${T("#1e1c24")}"/>`;
  // porch
  mn += `<rect x="1220" y="346" width="160" height="${GY - 346}" fill="#000" opacity=".3"/>`;
  [[1208, 352, 0], [1352, 352, "y"], [1378, 352, 0]].forEach(([x, y, l]) => mn += win(x, y, 15, 26, { lit: l }));
  mn += `<rect x="1288" y="354" width="24" height="${GY - 360}" fill="${T("#2a1c18")}"/><rect x="1290" y="356" width="9" height="${GY - 364}" fill="${T("#4a3428")}"/><rect x="1301" y="356" width="9" height="${GY - 364}" fill="${T("#3e2c22")}"/><path d="M1288,354 a12,8 0 0 1 24,0" fill="${NIGHT ? LAMP : T("#262a38")}"/>`;
  if (NIGHT) mn += `<circle cx="1300" cy="366" r="40" fill="url(#mnGlow)" opacity=".5"/><rect x="1292" y="358" width="16" height="4" fill="${LAMP}" opacity=".7"/>`;
  mn += `<path d="${poly([[1212, 348], [1388, 348], [1380, 334], [1220, 334]])}" fill="${T(ROOF_L)}"/><path d="M1212,348 L1388,348" stroke="${T(TRIM)}" stroke-width="3"/><path d="M1220,334 L1380,334" stroke="${RIM}" stroke-width="1.2" opacity=".5"/>`;
  for (let x = 1222; x <= 1380; x += 32) mn += `<rect x="${x - 2}" y="348" width="4" height="${GY - 354}" fill="${T(TRIM)}"/><rect x="${x + 1}" y="348" width="1.5" height="${GY - 354}" fill="#000" opacity=".25"/><path d="M${x + 2},350 q8,0 12,8 M${x - 2},350 q-8,0 -12,8" stroke="${T(TRIM)}" stroke-width="1.4" fill="none"/>`;
  for (let x = 1224; x < 1380; x += 5) if (x < 1284 || x > 1316) mn += `<path d="M${x},${GY - 18} v12" stroke="${T(TRIM)}" stroke-width="1.4" opacity=".85"/>`;
  mn += `<path d="M1220,${GY - 18} H1284 M1316,${GY - 18} H1380" stroke="${T(TRIM)}" stroke-width="2.4"/>`;
  mn += `<path d="${poly([[1282, GY], [1318, GY], [1324, GY + 10], [1276, GY + 10]])}" fill="${T("#6a6060")}"/><path d="M1280,${GY + 4} h40" stroke="${RIM}" stroke-width="1" opacity=".5"/>`;
  // left tower, leaning
  let tw = "";
  tw += clap([[1146, GY], [1146, 196], [1206, 196], [1206, GY]], 1146, 1206, 196, GY, mix(CLAP, "#ffffff", .1));
  tw += `<rect x="1146" y="196" width="60" height="${GY - 196}" fill="url(#mnFacadeSh)"/><rect x="1146" y="196" width="3" height="${GY - 196}" fill="${RIM}" opacity=".45"/>`;
  tw += win(1166, 214, 20, 40, { arch: true, lit: "g" }) + win(1166, 290, 20, 40, { arch: true, lit: 0, board: true }) + win(1166, 352, 20, 30, { lit: "y" });
  tw += `<rect x="1142" y="190" width="68" height="8" fill="${T(TRIM)}"/><rect x="1142" y="198" width="68" height="3" fill="#000" opacity=".3"/>`;
  for (let x = 1148; x < 1208; x += 8) tw += `<path d="M${x},201 v5 h4 v-5" fill="${T(TRIM)}"/>`;
  tw += shingles([[1140, 192], [1176, 70], [1212, 192]], 1140, 1212, 70, 192, "#4a4656", 7);
  tw += `<path d="M1176,70 L1176,192 L1212,192Z" fill="#000" opacity=".35"/><path d="M1140,192 L1176,70" stroke="${RIM}" stroke-width="2" opacity=".65"/>`;
  tw += `<path d="M1140,192 Q1160,170 1176,70 Q1192,170 1212,192" stroke="${T("#2a2632")}" stroke-width="2" fill="none"/>`;
  tw += `<path d="M1176,70 v-26" stroke="${T("#1e1c24")}" stroke-width="2.5"/><circle cx="1176" cy="60" r="3.5" fill="${T("#1e1c24")}"/><path d="M1164,50 l22,0 l-6,-5 M1164,50 l4,4" stroke="${T("#1e1c24")}" stroke-width="2" fill="none"/>`;
  mn += `<g transform="rotate(-3.2 1176 ${GY})">${tw}</g>`;
  // right round turret, leaning the other way
  let tu = "";
  tu += `<path d="M1436,350 Q1461,374 1486,350Z" fill="${T(CLAP_S)}"/><path d="M1440,356 Q1461,382 1482,356" stroke="${T(TRIM)}" stroke-width="2" fill="none"/>`;
  tu += `<rect x="1436" y="236" width="50" height="116" fill="url(#mnCyl)"/>`;
  for (let y = 241; y < 350; y += 5.5) tu += `<path d="M1436,${y} Q1461,${y + 4} 1486,${y}" stroke="#000" stroke-width=".9" fill="none" opacity=".25"/>`;
  [[1448, 252], [1448, 302]].forEach(([x, y], i) => { const lit = NIGHT && i === 0;
    tu += `<rect x="${x - 2}" y="${y - 2}" width="18" height="34" fill="${T(TRIM)}"/><rect x="${x + 1}" y="${y}" width="12" height="30" fill="${lit ? "url(#mnPane)" : T("#262a38")}"/><path d="M${x + 7},${y} v30" stroke="${T("#6a6060")}" stroke-width="1"/>`;
    if (lit) tu += `<circle cx="${x + 7}" cy="${y + 15}" r="30" fill="url(#mnGlow)" opacity=".45"/>`; });
  tu += `<path d="M1428,238 Q1446,224 1461,140 Q1476,224 1494,238Z" fill="url(#mnCone)"/>`;
  for (let k = 1; k < 9; k++) { const t = k / 9, y = 140 + t * 98, hw2 = 33 * Math.pow(t, 1.4);
    tu += `<path d="M${F(1461 - hw2)},${F(y)} Q1461,${F(y + 5 * t)} ${F(1461 + hw2)},${F(y)}" stroke="#000" stroke-width="1" fill="none" opacity=".35"/>`; }
  tu += `<path d="M1428,238 Q1446,224 1461,140" stroke="${RIM}" stroke-width="1.8" fill="none" opacity=".6"/><path d="M1426,238 Q1461,248 1496,238" stroke="${T("#2a2632")}" stroke-width="4" fill="none"/>`;
  tu += `<path d="M1461,140 v-22" stroke="${T("#1e1c24")}" stroke-width="2"/><circle cx="1461" cy="128" r="2.5" fill="${T("#1e1c24")}"/>`;
  mn += `<g transform="rotate(3.8 1461 360)">${tu}</g>`;
  // ivy creeping up the left of the main front
  for (let k = 0; k < 120; k++) { const y = GY - Math.pow(r(), .7) * 120, x = 1198 + r() * 30 * (1 - (GY - y) / 140);
    mn += `<path d="${blobP(x, y, 3 + r() * 2, 2.4, 5)}" fill="${T(["#2a3a22", "#3a4a26", "#5a5a2c", "#8a4a26", "#a85a2a"][Math.floor(r() * 5)])}"/>`; }
  s += mn;

  /* iron fence around the crown, with a stone-pillared gate on the path */
  const fy = x => 414 + Math.pow((x - 1300) / 240, 2) * 12;
  let fe = "";
  [[1060, 1286], [1314, 1560]].forEach(([a, b]) => {
    for (let x = a; x <= b; x += 9) { const y = fy(x), h = 26 - Math.abs(x - 1300) / 60, tilt = (r() - .5) * 6;
      fe += `<g transform="rotate(${F(tilt)} ${x} ${F(y)})"><path d="M${x},${F(y)} v${F(-h)}" stroke="${T("#1a1820")}" stroke-width="2"/><path d="M${x - 2.5},${F(y - h + 1)} l2.5,-6 l2.5,6Z" fill="${T("#1a1820")}"/><path d="M${x - 1},${F(y)} v${F(-h)}" stroke="${RIM}" stroke-width=".7" opacity=".45"/></g>`; }
    fe += `<path d="${line(Array.from({ length: Math.ceil((b - a) / 10) + 1 }, (_, i) => { const x = Math.min(b, a + i * 10); return [x, fy(x) - 6]; }))}" stroke="${T("#1a1820")}" stroke-width="2" fill="none"/>`;
    fe += `<path d="${line(Array.from({ length: Math.ceil((b - a) / 10) + 1 }, (_, i) => { const x = Math.min(b, a + i * 10); return [x, fy(x) - 19 + Math.abs(x - 1300) / 70]; }))}" stroke="${T("#1a1820")}" stroke-width="2" fill="none"/>`; });
  [1278, 1322].forEach(x => { const y = fy(x) + 2;
    fe += `<rect x="${x - 8}" y="${F(y - 44)}" width="16" height="44" fill="${T("#8a8480")}"/><rect x="${x - 8}" y="${F(y - 44)}" width="6" height="44" fill="${T("#aaa298")}"/><rect x="${x + 4}" y="${F(y - 44)}" width="4" height="44" fill="#000" opacity=".25"/><rect x="${x - 10}" y="${F(y - 49)}" width="20" height="6" fill="${T("#6a6460")}"/>`;
    for (let k = 1; k < 5; k++) fe += `<path d="M${x - 8},${F(y - 44 + k * 9)} h16" stroke="${T("#5a5450")}" stroke-width=".8"/>`;
    fe += `<rect x="${x - 4}" y="${F(y - 62)}" width="8" height="12" rx="2" fill="${NIGHT ? LAMP : T("#2a2a30")}" stroke="${T("#1a1820")}" stroke-width="1.5"/><path d="M${x - 5},${F(y - 62)} l5,-5 l5,5" fill="${T("#1a1820")}"/>`;
    if (NIGHT) fe += `<circle cx="${x}" cy="${F(y - 56)}" r="34" fill="url(#mnGlow)" opacity=".7"/>`; });
  // gate leaves standing ajar
  fe += `<path d="M1286,412 L1294,404 L1294,384 L1286,390Z" fill="none" stroke="${T("#1a1820")}" stroke-width="1.6"/><path d="M1314,412 L1308,420 L1308,398 L1314,390Z" fill="none" stroke="${T("#1a1820")}" stroke-width="1.6"/>`;
  for (let k = 1; k < 4; k++) fe += `<path d="M${1286 + k * 2},${412 - k * 2} v-20 M${1314 - k * 1.5},${412 + k * 2} v-20" stroke="${T("#1a1820")}" stroke-width="1.2"/>`;
  // a raven on the right gate pillar
  fe += `<path d="M1318,363 q4,-9 12,-8 q5,1 6,5 l6,1 l-6,2 q0,6 -6,9 l-2,5 l-2,-5 q-6,0 -8,-9Z" fill="${NIGHT ? "#04060c" : "#1a1820"}"/><path d="M1324,357 q4,-3 8,0" stroke="${RIM}" stroke-width="1" fill="none" opacity=".6"/>`;
  s += fe;

  /* the big gnarled tree beside the manor */
  s += deadTree(1608, hill(1608) + 10, 310, { lean: .12, depth: 6, droop: true });
  s += deadTree(1112, hill(1112) + 12, 150, { lean: -.32, depth: 5 });

  /* low fog over the hill's foot */
  s += fog(588, 14, NIGHT ? .38 : .45);

  /* foreground: dark dry meadow, dead brambles, rocks */
  const fw = wave([1, 4, 2], [420, 170, 60], [12, 6, 2]);
  const fore = x => 616 + fw(x) - Math.max(0, 1 - Math.abs(x - 300) / 500) * 30 - Math.max(0, 1 - Math.abs(x - 2250) / 500) * 34;
  s += `<path d="${ridgePath(fore)}" fill="url(#mnFore)"/>`;
  s += `<path d="${line(Array.from({ length: 161 }, (_, i) => [i * 16, fore(i * 16) + 1]))}" stroke="${RIM}" stroke-width="1.6" fill="none" opacity=".3"/>`;
  for (let x = 0; x < W; x += 4 + r() * 7) { const top = fore(x), y = top + 3 + r() * (720 - top), hh = 8 + r() * 22 * (y - top + 50) / 160;
    s += `<path d="M${F(x)},${F(y)} q${F(-3 + r() * 6)},${F(-hh * .6)} ${F(-6 + r() * 12)},${F(-hh)}" stroke="${T(r() < .45 ? "#b8a462" : r() < .5 ? "#7a6a3a" : "#3e3820")}" stroke-width="${F(1.4 + r())}" fill="none" stroke-linecap="round" opacity=".8"/>`; }
  s += rock(560, 660, 34) + rock(1980, 668, 40) + rock(2140, 690, 26) + rock(760, 690, 22);
  s += deadTree(150, fore(150) + 30, 300, { lean: .14, depth: 6, droop: true });
  s += deadTree(2430, fore(2430) + 30, 320, { lean: -.16, depth: 6, droop: true });
  // brambles: tangles of thin thorny twigs with a few last red leaves
  const bramble = (x, y, R) => { let g = "";
    for (let k = 0; k < 26; k++) { const a = -Math.PI * (.08 + r() * .84), L = R * (.5 + r() * .6), bx = x + (r() - .5) * R * .4;
      g += `<path d="M${F(bx)},${F(y)} Q${F(bx + Math.cos(a) * L * .5 + (r() - .5) * 20)},${F(y + Math.sin(a) * L * .6)} ${F(bx + Math.cos(a) * L)},${F(y + Math.sin(a) * L)}" stroke="${T(r() < .3 ? "#8a6a52" : "#2e2420")}" stroke-width="${F(1 + r() * 1.4)}" fill="none"/>`;
      if (r() < .5) g += `<path d="${blobP(x + Math.cos(a) * L * (.5 + r() * .5), y + Math.sin(a) * L * (.5 + r() * .5), 3.5, 2.5, 5)}" fill="${T(r() < .5 ? "#8a2a1e" : "#c0502a")}"/>`; }
    return g; };
  s += `<g filter="url(#mnLeafyS)">${bramble(320, 700, 90) + bramble(470, 712, 60) + bramble(2260, 704, 96) + bramble(2120, 716, 60) + bramble(40, 690, 70) + bramble(2540, 690, 70)}</g>`;

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#mnLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#06122a" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#mnPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
