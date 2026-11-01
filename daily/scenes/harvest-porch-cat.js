/* Harvest Porch Cat: National Cat Day (Oct 29, 2026), and a Thanksgiving pool scene.
   Seen from a low rocker on a farmhouse porch: a ginger tabby with a white bib and
   socks sits on the painted rail cap, tail curled round its paws, looking back at
   us. Along the rail as it runs away to the stair post: a white mini pumpkin, a pile
   of gourds, a pot of bronze mums; Indian corn hangs on the post under a tin barn
   lantern. Past the yard's white board fence the hill drops away into an Ohio
   hill-country valley (Holmes County style): contour strips of corn stubble,
   winter wheat, plough and hay wrapping the far slope, woodlots of bare hardwoods,
   bronze oaks and white pines, white farmsteads with bank barns and silos, blue
   ridges behind. Low late-autumn sun from the left, behind the shoulder.
   opts.time === "night": the 84% waning gibbous moon just up over the far ridge,
   stars, lamplit farm windows, the barn lantern lit on the post, the cat rim-lit
   by it with wide pupils and green eyeshine.
   Land is two world3d() rasters; rail, post, fences, farms and trees are placed in
   metres by one camera (eye 12 cm above the rail cap). The cat and the rail-top
   things are drawn in pixels at their projected size. Same shape as
   reference/autumn-valley.js. Needs rng(), mix(), world3d(), noise2(),
   mountainField(), hexRGB() and rgbTone() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                      */
function harvestPorchCatArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1029;
  const r = rng(seed), rs = rng(seed + 5), rp = rng(seed + 29), rg = rng(seed + 41), rf = rng(seed + 77), rh = rng(seed + 91);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -180, LY = 330, WY = 390;
  const T = c => NIGHT ? mix(mix(c, "#6a78a0", .45), "#081030", .6) : c;
  const HZ = NIGHT ? "#2a3460" : "#efd9bc", RIM = NIGHT ? "#b8c8f0" : "#fff0d0", SHADE = NIGHT ? "#04060e" : "#3a3450", LAMP = "#ffbe64";
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

  /* ---------------- sky: low late-autumn sun, or a moonrise night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040822"/><stop offset=".5" stop-color="#0c1438"/><stop offset=".84" stop-color="#1e2c5a"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#5e8ec2"/><stop offset=".4" stop-color="#90b0d2"/><stop offset=".7" stop-color="#cdd2d2"/><stop offset=".88" stop-color="#eed6b6"/><stop offset="1" stop-color="#f4cf9e"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#d8dcff" stop-opacity=".2"/><stop offset=".3" stop-color="#8a9ad8" stop-opacity=".07"/><stop offset="1" stop-color="#8a9ad8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff4dc" stop-opacity="1"/><stop offset=".12" stop-color="#ffe0aa" stop-opacity=".62"/><stop offset=".4" stop-color="#ffc88a" stop-opacity=".2"/><stop offset="1" stop-color="#ffc88a" stop-opacity="0"/>`;
  const MX = 640, MY = 298, MR = 21;
  let s = `<defs id="hpdefs">
    <linearGradient id="hpSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="hpLight" cx="${NIGHT ? MX : LX}" cy="${NIGHT ? MY : LY}" r="${NIGHT ? 700 : 1900}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="hpHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".9"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="hpGlow"><stop offset="0" stop-color="#ffe8b0" stop-opacity=".95"/><stop offset=".25" stop-color="${LAMP}" stop-opacity=".45"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="hpWin"><stop offset="0" stop-color="#ffcc80" stop-opacity=".5"/><stop offset="1" stop-color="#ffcc80" stop-opacity="0"/></radialGradient>
    <radialGradient id="hpMoon"><stop offset="0" stop-color="#e8eeff" stop-opacity=".5"/><stop offset=".3" stop-color="#b0c0f0" stop-opacity=".12"/><stop offset="1" stop-color="#b0c0f0" stop-opacity="0"/></radialGradient>
    <radialGradient id="hpIris" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f4dc5a"/><stop offset=".55" stop-color="#c8b832"/><stop offset="1" stop-color="#6a8a2a"/></radialGradient>
    <radialGradient id="hpShine" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d8ffb0"/><stop offset=".5" stop-color="#7ae070"/><stop offset="1" stop-color="#2a6a3a"/></radialGradient>
    <filter id="hpLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hpFur" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".3" numOctaves="2" seed="37" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="hpCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".016" numOctaves="3" seed="61" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.5"/></filter>
    <filter id="hpCirrus" x="-10%" y="-60%" width="120%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".004 .05" numOctaves="3" seed="41" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="3"/></filter>
    <filter id="hpPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="19"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="hpSoft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="hpBlur2"><feGaussianBlur stdDeviation="2.5"/></filter>
    <filter id="hpBlur6"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#hpSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 1050; i++) { const x = rs() * W, y = Math.pow(rs(), 1.25) * 380, big = rs() < .06, dm = Math.hypot(x - MX, y - MY) < 260 ? .3 : 1;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.8 : F(.5 + rs() * .7)}" fill="${rs() < .18 ? "#ffe6c4" : "#e6ecff"}" opacity="${F((.25 + rs() * .6) * (1 - y / 430) * dm)}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#hpLight)"/>`;
    // 84% waning gibbous just risen in the east: lit toward the sun below the western horizon (lower left)
    const tr = MR * (2 * .84 - 1);
    s += `<circle cx="${MX}" cy="${MY}" r="${MR * 8}" fill="url(#hpMoon)"/>
      <g transform="rotate(-145 ${MX} ${MY})"><circle cx="${MX}" cy="${MY}" r="${MR}" fill="#3a3a5e" opacity=".75"/>
      <path d="M${MX},${MY - MR} A${MR},${MR} 0 0 1 ${MX},${MY + MR} A${F(tr)},${MR} 0 0 1 ${MX},${MY - MR}Z" fill="#f6eedc"/>
      <circle cx="${MX + MR * .35}" cy="${MY - MR * .3}" r="${MR * .18}" fill="#cac4b8" opacity=".55"/><circle cx="${MX + MR * .1}" cy="${MY + MR * .35}" r="${MR * .24}" fill="#cac4b8" opacity=".45"/><circle cx="${MX - MR * .25}" cy="${MY - MR * .05}" r="${MR * .14}" fill="#cac4b8" opacity=".4"/></g>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#hpLight)"/>`;
    s += `<g class="rays" opacity=".08" filter="url(#hpSoft)">`;
    for (let k = 0; k < 7; k++) { const a = -.13 + k * .07, L = 2500;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .015) * L)},${F(LY + Math.sin(a - .015) * L)} L${F(LX + Math.cos(a + .015) * L)},${F(LY + Math.sin(a + .015) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a long low bank catching the sun, cirrus high ---------------- */
  {
    s += `<g class="drift1" filter="url(#hpCirrus)">`;
    for (let i = 0; i < 11; i++) { const x = 200 + rs() * 2150, y = 50 + rs() * 150, L = 280 + rs() * 440, b = (rs() - .5) * 30;
      s += `<path d="M${F(x)},${F(y)} q${F(L * .5)},${F(b - 14)} ${F(L)},${F(b)}" stroke="${NIGHT ? "#20285a" : "#fff4e6"}" stroke-width="${F(4 + rs() * 9)}" fill="none" stroke-linecap="round" opacity="${F(NIGHT ? .26 : .2 + rs() * .22)}"/>`; }
    s += `</g>`;
  }
  const heap = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#hpCloudy)">`;
    const n = 8 + Math.floor(rs() * 3), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.07 + rs() * .06) * (1 - Math.abs(t - .5) * .9);
      lobes.push([x + (t - .5) * w, y - R * (.4 + rs() * .5), R]); }
    if (NIGHT) {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.3)}" ry="${F(R * .6)}" fill="#18204a"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .2)}" cy="${F(ly - R * .25)}" rx="${F(R * .7)}" ry="${F(R * .3)}" fill="#3a4680" opacity=".45"/>`);
    } else {
      c += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(w * .52)}" ry="${F(w * .04)}" fill="#c4aeb0"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .1)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.3)}" ry="${F(R * .7)}" fill="#d2bcbc"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .08)}" cy="${F(ly - R * .05)}" rx="${F(R * 1.12)}" ry="${F(R * .62)}" fill="#f2dcd0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .4)}" cy="${F(ly - R * .28)}" rx="${F(R * .55)}" ry="${F(R * .32)}" fill="#fff4e4"/>`);
    }
    return c + `</g></g>`;
  };
  s += `<g opacity="${NIGHT ? .65 : .88}">` + heap(300, 300, 360, "drift2") + heap(980, 284, 260, "drift3") + heap(1720, 290, 300, "drift2") + heap(2330, 300, 380, "drift3") + `</g>`;
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Metres, x right, y up, z away. The yard is 30 m above the valley floor; the porch
     floor at 30.75, the rail cap's top at 31.70, the eye at 31.82 (a low rocker).
     The rail runs from the lower left past the cat (z 1.5) to the stair post (z 4.05).
     The yard ends at a brow (z 70); the valley bottom is near z 500 and the far slope
     climbs to a ridge near z 2600, with blue ridges beyond. */
  const EYE = 31.82, RT = 31.70, FL = 1700;
  const LIGHT = NIGHT ? [.5, .55, .6] : [-.8, .42, -.36];
  const w = world3d({ h: EYE, hy: WY, f: FL, light: LIGHT, tone: T, fog: HZ, fogK: .0004, near: .3,
    shadow: SHADE, rim: RIM, shade: .5, hi: .3, night: NIGHT, lamp: "#ffb860" });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9), N4 = noise2(seed + 17);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const MF = mountainField({ seed: 8817, scale: 2600, oct: 5, peaks: [
    { x: -9000, z: 11000, h: 300, rx: 5200, rz: 2600 }, { x: -1500, z: 13000, h: 340, r: 4200 }, { x: 6400, z: 10500, h: 290, r: 3600 }, { x: 13000, z: 14000, h: 380, r: 5000 } ] });
  const BROW = 70;
  const hG = (x, z) => {
    if (z < BROW) return 30 - z * .04 + .04 * N3(x / 3, z / 3);
    const drop = sm((z - BROW) / 260);
    const floor = 2 + 1.5 * N1(x / 500, z / 500);
    const slope = sm((z - 520) / 1700) * (122 + 34 * N1(x / 900 + 3, z / 900)) + 24 * N2(x / 380, z / 380) * sm((z - 600) / 800);
    const roll = 3 * N4(x / 160, z / 160) * sm((z - 300) / 400);
    const far = MF(x, z) * sm((z - 4200) / 4500);
    return Math.max(.5, (30 - BROW * .04) * (1 - drop) + floor * drop + Math.max(0, slope) + roll + far); };
  const wood = (x, z) => z > 420 && z < 9000 && (N1(x / 420 + 5, z / 420 - 2) * .8 + N4(x / 170, z / 170) * .35 + .25 * Math.max(0, N2(x / 380, z / 380) * -1) > .16);
  const lane = (x, z) => Math.abs(x - (34 + 60 * Math.sin(z / 260) + .02 * z)) < 3.2 && z > 600 && z < 1900;

  /* ground colour: lawn and leaves in the yard; contour strips on the far slope; woods; ridges */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const LAWN = H3("#6e7a3a"), LAWN2 = H3("#8a8a46"), LEAF = H3("#8a5226"), LEAF2 = H3("#b0742e"), GRV = H3("#b4a48a");
  const STRIPS = ["#c8ac68", "#6e9440", "#7a5a3c", "#a8a066", "#d6bf86", "#8a9a50", "#b49660", "#5e8a3a"].map(H3);
  const HEDGE = H3("#5a5038"), WOODB = H3("#5e5254"), WOODB2 = H3("#7a6a64"), OAKB = H3("#8a5a2e"), PINEB = H3("#2a3a2a"), RIDGE = H3("#6a7088");
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const col = (x, y, z, n) => {
    if (z < BROW + 6) {                                    // the yard: late lawn with leaf drifts
      const fine = N3(x * FL / (5 * z), z * FL * 2.2 / (5 * z * z)) * .7;
      let c = L3(LAWN, LAWN2, .5 + .6 * N2(x / 6, z / 6) + .3 * fine);
      c = L3(c, L3(LEAF, LEAF2, .5 + .6 * fine), sm(.15 + .7 * N1(x / 4, z / 4) + .4 * fine) * .8);
      return c.map(v => v * (.88 + .22 * fine)); }
    if (z > 7000) {                                        // the far ridges: bare woods gone blue
      const k = N1(x / 900, z / 900) * .5 + .5; return L3(L3(RIDGE, WOODB, .35), PINEB, k * .3); }
    if (wood(x, z)) {                                      // woodlots: bare grey-violet crowns, bronze oaks, dark pines
      const k = N4(x / 60, z / 60) * .5 + .5, q = hash(Math.floor(x / 70), Math.floor(z / 70));
      let c = L3(WOODB, WOODB2, k);
      if (q < .3) c = L3(c, OAKB, .7); else if (q > .85) c = L3(c, PINEB, .8);
      return c.map(v => v * (.78 + .4 * (N3(x / 14, z / 14) * .5 + .5))); }
    if (lane(x, z)) return GRV.map(v => v * (.9 + .1 * N3(x / 3, z / 3)));
    // contour strips: bands follow the height, wobbling with the land
    const band = (y + 9 * N2(x / 520, z / 520) + 4 * N4(x / 200, z / 200)) / 8.5, i = Math.floor(band), fr = band - i;
    let c = STRIPS[Math.floor(hash(i, Math.floor((x + 6000) / 1400)) * STRIPS.length)];
    // fine rows along the contour, and a grassy margin between strips
    c = c.map(v => v * (.92 + .1 * Math.sin(fr * Math.PI * 14) * sm(1 - z / 2200) + .08 * N3(x / 30, z / 30)));
    if (fr < .07) c = L3(c, HEDGE, .65);
    return c; };
  const far = w.raster({ z0: 1500, z1: 30000, step: .0016, minStep: 2, scale: .6, top: 200, bottom: WY + 30, h: hG, col, tone: rgbTone(T), fog: HZ, fogK: .00011, amb: NIGHT ? .6 : .55, noRefl: true, key: 1e7 });
  const near = w.raster({ z0: 6, z1: 1500, step: .0012, minStep: .05, scale: .75, top: 200, bottom: H, h: hG, col, tone: rgbTone(T), fog: HZ, fogK: .0004, amb: NIGHT ? .55 : .62, noRefl: true, key: 5e6 });
  const seen = (x, z, y) => { const y0 = sy(y, z) - 1;
    for (let q = 8; q < z * .985; q += Math.max(.5, q * .01)) { const xq = x * q / z; if (sy(hG(xq, q), q) < y0) return false; }
    return true; };
  const fogC = (c, fog) => T(mix(c, HZ, fog));

  /* ---------- trees: bare hardwoods, oaks holding bronze leaves, white pines ---------- */
  const BRONZE = ["#3a1e10", "#542a14", "#6e3a18", "#8a4c1e", "#a46228", "#bc7a36", "#d4984e", "#e8b874"];
  const TWIG = ["#2e2830", "#3c343a", "#4a4046", "#5a4e52", "#6a5e60", "#7c7070", "#908480", "#a89a90"];
  const PINE = ["#0c1610", "#122016", "#182a1c", "#1e3422", "#26402a", "#304c32", "#3e5c3c", "#52704a"];
  const LDIR = NIGHT ? [.4, -.6] : [-.9, -.3];
  const clump = (x, y, sz, fog, RAMP, wide = 1, op = 1) => { const c = fogC(RAMP[2 + Math.floor(r() * 3)], fog), dk = mix(c, NIGHT ? "#050814" : "#1a1820", .4), lt = fogC(mix(RAMP[5], RIM, NIGHT ? 0 : .15), fog);
    let g = `<g opacity="${op}"><path d="${blobP(x, y - sz * .45, sz * .5 * wide, sz * .48, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(70, Math.round(sz * wide / 1.4)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .42 * wide, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) / wide * LDIR[0] + (py - y + sz * .5) * LDIR[1] * .6, R = sz * (.1 + r() * .09);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g + `</g>`; };
  /* a bare hardwood: trunk, forking limbs, then a haze of twigs */
  const bare = (x, y, hp, fog) => { const tc = fogC("#4a3e3a", fog), lt = fogC(NIGHT ? "#5a6280" : "#a08a7a", fog);
    let g = "";
    if (hp > 14) { const tw = Math.max(1, hp * .028);
      g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .4)},${F(y - hp * .45)} L${F(x + tw * .4)},${F(y - hp * .45)} L${F(x + tw)},${F(y)}Z" fill="${tc}"/>`;
      const br = (bx, by, a, L, wd, d) => { if (d > 3 || L < 2) return; const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L;
        g += `<path d="M${F(bx)},${F(by)} L${F(ex)},${F(ey)}" stroke="${d === 0 && Math.cos(a) < 0 ? lt : tc}" stroke-width="${F(Math.max(.5, wd))}" stroke-linecap="round"/>`;
        br(ex, ey, a - .35 - r() * .3, L * .68, wd * .62, d + 1); br(ex, ey, a + .3 + r() * .3, L * .64, wd * .6, d + 1); };
      for (let k = 0; k < 3; k++) br(x, y - hp * (.38 + k * .1), -Math.PI / 2 + (k - 1) * .55 + (r() - .5) * .3, hp * .3, tw * .7, 0); }
    else g += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - hp * .5)}" stroke="${tc}" stroke-width="${F(Math.max(.6, hp * .05))}"/>`;
    g += `<path d="${blobP(x, y - hp * .62, hp * .36, hp * .36, 9)}" fill="${fogC(TWIG[3 + Math.floor(r() * 3)], fog)}" opacity=".5"/>`;
    g += `<path d="${blobP(x - hp * .08, y - hp * .7, hp * .22, hp * .22, 7)}" fill="${fogC(TWIG[5], fog)}" opacity=".35"/>`;
    return g; };
  /* an oak holding its last bronze leaves: bare limbs with ragged, gappy tufts strung along them */
  const oak = (x, y, hp, fog) => { let g = bare(x, y, hp, fog);
    const nT = Math.max(4, Math.min(40, Math.round(hp * .9)));
    for (let i = 0; i < nT; i++) { const a = r() * Math.PI * 2, q = Math.pow(r(), .6), tx = x + Math.cos(a) * q * hp * .38, ty = y - hp * .62 + Math.sin(a) * q * hp * .3;
      const side = (tx - x) * LDIR[0] + (ty - y + hp * .62) * LDIR[1], R = hp * (.05 + r() * .06);
      const c = fogC(BRONZE[side > hp * .05 ? 5 + Math.floor(r() * 2) : side > -hp * .08 ? 3 + Math.floor(r() * 2) : 1 + Math.floor(r() * 2)], fog);
      g += `<path d="${blobP(tx, ty, R * (1 + r() * .6), R * .7, 6)}" fill="${c}" opacity="${F(.75 + r() * .25)}"/>`; }
    return hp > 18 ? `<g filter="url(#hpLeafy)">${g}</g>` : g; };
  /* a white pine: soft tufted tiers, lit on the sun side */
  const pine = (x, y, hp, fog) => { const tc = fogC("#3a2c24", fog); let g = `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - hp * .95)}" stroke="${tc}" stroke-width="${F(Math.max(.6, hp * .03))}"/>`;
    const tiers = Math.max(3, Math.min(8, Math.round(hp / 6)));
    for (let t = 0; t < tiers; t++) { const v = t / tiers, ty = y - hp * (.18 + v * .78), wd = hp * .34 * (1 - v * .75) * (.8 + r() * .4);
      g += `<path d="${blobP(x + wd * .15, ty, wd, hp * .07, 7)}" fill="${fogC(PINE[2], fog)}"/>`;
      g += `<path d="${blobP(x - wd * .35, ty - hp * .02, wd * .55, hp * .05, 6)}" fill="${fogC(PINE[NIGHT ? 3 : 5], fog)}"/>`; }
    return g; };
  const treeFn = (hM, kind) => (px, py, kk, fog) => { const hp = hM * kk;
    if (kind === "pine") return pine(px, py, hp, fog);
    if (kind === "oak") return oak(px, py, hp, fog);
    return bare(px, py, hp, fog); };
  const plant = (x, z, hM, kind) => { const y0 = hG(x, z), u = sx(x, z); if (u < -60 || u > W + 60) return;
    if (!seen(x, z, y0 + hM * .6)) return;
    w.sprite({ x, z, y: y0 - .3, tag: "far", fn: treeFn(hM * (.8 + r() * .35), kind) }); };
  const kindOf = () => { const q = r(); return q < .5 ? "bare" : q < .82 ? "oak" : "pine"; };
  for (let i = 0; i < 5200; i++) { const z = 430 + Math.pow(r(), 1.3) * 3600, x = (r() - .5) * 1.7 * z; if (wood(x, z)) plant(x, z, 16 + r() * 10, kindOf()); }
  // hedgerow trees along some strip edges and the lane
  for (let i = 0; i < 2600; i++) { const z = 520 + Math.pow(r(), 1.2) * 2400, x = (r() - .5) * 1.7 * z; if (wood(x, z)) continue;
    const y = hG(x, z), band = (y + 9 * N2(x / 520, z / 520) + 4 * N4(x / 200, z / 200)) / 8.5, fr = band - Math.floor(band);
    if (fr < .06 && N3(x / 240, z / 240) > .1) plant(x, z, 12 + r() * 9, r() < .65 ? "bare" : "oak"); }

  /* ---------- farmsteads on the far slope: white house, white bank barn, silos, a windbreak ---------- */
  const onGround = (x, z, wd, dp) => { const hs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => hG(x + a * wd / 2, z + b * dp / 2)); const top = Math.max(...hs);
    return { y: top, fy: Math.min(...hs) - top - .4 }; };
  const farms = [];
  for (let i = 0; i < 400 && farms.length < 8; i++) { const z = 640 + rh() * 2000, x = (rh() - .5) * 1.5 * z, u = sx(x, z);
    if (u < 80 || u > W - 80 || wood(x, z) || wood(x + 30, z) || lane(x, z)) continue;
    if (farms.some(([a, b]) => Math.hypot(sx(a, b) - u, (sy(hG(a, b), b) - sy(hG(x, z), z)) * 3) < 210)) continue;
    if (!seen(x, z, hG(x, z) + 6)) continue;
    farms.push([x, z]); }
  farms.forEach(([x, z], fi) => {
    const yaw = (rh() - .5) * 50;
    const hs = w.randomHouse(rh, { x, z, yaw, rng: rh, kind: "farm", wall: rh() < .8 ? "#f2eee6" : "#e8e0cc", shut: null, roof: rh() < .5 ? "#4a4c52" : "#6a6e74", tag: "far" });
    Object.assign(hs, onGround(x, z, hs.w, hs.d)); w.house(hs).tag = "far";
    const bx = x + (rh() < .5 ? -1 : 1) * (16 + rh() * 8), bz = z + 10 + rh() * 10, bw = 14 + rh() * 6, bd = 10 + rh() * 3;
    const bg = onGround(bx, bz, bw, bd);
    w.house({ x: bx, z: bz, y: bg.y, fy: bg.fy, yaw: yaw + (rh() - .5) * 20, w: bw, d: bd, h: 5.5, rh: 5.2, roof3: rh() < .6 ? "gambrel" : "gable", wall: "#ece8de", roof: "#5e6268", trim: "#f8f6f0",
      clap: false, door: .5, doorC: "#8a7a64", winGap: 3.4, winTall: .7, shut: null, stone: "#8a8274", rng: rh, tag: "far" }).tag = "far";
    const ns = rh() < .5 ? 1 : 2;
    for (let k = 0; k < ns; k++) { const gx = bx + (k * 5.5 + bw * .55) * (bx > x ? 1 : -1), gz = bz + 4, gy = hG(gx, gz) - .3;
      w.cyl({ x: gx, z: gz, y: gy, r0: 2.4, h: 13 + rh() * 4, n: 14, c: k ? "#b8b4a8" : "#cac4b6", top: "#9a9a9a" }).tag = "far";
      w.cyl({ x: gx, z: gz, y: gy + 13.1 + (k ? 0 : 0), r0: 2.45, r1: .3, h: 2.2, n: 14, c: "#8a8e92" }).tag = "far"; }
    // a short windbreak of white pines behind the house
    for (let k = 0; k < 5; k++) { const px = x + (k - 2) * 5 + rh() * 2, pz = z + 14 + rh() * 6; w.sprite({ x: px, z: pz, y: hG(px, pz) - .3, tag: "far", fn: treeFn(13 + rh() * 5, "pine") }); }
    // a white board fence along a pasture below the barn
    const fz = z - 18 - rh() * 10, fx0 = x - 40, fx1 = x + 40;
    for (let k = 0; k <= 16; k++) { const fx = fx0 + (fx1 - fx0) * k / 16, fzz = fz + (k - 8) * .8, y0 = hG(fx, fzz);
      w.line([[fx, y0, fzz], [fx, y0 + 1.4, fzz]], "#f4f2ea", .14, { min: .5 });
      if (k < 16) { const fx2 = fx0 + (fx1 - fx0) * (k + 1) / 16, fz2 = fz + (k + 1 - 8) * .8, y1 = hG(fx2, fz2);
        [.6, 1.0, 1.35].forEach(b => w.line([[fx, y0 + b, fzz], [fx2, y1 + b, fz2]], "#f4f2ea", .12, { min: .4 })); } }
    if (NIGHT) w.sprite({ x, z: z - 6, y: hG(x, z) + 2, tag: "far", fn: (px, py, k) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(6, k * 9))}" fill="url(#hpWin)"/>` });
  });

  /* ---------- the yard: a white board fence along the brow, a woodpile, leaves ---------- */
  { const fz = z => 58 + .05 * z;
    let prev = null;
    for (let x = -80; x <= 80; x += 2.4) { const z = 56 + x * .06, y0 = hG(x, z);
      w.line([[x, y0 - .05, z], [x, y0 + 1.25, z]], "#efece2", .11, { min: .6 });
      if (prev) [.45, .85, 1.2].forEach(b => w.line([[prev[0], prev[1] + b, prev[2]], [x, y0 + b, z]], "#f2efe6", .14, { min: .5 }));
      prev = [x, y0, z]; } }
  // a split-wood pile with a tin roof at the left of the yard
  { const x = -17, z = 28, y0 = hG(x, z);
    w.box({ x, z, y: y0, w: 3.6, d: 1, h: 1.3, c: "#8a6a4a", top: "#a88a64" });
    w.sprite({ x, z: z - .52, y: y0, bias: -.3, fn: (px, py, k) => { let g = ""; const sz = .14 * k;
      for (let row = 0; row < 8; row++) for (let i = 0; i < 24; i++) { const ux = px - 1.75 * k + (i + (row % 2) * .5) * 3.5 * k / 24, uy = py - (row + .5) * 1.25 * k / 8;
        g += `<ellipse cx="${F(ux)}" cy="${F(uy)}" rx="${F(sz * (.75 + rf() * .3))}" ry="${F(sz * (.6 + rf() * .3))}" fill="${T(rf() < .5 ? "#c8a070" : "#a8784a")}"/><ellipse cx="${F(ux)}" cy="${F(uy)}" rx="${F(sz * .35)}" ry="${F(sz * .3)}" fill="${T("#8a6038")}" opacity=".6"/>`; }
      return g; } });
    [-1.9, -.6, .6, 1.9].forEach(d => w.box({ x: x + d, z: z - .55, y: y0, w: .09, d: .09, h: 1.45, c: "#6a5440" })); }
  // leaves on the yard
  const LEAFC = ["#8a3a18", "#a85a22", "#c47a2e", "#d89a40", "#6a4a26", "#9a6a2a"];
  for (let i = 0; i < 900; i++) { const z = 9 + Math.pow(r(), 1.2) * 50, x = (r() - .5) * 1.5 * z, c = LEAFC[Math.floor(r() * LEAFC.length)], a = r() * 6, sz = .06 + r() * .05;
    w.sprite({ x, z, y: hG(x, z), bias: .05, fn: (px, py, k, fog) => { const R = Math.max(.8, sz * k), sq = .25;
      return `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(R)}" ry="${F(R * sq + .3)}" transform="rotate(${F(a * 8 - 24)} ${F(px)} ${F(py)})" fill="${fogC(c, fog)}"/>`; } }); }

  /* ---------- the porch rail: cap, top rail, balusters, the stair post ---------- */
  const railX = z => -.05 + .9 * (z - 1.5), YAW = Math.atan2(1, .9) * 180 / Math.PI;   // 48 degrees
  const CAP = NIGHT ? "#d8d4ca" : "#f2e8d2";
  { const z0 = .5, z1 = 4.0, zc = (z0 + z1) / 2, len = (z1 - z0) * Math.hypot(.9, 1);
    w.box({ x: railX(zc), z: zc, y: RT - .045, w: len, d: .15, h: .045, yaw: YAW, c: CAP, top: mix(CAP, "#ffffff", .3), tag: "porch" });
    w.box({ x: railX(zc), z: zc, y: RT - .135, w: len, d: .06, h: .09, yaw: YAW, c: mix(CAP, "#8a8070", .15), tag: "porch" });
    for (let z = .6; z < 3.95; z += .118) w.box({ x: railX(z), z, y: RT - 1, w: .045, d: .045, h: .87, yaw: YAW, c: mix(CAP, "#8a8070", .1), tag: "porch" });
    // the stair post with a chamfered cap and a ball
    const px = railX(4.06), pz = 4.06;
    w.box({ x: px, z: pz, y: RT - 1, w: .14, d: .14, h: 1.12, yaw: YAW, c: CAP, top: mix(CAP, "#ffffff", .3), tag: "porch" });
    w.box({ x: px, z: pz, y: RT + .12, w: .2, d: .2, h: .035, yaw: YAW, c: mix(CAP, "#ffffff", .2), tag: "porch" }); }
  const [pstX, pstY] = w.proj([railX(4.06), RT + .155, 4.06]), pstK = FL / 4.06;
  // brush marks and worn paint along the cap's top, and a few leaves blown onto it
  const capMarks = () => { let g = "";
    for (let i = 0; i < 260; i++) { const z = .86 + Math.pow(rp(), .8) * 3.1, off = (rp() - .5) * .13, L = .05 + rp() * .25;
      const a = [railX(z) - .743 * off, RT + .001, z + .669 * off], b = [a[0] + .669 * L, RT + .001, a[2] + .743 * L];
      const p = w.proj(a), q = w.proj(b), wk = rp() < .12;
      g += `<path d="M${F(p[0])},${F(p[1])} L${F(q[0])},${F(q[1])}" stroke="${T(wk ? "#9a8e7c" : rp() < .5 ? "#fffaf0" : "#c8c0b0")}" stroke-width="${F(Math.max(.6, 1.6 / z))}" opacity="${wk ? .5 : .35}"/>`; }
    [[1.0, .03, "#a8521e"], [1.18, -.04, "#c47a2e"], [3.0, .02, "#8a3a18"]].forEach(([z, off, c]) => { const p = w.proj([railX(z) - .743 * off, RT + .002, z + .669 * off]), R = .022 * FL / z;
      g += `<path d="${blobP(p[0], p[1], R, R * .22, 7, rp)}" fill="${T(c)}"/><path d="M${F(p[0] - R * .8)},${F(p[1])} L${F(p[0] + R * .8)},${F(p[1])}" stroke="${T("#5a2a10")}" stroke-width="1" opacity=".6"/>`; });
    return g; };

  /* ---------------- assemble the world ---------------- */
  const isFar = o => o === far, isNear = o => o === near, isFarObj = o => !o.raster && o.tag === "far", isPorch = o => o.tag === "porch",
        rest = o => !o.raster && o.tag !== "far" && o.tag !== "porch";
  s += `<rect x="0" y="${WY - 70}" width="${W}" height="${H - WY + 70}" fill="${T("#8a8a6a")}"/>`;
  s += w.draw({ where: isFar });
  s += `<rect x="0" y="${WY - 90}" width="${W}" height="110" fill="url(#hpHaze)" opacity=".45"/>`;
  s += w.draw({ where: isNear });
  s += `<rect x="0" y="${WY - 60}" width="${W}" height="70" fill="url(#hpHaze)" opacity=".18"/>`;
  s += w.draw({ where: isFarObj });
  s += w.draw({ where: rest });
  s += w.draw({ where: isPorch });
  // sun warming the rail's face toward the left, a weathered grey dulling it toward the post
  { const pa = w.proj([railX(.86), RT, .86]), pb = w.proj([railX(4), RT, 4]), pc = w.proj([railX(4), RT - .14, 4]), pd = w.proj([railX(.86), RT - .14, .86]);
    s += `<defs><linearGradient id="hpRail" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0"><stop offset="0" stop-color="${NIGHT ? "#101838" : "#ffd8a0"}" stop-opacity="${NIGHT ? .3 : .28}"/><stop offset=".5" stop-color="${NIGHT ? "#101838" : "#ffe8c8"}" stop-opacity=".08"/><stop offset="1" stop-color="${NIGHT ? "#ffb060" : "#8a8a9a"}" stop-opacity="${NIGHT ? .25 : .12}"/></linearGradient></defs>`;
    s += `<path d="M${F(pa[0])},${F(pa[1])} L${F(pb[0])},${F(pb[1])} L${F(pc[0])},${F(pc[1])} L${F(pd[0])},${F(pd[1])}Z" fill="url(#hpRail)" style="mix-blend-mode:${NIGHT ? "normal" : "multiply"}"/>`;
    // grain and worn paint along the cap's front face
    for (let i = 0; i < 120; i++) { const z = .86 + Math.pow(rp(), .9) * 3.1, v = RT - .006 - rp() * .038, L = .1 + rp() * .4;
      const p = w.proj([railX(z) + .743 * .075, v, z - .669 * .075]), q = w.proj([railX(z + L * .743) + .743 * .075, v, z + L * .743 - .669 * .075]);
      s += `<path d="M${F(p[0])},${F(p[1])} L${F(q[0])},${F(q[1])}" stroke="${T(rp() < .3 ? "#8a7e6c" : "#fff8ea")}" stroke-width="${F(Math.max(.6, 1.4 / z))}" opacity=".35"/>`; } }
  s += capMarks();

  /* ================= on the rail: mums, gourds, a white pumpkin, the cat ================= */
  const ORG = ["#5a200a", "#86300c", "#ac4410", "#cc5a16", "#e2731e", "#f08e2e", "#f8ac52", "#fcca86"];
  const WHT = ["#6a6250", "#8a8270", "#a8a08c", "#c4bca6", "#d8d2be", "#e8e4d4", "#f4f0e2", "#fffcf2"];
  const YEL = ["#5a4410", "#7a5e14", "#9a7a1a", "#b89624", "#d0b032", "#e2c648", "#eed866", "#f8ea9a"];
  const GRN = ["#14200e", "#1e2e12", "#2a3e18", "#38501e", "#486226", "#5c7632", "#748c42", "#94a85a"];
  const NL = NIGHT ? [.75, .2, -.25] : [-.8, .4, .4];        // light on rail things: the lantern at night, the sun by day
  const tc = c => NIGHT ? mix(T(c), c, .25) : c;
  const glowK = (px, py) => NIGHT ? Math.max(0, 1 - Math.hypot(px - pstX, py - pstY + 60) / 900) : 0;
  const warm = (c, px, py) => { const g = glowK(px, py); return g > 0 ? mix(tc(c), "#ffb060", g * .45) : tc(c); };
  /* a ribbed round fruit (pumpkin, squash), sitting at px, py; R px */
  const ribbed = (px, py, R, sq, RAMP, nr, stem = "#5a4a2a") => {
    const ry = R * sq, cy = py - ry, C = i => warm(RAMP[Math.max(0, Math.min(7, i))], px, py);
    let g = `<ellipse cx="${F(px + R * (NIGHT ? -.3 : .35))}" cy="${F(py)}" rx="${F(R * 1.15)}" ry="${F(Math.max(1, R * .12))}" fill="#000" opacity=".28"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(2)}"/>`;
    for (let i = 0; i < nr; i++) { const u = (i + .5) / nr * 2 - 1, rx = R * (1 - Math.abs(u) * .55) / nr * 1.25, side = u * (NIGHT ? 1 : -1);
      g += `<ellipse cx="${F(px + u * R * .62)}" cy="${F(cy)}" rx="${F(rx)}" ry="${F(ry * (.97 - Math.abs(u) * .08))}" fill="${C(side > .3 ? 6 : side > -.2 ? 5 : side > -.6 ? 4 : 3)}"/>`; }
    for (let i = 1; i < nr; i++) { const u = i / nr * 2 - 1;
      g += `<path d="M${F(px + u * R * .7)},${F(cy - ry * .9 * Math.sqrt(1 - u * u * .6))} Q${F(px + u * R * .86)},${F(cy)} ${F(px + u * R * .7)},${F(cy + ry * .9 * Math.sqrt(1 - u * u * .6))}" stroke="${C(1)}" stroke-width="${F(R * .025)}" fill="none" opacity=".5"/>`; }
    g += `<ellipse cx="${F(px + R * (NIGHT ? .4 : -.42))}" cy="${F(cy - ry * .4)}" rx="${F(R * .2)}" ry="${F(ry * .14)}" fill="${C(7)}" opacity=".7"/>`;
    g += `<path d="M${F(px - R * .07)},${F(cy - ry * .88)} q${F(R * .02)},${F(-R * .24)} ${F(R * .17)},${F(-R * .32)} l${F(R * .07)},${F(R * .06)} q${F(-R * .1)},${F(R * .1)} ${F(-R * .08)},${F(R * .28)}Z" fill="${warm(stem, px, py)}"/>`;
    return g; };
  /* a crookneck gourd lying on its side, warty */
  const crook = (px, py, L, RAMP, dir = 1) => { const C = i => warm(RAMP[i], px, py), R = L * .28;
    let g = `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(L * .6)}" ry="${F(Math.max(1, R * .25))}" fill="#000" opacity=".28"/>`;
    const d = `M${F(px - dir * L * .5)},${F(py - R * .1)} q${F(-dir * R * .2)},${F(-R * 1.9)} ${F(dir * R * 1.2)},${F(-R * 1.9)} q${F(dir * L * .35)},${F(R * .2)} ${F(dir * L * .55)},${F(R * .9)} q${F(dir * L * .2)},${F(R * .5)} ${F(dir * L * .05)},${F(R * 1.0)}Z`;
    g += `<path d="${d}" fill="${C(3)}"/>`;
    g += `<path d="M${F(px - dir * L * .4)},${F(py - R * .5)} q${F(dir * R * .2)},${F(-R * 1.2)} ${F(dir * R * 1)},${F(-R * 1.3)} q${F(dir * L * .2)},${F(R * .1)} ${F(dir * L * .4)},${F(R * .6)}" stroke="${C(6)}" stroke-width="${F(R * .3)}" fill="none" stroke-linecap="round" opacity=".75"/>`;
    for (let i = 0; i < 26; i++) { const t = rf(), wx = px - dir * L * .45 + dir * t * L * .9, wy = py - R * (.3 + rf() * 1.2) * (1 - t * .4);
      g += `<circle cx="${F(wx)}" cy="${F(wy)}" r="${F(R * (.06 + rf() * .06))}" fill="${C(rf() < .5 ? 6 : 2)}"/>`; }
    g += `<path d="M${F(px - dir * L * .5)},${F(py - R * .4)} l${F(-dir * R * .35)},${F(-R * .25)}" stroke="${warm("#5a4a2a", px, py)}" stroke-width="${F(R * .2)}" stroke-linecap="round"/>`;
    return g; };
  /* a striped round gourd */
  const striped = (px, py, R) => { const cy = py - R * .9;
    let g = `<ellipse cx="${F(px + R * .3)}" cy="${F(py)}" rx="${F(R * 1.1)}" ry="${F(Math.max(1, R * .12))}" fill="#000" opacity=".28"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(R * .9)}" fill="${warm(GRN[3], px, py)}"/>`;
    for (let i = -3; i <= 3; i++) { const u = i / 3.6;
      g += `<path d="M${F(px)},${F(cy - R * .9)} Q${F(px + u * R * 1.25)},${F(cy)} ${F(px)},${F(cy + R * .9)}" stroke="${warm(WHT[5], px, py)}" stroke-width="${F(R * .1)}" fill="none" opacity=".85"/>`; }
    g += `<ellipse cx="${F(px + R * (NIGHT ? .3 : -.35))}" cy="${F(cy - R * .3)}" rx="${F(R * .45)}" ry="${F(R * .4)}" fill="${warm("#d8e4a8", px, py)}" opacity=".35"/>`;
    g += `<ellipse cx="${F(px + R * (NIGHT ? -.4 : .45))}" cy="${F(cy + R * .2)}" rx="${F(R * .5)}" ry="${F(R * .6)}" fill="#000" opacity=".2"/>`;
    return g; };
  /* bicolour pear gourd: yellow neck, green bottom */
  const pear = (px, py, R) => { const cy = py - R;
    let g = `<ellipse cx="${F(px + R * .3)}" cy="${F(py)}" rx="${F(R * 1.05)}" ry="${F(Math.max(1, R * .12))}" fill="#000" opacity=".28"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(R)}" fill="${warm(GRN[4], px, py)}"/>`;
    g += `<path d="M${F(px - R * .5)},${F(cy - R * .6)} Q${F(px - R * .4)},${F(cy - R * 1.9)} ${F(px)},${F(cy - R * 1.95)} Q${F(px + R * .45)},${F(cy - R * 1.9)} ${F(px + R * .55)},${F(cy - R * .6)} Q${F(px)},${F(cy - R * .3)} ${F(px - R * .5)},${F(cy - R * .6)}Z" fill="${warm(YEL[4], px, py)}"/>`;
    g += `<path d="M${F(px - R * .3)},${F(cy - R * 1.6)} q${F(-R * .1)},${F(R * .6)} ${F(-R * .2)},${F(R * 1.1)}" stroke="${warm(YEL[7], px, py)}" stroke-width="${F(R * .18)}" fill="none" stroke-linecap="round" opacity=".7"/>`;
    g += `<ellipse cx="${F(px + R * .4)}" cy="${F(cy + R * .1)}" rx="${F(R * .45)}" ry="${F(R * .65)}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(px)},${F(cy - R * 1.95)} l${F(R * .08)},${F(-R * .3)}" stroke="${warm("#5a4a2a", px, py)}" stroke-width="${F(R * .14)}"/>`;
    return g; };
  /* a pot of bronze garden mums */
  const mums = (px, py, k) => { const pw = .085 * k, ph = .13 * k, top = py - ph;
    let g = `<ellipse cx="${F(px + pw * .5)}" cy="${F(py)}" rx="${F(pw * 1.5)}" ry="${F(Math.max(1, pw * .12))}" fill="#000" opacity=".3"/>`;
    g += `<path d="M${F(px - pw * .78)},${F(py)} L${F(px - pw)},${F(top + ph * .2)} L${F(px + pw)},${F(top + ph * .2)} L${F(px + pw * .78)},${F(py)}Z" fill="${warm("#a8522c", px, py)}"/>`;
    g += `<path d="M${F(px + pw * .1)},${F(py)} L${F(px + pw * .2)},${F(top + ph * .2)} L${F(px + pw)},${F(top + ph * .2)} L${F(px + pw * .78)},${F(py)}Z" fill="${warm(NIGHT ? "#c8683a" : "#7a3a20", px, py)}"/>`;
    g += `<rect x="${F(px - pw * 1.06)}" y="${F(top)}" width="${F(pw * 2.12)}" height="${F(ph * .22)}" fill="${warm("#b8603a", px, py)}"/>`;
    const MUM = ["#5a1e0c", "#7a2c10", "#9a4014", "#b8561c", "#cc6e26", "#de8a34", "#eaa84c", "#f6c874"], LV = GRN;
    const cx = px, cy = top - .07 * k, rx = .15 * k, ry = .085 * k;
    g += `<ellipse cx="${F(cx)}" cy="${F(cy + ry * .3)}" rx="${F(rx * 1.02)}" ry="${F(ry * .9)}" fill="${warm(LV[2], px, py)}"/>`;
    const fl = [];
    for (let i = 0; i < 360; i++) { const a = rf() * Math.PI * 2, q = Math.sqrt(rf()), fx = cx + Math.cos(a) * q * rx, fy = cy + Math.sin(a) * q * ry * (Math.sin(a) < 0 ? 1 : .8) - (1 - q) * ry * .3;
      const lit = (Math.cos(a) * q * NL[0] * -1 * (NIGHT ? -1 : 1) + (-Math.sin(a)) * q * .6) * .5 + .5;
      fl.push([fy, fx, cl(lit * .75 + (rf() - .5) * .3 + .1), rf() < .12]); }
    fl.sort((a, b) => a[0] - b[0]).forEach(([fy, fx, v, leafy]) => { const R = .011 * k * (.8 + rf() * .5);
      if (leafy) { g += `<path d="${blobP(fx, fy, R * 1.2, R * .7, 5, rf)}" fill="${warm(LV[3 + Math.floor(v * 3)], px, py)}"/>`; return; }
      g += `<circle cx="${F(fx)}" cy="${F(fy)}" r="${F(R)}" fill="${warm(MUM[Math.min(7, Math.floor(v * 8))], px, py)}"/><circle cx="${F(fx)}" cy="${F(fy)}" r="${F(R * .35)}" fill="${warm("#6a3a10", px, py)}" opacity=".7"/>`; });
    return g; };
  /* Indian corn: three ears, husks pulled back and tied, hung on the post */
  const corn = (px, py, k) => { let g = `<path d="M${F(px)},${F(py)} l0,${F(.025 * k)}" stroke="${warm("#6a5a40", px, py)}" stroke-width="${F(.006 * k)}"/>`;
    const KC = ["#8a1e14", "#5a1a3a", "#d8a030", "#e8d8a8", "#3a2a5a", "#b84a1a", "#c8b070", "#7a3a20"];
    [[-.05, .22, .2], [.0, .24, 0], [.05, .2, -.2]].forEach(([dx, L, a], ei) => { const ex = px + dx * k, ey = py + .03 * k, ang = a;
      // the husks fanning up over the tie
      for (let h = 0; h < 4; h++) { const ha = -Math.PI / 2 + (h - 1.5) * .35 + ang * .5, hl = (.1 + rf() * .05) * k;
        g += `<path d="M${F(ex)},${F(ey)} q${F(Math.cos(ha) * hl * .6 + (h - 1.5) * .01 * k)},${F(Math.sin(ha) * hl * .5)} ${F(Math.cos(ha) * hl)},${F(Math.sin(ha) * hl)} q${F(-Math.cos(ha) * hl * .2)},${F(hl * .3)} ${F(-Math.cos(ha) * hl * .9)},${F(-Math.sin(ha) * hl)}Z" fill="${warm(h % 2 ? "#d8c49a" : "#c4ac78", px, py)}" stroke="${warm("#8a7650", px, py)}" stroke-width=".6"/>`; }
      // the ear: rows of kernels
      const ca = Math.PI / 2 + ang, ux = Math.cos(ca), uy = Math.sin(ca), rad = .022 * k, Lp = L * k * .9;
      g += `<path d="M${F(ex - uy * rad * .6)},${F(ey + ux * rad * .6)} L${F(ex + ux * Lp - uy * rad * .3)},${F(ey + uy * Lp + ux * rad * .3)} L${F(ex + ux * Lp + uy * rad * .3)},${F(ey + uy * Lp - ux * rad * .3)} L${F(ex + uy * rad * .6)},${F(ey - ux * rad * .6)}Z" fill="${warm("#3a2414", px, py)}"/>`;
      for (let i = 0; i < 26; i++) for (let j = -3; j <= 3; j++) { const t = (i + .5) / 26, wdt = rad * (1 - t * .45), ox = j / 3.5 * wdt;
        const kx = ex + ux * t * Lp - uy * ox, ky = ey + uy * t * Lp + ux * ox, kr = wdt * .17 * (1 - Math.abs(j) * .08);
        const sh = j / 3 * (NIGHT ? 1 : -1), c = KC[Math.floor(hash(i * 7 + ei, j) * KC.length)];
        g += `<circle cx="${F(kx)}" cy="${F(ky)}" r="${F(kr)}" fill="${warm(mix(c, sh > .3 ? "#fff0d0" : "#000000", Math.abs(sh) * .3), px, py)}"/>`; } });
    return g; };
  /* the tin barn lantern on the post */
  const lantern = (px, py, k) => { const m = v => v * k, FR = warm("#2a2a2c", px, py);
    let g = "";
    if (NIGHT) g += `<circle cx="${F(px)}" cy="${F(py - m(.12))}" r="${F(m(1.4))}" fill="url(#hpGlow)" opacity=".75"/>`;
    g += `<rect x="${F(px - m(.075))}" y="${F(py - m(.02))}" width="${F(m(.15))}" height="${F(m(.02))}" fill="${FR}"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(py - m(.12))}" rx="${F(m(.06))}" ry="${F(m(.085))}" fill="${NIGHT ? "#fff2c8" : "#c8d0d4"}" opacity="${NIGHT ? 1 : .8}"/>`;
    if (NIGHT) g += `<ellipse cx="${F(px)}" cy="${F(py - m(.1))}" rx="${F(m(.015))}" ry="${F(m(.03))}" fill="#ffffff"/>`;
    else g += `<ellipse cx="${F(px - m(.025))}" cy="${F(py - m(.15))}" rx="${F(m(.015))}" ry="${F(m(.04))}" fill="#ffffff" opacity=".7"/><ellipse cx="${F(px + m(.02))}" cy="${F(py - m(.1))}" rx="${F(m(.02))}" ry="${F(m(.05))}" fill="#5a6066" opacity=".35"/>`;
    [-1, 1].forEach(d => g += `<path d="M${F(px + d * m(.07))},${F(py - m(.02))} L${F(px + d * m(.07))},${F(py - m(.21))}" stroke="${FR}" stroke-width="${F(m(.01))}"/>`);
    g += `<path d="M${F(px - m(.075))},${F(py - m(.21))} L${F(px + m(.075))},${F(py - m(.21))} L${F(px + m(.04))},${F(py - m(.25))} L${F(px - m(.04))},${F(py - m(.25))}Z" fill="${FR}"/>`;
    g += `<path d="M${F(px - m(.05))},${F(py - m(.26))} Q${F(px)},${F(py - m(.34))} ${F(px + m(.05))},${F(py - m(.26))}" stroke="${FR}" stroke-width="${F(m(.006))}" fill="none"/>`;
    return g; };

  // the stair post things: lantern on top, corn hung on its face
  s += lantern(pstX, pstY, pstK);
  { const [cx2, cy2] = w.proj([railX(4.06) - .08, RT + .06, 3.98]); s += corn(cx2, cy2, FL / 3.98); }
  // things on the rail cap, far to near
  const onRail = z => { const [px, py] = w.proj([railX(z), RT, z]); return [px, py, FL / z]; };
  { const [px, py, k] = onRail(3.35); s += mums(px, py, k); }
  { const [px, py, k] = onRail(2.86); s += crook(px - .02 * k, py, .17 * k, YEL, -1); }
  { const [px, py, k] = onRail(2.66); s += striped(px + .02 * k, py, .045 * k); }
  { const [px, py, k] = onRail(2.5); s += pear(px - .01 * k, py, .038 * k) + ribbed(px + .05 * k, py + .004 * k, .04 * k, .72, ORG, 5); }
  { const [px, py, k] = onRail(2.08); s += ribbed(px, py, .062 * k, .62, WHT, 7, "#6a6a4a"); }

  /* the cat: a ginger tabby with white bib and socks, sitting up, tail round its paws,
     head turned to us. Ellipsoid parts covered in fur strokes, shaded by which way
     each faces the light, with mackerel stripes laid around the body.               */
  const cat = (bx, by, k) => {
    const S = .92, X = u => bx + u * S * k, Y = v => by - v * S * k, M = v => v * S * k;
    const Pal = a => a.map(c => NIGHT ? mix(T(c), c, .3) : c);
    const GING = Pal(["#4a1c08", "#6e2c0c", "#94400e", "#b85818", "#d27222", "#e48c36", "#f0a856", "#f8c886"]);
    const WHITE = Pal(["#5a5450", "#7a7470", "#9a948e", "#bab4ac", "#d4cec4", "#e6e0d6", "#f2eee6", "#fcfaf4"]);
    const STRIPE = Pal(["#3a1404", "#561e06", "#702a0a", "#8a360c"]);
    const RIMC = NIGHT ? "#ffc070" : "#fff2d4";
    const LS = (v => { const l = Math.hypot(...v); return v.map(q => q / l); })(NIGHT ? [.7, .25, -.25] : [-.78, .42, .46]);
    const FILL = NIGHT ? [-.2, .3, .9] : null;
    const NS = noise2(seed + 55), hw = Math.max(1.1, k * .0019);
    const part = o => { const { cu, cv, a, b, rot = 0, ramp, flow = -1.57, len = .012, dens = 1, stripe = 0, sf = 70, sa = 0, ring, radial, white } = o;
      const cr = Math.cos(rot), sr = Math.sin(rot);
      let g = `<ellipse cx="${F(X(cu))}" cy="${F(Y(cv))}" rx="${F(M(a))}" ry="${F(M(b))}" transform="rotate(${F(-rot * 57.3)} ${F(X(cu))} ${F(Y(cv))})" fill="${ramp[3]}"/>`;
      const n = Math.min(7000, Math.round(Math.PI * a * b * M(1) * M(1) / 6 * dens)), segs = [];
      for (let i = 0; i < n; i++) { const ang = rf() * Math.PI * 2, q = Math.sqrt(rf()) * 1.03, p = Math.cos(ang) * q, t = Math.sin(ang) * q;
        const du = p * a * cr - t * b * sr, dv = p * a * sr + t * b * cr;
        const nu = p * cr - t * sr, nv = p * sr + t * cr, nz = Math.sqrt(Math.max(0, 1 - q * q));
        const lit = nu * LS[0] + nv * LS[1] + nz * LS[2];
        let v = cl(.4 + lit * .55 + (rf() - .5) * .16);
        if (FILL) v = cl(Math.max(v * .8, .28 + (nu * FILL[0] + nv * FILL[1] + nz * FILL[2]) * .25));
        let c = ramp[Math.floor(v * 8)];
        const U = cu + du, V = cv + dv;
        if (white && (typeof white === "function" ? white(U, V) : true)) c = WHITE[Math.min(7, Math.floor(v * 8) + 1)];
        else if (stripe) { const sv = ring ? Math.hypot(U - ring[0], (V - ring[1]) * 1.1) * sf : (U * Math.cos(sa) + V * Math.sin(sa)) * sf;
          if (Math.sin(sv + NS(U * 40, V * 40) * 1.6) > .45) c = mix(c, STRIPE[Math.min(3, Math.floor(v * 4))], stripe); }
        if (q > .8 && lit > .2) c = mix(c, RIMC, (q - .8) * 2.4 * (NIGHT ? .85 : .55));
        const th = radial ? Math.atan2(V - radial[1], U - radial[0]) + (rf() - .5) * .5 : flow + (rf() - .5) * .55 + p * .2;
        const L = M(len) * (.6 + rf() * .7);
        segs.push(`<path d="M${F(X(U))},${F(Y(V))}l${F(Math.cos(th) * L)},${F(-Math.sin(th) * L)}" stroke="${c}"/>`); }
      return g + `<g stroke-width="${F(hw)}" stroke-linecap="round">${segs.join("")}</g>`; };
    const cheekWhite = (U, V) => V < .262 && Math.abs(U + .008) < .036 - (V - .23) * .25;
    let g = "";
    // contact shadow on the cap: the sun is behind the left shoulder, so it falls right and away
    g += `<ellipse cx="${F(X(NIGHT ? -.02 : .07))}" cy="${F(by + 2)}" rx="${F(M(.17))}" ry="${F(Math.max(2, M(.014)))}" fill="#000" opacity=".32"/>`;
    if (!NIGHT) g += `<ellipse cx="${F(X(.2))}" cy="${F(by - 1)}" rx="${F(M(.16))}" ry="${F(M(.01))}" fill="#3a3050" opacity=".22" filter="url(#hpBlur2)"/>`;
    g += `<g filter="url(#hpFur)">`;
    g += part({ cu: .052, cv: .085, a: .088, b: .086, ramp: GING, flow: -1.3, stripe: .5, sf: 110, ring: [.06, .095] });                 // haunch
    g += part({ cu: .006, cv: .152, a: .07, b: .108, rot: -.1, ramp: GING, flow: -1.6, stripe: .5, sf: 95, sa: 1.45 });               // torso
    g += part({ cu: .02, cv: .062, a: .021, b: .062, ramp: GING, flow: -1.57, len: .009, stripe: .6, sf: 90, sa: 1.57,
      white: (U, V) => V < .03 });                                                                                                      // far foreleg
    g += part({ cu: -.024, cv: .168, a: .042, b: .074, ramp: WHITE, flow: -1.57, len: .014, white: true });                          // bib
    g += part({ cu: -.03, cv: .062, a: .023, b: .064, rot: .04, ramp: GING, flow: -1.57, len: .009, stripe: .6, sf: 90, sa: 1.57,
      white: (U, V) => V < .045 || (U > -.035 && V > .09) });                                                                          // near foreleg
    g += part({ cu: -.034, cv: .012, a: .027, b: .014, ramp: WHITE, flow: 3.1, len: .007, white: true });                            // near paw
    g += part({ cu: .022, cv: .011, a: .024, b: .012, ramp: WHITE, flow: 0, len: .007, white: true });                               // far paw
    g += `</g>`;
    // toes
    [[-.048, .006], [-.036, .004], [-.024, .005], [.012, .004], [.024, .004]].forEach(([u, v]) =>
      g += `<path d="M${F(X(u))},${F(Y(v + .012))} l0,${F(M(.01))}" stroke="${WHITE[1]}" stroke-width="${F(Math.max(.8, M(.0018)))}" stroke-linecap="round" opacity=".6"/>`);
    /* the tail: from behind the right haunch, round the front of the paws, tip curling up at the left */
    { const SP = [[.125, .055], [.136, .028], [.112, .01], [.058, .004], [-.005, .002], [-.06, .006], [-.092, .016], [-.104, .032], [-.097, .045]], pts = [];
      const crm = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return [0, 1].map(i => .5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3)); };
      for (let i = 0; i < SP.length - 1; i++) { const p0 = SP[Math.max(0, i - 1)], p1 = SP[i], p2 = SP[i + 1], p3 = SP[Math.min(SP.length - 1, i + 2)];
        for (let j = 0; j < 24; j++) pts.push(crm(p0, p1, p2, p3, j / 24)); }
      pts.push(SP[SP.length - 1]);
      const N = pts.length, rad = t => .0165 * (1 - t * .25) * (t > .92 ? 1 - (t - .92) * 6 : 1);
      let body = "", segs = [];
      for (let i = 0; i < N; i += 2) { const t = i / (N - 1); body += `<circle cx="${F(X(pts[i][0]))}" cy="${F(Y(pts[i][1]))}" r="${F(M(rad(t)) * .9)}" fill="${GING[3]}"/>`; }
      for (let i = 0; i < N; i++) { const t = i / (N - 1), a0 = pts[Math.max(0, i - 1)], a1 = pts[Math.min(N - 1, i + 1)];
        let tu = a1[0] - a0[0], tv = a1[1] - a0[1]; const tl = Math.hypot(tu, tv) || 1; tu /= tl; tv /= tl;
        const ringOn = Math.sin(t * 46) > .45 && t < .97;
        for (let h = 0; h < 14; h++) { const sd = (rf() * 2 - 1), nu = -tv, nv = tu, ox = sd * rad(t);
          const lit = nu * sd * LS[0] + nv * sd * LS[1] + Math.sqrt(1 - sd * sd) * LS[2];
          let v = cl(.42 + lit * .5 + (rf() - .5) * .18); if (FILL) v = Math.max(v * .8, .3);
          let c = GING[Math.floor(v * 8)]; if (ringOn) c = mix(c, STRIPE[Math.min(3, Math.floor(v * 4))], .5);
          if (Math.abs(sd) > .8 && lit > .2) c = mix(c, RIMC, NIGHT ? .5 : .35);
          const L = M(.014) * (.6 + rf() * .6), th = Math.atan2(-tv, tu) * -1;
          const x0 = X(pts[i][0] + nu * ox), y0 = Y(pts[i][1] + nv * ox), dx = tu * L + nu * sd * L * .4, dy = -(tv * L + nv * sd * L * .4);
          segs.push(`<path d="M${F(x0)},${F(y0)}l${F(dx)},${F(dy)}" stroke="${c}"/>`); } }
      g += `<g filter="url(#hpFur)">${body}<g stroke-width="${F(hw)}" stroke-linecap="round">${segs.join("")}</g></g>`; }
    // ears (behind the head)
    const ear = (b0, b1, tip, inner) => { const [x0, y0] = b0, [x1, y1] = b1, [xt, yt] = tip;
      let e = `<path d="M${F(X(x0))},${F(Y(y0))} Q${F(X((x0 + xt) / 2 - .004))},${F(Y((y0 + yt) / 2 + .004))} ${F(X(xt))},${F(Y(yt))} Q${F(X((x1 + xt) / 2 + .006))},${F(Y((y1 + yt) / 2))} ${F(X(x1))},${F(Y(y1))}Z" fill="${GING[inner ? 5 : 3]}"/>`;
      const ix = (x0 + x1) / 2, iy = (y0 + y1) / 2;
      e += `<path d="M${F(X(x0 + (ix - x0) * .3))},${F(Y(y0 + .006))} Q${F(X((ix + xt) / 2))},${F(Y((iy + yt) / 2 + .01))} ${F(X(xt + (ix - xt) * .18))},${F(Y(yt - .008))} Q${F(X((ix + xt) / 2 + .008))},${F(Y((iy + yt) / 2))} ${F(X(x1 + (ix - x1) * .3))},${F(Y(y1 + .006))}Z" fill="${NIGHT ? mix(T("#d89088"), "#d89088", .3) : "#e0a090"}"/>`;
      for (let i = 0; i < 9; i++) { const t = .2 + rf() * .5; e += `<path d="M${F(X(ix + (xt - ix) * t * .5))},${F(Y(iy + .004))} l${F(M((rf() - .5) * .012))},${F(-M(.012 + rf() * .012))}" stroke="${WHITE[6]}" stroke-width="${F(hw * .7)}" opacity=".8"/>`; }
      e += `<path d="M${F(X(x0))},${F(Y(y0))} Q${F(X((x0 + xt) / 2 - .004))},${F(Y((y0 + yt) / 2 + .004))} ${F(X(xt))},${F(Y(yt))}" stroke="${inner ? GING[6] : RIMC}" stroke-width="${F(hw * 1.2)}" fill="none" opacity="${inner ? .5 : .7}"/>`;
      return e; };
    g += ear([-.066, .288], [-.022, .312], [-.06, .352], false) + ear([.006, .312], [.05, .288], [.046, .352], true);
    g += `<g filter="url(#hpFur)">`;
    g += part({ cu: -.05, cv: .25, a: .03, b: .027, ramp: GING, len: .012, radial: [-.008, .262], stripe: .6, sf: 260, sa: 1.2 });     // ruff left
    g += part({ cu: .034, cv: .25, a: .03, b: .027, ramp: GING, len: .012, radial: [-.008, .262], stripe: .6, sf: 260, sa: 1.9 });     // ruff right
    g += part({ cu: -.008, cv: .27, a: .06, b: .053, ramp: GING, len: .008, radial: [-.008, .245], stripe: .7, sf: 260, sa: 0,
      white: cheekWhite });                                                                                                              // head
    g += part({ cu: -.008, cv: .244, a: .029, b: .02, ramp: WHITE, len: .006, radial: [-.008, .25], white: true });                   // muzzle
    g += part({ cu: -.008, cv: .229, a: .017, b: .011, ramp: WHITE, len: .005, flow: -1.57, white: true });                           // chin
    g += `</g>`;
    // the tabby "M" on the forehead and lines running back from the eyes
    { const st = NIGHT ? mix(T("#4a1c08"), "#4a1c08", .4) : "#7a300c", sw = Math.max(1.4, M(.004));
      g += `<path d="M${F(X(-.036))},${F(Y(.297))} L${F(X(-.026))},${F(Y(.31))} L${F(X(-.008))},${F(Y(.296))} L${F(X(.01))},${F(Y(.31))} L${F(X(.02))},${F(Y(.297))}" stroke="${st}" stroke-width="${F(sw)}" fill="none" stroke-linejoin="round" opacity=".75"/>`;
      g += `<path d="M${F(X(-.008))},${F(Y(.296))} L${F(X(-.008))},${F(Y(.318))}" stroke="${st}" stroke-width="${F(sw)}" opacity=".6"/>`;
      [[-.044, .272, -.068, .278], [-.046, .262, -.07, .262], [.03, .272, .052, .278], [.032, .262, .054, .262]].forEach(([a, b, c, d]) =>
        g += `<path d="M${F(X(a))},${F(Y(b))} Q${F(X((a + c) / 2))},${F(Y((b + d) / 2 + .003))} ${F(X(c))},${F(Y(d))}" stroke="${st}" stroke-width="${F(sw * .9)}" fill="none" stroke-linecap="round" opacity=".6"/>`); }
    // eyes: almond, amber-green, slit pupils by day, wide with eyeshine at night
    [[-.03, .275], [.014, .275]].forEach(([u, v], i) => { const ex = X(u), ey = Y(v), ew = M(.0118), eh = M(.0078);
      const almond = `M${F(ex - ew)},${F(ey + eh * .15)} Q${F(ex - ew * .2)},${F(ey - eh * 1.25)} ${F(ex + ew)},${F(ey - eh * .25)} Q${F(ex + ew * .1)},${F(ey + eh * 1.25)} ${F(ex - ew)},${F(ey + eh * .15)}Z`;
      g += `<path d="${almond}" fill="#1a120a" transform="translate(0,1)"/>`;
      g += `<path d="${almond}" fill="url(#${NIGHT ? "hpShine" : "hpIris"})"/>`;
      if (NIGHT) g += `<ellipse cx="${F(ex + ew * .05)}" cy="${F(ey)}" rx="${F(ew * .58)}" ry="${F(eh * .82)}" fill="#0a0806" opacity=".55"/>`;
      else g += `<ellipse cx="${F(ex + ew * .05)}" cy="${F(ey - eh * .05)}" rx="${F(ew * .13)}" ry="${F(eh * .92)}" fill="#0a0806"/>`;
      g += `<path d="M${F(ex - ew)},${F(ey + eh * .15)} Q${F(ex - ew * .2)},${F(ey - eh * 1.25)} ${F(ex + ew)},${F(ey - eh * .25)}" stroke="#1a0e06" stroke-width="${F(Math.max(1.4, M(.0025)))}" fill="none"/>`;
      g += `<circle cx="${F(ex - ew * .32)}" cy="${F(ey - eh * .38)}" r="${F(ew * .17)}" fill="#ffffff" opacity=".95"/><circle cx="${F(ex + ew * .4)}" cy="${F(ey + eh * .35)}" r="${F(ew * .07)}" fill="#ffffff" opacity=".6"/>`;
      if (NIGHT) g += `<circle cx="${F(ex)}" cy="${F(ey)}" r="${F(ew * 2.2)}" fill="url(#hpGlow)" opacity=".18"/>`; });
    // nose, mouth, whiskers
    { const nx = X(-.008), ny = Y(.255), nw = M(.0075);
      g += `<path d="M${F(nx - nw)},${F(ny - nw * .5)} Q${F(nx)},${F(ny - nw * .85)} ${F(nx + nw)},${F(ny - nw * .5)} Q${F(nx + nw * .3)},${F(ny + nw * .45)} ${F(nx)},${F(ny + nw * .7)} Q${F(nx - nw * .3)},${F(ny + nw * .45)} ${F(nx - nw)},${F(ny - nw * .5)}Z" fill="${NIGHT ? mix(T("#d07070"), "#d07070", .35) : "#d27a72"}"/>`;
      g += `<ellipse cx="${F(nx - nw * .3)}" cy="${F(ny - nw * .35)}" rx="${F(nw * .3)}" ry="${F(nw * .15)}" fill="#ffffff" opacity=".5"/>`;
      g += `<path d="M${F(nx)},${F(ny + nw * .7)} l0,${F(M(.006))} M${F(nx)},${F(ny + nw * .7 + M(.006))} q${F(-M(.006))},${F(M(.006))} ${F(-M(.012))},${F(M(.001))} M${F(nx)},${F(ny + nw * .7 + M(.006))} q${F(M(.006))},${F(M(.006))} ${F(M(.012))},${F(M(.001))}" stroke="#5a3a30" stroke-width="${F(Math.max(.9, M(.0016)))}" fill="none" stroke-linecap="round"/>`;
      for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 5; i++) { const a = (side < 0 ? Math.PI : 0) + side * (i - 2) * -.1 + (side < 0 ? .05 : -.05), L = M(.06 + rf() * .025);
        const ox = nx + side * M(.014), oy = ny + M(.008) + i * M(.002);
        g += `<path d="M${F(ox)},${F(oy)} q${F(Math.cos(a) * L * .5)},${F(-Math.sin(a) * L * .5 - 3)} ${F(Math.cos(a) * L)},${F(-Math.sin(a) * L + 3)}" stroke="${NIGHT ? "#e8e0d8" : "#fffaf0"}" stroke-width="1" fill="none" opacity=".75"/>`;
        g += `<circle cx="${F(ox - side * M(.002))}" cy="${F(oy)}" r="${F(M(.0012))}" fill="#7a4a2a" opacity=".5"/>`; } }
    return g; };
  { const [cbx, cby] = w.proj([-.05, RT, 1.5]); s += cat(cbx, cby, FL / 1.5); }
  // warm light from the lantern falling over the rail at night
  if (NIGHT) s += `<ellipse cx="${F(pstX - 260)}" cy="${F(pstY + 80)}" rx="620" ry="180" fill="url(#hpGlow)" opacity=".14"/>`;

  /* ---------------- finish ---------------- */
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#hpLight)" style="mix-blend-mode:soft-light" opacity=".8"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#hpPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
