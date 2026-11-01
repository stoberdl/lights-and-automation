/* Guggenheim, Fifth Avenue: Frank Lloyd Wright's Solomon R. Guggenheim Museum,
   which opened on October 21, 1959, seen from a schist rise just inside
   Central Park on a clear late-October afternoon. Across Fifth Avenue the white
   spiral rotunda widens upward band by band, with the dark ribbon of glass
   between the bands, the long "bridge" carrying the bronze lettering, the
   smaller Monitor rotunda to the left and the 1992 limestone-grid tower rising
   behind it. Limestone mansions and brick apartment houses stand either side,
   88th and 89th Streets run away between them toward Madison Avenue, wooden
   water tanks sit on the roofs behind. In front: the low park wall, golden
   American elms inside it, yellow cabs and an M4 bus on the avenue, park lamps,
   benches and a lawn full of fallen leaves. Sun behind the viewer, to the right.
   opts.time === "night": a waxing gibbous moon over the south side of the
   street, city sky glow, the rotunda floodlit with its glass bands glowing
   warm, lit windows, street lamps, headlights and tail lights.
   Built with world3d() (reference/scene-helpers.js): the buildings, cars,
   lamps and trees are placed in metres and seen by one eye-level camera.
   Needs rng(), mix(), world3d() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                    */
function guggenheimFifthAvenueArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1021;
  const r = rng(seed), rs = rng(seed + 5), rt = rng(seed + 17), rb = rng(seed + 41), rl = rng(seed + 53), rc = rng(seed + 71);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const WY = 420, EYE = 6, FL = 1700;
  const LX = NIGHT ? 1430 : 2950, LY = NIGHT ? 96 : -280;
  const MOON = [1420, 62, 19];
  const T = c => NIGHT ? mix(mix(c, "#6a7092", .42), "#0a0e2a", .58) : c;
  const TM = c => NIGHT ? mix(mix(c, "#c4cce6", .22), "#141a3a", .24) : c;
  const HZ = NIGHT ? "#2c3052" : "#dfe5ea", RIM = NIGHT ? "#aab6de" : "#fff3d4", SHADE = NIGHT ? "#04060e" : "#323a4e", LAMP = "#ffc870";
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
  const pathP = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join("L") + "Z";

  /* ---------------- sky: deep October blue to the east, or a city night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040720"/><stop offset=".5" stop-color="#0d1438"/><stop offset=".84" stop-color="#262a50"/><stop offset="1" stop-color="#4c3e5a"/>`
    : `<stop offset="0" stop-color="#2a66b2"/><stop offset=".45" stop-color="#5b93cc"/><stop offset=".82" stop-color="#a8c6de"/><stop offset="1" stop-color="#dde6ea"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e0a070" stop-opacity=".3"/><stop offset=".45" stop-color="#b8806a" stop-opacity=".09"/><stop offset="1" stop-color="#b8806a" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fffbe8" stop-opacity=".55"/><stop offset=".2" stop-color="#fff0c0" stop-opacity=".28"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/>`;
  let s = `<defs id="ggdefs">
    <linearGradient id="ggSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="ggLight" cx="${NIGHT ? 1280 : LX}" cy="${NIGHT ? WY + 60 : LY}" r="${NIGHT ? 1200 : 2100}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="ggHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".85"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="ggGlow"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".4"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="ggWarm"><stop offset="0" stop-color="#ffbe6a" stop-opacity=".6"/><stop offset=".5" stop-color="#ff9e48" stop-opacity=".2"/><stop offset="1" stop-color="#ff9e48" stop-opacity="0"/></radialGradient>
    <radialGradient id="ggRed"><stop offset="0" stop-color="#ff4a3a" stop-opacity=".8"/><stop offset=".4" stop-color="#ff2a1a" stop-opacity=".25"/><stop offset="1" stop-color="#ff2a1a" stop-opacity="0"/></radialGradient>
    <radialGradient id="ggFlood"><stop offset="0" stop-color="#dfe6ff" stop-opacity=".34"/><stop offset=".6" stop-color="#b8c4f0" stop-opacity=".1"/><stop offset="1" stop-color="#b8c4f0" stop-opacity="0"/></radialGradient>
    <radialGradient id="ggMoon"><stop offset="0" stop-color="#f4f0dc" stop-opacity=".5"/><stop offset=".25" stop-color="#d8dcf0" stop-opacity=".14"/><stop offset="1" stop-color="#d8dcf0" stop-opacity="0"/></radialGradient>
    <filter id="ggLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ggCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".013" numOctaves="3" seed="31" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="36" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="ggPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="21"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="ggSoft"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#ggSky)"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#ggLight)"/>`;
  if (NIGHT) {
    // city stars: few and dim, fading into the glow over the avenue
    for (let i = 0; i < 260; i++) { const x = rs() * W, y = Math.pow(rs(), 1.4) * 380, big = rs() < .04;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.6 : F(.5 + rs() * .6)}" fill="${rs() < .2 ? "#ffe6c4" : "#e6ecff"}" opacity="${F((.18 + rs() * .45) * (1 - y / 420))}"/>`; }
    // a waxing gibbous moon over the south side of the street (lit on the right)
    const [mx, my, R] = MOON;
    s += `<circle cx="${mx}" cy="${my}" r="${R * 7}" fill="url(#ggMoon)"/><circle cx="${mx}" cy="${my}" r="${R}" fill="#2c3456" opacity=".55"/>`;
    s += `<path d="M${mx},${my - R} A${R},${R} 0 0 1 ${mx},${my + R} A${F(R * .62)},${R} 0 0 1 ${mx},${my - R}Z" fill="#f2eedc"/>`;
    [[5, -6, 4.5], [-3, 5, 3.5], [8, 7, 3], [-6, -4, 2.5]].forEach(([dx, dy, rr]) => s += `<circle cx="${mx + dx}" cy="${my + dy}" r="${rr}" fill="#9aa0b4" opacity=".28"/>`);
  } else {
    s += `<g class="rays" opacity=".05" filter="url(#ggSoft)">`;
    for (let k = 0; k < 6; k++) { const a = Math.PI - .18 - k * .07, L = 2600;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: fair-weather cumulus drifting in from New Jersey ---------------- */
  const cumulus = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#ggCloudy)">`;
    const n = 5 + Math.floor(rs() * 3), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.12 + rs() * .1) * (1 - Math.abs(t - .5) * .9);
      lobes.push([x + (t - .5) * w, y - R * (.35 + rs() * .5), R]); }
    if (NIGHT) {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .66)}" fill="#1c2246"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .1)}" cy="${F(ly + R * .3)}" rx="${F(R * .7)}" ry="${F(R * .28)}" fill="#5a4658" opacity=".45"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#b4c2d2"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .12)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.05)}" ry="${F(R * .72)}" fill="#c8d2de"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .06)}" cy="${F(ly)}" rx="${F(R * .95)}" ry="${F(R * .68)}" fill="#edf0f3"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .3)}" cy="${F(ly - R * .25)}" rx="${F(R * .5)}" ry="${F(R * .36)}" fill="#fffdf6"/>`);
    }
    return c + `</g></g>`;
  };
  s += `<g opacity="${NIGHT ? .7 : .9}">` + cumulus(380, 330, 190, "drift2") + cumulus(690, 205, 120, "drift3") + cumulus(1630, 345, 150, "drift3") +
    cumulus(2010, 300, 240, "drift2") + cumulus(2440, 200, 140, "drift3") + `</g>`;
  if (!NIGHT) {   // pigeons wheeling over the avenue, and a red-tail riding the updraft off the rooftops
    s += `<g class="birds" fill="none" stroke="#3a3c48" stroke-width="2" stroke-linecap="round" opacity=".75">`;
    [[1540, 300, .8], [1566, 290, .7], [1590, 306, .75], [1612, 296, .65], [1634, 312, .6], [1560, 318, .7], [1588, 326, .6]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 9 * k)},${F(y - 2)} q${F(4.5 * k)},${F(-5 * k)} ${F(9 * k)},${F(2)} q${F(4.5 * k)},${F(-5 * k)} ${F(9 * k)},${F(-2)}"/>`);
    s += `</g><g class="birds">`;
    { const x = 1010, y = 78; s += `<path d="M${x - 26},${y + 2} q10,-9 22,-3 q4,-4 8,0 q12,-6 22,3 q-12,0 -20,4 q-3,5 -5,8 q-2,-3 -5,-8 q-10,-4 -22,-4z" fill="#4a3426"/><path d="M${x - 4},${y + 6} l4,6 l4,-6z" fill="#b8542a"/>`; }
    s += `</g>`;
  } else s += `<g class="birds"></g>`;
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 6 m up on a schist rise inside Central Park, looking due east across
     Fifth Avenue; metres, x right (south), y up, z away (east). The park wall is
     at z 96, the avenue z 103-121, the museum's frontage z 124-128, 88th Street
     at x 16-34 and 89th at x -61..-43.                                         */
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [.35, .6, .35] : [.5, .55, -.65], tone: T, fog: HZ, fogK: .0015,
    shadow: SHADE, rim: RIM, shade: NIGHT ? .38 : .5, hi: .26, night: NIGHT, lamp: LAMP });
  // the museum gets its own camera with the same geometry, so at night it can be floodlit (its own light and tone)
  const wm = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [.12, -.05, -1] : [.5, .55, -.65], tone: TM, fog: HZ, fogK: NIGHT ? .0008 : .0012,
    shadow: NIGHT ? "#3a4266" : "#5c6478", rim: NIGHT ? "#ffffff" : "#fffaf0", shade: NIGHT ? .5 : .34, hi: .3, night: NIGHT, lamp: LAMP });
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const pr = (x, z, y = 0) => [sx(x, z), sy(y, z)];
  const gC = (c, z) => T(mix(c, HZ, w.fogAt(z)));
  const poly = (pts, fill, op) => `<path d="${pathP(pts)}" fill="${fill}"${op ? ` opacity="${op}"` : ""}/>`;
  const strip = (z0, z1, fill, x0 = -400, x1 = 400) => poly([pr(x0, z1), pr(x1, z1), pr(x1, z0), pr(x0, z0)], fill);
  const gquad = (x0, z0, x1, z1, c, op) => poly([pr(x0, z0), pr(x1, z0), pr(x1, z1), pr(x0, z1)], c, op);
  // the text corners stay calm: nothing standing may reach above y 250 there (the middle may)
  const capY = px => 250 - 200 * sm((px - 860) / 140) * sm((1540 - px) / 140);
  const room = (x, z) => (sy(0, z) - capY(sx(x, z))) * z / FL;
  const roomSpan = (x0, x1, z) => Math.min(room(x0, z), room((x0 + x1) / 2, z), room(x1, z));

  /* ---------- the ground: far streets, the avenue, park sidewalk, the lawn ---------- */
  let G = `<rect x="0" y="${WY - 2}" width="${W}" height="${H - WY + 2}" fill="${gC("#bdb6aa", 300)}"/>`;
  G += strip(121.2, 128.5, gC("#cdc6b8", 124));
  [[16, 34], [-61, -43]].forEach(([a, b]) => {
    G += poly([pr(a, 121), pr(b, 121), pr(b, 700), pr(a, 700)], gC("#c6bfb2", 200));
    G += poly([pr(a + 2.4, 121), pr(b - 2.4, 121), pr(b - 2.4, 700), pr(a + 2.4, 700)], gC("#5c5d63", 200));
    for (let z = 140; z < 700; z += 9 + z * .02) G += gquad((a + b) / 2 - .06, z, (a + b) / 2 + .06, z + 3, gC("#d8d4c8", z), .7); });
  G += strip(103, 121.2, gC("#56575d", 112));
  // asphalt wear and the lane dashes (Fifth runs one way, south: to the right)
  for (let i = 0; i < 260; i++) { const z = 103.5 + rl() * 17, x = (rl() - .5) * 2.6 * z, p = pr(x, z), k = FL / z;
    if (p[0] < -20 || p[0] > W + 20) continue;
    const rx = (.4 + rl() * 1.6) * k; G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(Math.max(.4, rx * EYE / z * 1.2))}" fill="${gC(rl() < .5 ? "#4a4b50" : "#6a6b70", z)}" opacity="${F(.3 + rl() * .3)}"/>`; }
  [106.8, 110.4, 114, 117.6].forEach(z => { for (let x = -300; x < 300; x += 9) G += gquad(x, z - .07, x + 3, z + .07, gC("#e8e6dc", z), .85); });
  G += gquad(-300, 119.4, 300, 119.52, gC("#e8e6dc", 119), .8);
  // crosswalks at 88th and 89th
  [[13, 16.2], [-46.2, -43]].forEach(([a, b]) => { for (let z = 103.6; z < 120.8; z += 1.2) G += gquad(a, z, b, z + .6, gC("#ecebe4", z), .9); });
  G += strip(121, 121.25, gC("#9a948a", 121)) + strip(103, 103.2, gC("#9a948a", 103));
  G += strip(96.6, 103, gC("#b2aca2", 100));
  for (let x = -300; x < 300; x += 1.6) G += gquad(x, 96.7, x + .05, 102.9, gC("#9a948a", 100), .5);
  // the lawn inside the wall, then the path coming up the rise
  G += strip(30, 96, gC("#6a8a3c", 60));
  for (let i = 0; i < 150; i++) { const z = 46 + rl() * 48, x = (rl() - .5) * 1.4 * z, p = pr(x, z), k = FL / z, rx = (1.2 + rl() * 3) * k;
    G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(rx * EYE / z * 1.3)}" fill="${gC(rl() < .5 ? "#557632" : "#86a04c", z)}" opacity=".4"/>`; }
  { const C = t => { const z = 44 + t * 52, x = -26 + 20 * sm(t) + Math.sin(t * 3.1) * 4; return [x, z]; }, L = [], R = [];
    for (let i = 0; i <= 30; i++) { const t = i / 30, [x, z] = C(t), [x2, z2] = C(Math.min(1, t + .01)), dx = x2 - x, dz = z2 - z, l = Math.hypot(dx, dz) || 1, nx = -dz / l * 2.1, nz = dx / l * 2.1;
      L.push(pr(x + nx, z + nz)); R.push(pr(x - nx, z - nz)); }
    G += poly(L.concat(R.reverse()), gC("#8a8884", 70)); }
  // fallen leaves on the lawn, thick under the elms, and blown along the gutters
  const LEAF = ["#c8461e", "#e07a26", "#d8a030", "#a8341a", "#e8b84a", "#c89a2a", "#8a4a20"];
  for (let i = 0; i < 2400; i++) { const q = rl(), z = q < .7 ? 44 + Math.pow(rl(), .6) * 52 : q < .85 ? 96.7 + rl() * 6.2 : 103.2 + Math.pow(rl(), 3) * 1.2;
    const x = (rl() - .5) * 1.5 * z, p = pr(x, z), k = FL / z; if (p[0] < -10 || p[0] > W + 10) continue;
    const rx = (.06 + rl() * .06) * k; G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(Math.max(.6, rx))}" ry="${F(Math.max(.4, rx * .4))}" fill="${gC(LEAF[Math.floor(rl() * LEAF.length)], z)}" opacity=".9"/>`; }
  for (let i = 0; i < 1600; i++) { const z = 44 + Math.pow(rl(), 1.2) * 50, x = (rl() - .5) * 1.5 * z, p = pr(x, z), k = FL / z;
    if (p[0] < -10 || p[0] > W + 10) continue;
    const L = (.05 + rl() * .07) * k, bend = (rl() - .5) * L * .7;
    G += `<path d="M${F(p[0])},${F(p[1])} q${F(bend * .3)},${F(-L * .5)} ${F(bend)},${F(-L)}" stroke="${gC(rl() < .5 ? "#5a7a32" : rl() < .5 ? "#8aa24c" : "#a4a85a", z)}" stroke-width="${F(Math.max(.8, L * .1))}" fill="none" stroke-linecap="round"/>`; }

  /* ---------- trees: many lit leaf clusters; elms are vase-shaped ---------- */
  const ELM = ["#4a3a0e", "#6a5414", "#8c7018", "#ad8c20", "#c8a62a", "#dcbc3c", "#ecd062", "#f8e69a"];
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const PLANE = ["#3e3218", "#5a4a20", "#76622a", "#927a34", "#ac9242", "#c4aa56", "#d8c274", "#eadaa0"];
  const GREEN = ["#1e2a14", "#2a3a18", "#3a4a1e", "#4c5c24", "#606e2c", "#76843a", "#8e9a4e", "#aab26a"];
  const pickRamp = q => q < .3 ? MAPLE : q < .55 ? PLANE : q < .75 ? RUST : q < .88 ? ELM : GREEN;
  const tree = (x, y, hp, RAMP, fog, n, rr, elm) => {
    const Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * (elm ? .034 : .03)), ty = y - hp * (elm ? .3 : .34);
    g += `<ellipse cx="${F(x - hp * .2)}" cy="${F(y + 1)}" rx="${F(hp * .34)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .55)},${F(ty)} L${F(x + tb * .55)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#4e4640")}"/>`;
    g += `<path d="M${F(x - tb * .1)},${F(y)} L${F(x - tb * .1)},${F(ty)} L${F(x - tb * .55)},${F(ty)} L${F(x - tb)},${F(y)}Z" fill="${Tf("#2a241e")}"/>`;
    const limbs = elm ? [[-1, .62, .34], [-.45, .7, .3], [.4, .7, .3], [1, .6, .34]] : [[-1, .5, .2], [1, .55, .2], [-.3, .7, .1]];
    limbs.forEach(([dx, h, sp]) => g += `<path d="M${F(x)},${F(ty + hp * .03)} Q${F(x + dx * hp * sp * .3)},${F(y - hp * h * .8)} ${F(x + dx * hp * sp)},${F(y - hp * h)}" stroke="${Tf("#3a322a")}" stroke-width="${F(tb * (elm ? .62 : .7))}" fill="none" stroke-linecap="round"/>`);
    const cx = x, cy = y - hp * (elm ? .7 : .6), rx = hp * (elm ? .5 : .4), ry = hp * (elm ? .28 : .37);
    const dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, cs = [];
    const nL = elm ? 5 + Math.floor(rr() * 2) : 3 + Math.floor(rr() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * (elm ? 2.9 : 2.6) + (rr() - .5) * .4;
      return elm ? [cx + Math.cos(a) * rx * .62, cy + Math.sin(a) * ry * .45 + ry * .2, rx * (.34 + rr() * .12), ry * (.55 + rr() * .2)]
        : [cx + Math.cos(a) * rx * (.45 + rr() * .2), cy + Math.sin(a) * ry * (.4 + rr() * .25) + ry * .15, rx * (.42 + rr() * .2), ry * (.42 + rr() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (rr() * 2 - 1) * rx * 1.2, py = cy + (rr() * 2 - 1) * ry * 1.25;
      const e = inL(px, py); if (e > 1 || (e > .6 && rr() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (rr() - .5) * .32), hp * (.014 + rr() * .016)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx - a * .08, ly + b * .12, a * .82, b * .78, 8, rr)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6, rr)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#ggLeafy)">${cg}</g>`; };
  const shrub = (x, y, wp, hp, RAMP, fog, rr) => { const Tf = c => T(mix(c, HZ, fog));
    let g = `<path d="${blobP(x, y - hp * .45, wp * .5, hp * .5, 9, rr)}" fill="${Tf(RAMP[1])}"/>`;
    const m = Math.max(4, Math.min(60, Math.round(wp * hp / 30)));
    for (let i = 0; i < m; i++) { const px = x + (rr() - .5) * wp * .9, py = y - hp * (.15 + rr() * .7), R = Math.max(1.5, hp * (.14 + rr() * .1)), v = cl(((px - x) / wp + (y - hp * .5 - py) / hp) * .7 + .45 + (rr() - .5) * .3);
      g += `<path d="${blobP(px, py, R, R * .8, 6, rr)}" fill="${Tf(RAMP[1 + Math.floor(v * 6)])}"/>`; }
    return `<g filter="url(#ggLeafy)">${g}</g>`; };
  const plantTree = (x, z, hMax, RAMP, elm, tag) => { const h = Math.min(hMax, roomSpan(x - hMax * (elm ? .55 : .45), x + hMax * (elm ? .55 : .45), z));
    if (h < 6) return; const rr = rng(seed + Math.round(x * 31 + z * 7));
    w.sprite({ x, z, y: 0, tag, fn: (px, py, k, fog) => tree(px, py, h * k, RAMP, fog, Math.min(480, Math.round(h * k * 1.3)), rr, elm) }); };

  /* ---------- the buildings across the avenue ---------- */
  const glassD = "#3a4652";
  const facadeDec = (Pf, len, h, o) => {
    const D = [], q = (u0, v0, u1, v1, c, e = {}) => { const of = e.off ?? .04; D.push({ P: [Pf(u0, v0, of), Pf(u1, v0, of), Pf(u1, v1, of), Pf(u0, v1, of)], c, glow: e.glow, op: e.op }); };
    const ln = (u0, v0, u1, v1, c, wd, e = {}) => { const of = e.off ?? .05; D.push({ P: [Pf(u0, v0, of), Pf(u1, v1, of)], c, ln: wd, min: e.min ?? .35, op: e.op, glow: e.glow }); };
    const trim = o.trim || "#e8e0cc", g = o.g || 4.4, st = o.st || 3.4, bay = o.bay || 3;
    for (let i = 0; i < 12; i++) { const u = rb() * len, v = rb() * h; q(u, v, Math.min(len, u + .6 + rb() * 2), Math.min(h, v + .4 + rb() * 1.6), rb() < .5 ? mix(o.wall, "#000000", .08) : mix(o.wall, "#ffffff", .07), { op: .6, off: .01 }); }
    if (o.brick) for (let v = g + .3; v < h - 1; v += .3) ln(0, v, len, v, mix(o.wall, "#000000", .3), .02, { op: .25, off: .015, min: .25 });
    else for (let v = .6; v < h - 1; v += .6) ln(0, v, len, v, mix(o.wall, "#000000", .25), .025, { op: .3, off: .015, min: .25 });
    q(0, 0, len, g, o.base || mix(o.wall, "#ffffff", .1), { off: .02 });
    for (let v = .5; v < g; v += .5) ln(0, v, len, v, mix(o.base || o.wall, "#000000", .3), .03, { op: .35, off: .025, min: .25 });
    ln(0, g, len, g, trim, .3, { off: .06 });
    const nW = Math.max(1, Math.round(len / bay)), nF = Math.max(0, Math.floor((h - g - 1.1) / st));
    for (let f = 0; f < nF; f++) { const v0 = g + f * st + .85, v1 = v0 + st * .56;
      for (let k = 0; k < nW; k++) { const u = len * (k + .5) / nW, lt = NIGHT && rb() < (o.lit ?? .42);
        q(u - .66, v0 - .16, u + .66, v1 + .1, trim, { off: .045 });
        q(u - .52, v0, u + .52, v1, lt ? (rb() < .3 ? "#ffe2a8" : LAMP) : glassD, { glow: lt, off: .06 });
        if (!lt) q(u - .52, (v0 + v1) / 2, u, v1, "#b4c4d2", { off: .07, op: .28 });
        else if (rb() < .5) q(u - .52, v1 - .35, u + .52, v1, "#d89058", { glow: true, off: .065 });
        ln(u, v0, u, v1, trim, .05, { off: .075 });
        if (o.pedi && f === 0) q(u - .85, v1 + .12, u + .85, v1 + .5, trim, { off: .08 });
        else q(u - .78, v1 + .1, u + .78, v1 + .3, trim, { off: .07 });
        if (o.balc && f === 0) q(u - .9, v0 - .5, u + .9, v0 - .2, trim, { off: .12 }); }
      if (f === 0 || (o.belt && f % o.belt === o.belt - 1)) ln(0, v1 + .7, len, v1 + .7, trim, .16, { off: .06 }); }
    const nG = Math.max(1, Math.round(len / 4.4));
    for (let k = 0; k < nG; k++) { const u = len * (k + .5) / nG, door = k === Math.floor(nG / 2), lt = NIGHT && (door || rb() < .35);
      q(u - 1.2, door ? 0 : .9, u + 1.2, g - .7, trim, { off: .045 });
      q(u - 1.0, door ? 0 : 1.05, u + 1.0, g - .85, lt ? "#ffd690" : door ? (o.doorC || "#3a2a20") : glassD, { glow: lt, off: .06 });
      if (door && o.canopy) q(u - 1.5, g - 1.3, u + 1.5, g - .9, o.canopy, { off: .5 }); }
    q(0, h - 1.0, len, h, trim, { off: .12 }); ln(0, h - 1.0, len, h - 1.0, mix(trim, "#000000", .45), .12, { off: .13 });
    for (let u = .4; u < len; u += .7) q(u, h - 1.0, u + .25, h - .75, mix(trim, "#000000", .3), { off: .125 });
    return D; };
  const far = ob => { ob.tag = "far"; return ob; };
  const mansard = (cx, cz, wd, dd, y, rh, ins, c, trim) => {
    const a = wd / 2, b = dd / 2, A = a - ins, B = b - ins;
    const lo = [[-a, -b], [a, -b], [a, b], [-a, b]].map(([x, z]) => [cx + x, y, cz + z]), hi = [[-A, -B], [A, -B], [A, B], [-A, B]].map(([x, z]) => [cx + x, y + rh, cz + z]);
    const faces = [0, 1, 2, 3].map(i => { const P = [lo[i], lo[(i + 1) % 4], hi[(i + 1) % 4], hi[i]], dec = [];
      for (let t = .2; t < 1; t += .2) dec.push({ P: [P[0].map((v, j) => v + (P[3][j] - v) * t), P[1].map((v, j) => v + (P[2][j] - v) * t)], c: mix(c, "#000000", .3), ln: .03, min: .3, op: .5 });
      return { P, c, dec }; });
    faces.push({ P: hi, c: mix(c, "#000000", .1) });
    far(w.add(faces, { center: [cx, y + rh / 2, cz] }));
    // dormers on the front slope
    const nd = Math.max(2, Math.round(wd / 4.5));
    for (let k = 0; k < nd; k++) { const x = cx - a + wd * (k + .5) / nd;
      far(w.box({ x, z: cz - b + ins * .62, y: y + .2, w: 1.5, d: 1.2, h: 2.0, c: trim, dec: (faces, P) => { const lt = NIGHT && rb() < .45;
        faces[0].dec = [{ P: [P([-.45, .35, -.64]), P([.45, .35, -.64]), P([.45, 1.6, -.64]), P([-.45, 1.6, -.64])], c: lt ? LAMP : glassD, glow: lt }]; } }));
      far(w.cyl({ x, z: cz - b + ins * .62, y: y + 2.2, r0: .95, r1: 0, h: .7, n: 4, rot: Math.PI / 4, c })); } };
  const tank = (x, z, y) => {
    far(w.box({ x, z, y, w: 3.2, d: 3.2, h: 1.5, c: "#2e2a28" }));
    far(w.cyl({ x, z, y: y + 1.5, r0: 1.7, r1: 1.75, h: 3.4, n: 14, c: "#7a5a40" }));
    far(w.cyl({ x, z, y: y + 2.4, r0: 1.78, r1: 1.78, h: .12, n: 14, c: "#2e2a28", top: false }));
    far(w.cyl({ x, z, y: y + 4.9, r0: 1.9, r1: 0, h: 1.4, n: 14, c: "#4a3e36" })); };
  const bldg = o => {
    const wd = o.x1 - o.x0, cx = (o.x0 + o.x1) / 2, cz = o.zf + o.d / 2;
    let h = o.h; if (o.cap !== false) h = Math.min(h, roomSpan(o.x0, o.x1, o.zf) - (o.roofH || 0) - (o.tank ? 6.5 : 0));
    h = Math.max(h, 8);
    const side = o.side ?? (cx > 0 ? 3 : 1);
    far(w.box({ x: cx, z: cz, w: wd, d: o.d, h, c: o.wall, top: mix(o.wall, "#000000", .2), dec: (faces, P) => {
      if (o.front !== false) faces[0].dec = facadeDec((u, v, of) => P([-wd / 2 + u, v, -o.d / 2 - of]), wd, h, o);
      faces[side].dec = side === 3 ? facadeDec((u, v, of) => P([-wd / 2 - of, v, -o.d / 2 + u]), o.d, h, o)
        : facadeDec((u, v, of) => P([wd / 2 + of, v, o.d / 2 - u]), o.d, h, o); } }));
    if (o.mansard) mansard(cx, cz, wd - .4, o.d - .4, h, o.roofH, 1.6, o.mansard, o.trim || "#e8e0cc");
    if (o.tank) tank(cx + o.tank[0], cz + o.tank[1], h);
    return h; };
  // along Fifth: right of 88th Street a limestone mansion, a brick apartment house, a grey limestone one
  bldg({ x0: 34, x1: 58, zf: 128, d: 26, h: 20, roofH: 3.4, wall: "#d8cdb4", trim: "#ece4d0", base: "#cfc3a8", mansard: "#5a6068", pedi: true, balc: true, st: 3.8, bay: 3.4 });
  bldg({ x0: 58.4, x1: 80, zf: 128, d: 24, h: 22, wall: "#a35e44", trim: "#e2d8c2", base: "#d4c8b0", brick: true, belt: 3, canopy: "#2a3a30", tank: [3, 4] });
  bldg({ x0: 80.4, x1: 106, zf: 128, d: 24, h: 22, wall: "#c2b69e", trim: "#e0d6c0", base: "#b8ab92", belt: 2, canopy: "#5a2a2a" });
  // left of 89th Street: the limestone town house of the National Academy, then brick
  bldg({ x0: -82, x1: -61, zf: 128, d: 26, h: 20, roofH: 3, wall: "#e2d8c4", trim: "#f0e8d8", base: "#d6caae", mansard: "#565c66", pedi: true, st: 3.7 });
  bldg({ x0: -106, x1: -82.4, zf: 128, d: 24, h: 21, wall: "#8e5440", trim: "#e0d4bc", base: "#cbbfa6", brick: true, belt: 3, canopy: "#1e2a3a", tank: [-2, 5] });
  // town houses stepping back along the side streets (their fronts face the street, toward the middle)
  const rowH = rng(seed + 97), STONE = ["#7a5040", "#8a6450", "#c8b898", "#a86a4e", "#6e4a3a", "#d0c4aa", "#9a7a5a"];
  for (let z = 154.4; z < 330;) {
    const dd = 6 + rowH() * 3, c = STONE[Math.floor(rowH() * STONE.length)];
    bldg({ x0: 34.2, x1: 50, zf: z, d: dd - .3, h: 13 + rowH() * 6, wall: c, trim: "#e4dac6", brick: rowH() < .5, front: false, side: 3, st: 3.3, bay: 2.4, lit: .5 });
    bldg({ x0: -77, x1: -61.2, zf: z + 1.5, d: dd - .3, h: 13 + rowH() * 6, wall: STONE[Math.floor(rowH() * STONE.length)], trim: "#e4dac6", brick: rowH() < .5, front: false, side: 1, st: 3.3, bay: 2.4, lit: .5 });
    z += dd; }
  for (let z = 176; z < 330; z += 8 + rowH() * 3) bldg({ x0: 2, x1: 15.8, zf: z, d: 7.6, h: 12 + rowH() * 5, wall: STONE[Math.floor(rowH() * STONE.length)], trim: "#e4dac6", brick: true, front: false, side: 1, st: 3.3, bay: 2.4, lit: .5 });
  // the Upper East Side behind: apartment blocks around Madison and Park, wooden tanks on the roofs
  { const rr = rng(seed + 131), WALLS = ["#b89a7a", "#a87a5e", "#c8b494", "#9a6a52", "#d0c2a6", "#8a7466", "#b0a48e", "#c49c80"];
    for (let i = 0; i < 70; i++) {
      const z = 250 + Math.pow(rr(), .8) * 520, x = (rr() - .5) * 2.4 * z, wd = 14 + rr() * 22, dd = 14 + rr() * 12, px = sx(x, z);
      if (px < -200 || px > W + 200) continue;
      const cap = (sy(0, z) - capY(px) - 30 - rr() * 70) * z / FL;
      const h = Math.min(28 + rr() * 80, cap); if (h < 14) continue;
      const wall = WALLS[Math.floor(rr() * WALLS.length)], st = 3.2, nF = Math.floor(h / st), nW = Math.max(2, Math.floor(wd / 2.6));
      const winD = (Pf, len) => { const D = [];
        for (let f = 1; f < nF; f++) { const v0 = f * st + .7, v1 = v0 + 1.6;
          if (!NIGHT) D.push({ P: [Pf(0, v1 + .5), Pf(len, v1 + .5)], c: mix(wall, "#000000", .25), ln: .12, min: .3, op: .45 });
          for (let k = 0; k < nW; k++) { const u = len * (k + .5) / nW, lt = NIGHT && rr() < .33;
            if (NIGHT && !lt) continue;
            D.push({ P: [Pf(u - .5, v0), Pf(u + .5, v0), Pf(u + .5, v1), Pf(u - .5, v1)], c: lt ? (rr() < .3 ? "#ffe2a8" : LAMP) : glassD, glow: lt, op: lt ? 1 : .8 }); } }
        return D; };
      const side = x > 0 ? 3 : 1;
      far(w.box({ x, z, w: wd, d: dd, h, c: wall, top: mix(wall, "#000000", .2), dec: (faces, P) => {
        faces[0].dec = winD((u, v) => P([-wd / 2 + u, v, -dd / 2 - .05]), wd);
        faces[side].dec = side === 3 ? winD((u, v) => P([-wd / 2 - .05, v, -dd / 2 + u]), dd) : winD((u, v) => P([wd / 2 + .05, v, dd / 2 - u]), dd); } }));
      far(w.box({ x, z: z - dd / 2 + .3, y: h, w: wd + .4, d: .8, h: .9, c: mix(wall, "#ffffff", .12) }));
      if (rr() < .45 && h + 6.5 < cap) tank(x + (rr() - .5) * wd * .5, z + rr() * dd * .3, h); } }

  /* ---------- the museum annex: ten storeys of limestone grid behind the small rotunda ---------- */
  { const X = -22.5, Z = 160, wd = 18, dd = 13, h = 30;
    const grid = (Pf, len) => { const D = [];
      for (let u = 1.5; u < len; u += 1.5) D.push({ P: [Pf(u, 0), Pf(u, h - 1)], c: "#9a907e", ln: .04, min: .3, op: .45 });
      for (let v = 1.5; v < h - 1; v += 1.5) D.push({ P: [Pf(0, v), Pf(len, v)], c: "#9a907e", ln: .04, min: .3, op: .45 });
      for (let f = 0; f < 7; f++) { const v0 = 4.2 + f * 3.6, lt = NIGHT && rb() < .5;
        D.push({ P: [Pf(1, v0), Pf(len - 1, v0), Pf(len - 1, v0 + .9), Pf(1, v0 + .9)], c: lt ? "#ffe4b0" : "#4a5662", glow: lt });
        for (let u = 3; u < len - 1; u += 3) D.push({ P: [Pf(u, v0), Pf(u, v0 + .9)], c: "#d8cfbe", ln: .1, min: .4 }); }
      return D; };
    far(w.box({ x: X, z: Z, w: wd, d: dd, h, c: "#d8cdb6", top: "#b8ae9a", dec: (faces, P) => {
      faces[0].dec = grid((u, v) => P([-wd / 2 + u, v, -dd / 2 - .05]), wd);
      faces[1].dec = grid((u, v) => P([wd / 2 + .05, v, dd / 2 - u]), dd); } }));
    far(w.box({ x: X, z: Z + 1, y: h, w: wd - 3, d: dd - 4, h: 2.4, c: "#cbc0aa" })); }

  /* ---------- the museum (its own floodlit world) ---------- */
  const WHITE = "#f2ede0", WHITE2 = "#ece6d6", GLASS = NIGHT ? "#ffd59a" : "#4c5864";
  const ring = o => {
    const n = o.n || 72, faces = [], cx = o.x, cz = o.z;
    const pt = (rr, y, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr]; };
    for (let i = 0; i < n; i++) { const j = i + 1;
      const F1 = { P: [pt(o.r0, o.y0, i), pt(o.r0, o.y0, j), pt(o.r1, o.y1, j), pt(o.r1, o.y1, i)], c: o.c, seam: true, glow: o.glow };
      if (o.joint && i % o.joint === 0) F1.dec = [{ P: [pt(o.r0 + .04, o.y0, i), pt(o.r1 + .04, o.y1, i)], c: o.jc || mix(o.c, "#000000", .16), ln: o.jw || .05, min: .4, op: o.jop ?? .5, glow: o.jglow }];
      faces.push(F1);
      // the underside of the overhang: only its front half can show; the back half sits behind the glass ribbon
      if (o.under && Math.sin((i + .5) / n * Math.PI * 2) < .15) faces.push({ P: [pt(o.under, o.y0, i), pt(o.r0, o.y0, i), pt(o.r0, o.y0, j), pt(o.under, o.y0, j)], c: o.uc || mix(o.c, "#000000", .1), seam: true }); }
    return wm.add(faces, { center: [cx, (o.y0 + o.y1) / 2, cz] }); };
  // a rotunda: glass at the foot, then stacked bands, each wider than the one below, a glowing glass ribbon between
  const rotunda = (x, z, base, bands, top) => {
    ring({ x, z, y0: 0, y1: bands[0][0], r0: base, r1: base, c: GLASS, glow: NIGHT, joint: 3, jc: NIGHT ? "#c89a60" : "#8a96a0", jw: .12, jop: .8, jglow: NIGHT });
    bands.forEach(([y0, y1, r0, r1], k) => {
      ring({ x, z, y0, y1, r0, r1, c: k % 2 ? WHITE2 : WHITE, joint: 6, under: k ? bands[k - 1][3] - .9 : base, uc: NIGHT ? "#8a90a8" : "#b4b0a4" });
      ring({ x, z, y0: y1 - .28, y1, r0: r1 + .03, r1: r1 + .05, c: "#fffcf2" });
      if (k < bands.length - 1) { const yn = bands[k + 1][0], rg = r1 - .9;
        ring({ x, z, y0: y1, y1: yn, r0: rg, r1: rg, c: GLASS, glow: NIGHT, joint: 4, jc: NIGHT ? "#d0a468" : "#9aa4ac", jw: .1, jop: .7, jglow: NIGHT });
        ring({ x, z, y0: yn - .35, y1: yn, r0: rg + .02, r1: rg + .02, c: NIGHT ? "#c08850" : "#2a3038", glow: NIGHT, n: 48 }); } });
    if (top) wm.cyl({ x, z, y: bands[bands.length - 1][1], r0: top, r1: top * .35, h: top * .38, n: 36, c: NIGHT ? "#ffe0b0" : "#c2ced8", glow: NIGHT }); };
  rotunda(0, 143, 11.3, [[4.5, 9.4, 12.4, 12.9], [10.6, 15.5, 13.3, 13.8], [16.7, 21.6, 14.2, 14.7], [22.8, 27.6, 15.1, 15.6]], 8.6);
  rotunda(-33, 136.5, 7.4, [[3.7, 8.4, 8.2, 8.5], [9.5, 14.4, 8.7, 9.0]], 0);
  // the "bridge": a long cream band carrying the lettering, over a recessed glass ground floor
  wm.box({ x: -11.5, z: 127.6, w: 29, d: 6.8, h: 3.6, c: GLASS, glow: NIGHT, dec: (faces, P) => {
    faces[0].dec = Array.from({ length: 14 }, (_, i) => ({ P: [P([-14.5 + i * 2.1 + .5, 0, -3.45]), P([-14.5 + i * 2.1 + .5, 3.6, -3.45])], c: NIGHT ? "#c89a60" : "#8a96a0", ln: .12, min: .5, glow: NIGHT })); } });
  wm.box({ x: -11.5, z: 127.3, y: 3.6, w: 29, d: 6.6, h: 3.0, c: WHITE, top: WHITE2 });
  wm.box({ x: -11.5, z: 124.08, y: 6.35, w: 29.1, d: .2, h: .25, c: "#fffcf2" });
  // planters along the base
  [[-22, 123.2], [-12.5, 123.2], [-3, 123.2]].forEach(([x, z]) => wm.box({ x, z, w: 6, d: 1.2, h: .7, c: "#d8d0c0" }));
  wm.sprite({ x: -11.5, z: 123.95, y: 3.6, fn: (px, py, k, fog) =>
    `<text x="${F(px)}" y="${F(py - 1.12 * k)}" text-anchor="middle" font-family="Futura, 'Century Gothic', 'Trebuchet MS', Arial, sans-serif" font-weight="600" font-size="${F(1.02 * k)}" textLength="${F(22 * k)}" lengthAdjust="spacingAndGlyphs" fill="${NIGHT ? "#f2dcaa" : TM(mix("#3e3226", HZ, fog))}">SOLOMON R. GUGGENHEIM MUSEUM</text>` });

  /* ---------- on the avenue: cabs, cars and an M4 bus heading downtown ---------- */
  const carLights = [];
  const car = (x, z, kind) => {
    const pick = a => a[Math.floor(rc() * a.length)];
    if (kind === "bus") {
      const L = 12.2;
      w.box({ x, z, y: .35, w: L, d: 2.55, h: 2.85, c: "#e6eaec", top: "#c8ccd0", dec: (faces, P) => {
        faces[0].dec = [{ P: [P([-L / 2 + .3, 1.3, -1.3]), P([L / 2 - .9, 1.3, -1.3]), P([L / 2 - .9, 2.45, -1.3]), P([-L / 2 + .3, 2.45, -1.3])], c: NIGHT ? "#ffe8b8" : "#2a3440", glow: NIGHT },
          { P: [P([-L / 2, .85, -1.31]), P([L / 2, .85, -1.31]), P([L / 2, 1.1, -1.31]), P([-L / 2, 1.1, -1.31])], c: "#2a5aa8" },
          { P: [P([L / 2 - 2.6, .1, -1.31]), P([L / 2 - 1.5, .1, -1.31]), P([L / 2 - 1.5, 2.2, -1.31]), P([L / 2 - 2.6, 2.2, -1.31])], c: "#3a4450" }]; } });
      w.box({ x: x + L / 2 - .02, z, y: 2.5, w: .06, d: 1.6, h: .3, c: NIGHT ? "#ffa030" : "#3a2a1a", glow: NIGHT });
      [-L / 2 + 2.4, L / 2 - 2.8].forEach(dx => w.box({ x: x + dx, z: z - 1.2, y: 0, w: 1.0, d: .2, h: .75, c: "#16161a" }));
      carLights.push([x, z, L]); return; }
    const L = 4.7, col = kind === "taxi" ? "#f2c42a" : pick(["#1a1c22", "#e8e8e6", "#8a9098", "#2a3a5a", "#6a1e1e", "#c8c8c4", "#2e3a32"]);
    w.box({ x, z, y: .3, w: L, d: 1.85, h: .74, c: col, dec: (faces, P) => {
      faces[0].dec = [{ P: [P([-.3, .3, -.94]), P([-.3, 1.0, -.94])], c: mix(col, "#000000", .4), ln: .03, min: .3 },
        { P: [P([L / 2 - .1, .58, -.94]), P([L / 2 - .02, .58, -.94]), P([L / 2 - .02, .72, -.94]), P([L / 2 - .1, .72, -.94])], c: NIGHT ? "#fff4d0" : "#e8e4d8", glow: NIGHT },
        { P: [P([-L / 2 + .02, .62, -.94]), P([-L / 2 + .12, .62, -.94]), P([-L / 2 + .12, .78, -.94]), P([-L / 2 + .02, .78, -.94])], c: NIGHT ? "#ff3a2a" : "#8a1a14", glow: NIGHT }]; } });
    const cab = w.box({ x: x - .25, z, y: 1.04, w: 2.5, d: 1.6, h: .52, c: col, dec: (faces, P) => {
      faces[0].dec = [{ P: [P([-1.1, .06, -.81]), P([1.15, .06, -.81]), P([.85, .46, -.81]), P([-.85, .46, -.81])], c: NIGHT ? "#1a2030" : "#2e3a46" },
        { P: [P([.1, .06, -.82]), P([.1, .46, -.82])], c: col, ln: .08, min: .4 }]; } });
    if (kind === "taxi") w.box({ x: x - .25, z, y: 1.56, w: .7, d: .3, h: .22, c: NIGHT ? "#ffe890" : "#f4f0d8", glow: NIGHT });
    [-1.45, 1.45].forEach(dx => w.box({ x: x + dx, z: z - .82, y: 0, w: .68, d: .2, h: .6, c: "#141418" }));
    carLights.push([x, z, L]); };
  [[106.2, .55], [109.8, .45], [113.4, .45], [117.0, .5]].forEach(([z, dens], lane) => {
    for (let x = -170 + rc() * 20; x < 170; x += 8 + rc() * 22) {
      if (rc() > dens) continue;
      if (lane === 3 && x > -35 && x < -5) { car(x + 6, z + .4, "bus"); x += 14; continue; }
      car(x, z, rc() < .45 ? "taxi" : "car"); } });

  /* ---------- the park edge: wall and gate, lamps, traffic lights, hedges ---------- */
  { const wallC = "#8c8474", cop = "#b0a896";
    [[-200, -9.2], [-2.8, 200]].forEach(([a, b]) => {
      w.box({ x: (a + b) / 2, z: 96.3, w: b - a, d: .6, h: .95, c: wallC, dec: (faces, P) => { const D = [], L = b - a;
        for (let u = .9; u < L; u += 1.1 + rl() * .5) D.push({ P: [P([-L / 2 + u, 0, -.33]), P([-L / 2 + u, .95, -.33])], c: "#5a5448", ln: .04, min: .3, op: .55 });
        D.push({ P: [P([-L / 2, .48, -.33]), P([L / 2, .48, -.33])], c: "#5a5448", ln: .035, min: .3, op: .45 });
        faces[0].dec = D; } });
      w.box({ x: (a + b) / 2, z: 96.3, y: .95, w: b - a, d: .8, h: .14, c: cop }); });
    [-9.6, -2.4].forEach(x => { w.box({ x, z: 96.3, w: .9, d: .9, h: 1.9, c: "#9a9282" }); w.box({ x, z: 96.3, y: 1.9, w: 1.05, d: 1.05, h: .16, c: cop });
      w.cyl({ x, z: 96.3, y: 2.06, r0: .32, r1: .05, h: .55, n: 10, c: cop }); }); }
  const lamps = [];
  const parkLamp = (px, py, k, fog) => { const C = c => T(mix(c, HZ, fog)), m = v => v * k; let g = "";
    g += `<path d="M${F(px - m(.2))},${F(py)} L${F(px + m(.2))},${F(py)} L${F(px + m(.1))},${F(py - m(.9))} L${F(px - m(.1))},${F(py - m(.9))}Z" fill="${C("#1e2a24")}"/>`;
    g += `<rect x="${F(px - m(.05))}" y="${F(py - m(3.6))}" width="${F(m(.1))}" height="${F(m(2.75))}" fill="${C("#1e2a24")}"/><rect x="${F(px + m(.01))}" y="${F(py - m(3.6))}" width="${F(m(.03))}" height="${F(m(2.75))}" fill="${C("#46584e")}"/>`;
    g += `<path d="M${F(px - m(.16))},${F(py - m(3.6))} L${F(px + m(.16))},${F(py - m(3.6))} L${F(px + m(.22))},${F(py - m(4.25))} L${F(px - m(.22))},${F(py - m(4.25))}Z" fill="${NIGHT ? "#fff0c4" : C("#d8dcd8")}"/>`;
    if (!NIGHT) g += `<path d="M${F(px + m(.04))},${F(py - m(3.65))} L${F(px + m(.12))},${F(py - m(3.65))} L${F(px + m(.16))},${F(py - m(4.2))} L${F(px + m(.08))},${F(py - m(4.2))}Z" fill="#ffffff" opacity=".7"/>`;
    g += `<path d="M${F(px - m(.28))},${F(py - m(4.25))} L${F(px + m(.28))},${F(py - m(4.25))} L${F(px)},${F(py - m(4.55))}Z" fill="${C("#1e2a24")}"/>`;
    if (NIGHT) g += `<circle cx="${F(px)}" cy="${F(py - m(3.9))}" r="${F(m(1.6))}" fill="url(#ggGlow)" opacity=".9"/>`;
    return g; };
  const signal = (px, py, k, fog) => { const C = c => T(mix(c, HZ, fog)), m = v => v * k; let g = "";
    g += `<rect x="${F(px - m(.08))}" y="${F(py - m(5.4))}" width="${F(m(.16))}" height="${F(m(5.4))}" fill="${C("#2a2c2e")}"/>`;
    g += `<rect x="${F(px - m(.24))}" y="${F(py - m(5.6))}" width="${F(m(.48))}" height="${F(m(1.25))}" rx="${F(m(.06))}" fill="${C("#c8a020")}"/>`;
    [["#ff3a2a", .45], ["#ffb020", .82], ["#3aff8a", 1.19]].forEach(([c, dy], i) => { const on = i === 2;
      g += `<circle cx="${F(px)}" cy="${F(py - m(5.6) + m(dy) - m(.2))}" r="${F(m(.13))}" fill="${on ? c : C("#2a2a2a")}"/>`;
      if (on && NIGHT) g += `<circle cx="${F(px)}" cy="${F(py - m(5.6) + m(dy) - m(.2))}" r="${F(m(.9))}" fill="${c}" opacity=".18"/>`; });
    return g; };
  for (let x = -150; x < 160; x += 26) { if (x > -14 && x < 14) continue; w.sprite({ x, z: 97.6, fn: parkLamp }); lamps.push([x, 97.6]); }
  for (let x = -137; x < 160; x += 26) { if (x > -46 && x < 16) continue; w.sprite({ x, z: 121.6, fn: parkLamp }); lamps.push([x, 121.6]); }
  [[16.6, 121.4], [-42.6, 121.4], [16.6, 102.6], [-42.6, 102.6]].forEach(([x, z]) => w.sprite({ x, z, fn: signal }));
  // hedges inside the wall, low in front of the museum
  for (let x = -150; x < 150; x += 2.6 + rl() * 2) { const z = 93 + rl() * 2.4, hh = Math.abs(x + 8) < 30 ? .9 + rl() * .5 : 1.3 + rl() * 1.1, wd = 2.4 + rl() * 2;
    if (x > -10.5 && x < -1.5) continue;
    const RAMP = rl() < .6 ? GREEN : rl() < .5 ? RUST : MAPLE, rr = rng(seed + Math.round(x * 13));
    w.sprite({ x, z, fn: (px, py, k, fog) => shrub(px, py, wd * k, hh * k, RAMP, fog, rr) }); }

  /* ---------- trees: park elms, sidewalk trees, side streets, the park itself ---------- */
  [-27, -37.5, -48, -59, -70, -81.5, -93, -105, 24.5, 35, 46, 57.5, 69, 80.5, 92, 104].forEach(x => plantTree(x + (rt() - .5) * 2, 93.6, 15 + rt() * 2.5, rt() < .8 ? ELM : PLANE, true));
  [-98, -89.5, -80, -71, 39, 48, 57, 66, 75, 84, 93, 102].forEach(x => plantTree(x + (rt() - .5), 122.6, 9 + rt() * 3, rt() < .5 ? PLANE : rt() < .5 ? ELM : RUST, false));
  for (let z = 168; z < 330; z += 20 + rt() * 10) { [17.4, 32.6].forEach(x => plantTree(x, z + rt() * 4, 10 + rt() * 3, pickRamp(rt()), false, "far")); [-44.6, -59.4].forEach(x => plantTree(x, z + rt() * 4, 10 + rt() * 3, pickRamp(rt()), false, "far")); }
  { const spots = [];
    for (let i = 0; i < 80 && spots.length < 11; i++) { const z = 52 + rt() * 36, x = (rt() - .5) * 1.7 * z, px = sx(x, z), hM = 11 + rt() * 7, hp = Math.min(hM, room(x, z)) * FL / z;
      if (px + hp * .5 > 1010 && px - hp * .5 < 1560) continue;
      if (px < -100 || px > W + 100 || spots.some(([qx]) => Math.abs(qx - px) < 170)) continue;
      spots.push([px]); plantTree(x, z, hM, pickRamp(rt()), rt() < .25); } }
  // benches along the path and a lamp at its bend
  [[-24.5, 55], [-15, 72], [-9.5, 84]].forEach(([x, z]) => { w.box({ x: x - 2.4, z, w: 1.9, d: .5, h: .08, y: .45, c: "#6a5a3e" }); w.box({ x: x - 2.4, z: z + .25, w: 1.9, d: .08, h: .5, y: .55, c: "#5a4a34" });
    [-.85, .85].forEach(dx => w.box({ x: x - 2.4 + dx, z, w: .08, d: .5, h: .45, c: "#1e2622" })); });
  [[-21, 62], [-10.5, 80]].forEach(([x, z]) => { w.sprite({ x: x + 2.6, z, fn: parkLamp }); lamps.push([x + 2.6, z]); });

  /* ---------------- assemble ---------------- */
  s += G;
  s += w.draw({ where: o => o.tag === "far" });
  s += `<rect x="0" y="${WY - 110}" width="${W}" height="150" fill="url(#ggHaze)" opacity="${NIGHT ? .3 : .32}"/>`;
  if (NIGHT) s += `<ellipse cx="1290" cy="330" rx="420" ry="260" fill="url(#ggFlood)"/>`;
  s += wm.draw();
  s += w.draw({ where: o => o.tag !== "far" });
  if (NIGHT) {
    s += `<g style="mix-blend-mode:screen">`;
    lamps.forEach(([x, z]) => { const q = pr(x, z), k = FL / z; s += `<ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(k * 4)}" ry="${F(k * .7)}" fill="url(#ggWarm)" opacity=".75"/>`; });
    carLights.forEach(([x, z, L]) => { const h = pr(x + L / 2 + 4, z - .3), t = pr(x - L / 2, z, .7), k = FL / z;
      s += `<ellipse cx="${F(h[0])}" cy="${F(h[1])}" rx="${F(k * 4.5)}" ry="${F(k * .5)}" fill="url(#ggWarm)" opacity=".8"/><circle cx="${F(t[0])}" cy="${F(t[1])}" r="${F(k * .6)}" fill="url(#ggRed)"/>`; });
    // the museum's glass at street level throws warm light onto the sidewalk
    { const q = pr(-8, 123), k = FL / 123; s += `<ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(k * 26)}" ry="${F(k * 1.2)}" fill="url(#ggWarm)" opacity=".7"/>`; }
    s += `</g>`;
  }
  // grass and leaves at the bottom corners, under the cards
  const tuft = (x0, x1) => { let g = "";
    for (let i = 0; i < 80; i++) { const x = x0 + r() * (x1 - x0), y = 702 + r() * 30, hh = 30 + r() * 60, bend = (r() - .5) * 30;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#5a7a32" : "#8aa24c")}" stroke-width="${F(1.6 + r() * 2)}" fill="none" stroke-linecap="round"/>`; }
    for (let i = 0; i < 40; i++) { const cx = x0 + r() * (x1 - x0), cy = 690 + r() * 30;
      g += `<ellipse cx="${F(cx)}" cy="${F(cy)}" rx="${F(5 + r() * 5)}" ry="${F(2 + r() * 2)}" fill="${T(LEAF[Math.floor(r() * LEAF.length)])}" transform="rotate(${F((r() - .5) * 60)} ${F(cx)} ${F(cy)})"/>`; }
    return g; };
  s += tuft(0, 320) + tuft(2240, 2560);

  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#ggLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".05"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#ggPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
