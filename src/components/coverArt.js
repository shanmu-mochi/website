/* The drawings on the publication covers (src/data/pubCovers.js picks one per paper). Each draws the paper's idea
   as an illustration, not data: nothing here is a measured value, and there are no numbers on them.
   Every function draws into a 100 x 82 box (the canvas is already scaled), with the cover's colours in c:
   { bg, accent, ink } plus paper (the cream). */
const PAPER = '#f4efe2'

const rect = (x, cx, y, w, h, fill) => { x.fillStyle = fill; x.fillRect(cx, y, w, h) }
const round = (x, cx, y, w, h, r, fill) => { x.beginPath(); x.roundRect(cx, y, w, h, r); x.fillStyle = fill; x.fill() }
const dot = (x, cx, cy, r, fill) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fillStyle = fill; x.fill() }
const ring = (x, cx, cy, r, stroke, w, alpha = 1) => { x.save(); x.globalAlpha = alpha; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.strokeStyle = stroke; x.lineWidth = w; x.stroke(); x.restore() }
const line = (x, pts, stroke, w, dash) => { x.save(); x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.strokeStyle = stroke; x.lineWidth = w; x.lineJoin = 'round'; x.lineCap = 'round'; if (dash) x.setLineDash(dash); x.stroke(); x.restore() }
// a seeded random so a cover never changes between renders
const rng = (seed) => { let s = seed; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648 } }
const rot = (x, cx, cy, deg, f) => { x.save(); x.translate(cx, cy); x.rotate((deg * Math.PI) / 180); x.translate(-cx, -cy); f(); x.restore() }
function capsule(x, cx, cy, len, wid, top, bottom) {
  // upright capsule, two halves
  const r = wid / 2
  x.save(); x.beginPath(); x.roundRect(cx - r, cy - len / 2, wid, len, r); x.clip()
  rect(x, cx - r, cy - len / 2, wid, len / 2, top); rect(x, cx - r, cy, wid, len / 2, bottom); x.restore()
}

export const ART = {
  // Same Result, Different Price: two identical capsules on one line, one with a tiny price tag, one with a huge one
  priceTags(x, c) {
    line(x, [[8, 66], [92, 66]], PAPER, 0.5)
    ;[30, 70].forEach((cx) => capsule(x, cx, 53, 26, 13, c.ink, PAPER))
    line(x, [[30, 40], [30, 29]], PAPER, 0.4); line(x, [[70, 40], [70, 32]], PAPER, 0.4)
    rot(x, 30, 30, -8, () => { round(x, 26.5, 21, 7, 9, 1, c.accent); dot(x, 30, 23, 0.8, c.bg) })
    rot(x, 70, 33, 7, () => { round(x, 56, 5, 28, 28, 2.4, c.accent); dot(x, 70, 9.5, 1.6, c.bg) })
  },
  // Off-Trial: a neat block of dots inside a trial's box, and the same dots loose in the world outside it
  outsideTheTrial(x, c) {
    x.save(); x.strokeStyle = PAPER; x.lineWidth = 0.5; x.setLineDash([1.2, 1]); x.strokeRect(14, 22, 26, 38); x.restore()
    for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) dot(x, 18.5 + i * 5.7, 26.5 + j * 6, 1.5, PAPER)
    const r = rng(5)
    for (let k = 0; k < 46; k++) { const px = 48 + r() * 44, py = 10 + r() * 62; dot(x, px, py, 1.1 + r() * 1.1, k % 5 ? PAPER : c.accent) }
  },
  // Escalate or Switch: one path reaches a fork; one way climbs a step, the other crosses to a second track
  escalateOrSwitch(x, c) {
    line(x, [[8, 50], [42, 50]], PAPER, 1.4)
    line(x, [[42, 50], [56, 50], [56, 30], [92, 30]], c.accent, 1.4)
    line(x, [[42, 50], [62, 64], [92, 64]], PAPER, 1.4, [2.2, 1.6])
    line(x, [[8, 64], [40, 64]], c.ink, 1.4)
    dot(x, 42, 50, 2.4, c.accent); dot(x, 92, 30, 1.6, c.accent); dot(x, 92, 64, 1.6, PAPER)
  },
  // What Week 8 Knows: a run of weeks, an early one marked, and a fan of what comes after narrowing from it
  earlySignal(x, c) {
    for (let i = 0; i < 27; i++) line(x, [[8 + i * 3.2, 62], [8 + i * 3.2, i % 4 ? 64 : 66]], PAPER, 0.35)
    line(x, [[8, 62], [92, 62]], PAPER, 0.4)
    const sx = 8 + 8 * 3.2
    x.save(); x.beginPath(); x.moveTo(sx, 40); x.lineTo(92, 20); x.lineTo(92, 34); x.closePath(); x.fillStyle = c.ink; x.globalAlpha = 0.85; x.fill(); x.restore()
    line(x, [[sx, 40], [92, 27]], c.accent, 0.9)
    line(x, [[8, 52], [14, 49], [20, 46], [sx, 40]], PAPER, 0.9)
    line(x, [[sx, 40], [sx, 62]], c.accent, 0.5, [1, 1]); dot(x, sx, 40, 2.2, c.accent)
  },
  // Helical Classification: two strands winding round each other
  helix(x, c) {
    const pts = (ph) => Array.from({ length: 80 }, (_, i) => { const t = i / 79; return [8 + t * 84, 41 + Math.sin(t * Math.PI * 4 + ph) * 17] })
    const a = pts(0), b = pts(Math.PI)
    for (let i = 2; i < 80; i += 4) line(x, [a[i], b[i]], c.ink, 0.8)
    line(x, b, PAPER, 2.2); line(x, a, c.accent, 2.2)
  },
  // Geometric Analysis after PETTICOAT: a curved vessel with a mesh section laid along it
  stentedTube(x, c) {
    const path = (o) => Array.from({ length: 60 }, (_, i) => { const t = i / 59, a = Math.PI * (1 - t); return [50 + Math.cos(a) * (32 + o), 66 - Math.sin(a) * (40 + o)] })
    x.save(); x.beginPath(); path(7).forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); path(-7).reverse().forEach(([a, b]) => x.lineTo(a, b)); x.closePath(); x.fillStyle = PAPER; x.fill(); x.restore()
    const o = path(7), n = path(-7)
    for (let i = 30; i < 59; i += 2) { line(x, [o[i], n[i + 1 > 59 ? 59 : i + 1]], c.accent, 0.5); line(x, [n[i], o[i + 1 > 59 ? 59 : i + 1]], c.accent, 0.5) }
    line(x, path(0), c.ink, 0.5, [1.4, 1.2])
  },
  // Longitudinal Mapping of True Lumen Morphology: cross-sections along a vessel, the inner lumen changing shape
  crossSections(x, c) {
    line(x, [[6, 41], [94, 41]], PAPER, 0.4, [1, 1])
    for (let i = 0; i < 6; i++) {
      const cx = 13 + i * 14.8
      x.save(); x.beginPath(); x.ellipse(cx, 41, 6, 15, 0, 0, Math.PI * 2); x.fillStyle = PAPER; x.fill(); x.restore()
      x.save(); x.beginPath(); x.ellipse(cx + 0.4, 41 - 2 + i * 0.6, 3.9 - i * 0.35, 11 - i * 1.3, 0, 0, Math.PI * 2); x.fillStyle = c.accent; x.fill(); x.restore()
    }
  },
  // Aortic Remodeling after TEVAR and PETTICOAT: the same arch before (dashed) and after (solid)
  archRemodel(x, c) {
    const arch = (r, w) => Array.from({ length: 50 }, (_, i) => { const a = Math.PI * (1 - i / 49); return [50 + Math.cos(a) * r, 66 - Math.sin(a) * r * w] })
    line(x, [...arch(34, 1.15), [84, 76]], c.ink, 7)
    line(x, [...arch(30, 1.02), [80, 76]], PAPER, 4.5)
    line(x, [...arch(34, 1.15), [84, 76]], c.accent, 0.7, [1.6, 1.4])
    // three branches off the top of the arch, each leaving along the arch's normal
    ;[15, 22, 29].forEach((i) => { const a = Math.PI * (1 - i / 49), px = 50 + Math.cos(a) * 36, py = 66 - Math.sin(a) * 36 * 1.15; line(x, [[px, py], [px + Math.cos(a) * 8, py - Math.sin(a) * 10]], c.ink, 3) })
  },
  // Concordance of LLMs with Guidelines: one ruled reference line and three lines that track it, closely or less so
  threeTracks(x, c) {
    line(x, [[8, 41], [92, 41]], PAPER, 1.6)
    const r = rng(9), third = c.ink === '#0b0b22' ? '#9b8cff' : c.ink
    ;[[c.accent, -22], ['#ffffff', 14], [third, 26]].forEach(([col, off]) => {
      const pts = Array.from({ length: 22 }, (_, i) => { const t = i / 21; return [8 + t * 84, 41 + off * (1 - t) ** 1.6 + (r() - 0.5) * 2.4 * (1 - t)] })
      line(x, pts, col, 1)
    })
    dot(x, 92, 41, 1.8, c.accent)
  },
  // Branded vs Compounded Semaglutide + Cyanocobalamin: two vials alike, one with a second, small drop added
  twoVials(x, c) {
    ;[[30, false], [68, true]].forEach(([cx, plus]) => {
      round(x, cx - 9, 26, 18, 42, 3, PAPER); round(x, cx - 6, 18, 12, 9, 1.5, c.ink)
      rect(x, cx - 9, 46, 18, 22, c.ink); round(x, cx - 9, 46, 18, 22, 3, c.ink)
      if (plus) { dot(x, cx + 16, 22, 3.2, c.accent); line(x, [[cx + 16, 26], [cx + 9, 40]], c.accent, 0.5, [1, 1]) }
    })
    line(x, [[12, 70], [88, 70]], PAPER, 0.5)
  },
  // Variation of Reimbursements within DRGs: groups as boxes, the dots inside each spread up and down
  binsOfDots(x, c) {
    const r = rng(21)
    for (let b = 0; b < 5; b++) {
      const bx = 9 + b * 17
      x.save(); x.strokeStyle = PAPER; x.lineWidth = 0.5; x.strokeRect(bx, 14, 14, 54); x.restore()
      for (let k = 0; k < 9; k++) dot(x, bx + 2.5 + r() * 9, 18 + r() * 46, 1.2, k % 4 ? PAPER : c.accent)
    }
  },
  // Healthcare's AI Trap: two supports standing on the same row of routine blocks, some being pulled out
  pulledSupports(x, c) {
    rect(x, 18, 20, 64, 7, PAPER); rect(x, 24, 27, 9, 28, PAPER); rect(x, 67, 27, 9, 28, PAPER)
    for (let i = 0; i < 9; i++) {
      const out = i % 3 === 1, bx = 14 + i * 8
      if (out) rot(x, bx + 3.5, 64, (i % 2 ? 1 : -1) * 9, () => rect(x, bx, 61 - (i % 4) * 2.2, 7, 6, c.accent))
      else { x.save(); x.globalAlpha = 0.55; rect(x, bx, 55, 7, 6, PAPER); x.restore() }
    }
    line(x, [[10, 69.5], [90, 69.5]], PAPER, 0.4, [1, 1])
  },
  // Mapping Medi-Cal Deserts: 58 marks, one for each county, and rings of distance around one point of care
  distanceRings(x, c) {
    for (let k = 1; k <= 5; k++) ring(x, 70, 34, k * 9, c.ink, 0.4, 1 - k * 0.14)
    const r = rng(11)
    for (let i = 0; i < 58; i++) { const u = r(), v = r(); rot(x, 9.3 + u * 84, 9.3 + v * 66, 45, () => { x.save(); x.globalAlpha = 0.9; rect(x, 8 + u * 84, 8 + v * 66, 2.6, 2.6, PAPER); x.restore() }) }
    dot(x, 70, 34, 2.4, c.accent)
  },
  // Third-Party Cardiometabolic Outcomes: a telehealth record and an outside clinic's record, joined by one pulse
  linkedRecords(x, c) {
    round(x, 10, 22, 24, 38, 3, PAPER); round(x, 66, 22, 24, 38, 3, PAPER)
    for (let i = 0; i < 4; i++) { rect(x, 14, 30 + i * 6, 16 - (i % 2) * 5, 1.4, c.ink); rect(x, 70, 30 + i * 6, 16 - ((i + 1) % 2) * 5, 1.4, c.ink) }
    line(x, [[34, 41], [42, 41], [45, 33], [49, 50], [52, 37], [55, 41], [66, 41]], c.accent, 1.2)
  },
  // Scheduled Jumps: a price that wanders, then jumps on the scheduled decision date, one way or the other
  scheduledJump(x, c) {
    const r = rng(3); let y = 52; const pts = [[10, 52]]
    for (let px = 12; px <= 60; px += 2) { y += (r() - 0.5) * 5.5; pts.push([px, y]) }
    line(x, [[61, 10], [61, 74]], PAPER, 0.35, [1, 1])
    line(x, pts, PAPER, 0.9)
    line(x, [[60, y], [62, 20], [90, 18]], c.accent, 1.1)
    x.save(); x.globalAlpha = 0.75; line(x, [[60, y], [62, 70], [90, 71]], PAPER, 0.7, [1.5, 1]); x.restore()
    dot(x, 61, y, 1.8, c.accent)
  },
  // The Doctor Will See You Now: a ladder of supervision, one rung lit
  ladder(x, c) {
    line(x, [[38, 74], [44, 8]], PAPER, 1.6); line(x, [[62, 74], [68, 8]], PAPER, 1.6)
    for (let i = 0; i < 7; i++) { const t = (i + 0.5) / 7, y = 74 - t * 66, dx = t * 6; line(x, [[38 + dx, y], [62 + dx, y]], i === 4 ? c.accent : PAPER, i === 4 ? 2 : 1.1) }
    dot(x, 78, 26.6, 2.2, c.accent); line(x, [[67, 26.6], [75, 26.6]], c.accent, 0.5, [1, 1])
  },
}

export function drawArt(ctx, W, Hf, cov) {
  ctx.fillStyle = (cov && cov.bg) || '#3a3a3a'; ctx.fillRect(0, 0, W, Hf)
  const f = cov && ART[cov.art]
  if (!f) return
  // the 100 x 82 box, scaled to cover the field
  const s = Math.max(W / 100, Hf / 82)
  ctx.save(); ctx.translate((W - 100 * s) / 2, (Hf - 82 * s) / 2); ctx.scale(s, s)
  f(ctx, { bg: cov.bg, accent: cov.accent, ink: cov.ink })
  ctx.restore()
}
