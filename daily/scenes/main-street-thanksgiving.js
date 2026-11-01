/* Main Street, Thanksgiving week: a New England village green in late November.
   Standing on the green at eye level: across it, at the head of the green, a white
   clapboard meeting house with a square tower, louvred belfry, clock, octagonal
   lantern and tall spire, behind a white picket fence. Main Street runs up the
   left side of the green past a general store (porch, corn shocks, pumpkins) and
   clapboard houses; a second street runs up the right side behind a fieldstone
   wall, past the inn, and bends away right. The elms and maples are bare, the oaks
   still hold their bronze leaves, white pines stand dark in the woods behind, and
   low blue-grey hills close the valley. A flock of wild turkeys forages on the
   green, a tom strutting with his fan up. Low afternoon sun off the left edge,
   pale gold and cold blue.
   opts.time === "night": a near-full moon right of the steeple, stars, lit windows
   with candles, the steeple floodlit, street lamps, the turkeys gone to roost.
   Built with world3d() (reference/scene-helpers.js): buildings, trees, walls and
   birds are placed in metres and seen by one eye-level camera.
   Needs rng(), mix(), world3d(), mountainField(), mountainColor(), rgbTone().
   opts.part = "sky" | "clouds" | "land".                                    */
function mainStreetThanksgivingArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1126;
  const r = rng(seed), rs = rng(seed + 5), rt = rng(seed + 17), rg = rng(seed + 31), rh = rng(seed + 47), rw = rng(seed + 59);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const WY = 440, EYE = 1.7, FL = 1500;
  const LX = NIGHT ? 1468 : -160, LY = NIGHT ? 132 : 318;
  const T = c => NIGHT ? mix(mix(c, "#6c7290", .45), "#0a0e28", .6) : c;
  const HZ = NIGHT ? "#283050" : "#e6dccb", RIM = NIGHT ? "#a8b4e0" : "#fff0cc", SHADE = NIGHT ? "#04060e" : "#2e3046", LAMP = "#ffc46a";
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

  /* ---------------- sky: cold blue over a pale gold horizon, or a moonlit night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#040720"/><stop offset=".5" stop-color="#0e1640"/><stop offset=".86" stop-color="#26305a"/><stop offset="1" stop-color="#3c4064"/>`
    : `<stop offset="0" stop-color="#4c7cb0"/><stop offset=".4" stop-color="#86a8c8"/><stop offset=".74" stop-color="#cfd2cc"/><stop offset=".9" stop-color="#ecdcbc"/><stop offset="1" stop-color="#f4dcb0"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#dfe6ff" stop-opacity=".34"/><stop offset=".25" stop-color="#9aa8d8" stop-opacity=".12"/><stop offset="1" stop-color="#9aa8d8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d8" stop-opacity=".75"/><stop offset=".2" stop-color="#ffe0a0" stop-opacity=".38"/><stop offset=".55" stop-color="#ffd08a" stop-opacity=".14"/><stop offset="1" stop-color="#ffd08a" stop-opacity="0"/>`;
  let s = `<defs id="mtdefs">
    <linearGradient id="mtSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="mtLight" cx="${LX}" cy="${LY}" r="${NIGHT ? 900 : 1900}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="mtHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".8"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="mtGlow"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".4"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="mtWarm"><stop offset="0" stop-color="#ffbe6a" stop-opacity=".55"/><stop offset=".5" stop-color="#ff9e48" stop-opacity=".18"/><stop offset="1" stop-color="#ff9e48" stop-opacity="0"/></radialGradient>
    <radialGradient id="mtFlood"><stop offset="0" stop-color="#fff4dc" stop-opacity=".5"/><stop offset=".55" stop-color="#ffe6b8" stop-opacity=".16"/><stop offset="1" stop-color="#ffe6b8" stop-opacity="0"/></radialGradient>
    <filter id="mtLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".14" numOctaves="2" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="mtTwig" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".3" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="mtCloudy" x="-20%" y="-60%" width="140%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".011 .03" numOctaves="3" seed="41" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.4"/></filter>
    <filter id="mtPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="19"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="mtSoft"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#mtSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 700; i++) { const x = rs() * W, y = Math.pow(rs(), 1.3) * 430, big = rs() < .05;
      if (Math.hypot(x - LX, y - LY) < 150) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8eeff"}" opacity="${F((.25 + rs() * .55) * (1 - y / 470))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#mtLight)"/>`;
    // the moon, two days past full: a slight shadow on its left limb
    const MR = 34;
    s += `<radialGradient id="mtHalo"><stop offset="0" stop-color="#dfe6ff" stop-opacity=".3"/><stop offset=".35" stop-color="#b8c4f0" stop-opacity=".1"/><stop offset="1" stop-color="#b8c4f0" stop-opacity="0"/></radialGradient>`;
    s += `<circle cx="${LX}" cy="${LY}" r="${MR * 5}" fill="url(#mtHalo)"/><circle cx="${LX}" cy="${LY}" r="${MR}" fill="#fbf6e6"/>`;
    [[-10, -8, 9, .1], [8, 6, 7, .09], [-4, 12, 6, .08], [12, -12, 5, .07], [-14, 6, 4, .07], [2, -2, 4, .06]].forEach(([dx, dy, rr, o]) =>
      s += `<circle cx="${LX + dx}" cy="${LY + dy}" r="${rr}" fill="#6a6a78" opacity="${o}"/>`);
    s += `<path d="M${LX - MR * .2},${LY - MR} A${MR},${MR} 0 0 0 ${LX - MR * .2},${LY + MR} A${MR * .92},${MR} 0 0 1 ${LX - MR * .2},${LY - MR}Z" fill="#20243e" opacity=".22"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#mtLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#mtSoft)">`;
    for (let k = 0; k < 7; k++) { const a = -.16 + k * .055, L = 2600;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .018) * L)},${F(LY + Math.sin(a - .018) * L)} L${F(LX + Math.cos(a + .018) * L)},${F(LY + Math.sin(a + .018) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: long late-autumn stratocumulus rolls, lit gold from below-left ---------------- */
  const roll = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#mtCloudy)">`;
    const n = 7 + Math.floor(rs() * 4), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.05 + rs() * .05) * (1 - Math.abs(t - .5) * .8);
      lobes.push([x + (t - .5) * w, y - R * (.2 + rs() * .4), R]); }
    if (NIGHT) {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.9)}" ry="${F(R * .55)}" fill="#1c2448"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .3)}" cy="${F(ly - R * .22)}" rx="${F(R * 1.1)}" ry="${F(R * .24)}" fill="#5a6290" opacity=".5"/>`);
    } else {
      const dimK = x / W;   // farther from the sun: greyer, less gold
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .1)}" rx="${F(R * 2)}" ry="${F(R * .62)}" fill="${mix("#a8a8b8", "#9a9cae", dimK)}"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .1)}" cy="${F(ly - R * .08)}" rx="${F(R * 1.7)}" ry="${F(R * .48)}" fill="${mix("#e4dcd4", "#d4d6de", dimK)}"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .5)}" cy="${F(ly + R * .26)}" rx="${F(R * 1.2)}" ry="${F(R * .2)}" fill="${mix("#ffd896", "#f0dcc0", dimK)}" opacity=".85"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly - R * .3)}" rx="${F(R * .9)}" ry="${F(R * .2)}" fill="#fbf6ee" opacity=".7"/>`);
    }
    return c + `</g></g>`;
  };
  s += `<g opacity="${NIGHT ? .7 : .9}">` + roll(560, 300, 620, "drift2") + roll(980, 140, 420, "drift3") + roll(1620, 210, 520, "drift2") +
    roll(2160, 330, 560, "drift3") + roll(2380, 120, 360, "drift2") + roll(260, 160, 380, "drift3") + `</g>`;
  if (!NIGHT) {   // a skein of Canada geese, late going south
    s += `<g class="birds" fill="none" stroke="#2a2830" stroke-width="2" stroke-linecap="round" opacity=".75">`;
    for (let i = 0; i < 11; i++) { const side = i % 2 ? 1 : -1, j = Math.ceil(i / 2), x = 1180 + j * 24, y = 190 + side * j * 11 + j * 3, k = .9 - j * .04;
      s += `<path d="M${F(x - 9 * k)},${F(y - 2)} q${F(4.5 * k)},${F(-5 * k)} ${F(9 * k)},${F(1.5)} q${F(4.5 * k)},${F(-5 * k)} ${F(9 * k)},${F(-1.5)}"/>`; }
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 1.7 m above the green; metres, x right, y up, z away. Main Street runs up the
     left (x -27..-20), Pond Street up the right (x 20..27) and bends right past z 100;
     Church Street crosses at the head of the green (z 96..103). The meeting house
     stands at x 6, front at z 119.                                                     */
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [.5, .55, -.35] : [-.72, .42, -.45], tone: T, fog: HZ, fogK: .0022,
    shadow: SHADE, rim: RIM, shade: .5, hi: .26, night: NIGHT, lamp: LAMP });
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const fogC = (c, fog) => T(mix(c, HZ, fog));
  const pr = (x, z, y = 0) => w.proj([x, y, z]);
  const gC = (c, z) => T(mix(c, HZ, w.fogAt(z)));
  const far = ob => { ob.tag = "far"; return ob; };
  // the text corners stay calm: nothing standing may reach above y 250 there
  const capY = px => 250 - 170 * sm((px - 860) / 160) * sm((1560 - px) / 160);
  const room = (x, z) => (sy(0, z) - capY(sx(x, z))) * z / FL;
  const rightC = z => 23.5 + (z > 100 ? (z - 100) * .42 : 0);   // centre line of Pond Street

  /* ---------- far hills: raster, low and rounded, bare woods with bronze oaks and pine ---------- */
  const hillH = mountainField({ seed: 1126, scale: 1500, oct: 7, warp: .35, peaks: [
    { x: -1500, z: 2500, h: 170, rx: 1500, rz: 800 }, { x: 300, z: 3300, h: 250, rx: 1500, rz: 900 },
    { x: 2300, z: 2700, h: 160, rx: 1300, rz: 800 }, { x: -3600, z: 4400, h: 220, rx: 1900, rz: 900 }, { x: 4200, z: 4800, h: 200, rx: 1800, rz: 900 } ] });
  w.raster({ z0: 520, z1: 7000, top: 200, bottom: WY + 8, h: hillH,
    col: mountainColor({ seed: 61, tree: 900, forest: NIGHT ? "#4a4458" : "#6a5658", gold: "#9a6e46", goldK: .45, grass: "#9a9060", rock: "#7a7068", rock2: "#5a524e" }),
    tone: rgbTone(T), fog: HZ, fogK: .00042, step: .0024, scale: .5, tag: "far" });

  /* ---------- the ground: fogged bands of grass, the three streets, paths on the green ---------- */
  let G = "";
  { const zs = Array.from({ length: 46 }, (_, i) => 2.5 * Math.pow(800 / 2.5, i / 45));
    for (let i = zs.length - 1; i > 0; i--) { const z0 = zs[i - 1], z1 = zs[i], c = z1 < 25 ? "#7a7e48" : z1 < 100 ? "#888a52" : "#9a9460";
      G += `<rect x="0" y="${F(sy(0, z1) - .5)}" width="${W}" height="${F(sy(0, z0) - sy(0, z1) + 1)}" fill="${gC(c, (z0 + z1) / 2)}"/>`; } }
  const quadZ = (xa0, xa1, za, xb0, xb1, zb, c) => `<path d="${pathP([pr(xa0, za), pr(xa1, za), pr(xb1, zb), pr(xb0, zb)])}" fill="${c}"/>`;
  const strip = (pts, wd, cf) => { let g = "";   // a road along a polyline of [x, z]
    for (let i = 0; i < pts.length - 1; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), nx = -dz / L * wd / 2, nz = dx / L * wd / 2;
      g += `<path d="${pathP([pr(x0 + nx, z0 + nz), pr(x0 - nx, z0 - nz), pr(x1 - nx, z1 - nz), pr(x1 + nx, z1 + nz)])}" fill="${cf((z0 + z1) / 2)}" stroke="${cf((z0 + z1) / 2)}" stroke-width=".6"/>`; }
    return g; };
  const ASPH = z => gC("#626064", z), VERGE = z => gC("#a89a70", z), GRAV = z => gC("#c8bca2", z);
  const zline = (z0, z1, n, f) => Array.from({ length: n + 1 }, (_, i) => { const z = z0 * Math.pow(z1 / z0, i / n); return [f(z), z]; });
  // Main Street (left), with a gravel verge each side
  G += strip(zline(6, 900, 40, () => -23.5), 9.4, VERGE) + strip(zline(6, 900, 40, () => -23.5), 7, ASPH);
  // Pond Street (right), bending away right beyond the cross street
  G += strip(zline(6, 900, 50, rightC), 9.4, VERGE) + strip(zline(6, 900, 50, rightC), 7, ASPH);
  // Church Street across the head of the green, running off left
  G += quadZ(-400, 24, 95.2, -400, 24, 103.8, VERGE(99)) + quadZ(-400, 23, 96, -400, 23, 103, ASPH(99));
  // worn patches and tar seams on the asphalt
  for (let i = 0; i < 420; i++) { const q = rg(); let x, z;
    if (q < .4) { z = 8 * Math.pow(100, rg()); x = -23.5 + (rg() - .5) * 6.6; } else if (q < .75) { z = 8 * Math.pow(100, rg()); x = rightC(z) + (rg() - .5) * 6.6; } else { z = 96.3 + rg() * 6.4; x = -60 + rg() * 82; }
    const p = pr(x, z), k = FL / z; if (p[0] < -40 || p[0] > W + 40) continue; const rx = (.1 + rg() * .6) * k;
    G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(Math.max(.4, rx * EYE / z * 1.3))}" fill="${gC(rg() < .5 ? "#545256" : "#76747a", z)}" opacity="${F(.3 + rg() * .4)}"/>`; }
  // gravel paths: up the middle to the church gate, and a diagonal crossing
  G += strip(zline(3, 95.2, 30, z => -1.2 + (z - 3) / 92.2 * 7.2), 2.4, GRAV);
  G += strip([[-19.5, 34], [-6, 52], [6, 70], [19.5, 88]], 1.7, GRAV);
  G += strip([[6, 103.8], [6, 119]], 2.1, GRAV);
  // lawn: light and dark patches, flattened by distance
  for (let i = 0; i < 260; i++) { const z = 6 + Math.pow(rg(), 1.4) * 110, x = -19 + rg() * 38; const p = pr(x, z), k = FL / z, rx = (1.2 + rg() * 3) * k;
    G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(rx * EYE / z * 1.5)}" fill="${gC(rg() < .5 ? "#6e7440" : rg() < .5 ? "#a49a5c" : "#94965a", z)}" opacity=".4"/>`; }
  // long low-sun shadows of the green's trees fall to the right; drawn with the trees below
  const LEAF = ["#7a4a24", "#9a6230", "#b07a3a", "#c89450", "#6a3e22", "#8a5a34", "#a8582a"];
  const leafAt = (x, z, rx0) => { const p = pr(x, z), k = FL / z; if (p[0] < -10 || p[0] > W + 10) return "";
    const rx = Math.max(.6, (rx0 || .035 + rg() * .03) * k), a = (rg() - .5) * 50;
    return `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(Math.max(.4, rx * (.22 + rg() * .14)))}" fill="${gC(LEAF[Math.floor(rg() * LEAF.length)], z)}" transform="rotate(${F(a)} ${F(p[0])} ${F(p[1])})" opacity=".85"/>`; };
  // drifts of fallen leaves along the road edges and under the trees
  for (let i = 0; i < 1500; i++) { const q = rg(), z = 6 + Math.pow(rg(), 1.6) * 100; let x;
    if (q < .25) x = -19.6 - rg() * .9; else if (q < .5) x = rightC(z) - 3.9 + rg() * .9; else x = -19 + rg() * 38;
    G += leafAt(x, z); }
  // grass blades on the near green (most of this sits under the cards)
  for (let i = 0; i < 2600; i++) { const z = 3 + Math.pow(rg(), 1.5) * 28, x = (rg() - .5) * 1.7 * z, p = pr(x, z), k = FL / z;
    if (p[0] < -10 || p[0] > W + 10 || x < -19 || x > rightC(z) - 4.6) continue;
    if (rg() < .08) { G += leafAt(x, z, .03 + rg() * .025); continue; }
    const L = (.05 + rg() * .08) * k, bend = (rg() - .5) * L * .8;
    G += `<path d="M${F(p[0])},${F(p[1])} q${F(bend * .3)},${F(-L * .5)} ${F(bend)},${F(-L)}" stroke="${gC(rg() < .4 ? "#5e6a34" : rg() < .5 ? "#9a9454" : "#b4a868", z)}" stroke-width="${F(Math.max(.8, L * .09))}" fill="none" stroke-linecap="round"/>`; }

  /* ---------- trees, painterly, standing at world points ---------- */
  const BARK = ["#2e2626", "#3e3434", "#54484a", "#6e6260", "#8e807a", "#b0a294"];
  const OAKB = ["#3a1e10", "#5a2e14", "#7a401a", "#965424", "#ae6a30", "#c4843e", "#d8a05a", "#e8bc7c"];
  const PINE = ["#141c18", "#1c2820", "#24342a", "#2e4232", "#3a523a", "#4a6446", "#5e7a54"];
  const lightDir = NIGHT ? [.6, -.5] : [-.8, -.4];   // screen-space direction toward the light
  /* a bare deciduous tree: recursive limbs, twig haze, an oak keeps bronze leaves */
  const bareTree = (px, py, hp, fog, rr, kind) => {
    const C = c => T(mix(c, HZ, fog)), B = BARK.map(C);
    let g = `<ellipse cx="${F(px + (NIGHT ? -hp * .2 : hp * .45))}" cy="${F(py)}" rx="${F(hp * (NIGHT ? .3 : .6))}" ry="${F(Math.max(1, hp * .028))}" fill="#000" opacity=".2"/>`;
    const cfg = { elm: { tr: .3, sp: .42, up: .55, sh: .74, n0: 4 }, maple: { tr: .34, sp: .6, up: .3, sh: .7, n0: 3 }, oak: { tr: .27, sp: .85, up: .1, sh: .7, n0: 3 } }[kind];
    if (hp < 64) {   // far: a soft twig mass with a few limbs showing
      const rx = hp * (kind === "elm" ? .42 : .36), ry = hp * .34, cy = py - hp * .6;
      g += `<path d="M${F(px - hp * .02)},${F(py)} L${F(px)},${F(cy + ry * .3)} L${F(px + hp * .02)},${F(py)}Z" fill="${B[1]}"/>`;
      const body = kind === "oak" ? C(mix(OAKB[2], "#6a5a5a", .35)) : C(NIGHT ? "#3c3644" : "#7a6a6c");
      g += `<g filter="url(#mtTwig)"><path d="${blobP(px, cy, rx, ry, 9, rr)}" fill="${body}" opacity="${kind === "oak" ? .95 : .78}"/>`;
      g += `<path d="${blobP(px + lightDir[0] * rx * .3, cy + lightDir[1] * ry * .35, rx * .62, ry * .55, 8, rr)}" fill="${kind === "oak" ? C(OAKB[5]) : C(NIGHT ? "#565068" : "#a8968e")}" opacity=".55"/></g>`;
      for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k - 1) * .5; g += `<path d="M${F(px)},${F(cy + ry * .4)} l${F(Math.cos(a) * rx * .6)},${F(Math.sin(a) * ry * .8)}" stroke="${B[0]}" stroke-width="${F(Math.max(.5, hp * .012))}" opacity=".7"/>`; }
      return g; }
    const segs = [], tips = [], maxD = hp > 260 ? 6 : hp > 140 ? 5 : 4;
    const grow = (x, y, a, L, wd, d) => {
      const bend = (rr() - .5) * .25, x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L;
      segs.push([x, y, x + Math.cos(a + bend) * L * .5, y + Math.sin(a + bend) * L * .5, x2, y2, wd, d]);
      if (d >= maxD) { tips.push([x2, y2, a]); return; }
      const nb = d === 0 ? cfg.n0 : 2 + (rr() < .4 ? 1 : 0);
      for (let k = 0; k < nb; k++) {
        let na = a + (nb === 1 ? 0 : (k / (nb - 1) - .5) * 2 * cfg.sp) + (rr() - .5) * .4;
        na = na + (-Math.PI / 2 - na) * cfg.up * (d === 0 ? .6 : .15);       // elms stay vase-shaped
        if (kind === "elm" && d >= 3) na += Math.cos(na) > 0 ? .18 : -.18;   // and droop at the tips
        grow(x2, y2, na, L * (cfg.sh + rr() * .12), wd * (.62 + rr() * .08), d + 1); } };
    grow(px, py, -Math.PI / 2 + (rr() - .5) * .08, hp * cfg.tr, hp * .05, 0);
    { // the limbs' reach varies with the dice: scale the tree so its top is exactly hp
      const top = Math.min(...segs.map(sg => Math.min(sg[3], sg[5]))), sk = hp * .97 / Math.max(1, py - top);
      const S = (x, y) => [px + (x - px) * sk, py + (y - py) * sk];
      segs.forEach(sg => { [[0, 1], [2, 3], [4, 5]].forEach(([i, j]) => { const q = S(sg[i], sg[j]); sg[i] = q[0]; sg[j] = q[1]; }); sg[6] *= Math.min(1, sk); });
      tips.forEach(t => { const q = S(t[0], t[1]); t[0] = q[0]; t[1] = q[1]; }); }
    // twig haze behind the limbs
    let tg = "";
    tips.forEach(([x, y, a]) => { for (let k = 0; k < 4; k++) { const b = a + (rr() - .5) * 1.4, L = hp * (.03 + rr() * .04);
      tg += `<path d="M${F(x)},${F(y)} l${F(Math.cos(b) * L)},${F(Math.sin(b) * L)}" stroke="${C(NIGHT ? "#4a4458" : "#6e6064")}" stroke-width=".7" opacity=".6"/>`; } });
    const xs = tips.map(t => t[0]), ys = tips.map(t => t[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const hx = (Math.max(...xs) - Math.min(...xs)) / 2, hy = (Math.max(...ys) - Math.min(...ys)) / 2;
    g += `<g filter="url(#mtTwig)" opacity=".3"><path d="${blobP(cx, cy + hy * .1, hx * .95, hy * .9, 10, rr)}" fill="${C(NIGHT ? "#3a3448" : "#8a7a7c")}"/></g>`;
    g += tg;
    segs.sort((a, b) => a[7] - b[7]).forEach(([x0, y0, qx, qy, x1, y1, wd, d]) => {
      const sw = Math.max(.5, wd);
      g += `<path d="M${F(x0)},${F(y0)} Q${F(qx)},${F(qy)} ${F(x1)},${F(y1)}" stroke="${B[d < 2 ? 1 : 2]}" stroke-width="${F(sw)}" fill="none" stroke-linecap="round"/>`;
      if (sw > 2.2) { const ox = lightDir[0] * sw * .28, oy = lightDir[1] * sw * .1;
        g += `<path d="M${F(x0 + ox)},${F(y0 + oy)} Q${F(qx + ox)},${F(qy + oy)} ${F(x1 + ox)},${F(y1 + oy)}" stroke="${B[4]}" stroke-width="${F(sw * .3)}" fill="none" stroke-linecap="round" opacity=".8"/>`; } });
    // root flare
    g += `<path d="M${F(px - hp * .07)},${F(py)} Q${F(px - hp * .025)},${F(py - hp * .02)} ${F(px - hp * .025)},${F(py - hp * .07)} L${F(px + hp * .025)},${F(py - hp * .07)} Q${F(px + hp * .025)},${F(py - hp * .02)} ${F(px + hp * .07)},${F(py)}Z" fill="${B[1]}"/>`;
    if (kind === "oak") {   // marcescent leaves: bronze clusters on the outer twigs
      let lg = ""; const cs = [];
      tips.forEach(([x, y]) => { if (rr() < .25) return; const n = 2 + Math.floor(rr() * 4);
        for (let k = 0; k < n; k++) { const qx = x + (rr() - .5) * hp * .08, qy = y + (rr() - .5) * hp * .06, lit = ((qx - cx) / hx * lightDir[0] + (qy - cy) / hy * lightDir[1]) * .5 + .5;
          cs.push([qx, qy, cl(lit * .8 + (rr() - .5) * .35), hp * (.012 + rr() * .012)]); } });
      cs.sort((a, b) => a[2] - b[2]).forEach(([x, y, v, R]) => lg += `<path d="${blobP(x, y, R, R * .8, 6, rr)}" fill="${C(OAKB[Math.floor(v * OAKB.length)])}"/>`);
      g += `<g filter="url(#mtLeafy)">${lg}</g>`; }
    return g; };
  /* an eastern white pine: a visible trunk and irregular flat shelves of needles, lit on one side */
  const whitePine = (px, py, hp, fog, rr) => {
    const C = c => T(mix(c, HZ, fog)), P = PINE.map(C);
    let g = `<path d="M${F(px - hp * .018)},${F(py)} L${F(px - hp * .004)},${F(py - hp * .97)} L${F(px + hp * .004)},${F(py - hp * .97)} L${F(px + hp * .018)},${F(py)}Z" fill="${C("#3a2e28")}"/>`;
    const n = hp > 80 ? 7 + Math.floor(rr() * 3) : 5;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), y = py - hp * (.28 + .7 * t), side = (i % 2 ? 1 : -1) * (rr() < .7 ? 1 : -1), wd = hp * (.3 - t * .2) * (.7 + rr() * .5);
      if (rr() < .15 && i < n - 1) continue;   // a gap in the shelves, as old white pines have
      const sxo = px + side * wd * (.25 + rr() * .3), rx = wd * (.55 + rr() * .2), ry = hp * (.045 + rr() * .02);
      g += `<path d="M${F(px)},${F(y + ry * .2)} L${F(sxo)},${F(y)}" stroke="${C("#3a2e28")}" stroke-width="${F(Math.max(.5, hp * .008))}"/>`;
      if (hp < 50) { g += `<path d="${blobP(sxo, y, rx, ry * 1.3, 7, rr)}" fill="${P[2]}"/><path d="${blobP(sxo + lightDir[0] * rx * .25, y - ry * .4, rx * .6, ry * .6, 6, rr)}" fill="${P[4]}"/>`; continue; }
      g += `<path d="${blobP(sxo, y + ry * .3, rx, ry * 1.2, 9, rr)}" fill="${P[0]}"/>`;
      const m = Math.max(5, Math.min(40, Math.round(rx / 3)));
      for (let k = 0; k < m; k++) { const u = (rr() * 2 - 1), qx = sxo + u * rx * .9, qy = y - ry * (.2 + rr() * .6) * (1 - Math.abs(u) * .5), lit = cl((u * lightDir[0] + .5) * .7 + rr() * .3);
        g += `<path d="${blobP(qx, qy, rx * (.14 + rr() * .1), ry * (.5 + rr() * .3), 6, rr)}" fill="${P[1 + Math.floor(lit * 5)]}"/>`; } }
    return `<g filter="url(#mtLeafy)">${g}</g>`; };
  const treeSprite = (x, z, h, kind, opt = {}) => { const rr = rng(seed + Math.round(x * 7.3 + z * 13.1));
    w.sprite({ x, z, y: 0, tag: opt.tag, bias: opt.bias, fn: (px, py, k, fog) => kind === "pine" ? whitePine(px, py, h * k, fog, rr) : bareTree(px, py, h * k, fog, rr, kind) }); };
  const pickKind = q => q < .3 ? "pine" : q < .55 ? "oak" : q < .8 ? "maple" : "elm";
  // the woods behind the village, in lots with gaps of sky
  for (let i = 0; i < 950; i++) { const z = 150 + Math.pow(r(), .9) * 380, x = (r() - .5) * 2.8 * z, u = sx(x, z); if (u < -60 || u > W + 60) continue;
    if (Math.sin(x / 31 + z / 47) + Math.sin(x / 11 - z / 23) * .5 < -.45) continue;
    const kind = pickKind(r()), h = Math.min((kind === "pine" ? 20 : 15) + r() * 9, room(x, z)); if (h < 9) continue;
    treeSprite(x, z, h, kind, { tag: "far" }); }

  /* ---------- the meeting house ---------- */
  const CHW = "#f4f0e6", CHR = "#4a4c54", glassD = "#2e3a48", WARM = "#ffcf7a";
  { const X = 6, Zc = 129, d = 20, wd = 11;
    w.house({ x: X, z: Zc, yaw: 0, w: wd, d, h: 7.6, rh: 4.6, gable: true, wall: CHW, roof: CHR, trim: "#ffffff", door: false, win: () => false, fy: -.4, stone: "#9a9488", ov: .45,
      extra: (n, q, len) => {
        const tall = (u, v0, v1) => { const lt = NIGHT;
          q(u - .82, v0 - .12, u + .82, v1 + .3, "#ffffff");
          q(u - .62, v0, u + .62, v1, lt ? WARM : glassD, { glow: lt, off: .07 });
          if (!lt) q(u - .62, (v0 + v1) / 2, u, v1, "#9ab0c4", { off: .08, op: .3 });
          for (let k = 1; k < 4; k++) q(u - .62, v0 + (v1 - v0) * k / 4 - .02, u + .62, v0 + (v1 - v0) * k / 4 + .02, "#ffffff", { off: .085 });
          q(u - .02, v0, u + .02, v1, "#ffffff", { off: .085 });
          q(u - 1.15, v0, u - .86, v1, "#2a3a32", { off: .06 }); q(u + .86, v0, u + 1.15, v1, "#2a3a32", { off: .06 }); };
        if (n === "left" || n === "right") for (let u = 2.6; u < len - 1.5; u += 3.7) tall(u, 1.5, 5.9);
        if (n === "front") { tall(1.75, 1.5, 5.9); tall(len - 1.75, 1.5, 5.9); }
      } });
    // a low ell at the back
    w.house({ x: X - 1, z: Zc + 13, yaw: 0, w: 8, d: 7, h: 3.6, rh: 2.4, wall: "#ece6da", roof: CHR, trim: "#ffffff", fy: -.3 });
    // the tower, half set into the front gable
    const TZ = Zc - d / 2 - 1.2, TW = 4.4;
    // decorate all four walls of a square box (half width hw): at(a, y, off) is a point on face i, a across it
    const front = (faces, P, hw, deco) => faces.slice(0, 4).forEach((f, i) => {
      const map = [(a, y, o) => [a, y, -hw - o], (a, y, o) => [hw + o, y, a], (a, y, o) => [-a, y, hw + o], (a, y, o) => [-hw - o, y, -a]][i];
      f.dec = deco((a, y, off = .04) => P(map(a, y, off)), i); });
    w.box({ x: X, z: TZ, w: TW, d: TW, h: 13.4, c: CHW, dec: (faces, P) => front(faces, P, TW / 2, (at, i) => {
      const D = [], Q = (a0, y0, a1, y1, c, e = {}) => D.push({ P: [at(a0, y0, e.off), at(a1, y0, e.off), at(a1, y1, e.off), at(a0, y1, e.off)], c, glow: e.glow, op: e.op });
      for (let y = .45; y < 13.2; y += .45) D.push({ P: [at(-TW / 2, y, .02), at(TW / 2, y, .02)], c: mix(CHW, "#000000", .2), ln: .035, min: .3, op: .5 });
      Q(-TW / 2, 0, -TW / 2 + .2, 13.4, "#ffffff", { off: .03 }); Q(TW / 2 - .2, 0, TW / 2, 13.4, "#ffffff", { off: .03 });
      if (i === 0) {   // double door with a fanlight, a tall window, the clock
        Q(-1.15, 0, 1.15, 3.5, "#ffffff", { off: .05 }); Q(-.95, 0, .95, 3.0, "#3a2a22", { off: .06 }); Q(-.03, 0, .03, 3.0, "#5a4636", { off: .065 });
        Q(-.85, 3.05, .85, 3.35, NIGHT ? WARM : glassD, { off: .06, glow: NIGHT });
        Q(-.6, 4.4, .6, 8.3, "#ffffff", { off: .05 }); Q(-.45, 4.55, .45, 8.1, NIGHT ? WARM : glassD, { off: .06, glow: NIGHT });
        const cyc = 11.4, rc = 1.15, circ = (R, n = 24) => Array.from({ length: n }, (_, k) => [Math.cos(k / n * Math.PI * 2) * R, cyc + Math.sin(k / n * Math.PI * 2) * R]);
        D.push({ P: circ(rc + .14).map(([a, y]) => at(a, y, .05)), c: "#2a2a30" });
        D.push({ P: circ(rc).map(([a, y]) => at(a, y, .06)), c: NIGHT ? "#fff2d0" : "#f8f4ea", glow: NIGHT });
        // hands at ten to four
        D.push({ P: [at(0, cyc, .07), at(.62, cyc - .3, .07)], c: "#1a1a20", ln: .07, min: .6 });
        D.push({ P: [at(0, cyc, .07), at(-.4, cyc + .78, .07)], c: "#1a1a20", ln: .09, min: .6 });
        for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; D.push({ P: [at(Math.cos(a) * rc * .8, cyc + Math.sin(a) * rc * .8, .07), at(Math.cos(a) * rc * .95, cyc + Math.sin(a) * rc * .95, .07)], c: "#2a2a30", ln: .05, min: .4 }); }
      } else { Q(-.4, 8.6, .4, 10.4, "#ffffff", { off: .05 }); Q(-.3, 8.7, .3, 10.3, NIGHT ? WARM : glassD, { off: .06, glow: NIGHT }); }
      return D; }) });
    w.box({ x: X, z: TZ, y: 13.4, w: TW + .5, d: TW + .5, h: .55, c: "#ffffff" });
    // belfry with louvred arches
    w.box({ x: X, z: TZ, y: 13.95, w: 3.7, d: 3.7, h: 3.7, c: CHW, dec: (faces, P) => front(faces, P, 1.85, (at) => {
      const D = [], Q = (a0, y0, a1, y1, c, e = {}) => D.push({ P: [at(a0, y0, e.off), at(a1, y0, e.off), at(a1, y1, e.off), at(a0, y1, e.off)], c, glow: e.glow, op: e.op });
      const arch = [[-1.05, .35], [1.05, .35], [1.05, 2.6], [.9, 3.0], [.5, 3.25], [0, 3.32], [-.5, 3.25], [-.9, 3.0], [-1.05, 2.6]];
      D.push({ P: arch.map(([a, y]) => at(a, y, .05)), c: NIGHT ? "#2a2018" : "#1e2026" });
      for (let y = .7; y < 2.9; y += .32) D.push({ P: [at(-1.0, y, .07), at(1.0, y, .07)], c: NIGHT ? "#8a7a68" : "#c8c4bc", ln: .09, min: .4 });
      Q(-1.85, 0, -1.6, 3.7, "#ffffff", { off: .03 }); Q(1.6, 0, 1.85, 3.7, "#ffffff", { off: .03 });
      return D; }) });
    w.box({ x: X, z: TZ, y: 17.65, w: 4.2, d: 4.2, h: .45, c: "#ffffff" });
    [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]].forEach(([dx, dz]) => { w.cyl({ x: X + dx, z: TZ + dz, y: 18.1, r0: .22, r1: .12, h: .5, n: 8, c: "#ffffff" }); w.cyl({ x: X + dx, z: TZ + dz, y: 18.6, r0: .14, r1: 0, h: .45, n: 8, c: "#ffffff" }); });
    // octagonal lantern, then the spire and a gilt weathervane
    w.cyl({ x: X, z: TZ, y: 18.1, r0: 1.45, r1: 1.45, h: 2.3, n: 8, rot: Math.PI / 8, c: CHW });
    w.cyl({ x: X, z: TZ, y: 20.4, r0: 1.62, r1: 1.62, h: .3, n: 8, rot: Math.PI / 8, c: "#ffffff" });
    w.cyl({ x: X, z: TZ, y: 20.7, r0: 1.3, r1: 0, h: 9.6, n: 8, rot: Math.PI / 8, c: "#f8f6f0" });
    w.line([[X, 30.2, TZ], [X, 31.6, TZ]], "#c8a040", .07);
    w.line([[X - .55, 31.15, TZ], [X + .6, 31.15, TZ]], "#c8a040", .09);
    w.cyl({ x: X, z: TZ, y: 31.5, r0: .1, r1: 0, h: .3, n: 6, c: "#d8b04a" });
    // granite steps
    w.box({ x: X, z: TZ - 2.6, w: 3.4, d: .8, h: .35, c: "#a8a49a" }); w.box({ x: X, z: TZ - 3.2, w: 3.8, d: .6, h: .18, c: "#a8a49a" });
  }
  // white picket fence along Church Street, with a gate opening at the walk
  { const zf = 104.6;
    for (let x = -10; x < 22; x += .5) { if (x > 4.6 && x < 7.4) continue; w.line([[x, 0, zf], [x, 1.05, zf]], "#f6f4ee", .09, { min: .5 }); }
    [.35, .85].forEach(y => { w.line([[-10, y, zf + .05], [4.6, y, zf + .05]], "#e8e4da", .07); w.line([[7.4, y, zf + .05], [22, y, zf + .05]], "#e8e4da", .07); });
    [4.6, 7.4].forEach(x => w.box({ x, z: zf, w: .22, d: .22, h: 1.35, c: "#ffffff" })); }

  /* ---------- the village: houses along Main Street and Pond Street, the store, the inn ---------- */
  const hr = rng(seed + 61);
  const NE = ["#f2ece0", "#ece6d6", "#9a3628", "#d8b25a", "#5e7488", "#8e9a86", "#e8e0c8", "#f4f0e6", "#7a3a2e", "#c8c0a8"];
  const leftHouse = (z, o = {}) => { const hs = w.randomHouse(hr, { x: 0, z, yaw: 90, rng: hr, kind: "village", ...o }); hs.wall = o.wall || NE[Math.floor(hr() * NE.length)];
    hs.x = -30 - hs.d / 2; return w.house({ ...hs, fy: -.35, stone: "#8a8478" }); };
  const rightHouse = (z, o = {}) => { const hs = w.randomHouse(hr, { x: 0, z, yaw: -90, rng: hr, kind: "village", ...o }); hs.wall = o.wall || NE[Math.floor(hr() * NE.length)];
    hs.x = rightC(z) + 6.5 + hs.d / 2; if (z > 100) hs.yaw = -90 + Math.atan(.42) * 180 / Math.PI; return w.house({ ...hs, fy: -.35, stone: "#8a8478" }); };
  // general store: a front-gable two-storey with a deep porch, sign board and harvest goods
  const STORE_Z = 71;
  w.house({ x: -30 - 5, z: STORE_Z, yaw: 90, w: 9, d: 10, h: 6.4, rh: 3.6, gable: true, wall: "#ece4cc", roof: "#3e4048", trim: "#ffffff", porch: true, porchW: 4.4, porchC: "#8a7a64",
    shut: "#2a3a32", doorC: "#2a3a32", fy: -.4, stone: "#8a8478", chim: .8, winGap: 2.3,
    extra: (n, q, len) => { if (n !== "front") return; q(.6, 3.15, len - .6, 3.95, "#2e4a38", { off: .09 });
      for (let k = 0; k < 9; k++) q(1.2 + k * .75, 3.38, 1.2 + k * .75 + .42, 3.72, "#f0e2b8", { off: .1 }); } });
  [[STORE_Z + 15], [104], [121], [139], [158], [180]].forEach(([z]) => leftHouse(z));
  // the inn: big hip-roofed white house with black shutters and a long porch
  w.house({ x: rightC(74) + 6.5 + 6, z: 74, yaw: -90, w: 14, d: 12, h: 6.6, rh: 3.6, roof3: "hip", wall: "#f6f2e8", roof: "#3a3c44", trim: "#ffffff", shut: "#1a1e22",
    porch: true, porchW: 6.4, porchC: "#8a7a64", doorC: "#6a1e1a", chim: .25, fy: -.45, stone: "#8a8478", winGap: 2.3 });
  [[91], [106], [124], [146], [168]].forEach(([z]) => rightHouse(z));
  // a red barn behind the inn, glimpsed
  w.house({ x: rightC(86) + 21, z: 86, yaw: -90, w: 10, d: 8, h: 4.2, rh: 3.6, roof3: "gambrel", wall: "#8a2e22", roof: "#3a3436", trim: "#efe6d2", fy: -.3, win: (u, ri) => ri === 0 && u > .6 });
  // a few houses down Church Street to the left, beyond Main Street
  [[-46, 112], [-62, 114], [-80, 111]].forEach(([x, z]) => w.house({ ...w.randomHouse(hr, { x, z, yaw: 0, rng: hr, kind: "village" }), wall: NE[Math.floor(hr() * NE.length)], fy: -.3 }));

  /* ---------- the fieldstone wall along Pond Street ---------- */
  { const STN = ["#8a8478", "#a09888", "#767068", "#b0a898", "#6a645e"];
    for (let z = 14; z < 95; z += .45 + rw() * .35) { const x = rightC(z) - 4.9;
      w.box({ x: x + (rw() - .5) * .1, z, w: .55 + rw() * .2, d: .4 + rw() * .3, h: .3 + rw() * .16, c: STN[Math.floor(rw() * STN.length)], yaw: (rw() - .5) * 24 });
      if (rw() < .85) w.box({ x: x + (rw() - .5) * .12, z: z + .2, y: .38 + rw() * .06, w: .42 + rw() * .14, d: .3 + rw() * .3, h: .2 + rw() * .14, c: STN[Math.floor(rw() * STN.length)], yaw: (rw() - .5) * 30 }); } }

  /* ---------- trees on the green and the streets ---------- */
  [[-9.5, 62, 15.5, "elm"], [13.5, 50, 12, "maple"], [-14.5, 86, 14, "oak"], [15.5, 86, 13, "oak"], [-3, 92, 11, "maple"],
   [-28.4, 50, 13, "maple"], [-28.4, 74, 14, "elm"], [-28.4, 90, 12, "maple"], [-28.4, 108, 13, "oak"],
   [rightC(48) + 5, 48, 13, "maple"], [rightC(72) + 5, 72, 12, "oak"], [rightC(92) + 5, 92, 13, "maple"],
   [-12, 126, 14, "pine"], [20, 132, 11.5, "pine"], [-6, 150, 13, "oak"], [16, 158, 17, "pine"]].forEach(([x, z, h, kind]) => {
    const hh = Math.min(h, room(x, z)); if (hh < 6) return; treeSprite(x, z, hh, kind); });
  // long shadows of the green's trees, thrown right by the low sun (day only)
  if (!NIGHT) [[-9.5, 62, 15.5], [13.5, 50, 12], [-14.5, 86, 14], [15.5, 86, 13], [-3, 92, 11]].forEach(([x, z, h]) => {
    const a = pr(x, z), b = pr(x + h * 1.4, z - h * .25), k = FL / z;
    G += `<path d="M${F(a[0] - k * .3)},${F(a[1])} L${F(b[0])},${F(b[1] - k * .5)} L${F(b[0] + k * 1.5)},${F(b[1] + k * .3)} L${F(a[0] + k * .3)},${F(a[1] + k * .1)}Z" fill="#2a2a3a" opacity=".16"/>`; });

  /* ---------- street lamps, a flagpole, harvest goods ---------- */
  const lamps = [];
  const lamp = (px, py, k, fog) => { const C = c => fogC(c, fog), m = v => v * k; let g = "";
    g += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(m(.35))}" ry="${F(Math.max(.6, m(.04)))}" fill="#000" opacity=".25"/>`;
    g += `<rect x="${F(px - m(.05))}" y="${F(py - m(3.4))}" width="${F(m(.1))}" height="${F(m(3.4))}" fill="${C("#1e2420")}"/>`;
    g += `<path d="M${F(px - m(.2))},${F(py - m(3.4))} L${F(px + m(.2))},${F(py - m(3.4))} L${F(px + m(.28))},${F(py - m(3.95))} L${F(px - m(.28))},${F(py - m(3.95))}Z" fill="${NIGHT ? "#ffe4a8" : C("#d8d4c4")}"/>`;
    g += `<path d="M${F(px - m(.34))},${F(py - m(3.95))} L${F(px + m(.34))},${F(py - m(3.95))} L${F(px)},${F(py - m(4.2))}Z" fill="${C("#1e2420")}"/>`;
    if (NIGHT) g += `<circle cx="${F(px)}" cy="${F(py - m(3.7))}" r="${F(m(1.4))}" fill="url(#mtGlow)"/>`;
    return g; };
  [[-19, 40], [-19, 70], [-19, 98], [rightC(38) - 4.2, 38], [rightC(68) - 4.2, 68], [-6, 104], [17, 104], [-40, 104]].forEach(([x, z]) => { lamps.push([x, z]); w.sprite({ x, z, fn: lamp }); });
  // flagpole near the head of the green
  w.line([[-8, 0, 98], [-8, 12, 98]], "#e8e4dc", .14);
  w.sprite({ x: -8, z: 98, y: 12, fn: (px, py, k, fog) => { const m = v => v * k; let g = "";
    const wave = t => Math.sin(t * 5.5) * m(.12), fw = m(2.6), fh = m(1.5);
    for (let i = 0; i < 7; i++) { const y0 = py + i * fh / 13, y1 = py + (i + 1) * fh / 13;
      g += `<path d="M${F(px)},${F(y0)} Q${F(px + fw * .5)},${F(y0 + wave(.5))} ${F(px + fw)},${F(y0 + wave(1))} L${F(px + fw)},${F(y1 + wave(1))} Q${F(px + fw * .5)},${F(y1 + wave(.5))} ${F(px)},${F(y1)}Z" fill="${fogC(i % 2 ? "#f4f0e6" : "#b8302a", fog)}"/>`; }
    for (let i = 7; i < 13; i++) { const y0 = py + i * fh / 13, y1 = py + (i + 1) * fh / 13;
      g += `<path d="M${F(px)},${F(y0)} Q${F(px + fw * .5)},${F(y0 + wave(.5))} ${F(px + fw)},${F(y0 + wave(1))} L${F(px + fw)},${F(y1 + wave(1))} Q${F(px + fw * .5)},${F(y1 + wave(.5))} ${F(px)},${F(y1)}Z" fill="${fogC(i % 2 ? "#f4f0e6" : "#b8302a", fog)}"/>`; }
    g += `<path d="M${F(px)},${F(py)} Q${F(px + fw * .2)},${F(py + wave(.2))} ${F(px + fw * .4)},${F(py + wave(.4))} L${F(px + fw * .4)},${F(py + fh * 7 / 13 + wave(.4))} Q${F(px + fw * .2)},${F(py + fh * 7 / 13 + wave(.2))} ${F(px)},${F(py + fh * 7 / 13)}Z" fill="${fogC("#2a3460", fog)}"/>`;
    return NIGHT ? `<g opacity=".7">${g}</g>` : g; } });
  const PUMP = ["#5a200a", "#86300c", "#ac4410", "#cc5a16", "#e2731e", "#f08e2e", "#f8ac52"], WPUMP = ["#6a6250", "#8a8270", "#a8a08c", "#c4bca6", "#d8d2be", "#e8e4d4", "#f4f0e2"];
  const pumpkin = (px, py, R, fog, RAMP) => { const C = i => fogC(RAMP[Math.max(0, Math.min(6, i))], fog), ry = R * .76, cy = py - ry;
    let g = `<ellipse cx="${F(px + R * .3)}" cy="${F(py)}" rx="${F(R * 1.15)}" ry="${F(Math.max(.6, R * .18))}" fill="#000" opacity=".22"/><ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(2)}"/>`;
    if (R > 2) [-.6, 0, .6].forEach(u => g += `<ellipse cx="${F(px + u * R * .6)}" cy="${F(cy)}" rx="${F(R * .42)}" ry="${F(ry * .95)}" fill="${C(u < -.3 ? 5 : u < .3 ? 4 : 3)}"/>`);
    return g + `<rect x="${F(px - R * .08)}" y="${F(cy - ry - R * .25)}" width="${F(R * .16)}" height="${F(R * .3)}" fill="${fogC("#4a5426", fog)}"/>`; };
  const shock = (px, py, hp, fog) => { const bw = hp * .5, ty = py - hp * .62, C = ["#5a4626", "#7a6234", "#9a7e44", "#b89a58", "#d2b672", "#e6cc8c"].map(c => fogC(c, fog));
    let g = `<ellipse cx="${F(px + hp * .2)}" cy="${F(py)}" rx="${F(bw * .7)}" ry="${F(Math.max(1, hp * .05))}" fill="#000" opacity=".2"/>`;
    const n = Math.max(8, Math.min(60, Math.round(hp * 1.2)));
    for (let i = 0; i < n; i++) { const u = i / (n - 1), bx = px + (u - .5) * bw, tx = px + (u - .5) * bw * .12, lit = cl(1 - u + (rh() - .5) * .4);
      g += `<path d="M${F(bx)},${F(py)} Q${F((bx + tx) / 2)},${F((py + ty) / 2)} ${F(tx)},${F(ty)}" stroke="${C[Math.floor(lit * 5)]}" stroke-width="${F(Math.max(.6, hp * .025))}" fill="none"/>`; }
    for (let i = 0; i < n * .7; i++) { const u = rh(), a = (u - .5) * 1.4 - Math.PI / 2, L = hp * (.25 + rh() * .18);
      g += `<path d="M${F(px)},${F(ty)} q${F(Math.cos(a) * L * .6)},${F(Math.sin(a) * L * .7)} ${F(Math.cos(a) * L)},${F(Math.sin(a) * L * .55 + L * .25)}" stroke="${C[Math.floor(cl(1 - u) * 5)]}" stroke-width="${F(Math.max(.5, hp * .02))}" fill="none"/>`; }
    return g; };
  // corn shocks and pumpkins on the store's porch steps, and by the church gate
  [[-24.6, STORE_Z - 3.6, "shock"], [-24.6, STORE_Z + 3.6, "shock"], [-24.2, STORE_Z - 2.6, "p"], [-24.0, STORE_Z - 1.9, "w"], [-24.2, STORE_Z + 2.4, "p"], [-23.9, STORE_Z + 1.7, "p"],
   [4.0, 103.9, "shock"], [8.0, 103.9, "shock"], [4.5, 103.4, "p"], [7.6, 103.3, "w"], [3.4, 103.5, "p"]].forEach(([x, z, k]) =>
    w.sprite({ x, z, fn: (px, py, kk, fog) => k === "shock" ? shock(px, py, 2.1 * kk, fog) : pumpkin(px, py, (k === "w" ? .2 : .24) * kk, fog, k === "w" ? WPUMP : PUMP) }));
  // a harvest-supper board on an easel by the path
  w.sprite({ x: -2.6, z: 46, fn: (px, py, k, fog) => { const m = v => v * k, C = c => fogC(c, fog);
    let g = `<path d="M${F(px - m(.45))},${F(py)} L${F(px - m(.2))},${F(py - m(1.25))} M${F(px + m(.45))},${F(py)} L${F(px + m(.2))},${F(py - m(1.25))}" stroke="${C("#6a4a2e")}" stroke-width="${F(m(.05))}"/>`;
    g += `<path d="M${F(px - m(.45))},${F(py - m(.55))} L${F(px + m(.45))},${F(py - m(.55))} L${F(px + m(.42))},${F(py - m(1.35))} L${F(px - m(.42))},${F(py - m(1.35))}Z" fill="${C("#2e3a30")}"/>`;
    g += `<path d="M${F(px - m(.38))},${F(py - m(.6))} L${F(px + m(.38))},${F(py - m(.6))} L${F(px + m(.36))},${F(py - m(1.3))} L${F(px - m(.36))},${F(py - m(1.3))}Z" fill="none" stroke="${C("#c8a050")}" stroke-width="${F(m(.02))}"/>`;
    [1.17, 1.02, .88, .74].forEach((y, i) => g += `<path d="M${F(px - m(i ? .26 : .3))},${F(py - m(y))} L${F(px + m(i ? .22 - i * .03 : .3))},${F(py - m(y))}" stroke="${C(i ? "#e8e2d0" : "#f0b050")}" stroke-width="${F(m(i ? .035 : .06))}" stroke-dasharray="${F(m(.05))},${F(m(.025))}"/>`);
    return g + pumpkin(px + m(.2), py, m(.16), fog, PUMP); } });

  /* ---------- wild turkeys on the green (day; gone to roost at night) ---------- */
  const BRZ = ["#1a120c", "#2a1c12", "#3e2a18", "#56391e", "#704a26", "#8e6232", "#ae8044", "#cca064"];
  const turkey = (px, py, k, fog, o) => {
    const d = o.dir, C = c => T(mix(c, HZ, fog * .9)), BR = BRZ.map(C), m = v => v * k;
    const X = x => px + d * x * k, Y = y => py - y * k, rr = rng(o.seed);
    const tom = o.pose === "strut", forage = o.pose === "forage";
    let g = `<ellipse cx="${F(px + m(.18))}" cy="${F(py)}" rx="${F(m(tom ? .6 : .45))}" ry="${F(Math.max(.8, m(.05)))}" fill="#000" opacity=".26"/>`;
    const legC = C("#b08478"), lw = Math.max(.8, m(.032));
    const legs = o.pose === "walk" ? [[.02, .36, -.1, 0], [.1, .36, .18, 0]] : [[.0, .36, -.02, 0], [.11, .36, .12, 0]];
    legs.forEach(([x0, y0, x1, y1]) => g += `<path d="M${F(X(x0))},${F(Y(y0))} L${F(X((x0 + x1) / 2 + .02))},${F(Y(.17))} L${F(X(x1))},${F(Y(y1))} l${F(d * m(.07))},0" stroke="${legC}" stroke-width="${F(lw)}" fill="none" stroke-linejoin="round"/>`);
    const bc = [0, tom ? .6 : .55], brx = tom ? .32 : .3, bry = tom ? .27 : .2, tilt = forage ? -14 : tom ? 4 : -4;
    if (tom) {   // the fan, seen from the side: a tall oval of banded feathers behind the body
      const fx = -.16, fy = .78, n = 22;
      for (let i = 0; i < n; i++) { const a = Math.PI * (.08 + .84 * i / (n - 1)), ex = fx + Math.cos(a) * .34 * -1, ey = fy + Math.sin(a) * .6 - .1;
        const wdt = .07, nx = Math.sin(a) * wdt, ny = Math.cos(a) * wdt * .5;
        g += `<path d="M${F(X(-.1))},${F(Y(.58))} L${F(X(ex - nx))},${F(Y(ey + ny))} Q${F(X(ex - Math.cos(a) * .04))},${F(Y(ey + Math.sin(a) * .06))} ${F(X(ex + nx))},${F(Y(ey - ny))}Z" fill="${BR[1 + (i % 2)]}"/>`;
        const t1 = .78, bx0 = -.1 + (ex + 0.1) * t1, by0 = .58 + (ey - .58) * t1;
        g += `<path d="M${F(X(bx0 - nx * t1))},${F(Y(by0 + ny * t1))} L${F(X(ex - nx))},${F(Y(ey + ny))} Q${F(X(ex - Math.cos(a) * .04))},${F(Y(ey + Math.sin(a) * .06))} ${F(X(ex + nx))},${F(Y(ey - ny))} L${F(X(bx0 + nx * t1))},${F(Y(by0 - ny * t1))}Z" fill="${C("#9a5a26")}"/>`;
        const t2 = .92, bx2 = -.1 + (ex + .1) * t2, by2 = .58 + (ey - .58) * t2;
        g += `<path d="M${F(X(bx2 - nx))},${F(Y(by2 + ny))} L${F(X(bx2 + nx))},${F(Y(by2 - ny))}" stroke="${C("#d8b478")}" stroke-width="${F(Math.max(.5, m(.02)))}"/>`;
        if (k > 40) for (let b = .35; b < .75; b += .1) { const bx = -.1 + (ex + .1) * b, by = .58 + (ey - .58) * b;
          g += `<path d="M${F(X(bx - nx * b))},${F(Y(by + ny * b))} L${F(X(bx + nx * b))},${F(Y(by - ny * b))}" stroke="${BR[0]}" stroke-width="${F(Math.max(.4, m(.012)))}"/>`; } }
    } else {   // a closed tail sloping back and down, with a chestnut tip
      g += `<path d="M${F(X(-.2))},${F(Y(.66))} L${F(X(-.62))},${F(Y(.5))} Q${F(X(-.66))},${F(Y(.44))} ${F(X(-.6))},${F(Y(.4))} L${F(X(-.18))},${F(Y(.46))}Z" fill="${BR[1]}"/>`;
      g += `<path d="M${F(X(-.55))},${F(Y(.52))} L${F(X(-.62))},${F(Y(.5))} Q${F(X(-.66))},${F(Y(.44))} ${F(X(-.6))},${F(Y(.4))} L${F(X(-.53))},${F(Y(.41))}Z" fill="${C("#9a5a26")}"/>`; }
    // body: a dark base and rows of iridescent bronze feathers, lit from the light's side
    const bcx = X(bc[0]), bcy = Y(bc[1]), RX = m(brx), RY = m(bry);
    let bg = `<ellipse cx="${F(bcx)}" cy="${F(bcy)}" rx="${F(RX)}" ry="${F(RY)}" fill="${BR[1]}"/>`;
    const nf = Math.max(14, Math.min(130, Math.round(k * 1.6)));
    const fs = [];
    for (let i = 0; i < nf; i++) { const a = rr() * Math.PI * 2, q = Math.sqrt(rr()) * .9, ex = Math.cos(a) * q, ey = Math.sin(a) * q;
      const lit = cl((ex * lightDir[0] + ey * lightDir[1]) * .45 + .45 + (rr() - .5) * .3);
      fs.push([bcx + ex * RX, bcy + ey * RY, lit]); }
    fs.sort((a, b) => a[1] - b[1]).forEach(([x, y, v]) => { const R = Math.max(.9, m(.05));
      bg += `<path d="M${F(x - R)},${F(y - R * .4)} Q${F(x)},${F(y + R * 1.1)} ${F(x + R)},${F(y - R * .4)} Q${F(x)},${F(y + R * .2)} ${F(x - R)},${F(y - R * .4)}Z" fill="${BR[2 + Math.floor(v * 5)]}"/>`;
      if (k > 30) bg += `<path d="M${F(x - R * .7)},${F(y + R * .25)} Q${F(x)},${F(y + R * .75)} ${F(x + R * .7)},${F(y + R * .25)}" stroke="${C(v > .5 ? "#d89a4a" : "#6a7a4a")}" stroke-width="${F(Math.max(.4, R * .25))}" fill="none" opacity=".7"/>`; });
    // the wing: barred primaries, white and dark
    const wx = X(-.04), wy = Y(bc[1] - .04);
    bg += `<ellipse cx="${F(wx)}" cy="${F(wy)}" rx="${F(m(.2))}" ry="${F(m(.1))}" fill="${BR[3]}" opacity=".9"/>`;
    for (let i = 0; i < 5; i++) bg += `<path d="M${F(X(-.02 - i * .045))},${F(Y(bc[1] - .1))} L${F(X(-.1 - i * .045))},${F(Y(bc[1] - .14))}" stroke="${C(i % 2 ? "#2a2018" : "#e0d8c4")}" stroke-width="${F(Math.max(.6, m(.025)))}"/>`;
    g += `<g transform="rotate(${F(tilt * d)} ${F(bcx)} ${F(bcy)})">${bg}</g>`;
    // beard on a tom's breast
    if (tom) g += `<path d="M${F(X(.26))},${F(Y(.6))} L${F(X(.3))},${F(Y(.4))} L${F(X(.25))},${F(Y(.42))}Z" fill="${C("#141010")}"/>`;
    // neck and head
    const hd = forage ? [.42, .2] : tom ? [.3, .92] : [.4, .9], nk0 = forage ? [.26, .52] : [.22, .68];
    const neckC = tom ? C("#c8566a") : C("#4a3a2c");
    g += `<path d="M${F(X(nk0[0]))},${F(Y(nk0[1]))} Q${F(X((nk0[0] + hd[0]) / 2 + (forage ? .08 : -.02)))},${F(Y((nk0[1] + hd[1]) / 2 + (forage ? .05 : 0)))} ${F(X(hd[0]))},${F(Y(hd[1]))}" stroke="${neckC}" stroke-width="${F(Math.max(1, m(tom ? .08 : .06)))}" fill="none" stroke-linecap="round"/>`;
    const hR = Math.max(1, m(tom ? .055 : .045));
    g += `<circle cx="${F(X(hd[0]))}" cy="${F(Y(hd[1]))}" r="${F(hR)}" fill="${tom ? C("#8ab4dc") : C("#8a98a4")}"/>`;
    if (tom) { g += `<circle cx="${F(X(hd[0] - .01))}" cy="${F(Y(hd[1] + .02))}" r="${F(hR * .55)}" fill="${C("#f2f0ee")}"/>`;
      g += `<path d="M${F(X(hd[0] + .02))},${F(Y(hd[1] - .03))} q${F(d * m(.05))},${F(m(.08))} ${F(d * m(.03))},${F(m(.16))}" stroke="${C("#c82a2a")}" stroke-width="${F(Math.max(.8, m(.035)))}" fill="none" stroke-linecap="round"/>`;
      g += `<ellipse cx="${F(X(hd[0] + .01))}" cy="${F(Y(hd[1] - .08))}" rx="${F(m(.04))}" ry="${F(m(.07))}" fill="${C("#c8302a")}"/>`; }
    g += `<path d="M${F(X(hd[0] + .04))},${F(Y(hd[1] + .01))} l${F(d * m(.06))},${F(m(forage ? .03 : .015))} l${F(-d * m(.06))},${F(m(.025))}Z" fill="${C("#d0c0a0")}"/>`;
    if (k > 25) g += `<circle cx="${F(X(hd[0] + .015))}" cy="${F(Y(hd[1] + .015))}" r="${F(Math.max(.5, m(.012)))}" fill="#101010"/>`;
    return g; };
  if (!NIGHT) [[-.9, 26.5, "strut", 1], [2.1, 28.5, "forage", -1], [-4.0, 30, "forage", 1], [4.0, 32, "walk", -1], [-6.6, 34, "forage", -1], [6.4, 36.5, "forage", 1], [-2.4, 39, "walk", 1]].forEach(([x, z, pose, dir], i) =>
    w.sprite({ x, z, fn: (px, py, k, fog) => turkey(px, py, k, fog, { pose, dir, seed: seed + 90 + i }) }));

  /* ---------------- assemble ---------------- */
  s += G;
  s += w.draw({ where: o => o.tag === "far" });
  s += `<rect x="0" y="${WY - 110}" width="${W}" height="150" fill="url(#mtHaze)" opacity="${NIGHT ? .3 : .42}"/>`;
  s += w.draw({ where: o => o.tag !== "far" });
  if (NIGHT) {
    s += `<g style="mix-blend-mode:screen">`;
    // floodlight on the steeple from the lawn, lamp pools on the streets
    { const p = w.proj([6, 10, 118]), q = w.proj([6, 22, 118]), k = FL / 118;
      s += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(k * 7)}" ry="${F(k * 12)}" fill="url(#mtFlood)"/><ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(k * 3.5)}" ry="${F(k * 9)}" fill="url(#mtFlood)" opacity=".7"/>`; }
    lamps.forEach(([x, z]) => { const q = pr(x, z), k = FL / z; s += `<ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(k * 3)}" ry="${F(k * .45)}" fill="url(#mtWarm)" opacity=".85"/>`; });
    s += `</g>`;
  }
  // grass and leaves at the bottom corners, under the cards
  const tuft = (x0, x1) => { let g = "";
    for (let i = 0; i < 80; i++) { const x = x0 + r() * (x1 - x0), y = 702 + r() * 30, hh = 30 + r() * 55, bend = (r() - .5) * 30;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#6a6a3a" : "#a49a5c")}" stroke-width="${F(1.6 + r() * 2)}" fill="none" stroke-linecap="round"/>`; }
    for (let i = 0; i < 40; i++) { const cx = x0 + r() * (x1 - x0), cy = 690 + r() * 30;
      g += `<ellipse cx="${F(cx)}" cy="${F(cy)}" rx="${F(5 + r() * 5)}" ry="${F(2 + r() * 2)}" fill="${T(LEAF[Math.floor(r() * LEAF.length)])}" transform="rotate(${F((r() - .5) * 60)} ${F(cx)} ${F(cy)})"/>`; }
    return g; };
  s += tuft(0, 320) + tuft(2240, 2560);

  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#mtLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".06"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#mtPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
