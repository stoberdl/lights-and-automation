/* Dune Bluff Storm: the light before the storm on the Lake Michigan dunes. From
   an overlook on top of a sand bluff (eye 30 m above the lake) we look north
   across a turquoise bay to a tall perched-dune headland: a long bare sand face
   rising from the beach to a ridge of autumn hardwoods, with silver ghost-forest
   snags near the crest. Farther bluffs recede to the left; the open lake runs
   to the horizon on the right, with a freighter far out. A shelf cloud is
   rolling in over the water from the right, dark slate above a bright slot of
   sky, while the dunes are still in low sun from behind us. A sloop runs for
   the bay with whitecaps around it.
   All land is world3d() rasters (reference/scene-helpers.js); the lake is a
   per-pixel canvas (shallows, sandbars, whitecaps, broken reflections); trees,
   grass, snags and boats are sprites placed in world metres.
   opts.time === "night": moonless; stars over the land, lightning glowing
   inside the storm cloud, the lake dark, far-shore town lights and the
   freighter's lights on the horizon.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), hexRGB() and rgbTone() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                    */
function duneBluffStormArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1010;
  const rs = rng(seed + 5), rc = rng(seed + 13), rt = rng(seed + 21), rg = rng(seed + 29);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const WY = 420, EYE = 30, FL = 2000;
  const T = c => NIGHT ? mix(mix(c, "#4a5478", .5), "#060a1e", .68) : c;
  const HZ = NIGHT ? "#1a2034" : "#b8c0c4";
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const LV = (() => { const v = [.55, .5, -.65], l = Math.hypot(...v); return v.map(q => q / l); })();
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9), N4 = noise2(seed + 15);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z, wx = (px, z) => (px - 1280) * z / FL;

  /* ---------------- sky ---------------- */
  // leading edge of the shelf cloud: high on the left, sinking toward the lake horizon on the right
  const LE = [[690, -20], [740, 40], [840, 100], [990, 150], [1180, 192], [1420, 228], [1700, 258], [2000, 282], [2300, 300], [2620, 314]];
  const E = x => { if (x <= LE[0][0]) return -20; for (let i = 0; i < LE.length - 1; i++) if (x <= LE[i + 1][0]) { const [x0, y0] = LE[i], [x1, y1] = LE[i + 1], t = (x - x0) / (x1 - x0); return y0 + (y1 - y0) * (t * t * (3 - 2 * t) * .35 + t * .65); } return 314; };
  const TH = x => 16 + 46 * sm((x - 950) / 1400);       // shelf face thickness
  const BOLTS = [[1300, 230, 170, .8], [2150, 300, 130, .5]];   // lightning inside the cloud (night)
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#050816"/><stop offset=".6" stop-color="#0c1430"/><stop offset="1" stop-color="#1c2240"/>`
    : `<stop offset="0" stop-color="#5a88ba"/><stop offset=".55" stop-color="#9cb8d2"/><stop offset="1" stop-color="#dcdcd0"/>`;
  const mass = NIGHT
    ? `<stop offset="0" stop-color="#070a14"/><stop offset=".7" stop-color="#0e1420"/><stop offset="1" stop-color="#141a28"/>`
    : `<stop offset="0" stop-color="#2c3440"/><stop offset=".6" stop-color="#3c4552"/><stop offset="1" stop-color="#535c66"/>`;
  let s = `<defs id="dbdefs">
    <linearGradient id="dbSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <linearGradient id="dbMass" x1="0" y1="0" x2="0" y2="330" gradientUnits="userSpaceOnUse">${mass}</linearGradient>
    <linearGradient id="dbSlot" x1="900" y1="0" x2="2400" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${NIGHT ? "#1a2036" : "#d8d0b4"}" stop-opacity="0"/><stop offset=".5" stop-color="${NIGHT ? "#1a2036" : "#e0d6b4"}" stop-opacity=".85"/><stop offset="1" stop-color="${NIGHT ? "#202640" : "#e8dcb8"}" stop-opacity="1"/></linearGradient>
    <linearGradient id="dbFace" x1="0" y1="150" x2="0" y2="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${NIGHT ? "#1e2638" : "#b4b8b8"}"/><stop offset="1" stop-color="${NIGHT ? "#121828" : "#7c868e"}"/></linearGradient>
    <linearGradient id="dbMist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".75" stop-color="${HZ}" stop-opacity=".8"/><stop offset="1" stop-color="${HZ}" stop-opacity=".2"/></linearGradient>
    <radialGradient id="dbSun" cx="1150" cy="420" r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".8"/><stop offset=".5" stop-color="#ffd890" stop-opacity=".25"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>
    <radialGradient id="dbBolt"><stop offset="0" stop-color="#dfe6ff" stop-opacity=".75"/><stop offset=".35" stop-color="#9aa8f0" stop-opacity=".3"/><stop offset="1" stop-color="#6a78c8" stop-opacity="0"/></radialGradient>
    <radialGradient id="dbLamp"><stop offset="0" stop-color="#ffc868" stop-opacity=".9"/><stop offset=".4" stop-color="#ffa850" stop-opacity=".25"/><stop offset="1" stop-color="#ffa850" stop-opacity="0"/></radialGradient>
    <filter id="dbCloudy" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".011 .028" numOctaves="4" seed="17" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="dbPuff" x="-20%" y="-30%" width="140%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.2"/></filter>
    <filter id="dbLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="dbPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="dbSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="dbSoft4"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#dbSky)"/>`;
  if (NIGHT) for (let i = 0; i < 520; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 400, big = rs() < .05;
    if (x > 640 && y < E(x) + TH(x) + 30) continue;
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.5 : F(.45 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(Math.max(.08, (.2 + rs() * .6) * (1 - y / 440)))}"/>`; }
  // the bright slot under the shelf, and a band of distant storm base on the lake horizon
  s += `<rect x="900" y="230" width="${W - 900}" height="${WY - 230}" fill="url(#dbSlot)"/>`;
  s += `<g filter="url(#dbSoft)" opacity="${NIGHT ? .8 : .55}"><path d="M1500,${WY + 5} C1800,392 2200,380 2620,376 L2620,${WY + 5}Z" fill="${NIGHT ? "#0e1220" : "#5c646c"}"/></g>`;
  // the storm mass
  let edge = "";
  for (let x = 690; x <= 2620; x += 20) edge += ` L${x},${F(E(x))}`;
  s += `<g filter="url(#dbCloudy)"><path d="M690,-40${edge} L2620,-40Z" fill="url(#dbMass)"/></g>`;
  // roiling lobes inside the mass, lit faintly from the front
  s += `<g filter="url(#dbPuff)">`;
  for (let i = 0; i < 160; i++) { const x = 760 + rs() * 1860, ey = E(x), y = ey - 10 - Math.pow(rs(), .7) * (ey + 10), R = 30 + rs() * 70;
    if (y < -30) continue;
    const near = sm(1 - (ey - y) / 160);
    const bolt = BOLTS.reduce((m, [bx, by, br]) => Math.max(m, Math.exp(-(((x - bx) / (br * 1.6)) ** 2 + ((y - by) / br) ** 2))), 0);
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(R * 1.6)}" ry="${F(R * .6)}" fill="${NIGHT ? mix("#141c30", "#7a86c0", bolt * .6) : mix("#3a4450", "#8a929a", near * .7)}" opacity="${F(NIGHT ? .22 + .35 * bolt : (.18 + rs() * .25) * (.4 + near * .6))}"/>`; }
  s += `</g>`;
  // shelf face: a smooth lit wedge with striations, then the dark ragged base
  let face = "", base = "", lip = "";
  for (let x = 900; x <= 2620; x += 20) face += ` L${x},${F(E(x) + TH(x))}`;
  let back = ""; for (let x = 2620; x >= 900; x -= 20) back += ` L${x},${F(E(x) - 4)}`;
  s += `<g filter="url(#dbCloudy)"><path d="M900,${F(E(900) - 4)}${face}${back}Z" fill="url(#dbFace)"/></g>`;
  for (let k = 1; k <= 4; k++) { let d = ""; for (let x = 950 + k * 60; x <= 2620; x += 20) d += `${d ? " L" : "M"}${x},${F(E(x) + TH(x) * (k / 5) + 3 * Math.sin(x / 90 + k))}`;
    s += `<path d="${d}" stroke="${NIGHT ? "#2a3248" : k % 2 ? "#d8d8d0" : "#6a747c"}" stroke-width="${F(2 + k * .6)}" fill="none" opacity="${NIGHT ? .3 : .38}" filter="url(#dbSoft4)"/>`; }
  for (let x = 780; x <= 2620; x += 20) lip += `${lip ? " L" : "M"}${x},${F(E(x) + 2)}`;
  s += `<path d="${lip}" stroke="${NIGHT ? "#3a4462" : "#ece6d6"}" stroke-width="5" fill="none" opacity="${NIGHT ? .12 : .7}" filter="url(#dbSoft4)"/>`;
  for (let x = 900; x <= 2620; x += 20) base += ` L${x},${F(E(x) + TH(x) + 14 + 10 * sm((x - 900) / 900))}`;
  let faceR = ""; for (let x = 2620; x >= 900; x -= 20) faceR += ` L${x},${F(E(x) + TH(x) - 2)}`;
  s += `<g filter="url(#dbCloudy)"><path d="M900,${F(E(900) + TH(900))}${base}${faceR}Z" fill="${NIGHT ? "#0a0e18" : "#3c444e"}"/></g>`;
  s += `<g filter="url(#dbPuff)">`;
  for (let i = 0; i < 120; i++) { const x = 920 + rs() * 1700, y = E(x) + TH(x) + 12 + rs() * 18 * sm((x - 900) / 600), R = 8 + rs() * 22;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(R * 1.7)}" ry="${F(R * .55)}" fill="${NIGHT ? "#0a0e18" : rs() < .3 ? "#59626c" : "#3a424c"}" opacity="${F(.6 + rs() * .4)}"/>`; }
  s += `</g>`;
  if (NIGHT) {   // lightning lighting the cloud from inside: soft, broken by the lobes
    s += `<g filter="url(#dbSoft)">`;
    BOLTS.forEach(([x, y, r, o]) => { for (let k = 0; k < 5; k++) { const ox = (rs() - .5) * r, oy = (rs() - .5) * r * .5, rr = r * (.5 + rs() * .6);
      s += `<ellipse cx="${F(x + ox)}" cy="${F(y + oy)}" rx="${F(rr * 1.4)}" ry="${F(rr * .55)}" fill="url(#dbBolt)" opacity="${F(o * .35)}"/>`; } });
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: sunlit cumulus in the clear sky on the left, scud under the shelf ---------------- */
  const cumulus = (cx, by, w, h, cls) => {
    let c = `<g class="${cls}"><g filter="url(#dbPuff)">`;
    const pts = [];
    for (let i = 0; i < 70; i++) { const u = rc() * 2 - 1, v = Math.pow(rc(), .8), R = w * (.07 + rc() * .08) * (1 - v * .45);
      const x = cx + u * w * .5 * (1 - v * .55), y = by - v * h + R * .5;
      const b = .35 + .65 * Math.max(0, u * .55 + v * .7 + (rc() - .5) * .3);
      pts.push([x, y, R, b]); }
    pts.sort((a, b) => a[3] - b[3]).forEach(([x, y, R, b]) => {
      const col = NIGHT ? mix("#10162a", "#2a3456", b * .6) : b < .4 ? "#b4bccc" : b < .6 ? "#d4dae2" : b < .8 ? "#eef0f2" : "#fffcf2";
      c += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(R * 1.25)}" ry="${F(R)}" fill="${col}"/>`; });
    c += `<ellipse cx="${F(cx)}" cy="${F(by + 2)}" rx="${F(w * .52)}" ry="${F(h * .06)}" fill="${NIGHT ? "#0e1428" : "#aeb6c4"}"/>`;
    return c + `</g></g>`; };
  s += `<g opacity="${NIGHT ? .55 : .9}">` + cumulus(470, 330, 300, 150, "drift1") + cumulus(180, 352, 180, 70, "drift2") + cumulus(760, 300, 150, 60, "drift3") + `</g>`;
  s += `<g class="drift2" filter="url(#dbPuff)" opacity="${NIGHT ? .6 : .85}">`;     // ragged scud below the shelf
  for (let i = 0; i < 26; i++) { const x = 1250 + rc() * 1300, y = E(x) + TH(x) + 40 + rc() * 40, w0 = 40 + rc() * 90;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(w0)}" ry="${F(w0 * .12)}" fill="${NIGHT ? "#0c1020" : "#4c545e"}" opacity="${F(.4 + rc() * .4)}"/>`; }
  s += `</g>`;
  if (!NIGHT) {   // gulls riding the wind ahead of the storm
    s += `<g class="birds">`;
    [[1610, 318, 1], [1668, 300, .8], [1712, 334, .7], [1560, 345, .6], [1760, 312, .55]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 13 * k)},${F(y + 3 * k)} q${F(6 * k)},${F(-7 * k)} ${F(13 * k)},${F(-1 * k)} q${F(7 * k)},${F(-6 * k)} ${F(13 * k)},${F(2 * k)}" fill="none" stroke="#f4f2ec" stroke-width="${F(2.6 * k)}" stroke-linecap="round"/>`
        + `<path d="M${F(x - 13 * k)},${F(y + 3 * k)} q${F(2 * k)},${F(-3 * k)} ${F(4 * k)},${F(-3.5 * k)} M${F(x + 13 * k)},${F(y + 2 * k)} q${F(-2 * k)},${F(-3 * k)} ${F(-4 * k)},${F(-3.5 * k)}" fill="none" stroke="#2a2a30" stroke-width="${F(2.4 * k)}" stroke-linecap="round"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 30 m above the lake on our bluff's upper face (camera at x 0, z 0). Land is x < xc(z):
     our dune runs down to a bay shore crossing in front of us at about z 110, the bay curls in to
     the left and the headland juts back out to its tip at about z 915. Beyond it the far bluffs
     recede toward the left of the horizon; open lake to the right. */
  const KN = [[-80, 76], [0, 60], [60, 28], [130, -30], [200, -64], [280, -120], [380, -165], [520, -212], [640, -172], [740, -42], [830, 70], [915, 116], [1040, 74], [1300, -120], [1700, -380], [2600, -850], [4000, -1350], [6000, -1900], [9000, -2700], [15000, -4300], [30000, -8000], [70000, -18500]];
  const tang = KN.map((p, i) => { const a = KN[Math.max(0, i - 1)], b = KN[Math.min(KN.length - 1, i + 1)]; return (b[1] - a[1]) / (b[0] - a[0]); });
  const xcBase = z => {
    let i = 0; while (i < KN.length - 2 && z > KN[i + 1][0]) i++;
    const [z0, x0] = KN[i], [z1, x1] = KN[i + 1], dz = z1 - z0, t = Math.max(0, Math.min(1, (z - z0) / dz)), t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * x0 + (t3 - 2 * t2 + t) * dz * tang[i] + (-2 * t3 + 3 * t2) * x1 + (t3 - t2) * dz * tang[i + 1]; };
  // lookup tables: 0.5 m steps to 3 km, then 0.05 % steps
  const NA = 6400, NB = 9000, TA = new Float32Array(NA + 2), TB = new Float32Array(NB + 2), CA = new Float32Array(NA + 2), CB = new Float32Array(NB + 2);
  const xcRaw = z => xcBase(z) + (6 * N1(z / 40, 1.3) + 2.5 * N2(z / 17, 4.1)) * sm((z - 60) / 200);
  const zA = i => i * .5 - 80, zB = i => 3120 * Math.exp(i * .0005);
  for (let i = 0; i <= NA + 1; i++) { const z = zA(i); TA[i] = xcRaw(z); const d = (xcRaw(z + 1) - xcRaw(z - 1)) / 2; CA[i] = 1 / Math.sqrt(1 + d * d); }
  for (let i = 0; i <= NB + 1; i++) { const z = zB(i); TB[i] = xcRaw(z); const d = (xcRaw(z * 1.002) - xcRaw(z * .998)) / (z * .004); CB[i] = 1 / Math.sqrt(1 + d * d); }
  const look = (A, B, z) => { if (z < 3120) { const u = Math.max(0, (z + 80) * 2), i = Math.min(NA, Math.floor(u)), f = u - i; return A[i] + (A[i + 1] - A[i]) * f; }
    const u = Math.min(NB, Math.log(z / 3120) / .0005), i = Math.floor(u), f = u - i; return B[i] + (B[i + 1] - B[i]) * f; };
  const xc = z => look(TA, TB, z), csA = z => look(CA, CB, z);
  const Htop = z => 27 + 18 * sm((z - 180) / 150) + 59 * sm((z - 660) / 230) - 32 * sm((z - 1150) / 450) - 12 * sm((z - 3000) / 6000) + 6 * N2(z / 300, 4);
  const geo = (x, z) => {
    const d = (xc(z) - x) * csA(z), Ht = Htop(z) + 5 * N2(x / 200, z / 200), bw = 13 + 5 * N1(z / 70, 2.2), run = 1.45 * Ht + 12;
    return { d, Ht, bw, run, t: (d - bw) / run }; };
  const forestEdge = (x, z, g) => g.bw + g.run + 15 + 14 * Math.abs(N3(x / 50, z / 50));
  const plateau = (x, z, g) => Math.max(20, g.Ht + 3 * N2(x / 90, z / 90) + 1.5 * N1(x / 25, z / 25) - .25 * Math.max(0, g.d - g.bw - g.run) * sm((z - 260) / 200));
  const fcache = new Map();
  const inForest = (x, z) => { if (z < 240) return false; const g = geo(x, z); return g.d > forestEdge(x, z, g); };
  const CS = 10;
  const crown = (x, z) => { const gx = Math.floor(x / CS), gz = Math.floor(z / CS); let best = 0, id = -1;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const i = gx + a, j = gz + b, key = i * 100003 + j;
      let ok = fcache.get(key); const cx = (i + .15 + .7 * hash(i, j)) * CS, cz = (j + .15 + .7 * hash(j + 3.1, i)) * CS;
      if (ok === undefined) { ok = inForest(cx, cz); fcache.set(key, ok); } if (!ok) continue;
      const R = CS * (.55 + .35 * hash(i + 7, j)), d2 = ((x - cx) ** 2 + (z - cz) ** 2) / (R * R); if (d2 >= 1) continue;
      const hh = 1 + (1 - d2) * (1 + .35 * d2) * (11 + 7 * hash(i, j + 5)); if (hh > best) { best = hh; id = key; } }
    return [best, id]; };
  const hT = (x, z) => {
    const g = geo(x, z);
    if (g.d < 0) return -1;
    if (g.d < g.bw) return .25 + 1.6 * Math.pow(g.d / g.bw, 1.6);
    const hg = ground(x, z, g);
    if (z > 240 && g.t > .8) { const [cb] = crown(x, z); if (cb > 0) return hg + cb + 1.4 * N3(x / 2.4, z / 2.4) + .6 * N2(x / 1.1, z / 1.1); }   // crowns stand on the slope at the crest
    return hg; };
  function ground(x, z, g) {
    const pl = plateau(x, z, g);
    let hg;
    if (g.t < 1) { const t = g.t, p = .3 * sm(t) + .7 * Math.pow(t, 1.45), hump = Math.sin(Math.PI * Math.min(1, t * 1.05));
      const gully = 1 - Math.abs(N3(x / 30 + z / 45 + 2 * N1(x / 140, z / 140), t * 1.6 + .3));
      hg = 1.85 + (g.Ht - 1.85) * p + hump * (g.Ht * .042 * gully * (.5 + .5 * N2(x / 80, z / 80)) + 1.1 * N4(x / 9, z / 9) + .5 * N1(x / 3.5, z / 3.5)); }
    else hg = pl + (z < 260 ? 1.8 * N4(x / 14, z / 14) : 0);
    return hg; }

  /* colour: the raster lights it; this picks the material */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const FALL = ["#c8402a", "#d8662a", "#e09030", "#e8b840", "#b85a26", "#8a6a2e", "#3a5236", "#c8a83a", "#a83228", "#dca84a", "#2e4430", "#e0782e"].map(H3);
  const SAND = H3("#e6d2a8"), SAND2 = H3("#cdb084"), WETS = H3("#a89878"), GULLY = H3("#a88a64"), DUNEG = H3("#aaa260"), DUNEG2 = H3("#c4b874"), SHRUB = H3("#7a7a3e"), DUNG = H3("#3a3222"), FLOOR = H3("#8a6a3a");
  const col = (x, y, z, n, ao) => {
    const g = geo(x, z), steep = 1 - n[1], k = N1(x / 30, z / 30) * .5 + N2(x / 8, z / 8) * .3;
    if (z > 240 && g.t > .8) { const [cb, id] = crown(x, z), pl = ground(x, z, g);
      if (cb > 0 && y - pl > 5 + N1(x / 4, z / 4)) { const kk = Math.floor(hash(id % 7919, id / 7919) * FALL.length);
        return FALL[kk].map(q => q * (.84 + .2 * hash(id, 3.3)) * (.82 + .18 * sm((y - pl - 5) / 10))); }
      if (cb > 0 && g.t >= 1) return L3(DUNG, FLOOR, .3 + .3 * N2(x / 3, z / 3)); }
    if (g.d < g.bw) { const t = sm(g.d / 3); return L3(WETS, SAND, t).map(v => v * (.95 + .08 * N2(x / 2, z / 2))); }
    if (g.t < 1) {
      let c = L3(SAND, SAND2, .45 + k * .8 + steep * .4);
      if (ao < -.15) c = L3(c, GULLY, (-ao - .15) * 1.4);
      const veg = (.12 - steep) * 5 + k * 1.3 + (g.t > .82 ? (g.t - .82) * 5 : 0) + (g.t < .1 ? .3 : 0) - .18;
      if (veg > 0) c = L3(c, L3(DUNEG, N3(x / 5, z / 5) > .3 ? SHRUB : DUNEG2, .5 + N4(x / 3, z / 3)), Math.min(1, veg) * .85);
      return c; }
    // open dune top: beach grass, sand blowouts
    const bl = N3(x / 40, z / 40) + .4 * N1(x / 12, z / 12);
    return L3(L3(DUNEG, DUNEG2, .5 + N2(x / 6, z / 6)), SAND, sm((bl - .25) * 3)).map(v => v * (.92 + .12 * N4(x / 1.5, z / 1.5))); };

  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.2, .8, .3] : LV, tone: T, fog: HZ, fogK: .00005,
    shadow: NIGHT ? "#04060e" : "#3a3050", rim: NIGHT ? "#b8c8f0" : "#fff0d0", shade: .5, hi: .25, night: NIGHT, lamp: "#ffc868" });
  const RT = { tone: rgbTone(T), fog: HZ, fogK: .00005, amb: NIGHT ? .55 : .42, light: NIGHT ? [-.2, .8, .3] : LV, noRefl: true };
  w.raster({ ...RT, z0: 2600, z1: 70000, step: .0011, minStep: .5, scale: .75, top: 300, bottom: WY + 6, h: hT, col });
  w.raster({ ...RT, z0: 330, z1: 2600, step: .0004, minStep: .1, scale: .75, top: 150, bottom: H, h: hT, col });
  w.raster({ ...RT, z0: 6, z1: 330, step: .0008, minStep: .08, scale: .75, top: 300, bottom: H, h: hT, col, key: 330 });

  /* ---------------- the lake: per-pixel water ----------------
     shallows and sandbars by distance offshore, whitecaps in world metres, the storm darkening the
     open water to the right, the headland's reflection traced and broken by the chop */
  const water = (() => {
    const Hd = H - WY, cv = document.createElement("canvas"); cv.width = W; cv.height = Hd;
    const ctx = cv.getContext("2d"), img = ctx.createImageData(W, Hd), D = img.data;
    const NT = c => NIGHT ? c.map((v, i) => (v * .5 + [74, 84, 120][i] * .5) * .32 + [6, 10, 30][i] * .68) : c;
    const DEEPN = H3(NIGHT ? "#16304a" : "#24586a"), DEEPF = H3(NIGHT ? "#202a44" : "#6a8a96"), STORM = H3(NIGHT ? "#0c1222" : "#2e3e4a"), SLOT = H3(NIGHT ? "#262c48" : "#d4ccb0");
    const TURQ = H3("#3cb0b4"), SHAL = H3("#9ad8c8"), BAR = H3("#7accc0"), FOAM = H3("#f4f6f2"), HZR = H3(HZ);
    // mirror buffer: per column, the land traced in the mirrored world (land beyond water does reflect here)
    // In the mirror, land farther and higher shows lower on screen, so fill downward from the waterline.
    const MR = new Float32Array(W * Hd * 3), MA = new Float32Array(W * Hd);
    for (let i = 0; i < W; i += 1) {
      const dx = (i + .5 - 1280) / FL; let ybot = -1, ywl = -1, wet = false;
      for (let z = 250; z < 4000; z += Math.max(.5, z * .004)) {
        const x = dx * z, h = hT(x, z); if (h < 0) { wet = true; continue; }
        if (!wet) continue;                       // our own dune in front: nothing to mirror yet
        const ys = Math.floor(FL * (EYE + h) / z); if (ywl < 0) { ywl = ybot = Math.floor(FL * EYE / z); }
        if (ys <= ybot) continue;
        const g = geo(x, z), c = g.d < g.bw ? [214, 196, 160] : g.t < 1 ? [206, 180, 136] : h > plateau(x, z, g) + 4 ? [150, 92, 44] : [160, 150, 96];
        for (let y = ybot; y < Math.min(Hd, ys); y++) { const p = y * W + i; MR[p * 3] = c[0]; MR[p * 3 + 1] = c[1]; MR[p * 3 + 2] = c[2]; MA[p] = Math.exp(-(y - ywl) / 38); }
        ybot = ys; if (ybot >= Hd) break; } }
    for (let y = 0; y < Hd; y++) {
      const z = FL * EYE / (y + .5), csz = csA(z), xcz = xc(z), haze = 1 - Math.exp(-z * .00005), far = sm((z - 300) / 6000);
      for (let i = 0; i < W; i++) {
        const x = (i + .5 - 1280) * z / FL, off = (x - xcz) * csz, p = (y * W + i) * 4;
        let c = L3(DEEPN, DEEPF, far);
        c = L3(c, STORM, sm((i - 1250) / 1100) * (.45 + .55 * sm((z - 600) / 4000)));
        if (y < 14) c = L3(c, SLOT, (1 - y / 14) * sm((i - 1100) / 900) * .7);
        if (!NIGHT && off < 160) { const sb = Math.exp(-((off - 48) ** 2) / 90) + .8 * Math.exp(-((off - 98) ** 2) / 160);
          let sh = L3(TURQ, SHAL, sm((22 - off) / 18)); sh = L3(sh, BAR, sb * .5);
          c = L3(c, sh, sm((160 - off) / 90) * (.9 - .3 * sm((z - 900) / 800))); }
        // chop: long wind-driven ridges, brighter faces toward us
        const v = N1(x / 7, z / 2.2) * .6 + N2(x / 2.6, z / .8) * .4;
        c = c.map(q => q * (1 + .14 * v * (1 - far * .7)));
        // reflections, broken by the chop
        const yy = Math.max(0, Math.min(Hd - 1, y + Math.round(v * 4 * (1 - far)))), mp = yy * W + i;
        if (MA[mp] > 0) c = L3(c, [MR[mp * 3] * .7, MR[mp * 3 + 1] * .7, MR[mp * 3 + 2] * .7], MA[mp] * (.32 + .2 * v));
        // whitecaps and surf
        const wc = N3(x / 3.2, z / 1.3) + .4 * N4(x / 1.1, z / .6);
        if (z < 4000 && wc > .62 && off > 30) c = L3(c, FOAM, (wc - .62) * 4 * (1 - sm(z / 4000)) * (NIGHT ? .35 : .95));
        if (off >= 0 && off < 26) { const surf = Math.max(Math.exp(-((off - 1.5) ** 2) / 2), .8 * Math.exp(-((off - 9 - 2 * N1(x / 20, 1)) ** 2) / 3), .55 * Math.exp(-((off - 19) ** 2) / 4));
          c = L3(c, FOAM, surf * (.55 + .45 * N2(x / 4, off / 3)) * (NIGHT ? .3 : .9)); }
        c = L3(c, HZR, haze);
        c = NT(c);
        D[p] = c[0]; D[p + 1] = c[1]; D[p + 2] = c[2]; D[p + 3] = 255; } }
    ctx.putImageData(img, 0, 0);
    return `<image href="${cv.toDataURL("image/png")}" x="0" y="${WY}" width="${W}" height="${Hd}"/>`; })();

  /* ---------- near hardwoods on the high ground at the left: trunks, limbs, lit leaf clusters ---------- */
  const RAMPS = {
    red: ["#3e1410", "#5e1e16", "#82281c", "#a43424", "#c0482c", "#d8663a", "#ea8e50", "#f6b878"],
    orange: ["#4a2410", "#6e3414", "#94481a", "#b86020", "#d27c2a", "#e49a3a", "#f0b856", "#f8d488"],
    gold: ["#4a3a1a", "#6a5220", "#8e6c22", "#b08a26", "#cca232", "#e0bc3e", "#eed25a", "#f8e48a"] };
  const tree = Tr => (px, py, k, fog) => {
    const rr = rng(Tr.seed), C = c => T(mix(c, HZ, fog)), ramp8 = RAMPS[Tr.ramp];
    let o = `<g filter="url(#dbLeafy)"><ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(Tr.cw * .45 * k)}" ry="${F(Math.max(1.2, .8 * k))}" fill="#000" opacity=".22"/>`;
    const lean = Tr.lean * k, fx0 = px + lean, fy0 = py - Tr.fork * k, bw = Tr.bw * k, tw = Tr.bw * .6 * k;
    o += `<path d="M${F(px - bw / 2)},${F(py)} Q${F(px + lean * .3)},${F(py - Tr.fork * k * .5)} ${F(fx0 - tw / 2)},${F(fy0)} L${F(fx0 + tw / 2)},${F(fy0)} Q${F(px + bw * .3 + lean * .4)},${F(py - Tr.fork * k * .5)} ${F(px + bw / 2)},${F(py)}Z" fill="${C(Tr.bark)}"/>`;
    o += `<path d="M${F(px + bw * .1)},${F(py)} Q${F(px + bw * .2 + lean * .4)},${F(py - Tr.fork * k * .5)} ${F(fx0 + tw * .1)},${F(fy0)} L${F(fx0 + tw / 2)},${F(fy0)} Q${F(px + bw * .3 + lean * .4)},${F(py - Tr.fork * k * .5)} ${F(px + bw / 2)},${F(py)}Z" fill="${C(mix(Tr.bark, "#fff4e0", .35))}" opacity=".85"/>`;
    Tr.lobes.forEach(([dx, dy]) => { const ex = px + dx * k, ey = py - dy * k;
      o += `<path d="M${F(fx0)},${F(fy0)} Q${F((fx0 + ex) / 2 + (rr() - .5) * 2 * k)},${F((fy0 + ey) / 2 + k)} ${F(ex)},${F(ey)}" stroke="${C(mix(Tr.bark, "#000000", .2))}" stroke-width="${F(Math.max(.7, .28 * k))}" fill="none" stroke-linecap="round"/>`; });
    const rc2 = Math.max(1.4, .55 * k), cl = [];
    Tr.lobes.forEach(([dx, dy, rx, ry]) => {
      const n = Math.max(10, Math.min(200, Math.round(rx * ry * k * k / (rc2 * rc2 * 1.2))));
      for (let i = 0; i < n; i++) { const a = rr() * Math.PI * 2, d = Math.sqrt(rr()), u = Math.cos(a) * d, v = Math.sin(a) * d;
        const nz = -Math.sqrt(Math.max(0, 1 - u * u - v * v)), b = NIGHT ? .1 + .3 * rr() : .22 + .78 * Math.max(0, u * LV[0] + v * LV[1] - nz * LV[2] * .4 + .15);
        cl.push([px + (dx + u * rx) * k - Tr.wind * v * k * .4, py - (dy + v * ry) * k, b + (rr() - .5) * .18]); } });
    cl.sort((a, b) => a[2] - b[2]).forEach(([x, y, b]) => {
      const i = Math.max(0, Math.min(7, Math.floor(b * 8))), R = rc2 * (.7 + rr() * .6);
      o += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(R)}" ry="${F(R * (.6 + rr() * .3))}" transform="rotate(${F(rr() * 180)} ${F(x)} ${F(y)})" fill="${C(ramp8[i])}"/>`; });
    return o + `</g>`; };
  const TREES = [];
  for (let a = 0; a < 3000 && TREES.length < 4; a++) {
    const p = 40 + rt() * 560, z = 150 + rt() * 300, x = wx(p, z), g = geo(x, z);
    if (g.t < .92 || hT(x, z) < 18) continue;
    const yb = sy(hT(x, z), z); if (yb < 420 || yb > 540) continue;
    if (TREES.some(t => Math.abs(sx(t.x, t.z) - p) < 140)) continue;
    const h = 11 + rt() * 5, cw = 8 + rt() * 5, fork = 3 + rt() * 2, lobes = [[0, (fork + h) / 2 + .5, cw * .42, (h - fork) * .42]];
    const nl = 4 + Math.floor(rt() * 3);
    for (let i = 0; i < nl; i++) { const rx = 2.2 + rt() * 1.8, ry = 2 + rt() * 1.6; lobes.push([(rt() - .5) * (cw - rx * 1.4), fork + ry + rt() * (h - fork - ry * 2), rx, ry]); }
    const rp = rt(), Tr = { x, z, h, cw, fork, lobes, lean: -.4 - rt() * .8, wind: .8, bw: .5 + rt() * .2, seed: Math.floor(rt() * 1e6),
      ramp: rp < .4 ? "red" : rp < .75 ? "orange" : "gold", bark: rp < .3 ? "#d8d4c8" : "#4e4236" };
    TREES.push(Tr);
    w.sprite({ x, z, y: hT(x, z) - .2, fn: tree(Tr) }); }

  /* ---------- ghost-forest snags on the headland face: old trees the moving dune buried and let go ---------- */
  for (let a = 0, n = 0; a < 4000 && n < 7; a++) {
    const z = 760 + rg() * 260, p = 900 + rg() * 600, x = wx(p, z), g = geo(x, z);
    if (g.t < .45 || g.t > .9) continue;
    n++; const sd = Math.floor(rg() * 1e6), hgt = 6 + rg() * 6;
    w.sprite({ x, z, y: hT(x, z) - .3, fn: (px, py, k, fog) => { const r2 = rng(sd), C = c => T(mix(c, HZ, fog));
      let o = ""; const br = (bx, by, ang, L, wd, dep) => { if (dep > 3 || L * k < 1) return; const ex = bx + Math.cos(ang) * L * k, ey = by + Math.sin(ang) * L * k;
        o += `<line x1="${F(bx)}" y1="${F(by)}" x2="${F(ex)}" y2="${F(ey)}" stroke="${C(dep ? "#c8c4bc" : "#b8b2a8")}" stroke-width="${F(Math.max(.6, wd * k))}" stroke-linecap="round"/>`;
        br(ex, ey, ang - .5 - r2() * .4, L * .6, wd * .6, dep + 1); if (r2() < .7) br(ex, ey, ang + .4 + r2() * .4, L * .55, wd * .55, dep + 1); };
      br(px, py, -Math.PI / 2 + (r2() - .5) * .3, hgt * .6, .45, 0);
      o += `<line x1="${F(px + .15 * k)}" y1="${F(py)}" x2="${F(px + .1 * k)}" y2="${F(py - hgt * .5 * k)}" stroke="${C("#f2eee4")}" stroke-width="${F(Math.max(.4, .12 * k))}" opacity=".7"/>`;
      return o; } }); }

  /* ---------- marram grass on our dune, bent by the wind off the lake ---------- */
  for (let a = 0, n = 0; a < 3000 && n < 260; a++) {
    const z = 18 + Math.pow(rg(), 1.4) * 320, x = wx(-60 + rg() * 1500, z), h = hT(x, z);
    if (h < 2.2) continue;
    const g = geo(x, z); if (g.t > 1.05 && z > 240) continue;
    n++; const sd = Math.floor(rg() * 1e6), sz = .55 + rg() * .5;
    w.sprite({ x, z, y: h - .05, fn: (px, py, k, fog) => { const r2 = rng(sd), m = sz * k, C = c => T(mix(c, HZ, fog));
      let o = `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(m * .7)}" ry="${F(Math.max(.4, m * .1))}" fill="#000" opacity=".16"/>`;
      const nb = 9 + Math.floor(r2() * 8);
      for (let i = 0; i < nb; i++) { const bx = px + (r2() - .5) * m * .5, L = m * (.6 + r2() * .55), bend = -(0.35 + r2() * .45) * L;
        const b = r2(), c = NIGHT ? "#6a7a5a" : b < .3 ? "#8a8a46" : b < .6 ? "#b4a85a" : b < .85 ? "#d2c47a" : "#ece0a0";
        o += `<path d="M${F(bx)},${F(py)} Q${F(bx + (r2() - .5) * m * .2)},${F(py - L * .6)} ${F(bx + bend)},${F(py - L * .85)}" stroke="${C(c)}" stroke-width="${F(Math.max(.5, .025 * k))}" fill="none" stroke-linecap="round"/>`; }
      return o; } }); }

  /* ---------- a sloop running for the bay (day), a freighter far out ---------- */
  if (!NIGHT) {
    const bz = 470, bx = wx(1140, bz);
    w.sprite({ x: bx, z: bz, y: 0, fn: (px, py, k, fog) => { const C = c => mix(c, HZ, fog);
      let o = "";
      for (let i = 0; i < 9; i++) o += `<path d="M${F(px + (3.6 + i * 1.6) * k)},${F(py + (.1 + i * .05) * k)} l${F(1.4 * k)},${F(.05 * k)}" stroke="#f6f8f4" stroke-width="${F(Math.max(.6, .18 * k * (1 - i / 10)))}" opacity="${F(.85 - i * .08)}" stroke-linecap="round"/>`;
      o += `<ellipse cx="${F(px)}" cy="${F(py + .25 * k)}" rx="${F(4.4 * k)}" ry="${F(.35 * k)}" fill="#1a2a34" opacity=".35"/>`;
      o += `<g transform="rotate(-9 ${F(px)} ${F(py)})">`;
      o += `<path d="M${F(px - 4.3 * k)},${F(py - 1.25 * k)} L${F(px + 3.9 * k)},${F(py - 1.05 * k)} L${F(px + 3.2 * k)},${F(py)} L${F(px - 3 * k)},${F(py)}Z" fill="${C("#22324e")}"/>`
        + `<path d="M${F(px - 4.3 * k)},${F(py - 1.25 * k)} L${F(px + 3.9 * k)},${F(py - 1.05 * k)} L${F(px + 3.8 * k)},${F(py - .85 * k)} L${F(px - 4 * k)},${F(py - 1.02 * k)}Z" fill="${C("#e8e6e0")}"/>`
        + `<line x1="${F(px - 1 * k)}" y1="${F(py - 1.2 * k)}" x2="${F(px - 1 * k)}" y2="${F(py - 13 * k)}" stroke="${C("#d8d8d4")}" stroke-width="${F(Math.max(.6, .1 * k))}"/>`
        + `<path d="M${F(px - .8 * k)},${F(py - 12.6 * k)} Q${F(px + 1.6 * k)},${F(py - 7 * k)} ${F(px + 3.3 * k)},${F(py - 2.1 * k)} L${F(px - .8 * k)},${F(py - 1.9 * k)}Z" fill="${C("#f6f4ee")}"/>`
        + `<path d="M${F(px - .8 * k)},${F(py - 12.6 * k)} Q${F(px + .4 * k)},${F(py - 7 * k)} ${F(px + 1 * k)},${F(py - 2.05 * k)} L${F(px - .8 * k)},${F(py - 1.9 * k)}Z" fill="${C("#cfd2d8")}" opacity=".7"/>`
        + `<path d="M${F(px - 1.2 * k)},${F(py - 11.4 * k)} Q${F(px - 2.6 * k)},${F(py - 6 * k)} ${F(px - 4.1 * k)},${F(py - 1.5 * k)} L${F(px - 1.4 * k)},${F(py - 2.2 * k)}Z" fill="${C("#ecebe6")}"/>`
        + `<path d="M${F(px - 1.2 * k)},${F(py - 11.4 * k)} L${F(px - 1.4 * k)},${F(py - 2.2 * k)} L${F(px - 2 * k)},${F(py - 2.1 * k)} Q${F(px - 1.8 * k)},${F(py - 7 * k)} ${F(px - 1.2 * k)},${F(py - 11.4 * k)}Z" fill="${C("#b8bcc6")}" opacity=".7"/>`
        + `<line x1="${F(px - .8 * k)}" y1="${F(py - 1.95 * k)}" x2="${F(px + 3.4 * k)}" y2="${F(py - 2.1 * k)}" stroke="${C("#6a6a70")}" stroke-width="${F(Math.max(.5, .1 * k))}"/>`;
      o += `</g><path d="M${F(px - 4.6 * k)},${F(py + .05 * k)} q${F(-.6 * k)},${F(-.7 * k)} ${F(-1.4 * k)},${F(-.3 * k)}" stroke="#f8faf6" stroke-width="${F(Math.max(.7, .3 * k))}" fill="none" opacity=".8"/>`;
      return o; } });
  }
  { const fz = 13000, fx = wx(2160, fz);
    w.sprite({ x: fx, z: fz, y: 0, fn: (px, py, k, fog) => { const C = c => T(mix(c, HZ, fog * .6)), L = 200 * k;
      let o = `<path d="M${F(px - L / 2)},${F(py - 1.6)} L${F(px + L / 2)},${F(py - 1.6)} L${F(px + L / 2 - 1)},${F(py)} L${F(px - L / 2 + 1)},${F(py)}Z" fill="${C("#3a3a42")}"/>`
        + `<rect x="${F(px + L / 2 - 6)}" y="${F(py - 4)}" width="4" height="2.6" fill="${C("#e8e6e0")}"/><rect x="${F(px - L / 2 + 1)}" y="${F(py - 3)}" width="2" height="1.6" fill="${C("#e8e6e0")}"/>`;
      if (NIGHT) o += `<circle cx="${F(px + L / 2 - 4)}" cy="${F(py - 5)}" r="1.2" fill="#fff0c8"/><circle cx="${F(px - L / 2 + 2)}" cy="${F(py - 3.6)}" r="1" fill="#fff0c8"/><circle cx="${F(px + L / 2 - 4)}" cy="${F(py - 5)}" r="7" fill="url(#dbLamp)" opacity=".6"/>`
        + `<circle cx="${F(px)}" cy="${F(py - 2)}" r=".8" fill="#ffd8a0"/><circle cx="${F(px + L / 4)}" cy="${F(py - 2)}" r=".7" fill="#ffd8a0"/>`;
      return o; } }); }

  /* ---------------- assemble ---------------- */
  s += water;
  s += w.draw({ where: o => o.raster && o.key > 1e5 });
  s += `<rect x="0" y="330" width="${W}" height="96" fill="url(#dbMist)" opacity="${NIGHT ? .35 : .5}"/>`;
  if (NIGHT) {   // far-shore towns along the receding coast, and lightning reflected far out on the lake
    const skyl = {}, top = p => { const c = Math.round(p / 3); if (skyl[c] !== undefined) return skyl[c]; let m = 1e9;
      for (let d = 200; d < 3000; d += Math.max(1, d * .005)) { const h = hT(wx(c * 3, d), d); if (h >= 0) m = Math.min(m, sy(h, d)); } return skyl[c] = m; };
    s += `<g>`;
    for (let i = 0; i < 260; i++) { const z = 3000 + 30000 * Math.pow(rg(), 1.6), x = xc(z) - 30 - rg() * 400 * Math.min(1, z / 6000);
      const h = Math.min(hT(x, z), 60) + 3, p = sx(x, z), q = sy(h, z); if (p < 0 || p > 1100 || q > top(p) - 1) continue;
      const c = rg(); s += `<circle cx="${F(p)}" cy="${F(q)}" r="${F(.5 + rg() * .7)}" fill="${c < .65 ? "#ffb860" : "#ffe0a8"}" opacity="${F(.4 + rg() * .5)}"/>`; }
    s += `<ellipse cx="1950" cy="${WY + 12}" rx="420" ry="16" fill="url(#dbBolt)" opacity=".45"/></g>`;
  }
  s += w.draw({ where: o => !(o.raster && o.key > 1e5) });
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#dbSun)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#dbPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrapS = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrapS(skyPart);
  if (opts.part === "clouds") return wrapS(cloudPart);
  if (opts.part === "land") return wrapS(s);
  return wrapS(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
