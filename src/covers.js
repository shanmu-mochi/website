/* Iteration 55: a cover of its own for every paper and every award. Each has its own paper and ink, and a drawing of
   what the work is about (a helix for the helical classification, a fork for escalate-or-switch, a price path that
   jumps on decision day). Drawn on the same 2D canvas as before, so the 3D plate, the flight and the page all use it.
   Keyed by slug; anything without an entry keeps the plain cover. */

// paper and ink per piece: bg, ink, accent (and dark: the light-on-dark covers)
const P = {
  'same-result-different-price': { bg: '#dfe5d8', ink: '#20352a', ac: '#6f8f73', motif: 'twin' },
  'off-trial-real-world-weight-loss-on-tirzepatide-semaglutide': { bg: '#dbe2e9', ink: '#1d2a3a', ac: '#6b7f99', motif: 'cloud' },
  'escalate-or-switch-the-post-titration-glp-1-non-responder': { bg: '#ecdfc2', ink: '#3a2a17', ac: '#b0813c', motif: 'fork' },
  'what-week-8-knows-forecasting-six-month-glp-1-outcomes': { bg: '#efdcd5', ink: '#43201c', ac: '#b4655a', motif: 'week8' },
  'helical-classification-of-type-b-aortic-dissections': { bg: '#1f2a38', ink: '#efe9dc', ac: '#8fa6bf', motif: 'helix', dark: true },
  'geometric-analysis-of-aortic-remodeling-after-petticoat-type-b-dissection': { bg: '#d3d7d9', ink: '#1e2428', ac: '#8a3b34', motif: 'arch' },
  'longitudinal-mapping-of-true-lumen-morphology-for-endograft-oversizing': { bg: '#d7e4e1', ink: '#173532', ac: '#5b8f89', motif: 'lumen' },
  'aortic-remodeling-after-tevar-and-petticoat-complicated-type-b-dissection': { bg: '#e4ddd2', ink: '#2a2521', ac: '#7d6f5f', motif: 'stent' },
  'concordance-of-llms-with-guidelines-at-the-week-8-glp-1-follow-up': { bg: '#171717', ink: '#f2efe8', ac: '#8c8c8c', motif: 'grid', dark: true },
  'branded-wegovy-vs-compounded-semaglutide-cyanocobalamin': { bg: '#e3dde8', ink: '#2c2236', ac: '#7e6a92', motif: 'pens' },
  'variation-of-reimbursements-within-drgs-in-orthopedic-trauma': { bg: '#e9e1cf', ink: '#2b2419', ac: '#8a7a5c', motif: 'boxes' },
  'healthcares-ai-trap': { bg: '#f3efe6', ink: '#121212', ac: '#b23a2a', motif: 'ladder' },
  'mapping-medi-cal-deserts-in-california': { bg: '#ead9b8', ink: '#4a2614', ac: '#a5532d', motif: 'desert' },
  'third-party-cardiometabolic-outcomes-in-a-glp-1-telehealth-cohort': { bg: '#f0e2e0', ink: '#3a1d22', ac: '#a84a55', motif: 'bars' },
  'scheduled-jumps-recovering-the-option-implied-probability-of-fda-approval': { bg: '#f1ead2', ink: '#24261c', ac: '#5d6b2f', motif: 'jump' },
  'the-doctor-will-see-you-now-stakes-verifiability-and-the-supervision-of-clinical-ai': { bg: '#e2e6ea', ink: '#1b1f26', ac: '#4f6a8c', motif: 'rungs' },
}
const A = {
  'american-college-of-preventive-medicine': { bg: '#1f2d44', ink: '#efe6cf', ac: '#c9a96a', emblem: 'rosette', dark: true },
  'massachusetts-undergraduate-poetry-festival': { bg: '#f1e9d6', ink: '#2b2a22', ac: '#6d7a45', emblem: 'laurel' },
  'paul-kalanithi-writing-competition': { bg: '#e7e3da', ink: '#1c1c1c', ac: '#7a2e2a', emblem: 'nib' },
  'the-new-yorker': { bg: '#f4efe4', ink: '#141414', ac: '#c4462e', emblem: 'magazine' },
}
export const coverOf = (it) => (it && (P[it.slug] || A[it.slug])) || null
// the spine and page colours that go with a cover: its paper, darkened
export const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k))
  return `rgb(${c.join(',')})`
}

// a small seeded random, so a cover never changes between renders
const rng = (seed) => { let s = String(seed).split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 7); return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 } }
const line = (x, pts) => { x.beginPath(); pts.forEach(([a, b], k) => (k ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke() }
const dot = (x, a, b, r, fill = true) => { x.beginPath(); x.arc(a, b, r, 0, Math.PI * 2); fill ? x.fill() : x.stroke() }
const arrow = (x, a, b, ang, s) => { x.beginPath(); x.moveTo(a, b); x.lineTo(a - s * Math.cos(ang - 0.45), b - s * Math.sin(ang - 0.45)); x.moveTo(a, b); x.lineTo(a - s * Math.cos(ang + 0.45), b - s * Math.sin(ang + 0.45)); x.stroke() }

/* ------------------------------------------------ the drawings, each in its box ------------------------------------------------ */
const MOTIFS = {
  // two weight-loss curves on top of each other (no gap), and two price bars that are nothing alike
  twin(x, X, Y, W, H, c, h) {
    const cy = Y + H * 0.06, ch = H * 0.5
    x.lineWidth = 5; x.strokeStyle = c.ink
    const curve = (off) => { const pts = []; for (let k = 0; k <= 60; k++) { const t = k / 60; pts.push([X + t * W, cy + ch * (1 - Math.exp(-3.2 * t)) + off]) } return pts }
    line(x, curve(0)); x.setLineDash([14, 10]); x.strokeStyle = c.ac; line(x, curve(10)); x.setLineDash([])
    h.caps(x, 15, 3); x.fillStyle = c.ink; x.fillText('SIX-MONTH WEIGHT LOSS', X, cy - 34)
    const by = Y + H * 0.72
    h.caps(x, 15, 3); x.fillText('COST PER MONTH', X, by - 34)
    x.fillStyle = c.ink; x.fillRect(X, by, W * 0.92, 26); x.fillStyle = c.ac; x.fillRect(X, by + 44, W * 0.3, 26)
  },
  // a cloud of thin patient trajectories, all heading down, spreading as they go
  cloud(x, X, Y, W, H, c) {
    const r = rng('cloud'); x.lineWidth = 1.6
    for (let n = 0; n < 70; n++) {
      const end = 0.25 + r() * 0.75, cut = 0.35 + r() * 0.65, pts = []
      let v = 0
      for (let k = 0; k <= 40 * cut; k++) { const t = k / 40; v += (r() - 0.5) * 0.012; pts.push([X + t * W, Y + H * 0.05 + H * 0.85 * end * (1 - Math.exp(-3 * t)) + v * H]) }
      x.strokeStyle = n % 6 ? c.ac : c.ink; x.globalAlpha = n % 6 ? 0.55 : 0.9; line(x, pts)
    }
    x.globalAlpha = 1
  },
  // one road, then a choice: push the dose or change the drug
  fork(x, X, Y, W, H, c, h) {
    const mx = X + W / 2, base = Y + H * 0.98, split = Y + H * 0.55
    x.strokeStyle = c.ink; x.lineWidth = 12; x.lineCap = 'round'
    line(x, [[mx, base], [mx, split]])
    x.beginPath(); x.moveTo(mx, split); x.bezierCurveTo(mx, split - H * 0.2, X + W * 0.12, split - H * 0.2, X + W * 0.12, Y + H * 0.12); x.stroke()
    x.strokeStyle = c.ac; x.beginPath(); x.moveTo(mx, split); x.bezierCurveTo(mx, split - H * 0.2, X + W * 0.88, split - H * 0.2, X + W * 0.88, Y + H * 0.12); x.stroke()
    x.lineWidth = 8; x.strokeStyle = c.ink; arrow(x, X + W * 0.12, Y + H * 0.08, -Math.PI / 2, 34); x.strokeStyle = c.ac; arrow(x, X + W * 0.88, Y + H * 0.08, -Math.PI / 2, 34)
    x.lineCap = 'butt'; x.fillStyle = c.ink; h.caps(x, 15, 3)
    x.fillText('ESCALATE', X + W * 0.12 + 22, Y + H * 0.2); x.textAlign = 'right'; x.fillText('SWITCH', X + W * 0.88 - 22, Y + H * 0.2); x.textAlign = 'left'
  },
  // a weight curve with a line at week 8, and the six-month forecast as a band from there on
  week8(x, X, Y, W, H, c, h) {
    const f = (t) => Y + H * 0.08 + H * 0.7 * (1 - Math.exp(-2.6 * t)), w8 = 8 / 26, xw = X + W * w8
    x.fillStyle = c.ac; x.globalAlpha = 0.28
    x.beginPath(); for (let k = 0; k <= 30; k++) { const t = w8 + (1 - w8) * k / 30; x.lineTo(X + t * W, f(t) - H * 0.2 * (t - w8)) } for (let k = 30; k >= 0; k--) { const t = w8 + (1 - w8) * k / 30; x.lineTo(X + t * W, f(t) + H * 0.2 * (t - w8)) } x.closePath(); x.fill(); x.globalAlpha = 1
    x.strokeStyle = c.ink; x.lineWidth = 6; const pts = []; for (let k = 0; k <= 12; k++) { const t = w8 * k / 12; pts.push([X + t * W, f(t)]) } line(x, pts)
    x.setLineDash([12, 10]); x.lineWidth = 4; const pf = []; for (let k = 0; k <= 30; k++) { const t = w8 + (1 - w8) * k / 30; pf.push([X + t * W, f(t)]) } line(x, pf); x.setLineDash([])
    x.lineWidth = 2; line(x, [[xw, Y], [xw, Y + H]]); x.fillStyle = c.ink; dot(x, xw, f(w8), 10)
    h.caps(x, 15, 3); x.fillText('WEEK 8', xw + 14, Y + 6); x.textAlign = 'right'; x.fillText('MONTH 6', X + W, Y + H - 24); x.textAlign = 'left'
  },
  // the twisted dissection: two strands around each other, with the flap between them
  helix(x, X, Y, W, H, c) {
    const mx = X + W / 2, amp = W * 0.3, turns = 2.2
    for (let s = 0; s < 2; s++) {
      x.strokeStyle = s ? c.ac : c.ink; x.lineWidth = 9; const pts = []
      for (let k = 0; k <= 120; k++) { const t = k / 120; pts.push([mx + amp * Math.sin(t * turns * Math.PI * 2 + s * Math.PI), Y + t * H]) }
      line(x, pts)
    }
    x.strokeStyle = c.ink; x.globalAlpha = 0.5; x.lineWidth = 2
    for (let k = 2; k < 40; k++) { const t = k / 40, a = t * turns * Math.PI * 2; if (Math.cos(a) > 0.2) line(x, [[mx + amp * Math.sin(a), Y + t * H], [mx - amp * Math.sin(a), Y + t * H]]) }
    x.globalAlpha = 1
  },
  // the aortic arch as a hooked tube, with the stent's rings down the descending part
  arch(x, X, Y, W, H, c) {
    const R = W * 0.26, cx = X + W * 0.42, cy = Y + R + 10, t = W * 0.11
    x.strokeStyle = c.ink; x.lineWidth = 4
    const tube = (r) => { x.beginPath(); x.arc(cx, cy, r, Math.PI, 0); x.lineTo(cx + r, Y + H); x.stroke(); x.beginPath(); x.moveTo(cx - r, cy); x.lineTo(cx - r, cy + H * 0.12); x.stroke() }
    tube(R + t / 2); tube(R - t / 2)
    x.strokeStyle = c.ac; x.lineWidth = 3
    for (let yy = cy + 30; yy < Y + H - 10; yy += 34) { x.beginPath(); x.ellipse(cx + R, yy, t / 2 + 6, 9, 0, 0, Math.PI * 2); x.stroke() }
  },
  // cross-sections down the aorta: an outer ring, and inside it the true lumen growing and shrinking
  lumen(x, X, Y, W, H, c) {
    const n = 7, mx = X + W / 2
    x.strokeStyle = c.ink; x.lineWidth = 2; line(x, [[mx, Y], [mx, Y + H]])
    for (let k = 0; k < n; k++) {
      const yy = Y + H * (k + 0.5) / n, rw = W * 0.34, rh = H / n * 0.32
      x.lineWidth = 4; x.strokeStyle = c.ink; x.beginPath(); x.ellipse(mx, yy, rw, rh, 0, 0, Math.PI * 2); x.stroke()
      const f = 0.35 + 0.5 * Math.abs(Math.sin(k * 0.9 + 0.4))
      x.fillStyle = c.ac; x.beginPath(); x.ellipse(mx - rw * (1 - f) * 0.45, yy, rw * f * 0.9, rh * 0.7, 0, 0, Math.PI * 2); x.fill()
    }
  },
  // a bare-metal stent: a diamond mesh inside a tube
  stent(x, X, Y, W, H, c) {
    const L = X + W * 0.22, R = X + W * 0.78, step = (R - L) / 4
    x.strokeStyle = c.ink; x.lineWidth = 5; line(x, [[L, Y], [L, Y + H]]); line(x, [[R, Y], [R, Y + H]])
    x.strokeStyle = c.ac; x.lineWidth = 3
    for (let yy = Y; yy < Y + H - step; yy += step * 1.4) for (let k = 0; k < 4; k++) { const a = L + k * step; line(x, [[a, yy + step * 0.7], [a + step / 2, yy], [a + step, yy + step * 0.7], [a + step / 2, yy + step * 1.4], [a, yy + step * 0.7]]) }
  },
  // models against guidance: a grid of answers, the few that disagree left open
  grid(x, X, Y, W, H, c, h) {
    const cols = 9, rows = 11, gx = W / cols, gy = H / (rows + 1), r = rng('grid')
    for (let j = 0; j < rows; j++) for (let k = 0; k < cols; k++) {
      const off = r() < 0.12
      x.fillStyle = k % 3 === 2 ? c.ac : c.ink; x.strokeStyle = c.ink; x.lineWidth = 2.5
      dot(x, X + gx * (k + 0.5), Y + gy * (j + 1.2), gx * 0.24, !off)
    }
    h.caps(x, 14, 3); x.fillStyle = c.ink
    ;['CLAUDE', 'GPT-4O', 'GEMINI'].forEach((t, k) => { x.textAlign = 'center'; x.fillText(t, X + gx * (k * 3 + 1.5), Y - 4) }); x.textAlign = 'left'
  },
  // two injection pens side by side, and an equals sign between them
  pens(x, X, Y, W, H, c) {
    const pen = (cx, col) => {
      const w = W * 0.16, top = Y + H * 0.04, bot = Y + H * 0.96
      x.fillStyle = col; x.beginPath(); x.roundRect(cx - w / 2, top + H * 0.12, w, bot - top - H * 0.12, 18); x.fill()
      x.fillStyle = c.ink; x.fillRect(cx - w * 0.3, top, w * 0.6, H * 0.12)
      x.fillStyle = c.bg; x.fillRect(cx - w * 0.28, top + H * 0.42, w * 0.56, H * 0.22)
      x.fillStyle = col; x.fillRect(cx - w * 0.28, top + H * 0.56, w * 0.56, H * 0.08)
    }
    pen(X + W * 0.22, c.ink); pen(X + W * 0.78, c.ac)
    x.fillStyle = c.ink; x.fillRect(X + W * 0.42, Y + H * 0.45, W * 0.16, 12); x.fillRect(X + W * 0.42, Y + H * 0.45 + 30, W * 0.16, 12)
  },
  // box plots: the same DRG, payments spread out by stay, insurer and implant
  boxes(x, X, Y, W, H, c) {
    const r = rng('drg'), n = 6, gy = H / n
    for (let k = 0; k < n; k++) {
      const cy = Y + gy * (k + 0.5), a = 0.08 + r() * 0.25, b = a + 0.25 + r() * 0.35, m = a + (b - a) * (0.3 + r() * 0.4), lo = Math.max(0, a - 0.1 - r() * 0.1), hi = Math.min(1, b + 0.08 + r() * 0.15)
      x.strokeStyle = c.ink; x.lineWidth = 3; line(x, [[X + lo * W, cy], [X + hi * W, cy]])
      x.fillStyle = k % 2 ? c.ac : c.bg; x.fillRect(X + a * W, cy - gy * 0.28, (b - a) * W, gy * 0.56); x.strokeRect(X + a * W, cy - gy * 0.28, (b - a) * W, gy * 0.56)
      x.lineWidth = 5; line(x, [[X + m * W, cy - gy * 0.28], [X + m * W, cy + gy * 0.28]])
    }
  },
  // the ladder from routine to complex care, with its middle rungs gone
  ladder(x, X, Y, W, H, c) {
    const L = X + W * 0.28, R = X + W * 0.72, n = 9
    x.strokeStyle = c.ink; x.lineWidth = 10; line(x, [[L, Y], [L, Y + H]]); line(x, [[R, Y], [R, Y + H]])
    for (let k = 0; k < n; k++) {
      const yy = Y + H * (k + 0.5) / n
      if (k >= 3 && k <= 5) { x.strokeStyle = c.ac; x.lineWidth = 3; x.setLineDash([8, 10]); line(x, [[L + 10, yy], [R - 10, yy]]); x.setLineDash([]) } else { x.strokeStyle = c.ink; x.lineWidth = 8; line(x, [[L, yy], [R, yy]]) }
    }
  },
  // California as a field of dots for its people, thinning out where the doctors aren't
  desert(x, X, Y, W, H, c) {
    const CA = [[0.06, 0], [0.46, 0], [0.46, 0.34], [0.96, 0.74], [0.98, 0.8], [0.9, 0.9], [0.88, 1], [0.58, 0.98], [0.5, 0.88], [0.36, 0.8], [0.3, 0.7], [0.18, 0.56], [0.12, 0.42], [0.1, 0.3], [0, 0.16], [0.02, 0.06]]
    const s = Math.min(W * 0.9, H / 1.12), ox = X + (W - s) / 2, oy = Y
    const poly = CA.map(([a, b]) => [ox + a * s, oy + b * s * 1.12])
    const inside = (px, py) => { let ins = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) ins = !ins } return ins }
    const r = rng('ca'), step = s / 21
    for (let py = oy; py < oy + s * 1.12; py += step) for (let px = ox; px < ox + s; px += step) {
      if (!inside(px, py)) continue
      const u = (px - ox) / s, v = (py - oy) / (s * 1.12)
      const desert = (u > 0.42 && v < 0.62) || (u > 0.55 && v > 0.62 && v < 0.85) || (v < 0.18 && u > 0.2)
      if (desert && r() < 0.78) continue
      x.fillStyle = desert ? c.ac : c.ink; dot(x, px, py, desert ? step * 0.24 : step * 0.36)
    }
  },
  // before and after, three measures, each step down
  bars(x, X, Y, W, H, c, h) {
    const lab = ['BLOOD PRESSURE', 'LDL', 'HBA1C'], gw = W / 3
    lab.forEach((t, k) => {
      const b0 = H * 0.78, b1 = b0 * [0.86, 0.8, 0.72][k], bx = X + gw * k + gw * 0.18, bw = gw * 0.28, base = Y + H * 0.86
      x.fillStyle = c.ac; x.fillRect(bx, base - b0, bw, b0); x.fillStyle = c.ink; x.fillRect(bx + bw + 8, base - b1, bw, b1)
      h.caps(x, 12, 2); x.textAlign = 'center'; x.fillText(t, X + gw * (k + 0.5), base + 18); x.textAlign = 'left'
    })
  },
  // a stock price walking toward a decision date, then jumping up or down
  jump(x, X, Y, W, H, c, h) {
    const r = rng('jump'), d = X + W * 0.62, mid = Y + H * 0.5, pts = []
    let v = 0
    for (let k = 0; k <= 50; k++) { v += (r() - 0.5) * 0.06; pts.push([X + (d - X) * k / 50, mid + v * H * 0.6]) }
    x.strokeStyle = c.ink; x.lineWidth = 5; line(x, pts)
    const [ex, ey] = pts[pts.length - 1]
    x.lineWidth = 5; x.setLineDash([12, 10]); x.strokeStyle = c.ac; line(x, [[ex, ey], [ex, Y + H * 0.08], [X + W, Y + H * 0.08]]); x.strokeStyle = c.ink; line(x, [[ex, ey], [ex, Y + H * 0.92], [X + W, Y + H * 0.92]]); x.setLineDash([])
    h.caps(x, 15, 3); x.fillStyle = c.ac; x.textAlign = 'right'; x.fillText('APPROVED', X + W, Y + H * 0.08 - 30); x.fillStyle = c.ink; x.fillText('NOT APPROVED', X + W, Y + H * 0.92 + 14); x.textAlign = 'left'
    x.strokeStyle = c.ink; x.lineWidth = 2; line(x, [[d, Y], [d, Y + H]])
  },
  // three rungs of supervision, and the line above which a human reviews
  rungs(x, X, Y, W, H, c, h) {
    const lab = ['AI ALONE', 'AI DRAFTS, HUMAN APPROVES', 'HUMAN ALONE'], gh = H / 3
    lab.forEach((t, k) => {
      const yy = Y + gh * k + gh * 0.2, w = W * (0.45 + k * 0.27)
      x.fillStyle = k === 1 ? c.ac : c.ink; x.fillRect(X, yy, w, gh * 0.5)
      h.caps(x, 13, 2); x.fillStyle = c.bg; x.fillText(t, X + 18, yy + gh * 0.25 - 7)
    })
    x.strokeStyle = c.ink; x.lineWidth = 3; x.setLineDash([10, 8]); line(x, [[X, Y + H], [X + W, Y]]); x.setLineDash([])
  },
}

/* --------------------------------------------- the paper cover: words, then the drawing --------------------------------------------- */
export function drawPaperCover(x, W, H, it, h) {
  const c = P[it.slug]
  x.fillStyle = c.bg; x.fillRect(0, 0, W, H)
  x.fillStyle = 'rgba(0,0,0,.06)'; x.fillRect(0, 0, 14, H)
  h.grain(x, W, H, c.dark ? 6 : 9)
  const m = W * 0.1, ink = c.ink
  x.fillStyle = ink; h.caps(x, 20, 4); x.fillText(String(it.kind || '').toUpperCase(), m, m)
  x.fillRect(m, m + 38, W - 2 * m, 2); x.letterSpacing = '0px'
  const t = h.fitTitle(x, it.title, W - 2 * m, H * 0.3, 70, 30, 1.08)
  t.lines.forEach((l, k) => x.fillText(l, m, m + 74 + k * t.fs * 1.08))
  let y = m + 74 + t.lines.length * t.fs * 1.08 + 6
  const who = String(it.authors || '').replace(/\s*·\s*in preparation$/, '')
  if (who) { x.font = `400 21px ${h.BOOK}`; x.globalAlpha = 0.75; h.wrap(x, who, W - 2 * m).slice(0, 2).forEach((l) => { x.fillText(l, m, y); y += 29 }); x.globalAlpha = 1 }
  const top = y + 50, bot = H - m - 120
  x.save(); MOTIFS[c.motif](x, m, top, W - 2 * m, bot - top, c, h); x.restore()
  x.fillStyle = ink; x.fillRect(m, H - m - 78, W - 2 * m, 2)
  h.caps(x, 18, 3)
  h.wrap(x, String(it.cover || '').toUpperCase(), W - 2 * m).slice(0, 2).forEach((l, k) => x.fillText(l, m, H - m - 60 + k * 26))
  x.textAlign = 'right'; x.fillText('SHANMU RAJA', W - m, H - m - 6); x.textAlign = 'left'; x.letterSpacing = '0px'
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
