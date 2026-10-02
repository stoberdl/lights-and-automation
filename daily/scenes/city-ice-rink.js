/* A city plaza ice rink at frosty dusk. An oval rink in the foreground, its
   low wall wrapped in garland and lights with gold ornaments, the ice scored by
   skate tracks and mirroring the huge tree that stands at the far edge. Art-deco
   towers with setbacks, piers and stepped crowns ring the plaza in two-face
   perspective, the tallest with a spire behind the tree; a hazy skyline beyond,
   low shopfronts with wreaths along the plaza, gold stars strung between
   lamp posts. Generic city, no landmarks, no statues. A low winter sun to the
   left tints everything rose and lavender; opts.time === "night" brings deep
   navy, a moon, lit windows and every light aglow.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function cityIceRinkArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1218;
  const r = rng(seed), rs = rng(seed + 7);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = NIGHT ? 1500 : 760, LY = NIGHT ? 88 : 318;
  const VX = 1300, VY = 410;
  const T = (c, k = .6) => NIGHT ? mix(mix(c, "#6a7090", .35), "#0c1636", k) : c;
  const TS = c => NIGHT ? mix(c, "#22306a", .58) : c;
  const RIM = NIGHT ? "#aebee8" : "#ffd8c8", LAMP = "#ffcf78", GOLD = NIGHT ? "#f4c860" : "#d8a838", GOLDL = "#fff0b0";
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
  const wave = (ph, fr, am) => x => fr.reduce((s, f, i) => s + Math.sin(x / f + ph[i]) * am[i], 0);
  const ridgePath = (fn, close = H, x0 = 0, x1 = W) => { let d = `M${x0},${close} L${x0},${F(fn(x0))}`;
    for (let x = x0; x <= x1; x += 16) d += ` L${x},${F(fn(x))}`; return d + ` L${x1},${F(fn(x1))} L${x1},${close}Z`; };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
  const line = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L");
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  /* lights: a bulb (glowing at night), and a sagging strand of them */
  const BULB = ["#ff5040", "#ffd050", "#60d080", "#58b0ff", "#ff90c8", "#fff4d0"];
  const bulb = (x, y, R, c) => NIGHT
    ? `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R * 4.5)}" fill="url(#irGlow)" opacity=".55"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(R * 1.15)}" fill="${c}"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(R * .55)}" fill="#fffbe8"/>`
    : `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R)}" fill="${mix(c, "#5a5a5a", .2)}"/><circle cx="${F(x - R * .3)}" cy="${F(y - R * .3)}" r="${F(R * .4)}" fill="#ffffff" opacity=".6"/>`;
  const strand = (ax, ay, bx, by, sag, R, warm) => {
    const n = Math.max(3, Math.round(Math.hypot(bx - ax, by - ay) / (R * 5))), pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([ax + (bx - ax) * t, ay + (by - ay) * t + Math.sin(t * Math.PI) * sag]); }
    let g = `<path d="${line(pts)}" stroke="${T("#2a2a22")}" stroke-width="${F(Math.max(.8, R * .35))}" fill="none" opacity=".8"/>`;
    pts.forEach(([x, y], i) => { if (i % 1 === 0 && i > 0 && i < n) g += bulb(x, y + R * .6, R, warm ? (i % 3 ? "#ffd27a" : "#fff0c0") : BULB[(i + Math.floor(ax)) % BULB.length]); });
    return g;
  };
  /* garland: a rope of small fir clumps along a sag, with lights */
  const garland = (ax, ay, bx, by, sag, th, lights) => {
    let g = ""; const n = Math.max(4, Math.round(Math.hypot(bx - ax, by - ay) / (th * .7)));
    for (let i = 0; i <= n; i++) { const t = i / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t + Math.sin(t * Math.PI) * sag;
      g += `<path d="${blobP(x, y + th * .15, th * .75, th * .55, 6)}" fill="${T("#1e3a22")}"/><path d="${blobP(x - th * .1, y - th * .1, th * .5, th * .38, 6)}" fill="${T(r() < .5 ? "#2e5a32" : "#3a6a38")}"/>`;
      if (r() < .3) g += `<path d="${blobP(x + th * .15, y - th * .25, th * .25, th * .14, 5)}" fill="${TS("#f2f6fc")}"/>`; }
    if (lights) for (let i = 1; i < n; i += 2) { const t = i / n; g += bulb(ax + (bx - ax) * t, ay + (by - ay) * t + Math.sin(t * Math.PI) * sag + th * .2, Math.max(1.2, th * .2), BULB[i % BULB.length]); }
    return g;
  };

  /* spruce built from drooping branch sprays: each tier is many limbs reaching
     out from the trunk, lit on the light side, with snow resting on each limb */
  const spray = (ax, ay, bx, by, th, fill, edge, sn, snowLit, snowSh) => {
    const dir = Math.sign(bx - ax) || 1, len = Math.hypot(bx - ax, by - ay), N = Math.max(4, Math.round(len / 5));
    const cx = (ax + bx) / 2, cy = Math.min(ay, by) - len * .1;
    const P = t => [(1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * bx, (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * by];
    const up = [], lo = [];
    for (let i = 0; i <= N; i++) { const t = i / N, [px, py] = P(t), k = th * (1 - t * .72);
      up.push([px, py - k * .42 - (i % 2 ? r() * k * .22 : 0)]);
      lo.push([px - dir * k * .35 * (i % 2), py + k * .55 + (i % 2 ? k * (.45 + r() * .5) : r() * k * .15)]); }
    let g = `<path d="${poly([...up, [bx + dir * th * .35, by + th * .12], ...lo.reverse()])}" fill="${fill}"/>`;
    if (edge) g += `<path d="${line(up.slice(1, -1))}" stroke="${edge}" stroke-width="${F(Math.max(.7, th * .14))}" fill="none" opacity=".75"/>`;
    if (sn > 0) { const a = [], b = [];
      for (let i = 1; i < N; i++) { const t = i / N; if (t > .88) break; const [px, py] = P(t), k = th * (1 - t * .72), hh = th * sn * (.3 + .7 * Math.sin(Math.PI * Math.min(1, t * 1.2))) * (.7 + r() * .55);
        a.push([px, py - k * .42 - hh]); b.push([px, py - k * .05]); }
      if (a.length > 1) { const mid = a.map((p, i) => [p[0], p[1] + (b[i][1] - p[1]) * .5]);
        g += `<path d="${poly([...a, ...b.slice().reverse()])}" fill="${snowSh}"/><path d="${poly([...a, ...mid.slice().reverse()])}" fill="${snowLit}"/>`; } }
    return g;
  };
  const spruce = (x, y, h, o) => {
    const ls = o.lx < x ? -1 : 1, R = o.ramp; let g = "";
    const tw = Math.max(1.5, h * .032);
    g += `<path d="${poly([[x - tw, y], [x - tw * .5, y - h * .55], [x + tw * .5, y - h * .55], [x + tw, y]])}" fill="${o.trunk}"/><path d="${poly([[x + ls * tw, y], [x + ls * tw * .5, y - h * .55], [x, y - h * .55], [x, y]])}" fill="${mix(o.trunk, RIM, .3)}"/>`;
    g += `<path d="${poly([[x - h * .09, y - h * .15], [x, y - h * .97], [x + h * .09, y - h * .15]])}" fill="${R[0]}"/>`;
    const tiers = Math.max(3, Math.min(16, Math.round(h / 20))), bot = y - h * .12, top = y - h;
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - (bot - top) * u * .97, w = h * .34 * Math.pow(1 - u, .95) * (.88 + r() * .24) + h * .02;
      const yr = yb - w * .5 - h * .015, th = Math.max(1.8, w * .21), n = w > 60 ? 4 : w > 30 ? 3 : w > 13 ? 2 : 1;
      const sprays = [];
      for (const side of [-1, 1]) for (let k = 0; k < n; k++) {
        const f = 1 - k / (n + .5) * .5 - r() * .16, tipx = x + side * w * f, tipy = yb - w * .04 * k + (r() - .5) * w * .08;
        const v = (side === ls ? .64 : .2) + k * .07 + u * .1 + (r() - .5) * .22;
        sprays.push([k, x + side * tw * .5, yr + k * w * .06, tipx, tipy, th * (1 - k * .1), v, side]); }
      sprays.sort((a, b) => a[0] - b[0]);
      sprays.forEach(([k, ax, ay, bx, by, tk, v, side]) => g += spray(ax, ay, bx, by, tk, R[Math.floor(cl(v) * R.length)], side === ls ? o.edge : null, o.snow, side === ls ? o.snowLit : o.snowSh, o.snowSh));
      if (w > 10) { const fw = w * .42;      // limbs reaching toward us, covering the trunk joint
        g += spray(x + ls * 2, yr + w * .12, x - fw, yb - w * .05, th * .9, R[Math.floor(cl(.42 + (r() - .5) * .2) * R.length)], null, o.snow, ls < 0 ? o.snowLit : o.snowSh, o.snowSh);
        g += spray(x - ls * 2, yr + w * .14, x + fw, yb - w * .02, th * .9, R[Math.floor(cl(.5 + (r() - .5) * .2) * R.length)], null, o.snow, ls > 0 ? o.snowLit : o.snowSh, o.snowSh); }
    }
    g += `<path d="${poly([[x - h * .02, top + h * .06], [x, top - h * .02], [x + h * .02, top + h * .06]])}" fill="${R[2]}"/>`;
    return g;
  };
  /* small far spruce: jagged stacked tiers with a snow shelf, lit side */
  const mini = (x, y, h, c, sn, ls) => {
    const tiers = h > 18 ? 4 : 3; let g = "";
    for (let t = 0; t < tiers; t++) { const u = t / tiers, yb = y - h * .1 - h * .88 * u, w = h * .32 * (1 - u * .8), ya = yb - h * .36;
      const e = [[x - w, yb], [x - w * .5, yb - h * .05], [x, yb + h * .02], [x + w * .5, yb - h * .05], [x + w, yb]];
      g += `<path d="${poly([[x, ya], ...e])}" fill="${c}"/><path d="${poly([[x, ya], ...(ls < 0 ? e.slice(2) : e.slice(0, 3))])}" fill="${mix(c, "#000000", .22)}"/>`;
      if (sn) g += `<path d="${poly([[x, ya], [x - w * .55, ya + h * .22], [x - w * .2, ya + h * .17], [x, ya + h * .22], [x + w * .25, ya + h * .16], [x + w * .55, ya + h * .22]])}" fill="${sn}"/>`; }
    return g;
  };
  /* faceted mountains, lit face toward the light, snow down the faces */
  const mountains = o => {
    const key = []; let x = -180, pk = false;
    while (x < W + 260) { key.push([x, pk ? o.hi + rs() * (o.lo - o.hi) : 0, pk]); x += o.step * (.6 + rs() * .8); pk = !pk; }
    key.forEach((k, i) => { if (k[2]) return; const n = [key[i - 1], key[i + 1]].filter(Boolean).map(p => p[1]);
      const low = n.length ? Math.max(...n) : o.lo; k[1] = low + (o.base - low) * (.25 + rs() * .4); });
    const seg = [];
    for (let i = 0; i < key.length - 1; i++) { const [ax, ay] = key[i], [bx, by] = key[i + 1], a = [];
      for (let s = 0; s <= 5; s++) { const t = s / 5, j = s % 5 ? 1 : 0; a.push([ax + (bx - ax) * t + j * (rs() - .5) * 10, ay + (by - ay) * t + j * (rs() - .5) * o.step * .06]); }
      seg.push(a); }
    const B = o.base + 6; let m = `<path d="${poly([[0, B], ...seg.flat(), [W, B]])}" fill="${o.mid}"/>`;
    for (let i = 1; i < key.length - 1; i++) { if (!key[i][2]) continue;
      const P = key[i], L = key[i - 1], Rr = key[i + 1], fx = P[0] + (rs() - .5) * o.step * .2, Fp = [fx, B];
      const litL = o.lx < P[0], lc = litL ? o.lit : o.dark, rc = litL ? o.dark : o.lit;
      m += `<path d="${poly([...seg[i - 1], Fp])}" fill="${lc}"/><path d="${poly([...seg[i], Fp])}" fill="${rc}"/>`;
      m += `<path d="${poly([P, seg[i - 1][2], [(fx + L[0]) / 2, B]])}" fill="${mix(lc, o.mid, .5)}" opacity=".7"/>`;
      m += `<path d="${poly([P, seg[i][3], [(fx + Rr[0]) / 2, B]])}" fill="${mix(rc, o.mid, .5)}" opacity=".7"/>`;
      for (let k = 0; k < 5; k++) { const t = .25 + k * .14, a = lerp(P, Fp, t * .9), b = lerp(P, litL ? seg[i - 1][1] : seg[i][4], t);
        m += `<path d="M${F(a[0])},${F(a[1])} L${F(b[0])},${F(b[1] + 4)}" stroke="${o.dark}" stroke-width="2" opacity=".35"/>`; }
      m += `<path d="${line(litL ? seg[i - 1] : seg[i])}" stroke="${o.rim}" stroke-width="1.6" fill="none" opacity=".5"/>`; }
    return m;
  };

  /* ------------------------------------------------------------- sky */
  const SKY_H = NIGHT ? "#33406c" : "#f2d8d6", HZ = NIGHT ? "#2c3a66" : "#e8d4dc";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040a22"/><stop offset=".5" stop-color="#0e1a46"/><stop offset=".85" stop-color="#26346a"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#4a6aa8"/><stop offset=".38" stop-color="#8ea6d0"/><stop offset=".7" stop-color="#cfc6e0"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#dfe8ff" stop-opacity=".45"/><stop offset=".15" stop-color="#b8c8f0" stop-opacity=".18"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".05"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff0e0" stop-opacity=".95"/><stop offset=".16" stop-color="#ffc8b8" stop-opacity=".5"/><stop offset=".5" stop-color="#f0a8b8" stop-opacity=".14"/><stop offset="1" stop-color="#f0a8b8" stop-opacity="0"/>`;
  let s = `<defs id="irdefs">
    <linearGradient id="irSky" x1="0" y1="0" x2="0" y2="470" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="irLight" cx="${LX}" cy="${LY}" r="820" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="irHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".65"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="irPlaza" x1="0" y1="470" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#b8b0b4")}"/><stop offset="1" stop-color="${T("#8a8490")}"/></linearGradient>
    <linearGradient id="irIce" x1="0" y1="500" x2="0" y2="700" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#3a4c80"/><stop offset=".5" stop-color="#24346a"/><stop offset="1" stop-color="#1a2654"/>`
      : `<stop offset="0" stop-color="#e8e4f0"/><stop offset=".45" stop-color="#c4d4ea"/><stop offset="1" stop-color="#a4b8d8"/>`}</linearGradient>
    <radialGradient id="irGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="irPool"><stop offset="0" stop-color="#ffd890" stop-opacity=".5"/><stop offset=".5" stop-color="#ffb060" stop-opacity=".16"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
    <radialGradient id="irTreeGlow" cx="1330" cy="320" r="320" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffcf80" stop-opacity=".42"/><stop offset=".5" stop-color="#ff9a50" stop-opacity=".12"/><stop offset="1" stop-color="#ff9a50" stop-opacity="0"/></radialGradient>
    <clipPath id="irRinkClip"><ellipse cx="1300" cy="608" rx="742" ry="88"/></clipPath>
    <filter id="irLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="irTree" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="irRefl" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .06" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.4"/></filter>
    <filter id="irCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="irPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="irSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <linearGradient id="irFaceR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${NIGHT ? "#000000" : "#ffd8c0"}" stop-opacity="${NIGHT ? .2 : .55}"/><stop offset="1" stop-color="${NIGHT ? "#000000" : "#5a5a8a"}" stop-opacity="${NIGHT ? .3 : .25}"/></linearGradient><linearGradient id="irFaceL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a5a8a" stop-opacity=".25"/><stop offset="1" stop-color="${NIGHT ? "#000000" : "#ffd8c0"}" stop-opacity="${NIGHT ? .2 : .45}"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#irSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 260; i++) { const x = rs() * W, y = Math.pow(rs(), 1.6) * 360, big = rs() < .06, o = .2 + rs() * .55 * (1 - y / 400);
      if (Math.hypot(x - LX, y - LY) < 140) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.6 : F(.6 + rs() * .5)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 26;
    s += `<rect width="${W}" height="${H}" fill="url(#irLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 14}" fill="#cfdcff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#f0f3fc"/>`;
    s += `<path d="M${LX},${LY - R} A${R},${R} 0 0 0 ${LX},${LY + R} A${R * .55},${R} 0 0 1 ${LX},${LY - R}Z" fill="#1a2650" opacity=".85"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#irLight)"/><circle cx="${LX}" cy="${LY}" r="34" fill="#fff4ea" opacity=".95"/>`;
    s += `<g class="rays" opacity=".08" filter="url(#irSoft)">`;
    for (let k = 0; k < 6; k++) { const a = -.5 + k * .28, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: long frosty strata lit rose from below by day, moonlit by night */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#irCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .05 * (.6 + rs() * .7), w * (.05 + rs() * .05)]); }
    const C = NIGHT ? ["#18204a", "#242e5a", "#56669a", "#a4b4e2"] : ["#a898bc", "#c0b0cc", "#ecdce6", "#ffe4d8"];
    c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .035)}" fill="${C[0]}"/>`;
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .45)}" fill="${C[1]}"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .14)}" rx="${F(R * .95)}" ry="${F(R * .22)}" fill="${C[2]}" opacity=".9"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .5)}" cy="${F(ly + R * .12)}" rx="${F(R * .5)}" ry="${F(R * .1)}" fill="${C[3]}" opacity=".8"/>`);
    return c + `</g></g>`;
  };
  s += cloud(420, 130, 560, "drift1") + cloud(1950, 96, 680, "drift2") + cloud(2300, 200, 360, "drift3") + cloud(230, 230, 300, "drift2") + cloud(1320, 40, 380, "drift3");
  if (!NIGHT) { s += `<g class="birds" fill="none" stroke="#3a3a52" stroke-width="2" stroke-linecap="round" opacity=".55">`;
    [[860, 236, 1], [884, 226, .8], [906, 240, .85], [930, 230, .7]].forEach(([x, y, k]) => s += `<path d="M${x - 9 * k},${y - 3 * k} q${5 * k},${-4 * k} ${9 * k},${3 * k} q${4 * k},${-7 * k} ${9 * k},${-3 * k}"/>`);
    s += `</g>`; }
  const cloudPart = s; s = DEFS;

  /* --------------------------------------------- far skyline in haze */
  const glows = [];
  const farLayer = (base, hmin, hmax, haze, lit) => { let g = "", x = -20;
    while (x < W + 20) { const w = 22 + r() * 46, h = hmin + r() * (hmax - hmin) * (1 - .4 * Math.exp(-(((x - 1300) / 500) ** 2))), y = base - h;
      const c = T(mix(r() < .5 ? "#8a8aa8" : "#9a94a8", NIGHT ? "#2a3664" : "#e2d4e0", haze)), sd = x + w / 2 < LX ? 1 : -1;
      g += `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h + 2)}" fill="${c}"/><rect x="${F(sd > 0 ? x + w * .6 : x)}" y="${F(y)}" width="${F(w * .4)}" height="${F(h + 2)}" fill="${mix(c, NIGHT ? "#000000" : "#6a6a8a", .18)}"/>`;
      if (r() < .4) g += `<rect x="${F(x + w * .2)}" y="${F(y - 8)}" width="${F(w * .6)}" height="8" fill="${c}"/>`;
      if (r() < .2) g += `<rect x="${F(x + w / 2 - 1)}" y="${F(y - 30)}" width="2" height="22" fill="${c}"/>`;
      for (let wy = y + 6; wy < base - 4; wy += 7) for (let wx = x + 3; wx < x + w - 4; wx += 6) if (r() < (NIGHT ? lit : lit * .25))
        g += `<rect x="${F(wx)}" y="${F(wy)}" width="2.6" height="3.2" fill="${NIGHT ? "#ffd48a" : "#fff4e0"}" opacity="${F(.3 + r() * .5)}"/>`;
      x += w + r() * 4; }
    return g; };
  s += farLayer(452, 70, 150, .62, .35);
  s += `<rect x="0" y="330" width="${W}" height="140" fill="url(#irHaze)"/>`;

  /* --------------------------------------------- art-deco towers in two-face perspective */
  const HZC = NIGHT ? "#22306a" : "#dccfe0";
  const tower = (x, yb, w, top, o) => {
    let g = ""; const side = x < VX ? 1 : -1, dist = Math.abs(x - VX), sw = Math.min(50, dist * .05), k = sw / Math.max(200, dist), hz = o.haze || 0;
    const ST = mix(T(o.stone), HZC, hz), GL = mix(T(o.glass), HZC, hz), GD = mix(GOLD, HZC, hz);
    const frontC = mix(ST, RIM, NIGHT ? 0 : .06), sideC = mix(ST, NIGHT ? "#050a20" : "#4a4a78", .3 * (1 - hz * .6));
    const tiers = o.tiers, hs = [], fh = hz > .2 ? 7 : 9;
    let y0 = yb, ww = w; const total = yb - top;
    for (let t = 0; t < tiers; t++) { const h = tiers === 1 ? total : total * (t === 0 ? .6 : .4 / (tiers - 1)); hs.push([y0, y0 - h, ww]); y0 -= h; ww *= o.step || .78; }
    hs.forEach(([ya, yt, ww], t) => {
      const xl = x - ww / 2, xr = x + ww / 2, se = side > 0 ? xr : xl;
      const sp = (yy) => [se + side * sw * (ww / w), yy + (VY - yy) * k * (ww / w) * 4];
      g += `<path d="${poly([[se, ya], [se, yt], sp(yt), sp(ya)])}" fill="${sideC}"/>`;
      g += `<rect x="${F(xl)}" y="${F(yt)}" width="${F(ww)}" height="${F(ya - yt)}" fill="${frontC}"/>`;
      g += `<rect x="${F(xl)}" y="${F(yt)}" width="${F(ww)}" height="${F(ya - yt)}" fill="url(#irFace${x < LX ? "R" : "L"})" opacity="${F((NIGHT ? .35 : .55) * (1 - hz * .7))}"/>`;
      const np = Math.max(3, Math.round(ww / (o.bay || 13))), bay = ww / np;
      for (let p = 0; p < np; p++) { const bx = xl + p * bay;
        g += `<rect x="${F(bx + bay * .2)}" y="${F(yt + 6)}" width="${F(bay * .6)}" height="${F(ya - yt - 8)}" fill="${GL}"/>`;
        for (let fy = yt + 6; fy < ya - 6; fy += fh) {
          g += `<rect x="${F(bx + bay * .2)}" y="${F(fy + fh - 3)}" width="${F(bay * .6)}" height="2.2" fill="${mix(ST, "#000000", .22)}"/>`;
          if (NIGHT ? r() < .55 - hz * .2 : r() < .04) g += `<rect x="${F(bx + bay * .22)}" y="${F(fy)}" width="${F(bay * .56)}" height="${F(fh - 3.4)}" fill="${NIGHT ? (r() < .8 ? "#ffd27a" : "#fff0c8") : "#ffe6b0"}" opacity="${NIGHT ? F((.6 + r() * .4) * (1 - hz * .4)) : .5}"/>`; }
        g += `<rect x="${F(bx + bay * .82)}" y="${F(yt)}" width="${F(bay * .36)}" height="${F(ya - yt)}" fill="${mix(frontC, RIM, NIGHT ? .1 : .25)}" opacity=".7"/>`; }
      for (let q = 0; q < 8; q++) { const a = sp(yt + (ya - yt) * q / 8), b2 = [se, yt + (ya - yt) * q / 8];
        g += `<path d="M${F(b2[0])},${F(b2[1])} L${F(a[0])},${F(a[1])}" stroke="${mix(sideC, "#000000", .2)}" stroke-width="1.4"/>`;
        if (NIGHT && r() < .5) g += `<path d="M${F(b2[0] + side * 3)},${F(b2[1] + 5)} L${F(a[0] - side * 3)},${F(a[1] + 5)}" stroke="#ffd27a" stroke-width="2.2" opacity="${F(.5 - hz * .25)}" stroke-dasharray="3 3"/>`; }
      g += `<rect x="${F(xl - 3)}" y="${F(yt - 3)}" width="${F(ww + 6)}" height="5" fill="${mix(ST, RIM, .3)}"/><path d="${poly([[xl - 4, yt - 2], [xl + ww * .2, yt - 6], [xr - ww * .25, yt - 7], [xr + 4, yt - 2]])}" fill="${mix(TS("#f4f6fc"), HZC, hz * .5)}"/>`;
      if (t > 0 || o.frieze) { let ch = ""; for (let q = 0; q < Math.round(ww / 10); q++) ch += ` M${F(xl + q * 10 + 2)},${F(yt + 4)} l3,4 l3,-4`; g += `<path d="${ch}" stroke="${GD}" stroke-width="1.6" fill="none" opacity=".85"/>`; }
    });
    const [, ct, cw] = hs[hs.length - 1], cx = x; let apex = ct;
    if (o.crown === "step") {
      g += `<path d="${poly([[cx - cw * .38, ct], [cx - cw * .38, ct - 22], [cx - cw * .22, ct - 22], [cx - cw * .22, ct - 40], [cx + cw * .22, ct - 40], [cx + cw * .22, ct - 22], [cx + cw * .38, ct - 22], [cx + cw * .38, ct]])}" fill="${frontC}"/>`;
      g += `<path d="${poly([[cx + side * cw * .1, ct], [cx + side * cw * .1, ct - 40], [cx + side * cw * .22, ct - 40], [cx + side * cw * .22, ct - 22], [cx + side * cw * .38, ct - 22], [cx + side * cw * .38, ct]])}" fill="${sideC}" opacity=".6"/>`;
      for (let q = -3; q <= 3; q++) g += `<path d="M${cx},${F(ct - 6)} L${F(cx + q * cw * .1)},${F(ct - 34 + Math.abs(q) * 5)}" stroke="${GD}" stroke-width="2" opacity=".85"/>`;
      g += `<path d="M${F(cx - cw * .4)},${F(ct - 22)} H${F(cx + cw * .4)} M${F(cx - cw * .24)},${F(ct - 40)} H${F(cx + cw * .24)}" stroke="${mix(TS("#f4f6fc"), HZC, hz * .5)}" stroke-width="3"/>`;
      apex = ct - 40;
    } else if (o.crown === "pyramid") {
      let yy = ct, cw2 = cw * .9;
      for (let q = 0; q < 4; q++) { const hh = 12; g += `<rect x="${F(cx - cw2 / 2)}" y="${F(yy - hh)}" width="${F(cw2)}" height="${hh}" fill="${frontC}"/><rect x="${F(side > 0 ? cx + cw2 * .1 : cx - cw2 / 2)}" y="${F(yy - hh)}" width="${F(cw2 * .4)}" height="${hh}" fill="${sideC}" opacity=".5"/><rect x="${F(cx - cw2 / 2 - 2)}" y="${F(yy - hh - 2)}" width="${F(cw2 + 4)}" height="3" fill="${GD}"/><path d="${blobP(cx, yy - hh - 3, cw2 * .5, 2.4, 8)}" fill="${mix(TS("#f4f6fc"), HZC, hz * .5)}"/>`; yy -= hh; cw2 *= .72; }
      g += `<path d="${poly([[cx - cw2 / 2, yy], [cx, yy - 26], [cx + cw2 / 2, yy]])}" fill="${GD}"/><path d="${poly([[cx, yy - 26], [cx + side * cw2 / 2, yy], [cx, yy]])}" fill="${mix(GD, "#000000", .25)}"/>`;
      apex = yy - 26;
    } else if (o.crown === "fins") {
      const n = 7; for (let q = 0; q < n; q++) { const u = q / (n - 1) - .5, fx = cx + u * cw * .9, fh2 = 46 * (1 - Math.abs(u) * 1.5) + 8;
        g += `<rect x="${F(fx - 3.5)}" y="${F(ct - fh2)}" width="7" height="${F(fh2)}" fill="${(fx - cx) * side > 0 ? sideC : frontC}"/><path d="${poly([[fx - 3.5, ct - fh2], [fx, ct - fh2 - 8], [fx + 3.5, ct - fh2]])}" fill="${GD}"/>`; }
      g += `<rect x="${F(cx - cw * .45)}" y="${F(ct - 10)}" width="${F(cw * .9)}" height="10" fill="${mix(frontC, "#000000", .1)}"/>`;
      apex = ct - 54;
    } else {
      g += `<rect x="${F(cx - cw * .22)}" y="${F(ct - 30)}" width="${F(cw * .44)}" height="30" fill="${frontC}"/><rect x="${F(side > 0 ? cx : cx - cw * .22)}" y="${F(ct - 30)}" width="${F(cw * .22)}" height="30" fill="${sideC}" opacity=".6"/>`;
      for (let q = 0; q < 5; q++) g += `<rect x="${F(cx - cw * .2 + q * cw * .1)}" y="${F(ct - 27)}" width="2" height="24" fill="${GD}"/>`;
      if (NIGHT) g += `<rect x="${F(cx - cw * .2)}" y="${F(ct - 27)}" width="${F(cw * .4)}" height="24" fill="#ffd27a" opacity=".45"/>`;
      g += `<path d="${poly([[cx - cw * .26, ct - 30], [cx, ct - 46], [cx + cw * .26, ct - 30]])}" fill="${GD}"/>`;
      apex = ct - 46;
    }
    if (o.spire) { const sh = o.spire;
      g += `<path d="${poly([[cx - cw * .14, apex], [cx, apex - sh], [cx + cw * .14, apex]])}" fill="${frontC}"/><path d="${poly([[cx, apex - sh], [cx + side * cw * .14, apex], [cx, apex]])}" fill="${sideC}"/>`;
      for (let q = 1; q < 6; q++) { const yy = apex - sh * q / 7, ww = cw * .14 * (1 - q / 7); g += `<path d="M${F(cx - ww)},${F(yy)} L${cx},${F(yy - 8)} L${F(cx + ww)},${F(yy)}" stroke="${GD}" stroke-width="1.8" fill="none"/>`; }
      apex -= sh; }
    if (o.mast) { g += `<path d="M${cx},${F(apex)} v${-o.mast}" stroke="${mix(T("#6a6a78"), HZC, hz)}" stroke-width="2"/>`; apex -= o.mast;
      if (NIGHT && hz < .3) g += `<circle cx="${cx}" cy="${F(apex)}" r="3" fill="#ff4a3a"/><circle cx="${cx}" cy="${F(apex)}" r="12" fill="#ff4a3a" opacity=".25"/>`; }
    if (NIGHT && hz < .3) g += `<rect x="${F(cx - cw * .45)}" y="${F(ct - 50)}" width="${F(cw * .9)}" height="56" fill="url(#irGlow)" opacity=".45"/>`;
    return g;
  };
  const STONES = ["#d8ccb8", "#c8bcb0", "#b8b4bc", "#cdb8a8", "#c8c0c8", "#d4c4b0", "#bcb8c4", "#e0d4c0", "#a8a4b4"];
  const GLASS = ["#6a7894", "#5e6c8c", "#64728e", "#6a7c9c", "#586684"];
  const CROWNS = ["step", "pyramid", "fins", "mast"];
  const capTop = x => (x < 900 || x > 1500) ? 266 : 120;
  // back row: many slimmer towers in haze
  { const back = []; let x = -40;
    while (x < W + 60) { const w = 60 + r() * 60, top = Math.max(capTop(x) + 64, 300 - r() * 70 + Math.abs(x - 1300) * .02);
      if (Math.abs(x - 1070) > 120) back.push([x, w, top, { stone: STONES[Math.floor(r() * 9)], glass: GLASS[Math.floor(r() * 5)], tiers: 1 + Math.floor(r() * 3), crown: CROWNS[Math.floor(r() * 4)], haze: .5, bay: 11, step: .8, mast: r() < .3 ? 20 : 0 }]);
      x += w * (.8 + r() * .6); }
    back.sort((a, b) => Math.abs(b[0] - VX) - Math.abs(a[0] - VX)).forEach(([x, w, top, o]) => s += tower(x, 452, w, top, o)); }
  s += `<rect x="0" y="380" width="${W}" height="90" fill="url(#irHaze)" opacity=".7"/>`;
  // front row: big varied towers, the tallest with a spire behind the tree
  const TW = [[110, 150, 318, "fins", 3], [400, 168, 300, "step", 3], [690, 130, 330, "pyramid", 2], [870, 110, 300, "step", 3], [1070, 172, 176, "step", 4, 84],
    [1600, 140, 300, "step", 3], [1860, 170, 334, "pyramid", 3], [2150, 150, 312, "fins", 3], [2440, 168, 302, "step", 2]];
  TW.slice().sort((a, b) => Math.abs(b[0] - VX) - Math.abs(a[0] - VX)).forEach(([x, w, top, crown, tiers, spire], i) =>
    s += tower(x, 470, w, top, { stone: STONES[(i * 4) % 9], glass: GLASS[i % 5], tiers, crown, spire, frieze: spire ? 1 : 0, mast: spire ? 20 : crown === "mast" ? 34 : 0 }));
  s += `<rect x="0" y="420" width="${W}" height="70" fill="url(#irHaze)" opacity=".45"/>`;

  /* --------------------------------------------- shopfronts curving round the plaza, nearer = larger */
  const ringY = x => 486 + ((x - 1300) / 1300) ** 2 * 150, kAt = x => (ringY(x) - VY) / 76;
  { const bl = []; let x = -160, i = 0;
    while (x < W + 160) { const w = (150 + r() * 70) * kAt(x); bl.push([x, Math.min(x + w, W + 200), i++]); x += w; }
    bl.sort((a, b) => ringY((a[0] + a[1]) / 2) - ringY((b[0] + b[1]) / 2));
    let g = "";
    bl.forEach(([xa, xb, i]) => {
      const h0 = 60 + (i * 37 % 52), M = (u, v) => { const x = xa + (xb - xa) * u; return [x, ringY(x) - v * h0 * kAt(x)]; };
      const edge = (v, rev) => { const p = []; for (let q = 0; q <= 8; q++) p.push(M(q / 8, v)); return rev ? p.reverse() : p; };
      const band = (v0, v1, u0 = 0, u1 = 1) => { const p = [], n = 4; for (let q = 0; q <= n; q++) p.push(M(u0 + (u1 - u0) * q / n, v0)); for (let q = n; q >= 0; q--) p.push(M(u0 + (u1 - u0) * q / n, v1)); return p; };
      const c = T(["#c8a890", "#b8a4a0", "#d4c0a8", "#a8a0b0", "#c4b49c", "#b8a890"][i % 6]), kk = kAt((xa + xb) / 2);
      g += `<path d="${poly([...edge(0), ...edge(1, true)])}" fill="${c}"/><path d="${poly([...edge(0), ...edge(1, true)])}" fill="url(#irFace${(xa + xb) / 2 < LX ? "R" : "L"})" opacity=".4"/>`;
      g += `<path d="${poly(band(.9, 1.04, -.01, 1.01))}" fill="${mix(c, "#000000", .25)}"/>`;
      // upper windows, two rows
      const nw = Math.max(3, Math.round((xb - xa) / (30 * kk)));
      [[.52, .68], [.74, .86]].forEach(([v0, v1]) => { for (let q = 0; q < nw; q++) { const u0 = (q + .25) / nw, u1 = (q + .75) / nw, on = NIGHT ? r() < .7 : false;
        g += `<path d="${poly(band(v0, v1, u0, u1))}" fill="${on ? "#ffcf78" : T("#5a6688")}"/><path d="${poly(band(v0 - .02, v0, u0 - .02, u1 + .02))}" fill="${TS("#f4f6fc")}"/>`;
        if (on) { const [cx, cy] = M((u0 + u1) / 2, (v0 + v1) / 2); glows.push([cx, cy, 14 * kk]); } } });
      // shop window with display, striped awning, garland and wreath
      g += `<path d="${poly(band(.04, .38, .06, .94))}" fill="${NIGHT ? "#d8884a" : "#9a7a68"}"/><path d="${poly(band(.04, .2, .06, .94))}" fill="${NIGHT ? "#a85a2a" : "#6a5048"}" opacity=".5"/><path d="${poly(band(.24, .38, .06, .94))}" fill="${NIGHT ? "#ffd08a" : "#c8a890"}" opacity=".35"/>`;
      for (let q = 0; q <= Math.round((xb - xa) / (22 * kk)); q++) { const u = .06 + .88 * q / Math.round((xb - xa) / (22 * kk)); g += `<path d="${line([M(u, .04), M(u, .38)])}" stroke="${T("#3a2a28")}" stroke-width="${F(1.6 * kk)}"/>`; }
      if (NIGHT) { const [cx, cy] = M(.5, .2); glows.push([cx, cy, (xb - xa) * .45]); }
      for (let q = 0; q < 7; q++) { const [bx, by] = M(.1 + q * .8 / 6, .1); g += `<circle cx="${F(bx)}" cy="${F(by)}" r="${F(3.2 * kk)}" fill="${T(["#c0282a", "#e0b040", "#f4f0e8", "#2e7a4a"][q % 4])}"/>`; }
      const ns = Math.max(6, Math.round((xb - xa) / (14 * kk)));
      for (let q = 0; q < ns; q++) g += `<path d="${poly(band(.36, .46, .04 + q * .92 / ns, .04 + (q + 1) * .92 / ns))}" fill="${T(q % 2 ? "#f2eadc" : (i % 2 ? "#a8302a" : "#2e6a4a"))}"/>`;
      { const a = M(0, .49), b = M(1, .49); g += garland(a[0], a[1], b[0], b[1], 9 * kk, 5 * kk, true); }
      { const [cx, cy] = M(.5, .63), rr = 7 * kk; g += `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(rr)}" fill="none" stroke="${T("#2e5a32")}" stroke-width="${F(rr * .5)}"/><path d="M${F(cx - rr * .4)},${F(cy + rr)} l${F(rr * .4)},${F(-rr * .4)} l${F(rr * .4)},${F(rr * .4)}" fill="${T("#c0282a")}"/>`; }
      // snow on the parapet, lumpy, and icicles
      const tp = edge(1.04), sn = []; for (let q = 0; q <= 16; q++) { const [x, y] = M(q / 16, 1.04); sn.push([x, y - (3 + (q % 2) * 2 + r() * 2) * kk]); }
      g += `<path d="${poly([...tp, ...sn.reverse()])}" fill="${TS("#f4f6fc")}"/>`;
      for (let q = 0; q < 10; q++) { const [x, y] = M((q + .5) / 10, .9); g += `<path d="M${F(x - 1.5 * kk)},${F(y)} l${F(1.5 * kk)},${F((4 + r() * 6) * kk)} l${F(1.5 * kk)},${F(-5 * kk)}" fill="${TS("#e4ecf8")}"/>`; }
      g += `<path d="${line([M(0, 0), M(0, 1.04)])}" stroke="#000" stroke-width="2" opacity=".18"/>`;
    });
    s += g; }

  /* --------------------------------------------- plaza paving, snow banked at the shop fronts */
  let pz = `M0,720 L0,${F(ringY(0))}`; for (let x = 0; x <= W; x += 32) pz += ` L${x},${F(ringY(x))}`; pz += ` L${W},720Z`;
  s += `<path d="${pz}" fill="url(#irPlaza)"/>`;
  for (let k = 1; k < 14; k++) { let d = ""; for (let x = 0; x <= W; x += 32) { const y = ringY(x) + (720 - ringY(x)) * Math.pow(k / 14, 1.5); d += (x ? " L" : "M") + x + "," + F(y); }
    s += `<path d="${d}" stroke="${T("#7a7480")}" stroke-width="${F(.6 + k * .12)}" fill="none" opacity=".45"/>`; }
  { const P = (k, q) => { const xb = VX + q * 110, xt = VX + (xb - VX) * .25, t = Math.pow(k / 14, 1.5), x = xt + (xb - xt) * t; return [x, ringY(x) + (720 - ringY(x)) * t]; }; let sl = "";
    for (let k = 0; k < 14; k++) for (let q = -30; q < 30; q++) if (r() < .55) sl += `<path d="${poly([P(k, q), P(k, q + 1), P(k + 1, q + 1), P(k + 1, q)])}" fill="${r() < .5 ? "#ffffff" : "#2a2440"}" opacity="${F(.03 + r() * .07)}"/>`;
    s += sl; }
  for (let q = -30; q <= 30; q++) { const xb = VX + q * 110; s += `<path d="M${F(VX + (xb - VX) * .25)},${F(ringY(VX + (xb - VX) * .25) + 4)} L${F(xb)},720" stroke="${T("#7a7480")}" stroke-width="1" opacity=".35"/>`; }
  for (let x = -20; x < W + 20; x += 14) { const y = ringY(x), k = kAt(x); s += `<path d="${blobP(x, y + 2 * k, (12 + r() * 14) * k, (3 + r() * 2.5) * k, 7)}" fill="${TS(r() < .7 ? "#f2f5fa" : "#d6deec")}"/>`; }
  // swept snow heaped toward the bottom corners
  [[0, 1], [W, -1]].forEach(([x0, d]) => { for (let k = 0; k < 14; k++) { const x = x0 + d * (r() * 360), y = ringY(x) + 20 + r() * (720 - ringY(x)), sz = 18 + r() * 30;
    s += `<path d="${blobP(x, y, sz * 1.8, sz * .45, 9)}" fill="${TS("#dfe6f2")}"/><path d="${blobP(x - sz * .2, y - sz * .14, sz * 1.4, sz * .28, 8)}" fill="${TS("#f6f8fc")}"/>`; } });

  /* --------------------------------------------- the huge tree at the rink's far edge */
  const TX = 1330, TY = 528, TH = 452;
  const TR = NIGHT ? ["#06140e", "#0c2216", "#14301e", "#1e4028", "#2c5232"] : ["#102a1e", "#183c26", "#22502e", "#306636", "#4c8044"];
  let tree = `<g filter="url(#irTree)">${spruce(TX, TY, TH, { lx: LX, ramp: TR, trunk: T("#3a2416"), edge: NIGHT ? "#3a6a48" : "#88b070", snow: .22, snowLit: TS("#ffffff"), snowSh: TS("#c4cce4") })}</g>`;
  const top = TY - TH, wAt = y => Math.max(0, (y - top) / (TY - top - 50)) * TH * .33;
  for (let k = 0; k < 10; k++) { const y = top + 44 + k * 38, w = wAt(y) * .92; tree += strand(TX - w, y - 6, TX + w, y + 10, 10 + k * 2, 2.6 + k * .12, k % 3 !== 1); }
  for (let k = 0; k < 110; k++) { const y = top + 40 + r() * (TH - 100), w = wAt(y) * .85, x = TX + (r() * 2 - 1) * w, R = 4 + r() * 4 * (y - top) / TH;
    const c = T(["#d8a838", "#c8202a", "#e8e0f0", "#d8a838", "#b8202a", "#f0c860"][k % 6]);
    tree += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R)}" fill="${c}"/><circle cx="${F(x + R * .3)}" cy="${F(y + R * .3)}" r="${F(R * .7)}" fill="#000" opacity=".2"/><circle cx="${F(x - R * .3)}" cy="${F(y - R * .35)}" r="${F(R * .35)}" fill="#ffffff" opacity="${NIGHT ? .55 : .75}"/>`; }
  { const sx = TX, sy = top - 20, pts = []; for (let k = 0; k < 16; k++) { const a = -Math.PI / 2 + k * Math.PI / 8, R = k % 2 ? 10 : 28; pts.push([sx + Math.cos(a) * R, sy + Math.sin(a) * R]); }
    if (NIGHT) tree += `<circle cx="${sx}" cy="${sy}" r="80" fill="url(#irGlow)"/>`;
    tree += `<path d="${poly(pts)}" fill="${GOLD}"/><path d="${poly([[sx, sy], ...pts.slice(0, 5)])}" fill="${GOLDL}" opacity=".6"/><circle cx="${sx}" cy="${sy}" r="7" fill="${GOLDL}"/>`; }
  if (NIGHT) s += `<rect x="900" y="40" width="860" height="560" fill="url(#irTreeGlow)"/>`;
  s += tree;

  /* --------------------------------------------- the rink */
  const RX = 1300, RY = 608, RRX = 742, RRY = 88;
  // back wall (inside face seen above the far ice)
  s += `<ellipse cx="${RX}" cy="${RY - 14}" rx="${RRX + 6}" ry="${RRY + 6}" fill="${T("#2a4a6e")}"/><path d="M${RX - RRX - 6},${RY - 14} A${RRX + 6},${RRY + 6} 0 0 1 ${RX + RRX + 6},${RY - 14}" stroke="${TS("#f4f6fc")}" stroke-width="5" fill="none"/>`;
  s += `<ellipse cx="${RX}" cy="${RY}" rx="${RRX}" ry="${RRY}" fill="url(#irIce)"/>`;
  // reflections in the ice: tree, star and lights, rippled and faint
  s += `<g clip-path="url(#irRinkClip)"><g transform="matrix(1,0,0,-.42,0,${F(TY * 1.42 + 8)})" opacity="${NIGHT ? .32 : .16}" filter="url(#irRefl)">${tree}</g>`;
  s += `<path d="M${RX - RRX},${RY} A${RRX},${RRY} 0 0 0 ${RX + RRX},${RY}" stroke="#0a1838" stroke-width="22" fill="none" opacity=".16"/><path d="M${RX - RRX},${RY} A${RRX},${RRY} 0 0 1 ${RX + RRX},${RY}" stroke="#0a1838" stroke-width="10" fill="none" opacity=".12"/>`;
  if (NIGHT) for (let k = 0; k < 16; k++) { const x = RX - RRX + 60 + k * (RRX * 2 - 120) / 15; s += `<rect x="${F(x - 4)}" y="${RY - 70}" width="8" height="60" fill="#ffcf78" opacity=".12" filter="url(#irSoft)"/>`; }
  // skate tracks: loops and long arcs
  for (let k = 0; k < 70; k++) { const cx = RX + (r() - .5) * RRX * 1.7, cy = RY + (r() - .5) * RRY * 1.4, a = 60 + r() * 300, b = a * .12;
    s += `<path d="M${F(cx - a)},${F(cy)} Q${F(cx)},${F(cy - b * (r() < .5 ? 1 : -1))} ${F(cx + a)},${F(cy + (r() - .5) * 10)}" stroke="${NIGHT ? "#8a9ad0" : "#ffffff"}" stroke-width="${F(.8 + r())}" fill="none" opacity="${F(.25 + r() * .3)}"/>`; }
  for (let k = 0; k < 40; k++) { const x = RX + (r() - .5) * RRX * 1.8, y = RY + (r() - .5) * RRY * 1.6; s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(20 + r() * 50)}" ry="${F(2 + r() * 3)}" fill="${NIGHT ? "#c8d4ff" : "#ffffff"}" opacity="${F(.1 + r() * .15)}"/>`; }
  s += `</g>`;
  // glare of the low sun / moon on the ice
  s += `<ellipse cx="${F(LX < 1300 ? 1050 : 1450)}" cy="${RY - 20}" rx="380" ry="34" fill="${NIGHT ? "#c8d4ff" : "#fff4ec"}" opacity="${NIGHT ? .1 : .35}" filter="url(#irSoft)"/>`;
  // the wall: front arc, boards with gold medallions, a cap rail with snow, garland and lights
  { const pt = (a, dx = 0, dy = 0) => [RX + Math.cos(a) * (RRX + dx), RY + Math.sin(a) * (RRY + dy)];
    let g = ""; const N = 90, wallH = 22;
    // far wall rim (behind the ice), thin
    const far = []; for (let i = 0; i <= N; i++) far.push(pt(Math.PI + i / N * Math.PI));
    g += `<path d="${line(far.map(([x, y]) => [x, y - 1]))}" stroke="${T("#2e4a6a")}" stroke-width="4" fill="none"/><path d="${line(far.map(([x, y]) => [x, y - 4]))}" stroke="${TS("#f4f6fc")}" stroke-width="3" fill="none"/>`;
    // front wall (toward us)
    const outer = [], inner = []; for (let i = 0; i <= N; i++) { const a = i / N * Math.PI; outer.push(pt(a, 10, 10)); inner.push(pt(a, 0, 0)); }
    const wallTop = outer.map(([x, y]) => [x, y - wallH]);
    g += `<path d="${poly([...wallTop, ...outer.slice().reverse()])}" fill="${T("#2a4a6e")}"/>`;
    g += `<path d="${poly([...wallTop, ...outer.slice().reverse()])}" fill="url(#irFace${"R"})" opacity=".35"/>`;
    for (let i = 3; i < N - 2; i += 5) { const [x, y] = outer[i], c = [x, y - wallH * .5];
      g += `<path d="M${F(x)},${F(y)} v${-wallH}" stroke="${T("#1e3858")}" stroke-width="2"/>`;
      if (i % 10 === 3) g += `<circle cx="${F(c[0] + 18)}" cy="${F(c[1])}" r="6" fill="${GOLD}"/><circle cx="${F(c[0] + 16.5)}" cy="${F(c[1] - 1.5)}" r="2.2" fill="${GOLDL}" opacity=".8"/>`; }
    g += `<path d="${line(wallTop)}" stroke="${T("#e8e4ec")}" stroke-width="7" fill="none"/><path d="${line(wallTop.map(([x, y]) => [x, y - 3]))}" stroke="${TS("#ffffff")}" stroke-width="4" fill="none"/>`;
    for (let i = 0; i < N; i += 3) { const [x, y] = wallTop[i], [x2, y2] = wallTop[Math.min(N, i + 3)]; g += garland(x, y + 2, x2, y2 + 2, 5, 5.5, true); }
    // red bows at intervals
    for (let i = 6; i < N; i += 12) { const [x, y] = wallTop[i]; g += `<path d="M${F(x)},${F(y + 4)} l-9,-6 v12Z M${F(x)},${F(y + 4)} l9,-6 v12Z" fill="${T("#c0202a")}"/><path d="M${F(x - 1)},${F(y + 6)} l-4,14 M${F(x + 1)},${F(y + 6)} l4,14" stroke="${T("#a01a22")}" stroke-width="2.6"/>`; }
    s += g; }

  /* --------------------------------------------- deco lamp posts round the rink, gold stars strung between */
  const lamps = [[560, 640, .9], [780, 548, .7], [1040, 522, .6], [1600, 522, .6], [1840, 548, .7], [2050, 640, .9]];
  { let g = ""; const tops = [];
    lamps.forEach(([x, yb, k]) => { const h = 200 * k, IR = T("#1e2430");
      g += `<path d="${poly([[x - 6 * k, yb], [x - 3 * k, yb - 16 * k], [x - 2 * k, yb - h], [x + 2 * k, yb - h], [x + 3 * k, yb - 16 * k], [x + 6 * k, yb]])}" fill="${IR}"/>`;
      for (let q = 0; q < 8; q++) { const y = yb - 22 * k - q * (h - 40 * k) / 8; g += `<path d="${blobP(x + (q % 2 ? 3 : -3) * k, y, 6 * k, 4 * k, 6)}" fill="${T(q % 2 ? "#2e5a32" : "#24482a")}"/>`; }
      const ly = yb - h - 20 * k;
      g += `<path d="${poly([[x - 8 * k, ly + 20 * k], [x - 12 * k, ly], [x + 12 * k, ly], [x + 8 * k, ly + 20 * k]])}" fill="${NIGHT ? LAMP : T("#f0ece0")}" stroke="${IR}" stroke-width="${F(2 * k)}"/>`;
      g += `<path d="${poly([[x - 15 * k, ly + 1], [x, ly - 14 * k], [x + 15 * k, ly + 1]])}" fill="${GOLD}"/><path d="${poly([[x - 15 * k, ly - 1], [x, ly - 16 * k], [x + 15 * k, ly - 1], [x, ly - 9 * k]])}" fill="${TS("#f4f6fc")}"/>`;
      if (NIGHT) { glows.push([x, ly + 10 * k, 70 * k]); g += `<ellipse cx="${x}" cy="${F(yb + 6)}" rx="${F(100 * k)}" ry="${F(18 * k)}" fill="url(#irPool)"/>`; }
      tops.push([x, ly - 18 * k, k]); });
    // wires between posts with hanging gold stars and baubles
    for (let i = 0; i < tops.length - 1; i++) { const [ax, ay, ka] = tops[i], [bx, by] = tops[i + 1]; if (i === 2) continue;
      const n = 6, sag = 26 * ka; g += `<path d="M${ax},${ay} Q${(ax + bx) / 2},${(ay + by) / 2 + sag * 2} ${bx},${by}" stroke="${T("#2a2a30")}" stroke-width="1.2" fill="none"/>`;
      for (let q = 1; q < n; q++) { const t = q / n, x = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * (ax + bx) / 2 + t * t * bx, y = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * ((ay + by) / 2 + sag * 2) + t * t * by, R = 9 * ka;
        g += `<path d="M${F(x)},${F(y)} v${F(R * 1.2)}" stroke="${T("#5a5040")}" stroke-width="1"/>`;
        if (q % 2) { const pts = []; for (let m = 0; m < 10; m++) { const a = -Math.PI / 2 + m * Math.PI / 5, rr = m % 2 ? R * .42 : R; pts.push([x + Math.cos(a) * rr, y + R * 2.2 + Math.sin(a) * rr]); }
          g += `<path d="${poly(pts)}" fill="${GOLD}"/><path d="${poly([[x, y + R * 2.2], ...pts.slice(0, 3)])}" fill="${GOLDL}" opacity=".6"/>`;
          if (NIGHT) g += `<circle cx="${F(x)}" cy="${F(y + R * 2.2)}" r="${F(R * 2.4)}" fill="url(#irGlow)" opacity=".4"/>`; }
        else g += `<circle cx="${F(x)}" cy="${F(y + R * 1.9)}" r="${F(R * .6)}" fill="${T("#c0202a")}"/><circle cx="${F(x - R * .2)}" cy="${F(y + R * 1.7)}" r="${F(R * .2)}" fill="#fff" opacity=".7"/>`; } }
    s += g; }

  /* --------------------------------------------- foreground: planters with small lit firs and snow */
  [[150, 712, 190], [2420, 712, 200]].forEach(([x, y, h]) => {
    s += `<g filter="url(#irTree)">${spruce(x, y - 34, h, { lx: LX, ramp: TR, trunk: T("#3a2416"), edge: NIGHT ? "#3a6a48" : "#88b070", snow: .7, snowLit: TS("#ffffff"), snowSh: TS("#c4cce4") })}</g>`;
    for (let k = 0; k < 5; k++) { const yy = y - 70 - k * (h - 70) / 5, w = (y - 34 - yy) * .33; s += strand(x - w, yy, x + w, yy + 8, 8, 2.4, true); }
    s += `<path d="${poly([[x - 60, y - 40], [x + 60, y - 40], [x + 54, y + 10], [x - 54, y + 10]])}" fill="${T("#5a5a68")}"/><rect x="${x - 64}" y="${y - 46}" width="128" height="10" fill="${TS("#f4f6fb")}"/><path d="M${x - 50},${y - 30} h100" stroke="${GOLD}" stroke-width="2"/>`; });

  if (NIGHT) { let g = ""; glows.forEach(([x, y, R]) => g += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R)}" fill="url(#irGlow)" opacity=".5"/>`); s += g;
    s += `<ellipse cx="1330" cy="560" rx="420" ry="60" fill="url(#irPool)"/>`; }

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#irLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#irPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
