import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const inView = { once: true, margin: '-40px' }
const draw = (r, delay = 0) => r ? {} : { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: inView, transition: { duration: 1.5, ease: 'easeInOut', delay } }
const fade = (r, delay = 0) => r ? {} : { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: inView, transition: { duration: 0.5, delay } }

/* ============================================================
   AI Trap — Figure 1: the cost-curve (supply-side Einav–Finkelstein)
   margin r−w(c) = 0.5 − 2c²,  crosses zero at c† = 0.5
   ============================================================ */
export function AITrapFig1() {
  const W = 720, H = 360, padL = 66, padR = 28, padT = 28, padB = 56
  const cMax = 0.9, yTop = 0.6, yBot = -1.2
  const x = (c) => padL + (c / cMax) * (W - padL - padR)
  const y = (v) => padT + (yTop - v) / (yTop - yBot) * (H - padT - padB)
  const pts = Array.from({ length: 46 }, (_, i) => { const c = i * cMax / 45; return [c, 0.5 - 2 * c * c] })
  const path = pts.map(([c, v], i) => `${i ? 'L' : 'M'} ${x(c).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const r = useReducedMotion()
  return (
    <figure className="figure">
      <div className="fig-num">Figure 1 — The cost-curve picture (supply-side Einav–Finkelstein)</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Margin r minus w(c) is positive on the routine cream and negative on the tail">
        <line className="axis" x1={padL} y1={padT - 4} x2={padL} y2={H - padB} />
        <line className="axis" x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} />
        <line className="zero" x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} />
        <motion.path d={path} className="curve" fill="none" vectorEffect="non-scaling-stroke" {...draw(r)} />
        <motion.g {...fade(r, 1.1)}>
          <circle className="mark" cx={x(0.5)} cy={y(0)} r="4.5" />
          <text className="lab" x={x(0.5)} y={y(0) - 10} textAnchor="middle">c†</text>
        </motion.g>
        <text className="axt" x={(padL + W - padR) / 2} y={H - 16} textAnchor="middle">complexity c  (easy → hard)</text>
        <text className="axt" transform={`translate(20, ${(padT + H - padB) / 2}) rotate(-90)`} textAnchor="middle">margin  r − w(c)</text>
      </svg>
    </figure>
  )
}

/* ============================================================
   AI Trap — Figure 2: residual profit ΠI(θ) crosses zero at θ̄ ≈ 0.32
   ============================================================ */
const F2 = [[0, 0.80], [0.08, 0.74], [0.16, 0.60], [0.24, 0.38], [0.32, 0.0], [0.40, -0.20], [0.50, -0.31], [0.58, -0.325], [0.68, -0.27], [0.80, -0.16], [0.90, -0.08], [1.0, -0.03]]
export function AITrapFig2() {
  const W = 720, H = 360, padL = 66, padR = 28, padT = 24, padB = 56
  const yTop = 0.92, yBot = -0.45
  const x = (t) => padL + t * (W - padL - padR)
  const y = (v) => padT + (yTop - v) / (yTop - yBot) * (H - padT - padB)
  const path = F2.map(([t, v], i) => `${i ? 'L' : 'M'} ${x(t).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const r = useReducedMotion()
  return (
    <figure className="figure">
      <div className="fig-num">Figure 2 — Residual profit Π(θ) crosses zero at the unraveling threshold θ̄ ≈ 0.32</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Residual profit crosses zero at theta-bar 0.32, before c-dagger 0.5">
        <line className="axis" x1={padL} y1={padT - 2} x2={padL} y2={H - padB} />
        <line className="zero" x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} />
        <motion.path d={path} className="curve" fill="none" vectorEffect="non-scaling-stroke" {...draw(r)} />
        <motion.g {...fade(r, 1.1)}>
          <circle className="mark" cx={x(0.32)} cy={y(0)} r="4.5" />
          <text className="lab" x={x(0.32)} y={y(0) + 20} textAnchor="middle">θ̄</text>
          <line className="tick" x1={x(0.5)} y1={y(0) - 5} x2={x(0.5)} y2={y(0) + 5} />
          <text className="lab" x={x(0.5)} y={y(0) + 20} textAnchor="middle">c†</text>
        </motion.g>
        <text className="axt" x={(padL + W - padR) / 2} y={H - 16} textAnchor="middle">AI frontier  θ</text>
        <text className="axt" transform={`translate(20, ${(padT + H - padB) / 2}) rotate(-90)`} textAnchor="middle">residual profit  Π(θ)</text>
      </svg>
    </figure>
  )
}

/* ============================================================
   Medi-Cal thesis — Figure 1 (desert vs non-desert), recreation of caption
   ============================================================ */
const YEARS = Array.from({ length: 15 }, (_, i) => 2010 + i)
const DESERT =    [1850, 1880, 1900, 1872, 1845, 1822, 1810, 1788, 1742, 1690, 1642, 1600, 1560, 1526, 1500]
const NONDESERT = [1300, 1306, 1300, 1296, 1301, 1290, 1286, 1281, 1276, 1281, 1276, 1279, 1276, 1281, 1283]
export function ThesisLines() {
  const W = 720, H = 330, padL = 56, padR = 18, padT = 24, padB = 42, yMin = 1100, yMax = 2000
  const x = (i) => padL + (i / (YEARS.length - 1)) * (W - padL - padR)
  const y = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB)
  const toPath = (a) => a.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const r = useReducedMotion()
  return (
    <figure className="figure">
      <div className="fig-num">Figure 1 — Preventable hospitalizations, desert vs non-desert counties, 2010–2024</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Preventable hospitalizations, desert vs non-desert">
        {[1200, 1500, 1800].map((t) => (<g key={t}><line className="grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} /><text className="axt" x={padL - 8} y={y(t) + 3} textAnchor="end">{t}</text></g>))}
        {[2010, 2014, 2018, 2022, 2024].map((t) => (<text className="axt" key={t} x={x(t - 2010)} y={H - padB + 18} textAnchor="middle">{t}</text>))}
        <rect className="band" x={x(7)} y={padT} width={x(14) - x(7)} height={H - padT - padB} />
        <text className="axt band-label" x={(x(7) + x(14)) / 2} y={padT + 12} textAnchor="middle">PROP 56</text>
        <path d={`${toPath(DESERT)} L ${x(14)} ${y(yMin)} L ${x(0)} ${y(yMin)} Z`} className="area" />
        <motion.path d={toPath(NONDESERT)} className="curve dashed" vectorEffect="non-scaling-stroke" {...draw(r, 0.15)} />
        <motion.path d={toPath(DESERT)} className="curve" vectorEffect="non-scaling-stroke" {...draw(r)} />
        <g transform={`translate(${padL + 6}, ${padT + 2})`}>
          <line className="curve" x1="0" y1="0" x2="20" y2="0" vectorEffect="non-scaling-stroke" /><text className="axt" x="26" y="3">Desert (n=11)</text>
          <line className="curve dashed" x1="150" y1="0" x2="170" y2="0" vectorEffect="non-scaling-stroke" /><text className="axt" x="176" y="3">Non-desert (n=47)</text>
        </g>
      </svg>
    </figure>
  )
}
