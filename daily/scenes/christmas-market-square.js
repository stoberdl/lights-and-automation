/* Christmas market in an old-town square, late on a December afternoon.
   One-point perspective into the square (vanishing point at the giant tree):
   half-timbered houses close the far side and recede along both wings, a
   church spire rises behind them, wooden stalls with snowy roofs, garland and
   string lights stand in rows, and the giant decorated spruce fills the middle
   on a fenced base with presents. Fresh snow lies on roofs and the square,
   trodden back to cobbles round the tree. Low winter sun behind the right-hand
   roofs; opts.time === "night" swaps it for a moon, stars, lit windows and
   glowing string lights. Faceted alpine peaks far behind.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function christmasMarketSquareArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1225;
  const r = rng(seed), rs = rng(seed + 7);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = NIGHT ? 1480 : 1580, LY = NIGHT ? 100 : 262;
  const VX = 1300, VY = 420, WD0 = 120;                          // vanishing point
  const T = (c, k = .6) => NIGHT ? mix(mix(c, "#6a7090", .35), "#0e1838", k) : c;
  const TS = c => NIGHT ? mix(c, "#22306a", .6) : c;
  const RIM = NIGHT ? "#aebee8" : "#ffd9a8", LAMP = "#ffcf78";
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
    ? `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R * 4.5)}" fill="url(#cmGlow)" opacity=".55"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(R * 1.15)}" fill="${c}"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(R * .55)}" fill="#fffbe8"/>`
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
  const SKY_H = NIGHT ? "#34446e" : "#f6d8b8", HZ = NIGHT ? "#2e3c66" : "#f0d4bc";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040920"/><stop offset=".45" stop-color="#0d1a44"/><stop offset=".82" stop-color="#22325e"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#5a7fbc"/><stop offset=".42" stop-color="#9fb6d8"/><stop offset=".74" stop-color="#e8cdbc"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#dfe8ff" stop-opacity=".45"/><stop offset=".15" stop-color="#b8c8f0" stop-opacity=".18"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".05"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2d0" stop-opacity=".95"/><stop offset=".16" stop-color="#ffd8a0" stop-opacity=".5"/><stop offset=".5" stop-color="#ffc890" stop-opacity=".14"/><stop offset="1" stop-color="#ffc890" stop-opacity="0"/>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="cmdefs">
    <linearGradient id="cmSky" x1="0" y1="0" x2="0" y2="470" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="cmLight" cx="${LX}" cy="${LY}" r="800" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="cmHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    ${g2("cmHill", T("#c8cede"), T("#aab4c8"))}
    <linearGradient id="cmSnow" x1="0" y1="470" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${TS("#e6e8f2")}"/><stop offset=".5" stop-color="${TS("#f4f2f4")}"/><stop offset="1" stop-color="${TS("#d6dcec")}"/></linearGradient>
    <radialGradient id="cmGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="cmPool"><stop offset="0" stop-color="#ffd890" stop-opacity=".55"/><stop offset=".5" stop-color="#ffb060" stop-opacity=".18"/><stop offset="1" stop-color="#ffb060" stop-opacity="0"/></radialGradient>
    <radialGradient id="cmTreeGlow" cx="1300" cy="380" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffcf80" stop-opacity=".45"/><stop offset=".5" stop-color="#ff9a50" stop-opacity=".14"/><stop offset="1" stop-color="#ff9a50" stop-opacity="0"/></radialGradient>
    <filter id="cmLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="cmTree" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="cmCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="cmPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="cmSoft"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#cmSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 460; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 420, big = rs() < .07, o = .2 + rs() * .65 * (1 - y / 460);
      if (Math.hypot(x - LX, y - LY) < 150) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 30;
    s += `<rect width="${W}" height="${H}" fill="url(#cmLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 16}" fill="#cfdcff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#f2f4fc"/>`;
    [[-10, -8, 8, 6], [7, -12, 7, 5], [-3, 7, 9, 6], [10, 9, 5, 5]].forEach(([dx, dy, a, b]) => s += `<ellipse cx="${LX + dx}" cy="${LY + dy}" rx="${a}" ry="${b}" fill="#9aa4bc" opacity=".3"/>`);
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#cmLight)"/><circle cx="${LX}" cy="${LY}" r="36" fill="#fff6e0"/>`;
    s += `<g class="rays" opacity=".1" filter="url(#cmSoft)">`;
    for (let k = 0; k < 7; k++) { const a = 1.9 + k * .3, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: soft winter cumulus lit pink-gold from below by day, thin moonlit strata by night */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#cmCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#18204a"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#242e5a"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="#56669a" opacity=".8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .16)}" rx="${F(R * .4)}" ry="${F(R * .07)}" fill="#a4b4e2" opacity=".65"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .12 * (.6 + rs() * .7), w * (.08 + rs() * .06)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .04)}" rx="${F(w * .55)}" ry="${F(w * .06)}" fill="#c8b4c0"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .7)}" fill="#d8c4cc"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .8)}" fill="#f4eef0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly + R * .3)}" rx="${F(R * .7)}" ry="${F(R * .3)}" fill="#ffd8b0" opacity=".75"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .2)}" cy="${F(ly - R * .35)}" rx="${F(R * .55)}" ry="${F(R * .35)}" fill="#fffaf4"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(470, 150, 460, "drift1") + cloud(1900, 110, 520, "drift2") + cloud(2340, 220, 300, "drift3") + cloud(180, 250, 240, "drift2");
  if (!NIGHT) { s += `<g class="birds" fill="none" stroke="#3a3a48" stroke-width="2" stroke-linecap="round" opacity=".6">`;
    [[1130, 196, 1], [1156, 186, .8], [1180, 204, .85], [1208, 192, .7]].forEach(([x, y, k]) => s += `<path d="M${x - 9 * k},${y - 3 * k} q${5 * k},${-4 * k} ${9 * k},${3 * k} q${4 * k},${-7 * k} ${9 * k},${-3 * k}"/>`);
    s += `</g>`; }
  const cloudPart = s; s = DEFS;

  /* ------------------------------------------------------------- far: alps, hill, far roofs */
  s += mountains({ base: 420, hi: 300, lo: 352, step: 170, lx: LX,
    lit: NIGHT ? "#56669a" : "#f2e4e4", mid: NIGHT ? "#3a4878" : "#c4c4d8", dark: NIGHT ? "#2a3664" : "#9ea4c4", rim: NIGHT ? "#b8c8f0" : "#fff2e0" });
  s += `<rect x="0" y="330" width="${W}" height="120" fill="url(#cmHaze)"/>`;
  const hw = wave([2, 4, 1], [260, 120, 50], [14, 6, 3]), hill = x => 440 + hw(x);
  s += `<path d="${ridgePath(hill)}" fill="url(#cmHill)"/>`;
  { let f = ""; const tr = [];
    for (let row = 0; row < 3; row++) for (let x = -10; x < W + 10; x += 6 + r() * 8) tr.push([x, hill(x) + 4 + row * 6 + r() * 4, 9 + r() * 9]);
    tr.sort((a, b) => a[1] - b[1]);
    tr.forEach(([x, y, h]) => f += mini(x, y, h, T(mix("#3a5a50", "#c8cede", .55)), TS(mix("#ffffff", "#c8cede", .3)), LX < x ? -1 : 1));
    s += `<g filter="url(#cmLeafyS)" opacity=".9">${f}</g>`; }
  s += `<rect x="0" y="420" width="${W}" height="60" fill="url(#cmHaze)" opacity=".7"/>`;

  /* --------------------------------------------- the church behind the far row */
  { const x = 985, yb = 470, tw = 74, ty = 236;
    const ST = T("#d8ccb8"), STD = T("#a89a88");
    s += `<path d="${poly([[x - 150, yb], [x - 150, 330], [x - 40, 330], [x - 40, yb]])}" fill="${T("#cfc2ae")}"/>`;
    s += `<path d="${poly([[x - 160, 334], [x - 95, 270], [x - 30, 334]])}" fill="${T("#5a4a4a")}"/><path d="${poly([[x - 156, 334], [x - 95, 274], [x - 120, 334]])}" fill="${TS("#eef0f6")}"/>`;
    s += `<rect x="${x - tw / 2}" y="${ty}" width="${tw}" height="${yb - ty}" fill="${ST}"/><rect x="${x + tw * .1}" y="${ty}" width="${tw * .4}" height="${yb - ty}" fill="${STD}" opacity=".7"/>`;
    for (let k = 0; k < 14; k++) s += `<rect x="${x - tw / 2}" y="${ty + k * 17}" width="${tw}" height="1.2" fill="${T("#8a7c6a")}" opacity=".4"/>`;
    s += `<rect x="${x - tw / 2 - 4}" y="${ty - 6}" width="${tw + 8}" height="8" fill="${T("#bcae98")}"/>`;
    // belfry with louvred arches, clock below
    [[x - 22, ty + 14], [x + 6, ty + 14]].forEach(([bx, by]) => s += `<path d="M${bx},${by + 34} L${bx},${by + 10} Q${bx + 8},${by} ${bx + 16},${by + 10} L${bx + 16},${by + 34}Z" fill="${NIGHT ? "#3a2a1a" : T("#3a3440")}"/>`);
    if (NIGHT) s += `<rect x="${x - 22}" y="${ty + 30}" width="44" height="18" fill="#ffb860" opacity=".25"/>`;
    s += `<circle cx="${x}" cy="${ty + 76}" r="15" fill="${T("#f4ecd8")}" stroke="${T("#3a3226")}" stroke-width="3"/><path d="M${x},${ty + 76} l0,-10 M${x},${ty + 76} l7,3" stroke="${T("#2a2420")}" stroke-width="2"/>`;
    if (NIGHT) s += `<circle cx="${x}" cy="${ty + 76}" r="15" fill="#ffe0a0" opacity=".55"/>`;
    s += `<rect x="${x - 10}" y="${ty + 120}" width="20" height="40" rx="10" fill="${NIGHT ? "#e8a050" : T("#3a3440")}"/>`;
    // the spire: two lit/shaded faces, copper green, snow along the ribs
    const sp = [x, 96];
    s += `<path d="${poly([[x - tw / 2 - 2, ty - 4], sp, [x, ty - 4]])}" fill="${T("#5e8a7a")}"/><path d="${poly([sp, [x + tw / 2 + 2, ty - 4], [x, ty - 4]])}" fill="${T("#3e6658")}"/>`;
    for (let k = 1; k < 6; k++) { const t = k / 6, ya = sp[1] + (ty - 4 - sp[1]) * t;
      s += `<path d="M${F(x - (tw / 2 + 2) * t)},${F(ya)} L${F(x + (tw / 2 + 2) * t)},${F(ya)}" stroke="${TS("#e8eef6")}" stroke-width="2" opacity=".8"/>`; }
    s += `<path d="M${sp[0]},${sp[1]} L${x - tw / 2 - 2},${ty - 4}" stroke="${RIM}" stroke-width="2" opacity=".6"/>`;
    s += `<path d="M${x},${sp[1]} L${x},${sp[1] - 22} M${x - 7},${sp[1] - 14} L${x + 7},${sp[1] - 14}" stroke="${T("#c8a040")}" stroke-width="2.5"/>`;
    // dormer turrets at the tower corners
    [x - tw / 2, x + tw / 2].forEach(cx => s += `<path d="${poly([[cx - 8, ty - 2], [cx, ty - 30], [cx + 8, ty - 2]])}" fill="${T("#4a7468")}"/><path d="${poly([[cx, ty - 30], [cx + 8, ty - 2], [cx, ty - 2]])}" fill="${T("#36584e")}"/>`);
  }
  /* far roofs peeking between the houses */
  for (let k = 0; k < 26; k++) { const x = 560 + r() * 1460, y = 470 - 60 - r() * 40, w = 30 + r() * 40, c = T(mix(["#8a5a4a", "#7a6a6a", "#9a6a52"][k % 3], "#d8d0d8", .45));
    if (Math.abs(x - 985) < 120) continue;
    s += `<path d="${poly([[x - w, y + 30], [x, y], [x + w, y + 30]])}" fill="${c}"/><path d="${poly([[x - w * .9, y + 28], [x, y + 4], [x - w * .25, y + 28]])}" fill="${TS("#eef0f6")}" opacity=".9"/>`; }

  /* ----------------------------------------------------- half-timbered houses */
  const PLASTER = ["#f2e6cc", "#efd9b0", "#e8c8a0", "#f4ecdc", "#e6d0c0", "#dcc8a8", "#f0dcc4"];
  const TIMBER = ["#5a3624", "#4a2e20", "#6a4028"];
  const ROOF = ["#8a3a2a", "#7a4232", "#6a4a44", "#9a4a32"];
  const windowAt = (x, y, w, h, lit) => {
    let g = `<rect x="${F(x - 2)}" y="${F(y - 2)}" width="${F(w + 4)}" height="${F(h + 4)}" fill="${T("#f4ecdc")}"/>`;
    g += `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" fill="${NIGHT ? (lit ? "#ffc468" : "#1a2040") : T("#56708e")}"/>`;
    if (!NIGHT) g += `<path d="M${F(x)},${F(y + h * .7)} L${F(x + w * .7)},${F(y)} L${F(x + w)},${F(y)} L${F(x)},${F(y + h)}Z" fill="#c8d8e8" opacity=".35"/>`;
    if (NIGHT && lit) g += `<rect x="${F(x)}" y="${F(y + h * .6)}" width="${F(w)}" height="${F(h * .4)}" fill="#ff9a40" opacity=".5"/>`;
    g += `<path d="M${F(x + w / 2)},${F(y)} v${F(h)} M${F(x)},${F(y + h * .45)} h${F(w)}" stroke="${T("#f4ecdc")}" stroke-width="${F(Math.max(1, w * .1))}"/>`;
    g += `<rect x="${F(x - 3)}" y="${F(y + h)}" width="${F(w + 6)}" height="${F(Math.max(2, h * .14))}" fill="${TS("#f4f6fa")}"/>`;
    return g;
  };
  const glows = [];                      // light pools added on top at night
  /* a house front facing us (back row) with a sliver of side wall toward the vanishing point */
  const house = (x, yb, w, fl, fh, o) => {
    let g = ""; const ht = fl * fh, ls = LX > x ? 1 : -1, side = x < VX ? 1 : -1, sw = Math.min(26, Math.abs(x - VX) * .03);
    const P = T(o.plaster), TB = T(o.timber), RF = T(o.roof);
    // side wall in perspective
    const sx = x + side * w / 2;
    g += `<path d="${poly([[sx, yb], [sx, yb - ht], [sx + side * sw, yb - ht + sw * .2], [sx + side * sw, yb - sw * .1]])}" fill="${mix(P, side === ls ? RIM : "#2a2440", side === ls ? .2 : .32)}"/>`;
    // jettied floors
    for (let f = 0; f < fl; f++) { const j = f * 3, y0 = yb - (f + 1) * fh, x0 = x - w / 2 - j, x1 = x + w / 2 + j;
      g += `<rect x="${F(x0)}" y="${F(y0)}" width="${F(x1 - x0)}" height="${F(fh)}" fill="${P}"/>`;
      g += `<rect x="${F(x0)}" y="${F(y0)}" width="${F(x1 - x0)}" height="${F(fh)}" fill="${ls > 0 ? "#000" : "#fff"}" opacity=".04"/>`;
      if (o.timbered) {
        g += `<rect x="${F(x0)}" y="${F(y0 + fh - 4)}" width="${F(x1 - x0)}" height="4" fill="${TB}"/><rect x="${F(x0)}" y="${F(y0)}" width="${F(x1 - x0)}" height="3" fill="${TB}"/>`;
        const nb = Math.max(3, Math.round(w / 22));
        for (let b = 0; b <= nb; b++) { const bx = x0 + (x1 - x0) * b / nb; g += `<rect x="${F(bx - 1.6)}" y="${F(y0)}" width="3.2" height="${F(fh)}" fill="${TB}"/>`;
          if (b < nb && (b + f) % 2 === 0) { const bx2 = x0 + (x1 - x0) * (b + 1) / nb; g += `<path d="M${F(bx)},${F(y0 + fh - 4)} L${F(bx2)},${F(y0 + 3)} M${F(bx)},${F(y0 + 3)} L${F(bx2)},${F(y0 + fh - 4)}" stroke="${TB}" stroke-width="2.6" opacity="${f === 0 ? 0 : 1}"/>`; } }
      }
      if (f > 0) g += `<rect x="${F(x0 - 2)}" y="${F(y0 + fh - 1)}" width="${F(x1 - x0 + 4)}" height="3" fill="#000" opacity=".22"/>`;
      // windows
      const nw = Math.max(2, Math.round(w / 34));
      for (let k = 0; k < nw; k++) { const ww = Math.min(14, w / nw * .42), wx = x0 + (x1 - x0) * (k + .5) / nw - ww / 2, wh = fh * .48, wy = y0 + fh * .24;
        if (f === 0 && k === Math.floor(nw / 2)) { g += `<rect x="${F(wx - 1)}" y="${F(y0 + fh * .3)}" width="${F(ww + 2)}" height="${F(fh * .7)}" fill="${T("#5a2e1e")}"/><circle cx="${F(wx + ww / 2)}" cy="${F(y0 + fh * .5)}" r="${F(ww * .4)}" fill="none" stroke="${T("#2e5a32")}" stroke-width="2.4"/><circle cx="${F(wx + ww / 2)}" cy="${F(y0 + fh * .5 + ww * .38)}" r="1.6" fill="${T("#c02a2a")}"/>`;
          if (NIGHT) glows.push([wx + ww / 2, y0 + fh * .6, 30]); continue; }
        const lit = r() < .78; g += windowAt(wx, wy, ww, wh, lit);
        if (NIGHT && lit) glows.push([wx + ww / 2, wy + wh / 2, 22]);
        if (!NIGHT || r() < .5) g += `<rect x="${F(wx - ww * .45)}" y="${F(wy)}" width="${F(ww * .4)}" height="${F(wh)}" fill="${T(o.shutter)}"/><rect x="${F(wx + ww * 1.05)}" y="${F(wy)}" width="${F(ww * .4)}" height="${F(wh)}" fill="${T(o.shutter)}"/>`; }
    }
    const top = yb - ht, j = (fl - 1) * 3, xl = x - w / 2 - j - 4, xr = x + w / 2 + j + 4;
    if (o.gable) {      // gable end facing the square
      const ap = [x, top - w * .62];
      g += `<path d="${poly([[xl + 4, top], ap, [xr - 4, top]])}" fill="${P}"/>`;
      if (o.timbered) { g += `<path d="M${x},${F(ap[1] + 8)} V${top} M${F(x - w * .25)},${F(top - w * .2)} H${F(x + w * .25)} M${F(x - w * .3)},${top} L${x},${F(top - w * .3)} L${F(x + w * .3)},${top}" stroke="${TB}" stroke-width="3" fill="none"/>`; }
      g += windowAt(x - 5, top - w * .3, 10, 13, r() < .7);
      // roof thickness along the rakes, then snow resting on them
      g += `<path d="${poly([[xl - 4, top + 4], ap, [xr + 4, top + 4], [xr - 2, top + 4], [x, ap[1] + 9], [xl + 2, top + 4]])}" fill="${RF}"/>`;
      g += `<path d="${poly([[xl - 6, top + 2], [x, ap[1] - 6], [xr + 6, top + 2], [xr + 2, top + 6], [x, ap[1] + 3], [xl - 2, top + 6]])}" fill="${TS("#d4dcec")}"/>`;
      g += `<path d="${poly(ls > 0 ? [[x, ap[1] - 6], [xr + 6, top + 2], [xr + 2, top + 4], [x, ap[1] - 1]] : [[x, ap[1] - 6], [xl - 6, top + 2], [xl - 2, top + 4], [x, ap[1] - 1]])}" fill="${TS("#fbfbfe")}"/>`;
      g += `<path d="M${xl - 6},${top + 2} L${x},${F(ap[1] - 6)} L${xr + 6},${top + 2}" stroke="${RIM}" stroke-width="1.4" fill="none" opacity=".6"/>`;
    } else {            // eaves facing the square: roof plane covered in snow, with dormers
      const rh = w * .42, rt = top - rh;
      g += `<path d="${poly([[xl - 6, top + 2], [xl + w * .12, rt], [xr - w * .12, rt], [xr + 6, top + 2]])}" fill="${RF}"/>`;
      for (let k = 1; k < 6; k++) { const yy = rt + rh * k / 6; g += `<path d="M${F(xl - 6 + w * .12 * (1 - k / 6))},${F(yy)} H${F(xr + 6 - w * .12 * (1 - k / 6))}" stroke="#000" stroke-width="1" opacity=".18"/>`; }
      let sn = []; for (let k = 0; k <= 14; k++) { const t = k / 14; sn.push([xl - 4 + (xr - xl + 8) * t, top - 4 - (k % 2 ? 3 : 0) - Math.sin(t * Math.PI) * 2]); }
      g += `<path d="${poly([[xl + w * .12, rt - 4], [xr - w * .12, rt - 4], ...sn.slice().reverse()])}" fill="${TS("#eceff8")}"/>`;
      g += `<path d="${poly([[xr - w * .12, rt - 4], [xr + 6, top - 2], [xr - w * .3, top - 6], [x + w * .1, rt + 4]])}" fill="${TS(ls > 0 ? "#ffffff" : "#c8d0e4")}" opacity=".8"/>`;
      for (let k = 0; k < 10; k++) { const ix = xl + (xr - xl) * (k + .5) / 10; g += `<path d="M${F(ix - 2)},${top} l2,${F(4 + r() * 8)} l2,${F(-4 - r() * 4)}" fill="${TS("#e4ecf8")}"/>`; }
      const dx = x + (r() - .5) * w * .3;
      g += `<rect x="${F(dx - 10)}" y="${F(rt + rh * .25)}" width="20" height="${F(rh * .55)}" fill="${P}"/>` + windowAt(dx - 6, rt + rh * .32, 12, rh * .38, r() < .6);
      g += `<path d="${poly([[dx - 14, rt + rh * .28], [dx, rt + rh * .02], [dx + 14, rt + rh * .28]])}" fill="${TS("#f4f6fc")}"/>`;
      g += `<path d="M${F(xl + w * .12)},${F(rt - 4)} H${F(xr - w * .12)}" stroke="${RIM}" stroke-width="1.4" opacity=".55"/>`;
    }
    if (o.chimney) { const cx = x + o.chimney * w * .3, cy = top - (o.gable ? w * .4 : w * .42) - 8;
      g += `<rect x="${F(cx - 6)}" y="${F(cy - 18)}" width="12" height="26" fill="${T("#8a5a46")}"/><rect x="${F(cx - 8)}" y="${F(cy - 22)}" width="16" height="6" fill="${TS("#f2f4fa")}"/>`;
      g += `<g class="smoke" opacity="${NIGHT ? .3 : .45}">${[0, 1, 2, 3].map(k => `<circle cx="${F(cx + k * 6)}" cy="${F(cy - 30 - k * 16)}" r="${5 + k * 3.5}" fill="${NIGHT ? "#8a96b8" : "#f0eaea"}" opacity="${.6 - k * .12}"/>`).join("")}</g>`; }
    // shop sign / garland under the first-floor jetty
    if (o.swag) g += garland(x - w / 2 - 2, yb - fh + 2, x + w / 2 + 2, yb - fh + 2, 8, 6, true);
    // snow drift at the foot of the wall
    g += `<path d="${blobP(x, yb + 1, w * .55, 5, 9)}" fill="${TS("#f0f2f8")}"/>`;
    return g;
  };
  // the far row, closing the square (x 560-2040), staggered
  const backRow = [[615, 486, 78, 3, 46, 1, 0], [700, 482, 86, 3, 44, 0, 1], [790, 484, 76, 2, 50, 1, 0], [870, 482, 80, 3, 42, 0, 0], [1080, 480, 90, 2, 52, 1, 0],
    [1180, 478, 84, 3, 40, 0, 1], [1420, 478, 86, 3, 40, 1, 0], [1520, 480, 92, 2, 50, 0, 1], [1700, 482, 82, 3, 44, 1, 0], [1790, 484, 78, 2, 52, 0, 1], [1880, 486, 90, 3, 44, 1, 0], [1975, 488, 80, 2, 50, 0, 0]];
  backRow.forEach(([x, yb, w, fl, fh, gable, swag], i) => s += house(x, yb, w, fl, fh, { plaster: PLASTER[i % PLASTER.length], timber: TIMBER[i % 3], roof: ROOF[(i * 3) % 4], shutter: ["#2e5a46", "#8a2a22", "#3a4a6a"][i % 3], timbered: i % 3 !== 2, gable: !!gable, swag: !!swag, chimney: i % 2 ? .6 : -.5 }));

  /* the two wings, receding to the vanishing point: facades drawn in perspective */
  const wing = (xn, xf, side, n) => {      // xn near edge, xf far edge; side -1 left wing (faces right), +1 right wing
    let g = "";
    const baseY = x => VY + (x - VX) / (xn - VX) * WD0;   // ground line through the vanishing point
    const M = (x, v) => [x, baseY(x) - v * (baseY(x) - VY) * 2.15];
    const xs = []; for (let k = 0; k <= n; k++) { const t = k / n; xs.push(xn + (xf - xn) * (1 - Math.pow(1 - t, 1.6))); }
    for (let k = n - 1; k >= 0; k--) {       // far houses first
      const xa = xs[k], xb = xs[k + 1], i = k + (side > 0 ? 5 : 0), P = T(PLASTER[(i * 2) % PLASTER.length]), TB = T(TIMBER[i % 3]), RF = T(ROOF[i % 4]);
      const fl = k === 0 ? 2 : 3 - (k % 2) * .4, gable = k % 3 !== 1, lit = side < 0;      // left wing faces right, toward the low sun
      const face = mix(P, lit ? "#fff0d8" : "#3a3458", lit ? .08 : .2);
      g += `<path d="${poly([M(xa, 0), M(xa, fl / 3), M(xb, fl / 3), M(xb, 0)])}" fill="${face}"/>`;
      // floor beams and posts, drawn along the perspective
      for (let f = 0; f <= 3; f++) { const v = Math.min(fl, f) / 3; g += `<path d="${line([M(xa, v), M(xb, v)])}" stroke="${TB}" stroke-width="${F(Math.max(2, (baseY(xa) - VY) * .04))}"/>`; }
      const np = 4; for (let p = 0; p <= np; p++) { const x = xa + (xb - xa) * p / np; g += `<path d="${line([M(x, 0), M(x, fl / 3)])}" stroke="${TB}" stroke-width="${F(Math.max(2, (baseY(x) - VY) * .035))}"/>`;
        if (p < np && (p + k) % 2) { const x2 = xa + (xb - xa) * (p + 1) / np; g += `<path d="${line([M(x, 1 / 3), M(x2, 2 / 3)])} ${line([M(x, 2 / 3), M(x2, 1 / 3)])}" stroke="${TB}" stroke-width="${F(Math.max(1.6, (baseY(x) - VY) * .028))}"/>`; } }
      // windows
      for (let f = 0; f < Math.floor(fl); f++) for (let p = 0; p < np; p++) { if (f === 0 && p === 1) continue;
        const u0 = xa + (xb - xa) * (p + .3) / np, u1 = xa + (xb - xa) * (p + .7) / np, v0 = (f + .28) / 3, v1 = (f + .72) / 3, lt = r() < .75;
        g += `<path d="${poly([M(u0, v0), M(u0, v1), M(u1, v1), M(u1, v0)])}" fill="${T("#f4ecdc")}"/>`;
        const ui = u0 + (u1 - u0) * .12, uj = u1 - (u1 - u0) * .12, vi = v0 + .012, vj = v1 - .012;
        g += `<path d="${poly([M(ui, vi), M(ui, vj), M(uj, vj), M(uj, vi)])}" fill="${NIGHT ? (lt ? "#ffc468" : "#1a2040") : T(lit ? "#7a92ae" : "#4a6280")}"/>`;
        g += `<path d="${line([M((ui + uj) / 2, vi), M((ui + uj) / 2, vj)])}" stroke="${T("#f4ecdc")}" stroke-width="1.5"/>`;
        g += `<path d="${line([M(u0, v0 - .006), M(u1, v0 - .006)])}" stroke="${TS("#f4f6fa")}" stroke-width="${F(Math.max(2, (baseY(u0) - VY) * .025))}"/>`;
        if (NIGHT && lt) { const c = M((ui + uj) / 2, (vi + vj) / 2); glows.push([c[0], c[1], (baseY(u0) - VY) * .25]); } }
      // shop door on the ground floor, with a wreath
      { const u0 = xa + (xb - xa) * .3, u1 = xa + (xb - xa) * .44; g += `<path d="${poly([M(u0, 0), M(u0, .24), M(u1, .24), M(u1, 0)])}" fill="${T("#4a2a1c")}"/>`;
        const c = M((u0 + u1) / 2, .17), rr = (baseY(u0) - VY) * .05; g += `<circle cx="${F(c[0])}" cy="${F(c[1])}" r="${F(rr)}" fill="none" stroke="${T("#2e5a32")}" stroke-width="${F(rr * .5)}"/><circle cx="${F(c[0])}" cy="${F(c[1] + rr)}" r="${F(rr * .3)}" fill="${T("#c02a2a")}"/>`;
        if (NIGHT) glows.push([c[0], c[1], rr * 6]); }
      // roof: a gable facing the square, or eaves with a snowy roof plane
      const top = fl / 3, mid = (xa + xb) / 2;
      if (gable) { const ap = M(mid, top + .3);
        g += `<path d="${poly([M(xa, top), ap, M(xb, top)])}" fill="${face}"/>`;
        g += `<path d="${line([M(mid, top), [ap[0], ap[1] + 6]])}" stroke="${TB}" stroke-width="3"/>`;
        const wc = M(mid, top + .14), ws = (baseY(mid) - VY) * .06; g += `<rect x="${F(wc[0] - ws / 2)}" y="${F(wc[1] - ws * .7)}" width="${F(ws)}" height="${F(ws * 1.3)}" fill="${NIGHT ? "#ffc468" : T("#56708e")}" stroke="${T("#f4ecdc")}" stroke-width="2"/>`;
        const a = M(xa, top), b = M(xb, top), th = (baseY(mid) - VY) * .07;
        g += `<path d="${poly([[a[0] - side * 4, a[1] + 3], [ap[0], ap[1] - th * .6], [b[0] + side * 4, b[1] + 3], [b[0], b[1] + 3], [ap[0], ap[1] + th * .3], [a[0], a[1] + 3]])}" fill="${RF}"/>`;
        g += `<path d="${poly([[a[0] - side * 6, a[1] + 1], [ap[0], ap[1] - th * 1.3], [b[0] + side * 6, b[1] + 1], [b[0], b[1] + 4], [ap[0], ap[1] - th * .2], [a[0], a[1] + 4]])}" fill="${TS(lit ? "#fbfbff" : "#d0d8ea")}"/>`;
      } else { const a = M(xa, top), b = M(xb, top), ta = M(xa + (side < 0 ? 18 : -18), top + .34), tb = M(xb, top + .34);
        g += `<path d="${poly([[a[0], a[1] + 4], ta, tb, [b[0], b[1] + 4]])}" fill="${RF}"/>`;
        g += `<path d="${poly([[a[0], a[1] - 2], [ta[0], ta[1] - 4], [tb[0], tb[1] - 4], [b[0], b[1] - 2]])}" fill="${TS(lit ? "#f4f6fc" : "#d4dcec")}"/>`;
        for (let q = 0; q < 8; q++) { const x = xa + (xb - xa) * (q + .5) / 8, p = M(x, top); g += `<path d="M${F(p[0] - 2)},${F(p[1])} l2,${F(4 + r() * 7)} l2,${F(-5)}" fill="${TS("#e4ecf8")}"/>`; } }
      // edge post between houses
      g += `<path d="${line([M(xa, 0), M(xa, fl / 3)])}" stroke="#000" stroke-width="2" opacity=".2"/>`;
      // snow at the wall foot
      g += `<path d="${poly([M(xa, 0), M(xa, .03), M(xb, .03), M(xb, 0), [M(xb, 0)[0], M(xb, 0)[1] + 6], [M(xa, 0)[0], M(xa, 0)[1] + 6]])}" fill="${TS("#f2f4fa")}"/>`;
    }
    // garland swagged along the wing, first-floor level
    for (let k = 0; k < n; k++) { const a = M(xs[k], .33), b = M(xs[k + 1], .33); g += garland(a[0], a[1], b[0], b[1], (baseY(xs[k]) - VY) * .08, Math.max(4, (baseY(xs[k]) - VY) * .045), true); }
    return g;
  };
  s += wing(-60, 590, -1, 5) + wing(2620, 2010, 1, 5);
  s += `<rect x="0" y="470" width="${W}" height="20" fill="${TS("#eef0f8")}" opacity=".6"/>`;

  /* ----------------------------------------------------------- the square */
  const trod = (x, y) => { const e = ((x - 1300) / 700) ** 2 + ((y - 650) / 140) ** 2; return e < 1 + .2 * Math.sin(x / 37 + y / 50) * Math.cos(y / 19) + .12 * Math.sin(x / 91); };
  s += `<path d="M0,720 L0,${F(VY + (0 - VX) / (-60 - VX) * WD0)} L590,${F(VY + (590 - VX) / (-60 - VX) * WD0)} L590,486 L2010,486 L2010,${F(VY + (2010 - VX) / (2620 - VX) * WD0)} L2560,${F(VY + (2560 - VX) / (2620 - VX) * WD0)} L2560,720Z" fill="url(#cmSnow)"/>`;
  // cobbles, only where feet have cleared the snow
  { let c = ""; for (let y = 496; y < 724; y += 10) for (let x = 0; x < W; x += 14) if (trod(x, y)) c += `<path d="${blobP(x, y, 15, 9, 6)}" fill="${T("#77706c")}"/>`;
    const CB = ["#9a9088", "#a49890", "#8e847c", "#aaa096", "#968a80", "#8a8078", "#b0a69c"];
    for (let y = 500; y < 724; ) { const dy = y - VY, rh = dy * .05, sw = dy * .11;
      for (let x = -40 + r() * sw; x < W; x += sw * (.85 + r() * .3)) { const px = x;
        if (!trod(px, y)) continue; const col = T(CB[Math.floor(r() * CB.length)]);
        const cw = sw * (.36 + r() * .14), ch = rh * (.38 + r() * .08), cx = px + sw * .5, cy = y + rh * .5;
        c += `<path d="${blobP(cx, cy, cw, ch, 6)}" fill="${col}"/><path d="${blobP(cx - cw * .15, cy - ch * .3, cw * .6, ch * .35, 5)}" fill="${mix(col, RIM, .3)}" opacity=".7"/>`;
        if (r() < .25) c += `<path d="${blobP(cx + (r() - .5) * cw, cy - ch * .2, cw * .7, ch * .4, 6)}" fill="${TS("#eef2f8")}" opacity=".8"/>`; }
      y += rh; }
    s += `<path d="${blobP(1300, 650, 720, 150, 14)}" fill="${NIGHT ? "#3a3c58" : "#7a7470"}" opacity="0"/><g>${c}</g>`; }
  // snow lumps along the trodden edge, and thin snow lying in the joints
  for (let k = 0; k < 900; k++) { const x = 300 + r() * 2000, y = 500 + r() * 220; if (!trod(x, y)) continue;
    const e = ((x - 1300) / 700) ** 2 + ((y - 650) / 140) ** 2; if (e < .72 && r() < .85) continue;
    const sz = (y - VY) * .05 * (.6 + r() * .8); s += `<path d="${blobP(x, y, sz * 1.6, sz * .5, 6)}" fill="${TS(r() < .6 ? "#f4f6fb" : "#d6deee")}"/>`; }
  // footprint dimples and blue drift hollows on the snow
  for (let k = 0; k < 220; k++) { const x = r() * W, y = 495 + Math.pow(r(), .9) * 225; if (trod(x, y)) continue;
    const t = (y - 480) / 240; s += `<path d="M${F(x)},${F(y)} q${F(10 + t * 30)},${F(-2 - t * 2)} ${F(20 + t * 60)},0" stroke="${TS(r() < .5 ? "#c4cee4" : "#ffffff")}" stroke-width="${F(1 + t * 1.5)}" fill="none" opacity=".55"/>`; }

  /* ---------------------------------------------------------- market stalls */
  const stall = (x, yb, k, o) => {         // k = scale; o.col wood, o.roof, o.goods
    let g = ""; const w = 130 * k, h = 66 * k, rh = 42 * k, side = x < VX ? 1 : -1, d = .12;
    const toV = (p, t) => [p[0] + (VX - p[0]) * t, p[1] + (VY - p[1]) * t];
    const xl = x - w / 2, xr = x + w / 2, yt = yb - h, ap = [x, yt - rh];
    const WD = T(o.wood), WDd = mix(WD, "#1a1020", .35), WDl = mix(WD, RIM, .25);
    // cast shadow on the snow, away from the light (toward us and to the left)
    g += `<path d="${poly([[xl, yb], [xr, yb], [xr - w * .5, yb + h * .32], [xl - w * .6, yb + h * .28]])}" fill="${NIGHT ? "#0a1230" : "#6a78a8"}" opacity="${NIGHT ? .25 : .22}"/>`;
    // side face toward the vanishing point
    const se = side > 0 ? xr : xl, sb = toV([se, yb], d), st = toV([se, yt], d), sa = toV(ap, d);
    g += `<path d="${poly([[se, yb], [se, yt], st, sb])}" fill="${side > 0 && LX > x ? WDl : WDd}"/>`;
    for (let q = 1; q < 6; q++) { const a = lerp([se, yb], sb, q / 6), b = lerp([se, yt], st, q / 6); g += `<path d="M${F(a[0])},${F(a[1])} L${F(b[0])},${F(b[1])}" stroke="#000" stroke-width="1" opacity=".18"/>`; }
    // roof plane toward the vanishing point, deep in snow
    const eave = [se + side * 8 * k, yt + 4 * k], eb = toV(eave, d);
    g += `<path d="${poly([ap, eave, eb, sa])}" fill="${T(o.roof)}"/>`;
    g += `<path d="${poly([[ap[0], ap[1] - 5 * k], [eave[0], eave[1] - 4 * k], [eb[0], eb[1] - 4 * k], [sa[0], sa[1] - 5 * k]])}" fill="${TS("#e6ecf6")}"/>`;
    // front: planked wall, counter opening with goods, awning
    g += `<path d="${poly([[xl, yb], [xl, yt], ap, [xr, yt], [xr, yb]])}" fill="${WD}"/>`;
    for (let q = 1; q < 14; q++) { const px = xl + w * q / 14; g += `<path d="M${F(px)},${F(yb)} V${F(Math.max(yt - (1 - Math.abs(px - x) / (w / 2)) * rh + 2, yt - rh))}" stroke="${WDd}" stroke-width="${F(Math.max(.8, k))}" opacity=".7"/>`; }
    const oy0 = yt + h * .22, oy1 = yb - h * .36;
    g += `<rect x="${F(xl + w * .1)}" y="${F(oy0)}" width="${F(w * .8)}" height="${F(oy1 - oy0)}" fill="${NIGHT ? "#6a3a1c" : T("#2a1a14")}"/>`;
    if (NIGHT) { g += `<rect x="${F(xl + w * .1)}" y="${F(oy0)}" width="${F(w * .8)}" height="${F(oy1 - oy0)}" fill="#ffb050" opacity=".6"/>`; glows.push([x, (oy0 + oy1) / 2, w * .6]); }
    // goods on shelves: baubles, gingerbread, candles, little stars
    for (let row = 0; row < 2; row++) { const gy = oy0 + (oy1 - oy0) * (.38 + row * .38); g += `<rect x="${F(xl + w * .1)}" y="${F(gy + 2 * k)}" width="${F(w * .8)}" height="${F(1.6 * k)}" fill="${T("#8a6a4a")}"/>`;
      for (let q = 0; q < 12; q++) { const gx = xl + w * (.14 + q * .065), c = o.goods[(q + row) % o.goods.length], R = (2 + r() * 1.6) * k;
        g += `<circle cx="${F(gx)}" cy="${F(gy - R + 2 * k)}" r="${F(R)}" fill="${T(c)}"/><circle cx="${F(gx - R * .3)}" cy="${F(gy - R * 1.3 + 2 * k)}" r="${F(R * .35)}" fill="#fff" opacity="${NIGHT ? .7 : .5}"/>`; } }
    g += `<rect x="${F(xl + w * .06)}" y="${F(oy1)}" width="${F(w * .88)}" height="${F(5 * k)}" fill="${WDl}"/>`;
    // striped awning flap
    for (let q = 0; q < 10; q++) { const ax = xl + w * (.08 + q * .084); g += `<path d="M${F(ax)},${F(oy0)} h${F(w * .084)} v${F(7 * k)} q${F(-w * .042)},${F(4 * k)} ${F(-w * .084)},0Z" fill="${T(q % 2 ? "#f4ecdc" : o.awning)}"/>`; }
    // gable: trim, sign board, snow on the rakes, icicles
    g += `<path d="M${F(xl - 8 * k)},${F(yt + 4 * k)} L${ap[0]},${F(ap[1] - 2 * k)} L${F(xr + 8 * k)},${F(yt + 4 * k)}" stroke="${T("#5a3a26")}" stroke-width="${F(5 * k)}" fill="none" stroke-linejoin="round"/>`;
    g += `<path d="${poly([[xl - 11 * k, yt + 1 * k], [ap[0], ap[1] - 8 * k], [xr + 11 * k, yt + 1 * k], [xr + 6 * k, yt + 4 * k], [ap[0], ap[1] - 2 * k], [xl - 6 * k, yt + 4 * k]])}" fill="${TS("#fbfcff")}"/>`;
    g += `<rect x="${F(x - w * .22)}" y="${F(yt - rh * .5)}" width="${F(w * .44)}" height="${F(rh * .3)}" rx="${F(2 * k)}" fill="${T("#f2e6c8")}" stroke="${T("#6a4228")}" stroke-width="${F(1.5 * k)}"/>`;
    g += `<path d="M${F(x - w * .16)},${F(yt - rh * .35)} h${F(w * .1)} m${F(w * .03)},0 h${F(w * .07)} m${F(w * .03)},0 h${F(w * .09)}" stroke="${T(o.awning)}" stroke-width="${F(2.4 * k)}"/>`;
    for (let q = 0; q < 9; q++) { const ix = xl + w * (q + .5) / 9; g += `<path d="M${F(ix - 1.5 * k)},${F(yt + 4 * k)} l${F(1.5 * k)},${F((4 + r() * 7) * k)} l${F(1.5 * k)},${F(-(4 + r() * 7) * k)}" fill="${TS("#dfe8f6")}"/>`; }
    // garland with lights along the eave line, and a wreath on the gable
    g += garland(xl - 4 * k, yt + 6 * k, xr + 4 * k, yt + 6 * k, 9 * k, 6 * k, true);
    g += `<circle cx="${x}" cy="${F(yt - rh * .72)}" r="${F(6 * k)}" fill="none" stroke="${T("#2e5a32")}" stroke-width="${F(3.4 * k)}"/><path d="M${F(x - 3 * k)},${F(yt - rh * .72 + 6 * k)} l${F(3 * k)},${F(-3 * k)} l${F(3 * k)},${F(3 * k)}" fill="${T("#c0282a")}"/>`;
    // snow piled at the base
    g += `<path d="${blobP(x, yb + 2 * k, w * .58, 5 * k, 9)}" fill="${TS("#f2f4fa")}"/>`;
    return g;
  };
  const GOODS = [["#c0282a", "#e0b040", "#f4f0e8", "#2e7a4a"], ["#a0602a", "#c88a4a", "#f4e8d0"], ["#d84a3a", "#3a7ad0", "#f0c040", "#e8e8f0"], ["#f4d890", "#c0282a", "#2e5a32"]];
  const AWN = ["#b8302a", "#2e6a4a", "#2a4a8a", "#b8302a"];
  const stalls = [[640, 530, .84], [810, 518, .74], [1010, 510, .7], [1600, 510, .7], [1790, 518, .74], [1960, 530, .84],
    [440, 572, 1.2], [2160, 572, 1.2], [180, 640, 1.65], [2420, 640, 1.65]];
  stalls.sort((a, b) => a[1] - b[1]).forEach(([x, yb, k], i) => s += stall(x, yb, k, { wood: ["#8a5a36", "#7a4e30", "#9a6a40"][i % 3], roof: "#5a3a2a", goods: GOODS[i % 4], awning: AWN[i % 4] }));

  /* strings of lights across the square, high between the wings */
  [[[300, 330], [1060, 390]], [[2300, 330], [1540, 390]], [[560, 360], [1080, 410]], [[2040, 360], [1520, 410]]].forEach(([a, b]) => s += strand(a[0], a[1], b[0], b[1], 26, 2.6, false));

  /* street lamps with garland and a bow */
  const lamp = (x, yb, k) => { let g = "";
    const h = 230 * k, IR = T("#22262e");
    g += `<path d="${poly([[x - 7 * k, yb], [x - 4 * k, yb - 14 * k], [x - 2.4 * k, yb - h], [x + 2.4 * k, yb - h], [x + 4 * k, yb - 14 * k], [x + 7 * k, yb]])}" fill="${IR}"/><path d="M${F(x + 1.5 * k)},${yb} V${F(yb - h)}" stroke="${mix(IR, RIM, .4)}" stroke-width="${F(1.2 * k)}"/>`;
    for (let q = 0; q < 10; q++) { const y = yb - 20 * k - q * (h - 40 * k) / 10; g += `<path d="${blobP(x + (q % 2 ? 3 : -3) * k, y, 6 * k, 4 * k, 6)}" fill="${T(q % 2 ? "#2e5a32" : "#24482a")}"/>`; }
    g += `<path d="M${F(x - 3 * k)},${F(yb - h * .55)} l${F(-9 * k)},${F(-6 * k)} v${F(12 * k)}Z M${F(x + 3 * k)},${F(yb - h * .55)} l${F(9 * k)},${F(-6 * k)} v${F(12 * k)}Z" fill="${T("#c0282a")}"/><path d="M${F(x - 2 * k)},${F(yb - h * .55)} l${F(-6 * k)},${F(16 * k)} M${F(x + 2 * k)},${F(yb - h * .55)} l${F(6 * k)},${F(16 * k)}" stroke="${T("#a0201e")}" stroke-width="${F(2.4 * k)}"/>`;
    const ly = yb - h - 26 * k;
    g += `<path d="${poly([[x - 12 * k, ly + 26 * k], [x - 15 * k, ly + 4 * k], [x + 15 * k, ly + 4 * k], [x + 12 * k, ly + 26 * k]])}" fill="${NIGHT ? LAMP : T("#d8dcd0")}" stroke="${IR}" stroke-width="${F(2 * k)}"/>`;
    g += `<path d="${poly([[x - 19 * k, ly + 5 * k], [x, ly - 12 * k], [x + 19 * k, ly + 5 * k]])}" fill="${IR}"/><path d="${poly([[x - 17 * k, ly + 2 * k], [x, ly - 14 * k], [x + 17 * k, ly + 2 * k], [x, ly - 7 * k]])}" fill="${TS("#f4f6fc")}"/>`;
    if (NIGHT) { glows.push([x, ly + 14 * k, 70 * k]); g += `<ellipse cx="${x}" cy="${F(yb + 8 * k)}" rx="${F(110 * k)}" ry="${F(22 * k)}" fill="url(#cmPool)"/>`; }
    return g; };

  /* -------------------------------------------------- the giant tree */
  const TX = 1300, TY = 590, TH = 455;
  let tree = "";
  tree += `<path d="${poly([[TX - 60, TY], [TX + 60, TY], [TX - 20, TY + 60], [TX - 260, TY + 52]])}" fill="${NIGHT ? "#0a1230" : "#6a78a8"}" opacity=".22"/>`;
  const TR = NIGHT ? ["#06140e", "#0c2216", "#14301e", "#1e4028", "#2c5232"] : ["#0e2a1a", "#173a22", "#21502c", "#2e6634", "#4a8040"];
  tree += `<g filter="url(#cmTree)">${spruce(TX, TY, TH, { lx: LX, ramp: TR, trunk: T("#3a2416"), edge: NIGHT ? "#3a6a48" : "#7aa860", snow: .32, snowLit: TS("#ffffff"), snowSh: TS("#c4d0e8") })}</g>`;
  const top = TY - TH, wAt = y => Math.max(0, (y - top) / (TY - top - 50)) * TH * .33;
  // draped strands of warm lights, then baubles
  for (let k = 0; k < 9; k++) { const y = top + 50 + k * 42, w = wAt(y) * .92, sag = 10 + k * 2; tree += strand(TX - w, y - 4, TX + w, y + 10, sag, 2.8 + k * .12, true); }
  for (let k = 0; k < 120; k++) { const y = top + 40 + r() * (TH - 110), w = wAt(y) * .85, x = TX + (r() * 2 - 1) * w, R = 4 + r() * 3.5 * (y - top) / TH;
    const c = T(["#c8202a", "#e0b040", "#d8dce8", "#2a58b8", "#c8202a", "#b07ac8"][k % 6]), lt = x > TX ? .45 : .2;
    tree += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R)}" fill="${c}"/><circle cx="${F(x + R * .3)}" cy="${F(y + R * .3)}" r="${F(R * .7)}" fill="#000" opacity=".2"/><circle cx="${F(x - R * .25 + lt * 2)}" cy="${F(y - R * .35)}" r="${F(R * .35)}" fill="#ffffff" opacity="${NIGHT ? .55 : .75}"/>`; }
  // star on top
  { const sx = TX, sy = top - 16, pts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, R = k % 2 ? 9 : 22; pts.push([sx + Math.cos(a) * R, sy + Math.sin(a) * R]); }
    if (NIGHT) tree += `<circle cx="${sx}" cy="${sy}" r="70" fill="url(#cmGlow)"/>`;
    tree += `<path d="${poly(pts)}" fill="${NIGHT ? "#ffe890" : "#e8b830"}"/><path d="${poly([[sx, sy], ...pts.slice(0, 3)])}" fill="#fff4b0" opacity=".7"/><path d="${poly([[sx, sy], ...pts.slice(5, 8)])}" fill="#b0801a" opacity=".5"/>`; }
  // fenced base: low wooden octagon with garland and presents
  { let b = ""; const ry = 22;
    b += `<ellipse cx="${TX}" cy="${TY + 6}" rx="190" ry="${ry + 6}" fill="${TS("#f4f6fb")}"/>`;
    const PR = [["#c0282a", "#f0d060"], ["#2a5aa8", "#f4f4f8"], ["#2e7a4a", "#c0282a"], ["#e8c040", "#c0282a"], ["#8a3aa0", "#f0d060"], ["#f4f0e8", "#c0282a"]];
    [[-130, 4, 34, 26], [-92, 12, 26, 34], [-50, 18, 40, 22], [60, 18, 32, 28], [104, 10, 38, 24], [146, 2, 24, 30], [-12, 22, 22, 18], [20, 20, 26, 22]].forEach(([dx, dy, w, h], i) => {
      const [c, rb] = PR[i % 6], x = TX + dx, y = TY + dy; b += `<rect x="${F(x - w / 2)}" y="${F(y - h)}" width="${w}" height="${h}" fill="${T(c)}"/><rect x="${F(x + w * .1)}" y="${F(y - h)}" width="${F(w * .4)}" height="${h}" fill="#000" opacity=".15"/>`;
      b += `<rect x="${F(x - 2.5)}" y="${F(y - h)}" width="5" height="${h}" fill="${T(rb)}"/><rect x="${F(x - w / 2)}" y="${F(y - h * .55)}" width="${w}" height="4" fill="${T(rb)}"/>`;
      b += `<path d="M${x},${y - h} q-9,-9 -12,-1 q4,4 12,1 q9,-9 12,-1 q-4,4 -12,1Z" fill="${T(rb)}"/><path d="M${F(x - w / 2)},${F(y - h)} h${w}" stroke="${TS("#ffffff")}" stroke-width="3" opacity=".8"/>`; });
    for (let k = 0; k <= 16; k++) { const a = Math.PI * (k / 16), x = TX - Math.cos(a) * 200, y = TY + 10 + Math.sin(a) * ry;
      b += `<rect x="${F(x - 3)}" y="${F(y - 30)}" width="6" height="32" fill="${T("#6a4228")}"/><rect x="${F(x - 4)}" y="${F(y - 34)}" width="8" height="5" rx="2" fill="${TS("#f4f6fb")}"/>`;
      if (k < 16) { const a2 = Math.PI * ((k + 1) / 16), x2 = TX - Math.cos(a2) * 200, y2 = TY + 10 + Math.sin(a2) * ry;
        b += `<path d="M${F(x)},${F(y - 22)} L${F(x2)},${F(y2 - 22)} M${F(x)},${F(y - 10)} L${F(x2)},${F(y2 - 10)}" stroke="${T("#8a5a36")}" stroke-width="4"/><path d="M${F(x)},${F(y - 24)} L${F(x2)},${F(y2 - 24)}" stroke="${TS("#f4f6fb")}" stroke-width="2"/>`;
        b += garland(x, y - 22, x2, y2 - 22, 6, 5, k % 2 === 0); } }
    tree += b; }
  if (NIGHT) s += `<rect x="900" y="80" width="800" height="560" fill="url(#cmTreeGlow)"/><ellipse cx="1300" cy="610" rx="330" ry="60" fill="url(#cmPool)"/>`;
  s += tree;
  s += lamp(960, 640, 1) + lamp(1650, 640, 1);

  /* foreground: potted little firs with lights at the corners, snow drifts */
  [[110, 712, 210], [2460, 712, 230]].forEach(([x, y, h]) => {
    s += `<g filter="url(#cmTree)">${spruce(x, y - 30, h, { lx: LX, ramp: TR, trunk: T("#3a2416"), edge: NIGHT ? "#3a6a48" : "#7aa860", snow: .8, snowLit: TS("#ffffff"), snowSh: TS("#c4d0e8") })}</g>`;
    for (let k = 0; k < 5; k++) { const yy = y - 70 - k * (h - 70) / 5, w = (y - 30 - yy) / h * h * .3; s += strand(x - w, yy, x + w, yy + 8, 8, 2.6, true); }
    s += `<path d="${poly([[x - 40, y - 36], [x + 40, y - 36], [x + 32, y + 8], [x - 32, y + 8]])}" fill="${T("#6a4a34")}"/><rect x="${x - 44}" y="${y - 42}" width="88" height="10" fill="${TS("#f4f6fb")}"/><path d="M${x + 10},${y - 32} L${x + 6},${y + 8}" stroke="#000" opacity=".2" stroke-width="10"/>`; });
  for (let k = 0; k < 10; k++) { const x = r() * W, y = 680 + r() * 40; s += `<path d="${blobP(x, y, 80 + r() * 90, 14 + r() * 8, 10)}" fill="${TS(k % 2 ? "#f4f6fb" : "#dde4f2")}"/>`; }

  /* night light pools and glows */
  if (NIGHT) { let g = ""; glows.forEach(([x, y, R]) => g += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R)}" fill="url(#cmGlow)" opacity=".5"/>`); s += g; }

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#cmLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#cmPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
