/* Iteration 57: paper covers as journal covers. Every paper is the same white stock with black type; the colour lives
   only in the figure, and each figure is a real chart or diagram of the paper (axes, labels that never overlap, and
   the paper's own numbers where the repo has them). Awards keep their own papers and emblems.
   Keyed by slug; anything without an entry keeps the plain cover. */

// one or two figure colours per paper (ac, ac2, ac3)
const P = {
  'same-result-different-price': { ac: '#2f6f5e', ac2: '#c4873a', motif: 'twin' },
  'off-trial-real-world-weight-loss-on-tirzepatide-semaglutide': { ac: '#2f5f9a', ac2: '#c25b4a', motif: 'cloud' },
  'escalate-or-switch-the-post-titration-glp-1-non-responder': { ac: '#b0702a', ac2: '#2f6f8f', ac3: '#2f6f5e', motif: 'fork' },
  'what-week-8-knows-forecasting-six-month-glp-1-outcomes': { ac: '#a8443a', motif: 'week8' },
  'helical-classification-of-type-b-aortic-dissections': { ac: '#2f5f9a', ac2: '#b03a3a', motif: 'helix' },
  'geometric-analysis-of-aortic-remodeling-after-petticoat-type-b-dissection': { ac: '#9a3b34', ac2: '#2f5f9a', motif: 'arch' },
  'longitudinal-mapping-of-true-lumen-morphology-for-endograft-oversizing': { ac: '#2f7f78', motif: 'lumen' },
  'aortic-remodeling-after-tevar-and-petticoat-complicated-type-b-dissection': { ac: '#8a5a2f', ac2: '#2f5f9a', motif: 'stent' },
  'concordance-of-llms-with-guidelines-at-the-week-8-glp-1-follow-up': { ac: '#2f6f5e', ac2: '#c0462e', motif: 'grid' },
  'branded-wegovy-vs-compounded-semaglutide-cyanocobalamin': { ac: '#5b4b8a', ac2: '#c4873a', motif: 'equiv' },
  'variation-of-reimbursements-within-drgs-in-orthopedic-trauma': { ac: '#8a6a3a', motif: 'boxes' },
  'healthcares-ai-trap': { ac: '#b23a2a', motif: 'trap' },
  'mapping-medi-cal-deserts-in-california': { ac: '#b0532d', ac2: '#2f5f9a', motif: 'desert' },
  'third-party-cardiometabolic-outcomes-in-a-glp-1-telehealth-cohort': { ac: '#a84a55', ac2: '#e8b4ba', motif: 'decomp' },
  'scheduled-jumps-recovering-the-option-implied-probability-of-fda-approval': { ac: '#2f6f5e', ac2: '#b23a2a', motif: 'jump' },
  'the-doctor-will-see-you-now-stakes-verifiability-and-the-supervision-of-clinical-ai': { ac: '#4f6a8c', motif: 'ladder' },
}
for (const k in P) Object.assign(P[k], { bg: '#fbfaf7', ink: '#161616' })
const A = {
  'american-college-of-preventive-medicine': { bg: '#1f2d44', ink: '#efe6cf', ac: '#c9a96a', emblem: 'rosette', dark: true },
  'massachusetts-undergraduate-poetry-festival': { bg: '#f1e9d6', ink: '#2b2a22', ac: '#6d7a45', emblem: 'laurel' },
  'paul-kalanithi-writing-competition': { bg: '#e7e3da', ink: '#1c1c1c', ac: '#7a2e2a', emblem: 'nib' },
  'the-new-yorker': { bg: '#f4efe4', ink: '#141414', ac: '#c4462e', emblem: 'magazine' },
}
export const coverOf = (it) => (it && (P[it.slug] || A[it.slug])) || null
// the spine colour of a 3D plate: a paper's figure colour, an award's paper darkened
export const spineOf = (it) => { const c = coverOf(it); return c ? (P[it.slug] ? c.ac : shade(c.bg, 0.72)) : null }
export const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k))
  return `rgb(${c.join(',')})`
}

// a small seeded random, so a cover never changes between renders
const rng = (seed) => { let s = String(seed).split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 7); return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 } }
const line = (x, pts) => { x.beginPath(); pts.forEach(([a, b], k) => (k ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke() }
const dot = (x, a, b, r, fill = true) => { x.beginPath(); x.arc(a, b, r, 0, Math.PI * 2); fill ? x.fill() : x.stroke() }
const poly = (x, pts) => { x.beginPath(); pts.forEach(([a, b], k) => (k ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fill() }
const tint = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})` }

/* ---------------------------------- figure kit: the same axes, labels and grey on every cover ---------------------------------- */
const GREY = '#6e6b66', RULE = '#b9b5ad', FAINT = '#e7e3db'
const lab = (x, h, t, px, py, align = 'left', color = GREY, size = 13) => { h.caps(x, size, 1.6); x.fillStyle = color; x.textAlign = align; x.fillText(t, px, py); x.textAlign = 'left'; x.letterSpacing = '0px' }
const axes = (x, X, Y, W, H) => { x.strokeStyle = RULE; x.lineWidth = 1.5; x.setLineDash([]); line(x, [[X, Y], [X, Y + H], [X + W, Y + H]]) }
const gridY = (x, X, Y, W, H, n) => { x.strokeStyle = FAINT; x.lineWidth = 1; for (let k = 0; k < n; k++) line(x, [[X, Y + (H * k) / n], [X + W, Y + (H * k) / n]]) }
const key = (x, h, items, X, Y) => { let cx = X; items.forEach(([t, color, kind]) => { x.fillStyle = color; x.strokeStyle = color; x.lineWidth = 3; if (kind === 'line') line(x, [[cx, Y + 7], [cx + 22, Y + 7]]); else if (kind === 'ring') { x.lineWidth = 2; dot(x, cx + 7, Y + 7, 5.5, false) } else dot(x, cx + 7, Y + 7, 6); lab(x, h, t, cx + (kind === 'line' ? 30 : 20), Y); h.caps(x, 13, 1.6); cx += (kind === 'line' ? 30 : 20) + x.measureText(t).width + 28; x.letterSpacing = '0px' }) }

/* ------------------------------------------------ the illustrations, each in its box ------------------------------------------------ */
// iteration 60: editorial illustrations, not charts. One flat picture per paper in its two colours on a tinted panel,
// like a magazine's opinion pages; the caption under it says what the paper found.
const INK = '#161616', PAPER = '#fbfaf7'
const rr = (x, a, b, w, hh, r) => { x.beginPath(); x.roundRect(a, b, w, hh, r); x.fill() }
const big = (x, h, t, px, py, size, color, align = 'center', weight = 700) => { x.font = `${weight} ${size}px ${h.BOOK}`; x.fillStyle = color; x.textAlign = align; x.fillText(t, px, py); x.textAlign = 'left' }
const panel = (x, X, Y, W, H, c) => { x.fillStyle = tint(c.ac, 0.1); x.fillRect(X, Y, W, H) }
const pen = (x, cx, top, len, wd, body, cap, label) => {
  rr(x, cx - wd / 2, top + len * 0.16, wd, len * 0.84, wd * 0.28)
  x.fillStyle = cap; rr(x, cx - wd * 0.42, top, wd * 0.84, len * 0.18, wd * 0.2)
  x.fillStyle = PAPER; x.fillRect(cx - wd * 0.3, top + len * 0.46, wd * 0.6, len * 0.2)
  x.fillStyle = body; x.fillRect(cx - wd * 0.3, top + len * 0.58, wd * 0.6, len * 0.08)
  if (label) { x.fillStyle = label; x.fillRect(cx - wd / 2, top + len * 0.28, wd, len * 0.1) }
  x.fillStyle = INK; x.fillRect(cx - 2, top + len, 4, len * 0.06)
}
const MOTIFS = {
  // two identical pens, two price tags nothing alike
  twin(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    const len = H * 0.62, wd = W * 0.13, top = Y + H * 0.24
    ;[[X + W * 0.3, '$25', 0.1], [X + W * 0.7, '$1,200', 0.02]].forEach(([cx, t, dy]) => {
      x.fillStyle = c.ac; pen(x, cx, top, len, wd, c.ac, INK)
      const tx = cx + wd * 0.9, ty = Y + H * dy + 20
      x.strokeStyle = INK; x.lineWidth = 2; line(x, [[cx + wd * 0.3, top + 6], [tx + 10, ty + 18]])
      x.fillStyle = c.ac2; poly(x, [[tx, ty + 18], [tx + 24, ty], [tx + 128, ty], [tx + 128, ty + 36], [tx + 24, ty + 36]])
      x.fillStyle = PAPER; dot(x, tx + 22, ty + 18, 5)
      big(x, h, t, tx + 78, ty + 7, 24, PAPER)
    })
  },
  // a lab flask tipped over, its contents running out into the world as a winding path
  cloud(x, X, Y, W, H, c) {
    panel(x, X, Y, W, H, c)
    x.save(); x.translate(X + W * 0.3, Y + H * 0.28); x.rotate(-0.95)
    x.fillStyle = PAPER; x.strokeStyle = INK; x.lineWidth = 5
    x.beginPath(); x.moveTo(-18, -90); x.lineTo(18, -90); x.lineTo(18, -30); x.lineTo(70, 60); x.lineTo(-70, 60); x.lineTo(-18, -30); x.closePath(); x.fill(); x.stroke()
    x.fillStyle = c.ac; x.beginPath(); x.moveTo(-50, 25); x.lineTo(50, 25); x.lineTo(70, 60); x.lineTo(-70, 60); x.closePath(); x.fill()
    x.restore()
    x.strokeStyle = c.ac; x.lineWidth = 30; x.lineCap = 'round'
    x.beginPath(); x.moveTo(X + W * 0.38, Y + H * 0.33); x.bezierCurveTo(X + W * 0.9, Y + H * 0.42, X + W * 0.05, Y + H * 0.62, X + W * 0.55, Y + H * 0.72); x.bezierCurveTo(X + W * 0.85, Y + H * 0.79, X + W * 0.7, Y + H * 0.92, X + W * 0.92, Y + H * 0.97); x.stroke(); x.lineCap = 'butt'
    const r = rng('walkers')
    for (let k = 0; k < 9; k++) { const t = 0.1 + k * 0.1, px = X + W * (0.25 + 0.6 * r()), py = Y + H * (0.4 + 0.55 * t); x.fillStyle = k % 3 ? INK : c.ac2; dot(x, px, py - 16, 6); rr(x, px - 5, py - 9, 10, 20, 4) }
  },
  // a signpost at a fork in the road
  fork(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    const cx = X + W / 2, base = Y + H
    x.fillStyle = tint(INK, 0.1); poly(x, [[cx - W * 0.16, base], [cx + W * 0.16, base], [cx + W * 0.05, Y + H * 0.66], [X + W * 0.98, Y + H * 0.5], [X + W * 0.98, Y + H * 0.58], [cx, Y + H * 0.72], [X + W * 0.02, Y + H * 0.58], [X + W * 0.02, Y + H * 0.5], [cx - W * 0.05, Y + H * 0.66]])
    x.strokeStyle = PAPER; x.lineWidth = 4; x.setLineDash([16, 14]); line(x, [[cx, base], [cx, Y + H * 0.7]]); x.setLineDash([])
    x.fillStyle = INK; x.fillRect(cx - 8, Y + H * 0.06, 16, H * 0.74)
    x.fillStyle = c.ac; poly(x, [[cx - 8, Y + H * 0.12], [cx - W * 0.4, Y + H * 0.12], [cx - W * 0.46, Y + H * 0.18], [cx - W * 0.4, Y + H * 0.24], [cx - 8, Y + H * 0.24]])
    x.fillStyle = c.ac2; poly(x, [[cx + 8, Y + H * 0.29], [cx + W * 0.4, Y + H * 0.29], [cx + W * 0.46, Y + H * 0.35], [cx + W * 0.4, Y + H * 0.41], [cx + 8, Y + H * 0.41]])
    big(x, h, 'ESCALATE', cx - W * 0.22, Y + H * 0.18 - 12, 22, PAPER)
    big(x, h, 'SWITCH', cx + W * 0.22, Y + H * 0.35 - 12, 22, PAPER)
  },
  // a calendar torn open at week 8, month 6 showing through
  week8(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    const cx = X + W / 2, cw = W * 0.7, ch = H * 0.86, l = cx - cw / 2, t = Y + H * 0.07
    x.fillStyle = PAPER; rr(x, l + 14, t + 14, cw, ch, 10); x.fillStyle = c.ac; rr(x, l + 14, t + 14, cw, ch * 0.16, 10)
    big(x, h, 'MONTH 6', l + 14 + cw / 2, t + ch * 0.6, 40, c.ac)
    x.fillStyle = PAPER; x.strokeStyle = INK; x.lineWidth = 3
    const tear = [[l, t], [l + cw, t], [l + cw, t + ch * 0.36]]; for (let k = 0; k <= 10; k++) tear.push([l + cw - (cw * k) / 10, t + ch * (0.36 + 0.22 * (k / 10)) + (k % 2 ? 14 : -10)])
    x.beginPath(); tear.forEach(([a, b], k) => (k ? x.lineTo(a, b) : x.moveTo(a, b))); x.lineTo(l, t); x.closePath(); x.fill(); x.stroke()
    x.fillStyle = INK; x.fillRect(l, t, cw, ch * 0.13)
    ;[0.25, 0.5, 0.75].forEach((f) => { x.fillStyle = c.ac; dot(x, l + cw * f, t, 9) })
    big(x, h, 'WEEK 8', l + cw / 2, t + ch * 0.17, 46, INK)
  },
  // the dissection as a twisted ribbon
  helix(x, X, Y, W, H, c) {
    panel(x, X, Y, W, H, c)
    const cx = X + W / 2, L = W * 0.32, n = 90, turns = 1.75
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * turns * Math.PI * 2, a1 = ((k + 1) / n) * turns * Math.PI * 2, y0 = Y + H * 0.04 + (H * 0.92 * k) / n, y1 = Y + H * 0.04 + (H * 0.92 * (k + 1)) / n
      const w0 = L * Math.cos(a0), w1 = L * Math.cos(a1)
      x.fillStyle = (w0 + w1) / 2 >= 0 ? c.ac : c.ac2
      poly(x, [[cx - w0, y0], [cx + w0, y0], [cx + w1, y1 + 0.6], [cx - w1, y1 + 0.6]])
    }
  },
  // the PETTICOAT technique, taken at its word: a petticoat whose net is the stent's mesh
  arch(x, X, Y, W, H, c) {
    panel(x, X, Y, W, H, c)
    const cx = X + W / 2, wt = Y + H * 0.14, hem = Y + H * 0.92, w0 = W * 0.12, w1 = W * 0.44, fans = 8
    x.fillStyle = tint(c.ac, 0.18); poly(x, [[cx - w0, wt], [cx + w0, wt], [cx + w1, hem], [cx - w1, hem]])
    const at = (i, f) => { const xt = cx - w0 + (2 * w0 * i) / fans, xb = cx - w1 + (2 * w1 * i) / fans; return [xt + (xb - xt) * f, wt + (hem - wt) * f] }
    x.strokeStyle = c.ac; x.lineWidth = 2.5
    for (let row = 0; row < 7; row++) for (let i = 0; i < fans; i++) { const f0 = row / 7, f1 = (row + 1) / 7, a = at(i, f0), b = at(i + 1, (f0 + f1) / 2), d = at(i, f1), e = at(i + 1, f0 - (f1 - f0) / 2 > 0 ? f0 - (f1 - f0) / 2 : 0); line(x, [a, b, d]); void e }
    x.fillStyle = c.ac; for (let i = 0; i <= fans * 2; i++) { const [px] = at(i / 2, 1); dot(x, px, hem, W * 0.03) }
    x.fillStyle = c.ac2; rr(x, cx - w0 - 10, wt - 34, (w0 + 10) * 2, 40, 8)
    x.fillStyle = INK; poly(x, [[cx - 22, wt - 30], [cx, wt - 14], [cx + 22, wt - 30], [cx + 22, wt + 2], [cx, wt - 14], [cx - 22, wt + 2]])
  },
  // the aorta sliced like a loaf and fanned out, the true lumen in each slice
  lumen(x, X, Y, W, H, c) {
    panel(x, X, Y, W, H, c)
    const n = 7
    for (let k = n - 1; k >= 0; k--) {
      const cx = X + W * (0.3 + 0.07 * k), cy = Y + H * (0.14 + 0.115 * k), rw = W * 0.26, rh = H * 0.07
      x.fillStyle = PAPER; x.strokeStyle = INK; x.lineWidth = 3; x.beginPath(); x.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2); x.fill(); x.stroke()
      const f = 0.45 + 0.35 * Math.abs(Math.sin(k * 0.9 + 0.4))
      x.fillStyle = tint(c.ac, 0.35); x.beginPath(); x.ellipse(cx + rw * 0.18, cy, rw * 0.62, rh * 0.7, 0, 0, Math.PI * 2); x.fill()
      x.fillStyle = c.ac; x.beginPath(); x.ellipse(cx - rw * (1 - f) * 0.45, cy, rw * f * 0.6, rh * 0.62, 0, 0, Math.PI * 2); x.fill()
    }
  },
  // a tailor's tape measure wound round a vessel: fitting the graft
  stent(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    const L = X + W * 0.34, R = X + W * 0.66, rh = (R - L) * 0.2
    x.fillStyle = tint(c.ac2, 0.3); x.fillRect(L, Y + H * 0.05, R - L, H * 0.9)
    x.fillStyle = tint(c.ac2, 0.45); x.beginPath(); x.ellipse((L + R) / 2, Y + H * 0.05, (R - L) / 2, rh, 0, 0, Math.PI * 2); x.fill()
    x.strokeStyle = INK; x.lineWidth = 3; line(x, [[L, Y + H * 0.05], [L, Y + H * 0.95]]); line(x, [[R, Y + H * 0.05], [R, Y + H * 0.95]])
    for (let k = 0; k < 5; k++) {
      const y0 = Y + H * (0.14 + k * 0.17), tw = 30
      x.fillStyle = '#e8c04a'; poly(x, [[L - 4, y0], [R + 4, y0 + 46], [R + 4, y0 + 46 + tw], [L - 4, y0 + tw]])
      x.strokeStyle = INK; x.lineWidth = 1.5
      for (let t = 0; t <= 12; t++) { const px = L + ((R - L) * t) / 12, py = y0 + (46 * t) / 12; line(x, [[px, py], [px, py + (t % 4 ? 8 : 15)]]) }
    }
    x.fillStyle = '#e8c04a'; poly(x, [[R + 4, Y + H * 0.82 + 46], [X + W * 0.94, Y + H * 0.9], [X + W * 0.94, Y + H * 0.9 + 30], [R + 4, Y + H * 0.82 + 76]])
  },
  // three robot hands up in class; one is holding the wrong answer
  grid(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    ;[0.2, 0.5, 0.8].forEach((f, k) => {
      const cx = X + W * f, aw = W * 0.08, top = Y + aw * 3.6 + H * (0.1 + (k === 1 ? 0 : 0.06))
      x.fillStyle = tint(INK, 0.85); x.fillRect(cx - aw / 2, top + aw * 1.4, aw, Y + H - top - aw * 1.4)
      x.fillStyle = PAPER; dot(x, cx, top + aw * 3.2, aw * 0.32); dot(x, cx, top + aw * 6, aw * 0.32)
      x.fillStyle = INK; rr(x, cx - aw * 0.75, top, aw * 1.5, aw * 1.6, 8)
      for (let j = 0; j < 3; j++) rr(x, cx - aw * 0.6 + j * aw * 0.45, top - aw * 0.7, aw * 0.3, aw * 0.8, 5)
      const wrong = k === 2, cardY = top - aw * 3.4
      x.fillStyle = PAPER; x.strokeStyle = INK; x.lineWidth = 3; x.beginPath(); x.roundRect(cx - aw * 1.1, cardY, aw * 2.2, aw * 2.4, 8); x.fill(); x.stroke()
      big(x, h, wrong ? '✕' : '✓', cx, cardY + aw * 0.5, aw * 1.3, wrong ? c.ac2 : c.ac)
    })
  },
  // the branded pen and its reflection, plain: the same medicine in the mirror
  equiv(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    const mid = Y + H * 0.54, l = X + W * 0.1, len = W * 0.8, th = H * 0.15
    const hpen = (y, dir, label) => {
      const y0 = dir > 0 ? y - th : y, cap = len * 0.16
      x.fillStyle = INK; rr(x, l, y0 + th * 0.12, cap, th * 0.76, 8)
      x.fillStyle = c.ac; rr(x, l + cap - 6, y0, len - cap - len * 0.06, th, th * 0.3)
      x.fillStyle = PAPER; x.fillRect(l + len * 0.5, y0 + th * 0.22, len * 0.18, th * 0.56)
      x.fillStyle = c.ac; x.fillRect(l + len * 0.6, y0 + th * 0.22, len * 0.04, th * 0.56)
      x.fillStyle = INK; x.fillRect(l + len * 0.94 - 6, y0 + th * 0.45, len * 0.06, th * 0.1)
      if (label) { x.fillStyle = c.ac2; x.fillRect(l + len * 0.24, y0, len * 0.2, th); big(x, h, 'BRANDED', l + len * 0.34, y0 + th / 2 - 9, 15, PAPER, 'center') }
    }
    hpen(mid - 10, 1, true)
    x.fillStyle = INK; x.fillRect(X, mid, W, 3)
    x.save(); x.globalAlpha = 0.32; hpen(mid + 10, -1, false); x.restore()
  },
  // three receipts for the same procedure, printed at very different lengths
  boxes(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    ;[0.42, 0.68, 0.95].forEach((f, k) => {
      const rw = W * 0.26, l = X + W * (0.05 + k * 0.32), t = Y + H * 0.02, b = t + H * f * 0.96, teeth = 8
      x.fillStyle = PAPER; x.strokeStyle = INK; x.lineWidth = 2.5
      x.beginPath(); x.moveTo(l, t); x.lineTo(l + rw, t); x.lineTo(l + rw, b); for (let j = teeth; j >= 0; j--) x.lineTo(l + (rw * j) / teeth, b + (j % 2 ? 10 : 0)); x.closePath(); x.fill(); x.stroke()
      x.fillStyle = c.ac; x.fillRect(l + 12, t + 14, rw - 24, 10)
      x.fillStyle = tint(INK, 0.25); for (let y = t + 40; y < b - 40; y += 18) x.fillRect(l + 12, y, (rw - 24) * (0.5 + ((y * 7) % 5) / 10), 6)
      x.fillStyle = INK; x.fillRect(l + 12, b - 26, rw - 24, 3)
    })
  },
  // a mousetrap baited with a stethoscope
  trap(x, X, Y, W, H, c) {
    panel(x, X, Y, W, H, c)
    const l = X + W * 0.06, r = X + W * 0.94, by = Y + H * 0.72, bh = H * 0.14
    x.fillStyle = '#c9a072'; rr(x, l, by, r - l, bh, 10); x.fillStyle = '#a97f52'; x.fillRect(l, by + bh * 0.72, r - l, bh * 0.28)
    x.strokeStyle = INK; x.lineWidth = 6; x.beginPath(); x.moveTo(l + W * 0.12, by); x.lineTo(l + W * 0.12, by - H * 0.36); x.lineTo(l + W * 0.5, by - H * 0.36); x.stroke()
    x.lineWidth = 5; x.beginPath(); x.arc(l + W * 0.22, by - 6, 26, Math.PI, 0); x.stroke()
    x.fillStyle = INK; rr(x, X + W * 0.62, by - 10, W * 0.2, 14, 4)
    x.strokeStyle = INK; x.lineWidth = 7; x.lineCap = 'round'
    x.beginPath(); x.moveTo(X + W * 0.64, by - 18); x.bezierCurveTo(X + W * 0.5, Y + H * 0.2, X + W * 0.95, Y + H * 0.15, X + W * 0.86, Y + H * 0.45); x.stroke()
    x.beginPath(); x.moveTo(X + W * 0.64, by - 18); x.bezierCurveTo(X + W * 0.6, Y + H * 0.3, X + W * 0.7, Y + H * 0.1, X + W * 0.76, Y + H * 0.1); x.stroke(); x.lineCap = 'butt'
    x.fillStyle = c.ac; dot(x, X + W * 0.86, Y + H * 0.47, W * 0.06); x.fillStyle = PAPER; dot(x, X + W * 0.86, Y + H * 0.47, W * 0.03)
  },
  // California as dunes; one small clinic and its long shadow
  desert(x, X, Y, W, H, c) {
    x.fillStyle = tint(c.ac2, 0.12); x.fillRect(X, Y, W, H)
    x.fillStyle = c.ac; dot(x, X + W * 0.78, Y + H * 0.2, W * 0.1)
    const dune = (y0, amp, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(X, Y + H); x.lineTo(X, y0); x.bezierCurveTo(X + W * 0.3, y0 - amp, X + W * 0.6, y0 + amp, X + W, y0 - amp * 0.4); x.lineTo(X + W, Y + H); x.closePath(); x.fill() }
    dune(Y + H * 0.5, H * 0.12, tint(c.ac, 0.35)); dune(Y + H * 0.66, H * 0.1, tint(c.ac, 0.6)); dune(Y + H * 0.82, H * 0.08, c.ac)
    const hx = X + W * 0.3, hy = Y + H * 0.62, hw = W * 0.12
    x.fillStyle = tint(INK, 0.35); poly(x, [[hx, hy], [hx + hw, hy], [hx - W * 0.25, hy + H * 0.14], [hx - W * 0.37, hy + H * 0.14]])
    x.fillStyle = PAPER; x.fillRect(hx, hy - hw * 0.8, hw, hw * 0.8); x.fillStyle = c.ac2; poly(x, [[hx - 6, hy - hw * 0.8], [hx + hw / 2, hy - hw * 1.3], [hx + hw + 6, hy - hw * 0.8]])
    x.fillStyle = c.ac2; x.fillRect(hx + hw / 2 - 4, hy - hw * 0.65, 8, 24); x.fillRect(hx + hw / 2 - 12, hy - hw * 0.65 + 8, 24, 8)
  },
  // a heart in a blood-pressure cuff, outside lab slips pinned to it
  decomp(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    const cx = X + W * 0.45, cy = Y + H * 0.42, s = Math.min(W, H) * 0.34
    x.fillStyle = c.ac; x.beginPath(); x.moveTo(cx, cy + s * 1.05); x.bezierCurveTo(cx - s * 1.5, cy + s * 0.1, cx - s * 0.9, cy - s * 1.0, cx, cy - s * 0.35); x.bezierCurveTo(cx + s * 0.9, cy - s * 1.0, cx + s * 1.5, cy + s * 0.1, cx, cy + s * 1.05); x.fill()
    x.fillStyle = '#5b6470'; x.fillRect(cx - s * 1.05, cy - s * 0.05, s * 2.1, s * 0.42)
    x.strokeStyle = '#3a414a'; x.lineWidth = 2; for (let k = 1; k < 6; k++) line(x, [[cx - s * 1.05 + (s * 2.1 * k) / 6, cy - s * 0.05], [cx - s * 1.05 + (s * 2.1 * k) / 6, cy + s * 0.37]])
    x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.moveTo(cx + s * 1.05, cy + s * 0.16); x.bezierCurveTo(cx + s * 1.6, cy + s * 0.2, cx + s * 1.4, cy + s * 1.1, cx + s * 1.25, cy + s * 1.3); x.stroke()
    x.fillStyle = PAPER; x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.arc(cx + s * 1.25, cy - s * 0.75, s * 0.34, 0, Math.PI * 2); x.fill(); x.stroke()
    x.lineWidth = 3; line(x, [[cx + s * 1.25, cy - s * 0.75], [cx + s * 1.4, cy - s * 0.92]]); line(x, [[cx + s * 1.05, cy - s * 0.4], [cx + s * 1.05, cy + s * 0.05]])
    ;[[-1.15, 0.75], [-0.55, 1.05], [0.35, 0.95]].forEach(([dx, dy], k) => { const px = cx + s * dx, py = cy + s * dy; x.fillStyle = PAPER; x.strokeStyle = INK; x.lineWidth = 2; x.beginPath(); x.rect(px, py, s * 0.55, s * 0.4); x.fill(); x.stroke(); x.fillStyle = tint(INK, 0.3); x.fillRect(px + 8, py + 12, s * 0.38, 4); x.fillRect(px + 8, py + 22, s * 0.28, 4); x.fillStyle = c.ac2; dot(x, px + s * 0.27, py + 4, 6) })
  },
  // a coin in the air over a calendar with one day circled
  jump(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    const l = X + W * 0.1, t = Y + H * 0.52, cw = W * 0.8, ch = H * 0.44, cols = 7, rows = 4
    x.fillStyle = PAPER; rr(x, l, t, cw, ch, 10); x.fillStyle = INK; rr(x, l, t, cw, ch * 0.16, 10); x.fillRect(l, t + ch * 0.08, cw, ch * 0.08)
    for (let j = 0; j < rows; j++) for (let k = 0; k < cols; k++) { const px = l + (cw * (k + 0.5)) / cols, py = t + ch * 0.28 + (ch * 0.68 * j) / rows; x.fillStyle = tint(INK, 0.22); dot(x, px, py + 8, 5) }
    const dx = l + (cw * 4.5) / cols, dy = t + ch * 0.28 + (ch * 0.68 * 2) / rows + 8
    x.strokeStyle = c.ac2; x.lineWidth = 5; dot(x, dx, dy, 24, false)
    x.strokeStyle = INK; x.lineWidth = 2.5; x.setLineDash([8, 9]); x.beginPath(); x.moveTo(dx - 6, dy - 30); x.bezierCurveTo(dx - W * 0.25, Y + H * 0.35, dx - W * 0.2, Y + H * 0.08, X + W * 0.42, Y + H * 0.2); x.stroke(); x.setLineDash([])
    const ccx = X + W * 0.46, ccy = Y + H * 0.2
    x.fillStyle = '#8a6a1f'; x.beginPath(); x.ellipse(ccx + 5, ccy + 9, W * 0.16, W * 0.06, -0.35, 0, Math.PI * 2); x.fill()
    x.fillStyle = c.ac; x.beginPath(); x.ellipse(ccx, ccy, W * 0.16, W * 0.06, -0.35, 0, Math.PI * 2); x.fill()
    x.strokeStyle = PAPER; x.lineWidth = 3; x.beginPath(); x.ellipse(ccx, ccy, W * 0.11, W * 0.035, -0.35, 0, Math.PI * 2); x.stroke()
  },
  // a waiting-room door: a person and a robot behind the frosted glass
  ladder(x, X, Y, W, H, c, h) {
    panel(x, X, Y, W, H, c)
    const dw = W * 0.56, l = X + (W - dw) / 2, t = Y + H * 0.02, dh = H * 0.98
    x.fillStyle = INK; x.fillRect(l - 14, t - 14, dw + 28, dh + 14)
    x.fillStyle = c.ac; x.fillRect(l, t, dw, dh)
    const gl = l + dw * 0.12, gt = t + dh * 0.1, gw = dw * 0.76, gh = dh * 0.44
    x.fillStyle = tint('#ffffff', 0.62); x.fillRect(gl, gt, gw, gh)
    x.fillStyle = tint(INK, 0.28); dot(x, gl + gw * 0.3, gt + gh * 0.5, gw * 0.12); rr(x, gl + gw * 0.12, gt + gh * 0.66, gw * 0.36, gh * 0.34, 24)
    x.fillStyle = tint(c.ac, 0.65); rr(x, gl + gw * 0.58, gt + gh * 0.36, gw * 0.24, gw * 0.22, 8); x.fillRect(gl + gw * 0.69, gt + gh * 0.22, 5, gh * 0.14); dot(x, gl + gw * 0.7, gt + gh * 0.22, 7); x.fillRect(gl + gw * 0.54, gt + gh * 0.68, gw * 0.32, gh * 0.32)
    x.fillStyle = PAPER; x.fillRect(gl, gt + gh + dh * 0.06, gw, dh * 0.12)
    h.caps(x, 13, 2); x.fillStyle = INK; x.textAlign = 'center'; x.fillText('THE DOCTOR', gl + gw / 2, gt + gh + dh * 0.06 + 12); x.fillText('WILL SEE YOU NOW', gl + gw / 2, gt + gh + dh * 0.06 + 34); x.textAlign = 'left'; x.letterSpacing = '0px'
    x.fillStyle = '#d8b26a'; dot(x, l + dw * 0.86, t + dh * 0.66, 12)
  },
}

/* --------------------------------------------- the paper cover: words, then the figure --------------------------------------------- */
const CAPTION = {
  'same-result-different-price': 'No detected difference in weight loss; the saving depends on which branded price a patient can reach.',
  'off-trial-real-world-weight-loss-on-tirzepatide-semaglutide': 'Real-world weight loss on tirzepatide and semaglutide in a 13,507-patient cohort.',
  'escalate-or-switch-the-post-titration-glp-1-non-responder': 'Four strategies from one decision point, weight lost at 12 and 24 weeks; 68,969 patients.',
  'what-week-8-knows-forecasting-six-month-glp-1-outcomes': 'Six-month weight loss forecast from the week-8 visit, 22,538 patients.',
  'helical-classification-of-type-b-aortic-dissections': 'Four helical groups from the CT of 102 patients.',
  'geometric-analysis-of-aortic-remodeling-after-petticoat-type-b-dissection': 'Geometric remodeling of the aorta after TEVAR with the PETTICOAT technique.',
  'longitudinal-mapping-of-true-lumen-morphology-for-endograft-oversizing': 'True-lumen morphology mapped along the aorta, for sizing the endograft.',
  'aortic-remodeling-after-tevar-and-petticoat-complicated-type-b-dissection': 'True- and false-lumen remodeling in the first 30 days after repair.',
  'concordance-of-llms-with-guidelines-at-the-week-8-glp-1-follow-up': 'Three language models graded against FDA and AGA guidance on 714 week-8 visits.',
  'branded-wegovy-vs-compounded-semaglutide-cyanocobalamin': 'Equivalent weight loss at 20–28 weeks, with higher adherence on compounded.',
  'variation-of-reimbursements-within-drgs-in-orthopedic-trauma': 'The same procedure, the same DRG, very different bills.',
  'healthcares-ai-trap': 'Skimming routine visits pushes the remaining panel past the flat fee.',
  'mapping-medi-cal-deserts-in-california': 'Where Medi-Cal patients cannot reliably find a doctor, across all 58 counties.',
  'third-party-cardiometabolic-outcomes-in-a-glp-1-telehealth-cohort': 'Changes recorded by outside clinicians, split by how much weight loss explains.',
  'scheduled-jumps-recovering-the-option-implied-probability-of-fda-approval': 'Option prices imply approval chances of 0.08 to 0.36 for eight pending decisions.',
  'the-doctor-will-see-you-now-stakes-verifiability-and-the-supervision-of-clinical-ai': 'Stakes and verifiability, not the technology, set the rung a decision belongs on.',
}
export function drawPaperCover(x, W, H, it, h) {
  const c = P[it.slug], ink = c.ink, m = W * 0.1
  x.fillStyle = c.bg; x.fillRect(0, 0, W, H)
  x.fillStyle = 'rgba(0,0,0,.045)'; x.fillRect(0, 0, 12, H)
  h.grain(x, W, H, 5)
  x.fillStyle = c.ac; x.fillRect(m, m - 2, 26, 6)
  x.fillStyle = ink; h.caps(x, 17, 4); x.fillText(String(it.kind || '').toUpperCase(), m + 40, m - 6)
  x.fillRect(m, m + 30, W - 2 * m, 1.5); x.letterSpacing = '0px'
  const t = h.fitTitle(x, it.title, W - 2 * m, H * 0.25, 60, 30, 1.1)
  t.lines.forEach((l, k) => x.fillText(l, m, m + 62 + k * t.fs * 1.1))
  let y = m + 62 + t.lines.length * t.fs * 1.1 + 8
  const who = String(it.authors || '').replace(/\s*·\s*in preparation$/, '')
  if (who) { x.font = `400 19px ${h.BOOK}`; x.fillStyle = '#5a5751'; h.wrap(x, who, W - 2 * m).slice(0, 2).forEach((l) => { x.fillText(l, m, y); y += 26 }); x.fillStyle = ink }
  const cap = CAPTION[it.slug], capH = cap ? 64 : 0
  const top = y + 54, bot = H - m - 108 - capH
  x.save(); MOTIFS[c.motif](x, m, top, W - 2 * m, bot - top, c, h); x.restore()
  if (cap) {
    x.fillStyle = '#4a4741'; x.font = `italic 400 17px ${h.BOOK}`
    h.wrap(x, cap, W - 2 * m).slice(0, 2).forEach((l, k) => x.fillText(l, m, bot + 28 + k * 23))
  }
  x.fillStyle = ink; x.fillRect(m, H - m - 68, W - 2 * m, 1.5)
  h.caps(x, 16, 3)
  h.wrap(x, String(it.cover || '').toUpperCase(), W * 0.55).slice(0, 2).forEach((l, k) => x.fillText(l, m, H - m - 50 + k * 24))
  x.textAlign = 'right'; x.fillText('SHANMU RAJA', W - m, H - m - 50); x.textAlign = 'left'; x.letterSpacing = '0px'
}

/* --------------------------------------------- the award covers: one emblem each --------------------------------------------- */
const EMBLEMS = {
  // a prize rosette: a fluted disc with two ribbon tails
  rosette(x, cx, cy, R, c) {
    x.fillStyle = c.ac
    x.beginPath(); x.moveTo(cx - R * 0.35, cy + R * 0.6); x.lineTo(cx - R * 0.75, cy + R * 2); x.lineTo(cx - R * 0.45, cy + R * 1.8); x.lineTo(cx - R * 0.25, cy + R * 2.05); x.lineTo(cx, cy + R * 0.7); x.fill()
    x.beginPath(); x.moveTo(cx + R * 0.35, cy + R * 0.6); x.lineTo(cx + R * 0.75, cy + R * 2); x.lineTo(cx + R * 0.45, cy + R * 1.8); x.lineTo(cx + R * 0.25, cy + R * 2.05); x.lineTo(cx, cy + R * 0.7); x.fill()
    x.beginPath(); for (let k = 0; k <= 48; k++) { const a = (k / 48) * Math.PI * 2, rr = R * (k % 2 ? 0.9 : 1); x.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)) } x.fill()
    x.fillStyle = c.bg; dot(x, cx, cy, R * 0.66); x.strokeStyle = c.ac; x.lineWidth = 3; dot(x, cx, cy, R * 0.58, false)
  },
  // a laurel wreath: leaves along two arcs, open at the top
  laurel(x, cx, cy, R, c) {
    x.fillStyle = c.ac
    for (const side of [-1, 1]) for (let k = 0; k < 11; k++) {
      const a = Math.PI / 2 + side * (0.35 + k * 0.23), px = cx + R * Math.cos(a), py = cy + R * Math.sin(a)
      x.save(); x.translate(px, py); x.rotate(a + side * 0.9 + (side < 0 ? Math.PI : 0)); x.beginPath(); x.ellipse(0, 0, R * 0.2, R * 0.075, 0, 0, Math.PI * 2); x.fill(); x.restore()
    }
    x.strokeStyle = c.ac; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, R, Math.PI / 2 + 0.3, Math.PI * 2.5 - 0.3, false); x.stroke()
  },
  // a fountain-pen nib, point down
  nib(x, cx, cy, R, c) {
    x.fillStyle = c.ink
    x.beginPath(); x.moveTo(cx, cy + R * 1.25); x.bezierCurveTo(cx - R * 0.2, cy + R * 0.6, cx - R * 0.7, cy + R * 0.1, cx - R * 0.55, cy - R * 0.9); x.lineTo(cx + R * 0.55, cy - R * 0.9); x.bezierCurveTo(cx + R * 0.7, cy + R * 0.1, cx + R * 0.2, cy + R * 0.6, cx, cy + R * 1.25); x.fill()
    x.fillStyle = c.bg; dot(x, cx, cy - R * 0.1, R * 0.12); x.fillRect(cx - 2.5, cy - R * 0.02, 5, R * 1.2)
    x.fillStyle = c.ac; x.fillRect(cx - R * 0.6, cy - R * 1.25, R * 1.2, R * 0.32)
  },
  // a flame for "Burnt Red Tongues": three tongues of fire
  magazine(x, cx, cy, R, c) {
    const tongue = (dx, s, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(cx + dx, cy + R * 1.1 * s); x.bezierCurveTo(cx + dx - R * 0.7 * s, cy + R * 0.4 * s, cx + dx - R * 0.1 * s, cy - R * 0.3 * s, cx + dx + R * 0.05 * s, cy - R * 1.2 * s); x.bezierCurveTo(cx + dx + R * 0.2 * s, cy - R * 0.4 * s, cx + dx + R * 0.75 * s, cy + R * 0.2 * s, cx + dx, cy + R * 1.1 * s); x.fill() }
    tongue(-R * 0.45, 0.7, '#e08a3c'); tongue(R * 0.5, 0.75, '#e08a3c'); tongue(0, 1, c.ac); tongue(0, 0.55, '#f2c25b')
  },
}
export function drawAwardCover(x, W, H, it, h) {
  const c = A[it.slug]
  x.fillStyle = c.bg; x.fillRect(0, 0, W, H)
  h.grain(x, W, H, c.dark ? 5 : 7)
  x.fillStyle = c.ink; x.strokeStyle = c.ink; x.textAlign = 'center'
  if (c.emblem === 'magazine') {
    // a magazine cover: masthead, an illustrated panel, the line it was shortlisted for
    x.fillRect(40, 40, W - 80, 4)
    const t = h.fitTitle(x, it.title.toUpperCase(), W - 140, 140, 92, 40, 1.0, 500)
    t.lines.forEach((l, k) => x.fillText(l, W / 2, 70 + k * t.fs))
    let y = 70 + t.lines.length * t.fs + 18
    x.fillRect(40, y, W - 80, 1.5); h.caps(x, 15, 4); x.fillText(`${String(it.kind || '').toUpperCase()}  ·  FICTION`, W / 2, y + 16); x.fillRect(40, y + 48, W - 80, 1.5); x.letterSpacing = '0px'
    const py = y + 80, ph = H - py - 150
    x.fillStyle = '#1d1a18'; x.fillRect(40, py, W - 80, ph)
    EMBLEMS.magazine(x, W / 2, py + ph * 0.52, Math.min(W, ph) * 0.3, c)
    x.fillStyle = c.ink; x.font = `italic 400 34px ${h.BOOK}`; x.fillText('Burnt Red Tongues', W / 2, H - 120)
    h.caps(x, 16, 4); x.fillText('SHANMU RAJA', W / 2, H - 70)
  } else {
    x.lineWidth = 2; x.strokeRect(34, 34, W - 68, H - 68); x.lineWidth = 1; x.strokeRect(46, 46, W - 92, H - 92)
    h.caps(x, 20, 6); x.fillText(String(it.kind || '').toUpperCase(), W / 2, 100); x.letterSpacing = '0px'
    const R = W * (c.emblem === 'rosette' ? 0.14 : c.emblem === 'nib' ? 0.15 : 0.2), ey = H * (c.emblem === 'rosette' ? 0.3 : c.emblem === 'nib' ? 0.38 : 0.36)
    x.save(); EMBLEMS[c.emblem](x, W / 2, ey, R, c); x.restore()
    x.textAlign = 'center'; x.fillStyle = c.ink
    if (c.emblem === 'rosette') { h.caps(x, 16, 3); x.fillStyle = c.ink; x.fillText('ACPM', W / 2, ey - 9) }
    const t = h.fitTitle(x, it.title.toUpperCase(), W - 200, H * 0.24, 64, 30, 1.04)
    const ty = H * 0.64
    t.lines.forEach((l, k) => x.fillText(l, W / 2, ty + k * t.fs * 1.04))
    h.caps(x, 17, 4); x.fillText('SHANMU RAJA', W / 2, H - 110); x.letterSpacing = '0px'
  }
  x.textAlign = 'left'
}
