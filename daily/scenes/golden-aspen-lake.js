/* Golden Aspen Lake: a high mountain lake in late September. A snow-dusted
   granite massif rises behind the lake (its summit just left of centre),
   paler ranges behind it; dark spruce slopes are splashed with groves of
   golden aspen and larch. A log cabin and a wooden dock with a red canoe sit
   on the left shore among white-trunked aspens, a larch and boulder point on
   the right, and the still water mirrors all of it.
   opts.time === "night": a full moon where the sun was, stars (and their
   reflections), moonlit snow, the cabin's windows lit and a dock lantern.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".        */
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
  const angP = (cx, cy, rx, ry, n) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r() * .45, k = .72 + r() * .32; p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return p; };
  const wave = (ph, fr, am) => x => fr.reduce((s, f, i) => s + Math.sin(x / f + ph[i]) * am[i], 0);
  const ridgePath = (fn, close = H, x0 = 0, x1 = W) => { let d = `M${x0},${close} L${x0},${F(fn(x0))}`;
    for (let x = x0; x <= x1; x += 16) d += ` L${x},${F(fn(x))}`; return d + ` L${x1},${F(fn(x1))} L${x1},${close}Z`; };
  const poly = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L") + "Z";
  const line = pts => "M" + pts.map(p => F(p[0]) + "," + F(p[1])).join(" L");

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
    <linearGradient id="alShore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T("#a89a58")}"/><stop offset=".5" stop-color="${T("#86783e")}"/><stop offset="1" stop-color="${T("#5a5228")}"/></linearGradient>
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

  /* ---------- faceted mountains with dusted snow ---------- */
  const cut = (pts, yT) => { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i];
      if (b[1] >= yT) { const t = (yT - a[1]) / (b[1] - a[1] || 1); out.push([a[0] + (b[0] - a[0]) * t, yT]); return out; } out.push(b); } return out; };
  const mountains = (key, o) => {
    const B = o.base + 6, seg = [];
    for (let i = 0; i < key.length - 1; i++) { const [ax, ay] = key[i], [bx, by] = key[i + 1], a = [];
      for (let k = 0; k <= 6; k++) { const t = k / 6, j = k % 6 ? 1 : 0; a.push([ax + (bx - ax) * t + j * (r() - .5) * 12, ay + (by - ay) * t + j * (r() - .5) * Math.abs(bx - ax) * .07]); }
      seg.push(a); }
    let m = `<path d="${poly([[key[0][0], B], ...seg.flat(), [key[key.length - 1][0], B]])}" fill="${o.mid}"/>`;
    for (let i = 1; i < key.length - 1; i++) { if (!key[i][2]) continue;
      const P = key[i], L = key[i - 1], R = key[i + 1], fx = P[0] + (r() - .5) * Math.min(P[0] - L[0], R[0] - P[0]) * .3, Fp = [fx, B];
      const litL = o.lx < P[0], lc = litL ? o.lit : o.dark, rc = litL ? o.dark : o.lit;
      m += `<path d="${poly([...seg[i - 1], Fp])}" fill="${lc}"/><path d="${poly([...seg[i], Fp])}" fill="${rc}"/>`;
      // sub-facets and rock ribs
      m += `<path d="${poly([P, seg[i - 1][3], [(fx + L[0]) / 2, B]])}" fill="${mix(lc, o.mid, .5)}" opacity=".7"/><path d="${poly([P, seg[i][3], [(fx + R[0]) / 2, B]])}" fill="${mix(rc, o.mid, .5)}" opacity=".7"/>`;
      for (let k = 0; k < 4; k++) { const sd = k % 2 ? 1 : -1, t0 = .2 + r() * .4, ex = (sd < 0 ? L[0] : R[0]), sx = P[0] + (ex - P[0]) * t0 * .4, sy = P[1] + (B - P[1]) * t0 * .4;
        m += `<path d="M${F(sx)},${F(sy)} L${F(sx + (ex - P[0]) * .25)},${F(sy + (B - P[1]) * .3)}" stroke="${mix(sd < 0 ? lc : rc, "#000000", .15)}" stroke-width="${F(2 + r() * 2)}" opacity=".3" stroke-linecap="round"/>`; }
      m += `<path d="${line(litL ? seg[i - 1] : seg[i])}" stroke="${o.rim}" stroke-width="2" fill="none" opacity=".5"/>`;
      if (o.snow) {   // snow cap down to a ragged line, lit and shaded halves, plus gully streaks
        const dep = (B - P[1]) * o.snow * (.8 + r() * .4), yT = P[1] + dep;
        const lr = cut([...seg[i - 1]].reverse(), yT), rr = cut(seg[i], yT), lp = lr[lr.length - 1], rp = rr[rr.length - 1];
        const Fs = [P[0] + (fx - P[0]) * dep / (B - P[1]), yT];
        const zig = (a, b, n) => { const z = []; for (let k = 1; k < n; k++) { const t = k / n; z.push([a[0] + (b[0] - a[0]) * t + (r() - .5) * 8, a[1] + (b[1] - a[1]) * t + (k % 2 ? -r() * dep * .22 : r() * dep * .12)]); } return z; };
        const zl = zig(lp, Fs, 9), zr = zig(Fs, rp, 9);
        const sl = litL ? o.snowLit : o.snowDk, sr = litL ? o.snowDk : o.snowLit;
        m += `<path d="${poly([...lr, ...zl, Fs])}" fill="${sl}"/><path d="${poly([P, Fs, ...zr, rp, ...[...rr].reverse()])}" fill="${sr}"/>`;
        // dusting: scattered flecks of snow on ledges below the cap, sloping with the faces
        for (let k = 0; k < 14; k++) { const side = r() < .5 ? -1 : 1, base = side < 0 ? lp : rp, yy = yT + 6 + r() * dep * .8;
          const xx = P[0] + (base[0] - P[0]) * (yy - P[1]) / (yT - P[1]) * (.2 + r() * .65);
          const c = (xx < Fs[0]) ? sl : sr, len = 8 + r() * 12;
          m += `<path d="M${F(xx - len / 2)},${F(yy)} Q${F(xx)},${F(yy - 3)} ${F(xx + len / 2)},${F(yy + side * 2)} Q${F(xx)},${F(yy + 1.5)} ${F(xx - len / 2)},${F(yy)}Z" fill="${c}" opacity=".8"/>`; }
        m += `<path d="${line(litL ? lr : rr)}" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="${NIGHT ? .5 : .8}"/>`;
      }
    }
    return m;
  };

  /* ---------- helpers for trees and rocks ---------- */
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
  const aspen = (x, y, h, n, RAMP) => {
    const sd = LX < x ? -1 : 1; let g = "";
    const tb = Math.max(1.6, h * .022), tt = Math.max(.8, h * .009), ty = y - h * .92;
    g += `<path d="M${F(x - tb)},${F(y)} L${F(x - tt)},${F(ty)} L${F(x + tt)},${F(ty)} L${F(x + tb)},${F(y)}Z" fill="${T("#ece8dc")}"/>`;
    g += `<path d="M${F(x - sd * tb)},${F(y)} L${F(x - sd * tt)},${F(ty)} L${F(x)},${F(ty)} L${F(x - sd * tb * .1)},${F(y)}Z" fill="${T("#a4a296")}"/>`;
    for (let k = 0; k < h / 14; k++) { const py = y - r() * h * .8, w = tb * (1 - (y - py) / h * .6);
      g += `<ellipse cx="${F(x + (r() - .5) * w * .6)}" cy="${F(py)}" rx="${F(w * (.4 + r() * .4))}" ry="${F(.8 + r() * 1.4)}" fill="${T("#2a2a2a")}" opacity=".75"/>`; }
    g += `<path d="M${F(x - tb * .9)},${F(y - 2)} l${F(tb * 1.8)},0" stroke="${T("#3a3424")}" stroke-width="3" opacity=".5"/>`;
    const cx = x, cy = y - h * .62, rx = h * .17, ry = h * .34, dl = Math.hypot(LX - cx, LY - cy), ux = (LX - cx) / dl, uy = (LY - cy) / dl;
    for (let k = 0; k < 5; k++) { const py = cy + ry * (.6 - k * .25), d = k % 2 ? 1 : -1; g += `<path d="M${F(x)},${F(py + 10)} L${F(x + d * rx * .7)},${F(py - ry * .2)}" stroke="${T("#d8d4c8")}" stroke-width="${F(Math.max(.8, h * .006))}"/>`; }
    const cs = [];
    for (let i = 0; i < n * 3 && cs.length < n; i++) { const px = cx + (r() * 2 - 1) * rx, py = cy + (r() * 2 - 1) * ry;
      const e = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2; if (e > 1 || (e > .55 && r() < .35)) continue;
      const nx = (px - cx) / rx, ny = (py - cy) / ry, lit = (nx * ux + ny * uy) * .5 + .5;
      cs.push([px, py, cl(lit * .78 + Math.sqrt(e) * .12 + (r() - .5) * .32), h * (.018 + r() * .016)]); }
    cs.sort((a, b) => a[2] - b[2]);
    let cg = ""; cs.forEach(([px, py, v, R]) => cg += `<path d="${blobP(px, py, R, R * .85, 6)}" fill="${T(RAMP[Math.floor(v * RAMP.length)])}"/>`);
    return g + `<g filter="url(#alLeafy)">${cg}</g>`;
  };
  const GR = ["#3e3c40", "#6e6a6a", "#9c968e", "#cfc8bc"];
  const granite = (x, y, R, flat = .5) => {
    const sd = LX < x ? -1 : 1;
    let g = `<path d="${poly(angP(x, y, R, R * flat, 7))}" fill="${T(GR[0])}"/>`;
    g += `<path d="${poly(angP(x + sd * R * .1, y - R * flat * .22, R * .82, R * flat * .62, 6))}" fill="${T(GR[1])}"/>`;
    g += `<path d="${poly(angP(x + sd * R * .28, y - R * flat * .45, R * .5, R * flat * .32, 5))}" fill="${T(GR[2])}"/>`;
    g += `<path d="${poly(angP(x + sd * R * .38, y - R * flat * .58, R * .22, R * flat * .14, 4))}" fill="${T(GR[3])}" opacity=".85"/>`;
    for (let k = 0; k < 3; k++) if (r() < .5) g += `<ellipse cx="${F(x + (r() - .5) * R)}" cy="${F(y - R * flat * .3)}" rx="${F(2 + r() * 3)}" ry="${F(1 + r())}" fill="${T(r() < .5 ? "#a8b070" : "#d8b050")}" opacity=".6"/>`;
    return g;
  };
  /* mid-distance slope forest: mostly spruce spires, splashed with golden aspen/larch clumps */
  const slopeForest = (fn, x0, x1, rows, size, haze, goldP) => {
    const trees = [];
    for (let row = 0; row < rows; row++) for (let x = x0; x < x1; x += size * (.55 + r() * .4)) {
      const y = fn(x) + row * size * .6 + r() * size * .4, sz = size * (.7 + r() * .5);
      trees.push([x + r() * size * .3, y, sz, goldP(x, y) > r()]); }
    trees.sort((a, b) => a[1] - b[1]);
    let f = "";
    trees.forEach(([x, y, sz, gold]) => { const lsd = x < LX ? 1 : -1;
      if (!gold) { const c = T(mix("#1e3a2a", HZ, haze)), dk = mix(c, "#000000", .3), lt = mix(c, RIM, .18);
        f += `<path d="M${F(x)},${F(y - sz * 2.2)} L${F(x + sz * .22)},${F(y - sz * 1.5)} L${F(x + sz * .14)},${F(y - sz * 1.5)} L${F(x + sz * .38)},${F(y - sz * .7)} L${F(x + sz * .26)},${F(y - sz * .7)} L${F(x + sz * .5)},${F(y)} L${F(x - sz * .5)},${F(y)} L${F(x - sz * .26)},${F(y - sz * .7)} L${F(x - sz * .38)},${F(y - sz * .7)} L${F(x - sz * .14)},${F(y - sz * 1.5)} L${F(x - sz * .22)},${F(y - sz * 1.5)}Z" fill="${c}"/>`;
        f += `<path d="M${F(x)},${F(y - sz * 2.2)} L${F(x - lsd * sz * .22)},${F(y - sz * 1.5)} L${F(x - lsd * sz * .14)},${F(y - sz * 1.5)} L${F(x - lsd * sz * .38)},${F(y - sz * .7)} L${F(x - lsd * sz * .26)},${F(y - sz * .7)} L${F(x - lsd * sz * .5)},${F(y)} L${F(x)},${F(y)}Z" fill="${dk}"/>`;
        f += `<path d="M${F(x)},${F(y - sz * 2.2)} L${F(x + lsd * sz * .22)},${F(y - sz * 1.5)}" stroke="${lt}" stroke-width="1" opacity=".7"/>`; return; }
      const base = GOLD[3 + Math.floor(r() * 4)], c = T(mix(base, HZ, haze)), dk = mix(c, NIGHT ? "#050814" : "#3a2a08", .38), lt = mix(c, RIM, NIGHT ? .2 : .35);
      f += `<path d="${blobP(x - lsd * sz * .1, y - sz * .5, sz * .42, sz * .78, 7)}" fill="${dk}"/><path d="${blobP(x, y - sz * .62, sz * .36, sz * .66, 7)}" fill="${c}"/><path d="${blobP(x + lsd * sz * .14, y - sz * .9, sz * .18, sz * .32, 6)}" fill="${lt}"/>`;
    });
    return f;
  };

  /* ---------- far ranges and the massif ---------- */
  const lit0 = NIGHT ? "#5a6c98" : "#b4c0d6", mid0 = NIGHT ? "#3e4e7a" : "#98a8c4", dk0 = NIGHT ? "#2a3660" : "#8090b0";
  let far = mountains([[-120, 420], [60, 300, 1], [210, 360], [360, 282, 1], [520, 352], [700, 300, 1], [860, 360], [1660, 360], [1820, 296, 1], [1990, 350], [2170, 286, 1], [2330, 344], [2480, 300, 1], [2700, 420]],
    { base: 440, lx: LX, lit: lit0, mid: mid0, dark: dk0, rim: "#ffffff", snow: .22, snowLit: NIGHT ? "#c8d4f0" : "#f4f6fa", snowDk: NIGHT ? "#7a8ab8" : "#c8d2e4" });
  far += `<rect x="0" y="330" width="${W}" height="130" fill="url(#alHaze)" opacity=".7"/>`;
  far += mountains([[560, 450], [760, 330, 1], [900, 380], [1070, 236, 1], [1150, 270], [1290, 150, 1], [1400, 250], [1520, 214, 1], [1640, 300], [1760, 268, 1], [1900, 380], [2020, 450]],
    { base: 456, lx: LX, lit: T("#b0a49a"), mid: T("#847c84"), dark: T("#5e5e76"), rim: RIM, snow: .26, snowLit: NIGHT ? "#d8e2fa" : "#fbfcff", snowDk: NIGHT ? "#8090c0" : "#c4cee4" });
  far += `<rect x="0" y="380" width="${W}" height="90" fill="url(#alHaze)" opacity=".55"/>`;
  // forested lower slopes meeting the lake, gold in patches
  const s1 = wave([2, 4, 1], [180, 80, 34], [16, 7, 3]), s2 = wave([5, 1, 3], [220, 90, 40], [10, 5, 2]);
  const slopeA = x => 418 + s1(x) - Math.max(0, 1 - Math.abs(x - 1290) / 500) * 40, slopeB = x => 446 + s2(x);
  far += `<path d="${ridgePath(slopeA, WY + 2)}" fill="${T(mix("#2a4030", HZ, .3))}"/>`;
  far += `<g filter="url(#alLeafyS)">${slopeForest(slopeA, -10, W + 10, 6, 9, .3, x => .25 + .25 * Math.sin(x / 140))}</g>`;
  far += `<path d="${ridgePath(slopeB, WY + 2)}" fill="${T("#24382a")}"/>`;
  far += `<g filter="url(#alLeafyS)">${slopeForest(slopeB, -10, W + 10, 2, 12, .1, x => .35 + .3 * Math.sin(x / 110 + 2))}</g>`;
  far += `<path d="M0,${WY - 1} L${W},${WY - 1}" stroke="${T("#8a8458")}" stroke-width="2.5" opacity=".7"/>`;
  s += far;

  /* ---------- the lake: a near mirror ---------- */
  s += `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="url(#alWater)"/>`;
  s += `<g clip-path="url(#alCW)"><g transform="matrix(1,0,0,-1,0,${WY * 2})" opacity=".62" filter="url(#alRipple)">${far}</g></g>`;
  s += `<rect x="0" y="${WY}" width="${W}" height="${H - WY}" fill="url(#alWater)" opacity=".35"/>`;
  if (NIGHT) for (let i = 0; i < 140; i++) { const x = rl() * W, y = WY + 40 + rl() * 220; s += `<circle cx="${F(x)}" cy="${F(y)}" r="${F(.5 + rl() * .7)}" fill="#e8ecff" opacity="${F(.15 + rl() * .3)}"/>`; }
  for (let k = 0; k < 140; k++) { const y = WY + 4 + Math.pow(r(), .8) * (H - WY - 4), t = (y - WY) / (H - WY);
    s += `<rect x="${F(r() * W)}" y="${F(y)}" width="${F(40 + r() * 180 * (.4 + t))}" height="${F(1 + t * 1.2)}" rx="1" fill="${NIGHT ? "#8a9ad0" : "#eaf4f6"}" opacity="${F(.05 + r() * .1)}"/>`; }
  s += `<g filter="url(#alRipple)">`;
  for (let y = WY + 6; y < H; y += 4 + (y - WY) * .025) { const t = (y - WY) / (H - WY), w = 30 + t * 150, n = 1 + Math.floor(t * 4);
    for (let k = 0; k < n; k++) { const off = (r() * 2 - 1) * w * Math.pow(r(), .6), L = 8 + r() * (20 + t * 50);
      s += `<rect x="${F(LX + off - L / 2)}" y="${F(y)}" width="${F(L)}" height="${F(1.2 + t * 1.6)}" rx="1" fill="${NIGHT ? "#dce6ff" : "#fffbe8"}" opacity="${F((.6 - Math.abs(off) / w * .4) * (1 - t * .4))}"/>`; } }
  s += `</g>`;

  /* ---------- shores: built once, reflected about their own waterline ---------- */
  const shore = (axis, build) => { const g = build();
    return `<g clip-path="url(#alCW)"><g transform="matrix(1,0,0,-1,0,${axis * 2})" opacity=".5" filter="url(#alRipple)">${g}</g></g>${g}`; };
  const lw = wave([1, 4, 2], [200, 80, 30], [5, 3, 1.5]);
  const wlL = x => 540 - x * .045 + lw(x) * .4;                  // left shore waterline
  const topL = x => 470 - Math.max(0, 1 - x / 700) * 40 + lw(x) + x * .03;
  s += shore(520, () => {
    let g = "", d = `M0,${F(wlL(0))} L0,${F(topL(0))}`;
    for (let x = 0; x <= 900; x += 12) d += ` L${x},${F(Math.min(topL(x), wlL(x)))}`;
    for (let x = 900; x >= 0; x -= 12) d += ` L${x},${F(wlL(x))}`;
    g += `<path d="${d}Z" fill="url(#alShore)"/>`;
    // dark forest behind the grove, then the grove
    g += `<g filter="url(#alLeafyS)">${slopeForest(x => topL(x) - 4, -10, 820, 1, 16, 0, () => .25)}</g>`;
    const items = [];
    for (let x = -10; x < 760; x += 14 + r() * 26) { const y = topL(x) + 14 + r() * Math.max(4, wlL(x) - topL(x) - 30), h = 120 + r() * 90 * (1 - x / 1400);
      items.push([y, r() < .2 ? () => conifer(x, y, h * .8, r() < .5 ? LARCH : SPRUCE) : () => aspen(x, y, h, 140, r() < .7 ? GOLD : AMBER)]); }
    // the log cabin
    items.push([500, () => { let c = ""; const x = 560, y = 500;
      c += `<ellipse cx="${x + 30}" cy="${y + 2}" rx="90" ry="6" fill="#000" opacity=".2"/>`;
      c += `<path d="${poly([[x - 50, y], [x - 50, y - 40], [x + 14, y - 46], [x + 14, y - 4]])}" fill="${T("#6a4a30")}"/><path d="${poly([[x + 14, y - 4], [x + 14, y - 46], [x + 70, y - 52], [x + 70, y - 10]])}" fill="${T("#4e3624")}"/>`;
      for (let k = 0; k < 7; k++) { const v = 5 + k * 6; c += `<path d="M${x - 52},${F(y - v + .5)} L${x + 14},${F(y - v - 5.5)}" stroke="${T(k % 2 ? "#8a6444" : "#7a5638")}" stroke-width="4.5" stroke-linecap="round"/><path d="M${x + 14},${F(y - v - 5.5)} L${x + 72},${F(y - v - 11.5)}" stroke="${T(k % 2 ? "#5e4228" : "#543a24")}" stroke-width="4.5" stroke-linecap="round"/><circle cx="${x - 52}" cy="${F(y - v + .5)}" r="2.4" fill="${T("#c8a070")}"/>`; }
      c += `<path d="${poly([[x - 58, y - 38], [x - 20, y - 78], [x + 38, y - 86], [x + 78, y - 50], [x + 14, y - 44]])}" fill="${T("#3e4a3a")}"/><path d="${poly([[x - 58, y - 38], [x - 20, y - 78], [x + 14, y - 44]])}" fill="${T("#5a6a50")}"/>`;
      c += `<path d="M${x - 58},${y - 38} L${x - 20},${y - 78} L${x + 38},${y - 86}" stroke="${RIM}" stroke-width="1.6" fill="none" opacity=".6"/>`;
      for (let k = 1; k < 5; k++) c += `<path d="M${F(x - 58 + k * 9.5)},${F(y - 38 - k * 10)} L${F(x + 14 + k * 6)},${F(y - 44 - k * 10.5)}" stroke="${T("#2e382c")}" stroke-width="1" opacity=".6"/>`;
      c += `<rect x="${x + 40}" y="${y - 100}" width="12" height="40" fill="${T("#6a6a6a")}"/><rect x="${x + 46}" y="${y - 100}" width="6" height="40" fill="#000" opacity=".2"/>`;
      const lit = NIGHT;
      c += `<path d="${poly([[x - 38, y - 30], [x - 18, y - 32], [x - 18, y - 16], [x - 38, y - 14]])}" fill="${lit ? LAMP : T("#3a4a5a")}"/><path d="M${x - 28},${y - 31} v16" stroke="${T("#2a1c12")}" stroke-width="1.5"/>`;
      c += `<path d="${poly([[x + 26, y - 14], [x + 42, y - 16], [x + 42, y - 38], [x + 26, y - 36]])}" fill="${lit ? mix(LAMP, "#7a4a20", .25) : T("#3a2418")}"/><path d="${poly([[x - 8, y - 6], [x + 4, y - 7], [x + 4, y - 30], [x - 8, y - 29]])}" fill="${T("#2e1e14")}"/>`;
      if (lit) c += `<circle cx="${x - 28}" cy="${y - 22}" r="50" fill="url(#alGlow)" opacity=".6"/><circle cx="${x + 34}" cy="${y - 26}" r="34" fill="url(#alGlow)" opacity=".45"/>`;
      return c; }]);
    items.sort((a, b) => a[0] - b[0]);
    items.forEach(([, f]) => g += f());
    for (let k = 0; k < 26; k++) { const x = r() * 880, y = wlL(x) - 2 - r() * 6; g += granite(x, y, 8 + r() * 16, .45); }
    for (let x = 0; x < 900; x += 4 + r() * 6) { const y = wlL(x) - 2 - r() * 26; if (y < topL(x)) continue; const hh = 6 + r() * 12;
      g += `<path d="M${F(x)},${F(y)} q${F(-2 + r() * 4)},${F(-hh * .6)} ${F(-3 + r() * 6)},${F(-hh)}" stroke="${T(r() < .5 ? "#d8c070" : "#8a7a38")}" stroke-width="1.6" fill="none" opacity=".85"/>`; }
    return g; });
  s += `<g class="smoke" filter="url(#alLeafyS)">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => `<path d="${blobP(606 + k * 9 + Math.sin(k * 1.3) * 4, 394 - k * 13, 4 + k * 2.2, 3 + k * 1.5, 7, rs)}" fill="${NIGHT ? "#8a94b4" : "#eef0f2"}" opacity="${F(.6 - k * .07)}"/>`).join("")}</g>`;

  const rw = wave([3, 2, 5], [190, 70, 30], [6, 3, 1.5]);
  const wlR = x => 500 + (x - 1780) * .07 + rw(x) * .4, topR = x => 466 - (x - 1780) * .03 + rw(x);
  s += shore(510, () => {
    let g = "", d = `M1760,${F(wlR(1760))}`;
    for (let x = 1760; x <= W; x += 12) d += ` L${x},${F(Math.min(topR(x), wlR(x)))}`;
    for (let x = W; x >= 1760; x -= 12) d += ` L${x},${F(wlR(x))}`;
    g += `<path d="${d}Z" fill="url(#alShore)"/>`;
    g += `<g filter="url(#alLeafyS)">${slopeForest(x => topR(x) - 2, 1800, W + 10, 1, 16, 0, () => .4)}</g>`;
    const items = [];
    for (let x = 1830; x < W + 20; x += 18 + r() * 30) { const y = topR(x) + 10 + r() * Math.max(4, wlR(x) - topR(x) - 30), h = (130 + r() * 70) * (.8 + (x - 1800) / 2400);
      const k = r(); items.push([y, k < .45 ? () => conifer(x, y, h * .95, LARCH) : k < .6 ? () => conifer(x, y, h, SPRUCE) : () => aspen(x, y, h, 140, r() < .5 ? GOLD : AMBER)]); }
    items.sort((a, b) => a[0] - b[0]);
    items.forEach(([, f]) => g += f());
    for (let k = 0; k < 22; k++) { const x = 1790 + r() * 780, y = wlR(x) - r() * 8; g += granite(x, y, 12 + r() * 26, .5); }
    return g; });

  /* ---------- the dock and canoe ---------- */
  { const FE0 = [700, 506], FE1 = [1090, 566], NE0 = [680, 520], NE1 = [1060, 588];
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    let dk = "";
    for (let t = 0; t <= 1.001; t += .1) { const p = lerp(NE0, NE1, t), q = lerp(FE0, FE1, t), len = 12 + t * 14;
      dk += `<rect x="${F(q[0] - 2)}" y="${F(q[1])}" width="3.5" height="${F(len * .7)}" fill="${T("#3a2c22")}"/><rect x="${F(p[0] - 3)}" y="${F(p[1] + 5)}" width="${F(4 + t * 3)}" height="${F(len)}" fill="${T("#4a3828")}"/><rect x="${F(p[0] - 3)}" y="${F(p[1] + 5)}" width="1.5" height="${F(len)}" fill="${T("#9a7a54")}" opacity=".8"/>`; }
    dk += `<path d="${poly([NE0, NE1, [NE1[0], NE1[1] + 7], [NE0[0], NE0[1] + 6]])}" fill="${T("#5a4430")}"/><path d="${poly([FE0, FE1, NE1, NE0])}" fill="${T("#a88a66")}"/>`;
    for (let t = .02; t < 1; t += .026) { const a = lerp(FE0, FE1, t), b = lerp(NE0, NE1, t); dk += `<path d="${line([a, b])}" stroke="${T("#6e5840")}" stroke-width="1"/>`; }
    dk += `<path d="${line([NE0, NE1])}" stroke="${RIM}" stroke-width="1.4" opacity=".55"/>`;
    // lantern post at the end
    dk += `<rect x="1072" y="530" width="3" height="40" fill="${T("#2a2a2e")}"/><rect x="1068" y="522" width="11" height="12" rx="2" fill="${NIGHT ? LAMP : T("#3a3a40")}"/>`;
    if (NIGHT) dk += `<circle cx="1073" cy="528" r="56" fill="url(#alGlow)" opacity=".7"/>`;
    // canoe tied alongside: red hull, gunwales, thwarts, a paddle across
    const cn = `<path d="M-120,-10 Q-60,6 0,7 Q60,6 122,-12 Q118,-2 108,4 Q60,16 0,16 Q-60,16 -110,6 Q-118,0 -120,-10Z" fill="${T("#b83222")}"/>` +
      `<path d="M-110,6 Q-60,16 0,16 Q60,16 108,4 Q60,10 0,11 Q-60,10 -110,6Z" fill="#000" opacity=".22"/>` +
      `<path d="M-120,-10 Q-60,-2 0,-1 Q60,-2 122,-12 Q60,2 0,3 Q-60,2 -120,-10Z" fill="${T("#e8c89a")}"/>` +
      `<path d="M-120,-10 Q-60,6 0,7 Q60,6 122,-12" stroke="${T("#5a2a1a")}" stroke-width="2.4" fill="none"/><path d="M-116,-8 Q-60,4 0,5 Q60,4 118,-10" stroke="${RIM}" stroke-width="1.2" fill="none" opacity=".6"/>` +
      `<path d="M-50,-1 L-48,6 M0,-1 L0,7 M50,-1 L48,6" stroke="${T("#7a5a3a")}" stroke-width="3"/>` +
      `<path d="M-70,-4 L60,6" stroke="${T("#c8a070")}" stroke-width="3" stroke-linecap="round"/><ellipse cx="68" cy="7" rx="14" ry="4" fill="${T("#c8a070")}" transform="rotate(8 68 7)"/>`;
    s += `<g transform="translate(900,606) scale(.95)">${`<g transform="scale(1,-1)" opacity=".4" filter="url(#alRipple)">${cn}</g>`}</g>`;
    s += `<g filter="url(#alRipple)" opacity=".35">${dk.replace(/<circle[^>]*alGlow[^>]*>/g, "")}</g>`.replace(/<g filter="url\(#alRipple\)" opacity=".35">/, `<g transform="matrix(1,0,0,-1,0,1150)" filter="url(#alRipple)" opacity=".3">`);
    s += dk;
    s += `<g transform="translate(900,600) scale(.95)">${cn}</g><path d="M940,598 Q960,584 980,566" stroke="${T("#d8c8a0")}" stroke-width="1.2" fill="none"/>`;
    s += `<path d="M780,604 q120,8 240,0" stroke="${NIGHT ? "#8a9ad0" : "#eef6f8"}" stroke-width="1.2" fill="none" opacity=".45"/>`;
  }

  /* ---------- foreground: near shore, boulders, willows and grasses ---------- */
  const nb = wave([2, 3, 1], [260, 110, 50], [8, 4, 2]);
  const near = x => 664 + nb(x) - Math.max(0, 1 - Math.abs(x - 300) / 420) * 40 - Math.max(0, 1 - Math.abs(x - 2300) / 380) * 34;
  s += `<path d="${ridgePath(near)}" fill="url(#alShore)"/>`;
  const fr = [];
  for (let k = 0; k < 18; k++) { const x = r() * W; if (x > 820 && x < 1760) continue; fr.push([x, near(x) + 4 + r() * 30, 22 + r() * 40]); }
  fr.sort((a, b) => a[1] - b[1]);
  fr.forEach(([x, y, R]) => s += granite(x, y, R, .5));
  for (let x = 0; x < W; x += 4 + r() * 8) { const y = near(x) + 3 + r() * 60, hh = 10 + r() * 20;
    s += `<path d="M${F(x)},${F(y)} q${F(-2 + r() * 4)},${F(-hh * .6)} ${F(-4 + r() * 8)},${F(-hh)}" stroke="${T(r() < .5 ? "#d8c070" : "#7a6a30")}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".75"/>`; }
  [[70, 690, 90], [2480, 690, 96], [2330, 706, 56]].forEach(([x, y, R]) => {
    let b = `<path d="${blobP(x + 6, y + 6, R, R * .6)}" fill="${T("#3a2a0c")}"/>`; const cs = [];
    for (let i = 0; i < 260 && cs.length < 90; i++) { const px = x + (r() * 2 - 1) * R, py = y + (r() * 2 - 1) * R * .6; if (((px - x) / R) ** 2 + ((py - y) / (R * .6)) ** 2 > 1) continue;
      const lit = ((LX < x ? -1 : 1) * (px - x) / R * .5 - (py - y) / (R * .6) * .6) * .5 + .5; cs.push([px, py, cl(lit * .85 + (r() - .5) * .3)]); }
    cs.sort((a, b2) => a[2] - b2[2]);
    cs.forEach(([px, py, v]) => b += `<path d="${blobP(px, py, R * .14, R * .1, 6)}" fill="${T(AMBER[Math.floor(v * 8)])}"/>`);
    s += `<g filter="url(#alLeafyS)">${b}</g>`; });

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
