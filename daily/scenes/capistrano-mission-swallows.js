/* Capistrano Mission Swallows: Mission San Juan Capistrano, California, on
   St. John's Day (Oct 23), when the cliff swallows leave for Argentina.
   Standing in the mission garden, the camera looks up a decomposed-granite
   path to the ruin of the Great Stone Church (1797-1806, brought down by the
   1812 earthquake): thick sandstone walls with stepped broken tops, the great
   transverse arch broken on its right haunch, the sanctuary wall with its
   niches seen through it, swallows' mud nests under the ledges. The four-bell
   campanario stands to its right, the whitewashed Serra Chapel with its tile
   roof runs away on the right, the long arcade on the left; a tiered fountain,
   prickly pear, agave, roses, marigolds for Dia de los Muertos and
   bougainvillea in the beds; fan palms and the golden coastal hills beyond.
   Late afternoon, the sun low off the left edge, a flock of swallows going
   over. opts.time === "night": a waxing gibbous moon over the ruin, stars, the
   ruin and bell wall floodlit warm, luminarias along the path, lanterns in the
   arcade, lit chapel windows.
   The land is one world3d() raster (reference/scene-helpers.js); the walls,
   arches, fountain and plants are placed in metres by the same camera.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function capistranoMissionSwallowsArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1023;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17), rp = rng(seed + 29), rb = rng(seed + 41);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const MOX = 1186, MOY = 88, MR = 19;   // the gibbous moon, over the ruin and clear of both text corners
  const LX = NIGHT ? MOX : -320, LY = NIGHT ? MOY : 170, WY = 440;
  const T = c => NIGHT ? mix(mix(c, "#7a7a90", .4), "#0a0e2a", .6) : c;
  const HZ = NIGHT ? "#282c54" : "#f0dcbc", RIM = NIGHT ? "#b8c4ec" : "#fff0cc", LAMP = "#ffb44a", SHADE = NIGHT ? "#04050e" : "#4a3a58";
  const cl = v => Math.max(0, Math.min(.999, v));
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
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

  /* ---------------- sky: clear late afternoon, or a moonlit night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#04061a"/><stop offset=".5" stop-color="#0e1438"/><stop offset=".85" stop-color="#1e2854"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#3a6eb2"/><stop offset=".45" stop-color="#76a6d4"/><stop offset=".8" stop-color="#c6d4da"/><stop offset="1" stop-color="#f4dab0"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e8e4f4" stop-opacity=".3"/><stop offset=".22" stop-color="#9a9ac8" stop-opacity=".1"/><stop offset="1" stop-color="#7a6aa8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2c4" stop-opacity=".95"/><stop offset=".2" stop-color="#ffdca0" stop-opacity=".5"/><stop offset=".6" stop-color="#ffc890" stop-opacity=".14"/><stop offset="1" stop-color="#ffc890" stop-opacity="0"/>`;
  let s = `<defs id="sjcdefs">
    <linearGradient id="sjcSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="sjcLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 1000 : 1800}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="sjcHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".75"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="sjcGlow"><stop offset="0" stop-color="#ffd890" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".4"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="sjcPool"><stop offset="0" stop-color="#ffb060" stop-opacity=".55"/><stop offset=".5" stop-color="#ff9a40" stop-opacity=".2"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient>
    <radialGradient id="sjcMoonG"><stop offset="0" stop-color="#f4ecd0" stop-opacity=".55"/><stop offset=".3" stop-color="#c8c8e8" stop-opacity=".14"/><stop offset="1" stop-color="#c8c8e8" stop-opacity="0"/></radialGradient>
    <filter id="sjcLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="13" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="sjcCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".014" numOctaves="3" seed="27" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.4"/></filter>
    <filter id="sjcPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="sjcSoft"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="sjcMist"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="sjcSpray"><feGaussianBlur stdDeviation="1.4"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sjcSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 420; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 400, big = rs() < .06, dm = Math.hypot(x - MOX, y - MOY);
      if (dm < 90) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.6 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F((.2 + rs() * .55) * (1 - y / 440) * Math.min(1, dm / 400))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#sjcLight)"/>`;
    // a waxing gibbous, 92% lit: lit on the right, the terminator an ellipse on the left
    s += `<circle cx="${MOX}" cy="${MOY}" r="150" fill="url(#sjcMoonG)"/><circle cx="${MOX}" cy="${MOY}" r="${MR}" fill="#5a5c7a" opacity=".55"/>`;
    s += `<path d="M${MOX},${MOY - MR} A${MR},${MR} 0 0 1 ${MOX},${MOY + MR} A${F(MR * .84)},${MR} 0 0 1 ${MOX},${MOY - MR}Z" fill="#f6efd8"/>`;
    s += `<circle cx="${MOX + 5}" cy="${MOY - 4}" r="4" fill="#c8c0a8" opacity=".5"/><circle cx="${MOX - 3}" cy="${MOY + 6}" r="5" fill="#c8c0a8" opacity=".45"/><circle cx="${MOX + 9}" cy="${MOY + 8}" r="2.6" fill="#c8c0a8" opacity=".5"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#sjcLight)"/>`;
    s += `<g class="rays" opacity=".06" filter="url(#sjcSoft)">`;
    for (let k = 0; k < 6; k++) { const a = -.05 + k * .07, L = 2400;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a few soft heaps over the hills, lit from the left; the swallows ---------------- */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#sjcCloudy)">`;
    const lobes = [];
    for (let k = 0; k < 12; k++) { const t = k / 11; lobes.push([x + (t - .5) * w * (.9 + rs() * .2), y - Math.sin(t * Math.PI) * w * (.07 + rs() * .07), w * (.07 + rs() * .06)]); }
    if (NIGHT) {
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#141838" opacity=".8"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.3)}" ry="${F(R * .6)}" fill="#1c2248" opacity=".85"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .1)}" cy="${F(ly - R * .3)}" rx="${F(R * .8)}" ry="${F(R * .28)}" fill="#4a5288" opacity=".5"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .56)}" ry="${F(w * .04)}" fill="#b4b6c8"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.25)}" ry="${F(R * .75)}" fill="#d2d4dc"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .1)}" cy="${F(ly - R * .05)}" rx="${F(R * 1.05)}" ry="${F(R * .65)}" fill="#f4f0ea"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .4)}" cy="${F(ly - R * .25)}" rx="${F(R * .55)}" ry="${F(R * .34)}" fill="#fff4dc"/>`);
    }
    return c + `</g></g>`;
  };
  // high thin streaks in the corners (calm), small heaps sitting over the hills
  const wisp = (x, y, w, cls) => `<g class="${cls}" filter="url(#sjcSoft)" opacity="${NIGHT ? .12 : .4}">${Array.from({ length: 5 }, (_, k) => `<ellipse cx="${F(x + (rs() - .5) * w * .5)}" cy="${F(y + k * 7 - 14)}" rx="${F(w * (.3 + rs() * .2))}" ry="${F(3 + rs() * 3)}" fill="${NIGHT ? "#6a72a8" : "#fff"}"/>`).join("")}</g>`;
  s += wisp(420, 90, 700, "drift1") + wisp(2120, 70, 760, "drift2") + wisp(1700, 190, 420, "drift3");
  s += cloud(260, 318, 300, "drift1") + cloud(700, 300, 380, "drift2") + cloud(2050, 296, 420, "drift3") + cloud(2440, 322, 240, "drift1");
  if (!NIGHT) {   // cliff swallows heading south: a loose flock over the ruin, a few darting at the nests
    const swallow = (x, y, k, up) => { const u = up * k;
      return `<path d="M${F(x - 10 * k)},${F(y - 3 * k - u)} Q${F(x - 4 * k)},${F(y - 4.5 * k - u * .4)} ${F(x)},${F(y)} Q${F(x + 4 * k)},${F(y - 4.5 * k - u * .4)} ${F(x + 10 * k)},${F(y - 3 * k - u)} Q${F(x + 4 * k)},${F(y - 1.4 * k)} ${F(x + .9 * k)},${F(y + 1.6 * k)} L${F(x + 1.8 * k)},${F(y + 4.6 * k)} L${F(x)},${F(y + 3 * k)} L${F(x - 1.8 * k)},${F(y + 4.6 * k)} L${F(x - .9 * k)},${F(y + 1.6 * k)} Q${F(x - 4 * k)},${F(y - 1.4 * k)} ${F(x - 10 * k)},${F(y - 3 * k - u)}Z" fill="#1e2236"/>`
        + (k > 1.1 ? `<ellipse cx="${F(x)}" cy="${F(y + 1.2 * k)}" rx="${F(1 * k)}" ry="${F(.8 * k)}" fill="#e8d4b0" opacity=".8"/>` : ""); };
    s += `<g class="birds">`;
    for (let i = 0; i < 46; i++) { const t = rb(), x = 960 + t * 560 + (rb() - .5) * 90, y = 50 + (1 - t) * 60 + rb() * 120 + Math.sin(t * 9) * 16, k = .55 + rb() * .75;
      s += swallow(x, y, k, (rb() - .5) * 8); }
    [[1090, 268, 1.5, 3], [1158, 236, 1.3, -2], [1236, 298, 1.6, 4], [1300, 250, 1.2, -3], [1020, 330, 1.4, 2], [1372, 214, 1.1, 1], [1470, 300, 1.3, -4]].forEach(([x, y, k, u]) => s += swallow(x, y, k, u));
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 1.7 m above the garden, horizon on WY; metres, x right, y up, z away. The ruin's
     front (transverse) wall stands at z = 61, the campanario at z = 60.5, the chapel runs away
     from z = 53 on the right, the arcade from z = 34 on the left. */
  const EYE = 1.7, FL = 1900;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.2, .7, .35] : [-.62, .5, -.6], tone: T, fog: HZ, fogK: .00025,
    shadow: SHADE, rim: RIM, shade: .5, hi: .24, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const FX = -8, FZ = 26;                                         // the fountain
  const pathX = z => -1.6 + .5 * Math.sin(z / 14);                // the main path, up to the great arch
  const yLim = u => 302 - 44 * Math.exp(-((u / .2) ** 2));        // keep far land out of the text corners
  const capH = (x, z) => EYE + (WY - yLim(x / z)) * z / FL * (.94 + .06 * N3(x / 160, z / 160));
  const MF = mountainField({ seed: 2310, scale: 2600, oct: 6, peaks: [
    { x: -3200, z: 6200, h: 420, rx: 2600, rz: 1600 }, { x: 900, z: 7600, h: 640, rx: 2200, rz: 2600 }, { x: 4800, z: 5400, h: 360, r: 2100 }, { x: -6000, z: 9000, h: 700, r: 3000 } ] });
  const hT = (x, z) => {
    let h = .02 + 2.2 * sm((z - 105) / 140) * (.6 + .5 * N1(x / 60, z / 60));       // the rise behind the mission
    h += 34 * sm((z - 280) / 1000) * (.6 + .5 * N2(x / 320, z / 320)) + 6 * N3(x / 110, z / 110) * sm((z - 300) / 300);   // the coastal hills
    if (z > 1500) { const far = MF(x, z) * sm((z - 1500) / 2600); if (far > h) h = far; }
    return Math.max(.02, Math.min(h, capH(x, z))); };
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const DG = H3("#d8be94"), DG2 = H3("#c4a67c"), MUL = H3("#6e5034"), GC1 = H3("#6a7a3a"), GC2 = H3("#8e8c4a"), GC3 = H3("#4e6030"), TILE = H3("#b07450");
  const RUB = H3("#b89c74"), GRS = H3("#c8a668"), GRS2 = H3("#a48a52"), CHAP = H3("#5e6438"), OAKD = H3("#3e4a2a"), BLUE = H3("#8a92ac");
  const isPath = (x, z) => {
    if (z > 8 && z < 60 && Math.abs(x - pathX(z)) < 1.45 + .08 * N1(z / 3, 1)) return true;
    if (Math.abs(Math.hypot(x - FX, z - FZ) - 3.7) < .7) return true;
    if (Math.abs(z - 46) < .8 && x > -26 && x < 15) return true;
    if (z > 56 && z < 62.5 && x > -25 && x < 18) return true;            // the walk along the front of the ruin
    return false; };
  const hills = (x, y, z) => { const sz = 1 + z * .004, k = N1(x / 260, z / 260) * .5 + .5, t = N2(x / (40 * sz), z / (40 * sz)) * .5 + .5;
    let c = L3(GRS, GRS2, k * .8);
    c = L3(c, N3(x / 90, z / 90) > .05 ? CHAP : c, .8 * sm((N3(x / 90, z / 90) - .05) / .25) * sm((z - 300) / 300));
    c = L3(c, OAKD, sm((N2(x / 25 + 5, z / 25) - .3) / .2) * .8 * sm((z - 500) / 400));
    return c.map(v => v * (.86 + .24 * t)); };
  const col = (x, y, z, n) => {
    if (z > 1400) return L3(hills(x, y, z), BLUE, .3 + sm((z - 1400) / 5000) * .45);
    if (z > 95) return hills(x, y, z);
    if (x < -29.2 && x > -33.6 && z > 33 && z < 97) return TILE.map(v => v * (.9 + .12 * N1(x * 2, z * 2)));   // arcade floor
    if (z > 62.5 && z < 84 && x > -12.5 && x < 5.2) return L3(RUB, DG2, .5 + .5 * N2(x / 3, z / 3));            // inside the ruin
    if (isPath(x, z)) return L3(DG, DG2, .5 + .5 * N1(x / 2, z / 2)).map(v => v * (.94 + .1 * N3(x * 3, z * 3)));
    let c = L3(GC1, GC2, .5 + .6 * N2(x / 4, z / 4)); c = L3(c, GC3, .5 * N3(x / 1.5, z / 1.5) + .2);
    return L3(c, MUL, sm((N1(x / 2.2 + 9, z / 2.2) - .1) / .3) * .55); };
  w.raster({ z0: 6, z1: 16000, step: .0011, minStep: .12, scale: .75, top: 200, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00016, amb: NIGHT ? .55 : .44, noRefl: true });

  /* ---------- walls with arches: vertical strips from the arch (or the ground) up to a broken top ----------
     o: ax, az -> bx, bz (the wall's line), t thick, top(u) metres, open: [{ u, a, sp }] semicircular
     arches, col(kind, u, y) for "f" front, "b" back, "t" top, "s" soffit/jamb/end, dec(...) masonry. */
  const archWall = o => {
    const L = Math.hypot(o.bx - o.ax, o.bz - o.az), Ux = (o.bx - o.ax) / L, Uz = (o.bz - o.az) / L;
    let Nx = -Uz, Nz = Ux; const mx = (o.ax + o.bx) / 2, mz = (o.az + o.bz) / 2;
    if (Nx * -mx + Nz * -mz < 0) { Nx = -Nx; Nz = -Nz; }          // the front faces the camera
    const t = o.t / 2, Y0 = o.y0 || 0, ops = o.open || [], st = o.st || .4, C = o.col, glow = !!o.glow;
    const P = (u, y, off) => [o.ax + Ux * u + Nx * off, Y0 + y, o.az + Uz * u + Nz * off];
    const us = new Set([0, +L.toFixed(3)]);
    for (let u = st; u < L; u += st) us.add(+u.toFixed(3));
    ops.forEach(q => { for (let k = 0; k <= 18; k++) us.add(+(q.u - q.a + 2 * q.a * k / 18).toFixed(3)); });
    const U = [...us].filter(u => u >= 0 && u <= L).sort((a, b) => a - b);
    const faces = [{ P: [P(0, .03, t + .7), P(L, .03, t + .7), P(L, .03, -t - .3), P(0, .03, -t - .3)], c: "#000000", glow: true, op: .16, first: true, up: true }];
    const end = (u, b, tp) => faces.push({ P: [P(u, b, t), P(u, tp, t), P(u, tp, -t), P(u, b, -t)], c: C("s", u, (b + tp) / 2), two: true, glow });
    let prevOn = false, prevTop = 0, prevB = 0;
    for (let i = 0; i < U.length - 1; i++) {
      const u0 = U[i], u1 = U[i + 1]; if (u1 - u0 < .01) continue;
      const um = (u0 + u1) / 2, q = ops.find(q => Math.abs(um - q.u) < q.a);
      const bf = u => q ? q.sp + Math.sqrt(Math.max(0, q.a * q.a - (u - q.u) ** 2)) : 0;
      const b0 = bf(u0), b1 = bf(u1), t0 = o.top(u0), t1 = o.top(u1);
      const on = t0 > b0 + .08 && t1 > b1 + .08;
      if (on && !prevOn) end(u0, b0, t0);
      if (!on && prevOn) end(u0, prevB, prevTop);
      if (on) {
        const dec = [];
        if (o.dec) o.dec(dec, u0, u1, b0, b1, t0, t1, P, t);
        faces.push({ P: [P(u0, b0, t), P(u1, b1, t), P(u1, t1, t), P(u0, t0, t)], c: C("f", um, (b0 + t0) / 2), dec, glow });
        faces.push({ P: [P(u0, b0, -t), P(u1, b1, -t), P(u1, t1, -t), P(u0, t0, -t)], c: C("b", um, (b0 + t0) / 2), glow });
        faces.push({ P: [P(u0, t0, t), P(u1, t1, t), P(u1, t1, -t), P(u0, t0, -t)], c: C("t", um, t0), glow });
        if (b0 > 0 || b1 > 0) faces.push({ P: [P(u0, b0, t), P(u1, b1, t), P(u1, b1, -t), P(u0, b0, -t)], c: C("s", um, b0), two: true, glow });
      }
      prevOn = on; prevTop = t1; prevB = b1;
    }
    if (prevOn) end(L, prevB, prevTop);
    ops.forEach(q => [q.u - q.a, q.u + q.a].forEach(u => { const hj = Math.min(q.sp, o.top(u));
      if (hj > .1) faces.push({ P: [P(u, 0, t), P(u, hj, t), P(u, hj, -t), P(u, 0, -t)], c: C("s", u, hj / 2), two: true, glow }); }));
    const ob = w.add(faces, { center: P(L / 2, o.top(L / 2) / 2, 0), noRefl: true });
    if (o.key !== undefined) ob.key = o.key;
    return { ob, P, L, t, top: o.top };
  };
  /* floodlight at night: warm from below, falling off upward */
  const floodC = (c, y, kind) => { const k = (kind === "f" ? 1 : kind === "s" ? .6 : kind === "b" ? .42 : .72) * (1 - .6 * sm(y / 12));
    return mix("#160e1a", mix(c, "#ffbe78", .38), Math.min(1, k * .96)); };
  /* coursed masonry on a strip's front: rows, blocks of varied tone, joints and weathering */
  const masonry = (pal, rowH, blkW, op, extra) => (dec, u0, u1, b0, b1, t0, t1, P, t) => {
    const ylo = Math.max(b0, b1), yhi = Math.min(t0, t1), um = (u0 + u1) / 2;
    for (let row = Math.max(0, Math.floor(ylo / rowH)); row * rowH < yhi; row++) {
      const y0 = Math.max(row * rowH, ylo), y1 = Math.min((row + 1) * rowH, yhi); if (y1 - y0 < .03) continue;
      const off = row * blkW * .47, bi = Math.floor((um + off) / blkW), bp = Math.floor((u0 - .05 + off) / blkW), h1 = hash(bi, row * 1.7 + rowH);
      let c = pal[Math.floor(h1 * pal.length)];
      if (extra) c = extra(c, bi, row, h1) || c;
      const ym = (y0 + y1) / 2, jc = NIGHT ? floodC("#5a3a24", ym, "f") : "#6e5238";
      dec.push({ P: [P(u0, y0, t + .02), P(u1, y0, t + .02), P(u1, y1, t + .02), P(u0, y1, t + .02)], c: NIGHT ? floodC(c, ym, "f") : c, op: NIGHT ? 1 : op, glow: NIGHT });
      if (h1 > .9 && y1 - y0 > rowH * .7) dec.push({ P: [P(u0 + .05, y0 + .08, t + .03), P(u1 - .05, y0 + .08, t + .03), P(u1 - .05, y1 - .1, t + .03), P(u0 + .05, y1 - .1, t + .03)], c: NIGHT ? floodC("#6a4a30", ym, "s") : "#7e6046", op: .45, glow: NIGHT });
      if (row * rowH >= ylo) dec.push({ P: [P(u0, row * rowH, t + .03), P(u1, row * rowH, t + .03)], c: jc, ln: .035, min: .45, op: .5, glow: NIGHT });
      if (bi !== bp) dec.push({ P: [P(u0, y0, t + .03), P(u0, y1, t + .03)], c: jc, ln: .03, min: .4, op: .45, glow: NIGHT });
    }
  };
  const SAND = ["#c8a47a", "#b89468", "#d6b88e", "#ae8a60", "#c2a07a", "#a4927a", "#d2ae82", "#bc9a70"];
  const sandC = (kind, u, y) => NIGHT ? floodC(kind === "s" ? "#a8845c" : SAND[0], y, kind) : kind === "s" ? "#a4825c" : kind === "t" ? "#cfb48c" : SAND[0];
  const PLAS = ["#f0e6d2", "#ebe0c8", "#f4ecdc", "#e4d8bf", "#efe4cc"];
  const plasC = (kind, u, y) => NIGHT ? floodC(kind === "s" ? "#d8ccb4" : PLAS[0], y, kind) : kind === "s" ? "#d4c6ac" : PLAS[0];
  /* a stepped broken top: courses lost unevenly, quantised to the 0.45 m rows */
  const broken = (base, amp, sd) => u => { const v = base(u) + amp * (N1(u * .45 + sd, sd) * .7 + N2(u * 1.4 + sd, 2 * sd) * .3);
    return Math.max(.2, Math.round(v / .45) * .45 + (hash(Math.floor(u / .8), sd) > .8 ? -.45 : 0)); };

  /* ---------- the Great Stone Church ruin ---------- */
  const FRZ = 61;
  const front = archWall({ ax: -11.5, az: FRZ, bx: 4.2, bz: FRZ, t: 1.8, key: FRZ - .8, col: sandC,
    top: broken(u => 10.6 + .5 * Math.sin(u * .5) - 7.0 * sm((u - 7.9) / 2.2) + .9 * sm((u - 13) / 1.5), .6, 3),
    open: [{ u: 7.6, a: 4.0, sp: 5.0 }], dec: masonry(SAND, .45, .95, .5) });
  const leftW = archWall({ ax: -11.5, az: FRZ + .9, bx: -11.5, bz: 82, t: 1.6, key: 70, col: sandC,
    top: broken(u => 10.2 - 2.4 * sm((u - 6) / 10), .8, 7), open: [{ u: 11, a: 1.2, sp: 5.6 }], dec: masonry(SAND, .45, .95, .5) });
  const rightW = archWall({ ax: 4.2, az: FRZ + .9, bx: 4.2, bz: 82, t: 1.6, key: 70, col: sandC,
    top: broken(u => 8.6 - 1.8 * sm((u - 4) / 12), .9, 11), open: [{ u: 9, a: 2.6, sp: 3.4 }], dec: masonry(SAND, .45, .95, .5) });
  const backW = archWall({ ax: -11.5, az: 82.9, bx: 4.2, bz: 82.9, t: 1.8, key: 82, col: sandC,
    top: broken(u => 7.4 + .9 * Math.exp(-(((u - 7.6) / 3) ** 2)) - 1.0 * sm((u - 12) / 3), .6, 17), dec: masonry(SAND, .45, .95, .5) });
  const nave = archWall({ ax: -24.5, az: 63.5, bx: -12.4, bz: 63.5, t: 1.5, key: 63, col: sandC,
    top: broken(u => 2.4 + 2.8 * sm((u - 3) / 8), .9, 23), open: [{ u: 6.5, a: .9, sp: 1.6 }], dec: masonry(SAND, .45, .95, .5) });
  // the sanctuary niches, seen through the great arch, and a round window high in the back wall
  { const P = backW.P, tt = backW.t + .05, faces = [];
    const niche = (uc, hw, y0, y1, cIn, cRim) => { const arc = k => [uc - hw * Math.cos(k / 10 * Math.PI), y1 + hw * Math.sin(k / 10 * Math.PI)];
      const pts = (h, ex) => [[uc - h - ex, y0 - ex], [uc + h + ex, y0 - ex], ...Array.from({ length: 11 }, (_, k) => { const a = k / 10 * Math.PI; return [uc + (h + ex) * Math.cos(a), y1 + (h + ex) * Math.sin(a)]; })];
      faces.push({ P: pts(hw, .18).map(([u, y]) => P(u, y, tt)), c: cRim, glow: NIGHT, two: true });
      faces.push({ P: pts(hw, 0).map(([u, y]) => P(u, y, tt + .02)), c: cIn, glow: NIGHT, two: true });
      faces.push({ P: [P(uc - hw, y0, tt + .03), P(uc + hw, y0, tt + .03), P(uc + hw, y0 + .25, tt + .03), P(uc - hw, y0 + .25, tt + .03)], c: NIGHT ? floodC("#c8a47a", y0, "f") : "#d2b48c", glow: NIGHT, two: true }); };
    const dk = y => NIGHT ? floodC("#6a4428", y, "s") : "#6e5036", rim = y => NIGHT ? floodC("#dcc09a", y, "f") : "#d8bc94";
    niche(7.6, 1.15, 1.2, 4.6, dk(3), rim(3)); niche(4.6, .7, 2.2, 4.2, dk(3), rim(3)); niche(10.6, .7, 2.2, 4.2, dk(3), rim(3));
    niche(7.6, .5, 5.4, 6.0, dk(6), rim(6));
    const ob = w.add(faces, { noRefl: true }); ob.key = backW.ob.key - .3; }
  // a cornice course left on the front wall's left pier, and the arch's voussoir ring
  { const P = front.P, tt = front.t + .04, faces = [];
    for (let k = 0; k < 19; k++) { const a0 = k / 19 * Math.PI, a1 = (k + 1) / 19 * Math.PI, uc = 7.6, R0 = 4.0, R1 = 4.55;
      const pts = [[uc - R0 * Math.cos(a0), 5 + R0 * Math.sin(a0)], [uc - R1 * Math.cos(a0), 5 + R1 * Math.sin(a0)], [uc - R1 * Math.cos(a1), 5 + R1 * Math.sin(a1)], [uc - R0 * Math.cos(a1), 5 + R0 * Math.sin(a1)]];
      if (pts.some(([u, y]) => y > front.top(u) - .05)) continue;
      const c = SAND[k % 2 ? 2 : 6]; faces.push({ P: pts.map(([u, y]) => P(u, y, tt)), c: NIGHT ? floodC(c, pts[0][1], "f") : c, glow: NIGHT, seam: true }); }
    [[0, 3.6, 6.2], [12.2, 15.7, 5.6]].forEach(([u0, u1, y]) => { if (front.top(u0 + .5) > y + .4) faces.push({ P: [P(u0, y, tt), P(u1, y, tt), P(u1, y + .3, tt + .25), P(u0, y + .3, tt + .25)], c: NIGHT ? floodC("#d8bc94", y, "f") : "#d8bc94", glow: NIGHT }); });
    const ob = w.add(faces, { noRefl: true }); ob.key = front.ob.key - .2; }
  // swallows' mud nests: gourds clustered under the arch crown and the ledges
  const nest = (px, py, kk) => { const R = Math.max(1.2, .13 * kk), c = T("#9a7a56");
    return `<path d="M${F(px - R)},${F(py)} Q${F(px - R * 1.1)},${F(py + R * 1.6)} ${F(px - R * .2)},${F(py + R * 1.7)} Q${F(px + R * .35)},${F(py + R * 1.6)} ${F(px + R * .3)},${F(py + R * 1.2)} Q${F(px + R)},${F(py + R)} ${F(px + R)},${F(py)}Z" fill="${c}"/>`
      + `<ellipse cx="${F(px + R * .05)}" cy="${F(py + R * 1.28)}" rx="${F(R * .28)}" ry="${F(R * .22)}" fill="${T("#2a1e14")}"/>`
      + `<path d="M${F(px - R * .7)},${F(py + R * .3)} q${F(R * .4)},${F(R * .9)} ${F(R * .5)},${F(R * 1.2)}" stroke="${T("#c0a07a")}" stroke-width="${F(Math.max(.5, R * .25))}" fill="none" opacity=".6"/>`; };
  [[7.6, 8.95], [7.0, 8.9], [6.4, 8.8], [5.9, 8.65], [5.4, 8.45]].forEach(([u, y], i) => { const p = front.P(u, y - .05 - (i % 2) * .12, front.t * .4);
    w.sprite({ x: p[0], z: p[2], y: p[1] - .26, bias: -2, fn: (px, py, kk) => nest(px, py, kk) }); });
  [[1.2, 6.2], [1.8, 6.2], [2.5, 6.2]].forEach(([u, y]) => { const p = front.P(u, y, front.t + .1);
    w.sprite({ x: p[0], z: p[2], y: y - .28, bias: -1, fn: (px, py, kk) => nest(px, py, kk) }); });
  // weeds and buckwheat on the broken tops
  [[front, 26], [backW, 14], [nave, 10], [leftW, 6], [rightW, 8]].forEach(([wl, n]) => { for (let k = 0; k < n; k++) { const u = rl() * wl.L, y = wl.top(u), p = wl.P(u, y, (rl() - .3) * wl.t);
    w.sprite({ x: p[0], z: p[2], y, bias: -1.5, fn: (px, py, kk) => { const R = Math.max(1.5, (.25 + rl() * .3) * kk); let g = "";
      for (let i = 0; i < 7; i++) g += `<path d="M${F(px + (rl() - .5) * R)},${F(py + 1)} q${F((rl() - .5) * R)},${F(-R * .6)} ${F((rl() - .5) * R * 1.2)},${F(-R * (.6 + rl() * .6))}" stroke="${T(rl() < .5 ? "#8a8a40" : "#b4a050")}" stroke-width="${F(Math.max(.7, R * .1))}" fill="none"/>`;
      return g; } }); } });
  // fallen sandstone blocks in front of the ruin
  for (let k = 0; k < 26; k++) { const x = -22 + rl() * 27, z = FRZ - 2.2 - rl() * 5.5; if (Math.abs(x - pathX(z)) < 1.8) continue;
    const bw = .5 + rl() * .9, bh = .3 + rl() * .4; w.box({ x, z, y: -.06, yaw: (rl() - .5) * 60, w: bw, d: .4 + rl() * .5, h: bh, c: NIGHT ? T(SAND[k % 8]) : SAND[k % 8], top: NIGHT ? T("#d2b68e") : "#d2b68e" }); }

  /* ---------- the campanario: a plastered bell wall with four bells, a cross on its crest ---------- */
  const CPZ = 60.5;
  const camp = archWall({ ax: 5.6, az: CPZ, bx: 10.8, bz: CPZ, t: 1.0, st: .26, key: CPZ - .55, col: plasC,
    top: u => 4.5 + 1.9 * sm((u - .55) / .55) * sm((4.65 - u) / .55) + .35 * Math.cos((u - 2.6) / 2.05 * Math.PI / 2) * sm((u - .9) / .4) * sm((4.3 - u) / .4),
    open: [{ u: 1.35, a: .78, sp: 1.6 }, { u: 3.85, a: .78, sp: 1.6 }, { u: 1.95, a: .44, sp: 4.95 }, { u: 3.25, a: .44, sp: 4.95 }],
    dec: masonry(PLAS, .6, 1.3, .35, (c, bi, row, h1) => h1 < .07 ? "#bd7a5a" : null) });
  { const P = camp.P, tt = camp.t + .04, faces = [], cc = NIGHT ? floodC("#e8dcc4", 4.5, "f") : "#e8dcc4";
    faces.push({ P: [P(-.1, 4.4, tt), P(5.3, 4.4, tt), P(5.3, 4.62, tt + .18), P(-.1, 4.62, tt + .18)], c: cc, glow: NIGHT });
    faces.push({ P: [P(-.08, 0, tt), P(5.28, 0, tt), P(5.28, .5, tt), P(-.08, .5, tt)], c: NIGHT ? floodC("#c8b494", .3, "f") : "#c8b494", glow: NIGHT });
    const ob = w.add(faces, { noRefl: true }); ob.key = camp.ob.key - .1;
    // the iron cross on the crest
    const c0 = P(2.6, 6.75, 0), ck = camp.ob.key - .6 - c0[2];
    w.line([c0, [c0[0], c0[1] + 1.0, c0[2]]], NIGHT ? "#0e0a10" : "#2a2420", .08, { min: 1.4, bias: ck });
    w.line([[c0[0] - .32, c0[1] + .68, c0[2]], [c0[0] + .32, c0[1] + .68, c0[2]]], NIGHT ? "#0e0a10" : "#2a2420", .08, { min: 1.4, bias: ck }); }
  // the bells, hung in the openings
  const bell = (px, py, kk, sz) => { const h = sz * kk, wd = h * .9, c1 = T("#4e4024"), c2 = T("#8a7036"), c3 = T("#c8a454");
    return `<path d="M${F(px)},${F(py - h * .08)} L${F(px)},${F(py + h * .05)}" stroke="${T("#2a2018")}" stroke-width="${F(Math.max(1, h * .06))}"/>`
      + `<path d="M${F(px - wd * .22)},${F(py + h * .05)} Q${F(px - wd * .26)},${F(py + h * .6)} ${F(px - wd * .5)},${F(py + h)} L${F(px + wd * .5)},${F(py + h)} Q${F(px + wd * .26)},${F(py + h * .6)} ${F(px + wd * .22)},${F(py + h * .05)}Z" fill="${c2}"/>`
      + `<path d="M${F(px + wd * .05)},${F(py + h * .05)} Q${F(px + wd * .2)},${F(py + h * .6)} ${F(px + wd * .42)},${F(py + h)} L${F(px + wd * .5)},${F(py + h)} Q${F(px + wd * .26)},${F(py + h * .6)} ${F(px + wd * .22)},${F(py + h * .05)}Z" fill="${c1}"/>`
      + `<path d="M${F(px - wd * .16)},${F(py + h * .12)} Q${F(px - wd * .2)},${F(py + h * .6)} ${F(px - wd * .38)},${F(py + h * .95)}" stroke="${c3}" stroke-width="${F(Math.max(.8, h * .07))}" fill="none" opacity=".8"/>`
      + `<path d="M${F(px - wd * .53)},${F(py + h)} L${F(px + wd * .53)},${F(py + h)}" stroke="${c1}" stroke-width="${F(Math.max(1, h * .07))}"/>`; };
  [[1.35, 2.32, .78], [3.85, 2.32, .78], [1.95, 5.3, .46], [3.25, 5.3, .46]].forEach(([u, y, sz]) => { const p = camp.P(u, y, 0);
    w.sprite({ x: p[0], z: p[2], y, bias: (camp.ob.key - .4) - p[2], fn: (px, py, kk) => bell(px, py, kk, sz) }); });

  /* ---------- the garden wall to the chapel, with bougainvillea ---------- */
  const gwall = archWall({ ax: 10.9, az: CPZ + .1, bx: 18.2, bz: CPZ + .1, t: .6, key: CPZ - .2, col: plasC,
    top: u => 2.1 + .12 * Math.sin(u * 2), dec: masonry(PLAS, .6, 1.4, .3) });

  /* ---------- the Serra Chapel: long whitewashed adobe, tile roof, small deep windows ---------- */
  const chapX = (n, q, len) => {
    if (n === "front") for (let u = 3.5; u < len - 2; u += 6.4) { const lt = NIGHT && rl() < .8;
      q(u - .55, 2.3, u + .55, 3.6, "#c8b89a", { off: .04 }); q(u - .42, 2.4, u + .42, 3.5, lt ? LAMP : "#3a2e2a", { off: .06, glow: lt });
      q(u - .9, 0, u + .9, .5, "#d8ccb0", { off: .04 }); }
    if (n === "left" || n === "right") { const lt = NIGHT; q(len / 2 - .7, 0, len / 2 + .7, 2.5, "#c8b89a", { off: .04 }); q(len / 2 - .58, 0, len / 2 + .58, 2.4, lt ? "#e0903a" : "#4a2e1e", { off: .06, glow: lt }); }
    for (let i = 0; i < len * .9; i++) { const u = rl() * len, v = rl() * 4;   // worn plaster, adobe showing
      q(u, v, Math.min(len, u + .4 + rl() * 1.4), Math.min(4.3, v + .3 + rl() * .8), rl() < .2 ? "#c49a72" : rl() < .5 ? "#e6dac2" : "#f4ecdc", { off: .03, op: .55 }); } };
  w.house({ x: 22, z: 76, yaw: -90, w: 46, d: 8, h: 4.4, rh: 1.8, ov: .5, roof3: "gable", wall: "#efe5d0", roof: "#a8502e", trim: "#e2d6be",
    clap: false, door: false, win: () => false, extra: chapX, rng: rl, noRefl: true });
  // buttresses along the chapel's side
  for (let z = 56; z < 98; z += 6.4) w.box({ x: 17.6, z, w: .9, d: 1.1, h: 3.4, c: "#ebe0ca", top: "#a8502e", noRefl: true });

  /* ---------- the arcade on the left: whitewashed arches, tile roof, a wall of doors behind ---------- */
  const AX = -29, AZ0 = 34, AZ1 = 96;
  const arcBack = archWall({ ax: -33.6, az: AZ0, bx: -33.6, bz: AZ1, t: .7, key: AZ0 + 2, col: plasC, top: () => 6.1,
    dec: (dec, u0, u1, b0, b1, t0, t1, P, t) => { const k = Math.floor(u0 / 6.8), uc = 3.4 + k * 6.8;
      if (u1 > uc - .6 && u0 < uc + .6) { const a = Math.max(u0, uc - .6), b = Math.min(u1, uc + .6), lt = NIGHT && hash(k, 3) < .6;
        dec.push({ P: [P(a, 0, t + .03), P(b, 0, t + .03), P(b, 2.3, t + .03), P(a, 2.3, t + .03)], c: lt ? "#e09040" : "#4a2e1e", glow: lt }); } } });
  const arc = archWall({ ax: AX, az: AZ0, bx: AX, bz: AZ1, t: .8, st: .3, key: AZ0, col: plasC, top: () => 4.4,
    open: Array.from({ length: 18 }, (_, k) => ({ u: 1.75 + k * 3.45, a: 1.25, sp: 2.1 })), dec: masonry(PLAS, .6, 1.6, .25) });
  { const faces = [], dec = [], y0 = 4.45, y1 = 6.2, x0 = AX + .55, x1 = -33.9;
    for (let z = AZ0 - .4; z < AZ1 + .4; z += .34) dec.push({ P: [[x0, y0, z], [x1, y1, z]], c: "#7e3a22", ln: .06, min: .5, op: .55 });
    for (let z = AZ0; z < AZ1; z += .34 + rl() * .3) if (rl() < .3) dec.push({ P: [[x0, y0 + .02, z], [x0 + (x1 - x0) * .3, y0 + (y1 - y0) * .3, z], [x0 + (x1 - x0) * .3, y0 + (y1 - y0) * .3, z + .3], [x0, y0 + .02, z + .3]], c: rl() < .5 ? "#c8703e" : "#9a4426", op: .6 });
    faces.push({ P: [[x0, y0, AZ0 - .5], [x0, y0, AZ1 + .5], [x1, y1, AZ1 + .5], [x1, y1, AZ0 - .5]], c: "#c25e32", dec, sh: .15 });
    faces.push({ P: [[x0, y0, AZ0 - .5], [x0, y0, AZ1 + .5]], c: "#6a2e1c", ln: .14, min: 1 });
    faces.push({ P: [[x0, y0, AZ0 - .5], [x0, y0 - .2, AZ0 - .5], [x1, y1 - .2, AZ0 - .5], [x1, y1, AZ0 - .5]], c: "#8a4026", two: true });
    const ob = w.add(faces, { noRefl: true }); ob.key = AZ0 - .6; }
  // lanterns hung in the arches
  for (let k = 0; k < 18; k += 1) { const z = AZ0 + 1.75 + k * 3.45, y = 3.0;
    w.sprite({ x: AX + .2, z, y, bias: (AZ0 - .3) - z, fn: (px, py, kk) => { const R = Math.max(1.2, .16 * kk);
      return (NIGHT ? `<circle cx="${F(px)}" cy="${F(py)}" r="${F(R * 9)}" fill="url(#sjcGlow)" opacity=".75"/>` : "")
        + `<path d="M${F(px)},${F(py - R * 2.4)} L${F(px)},${F(py - R * 1.2)}" stroke="#1e1a18" stroke-width="${F(Math.max(.6, R * .15))}"/>`
        + `<path d="M${F(px - R * .6)},${F(py - R * 1.2)} L${F(px + R * .6)},${F(py - R * 1.2)} L${F(px + R * .8)},${F(py + R * .7)} L${F(px - R * .8)},${F(py + R * .7)}Z" fill="${NIGHT ? "#ffd890" : "#3a3a3e"}" stroke="#1e1a18" stroke-width="${F(Math.max(.5, R * .12))}"/>`; } }); }

  /* ---------- the fountain: a round basin, a pedestal and a tiered bowl, spray ---------- */
  { const WATER = NIGHT ? "#2a3664" : "#7ab0c0", STN = "#d6c6a6";
    const basin = w.cyl({ x: FX, z: FZ, r0: 2.5, h: .55, n: 32, c: STN, top: false, noRefl: true });
    const wat = w.cyl({ x: FX, z: FZ, r0: 2.3, h: .47, n: 32, c: WATER, top: WATER, noRefl: true }); wat.key = basin.key + .2;
    const ring = [];
    for (let i = 0; i < 32; i++) { const a0 = i / 32 * Math.PI * 2, a1 = (i + 1) / 32 * Math.PI * 2;
      ring.push({ P: [[FX + Math.cos(a0) * 2.25, .56, FZ + Math.sin(a0) * 2.25], [FX + Math.cos(a1) * 2.25, .56, FZ + Math.sin(a1) * 2.25], [FX + Math.cos(a1) * 2.55, .56, FZ + Math.sin(a1) * 2.55], [FX + Math.cos(a0) * 2.55, .56, FZ + Math.sin(a0) * 2.55]], c: "#e4d6b8", up: true, seam: true }); }
    const rg = w.add(ring, { noRefl: true }); rg.key = basin.key - .1;
    // tile band on the basin's wall
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; if (Math.sin(a) > .2) continue;
      w.box({ x: FX + Math.cos(a) * 2.51, z: FZ + Math.sin(a) * 2.51, y: .2, yaw: -a * 180 / Math.PI + 90, w: .44, d: .02, h: .18, c: i % 2 ? "#2a6a8a" : "#c8a048", noRefl: true }).key = basin.key - .05; }
    const K = basin.key - .3;
    w.cyl({ x: FX, z: FZ, y: .47, r0: .42, r1: .26, h: 1.0, n: 14, c: STN, noRefl: true }).key = K;
    w.cyl({ x: FX, z: FZ, y: 1.47, r0: .28, r1: 1.05, h: .3, n: 24, c: STN, top: WATER, noRefl: true }).key = K - .1;
    w.cyl({ x: FX, z: FZ, y: 1.77, r0: .1, r1: .07, h: .45, n: 10, c: STN, noRefl: true }).key = K - .2;
    w.cyl({ x: FX, z: FZ, y: 2.22, r0: .07, r1: .3, h: .12, n: 12, c: STN, top: WATER, noRefl: true }).key = K - .3;
    const SP = NIGHT ? "#8a9ad0" : "#f2fafc";
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + .2, c = Math.cos(a), sn = Math.sin(a);
      w.line([[FX + c * .25, 2.34, FZ + sn * .25], [FX + c * .6, 2.42, FZ + sn * .6], [FX + c * .9, 1.95, FZ + sn * .9]], SP, .025, { op: .65, min: .7, bias: K - .4 - FZ });
      w.line([[FX + c * 1.06, 1.76, FZ + sn * 1.06], [FX + c * 1.12, 1.2, FZ + sn * 1.12], [FX + c * 1.16, .6, FZ + sn * 1.16]], SP, .03, { op: .4, min: .7, bias: K - .4 - FZ }); } }

  /* ---------- sprites: trees, palms, cacti, flowers ---------- */
  const OAKG = ["#1e2614", "#2a3418", "#36421e", "#445024", "#56602c", "#6a7236", "#848a48", "#a0a464"];
  const SYC = ["#3a3410", "#56501a", "#706a22", "#8c842c", "#a89c36", "#c4b046", "#d8c45e", "#ecdc8a"];
  const EUC = ["#1e2a26", "#2a3a34", "#3a4a42", "#4a5a50", "#5e6e60", "#748270", "#8e9a84", "#aab4a0"];
  const PEPP = ["#26301a", "#34401e", "#445224", "#56642c", "#6a7834", "#82903e", "#9aa850", "#b8c070"];
  const BOUG = ["#4a0e2a", "#6a1438", "#8a1a4a", "#a8205a", "#c42a6a", "#d8468a", "#e86aa4", "#f4a0c4"];
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1a140a", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(48, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (x - px) + (y - sz * .5 - py) * .6, R = sz * (.12 + r() * .1);      // lit on the left
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };
  const broadleaf = (x, y, hp, RAMP, fog, n, o = {}) => {     // trunk, limbs and a crown of many lit leaf clumps
    const sd = LX < x ? -1 : 1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .035), ty = y - hp * (o.trunk || .3), wide = o.wide || 1;
    g += `<ellipse cx="${F(x + hp * .2)}" cy="${F(y + 1)}" rx="${F(hp * .4 * wide)}" ry="${F(Math.max(1, hp * .035))}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} Q${F(x - tb * .2)},${F((y + ty) / 2)} ${F(x - tb * .5)},${F(ty)} L${F(x + tb * .5)},${F(ty)} Q${F(x + tb * .6)},${F((y + ty) / 2)} ${F(x + tb)},${F(y)}Z" fill="${Tf("#6a5a4a")}"/>`;
    g += `<path d="M${F(x + sd * tb * .1)},${F(y)} L${F(x + sd * tb * .1)},${F(ty)} L${F(x - sd * tb * .55)},${F(ty)} L${F(x - sd * tb)},${F(y)}Z" fill="${Tf("#3e3228")}"/>`;
    for (let k = 0; k < 5; k++) { const a = -1.4 + k * .7 + (r() - .5) * .3; g += `<path d="M${F(x)},${F(ty + hp * .05)} Q${F(x + Math.sin(a) * hp * .12)},${F(ty - hp * .05)} ${F(x + Math.sin(a) * hp * .3 * wide)},${F(ty - Math.cos(a) * hp * .16)}" stroke="${Tf("#4a3c30")}" stroke-width="${F(Math.max(.8, tb * .45))}" fill="none"/>`; }
    const cx = x, cy = y - hp * .6, rx = hp * .42 * wide, ry = hp * .34, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.7 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.024 + r() * .024)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx - sd * a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    if (o.weep) {   // a pepper tree's hanging strands and pink berries
      for (let i = 0; i < o.weep; i++) { const px = cx + (r() * 2 - 1) * rx * 1.05, py = cy + ry * (.1 + r() * .55), L = hp * (.12 + r() * .16);
        const lit = (px - cx) / rx * ux > 0;
        cg += `<path d="M${F(px)},${F(py)} q${F((r() - .5) * hp * .03)},${F(L * .6)} ${F((r() - .5) * hp * .04)},${F(L)}" stroke="${Tf(RAMP[lit ? 5 + Math.floor(r() * 2) : 2 + Math.floor(r() * 2)])}" stroke-width="${F(Math.max(.8, hp * .012))}" fill="none"/>`;
        if (r() < .35) cg += `<circle cx="${F(px + (r() - .5) * 2)}" cy="${F(py + L * (.4 + r() * .5))}" r="${F(Math.max(.8, hp * .007))}" fill="${T(r() < .5 ? "#d0506a" : "#e88a9a")}"/>`; } }
    return g + `<g filter="url(#sjcLeafy)">${cg}</g>`; };
  /* a Mexican fan palm: slim ringed trunk, a skirt of dead fronds, a crown of lit fans */
  const palm = (x, y, hp, fog, lean) => {
    const Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tw = Math.max(.9, hp * .016), tx = x + lean * hp, ty = y - hp * .86, qx = x + lean * hp * .35;
    g += `<path d="M${F(x - tw * 1.5)},${F(y)} Q${F(qx - tw)},${F(y - hp * .45)} ${F(tx - tw * .8)},${F(ty)} L${F(tx + tw * .8)},${F(ty)} Q${F(qx + tw)},${F(y - hp * .45)} ${F(x + tw * 1.5)},${F(y)}Z" fill="${Tf("#8e7e6a")}"/>`;
    g += `<path d="M${F(x + tw * .2)},${F(y)} Q${F(qx + tw * .1)},${F(y - hp * .45)} ${F(tx + tw * .1)},${F(ty)} L${F(tx + tw * .8)},${F(ty)} Q${F(qx + tw)},${F(y - hp * .45)} ${F(x + tw * 1.5)},${F(y)}Z" fill="${Tf("#5e5040")}"/>`;
    if (hp > 120) for (let k = 0; k < 24; k++) { const t = k / 24, cxk = x + (tx - x) * t + (qx - (x + tx) / 2) * 4 * t * (1 - t), wk = tw * (1.5 - .7 * t);
      g += `<path d="M${F(cxk - wk)},${F(y - (y - ty) * t)} l${F(wk * 2)},${F(-hp * .004)}" stroke="${Tf("#4a3e32")}" stroke-width="${F(Math.max(.5, hp * .002))}" opacity=".5"/>`; }
    for (let k = 0; k < 26; k++) { const a = (k / 25 - .5) * 1.2, L = hp * (.09 + r() * .05);
      g += `<path d="M${F(tx + Math.sin(a) * tw * 3)},${F(ty - hp * .01)} q${F(Math.sin(a) * L * .4)},${F(L * .5)} ${F(Math.sin(a) * L * .5 + (r() - .5) * tw)},${F(L)}" stroke="${Tf(r() < .5 ? "#8a6a40" : "#6a5030")}" stroke-width="${F(Math.max(1, tw * 1.1))}" fill="none"/>`; }
    const fr = [];
    for (let k = 0; k < 22; k++) fr.push(-Math.PI * (.02 + .96 * k / 21) + (r() - .5) * .15 + (k % 3 === 0 ? .25 : 0));
    fr.sort((a, b) => Math.abs(b + Math.PI / 2) - Math.abs(a + Math.PI / 2));
    fr.forEach(a => { const pl = hp * (.05 + r() * .03), ex = tx + Math.cos(a) * pl, ey = ty + Math.sin(a) * pl * .7, R = hp * (.075 + r() * .03);
      const lit = Math.cos(a) < -.2 ? 6 : Math.cos(a) < .3 ? 4 : 2, base = ["#22301c", "#2e4024", "#3c522c", "#4c6434", "#5e783e", "#728c4a", "#8aa45a", "#a6bc72"];
      g += `<path d="M${F(tx)},${F(ty)} L${F(ex)},${F(ey)}" stroke="${Tf("#4e5a34")}" stroke-width="${F(Math.max(.6, tw * .4))}"/>`;
      let d = `M${F(ex)},${F(ey)}`; const n = 9;
      for (let i = 0; i <= n; i++) { const b = a + (i / n - .5) * 1.25, RR = R * (i % 2 ? .78 : 1) * (1 - .25 * Math.abs(i / n - .5));
        d += ` L${F(ex + Math.cos(b) * RR)},${F(ey + Math.sin(b) * RR * .75 + Math.max(0, Math.cos(b - a)) * RR * .15)}`; }
      g += `<path d="${d}Z" fill="${Tf(base[lit])}"/>`;
      g += `<path d="M${F(ex)},${F(ey)} L${F(ex + Math.cos(a - .2) * R * .9)},${F(ey + Math.sin(a - .2) * R * .68)} L${F(ex + Math.cos(a + .35) * R * .9)},${F(ey + Math.sin(a + .35) * R * .68)}Z" fill="${Tf(base[Math.max(0, lit - 2)])}" opacity=".7"/>`; });
    return g; };
  const pricklyPear = (px, py, kk, fog, sz) => { const Tf = c => T(mix(c, HZ, fog)); let g = `<ellipse cx="${F(px + sz * kk * .2)}" cy="${F(py)}" rx="${F(sz * kk * .5)}" ry="${F(Math.max(1, sz * kk * .06))}" fill="#000" opacity=".25"/>`;
    const pads = [], grow = (x, y, ang, L, d) => { const cx = x + Math.sin(ang) * L * .5, cy = y - Math.cos(ang) * L * .5; pads.push([cx, cy, ang, L, d]);
      if (d >= 3) return; const nk = 1 + Math.floor(rp() * 2.4);
      for (let i = 0; i < nk; i++) { const off = (i - (nk - 1) / 2) * .9 + (rp() - .5) * .5, ex = x + Math.sin(ang + off * .5) * L * .92, ey = y - Math.cos(ang + off * .5) * L * .92;
        grow(ex, ey, ang + off * .7 + (rp() - .5) * .3, L * (.8 + rp() * .15), d + 1); } };
    const L0 = sz * kk * .38; grow(px, py, (rp() - .5) * .3, L0, 0);
    pads.forEach(([cx, cy, ang, L, d]) => { const rx = L * .36, ry = L * .5, rot = ang * 180 / Math.PI;
      g += `<g transform="translate(${F(cx)},${F(cy)}) rotate(${F(rot)})"><ellipse rx="${F(rx)}" ry="${F(ry)}" fill="${Tf(d ? "#5e7e3e" : "#6a7a44")}"/>`
        + `<ellipse cx="${F(-rx * .3)}" cy="${F(-ry * .1)}" rx="${F(rx * .55)}" ry="${F(ry * .75)}" fill="${Tf("#8aa65a")}" opacity=".8"/>`
        + `<ellipse cx="${F(rx * .45)}" cy="${F(ry * .1)}" rx="${F(rx * .4)}" ry="${F(ry * .8)}" fill="${Tf("#3e5a2a")}" opacity=".7"/>`;
      if (rx > 4) for (let i = 0; i < 6; i++) g += `<circle cx="${F((rp() - .5) * rx * 1.3)}" cy="${F((rp() - .5) * ry * 1.4)}" r="${F(Math.max(.5, rx * .05))}" fill="${Tf("#e8e0b0")}" opacity=".7"/>`;
      if (d >= 2 && rp() < .7) for (let i = 0; i < 3; i++) g += `<ellipse cx="${F((i - 1) * rx * .5)}" cy="${F(-ry * .95)}" rx="${F(rx * .16)}" ry="${F(rx * .22)}" fill="${Tf(rp() < .5 ? "#b02c48" : "#c84a5a")}"/>`;
      g += `</g>`; });
    return g; };
  const agave = (px, py, kk, fog, sz) => { const Tf = c => T(mix(c, HZ, fog)), L0 = sz * kk; let g = `<ellipse cx="${F(px + L0 * .2)}" cy="${F(py)}" rx="${F(L0 * .9)}" ry="${F(Math.max(1, L0 * .1))}" fill="#000" opacity=".25"/>`;
    const lv = []; for (let i = 0; i < 17; i++) lv.push(-Math.PI * (.04 + .92 * i / 16) + (rp() - .5) * .12);
    lv.sort((a, b) => Math.abs(b + Math.PI / 2) - Math.abs(a + Math.PI / 2));
    lv.forEach(a => { const L = L0 * (.6 + .4 * Math.sin(-a)) * (.85 + rp() * .3), wd = L * .13, ex = px + Math.cos(a) * L, ey = py + Math.sin(a) * L * .8, nx = -Math.sin(a), ny = Math.cos(a);
      const lit = Math.cos(a) < -.25 ? "#b4c8bc" : Math.cos(a) < .25 ? "#8aa49e" : "#5e7a7a";
      g += `<path d="M${F(px + nx * wd)},${F(py + ny * wd * .5)} Q${F(px + Math.cos(a) * L * .5 + nx * wd * 1.2)},${F(py + Math.sin(a) * L * .4 + ny * wd)} ${F(ex)},${F(ey)} Q${F(px + Math.cos(a) * L * .5 - nx * wd * 1.2)},${F(py + Math.sin(a) * L * .4 - ny * wd)} ${F(px - nx * wd)},${F(py - ny * wd * .5)}Z" fill="${Tf(lit)}"/>`;
      g += `<path d="M${F(px)},${F(py)} Q${F(px + Math.cos(a) * L * .5)},${F(py + Math.sin(a) * L * .4)} ${F(ex)},${F(ey)}" stroke="${Tf("#4a6262")}" stroke-width="${F(Math.max(.5, wd * .25))}" fill="none" opacity=".5"/>`;
      g += `<circle cx="${F(ex)}" cy="${F(ey)}" r="${F(Math.max(.6, wd * .25))}" fill="${Tf("#2a2018")}"/>`; });
    return g; };
  const flowers = (px, py, kk, fog, sz, PAL, LEAF) => { const R = Math.max(2, sz * kk); let g = `<g filter="url(#sjcLeafy)">${clump(px, py + R * .1, R, fog, LEAF)}</g>`;
    const n = Math.min(140, Math.round(R * 2));
    for (let i = 0; i < n; i++) { const a = rp() * Math.PI * 2, q = Math.sqrt(rp()), fx = px + Math.cos(a) * q * R * .42, fy = py - R * .5 + Math.sin(a) * q * R * .36 - R * .05;
      g += `<circle cx="${F(fx)}" cy="${F(fy)}" r="${F(Math.max(.6, R * (.018 + rp() * .02)))}" fill="${T(mix(PAL[Math.floor(rp() * PAL.length)], HZ, fog))}"/>`; }
    return g; };
  const MARI = ["#e85a0a", "#f07a14", "#f89a26", "#ffb83a", "#d84a08"], ROSE = ["#c81e48", "#e04466", "#f088a0", "#a81430", "#f4b0bc"], LAV = ["#7a66b4", "#9a86cc", "#6a58a0"];
  const luminaria = (px, py, kk) => { const wd = Math.max(1.2, .2 * kk), h = wd * 1.4;
    return (NIGHT ? `<circle cx="${F(px)}" cy="${F(py - h * .5)}" r="${F(wd * 4)}" fill="url(#sjcGlow)" opacity=".8"/>` : "")
      + `<path d="M${F(px - wd / 2)},${F(py)} L${F(px + wd / 2)},${F(py)} L${F(px + wd / 2)},${F(py - h)} L${F(px + wd * .3)},${F(py - h * 1.08)} L${F(px)},${F(py - h)} L${F(px - wd * .3)},${F(py - h * 1.08)} L${F(px - wd / 2)},${F(py - h)}Z" fill="${NIGHT ? "#ffd48a" : "#d8c09a"}"/>`
      + `<path d="M${F(px + wd * .1)},${F(py)} L${F(px + wd / 2)},${F(py)} L${F(px + wd / 2)},${F(py - h)} L${F(px + wd * .1)},${F(py - h)}Z" fill="${NIGHT ? "#f0a850" : "#b89c74"}"/>`; };

  /* is the ground at (x, z) seen, or hidden behind nearer land? */
  const seen = (x, z) => { const y0 = sy(hT(x, z), z) - 1.5;
    for (let q = 20; q < z * .985; q += Math.max(.5, q * .012)) { const xq = x * q / z, hq = hT(xq, q); if (sy(hq, q) < y0) return false; }
    return true; };
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);
  const inBuild = (x, z) => (z > 59 && z < 84.5 && x > -25 && x < 5.2) || (x > 17 && x < 26.5 && z > 52 && z < 100) || (x < -28 && z > 33 && z < 97) || (z > 59.5 && z < 61.6 && x > 5 && x < 18.5);

  // the town's stucco houses with tile roofs, half hidden in the trees behind the mission
  for (let k = 0, n = 0; k < 400 && n < 16; k++) { const z = 150 + r() * 330, x = (r() - .5) * 1.3 * z;
    if (!free(x, z, 8) || !seen(x, z)) continue; n++; used.push([x, z, 7]);
    w.house(w.randomHouse(r, { x, z, y: hT(x, z) - .1, yaw: (r() - .5) * 40, rng: r, kind: "cottage", roof3: r() < .6 ? "hip" : "gable", gable: false,
      wall: ["#efe4cc", "#e8d4b0", "#f2ece0", "#e4c8a0", "#d8c8b0"][Math.floor(r() * 5)], roof: ["#a8502e", "#b4603a", "#984428"][Math.floor(r() * 3)], shut: null, clap: false, porch: false, chim: undefined, noRefl: true })); }
  // fan palms standing over the town
  [[7.4, 128, 19, .02], [-1.5, 152, 21, -.015], [-40, 222, 22, .02], [-62, 300, 24, -.02], [30, 205, 20, .015], [37, 262, 23, -.01], [-12, 340, 22, .01], [64, 330, 24, .02], [-95, 380, 24, .015]].forEach(([x, z, hM, lean]) => {
    const y0 = hT(x, z); used.push([x, z, 2]);
    w.sprite({ x, z, y: y0 - .2, fn: (px, py, kk, fog) => palm(px, py, hM * kk, fog, lean) }); });
  // oaks, sycamores, eucalyptus and pepper trees behind and around the mission, then the hills' oaks
  for (let k = 0, n = 0; k < 40000 && n < 2600; k++) { const z = 96 + Math.pow(r(), 2.1) * 1300, u = (r() - .5) * 1.4, x = u * z;
    if (inBuild(x, z) || !free(x, z, 1.6) || !seen(x, z)) continue; n++;
    const y0 = hT(x, z), q = r(), RAMP = z > 600 ? (q < .7 ? OAKG : PEPP) : q < .35 ? OAKG : q < .55 ? SYC : q < .78 ? EUC : PEPP;
    const room = (sy(y0, z) - (yLim(x / z) + 10 + 24 * N1(x / 30, z / 60))) * z / FL;
    const hM = Math.max(3, Math.min((RAMP === EUC ? 13 : 8) + r() * 6, room));
    w.sprite({ x, z, y: y0 - .3, fn: (px, py, kk, fog) => hM * kk > 70 ? broadleaf(px, py, hM * kk, RAMP, fog, Math.min(170, Math.round(hM * kk * .55)), { wide: RAMP === EUC ? .7 : 1.1 })
      : hM * kk > 28 ? `<g filter="url(#sjcLeafy)">${clump(px, py, hM * kk, fog * .9, RAMP)}</g>` : clump(px, py, Math.max(2.5, hM * kk), fog * .9, RAMP) }); }

  // the pepper tree by the chapel, an olive at the arcade's end, a pomegranate in the beds
  [[14, 47, 6.0, PEPP, { weep: 160, wide: 1.25 }], [-21, 40, 5.2, OAKG, { wide: 1.1 }], [9.5, 34, 3.6, PEPP, { wide: .9 }]].forEach(([x, z, hM, RAMP, o]) => { used.push([x, z, 2.2]);
    w.sprite({ x, z, y: hT(x, z), fn: (px, py, kk, fog) => broadleaf(px, py, hM * kk, RAMP, fog, Math.min(300, Math.round(hM * kk * .8)), o) }); });
  // bougainvillea over the garden wall, the arcade's end and the campanario's foot
  const boug = (x, z, y, wM, hM) => w.sprite({ x, z, y, bias: -1, fn: (px, py, kk, fog) => { let g = "";
    const n = Math.min(60, Math.round(wM * kk / 5) + 6);
    for (let i = 0; i < n; i++) { const t = i / n, bx = px + (t - .5) * wM * kk + (rp() - .5) * 10, by = py - rp() * hM * kk, R = Math.max(2, kk * (.3 + rp() * .35));
      g += clump(bx, by + R * .5, R * 2, fog, rp() < .25 ? PEPP : BOUG); }
    return `<g filter="url(#sjcLeafy)">${g}</g>`; } });
  boug(12.6, CPZ - .45, .3, 3.6, 2.4); boug(16.2, CPZ - .45, .3, 2.6, 2.0); boug(5.9, CPZ - .7, 0, 1.0, 2.0); boug(AX + .6, AZ0 + .2, 0, 1.2, 3.6); boug(-12.6, 62.6, 0, 1.4, 2.6);

  // the beds: roses, marigolds, lavender, prickly pear, agave; luminarias along the path
  const beds = [];
  for (let k = 0, n = 0; k < 6000 && n < 240; k++) { const z = 13 + Math.pow(rp(), 1.1) * 46, x = (rp() - .5) * 1.25 * z;
    if (isPath(x, z) || inBuild(x, z) || Math.hypot(x - FX, z - FZ) < 4.6 || !free(x, z, .5)) continue;
    if (x < AX + .5) continue;
    n++; used.push([x, z, .45]); beds.push([x, z]); }
  beds.forEach(([x, z], i) => { const q = hash(i, 7), y0 = hT(x, z) - .05;
    if (q < .05) w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => pricklyPear(px, py, kk, fog, .9 + hash(i, 9) * .6) });
    else if (q < .13) w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => agave(px, py, kk, fog, .7 + hash(i, 9) * .5) });
    else if (q < .48) w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => flowers(px, py, kk, fog, .38 + hash(i, 9) * .2, MARI, OAKG) });
    else if (q < .68) w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => flowers(px, py, kk, fog, .6 + hash(i, 9) * .35, ROSE, PEPP) });
    else if (q < .8) w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => flowers(px, py, kk, fog, .4 + hash(i, 9) * .2, LAV, EUC) });
    else w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => `<g filter="url(#sjcLeafy)">${clump(px, py, Math.max(2.5, (.4 + hash(i, 9) * .4) * kk), fog, hash(i, 11) < .5 ? PEPP : OAKG)}</g>` }); });
  // a big prickly pear and an agave framing the near corners
  w.sprite({ x: -7.2, z: 11.5, y: 0, fn: (px, py, kk, fog) => pricklyPear(px, py, kk, fog, 1.3) });
  w.sprite({ x: 6.8, z: 12.5, y: 0, fn: (px, py, kk, fog) => agave(px, py, kk, fog, 1.1) });
  w.sprite({ x: 11.5, z: 21, y: 0, fn: (px, py, kk, fog) => pricklyPear(px, py, kk, fog, 1.7) });
  for (let z = 9; z < 58; z += 2.3) [-1, 1].forEach(sd => { const x = pathX(z) + sd * 1.6;
    if (Math.hypot(x - FX, z - FZ) < 4.4) return;
    w.sprite({ x, z, y: hT(x, z), fn: (px, py, kk) => luminaria(px, py, kk) }); });

  /* ---------------- assemble: the land and haze, then everything on it ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  s += w.draw({ where: isR });
  s += `<rect x="0" y="290" width="${W}" height="140" fill="url(#sjcHaze)" opacity=".35"/>`;
  if (NIGHT) s += `<ellipse cx="1180" cy="500" rx="520" ry="46" fill="url(#sjcPool)"/><ellipse cx="1520" cy="496" rx="160" ry="22" fill="url(#sjcPool)"/>`;
  s += w.draw({ where: notR });
  // ornamental grass and agave tips along the bottom edge
  { let g = "";
    for (let i = 0; i < 200; i++) { const x = r() * W, y = 705 + r() * 25, hh = 30 + r() * 70, bend = (r() - .5) * 40;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(["#8a8a4a", "#b4a462", "#6a7a3a", "#c8b47a"][Math.floor(r() * 4)])}" stroke-width="${F(1.5 + r() * 2)}" fill="none" stroke-linecap="round"/>`; }
    s += g; }

  s += `<rect width="${W}" height="${H}" fill="url(#sjcLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".06"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#sjcPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
