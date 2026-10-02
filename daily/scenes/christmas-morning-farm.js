/* Christmas Morning Farm: a red barn and a white farmhouse in deep fresh snow
   at sunrise. The sun clears the low hills on the left, so every wall facing
   left glows warm and every shadow runs long and blue to the right. A big
   wreath on the barn gable, a cupola with a weathervane, a snowman and a sled
   in the yard, cardinals on a snowy split-rail fence, tiered firs with snow on
   every tier, a bare oak by the fence, woodland and rolling hills behind.
   opts.time === "night": the same farm on Christmas night under a gibbous
   moon from the same side: stars, a lantern over the barn doors, lit windows,
   coloured lights along the porch.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".     */
function christmasMorningFarmArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1225;
  const r = rng(seed), rs = rng(seed + 7);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = NIGHT ? 760 : 690, LY = NIGHT ? 150 : 384;
  const T = c => NIGHT ? mix(mix(c, "#6a7290", .35), "#0a1232", .56) : c;
  const HZ = NIGHT ? "#34427a" : "#f2cfc4";
  // snow: sun-lit, lit, mid, shade, deep shade
  const SN = NIGHT ? ["#c6d4f4", "#9eb0dc", "#7a8ec4", "#52669c", "#33426e"] : ["#fff4ea", "#fbe8e4", "#e2dcec", "#b8c2e2", "#94a2d0"];
  const SHADOW = NIGHT ? "#1e2a56" : "#8494cc";
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
  const add = (p, d, t = 1) => [p[0] + d[0] * t, p[1] + d[1] * t];

  const mountains = o => {
    const key = []; let x = -180, pk = false;
    while (x < W + 260) { key.push([x, pk ? o.hi + r() * (o.lo - o.hi) : 0, pk]); x += o.step * (.6 + r() * .8); pk = !pk; }
    key.forEach((k, i) => { if (k[2]) return; const n = [key[i - 1], key[i + 1]].filter(Boolean).map(p => p[1]);
      const low = n.length ? Math.max(...n) : o.lo; k[1] = low + (o.base - low) * (.25 + r() * .4); });
    const seg = [];
    for (let i = 0; i < key.length - 1; i++) { const [ax, ay] = key[i], [bx, by] = key[i + 1], a = [];
      for (let s = 0; s <= 5; s++) { const t = s / 5, j = s % 5 ? 1 : 0; a.push([ax + (bx - ax) * t + j * (r() - .5) * 10, ay + (by - ay) * t + j * (r() - .5) * o.step * .04]); }
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
    g += `<path d="M${F(x + s * tw)},${F(y)} L${F(x + s * tw * .6)},${F(y - th * 2.2)} L${F(x)},${F(y - th * 2.2)} L${F(x)},${F(y)}Z" fill="${mix(o.trunk, "#ffd0a0", .3)}"/>`;
    const tiers = Math.max(3, Math.min(13, Math.round(h / 21))), top = y - h, bot = y - th, span = bot - top;
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - span * u * .9, ya = t === tiers - 1 ? top : Math.max(top, yb - span * (.3 - .1 * u)), w = h * .3 * (1 - u * .8) * (.85 + r() * .3);
      const A = [x + (r() - .5) * w * .08, ya], th2 = yb - ya, m = Math.max(2, Math.round(w / 7)) * 2, edge = [];
      for (let k = 0; k <= m; k++) { const px = x - w + 2 * w * k / m, d = Math.abs(px - x) / w;
        edge.push([px + (r() - .5) * w * .05, yb + (k % 2 ? -th2 * (.1 + r() * .08) : d * th2 * .16 + r() * 2)]); }
      const Lm = [x - w * .3, ya + th2 * .55], Rm = [x + w * .3, ya + th2 * .55];
      if (t > 0 && h > 40) g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mix(o.dark, "#000", .4)}" opacity=".55" transform="translate(${F(-s * th2 * .06)},${F(th2 * .12)})"/>`;
      g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${o.mid}"/>`;
      const shade = s < 0 ? [A, [x, yb - 2], ...edge.filter(p => p[0] > x), Rm] : [A, Lm, ...edge.filter(p => p[0] < x), [x, yb - 2]];
      g += `<path d="${poly(shade)}" fill="${o.dark}"/>`;
      const le = edge.filter(p => (p[0] - x) * s > w * .5); if (s > 0) le.reverse();
      g += `<path d="${poly([A, s < 0 ? Lm : Rm, ...le, [x + s * w * .38, yb - th2 * .3]])}" fill="${o.lit}"/>`;
      for (let k = 0; k < w / 3; k++) { const py = ya + th2 * (.35 + r() * .6), lim = w * (py - ya) / th2, px = x + (r() - .5) * 2 * lim * .9, sd = px < x ? -1 : 1;
        g += `<path d="M${F(px)},${F(py)} l${F(sd * 3.5)},${F(4 + r() * 3)}" stroke="${sd === s ? mix(o.lit, "#ffe0b0", .3) : mix(o.dark, "#000", .3)}" stroke-width="1.2" opacity=".6"/>`; }
      if (o.snow) {
        const up = edge.map(p => [x + (p[0] - x) * .88, p[1] - th2 * (.22 + r() * .12)]), dn = edge.map(p => [x + (p[0] - x) * .97, p[1] - th2 * .03]);
        g += `<path d="${poly([...up, ...dn.reverse()])}" fill="${o.snow[1]}"/>`;
        const half = up.filter(p => (p[0] - x) * s >= -w * .15), halfDn = edge.filter(p => (p[0] - x) * s >= -w * .15).map(p => [x + (p[0] - x) * .97, p[1] - th2 * .1]);
        if (half.length > 1) g += `<path d="${poly([...half, ...halfDn.reverse()])}" fill="${o.snow[0]}"/>`;
        if (t === tiers - 1) g += `<path d="${blobP(A[0], A[1] + th2 * .2, w * .35, th2 * .22, 6)}" fill="${o.snow[0]}"/>`;
      }
    }
    return g;
  };
  const FIR = NIGHT
    ? { trunk: "#1a1820", dark: "#0c1824", mid: "#142832", lit: "#223c48" }
    : { trunk: "#4a3226", dark: "#1a3436", mid: "#284c46", lit: "#4a6e54" };
  const fir = (x, y, h, hz = 0) => `<g filter="url(#xfLeafyS)">${conifer(x, y, h, { lx: LX, trunk: mix(FIR.trunk, HZ, hz), dark: mix(FIR.dark, HZ, hz), mid: mix(FIR.mid, HZ, hz), lit: mix(FIR.lit, HZ, hz), snow: [mix(SN[0], HZ, hz * .5), mix(SN[2], HZ, hz * .5)] })}</g>`;
  /* bare oak: recursive limbs, lit edge toward the sun, snow along the tops */
  const bareTree = (x, y, h, hz = 0) => {
    const bark = mix(T("#3a2c2a"), HZ, hz), lit = mix(T("#9a6a50"), HZ, hz), sn = mix(SN[0], HZ, hz * .5); let g = "", sg = "";
    const br = (bx, by, a, L, w, d) => {
      const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L, mx = (bx + ex) / 2 + (r() - .5) * L * .25, my = (by + ey) / 2 + (r() - .5) * L * .15;
      g += `<path d="M${F(bx)},${F(by)} Q${F(mx)},${F(my)} ${F(ex)},${F(ey)}" stroke="${bark}" stroke-width="${F(w)}" fill="none" stroke-linecap="round"/>`;
      if (w > 2) g += `<path d="M${F(bx - w * .3)},${F(by)} Q${F(mx - w * .3)},${F(my)} ${F(ex - w * .25)},${F(ey)}" stroke="${lit}" stroke-width="${F(w * .3)}" fill="none" stroke-linecap="round" opacity=".7"/>`;
      if (w > 1.5 && Math.abs(Math.sin(a)) < .8) sg += `<path d="M${F(bx)},${F(by - w * .5)} Q${F(mx)},${F(my - w * .6)} ${F(ex)},${F(ey - w * .4)}" stroke="${sn}" stroke-width="${F(Math.max(1, w * .45))}" fill="none" stroke-linecap="round"/>`;
      if (d >= 6 || w < .7) return;
      const n = d < 2 ? 3 : 2;
      for (let i = 0; i < n; i++) br(ex, ey, a + (i - (n - 1) / 2) * (.55 + r() * .3) + (r() - .5) * .3, L * (.68 + r() * .12), w * .64, d + 1);
    };
    g += `<path d="M${F(x - h * .05)},${F(y)} C${F(x - h * .03)},${F(y - h * .2)} ${F(x - h * .025)},${F(y - h * .32)} ${F(x - h * .015)},${F(y - h * .42)} L${F(x + h * .015)},${F(y - h * .42)} C${F(x + h * .025)},${F(y - h * .3)} ${F(x + h * .03)},${F(y - h * .2)} ${F(x + h * .05)},${F(y)}Z" fill="${bark}"/>`;
    g += `<path d="M${F(x - h * .045)},${F(y)} C${F(x - h * .028)},${F(y - h * .2)} ${F(x - h * .022)},${F(y - h * .32)} ${F(x - h * .012)},${F(y - h * .42)} L${F(x - h * .004)},${F(y - h * .42)} C${F(x - h * .01)},${F(y - h * .3)} ${F(x - h * .016)},${F(y - h * .2)} ${F(x - h * .02)},${F(y)}Z" fill="${lit}" opacity=".7"/>`;
    [[-1.95, .3], [-1.55, .34], [-1.15, .3], [-2.35, .24], [-.8, .24]].forEach(([a, L]) => br(x, y - h * .4, a + (r() - .5) * .15, h * L, h * .028, 0));
    return g + sg;
  };

  /* ---------------------------------------------------------------- sky */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040a22"/><stop offset=".45" stop-color="#0d1a44"/><stop offset=".82" stop-color="#22336a"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#3c5a9c"/><stop offset=".32" stop-color="#7f88c0"/><stop offset=".58" stop-color="#d6a2b6"/><stop offset=".8" stop-color="#ffc19a"/><stop offset="1" stop-color="#ffe0b4"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e0e8ff" stop-opacity=".5"/><stop offset=".15" stop-color="#b8c8f0" stop-opacity=".2"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".06"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset=".12" stop-color="#ffd890" stop-opacity=".6"/><stop offset=".4" stop-color="#ffb080" stop-opacity=".22"/><stop offset="1" stop-color="#ff9a80" stop-opacity="0"/>`;
  const halo = (id, c, a = .9) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${a}"/><stop offset=".35" stop-color="${c}" stop-opacity="${a * .3}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="xfdefs">
    <linearGradient id="xfSky" x1="0" y1="0" x2="0" y2="430" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="xfLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 760 : 1100}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="xfHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="xfField" x1="0" y1="440" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${SN[1]}"/><stop offset=".35" stop-color="${SN[2]}"/><stop offset="1" stop-color="${SN[3]}"/></linearGradient>
    <linearGradient id="xfFieldX" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${NIGHT ? "#a0b4e8" : "#ffd8b0"}" stop-opacity=".45"/><stop offset=".4" stop-color="${NIGHT ? "#a0b4e8" : "#ffd8b0"}" stop-opacity=".12"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
    ${g2("xfBarnF", T("#b4382c"), T("#82241e"), 1, 0)}
    ${g2("xfBarnS", T("#e0603e"), T("#c24632"), 1, 0)}
    ${g2("xfHouseF", T("#ece6ee"), T("#cfcadc"), 1, 0)}
    ${g2("xfHouseS", T("#fff2e4"), T("#f6e2d4"), 1, 0)}
    <radialGradient id="xfBall" cx=".34" cy=".32" r=".75"><stop offset="0" stop-color="${SN[0]}"/><stop offset=".5" stop-color="${SN[1]}"/><stop offset=".85" stop-color="${SN[3]}"/><stop offset="1" stop-color="${SN[4]}"/></radialGradient>
    <radialGradient id="xfPane" cx=".5" cy=".65" r=".7"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#ffc861"/><stop offset="1" stop-color="#e88a2e"/></radialGradient>
    ${halo("xfGlow", "#ffc060", .8)}${BULBS.map((c, i) => halo("xfB" + i, c, .95)).join("")}
    <filter id="xfLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="xfLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="xfSnowy" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="xfCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="xfPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="xfSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="xfBlur"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="xfSmoke" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#xfSky)"/>`;

  if (NIGHT) {
    for (let i = 0; i < 480; i++) { const x = rs() * W, y = Math.pow(rs(), 1.45) * 410, d = Math.hypot(x - LX, y - LY);
      if (d < 140) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${rs() < .07 ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffecc8" : "#e8eeff"}" opacity="${F(.2 + rs() * .65 * (1 - y / 450))}"/>`; }
    const R = 38;
    s += `<rect width="${W}" height="${H}" fill="url(#xfLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 18}" fill="#cfdcff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#eef2fc"/>`;
    [[-12, -10, 10, 7], [8, -14, 8, 6], [-2, 8, 11, 7], [-18, 12, 6, 6], [14, 10, 6, 7]].forEach(([dx, dy, a, b]) => s += `<ellipse cx="${LX + dx}" cy="${LY + dy}" rx="${a}" ry="${b}" fill="#9aa4bc" opacity=".3"/>`);
    s += `<path d="M${LX},${LY - R} A${R},${R} 0 0 1 ${LX},${LY + R} A${R * .45},${R} 0 0 0 ${LX},${LY - R}Z" fill="#1c284e" opacity=".85"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#xfLight)"/>`;
    s += `<g opacity=".1" filter="url(#xfSoft)">`;
    for (let k = 0; k < 9; k++) { const a = -2.9 + k * .32, L = 1100;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .035) * L)},${F(LY + Math.sin(a - .035) * L)} L${F(LX + Math.cos(a + .035) * L)},${F(LY + Math.sin(a + .035) * L)}Z" fill="#fff4d8"/>`; }
    s += `</g><circle cx="${LX}" cy="${LY}" r="70" fill="#fff0c0" opacity=".35"/><circle cx="${LX}" cy="${LY}" r="44" fill="#fff6dc"/><circle cx="${LX}" cy="${LY}" r="40" fill="#fffbee"/>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: long strata with undersides lit by the low sun (or moon) */
  const cloud = (x, y, w, cls, warm) => {
    let c = `<g class="${cls}"><g filter="url(#xfCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    const C = NIGHT ? ["#18224a", "#24305c", "#5a6c9c", "#a8b8e4"] : ["#6c6c9e", "#8c7eae", mix("#e8a0a0", "#ffc890", warm), mix("#ffd0b8", "#fff0c8", warm)];
    for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .05 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
    c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="${C[0]}"/>`;
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .42)}" fill="${C[1]}"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly + R * .2)}" rx="${F(R * .95)}" ry="${F(R * .17)}" fill="${C[2]}"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .5)}" cy="${F(ly + R * .26)}" rx="${F(R * .45)}" ry="${F(R * .08)}" fill="${C[3]}" opacity=".85"/>`);
    return c + `</g></g>`;
  };
  s += cloud(420, 140, 720, "drift1", .2) + cloud(2060, 110, 780, "drift2", .1) + cloud(1640, 230, 460, "drift3", .5) + cloud(980, 270, 420, "drift2", .8) + cloud(260, 290, 300, "drift1", .9);
  if (!NIGHT) {
    s += `<g class="birds" fill="none" stroke="#4a3a52" stroke-width="2" stroke-linecap="round" opacity=".6">`;
    [[1010, 200, 1], [1036, 190, .85], [1060, 206, .9], [1086, 196, .75]].forEach(([x, y, k]) =>
      s += `<path d="M${x - 9 * k},${y - 3 * k} q${5 * k},${-4 * k} ${9 * k},${3 * k} q${4 * k},${-7 * k} ${9 * k},${-3 * k}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* --------------------------------------------------------------- land */
  s += mountains(NIGHT
    ? { base: 430, hi: 352, lo: 396, step: 240, lx: LX, lit: "#6a7cb4", mid: "#4e5f96", dark: "#3a487a", rim: "#c0d0f4" }
    : { base: 430, hi: 352, lo: 396, step: 240, lx: LX, lit: "#fbd4c8", mid: "#d6b6c6", dark: "#a8a0c4", rim: "#fff2dc" });
  s += `<rect x="0" y="370" width="${W}" height="80" fill="url(#xfHaze)" opacity=".9"/>`;
  /* woodland band: tiny bare trees and firs along a rolling ridge */
  const wb = wave([2, 5, 1], [300, 120, 50], [9, 4, 2]);
  const wood = x => 452 + wb(x);
  s += `<path d="${ridgePath(wood)}" fill="${mix(SN[2], HZ, .35)}"/>`;
  let wt = "";
  for (let row = 0; row < 3; row++) for (let x = -10; x < W + 10; x += 4 + r() * 6) {
    const y = wood(x) + 2 + row * 5 + r() * 3, h = 12 + r() * 14 + row * 3, hz = .5 - row * .12;
    if (r() < .35) { const c = mix(T("#3c5a52"), HZ, hz); wt += `<path d="M${F(x)},${F(y - h)} L${F(x + h * .28)},${F(y)} L${F(x - h * .28)},${F(y)}Z" fill="${c}"/><path d="M${F(x)},${F(y - h)} L${F(x - h * .28)},${F(y)} L${F(x)},${F(y)}Z" fill="${mix(c, NIGHT ? "#6a7cb4" : "#ffc0a0", .3)}"/>`; }
    else { const c = mix(T("#6a5058"), HZ, hz + .1);
      wt += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - h * .45)}" stroke="${c}" stroke-width="1"/><path d="${blobP(x, y - h * .62, h * .3, h * .36, 7)}" fill="${c}" opacity=".55"/><path d="${blobP(x - h * .1, y - h * .7, h * .16, h * .2, 6)}" fill="${mix(c, NIGHT ? "#8090c0" : "#ffb890", .35)}" opacity=".5"/>`; }
  }
  s += `<g filter="url(#xfLeafyS)">${wt}</g>`;
  s += `<rect x="0" y="440" width="${W}" height="50" fill="url(#xfHaze)" opacity=".5"/>`;

  /* the snowfield, rolling drifts with blue troughs and lit crests */
  const fb = wave([1, 3, 4], [420, 170, 60], [6, 3, 1]);
  const field = x => 474 + fb(x);
  s += `<path d="${ridgePath(field)}" fill="url(#xfField)"/><path d="${ridgePath(field)}" fill="url(#xfFieldX)"/>`;
  let dr = "";
  for (let i = 0; i < 9; i++) { const y0 = 500 + i * 26 + r() * 10, ph = r() * 6, am = 6 + i * 1.5, f = 160 + r() * 140, x0 = -40 + r() * 600, x1 = x0 + 900 + r() * 1300;
    let up = [], dn = [];
    for (let x = x0; x <= x1; x += 24) { const t = (x - x0) / (x1 - x0), env = Math.sin(t * Math.PI), y = y0 + Math.sin(x / f + ph) * am;
      up.push([x, y - env * (3 + i * .6)]); dn.push([x + 8, y + env * (6 + i * 1.6)]); }
    dr += `<path d="${poly([...up, ...dn.reverse()])}" fill="${SHADOW}" opacity="${F(.1 + i * .01)}" filter="url(#xfBlur)"/>`;
    dr += `<path d="${line(up)}" stroke="${SN[0]}" stroke-width="${F(3 + i * .4)}" fill="none" opacity=".45" filter="url(#xfBlur)"/>`; }
  s += dr;

  /* trees behind the farm */
  [[820, 486, 120], [880, 494, 150], [940, 488, 104], [1440, 474, 96], [1720, 492, 150], [1790, 486, 118], [2010, 484, 100]].forEach(([x, y, h]) => {
    s += `<path d="${poly([[x, y], [x + h * 1.1, y + 6], [x + h * 1.1, y + 12], [x, y + 8]])}" fill="${SHADOW}" opacity=".25" filter="url(#xfBlur)"/>` + fir(x, y, h, .12); });

  /* long shadow helper (sun low on the left: shadows run right) */
  const shadow = (pts, o = .4) => `<path d="${poly(pts)}" fill="${SHADOW}" opacity="${o}" filter="url(#xfBlur)"/>`;
  const windowQ = (q, lit, frame) => { // q: 4 corners tl,tr,br,bl
    let g = "";
    if (NIGHT && lit) { const cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2; g += `<circle cx="${F(cx)}" cy="${F(cy)}" r="30" fill="url(#xfGlow)" opacity=".75"/>`; }
    g += `<path d="${poly(q)}" fill="${NIGHT ? (lit ? "url(#xfPane)" : "#141a34") : (lit ? "#e8b070" : "#4e5a7c")}" stroke="${frame}" stroke-width="2.4"/>`;
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    g += `<path d="${line([m(q[0], q[1]), m(q[3], q[2])])} ${line([m(q[0], q[3]), m(q[1], q[2])])}" stroke="${frame}" stroke-width="1.6"/>`;
    if (!NIGHT) g += `<path d="${poly([q[0], m(q[0], q[1]), m(q[0], q[3])])}" fill="#ffffff" opacity=".25"/>`;
    return g;
  };
  const wreath = (cx, cy, R) => {
    let g = "";
    for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283 + r() * .1, rr = R * (.85 + r() * .3), lit = (-Math.cos(a) * .8 - Math.sin(a) * .5) * .5 + .5;
      g += `<path d="${blobP(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, R * .3, R * .24, 6)}" fill="${T(mix("#143a22", "#6aa050", lit))}"/>`; }
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, rr = R * (.8 + r() * .4), lit = (-Math.cos(a) * .8 - Math.sin(a) * .5) * .5 + .5;
      g += `<path d="${blobP(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, R * .16, R * .12, 6)}" fill="${T(mix("#2a5a30", "#a8d070", lit))}"/>`; }
    for (let i = 0; i < 8; i++) { const a = r() * 6.28; g += `<circle cx="${F(cx + Math.cos(a) * R)}" cy="${F(cy + Math.sin(a) * R)}" r="${F(R * .1)}" fill="${T("#e0242a")}"/>`; }
    const bc = T("#d01e26"), bd = T("#8a1018");
    g += `<path d="M${F(cx)},${F(cy + R)} q${F(-R * .5)},${F(-R * .45)} ${F(-R * .62)},${F(-R * .05)} q${F(.1 * R)},${F(R * .35)} ${F(R * .62)},${F(R * .05)}Z" fill="${bc}"/><path d="M${F(cx)},${F(cy + R)} q${F(R * .5)},${F(-R * .45)} ${F(R * .62)},${F(-R * .05)} q${F(-.1 * R)},${F(R * .35)} ${F(-R * .62)},${F(R * .05)}Z" fill="${bd}"/>`;
    g += `<path d="M${F(cx - R * .05)},${F(cy + R)} l${F(-R * .28)},${F(R * .7)} l${F(R * .12)},${F(-R * .06)} M${F(cx + R * .05)},${F(cy + R)} l${F(R * .3)},${F(R * .66)}" stroke="${bc}" stroke-width="${F(R * .12)}" fill="none"/><circle cx="${F(cx)}" cy="${F(cy + R)}" r="${F(R * .1)}" fill="${bd}"/>`;
    if (!NIGHT) g += `<path d="${blobP(cx - R * .2, cy - R * 1.02, R * .45, R * .1, 6)}" fill="${SN[0]}"/>`;
    return g;
  };
  const bulbs = (pts, k = 1) => {
    let path = [], b = "";
    for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(L / (7 * k)));
      for (let j = 0; j < n; j++) { const t = j / n, ph = (j % 4) / 4; path.push([ax + (bx - ax) * t, ay + (by - ay) * t + Math.sin(ph * Math.PI) * 3 * k]); } }
    b += `<path d="${line(path)}" stroke="#1a2220" stroke-width="${F(.8 * k)}" fill="none" opacity=".55"/>`;
    path.forEach(([x, y], i) => { if (i % 4 === 0) return; const ci = i % BULBS.length;
      if (NIGHT) b += `<circle cx="${F(x)}" cy="${F(y + 1.5 * k)}" r="${F(7 * k)}" fill="url(#xfB${ci})"/>`;
      b += `<circle cx="${F(x)}" cy="${F(y + 1.5 * k)}" r="${F(1.8 * k)}" fill="${NIGHT ? mix(BULBS[ci], "#ffffff", .35) : BULBS[ci]}"/>`; });
    return b;
  };

  /* ---- the farmhouse (right of the barn, a little further back) ---- */
  {
    const x0 = 1610, y0 = 506, w = 210, h = 108, D = [-96, -34], rh = 58, xL = x0 - w / 2, xR = x0 + w / 2, ov = 10;
    let g = shadow([[xL, y0], [xR, y0], [xR + 300, y0 + 22], [xL + 150, y0 + 24]], .35);
    const R1 = [xL + D[0] / 2, y0 - h + D[1] / 2 - rh], R2 = [xR + D[0] / 2, y0 - h + D[1] / 2 - rh];
    // back roof plane peeking, left gable wall (sunlit), front wall
    g += `<path d="${poly([[R1[0] - ov, R1[1]], [R2[0] + ov, R2[1]], [xR + D[0] + ov, y0 - h + D[1]], [xL + D[0] - ov, y0 - h + D[1]]])}" fill="${SN[2]}"/>`;
    g += `<path d="${poly([[xL, y0], [xL, y0 - h], R1, [xL + D[0], y0 - h + D[1]], [xL + D[0], y0 + D[1]]])}" fill="url(#xfHouseS)"/>`;
    for (let k = 1; k < 26; k++) { const yy = y0 - k * 5.2; g += `<path d="${line([[xL, yy], [xL + D[0], yy + D[1]]])}" stroke="${T("#c8a894")}" stroke-width=".8" opacity=".45"/>`; }
    for (let k = 0; k < 2; k++) { const t1 = .3 + k * .32, t2 = t1 + .14, P = (t, z) => [xL + D[0] * t, y0 + D[1] * t - z];
      g += windowQ([P(t2, 92 - k * 0), P(t1, 92), P(t1, 64), P(t2, 64)], NIGHT || r() < .3, T("#f8f4ee")); }
    { const P = (t, z) => [xL + D[0] * t, y0 + D[1] * t - z]; g += windowQ([P(.58, 140), P(.42, 140), P(.42, 122), P(.58, 122)], NIGHT, T("#f8f4ee")); }
    g += `<path d="${line([[xL + 2, y0 - h], [R1[0] + 2, R1[1] - 3], [xL + D[0] + 2, y0 - h + D[1]]])}" stroke="${T("#f8f4ee")}" stroke-width="5" fill="none"/><path d="${line([[xL - 4, y0 - h - 2], [R1[0] - 2, R1[1] - 6], [xL + D[0] - 4, y0 - h + D[1] - 2]])}" stroke="${SN[0]}" stroke-width="6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    g += `<rect x="${xL}" y="${y0 - h}" width="${w}" height="${h}" fill="url(#xfHouseF)"/>`;
    for (let k = 1; k < 21; k++) g += `<rect x="${xL}" y="${y0 - k * 5.2}" width="${w}" height=".9" fill="${T("#9a96b0")}" opacity=".35"/>`;
    g += `<rect x="${xL}" y="${y0 - h}" width="5" height="${h}" fill="${T("#ffffff")}"/><rect x="${xR - 5}" y="${y0 - h}" width="5" height="${h}" fill="${T("#e4e0ea")}"/>`;
    // windows with shutters, upstairs and down
    const sh = T("#2c4a3a");
    [xL + 30, xL + 74, xR - 74, xR - 30].forEach((cx, i) => {
      g += `<rect x="${cx - 18}" y="${y0 - h + 14}" width="7" height="30" fill="${sh}"/><rect x="${cx + 11}" y="${y0 - h + 14}" width="7" height="30" fill="${sh}"/>`;
      g += windowQ([[cx - 10, y0 - h + 14], [cx + 10, y0 - h + 14], [cx + 10, y0 - h + 44], [cx - 10, y0 - h + 44]], NIGHT ? i !== 1 : i === 2, T("#ffffff"));
      g += `<path d="${blobP(cx, y0 - h + 46, 13, 2.4, 6)}" fill="${SN[0]}"/>`;
      if (i === 0 || i === 3) { g += `<rect x="${cx - 18}" y="${y0 - 50}" width="7" height="32" fill="${sh}"/><rect x="${cx + 11}" y="${y0 - 50}" width="7" height="32" fill="${sh}"/>`;
        g += windowQ([[cx - 10, y0 - 50], [cx + 10, y0 - 50], [cx + 10, y0 - 18], [cx - 10, y0 - 18]], true, T("#ffffff"));
        g += `<rect x="${cx - 7}" y="${y0 - 26}" width="2" height="6" fill="#fff4d0"/><circle cx="${cx - 6}" cy="${y0 - 28}" r="1.6" fill="#ffd060"/>`; }
    });
    // front door with wreath, porch roof with snow + lights, posts
    if (NIGHT) g += `<circle cx="${x0}" cy="${y0 - 30}" r="60" fill="url(#xfGlow)" opacity=".6"/>`;
    g += `<rect x="${x0 - 15}" y="${y0 - 46}" width="30" height="46" fill="${T("#f4f0ea")}"/><rect x="${x0 - 11}" y="${y0 - 43}" width="22" height="43" fill="${T("#9a2620")}"/><rect x="${x0 - 8}" y="${y0 - 40}" width="16" height="10" fill="${NIGHT ? "url(#xfPane)" : "#d8a870"}"/>`;
    g += wreath(x0, y0 - 22, 8);
    const pt = y0 - 58, pb = y0 - 50;
    g += `<path d="${poly([[xL + 8, pt], [xR - 8, pt], [xR + 2, pb + 2], [xL - 2, pb + 2]])}" fill="${T("#6a5a5e")}"/>`;
    g += `<path d="${poly([[xL + 10, pt - 1], [xR - 10, pt - 1], [xR + 4, pb - 1], [xL - 4, pb - 1]])}" fill="${SN[1]}" filter="url(#xfSnowy)"/>`;
    g += `<path d="${line([[xL - 4, pb], [xR + 4, pb]])}" stroke="${SN[0]}" stroke-width="5" stroke-linecap="round"/>`;
    [xL + 2, xL + 56, xR - 56, xR - 2].forEach(px => g += `<rect x="${px - 2.5}" y="${pb + 2}" width="5" height="${y0 - pb - 2}" fill="${T("#f8f4ee")}"/><rect x="${px + .5}" y="${pb + 2}" width="2" height="${y0 - pb - 2}" fill="${T("#c8c4d4")}"/>`);
    g += bulbs([[xL - 2, pb + 3], [xR + 2, pb + 3]], 1.2);
    for (let k = 0; k < 8; k++) g += `<path d="M${F(xL + 4 + k * 26)},${F(y0 - 18)} q13,8 26,0" stroke="${T("#2a5a32")}" stroke-width="3" fill="none"/>`;
    // roof
    const plF = [[xL - ov, y0 - h + 2], [xR + ov, y0 - h + 2], [R2[0] + ov, R2[1]], [R1[0] - ov, R1[1]]];
    g += `<path d="${poly(plF)}" fill="${SN[1]}"/><path d="${poly([[xL - ov, y0 - h + 2], [xR + ov, y0 - h + 2], [R2[0] + ov, y0 - h - 18], [R1[0] - ov, y0 - h - 18]])}" fill="${SN[2]}" opacity=".45"/>`;
    for (let k = 0; k < 10; k++) { const t = r(), u = .2 + r() * .6, px = plF[0][0] + (plF[1][0] - plF[0][0]) * t + D[0] * u * .5, py = y0 - h + (R1[1] - y0 + h) * u;
      g += `<path d="${blobP(px, py, 16 + r() * 18, 3 + r() * 2, 7)}" fill="${SN[0]}" opacity=".55"/>`; }
    g += `<path d="${line([[R1[0] - ov, R1[1]], [R2[0] + ov, R2[1]]])}" stroke="${SN[0]}" stroke-width="4" stroke-linecap="round"/>`;
    g += `<path d="${line([[xL - ov, y0 - h + 4], [xR + ov, y0 - h + 4]])}" stroke="${T("#5a4a50")}" stroke-width="3"/><path d="${line([[xL - ov, y0 - h + 1], [xR + ov, y0 - h + 1]])}" stroke="${SN[0]}" stroke-width="6" stroke-linecap="round"/>`;
    for (let px = xL - 6; px < xR + 8; px += 5) if (r() < .55) { const il = 3 + r() * 9; g += `<path d="M${F(px - 1.2)},${F(y0 - h + 4)} L${F(px)},${F(y0 - h + 4 + il)} L${F(px + 1.2)},${F(y0 - h + 4)}Z" fill="${SN[0]}" opacity=".85"/>`; }
    // chimney + smoke
    const cx = xR - 46 + D[0] * .3, cy = y0 - h - rh * .62 + D[1] * .3;
    g += `<rect x="${F(cx - 9)}" y="${F(cy - 34)}" width="18" height="40" fill="${T("#a8503e")}"/><rect x="${F(cx + 3)}" y="${F(cy - 34)}" width="6" height="40" fill="${T("#6e3028")}"/><rect x="${F(cx - 11)}" y="${F(cy - 38)}" width="22" height="5" fill="${T("#5a2a24")}"/><path d="${blobP(cx, cy - 40, 13, 4, 7)}" fill="${SN[0]}"/>`;
    g += `<g class="smoke" filter="url(#xfSmoke)">`;
    for (let j = 0; j < 8; j++) { const t = j / 7; g += `<circle cx="${F(cx + j * 9 + t * t * 50)}" cy="${F(cy - 50 - j * 15)}" r="${F(6 + j * 3.4)}" fill="${NIGHT ? "#8e9cc0" : mix("#f4eef0", "#ffd8c0", .3)}" opacity="${F((.6 - t * .5) * (NIGHT ? .7 : 1))}"/>`; }
    g += `</g>`;
    g += `<g filter="url(#xfSnowy)">${Array.from({ length: 30 }, (_, i) => `<path d="${blobP(xL - 10 + i * 8, y0 + 2, 9, 4, 6)}" fill="${i % 3 ? SN[1] : SN[0]}"/>`).join("")}</g>`;
    s += g;
  }

  /* ---- the barn ---- */
  {
    const x0 = 1190, y0 = 530, w = 236, h = 120, D = [-158, -44], xL = x0 - w / 2, xR = x0 + w / 2;
    const EL = [xL - 12, y0 - h + 4], KL = [xL + 28, y0 - h - 62], A = [x0, y0 - h - 106], KR = [xR - 28, y0 - h - 62], ER = [xR + 12, y0 - h + 4];
    let g = shadow([[xL, y0], [xR, y0], [xR + 380, y0 + 30], [xR + 180, y0 + 40], [xL + 120, y0 + 30]], .42);
    // left side wall (in full sun)
    const SW = [[xL, y0], [xL, y0 - h], [xL + D[0], y0 - h + D[1]], [xL + D[0], y0 + D[1]]];
    g += `<path d="${poly(SW)}" fill="url(#xfBarnS)"/>`;
    for (let k = 1; k < 20; k++) { const t = k / 20, px = xL + D[0] * t, py = y0 + D[1] * t; g += `<path d="M${F(px)},${F(py)} L${F(px)},${F(py - h)}" stroke="${T("#8a2a20")}" stroke-width="1" opacity=".35"/>`; }
    for (let k = 0; k < 3; k++) { const t1 = .18 + k * .27, t2 = t1 + .1, P = (t, z) => [xL + D[0] * t, y0 + D[1] * t - z];
      g += windowQ([P(t2, 84), P(t1, 84), P(t1, 60), P(t2, 60)], NIGHT && k === 1, T("#f6efe4")); }
    g += `<path d="${line([[xL, y0 - 2], [xL + D[0], y0 + D[1] - 2]])}" stroke="${T("#f6efe4")}" stroke-width="5"/><path d="${line([[xL + D[0] + 2, y0 + D[1]], [xL + D[0] + 2, y0 - h + D[1]]])}" stroke="${T("#f6efe4")}" stroke-width="5"/>`;
    // roof planes on the sunny side: steep lower (shingles showing under snow), shallow upper (full snow)
    const lower = [EL, KL, add(KL, D), add(EL, D)], upper = [KL, A, add(A, D), add(KL, D)];
    g += `<path d="${poly(lower)}" fill="${T("#5a3438")}"/>`;
    for (let k = 1; k < 8; k++) { const t = k / 8; g += `<path d="${line([[EL[0] + (KL[0] - EL[0]) * t, EL[1] + (KL[1] - EL[1]) * t], [EL[0] + D[0] + (KL[0] - EL[0]) * t, EL[1] + D[1] + (KL[1] - EL[1]) * t]])}" stroke="${T("#3a2026")}" stroke-width="1.2" opacity=".6"/>`; }
    g += `<g filter="url(#xfSnowy)"><path d="${poly([KL, add(KL, D), [EL[0] + D[0] + (KL[0] - EL[0]) * .3, EL[1] + D[1] + (KL[1] - EL[1]) * .3], ...Array.from({ length: 9 }, (_, i) => { const t = 1 - i / 8; return [EL[0] + D[0] * t + (KL[0] - EL[0]) * (.22 + r() * .2), EL[1] + D[1] * t + (KL[1] - EL[1]) * (.22 + r() * .2)]; })])}" fill="${SN[0]}"/></g>`;
    g += `<path d="${poly(upper)}" fill="${SN[0]}"/><path d="${poly([KL, [KL[0] + (A[0] - KL[0]) * .35, KL[1] + (A[1] - KL[1]) * .35], add([KL[0] + (A[0] - KL[0]) * .35, KL[1] + (A[1] - KL[1]) * .35], D), add(KL, D)])}" fill="${SN[2]}" opacity=".35"/>`;
    for (let k = 0; k < 8; k++) { const u = .2 + r() * .7, t = .1 + r() * .8, px = KL[0] + (A[0] - KL[0]) * u + D[0] * t, py = KL[1] + (A[1] - KL[1]) * u + D[1] * t;
      g += `<path d="${blobP(px, py, 12 + r() * 14, 3 + r() * 2, 7)}" fill="${NIGHT ? SN[1] : "#ffe8d8"}" opacity=".7"/>`; }
    g += `<path d="${line([add(EL, D), EL])}" stroke="${SN[0]}" stroke-width="6" stroke-linecap="round"/>`;
    for (let t = .04; t < 1; t += .035) if (r() < .6) { const px = EL[0] + D[0] * t, py = EL[1] + D[1] * t + 3, il = 4 + r() * 12; g += `<path d="M${F(px - 1.5)},${F(py)} L${F(px)},${F(py + il)} L${F(px + 1.5)},${F(py)}Z" fill="${SN[0]}" opacity=".85"/>`; }
    g += `<path d="${line([A, add(A, D)])}" stroke="${SN[0]}" stroke-width="5" stroke-linecap="round"/>`;
    // cupola on the ridge with a weathervane
    { const c = add(A, D, .5), cw = 30, ch = 26, cs = [-12, -4];
      g += `<path d="${poly([[c[0] - cw / 2, c[1] + 4], [c[0] - cw / 2, c[1] - ch], [c[0] - cw / 2 + cs[0], c[1] - ch + cs[1]], [c[0] - cw / 2 + cs[0], c[1] + 4 + cs[1]]])}" fill="${T("#d85a3c")}"/>`;
      g += `<rect x="${c[0] - cw / 2}" y="${c[1] - ch}" width="${cw}" height="${ch + 4}" fill="${T("#a8322a")}"/>`;
      for (let k = 0; k < 4; k++) g += `<rect x="${c[0] - cw / 2 + 5}" y="${c[1] - ch + 5 + k * 4.5}" width="${cw - 10}" height="2" fill="${T("#f6efe4")}" opacity=".85"/>`;
      g += `<path d="${poly([[c[0] - cw / 2 - 5 + cs[0], c[1] - ch + cs[1]], [c[0] - cw / 2 - 5, c[1] - ch + 2], [c[0] + cw / 2 + 5, c[1] - ch + 2], [c[0] + 1, c[1] - ch - 22]])}" fill="${SN[0]}"/><path d="${poly([[c[0] + 1, c[1] - ch - 22], [c[0] + cw / 2 + 5, c[1] - ch + 2], [c[0] + 4, c[1] - ch + 2]])}" fill="${SN[2]}"/>`;
      const v = [c[0] + 1, c[1] - ch - 22], vc = T("#2a2a30");
      g += `<path d="M${v[0]},${v[1]} v-30 M${v[0] - 12},${v[1] - 14} h24 M${v[0]},${v[1] - 20} l-4,4 M${v[0]},${v[1] - 20} l4,4" stroke="${vc}" stroke-width="1.6"/>`;
      g += `<path d="M${v[0] - 10},${v[1] - 30} q4,-10 10,-8 q2,-6 6,-4 l-2,3 q4,2 2,8 q-6,3 -14,2 l-5,4Z" fill="${vc}"/>`; }
    // front gable wall
    const G = [[xL, y0], [xR, y0], [xR, y0 - h], [xR - 34, y0 - h - 58], [x0, y0 - h - 100], [xL + 34, y0 - h - 58], [xL, y0 - h]];
    g += `<path d="${poly(G)}" fill="url(#xfBarnF)"/>`;
    for (let px = xL + 8; px < xR; px += 9) { const topY = px < xL + 34 ? y0 - h - (px - xL) / 34 * 58 : px > xR - 34 ? y0 - h - (xR - px) / 34 * 58 : y0 - h - 58 - (1 - Math.abs(px - x0) / (x0 - xL - 34)) * 42;
      g += `<path d="M${px},${y0} L${px},${F(topY + 2)}" stroke="${T("#5a1814")}" stroke-width="1" opacity=".3"/>`; }
    g += `<rect x="${xL}" y="${y0 - h}" width="7" height="${h}" fill="${T("#f6efe4")}"/><rect x="${xR - 7}" y="${y0 - h}" width="7" height="${h}" fill="${T("#d8d0d4")}"/><rect x="${xL}" y="${y0 - h - 3}" width="${w}" height="6" fill="${T("#e8e0dc")}"/>`;
    // trim + snow on the gambrel edge
    g += `<path d="${line([EL, KL, A, KR, ER])}" stroke="${T("#ece4dc")}" stroke-width="7" fill="none" stroke-linejoin="round"/>`;
    g += `<path d="${line([[EL[0] - 2, EL[1] - 4], [KL[0] - 2, KL[1] - 5], [A[0], A[1] - 6], [KR[0] + 2, KR[1] - 5], [ER[0] + 2, ER[1] - 4]])}" stroke="${SN[0]}" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    // sliding doors with X braces, track, lantern
    const dw = 116, dh = 94, dl = x0 - dw / 2;
    g += `<rect x="${dl - 6}" y="${y0 - dh - 10}" width="${dw + 12}" height="5" fill="${T("#3a3a40")}"/>`;
    [dl, x0].forEach(px => {
      g += `<rect x="${px}" y="${y0 - dh}" width="${dw / 2}" height="${dh}" fill="${T("#f2eadc")}"/><rect x="${px + 6}" y="${y0 - dh + 6}" width="${dw / 2 - 12}" height="${dh - 12}" fill="${T("#8e2a22")}"/>`;
      g += `<path d="M${px + 6},${y0 - dh + 6} L${px + dw / 2 - 6},${y0 - 6} M${px + dw / 2 - 6},${y0 - dh + 6} L${px + 6},${y0 - 6}" stroke="${T("#f2eadc")}" stroke-width="5"/>`; });
    g += `<rect x="${x0 + 30}" y="${y0 - dh}" width="${dw / 2 - 30}" height="${dh}" fill="#000" opacity=".1"/>`;
    if (NIGHT) g += `<circle cx="${x0}" cy="${y0 - dh - 22}" r="90" fill="url(#xfGlow)"/><ellipse cx="${x0}" cy="${y0 + 8}" rx="120" ry="18" fill="#ffc070" opacity=".3"/>`;
    g += `<path d="M${x0 - 6},${y0 - dh - 14} h12 l-2,-14 h-8Z" fill="${NIGHT ? "#ffe0a0" : "#e8dcc8"}" stroke="${T("#2a2a30")}" stroke-width="1.5"/><path d="M${x0 - 8},${y0 - dh - 28} l8,-6 l8,6Z" fill="${T("#2a2a30")}"/>`;
    // the big wreath on the gable, and a round vent above it
    g += wreath(x0, y0 - h - 32, 26);
    g += `<circle cx="${x0}" cy="${y0 - h - 78}" r="9" fill="${T("#f2eadc")}"/><circle cx="${x0}" cy="${y0 - h - 78}" r="6.5" fill="${T("#3a2224")}"/>`;
    // snow drifts against the walls
    g += `<g filter="url(#xfSnowy)">`;
    for (let k = 0; k < 34; k++) { const t = k / 33, px = xL + D[0] * t, py = y0 + D[1] * t; g += `<path d="${blobP(px, py + 2, 10, 6, 6)}" fill="${SN[0]}"/>`; }
    for (let px = xL - 8; px < xR + 10; px += 9) g += `<path d="${blobP(px, y0 + 3, 11, 5 + (Math.abs(px - x0) < dw / 2 ? 0 : 3), 6)}" fill="${SN[1]}"/>`;
    g += `</g>`;
    s += g;
  }

  /* bare oak behind the fence on the right */
  s += shadow([[1854, 552], [2110, 572], [2110, 580], [1854, 562]], .3) + bareTree(1850, 556, 250);

  /* split-rail fence running toward us on the right, cardinals on the top rail */
  {
    let g = "";
    const P0 = [1700, 552], P1 = [2600, 628], posts = [];
    for (let t = 0; t <= 1.001; t += .1) posts.push([P0[0] + (P1[0] - P0[0]) * Math.pow(t, 1.15), P0[1] + (P1[1] - P0[1]) * Math.pow(t, 1.15), .7 + t * .7]);
    const wood = T("#6a5040"), woodL = T("#a8805a"), woodD = T("#3e2c26");
    for (let i = 0; i < posts.length - 1; i++) { const [ax, ay, ka] = posts[i], [bx, by, kb] = posts[i + 1];
      g += shadow([[ax, ay], [bx, by], [bx + 80 * kb, by + 6], [ax + 80 * ka, ay + 6]], .2);
      [[30, 3.8], [18, 3.8], [6, 3.6]].forEach(([hgt, th], j) => {
        const a = [ax, ay - hgt * ka + (r() - .5) * 2], b = [bx, by - hgt * kb + (r() - .5) * 2];
        g += `<path d="${poly([[a[0], a[1] - th * ka], [b[0], b[1] - th * kb], [b[0], b[1] + th * kb], [a[0], a[1] + th * ka]])}" fill="${wood}"/>`;
        g += `<path d="${line([[a[0], a[1] - th * ka * .6], [b[0], b[1] - th * kb * .6]])}" stroke="${woodL}" stroke-width="${F(1.4 * ka)}" opacity=".8"/>`;
        g += `<path d="${line([[a[0], a[1] + th * ka * .7], [b[0], b[1] + th * kb * .7]])}" stroke="${woodD}" stroke-width="${F(1.2 * ka)}"/>`;
        g += `<path d="${poly([[a[0], a[1] - th * ka * .8], [b[0], b[1] - th * kb * .8], [b[0], b[1] - th * kb * 2.1], ...Array.from({ length: 6 }, (_, q) => { const t = 1 - (q + .5) / 6; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - th * (ka + (kb - ka) * t) * (1.8 + r() * .8)]; }), [a[0], a[1] - th * ka * 2.1]])}" fill="${SN[0]}"/>`; }); }
    posts.forEach(([x, y, k]) => { g += `<path d="${poly([[x - 4 * k, y + 4], [x - 3.4 * k, y - 42 * k], [x + 3.4 * k, y - 44 * k], [x + 4 * k, y + 4]])}" fill="${woodD}"/><path d="${poly([[x - 4 * k, y + 4], [x - 3.4 * k, y - 42 * k], [x - .5 * k, y - 43 * k], [x - .5 * k, y + 4]])}" fill="${woodL}"/><path d="${blobP(x, y - 45 * k, 5.5 * k, 2.6 * k, 6)}" fill="${SN[0]}"/>`; });
    g += `<g filter="url(#xfSnowy)">${posts.map(([x, y, k]) => `<path d="${blobP(x + 10, y + 4, 26 * k, 6 * k, 7)}" fill="${SN[1]}"/>`).join("")}</g>`;
    /* cardinals: red males, one buff female */
    const cardinal = (x, y, sc, face, female) => {
      const body = T(female ? "#b88a6a" : "#d81c20"), wing = T(female ? "#9a6a4a" : "#a01418"), hi = T(female ? "#e0b890" : "#ff5a40");
      const f = face; let c = `<g transform="translate(${F(x)},${F(y)}) scale(${F(sc * f)},${F(sc)})">`;
      c += `<path d="M-9,-2 L-17,3 L-15,5 L-7,2Z" fill="${wing}"/>`;
      c += `<path d="M-9,0 Q-8,-9 0,-10 Q5,-10 6,-6 Q6,0 2,3 Q-4,5 -9,0Z" fill="${body}"/>`;
      c += `<path d="M-2,-12 L1,-19 L4,-11Z" fill="${body}"/><path d="M0,-12 Q4,-16 7,-10 Q8,-6 5,-5 Q1,-6 0,-12Z" fill="${body}"/>`;
      c += `<path d="M-7,-4 Q-3,-8 2,-4 Q-2,1 -7,-1Z" fill="${wing}"/><path d="M-4,-8 Q0,-10 4,-8" stroke="${hi}" stroke-width="1.2" fill="none"/>`;
      if (!female) c += `<path d="M4,-11 Q8,-9 8,-6 Q5,-5 3,-7Z" fill="#1a1012"/>`;
      c += `<path d="M7,-9 L11,-7.5 L7,-6Z" fill="${T("#f0a030")}"/><circle cx="5.2" cy="-9.4" r=".8" fill="#000"/>`;
      c += `<path d="M-1,3 l-1,4 M2,3 l1,4" stroke="#2a1a14" stroke-width=".9"/>`;
      return c + `</g>`; };
    const onRail = t => { const i = Math.floor(t * (posts.length - 1)), u = t * (posts.length - 1) - i, [ax, ay, ka] = posts[i], [bx, by, kb] = posts[i + 1];
      return [ax + (bx - ax) * u, ay + (by - ay) * u - 30 * (ka + (kb - ka) * u) - 7 * (ka + (kb - ka) * u), ka + (kb - ka) * u]; };
    [[.07, 1, false], [.13, -1, true], [.22, 1, false]].forEach(([t, f, fe]) => { const [x, y, k] = onRail(t); g += cardinal(x, y, k * 1.25, f, fe); });
    s += g;
  }

  /* the snowman, the sled and its tracks */
  {
    const x = 940, y = 612; let g = "";
    g += shadow([[x - 30, y + 4], [x + 40, y - 4], [x + 300, y + 16], [x + 240, y + 34], [x + 20, y + 18]], .42);
    g += `<path d="M${x - 260},${y + 60} C${x - 120},${y + 40} ${x - 40},${y + 44} ${x + 70},${y + 26} M${x - 262},${y + 70} C${x - 120},${y + 50} ${x - 40},${y + 54} ${x + 72},${y + 34}" stroke="${SHADOW}" stroke-width="3" fill="none" opacity=".45"/>`;
    [[0, -38, 42], [2, -104, 31], [4, -152, 22]].forEach(([dx, dy, R]) => {
      g += `<ellipse cx="${x + dx + R * .1}" cy="${y + dy + R * .9}" rx="${R * .9}" ry="${R * .2}" fill="${SHADOW}" opacity=".3"/><circle cx="${x + dx}" cy="${y + dy}" r="${R}" fill="url(#xfBall)" stroke="${SN[3]}" stroke-width="1.5"/>`;
      g += `<path d="M${x + dx - R * .8},${y + dy - R * .35} A${R},${R} 0 0 1 ${x + dx - R * .1},${y + dy - R * .98}" stroke="${NIGHT ? "#e0e8ff" : "#fff2e0"}" stroke-width="2.5" fill="none" opacity=".8"/>`; });
    for (let k = 0; k < 14; k++) { const a = r() * 6.28, R = 40 * Math.sqrt(r()); g += `<circle cx="${F(x + Math.cos(a) * R)}" cy="${F(y - 38 + Math.sin(a) * R)}" r="${F(1 + r() * 2)}" fill="${SN[3]}" opacity=".3"/>`; }
    // arms
    g += `<path d="M${x - 26},${y - 112} L${x - 66},${y - 138} M${x - 52},${y - 129} l-6,-14 M${x - 60},${y - 134} l-14,-2" stroke="${T("#4a3022")}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M${x + 30},${y - 110} L${x + 70},${y - 122} M${x + 58},${y - 118} l8,-12 M${x + 64},${y - 120} l12,4" stroke="${T("#4a3022")}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    // face, buttons
    [[-7, -157], [8, -158]].forEach(([dx, dy]) => g += `<circle cx="${x + dx}" cy="${y + dy}" r="2.6" fill="#1a1a1e"/>`);
    [[-8, -142], [-2, -139], [5, -139], [11, -142]].forEach(([dx, dy]) => g += `<circle cx="${x + dx}" cy="${y + dy}" r="1.5" fill="#1a1a1e"/>`);
    g += `<path d="M${x},${y - 152} L${x - 24},${y - 147} L${x},${y - 147}Z" fill="${T("#f0782a")}"/><path d="M${x},${y - 150} L${x - 22},${y - 147}" stroke="${T("#c0501a")}" stroke-width="1"/>`;
    [[2, -110], [2, -92], [3, -48], [3, -24]].forEach(([dx, dy]) => g += `<circle cx="${x + dx}" cy="${y + dy}" r="3.4" fill="#1a1a1e"/>`);
    // knit hat + scarf
    const red = T("#c8242a"), redD = T("#8a141a"), grn = T("#2a6a3a");
    g += `<path d="M${x - 19},${y - 166} Q${x - 18},${y - 192} ${x + 4},${y - 194} Q${x + 24},${y - 192} ${x + 24},${y - 168}Z" fill="${red}"/><path d="M${x + 6},${y - 193} Q${x + 22},${y - 190} ${x + 24},${y - 168} L${x + 12},${y - 168}Z" fill="${redD}"/>`;
    g += `<rect x="${x - 21}" y="${y - 172}" width="46" height="9" rx="4" fill="${T("#f2eee8")}"/><circle cx="${x + 4}" cy="${y - 197}" r="7" fill="${T("#f2eee8")}"/>`;
    g += `<path d="M${x - 26},${y - 132} Q${x + 2},${y - 122} ${x + 30},${y - 132} L${x + 30},${y - 124} Q${x + 2},${y - 114} ${x - 26},${y - 124}Z" fill="${red}"/>`;
    g += `<path d="M${x + 14},${y - 126} L${x + 22},${y - 96} L${x + 32},${y - 98} L${x + 24},${y - 128}Z" fill="${redD}"/><path d="M${x + 18},${y - 113} l8,-2 M${x + 20},${y - 104} l8,-2" stroke="${grn}" stroke-width="2.5"/>`;
    [-20, -10, 0, 10, 20].forEach(dx => g += `<rect x="${x + dx}" y="${y - 130}" width="3" height="${dx === 0 ? 0 : 8}" fill="${grn}" opacity="${dx === 0 ? 0 : .8}"/>`);
    // sled
    const sx = 1070, sy = 640, wd = T("#b8442e"), wdL = T("#e0704a"), rn = T("#3a3a40");
    g += shadow([[sx - 50, sy + 4], [sx + 50, sy - 6], [sx + 170, sy + 6], [sx + 60, sy + 18]], .35);
    g += `<path d="M${sx - 58},${sy + 6} L${sx + 46},${sy - 8} Q${sx + 66},${sy - 12} ${sx + 64},${sy - 26} Q${sx + 60},${sy - 32} ${sx + 54},${sy - 26}" stroke="${rn}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    for (let k = 0; k < 4; k++) g += `<path d="M${sx - 42 + k * 26},${sy + 4 - k * 3.6} l0,-10" stroke="${rn}" stroke-width="2.4"/>`;
    for (let k = 0; k < 3; k++) { const o = k * 7; g += `<path d="${poly([[sx - 54 + o * .2, sy - 8 + o], [sx + 44, sy - 22 + o], [sx + 46, sy - 17 + o], [sx - 52, sy - 3 + o]])}" fill="${k === 0 ? wdL : wd}"/>`; }
    g += `<path d="M${sx + 44},${sy - 20} q30,10 20,40 q-8,16 -40,14" stroke="${T("#d8c8a0")}" stroke-width="1.6" fill="none"/>`;
    g += `<g filter="url(#xfSnowy)"><path d="${blobP(sx - 4, sy + 9, 66, 4, 9)}" fill="${SN[1]}"/></g>`;
    s += g;
  }

  /* big firs framing the left and right */
  [[640, 546, 210], [470, 582, 300], [330, 606, 250], [140, 640, 330], [2240, 610, 220], [2380, 650, 320], [2520, 676, 270]].forEach(([x, y, h]) => {
    s += shadow([[x - 20, y], [x + h * 1.3, y + 10], [x + h * 1.3, y + 26], [x - 10, y + 14]], .3) + fir(x, y, h); });

  /* foreground: drift crest, sparkle, dry weeds poking through */
  const fg = wave([2, 4, 1], [300, 120, 50], [8, 4, 2]);
  s += `<g filter="url(#xfSnowy)"><path d="${ridgePath(x => 676 + fg(x))}" fill="${SN[2]}"/><path d="${line(Array.from({ length: 161 }, (_, i) => [i * 16, 676 + fg(i * 16)]))}" stroke="${SN[0]}" stroke-width="4" fill="none"/></g>`;
  for (let k = 0; k < 220; k++) { const x = r() * W, y = 480 + Math.pow(r(), .7) * 240; s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(.6 + r() * 1.2)}" fill="#ffffff" opacity="${F(.4 + r() * .5)}"/>`; }
  for (let x = 0; x < W; x += 14 + r() * 40) { if (x > 760 && x < 1500 && r() < .7) continue; const y = 660 + r() * 60, hh = 14 + r() * 30, c = T(r() < .5 ? "#8a6a4a" : "#5a4636");
    s += `<path d="M${F(x)},${F(y)} q${F(-2 + r() * 4)},${F(-hh * .6)} ${F(-5 + r() * 10)},${F(-hh)}" stroke="${c}" stroke-width="1.6" fill="none" opacity=".75"/>`;
    if (r() < .3) s += `<ellipse cx="${F(x + 1)}" cy="${F(y - hh * .9)}" rx="2.4" ry="4" fill="${c}"/>`; }

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#xfLight)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#xfPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
