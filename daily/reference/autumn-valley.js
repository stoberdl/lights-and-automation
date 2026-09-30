/* Hand-composed autumn valley. Procedural only where hand-placing hundreds of
   things would be silly (leaves, forest dots); composition is fixed by hand.
   Needs rng() and mix() from scene.js. */
function fallArt(opts = {}) {
  const r = rng(opts.seed || 2026);
  const W = 2560, H = 720;
  const blobP = (cx, cy, rx, ry, n) => {
    n = n || 7 + Math.floor(r() * 4);
    const pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r() * .3, k = .8 + r() * .35;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n];
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = mx - cx, dy = my - cy, L = Math.hypot(dx, dy) || 1, b = .45 * Math.hypot(x1 - x0, y1 - y0);
      d += ` Q${(mx + dx / L * b).toFixed(1)},${(my + dy / L * b).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`; }
    return d + "Z";
  };
  // smooth 1-D noise from a few sines, so ridges are gentle and repeatable
  const wave = (ph, fr, am) => x => fr.reduce((s, f, i) => s + Math.sin(x / f + ph[i]) * am[i], 0);
  const ridgePath = (fn, close = H) => { let d = `M0,${close} L0,${fn(0).toFixed(1)}`;
    for (let x = 0; x <= W; x += 16) d += ` L${x},${fn(x).toFixed(1)}`; return d + ` L${W},${close}Z`; };

  const SKY_H = "#f4dcae";
  let s = `<defs id="fdefs">
    <linearGradient id="fSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b78c0"/><stop offset=".42" stop-color="#7fb3e0"/><stop offset=".72" stop-color="#d9e0d0"/><stop offset="1" stop-color="${SKY_H}"/></linearGradient>
    <radialGradient id="fSun" cx="1180" cy="120" r="720" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff6d6" stop-opacity=".9"/><stop offset=".18" stop-color="#ffefc0" stop-opacity=".45"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".12"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>
    <linearGradient id="fMtn1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8aa2c6"/><stop offset="1" stop-color="#b9c3cf"/></linearGradient>
    <linearGradient id="fMtn2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d93b3"/><stop offset="1" stop-color="#aab3b8"/></linearGradient>
    <linearGradient id="fHill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b59a62"/><stop offset="1" stop-color="#9c8450"/></linearGradient>
    <linearGradient id="fHill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a0893f"/><stop offset="1" stop-color="#7d6a30"/></linearGradient>
    <linearGradient id="fMeadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8a452"/><stop offset=".5" stop-color="#96883e"/><stop offset="1" stop-color="#65602a"/></linearGradient>
    <linearGradient id="fHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY_H}" stop-opacity="0"/><stop offset=".6" stop-color="${SKY_H}" stop-opacity=".55"/><stop offset="1" stop-color="${SKY_H}" stop-opacity="0"/></linearGradient>
    <linearGradient id="fTrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b4630"/><stop offset=".45" stop-color="#4a2e1e"/><stop offset="1" stop-color="#2e1c12"/></linearGradient>
    <filter id="leafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="leafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="cloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="soft2"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fSky)"/>`;

  /* sun + rays */
  s += `<rect width="${W}" height="${H}" fill="url(#fSun)"/><circle cx="1180" cy="120" r="38" fill="#fffbe8"/>`;
  s += `<g class="rays" opacity=".12" filter="url(#soft2)">`;
  for (let k = 0; k < 7; k++) { const a = .55 + k * .3, L = 900;
    s += `<path d="M1180,120 L${1180 + Math.cos(a - .04) * L},${120 + Math.sin(a - .04) * L} L${1180 + Math.cos(a + .04) * L},${120 + Math.sin(a + .04) * L}Z" fill="#fff"/>`; }
  s += `</g>`;
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds - painterly: shade, body, sunlit tops; each in its own drifting group */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#cloudy)">`;
    const lobes = [];
    for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .16 * (.6 + r() * .7), w * (.09 + r() * .07)]); }
    c += `<ellipse cx="${x}" cy="${y + w*.05}" rx="${w*.55}" ry="${w*.07}" fill="#b9c8dc"/>`;
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${lx}" cy="${ly + R*.35}" rx="${R*1.15}" ry="${R*.75}" fill="#c3d0e2"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${lx}" cy="${ly}" rx="${R}" ry="${R*.85}" fill="#f7f8fb"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${lx - R*.25}" cy="${ly - R*.35}" rx="${R*.6}" ry="${R*.4}" fill="#fffdf2"/>`);
    return c + `</g></g>`;
  };
  s += cloud(640, 170, 520, "drift1") + cloud(1760, 120, 600, "drift2") + cloud(2250, 240, 320, "drift3") + cloud(300, 270, 300, "drift2");

  /* birds */
  s += `<g class="birds" fill="none" stroke="#3a3a48" stroke-width="2.2" stroke-linecap="round" opacity=".7">`;
  [[930, 230, 1], [960, 216, .8], [990, 238, .9], [1022, 226, .7], [1060, 244, .75]].forEach(([x, y, k]) =>
    s += `<path d="M${x - 9*k},${y - 3*k} q${5*k},${-4*k} ${9*k},${3*k} q${4*k},${-7*k} ${9*k},${-3*k}"/>`);
  s += `</g>`;
  const cloudPart = s; s = DEFS;

  /* far mountains */
  const m1 = wave([1, 2, 4], [260, 120, 60], [60, 22, 6]), m2 = wave([3, 5, 1], [340, 150, 70], [48, 20, 7]);
  s += `<path d="${ridgePath(x => 395 - Math.abs(m1(x)) * .9)}" fill="url(#fMtn1)"/>`;
  s += `<path d="${ridgePath(x => 440 - Math.abs(m2(x)) * .8)}" fill="url(#fMtn2)" opacity=".95"/>`;
  s += `<rect x="0" y="380" width="${W}" height="110" fill="url(#fHaze)"/>`;

  /* forest hills: ground, then hundreds of little autumn trees following the ridge */
  const AUT = ["#c8452a", "#d85a26", "#e0702a", "#e98a2c", "#eaa032", "#f2c648", "#a13a2a", "#8a9a3c", "#6f8a36"];
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
        const c = mix("#3d5a34", hazeCol, haze);
        f += `<path d="M${x},${y - sz*1.9} L${x + sz*.55},${y} L${x - sz*.55},${y}Z" fill="${c}"/><path d="M${x},${y - sz*1.9} L${x + sz*.55},${y} L${x},${y}Z" fill="${mix(c, "#000", .18)}"/>`;
        return;
      }
      const base = AUT[Math.floor(r() * AUT.length)], c = mix(base, hazeCol, haze), dk = mix(c, "#2a1a10", .35), lt = mix(c, "#fff3c8", .3);
      f += `<path d="${blobP(x + sz*.12, y + sz*.1, sz*.95, sz*.8, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz*.08, sz*.85, sz*.72, 7)}" fill="${c}"/><path d="${blobP(x - sz*.25, y - sz*.35, sz*.42, sz*.3, 6)}" fill="${lt}"/>`;
    });
    return f;
  };
  const h1 = wave([2, 4, 0], [300, 130, 55], [26, 10, 4]), h2 = wave([5, 1, 3], [380, 160, 70], [30, 12, 5]);
  const hill1 = x => 468 + h1(x), hill2 = x => 528 + h2(x);
  s += `<path d="${ridgePath(hill1)}" fill="url(#fHill1)"/>`;
  s += `<g filter="url(#leafyS)">${forest(hill1, 3, 13, .42, SKY_H, .15)}</g>`;
  s += `<rect x="0" y="470" width="${W}" height="90" fill="url(#fHaze)" opacity=".7"/>`;
  s += `<path d="${ridgePath(hill2)}" fill="url(#fHill2)"/>`;
  s += `<g filter="url(#leafyS)">${forest(hill2, 2, 19, .18, SKY_H, .12)}</g>`;

  /* fields: patchwork strips with crop rows */
  const fieldTop = x => 575 + Math.sin(x / 420) * 10;
  const patches = [[0, 380, "#c9a24e"], [380, 760, "#a8ac4e"], [760, 1180, "#d6b45a"], [1180, 1560, "#b59440"], [1560, 2000, "#c7b25c"], [2000, 2560, "#a39a44"]];
  patches.forEach(([a, b, c]) => {
    s += `<path d="M${a},${fieldTop(a)} L${b},${fieldTop(b)} L${b + 40},650 L${a - 40},650Z" fill="${c}"/>`;
    for (let k = 1; k < 7; k++) { const y = fieldTop(a) + k * 10.5;
      s += `<path d="M${a - k*6},${y} L${b + k*6},${y + (fieldTop(b) - fieldTop(a))}" stroke="${mix(c, "#3a2a10", .22)}" stroke-width="1.6" opacity=".55"/>`; }
  });

  /* farm: barn, silo, house, bales */
  const barn = (x, y) => {
    let b = `<path d="M${x - 70},${y} L${x - 70},${y - 58} L${x - 52},${y - 92} L${x},${y - 112} L${x + 52},${y - 92} L${x + 70},${y - 58} L${x + 70},${y}Z" fill="#a8352a"/>
      <path d="M${x - 78},${y - 56} L${x - 56},${y - 96} L${x},${y - 118} L${x + 56},${y - 96} L${x + 78},${y - 56}" fill="none" stroke="#4a3a34" stroke-width="7" stroke-linejoin="round"/>
      <path d="M${x + 20},${y} L${x + 20},${y - 58} L${x + 70},${y - 58} L${x + 70},${y}Z" fill="#000" opacity=".18"/>
      <rect x="${x - 26}" y="${y - 52}" width="52" height="52" fill="#f1e6d2"/><path d="M${x - 26},${y - 52} L${x + 26},${y} M${x + 26},${y - 52} L${x - 26},${y}" stroke="#f1e6d2" stroke-width="5"/>
      <rect x="${x - 22}" y="${y - 48}" width="44" height="48" fill="#8a2a22"/><path d="M${x - 22},${y - 48} L${x + 22},${y} M${x + 22},${y - 48} L${x - 22},${y}" stroke="#f1e6d2" stroke-width="4"/>
      <rect x="${x - 12}" y="${y - 92}" width="24" height="20" fill="#f1e6d2"/><rect x="${x - 9}" y="${y - 89}" width="18" height="14" fill="#3a2418"/>`;
    b += `<rect x="${x + 82}" y="${y - 130}" width="34" height="130" fill="#b9b4a8"/><rect x="${x + 100}" y="${y - 130}" width="16" height="130" fill="#8f8a80"/><path d="M${x + 82},${y - 130} Q${x + 99},${y - 154} ${x + 116},${y - 130}Z" fill="#7a8088"/>`;
    for (let k = 1; k < 8; k++) b += `<rect x="${x + 82}" y="${y - 130 + k*16}" width="34" height="1.5" fill="#6a665e" opacity=".5"/>`;
    return b;
  };
  const house = (x, y) => `<rect x="${x - 44}" y="${y - 50}" width="88" height="50" fill="#efe6d4"/><rect x="${x + 6}" y="${y - 50}" width="38" height="50" fill="#000" opacity=".1"/>
      <path d="M${x - 54},${y - 48} L${x},${y - 88} L${x + 54},${y - 48}Z" fill="#4a4e5a"/><rect x="${x + 18}" y="${y - 96}" width="10" height="26" fill="#6a4a3a"/>
      <rect x="${x - 32}" y="${y - 38}" width="14" height="16" fill="#6a8aa8"/><rect x="${x - 6}" y="${y - 38}" width="14" height="16" fill="#6a8aa8"/><rect x="${x + 22}" y="${y - 30}" width="14" height="30" fill="#7a4a30"/>`;
  s += house(860, 612) + barn(1010, 616);
  s += `<g class="smoke" opacity=".5">${[0,1,2,3,4].map(k => `<circle cx="${883 + k*7}" cy="${512 - k*20}" r="${6 + k*4}" fill="#e8e4dc" opacity="${.6 - k*.1}"/>`).join("")}</g>`;
  [[1150, 632, 1], [1215, 640, .9], [1290, 628, .8], [720, 640, .85]].forEach(([x, y, k]) => {
    s += `<ellipse cx="${x + 4}" cy="${y + 12*k}" rx="${30*k}" ry="${6*k}" fill="#000" opacity=".2"/><rect x="${x - 26*k}" y="${y - 24*k}" width="${52*k}" height="${36*k}" rx="${16*k}" fill="#d8b456"/>
      <ellipse cx="${x - 26*k + 4}" cy="${y - 6*k}" rx="${8*k}" ry="${18*k}" fill="#e8c96a"/><path d="M${x - 22*k},${y - 12*k} q${4*k},${6*k} 0,${12*k}" stroke="#b08a34" stroke-width="1.5" fill="none"/>`;
  });

  /* near meadow, with a road winding to the farm */
  const mead = wave([1, 3, 5], [500, 190, 80], [14, 6, 2]);
  const meadow = x => 648 + mead(x) - Math.max(0, 140 - Math.abs(x - 1500)) * .35;   // knoll under the hero tree
  s += `<path d="${ridgePath(meadow)}" fill="url(#fMeadow)"/>`;
  s += `<path d="M1150,720 C1120,690 1180,672 1110,652 C1070,640 1060,630 1040,622 L1062,622 C1090,632 1110,640 1150,652 C1230,672 1200,695 1245,720Z" fill="#c9a878"/>
        <path d="M1150,720 C1120,690 1180,672 1110,652 C1070,640 1060,630 1040,622" fill="none" stroke="#9a7c52" stroke-width="3" opacity=".6"/>`;
  for (let x = 840; x < 1080; x += 34) { const y = 640 + (x - 840) * -.05;
    s += `<rect x="${x}" y="${y - 22}" width="4" height="24" fill="#6a4a30"/>`; if (x + 34 < 1080) s += `<path d="M${x},${y - 16} L${x + 34},${y - 17.7} M${x},${y - 8} L${x + 34},${y - 9.7}" stroke="#7a5a3a" stroke-width="2"/>`; }

  /* the hero maple */
  const tx = 1420, ty = meadow(1420) + 4;
  s += `<ellipse cx="${tx + 30}" cy="${ty + 6}" rx="230" ry="20" fill="#2a2a10" opacity=".25"/>`;
  s += `<path d="M${tx - 26},${ty} C${tx - 18},${ty - 80} ${tx - 30},${ty - 150} ${tx - 12},${ty - 210} L${tx + 14},${ty - 210} C${tx + 20},${ty - 150} ${tx + 22},${ty - 80} ${tx + 34},${ty}Z" fill="url(#fTrunk)"/>`;
  const limbs = [[-1, 150, 150, 120], [1, 160, 170, 110], [-1, 200, 110, 150], [1, 205, 120, 150], [0, 210, 20, 190]];
  limbs.forEach(([dir, at, dx, dy]) => s += `<path d="M${tx},${ty - at} Q${tx + dir*dx*.4},${ty - at - dy*.6} ${tx + dir*dx},${ty - at - dy}" stroke="#3a2416" stroke-width="12" fill="none" stroke-linecap="round"/>`);
  const crown = [[tx, ty - 330, 200, 125], [tx - 120, ty - 280, 140, 95], [tx + 125, ty - 285, 145, 100], [tx, ty - 250, 190, 85], [tx - 10, ty - 420, 130, 70], [tx + 60, ty - 380, 120, 70]];
  const inCrown = (x, y) => crown.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
  const RAMP = ["#5e1a12", "#86261a", "#ac3520", "#cc4a22", "#e0662a", "#ee8a30", "#f6b24a", "#fcd97e"];
  const leaves = [];
  for (let i = 0; i < 1400 && leaves.length < 950; i++) {
    const x = tx - 280 + r() * 560, y = ty - 500 + r() * 360;
    if (!inCrown(x, y)) continue;
    const nx = (x - tx) / 260, ny = (y - (ty - 330)) / 160;
    const lit = (-nx * .55 - ny * .8) * .5 + .5, edge = Math.min(1, Math.hypot(nx, ny));
    const v = Math.max(0, Math.min(.999, lit * .75 + edge * .15 + (r() - .5) * .3));
    leaves.push([x, y, v, 9 + r() * 9]);
  }
  leaves.sort((a, b) => a[2] - b[2]);
  s += `<g class="crown" filter="url(#leafy)">`;
  leaves.forEach(([x, y, v, R]) => s += `<path d="${blobP(x, y, R, R * .8, 6)}" fill="${RAMP[Math.floor(v * RAMP.length)]}"/>`);
  s += `</g>`;
  // carpet of fallen leaves round the knoll
  for (let k = 0; k < 260; k++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()), x = tx + 20 + Math.cos(a) * d * 280, y = ty + Math.sin(a) * d * 26 - 2;
    s += `<ellipse cx="${x}" cy="${y}" rx="${3 + r()*3}" ry="${1.8 + r()*1.5}" fill="${RAMP[3 + Math.floor(r() * 5)]}" transform="rotate(${r()*180} ${x} ${y})"/>`;
  }

  /* meadow grass, drawn over everything low */
  for (let x = 0; x < W; x += 5 + r() * 9) {
    const y = meadow(x) + 4 + r() * 80, h = 8 + r() * 16;
    s += `<path d="M${x},${y} q${-2 + r()*4},${-h*.6} ${-4 + r()*8},${-h}" stroke="${r() < .5 ? "#c8b262" : "#6a6228"}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`;
  }
  // foreground bushes framing the bottom corners
  [[60, 700, 70], [180, 715, 55], [2480, 700, 80], [2360, 716, 50]].forEach(([x, y, R]) => {
    const c = AUT[Math.floor(r() * 6)];
    s += `<g filter="url(#leafyS)"><path d="${blobP(x + 8, y + 8, R, R*.7)}" fill="${mix(c, "#1e1208", .5)}"/><path d="${blobP(x, y, R*.9, R*.62)}" fill="${mix(c, "#1e1208", .25)}"/><path d="${blobP(x - R*.25, y - R*.28, R*.45, R*.28)}" fill="${c}"/></g>`;
  });

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#fSun)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#paper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
