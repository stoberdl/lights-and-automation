/* A Christmas tree farm on a snowy hillside at midday. Rows of planted firs
   (Fraser, blue spruce, Douglas) follow the contours of the hill and grow with
   distance toward us, with fresh stumps where trees were cut. A red barn in the
   hollow sells trees: open sliding door, wreath, sign, a stack of netted trees,
   string lights. A vintage two-tone pickup waits on the snowy lane with a fir
   tied in the bed. Cardinals on the split-rail fence, faceted blue mountains far
   behind. Sun upper left of the barn; opts.time === "night" swaps it for a
   moon, stars, lit barn and windows, glowing strings of lights.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function treeFarmSnowArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1207;
  const r = rng(seed), rs = rng(seed + 7);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = NIGHT ? 1020 : 960, LY = NIGHT ? 105 : 115;
  const VX = 1300, VY = 420;
  const T = (c, k = .6) => NIGHT ? mix(mix(c, "#6a7090", .35), "#0e1838", k) : c;
  const TS = c => NIGHT ? mix(c, "#22306a", .58) : c;
  const RIM = NIGHT ? "#b4c4ee" : "#fff4d8", LAMP = "#ffcf78";
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
    ? `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R * 4.5)}" fill="url(#tfGlow)" opacity=".55"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(R * 1.15)}" fill="${c}"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(R * .55)}" fill="#fffbe8"/>`
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
  const SKY_H = NIGHT ? "#3a4a78" : "#e4eef6", HZ = NIGHT ? "#33416c" : "#e8f0f6";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#030820"/><stop offset=".5" stop-color="#0c1a46"/><stop offset=".85" stop-color="#24366a"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#2f6cbc"/><stop offset=".45" stop-color="#7cb0e2"/><stop offset=".8" stop-color="#c8def0"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#dfe8ff" stop-opacity=".45"/><stop offset=".15" stop-color="#b8c8f0" stop-opacity=".18"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".05"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fffbe8" stop-opacity=".9"/><stop offset=".18" stop-color="#fff4d0" stop-opacity=".4"/><stop offset=".55" stop-color="#fff0c8" stop-opacity=".1"/><stop offset="1" stop-color="#fff0c8" stop-opacity="0"/>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="tfdefs">
    <linearGradient id="tfSky" x1="0" y1="0" x2="0" y2="460" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="tfLight" cx="${LX}" cy="${LY}" r="760" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="tfHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    ${g2("tfHill1", TS("#d4e0ee"), TS("#bccce0"))}
    <linearGradient id="tfSnow" x1="0" y1="460" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${TS("#eef3fa")}"/><stop offset=".45" stop-color="${TS("#fbfcfe")}"/><stop offset="1" stop-color="${TS("#dfe7f3")}"/></linearGradient>
    ${g2("tfLane", TS("#d2d8e4"), TS("#c0c8d8"))}
    <radialGradient id="tfGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="tfPool"><stop offset="0" stop-color="#ffd890" stop-opacity=".55"/><stop offset=".5" stop-color="#ffb060" stop-opacity=".18"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
    <filter id="tfLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="tfTree" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="tfCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="32" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="tfPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="tfSoft"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#tfSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 520; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 430, big = rs() < .07, o = .2 + rs() * .65 * (1 - y / 470);
      if (Math.hypot(x - LX, y - LY) < 150) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 32;
    s += `<rect width="${W}" height="${H}" fill="url(#tfLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 16}" fill="#cfdcff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#f0f3fc"/>`;
    [[-11, -9, 8, 6], [8, -12, 7, 5], [-2, 8, 10, 6], [12, 6, 5, 5]].forEach(([dx, dy, a, b]) => s += `<ellipse cx="${LX + dx}" cy="${LY + dy}" rx="${a}" ry="${b}" fill="#9aa4bc" opacity=".3"/>`);
    s += `<path d="M${LX + 4},${LY - R} A${R},${R} 0 0 1 ${LX + 4},${LY + R} A${R * .7},${R} 0 0 0 ${LX + 4},${LY - R}Z" fill="#26304e" opacity=".0"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#tfLight)"/><circle cx="${LX}" cy="${LY}" r="38" fill="#fffcee"/>`;
    s += `<g class="rays" opacity=".1" filter="url(#tfSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .5 + k * .3, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#tfCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#18204a"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#242e5a"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="#56669a" opacity=".8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .16)}" rx="${F(R * .4)}" ry="${F(R * .07)}" fill="#a4b4e2" opacity=".65"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .14 * (.6 + rs() * .7), w * (.08 + rs() * .07)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .07)}" fill="#b4c4da"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#c4d2e4"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .85)}" fill="#f6f8fc"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .35)}" rx="${F(R * .6)}" ry="${F(R * .4)}" fill="#ffffff"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(430, 170, 440, "drift1") + cloud(1860, 120, 560, "drift2") + cloud(2330, 240, 280, "drift3") + cloud(150, 262, 220, "drift2");
  if (!NIGHT) { s += `<g class="birds" fill="none" stroke="#3a3a48" stroke-width="2" stroke-linecap="round" opacity=".6">`;
    [[1180, 220, 1], [1206, 208, .8], [1232, 226, .85]].forEach(([x, y, k]) => s += `<path d="M${x - 9 * k},${y - 3 * k} q${5 * k},${-4 * k} ${9 * k},${3 * k} q${4 * k},${-7 * k} ${9 * k},${-3 * k}"/>`);
    s += `</g>`; }
  const cloudPart = s; s = DEFS;

  /* ------------------------------------------------- far mountains, far forest */
  s += mountains({ base: 432, hi: 318, lo: 372, step: 190, lx: LX,
    lit: NIGHT ? "#56669a" : "#e6eef8", mid: NIGHT ? "#3a4878" : "#98aed0", dark: NIGHT ? "#2a3664" : "#6a84b2", rim: NIGHT ? "#b8c8f0" : "#ffffff" });
  s += `<rect x="0" y="350" width="${W}" height="110" fill="url(#tfHaze)"/>`;
  const fw = wave([2, 4, 1], [280, 120, 50], [16, 6, 3]), far = x => 448 + fw(x);
  s += `<path d="${ridgePath(far)}" fill="url(#tfHill1)"/>`;
  { let f = ""; const tr = [];
    for (let row = 0; row < 4; row++) for (let x = -10; x < W + 10; x += 5 + r() * 7) tr.push([x, far(x) + 3 + row * 5 + r() * 4, 9 + r() * 10]);
    tr.sort((a, b) => a[1] - b[1]);
    tr.forEach(([x, y, h]) => f += mini(x, y, h, T(mix("#2e5048", "#c8d4e4", .5)), TS(mix("#ffffff", "#c8d4e4", .25)), LX < x ? -1 : 1));
    s += `<g filter="url(#tfLeafyS)">${f}</g>`; }
  s += `<rect x="0" y="440" width="${W}" height="50" fill="url(#tfHaze)" opacity=".7"/>`;

  /* ------------------------------------------------- the farm hillside */
  const hw = wave([1, 3, 5], [420, 170, 70], [10, 5, 2]);
  const hill = x => 452 + hw(x) + 66 * Math.exp(-(((x - 1290) / 420) ** 2)) - 18 * Math.exp(-(((x - 300) / 300) ** 2)) - 10 * Math.exp(-(((x - 2250) / 260) ** 2));     // a hollow where the barn sits
  s += `<path d="${ridgePath(hill)}" fill="url(#tfSnow)"/>`;
  s += `<path d="${line(Array.from({ length: 161 }, (_, i) => [i * 16, hill(i * 16) + 1]))}" stroke="${TS("#ffffff")}" stroke-width="2" fill="none" opacity=".7"/>`;
  // rows: depth j in [0,1] maps to a contour line on the hill
  const ROWS = 9, rowY = (x, j) => hill(x) + 8 + (712 - hill(x)) * Math.pow(j, 1.3);
  // furrows of shadow between rows
  for (let k = 0; k < ROWS; k++) { const j = (k + .5) / ROWS, pts = Array.from({ length: 81 }, (_, i) => [i * 32, rowY(i * 32, j) + 3]);
    s += `<path d="${line(pts)}" stroke="${TS("#bccae2")}" stroke-width="${F(2 + j * 9)}" fill="none" opacity=".45"/>`; }

  /* the lane: up from the bottom to the barn, then off left over the hill */
  const laneC = y => 1290 - (720 - y) * .1 + Math.sin((720 - y) / 48) * 30, laneW = y => 26 + (y - 560) * .95;
  const laneUp = x => hill(x) + 16 + (x - 260) * .045;       // for x < 1180
  { let L = [], Rr = []; for (let y = 566; y <= 724; y += 8) { L.push([laneC(y) - laneW(y), y]); Rr.push([laneC(y) + laneW(y), y]); }
    s += `<path d="${poly([...L, ...Rr.reverse()])}" fill="url(#tfLane)"/>`;
    const U = [], D = []; for (let x = 1220; x >= 260; x -= 16) { const w = 4 + (laneUp(x) - 470) * .16; U.push([x, laneUp(x) - w]); D.push([x, laneUp(x) + w]); }
    s += `<path d="${poly([...U, ...D.reverse()])}" fill="url(#tfLane)"/>`;
    // tyre ruts with a little slush showing
    [-.45, .45].forEach(o => { const p = []; for (let y = 568; y <= 724; y += 8) p.push([laneC(y) + laneW(y) * o, y]);
      s += `<path d="${line(p)}" stroke="${TS("#a8b4c8")}" stroke-width="7" fill="none" opacity=".7"/><path d="${line(p)}" stroke="${T("#8a8076")}" stroke-width="2.5" fill="none" opacity=".45"/>`;
      const q = []; for (let x = 1220; x >= 260; x -= 16) q.push([x, laneUp(x) + (4 + (laneUp(x) - 470) * .16) * o]);
      s += `<path d="${line(q)}" stroke="${TS("#aab6ca")}" stroke-width="2.5" fill="none" opacity=".7"/>`; });
    for (let k = 0; k < 60; k++) { const y = 580 + r() * 140, x = laneC(y) + (r() - .5) * laneW(y) * 1.8; s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(2 + r() * 4)}" ry="${F(1 + r())}" fill="${TS(r() < .5 ? "#ffffff" : "#b4c0d4")}" opacity=".7"/>`; } }

  /* every standing thing goes in one list and is drawn back to front */
  const items = [];
  const FRASER = NIGHT ? ["#04120c", "#0a1e16", "#12301e", "#1a3c26", "#26502e"] : ["#0c2818", "#143a20", "#1e4e2a", "#2a6432", "#44803c"];
  const BLUE = NIGHT ? ["#08141c", "#10222c", "#1a3240", "#26445a", "#3a5a70"] : ["#1a3438", "#26484c", "#36605e", "#4c7a74", "#7aa09a"];
  const DOUG = NIGHT ? ["#06140c", "#0e2414", "#18341c", "#244a26", "#345e32"] : ["#14301a", "#1e4422", "#2c5a2a", "#3e7234", "#62903e"];
  const SPEC = [FRASER, BLUE, DOUG];
  const snowO = { snowLit: TS("#ffffff"), snowSh: TS("#c2d0e6") };
  const nearBarn = (x, y) => (x > 980 && x < 1500 && y < 610) || (x > 900 && x < 1110 && y > 590 && y < 700);
  const nearTruck = (x, y) => x > 1400 && x < 1800 && y > 540 && y < 740;
  const onLane = (x, y, h) => (y > 556 && Math.abs(x - laneC(y)) < laneW(y) + h * .32) || (x < 1240 && x > 240 && y > laneUp(x) - 6 && y < laneUp(x) + 14 + h * .1);
  for (let k = 0; k < ROWS; k++) { const j = k / (ROWS - 1), spec = SPEC[k % 3];
    for (let x = -30 + r() * 20; x < W + 30; ) { const y = rowY(x, j) + (r() - .5) * 4, h = (13 + (y - 450) * .66) * (.8 + r() * .32), gap = h * (.95 + r() * .35);
      if (nearBarn(x, y) || nearTruck(x, y) || onLane(x, y, h)) { x += gap; continue; }
      const roll = r();
      if (roll < .1) { const R = Math.max(2, h * .05); items.push([y, `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(R * 1.6)}" ry="${F(R * .5)}" fill="${T("#8a6a48")}"/><ellipse cx="${F(x)}" cy="${F(y - R * .3)}" rx="${F(R * 1.4)}" ry="${F(R * .45)}" fill="${TS("#f4f8fc")}"/>`]); x += gap; continue; }
      if (roll < .14) { x += gap; continue; }
      const hh = roll > .9 ? h * .6 : h, sx = x;
      items.push([y, h < 30 ? mini(sx, y, hh, spec[2], TS("#f2f6fc"), LX < sx ? -1 : 1)
        : `<g filter="url(#tfTree)">${spruce(sx, y, hh, { lx: LX, ramp: spec, trunk: T("#4a3020"), edge: NIGHT ? "#3a5a6a" : "#a8c88a", snow: .55, ...snowO })}</g><ellipse cx="${F(sx + (sx < LX ? 1 : -1) * hh * .12)}" cy="${F(y + 1)}" rx="${F(hh * .3)}" ry="${F(hh * .04)}" fill="${NIGHT ? "#0a1230" : "#7a8cb8"}" opacity=".3"/>`]);
      x += gap; } }

  /* the barn: gable toward us with an open sliding door, side wall receding right */
  const glows = [];
  { const x0 = 1110, x1 = 1300, yb = 576, wh = 118, ap = [(x0 + x1) / 2, yb - wh - 92];
    const back = [1450, yb - 22], bh = wh * .86, BR = T("#a8302a"), BRd = T("#7a2420"), BRl = mix(BR, RIM, .2), TR = T("#f2ead8");
    let b = `<ellipse cx="${F((x0 + back[0]) / 2 + 30)}" cy="${yb + 4}" rx="230" ry="14" fill="${NIGHT ? "#0a1230" : "#7a8cb8"}" opacity=".3"/>`;
    // side wall (in shade, light is to the left)
    b += `<path d="${poly([[x1, yb], [x1, yb - wh], [back[0], back[1] - bh], back])}" fill="${BRd}"/>`;
    for (let q = 1; q < 22; q++) { const t = q / 22, xb = x1 + (back[0] - x1) * t; b += `<path d="M${F(xb)},${F(yb + (back[1] - yb) * t)} L${F(xb)},${F(yb - wh + (back[1] - bh - yb + wh) * t)}" stroke="#000" stroke-width="1" opacity=".18"/>`; }
    [[.25, .5], [.6, .85]].forEach(([a, c]) => { const p = t => [x1 + (back[0] - x1) * t, yb + (back[1] - yb) * t], hgt = t => wh + (bh - wh) * t;
      const A = p(a), C = p(c), lit = r() < 2;
      b += `<path d="${poly([[A[0], A[1] - hgt(a) * .72], [C[0], C[1] - hgt(c) * .72], [C[0], C[1] - hgt(c) * .42], [A[0], A[1] - hgt(a) * .42]])}" fill="${TR}"/>`;
      b += `<path d="${poly([[A[0] + 3, A[1] - hgt(a) * .69], [C[0] - 3, C[1] - hgt(c) * .69], [C[0] - 3, C[1] - hgt(c) * .45], [A[0] + 3, A[1] - hgt(a) * .45]])}" fill="${NIGHT && lit ? "#ffc468" : T("#3a3440")}"/>`;
      if (NIGHT) glows.push([(A[0] + C[0]) / 2, (A[1] + C[1]) / 2 - hgt(a) * .57, 40]); });
    // roof plane over the side wall, deep in snow, with a cupola
    const ridgeB = [back[0] - 4, back[1] - bh - 78];
    b += `<path d="${poly([ap, [x1 + 12, yb - wh + 6], [back[0] + 10, back[1] - bh + 5], ridgeB])}" fill="${T("#5a4a48")}"/>`;
    b += `<path d="${poly([[ap[0], ap[1] - 6], [x1 + 14, yb - wh + 1], [back[0] + 12, back[1] - bh], [ridgeB[0], ridgeB[1] - 5]])}" fill="${TS("#dfe6f2")}"/>`;
    b += `<path d="${poly([[ap[0], ap[1] - 6], [ridgeB[0], ridgeB[1] - 5], [ridgeB[0] + 20, ridgeB[1] + 14], [ap[0] + 26, ap[1] + 18]])}" fill="${TS("#f6f9fd")}"/>`;
    for (let q = 0; q < 14; q++) { const t = (q + .5) / 14, ix = x1 + 14 + (back[0] - x1) * t, iy = yb - wh + 1 + (back[1] - bh - yb + wh) * t; b += `<path d="M${F(ix - 2)},${F(iy)} l2,${F(5 + r() * 9)} l2,${F(-6)}" fill="${TS("#e4ecf8")}"/>`; }
    { const cx = (ap[0] + ridgeB[0]) / 2 + 10, cy = (ap[1] + ridgeB[1]) / 2 + 2;
      b += `<rect x="${F(cx - 14)}" y="${F(cy - 30)}" width="28" height="30" fill="${BR}"/><rect x="${F(cx)}" y="${F(cy - 30)}" width="14" height="30" fill="${BRd}"/><path d="M${F(cx - 9)},${F(cy - 26)} h18 M${F(cx - 9)},${F(cy - 20)} h18 M${F(cx - 9)},${F(cy - 14)} h18" stroke="${T("#f2ead8")}" stroke-width="2"/>`;
      b += `<path d="${poly([[cx - 20, cy - 28], [cx, cy - 50], [cx + 20, cy - 28]])}" fill="${T("#5a4a48")}"/><path d="${poly([[cx - 21, cy - 29], [cx, cy - 52], [cx + 21, cy - 29], [cx, cy - 44]])}" fill="${TS("#f6f9fd")}"/>`;
      b += `<path d="M${F(cx)},${F(cy - 52)} v-18 M${F(cx - 9)},${F(cy - 64)} h18" stroke="${T("#2a2a2a")}" stroke-width="2"/><path d="M${F(cx - 2)},${F(cy - 64)} l-10,-4 l4,4 l-4,4Z" fill="${T("#2a2a2a")}"/>`; }
    // front gable wall, lit, boards and trim
    b += `<path d="${poly([[x0, yb], [x0, yb - wh], ap, [x1, yb - wh], [x1, yb]])}" fill="${BR}"/>`;
    for (let x = x0 + 8; x < x1; x += 8) { const yt = x < ap[0] ? yb - wh - (x - x0) / (ap[0] - x0) * 92 : yb - wh - (x1 - x) / (x1 - ap[0]) * 92;
      b += `<path d="M${x},${yb} V${F(yt + 3)}" stroke="${BRd}" stroke-width="1.4" opacity=".55"/>`; }
    b += `<path d="M${x0 + 2},${yb} V${yb - wh}" stroke="${BRl}" stroke-width="4" opacity=".6"/>`;
    // the open sliding door: warm interior with trees and lights
    const dx0 = x0 + 44, dx1 = x1 - 44, dy0 = yb - 92;
    b += `<rect x="${dx0}" y="${dy0}" width="${dx1 - dx0}" height="92" fill="${NIGHT ? "#6a3818" : T("#3a2418")}"/>`;
    b += `<path d="${poly([[dx0, yb], [dx0, dy0], [dx1, dy0], [dx1, yb], [dx1 - 14, yb], [dx0 + 30, dy0 + 20], [dx0 + 4, yb]])}" fill="${NIGHT ? "#ffb050" : T("#6a4628")}" opacity="${NIGHT ? .55 : .5}"/>`;
    for (let q = 0; q < 5; q++) { const tx = dx0 + 14 + q * 20, th = 46 + r() * 20; b += `<path d="${poly([[tx - 9, yb - 2], [tx, yb - th], [tx + 9, yb - 2]])}" fill="${T(q % 2 ? "#2a5a32" : "#1e4a2a")}"/>`; }
    b += strand(dx0 + 2, dy0 + 8, dx1 - 2, dy0 + 8, 10, 2.2, true);
    if (NIGHT) { glows.push([(dx0 + dx1) / 2, yb - 46, 120]); glows.push([(dx0 + dx1) / 2, yb + 10, 90]); }
    // slid-open door panel with X brace, track above
    b += `<rect x="${x0 + 4}" y="${dy0}" width="${dx0 - x0 - 4}" height="92" fill="${BR}"/><path d="M${x0 + 6},${dy0 + 2} L${dx0 - 2},${yb - 2} M${dx0 - 2},${dy0 + 2} L${x0 + 6},${yb - 2}" stroke="${TR}" stroke-width="4"/><rect x="${x0 + 4}" y="${dy0}" width="${dx0 - x0 - 4}" height="92" fill="none" stroke="${TR}" stroke-width="4"/>`;
    b += `<rect x="${x0}" y="${dy0 - 7}" width="${x1 - x0}" height="5" fill="${T("#3a3434")}"/>`;
    b += `<rect x="${dx0 - 3}" y="${dy0}" width="4" height="92" fill="${TR}"/><rect x="${dx1 - 1}" y="${dy0}" width="4" height="92" fill="${TR}"/>`;
    // hay-loft door with the big wreath
    b += `<rect x="${ap[0] - 22}" y="${yb - wh - 40}" width="44" height="40" fill="${TR}"/><rect x="${ap[0] - 18}" y="${yb - wh - 36}" width="36" height="34" fill="${NIGHT ? "#ffc468" : BRd}"/>`;
    if (NIGHT) glows.push([ap[0], yb - wh - 20, 50]);
    { const wx = ap[0], wy = yb - wh - 66; let w = "";
      for (let a = 0; a < 26; a++) { const t = a / 26 * Math.PI * 2, px = wx + Math.cos(t) * 17, py = wy + Math.sin(t) * 17; w += `<path d="${blobP(px, py, 6, 5, 6)}" fill="${T(a % 3 ? "#1e4a2a" : "#2e6a38")}"/>`; }
      for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2; w += `<circle cx="${F(wx + Math.cos(t) * 17)}" cy="${F(wy + Math.sin(t) * 17)}" r="2.6" fill="${T("#d02a2a")}"/>`; }
      w += `<path d="M${wx},${wy + 16} l-10,-7 v14Z M${wx},${wy + 16} l10,-7 v14Z" fill="${T("#c0202a")}"/><path d="M${wx - 2},${wy + 18} l-7,18 M${wx + 2},${wy + 18} l7,18" stroke="${T("#a01a22")}" stroke-width="3.4"/>`;
      b += w; }
    // white trim on the rakes and corners, snow on the rake, icicles
    b += `<path d="M${x0 - 10},${yb - wh + 8} L${ap[0]},${ap[1] - 4} L${x1 + 10},${yb - wh + 8}" stroke="${TR}" stroke-width="6" fill="none" stroke-linejoin="round"/>`;
    b += `<path d="${poly([[x0 - 14, yb - wh + 4], [ap[0], ap[1] - 12], [x1 + 14, yb - wh + 4], [x1 + 8, yb - wh + 7], [ap[0], ap[1] - 5], [x0 - 8, yb - wh + 7]])}" fill="${TS("#ffffff")}"/>`;
    b += `<path d="M${x0},${yb} V${yb - wh} M${x1},${yb} V${yb - wh}" stroke="${TR}" stroke-width="5"/>`;
    // string of lights along both rakes and the eave of the side
    b += strand(x0 - 8, yb - wh + 10, ap[0], ap[1] + 2, 4, 2.6, false) + strand(ap[0], ap[1] + 2, x1 + 8, yb - wh + 10, 4, 2.6, false) + strand(x1 + 12, yb - wh + 8, back[0] + 8, back[1] - bh + 8, 8, 2.4, false);
    // sign over the door
    b += `<rect x="${dx0 - 6}" y="${dy0 - 34}" width="${dx1 - dx0 + 12}" height="22" rx="3" fill="${T("#f4ecd8")}" stroke="${T("#5a3a26")}" stroke-width="2"/>`;
    b += `<text x="${(dx0 + dx1) / 2}" y="${dy0 - 18}" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="13" letter-spacing="1" fill="${T("#a8282a")}">FRESH TREES</text>`;
    // lean-to on the left with a stack of netted trees in front
    b += `<path d="${poly([[x0, yb], [x0, yb - 70], [x0 - 70, yb - 50], [x0 - 70, yb]])}" fill="${T("#8a2a24")}"/><path d="${poly([[x0 + 4, yb - 74], [x0 - 78, yb - 52], [x0 - 78, yb - 44], [x0 + 4, yb - 64]])}" fill="${T("#4a4040")}"/><path d="${poly([[x0 + 4, yb - 78], [x0 - 80, yb - 56], [x0 - 80, yb - 50], [x0 + 4, yb - 70]])}" fill="${TS("#f8fafe")}"/>`;
    for (let q = 0; q < 6; q++) { const nx = x0 - 64 + q * 12, ny = yb + 2, nh = 64 + r() * 14, lean = -8 + q * 1.5;
      b += `<path d="M${nx},${ny} Q${nx - 9},${ny - nh * .5} ${nx + lean},${ny - nh} Q${nx + 9},${ny - nh * .5} ${nx + 6},${ny}Z" fill="${T(q % 2 ? "#245030" : "#2e5e36")}"/>`;
      for (let m = 1; m < 6; m++) b += `<path d="M${F(nx - 6 + lean * m / 6)},${F(ny - nh * m / 6)} l12,${F(-nh / 12)} M${F(nx - 6 + lean * m / 6)},${F(ny - nh * m / 6 - nh / 12)} l12,${F(nh / 12)}" stroke="${T("#e8e0c8")}" stroke-width=".9" opacity=".7"/>`;
      b += `<path d="M${F(nx + lean - 2)},${F(ny - nh)} l2,-8 l2,8" fill="${T("#2a5a32")}"/>`; }
    // snow drifts at the walls
    b += `<path d="${blobP((x0 + x1) / 2 - 60, yb + 2, 140, 7, 10)}" fill="${TS("#f6f9fd")}"/><path d="${blobP((x1 + back[0]) / 2, (yb + back[1]) / 2 + 2, 90, 6, 9)}" fill="${TS("#e6ecf6")}"/>`;
    // stovepipe and smoke
    b += `<rect x="${back[0] - 46}" y="${back[1] - bh - 50}" width="9" height="34" fill="${T("#3a3434")}"/><g class="smoke" opacity="${NIGHT ? .3 : .5}">${[0, 1, 2, 3, 4].map(k => `<circle cx="${F(back[0] - 42 + k * 8)}" cy="${F(back[1] - bh - 60 - k * 18)}" r="${5 + k * 4}" fill="${NIGHT ? "#8a96b8" : "#eef0f4"}" opacity="${.6 - k * .1}"/>`).join("")}</g>`;
    items.push([yb, b]);
    // price board on two posts by the lane
    { const px = 1050, py = 600; let p = `<rect x="${px - 40}" y="${py - 50}" width="5" height="50" fill="${T("#5a3e28")}"/><rect x="${px + 35}" y="${py - 50}" width="5" height="50" fill="${T("#4a3220")}"/>`;
      p += `<rect x="${px - 50}" y="${py - 62}" width="100" height="30" rx="3" fill="${T("#2e5a36")}" stroke="${T("#f2ead8")}" stroke-width="2"/><text x="${px}" y="${py - 43}" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="11" fill="${T("#f4ecd8")}">CHOOSE &amp; CUT</text>`;
      p += `<path d="${poly([[px - 52, py - 63], [px + 52, py - 63], [px + 48, py - 68], [px - 48, py - 68]])}" fill="${TS("#ffffff")}"/>`;
      items.push([py, p]); }
    // lantern post at the lane by the barn
    { const lx = 1325, ly = 596; let p = `<rect x="${lx - 2}" y="${ly - 70}" width="4" height="70" fill="${T("#2a2a2a")}"/><path d="M${lx},${ly - 70} h14 v6" stroke="${T("#2a2a2a")}" stroke-width="3" fill="none"/><rect x="${lx + 8}" y="${ly - 64}" width="12" height="16" rx="2" fill="${NIGHT ? LAMP : T("#3a3a3a")}" stroke="${T("#222222")}" stroke-width="1.5"/><path d="M${lx + 6},${ly - 66} h16 l-8,-6Z" fill="${TS("#ffffff")}"/>`;
      if (NIGHT) { glows.push([lx + 14, ly - 56, 60]); p += `<ellipse cx="${lx + 10}" cy="${ly + 4}" rx="80" ry="16" fill="url(#tfPool)"/>`; }
      items.push([ly, p]); }
  }

  /* the vintage pickup, two-tone, a fir tied in the bed */
  { const x0 = 1480, yb = 624; let t = "";
    const BODY = T("#3e8e88"), BODYd = mix(BODY, "#0e1a2a", .35), BODYl = mix(BODY, RIM, .3), CR = T("#f2ecdc"), CH = T("#c8ccd4");
    t += `<ellipse cx="${x0 + 120}" cy="${yb + 4}" rx="140" ry="12" fill="${NIGHT ? "#0a1230" : "#6a7aa8"}" opacity=".35"/>`;
    const wheel = (cx) => `<circle cx="${cx}" cy="${yb - 20}" r="22" fill="${T("#1e1e22")}"/><circle cx="${cx}" cy="${yb - 20}" r="15" fill="${T("#e8e6e0")}"/><circle cx="${cx}" cy="${yb - 20}" r="11" fill="${T("#9a2a24")}"/><circle cx="${cx}" cy="${yb - 20}" r="6" fill="${CH}"/><circle cx="${cx - 2}" cy="${yb - 22}" r="2.5" fill="#ffffff" opacity=".7"/>`;
    t += wheel(x0 + 46) + wheel(x0 + 176);
    // bed
    t += `<path d="M${x0 + 124},${yb - 26} L${x0 + 124},${yb - 66} L${x0 + 228},${yb - 66} L${x0 + 228},${yb - 26}Z" fill="${BODY}"/><rect x="${x0 + 124}" y="${yb - 70}" width="106" height="6" fill="${BODYl}"/>`;
    for (let q = 0; q < 6; q++) t += `<rect x="${x0 + 134 + q * 16}" y="${yb - 92}" width="3" height="24" fill="${T("#6a4a30")}"/>`;
    t += `<rect x="${x0 + 128}" y="${yb - 92}" width="98" height="4" fill="${T("#7a5a3a")}"/>`;
    // the tied tree lying across bed and cab roof, top forward
    t += `<g transform="translate(${x0 + 250},${yb - 82}) rotate(-86) scale(.42,1)" filter="url(#tfTree)">${spruce(0, 0, 200, { lx: -999, ramp: FRASER, trunk: T("#4a3020"), edge: null, snow: .25, ...snowO })}</g>`;
    t += `<rect x="${x0 + 238}" y="${yb - 86}" width="20" height="7" fill="${T("#6a4428")}"/><ellipse cx="${x0 + 258}" cy="${yb - 82.5}" rx="2.5" ry="3.5" fill="${T("#c8a070")}"/>`;
    // rear fender
    t += `<path d="M${x0 + 140},${yb - 24} C${x0 + 144},${yb - 62} ${x0 + 208},${yb - 62} ${x0 + 214},${yb - 24}Z" fill="${BODYd}"/><path d="M${x0 + 146},${yb - 40} C${x0 + 156},${yb - 56} ${x0 + 196},${yb - 58} ${x0 + 206},${yb - 42}" stroke="${BODYl}" stroke-width="2" fill="none"/>`;
    t += wheel(x0 + 176);
    // cab: cream roof, window with a glint
    t += `<path d="M${x0 + 80},${yb - 26} L${x0 + 82},${yb - 70} Q${x0 + 86},${yb - 104} ${x0 + 106},${yb - 106} L${x0 + 118},${yb - 106} Q${x0 + 126},${yb - 104} ${x0 + 126},${yb - 70} L${x0 + 126},${yb - 26}Z" fill="${BODY}"/>`;
    t += `<path d="M${x0 + 84},${yb - 72} Q${x0 + 88},${yb - 104} ${x0 + 106},${yb - 106} L${x0 + 118},${yb - 106} Q${x0 + 125},${yb - 104} ${x0 + 125},${yb - 72}Z" fill="${CR}"/>`;
    t += `<path d="M${x0 + 90},${yb - 74} Q${x0 + 94},${yb - 98} ${x0 + 106},${yb - 99} L${x0 + 118},${yb - 99} L${x0 + 119},${yb - 74}Z" fill="${NIGHT ? "#2a3450" : T("#6a8aa8")}"/><path d="M${x0 + 96},${yb - 76} L${x0 + 108},${yb - 98} L${x0 + 113},${yb - 98} L${x0 + 101},${yb - 76}Z" fill="#ffffff" opacity=".4"/>`;
    t += `<path d="${blobP(x0 + 106, yb - 108, 22, 5, 8)}" fill="${TS("#ffffff")}"/>`;
    t += `<rect x="${x0 + 104}" y="${yb - 60}" width="9" height="2.5" rx="1" fill="${CH}"/>`;
    // hood and front fender, grille, lamp, bumper
    t += `<path d="M${x0 + 8},${yb - 30} L${x0 + 10},${yb - 56} Q${x0 + 30},${yb - 66} ${x0 + 82},${yb - 66} L${x0 + 82},${yb - 30}Z" fill="${BODY}"/>`;
    t += `<path d="M${x0 + 12},${yb - 57} Q${x0 + 32},${yb - 65} ${x0 + 80},${yb - 65}" stroke="${BODYl}" stroke-width="3" fill="none"/>`;
    t += `<path d="${blobP(x0 + 50, yb - 66, 30, 4, 8)}" fill="${TS("#ffffff")}"/>`;
    t += `<path d="M${x0 + 2},${yb - 22} C${x0 + 6},${yb - 66} ${x0 + 82},${yb - 66} ${x0 + 90},${yb - 22}Z" fill="${BODY}"/><path d="M${x0 + 8},${yb - 40} C${x0 + 18},${yb - 58} ${x0 + 70},${yb - 60} ${x0 + 84},${yb - 40}" stroke="${BODYl}" stroke-width="2.4" fill="none"/>`;
    t += `<path d="M${x0 + 2},${yb - 22} C${x0 + 4},${yb - 40} ${x0 + 30},${yb - 46} ${x0 + 46},${yb - 46} L${x0 + 46},${yb - 22}Z" fill="#000" opacity=".1"/>`;
    t += wheel(x0 + 46);
    t += `<path d="M${x0 + 26},${yb - 24} C${x0 + 28},${yb - 50} ${x0 + 66},${yb - 50} ${x0 + 68},${yb - 24}Z" fill="${BODYd}" opacity="0"/>`;
    for (let q = 0; q < 5; q++) t += `<rect x="${x0 - 4 + q * 3}" y="${yb - 52}" width="2" height="24" fill="${CH}"/>`;
    t += `<circle cx="${x0 + 16}" cy="${yb - 52}" r="7" fill="${CH}"/><circle cx="${x0 + 15}" cy="${yb - 52}" r="5" fill="${NIGHT ? "#ffe8b0" : T("#f4f0e0")}"/>`;
    if (NIGHT) glows.push([x0 + 15, yb - 52, 30]);
    t += `<rect x="${x0 - 10}" y="${yb - 28}" width="26" height="7" rx="3" fill="${CH}"/><rect x="${x0 + 220}" y="${yb - 28}" width="16" height="6" rx="3" fill="${CH}"/>`;
    t += `<rect x="${x0 + 86}" y="${yb - 28}" width="54" height="5" fill="${T("#2a2a2e")}"/>`;
    // tie-down ropes over the tree
    [x0 + 140, x0 + 190].forEach(rx => t += `<path d="M${rx},${yb - 66} Q${rx + 4},${yb - 106} ${rx + 10},${yb - 66}" stroke="${T("#d8c8a0")}" stroke-width="2" fill="none"/>`);
    t += `<path d="M${x0 + 126},${yb - 70} L${x0 + 126},${yb - 26}" stroke="#000" stroke-width="2" opacity=".25"/>`;
    items.push([yb, t]); }

  /* sled with a cut tree, and a split-rail fence along the lane with cardinals */
  { const sx = 1010, sy = 640; let g = `<ellipse cx="${sx + 30}" cy="${sy + 3}" rx="70" ry="7" fill="${NIGHT ? "#0a1230" : "#7a8cb8"}" opacity=".3"/>`;
    g += `<g transform="translate(${sx + 58},${sy - 22}) rotate(-96) scale(.5,1)" filter="url(#tfTree)">${spruce(0, 0, 110, { lx: -999, ramp: DOUG, trunk: T("#4a3020"), edge: null, snow: .3, ...snowO })}</g>`;
    g += `<rect x="${sx - 44}" y="${sy - 18}" width="104" height="8" rx="2" fill="${T("#9a2a24")}"/><path d="M${sx - 52},${sy - 6} Q${sx - 60},${sy - 20} ${sx - 46},${sy - 22}" stroke="${T("#2a2a2a")}" stroke-width="3" fill="none"/><path d="M${sx - 52},${sy - 4} L${sx + 62},${sy - 4}" stroke="${T("#2a2a2a")}" stroke-width="3"/>`;
    for (let q = 0; q < 4; q++) g += `<rect x="${sx - 36 + q * 30}" y="${sy - 12}" width="3" height="8" fill="${T("#2a2a2a")}"/>`;
    g += `<path d="M${sx - 52},${sy - 22} q-20,-6 -30,6" stroke="${T("#c8a070")}" stroke-width="2" fill="none"/>`;
    items.push([sy, g]); }
  { const posts = []; for (let y = 600; y <= 730; y += 26) posts.push([laneC(y) + laneW(y) + 30 + (y - 600) * .5, y]);
    posts.forEach(([x, y], i) => { const k = .6 + (y - 600) / 130 * .7; let f = "";
      f += `<rect x="${F(x - 3 * k)}" y="${F(y - 42 * k)}" width="${F(6 * k)}" height="${F(44 * k)}" fill="${T("#5a3e28")}"/><path d="${blobP(x, y - 43 * k, 5 * k, 2.6 * k, 6)}" fill="${TS("#ffffff")}"/>`;
      if (i + 1 < posts.length) { const [x2, y2] = posts[i + 1], k2 = .6 + (y2 - 600) / 130 * .7;
        [16, 30].forEach(hh => f += `<path d="M${F(x)},${F(y - hh * k)} L${F(x2)},${F(y2 - hh * k2)}" stroke="${T("#7a5a3a")}" stroke-width="${F(4 * k)}" stroke-linecap="round"/><path d="M${F(x)},${F(y - hh * k - 2.4 * k)} L${F(x2)},${F(y2 - hh * k2 - 2.4 * k2)}" stroke="${TS("#ffffff")}" stroke-width="${F(2.4 * k)}" stroke-linecap="round"/>`); }
      if (i === 1 || i === 3) { const bx = x + 18 * k, by = y - 34 * k, c = T("#c41e22");
        f += `<path d="M${F(bx - 7 * k)},${F(by)} q${F(4 * k)},${F(-9 * k)} ${F(10 * k)},${F(-8 * k)} l${F(3 * k)},${F(-5 * k)} l${F(1 * k)},${F(6 * k)} l${F(3 * k)},${F(1 * k)} l${F(-3 * k)},${F(2 * k)} q${F(0)},${F(6 * k)} ${F(-6 * k)},${F(8 * k)}Z" fill="${c}"/><path d="M${F(bx - 7 * k)},${F(by)} l${F(-6 * k)},${F(3 * k)} l${F(2 * k)},${F(-5 * k)}Z" fill="${mix(c, "#000000", .3)}"/><circle cx="${F(bx + 4 * k)}" cy="${F(by - 9 * k)}" r="${F(1.8 * k)}" fill="#1a1a1a"/><path d="M${F(bx + 7 * k)},${F(by - 8 * k)} l${F(3 * k)},${F(1 * k)} l${F(-3 * k)},${F(1 * k)}Z" fill="${T("#f0a030")}"/>`; }
      items.push([y, f]); }); }

  items.sort((a, b) => a[0] - b[0]).forEach(([, g]) => s += g);
  // ground snow sparkle and drift lines in front
  for (let k = 0; k < 160; k++) { const x = r() * W, y = 600 + r() * 120, L = 20 + r() * 60;
    s += `<path d="M${F(x)},${F(y)} q${F(L / 2)},-3 ${F(L)},0" stroke="${TS(r() < .5 ? "#c4d0e6" : "#ffffff")}" stroke-width="2" fill="none" opacity=".55"/>`; }
  for (let k = 0; k < 8; k++) { const x = r() * W, y = 690 + r() * 30; s += `<path d="${blobP(x, y, 90 + r() * 90, 12 + r() * 8, 10)}" fill="${TS(k % 2 ? "#f6f9fd" : "#e0e8f4")}"/>`; }

  if (NIGHT) { let g = ""; glows.forEach(([x, y, R]) => g += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R)}" fill="url(#tfGlow)" opacity=".55"/>`); s += g;
    s += `<ellipse cx="1205" cy="590" rx="170" ry="30" fill="url(#tfPool)"/>`; }

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#tfLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#tfPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
