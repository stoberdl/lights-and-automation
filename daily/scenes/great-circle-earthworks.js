/* Great Circle Earthworks: the Hopewell ceremonial circle at Heath, Ohio, in
   mid-October. Standing on the mown lawn inside the 1,200-ft ring, the grassy
   embankment sweeps in from the left foreground and curves away to the right,
   with its inner ditch at its foot (holding rainwater after the weekend storms).
   Old oaks, maples and sycamores in full colour stand along the wall, the
   gateway opens between its two tallest stretches, and the Licking valley's
   wooded hills show faintly above the trees. Afternoon sun from the upper right,
   fair-weather clouds, geese heading south.
   opts.time === "night": moonless (two days after new moon), stars, the Milky
   Way, mist in the ditch, a faint town glow along the horizon.
   The land is two world3d() rasters (reference/scene-helpers.js): the ring in
   metres around the camera, and the far hills; the trees are sprites placed by
   the same camera. Same shape as reference/autumn-valley.js. Needs rng(),
   mix(), world3d(), noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function greatCircleEarthworksArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 5821;
  const r = rng(seed), rs = rng(seed + 5), rt = rng(seed + 17);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 2760, LY = 170, WY = 420;
  const T = c => NIGHT ? mix(mix(c, "#6e7488", .42), "#0a0e2a", .64) : c;
  const HZ = NIGHT ? "#28304e" : "#dfe2d8", RIM = NIGHT ? "#a8b4e0" : "#fff0c8", SHADE = NIGHT ? "#04060e" : "#2e3446";
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

  /* ---------------- sky: clear October blue, or a moonless night with the Milky Way ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#03051a"/><stop offset=".5" stop-color="#0a1032"/><stop offset=".85" stop-color="#1c2448"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#3f6fae"/><stop offset=".45" stop-color="#78a2cc"/><stop offset=".8" stop-color="#bcd0de"/><stop offset="1" stop-color="#e8e6d8"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#d89a5a" stop-opacity=".0"/><stop offset="1" stop-color="#d89a5a" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d6" stop-opacity=".95"/><stop offset=".18" stop-color="#ffe2a6" stop-opacity=".5"/><stop offset=".55" stop-color="#ffd290" stop-opacity=".14"/><stop offset="1" stop-color="#ffd290" stop-opacity="0"/>`;
  let s = `<defs id="gcdefs">
    <linearGradient id="gcSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="gcLight" cx="${LX}" cy="${LY}" r="1700" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="gcHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".8"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="gcWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#2a3256"/><stop offset=".3" stop-color="#121a3a"/><stop offset="1" stop-color="#060a1e"/>`
      : `<stop offset="0" stop-color="#8a8c5e"/><stop offset=".22" stop-color="#7c8862"/><stop offset=".5" stop-color="#8aa2b2"/><stop offset="1" stop-color="#6e96b8"/>`}</linearGradient>
    <radialGradient id="gcTown" cx="0.5" cy="1" r=".9"><stop offset="0" stop-color="#e0a060" stop-opacity=".6"/><stop offset="1" stop-color="#e0a060" stop-opacity="0"/></radialGradient>
    <filter id="gcLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="gcCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".014" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="gcRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2" seed="15" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".8"/></filter>
    <filter id="gcPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="gcSoft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="gcMist"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#gcSky)"/>`;
  if (NIGHT) {
    // the Milky Way rising out of the south-west across the middle of the sky, kept soft
    s += `<g filter="url(#gcSoft)" opacity=".38">`;
    for (let i = 0; i < 70; i++) { const t = rs(), x = 400 + t * 1300 + (rs() - .5) * 150, y = WY - t * 470 - Math.sin(t * Math.PI) * 60 + (rs() - .5) * 90;   // patchy star clouds, not a beam
      s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(40 + rs() * 90)}" ry="${F(25 + rs() * 50)}" fill="${rs() < .5 ? "#6a74a8" : "#8a92c4"}" opacity="${F(.2 + rs() * .3)}"/>`; }
    s += `</g>`;
    s += `<path d="M600,320 C800,240 1020,150 1300,60" stroke="#0a1030" stroke-width="22" fill="none" opacity=".3" filter="url(#gcSoft)"/>`;
    for (let i = 0; i < 900; i++) { const x = rs() * W, y = Math.pow(rs(), 1.2) * 400, big = rs() < .06;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.8 : F(.5 + rs() * .7)}" fill="${rs() < .18 ? "#ffe6c4" : "#e6ecff"}" opacity="${F(.25 + rs() * .6 * (1 - y / 450))}"/>`; }
    for (let i = 0; i < 500; i++) { const t = rs(), x = 400 + t * 1300 + (rs() - .5) * 160, y = WY - t * 450 + (rs() - .5) * 140 - Math.sin(t * Math.PI) * 60;   // denser stars along the band
      if (y < 0) continue; s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(.4 + rs() * .6)}" fill="#eef0ff" opacity="${F(.2 + rs() * .5)}"/>`; }
    // town glow (Heath and Newark) low behind the trees on the right
    s += `<ellipse cx="2050" cy="${WY}" rx="700" ry="90" fill="url(#gcTown)"/><ellipse cx="560" cy="${WY}" rx="400" ry="50" fill="url(#gcTown)" opacity=".6"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#gcLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#gcSoft)">`;
    for (let k = 0; k < 6; k++) { const a = Math.PI - .5 + k * .08, L = 2100;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: fair-weather cumulus lit from the right; geese heading south ---------------- */
  const cumulus = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#gcCloudy)">`;
    const n = 6 + Math.floor(rs() * 4), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.12 + rs() * .1) * (1 - Math.abs(t - .5) * .9);
      lobes.push([x + (t - .5) * w, y - R * (.4 + rs() * .5), R]); }
    if (NIGHT) {
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#141a38"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .7)}" fill="#1a2044"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly - R * .2)}" rx="${F(R * .6)}" ry="${F(R * .35)}" fill="#2a3260" opacity=".6"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .56)}" ry="${F(w * .06)}" fill="#aab4c6"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .15)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.05)}" ry="${F(R * .78)}" fill="#c4cad6"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .05)}" cy="${F(ly)}" rx="${F(R * .95)}" ry="${F(R * .72)}" fill="#eceef2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .35)}" cy="${F(ly - R * .25)}" rx="${F(R * .5)}" ry="${F(R * .38)}" fill="#fffaf0"/>`);
    }
    return c + `</g></g>`;
  };
  s += cumulus(420, 150, 300, "drift1") + cumulus(1080, 95, 380, "drift2") + cumulus(1640, 190, 260, "drift3") + cumulus(2150, 110, 340, "drift1") + cumulus(760, 300, 180, "drift2") + cumulus(2440, 300, 200, "drift3");
  if (!NIGHT) {   // a V of Canada geese heading south-west
    s += `<g class="birds" fill="none" stroke="#2a2a30" stroke-width="2.2" stroke-linecap="round" opacity=".8">`;
    const gx = 1180, gy = 175;
    for (let i = 0; i < 13; i++) { const arm = i % 2 ? 1 : -1, k = Math.ceil(i / 2), x = gx + k * 26, y = gy + arm * k * 13 + (rt() - .5) * 4, sz = .9 - k * .02;
      s += `<path d="M${F(x - 9 * sz)},${F(y - 1)} q${F(4.5 * sz)},${F(-5 * sz)} ${F(9 * sz)},${F(1)} q${F(4 * sz)},${F(-5 * sz)} ${F(9 * sz)},${F(-1)}"/>`; }
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 1.7 m above the lawn (lawn at y = G0, the ditch water at y = 0); metres, x right, y up, z away.
     The ring's centre is ahead and to the right, so the wall passes close on the left and curves away. */
  const G0 = 1.4, EYE = G0 + 1.7, FL = 2100;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: [.78, .45, -.25], tone: T, fog: HZ, fogK: .0005,
    shadow: SHADE, rim: RIM, shade: .5, hi: .3, night: NIGHT, lamp: "#ffc868" });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const RHO = 156, BETA = 100 * Math.PI / 180, CX = RHO * Math.sin(BETA), CZ = RHO * Math.cos(BETA);   // camera on the ditch's inner lip, looking along it
  const RC = 181, RD = 166, WH = 3.3;                                                            // wall crest radius, ditch radius, wall height
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const ringPt = (a, rad = RC) => [CX + Math.sin(a) * rad, CZ + Math.cos(a) * rad];
  // the gateway: the ring point that lands near screen x 1330
  let GA = 0, best = 1e9;
  for (let a = -Math.PI; a < Math.PI; a += .002) { const [x, z] = ringPt(a); if (z < 20) continue; const d = Math.abs(sx(x, z) - 1330); if (d < best) { best = d; GA = a; } }
  const angD = (x, z) => { let d = Math.atan2(x - CX, z - CZ) - GA; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  const capY = px => 266 - 60 * Math.exp(-(((px - 1200) / 260) ** 2));   // highest screen y a crown may reach: calm text corners, taller in the middle
  const MF = mountainField({ seed: 4471, scale: 2600, oct: 5, peaks: [
    { x: -3000, z: 5200, h: 95, rx: 2600, rz: 1600 }, { x: 1800, z: 6400, h: 120, r: 2400 }, { x: 5200, z: 4600, h: 80, r: 2000 }, { x: -800, z: 9000, h: 150, r: 3400 } ] });

  const ring = (x, z) => {                      // height of the lawn, ditch and wall
    const rho = Math.hypot(x - CX, z - CZ), arc = Math.abs(angD(x, z)) * RC;
    const gate = sm((arc - 6) / 5), cause = sm((arc - 9) / 5);                                    // gap in the wall, causeway over the ditch
    const tall = WH + 2.6 * Math.exp(-((arc / 34) ** 2)) + .5 * N2(arc / 60, 3.1);                // the wall rises toward the gateway
    const tw = (rho - RC) / (12 + .9 * tall), wall = Math.abs(tw) < 1 ? tall * Math.pow(1 - tw * tw, 1.4) : 0;
    const dd = Math.abs(rho - RD), ditch = (G0 + .2) * sm((8.5 - dd) / 4.5) * cause;
    return G0 + .22 * N1(x / 45, z / 45) + .08 * N3(x / 7, z / 7) + wall * gate - ditch; };
  const hNear = (x, z) => ring(x, z);
  const hFar = (x, z) => { const m = MF(x, z) * sm((z - 1800) / 2500); return Math.max(G0, m); };

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const LAWN = H3("#7e9a46"), LAWN2 = H3("#96a852"), WALLG = H3("#a2a454"), WALLG2 = H3("#b8a85e"), MUD = H3("#6a5e48"), REED = H3("#8a8240");
  const LITTER = ["#c26a28", "#d89a36", "#a2441e", "#8a6a2e"].map(H3);
  const FOR = ["#3e4a28", "#5a5226", "#b0622a", "#94321e", "#c8962e", "#7a4220"].map(H3);
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const colNear = (x, y, z, n) => {
    const rho = Math.hypot(x - CX, z - CZ), steep = 1 - n[1];
    if (y < .25) return L3(MUD, REED, .5 + .6 * N3(x / 1.5, z / 1.5));
    let c;
    if (rho > RD + 7 && y > G0 + .3) c = L3(WALLG, WALLG2, .5 + .7 * N2(x / 9, z / 9));                      // longer grass on the wall
    else if (Math.abs(rho - RD) < 9) c = L3(H3("#6e8a40"), REED, .3 + .5 * N2(x / 4, z / 4));                // ditch sides
    else c = L3(LAWN, LAWN2, (Math.sin(rho / 2.2) > 0 ? .75 : .25) + .25 * N2(x / 20, z / 20));                // mowing stripes following the ring
    const lit = rho > RC - 14 ? sm((N1(x / 14 + 9, z / 14) + .1) / .5) * (rho > RC + 14 ? .9 : .55) : sm((N1(x / 9 + 2, z / 9) - .45) / .3) * .5;   // fallen leaves
    const pa = Math.abs(angD(x, z)) * RC;                                                        // the worn path in through the gateway, over the causeway
    if (pa < 2.4 && rho > RD - 60 && rho < RC + 25) c = L3(H3("#b4a47a"), H3("#9a8a62"), .4 + .5 * N3(x / 1.2, z / 1.2) + sm((pa - 1.6) / .8) * .5);
    if (lit > 0) { const q = N3(x / 5 + 3, z / 5) * .5 + .5; c = L3(c, L3(LITTER[0], LITTER[q > .5 ? 1 : 3], Math.abs(q - .5) * 2), lit); }
    return c.map(v => v * (.92 + .16 * N3(x / 2.2, z / 2.2))); };
  const colFar = (x, y, z) => { const k = N1(x / 300, z / 300) * .5 + .5;
    let c = L3(FOR[0], FOR[1], k); c = L3(c, FOR[2 + Math.floor(hash(Math.floor(x / 120), Math.floor(z / 120)) * 4)], sm((N3(x / 400, z / 400) + .2) / .4) * .8);
    return c.map(v => v * (.8 + .4 * (N2(x / 40, z / 40) * .5 + .5))); };
  const far = w.raster({ z0: 1500, z1: 26000, step: .0016, minStep: 2, scale: .6, top: 220, bottom: WY + 6, h: hFar, col: colFar, tone: rgbTone(T), fog: HZ, fogK: .00022, amb: NIGHT ? .6 : .5, noRefl: true, key: 1e7 });
  const near = w.raster({ z0: 4, z1: 700, step: .0011, minStep: .12, scale: .75, top: 220, bottom: H, h: hNear, col: colNear, tone: rgbTone(T), fog: HZ, fogK: .00022, amb: NIGHT ? .55 : .42, noRefl: true, key: 5e6 });

  /* ---------- trees: 2D drawings placed as sprites ---------- */
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const GOLD = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const OAK = ["#22281a", "#2e361c", "#3e4620", "#525a26", "#68702e", "#80843a", "#9c9c52", "#bab874"];
  const SYC = ["#3a3418", "#544a1e", "#6e6226", "#8a7a30", "#a4903a", "#bca44a", "#d0ba66", "#e4d290"];
  const broadleaf = (x, y, hp, RAMP, fog, n, bark) => {     // trunk, limbs and a crown of many lit leaf clumps
    const sd = LX < x ? -1 : 1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .032), ty = y - hp * .3;
    g += `<ellipse cx="${F(x - hp * .3)}" cy="${F(y + 1)}" rx="${F(hp * .42)}" ry="${F(Math.max(1, hp * .035))}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .5)},${F(ty)} L${F(x + tb * .5)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf(bark || "#5a4c40")}"/>`;
    g += `<path d="M${F(x - sd * tb * .1)},${F(y)} L${F(x - sd * tb * .1)},${F(ty)} L${F(x - sd * tb * .5)},${F(ty)} L${F(x - sd * tb)},${F(y)}Z" fill="${Tf("#30261e")}"/>`;
    for (let k = 0; k < 5; k++) { const a = -1.3 + k * .65 + (r() - .5) * .3; g += `<path d="M${F(x)},${F(ty + hp * .06)} q${F(Math.sin(a) * hp * .08)},${F(-hp * .08)} ${F(Math.sin(a) * hp * .14)},${F(-Math.cos(a) * hp * .2)}" stroke="${Tf(bark || "#4a3c30")}" stroke-width="${F(Math.max(.8, tb * .5))}" fill="none"/>`; }
    const cx = x, cy = y - hp * .58, rx = hp * .42, ry = hp * .38, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.024 + r() * .024)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx - sd * a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#gcLeafy)">${cg}</g>`; };
  /* a smaller or far tree: a dark irregular mass with shaded, mid and lit clumps */
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1a140c", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(48, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) + (y - sz * .5 - py) * .6, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    if (sz > 14) g += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - sz * .2)}" stroke="${mix(c, "#000000", .55)}" stroke-width="${F(Math.max(1, sz * .05))}"/>`;
    return g; };
  const pickRamp = q => q < .26 ? MAPLE : q < .5 ? GOLD : q < .68 ? RUST : q < .86 ? OAK : SYC;
  const treeFn = (hM, RAMP) => (px, py, kk, fog) => { const hp = hM * kk;
    return hp > 60 ? broadleaf(px, py, hp, RAMP, fog, Math.min(240, Math.round(hp * .6)), undefined)
      : hp > 26 ? `<g filter="url(#gcLeafy)">${clump(px, py, hp, fog * .9, RAMP)}</g>` : clump(px, py, Math.max(2.5, hp), fog * .9, RAMP); };
  /* how tall may a tree at (x, z) standing on y0 be before its crown reaches the calm band? */
  const room = (x, z, y0) => (sy(y0, z) - capY(sx(x, z))) * z / FL;
  /* is the ground at (x, z) seen, or hidden behind nearer land? */
  const seen = (x, z, y) => { const y0 = sy(y, z) - 1.5;
    for (let q = 4; q < z * .985; q += Math.max(.3, q * .01)) { const xq = x * q / z; if (sy(ring(xq, q), q) < y0) return false; }
    return true; };

  const crest = [], outer = [];
  // along the wall: old trees on the crest and outer slope, in clusters, never on the gateway or the near stretch
  for (let a = -Math.PI; a < Math.PI; a += .0035) {
    const [x0, z0] = ringPt(a); if (z0 < 8) continue; const u = sx(x0, z0); if (u < -300 || u > W + 300) continue;
    const arcG = Math.abs(angD(x0, z0)) * RC; if (arcG < 11) continue;
    if (N2(a * RC / 26, 7.7) < -.35) continue;
    if (r() > .55) continue;
    const rad = RC - 3 + r() * 12, [x, z] = ringPt(a, rad), y0 = ring(x, z);
    const hM = 8 + r() * 6, rm = room(x, z, y0);
    if (rm < hM * .75) continue;
    crest.push([x, z, y0 - .3, Math.min(hM, rm), pickRamp(r())]); }
  // the wood beyond the wall: its crowns show over the crest
  for (let k = 0, n = 0; k < 60000 && n < 2200; k++) {
    const a = (r() - .5) * 2 * Math.PI, rad = RC + 16 + Math.pow(r(), .6) * 700, [x, z] = ringPt(a, rad);
    if (z < 30 || z > 1100) continue; const u = sx(x, z); if (u < -100 || u > W + 100) continue;
    const y0 = G0 + .2 * N1(x / 45, z / 45), hM = 13 + r() * 13, rm = room(x, z, y0);
    if (rm < hM * .85) continue;                      // a tree too tall for the calm band is left out, not shrunk
    if (!seen(x, z, y0 + Math.min(hM, rm) * .75)) continue;   // wholly behind the wall
    n++; outer.push([x, z, y0 - .3, Math.min(hM, rm), pickRamp(r())]); }

  const toWorld = arr => arr.forEach(([x, z, y, hM, RAMP]) => w.sprite({ x, z, y, fn: treeFn(hM, RAMP) }));
  // the wood is split from the rest so it can be drawn behind the wall's raster
  outer.forEach(([x, z, y, hM, RAMP]) => w.sprite({ x, z, y, tag: "out", fn: treeFn(hM, RAMP) }));
  toWorld(crest);

  /* ---------------- assemble: water in the ditch, the far hills, the wood, the ring, the wall's trees ---------------- */
  const isFar = o => o === far, isOut = o => o.tag === "out", isNear = o => o === near, rest = o => !o.raster && o.tag !== "out";
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#gcWater)"/>`;
  for (let k = 0; k < 90; k++) { const y = WY + 20 + Math.pow(r(), .8) * (H - WY - 20), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(20 + r() * 90 * (.4 + t))}" height="${F(1 + t)}" rx="1" fill="${NIGHT ? "#6a74a8" : "#f4f6f0"}" opacity="${F(.08 + r() * .12)}"/>`; }
  s += w.draw({ where: isFar });
  s += `<rect x="0" y="${WY - 70}" width="${W}" height="90" fill="url(#gcHaze)" opacity=".45"/>`;
  s += w.draw({ where: isOut });
  s += w.draw({ where: isNear });
  // floating leaves on the ditch water and scattered on the lawn near the camera
  for (let k = 0; k < 260; k++) { const z = 6 + Math.pow(r(), .8) * 60, x = (r() - .5) * z * 1.3, y0 = ring(x, z);
    if (!seen(x, z, y0)) continue; const px = sx(x, z), py = sy(y0, z), R = Math.max(1, FL * (.05 + r() * .06) / z);
    s += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(R)}" ry="${F(R * .35)}" fill="${T(["#c85a22", "#d89a30", "#a83a1e", "#e0b040", "#8a5a2a"][Math.floor(r() * 5)])}" opacity=".85" transform="rotate(${F((r() - .5) * 40)} ${F(px)} ${F(py)})"/>`; }
  // grass: long tussocks on the wall, reeds and sedge at the water's edge, short mown blades on the lawn
  { let g = "";
    for (let k = 0, n = 0; k < 40000 && n < 11000; k++) {
      const z = 6 + Math.pow(r(), 1.6) * 150, x = (r() - .5) * 1.32 * z, y0 = ring(x, z); if (y0 < .22) continue;
      const rho = Math.hypot(x - CX, z - CZ), kind = y0 < .7 && Math.abs(rho - RD) < 7 ? 2 : rho > RD + 6 ? 1 : 0;
      if (Math.abs(angD(x, z)) * RC < 2.4 && kind !== 2) continue;                       // keep the path clear
      const len = kind === 2 ? .3 + r() * .35 : kind === 1 ? .09 + r() * .1 : .05, px = sx(x, z), py = sy(y0, z), L = FL * len / z;
      if (L < 1.6 || !seen(x, z, y0)) continue; n++;
      const C = kind === 2 ? ["#6e7a34", "#8a8a3e", "#a29a52", "#5a6a2e"] : kind === 1 ? ["#a8a456", "#c0b064", "#8e9a48", "#d0bc72"] : ["#8aa44c", "#6e8a3e"];
      for (let b = 0; b < (kind === 2 ? 4 : 3); b++) { const bend = (r() - .5) * L * .7, lit = bend > 0;
        g += `<path d="M${F(px + (r() - .5) * L * .6)},${F(py)} q${F(bend * .3)},${F(-L * .55)} ${F(bend)},${F(-L)}" stroke="${T(mix(C[Math.floor(r() * C.length)], lit ? RIM : SHADE, lit ? .2 : .15))}" stroke-width="${F(Math.max(.7, L * .07))}" fill="none" stroke-linecap="round"/>`; }
      if (kind === 2 && r() < .12) g += `<rect x="${F(px - L * .03)}" y="${F(py - L * 1.05)}" width="${F(Math.max(1.2, L * .07))}" height="${F(Math.max(2.5, L * .25))}" rx="${F(L * .03)}" fill="${T("#5a3a22")}"/>`; }
    s += g; }
  s += w.draw({ where: rest });
  if (NIGHT) {   // mist lying in the ditch
    s += `<g filter="url(#gcMist)" opacity=".4">`;
    for (let a = -Math.PI; a < Math.PI; a += .03) { const [x, z] = ringPt(a, RD); if (z < 22) continue; const px = sx(x, z), py = sy(.2, z); if (px < -200 || px > W + 200) continue;
      const rx = Math.max(10, FL * 3 / z); s += `<ellipse cx="${F(px)}" cy="${F(py - FL * .25 / z)}" rx="${F(rx)}" ry="${F(Math.max(2, FL * .3 / z))}" fill="#7a84b0" opacity="${F(.15 + r() * .2)}"/>`; }
    s += `</g>`;
  }
  // tall grass and asters at the bottom corners, under the cards
  const tuft = (x0, x1) => { let g = "";
    for (let i = 0; i < 90; i++) { const x = x0 + r() * (x1 - x0), y = 700 + r() * 30, hh = 50 + r() * 90, bend = (r() - .5) * 36;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#8a8a3a" : "#b0a052")}" stroke-width="${F(1.6 + r() * 2)}" fill="none" stroke-linecap="round"/>`;
      if (r() < .18) g += `<circle cx="${F(x + bend)}" cy="${F(y - hh)}" r="${F(3 + r() * 2)}" fill="${T(r() < .6 ? "#9a8ac8" : "#f0e6c0")}"/>`; }
    return g; };
  s += tuft(0, 300) + tuft(2280, 2560);

  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#gcLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#gcPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
