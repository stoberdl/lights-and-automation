/* Winter Aurora Cabin: a snowbound log cabin in a spruce clearing under the
   northern lights. Snowy faceted mountains, forest bands, drifts, a woodpile,
   a sled and a deer. One light source: a small moon upper left of centre,
   with the aurora adding green to the lit snow. Snow is drawn lying on the
   ground and trees only; falling snow belongs to the page's weather layer.
   opts.time === "day" draws the same clearing on a clear, cold sunny day:
   deep blue sky, the sun where the moon is, bright snow with blue shadows,
   no aurora, unlit windows. Unset/"night" = the aurora night.
   Same shape as reference/autumn-valley.js. Needs rng() and mix() from
   reference/scene-helpers.js. opts.part = "sky" | "clouds" | "land".   */
function winterAuroraCabinArt(opts = {}) {
  const DAY = opts.time === "day", K = (n, d) => DAY ? d : n;
  const r = rng(opts.seed || 1221);
  const W = 2560, H = 720, F = v => (+v).toFixed(1);
  const MX = 930, MY = 105, MR = 30;                        // the moon
  const blobP = (cx, cy, rx, ry, n) => {
    n = n || 7 + Math.floor(r() * 4);
    const pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r() * .3, k = .8 + r() * .35;
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

  /* faceted snowy mountains: lit/shaded faces from summit to valley, snow caps split the same way */
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
      if (o.snow) {
        const hP = B - P[1], sy = P[1] + hP * o.snow;
        const walk = pts => { for (let k = 1; k < pts.length; k++) if (pts[k][1] >= sy) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], t = (sy - y0) / ((y1 - y0) || 1);
          return pts.slice(0, k).concat([[x0 + (x1 - x0) * t, sy]]); } return pts.slice(); };
        const lr = walk([...seg[i - 1]].reverse()), rr = walk(seg[i]), A = lr[lr.length - 1], Bp = rr[rr.length - 1];
        const jag = []; for (let k = 1; k < 12; k++) { const t = k / 12; jag.push([Bp[0] + (A[0] - Bp[0]) * t, sy + (k % 2 ? hP * (.05 + r() * .14) : -hP * .03)]); }
        const spine = [P[0] + (fx - P[0]) * o.snow * 1.2, sy + hP * .14];
        m += `<path d="${poly([...lr.slice().reverse(), ...rr.slice(1), ...jag])}" fill="${o.snowDark}"/>`;
        const lit = litL ? [...lr.slice().reverse(), spine, ...jag.filter(p => p[0] < spine[0])] : [...rr, ...jag.filter(p => p[0] > spine[0]), spine];
        m += `<path d="${poly(lit)}" fill="${o.snowLit}"/>`;
      }
      m += `<path d="${line(litL ? seg[i - 1] : seg[i])}" stroke="#ffffff" stroke-width="1.6" fill="none" opacity=".35"/>`;
    }
    return m;
  };

  /* spruce: distinct stepped tiers that flare out and droop at the tips, lit and
     shaded sides, a visible trunk, a shelf of snow resting on every tier */
  const spruce = (x, y, h, o) => {
    const s = o.lx < x ? -1 : 1; let g = "";
    const tw = Math.max(1.5, h * .04), th = h * .12;
    g += `<path d="M${F(x - tw)},${F(y)} L${F(x - tw * .6)},${F(y - th * 2.4)} L${F(x + tw * .6)},${F(y - th * 2.4)} L${F(x + tw)},${F(y)}Z" fill="${o.trunk}"/>`;
    g += `<path d="M${F(x + s * tw)},${F(y)} L${F(x + s * tw * .6)},${F(y - th * 2.4)} L${F(x)},${F(y - th * 2.4)} L${F(x)},${F(y)}Z" fill="${mix(o.trunk, "#c8d8f0", .3)}"/>`;
    const tiers = Math.max(3, Math.min(8, Math.round(h / 38))), top = y - h, bot = y - th, span = bot - top, gap = span / (tiers - .2);
    for (let t = 0; t < tiers; t++) {
      const u = t / tiers, yb = bot - gap * t, ya = t === tiers - 1 ? top : Math.max(top, yb - gap * 1.75), th2 = yb - ya;
      const w = h * .32 * Math.pow(1 - u, .9) * (.88 + r() * .24) + 3;
      const A = [x + (r() - .5) * w * .06, ya], m = Math.max(2, Math.round(w / 8)) * 2, edge = [];
      for (let k = 0; k <= m; k++) { const px = x - w + 2 * w * k / m, d = Math.abs(px - x) / w;
        edge.push([px + (r() - .5) * w * .04, yb + (k % 2 ? -th2 * (.12 + r() * .1) : d * d * th2 * .22 + r() * 2)]); }
      const Lm = [x - w * .28, ya + th2 * .5], Rm = [x + w * .28, ya + th2 * .5];
      if (t > 0 && h > 40) g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${mix(o.dark, "#000", .45)}" opacity=".7" transform="translate(${F(-s * th2 * .05)},${F(th2 * .16)})"/>`;
      g += `<path d="${poly([A, Lm, ...edge, Rm])}" fill="${o.mid}"/>`;
      const shade = s < 0 ? [A, [x, yb - 2], ...edge.filter(p => p[0] > x), Rm] : [A, Lm, ...edge.filter(p => p[0] < x), [x, yb - 2]];
      g += `<path d="${poly(shade)}" fill="${o.dark}"/>`;
      const le = edge.filter(p => (p[0] - x) * s > w * .45); if (s > 0) le.reverse();
      g += `<path d="${poly([A, s < 0 ? Lm : Rm, ...le, [x + s * w * .34, yb - th2 * .28]])}" fill="${o.lit}"/>`;
      if (h > 60) for (let k = 0; k < w / 2.5; k++) { const py = ya + th2 * (.45 + r() * .5), lim = w * (py - ya) / th2, px = x + (r() - .5) * 2 * lim * .9, sd = px < x ? -1 : 1;
        g += `<path d="M${F(px)},${F(py)} l${F(sd * 4)},${F(4 + r() * 4)}" stroke="${sd === s ? mix(o.lit, "#c8e0e8", .25) : mix(o.dark, "#000", .35)}" stroke-width="1.3" opacity=".75"/>`; }
      // snow shelf on the tier: lit side white, shaded side blue, lumps at the tips
      const sy = ya + th2 * .64, sw = w * .6, n = Math.max(4, Math.round(sw / 5)), bump = [];
      for (let k = 0; k <= n; k++) { const px = x - sw + 2 * sw * k / n; bump.push([px, sy + (Math.abs(px - x) / sw) * th2 * .06 + (k % 2 ? 2 + r() * 3 : -1 - r() * 2) * Math.min(1, h / 120)]); }
      g += `<path d="${poly([A, [x - sw * .55, ya + th2 * .38], ...bump, [x + sw * .55, ya + th2 * .38]])}" fill="${o.snowDark}"/>`;
      const lb = bump.filter(p => (p[0] - x) * s > -1); if (s > 0) lb.reverse();
      g += `<path d="${poly([A, [x + s * sw * .55, ya + th2 * .38], ...lb, [x - s * sw * .1, sy + 2]])}" fill="${o.snowLit}"/>`;
      edge.forEach((p, k) => { if (k % 2 || r() < .35) return; const lt = (p[0] - x) * s > 0, rw = 1.5 + w * .07;
        g += `<ellipse cx="${F(p[0])}" cy="${F(p[1] - rw * .5)}" rx="${F(rw)}" ry="${F(rw * .5)}" fill="${lt ? o.snowLit : o.snowDark}"/>`; });
    }
    g += `<path d="M${F(x)},${F(top - 2)} l${F(-h * .015)},${F(h * .05)} h${F(h * .03)}Z" fill="${o.snowLit}"/>`;
    return g;
  };

  /* near spruce for the foreground: every tier is a fan of drooping branches,
     each branch built from many small serrated needle sprays, shaded by side
     (toward / away from the light) and by depth (back branches darker), with
     lumpy snow pillows resting on top of the branches and a tapered, barked
     trunk that shows between tiers. Uses its own random stream. */
  const nearSpruce = (x, y, h, o) => {
    const rn = rng(Math.round(x * 13 + h * 7)), s = o.lx < x ? -1 : 1, k = h / 380;
    const ramp = [mix(o.dark, "#000", .4), o.dark, mix(o.dark, o.mid, .5), o.mid, mix(o.mid, o.lit, .5), o.lit, mix(o.lit, o.hl, .3), mix(o.lit, o.hl, .55)];
    const sprig = (px, py, a, L, wd, col) => {
      const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, l = [], rr = [], n = 5;
      for (let i = 1; i <= n; i++) { const t = i / n, ww = wd * (1 - t * .65) * (i % 2 ? 1 : .4), cx = px + ca * L * t * .92, cy = py + sa * L * t * .92;
        l.push([cx + nx * ww - ca * L * .1, cy + ny * ww - sa * L * .1]); rr.push([cx - nx * ww - ca * L * .1, cy - ny * ww - sa * L * .1]); }
      return `<path d="${poly([[px, py], ...l, [px + ca * L, py + sa * L], ...rr.reverse()])}" fill="${col}"/>`;
    };
    const tw = h * .042, top = y - h, bot = y - h * .2, tiers = Math.max(5, Math.round(h / 36));
    const lump = (cx, cy, rx, ry, a, col) => { const n = 7, pts = [];
      for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, q = .78 + rn() * .3, ex = Math.cos(t) * rx * q, ey = Math.sin(t) * ry * q * (Math.sin(t) > 0 ? .7 : 1.1);
        pts.push([cx + ex * Math.cos(a) - ey * Math.sin(a), cy + ex * Math.sin(a) + ey * Math.cos(a)]); }
      return `<path d="${poly(pts)}" fill="${col}"/>`; };
    let back = "", front = "";
    for (let t = 0; t < tiers; t++) {
      const u = t / (tiers - 1), yb = bot - (bot - top - h * .04) * Math.pow(u, .92), w = h * .4 * Math.pow(1 - u, .85) + h * .035;
      const droop = w * .36, nb = Math.max(3, Math.round(w / 13)), lift = h * .05 * (1 - u * .5);
      // shaded mass under the tier, so it reads solid
      const mass = [[x, yb - lift - h * .02]];
      for (let i = 0; i <= 14; i++) { const q = -1 + 2 * i / 14, px = x + q * w * .92, py = yb + h * .005 + Math.abs(q) * droop * .85 + (i % 2 ? -droop * .3 * Math.abs(q) : rn() * 3);
        mass.push([px, py]); }
      back += `<path d="${poly(mass)}" fill="${ramp[0]}" opacity=".92"/>`;
      // the tier above throws a soft dark band over the top of the tier below it
      if (t > 0) front += `<path d="${poly(mass)}" fill="${ramp[0]}" opacity=".55" transform="translate(${F(-s * 3 * k)},${F(9 * k)})"/>`;
      // inner foliage filling the body of the tier, darker toward the shaded side and underneath
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
            let v = (toward ? .52 : .18) + q * (toward ? .28 : .1) + (off < 0 ? .12 : -.1) + (isFront ? .08 : -.18) + (1 - u) * -.04 + (rn() - .5) * .22;
            g += sprig(px, py, a, L, wd, ramp[Math.max(1, Math.min(7, Math.floor(v * 8)))]);
          }
        }
        if (isFront) for (let i = 2; i <= steps; i++) {
          const q = i / steps; if (rn() < (q > .35 ? .15 : .75) || q > .97) continue;
          const [px, py] = at(q), [ax, ay] = at(Math.max(0, q - .08)), a = Math.atan2(py - ay, Math.abs(px - ax) || 1) * .8;
          const ang = side * a, rx = (6 + rn() * 7) * k * (1.2 - q * .45), ry = (2.8 + rn() * 2) * k;
          const lit = toward ? (q > .2 || rn() < .6) : rn() < .22;
          g += lump(px, py - ry * .2, rx * .95, ry * .7, ang, mix(o.snowDark, o.dark, .22));
          g += lump(px, py - ry * .85, rx, ry, ang, lit ? o.snowLit : o.snowDark);
          if (rn() < .5) g += lump(px + (rn() - .5) * rx, py - ry * 1.3, rx * .5, ry * .6, ang, lit ? "#ffffff" : mix(o.snowDark, o.snowLit, .4));
        }
        if (isFront) front += g; else back += g;
      }
    }
    // trunk: tapered, bark lines, lit edge toward the light
    let tr = `<path d="M${F(x - tw)},${F(y)} C${F(x - tw * .8)},${F(y - h * .4)} ${F(x - tw * .3)},${F(top + h * .3)} ${F(x)},${F(top + 4)} C${F(x + tw * .3)},${F(top + h * .3)} ${F(x + tw * .8)},${F(y - h * .4)} ${F(x + tw)},${F(y)}Z" fill="${o.trunk}"/>`;
    tr += `<path d="M${F(x + s * tw * .95)},${F(y)} C${F(x + s * tw * .75)},${F(y - h * .4)} ${F(x + s * tw * .28)},${F(top + h * .3)} ${F(x)},${F(top + 6)} L${F(x + s * tw * .2)},${F(top + h * .3)} C${F(x + s * tw * .4)},${F(y - h * .4)} ${F(x + s * tw * .5)},${F(y - h * .2)} ${F(x + s * tw * .45)},${F(y)}Z" fill="${mix(o.trunk, o.hl, .4)}"/>`;
    for (let i = 0; i < 26; i++) { const py = y - rn() * h * .8, wid = tw * (1 - (y - py) / h * .7), px = x + (rn() - .5) * wid * 1.2;
      tr += `<path d="M${F(px)},${F(py)} q${F((rn() - .5) * 3)},${F(-6 - rn() * 8)} ${F((rn() - .5) * 2)},${F(-12 - rn() * 10)}" stroke="${mix(o.trunk, "#000", .4)}" stroke-width="1.3" fill="none" opacity=".7"/>`; }
    // snow tuft on the leader
    const tip = `<path d="M${F(x)},${F(top - 4)} q${F(-5 * k)},${F(8 * k)} ${F(-7 * k)},${F(14 * k)} q${F(7 * k)},${F(3 * k)} ${F(14 * k)},0 q${F(-3 * k)},${F(-6 * k)} ${F(-7 * k)},${F(-14 * k)}Z" fill="${o.snowLit}"/>`;
    return `<path d="M${F(x - h * .3)},${F(y - 2)} L${F(x + h * .3)},${F(y - 2)}" stroke="${o.snowDark}" stroke-width="10" opacity=".5"/>` + tr + back + front + tip;
  };

  const SKY_H = K("#2c5c72", "#dce8f2"), HAZE = K("#3a6a80", "#c6d6e8");
  const SNOW = K({ lit: "#dfeaf6", mid: "#a8bcd6", dark: "#6c82a8", deep: "#4a5c84" }, { lit: "#fbfdff", mid: "#d6e3f1", dark: "#9cb4d4", deep: "#7690b8" });
  let s = `<defs id="wadefs">
    <linearGradient id="waSky" x1="0" y1="0" x2="0" y2="460" gradientUnits="userSpaceOnUse">${K(`<stop offset="0" stop-color="#040a1c"/><stop offset=".4" stop-color="#0b1a38"/><stop offset=".78" stop-color="#153556"/>`, `<stop offset="0" stop-color="#2a62b4"/><stop offset=".4" stop-color="#5c98d6"/><stop offset=".78" stop-color="#a6cae8"/>`)}<stop offset="1" stop-color="${SKY_H}"/></linearGradient>
    <radialGradient id="waMoonG" cx="${MX}" cy="${MY}" r="700" gradientUnits="userSpaceOnUse">${K(`<stop offset="0" stop-color="#f0f4ff" stop-opacity=".6"/><stop offset=".12" stop-color="#d0dcf8" stop-opacity=".25"/><stop offset=".5" stop-color="#9ab0e0" stop-opacity=".07"/><stop offset="1" stop-color="#9ab0e0" stop-opacity="0"/>`, `<stop offset="0" stop-color="#fffaf0" stop-opacity=".9"/><stop offset=".16" stop-color="#fff4dc" stop-opacity=".42"/><stop offset=".5" stop-color="#ffeccc" stop-opacity=".1"/><stop offset="1" stop-color="#ffeccc" stop-opacity="0"/>`)}</radialGradient>
    <radialGradient id="waAuroraG" cx="1300" cy="250" r="1000" gradientUnits="userSpaceOnUse" gradientTransform="translate(1300 250) scale(1 .45) translate(-1300 -250)"><stop offset="0" stop-color="#58f0b0" stop-opacity="${K(".35", "0")}"/><stop offset=".5" stop-color="#40c8a0" stop-opacity="${K(".1", "0")}"/><stop offset="1" stop-color="#40c8a0" stop-opacity="0"/></radialGradient>
    <linearGradient id="waRay" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b8ffd8" stop-opacity=".95"/><stop offset=".08" stop-color="#62f5b4" stop-opacity=".8"/><stop offset=".35" stop-color="#34d49a" stop-opacity=".35"/><stop offset=".7" stop-color="#3a8aa0" stop-opacity=".12"/><stop offset=".88" stop-color="#b070e0" stop-opacity=".14"/><stop offset="1" stop-color="#b070e0" stop-opacity="0"/></linearGradient>
    <radialGradient id="waGlow"><stop offset="0" stop-color="#ffc060" stop-opacity="${K(".85", "0")}"/><stop offset=".35" stop-color="#ffb050" stop-opacity="${K(".3", "0")}"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
    <radialGradient id="waPane" cx=".5" cy=".6" r=".7">${K(`<stop offset="0" stop-color="#fff2b0"/><stop offset=".6" stop-color="#ffc35a"/><stop offset="1" stop-color="#e8862a"/>`, `<stop offset="0" stop-color="#b4d0e4"/><stop offset=".6" stop-color="#6a8aa6"/><stop offset="1" stop-color="#3e5672"/>`)}</radialGradient>
    <linearGradient id="waHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HAZE}" stop-opacity="0"/><stop offset=".6" stop-color="${HAZE}" stop-opacity=".6"/><stop offset="1" stop-color="${HAZE}" stop-opacity="0"/></linearGradient>
    <linearGradient id="waHill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K("#8aa2c2", "#c6d6e8")}"/><stop offset="1" stop-color="${K("#6a82a6", "#a8bcd6")}"/></linearGradient>
    <linearGradient id="waHill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K("#9cb2d0", "#dae6f2")}"/><stop offset="1" stop-color="${K("#7890b4", "#b6cae0")}"/></linearGradient>
    <linearGradient id="waField" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K("#c8d8ec", "#f6f9fd")}"/><stop offset=".45" stop-color="${SNOW.mid}"/><stop offset="1" stop-color="${SNOW.dark}"/></linearGradient>
    <linearGradient id="waWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${K("#7a5840", "#9a7050")}"/><stop offset=".5" stop-color="${K("#5e4230", "#7a5638")}"/><stop offset="1" stop-color="${K("#3e2c22", "#5a3e2a")}"/></linearGradient>
    <filter id="waLeafy" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="waLeafyS" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".2" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="waCloudy" x="-20%" y="-40%" width="140%" height="180%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="2.4"/></filter>
    <filter id="waAur" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".004 .03" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.6"/></filter>
    <filter id="waAurGlow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="waPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .6 0"/></filter>
    <filter id="waSoft"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="waSoft3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#waSky)"/>`;

  /* stars: dense, thinning toward the horizon and under the aurora. By day the
     night sky is still generated (same random draws, same layout) but not drawn. */
  const s0 = s;
  for (let i = 0; i < 700; i++) { const x = r() * W, y = Math.pow(r(), 1.3) * 420;
    s += `<circle cx="${F(x)}" cy="${F(y)}" r="${r() < .06 ? 1.8 : .5 + r() * .7}" fill="${r() < .15 ? "#fff0d8" : "#e6eeff"}" opacity="${F(.2 + r() * .7 * (1 - y / 480))}"/>`; }
  /* moon */
  s += `<rect width="${W}" height="${H}" fill="url(#waMoonG)"/><circle cx="${MX}" cy="${MY}" r="${MR}" fill="#f4f6ff"/>`;
  [[-8, -6, 10, 7], [9, 4, 9, 6], [-4, 10, 6, 5]].forEach(([dx, dy, rx, ry]) => s += `<path d="${blobP(MX + dx, MY + dy, rx, ry, 7)}" fill="#c8d0e6" opacity=".55"/>`);
  s += `<circle cx="${MX}" cy="${MY}" r="${MR}" fill="none" stroke="#ffffff" stroke-width="1.5" opacity=".7"/>`;
  /* aurora: three curtains of vertical rays, bright green hem, violet crown, soft glow behind */
  s += `<rect width="${W}" height="${H}" fill="url(#waAuroraG)"/>`;
  const env = x => Math.max(0, Math.min(1, (x - 780) / 320)) * Math.max(0, Math.min(1, (1930 - x) / 400));
  const curtains = [
    { base: x => 300 + Math.sin(x / 260 + 1) * 34 + Math.sin(x / 90) * 8, hgt: x => 150 + Math.sin(x / 180 + 2) * 50, k: 1 },
    { base: x => 250 + Math.sin(x / 330 + 3) * 40 + Math.sin(x / 70 + 1) * 6, hgt: x => 120 + Math.sin(x / 150) * 40, k: .7 },
    { base: x => 340 + Math.sin(x / 210 + 5) * 26, hgt: x => 90 + Math.sin(x / 120 + 1) * 30, k: .55 } ];
  let glow = "", rays = "";
  curtains.forEach(c => {
    let hem = "M";
    for (let x = 560; x < 2200; x += 3) { const e = env(x) * c.k; if (e <= .01) continue;
      const b = c.base(x), h = c.hgt(x) * (.75 + r() * .5), a = e * (.35 + r() * .65);
      rays += `<rect x="${x}" y="${F(b - h)}" width="3.4" height="${F(h)}" fill="url(#waRay)" opacity="${F(a)}"/>`;
      if (x % 12 === 0) hem += `${x},${F(b)} L`; }
    glow += `<path d="${hem.slice(0, -2)}" stroke="#5cf0b0" stroke-width="60" fill="none" opacity="${.35 * c.k}"/>`;
    rays += `<path d="${hem.slice(0, -2)}" stroke="#d8ffe8" stroke-width="2" fill="none" opacity="${.35 * c.k}"/>`;
  });
  s += `<g filter="url(#waAurGlow)">${glow}</g><g filter="url(#waAur)">${rays}</g>`;
  s += `<g opacity=".05" filter="url(#waSoft)">`;
  for (let k = 0; k < 7; k++) { const a = .55 + k * .3, L = 800;
    s += `<path d="M${MX},${MY} L${F(MX + Math.cos(a - .035) * L)},${F(MY + Math.sin(a - .035) * L)} L${F(MX + Math.cos(a + .035) * L)},${F(MY + Math.sin(a + .035) * L)}Z" fill="#eef4ff"/>`; }
  s += `</g>`;
  if (DAY) {
    s = s0 + `<rect width="${W}" height="${H}" fill="url(#waMoonG)"/><circle cx="${MX}" cy="${MY}" r="50" fill="#fff6dc" opacity=".35"/><circle cx="${MX}" cy="${MY}" r="38" fill="#fffcf0"/>`;
    s += `<g class="rays" opacity=".12" filter="url(#waSoft)">`;
    for (let k = 0; k < 7; k++) { const a = .55 + k * .3, L = 900;
      s += `<path d="M${MX},${MY} L${F(MX + Math.cos(a - .04) * L)},${F(MY + Math.sin(a - .04) * L)} L${F(MX + Math.cos(a + .04) * L)},${F(MY + Math.sin(a + .04) * L)}Z" fill="#fff"/>`; }
    s += `</g>`;
  }
  const DEFS = s.slice(0, s.indexOf("</defs>") + 7);
  const skyPart = s; s = DEFS;

  /* clouds: a few thin, cold wisps, lit on the moon side */
  const cloud = (x, y, w, cls) => {
    let c = `<g class="${cls}" opacity=".85"><g filter="url(#waCloudy)">`;
    const lobes = [], lean = x < MX ? 1 : -1;
    for (let k = 0; k < 14; k++) { const t = r(); lobes.push([x + (t - .5) * w, y - Math.sin(t * Math.PI) * w * .05 * (.4 + r() * 1.2) + (r() - .5) * w * .03, w * (.03 + r() * .06)]); }
    lobes.sort((a, b) => a[0] - b[0]);
    if (DAY) {
      c += `<ellipse cx="${x}" cy="${F(y + w * .01)}" rx="${F(w * .5)}" ry="${F(w * .03)}" fill="#bccce0"/>`;
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.8)}" ry="${F(R * .6)}" fill="#cad8e8"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly - R * .25)}" rx="${F(R * 1.4)}" ry="${F(R * .55)}" fill="#f2f6fb"/>`);
      lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .5)}" rx="${F(R * .7)}" ry="${F(R * .3)}" fill="#ffffff"/>`);
      return c + `</g></g>`;
    }
    c += `<ellipse cx="${x}" cy="${F(y + w * .01)}" rx="${F(w * .5)}" ry="${F(w * .025)}" fill="#1c2c4c"/>`;
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly + R * .2)}" rx="${F(R * 2)}" ry="${F(R * .45)}" fill="#1c2c4c"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx)}" cy="${F(ly)}" rx="${F(R * 1.5)}" ry="${F(R * .34)}" fill="#34486e"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .3)}" cy="${F(ly - R * .18)}" rx="${F(R * .65)}" ry="${F(R * .18)}" fill="#8a9cc4"/>`);
    lobes.forEach(([lx, ly, R]) => c += `<ellipse cx="${F(lx + lean * R * .45)}" cy="${F(ly - R * .24)}" rx="${F(R * .3)}" ry="${F(R * .08)}" fill="#d8e2f6" opacity=".7"/>`);
    return c + `</g></g>`;
  };
  s += cloud(380, 180, 460, "drift1") + cloud(2220, 150, 480, "drift2") + cloud(640, 300, 280, "drift3") + cloud(2020, 310, 300, "drift2");
  const cloudPart = s; s = DEFS;

  /* snowy mountains, two ranges, with haze between */
  s += mountains({ base: 432, hi: 285, lo: 360, step: 175, lx: MX, lit: K("#7a92b8", "#a2b6d2"), mid: K("#5a7098", "#8298bc"), dark: K("#3e5078", "#667ca4"), snow: .5, snowLit: K("#d6e4f4", "#ffffff"), snowDark: K("#8ea4c8", "#b8c8e0") });
  s += `<rect x="0" y="340" width="${W}" height="120" fill="url(#waHaze)" opacity=".75"/>`;
  s += mountains({ base: 458, hi: 368, lo: 420, step: 110, lx: MX, lit: K("#6a84aa", "#90a8c8"), mid: K("#4e6690", "#728cb2"), dark: K("#344a72", "#56709a"), snow: .42, snowLit: K("#c8d8ec", "#f8fbff"), snowDark: K("#7a92b8", "#a8bcd8") });
  s += `<rect x="0" y="410" width="${W}" height="80" fill="url(#waHaze)" opacity=".8"/>`;

  /* forest bands of little snowy spruces */
  const forest = (fn, rows, size, haze, conSize) => {
    const trees = []; let f = "";
    for (let row = 0; row < rows; row++) for (let x = -10; x < W + 10; x += size * (.55 + r() * .5)) {
      if (r() < .12) continue;
      trees.push([x + r() * size * .4, fn(x) + row * size * .55 + size * .5 + r() * size * .3, size * conSize * (.7 + r() * .6)]); }
    trees.sort((a, b) => a[1] - b[1]);
    trees.forEach(([x, y, h]) => f += spruce(x, y, h, { lx: MX, trunk: mix(K("#2a2024", "#4a3428"), HAZE, haze), dark: mix(K("#0e1a26", "#1a3a36"), HAZE, haze), mid: mix(K("#18303a", "#2a5048"), HAZE, haze), lit: mix(K("#2e4e54", "#4a7a64"), HAZE, haze * .8),
      snowLit: mix(K("#e8f0fa", "#ffffff"), HAZE, haze * .4), snowDark: mix(K("#8aa0c4", "#a8bcd8"), HAZE, haze * .5) }));
    return f;
  };
  const h1 = wave([2, 4, 0], [300, 130, 55], [16, 7, 3]), h2 = wave([5, 1, 3], [380, 160, 70], [22, 9, 4]);
  const hill1 = x => 462 + h1(x), hill2 = x => 515 + h2(x);
  s += `<path d="${ridgePath(hill1)}" fill="url(#waHill1)"/>`;
  s += `<g filter="url(#waLeafyS)">${forest(hill1, 2, 11, .5, 2.4)}</g>`;
  s += `<rect x="0" y="465" width="${W}" height="70" fill="url(#waHaze)" opacity=".55"/>`;
  s += `<path d="${ridgePath(hill2)}" fill="url(#waHill2)"/>`;
  s += `<g filter="url(#waLeafyS)">${forest(hill2, 2, 18, .18, 2.6)}</g>`;

  /* the clearing: snowfield with drifts, lit edges and blue hollows */
  const fld = wave([1, 4, 2], [420, 170, 60], [6, 3, 1.5]);
  const field = x => 552 + fld(x) + Math.max(0, 1 - Math.abs(x - 1300) / 500) * -6;
  s += `<path d="${ridgePath(field)}" fill="url(#waField)"/>`;
  s += `<path d="${line(Array.from({ length: 161 }, (_, i) => [i * 16, field(i * 16) + 1]))}" stroke="#f4f8ff" stroke-width="2.5" fill="none" opacity=".6"/>`;
  for (let k = 0; k < 9; k++) { const cx = 100 + k * 300 + r() * 120, cy = 590 + r() * 90, w = 180 + r() * 220, hh = 10 + r() * 12;
    s += `<path d="M${F(cx - w)},${F(cy)} Q${F(cx - w * .2)},${F(cy - hh * 2)} ${F(cx + w)},${F(cy + 2)} Q${F(cx)},${F(cy - hh * .4)} ${F(cx - w)},${F(cy)}Z" fill="${SNOW.dark}" opacity=".45"/>`;
    s += `<path d="M${F(cx - w)},${F(cy - 1)} Q${F(cx - w * .2)},${F(cy - hh * 2 - 1)} ${F(cx + w)},${F(cy + 1)}" stroke="${SNOW.lit}" stroke-width="2.5" fill="none" opacity=".75"/>`; }
  /* wind ripples, stalks poking through, half-buried rocks */
  for (let k = 0; k < 220; k++) { const x = r() * W, y = field(x) + 12 + Math.pow(r(), .8) * (H - field(x) - 12), t = (y - 550) / 170, L = 14 + r() * 40 * (.5 + t);
    s += `<path d="M${F(x)},${F(y)} q${F(L / 2)},${F(-2 - t * 2)} ${F(L)},0" stroke="${r() < .5 ? SNOW.dark : "#f2f7fd"}" stroke-width="${F(1 + t)}" fill="none" opacity="${F(.3 + r() * .3)}"/>`; }
  for (let k = 0; k < 60; k++) { const x = r() * W, y = field(x) + 8 + r() * (H - field(x) - 20), h = 6 + r() * 14 * (.5 + (y - 550) / 170);
    if (Math.abs(x - 1300) < 160 && y < 600) continue;
    for (let j = 0; j < 4; j++) s += `<path d="M${F(x + j * 2.5)},${F(y)} q${F((r() - .5) * 4)},${F(-h * .6)} ${F((r() - .5) * 8)},${F(-h)}" stroke="${j % 2 ? "#6a5a4a" : "#9a8468"}" stroke-width="1.3" fill="none"/>`; }
  for (let k = 0; k < 10; k++) { const x = 60 + r() * 2440, y = field(x) + 30 + r() * 110, R = 10 + r() * 16;
    if (Math.abs(x - 1300) < 200) continue;
    s += `<path d="${blobP(x, y, R, R * .5, 7)}" fill="${K("#4a5470", "#5a6070")}"/><path d="${blobP(x - R * .25, y - R * .15, R * .55, R * .28, 6)}" fill="${K("#7a86a4", "#8e94a4")}"/><path d="${blobP(x + R * .1, y - R * .38, R * .85, R * .2, 7)}" fill="${SNOW.lit}"/>`; }
  /* long cool shadows cast by the flanking spruces, away from the moon */
  [[1560, 300], [1650, 210], [1040, 320], [960, 190]].forEach(([x, h]) => { const y = field(x) + 8;
    s += `<path d="M${x - 30},${F(y)} L${F(x + h * .9)},${F(y + 26)} L${F(x + h * .8)},${F(y + 34)} L${x - 36},${F(y + 6)}Z" fill="${SNOW.deep}" opacity=".3" filter="url(#waSoft3)"/>`; });

  /* the cabin */
  const CX = 1300, CY = field(1300) + 4;
  const cabin = (cx, yb) => {
    let c = "";
    const L = cx - 115, R = cx + 115, wt = yb - 100;
    c += `<ellipse cx="${cx + 20}" cy="${yb + 4}" rx="190" ry="14" fill="${SNOW.deep}" opacity=".5"/>`;
    // side gable wall (lit, facing the moon) and front log wall
    c += `<path d="${poly([[L - 44, yb - 8], [L - 44, wt - 8], [L - 22, wt - 52], [L, wt], [L, yb]])}" fill="${K("#8a6446", "#a87c58")}"/>`;
    for (let y = wt; y < yb; y += 10) c += `<path d="M${L - 44},${y - 8 + (y - wt) * .0} L${L},${y}" stroke="#4a3222" stroke-width="2" opacity=".5"/>`;
    c += `<rect x="${L}" y="${wt}" width="${R - L}" height="${yb - wt}" fill="url(#waWall)"/>`;
    for (let y = wt + 2, k = 0; y < yb; y += 11, k++) {
      c += `<rect x="${L - 6}" y="${y}" width="${R - L + 12}" height="10" rx="5" fill="${k % 2 ? K("#6a4a34", "#86603f") : K("#72503a", "#906a48")}" opacity=".9"/><rect x="${L - 6}" y="${y + 1}" width="${(R - L) * .4}" height="3" rx="1.5" fill="${K("#a07a58", "#c8a078")}" opacity=".55"/><rect x="${L - 6}" y="${y + 7}" width="${R - L + 12}" height="3" fill="#2a1c14" opacity=".45"/>`;
      c += `<circle cx="${L - 6}" cy="${y + 5}" r="5" fill="#b08a64"/><circle cx="${L - 6}" cy="${y + 5}" r="2.5" fill="#8a6446"/><circle cx="${R + 6}" cy="${y + 5}" r="5" fill="#5a4030"/>`; }
    c += `<rect x="${cx + 30}" y="${wt}" width="${R - cx - 30}" height="${yb - wt}" fill="#000" opacity=".12"/>`;
    // windows and door, warm
    [[L + 34, wt + 28], [cx + 52, wt + 28]].forEach(([x, y]) => {
      c += `<circle cx="${x + 18}" cy="${y + 18}" r="62" fill="url(#waGlow)" opacity=".55"/><rect x="${x - 4}" y="${y - 4}" width="44" height="44" fill="#3a2618"/><rect x="${x}" y="${y}" width="36" height="36" fill="url(#waPane)"/>
        <path d="M${x + 18},${y} v36 M${x},${y + 18} h36" stroke="#3a2618" stroke-width="3"/><path d="M${x - 6},${y + 40} h48" stroke="#eef4fc" stroke-width="5" stroke-linecap="round"/>`;
      if (DAY) c += `<path d="M${x + 3},${y + 14} L${x + 14},${y + 3} M${x + 21},${y + 32} L${x + 33},${y + 20}" stroke="#eaf4fa" stroke-width="3" opacity=".5"/>`; });
    c += `<rect x="${cx - 26}" y="${yb - 62}" width="40" height="62" fill="#3a2618"/><rect x="${cx - 22}" y="${yb - 58}" width="32" height="58" fill="#5a3a24"/><rect x="${cx - 16}" y="${yb - 52}" width="20" height="14" fill="url(#waPane)"/><circle cx="${cx + 4}" cy="${yb - 28}" r="2" fill="#ffd070"/>`;
    // lantern by the door
    c += `<circle cx="${cx + 24}" cy="${yb - 50}" r="40" fill="url(#waGlow)" opacity=".75"/><rect x="${cx + 19}" y="${yb - 58}" width="10" height="15" rx="2" fill="${K("#ffd070", "#c8d2d8")}"/><path d="M${cx + 17},${yb - 58} h14 l-7,-6Z" fill="#2a1c14"/>`;
    // roof: shaded front plane, snow blanket with lit top, overhang and icicles
    c += `<path d="${poly([[L - 30, wt + 4], [L - 6, wt - 72], [R + 20, wt - 72], [R + 40, wt + 4]])}" fill="#3a2a24"/>`;
    const sn = [[L - 36, wt + 2]]; for (let k = 0; k <= 16; k++) { const x = L - 36 + (R - L + 80) * k / 16; sn.push([x, wt + 8 + (k % 2 ? 4 + r() * 4 : 0)]); }
    c += `<path d="${poly([[L - 12, wt - 86], [R + 24, wt - 86], [R + 44, wt + 2], ...sn.slice().reverse()])}" fill="${SNOW.mid}"/>`;
    c += `<path d="${poly([[L - 12, wt - 86], [cx + 20, wt - 88], [cx - 10, wt - 40], [L - 30, wt - 6]])}" fill="${SNOW.lit}"/>`;
    for (let k = 0; k < 14; k++) { const x0 = L + r() * (R - L), y0 = wt - 76 + r() * 64, w0 = 20 + r() * 40;
      c += `<path d="M${F(x0)},${F(y0)} q${F(w0 / 2)},${F(-3 - r() * 3)} ${F(w0)},${F(1)}" stroke="${x0 < cx ? "#ffffff" : SNOW.dark}" stroke-width="2" fill="none" opacity=".5"/>`; }
    c += `<path d="M${cx + 20},${wt - 88} L${cx - 10},${wt - 40} L${L - 30},${wt - 6}" stroke="#ffffff" stroke-width="2" fill="none" opacity=".35"/>`;
    c += `<path d="M${L - 12},${wt - 86} Q${cx},${wt - 94} ${R + 24},${wt - 86}" stroke="#f6faff" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    c += `<path d="M${L - 36},${wt + 6} ${sn.slice(1).map(p => `L${F(p[0])},${F(p[1] + 2)}`).join(" ")}" stroke="${SNOW.dark}" stroke-width="3" fill="none" opacity=".7"/>`;
    for (let x = L - 26; x < R + 36; x += 9 + r() * 10) { const len = 6 + r() * 16; c += `<path d="M${F(x - 2)},${F(wt + 9)} L${F(x)},${F(wt + 9 + len)} L${F(x + 2)},${F(wt + 9)}Z" fill="#d8e8f8" opacity=".85"/>`; }
    // stone chimney with snow cap
    const chx = R - 50, cht = wt - 138;
    c += `<rect x="${chx}" y="${cht}" width="34" height="${wt - 60 - cht}" fill="#5a5a66"/><rect x="${chx}" y="${cht}" width="14" height="${wt - 60 - cht}" fill="#7a7a88"/>`;
    for (let y = cht + 6; y < wt - 64; y += 9) for (let x = chx + ((y / 9) % 2 ? 0 : 6); x < chx + 32; x += 12) c += `<rect x="${x}" y="${y}" width="10" height="7" rx="2" fill="none" stroke="#3a3a44" stroke-width="1" opacity=".55"/>`;
    c += `<path d="${blobP(chx + 17, cht - 2, 22, 6, 8)}" fill="${SNOW.mid}"/><path d="${blobP(chx + 12, cht - 4, 14, 4, 7)}" fill="${SNOW.lit}"/>`;
    // woodpile under a snow cap, left
    for (let row = 0; row < 4; row++) for (let k = 0; k < 7 - row; k++) { const x = L - 100 + k * 13 + row * 6.5, y = yb - 7 - row * 12;
      c += `<circle cx="${F(x)}" cy="${F(y)}" r="6.5" fill="#8a6446"/><circle cx="${F(x - 1)}" cy="${F(y - 1)}" r="4.5" fill="#c49a70"/><circle cx="${F(x - 1)}" cy="${F(y - 1)}" r="1.8" fill="#8a6446"/>`; }
    c += `<path d="${blobP(L - 66, yb - 50, 36, 7, 9)}" fill="${SNOW.lit}"/>`;
    // sled leaning on the wall, stump with axe
    c += `<ellipse cx="${R + 52}" cy="${yb + 2}" rx="46" ry="5" fill="${SNOW.deep}" opacity=".5"/>`;
    c += `<path d="M${R + 12},${yb - 3} H${R + 78} Q${R + 96},${yb - 3} ${R + 96},${yb - 19} Q${R + 96},${yb - 29} ${R + 86},${yb - 27}" stroke="#7a2a20" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    c += `<path d="M${R + 12},${yb - 5} H${R + 78} Q${R + 92},${yb - 5} ${R + 93},${yb - 18}" stroke="#c0503a" stroke-width="2.5" fill="none"/>`;
    for (let k = 0; k < 5; k++) c += `<path d="M${R + 18 + k * 14},${yb - 6} v-5" stroke="#4a1a14" stroke-width="2"/>`;
    c += `<path d="M${R + 16},${yb - 9} Q${R + 50},${yb - 14} ${R + 80},${yb - 9}" stroke="${SNOW.lit}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    c += `<ellipse cx="${R + 110}" cy="${yb - 2}" rx="20" ry="6" fill="${SNOW.deep}" opacity=".6"/><rect x="${R + 94}" y="${yb - 22}" width="30" height="22" fill="#5a4030"/><rect x="${R + 94}" y="${yb - 22}" width="11" height="22" fill="#8a6446"/><ellipse cx="${R + 109}" cy="${yb - 23}" rx="16" ry="5" fill="${SNOW.lit}"/>`;
    c += `<path d="M${R + 112},${yb - 26} L${R + 128},${yb - 50}" stroke="#6a4a30" stroke-width="3.5"/><path d="M${R + 122},${yb - 52} l12,4 l-3,8 l-12,-4Z" fill="#8a94a4"/>`;
    // warm light spilling onto the snow
    c += `<ellipse cx="${cx - 10}" cy="${yb + 22}" rx="170" ry="20" fill="url(#waGlow)" opacity=".4"/>`;
    return c;
  };

  /* big spruces flanking the cabin, behind it */
  const bigT = K({ lx: MX, trunk: "#3a2820", dark: "#0c1a22", mid: "#173236", lit: "#2c5454", snowLit: "#eef4fc", snowDark: "#94aacc" },
    { lx: MX, trunk: "#5a3c2a", dark: "#143830", mid: "#245242", lit: "#44805e", snowLit: "#ffffff", snowDark: "#a8bedc" });
  s += `<g filter="url(#waLeafyS)">${spruce(1560, field(1560) + 6, 300, bigT)}${spruce(1650, field(1650) + 10, 210, bigT)}${spruce(1040, field(1040) + 6, 320, bigT)}${spruce(960, field(960) + 12, 190, bigT)}</g>`;
  s += cabin(CX, CY);
  s += `<g class="smoke" opacity=".5">${[0, 1, 2, 3, 4].map(k => `<circle cx="${F(1382 + k * 8)}" cy="${F(CY - 250 - k * 20)}" r="${6 + k * 4}" fill="${K("#c8d0e0", "#eef2f6")}" opacity="${F(.55 - k * .1)}"/>`).join("")}</g>`;

  /* trail from the door toward us, with footprints and fence posts */
  s += `<path d="M1270,${F(CY + 2)} C1250,600 1330,630 1250,720 L1330,720 C1400,630 1320,600 1310,${F(CY + 2)}Z" fill="${SNOW.dark}" opacity=".55"/>`;
  s += `<path d="M1270,${F(CY + 2)} C1250,600 1330,630 1250,720" stroke="${SNOW.lit}" stroke-width="2" fill="none" opacity=".7"/>`;
  for (let k = 0; k < 16; k++) { const t = k / 15, y = CY + 8 + t * 150, x = 1292 + Math.sin(t * 3) * 20 + (k % 2 ? 7 : -7) * (1 + t);
    s += `<ellipse cx="${F(x)}" cy="${F(y)}" rx="${F(3 + t * 3)}" ry="${F(1.6 + t * 1.6)}" fill="${SNOW.deep}" opacity=".6"/>`; }
  for (let k = 0; k < 7; k++) { const x = 820 + k * 50, y = field(x) + 18 + k * 2;
    s += `<rect x="${x - 3}" y="${F(y - 34)}" width="7" height="34" fill="#4a3426"/><rect x="${x - 3}" y="${F(y - 34)}" width="3" height="34" fill="#7a5a40"/><ellipse cx="${x + .5}" cy="${F(y - 35)}" rx="6" ry="3" fill="${SNOW.lit}"/>`;
    if (k < 6) s += `<path d="M${x},${F(y - 24)} L${x + 50},${F(y - 22)} M${x},${F(y - 12)} L${x + 50},${F(y - 10)}" stroke="#4a3426" stroke-width="3"/><path d="M${x},${F(y - 26)} L${x + 50},${F(y - 24)}" stroke="${SNOW.lit}" stroke-width="2.5"/>`; }

  /* a deer at the edge of the clearing, right */
  const deer = (x, y, k) => {
    let d = `<ellipse cx="${x}" cy="${y + 2}" rx="${34 * k}" ry="${5 * k}" fill="${SNOW.deep}" opacity=".45"/>`;
    const leg = (lx, dx, c) => `<path d="M${F(lx)},${F(y - 30 * k)} q${F(dx * k)},${F(14 * k)} ${F(dx * .3 * k)},${F(30 * k)}" stroke="${c}" stroke-width="${F(3.2 * k)}" fill="none" stroke-linecap="round"/>`;
    d += leg(x + 12 * k, -3, "#3a2c26") + leg(x - 14 * k, 3, "#3a2c26");
    d += `<ellipse cx="${x}" cy="${F(y - 36 * k)}" rx="${F(22 * k)}" ry="${F(11 * k)}" fill="#6a5040"/><ellipse cx="${F(x - 3 * k)}" cy="${F(y - 40 * k)}" rx="${F(17 * k)}" ry="${F(6 * k)}" fill="#8e7058"/><ellipse cx="${x}" cy="${F(y - 30 * k)}" rx="${F(17 * k)}" ry="${F(4 * k)}" fill="#4a362c"/>`;
    d += leg(x + 16 * k, 2, "#5a4436") + leg(x - 10 * k, -2, "#5a4436");
    const P = (dx, dy) => `${F(x + dx * k)},${F(y + dy * k)}`;
    d += `<path d="${blobP(x - 16 * k, y - 38 * k, 10 * k, 11 * k, 8)}" fill="#6a5040"/><path d="${blobP(x - 19 * k, y - 41 * k, 6 * k, 7 * k, 7)}" fill="#8e7058"/>`;
    d += `<path d="M${P(-22, -32)} Q${P(-27, -52)} ${P(-35, -63)} L${P(-24, -76)} Q${P(-14, -58)} ${P(-5, -44)}Z" fill="#6a5040"/>`;
    d += `<path d="M${P(-22, -34)} Q${P(-27, -52)} ${P(-35, -63)} L${P(-31, -67)} Q${P(-23, -54)} ${P(-17, -38)}Z" fill="#9a7a60"/>`;
    d += `<path d="M${P(-33, -60)} q${F(-2 * k)},${F(8 * k)} ${F(-1 * k)},${F(14 * k)}" stroke="#e8e0d4" stroke-width="${F(3 * k)}" fill="none" opacity=".8"/>`;
    d += `<path d="M${P(-22, -78)} Q${P(-34, -82)} ${P(-47, -70)} Q${P(-47, -65)} ${P(-41, -64)} Q${P(-32, -64)} ${P(-26, -67)} Q${P(-19, -71)} ${P(-22, -78)}Z" fill="#8a6a52"/>`;
    d += `<path d="M${P(-22, -78)} Q${P(-34, -82)} ${P(-47, -70)} Q${P(-36, -74)} ${P(-24, -72)}Z" fill="#b08e72"/>`;
    d += `<circle cx="${F(x - 46 * k)}" cy="${F(y - 68 * k)}" r="${F(2.2 * k)}" fill="#1a1210"/><circle cx="${F(x - 33 * k)}" cy="${F(y - 73 * k)}" r="${F(1.6 * k)}" fill="#1a1210"/>`;
    d += `<ellipse cx="${F(x - 18 * k)}" cy="${F(y - 81 * k)}" rx="${F(6.5 * k)}" ry="${F(2.8 * k)}" fill="#7a5c48" transform="rotate(-25 ${F(x - 18 * k)} ${F(y - 81 * k)})"/><ellipse cx="${F(x - 18 * k)}" cy="${F(y - 81 * k)}" rx="${F(4 * k)}" ry="${F(1.4 * k)}" fill="#c8a890" transform="rotate(-25 ${F(x - 18 * k)} ${F(y - 81 * k)})"/>`;
    d += `<path d="M${P(-25, -80)} q${F(-2 * k)},${F(-14 * k)} ${F(6 * k)},${F(-24 * k)} M${P(-24, -92)} l${F(-8 * k)},${F(-6 * k)} M${P(-21, -99)} l${F(-4 * k)},${F(-9 * k)} M${P(-29, -80)} q${F(-9 * k)},${F(-8 * k)} ${F(-8 * k)},${F(-22 * k)} M${P(-35, -92)} l${F(-6 * k)},${F(-3 * k)}" stroke="#c8b49c" stroke-width="${F(2.2 * k)}" fill="none" stroke-linecap="round"/>`;
    d += `<ellipse cx="${F(x + 22 * k)}" cy="${F(y - 40 * k)}" rx="${F(3 * k)}" ry="${F(4 * k)}" fill="#f0e8e0"/>`;
    return d;
  };
  s += deer(1880, field(1880) + 26, 1.25);

  /* foreground: near spruces at the edges, snowy shrubs, drift lips */
  const nearT = K({ lx: MX, trunk: "#3a2820", hl: "#9aa8c8", dark: "#08141a", mid: "#12282c", lit: "#2a5250", snowLit: "#f2f7fd", snowDark: "#8ea4c8" },
    { lx: MX, trunk: "#5a3a26", hl: "#e8d8b0", dark: "#0e2a24", mid: "#1e4a3c", lit: "#3e7a58", snowLit: "#ffffff", snowDark: "#a4bad8" });
  s += `<g filter="url(#waLeafyS)">${nearSpruce(2380, 735, 230, nearT)}${nearSpruce(70, 740, 380, nearT)}${nearSpruce(2490, 740, 400, nearT)}</g>`;
  const shrub = (x, y, R) => { let b = ""; const pts = [];
    for (let k = 0; k < 80; k++) { const a = r() * Math.PI, d = Math.sqrt(r()), px = x + Math.cos(a) * d * R * 1.1, py = y - Math.sin(a) * d * R * .7;
      pts.push([px, py, ((MX - px) / 2400 + (y - py) / R) * .5 + r() * .35]); }
    pts.sort((a, b) => a[2] - b[2]);
    const BR = K(["#0e1a20", "#16262c", "#1e3438", "#2a4446", "#6c82a8", "#a8bcd6", "#dfeaf6"], ["#1a3028", "#24403a", "#30544a", "#406a58", "#9cb4d4", "#d6e3f1", "#ffffff"]);
    b += `<path d="${blobP(x, y + 6, R * 1.15, R * .45)}" fill="${K("#0c161c", "#14261e")}"/>`;
    pts.forEach(([px, py, v]) => b += `<path d="${blobP(px, py, 8 + r() * 7, 6 + r() * 5, 6)}" fill="${BR[Math.max(0, Math.min(6, Math.floor(v * 7)))]}"/>`);
    return `<g filter="url(#waLeafy)">${b}</g>`; };
  s += shrub(200, 725, 80) + shrub(2280, 728, 70) + shrub(700, 712, 40) + shrub(1900, 716, 44);

  /* light + paper: cool moon, green aurora wash on the snow */
  s += `<rect width="${W}" height="${H}" fill="url(#waMoonG)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#waAuroraG)" style="mix-blend-mode:soft-light"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#waPaper)" opacity=".1" style="mix-blend-mode:multiply"/>`;
  const wrap = x => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${x}</svg>`;
  if (opts.part === "sky") return wrap(skyPart);
  if (opts.part === "clouds") return wrap(cloudPart);
  if (opts.part === "land") return wrap(s);
  return wrap(skyPart + cloudPart.slice(DEFS.length) + s.slice(DEFS.length));
}
