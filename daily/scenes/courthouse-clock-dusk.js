/* Courthouse clock, the evening the clocks go back (Nov 1). An Ohio county seat's
   courthouse square seen corner-on from the far sidewalk: the sandstone courthouse
   (rusticated base, arched windows between pilasters, a pedimented portico on a
   grand stair) and its tower, a clock on all four faces under a verdigris copper
   dome, lantern and gilt finial. The lawn is strewn with leaves; the maples are
   half bare and gold, the oaks bronze. Brick Italianate shop rows run away along
   the side street on the right and close the back of the square, a brick church
   spire rises behind on the left, and woods line the far edge of town.
   Day: low sun off the left edge at ten past four, gold light, long shadows.
   opts.time === "night": twenty-five to six, the first dark evening of standard
   time: a moonless sky with stars, an afterglow low in the west (left), clock
   faces lit, the courthouse floodlit, shop windows and lamps on.
   Built with world3d() (reference/scene-helpers.js); the square is laid out in its
   own (u, v) grid turned 22 degrees to the camera, so streets and rows recede.
   Needs rng(), mix(), world3d(), mountainField(), mountainColor(), rgbTone().
   opts.part = "sky" | "clouds" | "land".                                    */
function courthouseClockDuskArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1101;
  const r = rng(seed), rs = rng(seed + 3), rg = rng(seed + 11), rb = rng(seed + 23), rl = rng(seed + 37);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const WY = 470, EYE = 1.7, FL = 1650;
  const LX = NIGHT ? -120 : -220, LY = NIGHT ? 470 : 300;
  const T = c => NIGHT ? mix(mix(c, "#6a7090", .45), "#0a0e2a", .58) : c;
  const HZ = NIGHT ? "#2c3256" : "#ead8bc", RIM = NIGHT ? "#a8b0d8" : "#fff0c8", SHADE = NIGHT ? "#04060e" : "#2e2c44", LAMP = "#ffc46a";
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

  /* ---------------- sky: late gold afternoon, or the first dark evening ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#050822"/><stop offset=".45" stop-color="#101a48"/><stop offset=".78" stop-color="#2a3a6e"/><stop offset=".93" stop-color="#4a4c78"/><stop offset="1" stop-color="#6a5674"/>`
    : `<stop offset="0" stop-color="#4a78b0"/><stop offset=".38" stop-color="#7ea2c8"/><stop offset=".7" stop-color="#c8cccc"/><stop offset=".88" stop-color="#ecd8b4"/><stop offset="1" stop-color="#f6d6a0"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#ff9a5a" stop-opacity=".55"/><stop offset=".25" stop-color="#e07a6a" stop-opacity=".25"/><stop offset=".6" stop-color="#8a6a9a" stop-opacity=".08"/><stop offset="1" stop-color="#8a6a9a" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff4d0" stop-opacity=".8"/><stop offset=".2" stop-color="#ffd890" stop-opacity=".4"/><stop offset=".55" stop-color="#ffc878" stop-opacity=".14"/><stop offset="1" stop-color="#ffc878" stop-opacity="0"/>`;
  let s = `<defs id="ccdefs">
    <linearGradient id="ccSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="ccLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 1300 : 1900}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="ccHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".8"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="ccGlow"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".4"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="ccWarm"><stop offset="0" stop-color="#ffbe6a" stop-opacity=".55"/><stop offset=".5" stop-color="#ff9e48" stop-opacity=".18"/><stop offset="1" stop-color="#ff9e48" stop-opacity="0"/></radialGradient>
    <radialGradient id="ccFlood"><stop offset="0" stop-color="#ffc878" stop-opacity=".3"/><stop offset=".55" stop-color="#ffb860" stop-opacity=".1"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></radialGradient>
    <radialGradient id="ccClockG"><stop offset="0" stop-color="#fff6d8" stop-opacity=".8"/><stop offset=".35" stop-color="#ffe6a8" stop-opacity=".3"/><stop offset="1" stop-color="#ffe6a8" stop-opacity="0"/></radialGradient>
    <filter id="ccLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".14" numOctaves="2" seed="29" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ccTwig" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".3" numOctaves="2" seed="13" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ccCloudy" x="-20%" y="-60%" width="140%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".012 .032" numOctaves="3" seed="47" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.4"/></filter>
    <filter id="ccPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="19"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="ccSoft"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#ccSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 760; i++) { const x = rs() * W, y = Math.pow(rs(), 1.35) * 420, big = rs() < .05;
      const glowK = 1 - sm(1 - Math.hypot(x - LX, (y - LY) * 2.2) / 1300);   // the afterglow drowns the stars low in the west
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8eeff"}" opacity="${F((.25 + rs() * .55) * (1 - y / 450) * glowK)}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#ccLight)"/>`;
    // one bright star high in the east (right), first to show at dusk
    s += `<circle cx="2050" cy="150" r="2.6" fill="#fff6e0"/><circle cx="2050" cy="150" r="9" fill="#fff6e0" opacity=".12"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#ccLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#ccSoft)">`;
    for (let k = 0; k < 7; k++) { const a = -.14 + k * .05, L = 2700;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .018) * L)},${F(LY + Math.sin(a - .018) * L)} L${F(LX + Math.cos(a + .018) * L)},${F(LY + Math.sin(a + .018) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a broken stratocumulus deck, lit gold (day) or pink from the afterglow (night) ---------------- */
  const roll = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#ccCloudy)">`;
    const n = 7 + Math.floor(rs() * 4), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.05 + rs() * .05) * (1 - Math.abs(t - .5) * .8);
      lobes.push([x + (t - .5) * w, y - R * (.2 + rs() * .4), R]); }
    const dimK = cl(x / W);
    if (NIGHT) {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.9)}" ry="${F(R * .55)}" fill="${mix("#3a3458", "#1a2248", dimK)}"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .4)}" cy="${F(ly + R * .3)}" rx="${F(R * 1.2)}" ry="${F(R * .18)}" fill="${mix("#e08a7a", "#4a4a7a", dimK)}" opacity="${F(.75 - dimK * .5)}"/>`);
    } else {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .1)}" rx="${F(R * 2)}" ry="${F(R * .62)}" fill="${mix("#aca4b0", "#9a9cae", dimK)}"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .1)}" cy="${F(ly - R * .08)}" rx="${F(R * 1.7)}" ry="${F(R * .48)}" fill="${mix("#e8dcd0", "#d4d6de", dimK)}"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .5)}" cy="${F(ly + R * .26)}" rx="${F(R * 1.2)}" ry="${F(R * .2)}" fill="${mix("#ffd088", "#f0dcc0", dimK)}" opacity=".85"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly - R * .3)}" rx="${F(R * .9)}" ry="${F(R * .2)}" fill="#fbf4ea" opacity=".7"/>`);
    }
    return c + `</g></g>`;
  };
  s += `<g opacity="${NIGHT ? .75 : .9}">` + roll(420, 250, 640, "drift2") + roll(1060, 120, 460, "drift3") + roll(1760, 190, 600, "drift2") +
    roll(2300, 300, 520, "drift3") + roll(2420, 90, 340, "drift2") + roll(180, 110, 360, "drift3") + roll(1500, 330, 380, "drift2") + `</g>`;
  if (!NIGHT) {   // starlings heading to roost
    s += `<g class="birds" fill="none" stroke="#2a2830" stroke-width="1.8" stroke-linecap="round" opacity=".7">`;
    for (let i = 0; i < 14; i++) { const x = 900 + rs() * 220, y = 170 + rs() * 60, k = .6 + rs() * .4;
      s += `<path d="M${F(x - 7 * k)},${F(y - 1)} q${F(3.5 * k)},${F(-4 * k)} ${F(7 * k)},${F(1.2)} q${F(3.5 * k)},${F(-4 * k)} ${F(7 * k)},${F(-1.2)}"/>`; }
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     World metres: x right, y up, z away; camera at the origin, eye 1.7 m.
     The square has its own grid (u along the courthouse front, v toward its back),
     centred on the courthouse at world (4, 124) and turned 22 degrees.
     Lawn u -60..60, v -95..55; streets 10 m wide outside it; shop rows beyond.   */
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [.35, .6, -.55] : [-.78, .36, -.4], tone: T, fog: HZ, fogK: NIGHT ? .0024 : .0019,
    shadow: SHADE, rim: RIM, shade: .5, hi: .26, night: NIGHT, lamp: LAMP });
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const fogC = (c, fog) => T(mix(c, HZ, fog));
  const pr = (x, z, y = 0) => w.proj([x, y, z]);
  const gC = (c, z) => T(mix(c, HZ, w.fogAt(z)));
  const YAW = 22, A = YAW * Math.PI / 180, CA = Math.cos(A), SA = Math.sin(A), PX = 4, PZ = 124;
  const SQ = (u, v) => [PX + u * CA - v * SA, PZ + u * SA + v * CA];
  const capY = px => 250 - 175 * sm((px - 860) / 170) * sm((1560 - px) / 170);
  const room = (x, z) => (sy(0, z) - capY(sx(x, z))) * z / FL;

  /* ---------- far woods and a low rise beyond town ---------- */
  const hillH = mountainField({ seed: 1101, scale: 1400, oct: 7, warp: .3, peaks: [
    { x: -1800, z: 2600, h: 90, rx: 1600, rz: 800 }, { x: 900, z: 3200, h: 120, rx: 1700, rz: 900 }, { x: 3200, z: 2900, h: 80, rx: 1400, rz: 700 } ] });
  w.raster({ z0: 700, z1: 7000, top: 300, bottom: WY + 6, h: hillH,
    col: mountainColor({ seed: 67, tree: 900, forest: NIGHT ? "#4a4458" : "#6e5a56", gold: "#a8784a", goldK: .5, grass: "#9a9060", rock: "#7a7068", rock2: "#5a524e" }),
    tone: rgbTone(T), fog: HZ, fogK: .0005, step: .0024, scale: .5, tag: "far" });

  /* ---------- the ground: grass bands, the streets, sidewalks and paths ---------- */
  let G = "";
  { const zs = Array.from({ length: 46 }, (_, i) => 3 * Math.pow(900 / 3, i / 45));
    for (let i = zs.length - 1; i > 0; i--) { const z0 = zs[i - 1], z1 = zs[i], c = z1 < 40 ? "#6e7840" : z1 < 120 ? "#7e844a" : "#948e5c";
      G += `<rect x="0" y="${F(sy(0, z1) - .5)}" width="${W}" height="${F(sy(0, z0) - sy(0, z1) + 1)}" fill="${gC(c, (z0 + z1) / 2)}"/>`; } }
  // a strip of width wd along a polyline given in square coordinates; points nearer than 3 m are dropped
  const strip = (uv, wd, cf) => { let g = ""; const pts = uv.map(([u, v]) => SQ(u, v)).filter(p => p[1] > 3);
    for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), nx = -dz / L * wd / 2, nz = dx / L * wd / 2;
      if (z0 - Math.abs(nz) < 2.5 || z1 - Math.abs(nz) < 2.5) continue;
      g += `<path d="${pathP([pr(x0 + nx, z0 + nz), pr(x0 - nx, z0 - nz), pr(x1 - nx, z1 - nz), pr(x1 + nx, z1 + nz)])}" fill="${cf((z0 + z1) / 2)}" stroke="${cf((z0 + z1) / 2)}" stroke-width=".6"/>`; }
    return g; };
  const line = (u0, v0, u1, v1, n) => Array.from({ length: n + 1 }, (_, i) => [u0 + (u1 - u0) * i / n, v0 + (v1 - v0) * i / n]);
  const ASPH = z => gC("#5c5a60", z), WALK = z => gC("#b8a08a", z), CURB = z => gC("#c8c2b4", z), PATH = z => gC("#d2c6aa", z);
  // sidewalks round the lawn, then the streets outside them
  G += strip(line(-64, -99, 64, -99, 60), 8, WALK) + strip(line(-64, 59, 64, 59, 40), 8, WALK);
  G += strip(line(-64, -103, -64, 63, 60), 8, WALK) + strip(line(64, -103, 64, 63, 60), 8, WALK);
  G += strip(line(-150, -108, 300, -108, 120), 10, ASPH) + strip(line(-150, 68, 300, 68, 80), 10, ASPH);
  G += strip(line(-73, -300, -73, 200, 120), 10, ASPH) + strip(line(73, -300, 73, 200, 120), 10, ASPH);
  G += strip(line(-150, -103.2, 300, -103.2, 120), .35, CURB) + strip(line(68.2, -100, 68.2, 63, 60), .35, CURB) + strip(line(-68.2, -100, -68.2, 63, 60), .35, CURB);
  // crosswalk stripes on the right side street
  for (let k = 0; k < 9; k++) { const u = 68.6 + k * 1.05; G += strip([[u, -96], [u, -100]], .5, z => gC("#e8e6e0", z)); }
  // walks across the lawn: straight up to the stair, and two diagonals from the corners
  G += strip(line(0, -95, 0, -21, 30), 3.4, PATH) + strip(line(-60, -95, -9, -24, 30), 2.2, PATH) + strip(line(60, -95, 9, -24, 30), 2.2, PATH);
  G += strip(line(-30, -16, 30, -16, 20), 2.6, PATH);
  // tar seams and worn patches on the asphalt
  for (let i = 0; i < 300; i++) { const q = rg(); let u, v;
    if (q < .45) { u = -70 + rg() * 260; v = -108 + (rg() - .5) * 8.6; } else { u = (rg() < .5 ? -73 : 73) + (rg() - .5) * 8.6; v = -100 + rg() * 160; }
    const [x, z] = SQ(u, v); if (z < 6) continue; const p = pr(x, z), k = FL / z; if (p[0] < -40 || p[0] > W + 40) continue; const rx = (.1 + rg() * .5) * k;
    G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(Math.max(.4, rx * EYE / z * 1.3))}" fill="${gC(rg() < .5 ? "#4a484e" : "#727078", z)}" opacity="${F(.3 + rg() * .4)}"/>`; }
  // lawn mottling
  for (let i = 0; i < 300; i++) { const u = -58 + rg() * 116, v = -93 + rg() * 146, [x, z] = SQ(u, v); if (z < 6) continue; const p = pr(x, z), k = FL / z, rx = (1.2 + rg() * 3) * k;
    G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(rx * EYE / z * 1.5)}" fill="${gC(rg() < .5 ? "#62703a" : rg() < .5 ? "#9a945a" : "#8a8e50", z)}" opacity=".4"/>`; }
  // fallen leaves: thick under the trees and along the curbs, scattered elsewhere
  const LEAF = ["#8a3a1a", "#b0501e", "#c8702a", "#dc9634", "#e8b448", "#9a6a2a", "#7a4a24", "#c84a22"];
  const leafAt = (x, z, rx0) => { if (z < 4) return ""; const p = pr(x, z), k = FL / z; if (p[0] < -10 || p[0] > W + 10) return "";
    const rx = Math.max(.6, (rx0 || .04 + rl() * .035) * k), a = (rl() - .5) * 50;
    return `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(Math.max(.4, rx * (.22 + rl() * .14)))}" fill="${gC(LEAF[Math.floor(rl() * LEAF.length)], z)}" transform="rotate(${F(a)} ${F(p[0])} ${F(p[1])})" opacity=".88"/>`; };
  const LAWN_TREES = [[-56, -50, 15, "maple"], [40, -66, 14, "maple"], [-48, -18, 16, "oak"], [50, -22, 15, "maple"], [-44, 30, 15, "maple"], [46, 34, 14, "oak"],
    [-22, 44, 13, "elm"], [24, 46, 14, "maple"], [-52, -84, 12, "maple"], [18, -80, 12, "maple"]];
  for (let i = 0; i < 2400; i++) { const q = rl(); let u, v;
    if (q < .45) { const t = LAWN_TREES[Math.floor(rl() * LAWN_TREES.length)], a = rl() * Math.PI * 2, d = Math.pow(rl(), .7) * 9; u = t[0] + Math.cos(a) * d; v = t[1] + Math.sin(a) * d; }
    else if (q < .6) { u = -59.5 + rl() * .9; v = -95 + rl() * 150; } else if (q < .72) { u = -60 + rl() * 120; v = -94.6 - rl() * .6; }
    else { u = -60 + rl() * 120; v = -95 + rl() * 150; }
    const [x, z] = SQ(u, v); G += leafAt(x, z); }
  // grass blades on the near lawn (mostly under the cards)
  for (let i = 0; i < 2200; i++) { const u = -60 + rg() * 120, v = -95 + Math.pow(rg(), 1.8) * 50, [x, z] = SQ(u, v); if (z < 5) continue;
    const p = pr(x, z), k = FL / z; if (p[0] < -10 || p[0] > W + 10) continue;
    const L = (.05 + rg() * .07) * k, bend = (rg() - .5) * L * .8;
    G += `<path d="M${F(p[0])},${F(p[1])} q${F(bend * .3)},${F(-L * .5)} ${F(bend)},${F(-L)}" stroke="${gC(rg() < .4 ? "#56622e" : rg() < .5 ? "#8e8c4c" : "#a8a060", z)}" stroke-width="${F(Math.max(.8, L * .09))}" fill="none" stroke-linecap="round"/>`; }

  /* ---------- trees, painterly, standing at world points ---------- */
  const BARK = ["#2e2626", "#3e3434", "#54484a", "#6e6260", "#8e807a", "#b0a294"];
  const OAKB = ["#3a1e10", "#5a2e14", "#7a401a", "#965424", "#ae6a30", "#c4843e", "#d8a05a", "#e8bc7c"];
  const MAPL = ["#6a2410", "#8e3a14", "#b2561a", "#cc7420", "#e09430", "#ecb240", "#f4cc5e", "#fae08a"];
  const ELMG = ["#5a4a1a", "#7a6a22", "#9a8a2e", "#b4a23a", "#c8b84e", "#dccc66", "#e8dc84", "#f2eaa4"];
  const PINE = ["#141c18", "#1c2820", "#24342a", "#2e4232", "#3a523a", "#4a6446", "#5e7a54"];
  const lightDir = NIGHT ? [.3, -.6] : [-.85, -.35];
  /* a deciduous tree half way through dropping its leaves: recursive limbs, twig haze, leaf clusters on the outer twigs */
  const autumnTree = (px, py, hp, fog, rr, kind) => {
    const C = c => T(mix(c, HZ, fog)), B = BARK.map(C), RAMP = kind === "oak" ? OAKB : kind === "elm" ? ELMG : MAPL;
    const keep = kind === "oak" ? .8 : kind === "elm" ? .45 : .6;
    let g = `<ellipse cx="${F(px + (NIGHT ? 0 : hp * .5))}" cy="${F(py)}" rx="${F(hp * (NIGHT ? .3 : .62))}" ry="${F(Math.max(1, hp * .028))}" fill="#000" opacity=".2"/>`;
    const cfg = { elm: { tr: .3, sp: .42, up: .55, sh: .74, n0: 4 }, maple: { tr: .32, sp: .62, up: .3, sh: .7, n0: 3 }, oak: { tr: .27, sp: .85, up: .1, sh: .7, n0: 3 } }[kind];
    if (hp < 60) {   // far: a soft crown with a few limbs showing
      const rx = hp * (kind === "elm" ? .42 : .37), ry = hp * .36, cy = py - hp * .6;
      g += `<path d="M${F(px - hp * .02)},${F(py)} L${F(px)},${F(cy + ry * .3)} L${F(px + hp * .02)},${F(py)}Z" fill="${B[1]}"/>`;
      g += `<g filter="url(#ccTwig)"><path d="${blobP(px, cy, rx, ry, 9, rr)}" fill="${C(mix(RAMP[2], "#6a5a5a", .3))}" opacity=".92"/>`;
      g += `<path d="${blobP(px + lightDir[0] * rx * .3, cy + lightDir[1] * ry * .35, rx * .62, ry * .55, 8, rr)}" fill="${C(RAMP[5])}" opacity=".6"/></g>`;
      return g; }
    const segs = [], tips = [], maxD = hp > 260 ? 6 : hp > 140 ? 5 : 4;
    const grow = (x, y, a, L, wd, d) => {
      const bend = (rr() - .5) * .25, x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L;
      segs.push([x, y, x + Math.cos(a + bend) * L * .5, y + Math.sin(a + bend) * L * .5, x2, y2, wd, d]);
      if (d >= maxD) { tips.push([x2, y2, a]); return; }
      const nb = d === 0 ? cfg.n0 : 2 + (rr() < .4 ? 1 : 0);
      for (let k = 0; k < nb; k++) {
        let na = a + (nb === 1 ? 0 : (k / (nb - 1) - .5) * 2 * cfg.sp) + (rr() - .5) * .4;
        na = na + (-Math.PI / 2 - na) * cfg.up * (d === 0 ? .6 : .15);
        if (kind === "elm" && d >= 3) na += Math.cos(na) > 0 ? .18 : -.18;
        grow(x2, y2, na, L * (cfg.sh + rr() * .12), wd * (.62 + rr() * .08), d + 1); } };
    grow(px, py, -Math.PI / 2 + (rr() - .5) * .08, hp * cfg.tr, hp * .05, 0);
    { const top = Math.min(...segs.map(sg => Math.min(sg[3], sg[5]))), sk = hp * .97 / Math.max(1, py - top);
      const S = (x, y) => [px + (x - px) * sk, py + (y - py) * sk];
      segs.forEach(sg => { [[0, 1], [2, 3], [4, 5]].forEach(([i, j]) => { const q = S(sg[i], sg[j]); sg[i] = q[0]; sg[j] = q[1]; }); sg[6] *= Math.min(1, sk); });
      tips.forEach(t => { const q = S(t[0], t[1]); t[0] = q[0]; t[1] = q[1]; }); }
    let tg = "";
    tips.forEach(([x, y, a]) => { for (let k = 0; k < 4; k++) { const b = a + (rr() - .5) * 1.4, L = hp * (.03 + rr() * .04);
      tg += `<path d="M${F(x)},${F(y)} l${F(Math.cos(b) * L)},${F(Math.sin(b) * L)}" stroke="${C(NIGHT ? "#4a4458" : "#6e6064")}" stroke-width=".7" opacity=".6"/>`; } });
    const xs = tips.map(t => t[0]), ys = tips.map(t => t[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const hx = (Math.max(...xs) - Math.min(...xs)) / 2, hy = (Math.max(...ys) - Math.min(...ys)) / 2;
    g += `<g filter="url(#ccTwig)" opacity=".28"><path d="${blobP(cx, cy + hy * .1, hx * .95, hy * .9, 10, rr)}" fill="${C(NIGHT ? "#3a3448" : "#8a7a7c")}"/></g>`;
    g += tg;
    segs.sort((a, b) => a[7] - b[7]).forEach(([x0, y0, qx, qy, x1, y1, wd, d]) => {
      const sw = Math.max(.5, wd);
      g += `<path d="M${F(x0)},${F(y0)} Q${F(qx)},${F(qy)} ${F(x1)},${F(y1)}" stroke="${B[d < 2 ? 1 : 2]}" stroke-width="${F(sw)}" fill="none" stroke-linecap="round"/>`;
      if (sw > 2.2) { const ox = lightDir[0] * sw * .28, oy = lightDir[1] * sw * .1;
        g += `<path d="M${F(x0 + ox)},${F(y0 + oy)} Q${F(qx + ox)},${F(qy + oy)} ${F(x1 + ox)},${F(y1 + oy)}" stroke="${B[4]}" stroke-width="${F(sw * .3)}" fill="none" stroke-linecap="round" opacity=".8"/>`; } });
    g += `<path d="M${F(px - hp * .07)},${F(py)} Q${F(px - hp * .025)},${F(py - hp * .02)} ${F(px - hp * .025)},${F(py - hp * .07)} L${F(px + hp * .025)},${F(py - hp * .07)} Q${F(px + hp * .025)},${F(py - hp * .02)} ${F(px + hp * .07)},${F(py)}Z" fill="${B[1]}"/>`;
    // the leaves still on: clusters on the outer twigs, lit by which way they face the light
    let lg = ""; const cs = [];
    // on the outer twigs and along the smaller limbs inside the crown, so it reads as a thinning crown, not an arch
    const spots = tips.map(t => [t[0], t[1]]).concat(segs.filter(sg => sg[7] >= maxD - 2).map(sg => [sg[4], sg[5]]));
    spots.forEach(([x, y]) => { if (rr() > keep) return; const n = 2 + Math.floor(rr() * 4);
      for (let k = 0; k < n; k++) { const qx = x + (rr() - .5) * hp * .09, qy = y + (rr() - .5) * hp * .07, lit = ((qx - cx) / hx * lightDir[0] + (qy - cy) / hy * lightDir[1]) * .5 + .5;
        cs.push([qx, qy, cl(lit * .8 + (rr() - .5) * .35), hp * (.008 + rr() * .011)]); } });
    cs.sort((a, b) => a[2] - b[2]).forEach(([x, y, v, R]) => lg += `<path d="${blobP(x, y, R, R * .8, 6, rr)}" fill="${C(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    g += `<g filter="url(#ccLeafy)">${lg}</g>`;
    return g; };
  /* a white pine: visible trunk, irregular flat shelves of needles lit on one side */
  const whitePine = (px, py, hp, fog, rr) => {
    const C = c => T(mix(c, HZ, fog)), P = PINE.map(C);
    let g = `<path d="M${F(px - hp * .018)},${F(py)} L${F(px - hp * .004)},${F(py - hp * .97)} L${F(px + hp * .004)},${F(py - hp * .97)} L${F(px + hp * .018)},${F(py)}Z" fill="${C("#3a2e28")}"/>`;
    const n = hp > 80 ? 7 + Math.floor(rr() * 3) : 5;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), y = py - hp * (.28 + .7 * t), side = (i % 2 ? 1 : -1) * (rr() < .7 ? 1 : -1), wd = hp * (.3 - t * .2) * (.7 + rr() * .5);
      const sxo = px + side * wd * (.25 + rr() * .3), rx = wd * (.55 + rr() * .2), ry = hp * (.045 + rr() * .02);
      g += `<path d="M${F(px)},${F(y + ry * .2)} L${F(sxo)},${F(y)}" stroke="${C("#3a2e28")}" stroke-width="${F(Math.max(.5, hp * .008))}"/>`;
      g += `<path d="${blobP(sxo, y, rx, ry * 1.3, 7, rr)}" fill="${P[1]}"/><path d="${blobP(sxo + lightDir[0] * rx * .25, y - ry * .4, rx * .6, ry * .6, 6, rr)}" fill="${P[4]}"/>`; }
    return `<g filter="url(#ccLeafy)">${g}</g>`; };
  const treeSprite = (x, z, h, kind, opt = {}) => { const rr = rng(seed + Math.round(x * 7.3 + z * 13.1));
    w.sprite({ x, z, y: 0, tag: opt.tag, bias: opt.bias, fn: (px, py, k, fog) => kind === "pine" ? whitePine(px, py, h * k, fog, rr) : autumnTree(px, py, h * k, fog, rr, kind) }); };
  // the woods at the edge of town
  for (let i = 0; i < 800; i++) { const z = 300 + Math.pow(r(), .9) * 420, x = (r() - .5) * 2.6 * z, u = sx(x, z); if (u < -60 || u > W + 60) continue;
    if (Math.sin(x / 37 + z / 41) + Math.sin(x / 13 - z / 29) * .5 < -.5) continue;
    const q = r(), kind = q < .2 ? "pine" : q < .5 ? "oak" : q < .8 ? "maple" : "elm", h = Math.min(14 + r() * 10, room(x, z)); if (h < 8) continue;
    treeSprite(x, z, h, kind, { tag: "far" }); }

  /* ---------- the shop rows: brick Italianate fronts with storefronts, cornices and window hoods ---------- */
  const BRICK = ["#8e3a2a", "#a2462e", "#7a3226", "#b46a48", "#c8a678", "#9a5a3a", "#6e4a3e", "#d8c8a4", "#8a4a3e"];
  const TRIMS = ["#e8dcc4", "#d8c8a8", "#2e3a34", "#5a2a22", "#f0e8d6"];
  const SIGNS = ["#1e3a2e", "#5a1e1a", "#2a2e4a", "#3a2a1e", "#6a4a1e", "#1e2a3a"];
  const AWN = [["#2e5a3e", "#e8e0cc"], ["#8a2a22", "#efe4cc"], ["#2a3a5a", "#e8e0d0"], ["#6a3a1e", "#e8c890"]];
  const shop = (u, v, yaw, o) => {
    const [x, z] = SQ(u, v), wd = o.w, h = o.h, d = 16, hw = wd / 2, col = o.col, trim = o.trim;
    const winLit = () => NIGHT && rb() < .45, sh = o.storeLit ?? (NIGHT && rb() < .85);
    w.box({ x, z, yaw, w: wd, d, h, c: col, dec: (faces, P) => {
      const at = (a, y, off = .05) => P([a, y, -d / 2 - off]), D = [];
      const Q = (a0, y0, a1, y1, c, e = {}) => D.push({ P: [at(a0, y0, e.off), at(a1, y0, e.off), at(a1, y1, e.off), at(a0, y1, e.off)], c, glow: e.glow, op: e.op });
      // storefront: piers, glass, transom, sign band
      Q(-hw + .1, 0, hw - .1, 3.9, trim, { off: .04 });
      Q(-hw + .5, .5, hw - .5, 2.9, sh ? "#ffd690" : "#2e3a46", { off: .06, glow: sh });
      if (!sh) Q(-hw + .5, 1.7, -hw + 1.8, 2.9, "#a8bccc", { off: .07, op: .3 });
      Q(-hw + .5, 3.0, hw - .5, 3.3, sh ? "#ffe4b0" : "#4a5a6a", { off: .06, glow: sh });
      for (let a = -hw + .5 + 1.4; a < hw - .9; a += 1.4) Q(a - .05, .5, a + .05, 3.3, trim, { off: .07 });
      Q(-.55, 0, .55, 2.6, sh ? "#ffc878" : "#3a2a22", { off: .075, glow: sh });
      Q(-hw + .3, 3.4, hw - .3, 3.85, o.sign, { off: .06 });
      for (let a = -hw + .9; a < hw - .9; a += .45) Q(a, 3.52, a + .26, 3.73, "#e8dcb8", { off: .07, op: .8 });
      // upper floors: tall windows with hoods
      const n = Math.max(2, Math.floor(wd / 2.3));
      for (let f = 0; f * 3.6 + 4.8 < h - 2.2; f++) { const y0 = 4.8 + f * 3.6, y1 = y0 + 2.2;
        for (let k = 0; k < n; k++) { const a = -hw + wd * (k + .5) / n, lt = winLit();
          Q(a - .55, y0 - .15, a + .55, y1 + .1, trim, { off: .05 });
          Q(a - .45, y0, a + .45, y1, lt ? LAMP : "#2e3a46", { off: .07, glow: lt });
          if (!lt) Q(a - .45, (y0 + y1) / 2, a, y1, "#a8bccc", { off: .08, op: .3 });
          Q(a - .7, y1 + .1, a + .7, y1 + .45, trim, { off: .09 }); } }
      // brick coursing
      for (let y = 4.3; y < h - .2; y += .55) D.push({ P: [at(-hw, y, .02), at(hw, y, .02)], c: mix(col, "#000000", .25), ln: .03, min: .3, op: .45 });
      faces[0].dec = D; } });
    // the bracketed cornice
    w.box({ x, z, yaw, y: h, w: wd + .3, d: d + .3, h: .7, c: trim, dec: (faces, P) => {
      const D = []; for (let a = -hw + .3; a < hw; a += .9) D.push({ P: [P([a, .05, -d / 2 - .2]), P([a, .55, -d / 2 - .2])], c: mix(trim, "#000000", .35), ln: .12, min: .4 });
      faces[0].dec = D; } });
    if (o.awn) { const fr = w.frame({ x, z, yaw }), [c1, c2] = o.awn, n = Math.round(wd / .55);
      for (let k = 0; k < n; k++) { const a0 = -hw + .3 + (wd - .6) * k / n, a1 = -hw + .3 + (wd - .6) * (k + 1) / n;
        w.add([{ P: [[a0, 3.35, -d / 2 - .05], [a1, 3.35, -d / 2 - .05], [a1, 2.6, -d / 2 - 1.3], [a0, 2.6, -d / 2 - 1.3]].map(fr.P), c: k % 2 ? c2 : c1, two: true, back: mix(k % 2 ? c2 : c1, "#000000", .4) }], { bias: .5 }); } }
  };
  // a row along one side of the square: n fronts of varied width and height, from v0 stepping +v
  const row = (side, v0, v1) => { let v = v0;
    while (v < v1) { const wd = 6.5 + rb() * 6, h0 = 7.4 + rb() * 6.2, u = side * (78 + 8), vc = v + wd / 2, [x, z] = SQ(u - side * 8, vc);
      const hmax = room(x, z) - .9; v += wd + .02;
      if (z < 30 || hmax < 6.2) continue;
      shop(u, vc, side < 0 ? YAW + 90 : YAW - 90, { w: wd, h: Math.min(h0, hmax), col: BRICK[Math.floor(rb() * BRICK.length)], trim: TRIMS[Math.floor(rb() * TRIMS.length)], sign: SIGNS[Math.floor(rb() * SIGNS.length)], awn: rb() < .4 ? AWN[Math.floor(rb() * AWN.length)] : null }); } };
  row(-1, -98, 66); row(1, -98, 66);
  // the row across the back of the square, facing the courthouse
  { let u = -150; while (u < 150) { const wd = 6.5 + rb() * 6, h0 = 7.4 + rb() * 6, uc = u + wd / 2, [x, z] = SQ(uc, 73), hmax = room(x, z) - .9; u += wd + .02;
      if (hmax < 6.2) continue;
      shop(uc, 73 + 8, YAW, { w: wd, h: Math.min(h0, hmax), col: BRICK[Math.floor(rb() * BRICK.length)], trim: TRIMS[Math.floor(rb() * TRIMS.length)], sign: SIGNS[Math.floor(rb() * SIGNS.length)], awn: rb() < .35 ? AWN[Math.floor(rb() * AWN.length)] : null }); } }

  /* ---------- a brick church on the next street, its spire over the back row ---------- */
  { const [x, z] = SQ(-95, 128), cap = room(x, z);
    const TW = 5.6, tH = Math.min(17, cap - 15), BR = "#8a3a2a", ST = "#d8ccb4";
    if (tH > 9) {
      w.house({ x: x + 4, z: z + 12, yaw: YAW, w: 14, d: 24, h: 9, rh: 6.5, gable: true, wall: BR, roof: "#3a3438", trim: ST, clap: false, door: false, fy: -.3, stone: "#8a8478", winGap: 3.2 });
      w.box({ x, z, yaw: YAW, w: TW, d: TW, h: tH, c: BR, dec: (faces, P) => faces.slice(0, 4).forEach(fc => {
        const D = [], m = [(a, y, o) => [a, y, -TW / 2 - o], (a, y, o) => [TW / 2 + o, y, a], (a, y, o) => [-a, y, TW / 2 + o], (a, y, o) => [-TW / 2 - o, y, -a]][faces.indexOf(fc)];
        const at = (a, y, o = .05) => P(m(a, y, o)), lt = NIGHT;
        D.push({ P: [at(-.7, tH - 4.6), at(.7, tH - 4.6), at(.7, tH - 1.4), at(0, tH - .8), at(-.7, tH - 1.4)], c: lt ? "#5a3a24" : "#1e1e26" });
        D.push({ P: [at(-1.1, tH - .5), at(1.1, tH - .5), at(1.1, tH - .1), at(-1.1, tH - .1)], c: ST });
        fc.dec = D; }) });
      w.box({ x, z, yaw: YAW, y: tH, w: TW + .5, d: TW + .5, h: .5, c: ST });
      w.cyl({ x, z, y: tH + .5, r0: TW * .56, r1: 0, h: 14, n: 8, rot: A + Math.PI / 8, c: "#4a4a52" });
      w.line([[x, tH + 14.3, z], [x, tH + 16, z]], "#c8a040", .1);
      w.line([[x - .5, tH + 15.4, z], [x + .5, tH + 15.4, z]], "#c8a040", .1); } }

  /* ---------- the courthouse ---------- */
  const SAND = "#d2b88e", SAND2 = "#c2a47a", PALE = "#ece0c4", DOME = "#6aa48e", DOME2 = "#4e8a74", GILT = "#d8b04a", GLASS = "#2e3a48", WARM = "#ffcf7a";
  const CH = { x: PX, z: PZ, yaw: YAW };
  const CHF = w.frame(CH);
  // decorate the four walls of a box (half width hw, half depth hd): at(a, y, off) is a point on face i, a across it, +a to the viewer's right
  const walls = (faces, P, hw, hd, deco) => faces.slice(0, 4).forEach((fc, i) => {
    const map = [(a, y, o) => [a, y, -hd - o], (a, y, o) => [hw + o, y, a], (a, y, o) => [-a, y, hd + o], (a, y, o) => [-hw - o, y, -a]][i];
    fc.dec = deco((a, y, off = .05) => P(map(a, y, off)), i, i % 2 ? 2 * hd : 2 * hw); });
  const arc = (cx, cy, R, a0, a1, n = 10) => Array.from({ length: n + 1 }, (_, k) => { const t = a0 + (a1 - a0) * k / n; return [cx + Math.cos(t) * R, cy + Math.sin(t) * R]; });
  // an arched window: trim frame and arch, glass, mullions, a keystone
  const archWin = (D, at, a, v0, v1, hw, lit) => {
    const fr = [[a - hw - .2, v0 - .2], [a + hw + .2, v0 - .2], ...arc(a, v1, hw + .2, 0, Math.PI)];
    D.push({ P: fr.map(([u, y]) => at(u, y, .06)), c: PALE });
    const gl = [[a - hw, v0], [a + hw, v0], ...arc(a, v1, hw, 0, Math.PI)];
    D.push({ P: gl.map(([u, y]) => at(u, y, .08)), c: lit ? WARM : GLASS, glow: lit });
    if (!lit) D.push({ P: [[a - hw, (v0 + v1) / 2], [a, (v0 + v1) / 2], [a, v1], [a - hw, v1]].map(([u, y]) => at(u, y, .09)), c: "#a8bccc", op: .3 });
    D.push({ P: [at(a, v0, .1), at(a, v1 + hw, .1)], c: PALE, ln: .07, min: .4 });
    D.push({ P: [at(a - hw, (v0 + v1) * .5, .1), at(a + hw, (v0 + v1) * .5, .1)], c: PALE, ln: .06, min: .4 });
    D.push({ P: [[a - .22, v1 + hw + .05], [a + .22, v1 + hw + .05], [a + .16, v1 + hw + .55], [a - .16, v1 + hw + .55]].map(([u, y]) => at(u, y, .1)), c: PALE });
  };
  const rectWin = (D, at, a, v0, v1, hw, lit) => {
    D.push({ P: [at(a - hw - .15, v0 - .15, .06), at(a + hw + .15, v0 - .15, .06), at(a + hw + .15, v1 + .15, .06), at(a - hw - .15, v1 + .15, .06)], c: PALE });
    D.push({ P: [at(a - hw, v0, .08), at(a + hw, v0, .08), at(a + hw, v1, .08), at(a - hw, v1, .08)], c: lit ? WARM : GLASS, glow: lit });
    D.push({ P: [at(a, v0, .09), at(a, v1, .09)], c: PALE, ln: .05, min: .3 });
  };
  const offLit = () => NIGHT && rb() < .2;   // a Sunday evening: the odd office light
  // main block: rusticated base to 4.5 m, the main floor above, frieze and cornice
  const BW = 34, BD = 24, BH = 12.5;
  w.box({ ...CH, w: BW, d: BD, h: BH, c: SAND, dec: (faces, P) => walls(faces, P, BW / 2, BD / 2, (at, i, len) => {
    const D = [], hl = len / 2;
    for (let y = .55; y < 4.4; y += .55) D.push({ P: [at(-hl, y, .02), at(hl, y, .02)], c: mix(SAND2, "#000000", .3), ln: .06, min: .4, op: .7 });
    D.push({ P: [at(-hl, 4.3, .04), at(hl, 4.3, .04), at(hl, 4.8, .04), at(-hl, 4.8, .04)], c: PALE });
    D.push({ P: [at(-hl, 11.6, .04), at(hl, 11.6, .04), at(hl, 12.5, .04), at(-hl, 12.5, .04)], c: PALE });
    const bays = Math.round(len / 3.4);
    for (let k = 0; k <= bays; k++) { const a = -hl + len * k / bays;
      D.push({ P: [at(a - .32, 4.8, .04), at(a + .32, 4.8, .04), at(a + .32, 11.6, .04), at(a - .32, 11.6, .04)], c: mix(SAND, PALE, .45) }); }
    for (let k = 0; k < bays; k++) { const a = -hl + len * (k + .5) / bays;
      if (i === 0 && Math.abs(a) < 7) { if (Math.abs(a) < 1) D.push({ P: [at(-1.1, 4.8, .07), at(1.1, 4.8, .07), at(1.1, 8.4, .07), ...arc(0, 8.4, 1.1, 0, Math.PI).slice(1).map(([u, y]) => at(u, y, .07))], c: NIGHT ? "#ffd08a" : "#3a2a20", glow: NIGHT }); continue; }
      rectWin(D, at, a, 1.3, 3.3, .55, offLit());
      archWin(D, at, a, 5.6, 9.4, .72, offLit()); }
    return D; }) });
  w.box({ ...CH, y: BH, w: BW + .9, d: BD + .9, h: .8, c: PALE });
  w.box({ ...CH, y: BH + .8, w: BW - .2, d: BD - .2, h: 1.0, c: SAND, dec: (faces, P) => walls(faces, P, BW / 2 - .1, BD / 2 - .1, (at, i, len) => {
    const D = [], hl = len / 2; for (let a = -hl + .35; a < hl; a += .5) D.push({ P: [at(a, .1, .05), at(a, .85, .05)], c: PALE, ln: .14, min: .5 }); return D; }) });
  // corner urns on the parapet
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const p = CHF.P([a * (BW / 2 - .4), 0, b * (BD / 2 - .4)]);
    w.cyl({ x: p[0], z: p[2], y: BH + 1.8, r0: .35, r1: .5, h: .7, n: 8, c: PALE }); });
  // the portico: grand stair, podium, four columns, entablature and pediment
  { const vF = -BD / 2;
    for (let i = 0; i < 6; i++) { const p = CHF.P([0, 0, vF - 4 - (5 - i) * .8 - .4]); w.box({ x: p[0], z: p[2], yaw: YAW, w: 12, d: .8, h: (i + 1) * .75, c: i % 2 ? "#c8c0b0" : "#bab2a2" }); }
    const pc = CHF.P([0, 0, vF - 2]); w.box({ x: pc[0], z: pc[2], yaw: YAW, w: 13.4, d: 4, h: 4.5, c: SAND2 });
    [-4.5, -1.5, 1.5, 4.5].forEach(a => { const p = CHF.P([a, 0, vF - 3.3]);
      w.cyl({ x: p[0], z: p[2], y: 4.5, r0: .62, r1: .62, h: .5, n: 12, c: PALE });
      w.cyl({ x: p[0], z: p[2], y: 5, r0: .5, r1: .42, h: 6.4, n: 14, c: PALE });
      w.cyl({ x: p[0], z: p[2], y: 11.4, r0: .48, r1: .66, h: .45, n: 12, c: PALE }); });
    const pe = CHF.P([0, 0, vF - 2.05]); w.box({ x: pe[0], z: pe[2], yaw: YAW, y: 11.85, w: 13.6, d: 4.3, h: 1.1, c: PALE });
    const zf = vF - 4.2, zb = vF + .1, y0 = 12.95, y1 = 15.6, hw = 6.8;
    w.add([{ P: [[-hw, y0, zf], [hw, y0, zf], [0, y1, zf]].map(CHF.P), c: SAND, dec: [{ P: [[-hw + .5, y0 + .2, zf - .02], [hw - .5, y0 + .2, zf - .02], [0, y1 - .35, zf - .02]].map(CHF.P), c: mix(SAND, SAND2, .6) }] },
      { P: [[-hw - .2, y0 - .05, zf - .2], [0, y1 + .1, zf - .2], [0, y1 + .1, zb], [-hw - .2, y0 - .05, zb]].map(CHF.P), c: "#8a8478", two: true },
      { P: [[hw + .2, y0 - .05, zf - .2], [0, y1 + .1, zf - .2], [0, y1 + .1, zb], [hw + .2, y0 - .05, zb]].map(CHF.P), c: "#8a8478", two: true }], { center: CHF.P([0, 14, vF - 2]) }); }
  // the tower: attic stage with oculi, clock stage, drum, copper dome, lantern and finial
  const TIME = NIGHT ? [5, 35] : [4, 10];
  { const TW1 = 8.6, TW2 = 7.8, y1 = BH + 1.8;
    w.box({ ...CH, y: y1, w: TW1, d: TW1, h: 3.2, c: SAND, dec: (faces, P) => walls(faces, P, TW1 / 2, TW1 / 2, at => {
      const D = []; D.push({ P: arc(0, 1.6, .85, 0, Math.PI * 2, 18).map(([u, y]) => at(u, y, .06)), c: PALE });
      D.push({ P: arc(0, 1.6, .62, 0, Math.PI * 2, 18).map(([u, y]) => at(u, y, .08)), c: NIGHT ? "#5a4a3a" : GLASS });
      D.push({ P: [at(-TW1 / 2, 0, .04), at(-TW1 / 2 + .5, 0, .04), at(-TW1 / 2 + .5, 3.2, .04), at(-TW1 / 2, 3.2, .04)], c: PALE });
      D.push({ P: [at(TW1 / 2 - .5, 0, .04), at(TW1 / 2, 0, .04), at(TW1 / 2, 3.2, .04), at(TW1 / 2 - .5, 3.2, .04)], c: PALE });
      return D; }) });
    w.box({ ...CH, y: y1 + 3.2, w: TW1 + .7, d: TW1 + .7, h: .5, c: PALE });
    const yc = y1 + 3.7, CR = 2.55, ccy = 2.5;
    w.box({ ...CH, y: yc, w: TW2, d: TW2, h: 5.2, c: SAND, dec: (faces, P) => walls(faces, P, TW2 / 2, TW2 / 2, at => {
      const D = [];
      [-1, 1].forEach(sg => D.push({ P: [at(sg * TW2 / 2, 0, .04), at(sg * (TW2 / 2 - .55), 0, .04), at(sg * (TW2 / 2 - .55), 5.2, .04), at(sg * TW2 / 2, 5.2, .04)], c: PALE }));
      D.push({ P: arc(0, ccy, CR + .28, 0, Math.PI * 2, 32).map(([u, y]) => at(u, y, .06)), c: "#2a2a30" });
      D.push({ P: arc(0, ccy, CR, 0, Math.PI * 2, 32).map(([u, y]) => at(u, y, .08)), c: NIGHT ? "#fff2c8" : "#f6f0e0", glow: NIGHT });
      D.push({ P: arc(0, ccy, CR * .78, 0, Math.PI * 2, 32).map(([u, y]) => at(u, y, .085)), c: NIGHT ? "#ffe8b0" : "#efe6d0", glow: NIGHT, op: .6 });
      for (let k = 0; k < 12; k++) { const t = k / 12 * Math.PI * 2, L0 = k % 3 ? .84 : .74;
        D.push({ P: [at(Math.sin(t) * CR * L0, ccy + Math.cos(t) * CR * L0, .09), at(Math.sin(t) * CR * .94, ccy + Math.cos(t) * CR * .94, .09)], c: "#1e1e24", ln: k % 3 ? .1 : .2, min: .6 }); }
      const ha = ((TIME[0] % 12) + TIME[1] / 60) / 12 * Math.PI * 2, ma = TIME[1] / 60 * Math.PI * 2;
      D.push({ P: [at(-Math.sin(ha) * .3, ccy - Math.cos(ha) * .3, .1), at(Math.sin(ha) * CR * .52, ccy + Math.cos(ha) * CR * .52, .1)], c: "#14141a", ln: .2, min: 1.6 });
      D.push({ P: [at(-Math.sin(ma) * .4, ccy - Math.cos(ma) * .4, .11), at(Math.sin(ma) * CR * .8, ccy + Math.cos(ma) * CR * .8, .11)], c: "#14141a", ln: .13, min: 1.2 });
      D.push({ P: arc(0, ccy, .16, 0, Math.PI * 2, 8).map(([u, y]) => at(u, y, .12)), c: GILT });
      // a small pediment over each clock
      D.push({ P: [at(-2.6, 4.6, .07), at(2.6, 4.6, .07), at(0, 5.15, .07)], c: PALE });
      return D; }) });
    w.box({ ...CH, y: yc + 5.2, w: TW2 + .8, d: TW2 + .8, h: .55, c: PALE });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const p = CHF.P([a * (TW2 / 2), 0, b * (TW2 / 2)]);
      w.cyl({ x: p[0], z: p[2], y: yc + 5.75, r0: .3, r1: .42, h: .55, n: 8, c: PALE }); w.cyl({ x: p[0], z: p[2], y: yc + 6.3, r0: .3, r1: 0, h: .5, n: 8, c: GILT }); });
    const yd = yc + 5.75, DR = 3.05, tc = CHF.P([0, 0, 0]);
    w.cyl({ x: tc[0], z: tc[2], y: yd, r0: DR, r1: DR, h: 1.1, n: 20, c: SAND });
    w.cyl({ x: tc[0], z: tc[2], y: yd + 1.1, r0: DR + .25, r1: DR + .25, h: .3, n: 20, c: PALE });
    const yh = yd + 1.4, DH = 2.7, NR = 7;
    for (let k = 0; k < NR; k++) { const t0 = k / NR * Math.PI / 2, t1 = (k + 1) / NR * Math.PI / 2;
      w.cyl({ x: tc[0], z: tc[2], y: yh + Math.sin(t0) * DH, r0: DR * Math.cos(t0), r1: DR * Math.cos(t1) + .001, h: (Math.sin(t1) - Math.sin(t0)) * DH, n: 20, c: k % 2 ? DOME : mix(DOME, DOME2, .3), top: false }); }
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + A;
      w.line(Array.from({ length: 8 }, (_, j) => { const t = j / 7 * Math.PI / 2 * .93; return [tc[0] + Math.cos(a) * DR * Math.cos(t), yh + Math.sin(t) * DH, tc[2] + Math.sin(a) * DR * Math.cos(t)]; }), "#9ac8b4", .06, { min: .4 }); }
    const yl = yh + DH;
    w.cyl({ x: tc[0], z: tc[2], y: yl - .1, r0: .85, r1: .85, h: 1.25, n: 8, rot: A, c: PALE, glow: NIGHT });
    if (NIGHT) w.sprite({ x: tc[0], z: tc[2] - .9, y: yl + .5, fn: (px, py, k) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(k * 1.1)}" fill="url(#ccGlow)" opacity=".7"/>` });
    w.cyl({ x: tc[0], z: tc[2], y: yl + 1.15, r0: 1.05, r1: 0, h: .9, n: 8, rot: A, c: DOME });
    w.line([[tc[0], yl + 2, tc[2]], [tc[0], yl + 3.1, tc[2]]], GILT, .1);
    w.cyl({ x: tc[0], z: tc[2], y: yl + 2.4, r0: .2, r1: .2, h: .3, n: 8, c: GILT }); }

  /* ---------- trees on the lawn and the side streets ---------- */
  // nothing in front of the courthouse may hide it: a crown reaches about half its height either side of the trunk
  const keepClear = (x, z, h) => { const sxp = sx(x, z), half = FL * h * .5 / z; return z < PZ && sxp + half > 1050 && sxp - half < 1640 && sy(h, z) < 470; };
  LAWN_TREES.forEach(([u, v, h, kind]) => { const [x, z] = SQ(u, v); if (z < 8) return; const hh = Math.min(h, room(x, z)); if (hh < 7 || keepClear(x, z, hh)) return; treeSprite(x, z, hh, kind); });
  for (let v = -90; v < 64; v += 15) [-1, 1].forEach(side => { const u = side * 66.5, [x, z] = SQ(u, v + side * 4); if (z < 10) return;
    const hh = Math.min(10 + rb() * 4, room(x, z)); if (hh < 7 || keepClear(x, z, hh)) return; treeSprite(x, z, hh, rb() < .5 ? "maple" : "elm"); });
  for (let u = -110; u < 120; u += 17) { const [x, z] = SQ(u, 63.5); const hh = Math.min(9 + rb() * 3, room(x, z)); if (hh < 6 || keepClear(x, z, hh)) continue; treeSprite(x, z, hh, rb() < .6 ? "maple" : "oak"); }
  // long shadows of the lawn trees, thrown right by the low sun (day only)
  if (!NIGHT) LAWN_TREES.forEach(([u, v, h]) => { const [x, z] = SQ(u, v); if (z < 8) return;
    const a = pr(x, z), b = pr(x + h * 1.5, z - h * .3), k = FL / z;
    G += `<path d="M${F(a[0] - k * .3)},${F(a[1])} L${F(b[0])},${F(b[1] - k * .5)} L${F(b[0] + k * 1.8)},${F(b[1] + k * .3)} L${F(a[0] + k * .3)},${F(a[1] + k * .1)}Z" fill="#2a2a3a" opacity=".15"/>`; });

  /* ---------- lamps, benches, the flag, mums by the stair ---------- */
  const lamps = [];
  const lamp = (px, py, k, fog) => { const C = c => fogC(c, fog), m = v => v * k; let g = "";
    g += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(m(.35))}" ry="${F(Math.max(.6, m(.04)))}" fill="#000" opacity=".25"/>`;
    g += `<path d="M${F(px - m(.16))},${F(py)} L${F(px + m(.16))},${F(py)} L${F(px + m(.07))},${F(py - m(.7))} L${F(px - m(.07))},${F(py - m(.7))}Z" fill="${C("#1e2420")}"/>`;
    g += `<rect x="${F(px - m(.05))}" y="${F(py - m(3.5))}" width="${F(m(.1))}" height="${F(m(3.5))}" fill="${C("#1e2420")}"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(py - m(3.85))}" rx="${F(m(.26))}" ry="${F(m(.36))}" fill="${NIGHT ? "#fff0c8" : C("#e8e4d8")}"/>`;
    g += `<rect x="${F(px - m(.14))}" y="${F(py - m(3.58))}" width="${F(m(.28))}" height="${F(m(.1))}" fill="${C("#1e2420")}"/>`;
    if (NIGHT) g += `<circle cx="${F(px)}" cy="${F(py - m(3.85))}" r="${F(m(1.5))}" fill="url(#ccGlow)"/>`;
    return g; };
  [[-40, -97], [-10, -97], [20, -97], [50, -97], [-66.5, -60], [-66.5, -20], [66.5, -70], [66.5, -35], [66.5, 0], [66.5, 35], [-10, -40], [10, -40], [-20, 59], [20, 59]].forEach(([u, v]) => {
    const [x, z] = SQ(u, v); if (z < 10 || (z < 70 && sx(x, z) > 1000 && sx(x, z) < 1700)) return; lamps.push([x, z]); w.sprite({ x, z, fn: lamp }); });
  const bench = (px, py, k, fog) => { const C = c => fogC(c, fog), m = v => v * k; let g = "";
    g += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(m(1.0))}" ry="${F(Math.max(.6, m(.06)))}" fill="#000" opacity=".22"/>`;
    [-.8, .8].forEach(a => g += `<rect x="${F(px + m(a) - m(.04))}" y="${F(py - m(.45))}" width="${F(m(.08))}" height="${F(m(.45))}" fill="${C("#1e2420")}"/>`);
    [.45, .55].forEach(y => g += `<rect x="${F(px - m(.95))}" y="${F(py - m(y) - m(.04))}" width="${F(m(1.9))}" height="${F(m(.06))}" fill="${C("#6a4a2e")}"/>`);
    [.7, .82, .94].forEach(y => g += `<rect x="${F(px - m(.95))}" y="${F(py - m(y) - m(.04))}" width="${F(m(1.9))}" height="${F(m(.07))}" fill="${C(y > .9 ? "#8a6a44" : "#6a4a2e")}"/>`);
    return g; };
  [[-6, -60], [6, -62], [-24, -14]].forEach(([u, v]) => { const [x, z] = SQ(u, v); w.sprite({ x, z, fn: bench }); });
  { const [fx, fz] = SQ(-26, -46); w.line([[fx, 0, fz], [fx, 12, fz]], "#e8e4dc", .14);
    w.sprite({ x: fx, z: fz, y: 11.9, fn: (px, py, k, fog) => { const m = v => v * k; let g = "";
      const wave = t => Math.sin(t * 5.5) * m(.12), fw = m(2.6), fh = m(1.5);
      for (let i = 0; i < 13; i++) { const y0 = py + i * fh / 13, y1 = py + (i + 1) * fh / 13;
        g += `<path d="M${F(px)},${F(y0)} Q${F(px + fw * .5)},${F(y0 + wave(.5))} ${F(px + fw)},${F(y0 + wave(1))} L${F(px + fw)},${F(y1 + wave(1))} Q${F(px + fw * .5)},${F(y1 + wave(.5))} ${F(px)},${F(y1)}Z" fill="${fogC(i % 2 ? "#f4f0e6" : "#b8302a", fog)}"/>`; }
      g += `<path d="M${F(px)},${F(py)} Q${F(px + fw * .2)},${F(py + wave(.2))} ${F(px + fw * .4)},${F(py + wave(.4))} L${F(px + fw * .4)},${F(py + fh * 7 / 13 + wave(.4))} Q${F(px + fw * .2)},${F(py + fh * 7 / 13 + wave(.2))} ${F(px)},${F(py + fh * 7 / 13)}Z" fill="${fogC("#2a3460", fog)}"/>`;
      return NIGHT ? `<g opacity=".7">${g}</g>` : g; } }); }
  const MUM = ["#6a2010", "#8e3016", "#b04a1e", "#c86a2a", "#dc8a34", "#ecaa48"];
  const mums = (px, py, k, fog) => { const C = c => fogC(c, fog), m = v => v * k, rr = rng(Math.round(px * 3 + py));
    let g = `<path d="M${F(px - m(.38))},${F(py)} L${F(px + m(.38))},${F(py)} L${F(px + m(.44))},${F(py - m(.5))} L${F(px - m(.44))},${F(py - m(.5))}Z" fill="${C("#8a8478")}"/>`;
    g += `<path d="${blobP(px, py - m(.72), m(.55), m(.34), 9, rr)}" fill="${C("#3a4a24")}"/>`;
    for (let i = 0; i < 40; i++) { const a = rr() * Math.PI * 2, q = Math.sqrt(rr()), x = px + Math.cos(a) * q * m(.52), y = py - m(.74) + Math.sin(a) * q * m(.3), lit = cl((Math.cos(a) * q * lightDir[0] + Math.sin(a) * q * lightDir[1]) * .5 + .5 + (rr() - .5) * .3);
      g += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(Math.max(.6, m(.06)))}" fill="${C(MUM[Math.floor(lit * MUM.length)])}"/>`; }
    return g; };
  [[-6.6, -21.6], [6.6, -21.6], [-6.6, -18.4], [6.6, -18.4]].forEach(([a, b]) => { const p = CHF.P([a, 0, b]); w.sprite({ x: p[0], z: p[2], fn: mums }); });

  /* ---------------- assemble ---------------- */
  s += G;
  s += w.draw({ where: o => o.tag === "far" });
  s += `<rect x="0" y="${WY - 120}" width="${W}" height="160" fill="url(#ccHaze)" opacity="${NIGHT ? .3 : .4}"/>`;
  s += w.draw({ where: o => o.tag !== "far" });
  if (NIGHT) {
    s += `<g style="mix-blend-mode:screen">`;
    // floodlights wash the courthouse front and the tower; the clocks glow
    { const p = w.proj([PX - 3, 7, PZ - 14]), k = FL / (PZ - 14);
      // uplights at the foot of the walls: warm, brightest low on the stone
      const p2 = w.proj([PX - 3, 2, PZ - 14]);
      s += `<ellipse cx="${F(p2[0])}" cy="${F(p2[1])}" rx="${F(k * 19)}" ry="${F(k * 9)}" fill="url(#ccFlood)"/><ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(k * 16)}" ry="${F(k * 6)}" fill="url(#ccFlood)" opacity=".6"/>`;
      const q = w.proj([PX, 22, PZ - 4]), k2 = FL / PZ;
      s += `<ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(k2 * 6)}" ry="${F(k2 * 9)}" fill="url(#ccFlood)" opacity=".5"/>`;
      [[0, -1], [-1, 0]].forEach(([a, b]) => { const c = CHF.P([a * 3.95, BH + 1.8 + 3.7 + 2.5, b * 3.95]), qc = w.proj(c), kc = FL / c[2];
        s += `<circle cx="${F(qc[0])}" cy="${F(qc[1])}" r="${F(kc * 4.2)}" fill="url(#ccClockG)" opacity=".8"/>`; }); }
    lamps.forEach(([x, z]) => { const q = pr(x, z), k = FL / z; s += `<ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(k * 3.2)}" ry="${F(k * .5)}" fill="url(#ccWarm)" opacity=".85"/>`; });
    s += `</g>`;
  }
  // grass and leaves at the bottom corners, under the cards
  const tuft = (x0, x1) => { let g = "";
    for (let i = 0; i < 70; i++) { const x = x0 + r() * (x1 - x0), y = 702 + r() * 30, hh = 26 + r() * 50, bend = (r() - .5) * 30;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#5e6a34" : "#a49a5c")}" stroke-width="${F(1.6 + r() * 2)}" fill="none" stroke-linecap="round"/>`; }
    for (let i = 0; i < 50; i++) { const cx = x0 + r() * (x1 - x0), cy = 688 + r() * 32;
      g += `<ellipse cx="${F(cx)}" cy="${F(cy)}" rx="${F(5 + r() * 6)}" ry="${F(2 + r() * 2)}" fill="${T(LEAF[Math.floor(r() * LEAF.length)])}" transform="rotate(${F((r() - .5) * 60)} ${F(cx)} ${F(cy)})"/>`; }
    return g; };
  s += tuft(0, 300) + tuft(2260, 2560);

  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#ccLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".06"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#ccPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
