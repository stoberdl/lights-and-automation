/* Roadside Pumpkin Stand: a farm stand on a central-Ohio county road in mid-
   October, on a hot, hazy afternoon (Oct 13, 2026 was forecast at 86°, a
   record). Standing in the gravel lot: an open-fronted board stand with a
   green tin gable roof and a painted pumpkin on its gable, tiers of pumpkins,
   gourds, apple baskets and cider jugs inside, a string of bulbs under the
   eave, corn shocks tied to the corner posts, bins of pumpkins and pots of
   mums in front. A hay wagon heaped with pumpkins stands to the right; straw
   bales, mums and a scarecrow (with a crow on his arm) to the left. Behind: a
   split-rail fence, a harvested cornfield with corn shocks, a farmhouse with
   grain bins and a machine shed, woodlots in colour and low hills in haze.
   Sun high off the left edge.
   opts.time === "night": a thin waxing crescent low in the west, stars, bats,
   the stand lit by its bulb string and a lantern, jack-o'-lanterns glowing on
   the bales and bins, farmhouse windows and a yard light.
   The ground is two world3d() rasters (reference/scene-helpers.js); the
   stand, wagon, bales, buildings and trees are placed in metres by the same
   camera. Same shape as reference/autumn-valley.js. Needs rng(), mix(),
   world3d(), noise2(), mountainField(), hexRGB() and rgbTone() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function roadsidePumpkinStandArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 7413;
  const r = rng(seed), rs = rng(seed + 5), rt = rng(seed + 17), rp = rng(seed + 29);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -160, LY = 110, WY = 436;
  const T = c => NIGHT ? mix(mix(c, "#6e7488", .42), "#0a0e2a", .62) : c;
  const HZ = NIGHT ? "#2a3150" : "#e8e2d0", RIM = NIGHT ? "#a8b4e0" : "#fff2cc", SHADE = NIGHT ? "#04060e" : "#3a3446", LAMP = "#ffc46a";
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

  /* ---------------- sky: a hot, washed-out October blue, or a crescent night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#03051a"/><stop offset=".5" stop-color="#0b1134"/><stop offset=".86" stop-color="#22284e"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#5a86b8"/><stop offset=".42" stop-color="#8eb0cc"/><stop offset=".8" stop-color="#cdd6d6"/><stop offset="1" stop-color="#eee6cc"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e8a868" stop-opacity=".22"/><stop offset=".4" stop-color="#c88a6a" stop-opacity=".06"/><stop offset="1" stop-color="#c88a6a" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fffbe8" stop-opacity="1"/><stop offset=".16" stop-color="#fff0c0" stop-opacity=".6"/><stop offset=".5" stop-color="#ffe2a0" stop-opacity=".18"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/>`;
  let s = `<defs id="psdefs">
    <linearGradient id="psSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="psLight" cx="${NIGHT ? 300 : LX}" cy="${NIGHT ? WY : LY}" r="${NIGHT ? 900 : 1800}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="psHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".85"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="psGlow"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".42"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="psWarm"><stop offset="0" stop-color="#ffb860" stop-opacity=".55"/><stop offset=".5" stop-color="#ff9a40" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient>
    <filter id="psLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="psCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".014" numOctaves="3" seed="41" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="psCirrus" x="-10%" y="-60%" width="120%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".004 .05" numOctaves="3" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="3"/></filter>
    <filter id="psPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="13"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="psSoft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="psBlur2"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#psSky)"/>`;
  if (NIGHT) {
    // last of the dusk low in the west, stars, and a three-day crescent setting there
    s += `<rect width="${W}" height="${H}" fill="url(#psLight)"/>`;
    for (let i = 0; i < 950; i++) { const x = rs() * W, y = Math.pow(rs(), 1.25) * 420, big = rs() < .06;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.8 : F(.5 + rs() * .7)}" fill="${rs() < .18 ? "#ffe6c4" : "#e6ecff"}" opacity="${F((.25 + rs() * .6) * (1 - y / 470) * (x < 700 && y > 300 ? .5 : 1))}"/>`; }
    const mx = 940, my = 222, mr = 13;
    s += `<circle cx="${mx}" cy="${my}" r="${mr * 7}" fill="url(#psGlow)" opacity=".18"/>
      <circle cx="${mx}" cy="${my}" r="${mr}" fill="#3a4064" opacity=".55"/>
      <path d="M${mx - mr},${my} A${mr},${mr} 0 0 0 ${mx + mr},${my} A${mr * 1.08},${mr * .62} 0 0 1 ${mx - mr},${my}Z" fill="#fff4d8" transform="rotate(-18 ${mx} ${my})"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#psLight)"/>`;
    s += `<g class="rays" opacity=".08" filter="url(#psSoft)">`;
    for (let k = 0; k < 6; k++) { const a = .12 + k * .09, L = 2300;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: high cirrus streaks and a few small hazy cumulus low down ---------------- */
  {
    s += `<g class="drift1" filter="url(#psCirrus)">`;
    for (let i = 0; i < 16; i++) { const x = 200 + rs() * 2200, y = 50 + rs() * 190, L = 260 + rs() * 520, b = (rs() - .5) * 40;
      s += `<path d="M${F(x)},${F(y)} q${F(L * .5)},${F(b - 18)} ${F(L)},${F(b)}" stroke="${NIGHT ? "#262c58" : "#ffffff"}" stroke-width="${F(5 + rs() * 12)}" fill="none" stroke-linecap="round" opacity="${F(NIGHT ? .35 : .28 + rs() * .3)}"/>`;
      for (let k = 0; k < 5; k++) { const t = rs(); s += `<path d="M${F(x + L * t)},${F(y + b * t - 9 * Math.sin(t * Math.PI))} q${F(20 + rs() * 30)},${F(8 + rs() * 10)} ${F(40 + rs() * 50)},${F(22 + rs() * 16)}" stroke="${NIGHT ? "#262c58" : "#ffffff"}" stroke-width="${F(2 + rs() * 3)}" fill="none" stroke-linecap="round" opacity="${F(NIGHT ? .25 : .25)}"/>`; } }
    s += `</g>`;
  }
  const cumulus = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#psCloudy)">`;
    const n = 5 + Math.floor(rs() * 3), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.12 + rs() * .09) * (1 - Math.abs(t - .5) * .9);
      lobes.push([x + (t - .5) * w, y - R * (.35 + rs() * .45), R]); }
    if (NIGHT) {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .66)}" fill="#1c2246"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .2)}" cy="${F(ly - R * .2)}" rx="${F(R * .55)}" ry="${F(R * .32)}" fill="#2c3462" opacity=".55"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#c4c8cc"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .15)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.05)}" ry="${F(R * .72)}" fill="#d6d8d8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .05)}" cy="${F(ly)}" rx="${F(R * .95)}" ry="${F(R * .68)}" fill="#f0eee6"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .35)}" cy="${F(ly - R * .25)}" rx="${F(R * .5)}" ry="${F(R * .36)}" fill="#fffcf2"/>`);
    }
    return c + `</g></g>`;
  };
  s += `<g opacity="${NIGHT ? .8 : .9}">` + cumulus(380, 352, 220, "drift2") + cumulus(1010, 336, 170, "drift3") + cumulus(1850, 344, 240, "drift2") + cumulus(2330, 330, 190, "drift3") + `</g>`;
  if (!NIGHT) {   // a few crows crossing toward the woods
    s += `<g class="birds" fill="none" stroke="#1e1c22" stroke-width="2.4" stroke-linecap="round" opacity=".85">`;
    [[1460, 268, 1], [1498, 252, .85], [1530, 276, .9], [1572, 262, .75]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 11 * k)},${F(y - 2)} q${F(5 * k)},${F(-7 * k)} ${F(11 * k)},${F(2)} q${F(5 * k)},${F(-7 * k)} ${F(11 * k)},${F(-2)}"/>`);
    s += `</g>`;
  } else {        // bats over the stand
    s += `<g class="birds" fill="#05060e">`;
    [[1180, 214, .9], [1262, 240, .7], [1410, 200, .8], [1340, 176, .6], [1050, 250, .55]].forEach(([x, y, k]) =>
      s += `<path transform="translate(${x},${y}) scale(${k})" d="M0,0 q-10,-12 -24,-8 q6,4 4,10 q-8,-2 -12,4 q14,-2 32,6 q18,-8 32,-6 q-4,-6 -12,-4 q-2,-6 4,-10 q-14,-4 -24,8z"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 1.6 m above the gravel lot (y = 0); metres, x right, y up, z away.
     County road across the bottom (z 11-18), the lot to z 44, then the fence and fields. */
  const EYE = 1.6, FL = 2000;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: [-.72, .5, -.35], tone: T, fog: HZ, fogK: .0006,
    shadow: SHADE, rim: RIM, shade: .5, hi: .3, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const capY = px => 262 - 70 * Math.exp(-(((px - 1250) / 300) ** 2));
  const MF = mountainField({ seed: 9127, scale: 2400, oct: 5, peaks: [
    { x: -4200, z: 6200, h: 200, rx: 2800, rz: 1800 }, { x: 900, z: 7600, h: 250, r: 2600 }, { x: 5600, z: 5400, h: 170, r: 2200 }, { x: 2400, z: 11000, h: 340, r: 3600 } ] });
  const hG = (x, z) => {
    if (z < 50) return .06 + .03 * N3(x / 3, z / 3);               // never below 0: the raster reads that as water
    const roll = sm((z - 60) / 260) * (2.2 + 2 * N1(x / 300, z / 300));
    return Math.max(.06, .06 + roll + MF(x, z) * sm((z - 2400) / 3000)); };

  /* ground colour: road, gravel lot, verge, stubble, pasture, a patchwork beyond */
  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const ASP = H3("#5a5a5c"), ASP2 = H3("#6e6c68"), GRAV = H3("#ac9e86"), GRAV2 = H3("#8e8270"), VERGE = H3("#8a9a4c"), VERGE2 = H3("#a8a458"),
        STUB = H3("#c0a672"), STUB2 = H3("#9a8456"), PAST = H3("#9aa055"), PAST2 = H3("#b8a860"), PLOW = H3("#7a5e44"), WHEAT = H3("#7e9a48");
  const FOR = ["#3e4a28", "#5a5226", "#b0622a", "#94321e", "#c8962e", "#7a4220"].map(H3);
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const LOT = (x, z) => z > 18.5 && z < 44 + 3 * N2(x / 9, 1.3) && Math.abs(x + 1) < 22 + 4 * N2(z / 7, 5.1);
  const col = (x, y, z, n) => {
    const tex = 1 / (1 + z / 40);
    if (z >= 11 && z <= 18.5) {                                                    // the county road
      let c = L3(ASP, ASP2, .5 + .6 * N3(x / 2, z / 2));
      if (Math.abs(z - 14.75) < .07 && ((x % 7) + 7) % 7 < 3.2) c = H3("#d8b040");
      if (Math.abs(z - 11.3) < .07 || Math.abs(z - 18.2) < .07) c = H3("#dcdad0");
      return c; }
    if (z < 11) return L3(VERGE, VERGE2, .5 + .5 * N2(x / 3, z / 3));
    if (LOT(x, z)) { const q = N3(x / .35, z / .35) * tex; return L3(GRAV, GRAV2, .45 + q * .8 + .3 * N2(x / 6, z / 6)); }
    if (z < 52) return L3(VERGE, VERGE2, .5 + .6 * N2(x / 5, z / 5) + .3 * N3(x / .8, z / .8) * tex);
    if (z < 330 && x < 70 && x > -260) {                                           // harvested cornfield, rows running away
      const row = Math.sin(x * Math.PI * 2 / .76) * sm(1 - z / 120) * .6;
      return L3(STUB, STUB2, .45 + row + .4 * N3(x / 4, z / 4) * tex + .25 * N2(x / 30, z / 30)); }
    if (z < 330 && x >= 70) return L3(PAST, PAST2, .5 + .5 * N2(x / 25, z / 25));
    if (y > 25) {                                                                  // the hills: woods in colour
      const k = N1(x / 300, z / 300) * .5 + .5; let c = L3(FOR[0], FOR[1], k);
      c = L3(c, FOR[2 + Math.floor(hash(Math.floor(x / 140), Math.floor(z / 140)) * 4)], sm((N3(x / 420, z / 420) + .2) / .4) * .8);
      return c.map(v => v * (.8 + .4 * (N2(x / 40, z / 40) * .5 + .5))); }
    const cell = hash(Math.floor((x + 3000) / 190), Math.floor(z / 150));             // the patchwork of farms
    const c = cell < .3 ? STUB : cell < .55 ? PAST : cell < .72 ? PLOW : cell < .86 ? WHEAT : PAST2;
    return L3(c, STUB2, .2 + .3 * N2(x / 60, z / 60)); };
  const far = w.raster({ z0: 1400, z1: 26000, step: .0016, minStep: 2, scale: .6, top: 220, bottom: WY + 8, h: hG, col, tone: rgbTone(T), fog: HZ, fogK: .00026, amb: NIGHT ? .6 : .52, noRefl: true, key: 1e7 });
  const near = w.raster({ z0: 3, z1: 1400, step: .0011, minStep: .05, scale: .75, top: 220, bottom: H, h: hG, col, tone: rgbTone(T), fog: HZ, fogK: .0006, amb: NIGHT ? .55 : .5, noRefl: true, key: 5e6 });
  const seen = (x, z, y) => { const y0 = sy(y, z) - 1.2;
    for (let q = 50; q < z * .985; q += Math.max(.5, q * .01)) { const xq = x * q / z; if (sy(hG(xq, q), q) < y0) return false; }
    return true; };

  /* ---------- painterly pieces drawn as sprites ---------- */
  const ORG = ["#5a200a", "#86300c", "#ac4410", "#cc5a16", "#e2731e", "#f08e2e", "#f8ac52", "#fcca86"];
  const WHT = ["#6a6250", "#8a8270", "#a8a08c", "#c4bca6", "#d8d2be", "#e8e4d4", "#f4f0e2", "#fffcf2"];
  const RED = ["#4a140a", "#6a1c0c", "#8a2a10", "#a83a14", "#c24e1c", "#d4682a", "#e48a44", "#f0ac6a"];
  const GRN = ["#1e2a14", "#2a3a1a", "#3a4c20", "#4e6028", "#647432", "#7c8a40", "#98a456", "#b6bc74"];
  const fogC = (c, fog) => T(mix(c, HZ, fog));
  /* a ribbed pumpkin sitting on (px, py); R in px. jack: carved face (lit at night) */
  const pumpkin = (px, py, R, fog, RAMP, jack) => {
    const ry = R * (.72 + rp() * .14), cy = py - ry, C = i => fogC(RAMP[Math.max(0, Math.min(7, i))], fog);
    let g = `<ellipse cx="${F(px + R * .3)}" cy="${F(py)}" rx="${F(R * 1.2)}" ry="${F(Math.max(.8, R * .2))}" fill="#000" opacity=".22"/>`;
    if (R < 2.2) return g + `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(4)}"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(2)}"/>`;
    const nr = R > 9 ? 5 : 3;
    for (let i = 0; i < nr; i++) { const u = (i + .5) / nr * 2 - 1, rx = R * (1 - Math.abs(u) * .55) / nr * 1.25;
      g += `<ellipse cx="${F(px + u * R * .62)}" cy="${F(cy)}" rx="${F(rx)}" ry="${F(ry * (.97 - Math.abs(u) * .08))}" fill="${C(u < -.3 ? 6 : u < .2 ? 5 : u < .6 ? 4 : 3)}"/>`; }
    if (R > 5) g += `<ellipse cx="${F(px - R * .42)}" cy="${F(cy - ry * .38)}" rx="${F(R * .2)}" ry="${F(ry * .14)}" fill="${C(7)}" opacity=".7"/>`;
    g += `<path d="M${F(px - R * .06)},${F(cy - ry * .9)} q${F(R * .02)},${F(-R * .22)} ${F(R * .16)},${F(-R * .3)} l${F(R * .06)},${F(R * .06)} q${F(-R * .1)},${F(R * .1)} ${F(-R * .08)},${F(R * .26)}Z" fill="${fogC("#4a5426", fog)}"/>`;
    if (jack && R > 5) {
      const fc = NIGHT ? "#ffd070" : fogC("#3a1606", fog);
      g += `<path d="M${F(px - R * .5)},${F(cy - ry * .12)} l${F(R * .18)},${F(-R * .28)} l${F(R * .18)},${F(R * .28)}Z M${F(px + R * .14)},${F(cy - ry * .12)} l${F(R * .18)},${F(-R * .28)} l${F(R * .18)},${F(R * .28)}Z M${F(px - R * .56)},${F(cy + ry * .18)} q${F(R * .56)},${F(ry * .5)} ${F(R * 1.12)},0 l${F(-R * .2)},${F(ry * .14)} l${F(-R * .18)},${F(-ry * .12)} l${F(-R * .18)},${F(ry * .12)} l${F(-R * .18)},${F(-ry * .12)} l${F(-R * .2)},${F(ry * .14)}Z" fill="${fc}"/>`;
      if (NIGHT) g += `<circle cx="${F(px)}" cy="${F(cy)}" r="${F(R * 4)}" fill="url(#psGlow)" opacity=".55"/>`; }
    return g; };
  const pickPumpkin = () => { const q = rp(); return q < .62 ? ORG : q < .78 ? RED : q < .92 ? WHT : GRN; };
  /* a pile of pumpkins on a surface: list of [dx, dy, sizeM] in local px offsets */
  const pile = (px, py, k, fog, wM, n, jackP = 0) => {
    const items = [];
    for (let i = 0; i < n; i++) { const u = rp() * 2 - 1, layer = rp() < .4 ? 1 : 0, sz = .26 + rp() * .2;
      items.push([u * wM * k * .5 * (1 - layer * .35), -layer * k * .2 - (1 - Math.abs(u)) * k * .1 * layer, sz]); }
    items.sort((a, b) => a[1] - b[1] || b[0] - a[0]);
    return items.map(([dx, dy, sz]) => pumpkin(px + dx, py + dy, sz * k / 2, fog, pickPumpkin(), rp() < jackP)).join(""); };
  /* a potted mum: a dome of tiny flowers */
  const mum = (px, py, k, fog, hue) => {
    const R = .28 * k, C = { gold: ["#8a6a10", "#c89a1c", "#e8c03a", "#f8de7a"], rust: ["#6a2210", "#a03c18", "#c85a26", "#e88a4a"], plum: ["#3a1a3a", "#6a2e66", "#94488e", "#c07ab8"], cream: ["#8a8268", "#c8c0a0", "#e8e2c8", "#fffaf0"] }[hue];
    let g = `<path d="M${F(px - R * .55)},${F(py - R * .62)} L${F(px + R * .55)},${F(py - R * .62)} L${F(px + R * .4)},${F(py)} L${F(px - R * .4)},${F(py)}Z" fill="${fogC("#a85a3a", fog)}"/><path d="M${F(px + R * .1)},${F(py - R * .62)} L${F(px + R * .55)},${F(py - R * .62)} L${F(px + R * .4)},${F(py)} L${F(px + R * .05)},${F(py)}Z" fill="${fogC("#6a3424", fog)}" opacity=".7"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(py - R * .95)}" rx="${F(R)}" ry="${F(R * .62)}" fill="${fogC(C[0], fog)}"/>`;
    const m = Math.max(4, Math.min(60, Math.round(R * 1.5)));
    for (let i = 0; i < m; i++) { const a = rp() * Math.PI * 2, q = Math.sqrt(rp()), x = px + Math.cos(a) * q * R * .9, y = py - R * .95 + Math.sin(a) * q * R * .55 - (1 - q) * R * .1;
      const side = (px - x) / R + (py - R * .95 - y) / R; g += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(Math.max(.6, R * .1))}" fill="${fogC(C[side > .3 ? 3 : side > -.3 ? 2 : 1], fog)}"/>`; }
    return g; };
  /* a corn shock: stalks stood up in a teepee and tied */
  const shock = (px, py, hp, fog) => {
    const bw = hp * .55, ty = py - hp * .62; let g = `<ellipse cx="${F(px + hp * .2)}" cy="${F(py)}" rx="${F(bw * .7)}" ry="${F(Math.max(1, hp * .05))}" fill="#000" opacity=".2"/>`;
    const C = ["#5a4626", "#7a6234", "#9a7e44", "#b89a58", "#d2b672", "#e6cc8c"].map(c => fogC(c, fog));
    const n = Math.max(8, Math.min(90, Math.round(hp * 1.2)));
    for (let i = 0; i < n; i++) { const u = i / (n - 1), bx = px + (u - .5) * bw, tx = px + (u - .5) * bw * .12, lit = cl(1 - u + (rp() - .5) * .4);
      g += `<path d="M${F(bx)},${F(py)} Q${F((bx + tx) / 2)},${F((py + ty) / 2)} ${F(tx)},${F(ty)}" stroke="${C[Math.floor(lit * 5)]}" stroke-width="${F(Math.max(.7, hp * .025))}" fill="none"/>`; }
    for (let i = 0; i < n * .8; i++) { const u = rp(), a = (u - .5) * 1.4 - Math.PI / 2, L = hp * (.25 + rp() * .18), lit = cl(1 - u + (rp() - .5) * .3);
      g += `<path d="M${F(px + (u - .5) * bw * .1)},${F(ty)} q${F(Math.cos(a) * L * .6)},${F(Math.sin(a) * L * .7)} ${F(Math.cos(a) * L)},${F(Math.sin(a) * L * .55 + L * .25)}" stroke="${C[Math.floor(lit * 5)]}" stroke-width="${F(Math.max(.6, hp * .02))}" fill="none"/>`; }
    for (let i = 0; i < n * .4; i++) { const u = rp(), y = py - rp() * hp * .5, x = px + (u - .5) * bw * (1 - (py - y) / hp * .8), L = hp * (.12 + rp() * .12), dir = u < .5 ? -1 : 1;
      g += `<path d="M${F(x)},${F(y)} q${F(dir * L * .5)},${F(-L * .2)} ${F(dir * L)},${F(L * .35)}" stroke="${C[u < .5 ? 4 : 2]}" stroke-width="${F(Math.max(.6, hp * .018))}" fill="none"/>`; }
    g += `<path d="M${F(px - bw * .07)},${F(ty + hp * .02)} L${F(px + bw * .07)},${F(ty + hp * .02)}" stroke="${fogC("#6a4a2a", fog)}" stroke-width="${F(Math.max(.8, hp * .03))}"/>`;
    return g; };

  /* ---------- trees (the woodlots and windbreaks): many lit leaf clumps ---------- */
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const GOLD = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const OAK = ["#22281a", "#2e361c", "#3e4620", "#525a26", "#68702e", "#80843a", "#9c9c52", "#bab874"];
  const broadleaf = (x, y, hp, RAMP, fog, n) => {
    const sd = 1, Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .032), ty = y - hp * .3;
    g += `<ellipse cx="${F(x + hp * .3)}" cy="${F(y + 1)}" rx="${F(hp * .42)}" ry="${F(Math.max(1, hp * .035))}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .5)},${F(ty)} L${F(x + tb * .5)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5a4c40")}"/>`;
    g += `<path d="M${F(x + sd * tb * .1)},${F(y)} L${F(x + sd * tb * .1)},${F(ty)} L${F(x + sd * tb * .5)},${F(ty)} L${F(x + sd * tb)},${F(y)}Z" fill="${Tf("#30261e")}"/>`;
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
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx + a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#psLeafy)">${cg}</g>`; };
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1a140c", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(48, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (x - px) + (y - sz * .5 - py) * .6, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    if (sz > 14) g += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - sz * .2)}" stroke="${mix(c, "#000000", .55)}" stroke-width="${F(Math.max(1, sz * .05))}"/>`;
    return g; };
  const pickRamp = q => q < .3 ? MAPLE : q < .55 ? GOLD : q < .75 ? RUST : OAK;
  const treeFn = (hM, RAMP) => (px, py, kk, fog) => { const hp = hM * kk;
    return hp > 60 ? broadleaf(px, py, hp, RAMP, fog, Math.min(240, Math.round(hp * .6)))
      : hp > 26 ? `<g filter="url(#psLeafy)">${clump(px, py, hp, fog * .9, RAMP)}</g>` : clump(px, py, Math.max(2.5, hp), fog * .9, RAMP); };
  const room = (x, z, y0) => (sy(y0, z) - capY(sx(x, z))) * z / FL;
  const plant = (x, z, hM, tag) => { if (z < 60) return; const y0 = hG(x, z), u = sx(x, z); if (u < -120 || u > W + 120) return;
    const rm = room(x, z, y0); if (rm < hM * .8) return; const h = Math.min(hM, rm);
    if (!seen(x, z, y0 + h * .7)) return;
    w.sprite({ x, z, y: y0 - .3, tag, fn: treeFn(h, pickRamp(r())) });
    // underbrush at its foot, so a wood's edge is not a row of bare trunks
    const ub = h * (.28 + r() * .14), UR = r() < .5 ? OAK : RUST;
    w.sprite({ x: x + (r() - .5) * 3, z: z - .8, y: y0 - .2, tag, fn: (px, py, kk, fog) => clump(px, py, Math.max(2, ub * kk), Math.min(1, fog * .9 + .06), UR) }); };
  // woodlot on the right, windbreak behind the farm, fence-row trees, a far tree line, scattered woods beyond
  // woods come in separate lots with fields between, so the hills show through the gaps
  const lot = (x, z) => N2(x / 340 + 4.1, z / 340) > -.05 + .1 * Math.sin(x / 90);
  for (let i = 0; i < 380; i++) { const x = 110 + r() * 380, z = 260 + Math.pow(r(), .7) * 380; if (N2(x / 120, z / 120 + 3) > -.2) plant(x, z, 13 + r() * 12, "far"); }
  for (let i = 0; i < 70; i++) plant(-200 + r() * 130, 292 + r() * 36, 15 + r() * 9, "far");
  for (let i = 0; i < 40; i++) { const x = -260 + r() * 380; if (Math.sin(x / 23) > -.2) plant(x, 335 + r() * 8, 9 + r() * 9, "far"); }
  for (let i = 0; i < 1600; i++) { const z = 650 + r() * 1300, x = (r() - .5) * 1.4 * z; if (lot(x, z)) plant(x, z, 13 + r() * 13, "far"); }

  /* ---------- the farm across the field ---------- */
  { const hr = rng(seed + 61);
    w.house({ ...w.randomHouse(hr, { x: -78, z: 236, yaw: 22, rng: hr, kind: "farm" }), wall: "#f2ece0", roof: "#3e4048", h: 6.1, rh: 3.4, w: 10, d: 7, roof3: "gable", gable: false, porch: true, chim: .25, shut: "#2a3a32", tag: "far" });
    w.house({ x: -24, z: 268, yaw: -8, w: 16, d: 10, h: 4.6, rh: 2.2, wall: "#9ea4a6", roof: "#6a6e72", trim: "#c8ccd0", clap: false, winGap: 9, door: .3, doorC: "#6a6e72", rng: hr, tag: "far" });
    [[-50, 254, 3.4, 7.5], [-41, 259, 2.8, 6.2], [-58, 262, 3, 6.8]].forEach(([x, z, R, h]) => {
      w.cyl({ x, z, r0: R, h, n: 28, c: "#c4c8ca", top: false });
      w.cyl({ x, z, y: h, r0: R + .15, r1: .5, h: R * .55, n: 28, c: "#b4b8ba" }); });
  }
  // corn shocks standing in the stubble
  for (let j = 0; j < 7; j++) for (let i = 0; i < 9; i++) {
    const z = 64 + j * 26 + (rp() - .5) * 8, x = -70 + i * 15 + (rp() - .5) * 6 + j * 3; if (x > 62 || rp() < .25) continue;
    const hM = 2.2 + rp() * .5; w.sprite({ x, z, y: hG(x, z) - .05, tag: "mid", fn: (px, py, k, fog) => shock(px, py, hM * k, fog) }); }
  // the split-rail fence along the field edge
  { const FZ = 50, posts = [];
    for (let x = -70; x <= 70; x += 3.2) posts.push([x, FZ + .4 * Math.sin(x / 9)]);
    posts.forEach(([x, z]) => w.box({ x, z, w: .14, d: .14, h: 1.25, c: "#7a6a58" }));
    for (let i = 0; i < posts.length - 1; i++) { const [x0, z0] = posts[i], [x1, z1] = posts[i + 1];
      [.55, 1.0].forEach(y => w.line([[x0, y, z0], [x1, y + (i % 2 ? .04 : -.04), z1]], "#8a7a64", .09)); } }

  /* ---------- the stand ---------- */
  const SX = -.4, SZ = 34, SYAW = 22;
  const { P: SP } = w.frame({ x: SX, z: SZ, yaw: SYAW });
  const WOOD = "#8a7864", WOOD2 = "#6e5e4e", INT = "#5a4a3c", TRIM = "#e8dcc0", TIN = "#4e6a58";
  const at = (lx, ly, lz) => SP([lx, ly, lz]);
  const boxL = (lx, ly, lz, bw, bd, bh, c, o = {}) => { const p = at(lx, 0, lz); return w.box({ x: p[0], z: p[2], y: ly, yaw: SYAW, w: bw, d: bd, h: bh, c, ...o }); };
  const boards = (x0, x1, y0, y1fn, lz, c) => { const dec = []; for (let x = x0 + .22; x < x1; x += .22) dec.push({ P: [at(x, y0, lz - .03), at(x, y1fn(x), lz - .03)], c, ln: .025, min: .35, op: .55 }); return dec; };
  boxL(0, 0, 0, 7.9, 3.9, .3, "#6e5e4c");                                           // deck
  boxL(0, .3, 1.8, 7.6, .12, 2.6, INT);                                             // back wall (its inside shows)
  boxL(-3.76, .3, 0, .12, 3.6, 2.6, WOOD);                                          // side walls
  boxL(3.76, .3, 0, .12, 3.6, 2.6, mix(WOOD, INT, .5));
  [-3.8, -1.3, 1.3, 3.8].forEach(lx => boxL(lx, .3, -1.85, .2, .2, 2.6, "#7a6a56"));  // front posts
  boxL(0, 2.65, -1.85, 8.0, .24, .32, WOOD2);                                       // header beam
  // front gable with vertical boards and a painted pumpkin
  { const g = [at(-4.0, 2.97, -1.86), at(4.0, 2.97, -1.86), at(0, 4.5, -1.86)];
    const dec = boards(-3.95, 3.95, 2.97, x => 4.5 - Math.abs(x) * (1.53 / 4) - .05, -1.86, "#3a3028");
    const circ = (rx, ry, cy, c, off) => ({ P: Array.from({ length: 20 }, (_, i) => { const a = i / 20 * Math.PI * 2; return at(Math.cos(a) * rx, cy + Math.sin(a) * ry, -1.86 - off); }), c });
    dec.push(circ(.62, .48, 3.5, "#2a2018", .02), circ(.56, .42, 3.5, "#e07a22", .03), circ(.22, .4, 3.5, "#f09a3a", .04), circ(.07, .12, 4.0, "#4a6a2a", .04));
    w.add([{ P: g, c: WOOD, dec }], { center: at(0, 3.5, 0) });
    w.add([{ P: [at(-4.0, 2.97, 1.86), at(4.0, 2.97, 1.86), at(0, 4.5, 1.86)], c: WOOD2 }], { center: at(0, 3.5, 0) }); }
  // tin roof: two planes with ribs, cream fascia on the gable
  { const ov = .45;
    [-1, 1].forEach(sd => {
      const A = at(sd * 4.35, 2.8, -1.86 - ov), B = at(0, 4.62, -1.86 - ov), Cc = at(0, 4.62, 1.86 + ov), D = at(sd * 4.35, 2.8, 1.86 + ov), dec = [];
      for (let zz = -1.86 - ov + .25; zz < 1.86 + ov; zz += .3) dec.push({ P: [at(sd * 4.35, 2.8, zz), at(0, 4.62, zz)], c: "#2e4236", ln: .03, min: .35, op: .5 });
      w.add([{ P: [A, B, Cc, D], c: TIN, two: true, back: "#2a3028", dec }], { center: at(0, 2, 0), bias: sd < 0 ? -.3 : -.2 });
      w.line([A, B], TRIM, .14, { bias: -.6 }); }); }
  // display tiers inside, stepping up toward the back
  const tiers = [[-1.15, .78], [-.45, 1.15], [.25, 1.5], [.95, 1.85]];
  tiers.forEach(([lz, th]) => boxL(0, .3, lz, 7.1, .7, th - .3, "#7a6448"));
  // goods on the tiers: pumpkins, gourds, apple baskets, cider jugs (back rows first)
  const goods = [];
  tiers.slice().reverse().forEach(([lz, th], ti) => {
    for (let lx = -3.25; lx < 3.3; lx += .34 + rp() * .18) {
      const kind = ti === 0 ? (rp() < .5 ? "jug" : "jar") : ti === 1 ? (rp() < .55 ? "basket" : "gourd") : rp() < .7 ? "pumpkin" : "gourd";
      const p = at(lx, th, lz - .12 + (rp() - .5) * .2); goods.push([p, kind]); } });
  goods.forEach(([p, kind]) => w.sprite({ x: p[0], z: p[2], y: p[1], bias: -2.2, fn: (px, py, k, fog) => {
    const sh = NIGHT ? .1 : .25;      // under the roof: shade the goods a little
    const dim = c => mix(c, "#2a2018", sh);
    if (kind === "pumpkin") return pumpkin(px, py, (.17 + rp() * .1) * k, fog, pickPumpkin().map(dim), false);
    if (kind === "gourd") { const c = ["#e8c840", "#f0e6c8", "#6a8a3a", "#e0862a", "#c8b040"][Math.floor(rp() * 5)], R = (.07 + rp() * .05) * k;
      return `<ellipse cx="${F(px)}" cy="${F(py - R * 1.1)}" rx="${F(R * .8)}" ry="${F(R * 1.1)}" fill="${fogC(dim(c), fog)}"/><ellipse cx="${F(px - R * .25)}" cy="${F(py - R * 1.4)}" rx="${F(R * .25)}" ry="${F(R * .4)}" fill="${fogC(dim(mix(c, "#ffffff", .3)), fog)}"/>`; }
    if (kind === "basket") { const R = .2 * k; let g = `<path d="M${F(px - R)},${F(py - R * 1.1)} L${F(px + R)},${F(py - R * 1.1)} L${F(px + R * .75)},${F(py)} L${F(px - R * .75)},${F(py)}Z" fill="${fogC(dim("#b08a54"), fog)}"/>`;
      for (let i = 0; i < 3; i++) g += `<path d="M${F(px - R * .95)},${F(py - R * (.3 + i * .3))} L${F(px + R * .95)},${F(py - R * (.3 + i * .3))}" stroke="${fogC(dim("#7a5a34"), fog)}" stroke-width="${F(Math.max(.5, R * .06))}"/>`;
      for (let i = 0; i < 7; i++) { const ax = px + (i / 6 - .5) * R * 1.6, ay = py - R * 1.15 - Math.sin(i / 6 * Math.PI) * R * .25;
        g += `<circle cx="${F(ax)}" cy="${F(ay)}" r="${F(R * .2)}" fill="${fogC(dim(i % 3 ? "#b8261c" : "#d8a030"), fog)}"/><circle cx="${F(ax - R * .06)}" cy="${F(ay - R * .06)}" r="${F(R * .07)}" fill="${fogC(dim("#ffd8b0"), fog)}" opacity=".6"/>`; }
      return g; }
    if (kind === "jug") { const R = .08 * k; return `<path d="M${F(px - R)},${F(py)} L${F(px - R)},${F(py - R * 2.2)} Q${F(px - R)},${F(py - R * 2.9)} ${F(px - R * .3)},${F(py - R * 3)} L${F(px - R * .3)},${F(py - R * 3.5)} L${F(px + R * .3)},${F(py - R * 3.5)} L${F(px + R * .3)},${F(py - R * 3)} Q${F(px + R)},${F(py - R * 2.9)} ${F(px + R)},${F(py - R * 2.2)} L${F(px + R)},${F(py)}Z" fill="${fogC(dim("#a8581a"), fog)}"/><rect x="${F(px - R * .7)}" y="${F(py - R * 1.6)}" width="${F(R * .4)}" height="${F(R * 1.2)}" fill="${fogC(dim("#e8a050"), fog)}" opacity=".7"/><rect x="${F(px - R * .3)}" y="${F(py - R * 3.6)}" width="${F(R * .6)}" height="${F(R * .3)}" fill="${fogC("#e8e0d0", fog)}"/>`; }
    const R = .06 * k, c = ["#c8901a", "#8a1e24", "#d8b040", "#6a1a3a"][Math.floor(rp() * 4)];
    return `<rect x="${F(px - R)}" y="${F(py - R * 2.2)}" width="${F(R * 2)}" height="${F(R * 2.2)}" fill="${fogC(dim(c), fog)}"/><rect x="${F(px - R)}" y="${F(py - R * 2.5)}" width="${F(R * 2)}" height="${F(R * .4)}" fill="${fogC(dim("#d8d0c0"), fog)}"/><rect x="${F(px - R * .6)}" y="${F(py - R * 1.9)}" width="${F(R * .4)}" height="${F(R * 1.5)}" fill="#fff" opacity=".25"/>`; } }));
  // a shelf of jams on the back wall
  { const a = at(-3.4, 2.05, 1.72), b = at(3.4, 2.05, 1.72); w.line([a, b], "#5a4634", .06, { bias: -.5 }); }
  // the string of bulbs under the header, sagging between posts
  const bulbs = [];
  { const xs = [-3.8, -1.3, 1.3, 3.8];
    for (let i = 0; i < 3; i++) { const pts = [];
      for (let t = 0; t <= 1.0001; t += .1) { const lx = xs[i] + (xs[i + 1] - xs[i]) * t, ly = 2.6 - .28 * Math.sin(t * Math.PI); pts.push(at(lx, ly, -2.0)); if (t > .05 && t < .96) bulbs.push(at(lx, ly - .08, -2.0)); }
      w.line(pts, "#2a2a22", .015, { bias: -3 }); } }
  bulbs.forEach(p => w.sprite({ x: p[0], z: p[2], y: p[1], bias: -3.1, fn: (px, py, k) => NIGHT
    ? `<circle cx="${F(px)}" cy="${F(py)}" r="${F(.35 * k)}" fill="url(#psGlow)" opacity=".9"/><circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(1.2, .05 * k))}" fill="#fff4cc"/>`
    : `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(1, .045 * k))}" fill="${T("#f2ead2")}"/><circle cx="${F(px - .015 * k)}" cy="${F(py - .015 * k)}" r="${F(Math.max(.4, .015 * k))}" fill="#fff"/>` }));
  // corn shocks tied to the two front corner posts
  [[-4.15, -2.05], [4.1, -2.05]].forEach(([lx, lz]) => { const p = at(lx, 0, lz); w.sprite({ x: p[0], z: p[2], y: .3, bias: -3.4, fn: (px, py, k, fog) => shock(px, py, 2.5 * k, fog) }); });
  // bins of pumpkins and mums along the front
  [[-2.3, -3.3, 1.3], [.1, -3.45, 1.3], [2.5, -3.2, 1.2]].forEach(([lx, lz, bw], i) => {
    boxL(lx, 0, lz, bw, 1.0, .62, "#9a7a52", { yaw: SYAW + (i - 1) * 6 });
    const p = at(lx, .62, lz - .1); w.sprite({ x: p[0], z: p[2] - .3, y: .62, fn: (px, py, k, fog) => pile(px, py, k, fog, bw * .95, 11, i === 1 ? .2 : 0) }); });
  [[-3.6, -2.55, "gold"], [-1.0, -2.6, "rust"], [1.35, -2.6, "plum"], [3.6, -2.5, "gold"], [-4.6, -3.0, "cream"]].forEach(([lx, lz, hue]) => { const p = at(lx, 0, lz); w.sprite({ x: p[0], z: p[2], y: 0, fn: (px, py, k, fog) => mum(px, py, k, fog, hue) }); });
  // a chalkboard easel by the right post (abstract chalk marks, no words)
  { const p = at(4.7, 0, -2.6); w.box({ x: p[0], z: p[2], y: .05, yaw: SYAW - 20, w: .9, d: .06, h: 1.15, c: "#2c302c", dec: (faces, P) => {
      faces[0].dec = [[-.36, .9, -.04, .9], [-.36, .75, .3, .75], [-.36, .55, .1, .55], [-.36, .4, .26, .4]].map(([x0, y0, x1, y1]) => ({ P: [P([x0, y0, -.04]), P([x1, y1, -.04])], c: "#e8e6dc", ln: .03, min: .5, op: .8 }));
      faces[0].dec.push({ P: [P([-.45, 1.15, -.04]), P([.45, 1.15, -.04])], c: "#8a6a44", ln: .06, min: .6 }); } }); }
  // big pumpkins set out on the gravel
  [[-5.4, -3.6], [-4.8, -4.4], [5.4, -3.9], [6.0, -3.2], [-1.4, -4.6]].forEach(([lx, lz], i) => { const p = at(lx, 0, lz), sz = .5 + rp() * .25;
    w.sprite({ x: p[0], z: p[2], y: 0, fn: (px, py, k, fog) => pumpkin(px, py, sz * k / 2, fog, i === 2 ? WHT : ORG, i === 0 || i === 3) }); });

  /* ---------- the hay wagon heaped with pumpkins (right) ---------- */
  { const WX = 9.4, WZ = 40, WYAW = -28, { P: WP } = w.frame({ x: WX, z: WZ, yaw: WYAW });
    const bed = .78;
    const q = (lx, lz) => WP([lx, 0, lz]);
    const bx = (lx, ly, lz, bw, bd, bh, c) => { const p = q(lx, lz); w.box({ x: p[0], z: p[2], y: ly, yaw: WYAW, w: bw, d: bd, h: bh, c }); };
    bx(0, bed, 0, 4.6, 2.0, .14, "#7a5a3a");
    bx(0, bed + .14, -.96, 4.6, .08, .42, "#8a6a44"); bx(0, bed + .14, .96, 4.6, .08, .42, "#7a5a3a");
    bx(-2.26, bed + .14, 0, .08, 2.0, .42, "#8a6a44"); bx(2.26, bed + .14, 0, .08, 2.0, .42, "#7a5a3a");
    bx(-1.7, .3, 0, .16, 1.7, bed - .3, "#3a3430"); bx(1.7, .3, 0, .16, 1.7, bed - .3, "#3a3430");
    // wheels in the wagon's side planes, spokes and hubs
    [[-1.6, -1.06], [1.6, -1.06], [-1.6, 1.06], [1.6, 1.06]].forEach(([lx, lz]) => { const R = .46, cyw = .47;
      const ring = (rr, off) => Array.from({ length: 22 }, (_, i) => { const a = i / 22 * Math.PI * 2; return WP([lx + Math.cos(a) * rr, cyw + Math.sin(a) * rr, lz + off]); });
      const dec = [];
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; dec.push({ P: [WP([lx, cyw, lz - .02 * Math.sign(lz)]), WP([lx + Math.cos(a) * R * .86, cyw + Math.sin(a) * R * .86, lz - .02 * Math.sign(lz)])], c: "#8a6a3a", ln: .04, min: .6 }); }
      dec.push({ P: ring(R * .86, -.03 * Math.sign(lz)), c: "#4a3a2a" });
      dec.push({ P: ring(.08, -.04 * Math.sign(lz)), c: "#2a221a" });
      w.add([{ P: ring(R, 0), c: "#26221e", two: true, dec }], { center: WP([lx, cyw, 0]) }); });
    w.line([q(-2.3, 0).map((v, i) => i === 1 ? .5 : v), WP([-4.0, .3, 0])], "#4a3a2a", .08);
    // the load: a heap of pumpkins, higher in the middle
    const heap = [];
    for (let i = 0; i < 70; i++) { const u = rp() * 2 - 1, v = rp() * 2 - 1, hh = (1 - u * u * .7) * (1 - v * v * .5) * .55 * rp();
      heap.push(WP([u * 2.0, bed + .14 + hh, v * .8])); }
    heap.forEach(p => { const sz = .3 + rp() * .18, RAMP = pickPumpkin(); w.sprite({ x: p[0], z: p[2], y: p[1], bias: -1.2, fn: (px, py, k, fog) => pumpkin(px, py, sz * k / 2, fog, RAMP, false) }); });
    // a bale and a sign-less crate leaning on the wheel
    { const p = q(-3.2, -1.4); w.box({ x: p[0], z: p[2], yaw: WYAW + 8, w: 1.0, d: .48, h: .42, c: "#d6bc6a" }); }
  }

  /* ---------- straw bales, mums, a scarecrow and his crow (left) ---------- */
  { const BX = -8.6, BZ = 36, BYAW = 16, { P: BP } = w.frame({ x: BX, z: BZ, yaw: BYAW });
    const bale = (lx, ly, lz) => { const p = BP([lx, 0, lz]); w.box({ x: p[0], z: p[2], y: ly, yaw: BYAW + (rp() - .5) * 6, w: 1.0, d: .5, h: .42, c: "#d4ba68", top: "#e2ca7a", dec: (faces, P) => {
      [0, 1, 3].forEach(fi => { faces[fi].dec = []; for (let y = .07; y < .42; y += .07) faces[fi].dec.push({ P: [P([-.5, y, -.252]), P([.5, y + (rp() - .5) * .03, -.252])], c: "#a88a44", ln: .012, min: .3, op: .6 });
        faces[fi].dec.push({ P: [P([-.25, 0, -.255]), P([-.25, .42, -.255])], c: "#7a6a3a", ln: .015, min: .4 }, { P: [P([.25, 0, -.255]), P([.25, .42, -.255])], c: "#7a6a3a", ln: .015, min: .4 }); }); } }); };
    [-1.6, -.55, .5, 1.55].forEach(lx => bale(lx, 0, 0)); [-1.05, 0, 1.05].forEach(lx => bale(lx, .42, .05)); bale(-.5, .84, .1);
    // things on the bales
    const on = (lx, ly, lz, fn) => { const p = BP([lx, 0, lz]); w.sprite({ x: p[0], z: p[2] - .3, y: ly, bias: -.6, fn }); };
    on(.4, .84, -.05, (px, py, k, fog) => mum(px, py, k, fog, "rust"));
    on(-1.45, .42, -.15, (px, py, k, fog) => mum(px, py, k, fog, "gold"));
    on(1.05, .84, -.05, (px, py, k, fog) => pumpkin(px, py, .2 * k, fog, ORG, true));
    on(-.55, 1.26, 0, (px, py, k, fog) => pumpkin(px, py, .24 * k, fog, ORG, true));
    on(-2.3, 0, -.6, (px, py, k, fog) => mum(px, py, k, fog, "plum"));
    on(2.2, 0, -.7, (px, py, k, fog) => pumpkin(px, py, .3 * k, fog, RED, false));
    on(1.4, 0, -.9, (px, py, k, fog) => pumpkin(px, py, .2 * k, fog, WHT, false));
    // the scarecrow on his post behind the bales: burlap head, straw hat, plaid shirt, straw hands
    const p = BP([2.6, 0, .9]);
    w.sprite({ x: p[0], z: p[2], y: 0, fn: (px, py, k, fog) => {
      const C = c => fogC(c, fog), m = v => v * k; let g = "";
      g += `<rect x="${F(px - m(.05))}" y="${F(py - m(2.15))}" width="${F(m(.1))}" height="${F(m(2.15))}" fill="${C("#5a4834")}"/><rect x="${F(px)}" y="${F(py - m(2.15))}" width="${F(m(.05))}" height="${F(m(2.15))}" fill="${C("#3a2e22")}"/>`;
      g += `<rect x="${F(px - m(.85))}" y="${F(py - m(1.72))}" width="${F(m(1.7))}" height="${F(m(.07))}" fill="${C("#5a4834")}"/>`;
      // trousers (denim) and straw at the cuffs
      g += `<path d="M${F(px - m(.22))},${F(py - m(1.02))} L${F(px + m(.22))},${F(py - m(1.02))} L${F(px + m(.2))},${F(py - m(.42))} L${F(px + m(.03))},${F(py - m(.42))} L${F(px)},${F(py - m(.8))} L${F(px - m(.03))},${F(py - m(.42))} L${F(px - m(.2))},${F(py - m(.42))}Z" fill="${C("#4a5a7a")}"/><path d="M${F(px + m(.02))},${F(py - m(1.02))} L${F(px + m(.22))},${F(py - m(1.02))} L${F(px + m(.2))},${F(py - m(.42))} L${F(px + m(.03))},${F(py - m(.42))}Z" fill="${C("#34405a")}"/>`;
      for (let i = 0; i < 14; i++) { const sx0 = px + (i < 7 ? -m(.11) : m(.11)) + (rp() - .5) * m(.12); g += `<path d="M${F(sx0)},${F(py - m(.44))} l${F((rp() - .5) * m(.1))},${F(m(.1 + rp() * .08))}" stroke="${C("#e2c470")}" stroke-width="${F(Math.max(.6, m(.012)))}"/>`; }
      // plaid shirt with sleeves along the crossbar
      const shirt = `M${F(px - m(.26))},${F(py - m(1.78))} L${F(px + m(.26))},${F(py - m(1.78))} L${F(px + m(.24))},${F(py - m(.98))} L${F(px - m(.24))},${F(py - m(.98))}Z M${F(px - m(.8))},${F(py - m(1.8))} L${F(px - m(.24))},${F(py - m(1.82))} L${F(px - m(.24))},${F(py - m(1.6))} L${F(px - m(.8))},${F(py - m(1.62))}Z M${F(px + m(.24))},${F(py - m(1.82))} L${F(px + m(.8))},${F(py - m(1.8))} L${F(px + m(.8))},${F(py - m(1.62))} L${F(px + m(.24))},${F(py - m(1.6))}Z`;
      g += `<path d="${shirt}" fill="${C("#b8321e")}"/>`;
      for (let i = -3; i <= 3; i++) g += `<path d="M${F(px + i * m(.11))},${F(py - m(1.8))} L${F(px + i * m(.11))},${F(py - m(.99))}" stroke="${C("#3a1810")}" stroke-width="${F(Math.max(.5, m(.025)))}" opacity=".55"/>`;
      for (let i = 0; i < 7; i++) g += `<path d="M${F(px - m(.8))},${F(py - m(1.76 - i * .12))} L${F(px + m(.8))},${F(py - m(1.76 - i * .12))}" stroke="${C("#3a1810")}" stroke-width="${F(Math.max(.5, m(.022)))}" opacity="${i < 2 ? .55 : .45}" clip-path="none"/>`;
      g += `<path d="M${F(px + m(.02))},${F(py - m(1.78))} L${F(px + m(.26))},${F(py - m(1.78))} L${F(px + m(.24))},${F(py - m(.98))} L${F(px + m(.02))},${F(py - m(.98))}Z M${F(px + m(.24))},${F(py - m(1.71))} L${F(px + m(.8))},${F(py - m(1.7))} L${F(px + m(.8))},${F(py - m(1.62))} L${F(px + m(.24))},${F(py - m(1.6))}Z" fill="#000" opacity=".22"/>`;
      [-1, 1].forEach(sd => { for (let i = 0; i < 7; i++) g += `<path d="M${F(px + sd * m(.8))},${F(py - m(1.71))} l${F(sd * m(.08 + rp() * .1))},${F((rp() - .5) * m(.16))}" stroke="${C("#e2c470")}" stroke-width="${F(Math.max(.6, m(.014)))}"/>`; });
      // burlap head, stitched face, straw hat
      g += `<ellipse cx="${F(px)}" cy="${F(py - m(1.98))}" rx="${F(m(.17))}" ry="${F(m(.2))}" fill="${C("#c8aa78")}"/><ellipse cx="${F(px + m(.06))}" cy="${F(py - m(1.96))}" rx="${F(m(.1))}" ry="${F(m(.17))}" fill="${C("#a88a5a")}" opacity=".7"/>`;
      g += `<circle cx="${F(px - m(.07))}" cy="${F(py - m(2.02))}" r="${F(m(.025))}" fill="${C("#2a1e14")}"/><circle cx="${F(px + m(.06))}" cy="${F(py - m(2.02))}" r="${F(m(.025))}" fill="${C("#2a1e14")}"/><path d="M${F(px - m(.08))},${F(py - m(1.91))} q${F(m(.08))},${F(m(.05))} ${F(m(.16))},0" stroke="${C("#2a1e14")}" stroke-width="${F(Math.max(.6, m(.014)))}" fill="none"/>`;
      g += `<ellipse cx="${F(px)}" cy="${F(py - m(2.15))}" rx="${F(m(.36))}" ry="${F(m(.06))}" fill="${C("#d8b866")}"/><path d="M${F(px - m(.16))},${F(py - m(2.15))} Q${F(px - m(.15))},${F(py - m(2.36))} ${F(px)},${F(py - m(2.37))} Q${F(px + m(.15))},${F(py - m(2.36))} ${F(px + m(.16))},${F(py - m(2.15))}Z" fill="${C("#e6cc80")}"/><path d="M${F(px)},${F(py - m(2.37))} Q${F(px + m(.15))},${F(py - m(2.36))} ${F(px + m(.16))},${F(py - m(2.15))} L${F(px)},${F(py - m(2.15))}Z" fill="${C("#b8984e")}"/><rect x="${F(px - m(.16))}" y="${F(py - m(2.2))}" width="${F(m(.32))}" height="${F(m(.04))}" fill="${C("#8a2a1a")}"/>`;
      // a crow on his right arm
      const bx0 = px + m(.62), by0 = py - m(1.8);
      g += `<path d="M${F(bx0 - m(.14))},${F(by0)} q${F(m(.06))},${F(-m(.14))} ${F(m(.2))},${F(-m(.12))} l${F(m(.07))},${F(-m(.02))} l${F(-m(.04))},${F(m(.05))} q${F(m(.02))},${F(m(.08))} ${F(-m(.06))},${F(m(.1))} l${F(-m(.08))},${F(m(.04))}Z" fill="${C("#141418")}"/><path d="M${F(bx0 - m(.02))},${F(by0)} l0,${F(m(.04))} M${F(bx0 + m(.03))},${F(by0)} l0,${F(m(.04))}" stroke="${C("#141418")}" stroke-width="${F(Math.max(.5, m(.01)))}"/>`;
      return g; } });
  }

  /* ---------- tufts of verge grass and gravel pebbles ---------- */
  for (let k = 0, n = 0; k < 9000 && n < 3600; k++) {
    const z = 19 + Math.pow(r(), .9) * 34, x = (r() - .5) * 1.4 * z;
    if (LOT(x, z) && r() < .92) continue;
    n++; const lot = LOT(x, z), len = lot ? .05 : .12 + r() * .14, hue = z > 48 ? 1 : 0;
    w.sprite({ x, z, y: 0, bias: .05, fn: (px, py, k2) => { const L = len * k2, Cs = hue ? ["#b8a660", "#9a9a4a", "#c8b46a"] : ["#7e9a46", "#a2a656", "#6a8a3c", "#b4ae62"]; let g = "";
      for (let b = 0; b < 4; b++) { const bend = (r() - .5) * L * .8, lit = bend < 0;
        g += `<path d="M${F(px + (r() - .5) * L * .6)},${F(py)} q${F(bend * .3)},${F(-L * .55)} ${F(bend)},${F(-L)}" stroke="${T(mix(Cs[Math.floor(r() * Cs.length)], lit ? RIM : SHADE, lit ? .2 : .15))}" stroke-width="${F(Math.max(.7, L * .08))}" fill="none" stroke-linecap="round"/>`; }
      return g; } }); }

  /* ---------------- assemble ---------------- */
  const isFar = o => o === far, isNear = o => o === near, isFarObj = o => !o.raster && o.tag === "far", isMid = o => !o.raster && o.tag === "mid", rest = o => !o.raster && o.tag !== "far" && o.tag !== "mid";
  s += `<rect x="0" y="${WY - 2}" width="${W}" height="${H - WY + 2}" fill="${T("#b8ac80")}"/>`;
  s += w.draw({ where: isFar });
  s += `<rect x="0" y="${WY - 60}" width="${W}" height="80" fill="url(#psHaze)" opacity=".5"/>`;
  s += w.draw({ where: isNear });
  s += w.draw({ where: isFarObj });
  if (!NIGHT) s += `<rect x="0" y="${WY - 30}" width="${W}" height="60" fill="url(#psHaze)" opacity=".28"/>`;   // heat haze over the fields
  s += w.draw({ where: isMid });
  s += w.draw({ where: rest });
  if (NIGHT) {
    // the stand's own light: the bulb string and a lantern under the ridge wash the goods and the gravel
    const c0 = w.proj(at(0, 1.6, -.6)), c1 = w.proj(at(0, .1, -3.6)), k0 = FL / SZ;
    s += `<g style="mix-blend-mode:screen"><ellipse cx="${F(c0[0])}" cy="${F(c0[1])}" rx="${F(k0 * 4.6)}" ry="${F(k0 * 1.9)}" fill="url(#psWarm)"/><ellipse cx="${F(c1[0])}" cy="${F(c1[1])}" rx="${F(k0 * 6)}" ry="${F(k0 * 1.1)}" fill="url(#psWarm)" opacity=".8"/></g>`;
    const l = w.proj(at(0, 2.75, -.4));
    s += `<circle cx="${F(l[0])}" cy="${F(l[1])}" r="${F(k0 * .9)}" fill="url(#psGlow)"/><rect x="${F(l[0] - k0 * .09)}" y="${F(l[1] - k0 * .14)}" width="${F(k0 * .18)}" height="${F(k0 * .26)}" rx="${F(k0 * .03)}" fill="#ffe2a0"/>`;
    // the farm's yard light on a pole by the bins
    const y = w.proj([-46, 9, 246]);
    s += `<circle cx="${F(y[0])}" cy="${F(y[1])}" r="40" fill="url(#psGlow)" opacity=".8"/><circle cx="${F(y[0])}" cy="${F(y[1])}" r="2.2" fill="#f4f0ff"/>`;
  }
  // tall grass and asters at the bottom corners, under the cards
  const tuft = (x0, x1) => { let g = "";
    for (let i = 0; i < 90; i++) { const x = x0 + r() * (x1 - x0), y = 700 + r() * 30, hh = 50 + r() * 90, bend = (r() - .5) * 36;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#8a8a3a" : "#b0a052")}" stroke-width="${F(1.6 + r() * 2)}" fill="none" stroke-linecap="round"/>`;
      if (r() < .18) g += `<circle cx="${F(x + bend)}" cy="${F(y - hh)}" r="${F(3 + r() * 2)}" fill="${T(r() < .6 ? "#9a8ac8" : "#f0e6c0")}"/>`; }
    return g; };
  s += tuft(0, 300) + tuft(2280, 2560);

  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#psLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#psPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
