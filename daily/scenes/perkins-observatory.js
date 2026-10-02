/* An observatory on a wooded rise north of the city, on a sunny first Saturday
   of October, after Perkins Observatory in Delaware, Ohio. A cream stucco
   building with red-tiled wings, a pillared porch and a silver dome stands on a
   mown knoll. A big oak still green stands on its left, and a maple already
   turning on its right. Spruces, hedgerows, farm fields with a barn and hay
   bales, and far blue hills lie beyond. There is a bench, lamp posts, a gravel
   drive and a small telescope set up on the lawn.
   opts.time === "night" draws the same place on the night of Saturn's
   opposition: the dome slit open with the big telescope inside, lit windows and
   lamps, the Milky Way, and Saturn bright and low in the south-east, which the
   lawn telescope is aimed at. One light source either way, upper left of the
   dome. Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".          */
function perkinsObservatoryArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1003;
  const r = rng(seed), rs = rng(seed + 7);   // land and sky draw from separate streams, so day and night share one layout
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 1010, LY = 124, CX = 1300, GB = 506;
  const SX = 1965, SY = 300;   // Saturn
  const T = c => NIGHT ? mix(mix(c, "#7a7a8a", .42), "#0c1434", .6) : c;
  const RIM = NIGHT ? "#b8c8f4" : "#fff2c8", LAMP = "#ffc868", WIN = "#ffd27e";
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
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ridgePath = (fn, close = H) => { let d = `M0,${close} L0,${F(fn(0))}`;
    for (let x = 0; x <= W; x += 16) d += ` L${x},${F(fn(x))}`; return d + ` L${W},${F(fn(W))} L${W},${close}Z`; };

  /* ground lines, far to near */
  const w1 = wave([1, 2, 4], [300, 140, 60], [12, 5, 2]), w2 = wave([3, 5, 1], [360, 150, 70], [11, 5, 2]);
  const w3 = wave([2, 4, 0], [300, 130, 55], [10, 5, 2]), w4 = wave([5, 1, 3], [380, 160, 70], [9, 4, 2]);
  const kw = wave([0, 3, 5], [240, 110, 50], [5, 2.5, 1]), mw = wave([1, 3, 5], [500, 190, 80], [10, 5, 2]);
  const fh1 = x => 418 + w1(x) - 20 * Math.exp(-(((x - 420) / 300) ** 2)) - 16 * Math.exp(-(((x - 2180) / 340) ** 2));
  const fh2 = x => 448 + w2(x);
  const band1 = x => 476 + w3(x), band2 = x => 516 + w4(x);
  const fieldTop = x => 552 + Math.sin(x / 380) * 6;
  const knoll = x => { const d = Math.abs(x - CX), t = clamp((d - 320) / 520, 0, 1), e = t * t * (3 - 2 * t); return GB + e * 92 + kw(x) * e; };
  const meadow = x => 662 + mw(x) - Math.max(0, 260 - x) * .2 - Math.max(0, x - 2300) * .2;

  /* the dome and its slit (the slit is also a clip path, so it lives in defs) */
  const DR = 98, DRY = 94, DCY = 334;
  const slit = `M${CX + 4},${DCY - DRY} A6,${DRY} 0 0 1 ${CX + 10},${DCY} L${CX + 34},${DCY} A30,${DRY} 0 0 0 ${CX + 4},${DCY - DRY}Z`;

  const SKY_H = NIGHT ? "#3a466e" : "#f0dfb8", HZ = NIGHT ? "#2e3a62" : "#eadfc2";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#050a1e"/><stop offset=".45" stop-color="#0d183c"/><stop offset=".82" stop-color="#24345c"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#3a78c2"/><stop offset=".42" stop-color="#80b4e0"/><stop offset=".76" stop-color="#d8e0d2"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#c8d4f4" stop-opacity=".22"/><stop offset=".4" stop-color="#8090c0" stop-opacity=".08"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d6" stop-opacity=".9"/><stop offset=".18" stop-color="#ffefc0" stop-opacity=".45"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="podefs">
    <linearGradient id="poSky" x1="0" y1="0" x2="0" y2="470" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="poLight" cx="${NIGHT ? CX : LX}" cy="${NIGHT ? 260 : LY}" r="${NIGHT ? 900 : 760}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="poHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    ${g2("poHill1", NIGHT ? "#1e2a52" : "#a3b4c8", NIGHT ? "#24305a" : "#bcc4c8")}
    ${g2("poHill2", NIGHT ? "#1a2650" : "#90a4b2", NIGHT ? "#202c56" : "#a8b2aa")}
    ${g2("poBand1", T("#8e9c6c"), T("#7c8a5c"))}
    ${g2("poBand2", T("#6c8046"), T("#5a6a38"))}
    <linearGradient id="poLawn" x1="0" y1="500" x2="0" y2="660" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#a2b058")}"/><stop offset=".5" stop-color="${T("#809642")}"/><stop offset="1" stop-color="${T("#5c7030")}"/></linearGradient>
    <linearGradient id="poMeadow" x1="0" y1="630" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#a49c4c")}"/><stop offset=".5" stop-color="${T("#7c7a36")}"/><stop offset="1" stop-color="${T("#4e5222")}"/></linearGradient>
    <linearGradient id="poWall" x1="1000" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${NIGHT ? "#8890b0" : "#fbf2de"}"/><stop offset=".45" stop-color="${T("#ecdec2")}"/><stop offset="1" stop-color="${T("#c6b496")}"/></linearGradient>
    <linearGradient id="poDrum" x1="1222" y1="0" x2="1378" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${NIGHT ? "#9ea6c4" : "#fdf6e6"}"/><stop offset=".35" stop-color="${T("#eee2c8")}"/><stop offset="1" stop-color="${T("#b4a284")}"/></linearGradient>
    <radialGradient id="poDome" cx="1260" cy="268" r="160" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${NIGHT ? "#c4cee8" : "#ffffff"}"/><stop offset=".3" stop-color="${T("#e2e6ec")}"/><stop offset=".72" stop-color="${T("#a6aebc")}"/><stop offset="1" stop-color="${T("#6c7484")}"/></radialGradient>
    <linearGradient id="poRoof" x1="0" y1="396" x2="0" y2="428" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#cc6a4c")}"/><stop offset="1" stop-color="${T("#963e2e")}"/></linearGradient>
    <linearGradient id="poPath" x1="0" y1="${GB}" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#ddd0ae")}"/><stop offset="1" stop-color="${T("#a8987a")}"/></linearGradient>
    ${g2("poTrunk", T("#7a5a40"), T("#2e2014"), 1, 0)}
    <radialGradient id="poGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="poSat"><stop offset="0" stop-color="#fff2cc" stop-opacity=".95"/><stop offset=".3" stop-color="#ffe0a0" stop-opacity=".28"/><stop offset="1" stop-color="#ffe0a0" stop-opacity="0"/></radialGradient>
    <radialGradient id="poSlitG" cx="${CX + 20}" cy="${DCY}" r="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffcf80" stop-opacity=".75"/><stop offset=".6" stop-color="#b86a30" stop-opacity=".25"/><stop offset="1" stop-color="#3a2010" stop-opacity="0"/></radialGradient>
    <clipPath id="poSlitC"><path d="${slit}"/></clipPath>
    <filter id="poLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="poLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="poCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="32" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="poPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="poSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="poBlur"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="poBlur8"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="poMW" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="24"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#poSky)"/>`;

  /* sun, or a moonless sky: stars, the Milky Way and Saturn */
  if (NIGHT) {
    // Milky Way: a soft band running down through the middle, away from both text corners
    const mwP = t => { const u = 1 - t; return [u * u * 820 + 2 * u * t * 1260 + t * t * 1760, u * u * -30 + 2 * u * t * 170 + t * t * 470]; };
    let d = "M" + mwP(0).map(F).join(","); for (let k = 1; k <= 20; k++) d += " L" + mwP(k / 20).map(F).join(",");
    s += `<g filter="url(#poMW)"><path d="${d}" stroke="#7a86b8" stroke-width="150" fill="none" opacity=".16"/><path d="${d}" stroke="#c8cce8" stroke-width="60" fill="none" opacity=".12"/></g>`;
    s += `<path d="${d}" stroke="#0a1230" stroke-width="10" fill="none" opacity=".35" filter="url(#poBlur8)" transform="translate(14,4)"/>`;
    for (let i = 0; i < 520; i++) { const t = rs(), [x, y] = mwP(t), o = (rs() + rs() + rs() - 1.5) * 70;
      const px = x + o * .78, py = y - o * .62; if (py > 440) continue;
      s += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(.5 + rs() * .5)}" fill="#e8ecff" opacity="${F(.25 + rs() * .45)}"/>`; }
    for (let i = 0; i < 620; i++) { const x = rs() * W, y = Math.pow(rs(), 1.4) * 440, big = rs() < .07, o = .2 + rs() * .6 * (1 - y / 480);
      if (Math.hypot(x - SX, y - SY) < 40) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    s += `<rect y="360" width="${W}" height="110" fill="#6a5a7a" opacity=".12" filter="url(#poBlur8)"/>`;
    s += `<rect width="${W}" height="${H}" fill="url(#poLight)"/>`;
    // Saturn: a steady golden point, with its rings just hinted
    s += `<circle cx="${SX}" cy="${SY}" r="34" fill="url(#poSat)"/><circle cx="${SX}" cy="${SY}" r="3.6" fill="#fff4d6"/>
      <ellipse cx="${SX}" cy="${SY}" rx="9" ry="2.6" fill="none" stroke="#f2dca8" stroke-width="1.3" opacity=".75" transform="rotate(-16 ${SX} ${SY})"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#poLight)"/><circle cx="${LX}" cy="${LY}" r="40" fill="#fffbe8"/>`;
    s += `<g class="rays" opacity=".1" filter="url(#poSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .45 + k * .32, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: fair-weather cumulus by day, a few thin strata by night; lit on the side facing the light */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#poCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#141c3c" opacity=".8"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#1e2850" opacity=".85"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .14)}" fill="#3e4a7a" opacity=".6"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .15 * (.6 + rs() * .7), w * (.09 + rs() * .07)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .07)}" fill="#bccadb"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#c9d3e0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .85)}" fill="#f7f6f2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .35)}" rx="${F(R * .6)}" ry="${F(R * .4)}" fill="#fffbea"/>`);
    }
    return c + `</g></g>`;
  };
  if (NIGHT) s += cloud(520, 330, 520, "drift1") + cloud(2280, 352, 560, "drift2");
  else {
    s += cloud(560, 172, 500, "drift1") + cloud(1930, 128, 560, "drift2") + cloud(2390, 250, 300, "drift3") + cloud(250, 282, 270, "drift2");
    // geese heading south, above the dome
    s += `<g class="birds" fill="none" stroke="#3a3a48" stroke-width="2.2" stroke-linecap="round" opacity=".7">`;
    [[1180, 178, 1], [1158, 190, .85], [1136, 202, .8], [1202, 190, .9], [1224, 202, .8], [1246, 214, .75], [1114, 214, .7]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 9 * k)},${F(y - 3 * k)} q${F(5 * k)},${F(-4 * k)} ${F(9 * k)},${F(3 * k)} q${F(4 * k)},${F(-7 * k)} ${F(9 * k)},${F(-3 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* far hills, with a fuzz of tiny trees, then the two forest bands */
  const EARLY = ["#4e6a30", "#5e7a34", "#6a8a3a", "#7c963e", "#8a9a3c", "#5a7432", "#b8a43a", "#d08a2e", "#c8602a", "#e0b040", "#a6802e"];
  const forest = (fn, rows, size, haze, hazeCol, conifer) => {
    let f = "";
    const trees = [];
    for (let row = 0; row < rows; row++) for (let x = -10; x < W + 10; x += size * (.9 + r() * .5)) {
      const y = fn(x) + row * size * .72 + size * .4 + r() * size * .3, sz = size * (.75 + r() * .45);
      trees.push([x + r() * size * .4, y, sz]);
    }
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(([x, y, sz]) => {
      if (r() < conifer) {
        const c = T(mix("#3d5a34", hazeCol, haze));
        f += `<path d="M${F(x)},${F(y - sz * 1.9)} L${F(x + sz * .55)},${F(y)} L${F(x - sz * .55)},${F(y)}Z" fill="${c}"/><path d="M${F(x)},${F(y - sz * 1.9)} L${F(x + sz * .55)},${F(y)} L${F(x)},${F(y)}Z" fill="${mix(c, "#000000", .18)}"/>`;
        return;
      }
      const base = EARLY[Math.floor(r() * EARLY.length)], c0 = T(mix(base, hazeCol, haze)), c = NIGHT ? mix(c0, "#101838", .38) : c0;
      const dk = mix(c, "#1a1a10", .35), lt = mix(c, NIGHT ? "#6a78a8" : "#fff3c8", NIGHT ? .14 : .3);
      f += `<path d="${blobP(x + sz * .12, y + sz * .1, sz * .95, sz * .8, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz * .08, sz * .85, sz * .72, 7)}" fill="${c}"/><path d="${blobP(x - sz * .25, y - sz * .35, sz * .42, sz * .3, 6)}" fill="${lt}"/>`;
    });
    return f;
  };
  s += `<path d="${ridgePath(fh1)}" fill="url(#poHill1)"/>`;
  s += `<path d="${ridgePath(fh2)}" fill="url(#poHill2)"/>`;
  s += `<g filter="url(#poLeafyS)" opacity=".8">${forest(fh2, 1, 7, .62, HZ, .2)}</g>`;
  s += `<rect x="0" y="400" width="${W}" height="100" fill="url(#poHaze)"/>`;
  s += `<path d="${ridgePath(band1)}" fill="url(#poBand1)"/>`;
  s += `<g filter="url(#poLeafyS)">${forest(band1, 3, 12, .38, SKY_H, .18)}</g>`;
  s += `<rect x="0" y="466" width="${W}" height="80" fill="url(#poHaze)" opacity=".6"/>`;
  s += `<path d="${ridgePath(band2)}" fill="url(#poBand2)"/>`;
  s += `<g filter="url(#poLeafyS)">${forest(band2, 2, 18, .14, SKY_H, .14)}</g>`;

  /* fields: patchwork strips with crop rows, a barn and silo, a farmhouse, hay bales */
  const patches = [[-40, 300, "#c9a24e"], [300, 640, "#a8ac4e"], [640, 980, "#b59440"], [1620, 1980, "#c7b25c"], [1980, 2300, "#a39a44"], [2300, 2600, "#d6b45a"]];
  patches.forEach(([a, b, c]) => {
    s += `<path d="M${a},${F(fieldTop(a))} L${b},${F(fieldTop(b))} L${b + 30},640 L${a - 30},640Z" fill="${T(c)}"/>`;
    for (let k = 1; k < 7; k++) { const y = fieldTop(a) + k * 7.5;
      s += `<path d="M${a - k * 4},${F(y)} L${b + k * 4},${F(y + (fieldTop(b) - fieldTop(a)))}" stroke="${T(mix(c, "#3a2a10", .22))}" stroke-width="1.4" opacity=".55"/>`; }
  });
  const barn = (x, y, k) => {
    let b = `<g transform="translate(${x},${y}) scale(${k})">
      <path d="M-70,0 L-70,-58 L-52,-92 L0,-112 L52,-92 L70,-58 L70,0Z" fill="${T("#a8352a")}"/>
      <path d="M-78,-56 L-56,-96 L0,-118 L56,-96 L78,-56" fill="none" stroke="${T("#4a3a34")}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M20,0 L20,-58 L70,-58 L70,0Z" fill="#000000" opacity=".18"/>
      <rect x="-26" y="-52" width="52" height="52" fill="${T("#f1e6d2")}"/><rect x="-22" y="-48" width="44" height="48" fill="${T("#8a2a22")}"/>
      <path d="M-22,-48 L22,0 M22,-48 L-22,0" stroke="${T("#f1e6d2")}" stroke-width="4"/>
      <rect x="-12" y="-92" width="24" height="20" fill="${T("#f1e6d2")}"/><rect x="-9" y="-89" width="18" height="14" fill="${NIGHT ? WIN : "#3a2418"}"/>
      <rect x="82" y="-130" width="34" height="130" fill="${T("#b9b4a8")}"/><rect x="100" y="-130" width="16" height="130" fill="${T("#8f8a80")}"/><path d="M82,-130 Q99,-154 116,-130Z" fill="${T("#7a8088")}"/>`;
    for (let j = 1; j < 8; j++) b += `<rect x="82" y="${-130 + j * 16}" width="34" height="1.5" fill="${T("#6a665e")}" opacity=".5"/>`;
    return b + `</g>`;
  };
  const farmhouse = (x, y, k) => `<g transform="translate(${x},${y}) scale(${k})"><rect x="-44" y="-50" width="88" height="50" fill="${T("#efe6d4")}"/><rect x="6" y="-50" width="38" height="50" fill="#000000" opacity=".12"/>
      <path d="M-54,-48 L0,-88 L54,-48Z" fill="${T("#4a4e5a")}"/><path d="M0,-88 L54,-48 L0,-48Z" fill="#000000" opacity=".15"/><rect x="18" y="-96" width="10" height="26" fill="${T("#6a4a3a")}"/>
      <rect x="-32" y="-38" width="14" height="16" fill="${NIGHT ? WIN : "#6a8aa8"}"/><rect x="-6" y="-38" width="14" height="16" fill="${NIGHT ? WIN : "#6a8aa8"}"/><rect x="22" y="-30" width="14" height="30" fill="${T("#7a4a30")}"/></g>`;
  const glows = [];
  s += barn(380, 588, .6) + farmhouse(2440, 592, .62);
  glows.push([380, 535, 26], [2427, 568, 30]);
  [[200, 600, .6], [252, 606, .55], [560, 598, .5], [2180, 604, .55], [2240, 598, .5], [2310, 606, .6]].forEach(([x, y, k]) => {
    s += `<ellipse cx="${F(x + 5 * k)}" cy="${F(y + 12 * k)}" rx="${F(30 * k)}" ry="${F(6 * k)}" fill="#000000" opacity=".2"/><rect x="${F(x - 26 * k)}" y="${F(y - 24 * k)}" width="${F(52 * k)}" height="${F(36 * k)}" rx="${F(16 * k)}" fill="${T("#d8b456")}"/>
      <ellipse cx="${F(x - 26 * k + 4)}" cy="${F(y - 6 * k)}" rx="${F(8 * k)}" ry="${F(18 * k)}" fill="${T("#e8c96a")}"/><path d="M${F(x - 22 * k)},${F(y - 12 * k)} q${F(4 * k)},${F(6 * k)} 0,${F(12 * k)}" stroke="${T("#b08a34")}" stroke-width="1.5" fill="none"/>`;
  });
  for (let x = 20; x < 760; x += 30) { const y = 616 + Math.sin(x / 200) * 3;
    s += `<rect x="${x}" y="${F(y - 16)}" width="3" height="18" fill="${T("#6a4a30")}"/>`; if (x + 30 < 760) s += `<path d="M${x},${F(y - 12)} L${x + 30},${F(y - 12)} M${x},${F(y - 6)} L${x + 30},${F(y - 6)}" stroke="${T("#7a5a3a")}" stroke-width="1.6"/>`; }

  /* the knoll: a mown lawn, with faint mowing stripes */
  s += `<path d="${ridgePath(knoll)}" fill="url(#poLawn)"/>`;
  for (let k = -8; k < 9; k++) { const x0 = CX + k * 90;
    s += `<path d="M${x0},${GB + 4} L${x0 + 46},${GB + 4} L${x0 + 46 + k * 50},720 L${x0 + k * 50},720Z" fill="${k % 2 ? "#ffffff" : "#000000"}" opacity="${NIGHT ? .012 : .028}"/>`; }
  for (let i = 0; i < 700; i++) { const x = r() * W, y = knoll(x) + 4 + r() * (680 - knoll(x)), h = 4 + r() * 6;
    s += `<path d="M${F(x)},${F(y)} q${F(-1 + r() * 2)},${F(-h * .6)} ${F(-2 + r() * 4)},${F(-h)}" stroke="${T(r() < .5 ? "#b4c062" : "#5e7430")}" stroke-width="1.6" fill="none" opacity=".55"/>`; }
  // the building's shadow, cast down and to the right
  s += `<path d="M1000,${GB + 6} L1604,${GB + 6} L1690,${GB + 26} L1080,${GB + 30}Z" fill="#1a2010" opacity="${NIGHT ? .1 : .18}" filter="url(#poBlur)"/>`;

  /* the observatory */
  const wallC = T("#efe3c8"), trim = T("#fbf6ea"), stone = T("#a8a090"), glass = NIGHT ? WIN : T("#5e7288");
  const archWin = (x, y, w, h) => {
    const d = `M${F(x - w / 2)},${F(y + h)} L${F(x - w / 2)},${F(y + w / 2)} A${F(w / 2)},${F(w / 2)} 0 0 1 ${F(x + w / 2)},${F(y + w / 2)} L${F(x + w / 2)},${F(y + h)}Z`;
    let o = `<path d="${d}" fill="${trim}" stroke="${trim}" stroke-width="5"/><path d="${d}" fill="${glass}"/>`;
    if (NIGHT) glows.push([x, y + h / 2, w * 2.2]);
    else o += `<path d="M${F(x - w / 2 + 2)},${F(y + h - 2)} L${F(x - w / 2 + 2)},${F(y + w / 2)} L${F(x + 1)},${F(y + w / 2 + 8)}Z" fill="#cfe0ea" opacity=".4"/>`;
    o += `<path d="M${F(x)},${F(y + 2)} L${F(x)},${F(y + h)} M${F(x - w / 2)},${F(y + h * .55)} L${F(x + w / 2)},${F(y + h * .55)}" stroke="${trim}" stroke-width="1.5"/>`;
    o += `<rect x="${F(x - w / 2 - 3)}" y="${F(y + h)}" width="${F(w + 6)}" height="3" fill="${trim}"/><rect x="${F(x - w / 2 - 3)}" y="${F(y + h + 3)}" width="${F(w + 6)}" height="2" fill="#000000" opacity=".2"/>`;
    o += `<rect x="${F(x - 2)}" y="${F(y - 4)}" width="4" height="5" fill="${trim}"/>`;
    return o;
  };
  let b = "";
  b += `<rect x="994" y="${GB - 10}" width="612" height="18" fill="${stone}"/><rect x="994" y="${GB - 10}" width="612" height="3" fill="${T("#cac2b2")}"/>`;
  for (let x = 1000; x < 1600; x += 22) b += `<rect x="${x}" y="${GB - 7}" width="1" height="15" fill="#000000" opacity=".12"/>`;
  const wing = (x0, x1) => {
    let w = `<rect x="${x0}" y="424" width="${x1 - x0}" height="${GB - 10 - 424}" fill="url(#poWall)"/>`;
    w += `<path d="M${x0 - 10},427 L${x0 + 22},398 L${x1 - 22},398 L${x1 + 10},427Z" fill="url(#poRoof)"/>`;
    w += `<path d="M${x1 - 22},398 L${x1 + 10},427 L${x1 - 30},427Z" fill="#000000" opacity=".16"/><path d="M${x0 - 10},427 L${x0 + 22},398 L${x0 + 30},400 L${x0 + 2},427Z" fill="${RIM}" opacity=".18"/>`;
    for (let y = 402; y < 427; y += 4.5) { const k = (y - 398) / 29;
      w += `<path d="M${F(x0 + 22 - k * 32)},${F(y)} L${F(x1 - 22 + k * 32)},${F(y)}" stroke="${T("#7a3022")}" stroke-width="1" opacity=".45"/>`; }
    for (let x = x0 + 6; x < x1 - 4; x += 6) w += `<path d="M${x},400 L${F(x + (x - (x0 + x1) / 2) * .08)},426" stroke="${T("#e8906c")}" stroke-width=".8" opacity=".3"/>`;
    w += `<rect x="${x0 - 4}" y="424" width="${x1 - x0 + 8}" height="4" fill="${trim}"/><rect x="${x0}" y="428" width="${x1 - x0}" height="6" fill="#000000" opacity=".16"/>`;
    w += `<rect x="${x0}" y="428" width="6" height="${GB - 10 - 428}" fill="${trim}" opacity=".6"/><rect x="${x1 - 6}" y="428" width="6" height="${GB - 10 - 428}" fill="#000000" opacity=".08"/>`;
    const n = 4, step = (x1 - x0) / n;
    for (let i = 0; i < n; i++) w += archWin(x0 + step * (i + .5), 442, 15, 40);
    return w;
  };
  b += wing(1010, 1180) + wing(1420, 1590);
  // centre block, cornice and balustrade
  b += `<rect x="1180" y="382" width="240" height="${GB - 10 - 382}" fill="url(#poWall)"/>`;
  b += `<rect x="1180" y="388" width="8" height="${GB - 10 - 388}" fill="${trim}" opacity=".7"/><rect x="1412" y="388" width="8" height="${GB - 10 - 388}" fill="#000000" opacity=".1"/>`;
  b += `<rect x="1174" y="374" width="252" height="9" fill="${trim}"/><rect x="1180" y="383" width="240" height="5" fill="#000000" opacity=".16"/>`;
  b += `<rect x="1176" y="362" width="248" height="4" fill="${trim}"/>`;
  for (let x = 1180; x < 1422; x += 8) b += `<rect x="${x}" y="366" width="4" height="8" fill="${trim}"/><rect x="${x + 2.5}" y="366" width="1.5" height="8" fill="#000000" opacity=".15"/>`;
  [1206, 1236, 1364, 1394].forEach(x => b += archWin(x, 404, 18, 62));
  // porch: recess, door, columns, entablature, pediment
  b += `<rect x="1256" y="420" width="88" height="${GB - 10 - 420}" fill="${T("#dccdae")}"/>`;
  b += `<path d="M1286,${GB - 10} L1286,454 A14,14 0 0 1 1314,454 L1314,${GB - 10}Z" fill="${NIGHT ? WIN : T("#5a3a26")}"/>`;
  b += `<path d="M1300,442 L1300,${GB - 10}" stroke="${T("#3a2416")}" stroke-width="1.5"/><path d="M1286,${GB - 10} L1286,454 A14,14 0 0 1 1314,454" fill="none" stroke="${trim}" stroke-width="3"/>`;
  if (NIGHT) glows.push([1300, 474, 60]);
  [1264, 1284, 1316, 1336].forEach(x => {
    b += `<rect x="${x + 4}" y="432" width="7" height="${GB - 10 - 432}" fill="#000000" opacity=".12"/>`;
    b += `<rect x="${x - 4}" y="432" width="8" height="${GB - 10 - 432}" fill="${trim}"/><rect x="${x + 1}" y="432" width="3" height="${GB - 10 - 432}" fill="${T("#c8bca4")}"/><rect x="${x - 4}" y="432" width="2" height="${GB - 10 - 432}" fill="${RIM}" opacity=".5"/>`;
    b += `<rect x="${x - 6}" y="428" width="12" height="4" fill="${trim}"/><rect x="${x - 6}" y="${GB - 14}" width="12" height="4" fill="${trim}"/>`;
  });
  b += `<rect x="1250" y="420" width="100" height="10" fill="${trim}"/><rect x="1250" y="430" width="100" height="3" fill="#000000" opacity=".18"/>`;
  b += `<path d="M1246,420 L1300,397 L1354,420Z" fill="${trim}"/><path d="M1257,417 L1300,401 L1343,417Z" fill="${T("#e4d6b8")}"/><path d="M1300,397 L1354,420 L1300,420Z" fill="#000000" opacity=".07"/><circle cx="1300" cy="411" r="3.5" fill="${NIGHT ? WIN : T("#8a7a60")}"/>`;
  // drum with its little windows, foreshortened toward the sides
  b += `<rect x="1222" y="336" width="156" height="36" fill="url(#poDrum)"/>`;
  b += `<rect x="1216" y="370" width="168" height="6" fill="${trim}"/><rect x="1216" y="376" width="168" height="3" fill="#000000" opacity=".15"/><rect x="1218" y="331" width="164" height="6" fill="${trim}"/>`;
  [1236, 1262, 1288, 1314, 1340, 1366].forEach(x => { const w = 10 * (1 - Math.abs(x + 2 - CX) / 160 * .7);
    b += `<rect x="${F(x + 5 - w / 2)}" y="345" width="${F(w)}" height="17" rx="1.5" fill="${NIGHT ? WIN : T("#6a7c90")}"/>`; if (NIGHT) glows.push([x + 5, 353, 16]); });
  // the dome: lit upper left, ribs, a latitude ring, the slit, a finial
  b += `<path d="M${CX - DR},${DCY} A${DR},${DRY} 0 0 1 ${CX + DR},${DCY}Z" fill="url(#poDome)"/>`;
  [-.86, -.62, -.36, .36, .62, .86].forEach(k => { const rx = Math.abs(k) * DR;
    b += `<path d="M${CX},${DCY - DRY} A${F(rx)},${DRY} 0 0 ${k > 0 ? 1 : 0} ${F(CX + k * DR)},${DCY}" fill="none" stroke="${T("#868e9c")}" stroke-width="1.2" opacity=".5"/>`; });
  [.3, .62].forEach(f => { const yy = DCY - DRY * f, rx = DR * Math.sqrt(1 - f * f);
    b += `<path d="M${F(CX - rx)},${F(yy)} Q${CX},${F(yy + 7)} ${F(CX + rx)},${F(yy)}" fill="none" stroke="${T("#868e9c")}" stroke-width="1" opacity=".35"/>`; });
  if (NIGHT) {
    b += `<path d="${slit}" fill="#160e08"/><g clip-path="url(#poSlitC)"><rect x="${CX}" y="${DCY - DRY}" width="40" height="${DRY}" fill="url(#poSlitG)"/>
      <path d="M${CX + 12},${DCY + 4} L${CX + 30},${DCY - 74}" stroke="#4a3a2c" stroke-width="13" stroke-linecap="round"/>
      <path d="M${CX + 12},${DCY + 4} L${CX + 30},${DCY - 74}" stroke="#d8ccb4" stroke-width="8" stroke-linecap="round"/>
      <path d="M${CX + 10},${DCY + 2} L${CX + 28},${DCY - 76}" stroke="#fff0d0" stroke-width="2" opacity=".7"/></g>`;
    glows.push([CX + 20, DCY - 30, 70]);
  } else {
    b += `<path d="${slit}" fill="${T("#9aa2b0")}"/><path d="${slit}" fill="none" stroke="${T("#6c7484")}" stroke-width="1.2"/>`;
    for (let k = 1; k < 7; k++) { const yy = DCY - DRY + k * 13, f = (DCY - yy) / DRY, w = 24 * (1 - f * f) + 6;
      b += `<path d="M${F(CX + 4 + 6 * (1 - f))},${F(yy)} L${F(CX + 4 + w)},${F(yy)}" stroke="${T("#7c8494")}" stroke-width=".8" opacity=".6"/>`; }
  }
  b += `<path d="M${CX - DR},${DCY} A${DR},${DRY} 0 0 1 ${CX - 20},${DCY - DRY + 2}" fill="none" stroke="${RIM}" stroke-width="2.5" opacity=".55"/>`;
  b += `<ellipse cx="1262" cy="272" rx="26" ry="11" fill="#ffffff" opacity="${NIGHT ? .14 : .45}" transform="rotate(-38 1262 272)" filter="url(#poBlur)"/>`;
  b += `<path d="M${CX + DR},${DCY} A${DR},${DRY} 0 0 0 ${CX + 40},${DCY - DRY + 8} A${DR * .7},${DRY} 0 0 1 ${CX + DR - 8},${DCY}Z" fill="#000000" opacity=".1"/>`;
  b += `<rect x="${CX - 1.5}" y="${DCY - DRY - 12}" width="3" height="13" fill="${T("#7a8090")}"/><circle cx="${CX}" cy="${DCY - DRY - 13}" r="3.5" fill="${T("#c8ccd4")}"/>`;
  s += b;

  /* hedges along the front, built from small lit clumps */
  const HEDGE = ["#22341a", "#2c421e", "#385424", "#46662a", "#567a30", "#6c9038", "#8aa846"];
  const clumps = (x0, x1, y0, hgt, n, R0, ramp, lx, ly) => {
    const L = [];
    for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 - r() * hgt, nx = (x - (x0 + x1) / 2) / ((x1 - x0) / 2 + 1), ny = (y - (y0 - hgt / 2)) / (hgt / 2 + 1);
      const v = clamp(((-nx * lx - ny * ly) * .5 + .5) * .8 + (r() - .5) * .35, 0, .999); L.push([x, y, v, R0 * (.6 + r() * .6)]); }
    L.sort((a, b) => a[2] - b[2]);
    return L.map(([x, y, v, R]) => `<path d="${blobP(x, y, R, R * .8, 6)}" fill="${T(ramp[Math.floor(v * ramp.length)])}"/>`).join("");
  };
  s += `<g filter="url(#poLeafyS)">${clumps(1004, 1252, GB + 2, 16, 170, 6, HEDGE, .4, .9)}${clumps(1348, 1596, GB + 2, 16, 170, 6, HEDGE, .4, .9)}</g>`;

  /* steps, the gravel drive, lamps, a bench, the lawn telescope */
  [[0, 112], [6, 128], [12, 144]].forEach(([dy, w]) => {
    s += `<rect x="${CX - w / 2}" y="${GB - 2 + dy}" width="${w}" height="6" fill="${T("#bab2a2")}"/><rect x="${CX - w / 2}" y="${GB - 2 + dy}" width="${w}" height="1.5" fill="${T("#e6e0d4")}"/>`; });
  const drive = `M1262,${GB + 16} C1250,560 1360,590 1410,628 C1452,662 1430,700 1446,720 L1556,720 C1540,690 1560,656 1498,616 C1436,578 1342,556 1338,${GB + 16}Z`;
  s += `<path d="${drive}" fill="url(#poPath)"/><path d="${drive}" fill="none" stroke="${T("#8c7c5c")}" stroke-width="2" opacity=".5"/>`;
  for (let i = 0; i < 260; i++) { const t = r(), y = GB + 18 + t * (720 - GB - 18), x = 1300 + Math.sin(t * 2.6) * 120 * t + (r() - .5) * (70 + t * 60);
    s += `<circle cx="${F(x + t * 90)}" cy="${F(y)}" r="${F(.8 + r() * 1.4)}" fill="${T(r() < .5 ? "#f2ead4" : "#8a7a5a")}" opacity=".5"/>`; }
  const lamp = (x, y) => {
    let l = `<rect x="${x - 1.5}" y="${y - 46}" width="3" height="46" fill="${T("#2a2a30")}"/><rect x="${x - 4}" y="${y - 4}" width="8" height="4" fill="${T("#2a2a30")}"/>
      <path d="M${x - 6},${y - 46} L${x + 6},${y - 46} L${x + 4},${y - 60} L${x - 4},${y - 60}Z" fill="${NIGHT ? "#ffe0a0" : T("#d8dce0")}" stroke="${T("#2a2a30")}" stroke-width="1.5"/>
      <path d="M${x - 7},${y - 60} L${x + 7},${y - 60} L${x},${y - 67}Z" fill="${T("#2a2a30")}"/>`;
    if (NIGHT) glows.push([x, y - 53, 48], [x, y, 34]);
    return l;
  };
  s += lamp(1222, GB + 34) + lamp(1382, GB + 34);
  s += `<g><rect x="1092" y="${GB + 40}" width="56" height="4" fill="${T("#8a6440")}"/><rect x="1092" y="${GB + 32}" width="56" height="3" fill="${T("#a07a50")}"/><rect x="1092" y="${GB + 26}" width="56" height="3" fill="${T("#a07a50")}"/>
    <rect x="1096" y="${GB + 26}" width="3" height="26" fill="${T("#2a2a30")}"/><rect x="1141" y="${GB + 26}" width="3" height="26" fill="${T("#2a2a30")}"/><ellipse cx="1124" cy="${GB + 53}" rx="34" ry="4" fill="#000000" opacity=".15"/></g>`;
  const tsx = 1568, tsy = GB + 50;
  s += `<g><path d="M${tsx},${tsy - 30} L${tsx - 14},${tsy} M${tsx},${tsy - 30} L${tsx + 12},${tsy} M${tsx},${tsy - 30} L${tsx + 2},${tsy + 3}" stroke="${T("#3a3a40")}" stroke-width="2"/>
    <g transform="rotate(-32 ${tsx} ${tsy - 32})"><rect x="${tsx - 16}" y="${tsy - 38}" width="44" height="11" rx="2" fill="${T("#e8e6e0")}"/><rect x="${tsx - 16}" y="${tsy - 32}" width="44" height="5" rx="2" fill="${T("#a8a6a0")}"/><rect x="${tsx + 26}" y="${tsy - 40}" width="5" height="15" fill="${T("#2a2a30")}"/></g>
    <ellipse cx="${tsx + 2}" cy="${tsy + 3}" rx="18" ry="3" fill="#000000" opacity=".15"/></g>`;

  /* trees: a green oak on the left, a turning maple on the right, built leaf clump by leaf clump */
  const tree = (tx, ty, crown, ramp, nLeaves, trunkH, limbs) => {
    let t = `<ellipse cx="${tx + 40}" cy="${ty + 6}" rx="190" ry="16" fill="#1a2010" opacity=".22"/>`;
    t += `<path d="M${tx - 22},${ty} C${tx - 16},${ty - trunkH * .4} ${tx - 26},${ty - trunkH * .7} ${tx - 10},${ty - trunkH} L${tx + 12},${ty - trunkH} C${tx + 18},${ty - trunkH * .7} ${tx + 20},${ty - trunkH * .4} ${tx + 30},${ty}Z" fill="url(#poTrunk)"/>`;
    limbs.forEach(([dir, at, dx, dy]) => t += `<path d="M${tx},${ty - at} Q${tx + dir * dx * .4},${ty - at - dy * .6} ${tx + dir * dx},${ty - at - dy}" stroke="${T("#3a2416")}" stroke-width="10" fill="none" stroke-linecap="round"/>`);
    const inC = (x, y) => crown.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
    const xs = crown.map(c => [c[0] - c[2], c[0] + c[2]]).flat(), ys = crown.map(c => [c[1] - c[3], c[1] + c[3]]).flat();
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), ccx = (x0 + x1) / 2, ccy = (y0 + y1) / 2;
    const dl = Math.hypot(LX - ccx, LY - ccy), dx = (LX - ccx) / dl, dy = (LY - ccy) / dl;
    const L = [];
    for (let i = 0; i < nLeaves * 3 && L.length < nLeaves; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
      if (!inC(x, y)) continue;
      const nx = (x - ccx) / ((x1 - x0) / 2), ny = (y - ccy) / ((y1 - y0) / 2);
      const lit = (nx * dx + ny * dy) * .5 + .5, edge = Math.min(1, Math.hypot(nx, ny));
      L.push([x, y, clamp(lit * .75 + edge * .15 + (r() - .5) * .3, 0, .999), 8 + r() * 8]);
    }
    L.sort((a, b) => a[2] - b[2]);
    t += `<g class="crown" filter="url(#poLeafy)">` + L.map(([x, y, v, R]) => `<path d="${blobP(x, y, R, R * .8, 6)}" fill="${T(ramp[Math.floor(v * ramp.length)])}"/>`).join("") + `</g>`;
    return t;
  };
  const OAK = ["#22341a", "#2c4420", "#3a5824", "#4a6a2a", "#5e8032", "#76963a", "#a2ac48", "#d0bc60"];
  const MAPLE = ["#5e1a12", "#86261a", "#ac3520", "#cc4a22", "#e0662a", "#ee8a30", "#f6b24a", "#fcd97e"];
  const ox = 920, oy = 548;
  s += tree(ox, oy, [[ox, oy - 236, 150, 84], [ox - 100, oy - 196, 104, 74], [ox + 100, oy - 204, 110, 74], [ox, oy - 170, 150, 58], [ox + 34, oy - 304, 94, 44]], OAK, 950, 220,
    [[-1, 150, 120, 100], [1, 160, 130, 100], [-1, 190, 90, 110], [1, 196, 100, 110], [0, 210, 20, 90]]);
  const mx = 1724, my = 552;
  s += tree(mx, my, [[mx, my - 204, 124, 70], [mx - 86, my - 170, 92, 60], [mx + 88, my - 174, 92, 60], [mx, my - 146, 124, 50], [mx + 10, my - 248, 84, 36]], MAPLE, 760, 186,
    [[-1, 130, 100, 80], [1, 136, 110, 80], [-1, 160, 70, 90], [1, 166, 80, 90], [0, 180, 14, 60]]);
  for (let k = 0; k < 160; k++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()), x = mx + 20 + Math.cos(a) * d * 200, y = my + Math.sin(a) * d * 18;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(2.5 + r() * 2.5)}" ry="${F(1.5 + r() * 1.2)}" fill="${T(MAPLE[3 + Math.floor(r() * 5)])}" transform="rotate(${F(r() * 180)} ${F(x)} ${F(y)})"/>`; }

  /* spruces: tiered jagged boughs, lit side and shaded side, a visible trunk */
  const spruce = (x, y, h) => {
    const w = h * .3, tiers = Math.max(7, Math.round(h / 18)), litLeft = x > LX, sgn = litLeft ? 1 : -1;
    const base = T("#3a5a36"), dark = T("#1e3424"), lit = T("#6a8c4c"), tip = T("#8aa860");
    let t = `<rect x="${F(x - h * .025)}" y="${F(y - h * .14)}" width="${F(h * .05)}" height="${F(h * .14)}" fill="${T("#4a3020")}"/><rect x="${F(x + (litLeft ? h * .01 : -h * .025))}" y="${F(y - h * .14)}" width="${F(h * .015)}" height="${F(h * .14)}" fill="#000000" opacity=".25"/>`;
    for (let i = 0; i < tiers; i++) {
      const t0 = i / tiers, t1 = Math.min(1, (i + 1.7) / tiers);
      const yt = y - h + t0 * h * .86, yb = y - h + t1 * h * .86, hw = w * (.1 + .9 * t1) * (.9 + r() * .2);
      const m = 6 + Math.round(hw / 6);
      let pts = [[x + (r() - .5) * 2, yt], [x + hw, yb - 2]];
      for (let j = 1; j < m; j++) pts.push([x + hw - j * (2 * hw / m), yb + (j % 2 ? h * .03 : -h * .012) + r() * h * .012]);
      pts.push([x - hw, yb - 2]);
      t += `<path d="M${pts.map(p => F(p[0]) + "," + F(p[1])).join(" L")}Z" fill="${base}"/>`;
      // the half away from the light
      const half = pts.filter(p => (p[0] - x) * sgn <= 0.5);
      t += `<path d="M${F(x)},${F(yt)} L${half.map(p => F(p[0]) + "," + F(p[1])).join(" L")} L${F(x)},${F(yb)}Z" fill="${dark}" opacity=".7"/>`;
      // needle tufts catching the light along the lit edge
      for (let j = 0; j < 4 + hw / 8; j++) { const f = r(), px = x - sgn * hw * f * .9, py = yt + (yb - yt) * f;
        t += `<path d="M${F(px)},${F(py)} l${F(-sgn * (3 + r() * 5))},${F(2 + r() * 3)}" stroke="${r() < .4 ? tip : lit}" stroke-width="1.6" stroke-linecap="round"/>`; }
      t += `<path d="M${F(x - hw * .8)},${F(yb - 1)} L${F(x + hw * .8)},${F(yb - 1)}" stroke="${dark}" stroke-width="1.2" opacity=".5"/>`;
    }
    return `<g filter="url(#poLeafyS)">${t}</g>`;
  };
  s += spruce(626, knoll(626) + 6, 150) + spruce(694, knoll(694) + 8, 118);
  s += spruce(2066, knoll(2066) + 4, 196) + spruce(2156, knoll(2156) + 8, 150) + spruce(2236, knoll(2236) + 10, 116);

  /* near meadow: grass, asters and goldenrod, bushes framing the bottom corners */
  s += `<path d="${ridgePath(meadow)}" fill="url(#poMeadow)"/>`;
  for (let x = 0; x < W; x += 4 + r() * 8) {
    const y = meadow(x) + 4 + r() * 70, h = 8 + r() * 16;
    s += `<path d="M${F(x)},${F(y)} q${F(-2 + r() * 4)},${F(-h * .6)} ${F(-4 + r() * 8)},${F(-h)}" stroke="${T(r() < .5 ? "#c8b262" : "#5e5c24")}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`;
  }
  for (let i = 0; i < 46; i++) {   // goldenrod: arching stems with plumes of florets
    const x = r() * W, y = meadow(x) + 10 + r() * 50, h = 24 + r() * 22, lean = (r() - .5) * 10;
    s += `<path d="M${F(x)},${F(y)} q${F(lean * .3)},${F(-h * .5)} ${F(lean)},${F(-h)}" stroke="${T("#5a6a2a")}" stroke-width="1.6" fill="none"/>`;
    for (let k = 0; k < 14; k++) { const f = k / 13; s += `<circle cx="${F(x + lean * (1 - f * .4) + f * 8)}" cy="${F(y - h + f * h * .45 + (r() - .5) * 3)}" r="${F(1.6 + r())}" fill="${T(r() < .6 ? "#e8c030" : "#f6dc5a")}"/>`; }
  }
  for (let i = 0; i < 70; i++) {   // asters
    const x = r() * W, y = meadow(x) + 8 + r() * 56;
    for (let k = 0; k < 5; k++) s += `<circle cx="${F(x + (r() - .5) * 10)}" cy="${F(y + (r() - .5) * 6)}" r="2" fill="${T(r() < .7 ? "#9a7ad0" : "#c4b0ec")}"/>`;
  }
  const BUSH = ["#2a2410", "#3e3416", "#56481e", "#6e5a24", "#8a702c", "#a88a3a"];
  const SUMAC = ["#4a120c", "#6e1c12", "#92281a", "#b23a20", "#cc5428", "#e07a34"];
  s += `<g filter="url(#poLeafyS)">` + clumps(0, 150, 720, 70, 220, 9, BUSH, .3, .9) + clumps(110, 230, 726, 46, 140, 8, BUSH, .3, .9)
    + clumps(2400, 2560, 722, 74, 220, 9, SUMAC, .5, .8) + clumps(2300, 2420, 728, 44, 130, 8, BUSH, .5, .8) + `</g>`;

  /* night lights: windows, lamps and the dome slit glow; light pools on the lawn */
  if (NIGHT) {
    s += `<g style="mix-blend-mode:screen">` + glows.map(([x, y, R]) => `<circle cx="${F(x)}" cy="${F(y)}" r="${F(R)}" fill="url(#poGlow)" opacity=".6"/>`).join("") + `</g>`;
    s += `<ellipse cx="${CX}" cy="${GB + 22}" rx="330" ry="22" fill="url(#poGlow)" opacity=".28"/>`;
  }

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#poLight)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#poPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
