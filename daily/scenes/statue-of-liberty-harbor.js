/* Statue of Liberty, New York Harbor: Liberty Island seen from the water on a
   late-October afternoon, for the 140th anniversary of the dedication (Oct 28,
   1886). The copper statue (green verdigris, gold-leaf torch flame) stands on
   Hunt's granite pedestal (base course with doors, a loggia on each face, the
   cornice, the attic with its ring of disks and the balcony), on the stepped
   concrete foundation inside the eleven-point star walls of Fort Wood. The
   island has its granite seawall, promenade railing, lamp posts, plane trees
   and oaks in autumn colour, the museum at the west end, brick buildings, the
   flagpole and the ferry pier at the east end. A three-deck ferry is coming
   in on the right, a red tug works on the left, Ellis Island and Jersey City
   lie across the water on the left, Lower Manhattan (One World Trade, the
   Brookfield towers, 40 Wall, 70 Pine) rises in the haze on the right, with
   Governors Island and the Red Hook cranes beyond. Gulls overhead.
   Sun low off the left edge (south-west); the statue's right side is lit.
   opts.time === "night": the statue floodlit from below, the torch flame
   glowing, the pedestal and fort walls lit, the skyline's windows, aviation
   lights and the One WTC spire, lit ferry decks, promenade lamps and their
   streaks on the water. The 91% waning moon rises behind the viewer, so it
   is not in the frame; the harbor is lit by the city.
   Island, monument, boats and trees are placed with world3d() (eye 6 m on the
   water, f 1700, horizon 452); the far shores are 2D bands sized from their
   distance. Same shape as reference/autumn-valley.js. Needs rng(), mix(),
   world3d(), noise2(), hexRGB() and rgbTone() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                    */
function statueOfLibertyHarborArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1886;
  const r = rng(seed), rs = rng(seed + 7), rk = rng(seed + 19), rl = rng(seed + 31);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = -260, LY = 170, WY = 452, FL = 1700, EYE = 9;
  const T = c => NIGHT ? mix(mix(c, "#7a7a8a", .4), "#0c1434", .6) : c;
  const HZ = NIGHT ? "#2c3256" : "#e2dccc", RIM = NIGHT ? "#b8c8f4" : "#fff0c8", LAMP = "#ffc868";
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

  /* ---------------- sky ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#050920"/><stop offset=".45" stop-color="#101a40"/><stop offset=".82" stop-color="#2a2c52"/><stop offset="1" stop-color="#4a3c58"/>`
    : `<stop offset="0" stop-color="#3270b8"/><stop offset=".45" stop-color="#78aedc"/><stop offset=".82" stop-color="#c8d6dc"/><stop offset="1" stop-color="${HZ}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#ffb070" stop-opacity=".35"/><stop offset=".4" stop-color="#c07a70" stop-opacity=".12"/><stop offset="1" stop-color="#806080" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff2cc" stop-opacity=".95"/><stop offset=".2" stop-color="#ffe8b8" stop-opacity=".45"/><stop offset=".6" stop-color="#ffe0a0" stop-opacity=".1"/><stop offset="1" stop-color="#ffe0a0" stop-opacity="0"/>`;
  let s = `<defs id="sldefs">
    <linearGradient id="slSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="slLight" cx="${NIGHT ? 1820 : LX}" cy="${NIGHT ? WY : LY}" r="${NIGHT ? 900 : 1500}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="slHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".65" stop-color="${HZ}" stop-opacity=".7"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="slWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#3a3a5e"/><stop offset=".2" stop-color="#1e2850"/><stop offset="1" stop-color="#080e26"/>`
      : `<stop offset="0" stop-color="#b4c2c6"/><stop offset=".16" stop-color="#7a98a8"/><stop offset=".6" stop-color="#46687e"/><stop offset="1" stop-color="#2a4658"/>`}</linearGradient>
    <linearGradient id="slTopShade" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0a1030" stop-opacity="0"/><stop offset=".55" stop-color="#0a1030" stop-opacity=".12"/><stop offset="1" stop-color="#0a1030" stop-opacity=".5"/></linearGradient>
    <radialGradient id="slGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="slFlood"><stop offset="0" stop-color="#fff0d0" stop-opacity=".5"/><stop offset=".5" stop-color="#ffe0b0" stop-opacity=".14"/><stop offset="1" stop-color="#ffe0b0" stop-opacity="0"/></radialGradient>
    <clipPath id="slCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="slLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".11" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="slLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".25" numOctaves="1" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="slCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".017" numOctaves="3" seed="13" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="slRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .1" numOctaves="2" seed="6" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.3"/></filter>
    <filter id="slPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="slSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="slBlur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#slSky)"/>`;
  if (NIGHT) {   // a city sky: few stars, a warm glow over Manhattan
    for (let i = 0; i < 180; i++) { const x = rs() * W, y = Math.pow(rs(), 1.6) * 360, big = rs() < .06;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.5 : F(.5 + rs() * .5)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(.2 + rs() * .45 * (1 - y / 420))}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="url(#slLight)"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#slLight)"/>`;
    s += `<g class="rays" opacity=".08" filter="url(#slSoft)">`;
    for (let k = 0; k < 6; k++) { const a = .05 + k * .1, L = 1500;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .025) * L)},${F(LY + Math.sin(a - .025) * L)} L${F(LX + Math.cos(a + .025) * L)},${F(LY + Math.sin(a + .025) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: fair-weather cumulus, thin moonlit strata at night ---------------- */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#slCloudy)">`;
    const lobes = [];
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#1c2246"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#2c2e56"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .14)}" rx="${F(R * .9)}" ry="${F(R * .14)}" fill="#6a5a7a" opacity=".55"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .13 * (.6 + rs() * .7), w * (.08 + rs() * .07)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .07)}" fill="#b8c4d6"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#c8d0de"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .85)}" fill="#f6f4ee"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .3)}" cy="${F(ly - R * .35)}" rx="${F(R * .6)}" ry="${F(R * .4)}" fill="#fffae6"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(540, 150, 420, "drift1") + cloud(1960, 96, 560, "drift2") + cloud(2380, 210, 300, "drift3") + cloud(180, 250, 240, "drift2") + cloud(1580, 300, 200, "drift1");
  if (!NIGHT) {   // gulls over the water
    s += `<g class="birds" stroke-linecap="round">`;
    [[1330, 250, 1], [1384, 226, .85], [1440, 268, .9], [1260, 300, .7], [880, 320, .65], [1530, 330, .6]].forEach(([x, y, k]) => {
      const fl = rs() < .5 ? 1 : -1;
      s += `<path d="M${F(x - 16 * k)},${F(y - 3 * k)} q${F(8 * k)},${F(-9 * k * fl)} ${F(16 * k)},${F(3 * k)} q${F(8 * k)},${F(-9 * k * fl)} ${F(16 * k)},${F(-3 * k)}" stroke="#8a8e98" stroke-width="${F(3 * k)}" fill="none"/>`;
      s += `<path d="M${F(x - 16 * k)},${F(y - 3 * k)} q${F(3 * k)},${F(-4 * k * fl)} ${F(6 * k)},${F(-3 * k * fl)} M${F(x + 16 * k)},${F(y - 3 * k)} q${F(-3 * k)},${F(-4 * k * fl)} ${F(-6 * k)},${F(-3 * k * fl)}" stroke="#2a2a30" stroke-width="${F(2.6 * k)}" fill="none"/>`;
      s += `<ellipse cx="${F(x)}" cy="${F(y + k)}" rx="${F(5 * k)}" ry="${F(2.4 * k)}" fill="#fbfaf6"/>`; });
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= far shores: 2D bands, sized by distance (px = f * metres / z) ================= */
  const hz = (c, t) => T(mix(c, HZ, t));
  let far = "";
  // a building front with window rows; lit windows at night. Light from the left: a pale left strip.
  const tower = (x, w, h, base, c, haze, top) => {
    const y = base - h, C = hz(c, haze), Cl = hz(mix(c, "#fff4e0", .35), haze), Cd = hz(mix(c, "#202838", .35), haze);
    let g = "";
    if (top === "spire") g += `<path d="M${F(x + w * .2)},${F(y)} L${F(x + w * .5)},${F(y - h * .22)} L${F(x + w * .8)},${F(y)}Z" fill="${Cd}"/><path d="M${F(x + w * .5)},${F(y - h * .22)} l0,${F(-h * .08)}" stroke="${Cd}" stroke-width="1.2"/>`;
    if (top === "pyr") g += `<path d="M${F(x + w * .1)},${F(y)} L${F(x + w * .5)},${F(y - w * .7)} L${F(x + w * .9)},${F(y)}Z" fill="${hz(NIGHT ? "#4a6a70" : "#6a9488", haze)}"/><path d="M${F(x + w * .5)},${F(y - w * .7)} l0,${F(-w * .5)}" stroke="${Cd}" stroke-width="1"/>`;
    if (top === "dome") g += `<path d="M${F(x + w * .12)},${F(y)} Q${F(x + w * .5)},${F(y - w * .7)} ${F(x + w * .88)},${F(y)}Z" fill="${hz("#7a8a8a", haze)}"/>`;
    if (top === "step") g += `<rect x="${F(x + w * .15)}" y="${F(y - h * .08)}" width="${F(w * .7)}" height="${F(h * .08 + 1)}" fill="${C}"/><rect x="${F(x + w * .3)}" y="${F(y - h * .14)}" width="${F(w * .4)}" height="${F(h * .06 + 1)}" fill="${C}"/>`;
    g += `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h + 1)}" fill="${C}"/>`;
    g += `<rect x="${F(x)}" y="${F(y)}" width="${F(w * .3)}" height="${F(h + 1)}" fill="${Cl}" opacity=".7"/>`;
    g += `<rect x="${F(x + w * .82)}" y="${F(y)}" width="${F(w * .18)}" height="${F(h + 1)}" fill="${Cd}" opacity=".6"/>`;
    for (let yy = y + 3; yy < base - 2; yy += 2.6) {
      if (NIGHT) { for (let xx = x + 1; xx < x + w - 1; xx += 2.2) if (rk() < .38) g += `<rect x="${F(xx)}" y="${F(yy)}" width="1.2" height="1.3" fill="${rk() < .7 ? "#ffd890" : "#e8f0ff"}" opacity="${F(.45 + rk() * .5)}"/>`; }
      else g += `<rect x="${F(x + 1)}" y="${F(yy)}" width="${F(w - 2)}" height=".7" fill="${hz("#3a4858", haze + .1)}" opacity=".25"/>`; }
    if (NIGHT && h > 60) g += `<circle cx="${F(x + w / 2)}" cy="${F(y - (top === "spire" ? h * .3 : top === "pyr" ? w * 1.2 : 1))}" r="1.6" fill="#ff4a3a"/>`;
    return g; };
  // New Jersey across the Upper Bay: Liberty State Park, Jersey City, Exchange Place
  { const base = WY + 2;
    let d = `M0,${base + 4} L0,${base - 6}`;
    for (let x = 0; x <= 960; x += 12) d += ` L${x},${F(base - 6 - 4 * Math.sin(x / 70) - 3 * Math.sin(x / 23 + 1))}`;
    far += `<path d="${d} L960,${base + 4}Z" fill="${hz("#6a7a5a", .6)}"/>`;
    [[60, 22, 30], [96, 18, 44], [180, 26, 26], [250, 20, 52], [300, 30, 38], [380, 22, 64], [430, 26, 88], [470, 20, 72], [520, 28, 104], [566, 22, 82], [606, 30, 118], [650, 20, 66], [700, 24, 52], [760, 30, 34], [840, 20, 24]].forEach(([x, w, h]) =>
      far += tower(x, w, h, base - 4, ["#a8a49a", "#8a96a4", "#b8b0a0", "#7a8a9a"][Math.floor(rk() * 4)], .6, rk() < .2 ? "step" : null));
    // the old rail terminal's clock tower in the park
    far += `<rect x="330" y="${base - 30}" width="40" height="22" fill="${hz("#9a5a40", .55)}"/><rect x="342" y="${base - 46}" width="12" height="18" fill="${hz("#a8644a", .55)}"/><path d="M340,${base - 46} l8,-8 l8,8Z" fill="${hz("#4a6a5a", .55)}"/>`;
    // park trees along the far shore
    far += `<g filter="url(#slLeafyS)">`;
    for (let x = 0; x < 960; x += 4 + rk() * 5) { const sz = 3 + rk() * 4, y = base - 4 - rk() * 3;
      far += `<path d="${blobP(x, y - sz * .6, sz, sz * .7, 6, rk)}" fill="${hz(["#8a7a3a", "#9a6a30", "#6a7a40", "#a0803a"][Math.floor(rk() * 4)], .55)}"/>`; }
    far += `</g>`; }
  // Lower Manhattan, about 3.4 km off: towers sized from their real heights at that distance
  { const base = WY + 3, K = FL / 3400;
    far += `<path d="M1300,${base + 3} L1300,${base - 8} L2200,${base - 8} L2200,${base + 3}Z" fill="${hz("#6a7058", .55)}"/>`;
    const fill = []; for (let x = 1330; x < 2160; x += 10 + rk() * 14) { const t = (x - 1330) / 830;
      fill.push([x, 9 + rk() * 12, (60 + rk() * 150) * (1 - t * .55) * K * (1 - Math.abs(t - .3) * .4)]); }
    const named = [[1360, 22, 186 * K, "pyr", "#a8a48e"], [1398, 24, 210 * K, "dome", "#8a9aa8"], [1438, 28, null, "wtc", "#9ab2c8"], [1494, 26, 329 * K, null, "#8aa0b6"], [1528, 24, 298 * K, null, "#a8b8c8"], [1566, 22, 250 * K, null, "#b0aaa0"],
      [1690, 20, 283 * K, "pyr", "#c8b8a0"], [1756, 18, 290 * K, "spire", "#d0c4b0"], [1820, 26, 230 * K, "step", "#a8a29a"], [1890, 22, 260 * K, null, "#8a98a8"], [1960, 24, 200 * K, "step", "#b8aa98"]];
    // back row, then the named towers, then the low front row
    fill.forEach(([x, w, h]) => far += tower(x, w, Math.min(h * 1.1, 180), base - 6, ["#a8a8a0", "#9aa4ae", "#b8b2a6", "#8a96a2"][Math.floor(rk() * 4)], .62));
    named.forEach(([x, w, h, top, c]) => {
      if (top === "wtc") {   // One World Trade: tapering, chamfered faces, the spire
        const hh = 417 * K, b = base - 6, y = b - hh, tw = w * .55;
        far += `<path d="M${F(x)},${F(b)} L${F(x + w)},${F(b)} L${F(x + w / 2 + tw / 2)},${F(y)} L${F(x + w / 2 - tw / 2)},${F(y)}Z" fill="${hz(c, .5)}"/>`;
        far += `<path d="M${F(x)},${F(b)} L${F(x + w / 2)},${F(b)} L${F(x + w / 2 - tw / 2)},${F(y)}Z" fill="${hz("#e4eef4", .5)}" opacity=".75"/>`;
        far += `<path d="M${F(x + w / 2)},${F(b)} L${F(x + w)},${F(b)} L${F(x + w / 2 + tw / 2)},${F(y)}Z" fill="${hz("#5a7088", .5)}" opacity=".6"/>`;
        far += `<rect x="${F(x + w / 2 - tw / 2)}" y="${F(y - 3)}" width="${F(tw)}" height="3" fill="${hz("#6a7a8a", .5)}"/>`;
        far += `<path d="M${F(x + w / 2)},${F(y - 3)} L${F(x + w / 2)},${F(y - 124 * K)}" stroke="${NIGHT ? "#f4f8ff" : hz("#6a7480", .5)}" stroke-width="1.6"/>`;
        if (NIGHT) { for (let yy = y + 3; yy < b - 2; yy += 2.6) for (let xx = x + 2; xx < x + w - 2; xx += 2.2) { const q = (yy - y) / hh, lim = tw / 2 + (w - tw) / 2 * q; if (Math.abs(xx - x - w / 2) < lim && rk() < .3) far += `<rect x="${F(xx)}" y="${F(yy)}" width="1.2" height="1.2" fill="#e8f0ff" opacity="${F(.4 + rk() * .5)}"/>`; }
          far += `<circle cx="${F(x + w / 2)}" cy="${F(y - 124 * K)}" r="5" fill="#ffffff" opacity=".35" filter="url(#slBlur3)"/><circle cx="${F(x + w / 2)}" cy="${F(y - 124 * K)}" r="1.6" fill="#ffffff"/>`; }
        return; }
      far += tower(x, w, h, base - 6, c, .5, top); });
    for (let x = 1300; x < 2190; x += 8 + rk() * 10) far += tower(x, 8 + rk() * 12, 6 + rk() * 16, base - 4, ["#b8b2a6", "#a89a8a", "#c8c0b0"][Math.floor(rk() * 3)], .5);
    // Battery Park trees along the water
    far += `<g filter="url(#slLeafyS)">`;
    for (let x = 1300; x < 1700; x += 3 + rk() * 4) { const sz = 2.5 + rk() * 3; far += `<path d="${blobP(x, base - 5 - sz * .5, sz, sz * .7, 6, rk)}" fill="${hz(["#8a7a3a", "#a0702e", "#6a7a40"][Math.floor(rk() * 3)], .5)}"/>`; }
    far += `</g>`; }
  // Governors Island, Brooklyn and the Red Hook container cranes, farther right
  { const base = WY + 2;
    far += `<path d="M2150,${base + 3} L2150,${base - 5} L2560,${base - 9} L2560,${base + 3}Z" fill="${hz("#6a7058", .6)}"/>`;
    for (let x = 2190; x < 2560; x += 9 + rk() * 12) far += tower(x, 8 + rk() * 14, 8 + rk() * 26, base - 5, ["#a8988a", "#b8aa98", "#8a8a8a"][Math.floor(rk() * 3)], .62);
    [[2300, "#b84a3a"], [2350, "#3a6a9a"], [2398, "#b84a3a"], [2446, "#3a6a9a"]].forEach(([x, c]) => { const C = hz(c, .5), y0 = base - 6;
      far += `<path d="M${x},${y0} l3,-30 M${x + 14},${y0} l-1,-30" stroke="${C}" stroke-width="2.2"/><path d="M${x - 14},${y0 - 31} L${x + 30},${y0 - 31}" stroke="${C}" stroke-width="3"/><path d="M${x + 2},${y0 - 31} l5,-8 l5,8" stroke="${C}" stroke-width="1.3" fill="none"/>`;
      if (NIGHT) far += `<circle cx="${x + 7}" cy="${y0 - 40}" r="1.5" fill="#ff4a3a"/>`; });
    far += `<g filter="url(#slLeafyS)">`;
    for (let x = 1990; x < 2200; x += 3 + rk() * 4) { const sz = 3 + rk() * 3; far += `<path d="${blobP(x, base - 3 - sz * .5, sz, sz * .7, 6, rk)}" fill="${hz(["#8a7a3a", "#9a6a30", "#6a7a40"][Math.floor(rk() * 3)], .45)}"/>`; }
    far += `</g>`; }
  // Ellis Island, nearer (about 1.3 km): the red-brick main building with its four copper-domed towers
  { const base = WY + 7, x0 = 610, C = hz("#a0503a", .35), Cs = hz("#c8b8a0", .35), Cd = hz("#5a9a88", .35);
    far += `<path d="M540,${base + 2} L548,${base - 4} L880,${base - 4} L890,${base + 2}Z" fill="${hz("#6a7848", .4)}"/>`;
    far += `<rect x="${x0}" y="${base - 26}" width="150" height="22" fill="${C}"/><rect x="${x0}" y="${base - 26}" width="40" height="22" fill="${hz("#c06a4a", .35)}" opacity=".6"/>`;
    for (let i = 0; i < 12; i++) far += `<rect x="${x0 + 6 + i * 12}" y="${base - 20}" width="4" height="9" fill="${NIGHT ? (rk() < .5 ? "#ffd890" : "#1a2040") : hz("#e8e0d0", .4)}"/>`;
    far += `<path d="M${x0 + 50},${base - 26} L${x0 + 75},${base - 34} L${x0 + 100},${base - 26}Z" fill="${hz("#5a6a6a", .35)}"/>`;
    [x0 + 50, x0 + 64, x0 + 86, x0 + 100].forEach(x => far += `<rect x="${x - 4}" y="${base - 44}" width="8" height="18" fill="${Cs}"/><path d="M${x - 5},${base - 44} Q${x},${base - 54} ${x + 5},${base - 44}Z" fill="${Cd}"/><path d="M${x},${base - 52} l0,-4" stroke="${Cd}" stroke-width="1"/>`);
    far += `<g filter="url(#slLeafyS)">`;
    for (let x = 550; x < 880; x += 5 + rk() * 6) { if (x > x0 - 6 && x < x0 + 156) continue; const sz = 4 + rk() * 4; far += `<path d="${blobP(x, base - 4 - sz * .6, sz, sz * .75, 6, rk)}" fill="${hz(["#8a7a3a", "#a0682e", "#6a7a40", "#b08a3a"][Math.floor(rk() * 4)], .35)}"/>`; }
    far += `</g>`; }
  far += `<rect x="0" y="${WY - 40}" width="${W}" height="60" fill="url(#slHaze)" opacity="${NIGHT ? .45 : .7}"/>`;
  s += far;

  /* ---------------- the water ---------------- */
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#slWater)"/>`;
  s += `<g clip-path="url(#slCW)"><g transform="matrix(1,0,0,-1,0,${WY * 2 + 8})" opacity=".22" filter="url(#slRipple)">${far}</g></g>`;
  const reflAt = s.length;

  /* ================= the 3D world =================
     Eye 6 m above the water, horizon on WY, f 1700. x right, y up, z away; water at y = 0.
     At night the monument goes in a second world with a floodlight tone (lit from below),
     and the two are drawn together in one back-to-front order. */
  const wcfg = { h: EYE, hy: WY, f: FL, fog: HZ, fogK: .0007, rim: RIM, shade: .5, hi: .25, night: NIGHT, lamp: LAMP };
  const w = world3d({ ...wcfg, light: [-.7, .5, -.55], tone: T, shadow: NIGHT ? "#04060e" : "#34304a" });
  const floodT = c => mix(mix(c, "#f6dcb4", .08), "#121630", .34);
  const wf = NIGHT ? world3d({ ...wcfg, light: [.25, -.32, -.9], tone: floodT, shadow: "#0c0c1e", shade: .8, fogK: .0004 }) : w;
  const worlds = NIGHT ? [w, wf] : [w];
  const drawAll = M => { const L = [];
    worlds.forEach(Wd => Wd.draw({ mirror: M, where: o => { L.push([Wd, o]); return false; } }));
    L.sort((a, b) => b[1].key - a[1].key);
    return L.map(([Wd, o]) => Wd.draw({ mirror: M, where: q => q === o })).join(""); };

  /* Liberty Island: a rounded plateau 2.6 m above the water behind a granite seawall */
  const IX = -24, IZ = 418, IRX = 214, IRZ = 138, G = 2.6;
  const qI = (x, z) => Math.pow(Math.abs((x - IX) / IRX), 2.6) + Math.pow(Math.abs((z - IZ) / IRZ), 2.6);
  const SX = -36, SZ = 404;                         // the statue
  const N1 = noise2(186), N2 = noise2(187), RG = hexRGB, lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  const LAWN = RG("#8a9a4e"), LAWN2 = RG("#6e8040"), PAVE = RG("#c4bcaa"), PAVE2 = RG("#a8a090"), LEAF = RG("#b08a3a");
  const hI = (x, z) => qI(x, z) < 1 ? G + .25 * N1(x / 40, z / 40) * sm((1 - qI(x, z)) * 6) : -1;
  w.raster({ z0: 270, z1: 600, top: 440, bottom: 520, scale: 1, step: .0009, minStep: .1, amb: .55, fog: HZ, fogK: .0007, tone: rgbTone(T), key: 2e6,
    h: hI, col: (x, y, z, n, ao) => {
      const q = qI(x, z), dS = Math.hypot(x - SX, (z - SZ) * 1.0), k = N1(x / 6, z / 6) * .5 + N2(x / 20, z / 20) * .5;
      let c = lerp(LAWN, LAWN2, .5 + k);
      c = lerp(c, LEAF, (N2(x / 9 + 3, z / 9) - .2) * 1.5);                                    // fallen leaves
      if (q > .78 || dS < 64 || (Math.abs(x - SX) < 7 && z < SZ)) c = lerp(PAVE, PAVE2, .5 + N1(x / 3, z / 3) * .6);   // promenade, plaza, the axis walk
      return c; } });
  // the seawall: granite blocks along the shoreline, a coping, the promenade railing
  const NS = 150, shore = [];
  for (let i = 0; i < NS; i++) { const a = i / NS * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
    const k = 1 / Math.pow(Math.pow(Math.abs(c), 2.6) + Math.pow(Math.abs(sn), 2.6), 1 / 2.6);
    shore.push([IX + c * IRX * k, IZ + sn * IRZ * k]); }
  for (let i = 0; i < NS; i++) { const [x0, z0] = shore[i], [x1, z1] = shore[(i + 1) % NS];
    const dec = [.9, 1.8].map(v => ({ P: [[x0, v, z0], [x1, v, z1]], c: "#6a6458", ln: .05, min: .3, op: .5 }));
    w.add([{ P: [[x0, -.6, z0], [x1, -.6, z1], [x1, G, z1], [x0, G, z0]], c: i % 3 ? "#9a9282" : "#a8a090", wet: true, seam: true, dec },
           { P: [[x0, G, z0], [x1, G, z1], [x1, G + .3, z1], [x0, G + .3, z0]], c: "#c8c0b0", seam: true },
           { P: [[x0, -.05, z0], [x1, -.05, z1], [x1, .7, z1], [x0, .7, z0]], c: "#4a4630", seam: true, wet: true, op: .6 }], { center: [IX, 1, IZ] });
    const ix = IX + (x0 - IX) * .985, iz = IZ + (z0 - IZ) * .985, jx = IX + (x1 - IX) * .985, jz = IZ + (z1 - IZ) * .985;
    w.line([[ix, G + 1.1, iz], [jx, G + 1.1, jz]], "#2e3436", .07, { min: .5 });
    if (i % 2 === 0) w.line([[ix, G + .3, iz], [ix, G + 1.1, iz]], "#2e3436", .06, { min: .4 }); }

  /* Fort Wood: the eleven-point star of granite walls */
  const fortP = []; { const R0 = 48, R1 = 28, rot = -Math.PI / 2 + .12;
    for (let i = 0; i < 22; i++) { const a = rot + i / 22 * Math.PI * 2, R = i % 2 ? R1 : R0; fortP.push([SX + Math.cos(a) * R, SZ + Math.sin(a) * R]); } }
  { const fh = 5, fy = G - .2, faces = [];
    for (let i = 0; i < 22; i++) { const [x0, z0] = fortP[i], [x1, z1] = fortP[(i + 1) % 22];
      const dec = [1.2, 2.4, 3.6].map(v => ({ P: [[x0, fy + v, z0], [x1, fy + v, z1]], c: "#6a6252", ln: .06, min: .3, op: .35 }));
      faces.push({ P: [[x0, fy, z0], [x1, fy, z1], [x1, fy + fh, z1], [x0, fy + fh, z0]], c: "#b2a68e", seam: true, sh: .6, dec });
      faces.push({ P: [[x0, fy + fh, z0], [x1, fy + fh, z1], [x1, fy + fh + .5, z1], [x0, fy + fh + .5, z0]], c: "#c8bea8", seam: true }); }
    // the terrace on the walls: paving with a lawn star inside, seen from just above
    const topP = (k, y) => fortP.map(([x, z]) => [SX + (x - SX) * k, y, SZ + (z - SZ) * k]);
    faces.push({ P: topP(1, fy + fh + .5), c: "#bcb4a0", first: true, dec: [{ P: topP(.84, fy + fh + .52), c: "#8a9a50" }, { P: topP(.5, fy + fh + .54), c: "#c4bcaa" }] });
    // one key just behind the foundation, so the terrace draws first and the steps stand on it
    wf.add(faces, { center: [SX, fy + 3, SZ], key: SZ + 2 });
  }
  /* the stepped foundation, then Hunt's pedestal */
  const FY = G + 5.3;
  const wing = (c, P, side, w2, d2, fn) => {   // decoration quads on one face of a box: side "front" | "right" | "left"
    const at = (u, v) => side === "front" ? P([u, v, -d2 - .06]) : side === "right" ? P([w2 + .06, v, u]) : P([-w2 - .06, v, -u]);
    return fn((u0, v0, u1, v1, col, ex = {}) => ({ P: [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)], c: col, ...ex }),
      (u0, v0, u1, v1, col, ln, op) => ({ P: [at(u0, v0), at(u1, v1)], c: col, ln, min: .4, op })); };
  const SIDES = [["front", 0], ["right", 1], ["left", 3]];
  [[31, 3.2, "#bcb4a2"], [26.5, 4, "#c2baa8"], [22.5, 5.2, "#c8c0ae"]].reduce((y, [wd, h, c]) => {
    wf.box({ x: SX, z: SZ, y, w: wd, d: wd, h, c, top: "#b0a898", dec: (fc, P) => SIDES.forEach(([sd, i]) => fc[i].dec = wing(c, P, sd, wd / 2, wd / 2, (Q, Ln) =>
      [Ln(-wd / 2, h - .25, wd / 2, h - .25, "#7a7262", .12, .5), Q(-1.6, 0, 1.6, h, mix(c, "#000000", .12))])) });
    return y + h; }, FY);
  const PY = FY + 12.4, GR = "#c6b8a2", GRD = "#8e8270";
  // base course with an arched door on each face
  wf.box({ x: SX, z: SZ, y: PY, w: 19.5, d: 19.5, h: 4.2, c: GR, dec: (fc, P) => SIDES.forEach(([sd, i]) => fc[i].dec = wing(GR, P, sd, 9.75, 9.75, (Q, Ln) => [
    Q(-1.5, 0, 1.5, 3.4, "#6a5e50"), Q(-1.15, 0, 1.15, 3.1, NIGHT ? "#e8c890" : "#3a3430", { glow: NIGHT }),
    ...[1.4, 2.8].map(v => Ln(-9.75, v, 9.75, v, GRD, .08, .4))])) });
  // the main block: rusticated corners, a loggia (four columns in a dark recess) and the disks band
  wf.box({ x: SX, z: SZ, y: PY + 4.2, w: 16.4, d: 16.4, h: 15.4, c: GR, dec: (fc, P) => SIDES.forEach(([sd, i]) => fc[i].dec = wing(GR, P, sd, 8.2, 8.2, (Q, Ln) => [
    ...[2, 4, 6, 8, 10, 12, 14].flatMap(v => [Ln(-8.2, v, -5.6, v, GRD, .08, .5), Ln(5.6, v, 8.2, v, GRD, .08, .5)]),
    Q(-4.2, 6.6, 4.2, 13.4, mix(GR, "#e8dcc8", .3)),
    Q(-3.4, 7.2, 3.4, 12.8, NIGHT ? "#5a4a3a" : "#5a5248"),
    ...[-2.6, -.9, .9, 2.6].map(u => Q(u - .32, 7.2, u + .32, 12.8, mix(GR, "#fff4e0", .2))),
    Q(-4.6, 6.2, 4.6, 6.8, mix(GR, "#e8dcc8", .2)),
    Q(-4.6, 13.2, 4.6, 13.9, mix(GR, "#e8dcc8", .2)),
    ...[-3.6, -1.2, 1.2, 3.6].map(u => Q(u - .6, 1.6, u + .6, 2.8, mix(GR, "#000000", .1)))])) });
  wf.box({ x: SX, z: SZ, y: PY + 19.6, w: 18, d: 18, h: 1.5, c: "#cfc2ac" });
  // the attic with the ring of ten disks per face, then the balcony parapet
  wf.box({ x: SX, z: SZ, y: PY + 21.1, w: 14.6, d: 14.6, h: 4.6, c: GR, dec: (fc, P) => SIDES.forEach(([sd, i]) => fc[i].dec = wing(GR, P, sd, 7.3, 7.3, (Q) =>
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => { const u = -6 + k * 1.333; return Q(u - .42, 2, u + .42, 2.84, mix(GR, "#fff8ec", .35)); }))) });
  wf.box({ x: SX, z: SZ, y: PY + 25.7, w: 15.4, d: 15.4, h: 1.3, c: "#cfc2ac", dec: (fc, P) => SIDES.forEach(([sd, i]) => fc[i].dec = wing(GR, P, sd, 7.7, 7.7, (Q) =>
    [-6, -4, -2, 0, 2, 4, 6].map(u => Q(u - .5, .2, u + .5, 1, mix(GR, "#000000", .25)))) ) });
  const TOPY = PY + 27;

  /* the statue: a painterly sprite in metres (u right, v up from the soles), lit from the left by day,
     floodlit from below at night. Drawn front-on: her raised right arm is on our left. */
  const statue = (sx, sy, k, fog) => {
    const P = (u, v) => [sx + u * k, sy - v * k], pl = pts => poly(pts.map(([u, v]) => P(u, v)));
    const hzS = c => mix(c, HZ, fog * (NIGHT ? .3 : .75));
    const C = NIGHT ? { dp: "#1c3a40", sh: "#3a7268", md: "#62ae9a", lt: "#9ee0c6", hi: "#dcfff0" } : { dp: "#2c5650", sh: "#477f72", md: "#6faa94", lt: "#98cdb6", hi: "#c8eedc" };
    Object.keys(C).forEach(key => C[key] = hzS(C[key]));
    const GOLD = NIGHT ? ["#ffb040", "#ffd870", "#fff4c0"] : ["#c08a2a", "#e8b848", "#fae49a"];
    let g = "";
    const body = [[-5.3, 0], [-5.0, 5], [-4.6, 11], [-4.4, 17], [-4.3, 22], [-4.1, 26.6], [-3.3, 28.8], [-1.6, 29.4], [0, 29.3], [1.7, 29.3], [3.4, 28.6], [4.4, 26.8], [4.7, 22.5], [4.9, 16], [5.2, 8], [5.4, 3], [5.1, 0], [3.6, .45], [2, .1], [.4, .5], [-1.4, .15], [-3.2, .5]];
    const arm = [[-4.1, 26.4], [-4.9, 30.5], [-5.5, 35], [-6.0, 39.4], [-6.4, 40.7], [-5.3, 41.3], [-4.8, 40.1], [-4.4, 36], [-3.8, 32], [-2.9, 29.2]];
    g += `<path d="${pl(body)}" fill="${C.md}"/>`;
    // shade on the side away from the sun (her left, our right) and a lit rim on our left
    g += `<path d="${pl([[1.6, 29.3], [3.4, 28.6], [4.4, 26.8], [4.7, 22.5], [4.9, 16], [5.2, 8], [5.4, 3], [5.1, 0], [3.6, .45], [2.4, .2], [2.7, 8], [2.3, 16], [2.0, 23], [1.9, 27]])}" fill="${C.sh}" opacity="${NIGHT ? .55 : .8}"/>`;
    g += `<path d="${pl([[-5.3, 0], [-5.0, 5], [-4.6, 11], [-4.4, 17], [-4.3, 22], [-4.1, 26.6], [-3.6, 26.4], [-3.8, 21], [-3.9, 14], [-4.3, 6], [-4.6, .3]])}" fill="${C.lt}" opacity=".8"/>`;
    // the robe's long folds: a lit ribbon and a shadow ribbon for each, bending a little at the hem
    [-3.6, -2.5, -1.4, -.4, .7, 1.8, 2.9, 3.9].forEach((u0, i) => { const b = (i % 2 ? .3 : -.25), top = 13 + (i % 3) * 1.5;
      g += `<path d="${pl([[u0 - .45, .4], [u0 - .2 + b, 6], [u0 - .05, top], [u0 + .1, top], [u0 + .05 + b, 6], [u0 - .1, .4]])}" fill="${u0 > 1.8 ? C.dp : C.sh}" opacity=".75"/>`;
      g += `<path d="${pl([[u0 - .95, .4], [u0 - .7 + b, 6], [u0 - .4, top - 1], [u0 - .25, top - 1], [u0 - .45 + b, 6], [u0 - .55, .4]])}" fill="${u0 > 1.8 ? C.md : C.hi}" opacity="${u0 > 1.8 ? .5 : .55}"/>`; });
    // the mantle: a swag from her left shoulder across to her right hip, with its own folds
    g += `<path d="${pl([[3.5, 28.5], [4.6, 24], [4.5, 17], [1.5, 14.6], [-1.6, 13.4], [-4.4, 14.6], [-4.35, 17.6], [-1.6, 17], [1.4, 19.2], [2.8, 22], [2.9, 26]])}" fill="${C.md}"/>`;
    g += `<path d="${pl([[4.6, 24], [4.5, 17], [1.5, 14.6], [-1.6, 13.4], [-4.4, 14.6], [-4.4, 15.4], [-1.5, 14.4], [1.4, 15.6], [3.7, 18]])}" fill="${C.dp}" opacity=".75"/>`;
    [[[3.2, 27.6], [2.2, 20.6], [-1.6, 15.8], [-4.2, 16.2]], [[3.9, 25.5], [3.0, 19.2], [-.6, 15.2], [-4.3, 15.4]], [[2.6, 26.5], [1.6, 21.4], [-1.8, 16.6]]].forEach((L, i) =>
      g += `<path d="M${L.map(([u, v]) => P(u, v).map(F).join(",")).join(" L")}" stroke="${i === 1 ? C.dp : C.lt}" stroke-width="${F(Math.max(.8, k * .3))}" fill="none" stroke-linejoin="round" opacity=".8"/>`);
    // the raised arm, its fallen sleeve, the torch with its gilded flame
    g += `<path d="${pl(arm)}" fill="${C.md}"/><path d="${pl([[-4.1, 26.4], [-4.9, 30.5], [-5.5, 35], [-6.0, 39.4], [-5.5, 39.2], [-5.0, 35], [-4.5, 30.6], [-3.7, 27]])}" fill="${C.lt}" opacity=".85"/>`;
    g += `<path d="${pl([[-4.3, 27], [-5.4, 30.6], [-5.2, 32.8], [-3.6, 31.4], [-2.9, 29.2]])}" fill="${C.md}"/><path d="${pl([[-3.6, 31.4], [-5.2, 32.8], [-5.0, 33.2], [-3.4, 31.9]])}" fill="${C.dp}" opacity=".7"/>`;
    g += `<path d="${pl([[-6.45, 40.8], [-5.45, 40.8], [-5.75, 43.2], [-6.65, 43.2]])}" fill="${C.sh}"/>`;
    g += `<path d="${pl([[-7.1, 43.1], [-5.3, 43.1], [-4.7, 44.4], [-7.7, 44.4]])}" fill="${C.md}"/><path d="${pl([[-5.9, 43.1], [-5.3, 43.1], [-4.7, 44.4], [-5.7, 44.4]])}" fill="${C.dp}" opacity=".7"/>`;
    g += `<path d="M${P(-7.8, 44.4).map(F).join(",")} L${P(-4.6, 44.4).map(F).join(",")}" stroke="${C.lt}" stroke-width="${F(Math.max(1, k * .35))}"/>`;
    if (NIGHT) g += `<circle cx="${F(P(-6.2, 45.2)[0])}" cy="${F(P(-6.2, 45.2)[1])}" r="${F(k * 7)}" fill="url(#slGlow)"/>`;
    g += `<path d="M${P(-7.5, 44.4).map(F).join(",")} Q${P(-7.6, 45.6).map(F).join(",")} ${P(-6.3, 46.6).map(F).join(",")} Q${P(-6.7, 45.6).map(F).join(",")} ${P(-6.0, 45.2).map(F).join(",")} Q${P(-5.4, 45.8).map(F).join(",")} ${P(-5.6, 46.2).map(F).join(",")} Q${P(-4.9, 45.4).map(F).join(",")} ${P(-4.9, 44.4).map(F).join(",")}Z" fill="${GOLD[1]}"/>`;
    g += `<path d="M${P(-7.2, 44.5).map(F).join(",")} Q${P(-7.2, 45.5).map(F).join(",")} ${P(-6.3, 46.4).map(F).join(",")} Q${P(-6.6, 45.4).map(F).join(",")} ${P(-6.3, 44.5).map(F).join(",")}Z" fill="${GOLD[2]}" opacity=".9"/>`;
    g += `<path d="M${P(-5.6, 44.5).map(F).join(",")} Q${P(-5.1, 45.2).map(F).join(",")} ${P(-5.0, 44.5).map(F).join(",")}Z" fill="${GOLD[0]}"/>`;
    // the left forearm and the tablet (JULY IV MDCCLXXVI), its thickness on the shaded side
    g += `<path d="${pl([[2.9, 26.5], [5.4, 25.8], [6.2, 19.0], [3.7, 18.6]])}" fill="${C.lt}"/>`;
    g += `<path d="${pl([[5.4, 25.8], [6.0, 25.5], [6.8, 19.1], [6.2, 19.0]])}" fill="${C.dp}"/>`;
    g += `<path d="${pl([[2.9, 26.5], [5.4, 25.8], [5.5, 25.2], [3.0, 25.9]])}" fill="${C.hi}" opacity=".7"/>`;
    g += `<path d="M${P(3.6, 23.6).map(F).join(",")} L${P(5.3, 23.3).map(F).join(",")}" stroke="${C.sh}" stroke-width="${F(Math.max(.6, k * .22))}" stroke-dasharray="${F(k * .3)} ${F(k * .18)}"/>`;
    g += `<path d="${pl([[4.3, 24.6], [4.85, 21.2], [4.4, 19.4], [3.3, 19.6], [3.4, 20.6], [3.9, 23.6]])}" fill="${C.md}"/><path d="${pl([[4.3, 24.6], [4.85, 21.2], [4.4, 19.4], [4.1, 20.4], [4.3, 23.4]])}" fill="${C.dp}" opacity=".7"/>`;
    // neck, head and the crown's seven rays
    g += `<path d="${pl([[-.85, 29.2], [1.0, 29.2], [.8, 30.7], [-.7, 30.7]])}" fill="${C.md}"/><path d="${pl([[.3, 29.2], [1.0, 29.2], [.8, 30.7], [.3, 30.7]])}" fill="${C.sh}" opacity=".8"/>`;
    const [hx, hy] = P(.05, 32.2);
    g += `<ellipse cx="${F(hx + k * .1)}" cy="${F(hy + k * .1)}" rx="${F(k * 1.7)}" ry="${F(k * 1.95)}" fill="${C.sh}"/>`;
    g += `<ellipse cx="${F(hx)}" cy="${F(hy)}" rx="${F(k * 1.4)}" ry="${F(k * 1.85)}" fill="${C.md}"/>`;
    g += `<path d="M${F(hx)},${F(hy - k * 1.85)} A${F(k * 1.4)},${F(k * 1.85)} 0 0 1 ${F(hx)},${F(hy + k * 1.85)} Q${F(hx + k * .5)},${F(hy)} ${F(hx)},${F(hy - k * 1.85)}Z" fill="${C.sh}" opacity=".75"/>`;
    g += `<ellipse cx="${F(hx - k * .55)}" cy="${F(hy - k * .3)}" rx="${F(k * .5)}" ry="${F(k * .9)}" fill="${C.lt}" opacity=".6"/>`;
    g += `<path d="M${F(hx - k * .7)},${F(hy - k * .35)} L${F(hx + k * .7)},${F(hy - k * .35)} M${F(hx + k * .12)},${F(hy - k * .3)} l${F(k * .12)},${F(k * .75)}" stroke="${C.dp}" stroke-width="${F(Math.max(.5, k * .14))}" opacity=".6"/>`;
    g += `<path d="M${F(hx - k * 1.55)},${F(hy - k * 1.05)} Q${F(hx)},${F(hy - k * 1.5)} ${F(hx + k * 1.55)},${F(hy - k * 1.05)} L${F(hx + k * 1.45)},${F(hy - k * 1.6)} Q${F(hx)},${F(hy - k * 2.05)} ${F(hx - k * 1.45)},${F(hy - k * 1.6)}Z" fill="${C.lt}"/>`;
    [[-78, 2.3], [-52, 2.6], [-26, 2.8], [0, 2.5], [26, 2.8], [52, 2.6], [78, 2.3]].forEach(([deg, L], i) => {
      const a = deg * Math.PI / 180, bx = Math.sin(a) * 1.35, by = 33.65 + Math.cos(a) * .35, tx = bx + Math.sin(a) * L, ty = by + Math.cos(a) * L, px = Math.cos(a) * .24, py = -Math.sin(a) * .24;
      g += `<path d="${pl([[bx - px, by - py], [tx, ty], [bx + px, by + py]])}" fill="${deg > 10 ? C.sh : C.lt}"/>`;
      g += `<path d="${pl([[bx, by], [tx, ty], [bx + px, by + py]])}" fill="${deg > 10 ? C.dp : C.md}" opacity=".7"/>`; });
    // the broken chain at her feet and the plinth she stands on
    g += `<path d="${pl([[-5.6, -.2], [5.6, -.2], [5.6, .5], [-5.6, .5]])}" fill="${C.dp}" opacity=".6"/>`;
    if (NIGHT) { g += `<path d="${pl(body)}" fill="url(#slTopShade)"/><path d="${pl(arm)}" fill="url(#slTopShade)"/>`; }
    return g; };
  wf.sprite({ x: SX, z: SZ, y: TOPY, bias: -14, fn: statue });

  /* buildings on the island: the museum (west), the brick staff buildings and the pier (east), the flag */
  const onG = o => ({ ...o, y: G, fy: -.3 });
  w.box({ x: -168, z: 432, yaw: -6, w: 46, d: 24, h: 7.5, c: "#b4ac9c", top: "#6a7a44", dec: (fc, P) => {
    fc[0].dec = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => { const u = -20 + k * 4; return { P: [P([u - 1.6, .6, -12.06]), P([u + 1.6, .6, -12.06]), P([u + 1.6, 6.2, -12.06]), P([u - 1.6, 6.2, -12.06])], c: NIGHT ? (k % 3 ? LAMP : "#3a4a5a") : "#4a6070", glow: NIGHT && k % 3 > 0 }; }); } });
  w.add([{ P: [[-191, 10.2, 420], [-145, 10.2, 420], [-145, 7.5, 444], [-191, 7.5, 444]].map(([x, y, z]) => [x, y, z]), c: "#6a7a44", two: true, back: "#4a5236" }]);
  w.house({ ...onG({ x: 104, z: 476, yaw: 8, w: 22, d: 12, h: 9.5, rh: 4.2 }), roof3: "hip", wall: "#9a4a36", roof: "#3a3c40", trim: "#e8dcc4", winGap: 2.4, rng: rl, chim: .2 });
  w.house({ ...onG({ x: 132, z: 430, yaw: 14, w: 14, d: 9, h: 6.4, rh: 3.2 }), roof3: "gable", wall: "#a8563e", roof: "#3e3a3a", trim: "#e8dcc4", rng: rl, chim: .7 });
  w.house({ ...onG({ x: 70, z: 520, yaw: 4, w: 18, d: 10, h: 6.2, rh: 3 }), roof3: "hip", wall: "#9a5040", roof: "#3a3a3e", trim: "#e8dcc4", rng: rl });
  // the ferry pier with its canopy, on pilings off the east end
  { const px = 168, pz = 352;
    for (let i = 0; i < 9; i++) [-1, 1].forEach(sd => w.cyl({ x: px + i * 4, z: pz + sd * 3.6, y: -.8, r0: .3, h: 3.4, n: 6, c: "#4a3e30", wet: true }));
    w.box({ x: px + 16, z: pz, y: 2.4, w: 36, d: 8, h: .4, c: "#7a6a58", top: "#9a8a74" });
    w.box({ x: px + 18, z: pz + 1, y: 2.8, w: 22, d: 5, h: 3.2, c: "#e8e4d8", top: "#4a5a6a" });
    w.box({ x: px + 18, z: pz + 1, y: 6, w: 24, d: 6.4, h: .4, c: "#3e4a58" }); }
  // the flag on a tall pole by the pier
  { const fx = 140, fz = 372, fh = 22;
    w.line([[fx, G, fz], [fx, G + fh, fz]], "#d8d8d0", .22, { min: 1 });
    w.sprite({ x: fx, z: fz - .2, y: G + fh - 3.6, bias: -1, fn: (px, py, k, fog) => { const L = 5.8 * k, Hh = 3.4 * k, C = c => T(mix(c, HZ, fog * .6)); let g = "";
      for (let i = 0; i < 7; i++) g += `<path d="M${F(px)},${F(py - Hh + i * Hh / 6.5)} q${F(L * .4)},${F(-k * .5)} ${F(L)},${F(k * .2)}" stroke="${C(i % 2 ? "#f4f0ea" : "#b8302a")}" stroke-width="${F(Hh / 7 + .3)}" fill="none"/>`;
      g += `<rect x="${F(px)}" y="${F(py - Hh - Hh / 13)}" width="${F(L * .42)}" height="${F(Hh * .54)}" fill="${C("#2a3a6a")}"/>`;
      return g; } }); }
  // promenade lamp posts
  for (let i = 0; i < NS; i += 5) { const [x0, z0] = shore[i], lx = IX + (x0 - IX) * .96, lz = IZ + (z0 - IZ) * .96;
    if (lz > IZ + 40) continue;
    w.line([[lx, G, lz], [lx, G + 4, lz]], "#2a2e30", .12, { min: .6 });
    if (NIGHT) w.sprite({ x: lx, z: lz - .2, y: G + 4.1, bias: -.5, fn: (px, py, k) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(k * 4.5)}" fill="url(#slGlow)" opacity=".8"/><circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(1, k * .35))}" fill="#fff4d0"/>` });
    else w.sprite({ x: lx, z: lz, y: G + 4, bias: -.5, fn: (px, py, k) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(.8, k * .3))}" fill="${T("#f0ece0")}"/>` }); }

  /* trees: London planes and oaks in autumn colour, from many lit leaf clusters */
  const PLANE = ["#4a3a14", "#6a521a", "#8a6a22", "#a8842a", "#c49e36", "#d8b448", "#e8ca62", "#f4e092"];
  const OAK = ["#4a2010", "#6a2e14", "#8a3e1a", "#a8501e", "#c46a26", "#d88a32", "#e8a848", "#f4c470"];
  const GRN = ["#283a18", "#34481e", "#465a24", "#5a6e2c", "#748234", "#8c9640", "#a8aa58", "#c4c27a"];
  const RED = ["#4a1412", "#6a1c16", "#8e261a", "#b0341e", "#cc4a24", "#e0662c", "#ee8a3a", "#f8b05a"];
  const leafTree = (x, y, h, n, RAMP, fog) => {
    let g = "";
    const cx = x, cy = y - h * .62, rx = h * .4, ry = h * .34, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl;
    const tc = T(mix("#3e3024", HZ, fog * .7)), tb = h * .045, tt = h * .025, ty = y - h * .55;
    g += `<ellipse cx="${F(x + h * .15)}" cy="${F(y + 1)}" rx="${F(h * .45)}" ry="${F(h * .05)}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} C${F(x - tb * .7)},${F(y - h * .25)} ${F(x - tt * 1.4)},${F(y - h * .4)} ${F(x - tt)},${F(ty)} L${F(x + tt)},${F(ty)} C${F(x + tt * 1.4)},${F(y - h * .4)} ${F(x + tb * .7)},${F(y - h * .25)} ${F(x + tb)},${F(y)}Z" fill="${tc}"/>`;
    [[-1, .5, .26, .18], [1, .52, .28, .16], [-1, .62, .18, .22]].forEach(([d, at, dx, dy]) => g += `<path d="M${F(x)},${F(y - h * at)} q${F(d * h * dx * .4)},${F(-h * dy * .6)} ${F(d * h * dx)},${F(-h * dy)}" stroke="${tc}" stroke-width="${F(Math.max(.8, h * .02))}" fill="none" stroke-linecap="round"/>`);
    const crown = [[cx, cy, rx, ry * .8], [cx - rx * .6, cy + ry * .2, rx * .55, ry * .6], [cx + rx * .6, cy + ry * .15, rx * .55, ry * .6], [cx - rx * .1, cy - ry * .55, rx * .55, ry * .5], [cx + rx * .3, cy - ry * .4, rx * .5, ry * .45], [cx, cy + ry * .45, rx * .85, ry * .42]];
    const inC = (px, py) => crown.some(([a, b, c, d]) => ((px - a) / c) ** 2 + ((py - b) / d) ** 2 < 1);
    const cs = [];
    for (let i = 0; i < n * 3 && cs.length < n; i++) { const px = cx - rx * 1.25 + r() * rx * 2.5, py = cy - ry * 1.3 + r() * ry * 2.3;
      if (!inC(px, py)) continue;
      const nx = (px - cx) / (rx * 1.2), ny = (py - cy) / (ry * 1.2), lt = (nx * ux + ny * uy) * .5 + .5, edge = Math.min(1, Math.hypot(nx, ny));
      cs.push([px, py, cl(lt * .72 + edge * .15 + (r() - .5) * .3), h * (.035 + r() * .03)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = "";
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${T(mix(RAMP[Math.floor(v * RAMP.length)], HZ, fog * .8))}"/>`);
    return g + `<g filter="url(#slLeafy)">${cg}</g>`; };
  const tok = [[-168, 432, 30], [104, 476, 16], [132, 430, 11], [70, 520, 12], [175, 352, 24]];
  let nt = 0;
  for (let k = 0; k < 1800 && nt < 185; k++) {
    const x = IX - IRX + r() * IRX * 2, z = IZ - IRZ + r() * IRZ * 2, q = qI(x, z);
    if (q > .72 || Math.hypot(x - SX, z - SZ) < 54) continue;
    if (z < SZ && Math.abs(x - SX) < 17) continue;              // keep the axis walk up to the pedestal open
    if (tok.some(([a, b, R]) => Math.hypot(x - a, z - b) < R)) continue;
    tok.push([x, z, 7]); nt++;
    const hM = 11 + r() * 8, RAMP = [PLANE, OAK, PLANE, GRN, RED, OAK][Math.floor(r() * 6)];
    w.sprite({ x, z, y: G - .2, fn: (sx, sy, kk, fog) => leafTree(sx, sy, hM * kk, Math.min(90, Math.round(hM * kk * 1.2)), RAMP, fog) }); }

  /* the ferry coming in on the right: three white decks, windows in rows, a flag at the stern */
  { const bx = 118, bz = 262, L = 42;
    w.box({ x: bx, z: bz, y: -.6, w: L, d: 10, h: 3.2, c: "#2a3a5a", wet: true, dec: (fc, P) => { fc[0].dec = [{ P: [P([-L / 2, 2.2, -5.06]), P([L / 2, 2.2, -5.06]), P([L / 2, 2.6, -5.06]), P([-L / 2, 2.6, -5.06])], c: "#c83a2a" }]; } });
    [[2.6, L - 2, 2.6], [5.2, L - 8, 2.5], [7.7, L - 18, 2.3]].forEach(([y, len, hh], i) => {
      w.box({ x: bx + i * 2.4, z: bz, y, w: len, d: 9 - i, h: hh, c: "#f2f0ea", top: "#d8d4cc", dec: (fc, P) => {
        const zf = -(9 - i) / 2 - .06, n = Math.floor(len / 2.2);
        fc[0].dec = Array.from({ length: n }, (_, k) => { const u = -len / 2 + 1 + k * (len - 2) / n, lt = NIGHT && rl() < .85;
          return { P: [P([u, .6, zf]), P([u + (len - 2) / n * .78, .6, zf]), P([u + (len - 2) / n * .78, hh - .5, zf]), P([u, hh - .5, zf])], c: lt ? LAMP : "#3a4a5e", glow: lt }; }); } }); });
    w.box({ x: bx - 9, z: bz, y: 10, w: 6, d: 6, h: 2, c: "#f2f0ea", dec: (fc, P) => { fc[0].dec = [{ P: [P([-2.6, .6, -3.06]), P([2.6, .6, -3.06]), P([2.6, 1.6, -3.06]), P([-2.6, 1.6, -3.06])], c: NIGHT ? LAMP : "#2a3a4e", glow: NIGHT }]; } });
    w.line([[bx - 9, 12, bz], [bx - 9, 15, bz]], "#3a3a40", .12);
    w.line([[bx + 19, 5.2, bz], [bx + 19, 9.5, bz]], "#3a3a40", .1);
    w.sprite({ x: bx + 19, z: bz - .2, y: 8.2, bias: -1, fn: (px, py, k) => `<path d="M${F(px)},${F(py - k * 1.2)} l${F(k * 2)},${F(k * .2)} l0,${F(k * 1.2)} l${F(-k * 2)},${F(-k * .2)}Z" fill="${T("#b8302a")}"/><rect x="${F(px)}" y="${F(py - k * 1.2)}" width="${F(k * .9)}" height="${F(k * .6)}" fill="${T("#2a3a6a")}"/>` });
    if (NIGHT) { w.cyl({ x: bx - 9, z: bz, y: 15, r0: .2, h: .3, n: 6, c: "#fff8e0", glow: true });
      w.sprite({ x: bx - L / 2, z: bz - 5, y: 3, bias: -2, fn: (px, py, k) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(k * .6)}" fill="#ff4a3a"/>` }); }
    // its bow wave and wake
    w.sprite({ x: bx - L / 2 - 1, z: bz - 5.5, y: 0, bias: -3, noRefl: true, fn: (px, py, k) => `<path d="M${F(px - k * 4)},${F(py)} q${F(k * 3)},${F(-k * .8)} ${F(k * 5)},${F(-k * .2)} l${F(k * 40)},0 q${F(k * 6)},${F(k * .2)} ${F(k * 20)},${F(k * .5)}" stroke="${NIGHT ? "#8a9ac8" : "#f4f8fa"}" stroke-width="${F(k * .5)}" fill="none" opacity=".7"/>` }); }

  /* the tug working on the left: red hull, white house, black fender */
  { const bx = -98, bz = 232;
    w.box({ x: bx, z: bz, y: -.5, w: 24, d: 8, h: 2.8, c: "#a8302a", wet: true, dec: (fc, P) => { fc[0].dec = [{ P: [P([-12, 1.9, -4.06]), P([12, 1.9, -4.06]), P([12, 2.3, -4.06]), P([-12, 2.3, -4.06])], c: "#1e1e22" }]; } });
    w.box({ x: bx - 6, z: bz, y: 2.3, w: 4, d: 8.4, h: .6, c: "#1e1e22" });
    w.box({ x: bx + 2, z: bz, y: 2.3, w: 10, d: 6, h: 2.4, c: "#f0ece4", dec: (fc, P) => { fc[0].dec = [-3.4, -1, 1.4].map(u => ({ P: [P([u, .9, -3.06]), P([u + 1.6, .9, -3.06]), P([u + 1.6, 1.8, -3.06]), P([u, 1.8, -3.06])], c: NIGHT ? LAMP : "#2a3a4a", glow: NIGHT })); } });
    w.box({ x: bx, z: bz, y: 4.7, w: 5, d: 5, h: 2.2, c: "#f0ece4", top: "#a8302a", dec: (fc, P) => { fc[0].dec = [{ P: [P([-2.2, .8, -2.56]), P([2.2, .8, -2.56]), P([2.2, 1.7, -2.56]), P([-2.2, 1.7, -2.56])], c: NIGHT ? LAMP : "#2a3a4a", glow: NIGHT }]; } });
    w.cyl({ x: bx + 5, z: bz, y: 4.7, r0: .7, h: 2.6, n: 10, c: "#1e1e22", top: "#2a2a2a" });
    w.box({ x: bx + 5, z: bz, y: 7.0, w: 1.6, d: 1.6, h: .4, c: "#a8302a" });
    w.line([[bx, 6.9, bz], [bx, 10, bz]], "#2a2a2e", .1);
    if (NIGHT) w.cyl({ x: bx, z: bz, y: 10, r0: .16, h: .25, n: 6, c: "#fff8e0", glow: true });
    w.sprite({ x: bx + 12, z: bz - 4.2, y: 0, bias: -3, noRefl: true, fn: (px, py, k) => `<path d="M${F(px)},${F(py)} q${F(k * 6)},${F(k * .3)} ${F(k * 30)},${F(k * .6)}" stroke="${NIGHT ? "#8a9ac8" : "#f4f8fa"}" stroke-width="${F(k * .45)}" fill="none" opacity=".6"/>` }); }

  /* ---- water: the mirrored worlds, then chop and the light paths ---- */
  let wtr = `<g opacity="${NIGHT ? .5 : .4}" filter="url(#slRipple)">${drawAll(true)}</g>`;
  for (let k = 0; k < 220; k++) { const y = WY + 6 + Math.pow(r(), .8) * (H - WY - 6), t = (y - WY) / (H - WY);
    wtr += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(26 + r() * 140 * (.4 + t))}" height="${F(1 + t * 1.6)}" rx="1" fill="${NIGHT ? (r() < .5 ? "#6a78a8" : "#0a1030") : (r() < .55 ? "#e6eff2" : "#2a4658")}" opacity="${F(.08 + r() * .14)}"/>`; }
  if (NIGHT) {   // streaks of light under the torch, the pedestal and the skyline
    wtr += `<g filter="url(#slRipple)">`;
    const [tx] = w.proj([SX - 6.2, TOPY + 45, SZ]);
    [[tx, "#ffd070", 1], [w.proj([SX, 0, SZ])[0], "#ffe0b0", .8], [1452, "#e8f0ff", .5], [1600, "#ffd890", .4], [1760, "#ffd890", .4], [1900, "#ffd890", .35], [690, "#ffd890", .35], [2060, "#ffffff", .3]].forEach(([x, c, o]) => {
      for (let y = WY + 4; y < H; y += 3 + (y - WY) * .03) { const t = (y - WY) / (H - WY), Lr = 6 + r() * (20 + t * 60);
        wtr += `<rect x="${F(x + (r() - .5) * (16 + t * 90) - Lr / 2)}" y="${F(y)}" width="${F(Lr)}" height="${F(1.2 + t * 1.8)}" rx="1" fill="${c}" opacity="${F(o * (.7 - t * .45) * (.5 + r() * .5))}"/>`; } });
    wtr += `</g>`;
  } else {       // the low sun's glitter off to the left
    wtr += `<g filter="url(#slRipple)">`;
    for (let y = WY + 4; y < H; y += 3 + (y - WY) * .025) { const t = (y - WY) / (H - WY), n = 2 + Math.floor(t * 5);
      for (let k = 0; k < n; k++) { const x = r() * 700 * (1 - t * .3), Lr = 8 + r() * (24 + t * 60);
        wtr += `<rect x="${F(x)}" y="${F(y)}" width="${F(Lr)}" height="${F(1.2 + t * 1.6)}" rx="1" fill="#fff6dc" opacity="${F((.55 - x / 1400) * (1 - t * .5))}"/>`; } }
    wtr += `</g>`;
  }
  s = s.slice(0, reflAt) + wtr + s.slice(reflAt);
  s += drawAll(false);

  /* night: floodlight bloom at the pedestal's foot and around the statue, the torch's halo */
  if (NIGHT) { const [bx, by] = w.proj([SX, FY + 8, SZ - 14]), [tx, ty] = w.proj([SX - 6.2, TOPY + 45.2, SZ]);
    s += `<circle cx="${F(bx)}" cy="${F(by)}" r="130" fill="url(#slFlood)" opacity=".7" style="mix-blend-mode:screen"/>`;
    s += `<circle cx="${F(tx)}" cy="${F(ty)}" r="60" fill="url(#slGlow)" opacity=".8"/><circle cx="${F(tx)}" cy="${F(ty)}" r="16" fill="#fff4c8" opacity=".35"/>`; }

  /* light + paper */
  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#slLight)" style="mix-blend-mode:soft-light" opacity=".8"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".08"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#slPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
