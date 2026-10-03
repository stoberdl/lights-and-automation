/* Golden Aspen Lake: a high mountain lake in late September. A snow-dusted
   granite massif rises behind the lake (its summit just left of centre),
   paler ranges behind it; dark spruce slopes are splashed with groves of
   golden aspen and larch. A log cabin and a wooden dock with a red canoe sit
   on the left shore among white-trunked aspens, a larch and boulder point on
   the right, and the still water mirrors all of it.
   The land is a world3d() model (reference/scene-helpers.js): mountains are a
   lit heightfield, so faces, gullies and snow follow the terrain; the cabin,
   dock, canoe, trees and rocks stand at real positions under one eye-level
   camera, and the lake mirrors that same world.
   opts.time === "night": a full moon where the sun was, stars (and their
   reflections), moonlit snow, the cabin's windows lit and a dock lantern.
   Same shape as reference/autumn-valley.js. Needs rng(), mix() and world3d()
   from reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".   */
function goldenAspenLakeArt(opts = {}) {
  const NIGHT = opts.time === "night";
  const seed = opts.seed || 1209;
  const r = rng(seed), rs = rng(seed + 7), rl = rng(seed + 13);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 980, LY = 110, WY = 470;
  const T = c => NIGHT ? mix(mix(c, "#7a7a8a", .4), "#0c1434", .58) : c;
  const RIM = NIGHT ? "#b8c8f4" : "#fff0c8", LAMP = "#ffc868", SHADE = NIGHT ? "#04060e" : "#24283a";
  const cl = v => Math.max(0, Math.min(.999, v));
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
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";

  const SKY_H = NIGHT ? "#34446e" : "#e6e8dc", HZ = NIGHT ? "#2e3c64" : "#d8e0e0";
  const sky = NIGHT
    ? `<stop offset="0" stop-color="#050a1e"/><stop offset=".45" stop-color="#0e1840"/><stop offset=".8" stop-color="#24345c"/><stop offset="1" stop-color="${SKY_H}"/>`
    : `<stop offset="0" stop-color="#2a68b8"/><stop offset=".4" stop-color="#5e9ad6"/><stop offset=".75" stop-color="#a8cce6"/><stop offset="1" stop-color="${SKY_H}"/>`;
  const light = NIGHT
    ? `<stop offset="0" stop-color="#dfe8ff" stop-opacity=".5"/><stop offset=".15" stop-color="#b8c8f0" stop-opacity=".2"/><stop offset=".5" stop-color="#8090c0" stop-opacity=".06"/><stop offset="1" stop-color="#8090c0" stop-opacity="0"/>`
    : `<stop offset="0" stop-color="#fff8e0" stop-opacity=".85"/><stop offset=".18" stop-color="#fff2cc" stop-opacity=".4"/><stop offset=".55" stop-color="#ffe8b0" stop-opacity=".1"/><stop offset="1" stop-color="#ffe8b0" stop-opacity="0"/>`;
  let s = `<defs id="aldefs">
    <linearGradient id="alSky" x1="0" y1="0" x2="0" y2="${WY}" gradientUnits="userSpaceOnUse">${sky}</linearGradient>
    <radialGradient id="alLight" cx="${LX}" cy="${LY}" r="800" gradientUnits="userSpaceOnUse">${light}</radialGradient>
    <linearGradient id="alHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HZ}" stop-opacity="0"/><stop offset=".6" stop-color="${HZ}" stop-opacity=".6"/><stop offset="1" stop-color="${HZ}" stop-opacity="0"/></linearGradient>
    <linearGradient id="alWater" x1="0" y1="${WY}" x2="0" y2="720" gradientUnits="userSpaceOnUse">${NIGHT
      ? `<stop offset="0" stop-color="#2e3e68"/><stop offset=".3" stop-color="#1a2648"/><stop offset="1" stop-color="#0a1028"/>`
      : `<stop offset="0" stop-color="#8ab8c8"/><stop offset=".3" stop-color="#4e8ea4"/><stop offset=".7" stop-color="#2e6478"/><stop offset="1" stop-color="#1c4252"/>`}</linearGradient>
    <radialGradient id="alGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <clipPath id="alCW"><rect x="0" y="${WY}" width="${W}" height="${H - WY}"/></clipPath>
    <filter id="alLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".1" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="alLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="alCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="32" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="alRipple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".003 .08" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".9"/></filter>
    <filter id="alPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="alSoft"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#alSky)"/>`;

  if (NIGHT) {
    for (let i = 0; i < 520; i++) { const x = rs() * W, y = Math.pow(rs(), 1.4) * 400, d = Math.hypot(x - LX, y - LY), big = rs() < .08, o = .25 + rs() * .6 * (1 - y / 460);
      if (d < 170) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.8 : F(.6 + rs() * .6)}" fill="${rs() < .2 ? "#ffe8c8" : "#e8ecff"}" opacity="${F(o)}"/>`; }
    const R = 34;
    s += `<rect width="${W}" height="${H}" fill="url(#alLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 20}" fill="#cfdcff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#f2f5fc"/>`;
    [[-12, -10, 9, 6], [8, -14, 7, 5], [-2, 8, 10, 6], [-17, 12, 5, 5], [15, 6, 5, 8]].forEach(([dx, dy, a, b]) => s += `<path d="${blobP(LX + dx, LY + dy, a, b, 7, rs)}" fill="#9aa4bc" opacity=".22"/>`);
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#alLight)"/><circle cx="${LX}" cy="${LY}" r="38" fill="#fffbec"/>`;
    s += `<g class="rays" opacity=".09" filter="url(#alSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .5 + k * .3, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}"><g filter="url(#alCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    if (NIGHT) {
      for (let k = 0; k < 11; k++) { const t = k / 10; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .04 * (.6 + rs() * .7), w * (.05 + rs() * .045)]); }
      c += `<ellipse cx="${x}" cy="${y}" rx="${F(w * .55)}" ry="${F(w * .03)}" fill="#1a2244"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.4)}" ry="${F(R * .4)}" fill="#26305a"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .35)}" cy="${F(ly - R * .12)}" rx="${F(R * .9)}" ry="${F(R * .16)}" fill="#5a6a9c" opacity=".8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .55)}" cy="${F(ly - R * .16)}" rx="${F(R * .4)}" ry="${F(R * .07)}" fill="#a8b8e4" opacity=".7"/>`);
    } else {
      for (let k = 0; k < 9; k++) { const t = k / 8; lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .12 * (.6 + rs() * .7), w * (.08 + rs() * .06)]); }
      c += `<ellipse cx="${x}" cy="${F(y + w * .05)}" rx="${F(w * .55)}" ry="${F(w * .06)}" fill="#b4c4da"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx - lean * R * .2)}" cy="${F(ly + R * .35)}" rx="${F(R * 1.15)}" ry="${F(R * .7)}" fill="#c6d2e2"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R)}" ry="${F(R * .8)}" fill="#f6f8fa"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .32)}" rx="${F(R * .58)}" ry="${F(R * .36)}" fill="#fffdf4"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(430, 150, 420, "drift1") + cloud(1960, 120, 470, "drift2") + cloud(2380, 210, 260, "drift3") + cloud(1600, 205, 260, "drift1");
  if (!NIGHT) {   // a pair of ravens riding the thermals
    s += `<g class="birds" fill="none" stroke="#2a2a34" stroke-width="2.4" stroke-linecap="round" opacity=".8">`;
    [[1520, 238, 1], [1572, 252, .85]].forEach(([x, y, k]) => s += `<path d="M${F(x - 13 * k)},${F(y - 2 * k)} q${F(7 * k)},${F(-6 * k)} ${F(13 * k)},${F(2 * k)} q${F(6 * k)},${F(-6 * k)} ${F(13 * k)},${F(-2 * k)}"/>`);
    s += `</g>`;
  }
  const cloudPart = s; s = DEFS;

  /* ---------- tree and rock drawings (2D, placed by the 3D world as sprites) ---------- */
  const conifer = (x, y, h, pal) => {
    const sd = LX < x ? -1 : 1; let g = "";
    const trunk = T(pal[0]), dark = T(pal[1]), mid = T(pal[2]), lit = T(pal[3]), hl = T(pal[4]);
    const tw = Math.max(1.5, h * .035), th = h * .12;
    g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .5)},${F(y - h * .95)} L${F(x + tw * .5)},${F(y - h * .95)} L${F(x + tw)},${F(y)}Z" fill="${trunk}"/>`;
    const tiers = Math.max(3, Math.min(12, Math.round(h / 17))), top = y - h, bot = y - th, span = bot - top;
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - span * u * .9, ya = t === tiers - 1 ? top : Math.max(top, yb - span * (.3 - .1 * u)), w = h * (pal.wide || .28) * (1 - u * .8) * (.85 + r() * .3);
      const A = [x + (r() - .5) * w * .08, ya], th2 = yb - ya, m = Math.max(2, Math.round(w / 7)) * 2, edge = [];
      for (let k = 0; k <= m; k++) { const px = x - w + 2 * w * k / m, d = Math.abs(px - x) / w;
        edge.push([px + (r() - .5) * w * .06, yb + (k % 2 ? -th2 * (.12 + r() * .1) : d * th2 * .16 + r() * 2)]); }
      const Lm = [x - w * .3, ya + th2 * .55], Rm = [x + w * .3, ya + th2 * .55];
      if (t > 0 && h > 40) g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mix(dark, "#000000", .4)}" opacity=".55" transform="translate(${F(-sd * th2 * .06)},${F(th2 * .12)})"/>`;
      g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mid}"/>`;
      const shade = sd < 0 ? [A, [x, yb - 2], ...edge.filter(p => p[0] > x), Rm] : [A, Lm, ...edge.filter(p => p[0] < x), [x, yb - 2]];
      g += `<path d="${poly(shade)}" fill="${dark}"/>`;
      const le = edge.filter(p => (p[0] - x) * sd > w * .5); if (sd > 0) le.reverse();
      g += `<path d="${poly([A, sd < 0 ? Lm : Rm, ...le, [x + sd * w * .38, yb - th2 * .3]])}" fill="${lit}"/>`;
      for (let k = 0; k < w / 3; k++) { const py = ya + th2 * (.35 + r() * .6), lim = w * (py - ya) / th2, px = x + (r() - .5) * 2 * lim * .9, s2 = px < x ? -1 : 1;
        g += `<path d="M${F(px)},${F(py)} l${F(s2 * 3.5)},${F(4 + r() * 3)}" stroke="${s2 === sd ? mix(lit, hl, .35) : mix(dark, "#000000", .3)}" stroke-width="1.2" opacity=".7"/>`; }
    }
    return g;
  };
  const SPRUCE = ["#3a2a1e", "#142418", "#1e3424", "#34543a", "#a8b070"];
  const LARCH = ["#4a3220", "#6a4a14", "#a87a1c", "#dcaa30", "#fae08a"];
  const GOLD = ["#4a3a10", "#6e5414", "#94701a", "#b88e22", "#d6aa2c", "#ecc43c", "#f6dc66", "#fdf0a8"];
  const AMBER = ["#4a2a10", "#704014", "#985a1a", "#bc7622", "#d8922a", "#eaae38", "#f6cc5e", "#fde69a"];
  /* aspen: slim white trunk with dark eyes, a narrow crown of small coin-leaf clumps */
  const aspen = (x, y, h, n, RAMP, fog = 0) => {
    const sd = LX < x ? -1 : 1; let g = "", Tf = c => T(mix(c, HZ, fog));
    const tb = Math.max(1.2, h * .022), tt = Math.max(.6, h * .009), ty = y - h * .92;
    g += `<ellipse cx="${F(x - sd * h * .12)}" cy="${F(y + 1)}" rx="${F(h * .2)}" ry="${F(Math.max(1, h * .02))}" fill="#000" opacity=".2"/>`;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tt)},${F(ty)} L${F(x + tt)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${Tf("#ece8dc")}"/>`;
    g += `<path d="M${F(x - sd * tb)},${F(y)} L${F(x - sd * tt)},${F(ty)} L${F(x)},${F(ty)} L${F(x - sd * tb * .1)},${F(y)}Z" fill="${Tf("#a4a296")}"/>`;
    for (let k = 0; k < h / 14; k++) { const py = y - r() * h * .8, w = tb * (1 - (y - py) / h * .6);
      g += `<ellipse cx="${F(x + (r() - .5) * w * .6)}" cy="${F(py)}" rx="${F(w * (.4 + r() * .4))}" ry="${F(.8 + r() * 1.4)}" fill="${Tf("#2a2a2a")}" opacity=".75"/>`; }
    const cx = x, cy = y - h * .62, rx = h * .17, ry = h * .34, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl;
    for (let k = 0; k < 5; k++) { const py = cy + ry * (.6 - k * .25), d = k % 2 ? 1 : -1; g += `<path d="M${F(x)},${F(py + 10)} L${F(x + d * rx * .7)},${F(py - ry * .2)}" stroke="${Tf("#d8d4c8")}" stroke-width="${F(Math.max(.8, h * .006))}"/>`; }
    const cs = [];
    for (let i = 0; i < n * 3 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx, py = cy + (r() * 2 - 1) * ry;
      const e = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2; if (e > 1 || (e > .55 && r() < .35)) continue;
      const nx = (px - cx) / rx, ny = (py - cy) / ry, lit = (nx * ux + ny * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .78 + Math.sqrt(e) * .12 + (r() - .5) * .32), h * (.018 + r() * .016)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = ""; cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${Tf(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#alLeafy)">${cg}</g>`;
  };
  /* small far trees: a spruce spire (lit and shaded halves) or a golden aspen clump */
  const spire = (x, y, sz, fog) => { const lsd = x < LX ? 1 : -1, c = T(mix("#1e3a2a", HZ, fog)), dk = mix(c, "#000000", .3);
    return `<path d="M${F(x)},${F(y - sz * 2.2)} L${F(x + sz * .22)},${F(y - sz * 1.5)} L${F(x + sz * .14)},${F(y - sz * 1.5)} L${F(x + sz * .38)},${F(y - sz * .7)} L${F(x + sz * .26)},${F(y - sz * .7)} L${F(x + sz * .5)},${F(y)} L${F(x - sz * .5)},${F(y)} L${F(x - sz * .26)},${F(y - sz * .7)} L${F(x - sz * .38)},${F(y - sz * .7)} L${F(x - sz * .14)},${F(y - sz * 1.5)} L${F(x - sz * .22)},${F(y - sz * 1.5)}Z" fill="${c}"/>` +
      `<path d="M${F(x)},${F(y - sz * 2.2)} L${F(x - lsd * sz * .22)},${F(y - sz * 1.5)} L${F(x - lsd * sz * .14)},${F(y - sz * 1.5)} L${F(x - lsd * sz * .38)},${F(y - sz * .7)} L${F(x - lsd * sz * .26)},${F(y - sz * .7)} L${F(x - lsd * sz * .5)},${F(y)} L${F(x)},${F(y)}Z" fill="${dk}"/>`; };
  const clump = (x, y, sz, fog, RAMP) => { const lsd = x < LX ? 1 : -1, c = T(mix(RAMP[Math.min(RAMP.length - 1, 3 + Math.floor(r() * 4))], HZ, fog)), dk = mix(c, NIGHT ? "#050814" : "#3a2a08", .38), lt = mix(c, RIM, NIGHT ? .2 : .35);
    return `<path d="${blobP(x - lsd * sz * .1, y - sz * .5, sz * .42, sz * .78, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz * .62, sz * .36, sz * .66, 7)}" fill="${c}"/><path d="${blobP(x + lsd * sz * .14, y - sz * .9, sz * .18, sz * .32, 6)}" fill="${lt}"/>`; };
  /* a granite boulder seen side-on: flat base, rounded top, lit cap toward the light, shaded lower front */
  const GR = ["#3e3c40", "#6e6a6a", "#9c968e", "#cfc8bc"];
  const boulder = (x, y, w, hh, fog = 0) => {
    const ls = LX < x ? -1 : 1, n = 10, P = [[x - w / 2, y]], Tf = c => T(mix(c, HZ, fog));
    for (let k = 1; k < n; k++) { const t = k / n; P.push([x - w / 2 + w * t + (r() - .5) * w * .05, y - Math.pow(Math.sin(Math.PI * t), .55) * hh * (.86 + r() * .2)]); }
    P.push([x + w / 2, y]);
    let g = `<ellipse cx="${F(x)}" cy="${F(y + 1)}" rx="${F(w * .56)}" ry="${F(Math.max(1.5, w * .04))}" fill="#000" opacity=".25"/>`;
    g += `<path d="${poly(P)}" fill="${Tf(mix(GR[1], GR[2], r() * .3))}"/>`;
    const top = P.slice(1, n), lit = top.filter(([px]) => (px - x) * ls > -w * .3);
    g += `<path d="${poly([...lit, ...lit.slice().reverse().map(([px, py]) => [px - ls * w * .03, py + hh * .26])])}" fill="${Tf(GR[2])}"/>`;
    const hi = lit.filter(([px]) => (px - x) * ls > w * .05);
    if (hi.length > 1) g += `<path d="${poly([...hi, ...hi.slice().reverse().map(([px, py]) => [px, py + hh * .09])])}" fill="${Tf(GR[3])}" opacity=".8"/>`;
    g += `<path d="${poly(P.map(([px, py]) => [px, Math.max(py, y - hh * .4)]))}" fill="${Tf(GR[0])}" opacity=".5"/>`;
    const dk = P.filter(([px]) => (px - x) * ls < -w * .22);
    if (dk.length > 1) g += `<path d="${poly([...dk, [x - ls * w * .22, y]])}" fill="${Tf(GR[0])}" opacity=".45"/>`;
    if (r() < .5) g += `<ellipse cx="${F(x + ls * w * .1)}" cy="${F(y - hh * .75)}" rx="${F(w * .12)}" ry="${F(hh * .06)}" fill="${Tf(r() < .5 ? "#a8b070" : "#d8b050")}" opacity=".6"/>`;
    return g; };

  /* ================= the 3D world =================
     Eye 4 m above the water, horizon on WY; metres, x right, y up, z away.
     The lake fills a basin between the left shore (cabin), the right shore
     (larches), our own near shore and the far shore at the mountains' foot. */
  const EYE = 4;
  const w = world3d({ h: EYE, hy: WY, f: 2200, light: [-.62, .55, -.3], tone: T, fog: HZ, fogK: .00008,
    shadow: SHADE, rim: RIM, shade: .55, hi: .25, night: NIGHT, lamp: LAMP });
  const sm = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const n2 = (x, z) => Math.sin(x / 23 + 1.3) * Math.sin(z / 31 + .7) + .5 * Math.sin(x / 9.7 + z / 13.1 + 2) + .25 * Math.sin(x / 4.1 - z / 5.3);
  const ridged = v => (1.04 - Math.sqrt(Math.sin(v) ** 2 + .04)) / .84;     // crests rounded just enough not to alias on the mesh
  const sx = (x, z) => 1280 + 2200 * x / z;
  const xL = z => -.2 * z - 6 + 5 * Math.sin(z / 23) + 3 * Math.sin(z / 9 + 1);
  const xR = z => .22 * z + 24 + 6 * Math.sin(z / 29 + 2) + 3 * Math.sin(z / 11);
  const zF = x => 1350 + 160 * Math.sin(x / 380 + .6) + 50 * Math.sin(x / 120);
  const zN = x => 46 + 4 * Math.sin(x / 13) + 2 * Math.sin(x / 5.3) + Math.max(0, Math.abs(x) - 11) * .9;
  const dist = (x, z) => Math.max(xL(z) - x, x - xR(z), z - zF(x), zN(x) - z);
  /* mountains: a front massif (summit left of centre) whose spurs and gullies fan down from the
     peaks, and a paler second range behind; heights tuned so the text corners stay sky */
  const crest = x => 170 + 70 * ridged(x / 520 + 1.1) + 40 * ridged(x / 210 + .4) + 400 * Math.exp(-(((x + 220) / 470) ** 2)) + 120 * Math.exp(-(((x - 380) / 260) ** 2));
  const mtn = (x, z) => { const d = z - zF(x); if (d <= 0) return 0;
    const zc = 4300 + 700 * Math.sin(x / 1300 + 1), u = d / (zc - zF(x));
    const prof = u < 1 ? sm(u) * (.55 + .45 * u) : 1 - .55 * sm((u - 1) / .5);
    const xa = x + .2 * (z - zc) * Math.sin(x / 640 + .3);                             // spurs fan out from the summits
    const spur = 1 + (.34 * (ridged(xa / 150) - .5) + .14 * (ridged(xa / 57 + z / 700 + 2) - .5)) * (.3 + .7 * u);
    const back = (330 + 210 * ridged(x / 900 + .2) + 130 * ridged(x / 330 + 2)) * Math.exp(-(((z - 10500) / 2600) ** 2));
    return Math.max(crest(x) * prof * spur, back * (1 + .12 * (ridged(x / 120 + z / 900) - .5))) + 25 * sm(d / 200); };
  const hT = (x, z) => { const d = dist(x, z); if (d < 0) return d * .25 - .3;
    const nearF = sm((z - 30) / 50);                                     // our own shore stays low, below the eye
    return .9 * sm(d / 5) + (3.2 * sm(d / 60) + .7 * n2(x, z) * sm(d / 12)) * nearF + .2 * n2(x * 2, z * 2) + mtn(x, z); };

  /* colour: shore grass and gravel near, spruce forest with aspen groves on the lower slopes,
     granite above the trees, snow on the high ground (lower on the shaded faces) */
  const GRASS = ["#a89a58", "#9a8c4a", "#b4a462", "#8a7c40"];
  const ROCK = ["#8a8484", "#a49c94", "#b8b0a4", "#7a7680", "#c4bcb0"];
  const col = (x, y, z, n) => { const k = cl(.5 + .3 * n2(x * .37 + 11, z * .29) + (r() - .5) * .04);
    if (z < zF(x) + 10 || y < 6) {
      if (y < .5) return mix("#5a5040", "#7a6e58", k);                                          // wet gravel at the waterline
      return mix(GRASS[Math.floor(k * GRASS.length)], "#6a6a38", sm((z - 300) / 600) * .5); }
    // every band blends smoothly (no thresholds), so faces read as terrain, not as a mosaic
    const km = cl(.5 + .32 * n2(x * .011 + 5, z * .009) + .12 * n2(x * .05, z * .04));
    const g1 = n2(x * .021 + 3, z * .017), shadeF = sm(n[0] * 4 + .3);
    const snowAt = 540 + 80 * n2(x * .013, z * .011) - shadeF * 110 - (1 - n[1]) * 70;
    const sw = sm((y - snowAt) / 35) * sm((n[1] - .22) / .2);
    const rockC = mix(mix("#5e5a66", "#9a9088", km), "#b4a898", sm((n[1] - .6) / .3) * .35);
    const tl = 190 + 60 * g1, fw = sm((tl - y) / 45) * sm((n[1] - .38) / .15);
    const goldW = sm((n2(x * .045 + 7, z * .03) + .3 * Math.sin(x / 140) - .3) / .4);
    const forestC = mix(mix("#1c3222", "#30503a", km), mix(GOLD[5], "#7a6018", .25 + .2 * km), goldW * .85);
    return mix(mix(rockC, forestC, fw), mix("#f6f8fc", "#cdd6e8", shadeF), sw); };
  w.terrain({ x0: z => -z * .62 - 20, x1: z => z * .62 + 20, z0: 12, z1: 1260, nx: 150, nz: 80, h: hT, col, shade: .35 });
  /* the ranges: per-pixel raster terrain (world3d raster + mountainField), so faces, gullies,
     tree line and snow follow real slopes instead of flat facets */
  const MF = mountainField({ seed: 41, scale: 1000, oct: 6, peaks: [
    { x: -120, z: 3700, h: 380, rx: 1300, rz: 900 }, { x: 1000, z: 4300, h: 300, rx: 1200, rz: 850 },
    { x: -2100, z: 6200, h: 330, r: 1600 }, { x: 2300, z: 7000, h: 560, rx: 1900, rz: 1400 }, { x: 400, z: 9500, h: 680, r: 2300 } ] });
  const hM = (x, z) => { const d = z - zF(x); if (d <= 0) return -1; return MF(x, z) * sm(d / 500) + 30 * sm(d / 150); };
  w.raster({ z0: 1150, z1: 16000, step: .0011, scale: .75, top: 120, bottom: WY + 30, h: hM, tone: rgbTone(T), fog: HZ, fogK: .00009, amb: .42,
    col: mountainColor({ seed: 41, snow: 430, tree: 230, goldK: .8, forest: "#2a4630", gold: "#d4a830", rock: "#8e8680", rock2: "#5a5660" }) });

  /* the far shore's forest edge: a band of spruce spires and gold aspen clumps at the mountains' foot */
  for (let k = 0; k < 2600; k++) { const x = (r() - .5) * 3400, z = zF(x) + 10 + Math.pow(r(), 1.8) * 380, X = sx(x, z);
    if (X < -20 || X > W + 20) continue;
    const y0 = hT(x, z); if (y0 > 170 + 50 * n2(x * .021 + 3, z * .017)) continue;
    const gold = n2(x * .045 + 7, z * .03) + .3 * Math.sin(x / 140) > .62 || r() < .07, hM = 9 + r() * 8;
    w.sprite({ x, z, y: y0 - .5, tag: "m", fn: (px, py, kk, fog) => gold && r() < .6 ? clump(px, py, hM * kk * .32, fog, r() < .6 ? GOLD : LARCH) : spire(px, py, hM * kk * .42, fog) }); }

  /* the shores: aspens, larches and spruce; heights capped where they would reach the text corners */
  const cap = (x, z, y0) => { const X = sx(x, z); return (X < 900 || X > 1500) ? (WY - 272) * z / 2200 + EYE - y0 : 99; };
  const ok = [];
  const free = (x, z, R) => ok.every(([a, b, q]) => Math.hypot(x - a, z - b) > R + q);
  const shoreTree = (x, z, kind) => { const y0 = hT(x, z); if (y0 < .3) return;
    const hM = Math.min(kind === "aspen" ? 13 + r() * 8 : 11 + r() * 9, cap(x, z, y0)); if (hM < 5) return;
    const RAMP = r() < .7 ? GOLD : AMBER;
    w.sprite({ x, z, y: y0 - .2, fn: (px, py, kk, fog) => { const hp = hM * kk;
      if (hp < 40) return kind === "aspen" ? clump(px, py, hp * .5, fog, RAMP) : spire(px, py, hp * .45, fog);
      if (kind === "aspen") return aspen(px, py, hp, Math.min(150, Math.round(hp * .9)), RAMP, fog * .9);
      const pal = (kind === "larch" ? LARCH : SPRUCE).map(c => mix(c, HZ, fog * .9)); return conifer(px, py, hp, pal); } }); };

  /* ---- the log cabin on the left shore, smoke from its chimney ---- */
  const CX = -45, CZ = 114, onGround = o => { const { P } = w.frame({ ...o, y: 0 }), c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => P([a * o.w / 2, 0, b * o.d / 2]));
    const hs = c.map(p => hT(p[0], p[2])), top = Math.max(...hs), low = Math.min(...hs); return { ...o, y: top, fy: low - top - .3 }; };
  const cab = onGround({ x: CX, z: CZ, yaw: -8, w: 7, d: 6, h: 3, rh: 2.4, gable: false });
  w.house({ ...cab, wall: "#6a4a30", roof: "#3e4a3a", trim: "#8a6444", shut: undefined, chim: .78, chimC: "#7a7470", door: .62, doorC: "#2e1e14", glass: "#3a4a5a", stone: "#6e6a66", rng: rl });
  ok.push([CX, CZ, 7]);
  const chimTop = w.proj([CX + 2.6 * Math.cos(-8 * Math.PI / 180), cab.y + 3 + 2.4 + 1.2, CZ - 2.6 * Math.sin(-8 * Math.PI / 180)]);

  /* ---- the dock: planks on pilings from the shore below the cabin out into the lake ---- */
  const PX0 = -34, PZ0 = 106, PX1 = -13, PZ1 = 96, PL = Math.hypot(PX1 - PX0, PZ1 - PZ0), ux = (PX1 - PX0) / PL, uz = (PZ1 - PZ0) / PL;
  const pYaw = Math.atan2(uz, ux) * 180 / Math.PI, PW = 2.2, DY = .8;
  const pAt = (t, o) => [PX0 + ux * t - uz * o, PZ0 + uz * t + ux * o];
  const WOODT = ["#a88a66", "#9a7e5c", "#b0946e"], WOODD = "#4a3828";
  for (let t = 0; t < PL - .1; t += 2) { const [x, z] = pAt(t + 1, 0);
    w.box({ x, z, y: DY, yaw: pYaw, w: 2.02, d: PW, h: .18, c: "#6e5840", top: WOODT[Math.floor(r() * 3)], dec: (fc, P) => {
      fc[4].dec = [1, 2, 3, 4, 5, 6, 7].map(i => ({ P: [P([-1 + i * .25, .19, -PW / 2]), P([-1 + i * .25, .19, PW / 2])], c: WOODD, ln: .02, min: .3, op: .45 })); } }); }
  for (let t = 0; t <= PL; t += 2.5) [-1, 1].forEach(sd => { const [x, z] = pAt(t, sd * (PW / 2 - .08));
    w.cyl({ x, z, y: -1, r0: .11, h: DY + 1.05, n: 7, c: "#4a3a2a", wet: true }); });
  const [LXd, LZd] = pAt(PL - .3, -PW / 2 + .15);
  w.box({ x: LXd, z: LZd, y: DY + .18, w: .1, d: .1, h: 1.4, c: "#2a2a2e" });
  w.box({ x: LXd, z: LZd, y: DY + 1.58, w: .3, d: .3, h: .36, c: NIGHT ? LAMP : "#3a3a40", glow: NIGHT });
  if (NIGHT) w.sprite({ x: LXd, z: LZd - .3, y: DY + 1.76, noRefl: true, bias: -2, fn: (px, py, kk) => `<circle cx="${F(px)}" cy="${F(py)}" r="${F(kk * 3)}" fill="url(#alGlow)" opacity=".75"/>` });

  /* ---- the red canoe tied alongside, on the lake side of the dock ---- */
  { const [cx0, cz0] = pAt(PL * .55, -PW / 2 - .75), { P } = w.frame({ x: cx0, z: cz0, yaw: pYaw + 4 });
    const st = []; for (let i = 0; i <= 12; i++) { const t = i / 6 - 1; st.push([t * 2.6, .46 * Math.pow(Math.max(0, 1 - t * t), .6), .36 + .16 * Math.pow(Math.abs(t), 4)]); }
    const faces = [];
    for (let i = 0; i < st.length - 1; i++) [-1, 1].forEach(sd => { const [a, b] = [st[i], st[i + 1]];
      faces.push({ P: [[a[0], 0, sd * a[1] * .75], [b[0], 0, sd * b[1] * .75], [b[0], b[2], sd * b[1]], [a[0], a[2], sd * a[1]]].map(P), c: "#b83222",
        dec: [{ ln: .04, min: .4, c: "#5a2a1a", P: [[a[0], a[2], sd * a[1] * 1.01], [b[0], b[2], sd * b[1] * 1.01]].map(P) }] }); });
    faces.push({ P: [...st.map(([x, hb, y]) => [x, y - .04, -hb * .92]), ...st.slice().reverse().map(([x, hb, y]) => [x, y - .04, hb * .92])].map(P), c: "#e8c89a", up: true });
    const hull = w.add(faces, { center: P([0, .2, 0]) });
    [-1, 0, 1].forEach(k => { const a = P([k * 1.1, .3, -.4]), b = P([k * 1.1, .3, .4]); w.line([a, b], "#7a5a3a", .06, { bias: -.3 }).key = hull.key - .2; });
    w.line([P([-1.6, .34, -.15]), P([1.3, .38, .2])], "#c8a070", .05, { bias: -.4 }); }

  /* ---- trees: the cabin grove on the left shore, larches and spruce on the right point ---- */
  for (let k = 0; k < 900 && ok.length < 150; k++) { const z = 70 + Math.pow(r(), 1.3) * 900, x = xL(z) - 4 - Math.pow(r(), .8) * (z * .5 + 30);
    if (sx(x, z) < -60 || !free(x, z, 2.2) || dist(x, z) < 3) continue;
    if (Math.hypot(x - CX, z - CZ) < 9 || (z < CZ + 6 && Math.abs(sx(x, z) - sx(CX, CZ)) < 150) ||(x > PX0 - 5 && z < 112 && z > 98)) continue;           // clear the cabin and the dock's landing
    ok.push([x, z, 1.6]); shoreTree(x, z, r() < .75 ? "aspen" : r() < .5 ? "larch" : "spruce"); }
  const nR = ok.length;
  for (let k = 0; k < 900 && ok.length < nR + 130; k++) { const z = 70 + Math.pow(r(), 1.3) * 900, x = xR(z) + 4 + Math.pow(r(), .8) * (z * .5 + 30);
    if (sx(x, z) > W + 60 || !free(x, z, 2.2) || dist(x, z) < 3) continue;
    ok.push([x, z, 1.6]); const q = r(); shoreTree(x, z, q < .45 ? "larch" : q < .65 ? "spruce" : "aspen"); }

  /* ---- boulders along both shores' waterlines and on the near shore ---- */
  const rock = (x, z, wM, kf = .38) => { const y0 = Math.max(0, hT(x, z)) - .15;
    w.sprite({ x, z, y: y0, fn: (px, py, kk, fog) => boulder(px, py, wM * kk, wM * kk * (kf + r() * .14), fog * .8) }); };
  for (let k = 0; k < 160; k++) { const z = 60 + Math.pow(r(), 1.4) * 700, left = r() < .5, x = left ? xL(z) - .5 + r() * 2.5 : xR(z) + .5 - r() * 2.5;
    if (left && z < 112 && z > 98) continue; rock(x, z, .8 + r() * 1.8); }
  for (let k = 0; k < 26; k++) { const x = (r() - .5) * 60, z = zN(x) - 2 - r() * 10; if (Math.abs(sx(x, z) - 1280) < 450) continue; rock(x, z, .5 + r() * 1.1, .45); }

  /* ---- near shore: grass tufts, and amber willow scrub in the bottom corners ---- */
  for (let k = 0; k < 700; k++) { const x = (r() - .5) * 60, z = 32 + r() * (zN(x) - 32); if (dist(x, z) < .5) continue;
    w.sprite({ x, z, y: hT(x, z), fn: (px, py, kk) => { const hh = (.2 + r() * .3) * kk; let g = "";
      for (let i = 0; i < 4; i++) { const bx = px + (r() - .5) * hh * .8; g += `<path d="M${F(bx)},${F(py)} q${F(-2 + r() * 4)},${F(-hh * .6)} ${F(-4 + r() * 8)},${F(-hh)}" stroke="${T(r() < .5 ? "#d8c070" : "#7a6a30")}" stroke-width="${F(Math.max(1.2, kk * .03))}" fill="none" stroke-linecap="round" opacity=".85"/>`; }
      return g; } }); }
  const scrub = (x, z, Rm) => w.sprite({ x, z, y: hT(x, z), fn: (px, py, kk) => { const R = Rm * kk; let b = `<path d="${blobP(px + 6, py - R * .3, R, R * .6)}" fill="${T("#3a2a0c")}"/>`; const cs = [];
    for (let i = 0; i < 260 && cs.length < 90; i++) { const qx = px + (r() * 2 - 1) * R, qy = py - R * .45 + (r() * 2 - 1) * R * .6; if (((qx - px) / R) ** 2 + ((qy - py + R * .45) / (R * .6)) ** 2 > 1) continue;
      const lit = ((LX < px ? -1 : 1) * (qx - px) / R * .5 - (qy - py + R * .45) / (R * .6) * .6) * .5 + .5; cs.push([qx, qy, cl(lit * .85 + (r() - .5) * .3)]); }
    cs.sort((a, c) => a[2] - c[2]); cs.forEach(([qx, qy, v]) => b += `<path d="${blobP(qx, qy, R * .14, R * .1, 6)}" fill="${T(AMBER[Math.floor(v * 8)])}"/>`);
    return `<g filter="url(#alLeafyS)">${b}</g>`; } });
  scrub(-23, 36, 2.6); scrub(23.5, 37, 2.8); scrub(19.5, 33, 1.7);

  /* ---------- the lake: water, the mirrored world, glints; then the world itself ---------- */
  const notM = o => o.tag !== "m", isM = o => o.tag === "m";
  s += `<rect x="0" y="${WY - 1}" width="${W}" height="${H - WY + 1}" fill="url(#alWater)"/>`;
  s += `<g clip-path="url(#alCW)"><g opacity=".62" filter="url(#alRipple)">${w.draw({ mirror: true, where: isM })}${w.draw({ mirror: true, where: notM })}</g></g>`;
  s += `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="url(#alWater)" opacity=".3"/>`;
  if (NIGHT) for (let i = 0; i < 140; i++) { const x = rl() * W, y = WY + 40 + rl() * 220; s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(.5 + rl() * .7)}" fill="#e8ecff" opacity="${F(.15 + rl() * .3)}"/>`; }
  for (let k = 0; k < 140; k++) { const y = WY + 4 + Math.pow(r(), .8) * (H - WY - 4), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(40 + r() * 180 * (.4 + t))}" height="${F(1 + t * 1.2)}" rx="1" fill="${NIGHT ? "#8a9ad0" : "#eaf4f6"}" opacity="${F(.05 + r() * .1)}"/>`; }
  s += `<g filter="url(#alRipple)">`;
  for (let y = WY + 6; y < H; y += 4 + (y - WY) * .025) { const t = (y - WY) / (H - WY), ww = 30 + t * 150, n = 1 + Math.floor(t * 4);
    for (let k = 0; k < n; k++) { const off = (r() * 2 - 1) * ww * Math.pow(r(), .6), L = 8 + r() * (20 + t * 50);
      s += `<rect x="${F(LX + off - L / 2)}" y="${F(y)}" width="${F(L)}" height="${F(1.2 + t * 1.6)}" rx="1" fill="${NIGHT ? "#dce6ff" : "#fffbe8"}" opacity="${F((.6 - Math.abs(off) / ww * .4) * (1 - t * .4))}"/>`; } }
  s += `</g>`;
  s += w.draw({ where: isM });
  s += `<rect x="0" y="400" width="${W}" height="80" fill="url(#alHaze)" opacity=".45"/>`;      // haze between the mountains and the shores
  s += w.draw({ where: notM });
  s += `<g class="smoke" filter="url(#alLeafyS)">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<path d="${blobP(chimTop[0] + k * 7 + Math.sin(k * 1.3) * 3, chimTop[1] - 6 - k * 11, 3 + k * 1.9, 2.5 + k * 1.3, 7, rs)}" fill="${NIGHT ? "#8a94b4" : "#eef0f2"}" opacity="${F(.55 - k * .06)}"/>`).join("")}</g>`;
  if (NIGHT) { const [gx, gy] = w.proj([CX, cab.y + 1.6, CZ - 3]); s += `<circle cx="${F(gx)}" cy="${F(gy)}" r="60" fill="url(#alGlow)" opacity=".5"/>`; }

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#alLight)" style="mix-blend-mode:soft-light"/>`;
  if (NIGHT) s += `<rect width="${W}" height="${H}" fill="#0a1030" opacity=".1"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#alPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
