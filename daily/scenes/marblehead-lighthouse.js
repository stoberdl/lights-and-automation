/* A Lake Erie lighthouse on a limestone point on a hot, hazy first of October,
   after Marblehead, Ohio. A white stone tower with a red lantern dome stands on
   the tip of the point; behind it are a keeper's house, a boathouse, a flagpole,
   a big shade tree just beginning to turn and red cedars on the rock. Stepped
   limestone shelves drop to the water. Kelleys Island and a far island with a
   monument sit on the horizon; sailboats are out. In front is a pebble beach
   with driftwood, goldenrod and a sumac already gone red.
   opts.time === "night" draws the same place under a waning gibbous moon: the
   lantern lit and throwing faint beams, lit windows, masthead lights, a moon path.
   One light source either way, upper left of the tower.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
function marbleheadLighthouseArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1410;
  const r = rng(seed), rs = rng(seed + 7);   // land and sky draw from separate streams, so day and night share one layout
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 960, LY = 118, HY = 432;
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
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ridgePath = (fn, close = H, x0 = 0, x1 = W) => { let d = `M${x0},${close} L${x0},${F(fn(x0))}`;
    for (let x = x0; x <= x1; x += 16) d += ` L${x},${F(fn(x))}`; return d + ` L${x1},${F(fn(x1))} L${x1},${close}Z`; };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";

  /* the point: ground top, lawn/rock boundary, and the waterline in front */
  const gw = wave([1, 4, 2], [260, 110, 47], [4, 2, 1]), sw = wave([3, 0, 5], [180, 70, 31], [3, 1.5, .8]);
  const groundTop = x => { const t = clamp((x - 830) / 220, 0, 1); return 516 - (1 - (1 - t) ** 2) * 48 - Math.max(0, x - 1050) * .008 + gw(x); };
  const shoreFront = x => 524 + Math.max(0, x - 830) * .014 + sw(x);
  const shoreTop = x => Math.max(groundTop(x) + 2, shoreFront(x) - 26);
  const fw = wave([2, 5, 1], [330, 140, 60], [8, 4, 2]);
  const fgTop = x => 652 + fw(x) - Math.max(0, 300 - x) * .14 - Math.max(0, x - 2250) * .12;
  const PT0 = 828, PT1 = W;
  let pointPath = `M${PT0},${F(shoreFront(PT0))} L${PT0 + 2},${F(groundTop(PT0))}`;
  for (let x = PT0 + 8; x <= PT1; x += 8) pointPath += ` L${x},${F(groundTop(x))}`;
  pointPath += ` L${PT1},${F(shoreFront(PT1))}`;
  for (let x = PT1; x >= PT0; x -= 8) pointPath += ` L${x},${F(shoreFront(x))}`;
  pointPath += "Z";
  let rockPath = `M${PT0},${F(shoreTop(PT0))}`;
  for (let x = PT0 + 8; x <= PT1; x += 8) rockPath += ` L${x},${F(shoreTop(x))}`;
  for (let x = PT1; x >= PT0; x -= 8) rockPath += ` L${x},${F(shoreFront(x))}`;
  rockPath += "Z";
  let nearWater = `M0,${F(shoreFront(PT0))}`;
  for (let x = PT0; x <= W; x += 8) nearWater += ` L${x},${F(shoreFront(x))}`;
  nearWater += ` L${W},${H} L0,${H}Z`;

  const SKY_H = NIGHT ? "#3e4c78" : "#f2e0b8", HZ = NIGHT ? "#33416a" : "#ece0c0";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#060b20"/><stop offset=".45" stop-color="#0f1a40"/><stop offset=".8" stop-color="#26365f"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#3a7bc4"/><stop offset=".45" stop-color="#8abce4"/><stop offset=".8" stop-color="#dce4da"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#dfe8ff" stop-opacity=".5"/><stop offset=".15" stop-color="#b8c8f0" stop-opacity=".2"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".06"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff6d6" stop-opacity=".9"/><stop offset=".18" stop-color="#ffefc0" stop-opacity=".45"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/>`;
  const g2 = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const TX = 1180;   // tower centre
  let s = `<defs id="mldefs">
    <linearGradient id="mlSky" x1="0" y1="0" x2="0" y2="${HY + 8}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="mlLight" cx="${LX}" cy="${LY}" r="760" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="mlHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    ${g2("mlIsl1", NIGHT ? "#222e56" : "#a9b8c8", NIGHT ? "#28345c" : "#bec6cc")}
    ${g2("mlIsl2", NIGHT ? "#1c2850" : "#8ea2b4", NIGHT ? "#243058" : "#a8b4b4")}
    <linearGradient id="mlLake" x1="0" y1="${HY}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#3a4a78"/><stop offset=".3" stop-color="#22305a"/><stop offset="1" stop-color="#0a1028"/>`
      : `<stop offset="0" stop-color="#c4d6dc"/><stop offset=".12" stop-color="#8fb6c8"/><stop offset=".55" stop-color="#5e92ac"/><stop offset="1" stop-color="#376a84"/>`}</linearGradient>
    <linearGradient id="mlLawn" x1="0" y1="450" x2="0" y2="540" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#a2a64e")}"/><stop offset=".5" stop-color="${T("#86943e")}"/><stop offset="1" stop-color="${T("#6a7a34")}"/></linearGradient>
    <linearGradient id="mlRock" x1="0" y1="490" x2="0" y2="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#d8ccb0")}"/><stop offset="1" stop-color="${T("#8c8270")}"/></linearGradient>
    <linearGradient id="mlBeach" x1="0" y1="620" x2="0" y2="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#cfc09c")}"/><stop offset=".5" stop-color="${T("#ab9c7c")}"/><stop offset="1" stop-color="${T("#7a6c54")}"/></linearGradient>
    <linearGradient id="mlTower" x1="${TX - 38}" y1="0" x2="${TX + 38}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${NIGHT ? "#aab4d4" : "#fffaee"}"/><stop offset=".3" stop-color="${T("#f3eddf")}"/><stop offset=".68" stop-color="${T("#d2cdc2")}"/><stop offset="1" stop-color="${T("#9c98a2")}"/></linearGradient>
    <linearGradient id="mlDome" x1="${TX - 26}" y1="0" x2="${TX + 26}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T("#e2503a")}"/><stop offset=".45" stop-color="${T("#b8302a")}"/><stop offset="1" stop-color="${T("#6a1a16")}"/></linearGradient>
    <linearGradient id="mlGlass" x1="0" y1="186" x2="0" y2="226" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#f6ffe6"/><stop offset="1" stop-color="#d8f4c0"/>`
      : `<stop offset="0" stop-color="#d8eaf0"/><stop offset=".5" stop-color="#8eb0c0"/><stop offset="1" stop-color="#5e8090"/>`}</linearGradient>
    ${g2("mlTrunk", T("#7a5a40"), T("#2e2014"), 1, 0)}
    ${g2("mlDrift", T("#ece4d4"), T("#8a7e6c"))}
    <radialGradient id="mlGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="mlBeacon"><stop offset="0" stop-color="#f4ffe4" stop-opacity=".95"/><stop offset=".25" stop-color="#d8ffc8" stop-opacity=".35"/><stop offset="1" stop-color="#c8ffd0" stop-opacity="0"/></radialGradient>
    <linearGradient id="mlBeamL" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#eaffe0" stop-opacity=".55"/><stop offset="1" stop-color="#eaffe0" stop-opacity="0"/></linearGradient>
    <linearGradient id="mlBeamR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eaffe0" stop-opacity=".45"/><stop offset="1" stop-color="#eaffe0" stop-opacity="0"/></linearGradient>
    <clipPath id="mlNearClip"><path d="${nearWater}"/></clipPath>
    <filter id="mlLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="mlLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="mlCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="32" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="mlRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.2"/></filter>
    <filter id="mlPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="mlSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="mlBlur"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="mlBlur8"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#mlSky)"/>`;

  /* sun, or a waning gibbous moon lit on its left with stars */
  if (NIGHT) {
    for (let i = 0; i < 440; i++) { const x = rs() * W, y = Math.pow(rs(), 1.5) * 420, d = Math.hypot(x - LX, y - LY), big = rs() < .08, o = .2 + rs() * .6 * (1 - y / 470);
      if (d < 170) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 34;
    s += `<rect width="${W}" height="${H}" fill="url(#mlLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 18}" fill="#cfdcff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#eef2fc"/>`;
    [[-12, -10, 9, 7], [6, -14, 8, 6], [-4, 6, 10, 7], [-16, 12, 6, 6]].forEach(([dx, dy, a, b]) => s += `<ellipse cx="${LX + dx}" cy="${LY + dy}" rx="${a}" ry="${b}" fill="#9aa4bc" opacity=".35"/>`);
    s += `<path d="M${LX},${LY - R} A${R},${R} 0 0 1 ${LX},${LY + R} A${R * .5},${R} 0 0 0 ${LX},${LY - R}Z" fill="#26304e" opacity=".88"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#mlLight)"/><circle cx="${LX}" cy="${LY}" r="40" fill="#fffbe8"/>`;
    s += `<g class="rays" opacity=".1" filter="url(#mlSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .45 + k * .32, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: fair-weather cumulus by day, thin moonlit strata by night; lit on the side facing the light */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#mlCloudy)">`;
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
  s += cloud(470, 200, 440, "drift1") + cloud(1930, 140, 520, "drift2") + cloud(2380, 262, 260, "drift3") + cloud(160, 318, 220, "drift2");
  /* gulls over the open lake, wings lit from above */
  if (!NIGHT) {
    s += `<g class="birds">`;
    [[640, 300, 1.1], [690, 286, .8], [742, 318, .95], [800, 296, .7], [560, 336, .75], [858, 330, .6]].forEach(([x, y, k]) => {
      s += `<path d="M${F(x - 14*k)},${F(y - 2*k)} q${F(6*k)},${F(-7*k)} ${F(14*k)},${F(2*k)} q${F(8*k)},${F(-9*k)} ${F(14*k)},${F(-2*k)} q${F(-7*k)},${F(1*k)} ${F(-14*k)},${F(5*k)} q${F(-6*k)},${F(-5*k)} ${F(-14*k)},${F(-5*k)}Z" fill="#f4f2ec" stroke="#5a5a64" stroke-width="${F(1.1*k)}" stroke-linejoin="round"/>`;
      s += `<path d="M${F(x - 14*k)},${F(y - 2*k)} l${F(3*k)},${F(-1.5*k)} M${F(x + 14*k)},${F(y - 2*k)} l${F(-3*k)},${F(-1.5*k)}" stroke="#2a2a30" stroke-width="${F(2*k)}" stroke-linecap="round"/>`;
    });
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ------------------------------------------------------------ far islands */
  // a far, pale island with a tall monument column, then Kelleys Island, nearer and greener
  const isl2 = x => HY - 15 * Math.pow(Math.max(0, Math.sin(Math.PI * (x - 260) / 420)), .6) + Math.sin(x / 40) * .8;
  const isl1 = x => HY - 22 * Math.pow(Math.max(0, Math.sin(Math.PI * (x - 40) / 780)), .55) + Math.sin(x / 55 + 1) * 1.2;
  s += `<path d="${ridgePath(x => x > 260 && x < 680 ? isl2(x) : HY + 1, HY + 2, 240, 700)}" fill="url(#mlIsl1)"/>`;
  const MX = 470, MY = isl2(470);
  s += `<path d="M${MX - 3},${F(MY)} L${MX - 2.2},${F(MY - 26)} L${MX + 2.2},${F(MY - 26)} L${MX + 3},${F(MY)}Z" fill="${NIGHT ? "#2e3a62" : "#b4c0cc"}"/><rect x="${MX - 4}" y="${F(MY - 30)}" width="8" height="4" fill="${NIGHT ? "#2e3a62" : "#b4c0cc"}"/><rect x="${MX - 2}" y="${F(MY - 34)}" width="4" height="4" fill="${NIGHT ? "#344068" : "#c4ccd4"}"/>`;
  s += `<path d="${ridgePath(x => x > 40 && x < 820 ? isl1(x) : HY + 1, HY + 2, 20, 840)}" fill="url(#mlIsl2)"/>`;
  // hundreds of tiny trees along Kelleys' crest, lost in the haze
  const ISL = ["#5e7a4c", "#6a8650", "#7a8e52", "#8a9658", "#9a8a50"];
  s += `<g filter="url(#mlLeafyS)">`;
  for (let x = 60; x < 800; x += 3 + r() * 4) {
    const y = isl1(x) + 2 + r() * 5, sz = 3 + r() * 3, c = mix(T(ISL[Math.floor(r() * ISL.length)]), NIGHT ? "#28345c" : "#b4c0c8", .62);
    s += `<path d="${blobP(x, y, sz, sz * .75, 6)}" fill="${c}"/><path d="${blobP(x - sz * .3, y - sz * .3, sz * .45, sz * .3, 5)}" fill="${mix(c, NIGHT ? "#6a78a8" : "#eef0e4", .3)}"/>`;
  }
  s += `</g>`;
  s += `<rect x="0" y="392" width="${W}" height="56" fill="url(#mlHaze)"/>`;

  /* ------------------------------------------------------------------ lake */
  s += `<rect x="0" y="${HY}" width="${W}" height="${H - HY}" fill="url(#mlLake)"/>`;
  s += `<rect x="0" y="${HY}" width="${W}" height="3" fill="${NIGHT ? "#5a6a98" : "#eef2ec"}" opacity=".5"/>`;
  // wind streaks and ripple dashes, longer and stronger toward the viewer
  for (let k = 0; k < 560; k++) {
    const y = HY + 3 + Math.pow(r(), 1.5) * (H - HY - 3), d = (y - HY) / (H - HY), x = r() * W, L = 12 + d * 120 * r();
    const lt = r() < .6;
    s += `<rect x="${F(x)}" y="${F(y)}" width="${F(L)}" height="${F(.8 + d * 2)}" rx="1" fill="${lt ? (NIGHT ? "#7a8cc0" : "#eaf6fa") : (NIGHT ? "#08102a" : "#2e5a72")}" opacity="${F((lt ? .12 : .1) + r() * .2)}"/>`;
  }
  // glitter under the sun or the moon
  for (let k = 0; k < 170; k++) {
    const y = HY + 2 + Math.pow(r(), 1.4) * 250, d = (y - HY) / 250, x = LX + (r() - .5) * (30 + d * 260) * (r() < .3 ? 1.6 : 1), L = 4 + d * 22 * r() + 3;
    s += `<rect x="${F(x - L / 2)}" y="${F(y)}" width="${F(L)}" height="${F(1 + d * 1.5)}" rx="1" fill="${NIGHT ? "#e4ecff" : "#fffae0"}" opacity="${F(.45 + r() * .5)}"/>`;
  }

  /* sailboats: lit jibs, shaded mains, a reflection below each */
  const boat = (x, y, k, flip) => {
    const f = flip ? -1 : 1;
    let b = `<g>`;
    b += `<g filter="url(#mlBlur)" opacity=".5"><rect x="${F(x - 18 * k)}" y="${F(y + 4 * k)}" width="${F(36 * k)}" height="${F(3 * k)}" fill="${NIGHT ? "#a8b4d8" : "#f4f2ea"}"/><rect x="${F(x - 2 * k)}" y="${F(y + 6 * k)}" width="${F(14 * k)}" height="${F(30 * k)}" fill="${NIGHT ? "#6a78a8" : "#f4f2ea"}" opacity=".5"/></g>`;
    b += `<path d="M${F(x - 22 * k)},${F(y - 3 * k)} L${F(x + 24 * k)},${F(y - 3 * k)} Q${F(x + 18 * k)},${F(y + 5 * k)} ${F(x + 8 * k)},${F(y + 5 * k)} L${F(x - 16 * k)},${F(y + 5 * k)}Z" fill="${T("#f2efe6")}"/>`;
    b += `<path d="M${F(x - 20 * k)},${F(y + 1 * k)} L${F(x + 20 * k)},${F(y + 1 * k)}" stroke="${T("#2a3a5a")}" stroke-width="${F(1.6 * k)}"/>`;
    b += `<path d="M${F(x)},${F(y - 3 * k)} L${F(x)},${F(y - 62 * k)}" stroke="${T("#5a5a60")}" stroke-width="${F(1.4 * k)}"/>`;
    b += `<path d="M${F(x + 1.5 * k * f)},${F(y - 60 * k)} Q${F(x + 14 * k * f)},${F(y - 32 * k)} ${F(x + 21 * k * f)},${F(y - 7 * k)} L${F(x + 1.5 * k * f)},${F(y - 7 * k)}Z" fill="${T("#d4d2cc")}"/>`;
    b += `<path d="M${F(x + 1.5 * k * f)},${F(y - 60 * k)} Q${F(x + 6 * k * f)},${F(y - 34 * k)} ${F(x + 8 * k * f)},${F(y - 7 * k)} L${F(x + 1.5 * k * f)},${F(y - 7 * k)}Z" fill="${T("#bab8b4")}" opacity=".6"/>`;
    b += `<path d="M${F(x - 2 * k * f)},${F(y - 54 * k)} Q${F(x - 12 * k * f)},${F(y - 28 * k)} ${F(x - 20 * k * f)},${F(y - 6 * k)} L${F(x - 2 * k * f)},${F(y - 6 * k)}Z" fill="${NIGHT ? T("#ffffff") : "#fffcf2"}"/>`;
    if (NIGHT) b += `<circle cx="${F(x)}" cy="${F(y - 63 * k)}" r="${F(6 * k)}" fill="url(#mlGlow)"/><circle cx="${F(x)}" cy="${F(y - 63 * k)}" r="${F(1.4 * k)}" fill="#fff4d0"/>`;
    return b + `</g>`;
  };
  s += boat(312, 470, .62, false) + boat(560, 458, .45, true) + boat(742, 448, .34, false) + boat(150, 492, .8, true);

  /* --------------------------------------------------------------- the point */
  // everything standing on the point is gathered into one string so the near water can reflect it
  let pt = "";
  pt += `<path d="${pointPath}" fill="url(#mlLawn)"/>`;
  // far tree band on the point: hundreds of small trees, mostly still green with the first yellows
  const GRN = ["#3f6a2e", "#4a7834", "#57843a", "#638e3e", "#6e9644", "#7c9a46", "#93a04a", "#b8a848", "#cc8a36", "#a8502c"];
  const pick = () => { const v = r(); return v < .78 ? GRN[Math.floor(r() * 7)] : GRN[7 + Math.floor(r() * 3)]; };
  const forest = (x0, x1, rows, size, haze, back) => {
    const trees = [];
    for (let row = 0; row < rows; row++) for (let x = x0; x < x1; x += size * (.75 + r() * .45)) {
      const ramp = clamp((x - x0) / 180, .35, 1);
      const y = groundTop(x) + (back ? -2 : 4) + row * size * .55 + r() * size * .25, sz = size * ramp * (.75 + r() * .45);
      trees.push([x + r() * size * .4, y, sz]);
    }
    trees.sort((a, b) => a[1] - b[1]);
    let f = "";
    trees.forEach(([x, y, sz]) => {
      const c = mix(T(pick()), NIGHT ? "#26325a" : HZ, haze), dk = mix(c, NIGHT ? "#050a1c" : "#1a2410", .38), lt = mix(c, NIGHT ? "#8a9cc8" : "#fff3c8", .32);
      if (r() < .16) {   // a red cedar: a narrow, ragged column of tufts, lit on the left
        const h = sz * 2.6;
        for (let j = 0; j < 7; j++) { const t = j / 6, yy = y - t * h, ww = sz * .5 * (1 - t * .75) * (.8 + r() * .4);
          f += `<path d="${blobP(x + ww * .2, yy, ww, sz * .32, 6)}" fill="${mix(dk, "#0c1a10", .2)}"/><path d="${blobP(x - ww * .3, yy - sz * .08, ww * .55, sz * .22, 5)}" fill="${mix(c, "#2e4a26", .3)}"/>`; }
        return;
      }
      f += `<path d="${blobP(x + sz * .12, y + sz * .1, sz * .95, sz * .8, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz * .08, sz * .85, sz * .72, 7)}" fill="${c}"/><path d="${blobP(x - sz * .25, y - sz * .35, sz * .42, sz * .3, 6)}" fill="${lt}"/>`;
    });
    return f;
  };
  pt += `<g filter="url(#mlLeafyS)">${forest(1290, W + 20, 2, 15, .32, true)}</g>`;
  pt += `<g filter="url(#mlLeafyS)">${forest(1340, W + 20, 2, 21, .1, false)}</g>`;
  // lawn texture: mown stripes and grass strokes
  for (let k = 0; k < 520; k++) {
    const x = PT0 + 20 + r() * (W - PT0 - 20), top = groundTop(x) + 3, bot = shoreTop(x) - 1;
    if (bot - top < 3) continue;
    const y = top + r() * (bot - top), h = 3 + r() * 5;
    pt += `<path d="M${F(x)},${F(y)} q${F(-1 + r() * 2)},${F(-h * .6)} ${F(-2 + r() * 4)},${F(-h)}" stroke="${T(r() < .5 ? "#c4c066" : "#5e6e2c")}" stroke-width="1.4" fill="none" opacity=".6"/>`;
  }

  /* limestone shelves: stepped slabs, lit tops, shaded right ends and undersides */
  pt += `<path d="${rockPath}" fill="url(#mlRock)"/>`;
  for (let j = 0; j < 3; j++) {
    for (let x = PT0 + r() * 20; x < W; ) {
      const w = 26 + r() * 80, xc = x + w / 2, top = shoreTop(xc), bot = shoreFront(xc), hh = (bot - top) / 3;
      if (hh < 2) { x += w; continue; }
      const y0 = top + j * hh + (r() - .5) * 2, y1 = y0 + hh + 1, ov = j * 1.5 + r() * 3;
      const face = T(mix("#d6cab0", "#8a806c", j * .22 + r() * .18));
      pt += `<path d="M${F(x + ov)},${F(y0)} L${F(x + w - 2)},${F(y0 + (r() - .5) * 2)} L${F(x + w - 2 - r() * 4)},${F(y1)} L${F(x + ov - 2)},${F(y1)}Z" fill="${face}"/>`;
      pt += `<path d="M${F(x + ov)},${F(y0)} L${F(x + w - 2)},${F(y0)}" stroke="${NIGHT ? "#8090b8" : "#f6eedc"}" stroke-width="1.8" opacity=".85"/>`;
      pt += `<path d="M${F(x + w - 2)},${F(y0)} L${F(x + w - 2 - 3)},${F(y1)}" stroke="${T("#5a5244")}" stroke-width="2.4" opacity=".55"/>`;
      pt += `<rect x="${F(x + ov)}" y="${F(y1 - 2)}" width="${F(w - ov - 2)}" height="2" fill="#000" opacity=".22"/>`;
      if (r() < .4) pt += `<path d="M${F(x + ov + r() * w * .6)},${F(y0 + 2)} l${F(2 + r() * 4)},${F(hh * .6)}" stroke="${T("#7a705e")}" stroke-width="1" opacity=".5"/>`;
      x += w;
    }
  }
  // boulders at the waterline
  for (let k = 0; k < 46; k++) {
    const x = PT0 + 10 + r() * (W - PT0), y = shoreFront(x) - 1 + r() * 3, R = 4 + r() * 9;
    pt += `<path d="${blobP(x, y, R * 1.3, R * .7, 6)}" fill="${T("#7a7262")}"/><path d="${blobP(x - R * .3, y - R * .25, R * .7, R * .35, 5)}" fill="${T("#c8bea6")}"/>`;
  }
  // wet dark band and a thin wash of foam along the waterline
  let wl = `M${PT0},${F(shoreFront(PT0))}`; for (let x = PT0 + 8; x <= W; x += 8) wl += ` L${x},${F(shoreFront(x))}`;
  pt += `<path d="${wl}" stroke="#000" stroke-width="5" fill="none" opacity=".2"/><path d="${wl}" stroke="${NIGHT ? "#8a9cc8" : "#f4fbff"}" stroke-width="1.6" fill="none" opacity=".7" stroke-dasharray="18 7 6 9"/>`;

  // small red cedars clinging to the rock near the tip
  const cedar = (x, base, h) => {
    let c = `<path d="M${F(x - 2)},${base} L${F(x - 1)},${F(base - h * .25)} L${F(x + 1.5)},${F(base - h * .25)} L${F(x + 2.5)},${base}Z" fill="${T("#5a3a26")}"/><g filter="url(#mlLeafyS)">`;
    for (let j = 0; j < 22; j++) {
      const t = j / 21, yy = base - h * .14 - t * h * .86, ww = h * .2 * Math.sin(Math.PI * (.18 + t * .82)) * (.7 + r() * .5) + 2;
      c += `<path d="${blobP(x + ww * .25, yy, ww, h * .06 + 1, 6)}" fill="${T("#1e3420")}"/><path d="${blobP(x - ww * .1, yy - 1, ww * .7, h * .045 + 1, 6)}" fill="${T("#35562c")}"/><path d="${blobP(x - ww * .45, yy - 1.5, ww * .35, h * .03 + .8, 5)}" fill="${T("#6a8a40")}"/>`;
    }
    return c + `</g>`;
  };
  pt += cedar(896, groundTop(896) + 6, 48) + cedar(938, groundTop(938) + 6, 64) + cedar(1316, groundTop(1316) + 10, 84) + cedar(1990, groundTop(1990) + 12, 96);

  /* the keeper's house, boathouse, flagpole and fence */
  const HXc = 1440, HB = 504;
  {
    const wall = T("#f4eee0"), wallSh = T("#cfc8ba"), roof = T("#8e3a2a"), roofLt = T("#b8523a");
    pt += `<ellipse cx="${HXc + 40}" cy="${HB + 3}" rx="90" ry="6" fill="#000" opacity=".18"/>`;
    // side wing to the right, in shade
    pt += `<rect x="${HXc + 48}" y="${HB - 38}" width="44" height="38" fill="${wallSh}"/><path d="M${HXc + 44},${HB - 36} L${HXc + 70},${HB - 58} L${HXc + 96},${HB - 36}Z" fill="${T("#6e2a20")}"/>`;
    pt += `<rect x="${HXc + 58}" y="${HB - 28}" width="10" height="14" fill="${NIGHT ? "#ffcf78" : T("#4a6070")}"/><rect x="${HXc + 74}" y="${HB - 28}" width="10" height="14" fill="${NIGHT ? "#f0b860" : T("#4a6070")}"/>`;
    // main block: two storeys, side-gabled
    pt += `<rect x="${HXc - 50}" y="${HB - 60}" width="100" height="60" fill="${wall}"/>`;
    for (let y = HB - 56; y < HB; y += 5) pt += `<path d="M${HXc - 50},${y} L${HXc + 50},${y}" stroke="${T("#b8b0a0")}" stroke-width="1" opacity=".45"/>`;
    pt += `<rect x="${HXc + 18}" y="${HB - 60}" width="32" height="60" fill="#000" opacity=".1"/>`;
    pt += `<path d="M${HXc - 58},${HB - 58} L${HXc - 42},${HB - 92} L${HXc + 42},${HB - 92} L${HXc + 58},${HB - 58}Z" fill="${roof}"/><path d="M${HXc - 58},${HB - 58} L${HXc - 42},${HB - 92} L${HXc - 8},${HB - 92} L${HXc - 14},${HB - 58}Z" fill="${roofLt}" opacity=".7"/>`;
    for (let k = 1; k < 6; k++) { const y = HB - 92 + k * 6.8; pt += `<path d="M${F(HXc - 42 - k * 3.2)},${F(y)} L${F(HXc + 42 + k * 3.2)},${F(y)}" stroke="${T("#5a2018")}" stroke-width="1" opacity=".4"/>`; }
    pt += `<path d="M${HXc - 42},${HB - 92} L${HXc + 42},${HB - 92}" stroke="${RIM}" stroke-width="1.6" opacity=".7"/>`;
    pt += `<rect x="${HXc + 18}" y="${HB - 106}" width="10" height="18" fill="${T("#8a4a36")}"/><rect x="${HXc + 16}" y="${HB - 108}" width="14" height="3" fill="${T("#5a3024")}"/>`;
    // windows with shutters, porch and door
    const win = (x, y, lit) => `<rect x="${x - 9}" y="${y}" width="5" height="15" fill="${T("#2e4a3a")}"/><rect x="${x + 4}" y="${y}" width="5" height="15" fill="${T("#2e4a3a")}"/>` +
      `<rect x="${x - 4}" y="${y}" width="8" height="15" fill="${NIGHT ? (lit ? "#ffd88a" : "#1a2238") : "#5a7a8e"}"/><path d="M${x},${y} L${x},${y + 15} M${x - 4},${y + 7.5} L${x + 4},${y + 7.5}" stroke="${T("#f4eee0")}" stroke-width="1"/>` +
      (NIGHT && lit ? `<circle cx="${x}" cy="${y + 8}" r="22" fill="url(#mlGlow)" opacity=".7"/>` : `<rect x="${x - 4}" y="${y}" width="3" height="15" fill="#fff" opacity=".25"/>`);
    [[-32, 0], [-10, 1], [12, 1], [34, 0]].forEach(([dx, lit]) => pt += win(HXc + dx, HB - 54, lit));
    [[-32, 1], [34, 1]].forEach(([dx, lit]) => pt += win(HXc + dx, HB - 26, lit));
    pt += `<path d="M${HXc - 22},${HB - 30} L${HXc + 22},${HB - 30} L${HXc + 26},${HB - 24} L${HXc - 26},${HB - 24}Z" fill="${roof}"/>`;
    pt += `<rect x="${HXc - 20}" y="${HB - 24}" width="2.5" height="24" fill="${wall}"/><rect x="${HXc + 17.5}" y="${HB - 24}" width="2.5" height="24" fill="${wall}"/>`;
    pt += `<rect x="${HXc - 6}" y="${HB - 22}" width="12" height="22" fill="${T("#3e5a48")}"/>`;
    pt += `<path d="M${HXc - 20},${HB - 10} L${HXc + 20},${HB - 10}" stroke="${wall}" stroke-width="1.5"/>`;
    // boathouse
    const bx = 1580, bb = shoreTop(1580) - 1;
    pt += `<rect x="${bx - 26}" y="${F(bb - 30)}" width="52" height="30" fill="${T("#a83a2c")}"/><rect x="${bx + 6}" y="${F(bb - 30)}" width="20" height="30" fill="#000" opacity=".18"/>`;
    pt += `<path d="M${bx - 30},${F(bb - 30)} L${bx},${F(bb - 50)} L${bx + 30},${F(bb - 30)}Z" fill="${T("#5a5a62")}"/><path d="M${bx - 30},${F(bb - 30)} L${bx},${F(bb - 50)} L${bx},${F(bb - 30)}Z" fill="${RIM}" opacity=".18"/>`;
    pt += `<rect x="${bx - 12}" y="${F(bb - 22)}" width="24" height="22" fill="${T("#f0e8d8")}"/><rect x="${bx - 10}" y="${F(bb - 20)}" width="20" height="20" fill="${T("#6a2a22")}"/><path d="M${bx - 10},${F(bb - 20)} L${bx + 10},${F(bb)} M${bx + 10},${F(bb - 20)} L${bx - 10},${F(bb)}" stroke="${T("#f0e8d8")}" stroke-width="1.5"/>`;
    // flagpole
    const fx = 1352, fb = groundTop(1352) + 30;
    pt += `<path d="M${fx},${F(fb)} L${fx},${F(fb - 96)}" stroke="${T("#e8e4dc")}" stroke-width="2.2"/><circle cx="${fx}" cy="${F(fb - 97)}" r="2.2" fill="${T("#d4b24a")}"/>`;
    const fy = fb - 94;
    for (let k = 0; k < 7; k++) pt += `<path d="M${fx + 1},${F(fy + k * 2)} q6,-1.5 11,0 q6,1.5 11,0" stroke="${T(k % 2 ? "#f4f0e8" : "#b8322c")}" stroke-width="2" fill="none"/>`;
    pt += `<rect x="${fx + 1}" y="${F(fy - 1)}" width="10" height="7" fill="${T("#2a3a6a")}"/>`;
    // white picket fence along the lawn
    for (let x = 1236; x < 1388; x += 7) { const y = Math.min(groundTop(x) + 36, shoreTop(x) - 2);
      pt += `<path d="M${x},${F(y)} L${x},${F(y - 12)} L${x + 1.5},${F(y - 14)} L${x + 3},${F(y - 12)} L${x + 3},${F(y)}Z" fill="${T("#f2eee4")}"/>`; }
    pt += `<path d="M1236,${F(Math.min(groundTop(1236) + 36, shoreTop(1236) - 2) - 9)} L1390,${F(Math.min(groundTop(1390) + 36, shoreTop(1390) - 2) - 9)}" stroke="${T("#e4dfd2")}" stroke-width="1.5"/>`;
    // gravel path from the tower to the house
    pt += `<path d="M${TX + 4},500 C1250,499 1340,497 ${HXc},${HB - 1}" stroke="${T("#d8ccb0")}" stroke-width="5" fill="none" opacity=".9"/><path d="M${TX + 4},500 C1250,499 1340,497 ${HXc},${HB - 1}" stroke="${T("#b0a488")}" stroke-width="1.2" fill="none" opacity=".6" transform="translate(0,2.5)"/>`;
  }

  /* the big shade tree right of the house: clump-built crown, still mostly green, the first yellows on its sunlit top */
  {
    const tx = 1718, ty = groundTop(1718) + 30;
    pt += `<ellipse cx="${tx + 50}" cy="${ty + 3}" rx="150" ry="10" fill="#000" opacity=".2"/>`;
    pt += `<path d="M${tx - 16},${ty} C${tx - 10},${ty - 50} ${tx - 18},${ty - 90} ${tx - 8},${ty - 120} L${tx + 10},${ty - 120} C${tx + 14},${ty - 90} ${tx + 14},${ty - 50} ${tx + 22},${ty}Z" fill="url(#mlTrunk)"/>`;
    [[-1, 90, 90, 70], [1, 96, 100, 66], [-1, 115, 60, 90], [1, 118, 66, 92]].forEach(([dir, at, dx, dy]) =>
      pt += `<path d="M${tx},${ty - at} Q${tx + dir * dx * .4},${ty - at - dy * .6} ${tx + dir * dx},${ty - at - dy}" stroke="${T("#3a2818")}" stroke-width="8" fill="none" stroke-linecap="round"/>`);
    const cy0 = ty - 150;   // crown top stays below y 262, out of the headline corner
    const crown = [[tx, cy0, 120, 66], [tx - 82, cy0 + 26, 76, 50], [tx + 86, cy0 + 22, 80, 52], [tx, cy0 + 40, 116, 48], [tx - 26, cy0 - 40, 76, 34], [tx + 40, cy0 - 34, 72, 36]];
    const inCrown = (x, y) => crown.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
    const RAMP = ["#1c3014", "#26401a", "#32521e", "#406426", "#52782e", "#6a8c36", "#8ea442", "#c6c058"];
    const AUTUMN = ["#d8a038", "#e2b444", "#c8742e"];
    const leaves = [];
    for (let i = 0; i < 1800 && leaves.length < 720; i++) {
      const x = tx - 210 + r() * 420, y = cy0 - 80 + r() * 180;
      if (!inCrown(x, y)) continue;
      const nx = (x - tx) / 180, ny = (y - cy0) / 95;
      const lit = (-nx * .55 - ny * .8) * .5 + .5, edge = Math.min(1, Math.hypot(nx, ny));
      const v = Math.max(0, Math.min(.999, lit * .75 + edge * .15 + (r() - .5) * .3));
      const au = v > .55 && r() < .12;
      leaves.push([x, y, v, 7 + r() * 7, au]);
    }
    leaves.sort((a, b) => a[2] - b[2]);
    pt += `<g class="crown" filter="url(#mlLeafy)">`;
    leaves.forEach(([x, y, v, R, au]) => pt += `<path d="${blobP(x, y, R, R * .8, 6)}" fill="${T(au ? AUTUMN[Math.floor(r() * 3)] : RAMP[Math.floor(v * RAMP.length)])}"/>`);
    pt += `</g>`;
  }

  /* the lighthouse: tapering limestone tower, gallery, lantern, red dome; lit from the upper left */
  {
    const B = 506, Tp = 234, bw = 38, tw = 25;
    pt += `<path d="M${TX + 8},${B + 2} L${TX + 40},${B - 2} L${TX + 150},${B - 10} L${TX + 140},${B + 2}Z" fill="#000" opacity=".16" filter="url(#mlBlur)"/>`;
    pt += `<rect x="${TX - 48}" y="${B - 6}" width="96" height="12" fill="${T("#b6ae9c")}"/><rect x="${TX - 48}" y="${B - 6}" width="96" height="2.5" fill="${RIM}" opacity=".6"/><rect x="${TX + 18}" y="${B - 6}" width="30" height="12" fill="#000" opacity=".15"/>`;
    pt += `<path d="M${TX - bw},${B - 6} L${TX - tw},${Tp} L${TX + tw},${Tp} L${TX + bw},${B - 6}Z" fill="url(#mlTower)"/>`;
    for (let y = Tp + 12; y < B - 8; y += 13) { const t = (y - Tp) / (B - Tp), hw = tw + (bw - tw) * t;
      pt += `<path d="M${F(TX - hw)},${y} Q${TX},${F(y + 2.5)} ${F(TX + hw)},${y}" stroke="${T("#8a8478")}" stroke-width="1" fill="none" opacity=".18"/>`; }
    pt += `<path d="M${TX - bw},${B - 6} L${TX - tw},${Tp}" stroke="${RIM}" stroke-width="2" opacity=".7"/>`;
    // windows climbing the stair
    [[-4, 300], [6, 372], [-6, 440]].forEach(([dx, y]) => {
      pt += `<rect x="${TX + dx - 4}" y="${y}" width="8" height="15" rx="3" fill="${NIGHT ? "#1a2034" : T("#3a4450")}"/><rect x="${TX + dx - 5}" y="${y + 15}" width="10" height="2" fill="${RIM}" opacity=".7"/>`; });
    pt += `<path d="M${TX - 9},${B - 6} L${TX - 9},${B - 30} Q${TX},${B - 38} ${TX + 9},${B - 30} L${TX + 9},${B - 6}Z" fill="${T("#5a3a28")}"/><path d="M${TX - 11},${B - 30} Q${TX},${B - 41} ${TX + 11},${B - 30}" stroke="${T("#efe8da")}" stroke-width="2.5" fill="none"/>`;
    // gallery with corbels and rail
    for (let k = -4; k <= 4; k++) pt += `<path d="M${TX + k * 7 - 3},${Tp} L${TX + k * 7 + 3},${Tp} L${TX + k * 6},${Tp + 7}Z" fill="${T("#3a3a42")}"/>`;
    pt += `<rect x="${TX - 38}" y="${Tp - 7}" width="76" height="8" fill="${T("#2e2e36")}"/><rect x="${TX - 38}" y="${Tp - 7}" width="76" height="2" fill="${RIM}" opacity=".5"/>`;
    for (let x = TX - 36; x <= TX + 36; x += 6) pt += `<path d="M${x},${Tp - 7} L${x},${Tp - 24}" stroke="${T("#2a2a32")}" stroke-width="1.3"/>`;
    pt += `<path d="M${TX - 37},${Tp - 24} L${TX + 37},${Tp - 24} M${TX - 37},${Tp - 15} L${TX + 37},${Tp - 15}" stroke="${T("#2a2a32")}" stroke-width="2"/>`;
    // lantern room
    pt += `<rect x="${TX - 22}" y="${Tp - 48}" width="44" height="41" fill="${T("#26262e")}"/><rect x="${TX - 20}" y="${Tp - 45}" width="40" height="36" fill="url(#mlGlass)"/>`;
    [-7, 7].forEach(dx => pt += `<path d="M${TX + dx},${Tp - 46} L${TX + dx},${Tp - 9}" stroke="${T("#26262e")}" stroke-width="2.4"/>`);
    pt += `<path d="M${TX - 20},${Tp - 27} L${TX + 20},${Tp - 27}" stroke="${T("#26262e")}" stroke-width="1.4"/>`;
    if (!NIGHT) pt += `<path d="M${TX - 18},${Tp - 44} L${TX - 12},${Tp - 44} L${TX - 16},${Tp - 11} L${TX - 19},${Tp - 11}Z" fill="#fff" opacity=".45"/><ellipse cx="${TX + 1}" cy="${Tp - 26}" rx="5" ry="9" fill="#c8e4b4" opacity=".6"/>`;
    else pt += `<ellipse cx="${TX}" cy="${Tp - 27}" rx="9" ry="13" fill="#ffffff"/>`;
    // dome, vent ball and rod
    pt += `<path d="M${TX - 27},${Tp - 46} Q${TX - 24},${Tp - 72} ${TX},${Tp - 74} Q${TX + 24},${Tp - 72} ${TX + 27},${Tp - 46}Z" fill="url(#mlDome)"/>`;
    pt += `<path d="M${TX - 27},${Tp - 46} Q${TX - 24},${Tp - 72} ${TX},${Tp - 74}" stroke="${RIM}" stroke-width="1.6" fill="none" opacity=".55"/>`;
    for (let k = -2; k <= 2; k++) pt += `<path d="M${TX + k * 10},${Tp - 46} Q${TX + k * 7},${Tp - 66} ${TX},${Tp - 74}" stroke="${T("#5a1410")}" stroke-width="1" fill="none" opacity=".4"/>`;
    pt += `<rect x="${TX - 29}" y="${Tp - 48}" width="58" height="3" fill="${T("#2e2e36")}"/>`;
    pt += `<circle cx="${TX}" cy="${Tp - 79}" r="5.5" fill="${T("#2e2e36")}"/><circle cx="${TX - 1.8}" cy="${Tp - 81}" r="1.8" fill="${RIM}" opacity=".6"/><path d="M${TX},${Tp - 84} L${TX},${Tp - 98}" stroke="${T("#2e2e36")}" stroke-width="1.6"/>`;
  }
  s += pt;

  /* near water in front of the point: the point, tower and house reflected and rippled */
  {
    const wy = shoreFront(TX) + 1;
    s += `<g clip-path="url(#mlNearClip)"><g filter="url(#mlRipple)" opacity="${NIGHT ? .4 : .42}"><g transform="translate(0,${F(2 * wy)}) scale(1,-1)">${pt}</g></g>`;
    s += `<rect x="0" y="${F(wy)}" width="${W}" height="${F(H - wy)}" fill="${NIGHT ? "#16204a" : "#5e92ac"}" opacity=".35"/>`;
    for (let k = 0; k < 160; k++) { const x = PT0 - 40 + r() * (W - PT0 + 40), y = shoreFront(Math.max(PT0, x)) + 6 + r() * 110, L = 20 + r() * 90;
      s += `<rect x="${F(x)}" y="${F(y)}" width="${F(L)}" height="1.6" rx="1" fill="${NIGHT ? "#8090c4" : "#eaf6fa"}" opacity="${F(.1 + r() * .22)}"/>`; }
    s += `</g>`;
  }

  /* night: the lantern lit, a faint beam each way, a soft halo */
  if (NIGHT) {
    const by = 234 - 27;
    s += `<g filter="url(#mlBlur8)"><path d="M${TX - 14},${by - 10} L${TX - 1100},${by - 20} L${TX - 1100},${by + 160} L${TX - 14},${by + 10}Z" fill="url(#mlBeamL)" opacity=".5"/>` +
         `<path d="M${TX + 14},${by - 8} L${TX + 560},${by - 70} L${TX + 560},${by + 50} L${TX + 14},${by + 8}Z" fill="url(#mlBeamR)" opacity=".35"/></g>`;
    s += `<circle cx="${TX}" cy="${by}" r="70" fill="url(#mlBeacon)"/><circle cx="${TX}" cy="${by}" r="230" fill="url(#mlBeacon)" opacity=".25"/>`;
    s += `<g filter="url(#mlRipple)"><rect x="${TX - 6}" y="${F(shoreFront(TX) + 30)}" width="12" height="110" fill="#e8ffd8" opacity=".25"/></g>`;
  }

  /* --------------------------------------------------------- near beach */
  s += `<path d="${ridgePath(fgTop)}" fill="url(#mlBeach)"/>`;
  let fl = `M0,${F(fgTop(0))}`; for (let x = 16; x <= W; x += 16) fl += ` L${x},${F(fgTop(x))}`;
  s += `<path d="${fl}" stroke="${NIGHT ? "#8a9cc8" : "#fbfdff"}" stroke-width="2.5" fill="none" opacity=".6" stroke-dasharray="40 12 16 20"/><path d="${fl}" stroke="#000" stroke-width="6" fill="none" opacity=".1" transform="translate(0,5)"/>`;
  // pebbles, more and larger toward the viewer
  const PEB = ["#a89a80", "#8a8070", "#c4b8a0", "#77706a", "#b4a690", "#9a8e7a", "#d2c8b4"];
  for (let k = 0; k < 900; k++) {
    const x = r() * W, top = fgTop(x) + 4, t = Math.pow(r(), .8), y = top + t * (H - top), R = 1.5 + t * 6 * (.5 + r());
    const c = T(PEB[Math.floor(r() * PEB.length)]);
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(R * 1.4)}" ry="${F(R * .8)}" fill="${mix(c, "#2a241c", .3)}"/><ellipse cx="${F(x - R * .2)}" cy="${F(y - R * .2)}" rx="${F(R * 1.1)}" ry="${F(R * .55)}" fill="${c}"/>`;
    if (R > 4) s += `<ellipse cx="${F(x - R * .5)}" cy="${F(y - R * .4)}" rx="${F(R * .45)}" ry="${F(R * .2)}" fill="${NIGHT ? "#8a9cc8" : "#fff8e8"}" opacity=".5"/>`;
  }
  // driftwood log
  {
    const x0 = 360, y0 = fgTop(360) + 22, x1 = 600, y1 = fgTop(600) + 34;
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - 8;
    s += `<path d="M${x0},${F(y0 + 12)} Q${mx},${F(my + 12)} ${x1},${F(y1 + 12)}" stroke="#000" stroke-width="18" fill="none" opacity=".2" filter="url(#mlBlur)"/>`;
    s += `<path d="M${x0},${F(y0)} Q${mx},${F(my)} ${x1},${F(y1)}" stroke="${T("#6e6252")}" stroke-width="24" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${x0},${F(y0 - 3)} Q${mx},${F(my - 3)} ${x1},${F(y1 - 3)}" stroke="${T("#b4a892")}" stroke-width="15" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${x0 + 4},${F(y0 - 8)} Q${mx},${F(my - 8)} ${x1 - 4},${F(y1 - 8)}" stroke="${NIGHT ? "#9aaad0" : "#f4ecdc"}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;
    for (let k = 0; k < 9; k++) { const t = .08 + k * .1; s += `<path d="M${F(x0 + (x1 - x0) * t)},${F(y0 + (y1 - y0) * t - 3)} l${F(18 + r() * 14)},${F(1 + r())}" stroke="${T("#9a8e7a")}" stroke-width="1" opacity=".6"/>`; }
    s += `<path d="M${x0 + 80},${F(y0 + 2)} l-24,-30 l-6,2" stroke="${T("#ddd4c2")}" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="${x1}" cy="${F(y1)}" rx="5" ry="8" fill="${T("#b8ac94")}"/><ellipse cx="${x1}" cy="${F(y1)}" rx="3" ry="5" fill="${T("#8a7e6a")}"/>`;
  }
  // dune grass along the top of the beach
  for (let x = 0; x < W; x += 3 + r() * 7) {
    if (x > 300 && x < 2200 && r() < .65) continue;
    const y = fgTop(x) + 6 + r() * 30, h = 10 + r() * 26;
    s += `<path d="M${F(x)},${F(y)} q${F(-2 + r() * 4)},${F(-h * .6)} ${F(-6 + r() * 12)},${F(-h)}" stroke="${T(r() < .5 ? "#c8b868" : "#7a7a38")}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>`;
  }
  // goldenrod plumes on the left, and a sumac already turned red on the right
  const goldenrod = (x, y, h) => {
    let g = `<path d="M${x},${y} q2,${-h * .5} ${4},${-h}" stroke="${T("#5a6a2a")}" stroke-width="2" fill="none"/>`;
    for (let k = 0; k < 14; k++) { const t = .55 + k / 14 * .45, px = x + 4 * t + (k % 2 ? 4 : -4) * (1 - t) * 3, py = y - h * t;
      g += `<ellipse cx="${F(px)}" cy="${F(py)}" rx="${F(3.5 + r() * 2)}" ry="${F(2.2 + r())}" fill="${T(r() < .5 ? "#e8c030" : "#c89a20")}"/><ellipse cx="${F(px - 1)}" cy="${F(py - 1)}" rx="1.8" ry="1.2" fill="${T("#fbe070")}"/>`; }
    return g;
  };
  s += `<g filter="url(#mlLeafyS)">`;
  [[40, 700, 90], [76, 712, 70], [118, 700, 84], [160, 716, 64], [210, 706, 56], [2236, 712, 60]].forEach(([x, y, h]) => s += goldenrod(x, y, h));
  s += `</g>`;
  const bush = (bx, by, rx, ry, ramp, n) => {
    const out = [];
    for (let i = 0; i < n * 3 && out.length < n; i++) {
      const x = bx - rx + r() * rx * 2, y = by - ry + r() * ry * 2;
      if (((x - bx) / rx) ** 2 + ((y - by) / ry) ** 2 > 1) continue;
      const nx = (x - bx) / rx, ny = (y - by) / ry, v = clamp(((-nx * .55 - ny * .8) * .5 + .5) * .8 + (r() - .5) * .3, 0, .999);
      out.push([x, y, v, 6 + r() * 7]);
    }
    out.sort((a, b) => a[2] - b[2]);
    return `<g filter="url(#mlLeafy)">` + out.map(([x, y, v, R]) => `<path d="${blobP(x, y, R, R * .75, 6)}" fill="${T(ramp[Math.floor(v * ramp.length)])}"/>`).join("") + `</g>`;
  };
  const SUMAC = ["#3a0e0a", "#5e1610", "#821e14", "#a42a18", "#c23a1c", "#d8562a", "#e87a36", "#f2a04a"];
  const SCRUB = ["#1c2a12", "#2a3c18", "#3a5020", "#4e6628", "#647a30", "#82923a", "#a8a646", "#c8b85a"];
  s += `<path d="M2440,720 L2444,650 M2470,720 L2466,660 M2410,720 L2420,668" stroke="${T("#4a3426")}" stroke-width="4"/>`;
  s += bush(2450, 640, 120, 62, SUMAC, 260) + bush(2340, 690, 70, 40, SUMAC, 110) + bush(60, 676, 90, 52, SCRUB, 180);

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#mlLight)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#mlPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
