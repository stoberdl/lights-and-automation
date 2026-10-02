/* Frozen Falls Pass: a mountain pass in deep winter. A waterfall frozen into
   blue ice columns pours from a notch between two granite cliffs into a
   frozen pool; an old stone footbridge arches over the outflow; snow-laden
   tiered firs on the slopes, a stone refuge hut on the left, and a distant
   ridge of snowy peaks behind. One light source, upper left: the sun by day,
   a gibbous moon by night (opts.time === "night": stars, lit hut window and
   bridge lantern, deep blue grading). Snow lies on the ground only; nothing
   falls. Same shape as reference/autumn-valley.js. Needs rng() and mix()
   from reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land". */
function frozenFallsPassArt(opts = {}) {
  const NIGHT = opts.time === "night", K = (d, n) => NIGHT ? n : d;
  const seed = opts.seed || 1207;
  const r = rng(seed), rs = rng(seed + 11);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const LX = 780, LY = 100;
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
  const lerpPts = (pts, x) => { for (let i = 0; i < pts.length - 1; i++) if (x <= pts[i + 1][0]) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], t = (x - x0) / ((x1 - x0) || 1); return y0 + (y1 - y0) * t; } return pts[pts.length - 1][1]; };

  /* palettes */
  const SN = K({ lit: "#fbfdff", mid: "#dbe6f2", dark: "#a6bcd8", deep: "#7f98c0" }, { lit: "#c8d6ee", mid: "#8fa3c8", dark: "#5c709c", deep: "#3a4a76" });
  const ICE = K(["#1c4676", "#2a6498", "#4288c0", "#72b6de", "#b0def2", "#ecfaff"], ["#0a1e40", "#14325a", "#22507e", "#3a74a4", "#66a2cc", "#a6d6ee"]);
  const ROCK = K(["#353b4c", "#474f62", "#5c647a", "#737c92", "#8e97ac", "#adb4c4"], ["#10162a", "#181f38", "#212a48", "#2c385a", "#3a486e", "#4e5e88"]);
  const FIR = K({ trunk: "#4a3428", hl: "#f0e0b8", dark: "#143430", mid: "#224a3e", lit: "#3a7056" }, { trunk: "#22181a", hl: "#8a9cc4", dark: "#07121a", mid: "#0f242c", lit: "#1c3c44" });
  const HAZE = K("#dde7f2", "#2a3c66"), LAMP = "#ffc868";

  /* faceted snowy mountains: lit/shaded faces from summit to valley, caps split the same way */
  const mountains = o => {
    const key = []; let x = -180, pk = false;
    while (x < W + 260) { key.push([x, pk ? o.hi + r() * (o.lo - o.hi) : 0, pk]); x += o.step * (.6 + r() * .8); pk = !pk; }
    key.forEach((k, i) => { if (k[2]) return; const n = [key[i - 1], key[i + 1]].filter(Boolean).map(p => p[1]);
      const low = n.length ? Math.max(...n) : o.lo; k[1] = low + (o.base - low) * (.25 + r() * .4); });
    const seg = [];
    for (let i = 0; i < key.length - 1; i++) { const [ax, ay] = key[i], [bx, by] = key[i + 1], a = [];
      for (let s = 0; s <= 5; s++) { const t = s / 5, j = s % 5 ? 1 : 0; a.push([ax + (bx - ax) * t + j * (r() - .5) * 10, ay + (by - ay) * t + j * (r() - .5) * o.step * .06]); }
      seg.push(a); }
    const B = o.base + 6; let m = `<path d="${poly([[0, B], ...seg.flat(), [W, B]])}" fill="${o.mid}"/>`;
    for (let i = 1; i < key.length - 1; i++) { if (!key[i][2]) continue;
      const P = key[i], L = key[i - 1], R = key[i + 1], fx = P[0] + (r() - .5) * o.step * .2, Fp = [fx, B];
      const litL = o.lx < P[0], lc = litL ? o.lit : o.dark, rc = litL ? o.dark : o.lit;
      m += `<path d="${poly([...seg[i - 1], Fp])}" fill="${lc}"/><path d="${poly([...seg[i], Fp])}" fill="${rc}"/>`;
      m += `<path d="${poly([P, seg[i - 1][2], [(fx + L[0]) / 2, B]])}" fill="${mix(lc, o.mid, .5)}" opacity=".7"/>`;
      m += `<path d="${poly([P, seg[i][3], [(fx + R[0]) / 2, B]])}" fill="${mix(rc, o.mid, .5)}" opacity=".7"/>`;
      const hP = B - P[1], sy = P[1] + hP * o.snow;
      const walk = pts => { for (let k = 1; k < pts.length; k++) if (pts[k][1] >= sy) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], t = (sy - y0) / ((y1 - y0) || 1);
        return pts.slice(0, k).concat([[x0 + (x1 - x0) * t, sy]]); } return pts.slice(); };
      const lr = walk([...seg[i - 1]].reverse()), rr = walk(seg[i]), A = lr[lr.length - 1], Bp = rr[rr.length - 1];
      const jag = []; for (let k = 1; k < 12; k++) { const t = k / 12; jag.push([Bp[0] + (A[0] - Bp[0]) * t, sy + (k % 2 ? hP * (.05 + r() * .16) : -hP * .03)]); }
      const spine = [P[0] + (fx - P[0]) * o.snow * 1.2, sy + hP * .14];
      m += `<path d="${poly([...lr.slice().reverse(), ...rr.slice(1), ...jag])}" fill="${o.snowDark}"/>`;
      const lit = litL ? [...lr.slice().reverse(), spine, ...jag.filter(p => p[0] < spine[0])] : [...rr, ...jag.filter(p => p[0] > spine[0]), spine];
      m += `<path d="${poly(lit)}" fill="${o.snowLit}"/>`;
      m += `<path d="${line(litL ? seg[i - 1] : seg[i])}" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="${K(".45", ".3")}"/>`;
    }
    return m;
  };

  /* small/medium spruce: stepped drooping tiers, lit and shaded sides, trunk, snow shelf on each tier */
  const spruce = (x, y, h, o) => {
    const s = o.lx < x ? -1 : 1; let g = "";
    const tw = Math.max(1.5, h * .04), th = h * .12;
    g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .6)},${F(y - th * 2.4)} L${F(x + tw * .6)},${F(y - th * 2.4)} L${F(x + tw)},${F(y)}Z" fill="${o.trunk}"/>`;
    g += `<path d="M${F(x + s * tw)},${F(y)} L${F(x + s * tw * .6)},${F(y - th * 2.4)} L${F(x)},${F(y - th * 2.4)} L${F(x)},${F(y)}Z" fill="${mix(o.trunk, o.hl, .35)}"/>`;
    const tiers = Math.max(3, Math.min(9, Math.round(h / 30))), top = y - h, bot = y - th, span = bot - top, gap = span / (tiers - .2);
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - gap * t, ya = t === tiers - 1 ? top : Math.max(top, yb - gap * 1.75), th2 = yb - ya;
      const w = h * .32 * Math.pow(1 - u, .9) * (.88 + r() * .24) + 3;
      const A = [x + (r() - .5) * w * .06, ya], m = Math.max(2, Math.round(w / 7)) * 2, edge = [];
      for (let k = 0; k <= m; k++) { const px = x - w + 2 * w * k / m, d = Math.abs(px - x) / w;
        edge.push([px + (r() - .5) * w * .05, yb + (k % 2 ? -th2 * (.12 + r() * .12) : d * d * th2 * .24 + r() * 2)]); }
      const Lm = [x - w * .28, ya + th2 * .5], Rm = [x + w * .28, ya + th2 * .5];
      if (t > 0 && h > 40) g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mix(o.dark, "#000", .45)}" opacity=".7" transform="translate(${F(-s * th2 * .05)},${F(th2 * .16)})"/>`;
      g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${o.mid}"/>`;
      const shade = s < 0 ? [A, [x, yb - 2], ...edge.filter(p => p[0] > x), Rm] : [A, Lm, ...edge.filter(p => p[0] < x), [x, yb - 2]];
      g += `<path d="${poly(shade)}" fill="${o.dark}"/>`;
      const le = edge.filter(p => (p[0] - x) * s > w * .45); if (s > 0) le.reverse();
      g += `<path d="${poly([A, s < 0 ? Lm : Rm, ...le, [x + s * w * .34, yb - th2 * .28]])}" fill="${o.lit}"/>`;
      if (h > 60) for (let k = 0; k < w / 2.5; k++) { const py = ya + th2 * (.45 + r() * .5), lim = w * (py - ya) / th2, px = x + (r() - .5) * 2 * lim * .9, sd = px < x ? -1 : 1;
        g += `<path d="M${F(px)},${F(py)} l${F(sd * 4)},${F(4 + r() * 4)}" stroke="${sd === s ? mix(o.lit, o.hl, .25) : mix(o.dark, "#000", .35)}" stroke-width="1.3" opacity=".75"/>`; }
      const sy = ya + th2 * .62, sw = w * .66, n = Math.max(4, Math.round(sw / 5)), bump = [];
      for (let k = 0; k <= n; k++) { const px = x - sw + 2 * sw * k / n; bump.push([px, sy + (Math.abs(px - x) / sw) * th2 * .08 + (k % 2 ? 2 + r() * 3 : -1 - r() * 2) * Math.min(1, h / 120)]); }
      g += `<path d="${poly([A, [x - sw * .55, ya + th2 * .36], ...bump, [x + sw * .55, ya + th2 * .36]])}" fill="${o.snowDark}"/>`;
      const lb = bump.filter(p => (p[0] - x) * s > -1); if (s > 0) lb.reverse();
      g += `<path d="${poly([A, [x + s * sw * .55, ya + th2 * .36], ...lb, [x - s * sw * .1, sy + 2]])}" fill="${o.snowLit}"/>`;
      edge.forEach((p, k) => { if (k % 2 || r() < .3) return; const lt = (p[0] - x) * s > 0, rw = 1.5 + w * .07;
        g += `<ellipse cx="${F(p[0])}" cy="${F(p[1] - rw * .5)}" rx="${F(rw)}" ry="${F(rw * .5)}" fill="${lt ? o.snowLit : o.snowDark}"/>`; });
    }
    g += `<path d="M${F(x)},${F(top - 2)} l${F(-h * .015)},${F(h * .05)} h${F(h * .03)}Z" fill="${o.snowLit}"/>`;
    return g;
  };

  /* near fir: fans of drooping branches made of many serrated needle sprays,
     side-lit, with lumpy snow pillows on top and a barked trunk */
  const nearFir = (x, y, h, o) => {
    const rn = rng(Math.round(x * 13 + h * 7)), s = o.lx < x ? -1 : 1, k = h / 380;
    const ramp = [mix(o.dark, "#000", .4), o.dark, mix(o.dark, o.mid, .5), o.mid, mix(o.mid, o.lit, .5), o.lit, mix(o.lit, o.hl, .3), mix(o.lit, o.hl, .55)];
    const sprig = (px, py, a, L, wd, col) => {
      const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, l = [], rr = [], n = 5;
      for (let i = 1; i <= n; i++) { const t = i / n, ww = wd * (1 - t * .65) * (i % 2 ? 1 : .4), cx = px + ca * L * t * .92, cy = py + sa * L * t * .92;
        l.push([cx + nx * ww - ca * L * .1, cy + ny * ww - sa * L * .1]); rr.push([cx - nx * ww - ca * L * .1, cy - ny * ww - sa * L * .1]); }
      return `<path d="${poly([[px, py], ...l, [px + ca * L, py + sa * L], ...rr.reverse()])}" fill="${col}"/>`;
    };
    const lump = (cx, cy, rx, ry, a, col) => { const n = 7, pts = [];
      for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, q = .78 + rn() * .3, ex = Math.cos(t) * rx * q, ey = Math.sin(t) * ry * q * (Math.sin(t) > 0 ? .7 : 1.1);
        pts.push([cx + ex * Math.cos(a) - ey * Math.sin(a), cy + ex * Math.sin(a) + ey * Math.cos(a)]); }
      return `<path d="${poly(pts)}" fill="${col}"/>`; };
    const tw = h * .042, top = y - h, bot = y - h * .2, tiers = Math.max(5, Math.round(h / 36));
    let back = "", front = "";
    for (let t = 0; t < tiers; t++) {
      const u = t / (tiers - 1), yb = bot - (bot - top - h * .04) * Math.pow(u, .92), w = h * .4 * Math.pow(1 - u, .85) + h * .035;
      const droop = w * .36, nb = Math.max(3, Math.round(w / 13)), lift = h * .05 * (1 - u * .5);
      const mass = [[x, yb - lift - h * .02]];
      for (let i = 0; i <= 14; i++) { const q = -1 + 2 * i / 14, px = x + q * w * .92, py = yb + h * .005 + Math.abs(q) * droop * .85 + (i % 2 ? -droop * .3 * Math.abs(q) : rn() * 3);
        mass.push([px, py]); }
      back += `<path d="${poly(mass)}" fill="${ramp[0]}" opacity=".92"/>`;
      if (t > 0) front += `<path d="${poly(mass)}" fill="${ramp[0]}" opacity=".55" transform="translate(${F(-s * 3 * k)},${F(9 * k)})"/>`;
      for (let i = 0; i < w * .9; i++) {
        const q = (rn() * 2 - 1) * .9, px = x + q * w * .85, yTop = yb - lift + Math.abs(q) * droop * .25, yBot = yb + Math.abs(q) * droop * .75 - 2 * k;
        const py = yTop + rn() * Math.max(2, yBot - yTop), toward = Math.sign(q) === s, a = Math.PI / 2 - Math.sign(q || 1) * (.9 + rn() * .5);
        const v = (toward ? .4 : .14) + (1 - (py - yTop) / Math.max(1, yBot - yTop)) * .2 + (rn() - .5) * .2;
        front += sprig(px, py, a, (10 + rn() * 8) * k, (4 + rn() * 2) * k, ramp[Math.max(1, Math.min(6, Math.floor(v * 8)))]);
      }
      for (const pass of [0, 1]) for (const side of [-1, 1]) for (let b = 0; b < nb; b++) {
        if ((b + pass) % 2) continue;
        const isFront = pass === 1, toward = side === s;
        const len = w * (isFront ? .55 + rn() * .45 : .7 + rn() * .3), x0 = x + side * tw * .4, y0 = yb - lift - rn() * h * .02 + b * .5;
        const x1 = x + side * len, y1 = yb - lift * .3 + droop * (len / w) * (.6 + rn() * .5) + (b / nb - .5) * droop * .5;
        const qx = x + side * len * .55, qy = y0 - len * .06 - rn() * len * .05;
        const at = q => { const m = 1 - q; return [m * m * x0 + 2 * m * q * qx + q * q * x1, m * m * y0 + 2 * m * q * qy + q * q * y1]; };
        let g = `<path d="M${F(x0)},${F(y0)} Q${F(qx)},${F(qy)} ${F(x1)},${F(y1)}" stroke="${mix(o.trunk, "#000", .3)}" stroke-width="${F(2.2 * k)}" fill="none"/>`;
        const steps = Math.max(4, Math.round(len / (7.5 * k)));
        for (let i = 2; i <= steps; i++) {
          const q = i / steps, [px, py] = at(q), [ax, ay] = at(Math.max(0, q - .05)), ang = Math.atan2(py - ay, px - ax);
          const L = (11 + rn() * 9) * k * (.6 + q * .5), wd = (4 + rn() * 2) * k;
          for (const off of [-.75, .45]) {
            const a = ang + off + (rn() - .5) * .35;
            const v = (toward ? .52 : .18) + q * (toward ? .28 : .1) + (off < 0 ? .12 : -.1) + (isFront ? .08 : -.18) + (rn() - .5) * .22;
            g += sprig(px, py, a, L, wd, ramp[Math.max(1, Math.min(7, Math.floor(v * 8)))]);
          }
        }
        if (isFront) for (let i = 2; i <= steps; i++) {
          const q = i / steps; if (rn() < (q > .3 ? .1 : .7) || q > .97) continue;
          const [px, py] = at(q), [ax, ay] = at(Math.max(0, q - .08)), a = Math.atan2(py - ay, Math.abs(px - ax) || 1) * .8;
          const ang = side * a, rx = (7 + rn() * 8) * k * (1.2 - q * .45), ry = (3.2 + rn() * 2.2) * k;
          const lit = toward ? (q > .2 || rn() < .6) : rn() < .25;
          g += lump(px, py - ry * .2, rx * .95, ry * .7, ang, mix(o.snowDark, o.dark, .22));
          g += lump(px, py - ry * .85, rx, ry, ang, lit ? o.snowLit : o.snowDark);
          if (rn() < .55) g += lump(px + (rn() - .5) * rx, py - ry * 1.3, rx * .5, ry * .6, ang, lit ? "#ffffff" : mix(o.snowDark, o.snowLit, .4));
        }
        if (isFront) front += g; else back += g;
      }
    }
    let tr = `<path d="M${F(x - tw)},${F(y)} C${F(x - tw * .8)},${F(y - h * .4)} ${F(x - tw * .3)},${F(top + h * .3)} ${F(x)},${F(top + 4)} C${F(x + tw * .3)},${F(top + h * .3)} ${F(x + tw * .8)},${F(y - h * .4)} ${F(x + tw)},${F(y)}Z" fill="${o.trunk}"/>`;
    tr += `<path d="M${F(x + s * tw * .95)},${F(y)} C${F(x + s * tw * .75)},${F(y - h * .4)} ${F(x + s * tw * .28)},${F(top + h * .3)} ${F(x)},${F(top + 6)} L${F(x + s * tw * .2)},${F(top + h * .3)} C${F(x + s * tw * .4)},${F(y - h * .4)} ${F(x + s * tw * .5)},${F(y - h * .2)} ${F(x + s * tw * .45)},${F(y)}Z" fill="${mix(o.trunk, o.hl, .4)}"/>`;
    for (let i = 0; i < 26; i++) { const py = y - rn() * h * .8, wid = tw * (1 - (y - py) / h * .7), px = x + (rn() - .5) * wid * 1.2;
      tr += `<path d="M${F(px)},${F(py)} q${F((rn() - .5) * 3)},${F(-6 - rn() * 8)} ${F((rn() - .5) * 2)},${F(-12 - rn() * 10)}" stroke="${mix(o.trunk, "#000", .4)}" stroke-width="1.3" fill="none" opacity=".7"/>`; }
    const tip = `<path d="M${F(x)},${F(top - 4)} q${F(-5 * k)},${F(8 * k)} ${F(-7 * k)},${F(14 * k)} q${F(7 * k)},${F(3 * k)} ${F(14 * k)},0 q${F(-3 * k)},${F(-6 * k)} ${F(-7 * k)},${F(-14 * k)}Z" fill="${o.snowLit}"/>`;
    return tr + back + front + tip;
  };
  const firO = (extra = {}) => Object.assign({ lx: LX, snowLit: SN.lit, snowDark: SN.dark }, FIR, extra);

  /* ---------------------------------------------------------------- sky */
  const SKY_H = K("#e2ecf6", "#3a5482");
  const skyStops = K(`<stop offset="0" stop-color="#2a62b2"/><stop offset=".42" stop-color="#5e9ad4"/><stop offset=".8" stop-color="#b4d0ea"/><stop offset="1" stop-color="${SKY_H}"/>`,
    `<stop offset="0" stop-color="#040a1e"/><stop offset=".42" stop-color="#0c1a3e"/><stop offset=".8" stop-color="#1e3462"/><stop offset="1" stop-color="${SKY_H}"/>`);
  const lightStops = K(`<stop offset="0" stop-color="#fffaf0" stop-opacity=".9"/><stop offset=".16" stop-color="#fff4dc" stop-opacity=".42"/><stop offset=".5" stop-color="#ffeccc" stop-opacity=".1"/><stop offset="1" stop-color="#ffeccc" stop-opacity="0"/>`,
    `<stop offset="0" stop-color="#e8f0ff" stop-opacity=".55"/><stop offset=".14" stop-color="#c8d6f8" stop-opacity=".22"/><stop offset=".5" stop-color="#8ea4d8" stop-opacity=".07"/><stop offset="1" stop-color="#8ea4d8" stop-opacity="0"/>`);
  let s = `<defs id="ffdefs">
    <linearGradient id="ffSky" x1="0" y1="0" x2="0" y2="470" gradientUnits="userSpaceOnUse">${skyStops}</linearGradient>
    <radialGradient id="ffLight" cx="${LX}" cy="${LY}" r="760" gradientUnits="userSpaceOnUse">${lightStops}</radialGradient>
    <radialGradient id="ffGlow"><stop offset="0" stop-color="${LAMP}" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb050" stop-opacity=".3"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="ffIceGlow"><stop offset="0" stop-color="${ICE[4]}" stop-opacity="${K(".0", ".35")}"/><stop offset="1" stop-color="${ICE[4]}" stop-opacity="0"/></radialGradient>
    <radialGradient id="ffPane" cx=".5" cy=".6" r=".7">${K(`<stop offset="0" stop-color="#b4d0e4"/><stop offset=".6" stop-color="#6a8aa6"/><stop offset="1" stop-color="#3e5672"/>`, `<stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#ffc35a"/><stop offset="1" stop-color="#e8862a"/>`)}</radialGradient>
    <linearGradient id="ffHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HAZE}" stop-opacity="0"/><stop offset=".6" stop-color="${HAZE}" stop-opacity=".6"/><stop offset="1" stop-color="${HAZE}" stop-opacity="0"/></linearGradient>
    <linearGradient id="ffSnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SN.lit}"/><stop offset=".4" stop-color="${SN.mid}"/><stop offset="1" stop-color="${SN.dark}"/></linearGradient>
    <linearGradient id="ffSlope" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(SN.mid, HAZE, .2)}"/><stop offset="1" stop-color="${SN.dark}"/></linearGradient>
    <linearGradient id="ffRecess" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K("#1a2c46", "#060e22")}"/><stop offset="1" stop-color="${K("#24405e", "#0a1830")}"/></linearGradient>
    <linearGradient id="ffUnder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
    <linearGradient id="ffCliffShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="${K(".18", ".25")}"/><stop offset="1" stop-color="#000" stop-opacity="${K(".32", ".4")}"/></linearGradient>
    <filter id="ffLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ffRough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="ffCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.2"/></filter>
    <filter id="ffPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="ffSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="ffSoft3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#ffSky)"/>`;
  if (NIGHT) {
    for (let i = 0; i < 620; i++) { const x = rs() * W, y = Math.pow(rs(), 1.35) * 420, d = Math.hypot(x - LX, y - LY), big = rs() < .06, o = .2 + rs() * .65 * (1 - y / 470);
      if (d < 150) continue;
      s += `<circle cx="${F(x)}" cy="${F(y)}" r="${big ? 1.8 : F(.5 + rs() * .7)}" fill="${rs() < .15 ? "#fff0d8" : "#e6eeff"}" opacity="${F(o)}"/>`; }
    const R = 32;
    s += `<rect width="${W}" height="${H}" fill="url(#ffLight)"/><circle cx="${LX}" cy="${LY}" r="${R + 16}" fill="#d8e4ff" opacity=".12"/><circle cx="${LX}" cy="${LY}" r="${R}" fill="#f2f5ff"/>`;
    [[-10, -8, 9, 7], [8, -12, 7, 5], [-3, 8, 10, 6], [12, 10, 5, 5]].forEach(([dx, dy, a, b]) => s += `<path d="${blobP(LX + dx, LY + dy, a, b, 7, rs)}" fill="#a8b2cc" opacity=".4"/>`);
    s += `<path d="M${LX},${LY - R} A${R},${R} 0 0 0 ${LX},${LY + R} A${R * .55},${R} 0 0 1 ${LX},${LY - R}Z" fill="#1e2a4c" opacity=".85"/>`;
  } else {
    s += `<rect width="${W}" height="${H}" fill="url(#ffLight)"/><circle cx="${LX}" cy="${LY}" r="50" fill="#fff6dc" opacity=".35"/><circle cx="${LX}" cy="${LY}" r="38" fill="#fffcf0"/>`;
    s += `<g class="rays" opacity=".11" filter="url(#ffSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .5 + k * .3, L = 900;
      s += `<path d="M${LX},${LY} L${F(LX + Math.cos(a - .04) * L)},${F(LY + Math.sin(a - .04) * L)} L${F(LX + Math.cos(a + .04) * L)},${F(LY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* ------------------------------------------------------------- clouds */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}" opacity="${K("1", ".85")}"><g filter="url(#ffCloudy)">`;
    const lobes = [], lean = x < LX ? 1 : -1;
    for (let k = 0; k < 13; k++) { const t = rs(); lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .06 * (.4 + rs() * 1.2) + (rs() - .5) * w * .03, w * (.035 + rs() * .06)]); }
    lobes.sort((a, b) => a[0] - b[0]);
    if (!NIGHT) {
      c += `<ellipse cx="${x}" cy="${F(y + w * .01)}" rx="${F(w * .5)}" ry="${F(w * .03)}" fill="#bccce0"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.8)}" ry="${F(R * .62)}" fill="#cad8e8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly - R * .25)}" rx="${F(R * 1.4)}" ry="${F(R * .56)}" fill="#f2f6fb"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .5)}" rx="${F(R * .7)}" ry="${F(R * .3)}" fill="#ffffff"/>`);
    } else {
      c += `<ellipse cx="${x}" cy="${F(y + w * .01)}" rx="${F(w * .5)}" ry="${F(w * .025)}" fill="#18264a"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .2)}" rx="${F(R * 2)}" ry="${F(R * .45)}" fill="#1c2c50"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.5)}" ry="${F(R * .34)}" fill="#32466e"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .18)}" rx="${F(R * .65)}" ry="${F(R * .18)}" fill="#8a9cc8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .45)}" cy="${F(ly - R * .24)}" rx="${F(R * .3)}" ry="${F(R * .08)}" fill="#d8e2f6" opacity=".7"/>`);
    }
    return c + `</g></g>`;
  };
  s += cloud(360, 175, 480, "drift1") + cloud(2230, 135, 520, "drift2") + cloud(1880, 250, 300, "drift3") + cloud(560, 290, 260, "drift2");
  const cloudPart = s; s = DEFS;

  /* --------------------------------------------------- distant ridge of peaks */
  s += mountains({ base: 420, hi: 160, lo: 270, step: 200, lx: LX, snow: .62,
    lit: K("#a6b8d4", "#4a5e8c"), mid: K("#8a9ec2", "#374a76"), dark: K("#6e84ac", "#26365e"), snowLit: K("#ffffff", "#c4d2ec"), snowDark: K("#bccce2", "#7486b0") });
  s += `<rect x="0" y="300" width="${W}" height="150" fill="url(#ffHaze)" opacity=".8"/>`;
  s += mountains({ base: 452, hi: 290, lo: 370, step: 125, lx: LX, snow: .5,
    lit: K("#94a8c8", "#3e5282"), mid: K("#768cb2", "#2e406c"), dark: K("#5a7098", "#202e56"), snowLit: K("#f8fbff", "#b8c8e6"), snowDark: K("#aabcd8", "#62769e") });
  s += `<rect x="0" y="390" width="${W}" height="90" fill="url(#ffHaze)" opacity=".85"/>`;

  /* flanking snowy slopes with a band of small spruces */
  const sl = wave([1, 4, 2], [280, 120, 50], [14, 6, 3]);
  const slope = x => 452 + sl(x) - Math.max(0, 1 - Math.abs(x - 420) / 520) * 34 - Math.max(0, 1 - Math.abs(x - 2180) / 500) * 30;
  s += `<path d="${ridgePath(slope)}" fill="url(#ffSlope)"/>`;
  s += `<path d="${line(Array.from({ length: 161 }, (_, i) => [i * 16, slope(i * 16) + 1]))}" stroke="${SN.lit}" stroke-width="2" fill="none" opacity=".6"/>`;
  { const trees = [];
    for (let row = 0; row < 3; row++) for (let x = -10; x < W + 10; x += 9 + r() * 9) { if (r() < .15) continue; trees.push([x + r() * 5, slope(x) + 6 + row * 9 + r() * 6, (22 + r() * 16) * (1 + row * .2)]); }
    trees.sort((a, b) => a[1] - b[1]);
    let f = ""; trees.forEach(([x, y, h]) => { const hz = Math.max(0, .5 - (y - 440) / 120);
      f += spruce(x, y, h, firO({ trunk: mix(FIR.trunk, HAZE, hz), dark: mix(FIR.dark, HAZE, hz), mid: mix(FIR.mid, HAZE, hz), lit: mix(FIR.lit, HAZE, hz * .8), snowLit: mix(SN.lit, HAZE, hz * .3), snowDark: mix(SN.dark, HAZE, hz * .5) })); });
    s += `<g filter="url(#ffLeafyS)">${f}</g>`; }
  s += `<rect x="0" y="440" width="${W}" height="70" fill="url(#ffHaze)" opacity=".45"/>`;

  /* ----------------------------------------------- the granite cliffs of the pass */
  const CT = [[800, 520], [850, 468], [880, 440], [905, 418], [930, 380], [962, 372], [990, 338], [1030, 320], [1052, 292], [1090, 280], [1122, 246], [1160, 236], [1196, 204], [1236, 196], [1270, 168], [1290, 178], [1302, 196],
    [1392, 196], [1404, 176], [1430, 150], [1466, 160], [1500, 186], [1536, 190], [1572, 222], [1610, 232], [1640, 268], [1680, 282], [1712, 322], [1750, 340], [1790, 392], [1830, 416], [1866, 466], [1900, 520]];
  const cliffTop = x => lerpPts(CT, x) + Math.sin(x / 9) * 1.5;
  const BASE = 512;
  const cliffPoly = [[800, BASE + 20], ...CT.map(([x, y]) => [x, y]), [1900, BASE + 20]];
  s += `<defs><clipPath id="ffCliffClip"><path d="${poly(cliffPoly)}"/></clipPath></defs>`;
  let cl = `<path d="${poly(cliffPoly)}" fill="${ROCK[1]}"/><g clip-path="url(#ffCliffClip)">`;
  const FL = 1302, FR = 1392;                        // the notch the falls pour from
  // buttresses: tall angular rock faces, each split at a ridge into a lit facet (toward the light) and a
  // shaded one, then broken into irregular chunks by slanting fractures; nothing is laid in courses
  const rv = (v) => ROCK[Math.max(0, Math.min(5, Math.floor(v * 6)))];
  for (let x0 = 790; x0 < 1900;) {
    const w = 38 + r() * 64, x1 = x0 + w, rx = x0 + w * (.3 + r() * .4), lean = (r() - .5) * w * .5;
    const leftWall = rx < (FL + FR) / 2, tilt = leftWall ? Math.max(0, (rx - 900) / 400) : 0;
    const tA = cliffTop(x0), tR = cliffTop(rx) - 4 - r() * 8, tB = cliffTop(x1), bR = [rx + lean, BASE + 20];
    const facets = [[[x0, tA], [rx, tR], bR, [x0 + lean * .6, BASE + 20]], [[rx, tR], [x1, tB], [x1 + lean * .6, BASE + 20], bR]];
    facets.forEach((fp, side) => {
      const baseV = side === 0 ? (leftWall ? .5 - tilt * .2 : .72) : (leftWall ? .22 - tilt * .08 : .4);
      // break the facet into chunks by slanting fracture lines
      let yA = Math.min(fp[0][1], fp[1][1]);
      const cuts = [yA - 2]; for (let y = yA + 30 + r() * 40; y < BASE; y += 34 + r() * 60) cuts.push(y); cuts.push(BASE + 24);
      const xl = side === 0 ? x0 : rx, xr = side === 0 ? rx : x1;
      const topAt = x => { const [p, q] = [fp[0], fp[1]]; return p[1] + (q[1] - p[1]) * (x - p[0]) / ((q[0] - p[0]) || 1); };
      for (let i = 0; i < cuts.length - 1; i++) {
        const sl1 = (r() - .5) * 26, sl2 = (r() - .5) * 26, ya = cuts[i], yb = cuts[i + 1];
        const yl0 = Math.max(topAt(xl), ya + sl1 / 2), yr0 = Math.max(topAt(xr), ya - sl1 / 2), yl1 = yb + sl2 / 2, yr1 = yb - sl2 / 2;
        const dx0 = lean * (ya - 200) / 400, dx1 = lean * (yb - 200) / 400;
        const p = [[xl + dx0 * .3, yl0], [xr + dx0 * (side ? .6 : 1), yr0], [xr + dx1 * (side ? .6 : 1), yr1], [xl + dx1 * .3, yl1]];
        const depth = (ya - 160) / (BASE - 160), v = baseV + (r() - .5) * .16 - depth * .12;
        const c = rv(v);
        cl += `<path d="${poly(p)}" fill="${c}"/>`;
        // a lit lip along the top edge of each chunk and a shadowed underside
        cl += `<path d="${line([p[0], p[1]])}" stroke="${mix(c, "#ffffff", K(.35, .2))}" stroke-width="2" opacity=".8"/>`;
        cl += `<path d="${poly([p[3], p[2], [p[2][0], p[2][1] - 5], [p[3][0], p[3][1] - 5]])}" fill="${mix(c, "#000", .3)}" opacity=".8"/>`;
        if (r() < .5) { const fx = xl + (xr - xl) * (.2 + r() * .6); cl += `<path d="M${F(fx)},${F(ya + 6)} l${F((r() - .5) * 10)},${F((yb - ya) * .45)} l${F((r() - .5) * 8)},${F((yb - ya) * .4)}" stroke="${mix(c, "#000", .45)}" stroke-width="1.3" fill="none" opacity=".8"/>`; }
      }
      // the ridge between the two facets catches light
      if (side === 0) cl += `<path d="M${F(rx)},${F(tR)} L${F(bR[0])},${F(bR[1])}" stroke="${mix(rv(baseV + .2), "#ffffff", .2)}" stroke-width="1.6" opacity=".55"/>`;
    });
    x0 = x1;
  }
  // snow on scattered slanting ledges, with icicles under some
  for (let k = 0; k < 70; k++) {
    const x = 820 + r() * 1060; if (x > FL - 30 && x < FR + 30) continue;
    const y = cliffTop(x) + 24 + r() * (BASE - cliffTop(x) - 40); if (y > BASE - 10) continue;
    const sw = 18 + r() * 46, sl = (r() - .5) * .35, lit = x > FR || r() < .35, n = 6, top = [], bot = [];
    for (let i = 0; i <= n; i++) { const px = x + sw * i / n, py = y + (px - x) * sl; top.push([px, py - 2 - (i % 2 ? 2 + r() * 2.5 : r()) - Math.sin(i / n * Math.PI) * 2.5]); bot.push([px, py + 2 + Math.sin(i / n * Math.PI) * 3]); }
    cl += `<path d="${line(bot)}" stroke="#000" stroke-width="4" fill="none" opacity=".25" transform="translate(0,3)"/>`;
    cl += `<path d="${poly([...top, ...bot.slice().reverse()])}" fill="${lit ? SN.lit : SN.mid}"/><path d="${line(bot)}" stroke="${SN.deep}" stroke-width="1.3" fill="none" opacity=".7"/>`;
    if (r() < .4) for (let i = 0; i < 2 + r() * 4; i++) { const ix = x + r() * sw, iy = y + (ix - x) * sl + 3, il = 4 + r() * 12;
      cl += `<path d="M${F(ix - 1.5)},${F(iy)} L${F(ix)},${F(iy + il)} L${F(ix + 1.5)},${F(iy)}Z" fill="${ICE[4]}" opacity=".9"/>`; }
  }
  // broad shading: the left wall faces away from the light, darkening toward the notch; occlusion at the foot
  cl += `<rect x="1050" y="140" width="${FL - 1040}" height="${BASE - 120}" fill="url(#ffCliffShade)"/>`;
  cl += `<rect x="780" y="${BASE - 70}" width="1120" height="90" fill="url(#ffUnder)" opacity=".35" transform="matrix(1,0,0,-1,0,${2 * BASE - 50})"/>`;
  cl += `</g>`;
  // cornice of snow along the cliff top, lit on the side toward the light
  { const top = [], bot = [];
    for (let x = 800; x <= 1880; x += 10) { if (x > FL - 6 && x < FR + 6) continue; const y = cliffTop(x); top.push([x, y - 3 - r() * 3]); bot.push([x, y + 6 + r() * 7]); }
    const split = top.findIndex(p => p[0] > FL);
    [[0, split], [split, top.length]].forEach(([a, b]) => { const T2 = top.slice(a, b), B2 = bot.slice(a, b);
      cl += `<path d="${poly([...T2, ...B2.reverse()])}" fill="${a === 0 ? SN.mid : SN.lit}"/><path d="${line(B2.slice().reverse())}" stroke="${SN.deep}" stroke-width="1.6" fill="none" opacity=".6"/>`; });
    for (let k = 0; k < 40; k++) { const x = 820 + r() * 1040; if (x > FL - 10 && x < FR + 10) continue; const y = cliffTop(x) + 8;
      cl += `<path d="M${F(x - 2)},${F(y)} L${F(x)},${F(y + 6 + r() * 14)} L${F(x + 2)},${F(y)}Z" fill="${ICE[4]}" opacity=".85"/>`; } }
  s += `<g filter="url(#ffRough)">${cl}</g>`;
  // a few small snowy firs clinging to the cliff shoulders
  { let f = ""; [[870, 1], [925, .8], [985, 1.1], [1050, .7], [1110, .9], [1560, .9], [1615, 1.1], [1680, .8], [1745, 1], [1800, .85]].forEach(([x, k]) => f += spruce(x, cliffTop(x) + 8, 34 * k + r() * 10, firO()));
    s += `<g filter="url(#ffLeafyS)">${f}</g>`; }

  /* ------------------------------------------------------- the frozen falls */
  const FB = 476;
  const fL = y => { const t = (y - 190) / (FB - 190); return FL - t * 96 - Math.sin(y / 31) * 6 - t * t * 10; };
  const fR = y => { const t = (y - 190) / (FB - 190); return FR + t * 92 + Math.sin(y / 27 + 1) * 6 + t * t * 12; };
  let fa = "";
  const recess = []; for (let y = 188; y <= FB + 10; y += 8) recess.push([fL(y) - 10, y]); for (let y = FB + 10; y >= 188; y -= 8) recess.push([fR(y) + 10, y]);
  fa += `<path d="${poly(recess)}" fill="url(#ffRecess)"/>`;
  fa += `<ellipse cx="1347" cy="330" rx="210" ry="180" fill="url(#ffIceGlow)"/>`;
  const cols = [];
  for (let i = 0; i < 56; i++) {
    const depth = r(), y0 = 192 + (r() < .7 ? r() * 30 : 40 + r() * 170);
    const hang = r() < .3, y1 = hang ? Math.min(FB - 20, y0 + 70 + r() * 150) : FB - 10 + r() * 22;
    const tm = (y0 + y1) / 2, cx = fL(tm) + 6 + r() * (fR(tm) - fL(tm) - 12), w = 7 + r() * 15 + (1 - depth) * 4;
    cols.push({ depth, y0, y1, cx, w, hang, ph: r() * 6, lean: (r() - .5) * .08 });
  }
  cols.sort((a, b) => a.depth - b.depth);
  cols.forEach(c => {
    const n = Math.max(6, Math.round((c.y1 - c.y0) / 9)), L = [], R2 = [], rings = [];
    for (let k = 0; k <= n; k++) { const t = k / n, y = c.y0 + (c.y1 - c.y0) * t, bulge = .72 + .28 * Math.sin((y - c.y0) / 14 + c.ph);
      const taper = c.hang ? Math.pow(1 - t, .7) * (1 + t * .5) : 1 + t * .55, hw = c.w / 2 * bulge * taper, cx = c.cx + (y - c.y0) * c.lean + (t - .5) * 0;
      L.push([cx - hw, y]); R2.push([cx + hw, y]); if (k % 2 === 0 && bulge > .9 && k > 0 && k < n) rings.push([cx, y, hw]); }
    const tipY = c.hang ? c.y1 + c.w * .9 : c.y1 + 4, tip = [c.cx + (c.y1 - c.y0) * c.lean, tipY];
    const base = ICE[Math.min(5, 1 + Math.floor(c.depth * 3))];
    fa += `<path d="${poly([...L, tip, ...R2.reverse()])}" fill="${base}"/>`;
    const hl = L.map(([x, y], i) => [x + c.w * .14, y]), hl2 = L.map(([x, y], i) => [x + c.w * .34, y]);
    fa += `<path d="${poly([...hl, ...hl2.reverse()])}" fill="${ICE[Math.min(5, 3 + Math.floor(c.depth * 2.4))]}" opacity=".85"/>`;
    const sh = R2.slice().reverse().map(([x, y]) => [x - c.w * .3, y]);
    fa += `<path d="${poly([...R2.slice().reverse(), ...sh.reverse()])}" fill="${ICE[Math.max(0, Math.floor(c.depth * 2))]}" opacity=".8"/>`;
    rings.forEach(([x, y, hw]) => fa += `<path d="M${F(x - hw)},${F(y)} Q${F(x)},${F(y + 4)} ${F(x + hw)},${F(y)}" stroke="${ICE[5]}" stroke-width="1.3" fill="none" opacity="${F(.35 + c.depth * .4)}"/>`);
  });
  // the frozen spray cone at the foot, lit from upper left
  { const pts = [];
    for (let i = 0; i < 160; i++) { const a = Math.PI + r() * Math.PI, d = Math.sqrt(r()), x = 1347 + Math.cos(a) * d * 175, y = FB + 18 + Math.sin(a) * d * 46;
      const lit = ((1347 - x) / 175 * .45 + (FB + 18 - y) / 46 * .55) * .5 + .5 + (r() - .5) * .25; pts.push([x, y, lit]); }
    pts.sort((a, b) => a[2] - b[2]);
    fa += `<path d="${blobP(1347, FB + 14, 186, 36, 12)}" fill="${ICE[2]}"/>`;
    pts.forEach(([x, y, v]) => fa += `<path d="${blobP(x, y, 9 + r() * 10, 6 + r() * 6, 6)}" fill="${[ICE[2], ICE[3], ICE[3], ICE[4], ICE[4], SN.mid, SN.lit][Math.max(0, Math.min(6, Math.floor(v * 7)))]}"/>`); }
  // ice lip and snow cap at the top of the notch, with a fringe of icicles
  fa += `<path d="${blobP(1347, 192, 60, 11, 11)}" fill="${SN.mid}"/><path d="${blobP(1335, 187, 44, 7, 9)}" fill="${SN.lit}"/>`;
  for (let x = FL - 4; x < FR + 4; x += 4 + r() * 5) { const l = 8 + r() * 26; fa += `<path d="M${F(x - 2)},197 L${F(x)},${F(197 + l)} L${F(x + 2)},197Z" fill="${r() < .5 ? ICE[5] : ICE[4]}"/>`; }
  s += fa;

  /* --------------------------------------------- ground, frozen pool and creek */
  const gw = wave([2, 5, 1], [300, 110, 45], [7, 3, 1.5]);
  const ground = x => 506 + gw(x) + Math.max(0, 1 - Math.abs(x - 1347) / 300) * 24 - Math.max(0, 1 - Math.abs(x - 640) / 380) * 18;
  s += `<path d="${ridgePath(ground)}" fill="url(#ffSnow)"/>`;
  s += `<path d="${line(Array.from({ length: 161 }, (_, i) => [i * 16, ground(i * 16) + 1]))}" stroke="${SN.lit}" stroke-width="2.5" fill="none" opacity=".7"/>`;
  // the pool at the foot of the falls (ice, with a lighter rim and cracks)
  s += `<ellipse cx="1347" cy="${F(ground(1347) - 2)}" rx="200" ry="16" fill="${ICE[3]}"/><ellipse cx="1330" cy="${F(ground(1347) - 4)}" rx="150" ry="9" fill="${ICE[4]}" opacity=".7"/>`;
  // the creek running from under the bridge toward us: ice with a dark open lead in the middle
  const CL = [[1300, 560], [1270, 600], [1180, 640], [1160, 682], [1220, 724]], CR = [[1400, 560], [1440, 600], [1380, 640], [1390, 682], [1500, 724]];
  const cr = pts => { let d = ""; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${F(p1[0] + (p2[0] - p0[0]) / 6)},${F(p1[1] + (p2[1] - p0[1]) / 6)} ${F(p2[0] - (p3[0] - p1[0]) / 6)},${F(p2[1] - (p3[1] - p1[1]) / 6)} ${F(p2[0])},${F(p2[1])}`; } return d; };
  const CREEK = `M${CL[0][0]},${CL[0][1]}${cr(CL)} L${CR[CR.length - 1][0]},${CR[CR.length - 1][1]}${cr([...CR].reverse())}Z`;
  const MIDL = CL.map((p, i) => [p[0] + (CR[i][0] - p[0]) * .38, p[1]]), MIDR = CL.map((p, i) => [p[0] + (CR[i][0] - p[0]) * .6, p[1]]);
  s += `<path d="${CREEK}" fill="${ICE[3]}"/>`;
  s += `<path d="M${F(MIDL[1][0])},${MIDL[1][1]}${cr(MIDL.slice(1))} L${F(MIDR[MIDR.length - 1][0])},${MIDR[MIDR.length - 1][1]}${cr(MIDR.slice(1).reverse())}Z" fill="${K("#1e3a5a", "#081428")}"/>`;
  s += `<defs><clipPath id="ffCreekClip"><path d="${CREEK}"/></clipPath></defs><g clip-path="url(#ffCreekClip)">`;
  for (let k = 0; k < 70; k++) { const y = 560 + Math.pow(r(), .8) * 165, t = (y - 560) / 160;
    s += `<rect x="${F(1150 + r() * 340)}" y="${F(y)}" width="${F(10 + r() * 50 * (.5 + t))}" height="${F(1 + t)}" rx="1" fill="${r() < .5 ? ICE[5] : ICE[1]}" opacity="${F(.2 + r() * .3)}"/>`; }
  s += `</g>`;
  [[CL, 1], [CR, -1]].forEach(([pts, side]) => { const top = [];
    s += `<path d="M${pts[0][0]},${pts[0][1]}${cr(pts)}" stroke="${SN.lit}" stroke-width="7" fill="none"/><path d="M${pts[0][0]},${pts[0][1] + 4}${cr(pts.map(p => [p[0] + side * 3, p[1] + 4]))}" stroke="${SN.deep}" stroke-width="2" fill="none" opacity=".6"/>`;
    for (let k = 0; k < 14; k++) { const i = Math.min(pts.length - 2, Math.floor(r() * (pts.length - 1))), t = r(), x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t, R = 6 + (y - 560) / 8;
      s += `<path d="${blobP(x + side * R * .3, y, R, R * .5, 7)}" fill="${ROCK[2]}"/><path d="${blobP(x + side * R * .3 - R * .1, y - R * .35, R * .9, R * .28, 7)}" fill="${SN.lit}"/>`; } });

  /* ---------------------------------------------------- the stone footbridge */
  { const BX = 1350, SPAN = 250, CROWN = 520, SPRING = 572, AH = 104, top = x => 500 - 14 * (1 - ((x - BX) / SPAN) ** 2);
    const deck = Array.from({ length: 41 }, (_, i) => { const x = BX - SPAN + i * SPAN / 20; return [x, top(x)]; });
    const arch = Array.from({ length: 25 }, (_, i) => { const a = Math.PI - i / 24 * Math.PI; return [BX + Math.cos(a) * AH, SPRING - Math.sin(a) * (SPRING - CROWN)]; });
    const face = [[BX - SPAN - 10, 590], ...deck, [BX + SPAN + 10, 590]];
    let b = `<defs><clipPath id="ffBridgeClip"><path d="${poly(face)} ${poly([[BX - AH, 600], ...arch, [BX + AH, 600]])}" clip-rule="evenodd"/></clipPath></defs>`;
    // the shadowed inside of the arch (barrel), seen through the opening
    b += `<path d="${poly([[BX - AH, SPRING + 4], ...arch, [BX + AH, SPRING + 4]])}" fill="${mix(ROCK[0], "#000", .3)}"/>`;
    b += `<path d="${poly([[BX - AH + 14, SPRING + 4], ...arch.map(([x, y]) => [BX + (x - BX) * .86, y + 9]), [BX + AH - 14, SPRING + 4]])}" fill="${K("#1a2c44", "#060c1c")}"/>`;
    b += `<g clip-path="url(#ffBridgeClip)"><path d="${poly(face)}" fill="${ROCK[2]}"/>`;
    for (let y = 486, row = 0; y < 595; y += 11 + r() * 2, row++) for (let x = BX - SPAN - 14 - (row % 2) * 12; x < BX + SPAN + 14;) {
      const w = 18 + r() * 16, v = .45 + (r() - .5) * .35 - (x > BX + 40 ? .12 : 0), c = ROCK[Math.max(1, Math.min(5, Math.floor(v * 6)))];
      b += `<rect x="${F(x + 1)}" y="${F(y + 1)}" width="${F(w - 2)}" height="9" rx="2.5" fill="${c}"/><path d="M${F(x + 2)},${F(y + 2)} h${F(w - 5)}" stroke="${mix(c, "#ffffff", K(.4, .25))}" stroke-width="1.3" opacity=".8"/><path d="M${F(x + 3)},${F(y + 9.5)} h${F(w - 5)}" stroke="#000" stroke-width="1.2" opacity=".3"/>`;
      x += w; }
    b += `<rect x="${BX - SPAN - 20}" y="470" width="${SPAN * 2 + 40}" height="130" fill="url(#ffCliffShade)" opacity=".6"/></g>`;
    // voussoirs round the arch, radial
    for (let i = 0; i < 17; i++) { const a0 = Math.PI - i / 17 * Math.PI, a1 = Math.PI - (i + 1) / 17 * Math.PI, ry = SPRING - CROWN, T = 15;
      const p = [[BX + Math.cos(a0) * AH, SPRING - Math.sin(a0) * ry], [BX + Math.cos(a1) * AH, SPRING - Math.sin(a1) * ry], [BX + Math.cos(a1) * (AH + T), SPRING - Math.sin(a1) * (ry + T)], [BX + Math.cos(a0) * (AH + T), SPRING - Math.sin(a0) * (ry + T)]];
      const c = ROCK[Math.max(1, Math.min(5, Math.floor((.55 + (r() - .5) * .3 - (i > 9 ? .12 : 0)) * 6)))];
      b += `<path d="${poly(p)}" fill="${c}" stroke="${mix(c, "#000", .45)}" stroke-width="1.2"/><path d="${line([p[3], p[2]])}" stroke="${mix(c, "#ffffff", .35)}" stroke-width="1.2" opacity=".7"/>`; }
    // parapet coping, a thick snow blanket on top, icicles off the arch
    b += `<path d="${line(deck.map(([x, y]) => [x, y + 2]))}" stroke="${ROCK[4]}" stroke-width="6" fill="none"/><path d="${line(deck.map(([x, y]) => [x, y + 5]))}" stroke="${ROCK[0]}" stroke-width="2" fill="none" opacity=".6"/>`;
    const st = deck.map(([x, y], i) => [x, y - 7 - (i % 2 ? 2 + r() * 3 : r() * 1.5)]), sb = deck.map(([x, y]) => [x, y + 3 + r() * 2]);
    b += `<path d="${poly([...st, ...sb.slice().reverse()])}" fill="${SN.lit}"/><path d="${line(sb)}" stroke="${SN.dark}" stroke-width="2" fill="none"/>`;
    b += `<path d="${poly([...st.slice(26), ...sb.slice(26).reverse()])}" fill="${SN.mid}" opacity=".7"/>`;
    for (let i = 0; i < 18; i++) { const a = Math.PI * (.12 + r() * .76), x = BX + Math.cos(a) * (AH + 1), y = SPRING - Math.sin(a) * (SPRING - CROWN) + 1, l = 5 + r() * 14;
      b += `<path d="M${F(x - 1.6)},${F(y)} L${F(x)},${F(y + l)} L${F(x + 1.6)},${F(y)}Z" fill="${ICE[5]}" opacity=".9"/>`; }
    // lantern on an iron post at the right end of the bridge
    const lx = BX + SPAN - 26, ly = top(lx) - 6;
    b += `<path d="M${lx},${F(ly)} V${F(ly - 58)} h10" stroke="#1e1e24" stroke-width="3" fill="none"/><path d="M${lx + 10},${F(ly - 58)} v6" stroke="#1e1e24" stroke-width="1.5"/>`;
    b += `<rect x="${lx + 4}" y="${F(ly - 52)}" width="12" height="16" rx="2" fill="${K("#c8d2d8", LAMP)}" stroke="#1e1e24" stroke-width="1.5"/><path d="M${lx + 2},${F(ly - 52)} h16 l-8,-6Z" fill="#1e1e24"/><path d="${blobP(lx + 10, ly - 59, 9, 3, 7)}" fill="${SN.lit}"/>`;
    if (NIGHT) b += `<circle cx="${lx + 10}" cy="${F(ly - 44)}" r="70" fill="url(#ffGlow)" opacity=".7"/><ellipse cx="${lx - 10}" cy="${F(ly + 4)}" rx="80" ry="10" fill="url(#ffGlow)" opacity=".5"/>`;
    // snowbanks burying the abutments
    [[BX - SPAN - 10, 1], [BX + SPAN + 10, -1]].forEach(([x, side]) => {
      b += `<path d="${blobP(x, 560, 110, 34, 11)}" fill="${side > 0 ? SN.mid : SN.dark}"/><path d="${blobP(x - side * 10, 548, 90, 20, 10)}" fill="${side > 0 ? SN.lit : SN.mid}"/>`; });
    s += b; }

  /* ------------------------------------------- the refuge hut on the left slope */
  { const hx = 600, hy = ground(600) + 4, L = hx - 62, R = hx + 62, wt = hy - 62;
    let g = `<ellipse cx="${hx + 40}" cy="${hy + 4}" rx="130" ry="10" fill="${SN.deep}" opacity=".45"/>`;
    g += `<path d="${poly([[R, hy], [R, wt], [R + 34, wt - 8], [R + 34, hy - 4]])}" fill="${ROCK[1]}"/>`;
    g += `<rect x="${L}" y="${wt}" width="${R - L}" height="${hy - wt}" fill="${ROCK[3]}"/>`;
    for (let y = wt + 2, row = 0; y < hy; y += 10, row++) for (let x = L - (row % 2) * 9; x < R;) { const w = 14 + r() * 12, c = ROCK[2 + Math.floor(r() * 3)];
      g += `<rect x="${F(Math.max(L, x) + 1)}" y="${F(y)}" width="${F(Math.min(R, x + w) - Math.max(L, x) - 2)}" height="8" rx="2.5" fill="${c}"/>`; x += w; }
    for (let y = wt + 4; y < hy; y += 10) g += `<path d="M${R + 2},${y} L${R + 32},${y - 7}" stroke="${ROCK[0]}" stroke-width="1.2" opacity=".6"/>`;
    // window and door
    if (NIGHT) g += `<circle cx="${hx - 26}" cy="${wt + 26}" r="56" fill="url(#ffGlow)" opacity=".6"/>`;
    g += `<rect x="${hx - 38}" y="${wt + 16}" width="26" height="22" fill="#2a1e18"/><rect x="${hx - 35}" y="${wt + 19}" width="20" height="16" fill="url(#ffPane)"/><path d="M${hx - 25},${wt + 19} v16 M${hx - 35},${wt + 27} h20" stroke="#2a1e18" stroke-width="2"/><path d="M${hx - 40},${wt + 40} h30" stroke="${SN.lit}" stroke-width="4" stroke-linecap="round"/>`;
    g += `<rect x="${hx + 8}" y="${hy - 40}" width="26" height="40" fill="#3a2418"/><rect x="${hx + 11}" y="${hy - 37}" width="20" height="37" fill="#5a3a24"/><circle cx="${hx + 28}" cy="${hy - 18}" r="1.8" fill="#c8a060"/>`;
    // roof with a deep snow blanket and icicles
    g += `<path d="${poly([[L - 14, wt + 2], [L + 6, wt - 40], [R + 22, wt - 48], [R + 44, wt - 6]])}" fill="#3a2c28"/>`;
    const sn = [[L - 20, wt]]; for (let k = 0; k <= 12; k++) sn.push([L - 20 + (R - L + 70) * k / 12, wt + 6 + (k % 2 ? 3 + r() * 4 : 0) - k * .6]);
    g += `<path d="${poly([[L + 2, wt - 54], [R + 22, wt - 62], [R + 50, wt - 6], ...sn.slice().reverse()])}" fill="${SN.mid}"/>`;
    g += `<path d="${poly([[L + 2, wt - 54], [hx + 10, wt - 58], [hx - 16, wt - 18], [L - 18, wt - 2]])}" fill="${SN.lit}"/>`;
    g += `<path d="M${L + 2},${wt - 54} Q${hx},${wt - 64} ${R + 22},${wt - 62}" stroke="${SN.lit}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    for (let x = L - 14; x < R + 40; x += 7 + r() * 8) { const len = 5 + r() * 14; g += `<path d="M${F(x - 2)},${F(wt + 7 - (x - L) * .05)} L${F(x)},${F(wt + 7 + len - (x - L) * .05)} L${F(x + 2)},${F(wt + 7 - (x - L) * .05)}Z" fill="${ICE[5]}" opacity=".85"/>`; }
    const chx = R - 30, cht = wt - 92;
    g += `<rect x="${chx}" y="${cht}" width="24" height="40" fill="${ROCK[2]}"/><rect x="${chx}" y="${cht}" width="9" height="40" fill="${ROCK[4]}"/><path d="${blobP(chx + 12, cht - 2, 17, 5, 8)}" fill="${SN.lit}"/>`;
    g += `<g class="smoke" opacity=".5">${[0, 1, 2, 3, 4].map(k => `<circle cx="${F(chx + 14 + k * 8)}" cy="${F(cht - 16 - k * 20)}" r="${6 + k * 4}" fill="${K("#eef2f6", "#9aa8c4")}" opacity="${F(.55 - k * .1)}"/>`).join("")}</g>`;
    // woodpile against the side wall and a snow-capped stone cairn on the path
    for (let row = 0; row < 3; row++) for (let k = 0; k < 6 - row; k++) { const x = L - 70 + k * 12 + row * 6, y = hy - 6 - row * 11;
      g += `<circle cx="${F(x)}" cy="${F(y)}" r="6" fill="#7a5a40"/><circle cx="${F(x - 1)}" cy="${F(y - 1)}" r="4" fill="#c49a70"/>`; }
    g += `<path d="${blobP(L - 42, hy - 40, 32, 6, 9)}" fill="${SN.lit}"/>`;
    s += g; }

  /* ----------------------------------------- medium firs on both banks */
  { const trees = [[760, 150], [830, 210], [905, 120], [985, 175], [1060, 110], [1630, 120], [1700, 190], [1780, 140], [1860, 220], [1950, 130], [2040, 170], [430, 140], [480, 95], [350, 180], [2130, 110]];
    trees.sort((a, b) => a[1] - b[1]);
    let f = ""; trees.forEach(([x, h]) => f += spruce(x, ground(x) + 10, h, firO()));
    s += `<g filter="url(#ffLeafyS)">${f}</g>`; }

  /* --------------------------------------------- foreground snowfield */
  for (let k = 0; k < 10; k++) { const cx = 80 + k * 270 + r() * 100, cy = 600 + r() * 90, w = 160 + r() * 200, hh = 9 + r() * 12;
    if (Math.abs(cx - 1320) < 200) continue;
    s += `<path d="M${F(cx - w)},${F(cy)} Q${F(cx - w * .2)},${F(cy - hh * 2)} ${F(cx + w)},${F(cy + 2)} Q${F(cx)},${F(cy - hh * .4)} ${F(cx - w)},${F(cy)}Z" fill="${SN.dark}" opacity=".45"/>`;
    s += `<path d="M${F(cx - w)},${F(cy - 1)} Q${F(cx - w * .2)},${F(cy - hh * 2 - 1)} ${F(cx + w)},${F(cy + 1)}" stroke="${SN.lit}" stroke-width="2.5" fill="none" opacity=".8"/>`; }
  for (let k = 0; k < 160; k++) { const x = r() * W, y = ground(x) + 14 + Math.pow(r(), .8) * (H - ground(x) - 14), t = (y - 520) / 200, L = 14 + r() * 40 * (.5 + t);
    if (x > 1140 && x < 1520 && y > 550) continue;
    s += `<path d="M${F(x)},${F(y)} q${F(L / 2)},${F(-2 - t * 2)} ${F(L)},0" stroke="${r() < .5 ? SN.dark : SN.lit}" stroke-width="${F(1 + t)}" fill="none" opacity="${F(.3 + r() * .3)}"/>`; }
  for (let k = 0; k < 50; k++) { const x = r() * W, y = ground(x) + 10 + r() * (H - ground(x) - 20), h = 6 + r() * 14 * (.5 + (y - 520) / 200);
    if (x > 1100 && x < 1560) continue;
    for (let j = 0; j < 4; j++) s += `<path d="M${F(x + j * 2.5)},${F(y)} q${F((r() - .5) * 4)},${F(-h * .6)} ${F((r() - .5) * 8)},${F(-h)}" stroke="${j % 2 ? "#6a5a4a" : "#9a8468"}" stroke-width="1.3" fill="none"/>`; }
  // snow-capped boulders
  [[260, 650, 46], [520, 690, 30], [890, 640, 38], [1010, 700, 54], [1720, 660, 44], [1900, 700, 34], [2060, 640, 30]].forEach(([x, y, R]) => {
    const sd = x < LX ? 1 : -1;
    s += `<ellipse cx="${x + 10}" cy="${y + 4}" rx="${F(R * 1.3)}" ry="${F(R * .2)}" fill="${SN.deep}" opacity=".45"/>`;
    s += `<path d="${blobP(x, y - R * .3, R, R * .55, 8)}" fill="${ROCK[1]}"/><path d="${blobP(x - sd * R * .2, y - R * .4, R * .7, R * .38, 7)}" fill="${ROCK[3]}"/>`;
    s += `<path d="${blobP(x, y - R * .72, R * .92, R * .26, 9)}" fill="${SN.mid}"/><path d="${blobP(x - R * .15, y - R * .78, R * .7, R * .18, 8)}" fill="${SN.lit}"/>`; });

  /* near firs framing the corners */
  s += `<g filter="url(#ffLeafyS)">${nearFir(330, 728, 250, firO())}${nearFir(120, 742, 410, firO())}${nearFir(2290, 730, 270, firO())}${nearFir(2470, 742, 420, firO())}</g>`;

  /* light + paper */
  s += `<rect width="${W}" height="${H}" fill="url(#ffLight)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#ffPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
