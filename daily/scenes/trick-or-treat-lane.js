/* Trick-or-Treat Lane: a small-town street of old frame houses on the inside
   of a bend, seen from across the road. The curved sidewalk and street sweep
   round in front; the corner house (a front-gabled Victorian with a
   wraparound porch) faces us in the middle and its neighbours recede left
   and right, smaller and hazier. Jack-o'-lanterns on every porch step,
   orange string lights along the porch eaves, paper bats on threads, leaf
   piles on the lawns, big maples on the tree lawn, cast-iron street lamps,
   a picket fence, a far steeple and water tower over the rooftops. No people.
   Day is a crisp blue late-October afternoon; opts.time === "night" is
   trick-or-treat night: moon and stars, glowing porches, lit windows, lamp
   pools on the sidewalk and every pumpkin lit.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function trickOrTreatLaneArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1031;
  const r = rng(seed), rs = rng(seed + 7);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 840, LY = 200, CXS = 1280;
  const T = c => NIGHT ? mix(mix(c, "#707890", .42), "#0a1230", .6) : c;
  const RIM = NIGHT ? "#c4d0f0" : "#fff2c8", LAMP = "#ffc35a";
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
  const band = (fa, fb) => { let d = `M0,${F(fa(0))}`; for (let x = 16; x <= W; x += 16) d += ` L${x},${F(fa(x))}`; for (let x = W; x >= 0; x -= 16) d += ` L${x},${F(fb(x))}`; return d + "Z"; };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
  const line = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L");
  const cl = v => Math.max(0, Math.min(.999, v));

  /* the bend: arcs that rise toward both edges, so the street curves away from us */
  const K = x => Math.pow(Math.min(1, Math.abs(x - CXS) / 1280), 1.5);
  const lawnTop = x => 470 - 40 * K(x);
  const walkB = x => 562 - 104 * K(x), walkF = x => 584 - 118 * K(x), curb = x => 604 - 130 * K(x);

  /* ------------------------------------------------------------ defs + sky */
  const SKY_H = NIGHT ? "#3a4670" : "#f0dcb4", HZ = NIGHT ? "#34406a" : "#e8dcc4";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#050a20"/><stop offset=".42" stop-color="#101a44"/><stop offset=".78" stop-color="#2a3466"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#3a78c0"/><stop offset=".42" stop-color="#7fb0dc"/><stop offset=".76" stop-color="#d4dcd4"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e6ecff" stop-opacity=".5"/><stop offset=".15" stop-color="#b8c4f0" stop-opacity=".2"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".06"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d6" stop-opacity=".9"/><stop offset=".18" stop-color="#ffefc0" stop-opacity=".45"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/>`;
  let s = `<defs id="ttDefs">
    <linearGradient id="ttSky" x1="0" y1="0" x2="0" y2="460" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="ttLight" cx="${LX}" cy="${LY}" r="820" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="ttHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="ttLawn" x1="0" y1="430" x2="0" y2="600" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#8a9a4a")}"/><stop offset="1" stop-color="${T("#6a7a36")}"/></linearGradient>
    <linearGradient id="ttRoad" x1="0" y1="460" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#8a8c94")}"/><stop offset=".5" stop-color="${T("#5e626c")}"/><stop offset="1" stop-color="${T("#3e424a")}"/></linearGradient>
    <linearGradient id="ttWalk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T("#d8d2c4")}"/><stop offset="1" stop-color="${T("#b8b0a2")}"/></linearGradient>
    <linearGradient id="ttTrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T("#7a5238")}"/><stop offset=".45" stop-color="${T("#4a2e1e")}"/><stop offset="1" stop-color="${T("#2a1a10")}"/></linearGradient>
    <linearGradient id="ttFacade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${RIM}" stop-opacity=".16"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
    <radialGradient id="ttGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffa848" stop-opacity=".3"/><stop offset="1" stop-color="#ffa848" stop-opacity="0"/></radialGradient>
    <radialGradient id="ttPool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd890" stop-opacity=".55"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>
    <radialGradient id="ttPane" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#ffc45a"/><stop offset="1" stop-color="#d8782a"/></radialGradient>
    <radialGradient id="ttMoonD" cx=".42" cy=".4" r=".66"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f0f2fa"/><stop offset="1" stop-color="#c8d0e4"/></radialGradient>
    <filter id="ttLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ttLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ttCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="ttPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="ttSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="ttBlur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#ttSky)"/>`;

  if (NIGHT) {
    for (let i = 0; i < 420; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 400, d = Math.hypot(x - LX, y - LY), big = rs() < .08, o = .2 + rs() * .6 * (1 - y / 460);
      if (d < 180) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 44;
    s += `<rect width="${W}" height="${H}" fill="url(#ttLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 18}" fill="#d8e0ff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="url(#ttMoonD)"/>`;
    s += `<g filter="url(#ttBlur3)">`;
    [[-14, -10, 12, 9], [10, -16, 10, 7], [12, 6, 14, 10], [-6, 12, 12, 8], [-22, 4, 7, 6]].forEach(([dx, dy, a, b]) => s += `<path d="${blobP(LX + dx, LY + dy, a, b, 8, rs)}" fill="#9aa4bc" opacity=".35"/>`);
    s += `</g>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#ttLight)"/><circle cx="${LX}" cy="${LY}" r="38" fill="#fffbe8"/>`;
    s += `<g class="rays" opacity=".1" filter="url(#ttSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .3 + k * .32, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------------------------------------------------------- clouds */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#ttCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#141c40"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#222c58"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="#56649a" opacity=".8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .16)}" rx="${F(R * .4)}" ry="${F(R * .07)}" fill="#aab8e4" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .14 * (.6 + rs() * .7), w * (.085 + rs() * .065)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .07)}" fill="#b9c8dc"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#c6d2e2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .85)}" fill="#f7f8fb"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .35)}" rx="${F(R * .6)}" ry="${F(R * .4)}" fill="#fffdf2"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(380, 150, 480, "drift1") + cloud(1560, 96, 520, "drift2") + cloud(2250, 190, 420, "drift3") + cloud(1040, 250, 260, "drift3");
  s += `<g class="bats">`;
  [[1180, 120, .7], [1214, 100, .55], [1250, 128, .5], [1880, 250, .45], [1910, 236, .4]].forEach(([x, y, k]) =>
    s += `<path transform="translate(${x},${y}) scale(${k})" d="M0,2 C-6,-4 -14,-10 -30,-8 C-24,-4 -26,0 -22,4 C-18,1 -14,4 -12,7 C-8,4 -4,6 0,8 C4,6 8,4 12,7 C14,4 18,1 22,4 C26,0 24,-4 30,-8 C14,-10 6,-4 0,2Z" fill="${NIGHT ? "#04060e" : "#2a2430"}"/>`);
  s += `</g>`;
  const cloudPart = s; s = DEFS;

  /* ------------------------------------------------------------- kits */
  const AUT = ["#c8452a", "#d85a26", "#e0702a", "#e98a2c", "#eaa032", "#f2c648", "#a13a2a", "#8a9a3c", "#6f8a36"];
  const leafTree = (x, y, h, n, RAMP, o = {}) => {
    let g = ""; const cx = x, cy = y - h * .62, rx = h * .42, ry = h * .34, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl;
    g += `<ellipse cx="${F(x - ux * h * .25)}" cy="${F(y + 2)}" rx="${F(h * .55)}" ry="${F(h * .05)}" fill="#000" opacity=".22"/>`;
    const tb = h * .055, tt = h * .025;
    g += `<path d="M${F(x - tb)},${F(y)} C${F(x - tb * .7)},${F(y - h * .25)} ${F(x - tt * 1.4)},${F(y - h * .4)} ${F(x - tt)},${F(y - h * .56)} L${F(x + tt)},${F(y - h * .56)} C${F(x + tt * 1.4)},${F(y - h * .4)} ${F(x + tb * .7)},${F(y - h * .25)} ${F(x + tb)},${F(y)}Z" fill="url(#ttTrunk)"/>`;
    [[-1, .5, .26, .16], [1, .52, .28, .15], [-1, .6, .18, .22], [1, .62, .2, .22], [0, .62, .03, .26]].forEach(([d, at, dx, dy]) => g += `<path d="M${F(x)},${F(y - h * at)} Q${F(x + d * h * dx * .4)},${F(y - h * at - h * dy * .6)} ${F(x + d * h * dx)},${F(y - h * at - h * dy)}" stroke="${T("#3a2416")}" stroke-width="${F(h * .025)}" fill="none" stroke-linecap="round"/>`);
    const cr = [[cx, cy, rx, ry * .8], [cx - rx * .62, cy + ry * .2, rx * .55, ry * .6], [cx + rx * .62, cy + ry * .15, rx * .58, ry * .62], [cx - rx * .1, cy - ry * .55, rx * .55, ry * .5], [cx + rx * .3, cy - ry * .42, rx * .5, ry * .45], [cx, cy + ry * .45, rx * .85, ry * .42]];
    const inC = (px, py) => cr.some(([a, b, c, d]) => ((px - a) / c) ** 2 + ((py - b) / d) ** 2 < 1);
    const c = [];
    for (let i = 0; i < n * 3 && c.length < n; i++) { const px = cx - rx * 1.25 + r() * rx * 2.5, py = cy - ry * 1.3 + r() * ry * 2.3;
      if (!inC(px, py)) continue;
      const nx = (px - cx) / (rx * 1.2), ny = (py - cy) / (ry * 1.2), lit = (nx * ux + ny * uy) * .5 + .5, e = Math.min(1, Math.hypot(nx, ny));
      c.push([px, py, cl(lit * .72 + e * .15 + (r() - .5) * .3), h * (.026 + r() * .024)]); }
    c.sort((a, b) => a[2] - b[2]);
    let cg = ""; c.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${T(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    g += `<g filter="url(#ttLeafy)">${cg}</g>`;
    if (o.ghost) { const gx = x + h * .22, gy = y - h * .42;     // a sheet-ghost decoration hanging from a limb
      g += `<path d="M${F(gx)},${F(gy - 40)} v14" stroke="${T("#eeeeee")}" stroke-width="1"/><path d="M${F(gx - 12)},${F(gy)} Q${F(gx - 14)},${F(gy - 28)} ${F(gx)},${F(gy - 28)} Q${F(gx + 14)},${F(gy - 28)} ${F(gx + 12)},${F(gy)} L${F(gx + 16)},${F(gy + 22)} L${F(gx + 8)},${F(gy + 16)} L${F(gx + 2)},${F(gy + 24)} L${F(gx - 4)},${F(gy + 16)} L${F(gx - 10)},${F(gy + 24)} L${F(gx - 16)},${F(gy + 20)}Z" fill="${NIGHT ? "#c8d0e8" : "#f6f6f2"}"/><path d="M${F(gx + 4)},${F(gy - 24)} Q${F(gx + 12)},${F(gy - 20)} ${F(gx + 12)},${F(gy)} L${F(gx + 16)},${F(gy + 22)} L${F(gx + 8)},${F(gy + 16)}Z" fill="#000" opacity=".12"/><ellipse cx="${F(gx - 5)}" cy="${F(gy - 16)}" rx="2.2" ry="3.2" fill="#2a2a30"/><ellipse cx="${F(gx + 4)}" cy="${F(gy - 16)}" rx="2.2" ry="3.2" fill="#2a2a30"/><ellipse cx="${F(gx)}" cy="${F(gy - 8)}" rx="2.5" ry="3" fill="#2a2a30"/>`; }
    return g; };
  const jack = (x, y, R, lit) => {
    const sd = x < LX ? 1 : -1, rx = R * 1.15, ry = R * .82, cy = y - ry;
    let g = `<ellipse cx="${F(x + sd * R * .3)}" cy="${F(y + R * .05)}" rx="${F(R * 1.3)}" ry="${F(R * .22)}" fill="#000" opacity=".28"/>`;
    if (lit) g += `<circle cx="${F(x)}" cy="${F(cy)}" r="${F(R * 3.4)}" fill="url(#ttGlow)" opacity=".75"/>`;
    g += `<ellipse cx="${F(x)}" cy="${F(cy)}" rx="${F(rx)}" ry="${F(ry)}" fill="${T("#b04a16")}"/><ellipse cx="${F(x - sd * rx * .1)}" cy="${F(cy)}" rx="${F(rx * .62)}" ry="${F(ry)}" fill="${T("#dc6a1c")}"/><ellipse cx="${F(x - sd * rx * .42)}" cy="${F(cy - ry * .3)}" rx="${F(rx * .18)}" ry="${F(ry * .34)}" fill="${T("#f6a24a")}"/>`;
    g += `<path d="M${F(x - rx * .35)},${F(cy - ry * .95)} Q${F(x - rx * .5)},${F(cy)} ${F(x - rx * .35)},${F(cy + ry * .95)} M${F(x + rx * .35)},${F(cy - ry * .95)} Q${F(x + rx * .5)},${F(cy)} ${F(x + rx * .35)},${F(cy + ry * .95)}" stroke="${T("#8a3410")}" stroke-width="${F(Math.max(.6, R * .06))}" fill="none" opacity=".6"/>`;
    g += `<path d="M${F(x)},${F(cy - ry * .9)} l${F(R * .12)},${F(-R * .38)}" stroke="${T("#4a5a22")}" stroke-width="${F(Math.max(1, R * .18))}" stroke-linecap="round"/>`;
    const fc = lit ? "#ffd868" : T("#3a1606");
    g += `<path d="M${F(x - rx * .52)},${F(cy - ry * .08)} l${F(rx * .17)},${F(-ry * .36)} l${F(rx * .17)},${F(ry * .36)}Z M${F(x + rx * .18)},${F(cy - ry * .08)} l${F(rx * .17)},${F(-ry * .36)} l${F(rx * .17)},${F(ry * .36)}Z" fill="${fc}"/>`;
    g += `<path d="M${F(x - rx * .56)},${F(cy + ry * .16)} Q${F(x)},${F(cy + ry * .8)} ${F(x + rx * .56)},${F(cy + ry * .16)} L${F(x + rx * .36)},${F(cy + ry * .3)} L${F(x + rx * .24)},${F(cy + ry * .18)} L${F(x + rx * .12)},${F(cy + ry * .32)} L${F(x)},${F(cy + ry * .22)} L${F(x - rx * .12)},${F(cy + ry * .32)} L${F(x - rx * .24)},${F(cy + ry * .18)} L${F(x - rx * .36)},${F(cy + ry * .3)}Z" fill="${fc}"/>`;
    return g; };
  const leafPile = (x, y, R) => { let g = `<ellipse cx="${F(x + 6)}" cy="${F(y + 2)}" rx="${F(R * 1.2)}" ry="${F(R * .22)}" fill="#000" opacity=".22"/>`;
    const L = [];
    for (let k = 0; k < R * 6; k++) { const a = r() * Math.PI, d = Math.sqrt(r()), px = x - Math.cos(a) * d * R, py = y - Math.sin(a) * d * R * .5;
      const lit = cl(((x - px) / R * .5 + (y - py) / (R * .5) * .5) * .5 + .45 + (r() - .5) * .3); L.push([px, py, lit]); }
    L.sort((a, b) => a[2] - b[2]);
    const RAMP = ["#5a1e10", "#8a2e18", "#b8401e", "#d85a24", "#e8822c", "#f0a838", "#f8cc58"];
    L.forEach(([px, py, v]) => { const sz = 2 + r() * 2.6; g += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(sz)}" ry="${F(sz * .55)}" fill="${T(RAMP[Math.floor(v * RAMP.length)])}" transform="rotate(${F(r() * 180)} ${F(px)} ${F(py)})"/>`; });
    return g; };

  /* the house builder, drawn in local units (base at 0, facade 340 wide) and placed with a transform */
  let cid = 0;
  const house = o => {
    const { x, yb, sc, dir, d, wall, trim = "#f4efe4", roof, shut, type, litW = .7 } = o, id = "ttH" + (cid++);
    const WL = -170, WR = 170, H1 = -112, H2 = -226, sdLit = dir < 0;   // the visible side wall faces the light when it is on the left
    const sideC = sdLit ? mix(wall, "#fff4d8", .12) : mix(wall, "#1a1a2a", .4);
    const HR = rng(seed + 100 + cid * 7);
    let g = `<ellipse cx="${dir * d * .5}" cy="4" rx="${200 + d}" ry="12" fill="#000" opacity=".2"/>`;
    // side wall in perspective
    const sx = dir > 0 ? WR : WL, sy = -d * .28;
    g += `<path d="${poly([[sx, 0], [sx + dir * d, sy], [sx + dir * d, H2 + sy], [sx, H2]])}" fill="${T(sideC)}"/>`;
    for (let k = 1; k < 32; k++) g += `<path d="M${sx},${-k * 7} L${sx + dir * d},${-k * 7 + sy}" stroke="#000" stroke-width="1" opacity=".12"/>`;
    [[.35, -190], [.7, -190], [.35, -80], [.7, -80]].forEach(([t, wy]) => { const px = sx + dir * d * t, py = wy + sy * t, ww = d * .16, lit = NIGHT && HR() < litW;
      g += `<path d="${poly([[px, py], [px + dir * ww, py - ww * .28], [px + dir * ww, py + 46 - ww * .28], [px, py + 46]])}" fill="${T(trim)}"/><path d="${poly([[px + dir * ww * .15, py + 3], [px + dir * ww * .85, py + 3 - ww * .24], [px + dir * ww * .85, py + 43 - ww * .24], [px + dir * ww * .15, py + 43]])}" fill="${lit ? "url(#ttPane)" : T("#3a4458")}"/>`; });
    // facade with clapboards
    g += `<clipPath id="${id}c"><rect x="${WL}" y="${H2}" width="${WR - WL}" height="${-H2}"/></clipPath><rect x="${WL}" y="${H2}" width="${WR - WL}" height="${-H2}" fill="${T(wall)}"/><g clip-path="url(#${id}c)">`;
    for (let y = -6; y > H2; y -= 7) g += `<path d="M${WL},${y} H${WR}" stroke="${T(mix(wall, "#000000", .22))}" stroke-width="1.1"/><path d="M${WL},${y + 1.4} H${WR}" stroke="${T(mix(wall, "#ffffff", .2))}" stroke-width=".7" opacity=".7"/>`;
    g += `</g><rect x="${WL}" y="${H2}" width="${WR - WL}" height="${-H2}" fill="url(#ttFacade)"/>`;
    g += `<rect x="${WL - 4}" y="${H2}" width="8" height="${-H2}" fill="${T(trim)}"/><rect x="${WR - 4}" y="${H2}" width="8" height="${-H2}" fill="${T(trim)}"/><rect x="${WL - 4}" y="${H1 - 4}" width="${WR - WL + 8}" height="6" fill="${T(trim)}"/>`;
    g += `<rect x="${WL - 2}" y="-14" width="${WR - WL + 4}" height="14" fill="${T("#8a6a5a")}"/>`;
    // windows
    const win = (wx, wy, ww, wh, lit) => { let w = "";
      if (lit) w += `<circle cx="${wx}" cy="${wy + wh / 2}" r="${wh * 1.1}" fill="url(#ttGlow)" opacity=".45"/>`;
      w += `<rect x="${wx - ww / 2 - 13}" y="${wy}" width="11" height="${wh}" fill="${T(shut)}"/><rect x="${wx + ww / 2 + 2}" y="${wy}" width="11" height="${wh}" fill="${T(shut)}"/>`;
      for (let k = 1; k < 6; k++) w += `<path d="M${wx - ww / 2 - 12},${wy + k * wh / 6} h9 M${wx + ww / 2 + 3},${wy + k * wh / 6} h9" stroke="#000" stroke-width="1" opacity=".25"/>`;
      w += `<rect x="${wx - ww / 2 - 3}" y="${wy - 6}" width="${ww + 6}" height="${wh + 9}" fill="${T(trim)}"/><rect x="${wx - ww / 2}" y="${wy}" width="${ww}" height="${wh}" fill="${lit ? "url(#ttPane)" : T("#4a5a74")}"/>`;
      if (!lit) w += `<path d="M${wx - ww / 2},${wy + wh * .6} L${wx + ww / 2},${wy + wh * .15} L${wx + ww / 2},${wy + wh * .38} L${wx - ww / 2},${wy + wh * .82}Z" fill="${T("#c8dcf0")}" opacity=".35"/>`;
      w += `<path d="M${wx},${wy} v${wh} M${wx - ww / 2},${wy + wh / 2} h${ww}" stroke="${T(trim)}" stroke-width="2.5"/><rect x="${wx - ww / 2 - 6}" y="${wy + wh + 2}" width="${ww + 12}" height="4" fill="${T(trim)}"/><rect x="${wx - ww / 2 - 6}" y="${wy + wh + 6}" width="${ww + 12}" height="2" fill="#000" opacity=".25"/>`;
      w += `<rect x="${wx - ww / 2 - 3}" y="${wy - 10}" width="${ww + 6}" height="5" fill="${T(trim)}"/>`;
      return w; };
    [-110, 0, 110].forEach(wx => g += win(wx, -202, 34, 54, NIGHT && HR() < litW));
    // roof
    const RO = T(roof), RD = T(mix(roof, "#000000", .3)), RL = T(mix(roof, "#ffffff", .15));
    if (type === "gable") {
      const P = [0, H2 - 150];
      g += `<path d="${poly([[dir * 184, H2 + 4], P, [P[0] + dir * d, P[1] + sy], [dir * 184 + dir * d, H2 + 4 + sy]])}" fill="${sdLit ? RL : RD}"/>`;
      for (let k = 1; k < 9; k++) { const t = k / 9; g += `<path d="${line([[dir * 184 * (1 - t), H2 + 4 - 150 * t], [dir * 184 * (1 - t) + dir * d, H2 + 4 - 150 * t + sy]])}" stroke="#000" stroke-width="1" opacity=".18"/>`; }
      g += `<clipPath id="${id}g"><path d="${poly([[-172, H2], P, [172, H2]])}"/></clipPath><path d="${poly([[-172, H2], P, [172, H2]])}" fill="${T(wall)}"/><g clip-path="url(#${id}g)">`;
      for (let y = H2 - 6, row = 0; y > H2 - 152; y -= 8, row++) { let dd = ""; for (let xx = -180 + (row % 2) * 6; xx < 180; xx += 12) dd += `M${xx},${y} a6,7 0 0 0 12,0 `; g += `<path d="${dd}" stroke="${T(mix(wall, "#000000", .3))}" stroke-width="1" fill="none"/>`; }
      g += `<rect x="-200" y="${H2 - 160}" width="200" height="170" fill="${RIM}" opacity=".08"/></g>`;
      g += `<path d="M0,${H2 - 102} a16,16 0 0 1 16,16 v26 h-32 v-26 a16,16 0 0 1 16,-16Z" fill="${T(trim)}"/><path d="M0,${H2 - 97} a11,11 0 0 1 11,11 v22 h-22 v-22 a11,11 0 0 1 11,-11Z" fill="${NIGHT && HR() < litW ? "url(#ttPane)" : T("#4a5a74")}"/><path d="M0,${H2 - 97} v33 M-11,${H2 - 80} h22" stroke="${T(trim)}" stroke-width="2"/>`;
      g += `<path d="M-196,${H2 + 10} L0,${H2 - 158} L196,${H2 + 10}" stroke="${RO}" stroke-width="12" fill="none" stroke-linejoin="round"/><path d="M-190,${H2 + 10} L0,${H2 - 152} L190,${H2 + 10}" stroke="${T(trim)}" stroke-width="3" fill="none" stroke-linejoin="round"/>`;
      g += `<path d="M-196,${H2 + 5} L0,${H2 - 163}" stroke="${RIM}" stroke-width="2" opacity=".55"/>`;
      g += `<rect x="${dir > 0 ? 70 : -96}" y="${H2 - 150}" width="26" height="60" fill="${T("#8a4a3a")}"/><rect x="${dir > 0 ? 70 : -96}" y="${H2 - 150}" width="9" height="60" fill="${T("#b06a50")}"/><rect x="${dir > 0 ? 66 : -100}" y="${H2 - 156}" width="34" height="8" fill="${T("#5a3a30")}"/>`;
    } else {
      const top = H2 - 96;
      g += `<path d="${poly([[dir * 186, H2 + 6], [dir * 186 + dir * d, H2 + 6 + sy], [dir * 100 + dir * d * .7, top + sy * .7], [dir * 100, top]])}" fill="${sdLit ? RL : RD}"/>`;
      g += `<path d="${poly([[-186, H2 + 6], [186, H2 + 6], [100, top], [-100, top]])}" fill="${RO}"/>`;
      for (let k = 1; k < 8; k++) { const t = k / 8, y = H2 + 6 - 102 * t, xx = 186 - 86 * t; g += `<path d="M${-xx},${y} H${xx}" stroke="#000" stroke-width="1" opacity=".22"/>`; }
      g += `<path d="M-186,${H2 + 6} L-100,${top} L100,${top}" stroke="${RIM}" stroke-width="2" fill="none" opacity=".5"/><path d="M-190,${H2 + 8} H190" stroke="${T(trim)}" stroke-width="5"/>`;
      g += `<path d="${poly([[-30, H2 - 16], [-30, H2 - 56], [0, H2 - 82], [30, H2 - 56], [30, H2 - 16]])}" fill="${T(wall)}"/><rect x="-14" y="${H2 - 56}" width="28" height="30" fill="${T(trim)}"/><rect x="-10" y="${H2 - 52}" width="20" height="24" fill="${NIGHT && HR() < litW ? "url(#ttPane)" : T("#4a5a74")}"/><path d="M-38,${H2 - 50} L0,${H2 - 88} L38,${H2 - 50}" stroke="${RO}" stroke-width="8" fill="none"/>`;
      g += `<rect x="${dir > 0 ? 60 : -86}" y="${top - 40}" width="26" height="54" fill="${T("#8a4a3a")}"/><rect x="${dir > 0 ? 60 : -86}" y="${top - 40}" width="9" height="54" fill="${T("#b06a50")}"/><rect x="${dir > 0 ? 56 : -90}" y="${top - 46}" width="34" height="8" fill="${T("#5a3a30")}"/>`;
    }
    // porch: shadow, ground-floor windows and door, columns, roof, floor, railing, steps
    g += `<rect x="${WL}" y="${H1}" width="${WR - WL}" height="${-H1 - 14}" fill="#000" opacity=".2"/>`;
    [-118, 118].forEach(wx => g += win(wx, -96, 40, 58, NIGHT && HR() < litW));
    g += `<rect x="-26" y="-104" width="52" height="84" fill="${T(trim)}"/><rect x="-20" y="-98" width="40" height="78" fill="${T(o.door || "#6a2a22")}"/><rect x="-14" y="-92" width="28" height="22" fill="${NIGHT ? "url(#ttPane)" : T("#4a5a74")}"/><rect x="-14" y="-62" width="12" height="34" fill="#000" opacity=".15"/><rect x="2" y="-62" width="12" height="34" fill="#000" opacity=".15"/><circle cx="13" cy="-56" r="2" fill="${T("#e0c070")}"/>`;
    g += `<circle cx="0" cy="-74" r="11" fill="none" stroke="${T("#2a2a2a")}" stroke-width="5"/><circle cx="0" cy="-74" r="11" fill="none" stroke="${T("#e07a20")}" stroke-width="2" stroke-dasharray="3 3"/>`;
    g += `<rect x="30" y="-90" width="8" height="12" rx="2" fill="${NIGHT ? LAMP : T("#c8b890")}" stroke="${T("#2a2a2a")}" stroke-width="1.5"/>`;
    if (NIGHT) g += `<circle cx="34" cy="-80" r="70" fill="url(#ttGlow)" opacity=".7"/>`;
    const pf = -24;
    g += `<path d="${poly([[-196, pf], [196, pf], [196 + (dir > 0 ? d : 0), pf + (dir > 0 ? sy : 0)], [196 + (dir > 0 ? d : 0), pf + 12 + (dir > 0 ? sy : 0)], [196, pf + 12], [-196, pf + 12]])}" fill="${T("#7a7a80")}"/><rect x="-196" y="${pf}" width="392" height="2" fill="${RIM}" opacity=".4"/>`;
    g += `<rect x="-196" y="${pf + 12}" width="392" height="${-pf - 12}" fill="${T("#5a4a40")}"/>`;
    for (let xx = -196; xx < 196; xx += 10) g += `<path d="M${xx},${pf + 12} l12,${-pf - 12} M${xx + 12},${pf + 12} l-12,${-pf - 12}" stroke="${T(trim)}" stroke-width="1.2" opacity=".6"/>`;
    const cols = [-190, -74, 74, 190];
    if (dir > 0) cols.push(190 + d * .5, 190 + d);
    cols.forEach(cx => { const cy = cx > 190 ? sy * (cx - 190) / d : 0;
      g += `<rect x="${cx - 5}" y="${H1 + 10 + cy}" width="10" height="${pf - H1 - 10}" fill="${T(trim)}"/><rect x="${cx + 1}" y="${H1 + 10 + cy}" width="4" height="${pf - H1 - 10}" fill="#000" opacity=".18"/>`;
      g += `<path d="M${cx + 5},${H1 + 14 + cy} q12,0 16,10 M${cx - 5},${H1 + 14 + cy} q-12,0 -16,10" stroke="${T(trim)}" stroke-width="2" fill="none"/>`; });
    [[-190, -74], [74, 190]].forEach(([a, b]) => { g += `<path d="M${a},${pf - 30} H${b}" stroke="${T(trim)}" stroke-width="4"/>`; for (let xx = a + 6; xx < b; xx += 7) g += `<path d="M${xx},${pf - 28} v28" stroke="${T(trim)}" stroke-width="2"/>`; });
    if (dir > 0) { g += `<path d="M190,${pf - 30} L${190 + d},${pf - 30 + sy}" stroke="${T(trim)}" stroke-width="4"/>`; for (let t = .1; t < 1; t += .1) g += `<path d="M${F(190 + d * t)},${F(pf - 28 + sy * t)} v28" stroke="${T(trim)}" stroke-width="1.6"/>`; }
    const pr = [[-200, H1 - 16], [200, H1 - 16], [208, H1 + 10], [-208, H1 + 10]];
    if (dir > 0) g += `<path d="${poly([[200, H1 - 16], [200 + d, H1 - 16 + sy], [204 + d, H1 + 10 + sy], [208, H1 + 10]])}" fill="${RD}"/>`;
    g += `<path d="${poly(pr)}" fill="${RO}"/><path d="M-200,${H1 - 16} H200" stroke="${RIM}" stroke-width="1.6" opacity=".5"/><rect x="-208" y="${H1 + 4}" width="416" height="8" fill="${T(trim)}"/>`;
    if (dir > 0) g += `<path d="M208,${H1 + 8} L${204 + d},${H1 + 8 + sy}" stroke="${T(trim)}" stroke-width="7"/>`;
    for (let k = 0; k < 4; k++) { const ty = pf + k * 7, w2 = 40 + k * 3;
      g += `<rect x="${-w2}" y="${ty}" width="${2 * w2}" height="3" fill="${T("#c8c0b4")}"/><rect x="${-w2}" y="${ty + 3}" width="${2 * w2}" height="4" fill="${T("#8a8278")}"/>`; }
    g += `<rect x="-52" y="${pf + 28}" width="104" height="6" fill="${T("#c8c0b4")}"/>`;
    // jack-o'-lanterns climbing the steps
    [[-34, pf + 2, 9], [36, pf + 2, 8], [-40, pf + 9, 10], [42, pf + 16, 11], [-50, pf + 30, 13], [52, pf + 32, 12], [-150, pf - 1, 11], [140, pf - 1, 9]].forEach(([jx, jy, R], i) => { if (o.jacks !== undefined && i >= o.jacks) return; g += jack(jx, jy, R, NIGHT); });
    // string lights scalloped along the porch fascia
    if (o.lights) { let d2 = "", bulbs = ""; const xs = []; for (let xx = -206; xx <= 206; xx += 34) xs.push(xx);
      xs.forEach((xx, i) => { if (i === 0) d2 += `M${xx},${H1 + 12}`; else d2 += ` Q${xx - 17},${H1 + 26} ${xx},${H1 + 12}`; });
      g += `<path d="${d2}" stroke="#1e1e22" stroke-width="1.2" fill="none"/>`;
      for (let i = 0; i < xs.length - 1; i++) for (let k = 1; k < 4; k++) { const t = k / 4, bx = xs[i] + 34 * t, by = H1 + 12 + 2 * t * (1 - t) * 14 * 2;
        const c = o.lights[(i * 3 + k) % o.lights.length];
        if (NIGHT) bulbs += `<circle cx="${F(bx)}" cy="${F(by + 4)}" r="8" fill="${c}" opacity=".35"/>`;
        bulbs += `<ellipse cx="${F(bx)}" cy="${F(by + 4)}" rx="2.6" ry="3.6" fill="${NIGHT ? c : mix(c, "#ffffff", .25)}"/>`; }
      g += bulbs; }
    // paper bats on threads under the porch roof
    if (o.bats) [-150, -100, 96, 150].forEach((bx, i) => { const L = 10 + (i % 2) * 12, by = H1 + 12 + L, f = i % 2 ? .8 : 1;
      g += `<path d="M${bx},${H1 + 12} v${L}" stroke="${T("#dddddd")}" stroke-width=".8"/><path transform="translate(${bx},${by}) scale(${f * .55})" d="M0,2 C-6,-4 -14,-10 -30,-8 C-24,-4 -26,0 -22,4 C-18,1 -14,4 -12,7 C-8,4 -4,6 0,8 C4,6 8,4 12,7 C14,4 18,1 22,4 C26,0 24,-4 30,-8 C14,-10 6,-4 0,2Z" fill="#141018"/>`; });
    // a cobweb in the porch corner
    if (o.web) { const wx = -186, wy = H1 + 12; let wbs = ""; for (let k = 0; k < 6; k++) { const a = k / 5 * Math.PI / 2; wbs += `M${wx},${wy} L${F(wx + Math.cos(a) * 36)},${F(wy + Math.sin(a) * 36)} `; }
      for (let k = 1; k < 4; k++) { const R = k * 11; let p = `M${wx + R},${wy}`; for (let j = 1; j <= 5; j++) { const a = j / 5 * Math.PI / 2; p += ` Q${F(wx + Math.cos(a - .16) * R * .82)},${F(wy + Math.sin(a - .16) * R * .82)} ${F(wx + Math.cos(a) * R)},${F(wy + Math.sin(a) * R)}`; } wbs += p + " "; }
      g += `<path d="${wbs}" stroke="${NIGHT ? "#c8d0e8" : "#ffffff"}" stroke-width=".8" fill="none" opacity=".75"/>`; }
    return `<g transform="translate(${F(x)},${F(yb)}) scale(${sc})">${g}</g>`;
  };

  /* ---------------------------------------------------------- background */
  // far town over the rooftops: hills, little roofs, a steeple and a water tower in haze
  const m1 = wave([1, 3, 2], [320, 140, 60], [16, 8, 3]);
  s += `<path d="${ridgePath(x => 408 + m1(x))}" fill="${T("#a4b0c4")}"/>`;
  const hzc = NIGHT ? "#34406a" : "#e8dcc4";
  let ft = "";
  for (let x = -10; x < W + 10; x += 9 + r() * 10) { const y = 432 + m1(x) * .3 + r() * 6, sz = 8 + r() * 6, c = T(mix(AUT[Math.floor(r() * AUT.length)], hzc, .5));
    ft += `<path d="${blobP(x, y - sz * .6, sz, sz * .8, 7)}" fill="${mix(c, NIGHT ? "#050a20" : "#2a1a10", .25)}"/><path d="${blobP(x - 2, y - sz * .8, sz * .7, sz * .55, 6)}" fill="${c}"/><path d="${blobP(x - sz * .35, y - sz * 1.1, sz * .35, sz * .25, 5)}" fill="${mix(c, RIM, .3)}"/>`;
    if (r() < .18) { const w = 18 + r() * 14, hh = 12 + r() * 6, wc = T(mix(["#d8ccb4", "#c8b89a", "#b8c0c8", "#c89a7a"][Math.floor(r() * 4)], hzc, .45));
      ft += `<rect x="${F(x - w / 2)}" y="${F(y - hh)}" width="${F(w)}" height="${F(hh)}" fill="${wc}"/><path d="${poly([[x - w / 2 - 2, y - hh], [x, y - hh - w * .4], [x + w / 2 + 2, y - hh]])}" fill="${T(mix("#5a5060", hzc, .45))}"/>`;
      if (NIGHT && r() < .6) ft += `<rect x="${F(x - 3)}" y="${F(y - hh * .6)}" width="4" height="4" fill="${LAMP}" opacity=".8"/>`; } }
  s += `<g filter="url(#ttLeafyS)">${ft}</g>`;
  { const x = 520, y = 430, c = T(mix("#e8e2d4", hzc, .35)), dk = T(mix("#a8a094", hzc, .35));   // steeple
    s += `<rect x="${x - 12}" y="${y - 70}" width="24" height="70" fill="${c}"/><rect x="${x + 4}" y="${y - 70}" width="8" height="70" fill="${dk}"/><path d="${poly([[x - 14, y - 70], [x, y - 128], [x + 14, y - 70]])}" fill="${T(mix("#6a6070", hzc, .35))}"/><path d="${poly([[x, y - 128], [x + 14, y - 70], [x + 4, y - 70]])}" fill="#000" opacity=".2"/><path d="M${x},${y - 128} v-12 M${x - 5},${y - 135} h10" stroke="${dk}" stroke-width="2"/><path d="M${x - 5},${y - 50} v-8 a5,5 0 0 1 10,0 v8Z" fill="${NIGHT ? LAMP : dk}"/>`; }
  { const x = 2060, y = 436, c = T(mix("#b8c0c8", hzc, .4)), dk = T(mix("#7a8490", hzc, .4));   // water tower
    s += `<path d="M${x - 20},${y} L${x - 14},${y - 60} M${x + 20},${y} L${x + 14},${y - 60} M${x - 6},${y} L${x - 5},${y - 60} M${x + 6},${y} L${x + 5},${y - 60} M${x - 18},${y - 20} L${x + 18},${y - 40} M${x + 18},${y - 20} L${x - 18},${y - 40}" stroke="${dk}" stroke-width="2"/>`;
    s += `<rect x="${x - 26}" y="${y - 92}" width="52" height="34" rx="6" fill="${c}"/><rect x="${x + 6}" y="${y - 92}" width="20" height="34" rx="6" fill="${dk}"/><path d="${poly([[x - 28, y - 92], [x, y - 110], [x + 28, y - 92]])}" fill="${dk}"/><text x="${x - 4}" y="${y - 70}" font-family="Georgia, serif" font-size="9" font-weight="bold" text-anchor="middle" fill="${T("#6a4a3a")}">ELM GROVE</text>`; }
  s += `<rect x="0" y="380" width="${W}" height="90" fill="url(#ttHaze)"/>`;

  /* lawns, back to front */
  s += `<path d="${ridgePath(lawnTop)}" fill="url(#ttLawn)"/>`;
  for (let k = 0; k < 900; k++) { const x = r() * W, y = lawnTop(x) + r() * (walkB(x) - lawnTop(x));
    s += `<path d="M${F(x)},${F(y)} q${F(-1 + r() * 2)},-3 ${F(-2 + r() * 4)},${F(-3 - r() * 4)}" stroke="${T(r() < .5 ? "#b0b860" : "#4e5e28")}" stroke-width="1.2" fill="none" opacity=".55"/>`; }

  /* houses, far to near */
  const ORANGE = ["#ff9a2a", "#ffb84a", "#ff7a1a"], MIXED = ["#ff8a2a", "#a86ad8", "#7ad84a", "#ffb84a"];
  const yb = x => lawnTop(x) + 22 + 30 * (1 - K(x));
  const bg = [
    { x: 150, sc: .33, dir: 1, d: 60, wall: "#c8b8d8", roof: "#4a4458", shut: "#4a3a5a", type: "gable", jacks: 3 },
    { x: 2420, sc: .33, dir: -1, d: 60, wall: "#e8d8a8", roof: "#5a4a40", shut: "#6a4a2a", type: "hip", jacks: 3 },
    { x: 420, sc: .46, dir: 1, d: 64, wall: "#9ab0a0", roof: "#3e4a4a", shut: "#2e4a3a", type: "hip", jacks: 4, lights: MIXED },
    { x: 2150, sc: .46, dir: -1, d: 64, wall: "#d8a888", roof: "#4a3a3a", shut: "#5a2a22", type: "gable", jacks: 5, lights: ORANGE },
    { x: 720, sc: .6, dir: 1, d: 70, wall: "#e2cf8a", roof: "#5a4a44", shut: "#3a5a7a", type: "gable", jacks: 6, lights: ORANGE, bats: true },
    { x: 1850, sc: .6, dir: -1, d: 70, wall: "#9aaac8", roof: "#3a3a4a", shut: "#2a3a5a", type: "hip", jacks: 6, lights: MIXED, web: true },
  ];
  bg.forEach(o => s += house({ ...o, yb: yb(o.x) }));
  // small trees between the far houses
  const TR = ["#5e1a12", "#86261a", "#ac3520", "#cc4a22", "#e0662a", "#ee8a30", "#f6b24a", "#fcd97e"], TY = ["#5a3a10", "#8a5a14", "#b8801c", "#d8a028", "#eac040", "#f4d460", "#fae68a", "#fff2b0"];
  [[285, .4, TY], [570, .5, TR], [2000, .5, TY], [2290, .42, TR], [40, .32, TR], [2540, .32, TY]].forEach(([x, k, ramp]) => s += leafTree(x, yb(x) + 6, 330 * k, 260, ramp));

  /* the corner house */
  const HX = 1272, HY = 512;
  s += house({ x: HX, yb: HY, sc: 1, dir: 1, d: 74, wall: "#c87a5a", trim: "#f6efe0", roof: "#3e3a48", shut: "#2e3a4a", door: "#2a3a2a", type: "gable", lights: ORANGE, bats: true, web: true, litW: .85 });
  // paper bat cut-outs taped to the upstairs windows
  [[HX - 112, HY - 186, .5], [HX - 100, HY - 172, .4], [HX + 106, HY - 182, .45]].forEach(([x, y, k]) => s += `<path transform="translate(${x},${y}) scale(${k})" d="M0,2 C-6,-4 -14,-10 -30,-8 C-24,-4 -26,0 -22,4 C-18,1 -14,4 -12,7 C-8,4 -4,6 0,8 C4,6 8,4 12,7 C14,4 18,1 22,4 C26,0 24,-4 30,-8 C14,-10 6,-4 0,2Z" fill="#141018"/>`);
  // front walk, picket fence with a gate gap, leaf piles, hay bale with mums and pumpkins
  s += `<path d="M${HX - 40},${HY + 10} L${HX + 40},${HY + 10} L${HX + 56},${walkB(HX) + 1} L${HX - 56},${walkB(HX) + 1}Z" fill="url(#ttWalk)"/>`;
  for (let k = 1; k < 5; k++) { const t = k / 5, y = HY + 10 + (walkB(HX) - HY - 10) * t, w = 40 + 16 * t; s += `<path d="M${HX - w},${F(y)} H${HX + w}" stroke="${T("#9a9488")}" stroke-width="1"/>`; }
  const fence = (a, b) => { let f = "";
    for (let x = a; x <= b; x += 9) { const y = walkB(x) - 3, h = 24;
      f += `<path d="M${x - 3},${F(y)} v${-h} l3,-4 l3,4 v${h}Z" fill="${T("#f2ece0")}"/><path d="M${x + 1},${F(y)} v${-h} l2,0 v${h}Z" fill="#000" opacity=".16"/>`; }
    f += `<path d="${line(Array.from({ length: Math.ceil((b - a) / 12) + 1 }, (_, i) => { const x = Math.min(b, a + i * 12); return [x, walkB(x) - 10]; }))}" stroke="${T("#dcd4c4")}" stroke-width="3" fill="none"/>`;
    f += `<path d="${line(Array.from({ length: Math.ceil((b - a) / 12) + 1 }, (_, i) => { const x = Math.min(b, a + i * 12); return [x, walkB(x) - 21]; }))}" stroke="${T("#dcd4c4")}" stroke-width="3" fill="none"/>`;
    return f; };
  s += leafPile(HX + 150, HY + 34, 52) + leafPile(HX - 176, HY + 30, 36) + leafPile(560, yb(560) + 26, 30) + leafPile(1980, yb(1980) + 24, 32);
  { const x = HX - 120, y = HY + 26;
    s += `<path d="${poly([[x - 30, y], [x + 30, y], [x + 30, y - 18], [x - 30, y - 18]])}" fill="${T("#c8a448")}"/><path d="${poly([[x + 30, y], [x + 42, y - 6], [x + 42, y - 24], [x + 30, y - 18]])}" fill="${T("#e4c66a")}"/><path d="${poly([[x - 30, y - 18], [x + 30, y - 18], [x + 42, y - 24], [x - 18, y - 24]])}" fill="${T("#f4dc90")}"/>`;
    for (let k = 0; k < 40; k++) s += `<path d="M${F(x - 30 + r() * 58)},${F(y - r() * 18)} l${F(3 + r() * 4)},0" stroke="${T(r() < .5 ? "#a88430" : "#f4dc90")}" stroke-width=".9"/>`;
    s += jack(x - 14, y - 22, 10, NIGHT) + jack(x + 12, y - 24, 8, false);
    for (let k = 0; k < 30; k++) { const a = r() * Math.PI, d = Math.sqrt(r()) * 13; s += `<circle cx="${F(x + 40 - Math.cos(a) * d)}" cy="${F(y - 4 - Math.sin(a) * d * .8)}" r="2.6" fill="${T(r() < .5 ? "#b84a8a" : "#d86aa8")}"/>`; } }
  s += fence(HX - 230, HX - 62) + fence(HX + 62, HX + 230);
  // mailbox on a post at the walk
  s += `<rect x="${HX + 76}" y="${walkB(HX + 76) - 40}" width="4" height="38" fill="${T("#3a2a20")}"/><rect x="${HX + 68}" y="${walkB(HX + 76) - 50}" width="22" height="12" rx="5" fill="${T("#2a2a30")}"/><rect x="${HX + 68}" y="${walkB(HX + 76) - 50}" width="8" height="12" rx="4" fill="${T("#5a5a64")}"/><rect x="${HX + 88}" y="${walkB(HX + 76) - 56}" width="2" height="9" fill="${T("#d84a2a")}"/>`;

  /* the curved sidewalk, tree lawn and curb */
  s += `<path d="${band(walkB, walkF)}" fill="url(#ttWalk)"/>`;
  for (let x = -40; x < W + 40; x += 26 + 14 * K(x)) { const k = 1 - K(x) * .6; s += `<path d="M${F(x)},${F(walkB(x))} L${F(x + (x - CXS) * .02)},${F(walkF(x))}" stroke="${T("#9a9488")}" stroke-width="${F(k)}"/>`; }
  s += `<path d="${line(Array.from({ length: 161 }, (_, i) => [i * 16, walkB(i * 16)]))}" stroke="${T("#8a8478")}" stroke-width="1.2" fill="none"/>`;
  s += `<path d="${band(walkF, x => curb(x) - 3)}" fill="${T("#6e7e36")}"/>`;
  s += `<path d="${band(x => curb(x) - 3, x => curb(x) + 2)}" fill="${T("#c8c2b4")}"/><path d="${band(x => curb(x) + 2, x => curb(x) + 6)}" fill="${T("#7a7670")}"/>`;
  if (NIGHT) [[640, 1], [1940, 1]].forEach(([x]) => s += `<ellipse cx="${x}" cy="${F(walkF(x) - 4)}" rx="120" ry="20" fill="url(#ttPool)"/>`);

  /* street */
  s += `<path d="${ridgePath(x => curb(x) + 6)}" fill="url(#ttRoad)"/>`;
  for (let k = 0; k < 40; k++) { const x = r() * W, y = curb(x) + 14 + r() * (H - curb(x)), w = 30 + r() * 120;
    s += `<path d="M${F(x)},${F(y)} q${F(w / 2)},${F((r() - .5) * 8)} ${F(w)},${F((r() - .5) * 4)}" stroke="${T(r() < .5 ? "#2e3036" : "#8a8c92")}" stroke-width="${F(1 + r() * 2)}" fill="none" opacity=".35"/>`; }
  // leaves drifted along the gutter and scattered on the road and walk
  const LV = ["#8a2e18", "#b8401e", "#d85a24", "#e8822c", "#f0a838", "#f8cc58", "#a85a20"];
  for (let k = 0; k < 900; k++) { const x = r() * W, gut = r() < .55, y = gut ? curb(x) + 7 + r() * 8 : walkB(x) + r() * (H - walkB(x)), sz = (1.4 + r() * 2.4) * (.5 + (y - 440) / 280);
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(sz)}" ry="${F(sz * .55)}" fill="${T(LV[Math.floor(r() * LV.length)])}" transform="rotate(${F(r() * 180)} ${F(x)} ${F(y)})" opacity=".9"/>`; }

  /* tree lawn: big maples framing the corner house, and two street lamps */
  const MAPLE = ["#5e1a12", "#86261a", "#ac3520", "#cc4a22", "#e0662a", "#ee8a30", "#f6b24a", "#fcd97e"];
  const GOLD = ["#5a3a10", "#7a5014", "#a8701c", "#d0962a", "#e6b23a", "#f2cc52", "#f8e07a", "#fff0a8"];
  s += leafTree(906, curb(906) - 10, 380, 700, MAPLE);
  s += leafTree(1668, curb(1668) - 10, 350, 640, GOLD, { ghost: true });
  s += leafTree(240, curb(240) - 6, 250, 360, GOLD) + leafTree(2330, curb(2330) - 6, 260, 360, MAPLE);
  const lamp = (x, y, h) => { let g = `<rect x="${x - 3}" y="${y - h}" width="6" height="${h}" fill="${T("#1e2228")}"/><rect x="${x - 2}" y="${y - h}" width="2" height="${h}" fill="${RIM}" opacity=".3"/><path d="M${x - 8},${y} h16 l-3,-10 h-10Z" fill="${T("#1e2228")}"/>`;
    if (NIGHT) g += `<circle cx="${x}" cy="${y - h - 12}" r="60" fill="url(#ttGlow)" opacity=".8"/>`;
    g += `<path d="M${x - 10},${y - h - 2} L${x + 10},${y - h - 2} L${x + 7},${y - h - 24} L${x - 7},${y - h - 24}Z" fill="${NIGHT ? "#ffe0a0" : T("#d8e4ec")}" stroke="${T("#1e2228")}" stroke-width="2"/><path d="M${x - 11},${y - h - 24} L${x},${y - h - 32} L${x + 11},${y - h - 24}Z" fill="${T("#1e2228")}"/><path d="M${x},${y - h - 32} v-6" stroke="${T("#1e2228")}" stroke-width="2"/>`;
    return g; };
  s += lamp(640, curb(640) - 4, 120) + lamp(1940, curb(1940) - 4, 120);
  // leaf piles raked to the curb, and two jack-o'-lanterns waiting at the walk's end
  s += leafPile(1010, curb(1010) - 2, 40) + leafPile(1560, curb(1560) - 2, 46) + leafPile(420, curb(420), 34);
  s += jack(HX - 70, walkF(HX - 70) - 2, 15, NIGHT) + jack(HX + 72, walkF(HX + 72) - 2, 13, NIGHT);

  /* foreground: the near curb and a scatter of big leaves */
  const near = x => 690 + Math.sin(x / 300) * 4 - 14 * Math.max(0, 1 - Math.abs(x - 200) / 400) - 14 * Math.max(0, 1 - Math.abs(x - 2360) / 400);
  s += `<path d="${ridgePath(near)}" fill="${T("#c8c2b4")}"/><path d="${ridgePath(x => near(x) + 6)}" fill="${T("#9a948a")}"/>`;
  for (let k = 0; k < 140; k++) { const x = r() * W, y = near(x) - 20 + r() * 50, sz = 4 + r() * 5;
    s += `<path d="M${F(x)},${F(y - sz)} l${F(sz * .35)},${F(sz * .5)} l${F(sz * .6)},${F(-sz * .2)} l${F(-sz * .3)},${F(sz * .6)} l${F(sz * .4)},${F(sz * .5)} l${F(-sz)},${F(sz * .1)} l${F(-sz)},${F(-sz * .1)} l${F(sz * .4)},${F(-sz * .5)} l${F(-sz * .3)},${F(-sz * .6)} l${F(sz * .6)},${F(sz * .2)}Z" fill="${T(LV[Math.floor(r() * LV.length)])}" transform="rotate(${F(r() * 360)} ${F(x)} ${F(y)})"/>`; }
  s += `<g filter="url(#ttLeafyS)">${leafPile(110, 712, 90) + leafPile(2460, 714, 96)}</g>`;

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#ttLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#ttPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
