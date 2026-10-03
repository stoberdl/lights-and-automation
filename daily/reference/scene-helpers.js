/* One renderer for every daily scene. A scene is data: a sky, a light source,
   depth layers far -> near, props that sit on a layer, and a weather overlay.
   Uniformity comes from the rules here, not from each scene:
   - horizon band and composition are fixed; the subject lives in x 900-1700
   - every layer's colour is interpolated sky -> land -> ink by depth
   - props are silhouettes in their layer's colour; every light uses spec.glow
   - the same grain, vignette and edge shading go over everything          */
const SW = 2560, SH = 720;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hx(c){c=c.replace('#','');return[0,2,4].map(i=>parseInt(c.substr(i,2),16))}
function mix(a,b,t){const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.max(0,Math.min(255,Math.round(v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('')}

function ridge(r, y, amp, kind){
  const n = kind === "mountains" ? 60 : 80, ph = [r()*6, r()*6, r()*6], pts = [];
  const f1 = kind === "mountains" ? 330 + r()*120 : 520 + r()*200;
  for (let i = 0; i <= n; i++) {
    const x = i / n * SW; let v;
    if (kind === "mountains") v = (1 - Math.abs(Math.sin(x/f1 + ph[0]))) * .62 + (1 - Math.abs(Math.sin(x/(f1*.43) + ph[1]))) * .28 + r() * .1;
    else v = (Math.sin(x/f1 + ph[0])*.5+.5)*.65 + (Math.sin(x/(f1*.4) + ph[1])*.5+.5)*.3 + (Math.sin(x/90 + ph[2])*.5+.5)*.05;
    pts.push([x, y - v * amp]);
  }
  return pts;
}
const yAt = (pts, x) => { const i = Math.min(pts.length - 2, Math.floor(x / SW * (pts.length - 1)));
  const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0 || 1); };
const pathOf = pts => "M0," + SH + " " + pts.map(p => "L" + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ") + ` L${SW},${SH} Z`;

/* ------------------------------------------------------------------ props */
const P = {
  pines(c, o, r, pts, S) {          // tree line along the ridge
    let s = "";
    for (let x = o.from ?? 0; x < (o.to ?? SW); x += 10 + r() * (o.gap ?? 22)) {
      const y = yAt(pts, x) + 6, h = (o.h ?? 70) * (.55 + r() * .7), w = h * .36;
      s += `<path d="M${x},${y - h} L${x + w},${y} L${x - w},${y}Z" fill="${c}"/>`;
      if (o.snow) s += `<path d="M${x},${y - h} L${x + w*.2},${y - h*.8} L${x + w*.05},${y - h*.83} L${x - w*.08},${y - h*.78} L${x - w*.2},${y - h*.8}Z" fill="#e6eef6" opacity=".8"/>`;
    }
    return s;
  },
  maples(c, o, r, pts, S) {         // deciduous trees, foliage from o.leaf
    let s = "";
    (o.at || []).forEach(([x, sc]) => {
      const y = yAt(pts, x) + 4, h = 150 * sc;
      s += `<path d="M${x-5*sc},${y} L${x-3*sc},${y-h*.55} L${x+3*sc},${y-h*.55} L${x+5*sc},${y}Z" fill="${c}"/>`;
      for (let k = 0; k < 14; k++) {
        const a = r() * Math.PI * 2, d = r() * 48 * sc;
        s += `<circle cx="${x + Math.cos(a)*d*1.2}" cy="${y - h*.72 + Math.sin(a)*d*.8}" r="${(22 + r()*18)*sc}" fill="${o.leaf[k % o.leaf.length]}"/>`;
      }
    });
    return s;
  },
  cabin(c, o, r, pts, S) {
    const x = o.x, y = yAt(pts, x) + 2, w = 90 * (o.s || 1), h = 58 * (o.s || 1);
    let s = `<rect x="${x - w/2}" y="${y - h}" width="${w}" height="${h}" fill="${c}"/>
      <path d="M${x - w/2 - 12},${y - h} L${x},${y - h - 44*(o.s||1)} L${x + w/2 + 12},${y - h}Z" fill="${c}"/>
      <rect x="${x + w*.18}" y="${y - h - 40*(o.s||1)}" width="${12*(o.s||1)}" height="${30*(o.s||1)}" fill="${c}"/>
      <rect x="${x - w*.3}" y="${y - h*.66}" width="${w*.22}" height="${h*.34}" fill="${S.glow}"/>
      <rect x="${x + w*.08}" y="${y - h*.66}" width="${w*.22}" height="${h*.34}" fill="${S.glow}"/>
      <circle cx="${x}" cy="${y - h*.5}" r="${w*1.1}" fill="url(#glowR)" opacity=".55"/>`;
    if (o.snow) s += `<path d="M${x - w/2 - 12},${y - h} L${x},${y - h - 44*(o.s||1)} L${x + w/2 + 12},${y - h} L${x + w/2},${y - h + 6} L${x},${y - h - 34*(o.s||1)} L${x - w/2},${y - h + 6}Z" fill="#eef4fa"/>`;
    if (o.smoke) for (let k = 0; k < 6; k++) s += `<circle cx="${x + w*.24 + k*9 + Math.sin(k)*8}" cy="${y - h - 50*(o.s||1) - k*22}" r="${8 + k*4}" fill="#c8d0dc" opacity="${.35 - k*.05}"/>`;
    return s;
  },
  rorbu(c, o, r, pts, S) {          // red fishing cabins on stilts (Lofoten)
    let s = "";
    (o.at || []).forEach(x => {
      const y = o.y, w = 70, h = 44;
      s += `<rect x="${x - w/2}" y="${y - h}" width="${w}" height="${h}" fill="#8a2a22"/><path d="M${x - w/2 - 6},${y - h} L${x},${y - h - 30} L${x + w/2 + 6},${y - h}Z" fill="#5a1a16"/>
        <rect x="${x - 10}" y="${y - h + 12}" width="16" height="14" fill="${S.glow}"/>
        ${[-28, -8, 12, 30].map(d => `<rect x="${x + d}" y="${y}" width="4" height="26" fill="${c}"/>`).join("")}
        <rect x="${x - 8}" y="${y + 12}" width="16" height="${30}" fill="${S.glow}" opacity=".25"/>`;
    });
    return s;
  },
  city(c, o, r, pts, S) {           // skyline; windows lit in the scene glow
    let s = "", x = o.from;
    while (x < o.to) {
      const w = 30 + r() * 70, h = (o.h || 160) * (.35 + r() * .9), y = o.y;
      s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h + 2}" fill="${c}"/>`;
      if (r() < .25) s += `<rect x="${x + w*.4}" y="${y - h - 30}" width="3" height="30" fill="${c}"/>`;
      for (let wy = y - h + 10; wy < y - 8; wy += 14) for (let wx = x + 6; wx < x + w - 8; wx += 12)
        if (r() < (o.lit ?? .35)) s += `<rect x="${wx}" y="${wy}" width="5" height="7" fill="${S.glow}" opacity="${.5 + r()*.5}"/>`;
      x += w + 4 + r() * 10;
    }
    return s;
  },
  palms(c, o, r, pts, S) {
    let s = "";
    (o.at || []).forEach(([x, sc, lean]) => {
      const y = o.y ?? yAt(pts, x), h = 380 * sc, tx = x + lean * h * .35, ty = y - h;
      s += `<path d="M${x - 9*sc},${y} Q${x + lean*h*.1},${y - h*.5} ${tx - 4*sc},${ty} L${tx + 4*sc},${ty} Q${x + lean*h*.1 + 14*sc},${y - h*.5} ${x + 9*sc},${y}Z" fill="${c}"/>`;
      for (let k = 0; k < 9; k++) {
        const a = -Math.PI * (.05 + k / 8 * .9) + (r() - .5) * .2, L = (120 + r() * 60) * sc;
        const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .55 + L * .35;
        const mx = tx + Math.cos(a) * L * .5, my = ty + Math.sin(a) * L * .6 - 18 * sc;
        s += `<path d="M${tx},${ty} Q${mx},${my} ${ex},${ey} Q${mx},${my + 16*sc} ${tx},${ty + 6*sc}Z" fill="${c}"/>`;
      }
    });
    return s;
  },
  pumpkins(c, o, r, pts, S) {
    let s = "";
    (o.at || []).forEach(([x, sc]) => {
      const y = yAt(pts, x) + 6, w = 58 * sc, h = 42 * sc;
      s += `<circle cx="${x}" cy="${y - h*.5}" r="${w*1.6}" fill="url(#glowR)" opacity=".7"/>
        <ellipse cx="${x}" cy="${y - h*.5}" rx="${w}" ry="${h*.62}" fill="#d9621a"/><ellipse cx="${x}" cy="${y - h*.5}" rx="${w*.4}" ry="${h*.62}" fill="#ee7a24"/>
        <rect x="${x - 4*sc}" y="${y - h*1.25}" width="${8*sc}" height="${14*sc}" rx="2" fill="#3a4a1a"/>
        <path d="M${x - w*.5},${y - h*.62} l${10*sc},${-12*sc} l${10*sc},${12*sc}Z M${x + w*.12},${y - h*.62} l${10*sc},${-12*sc} l${10*sc},${12*sc}Z" fill="${S.glow}"/>
        <path d="M${x - w*.5},${y - h*.34} q${w*.5},${h*.4} ${w},0 l-${w*.18},${6*sc} -${w*.16},-${5*sc} -${w*.16},${5*sc} -${w*.16},-${5*sc}Z" fill="${S.glow}"/>`;
    });
    return s;
  },
  deadtree(c, o, r, pts, S) {       // crooked Halloween tree
    const x = o.x, y = yAt(pts, x) + 6, sc = o.s || 1;
    let s = `<path d="M${x - 22*sc},${y} Q${x - 6*sc},${y - 120*sc} ${x - 18*sc},${y - 250*sc} L${x + 4*sc},${y - 250*sc} Q${x + 14*sc},${y - 120*sc} ${x + 26*sc},${y}Z" fill="${c}"/>`;
    const br = (bx, by, a, L, w, d) => { if (d > 4) return; const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L;
      s += `<path d="M${bx},${by} Q${(bx + ex)/2 + 12},${(by + ey)/2 - 14} ${ex},${ey}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
      br(ex, ey, a - .5 - r() * .3, L * .66, w * .62, d + 1); br(ex, ey, a + .4 + r() * .3, L * .6, w * .6, d + 1); };
    br(x - 6*sc, y - 240*sc, -2.3, 90*sc, 14*sc, 0); br(x - 6*sc, y - 240*sc, -.9, 100*sc, 14*sc, 0); br(x - 8*sc, y - 170*sc, -2.8, 80*sc, 10*sc, 1);
    return s;
  },
  bats(c, o, r) {
    let s = "";
    for (let k = 0; k < (o.n || 8); k++) {
      const x = o.x + (r() - .5) * o.spread, y = o.y + (r() - .5) * 120, sc = .6 + r() * .8;
      s += `<path transform="translate(${x},${y}) scale(${sc})" d="M0,0 q-10,-12 -24,-8 q6,4 4,10 q-8,-2 -12,4 q14,-2 32,6 q18,-8 32,-6 q-4,-6 -12,-4 q-2,-6 4,-10 q-14,-4 -24,8z" fill="${c}"/>`;
    }
    return s;
  },
  pagodas(c, o, r, pts, S) {        // tiered roofs with upturned eaves
    let s = "";
    (o.at || []).forEach(([x, sc, tiers]) => {
      let y = o.y ?? yAt(pts, x) + 4;
      for (let t = 0; t < tiers; t++) {
        const w = (150 - t * 22) * sc, h = 46 * sc;
        s += `<rect x="${x - w*.32}" y="${y - h}" width="${w*.64}" height="${h}" fill="${c}"/>
          <rect x="${x - w*.2}" y="${y - h*.8}" width="${w*.12}" height="${h*.5}" fill="${S.glow}" opacity=".85"/><rect x="${x + w*.08}" y="${y - h*.8}" width="${w*.12}" height="${h*.5}" fill="${S.glow}" opacity=".85"/>
          <path d="M${x - w*.62},${y - h - 4*sc} Q${x - w*.4},${y - h + 6*sc} ${x - w*.3},${y - h + 2*sc} L${x + w*.3},${y - h + 2*sc} Q${x + w*.4},${y - h + 6*sc} ${x + w*.62},${y - h - 4*sc} L${x + w*.2},${y - h - 22*sc} L${x - w*.2},${y - h - 22*sc}Z" fill="${c}"/>`;
        y -= h + 22 * sc;
      }
      s += `<rect x="${x - 2*sc}" y="${y - 30*sc}" width="${4*sc}" height="${34*sc}" fill="${c}"/>`;
    });
    return s;
  },
  lanterns(c, o, r, pts, S) {       // floating sky lanterns
    let s = "";
    for (let k = 0; k < (o.n || 60); k++) {
      const x = o.from + r() * (o.to - o.from), y = o.top + Math.pow(r(), 1.4) * (o.bottom - o.top), sc = .4 + (y - o.top) / (o.bottom - o.top) * 1.1 * r() + .3;
      s += `<circle cx="${x}" cy="${y}" r="${22*sc}" fill="url(#glowR)" opacity=".8"/><rect x="${x - 6*sc}" y="${y - 9*sc}" width="${12*sc}" height="${16*sc}" rx="${3*sc}" fill="${S.glow}"/>`;
    }
    return s;
  },
};

/* ------------------------------------------------------------------- sky */
function skyLayer(S, r) {
  const [a, b, c] = S.sky;
  let s = `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
    <radialGradient id="glowR"><stop offset="0" stop-color="${S.glow}" stop-opacity=".9"/><stop offset=".35" stop-color="${S.glow}" stop-opacity=".25"/><stop offset="1" stop-color="${S.glow}" stop-opacity="0"/></radialGradient>
    <radialGradient id="celG"><stop offset="0" stop-color="${S.cel?.c || '#fff'}" stop-opacity=".55"/><stop offset=".4" stop-color="${S.cel?.c || '#fff'}" stop-opacity=".12"/><stop offset="1" stop-color="${S.cel?.c || '#fff'}" stop-opacity="0"/></radialGradient>
    <filter id="blur30"><feGaussianBlur stdDeviation="26"/></filter><filter id="blur6"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0"/></filter>
    <linearGradient id="vig" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
    <linearGradient id="vigB" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
  </defs><rect width="${SW}" height="${SH}" fill="url(#sky)"/>`;
  if (S.stars) for (let i = 0; i < S.stars; i++) s += `<circle cx="${r()*SW}" cy="${Math.pow(r(), 1.6) * 460}" r="${r() < .1 ? 1.8 : .9}" fill="#fff" opacity="${.3 + r()*.6}"/>`;
  if (S.aurora) {
    s += `<g filter="url(#blur30)" opacity=".9">`;
    for (let k = 0; k < 5; k++) {
      const y0 = 150 + k * 40, amp = 60 + r() * 60, ph = r() * 6; let d = `M0,${y0}`;
      for (let x = 0; x <= SW; x += 80) d += ` L${x},${y0 + Math.sin(x/300 + ph) * amp}`;
      s += `<path d="${d}" stroke="${k % 2 ? '#5dffb0' : '#39d6a0'}" stroke-width="${70 - k*8}" fill="none" opacity="${.55 - k*.07}"/>`;
      s += `<path d="${d}" stroke="#b07cff" stroke-width="30" fill="none" opacity=".25" transform="translate(0,-90)"/>`;
    }
    s += `</g>`;
    for (let x = 0; x < SW; x += 7) s += `<line x1="${x}" y1="${120 + Math.sin(x/300)*70}" x2="${x}" y2="${300 + Math.sin(x/300 + 1)*60}" stroke="#7affc4" stroke-width="2" opacity="${.05 + r()*.1}"/>`;
  }
  if (S.cel) {
    const { x, y, r: R, c, kind } = S.cel;
    s += `<circle cx="${x}" cy="${y}" r="${R * 6}" fill="url(#celG)"/><circle cx="${x}" cy="${y}" r="${R}" fill="${c}"/>`;
    if (kind === "moon") s += `<circle cx="${x - R*.3}" cy="${y - R*.2}" r="${R*.18}" fill="#000" opacity=".07"/><circle cx="${x + R*.25}" cy="${y + R*.3}" r="${R*.12}" fill="#000" opacity=".06"/>`;
    if (kind === "retro") for (let k = 0; k < 6; k++) s += `<rect x="${x - R}" y="${y + R*.15 + k*R*.15}" width="${R*2}" height="${R*.05 + k*2.4}" fill="${S.sky[2]}"/>`;
  }
  if (S.clouds) for (let i = 0; i < S.clouds; i++) {
    const x = r() * SW, y = 60 + r() * 220, w = 160 + r() * 260;
    s += `<g opacity="${.25 + r()*.35}" filter="url(#blur6)"><ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w*.18}" fill="#fff"/><ellipse cx="${x + w*.25}" cy="${y - w*.1}" rx="${w*.5}" ry="${w*.2}" fill="#fff"/></g>`;
  }
  return s;
}

function weather(kind, r) {
  let s = "";
  if (kind === "rain") {
    s += `<rect width="${SW}" height="${SH}" fill="#2a3444" opacity=".22"/>`;
    for (let i = 0; i < 560; i++) { const x = r()*SW, y = r()*SH, l = 16 + r()*28;
      s += `<line x1="${x}" y1="${y}" x2="${x - l*.22}" y2="${y + l}" stroke="#dbe6f2" stroke-width="${r() < .25 ? 2 : 1.2}" opacity="${.18 + r()*.25}"/>`; }
  } else if (kind === "snow") {
    s += `<rect width="${SW}" height="${SH}" fill="#c8d4e2" opacity=".12"/>`;
    for (let i = 0; i < 900; i++) { const x = r()*SW, y = r()*SH, R = r() < .15 ? 3 + r()*3 : .8 + r()*2;
      s += `<circle cx="${x}" cy="${y}" r="${R}" fill="#fff" opacity="${.35 + r()*.55}"/>`; }
  } else if (kind === "fog") {
    for (let i = 0; i < 6; i++) s += `<rect x="-100" y="${300 + i*60}" width="${SW + 200}" height="90" fill="#dfe4ea" opacity=".14" filter="url(#blur30)"/>`;
  }
  return s;
}

/* ----------------------------------------------------------------- compose */
function renderScene(S) {
  const r = rng(S.seed || 7);
  let s = skyLayer(S, r);
  const n = S.layers.filter(L => L.k !== "water").length;
  let depth = 0, lastPts = null, lastCol = S.sky[2];
  S.layers.forEach(L => {
    if (L.k === "water") {
      const top = mix(S.sky[2], S.ink, .25), bot = mix(S.land, S.ink, .7);
      s += `<defs><linearGradient id="wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>
        <rect x="0" y="${L.y}" width="${SW}" height="${SH - L.y}" fill="url(#wat)"/>`;
      if (S.cel) for (let k = 0; k < 26; k++) { const yy = L.y + 6 + k * 9, w = S.cel.r * (1.4 - k * .03) * (.6 + r() * .8);
        s += `<rect x="${S.cel.x - w}" y="${yy}" width="${w*2}" height="3" rx="1.5" fill="${S.cel.c}" opacity="${.55 - k*.018}"/>`; }
      for (let k = 0; k < 60; k++) s += `<rect x="${r()*SW}" y="${L.y + 4 + r()*(SH - L.y)}" width="${40 + r()*120}" height="1.5" fill="#fff" opacity="${.05 + r()*.08}"/>`;
      return;
    }
    const t = n === 1 ? 1 : depth / (n - 1);
    const col = L.fill || mix(S.sky[2], mix(S.land, S.ink, t * .85), .3 + .7 * t);
    const pts = L.pts || ridge(r, L.y, L.amp || 60, L.k);
    if (L.caps) {
      const id = "cap" + depth;
      s += `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${L.y - L.amp}" x2="0" y2="${L.y}"><stop offset="0" stop-color="#f2f6fa"/><stop offset="${L.caps}" stop-color="#e4ebf2"/><stop offset="${L.caps + .02}" stop-color="${col}"/></linearGradient></defs>`;
      s += `<path d="${pathOf(pts)}" fill="url(#${id})"/>`;
    } else if (!L.bare) s += `<path d="${pathOf(pts)}" fill="${col}"/>`;
    (L.props || []).forEach(p => { s += P[p.k](p.c || col, p, r, pts, S); });
    depth++; lastPts = pts; lastCol = col;
  });
  (S.sprops || []).forEach(p => { s += P[p.k](p.c || S.ink, p, r, null, S); });
  s += weather(S.wx, rng(99));
  s += `<rect width="${SW}" height="${SH}" fill="url(#vig)"/><rect width="${SW}" height="${SH}" fill="url(#vigB)"/>
        <rect width="${SW}" height="${SH}" filter="url(#grain)" opacity=".16"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SW} ${SH}" width="${SW}" height="${SH}">${s}</svg>`;
}

/* ------------------------------------------------------------- 3D world
   Real perspective for anything built, standing or lying in a scene, so depth
   is computed instead of guessed. Units are metres: x right, y up, z away from
   the viewer; sea level is y = 0. The camera stands at x = 0, z = 0, eye
   height C.h, and looks level, so verticals stay vertical and the horizon is
   the straight line y = C.hy on screen (a painter's two-point perspective).
     const w = world3d({ h: 5, hy: 446, f: 2200, light: [-.6,.6,-.2], fog: "#ecd8b8", fogK: .0009, tone: c => c });
     w.terrain({...}); w.house({...}); w.box({...}); w.cyl({...}); w.sprite({...});
     w.draw()                 everything, back to front
     w.draw({ mirror: true }) the same world flipped in the water, for reflections
   Every solid takes x, z (ground position), y (base height, default 0) and yaw
   (degrees; 0 = its front faces the viewer, + turns its right side away).
   Faces are shaded from C.light, fogged by distance, then passed through
   C.tone (night). glow faces (lit windows, lamps) skip shading and tone.    */
function world3d(C) {
  const f = C.f || 2200, cx = C.cx ?? SW / 2, hy = C.hy, eh = C.h, NEAR = C.near || 1;
  const unit = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const L = unit(C.light || [-.6, .6, -.2]);
  const tone = C.tone || (c => c), SHADOW = C.shadow || "#2a2438", RIM = C.rim || "#fff4d8";
  const SHADE = C.shade ?? .5, HI = C.hi ?? .2, FOG = C.fog, FOGK = C.fogK || 0;
  const objs = [], fx = v => (Math.round(v * 10) / 10).toString();
  const proj = p => [cx + f * p[0] / p[2], hy + f * (eh - p[1]) / p[2]];
  const clipBy = (P, d) => { const out = [];
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], da = d(a), db = d(b);
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) { const t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]); } }
    return out; };
  const newell = P => { const n = [0, 0, 0];
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length];
      n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); }
    return unit(n); };
  const mid = P => { const c = [0, 0, 0]; P.forEach(p => { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }); return c.map(v => v / P.length); };
  const fogAt = z => FOG ? 1 - Math.exp(-Math.max(0, z) * FOGK) : 0;
  const flat = (c, z) => tone(FOG ? mix(c, FOG, fogAt(z)) : c);
  const lit = (c, n, z, sh = SHADE) => { const l = Math.max(0, dot(n, L));
    c = mix(c, SHADOW, (1 - l) * sh); if (l > .5) c = mix(c, RIM, (l - .5) * 2 * HI); return flat(c, z); };
  const glowC = (c, z) => FOG ? mix(c, FOG, fogAt(z) * .4) : c;
  const pathOf = (P, M, wet) => {
    let Q = wet ? clipBy(P, p => p[1]) : P;
    if (Q.length < 3) return null;
    if (M) Q = Q.map(p => [p[0], -p[1], p[2]]);
    Q = clipBy(Q, p => p[2] - NEAR);
    if (Q.length < 3) return null;
    return "M" + Q.map(p => { const s = proj(p); return fx(s[0]) + "," + fx(s[1]); }).join("L") + "Z"; };
  const lineOf = (P, M) => { if (P.some(p => p[2] < NEAR)) return null;
    return "M" + P.map(p => { const s = proj(M ? [p[0], -p[1], p[2]] : p); return fx(s[0]) + "," + fx(s[1]); }).join("L"); };
  /* one face: { P, c, two, back, glow, op, wet, up, seam, ln (stroke width m), dec: [faces] } */
  const drawLine = (F, M) => { const d = lineOf(F.P, M); if (!d) return "";
    const z = mid(F.P)[2], wpx = Math.max(F.min ?? .6, F.ln * f / z);
    return `<path d="${d}" stroke="${F.glow ? glowC(F.c, z) : flat(F.c, z)}" stroke-width="${fx(wpx)}" fill="none" stroke-linecap="round"${F.op ? ` opacity="${F.op}"` : ""}/>`; };
  const drawFace = (F, M, oc) => {
    if (F.ln) return drawLine(F, M);
    const c = mid(F.P); let n = newell(F.P), col = F.c;
    if (F.up) { if (n[1] < 0) n = n.map(v => -v); }
    else if (oc && dot(n, sub(c, oc)) < 0) n = n.map(v => -v);
    const cam = [0, M ? -eh : eh, 0], vis = dot(n, sub(cam, c)) > 0;
    if (!vis && !F.two && !F.up) return "";
    if (!vis && F.back) col = F.back;
    if (!vis && !F.up) n = n.map(v => -v);
    const d = pathOf(F.P, M, F.wet); if (!d) return "";
    const fill = F.glow ? glowC(col, c[2]) : lit(col, n, c[2], F.sh);
    let s = `<path d="${d}" fill="${fill}"${F.seam ? ` stroke="${fill}" stroke-width=".8" stroke-linejoin="round"` : ""}${F.op ? ` opacity="${F.op}"` : ""}/>`;
    if (vis && F.dec) F.dec.forEach(D => {
      if (D.ln) { s += drawLine(D, M); return; }
      const dd = pathOf(D.P, M, D.wet); if (!dd) return;
      s += `<path d="${dd}" fill="${D.glow ? glowC(D.c, c[2]) : lit(D.c, n, c[2])}"${D.op ? ` opacity="${D.op}"` : ""}/>`; });
    return s; };
  const drawObj = (o, M) => {
    if (o.raster) return o.draw(M);
    if (o.sprite) {
      if (o.svg === undefined) { const s = proj(o.at); o.base = s; o.svg = o.sprite(s[0], s[1], f / o.at[2], fogAt(o.at[2])); }
      if (!M) return o.svg;
      const m = proj([o.at[0], -o.at[1], o.at[2]]);
      return `<g transform="matrix(1,0,0,-1,0,${fx(o.base[1] + m[1])})">${o.svg}</g>`; }
    const cam = [0, M ? -eh : eh, 0];
    return o.faces.map(F => [F.first ? 1e9 : Math.hypot(...sub(mid(F.P), cam)) - (F.bias || 0), F])
      .sort((a, b) => b[0] - a[0]).map(([, F]) => drawFace(F, M, o.center)).join(""); };
  const add = (faces, o = {}) => {
    const zs = []; faces.forEach(F => F.P.forEach(p => zs.push(p[2])));
    const ob = { faces, center: o.center, key: o.key ?? Math.min(...zs) + (o.bias || 0), noRefl: o.noRefl, tag: o.tag };
    objs.push(ob); return ob; };
  /* local -> world for a solid at x, y, z turned by yaw */
  const frame = o => { const a = (o.yaw || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), X = o.x, Y = o.y || 0, Z = o.z;
    const R = p => [p[0] * c - p[2] * s, p[1], p[0] * s + p[2] * c];
    return { P: p => { const q = R(p); return [X + q[0], Y + q[1], Z + q[2]]; }, R }; };
  const quad = (o3, U, V, N, u0, v0, u1, v1, off = .04) =>
    [[u0, v0], [u1, v0], [u1, v1], [u0, v1]].map(([u, v]) => [0, 1, 2].map(i => o3[i] + U[i] * u + V[i] * v + N[i] * off));

  const api = {
    f, eh, hy, proj, fogAt, add, frame, quad,
    px: z => f / z,
    /* a heightfield; rows are geometric in z so near cells are small. x0/x1 may be
       functions of z so far rows can be wider than near ones. col(x, y, z, n) */
    terrain(o) {
      const nx = o.nx, nz = o.nz, X0 = typeof o.x0 === "function" ? o.x0 : () => o.x0, X1 = typeof o.x1 === "function" ? o.x1 : () => o.x1;
      const zs = Array.from({ length: nz + 1 }, (_, j) => o.z0 * Math.pow(o.z1 / o.z0, j / nz));
      const G = zs.map(z => Array.from({ length: nx + 1 }, (_, i) => { const x = X0(z) + (X1(z) - X0(z)) * i / nx; return [x, o.h(x, z), z]; }));
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
        const P = [G[j][i], G[j][i + 1], G[j + 1][i + 1], G[j + 1][i]];
        if (P.every(p => p[1] < 0)) continue;
        let n = newell(P); if (n[1] < 0) n = n.map(v => -v);
        const c = mid(P);
        objs.push({ faces: [{ P, c: o.col(c[0], c[1], c[2], n), wet: true, up: true, seam: true, sh: o.shade }], key: zs[j + 1] + (o.bias || .01), tag: o.tag }); }
      return api; },
    /* a 2D drawing standing at a world point: fn(sx, sy, pxPerMetre, fog) -> svg */
    sprite(o) { objs.push({ sprite: o.fn, at: [o.x, o.y || 0, o.z], key: o.z + (o.bias || 0), noRefl: o.noRefl, tag: o.tag }); return api; },
    line(P, c, ln, o = {}) { add([{ P, c, ln, glow: o.glow, op: o.op, min: o.min }], { noRefl: o.noRefl, bias: o.bias }); return api; },
    box(o) {
      const { P } = frame(o), w = o.w / 2, d = o.d / 2, h = o.h, c = o.c, t = o.top || c;
      const v = [[-w, 0, -d], [w, 0, -d], [w, 0, d], [-w, 0, d], [-w, h, -d], [w, h, -d], [w, h, d], [-w, h, d]].map(P);
      const faces = [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].map(q => ({ P: q.map(i => v[i]), c, wet: o.wet, glow: o.glow }));
      faces.push({ P: [v[4], v[5], v[6], v[7]], c: t, glow: o.glow });
      if (o.bottom) faces.push({ P: [v[0], v[1], v[2], v[3]], c: o.bottom });
      if (o.dec) o.dec(faces, P);
      return add(faces, { center: P([0, h / 2, 0]), noRefl: o.noRefl, bias: o.bias }); },
    /* frustum / cylinder; r1 = 0 for a cone, n sides */
    cyl(o) {
      const n = o.n || 16, Y = o.y || 0, r1 = o.r1 ?? o.r0, faces = [];
      const ring = (r, y) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 + (o.rot || 0); return [o.x + Math.cos(a) * r, y, o.z + Math.sin(a) * r]; });
      const A = ring(o.r0, Y), B = ring(Math.max(r1, .001), Y + o.h);
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push({ P: [A[i], A[j], B[j], B[i]], c: o.c, seam: true, wet: o.wet, glow: o.glow }); }
      if (r1 > .01 && o.top !== false) faces.push({ P: B, c: o.top || o.c, glow: o.glow && !o.top });
      if (o.bottom) faces.push({ P: A, c: o.bottom });
      return add(faces, { center: [o.x, Y + o.h / 2, o.z], noRefl: o.noRefl, bias: o.bias }); },
    /* clapboard house in several styles. w along the front, d deep, h to the eaves, rh roof rise.
       roof: "gable" (default) | "gambrel" | "saltbox" | "hip" | "shed".
       gable: true turns the ridge front-to-back so a gable end faces the front.
       porch: true adds a front porch on posts; fy < 0: stone foundation down that far.
       Use w.randomHouse(r, {...}) to get a varied house instead of hand-picking. */
    house(o) {
      const { P, R } = frame(o), w = o.w / 2, d = o.d / 2, h = o.h, rh = o.rh, ov = o.ov ?? .35, rr = o.rng || Math.random;
      const wall = o.wall, roof = o.roof, trim = o.trim || "#f2eee4", faces = [], G = !!o.gable, RT = o.roof3 || o.style || "gable";
      const LAMP = C.lamp || "#ffc868", night = !!C.night;
      // roof profile across the ridge: a from -A (front side) to +A, y up; B = half length along the ridge
      const A = G ? w : d, B = G ? d : w;
      const prof = RT === "gambrel" ? [[-A, h], [-A * .58, h + rh * .66], [0, h + rh], [A * .58, h + rh * .66], [A, h]]
        : RT === "saltbox" ? [[-A, h], [-A * .3, h + rh], [A, Math.max(2.4, h - rh * .9)]]
        : RT === "shed" ? [[-A, h + rh], [A, h]]
        : [[-A, h], [0, h + rh], [A, h]];
      const hip = RT === "hip";
      // (along b, across a, y) -> local x, y, z
      const L3 = (b, a, y) => G ? [a, y, b] : [b, y, a];
      const pAt = a => { for (let i = 0; i < prof.length - 1; i++) { const [a0, y0] = prof[i], [a1, y1] = prof[i + 1]; if (a <= a1 + 1e-6) return y0 + (y1 - y0) * (a - a0) / (a1 - a0); } return prof[prof.length - 1][1]; };
      const walls = [
        { n: "front", o: [-w, 0, -d], U: [1, 0, 0], N: [0, 0, -1], len: 2 * w },
        { n: "right", o: [w, 0, -d], U: [0, 0, 1], N: [1, 0, 0], len: 2 * d },
        { n: "back", o: [w, 0, d], U: [-1, 0, 0], N: [0, 0, 1], len: 2 * w },
        { n: "left", o: [-w, 0, d], U: [0, 0, -1], N: [-1, 0, 0], len: 2 * d } ];
      const at = (W, u, v, off = 0) => [W.o[0] + W.U[0] * u + W.N[0] * off, v, W.o[2] + W.U[2] * u + W.N[2] * off];
      walls.forEach(W => {
        // a wall is a gable end when it crosses the ridge; otherwise an eave wall at one end of the profile
        const gableEnd = !hip && (G ? (W.n === "front" || W.n === "back") : (W.n === "left" || W.n === "right"));
        const across = u => { const p = at(W, u, 0); return G ? p[0] : p[2]; };
        let top;                                   // wall top height along u
        if (gableEnd) top = u => pAt(across(u));
        else { const a = G ? (W.n === "left" ? -A : A) : (W.n === "front" ? -A : A); const y = hip ? h : pAt(a); top = () => y; }
        const pts = [at(W, 0, 0), at(W, W.len, 0)];
        if (gableEnd) { const a0 = across(0), a1 = across(W.len), us = prof.map(([a]) => (a - a0) / (a1 - a0) * W.len).filter(u => u > -1e-6 && u < W.len + 1e-6).sort((x, y) => y - x);
          us.forEach(u => pts.push(at(W, u, top(u)))); }
        else { pts.push(at(W, W.len, top(W.len)), at(W, 0, top(0))); }
        const wh = Math.min(top(0), top(W.len));  // the rectangular part
        const dec = [], Uw = R(W.U), Nw = R(W.N), Vw = [0, 1, 0], o3 = P(W.o);
        const q = (u0, v0, u1, v1, c, extra = {}) => dec.push({ P: quad(o3, Uw, Vw, Nw, u0, v0, u1, v1, extra.off ?? .05), c, ...extra });
        if (o.clap !== false) for (let v = .45; v < wh; v += .45) dec.push({ P: [P(at(W, 0, v, .02)), P(at(W, W.len, v, .02))], c: mix(wall, "#000000", .22), ln: .035, min: .35, op: .55 });
        dec.push({ P: [P(at(W, .08, 0, .03)), P(at(W, .08, wh, .03))], c: trim, ln: .18, min: .5 }, { P: [P(at(W, W.len - .08, 0, .03)), P(at(W, W.len - .08, wh, .03))], c: trim, ln: .18, min: .5 });
        dec.push({ P: [P(at(W, 0, wh - .1, .03)), P(at(W, W.len, wh - .1, .03))], c: trim, ln: .2, min: .5 });
        const rows = wh > 5.2 ? [[1, 2.3], [wh - 2.2, wh - .9]] : wh > 2.9 ? [[.95, Math.min(2.25, wh - .5)]] : [];
        const nW = Math.max(1, Math.floor((W.len - .8) / (o.winGap || 2.6))), door = W.n === "front" && o.door !== false ? (o.door ?? .5) * W.len : null;
        const tall = o.winTall ?? 1, glassC = o.glass || "#3e5266";
        rows.forEach(([v0, v1], ri) => { const vm = (v0 + v1) / 2, hv = (v1 - v0) / 2 * tall; v0 = vm - hv; v1 = vm + hv;
          for (let k = 0; k < nW; k++) {
          const u = W.len * (k + .5) / nW;
          if (ri === 0 && door !== null && Math.abs(u - door) < 1.4) continue;
          if (o.win && !o.win(u / W.len, ri, W.n)) continue;
          const lt = night && rr() < .7;
          q(u - .52, v0 - .1, u + .52, v1 + .1, trim);
          q(u - .4, v0, u + .4, v1, lt ? LAMP : glassC, { glow: lt, off: .07 });
          if (!lt) q(u - .4, (v0 + v1) / 2, u, v1, "#a8bccc", { off: .08, op: .35 });
          if (o.shut) { q(u - .9, v0, u - .56, v1, o.shut, { off: .06 }); q(u + .56, v0, u + .9, v1, o.shut, { off: .06 }); } } });
        if (door !== null) { q(door - .62, 0, door + .62, 2.35, trim); q(door - .5, 0, door + .5, 2.2, o.doorC || "#5a3424", { off: .07 }); }
        if (gableEnd && rh > 2.2) { const um = W.len / 2, yb = wh + rh * .28, lt = night && rr() < .5;
          if (top(um) > yb + 1.2) { q(um - .45, yb, um + .45, yb + .8, trim); q(um - .33, yb + .1, um + .33, yb + .7, lt ? LAMP : glassC, { glow: lt, off: .07 }); } }
        if (o.extra) o.extra(W.n, q, W.len);
        faces.push({ P: pts.map(P), c: wall, dec });
      });
      if (o.fy !== undefined && o.fy < 0) {
        const v = [[-w - .15, o.fy, -d - .15], [w + .15, o.fy, -d - .15], [w + .15, o.fy, d + .15], [-w - .15, o.fy, d + .15], [-w - .15, .05, -d - .15], [w + .15, .05, -d - .15], [w + .15, .05, d + .15], [-w - .15, .05, d + .15]].map(P);
        [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]].forEach(qq => faces.push({ P: qq.map(i => v[i]), c: o.stone || "#8a8278" })); }
      if (o.ao !== false) faces.push({ P: [[-w - .9, -d - (o.porch ? 3.2 : 1.1)], [w + .9, -d - (o.porch ? 3.2 : 1.1)], [w + .9, d + .9], [-w - .9, d + .9]].map(p => P([p[0], (o.fy || 0) + .03, p[1]])), c: "#000000", glow: true, op: .16, first: true, up: true });
      // roof planes: each profile segment extruded along the ridge, with overhang; undersides show from below
      const soff = mix(roof, "#000000", .45), seam = mix(roof, "#000000", .3);
      if (hip) { const s = rh / d, ey = h - ov * s, bw = Math.max(.3, w - d);
        const E = [[-w - ov, ey, -d - ov], [w + ov, ey, -d - ov], [w + ov, ey, d + ov], [-w - ov, ey, d + ov]], Rg = [[-bw, h + rh, 0], [bw, h + rh, 0]];
        [[E[0], E[1], Rg[1], Rg[0]], [E[2], E[3], Rg[0], Rg[1]], [E[1], E[2], Rg[1]], [E[3], E[0], Rg[0]]].forEach((pl, i) => faces.push({ P: pl.map(P), c: roof, two: true, back: soff, bias: i ? 0 : -.2 })); }
      else for (let i = 0; i < prof.length - 1; i++) {
        let [a0, y0] = prof[i], [a1, y1] = prof[i + 1]; const sl = (y1 - y0) / (a1 - a0);
        if (i === 0) { a0 -= ov; y0 -= ov * sl; } if (i === prof.length - 2) { a1 += ov; y1 += ov * sl; }
        const pl = [L3(-B - ov, a0, y0), L3(B + ov, a0, y0), L3(B + ov, a1, y1), L3(-B - ov, a1, y1)].map(P);
        faces.push({ P: pl, c: roof, two: true, back: soff, bias: y0 < y1 ? -.2 : 0,
          dec: o.shingle === false ? undefined : [.33, .66].map(t => ({ P: [L3(-B - ov, a0 + (a1 - a0) * t, y0 + (y1 - y0) * t), L3(B + ov, a0 + (a1 - a0) * t, y0 + (y1 - y0) * t)].map(P), c: seam, ln: .04, min: .3, op: .5 })) });
        [-B - ov, B + ov].forEach(b => faces.push({ P: [P(L3(b, a0, y0)), P(L3(b, a1, y1))], c: trim, ln: .2, min: .6, bias: -1 })); }
      if (o.porch) { const pd = 2.4, ph = 2.7, pw = Math.min(w - .3, o.porchW || w - .3);
        const fl = [[-pw, 0, -d], [pw, 0, -d], [pw, 0, -d - pd], [-pw, 0, -d - pd]];
        faces.push({ P: fl.map(p => P([p[0], .45, p[2]])), c: o.porchC || "#9a8a74", up: true, bias: .5 });
        faces.push({ P: [[-pw, 0, -d - pd], [pw, 0, -d - pd], [pw, .45, -d - pd], [-pw, .45, -d - pd]].map(P), c: mix(o.porchC || "#9a8a74", "#000000", .25) });
        faces.push({ P: [[-pw - .2, ph + .45, -d], [pw + .2, ph + .45, -d], [pw + .2, ph - .1, -d - pd - .25], [-pw - .2, ph - .1, -d - pd - .25]].map(P), c: roof, two: true, back: soff, bias: -1.5 });
        const np = Math.max(2, Math.round(pw / 1.6) + 1);
        for (let k = 0; k < np; k++) { const x = -pw + .15 + (2 * pw - .3) * k / (np - 1);
          faces.push({ P: [P([x, .45, -d - pd + .15]), P([x, ph - .05, -d - pd + .15])], c: trim, ln: .16, min: .6, bias: -1.6 }); }
        faces.push({ P: [P([-pw, 1.3, -d - pd + .15]), P([pw, 1.3, -d - pd + .15])], c: trim, ln: .08, min: .4, bias: -1.6 }); }
      if (o.chim !== undefined) { const along = (o.chim - .5) * 2 * B * .8, top = h + rh, cw = .45;
        const [cxl, , czl] = L3(along, hip ? 0 : prof[Math.floor(prof.length / 2)][0], 0);
        const v = [[-cw, 0, -cw], [cw, 0, -cw], [cw, 0, cw], [-cw, 0, cw], [-cw, 1, -cw], [cw, 1, -cw], [cw, 1, cw], [-cw, 1, cw]].map(p => P([cxl + p[0], h + rh * .45 + p[1] * (top - h - rh * .45 + 1.1), czl + p[2]]));
        [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 6, 7]].forEach(qq => faces.push({ P: qq.map(i => v[i]), c: o.chimC || "#8a4a36", bias: -.5 })); }
      return add(faces, { center: P([0, h / 2, 0]), noRefl: o.noRefl, bias: o.bias }); },
    /* a varied house: style, size, colours, porch, chimney, shutters drawn from r(). Pass any
       field to pin it (x, z, y, yaw, fy are required). kind: "village" | "farm" | "cottage" | "grand" */
    randomHouse(r, o) {
      const pick = a => a[Math.floor(r() * a.length)];
      const WALLS = ["#f2ece0", "#e8e0cc", "#9a3a2a", "#d2a448", "#6a8098", "#a8aaa4", "#8a9a78", "#c8b89a", "#4a5a6a", "#b86a4a", "#e4d8b0", "#7a8a8a"];
      const ROOFS = ["#3e4048", "#3e3a3a", "#4a3e3a", "#5a3a2e", "#2e3036", "#6a4a3a", "#3a4a3e", "#7a3a2e"];
      const SHUT = [null, null, "#2a3a32", "#5a1e1a", "#2a2e3a", "#1e2a3a", "#f4f0e6"];
      const kind = o.kind || "village";
      const style = pick(kind === "farm" ? ["gable", "gable", "gambrel", "saltbox", "shed"] : kind === "cottage" ? ["gable", "gable", "hip", "saltbox"] : kind === "grand" ? ["hip", "gable", "gambrel"] : ["gable", "gable", "gable", "hip", "saltbox", "gambrel"]);
      const storeys = style === "shed" ? 1 : kind === "cottage" ? 1 : r() < .55 ? 2 : 1;
      const wl = pick(WALLS), wi = 6 + r() * (kind === "grand" ? 7 : 5), de = 5.5 + r() * 3.5;
      return { w: wi, d: de, h: storeys === 2 ? 5.8 + r() * .8 : 3 + r() * 1.4, rh: style === "shed" ? 1.2 : style === "gambrel" ? 3.4 + r() * 1.2 : 2.2 + r() * 2.2,
        roof3: style, gable: style === "gable" && r() < .38, wall: wl, roof: pick(ROOFS), shut: wl === "#f4f0e6" ? null : pick(SHUT),
        trim: r() < .8 ? "#f2eee4" : pick(["#2e3036", "#e8dcc0", "#6a2a22"]), doorC: pick(["#5a3424", "#2a3a32", "#6a1e1a", "#1e2a3a", "#c8a050"]),
        porch: r() < (kind === "farm" || kind === "grand" ? .55 : .3), chim: r() < .7 ? .15 + r() * .7 : undefined,
        winGap: 2.2 + r() * 1, winTall: .85 + r() * .35, rng: o.rng, ...o };
    },
    /* mountains and other big terrain, shaded per pixel (no facets). A ray is marched along
       every screen column, front to back, through h(x, z); each visible step is lit from the
       light, darkened in hollows and brightened on ridges (ao), then hazed by distance.
       col(x, y, z, n, ao) -> [r, g, b] 0-255 picks rock / snow / forest / grass.
       z0..z1 metres, top..bottom the screen band it may cover. Water (h < 0) is left clear.
       Draw it before nearer things: it is added as the farthest object and mirrors too. */
    raster(o) {
      const sc = o.scale || .5, y0 = o.top ?? 0, y1 = o.bottom ?? hy + 60, Wd = Math.round(SW * sc), Hd = Math.max(1, Math.round((y1 - y0) * sc));
      const Lr = unit(o.light || C.light || [-.6, .6, -.2]), FOGR = hexRGB(o.fog || C.fog || "#c8d0dc"), FK = o.fogK ?? FOGK;
      const amb = o.amb ?? .38, toneR = o.tone || (c => c);
      let svg = null;
      const make = () => {
        const cv = document.createElement("canvas"); cv.width = Wd; cv.height = Hd;
        const ctx = cv.getContext("2d"), img = ctx.createImageData(Wd, Hd), D = img.data, H = o.h;
        for (let i = 0; i < Wd; i++) {
          const dx = (i / sc + .5 - cx) / f; let ytop = Hd, prev = null;
          for (let z = o.z0; z < o.z1; z += Math.max(o.minStep || 1, z * (o.step || .0035))) {
            const x = dx * z, hg = H(x, z), ys = (hy + f * (eh - Math.max(hg, 0)) / z - y0) * sc;
            if (ys >= ytop) continue;
            if (hg < 0) { ytop = Math.max(0, Math.ceil(ys)); prev = null; continue; }        // water hides what is below it
            const e = Math.max(1, z * .002), hx = H(x + e, z), hz = H(x, z + e);
            const n = unit([-(hx - hg) / e, 1, -(hz - hg) / e]);
            const r2 = 20 + z * .012, av = (H(x + r2, z) + H(x - r2, z) + H(x, z + r2) + H(x, z - r2)) / 4;
            const ao = Math.max(-1, Math.min(1, (hg - av) / (r2 * .45)));
            const base = o.col(x, hg, z, n, ao), l = Math.max(0, dot(n, Lr));
            const k = (amb + (1 - amb) * l) * (1 + ao * .22), t = 1 - Math.exp(-z * FK);
            let c = base.map((v, j) => Math.min(255, v * k) * (1 - t) + FOGR[j] * t);
            c = toneR(c);
            const yi = Math.max(0, Math.floor(ys)), span = ytop - yi;
            for (let y = yi; y < ytop; y++) {
              const u = prev && span > 1 ? (y - yi) / span : 0, p = (y * Wd + i) * 4;
              D[p] = c[0] + (prev ? (prev[0] - c[0]) * u : 0); D[p + 1] = c[1] + (prev ? (prev[1] - c[1]) * u : 0); D[p + 2] = c[2] + (prev ? (prev[2] - c[2]) * u : 0); D[p + 3] = 255; }
            ytop = yi; prev = c;
            if (ytop <= 0) break;
          }
        }
        ctx.putImageData(img, 0, 0);
        return cv.toDataURL("image/png"); };
      const ob = { key: o.key ?? o.z0 + 1e6, raster: true, noRefl: o.noRefl, tag: o.tag,
        draw: M => { if (svg === null) svg = make();
          const im = `<image href="${svg}" x="0" y="${fx(y0)}" width="${SW}" height="${fx(y1 - y0)}" preserveAspectRatio="none"/>`;
          if (!M) return im;
          const zm = o.mirrorZ || o.z0 * 2, wl = hy + f * eh / zm;               // waterline at the range's foot
          return `<g transform="matrix(1,0,0,-1,0,${fx(2 * wl)})">${im}</g>`; } };
      objs.push(ob); return ob; },
    draw(opt = {}) { const M = !!opt.mirror;
      return objs.filter(o => !(M && o.noRefl) && (!opt.where || opt.where(o))).sort((a, b) => b.key - a.key).map(o => drawObj(o, M)).join(""); },
  };
  return api;
}

/* ------------------------------------------------------------ noise + mountains
   noise2(seed) -> n(x, y) smooth gradient noise, about -1..1.
   mountainField({ seed, scale, peaks: [{ x, z, h, r | rx, rz }], base, oct, warp }) -> h(x, z)
   in metres: ridged, domain-warped noise shaped by the peaks, so every seed and peak layout
   gives a different range (spurs, gullies and saddles), not one stock silhouette.
   mountainColor({ snow, tree, rock, forest, grass, snowC, gold }) -> col(x, y, z, n, ao) for raster().
   hexRGB / rgbTone: colour helpers for raster tone functions.                     */
function hexRGB(c) { c = c.replace("#", ""); if (c.length === 3) c = c.split("").map(v => v + v).join(""); return [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16)); }
function rgbTone(hexMap) {   // turn a hex -> hex tone (like a scene's T) into an rgb -> rgb one
  return c => hexRGB(hexMap("#" + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")));
}
function noise2(seed = 1) {
  const R = rng(seed), P = new Uint8Array(512), GX = new Float32Array(256), GY = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; const a = R() * Math.PI * 2; GX[i] = Math.cos(a); GY[i] = Math.sin(a); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = P[i]; P[i] = P[j]; P[j] = t; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10), v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
    const g = (h, dx, dy) => GX[h] * dx + GY[h] * dy;
    const a = g(P[P[X] + Y], xf, yf), b = g(P[P[X + 1] + Y], xf - 1, yf), c = g(P[P[X] + Y + 1], xf, yf - 1), d = g(P[P[X + 1] + Y + 1], xf - 1, yf - 1);
    return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 1.41;
  };
}
function mountainField(o) {
  const seed = o.seed || 3, N = noise2(seed), Wn = noise2(seed + 101), sc = o.scale || 1600, oct = o.oct || 8, warp = o.warp ?? .4;
  const peaks = o.peaks || [];
  return (x, z) => {
    const wx = x + Wn(x / sc * 1.1, z / sc * 1.1) * sc * warp, wz = z + Wn(x / sc * 1.1 + 7.3, z / sc * 1.1 + 2.9) * sc * warp;
    let s = 0, amp = 1, fr = 1 / sc, wgt = 1, norm = 0;
    for (let i = 0; i < oct; i++) {
      let n = 1 - Math.abs(N(wx * fr + i * 3.1, wz * fr - i * 1.7)); n *= n; n *= wgt;
      wgt = Math.min(1, n * 1.6); s += n * amp; norm += amp; amp *= .5; fr *= 2.07; }
    s /= norm;
    let m = 0;
    for (const p of peaks) { const dx = (x - p.x) / (p.rx || p.r), dz = (z - p.z) / (p.rz || p.r); m = Math.max(m, p.h * Math.exp(-(dx * dx + dz * dz) * 1.2)); }
    return (o.base || 0) + m * (.32 + 1.05 * s);
  };
}
function mountainColor(o = {}) {
  const N = noise2((o.seed || 5) + 7);
  const SNOW = hexRGB(o.snowC || "#f2f4f8"), ROCK = hexRGB(o.rock || "#8a8478"), ROCK2 = hexRGB(o.rock2 || "#5e5a56"), FOREST = hexRGB(o.forest || "#2e4a34"),
        GOLD = hexRGB(o.gold || "#c8a038"), GRASS = hexRGB(o.grass || "#8a8a48"), SCREE = hexRGB(o.scree || "#a49a8a");
  const snowY = o.snow ?? 1e9, treeY = o.tree ?? 0, goldK = o.goldK ?? 0;
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  return (x, y, z, n, ao) => {
    const k = N(x / 140, z / 140) * .5 + N(x / 37, z / 37) * .25, steep = 1 - n[1];
    let c = lerp(ROCK, ROCK2, .5 + k + steep * .6 - ao * .3);
    if (steep < .25) c = lerp(c, SCREE, .3 - k);
    // forest below the tree line, thinning upward and off steep ground; gold patches in autumn
    const fz = (treeY - y) / 140 + k * .8 - steep * 2.2;
    if (fz > 0) { const tk = N(x / 6, z / 6) * .5 + N(x / 2.5, z / 2.5) * .3; let fc = FOREST.map(v => v * (1 + tk * .55)); if (goldK) fc = lerp(fc, GOLD.map(v => v * (1 + tk * .4)), (N(x / 90 + 3, z / 90) * .5 + .5) * goldK * 1.6 - .3);
      if (y < treeY * .25 && steep < .15) fc = lerp(fc, GRASS, .6);
      c = lerp(c, fc, fz * 3); }
    // snow lies above the snow line on gentler ground and gathers in hollows
    const sz = (y - snowY) / 160 + k * .9 - steep * 1.6 - ao * .25;
    if (sz > 0) c = lerp(c, SNOW, sz * 3);
    return c;
  };
}
