/* Grovers Mill, New Jersey, on Halloween eve: the "landing site" of Orson
   Welles' War of the Worlds broadcast (CBS radio, Oct 30, 1938, 8 PM). Standing
   at the edge of a harvested cornfield: the old wooden water tower that
   legend says frightened locals shot at, thinking it a Martian machine, rises
   behind a white farmhouse, its stave tank and cone roof on a braced timber
   trestle. To the right a dull metal cylinder lies half-buried in a fresh
   crater, its lid a little unscrewed and steam curling off it. The gristmill
   stands across the yard on the left, corn shocks in the stubble, a wire
   fence, yard trees in late-October colour, woods along the flat horizon.
   Low late sun off the right edge throws the tower's long shadow across the
   yard toward the viewer.
   opts.time === "night": the 74% waning gibbous moon low on the left (it rose
   at 10:24 PM that night), stars, lit farmhouse and mill windows, a porch
   lamp, and a green glow from the crater and the lid's open seam.
   Ground is one world3d() raster (reference/scene-helpers.js); the tower,
   buildings, cylinder and trees are placed in metres by the same camera.
   Same shape as reference/autumn-valley.js. Needs rng(), mix(), world3d(),
   noise2(), hexRGB() and rgbTone() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                     */
function groversMillMartiansArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1938;
  const r = rng(seed), rs = rng(seed + 5), rp = rng(seed + 29), rq = rng(seed + 41);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 2760, LY = 250, WY = 446;
  const T = c => NIGHT ? mix(mix(c, "#6a7290", .42), "#060a22", .68) : c;
  const HZ = NIGHT ? "#262e4c" : "#eadcc4", RIM = NIGHT ? "#a8b4e0" : "#fff0c8", SHADE = NIGHT ? "#04060e" : "#3a3048", LAMP = "#ffc66c", GREEN = "#9dffb4";
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

  /* ---------------- sky: clear late-October afternoon, or a moonrise night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#03061a"/><stop offset=".5" stop-color="#0a1232"/><stop offset=".86" stop-color="#1e2650"/><stop offset="1" stop-color="${HZ}"/>`
    : `<stop offset="0" stop-color="#3c6eb0"/><stop offset=".45" stop-color="#7ea6cc"/><stop offset=".82" stop-color="#cfd6d4"/><stop offset="1" stop-color="#f0dcb6"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#d8dcff" stop-opacity=".2"/><stop offset=".35" stop-color="#9aa6d8" stop-opacity=".06"/><stop offset="1" stop-color="#9aa6d8" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d8" stop-opacity="1"/><stop offset=".16" stop-color="#ffe6b0" stop-opacity=".55"/><stop offset=".5" stop-color="#ffd896" stop-opacity=".16"/><stop offset="1" stop-color="#ffd896" stop-opacity="0"/>`;
  const MX = 690, MY = 318, MR = 15;
  let s = `<defs id="gmdefs">
    <linearGradient id="gmSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="gmLight" cx="${NIGHT ? MX : LX}" cy="${NIGHT ? MY : LY}" r="${NIGHT ? 700 : 1900}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="gmHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".85"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="gmGlow"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".4"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="gmMoonG"><stop offset="0" stop-color="#eef0ff" stop-opacity=".5"/><stop offset=".3" stop-color="#c8d0f0" stop-opacity=".12"/><stop offset="1" stop-color="#c8d0f0" stop-opacity="0"/></radialGradient>
    <radialGradient id="gmGreen"><stop offset="0" stop-color="${GREEN}" stop-opacity=".75"/><stop offset=".35" stop-color="#5cf08a" stop-opacity=".24"/><stop offset="1" stop-color="#5cf08a" stop-opacity="0"/></radialGradient>
    <filter id="gmLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="19" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="gmClod" x="-10%" y="-20%" width="120%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="gmCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".013" numOctaves="3" seed="37" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="gmCirrus" x="-10%" y="-60%" width="120%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".004 .05" numOctaves="3" seed="29" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="3"/></filter>
    <filter id="gmSteam" x="-50%" y="-50%" width="200%" height="200%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="7"/></filter>
    <filter id="gmPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="13"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="gmSoft"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#gmSky)"/>`;
  if (NIGHT) {
    s += `<rect width="${W}" height="${H}" fill="url(#gmLight)"/>`;
    for (let i = 0; i < 950; i++) { const x = rs() * W, y = Math.pow(rs(), 1.25) * 420, big = rs() < .06, dm = Math.hypot(x - MX, y - MY) < 180 ? .35 : 1;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.8 : F(.5 + rs() * .7)}" fill="${rs() < .16 ? "#ffe8c8" : "#e6ecff"}" opacity="${F((.25 + rs() * .6) * (1 - y / 470) * dm)}"/>`; }
    // waning gibbous, 74% lit: the dark limb on the right
    s += `<circle cx="${MX}" cy="${MY}" r="${MR * 9}" fill="url(#gmMoonG)"/>
      <circle cx="${MX}" cy="${MY}" r="${MR}" fill="#3a4064" opacity=".6"/>
      <path d="M${MX},${MY - MR} A${MR},${MR} 0 0 0 ${MX},${MY + MR} A${MR * .48},${MR} 0 0 0 ${MX},${MY - MR}Z" fill="#f2ecd8" transform="rotate(-24 ${MX} ${MY})"/>
      <circle cx="${MX - 5}" cy="${MY - 3}" r="3.2" fill="#c8c0b0" opacity=".5"/><circle cx="${MX - 8}" cy="${MY + 5}" r="2.2" fill="#c8c0b0" opacity=".45"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#gmLight)"/>`;
    s += `<g class="rays" opacity=".07" filter="url(#gmSoft)">`;
    for (let k = 0; k < 6; k++) { const a = Math.PI - .1 - k * .085, L = 2400;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: high streaks, a few low fair-weather heaps ---------------- */
  s += `<g class="drift1" filter="url(#gmCirrus)">`;
  for (let i = 0; i < 14; i++) { const x = 150 + rs() * 2250, y = 60 + rs() * 170, L = 300 + rs() * 520, b = (rs() - .5) * 36;
    s += `<path d="M${F(x)},${F(y)} q${F(L * .5)},${F(b - 16)} ${F(L)},${F(b)}" stroke="${NIGHT ? "#232a56" : "#ffffff"}" stroke-width="${F(4 + rs() * 11)}" fill="none" stroke-linecap="round" opacity="${F(NIGHT ? .3 : .22 + rs() * .26)}"/>`; }
  s += `</g>`;
  const cumulus = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#gmCloudy)">`;
    const n = 5 + Math.floor(rs() * 3), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.12 + rs() * .09) * (1 - Math.abs(t - .5) * .9);
      lobes.push([x + (t - .5) * w, y - R * (.35 + rs() * .45), R]); }
    if (NIGHT) {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .66)}" fill="#1a2046"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .3)}" cy="${F(ly - R * .25)}" rx="${F(R * .5)}" ry="${F(R * .3)}" fill="#3a4478" opacity=".5"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#c8c0c4"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .15)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.05)}" ry="${F(R * .72)}" fill="#d8d2d2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .05)}" cy="${F(ly)}" rx="${F(R * .95)}" ry="${F(R * .68)}" fill="#f4eee4"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .35)}" cy="${F(ly - R * .25)}" rx="${F(R * .5)}" ry="${F(R * .36)}" fill="#fff8e8"/>`);
    }
    return c + `</g></g>`;
  };
  s += `<g opacity="${NIGHT ? .75 : .9}">` + cumulus(300, 362, 210, "drift2") + cumulus(1120, 330, 180, "drift3") + cumulus(1720, 352, 230, "drift2") + cumulus(2380, 346, 200, "drift3") + `</g>`;
  if (!NIGHT) {   // crows heading for the woods
    s += `<g class="birds" fill="none" stroke="#1e1c22" stroke-width="2.4" stroke-linecap="round" opacity=".85">`;
    [[1560, 300, 1], [1596, 284, .85], [1628, 306, .9], [1668, 292, .7], [1530, 318, .75]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 11 * k)},${F(y - 2)} q${F(5 * k)},${F(-7 * k)} ${F(11 * k)},${F(2)} q${F(5 * k)},${F(-7 * k)} ${F(11 * k)},${F(-2)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 1.7 m above the cornfield; x right, y up, z away. The field runs to a wire
     fence at z 74, then the farmyard (house, tower, crib), the mill across the yard,
     fields, and woods from about z 450 out. */
  const EYE = 1.7, FL = 2100;
  const LV = [.8, .45, .25];
  const w = world3d({ h: EYE, hy: WY, f: FL, light: LV, tone: T, fog: HZ, fogK: .0007,
    shadow: SHADE, rim: RIM, shade: .52, hi: .32, night: NIGHT, lamp: LAMP });
  const N1 = noise2(seed), N2 = noise2(seed + 3), N3 = noise2(seed + 9);
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const capY = px => 268 - 150 * sm((px - 820) / 160) * sm((1600 - px) / 160);
  const hG = (x, z) => .08 + .06 * (N1(x / 40, z / 40) + 1) * sm(z / 30);
  const CRX = 21, CRZ = 63;                                  // the crater

  const H3 = hexRGB, L3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const toHex = c => "#" + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const STUB = H3("#c0a06a"), STUB2 = H3("#8e7248"), LAWN = H3("#7e8a44"), LAWN2 = H3("#9aa252"), DIRT = H3("#9a8462"), DIRT2 = H3("#7a6448"),
        WHEAT = H3("#7c9a44"), PLOW = H3("#6e5440"), SOY = H3("#b09060"), SOIL = H3("#5e4634"), SCORCH = H3("#2e2620"), FAR = H3("#8e8c5a");
  const hash = (a, b) => { const q = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return q - Math.floor(q); };
  const laneX = z => -6.5 - 6 * sm(z / 70) + .8 * Math.sin(z / 9);
  const YARD = (x, z) => z > 75 && z < 165 && x > -46 + 6 * N2(z / 20, 1) && x < 40 + 8 * N2(z / 25, 4) || (z > 150 && z < 215 && x > -88 && x < -38);
  const col = (x, y, z, n) => {
    const tex = 1 / (1 + z / 40);
    let c;
    const lx = laneX(z), dl = Math.abs(x - lx);
    if (z < 76 && dl < 1.7) {                                                   // the farm lane: two ruts and a grass crown
      c = L3(DIRT, DIRT2, .4 + .5 * N3(x / .6, z / .6) * tex);
      if (dl < .35) c = L3(c, LAWN, .7); }
    else if (z < 74) {                                                          // corn stubble, rows running away
      const row = Math.sin(x * Math.PI * 2 / .76) * sm(1 - z / 90) * .55;
      c = L3(STUB, STUB2, .45 + row + .45 * N3(x / 3, z / 3) * tex + .25 * N2(x / 25, z / 25)); }
    else if (YARD(x, z)) c = L3(LAWN, LAWN2, .5 + .5 * N2(x / 12, z / 12) + .3 * N3(x / 2, z / 2) * tex);
    else if (z < 74.8) c = L3(LAWN, STUB2, .5);
    else if (z < 2600) {                                                        // the patchwork of farms
      const cell = hash(Math.floor((x + 4000) / 160), Math.floor(z / 120));
      c = cell < .3 ? SOY : cell < .52 ? WHEAT : cell < .7 ? PLOW : cell < .86 ? STUB : LAWN2;
      c = L3(c, STUB2, .15 + .3 * (N2(x / 60, z / 60) * .5 + .5)); }
    else c = L3(FAR, WHEAT, .5 + .5 * N2(x / 300, z / 300));
    // the crater: scorched floor, turned soil around it, singed stubble fanning out
    const dc = Math.hypot(x - CRX, (z - CRZ) * 1.0);
    if (dc < 18) { const t = sm((18 - dc) / 9); c = L3(c, SOIL, t * .85);
      if (dc < 7.5) c = L3(SOIL, SCORCH, sm((7.5 - dc) / 3) + .3 * N3(x / 1.3, z / 1.3)); }
    return c; };
  const ground = w.raster({ z0: 3, z1: 9000, step: .0012, minStep: .05, scale: .75, top: 300, bottom: H, h: hG, col, tone: rgbTone(T), fog: HZ, fogK: .0004, amb: NIGHT ? .5 : .55, noRefl: true, key: 1e7 });

  /* ---------- painterly pieces ---------- */
  const fogC = (c, fog) => T(mix(c, HZ, fog));
  const ORG = ["#5a200a", "#86300c", "#ac4410", "#cc5a16", "#e2731e", "#f08e2e", "#f8ac52", "#fcca86"];
  const pumpkin = (px, py, R, fog, RAMP, jack) => {
    const ry = R * (.72 + rp() * .14), cy = py - ry, C = i => fogC(RAMP[Math.max(0, Math.min(7, i))], fog);
    let g = `<ellipse cx="${F(px - R * .3)}" cy="${F(py)}" rx="${F(R * 1.2)}" ry="${F(Math.max(.8, R * .2))}" fill="#000" opacity=".22"/>`;
    if (R < 2.2) return g + `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(4)}"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(2)}"/>`;
    for (let i = 0; i < 3; i++) { const u = (i + .5) / 3 * 2 - 1;
      g += `<ellipse cx="${F(px + u * R * .62)}" cy="${F(cy)}" rx="${F(R * (1 - Math.abs(u) * .55) / 3 * 1.25)}" ry="${F(ry * .95)}" fill="${C(u > .3 ? 6 : u > -.2 ? 5 : 3)}"/>`; }
    g += `<path d="M${F(px - R * .06)},${F(cy - ry * .9)} l${F(R * .1)},${F(-R * .3)} l${F(R * .08)},${F(R * .05)}Z" fill="${fogC("#4a5426", fog)}"/>`;
    if (jack && NIGHT) g += `<path d="M${F(px - R * .5)},${F(cy - ry * .1)} l${F(R * .18)},${F(-R * .26)} l${F(R * .18)},${F(R * .26)}Z M${F(px + R * .14)},${F(cy - ry * .1)} l${F(R * .18)},${F(-R * .26)} l${F(R * .18)},${F(R * .26)}Z M${F(px - R * .5)},${F(cy + ry * .2)} q${F(R * .5)},${F(ry * .45)} ${F(R)},0Z" fill="#ffd070"/><circle cx="${F(px)}" cy="${F(cy)}" r="${F(R * 4)}" fill="url(#gmGlow)" opacity=".5"/>`;
    return g; };
  /* a corn shock: stalks stood up in a teepee and tied; lit from the right */
  const shock = (px, py, hp, fog) => {
    const bw = hp * .55, ty = py - hp * .62; let g = `<ellipse cx="${F(px - hp * .35)}" cy="${F(py)}" rx="${F(bw * .9)}" ry="${F(Math.max(1, hp * .05))}" fill="#000" opacity=".2"/>`;
    const C = ["#5a4626", "#7a6234", "#9a7e44", "#b89a58", "#d2b672", "#e6cc8c"].map(c => fogC(c, fog));
    const n = Math.max(8, Math.min(90, Math.round(hp * 1.2)));
    for (let i = 0; i < n; i++) { const u = i / (n - 1), bx = px + (u - .5) * bw, tx = px + (u - .5) * bw * .12, lit = cl(u + (rp() - .5) * .4);
      g += `<path d="M${F(bx)},${F(py)} Q${F((bx + tx) / 2)},${F((py + ty) / 2)} ${F(tx)},${F(ty)}" stroke="${C[Math.floor(lit * 5)]}" stroke-width="${F(Math.max(.7, hp * .025))}" fill="none"/>`; }
    for (let i = 0; i < n * .8; i++) { const u = rp(), a = (u - .5) * 1.4 - Math.PI / 2, L = hp * (.25 + rp() * .18), lit = cl(u + (rp() - .5) * .3);
      g += `<path d="M${F(px + (u - .5) * bw * .1)},${F(ty)} q${F(Math.cos(a) * L * .6)},${F(Math.sin(a) * L * .7)} ${F(Math.cos(a) * L)},${F(Math.sin(a) * L * .55 + L * .25)}" stroke="${C[Math.floor(lit * 5)]}" stroke-width="${F(Math.max(.6, hp * .02))}" fill="none"/>`; }
    for (let i = 0; i < n * .4; i++) { const u = rp(), y = py - rp() * hp * .5, x = px + (u - .5) * bw * (1 - (py - y) / hp * .8), L = hp * (.12 + rp() * .12), dir = u < .5 ? -1 : 1;
      g += `<path d="M${F(x)},${F(y)} q${F(dir * L * .5)},${F(-L * .2)} ${F(dir * L)},${F(L * .35)}" stroke="${C[u < .5 ? 2 : 4]}" stroke-width="${F(Math.max(.6, hp * .018))}" fill="none"/>`; }
    g += `<path d="M${F(px - bw * .07)},${F(ty + hp * .02)} L${F(px + bw * .07)},${F(ty + hp * .02)}" stroke="${fogC("#6a4a2a", fog)}" stroke-width="${F(Math.max(.8, hp * .03))}"/>`;
    return g; };

  /* ---------- trees: many lit leaf clumps, light from the right ---------- */
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const GOLD = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const OAK = ["#2a2214", "#3e3018", "#56401e", "#6e5224", "#86662e", "#9c7c3c", "#b49652", "#ccb474"];
  const GUM = ["#2a0e1a", "#441424", "#62202e", "#82303a", "#a04442", "#b8604e", "#cc8462", "#e0aa80"];
  const GRN = ["#1e2614", "#2a361a", "#3a4a20", "#4c5e28", "#627232", "#7a883e", "#949e52", "#b0b46e"];
  const broadleaf = (x, y, hp, RAMP, fog, n) => {
    const Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .03), ty = y - hp * .3;
    g += `<ellipse cx="${F(x - hp * .45)}" cy="${F(y + 1)}" rx="${F(hp * .55)}" ry="${F(Math.max(1, hp * .035))}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .5)},${F(ty)} L${F(x + tb * .5)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#5a4c40")}"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .5)},${F(ty)} L${F(x - tb * .05)},${F(ty)} L${F(x - tb * .1)},${F(y)}Z" fill="${Tf("#30261e")}"/>`;
    const cx = x, cy = y - hp * .58, rx = hp * .42, ry = hp * .38, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, cs = [];
    const nL = 3 + Math.floor(r() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (r() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + r() * .2), cy + Math.sin(a) * ry * (.4 + r() * .25) + ry * .15, rx * (.42 + r() * .2), ry * (.42 + r() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx * 1.2, py = cy + (r() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && r() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (r() - .5) * .32), hp * (.016 + r() * .018)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx - a * .08, ly + b * .12, a * .85, b * .8, 8)}" fill="${Tf(RAMP[1])}"/>`).join("");
    // a few limbs showing through the thinning crown
    for (let k = 0; k < 4; k++) { const a = -Math.PI / 2 + (r() - .5) * 2, L = hp * (.28 + r() * .14);
      cg += `<path d="M${F(x)},${F(ty)} q${F(Math.cos(a) * L * .3)},${F(-L * .5)} ${F(Math.cos(a) * L)},${F(Math.sin(a) * L * .9)}" stroke="${Tf("#3a2e26")}" stroke-width="${F(Math.max(1, tb * .5))}" fill="none"/>`; }
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#gmLeafy)">${cg}</g>`; };
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1a140c", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(48, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) + (y - sz * .5 - py) * .6, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    if (sz > 14) g += `<path d="M${F(x)},${F(y)} L${F(x)},${F(y - sz * .2)}" stroke="${mix(c, "#000000", .55)}" stroke-width="${F(Math.max(1, sz * .05))}"/>`;
    return g; };
  const pickRamp = q => q < .24 ? MAPLE : q < .44 ? GOLD : q < .64 ? RUST : q < .82 ? OAK : q < .92 ? GUM : GRN;
  const treeFn = (hM, RAMP) => (px, py, kk, fog) => { const hp = hM * kk;
    return hp > 60 ? broadleaf(px, py, hp, RAMP, fog, Math.min(900, Math.round(hp * hp * .012 + 20)))
      : hp > 26 ? `<g filter="url(#gmLeafy)">${clump(px, py, hp, fog * .9, RAMP)}</g>` : clump(px, py, Math.max(2.5, hp), fog * .9, RAMP); };
  const room = (x, z, y0) => (sy(y0, z) - capY(sx(x, z))) * z / FL;
  const plant = (x, z, hM, tag, RAMP) => { const y0 = hG(x, z), u = sx(x, z); if (u < -140 || u > W + 140) return;
    const rm = room(x, z, y0); if (rm < hM * .7) return; const h = Math.min(hM, rm);
    w.sprite({ x, z, y: y0 - .2, tag, fn: treeFn(h, RAMP || pickRamp(r())) });
    if (tag === "yard") return;
    const ub = h * (.26 + r() * .14), UR = r() < .5 ? OAK : RUST;
    w.sprite({ x: x + (r() - .5) * 3, z: z - .8, y: y0 - .2, tag, fn: (px, py, kk, fog) => clump(px, py, Math.max(2, ub * kk), Math.min(1, fog * .9 + .06), UR) }); };
  // distant tree lines (blue in the haze), the woods along the horizon with gaps, hedgerows between fields
  for (let i = 0; i < 900; i++) { const z = 1800 + r() * 2600, x = (r() - .5) * 1.5 * z; if (N3(x / 500, z / 500) > -.25) plant(x, z, 16 + r() * 8, "dist"); }
  const lot = (x, z) => N2(x / 260 + 4.1, z / 260) > -.15 + .1 * Math.sin(x / 70);
  for (let i = 0; i < 1500; i++) { const z = 520 + Math.pow(r(), .8) * 800, x = (r() - .5) * 1.45 * z; if (lot(x, z)) plant(x, z, 14 + r() * 10, "far"); }
  for (let i = 0; i < 160; i++) { const x = -260 + r() * 520; if (Math.sin(x / 31) > .1) plant(x, 300 + r() * 14, 9 + r() * 8, "far"); }
  // yard trees around the farm, hand-placed so the tank stays clear against the sky
  [[-36, 112, 16, MAPLE], [-27, 132, 17, OAK], [-7, 136, 18, RUST], [14, 146, 17, GOLD], [29, 124, 15, MAPLE], [44, 152, 16, OAK],
   [-50, 146, 14, GOLD], [-72, 212, 15, RUST], [-50, 222, 16, GUM], [62, 196, 15, GOLD], [82, 176, 13, GUM], [-94, 168, 14, OAK],
   [-20, 175, 16, GRN], [36, 205, 17, RUST], [-112, 230, 15, MAPLE]].forEach(([x, z, h, R]) => plant(x, z, h, "yard", R));

  /* ---------- the farm: house, mill, shed, corn crib, fence ---------- */
  { const hr = rng(seed + 61);
    w.house({ x: -12, z: 80, y: hG(-12, 80), yaw: 14, w: 9, d: 7.4, h: 6.0, rh: 3.6, roof3: "gable", gable: false, wall: "#f0eadc", roof: "#3e3a3a", trim: "#f6f2e8",
      shut: "#2a3a32", porch: true, chim: .22, winGap: 2.3, doorC: "#5a1e1a", rng: hr });
    w.house({ x: -24, z: 102, y: hG(-24, 102), yaw: 8, w: 5.2, d: 6, h: 3.0, rh: 1.1, roof3: "shed", wall: "#8a7a66", roof: "#5a4a40", trim: "#d8ccb8", door: .3, doorC: "#4a3a2e", clap: true, winGap: 9, rng: hr });
    // Grover's Mill: a tall front-gabled clapboard gristmill with a lean-to
    w.house({ x: -64, z: 186, y: hG(-64, 186), yaw: 26, w: 10, d: 14, h: 9.2, rh: 4.6, roof3: "gable", gable: true, wall: "#d6d0c2", roof: "#4a4644", trim: "#ece6d8", winGap: 2.4, door: .5, doorC: "#4a3a30", rng: hr });
    w.house({ x: -55.5, z: 182, y: hG(-56, 182), yaw: 26, w: 5, d: 8, h: 4.2, rh: 1.4, roof3: "shed", wall: "#c8c0b0", roof: "#4a4644", trim: "#ece6d8", door: false, winGap: 3, rng: hr });
    // a slatted corn crib beside the tower
    w.box({ x: 17, z: 112, y: hG(17, 112), yaw: -12, w: 7, d: 2.6, h: 3.4, c: "#9a8264", dec: (faces, P) => {
      faces[0].dec = []; faces[3].dec = [];
      for (let y = .25; y < 3.4; y += .22) { faces[0].dec.push({ P: [P([-3.5, y, -1.32]), P([3.5, y, -1.32])], c: "#5a4a38", ln: .05, min: .4, op: .7 });
        faces[3].dec.push({ P: [P([-3.52, y, 1.3]), P([-3.52, y, -1.3])], c: "#5a4a38", ln: .05, min: .4, op: .7 }); }
      faces[0].dec.push({ P: [P([-1.2, .4, -1.33]), P([1.2, .4, -1.33]), P([1.2, 2.9, -1.33]), P([-1.2, 2.9, -1.33])], c: "#c8a040", op: .55 }); } });
    w.house({ x: 17, z: 112.2, y: hG(17, 112) + 3.4, yaw: -12, w: 7.6, d: 3.2, h: .05, rh: 1.1, roof3: "gable", wall: "#9a8264", roof: "#6e4a3a", door: false, clap: false, ao: false, rng: hr });
    // pumpkins on the porch steps (lit as jack-o'-lanterns at night)
    const { P: HP } = w.frame({ x: -12, z: 80, y: hG(-12, 80), yaw: 14 });
    [[-1.6, -6.3, .5], [-1.0, -6.4, .38], [1.5, -6.3, .46], [2.1, -6.35, .34]].forEach(([lx, lz, sz], i) => { const p = HP([lx, 0, lz]);
      w.sprite({ x: p[0], z: p[2], y: p[1] + (i % 2 ? 0 : .45), bias: -3, fn: (px, py, k, fog) => pumpkin(px, py, sz * k / 2, fog, ORG, i === 0 || i === 2) }); });
  }
  // a post-and-wire fence between the field and the yard, a gate at the lane
  { const FZ = 74.5, xs = [];
    for (let x = -60; x <= 52; x += 3.4) if (Math.abs(x - laneX(FZ)) > 2.2) xs.push(x);
    xs.forEach(x => w.box({ x, z: FZ + .3 * Math.sin(x / 7), y: hG(x, FZ), yaw: r() * 30, w: .13, d: .13, h: 1.2 + r() * .1, c: "#7a6a58" }));
    for (let i = 0; i < xs.length - 1; i++) { const x0 = xs[i], x1 = xs[i + 1]; if (x1 - x0 > 4) continue;
      const z0 = FZ + .3 * Math.sin(x0 / 7), z1 = FZ + .3 * Math.sin(x1 / 7);
      [.45, .8, 1.1].forEach(y => w.line([[x0, y, z0], [(x0 + x1) / 2, y - .05, (z0 + z1) / 2], [x1, y, z1]], "#4a4440", .025, { min: .5 })); }
    const gx = laneX(FZ); w.line([[gx - 2, .5, FZ - .6], [gx + .8, .5, FZ - 2.4]], "#9a8a74", .08); w.line([[gx - 2, 1.05, FZ - .6], [gx + .8, 1.05, FZ - 2.4]], "#9a8a74", .08);
    w.line([[gx - 2, .5, FZ - .6], [gx + .8, 1.05, FZ - 2.4]], "#9a8a74", .06); }

  /* ---------- the water tower: stave tank and cone roof on a braced timber trestle ---------- */
  const TX = 4, TZ = 96, TY = hG(4, 96), LEG = 10.6, TR = 2.3, THk = 4.2, TYAW = 28 * Math.PI / 180;
  const rot = (lx, lz) => [TX + lx * Math.cos(TYAW) - lz * Math.sin(TYAW), TZ + lx * Math.sin(TYAW) + lz * Math.cos(TYAW)];
  const Lu = (() => { const l = Math.hypot(...LV); return LV.map(v => v / l); })();
  { const A0 = 2.9, A1 = 2.0, corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    const legP = (c, y) => { const a = A0 + (A1 - A0) * y / LEG, [x, z] = rot(c[0] * a, c[1] * a); return [x, TY + y, z]; };
    const legC = c => { const [x, z] = rot(c[0], c[1]), d = ((x - TX) * Lu[0] + (z - TZ) * Lu[2]) / 1.41; return d > .3 ? "#a08a70" : d > -.3 ? "#7e6a56" : "#5a4a3c"; };
    corners.forEach(c => { w.line([legP(c, 0), legP(c, LEG)], legC(c), .34); const [x, z] = rot(c[0] * A0, c[1] * A0); w.box({ x, z, y: TY - .1, yaw: 28, w: .8, d: .8, h: .45, c: "#a8a49a" }); });
    [3.5, 7.05, LEG - .15].forEach((y, k) => corners.forEach((c, i) => { const d = corners[(i + 1) % 4], y0 = k ? [3.5, 7.05][k - 1] : .4;
      w.line([legP(c, y), legP(d, y)], "#6e5c4a", .22);
      w.line([legP(c, y0), legP(d, y)], "#5e4e40", .1); w.line([legP(d, y0), legP(c, y)], "#5e4e40", .1); }));
    w.cyl({ x: TX, z: TZ, y: TY, r0: .2, h: LEG, n: 10, c: "#5a5048" });
    // ladder up the front-right leg
    { const c = [1, -1], o = [-.35, .35]; for (const s2 of [-1, 1]) w.line([legP(c, .3).map((v, i) => i === 0 ? v + s2 * .22 * Math.cos(TYAW) - .3 : i === 2 ? v - .3 : v), legP(c, LEG).map((v, i) => i === 0 ? v + s2 * .22 * Math.cos(TYAW) - .3 : i === 2 ? v - .3 : v)], "#4a3e34", .05, { min: .5 });
      for (let y = .6; y < LEG; y += .5) { const p = legP(c, y); w.line([[p[0] - .22 - .3, p[1], p[2] - .3], [p[0] + .22 - .3, p[1], p[2] - .3]], "#4a3e34", .04, { min: .4 }); } void o; }
    // deck and railing
    w.box({ x: TX, z: TZ, y: TY + LEG, yaw: 28, w: 5.2, d: 5.2, h: .32, c: "#7a6652", top: "#8a7660", bottom: "#4a3c30" });
    const rc = [[-2.5, -2.5], [2.5, -2.5], [2.5, 2.5], [-2.5, 2.5]].map(([a, b]) => rot(a, b));
    for (let i = 0; i < 4; i++) { const [x0, z0] = rc[i], [x1, z1] = rc[(i + 1) % 4], ry = TY + LEG + .32;
      w.line([[x0, ry + 1, z0], [x1, ry + 1, z1]], "#5e4e40", .06, { min: .5 });
      for (let k = 0; k <= 4; k++) { const t = k / 4, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t; w.line([[x, ry, z], [x, ry + 1, z]], "#5e4e40", .06, { min: .5 }); } }
    // the tank: wooden staves with iron hoops, a shingled cone roof with a ball finial; one solid so the overhang sorts right
    const by = TY + LEG + .32, ty = by + THk, n = 36, faces = [];
    const ring = (rr, y, i) => { const a = i / n * Math.PI * 2; return [TX + Math.cos(a) * rr, y, TZ + Math.sin(a) * rr]; };
    const STV = ["#8a6e52", "#7e644a", "#94785a", "#866a4e", "#7a6046"];
    for (let i = 0; i < n; i++) {
      const dec = [];
      [.35, .95, 1.6, 2.3, 3.05, 3.8].forEach(hh => dec.push({ P: [ring(TR + .04, by + hh, i), ring(TR + .04, by + hh, i + 1)], c: "#2e2a28", ln: .07, min: .6 }));
      if (i % 6 === 0) dec.push({ P: [ring(TR + .02, by + .1, i + .5), ring(TR + .02, ty - .1, i + .5)], c: "#5a4634", ln: .03, min: .3, op: .6 });
      faces.push({ P: [ring(TR, by, i), ring(TR, by, i + 1), ring(TR, ty, i + 1), ring(TR, ty, i)], c: STV[i % 5], dec }); }
    const RR = TR + .42, rtop = ty + 2.0;
    for (let i = 0; i < n; i++) {
      faces.push({ P: [ring(TR, ty, i), ring(TR, ty, i + 1), ring(RR, ty, i + 1), ring(RR, ty, i)], c: "#3a302a", two: true, back: "#2a221e" });
      const dec = [.3, .55, .8].map(t => ({ P: [ring(RR * (1 - t), ty + 2 * t, i), ring(RR * (1 - t), ty + 2 * t, i + 1)], c: "#3a3230", ln: .04, min: .35, op: .6 }));
      faces.push({ P: [ring(RR, ty, i), ring(RR, ty, i + 1), [TX, rtop, TZ]], c: "#6a5e54", dec }); }
    w.add(faces, { center: [TX, by + THk / 2, TZ] });
    w.cyl({ x: TX, z: TZ, y: rtop - .1, r0: .08, h: .7, n: 8, c: "#3a3230" });
    w.sprite({ x: TX, z: TZ, y: rtop + .75, bias: -6, fn: (px, py, k) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(.17 * k)}" fill="${T("#5a524a")}"/><circle cx="${F(px + .06 * k)}" cy="${F(py - .05 * k)}" r="${F(.07 * k)}" fill="${T("#a89a8a")}"/>` });
    // ladder up the tank side to the roof hatch
    { const a = -1.15; for (const da of [-.055, .055]) w.line([ring(TR + .28, by + .2, (a + da) / (Math.PI * 2) * n), ring(TR + .28, ty + .3, (a + da) / (Math.PI * 2) * n)], "#3a3230", .05, { min: .5 });
      for (let y = by + .5; y < ty + .2; y += .45) w.line([ring(TR + .28, y, (a - .055) / (Math.PI * 2) * n), ring(TR + .28, y, (a + .055) / (Math.PI * 2) * n)], "#3a3230", .04, { min: .4 }); }
  }

  /* ---------- the Martian cylinder, half-buried in its crater ---------- */
  const unit = v => { const l = Math.hypot(...v); return v.map(q => q / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const CU = unit([6.8, -3.3, 4.6]), C0 = [16.4, 2.6, 60.5], CR = 2.9, CL = 9.5, CN = 30;
  const CA = unit(cross(CU, [0, 1, 0])), CB = unit(cross(CA, CU));
  const cpt = (t, rr, i, off = 0) => { const a = i / CN * Math.PI * 2; return [0, 1, 2].map(j => C0[j] + CU[j] * (t - off) + (CA[j] * Math.cos(a) + CB[j] * Math.sin(a)) * rr); };
  { const faces = [], MET = ["#a29a88", "#968e7e", "#aaa290", "#8e8676"];
    for (let i = 0; i < CN; i++) {
      const dec = [];
      [.35, 2.6, 5.2].forEach(t => { const p0 = cpt(t, CR + .03, i), p1 = cpt(t, CR + .03, i + 1); if (p0[1] > .2 && p1[1] > .2) dec.push({ P: [p0, p1], c: "#4a443c", ln: .08, min: .5 }); });
      if (i % 3 === 0) { const p0 = cpt(.4, CR + .02, i + .5), p1 = cpt(4.5, CR + .02, i + .5); if (p0[1] > .2 && p1[1] > .2) dec.push({ P: [p0, p1], c: "#3a3028", ln: .12, min: .4, op: .35 }); }
      faces.push({ P: [cpt(0, CR, i), cpt(0, CR, i + 1), cpt(CL, CR, i + 1), cpt(CL, CR, i)], c: MET[i % 4], wet: true, dec }); }
    // the end cap: a thick lip, concentric grooves, and the lid backing out on its thread
    const disc = (rr, off) => Array.from({ length: CN }, (_, i) => cpt(0, rr, i, off));
    const ringLine = (rr, off, c, ln, o = {}) => { const out = []; for (let i = 0; i < CN; i++) { const p0 = cpt(0, rr, i, off), p1 = cpt(0, rr, i + 1, off); if (p0[1] > .25 && p1[1] > .25) out.push({ P: [p0, p1], c, ln, min: .6, ...o }); } return out; };
    const capDec = [...ringLine(CR - .12, .02, "#5a5248", .16), ...ringLine(CR * .86, .02, "#6e6658", .05)];
    capDec.push({ P: disc(CR * .74, .1), c: "#b4ac98", wet: true });
    capDec.push(...ringLine(CR * .75, .11, NIGHT ? GREEN : "#1e1a16", NIGHT ? .14 : .09, NIGHT ? { glow: true } : {}));
    capDec.push(...ringLine(CR * .5, .12, "#7a7264", .05), ...ringLine(CR * .25, .12, "#7a7264", .05));
    capDec.push({ P: disc(CR * .1, .14), c: "#6a6256", wet: true });
    faces.push({ P: disc(CR, 0), c: "#9a927e", wet: true, dec: capDec });
    w.add(faces, { center: C0.map((v, j) => v + CU[j] * CL / 2), key: 57.5 });
  }
  // the crater rim: turned soil piled round it, the near half drawn over the cylinder
  const BR = 7.4, bermH = th => 1.15 + .35 * N3(Math.cos(th) * 1.3, Math.sin(th) * 1.3);
  const SOILR = ["#2e221a", "#3e2e22", "#544030", "#6a523c", "#806648", "#9a7e5a"];
  const berm = front => (px0, py0, k0, fog) => {
    let g = `<g filter="url(#gmClod)">`; const m = 40;
    for (let i = 0; i < m; i++) {
      const t0 = front ? Math.PI + Math.PI * i / m : Math.PI * i / m, t1 = t0 + Math.PI / m + .01;
      const top = th => [CRX + BR * Math.cos(th), hG(CRX, CRZ) + bermH(th), CRZ + BR * Math.sin(th)];
      const foot = th => front ? [CRX + (BR + 3.4) * Math.cos(th), hG(CRX, CRZ), CRZ + (BR + 3.4) * Math.sin(th)] : [CRX + (BR - 2.6) * Math.cos(th), .05, CRZ + (BR - 2.6) * Math.sin(th)];
      const Q = [top(t0), top(t1), foot(t1), foot(t0)].map(p => w.proj(p));
      const nx = front ? Math.cos((t0 + t1) / 2) : -Math.cos((t0 + t1) / 2), nz = front ? Math.sin((t0 + t1) / 2) : -Math.sin((t0 + t1) / 2);
      const lit = cl(.45 + .55 * (nx * Lu[0] + nz * Lu[2]) + (rq() - .5) * .2);
      g += `<path d="M${Q.map(q => F(q[0]) + "," + F(q[1])).join("L")}Z" fill="${T(SOILR[Math.floor(lit * 6)])}" stroke="${T(SOILR[Math.floor(lit * 6)])}" stroke-width="1"/>`; }
    // clods and broken stalks on the rim
    for (let i = 0; i < 70; i++) { const th = (front ? Math.PI : 0) + rq() * Math.PI, rr = BR + (rq() - .3) * 3, p = w.proj([CRX + rr * Math.cos(th), hG(CRX, CRZ) + bermH(th) * (1 - Math.abs(rr - BR) / 3.6), CRZ + rr * Math.sin(th)]);
      const k = FL / (CRZ + rr * Math.sin(th)), R = (.12 + rq() * .22) * k, lit = cl(.5 + .5 * Math.cos(th) * .8 + (rq() - .5) * .4);
      g += `<path d="${blobP(p[0], p[1] - R * .5, R, R * .7, 6, rq)}" fill="${T(SOILR[Math.floor(lit * 5)])}"/><path d="${blobP(p[0] + R * .25, p[1] - R * .75, R * .45, R * .3, 5, rq)}" fill="${T(SOILR[Math.min(5, Math.floor(lit * 5) + 1)])}"/>`;
      if (rq() < .3) g += `<path d="M${F(p[0])},${F(p[1] - R)} l${F((rq() - .5) * R * 3)},${F(-R * (1.5 + rq() * 2))}" stroke="${T("#b89a58")}" stroke-width="${F(Math.max(.8, R * .14))}"/>`; }
    return g + `</g>`; };
  w.sprite({ x: CRX, z: CRZ + BR, y: 0, noRefl: true, fn: berm(false) });
  w.sprite({ x: CRX, z: CRZ - BR - 1.6, y: 0, noRefl: true, fn: berm(true) });

  // corn shocks standing in the stubble, left of the lane
  for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) {
    const z = 36 + j * 9 + (rp() - .5) * 4, x = -48 + i * 5.2 + (rp() - .5) * 2 + j * 1.5; if (x > laneX(z) - 3.5 || rp() < .2) continue;
    const hM = 2.2 + rp() * .5; w.sprite({ x, z, y: hG(x, z) - .05, fn: (px, py, k, fog) => shock(px, py, hM * k, fog) }); }
  // stubble tufts and singed stalks across the near field
  for (let k = 0, n = 0; k < 6000 && n < 1800; k++) {
    const z = 5 + Math.pow(r(), .8) * 66, x = (r() - .5) * 1.4 * z;
    if (Math.abs(x - laneX(z)) < 1.2 || Math.hypot(x - CRX, z - CRZ) < 10) continue;
    n++; const len = .07 + r() * .12, burnt = Math.hypot(x - CRX, z - CRZ) < 17;
    w.sprite({ x, z, y: hG(x, z), bias: .05, fn: (px, py, k2) => { const L = len * k2, Cs = burnt ? ["#5a4630", "#7a603e", "#3e3024"] : ["#c8aa6a", "#a88c54", "#d8c080", "#9a7e4a"]; let g = "";
      for (let b = 0; b < 3; b++) { const bend = (r() - .5) * L * .5, lit = bend > 0;
        g += `<path d="M${F(px + (r() - .5) * L * .5)},${F(py)} l${F(bend)},${F(-L)}" stroke="${T(mix(Cs[Math.floor(r() * Cs.length)], lit ? RIM : SHADE, lit ? .18 : .15))}" stroke-width="${F(Math.max(.7, L * .1))}" fill="none" stroke-linecap="round"/>`; }
      return g; } }); }

  /* ---------------- assemble ---------------- */
  const isG = o => o === ground, tagged = t => o => !o.raster && o.tag === t, rest = o => !o.raster && !["dist", "far", "yard"].includes(o.tag);
  s += `<rect x="0" y="${WY - 2}" width="${W}" height="${H - WY + 2}" fill="${T("#a89a6a")}"/>`;
  s += w.draw({ where: isG });
  // the tower's long shadow, thrown left and toward the viewer by the low sun
  if (!NIGHT) {
    const shp = p => { const k = (p[1] - TY) / Lu[1]; return w.proj([p[0] - Lu[0] * k, TY, p[2] - Lu[2] * k]); };
    let g = `<g opacity=".26">`;
    const A0 = 2.9, A1 = 2.0;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(c => { const a0 = rot(c[0] * A0, c[1] * A0), a1 = rot(c[0] * A1, c[1] * A1);
      const p0 = shp([a0[0], TY, a0[1]]), p1 = shp([a1[0], TY + LEG, a1[1]]);
      g += `<path d="M${F(p0[0])},${F(p0[1])} L${F(p1[0])},${F(p1[1])}" stroke="#2a2030" stroke-width="5" stroke-linecap="round"/>`; });
    for (let y = TY + LEG; y < TY + LEG + 6.6; y += .25) { const rr = y > TY + LEG + 4.5 ? (TR + .42) * (1 - (y - TY - LEG - 4.5) / 2.1) : TR;
      const P2 = Array.from({ length: 20 }, (_, i) => { const a = i / 20 * Math.PI * 2; return shp([TX + Math.cos(a) * rr, y, TZ + Math.sin(a) * rr]); });
      g += `<path d="M${P2.map(q => F(q[0]) + "," + F(q[1])).join("L")}Z" fill="#2a2030"/>`; }
    s += g + `</g>`;
  }
  s += w.draw({ where: tagged("dist") });
  s += `<rect x="0" y="${WY - 40}" width="${W}" height="60" fill="url(#gmHaze)" opacity=".55"/>`;
  s += w.draw({ where: tagged("far") });
  s += `<rect x="0" y="${WY - 26}" width="${W}" height="44" fill="url(#gmHaze)" opacity=".3"/>`;
  s += w.draw({ where: tagged("yard") });
  s += w.draw({ where: rest });

  // steam curling off the cylinder (green-lit at night)
  { const c = w.proj(C0), k = FL / C0[2];
    let g = `<g class="smoke" filter="url(#gmSteam)" opacity="${NIGHT ? .55 : .6}">`;
    for (let i = 0; i < 9; i++) { const t = i / 8, x = c[0] - 20 - t * 120 + (rq() - .5) * 40, y = c[1] - 40 - t * 120, R = (1 + t * 2.4) * k * .7;
      g += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(R)}" ry="${F(R * .7)}" fill="${NIGHT ? "#7ae0a0" : "#f4f0ea"}" opacity="${F(.55 - t * .4)}"/>`; }
    s += g + `</g>`; }
  if (NIGHT) {
    const c = w.proj(C0), k = FL / C0[2];
    s += `<g style="mix-blend-mode:screen"><ellipse cx="${F(c[0])}" cy="${F(c[1] + 30)}" rx="${F(k * 12)}" ry="${F(k * 4)}" fill="url(#gmGreen)"/><circle cx="${F(c[0])}" cy="${F(c[1])}" r="${F(k * 5)}" fill="url(#gmGreen)" opacity=".7"/>`;
    const cm = w.proj(C0.map((v, j) => v + CU[j] * 3)); s += `<ellipse cx="${F(cm[0])}" cy="${F(cm[1])}" rx="${F(k * 5)}" ry="${F(k * 2.6)}" fill="url(#gmGreen)" opacity=".55"/>`;
    const tb = w.proj([TX, TY + 3, TZ]); s += `<ellipse cx="${F(tb[0] + 60)}" cy="${F(tb[1])}" rx="140" ry="90" fill="url(#gmGreen)" opacity=".22"/></g>`;
    const pl = w.proj([-12 - .5, hG(-12, 80) + 3.0, 80 - 6.1]); s += `<circle cx="${F(pl[0])}" cy="${F(pl[1])}" r="46" fill="url(#gmGlow)" opacity=".85"/><circle cx="${F(pl[0])}" cy="${F(pl[1])}" r="2.4" fill="#fff4cc"/>`;
  }
  // grass and seed heads in the bottom corners, under the cards
  const tuft = (x0, x1) => { let g = "";
    for (let i = 0; i < 80; i++) { const x = x0 + r() * (x1 - x0), y = 700 + r() * 30, hh = 50 + r() * 90, bend = (r() - .5) * 36;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#a08a4a" : "#c0a868")}" stroke-width="${F(1.6 + r() * 2)}" fill="none" stroke-linecap="round"/>`;
      if (r() < .2) g += `<ellipse cx="${F(x + bend)}" cy="${F(y - hh)}" rx="2.4" ry="6" fill="${T("#d8c48a")}"/>`; }
    return g; };
  s += tuft(0, 280) + tuft(2300, 2560);

  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#gmLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#gmPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
