import React, { useRef, useState, useEffect } from 'react'

/* reveal-on-first-scroll. The line draw is run imperatively with the Web
   Animations API (fill: forwards) so React re-renders can never interrupt it
   mid-draw; `.in` only drives the opacity fades. */
function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let done = false
    const run = () => {
      if (done) return
      done = true
      setSeen(true)   // fades in the regions/labels
      el.querySelectorAll('.draw').forEach((path, i) => {
        // measured-length dash draw (works in every browser). line is full by default,
        // so if anything fails it stays complete rather than cut.
        let len = 0
        try { len = path.getTotalLength() } catch (e) { len = 0 }
        if (!len || !path.animate) return
        path.style.strokeDasharray = len
        path.style.strokeDashoffset = len
        const a = path.animate(
          [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration: 1500, delay: 120 + i * 160, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }
        )
        a.onfinish = () => { path.style.strokeDashoffset = '0'; path.style.strokeDasharray = 'none' }
      })
    }
    // reliable scroll-based trigger: fire once the chart is ~15% into view
    const check = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 0
      if (r.top < vh * 0.85 && r.bottom > vh * 0.1) { run(); window.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    const t = setTimeout(run, 5000)   // safety net
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); clearTimeout(t) }
  }, [threshold])
  return [ref, seen]
}

/* Catmull-Rom -> cubic-bezier: turns a list of pixel points into one fluid curve */
function smooth(pts) {
  if (pts.length < 3) return pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}
const Hatch = ({ id }) => (
  <defs>
    <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#0b0b0b" strokeWidth="1" opacity="0.26" />
    </pattern>
  </defs>
)

/* ============================================================
   AI Trap, Figure 1: the cost-curve (supply-side Einav-Finkelstein)
   ============================================================ */
export function AITrapFig1() {
  const W = 720, H = 380, padL = 70, padR = 30, padT = 30, padB = 60
  const cMax = 0.9, yTop = 0.62, yBot = -1.2
  const x = (c) => padL + (c / cMax) * (W - padL - padR)
  const y = (v) => padT + (yTop - v) / (yTop - yBot) * (H - padT - padB)
  const m = (c) => 0.5 - 2 * c * c
  const px = (lo, hi) => Array.from({ length: 40 }, (_, i) => { const c = lo + (hi - lo) * i / 39; return [x(c), y(m(c))] })
  const posArea = `${smooth(px(0, 0.5))} L ${x(0.5)} ${y(0)} L ${x(0)} ${y(0)} Z`
  const negArea = `${smooth(px(0.5, cMax))} L ${x(cMax)} ${y(0)} L ${x(0.5)} ${y(0)} Z`
  const [ref, seen] = useInView()
  return (
    <figure className={`figure${seen ? ' in' : ''}`} ref={ref}>
      <div className="fig-num">Figure 1. The cost-curve: who pays, and who loses money</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Margin is positive on the routine cream and negative on the complex tail, crossing zero at c-dagger one half">
        <Hatch id="h1" />
        <g className="cr-area"><path d={posArea} className="pos-area" /><path d={negArea} fill="url(#h1)" /></g>
        <line className="axis" x1={padL} y1={padT - 6} x2={padL} y2={H - padB} />
        <line className="axis" x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} />
        <line className="zero" x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} />
        <path d={smooth(px(0, cMax))} className="curve draw" fill="none" />
        <g className="cr-fade">
          <line className="dropline" x1={x(0.5)} y1={padT} x2={x(0.5)} y2={H - padB} />
          <text className="region-label" x={x(0.10)} y={y(0.30)}>THE CREAM</text>
          <text className="region-sub" x={x(0.10)} y={y(0.30) + 15}>routine cases, r &gt; cost</text>
          <text className="region-label" x={x(0.60)} y={y(-0.66)}>THE TAIL</text>
          <text className="region-sub" x={x(0.60)} y={y(-0.66) + 15}>complex cases, loss-making</text>
          <circle className="mark" cx={x(0.5)} cy={y(0)} r="4.5" />
          <text className="annot-key" x={x(0.5)} y={y(0) - 12} textAnchor="middle">c† = 0.50 break-even</text>
        </g>
        <text className="axt" x={(padL + W - padR) / 2} y={H - 16} textAnchor="middle">complexity c   (easy → hard)</text>
        <text className="axt" transform={`translate(22, ${(padT + H - padB) / 2}) rotate(-90)`} textAnchor="middle">margin per case   r − w(c)</text>
      </svg>
    </figure>
  )
}

/* ============================================================
   AI Trap, Figure 2: residual profit of the leftover pool
   ============================================================ */
const F2 = [[0, 0.80], [0.08, 0.74], [0.16, 0.60], [0.24, 0.38], [0.32, 0.0], [0.40, -0.20], [0.50, -0.31], [0.58, -0.325], [0.68, -0.27], [0.80, -0.16], [0.90, -0.08], [1.0, -0.03]]
export function AITrapFig2() {
  const W = 720, H = 380, padL = 70, padR = 30, padT = 30, padB = 60
  const yTop = 0.92, yBot = -0.48
  const x = (t) => padL + t * (W - padL - padR)
  const y = (v) => padT + (yTop - v) / (yTop - yBot) * (H - padT - padB)
  const P = F2.map(([t, v]) => [x(t), y(v)])
  const solvent = F2.filter(([t]) => t <= 0.32).map(([t, v]) => [x(t), y(v)])
  const deficit = F2.filter(([t]) => t >= 0.32).map(([t, v]) => [x(t), y(v)])
  const solventArea = `${smooth(solvent)} L ${x(0.32)} ${y(0)} L ${x(0)} ${y(0)} Z`
  const deficitArea = `${smooth(deficit)} L ${x(1)} ${y(0)} L ${x(0.32)} ${y(0)} Z`
  const [ref, seen] = useInView()
  return (
    <figure className={`figure${seen ? ' in' : ''}`} ref={ref}>
      <div className="fig-num">Figure 2. The leftover pool goes broke early, before break-even</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Residual profit crosses zero at theta-bar 0.32, before c-dagger 0.50">
        <Hatch id="h2" />
        <g className="cr-area"><path d={solventArea} className="pos-area" /><path d={deficitArea} fill="url(#h2)" /></g>
        <line className="axis" x1={padL} y1={padT - 6} x2={padL} y2={H - padB} />
        <line className="axis" x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} />
        <line className="zero" x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} />
        <path d={smooth(P)} className="curve draw" fill="none" />
        <g className="cr-fade">
          <line className="dropline" x1={x(0.32)} y1={padT} x2={x(0.32)} y2={H - padB} />
          <line className="dropline" x1={x(0.50)} y1={padT} x2={x(0.50)} y2={H - padB} />
          <text className="region-label" x={x(0.05)} y={y(0.42)}>SOLVENT</text>
          <text className="region-label" x={x(0.62)} y={y(-0.14)}>POOL UNDERWATER</text>
          <circle className="mark" cx={x(0.32)} cy={y(0)} r="4.5" />
          <text className="annot-key" x={x(0.32)} y={padT - 10} textAnchor="middle">θ̄ ≈ 0.32</text>
          <text className="annot" x={x(0.50)} y={padT - 10} textAnchor="middle">c† = 0.50</text>
        </g>
        <text className="axt" x={(padL + W - padR) / 2} y={H - 16} textAnchor="middle">share of cases automated   θ   (easy → hard)</text>
        <text className="axt" transform={`translate(22, ${(padT + H - padB) / 2}) rotate(-90)`} textAnchor="middle">profit of leftover pool   Π(θ)</text>
      </svg>
    </figure>
  )
}

/* ============================================================
   Medi-Cal thesis: the access gap narrows after Prop 56
   ============================================================ */
const YEARS = Array.from({ length: 15 }, (_, i) => 2010 + i)
const DESERT =    [1850, 1880, 1900, 1872, 1845, 1822, 1810, 1788, 1742, 1690, 1642, 1600, 1560, 1526, 1500]
const NONDESERT = [1300, 1306, 1300, 1296, 1301, 1290, 1286, 1281, 1276, 1281, 1276, 1279, 1276, 1281, 1283]
export function ThesisLines() {
  const W = 720, H = 360, padL = 58, padR = 20, padT = 34, padB = 46, yMin = 1100, yMax = 2000
  const x = (i) => padL + (i / (YEARS.length - 1)) * (W - padL - padR)
  const y = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB)
  const toPts = (a) => a.map((v, i) => [x(i), y(v)])
  const poly = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const gap = `${poly(toPts(DESERT))} ${poly([...toPts(NONDESERT)].reverse()).replace(/^M/, 'L')} Z`
  const [ref, seen] = useInView()
  return (
    <figure className={`figure${seen ? ' in' : ''}`} ref={ref}>
      <div className="fig-num">Figure 3. Preventable hospitalizations per 100k, desert vs non-desert counties, 2010–2024</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The access gap between desert and non-desert counties narrows after Prop 56">
        {[1200, 1500, 1800].map((t) => (<g key={t}><line className="grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} /><text className="axt" x={padL - 8} y={y(t) + 3} textAnchor="end">{t}</text></g>))}
        {[2010, 2014, 2018, 2022, 2024].map((t) => (<text className="axt" key={t} x={x(t - 2010)} y={H - padB + 18} textAnchor="middle">{t}</text>))}
        <g className="cr-area">
          <rect className="band" x={x(7)} y={padT} width={x(14) - x(7)} height={H - padT - padB} />
          <path d={gap} className="gap-area" />
        </g>
        <path d={smooth(toPts(NONDESERT))} className="curve dashed fade-line" fill="none" />
        <path d={smooth(toPts(DESERT))} className="curve draw" fill="none" />
        <g className="cr-fade">
          <text className="axt band-label" x={(x(7) + x(14)) / 2} y={padT + 12} textAnchor="middle">PROP 56 (2017+)</text>
          <text className="region-sub" x={x(0.4)} y={y(1575)}>the access gap</text>
          <text className="annot-key" x={x(2.1)} y={y(1960)} textAnchor="middle">+37% in deserts</text>
          <text className="annot" x={x(12.6)} y={y(1690)} textAnchor="middle">81.8% of the</text>
          <text className="annot" x={x(12.6)} y={y(1690) + 12} textAnchor="middle">closure is post-2016</text>
          <g transform={`translate(${padL + 6}, ${padT - 20})`}>
            <line className="curve" x1="0" y1="0" x2="20" y2="0" /><text className="axt" x="26" y="3">Desert (n=11)</text>
            <line className="curve dashed" x1="150" y1="0" x2="170" y2="0" /><text className="axt" x="176" y="3">Non-desert (n=47)</text>
          </g>
        </g>
      </svg>
    </figure>
  )
}
