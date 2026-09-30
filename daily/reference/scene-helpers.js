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
