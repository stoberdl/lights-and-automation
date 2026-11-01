/* Candy Shop, Main Street: an Ohio courthouse-square main street on a crisp,
   sunny Saturday in mid-October (Sweetest Day, which Cleveland's candy makers
   started in 1921), dressed for Halloween. Standing on the courthouse green:
   across the street, a three-storey cream-painted brick candy shop with a red
   and white striped awning, display windows lined with shelves of candy jars
   and giant swirl lollipops, a lollipop medallion on its pediment, paper bats
   and a ghost in the upper windows, and pennant bunting. Hay bales, pumpkins
   and mums sit by its door. To the left, a hardware store, then a theatre with
   a bulb marquee, a limestone bank, and a row of shops curving away. To the
   right, a bookshop, a corner cafe, then a cross street with a pumpkin mural
   on the side wall of the next block. Acorn street lamps carry corn shocks and
   orange banners, maples in colour stand in the sidewalk, and a white steeple
   and the town's trees rise behind the roofs. Sun high off the right edge.
   opts.time === "night": moonlight from behind the viewer, sparse stars, every
   storefront lit (the candy jars glowing), lit upper windows, lamps with pools
   of light, the marquee bulbs, the awning's bulb string, jack-o'-lanterns.
   Built with world3d() (reference/scene-helpers.js): the buildings, lamps,
   trees and props are placed in metres and seen by one eye-level camera.
   Needs rng(), mix(), world3d() from reference/scene-helpers.js.
   opts.part = "sky" | "clouds" | "land".                                    */
function candyShopMainStreetArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1017;
  const r = rng(seed), rs = rng(seed + 5), rp = rng(seed + 29), rb = rng(seed + 41), rl = rng(seed + 53);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 2780, LY = -160, WY = 470;
  const T = c => NIGHT ? mix(mix(c, "#6e7488", .42), "#0a0e2a", .6) : c;
  const HZ = NIGHT ? "#2a3152" : "#e4e8ea", RIM = NIGHT ? "#a8b4e0" : "#fff3d2", SHADE = NIGHT ? "#04060e" : "#2c3244", LAMP = "#ffc46a";
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
  const pathP = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join("L") + "Z";

  /* ---------------- sky: a crisp, cold-front blue, or a starry town night ---------------- */
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#03051a"/><stop offset=".5" stop-color="#0b1236"/><stop offset=".86" stop-color="#232a52"/><stop offset="1" stop-color="#3a3a58"/>`
    : `<stop offset="0" stop-color="#3670b4"/><stop offset=".42" stop-color="#6e9ed0"/><stop offset=".8" stop-color="#b8d0e4"/><stop offset="1" stop-color="#e8ecea"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#e8a868" stop-opacity=".26"/><stop offset=".45" stop-color="#c88a6a" stop-opacity=".07"/><stop offset="1" stop-color="#c88a6a" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fffbe8" stop-opacity=".6"/><stop offset=".18" stop-color="#fff0c0" stop-opacity=".32"/><stop offset=".55" stop-color="#ffe2a0" stop-opacity=".14"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/>`;
  let s = `<defs id="csdefs">
    <linearGradient id="csSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="csLight" cx="${NIGHT ? 1280 : LX}" cy="${NIGHT ? WY + 40 : LY}" r="${NIGHT ? 1100 : 2000}" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="csHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".7" stop-color="${HZ}" stop-opacity=".85"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <radialGradient id="csGlow"><stop offset="0" stop-color="#ffe6a8" stop-opacity=".95"/><stop offset=".3" stop-color="${LAMP}" stop-opacity=".42"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/></radialGradient>
    <radialGradient id="csWarm"><stop offset="0" stop-color="#ffbe6a" stop-opacity=".6"/><stop offset=".5" stop-color="#ff9e48" stop-opacity=".2"/><stop offset="1" stop-color="#ff9e48" stop-opacity="0"/></radialGradient>
    <radialGradient id="csPink"><stop offset="0" stop-color="#ffc0c8" stop-opacity=".6"/><stop offset=".5" stop-color="#ff8aa0" stop-opacity=".2"/><stop offset="1" stop-color="#ff8aa0" stop-opacity="0"/></radialGradient>
    <filter id="csLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="17" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="csCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".013" numOctaves="3" seed="29" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="36" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
    <filter id="csPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="19"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="csSoft"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#csSky)"/>`;
  if (NIGHT) {
    // no moon in this direction (it is behind the viewer, over the courthouse); stars dimmed by the town's glow
    s += `<rect width="${W}" height="${H}" fill="url(#csLight)"/>`;
    for (let i = 0; i < 620; i++) { const x = rs() * W, y = Math.pow(rs(), 1.35) * 420, big = rs() < .05;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.7 : F(.5 + rs() * .7)}" fill="${rs() < .18 ? "#ffe6c4" : "#e6ecff"}" opacity="${F((.22 + rs() * .55) * (1 - y / 460))}"/>`; }
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#csLight)"/>`;
    s += `<g class="rays" opacity=".06" filter="url(#csSoft)">`;
    for (let k = 0; k < 6; k++) { const a = Math.PI - .2 - k * .08, L = 2400;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .02) * L)},${F(LY + Math.sin(a - .02) * L)} L${F(LX + Math.cos(a + .02) * L)},${F(LY + Math.sin(a + .02) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ---------------- clouds: a few fair-weather cumulus behind the cold front ---------------- */
  const cumulus = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#csCloudy)">`;
    const n = 5 + Math.floor(rs() * 3), lobes = [];
    for (let k = 0; k < n; k++) { const t = k / (n - 1), R = w * (.12 + rs() * .1) * (1 - Math.abs(t - .5) * .9);
      lobes.push([x + (t - .5) * w, y - R * (.35 + rs() * .5), R]); }
    if (NIGHT) {
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .66)}" fill="#1c2246"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .2)}" cy="${F(ly + R * .25)}" rx="${F(R * .6)}" ry="${F(R * .3)}" fill="#3a3a5a" opacity=".45"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .02)}" rx="${F(w * .55)}" ry="${F(w * .05)}" fill="#b8c4d2"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - R * .12)}" cy="${F(ly + R * .2)}" rx="${F(R * 1.05)}" ry="${F(R * .72)}" fill="#ccd4de"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .05)}" cy="${F(ly)}" rx="${F(R * .95)}" ry="${F(R * .68)}" fill="#eef0f2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + R * .32)}" cy="${F(ly - R * .25)}" rx="${F(R * .5)}" ry="${F(R * .36)}" fill="#fffdf6"/>`);
    }
    return c + `</g></g>`;
  };
  s += `<g opacity="${NIGHT ? .75 : .92}">` + cumulus(420, 300, 210, "drift2") + cumulus(760, 168, 120, "drift3") + cumulus(1560, 330, 180, "drift3") +
    cumulus(1980, 300, 250, "drift2") + cumulus(2420, 210, 150, "drift3") + `</g>`;
  if (!NIGHT) {   // starlings crossing over the square
    s += `<g class="birds" fill="none" stroke="#1e1c26" stroke-width="2.2" stroke-linecap="round" opacity=".8">`;
    [[1010, 196, 1], [1046, 182, .85], [1078, 204, .9], [1112, 188, .75], [1140, 210, .7], [972, 214, .8]].forEach(([x, y, k]) =>
      s += `<path d="M${F(x - 10 * k)},${F(y - 2)} q${F(5 * k)},${F(-6 * k)} ${F(10 * k)},${F(2)} q${F(5 * k)},${F(-6 * k)} ${F(10 * k)},${F(-2)}"/>`);
    s += `</g>`;
  } else {        // bats over the rooftops
    s += `<g class="birds" fill="#05060e">`;
    [[980, 170, .8], [1060, 140, .6], [1450, 120, .7], [1520, 168, .55], [1010, 228, .5]].forEach(([x, y, k]) =>
      s += `<path transform="translate(${x},${y}) scale(${k})" d="M0,0 q-10,-12 -24,-8 q6,4 4,10 q-8,-2 -12,4 q14,-2 32,6 q18,-8 32,-6 q-4,-6 -12,-4 q-2,-6 4,-10 q-14,-4 -24,8z"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ================= the world =================
     Eye 1.7 m above the courthouse green; metres, x right, y up, z away.
     The far frontage runs straight at z = 52 from x -10 to 24, bends away to the
     left at 19 degrees and to the right at 8; the street is 14.5 m wide.        */
  const EYE = 1.7, FL = 1900;
  const w = world3d({ h: EYE, hy: WY, f: FL, light: NIGHT ? [-.3, .6, -.75] : [.62, .55, -.55], tone: T, fog: HZ, fogK: .0016,
    shadow: SHADE, rim: RIM, shade: .5, hi: .28, night: NIGHT, lamp: LAMP });
  const sx = (x, z) => 1280 + FL * x / z, sy = (y, z) => WY + FL * (EYE - y) / z;
  const fogC = (c, fog) => T(mix(c, HZ, fog));
  const D2R = Math.PI / 180, YL = -19, YR = 8;
  const uL = [-Math.cos(-YL * D2R), Math.sin(-YL * D2R)], nL = [-Math.sin(-YL * D2R), -Math.cos(-YL * D2R)];
  const uC = [1, 0], nC = [0, -1];
  const uR = [Math.cos(YR * D2R), Math.sin(YR * D2R)], nR = [Math.sin(YR * D2R), -Math.cos(YR * D2R)];
  const BND = [-10, 52], CND = [24, 52];
  const add2 = (p, n, k) => [p[0] + n[0] * k, p[1] + n[1] * k];
  const isect = (p, u, q, v) => { const den = u[0] * v[1] - u[1] * v[0], t = ((q[0] - p[0]) * v[1] - (q[1] - p[1]) * v[0]) / den; return [p[0] + u[0] * t, p[1] + u[1] * t]; };
  const offLine = dd => { const b = isect(add2(BND, nL, dd), uL, add2(BND, nC, dd), uC), c = isect(add2(CND, nC, dd), uC, add2(CND, nR, dd), uR);
    return [add2(b, uL, 150), b, c, add2(c, uR, 150)]; };
  const SEG = { L: [BND, uL, nL, YL], C: [BND, uC, nC, 0], R: [CND, uR, nR, YR] };
  const pointAt = (sg, a, dd) => { const [o, u, n] = SEG[sg]; return add2(add2(o, u, a), n, dd); };
  const pr = (x, z, y = 0) => w.proj([x, y, z]);
  // distance in front of the frontage (it bends away on both sides, so the largest of the three)
  const ddOf = (x, z) => Math.max(...["L", "C", "R"].map(k => { const [o, , n] = SEG[k]; return (x - o[0]) * n[0] + (z - o[1]) * n[1]; }));

  /* ---------- the ground: green, near sidewalk, street, far sidewalk, cross street ---------- */
  const band = (d0, d1, fill) => { const pts = offLine(d0).concat(offLine(d1).reverse()).map(([x, z]) => pr(x, z)); return `<path d="${pathP(pts)}" fill="${fill}"/>`; };
  const gC = (c, z) => T(mix(c, HZ, w.fogAt(z)));
  const gquad = (a, b, wd, c, op = 1) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, px = -dz / L * wd / 2, pz = dx / L * wd / 2;
    return `<path d="${pathP([pr(a[0] + px, a[1] + pz), pr(b[0] + px, b[1] + pz), pr(b[0] - px, b[1] - pz), pr(a[0] - px, a[1] - pz)])}" fill="${c}"${op < 1 ? ` opacity="${op}"` : ""}/>`; };
  let G = `<rect x="0" y="${WY - 2}" width="${W}" height="${H - WY + 2}" fill="${gC("#8e9a68", 150)}"/>`;
  // lawns and the cross street running back from the gap (x 15-24)
  G += `<path d="${pathP([pr(15, 47.3), pr(24, 47.3), pr(24 + 2, 900), pr(15 - 2, 900)])}" fill="${gC("#c4bcac", 80)}"/>`;
  G += `<path d="${pathP([pr(16.8, 47.3), pr(22.2, 47.3), pr(22.2, 900), pr(16.8, 900)])}" fill="${gC("#605f64", 80)}"/>`;
  G += `<path d="${pathP([pr(19.45, 47.3), pr(19.55, 47.3), pr(19.55, 900), pr(19.45, 900)])}" fill="${gC("#d8b040", 80)}"/>`;
  // far sidewalk (broken at the cross street), curb, the street, near curb, near sidewalk (brick), the green
  G += band(0, 4.5, gC("#cbc4b4", 50));
  G += `<path d="${pathP([pr(15, 52.2), pr(24, 52.2), pr(24, 47.3), pr(15, 47.3)])}" fill="${gC("#605f64", 50)}"/>`;
  G += `<path d="${pathP([pr(15, 47.3), pr(16.8, 47.3), pr(16.8, 52.2), pr(15, 52.2)])}" fill="${gC("#c4bcac", 50)}"/><path d="${pathP([pr(22.2, 47.3), pr(24, 47.3), pr(24, 52.2), pr(22.2, 52.2)])}" fill="${gC("#c4bcac", 50)}"/>`;
  G += band(4.5, 4.75, gC("#dcd6c8", 47));
  { const top = offLine(4.75).map(([x, z]) => pr(x, z, .15)), bot = offLine(4.75).reverse().map(([x, z]) => pr(x, z, 0));
    G += `<path d="${pathP(top.concat(bot))}" fill="${gC("#8e887c", 47)}"/>`; }
  G += band(4.75, 19.25, gC("#5c5d62", 40));
  // asphalt wear: patches, tar seams, a manhole
  for (let i = 0; i < 700; i++) { const sg = rl() < .55 ? "C" : rl() < .7 ? "L" : "R", a = sg === "C" ? rl() * 34 : rl() * 90, dd = 4.9 + rl() * 14.2, [x, z] = pointAt(sg, a, dd), p = pr(x, z), k = FL / z;
    if (p[0] < -40 || p[0] > W + 40) continue;
    const big = rl() < .12, rx = (big ? .6 + rl() * 1.4 : .08 + rl() * .3) * k;
    G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(Math.max(.5, rx * EYE / z * 1.4))}" fill="${gC(rl() < .5 ? "#4a4b50" : "#707176", z)}" opacity="${F(.35 + rl() * .4)}"/>`; }
  { const [x, z] = pointAt("C", 6, 12.5), p = pr(x, z), k = FL / z; G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(.38 * k)}" ry="${F(.38 * k * EYE / z * 1.2)}" fill="${gC("#3e3e42", z)}"/>`; }
  // painted lines: angle parking on both sides, the double yellow
  ["L", "C", "R"].forEach(sg => { const n = sg === "C" ? 12 : 30;
    for (let i = 0; i < n; i++) { const a = 1.2 + i * 3.0; if (sg === "C" && a > 23.5 && a < 35) continue;
      G += gquad(pointAt(sg, a, 4.85), pointAt(sg, a - 2.6, 9.6), .12, gC("#e8e6dc", 45), .85);
      G += gquad(pointAt(sg, a + .8, 14.4), pointAt(sg, a - 1.8, 19.1), .12, gC("#e8e6dc", 35), .85); }
    [11.95, 12.2].forEach(dd => { for (let a = 0; a < (sg === "C" ? 34 : 150); a += 2) G += gquad(pointAt(sg, a, dd), pointAt(sg, a + 2.02, dd), .1, gC("#e0b23a", 40), .95); }); });
  G += band(19.25, 19.5, gC("#d4cec0", 33));
  G += band(19.5, 22.5, gC("#a8604a", 31));
  for (let dd = 19.9; dd < 22.5; dd += .32) ["L", "C", "R"].forEach(sg => { for (let a = sg === "C" ? 0 : 0; a < (sg === "C" ? 34 : 60); a += 6) G += gquad(pointAt(sg, a, dd), pointAt(sg, a + 6, dd), .025, gC("#7a3e30", 30), .45); });
  G += band(22.5, 45, gC("#6e8e40", 20));
  // the lawn's light and dark patches, flattened by distance
  for (let i = 0; i < 160; i++) { const z = 13 + rl() * 17, x = (rl() - .5) * 1.5 * z; if (ddOf(x, z) < 23.5) continue; const p = pr(x, z), k = FL / z, rx = (1 + rl() * 2.5) * k;
    G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(rx * EYE / z * 1.6)}" fill="${gC(rl() < .5 ? "#5a7a34" : "#86a050", z)}" opacity=".35"/>`; }
  // expansion joints on the far sidewalk
  ["L", "C", "R"].forEach(sg => { for (let a = .75; a < (sg === "C" ? 34 : 80); a += 1.5) { if (sg === "C" && a > 25 && a < 34) continue; G += gquad(pointAt(sg, a, .1), pointAt(sg, a, 4.45), .03, gC("#9a9488", 50), .7); } });
  // fallen leaves along the gutters and the sidewalk
  const LEAF = ["#c8461e", "#e07a26", "#d8a030", "#a8341a", "#e8b84a", "#8a4a20"];
  for (let i = 0; i < 1300; i++) { const sg = rl() < .5 ? "C" : rl() < .6 ? "L" : "R", a = sg === "C" ? rl() * 34 : rl() * 70;
    const q = rl(), dd = q < .45 ? 4.8 + Math.pow(rl(), 2) * 1.6 : q < .7 ? rl() * 4.4 : q < .8 ? 17.5 + rl() * 1.7 : 19.6 + rl() * 3;
    const [x, z] = pointAt(sg, a, dd), p = pr(x, z), k = FL / z; if (p[0] < -10 || p[0] > W + 10) continue;
    const rx = (.06 + rl() * .06) * k; G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(Math.max(.6, rx))}" ry="${F(Math.max(.4, rx * .35))}" fill="${gC(LEAF[Math.floor(rl() * LEAF.length)], z)}" opacity=".9"/>`; }
  // the green: grass blades and leaves (most of this sits under the cards)
  for (let i = 0; i < 2600; i++) { const z = 12.5 + Math.pow(rl(), 1.3) * 18, x = (rl() - .5) * 1.5 * z, p = pr(x, z), k = FL / z;
    if (p[0] < -10 || p[0] > W + 10 || ddOf(x, z) < 22.7) continue;   // only on the lawn side of the near sidewalk
    if (rl() < .07) { const rx = (.035 + rl() * .035) * k; G += `<ellipse cx="${F(p[0])}" cy="${F(p[1])}" rx="${F(rx)}" ry="${F(rx * .4)}" fill="${gC(LEAF[Math.floor(rl() * LEAF.length)], z)}" transform="rotate(${F((rl() - .5) * 50)} ${F(p[0])} ${F(p[1])})"/>`; continue; }
    const L = (.05 + rl() * .07) * k, bend = (rl() - .5) * L * .7;
    G += `<path d="M${F(p[0])},${F(p[1])} q${F(bend * .3)},${F(-L * .5)} ${F(bend)},${F(-L)}" stroke="${gC(rl() < .5 ? "#5a7a32" : rl() < .5 ? "#8aa24c" : "#a4a85a", z)}" stroke-width="${F(Math.max(.8, L * .1))}" fill="none" stroke-linecap="round"/>`; }

  /* ---------- painterly pieces drawn as sprites ---------- */
  const ORG = ["#5a200a", "#86300c", "#ac4410", "#cc5a16", "#e2731e", "#f08e2e", "#f8ac52", "#fcca86"];
  const WHT = ["#6a6250", "#8a8270", "#a8a08c", "#c4bca6", "#d8d2be", "#e8e4d4", "#f4f0e2", "#fffcf2"];
  const RED = ["#4a140a", "#6a1c0c", "#8a2a10", "#a83a14", "#c24e1c", "#d4682a", "#e48a44", "#f0ac6a"];
  const pickPumpkin = () => { const q = rp(); return q < .7 ? ORG : q < .85 ? RED : WHT; };
  /* a ribbed pumpkin sitting on (px, py); R in px, lit from the right. jack: carved face (lit at night) */
  const pumpkin = (px, py, R, fog, RAMP, jack) => {
    const ry = R * (.72 + rp() * .14), cy = py - ry, C = i => fogC(RAMP[Math.max(0, Math.min(7, i))], fog);
    let g = `<ellipse cx="${F(px - R * .3)}" cy="${F(py)}" rx="${F(R * 1.2)}" ry="${F(Math.max(.8, R * .2))}" fill="#000" opacity=".22"/>`;
    if (R < 2.2) return g + `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(4)}"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(cy)}" rx="${F(R)}" ry="${F(ry)}" fill="${C(2)}"/>`;
    const nr = R > 9 ? 5 : 3;
    for (let i = 0; i < nr; i++) { const u = (i + .5) / nr * 2 - 1, rx = R * (1 - Math.abs(u) * .55) / nr * 1.25;
      g += `<ellipse cx="${F(px + u * R * .62)}" cy="${F(cy)}" rx="${F(rx)}" ry="${F(ry * (.97 - Math.abs(u) * .08))}" fill="${C(u > .3 ? 6 : u > -.2 ? 5 : u > -.6 ? 4 : 3)}"/>`; }
    if (R > 5) g += `<ellipse cx="${F(px + R * .42)}" cy="${F(cy - ry * .38)}" rx="${F(R * .2)}" ry="${F(ry * .14)}" fill="${C(7)}" opacity=".7"/>`;
    g += `<path d="M${F(px + R * .06)},${F(cy - ry * .9)} q${F(-R * .02)},${F(-R * .22)} ${F(-R * .16)},${F(-R * .3)} l${F(-R * .06)},${F(R * .06)} q${F(R * .1)},${F(R * .1)} ${F(R * .08)},${F(R * .26)}Z" fill="${fogC("#4a5426", fog)}"/>`;
    if (jack && R > 4) {
      const fc = NIGHT ? "#ffd070" : fogC("#3a1606", fog);
      g += `<path d="M${F(px - R * .5)},${F(cy - ry * .12)} l${F(R * .18)},${F(-R * .28)} l${F(R * .18)},${F(R * .28)}Z M${F(px + R * .14)},${F(cy - ry * .12)} l${F(R * .18)},${F(-R * .28)} l${F(R * .18)},${F(R * .28)}Z M${F(px - R * .56)},${F(cy + ry * .18)} q${F(R * .56)},${F(ry * .5)} ${F(R * 1.12)},0 l${F(-R * .2)},${F(ry * .14)} l${F(-R * .18)},${F(-ry * .12)} l${F(-R * .18)},${F(ry * .12)} l${F(-R * .18)},${F(-ry * .12)} l${F(-R * .2)},${F(ry * .14)}Z" fill="${fc}"/>`;
      if (NIGHT) g += `<circle cx="${F(px)}" cy="${F(cy)}" r="${F(R * 4)}" fill="url(#csGlow)" opacity=".55"/>`; }
    return g; };
  const mum = (px, py, k, fog, hue) => {
    const R = .28 * k, C = { gold: ["#8a6a10", "#c89a1c", "#e8c03a", "#f8de7a"], rust: ["#6a2210", "#a03c18", "#c85a26", "#e88a4a"], plum: ["#3a1a3a", "#6a2e66", "#94488e", "#c07ab8"], cream: ["#8a8268", "#c8c0a0", "#e8e2c8", "#fffaf0"] }[hue];
    let g = `<path d="M${F(px - R * .55)},${F(py - R * .62)} L${F(px + R * .55)},${F(py - R * .62)} L${F(px + R * .4)},${F(py)} L${F(px - R * .4)},${F(py)}Z" fill="${fogC("#a85a3a", fog)}"/><path d="M${F(px - R * .1)},${F(py - R * .62)} L${F(px - R * .55)},${F(py - R * .62)} L${F(px - R * .4)},${F(py)} L${F(px - R * .05)},${F(py)}Z" fill="${fogC("#6a3424", fog)}" opacity=".7"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(py - R * .95)}" rx="${F(R)}" ry="${F(R * .62)}" fill="${fogC(C[0], fog)}"/>`;
    const m = Math.max(4, Math.min(60, Math.round(R * 1.5)));
    for (let i = 0; i < m; i++) { const a = rp() * Math.PI * 2, q = Math.sqrt(rp()), x = px + Math.cos(a) * q * R * .9, y = py - R * .95 + Math.sin(a) * q * R * .55 - (1 - q) * R * .1;
      const side = (x - px) / R + (py - R * .95 - y) / R; g += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(Math.max(.6, R * .1))}" fill="${fogC(C[side > .3 ? 3 : side > -.3 ? 2 : 1], fog)}"/>`; }
    return g; };
  /* a corn shock: stalks stood up in a teepee and tied */
  const shock = (px, py, hp, fog) => {
    const bw = hp * .5, ty = py - hp * .62; let g = `<ellipse cx="${F(px - hp * .15)}" cy="${F(py)}" rx="${F(bw * .7)}" ry="${F(Math.max(1, hp * .05))}" fill="#000" opacity=".2"/>`;
    const C = ["#5a4626", "#7a6234", "#9a7e44", "#b89a58", "#d2b672", "#e6cc8c"].map(c => fogC(c, fog));
    const n = Math.max(8, Math.min(70, Math.round(hp * 1.2)));
    for (let i = 0; i < n; i++) { const u = i / (n - 1), bx = px + (u - .5) * bw, tx = px + (u - .5) * bw * .12, lit = cl(u + (rp() - .5) * .4);
      g += `<path d="M${F(bx)},${F(py)} Q${F((bx + tx) / 2)},${F((py + ty) / 2)} ${F(tx)},${F(ty)}" stroke="${C[Math.floor(lit * 5)]}" stroke-width="${F(Math.max(.7, hp * .025))}" fill="none"/>`; }
    for (let i = 0; i < n * .8; i++) { const u = rp(), a = (u - .5) * 1.4 - Math.PI / 2, L = hp * (.25 + rp() * .18), lit = cl(u + (rp() - .5) * .3);
      g += `<path d="M${F(px + (u - .5) * bw * .1)},${F(ty)} q${F(Math.cos(a) * L * .6)},${F(Math.sin(a) * L * .7)} ${F(Math.cos(a) * L)},${F(Math.sin(a) * L * .55 + L * .25)}" stroke="${C[Math.floor(lit * 5)]}" stroke-width="${F(Math.max(.6, hp * .02))}" fill="none"/>`; }
    g += `<path d="M${F(px - bw * .08)},${F(py - hp * .3)} L${F(px + bw * .08)},${F(py - hp * .3)}" stroke="${fogC("#6a4a2a", fog)}" stroke-width="${F(Math.max(.8, hp * .03))}"/>`;
    return g; };

  /* ---------- trees: many lit leaf clumps (street maples, the town's canopy behind) ---------- */
  const MAPLE = ["#3e1210", "#5e1a14", "#7e2416", "#a2321a", "#c24a22", "#d8682e", "#e88e46", "#f6b86e"];
  const GOLD = ["#4a3a10", "#6a5414", "#8a701c", "#a88a24", "#c4a230", "#dab846", "#eacc6a", "#f8e6a2"];
  const RUST = ["#4a2210", "#6a3214", "#8a4418", "#a85a1e", "#c47426", "#d8923a", "#e8b05a", "#f4d088"];
  const OAK = ["#22281a", "#2e361c", "#3e4620", "#525a26", "#68702e", "#80843a", "#9c9c52", "#bab874"];
  const broadleaf = (x, y, hp, RAMP, fog, n, rr = r) => {
    const Tf = c => T(mix(c, HZ, fog)); let g = "";
    const tb = Math.max(1.2, hp * .03), ty = y - hp * .34;
    g += `<ellipse cx="${F(x - hp * .25)}" cy="${F(y + 1)}" rx="${F(hp * .36)}" ry="${F(Math.max(1, hp * .03))}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tb * .5)},${F(ty)} L${F(x + tb * .5)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#4e4238")}"/>`;
    g += `<path d="M${F(x - tb * .1)},${F(y)} L${F(x - tb * .1)},${F(ty)} L${F(x - tb * .5)},${F(ty)} L${F(x - tb)},${F(y)}Z" fill="${Tf("#2a221c")}"/>`;
    // a few limbs into the crown
    [[-1, .5], [1, .55], [-.3, .7]].forEach(([dx, h]) => g += `<path d="M${F(x)},${F(ty + hp * .05)} Q${F(x + dx * hp * .08)},${F(y - hp * h * .9)} ${F(x + dx * hp * .2)},${F(y - hp * h)}" stroke="${Tf("#3a3028")}" stroke-width="${F(tb * .7)}" fill="none"/>`);
    const cx = x, cy = y - hp * .6, rx = hp * .4, ry = hp * .37, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl, cs = [];
    const nL = 3 + Math.floor(rr() * 3);
    const lobes = Array.from({ length: nL }, (_, i) => { const a = -Math.PI / 2 + (i / (nL - 1) - .5) * 2.6 + (rr() - .5) * .4;
      return [cx + Math.cos(a) * rx * (.45 + rr() * .2), cy + Math.sin(a) * ry * (.4 + rr() * .25) + ry * .15, rx * (.42 + rr() * .2), ry * (.42 + rr() * .18)]; });
    const inL = (px, py) => Math.min(...lobes.map(([lx, ly, a, b]) => ((px - lx) / a) ** 2 + ((py - ly) / b) ** 2));
    for (let i = 0; i < n * 4 && cs.length < n; i++) { const px = cx + (rr() * 2 - 1) * rx * 1.2, py = cy + (rr() * 2 - 1) * ry * 1.15;
      const e = inL(px, py); if (e > 1 || (e > .6 && rr() < .4)) continue;
      const lit = ((px - cx) / rx * ux + (py - cy) / ry * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .75 + Math.sqrt(e) * .12 + (rr() - .5) * .32), hp * (.022 + rr() * .022)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = lobes.map(([lx, ly, a, b]) => `<path d="${blobP(lx - a * .08, ly + b * .12, a * .85, b * .8, 8, rr)}" fill="${Tf(RAMP[1])}"/>`).join("");
    cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .82, 6, rr)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#csLeafy)">${cg}</g>`; };
  const clump = (x, y, sz, fog, RAMP) => { const c = T(mix(RAMP[2 + Math.floor(r() * 3)], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#1a140c", .4), lt = T(mix(mix(RAMP[5], RIM, NIGHT ? 0 : .12), HZ, fog));
    let g = `<path d="${blobP(x, y - sz * .45, sz * .5, sz * .48, 8)}" fill="${dk}"/>`;
    if (sz > 40) for (let i = 0; i < 3; i++) g += `<path d="${blobP(x + (i - 1) * sz * .26, y - sz * (.55 + r() * .15), sz * .26, sz * .24, 8)}" fill="${dk}"/>`;
    const m = Math.max(3, Math.min(48, Math.round(sz / 1.5)));
    for (let i = 0; i < m; i++) { const a = r() * Math.PI * 2, q = Math.sqrt(r()), px = x + Math.cos(a) * q * sz * .4, py = y - sz * .5 + Math.sin(a) * q * sz * .38;
      const side = (px - x) + (y - sz * .5 - py) * .6, R = sz * (.12 + r() * .1);
      g += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${side > sz * .1 ? lt : side > -sz * .1 ? c : mix(c, dk, .5)}"/>`; }
    return g; };
  const pickRamp = q => q < .35 ? MAPLE : q < .6 ? GOLD : q < .8 ? RUST : OAK;
  // the text corners stay calm: nothing standing may reach above y 250 there
  const capY = px => 250 - 150 * sm((px - 860) / 160) * sm((1540 - px) / 160);
  const room = (x, z) => (sy(0, z) - capY(sx(x, z))) * z / FL;
  // the town's canopy behind the roofs, in lots with gaps of sky
  for (let i = 0; i < 900; i++) { const z = 74 + Math.pow(r(), .85) * 230, x = (r() - .5) * 2.6 * z, u = sx(x, z); if (u < -80 || u > W + 80) continue;
    if (Math.sin(x / 23 + z / 41) + Math.sin(x / 9.7 - z / 17) * .6 < -.3) continue;
    const h = Math.min(11 + r() * 10, room(x, z)); if (h < 8) continue;
    const RAMP = pickRamp(r());
    w.sprite({ x, z, y: 0, tag: "far", fn: (px, py, k, fog) => { const hp = h * k; return hp > 60 ? broadleaf(px, py, hp, RAMP, fog, Math.min(160, Math.round(hp * .5))) : `<g filter="url(#csLeafy)">${clump(px, py, hp, fog * .9, RAMP)}</g>`; } }); }
  // a white church steeple behind the left of the row
  const far = ob => { ob.tag = "far"; return ob; };
  { const X = -22, Z = 150, Wc = "#f0ece2";
    far(w.box({ x: X + 7, z: Z + 8, w: 12, d: 24, h: 12, c: "#d8d2c4" }));
    far(w.box({ x: X, z: Z, w: 5.2, d: 5.2, h: 16, c: Wc }));
    far(w.box({ x: X, z: Z, y: 16, w: 5.6, d: 5.6, h: .5, c: "#e4e0d6" }));
    far(w.box({ x: X, z: Z, y: 16.5, w: 4.0, d: 4.0, h: 4.3, c: Wc, dec: (faces, P) => { faces[0].dec = [{ P: [P([-1.1, .6, -2.03]), P([1.1, .6, -2.03]), P([1.1, 3.4, -2.03]), P([-1.1, 3.4, -2.03])], c: "#2a2e36" }]; } }));
    far(w.box({ x: X, z: Z, y: 20.8, w: 4.4, d: 4.4, h: .4, c: "#e4e0d6" }));
    far(w.cyl({ x: X, z: Z, y: 21.2, r0: 2.0, r1: 0, h: 9.6, n: 8, rot: Math.PI / 8, c: "#ece8de" })); }
  // houses along the cross street, beyond the right block
  { const hr = rng(seed + 61);
    [[30.5, 82], [31.5, 100], [30, 118], [32, 138], [12, 88]].forEach(([x, z], i) => far(w.house({ ...w.randomHouse(hr, { x, z, yaw: x > 20 ? -90 : 90, rng: hr, kind: "village" }) })));
    [[27, 76], [27.5, 94], [26.5, 112], [27, 130]].forEach(([x, z]) => { const RAMP = pickRamp(r()), h = Math.min(10 + r() * 4, room(x, z));
      w.sprite({ x, z, y: 0, tag: "far", fn: (px, py, k, fog) => broadleaf(px, py, h * k, RAMP, fog, Math.min(200, Math.round(h * k * .55))) }); }); }

  /* ---------- the buildings ---------- */
  const CANDY = ["#e8384e", "#f472a0", "#ffd23a", "#5ac85a", "#ff8a2a", "#9a5ad8", "#fff4e0", "#38b8e8", "#c82a2a", "#f8b8d0"];
  const glassD = "#34424e";
  const circ = (cx, cy, R, n = 18) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; });
  const spiral = (cx, cy, R) => Array.from({ length: 40 }, (_, i) => { const t = i / 39, a = t * Math.PI * 5; return [cx + Math.cos(a) * R * t, cy + Math.sin(a) * R * t]; });
  /* window displays: drawn on the glass, lit from inside at night */
  const goods = (kind, a, b, y0, y1, Q, Pl, Ln) => {
    const Gc = c => NIGHT ? mix(c, "#ffe0b0", .12) : mix(c, glassD, .28), gl = NIGHT;
    if (kind === "candy") {
      [1.08, 1.72, 2.36].forEach(ys => {
        for (let x = a + .07; x < b - .24; x += .24 + rb() * .05) { const c = CANDY[Math.floor(rb() * CANDY.length)], jh = .3 + rb() * .14;
          Q(x, ys + .02, x + .19, ys + jh, Gc(mix(c, "#ffffff", .12)), { glow: gl, off: .045 });
          Q(x + .015, ys + jh, x + .175, ys + jh + .05, Gc(rb() < .5 ? "#f0e8dc" : "#e8608a"), { glow: gl, off: .046 });
          Q(x + .03, ys + .06, x + .06, ys + jh - .04, "#ffffff", { glow: true, op: .4, off: .047 }); }
        Ln([[a, ys], [b, ys]], NIGHT ? "#c8885a" : "#5a3e30", .05, { off: .05, glow: NIGHT }); });
      // bowls of candy corn on the sill
      for (let x = a + .15; x < b - .4; x += .55) { Pl([[x, .64], [x + .36, .64], [x + .3, .78], [x + .06, .78]], Gc("#f4f0e8"), { glow: gl, off: .05 });
        for (let j = 0; j < 4; j++) { const cx = x + .08 + j * .07; Pl([[cx, .78], [cx + .06, .78], [cx + .03, .9]], Gc("#f2a020"), { glow: gl, off: .052 }); Pl([[cx + .012, .82], [cx + .048, .82], [cx + .03, .86]], Gc("#fff6e0"), { glow: gl, off: .053 }); } }
      // a giant swirl lollipop standing in the window
      const lx = (a + b) / 2 + (rb() - .5) * .3, ly = 2.05;
      Ln([[lx, .62], [lx, ly]], "#f4f0e8", .05, { off: .06, glow: NIGHT });
      Pl(circ(lx, ly, .44, 22), Gc(rb() < .5 ? "#e8384e" : "#9a5ad8"), { glow: gl, off: .065 });
      Ln(spiral(lx, ly, .42), Gc("#fff6ee"), .075, { off: .07, glow: gl });
      Pl(circ(lx - .14, ly + .16, .08, 10), "#ffffff", { glow: true, op: .5, off: .072 });
    } else if (kind === "books") {
      [1.12, 1.78, 2.44].forEach(ys => { for (let x = a + .05; x < b - .1;) { const bw = .04 + rb() * .05, bh = .3 + rb() * .16;
        Q(x, ys + .01, x + bw, ys + bh, Gc(["#7a2a22", "#2a4a6a", "#c8a050", "#3a5a3a", "#e8dcc0", "#5a3a5a", "#a8482a"][Math.floor(rb() * 7)]), { glow: gl, off: .045 }); x += bw + .01 + (rb() < .08 ? .2 : 0); }
        Ln([[a, ys], [b, ys]], NIGHT ? "#b88a5a" : "#4a3a2e", .04, { off: .05, glow: NIGHT }); });
      Pl([[a + .2, .64], [a + .9, .64], [a + .9, .82], [a + .2, .82]], Gc("#e07a22"), { glow: gl, off: .05 });
    } else if (kind === "hardware") {
      [1.3, 2.15].forEach(ys => { for (let x = a + .08; x < b - .2; x += .22 + rb() * .06) { const c = ["#a8aab0", "#c83a2a", "#3a6a4a", "#d8b040", "#6a7a8a"][Math.floor(rb() * 5)];
        Q(x, ys + .01, x + .15, ys + .2 + rb() * .1, Gc(c), { glow: gl, off: .045 }); }
        Ln([[a, ys], [b, ys]], NIGHT ? "#a8784a" : "#4a3a2e", .04, { off: .05, glow: NIGHT }); });
      for (let x = a + .3; x < b - .2; x += .5) Ln([[x, 2.95], [x + (rb() - .5) * .1, 2.45]], Gc("#6a5a4a"), .03, { off: .05, glow: gl });
      Pl(circ(a + .45, .9, .25, 14), Gc("#d8661e"), { glow: gl, off: .05 });
    } else if (kind === "cafe") {
      Q(a, .62, b, 1.35, Gc("#5a3a2a"), { glow: gl, off: .045 });
      for (let x = a + .4; x < b - .2; x += .8) { Ln([[x, y1], [x, 2.55]], Gc("#2a2420"), .02, { off: .05, glow: gl }); Pl(circ(x, 2.48, .1, 10), NIGHT ? "#fff0c0" : "#e8d8a8", { glow: true, off: .052 }); }
      for (let x = a + .25; x < b - .2; x += .3) Q(x, 1.35, x + .12, 1.48, Gc("#f2ece0"), { glow: gl, off: .05 });
    } else {
      [1.4].forEach(ys => { for (let x = a + .1; x < b - .3; x += .34 + rb() * .1) Q(x, ys, x + .26, ys + .22 + rb() * .1, Gc(["#d8c8a8", "#8a3a2a", "#3a4a5a", "#c8a050", "#6a8a6a"][Math.floor(rb() * 5)]), { glow: gl, off: .045 });
        Ln([[a, ys], [b, ys]], NIGHT ? "#a8784a" : "#4a3a2e", .04, { off: .05, glow: NIGHT }); });
      Pl(circ(a + .5, .86, .22, 14), Gc("#e07a22"), { glow: gl, off: .05 });
    }
  };
  const ROWS = (h, sf) => h >= 10 ? [[sf + .85, sf + 2.5], [sf + 3.2, sf + 4.55]] : [[sf + .8, sf + 2.45]];
  const glows = [];          // night: light spill on the sidewalk in front of each storefront
  const facade = o => {
    const d = o.d || 16, hw = o.w / 2, fz = -d / 2, sf = o.sf || 4.2, yaw = o.yaw || 0, h = o.h;
    const ctr = w.frame({ x: o.x, z: o.z, yaw }).P([0, 0, d / 2]);
    const BP = w.frame({ x: ctr[0], z: ctr[2], yaw }).P;
    const trim = o.trim || "#efe6d2", sfC = o.sfC || "#2c3430", stone = o.stone || "#ddd2ba", mortar = mix(o.wall, "#000000", .3);
    const dx = o.door ?? (rb() - .5) * (o.w - 3.2);
    const interior = NIGHT ? (o.inC || "#f6c47a") : glassD;
    w.box({ x: ctr[0], z: ctr[2], yaw, w: o.w, d, h, c: o.wall, dec: (faces, P) => {
      const D = [];
      const at = (x, y, off) => P([x, y, fz - off]);
      const Q = (x0, y0, x1, y1, c, e = {}) => { const of = e.off ?? .03; D.push({ P: [at(x0, y0, of), at(x1, y0, of), at(x1, y1, of), at(x0, y1, of)], c, glow: e.glow, op: e.op }); };
      const Pl = (pts, c, e = {}) => { const of = e.off ?? .035; D.push({ P: pts.map(([x, y]) => at(x, y, of)), c, glow: e.glow, op: e.op }); };
      const Ln = (pts, c, wd, e = {}) => { const of = e.off ?? .04; D.push({ P: pts.map(([x, y]) => at(x, y, of)), c, ln: wd, min: e.min ?? .4, op: e.op, glow: e.glow }); };
      // weathering and brick (or stone) courses
      for (let i = 0; i < 12; i++) { const x = -hw + rb() * o.w, y = sf + rb() * (h - sf), ww = .5 + rb() * 1.6; Q(x, y, Math.min(hw, x + ww), Math.min(h, y + .3 + rb() * 1.1), rb() < .5 ? mix(o.wall, "#000000", .1) : mix(o.wall, "#ffffff", .08), { op: .55, off: .01 }); }
      if (o.stoneCourse) for (let y = sf + .6; y < h - .75; y += .6) Ln([[-hw, y], [hw, y]], mortar, .025, { op: .35, off: .015 });
      else { for (let y = sf + .3; y < h - .75; y += .3) Ln([[-hw, y], [hw, y]], mortar, .018, { op: .28, off: .015, min: .3 });
        // single bricks a shade lighter or darker, so the wall reads as laid by hand
        const nb = Math.round(o.w * (h - sf) * (o.paint ? 1.2 : 2.6));
        for (let i = 0; i < nb; i++) { const row = Math.floor(rb() * (h - .75 - sf) / .3), y = sf + row * .3, x = -hw + rb() * (o.w - .45) + (row % 2) * .1;
          Q(x, y + .02, x + .38, y + .28, rb() < .5 ? mix(o.wall, "#000000", .14) : mix(o.wall, "#ffffff", .12), { op: o.paint ? .3 : .55, off: .012 }); } }
      if (o.pil) [-hw, hw - .45].forEach(x => { Q(x, sf, x + .45, h - .72, mix(o.wall, "#ffffff", .12), { off: .025 }); Q(x + (x < 0 ? .3 : 0), sf, x + (x < 0 ? .45 : .15), h - .72, mix(o.wall, "#000000", .12), { off: .027 }); });
      // frieze under the cornice
      Q(-hw, h - 1.25, hw, h - .72, o.frieze || mix(o.wall, trim, .3), { off: .02 });
      Ln([[-hw, h - 1.25], [hw, h - 1.25]], trim, .07, { off: .025 });
      // upper windows
      const rows = o.rows || ROWS(h, sf), n = o.upN || Math.max(2, Math.round(o.w / 2.1));
      rows.forEach(([y0, y1], ri) => { for (let k = 0; k < n; k++) {
        const u = -hw + (k + .5) * o.w / n, ww = Math.min(1.05, o.w / n * .52), rr = ww / 2, litW = NIGHT && rb() < .58;
        const gl = litW ? (rb() < .5 ? "#ffc868" : "#ffd890") : glassD, arch = o.arch;
        Q(u - rr - .2, y0 - .22, u + rr + .2, y0 - .07, stone, { off: .05 });                                    // sill
        if (arch) {
          const arc = (R, yc, m = 9) => Array.from({ length: m }, (_, i) => { const a = Math.PI * i / (m - 1); return [u + Math.cos(a) * R, yc + Math.sin(a) * R]; });
          Pl([[u + rr + .16, y0 - .06], ...arc(rr + .16, y1), [u - rr - .16, y0 - .06]], o.hood || stone, { off: .035 });
          Pl([[u + rr, y0], ...arc(rr, y1), [u - rr, y0]], gl, { glow: litW, off: .045 });
          Q(u - .09, y1 + rr - .04, u + .09, y1 + rr + .2, mix(o.hood || stone, "#ffffff", .2), { off: .05 });
        } else {
          Q(u - rr - .1, y0 - .06, u + rr + .1, y1 + .06, trim, { off: .035 });
          Q(u - rr, y0, u + rr, y1, gl, { glow: litW, off: .045 });
          Q(u - rr - .2, y1 + .08, u + rr + .2, y1 + .36, o.hood || stone, { off: .05 });
          Q(u - .1, y1 + .06, u + .1, y1 + .42, mix(o.hood || stone, "#ffffff", .25), { off: .055 });
        }
        if (!litW) Q(u - rr, (y0 + y1) / 2, u, y1, NIGHT ? "#4a5a78" : "#a8bccc", { op: .3, off: .06 });
        else if (rb() < .6) Q(u - rr, y1 - .3 - rb() * .4, u + rr, y1, rb() < .5 ? "#e8a050" : "#d88a68", { glow: true, off: .06 });
        Ln([[u - rr, (y0 + y1) / 2], [u + rr, (y0 + y1) / 2]], trim, .05, { off: .065 });
        Ln([[u, y0], [u, y1]], trim, .035, { off: .065 });
        if (o.winFx) o.winFx(u, y0, y1, rr, ri, k, Q, Pl, Ln, litW);
      } });
      // the storefront: cast-iron frame, display windows, recessed door, transom, sign band
      const wx0 = -hw + .55, wx1 = hw - .55;
      Q(-hw + .3, 0, hw - .3, sf - .05, sfC, { off: .02 });
      [[wx0, dx - .8], [dx + .8, wx1]].forEach(([a, b]) => { if (b - a < .3) return;
        Q(a, .62, b, 3.0, interior, { glow: NIGHT, off: .04 });
        goods(o.goods, a, b, .62, 3.0, Q, Pl, Ln);
        if (!NIGHT) { Pl([[a + .25, .62], [Math.min(b, a + .75), .62], [Math.min(b, a + 1.55), 3.0], [Math.min(b, a + 1.05), 3.0]], "#ffffff", { op: .1, off: .08 });
          Pl([[Math.min(b, a + 1.8), .62], [Math.min(b, a + 1.95), .62], [Math.min(b, a + 2.75), 3.0], [Math.min(b, a + 2.6), 3.0]], "#ffffff", { op: .08, off: .08 }); }
        for (let x = a + 1.5; x < b - .4; x += 1.5) Ln([[x, .62], [x, 3.0]], sfC, .07, { off: .085 });
        Ln([[a, .62], [b, .62], [b, 3.0], [a, 3.0], [a, .62]], sfC, .08, { off: .086 }); });
      Q(-hw + .4, .05, hw - .4, .58, mix(sfC, "#000000", .15), { off: .03 });
      for (let x = -hw + .5; x < hw - .9; x += .9) if (Math.abs(x + .4 - dx) > 1) Ln([[x + .1, .15], [x + .8, .15], [x + .8, .48], [x + .1, .48], [x + .1, .15]], mix(sfC, "#ffffff", .22), .025, { off: .035, op: .7 });
      Q(dx - .72, 0, dx + .72, 2.85, "#16120f", { off: .035 });
      Q(dx - .5, 0, dx + .5, 2.5, o.doorC || "#5a3424", { off: .045 });
      Q(dx - .36, 1.05, dx + .36, 2.32, interior, { off: .05, glow: NIGHT });
      Q(dx - .36, .25, dx + .36, .85, mix(o.doorC || "#5a3424", "#000000", .2), { off: .05 });
      Q(wx0, 3.08, wx1, 3.62, NIGHT ? interior : "#3e4e5c", { glow: NIGHT, off: .04 });
      for (let x = wx0 + .5; x < wx1 - .1; x += .5) Ln([[x, 3.08], [x, 3.62]], sfC, .04, { off: .05 });
      Q(-hw + .3, 3.72, hw - .3, sf - .1, o.sign || sfC, { off: .04 });
      if (o.letters !== false) { let x = -hw + .9 + rb() * .3; const xe = hw - .9;
        while (x < xe) { const lw = .1 + rb() * .2; if (x + lw > xe) break; const tall = rb() < .25 ? .05 : 0; Q(x, 3.86 - tall, x + lw, sf - .24 + tall, o.letC || "#e8c870", { off: .05 }); x += lw + .07 + (rb() < .18 ? .28 : 0); } }
      Ln([[-hw + .25, sf - .02], [hw - .25, sf - .02]], trim, .14, { off: .06 });
      Ln([[-hw + .25, 3.68], [hw - .25, 3.68]], trim, .06, { off: .06 });
      if (o.awn && !NIGHT) Q(-hw + .35, sf - 2.1, hw - .35, sf - .05, "#0c1020", { op: .24, off: .09 });
      if (o.extra) o.extra(Q, Pl, Ln, hw, h, sf);
      faces[0].dec = D;
      if (o.side) faces[3].dec = o.side(P, hw, d, h);
    } });
    // cornice on brackets
    { const cc = BP([0, 0, fz - .28]), corn = o.corn || trim;
      w.box({ x: cc[0], z: cc[2], y: h - .72, yaw, w: o.w + .16, d: .56, h: .72, c: corn, dec: (faces, P) => {
        const D = [], at = (x, y) => P([x, y, -.28 - .03]);
        for (let x = -hw + .2; x < hw; x += .62) D.push({ P: [at(x - .07, .02), at(x + .07, .02), at(x + .07, .42), at(x - .07, .42)], c: mix(corn, "#000000", .32) });
        D.push({ P: [at(-hw - .08, .5), at(hw + .08, .5)], c: mix(corn, "#000000", .25), ln: .04, min: .4 });
        faces[0].dec = D; } }); }
    // awning: a sloped striped canvas with a valance
    if (o.awn) { const aw = hw - .3, ya = sf + .02, yb = sf - .95, out = 1.45, [c1, c2] = o.awn, sw = .32;
      const A = (x, t) => BP([x, ya + (yb - ya) * t, fz - .05 - out * t]), V = (x, y) => BP([x, yb - y, fz - .05 - out]);
      const st = [], vd = [];
      if (c2 !== c1) for (let x = -aw, i = 0; x < aw - .01; x += sw, i++) if (i % 2) { const x1 = Math.min(aw, x + sw);
        st.push({ P: [A(x, 0), A(x1, 0), A(x1, 1), A(x, 1)], c: c2 }); vd.push({ P: [V(x, 0), V(x1, 0), V(x1, .32), V(x, .32)], c: c2 }); }
      w.add([{ P: [A(-aw, 0), A(aw, 0), A(aw, 1), A(-aw, 1)], c: c1, two: true, back: mix(c1, "#000000", .5), dec: st }], { center: BP([0, ya - 1.5, fz + 1]) });
      w.add([{ P: [V(-aw, 0), V(aw, 0), V(aw, .32), V(-aw, .32)], c: c1, dec: vd }], { center: BP([0, yb, fz + 1]) });
      if (o.bulbs) for (let x = -aw + .12; x < aw; x += .3) { const p = V(x, .38); w.sprite({ x: p[0], z: p[2], y: p[1], bias: -.2, fn: bulb }); } }
    // marquee: a lit sign box over the theatre entrance
    if (o.marquee) { const mw = o.w - 1.4, md = 2.3, my = 3.5, mh = 1.0, mc = BP([0, 0, fz - md / 2]);
      w.box({ x: mc[0], z: mc[2], y: my, yaw, w: mw, d: md, h: mh, c: "#e2d2b0", bottom: "#a89878", dec: (faces, P) => {
        const D = [], at = (x, y) => P([x, y, -md / 2 - .03]);
        D.push({ P: [at(-mw / 2 + .25, .2), at(mw / 2 - .25, .2), at(mw / 2 - .25, .82), at(-mw / 2 + .25, .82)], c: NIGHT ? "#fff6e0" : "#f6f1e4", glow: NIGHT });
        [.32, .58].forEach(y => { let x = -mw / 2 + .45; while (x < mw / 2 - .55) { const lw = .08 + rb() * .12;
          D.push({ P: [at(x, y), at(x + lw, y), at(x + lw, y + .14), at(x, y + .14)], c: rb() < .2 ? "#a82a22" : "#2a2a30" }); x += lw + .05 + (rb() < .22 ? .22 : 0); } });
        faces[0].dec = D; } });
      for (let x = -mw / 2 + .1; x <= mw / 2; x += .26) [my + .07, my + mh - .07].forEach(y => { const p = BP([x, y, fz - md - .05]); w.sprite({ x: p[0], z: p[2], y: p[1], bias: -.3, fn: bulb }); }); }
    // pumpkins and mums along the wall
    if (o.props !== false) { const nP = 1 + Math.floor(rp() * 3);
      for (let i = 0; i < nP; i++) { const lx = -hw + .6 + rp() * (o.w - 1.2); if (Math.abs(lx - dx) < 1) continue; const p = BP([lx, 0, fz - .35 - rp() * .3]), sz = .3 + rp() * .22, RAMP = pickPumpkin();
        w.sprite({ x: p[0], z: p[2], y: 0, fn: (px, py, k, fog) => pumpkin(px, py, sz * k / 2, fog, RAMP, false) }); }
      if (rp() < .7) { const lx = dx + (rp() < .5 ? -1.2 : 1.2), p = BP([lx, 0, fz - .4]), hue = ["gold", "rust", "plum", "cream"][Math.floor(rp() * 4)];
        w.sprite({ x: p[0], z: p[2], y: 0, fn: (px, py, k, fog) => mum(px, py, k, fog, hue) }); } }
    if (NIGHT) glows.push([BP([dx, 0, fz - 1.6]), o.w, o.pink]);
    return { BP, fz, hw, dx };
  };
  const bulb = (px, py, k) => NIGHT
    ? `<circle cx="${F(px)}" cy="${F(py)}" r="${F(.3 * k)}" fill="url(#csGlow)" opacity=".9"/><circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(1, .05 * k))}" fill="#fff4cc"/>`
    : `<circle cx="${F(px)}" cy="${F(py)}" r="${F(Math.max(.8, .045 * k))}" fill="${T("#f2ead2")}"/><circle cx="${F(px + .015 * k)}" cy="${F(py - .015 * k)}" r="${F(Math.max(.4, .015 * k))}" fill="#fff"/>`;

  // height cap so roofs stay under the calm text corners (rooflines at y >= ~250 there)
  const cap = (z, hW) => 1.7 + (WY - 252) * z / FL;
  const alongL = (s0, s1) => { const m = (s0 + s1) / 2, p = add2(BND, uL, m); return { x: p[0], z: p[1], yaw: YL, w: s1 - s0, zn: BND[1] + uL[1] * s0 }; };
  const alongR = (s0, s1) => { const m = (s0 + s1) / 2, p = add2(CND, uR, m); return { x: p[0], z: p[1], yaw: YR, w: s1 - s0, zn: CND[1] + uR[1] * s0 }; };

  // left: a row of shops bending away
  const LEFT = [
    [0, 8.6, { wall: "#d6c4a0", trim: "#8a2a22", sfC: "#5a1e1a", sign: "#8a2a22", marquee: true, goods: "plain", letters: false, corn: "#e8dcc0", arch: true, hood: "#8a2a22", upN: 3, h: 7.9 }],
    [8.6, 15.4, { wall: "#d4cab2", trim: "#efe8d8", sfC: "#3a3a38", sign: "#3a3a38", stoneCourse: true, pil: true, goods: "plain", arch: true, upN: 3, h: 8.4, letC: "#d8c890" }],
    [15.4, 21.4, { wall: "#3e5a48", trim: "#e8dcc0", sfC: "#1e2a22", sign: "#7a1e1a", awn: ["#7a1e1a", "#7a1e1a"], goods: "cafe", h: 7.6 }],
    [21.4, 28.6, { wall: "#a8543e", trim: "#efe6d2", sfC: "#2a2a30", sign: "#5a2a4a", awn: ["#5a2a4a", "#e8dcc8"], goods: "plain", arch: true, h: 8.6 }],
    [28.6, 34.6, { wall: "#d8c08e", trim: "#f2ead8", sfC: "#2a4a5a", sign: "#2a4a5a", awn: ["#2a4a5a", "#2a4a5a"], goods: "books", h: 7.8 }],
    [34.6, 42, { wall: "#8a3428", trim: "#efe6d2", sfC: "#22302a", sign: "#22302a", awn: ["#c86a2a", "#f2e6cc"], goods: "hardware", arch: true, h: 9.0 }],
    [42, 48.4, { wall: "#b8a888", trim: "#f2ead8", sfC: "#3a2a22", sign: "#6a2a1e", awn: ["#3e5a3a", "#e8e0cc"], goods: "plain", h: 8.2 }],
    [48.4, 56.4, { wall: "#7a4636", trim: "#e8dcc0", sfC: "#1e1e24", sign: "#1e1e24", awn: ["#8a1e2a", "#e8dcc8"], goods: "cafe", arch: true, h: 9.4 }],
    [56.4, 63, { wall: "#c8b07a", trim: "#f2ead8", sfC: "#2a3a4a", sign: "#2a3a4a", awn: ["#2a3a4a", "#d8c8a0"], goods: "books", h: 8.6 }],
    [63, 71, { wall: "#9a5a40", trim: "#efe6d2", sfC: "#2a2a24", sign: "#4a3a1e", awn: ["#6a4a1e", "#6a4a1e"], goods: "plain", arch: true, h: 9.8 }],
    [71, 79, { wall: "#c4b8a0", trim: "#f2ead8", sfC: "#3a2a22", sign: "#3a2a22", awn: ["#2e4a3a", "#e8e0cc"], goods: "hardware", h: 9 }],
  ];
  const left = LEFT.map(([s0, s1, o]) => { const g = alongL(s0, s1); return facade({ ...o, ...g, h: Math.min(o.h, cap(g.zn)) }); });
  // centre block: hardware, the candy shop, the bookshop, the corner cafe
  facade({ x: -7, z: 52, w: 6, h: 9.0, wall: "#9a3e2c", trim: "#efe6d0", sfC: "#22382c", sign: "#2e4a38", awn: ["#2e5a40", "#e8e2d0"], goods: "hardware", arch: true, upN: 3, door: -.6 });
  const CW = 9, CH = 10.6, CANDYW = "#f1e6d4", PINK = "#d2607a";
  const candy = facade({ x: .5, z: 52, w: CW, h: CH, sf: 4.3, wall: CANDYW, trim: "#fbf6ee", sfC: PINK, sign: "#f6d8e0", letC: "#c8385a", awn: ["#fbf4f0", "#d8324a"],
    goods: "candy", arch: true, hood: PINK, paint: true, upN: 3, door: 0, doorC: "#c84a66", corn: "#fbf6ee", frieze: "#f6d8e0", props: false, bulbs: true, pink: true, inC: "#ffd0b8",
    winFx: (u, y0, y1, rr, ri, k, Q, Pl, Ln, litW) => {
      const bat = (bx, by, s) => Pl([[bx, by], [bx - .1 * s, by + .07 * s], [bx - .22 * s, by + .04 * s], [bx - .16 * s, by - .01 * s], [bx - .2 * s, by - .06 * s], [bx - .08 * s, by - .03 * s], [bx, by - .08 * s], [bx + .08 * s, by - .03 * s], [bx + .2 * s, by - .06 * s], [bx + .16 * s, by - .01 * s], [bx + .22 * s, by + .04 * s], [bx + .1 * s, by + .07 * s]], "#14101a", { off: .075 });
      if (ri === 1) { bat(u - .2, y1 - .25, 1); bat(u + .18, y1 - .55, .8); if (k !== 1) bat(u + .05, y0 + .35, .7); }
      if (ri === 0 && k === 0) {   // a paper ghost taped to the glass
        Pl([[u - .26, y0 + .25], [u - .24, y0 + 1.0], ...Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1 - i / 8); return [u + Math.cos(a) * .25, y0 + 1.0 + Math.sin(a) * .3]; }), [u + .26, y0 + .25], [u + .17, y0 + .33], [u + .09, y0 + .22], [u, y0 + .33], [u - .09, y0 + .22], [u - .17, y0 + .33]], "#fbf8f2", { off: .075, glow: NIGHT });
        Pl(circ(u - .09, y0 + 1.0, .045, 8), "#1a1418", { off: .08 }); Pl(circ(u + .09, y0 + 1.0, .045, 8), "#1a1418", { off: .08 });
        Pl([[u - .05, y0 + .78], [u + .05, y0 + .78], [u + .04, y0 + .9], [u - .04, y0 + .9]], "#1a1418", { off: .08 }); }
    },
    extra: (Q, Pl, Ln, hw, h, sf) => {
      // pink pilasters with white capitals at the corners and between the bays
      [-hw, -1.55, 1.55, hw - .32].forEach(x => { Q(x, sf, x + .32, h - 1.25, "#f6d8e0", { off: .028 }); Q(x - .06, h - 1.55, x + .38, h - 1.25, "#fbf6ee", { off: .03 }); });
    } });
  // the candy shop's pediment, its swirl-lollipop medallion and the pennant bunting
  { const { BP, fz } = candy, h = CH, at = (x, y, off = .02) => BP([x, y, fz - off]);
    const pts = [[-3.0, h], [3.0, h], [3.0, h + .55], [2.4, h + .55]];
    for (let i = 0; i <= 12; i++) { const a = Math.PI * i / 12; pts.push([Math.cos(a) * 2.4, h + .55 + Math.sin(a) * .85]); }
    pts.push([-2.4, h + .55], [-3.0, h + .55]);
    const dec = [];
    const P3 = (p, off) => p.map(([x, y]) => at(x, y, off));
    dec.push({ P: P3([[-3.0, h + .44], [3.0, h + .44], [3.0, h + .56], [-3.0, h + .56]], .03), c: "#d2607a" });
    dec.push({ P: P3(circ(0, h + .78, .62, 26), .03), c: "#fbf6ee" });
    dec.push({ P: P3(circ(0, h + .78, .54, 26), .035), c: "#e8384e" });
    dec.push({ P: P3(spiral(0, h + .78, .52), .04), c: "#fff4ee", ln: .1, min: .6 });
    dec.push({ P: P3(circ(-.18, h + .98, .08, 10), .045), c: "#ffffff", op: .55 });
    dec.push({ P: P3([[-2.4, h + .55], [-1.1, h + 1.3]], .03), c: "#d2607a", ln: .09, min: .5 });
    dec.push({ P: P3([[2.4, h + .55], [1.1, h + 1.3]], .03), c: "#d2607a", ln: .09, min: .5 });
    w.add([{ P: P3(pts, 0), c: CANDYW, dec }], { center: BP([0, h, fz + 2]) });
    // finial urns on the corners
    [-2.85, 2.85].forEach(x => { const p = BP([x, 0, fz - .2]); w.cyl({ x: p[0], z: p[2], y: h + .62, r0: .16, r1: .1, h: .45, n: 10, c: "#fbf6ee", bias: -.6 }); w.cyl({ x: p[0], z: p[2], y: h + 1.07, r0: .14, r1: 0, h: .25, n: 10, c: "#d2607a", bias: -.6 }); });
    // bunting: two sagging strings of orange, black and purple pennants above the awning
    const PEN = ["#e86a1e", "#1e1a22", "#7a3aa0"], faces = [];
    [[-4.2, -.05], [-.05, 4.2]].forEach(([x0, x1], si) => { const str = [];
      for (let i = 0; i <= 14; i++) { const t = i / 14, x = x0 + (x1 - x0) * t, y = 5.12 - .32 * Math.sin(t * Math.PI); str.push([x, y]); }
      faces.push({ P: str.map(([x, y]) => at(x, y, .28)), c: "#3a3030", ln: .015, min: .4 });
      for (let i = 0; i < 14; i++) { const [xa, ya] = str[i], [xb, yb] = str[i + 1], xm = (xa + xb) / 2;
        faces.push({ P: [at(xa + .02, ya, .3), at(xb - .02, yb, .3), at(xm, (ya + yb) / 2 - .36, .3)], c: PEN[(i + si) % 3], two: true }); } });
    w.add(faces, { center: BP([0, 4.5, fz + 2]), bias: -.1 });
    // hay bales, pumpkins and mums by the door; a jack-o'-lantern on each bale stack
    const bale = (lx, ly, lz) => { const p = BP([lx, 0, lz]); w.box({ x: p[0], z: p[2], y: ly, w: 1.0, d: .5, h: .42, c: "#d4ba68", top: "#e2ca7a", dec: (fc, P) => {
      [0, 1, 3].forEach(fi => { fc[fi].dec = []; for (let y = .07; y < .42; y += .07) fc[fi].dec.push({ P: [P([-.5, y, -.252]), P([.5, y + (rp() - .5) * .03, -.252])], c: "#a88a44", ln: .012, min: .3, op: .6 });
        fc[fi].dec.push({ P: [P([-.25, 0, -.255]), P([-.25, .42, -.255])], c: "#7a6a3a", ln: .015, min: .4 }, { P: [P([.25, 0, -.255]), P([.25, .42, -.255])], c: "#7a6a3a", ln: .015, min: .4 }); }); } }); };
    [[-2.6, 0], [-1.6, 0], [-2.1, .42]].forEach(([lx, ly]) => bale(lx, ly, fz - .6));
    [[1.6, 0], [2.6, 0], [2.1, .42]].forEach(([lx, ly]) => bale(lx, ly, fz - .6));
    const on = (lx, ly, lz, fn) => { const p = BP([lx, 0, lz]); w.sprite({ x: p[0], z: p[2], y: ly, bias: -.4, fn }); };
    on(-2.1, .84, fz - .62, (px, py, k, fog) => pumpkin(px, py, .26 * k, fog, ORG, true));
    on(2.1, .84, fz - .62, (px, py, k, fog) => pumpkin(px, py, .24 * k, fog, ORG, true));
    on(-1.55, .42, fz - .7, (px, py, k, fog) => mum(px, py, k * .8, fog, "plum"));
    on(1.55, .42, fz - .7, (px, py, k, fog) => mum(px, py, k * .8, fog, "gold"));
    on(-3.5, 0, fz - .7, (px, py, k, fog) => pumpkin(px, py, .3 * k, fog, ORG, false));
    on(-3.0, 0, fz - 1.05, (px, py, k, fog) => pumpkin(px, py, .2 * k, fog, WHT, false));
    on(3.4, 0, fz - .75, (px, py, k, fog) => mum(px, py, k, fog, "rust"));
    on(3.0, 0, fz - 1.1, (px, py, k, fog) => pumpkin(px, py, .22 * k, fog, RED, false));
    on(-1.0, 0, fz - 1.0, (px, py, k, fog) => pumpkin(px, py, .17 * k, fog, ORG, true));
    on(1.0, 0, fz - 1.0, (px, py, k, fog) => pumpkin(px, py, .15 * k, fog, ORG, false));
  }
  facade({ x: 7.5, z: 52, w: 5, h: 7.7, wall: "#c9a476", trim: "#f2ead8", sfC: "#1e2a44", sign: "#24345a", awn: ["#24345a", "#24345a"], goods: "books", upN: 2 });
  facade({ x: 12.5, z: 52, w: 5, h: 7.5, wall: "#5e7c8a", trim: "#efe8d8", sfC: "#efe8d8", sign: "#8a3a2a", awn: ["#c8902a", "#f0e4c8"], goods: "cafe", upN: 2, corn: "#e8e0d0", letC: "#f2e6c8" });
  // right: the corner block across the cross street (its side wall carries a painted jack-o'-lantern), then more shops
  const RIGHT = [
    [0, 9, { wall: "#8a3a2c", trim: "#efe6d2", sfC: "#1e3a2a", sign: "#1e3a2a", awn: ["#1e3a2a", "#e8e0cc"], goods: "plain", arch: true, h: 7.6, d: 18,
      side: (P, hw, d, h) => { const D = [], at = (z, y, of = .03) => P([-hw - of, y, z]);
        const Pz = (pts, c, e = {}) => D.push({ P: pts.map(([z, y]) => at(z, y, e.off ?? .03)), c, op: e.op, glow: e.glow });
        for (let y = .3; y < h - .7; y += .3) D.push({ P: [at(-d / 2, y, .015), at(d / 2, y, .015)], c: mix("#8a3a2c", "#000000", .3), ln: .018, min: .3, op: .28 });
        // the mural: a dusky panel, a big painted jack-o'-lantern, leaves, a crescent and bats
        const zc = -d / 2 + 6.2, yc = 3.7;
        Pz([[zc - 4.2, .9], [zc + 4.2, .9], [zc + 4.2, 6.5], [zc - 4.2, 6.5]], "#3a2a4a");
        Pz([[zc - 4.2, .9], [zc + 4.2, .9], [zc + 4.2, 2.2], [zc - 4.2, 2.2]], "#5a3a3a", { off: .032 });
        Pz(circ(zc + 2.6, 5.5, .55, 16), "#f4e6b0", { off: .034 }); Pz(circ(zc + 2.85, 5.62, .5, 16), "#3a2a4a", { off: .036 });
        const pump = (z0, y0, R, c1, c2) => { Pz(circ(z0, y0, R, 24).map(([z, y]) => [z, y0 + (y - y0) * .78]), c1, { off: .04 });
          [-.55, 0, .55].forEach(u => Pz(circ(z0 + u * R, y0, R * .45, 18).map(([z, y]) => [z, y0 + (y - y0) * 1.72]), c2, { off: .042 })); };
        pump(zc, yc, 1.9, "#c8561a", "#e8782a");
        Pz([[zc - .14, yc + 1.4], [zc + .14, yc + 1.4], [zc + .3, yc + 2.0], [zc + .05, yc + 2.0]], "#4a5a26", { off: .045 });
        Pz([[zc - 1.0, yc + .2], [zc - .4, yc + .2], [zc - .7, yc + .75]], "#2a1408", { off: .046 }); Pz([[zc + .4, yc + .2], [zc + 1.0, yc + .2], [zc + .7, yc + .75]], "#2a1408", { off: .046 });
        Pz([[zc - 1.2, yc - .25], [zc - .8, yc - .5], [zc - .5, yc - .3], [zc - .2, yc - .55], [zc + .2, yc - .3], [zc + .5, yc - .55], [zc + .8, yc - .3], [zc + 1.2, yc - .25], [zc + .7, yc - .95], [zc - .7, yc - .95]], "#2a1408", { off: .046 });
        pump(zc - 3.1, 1.75, .7, "#d8661e", "#f08a32"); pump(zc + 3.2, 1.6, .55, "#e8dcc0", "#f8f0dc");
        [[zc - 2.6, 5.4], [zc - 1.6, 5.9], [zc + 1.5, 5.1]].forEach(([z0, y0]) => Pz([[z0, y0], [z0 - .3, y0 + .2], [z0 - .6, y0 + .1], [z0 - .45, y0 - .05], [z0, y0 - .2], [z0 + .45, y0 - .05], [z0 + .6, y0 + .1], [z0 + .3, y0 + .2]], "#120e18", { off: .046 }));
        // side windows beyond the mural
        for (let z = zc + 5.2; z < d / 2 - .8; z += 2.4) { const lt = NIGHT && rb() < .5;
          D.push({ P: [at(z - .5, 4.9, .04), at(z + .5, 4.9, .04), at(z + .5, 6.5, .04), at(z - .5, 6.5, .04)], c: "#ddd2ba" });
          D.push({ P: [at(z - .4, 5.0, .05), at(z + .4, 5.0, .05), at(z + .4, 6.4, .05), at(z - .4, 6.4, .05)], c: lt ? "#ffc868" : glassD, glow: lt });
          D.push({ P: [at(z - .4, 2.0, .04), at(z + .4, 2.0, .04), at(z + .4, 3.3, .04), at(z - .4, 3.3, .04)], c: lt ? "#ffd890" : glassD, glow: lt }); }
        return D; } }],
    [9, 17, { wall: "#c49a6a", trim: "#f2ead8", sfC: "#3a2a22", sign: "#6a2a1e", awn: ["#6a2a1e", "#e8dcc8"], goods: "gifts", h: 8 }],
    [17, 24, { wall: "#6a4a3a", trim: "#e8dcc0", sfC: "#22302a", sign: "#22302a", awn: ["#2e5a40", "#2e5a40"], goods: "hardware", arch: true, h: 8.4 }],
    [24, 32, { wall: "#d0c0a0", trim: "#f2ead8", sfC: "#2a3a4a", sign: "#2a3a4a", awn: ["#c86a2a", "#f2e6cc"], goods: "books", h: 8.8 }],
    [32, 40, { wall: "#9a4434", trim: "#efe6d2", sfC: "#2a2a30", sign: "#2a2a30", awn: ["#5a2a4a", "#5a2a4a"], goods: "cafe", h: 9 }],
  ];
  RIGHT.forEach(([s0, s1, o]) => { const g = alongR(s0, s1); facade({ ...o, ...g, h: Math.min(o.h, cap(g.zn)) }); });

  /* ---------- street furniture: lamps with corn shocks and banners, street maples ---------- */
  const lamp = (px, py, k, fog) => {
    const C = c => fogC(c, fog), m = v => v * k; let g = "";
    g += `<ellipse cx="${F(px - m(.35))}" cy="${F(py)}" rx="${F(m(.5))}" ry="${F(Math.max(.8, m(.05)))}" fill="#000" opacity=".25"/>`;
    g += `<path d="M${F(px - m(.17))},${F(py)} L${F(px + m(.17))},${F(py)} L${F(px + m(.11))},${F(py - m(.75))} L${F(px - m(.11))},${F(py - m(.75))}Z" fill="${C("#26382e")}"/>`;
    g += `<rect x="${F(px - m(.055))}" y="${F(py - m(3.7))}" width="${F(m(.11))}" height="${F(m(2.96))}" fill="${C("#22342a")}"/><rect x="${F(px + m(.01))}" y="${F(py - m(3.7))}" width="${F(m(.035))}" height="${F(m(2.96))}" fill="${C("#4a6656")}"/>`;
    // the banner: orange with a black cat-free pumpkin shape
    g += `<path d="M${F(px)},${F(py - m(3.35))} L${F(px - m(.78))},${F(py - m(3.35))}" stroke="${C("#22342a")}" stroke-width="${F(Math.max(.8, m(.05)))}"/>`;
    g += `<path d="M${F(px - m(.72))},${F(py - m(3.3))} L${F(px - m(.14))},${F(py - m(3.3))} L${F(px - m(.14))},${F(py - m(2.0))} L${F(px - m(.43))},${F(py - m(2.15))} L${F(px - m(.72))},${F(py - m(2.0))}Z" fill="${C("#e0721e")}"/><path d="M${F(px - m(.3))},${F(py - m(3.3))} L${F(px - m(.14))},${F(py - m(3.3))} L${F(px - m(.14))},${F(py - m(2.0))} L${F(px - m(.3))},${F(py - m(2.08))}Z" fill="${C("#f49a40")}" opacity=".8"/>`;
    g += `<ellipse cx="${F(px - m(.43))}" cy="${F(py - m(2.62))}" rx="${F(m(.19))}" ry="${F(m(.15))}" fill="${C("#2a160c")}"/><rect x="${F(px - m(.45))}" y="${F(py - m(2.86))}" width="${F(m(.04))}" height="${F(m(.1))}" fill="${C("#2a160c")}"/>`;
    // the acorn lantern
    g += `<path d="M${F(px - m(.16))},${F(py - m(3.7))} L${F(px + m(.16))},${F(py - m(3.7))} L${F(px + m(.1))},${F(py - m(3.82))} L${F(px - m(.1))},${F(py - m(3.82))}Z" fill="${C("#22342a")}"/>`;
    g += `<ellipse cx="${F(px)}" cy="${F(py - m(4.08))}" rx="${F(m(.19))}" ry="${F(m(.28))}" fill="${NIGHT ? "#fff2c8" : C("#e8e4d6")}"/>`;
    if (!NIGHT) g += `<ellipse cx="${F(px + m(.06))}" cy="${F(py - m(4.14))}" rx="${F(m(.07))}" ry="${F(m(.16))}" fill="#ffffff" opacity=".7"/><ellipse cx="${F(px - m(.08))}" cy="${F(py - m(4.0))}" rx="${F(m(.08))}" ry="${F(m(.2))}" fill="#8a8a90" opacity=".35"/>`;
    g += `<path d="M${F(px - m(.2))},${F(py - m(4.3))} Q${F(px)},${F(py - m(4.52))} ${F(px + m(.2))},${F(py - m(4.3))}Z" fill="${C("#22342a")}"/><rect x="${F(px - m(.02))}" y="${F(py - m(4.68))}" width="${F(m(.04))}" height="${F(m(.22))}" fill="${C("#22342a")}"/>`;
    if (NIGHT) g += `<circle cx="${F(px)}" cy="${F(py - m(4.08))}" r="${F(m(1.5))}" fill="url(#csGlow)" opacity=".9"/>`;
    g += shock(px, py, m(1.7), fog);
    return g; };
  const lamps = [];
  const placeLamp = (sg, a) => { const [x, z] = pointAt(sg, a, 3.9); lamps.push([x, z]); w.sprite({ x, z, y: 0, fn: lamp }); };
  [["C", 3.5], ["C", 17.5], ["C", 33.2], ["L", 9], ["L", 25], ["L", 41], ["L", 57], ["L", 73], ["R", 10], ["R", 26]].forEach(([sg, a]) => placeLamp(sg, a));
  const streetTree = (sg, a, hM) => { const [x, z] = pointAt(sg, a, 3.0), RAMP = pickRamp(r() * .6), h = Math.min(hM, room(x, z)), rr = rng(seed + Math.round(a * 13) + sg.charCodeAt(0));
    w.box({ x, z, y: 0, w: 1.2, d: 1.2, h: .03, c: "#4a4440", noRefl: true });
    w.sprite({ x, z, y: 0, bias: -.05, fn: (px, py, k, fog) => broadleaf(px, py, h * k, RAMP, fog, Math.min(240, Math.round(h * k * .7)), rr) }); };
  streetTree("C", .6, 8.2); streetTree("C", 22, 8.0); streetTree("L", 17.5, 9); streetTree("L", 33, 9.5); streetTree("L", 50, 10); streetTree("R", 3.4, 8); streetTree("R", 18, 8.5);
  // benches and planters on the far sidewalk
  [["C", 15.2], ["L", 29], ["R", 22]].forEach(([sg, a]) => { const [x, z] = pointAt(sg, a, 2.2), yaw = SEG[sg][3];
    w.box({ x, z, yaw, w: 1.8, d: .45, h: .07, y: .45, c: "#7a5a3a" }); w.box({ x, z: z + .2, yaw, w: 1.8, d: .06, h: .45, y: .55, c: "#6a4a30" });
    [-.8, .8].forEach(dx => w.box({ x: x + dx * Math.cos(yaw * D2R), z: z + dx * Math.sin(yaw * D2R), yaw, w: .06, d: .45, h: .45, c: "#1e2622" })); });

  /* ---------------- assemble ---------------- */
  s += G;
  s += w.draw({ where: o => o.tag === "far" });
  s += `<rect x="0" y="${WY - 120}" width="${W}" height="170" fill="url(#csHaze)" opacity="${NIGHT ? .35 : .4}"/>`;
  s += w.draw({ where: o => o.tag !== "far" });
  if (NIGHT) {
    // light spill: shop windows and lamp pools on the sidewalk and street
    s += `<g style="mix-blend-mode:screen">`;
    glows.forEach(([p, wd, pink]) => { const q = w.proj(p), k = FL / p[2]; s += `<ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(k * wd * .55)}" ry="${F(k * .5)}" fill="url(#${pink ? "csPink" : "csWarm"})" opacity=".9"/>`; });
    lamps.forEach(([x, z]) => { const q = pr(x, z), k = FL / z; s += `<ellipse cx="${F(q[0])}" cy="${F(q[1])}" rx="${F(k * 3.2)}" ry="${F(k * .5)}" fill="url(#csWarm)" opacity=".8"/>`; });
    s += `</g>`;
    // a spotlight on the mural
    { const p = w.proj([23.9, 7.0, 55]); s += `<circle cx="${F(p[0])}" cy="${F(p[1])}" r="14" fill="url(#csGlow)"/>`; }
  }
  // grass and leaves at the bottom corners, under the cards
  const tuft = (x0, x1) => { let g = "";
    for (let i = 0; i < 80; i++) { const x = x0 + r() * (x1 - x0), y = 702 + r() * 30, hh = 30 + r() * 60, bend = (r() - .5) * 30;
      g += `<path d="M${F(x)},${F(y)} q${F(bend * .3)},${F(-hh * .5)} ${F(bend)},${F(-hh)}" stroke="${T(r() < .5 ? "#5a7a32" : "#8aa24c")}" stroke-width="${F(1.6 + r() * 2)}" fill="none" stroke-linecap="round"/>`; }
    for (let i = 0; i < 40; i++) { const cx = x0 + r() * (x1 - x0), cy = 690 + r() * 30;
      g += `<ellipse cx="${F(cx)}" cy="${F(cy)}" rx="${F(5 + r() * 5)}" ry="${F(2 + r() * 2)}" fill="${T(LEAF[Math.floor(r() * LEAF.length)])}" transform="rotate(${F((r() - .5) * 60)} ${F(cx)} ${F(cy)})"/>`; }
    return g; };
  s += tuft(0, 320) + tuft(2240, 2560);

  if (!NIGHT) s += `<rect width="${W}" height="${H}" fill="url(#csLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a0c30" opacity=".06"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#csPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
