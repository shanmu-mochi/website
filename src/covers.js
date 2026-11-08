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

/* ------------------------------------------------ the figures, each in its box ------------------------------------------------ */
const MOTIFS = {
  // weight loss on both formulations (one curve over the other), then what branded costs at each price a patient can reach
  twin(x, X, Y, W, H, c, h) {
    const h1 = H * 0.42, ax = X + 34, aw = W - 34
    lab(x, h, 'A · WEIGHT LOST', X, Y)
    const top = Y + 34, ch = h1 - 40
    gridY(x, ax, top, aw, ch, 3); axes(x, ax, top, aw, ch)
    const f = (t) => top + ch * 0.06 + ch * 0.86 * (1 - Math.exp(-3.1 * t))
    x.lineWidth = 3.5; x.strokeStyle = c.ac; line(x, Array.from({ length: 41 }, (_, k) => [ax + (aw * k) / 40, f(k / 40)]))
    x.setLineDash([9, 7]); x.strokeStyle = c.ac2; line(x, Array.from({ length: 41 }, (_, k) => [ax + (aw * k) / 40, f(k / 40) + 3])); x.setLineDash([])
    lab(x, h, '0', ax - 10, top + ch + 8, 'right'); lab(x, h, '6 MO', ax + aw, top + ch + 10, 'right')
    key(x, h, [['COMPOUNDED', c.ac, 'line'], ['BRANDED', c.ac2, 'line']], ax + 14, top + ch - 30)
    const y2 = Y + h1 + 40
    lab(x, h, 'B · BRANDED PRICE PER MONTH', X, y2)
    const tiers = [['INSURANCE COPAY', 25, 150], ['LILLYDIRECT SELF-PAY', 299, 449], ['RETAIL CASH', 1000, 1200]], rowH = (H - h1 - 110) / 3, sx = (v) => X + (W * v) / 1200
    tiers.forEach(([t, a, b], k) => {
      const ry = y2 + 36 + k * rowH
      lab(x, h, t, X, ry, 'left', GREY, 12)
      lab(x, h, `$${a.toLocaleString('en-US')}–${b.toLocaleString('en-US')}`, X + W, ry, 'right', '#2a2a2a', 12)
      x.fillStyle = FAINT; x.fillRect(X, ry + 22, W, 12)
      x.fillStyle = c.ac2; x.fillRect(sx(a), ry + 22, Math.max(8, sx(b) - sx(a)), 12)
    })
    x.strokeStyle = RULE; x.lineWidth = 1.5; line(x, [[X, Y + H - 26], [X + W, Y + H - 26]])
    ;[0, 600, 1200].forEach((v, k) => lab(x, h, `$${v.toLocaleString('en-US')}`, sx(v), Y + H - 18, k === 0 ? 'left' : k === 2 ? 'right' : 'center', GREY, 12))
  },
  // individual trajectories in grey, the two drugs' means in colour
  cloud(x, X, Y, W, H, c, h) {
    const ax = X + 30, aw = W - 30, top = Y + 10, ch = H - 50, r = rng('cloud')
    gridY(x, ax, top, aw, ch, 4); axes(x, ax, top, aw, ch)
    x.lineWidth = 1.2
    for (let n = 0; n < 64; n++) {
      const end = 0.2 + r() * 0.8, cut = 0.25 + r() * 0.75, pts = []; let v = 0
      for (let k = 0; k <= 40 * cut; k++) { const t = k / 40; v += (r() - 0.5) * 0.01; pts.push([ax + t * aw, top + ch * 0.04 + ch * 0.8 * end * (1 - Math.exp(-2.6 * t)) + v * ch]) }
      x.strokeStyle = 'rgba(40,40,40,.16)'; line(x, pts)
    }
    const mean = (d) => Array.from({ length: 41 }, (_, k) => { const t = k / 40; return [ax + t * aw, top + ch * 0.04 + ch * d * (1 - Math.exp(-2.6 * t))] })
    x.lineWidth = 4.5; x.strokeStyle = c.ac; line(x, mean(0.62)); x.strokeStyle = c.ac2; line(x, mean(0.5))
    lab(x, h, '0', ax - 10, top + ch + 8, 'right'); lab(x, h, '12 MO', ax + aw, top + ch + 10, 'right')
    key(x, h, [['TIRZEPATIDE', c.ac, 'line'], ['SEMAGLUTIDE', c.ac2, 'line']], ax + 14, top + ch + 34)
  },
  // a decision tree: one slow responder, four strategies
  fork(x, X, Y, W, H, c, h) {
    const rx = X + 10, ry = Y + H * 0.5, ex = X + W * 0.46
    const br = [['CONTINUE', GREY], ['ESCALATE DOSE', c.ac], ['SWITCH, EQUIPOTENT', c.ac2], ['SWITCH, HIGHER POTENCY', c.ac3]]
    lab(x, h, 'SLOW RESPONDER', rx, Y); lab(x, h, '< 5% AT 4 WK ON DOSE', rx, Y + 20, 'left', '#9a968f', 11)
    x.strokeStyle = RULE; x.lineWidth = 1; line(x, [[rx + 10, Y + 42], [rx + 10, ry - 16]])
    br.forEach(([t, color], k) => {
      const ey = Y + H * (0.1 + 0.8 * k / 3)
      x.strokeStyle = color; x.lineWidth = 4; x.lineCap = 'round'
      x.beginPath(); x.moveTo(rx + 10, ry); x.bezierCurveTo(rx + (ex - rx) * 0.55, ry, rx + (ex - rx) * 0.45, ey, ex, ey); x.stroke(); x.lineCap = 'butt'
      x.fillStyle = color; dot(x, ex, ey, 9)
      lab(x, h, t, ex + 22, ey - 7, 'left', '#2a2a2a', 13)
    })
    x.fillStyle = '#161616'; dot(x, rx + 10, ry, 11)
  },
  // observed to week 8, then the forecast with its 10th to 90th percentile band
  week8(x, X, Y, W, H, c, h) {
    const ax = X + 30, aw = W - 30, top = Y + 6, ch = H - 60, w8 = 8 / 26, xw = ax + aw * w8
    const f = (t) => top + ch * 0.06 + ch * 0.66 * (1 - Math.exp(-2.6 * t))
    gridY(x, ax, top, aw, ch, 4); axes(x, ax, top, aw, ch)
    x.fillStyle = tint(c.ac, 0.16); x.beginPath()
    for (let k = 0; k <= 30; k++) { const t = w8 + (1 - w8) * k / 30; x.lineTo(ax + t * aw, f(t) - ch * 0.26 * (t - w8)) }
    for (let k = 30; k >= 0; k--) { const t = w8 + (1 - w8) * k / 30; x.lineTo(ax + t * aw, f(t) + ch * 0.26 * (t - w8)) }
    x.closePath(); x.fill()
    x.strokeStyle = '#161616'; x.lineWidth = 4; line(x, Array.from({ length: 13 }, (_, k) => { const t = w8 * k / 12; return [ax + t * aw, f(t)] }))
    x.strokeStyle = c.ac; x.lineWidth = 3.5; x.setLineDash([10, 8]); line(x, Array.from({ length: 31 }, (_, k) => { const t = w8 + (1 - w8) * k / 30; return [ax + t * aw, f(t)] })); x.setLineDash([])
    x.strokeStyle = RULE; x.lineWidth = 1.5; x.setLineDash([3, 5]); line(x, [[xw, top], [xw, top + ch]]); x.setLineDash([])
    x.fillStyle = c.ac; dot(x, xw, f(w8), 8)
    lab(x, h, 'WK 0', ax, top + ch + 10); lab(x, h, 'WK 8', xw, top + ch + 10, 'center'); lab(x, h, 'WK 26', ax + aw, top + ch + 10, 'right')
    lab(x, h, '10TH–90TH PERCENTILE', ax + aw, f(1) + ch * 0.2 + 12, 'right', c.ac, 12)
    lab(x, h, 'FORECAST R² 0.65', xw + 16, top + 8, 'left', '#2a2a2a', 12)
  },
  // a dissection seen as two lumens twisting round each other
  helix(x, X, Y, W, H, c, h) {
    const mx = X + W / 2, amp = W * 0.26, turns = 2, top = Y + 34, hh = H - 40
    lab(x, h, 'TRUE LUMEN', X, Y, 'left', c.ac); lab(x, h, 'FALSE LUMEN', X + W, Y, 'right', c.ac2)
    x.lineWidth = 1.2; x.strokeStyle = FAINT
    for (let k = 1; k < 48; k++) { const t = k / 48, a = t * turns * Math.PI * 2; line(x, [[mx + amp * Math.sin(a), top + t * hh], [mx - amp * Math.sin(a), top + t * hh]]) }
    for (let s = 0; s < 2; s++) { x.strokeStyle = s ? c.ac2 : c.ac; x.lineWidth = 6; line(x, Array.from({ length: 121 }, (_, k) => { const t = k / 120; return [mx + amp * Math.sin(t * turns * Math.PI * 2 + s * Math.PI), top + t * hh] })) }
  },
  // the thoracic aorta: arch, descending aorta, stent graft and the bare stent below it
  arch(x, X, Y, W, H, c, h) {
    const R = Math.min(W * 0.24, H * 0.24), cx = X + W * 0.36, cy = Y + R + 20, t = R * 0.42, bottom = Y + H - 10
    x.strokeStyle = '#2a2a2a'; x.lineWidth = 2.5
    const tube = (r) => { x.beginPath(); x.arc(cx, cy, r, Math.PI, 0); x.lineTo(cx + r, bottom); x.stroke(); x.beginPath(); x.moveTo(cx - r, cy); x.lineTo(cx - r, cy + H * 0.18); x.stroke() }
    tube(R + t / 2); tube(R - t / 2)
    const gx = cx + R - t / 2, gTop = cy + 6, gBot = cy + (bottom - cy) * 0.45
    x.fillStyle = tint(c.ac2, 0.28); x.fillRect(gx, gTop, t, gBot - gTop)
    x.strokeStyle = c.ac; x.lineWidth = 2
    for (let yy = gBot + 12; yy < bottom - 8; yy += 26) line(x, [[gx, yy], [gx + t / 2, yy + 13], [gx + t, yy]])
    lab(x, h, 'STENT GRAFT', gx + t + 22, gTop + (gBot - gTop) / 2 - 6, 'left', c.ac2)
    lab(x, h, 'BARE STENT', gx + t + 22, gBot + (bottom - gBot) / 2 - 6, 'left', c.ac)
    x.strokeStyle = RULE; x.lineWidth = 1; line(x, [[gx + t + 4, gTop + (gBot - gTop) / 2], [gx + t + 16, gTop + (gBot - gTop) / 2]]); line(x, [[gx + t + 4, gBot + (bottom - gBot) / 2], [gx + t + 16, gBot + (bottom - gBot) / 2]])
  },
  // cross-sections down the aorta, the true lumen filled
  lumen(x, X, Y, W, H, c, h) {
    const n = 6, cxs = X + W * 0.4
    lab(x, h, 'PROXIMAL', X + W, Y + 6, 'right'); lab(x, h, 'DISTAL', X + W, Y + H - 18, 'right')
    x.strokeStyle = RULE; x.lineWidth = 1; x.setLineDash([3, 5]); line(x, [[cxs, Y], [cxs, Y + H]]); x.setLineDash([])
    for (let k = 0; k < n; k++) {
      const yy = Y + H * (k + 0.5) / n, rw = W * 0.3 * (1 - k * 0.05), rh = (H / n) * 0.3, f = 0.42 + 0.4 * Math.abs(Math.sin(k * 0.9 + 0.4))
      x.strokeStyle = '#2a2a2a'; x.lineWidth = 2.5; x.beginPath(); x.ellipse(cxs, yy, rw, rh, 0, 0, Math.PI * 2); x.stroke()
      x.fillStyle = c.ac; x.beginPath(); x.ellipse(cxs - rw * (1 - f) * 0.5, yy, rw * f * 0.85, rh * 0.72, 0, 0, Math.PI * 2); x.fill()
    }
    lab(x, h, 'TRUE LUMEN', X + W, Y + H * 0.5 - 7, 'right', c.ac, 12)
  },
  // a stent graft over a bare-metal stent, in outline
  stent(x, X, Y, W, H, c, h) {
    const L = X + W * 0.3, R = X + W * 0.62, step = (R - L) / 3, mid = Y + H * 0.42
    x.fillStyle = tint(c.ac2, 0.2); x.fillRect(L, Y, R - L, mid - Y)
    x.strokeStyle = '#2a2a2a'; x.lineWidth = 2.5; line(x, [[L, Y], [L, Y + H]]); line(x, [[R, Y], [R, Y + H]])
    x.strokeStyle = c.ac; x.lineWidth = 2
    for (let yy = mid; yy < Y + H - step; yy += step * 1.3) for (let k = 0; k < 3; k++) { const a = L + k * step; line(x, [[a, yy + step * 0.65], [a + step / 2, yy], [a + step, yy + step * 0.65], [a + step / 2, yy + step * 1.3], [a, yy + step * 0.65]]) }
    lab(x, h, 'STENT GRAFT', R + 26, Y + (mid - Y) / 2 - 6, 'left', c.ac2); lab(x, h, 'PETTICOAT BARE STENT', R + 26, mid + (Y + H - mid) / 2 - 6, 'left', c.ac)
  },
  // three models against guidance: each dot an encounter, open where the model disagreed
  grid(x, X, Y, W, H, c, h) {
    const names = ['CLAUDE', 'GPT-4O', 'GEMINI'], gw = W / 3, cols = 3, rows = 9, r = rng('grid'), dy = (H - 70) / rows
    names.forEach((t, g) => {
      lab(x, h, t, X + gw * g + gw / 2, Y, 'center', '#2a2a2a')
      for (let j = 0; j < rows; j++) for (let k = 0; k < cols; k++) {
        const px = X + gw * g + gw * (0.25 + k * 0.25), py = Y + 40 + j * dy + dy / 2, off = r() < 0.13
        if (off) { x.strokeStyle = c.ac2; x.lineWidth = 2.5; dot(x, px, py, Math.min(dy, gw / 4) * 0.28, false) } else { x.fillStyle = c.ac; dot(x, px, py, Math.min(dy, gw / 4) * 0.3) }
      }
    })
    key(x, h, [['MATCHES GUIDANCE', c.ac, 'dot'], ['DOES NOT', c.ac2, 'ring']], X, Y + H - 18)
  },
  // the published result: the difference sits inside the equivalence margin, and adherence favours compounded
  equiv(x, X, Y, W, H, c, h) {
    lab(x, h, 'A · WEIGHT-LOSS DIFFERENCE, POINTS', X, Y)
    const sx = (v) => X + W * (v + 2) / 4, py = Y + 70
    x.fillStyle = tint(c.ac, 0.12); x.fillRect(sx(-1.5), py - 30, sx(1.5) - sx(-1.5), 60)
    x.strokeStyle = RULE; x.lineWidth = 1.5; line(x, [[X, py + 44], [X + W, py + 44]]); x.setLineDash([3, 4]); line(x, [[sx(0), py - 30], [sx(0), py + 30]]); x.setLineDash([])
    x.strokeStyle = c.ac; x.lineWidth = 4; line(x, [[sx(-0.59), py], [sx(0.464), py]]); line(x, [[sx(-0.59), py - 9], [sx(-0.59), py + 9]]); line(x, [[sx(0.464), py - 9], [sx(0.464), py + 9]])
    x.fillStyle = c.ac; poly(x, [[sx(-0.063), py - 11], [sx(-0.063) + 11, py], [sx(-0.063), py + 11], [sx(-0.063) - 11, py]])
    ;[[-1.5, '−1.5'], [0, '0'], [1.5, '+1.5']].forEach(([v, t]) => lab(x, h, t, sx(v), py + 54, 'center', GREY, 12))
    lab(x, h, 'EQUIVALENCE MARGIN ±1.5', sx(-1.5) + 10, py - 24, 'left', c.ac, 11)
    lab(x, h, '−0.06 (−0.59 TO 0.46)', sx(-0.063), py + 16, 'center', '#2a2a2a', 11)
    const y2 = py + 110
    lab(x, h, 'B · STILL ON TREATMENT AT 20–28 WK', X, y2)
    const bw = Math.min(W * 0.18, 90), base = Y + H - 26, top = y2 + 40, sc = (v) => (base - top) * v / 40
    ;[['COMPOUNDED', 35.7, c.ac], ['WEGOVY', 22.9, c.ac2]].forEach(([t, v, color], k) => {
      const bx = X + W * (0.22 + k * 0.4) - bw / 2
      x.fillStyle = color; x.fillRect(bx, base - sc(v), bw, sc(v))
      lab(x, h, `${v}%`, bx + bw / 2, base - sc(v) - 22, 'center', '#2a2a2a', 13); lab(x, h, t, bx + bw / 2, base + 10, 'center', GREY, 12)
    })
    x.strokeStyle = RULE; x.lineWidth = 1.5; line(x, [[X, base], [X + W, base]])
  },
  // payment spread inside one DRG, by what drives it
  boxes(x, X, Y, W, H, c, h) {
    const rows = ['LENGTH OF STAY', 'INSURER', 'IMPLANT'], r = rng('drg'), lx = X + W * 0.34, lw = W - (lx - X), gy = (H - 40) / rows.length
    rows.forEach((t, k) => {
      const cy = Y + gy * (k + 0.5), a = 0.1 + r() * 0.2, b = a + 0.3 + r() * 0.3, m = a + (b - a) * (0.35 + r() * 0.3), lo = Math.max(0, a - 0.1), hi = Math.min(1, b + 0.12)
      lab(x, h, t, X, cy - 7, 'left', '#2a2a2a', 12)
      x.strokeStyle = '#2a2a2a'; x.lineWidth = 2; line(x, [[lx + lo * lw, cy], [lx + hi * lw, cy]]); line(x, [[lx + lo * lw, cy - 10], [lx + lo * lw, cy + 10]]); line(x, [[lx + hi * lw, cy - 10], [lx + hi * lw, cy + 10]])
      x.fillStyle = tint(c.ac, 0.3); x.fillRect(lx + a * lw, cy - gy * 0.2, (b - a) * lw, gy * 0.4); x.strokeStyle = c.ac; x.strokeRect(lx + a * lw, cy - gy * 0.2, (b - a) * lw, gy * 0.4)
      x.lineWidth = 4; line(x, [[lx + m * lw, cy - gy * 0.2], [lx + m * lw, cy + gy * 0.2]])
    })
    x.strokeStyle = RULE; x.lineWidth = 1.5; line(x, [[lx, Y + H - 24], [X + W, Y + H - 24]])
    lab(x, h, 'REIMBURSEMENT WITHIN ONE DRG', X + W, Y + H - 14, 'right', GREY, 12)
  },
  // as AI takes the routine cases, the remaining panel's average cost climbs past the flat fee
  trap(x, X, Y, W, H, c, h) {
    const ax = X + 30, aw = W - 30, top = Y + 30, ch = H - 90, fee = top + ch * 0.55, cross = 1 / 3
    const cost = (t) => fee + ch * 0.18 * (1 - (t / cross) ** 1.2)
    gridY(x, ax, top, aw, ch, 4); axes(x, ax, top, aw, ch)
    x.fillStyle = tint(c.ac, 0.1); x.beginPath(); x.moveTo(ax + cross * aw, fee); for (let k = 0; k <= 30; k++) { const t = cross + (1 - cross) * k / 30; x.lineTo(ax + t * aw, Math.max(top, cost(t))) } x.lineTo(ax + aw, fee); x.closePath(); x.fill()
    x.strokeStyle = '#2a2a2a'; x.lineWidth = 2; x.setLineDash([10, 7]); line(x, [[ax, fee], [ax + aw, fee]]); x.setLineDash([])
    x.strokeStyle = c.ac; x.lineWidth = 4.5; line(x, Array.from({ length: 41 }, (_, k) => { const t = k / 40; return [ax + t * aw, Math.max(top, cost(t))] }))
    x.fillStyle = c.ac; dot(x, ax + cross * aw, fee, 8)
    lab(x, h, 'FLAT FEE', ax + 8, fee + 12, 'left', '#2a2a2a', 12)
    lab(x, h, 'COST OF THE PANEL LEFT BEHIND', ax + aw, top - 24, 'right', c.ac, 12)
    lab(x, h, 'ROUTINE CASES TAKEN BY AI', ax + aw, top + ch + 12, 'right', GREY, 12)
    lab(x, h, '0', ax, top + ch + 12, 'left'); lab(x, h, '1/3', ax + cross * aw, top + ch + 12, 'center', c.ac)
  },
  // California as people: blue where there are doctors, rust where the county is a desert
  desert(x, X, Y, W, H, c) {
    const CA = [[0.06, 0], [0.46, 0], [0.46, 0.34], [0.96, 0.74], [0.98, 0.8], [0.9, 0.9], [0.88, 1], [0.58, 0.98], [0.5, 0.88], [0.36, 0.8], [0.3, 0.7], [0.18, 0.56], [0.12, 0.42], [0.1, 0.3], [0, 0.16], [0.02, 0.06]]
    const s = Math.min(W * 0.86, H / 1.12), ox = X + (W - s) / 2, oy = Y
    const pts = CA.map(([a, b]) => [ox + a * s, oy + b * s * 1.12])
    const inside = (px, py) => { let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) ins = !ins } return ins }
    const step = s / 24
    for (let py = oy; py < oy + s * 1.12; py += step) for (let px = ox; px < ox + s; px += step) {
      if (!inside(px, py)) continue
      const u = (px - ox) / s, v = (py - oy) / (s * 1.12)
      const desert = (u > 0.42 && v < 0.62) || (u > 0.55 && v > 0.62 && v < 0.85) || (v < 0.18 && u > 0.2)
      x.fillStyle = desert ? c.ac : c.ac2; dot(x, px, py, step * 0.32)
    }
  },
  // each change measured by outside clinicians, split into the part explained by weight and the part beyond it
  decomp(x, X, Y, W, H, c, h) {
    const rows = [['SYSTOLIC BP', '−4.85 MMHG', 0.42], ['HBA1C', '−0.57 POINTS', 0.46]], lx = X, bw = W, gy = (H - 80) / 2
    rows.forEach(([t, v, share], k) => {
      const yy = Y + k * gy + 10
      lab(x, h, t, lx, yy, 'left', '#2a2a2a', 13); lab(x, h, v, X + W, yy, 'right', '#2a2a2a', 13)
      const by = yy + 34, bh = Math.min(48, gy * 0.38)
      x.fillStyle = c.ac; x.fillRect(lx, by, bw * share, bh); x.fillStyle = c.ac2; x.fillRect(lx + bw * share, by, bw * (1 - share), bh)
      lab(x, h, `${Math.round(share * 100)}%`, lx + 12, by + bh / 2 - 7, 'left', '#ffffff', 13)
      lab(x, h, `${Math.round((1 - share) * 100)}%`, lx + bw - 12, by + bh / 2 - 7, 'right', '#5a2a30', 13)
    })
    key(x, h, [['EXPLAINED BY WEIGHT', c.ac, 'dot'], ['BEYOND WEIGHT', c.ac2, 'dot']], X, Y + H - 30)
  },
  // the price walks to the decision date, then jumps up with probability q or down with 1 − q
  jump(x, X, Y, W, H, c, h) {
    const r = rng('jump'), d = X + W * 0.58, mid = Y + H * 0.5, pts = []; let v = 0
    for (let k = 0; k <= 60; k++) { v += (r() - 0.5) * 0.045; pts.push([X + (d - X) * k / 60, mid + v * H * 0.5]) }
    x.strokeStyle = RULE; x.lineWidth = 1.5; x.setLineDash([3, 5]); line(x, [[d, Y + 10], [d, Y + H - 30]]); x.setLineDash([])
    x.strokeStyle = '#2a2a2a'; x.lineWidth = 3; line(x, pts)
    const [ex, ey] = pts[pts.length - 1], up = Y + H * 0.14, dn = Y + H * 0.82
    x.lineWidth = 3.5; x.strokeStyle = c.ac; line(x, [[ex, ey], [ex + 30, up], [X + W, up]]); x.strokeStyle = c.ac2; line(x, [[ex, ey], [ex + 30, dn], [X + W, dn]])
    lab(x, h, 'APPROVED · q', X + W, up - 26, 'right', c.ac, 13); lab(x, h, 'NOT APPROVED · 1 − q', X + W, dn + 14, 'right', c.ac2, 13)
    lab(x, h, 'DECISION DAY', d, Y + H - 18, 'center', GREY, 12)
  },
  // stakes against verifiability: where a decision belongs
  ladder(x, X, Y, W, H, c, h) {
    const ax = X + 30, aw = W - 30, top = Y + 6, ch = H - 50
    const zone = (a, b, alpha) => { x.fillStyle = tint(c.ac, alpha); poly(x, [[ax + aw * a[0], top + ch * a[1]], ...b.map(([p, q]) => [ax + aw * p, top + ch * q])]) }
    zone([0, 0], [[0.55, 0], [0, 0.75]], 0.62)
    zone([0.55, 0], [[1, 0], [1, 0.3], [0.3, 1], [0, 1], [0, 0.75]], 0.28)
    zone([1, 0.3], [[1, 1], [0.3, 1]], 0.08)
    axes(x, ax, top, aw, ch)
    lab(x, h, 'HUMAN DECIDES', ax + 16, top + 18, 'left', '#ffffff', 12)
    lab(x, h, 'AI DRAFTS, HUMAN APPROVES', ax + aw * 0.47, top + ch * 0.46, 'center', '#1e2a3a', 12)
    lab(x, h, 'AI ACTS ALONE', ax + aw - 14, top + ch - 30, 'right', '#1e2a3a', 12)
    lab(x, h, 'EASY TO CHECK →', ax + aw, top + ch + 12, 'right', GREY, 12)
    x.save(); x.translate(ax - 16, top + ch); x.rotate(-Math.PI / 2); lab(x, h, 'STAKES IF WRONG →', 0, -6, 'left', GREY, 12); x.restore()
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
  'concordance-of-llms-with-guidelines-at-the-week-8-glp-1-follow-up': '714 week-8 encounters, three models, FDA and AGA guidance. Illustrative.',
  'branded-wegovy-vs-compounded-semaglutide-cyanocobalamin': 'Equivalent weight loss at 20–28 weeks, with higher adherence on compounded.',
  'variation-of-reimbursements-within-drgs-in-orthopedic-trauma': 'What moves payment inside one DRG. Illustrative.',
  'healthcares-ai-trap': 'Skimming routine visits pushes the remaining panel past the flat fee.',
  'mapping-medi-cal-deserts-in-california': 'An access index for all 58 counties, 2008–2024. Schematic.',
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
