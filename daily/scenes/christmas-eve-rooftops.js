/* Christmas Eve Rooftops: a small snowed-in town seen from the hill above it.
   Rows of steep snowy roofs recede to the far hills, every house drawn in
   perspective (front wall, the side facing the middle of the view, both roof
   planes from above), chimneys with smoke, wreaths, coloured lights strung
   along the eaves, a white church with a tall spire and a decorated tree in
   the square below it. Day: a pale winter sky with a low washed-out sun.
   opts.time === "night": deep blue sky, stars, a full moon with a tiny sleigh
   and reindeer crossing it, lit windows, glowing bulbs and lamps.
   One light source either way, upper left of the steeple.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".     */
function christmasEveRooftopsArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1224;
  const r = rng(seed), rs = rng(seed + 7);
  const W = 2560, H = 720, F = v => (+v).toFixed(1), CX = 1280;
  const LX = NIGHT ? 1150 : 980, LY = NIGHT ? 128 : 112;
  const T = c => NIGHT ? mix(mix(c, "#6a7490", .33), "#0b1230", .56) : c;
  const HZ = NIGHT ? "#33437a" : "#e4eaf2";
  const SN = NIGHT ? ["#cfdcf8", "#a2b4de", "#7488bc", "#4c6096", "#2c3a68"] : ["#fdfeff", "#ebf1f8", "#d0dcea", "#afbfd6", "#8c9fbe"];
  const BULBS = ["#ff4a3a", "#3fd46a", "#ffd23a", "#4a9cff", "#ff7ac8"];
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

  /* faceted mountains: lit face toward the light, shaded face away (hunters-moon-lake approach) */
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
      m += `<path d="${poly([...seg[i - 1], Fp])}" fill="${lc}"/><path d="${poly([...seg[i], Fp])}" fill="${rc}"/>`;
      m += `<path d="${poly([P, seg[i - 1][2], [(fx + L[0]) / 2, B]])}" fill="${mix(lc, o.mid, .5)}" opacity=".75"/>`;
      m += `<path d="${poly([P, seg[i][3], [(fx + R[0]) / 2, B]])}" fill="${mix(rc, o.mid, .5)}" opacity=".75"/>`;
      m += `<path d="${line(litL ? seg[i - 1] : seg[i])}" stroke="${o.rim}" stroke-width="2" fill="none" opacity=".5"/>`;
    }
    return m;
  };

  /* tiered conifer with snow resting on each tier */
  const conifer = (x, y, h, o) => {
    const s = o.lx < x ? -1 : 1; let g = "";
    const tw = Math.max(1.5, h * .04), th = h * .13;
    g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .6)},${F(y - th * 2.2)} L${F(x + tw * .6)},${F(y - th * 2.2)} L${F(x + tw)},${F(y)}Z" fill="${o.trunk}"/>`;
    const tiers = Math.max(3, Math.min(12, Math.round(h / 20))), top = y - h, bot = y - th, span = bot - top;
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - span * u * .9, ya = t === tiers - 1 ? top : Math.max(top, yb - span * (.3 - .1 * u)), w = h * .3 * (1 - u * .8) * (.85 + r() * .3);
      const A = [x + (r() - .5) * w * .08, ya], th2 = yb - ya, m = Math.max(2, Math.round(w / 7)) * 2, edge = [];
      for (let k = 0; k <= m; k++) { const px = x - w + 2 * w * k / m, d = Math.abs(px - x) / w;
        edge.push([px + (r() - .5) * w * .05, yb + (k % 2 ? -th2 * (.1 + r() * .08) : d * th2 * .16 + r() * 2)]); }
      const Lm = [x - w * .3, ya + th2 * .55], Rm = [x + w * .3, ya + th2 * .55];
      if (t > 0 && h > 40) g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mix(o.dark, "#000", .4)}" opacity=".5" transform="translate(${F(-s * th2 * .06)},${F(th2 * .12)})"/>`;
      g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${o.mid}"/>`;
      const shade = s < 0 ? [A, [x, yb - 2], ...edge.filter(p => p[0] > x), Rm] : [A, Lm, ...edge.filter(p => p[0] < x), [x, yb - 2]];
      g += `<path d="${poly(shade)}" fill="${o.dark}"/>`;
      const le = edge.filter(p => (p[0] - x) * s > w * .5); if (s > 0) le.reverse();
      g += `<path d="${poly([A, s < 0 ? Lm : Rm, ...le, [x + s * w * .38, yb - th2 * .3]])}" fill="${o.lit}"/>`;
      if (o.snow) {   // snow lying along the tier: a wavy band over the branch tips, brighter on the lit side
        const up = edge.map(p => [x + (p[0] - x) * .9, p[1] - th2 * (.2 + r() * .1)]), dn = edge.map(p => [x + (p[0] - x) * .97, p[1] - th2 * .03]);
        g += `<path d="${poly([...up, ...dn.reverse()])}" fill="${o.snow[1]}"/>`;
        const half = up.filter(p => (p[0] - x) * s >= -w * .1), halfDn = edge.filter(p => (p[0] - x) * s >= -w * .1).map(p => [x + (p[0] - x) * .97, p[1] - th2 * .1]);
        if (half.length > 1) g += `<path d="${poly([...half, ...halfDn.reverse()])}" fill="${o.snow[0]}"/>`;
        if (t === tiers - 1) g += `<path d="${blobP(A[0], A[1] + th2 * .2, w * .35, th2 * .22, 6)}" fill="${o.snow[0]}"/>`;
      }
    }
    return g;
  };

  /* ---------------------------------------------------------------- sky */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040920"/><stop offset=".42" stop-color="#0c1842"/><stop offset=".8" stop-color="#1f2f64"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#6c9acf"/><stop offset=".45" stop-color="#a6c4e4"/><stop offset=".82" stop-color="#d4e0ec"/><stop offset="1" stop-color="#ece6de"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e4ecff" stop-opacity=".55"/><stop offset=".14" stop-color="#b8c8f0" stop-opacity=".22"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".07"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fffaf0" stop-opacity=".85"/><stop offset=".18" stop-color="#fff2d8" stop-opacity=".4"/><stop offset=".55" stop-color="#ffe8c8" stop-opacity=".1"/><stop offset="1" stop-color="#ffe8c8" stop-opacity="0"/>`;
  const halo = (id, c, a = .9) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${a}"/><stop offset=".35" stop-color="${c}" stop-opacity="${a * .3}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  let s = `<defs id="xrdefs">
    <linearGradient id="xrSky" x1="0" y1="0" x2="0" y2="420" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="xrLight" cx="${LX}" cy="${LY}" r="820" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <radialGradient id="xrMoon" cx=".42" cy=".38" r=".66"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef2fb"/><stop offset="1" stop-color="#c8d2e8"/></radialGradient>
    <linearGradient id="xrHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="xrGround" x1="0" y1="380" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${mix(SN[1], HZ, .4)}"/><stop offset=".5" stop-color="${SN[1]}"/><stop offset="1" stop-color="${SN[2]}"/></linearGradient>
    <linearGradient id="xrHill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(SN[0], HZ, .45)}"/><stop offset="1" stop-color="${mix(SN[2], HZ, .45)}"/></linearGradient>
    <radialGradient id="xrPane" cx=".5" cy=".65" r=".7"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#ffc861"/><stop offset="1" stop-color="#e88a2e"/></radialGradient>
    ${halo("xrGlow", "#ffc060", .8)}${halo("xrTown", "#ffb860", .5)}
    ${BULBS.map((c, i) => halo("xrB" + i, c, .95)).join("")}
    <filter id="xrLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="xrSnowy" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="xrCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="xrPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="xrSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="xrMaria" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5"/></filter>
    <filter id="xrSmoke" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#xrSky)"/>`;

  if (NIGHT) {
    for (let i = 0; i < 520; i++) { const x = rs() * W, y = Math.pow(rs(), 1.4) * 400, d = Math.hypot(x - LX, y - LY);
      if (d < 150) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${rs() < .07 ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffecc8" : "#e8eeff"}" opacity="${F(.2 + rs() * .65 * (1 - y / 440))}"/>`; }
    const R = 60;
    s += `<rect width="${W}" height="${H}" fill="url(#xrLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 22}" fill="#cfdcff" opacity=".1"/><circle cx="${LX}" cy="${LY}" r="${R + 8}" fill="#dfe8ff" opacity=".14"/>`;
    s += `<circle cx="${LX}" cy="${LY}" r="${R}" fill="url(#xrMoon)"/><g filter="url(#xrMaria)">`;
    [[-22, -18, 16, 11], [8, -26, 13, 9], [20, -4, 17, 12], [-8, 6, 15, 10], [-28, 16, 10, 9], [12, 22, 9, 10], [30, 12, 7, 9]].forEach(([dx, dy, a, b]) =>
      s += `<path d="${blobP(LX + dx, LY + dy, a, b, 8, rs)}" fill="#8e9ab8" opacity=".32"/>`);
    s += `</g>`;
    for (let k = 0; k < 14; k++) { const a = rs() * 6.28, d = Math.sqrt(rs()) * R * .85, cr = 1.2 + rs() * 3;
      s += `<circle cx="${F(LX + Math.cos(a) * d)}" cy="${F(LY + Math.sin(a) * d)}" r="${F(cr)}" fill="#9aa4c0" opacity=".22"/>`; }
    s += `<circle cx="${LX}" cy="${LY}" r="${R - 1}" fill="none" stroke="#ffffff" stroke-width="2" opacity=".35"/>`;
    /* the sleigh and eight tiny reindeer flying up and to the right across the moon (silhouette, ~56px) */
    const sx = LX - 30, sy = LY + 20, ink = "#0e1430";
    let sl = `<g fill="${ink}" stroke="${ink}" stroke-linecap="round">`;
    sl += `<path d="M${sx - 10},${sy - 2} q-1,-6 3,-7 l9,0 q3,0 3,3 l0,4 q-2,3 -8,3Z" stroke="none"/>`;                     // sleigh body
    sl += `<path d="M${sx - 12},${sy + 3} l15,0 q4,0 4,-3" fill="none" stroke-width="1.1"/>`;                               // runner + curl
    sl += `<path d="M${sx - 8},${sy - 8} q2,-4 6,-2" stroke="none"/><circle cx="${sx - 4}" cy="${sy - 9}" r="2.4" stroke="none"/>`; // sack
    const deer = [];
    for (let k = 0; k < 4; k++) deer.push([sx + 14 + k * 10.5, sy - 4 - k * 3.4]);
    sl += `<path d="${line([[sx + 5, sy - 3], ...deer.map(([x, y]) => [x + 2, y - 1])])}" fill="none" stroke-width=".6"/>`;
    deer.forEach(([x, y], k) => { const b = k % 2 ? 1 : 0;
      sl += `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="1.6" stroke="none" transform="rotate(-14 ${x} ${y})"/>`;
      sl += `<path d="M${x + 3},${y - 1} l2,-2.6 l1.6,.2" fill="none" stroke-width="1.1"/>`;                                  // neck + head
      sl += `<path d="M${x + 5},${y - 3.6} l-.6,-2.2 M${x + 5.2},${y - 3.6} l1.2,-1.8 M${x + 4.6},${y - 5} l-1,-.4" fill="none" stroke-width=".5"/>`; // antlers
      sl += `<path d="M${x + 2.4},${y + .6} l${2.4 - b},${1.2 + b} M${x + 1.6},${y + 1} l${1.6},${2 - b} M${x - 2.6},${y + .4} l${-2.6 + b},${1.6} M${x - 1.8},${y + 1} l-1.4,${2.2 - b}" fill="none" stroke-width=".6"/>`; });
    s += sl + `</g>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#xrLight)"/><circle cx="${LX}" cy="${LY}" r="46" fill="#fffaf0" opacity=".35"/><circle cx="${LX}" cy="${LY}" r="32" fill="#fffdf6"/>`;
    s += `<g opacity=".08" filter="url(#xrSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .5 + k * .32, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: long thin winter strata, lit on the side toward the sun / moon */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#xrCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    const C = NIGHT ? ["#18224a", "#24305c", "#62749f", "#b0c0e8"] : ["#c6d0de", "#dae2ec", "#f8fafc", "#ffffff"];
    for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .05 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
    c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="${C[0]}"/>`;
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .42)}" fill="${C[1]}"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .95)}" ry="${F(R * .2)}" fill="${C[2]}" opacity=".85"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .16)}" rx="${F(R * .45)}" ry="${F(R * .08)}" fill="${C[3]}" opacity=".75"/>`);
    return c + `</g></g>`;
  };
  s += cloud(470, 150, 680, "drift1") + cloud(2050, 118, 760, "drift2") + cloud(1760, 252, 420, "drift3") + cloud(250, 262, 320, "drift2") + cloud(1480, 300, 300, "drift1");
  const cloudPart = s; s = DEFS;

  /* --------------------------------------------------------------- land */
  s += mountains(NIGHT
    ? { base: 372, hi: 286, lo: 336, step: 170, lx: LX, lit: "#6c80b8", mid: "#52659c", dark: "#3c4c80", rim: "#c8d6fa" }
    : { base: 372, hi: 286, lo: 336, step: 170, lx: LX, lit: "#eef2f8", mid: "#c2cee0", dark: "#98a8c4", rim: "#ffffff" });
  s += `<rect x="0" y="320" width="${W}" height="80" fill="url(#xrHaze)"/>`;
  /* snowy hills with a far fringe of little firs */
  const h1 = wave([1, 4, 2], [330, 140, 60], [12, 6, 2.5]);
  const hill = x => 392 + h1(x);
  s += `<path d="${ridgePath(hill)}" fill="url(#xrHill)"/>`;
  let fr = "";
  for (let row = 0; row < 2; row++) for (let x = -6; x < W + 6; x += 3 + r() * 5) {
    const y = hill(x) + 3 + row * 6 + r() * 4, h = 8 + r() * 9, c = mix(T("#4a6a60"), HZ, (NIGHT ? .62 : .8) - row * .1);
    fr += `<path d="M${F(x)},${F(y - h)} L${F(x + h * .32)},${F(y)} L${F(x - h * .32)},${F(y)}Z" fill="${c}"/><path d="M${F(x)},${F(y - h)} L${F(x + h * .32)},${F(y)} L${F(x)},${F(y)}Z" fill="${mix(c, "#000", .15)}"/><path d="M${F(x)},${F(y - h)} l${F(h * .12)},${F(h * .36)} l${F(-h * .24)},0Z" fill="${mix(SN[0], HZ, .35)}"/>`; }
  s += `<g filter="url(#xrLeafyS)">${fr}</g>`;
  s += `<path d="${ridgePath(x => 404 + h1(x) * .4)}" fill="url(#xrGround)"/>`;
  s += `<rect x="0" y="380" width="${W}" height="70" fill="url(#xrHaze)" opacity=".7"/>`;
  if (NIGHT) s += `<ellipse cx="1240" cy="520" rx="760" ry="170" fill="url(#xrTown)" opacity=".55"/>`;

  /* lights strung along an eave or rake; sagging between hooks */
  const bulbs = (pts, k, hz, sag = true) => {
    let path = [], b = "";
    for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(L / (5.5 * k)));
      for (let j = 0; j < n; j++) { const t = j / n, hk = 4, ph = (j % hk) / hk; path.push([ax + (bx - ax) * t, ay + (by - ay) * t + (sag ? Math.sin(ph * Math.PI) * 2.2 * k : 0)]); } }
    path.push(pts[pts.length - 1]);
    b += `<path d="${line(path)}" stroke="#1a2220" stroke-width="${F(.7 * k)}" fill="none" opacity="${NIGHT ? .5 : .6}"/>`;
    path.forEach(([x, y], i) => { if (i % 4 === 0) return; const ci = ((i + Math.floor(x)) % BULBS.length + BULBS.length) % BULBS.length, c = mix(BULBS[ci], HZ, hz * .6);
      if (NIGHT) b += `<circle cx="${F(x)}" cy="${F(y + 1.2 * k)}" r="${F(5 * k)}" fill="url(#xrB${ci})" opacity="${F(.85 - hz)}"/>`;
      b += `<circle cx="${F(x)}" cy="${F(y + 1.2 * k)}" r="${F(1.35 * k)}" fill="${NIGHT ? mix(c, "#ffffff", .35) : c}"/>`; });
    return b;
  };
  /* a wreath: many small lit/shaded clumps in a ring, red bow */
  const wreath = (cx, cy, R, hz) => {
    let g = "";
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283, lit = (-Math.cos(a) * .6 - Math.sin(a) * .8) * .5 + .5;
      g += `<path d="${blobP(cx + Math.cos(a) * R, cy + Math.sin(a) * R, R * .42, R * .36, 6)}" fill="${mix(T(mix("#173e26", "#5f9e4c", lit)), HZ, hz)}"/>`; }
    for (let i = 0; i < 5; i++) { const a = r() * 6.28; g += `<circle cx="${F(cx + Math.cos(a) * R)}" cy="${F(cy + Math.sin(a) * R)}" r="${F(R * .14)}" fill="${mix(T("#d8242a"), HZ, hz)}"/>`; }
    const bc = mix(T("#c81e26"), HZ, hz);
    g += `<path d="M${F(cx)},${F(cy + R)} l${F(-R * .55)},${F(-R * .3)} l0,${F(R * .6)}Z M${F(cx)},${F(cy + R)} l${F(R * .55)},${F(-R * .3)} l0,${F(R * .6)}Z M${F(cx - R * .1)},${F(cy + R)} l${F(-R * .25)},${F(R * .7)} M${F(cx + R * .1)},${F(cy + R)} l${F(R * .25)},${F(R * .7)}" fill="${bc}" stroke="${bc}" stroke-width="${F(R * .14)}"/>`;
    return g;
  };
  /* a window on a front wall */
  const win = (wx, wy, ww, wh, k, hz, lit) => {
    const fr = mix(T("#f2ede2"), HZ, hz); let g = "";
    if (NIGHT && lit) g += `<circle cx="${F(wx + ww / 2)}" cy="${F(wy + wh / 2)}" r="${F(ww * 1.7)}" fill="url(#xrGlow)" opacity="${F(.75 - hz)}"/>`;
    g += `<rect x="${F(wx - .8 * k)}" y="${F(wy - .8 * k)}" width="${F(ww + 1.6 * k)}" height="${F(wh + 1.6 * k)}" fill="${fr}"/>`;
    if (NIGHT) g += `<rect x="${F(wx)}" y="${F(wy)}" width="${F(ww)}" height="${F(wh)}" fill="${lit ? "url(#xrPane)" : "#1a2240"}"/>`;
    else { g += `<rect x="${F(wx)}" y="${F(wy)}" width="${F(ww)}" height="${F(wh)}" fill="${mix(lit ? "#c89a5a" : "#4a5c7c", HZ, hz)}"/><path d="${poly([[wx, wy + wh * .55], [wx + ww * .55, wy], [wx + ww * .85, wy], [wx, wy + wh * .9]])}" fill="#ffffff" opacity=".22"/>`; }
    if (ww > 5) g += `<path d="M${F(wx + ww / 2)},${F(wy)} v${F(wh)} M${F(wx)},${F(wy + wh * .45)} h${F(ww)}" stroke="${fr}" stroke-width="${F(.7 * k)}"/>`;
    g += `<rect x="${F(wx - 1.2 * k)}" y="${F(wy + wh)}" width="${F(ww + 2.4 * k)}" height="${F(1.6 * k)}" rx="${F(.8 * k)}" fill="${mix(SN[0], HZ, hz)}"/>`;
    return g;
  };
  /* chimney on a roof plane, snow cap, smoke drifting right */
  const smoke = [];
  const chimney = (px, py, k, hz, puff) => {
    const cw = 9 * k, ch = 20 * k, c = mix(T("#9a4e3c"), HZ, hz), cs = mix(T("#5e2e26"), HZ, hz); let g = "";
    g += `<rect x="${F(px - cw / 2)}" y="${F(py - ch)}" width="${F(cw)}" height="${F(ch + 4 * k)}" fill="${c}"/>`;
    g += `<path d="${poly([[px + cw / 2, py - ch], [px + cw * .95, py - ch - cw * .35], [px + cw * .95, py + 4 * k - cw * .35], [px + cw / 2, py + 4 * k]])}" fill="${cs}"/>`;
    for (let j = 1; j < 4; j++) g += `<rect x="${F(px - cw / 2)}" y="${F(py - ch + j * ch / 4)}" width="${F(cw)}" height="${F(.6 * k)}" fill="${cs}" opacity=".5"/>`;
    g += `<path d="${blobP(px + cw * .2, py - ch - cw * .12, cw * .72, cw * .26, 7)}" fill="${mix(SN[0], HZ, hz)}"/>`;
    if (puff) smoke.push([px + cw * .2, py - ch - cw * .3, k, hz]);
    return g;
  };

  /* a house in perspective. type 0: front gable toward us; type 1: ridge across */
  const WALLS = ["#b8503e", "#e9dcc2", "#8fa07e", "#6d80a0", "#d9aa5c", "#a8684a", "#f2eee4", "#7c5444", "#c97a5a", "#9a8fb0", "#e6c9a0", "#5f7a6a"];
  const house = o => {
    const { x, y, k, hz, type, w } = o;
    const Hc = c => mix(c, HZ, hz);
    const h = (30 + r() * 26) * k, d = (58 + r() * 36) * k;
    const xL = x - w / 2, xR = x + w / 2, dx = (CX - x) / CX * d * .85, dy = -d * .6, sd = dx >= 0 ? 1 : -1;
    const xs = sd > 0 ? xR : xL, xo = sd > 0 ? xL : xR, ov = 4.5 * k;
    const wall = WALLS[Math.floor(r() * WALLS.length)];
    const fw = Hc(T(wall)), sw = Hc(T(mix(wall, "#1e2238", .4))), fasc = Hc(T("#3a2a26"));
    const snL = Hc(SN[0]), snM = Hc(SN[1]), snS = Hc(SN[2]), snD = Hc(SN[3]);
    const lights = r() < .62 && k > .34, lit = () => r() < (NIGHT ? .72 : .14);
    let g = "";
    g += `<path d="${poly([[xL, y], [xR, y], [xR + dx * .5 + 22 * k, y + dy * .5 + 4 * k], [xR + 26 * k, y + 7 * k], [xL + 8 * k, y + 6 * k]])}" fill="${Hc(SN[4])}" opacity=".3"/>`;
    const sideWin = (t1, t2, z1, z2, isLit) => { const P = (t, z) => [xs + dx * t, y + dy * t - z];
      return `<path d="${poly([P(t1, z2), P(t2, z2), P(t2, z1), P(t1, z1)])}" fill="${NIGHT ? (isLit ? "#e8a24a" : "#141a34") : Hc("#3a4864")}" stroke="${Hc(T("#cfc8ba"))}" stroke-width="${F(.6 * k)}"/>`; };
    const sideWall = top => { let p = `<path d="${poly(top)}" fill="${sw}"/>`;
      if (k > .38) { const nw = Math.max(1, Math.floor(d / (26 * k))); for (let i = 0; i < nw; i++) { const t1 = (i + .3) / nw, t2 = t1 + .3 / nw * 1.4, L = lit();
        p += sideWin(t1, t2, h * .32, h * .62, L); if (NIGHT && L) p += `<circle cx="${F(xs + dx * (t1 + t2) / 2)}" cy="${F(y + dy * (t1 + t2) / 2 - h * .47)}" r="${F(9 * k)}" fill="url(#xrGlow)" opacity="${F(.5 - hz)}"/>`; } }
      return p; };
    const front = (gable, rh) => {
      let p = `<path d="${poly(gable ? [[xL, y], [xR, y], [xR, y - h], [x, y - h - rh], [xL, y - h]] : [[xL, y], [xR, y], [xR, y - h], [xL, y - h]])}" fill="${fw}"/>`;
      if (r() < .55) for (let yy = y - 3 * k; yy > y - h - (gable ? rh * .8 : 0); yy -= 3.2 * k) { const half = gable && yy < y - h ? (w / 2) * (1 - (y - h - yy) / rh) : w / 2;
        p += `<rect x="${F(x - half)}" y="${F(yy)}" width="${F(half * 2)}" height="${F(.5 * k)}" fill="#000" opacity=".08"/>`; }
      p += `<rect x="${F(xL)}" y="${F(y - h)}" width="${F(2.2 * k)}" height="${F(h)}" fill="#fff" opacity="${NIGHT ? .06 : .18}"/>`;
      p += `<rect x="${F(xL)}" y="${F(y - h)}" width="${F(w)}" height="${F(4 * k)}" fill="#000" opacity=".15"/>`;
      if (k < .33) { const n = Math.max(1, Math.floor(w / (12 * k))); for (let i = 0; i < n; i++) { const L = lit();
          p += `<rect x="${F(xL + (i + .3) * w / n)}" y="${F(y - h * .6)}" width="${F(w / n * .4)}" height="${F(h * .3)}" fill="${NIGHT ? (L ? "#ffc35e" : "#1a2240") : Hc("#56688a")}"/>`; } return p; }
      const floors = h > 44 * k ? 2 : 1, n = Math.max(1, Math.floor(w / (24 * k))), dI = Math.floor(r() * n), ww = 7 * k, wh = 9 * k;
      for (let f = 0; f < floors; f++) for (let i = 0; i < n; i++) { const cx = xL + (i + .5) * w / n, wy = y - (f + 1) * h / floors + h / floors * .25;
        if (f === 0 && i === dI) { const dc = Hc(T(["#7a2a22", "#2e4a3a", "#2a3a5a", "#5a3a26"][Math.floor(r() * 4)]));
          p += `<rect x="${F(cx - 4.5 * k)}" y="${F(y - 15 * k)}" width="${F(9 * k)}" height="${F(15 * k)}" fill="${Hc(T("#efe8da"))}"/><rect x="${F(cx - 3.5 * k)}" y="${F(y - 14 * k)}" width="${F(7 * k)}" height="${F(14 * k)}" fill="${dc}"/>`;
          if (NIGHT) p += `<circle cx="${F(cx)}" cy="${F(y - 18 * k)}" r="${F(10 * k)}" fill="url(#xrGlow)" opacity=".7"/><rect x="${F(cx - 1 * k)}" y="${F(y - 19 * k)}" width="${F(2 * k)}" height="${F(2.5 * k)}" fill="#ffe2a0"/>`;
          if (k > .5) p += wreath(cx, y - 9.5 * k, 2.6 * k, hz);
          continue; }
        p += win(cx - ww / 2, wy, ww, wh, k, hz, lit()); }
      if (gable && k > .45) { const L = lit(); p += win(x - 3.5 * k, y - h - rh * .55, 7 * k, 7 * k, k, hz, L);
        if (r() < .5 && k > .6) p += wreath(x, y - h - rh * .3 + 1 * k, 3 * k, hz); }
      return p; };
    const drift = () => { let p = ""; for (let xx = xL - 3 * k; xx < xR + 3 * k; xx += 5 * k) p += `<path d="${blobP(xx, y + 1 * k, 4.5 * k, 2.6 * k, 6)}" fill="${snM}"/>`;
      return `<g filter="url(#xrSnowy)">${p}</g>`; };
    const eaveRim = (a, b, ice) => { let p = `<path d="${line([a, b])}" stroke="${fasc}" stroke-width="${F(1.6 * k)}" transform="translate(0,${F(1.6 * k)})"/><path d="${line([a, b])}" stroke="${snL}" stroke-width="${F(3.2 * k)}" stroke-linecap="round"/>`;
      if (ice && k > .4) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / (3.5 * k));
        for (let i = 1; i < n; i++) { if (r() < .4) continue; const t = i / n, px = a[0] + (b[0] - a[0]) * t, py = a[1] + (b[1] - a[1]) * t + 1.4 * k, il = (1.5 + r() * 4.5) * k;
          p += `<path d="M${F(px - .7 * k)},${F(py)} L${F(px)},${F(py + il)} L${F(px + .7 * k)},${F(py)}Z" fill="${snL}" opacity=".9"/>`; } }
      return p; };

    if (type === 0) {
      const rh = w * (.42 + r() * .25), A = [x, y - h - rh], A2 = [x + dx, y - h - rh + dy];
      const plO = [[xo - sd * ov, y - h + 2 * k], A, A2, [xo + dx - sd * ov, y - h + dy + 2 * k]];
      const plV = [[xs + sd * ov, y - h + 2 * k], A, A2, [xs + dx + sd * ov, y - h + dy + 2 * k]];
      g += `<path d="${poly(plO)}" fill="${sd > 0 ? snL : snS}"/>`;
      g += sideWall([[xs, y], [xs, y - h], [xs + dx, y - h + dy], [xs + dx, y + dy]]);
      g += `<path d="${poly(plV)}" fill="${sd > 0 ? snS : snL}"/>`;
      for (let j = 1; j < 4; j++) { const t = j / 4; g += `<path d="${line([[plV[0][0] + (A[0] - plV[0][0]) * t, plV[0][1] + (A[1] - plV[0][1]) * t], [plV[3][0] + (A2[0] - plV[3][0]) * t, plV[3][1] + (A2[1] - plV[3][1]) * t]])}" stroke="${snD}" stroke-width="${F(.6 * k)}" opacity=".25"/>`; }
      g += `<path d="${line([A, A2])}" stroke="${snL}" stroke-width="${F(2.4 * k)}" stroke-linecap="round"/>`;
      g += eaveRim(plV[0], plV[3], true);
      if (r() < .75) { const t = .35 + r() * .3; g += chimney(xs + (x - xs) * .45 + dx * t, y - h - rh * .45 + dy * t, k, hz, r() < .7); }
      g += front(true, rh);
      if (lights) g += bulbs([[xL - ov, y - h + 3.5 * k], [x, y - h - rh + 2.5 * k], [xR + ov, y - h + 3.5 * k]], k, hz, false);
      g += `<path d="${line([[xL - ov, y - h + 1.5 * k], [x, y - h - rh - 1 * k], [xR + ov, y - h + 1.5 * k]])}" stroke="${fasc}" stroke-width="${F(1.4 * k)}" fill="none" transform="translate(0,${F(1.4 * k)})"/>`;
      g += `<path d="${line([[xL - ov, y - h + 1.5 * k], [x, y - h - rh - 1 * k], [xR + ov, y - h + 1.5 * k]])}" stroke="${snL}" stroke-width="${F(3.4 * k)}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
      if (lights && k > .4) g += bulbs([[xs + sd * ov, y - h + 4 * k], [xs + dx + sd * ov, y - h + dy + 4 * k]], k, hz);
    } else {
      const rh = d * (.34 + r() * .18), R1 = [xL + dx / 2, y - h + dy / 2 - rh], R2 = [xR + dx / 2, y - h + dy / 2 - rh];
      g += `<path d="${poly([[R1[0] - ov, R1[1]], [R2[0] + ov, R2[1]], [xR + dx + ov, y - h + dy], [xL + dx - ov, y - h + dy]])}" fill="${snM}"/>`;
      const Rs = sd > 0 ? R2 : R1;
      g += sideWall([[xs, y], [xs, y - h], Rs, [xs + dx, y - h + dy], [xs + dx, y + dy]]);
      g += `<path d="${line([[xs + sd * ov * .5, y - h], [Rs[0] + sd * ov * .5, Rs[1] - 1 * k], [xs + dx + sd * ov * .5, y - h + dy]])}" stroke="${snL}" stroke-width="${F(2.8 * k)}" fill="none" stroke-linejoin="round"/>`;
      g += front(false, 0);
      g += drift();
      const plF = [[xL - ov, y - h + 2 * k], [xR + ov, y - h + 2 * k], [R2[0] + ov, R2[1]], [R1[0] - ov, R1[1]]];
      g += `<path d="${poly(plF)}" fill="${mix(snL, snM, .3)}"/>`;
      g += `<path d="${poly([[xL - ov, y - h + 2 * k], [xR + ov, y - h + 2 * k], [R2[0] + ov, (R2[1] + y - h) / 2], [R1[0] - ov, (R1[1] + y - h) / 2]])}" fill="${snS}" opacity=".18"/>`;
      if (k > .5 && r() < .45) { // a small dormer
        const dxm = x + (r() - .5) * w * .3 + dx * .25, dym = y - h + dy * .25 - rh * .5, dw = 9 * k;
        g += `<path d="${poly([[dxm - dw, dym + 6 * k], [dxm - dw, dym - 4 * k], [dxm, dym - 11 * k], [dxm + dw, dym - 4 * k], [dxm + dw, dym + 6 * k]])}" fill="${fw}"/>` + win(dxm - 3 * k, dym - 4 * k, 6 * k, 7 * k, k, hz, lit());
        g += `<path d="${line([[dxm - dw - 2 * k, dym - 3 * k], [dxm, dym - 12.5 * k], [dxm + dw + 2 * k, dym - 3 * k]])}" stroke="${snL}" stroke-width="${F(3 * k)}" fill="none" stroke-linejoin="round"/>`; }
      if (r() < .8) { const u = .15 + r() * .7; g += chimney(xL + w * u + dx * .3, y - h + (dy / 2 - rh) * .6, k, hz, r() < .7); }
      g += `<path d="${line([[R1[0] - ov, R1[1]], [R2[0] + ov, R2[1]]])}" stroke="${snL}" stroke-width="${F(2.6 * k)}" stroke-linecap="round"/>`;
      g += eaveRim([xL - ov, y - h + 2 * k], [xR + ov, y - h + 2 * k], true);
      if (lights) g += bulbs([[xL - ov, y - h + 4.5 * k], [xR + ov, y - h + 4.5 * k]], k, hz);
    }
    if (type === 0) g += drift();
    if (k > .45 && r() < .45) {   // a little picket fence and a snowy shrub in the front yard
      const fy = y + 9 * k, fc = Hc(T("#ece6da")), fx0 = xL - 6 * k, fx1 = xL + w * (.3 + r() * .4);
      for (let fx = fx0; fx < fx1; fx += 3.4 * k) g += `<rect x="${F(fx)}" y="${F(fy - 7 * k)}" width="${F(1.4 * k)}" height="${F(7 * k)}" fill="${fc}"/>`;
      g += `<rect x="${F(fx0)}" y="${F(fy - 5 * k)}" width="${F(fx1 - fx0)}" height="${F(1 * k)}" fill="${fc}"/><path d="${line([[fx0, fy - 7.2 * k], [fx1, fy - 7.2 * k]])}" stroke="${snL}" stroke-width="${F(1.4 * k)}" stroke-linecap="round"/>`;
      const bx = xR - r() * w * .3, by = y + 6 * k, bg = Hc(T("#2c5040"));
      g += `<g filter="url(#xrLeafyS)"><path d="${blobP(bx, by, 9 * k, 5 * k, 8)}" fill="${mix(bg, "#000", .25)}"/><path d="${blobP(bx - 1 * k, by - 1.5 * k, 7.5 * k, 4 * k, 8)}" fill="${bg}"/><path d="${blobP(bx - 1.5 * k, by - 4 * k, 7 * k, 2.4 * k, 7)}" fill="${snL}"/></g>`;
    }
    return g;
  };

  const SNOWTREE = NIGHT
    ? { trunk: "#1a1820", dark: "#0e1a26", mid: "#162a34", lit: "#24404a", snow: [SN[0], SN[2]] }
    : { trunk: "#4a3628", dark: "#1c3a32", mid: "#2a5244", lit: "#3e6e58", snow: [SN[0], SN[2]] };
  const tree = (x, y, h, hz) => conifer(x, y, h, { lx: LX, trunk: mix(SNOWTREE.trunk, HZ, hz), dark: mix(SNOWTREE.dark, HZ, hz), mid: mix(SNOWTREE.mid, HZ, hz), lit: mix(SNOWTREE.lit, HZ, hz), snow: SNOWTREE.snow.map(c => mix(c, HZ, hz)) });
  const lamp = (x, y, k) => {
    const pc = T("#22262e"); let g = "";
    if (NIGHT) g += `<circle cx="${F(x)}" cy="${F(y - 40 * k)}" r="${F(46 * k)}" fill="url(#xrGlow)" opacity=".8"/><ellipse cx="${F(x)}" cy="${F(y + 2 * k)}" rx="${F(30 * k)}" ry="${F(7 * k)}" fill="#ffc870" opacity=".3"/>`;
    g += `<rect x="${F(x - 1.2 * k)}" y="${F(y - 38 * k)}" width="${F(2.4 * k)}" height="${F(38 * k)}" fill="${pc}"/><rect x="${F(x - 3 * k)}" y="${F(y - 4 * k)}" width="${F(6 * k)}" height="${F(4 * k)}" fill="${pc}"/>`;
    g += `<path d="${poly([[x - 4 * k, y - 38 * k], [x + 4 * k, y - 38 * k], [x + 5 * k, y - 48 * k], [x - 5 * k, y - 48 * k]])}" fill="${NIGHT ? "#ffe2a0" : "#e8e4d8"}"/><path d="M${F(x - 6.5 * k)},${F(y - 48 * k)} L${F(x)},${F(y - 53 * k)} L${F(x + 6.5 * k)},${F(y - 48 * k)}Z" fill="${pc}"/>`;
    g += `<path d="${blobP(x, y - 52 * k, 5 * k, 2 * k, 6)}" fill="${SN[0]}"/>`;
    g += `<path d="M${F(x)},${F(y - 33 * k)} l${F(-3.5 * k)},${F(-3 * k)} l0,${F(6 * k)}Z M${F(x)},${F(y - 33 * k)} l${F(3.5 * k)},${F(-3 * k)} l0,${F(6 * k)}Z" fill="${T("#c81e26")}"/>`;
    return g;
  };

  /* rows of houses, far to near; each row drawn from the outside in so nearer-centre houses overlap */
  const ROWS = [[412, .27, .55, null], [440, .36, .44, null], [478, .47, .3, null], [536, .64, .16, [1140, 1520]], [622, .84, .06, [930, 1460]], [722, 1.12, 0, [1150, 1250]]];
  ROWS.forEach(([ry, k, hz, gap], ri) => {
    const items = [];
    let x = -50 + r() * 30;
    while (x < W + 60) { const w = (56 + r() * 52) * k;
      if (gap && x + w / 2 > gap[0] && x - w / 2 < gap[1]) { x = gap[1] + w / 2 + 6 * k; continue; }
      if (r() < .12 && k > .4) items.push({ kind: "tree", x, y: ry + (r() - .5) * 6 * k, h: (40 + r() * 40) * k, hz });
      else items.push({ kind: "house", x, y: ry + (r() - .5) * 8 * k, k, hz, type: r() < .5 ? 0 : 1, w });
      x += w + (4 + r() * 18) * k; }
    if (ri === 3) items.push({ kind: "church" });
    if (ri === 4) items.push({ kind: "square" });
    items.sort((a, b) => (a.kind === "church" || a.kind === "square") - (b.kind === "church" || b.kind === "square") || Math.abs(b.x - CX) - Math.abs(a.x - CX));
    items.forEach(it => {
      if (it.kind === "house") s += house(it);
      else if (it.kind === "tree") s += `<g filter="url(#xrLeafyS)">${tree(it.x, it.y, it.h, it.hz)}</g>`;
      else if (it.kind === "church") s += church(1330, 540);
      else if (it.kind === "square") s += square();
    });
    if (ri < 2) s += `<rect x="0" y="${ry - 30}" width="${W}" height="50" fill="url(#xrHaze)" opacity=".35"/>`;
  });

  /* the church: nave with its gable toward us, a square tower and a tall spire */
  function church(x, y) {
    let g = "";
    const st = T("#b85a46"), stS = T("#7e3a32"), stD = T("#5a3a3a"), rf = mix(SN[0], HZ, .1);
    const w = 150, h = 88, rh = 74, d = 190, dx = (CX - x) / CX * d * .85, dy = -d * .6, xL = x - w / 2, xR = x + w / 2;
    // nave: roof planes, left side wall (visible since we are right of centre), front gable
    const A = [x, y - h - rh], A2 = [x + dx, y - h - rh + dy];
    g += `<path d="${poly([[xR + 6, y - h + 3], A, A2, [xR + dx + 6, y - h + dy + 3]])}" fill="${SN[2]}"/>`;
    g += `<path d="${poly([[xL, y], [xL, y - h], [xL + dx, y - h + dy], [xL + dx, y + dy]])}" fill="${stS}"/>`;
    for (let i = 0; i < 4; i++) { const t1 = .12 + i * .21, t2 = t1 + .08, P = (t, z) => [xL + dx * t, y + dy * t - z];
      g += `<path d="${poly([P(t1, 70), P(t2, 70), P(t2, 22), P(t1, 22)])}" fill="${NIGHT ? ["#e8604a", "#5aa0f0", "#f0c050", "#6ad08a"][i] : "#4a5878"}" opacity="${NIGHT ? .85 : 1}"/>`;
      if (NIGHT) g += `<circle cx="${F(xL + dx * (t1 + t2) / 2)}" cy="${F(y + dy * (t1 + t2) / 2 - 46)}" r="26" fill="url(#xrGlow)" opacity=".5"/>`; }
    g += `<path d="${poly([[xL - 6, y - h + 3], A, A2, [xL + dx - 6, y - h + dy + 3]])}" fill="${SN[0]}"/>`;
    for (let j = 1; j < 5; j++) { const t = j / 5; g += `<path d="${line([[xL - 6 + (A[0] - xL + 6) * t, y - h + 3 + (A[1] - y + h - 3) * t], [xL + dx - 6 + (A2[0] - xL - dx + 6) * t, y - h + dy + 3 + (A2[1] - y + h - dy - 3) * t]])}" stroke="${SN[3]}" stroke-width=".8" opacity=".25"/>`; }
    { const P = (u, t) => [xL - 6 + (A[0] - xL + 6) * u + dx * t, y - h + 3 + (A[1] - y + h - 3) * u + dy * t];   // drifts and wind ripples on the big roof
      for (let k = 0; k < 9; k++) { const u = .1 + r() * .8, t = .1 + r() * .8, [px, py] = P(u, t);
        g += `<path d="${blobP(px, py, 14 + r() * 16, 5 + r() * 4, 8)}" fill="${SN[2]}" opacity=".35" filter="url(#xrSnowy)"/><path d="${blobP(px - 4, py - 3, 10 + r() * 10, 3, 7)}" fill="#ffffff" opacity="${NIGHT ? .15 : .5}"/>`; }
      g += `<path d="${poly([P(.7, 0), P(1, 0), P(1, 1), P(.7, 1)])}" fill="${SN[3]}" opacity=".2"/>`; }
    g += `<path d="${line([A, A2])}" stroke="${SN[0]}" stroke-width="3" stroke-linecap="round"/><path d="${line([[xL - 6, y - h + 3], [xL + dx - 6, y - h + dy + 3]])}" stroke="${SN[0]}" stroke-width="4" stroke-linecap="round"/>`;
    g += `<path d="${poly([[xL, y], [xR, y], [xR, y - h], [x, y - h - rh], [xL, y - h]])}" fill="${st}"/>`;
    for (let yy = y - 8; yy > y - h - rh * .8; yy -= 8) { const half = yy < y - h ? (w / 2) * (1 - (y - h - yy) / rh) : w / 2;
      g += `<rect x="${F(x - half)}" y="${F(yy)}" width="${F(half * 2)}" height=".8" fill="#000" opacity=".06"/>`; }
    g += `<rect x="${xR - 34}" y="${y - h}" width="34" height="${h}" fill="#000" opacity=".06"/>`;
    [[xL + 22, y - 74], [xR - 34, y - 74]].forEach(([wx, wy]) => {
      if (NIGHT) g += `<circle cx="${wx + 6}" cy="${wy + 22}" r="34" fill="url(#xrGlow)" opacity=".6"/>`;
      g += `<path d="M${wx},${wy + 44} L${wx},${wy + 8} Q${wx + 6},${wy - 2} ${wx + 12},${wy + 8} L${wx + 12},${wy + 44}Z" fill="${NIGHT ? "url(#xrPane)" : "#4a5878"}" stroke="${T("#d8d0c0")}" stroke-width="1.5"/>`;
      if (NIGHT) g += `<path d="M${wx + 2},${wy + 20} h8 M${wx + 2},${wy + 32} h8" stroke="#c84a3a" stroke-width="2" opacity=".6"/>`; });
    g += `<path d="${line([[xL - 7, y - h + 2], [x, y - h - rh - 2], [xR + 7, y - h + 2]])}" stroke="${T("#5a4a44")}" stroke-width="2" fill="none" transform="translate(0,2)"/><path d="${line([[xL - 7, y - h + 2], [x, y - h - rh - 2], [xR + 7, y - h + 2]])}" stroke="${rf}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    // tower in front of the nave
    const tw = 58, tL = x - tw / 2, tR = x + tw / 2, tb = y + 6, tt = tb - 196, ts = -9;   // ts: visible left side offset
    g += `<path d="${poly([[tL, tb], [tL, tt], [tL + ts, tt - 12], [tL + ts, tb - 12]])}" fill="${stS}"/>`;
    g += `<rect x="${tL}" y="${tt}" width="${tw}" height="${tb - tt}" fill="${st}"/><rect x="${tR - 16}" y="${tt}" width="16" height="${tb - tt}" fill="#000" opacity=".07"/>`;
    for (let yy = tb - 10; yy > tt; yy -= 10) g += `<rect x="${tL}" y="${yy}" width="${tw}" height=".8" fill="#000" opacity=".07"/>`;
    // door with wreath, steps of snow
    if (NIGHT) g += `<circle cx="${x}" cy="${tb - 30}" r="48" fill="url(#xrGlow)" opacity=".75"/>`;
    g += `<path d="M${x - 15},${tb} L${x - 15},${tb - 36} Q${x},${tb - 54} ${x + 15},${tb - 36} L${x + 15},${tb}Z" fill="${T("#e2dace")}"/><path d="M${x - 12},${tb} L${x - 12},${tb - 35} Q${x},${tb - 50} ${x + 12},${tb - 35} L${x + 12},${tb}Z" fill="${T("#8a2a24")}"/><path d="M${x},${tb} v-46" stroke="${T("#4a1a16")}" stroke-width="1.5"/>`;
    g += wreath(x, tb - 30, 7, 0);
    // round window + clock
    g += `<circle cx="${x}" cy="${tt + 66}" r="13" fill="${T("#f8f4ea")}" stroke="${T("#9a8a7a")}" stroke-width="2"/><path d="M${x},${tt + 66} l0,-9 M${x},${tt + 66} l6,3" stroke="${T("#2a2a30")}" stroke-width="1.6" stroke-linecap="round"/>`;
    g += `<path d="M${x - 9},${tt + 120} L${x - 9},${tt + 100} Q${x},${tt + 90} ${x + 9},${tt + 100} L${x + 9},${tt + 120}Z" fill="${NIGHT ? "url(#xrPane)" : "#4a5878"}"/>`;
    // cornice with snow, belfry
    g += `<rect x="${tL - 5}" y="${tt - 5}" width="${tw + 10}" height="7" fill="${stS}"/><path d="${blobP(x, tt - 6, tw * .55, 4, 9)}" fill="${SN[0]}"/>`;
    const bb = tt - 6, bt = bb - 50, bw = 46, bL = x - bw / 2, bR = x + bw / 2;
    g += `<path d="${poly([[bL, bb], [bL, bt], [bL - 7, bt - 9], [bL - 7, bb - 9]])}" fill="${stS}"/><rect x="${bL}" y="${bt}" width="${bw}" height="${bb - bt}" fill="${st}"/><rect x="${bR - 12}" y="${bt}" width="12" height="${bb - bt}" fill="#000" opacity=".07"/>`;
    [[bL + 7, 14], [bL + 25, 14]].forEach(([ox, ow]) => {
      g += `<path d="M${ox},${bb - 6} L${ox},${bt + 18} Q${ox + ow / 2},${bt + 6} ${ox + ow},${bt + 18} L${ox + ow},${bb - 6}Z" fill="${NIGHT ? "#e8a850" : T("#3a3440")}"/>`;
      for (let j = 0; j < 4; j++) g += `<rect x="${ox}" y="${bt + 20 + j * 6}" width="${ow}" height="2" fill="${T("#c8c0b4")}" opacity=".7"/>`; });
    if (NIGHT) g += `<circle cx="${x}" cy="${bt + 25}" r="40" fill="url(#xrGlow)" opacity=".5"/>`;
    g += `<rect x="${bL - 4}" y="${bt - 5}" width="${bw + 8}" height="6" fill="${stS}"/><path d="${blobP(x, bt - 6, bw * .56, 3.6, 9)}" fill="${SN[0]}"/>`;
    // spire: lit left face, shaded right face, snow streaks on the lit face
    const sb = bt - 4, sp = sb - 132, sx2 = x + 2;
    g += `<path d="${poly([[x - bw / 2 + 2, sb], [sx2, sp], [x + 2, sb]])}" fill="${SN[1]}"/><path d="${poly([[x + 2, sb], [sx2, sp], [x + bw / 2 - 2, sb]])}" fill="${SN[3]}"/>`;
    g += `<path d="${poly([[x - bw / 2 - 5, sb], [sx2, sp], [x - bw / 2 + 4, sb]])}" fill="${stD}" opacity=".9"/>`;
    for (let j = 0; j < 7; j++) { const t = .15 + j * .11, yy = sb + (sp - sb) * t, half = (bw / 2) * (1 - t);
      g += `<path d="M${F(x - half + 2)},${F(yy)} q${F(half * .5)},${F(-2)} ${F(half)},${F(1)}" stroke="${SN[0]}" stroke-width="1.6" fill="none" opacity=".8"/>`; }
    g += `<circle cx="${sx2}" cy="${sp - 3}" r="3" fill="${NIGHT ? "#d8b860" : "#e8c860"}"/><path d="M${sx2},${sp - 6} v-16 M${sx2 - 5},${sp - 15} h10" stroke="${NIGHT ? "#c8a858" : "#c8a040"}" stroke-width="2"/>`;
    // the church's garland of lights along its gable
    g += bulbs([[xL - 7, y - h + 7], [x - tw / 2 - 2, y - h - rh * (1 - (tw / 2 + 2) / (w / 2 + 7)) + 7]], 1, 0, false) + bulbs([[x + tw / 2 + 2, y - h - rh * (1 - (tw / 2 + 2) / (w / 2 + 7)) + 7], [xR + 7, y - h + 7]], 1, 0, false);
    return g;
  }

  /* the town square: trodden snow, lamps, the decorated tree */
  function square() {
    let g = `<path d="${blobP(1300, 590, 420, 44, 12)}" fill="${SN[2]}" opacity=".45" filter="url(#xrSnowy)"/>`;
    for (let k = 0; k < 40; k++) { const x = 940 + r() * 700, y = 560 + r() * 60; g += `<path d="M${F(x)},${F(y)} q${F(8 + r() * 10)},${F(-2)} ${F(18 + r() * 20)},${F(r() * 3)}" stroke="${SN[3]}" stroke-width="1.2" fill="none" opacity=".25"/>`; }
    const tx = 1050, ty = 612, th = 250;
    if (NIGHT) g += `<circle cx="${tx}" cy="${ty - th * .45}" r="190" fill="url(#xrGlow)" opacity=".45"/>`;
    g += `<ellipse cx="${tx + 30}" cy="${ty + 4}" rx="110" ry="12" fill="${SN[4]}" opacity=".35"/>`;
    g += `<g filter="url(#xrLeafyS)">${conifer(tx, ty, th, { lx: LX, trunk: T("#4a3628"), dark: T("#173a2c"), mid: T("#24543e"), lit: T("#3c7a52"), snow: [SN[0], SN[2]] })}</g>`;
    // garland of lights spiralling down, plus ornaments
    for (let j = 0; j < 5; j++) { const yA = ty - th * (.82 - j * .16), yB = yA + th * .1, wA = th * .3 * (1 - (ty - yA) / th * .95) * .9, wB = th * .3 * (1 - (ty - yB) / th * .95) * .95;
      const pts = []; for (let t = 0; t <= 1.001; t += .1) pts.push([tx - wA + (wA + wB) * t, yA + (yB - yA) * t + Math.sin(t * Math.PI) * 6]);
      g += bulbs(pts, 1.25, 0, false); }
    for (let k = 0; k < 34; k++) { const t = .12 + r() * .8, yy = ty - th * (1 - t) * .95 - 10, half = th * .26 * t, x = tx + (r() * 2 - 1) * half * .85, c = T(["#d8242a", "#e8b830", "#3a7ad8", "#c8c8d8", "#d84aa0"][k % 5]);
      g += `<circle cx="${F(x)}" cy="${F(yy)}" r="3.4" fill="${c}"/><circle cx="${F(x - 1.1)}" cy="${F(yy - 1.1)}" r="1.1" fill="#ffffff" opacity=".7"/>`; }
    // star
    const sy = ty - th - 8, star = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, R = i % 2 ? 6 : 14; return [tx + Math.cos(a) * R, sy + Math.sin(a) * R]; });
    if (NIGHT) g += `<circle cx="${tx}" cy="${sy}" r="46" fill="url(#xrGlow)"/>`;
    g += `<path d="${poly(star)}" fill="${NIGHT ? "#ffe680" : "#f2c640"}" stroke="${NIGHT ? "#fff4c0" : "#c89a28"}" stroke-width="1.2"/>`;
    // gift boxes under it
    [[tx - 34, ty + 2, 14, "#c8242a", "#f2d050"], [tx - 16, ty + 6, 11, "#2a6ac8", "#f0f0f0"], [tx + 30, ty + 4, 13, "#2a8a4a", "#d8242a"], [tx + 48, ty + 7, 9, "#e8b830", "#c8242a"]].forEach(([x, y, z, c, rb]) => {
      g += `<rect x="${x - z / 2}" y="${y - z}" width="${z}" height="${z}" fill="${T(c)}"/><rect x="${x + z * .15}" y="${y - z}" width="${z * .35}" height="${z}" fill="#000" opacity=".2"/><path d="M${x},${y - z} v${z} M${x - z / 2},${y - z / 2} h${z}" stroke="${T(rb)}" stroke-width="2"/><path d="${blobP(x, y - z - 1, z * .55, 2, 6)}" fill="${SN[0]}"/>`; });
    g += lamp(960, 600, 1.05) + lamp(1420, 604, 1) + lamp(1220, 586, .9);
    return g;
  }

  /* smoke from the chimneys, drifting right */
  let sm = `<g class="smoke" filter="url(#xrSmoke)">`;
  smoke.forEach(([x, y, k, hz]) => { for (let j = 0; j < 6; j++) { const t = j / 5;
    sm += `<circle cx="${F(x + j * 6 * k + Math.sin(j * 1.3) * 3 * k + t * t * 22 * k)}" cy="${F(y - j * 10 * k)}" r="${F((3 + j * 2.4) * k)}" fill="${mix(NIGHT ? "#8e9cc0" : "#f4f4f6", HZ, hz)}" opacity="${F((.55 - t * .45) * (NIGHT ? .7 : 1))}"/>`; } });
  s += sm + `</g>`;

  /* foreground: a snowy bank with firs framing the bottom corners */
  [[60, 724, 210], [190, 730, 150], [2490, 726, 230], [2360, 734, 160]].forEach(([x, y, h]) => s += `<g filter="url(#xrLeafyS)">${tree(x, y, h, 0)}</g>`);

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#xrLight)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#xrPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
