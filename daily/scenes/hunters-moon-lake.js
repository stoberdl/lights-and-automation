/* Hunter's Moon Lake: a huge orange full moon rising behind far hills over a
   still lake at night. Wooded shores with a cabin and dock on the left, a
   rocky pine point on the right, reeds and rocks in front. One light source:
   the low moon, so everything is rim-lit on the side facing it.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".   */
function huntersMoonLakeArt(opts = {}) {
  const r = rng(opts.seed || 1026);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const MX = 1300, MY = 318, MR = 150, WY = 470;           // moon, waterline of the far shore
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

  /* faceted mountains: lit face toward the light, shaded face away, sub-facets */
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
      m += `<path d="${line(litL ? seg[i - 1] : seg[i])}" stroke="${o.rim}" stroke-width="2" fill="none" opacity=".55"/>`;
    }
    return m;
  };

  /* tiered conifer: jagged branch layers, lit + shaded side, visible trunk */
  const conifer = (x, y, h, o) => {
    const s = o.lx < x ? -1 : 1; let g = "";
    const tw = Math.max(1.5, h * .04), th = h * .13;
    g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .6)},${F(y - th * 2.2)} L${F(x + tw * .6)},${F(y - th * 2.2)} L${F(x + tw)},${F(y)}Z" fill="${o.trunk}"/>`;
    g += `<path d="M${F(x + s * tw)},${F(y)} L${F(x + s * tw * .6)},${F(y - th * 2.2)} L${F(x)},${F(y - th * 2.2)} L${F(x)},${F(y)}Z" fill="${mix(o.trunk, o.hl, .35)}"/>`;
    const tiers = Math.max(3, Math.min(13, Math.round(h / 21))), top = y - h, bot = y - th, span = bot - top;
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - span * u * .9, ya = t === tiers - 1 ? top : Math.max(top, yb - span * (.3 - .1 * u)), w = h * .3 * (1 - u * .8) * (.85 + r() * .3);
      const A = [x + (r() - .5) * w * .08, ya], th2 = yb - ya, m = Math.max(2, Math.round(w / 7)) * 2, edge = [];
      for (let k = 0; k <= m; k++) { const px = x - w + 2 * w * k / m, d = Math.abs(px - x) / w;
        edge.push([px + (r() - .5) * w * .05, yb + (k % 2 ? -th2 * (.1 + r() * .08) : d * th2 * .16 + r() * 2)]); }
      const Lm = [x - w * .3, ya + th2 * .55], Rm = [x + w * .3, ya + th2 * .55];
      if (t > 0 && h > 40) g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mix(o.dark, "#000", .4)}" opacity=".6" transform="translate(${F(-s * th2 * .06)},${F(th2 * .12)})"/>`;
      g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${o.mid}"/>`;
      const shade = s < 0 ? [A, [x, yb - 2], ...edge.filter(p => p[0] > x), Rm] : [A, Lm, ...edge.filter(p => p[0] < x), [x, yb - 2]];
      g += `<path d="${poly(shade)}" fill="${o.dark}"/>`;
      const le = edge.filter(p => (p[0] - x) * s > w * .5); if (s > 0) le.reverse();
      g += `<path d="${poly([A, s < 0 ? Lm : Rm, ...le, [x + s * w * .38, yb - th2 * .3]])}" fill="${o.lit}"/>`;
      if (o.rim) g += `<path d="${line([A, s < 0 ? Lm : Rm, ...le.slice(0, 2)])}" stroke="${o.rim}" stroke-width="${F(Math.max(1, h / 90))}" fill="none" opacity=".75"/>`;
      for (let k = 0; k < w / 3; k++) { const py = ya + th2 * (.35 + r() * .6), lim = w * (py - ya) / th2, px = x + (r() - .5) * 2 * lim * .9, sd = px < x ? -1 : 1;
        g += `<path d="M${F(px)},${F(py)} l${F(sd * 3.5)},${F(4 + r() * 3)}" stroke="${sd === s ? mix(o.lit, o.hl, .3) : mix(o.dark, "#000", .3)}" stroke-width="1.2" opacity=".7"/>`; }
    }
    return g;
  };

  /* deciduous tree from many small leaf clumps, lit from the moon side */
  const RAMP = ["#1a1624", "#2a2030", "#40262c", "#5c302a", "#7c3e28", "#a0522a", "#c86e32", "#eb9a4a"];
  const leafTree = (x, y, h, n) => {
    const cx = x, cy = y - h * .62, rx = h * .36, ry = h * .34, side = MX < x ? -1 : 1; let g = "";
    g += `<path d="M${F(x - h * .035)},${F(y)} C${F(x - h * .02)},${F(y - h * .3)} ${F(x - h * .03)},${F(y - h * .45)} ${F(x)},${F(y - h * .6)} C${F(x + h * .03)},${F(y - h * .45)} ${F(x + h * .02)},${F(y - h * .3)} ${F(x + h * .035)},${F(y)}Z" fill="#1c1418"/>`;
    const cl = [];
    for (let i = 0; i < n * 3 && cl.length < n; i++) { const px = cx + (r() * 2 - 1) * rx, py = cy + (r() * 2 - 1) * ry;
      if (((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 > 1) continue;
      const nx = (px - cx) / rx, ny = (py - cy) / ry, lit = (nx * side * .7 - ny * .3) * .5 + .5, edge = Math.min(1, Math.hypot(nx, ny));
      cl.push([px, py, Math.max(0, Math.min(.999, lit * .7 + edge * .2 * lit + (r() - .5) * .25))]); }
    cl.sort((a, b) => a[2] - b[2]);
    g += `<path d="${blobP(cx, cy, rx * .95, ry * .9, 9)}" fill="${RAMP[1]}"/>`;
    cl.forEach(([px, py, v]) => g += `<path d="${blobP(px, py, h * .08 + r() * h * .04, h * .065 + r() * h * .03, 6)}" fill="${RAMP[Math.floor(v * RAMP.length)]}"/>`);
    return g;
  };

  const SKY_H = "#b8683e", HAZE = "#8a5060";
  let s = `<defs id="hmdefs">
    <linearGradient id="hmSky" x1="0" y1="0" x2="0" y2="470" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0b1230"/><stop offset=".42" stop-color="#1c2854"/><stop offset=".75" stop-color="#4a3a62"/><stop offset=".92" stop-color="#8a5260"/><stop offset="1" stop-color="${SKY_H}"/></linearGradient>
    <radialGradient id="hmMoonG" cx="${MX}" cy="${MY}" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb060" stop-opacity=".8"/><stop offset=".2" stop-color="#f08a48" stop-opacity=".4"/><stop offset=".5" stop-color="#b85a50" stop-opacity=".12"/><stop offset="1" stop-color="#b85a50" stop-opacity="0"/></radialGradient>
    <radialGradient id="hmMoonD" cx=".44" cy=".4" r=".64"><stop offset="0" stop-color="#ffd690"/><stop offset=".55" stop-color="#fbb05e"/><stop offset=".86" stop-color="#ea8a3c"/><stop offset="1" stop-color="#c8622a"/></radialGradient>
    <linearGradient id="hmMoonHaze" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#a0402a" stop-opacity="0"/><stop offset="1" stop-color="#8a2e22" stop-opacity=".45"/></linearGradient>
    <radialGradient id="hmGlow"><stop offset="0" stop-color="#ffc060" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <linearGradient id="hmHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HAZE}" stop-opacity="0"/><stop offset=".6" stop-color="${HAZE}" stop-opacity=".55"/><stop offset="1" stop-color="${HAZE}" stop-opacity="0"/></linearGradient>
    <linearGradient id="hmWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5a3e5a"/><stop offset=".25" stop-color="#2e2c4c"/><stop offset="1" stop-color="#0e1428"/></linearGradient>
    <linearGradient id="hmShore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2632"/><stop offset="1" stop-color="#16141e"/></linearGradient>
    <radialGradient id="hmPane" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#fff0a8"/><stop offset=".6" stop-color="#ffc35a"/><stop offset="1" stop-color="#e8862a"/></radialGradient>
    <clipPath id="hmClipMoon"><rect x="0" y="0" width="${W}" height="${WY}"/></clipPath>
    <clipPath id="hmRc540"><rect x="0" y="540" width="${W}" height="${H - 540}"/></clipPath><clipPath id="hmRc548"><rect x="0" y="548" width="${W}" height="${H - 548}"/></clipPath>
    <filter id="hmLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hmLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hmCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="hmRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.2"/></filter>
    <filter id="hmPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="hmSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="hmMaria" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hmSky)"/>`;

  /* stars, thinning toward the moon and the horizon */
  for (let i = 0; i < 380; i++) { const x = r() * W, y = Math.pow(r(), 1.5) * 380, d = Math.hypot(x - MX, y - MY);
    if (d < 360 && r() < .9) continue;
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${r() < .08 ? 1.7 : .6 + r() * .6}" fill="${r() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.2 + r() * .6 * (1 - y / 460))}"/>`; }
  /* the Hunter's Moon: warm glow, disc with limb darkening, maria, craters, low haze bands */
  s += `<rect width="${W}" height="${H}" fill="url(#hmMoonG)"/>`;
  s += `<g clip-path="url(#hmClipMoon)"><circle cx="${MX}" cy="${MY}" r="${MR + 16}" fill="#ffb060" opacity=".18"/><circle cx="${MX}" cy="${MY}" r="${MR}" fill="url(#hmMoonD)"/>`;
  s += `<g filter="url(#hmMaria)">`;
  [[-50, -52, 44, 30], [22, -64, 38, 26], [44, -12, 54, 34], [-20, 8, 42, 30], [-62, 30, 30, 26], [34, 50, 26, 30], [-4, 72, 20, 16], [70, 26, 20, 26], [-86, -8, 22, 20]].forEach(([dx, dy, rx, ry]) => {
    s += `<path d="${blobP(MX + dx, MY + dy, rx, ry, 9)}" fill="#c0642e" opacity=".32"/>`;
    s += `<path d="${blobP(MX + dx + 4, MY + dy + 3, rx * .6, ry * .55, 7)}" fill="#a8522a" opacity=".22"/>`; });
  s += `</g>`;
  for (let k = 0; k < 26; k++) { const a = r() * 6.28, d = Math.sqrt(r()) * MR * .88, x = MX + Math.cos(a) * d, y = MY + Math.sin(a) * d, cr = 1.5 + r() * (k < 4 ? 8 : 3.5);
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(cr)}" fill="#b45a2c" opacity=".22"/><path d="M${F(x - cr)},${F(y + cr * .2)} A${F(cr)},${F(cr)} 0 0 0 ${F(x + cr)},${F(y + cr * .2)}" stroke="#ffe0a8" stroke-width="1" fill="none" opacity=".35"/>`; }
  { const cx = MX - 44, cy = MY + 58; s += `<circle cx="${cx}" cy="${cy}" r="9" fill="#ffe6b0" opacity=".6"/>`;
    for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28 + r() * .3; s += `<path d="M${cx},${cy} L${F(cx + Math.cos(a) * 70)},${F(cy + Math.sin(a) * 70)}" stroke="#ffe0a0" stroke-width="2" opacity=".15"/>`; } }
  s += `<circle cx="${MX}" cy="${MY}" r="${MR}" fill="url(#hmMoonHaze)"/>`;
  for (let k = 0; k < 5; k++) s += `<rect x="${MX - MR}" y="${MY + 40 + k * 22}" width="${MR * 2}" height="${4 + k * 2}" fill="#8a3a2a" opacity="${F(.06 + k * .03)}" filter="url(#hmSoft)"/>`;
  s += `<circle cx="${MX}" cy="${MY}" r="${MR - 1}" fill="none" stroke="#ffe2a8" stroke-width="2.5" opacity=".5"/></g>`;
  s += `<g opacity=".045" filter="url(#hmSoft)">`;
  for (let k = 0; k < 7; k++) { const a = -2.75 + k * .36, L = 700;
    s += `<path d="M${MX},${MY} L${F(MX + Math.cos(a - .03) * L)},${F(MY + Math.sin(a - .03) * L)} L${F(MX + Math.cos(a + .03) * L)},${F(MY + Math.sin(a + .03) * L)}Z" fill="#ffd8a0"/>`; }
  s += `</g>`;
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: long thin strata, dark body, undersides lit warm by the low moon */
  const cloud = (x, y, w, cls, warm) => {
    let c = `<g class="${cls}"><g filter="url(#hmCloudy)">`;
    const lobes = [], lean = x < MX ? 1 : -1, lit = mix("#6a5a8a", "#f0a060", warm), hi = mix("#a8a0c8", "#ffd49a", warm);
    for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .045 * (.6 + r() * .7), w * (.05 + r() * .045)]); }
    c += `<ellipse cx="${x}" cy="${y}" rx="${w * .55}" ry="${w * .03}" fill="#242446"/>`;
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .42)}" fill="#34325a"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly - R * .1)}" rx="${F(R * 1.1)}" ry="${F(R * .3)}" fill="#46426c"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly + R * .22)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="${lit}"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .5)}" cy="${F(ly + R * .28)}" rx="${F(R * .45)}" ry="${F(R * .08)}" fill="${hi}" opacity=".8"/>`);
    return c + `</g></g>`;
  };
  s += cloud(560, 150, 700, "drift1", .2) + cloud(2000, 130, 680, "drift2", .2) + cloud(1780, 250, 420, "drift3", .6) + cloud(820, 262, 440, "drift2", .6) + cloud(1340, 214, 380, "drift3", .85);
  /* geese crossing the moon */
  s += `<g class="birds" fill="none" stroke="#1a1426" stroke-width="2.4" stroke-linecap="round">`;
  [[1180, 300, 1], [1208, 290, .9], [1236, 280, .9], [1264, 271, .85], [1206, 314, .9], [1232, 326, .85], [1258, 338, .8]].forEach(([x, y, k]) =>
    s += `<path d="M${F(x - 10 * k)},${F(y - 2 * k)} q${F(5 * k)},${F(-5 * k)} ${F(10 * k)},${F(2 * k)} q${F(5 * k)},${F(-7 * k)} ${F(10 * k)},${F(-4 * k)}"/><circle cx="${F(x)}" cy="${F(y)}" r="${F(1.6 * k)}" fill="#1a1426"/>`);
  s += `</g>`;
  const cloudPart = s; s = DEFS;

  /* far shore: mountains, haze, a band of tiny trees at the waterline */
  let far = "";
  far += mountains({ base: 440, hi: 348, lo: 398, step: 150, lx: MX, lit: "#6a5478", mid: "#57486c", dark: "#3e3658", rim: "#f0a870" });
  far += `<rect x="0" y="360" width="${W}" height="110" fill="url(#hmHaze)" opacity=".85"/>`;
  far += mountains({ base: 462, hi: 388, lo: 428, step: 95, lx: MX, lit: "#4a3c5c", mid: "#3a3250", dark: "#2a2640", rim: "#e0925e" });
  far += `<rect x="0" y="420" width="${W}" height="60" fill="url(#hmHaze)" opacity=".7"/>`;
  const fb = wave([1, 3, 2], [260, 110, 40], [5, 3, 1.5]);
  far += `<path d="${ridgePath(x => WY - 6 + fb(x), WY + 2)}" fill="#241e34"/>`;
  let fTrees = "";
  const ft = []; for (let x = -10; x < W + 10; x += 5 + r() * 6) ft.push([x, WY - 2 + r() * 3, 8 + r() * 12]);
  ft.forEach(([x, y, h]) => { if (Math.abs(x - MX) < 170 && r() < .7) h *= .6;
    if (r() < .55) fTrees += conifer(x, y, h * 1.4, { lx: MX, trunk: "#1a1622", hl: "#6a4a5a", dark: "#1c1a2c", mid: "#26243a", lit: "#3a3048", rim: Math.abs(x - MX) < 260 ? "#e89058" : null });
    else fTrees += `<path d="${blobP(x, y - h * .5, h * .5, h * .45, 7)}" fill="#282234"/><path d="${blobP(x + (MX < x ? -1 : 1) * h * .18, y - h * .65, h * .28, h * .2, 6)}" fill="${Math.abs(x - MX) < 260 ? "#7a4a44" : "#3a3048"}"/>`; });
  far += `<g filter="url(#hmLeafyS)">${fTrees}</g>`;
  s += far;

  /* the lake */
  s += `<rect x="0" y="${WY - 2}" width="${W}" height="${H - WY + 2}" fill="url(#hmWater)"/>`;
  s += `<g transform="matrix(1,0,0,-1,0,${WY * 2})" opacity=".45" filter="url(#hmRipple)">${far}</g>`;
  s += `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="#141a34" opacity=".35"/>`;
  s += `<ellipse cx="${MX}" cy="${WY + 30}" rx="420" ry="50" fill="url(#hmGlow)" opacity=".45"/>`;
  /* moon path: broken warm dashes widening toward us */
  s += `<g filter="url(#hmRipple)">`;
  for (let y = WY + 3; y < H; y += 3.2 + (y - WY) * .02) { const t = (y - WY) / (H - WY), w = 60 + t * 300, n = 2 + Math.floor(t * 7);
    for (let k = 0; k < n; k++) { const off = (r() * 2 - 1) * w * Math.pow(r(), .6), L = 12 + r() * (40 + t * 90), c = ["#ffe0a0", "#ffc070", "#f59a4a", "#d8703a"][Math.floor(Math.min(.99, Math.abs(off) / w + r() * .3) * 4)];
      s += `<rect x="${F(MX + off - L / 2)}" y="${F(y)}" width="${F(L)}" height="${F(1.4 + t * 2.4)}" rx="1" fill="${c}" opacity="${F((.85 - Math.abs(off) / w * .6) * (1 - t * .35))}"/>`; } }
  s += `</g>`;
  for (let k = 0; k < 140; k++) { const y = WY + 6 + Math.pow(r(), .8) * (H - WY - 6), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(30 + r() * 140 * (.4 + t))}" height="${F(1 + t * 1.5)}" rx="1" fill="${r() < .5 ? "#8a86b8" : "#e0a070"}" opacity="${F(.06 + r() * .12)}"/>`; }

  /* a shore with its reflection: land, trees, props; reflected about its waterline */
  const shore = (ys, build) => { const g = build();
    return `<g clip-path="url(#hmRc${ys})"><g transform="matrix(1,0,0,-1,0,${ys * 2})" opacity=".42" filter="url(#hmRipple)">${g}</g><rect x="0" y="${ys}" width="${W}" height="${H - ys}" fill="#141a34" opacity=".3"/></g>${g}`; };

  /* left shore: wooded bank, cabin, dock, rowboat */
  const lsh = wave([2, 5, 1], [230, 90, 40], [8, 4, 2]);
  const leftBank = x => x > 980 ? 560 : 500 + lsh(x) + Math.pow(Math.max(0, x - 600) / 380, 2) * 40;
  s += shore(540, () => {
    let g = `<path d="M-10,540 L-10,${F(leftBank(0))} ${Array.from({ length: 62 }, (_, i) => { const x = i * 16; return `L${x},${F(Math.min(540, leftBank(x)))}`; }).join(" ")} L1000,540Z" fill="url(#hmShore)"/>`;
    g += `<path d="${line(Array.from({ length: 62 }, (_, i) => [i * 16, Math.min(540, leftBank(i * 16)) + 1]))}" stroke="#c07a52" stroke-width="2" fill="none" opacity=".45"/>`;
    const trees = [];
    for (let x = -20; x < 880; x += 16 + r() * 22) { if (x > 610 && x < 770) continue; trees.push([x, Math.min(540, leftBank(x)) + 4 + r() * 10, 60 + r() * 90 * (1 - x / 1400), r() < .6]); }
    trees.sort((a, b) => a[1] - b[1]);
    let tg = "";
    trees.forEach(([x, y, h, con]) => { tg += con ? conifer(x, y, h, { lx: MX, trunk: "#1e1616", hl: "#8a5a44", dark: "#141626", mid: "#1e2434", lit: "#2e3444", rim: "#e0925e" }) : leafTree(x, y, h * .8, 34); });
    g += `<g filter="url(#hmLeafyS)">${tg}</g>`;
    // log cabin
    const cx = 690, cy = 532;
    g += `<path d="${poly([[cx - 58, cy], [cx - 58, cy - 52], [cx + 58, cy - 52], [cx + 58, cy]])}" fill="#3a2a26"/>`;
    for (let k = 0; k < 8; k++) g += `<rect x="${cx - 60}" y="${cy - 52 + k * 6.5}" width="120" height="5.5" rx="2.7" fill="${k % 2 ? "#4a3430" : "#54403a"}"/><rect x="${cx + 20}" y="${cy - 52 + k * 6.5}" width="40" height="5.5" rx="2.7" fill="#6a4a3a"/>`;
    g += `<path d="${poly([[cx - 72, cy - 50], [cx - 10, cy - 96], [cx + 50, cy - 96], [cx + 74, cy - 50]])}" fill="#221a20"/><path d="${poly([[cx + 30, cy - 96], [cx + 50, cy - 96], [cx + 74, cy - 50], [cx + 50, cy - 50]])}" fill="#5a3a34"/>`;
    g += `<path d="M${cx - 72},${cy - 50} L${cx - 10},${cy - 96} L${cx + 50},${cy - 96} L${cx + 74},${cy - 50}" stroke="#d08a58" stroke-width="1.6" fill="none" opacity=".5"/>`;
    g += `<rect x="${cx - 40}" y="${cy - 118}" width="14" height="36" fill="#4a3834"/><rect x="${cx - 30}" y="${cy - 118}" width="4" height="36" fill="#8a5a44"/><rect x="${cx - 43}" y="${cy - 122}" width="20" height="5" fill="#2a1e1e"/>`;
    g += `<circle cx="${cx - 18}" cy="${cy - 26}" r="44" fill="url(#hmGlow)" opacity=".55"/><rect x="${cx - 32}" y="${cy - 36}" width="24" height="18" fill="url(#hmPane)"/><path d="M${cx - 20},${cy - 36} v18 M${cx - 32},${cy - 27} h24" stroke="#2a1a14" stroke-width="2"/>`;
    g += `<rect x="${cx + 8}" y="${cy - 40}" width="20" height="40" fill="#241816"/><rect x="${cx + 12}" y="${cy - 36}" width="12" height="10" fill="url(#hmPane)" opacity=".8"/>`;
    // dock and rowboat
    g += `<rect x="${cx + 40}" y="${cy + 4}" width="170" height="7" fill="#4a3a34"/><rect x="${cx + 40}" y="${cy + 4}" width="170" height="2" fill="#c08058" opacity=".6"/>`;
    for (let k = 0; k < 5; k++) g += `<rect x="${cx + 50 + k * 38}" y="${cy + 8}" width="5" height="16" fill="#2a2022"/>`;
    for (let k = 0; k < 17; k++) g += `<path d="M${cx + 40 + k * 10},${cy + 4} v7" stroke="#2a2022" stroke-width="1"/>`;
    g += `<path d="M${cx + 120},${cy + 26} Q${cx + 118},${cy + 38} ${cx + 150},${cy + 38} L${cx + 210},${cy + 36} Q${cx + 226},${cy + 30} ${cx + 228},${cy + 22} Z" fill="#6a3a2a"/><path d="M${cx + 120},${cy + 26} L${cx + 228},${cy + 22}" stroke="#e0a070" stroke-width="2" opacity=".7"/><path d="M${cx + 128},${cy + 30} L${cx + 220},${cy + 27}" stroke="#2a1a18" stroke-width="3"/>`;
    g += `<path d="M${cx + 205},${cy + 11} Q${cx + 215},${cy + 20} ${cx + 222},${cy + 23}" stroke="#1a1414" stroke-width="1" fill="none"/>`;
    return g;
  });
  s += `<g class="smoke" opacity=".5">${[0, 1, 2, 3, 4].map(k => `<circle cx="${F(657 + k * 8)}" cy="${F(404 - k * 20)}" r="${6 + k * 4}" fill="#b8a8b8" opacity="${F(.5 - k * .09)}"/>`).join("")}</g>`;

  /* right shore: rocky point with pines, one tall pine near the edge */
  const rsh = wave([4, 1, 3], [200, 80, 35], [9, 4, 2]);
  const rightBank = x => x < 1760 ? 560 : 512 + rsh(x) + Math.pow(Math.max(0, 2060 - x) / 300, 2) * 36;
  s += shore(548, () => {
    let g = `<path d="M1740,548 ${Array.from({ length: 52 }, (_, i) => { const x = 1744 + i * 16; return `L${x},${F(Math.min(548, rightBank(x)))}`; }).join(" ")} L2580,548Z" fill="url(#hmShore)"/>`;
    // rocks at the waterline, rim-lit on the moon side
    for (let k = 0; k < 14; k++) { const x = 1780 + r() * 760, y = 548 - r() * 6, R = 10 + r() * 22;
      g += `<path d="${blobP(x, y - R * .3, R, R * .55, 7)}" fill="#1e1c28"/><path d="${blobP(x - R * .25, y - R * .5, R * .6, R * .3, 6)}" fill="#3a3444"/><path d="M${F(x - R * .9)},${F(y - R * .45)} q${F(R * .3)},${F(-R * .35)} ${F(R * .8)},${F(-R * .4)}" stroke="#d08a58" stroke-width="1.6" fill="none" opacity=".6"/>`; }
    const trees = [];
    for (let x = 1790; x < 2580; x += 18 + r() * 24) trees.push([x, Math.min(548, rightBank(x)) + 3 + r() * 8, 60 + r() * 100 * ((x - 1700) / 900), r() < .7]);
    trees.sort((a, b) => a[1] - b[1]);
    let tg = "";
    trees.forEach(([x, y, h, con]) => { tg += con ? conifer(x, y, h, { lx: MX, trunk: "#1e1616", hl: "#8a5a44", dark: "#141626", mid: "#1e2434", lit: "#2e3444", rim: "#e0925e" }) : leafTree(x, y, h * .8, 34); });
    tg += conifer(2260, 545, 270, { lx: MX, trunk: "#2a1c18", hl: "#a06a4a", dark: "#10141e", mid: "#1c2432", lit: "#2e3a48", rim: "#f0a060" });
    g += `<g filter="url(#hmLeafyS)">${tg}</g>`;
    return g;
  });

  /* a drifting canoe in the moon path */
  s += `<ellipse cx="1480" cy="608" rx="90" ry="7" fill="#0a0e1c" opacity=".5"/><path d="M1400,598 Q1420,612 1480,612 Q1540,612 1562,596 Q1540,604 1480,604 Q1420,604 1400,598Z" fill="#2a1a18"/><path d="M1400,598 Q1440,601 1480,602 Q1530,602 1562,596" stroke="#ffc070" stroke-width="2" fill="none" opacity=".85"/><path d="M1452,603 l-4,-6 M1506,603 l4,-6" stroke="#1a1010" stroke-width="2"/>`;

  /* foreground: rocks, reeds and cattails */
  const rock = (x, y, R) => { const side = MX < x ? -1 : 1;
    return `<path d="${blobP(x, y, R, R * .55, 8)}" fill="#161822"/><path d="${blobP(x + side * R * .2, y - R * .15, R * .7, R * .38, 7)}" fill="#262836"/><path d="${blobP(x + side * R * .4, y - R * .3, R * .38, R * .2, 6)}" fill="#44404e"/><path d="M${F(x + side * R * .95)},${F(y - R * .1)} q${F(-side * R * .3)},${F(-R * .45)} ${F(-side * R * .9)},${F(-R * .52)}" stroke="#d88a58" stroke-width="2" fill="none" opacity=".55"/>`; };
  s += rock(90, 700, 110) + rock(250, 712, 70) + rock(2470, 700, 120) + rock(2320, 716, 60) + rock(560, 690, 40) + rock(1960, 694, 44);
  const reeds = (x0, x1, yb) => { let g = "";
    for (let x = x0; x < x1; x += 3 + r() * 6) { const y = yb + r() * 20, h = 30 + r() * 70, lean = (r() - .5) * 16, lit = r() < .3;
      g += `<path d="M${F(x)},${F(y)} q${F(lean * .3)},${F(-h * .5)} ${F(lean)},${F(-h)}" stroke="${lit ? "#8a5a3a" : "#1a1c1a"}" stroke-width="${F(1.4 + r())}" fill="none"/>`;
      if (r() < .18) g += `<rect x="${F(x + lean * .85 - 3)}" y="${F(y - h * .92)}" width="6" height="16" rx="3" fill="#3a2418"/><rect x="${F(x + lean * .85 + (MX < x ? -3 : 1))}" y="${F(y - h * .92 + 2)}" width="2" height="12" rx="1" fill="#c07a4a" opacity=".7"/>`; }
    return g; };
  s += reeds(0, 420, 640) + reeds(2140, 2560, 640) + reeds(600, 760, 668) + reeds(1880, 2020, 664);

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#hmMoonG)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#hmPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
