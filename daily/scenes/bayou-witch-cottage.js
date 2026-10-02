/* Bayou Witch Cottage: a crooked stilt cottage standing in a still cypress
   swamp hung with Spanish moss. Patched tin-and-shingle roof, a bent
   stovepipe, a porch with hanging lanterns, herb bundles and bottles, a
   pointed hat on a peg, a black cat on the rail; on the landing below, an
   iron cauldron bubbling green over a small fire, a pirogue tied up, crows on
   the ridge and a snag. Bald cypresses in russet and olive with knees in the
   water, palmettos and cattails in front, lily pads, low mist, and the whole
   thing mirrored in dark water. Day is a hazy green-and-violet swamp
   afternoon; opts.time === "night" is violet night under a pale moon with
   lit windows, lanterns, a strong cauldron glow and fireflies.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function bayouWitchCottageArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1666;
  const r = rng(seed), rs = rng(seed + 7);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 1050, LY = NIGHT ? 168 : 196, WY = 472;
  const T = c => NIGHT ? mix(mix(c, "#7a7090", .42), "#120a2a", .58) : c;
  const RIM = NIGHT ? "#d0d8f0" : "#fff0c4", LAMP = "#ffb84a", BREW = "#7dff8a";
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
  const wave = (ph, fr, am) => x => fr.reduce((s, f, i) => s + Math.sin(x / f + ph[i]) * am[i], 0);
  const ridgePath = (fn, close = H, x0 = 0, x1 = W) => { let d = `M${x0},${close} L${x0},${F(fn(x0))}`;
    for (let x = x0; x <= x1; x += 16) d += ` L${x},${F(fn(x))}`; return d + ` L${x1},${F(fn(x1))} L${x1},${close}Z`; };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
  const line = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L");
  const cl = v => Math.max(0, Math.min(.999, v));

  /* ------------------------------------------------------------ defs + sky */
  const SKY_H = NIGHT ? "#3a4a5a" : "#e2e4b4", HZ = NIGHT ? "#3a3c5a" : "#d4dcb8";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#0a0420"/><stop offset=".42" stop-color="#1c0e3e"/><stop offset=".78" stop-color="#34265a"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#6c6a9e"/><stop offset=".36" stop-color="#9a98b8"/><stop offset=".7" stop-color="#bcc8aa"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#eaffe8" stop-opacity=".55"/><stop offset=".14" stop-color="#c0e0d0" stop-opacity=".22"/><stop offset=".5" stop-color="#8a80b0" stop-opacity=".07"/><stop offset="1" stop-color="#8a80b0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fffbd8" stop-opacity=".9"/><stop offset=".18" stop-color="#f4f0b8" stop-opacity=".42"/><stop offset=".55" stop-color="#d8e0a0" stop-opacity=".12"/><stop offset="1" stop-color="#d8e0a0" stop-opacity="0"/>`;
  let s = `<defs id="bwDefs">
    <linearGradient id="bwSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="bwLight" cx="${LX}" cy="${LY}" r="820" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="bwHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".65"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="bwWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#2e2a4e"/><stop offset=".3" stop-color="#16122e"/><stop offset="1" stop-color="#07060f"/>`
      : `<stop offset="0" stop-color="#a6b096"/><stop offset=".3" stop-color="#5e6c50"/><stop offset="1" stop-color="#26301e"/>`}</linearGradient>
    <linearGradient id="bwTrunkL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T("#9a8a78")}"/><stop offset=".45" stop-color="${T("#6a5a4c")}"/><stop offset="1" stop-color="${T("#2e2620")}"/></linearGradient>
    <linearGradient id="bwBoard" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${RIM}" stop-opacity=".16"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
    <radialGradient id="bwGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ff9a40" stop-opacity=".3"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient>
    <radialGradient id="bwBrewG"><stop offset="0" stop-color="${BREW}" stop-opacity=".85"/><stop offset=".35" stop-color="#4ae080" stop-opacity=".3"/><stop offset="1" stop-color="#4ae080" stop-opacity="0"/></radialGradient>
    <radialGradient id="bwPane" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#fff4b8"/><stop offset=".6" stop-color="#ffc35a"/><stop offset="1" stop-color="#d8742a"/></radialGradient>
    <radialGradient id="bwPaneG" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#f0fff0"/><stop offset=".6" stop-color="#a8f0a0"/><stop offset="1" stop-color="#48a060"/></radialGradient>
    <radialGradient id="bwMoonD" cx=".42" cy=".4" r=".66"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef6e4"/><stop offset="1" stop-color="#c0d4c0"/></radialGradient>
    <filter id="bwLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="bwLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="bwMoss" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".05 .25" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="bwCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.4"/></filter>
    <filter id="bwFog" x="-20%" y="-100%" width="140%" height="300%"><feTurbulence type="fractalNoise" baseFrequency=".008 .03" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="60" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="9"/></filter>
    <filter id="bwRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .08" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.2"/></filter>
    <filter id="bwPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="bwSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="bwBlur3"><feGaussianBlur stdDeviation="3"/></filter>
    <clipPath id="bwWaterClip"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bwSky)"/>`;

  if (NIGHT) {
    for (let i = 0; i < 460; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 420, d = Math.hypot(x - LX, y - LY), big = rs() < .08, o = .2 + rs() * .6 * (1 - y / 470);
      if (d < 190) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .25 ? "#f0e0ff" : "#e8f0ff"}" opacity="${F(o)}"/>`; }
    const R = 50;
    s += `<rect width="${W}" height="${H}" fill="url(#bwLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 30}" fill="#d8ffe8" opacity=".08"/><circle cx="${LX}" cy="${LY}" r="${R + 12}" fill="#d8ffe8" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="url(#bwMoonD)"/>`;
    s += `<g filter="url(#bwBlur3)">`;
    [[-16, -12, 14, 10], [10, -18, 12, 8], [14, 6, 16, 11], [-8, 12, 13, 9], [-26, 6, 8, 7]].forEach(([dx, dy, a, b]) => s += `<path d="${blobP(LX + dx, LY + dy, a, b, 8, rs)}" fill="#9ab0a0" opacity=".38"/>`);
    s += `</g>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#bwLight)"/><circle cx="${LX}" cy="${LY}" r="60" fill="#fffbe0" opacity=".35"/><circle cx="${LX}" cy="${LY}" r="34" fill="#fffbe8" opacity=".95"/>`;
    s += `<g class="rays" opacity=".1" filter="url(#bwSoft)">`;
    for (let k = 0; k < 8; k++) { const a = .25 + k * .3, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .035) * L)},${F(LY + Math.sin(a - .035) * L)} L${F(LX + Math.cos(a + .035) * L)},${F(LY + Math.sin(a + .035) * L)}Z" fill="#fffbe0"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------------------------------------------------------- clouds */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#bwCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * (NIGHT ? .045 : .07) * (.6 + rs() * .7), w * (.05 + rs() * .05)]); }
    if (NIGHT) {
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#160c30"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .42)}" fill="#281a4c"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .18)}" fill="#5e5a88" opacity=".85"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .18)}" rx="${F(R * .42)}" ry="${F(R * .08)}" fill="#c8e0d8" opacity=".7"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .56)}" ry="${F(w * .04)}" fill="#8a88a8"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.4)}" ry="${F(R * .5)}" fill="#a8a6c0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.2)}" ry="${F(R * .48)}" fill="#d8d8e0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .2)}" rx="${F(R * .7)}" ry="${F(R * .26)}" fill="#f6f2dc"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(400, 150, 620, "drift1") + cloud(1500, 110, 700, "drift2") + cloud(2250, 200, 520, "drift3") + cloud(1060, 270, 360, "drift3") + cloud(2000, 290, 300, "drift2");
  /* crows in flight */
  s += `<g class="birds">`;
  [[1500, 196, 1], [1556, 172, .8], [1610, 214, .7], [700, 250, .6], [740, 232, .5]].forEach(([x, y, k]) =>
    s += `<path transform="translate(${x},${y}) scale(${k})" d="M0,0 C-8,-10 -18,-12 -30,-6 C-22,-4 -16,-2 -10,2 C-6,4 -2,6 0,8 C2,6 6,4 10,2 C16,-2 22,-6 32,-10 C18,-14 8,-10 0,0Z M-2,4 l-6,6 l8,-2Z" fill="${NIGHT ? "#06040c" : "#1e1a26"}"/>`);
  s += `</g>`;
  const cloudPart = s; s = DEFS;

  /* ------------------------------------------------------------ swamp kits */
  const OLIVE = ["#1c2618", "#28341c", "#384622", "#4c5a28", "#66702e", "#848a3a", "#a8a650", "#ccc678"];
  const RUSS = ["#2a1a12", "#3e2416", "#5a321a", "#7a4420", "#9a5a28", "#b87434", "#d4964a", "#ecbc6e"];
  const refl = (g, yb, op = .55) => `<g clip-path="url(#bwWaterClip)"><g transform="matrix(1,0,0,-1,0,${F(2 * yb)})" opacity="${op}" filter="url(#bwRipple)">${g}</g></g>`;
  /* Spanish moss hanging from a point: a soft tapering clump plus loose strands */
  const moss = (x, y, L, w) => {
    const C = ["#5a6650", "#7a8670", "#9eaa90", "#c4ccb4"].map(T), sd = x < LX ? -1 : 1;
    let g = `<path d="M${F(x - w)},${F(y)} Q${F(x - w * .8)},${F(y + L * .5)} ${F(x + (r() - .5) * w)},${F(y + L)} Q${F(x + w * .8)},${F(y + L * .5)} ${F(x + w)},${F(y)}Z" fill="${C[1]}" opacity=".85"/>`;
    g += `<path d="M${F(x + sd * w * .2)},${F(y)} Q${F(x + sd * w * .7)},${F(y + L * .4)} ${F(x + sd * w * .2)},${F(y + L * .8)}" stroke="${C[0]}" stroke-width="${F(w * .5)}" fill="none" opacity=".6"/>`;
    g += `<path d="M${F(x - sd * w * .4)},${F(y)} Q${F(x - sd * w * .6)},${F(y + L * .35)} ${F(x - sd * w * .2)},${F(y + L * .7)}" stroke="${C[3]}" stroke-width="${F(w * .3)}" fill="none" opacity=".7"/>`;
    for (let k = 0; k < 5; k++) { const sx = x + (r() - .5) * w * 2, l = L * (.5 + r() * .7);
      g += `<path d="M${F(sx)},${F(y)} q${F((r() - .5) * 6)},${F(l * .5)} ${F((r() - .5) * 8)},${F(l)}" stroke="${C[Math.floor(r() * 4)]}" stroke-width="${F(.8 + r())}" fill="none" opacity=".8"/>`; }
    return g; };
  /* bald cypress: flared buttress trunk, flat layered crown of many tufts, moss, knees */
  const cypress = (x, y, h, o = {}) => {
    const RAMP = o.ramp || OLIVE, sd = x < LX ? -1 : 1; let g = "";
    const w0 = h * .11, wt = h * .028, tt = y - h * .82;
    g += `<path d="M${F(x - w0)},${F(y)} C${F(x - w0 * .45)},${F(y - h * .04)} ${F(x - wt * 1.4)},${F(y - h * .2)} ${F(x - wt)},${F(y - h * .45)} L${F(x - wt * .7)},${F(tt)} L${F(x + wt * .7)},${F(tt)} L${F(x + wt)},${F(y - h * .45)} C${F(x + wt * 1.4)},${F(y - h * .2)} ${F(x + w0 * .45)},${F(y - h * .04)} ${F(x + w0)},${F(y)}Z" fill="url(#bwTrunkL)"/>`;
    for (let k = 0; k < 7; k++) { const u = (k + .5) / 7 - .5, bx = x + u * w0 * 1.6;
      g += `<path d="M${F(bx)},${F(y)} Q${F(x + u * wt * 2.4)},${F(y - h * .2)} ${F(x + u * wt * 1.4)},${F(y - h * .5)}" stroke="${T(u * sd < 0 ? "#b8a890" : "#2a221c")}" stroke-width="${F(Math.max(.8, h * .004))}" fill="none" opacity=".6"/>`; }
    // limbs
    const limbs = [];
    for (let k = 0; k < 6; k++) { const ly = y - h * (.55 + k * .07), dir = k % 2 ? 1 : -1, L = h * (.12 + r() * .14);
      const ex = x + dir * L, ey = ly - L * (.15 + r() * .3);
      limbs.push([ex, ey]); g += `<path d="M${F(x)},${F(ly)} Q${F(x + dir * L * .5)},${F(ly - L * .05)} ${F(ex)},${F(ey)}" stroke="${T("#3a3028")}" stroke-width="${F(Math.max(1.2, h * .012))}" fill="none" stroke-linecap="round"/>`; }
    // crown pads
    const pads = [[x, tt - h * .04, h * .2, h * .06]];
    limbs.forEach(([ex, ey]) => pads.push([ex, ey - h * .02, h * (.1 + r() * .07), h * (.05 + r() * .03)]));
    let cg = "";
    const tufts = [];
    pads.forEach(([px, py, rx, ry]) => { for (let k = 0; k < (o.n || 60); k++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()), tx = px + Math.cos(a) * rx * d, ty = py + Math.sin(a) * ry * d;
      const lit = (-(ty - py) / ry * .6 + (LX < tx ? -1 : 1) * (tx - px) / rx * .4) * .5 + .5; tufts.push([tx, ty, cl(lit * .8 + (r() - .5) * .35), h * (.012 + r() * .014)]); } });
    tufts.sort((a, b) => a[2] - b[2]);
    tufts.forEach(([tx, ty, v, R]) => cg += `<path d="${blobP(tx, ty, R * 1.5, R, 6)}" fill="${T(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    g += `<g filter="url(#bwLeafyS)">${cg}</g>`;
    // moss from pads and limbs
    let mg = "";
    pads.forEach(([px, py, rx, ry]) => { for (let k = 0; k < (o.moss ?? 4); k++) mg += moss(px + (r() - .5) * rx * 1.6, py + ry * .4, h * (.08 + r() * .14), h * (.008 + r() * .01)); });
    g += `<g filter="url(#bwMoss)">${mg}</g>`;
    // knees
    if (o.knees) for (let k = 0; k < o.knees; k++) { const kx = x + (r() < .5 ? -1 : 1) * (w0 * 1.2 + r() * h * .2), kh = h * (.02 + r() * .03), ky = y + r() * 6;
      g += `<path d="M${F(kx - kh * .5)},${F(ky)} Q${F(kx - kh * .2)},${F(ky - kh)} ${F(kx)},${F(ky - kh * 1.1)} Q${F(kx + kh * .3)},${F(ky - kh)} ${F(kx + kh * .5)},${F(ky)}Z" fill="${T("#5a4a3c")}"/><path d="M${F(kx - kh * .4 * -sd)},${F(ky)} Q${F(kx - kh * .1 * -sd)},${F(ky - kh)} ${F(kx)},${F(ky - kh * 1.1)}" stroke="${T("#a89878")}" stroke-width="1" fill="none"/>`; }
    return g; };
  /* small far cypress for the misty tree lines */
  const farCyp = (x, y, h, haze, hz) => {
    const c = T(mix(r() < .3 ? "#7a5a3a" : "#4a5634", hz, haze)), dk = mix(c, NIGHT ? "#08041a" : "#101a10", .3), lt = mix(c, RIM, .25);
    let g = `<path d="M${F(x - h * .07)},${F(y)} L${F(x - h * .015)},${F(y - h * .8)} L${F(x + h * .015)},${F(y - h * .8)} L${F(x + h * .07)},${F(y)}Z" fill="${dk}"/>`;
    g += `<path d="${blobP(x, y - h * .85, h * .22, h * .08, 7)}" fill="${dk}"/><path d="${blobP(x - h * .02, y - h * .9, h * .18, h * .06, 7)}" fill="${c}"/><path d="${blobP(x - h * .08, y - h * .93, h * .08, h * .03, 5)}" fill="${lt}"/>`;
    g += `<path d="${blobP(x + h * .12, y - h * .62, h * .12, h * .05, 6)}" fill="${c}"/><path d="${blobP(x - h * .12, y - h * .7, h * .1, h * .04, 6)}" fill="${c}"/>`;
    if (h > 40) g += `<path d="M${F(x + h * .1)},${F(y - h * .6)} v${F(h * .12)} M${F(x - h * .1)},${F(y - h * .68)} v${F(h * .14)} M${F(x + h * .04)},${F(y - h * .84)} v${F(h * .1)}" stroke="${T(mix("#9aa890", hz, haze))}" stroke-width="${F(h * .03)}" opacity=".7"/>`;
    return g; };

  /* ------------------------------------------------------- far swamp layers */
  const hzc = NIGHT ? "#3a3c5a" : "#d4dcb8";
  let far = "";
  const b1 = wave([1, 3, 5], [240, 100, 40], [4, 2, 1]);
  far += `<path d="${ridgePath(x => WY - 8 + b1(x), WY + 2)}" fill="${T(mix("#6a7458", hzc, .55))}"/>`;
  { const tr = []; for (let x = -20; x < W + 20; x += 8 + r() * 14) tr.push([x, WY - 6 + r() * 4, 34 + r() * 46]);
    tr.forEach(([x, y, h]) => far += farCyp(x, y, h, .62, hzc)); }
  far += `<rect x="0" y="${WY - 80}" width="${W}" height="90" fill="url(#bwHaze)"/>`;
  { const tr = []; for (let x = -20; x < W + 20; x += 18 + r() * 30) { if (x > 1000 && x < 1560 && r() < .6) continue; tr.push([x, WY - 2 + r() * 4, 70 + r() * 90]); }
    tr.forEach(([x, y, h]) => far += farCyp(x, y, h, .46, hzc)); }
  far += `<path d="${ridgePath(x => WY - 3 + b1(x * 1.7) * .5, WY + 2)}" fill="${T(mix("#4a5a3a", hzc, .3))}"/>`;
  far += `<rect x="0" y="${WY - 40}" width="${W}" height="50" fill="url(#bwHaze)" opacity=".7"/>`;
  s += far;

  /* the water, with the far shore mirrored */
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#bwWater)"/>`;
  s += refl(far, WY, .5);
  // light path on the water under the sun / moon
  s += `<g filter="url(#bwRipple)">`;
  for (let y = WY + 4; y < H; y += 3.4 + (y - WY) * .02) { const t = (y - WY) / (H - WY), w = 40 + t * 180, n = 1 + Math.floor(t * 4);
    for (let k = 0; k < n; k++) { const off = (r() * 2 - 1) * w * Math.pow(r(), .6), L = 10 + r() * (30 + t * 60);
      s += `<rect x="${F(LX + off - L / 2)}" y="${F(y)}" width="${F(L)}" height="${F(1.2 + t * 2)}" rx="1" fill="${NIGHT ? "#d8f0e0" : "#fffbe0"}" opacity="${F((.6 - Math.abs(off) / w * .4) * (1 - t * .5))}"/>`; } }
  s += `</g>`;
  for (let k = 0; k < 110; k++) { const y = WY + 6 + Math.pow(r(), .8) * (H - WY - 6), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(30 + r() * 140 * (.4 + t))}" height="${F(1 + t * 1.4)}" rx="1" fill="${NIGHT ? (r() < .5 ? "#7a70b0" : "#2a2448") : (r() < .5 ? "#dce4c8" : "#2a3424")}" opacity="${F(.08 + r() * .12)}"/>`; }

  /* mist over the far water */
  const fog = (y0, n, op, x0 = 0, x1 = W) => { let f = `<g filter="url(#bwFog)" opacity="${op}">`;
    for (let k = 0; k < n; k++) { const x = x0 + r() * (x1 - x0), w = 140 + r() * 320;
      f += `<ellipse cx="${F(x)}" cy="${F(y0 + (r() - .5) * 24)}" rx="${F(w)}" ry="${F(8 + r() * 12)}" fill="${NIGHT ? "#a8a0d8" : "#f0f2e4"}"/>`; }
    return f + `</g>`; };
  s += fog(WY + 4, 18, NIGHT ? .3 : .5);

  /* mid cypresses standing in the water, each with its reflection */
  const mids = [[90, 500, 230, RUSS], [250, 494, 180, OLIVE], [420, 506, 260, OLIVE], [610, 498, 200, RUSS], [760, 510, 240, OLIVE],
    [1850, 506, 230, OLIVE], [2010, 498, 190, RUSS], [2170, 508, 270, OLIVE], [2340, 500, 210, RUSS], [2500, 506, 250, OLIVE]];
  mids.forEach(([x, y, h, ramp]) => { const g = cypress(x, y, h, { ramp, n: 70, moss: 3, knees: 3 }); s += refl(g, y) + g; });
  s += fog(518, 14, NIGHT ? .26 : .4);

  /* --------------------------------------------------------- the cottage */
  const FY = 404, CX = 1300;              // porch floor, centre
  const WD = "#7a6a58", WD_L = "#a8967c", WD_D = "#4a3e34", ROOF = "#4a4a48", TIN = "#8a8a84";
  let ct = "";
  // stilts with cross bracing, standing in the water
  const stilts = [1150, 1206, 1262, 1330, 1396, 1452, 1484];
  stilts.forEach((x, i) => { const lean = (r() - .5) * 6, yb = 500 + (i % 2) * 4;
    ct += `<path d="M${x - 4},${FY} L${F(x - 5 + lean)},${yb} L${F(x + 5 + lean)},${yb} L${x + 4},${FY}Z" fill="${T(WD_D)}"/><path d="M${x - 4},${FY} L${F(x - 5 + lean)},${yb}" stroke="${T(WD_L)}" stroke-width="2"/>`;
    ct += `<path d="M${F(x - 6 + lean)},${yb - 18} l12,0" stroke="${T("#3a4a2a")}" stroke-width="5" opacity=".6"/>`; });
  for (let i = 0; i < stilts.length - 1; i++) { const a = stilts[i], b = stilts[i + 1];
    ct += `<path d="M${a},${FY + 8} L${b},${FY + 60} M${b},${FY + 8} L${a},${FY + 60}" stroke="${T("#3e342a")}" stroke-width="3"/>`; }
  // deck
  ct += `<path d="${poly([[1120, FY], [1500, FY - 4], [1504, FY + 8], [1118, FY + 12]])}" fill="${T(WD_D)}"/><path d="${poly([[1128, FY - 8], [1492, FY - 12], [1500, FY - 4], [1120, FY]])}" fill="${T(WD_L)}"/>`;
  for (let x = 1134; x < 1496; x += 12) ct += `<path d="M${x},${F(FY - 8 - (x - 1128) / 364 * 4)} l-3,8" stroke="${T(WD)}" stroke-width="1"/>`;
  // side wall (right, shaded, receding)
  ct += `<path d="${poly([[1404, FY - 8], [1446, FY - 18], [1446, 304], [1404, 296]])}" fill="${T(mix(WD, "#1a1420", .4))}"/>`;
  for (let x = 1408; x < 1446; x += 6) ct += `<path d="M${x},${F(FY - 9 - (x - 1404) * .24)} V${F(297 + (x - 1404) * .19)}" stroke="#000" stroke-width="1" opacity=".3"/>`;
  // front wall: vertical weathered boards of uneven tone
  ct += `<path d="${poly([[1186, FY - 8], [1404, FY - 8], [1404, 296], [1190, 302]])}" fill="${T(WD)}"/>`;
  for (let x = 1188; x < 1404; x += 9) { const c = mix(WD, r() < .5 ? "#3a3a2a" : "#c8b8a0", r() * .3);
    ct += `<path d="M${x},${FY - 8} L${x + .5},${F(302 - (x - 1188) * .027)} L${x + 8.5},${F(302 - (x + 8 - 1188) * .027)} L${x + 8},${FY - 8}Z" fill="${T(c)}"/><path d="M${x + 8.5},${FY - 8} V${F(302 - (x - 1180) * .027)}" stroke="${T("#2a2420")}" stroke-width="1"/>`; }
  for (let k = 0; k < 30; k++) ct += `<path d="M${F(1190 + r() * 210)},${F(304 + r() * 80)} v${F(4 + r() * 14)}" stroke="${T("#2a2420")}" stroke-width="1" opacity=".4"/>`;
  ct += `<path d="${poly([[1186, FY - 8], [1404, FY - 8], [1404, 296], [1190, 302]])}" fill="url(#bwBoard)"/>`;
  // green moss/lichen creeping up from the deck
  for (let k = 0; k < 60; k++) ct += `<path d="${blobP(1190 + r() * 214, FY - 10 - Math.pow(r(), 2) * 30, 3 + r() * 3, 2, 5)}" fill="${T(r() < .5 ? "#4a6a2e" : "#6a8a3a")}" opacity=".8"/>`;
  // door with a crooked frame, a hat on a peg and a broom
  ct += `<g transform="rotate(-2 1250 ${FY})"><rect x="1230" y="322" width="40" height="${FY - 330}" fill="${T("#2a1e18")}"/><rect x="1234" y="326" width="32" height="${FY - 336}" fill="${T("#5a3e2a")}"/>`;
  for (let k = 0; k < 4; k++) ct += `<path d="M${1236 + k * 8},326 v${FY - 336}" stroke="${T("#3a281c")}" stroke-width="1"/>`;
  ct += `<path d="M1236,340 h28 M1236,380 h28" stroke="${T("#2a1e18")}" stroke-width="3"/><circle cx="1260" cy="364" r="2.5" fill="${T("#c8a050")}"/>`;
  ct += `<path d="M1240,334 a10,8 0 0 1 20,0 v6 h-20Z" fill="${NIGHT ? "url(#bwPaneG)" : T("#1a1a20")}"/></g>`;
  ct += `<path d="M1280,342 l6,0" stroke="${T("#2a2420")}" stroke-width="2"/><path d="M1270,352 Q1283,350 1296,352 Q1290,346 1288,340 Q1286,326 1300,314 Q1282,320 1280,340 Q1276,346 1270,352Z" fill="${T("#2a2236")}"/><path d="M1270,352 Q1283,349 1296,352" stroke="${T("#6a4a8a")}" stroke-width="2" fill="none"/><path d="M1281,344 Q1284,326 1300,314" stroke="${RIM}" stroke-width=".9" fill="none" opacity=".5"/>`;
  ct += `<path d="M1212,${FY - 8} L1222,330" stroke="${T("#7a5a3a")}" stroke-width="3"/><path d="M1206,${FY - 8} Q1210,${FY - 30} 1214,${FY - 34} L1218,${FY - 32} Q1220,${FY - 24} 1222,${FY - 8}Z" fill="${T("#c8a050")}"/><path d="M1208,${FY - 14} q6,-4 12,0" stroke="${T("#7a5020")}" stroke-width="1.4" fill="none"/>`;
  // windows: a round porthole and a crooked square one with a shutter hanging off
  const lit = NIGHT;
  ct += `<circle cx="1330" cy="340" r="17" fill="${T("#3a3028")}"/><circle cx="1330" cy="340" r="13" fill="${lit ? "url(#bwPane)" : T("#1e2420")}"/><path d="M1317,340 h26 M1330,327 v26" stroke="${T("#3a3028")}" stroke-width="2"/>`;
  if (!lit) ct += `<path d="M1321,346 L1338,330 L1340,334 L1324,350Z" fill="${T("#9ab0a0")}" opacity=".35"/>`;
  ct += `<g transform="rotate(4 1378 344)"><rect x="1362" y="326" width="32" height="34" fill="${T("#3a3028")}"/><rect x="1366" y="330" width="24" height="26" fill="${lit ? "url(#bwPaneG)" : T("#1e2420")}"/><path d="M1378,330 v26 M1366,343 h24" stroke="${T("#3a3028")}" stroke-width="2"/></g>`;
  ct += `<path d="${poly([[1396, 330], [1410, 334], [1406, 366], [1392, 362]])}" fill="${T("#5a6a4a")}" transform="rotate(14 1396 330)"/>`;
  ct += `<rect x="1196" y="330" width="22" height="26" fill="${T("#3a3028")}"/><rect x="1199" y="333" width="16" height="20" fill="${lit ? "url(#bwPane)" : T("#1e2420")}"/>`;
  if (lit) ct += `<circle cx="1330" cy="340" r="44" fill="url(#bwGlow)" opacity=".55"/><circle cx="1378" cy="344" r="40" fill="url(#bwBrewG)" opacity=".4"/><circle cx="1207" cy="343" r="30" fill="url(#bwGlow)" opacity=".45"/>`;
  // bottles on the sill
  [[1364, 324, "#4a8a5a"], [1372, 322, "#6a4a8a"], [1384, 324, "#8a6a2a"]].forEach(([x, y, c]) => ct += `<rect x="${x - 2.5}" y="${y - 8}" width="5" height="8" rx="1.5" fill="${T(c)}"/><rect x="${x - 1}" y="${y - 11}" width="2" height="3" fill="${T(c)}"/><rect x="${x - 2}" y="${y - 7}" width="1.2" height="5" fill="${RIM}" opacity=".6"/>`);
  // porch railing
  for (let x = 1126; x < 1496; x += 30) { const y = FY - 8 - (x - 1128) / 364 * 4, tl = (r() - .5) * 6;
    ct += `<path d="M${x},${F(y)} l${F(tl * .3)},-30" stroke="${T(WD_D)}" stroke-width="4"/><path d="M${x - 1.5},${F(y)} l${F(tl * .3)},-30" stroke="${T(WD_L)}" stroke-width="1.2"/>`; }
  ct += `<path d="M1126,${FY - 36} L1222,${FY - 38} M1300,${FY - 40} L1496,${FY - 44}" stroke="${T(WD)}" stroke-width="4"/><path d="M1126,${FY - 37.5} L1222,${FY - 39.5} M1300,${FY - 41.5} L1496,${FY - 45.5}" stroke="${RIM}" stroke-width="1" opacity=".5"/>`;
  ct += `<path d="M1126,${FY - 22} L1222,${FY - 24} M1300,${FY - 24} L1496,${FY - 28}" stroke="${T(WD_D)}" stroke-width="3"/>`;
  // gourds and a jack-o'-lantern on the porch
  const gourd = (x, y, R, c, jack) => { let g = `<ellipse cx="${x}" cy="${F(y - R * .7)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="${T(mix(c, "#000000", .3))}"/><ellipse cx="${F(x - R * .2)}" cy="${F(y - R * .75)}" rx="${F(R * .7)}" ry="${F(R * .65)}" fill="${T(c)}"/><ellipse cx="${F(x - R * .45)}" cy="${F(y - R * 1)}" rx="${F(R * .25)}" ry="${F(R * .3)}" fill="${T(mix(c, "#ffffff", .4))}"/><path d="M${x},${F(y - R * 1.4)} l2,-4" stroke="${T("#4a5a22")}" stroke-width="2"/>`;
    if (jack) { const fc = NIGHT ? "#ffd060" : T("#2a1006"); if (NIGHT) g = `<circle cx="${x}" cy="${F(y - R * .7)}" r="${F(R * 3)}" fill="url(#bwGlow)" opacity=".7"/>` + g;
      g += `<path d="M${F(x - R * .55)},${F(y - R * .85)} l${F(R * .2)},${F(-R * .3)} l${F(R * .2)},${F(R * .3)}Z M${F(x + R * .15)},${F(y - R * .85)} l${F(R * .2)},${F(-R * .3)} l${F(R * .2)},${F(R * .3)}Z M${F(x - R * .6)},${F(y - R * .55)} Q${x},${F(y - R * .1)} ${F(x + R * .6)},${F(y - R * .55)} L${F(x + R * .3)},${F(y - R * .45)} L${x},${F(y - R * .55)} L${F(x - R * .3)},${F(y - R * .45)}Z" fill="${fc}"/>`; }
    return g; };
  ct += gourd(1440, FY - 12, 11, "#d8701e", true) + gourd(1466, FY - 12, 7, "#e8d8b0") + gourd(1150, FY - 9, 8, "#8a9a3a");
  // black cat on the rail
  ct += `<path d="M1470,${FY - 46} q-2,-14 4,-22 l1,-8 l4,6 l4,0 l4,-6 l1,8 q6,8 4,22 q8,2 12,-8" stroke="none" fill="${NIGHT ? "#06040c" : "#1a1620"}"/><path d="M1470,${FY - 46} q-2,-14 4,-22 l1,-8 l4,6 l4,0 l4,-6 l1,8 q6,8 4,22Z" fill="${NIGHT ? "#06040c" : "#1a1620"}"/><path d="M1490,${FY - 48} q10,2 12,-10 q1,-6 -2,-8" stroke="${NIGHT ? "#06040c" : "#1a1620"}" stroke-width="3" fill="none"/><circle cx="1477" cy="${FY - 66}" r="1.4" fill="#e8f060"/><circle cx="1484" cy="${FY - 66}" r="1.4" fill="#e8f060"/><path d="M1488,${FY - 62} q2,6 0,14" stroke="${RIM}" stroke-width="1" fill="none" opacity=".4"/>`;
  // roof: a sagging gable with patched shingles and tin sheets; front plane faces us
  const RF = [[1170, 306], [1420, 298], [1390, 236], [1300, 222], [1214, 232]];
  ct += `<path d="M1420,298 L1460,306 L1430,244 L1390,236Z" fill="${T(mix(ROOF, "#000000", .35))}"/>`;
  ct += `<path d="${poly(RF)}" fill="${T(ROOF)}"/>`;
  for (let k = 1; k < 9; k++) { const t = k / 9, yl = 306 - t * 74, yr = 298 - t * 62, xl = 1170 + t * 44, xr = 1420 - t * 30, sag = Math.sin(t * Math.PI) * 4;
    ct += `<path d="M${F(xl)},${F(yl)} Q${F((xl + xr) / 2)},${F((yl + yr) / 2 + 6 + sag)} ${F(xr)},${F(yr)}" stroke="${T("#2e2e2c")}" stroke-width="1.2" fill="none"/>`;
    for (let x = xl + (k % 2) * 6; x < xr - 6; x += 12 + r() * 6) ct += `<path d="M${F(x)},${F(yl + (yr - yl) * (x - xl) / (xr - xl) + 2)} l${F(1.5)},6" stroke="${T("#2e2e2c")}" stroke-width=".9" opacity=".8"/>`; }
  [[1236, 262, 46, 20, -4], [1336, 252, 40, 26, 3], [1280, 284, 36, 14, -2]].forEach(([x, y, w, h, a]) => {
    ct += `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" fill="${T(TIN)}"/><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h * .35}" fill="${RIM}" opacity=".3"/>`;
    for (let k = 1; k < w / 6; k++) ct += `<path d="M${x - w / 2 + k * 6},${y - h / 2} v${h}" stroke="${T("#5a5a54")}" stroke-width="1"/>`;
    ct += `<rect x="${x - w / 2}" y="${y + h / 2 - 5}" width="${w * .6}" height="5" fill="${T("#9a5a2a")}" opacity=".6"/></g>`; });
  ct += `<path d="M1170,306 L1214,232 L1300,222 L1390,236 L1420,298" stroke="${T("#2e2e2c")}" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M1170,305 L1214,231 L1300,221" stroke="${RIM}" stroke-width="1.6" fill="none" opacity=".6"/>`;
  ct += `<path d="M1166,308 Q1290,318 1424,300" stroke="${T("#3a3028")}" stroke-width="4" fill="none"/>`;
  for (let k = 0; k < 50; k++) { const t = r(), x = 1214 + t * 176, y = 232 - Math.sin(t * Math.PI) * 10 + r() * 12;
    ct += `<path d="${blobP(x, y, 3 + r() * 3, 2, 5)}" fill="${T(r() < .5 ? "#5a7a34" : "#7a9a44")}"/>`; }
  // crooked dormer with a round lit window
  ct += `<g transform="rotate(-6 1268 252)"><path d="${poly([[1252, 270], [1252, 246], [1268, 228], [1284, 246], [1284, 270]])}" fill="${T(WD)}"/><circle cx="1268" cy="254" r="8" fill="${T("#3a3028")}"/><circle cx="1268" cy="254" r="5.5" fill="${NIGHT ? "url(#bwPaneG)" : T("#1e2420")}"/><path d="M1246,250 L1268,224 L1290,250" stroke="${T("#2e2e2c")}" stroke-width="5" fill="none"/></g>`;
  if (NIGHT) ct += `<circle cx="1268" cy="254" r="26" fill="url(#bwBrewG)" opacity=".55"/>`;
  // bent stovepipe with a cap
  ct += `<path d="M1352,236 L1352,200 L1364,186 L1364,160" stroke="${T("#3a3a3c")}" stroke-width="10" fill="none" stroke-linejoin="round"/><path d="M1349,236 L1349,200 L1361,186 L1361,160" stroke="${T("#8a8a8c")}" stroke-width="2.5" fill="none" stroke-linejoin="round"/>`;
  ct += `<path d="M1352,152 L1364,144 L1376,152Z" fill="${T("#3a3a3c")}"/><path d="M1352,152 L1364,144" stroke="${RIM}" stroke-width="1" opacity=".6"/>`;
  // hanging lanterns, herb bundles along the eave, a line of jars to a post
  const lantern = (x, y, L) => { let g = `<path d="M${x},${y} v${L}" stroke="${T("#2a2420")}" stroke-width="1.2"/>`;
    if (NIGHT) g += `<circle cx="${x}" cy="${y + L + 8}" r="34" fill="url(#bwGlow)" opacity=".8"/>`;
    g += `<path d="M${x - 5},${y + L + 2} L${x + 5},${y + L + 2} L${x + 6},${y + L + 15} L${x - 6},${y + L + 15}Z" fill="${NIGHT ? LAMP : T("#c8a060")}" stroke="${T("#2a2420")}" stroke-width="1.6"/><path d="M${x - 6},${y + L + 2} L${x},${y + L - 3} L${x + 6},${y + L + 2}Z" fill="${T("#2a2420")}"/>`;
    if (!NIGHT) g += `<rect x="${x - 2}" y="${y + L + 5}" width="4" height="7" fill="#fff4c0" opacity=".6"/>`;
    return g; };
  ct += lantern(1196, 308, 18) + lantern(1312, 312, 12) + lantern(1414, 302, 22);
  [[1226, 310], [1252, 311], [1350, 310], [1374, 308]].forEach(([x, y], i) => { const c = ["#6a7a3a", "#8a6a3a", "#5a6a4a", "#9a8a4a"][i];
    ct += `<path d="M${x},${y} v6" stroke="${T("#2a2420")}" stroke-width="1"/><path d="M${x - 4},${y + 6} L${x + 4},${y + 6} L${x + 2},${y + 22} L${x - 2},${y + 22}Z" fill="${T(c)}"/><path d="M${x - 4},${y + 8} h8" stroke="${T("#a83a2a")}" stroke-width="1.5"/>`; });
  // smoke from the stovepipe, faintly green
  ct += `<g class="smoke" filter="url(#bwBlur3)" opacity="${NIGHT ? .5 : .55}">${[0, 1, 2, 3, 4, 5].map(k => `<circle cx="${F(1366 + k * 9 + Math.sin(k) * 8)}" cy="${F(134 - k * 18)}" r="${5 + k * 4}" fill="${NIGHT ? "#8ac8a0" : "#d8e4d0"}" opacity="${F(.55 - k * .08)}"/>`).join("")}</g>`;
  // crows on the ridge
  const crow = (x, y, k, f) => `<g transform="translate(${x},${y}) scale(${f * k},${k})"><path d="M-12,0 q2,-10 12,-12 q8,-2 12,4 l9,2 l-9,3 q-2,8 -10,9 l-4,0 l-4,10 l-1,-10 q-6,0 -10,-6Z" fill="${NIGHT ? "#06040c" : "#1a1620"}"/><path d="M-4,-8 q6,-4 12,-2" stroke="${RIM}" stroke-width="1" fill="none" opacity=".5"/><circle cx="7" cy="-8" r="1.2" fill="${NIGHT ? "#e8f060" : "#d8c890"}"/></g>`;
  ct += crow(1230, 224, .9, 1) + crow(1300, 214, 1, -1) + crow(1420, 290, .8, 1);

  /* landing at water level: steps, cauldron over a fire, pirogue */
  const LY2 = 488;
  ct += `<path d="${poly([[970, LY2], [1170, LY2 - 2], [1176, LY2 + 8], [966, LY2 + 10]])}" fill="${T(WD_D)}"/><path d="${poly([[980, LY2 - 8], [1164, LY2 - 10], [1170, LY2 - 2], [970, LY2]])}" fill="${T(WD_L)}"/>`;
  for (let x = 984; x < 1166; x += 11) ct += `<path d="M${x},${F(LY2 - 8)} l-3,8" stroke="${T(WD)}" stroke-width="1"/>`;
  [980, 1050, 1120, 1166].forEach(x => ct += `<rect x="${x - 3}" y="${LY2}" width="6" height="18" fill="${T(WD_D)}"/>`);
  for (let k = 0; k < 8; k++) { const t = k / 8, x = 1124 + t * 2 + (1 - t) * 0, y = LY2 - 10 - t * 76, sx = 1150 - t * 30;
    ct += `<path d="M${F(sx - 22)},${F(y)} L${F(sx + 14)},${F(y)}" stroke="${T(WD_L)}" stroke-width="4"/><path d="M${F(sx - 22)},${F(y + 2)} L${F(sx + 14)},${F(y + 2)}" stroke="${T(WD_D)}" stroke-width="1.5"/>`; }
  ct += `<path d="M1106,${LY2 - 10} L1136,${FY - 6} M1142,${LY2 - 10} L1164,${FY - 6}" stroke="${T(WD_D)}" stroke-width="4"/>`;
  // fire and cauldron
  { const x = 1040, y = LY2 - 10;
    if (NIGHT) ct += `<circle cx="${x}" cy="${y - 40}" r="120" fill="url(#bwBrewG)" opacity=".8"/>`;
    else ct += `<circle cx="${x}" cy="${y - 40}" r="70" fill="url(#bwBrewG)" opacity=".35"/>`;
    ct += `<path d="M${x - 24},${y} L${x + 20},${y - 8} M${x - 20},${y - 8} L${x + 24},${y}" stroke="${T("#5a3a22")}" stroke-width="6" stroke-linecap="round"/>`;
    ct += `<path d="M${x - 16},${y - 4} Q${x - 12},${y - 22} ${x - 4},${y - 26} Q${x - 2},${y - 16} ${x + 4},${y - 22} Q${x + 10},${y - 14} ${x + 16},${y - 4}Z" fill="#ff8a2a" opacity="${NIGHT ? 1 : .9}"/><path d="M${x - 8},${y - 4} Q${x - 4},${y - 16} ${x},${y - 18} Q${x + 4},${y - 12} ${x + 8},${y - 4}Z" fill="#ffd060"/>`;
    ct += `<path d="M${x - 30},${y - 18} L${x - 40},${y} M${x + 30},${y - 18} L${x + 40},${y}" stroke="${T("#2a2a2c")}" stroke-width="3"/>`;
    ct += `<path d="M${x - 32},${y - 52} Q${x - 34},${y - 18} ${x},${y - 14} Q${x + 34},${y - 18} ${x + 32},${y - 52}Z" fill="${T("#1e1e24")}"/><path d="M${x + 16},${y - 50} Q${x + 30},${y - 34} ${x + 22},${y - 20}" stroke="${NIGHT ? "#6ad070" : T("#5a5a68")}" stroke-width="3" fill="none" opacity=".7"/><path d="M${x - 30},${y - 44} Q${x - 28},${y - 26} ${x - 16},${y - 18}" stroke="${T("#3a3a44")}" stroke-width="4" fill="none" opacity=".7"/>`;
    ct += `<ellipse cx="${x}" cy="${y - 52}" rx="34" ry="8" fill="${T("#2a2a30")}"/><ellipse cx="${x}" cy="${y - 52}" rx="29" ry="6" fill="${NIGHT ? BREW : "#7ad87a"}"/><ellipse cx="${x - 6}" cy="${y - 53}" rx="14" ry="3" fill="#d8ffd0" opacity=".7"/>`;
    [[-12, -58, 4], [6, -60, 5], [16, -57, 3], [-2, -66, 3], [10, -74, 2.5], [-8, -80, 2]].forEach(([dx, dy, R]) => ct += `<circle cx="${x + dx}" cy="${y + dy}" r="${R}" fill="none" stroke="${NIGHT ? "#c8ffc0" : "#a8f0a0"}" stroke-width="1.4" opacity=".85"/>`);
    ct += `<g opacity="${NIGHT ? .55 : .4}" filter="url(#bwBlur3)">${[0, 1, 2, 3, 4].map(k => `<circle cx="${F(x + Math.sin(k * 1.3) * 10)}" cy="${F(y - 70 - k * 18)}" r="${8 + k * 4}" fill="${NIGHT ? "#7af0a0" : "#c8f0c8"}" opacity="${F(.6 - k * .1)}"/>`).join("")}</g>`;
    ct += `<path d="M${x - 34},${y - 52} a34,8 0 0 1 34,-8" stroke="${RIM}" stroke-width="1.6" fill="none" opacity=".6"/>`;
    // a long wooden paddle in the pot
    ct += `<path d="M${x + 10},${y - 54} L${x + 34},${y - 100}" stroke="${T("#8a6a42")}" stroke-width="3"/>`; }
  // pirogue tied to the landing
  ct += `<path d="M900,${LY2 + 18} Q910,${LY2 + 30} 960,${LY2 + 30} L1030,${LY2 + 28} Q1060,${LY2 + 24} 1064,${LY2 + 14} Q1000,${LY2 + 20} 900,${LY2 + 18}Z" fill="${T("#5a4030")}"/><path d="M900,${LY2 + 18} Q1000,${LY2 + 20} 1064,${LY2 + 14}" stroke="${T("#b08a60")}" stroke-width="2" fill="none"/><path d="M912,${LY2 + 20} Q1000,${LY2 + 24} 1052,${LY2 + 18}" stroke="${T("#2a1e18")}" stroke-width="3" fill="none"/>`;
  ct += `<path d="M1064,${LY2 + 14} Q1070,${LY2 + 4} 980,${LY2 + 4}" stroke="${T("#a89878")}" stroke-width="1" fill="none"/><path d="M930,${LY2 + 18} L1010,${LY2 + 6}" stroke="${T("#7a5a3a")}" stroke-width="2.5"/>`;
  s += refl(ct, 500) + ct;

  /* the two big cypresses that hold the cottage between them */
  const bigL = cypress(760, 536, 390, { ramp: RUSS, n: 130, moss: 7, knees: 6 });
  const bigR = cypress(1680, 540, 330, { ramp: OLIVE, n: 110, moss: 6, knees: 5 });
  s += refl(bigL, 536) + refl(bigR, 540) + bigL + bigR;
  // a dead snag with crows, right of the cottage
  { const x = 1560, y = 506; let g = `<path d="M${x - 8},${y} L${x - 3},${y - 150} L${x + 3},${y - 150} L${x + 8},${y}Z" fill="${T("#6a5e54")}"/><path d="M${x - 8},${y} L${x - 3},${y - 150}" stroke="${T("#b0a090")}" stroke-width="2"/>`;
    g += `<path d="M${x - 2},${y - 110} Q${x - 30},${y - 124} ${x - 52},${y - 120} M${x + 2},${y - 136} Q${x + 24},${y - 156} ${x + 44},${y - 150} M${x},${y - 150} q-6,-14 -2,-26" stroke="${T("#6a5e54")}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    g += crow(x - 40, y - 128, .8, 1) + crow(x + 34, y - 158, .85, -1) + crow(x - 2, y - 180, .7, 1);
    s += refl(g, y) + g; }
  // a string of glass jars from the porch out to the snag
  { let g = `<path d="M1500,312 Q1530,352 1560,360" stroke="${T("#2a2420")}" stroke-width="1" fill="none"/>`;
    for (let k = 1; k < 5; k++) { const t = k / 5, x = 1500 + t * 60, y = 312 + Math.sin(t * Math.PI * .8) * 34 + t * 18;
      if (NIGHT) g += `<circle cx="${F(x)}" cy="${F(y + 8)}" r="16" fill="url(#bwBrewG)" opacity=".75"/>`;
      g += `<rect x="${F(x - 3.5)}" y="${F(y + 2)}" width="7" height="10" rx="2" fill="${NIGHT ? "#c8ff9a" : T("#a8c8b8")}" opacity=".9"/><rect x="${F(x - 3.5)}" y="${F(y)}" width="7" height="2.5" fill="${T("#5a5a5a")}"/>`; }
    s += g; }

  /* foreground: lily pads, duckweed, cattails, palmettos */
  s += fog(560, 10, NIGHT ? .22 : .32, 300, 2300);
  for (let k = 0; k < 900; k++) { const y = 540 + Math.pow(r(), .7) * 180, x = r() * W, sc = .3 + (y - 520) / 200;
    if (Math.abs(x - 1300) < 320 && y < 640 && r() < .7) continue;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(1.5 * sc + r())}" ry="${F(.8 * sc)}" fill="${T(r() < .5 ? "#6a8a2e" : "#9ab040")}" opacity=".7"/>`; }
  const pad = (x, y, R) => { const a = r() * 6.28, sd = x < LX ? -1 : 1;
    let g = `<path d="M${x},${y} L${F(x + Math.cos(a) * R * 1.3)},${F(y + Math.sin(a) * R * .45)} A${F(R * 1.3)},${F(R * .45)} 0 1 1 ${F(x + Math.cos(a + .5) * R * 1.3)},${F(y + Math.sin(a + .5) * R * .45)}Z" fill="${T("#3e5a24")}"/>`;
    g += `<ellipse cx="${F(x - sd * R * .2)}" cy="${F(y - R * .06)}" rx="${F(R * .8)}" ry="${F(R * .24)}" fill="${T("#5a7a2e")}"/><ellipse cx="${F(x - sd * R * .4)}" cy="${F(y - R * .1)}" rx="${F(R * .35)}" ry="${F(R * .1)}" fill="${T("#8aa848")}"/>`;
    if (r() < .3) { const fx = x + R * .3, fy = y - R * .2, c = r() < .5 ? "#c8a0e8" : "#f4eef8";
      for (let k = 0; k < 7; k++) { const b = k / 7 * Math.PI - Math.PI; g += `<ellipse cx="${F(fx + Math.cos(b) * R * .22)}" cy="${F(fy + Math.sin(b) * R * .22)}" rx="${F(R * .14)}" ry="${F(R * .06)}" fill="${T(c)}" transform="rotate(${F(b * 57.3)} ${F(fx + Math.cos(b) * R * .22)} ${F(fy + Math.sin(b) * R * .22)})"/>`; }
      g += `<circle cx="${F(fx)}" cy="${F(fy - R * .05)}" r="${F(R * .08)}" fill="${T("#f0d040")}"/>`; }
    return g; };
  let lp = "";
  for (let k = 0; k < 70; k++) { const y = 560 + Math.pow(r(), .8) * 150, x = r() * W; if (Math.abs(x - 1300) < 260 && y < 620) continue; lp += pad(x, y, 6 + (y - 540) / 180 * 22); }
  s += lp;
  const reeds = (x0, x1, yb, hmax) => { let g = "";
    for (let x = x0; x < x1; x += 3 + r() * 6) { const y = yb + r() * 24, h = 30 + r() * hmax, lean = (r() - .5) * 18;
      g += `<path d="M${F(x)},${F(y)} q${F(lean * .3)},${F(-h * .5)} ${F(lean)},${F(-h)}" stroke="${T(r() < .3 ? "#a8a858" : r() < .5 ? "#5a6a2a" : "#3a4a20")}" stroke-width="${F(1.4 + r() * 1.2)}" fill="none"/>`;
      if (r() < .16) g += `<rect x="${F(x + lean * .85 - 3.5)}" y="${F(y - h * .92)}" width="7" height="20" rx="3.5" fill="${T("#5a3420")}"/><rect x="${F(x + lean * .85 - 2.5)}" y="${F(y - h * .92 + 2)}" width="2" height="15" rx="1" fill="${T("#9a6a4a")}" opacity=".8"/>`; }
    return g; };
  s += reeds(0, 520, 640, 110) + reeds(2060, 2560, 640, 110) + reeds(700, 860, 560, 60) + reeds(1760, 1900, 566, 60);
  const palmetto = (x, y, R) => { let g = "";
    for (let f = 0; f < 5; f++) { const ca = -Math.PI / 2 + (f - 2) * .5 + (r() - .5) * .2, L = R * (.8 + r() * .3), cx = x + Math.cos(ca) * L * .55, cy = y + Math.sin(ca) * L * .55;
      g += `<path d="M${x},${y} Q${F(x + Math.cos(ca) * L * .3)},${F(y + Math.sin(ca) * L * .3 - 6)} ${F(cx)},${F(cy)}" stroke="${T("#4a5a2a")}" stroke-width="2" fill="none"/>`;
      for (let k = 0; k < 16; k++) { const b = ca - 1.2 + k / 15 * 2.4, l = L * .55 * (.7 + r() * .3), lit = cl(Math.cos(b) * (x < LX ? -1 : 1) * .3 + .5 + (r() - .5) * .3);
        g += `<path d="M${F(cx)},${F(cy)} L${F(cx + Math.cos(b - .05) * l)},${F(cy + Math.sin(b - .05) * l)} L${F(cx + Math.cos(b) * l * 1.08)},${F(cy + Math.sin(b) * l * 1.08)} L${F(cx + Math.cos(b + .05) * l)},${F(cy + Math.sin(b + .05) * l)}Z" fill="${T(["#2a3a1a", "#3e5222", "#56702a", "#7a9038", "#a8b058"][Math.floor(lit * 5)])}"/>`; } }
    return g; };
  s += `<g filter="url(#bwLeafyS)">${palmetto(120, 720, 220) + palmetto(330, 735, 160) + palmetto(2440, 720, 230) + palmetto(2240, 738, 150)}</g>`;

  /* fireflies (and by day a few dragonflies) */
  if (NIGHT) { const fr = rng(seed + 13);
    for (let k = 0; k < 70; k++) { const x = 600 + fr() * 1500, y = 300 + fr() * 300;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="7" fill="url(#bwBrewG)" opacity=".6"/><circle cx="${F(x)}" cy="${F(y)}" r="1.6" fill="#f0ffa0"/>`; } }
  else [[760, 560], [1720, 600], [1900, 580]].forEach(([x, y]) => s += `<path d="M${x - 8},${y} h16" stroke="#2a4a6a" stroke-width="2"/><ellipse cx="${x - 2}" cy="${y - 4}" rx="6" ry="2" fill="#c8e0f0" opacity=".7" transform="rotate(-20 ${x - 2} ${y - 4})"/><ellipse cx="${x + 2}" cy="${y - 4}" rx="6" ry="2" fill="#c8e0f0" opacity=".7" transform="rotate(20 ${x + 2} ${y - 4})"/>`);

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#bwLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#100828" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#bwPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
