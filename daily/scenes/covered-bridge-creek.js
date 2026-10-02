/* Covered bridge over a creek on a warm early-October day in central Ohio.
   A red covered bridge on stone abutments with a middle pier, a sycamore on
   the right bank, a maple just starting to turn on the left, a pumpkin stand
   and split-rail fence by the road, corn shocks and a far farmhouse, a heron
   in the shallows, goldenrod and asters in front, geese heading south.
   opts.time === "night" draws the same place under a waning gibbous moon:
   stars, a lantern at the portal, lit windows, cool moonlight from the same
   side as the day's sun. One light source either way, upper left of the bridge.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function coveredBridgeCreekArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1001;
  const r = rng(seed), rs = rng(seed + 7);   // land and sky draw from separate streams, so day and night share one layout
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 1000, LY = 140;
  const T = c => NIGHT ? mix(mix(c, "#7a7a8a", .42), "#0c1434", .6) : c;
  const RIM = NIGHT ? "#b8c8f4" : "#fff2c8", LAMP = "#ffc868";
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
  const bz = (p, t) => { const u = 1 - t; return [0, 1].map(i => u*u*u*p[0][i] + 3*u*u*t*p[1][i] + 3*u*t*t*p[2][i] + t*t*t*p[3][i]); };

  /* shapes needed in defs: the creek (meandering banks) and the three stone supports */
  const cr = pts => { let d = ""; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${F(p1[0] + (p2[0] - p0[0]) / 6)},${F(p1[1] + (p2[1] - p0[1]) / 6)} ${F(p2[0] - (p3[0] - p1[0]) / 6)},${F(p2[1] - (p3[1] - p1[1]) / 6)} ${F(p2[0])},${F(p2[1])}`; } return d; };
  const WL = [[1030, 520], [1014, 540], [990, 562], [978, 586], [986, 606], [950, 634], [904, 662], [872, 694], [800, 720]];
  const WR = [[1600, 520], [1622, 540], [1664, 560], [1706, 582], [1716, 606], [1694, 632], [1726, 664], [1800, 694], [1890, 720]];
  const WATER = `M1030,520 L1600,520${cr(WR)} L800,720${cr([...WL].reverse())}Z`;
  const AB_L = [[926, 508], [1046, 500], [1052, 568], [918, 576]], AB_R = [[1576, 500], [1670, 506], [1678, 566], [1570, 572]];
  const PIER = [[1282, 500], [1338, 500], [1342, 566], [1310, 580], [1278, 566]];

  const SKY_H = NIGHT ? "#3e4c78" : "#f4dcae", HZ = NIGHT ? "#33416a" : "#ecdcb6";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#060b20"/><stop offset=".45" stop-color="#0f1a40"/><stop offset=".8" stop-color="#26365f"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#3f7fc4"/><stop offset=".45" stop-color="#86b8e2"/><stop offset=".78" stop-color="#d9e1d2"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#dfe8ff" stop-opacity=".5"/><stop offset=".15" stop-color="#b8c8f0" stop-opacity=".2"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".06"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d6" stop-opacity=".9"/><stop offset=".18" stop-color="#ffefc0" stop-opacity=".45"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  let s = `<defs id="cbdefs">
    <linearGradient id="cbSky" x1="0" y1="0" x2="0" y2="480" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="cbLight" cx="${LX}" cy="${LY}" r="760" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="cbHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".55"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    ${g2("cbFar1", NIGHT ? "#243058" : "#98aac8", NIGHT ? "#2c3860" : "#b9c3cd")}
    ${g2("cbFar2", NIGHT ? "#1e2a50" : "#879cb2", NIGHT ? "#26325a" : "#a9b4b0")}
    ${g2("cbHill1", T("#8c9858"), T("#76844a"))}
    ${g2("cbHill2", T("#7a8c46"), T("#61723a"))}
    <linearGradient id="cbMeadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T("#aaa652")}"/><stop offset=".5" stop-color="${T("#8c8a3e")}"/><stop offset="1" stop-color="${T("#5e6228")}"/></linearGradient>
    <linearGradient id="cbWater" x1="0" y1="520" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#34446e"/><stop offset=".4" stop-color="#1c2748"/><stop offset="1" stop-color="#0b1128"/>`
      : `<stop offset="0" stop-color="#a6c0cc"/><stop offset=".35" stop-color="#6e908c"/><stop offset="1" stop-color="#3a5450"/>`}</linearGradient>
    ${g2("cbTrunkL", T("#7a5238"), T("#2e1c12"), 1, 0)}
    ${g2("cbTrunkR", T("#2e1c12"), T("#7a5238"), 1, 0)}
    ${g2("cbSyc", T("#f0ebdc"), T("#9a927c"), 1, 0)}
    ${g2("cbRoad", T("#d6bc90"), T("#b09468"))}
    <linearGradient id="cbRoofSh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${RIM}" stop-opacity=".28"/><stop offset=".5" stop-color="${RIM}" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
    <linearGradient id="cbUnder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <radialGradient id="cbGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <clipPath id="cbWaterClip"><path d="${WATER}"/></clipPath>
    <clipPath id="cbAbL"><path d="${poly(AB_L)}"/></clipPath><clipPath id="cbAbR"><path d="${poly(AB_R)}"/></clipPath><clipPath id="cbPier"><path d="${poly(PIER)}"/></clipPath>
    <filter id="cbLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="cbLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="cbCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="32" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="cbRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.1"/></filter>
    <filter id="cbRipple2" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".003 .07" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="22" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.8"/></filter>
    <filter id="cbPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="cbSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="cbBlur"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#cbSky)"/>`;

  /* sun, or a waning gibbous moon lit on its left with stars */
  if (NIGHT) {
    for (let i = 0; i < 420; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 430, d = Math.hypot(x - LX, y - LY), big = rs() < .08, o = .2 + rs() * .6 * (1 - y / 480);
      if (d < 170) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 34;
    s += `<rect width="${W}" height="${H}" fill="url(#cbLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 18}" fill="#cfdcff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#eef2fc"/>`;
    [[-12, -10, 9, 7], [6, -14, 8, 6], [-4, 6, 10, 7], [-16, 12, 6, 6]].forEach(([dx, dy, a, b]) => s += `<ellipse cx="${LX + dx}" cy="${LY + dy}" rx="${a}" ry="${b}" fill="#9aa4bc" opacity=".35"/>`);
    s += `<path d="M${LX},${LY - R} A${R},${R} 0 0 1 ${LX},${LY + R} A${R * .5},${R} 0 0 0 ${LX},${LY - R}Z" fill="#26304e" opacity=".88"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#cbLight)"/><circle cx="${LX}" cy="${LY}" r="40" fill="#fffbe8"/>`;
    s += `<g class="rays" opacity=".1" filter="url(#cbSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .45 + k * .32, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: fair-weather cumulus by day, thin moonlit strata by night; lit on the side facing the light */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#cbCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#1a2244"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#26305a"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="#5a6a9c" opacity=".8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .16)}" rx="${F(R * .4)}" ry="${F(R * .07)}" fill="#a8b8e4" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .15 * (.6 + rs() * .7), w * (.09 + rs() * .07)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .07)}" fill="#bccadb"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .75)}" fill="#c9d3e0"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .85)}" fill="#f7f6f2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .35)}" rx="${F(R * .6)}" ry="${F(R * .4)}" fill="#fffbea"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(520, 165, 470, "drift1") + cloud(1720, 105, 560, "drift2") + cloud(2290, 215, 300, "drift3") + cloud(240, 262, 250, "drift2");
  /* geese heading south, in a loose V (by day) */
  if (!NIGHT) {
    s += `<g class="birds" fill="none" stroke="#3a3a48" stroke-width="2.2" stroke-linecap="round" opacity=".75">`;
    for (let k = -5; k <= 5; k++) { const x = 1260 + Math.abs(k) * 22 + (rs() - .5) * 6, y = 222 + k * 11, q = .75 + rs() * .25;
      s += `<path d="M${F(x - 9 * q)},${F(y - 2 * q)} q${F(5 * q)},${F(-5 * q)} ${F(9 * q)},${F(2 * q)} q${F(4 * q)},${F(-6 * q)} ${F(9 * q)},${F(-3 * q)}"/>`; }
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* forests: hundreds of small trees along a ridge, early-October mix, mostly still green */
  const EARLY = ["#3f6a2c", "#4a7430", "#557e34", "#5e8a3a", "#6a9440", "#76983e", "#86a044", "#9aa446", "#b8a844", "#d0a23e", "#d8822e", "#c0502a", "#6f8a36", "#557e34"];
  const forest = (fn, rows, size, haze, conifer) => {
    let f = ""; const trees = [];
    for (let row = 0; row < rows; row++) for (let x = -10; x < W + 10; x += size * (.9 + r() * .5)) {
      const y = fn(x) + row * size * .72 + size * .4 + r() * size * .3, sz = size * (.75 + r() * .45);
      trees.push([x + r() * size * .4, y, sz]); }
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(([x, y, sz]) => {
      const lsd = x < LX ? 1 : -1;
      if (r() < conifer) {
        const c = T(mix("#3d5a34", "#e2dcc4", haze));
        f += `<path d="M${F(x)},${F(y - sz * 1.9)} L${F(x + sz * .3)},${F(y - sz * 1.2)} L${F(x + sz * .2)},${F(y - sz * 1.2)} L${F(x + sz * .55)},${F(y)} L${F(x - sz * .55)},${F(y)} L${F(x - sz * .2)},${F(y - sz * 1.2)} L${F(x - sz * .3)},${F(y - sz * 1.2)}Z" fill="${c}"/><path d="M${F(x)},${F(y - sz * 1.9)} L${F(x - lsd * sz * .3)},${F(y - sz * 1.2)} L${F(x - lsd * sz * .2)},${F(y - sz * 1.2)} L${F(x - lsd * sz * .55)},${F(y)} L${F(x)},${F(y)}Z" fill="${mix(c, "#000000", .2)}"/>`;
        return; }
      const base = EARLY[Math.floor(r() * EARLY.length)], c = T(mix(base, "#e2dcc4", haze)), dk = mix(c, NIGHT ? "#050814" : "#1a1a0c", .38), lt = mix(c, RIM, NIGHT ? .22 : .3);
      f += `<path d="${blobP(x - lsd * sz * .12, y + sz * .1, sz * .95, sz * .8, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz * .08, sz * .85, sz * .72, 7)}" fill="${c}"/><path d="${blobP(x + lsd * sz * .25, y - sz * .35, sz * .42, sz * .3, 6)}" fill="${lt}"/>`;
    });
    return f;
  };

  /* far hills: two bands of low Ohio hills, paler and bluer with distance */
  const m1 = wave([1, 2, 4], [300, 130, 60], [22, 10, 4]), m2 = wave([3, 5, 1], [360, 150, 70], [18, 9, 4]);
  const far1 = x => 402 + m1(x), far2 = x => 436 + m2(x);
  s += `<path d="${ridgePath(far1)}" fill="url(#cbFar1)"/>`;
  s += `<path d="${ridgePath(far2)}" fill="url(#cbFar2)"/>`;
  s += `<g filter="url(#cbLeafyS)" opacity=".8">${forest(far2, 2, 7, .62, .12)}</g>`;
  s += `<rect x="0" y="384" width="${W}" height="110" fill="url(#cbHaze)"/>`;

  /* far forest band, then the far farmhouse on its foot */
  const h1 = wave([2, 4, 0], [300, 130, 55], [16, 7, 3]), h2 = wave([5, 1, 3], [380, 160, 70], [12, 6, 3]);
  const hill1 = x => 462 + h1(x), hill2 = x => 494 + h2(x);
  s += `<path d="${ridgePath(hill1)}" fill="url(#cbHill1)"/>`;
  s += `<g filter="url(#cbLeafyS)">${forest(hill1, 3, 12, .38, .14)}</g>`;
  s += `<rect x="0" y="462" width="${W}" height="80" fill="url(#cbHaze)" opacity=".55"/>`;
  s += `<path d="${ridgePath(hill2)}" fill="url(#cbHill2)"/>`;
  s += `<g filter="url(#cbLeafyS)">${forest(hill2, 2, 18, .14, .1)}</g>`;

  /* the creek, seen under the bridge and widening toward us */
  s += `<path d="${WATER}" fill="url(#cbWater)"/>`;
  s += `<path d="M1030,512 L1600,512 L1600,524 L1030,524Z" fill="${T("#4a5a2c")}"/>`;
  for (let x = 1034; x < 1600; x += 4 + r() * 5) s += `<path d="M${F(x)},${F(522 + r() * 3)} q${F(-1 + r() * 2)},-6 ${F(-2 + r() * 4)},${F(-9 - r() * 6)}" stroke="${T(r() < .5 ? "#7a8a3a" : "#3e4a22")}" stroke-width="1.6" fill="none"/>`;
  s += `<g clip-path="url(#cbWaterClip)">`;
  for (let k = 0; k < 120; k++) { const y = 526 + Math.pow(r(), .8) * 194, t = (y - 520) / 200;
    s += `<rect x="${F(760 + r() * 1200)}" y="${F(y)}" width="${F(20 + r() * 120 * (.4 + t))}" height="${F(1 + t * 1.4)}" rx="1" fill="${NIGHT ? (r() < .5 ? "#8a9ad0" : "#2a3458") : (r() < .5 ? "#e8f0f0" : "#2e4442")}" opacity="${F(.1 + r() * .16)}"/>`; }
  s += `</g>`;
  const waterAt = s.length;       // bridge reflection goes in here once the bridge is built

  /* near banks: meadow on both sides of the creek */
  const lb = wave([2, 5, 1], [260, 110, 45], [6, 3, 1.5]), rb = wave([4, 1, 3], [240, 100, 40], [6, 3, 1.5]);
  const bankL = x => 516 + lb(x) - Math.max(0, 1 - Math.abs(x - 560) / 300) * 16 - Math.max(0, x - 860) * .08;
  const bankR = x => 512 + rb(x) - Math.max(0, 1 - Math.abs(x - 2230) / 260) * 8;
  let lp = `M0,720 L0,${F(bankL(0))}`; for (let x = 16; x <= 1030; x += 16) lp += ` L${x},${F(bankL(Math.min(x, 1030)))}`;
  lp += ` L1030,520${cr(WL)}Z`;
  let rp = `M1600,520`; for (let x = 1600; x <= W; x += 16) rp += ` L${x},${F(bankR(x))}`;
  rp += ` L${W},720 L1890,720${cr([...WR].reverse())}Z`;
  s += `<path d="${lp}" fill="url(#cbMeadow)"/><path d="${rp}" fill="url(#cbMeadow)"/>`;
  // mown field stripes on the right bank, and a lit edge along the banks
  for (let k = 1; k < 7; k++) s += `<path d="M1700,${F(bankR(1700) + k * 9)} Q2100,${F(bankR(2100) + k * 10 - 4)} 2560,${F(bankR(2560) + k * 9)}" stroke="${T("#6a6a2a")}" stroke-width="1.6" fill="none" opacity=".35"/>`;
  // damp mud margin, pebbles and overhanging grass along both waterlines
  s += `<path d="M1030,521${cr(WL)}" stroke="${T("#5a4a2e")}" stroke-width="9" fill="none" opacity=".55"/><path d="M1030,521${cr(WL)}" stroke="${T("#3a3018")}" stroke-width="3" fill="none" opacity=".6"/>`;
  s += `<path d="M1600,521${cr(WR)}" stroke="${T("#7a6a44")}" stroke-width="9" fill="none" opacity=".55"/><path d="M1600,521${cr(WR)}" stroke="${RIM}" stroke-width="2" fill="none" opacity="${NIGHT ? .3 : .45}"/>`;
  const along = (pts, t) => { const f = t * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), u = f - i; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u]; };
  [[WL, 1], [WR, -1]].forEach(([pts, side]) => {
    for (let k = 0; k < 70; k++) { const [x, y] = along(pts, r()), R = 2 + r() * 5 * (y - 500) / 160, c = ["#6e6a60", "#8a8478", "#a09a8c", "#b8b2a2"][Math.floor(r() * 4)];
      s += `<path d="${blobP(x + side * r() * 6, y + r() * 3, R, R * .6, 6)}" fill="${T(c)}"/><path d="${blobP(x + side * r() * 6 - R * .2, y - R * .2, R * .45, R * .22, 5)}" fill="${mix(T(c), RIM, .35)}"/>`; }
    for (let k = 0; k < 110; k++) { const [x, y] = along(pts, r()), h = 6 + r() * 14 * (y - 490) / 200;
      s += `<path d="M${F(x - side * (3 + r() * 6))},${F(y + 2)} q${F(side * h * .4)},${F(-h * .7)} ${F(side * h * .8)},${F(-h * .2)}" stroke="${T(r() < .5 ? "#8a8a3a" : "#4e5a24")}" stroke-width="1.6" fill="none"/>`; } });

  /* the road: from the bottom left up to the bridge portal, and a farm track on the right */
  const RL = [[300, 720], [420, 640], [700, 560], [948, 508]], RR = [[480, 720], [560, 640], [760, 566], [1004, 500]];
  s += `<path d="M300,720 C420,640 700,560 948,508 L1004,500 C760,566 560,640 480,720Z" fill="url(#cbRoad)"/>`;
  s += `<path d="M300,720 C420,640 700,560 948,508" stroke="${T("#8a7048")}" stroke-width="3" fill="none" opacity=".6"/>`;
  for (let k = 0; k < 2; k++) { const o = k ? .62 : .36;
    s += `<path d="${line(Array.from({ length: 21 }, (_, i) => { const t = i / 20, a = bz(RL, t), b = bz(RR, t); return [a[0] + (b[0] - a[0]) * o, a[1] + (b[1] - a[1]) * o]; }))}" stroke="${T("#a88a5c")}" stroke-width="${k ? 5 : 4}" fill="none" opacity=".55"/>`; }
  for (let i = 0; i < 90; i++) { const t = r(), a = bz(RL, t), b = bz(RR, t), o = r();
    s += `<ellipse cx="${F(a[0] + (b[0] - a[0]) * o)}" cy="${F(a[1] + (b[1] - a[1]) * o)}" rx="${F(1 + (1 - t) * 2.5)}" ry="${F(.8 + (1 - t) * 1.2)}" fill="${T(r() < .5 ? "#8a7050" : "#efe0c0")}" opacity=".5"/>`; }
  s += `<path d="M1672,514 C1800,506 1980,512 2180,508" stroke="${T("#c8b082")}" stroke-width="5" fill="none" opacity=".75"/>`;

  /* far farmhouse and shed at the foot of the far hills */
  { const x = 2230, y = 508;
    s += `<ellipse cx="${x + 20}" cy="${y + 2}" rx="80" ry="5" fill="#000" opacity=".15"/>`;
    s += `<rect x="${x - 40}" y="${y - 42}" width="80" height="42" fill="${T("#efe7d6")}"/><rect x="${x + 4}" y="${y - 42}" width="36" height="42" fill="#000" opacity=".12"/>`;
    for (let k = 1; k < 7; k++) s += `<rect x="${x - 40}" y="${y - 42 + k * 6}" width="80" height="1" fill="${T("#b8ae98")}" opacity=".6"/>`;
    s += `<path d="${poly([[x - 48, y - 40], [x, y - 76], [x + 48, y - 40]])}" fill="${T("#5a5e68")}"/><path d="${poly([[x, y - 76], [x + 48, y - 40], [x + 20, y - 40]])}" fill="${T("#454852")}"/>`;
    s += `<path d="M${x - 48},${y - 40} L${x},${y - 76}" stroke="${RIM}" stroke-width="1.5" opacity=".6"/><rect x="${x + 16}" y="${y - 82}" width="9" height="22" fill="${T("#7a4a3a")}"/>`;
    s += `<path d="${poly([[x - 46, y - 18], [x + 46, y - 18], [x + 50, y - 12], [x - 50, y - 12]])}" fill="${T("#6a6e76")}"/>`;
    for (let k = 0; k < 6; k++) s += `<rect x="${x - 44 + k * 17.5}" y="${y - 12}" width="2" height="12" fill="${T("#f4efe4")}"/>`;
    [[x - 30, y - 34], [x - 12, y - 34], [x + 8, y - 34], [x + 24, y - 34]].forEach(([wx, wy]) => {
      s += `<rect x="${wx}" y="${wy}" width="9" height="12" fill="${NIGHT ? LAMP : "#6a86a0"}"/><path d="M${wx + 4.5},${wy} v12" stroke="${T("#f4efe4")}" stroke-width="1"/>`;
      if (NIGHT) s += `<circle cx="${wx + 4.5}" cy="${wy + 6}" r="18" fill="url(#cbGlow)" opacity=".5"/>`; });
    if (NIGHT) s += `<circle cx="${x - 2}" cy="${y - 10}" r="26" fill="url(#cbGlow)" opacity=".6"/><rect x="${x - 4}" y="${y - 14}" width="4" height="5" fill="${LAMP}"/>`;
    const sx = x + 92;
    s += `<rect x="${sx - 22}" y="${y - 28}" width="44" height="28" fill="${T("#a8392a")}"/><rect x="${sx + 4}" y="${y - 28}" width="18" height="28" fill="#000" opacity=".15"/><path d="${poly([[sx - 27, y - 26], [sx, y - 44], [sx + 27, y - 26]])}" fill="${T("#4a4e58")}"/><rect x="${sx - 8}" y="${y - 20}" width="16" height="20" fill="${T("#5a1e18")}"/>`;
  }

  /* corn shocks and pumpkins on the right bank */
  const shock = (x, y, h) => {
    let g = `<ellipse cx="${F(x + 14)}" cy="${F(y + 2)}" rx="${F(h * .5)}" ry="${F(h * .07)}" fill="#000" opacity=".2"/>`;
    const w = h * .36, CS = ["#8a6e2c", "#a88838", "#c8a452", "#dcc06a", "#eed688"];
    for (let k = 0; k < 46; k++) { const u = k / 45, bx = x - w + u * 2 * w + (r() - .5) * 4, tx = x + (bx - x) * .12, lit = ((x - bx) / w * (x < LX ? -1 : 1) * .5 + .5) * .8 + r() * .25;
      g += `<path d="M${F(bx)},${F(y)} Q${F((bx + tx) / 2)},${F(y - h * .5)} ${F(tx)},${F(y - h * .78)}" stroke="${T(CS[Math.min(4, Math.floor(lit * 5))])}" stroke-width="2.4" fill="none"/>`; }
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (r() - .5) * 1.4;
      g += `<path d="M${F(x)},${F(y - h * .78)} q${F(Math.cos(a) * 6)},${F(Math.sin(a) * 10)} ${F(Math.cos(a) * 14)},${F(Math.sin(a) * 22)}" stroke="${T(r() < .5 ? "#c8a452" : "#eed688")}" stroke-width="1.8" fill="none"/>`; }
    return g + `<path d="M${F(x - w * .16)},${F(y - h * .7)} L${F(x + w * .16)},${F(y - h * .7)}" stroke="${T("#6a4a24")}" stroke-width="3"/>`;
  };
  const pumpkin = (x, y, R) => { const sd = x < LX ? 1 : -1;
    let g = `<ellipse cx="${F(x + 3)}" cy="${F(y + 1)}" rx="${F(R * 1.3)}" ry="${F(R * .25)}" fill="#000" opacity=".22"/>`;
    g += `<ellipse cx="${F(x)}" cy="${F(y - R * .7)}" rx="${F(R * 1.15)}" ry="${F(R * .78)}" fill="${T("#c0501a")}"/>`;
    g += `<ellipse cx="${F(x + sd * R * .2)}" cy="${F(y - R * .74)}" rx="${F(R * .7)}" ry="${F(R * .72)}" fill="${T("#e2701e")}"/>`;
    g += `<ellipse cx="${F(x + sd * R * .38)}" cy="${F(y - R * .9)}" rx="${F(R * .3)}" ry="${F(R * .4)}" fill="${T("#f6a24a")}"/>`;
    g += `<path d="M${F(x - R * .4)},${F(y - R * 1.4)} q${F(-R * .15)},${F(R * .7)} 0,${F(R * 1.3)} M${F(x + R * .4)},${F(y - R * 1.4)} q${F(R * .15)},${F(R * .7)} 0,${F(R * 1.3)}" stroke="${T("#a8401a")}" stroke-width="1.2" fill="none" opacity=".7"/>`;
    return g + `<path d="M${F(x)},${F(y - R * 1.44)} l${F(R * .12)},${F(-R * .4)}" stroke="${T("#4a5a22")}" stroke-width="${F(Math.max(1.5, R * .2))}" stroke-linecap="round"/>`; };
  [[1935, 536, 62], [2010, 530, 58], [2085, 540, 66], [2360, 534, 60], [2430, 542, 68]].forEach(([x, y, h]) => s += shock(x, y, h));
  [[1968, 546, 7], [2050, 548, 6], [2120, 552, 8], [2398, 552, 7], [2290, 540, 6]].forEach(([x, y, R]) => s += pumpkin(x, y, R));

  /* a deciduous tree built from hundreds of small leaf clumps, lit from the light */
  const leafTree = (x, y, h, n, RAMP, syc) => {
    let g = "";
    const cx = x, cy = y - h * .64, rx = h * .4, ry = h * .32, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl;
    g += `<ellipse cx="${F(x - ux * 30)}" cy="${F(y + 4)}" rx="${F(h * .75)}" ry="${F(h * .06)}" fill="${NIGHT ? "#02040c" : "#2a2a10"}" opacity=".28"/>`;
    const tb = h * (syc ? .055 : .065), tt = h * .03, ty = y - h * .56;
    g += `<path d="M${F(x - tb)},${F(y)} C${F(x - tb * .7)},${F(y - h * .25)} ${F(x - tt * 1.4)},${F(y - h * .4)} ${F(x - tt)},${F(ty)} L${F(x + tt)},${F(ty)} C${F(x + tt * 1.4)},${F(y - h * .4)} ${F(x + tb * .7)},${F(y - h * .25)} ${F(x + tb)},${F(y)}Z" fill="url(#${syc ? "cbSyc" : ux > 0 ? "cbTrunkR" : "cbTrunkL"})"/>`;
    if (syc) for (let k = 0; k < 26; k++) { const py = y - r() * h * .52, px = x + (r() - .5) * tb * 1.4 * (1 - (y - py) / h * .5);
      g += `<path d="${blobP(px, py, 3 + r() * 5, 2 + r() * 4, 6)}" fill="${T(r() < .6 ? "#8a8a6a" : "#b8b098")}" opacity=".75"/>`; }
    const limbs = [[-1, .5, .26, .18], [1, .52, .28, .16], [-1, .6, .18, .22], [1, .62, .2, .22], [0, .62, .03, .26]];
    const limbCol = syc ? T("#e4dfcc") : T("#3a2416");
    limbs.forEach(([d, at, dx, dy]) => g += `<path d="M${F(x)},${F(y - h * at)} Q${F(x + d * h * dx * .4)},${F(y - h * at - h * dy * .6)} ${F(x + d * h * dx)},${F(y - h * at - h * dy)}" stroke="${limbCol}" stroke-width="${F(h * .03)}" fill="none" stroke-linecap="round"/>`);
    const crown = [[cx, cy, rx, ry * .8], [cx - rx * .62, cy + ry * .2, rx * .55, ry * .6], [cx + rx * .62, cy + ry * .15, rx * .58, ry * .62], [cx - rx * .1, cy - ry * .55, rx * .55, ry * .5], [cx + rx * .3, cy - ry * .42, rx * .5, ry * .45], [cx, cy + ry * .45, rx * .85, ry * .42]];
    const inC = (px, py) => crown.some(([a, b, c, d]) => ((px - a) / c) ** 2 + ((py - b) / d) ** 2 < 1);
    const cl = [];
    for (let i = 0; i < n * 3 && cl.length < n; i++) { const px = cx - rx * 1.25 + r() * rx * 2.5, py = cy - ry * 1.3 + r() * ry * 2.3;
      if (!inC(px, py)) continue;
      const nx = (px - cx) / (rx * 1.2), ny = (py - cy) / (ry * 1.2), lit = (nx * ux + ny * uy) * .5 + .5, edge = Math.min(1, Math.hypot(nx, ny));
      cl.push([px, py, Math.max(0, Math.min(.999, lit * .72 + edge * .15 + (r() - .5) * .3)), h * (.028 + r() * .026)]); }
    cl.sort((a, b) => a[2] - b[2]);
    let cg = "";
    cl.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .8, 6)}" fill="${T(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    g += `<g filter="url(#cbLeafy)">${cg}</g>`;
    return g;
  };
  const MAPLE = ["#2e4020", "#405428", "#5a6a2c", "#8a6a2a", "#b8552a", "#d8702c", "#ee9a3a", "#f8c860"];
  const SYCA = ["#2a3c1e", "#384e24", "#4a622a", "#5e7630", "#768a38", "#94a042", "#b8b458", "#e0d480"];

  /* left bank: small trees by the creek, the maple on its knoll, the pumpkin stand, fence and mailbox */
  let lt = "";
  [[70, 530, 120], [180, 528, 150], [300, 534, 110], [860, 520, 90], [1000, 516, 70]].forEach(([x, y, h]) => lt += leafTree(x, y, h, 150, EARLY.slice(0, 8).sort(), false));
  s += lt;
  s += leafTree(560, 522, 250, 700, MAPLE, false);
  for (let k = 0; k < 160; k++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()), x = 560 + Math.cos(a) * d * 170, y = 522 + Math.sin(a) * d * 14;
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(2.5 + r() * 2.5)}" ry="${F(1.5 + r() * 1.2)}" fill="${T(MAPLE[4 + Math.floor(r() * 4)])}" transform="rotate(${F(r() * 180)} ${F(x)} ${F(y)})"/>`; }
  { const x = 800, y = 522;      // roadside pumpkin stand
    s += `<ellipse cx="${x + 10}" cy="${y + 2}" rx="56" ry="5" fill="#000" opacity=".2"/>`;
    s += `<rect x="${x - 38}" y="${y - 50}" width="5" height="50" fill="${T("#5a3e28")}"/><rect x="${x + 33}" y="${y - 50}" width="5" height="50" fill="${T("#4a3220")}"/>`;
    s += `<path d="${poly([[x - 48, y - 48], [x - 30, y - 66], [x + 34, y - 66], [x + 50, y - 48]])}" fill="${T("#7a4a2e")}"/><path d="${poly([[x - 48, y - 48], [x + 50, y - 48], [x + 48, y - 44], [x - 46, y - 44]])}" fill="${T("#4a2e1c")}"/>`;
    s += `<path d="M${x - 48},${y - 48} L${x - 30},${y - 66} L${x + 34},${y - 66}" stroke="${RIM}" stroke-width="1.5" fill="none" opacity=".6"/>`;
    s += `<rect x="${x - 36}" y="${y - 22}" width="72" height="22" fill="${T("#8a5a36")}"/>`;
    for (let k = 0; k < 4; k++) s += `<rect x="${x - 36}" y="${y - 22 + k * 5.5}" width="72" height="1" fill="${T("#5a3a22")}"/>`;
    s += `<rect x="${x - 22}" y="${y - 62}" width="44" height="11" fill="${T("#efe6d2")}"/><path d="M${x - 17},${y - 56.5} h10 m4,0 h8 m4,0 h10" stroke="${T("#b04020")}" stroke-width="2.5"/>`;
    [[x - 24, y - 22, 7], [x - 8, y - 22, 8], [x + 9, y - 22, 7], [x + 24, y - 22, 6], [x - 15, y - 30, 6], [x + 2, y - 31, 7], [x + 17, y - 29, 5], [x - 40, y + 2, 9], [x + 44, y + 3, 8], [x + 58, y + 5, 6]].forEach(([px, py, R]) => s += pumpkin(px, py, R));
    if (NIGHT) s += `<circle cx="${x}" cy="${y - 40}" r="46" fill="url(#cbGlow)" opacity=".55"/><rect x="${x - 3}" y="${y - 46}" width="6" height="9" rx="2" fill="${LAMP}"/>`;
  }
  s += `<rect x="903" y="${F(bankL(905) - 30)}" width="4" height="30" fill="${T("#5a3e28")}"/><rect x="895" y="${F(bankL(905) - 40)}" width="20" height="11" rx="5" fill="${T("#5a6068")}"/><rect x="895" y="${F(bankL(905) - 40)}" width="8" height="11" rx="4" fill="${T("#8a9098")}"/><rect x="913" y="${F(bankL(905) - 44)}" width="2" height="8" fill="${T("#c03020")}"/>`;
  // split-rail fence along the far side of the road
  { const posts = []; for (let t = .12; t <= .8; t += .052) { const p = bz(RL, t); posts.push([p[0] - 6, p[1] - 10]); }
    let f = "";
    posts.forEach(([x, y], i) => { const k = 1 - i / posts.length * .5;
      f += `<rect x="${F(x - 2 * k)}" y="${F(y - 30 * k)}" width="${F(4 * k)}" height="${F(32 * k)}" fill="${T("#5a3e28")}"/>`;
      if (i + 1 < posts.length) { const [x2, y2] = posts[i + 1];
        [10, 18, 26].forEach((hh, j) => { const z = j % 2 ? 2 : -2;
          f += `<path d="M${F(x)},${F(y - hh * k + z)} L${F(x2)},${F(y2 - hh * k - z)}" stroke="${T("#7a5a3a")}" stroke-width="${F(3.4 * k)}" stroke-linecap="round"/><path d="M${F(x)},${F(y - hh * k + z - 1.3)} L${F(x2)},${F(y2 - hh * k - z - 1.3)}" stroke="${T("#b89468")}" stroke-width="${F(1.1 * k)}" opacity=".8"/>`; }); } });
    s += f; }

  /* the covered bridge */
  const WALL = "#a8392a", WALL_D = "#7e2a20", END = "#c44c34", TRIM = "#ece0c8", ROOF = "#6a6258", IN = "#22140e";
  const STONE = ["#8a8478", "#a09a8c", "#b8b2a2", "#7a7266", "#9a8a74", "#6e6a60"];
  let br = "";
  const stones = (pts, clip, x0, x1, y0, y1) => {
    let g = `<path d="${poly(pts)}" fill="${T("#5a564e")}"/><g clip-path="url(#${clip})">`;
    for (let y = y0, row = 0; y < y1; y += 11 + r() * 3, row++) for (let x = x0 - (row % 2) * 14; x < x1; ) { const w = 18 + r() * 18, hh = 10 + r() * 2, c = STONE[Math.floor(r() * STONE.length)];
      g += `<rect x="${F(x + 1)}" y="${F(y + 1)}" width="${F(w - 2)}" height="${F(hh - 2)}" rx="3" fill="${T(c)}"/><path d="M${F(x + 2)},${F(y + 2)} h${F(w - 5)}" stroke="${mix(T(c), RIM, .45)}" stroke-width="1.4" opacity=".8"/><path d="M${F(x + 3)},${F(y + hh - 1.5)} h${F(w - 5)}" stroke="#000" stroke-width="1.2" opacity=".25"/>`;
      x += w; }
    g += `<rect x="${x0 - 20}" y="${y1 - 22}" width="${x1 - x0 + 40}" height="30" fill="${T("#3a4a2a")}" opacity=".45"/>`;
    const lx = pts[0][0] < LX;
    return g + `<rect x="${lx ? x1 - 30 : x0 - 10}" y="${y0 - 10}" width="40" height="${y1 - y0 + 20}" fill="#000" opacity=".16"/></g>`;
  };
  br += `<rect x="1040" y="500" width="540" height="26" fill="url(#cbUnder)"/>`;
  br += stones(AB_L, "cbAbL", 914, 1056, 500, 578) + stones(PIER, "cbPier", 1276, 1346, 500, 582) + stones(AB_R, "cbAbR", 1566, 1682, 500, 572);
  // side wall: vertical boards and battens, weathering, eave shadow
  br += `<rect x="1010" y="392" width="602" height="100" fill="${T(WALL)}"/>`;
  for (let x = 1012; x < 1610; x += 7) { br += `<rect x="${x}" y="392" width="6.2" height="98" fill="${T(mix(WALL, r() < .5 ? "#000000" : "#ffffff", r() * .12))}"/><rect x="${x + 6}" y="392" width="1.2" height="98" fill="${T(WALL_D)}"/>`; }
  for (let k = 0; k < 40; k++) br += `<rect x="${F(1014 + r() * 590)}" y="${F(400 + r() * 50)}" width="${F(1.5 + r() * 2)}" height="${F(12 + r() * 36)}" fill="${T("#e8a890")}" opacity="${F(.08 + r() * .1)}"/>`;
  br += `<rect x="1010" y="392" width="602" height="26" fill="#000" opacity=".3"/><rect x="1010" y="418" width="602" height="8" fill="#000" opacity=".1"/>`;
  for (let k = 0; k < 7; k++) { const wx = 1068 + k * 82, wy = 432;
    br += `<rect x="${wx - 3}" y="${wy - 3}" width="32" height="26" fill="${T(TRIM)}"/><rect x="${wx}" y="${wy}" width="26" height="20" fill="${NIGHT ? LAMP : IN}"/>`;
    br += NIGHT ? `<rect x="${wx}" y="${wy}" width="26" height="6" fill="#e89a40" opacity=".6"/>` : `<rect x="${wx}" y="${wy + 14}" width="26" height="6" fill="#6a4a30"/><path d="M${wx + 6},${wy} l-4,20 M${wx + 18},${wy} l4,20" stroke="#4a3020" stroke-width="2"/>`; }
  br += `<rect x="1606" y="392" width="6" height="100" fill="${T(TRIM)}" opacity=".85"/>`;
  br += `<rect x="1004" y="488" width="612" height="12" fill="${T("#5a3e2c")}"/><rect x="1004" y="488" width="612" height="2" fill="${T("#8a6446")}"/><rect x="1004" y="497" width="612" height="3" fill="#000" opacity=".3"/>`;
  // gable end facing us at an angle, lit, with the portal
  const EB = [946, 508], EBR = [1010, 500], EER = [1010, 392], PK = [978, 318], EEL = [946, 400];
  br += `<path d="${poly([EB, EBR, EER, PK, EEL])}" fill="${T(END)}"/>`;
  for (let x = 950; x < 1008; x += 6) { const t = (x - 946) / 64, yb = 508 - t * 8, yt = x < 978 ? 400 - (x - 946) / 32 * 82 : 318 + (x - 978) / 32 * 74;
    br += `<path d="M${x},${F(yb)} L${x},${F(yt + 2)}" stroke="${T(mix(END, "#000000", .22))}" stroke-width="1.3"/>`; }
  br += `<path d="M947,506 L947,402" stroke="${RIM}" stroke-width="2" opacity=".5"/>`;
  br += `<path d="M953,506 L953,448 Q976,418 1002,442 L1002,499Z" fill="${IN}"/>`;
  br += NIGHT ? `<path d="M957,504 L957,452 Q976,428 998,446 L998,500Z" fill="#ffae50" opacity=".45"/><circle cx="978" cy="470" r="60" fill="url(#cbGlow)" opacity=".55"/>`
              : `<path d="M972,496 L972,468 Q978,462 984,467 L984,495Z" fill="#f4e6b8" opacity=".8"/>`;
  br += `<path d="M953,506 L953,448 Q976,418 1002,442 L1002,499" stroke="${T(TRIM)}" stroke-width="3" fill="none"/>`;
  br += `<path d="${poly([[956, 414], [1000, 407], [1000, 419], [956, 426]])}" fill="${T(TRIM)}"/><path d="M962,419 L994,414" stroke="${T("#5a3020")}" stroke-width="2.5" stroke-dasharray="5 2"/>`;
  // roof: near plane with shingle courses, rake and fascia trim, ridge cap
  br += `<path d="${poly([[978, 316], [1598, 316], [1630, 398], [1000, 398]])}" fill="${T(ROOF)}"/>`;
  for (let i = 1; i < 12; i++) { const t = i / 12, y = 316 + t * 82, xl = 978 + t * 22, xr = 1598 + t * 32;
    br += `<path d="M${F(xl)},${F(y)} L${F(xr)},${F(y)}" stroke="${T("#4a443c")}" stroke-width="1.4"/>`;
    for (let x = xl + (i % 2) * 7; x < xr - 4; x += 12 + r() * 4) br += `<path d="M${F(x)},${F(y - 6.6)} l${F(t * 2)},6.6" stroke="${T("#4a443c")}" stroke-width="1" opacity=".7"/>`;
    for (let k = 0; k < 6; k++) { const w = 10 + r() * 20, x = xl + 4 + r() * (xr - xl - w - 10);
      br += `<rect x="${F(x)}" y="${F(y - 6)}" width="${F(w)}" height="5" fill="${T(r() < .5 ? "#8a8272" : "#5a6448")}" opacity=".5"/>`; } }
  br += `<path d="${poly([[978, 316], [1598, 316], [1630, 398], [1000, 398]])}" fill="url(#cbRoofSh)"/>`;
  br += `<path d="M936,406 L978,312 L1002,400" stroke="${T(TRIM)}" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M936,406 L978,312" stroke="${RIM}" stroke-width="1.6" opacity=".7"/>`;
  br += `<path d="M1000,399 L1630,399" stroke="${T(TRIM)}" stroke-width="4"/><path d="M978,315 L1598,315" stroke="${T("#3e3a34")}" stroke-width="5"/><path d="M978,312 L1598,312" stroke="${RIM}" stroke-width="1.5" opacity=".6"/>`;
  // lantern on a bracket by the portal
  br += `<path d="M1008,428 h12 v6" stroke="${T("#2a2a2a")}" stroke-width="2" fill="none"/><rect x="1014" y="434" width="12" height="16" rx="2" fill="${NIGHT ? LAMP : T("#3a3a3a")}" stroke="${T("#222222")}" stroke-width="1.5"/>`;
  if (NIGHT) br += `<circle cx="1020" cy="442" r="54" fill="url(#cbGlow)" opacity=".7"/>`;
  // bridge reflection in the creek, then the bridge itself
  const refl = `<g clip-path="url(#cbWaterClip)"><g transform="matrix(1,0,0,-1,0,1140)" opacity=".3" filter="url(#cbRipple2)">${br}</g></g>`;
  s = s.slice(0, waterAt) + refl + s.slice(waterAt);
  s += br;
  // foam at the pier and abutment feet
  [[1310, 578, 38], [986, 574, 60], [1624, 570, 56]].forEach(([x, y, w]) => { for (let k = 0; k < 8; k++)
    s += `<ellipse cx="${F(x + (r() - .5) * w)}" cy="${F(y + r() * 8)}" rx="${F(5 + r() * 10)}" ry="${F(1.2 + r())}" fill="${NIGHT ? "#8a9ad0" : "#f4f8f6"}" opacity="${F(.3 + r() * .3)}"/>`; });

  /* glints on the creek below the light */
  s += `<g clip-path="url(#cbWaterClip)" filter="url(#cbRipple)">`;
  for (let y = 590; y < H; y += 3 + (y - 590) * .02) { const t = (y - 590) / 130, n = 2 + Math.floor(t * 4);
    for (let k = 0; k < n; k++) { const off = (r() * 2 - 1) * (50 + t * 160) * Math.pow(r(), .6), L = 8 + r() * (26 + t * 50);
      s += `<rect x="${F(LX + 60 + off - L / 2)}" y="${F(y)}" width="${F(L)}" height="${F(1.3 + t * 2)}" rx="1" fill="${NIGHT ? "#d8e2ff" : "#fffbe8"}" opacity="${F((.7 - Math.abs(off) / 260) * (NIGHT ? .7 : .8))}"/>`; } }
  s += `</g>`;

  /* heron standing in the shallows, with its reflection */
  { const x = 1470, y = 602, sd = x < LX ? -1 : 1;
    const bird = `<path d="M${x - 2},${y} L${x - 4},${y - 34} M${x + 6},${y} L${x + 5},${y - 34}" stroke="${T("#6a5a3a")}" stroke-width="2.2"/>
      <path d="M${x - 12},${y - 56} C${x - 24},${y - 52} ${x - 24},${y - 38} ${x - 10},${y - 33} C${x + 2},${y - 30} ${x + 16},${y - 34} ${x + 30},${y - 38} C${x + 20},${y - 44} ${x + 12},${y - 56} ${x - 12},${y - 56}Z" fill="${T("#6a7a92")}"/>
      <path d="M${x - 12},${y - 55} C${x - 22},${y - 51} ${x - 21},${y - 41} ${x - 12},${y - 38} C${x - 2},${y - 40} ${x + 6},${y - 46} ${x + 12},${y - 52} C${x + 4},${y - 56} ${x - 4},${y - 57} ${x - 12},${y - 55}Z" fill="${T("#9aaabc")}"/>
      <path d="M${x - 6},${y - 44} q14,4 32,5" stroke="${T("#3e4a5e")}" stroke-width="2" fill="none"/><path d="M${x - 16},${y - 50} q-2,8 4,12" stroke="${T("#2a2a34")}" stroke-width="2.4" fill="none"/>
      <path d="M${x - 8},${y - 54} C${x - 20},${y - 66} ${x - 2},${y - 74} ${x - 12},${y - 88}" stroke="${T("#d8dee4")}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M${x - 8},${y - 54} C${x - 20},${y - 66} ${x - 2},${y - 74} ${x - 12},${y - 88}" stroke="${T("#8a96a4")}" stroke-width="2" fill="none" transform="translate(${sd * 2},1)"/>
      <ellipse cx="${x - 12}" cy="${y - 90}" rx="6" ry="4.5" fill="${T("#e8ecf0")}"/><path d="M${x - 16},${y - 93} l12,-2" stroke="#1a1a22" stroke-width="2"/>
      <path d="M${x - 17},${y - 90} l-20,3 l20,1Z" fill="${T("#d8a040")}"/><path d="M${x - 8},${y - 92} q10,-2 16,3" stroke="#1a1a22" stroke-width="1.4" fill="none"/>`;
    s += `<g transform="matrix(1,0,0,-1,0,${y * 2 + 2})" opacity=".3" filter="url(#cbRipple)">${bird}</g>${bird}`;
    s += `<ellipse cx="${x + 2}" cy="${y + 1}" rx="18" ry="2.5" fill="none" stroke="${NIGHT ? "#8a9ad0" : "#eef4f2"}" stroke-width="1.2" opacity=".5"/>`; }

  /* the sycamore on the right bank */
  s += leafTree(1770, 548, 285, 820, SYCA, true);
  let rt = "";
  [[2330, 556, 150], [2440, 548, 190], [2530, 560, 160], [1700, 560, 80]].forEach(([x, y, h]) => rt += leafTree(x, y, h, 170, EARLY.slice(0, 9).sort(), false));
  s += rt;

  /* creek-edge stones and cattails */
  const stone = (x, y, R) => { const sd = x < LX ? 1 : -1;
    return `<path d="${blobP(x, y, R, R * .5, 8)}" fill="${T("#5a5a54")}"/><path d="${blobP(x + sd * R * .2, y - R * .15, R * .7, R * .34, 7)}" fill="${T("#8a8478")}"/><path d="${blobP(x + sd * R * .38, y - R * .26, R * .34, R * .16, 6)}" fill="${T("#b8b2a2")}"/>`; };
  [[960, 612, 16], [920, 646, 22], [870, 690, 26], [1050, 700, 18], [1690, 612, 18], [1750, 646, 24], [1820, 690, 28], [1200, 690, 14], [1600, 700, 16]].forEach(([x, y, R]) => s += stone(x, y, R));
  const reeds = (x0, x1, yb) => { let g = "";
    for (let x = x0; x < x1; x += 3 + r() * 6) { const y = yb + r() * 18, h = 26 + r() * 50, lean = (r() - .5) * 14;
      g += `<path d="M${F(x)},${F(y)} q${F(lean * .3)},${F(-h * .5)} ${F(lean)},${F(-h)}" stroke="${T(r() < .35 ? "#8a8a42" : "#4a5424")}" stroke-width="${F(1.4 + r())}" fill="none"/>`;
      if (r() < .2) g += `<rect x="${F(x + lean * .85 - 3)}" y="${F(y - h * .92)}" width="6" height="15" rx="3" fill="${T("#5a3a22")}"/>`; }
    return g; };
  s += reeds(860, 960, 640) + reeds(1700, 1800, 624);

  /* meadow grass, goldenrod and asters, drawn over everything low */
  for (let x = 0; x < W; x += 5 + r() * 9) {
    if (x > 820 && x < 1880) continue;
    const top = x < 1200 ? bankL(x) : bankR(x), y = top + 6 + r() * (720 - top), hh = 8 + r() * 18 * (y - top + 60) / 260;
    s += `<path d="M${F(x)},${F(y)} q${F(-2 + r() * 4)},${F(-hh * .6)} ${F(-4 + r() * 8)},${F(-hh)}" stroke="${T(r() < .5 ? "#c8b262" : "#6a6228")}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`; }
  const goldenrod = (x, y, sc) => { let g = "";
    for (let k = 0; k < 4; k++) { const a = -1.9 + k * .25 + (r() - .5) * .2, L = (40 + r() * 20) * sc, tx = x + Math.cos(a) * L * .5, ty = y - L;
      g += `<path d="M${F(x)},${F(y)} Q${F(x + (tx - x) * .3)},${F(y - L * .6)} ${F(tx)},${F(ty)}" stroke="${T("#5a6a2a")}" stroke-width="${F(1.6 * sc)}" fill="none"/>`;
      for (let j = 0; j < 14; j++) { const u = j / 13, px = tx + Math.cos(a - .8) * u * 18 * sc + (r() - .5) * 5 * sc, py = ty + u * 8 * sc - Math.sin(u * 3) * 4 * sc + (r() - .5) * 4 * sc, R = (2.4 + r() * 1.6) * sc * (1 - u * .4);
        const v = Math.max(0, Math.min(.999, (x < LX ? .65 : .45) + (r() - .5) * .6));
        g += `<circle cx="${F(px)}" cy="${F(py)}" r="${F(R)}" fill="${T(["#8a6a14", "#b8901c", "#e2b82a", "#f4d24a", "#fbe588"][Math.floor(v * 5)])}"/>`; } }
    return g; };
  const asters = (x, y, sc) => { let g = "";
    for (let k = 0; k < 7; k++) { const px = x + (r() - .5) * 30 * sc, py = y - 10 * sc - r() * 24 * sc;
      g += `<path d="M${F(x + (px - x) * .3)},${F(y)} L${F(px)},${F(py)}" stroke="${T("#4a5a28")}" stroke-width="1.2"/><circle cx="${F(px)}" cy="${F(py)}" r="${F(4 * sc)}" fill="${T(r() < .5 ? "#8a6ac8" : "#a890e0")}"/><circle cx="${F(px - .8)}" cy="${F(py - .8)}" r="${F(2 * sc)}" fill="${T("#c8b8f0")}" opacity=".7"/><circle cx="${F(px)}" cy="${F(py)}" r="${F(1.3 * sc)}" fill="${T("#f0c030")}"/>`; }
    return g; };
  let fg = "";
  for (let k = 0; k < 24; k++) { const left = k < 13, x = left ? 20 + r() * 760 : 1900 + r() * 640, top = left ? bankL(x) : bankR(x), y = top + 40 + r() * (700 - top - 40), sc = .7 + (y - 520) / 200 * .9;
    fg += r() < .62 ? goldenrod(x, y, sc) : asters(x, y, sc); }
  s += `<g filter="url(#cbLeafyS)">${fg}</g>`;
  // foreground bushes framing the bottom corners, many clumps each
  [[70, 704, 90], [210, 718, 60], [2480, 702, 100], [2340, 718, 64]].forEach(([x, y, R]) => {
    let b = `<path d="${blobP(x + 6, y + 6, R, R * .6)}" fill="${T("#1e2a12")}"/>`;
    const cl = [];
    for (let i = 0; i < 180 && cl.length < 70; i++) { const px = x + (r() * 2 - 1) * R, py = y + (r() * 2 - 1) * R * .6; if (((px - x) / R) ** 2 + ((py - y) / (R * .6)) ** 2 > 1) continue;
      const lit = ((LX - x) / 1500 * (px - x) / R - (py - y) / (R * .6)) * .5 + .5; cl.push([px, py, Math.max(0, Math.min(.999, lit * .8 + (r() - .5) * .3))]); }
    cl.sort((a, b2) => a[2] - b2[2]);
    const BR = ["#1e2a12", "#2e3e1a", "#44561e", "#5e6e24", "#86782a", "#b0702a", "#d8963a"];
    cl.forEach(([px, py, v]) => b += `<path d="${blobP(px, py, R * .16, R * .12, 6)}" fill="${T(BR[Math.floor(v * BR.length)])}"/>`);
    s += `<g filter="url(#cbLeafyS)">${b}</g>`; });

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#cbLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".12"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#cbPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
