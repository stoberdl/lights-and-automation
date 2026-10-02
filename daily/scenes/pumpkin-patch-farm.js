/* Pumpkin Patch Farm: a warm, friendly harvest afternoon. A pumpkin patch in
   perspective rows fills the foreground, a cheerful scarecrow stands in it,
   a hay wagon loaded with bales and pumpkins waits on the farm lane, a red
   gambrel barn (seen three-quarter) with string lights and a farm windmill
   sit behind, a corn maze with cut lanes spreads over the left, an orchard
   and farmhouse on the right, wooden signs, sunflowers framing the corners.
   Low sun on the right, so everything is lit on its right-hand side.
   opts.time === "night" is the same farm under a big harvest moon: stars,
   glowing string lights, lit barn loft and farmhouse, carved jack-o'-lanterns.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function pumpkinPatchFarmArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1024;
  const r = rng(seed), rs = rng(seed + 7);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 1660, LY = 268;
  const T = c => NIGHT ? mix(mix(c, "#7c7a92", .4), "#0d1432", .56) : c;
  const RIM = NIGHT ? "#f4d8a8" : "#fff0c0", LAMP = "#ffc860";
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
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

  /* ------------------------------------------------------------ defs + sky */
  const SKY_H = NIGHT ? "#4a3e62" : "#f8d49a", HZ = NIGHT ? "#3a3858" : "#f2d8a8";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#070a20"/><stop offset=".42" stop-color="#141a42"/><stop offset=".78" stop-color="#2e2c58"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#3f86c4"/><stop offset=".4" stop-color="#83b8dc"/><stop offset=".74" stop-color="#e2dcc0"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#ffd890" stop-opacity=".6"/><stop offset=".15" stop-color="#f0b060" stop-opacity=".24"/><stop offset=".5" stop-color="#a87060" stop-opacity=".07"/><stop offset="1" stop-color="#a87060" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff4cc" stop-opacity=".95"/><stop offset=".18" stop-color="#ffe0a0" stop-opacity=".5"/><stop offset=".55" stop-color="#ffcc80" stop-opacity=".14"/><stop offset="1" stop-color="#ffcc80" stop-opacity="0"/>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="ppDefs">
    <linearGradient id="ppSky" x1="0" y1="0" x2="0" y2="470" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="ppLight" cx="${LX}" cy="${LY}" r="880" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="ppHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    ${g2("ppFar1", T("#9eacc4"), T("#b8bcc0"))}
    ${g2("ppFar2", T("#94a0a8"), T("#a8a690"))}
    ${g2("ppHill", T("#a8a058"), T("#8a8644"))}
    <linearGradient id="ppFarm" x1="0" y1="470" x2="0" y2="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#b8ac5a")}"/><stop offset="1" stop-color="${T("#9a9444")}"/></linearGradient>
    <linearGradient id="ppSoil" x1="0" y1="540" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#9a8448")}"/><stop offset=".5" stop-color="${T("#7a6634")}"/><stop offset="1" stop-color="${T("#4e4020")}"/></linearGradient>
    ${g2("ppLane", T("#e0c890"), T("#c0a46c"))}
    <linearGradient id="ppRoofSh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset="1" stop-color="${RIM}" stop-opacity=".18"/></linearGradient>
    <radialGradient id="ppGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".9"/><stop offset=".35" stop-color="#ffa848" stop-opacity=".3"/><stop offset="1" stop-color="#ffa848" stop-opacity="0"/></radialGradient>
    <radialGradient id="ppPane" cx=".5" cy=".6" r=".75"><stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#ffc45a"/><stop offset="1" stop-color="#e0802a"/></radialGradient>
    <radialGradient id="ppMoonD" cx=".42" cy=".4" r=".66"><stop offset="0" stop-color="#fff2c8"/><stop offset=".6" stop-color="#fcd890"/><stop offset="1" stop-color="#e8a858"/></radialGradient>
    <filter id="ppLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ppLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ppCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="ppPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="ppSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="ppBlur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#ppSky)"/>`;

  if (NIGHT) {
    for (let i = 0; i < 440; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 420, d = Math.hypot(x - LX, y - LY), big = rs() < .08, o = .2 + rs() * .6 * (1 - y / 470);
      if (d < 200) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .25 ? "#fff0d0" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 72;
    s += `<rect width="${W}" height="${H}" fill="url(#ppLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 24}" fill="#ffd890" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="url(#ppMoonD)"/>`;
    s += `<g filter="url(#ppBlur3)">`;
    [[-24, -20, 22, 15], [16, -28, 18, 12], [22, 8, 24, 17], [-12, 18, 20, 14], [-38, 8, 11, 10], [4, 38, 13, 9]].forEach(([dx, dy, a, b]) => s += `<path d="${blobP(LX + dx, LY + dy, a, b, 8, rs)}" fill="#d09a58" opacity=".22"/>`);
    s += `</g>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#ppLight)"/><circle cx="${LX}" cy="${LY}" r="52" fill="#fff6dc" opacity=".5"/><circle cx="${LX}" cy="${LY}" r="38" fill="#fffbea"/>`;
    s += `<g class="rays" opacity=".12" filter="url(#ppSoft)">`;
    for (let k = 0; k < 9; k++) { const a = 1.7 + k * .28, L = 1100;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .035) * L)},${F(LY + Math.sin(a - .035) * L)} L${F(LX + Math.cos(a + .035) * L)},${F(LY + Math.sin(a + .035) * L)}Z" fill="#fff6dc"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------------------------------------------------------- clouds */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#ppCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .045 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#141838"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .42)}" fill="#24244c"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .18)}" fill="#6a5a7a" opacity=".85"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .18)}" rx="${F(R * .42)}" ry="${F(R * .08)}" fill="#e8c090" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .15 * (.6 + rs() * .7), w * (.09 + rs() * .07)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .07)}" fill="#c0c4d4"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#d0d0dc"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .85)}" fill="#f8f4ee"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .3)}" rx="${F(R * .6)}" ry="${F(R * .42)}" fill="#fff6e4"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(520, 140, 540, "drift1") + cloud(1180, 90, 420, "drift2") + cloud(2160, 120, 560, "drift2") + cloud(220, 270, 260, "drift3") + cloud(2460, 270, 240, "drift3");
  if (!NIGHT) {
    s += `<g class="birds" fill="none" stroke="#3a3440" stroke-width="2.2" stroke-linecap="round" opacity=".75">`;
    for (let k = -4; k <= 4; k++) { const x = 1010 + Math.abs(k) * 20 + (rs() - .5) * 6, y = 236 + k * 10, q = .75 + rs() * .25;
      s += `<path d="M${F(x - 9 * q)},${F(y - 2 * q)} q${F(5 * q)},${F(-5 * q)} ${F(9 * q)},${F(2 * q)} q${F(4 * q)},${F(-6 * q)} ${F(9 * q)},${F(-3 * q)}"/>`; }
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ------------------------------------------------------------ land kits */
  const AUT = ["#c8452a", "#d85a26", "#e0702a", "#e98a2c", "#eaa032", "#f2c648", "#a13a2a", "#8a9a3c", "#6f8a36", "#b8a040"];
  const forest = (fn, rows, size, haze, conifer) => {
    let f = ""; const trees = [];
    for (let row = 0; row < rows; row++) for (let x = -10; x < W + 10; x += size * (.9 + r() * .5)) {
      const y = fn(x) + row * size * .72 + size * .4 + r() * size * .3, sz = size * (.75 + r() * .45);
      trees.push([x + r() * size * .4, y, sz]); }
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(([x, y, sz]) => {
      const lsd = x < LX ? 1 : -1, hz = NIGHT ? "#3a3858" : "#e8d8b8";
      if (r() < conifer) { const c = T(mix("#3d5a34", hz, haze));
        f += `<path d="M${F(x)},${F(y - sz * 1.9)} L${F(x + sz * .3)},${F(y - sz * 1.2)} L${F(x + sz * .2)},${F(y - sz * 1.2)} L${F(x + sz * .55)},${F(y)} L${F(x - sz * .55)},${F(y)} L${F(x - sz * .2)},${F(y - sz * 1.2)} L${F(x - sz * .3)},${F(y - sz * 1.2)}Z" fill="${c}"/><path d="M${F(x)},${F(y - sz * 1.9)} L${F(x - lsd * sz * .3)},${F(y - sz * 1.2)} L${F(x - lsd * sz * .2)},${F(y - sz * 1.2)} L${F(x - lsd * sz * .55)},${F(y)} L${F(x)},${F(y)}Z" fill="${mix(c, "#000000", .2)}"/>`; return; }
      const c = T(mix(AUT[Math.floor(r() * AUT.length)], hz, haze)), dk = mix(c, NIGHT ? "#04061a" : "#2a1a10", .36), lt = mix(c, RIM, .3);
      f += `<path d="${blobP(x - lsd * sz * .12, y + sz * .1, sz * .95, sz * .8, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz * .08, sz * .85, sz * .72, 7)}" fill="${c}"/><path d="${blobP(x + lsd * sz * .25, y - sz * .35, sz * .42, sz * .3, 6)}" fill="${lt}"/>`;
    });
    return f;
  };
  const leafTree = (x, y, h, n, RAMP, fruit) => {
    let g = ""; const cx = x, cy = y - h * .6, rx = h * .42, ry = h * .32, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl;
    g += `<ellipse cx="${F(x - ux * h * .2)}" cy="${F(y + 2)}" rx="${F(h * .55)}" ry="${F(h * .05)}" fill="#000" opacity=".22"/>`;
    g += `<path d="M${F(x - h * .05)},${F(y)} C${F(x - h * .03)},${F(y - h * .25)} ${F(x - h * .05)},${F(y - h * .4)} ${F(x - h * .02)},${F(y - h * .55)} L${F(x + h * .02)},${F(y - h * .55)} C${F(x + h * .04)},${F(y - h * .4)} ${F(x + h * .03)},${F(y - h * .25)} ${F(x + h * .05)},${F(y)}Z" fill="${T("#4a3020")}"/><path d="M${F(x + h * .01)},${F(y)} C${F(x + h * .02)},${F(y - h * .25)} ${F(x + h * .02)},${F(y - h * .4)} ${F(x + h * .02)},${F(y - h * .55)}" stroke="${T("#8a6040")}" stroke-width="${F(h * .02)}" fill="none"/>`;
    const cr = [[cx, cy, rx, ry * .85], [cx - rx * .55, cy + ry * .25, rx * .55, ry * .6], [cx + rx * .58, cy + ry * .2, rx * .55, ry * .6], [cx, cy - ry * .5, rx * .6, ry * .5]];
    const inC = (px, py) => cr.some(([a, b, c, d]) => ((px - a) / c) ** 2 + ((py - b) / d) ** 2 < 1);
    const c = [];
    for (let i = 0; i < n * 3 && c.length < n; i++) { const px = cx - rx * 1.2 + r() * rx * 2.4, py = cy - ry * 1.2 + r() * ry * 2.2;
      if (!inC(px, py)) continue;
      const nx = (px - cx) / (rx * 1.2), ny = (py - cy) / (ry * 1.2), lit = (nx * ux + ny * uy) * .5 + .5, e = Math.min(1, Math.hypot(nx, ny));
      c.push([px, py, cl(lit * .72 + e * .15 + (r() - .5) * .3), h * (.035 + r() * .03)]); }
    c.sort((a, b) => a[2] - b[2]);
    let cg = ""; c.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${T(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    if (fruit) for (let k = 0; k < fruit; k++) { const [px, py] = c[Math.floor(r() * c.length)] || [cx, cy]; cg += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(h * .018)}" fill="${T("#c02a1e")}"/><circle cx="${F(px + h * .006)}" cy="${F(py - h * .006)}" r="${F(h * .007)}" fill="${T("#ff8a6a")}"/>`; }
    return g + `<g filter="url(#ppLeafyS)">${cg}</g>`;
  };
  const PK = { o: ["#7a2e0e", "#b04a16", "#dc6a1c", "#f2923a", "#fcc070"], y: ["#7a5210", "#b8781c", "#e4a028", "#f6c24c", "#fde49a"],
    w: ["#7a7264", "#aea48e", "#dcd2bc", "#f0e8d6", "#fffaf0"], d: ["#5a1e0a", "#8a3410", "#b8501a", "#d8742c", "#f0a050"] };
  const pumpkin = (x, y, R, kind = "o", jack = false) => {
    const P = PK[kind].map(T), sd = LX > x ? 1 : -1, rx = R * 1.18, ry = R * .8, cy = y - ry;
    let g = `<ellipse cx="${F(x - sd * R * .35)}" cy="${F(y + R * .04)}" rx="${F(R * 1.45)}" ry="${F(R * .26)}" fill="#000" opacity=".26"/>`;
    g += `<ellipse cx="${F(x)}" cy="${F(cy)}" rx="${F(rx)}" ry="${F(ry)}" fill="${P[1]}"/>`;
    [[-.6, .46], [.6, .46], [-.3, .5], [.3, .5], [0, .42]].forEach(([u, w]) => { const v = u === 0 ? 2 : 2 + Math.round(u * sd * 1.6);
      g += `<ellipse cx="${F(x + u * rx * .9)}" cy="${F(cy + Math.abs(u) * ry * .04)}" rx="${F(rx * w)}" ry="${F(ry * (1 - Math.abs(u) * .12))}" fill="${P[Math.max(1, Math.min(3, v))]}"/>`; });
    [-.45, -.15, .15, .45].forEach(u => g += `<path d="M${F(x + u * rx * .9)},${F(cy - ry * .9)} Q${F(x + u * rx * 1.25)},${F(cy)} ${F(x + u * rx * .9)},${F(cy + ry * .92)}" stroke="${P[0]}" stroke-width="${F(Math.max(.8, R * .06))}" fill="none" opacity=".55"/>`);
    g += `<ellipse cx="${F(x + sd * rx * .42)}" cy="${F(cy - ry * .35)}" rx="${F(rx * .2)}" ry="${F(ry * .32)}" fill="${P[4]}" opacity=".75"/>`;
    g += `<path d="M${F(x - sd * rx * .95)},${F(cy + ry * .1)} Q${F(x - sd * rx * .7)},${F(cy + ry * .95)} ${F(x)},${F(cy + ry)}" stroke="${P[0]}" stroke-width="${F(R * .14)}" fill="none" opacity=".45"/>`;
    g += `<path d="M${F(x - R * .08)},${F(cy - ry * .82)} q${F(R * .02)},${F(-R * .35)} ${F(R * .22)},${F(-R * .48)} l${F(R * .1)},${F(R * .12)} q${F(-R * .14)},${F(R * .12)} ${F(-R * .12)},${F(R * .38)}Z" fill="${T("#5a6a2a")}"/><path d="M${F(x - R * .02)},${F(cy - ry * .9)} q${F(R * .04)},${F(-R * .25)} ${F(R * .2)},${F(-R * .36)}" stroke="${T("#a8b060")}" stroke-width="${F(Math.max(.6, R * .05))}" fill="none"/>`;
    if (jack) { const lit = NIGHT, fc = lit ? "#ffd868" : T("#3a1606");
      if (lit) g = `<circle cx="${F(x)}" cy="${F(cy)}" r="${F(R * 3.2)}" fill="url(#ppGlow)" opacity=".75"/>` + g;
      g += `<path d="M${F(x - rx * .5)},${F(cy - ry * .1)} l${F(rx * .16)},${F(-ry * .36)} l${F(rx * .16)},${F(ry * .36)}Z M${F(x + rx * .18)},${F(cy - ry * .1)} l${F(rx * .16)},${F(-ry * .36)} l${F(rx * .16)},${F(ry * .36)}Z" fill="${fc}"/>`;
      g += `<path d="M${F(x - rx * .55)},${F(cy + ry * .18)} Q${F(x)},${F(cy + ry * .78)} ${F(x + rx * .55)},${F(cy + ry * .18)} L${F(x + rx * .36)},${F(cy + ry * .3)} L${F(x + rx * .26)},${F(cy + ry * .2)} L${F(x + rx * .14)},${F(cy + ry * .34)} L${F(x)},${F(cy + ry * .24)} L${F(x - rx * .14)},${F(cy + ry * .34)} L${F(x - rx * .26)},${F(cy + ry * .2)} L${F(x - rx * .36)},${F(cy + ry * .3)}Z" fill="${fc}"/>`;
      if (lit) g += `<path d="M${F(x - rx * .5)},${F(cy - ry * .1)} l${F(rx * .16)},${F(-ry * .36)} l${F(rx * .16)},${F(ry * .36)}Z" fill="#fff6c0" opacity=".6"/>`; }
    return g; };
  const bale = (x, y, w, h, d) => {   // rectangular straw bale; front face, lit right end, top
    const C = ["#a88430", "#c8a448", "#e4c66a", "#f4dc90"].map(T);
    let g = `<path d="${poly([[x, y], [x + w, y], [x + w, y - h], [x, y - h]])}" fill="${C[1]}"/>`;
    g += `<path d="${poly([[x + w, y], [x + w + d, y - d * .5], [x + w + d, y - h - d * .5], [x + w, y - h]])}" fill="${C[2]}"/>`;
    g += `<path d="${poly([[x, y - h], [x + w, y - h], [x + w + d, y - h - d * .5], [x + d, y - h - d * .5]])}" fill="${C[3]}"/>`;
    for (let k = 0; k < w * h / 18; k++) { const px = x + r() * w, py = y - r() * h;
      g += `<path d="M${F(px)},${F(py)} l${F(3 + r() * 5)},${F((r() - .5) * 2)}" stroke="${r() < .5 ? C[0] : C[3]}" stroke-width=".9" opacity=".8"/>`; }
    g += `<path d="M${F(x + w * .3)},${F(y)} v${F(-h)} l${F(d)},${F(-d * .5)} M${F(x + w * .7)},${F(y)} v${F(-h)} l${F(d)},${F(-d * .5)}" stroke="${T("#6a4a20")}" stroke-width="1.3" fill="none" opacity=".7"/>`;
    return g; };

  /* ------------------------------------------------------------- far land */
  const m1 = wave([1, 2, 4], [300, 140, 60], [24, 10, 4]), m2 = wave([3, 5, 1], [360, 150, 70], [18, 9, 4]);
  const far1 = x => 408 + m1(x), far2 = x => 438 + m2(x);
  s += `<path d="${ridgePath(far1)}" fill="url(#ppFar1)"/>`;
  s += `<g filter="url(#ppLeafyS)" opacity=".7">${forest(far1, 1, 6, .7, .1)}</g>`;
  s += `<path d="${ridgePath(far2)}" fill="url(#ppFar2)"/>`;
  s += `<g filter="url(#ppLeafyS)" opacity=".85">${forest(far2, 2, 7, .55, .12)}</g>`;
  s += `<rect x="0" y="390" width="${W}" height="110" fill="url(#ppHaze)"/>`;
  const h1 = wave([2, 4, 0], [300, 130, 55], [12, 6, 3]);
  const hill1 = x => 462 + h1(x);
  s += `<path d="${ridgePath(hill1)}" fill="url(#ppHill)"/>`;
  s += `<g filter="url(#ppLeafyS)">${forest(hill1, 3, 12, .3, .12)}</g>`;
  s += `<rect x="0" y="462" width="${W}" height="60" fill="url(#ppHaze)" opacity=".5"/>`;

  /* farm ground */
  const fg = wave([5, 1, 3], [380, 160, 70], [6, 3, 1.5]);
  const farm = x => 492 + fg(x);
  s += `<path d="${ridgePath(farm)}" fill="url(#ppFarm)"/>`;
  for (let k = 0; k < 500; k++) { const x = r() * W, y = farm(x) + 4 + r() * 60;
    s += `<path d="M${F(x)},${F(y)} q${F(-1 + r() * 2)},-3 ${F(-2 + r() * 4)},${F(-4 - r() * 4)}" stroke="${T(r() < .5 ? "#d8c878" : "#7a7434")}" stroke-width="1.3" fill="none" opacity=".6"/>`; }

  /* corn maze on the left: a quad of corn with lanes carved by a maze */
  { const Q = [[150, 494], [880, 491], [960, 548], [40, 550]];         // far-left, far-right, near-right, near-left
    const at = (u, v) => { const a = lerp(Q[0], Q[1], u), b = lerp(Q[3], Q[2], u); return lerp(a, b, v); };
    s += `<path d="${poly(Q)}" fill="${T("#c8a868")}"/>`;
    const CW = 15, CH = 4, GW = CW * 2 + 1, GH = CH * 2 + 1, open = Array.from({ length: GH }, () => Array(GW).fill(false));
    const MR = rng(seed + 5), seen = new Set(), st = [[0, 0]]; seen.add("0,0"); open[1][1] = true;
    while (st.length) { const [cx, cy] = st[st.length - 1], nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy]).filter(([a, b]) => a >= 0 && b >= 0 && a < CW && b < CH && !seen.has(a + "," + b));
      if (!nb.length) { st.pop(); continue; }
      const [nx, ny] = nb[Math.floor(MR() * nb.length)]; seen.add(nx + "," + ny);
      open[ny * 2 + 1][nx * 2 + 1] = true; open[cy + ny + 1][cx + nx + 1] = true; st.push([nx, ny]); }
    open[GH - 1][GW - 2] = true; open[GH - 1][GW - 3] = false;           // entrance at the near right
    open[0][1] = true;
    // dirt lanes shading, then corn blocks far to near
    const CORN = ["#6a5424", "#8a7034", "#a88c44", "#c8a858", "#e0c878", "#f4e0a0"];
    let cn = "";
    for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
      if (open[gy][gx]) { const p = at((gx + .5) / GW, (gy + .5) / GH); cn += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(14)}" ry="2" fill="${T("#a88a52")}" opacity=".5"/>`; continue; }
      const n = 7;
      for (let k = 0; k < n; k++) { const u = (gx + r()) / GW, v = (gy + r()) / GH, [x, y] = at(u, v), sc = .7 + v * .55, h = (22 + r() * 8) * sc;
        const lit = cl(.45 + (r() - .3) * .5);
        cn += `<path d="M${F(x)},${F(y)} q${F((r() - .5) * 3)},${F(-h * .5)} ${F((r() - .5) * 4)},${F(-h)}" stroke="${T(CORN[1 + Math.floor(lit * 3)])}" stroke-width="${F(1.3 * sc)}" fill="none"/>`;
        cn += `<path d="M${F(x)},${F(y - h * .45)} q${F(5 * sc)},${F(-4 * sc)} ${F(9 * sc)},${F(1 * sc)} M${F(x)},${F(y - h * .65)} q${F(-5 * sc)},${F(-4 * sc)} ${F(-9 * sc)},${F(1 * sc)}" stroke="${T(CORN[2 + Math.floor(r() * 3)])}" stroke-width="${F(1.4 * sc)}" fill="none"/>`;
        cn += `<path d="M${F(x)},${F(y - h)} l${F(-2 * sc)},${F(-5 * sc)} M${F(x)},${F(y - h)} l${F(2 * sc)},${F(-5 * sc)}" stroke="${T(CORN[5])}" stroke-width="1" fill="none"/>`; }
    }
    s += `<g filter="url(#ppLeafyS)">${cn}</g>`;
  }

  /* corn shocks between the maze and the barn */
  const shock = (x, y, h) => {
    let g = `<ellipse cx="${F(x - 12)}" cy="${F(y + 2)}" rx="${F(h * .5)}" ry="${F(h * .07)}" fill="#000" opacity=".2"/>`;
    const w = h * .36, CS = ["#8a6e2c", "#a88838", "#c8a452", "#dcc06a", "#eed688"];
    for (let k = 0; k < 40; k++) { const u = k / 39, bx = x - w + u * 2 * w + (r() - .5) * 4, tx = x + (bx - x) * .12, lit = ((bx - x) / w * .5 + .5) * .8 + r() * .25;
      g += `<path d="M${F(bx)},${F(y)} Q${F((bx + tx) / 2)},${F(y - h * .5)} ${F(tx)},${F(y - h * .78)}" stroke="${T(CS[Math.min(4, Math.floor(lit * 5))])}" stroke-width="2.2" fill="none"/>`; }
    for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (r() - .5) * 1.4;
      g += `<path d="M${F(x)},${F(y - h * .78)} q${F(Math.cos(a) * 6)},${F(Math.sin(a) * 10)} ${F(Math.cos(a) * 14)},${F(Math.sin(a) * 22)}" stroke="${T(r() < .5 ? "#c8a452" : "#eed688")}" stroke-width="1.8" fill="none"/>`; }
    return g + `<path d="M${F(x - w * .16)},${F(y - h * .7)} L${F(x + w * .16)},${F(y - h * .7)}" stroke="${T("#a83a22")}" stroke-width="3"/>`; };
  [[1010, 520, 54], [1064, 516, 48], [1118, 522, 56]].forEach(([x, y, h]) => s += shock(x, y, h));

  /* orchard and farmhouse on the right */
  const ORCH = ["#2e3e1a", "#44561e", "#5e6e24", "#7a7a2a", "#a07a2a", "#c8902e", "#e8b448", "#f6d878"];
  { const x = 2210, y = 506;      // farmhouse, white clapboard with a porch
    s += `<ellipse cx="${x - 20}" cy="${y + 2}" rx="90" ry="6" fill="#000" opacity=".16"/>`;
    s += `<path d="${poly([[x - 50, y], [x + 40, y], [x + 40, y - 50], [x - 50, y - 50]])}" fill="${T("#e2dccc")}"/><path d="${poly([[x + 40, y], [x + 76, y - 6], [x + 76, y - 56], [x + 40, y - 50]])}" fill="${T("#fbf6ea")}"/>`;
    for (let k = 1; k < 9; k++) s += `<path d="M${x - 50},${y - 50 + k * 5.5} h90 l36,-6" stroke="${T("#b8b0a0")}" stroke-width=".8" fill="none" opacity=".7"/>`;
    s += `<path d="${poly([[x - 56, y - 48], [x - 5, y - 86], [x + 46, y - 48]])}" fill="${T("#e8e2d2")}"/><path d="${poly([[x - 5, y - 86], [x + 30, y - 92], [x + 82, y - 54], [x + 46, y - 48]])}" fill="${T("#6a4a40")}"/><path d="M${x - 56},${y - 48} L${x - 5},${y - 86} L${x + 46},${y - 48}" stroke="${T("#5a3e36")}" stroke-width="4" fill="none"/><path d="M${x - 5},${y - 86} L${x + 30},${y - 92}" stroke="${RIM}" stroke-width="1.4" opacity=".6"/>`;
    s += `<rect x="${x + 50}" y="${y - 104}" width="10" height="24" fill="${T("#8a4a3a")}"/><rect x="${x + 55}" y="${y - 104}" width="5" height="24" fill="${T("#b86a50")}"/>`;
    [[x - 38, y - 40], [x + 14, y - 40], [x - 12, y - 74], [x + 50, y - 44], [x + 62, y - 46]].forEach(([wx, wy], i) => {
      s += `<rect x="${wx}" y="${wy}" width="${i > 2 ? 8 : 12}" height="15" fill="${NIGHT ? "url(#ppPane)" : T("#6a86a0")}"/><path d="M${wx + (i > 2 ? 4 : 6)},${wy} v15" stroke="${T("#f4efe4")}" stroke-width="1"/>`;
      if (NIGHT) s += `<circle cx="${wx + 6}" cy="${wy + 8}" r="20" fill="url(#ppGlow)" opacity=".5"/>`; });
    s += `<path d="${poly([[x - 56, y - 22], [x + 44, y - 22], [x + 48, y - 15], [x - 60, y - 15]])}" fill="${T("#8a3a2a")}"/>`;
    for (let k = 0; k < 6; k++) s += `<rect x="${x - 54 + k * 19}" y="${y - 15}" width="2.5" height="15" fill="${T("#fbf6ea")}"/>`;
    s += pumpkin(x - 30, y + 1, 5) + pumpkin(x - 18, y + 2, 4, "w") + pumpkin(x + 28, y + 2, 5, "o", true);
    s += `<g class="smoke" opacity=".45">${[0, 1, 2, 3, 4].map(k => `<circle cx="${F(x + 55 + k * 7)}" cy="${F(y - 112 - k * 18)}" r="${5 + k * 4}" fill="${NIGHT ? "#8a88a8" : "#ece6e0"}" opacity="${F(.55 - k * .1)}"/>`).join("")}</g>`; }
  [[1920, 522, 74], [1990, 516, 66], [2060, 524, 78], [2350, 514, 70], [2420, 522, 80], [2500, 516, 70], [2560, 524, 76]].forEach(([x, y, h]) => s += leafTree(x, y, h, 110, ORCH, 7));

  /* the farm windmill */
  { const x = 1830, y = 520, top = 372;
    let g = `<ellipse cx="${x - 14}" cy="${y + 2}" rx="34" ry="4" fill="#000" opacity=".2"/>`;
    const legs = [[-24, -4], [24, 4], [-12, -2], [12, 2]];
    legs.forEach(([b, t], i) => g += `<path d="M${x + b},${y} L${x + t},${top + 8}" stroke="${T(i % 2 ? "#a8a8a8" : "#6a6a72")}" stroke-width="${i > 1 ? 1.6 : 2.4}"/>`);
    for (let k = 1; k < 7; k++) { const t = k / 7, y1 = y - (y - top) * t, w1 = 24 * (1 - t) + 4 * t, y2 = y - (y - top) * (k + 1) / 7, w2 = 24 * (1 - (k + 1) / 7) + 4 * (k + 1) / 7;
      g += `<path d="M${F(x - w1)},${F(y1)} L${F(x + w2)},${F(y2)} M${F(x + w1)},${F(y1)} L${F(x - w2)},${F(y2)} M${F(x - w1)},${F(y1)} L${F(x + w1)},${F(y1)}" stroke="${T("#8a8a92")}" stroke-width="1" opacity=".85"/>`; }
    g += `<rect x="${x - 6}" y="${top}" width="12" height="10" fill="${T("#5a5a62")}"/><path d="M${x + 2},${top + 4} L${x + 52},${top + 2} L${x + 64},${top - 10} L${x + 64},${top + 14} L${x + 52},${top + 6}Z" fill="${T("#b8302a")}"/><path d="M${x + 52},${top + 2} L${x + 64},${top - 10} L${x + 64},${top + 1}Z" fill="${T("#e05a40")}"/>`;
    const hx = x - 4, hy = top + 4;
    g += `<ellipse cx="${hx}" cy="${hy}" rx="34" ry="36" fill="none" stroke="${T("#6a6a72")}" stroke-width="1.2"/>`;
    for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, a2 = a + .14, R1 = 10, R2 = 36;
      g += `<path d="${poly([[hx + Math.cos(a) * R1 * .9, hy + Math.sin(a) * R1], [hx + Math.cos(a) * R2 * .9, hy + Math.sin(a) * R2], [hx + Math.cos(a2) * R2 * .9, hy + Math.sin(a2) * R2], [hx + Math.cos(a2) * R1 * .9, hy + Math.sin(a2) * R1]])}" fill="${T(Math.cos(a) > 0 ? "#e8e4dc" : "#a8a6a4")}"/>`; }
    g += `<circle cx="${hx}" cy="${hy}" r="7" fill="${T("#4a4a52")}"/><circle cx="${hx + 2}" cy="${hy - 2}" r="2.5" fill="${RIM}" opacity=".7"/>`;
    s += g; }

  /* the red gambrel barn, three-quarter view: shaded long side, lit gable end */
  { const RED = "#b0342a", RED_D = "#7a2620", RED_L = "#d0503a", TRIM = "#f4ead6", ROOF = "#5a5250", ROOF_L = "#7a706a";
    const BL = [1580, 528], BR = [1736, 518], EL = [1580, 442], ER = [1736, 434], KL = [1598, 398], KR = [1718, 392], P = [1658, 368];
    const SB = [1388, 514], SE = [1388, 450];
    let b = `<ellipse cx="1520" cy="530" rx="240" ry="12" fill="#000" opacity=".22"/>`;
    // long side wall (shaded)
    b += `<path d="${poly([SB, BL, EL, SE])}" fill="${T(RED_D)}"/>`;
    for (let x = 1392; x < 1580; x += 7) { const t = (x - 1388) / 192, yb = 514 + t * 14, yt = 450 - t * 8;
      b += `<path d="M${x},${F(yb)} L${x},${F(yt)}" stroke="${T(mix(RED_D, "#000000", .25))}" stroke-width="1"/>`; }
    b += `<path d="${poly([[1430, 517], [1520, 523], [1520, 470], [1430, 465]])}" fill="${T(TRIM)}"/><path d="${poly([[1434, 516], [1516, 521], [1516, 474], [1434, 469]])}" fill="${T("#6a1e1a")}"/>`;
    b += `<path d="M1434,516 L1516,474 M1434,469 L1516,521 M1475,467 L1475,519" stroke="${T(TRIM)}" stroke-width="3"/>`;
    [[1404, 470], [1540, 478]].forEach(([x, y]) => b += `<path d="${poly([[x, y], [x + 18, y + 1], [x + 18, y + 17], [x, y + 16]])}" fill="${T(TRIM)}"/><path d="${poly([[x + 2, y + 2], [x + 16, y + 3], [x + 16, y + 15], [x + 2, y + 14]])}" fill="${NIGHT ? "url(#ppPane)" : T("#3a2a28")}"/>`);
    b += `<path d="${poly([SB, BL, [1580, 532], [1388, 518]])}" fill="${T("#5a4a40")}"/>`;
    // gable end (lit)
    b += `<path d="${poly([BL, BR, ER, KR, P, KL, EL])}" fill="${T(RED)}"/>`;
    for (let x = 1584; x < 1736; x += 7) { const t = (x - 1580) / 156, yb = 528 - t * 10;
      const yt = x < 1598 ? 442 - (x - 1580) / 18 * 44 : x < 1658 ? 398 - (x - 1598) / 60 * 30 : x < 1718 ? 368 + (x - 1658) / 60 * 24 : 392 + (x - 1718) / 18 * 42;
      b += `<path d="M${x},${F(yb)} L${x},${F(yt + 3)}" stroke="${T(mix(RED, "#000000", .22))}" stroke-width="1.1"/><path d="M${x + 2},${F(yb)} L${x + 2},${F(yt + 3)}" stroke="${T(RED_L)}" stroke-width=".8" opacity=".6"/>`; }
    b += `<path d="${poly([BL, BR, ER, KR, P, KL, EL])}" fill="url(#ppRoofSh)"/>`;
    // big doors, X braced, and the hayloft door
    const door = (x0, y0, x1, y1, yt0, yt1) => `<path d="${poly([[x0, y0], [x1, y1], [x1, yt1], [x0, yt0]])}" fill="${T(TRIM)}"/><path d="${poly([[x0 + 4, y0 - 1], [x1 - 4, y1 - 1], [x1 - 4, yt1 + 4], [x0 + 4, yt0 + 4]])}" fill="${T(RED_D)}"/><path d="M${x0 + 4},${y0 - 1} L${x1 - 4},${yt1 + 4} M${x0 + 4},${yt0 + 4} L${x1 - 4},${y1 - 1}" stroke="${T(TRIM)}" stroke-width="3.5"/>`;
    b += door(1612, 526, 1658, 523, 470, 467) + door(1658, 523, 1704, 520, 467, 464);
    b += `<path d="M1610,${470} L1706,${463}" stroke="${T("#3a3a3a")}" stroke-width="3"/>`;
    b += `<path d="${poly([[1644, 438], [1674, 436], [1674, 404], [1644, 406]])}" fill="${T(TRIM)}"/><path d="${poly([[1648, 435], [1670, 433], [1670, 408], [1648, 410]])}" fill="${NIGHT ? "url(#ppPane)" : T("#3a2220")}"/>`;
    if (NIGHT) b += `<circle cx="1659" cy="422" r="44" fill="url(#ppGlow)" opacity=".7"/>`;
    else b += `<path d="${poly([[1650, 433], [1668, 432], [1668, 420], [1650, 422]])}" fill="${T("#e4c66a")}"/>`;
    b += `<path d="M1658,394 v-6 M1646,404 L1672,402" stroke="${T("#3a3a3a")}" stroke-width="2"/>`;
    // roof: side planes with shingle courses, then gable trim
    const RL = [EL, KL, [1416, 408], SE], RU = [KL, P, [1452, 382], [1416, 408]];
    b += `<path d="${poly(RL)}" fill="${T(ROOF)}"/><path d="${poly(RU)}" fill="${T(ROOF_L)}"/>`;
    for (let k = 1; k < 6; k++) { const t = k / 6; b += `<path d="${line([lerp(EL, KL, t), lerp(SE, [1416, 408], t)])}" stroke="${T("#3e3836")}" stroke-width="1.2"/>`; }
    for (let k = 1; k < 5; k++) { const t = k / 5; b += `<path d="${line([lerp(KL, P, t), lerp([1416, 408], [1452, 382], t)])}" stroke="${T("#4e4644")}" stroke-width="1.1"/>`; }
    b += `<path d="${line([P, [1452, 382]])}" stroke="${T("#3e3836")}" stroke-width="4"/><path d="${line([P, [1452, 381]])}" stroke="${RIM}" stroke-width="1.4" opacity=".6" transform="translate(0,-2)"/>`;
    b += `<path d="${line([[EL[0] - 4, EL[1] + 4], KL, P, KR, [ER[0] + 4, ER[1] + 4]])}" stroke="${T(TRIM)}" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="${line([P, KR, [ER[0] + 4, ER[1] + 4]])}" stroke="${RIM}" stroke-width="1.6" fill="none" opacity=".8"/>`;
    // cupola with a rooster vane
    { const x = 1530, y = 380;
      b += `<path d="${poly([[x - 14, y + 6], [x + 14, y + 4], [x + 14, y - 16], [x - 14, y - 14]])}" fill="${T(RED)}"/><path d="${poly([[x - 10, y + 2], [x + 10, y + 1], [x + 10, y - 12], [x - 10, y - 11]])}" fill="${T(TRIM)}"/><path d="M${x - 10},${y + 2} L${x + 10},${y - 12} M${x - 10},${y - 11} L${x + 10},${y + 1}" stroke="${T("#5a2420")}" stroke-width="1.5"/>`;
      b += `<path d="${poly([[x - 20, y - 14], [x, y - 32], [x + 20, y - 16]])}" fill="${T(ROOF)}"/><path d="M${x},${y - 32} L${x + 20},${y - 16}" stroke="${RIM}" stroke-width="1.2" opacity=".7"/><path d="M${x},${y - 32} v-14" stroke="${T("#2a2a2a")}" stroke-width="1.6"/>`;
      b += `<path d="M${x - 8},${y - 50} q4,-8 10,-6 l2,-4 l2,5 q4,1 6,6 l-8,1 l-1,4 l-4,-4Z" fill="${T("#2a2a2a")}"/>`; }
    // lantern over the doors
    b += `<path d="M1652,452 h12 v6" stroke="${T("#2a2a2a")}" stroke-width="2" fill="none"/><rect x="1658" y="458" width="12" height="15" rx="2" fill="${NIGHT ? LAMP : T("#3a3a3a")}" stroke="${T("#222222")}" stroke-width="1.5"/>`;
    if (NIGHT) b += `<circle cx="1664" cy="466" r="58" fill="url(#ppGlow)" opacity=".75"/>`;
    s += b;
    // bale stack with pumpkins and mums against the barn's end
    s += bale(1740, 534, 44, 18, 14) + bale(1786, 532, 44, 18, 14) + bale(1758, 516, 44, 18, 14);
    s += pumpkin(1764, 498, 9) + pumpkin(1790, 497, 7, "w") + pumpkin(1812, 499, 8, "y");
    const mum = (x, y, R, c) => { let g = `<path d="${poly([[x - R, y - R * .6], [x + R, y - R * .6], [x + R * .8, y + R * .5], [x - R * .8, y + R * .5]])}" fill="${T("#8a5a32")}"/><path d="M${F(x - R)},${F(y - R * .3)} h${F(2 * R)}" stroke="${T("#5a3a20")}" stroke-width="1.5"/>`;
      for (let k = 0; k < 40; k++) { const a = r() * Math.PI, d = Math.sqrt(r()) * R * 1.1, px = x - Math.cos(a) * d, py = y - R * .6 - Math.sin(a) * d * .8, v = cl((px - x) / R * .4 + .5 + (r() - .5) * .4);
        g += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(R * .16)}" fill="${T(mix(c, v > .5 ? "#ffffff" : "#000000", Math.abs(v - .5) * .6))}"/>`; }
      return g; };
    s += mum(1850, 540, 12, "#c8902a") + mum(1878, 544, 11, "#a03a6a") + mum(1556, 540, 12, "#d8a020");
  }

  /* string lights from the barn to two poles */
  { const poles = [[1736, 440], [1900, 470], [2050, 486]];
    let g = "";
    [[1900, 548], [2050, 556]].forEach(([x, y]) => g += `<rect x="${x - 2.5}" y="${y - 82}" width="5" height="82" fill="${T("#5a3e28")}"/><rect x="${x + .5}" y="${y - 82}" width="2" height="82" fill="${T("#9a7048")}"/>`);
    for (let i = 0; i < poles.length - 1; i++) { const [x0, y0] = poles[i], [x1, y1] = poles[i + 1], sag = 22;
      g += `<path d="M${x0},${y0} Q${(x0 + x1) / 2},${(y0 + y1) / 2 + sag * 2} ${x1},${y1}" stroke="${T("#2a2a2a")}" stroke-width="1.2" fill="none"/>`;
      for (let k = 1; k < 12; k++) { const t = k / 12, x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * (x0 + x1) / 2 + t * t * x1, y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * ((y0 + y1) / 2 + sag * 2) + t * t * y1;
        const c = ["#ffb040", "#ffd060", "#ff8a30"][k % 3];
        if (NIGHT) g += `<circle cx="${F(x)}" cy="${F(y + 4)}" r="9" fill="url(#ppGlow)" opacity=".7"/>`;
        g += `<ellipse cx="${F(x)}" cy="${F(y + 4)}" rx="2.6" ry="3.4" fill="${NIGHT ? c : T(mix(c, "#ffffff", .3))}"/>`; } }
    s += g; }

  /* the pumpkin patch in perspective rows */
  const VPX = 1260, VPY = 430, TOP = 548;
  s += `<path d="${ridgePath(x => TOP + Math.sin(x / 300) * 3)}" fill="url(#ppSoil)"/>`;

  /* the farm lane, from the bottom up to the barn doors */
  s += `<path d="M1420,720 C1470,650 1520,600 1600,560 C1630,546 1650,534 1660,526 L1690,526 C1690,540 1680,556 1660,570 C1610,612 1600,660 1600,720Z" fill="url(#ppLane)"/>`;
  for (let k = 0; k < 120; k++) { const t = r(), y = 526 + t * 194, xc = 1675 - t * (1675 - 1510) + Math.sin(t * 3) * 10, w = 16 + t * 80;
    s += `<ellipse cx="${F(xc + (r() - .5) * w)}" cy="${F(y)}" rx="${F(1 + t * 3)}" ry="${F(.8 + t * 1.2)}" fill="${T(r() < .5 ? "#a08458" : "#f4e4c0")}" opacity=".6"/>`; }

  const rows = []; for (let xb = -2200; xb < 4800; xb += 150) rows.push(xb);
  const rowX = (xb, y) => VPX + (xb - VPX) * (y - VPY) / (720 - VPY);
  // furrows of straw mulch between rows
  rows.forEach(xb => { const a = [rowX(xb + 75, TOP), TOP], b = [rowX(xb + 75, 720), 720];
    s += `<path d="${line([a, b])}" stroke="${T("#c8b070")}" stroke-width="10" opacity=".25"/>`; });
  // vines and leaves along each row, then pumpkins, all sorted far to near
  const items = [];
  rows.forEach(xb => {
    for (let y = TOP + 2; y < 726; y += 2 + (y - TOP) * .03) { const x = rowX(xb, y), sc = .3 + (y - TOP) / 172 * 1.3;
      if (x < -60 || x > W + 60) continue;
      if (x > 1410 && x < 1700 && y > 520) { const lc = 1675 - (y - 526) / 194 * 165; if (Math.abs(x - lc) < 30 + (y - 526) * .45) continue; }
      for (let k = 0; k < 2; k++) if (r() < .8) items.push([y + k * .2, "leaf", x + (r() - .5) * 46 * sc, sc * (1.2 + r() * .6)]);
      if (r() < .09) items.push([y + .5, "pk", x + (r() - .5) * 30 * sc, sc]); } });
  items.sort((a, b) => a[0] - b[0]);
  const LEAF = ["#2e4418", "#40581e", "#557024", "#6e8a2c", "#93a238", "#c0b048"];
  let pp = "", vn = "";
  rows.forEach(xb => { let d = ""; for (let y = TOP + 2; y < 720; y += 6) { const x = rowX(xb, y) + Math.sin(y / 9 + xb) * (2 + (y - TOP) * .06); d += (d ? " L" : "M") + F(x) + "," + F(y); }
    vn += `<path d="${d}" stroke="${T("#5a6a24")}" stroke-width="2" fill="none" opacity=".7"/>`; });
  s += vn;
  items.forEach(([y, k, x, sc]) => {
    if (k === "leaf") { const R = 7 * sc, v = cl(.55 + (r() - .5) * .7), c = LEAF[Math.floor(v * LEAF.length)];
      pp += `<path d="${blobP(x, y - R * .4, R, R * .65, 6)}" fill="${T(mix(c, "#000000", .25))}"/><path d="${blobP(x + R * .15, y - R * .55, R * .78, R * .5, 6)}" fill="${T(c)}"/><path d="M${F(x)},${F(y - R * .3)} l${F(R * .5)},${F(-R * .35)}" stroke="${T("#c8c070")}" stroke-width="${F(Math.max(.5, sc * .7))}" opacity=".6"/>`;
      if (r() < .25) pp += `<path d="M${F(x)},${F(y)} q${F(R)},${F(-R * .6)} ${F(R * .4)},${F(-R * 1.2)} q${F(-R * .6)},${F(-R * .2)} ${F(-R * .1)},${F(-R * .6)}" stroke="${T("#7a8a30")}" stroke-width="${F(Math.max(.5, sc * .6))}" fill="none"/>`; }
    else { const R = (10 + r() * 8) * sc, kd = r() < .1 ? "w" : r() < .12 ? "y" : r() < .15 ? "d" : "o";
      pp += pumpkin(x, y, R, kd, NIGHT ? r() < .06 : (r() < 0 && false)); }
  });
  s += `<g filter="url(#ppLeafyS)">${pp}</g>`;

  /* the hay wagon on the lane, loaded with bales and pumpkins */
  { const x = 1150, y = 584;
    let g = `<ellipse cx="${x + 90}" cy="${y + 26}" rx="170" ry="12" fill="#000" opacity=".25"/>`;
    // far wheels peek out behind
    const wheel = (cx, cy, R) => { let w = `<ellipse cx="${cx}" cy="${cy}" rx="${R * .82}" ry="${R}" fill="none" stroke="${T("#5a3a22")}" stroke-width="${R * .18}"/><ellipse cx="${cx}" cy="${cy}" rx="${R * .82}" ry="${R}" fill="none" stroke="${T("#2a2a2a")}" stroke-width="2.5" transform="translate(1,0)"/>`;
      for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; w += `<path d="M${cx},${cy} L${F(cx + Math.cos(a) * R * .74)},${F(cy + Math.sin(a) * R * .92)}" stroke="${T("#7a5232")}" stroke-width="2.2"/>`; }
      return w + `<ellipse cx="${cx}" cy="${cy}" rx="${R * .2}" ry="${R * .24}" fill="${T("#3a2a1a")}"/><path d="M${F(cx - R * .7)},${F(cy - R * .5)} a${R * .82},${R} 0 0 1 ${R * 1.2},${-R * .45}" stroke="${RIM}" stroke-width="1.5" fill="none" opacity=".6"/>`; };
    g += wheel(x + 30, y + 2, 20) + wheel(x + 214, y - 2, 20);
    // bed: front face + top + lit right end
    g += `<path d="${poly([[x - 10, y - 6], [x + 240, y - 12], [x + 266, y - 24], [x + 16, y - 18]])}" fill="${T("#b8905a")}"/>`;
    g += `<path d="${poly([[x - 10, y - 6], [x + 240, y - 12], [x + 240, y + 6], [x - 10, y + 12]])}" fill="${T("#8a5a32")}"/>`;
    for (let k = 1; k < 3; k++) g += `<path d="M${x - 10},${y - 6 + k * 6} L${x + 240},${y - 12 + k * 6}" stroke="${T("#5a3a22")}" stroke-width="1"/>`;
    g += `<path d="${poly([[x + 240, y - 12], [x + 266, y - 24], [x + 266, y - 6], [x + 240, y + 6]])}" fill="${T("#c09060")}"/>`;
    // side rails
    for (let k = 0; k < 8; k++) { const px = x - 4 + k * 34, py = y - 8 - k * .8; g += `<rect x="${px}" y="${py - 30}" width="4" height="30" fill="${T("#6a4428")}"/><rect x="${px + 2.5}" y="${py - 30}" width="1.5" height="30" fill="${T("#c8a070")}"/>`; }
    // bales and pumpkins
    g += bale(x + 8, y - 16, 56, 22, 18) + bale(x + 66, y - 18, 56, 22, 18) + bale(x + 124, y - 19, 56, 22, 18) + bale(x + 182, y - 20, 50, 22, 18);
    g += bale(x + 40, y - 40, 56, 22, 18) + bale(x + 100, y - 41, 56, 22, 18);
    g += `<path d="M${x - 8},${y - 36} L${x + 234},${y - 42}" stroke="${T("#5a3a22")}" stroke-width="4"/><path d="M${x - 8},${y - 37.5} L${x + 234},${y - 43.5}" stroke="${RIM}" stroke-width="1" opacity=".5"/>`;
    g += pumpkin(x + 70, y - 66, 13, "o", true) + pumpkin(x + 104, y - 68, 10, "w") + pumpkin(x + 138, y - 67, 14) + pumpkin(x + 180, y - 44, 11, "y") + pumpkin(x + 214, y - 46, 12);
    // tongue
    g += `<path d="M${x - 10},${y + 4} L${x - 70},${y + 14}" stroke="${T("#5a3a22")}" stroke-width="5" stroke-linecap="round"/><path d="M${x - 70},${y + 14} l-6,-3" stroke="${T("#2a2a2a")}" stroke-width="3"/>`;
    g += wheel(x + 4, y + 14, 23) + wheel(x + 196, y + 10, 23);
    if (NIGHT) g += `<path d="M${x + 156},${y - 66} v-34 h8" stroke="${T("#2a2a2a")}" stroke-width="2" fill="none"/><rect x="${x + 160}" y="${y - 100}" width="10" height="14" rx="2" fill="${LAMP}" stroke="#222" stroke-width="1"/><circle cx="${x + 165}" cy="${y - 92}" r="60" fill="url(#ppGlow)" opacity=".75"/>`;
    s += g; }

  /* wooden signs */
  const sign = (x, y, txt, w, tilt, arrow) => {
    let g = `<g transform="rotate(${tilt} ${x} ${y})"><ellipse cx="${x - 6}" cy="${y + 2}" rx="${w * .5}" ry="4" fill="#000" opacity=".22"/>`;
    g += `<rect x="${x - 4}" y="${y - 70}" width="8" height="70" fill="${T("#5a3a22")}"/><rect x="${x + 1}" y="${y - 70}" width="3" height="70" fill="${T("#9a7048")}"/>`;
    const L = x - w / 2, R2 = x + w / 2, tp = y - 76, bt = y - 48;
    g += `<path d="${poly(arrow ? [[L, tp], [R2, tp], [R2 + 16, (tp + bt) / 2], [R2, bt], [L, bt]] : [[L, tp], [R2, tp], [R2, bt], [L, bt]])}" fill="${T("#b07a44")}"/>`;
    g += `<path d="M${L},${(tp + bt) / 2} H${R2 + (arrow ? 8 : 0)}" stroke="${T("#7a4a28")}" stroke-width="1"/><path d="M${L},${tp + 1} H${R2}" stroke="${RIM}" stroke-width="1.6" opacity=".7"/><path d="M${L},${bt - 1} H${R2}" stroke="#000" stroke-width="1.6" opacity=".25"/>`;
    g += `<text x="${x + (arrow ? 4 : 0)}" y="${bt - 8}" font-family="Georgia, serif" font-weight="bold" font-size="17" text-anchor="middle" fill="${T("#fff4dc")}">${txt}</text>`;
    return g + `</g>`; };
  s += sign(1530, 640, "PUMPKINS", 120, -3, true) + sign(1874, 600, "HAYRIDES", 112, 2, true) + sign(600, 604, "CORN MAZE", 130, -2, false);

  /* the scarecrow */
  { const x = 930, y = 660;
    let g = `<ellipse cx="${x - 40}" cy="${y + 4}" rx="90" ry="10" fill="#000" opacity=".25"/>`;
    // post and crossbar
    g += `<rect x="${x - 6}" y="${y - 300}" width="12" height="300" fill="${T("#6a4428")}"/><rect x="${x + 1}" y="${y - 300}" width="5" height="300" fill="${T("#a0744a")}"/>`;
    g += `<rect x="${x - 120}" y="${y - 214}" width="240" height="10" fill="${T("#6a4428")}"/><rect x="${x - 120}" y="${y - 214}" width="240" height="3" fill="${T("#a0744a")}"/>`;
    // straw legs hanging out of denim overalls
    const straw = (x0, y0, a, n, L) => { let st = ""; for (let k = 0; k < n; k++) { const b = a + (r() - .5) * .9, l = L * (.6 + r() * .6);
      st += `<path d="M${F(x0 + (r() - .5) * 8)},${F(y0)} q${F(Math.cos(b) * l * .5)},${F(Math.sin(b) * l * .5 + 2)} ${F(Math.cos(b) * l)},${F(Math.sin(b) * l)}" stroke="${T(["#c8a040", "#e4c460", "#f4dc88", "#a88030"][Math.floor(r() * 4)])}" stroke-width="1.6" fill="none"/>`; } return st; };
    g += `<path d="M${x - 34},${y - 120} L${x + 34},${y - 120} L${x + 30},${y - 50} L${x + 6},${y - 46} L${x + 2},${y - 92} L${x - 2},${y - 92} L${x - 6},${y - 46} L${x - 30},${y - 50}Z" fill="${T("#3e5a8a")}"/>`;
    g += `<path d="M${x + 4},${y - 118} L${x + 34},${y - 120} L${x + 30},${y - 50} L${x + 8},${y - 46}Z" fill="${T("#5a7aaa")}"/>`;
    g += `<path d="M${x - 30},${y - 50} L${x - 6},${y - 46} M${x + 6},${y - 46} L${x + 30},${y - 50}" stroke="${T("#2a3e62")}" stroke-width="3"/>`;
    g += `<rect x="${x + 12}" y="${y - 86}" width="12" height="12" fill="${T("#c8642a")}" transform="rotate(8 ${x + 18} ${y - 80})"/><path d="M${x + 13},${y - 85} l10,10 M${x + 23},${y - 85} l-10,10" stroke="${T("#7a3a1a")}" stroke-width=".8" transform="rotate(8 ${x + 18} ${y - 80})"/>`;
    g += straw(x - 18, y - 48, Math.PI / 2, 14, 20) + straw(x + 18, y - 48, Math.PI / 2, 14, 20);
    // plaid shirt: torso and sleeves along the crossbar
    const SH = "#c0392b", SH_L = "#e05a3a", SH_D = "#8a2620";
    g += `<path d="M${x - 38},${y - 214} L${x + 38},${y - 214} L${x + 40},${y - 118} L${x - 40},${y - 116}Z" fill="${T(SH)}"/>`;
    g += `<path d="M${x - 38},${y - 216} L${x - 118},${y - 220} L${x - 118},${y - 196} L${x - 38},${y - 188}Z" fill="${T(SH_D)}"/><path d="M${x + 38},${y - 216} L${x + 116},${y - 220} L${x + 116},${y - 196} L${x + 38},${y - 188}Z" fill="${T(SH_L)}"/>`;
    g += `<path d="M${x + 6},${y - 214} L${x + 38},${y - 214} L${x + 40},${y - 118} L${x + 8},${y - 117}Z" fill="${T(SH_L)}" opacity=".8"/>`;
    for (let k = 0; k < 11; k++) { const px = x - 116 + k * 23; g += `<path d="M${px},${y - 220} v26" stroke="${T("#f4d27a")}" stroke-width="1.6" opacity=".55"/><path d="M${px + 9},${y - 220} v26" stroke="${T("#3a1410")}" stroke-width="3" opacity=".35"/>`; }
    for (let k = 0; k < 5; k++) { const py = y - 208 + k * 20; g += `<path d="M${x - 39},${py} L${x + 39},${py}" stroke="${T("#3a1410")}" stroke-width="3.5" opacity=".35"/><path d="M${x - 39},${py + 8} L${x + 39},${py + 8}" stroke="${T("#f4d27a")}" stroke-width="1.6" opacity=".55"/>`; }
    for (let k = 0; k < 4; k++) { const px = x - 30 + k * 20; g += `<path d="M${px},${y - 214} v96" stroke="${T("#3a1410")}" stroke-width="3.5" opacity=".3"/>`; }
    g += `<path d="M${x - 14},${y - 214} L${x},${y - 196} L${x + 14},${y - 214}" fill="${T("#7a1e18")}"/>`;
    g += `<rect x="${x - 26}" y="${y - 170}" width="16" height="15" fill="${T("#e8b84a")}" transform="rotate(-10 ${x - 18} ${y - 162})"/><path d="M${x - 26},${y - 170} h16 v15 h-16Z" stroke="${T("#7a5a1a")}" stroke-width="1" stroke-dasharray="2 2" fill="none" transform="rotate(-10 ${x - 18} ${y - 162})"/>`;
    // overall bib and straps
    g += `<path d="M${x - 26},${y - 160} L${x + 26},${y - 160} L${x + 34},${y - 118} L${x - 34},${y - 118}Z" fill="${T("#3e5a8a")}"/><path d="M${x + 4},${y - 160} L${x + 26},${y - 160} L${x + 34},${y - 118} L${x + 6},${y - 118}Z" fill="${T("#5a7aaa")}"/>`;
    g += `<path d="M${x - 24},${y - 160} L${x - 30},${y - 212} M${x + 24},${y - 160} L${x + 30},${y - 212}" stroke="${T("#3e5a8a")}" stroke-width="6"/><circle cx="${x - 24}" cy="${y - 158}" r="3" fill="${T("#f0d080")}"/><circle cx="${x + 24}" cy="${y - 158}" r="3" fill="${T("#f0d080")}"/>`;
    // straw hands and collar straw
    g += straw(x - 118, y - 208, Math.PI, 16, 24) + straw(x + 116, y - 208, 0, 16, 24) + straw(x, y - 214, -Math.PI / 2, 10, 14);
    // burlap head with a stitched smile
    const hx = x + 2, hy = y - 246;
    g += `<path d="M${hx - 12},${hy + 30} L${hx + 12},${hy + 30} L${hx + 8},${hy + 18} L${hx - 8},${hy + 18}Z" fill="${T("#b89a68")}"/><path d="M${hx - 13},${hy + 26} h26" stroke="${T("#7a5a2a")}" stroke-width="3"/>`;
    g += `<path d="${blobP(hx, hy, 33, 30, 10)}" fill="${T("#c8aa78")}"/><path d="${blobP(hx + 10, hy - 4, 20, 22, 8)}" fill="${T("#e2c898")}"/><path d="M${hx - 30},${hy + 6} q8,20 30,24" stroke="${T("#8a6a3a")}" stroke-width="6" fill="none" opacity=".45"/>`;
    for (let k = 0; k < 14; k++) g += `<path d="M${F(hx - 28 + k * 4)},${F(hy - 24)} v${F(48)}" stroke="${T("#9a7a48")}" stroke-width=".6" opacity=".4"/>`;
    g += `<circle cx="${hx - 11}" cy="${hy - 4}" r="5" fill="${T("#2a1a10")}"/><circle cx="${hx + 13}" cy="${hy - 4}" r="5" fill="${T("#2a1a10")}"/><circle cx="${hx - 9}" cy="${hy - 6}" r="1.6" fill="#fff" opacity=".8"/><circle cx="${hx + 15}" cy="${hy - 6}" r="1.6" fill="#fff" opacity=".8"/>`;
    g += `<path d="M${hx},${hy + 1} l-4,8 h8Z" fill="${T("#d8742c")}"/>`;
    g += `<path d="M${hx - 15},${hy + 12} Q${hx + 1},${hy + 24} ${hx + 17},${hy + 12}" stroke="${T("#3a2414")}" stroke-width="2.2" fill="none"/>`;
    for (let k = 0; k < 6; k++) { const t = (k + .5) / 6, px = hx - 15 + t * 32, py = hy + 12 + Math.sin(t * Math.PI) * 6; g += `<path d="M${F(px)},${F(py - 3)} v6" stroke="${T("#3a2414")}" stroke-width="1.4"/>`; }
    g += `<circle cx="${hx - 20}" cy="${hy + 6}" r="5" fill="${T("#e88a6a")}" opacity=".45"/><circle cx="${hx + 22}" cy="${hy + 6}" r="5" fill="${T("#e88a6a")}" opacity=".45"/>`;
    // straw hat
    g += `<path d="M${hx - 54},${hy - 22} Q${hx},${hy - 40} ${hx + 56},${hy - 26} Q${hx + 62},${hy - 18} ${hx + 50},${hy - 16} Q${hx},${hy - 26} ${hx - 50},${hy - 12} Q${hx - 62},${hy - 14} ${hx - 54},${hy - 22}Z" fill="${T("#c8a050")}"/>`;
    g += `<path d="M${hx - 26},${hy - 26} Q${hx - 24},${hy - 66} ${hx + 2},${hy - 66} Q${hx + 28},${hy - 66} ${hx + 28},${hy - 28}Z" fill="${T("#d8b464")}"/><path d="M${hx + 4},${hy - 66} Q${hx + 28},${hy - 66} ${hx + 28},${hy - 28} L${hx + 8},${hy - 27}Z" fill="${T("#ecd08a")}"/>`;
    g += `<path d="M${hx - 26},${hy - 34} Q${hx},${hy - 40} ${hx + 28},${hy - 36} L${hx + 28},${hy - 28} Q${hx},${hy - 32} ${hx - 26},${hy - 26}Z" fill="${T("#a83a2a")}"/>`;
    g += `<path d="M${hx - 54},${hy - 22} Q${hx},${hy - 40} ${hx + 56},${hy - 26}" stroke="${RIM}" stroke-width="1.6" fill="none" opacity=".6"/>`;
    for (let k = 0; k < 18; k++) g += `<path d="M${F(hx - 50 + k * 6)},${F(hy - 20 - Math.sin(k / 17 * Math.PI) * 8)} l${F(-1 + r() * 2)},${F(3 + r() * 3)}" stroke="${T("#e8c870")}" stroke-width="1" opacity=".8"/>`;
    // sunflower tucked in the hat band and a crow on the arm
    g += `<circle cx="${hx + 22}" cy="${hy - 34}" r="7" fill="${T("#f4c020")}"/><circle cx="${hx + 22}" cy="${hy - 34}" r="3" fill="${T("#5a3010")}"/>`;
    g += `<path d="M${x + 76},${y - 220} q2,-14 14,-16 q8,-2 12,4 l9,2 l-9,3 q-2,8 -10,10 l6,10 l-14,-6 l-8,-1Z" fill="${NIGHT ? "#0a0a14" : "#1e1c26"}"/><circle cx="${x + 100}" cy="${y - 230}" r="1.6" fill="#ffd060"/><path d="M${x + 82},${y - 230} q8,-6 16,-4" stroke="${RIM}" stroke-width="1" fill="none" opacity=".5"/>`;
    s += g; }
  // pumpkins and a carved jack at the scarecrow's feet
  s += pumpkin(870, 676, 20) + pumpkin(990, 682, 16, "w") + pumpkin(1030, 672, 22, "o", true) + pumpkin(820, 690, 14, "y");

  /* sunflowers framing the corners */
  const sunflower = (x, y, h, lean) => {
    let g = "", tx = x + lean * h * .3, ty = y - h;
    g += `<path d="M${x},${y} Q${F(x + lean * h * .05)},${F(y - h * .6)} ${F(tx)},${F(ty)}" stroke="${T("#4a6a24")}" stroke-width="${F(h * .025)}" fill="none"/>`;
    for (let k = 0; k < 4; k++) { const t = .3 + k * .15, px = x + lean * h * .3 * t * t, py = y - h * t, sd = k % 2 ? 1 : -1, L = h * .14;
      g += `<path d="M${F(px)},${F(py)} q${F(sd * L * .6)},${F(-L * .5)} ${F(sd * L)},${F(L * .1)} q${F(-sd * L * .5)},${F(L * .3)} ${F(-sd * L)},${F(-L * .1)}Z" fill="${T(sd > 0 ? "#7a9a34" : "#4e6a24")}"/>`; }
    const R = h * .1, hx = tx + lean * R * .5, hy = ty + R * .3;
    for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2, px = hx + Math.cos(a) * R * 1.25, py = hy + Math.sin(a) * R * 1.1, lit = Math.cos(a) * .5 + .5;
      g += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(R * .5)}" ry="${F(R * .2)}" fill="${T(lit > .6 ? "#fcd23a" : lit > .3 ? "#f0b020" : "#c88a18")}" transform="rotate(${F(a * 57.3)} ${F(px)} ${F(py)})"/>`; }
    g += `<circle cx="${F(hx)}" cy="${F(hy)}" r="${F(R * .85)}" fill="${T("#4a2a10")}"/><circle cx="${F(hx + R * .2)}" cy="${F(hy - R * .2)}" r="${F(R * .5)}" fill="${T("#6a3e18")}"/>`;
    for (let k = 0; k < 14; k++) g += `<circle cx="${F(hx + (r() - .5) * R * 1.3)}" cy="${F(hy + (r() - .5) * R * 1.3)}" r="${F(R * .07)}" fill="${T("#2a1608")}"/>`;
    return g; };
  s += `<g filter="url(#ppLeafyS)">${sunflower(40, 730, 250, .2) + sunflower(110, 735, 210, -.1) + sunflower(190, 740, 170, .15) + sunflower(2420, 735, 220, -.15) + sunflower(2500, 730, 260, .1) + sunflower(2350, 740, 160, .2)}</g>`;

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#ppLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#ppPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
