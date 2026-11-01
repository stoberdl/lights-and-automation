/* Carpathian Castle Crag: a white-walled castle in the style of Bran ("Dracula's
   castle"), Transylvania, on its rock above a village in October. The camera
   stands on a lane at the edge of the village, 6 m up the valley side, looking
   across strip fields and conical haystacks on poles to the crag: a tall square
   keep, a round tower, a slim stair turret and a hipped hall, terracotta roofs,
   all on a wooded limestone rock. Beech and fir woods climb behind to the
   snow-dusted Bucegi range. Late afternoon: the sun is low off the left edge,
   jackdaws circle the towers, mist gathers along the valley floor.
   opts.time === "night": a full moon over the left shoulder of the castle,
   stars, bats, lit castle and village windows, a warm floodlight on the rock.
   The land is one world3d() raster (reference/scene-helpers.js); the castle,
   houses, haystacks and trees are placed in metres by the same camera.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), mountainField(), mountainColor(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function carpathianCastleCragArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 6183;
  const r = rng(seed), rs = rng(seed + 5), rl = rng(seed + 17), rh = rng(seed + 29), rv = rng(seed + 41);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const MOX = 1012, MOY = 150;   // the full moon: left of the keep, clear of the temperature corner
  const LX = NIGHT ? MOX : -180, LY = NIGHT ? MOY : 250, WY = 452;
  const T = c => NIGHT ? mix(mix(c, "#70748e", .4), "#080c26", .62) : c;
  const HZ = NIGHT ? "#232750" : "#ead6b6", RIM = NIGHT ? "#c0ccf0" : "#fff0c4", LAMP = "#ffb24a", SHADE = NIGHT ? "#04050e" : "#3a2e4a";
  const cl = v => Math.max(0, Math.min(.999, v));
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
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

  /* ---------------- sky: warm late afternoon, or a full-moon night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#04061a"/><stop offset=".45" stop-color="#0c1236"/><stop offset=".82" stop-color="#1e244e"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#4e74aa"/><stop offset=".42" stop-color="#8eaccc"/><stop offset=".78" stop-color="#e2d2b6"/><stop offset="1" stop-color="#f6d6a4"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e8e4f4" stop-opacity=".35"/><stop offset=".18" stop-color="#9a9ad0" stop-opacity=".12"/><stop offset="1" stop-color="#7a6aa8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2c4" stop-opacity=".95"/><stop offset=".22" stop-color="#ffd89a" stop-opacity=".5"/><stop offset=".6" stop-color="#ffc888" stop-opacity=".14"/><stop offset="1" stop-color="#ffc888" stop-opacity="0"/>`;
  let s = `<defs id="cccdefs">
    <linearGradient id="cccSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="cccLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 1000 : 1700}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="cccHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".75"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="cccGlow"><stop offset="0" stop-color="#ffd890" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".4"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="cccMoonG"><stop offset="0" stop-color="#f6f0dc" stop-opacity=".55"/><stop offset=".25" stop-color="#c8c8e8" stop-opacity=".16"/><stop offset="1" stop-color="#c8c8e8" stop-opacity="0"/></radialGradient>
    <radialGradient id="cccMoonD" cx=".42" cy=".4" r=".62"><stop offset="0" stop-color="#fffaea"/><stop offset=".7" stop-color="#efe6cc"/><stop offset="1" stop-color="#cfc6ae"/></radialGradient>
    <filter id="cccLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="cccCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".014" numOctaves="3" seed="27" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="36" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.6"/></filter>
    <filter id="cccPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="cccSoft"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="cccMist"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#cccSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 700; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 400, big = rs() < .07, dm = Math.hypot(x - MOX, y - MOY);
      if (dm < 120 && rs() < .85) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.25 + rs() * .6 * (1 - y / 440))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#cccLight)"/>`;
    // a full moon: glow, disc, maria
    s += `<circle cx="${MOX}" cy="${MOY}" r="170" fill="url(#cccMoonG)"/><circle cx="${MOX}" cy="${MOY}" r="27" fill="url(#cccMoonD)"/>`;
    [[-8, -6, 8, 6], [5, -9, 6, 4], [7, 3, 7, 5], [-4, 7, 5, 4], [-11, 3, 4, 3]].forEach(([dx, dy, a, b]) =>
      s += `<ellipse cx="${MOX + dx}" cy="${MOY + dy}" rx="${a}" ry="${b}" fill="#b4ac98" opacity=".45"/>`);
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#cccLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#cccSoft)">`;
    for (let k = 0; k < 6; k++) { const a = -.02 + k * .065, L = 2200;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: long late-day banks lit from the left; jackdaws or bats ---------------- */
  const cloud = (x, y, w, cls, flat = 1) => {
    let c = `<g class="${cls}"><g filter="url(#cccCloudy)">`;
    const lobes = [];
    for (let k = 0; k < 12; k++) { const t = k / 11; lobes.push([x + (t - .5) * w * (.9 + rs() * .2), y - Math.sin(t * Math.PI) * w * (.06 + rs() * .06) * flat, w * (.07 + rs() * .05)]); }
    if (NIGHT) {
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#141838"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.3)}" ry="${F(R * .55)}" fill="#1a1e44"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .35)}" cy="${F(ly - R * .15)}" rx="${F(R * .8)}" ry="${F(R * .28)}" fill="#4a5088" opacity=".55"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .56)}" ry="${F(w * .035)}" fill="#b4a8b4"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.25)}" ry="${F(R * .7)}" fill="#d4ccd0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .1)}" cy="${F(ly - R * .05)}" rx="${F(R * 1.05)}" ry="${F(R * .6)}" fill="#f4ece2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .4)}" cy="${F(ly - R * .22)}" rx="${F(R * .55)}" ry="${F(R * .3)}" fill="#fff2d4"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(420, 120, 560, "drift1", .8) + cloud(1640, 70, 380, "drift2") + cloud(2200, 160, 620, "drift3", .7) + cloud(760, 262, 300, "drift2", .6);
  if (NIGHT) {   // bats round the towers
    s += `<g class="birds">`;
    [[1140, 96, 1.6], [1230, 170, 1.2], [1300, 70, 1.1], [1470, 128, 1.4], [1540, 210, 1.0], [1080, 222, 1.1], [1610, 96, .9]].forEach(([x, y, k], i) => {
      const fl = i % 2 ? -1 : 1, wy = fl * 1.5 * k;
      const wing = sd => `M${F(x + sd * 1 * k)},${F(y - k)} Q${F(x + sd * 6 * k)},${F(y - 6 * k - wy)} ${F(x + sd * 12 * k)},${F(y - 3 * k - wy)} Q${F(x + sd * 10 * k)},${F(y)} ${F(x + sd * 9 * k)},${F(y + 1.2 * k)} Q${F(x + sd * 7.5 * k)},${F(y - .6 * k)} ${F(x + sd * 6 * k)},${F(y + 1.6 * k)} Q${F(x + sd * 4 * k)},${F(y - .2 * k)} ${F(x + sd * 1 * k)},${F(y + 1.2 * k)}Z`;
      s += `<path d="${wing(-1)} ${wing(1)}" fill="#05050c" opacity=".9"/><ellipse cx="${x}" cy="${F(y)}" rx="${F(1.6 * k)}" ry="${F(2.6 * k)}" fill="#05050c"/>`; });
    s += `</g>`;
  } else {       // jackdaws circling the keep
    s += `<g class="birds" fill="none" stroke="#2a2630" stroke-width="2" stroke-linecap="round" opacity=".8">`;
    [[1120, 110, .8], [1162, 92, .7], [1210, 128, .75], [1460, 84, .8], [1500, 112, .65], [1540, 70, .6], [1080, 150, .6], [1586, 130, .55]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 12 * k)},${F(y - 2 * k)} q${F(6 * k)},${F(-6 * k)} ${F(12 * k)},${F(2 * k)} q${F(5 * k)},${F(-6 * k)} ${F(12 * k)},${F(-2 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 6 m above the valley floor, horizon on WY; metres, x right, y up, z away.
     The crag rises at (CX, CZ) to a level top at CG, where the castle stands turned CYAW. */
  const EYE = 6, FL = 2150;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.55, .5, .3] : [-.78, .42, -.25], tone: T, fog: HZ, fogK: .00028,
    shadow: SHADE, rim: RIM, shade: .68, hi: .3, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const CX = 27, CZ = 330, CG = 30, CYAW = 14, CU = (CX + 3) / CZ;   // CU: the castle's x/z, kept clear of houses
  const ca = Math.cos(CYAW * Math.PI / 180), sa = Math.sin(CYAW * Math.PI / 180);
  const toWorld = (lx, lz) => [CX + lx * ca - lz * sa, CZ + lx * sa + lz * ca];
  const cragD = (x, z) => Math.hypot((x - CX - 3) / 40, (z - CZ + 3) / 30) + .12 * N1(x / 16, z / 16) + .05 * N2(x / 5, z / 5);
  const toLocal = (x, z) => { const dx = x - CX, dz = z - CZ; return [dx * ca + dz * sa, -dx * sa + dz * ca]; };
  const crag = (x, z) => { const d = cragD(x, z), [lx, lz] = toLocal(x, z);
    const dome = CG * (1 - sm((d - .08) / 1.0)) * (.92 + .1 * N2(x / 9, z / 9));   // a rugged dome, falling away right under the walls
    const pad = sm(1 - Math.max(Math.abs(lx - 3.5) - 17.5, Math.abs(lz + 1) - 9.8) / 2.5);
    return dome + (CG - dome) * pad + 7 * (1 - sm((d - .9) / 1.1)) * (.7 + .3 * N3(x / 20, z / 20)); };
  /* the wooded spur the crag ends: a ridge running back to the right into the hills */
  const SP0 = [CX + 30, CZ + 25], SP1 = [CX + 520, CZ + 520];
  const spur = (x, z) => { const vx = SP1[0] - SP0[0], vz = SP1[1] - SP0[1], t = Math.max(0, Math.min(1, ((x - SP0[0]) * vx + (z - SP0[1]) * vz) / (vx * vx + vz * vz)));
    const dd = Math.hypot(x - SP0[0] - vx * t, z - SP0[1] - vz * t) / (45 + 60 * t) + .2 * N2(x / 40, z / 40);
    return (CG - 8 + 40 * t) * (1 - sm(dd)) * (.85 + .15 * N1(x / 30, z / 30)); };
  const pathX = z => CX * Math.min(1, z / 280) - 16 * Math.sin(z / 52) * (1 - Math.min(1, z / 300)) - 4;
  const yLim = u => 268 - 60 * Math.exp(-(((u + .05) / .16) ** 2)) + 7 * Math.sin(u * 15 + 1.3);
  const capH = (x, z) => EYE + (WY - yLim(x / z)) * z / FL * (.94 + .06 * N3(x / 300, z / 300));
  const MF = mountainField({ seed: 2919, scale: 2200, oct: 7, peaks: [
    { x: -5600, z: 7200, h: 420, r: 2400 }, { x: -1900, z: 9800, h: 720, rx: 2600, rz: 1800 }, { x: 1600, z: 8200, h: 560, r: 2000 },
    { x: 6200, z: 9400, h: 480, r: 2600 }, { x: -300, z: 12500, h: 900, r: 3000 }, { x: 9800, z: 11000, h: 520, r: 2600 } ] });
  const hT = (x, z) => {
    let h = .8 * N2(x / 70, z / 70) + .3 * N3(x / 18, z / 18);                        // the rolling valley floor
    h += 130 * sm((z - 520) / 1900) * (.6 + .5 * N1(x / 700, z / 700)) + 30 * N3(x / 260, z / 260) * sm((z - 480) / 500);   // wooded hills
    if (z > 2600) { const far = MF(x, z) * sm((z - 2600) / 2800); if (far > h) h = far; }
    h = Math.max(h, crag(x, z), spur(x, z));
    if (Math.abs(x - pathX(z)) < 4 && z < 300) h -= .25 * (1 - Math.abs(x - pathX(z)) / 4);
    return Math.max(.02, Math.min(h, capH(x, z))); };
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;

  /* ---------- colour: the raster lights it; this picks the material ---------- */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const FOR = ["#2e3e2a", "#3e4424", "#c07a2a", "#a8461e", "#d4a034", "#7e3e1e", "#e0902e", "#24342a"].map(H3);
  const STRIP = ["#c8ac5c", "#86964a", "#7a5c3c", "#a8a25e", "#b49a4e", "#6e8440", "#94703e"].map(H3);
  const GR1 = H3("#7c8c44"), GR2 = H3("#a4a052"), GR3 = H3("#5a6a34"), LANE = H3("#a8946e"), ROCK = H3("#b2ab9a"), ROCK2 = H3("#7a7466"), BLUE = H3("#5e6a8c");
  const MC = mountainColor({ seed: 31, snow: 400, tree: 300, goldK: .55, forest: "#2e3e2c", gold: "#b8782a", rock: "#949aa4", rock2: "#5e6470", grass: "#8a8a4c" });
  const woods = (x, z) => { const k = N1(x / 30, z / 30) * .5 + .5, t = N2(x / 6, z / 6) * .5 + .5;
    let c = L3(FOR[0], FOR[1], k);
    c = L3(c, FOR[2 + Math.floor(hash(Math.floor(x / 20), Math.floor(z / 20)) * 6)], sm((N3(x / 50 + 4, z / 50) + .25) / .45) * .9);
    return c.map(v => v * (.72 + .5 * t)); };
  const fieldEdge = z => 560 + 70 * N1(z / 300, 4.2);
  const isField = (x, z) => z < fieldEdge(z) + 60 * N2(x / 200, 1.7) && cragD(x, z) > 1.25 && spur(x, z) < 2.5;
  const col = (x, y, z, n, ao) => {
    if (z > 2600) { const m = MC(x, y, z, n, ao); return L3(L3(woods(x, z), m, sm((z - 2600) / 1600)), BLUE, .12 + sm((z - 3000) / 7000) * .3); }
    const d = cragD(x, z);
    if (d < 1.3) {                                         // the crag: limestone where steep, scrub and turf where not
      const steep = 1 - n[1], st = Math.floor(y / 1.7 + 1.6 * N2(x / 9, z / 9)), crack = Math.abs(N3(x / 2.2 + st * .7, z / 2.2)) < .05 ? .62 : 1;
      const bands = (.82 + .22 * hash(st, 3)) * crack * (.94 + .08 * N3(x / .8, y / .8));
      let c = L3(ROCK, ROCK2, .45 + N1(x / 5, y / 4) * .5 + steep * .5 - ao * .4).map(v => v * bands);
      if (steep < .3 + .12 * N2(x / 7, z / 7)) c = L3(c, y > CG - 1 ? GR3 : woods(x, z), .85);
      return c; }
    if (!isField(x, z)) return woods(x, z);
    let c = L3(GR1, GR2, .5 + .6 * N2(x / 9, z / 9)); c = L3(c, GR3, .5 * N3(x / 2.5, z / 2.5) + .2);
    if (z > 55) {                                          // long strip fields running up the valley
      const u = (x * .94 + z * .34) / 13 + N1(x / 220, z / 220) * 2, st = STRIP[Math.floor(hash(Math.floor(u), 7) * STRIP.length)];
      const edge = Math.abs(u - Math.floor(u) - .5) > .46;
      c = L3(c, st, sm((z - 55) / 60) * (edge ? .3 : .85));
      c = c.map(v => v * (.92 + .1 * N3(x / 1.5, z / 4))); }
    const pd = Math.abs(x - pathX(z));
    if (z < 300 && pd < 2.4) c = L3(LANE.map(v => v * (.9 + .14 * N1(x * 1.2, z * 1.2))), c, sm((pd - 1.5 - .3 * N3(z / 2, x)) / .7));
    return c; };
  w.raster({ z0: 12, z1: 16000, step: .0011, minStep: .15, scale: .75, top: 200, bottom: H, h: hT, col, tone: rgbTone(T), fog: HZ, fogK: .00009, amb: NIGHT ? .55 : .44, noRefl: true });

  /* ---------- 2D drawings placed as sprites ---------- */
  const BEECH = ["#4a2a0e", "#6a3c12", "#8e5418", "#b06c1e", "#cc8a26", "#e0a83a", "#eec462", "#f8e09a"];
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const OAK = ["#2a2a14", "#3a3a18", "#4e4a1e", "#646024", "#7a722c", "#94863a", "#ae9e52", "#c8bc78"];
  const WALNUT = ["#3a3410", "#544a14", "#6e621c", "#8a7a26", "#a89234", "#c4aa48", "#d8c26a", "#ead89a"];
  const FIRC = ["#3a2a1e", "#122216", "#1c3222", "#30503a", "#9aa870"];
  const broadleaf = (x, y, hp, RAMP, fog, n) => {     // trunk, limbs and a crown of many lit leaf clumps
    const sd = LX < x ? -1 : 1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .03), ty = y - hp * .22;
    g += `<ellipse cx="${F(x + hp * .16)}" cy="${F(y + 1)}" rx="${F(hp * .32)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .55)},${F(ty)} L${F(x + tb * .55)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5a4a3a")}"/>`;
    g += `<path d="M${F(x - sd * tb * .1)},${F(y)} L${F(x - sd * tb * .1)},${F(ty)} L${F(x - sd * tb * .55)},${F(ty)} L${F(x - sd * tb)},${F(y)}Z" fill="${Tf("#3a2e24")}"/>`;
    for (let k = 0; k < 4; k++) { const a = -1.2 + k * .8 + (r() - .5) * .3; g += `<path d="M${F(x)},${F(ty + hp * .05)} L${F(x + Math.sin(a) * hp * .22)},${F(ty - Math.cos(a) * hp * .2)}" stroke="${Tf("#4a3c30")}" stroke-width="${F(Math.max(.8, tb * .5))}"/>`; }
    const cx = x, cy = y - hp * .56, rx = hp * .4, ry = hp * .36, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.026 + r() * .026)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx - sd * a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#cccLeafy)">${cg}</g>`; };
  /* a small far tree: a dark irregular mass with shaded, mid and lit clumps (lit on the left) */
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1e1008", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(48, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (x - px) + (y - sz * .5 - py) * .6, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };
  /* a fir: tiered, jagged branch layers, lit side and shaded side, a visible trunk */
  const conifer = (x, y, h, pal, fog = 0) => {
    const sd = LX < x ? -1 : 1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const trunk = Tf(pal[0]), dark = Tf(pal[1]), mid = Tf(pal[2]), lit = Tf(pal[3]), hl = Tf(pal[4]);
    if (h < 14) return `<path d="M${F(x)},${F(y - h)} L${F(x + h * .2)},${F(y - h * .1)} L${F(x - h * .2)},${F(y - h * .1)}Z" fill="${mid}"/><path d="M${F(x)},${F(y - h)} L${F(x + sd * h * .2)},${F(y - h * .1)} L${F(x)},${F(y - h * .12)}Z" fill="${lit}"/>`;
    const tw = Math.max(1.2, h * .035), th = h * .12;
    g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .5)},${F(y - h * .95)} L${F(x + tw * .5)},${F(y - h * .95)} L${F(x + tw)},${F(y)}Z" fill="${trunk}"/>`;
    const tiers = Math.max(3, Math.min(12, Math.round(h / 15))), top = y - h, bot = y - th, span = bot - top;
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - span * u * .9, ya = t === tiers - 1 ? top : Math.max(top, yb - span * (.3 - .1 * u)), wd = h * .24 * (1 - u * .8) * (.85 + r() * .3);
      const A = [x + (r() - .5) * wd * .08, ya], th2 = yb - ya, m = Math.max(2, Math.round(wd / 7)) * 2, edge = [];
      for (let k = 0; k <= m; k++) { const px = x - wd + 2 * wd * k / m, d = Math.abs(px - x) / wd;
        edge.push([px + (r() - .5) * wd * .06, yb + (k % 2 ? -th2 * (.12 + r() * .1) : d * th2 * .16 + r() * 2)]); }
      const Lm = [x - wd * .3, ya + th2 * .55], Rm = [x + wd * .3, ya + th2 * .55];
      g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mid}"/>`;
      const shade = sd < 0 ? [A, [x, yb - 2], ...edge.filter(p => p[0] > x), Rm] : [A, Lm, ...edge.filter(p => p[0] < x), [x, yb - 2]];
      g += `<path d="${poly(shade)}" fill="${dark}"/>`;
      const le = edge.filter(p => (p[0] - x) * sd > wd * .5); if (sd > 0) le.reverse();
      g += `<path d="${poly([A, sd < 0 ? Lm : Rm, ...le, [x + sd * wd * .38, yb - th2 * .3]])}" fill="${lit}"/>`;
      for (let k = 0; k < wd / 4; k++) { const py = ya + th2 * (.35 + r() * .6), lim = wd * (py - ya) / th2, px = x + (r() - .5) * 2 * lim * .9, s2 = px < x ? -1 : 1;
        g += `<path d="M${F(px)},${F(py)} l${F(s2 * 3)},${F(3.5 + r() * 3)}" stroke="${s2 === sd ? mix(lit, hl, .35) : mix(dark, "#000000", .3)}" stroke-width="1.1" opacity=".7"/>`; }
    }
    return g; };
  /* a Transylvanian haystack: a tall rounded cone of hay packed round a pole, lit from the left */
  const haystack = (px, py, kk, fog, o) => {
    const h = o.h * kk, wd = o.w * kk, Tf = c => T(mix(c, HZ, fog)), sd = LX < px ? -1 : 1;
    if (h < 4) return `<path d="M${F(px - wd / 2)},${F(py)} L${F(px)},${F(py - h)} L${F(px + wd / 2)},${F(py)}Z" fill="${Tf("#a88a48")}"/>`;
    const body = `M${F(px - wd / 2)},${F(py)} C${F(px - wd * .58)},${F(py - h * .45)} ${F(px - wd * .3)},${F(py - h * .82)} ${F(px)},${F(py - h)} C${F(px + wd * .3)},${F(py - h * .82)} ${F(px + wd * .58)},${F(py - h * .45)} ${F(px + wd / 2)},${F(py)}Z`;
    let g = `<path d="M${F(px)},${F(py)} L${F(px + wd * 1.5)},${F(py + h * .05)} L${F(px + wd * .4)},${F(py + h * .09)} L${F(px - wd * .45)},${F(py + 1)}Z" fill="#000" opacity=".25"/>`;
    g += `<path d="M${F(px)},${F(py - h * .98)} L${F(px + .03 * kk)},${F(py - h - .9 * kk)}" stroke="${Tf("#4a3a2a")}" stroke-width="${F(Math.max(1, .1 * kk))}" stroke-linecap="round"/>`;
    g += `<path d="${body}" fill="${Tf(o.c)}"/>`;
    g += `<path d="M${F(px)},${F(py - h)} C${F(px - sd * wd * .2)},${F(py - h * .6)} ${F(px - sd * wd * .1)},${F(py - h * .25)} ${F(px - sd * wd * .05)},${F(py)} L${F(px - sd * wd / 2)},${F(py)} C${F(px - sd * wd * .58)},${F(py - h * .45)} ${F(px - sd * wd * .3)},${F(py - h * .82)} ${F(px)},${F(py - h)}Z" fill="${Tf(mix(o.c, "#ffe6a0", .35))}" opacity=".85"/>`;
    g += `<path d="M${F(px)},${F(py - h)} C${F(px - sd * wd * .32)},${F(py - h * .8)} ${F(px - sd * wd * .55)},${F(py - h * .4)} ${F(px - sd * wd / 2)},${F(py)} L${F(px - sd * wd * .2)},${F(py)} C${F(px - sd * wd * .25)},${F(py - h * .4)} ${F(px - sd * wd * .15)},${F(py - h * .75)} ${F(px)},${F(py - h)}Z" fill="${Tf(mix(o.c, "#4a3014", .45))}" transform="scale(-1,1) translate(${F(-2 * px)},0)"/>`;
    if (h > 14) for (let i = 0; i < Math.min(40, h * .9); i++) { const t = rh(), yy = py - h * (.05 + rh() * .85), hw = wd / 2 * Math.sin(Math.acos(Math.min(1, (py - yy) / h))) * .95, xx = px + (t - .5) * 2 * hw;
      g += `<path d="M${F(xx)},${F(yy)} q${F((rh() - .5) * wd * .1)},${F(h * .06)} ${F((rh() - .5) * wd * .14)},${F(h * (.06 + rh() * .08))}" stroke="${Tf(rh() < .5 ? "#e8cc84" : "#7a5e2a")}" stroke-width="${F(Math.max(.6, kk * .05))}" fill="none" opacity=".7"/>`; }
    return g; };
  /* a wayside cross with its little shingled roof */
  const troita = (px, py, kk) => { const c = T("#5a4232"), lt = T("#8a6a4a"), roof = T("#4a3a32");
    return `<ellipse cx="${F(px + .8 * kk)}" cy="${F(py)}" rx="${F(.9 * kk)}" ry="${F(.12 * kk)}" fill="#000" opacity=".25"/>`
      + `<rect x="${F(px - .09 * kk)}" y="${F(py - 3.2 * kk)}" width="${F(.18 * kk)}" height="${F(3.2 * kk)}" fill="${c}"/><rect x="${F(px - .09 * kk)}" y="${F(py - 3.2 * kk)}" width="${F(.07 * kk)}" height="${F(3.2 * kk)}" fill="${lt}"/>`
      + `<rect x="${F(px - .75 * kk)}" y="${F(py - 2.5 * kk)}" width="${F(1.5 * kk)}" height="${F(.16 * kk)}" fill="${c}"/>`
      + `<path d="M${F(px - .95 * kk)},${F(py - 3.05 * kk)} L${F(px)},${F(py - 3.75 * kk)} L${F(px + .95 * kk)},${F(py - 3.05 * kk)} L${F(px + .8 * kk)},${F(py - 2.95 * kk)} L${F(px)},${F(py - 3.5 * kk)} L${F(px - .8 * kk)},${F(py - 2.95 * kk)}Z" fill="${roof}"/>`; };

  /* is the ground at (x, z) seen, or hidden behind nearer land? */
  const seen = (x, z) => { const y0 = sy(hT(x, z), z) - 1.5;
    for (let q = 14; q < z * .985; q += Math.max(.5, q * .012)) { const xq = x * q / z, hq = hT(xq, q); if (sy(hq, q) < y0) return false; }
    return true; };
  const used = []; const free = (x, z, R) => used.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);
  used.push([CX + 3, CZ, 26]);

  /* ---------- the castle: limewashed walls, terracotta roofs, on the crag top ---------- */
  const WALL = "#eee4d0", ROOF = "#b2522c", ROOF2 = "#9a4426", STONEC = "#9e968a";
  const at = (lx, lz) => toWorld(lx, lz);
  const winBox = (fc, Pf, hw, hd, rows, every) => {   // small deep-set windows on the box's four walls
    const sides = [[0, [-1, 0], [hw, 0], -hd, "z"], [1, [0, -1], [0, hd], hw, "x"], [3, [0, 1], [0, hd], -hw, "x"]];
    sides.forEach(([fi, , , off, ax]) => { const len = ax === "z" ? hw * 2 : hd * 2, n = Math.max(1, Math.floor(len / every));
      fc[fi].dec = fc[fi].dec || [];
      rows.forEach(v => { for (let k = 0; k < n; k++) { const u = -len / 2 + len * (k + .5) / n, lt = NIGHT && rv() < .7, hgt = v[1] - v[0];
        const q = (u0, u1, y0, y1, c, ex = {}) => fc[fi].dec.push({ P: (ax === "z" ? [[u0, y0, off - .06], [u1, y0, off - .06], [u1, y1, off - .06], [u0, y1, off - .06]]
          : [[off + Math.sign(off) * .06, y0, u0], [off + Math.sign(off) * .06, y0, u1], [off + Math.sign(off) * .06, y1, u1], [off + Math.sign(off) * .06, y1, u0]]).map(Pf), c, ...ex });
        q(u - .55, u + .55, v[0] - .15, v[1] + .15, "#c8bca4");
        q(u - .4, u + .4, v[0], v[1], lt ? LAMP : "#2e2c34", { glow: lt });
        if (!lt && hgt > 1) q(u - .4, u, v[0] + hgt * .5, v[1], "#8a96a8", { op: .3 }); } }); });
  };
  const roofCone = (x, z, y, r0, h, n, rot, c) => w.cyl({ x, z, y, r0, r1: 0, h, n, rot, c });
  const towerWins = (ob, n, r0, y0s, hgt) => {   // windows on the side faces of a round tower that face the camera
    const cx = ob.center[0], cz = ob.center[2];
    ob.faces.slice(0, n).forEach((Fc, i) => { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2;
      if (i % 2) return;
      Fc.dec = y0s.map(y0 => { const lt = NIGHT && rv() < .75, da = (a1 - a0) * .28, R = r0 + .05;
        const p = (a, y) => [cx + Math.cos(a) * R, y, cz + Math.sin(a) * R];
        return { P: [p(am - da, y0), p(am + da, y0), p(am + da, y0 + hgt), p(am - da, y0 + hgt)], c: lt ? LAMP : "#2e2c34", glow: lt }; }); }); };

  // the hall: a hipped block across the top of the rock
  const [hx, hz] = at(3, 1);
  const hall = w.house({ x: hx, z: hz, y: CG, fy: -.4, yaw: CYAW, roof3: "hip", w: 20, d: 12, h: 10.5, rh: 6.8, ov: .7,
    wall: WALL, roof: ROOF, trim: "#d8ccb4", stone: STONEC, clap: false, door: false, winGap: 2.9, winTall: .8, rng: rv, chim: .8, chimC: "#d8ccb4" });
  // the lower east wing stepping down the rock
  const [ex, ez] = at(16.5, -5);
  const wing = w.house({ x: ex, z: ez, y: CG, fy: -.4, yaw: CYAW, roof3: "gable", gable: true, w: 7.5, d: 8, h: 6.5, rh: 4.6, ov: .5,
    wall: "#e8dcc4", roof: ROOF2, trim: "#d8ccb4", stone: STONEC, clap: false, door: false, winGap: 2.6, rng: rv });
  wing.key = hall.key - .2;
  // the round tower on the south-east corner
  const [rx2, rz2] = at(12, -6.5);
  const rtw = w.cyl({ x: rx2, z: rz2, y: CG - .3, r0: 3.7, h: 16.3, n: 20, c: WALL }); rtw.key = wing.key - .2;
  towerWins(rtw, 20, 3.7, [CG + 5.5, CG + 9.5, CG + 13], 1.3);
  w.cyl({ x: rx2, z: rz2, y: CG + 15.6, r0: 4.05, h: .4, n: 20, c: "#d8ccb4" }).key = rtw.key - .05;
  roofCone(rx2, rz2, CG + 16, 4.5, 8.5, 20, 0, ROOF).key = rtw.key - .1;
  // the tall square keep on the west, with a steep pyramid roof and a gallery of windows under it
  const [kx, kz] = at(-9.5, -3.5), KY = CG - .3, KH = 20, yr = CYAW * Math.PI / 180;
  const keep = w.box({ x: kx, z: kz, y: KY, yaw: CYAW, w: 7.4, d: 7.4, h: KH, c: WALL, top: ROOF,
    dec: (fc, Pf) => winBox(fc, Pf, 3.7, 3.7, [[6, 7.3], [10.5, 11.8], [15, 16.3], [18, 19]], 1.9) });
  keep.key = hall.key - .4;
  w.box({ x: kx, z: kz, y: KY + KH - .3, yaw: CYAW, w: 8.4, d: 8.4, h: .45, c: "#d8ccb4" }).key = keep.key - .05;
  roofCone(kx, kz, KY + KH, 6.2, 9.5, 4, Math.PI / 4 + yr, ROOF).key = keep.key - .1;
  // the slim stair turret behind the hall, rising above it
  const [tx, tz] = at(-1, 6);
  const tur = w.cyl({ x: tx, z: tz, y: CG, r0: 2.3, h: 22, n: 14, c: WALL }); tur.key = hall.key + .5;
  towerWins(tur, 14, 2.3, [CG + 17.5], 1);
  roofCone(tx, tz, CG + 22, 3, 7.5, 14, 0, ROOF2).key = tur.key - .1;
  // a small corner bartizan on the hall's west front
  const [bx, bz] = at(-6.5, -5.5);
  const bar = w.cyl({ x: bx, z: bz, y: CG + 6, r0: 1.4, h: 6.5, n: 12, c: WALL }); bar.key = keep.key + .2;
  roofCone(bx, bz, CG + 12.5, 1.8, 4.2, 12, 0, ROOF).key = bar.key - .1;
  // the curtain wall along the front of the rock, with the gate
  const [gx, gz] = at(1.5, -8.2);
  const gate = w.box({ x: gx, z: gz, y: CG - .3, yaw: CYAW, w: 11.5, d: 1.2, h: 4.8, c: "#e6dcc6", top: ROOF2,
    dec: (fc, Pf) => { fc[0].dec = [
      { P: [[-1.1, 0, -.66], [1.1, 0, -.66], [1.1, 2.8, -.66], [-1.1, 2.8, -.66]].map(Pf), c: NIGHT ? "#e09040" : "#3a2a22", glow: NIGHT },
      { P: [[-1.1, 2.8, -.66], [1.1, 2.8, -.66], [.6, 3.4, -.66], [-.6, 3.4, -.66]].map(Pf), c: NIGHT ? "#e09040" : "#3a2a22", glow: NIGHT },
      ...[-4.2, -2.6, 2.6, 4.2].map(u => ({ P: [[u - .12, 3.3, -.66], [u + .12, 3.3, -.66], [u + .12, 4.2, -.66], [u - .12, 4.2, -.66]].map(Pf), c: "#2e2c34" })) ]; } });
  gate.key = keep.key - .3;
  if (NIGHT) { const [px, py] = w.proj([CX, CG - 10, CZ - 22]);   // floodlight washing the rock and the walls
    w.sprite({ x: CX, z: CZ - 40, y: 0, bias: 30, fn: () => `<ellipse cx="${F(px)}" cy="${F(py - 40)}" rx="300" ry="190" fill="url(#cccGlow)" opacity=".28"/>` }); }

  /* ---------- the village: limewashed houses with steep roofs, along the valley edges ---------- */
  const HW = ["#efe8d8", "#e6d2a2", "#c8d4dc", "#e8c8b8", "#f2eee4", "#d8c49a", "#b8c8b0"], HR = ["#a8502e", "#8e3e26", "#5a4a42", "#b46a3a", "#6a3a2a", "#4a4448"];
  const homes = [];
  for (let k = 0, n = 0; k < 600 && n < 26; k++) {
    const left = rl() < .55, z = 95 + rl() * 230, u = left ? -.62 + rl() * .42 : .2 + rl() * .45, x = u * z;
    if (Math.abs(u - CU) < .17 || !free(x, z, 9) || Math.abs(x - pathX(z)) < 9 || !isField(x, z)) continue;
    const o = w.randomHouse(rl, { x, z, y: hT(x, z), fy: -.8, yaw: (left ? 1 : -1) * (8 + rl() * 18) + (rl() - .5) * 10, kind: rl() < .3 ? "farm" : "cottage" });
    o.wall = HW[Math.floor(rl() * HW.length)]; o.roof = HR[Math.floor(rl() * HR.length)]; o.rh = Math.max(o.rh, 3.4 + rl() * 1.6); o.clap = false; o.porch = false;
    if (o.roof3 === "shed") o.roof3 = "gable";
    homes.push(o); used.push([x, z, Math.max(o.w, o.d) * .7]); n++; }
  homes.forEach(o => w.house(o));
  // a wooden barn or two with plank walls
  [[-70, 120, 22], [96, 205, -18]].forEach(([x, z, yaw]) => { if (!free(x, z, 7)) return; used.push([x, z, 8]);
    w.house({ x, z, y: hT(x, z), fy: -.5, yaw, w: 11, d: 8, h: 4.2, rh: 4.4, roof3: "gable", wall: "#6e5038", roof: "#5a4a42", trim: "#5e4430", winGap: 4, door: .3, doorC: "#3a2a1e", rng: rl }); });

  /* ---------- haystacks in the strip fields, a wayside cross and fences by the lane ---------- */
  for (let k = 0, n = 0; k < 900 && n < 70; k++) { const z = 22 + Math.pow(rh(), 1.2) * 420, x = (rh() - .5) * z * 1.3;
    if (!isField(x, z) || !free(x, z, 1.8) || Math.abs(x - pathX(z)) < 4) continue;
    if (z > 200 && !seen(x, z)) continue; n++; used.push([x, z, 1.4]);
    const o = { h: 3.4 + rh() * 1.6, w: 2.4 + rh() * .8, c: ["#b89a52", "#a88a46", "#c4a65e", "#9a8048"][Math.floor(rh() * 4)] };
    w.sprite({ x, z, y: hT(x, z) - .05, fn: (px, py, kk, fog) => haystack(px, py, kk, fog, o) }); }
  { const z = 30, x = pathX(z) + 3.2; used.push([x, z, 1]); w.sprite({ x, z, y: hT(x, z), fn: (px, py, kk) => troita(px, py, kk) }); }
  for (const sd of [-1, 1]) { let prev = null;
    for (let z = 16; z < 120; z += 2.6) { const x = pathX(z) + sd * 3.4, y = hT(x, z);
      if (!free(x, z, .6)) { prev = null; continue; }
      w.line([[x, y, z], [x, y + 1.3, z]], "#5a4636", .12, { min: .8 });
      if (prev) { w.line([[prev[0], prev[1] + 1.1, prev[2]], [x, y + 1.1, z]], "#7a6248", .07, { min: .6 }); w.line([[prev[0], prev[1] + .6, prev[2]], [x, y + .6, z]], "#6a5440", .07, { min: .6 }); }
      prev = [x, y, z]; } }

  /* ---------- trees: orchards by the houses, the wooded crag, the hills ---------- */
  const near = [[-58, 150, 9, WALNUT], [-104, 182, 10, BEECH], [74, 150, 8, MAPLE], [128, 236, 11, WALNUT], [-30, 210, 8, OAK], [46, 112, 7, BEECH], [-140, 260, 10, MAPLE]];
  near.forEach(([x, z, hM, RAMP]) => { if (!free(x, z, 3)) return; const y0 = hT(x, z); used.push([x, z, 3]);
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => broadleaf(px, py, hM * kk, RAMP, fog, Math.min(230, Math.round(hM * kk * .7))) }); });
  for (let k = 0, n = 0; k < 4000 && n < 120; k++) { const z = 90 + rl() * 260, x = (rl() - .5) * z * 1.4;   // orchard and yard trees
    if (!isField(x, z) || !free(x, z, 2.5) || Math.abs(x - pathX(z)) < 4 || Math.abs(x / z - CU) < .16) continue;
    if (!homes.some(o => Math.hypot(o.x - x, o.z - z) < 26)) continue; n++; used.push([x, z, 1.8]);
    const hM = 4 + rl() * 4, q = rl(), RAMP = q < .3 ? BEECH : q < .55 ? WALNUT : q < .75 ? MAPLE : OAK;
    w.sprite({ x, z, y: hT(x, z) - .2, fn: (px, py, kk, fog) => hM * kk > 45 ? broadleaf(px, py, hM * kk, RAMP, fog, Math.min(140, Math.round(hM * kk * .6))) : `<g filter="url(#cccLeafy)">${clump(px, py, Math.max(2.5, hM * kk), fog, RAMP)}</g>` }); }
  // the wooded skirts of the crag, with firs, kept below the castle
  for (let k = 0, n = 0; k < 9000 && n < 220; k++) { const x = CX + 3 + (rl() - .5) * 110, z = CZ - 40 + rl() * 60, d = cragD(x, z), y0 = hT(x, z);
    if (d < .8 || d > 1.7 || y0 > CG - 15 || !free(x, z, .8) || !seen(x, z)) continue;
    const top = sy(y0, z) - (sy(CG - 2, CZ - 10)); if (top < 30) continue; n++;
    const fir = rl() < .35, hM = Math.min(5 + rl() * 7, top * z / FL * .8), q = rl(), RAMP = q < .35 ? BEECH : q < .6 ? MAPLE : q < .8 ? OAK : WALNUT;
    w.sprite({ x, z, y: y0 - .3, fn: (px, py, kk, fog) => fir ? `<g filter="url(#cccLeafy)">${conifer(px, py, hM * kk, FIRC, fog)}</g>` : `<g filter="url(#cccLeafy)">${clump(px, py, Math.max(2.5, hM * kk), fog, RAMP)}</g>` }); }
  // shrubs, young beeches and firs clinging to ledges on the cliff face
  for (let k = 0, n = 0; k < 6000 && n < 70; k++) { const x = CX + 3 + (rl() - .5) * 80, z = CZ - 30 + rl() * 30, y0 = crag(x, z), [lx, lz] = toLocal(x, z);
    if (y0 < 10 || y0 > CG - 3 || !seen(x, z) || (Math.abs(lx - 3.5) < 18.5 && Math.abs(lz + 1) < 10.5)) continue; n++;
    const fir = rl() < .3, hM = 1.2 + rl() * 2.6, q = rl(), RAMP = q < .4 ? BEECH : q < .65 ? OAK : q < .85 ? MAPLE : WALNUT;
    w.sprite({ x, z, y: y0 - .15, fn: (px, py, kk, fog) => `<g filter="url(#cccLeafy)">${fir ? conifer(px, py, hM * kk * 1.4, FIRC, fog) : clump(px, py, Math.max(2.5, hM * kk), fog, RAMP)}</g>` }); }
  // the beech and fir woods over the hills
  for (let k = 0, n = 0; k < 60000 && n < 3600; k++) { const z = 340 + Math.pow(r(), 2) * 2300, u = (r() - .5) * 1.4, x = u * z;
    if (isField(x, z) || cragD(x, z) < 1.7 || !free(x, z, 1.2) || !seen(x, z)) continue; n++;
    const y0 = hT(x, z), room = (sy(y0, z) - (yLim(x / z) + 10)) * z / FL; if (room < 2) continue;
    const fir = r() < (z > 1200 ? .45 : .25), hM = Math.max(3, Math.min(9 + r() * 8, room)), q = r(), RAMP = q < .4 ? BEECH : q < .6 ? MAPLE : q < .8 ? WALNUT : OAK;
    w.sprite({ x, z, y: y0 - .5, fn: (px, py, kk, fog) => fir ? (hM * kk > 22 ? conifer(px, py, hM * kk, FIRC, fog * .9) : clump(px, py, Math.max(2.5, hM * kk * .8), fog * .9, ["#0e1a12", "#142418", "#1c3222", "#24402a", "#2e4c32", "#3e5e3e", "#5a7a4a", "#8a9a68"]))
      : hM * kk > 30 ? `<g filter="url(#cccLeafy)">${clump(px, py, hM * kk, fog * .9, RAMP)}</g>` : clump(px, py, Math.max(2.5, hM * kk), fog * .9, RAMP) }); }
  // hedgerows of trees along a few field boundaries
  for (let k = 0, n = 0; k < 6000 && n < 300; k++) { const z = 180 + rh() * 380, b = Math.floor(rh() * 9), u0 = (b - 4) * 4.1 + .5, x = (u0 * 13 - z * .34) / .94;
    if (!isField(x, z) || !free(x, z, 1) || Math.abs(x / z - CU) < .13) continue; if (!seen(x, z)) continue; n++;
    const hM = 3 + rh() * 5, q = rh(), RAMP = q < .4 ? OAK : q < .7 ? BEECH : MAPLE;
    w.sprite({ x, z, y: hT(x, z) - .3, fn: (px, py, kk, fog) => `<g filter="url(#cccLeafy)">${clump(px, py, Math.max(2.5, hM * kk), fog, RAMP)}</g>` }); }

  /* ---------------- assemble: the land, haze and valley mist, then everything on it ---------------- */
  const isR = o => o.raster, notR = o => !o.raster;
  s += w.draw({ where: isR });
  s += `<rect x="0" y="300" width="${W}" height="130" fill="url(#cccHaze)" opacity=".3"/>`;
  s += `<g filter="url(#cccMist)" opacity="${NIGHT ? .5 : .55}">`;
  for (let k = 0; k < 24; k++) { const x = r() * W, y = 400 + r() * 40, rx = 140 + r() * 300;
    if (x > 1000 && x < 1650 && y < 420) continue;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(rx)}" ry="${F(4 + r() * 8)}" fill="${NIGHT ? "#6e76a8" : "#fbeedc"}" opacity="${F(.25 + r() * .35)}"/>`; }
  s += `</g>`;
  s += w.draw({ where: notR });
  if (NIGHT) {   // mist lying along the valley floor
    s += `<g filter="url(#cccMist)" opacity=".38">`;
    for (let k = 0; k < 26; k++) { const x = r() * W, y = 470 + r() * 60, rx = 140 + r() * 300;
      s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(rx)}" ry="${F(5 + r() * 9)}" fill="#7e86b8" opacity="${F(.2 + r() * .3)}"/>`; }
    s += `</g>`;
  }
  // long autumn grass along the bottom edge
  { let g = "";
    for (let i = 0; i < 240; i++) { const x = r() * W, y = 700 + r() * 30, hh = 40 + r() * 80, bend = (r() - .5) * 36;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(["#7a7a3a", "#a09048", "#5e6a32", "#b8a058"][Math.floor(r() * 4)])}" stroke-width="${F(1.5 + r() * 2)}" fill="none" stroke-linecap="round"/>`; }
    s += g; }

  s += `<rect width="${W}" height="${H}" fill="url(#cccLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#cccPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
