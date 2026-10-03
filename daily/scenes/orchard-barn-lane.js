/* Orchard Barn Lane: an Ohio apple orchard in early October. A mown grass lane
   runs between rows of fruit-laden apple trees to a red barn and a concrete
   silo on a low knoll, with a farm stand, bins of picked apples, a white
   farmhouse under a sugar maple, hedgerows and wooded hills behind.
   opts.time === "night": a clear moonless night; Saturn (at opposition) burns
   gold above the barn with the Milky Way faint behind it, lit windows, a yard
   lamp over the barn door.
   Same shape as reference/autumn-valley.js. Needs rng(), mix() and world3d()
   from reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".    */
function orchardBarnLaneArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 2104;
  const r = rng(seed), rs = rng(seed + 7), rl = rng(seed + 13);   // land / sky / night-only streams
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const WY = 440, LX = NIGHT ? 1060 : 1010, LY = NIGHT ? 172 : 118;
  const T = c => NIGHT ? mix(mix(c, "#7a7a8a", .4), "#0c1434", .6) : c;
  const RIM = NIGHT ? "#b8c4e8" : "#fff0c8", LAMP = "#ffc868";
  const cl = v => Math.max(0, Math.min(.999, v));
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
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
  const ridgePath = (fn, close = H) => { let d = `M0,${close} L0,${F(fn(0))}`;
    for (let x = 0; x <= W; x += 16) d += ` L${x},${F(fn(x))}`; return d + ` L${W},${F(fn(W))} L${W},${close}Z`; };

  const SKY_H = NIGHT ? "#2e3c66" : "#f0dcb0", HZ = NIGHT ? "#2c3a62" : "#e6dcc0";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040818"/><stop offset=".45" stop-color="#0b1434"/><stop offset=".82" stop-color="#1c2a54"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#3a7cc4"/><stop offset=".45" stop-color="#84b6de"/><stop offset=".8" stop-color="#d8dcc8"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#ffe2a0" stop-opacity=".16"/><stop offset=".2" stop-color="#c8c0a0" stop-opacity=".05"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d6" stop-opacity=".9"/><stop offset=".18" stop-color="#ffefc0" stop-opacity=".45"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/>`;
  const g2 = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="obdefs">
    <linearGradient id="obSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="obLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 300 : 820}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="obHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".65"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    ${g2("obFar1", NIGHT ? "#1e2850" : "#a4b2c8", NIGHT ? "#253158" : "#c0c6c4")}
    ${g2("obFar2", NIGHT ? "#1a244a" : "#93a3b4", NIGHT ? "#222e56" : "#b0b8ac")}
    <radialGradient id="obGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="obSat"><stop offset="0" stop-color="#fff0c0" stop-opacity=".9"/><stop offset=".25" stop-color="#ffe0a0" stop-opacity=".3"/><stop offset="1" stop-color="#ffe0a0" stop-opacity="0"/></radialGradient>
    <filter id="obLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="obLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="obCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="32" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="obPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="obSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="obMW"><feGaussianBlur stdDeviation="38"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#obSky)"/>`;

  /* sun, or a moonless night with stars, the Milky Way and Saturn */
  if (NIGHT) {
    s += `<g filter="url(#obMW)" opacity=".1"><ellipse cx="1640" cy="90" rx="520" ry="110" fill="#c8d0f0" transform="rotate(42 1640 90)"/></g>`;
    for (let i = 0; i < 520; i++) { const x = rs() * W, y = Math.pow(rs(), 1.4) * 430, big = rs() < .07, o = .2 + rs() * .6 * (1 - y / 480);
      if (Math.hypot(x - LX, y - LY) < 40) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.6 : F(.5 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    for (let i = 0; i < 260; i++) { const t = rs(), x = 1340 + t * 520 + (rs() - .5) * 200, y = -60 + t * 420;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(.4 + rs() * .5)}" fill="#e8ecff" opacity="${F(.15 + rs() * .3)}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#obLight)"/><circle cx="${LX}" cy="${LY}" r="26" fill="url(#obSat)"/>`;
    s += `<circle cx="${LX}" cy="${LY}" r="3.4" fill="#fff2cc"/><ellipse cx="${LX}" cy="${LY}" rx="6.5" ry="1.6" fill="none" stroke="#ffe6b0" stroke-width=".8" opacity=".55" transform="rotate(-18 ${LX} ${LY})"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#obLight)"/><circle cx="${LX}" cy="${LY}" r="40" fill="#fffbe8"/>`;
    s += `<g class="rays" opacity=".1" filter="url(#obSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .45 + k * .32, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: fair-weather cumulus by day, a few thin strata by night */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#obCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#141c3a"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#1c2648"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="#34406a" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .14 * (.6 + rs() * .7), w * (.085 + rs() * .07)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .07)}" fill="#bcc8da"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#c9d2e0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .85)}" fill="#f7f6f2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .35)}" rx="${F(R * .6)}" ry="${F(R * .4)}" fill="#fffbea"/>`);
    }
    return c + `</g></g>`;
  };
  s += NIGHT
    ? cloud(420, 300, 520, "drift1") + cloud(2200, 330, 460, "drift2")
    : cloud(430, 190, 420, "drift1") + cloud(1900, 120, 500, "drift2") + cloud(2330, 250, 300, "drift3") + cloud(190, 290, 220, "drift2") + cloud(1560, 300, 180, "drift3");
  /* geese heading south in a ragged V (day) */
  if (!NIGHT) {
    s += `<g class="birds" stroke-linecap="round">`;
    [[0, 0], [-1, 1], [-2, 2.1], [-3, 3], [1, 1.1], [2, 2], [3, 3.2], [4, 4.1], [-4, 4.2]].forEach(([i, j]) => {
      const x = 1330 + i * 20 + (rs() - .5) * 4, y = 120 + j * 10 + (rs() - .5) * 3, k = .9 + rs() * .2, fl = rs() < .5 ? 1 : -.4;
      s += `<path d="M${F(x - 9 * k)},${F(y - 1)} q${F(4 * k)},${F(-5 * k * fl)} ${F(9 * k)},${F(1)} q${F(5 * k)},${F(-5 * k * fl)} ${F(9 * k)},${F(-1)}" stroke="#3a3632" stroke-width="${F(2.2 * k)}" fill="none"/>`;
      s += `<path d="M${F(x)},${F(y)} l${F(-4 * k)},${F(-1.5 * k)}" stroke="#2a2622" stroke-width="${F(1.6 * k)}"/>`; });
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ---------- far hills (2D, beyond the modelled land) ---------- */
  const AUT = ["#8a4a24", "#a8642a", "#c08a3a", "#6a7a34", "#7e8a3c", "#9a5a28", "#5a6a30", "#b07a30"];
  const forest = (fn, rows, size, haze, x0 = -10, x1 = W + 10) => {
    let f = ""; const trees = [];
    for (let row = 0; row < rows; row++) for (let x = x0; x < x1; x += size * (.9 + r() * .5)) {
      const y = fn(x) + row * size * .72 + size * .4 + r() * size * .3, sz = size * (.75 + r() * .45);
      trees.push([x + r() * size * .4, y, sz]); }
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(([x, y, sz]) => {
      const lsd = x < LX ? 1 : -1, c = T(mix(AUT[Math.floor(r() * AUT.length)], HZ, haze)), dk = mix(c, NIGHT ? "#050814" : "#2a1a10", .36), lt = mix(c, RIM, NIGHT ? .15 : .3);
      f += `<path d="${blobP(x - lsd * sz * .12, y + sz * .1, sz * .95, sz * .8, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz * .08, sz * .85, sz * .72, 7)}" fill="${c}"/><path d="${blobP(x + lsd * sz * .25, y - sz * .35, sz * .42, sz * .3, 6)}" fill="${lt}"/>`;
    });
    return f;
  };
  const f1 = wave([1, 3, 5], [300, 130, 55], [12, 6, 2.5]), f2 = wave([4, 2, 0], [360, 150, 60], [9, 4, 2]);
  const farA = x => 396 + f1(x) + Math.max(0, Math.abs(x - 1300) - 500) * -.012, farB = x => 412 + f2(x);
  s += `<path d="${ridgePath(farA)}" fill="url(#obFar1)"/><g filter="url(#obLeafyS)" opacity=".7">${forest(farA, 1, 6, .72)}</g>`;
  s += `<path d="${ridgePath(farB)}" fill="url(#obFar2)"/><g filter="url(#obLeafyS)" opacity=".85">${forest(farB, 1, 7, .58)}</g>`;
  s += `<rect x="0" y="380" width="${W}" height="70" fill="url(#obHaze)" opacity=".75"/>`;

  /* ================= the 3D world =================
     Eye 3 m above the lane, horizon on WY; metres, x right, y up, z away. The
     orchard rows run straight away from us, so they converge on the centre. */
  const w = world3d({ h: 4.2, hy: WY, f: 2200, light: [-.55, .62, -.3], tone: T, fog: HZ, fogK: .0011,
    shadow: NIGHT ? "#04060e" : "#34304a", rim: RIM, shade: .5, hi: .22, night: NIGHT, lamp: LAMP });
  const n2 = (x, z) => Math.sin(x / 23 + 1.3) * Math.sin(z / 31 + .7) + .5 * Math.sin(x / 9.7 + z / 13.1 + 2) + .25 * Math.sin(x / 4.1 - z / 5.3);
  const face = (x, z) => Math.atan2(-x, z) * 180 / Math.PI;
  const BX = -3, BZ = 118;                                          // the barn on its knoll
  const hT = (x, z) => .5 * Math.sin(x / 41 + 1) * Math.sin(z / 57) + .25 * n2(x * .5, z * .5)
    + 2.2 * Math.exp(-((x - BX) ** 2 + (z - BZ) ** 2) / 1800)
    + 30 * sm((z - 420) / 760) * (.55 + .45 * Math.sin(x / 190 + .4)) + 6 * sm((z - 300) / 300) * Math.max(0, Math.sin(x / 70 - 1));
  const ROWS = []; for (let k = 0; k < 9; k++) ROWS.push(6 + k * 6, -6 - k * 6);
  const ORCH = z => z > 14 && z < 330;
  const inYard = (x, z) => Math.hypot((x - BX) * .8, z - BZ) < 26 || (x < -22 && x > -52 && z > 170 && z < 215);
  const GRASS = ["#7e9038", "#8a9a3e", "#96a444", "#a2aa4a", "#869a3c"], FIELD = ["#c8a85a", "#b89a4c", "#d4b468", "#a89048"];
  const WOOD = ["#5a5a28", "#6a4a24", "#7a5a2a", "#4e5a26", "#8a6a30"];
  w.terrain({ x0: z => -z * .62 - 30, x1: z => z * .62 + 30, z0: 14, z1: 1500, nx: 130, nz: 80, h: hT, shade: .3,
    col: (x, y, z, n) => { const k = cl(.5 + .3 * n2(x * 1.7 + 40, z * 1.3) + (r() - .5) * .12);
      if (z > 640) return mix(WOOD[Math.floor(k * WOOD.length)], "#6a6a34", .3);                                    // wooded hills
      if (z > 340) { const fld = Math.floor(x / 90 + n2(x * .1, z * .1) * .3) + Math.floor(z / 120);                // patchwork fields
        return Math.abs(fld) % 3 === 0 ? mix(GRASS[Math.floor(k * 5)], "#9aa048", .3) : FIELD[Math.floor(k * FIELD.length)]; }
      let c = mix(GRASS[Math.floor(k * GRASS.length)], GRASS[Math.min(4, Math.floor(k * GRASS.length) + 1)], .5);
      const dr = Math.min(...ROWS.map(rx => Math.abs(x - rx)));
      if (ORCH(z) && Math.abs(x) < 60) c = mix(c, mix("#5e6e2c", "#6e6a30", k), sm(1 - dr / 2.6) * .6 * sm((330 - z) / 40));   // shade under the rows
      if (inYard(x, z)) c = mix(c, mix("#a49a5e", "#8a8a48", k), .7);                                               // trodden yard
      const lw = sm((3.4 - Math.abs(x)) / 1.4) * sm((104 - z) / 8);                                                  // mown lane, soft edges
      return mix(c, mix("#a2b05a", "#b4b866", .5 + .25 * Math.sin(z / 2.2)), lw * .8); } });

  const ok = [];
  const free = (x, z, R) => ok.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);
  const onGround = (o) => { const { P } = w.frame({ ...o, y: 0 }), c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => P([a * o.w / 2, 0, b * o.d / 2]));
    const hs = c.map(p => hT(p[0], p[2])), top = Math.max(...hs), low = Math.min(...hs);
    return { ...o, y: top, fy: low - top - .3 }; };

  /* ---- apple tree: short crooked trunk, wide crown of many lit leaf clumps, red fruit ---- */
  const LEAF = ["#1e3018", "#2a421e", "#385624", "#4a6a2a", "#5e8030", "#76963a", "#98ae4a", "#c4c46c"];
  const AUTL = ["#3a2010", "#5a3214", "#7a4a1a", "#9a6420", "#b88028", "#d09c34", "#e4ba4a", "#f4d878"];
  const MAPLE = ["#4a1810", "#6e2216", "#94301c", "#b8401e", "#d65a22", "#ea7a2a", "#f4a03a", "#fcc860"];
  const crownTree = (x, y, h, RAMP, o = {}) => {
    let g = "";
    const wide = o.wide || 1, cx = x, cy = y - h * (o.cy || .6), rx = h * .42 * wide, ry = h * .3 * (o.tall || 1);
    const dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, sd = ux > 0 ? 1 : -1;
    g += `<ellipse cx="${F(x - ux * h * .18)}" cy="${F(y + h * .01)}" rx="${F(h * .55 * wide)}" ry="${F(h * .06)}" fill="${NIGHT ? "#02040c" : "#22260c"}" opacity=".3"/>`;
    const tb = h * .055, tt = h * .03, ty = cy + ry * .3, tc = T(mix(o.trunk || "#4a3424", HZ, o.fog || 0));
    g += `<path d="M${F(x - tb)},${F(y)} C${F(x - tb * .5)},${F(y - h * .15)} ${F(x - tt * 2)},${F(ty + h * .1)} ${F(x - tt)},${F(ty)} L${F(x + tt)},${F(ty)} C${F(x + tt * 1.6)},${F(ty + h * .12)} ${F(x + tb * .8)},${F(y - h * .12)} ${F(x + tb)},${F(y)}Z" fill="${tc}"/>`;
    g += `<path d="M${F(x + sd * tb * .55)},${F(y)} Q${F(x + sd * tt * 1.4)},${F(y - h * .14)} ${F(x + sd * tt * .7)},${F(ty)}" stroke="${mix(tc, RIM, NIGHT ? .12 : .35)}" stroke-width="${F(Math.max(1, tb * .4))}" fill="none"/>`;
    [[-1, .3, .14], [1, .26, .12], [0, .34, .02]].forEach(([d, dx, dy]) => g += `<path d="M${F(x)},${F(ty + 2)} Q${F(x + d * h * dx * .5)},${F(ty - h * dy - h * .05)} ${F(x + d * h * dx)},${F(ty - h * (.12 + dy))}" stroke="${tc}" stroke-width="${F(h * .028)}" fill="none" stroke-linecap="round"/>`);
    const crown = [[cx, cy, rx, ry * .85], [cx - rx * .55, cy + ry * .25, rx * .55, ry * .55], [cx + rx * .55, cy + ry * .2, rx * .55, ry * .6], [cx - rx * .15, cy - ry * .5, rx * .55, ry * .5], [cx + rx * .3, cy - ry * .4, rx * .45, ry * .45]];
    const inC = (px, py) => crown.some(([a, b, c, d]) => ((px - a) / c) ** 2 + ((py - b) / d) ** 2 < 1);
    const n = o.n, cs = [];
    for (let i = 0; i < n * 3 && cs.length < n; i++) { const px = cx - rx * 1.2 + r() * rx * 2.4, py = cy - ry * 1.3 + r() * ry * 2.3;
      if (!inC(px, py)) continue;
      const nx = (px - cx) / (rx * 1.15), ny = (py - cy) / (ry * 1.15), lit = (nx * ux + ny * uy) * .5 + .5, edge = Math.min(1, Math.hypot(nx, ny));
      cs.push([px, py, cl(lit * .7 + edge * .15 + (r() - .5) * .3), h * (.035 + r() * .03)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = `<path d="${blobP(cx, cy + ry * .1, rx * 1.02, ry * .95, 9)}" fill="${T(RAMP[1])}"/>`;
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${T(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    g += `<g filter="url(#obLeafy)">${cg}</g>`;
    if (o.apples) { const na = Math.round(h * o.apples), ar = Math.max(1, h * .013);
      for (let i = 0, m = 0; i < na * 4 && m < na; i++) { const px = cx - rx + r() * rx * 2, py = cy - ry * .6 + r() * ry * 1.6;
        if (!inC(px, py) || ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 > .95) continue; m++;
        const lt = ((px - cx) * ux + (py - cy) * uy) > 0, c = T(mix(r() < .25 ? "#c8402a" : "#b02a22", HZ, o.fog || 0));
        g += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(ar * (.85 + r() * .3))}" fill="${lt ? c : mix(c, "#2a0a08", .35)}"/>`;
        if (lt && ar > 2) g += `<circle cx="${F(px + ux * ar * .35)}" cy="${F(py + uy * ar * .35)}" r="${F(ar * .35)}" fill="${T("#f4b08a")}" opacity=".8"/>`; }
      if (h > 90) for (let i = 0; i < h * .06; i++) { const px = x + (r() - .5) * h * .7, py = y + (r() - .3) * h * .04;   // windfalls in the grass
        g += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(ar)}" ry="${F(ar * .8)}" fill="${T(r() < .5 ? "#a02a20" : "#8a3a1a")}"/>`; } }
    return g;
  };
  /* small far tree as three lit blobs */
  const farTree = (sx, sy, hp, ramp, fog) => { const sd = LX < sx ? -1 : 1, Rf = ramp.map(c => mix(c, HZ, fog));
    return `<rect x="${F(sx - hp * .03)}" y="${F(sy - hp * .4)}" width="${F(hp * .06)}" height="${F(hp * .4)}" fill="${T(mix("#3e2a1c", HZ, fog))}"/>` +
      `<path d="${blobP(sx, sy - hp * .55, hp * .4, hp * .3, 7)}" fill="${T(Rf[2])}"/><path d="${blobP(sx + sd * hp * .06, sy - hp * .6, hp * .32, hp * .24, 7)}" fill="${T(Rf[4])}"/><path d="${blobP(sx + sd * hp * .14, sy - hp * .7, hp * .16, hp * .11, 6)}" fill="${T(Rf[6])}"/>`; };
  const appleTree = (x, z) => { const hM = 3.4 + r() * .9, wide = 1 + r() * .25, yel = r() * .35, ramp = LEAF.map((c, i) => mix(c, AUTL[i], yel));
    w.sprite({ x, z, y: hT(x, z) - .1, fn: (sx, sy, k, fog) => { const hp = hM * k, Rf = ramp.map(c => mix(c, HZ, fog * .9));
      if (hp < 34) return farTree(sx, sy, hp, Rf, 0);
      return crownTree(sx, sy, hp, Rf, { wide, n: Math.min(150, Math.round(hp * .7)), apples: hp > 50 ? .1 : 0, fog: fog * .9 }); } }); };
  const shadeTree = (x, z, hM, RAMP) => w.sprite({ x, z, y: hT(x, z) - .2, fn: (sx, sy, k, fog) => { const hp = hM * k, Rf = RAMP.map(c => mix(c, HZ, fog * .9));
    if (hp < 34) return farTree(sx, sy, hp, Rf, 0);
    return crownTree(sx, sy, hp, Rf, { wide: .75, tall: 1.5, cy: .58, n: Math.min(220, Math.round(hp * .9)), fog: fog * .9, trunk: "#3e2a1c" }); } });

  /* ---- the barn, gable end to us, a big sliding door and a loft door ---- */
  const barn = onGround({ x: BX, z: BZ, yaw: -8, w: 12, d: 20, h: 6.6, rh: 5.4, gable: true });
  w.house({ ...barn, wall: "#a8322a", roof: "#4a4650", trim: "#f2ece0", door: false, chim: undefined, rng: rl, clap: true,
    win: (u, ri, n) => n !== "front" && ri === 0 && (u > .2 && u < .8),
    extra: (n, q, len) => { if (n !== "front") return; const c = len / 2;
      q(c - 2.5, 0, c + 2.5, 4.6, "#f2ece0", { off: .06 });
      q(c - 2.3, 0, c - .05, 4.4, "#7e2420", { off: .08 }); q(c + .05, 0, c + 2.3, 4.4, "#7e2420", { off: .08 });
      q(c - 2.3, 2.1, c + 2.3, 2.35, "#f2ece0", { off: .09 });
      [-1.2, 1.2].forEach(d => q(c + d - .1, .1, c + d + .1, 4.3, "#f2ece0", { off: .09 }));
      q(c - .3, 4.85, c + .3, 5.15, NIGHT ? LAMP : "#3a3a40", { off: .1, glow: NIGHT });
      q(c - 2.5, 4.55, c + 2.5, 4.75, "#5a4a3a", { off: .1 }); } });
  ok.push([BX, BZ, 12]);
  /* concrete stave silo with a metal dome, hoops on the side toward us */
  const SX = 9.6, SZ = 112, sy0 = hT(SX, SZ) - .3, aS = Math.atan2(-SZ, -SX);
  w.cyl({ x: SX, z: SZ, y: sy0, r0: 2.7, h: 15.5, n: 30, c: "#c4bcac" });
  w.cyl({ x: SX, z: SZ, y: sy0 + 15.5, r0: 2.85, r1: .35, h: 2.6, n: 30, c: "#8e9aa4" });
  w.cyl({ x: SX, z: SZ, y: sy0 + 18.1, r0: .4, r1: .15, h: .5, n: 10, c: "#6a747c" });
  for (let y = 1.4; y < 15.4; y += 1.25) { const arc = []; for (let i = 0; i <= 16; i++) { const a = aS - Math.PI / 2 + i / 16 * Math.PI; arc.push([SX + Math.cos(a) * 2.73, sy0 + y, SZ + Math.sin(a) * 2.73]); }
    w.line(arc, "#8a8274", .05, { bias: -.6, op: .7 }); }
  { const ch = [[SX + Math.cos(aS + .5) * 2.75, sy0 + .5, SZ + Math.sin(aS + .5) * 2.75], [SX + Math.cos(aS + .5) * 2.75, sy0 + 15.3, SZ + Math.sin(aS + .5) * 2.75]];
    w.line(ch, "#8a8276", .3, { bias: -.7 }); }
  ok.push([SX, SZ, 4]);
  /* yard lamp on a pole between the barn and silo */
  { const lx = 4.2, lz = 104, ly = hT(lx, lz);
    w.box({ x: lx, z: lz, y: ly, w: .2, d: .2, h: 6.2, c: "#4a3a2a" });
    w.box({ x: lx + .3, z: lz, y: ly + 6, w: .7, d: .35, h: .2, c: "#3a3a40" });
    if (NIGHT) w.sprite({ x: lx + .45, z: lz - .4, y: ly + 5.9, bias: -3, fn: (sx, sy, k) => `<circle cx="${F(sx)}" cy="${F(sy)}" r="${F(k * 6)}" fill="url(#obGlow)" opacity=".8"/><circle cx="${F(sx)}" cy="${F(sy)}" r="${F(k * .25)}" fill="#fff4d0"/>` }); }

  /* ---- farm stand at the head of the lane: open shed, crates of apples, pumpkins ---- */
  const STX = -12.5, STZ = 98, sty = hT(STX, STZ);
  [[-2.4, -1.3], [2.4, -1.3], [-2.4, 1.3], [2.4, 1.3]].forEach(([dx, dz]) => w.box({ x: STX + dx, z: STZ + dz, y: sty, w: .2, d: .2, h: dz < 0 ? 2.6 : 2.2, c: "#6a5038" }));
  w.add([{ P: [[STX - 2.8, sty + 2.65, STZ - 1.8], [STX + 2.8, sty + 2.65, STZ - 1.8], [STX + 2.8, sty + 2.2, STZ + 1.6], [STX - 2.8, sty + 2.2, STZ + 1.6]], c: "#8a3a2a", two: true, back: "#4a2a20" }], { bias: -.4 });
  w.box({ x: STX, z: STZ - .6, y: sty, w: 4.6, d: .9, h: .9, c: "#8a6a48", top: "#9a7a50" });
  [-1.6, -.5, .6, 1.7].forEach((dx, i) => w.box({ x: STX + dx, z: STZ - .7, y: sty + .9, w: .9, d: .6, h: .3, c: "#a8845a", top: ["#b02a22", "#c8402a", "#d4b040", "#9a2a20"][i] }).key -= .3);
  ok.push([STX, STZ, 4]);
  const pumpkin = (x, z, s0) => w.sprite({ x, z, y: hT(x, z), fn: (sx, sy, k) => { const R = s0 * k, ls = LX < sx ? -1 : 1;
    return `<ellipse cx="${F(sx)}" cy="${F(sy + R * .05)}" rx="${F(R * 1.2)}" ry="${F(R * .25)}" fill="#000" opacity=".25"/>` +
      `<ellipse cx="${F(sx)}" cy="${F(sy - R * .7)}" rx="${F(R * 1.1)}" ry="${F(R * .78)}" fill="${T("#c45a18")}"/>` +
      `<ellipse cx="${F(sx + ls * R * .15)}" cy="${F(sy - R * .72)}" rx="${F(R * .55)}" ry="${F(R * .72)}" fill="${T("#e07a24")}"/>` +
      `<ellipse cx="${F(sx + ls * R * .35)}" cy="${F(sy - R * .95)}" rx="${F(R * .2)}" ry="${F(R * .3)}" fill="${T("#f4a650")}" opacity=".8"/>` +
      `<rect x="${F(sx - R * .08)}" y="${F(sy - R * 1.65)}" width="${F(R * .16)}" height="${F(R * .3)}" fill="${T("#4a5a24")}"/>`; } });
  [[-15.6, 96.4, .32], [-14.8, 95.8, .26], [-10.2, 95.6, .3], [-9.4, 96.6, .22], [-16.4, 97.6, .24], [-8.6, 95.2, .28]].forEach(([x, z, s0]) => pumpkin(x, z, s0));

  /* ---- apple bins along the lane: slatted wooden boxes heaped with fruit ---- */
  const bin = (x, z, yaw, fruit) => { const y = hT(x, z);
    w.box({ x, z, y, yaw, w: 1.2, d: 1.2, h: .75, c: "#9a7a52", top: fruit, dec: (fc, P) => { fc.slice(0, 4).forEach(Fc => Fc.dec = [.2, .42, .62].map(v => ({ P: [P([-.6, v, -.6]), P([.6, v, -.6]), P([.6, v, .6]), P([-.6, v, .6]), P([-.6, v, -.6])], c: "#4a3420", ln: .03, min: .3, op: .55 }))); } });
    w.sprite({ x, z: z - .55, y: y + .75, bias: -1.2, fn: (sx, sy, k) => { let a = ""; const ar = .045 * k;
      for (let i = 0; i < 18; i++) { const px = sx + (r() - .5) * k * 1.1, py = sy - r() * ar * 1.8; a += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(ar * (.8 + r() * .4))}" fill="${T(r() < .3 ? "#d04a2a" : "#a8261e")}"/>`; }
      return a; } }); };
  [[-3.6, 36, 6], [-3.7, 37.4, -4], [3.8, 52, 3], [-3.6, 64, -8], [3.7, 66, 10], [3.6, 67.6, 0]].forEach(([x, z, yaw], i) => bin(x, z, yaw, i % 3 === 2 ? "#c8902a" : "#a8261e"));

  /* ---- grass tufts and fallen leaves in the near grass, denser toward us ---- */
  for (let k = 0; k < 900; k++) { const z = 23 + Math.pow(r(), 1.6) * 90, x = (r() - .5) * z * 1.3;
    w.sprite({ x, z, y: hT(x, z), bias: .3, fn: (sx, sy, kk, fog) => { const hh = (.12 + r() * .14) * kk, lane = Math.abs(x) < 3, n = lane ? 3 : 5 + Math.floor(r() * 4); let g = "";
      for (let i = 0; i < n; i++) { const bx = sx + (r() - .5) * hh * 1.4, lean = (r() - .5) * hh * .8, c = T(mix(["#5a6e26", "#7e9234", "#9aaa48", "#b8b45a"][Math.floor(r() * 4)], HZ, fog));
        g += `<path d="M${F(bx - hh * .05)},${F(sy)} Q${F(bx + lean * .4)},${F(sy - hh * .6)} ${F(bx + lean)},${F(sy - hh * (lane ? .5 : 1))} Q${F(bx + lean * .4 + hh * .04)},${F(sy - hh * .5)} ${F(bx + hh * .05)},${F(sy)}Z" fill="${c}"/>`; }
      if (r() < .3) g += `<ellipse cx="${F(sx + (r() - .5) * hh)}" cy="${F(sy - hh * .05)}" rx="${F(hh * .25)}" ry="${F(hh * .1)}" fill="${T(["#c87a2a", "#e0a63a", "#a8401e"][Math.floor(r() * 3)])}" transform="rotate(${F((r() - .5) * 60)} ${F(sx)} ${F(sy)})"/>`;
      return g; } }); }

  /* ---- the orchard ---- */
  ROWS.forEach(rx => { for (let z = 16 + r() * 3; z < 330; z += 5.2 + r() * .8) {
    const x = rx + (r() - .5) * .5, sx = 1280 + 2200 * x / z;
    if (sx < -300 || sx > 2860 || inYard(x, z) || !free(x, z, 1.5)) continue;
    if (z < 22 && Math.abs(x) < 7) continue;                                      // keep the lane mouth open
    appleTree(x, z); } });
  /* an orchard ladder leaning into a tree on the right of the lane */
  { const lx = 5.0, lz = 43.5, y0 = hT(lx, lz);
    w.line([[lx - .3, y0, lz], [lx + .55, y0 + 3.1, lz + .6]], "#8a6a40", .07, { bias: -.4 });
    w.line([[lx + .3, y0, lz], [lx + .65, y0 + 3.1, lz + .6]], "#8a6a40", .07, { bias: -.4 });
    for (let k = 1; k < 7; k++) { const t = k / 7; w.line([[lx - .3 + .85 * t, y0 + 3.1 * t, lz + .6 * t], [lx + .3 + .35 * t, y0 + 3.1 * t, lz + .6 * t]], "#7a5a34", .05, { bias: -.45 }); }
    w.line([[lx + .6, y0 + 3.1, lz + .6], [lx + .9, y0, lz + 1.9]], "#7a5a34", .07, { bias: -.3 }); }

  /* ---- the farmhouse under a sugar maple ---- */
  const fh = onGround({ x: -37, z: 192, yaw: 14, w: 10, d: 8, h: 6.2, rh: 3.6 });
  w.house({ ...fh, wall: "#f2ece0", roof: "#3e4048", shut: "#2a3a32", chim: .3, door: .5, rng: rl });
  ok.push([-37, 192, 8]);
  shadeTree(-26, 186, 15, MAPLE);
  w.house({ ...onGround({ x: -48, z: 205, yaw: 20, w: 5, d: 6, h: 3.2, rh: 1.8, gable: true }), wall: "#8a3a2a", roof: "#4a4650", win: () => false, door: .5, clap: true, rng: rl });
  /* corn crib and a second shed beyond the barn */
  w.house({ ...onGround({ x: 22, z: 150, yaw: -18, w: 6, d: 9, h: 3.6, rh: 2.4 }), wall: "#9a4a32", roof: "#5a5660", win: () => false, door: .5, rng: rl });

  /* ---- hedgerows, woodlots and a few big trees beyond the orchard ---- */
  const AUTR = [MAPLE, AUTL, LEAF, AUTL.map((c, i) => mix(c, MAPLE[i], .5)), LEAF.map((c, i) => mix(c, AUTL[i], .6))];
  const hedge = (z, x0, x1, gap) => { for (let x = x0; x < x1; x += gap * (.6 + r() * .8)) { const zz = z + (r() - .5) * 6;
    if (!free(x, zz, 1)) continue; shadeTree(x, zz, 9 + r() * 8, AUTR[Math.floor(r() * AUTR.length)]); } };
  hedge(352, -260, 260, 9); hedge(520, -420, 360, 14); hedge(760, -600, 640, 22);
  for (let k = 0; k < 260; k++) { const z = 620 + Math.pow(r(), 1.2) * 820, x = (r() - .5) * z * 1.3;
    shadeTree(x, z, 12 + r() * 10, AUTR[Math.floor(r() * AUTR.length)]); }
  [[-150, 260, 18], [120, 240, 16], [210, 300, 17]].forEach(([x, z, hM]) => shadeTree(x, z, hM, AUTR[Math.floor(r() * AUTR.length)]));
  /* a red barn and white farmhouse on the far rise */
  w.house({ ...onGround({ x: 230, z: 900, yaw: -30, w: 12, d: 18, h: 6, rh: 5, gable: true }), wall: "#9a3a2a", roof: "#4a4650", door: false, win: () => false, rng: rl });
  w.house({ ...onGround({ x: 262, z: 905, yaw: -20, w: 9, d: 8, h: 6, rh: 3.4 }), wall: "#efe8da", roof: "#3e4048", chim: .3, rng: rl });

  s += w.draw();

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#obLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#obPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
