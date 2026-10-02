/* Harvest Farm, Thanksgiving: a farmstead in late November under a low,
   amber afternoon sun (upper right). A big red bank barn seen corner-on with
   a cupola and stone foundation, two stave silos, a white farmhouse with
   chimney smoke, a bare oak against the sun, a cut cornfield whose stubble
   rows run away toward the barn, corn shocks, round bales, pumpkins by the
   barn door, a woodlot of bare and russet trees, and wild turkeys feeding
   along the field edge. Everything is lit from the right with long shadows.
   opts.time === "night": a full moon where the sun was, stars, frosty blue
   grading, the farmhouse windows and barn lamp lit, smoke still rising.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function harvestFarmThanksgivingArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1126;
  const r = rng(seed), rs = rng(seed + 7), rl = rng(seed + 13);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 1760, LY = 286;
  const T = c => NIGHT ? mix(mix(c, "#7a7a8a", .42), "#0c1434", .6) : c;
  const RIM = NIGHT ? "#b8c8f4" : "#ffd8a0", LAMP = "#ffc868", SHADE = NIGHT ? "#04060e" : "#2a2034";
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

  const SKY_H = NIGHT ? "#3a4670" : "#f2c48c", HZ = NIGHT ? "#323e66" : "#e4c4a0";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#050a1e"/><stop offset=".45" stop-color="#0e1840"/><stop offset=".8" stop-color="#26345e"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#4a72a8"/><stop offset=".38" stop-color="#8aa6c6"/><stop offset=".66" stop-color="#d8c8bc"/><stop offset=".86" stop-color="#f0caa0"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e4ecff" stop-opacity=".55"/><stop offset=".15" stop-color="#b8c8f0" stop-opacity=".2"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".06"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2c8" stop-opacity=".95"/><stop offset=".16" stop-color="#ffd890" stop-opacity=".5"/><stop offset=".5" stop-color="#f8b870" stop-opacity=".14"/><stop offset="1" stop-color="#f8b870" stop-opacity="0"/>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="hfdefs">
    <linearGradient id="hfSky" x1="0" y1="0" x2="0" y2="460" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="hfLight" cx="${LX}" cy="${LY}" r="900" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="hfHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    ${g2("hfFar1", NIGHT ? "#26305a" : "#a49ab4", NIGHT ? "#2e3a62" : "#c4b4b4")}
    ${g2("hfFar2", NIGHT ? "#202a52" : "#958aa0", NIGHT ? "#28345c" : "#b4a29e")}
    ${g2("hfMid", T("#a89070"), T("#8a7458"))}
    ${g2("hfField", T("#a8865a"), T("#6a5032"))}
    ${g2("hfMeadow", T("#a89a5a"), T("#6a6234"))}
    <linearGradient id="hfSilo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T("#7a766e")}"/><stop offset=".45" stop-color="${T("#a8a296")}"/><stop offset=".8" stop-color="${T("#d8cebc")}"/><stop offset="1" stop-color="${T("#c0b4a0")}"/></linearGradient>
    <linearGradient id="hfDome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T("#5a6068")}"/><stop offset=".7" stop-color="${T("#a8b0b8")}"/><stop offset="1" stop-color="${T("#d8dce0")}"/></linearGradient>
    <radialGradient id="hfGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <filter id="hfLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hfLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hfCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="hfPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="hfSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="hfBlur"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hfSky)"/>`;

  if (NIGHT) {
    for (let i = 0; i < 460; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 420, d = Math.hypot(x - LX, y - LY), big = rs() < .08, o = .2 + rs() * .6 * (1 - y / 470);
      if (d < 180) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 42;
    s += `<rect width="${W}" height="${H}" fill="url(#hfLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 22}" fill="#fff0d0" opacity=".1"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#f8f2e0"/>`;
    [[-14, -12, 11, 7], [10, -16, 8, 6], [-2, 10, 12, 7], [-20, 14, 6, 6], [18, 8, 6, 9]].forEach(([dx, dy, a, b]) => s += `<path d="${blobP(LX + dx, LY + dy, a, b, 7, rs)}" fill="#b0a890" opacity=".25"/>`);
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#hfLight)"/><circle cx="${LX}" cy="${LY}" r="36" fill="#fff6dc"/>`;
    s += `<g class="rays" opacity=".11" filter="url(#hfSoft)">`;
    for (let k = 0; k < 8; k++) { const a = 1.9 + k * .32, L = 1000;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .035) * L)},${F(LY + Math.sin(a - .035) * L)} L${F(LX + Math.cos(a + .035) * L)},${F(LY + Math.sin(a + .035) * L)}Z" fill="#fff4d0"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: long late-autumn strata, undersides lit by the low light */
  const cloud = (x, y, w, cls, warm) => {
    let c = `<g class="${cls}"><g filter="url(#hfCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    const body = NIGHT ? ["#1a2244", "#26305a", "#46507c"] : ["#8a88a4", "#a8a2b8", "#c4b8c4"];
    const lit = NIGHT ? mix("#5a6a9c", "#a8b8e4", warm) : mix("#d8b0a8", "#f8d4a8", warm), hi = NIGHT ? "#c8d4f4" : "#fff2d4";
    for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .05 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
    c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .035)}" fill="${body[0]}"/>`;
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .45)}" fill="${body[1]}"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly - R * .14)}" rx="${F(R * 1.1)}" ry="${F(R * .3)}" fill="${body[2]}"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly + R * .2)}" rx="${F(R * .95)}" ry="${F(R * .17)}" fill="${lit}"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .5)}" cy="${F(ly + R * .26)}" rx="${F(R * .45)}" ry="${F(R * .07)}" fill="${hi}" opacity=".45"/>`);
    return c + `</g></g>`;
  };
  s += cloud(520, 150, 760, "drift1", .2) + cloud(1300, 96, 640, "drift2", .35) + cloud(2150, 160, 700, "drift3", .6) + cloud(980, 238, 420, "drift2", .5) + cloud(2040, 236, 380, "drift1", .9);
  if (!NIGHT) {   // crows heading for the woodlot
    s += `<g class="birds" fill="#1e1a20" stroke="#1e1a20" stroke-linecap="round">`;
    [[860, 300, 1], [900, 284, .85], [948, 310, .9], [990, 292, .75], [1030, 318, .7]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 12 * k)},${F(y - 4 * k)} q${F(6 * k)},${F(-4 * k)} ${F(12 * k)},${F(3 * k)} q${F(6 * k)},${F(-7 * k)} ${F(12 * k)},${F(-4 * k)}" fill="none" stroke-width="${F(2.6 * k)}"/><ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(4 * k)}" ry="${F(2 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ---------- helpers ---------- */
  const LATE = ["#7a5a44", "#8a6a50", "#6a5a54", "#9a7a5a", "#a8643a", "#8a4a2a", "#b8865a", "#5e584a", "#7a7064", "#8a7a6a"];
  const hedge = (fn, rows, size, haze, x0 = -10, x1 = W + 10, cons = .12) => {
    let f = ""; const trees = [];
    for (let row = 0; row < rows; row++) for (let x = x0; x < x1; x += size * (.7 + r() * .5)) {
      const y = fn(x) + row * size * .6 + size * .3 + r() * size * .3, sz = size * (.7 + r() * .5);
      trees.push([x + r() * size * .3, y, sz]); }
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(([x, y, sz]) => { const lsd = x < LX ? 1 : -1;
      if (r() < cons) { const c = T(mix("#2a3a2a", HZ, haze));
        f += `<path d="M${F(x)},${F(y - sz * 1.9)} L${F(x + sz * .3)},${F(y - sz * 1.1)} L${F(x + sz * .18)},${F(y - sz * 1.1)} L${F(x + sz * .5)},${F(y)} L${F(x - sz * .5)},${F(y)} L${F(x - sz * .18)},${F(y - sz * 1.1)} L${F(x - sz * .3)},${F(y - sz * 1.1)}Z" fill="${c}"/><path d="M${F(x)},${F(y - sz * 1.9)} L${F(x - lsd * sz * .3)},${F(y - sz * 1.1)} L${F(x - lsd * sz * .5)},${F(y)} L${F(x)},${F(y)}Z" fill="${mix(c, "#000000", .22)}"/>`; return; }
      const c = T(mix(LATE[Math.floor(r() * LATE.length)], HZ, haze)), dk = mix(c, NIGHT ? "#050814" : "#2a1a20", .32), lt = mix(c, RIM, NIGHT ? .2 : .32);
      // bare-ish tree: a twiggy crown, so stipple it as a soft blob with a few branch strokes
      f += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - sz * .9)}" stroke="${dk}" stroke-width="${F(Math.max(1, sz * .1))}"/>`;
      f += `<path d="${blobP(x - lsd * sz * .1, y - sz * .95, sz * .75, sz * .7, 8)}" fill="${dk}" opacity=".85"/><path d="${blobP(x, y - sz * 1.02, sz * .62, sz * .58, 7)}" fill="${c}" opacity=".9"/><path d="${blobP(x + lsd * sz * .28, y - sz * 1.2, sz * .3, sz * .26, 6)}" fill="${lt}" opacity=".9"/>`;
    });
    return f;
  };
  /* bare tree: recursive tapered limbs, lit edge toward the light, a few clinging leaves */
  const bareTree = (x, y, h, o = {}) => {
    let g = ""; const tips = [];
    const dk = T(o.bark || "#3a2a24"), lt = mix(dk, RIM, NIGHT ? .3 : .45), sd = LX < x ? -1 : 1;
    g += `<ellipse cx="${F(x - sd * h * .5)}" cy="${F(y + 2)}" rx="${F(h * .6)}" ry="${F(h * .04)}" fill="#000" opacity=".18"/>`;
    const br = (bx, by, a, L, w, d) => {
      const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L, bend = (r() - .5) * L * .35;
      const mx = (bx + ex) / 2 + Math.cos(a + 1.57) * bend, my = (by + ey) / 2 + Math.sin(a + 1.57) * bend;
      g += `<path d="M${F(bx)},${F(by)} Q${F(mx)},${F(my)} ${F(ex)},${F(ey)}" stroke="${dk}" stroke-width="${F(w)}" fill="none" stroke-linecap="round"/>`;
      if (w > 2.2) g += `<path d="M${F(bx + sd * w * .3)},${F(by)} Q${F(mx + sd * w * .3)},${F(my)} ${F(ex + sd * w * .25)},${F(ey)}" stroke="${lt}" stroke-width="${F(w * .3)}" fill="none" stroke-linecap="round" opacity=".75"/>`;
      if (d >= (o.depth || 6) || L < 5) { tips.push([ex, ey]); return; }
      const k = 2 + (r() < .35 ? 1 : 0);
      for (let i = 0; i < k; i++) br(ex, ey, a + (i - (k - 1) / 2) * (.55 + r() * .3) + (r() - .5) * .3 - Math.cos(a) * .08, L * (.66 + r() * .14), w * .64, d + 1);
    };
    br(x, y, -Math.PI / 2 + (r() - .5) * .08, h * .3, h * .06, 0);
    if (o.leaves) { let lg = "";
      tips.forEach(([tx, ty]) => { if (r() > o.leaves) return; const R = h * (.012 + r() * .014), v = cl(.4 + (tx - x) * sd / h * .8 + (r() - .5) * .5);
        lg += `<path d="${blobP(tx, ty, R * 1.3, R, 6)}" fill="${T(o.ramp[Math.floor(v * o.ramp.length)])}"/>`; });
      g += `<g filter="url(#hfLeafyS)">${lg}</g>`; }
    return g;
  };
  const RUSSET = ["#3a1c10", "#5a2a16", "#7a3a1c", "#94502a", "#a8642e", "#c07e3a", "#d49a50", "#e8bc72"];
  const OAKBR = ["#3a2814", "#5a3c1c", "#7a5226", "#94682e", "#ae7e38", "#c49446", "#d8ae5e", "#ecc87e"];
  /* clapboard house in perspective (gable end + long side) */
  const house = (x, y, s2, o) => {
    const m = o.m || 1, gw = o.gw || 44, sw = o.sw || 66, h = o.h || 36, rh = o.rh || 26;
    const A = [0, 0], B = [-m * gw, -gw * .1], C = [m * sw, -sw * .15];
    const up = (p, v) => [p[0], p[1] - v];
    const G = (u, v) => [B[0] * u, B[1] * u - h * v], S = (u, v) => [C[0] * u, C[1] * u - h * v];
    const q = (f, u0, v0, u1, v1) => poly([f(u0, v0), f(u1, v0), f(u1, v1), f(u0, v1)]);
    const R1 = [B[0] / 2, B[1] / 2 - h - rh], R2 = [R1[0] + C[0], R1[1] + C[1]];
    const gLit = (LX < x) === (m > 0);
    const wl = T(o.wall), wG = gLit ? mix(wl, RIM, .2) : mix(wl, SHADE, .32), wS = gLit ? mix(wl, SHADE, .3) : mix(wl, RIM, .16), tr = T(o.trim || "#f4f0e6"), rf = T(o.roof);
    let g = `<g transform="translate(${F(x)},${F(y)}) scale(${F(s2)})">`;
    g += `<ellipse cx="${F(-m * gw * .6)}" cy="0" rx="${F(sw * 1.1)}" ry="6" fill="#000" opacity=".2"/>`;
    g += `<path d="${poly([A, B, up(B, h), R1, up(A, h)])}" fill="${wG}"/><path d="${poly([A, C, up(C, h), up(A, h)])}" fill="${wS}"/>`;
    for (let k = 1; k < 12; k++) { const v = k / 12;
      g += `<path d="${line([G(0, v), G(1, v)])}" stroke="${mix(wG, "#000000", .16)}" stroke-width=".8"/><path d="${line([S(0, v), S(1, v)])}" stroke="${mix(wS, "#000000", .16)}" stroke-width=".8"/>`; }
    g += `<path d="${line([A, up(A, h)])}" stroke="${tr}" stroke-width="2.4"/><path d="${line([B, up(B, h)])}" stroke="${tr}" stroke-width="2"/><path d="${line([C, up(C, h)])}" stroke="${tr}" stroke-width="2"/>`;
    const win = (f, u0, v0, u1, v1) => {
      const lit = NIGHT && rl() < .8, du = (u1 - u0) * .14, dv = (v1 - v0) * .1;
      let w = `<path d="${q(f, u0, v0, u1, v1)}" fill="${tr}"/><path d="${q(f, u0 + du, v0 + dv, u1 - du, v1 - dv)}" fill="${lit ? LAMP : T("#4a5468")}"/>`;
      if (!lit) w += `<path d="${q(f, u0 + du, (v0 + v1) / 2, (u0 + u1) / 2, v1 - dv)}" fill="${T(gLit === (f === G) ? "#ffd8a0" : "#a8b4c4")}" opacity=".45"/>`;
      w += `<path d="${line([f((u0 + u1) / 2, v0 + dv), f((u0 + u1) / 2, v1 - dv)])} ${line([f(u0 + du, (v0 + v1) / 2), f(u1 - du, (v0 + v1) / 2)])}" stroke="${tr}" stroke-width="1"/>`;
      if (o.shut && f === S) w += `<path d="${q(f, u0 - .04, v0, u0 - .005, v1)}" fill="${T(o.shut)}"/><path d="${q(f, u1 + .005, v0, u1 + .04, v1)}" fill="${T(o.shut)}"/>`;
      if (lit) { const c = f((u0 + u1) / 2, (v0 + v1) / 2); w += `<circle cx="${F(c[0])}" cy="${F(c[1])}" r="${F(gw * .45)}" fill="url(#hfGlow)" opacity=".6"/>`; }
      return w; };
    [[.12, .38], [.58, .84]].forEach(([v0, v1]) => { (o.wins || [.2, .5, .8]).forEach(u => g += win(S, u - .05, v0, u + .05, v1)); g += win(G, .35, v0, .6, v1); });
    g += win(G, .4, 1.08, .6, 1.08 + rh / h * .45);
    // front porch along the side
    if (o.porch) { const p0 = S(.05, 0), p1 = S(.95, 0), pd = [m * -2, 14], hh = h * .42;
      g += `<path d="${poly([[p0[0], p0[1] - hh], [p1[0], p1[1] - hh], [p1[0] + pd[0], p1[1] - hh + pd[1] - 4], [p0[0] + pd[0], p0[1] - hh + pd[1] - 4]])}" fill="${mix(rf, "#000000", .1)}"/>`;
      for (let k = 0; k <= 5; k++) { const t = .05 + k * .18, P = S(t, 0); g += `<rect x="${F(P[0] + pd[0] - 1.2)}" y="${F(P[1] - hh + pd[1] - 4)}" width="2.4" height="${F(hh - pd[1] + 8)}" fill="${tr}"/>`; }
      g += `<path d="${line([[p0[0] + pd[0], p0[1] + pd[1] - 14], [p1[0] + pd[0], p1[1] + pd[1] - 14]])}" stroke="${tr}" stroke-width="1.6"/>`; }
    const ov = [m * 4, 3];
    g += `<path d="${poly([[A[0] + ov[0] * .3, A[1] - h + ov[1]], [C[0] + ov[0], C[1] - h + ov[1]], [R2[0] + ov[0], R2[1] - 1], [R1[0], R1[1] - 1]])}" fill="${rf}"/>`;
    for (let k = 1; k < 7; k++) { const t = k / 7, a = [A[0] + (R1[0] - A[0]) * t, (A[1] - h) + (R1[1] - (A[1] - h)) * t];
      g += `<path d="${line([a, [a[0] + C[0], a[1] + C[1]]])}" stroke="${mix(rf, "#000000", .3)}" stroke-width=".9" opacity=".7"/>`; }
    g += `<path d="${line([up(B, h), R1, up(A, h)])}" stroke="${tr}" stroke-width="2.6" fill="none" stroke-linejoin="round"/><path d="${line([R1, R2])}" stroke="${RIM}" stroke-width="1.6" opacity=".6"/>`;
    if (o.chim) { const t = o.chim, P = [R1[0] + (R2[0] - R1[0]) * t, R1[1] + (R2[1] - R1[1]) * t];
      g += `<path d="${poly([[P[0] - 5, P[1] + 4], [P[0] + 5, P[1] + 3], [P[0] + 5, P[1] - 18], [P[0] - 5, P[1] - 17]])}" fill="${T("#8a4a36")}"/><path d="${poly([[P[0] - 5, P[1] + 4], [P[0] - 1, P[1] + 3.6], [P[0] - 1, P[1] - 17.4], [P[0] - 5, P[1] - 17]])}" fill="#000" opacity=".25"/><rect x="${F(P[0] - 6)}" y="${F(P[1] - 20)}" width="12" height="3" fill="${T("#5a3426")}"/>`; }
    return g + `</g>`;
  };
  const shock = (x, y, h) => {
    const sd = LX < x ? -1 : 1;
    let g = `<path d="${blobP(x - sd * h * .7, y + 2, h * .8, h * .08, 7)}" fill="#000" opacity=".22"/>`;
    const w = h * .36, CS = ["#6a5024", "#8a6e30", "#a88a40", "#c8a456", "#e2c47a"];
    for (let k = 0; k < 40 + h * .3; k++) { const u = r(), bx = x - w + u * 2 * w + (r() - .5) * 4, tx = x + (bx - x) * .1, lit = ((bx - x) / w * sd * .5 + .5) * .85 + r() * .2;
      g += `<path d="M${F(bx)},${F(y)} Q${F((bx + tx) / 2)},${F(y - h * .5)} ${F(tx)},${F(y - h * .8)}" stroke="${T(CS[Math.min(4, Math.floor(lit * 5))])}" stroke-width="${F(1.6 + h * .012)}" fill="none"/>`; }
    for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (r() - .5) * 1.5;
      g += `<path d="M${F(x)},${F(y - h * .8)} q${F(Math.cos(a) * h * .06)},${F(Math.sin(a) * h * .1)} ${F(Math.cos(a) * h * .15)},${F(Math.sin(a) * h * .22)}" stroke="${T(r() < .5 ? "#c8a456" : "#e2c47a")}" stroke-width="1.6" fill="none"/>`; }
    return g + `<path d="M${F(x - w * .2)},${F(y - h * .66)} L${F(x + w * .2)},${F(y - h * .68)}" stroke="${T("#5a3a1a")}" stroke-width="${F(1.5 + h * .02)}"/>`;
  };
  const pumpkin = (x, y, R, col) => { const sd = LX < x ? -1 : 1, c = col || "#d8641c";
    let g = `<ellipse cx="${F(x - sd * R * .6)}" cy="${F(y + 1)}" rx="${F(R * 1.6)}" ry="${F(R * .25)}" fill="#000" opacity=".22"/>`;
    g += `<ellipse cx="${F(x)}" cy="${F(y - R * .7)}" rx="${F(R * 1.15)}" ry="${F(R * .78)}" fill="${T(mix(c, "#5a1a08", .3))}"/>`;
    g += `<ellipse cx="${F(x + sd * R * .2)}" cy="${F(y - R * .74)}" rx="${F(R * .7)}" ry="${F(R * .72)}" fill="${T(c)}"/>`;
    g += `<ellipse cx="${F(x + sd * R * .42)}" cy="${F(y - R * .9)}" rx="${F(R * .28)}" ry="${F(R * .4)}" fill="${T(mix(c, "#fff0c0", .4))}"/>`;
    g += `<path d="M${F(x - R * .4)},${F(y - R * 1.4)} q${F(-R * .15)},${F(R * .7)} 0,${F(R * 1.3)} M${F(x + R * .4)},${F(y - R * 1.4)} q${F(R * .15)},${F(R * .7)} 0,${F(R * 1.3)}" stroke="${T(mix(c, "#5a1a08", .4))}" stroke-width="1.1" fill="none" opacity=".7"/>`;
    return g + `<path d="M${F(x)},${F(y - R * 1.44)} l${F(R * .12)},${F(-R * .4)}" stroke="${T("#4a5a22")}" stroke-width="${F(Math.max(1.5, R * .2))}" stroke-linecap="round"/>`; };
  const bale = (x, y, R) => { const sd = LX < x ? -1 : 1;
    let g = `<path d="${blobP(x - sd * R * 1.6, y + 2, R * 2, R * .2, 7)}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - R * 1.2)},${F(y - R * 1.8)} L${F(x + R * .4)},${F(y - R * 1.9)} L${F(x + R * .4)},${F(y)} L${F(x - R * 1.2)},${F(y)}Z" fill="${T("#b08a44")}"/>`;
    g += `<path d="M${F(x - R * 1.2)},${F(y - R * 1.8)} L${F(x + R * .4)},${F(y - R * 1.9)} L${F(x + R * .4)},${F(y - R * 1.3)} L${F(x - R * 1.2)},${F(y - R * 1.25)}Z" fill="${T(sd > 0 ? "#d8b466" : "#c8a456")}" opacity=".7"/>`;
    for (let k = 0; k < 8; k++) g += `<path d="M${F(x - R * 1.2)},${F(y - R * (.2 + k * .2))} L${F(x + R * .4)},${F(y - R * (.22 + k * .21))}" stroke="${T("#8a6a30")}" stroke-width="1" opacity=".5"/>`;
    const ex = x + R * .4;
    g += `<ellipse cx="${F(ex)}" cy="${F(y - R * .95)}" rx="${F(R * .62)}" ry="${F(R * .95)}" fill="${T(sd > 0 ? "#e2c070" : "#a8843e")}"/>`;
    for (let k = 1; k < 5; k++) g += `<ellipse cx="${F(ex + k * .4)}" cy="${F(y - R * .95)}" rx="${F(R * .62 * (1 - k * .2))}" ry="${F(R * .95 * (1 - k * .2))}" fill="none" stroke="${T("#8a6a30")}" stroke-width="1" opacity=".6"/>`;
    return g; };
  const turkey = (x, y, k, d, tom) => {
    let t = `<g transform="translate(${F(x)},${F(y)}) scale(${F(d * k)},${F(k)})"><ellipse cx="-8" cy="1" rx="22" ry="3" fill="#000" opacity=".22"/>`;
    if (tom) { for (let i = 0; i <= 12; i++) { const a = -Math.PI * (.12 + i / 12 * .76), L = 30, ax = -6 + Math.cos(a) * L, ay = -24 + Math.sin(a) * L, bx = -6 + Math.cos(a + .1) * L, by = -24 + Math.sin(a + .1) * L;
        t += `<path d="M-6,-24 L${F(ax)},${F(ay)} L${F(bx)},${F(by)}Z" fill="${T(i % 2 ? "#5a3a22" : "#6e4a2a")}"/>`;
        t += `<path d="M${F(-6 + Math.cos(a + .05) * L * .78)},${F(-24 + Math.sin(a + .05) * L * .78)} L${F(-6 + Math.cos(a + .05) * L * .9)},${F(-24 + Math.sin(a + .05) * L * .9)}" stroke="${T("#1e1410")}" stroke-width="3"/>`;
        t += `<path d="M${F(ax)},${F(ay)} L${F(bx)},${F(by)}" stroke="${T("#d8c49a")}" stroke-width="2.4"/>`; } }
    else t += `<path d="M-14,-22 Q-24,-20 -28,-12 L-22,-12 Q-18,-16 -12,-17Z" fill="${T("#4a3422")}"/>`;
    t += `<path d="M-1,-13 L-3,0 M5,-13 L6,0 M-3,0 l-3,1 M6,0 l3,1" stroke="${T("#c87a5a")}" stroke-width="1.6" fill="none"/>`;
    t += `<path d="M-16,-20 C-18,-34 4,-40 14,-29 C19,-21 10,-12 0,-12 C-8,-12 -15,-15 -16,-20Z" fill="${T("#2a2220")}"/>`;
    for (let i = 0; i < 9; i++) { const px = -10 + (i % 3) * 8 + (i > 5 ? 3 : 0), py = -30 + Math.floor(i / 3) * 6;
      t += `<path d="M${px - 3},${py} q3,3 6,0" stroke="${T(i % 2 ? "#8a6a3a" : "#a8844a")}" stroke-width="1.4" fill="none" opacity=".8"/>`; }
    t += `<path d="M-12,-26 C-4,-30 6,-28 8,-22 C2,-20 -6,-20 -12,-26Z" fill="${T("#3a2c22")}"/><path d="M-8,-24 l10,1 M-6,-22 l10,1" stroke="${T("#e8e0d0")}" stroke-width="1" opacity=".8"/>`;
    t += `<path d="M-14,-30 C-6,-38 6,-37 12,-31" stroke="${RIM}" stroke-width="1.4" fill="none" opacity=".6"/>`;
    t += `<path d="M11,-28 Q12,-38 15,-44" stroke="${T("#5a4a5a")}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="16" cy="-45" r="3.2" fill="${T("#a8c0d8")}"/><path d="M16,-43 q2,6 -1,9" stroke="${T("#c8302a")}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M19,-45 l4,1 l-4,1Z" fill="${T("#c8b080")}"/><circle cx="17" cy="-46" r=".8" fill="#000"/>`;
    if (tom) t += `<path d="M10,-26 l2,8" stroke="${T("#1a1410")}" stroke-width="1.6"/>`;
    return t + `</g>`; };

  /* ---------- far hills, mid farmland with hedgerows ---------- */
  const f1 = wave([1, 3, 2], [320, 140, 60], [16, 7, 3]), f2 = wave([4, 1, 5], [380, 160, 70], [12, 6, 2.5]);
  const far1 = x => 410 + f1(x), far2 = x => 432 + f2(x);
  s += `<path d="${ridgePath(far1)}" fill="url(#hfFar1)"/>`;
  s += `<g filter="url(#hfLeafyS)" opacity=".75">${hedge(far1, 1, 6, .7, -10, W + 10, .2)}</g>`;
  s += `<path d="${ridgePath(far2)}" fill="url(#hfFar2)"/>`;
  s += `<g filter="url(#hfLeafyS)" opacity=".85">${hedge(far2, 2, 7, .55, -10, W + 10, .15)}</g>`;
  s += `<rect x="0" y="390" width="${W}" height="90" fill="url(#hfHaze)"/>`;
  // a far white farm and a red barn on the hills, and a church spire far off
  [[420, far2(420) + 14, "#efe6d6"], [460, far2(460) + 16, "#9a3a2a"], [2240, far2(2240) + 12, "#efe6d6"]].forEach(([x, y, c]) => s += `<rect x="${x}" y="${F(y - 9)}" width="14" height="9" fill="${T(mix(c, HZ, .35))}"/><path d="M${x - 1},${F(y - 9)} l8,-6 l8,6Z" fill="${T(mix("#4a4048", HZ, .4))}"/>`);
  const m1 = wave([2, 5, 1], [300, 120, 50], [12, 5, 2]);
  const mid = x => 462 + m1(x);
  s += `<path d="${ridgePath(mid)}" fill="url(#hfMid)"/>`;
  // patchwork: winter wheat, plough, stubble strips following the swell, divided by hedgerows
  const strips = [[0, 300, "#8a9a5a"], [300, 620, "#a8885a"], [620, 980, "#c4a46a"], [980, 1400, "#7a8a50"], [1400, 1820, "#b08a5a"], [1820, 2200, "#c8a86a"], [2200, 2560, "#8a9658"]];
  strips.forEach(([a, b, c]) => { const cc = T(mix(c, HZ, .25)); let d = `M${a},${F(mid(a) + 6)}`; for (let x = a; x <= b; x += 16) d += ` L${x},${F(mid(x) + 6)}`; d += ` L${b},500 L${a},500Z`;
    s += `<path d="${d}" fill="${cc}"/>`;
    for (let k = 1; k < 6; k++) { let l = `M${a},${F(mid(a) + 6 + k * 6)}`; for (let x = a; x <= b; x += 32) l += ` L${x},${F(mid(x) + 6 + k * 6.4)}`; s += `<path d="${l}" stroke="${mix(cc, "#3a2a14", .2)}" stroke-width="1.2" fill="none" opacity=".5"/>`; } });
  let hr = ""; strips.forEach(([a]) => { if (a) for (let y = mid(a) + 2; y < 500; y += 7) hr += hedge(() => y, 1, 6, .25, a - 6, a + 6, .1); });
  hr += hedge(mid, 1, 9, .22, -10, W + 10, .14);
  s += `<g filter="url(#hfLeafyS)">${hr}</g>`;
  s += `<rect x="0" y="456" width="${W}" height="60" fill="url(#hfHaze)" opacity=".45"/>`;

  /* ---------- woodlot on the left, field edge ---------- */
  const edge = x => 506 + Math.sin(x / 210) * 4;
  s += `<path d="${ridgePath(x => edge(x) - 4)}" fill="url(#hfMeadow)"/>`;
  let wood = "";
  const wl = [];
  for (let x = -20; x < 940; x += 18 + r() * 26) wl.push([x, edge(x) - 2 - r() * 10, 90 + r() * 70 * (1 - x / 1600)]);
  for (let x = 1880; x < W + 20; x += 30 + r() * 40) wl.push([x, edge(x) - 2 - r() * 8, 70 + r() * 50]);
  wl.sort((a, b) => a[1] - b[1]);
  wl.forEach(([x, y, h]) => { const k = r();
    wood += k < .45 ? bareTree(x, y, h, { depth: 5, bark: k < .2 ? "#6a6a6a" : "#4a3a34", leaves: .25, ramp: RUSSET }) : k < .75 ? bareTree(x, y, h, { depth: 5, bark: "#3e2e24", leaves: .9, ramp: OAKBR }) : bareTree(x, y, h * .9, { depth: 4, bark: "#5a4a40", leaves: .5, ramp: RUSSET }); });
  s += `<g filter="url(#hfLeafyS)">${wood}</g>`;
  // the floor of the woodlot: fallen leaves and grass along the edge
  for (let x = 0; x < W; x += 3 + r() * 6) { const y = edge(x) - 4 + r() * 14, hh = 4 + r() * 8;
    s += `<path d="M${F(x)},${F(y)} q${F(-1 + r() * 2)},${F(-hh * .6)} ${F(-2 + r() * 4)},${F(-hh)}" stroke="${T(r() < .5 ? "#c8a868" : "#7a6438")}" stroke-width="1.5" fill="none" opacity=".8"/>`; }

  /* ---------- the farmstead ---------- */
  const fs = [];
  // silos
  const silo = (x, y, w, h, dome) => { let g = `<path d="${blobP(x - w * 1.2, y + 2, w * 1.4, 6, 7)}" fill="#000" opacity=".2"/>`;
    g += `<rect x="${F(x - w / 2)}" y="${F(y - h)}" width="${F(w)}" height="${F(h)}" fill="url(#hfSilo)"/>`;
    for (let k = 1; k < h / 10; k++) g += `<path d="M${F(x - w / 2)},${F(y - k * 10)} Q${F(x)},${F(y - k * 10 + 3)} ${F(x + w / 2)},${F(y - k * 10)}" stroke="${T("#5a564e")}" stroke-width=".9" fill="none" opacity=".45"/>`;
    for (let k = 1; k < 6; k++) g += `<path d="M${F(x - w / 2)},${F(y - k * h / 6)} Q${F(x)},${F(y - k * h / 6 + 4)} ${F(x + w / 2)},${F(y - k * h / 6)}" stroke="${T("#3a3a3a")}" stroke-width="1.6" fill="none" opacity=".6"/>`;
    g += `<rect x="${F(x - w * .32)}" y="${F(y - h)}" width="${F(w * .1)}" height="${F(h)}" fill="${T("#6a645a")}" opacity=".5"/>`;
    g += dome ? `<path d="M${F(x - w / 2 - 2)},${F(y - h)} Q${F(x - w / 2)},${F(y - h - w * .62)} ${F(x)},${F(y - h - w * .62)} Q${F(x + w / 2)},${F(y - h - w * .62)} ${F(x + w / 2 + 2)},${F(y - h)}Z" fill="url(#hfDome)"/><circle cx="${F(x)}" cy="${F(y - h - w * .62)}" r="3" fill="${T("#5a6068")}"/>`
      : `<path d="M${F(x - w / 2 - 3)},${F(y - h)} L${F(x)},${F(y - h - w * .45)} L${F(x + w / 2 + 3)},${F(y - h)}Z" fill="url(#hfDome)"/>`;
    return g + `<path d="M${F(x + w / 2 - 1)},${F(y - h)} L${F(x + w / 2 - 1)},${F(y)}" stroke="${RIM}" stroke-width="2" opacity=".6"/>`; };
  fs.push([500, () => silo(1050, 500, 50, 196, true) + silo(992, 502, 40, 150, false)]);
  // the bank barn, corner-on: long side faces us (in shade), gable end faces the sun
  fs.push([520, () => {
    const A = [1440, 522], BV = [128, -14], CV = [-330, -38], h = 124, rise = 92;
    const S = (u, v) => [A[0] + CV[0] * u, A[1] + CV[1] * u - h * (1 - .12 * u) * v];
    const G = (u, v) => [A[0] + BV[0] * u, A[1] + BV[1] * u - h * (1 - .05 * u) * v];
    const q = (f, u0, v0, u1, v1) => poly([f(u0, v0), f(u1, v0), f(u1, v1), f(u0, v1)]);
    const WALL = T("#a83628"), wS = mix(WALL, SHADE, .26), wG = mix(WALL, RIM, .22), TR = T("#efe6d4"), RF = T("#5a5e64");
    const gm = G(.5, 1); const R1 = [gm[0], gm[1] - rise], R2 = [R1[0] + CV[0] * .97, R1[1] + CV[1] + (h * .12 + rise * .1)];
    let g = `<path d="${poly([[A[0] + 30, A[1] + 4], [A[0] - 520, A[1] - 20], [A[0] - 600, A[1] + 22], [A[0] - 40, A[1] + 34]])}" fill="#000" opacity=".16" filter="url(#hfBlur)"/>`;
    // stone foundation (bank) then walls
    g += `<path d="${poly([S(0, 0), S(1, 0), S(1, 1), S(0, 1)])}" fill="${wS}"/><path d="${poly([G(0, 0), G(1, 0), G(1, 1), R1, G(0, 1)])}" fill="${wG}"/>`;
    for (let u = .01; u < 1; u += .012) g += `<path d="${line([S(u, .16), S(u, 1)])}" stroke="${mix(wS, r() < .5 ? "#000000" : "#ffffff", .08 + r() * .08)}" stroke-width="1.3"/>`;
    for (let u = .02; u < 1; u += .028) { const t0 = G(u, 1), top = u < .5 ? [t0[0], t0[1] - rise * u * 2] : [t0[0], t0[1] - rise * (1 - u) * 2];
      g += `<path d="${line([G(u, .16), top])}" stroke="${mix(wG, "#000000", .12 + r() * .08)}" stroke-width="1.2"/>`; }
    // fieldstone foundation band
    const STN = ["#8a8478", "#a09a8c", "#7a7266", "#b8b0a0", "#6e6a60"];
    g += `<path d="${q(S, 0, 0, 1, .16)}" fill="${T("#5a564e")}"/><path d="${q(G, 0, 0, 1, .16)}" fill="${T("#6a645a")}"/>`;
    for (let u = 0; u < 1; u += .02 + r() * .015) for (let v = .01; v < .15; v += .05) { const c = STN[Math.floor(r() * 5)];
      g += `<path d="${q(S, u + .002, v, u + .018 + r() * .01, v + .04)}" fill="${T(mix(c, SHADE, .2))}"/>`; }
    for (let u = 0; u < 1; u += .06 + r() * .03) for (let v = .01; v < .15; v += .05) g += `<path d="${q(G, u + .005, v, u + .05, v + .04)}" fill="${T(mix(STN[Math.floor(r() * 5)], RIM, .2))}"/>`;
    // big sliding doors with white X-bracing, hay door, windows
    const door = (u0, u1) => { let d = `<path d="${q(S, u0, .16, u1, .66)}" fill="${mix(wS, "#000000", .12)}"/>`;
      d += `<path d="${line([S(u0, .16), S(u1, .66)])} ${line([S(u1, .16), S(u0, .66)])} ${line([S(u0, .16), S(u0, .66), S(u1, .66), S(u1, .16), S(u0, .16)])}" stroke="${mix(TR, SHADE, .15)}" stroke-width="3" fill="none"/>`;
      return d; };
    g += door(.36, .5) + door(.5, .64);
    g += `<path d="${line([S(.33, .7), S(.67, .7)])}" stroke="${T("#3a3a3a")}" stroke-width="2.5"/>`;
    [.08, .18, .78, .9].forEach(u => { g += `<path d="${q(S, u - .025, .74, u + .025, .9)}" fill="${TR}"/><path d="${q(S, u - .02, .76, u + .02, .88)}" fill="${NIGHT && u === .78 ? LAMP : T("#2a2228")}"/>`; });
    g += `<path d="${q(G, .36, .72, .64, 1.1)}" fill="${mix(wG, "#000000", .2)}"/><path d="${line([G(.36, .72), G(.64, 1.1)])} ${line([G(.64, .72), G(.36, 1.1)])} ${line([G(.36, .72), G(.36, 1.1), G(.64, 1.1), G(.64, .72), G(.36, .72)])}" stroke="${TR}" stroke-width="2.6" fill="none"/>`;
    g += `<path d="${q(G, .3, .16, .7, .62)}" fill="${mix(wG, "#000000", .16)}"/><path d="${line([G(.3, .16), G(.7, .62)])} ${line([G(.7, .16), G(.3, .62)])} ${line([G(.3, .16), G(.3, .62), G(.7, .62), G(.7, .16)])}" stroke="${TR}" stroke-width="2.6" fill="none"/>`;
    // corner trim
    g += `<path d="${line([S(0, .16), S(0, 1)])} ${line([S(1, .16), S(1, 1)])} ${line([G(1, .16), G(1, 1)])}" stroke="${TR}" stroke-width="3"/>`;
    // roof: standing-seam metal, eave and rake trim, lit ridge
    const E0 = [S(0, 1)[0] + 6, S(0, 1)[1] + 4], E1 = [S(1, 1)[0] - 10, S(1, 1)[1] + 3];
    g += `<path d="${poly([E0, E1, [R2[0] - 10, R2[1] - 2], [R1[0] + 4, R1[1] - 3]])}" fill="${RF}"/>`;
    for (let t = .02; t < 1; t += .016) { const a = [E0[0] + (E1[0] - E0[0]) * t, E0[1] + (E1[1] - E0[1]) * t], b = [R1[0] + 4 + (R2[0] - 14 - R1[0]) * t, R1[1] - 3 + (R2[1] - R1[1] + 1) * t];
      g += `<path d="${line([a, b])}" stroke="${mix(RF, r() < .5 ? "#000000" : "#ffffff", .12)}" stroke-width="1.2" opacity=".8"/>`; }
    g += `<path d="${poly([E0, E1, [R2[0] - 10, R2[1] - 2], [R1[0] + 4, R1[1] - 3]])}" fill="${RIM}" opacity="${NIGHT ? .08 : .06}"/>`;
    g += `<path d="${line([[R1[0] + 4, R1[1] - 3], [R2[0] - 10, R2[1] - 2]])}" stroke="${RIM}" stroke-width="2.6" opacity=".75"/>`;
    g += `<path d="${line([[G(0, 1)[0] + 4, G(0, 1)[1] + 4], [R1[0], R1[1] - 4], [G(1, 1)[0] + 8, G(1, 1)[1] + 6]])}" stroke="${TR}" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
    g += `<path d="${line([E0, E1])}" stroke="${mix(TR, SHADE, .2)}" stroke-width="2.4"/>`;
    // cupola with weathervane
    const cp = [R1[0] + (R2[0] - R1[0]) * .45, R1[1] + (R2[1] - R1[1]) * .45 - 2];
    g += `<path d="${poly([[cp[0] - 14, cp[1] + 6], [cp[0] + 12, cp[1] + 4], [cp[0] + 12, cp[1] - 22], [cp[0] - 14, cp[1] - 20]])}" fill="${wS}"/><path d="${poly([[cp[0] + 4, cp[1] + 4.6], [cp[0] + 12, cp[1] + 4], [cp[0] + 12, cp[1] - 22], [cp[0] + 4, cp[1] - 21.4]])}" fill="${wG}"/>`;
    for (let k = 0; k < 4; k++) g += `<path d="M${F(cp[0] - 11)},${F(cp[1] - 16 + k * 4)} L${F(cp[0] + 2)},${F(cp[1] - 17 + k * 4)}" stroke="${TR}" stroke-width="1.4"/>`;
    g += `<path d="${poly([[cp[0] - 18, cp[1] - 19], [cp[0] - 1, cp[1] - 36], [cp[0] + 16, cp[1] - 21]])}" fill="${RF}"/><path d="M${F(cp[0] - 1)},${F(cp[1] - 36)} L${F(cp[0] + 16)},${F(cp[1] - 21)}" stroke="${RIM}" stroke-width="1.6" opacity=".7"/>`;
    g += `<path d="M${F(cp[0] - 1)},${F(cp[1] - 36)} v-16 M${F(cp[0] - 9)},${F(cp[1] - 44)} h16" stroke="${T("#2a2a2a")}" stroke-width="1.4"/><path d="M${F(cp[0] - 8)},${F(cp[1] - 50)} q4,-6 8,-2 l6,-4 l-2,6 q-6,4 -12,0Z" fill="${T("#2a2a2a")}"/>`;
    // lamp over the doors
    g += `<path d="${line([S(.5, .74), [S(.5, .74)[0], S(.5, .74)[1] + 6]])}" stroke="${T("#2a2a2a")}" stroke-width="2"/><path d="M${F(S(.5, .74)[0] - 7)},${F(S(.5, .74)[1] + 6)} h14 l-4,5 h-6Z" fill="${T("#3a3a3a")}"/>`;
    if (NIGHT) { const p = S(.5, .7); g += `<circle cx="${F(p[0])}" cy="${F(p[1] + 14)}" r="5" fill="#fff4c8"/><circle cx="${F(p[0])}" cy="${F(p[1] + 30)}" r="110" fill="url(#hfGlow)" opacity=".75"/>`; }
    return g; }]);
  // the farmhouse with a porch and chimney smoke
  fs.push([512, () => house(1796, 514, 1.12, { m: -1, wall: "#f2ece0", roof: "#3e4048", gw: 58, sw: 96, h: 64, rh: 36, wins: [.18, .45, .72, .9], chim: .72, shut: "#2a3a32", porch: true })]);
  fs.push([506, () => bareTree(1640, 506, 255, { depth: 7, bark: "#3a2a22", leaves: .14, ramp: OAKBR })]);
  // corn crib and a wagon of pumpkins
  fs.push([526, () => { let g = ""; const x = 1560, y = 530;
    g += `<path d="${poly([[x - 40, y], [x + 40, y - 6], [x + 40, y - 44], [x - 40, y - 40]])}" fill="${T("#7a5a3a")}"/>`;
    for (let k = 0; k < 9; k++) g += `<path d="M${x - 40},${F(y - 4 - k * 4)} L${x + 40},${F(y - 9 - k * 4.2)}" stroke="${T("#d8a838")}" stroke-width="2.4" opacity=".85"/>`;
    g += `<path d="${poly([[x - 46, y - 38], [x + 46, y - 46], [x + 40, y - 62], [x - 40, y - 54]])}" fill="${T("#4a4e54")}"/><path d="M${x - 46},${y - 38} L${x + 46},${y - 46}" stroke="${RIM}" stroke-width="1.4" opacity=".6"/>`;
    return g; }]);
  fs.push([546, () => { let g = ""; const x = 1280, y = 548;
    g += `<path d="${poly([[x - 70, y - 14], [x + 70, y - 22], [x + 70, y - 36], [x - 70, y - 28]])}" fill="${T("#8a6a44")}"/><path d="${poly([[x - 70, y - 28], [x + 70, y - 36], [x + 64, y - 40], [x - 64, y - 32]])}" fill="${T("#a8845a")}"/>`;
    for (let k = 0; k < 5; k++) g += `<path d="M${x - 70},${F(y - 16 - k * 3)} L${x + 70},${F(y - 24 - k * 3)}" stroke="${T("#5a4228")}" stroke-width=".8" opacity=".6"/>`;
    [[x - 46, y - 4], [x + 44, y - 12]].forEach(([wx, wy]) => { g += `<circle cx="${wx}" cy="${wy}" r="13" fill="none" stroke="${T("#3a2a20")}" stroke-width="3"/><circle cx="${wx}" cy="${wy}" r="2.5" fill="${T("#3a2a20")}"/>`; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI; g += `<path d="M${F(wx - Math.cos(a) * 12)},${F(wy - Math.sin(a) * 12)} L${F(wx + Math.cos(a) * 12)},${F(wy + Math.sin(a) * 12)}" stroke="${T("#3a2a20")}" stroke-width="1.2"/>`; } });
    g += `<path d="M${x - 70},${y - 22} L${x - 110},${y - 10}" stroke="${T("#3a2a20")}" stroke-width="3"/>`;
    [[x - 50, y - 34, 9], [x - 30, y - 37, 10, "#e88a2a"], [x - 8, y - 38, 9], [x + 14, y - 40, 11], [x + 36, y - 43, 8, "#e8c048"], [x + 54, y - 44, 9], [x - 38, y - 46, 7, "#f2ecd8"], [x - 12, y - 49, 8], [x + 24, y - 51, 7, "#4a6a3a"]].forEach(([px, py, R, c]) => g += pumpkin(px, py, R, c));
    return g; }]);
  fs.push([536, () => { let g = ""; [[1188, 536, 9], [1206, 540, 7, "#f2ecd8"], [1222, 538, 10], [1170, 542, 6, "#e8c048"]].forEach(([x, y, R, c]) => g += pumpkin(x, y, R, c)); return g; }]);
  fs.sort((a, b) => a[0] - b[0]);
  fs.forEach(([, f]) => s += f());
  s += `<g class="smoke" filter="url(#hfLeafyS)">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<path d="${blobP(1832 - k * 10 + Math.sin(k * 1.2) * 4, 374 - k * 15, 4 + k * 2.4, 3 + k * 1.7, 7, rs)}" fill="${NIGHT ? "#8a94b4" : "#e8e2dc"}" opacity="${F(.6 - k * .07)}"/>`).join("")}</g>`;

  /* ---------- turkeys along the field edge ---------- */
  if (!NIGHT) [[420, 520, .9, 1, false], [486, 524, 1.05, 1, true], [560, 518, .85, -1, false], [636, 526, 1, -1, false], [700, 520, .8, 1, false], [2010, 526, .95, -1, true], [2080, 522, .8, -1, false]].forEach(([x, y, k, d, tom]) => s += turkey(x, y, k, d, tom));

  /* ---------- the cut cornfield: stubble rows running toward the barn ---------- */
  const VP = [1300, 436], FT = 532;
  s += `<path d="M0,${FT} L${W},${FT} L${W},${H} L0,${H}Z" fill="url(#hfField)"/>`;
  s += `<path d="M0,${FT} L${W},${FT}" stroke="${T("#8a8448")}" stroke-width="6" opacity=".7"/>`;
  const rowsX = []; for (let k = -40; k <= 40; k++) rowsX.push(VP[0] + k * 92);
  const at = (xb, y) => VP[0] + (xb - VP[0]) * (y - VP[1]) / (H - VP[1]);
  rowsX.forEach((xb, i) => { if (i === rowsX.length - 1) return; const xb2 = rowsX[i + 1];
    s += `<path d="${poly([[at(xb, FT), FT], [at(xb2, FT), FT], [xb2, H], [xb, H]])}" fill="${T(i % 2 ? "#8a6a42" : "#7a5c38")}" opacity=".55"/>`; });
  let stub = "";
  rowsX.forEach(xb => { for (let y = FT + 2; y < H; y += 2 + (y - FT) * .05) { const x = at(xb, y) + (r() - .5) * 3, k = (y - VP[1]) / (H - VP[1]), hh = 4 + k * 14;
    if (x < -10 || x > W + 10) continue;
    stub += `<path d="M${F(x)},${F(y)} l${F((r() - .5) * hh * .4)},${F(-hh)}" stroke="${T(r() < .5 ? "#d8b878" : "#a88a52")}" stroke-width="${F(1 + k * 1.6)}" stroke-linecap="round"/>`;
    if (r() < .25) stub += `<path d="M${F(x)},${F(y - hh * .7)} q${F(hh * .5)},${F(-hh * .2)} ${F(hh * .8)},${F(hh * .4)}" stroke="${T("#c8a868")}" stroke-width="${F(.8 + k)}" fill="none"/>`; } });
  s += stub;
  // corn shocks standing in the stubble, round bales on the mown ground to the right
  const sh = [[180, 560, 70], [340, 548, 58], [700, 552, 62], [880, 590, 84], [560, 620, 100], [160, 690, 120], [1000, 548, 52], [2260, 590, 90], [2440, 650, 112]];
  const bl = [[1960, 556, 16], [2080, 568, 19], [2180, 552, 15], [2320, 560, 18]];
  [...sh.map(p => [p[1], () => shock(...p)]), ...bl.map(p => [p[1], () => bale(...p)])].sort((a, b) => a[0] - b[0]).forEach(([, f]) => s += f());
  // the lane up to the barn
  s += `<path d="M1240,${H} C1260,660 1340,600 1300,560 C1290,550 1300,544 1310,538 L1330,538 C1324,546 1318,552 1330,562 C1380,610 1320,670 1350,${H}Z" fill="${T("#b89a70")}"/>`;
  for (let i = 0; i < 70; i++) { const y = 540 + r() * 180, t = (y - 540) / 180, x = 1310 + Math.sin(t * 3) * 20 + (r() - .5) * (14 + t * 70);
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(1 + t * 2.5)}" ry="${F(.8 + t)}" fill="${T(r() < .5 ? "#7a6448" : "#e0ccaa")}" opacity=".6"/>`; }
  // fence posts with wire along the lane
  for (let k = 0; k < 9; k++) { const t = k / 8, y = 540 + t * t * 180, x = 1360 + t * 40 + Math.sin(t * 3) * 20, hh = 14 + t * 46;
    s += `<rect x="${F(x)}" y="${F(y - hh)}" width="${F(2 + t * 4)}" height="${F(hh)}" fill="${T("#5a4430")}"/><rect x="${F(x + 1 + t * 2)}" y="${F(y - hh)}" width="${F(1 + t * 2)}" height="${F(hh)}" fill="${RIM}" opacity=".35"/>`; }

  /* ---------- foreground: seed-heads, milkweed, dried grass in the corners ---------- */
  for (let x = 0; x < W; x += 6 + r() * 12) { if (x > 840 && x < 1860) continue; const y = 640 + r() * 90, hh = 16 + r() * 34;
    s += `<path d="M${F(x)},${F(y)} q${F(-3 + r() * 6)},${F(-hh * .6)} ${F(-6 + r() * 12)},${F(-hh)}" stroke="${T(r() < .5 ? "#d8c088" : "#8a7044")}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`;
    if (r() < .12) { const tx = x - 3 + r() * 6, ty = y - hh; for (let k = 0; k < 8; k++) s += `<circle cx="${F(tx + (r() - .5) * 10)}" cy="${F(ty - r() * 8)}" r="${F(1.4 + r() * 1.4)}" fill="${T(r() < .5 ? "#c8b080" : "#8a6a3a")}"/>`; } }
  [[90, 694, 90], [2470, 700, 100]].forEach(([x, y, R]) => {
    let b = `<path d="${blobP(x + 6, y + 6, R, R * .6)}" fill="${T("#2a1a10")}"/>`; const cs = [];
    for (let i = 0; i < 260 && cs.length < 90; i++) { const px = x + (r() * 2 - 1) * R, py = y + (r() * 2 - 1) * R * .6; if (((px - x) / R) ** 2 + ((py - y) / (R * .6)) ** 2 > 1) continue;
      const lit = ((LX < x ? -1 : 1) * (px - x) / R * .5 - (py - y) / (R * .6) * .6) * .5 + .5; cs.push([px, py, cl(lit * .85 + (r() - .5) * .3)]); }
    cs.sort((a, b2) => a[2] - b2[2]);
    cs.forEach(([px, py, v]) => b += `<path d="${blobP(px, py, R * .14, R * .1, 6)}" fill="${T(RUSSET[Math.floor(v * 8)])}"/>`);
    s += `<g filter="url(#hfLeafyS)">${b}</g>`; });

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#hfLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".12"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#hfPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
