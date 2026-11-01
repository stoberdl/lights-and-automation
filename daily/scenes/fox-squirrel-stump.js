/* Fox Squirrel Stump: National Nut Day (Oct 22, 2026) in a city park.
   Seen from 0.8 m, level with the top of a sawn white-oak stump: a fox squirrel
   sits up on it nibbling an acorn, tail curled over its back, its stash around
   it (acorns, hickory nuts, a black walnut in its husk, an Ohio buckeye, shell
   bits). Behind: a leaf-strewn lawn, a gravel path winding away, a park bench
   with a blue jay, an acorn-globe lamp post, burning-bush hedges, a stone
   shelter, park trees in colour, and the downtown towers (one tower's
   stepped crown) faint in the haze. Golden afternoon sun from behind the left
   shoulder.
   opts.time === "night": the 86% waxing gibbous moon, stars, the lamp lit and
   the city glowing; a southern flying squirrel (Ohio's nocturnal one) has the
   stump now, with its gliding fold along the flank and big night eyes.
   Ground is two world3d() rasters; bench, lamp, shelter, towers and trees are
   placed in metres by the same camera (eye 0.8 m). The stump, the stash and the
   squirrel are drawn in pixels at their projected size. Same shape as
   reference/autumn-valley.js. Needs rng(), mix(), world3d(), noise2(),
   mountainField(), hexRGB() and rgbTone() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                    */
function foxSquirrelStumpArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1022;
  const r = rng(seed), rs = rng(seed + 5), rp = rng(seed + 29), rg = rng(seed + 41), rf = rng(seed + 77);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -160, LY = 300, WY = 410;
  const T = c => NIGHT ? mix(mix(c, "#6a78a0", .45), "#081030", .6) : c;
  const HZ = NIGHT ? "#28325a" : "#f0dcc0", RIM = NIGHT ? "#b8c8f0" : "#fff0d0", SHADE = NIGHT ? "#04060e" : "#3a3450", LAMP = "#ffc46a";
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

  /* ---------------- sky: golden late afternoon, or a gibbous-moon night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040824"/><stop offset=".5" stop-color="#0c143c"/><stop offset=".86" stop-color="#20305e"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#5a8cc4"/><stop offset=".42" stop-color="#8eb2d6"/><stop offset=".74" stop-color="#cfd6d8"/><stop offset=".9" stop-color="#f0d8b8"/><stop offset="1" stop-color="#f6d4a4"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#c8d4ff" stop-opacity=".22"/><stop offset=".3" stop-color="#8a9ad8" stop-opacity=".08"/><stop offset="1" stop-color="#8a9ad8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6e0" stop-opacity="1"/><stop offset=".12" stop-color="#ffe2b0" stop-opacity=".65"/><stop offset=".4" stop-color="#ffcc90" stop-opacity=".2"/><stop offset="1" stop-color="#ffcc90" stop-opacity="0"/>`;
  const MX = 1030, MY = 150, MR = 22;
  let s = `<defs id="fsdefs">
    <linearGradient id="fsSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="fsLight" cx="${NIGHT ? MX : LX}" cy="${NIGHT ? MY : LY}" r="${NIGHT ? 700 : 1800}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="fsHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".9"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="fsGlow"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".42"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="fsPool"><stop offset="0" stop-color="#ffd890" stop-opacity=".5"/><stop offset=".6" stop-color="#ffb860" stop-opacity=".14"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></radialGradient>
    <radialGradient id="fsMoon"><stop offset="0" stop-color="#e8eeff" stop-opacity=".5"/><stop offset=".3" stop-color="#b0c0f0" stop-opacity=".12"/><stop offset="1" stop-color="#b0c0f0" stop-opacity="0"/></radialGradient>
    <radialGradient id="fsCity" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="#ffb070" stop-opacity=".35"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient>
    <filter id="fsLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="fsFur" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".35" numOctaves="2" seed="31" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="fsCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="3" seed="61" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.5"/></filter>
    <filter id="fsCirrus" x="-10%" y="-60%" width="120%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".004 .05" numOctaves="3" seed="37" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="3"/></filter>
    <filter id="fsPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="19"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="fsSoft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="fsBlur2"><feGaussianBlur stdDeviation="2.5"/></filter>
    <filter id="fsBlur8"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fsSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 1000; i++) { const x = rs() * W, y = Math.pow(rs(), 1.25) * 400, big = rs() < .06, dm = Math.hypot(x - MX, y - MY) < 280 ? .3 : 1;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.8 : F(.5 + rs() * .7)}" fill="${rs() < .18 ? "#ffe6c4" : "#e6ecff"}" opacity="${F((.25 + rs() * .6) * (1 - y / 450) * dm)}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#fsLight)"/>`;
    // 86% waxing gibbous: lit on the right (toward the set sun), the terminator bulging into the left limb
    const tr = MR * (2 * .86 - 1);
    s += `<circle cx="${MX}" cy="${MY}" r="${MR * 8}" fill="url(#fsMoon)"/>
      <g transform="rotate(-24 ${MX} ${MY})"><circle cx="${MX}" cy="${MY}" r="${MR}" fill="#323a62" opacity=".75"/>
      <path d="M${MX},${MY - MR} A${MR},${MR} 0 0 1 ${MX},${MY + MR} A${F(tr)},${MR} 0 0 1 ${MX},${MY - MR}Z" fill="#f4f2e6"/>
      <circle cx="${MX + MR * .35}" cy="${MY - MR * .3}" r="${MR * .18}" fill="#c8c6c0" opacity=".55"/><circle cx="${MX + MR * .1}" cy="${MY + MR * .35}" r="${MR * .24}" fill="#c8c6c0" opacity=".45"/><circle cx="${MX - MR * .25}" cy="${MY - MR * .05}" r="${MR * .14}" fill="#c8c6c0" opacity=".4"/></g>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#fsLight)"/>`;
    s += `<g class="rays" opacity=".08" filter="url(#fsSoft)">`;
    for (let k = 0; k < 7; k++) { const a = -.12 + k * .075, L = 2400;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .015) * L)},${F(LY + Math.sin(a - .015) * L)} L${F(LX + Math.cos(a + .015) * L)},${F(LY + Math.sin(a + .015) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a few fair-weather heaps low down, cirrus high ---------------- */
  {
    s += `<g class="drift1" filter="url(#fsCirrus)">`;
    for (let i = 0; i < 10; i++) { const x = 250 + rs() * 2000, y = 60 + rs() * 150, L = 260 + rs() * 420, b = (rs() - .5) * 30;
      s += `<path d="M${F(x)},${F(y)} q${F(L * .5)},${F(b - 14)} ${F(L)},${F(b)}" stroke="${NIGHT ? "#222a58" : "#fff6ea"}" stroke-width="${F(4 + rs() * 9)}" fill="none" stroke-linecap="round" opacity="${F(NIGHT ? .28 : .2 + rs() * .2)}"/>`; }
    s += `</g>`;
  }
  const heap = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#fsCloudy)">`;
    const n = 7 + Math.floor(rs() * 3), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.09 + rs() * .07) * (1 - Math.abs(t - .5) * .9);
      lobes.push([x + (t - .5) * w, y - R * (.5 + rs() * .5), R]); }
    if (NIGHT) {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.2)}" ry="${F(R * .7)}" fill="#1a2250"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .2)}" cy="${F(ly - R * .25)}" rx="${F(R * .7)}" ry="${F(R * .35)}" fill="#3a4680" opacity=".5"/>`);
    } else {
      c += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(w * .52)}" ry="${F(w * .05)}" fill="#c8b4b0"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .1)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.2)}" ry="${F(R * .8)}" fill="#d4c0bc"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .08)}" cy="${F(ly - R * .05)}" rx="${F(R * 1.05)}" ry="${F(R * .72)}" fill="#f2e2d6"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .38)}" cy="${F(ly - R * .3)}" rx="${F(R * .55)}" ry="${F(R * .38)}" fill="#fff6e8"/>`);
    }
    return c + `</g></g>`;
  };
  s += `<g opacity="${NIGHT ? .7 : .9}">` + heap(420, 352, 300, "drift2") + heap(760, 330, 200, "drift3") + heap(1960, 345, 330, "drift2") + heap(2380, 362, 220, "drift3") + `</g>`;
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 0.8 m above the lawn (y = 0); metres, x right, y up, z away.
     Stump at z 2.6 (top 0.70 m), bench z 22, lamp z 40, shelter z 120, park trees z 60-400,
     woods beyond, downtown towers at z 3000-3600. */
  const EYE = .8, FL = 2300;
  const LIGHT = NIGHT ? [-.3, .5, .8] : [-.8, .45, -.35];
  const w = world3d({ h: EYE, hy: WY, f: FL, light: LIGHT, tone: T, fog: HZ, fogK: .0006,
    shadow: SHADE, rim: RIM, shade: .5, hi: .3, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const capY = px => 256 + 70 * Math.exp(-(((px - 1330) / 170) ** 2));
  const MF = mountainField({ seed: 6213, scale: 2400, oct: 5, peaks: [
    { x: -6400, z: 8000, h: 210, rx: 3200, rz: 2000 }, { x: 1800, z: 10500, h: 170, r: 3000 }, { x: 7600, z: 7400, h: 240, r: 2600 } ] });
  const hG = (x, z) => {
    if (z < 70) return .01 + .01 * N3(x / 3, z / 3);
    const roll = sm((z - 160) / 420) * (1.6 + 1.5 * N1(x / 300, z / 300));
    return Math.max(.01, .01 + roll + MF(x, z) * sm((z - 2600) / 3200)); };
  /* the gravel path: in from the lower left, curving away to the right of centre */
  const xp = z => -3.6 + 5.2 * (1 - Math.exp(-Math.max(0, z - 6) / 22)) + .03 * Math.max(0, z - 6);

  /* ground colour: leaf litter over the lawn, the path, mown grass further off, woods beyond */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const GR = H3("#5e7032"), GR2 = H3("#7e8a3e"), LAWN = H3("#7a8c3c"), LAWN2 = H3("#9a9a48"),
        LBR = H3("#7a4a22"), LOR = H3("#c0642a"), LGO = H3("#d8a43e"), LRD = H3("#9a2e1a"), GRV = H3("#b8a88a"), GRV2 = H3("#8a7c66");
  const FOR = ["#3a4628", "#5a5026", "#c0602a", "#a4321c", "#d89a30", "#7a4220"].map(H3);
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const col = (x, y, z, n) => {
    if (y > 6) {                                                                      // the far woods in colour
      const k = N1(x / 300, z / 300) * .5 + .5; let c = L3(FOR[0], FOR[1], k);
      c = L3(c, FOR[2 + Math.floor(hash(Math.floor(x / 140), Math.floor(z / 140)) * 4)], sm((N3(x / 420, z / 420) + .2) / .4) * .8);
      return c.map(v => v * (.8 + .4 * (N2(x / 40, z / 40) * .5 + .5))); }
    // fine grain laid out in screen terms (about 5 px each way at any depth), so it never streaks
    const fine = N3(x * FL / (5 * z), z * FL * EYE / (5 * z * z)) * .7 + N3(x / .4 + 9, z / .4) * .3 * sm(1 - z / 20);
    const near = sm(1 - (z - 20) / 70);
    let lc = L3(LBR, LOR, .5 + .7 * N1(x / 1.4, z / 1.4) + .3 * fine);
    lc = L3(lc, LGO, sm(N3(x / .9 + 4, z / .9) * 1.4 + .2 * fine));
    lc = L3(lc, LRD, sm((N2(x / .7 + 11, z / .7) - .35) * 3) * .7);
    const leafK = sm(.3 + .55 * N2(x / 2.6, z / 2.6) + .6 * fine) * (.35 + .65 * near);
    let g = L3(L3(LAWN, LAWN2, .5 + .6 * N2(x / 9, z / 9)), L3(GR, GR2, .5 + .5 * fine), near);
    // long shade from park trees off the left edge falls across the lawn in bands
    const shade = NIGHT ? 0 : sm((N1(x / 9 + z / 14, z / 30 + 3) + .05) * 3) * .28 * sm(1 - z / 260);
    const d = Math.abs(x - xp(z));
    if (d < 1.15 && z < 400) {                                                         // gravel, with leaves blown onto it
      const e = sm((1.15 - d) / .2);
      let c = L3(GRV, GRV2, .5 + .6 * fine + .3 * N2(x / 2, z / 2));
      c = L3(c, lc, leafK * .45);
      g = L3(L3(g, lc, leafK), c, e);
    } else g = L3(g, lc, leafK);
    return g.map(v => v * (.86 + .26 * fine) * (1 - shade)); };
  const far = w.raster({ z0: 1400, z1: 26000, step: .0016, minStep: 2, scale: .6, top: 230, bottom: WY + 8, h: hG, col, tone: rgbTone(T), fog: HZ, fogK: .00026, amb: NIGHT ? .6 : .58, noRefl: true, key: 1e7 });
  const near = w.raster({ z0: 5.4, z1: 1400, step: .0011, minStep: .03, scale: .75, top: 230, bottom: H, h: hG, col, tone: rgbTone(T), fog: HZ, fogK: .0006, amb: NIGHT ? .55 : .7, noRefl: true, key: 5e6 });
  const seen = (x, z, y) => { const y0 = sy(y, z) - 1.2;
    for (let q = 60; q < z * .985; q += Math.max(.5, q * .01)) { const xq = x * q / z; if (sy(hG(xq, q), q) < y0) return false; }
    return true; };
  const fogC = (c, fog) => T(mix(c, HZ, fog));

  /* ---------- trees (park trees, woods): many lit leaf clumps ---------- */
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const GOLDR = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const OAK = ["#22281a", "#2e361c", "#3e4620", "#525a26", "#68702e", "#80843a", "#9c9c52", "#bab874"];
  const RED = ["#3a0a0e", "#5a1014", "#7e1418", "#a41c1e", "#c42a24", "#dc4030", "#ec6a4a", "#f8a07a"];
  const YEW = ["#0e1a12", "#142418", "#1a2e1e", "#223a24", "#2c4a2c", "#3a5a34", "#4e6e40", "#6a8452"];
  const LDIR = NIGHT ? [-.35, -.6] : [-.9, -.25];
  const broadleaf = (x, y, hp, RAMP, fog, n) => {
    const Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .03), ty = y - hp * .32;
    g += `<ellipse cx="${F(x + hp * .3)}" cy="${F(y + 1)}" rx="${F(hp * .42)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .5)},${F(ty)} L${F(x + tb * .5)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5a4c40")}"/>`;
    g += `<path d="M${F(x + tb * .1)},${F(y)} L${F(x + tb * .1)},${F(ty)} L${F(x + tb * .5)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#30261e")}"/>`;
    const cx = x, cy = y - hp * .6, rx = hp * (.36 + r() * .14), ry = hp * .38, cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * LDIR[0] + (py - cy) / ry * LDIR[1]) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.022 + r() * .022)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx + a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#fsLeafy)">${cg}</g>`; };
  const clump = (x, y, sz, fog, RAMP, wide = 1) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1a1820", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .15), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5 * wide, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26 * wide, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(90, Math.round(sz * wide / 1.4)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .42 * wide, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) / wide * LDIR[0] + (py - y + sz * .5) * LDIR[1] * .6, R = sz * (.1 + r() * .09);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };
  const pickRamp = q => q < .3 ? MAPLE : q < .55 ? GOLDR : q < .75 ? RUST : OAK;
  const treeFn = (hM, RAMP) => (px, py, kk, fog) => { const hp = hM * kk;
    return hp > 60 ? broadleaf(px, py, hp, RAMP, fog, Math.min(260, Math.round(hp * .65)))
      : hp > 26 ? `<g filter="url(#fsLeafy)">${clump(px, py, hp, fog * .9, RAMP)}</g>` : clump(px, py, Math.max(2.5, hp), fog * .9, RAMP); };
  const room = (x, z, y0) => (sy(y0, z) - capY(sx(x, z))) * z / FL;
  const plant = (x, z, hM, tag) => { const y0 = hG(x, z), u = sx(x, z); if (u < -120 || u > W + 120) return;
    if (Math.abs(x - xp(z)) < 2 && z < 400) return;
    const rm = room(x, z, y0); if (rm < hM * .55) return; const h = Math.min(hM, rm) * (.8 + r() * .2);
    if (!seen(x, z, y0 + h * .7)) return;
    w.sprite({ x, z, y: y0 - .2, tag, fn: treeFn(h, pickRamp(r())) }); };
  // park trees scattered over the lawn, a tree line behind the park, woods beyond
  for (let i = 0; i < 260; i++) { const z = 60 + Math.pow(r(), .8) * 340, x = (r() - .5) * 1.5 * z; if (N2(x / 90, z / 90 + 7) > -.15) plant(x, z, 6 + r() * 16, "far"); }
  for (let i = 0; i < 700; i++) { const z = 420 + r() * 160, x = (r() - .5) * 1.6 * z; plant(x, z, 8 + r() * 18, "far"); }
  const lot = (x, z) => N2(x / 340 + 2.7, z / 340) > -.15 + .1 * Math.sin(x / 80);
  for (let i = 0; i < 1500; i++) { const z = 620 + r() * 1300, x = (r() - .5) * 1.4 * z; if (lot(x, z)) plant(x, z, 13 + r() * 13, "far"); }

  /* ---------- downtown in the haze: a cluster of towers, one with a stepped crown ---------- */
  const towers = [[230, 3200, 34, 26, 120, "#8a909a"], [262, 3350, 30, 30, 140, "#7a8290"], [300, 3100, 26, 24, 168, "#a49a88"], [338, 3400, 40, 30, 190, "#6a7484"],
    [376, 3250, 34, 28, 120, "#8a8478"], [410, 3500, 36, 30, 150, "#7a8088"], [446, 3300, 24, 24, 90, "#96948c"], [196, 3450, 28, 26, 96, "#82868e"]];
  towers.forEach(([x, z, wd, dp, h, c]) => {
    w.box({ x, z, w: wd, d: dp, h, c, top: mix(c, "#ffffff", .2) }).tag = "city";
    if (h === 168) { // the tall tower: setbacks and a pyramid crown
      w.box({ x, z, y: h, w: wd * .7, d: dp * .7, h: 14, c }).tag = "city";
      w.box({ x, z, y: h + 14, w: wd * .45, d: dp * .45, h: 10, c }).tag = "city";
      w.cyl({ x, z, y: h + 24, r0: wd * .3, r1: 0, h: 16, n: 4, rot: Math.PI / 4, c }).tag = "city"; }
    if (NIGHT) w.sprite({ x, z: z - dp / 2 - 1, y: 0, tag: "city", fn: (px, py, k) => { let g = "";
      const hw = wd / 2 * k, hh = h * k;
      for (let i = 0; i < hh * hw * .05; i++) g += `<rect x="${F(px - hw + rf() * hw * 2)}" y="${F(py - rf() * hh)}" width="1.2" height="1" fill="#ffd890" opacity="${F(.3 + rf() * .5)}"/>`;
      if (h > 140) g += `<circle cx="${F(px)}" cy="${F(py - hh - (h === 168 ? 40 * k : 0))}" r="1.6" fill="#ff4a3a"/>`;
      return g; } }); });

  /* ---------- the stone shelter house across the park ---------- */
  { const hr = rng(seed + 61);
    w.house({ x: -34, z: 128, yaw: 14, w: 11, d: 7, h: 3.2, rh: 2.6, wall: "#a89480", roof: "#4a3a34", trim: "#e8dcc4", roof3: "hip", clap: false, chim: .8, chimC: "#8a7a6a", shut: null, doorC: "#4a2a1a", winGap: 2.4, rng: hr, tag: "far" }); }

  /* ---------- hedges and shrubs: burning bush in scarlet, dark yews ---------- */
  const shrubs = [];
  for (let i = 0; i < 90; i++) { const z = 24 + Math.pow(rg(), .8) * 120, x = (rg() - .5) * 1.4 * z;
    if (Math.abs(x - xp(z)) < 2.2) continue; const px = sx(x, z); if (px > 1020 && px < 1680 && z < 60) continue;
    shrubs.push([x, z, rg() < .55 ? RED : rg() < .5 ? YEW : RUST, .55 + rg() * .75, 1 + rg() * .7]); }
  // a run of hedge along the left of the path
  for (let k = 0; k < 14; k++) { const z = 30 + k * 2.6, x = xp(z) - 3.4 - rg() * .4; shrubs.push([x, z, k % 5 === 3 ? YEW : RED, .9 + rg() * .25, 1.3]); }
  /* a shrub: an irregular mound of many small lit leaf clusters over a dark core, twigs showing at the foot */
  const shrub = (x, y, sz, fog, RAMP, wide) => { const Tf = c => T(mix(c, HZ, fog)), hw2 = sz * .55 * wide;
    let g = `<ellipse cx="${F(x + sz * .3)}" cy="${F(y)}" rx="${F(hw2 * 1.1)}" ry="${F(Math.max(1, sz * .05))}" fill="#000" opacity=".22"/>`;
    const top = u => sz * (.62 + .3 * Math.cos(u * 1.5) + .14 * Math.sin(u * 7 + x) + .08 * Math.sin(u * 13 + y));   // a lumpy crown line
    let core = `M${F(x - hw2)},${F(y)}`;
    for (let i = 0; i <= 16; i++) { const u = -1 + i / 8; core += ` L${F(x + u * hw2)},${F(y - top(u) * Math.sqrt(1 - u * u * .85))}`; }
    core += ` L${F(x + hw2)},${F(y)}Z`;
    g += `<path d="${core}" fill="${Tf(RAMP[1])}"/>`;
    if (sz > 12) for (let i = 0; i < 6; i++) { const u = (rg() - .5) * 1.6; g += `<path d="M${F(x + u * hw2 * .7)},${F(y)} l${F((rg() - .5) * sz * .2)},${F(-sz * .3)}" stroke="${Tf("#3a2a1e")}" stroke-width="${F(Math.max(.6, sz * .015))}"/>`; }
    const n = Math.max(6, Math.min(340, Math.round(sz * sz * wide * .06))), cs = [];
    for (let i = 0; i < n; i++) { const u = (rg() * 2 - 1), tt = top(u) * Math.sqrt(1 - u * u * .85), v = Math.pow(rg(), .7);
      const px = x + u * hw2 * .95, py = y - sz * .08 - v * (tt - sz * .08);
      const lit = cl(((-u) * -LDIR[0] * .5 + v * .55) * .9 + (rg() - .5) * .3 + .05);
      cs.push([px, py, lit, sz * (.05 + rg() * .05)]); }
    cs.sort((a, b) => a[2] - b[2]);
    cs.forEach(([px, py, v, R]) => g += `<path d="${blobP(px, py, R, R * .8, 6, rg)}" fill="${Tf(RAMP[Math.min(7, 1 + Math.floor(v * 7))])}"/>`);
    return g; };
  shrubs.forEach(([x, z, RAMP, hM, wide]) => w.sprite({ x, z, y: 0, tag: "mid", fn: (px, py, k, fog) => { const sz = hM * k;
    return sz > 16 ? `<g filter="url(#fsLeafy)">${shrub(px, py, sz, fog, RAMP, wide)}</g>` : shrub(px, py, sz, fog, RAMP, wide); } }));

  /* ---------- the bench (with a blue jay on its back), a litter basket, the lamp post ---------- */
  const BX = -2.7, BZ = 22;
  { const IRON = "#22302a", WOOD = "#8a5a32";
    [[-.82, 0], [.82, 0]].forEach(([dx]) => { w.box({ x: BX + dx, z: BZ, w: .07, d: .5, h: .44, c: IRON, tag: "mid" });
      w.box({ x: BX + dx, z: BZ + .26, w: .07, d: .07, h: .9, c: IRON, tag: "mid" }); });
    for (let k = 0; k < 3; k++) w.box({ x: BX, z: BZ - .18 + k * .17, y: .44, w: 1.9, d: .12, h: .04, c: mix(WOOD, "#ffffff", k * .05), tag: "mid" });
    for (let k = 0; k < 2; k++) w.box({ x: BX, z: BZ + .29, y: .56 + k * .16, w: 1.9, d: .04, h: .11, c: WOOD, tag: "mid" });
    w.sprite({ x: BX, z: BZ - .4, y: 0, bias: .8, tag: "mid", fn: (px, py, k) => `<ellipse cx="${F(px + k * .5)}" cy="${F(py)}" rx="${F(k * 1.2)}" ry="${F(k * .1)}" fill="#000" opacity=".22"/>` });
    // the blue jay: crest, black necklace, white wing bars, facing left
    if (!NIGHT) w.sprite({ x: BX + .55, z: BZ + .29, y: .78, bias: -.5, tag: "mid", fn: (px, py, k) => { const m = v => v * k;
      return `<path d="M${F(px + m(.1))},${F(py - m(.02))} l${F(m(.13))},${F(m(.06))} l${F(m(.01))},${F(-m(.03))}Z" fill="#2a4a8a"/>
        <ellipse cx="${F(px)}" cy="${F(py - m(.07))}" rx="${F(m(.075))}" ry="${F(m(.05))}" fill="#4a7ac0"/>
        <ellipse cx="${F(px - m(.01))}" cy="${F(py - m(.05))}" rx="${F(m(.05))}" ry="${F(m(.03))}" fill="#e8ecf0"/>
        <path d="M${F(px + m(.0))},${F(py - m(.09))} l${F(m(.07))},${F(m(.01))} M${F(px + m(.01))},${F(py - m(.07))} l${F(m(.06))},${F(m(.01))}" stroke="#ffffff" stroke-width="${F(Math.max(.6, m(.008)))}"/>
        <circle cx="${F(px - m(.06))}" cy="${F(py - m(.12))}" r="${F(m(.035))}" fill="#5a8ad0"/>
        <path d="M${F(px - m(.05))},${F(py - m(.15))} l${F(m(.04))},${F(-m(.05))} l${F(m(.0))},${F(m(.05))}Z" fill="#4a7ac0"/>
        <path d="M${F(px - m(.1))},${F(py - m(.11))} q${F(m(.04))},${F(m(.05))} ${F(m(.08))},${F(m(.02))}" stroke="#1a1a22" stroke-width="${F(Math.max(.6, m(.008)))}" fill="none"/>
        <path d="M${F(px - m(.093))},${F(py - m(.125))} l${F(-m(.03))},${F(m(.008))} l${F(m(.03))},${F(m(.006))}Z" fill="#1a1a22"/>
        <circle cx="${F(px - m(.07))}" cy="${F(py - m(.128))}" r="${F(Math.max(.5, m(.006)))}" fill="#0a0a10"/>`; } });
  }
  // a wire litter basket at the path edge
  w.cyl({ x: -1.75, z: 22.6, r0: .26, r1: .28, h: .78, n: 14, c: "#2a3a30", top: "#1a2018", tag: "mid" });
  // an acorn-globe lamp post on the far side of the path
  const LPX = 6.6, LPZ = 40;
  w.cyl({ x: LPX, z: LPZ, r0: .16, r1: .12, h: .5, n: 10, c: "#1e2a24", tag: "mid" });
  w.cyl({ x: LPX, z: LPZ, y: .5, r0: .07, r1: .05, h: 2.5, n: 8, c: "#24322a", tag: "mid" });
  w.sprite({ x: LPX, z: LPZ - .1, y: 3.0, tag: "mid", fn: (px, py, k) => { const R = .2 * k;
    let g = `<path d="M${F(px - R * .5)},${F(py)} l${F(R)},0 l${F(-R * .2)},${F(-R * .3)} l${F(-R * .6)},0Z" fill="${T("#24322a")}"/>`;
    g += NIGHT ? `<circle cx="${F(px)}" cy="${F(py - R * 1.2)}" r="${F(R * 9)}" fill="url(#fsGlow)" opacity=".75"/><ellipse cx="${F(px)}" cy="${F(py - R * 1.2)}" rx="${F(R * .9)}" ry="${F(R * 1.1)}" fill="#fff0c0"/>`
      : `<ellipse cx="${F(px)}" cy="${F(py - R * 1.2)}" rx="${F(R * .9)}" ry="${F(R * 1.1)}" fill="#e8ecee"/><ellipse cx="${F(px - R * .3)}" cy="${F(py - R * 1.45)}" rx="${F(R * .3)}" ry="${F(R * .4)}" fill="#ffffff" opacity=".8"/><ellipse cx="${F(px + R * .35)}" cy="${F(py - R * 1.1)}" rx="${F(R * .4)}" ry="${F(R * .7)}" fill="#a8b0b8" opacity=".6"/>`;
    g += `<path d="M${F(px - R * .3)},${F(py - R * 2.2)} q${F(R * .3)},${F(-R * .4)} ${F(R * .6)},0Z" fill="${T("#24322a")}"/>`;
    return g; } });

  /* ---------- leaf litter and fallen nuts on the near lawn ---------- */
  const LEAFC = ["#8a3a18", "#b0501e", "#c8742a", "#d89a36", "#e4b84a", "#9a6a2a", "#6a4a26", "#a8321c", "#5a3a1e", "#c08a3a"];
  const leafG = (px, py, R, fog, ang, sq, c) => {
    const pts = []; const n = 7;
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, rr = R * (k % 2 ? .55 : 1) * (.85 + rp() * .3);
      pts.push([px + Math.cos(a + ang) * rr, py + Math.sin(a + ang) * rr * sq]); }
    const cc = fogC(c, fog);
    let g = `<path d="M${pts.map(p => F(p[0]) + "," + F(p[1])).join(" L")}Z" fill="${cc}" stroke="${mix(cc, "#000000", .3)}" stroke-width=".5" stroke-linejoin="round"/>`;
    if (R > 6) g += `<path d="M${F(px - Math.cos(ang) * R * .9)},${F(py - Math.sin(ang) * R * .9 * sq)} L${F(px + Math.cos(ang) * R * .9)},${F(py + Math.sin(ang) * R * .9 * sq)}" stroke="${mix(cc, "#000000", .3)}" stroke-width=".7" opacity=".7"/>`;
    if (R > 4 && rp() < .5) g += `<path d="M${pts.slice(0, 4).map(p => F(p[0]) + "," + F(p[1] - .6)).join(" L")}" stroke="${fogC(NIGHT ? "#8a9ac8" : "#fff0c8", fog)}" stroke-width=".8" fill="none" opacity=".5"/>`;
    return g; };
  for (let i = 0; i < 4200; i++) { const z = 5.6 + Math.pow(r(), 1.3) * 34, x = (r() - .5) * 1.25 * z, sz = .045 + r() * .05, a = r() * 6, c = LEAFC[Math.floor(r() * LEAFC.length)];
    w.sprite({ x, z, y: 0, bias: .05, fn: (px, py, k, fog) => leafG(px, py, sz * k, fog, a, EYE / z * 1.2 + .05, c) }); }
  // grass blades poking up through the litter
  for (let i = 0; i < 2600; i++) { const z = 5.6 + Math.pow(r(), .8) * 26, x = (r() - .5) * 1.25 * z, len = .03 + r() * .05;
    w.sprite({ x, z, y: 0, bias: .02, fn: (px, py, k2) => { const L = len * k2, Cs = ["#6a7a3a", "#8a8a46", "#5a6a32", "#a09a52"]; let g = "";
      for (let b = 0; b < 3; b++) { const bend = (r() - .5) * L * .8, x0 = px + (r() - .5) * L * .6, c = T(mix(Cs[Math.floor(r() * Cs.length)], bend < 0 && !NIGHT ? RIM : "#2a3a20", .2));
        g += `<path d="M${F(x0)},${F(py)} q${F(bend * .3)},${F(-L * .55)} ${F(bend)},${F(-L)}" stroke="${c}" stroke-width="${F(Math.max(.7, L * .08))}" fill="none" stroke-linecap="round"/>`; }
      return g; } }); }

  /* nuts: acorn, hickory, black walnut (husk), buckeye, shell bits. px, py = where it rests; k px per metre */
  const nut = (type, px, py, k, fog, ang = 0) => {
    const C = c => fogC(c, fog), m = v => v * k; let g = "";
    if (type === "acorn") { const a = m(.011), b = m(.015), cy = py - b * .9, rot = ang * 57.3;
      g += `<ellipse cx="${F(px + a * .5)}" cy="${F(py)}" rx="${F(a * 1.3)}" ry="${F(Math.max(.6, a * .25))}" fill="#000" opacity=".3"/>`;
      g += `<g transform="rotate(${F(rot)} ${F(px)} ${F(py - b * .5)})"><ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(a)}" ry="${F(b)}" fill="${C("#8a5626")}"/>
        <ellipse cx="${F(px - a * .25)}" cy="${F(cy + b * .05)}" rx="${F(a * .6)}" ry="${F(b * .8)}" fill="${C("#b07a38")}"/>
        <ellipse cx="${F(px - a * .4)}" cy="${F(cy - b * .05)}" rx="${F(a * .2)}" ry="${F(b * .45)}" fill="${C("#e0b070")}" opacity=".8"/>
        <path d="M${F(px)},${F(cy + b)} l0,${F(b * .12)}" stroke="${C("#3a2410")}" stroke-width="${F(Math.max(.6, a * .2))}"/>
        <path d="M${F(px - a * 1.12)},${F(cy - b * .35)} Q${F(px)},${F(cy - b * 1.45)} ${F(px + a * 1.12)},${F(cy - b * .35)} Q${F(px)},${F(cy - b * .1)} ${F(px - a * 1.12)},${F(cy - b * .35)}Z" fill="${C("#6a5232")}"/>`;
      if (a > 4) for (let i = 0; i < 14; i++) { const u = (rf() - .5) * 1.8, v = rf();
        g += `<circle cx="${F(px + u * a)}" cy="${F(cy - b * (.35 + v * .6 * (1 - u * u * .3)))}" r="${F(a * .1)}" fill="${C(rf() < .5 ? "#9a8058" : "#4a3820")}"/>`; }
      g += `<path d="M${F(px)},${F(cy - b * 1.05)} l${F(a * .1)},${F(-b * .2)}" stroke="${C("#4a3820")}" stroke-width="${F(Math.max(.5, a * .15))}"/></g>`; }
    else if (type === "hickory") { const R = m(.014);
      g += `<ellipse cx="${F(px + R * .4)}" cy="${F(py)}" rx="${F(R * 1.3)}" ry="${F(Math.max(.6, R * .22))}" fill="#000" opacity=".3"/>`;
      g += `<ellipse cx="${F(px)}" cy="${F(py - R * .9)}" rx="${F(R)}" ry="${F(R * .92)}" fill="${C("#a8906a")}"/><ellipse cx="${F(px - R * .3)}" cy="${F(py - R * 1.05)}" rx="${F(R * .55)}" ry="${F(R * .5)}" fill="${C("#d8c4a0")}"/>`;
      for (let i = -1; i <= 1; i++) g += `<path d="M${F(px + i * R * .5)},${F(py - R * 1.8)} Q${F(px + i * R * .7)},${F(py - R * .9)} ${F(px + i * R * .5)},${F(py - R * .05)}" stroke="${C("#7a6448")}" stroke-width="${F(Math.max(.4, R * .06))}" fill="none"/>`;
      g += `<path d="M${F(px)},${F(py - R * 1.82)} l0,${F(-R * .2)}" stroke="${C("#6a5438")}" stroke-width="${F(Math.max(.5, R * .12))}"/>`; }
    else if (type === "husk") { const R = m(.021), dk = rf() < .5;
      g += `<ellipse cx="${F(px + R * .4)}" cy="${F(py)}" rx="${F(R * 1.3)}" ry="${F(Math.max(.6, R * .22))}" fill="#000" opacity=".3"/>`;
      g += `<circle cx="${F(px)}" cy="${F(py - R)}" r="${F(R)}" fill="${C(dk ? "#3a3a1e" : "#7a8a32")}"/><circle cx="${F(px - R * .3)}" cy="${F(py - R * 1.2)}" r="${F(R * .6)}" fill="${C(dk ? "#5a5a2a" : "#a4b04a")}"/><circle cx="${F(px - R * .4)}" cy="${F(py - R * 1.4)}" r="${F(R * .22)}" fill="${C(dk ? "#8a8a4a" : "#d4d888")}" opacity=".7"/>`;
      for (let i = 0; i < 6; i++) g += `<circle cx="${F(px + (rf() - .3) * R * 1.2)}" cy="${F(py - R + (rf() - .5) * R * 1.2)}" r="${F(R * (.1 + rf() * .14))}" fill="${C("#1e1e12")}" opacity=".7"/>`; }
    else if (type === "buckeye") { const R = m(.016);
      g += `<ellipse cx="${F(px + R * .4)}" cy="${F(py)}" rx="${F(R * 1.3)}" ry="${F(Math.max(.6, R * .22))}" fill="#000" opacity=".3"/>`;
      g += `<ellipse cx="${F(px)}" cy="${F(py - R * .85)}" rx="${F(R)}" ry="${F(R * .86)}" fill="${C("#4a1c0c")}"/><ellipse cx="${F(px - R * .15)}" cy="${F(py - R * .95)}" rx="${F(R * .75)}" ry="${F(R * .6)}" fill="${C("#7a3216")}"/>
        <ellipse cx="${F(px + R * .35)}" cy="${F(py - R * .55)}" rx="${F(R * .45)}" ry="${F(R * .3)}" fill="${C("#c8a878")}"/>
        <ellipse cx="${F(px - R * .4)}" cy="${F(py - R * 1.3)}" rx="${F(R * .25)}" ry="${F(R * .14)}" fill="#ffffff" opacity="${NIGHT ? .35 : .75}"/>`; }
    else { const R = m(.008 + rf() * .006), a0 = rf() * 6;   // a shell fragment
      g += `<path d="M${F(px - R)},${F(py)} Q${F(px)},${F(py - R * 1.4)} ${F(px + R)},${F(py)} Q${F(px)},${F(py - R * .5)} ${F(px - R)},${F(py)}Z" fill="${C(rf() < .5 ? "#6a4a2a" : "#a88a5a")}" transform="rotate(${F(a0 * 20 - 60)} ${F(px)} ${F(py)})"/>`; }
    return g; };
  const NUTS = ["acorn", "acorn", "acorn", "hickory", "husk", "buckeye", "acorn", "shell"];
  for (let i = 0; i < 120; i++) { const z = 5.8 + Math.pow(r(), 1.2) * 16, x = (r() - .5) * 1.2 * z, t = NUTS[Math.floor(r() * NUTS.length)], a = (r() - .5) * 2.4;
    w.sprite({ x, z, y: 0, bias: -.01, fn: (px, py, k, fog) => nut(t, px, py, k, fog, a) }); }

  /* ---------------- assemble the world ---------------- */
  const isFar = o => o === far, isNear = o => o === near, isCity = o => o.tag === "city", isFarObj = o => !o.raster && o.tag === "far", rest = o => !o.raster && o.tag !== "far" && o.tag !== "city";
  s += `<rect x="0" y="${WY - 2}" width="${W}" height="${H - WY + 2}" fill="${T("#c8b898")}"/>`;
  s += `<g opacity="${NIGHT ? .9 : .55}">${w.draw({ where: isCity })}</g>`;
  if (NIGHT) s += `<ellipse cx="${F(sx(320, 3300))}" cy="${WY - 10}" rx="420" ry="110" fill="url(#fsCity)"/>`;
  s += w.draw({ where: isFar });
  s += `<rect x="0" y="${WY - 50}" width="${W}" height="70" fill="url(#fsHaze)" opacity=".5"/>`;
  s += w.draw({ where: isNear });
  s += w.draw({ where: isFarObj });
  s += `<rect x="0" y="${WY - 24}" width="${W}" height="40" fill="url(#fsHaze)" opacity=".35"/>`;
  // long shadows of the bench and lamp: the sun is behind the left shoulder, so they fall right and away
  { const L = LIGHT, hz = Math.hypot(L[0], L[2]), dx = -L[0] / hz, dz = -L[2] / hz, len = H0 => H0 * hz / L[1], px = -dz, pz = dx;
    const shadow = (x, z, hw, H0, tip) => { const e = len(H0), P = [[x + px * hw, z + pz * hw], [x + dx * e + px * hw * tip, z + dz * e + pz * hw * tip], [x + dx * e - px * hw * tip, z + dz * e - pz * hw * tip], [x - px * hw, z - pz * hw]];
      return "M" + P.map(([a, b]) => { const q = w.proj([a, .02, Math.max(5.5, b)]); return F(q[0]) + "," + F(q[1]); }).join("L") + "Z"; };
    if (!NIGHT) s += `<g filter="url(#fsBlur2)" fill="#3a3456" opacity=".3"><path d="${shadow(BX, BZ, .95, .8, .9)}"/><path d="${shadow(LPX, LPZ, .1, 3.2, .8)}"/><path d="${shadow(-1.75, 22.6, .28, .78, .9)}"/></g>`; }
  if (NIGHT) { const p = w.proj([LPX, 0, LPZ]); s += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="260" ry="26" fill="url(#fsPool)"/>`; }
  s += w.draw({ where: rest });

  /* ================= the stump, the stash and the squirrel (pixels at projected size) ================= */
  const SX0 = .04, SZ = 2.6, SR = .26, STOP = .70;
  const kS = FL / SZ, [scx, scy] = w.proj([SX0, STOP, SZ]);
  const srx = SR * kS, sry = (w.proj([SX0, STOP, SZ - SR])[1] - w.proj([SX0, STOP, SZ + SR])[1]) / 2;
  const LS = (v => { const l = Math.hypot(...v); return v.map(q => q / l); })(NIGHT ? [-.35, .45, -.55] : [-.8, .5, .38]);
  {
    const BARK = ["#1a120c", "#2a1e14", "#3a2a1c", "#4e3a26", "#644a30", "#7a5c3c", "#94744e", "#b09068"].map(c => NIGHT ? mix(T(c), c, .22) : c);
    const flare = y => 1 + .28 * sm((y - scy - 120) / 160);
    const xAt = (u, y) => scx + u * srx * flare(y);
    let g = `<path d="M${F(scx - srx)},${F(scy)} L${F(xAt(-1, H + 10))},${F(H + 10)} L${F(xAt(1, H + 10))},${F(H + 10)} L${F(scx + srx)},${F(scy)}Z" fill="${BARK[1]}"/>`;
    // the side: columns of blocky oak-bark plates, lit by angle around the trunk
    // ridges of uneven width that wander, split and rejoin; each ridge broken into plates of uneven height
    const cols = []; for (let a = -Math.PI / 2 + .01; a < Math.PI / 2 - .01;) { const da = .025 + rp() * .045; cols.push([a, Math.min(Math.PI / 2 - .005, a + da)]); a += da; }
    cols.forEach(([A0, A1]) => {
      let y = scy + 3 + rp() * 14, drift = 0;
      while (y < H + 10) { const hgt = 10 + Math.pow(rp(), 1.5) * 70; drift += (rp() - .5) * .02;
        const a0 = A0 + drift + rp() * .006, a1 = A1 + drift - .008 - rp() * .012, am = (a0 + a1) / 2;
        const lit = Math.max(0, Math.sin(am) * LS[0] + Math.cos(am) * LS[2]) * .85 + .12, v = cl(lit + (rp() - .5) * .26);
        const u0 = Math.sin(a0), u1 = Math.sin(a1), c = BARK[Math.min(7, 1 + Math.floor(v * 7))], sk = (rp() - .5) * 3;
        const xa = xAt(u0, y), xb = xAt(u1, y), xc = xAt(u1, y + hgt), xd = xAt(u0, y + hgt);
        g += `<path d="M${F(xa)},${F(y + sk)} Q${F((xa + xb) / 2)},${F(y - 2)} ${F(xb)},${F(y - sk)} L${F(xc)},${F(y + hgt - 2)} Q${F((xc + xd) / 2)},${F(y + hgt + 1)} ${F(xd)},${F(y + hgt)}Z" fill="${c}"/>`;
        if (xb - xa > 3) { const hl = BARK[Math.min(7, 2 + Math.floor(v * 6))];
          g += `<path d="M${F(xa + (xb - xa) * .2)},${F(y + 2)} L${F(xd + (xc - xd) * .25)},${F(y + hgt - 3)}" stroke="${hl}" stroke-width="${F(Math.min(3, (xb - xa) * .25))}" opacity=".6"/>`; }
        y += hgt + 1.5 + rp() * 5; } });
    // moss on the shaded right flank and at the foot, turkey-tail brackets on the right
    const MOSS = ["#2a3a14", "#3e5418", "#566e22", "#728a30", "#92a844"].map(T);
    for (let i = 0; i < 700; i++) { const u = .35 + Math.pow(rp(), .7) * .63, y = scy + 60 + rp() * (H - scy);
      if (rp() > sm((u - .3) * 2) * (.4 + .6 * sm((y - 560) / 120))) continue;
      g += `<circle cx="${F(xAt(u, y))}" cy="${F(y)}" r="${F(1.2 + rp() * 2.6)}" fill="${MOSS[Math.floor(rp() * 5)]}" opacity=".85"/>`; }
    const fan = (fx, fy, R, ang) => { let q = "";
      const bands = ["#5a3a2a", "#8a6a4a", "#c8b088", "#6a6a7a", "#e8dcc4", "#9a7a58"].map(T);
      for (let b = 0; b < 6; b++) { const rr = R * (1 - b * .15);
        q += `<path d="M${F(fx)},${F(fy)} L${F(fx + Math.cos(ang - 1.2) * rr)},${F(fy + Math.sin(ang - 1.2) * rr * .5)} A${F(rr)},${F(rr * .5)} 0 0 1 ${F(fx + Math.cos(ang + 1.2) * rr)},${F(fy + Math.sin(ang + 1.2) * rr * .5)}Z" fill="${bands[b]}"/>`; }
      q += `<path d="M${F(fx + Math.cos(ang - 1.1) * R)},${F(fy + Math.sin(ang - 1.1) * R * .5 - 1)} A${F(R)},${F(R * .5)} 0 0 1 ${F(fx + Math.cos(ang + 1.1) * R)},${F(fy + Math.sin(ang + 1.1) * R * .5 - 1)}" stroke="${T("#f4ecd8")}" stroke-width="1.2" fill="none" opacity=".7"/>`;
      return q; };
    [[.8, 600, 26, -.3], [.86, 614, 20, -.2], [.74, 622, 22, -.4], [.9, 640, 16, -.1], [.82, 652, 19, -.2], [.68, 645, 15, -.5]].forEach(([u, y, R, a]) => g += fan(xAt(u, y) - 4, y, R, a));
    // rim of the cut: the bark lip, then the weathered face with rings and checks
    g += `<ellipse cx="${F(scx)}" cy="${F(scy)}" rx="${F(srx)}" ry="${F(sry + 1.5)}" fill="${BARK[3]}"/>`;
    const irx = srx - .028 * kS, iry = sry * irx / srx;
    g += `<ellipse cx="${F(scx)}" cy="${F(scy - .5)}" rx="${F(irx)}" ry="${F(iry)}" fill="${T("#b49a76")}"/>`;
    g += `<ellipse cx="${F(scx - irx * .04)}" cy="${F(scy - .5)}" rx="${F(irx * .72)}" ry="${F(iry * .72)}" fill="${T("#9a7a54")}" opacity=".7"/>`;
    for (let i = 1; i < 22; i++) { const k = i / 22;
      g += `<ellipse cx="${F(scx - irx * .04 * (1 - k))}" cy="${F(scy - .5)}" rx="${F(irx * k)}" ry="${F(iry * k)}" fill="none" stroke="${T("#6a5236")}" stroke-width=".7" opacity=".45"/>`; }
    for (let i = 0; i < 7; i++) { const a = rp() * Math.PI * 2, k0 = .15 + rp() * .3, k1 = .7 + rp() * .3;
      g += `<path d="M${F(scx + Math.cos(a) * irx * k0)},${F(scy + Math.sin(a) * iry * k0)} L${F(scx + Math.cos(a) * irx * k1)},${F(scy + Math.sin(a) * iry * k1)}" stroke="${T("#3a2a1a")}" stroke-width="1.1" opacity=".7"/>`; }
    // sun on the left of the face, moss on the back lip
    if (!NIGHT) g += `<ellipse cx="${F(scx - irx * .45)}" cy="${F(scy - 1)}" rx="${F(irx * .5)}" ry="${F(iry * .7)}" fill="#ffe8b8" opacity=".25"/>`;
    for (let i = 0; i < 160; i++) { const a = Math.PI + .2 + rp() * (Math.PI - .4);
      g += `<circle cx="${F(scx + Math.cos(a) * srx * (.94 + rp() * .07))}" cy="${F(scy + Math.sin(a) * (sry + 1) * (.9 + rp() * .2))}" r="${F(1 + rp() * 2)}" fill="${MOSS[1 + Math.floor(rp() * 4)]}"/>`; }
    s += g;
  }

  /* the squirrel: sitting up, facing left, an acorn in its hands, tail curled over its back.
     Built from ellipsoid parts covered in fur strokes, each shaded by which way it faces the light. */
  const squirrel = (bx, by, k, P) => {
    const X = u => bx + u * k, Y = v => by - v * k, Pal = a => a.map(c => NIGHT ? mix(T(c), c, .3) : c);
    const BACK = Pal(P.back), BELLY = Pal(P.belly), RIMC = T(P.rim);
    const hw = Math.max(1.1, k * .0024);
    let base = "", fur = "";
    const part = (o) => { const { cu, cv, a, b, rot = 0, ramp, flow, len = .016, dens = 1, agouti = 0 } = o;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      base += `<ellipse cx="${F(X(cu))}" cy="${F(Y(cv))}" rx="${F(a * k)}" ry="${F(b * k)}" transform="rotate(${F(-rot * 57.3)} ${F(X(cu))} ${F(Y(cv))})" fill="${ramp[2]}"/>`;
      const n = Math.round(Math.PI * a * b * k * k / 7 * dens);
      const segs = [];
      for (let i = 0; i < n; i++) { const ang = rf() * Math.PI * 2, q = Math.sqrt(rf()) * 1.03, p = Math.cos(ang) * q, t = Math.sin(ang) * q;
        const du = p * a * cr - t * b * sr, dv = p * a * sr + t * b * cr;
        const nu = p * cr - t * sr, nv = p * sr + t * cr, nz = Math.sqrt(Math.max(0, 1 - q * q));
        const lit = nu * LS[0] + nv * LS[1] + nz * LS[2];
        let v = cl(.42 + lit * .55 + (rf() - .5) * .16);
        let c = ramp[Math.floor(v * 8)];
        if (q > .8 && lit > .25) c = mix(c, RIMC, (q - .8) * 2.2 * (NIGHT ? .7 : .5));
        if (agouti && rf() < agouti) c = rf() < .6 ? mix(c, "#141010", .55) : mix(c, NIGHT ? "#9aa4c8" : "#efe4d0", .5);
        const th = flow + (rf() - .5) * .55 + p * .25, L = len * k * (.65 + rf() * .7);
        segs.push(`<path d="M${F(X(cu + du))},${F(Y(cv + dv))}l${F(Math.cos(th) * L)},${F(-Math.sin(th) * L)}" stroke="${c}"/>`); }
      fur += `<g stroke-width="${F(hw)}" stroke-linecap="round">${segs.join("")}</g>`;
      const out = base + fur; base = ""; fur = ""; return out; };
    let g = `<ellipse cx="${F(X(.06))}" cy="${F(by + 1)}" rx="${F(.15 * k)}" ry="${F(Math.max(2, .012 * k))}" fill="#000" opacity="${NIGHT ? .35 : .3}"/>`;
    if (!NIGHT) g += `<ellipse cx="${F(X(.16))}" cy="${F(by + 1)}" rx="${F(.14 * k)}" ry="${F(Math.max(2, .01 * k))}" fill="#2a2030" opacity=".22"/>`;

    /* the tail: a spine curve with three layers of hair (fringe, dark band, core), laid toward the tip */
    { const S = P.tail.map(([u, v]) => [u * P.s, v * P.s]), pts = [];
      const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return [0, 1].map(i => .5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3)); };
      for (let i = 0; i < S.length - 1; i++) { const p0 = S[Math.max(0, i - 1)], p1 = S[i], p2 = S[i + 1], p3 = S[Math.min(S.length - 1, i + 2)];
        for (let j = 0; j < 30; j++) pts.push(cr(p0, p1, p2, p3, j / 30)); }
      pts.push(S[S.length - 1]);
      const N = pts.length, hwT = t => P.tw * P.s * (.32 + .68 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05 + .08)), .55));
      const layers = P.band ? [[1.18, "fringe"], [.95, "band"], [.7, "core"]] : [[1.1, "fringe"], [.8, "core"]];
      // a soft body first so the tail never shows through
      let body = "";
      for (let i = 0; i < N; i += 3) { const t = i / (N - 1); body += `<circle cx="${F(X(pts[i][0]))}" cy="${F(Y(pts[i][1]))}" r="${F(hwT(t) * .8 * k)}" fill="${BELLY[2]}"/>`; }
      g += `<g filter="url(#fsFur)">${body}`;
      layers.forEach(([lk, kind]) => { const segs = [];
        for (let i = 0; i < N; i++) { const t = i / (N - 1), a0 = pts[Math.max(0, i - 1)], a1 = pts[Math.min(N - 1, i + 1)];
          let tu = a1[0] - a0[0], tv = a1[1] - a0[1]; const tl = Math.hypot(tu, tv) || 1; tu /= tl; tv /= tl;
          const per = kind === "core" ? 9 : 12;
          for (let h = 0; h < per; h++) { const side = h % 2 ? 1 : -1, nu = -tv * side, nv = tu * side;
            const lay = .55 + rf() * .35, du = nu * Math.cos(lay) + tu * Math.sin(lay), dv = nv * Math.cos(lay) + tv * Math.sin(lay);
            const L = hwT(t) * lk * (.86 + rf() * .24) * k;
            const lit = nu * LS[0] + nv * LS[1] + .35 * LS[2], v = cl(.45 + lit * .5 + (rf() - .5) * .2);
            const c = kind === "fringe" ? mix(Pal(P.fringe)[Math.floor(v * 3.99)], RIMC, lit > .3 ? (NIGHT ? .1 : .25) : 0)
              : kind === "band" ? mix(T("#1a120c"), BACK[3], rf() * .4) : BELLY[Math.floor(v * 8)];
            const ox = (rf() - .5) * .3 * hwT(t), x0 = X(pts[i][0] + tu * ox), y0 = Y(pts[i][1] + tv * ox), bend = (rf() - .5) * L * .25;
            segs.push(`<path d="M${F(x0)},${F(y0)}q${F(du * L * .5 + bend)},${F(-dv * L * .5)} ${F(du * L)},${F(-dv * L)}" stroke="${c}"/>`); } }
        // the tip: a fan of hairs carrying on past the end
        const e = pts[N - 1], p = pts[N - 4]; let tu = e[0] - p[0], tv = e[1] - p[1]; const tl = Math.hypot(tu, tv) || 1; tu /= tl; tv /= tl;
        for (let h = 0; h < 40; h++) { const a = (rf() - .5) * 1.5, du = tu * Math.cos(a) - tv * Math.sin(a), dv = tu * Math.sin(a) + tv * Math.cos(a), L = P.tw * P.s * lk * (.3 + rf() * .3) * k;
          const c = kind === "fringe" ? P.fringe.map(T)[1 + Math.floor(rf() * 3)] : kind === "band" ? T("#1a120c") : BELLY[3 + Math.floor(rf() * 4)];
          segs.push(`<path d="M${F(X(e[0]))},${F(Y(e[1]))}l${F(du * L)},${F(-dv * L)}" stroke="${c}"/>`); }
        g += `<g fill="none" stroke-width="${F(hw * .9)}" stroke-linecap="round">${segs.join("")}</g>`; });
      g += `</g>`; }

    const s1 = P.s;   // body scale
    const q = (o) => ({ ...o, cu: o.cu * s1, cv: o.cv * s1, a: o.a * s1, b: o.b * s1, len: (o.len || .016) * (P.furK || 1) });
    // far ear and far arm sit behind the head
    g += `<path d="M${F(X(-.012 * s1))},${F(Y(.25 * s1))} q${F(.004 * s1 * k)},${F(-.04 * s1 * k)} ${F(.022 * s1 * k)},${F(-.03 * s1 * k)} q${F(-.002 * s1 * k)},${F(.02 * s1 * k)} ${F(-.012 * s1 * k)},${F(.035 * s1 * k)}Z" fill="${BACK[1]}"/>`;
    g += `<g filter="url(#fsFur)">`;
    g += part(q({ cu: .045, cv: .072, a: .088, b: .078, rot: .1, ramp: BACK, flow: -.9, agouti: P.agouti }));                 // haunch
    g += part(q({ cu: .003, cv: .135, a: .062, b: .09, rot: .32, ramp: BACK, flow: -1.25, agouti: P.agouti }));                // torso, leaning forward
    g += part(q({ cu: -.032, cv: .118, a: .036, b: .078, rot: .32, ramp: BELLY, flow: -1.5, len: .012 }));                    // belly and chest
    g += part(q({ cu: .012, cv: .048, a: .052, b: .046, rot: -.2, ramp: BACK, flow: -.7, agouti: P.agouti * .7 }));            // thigh
    g += part(q({ cu: -.03, cv: .014, a: .06, b: .016, rot: .03, ramp: BACK, flow: 3.0, len: .01 }));                         // hind foot along the stump
    g += part(q({ cu: -.058, cv: .168, a: .03, b: .014, rot: -.25, ramp: BELLY, flow: 3.3, len: .009 }));                     // far arm
    g += `</g>`;
    if (P.fold) g += `<path d="M${F(X(-.05 * s1))},${F(Y(.14 * s1))} Q${F(X(.03 * s1))},${F(Y(.07 * s1))} ${F(X(.07 * s1))},${F(Y(.02 * s1))}" stroke="${T("#2a2420")}" stroke-width="${F(.007 * s1 * k)}" fill="none" opacity=".6"/><path d="M${F(X(-.05 * s1))},${F(Y(.146 * s1))} Q${F(X(.03 * s1))},${F(Y(.077 * s1))} ${F(X(.07 * s1))},${F(Y(.027 * s1))}" stroke="${BELLY[4]}" stroke-width="${F(.0025 * s1 * k)}" fill="none" opacity=".35" filter="url(#fsFur)"/>`;
    // the acorn in its hands
    g += nut("acorn", X(-.098 * s1), Y(.162 * s1), k * 1.05, 0, -.5).replace(/<ellipse[^>]*opacity="\.3"\/>/, "");
    g += `<g filter="url(#fsFur)">`;
    g += part(q({ cu: -.062, cv: .158, a: .034, b: .016, rot: -.15, ramp: BELLY, flow: 3.2, len: .01 }));                     // near arm
    g += part(q({ cu: -.046, cv: .218, a: .052, b: .044, rot: .2, ramp: BACK, flow: .25, len: .011, agouti: P.agouti * .6 })); // head
    g += part(q({ cu: -.09, cv: .204, a: .027, b: .022, rot: .25, ramp: BACK, flow: .15, len: .007 }));                        // muzzle
    g += part(q({ cu: -.064, cv: .196, a: .026, b: .017, rot: .2, ramp: BELLY, flow: -.2, len: .008 }));                       // cheek
    g += `</g>`;
    // hands closed over the acorn, with dark claws
    [[-.097, .175], [-.103, .156]].forEach(([u, v]) => { g += `<ellipse cx="${F(X(u * s1))}" cy="${F(Y(v * s1))}" rx="${F(.011 * s1 * k)}" ry="${F(.008 * s1 * k)}" fill="${BELLY[3]}"/>`;
      for (let c = 0; c < 3; c++) g += `<path d="M${F(X((u - .008) * s1))},${F(Y((v + .006 - c * .005) * s1))} l${F(-.005 * s1 * k)},${F(.002 * s1 * k)}" stroke="${T("#1a120c")}" stroke-width="${F(Math.max(.6, .0018 * k))}" stroke-linecap="round"/>`; });
    // near ear: rounded, rusty, a tuft of longer hair
    { const eu = -.028 * s1, ev = .252 * s1, E = v => v * s1 * k;
      g += `<path d="M${F(X(eu) - E(.014))},${F(Y(ev))} q${F(E(.002))},${F(-E(.042))} ${F(E(.016))},${F(-E(.046))} q${F(E(.012))},${F(E(.008))} ${F(E(.01))},${F(E(.042))}Z" fill="${BACK[4]}"/>`;
      g += `<path d="M${F(X(eu) - E(.008))},${F(Y(ev) - E(.004))} q${F(E(.002))},${F(-E(.03))} ${F(E(.01))},${F(-E(.034))} q${F(E(.006))},${F(E(.008))} ${F(E(.004))},${F(E(.03))}Z" fill="${T(P.earIn)}"/>`;
      for (let i = 0; i < 9; i++) g += `<path d="M${F(X(eu) + E(.002))},${F(Y(ev) - E(.044))} l${F(E((rf() - .3) * .012))},${F(-E(.006 + rf() * .01))}" stroke="${BACK[5]}" stroke-width="${F(hw * .8)}" stroke-linecap="round"/>`; }
    // eye with its pale ring, nose, mouth, whiskers
    { const eu = -.07 * s1, ev = .226 * s1, er = P.eye * k;
      g += `<ellipse cx="${F(X(eu))}" cy="${F(Y(ev))}" rx="${F(er * 1.5)}" ry="${F(er * 1.3)}" fill="${T(P.ring)}"/>`;
      g += `<ellipse cx="${F(X(eu))}" cy="${F(Y(ev))}" rx="${F(er)}" ry="${F(er * 1.05)}" fill="#0a0806"/>`;
      g += `<circle cx="${F(X(eu) - er * .35)}" cy="${F(Y(ev) - er * .4)}" r="${F(er * .32)}" fill="#ffffff" opacity=".9"/><circle cx="${F(X(eu) + er * .35)}" cy="${F(Y(ev) + er * .35)}" r="${F(er * .14)}" fill="#ffffff" opacity=".5"/>`;
      const nu = -.115 * s1, nv = .199 * s1;
      g += `<path d="M${F(X(nu) - .004 * k)},${F(Y(nv) - .004 * k)} q${F(.006 * k)},${F(-.004 * k)} ${F(.009 * k)},${F(.001 * k)} q${F(-.002 * k)},${F(.006 * k)} ${F(-.006 * k)},${F(.007 * k)}Z" fill="${T("#2a1a14")}"/>`;
      g += `<path d="M${F(X(nu + .004))},${F(Y(nv - .007))} q${F(.004 * k)},${F(.008 * k)} ${F(.014 * k)},${F(.006 * k)}" stroke="${T("#3a2418")}" stroke-width="${F(Math.max(.6, .0016 * k))}" fill="none"/>`;
      for (let i = 0; i < 6; i++) { const a = Math.PI + (i - 2.5) * .14, L = (.03 + rf() * .02) * s1 * k;
        g += `<path d="M${F(X(nu + .008))},${F(Y(nv - .002))} q${F(Math.cos(a) * L * .5)},${F(-Math.sin(a) * L * .5 - 2)} ${F(Math.cos(a) * L)},${F(-Math.sin(a) * L + 1)}" stroke="${NIGHT ? "#c8d0e8" : "#2a2420"}" stroke-width=".7" fill="none" opacity=".6"/>`; } }
    return g; };

  const FOX = { s: 1.15, tw: .068, band: true, agouti: .14, eye: .0095, furK: 1,
    back: ["#2a1c14", "#45301f", "#634529", "#7e5a34", "#9a7044", "#b48a58", "#cca472", "#e4c696"],
    belly: ["#5a2a10", "#7e3a14", "#a04e1a", "#bc6424", "#d07a32", "#e09448", "#ecb066", "#f6cc8e"],
    fringe: ["#c08a52", "#d8a46a", "#ecc48a", "#f8e0b0"], rim: "#fff2d8", ring: "#e8c89a", earIn: "#8a4a2a",
    tail: [[.075, .045], [.13, .055], [.172, .12], [.168, .21], [.128, .285], [.112, .345], [.135, .392], [.182, .402], [.21, .372], [.196, .338]] };
  const FLY = { s: .95, tw: .055, band: false, agouti: .04, eye: .014, furK: .8, fold: true,
    back: ["#1e1a18", "#2e2824", "#433a32", "#5a4e42", "#726452", "#8a7a66", "#a29280", "#bcae9c"],
    belly: ["#4a4640", "#6a6660", "#8a8680", "#aaa69e", "#c6c2b8", "#dcd8ce", "#ece8de", "#faf6ec"],
    fringe: ["#6a5e50", "#8a7c6a", "#a49680", "#c0b29a"], rim: "#c8d4f4", ring: "#2a2420", earIn: "#5a4a40",
    tail: [[.06, .03], [.12, .03], [.18, .05], [.235, .09], [.265, .14], [.275, .19]] };

  /* the stash on the stump top, back to front, with the squirrel slotted in by depth */
  const QX = -.03, QZ = 2.62, [qbx, qby] = w.proj([QX, STOP, QZ]), qk = FL / QZ;
  const items = [];
  const STASH = ["acorn", "acorn", "hickory", "acorn", "shell", "shell", "acorn", "husk", "buckeye", "shell", "hickory", "shell"];
  for (let i = 0, n = 0; i < 400 && n < 34; i++) { const a = rf() * Math.PI * 2, d = Math.sqrt(rf()) * (SR - .045), x = SX0 + Math.cos(a) * d, z = SZ + Math.sin(a) * d;
    if (Math.abs(x - (QX + .02)) < .17 && Math.abs(z - QZ) < .1) continue;
    items.push([z, x, STASH[n % STASH.length], (rf() - .5) * 2.4]); n++; }
  items.push([QZ, QX, "squirrel"]);
  items.sort((a, b) => b[0] - a[0]).forEach(([z, x, t, a]) => {
    if (t === "squirrel") { s += squirrel(qbx, qby, qk, NIGHT ? FLY : FOX); return; }
    const [px, py] = w.proj([x, STOP, z]); s += nut(t, px, py, FL / z, 0, a); });
  // two fallen oak leaves resting on the cut
  [[-.14, 2.48, .6, "#8a5a2a"], [.3, 2.72, -.4, "#a8642a"]].forEach(([x, z, a, c]) => { const [px, py] = w.proj([SX0 + x, STOP, z]);
    s += leafG(px, py, .045 * FL / z, 0, a, .18, c); });

  /* ---------------- finish ---------------- */
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#fsLight)" style="mix-blend-mode:soft-light" opacity=".8"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#fsPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
