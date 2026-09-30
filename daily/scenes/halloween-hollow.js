/* Halloween Hollow: a moonlit Victorian house on a knoll, a gnarled old oak,
   a pumpkin patch and glowing jack-o'-lanterns. Night, one light source (the
   moon, upper left of the house) plus warm window/lantern light.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".   */
function halloweenHollowArt(opts = {}) {
  const r = rng(opts.seed || 1031);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const MX = 1135, MY = 205, MR = 74;                     // the moon
  const blobP = (cx, cy, rx, ry, n) => {
    n = n || 7 + Math.floor(r() * 4);
    const pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r() * .3, k = .8 + r() * .35;
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

  /* faceted mountains: each peak split into a lit face and a shaded face that
     run from the summit down to the valley, plus sub-facets; lit side faces lx */
  const mountains = o => {
    const key = []; let x = -180, pk = false;
    while (x < W + 260) { key.push([x, pk ? o.hi + r() * (o.lo - o.hi) : 0, pk]); x += o.step * (.6 + r() * .8); pk = !pk; }
    key.forEach((k, i) => { if (k[2]) return; const n = [key[i - 1], key[i + 1]].filter(Boolean).map(p => p[1]);
      const low = n.length ? Math.max(...n) : o.lo; k[1] = low + (o.base - low) * (.25 + r() * .4); });
    const seg = [];
    for (let i = 0; i < key.length - 1; i++) { const [ax, ay] = key[i], [bx, by] = key[i + 1], a = [];
      for (let s = 0; s <= 5; s++) { const t = s / 5, j = s % 5 ? 1 : 0; a.push([ax + (bx - ax) * t + j * (r() - .5) * 10, ay + (by - ay) * t + j * (r() - .5) * o.step * .06]); }
      seg.push(a); }
    const B = o.base + 6; let m = `<path d="${poly([[0, B], ...seg.flat(), [W, B]])}" fill="${o.mid}"/>`;
    for (let i = 1; i < key.length - 1; i++) { if (!key[i][2]) continue;
      const P = key[i], L = key[i - 1], R = key[i + 1], fx = P[0] + (r() - .5) * o.step * .2, Fp = [fx, B];
      const litL = o.lx < P[0], lc = litL ? o.lit : o.dark, rc = litL ? o.dark : o.lit;
      m += `<path d="${poly([...seg[i - 1], Fp, [L[0], B]])}" fill="${lc}"/><path d="${poly([...seg[i], [R[0], B], Fp])}" fill="${rc}"/>`;
      m += `<path d="${poly([P, seg[i - 1][2], [(fx + L[0]) / 2, B]])}" fill="${mix(lc, o.mid, .5)}" opacity=".75"/>`;
      m += `<path d="${poly([P, seg[i][3], [(fx + R[0]) / 2, B]])}" fill="${mix(rc, o.mid, .5)}" opacity=".75"/>`;
      const ls = litL ? seg[i - 1] : seg[i];
      m += `<path d="${line(ls)}" stroke="${mix(o.lit, "#fff", .3)}" stroke-width="2" fill="none" opacity=".45"/>`;
    }
    return m;
  };

  /* tiered conifer: jagged branch layers, lit + shaded side, visible trunk */
  const conifer = (x, y, h, o) => {
    const s = o.lx < x ? -1 : 1; let g = "";
    const tw = Math.max(1.5, h * .04), th = h * .13;
    g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .6)},${F(y - th * 2.2)} L${F(x + tw * .6)},${F(y - th * 2.2)} L${F(x + tw)},${F(y)}Z" fill="${o.trunk}"/>`;
    g += `<path d="M${F(x + s * tw)},${F(y)} L${F(x + s * tw * .6)},${F(y - th * 2.2)} L${F(x)},${F(y - th * 2.2)} L${F(x)},${F(y)}Z" fill="${mix(o.trunk, o.hl, .35)}"/>`;
    const tiers = Math.max(3, Math.min(9, Math.round(h / 24))), top = y - h, bot = y - th, span = bot - top;
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - span * u * .9, ya = t === tiers - 1 ? top : Math.max(top, yb - span * (.34 - .12 * u)), w = h * .3 * (1 - u * .8) * (.9 + r() * .2);
      const A = [x + (r() - .5) * w * .08, ya], th2 = yb - ya, m = Math.max(2, Math.round(w / 7)) * 2, edge = [];
      for (let k = 0; k <= m; k++) { const px = x - w + 2 * w * k / m, d = Math.abs(px - x) / w;
        edge.push([px + (r() - .5) * w * .05, yb + (k % 2 ? -th2 * (.1 + r() * .08) : d * th2 * .12 + r() * 2)]); }
      const Lm = [x - w * .5, ya + th2 * .55], Rm = [x + w * .5, ya + th2 * .55];
      g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${o.mid}"/>`;
      const shade = s < 0 ? [A, [x, yb - 2], ...edge.filter(p => p[0] > x), Rm] : [A, Lm, ...edge.filter(p => p[0] < x), [x, yb - 2]];
      g += `<path d="${poly(shade)}" fill="${o.dark}"/>`;
      const le = edge.filter(p => (p[0] - x) * s > w * .5); if (s > 0) le.reverse();
      g += `<path d="${poly([A, s < 0 ? Lm : Rm, ...le, [x + s * w * .38, yb - th2 * .3]])}" fill="${o.lit}"/>`;
      for (let k = 0; k < w / 3; k++) { const py = ya + th2 * (.35 + r() * .6), lim = w * (py - ya) / th2, px = x + (r() - .5) * 2 * lim * .9, sd = px < x ? -1 : 1;
        g += `<path d="M${F(px)},${F(py)} l${F(sd * 3.5)},${F(4 + r() * 3)}" stroke="${sd === s ? mix(o.lit, o.hl, .3) : mix(o.dark, "#000", .3)}" stroke-width="1.2" opacity=".7"/>`; }
      if (o.snow) {
        const sy = ya + th2 * .7, sw = w * .7, n = 7, bump = [];
        for (let k = 0; k <= n; k++) bump.push([x - sw + 2 * sw * k / n, sy + (k % 2 ? 3 + r() * 3 : -1 - r() * 2)]);
        g += `<path d="${poly([A, ...bump])}" fill="${o.snowDark}"/>`;
        const lb = bump.filter(p => (p[0] - x) * s > -2); if (s > 0) lb.reverse();
        g += `<path d="${poly([A, ...(s < 0 ? lb : lb), [x + s * 2, sy + 2]])}" fill="${o.snowLit}"/>`;
        edge.forEach((p, k) => { if (k % 2 || r() < .4) return; const lt = (p[0] - x) * s > 0;
          g += `<ellipse cx="${F(p[0])}" cy="${F(p[1] - 2)}" rx="${F(2 + w * .05)}" ry="${F(1.5 + w * .025)}" fill="${lt ? o.snowLit : o.snowDark}"/>`; });
      }
    }
    return g;
  };

  const SKY_H = "#8a5a74", HAZE = "#6a4a72", GLOW = "#ffb347";
  let s = `<defs id="hhdefs">
    <linearGradient id="hhSky" x1="0" y1="0" x2="0" y2="480" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0c0f2e"/><stop offset=".4" stop-color="#1f1f4c"/><stop offset=".72" stop-color="#43325e"/><stop offset="1" stop-color="${SKY_H}"/></linearGradient>
    <radialGradient id="hhMoonG" cx="${MX}" cy="${MY}" r="640" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff4d0" stop-opacity=".75"/><stop offset=".14" stop-color="#e8d8c0" stop-opacity=".35"/><stop offset=".5" stop-color="#b0a0d0" stop-opacity=".1"/><stop offset="1" stop-color="#b0a0d0" stop-opacity="0"/></radialGradient>
    <radialGradient id="hhMoonD" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#fffbe8"/><stop offset=".7" stop-color="#f6e9c2"/><stop offset="1" stop-color="#dcc796"/></radialGradient>
    <radialGradient id="hhGlow"><stop offset="0" stop-color="${GLOW}" stop-opacity=".85"/><stop offset=".35" stop-color="${GLOW}" stop-opacity=".3"/><stop offset="1" stop-color="${GLOW}" stop-opacity="0"/></radialGradient>
    <radialGradient id="hhPane" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#fff0a8"/><stop offset=".6" stop-color="#ffc35a"/><stop offset="1" stop-color="#e8862a"/></radialGradient>
    <linearGradient id="hhHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HAZE}" stop-opacity="0"/><stop offset=".6" stop-color="${HAZE}" stop-opacity=".55"/><stop offset="1" stop-color="${HAZE}" stop-opacity="0"/></linearGradient>
    <linearGradient id="hhHill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3c5e"/><stop offset="1" stop-color="#3a3050"/></linearGradient>
    <linearGradient id="hhHill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#383650"/><stop offset="1" stop-color="#2a283e"/></linearGradient>
    <linearGradient id="hhKnoll" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stop-color="#4c5a5a"/><stop offset=".45" stop-color="#3a4648"/><stop offset="1" stop-color="#242a32"/></linearGradient>
    <linearGradient id="hhMeadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3e4640"/><stop offset=".5" stop-color="#2c3230"/><stop offset="1" stop-color="#1a1e20"/></linearGradient>
    <linearGradient id="hhWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6e6690"/><stop offset=".5" stop-color="#554d72"/><stop offset="1" stop-color="#3e3858"/></linearGradient>
    <linearGradient id="hhTower" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#746c96"/><stop offset=".55" stop-color="#524a6e"/><stop offset="1" stop-color="#342e4a"/></linearGradient>
    <linearGradient id="hhTrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5e5470"/><stop offset=".4" stop-color="#3a3044"/><stop offset="1" stop-color="#1c1622"/></linearGradient>
    <filter id="hhLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hhLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hhCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="hhPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="hhSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="hhSoft3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hhSky)"/>`;

  /* stars, thinning toward the moon and the horizon */
  for (let i = 0; i < 420; i++) { const x = r() * W, y = Math.pow(r(), 1.5) * 400, d = Math.hypot(x - MX, y - MY);
    if (d < 260 && r() < .85) continue;
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${r() < .08 ? 1.7 : .6 + r() * .6}" fill="${r() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.25 + r() * .6 * (1 - y / 520))}"/>`; }
  /* moon: glow, halo, disc with maria and craters */
  s += `<rect width="${W}" height="${H}" fill="url(#hhMoonG)"/>`;
  s += `<circle cx="${MX}" cy="${MY}" r="${MR * 1.9}" fill="none" stroke="#e8dcc8" stroke-width="10" opacity=".06" filter="url(#hhSoft3)"/>`;
  s += `<circle cx="${MX}" cy="${MY}" r="${MR}" fill="url(#hhMoonD)"/>`;
  [[-22, -18, 26, 18], [18, -26, 20, 14], [8, 10, 30, 20], [-30, 22, 16, 12], [30, 24, 14, 18], [-4, -40, 12, 8]].forEach(([dx, dy, rx, ry]) =>
    s += `<path d="${blobP(MX + dx, MY + dy, rx, ry, 8)}" fill="#cbb98e" opacity=".45"/>`);
  for (let k = 0; k < 22; k++) { const a = r() * 6.28, d = Math.sqrt(r()) * MR * .85, x = MX + Math.cos(a) * d, y = MY + Math.sin(a) * d, cr = 2 + r() * 5;
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(cr)}" fill="#b8a67c" opacity=".35"/><path d="M${F(x - cr)},${F(y)} A${F(cr)},${F(cr)} 0 0 1 ${F(x + cr)},${F(y)}" stroke="#fffaf0" stroke-width="1" fill="none" opacity=".45"/>`; }
  s += `<circle cx="${MX}" cy="${MY}" r="${MR}" fill="none" stroke="#fffdf4" stroke-width="2" opacity=".6"/>`;
  s += `<g opacity=".07" filter="url(#hhSoft)">`;
  for (let k = 0; k < 8; k++) { const a = .5 + k * .3, L = 900;
    s += `<path d="M${MX},${MY} L${F(MX + Math.cos(a - .035) * L)},${F(MY + Math.sin(a - .035) * L)} L${F(MX + Math.cos(a + .035) * L)},${F(MY + Math.sin(a + .035) * L)}Z" fill="#f4ecff"/>`; }
  s += `</g>`;
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: thin night clouds, dark body, moonlit upper edges toward the moon */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#hhCloudy)">`;
    const lobes = [], lean = x < MX ? 1 : -1;
    for (let k = 0; k < 10; k++) { const t = k / 9; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .07 * (.6 + r() * .7), w * (.06 + r() * .05)]); }
    c += `<ellipse cx="${x}" cy="${y + w * .03}" rx="${w * .55}" ry="${w * .04}" fill="#2a2646" opacity=".9"/>`;
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .3)}" rx="${F(R * 1.3)}" ry="${F(R * .55)}" fill="#3c3660"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.05)}" ry="${F(R * .5)}" fill="#5c5484"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .28)}" rx="${F(R * .7)}" ry="${F(R * .26)}" fill="#a9a0c6"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .4)}" cy="${F(ly - R * .36)}" rx="${F(R * .35)}" ry="${F(R * .12)}" fill="#e6dcf0" opacity=".8"/>`);
    return c + `</g></g>`;
  };
  s += cloud(520, 150, 560, "drift1") + cloud(1920, 120, 600, "drift2") + cloud(2330, 250, 300, "drift3") + cloud(250, 250, 300, "drift2") + cloud(1010, 292, 330, "drift3");
  /* bats crossing the moon */
  const bat = (x, y, k, flap) => `<path transform="translate(${F(x)},${F(y)}) scale(${F(k)})" d="M-2,-3 Q-10,${F(-8 - 6 * flap)} -24,${F(-6 - 8 * flap)} Q-21,${F(-3 * flap)} -18,${F(3 - 3 * flap)} Q-15,${F(-1 - 2 * flap)} -11,${F(4 - flap)} Q-8,1 -4,5 L0,3 L4,5 Q8,1 11,${F(4 - flap)} Q15,${F(-1 - 2 * flap)} 18,${F(3 - 3 * flap)} Q21,${F(-3 * flap)} 24,${F(-6 - 8 * flap)} Q10,${F(-8 - 6 * flap)} 2,-3Z M-3,-2 l-1,-5 l3,3 l2,0 l3,-3 l-1,5Z" fill="#14101e" stroke="#14101e" stroke-width=".8"/>`;
  s += `<g class="birds bats">`;
  [[1085, 175, 1.1, 1], [1170, 232, .9, .5], [1215, 160, .8, 1.1], [1030, 250, .7, .7], [1275, 205, .6, .9], [960, 190, .55, 1], [1340, 150, .5, .6]].forEach(([x, y, k, f]) => s += bat(x, y, k, f));
  s += `</g>`;
  const cloudPart = s; s = DEFS;

  /* far mountains, two ranges, then haze */
  s += mountains({ base: 440, hi: 318, lo: 372, step: 170, lx: MX, lit: "#7a74a4", mid: "#686292", dark: "#4f4a78" });
  s += `<rect x="0" y="330" width="${W}" height="130" fill="url(#hhHaze)" opacity=".8"/>`;
  s += mountains({ base: 462, hi: 372, lo: 412, step: 120, lx: MX, lit: "#5e5886", mid: "#4d4874", dark: "#3a355c" });
  s += `<rect x="0" y="400" width="${W}" height="100" fill="url(#hhHaze)"/>`;

  /* forest bands: little moonlit autumn trees built from several leaf clumps */
  const AUT = ["#8a3a2e", "#9c4a2a", "#a8602e", "#b07a34", "#7a5a34", "#5e5a38", "#6a3a3a"];
  const forest = (fn, rows, size, haze, hazeCol, conif) => {
    let f = ""; const trees = [];
    for (let row = 0; row < rows; row++) for (let x = -10; x < W + 10; x += size * (.8 + r() * .5)) {
      const y = fn(x) + row * size * .72 + size * .4 + r() * size * .3, sz = size * (.75 + r() * .45);
      trees.push([x + r() * size * .4, y, sz]); }
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(([x, y, sz]) => {
      if (r() < conif) { const c = mix("#26343a", hazeCol, haze);
        f += conifer(x, y + sz * .2, sz * 2.3, { lx: MX, trunk: mix("#2a2028", hazeCol, haze), hl: "#8a80a8", dark: mix(c, "#000", .3), mid: c, lit: mix(c, "#9a94c0", .3) });
        return; }
      const base = AUT[Math.floor(r() * AUT.length)], c = mix(mix(base, "#1a1830", .35), hazeCol, haze), dk = mix(c, "#0e0c18", .4), lt = mix(c, "#c8c0e8", .28);
      const side = x < MX ? 1 : -1;
      f += `<path d="M${F(x - sz * .06)},${F(y + sz * .6)} L${F(x)},${F(y - sz * .2)} L${F(x + sz * .06)},${F(y + sz * .6)}Z" fill="${dk}"/>`;
      f += `<path d="${blobP(x + side * sz * .15, y + sz * .12, sz * .95, sz * .75, 8)}" fill="${dk}"/>`;
      for (let k = 0; k < 4; k++) f += `<path d="${blobP(x + (r() - .5) * sz * .9, y - sz * .1 + (r() - .5) * sz * .5, sz * .42, sz * .36, 6)}" fill="${c}"/>`;
      for (let k = 0; k < 2; k++) f += `<path d="${blobP(x - side * sz * (.25 + r() * .2), y - sz * (.35 + r() * .15), sz * .26, sz * .2, 6)}" fill="${lt}"/>`;
    });
    return f;
  };
  const h1 = wave([2, 4, 0], [300, 130, 55], [22, 9, 4]), h2 = wave([5, 1, 3], [380, 160, 70], [26, 11, 5]);
  const hill1 = x => 462 + h1(x), hill2 = x => 522 + h2(x);
  s += `<path d="${ridgePath(hill1)}" fill="url(#hhHill1)"/>`;
  s += `<g filter="url(#hhLeafyS)">${forest(hill1, 3, 12, .45, HAZE, .18)}</g>`;
  s += `<rect x="0" y="468" width="${W}" height="80" fill="url(#hhHaze)" opacity=".6"/>`;
  s += `<path d="${ridgePath(hill2)}" fill="url(#hhHill2)"/>`;
  s += `<g filter="url(#hhLeafyS)">${forest(hill2, 2, 19, .2, HAZE, .22)}</g>`;

  /* fields */
  const fieldTop = x => 572 + Math.sin(x / 420) * 9;
  [[0, 420, "#4a4050"], [420, 900, "#3e4244"], [900, 1300, "#46404c"], [1300, 1760, "#3c3e46"], [1760, 2160, "#4a4450"], [2160, 2560, "#40424a"]].forEach(([a, b, c]) => {
    s += `<path d="M${a},${F(fieldTop(a))} L${b},${F(fieldTop(b))} L${b + 40},650 L${a - 40},650Z" fill="${c}"/>`;
    for (let k = 1; k < 7; k++) { const y = fieldTop(a) + k * 10.5;
      s += `<path d="M${a - k * 6},${F(y)} L${b + k * 6},${F(y + fieldTop(b) - fieldTop(a))}" stroke="${mix(c, "#000", .3)}" stroke-width="1.6" opacity=".55"/>`; }
  });

  /* pumpkins: ribbed, lit from the moon side; carved ones glow */
  const PR = ["#5a2410", "#7a3212", "#9c4416", "#bc5a1a", "#d67024", "#e88c34", "#f2aa52"];
  const pumpkin = (x, y, k, carved) => {
    const w = 30 * k, h = 22 * k, cy = y - h, side = x < MX ? -1 : 1; let p = "";
    if (carved) p += `<circle cx="${F(x)}" cy="${F(cy)}" r="${F(w * 2.6)}" fill="url(#hhGlow)" opacity=".75"/>`;
    p += `<ellipse cx="${F(x + 4 * k)}" cy="${F(y)}" rx="${F(w * 1.05)}" ry="${F(5 * k)}" fill="#000" opacity=".3"/>`;
    [-.72, .72, -.4, .4, 0].forEach(o => {
      const lit = -o * side, v = Math.max(0, Math.min(PR.length - 1, Math.round(2.4 + lit * 2.2 + (carved ? .8 : 0))));
      p += `<ellipse cx="${F(x + o * w)}" cy="${F(cy)}" rx="${F(w * (.42 - Math.abs(o) * .08))}" ry="${F(h * (.98 - Math.abs(o) * .12))}" fill="${PR[v]}" stroke="${PR[Math.max(0, v - 2)]}" stroke-width="${F(.8 * k)}"/>`;
      p += `<path d="M${F(x + o * w + side * w * .12)},${F(cy - h * .6)} q${F(side * w * .08)},${F(h * .6)} 0,${F(h * 1.1)}" stroke="${PR[Math.min(PR.length - 1, v + 2)]}" stroke-width="${F(1.4 * k)}" fill="none" opacity=".55"/>`;
    });
    p += `<path d="M${F(x - 2 * k)},${F(cy - h * .85)} q${F(1 * k)},${F(-8 * k)} ${F(6 * k)},${F(-11 * k)} l${F(2 * k)},${F(2 * k)} q${F(-4 * k)},${F(3 * k)} ${F(-4 * k)},${F(9 * k)}Z" fill="#4a5226" stroke="#2a3014" stroke-width="${F(.6 * k)}"/>`;
    if (carved) {
      const eye = (ex) => `M${F(ex - 6 * k)},${F(cy - 2 * k)} L${F(ex)},${F(cy - 11 * k)} L${F(ex + 6 * k)},${F(cy - 2 * k)}Z`;
      const mouth = `M${F(x - 17 * k)},${F(cy + 4 * k)} Q${F(x)},${F(cy + 20 * k)} ${F(x + 17 * k)},${F(cy + 4 * k)} L${F(x + 11 * k)},${F(cy + 8 * k)} L${F(x + 6 * k)},${F(cy + 4 * k)} L${F(x + 1 * k)},${F(cy + 9 * k)} L${F(x - 4 * k)},${F(cy + 5 * k)} L${F(x - 9 * k)},${F(cy + 9 * k)}Z`;
      const face = eye(x - 10 * k) + " " + eye(x + 10 * k) + ` M${F(x - 3 * k)},${F(cy + 2 * k)} L${F(x)},${F(cy - 3 * k)} L${F(x + 3 * k)},${F(cy + 2 * k)}Z ` + mouth;
      p += `<path d="${face}" fill="#8a3a08"/><path d="${face}" fill="#ffc440" transform="translate(${F(-side * 1.2 * k)},${F(.8 * k)})"/><path d="${face}" fill="#fff3b0" opacity=".6" transform="translate(${F(x * .12)},${F(cy * .12)}) scale(.88)"/>`;
    }
    return p;
  };

  /* pumpkin patch, left field: vines, leaves, pumpkins */
  let patch = "";
  for (let k = 0; k < 40; k++) { const x = 260 + r() * 560, y = 585 + r() * 55;
    patch += `<path d="M${F(x)},${F(y)} q${F(10 + r() * 10)},${F(-6 - r() * 6)} ${F(24 + r() * 16)},${F(-2 + r() * 4)} q${F(6)},${F(-4)} ${F(2)},${F(-8)}" stroke="#2e3a24" stroke-width="1.6" fill="none"/>`;
    for (let j = 0; j < 3; j++) { const lx = x + r() * 30, ly = y - r() * 8, c = ["#34462c", "#2a3a24", "#4a5e3a"][j];
      patch += `<path d="${blobP(lx, ly, 5 + r() * 3, 3.5 + r() * 2, 5)}" fill="${c}"/>`; } }
  const pk = []; for (let k = 0; k < 34; k++) pk.push([250 + r() * 590, 590 + r() * 55, .45 + r() * .35]);
  pk.sort((a, b) => a[1] - b[1]).forEach(([x, y, k]) => patch += pumpkin(x, y, k, false));
  s += `<g>${patch}</g>`;
  /* corn shocks */
  const shock = (x, y, k) => { let c = `<ellipse cx="${F(x + 8 * k)}" cy="${F(y)}" rx="${F(22 * k)}" ry="${F(4 * k)}" fill="#000" opacity=".3"/>`;
    for (let j = 0; j < 22; j++) { const t = j / 21, bx = x + (t - .5) * 40 * k, tx = x + (t - .5) * 10 * k + (r() - .5) * 4 * k, lit = (t < .5) === (x > MX);
      c += `<path d="M${F(bx)},${F(y)} L${F(x + (t - .5) * 8 * k)},${F(y - 34 * k)} L${F(tx + (t - .5) * 18 * k)},${F(y - 58 * k - r() * 8 * k)}" stroke="${lit ? "#8a7a5a" : (r() < .5 ? "#5a4c38" : "#4a3e2e")}" stroke-width="${F(2.2 * k)}" fill="none"/>`; }
    return c + `<path d="M${F(x - 6 * k)},${F(y - 34 * k)} L${F(x + 6 * k)},${F(y - 33 * k)}" stroke="#2a2018" stroke-width="${F(3 * k)}"/>`; };
  s += shock(880, 600, 1) + shock(940, 596, .8) + shock(2240, 598, .9) + shock(2300, 604, 1) + shock(160, 604, .85);

  /* distant farmhouse, right */
  const fx0 = 2060, fy0 = 572;
  s += `<rect x="${fx0 - 40}" y="${fy0 - 42}" width="80" height="42" fill="#4a4460"/><rect x="${fx0 + 2}" y="${fy0 - 42}" width="38" height="42" fill="#2e2a40"/>
    <path d="M${fx0 - 50},${fy0 - 40} L${fx0},${fy0 - 74} L${fx0 + 50},${fy0 - 40}Z" fill="#2a2436"/><path d="M${fx0 - 50},${fy0 - 40} L${fx0},${fy0 - 74} L${fx0},${fy0 - 40}Z" fill="#3e3650"/>
    <rect x="${fx0 + 16}" y="${fy0 - 84}" width="9" height="22" fill="#3a2e30"/>
    <circle cx="${fx0 - 18}" cy="${fy0 - 22}" r="30" fill="url(#hhGlow)" opacity=".5"/><rect x="${fx0 - 26}" y="${fy0 - 30}" width="14" height="14" fill="url(#hhPane)"/><rect x="${fx0 + 12}" y="${fy0 - 30}" width="12" height="14" fill="url(#hhPane)" opacity=".8"/>
    <path d="M${fx0 - 19},${fy0 - 30} v14 M${fx0 - 26},${fy0 - 23} h14" stroke="#2a2030" stroke-width="1.5"/>`;

  /* the knoll with the house */
  const HX = 1330, HY = 474;
  const knoll = x => Math.min(640, HY + Math.pow((x - HX) / 380, 2) * 120 + Math.sin(x / 60) * 2);
  s += `<path d="${ridgePath(knoll, H, 880, 1800)}" fill="url(#hhKnoll)"/>`;
  s += `<path d="${line(Array.from({ length: 50 }, (_, i) => { const x = 880 + i * 18.4; return [x, knoll(x) + 1]; }))}" stroke="#7e8a98" stroke-width="2" fill="none" opacity=".35"/>`;
  for (let k = 0; k < 420; k++) { const x = 900 + r() * 880, y = knoll(x) + 3 + r() * 90, hgt = 5 + r() * 9, lit = x < HX;
    if (y > 650) continue;
    s += `<path d="M${F(x)},${F(y)} q${F(-1 + r() * 2)},${F(-hgt * .6)} ${F(-3 + r() * 6)},${F(-hgt)}" stroke="${lit && r() < .6 ? "#6e7c7c" : "#20262a"}" stroke-width="1.6" fill="none" opacity=".75"/>`; }

  /* the house */
  const house = (cx, yb) => {
    let h = "";
    const L = cx - 95, R = cx + 95, top = yb - 112, trim = "#a89ec4", trimD = "#6a6288";
    const win = (x, y, w, hh, arch) => {
      let d = arch ? `M${x},${y + hh} L${x},${y + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w},${y + w / 2} L${x + w},${y + hh}Z` : `M${x},${y} h${w} v${hh} h${-w}Z`;
      h += `<circle cx="${x + w / 2}" cy="${y + hh / 2}" r="${w * 1.9}" fill="url(#hhGlow)" opacity=".45"/>`;
      h += `<path d="${d}" fill="${trim}" transform="translate(${x + w / 2},${y + hh / 2}) scale(1.22,1.14) translate(${-x - w / 2},${-y - hh / 2})"/>`;
      h += `<path d="${d}" fill="url(#hhPane)"/><path d="M${x + w / 2},${y + 2} V${y + hh} M${x},${y + hh * .55} H${x + w}" stroke="#3a2a2a" stroke-width="2.4"/>`;
      h += `<rect x="${x - 4}" y="${y + hh}" width="${w + 8}" height="4" fill="${trim}"/><rect x="${x - 4}" y="${y + hh + 3}" width="${w + 8}" height="2" fill="#2a2438"/>`;
    };
    // side wall + side roof (receding right, in shade)
    h += `<path d="${poly([[R, yb], [R, top], [R + 46, top - 10], [R + 46, yb - 6]])}" fill="#302a44"/>`;
    for (let y = top + 8; y < yb; y += 8) h += `<path d="M${R},${y} L${R + 46},${y - 8 + (y - top) * .02}" stroke="#000" stroke-width="1" opacity=".2"/>`;
    h += `<path d="${poly([[cx, top - 86], [R + 18, top + 4], [R + 64, top - 7], [cx + 46, top - 97]])}" fill="#1e1a2c"/>`;
    for (let k = 1; k < 9; k++) { const t = k / 9; h += `<path d="M${F(cx + (R + 18 - cx) * t)},${F(top - 86 + 90 * t)} l46,-11" stroke="#342e48" stroke-width="1.4"/>`; }
    // chimney on the side roof
    h += `<rect x="${R + 22}" y="${top - 62}" width="20" height="56" fill="#4a3434"/><rect x="${R + 22}" y="${top - 62}" width="8" height="56" fill="#6a4a46"/><rect x="${R + 18}" y="${top - 68}" width="28" height="7" fill="#2e2226"/>`;
    for (let y = top - 55; y < top - 8; y += 7) h += `<path d="M${R + 22},${y} h20" stroke="#2a1c1c" stroke-width="1" opacity=".6"/>`;
    // front wall with siding
    h += `<rect x="${L}" y="${top}" width="${R - L}" height="${yb - top}" fill="url(#hhWall)"/>`;
    for (let y = top + 7; y < yb; y += 7) h += `<path d="M${L},${y} H${R}" stroke="#1a1628" stroke-width="1.1" opacity=".3"/><path d="M${L},${y + 1.2} H${R}" stroke="#c8c0e0" stroke-width=".8" opacity=".1"/>`;
    h += `<rect x="${L}" y="${top}" width="6" height="${yb - top}" fill="${trim}"/><rect x="${R - 6}" y="${top}" width="6" height="${yb - top}" fill="${trimD}"/>`;
    // front gable with fish-scale shingles
    h += `<path d="${poly([[L + 4, top + 2], [cx, top - 74], [R - 4, top + 2]])}" fill="url(#hhWall)"/>`;
    for (let row = 0; row < 7; row++) { const y = top - 62 + row * 10, half = (y - (top - 74)) / 76 * (R - L - 8) / 2;
      for (let x = cx - half + 5; x < cx + half - 4; x += 10) h += `<path d="M${F(x - 5)},${F(y)} a5,5 0 0 0 10,0" fill="none" stroke="#2a2440" stroke-width="1.1" opacity=".55"/>`; }
    h += `<circle cx="${cx}" cy="${top - 30}" r="30" fill="url(#hhGlow)" opacity=".4"/><circle cx="${cx}" cy="${top - 30}" r="15" fill="${trim}"/><circle cx="${cx}" cy="${top - 30}" r="11.5" fill="url(#hhPane)"/><path d="M${cx},${top - 41} v22 M${cx - 11},${top - 30} h22" stroke="#3a2a2a" stroke-width="2"/>`;
    // front roof: lit left plane, shaded right plane, bargeboard trim
    h += `<path d="${poly([[L - 20, top + 6], [cx, top - 88], [cx, top - 76], [L - 4, top + 6]])}" fill="#4a4266"/>`;
    h += `<path d="${poly([[R + 20, top + 6], [cx, top - 88], [cx, top - 76], [R + 4, top + 6]])}" fill="#221e32"/>`;
    h += `<path d="M${L - 20},${top + 6} L${cx},${top - 88} L${R + 20},${top + 6}" stroke="${trim}" stroke-width="3" fill="none" opacity=".8"/>`;
    for (let k = 0; k < 12; k++) { const t = (k + .5) / 12; h += `<path d="M${F(L - 4 + (cx - L + 4) * t)},${F(top + 6 - 82 * t)} l-6,6" stroke="${trimD}" stroke-width="2"/>`; }
    // upper windows with shutters (one hangs crooked)
    [[cx - 64, 1], [cx + 36, 0]].forEach(([x, crooked]) => {
      win(x, top + 14, 28, 38, false);
      h += `<rect x="${x - 16}" y="${top + 12}" width="11" height="42" fill="#2c2440"/><rect x="${x + 33}" y="${top + 12}" width="11" height="42" fill="#2c2440" ${crooked ? `transform="rotate(14 ${x + 33} ${top + 12})"` : ""}/>`;
      for (let y = top + 16; y < top + 52; y += 5) h += `<path d="M${x - 15},${y} h9" stroke="#4a4066" stroke-width="1.2"/>`;
    });
    // porch: roof, posts, rail, door, steps
    const py = yb - 48;
    h += `<rect x="${L - 10}" y="${py - 8}" width="${R - L + 20}" height="10" fill="#241f34"/><rect x="${L - 10}" y="${py - 8}" width="${(R - L + 20) * .45}" height="4" fill="#5a5278"/><rect x="${L - 10}" y="${py + 2}" width="${R - L + 20}" height="3" fill="${trim}"/>`;
    win(L + 22, py + 8, 30, 30, false);
    h += `<circle cx="${cx + 30}" cy="${yb - 20}" r="60" fill="url(#hhGlow)" opacity=".4"/><rect x="${cx + 14}" y="${py + 6}" width="32" height="42" fill="${trim}"/><rect x="${cx + 18}" y="${py + 10}" width="24" height="38" fill="#3a2418"/><rect x="${cx + 21}" y="${py + 13}" width="18" height="14" fill="url(#hhPane)"/><circle cx="${cx + 38}" cy="${py + 32}" r="1.6" fill="#ffd070"/>`;
    [L - 4, L + 60, cx + 4, cx + 56, R + 2].forEach((x, i) => h += `<rect x="${x}" y="${py}" width="5" height="48" fill="${i < 2 ? trim : trimD}"/>`);
    h += `<rect x="${L - 8}" y="${yb - 20}" width="${cx + 6 - L}" height="3" fill="${trimD}"/>`;
    for (let x = L; x < cx; x += 7) h += `<rect x="${x}" y="${yb - 18}" width="2" height="18" fill="${trimD}"/>`;
    h += `<rect x="${L - 12}" y="${yb - 2}" width="${R - L + 24}" height="6" fill="#2a2438"/><rect x="${cx + 8}" y="${yb + 3}" width="44" height="5" fill="#4a4460"/><rect x="${cx + 4}" y="${yb + 8}" width="52" height="5" fill="#3a3450"/>`;
    // tower on the left, with conical roof, finial and weathervane
    const TL = L - 44, TR = L + 18, tc = (TL + TR) / 2, tt = top - 44;
    h += `<rect x="${TL}" y="${tt}" width="${TR - TL}" height="${yb - tt}" fill="url(#hhTower)"/>`;
    for (let y = tt + 7; y < yb; y += 7) h += `<path d="M${TL},${y} H${TR}" stroke="#1a1628" stroke-width="1" opacity=".3"/>`;
    h += `<rect x="${TL - 4}" y="${tt - 4}" width="${TR - TL + 8}" height="7" fill="${trim}"/>`;
    win(tc - 11, tt + 16, 22, 34, true); win(tc - 11, top + 44, 22, 34, true);
    h += `<path d="${poly([[TL - 10, tt - 2], [tc, tt - 118], [TR + 10, tt - 2]])}" fill="#221e32"/><path d="${poly([[TL - 10, tt - 2], [tc, tt - 118], [tc + 2, tt - 2]])}" fill="#4c4468"/>`;
    for (let k = 1; k < 8; k++) { const y = tt - 2 - k * 14, hw = (TR - TL + 20) / 2 * (1 - k / 8.4);
      h += `<path d="M${F(tc - hw)},${F(y)} Q${tc},${F(y + 5)} ${F(tc + hw)},${F(y)}" stroke="#16121e" stroke-width="1.2" fill="none" opacity=".6"/>`; }
    h += `<path d="M${tc},${tt - 118} V${tt - 146}" stroke="#2a2438" stroke-width="3"/><circle cx="${tc}" cy="${tt - 128}" r="3.5" fill="#6a6288"/>
      <path d="M${tc - 14},${tt - 142} h28 l-6,-4 M${tc - 14},${tt - 142} l5,4 l-5,4" stroke="#2a2438" stroke-width="2" fill="none"/><path d="M${tc + 2},${tt - 146} l10,-4 l-2,6Z" fill="#2a2438"/>`;
    // warm light spilling onto the ground
    h += `<ellipse cx="${cx + 20}" cy="${yb + 16}" rx="120" ry="16" fill="url(#hhGlow)" opacity=".45"/>`;
    return h;
  };
  s += house(HX, HY);

  /* path winding down from the porch, with lanterns */
  s += `<path d="M1382,487 C1400,520 1330,540 1300,570 C1270,600 1330,630 1260,720 L1350,720 C1400,640 1330,610 1350,575 C1370,545 1420,520 1398,487Z" fill="#524a5e"/>
        <path d="M1382,487 C1400,520 1330,540 1300,570 C1270,600 1330,630 1260,720" stroke="#2a2434" stroke-width="3" fill="none" opacity=".7"/>`;
  for (let k = 0; k < 40; k++) { const t = r(), y = 490 + t * 220, x = 1330 + Math.sin(t * 5.5) * 30 + (r() - .5) * 40;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(3 + t * 5)}" ry="${F(1.6 + t * 2.5)}" fill="#6e6680" opacity=".6"/>`; }
  [[1290, 548], [1420, 530]].forEach(([x, y]) => s += `<circle cx="${x}" cy="${y - 34}" r="46" fill="url(#hhGlow)" opacity=".55"/><rect x="${x - 1.5}" y="${y - 30}" width="3" height="30" fill="#1e1a26"/><rect x="${x - 6}" y="${y - 44}" width="12" height="14" rx="2" fill="#ffd070"/><path d="M${x - 8},${y - 44} h16 l-8,-6Z" fill="#1e1a26"/>`);

  /* the gnarled oak, right of the house */
  const TX = 1640, TY = knoll(1640) + 4;
  let tree = `<ellipse cx="${TX - 40}" cy="${TY + 4}" rx="170" ry="14" fill="#0e0c14" opacity=".35"/>`;
  tree += `<path d="M${TX - 40},${TY + 4} C${TX - 22},${TY - 10} ${TX - 20},${TY - 50} ${TX - 26},${TY - 90} C${TX - 34},${TY - 140} ${TX - 8},${TY - 170} ${TX - 16},${TY - 210} L${TX + 14},${TY - 206} C${TX + 16},${TY - 170} ${TX + 4},${TY - 130} ${TX + 18},${TY - 90} C${TX + 26},${TY - 50} ${TX + 30},${TY - 12} ${TX + 50},${TY + 4}Z" fill="url(#hhTrunk)"/>`;
  tree += `<path d="M${TX - 26},${TY - 20} C${TX - 22},${TY - 60} ${TX - 30},${TY - 120} ${TX - 14},${TY - 190}" stroke="#8a80a4" stroke-width="2.5" fill="none" opacity=".45"/>`;
  tree += `<path d="M${TX - 4},${TY - 60} q6,-18 -2,-34 M${TX + 6},${TY - 120} q-8,-14 0,-30" stroke="#120e18" stroke-width="2" fill="none" opacity=".6"/><ellipse cx="${TX + 2}" cy="${TY - 110}" rx="6" ry="9" fill="#0c0a10"/>`;
  const tips = [];
  const br = (bx, by, a, L, w, d) => {
    if (d > 5 || L < 8) { tips.push([bx, by]); return; }
    const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L, c1x = bx + Math.cos(a + (r() - .5)) * L * .4, c1y = by + Math.sin(a + (r() - .5)) * L * .4;
    const c2x = bx + Math.cos(a - (r() - .5) * .8) * L * .75, c2y = by + Math.sin(a - (r() - .5) * .8) * L * .75, dpath = `M${F(bx)},${F(by)} C${F(c1x)},${F(c1y)} ${F(c2x)},${F(c2y)} ${F(ex)},${F(ey)}`;
    tree += `<path d="${dpath}" stroke="#261e30" stroke-width="${F(w)}" fill="none" stroke-linecap="round"/>`;
    if (w > 2.5) tree += `<path d="${dpath}" stroke="#7a70a0" stroke-width="${F(w * .3)}" fill="none" stroke-linecap="round" transform="translate(${F(-w * .28)},${F(-w * .2)})" opacity=".6"/>`;
    br(ex, ey, a - .35 - r() * .45, L * (.62 + r() * .15), w * .64, d + 1);
    br(ex, ey, a + .3 + r() * .45, L * (.58 + r() * .15), w * .6, d + 1);
    if (r() < .35) br(ex, ey, a + (r() - .5) * .3, L * .5, w * .5, d + 2);
  };
  br(TX - 14, TY - 204, -2.6, 64, 18, 0); br(TX + 6, TY - 202, -.8, 60, 16, 0); br(TX - 4, TY - 206, -1.75, 34, 14, 1);
  br(TX - 24, TY - 130, -2.95, 62, 13, 1); br(TX + 14, TY - 110, -.3, 100, 12, 1);
  const LAX = TX - 24 + Math.cos(-2.95) * 40, LAY = TY - 130 + Math.sin(-2.95) * 40;
  s += `<g filter="url(#hhLeafyS)">${tree}</g>`;
  /* last few leaves clinging on */
  let lv = "";
  tips.forEach(([x, y]) => { if (r() < .55) return; for (let k = 0; k < 3; k++) { const v = Math.floor(r() * 4) + (x < TX ? 2 : 0);
    lv += `<path d="${blobP(x + (r() - .5) * 12, y + (r() - .5) * 10, 3 + r() * 2.5, 2.5 + r() * 2, 5)}" fill="${PR[Math.min(6, v)]}" opacity=".85"/>`; } });
  s += `<g filter="url(#hhLeafyS)">${lv}</g>`;
  /* lantern hanging from the long left limb */
  { const lx = F(LAX), ly = LAY + 4;
    s += `<path d="M${lx},${F(LAY)} V${F(ly + 26)}" stroke="#16121c" stroke-width="1.5"/><circle cx="${lx}" cy="${F(ly + 38)}" r="40" fill="url(#hhGlow)" opacity=".7"/><rect x="${F(LAX - 7)}" y="${F(ly + 26)}" width="14" height="20" rx="3" fill="#ffc450"/><path d="M${F(LAX - 9)},${F(ly + 26)} h18 l-9,-7Z M${F(LAX - 9)},${F(ly + 46)} h18" stroke="#16121c" stroke-width="2" fill="#16121c"/>`; }

  /* gravestones on the right slope */
  [[1520, 1], [1575, .8], [1720, .9], [1765, .75], [1480, .7]].forEach(([x, k]) => {
    const y = knoll(x) + 6, w = 22 * k, hh = 34 * k, lit = x < MX ? 1 : -1; let g = "";
    g += `<ellipse cx="${x + 6 * k}" cy="${y}" rx="${F(w * 1.1)}" ry="${F(4 * k)}" fill="#0e0c14" opacity=".4"/>`;
    const d = `M${F(x - w / 2)},${F(y)} V${F(y - hh + w / 2)} A${F(w / 2)},${F(w / 2)} 0 0 1 ${F(x + w / 2)},${F(y - hh + w / 2)} V${F(y)}Z`;
    g += `<path d="${d}" fill="#5e5a74" transform="translate(${F(4 * k)},${F(-1)})"/><path d="${d}" fill="#8a86a2"/><path d="M${F(x - w / 2)},${F(y)} V${F(y - hh + w / 2)} A${F(w / 2)},${F(w / 2)} 0 0 1 ${F(x - w * .1)},${F(y - hh + 1)} V${F(y)}Z" fill="#aaa6c2" opacity=".7"/>`;
    g += `<path d="M${F(x - w * .25)},${F(y - hh * .55)} h${F(w * .5)} M${F(x)},${F(y - hh * .75)} v${F(hh * .4)}" stroke="#4a465c" stroke-width="${F(2 * k)}"/>`;
    for (let j = 0; j < 8; j++) g += `<path d="M${F(x - w * .7 + r() * w * 1.4)},${F(y + 1)} l${F((r() - .5) * 4)},${F(-4 - r() * 5)}" stroke="#2e3634" stroke-width="1.4"/>`;
    s += g;
  });

  /* near meadow in front of everything low */
  const mead = wave([1, 3, 5], [500, 190, 80], [12, 6, 2]);
  const meadow = x => 652 + mead(x);
  s += `<path d="${ridgePath(meadow)}" fill="url(#hhMeadow)"/>`;
  for (let x = 0; x < W; x += 5 + r() * 9) { const y = meadow(x) + 4 + r() * 70, h = 8 + r() * 16;
    s += `<path d="M${F(x)},${F(y)} q${F(-2 + r() * 4)},${F(-h * .6)} ${F(-4 + r() * 8)},${F(-h)}" stroke="${r() < .45 ? "#5e6a64" : "#1c2220"}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75"/>`; }
  /* jack-o'-lanterns by the path */
  [[1190, 560, 1.15, 1], [1245, 572, .8, 1], [1140, 574, .7, 0], [1455, 556, 1, 1], [1505, 566, .7, 0]].forEach(([x, y, k, c]) => s += pumpkin(x, y, k, !!c));
  [[980, 675, 1.3, 1], [1560, 680, 1.1, 1], [640, 690, 1, 0]].forEach(([x, y, k, c]) => s += pumpkin(x, y, k, !!c));
  /* rickety fence on the left of the knoll */
  for (let x = 900; x < 1130; x += 28) { const y = knoll(x) + 26 + (x - 900) * .02, tilt = (r() - .5) * 8;
    s += `<path d="M${x},${F(y)} l${F(tilt * .3)},-30" stroke="#2a2230" stroke-width="5"/><path d="M${x - 1},${F(y)} l${F(tilt * .3)},-30" stroke="#6a6280" stroke-width="1.5"/>`;
    if (x + 28 < 1130) s += `<path d="M${x},${F(y - 22)} L${x + 28},${F(y - 21 + (r() - .5) * 6)} M${x},${F(y - 10)} L${x + 28},${F(y - 9)}" stroke="#3a3044" stroke-width="2.5"/>`; }

  /* foreground bushes, built from many small lit clumps */
  const bush = (x, y, R) => { let b = ""; const pts = [];
    for (let k = 0; k < 70; k++) { const a = r() * Math.PI, d = Math.sqrt(r()), px = x + Math.cos(a) * d * R * 1.1, py = y - Math.sin(a) * d * R * .7;
      const lit = ((MX - px) / 1500 * .5 + (y - py) / R) * .5 + r() * .3; pts.push([px, py, lit]); }
    pts.sort((a, b) => a[2] - b[2]);
    const BR = ["#1a1a24", "#26242e", "#3a2a2c", "#5a3228", "#7a4028", "#9a5a34", "#b07a4a"];
    b += `<path d="${blobP(x, y + 6, R * 1.15, R * .45)}" fill="#12121a"/>`;
    pts.forEach(([px, py, v]) => b += `<path d="${blobP(px, py, 9 + r() * 7, 7 + r() * 5, 6)}" fill="${BR[Math.max(0, Math.min(6, Math.floor(v * 7)))]}"/>`);
    return `<g filter="url(#hhLeafy)">${b}</g>`; };
  s += bush(70, 720, 110) + bush(230, 728, 70) + bush(2490, 720, 120) + bush(2350, 730, 70);

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#hhMoonG)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#hhPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
