import React from 'react'
import { useScene, useNarrow, smooth, poly, Hatch } from '../chartkit'

/* ============================================================
   The convergence picture: the access gap closes 81.8%
   ============================================================ */
const YRS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
const DES = [226, 221, 212, 203, 194, 184, 175, 166, 158]
const NON = [138, 139, 140, 140, 141, 141, 142, 142, 142]
export function PqiGap({ num = 'Figure 2. Preventable hospitalizations per 100,000 Medi-Cal enrollees' }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 400 : 360
  const padL = nw ? 38 : 58, padR = nw ? 14 : 26, padT = nw ? 62 : 34, padB = nw ? 56 : 52
  const yMin = 120, yMax = 240
  const x = (i) => padL + (i / (YRS.length - 1)) * (W - padL - padR)
  const y = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB)
  const dp = DES.map((v, i) => [x(i), y(v)])
  const np = NON.map((v, i) => [x(i), y(v)])
  const gap = `${poly(dp)} ${poly([...np].reverse()).replace(/^M/, 'L')} Z`
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The desert and non-desert PQI gap narrows across the study period">
        {[140, 180, 220].map((t) => (
          <g key={t}><line className="grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} /><text className="axt" x={padL - 8} y={y(t) + 3} textAnchor="end">{t}</text></g>
        ))}
        {YRS.filter((_, i) => (nw ? i % 4 === 0 : i % 2 === 0)).map((t) => (
          <text className="axt" key={t} x={x(YRS.indexOf(t))} y={H - padB + 18} textAnchor="middle">{t}</text>
        ))}
        <g className="cr-area">
          <rect className="band" x={x(1)} y={padT} width={x(8) - x(1)} height={H - padT - padB} />
          <path d={gap} className="gap-area" />
        </g>
        <path d={smooth(np)} className="curve dashed fade-line" />
        <path d={smooth(dp)} className="curve draw" />
        <g className="cr-fade">
          <text className="axt band-label" x={(x(1) + x(8)) / 2} y={padT + 12} textAnchor="middle">{nw ? 'PROP 56 (2017 ON)' : 'PROP 56 RATE INCREASE (2017 ON)'}</text>
          <text className="region-sub" x={x(0.15)} y={y(178)}>the access gap</text>
          <text className="annot-key" x={x(0.4)} y={y(233)}>+37% in deserts</text>
          <text className="annot" x={nw ? x(6.4) : x(7.1)} y={y(196)} textAnchor="middle">81.8% of that</text>
          <text className="annot" x={nw ? x(6.4) : x(7.1)} y={y(196) + 12} textAnchor="middle">gap is now closed</text>
          {nw ? (
            <g transform={`translate(${padL}, ${padT - 40})`}>
              <line className="curve" x1="0" y1="0" x2="18" y2="0" /><text className="axt" x="24" y="3">Desert counties (n=11)</text>
              <line className="curve dashed" x1="0" y1="16" x2="18" y2="16" /><text className="axt" x="24" y="19">Everywhere else (n=47)</text>
            </g>
          ) : (
            <g transform={`translate(${padL + 6}, ${padT - 18})`}>
              <line className="curve" x1="0" y1="0" x2="20" y2="0" /><text className="axt" x="26" y="3">Desert counties (n=11)</text>
              <line className="curve dashed" x1="190" y1="0" x2="210" y2="0" /><text className="axt" x="216" y="3">Everywhere else (n=47)</text>
            </g>
          )}
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   Through the door, but not much further
   ============================================================ */
const DEPTH = [
  { l: 'Primary care visits', v: 2.9 },
  { l: 'Imaging', v: -8.2 },
  { l: 'Procedures', v: -9.5 },
  { l: 'Treatments', v: -14.6 },
  { l: 'Anesthesia services', v: -21.8 },
]
export function DepthOfCare({ num = 'Figure 3. Service use in desert counties, percent difference from everywhere else' }) {
  const nw = useNarrow()
  /* the category names will not fit a left gutter on a phone, so they sit
     above their own bar and the plot uses the full width */
  const W = nw ? 380 : 720, rowH = nw ? 62 : 44
  const padT = nw ? 34 : 30, padB = nw ? 44 : 40
  const padL = nw ? 14 : 168, padR = nw ? 14 : 70
  const H = padT + DEPTH.length * rowH + padB
  const span = 26
  const x = (v) => padL + ((v + span) / (2 * span)) * (W - padL - padR)
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Primary care visits are slightly higher in desert counties while procedures, treatments, anesthesia and imaging are all lower">
        <Hatch id="hm2" />
        {(nw ? [-20, 0, 20] : [-20, -10, 0, 10, 20]).map((t) => (
          <g key={t}>
            <line className="grid" x1={x(t)} x2={x(t)} y1={padT - 6} y2={H - padB} />
            <text className="axt" x={x(t)} y={H - padB + 18} textAnchor="middle">{t > 0 ? `+${t}` : t < 0 ? `\u2212${Math.abs(t)}` : t}%</text>
          </g>
        ))}
        <line className="axis" x1={x(0)} x2={x(0)} y1={padT - 6} y2={H - padB} />
        <g className="cr-area">
          {DEPTH.map((d, i) => {
            const yTop = padT + i * rowH + (nw ? 26 : 9)
            const x0 = Math.min(x(0), x(d.v)), wid = Math.abs(x(d.v) - x(0))
            return <rect key={d.l} x={x0} y={yTop} width={wid} height={nw ? 22 : rowH - 20} className={`${d.v > 0 ? 'bar' : 'bar-lite'} gbar${d.v > 0 ? '' : ' gbar--right'}`} style={{ '--o': Math.min(0.55, (i * 90) / 1500) }} />
          })}
        </g>
        <g className="cr-fade">
          {DEPTH.map((d, i) => {
            const yMid = nw ? padT + i * rowH + 37 : padT + i * rowH + rowH / 2 - 1
            const val = d.v > 0 ? `+${d.v}%` : `\u2212${Math.abs(d.v)}%`
            return (
              <g key={d.l}>
                {nw ? (
                  <>
                    <text className="clab" x={padL} y={padT + i * rowH + 16}>{d.l}</text>
                    <text className="vlab" x={W - padR} y={padT + i * rowH + 16} textAnchor="end">{val}</text>
                  </>
                ) : (
                  <>
                    <text className="clab" x={padL - 14} y={yMid + 4} textAnchor="end">{d.l}</text>
                    <text className="vlab" x={d.v > 0 ? x(d.v) + 9 : x(d.v) - 9} y={yMid + 4} textAnchor={d.v > 0 ? 'start' : 'end'}>{val}</text>
                  </>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   Doctor supply: the headline deficit, then the condition-specific ones
   ============================================================ */
const COND = [
  { l: 'COPD care', pct: 31 },
  { l: 'Diabetes care', pct: 33 },
  { l: 'Heart failure care', pct: 34 },
]
export function PcpGap({ num = 'Figure 4. Primary care supply, desert counties against the rest of the state' }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 470 : 400
  const padL = nw ? 14 : 176, padR = nw ? 34 : 56
  const topY = nw ? 116 : 92, condTop = nw ? 244 : 196, rowH = nw ? 62 : 46
  const x = (v) => padL + (v / 170) * (W - padL - padR)
  const xp = (v) => padL + (v / 40) * (W - padL - padR)
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Desert counties have 113.8 primary care physicians per 100,000 residents against 151.4 elsewhere, with 31 to 34 percent deficits for chronic disease care">
        <text className="axt" x={padL} y={34}>PROVIDERS PER 100,000 RESIDENTS</text>
        {(nw ? [0, 50, 100, 150] : [0, 50, 100, 150]).map((t) => (
          <g key={t}><line className="grid" x1={x(t)} x2={x(t)} y1={nw ? 78 : 48} y2={topY + 22} /><text className="axt" x={x(t)} y={topY + 40} textAnchor="middle">{t}</text></g>
        ))}
        <g className="cr-area">
          <line className="conn" x1={x(113.8)} x2={x(151.4)} y1={topY} y2={topY} />
          <circle className="dot pop" cx={x(113.8)} cy={topY} r="6.5" />
          <circle className="dot-open pop" cx={x(151.4)} cy={topY} r="6.5" style={{ transitionDelay: '110ms' }} />
        </g>
        <g className="cr-fade">
          <text className="clab" x={nw ? padL : padL - 18} y={nw ? topY - 34 : topY + 4} textAnchor={nw ? 'start' : 'end'}>All primary care</text>
          <text className="vlab" x={x(113.8)} y={topY - 16} textAnchor="middle">113.8</text>
          <text className="vlab" x={x(151.4)} y={topY - 16} textAnchor="middle">151.4</text>
          <text className="annot" x={nw ? x(151.4) + 8 : x(151.4) + 14} y={nw ? topY + 20 : topY + 4} textAnchor={nw ? 'middle' : 'start'}>&#8722;25%</text>
        </g>

        {nw ? (
          <>
            <text className="axt" x={padL} y={condTop - 42}>PERCENT FEWER PROVIDERS</text>
            <text className="axt" x={padL} y={condTop - 26}>PER CAPITA, BY CONDITION</text>
          </>
        ) : (
          <text className="axt" x={padL} y={condTop - 26}>PERCENT FEWER PROVIDERS PER CAPITA, BY CONDITION</text>
        )}
        {(nw ? [0, 20, 40] : [0, 10, 20, 30, 40]).map((t) => (
          <g key={t}>
            <line className="grid" x1={xp(t)} x2={xp(t)} y1={condTop - 14} y2={condTop + rowH * COND.length} />
            <text className="axt" x={xp(t)} y={condTop + rowH * COND.length + 18} textAnchor="middle">{t ? `\u2212${t}%` : '0'}</text>
          </g>
        ))}
        <line className="axis" x1={padL} x2={padL} y1={condTop - 14} y2={condTop + rowH * COND.length} />
        <g className="cr-area">
          {COND.map((c, i) => (
            <rect key={c.l} x={padL} y={condTop + i * rowH + (nw ? 26 : 9)} width={xp(c.pct) - padL} height={nw ? 22 : rowH - 26} className="bar-lite gbar" style={{ '--o': Math.min(0.55, (240 + i * 110) / 1500) }} />
          ))}
        </g>
        <g className="cr-fade">
          {COND.map((c, i) => {
            const yMid = nw ? condTop + i * rowH + 37 : condTop + i * rowH + (rowH - 26) / 2 + 9
            return (
              <g key={c.l}>
                {nw ? (
                  <>
                    <text className="clab" x={padL} y={condTop + i * rowH + 16}>{c.l}</text>
                    <text className="vlab" x={W - padR + 26} y={condTop + i * rowH + 16} textAnchor="end">&#8722;{c.pct}%</text>
                  </>
                ) : (
                  <>
                    <text className="clab" x={padL - 18} y={yMid + 4} textAnchor="end">{c.l}</text>
                    <text className="vlab" x={xp(c.pct) + 10} y={yMid + 4}>&#8722;{c.pct}%</text>
                  </>
                )}
              </g>
            )
          })}
          <g transform={`translate(${padL}, ${nw ? 62 : topY - 44})`}>
            <circle className="dot" cx="5" cy="-4" r="5" /><text className="axt" x="16" y="0">Desert</text>
            <circle className="dot-open" cx={nw ? 78 : 95} cy="-4" r="5" /><text className="axt" x={nw ? 89 : 106} y="0">Everywhere else</text>
          </g>
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   Walking out of the emergency room
   ============================================================ */
const LAMA_Y = [2020, 2021, 2022, 2023, 2024]
const LAMA_D = [3.11, 3.63, 3.62, 3.52, 3.26]
const LAMA_N = [2.05, 2.44, 2.63, 2.54, 2.36]
export function LamaTrend({ num = 'Figure 5. Share of emergency patients who leave before being treated' }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 360 : 320
  const padL = nw ? 42 : 58, padR = nw ? 14 : 90, padT = nw ? 44 : 34, padB = nw ? 52 : 48
  const yMin = 1.8, yMax = 3.9
  const x = (i) => padL + (i / (LAMA_Y.length - 1)) * (W - padL - padR)
  const y = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (H - padT - padB)
  const dp = LAMA_D.map((v, i) => [x(i), y(v)])
  const np = LAMA_N.map((v, i) => [x(i), y(v)])
  const gap = `${poly(dp)} ${poly([...np].reverse()).replace(/^M/, 'L')} Z`
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The share of emergency patients leaving before treatment stays about one point higher in desert counties from 2020 to 2024">
        {[2.0, 2.5, 3.0, 3.5].map((t) => (
          <g key={t}><line className="grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} /><text className="axt" x={padL - 8} y={y(t) + 3} textAnchor="end">{t.toFixed(1)}%</text></g>
        ))}
        {LAMA_Y.filter((_, i) => (nw ? i % 2 === 0 : true)).map((t) => <text className="axt" key={t} x={x(LAMA_Y.indexOf(t))} y={H - padB + 18} textAnchor="middle">{t}</text>)}
        <g className="cr-area"><path d={gap} className="gap-area" /></g>
        <path d={smooth(np)} className="curve dashed fade-line" />
        <path d={smooth(dp)} className="curve draw" />
        <g className="cr-fade">
          {LAMA_D.map((v, i) => <circle key={i} className="dot pop" cx={x(i)} cy={y(v)} r="3.2" style={{ '--o': Math.min(0.55, (i * 70) / 1500) }} />)}
          {LAMA_N.map((v, i) => <circle key={i} className="dot-open pop" cx={x(i)} cy={y(v)} r="3.2" style={{ '--o': Math.min(0.55, (120 + i * 70) / 1500) }} />)}
          <text className="clab" x={nw ? x(4) : x(4) + 12} y={nw ? y(LAMA_D[4]) - 12 : y(LAMA_D[4]) + 4} textAnchor={nw ? 'end' : 'start'}>Desert</text>
          <text className="clab-mute" x={nw ? x(4) : x(4) + 12} y={nw ? y(LAMA_N[4]) + 20 : y(LAMA_N[4]) + 4} textAnchor={nw ? 'end' : 'start'}>Rest of state</text>
          <text className="annot-key" x={nw ? x(1.3) : x(1)} y={y(3.78)} textAnchor="middle">{nw ? 'gap peaks: 1.19 pts' : 'gap peaks at 1.19 pts'}</text>
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   Every estimate points the same way, none of them lands
   ============================================================ */
const EST = [
  { l: 'NHSC placements', m: 'First differences', b: -4.4, p: 0.042 },
  { l: 'STLRP awards', m: 'First differences', b: -6.6, p: 0.477 },
  { l: 'FQHC sites', m: 'First differences', b: -1.6, p: 0.857 },
  { l: 'Rural health clinics', m: 'First differences', b: 1.1, p: 0.902 },
  { l: 'Proposition 56', m: 'Difference in differences', b: -3.21, p: 0.48 },
  { l: 'Proposition 56', m: 'Synthetic control', b: -2.55, p: 0.40 },
]
/* z for a two-sided p, good enough to turn the reported p-values back into intervals */
function zOf(p) {
  let lo = 0, hi = 8
  const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (2 * (1 - cdf(mid)) > p) lo = mid; else hi = mid
  }
  return (lo + hi) / 2
}
function erf(x) {
  const s = x < 0 ? -1 : 1
  const a = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * a)
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)
  return s * y
}
export function CausalForest({ num = 'Figure 6. Estimated change in preventable hospitalizations per 100,000' }) {
  const nw = useNarrow()
  /* study names and method go above each interval instead of in a left gutter */
  const W = nw ? 380 : 720, rowH = nw ? 74 : 46
  const padT = nw ? 46 : 42, padB = nw ? 48 : 52
  const padL = nw ? 14 : 210, padR = nw ? 14 : 80
  const H = padT + EST.length * rowH + padB
  const span = 26
  const x = (v) => padL + ((v + span) / (2 * span)) * (W - padL - padR)
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Five of six program estimates are negative, all with intervals crossing zero">
        {(nw ? [-20, 0, 20] : [-20, -10, 0, 10, 20]).map((t) => (
          <g key={t}>
            <line className="grid" x1={x(t)} x2={x(t)} y1={padT - 12} y2={H - padB} />
            <text className="axt" x={x(t)} y={H - padB + 18} textAnchor="middle">{t > 0 ? `+${t}` : t < 0 ? `\u2212${Math.abs(t)}` : t}</text>
          </g>
        ))}
        <line className="axis" x1={x(0)} x2={x(0)} y1={padT - 12} y2={H - padB} />
        <g className="cr-area">
          {EST.map((e, i) => {
            const se = Math.abs(e.b) / Math.max(zOf(e.p), 0.08)
            const lo = Math.max(-span, e.b - 1.96 * se), hi = Math.min(span, e.b + 1.96 * se)
            const yMid = nw ? padT + i * rowH + 50 : padT + i * rowH + rowH / 2
            return (
              <g key={e.l + e.m}>
                <line className="ci" x1={x(lo)} x2={x(hi)} y1={yMid} y2={yMid} />
                <line className="ci" x1={x(lo)} x2={x(lo)} y1={yMid - 5} y2={yMid + 5} />
                <line className="ci" x1={x(hi)} x2={x(hi)} y1={yMid - 5} y2={yMid + 5} />
                <circle className={`${e.p < 0.05 ? 'dot' : 'dot-open'} pop`} cx={x(e.b)} cy={yMid} r="5.5" style={{ '--o': Math.min(0.55, (300 + i * 90) / 1500) }} />
              </g>
            )
          })}
        </g>
        <g className="cr-fade">
          {EST.map((e, i) => {
            const yMid = nw ? padT + i * rowH + 50 : padT + i * rowH + rowH / 2
            const pv = 'p = ' + e.p.toFixed(3).replace(/0+$/, '').replace(/\.$/, '.0')
            return (
              <g key={e.l + e.m}>
                {nw ? (
                  <>
                    <text className="clab" x={padL} y={padT + i * rowH + 14}>{e.l}</text>
                    <text className="vlab" x={W - padR} y={padT + i * rowH + 14} textAnchor="end">{pv}</text>
                    <text className="clab-mute" x={padL} y={padT + i * rowH + 29}>{e.m}</text>
                  </>
                ) : (
                  <>
                    <text className="clab" x={padL - 16} y={yMid - 2} textAnchor="end">{e.l}</text>
                    <text className="clab-mute" x={padL - 16} y={yMid + 13} textAnchor="end">{e.m}</text>
                    <text className="vlab" x={W - padR + 12} y={yMid + 4}>{pv}</text>
                  </>
                )}
              </g>
            )
          })}
          <text className="axt" x={x(-span) + 4} y={padT - 22}>{nw ? 'fewer ←' : 'fewer hospitalizations ←'}</text>
          <text className="axt" x={x(span) - 4} y={padT - 22} textAnchor="end">→ more</text>
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   The annual bill
   ============================================================ */
const COST = [
  { l: 'Conservative', ed: 65.2, adm: 0.3 },
  { l: 'Central', ed: 81.6, adm: 0.6 },
  { l: 'Liberal', ed: 97.9, adm: 0.9 },
]
export function CostStack({ num = 'Figure 7. Annual excess spending attributable to desert conditions' }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 350 : 320
  const padL = nw ? 14 : 118, padR = nw ? 14 : 40, padT = nw ? 64 : 40, padB = nw ? 48 : 56
  const max = 110
  const x = (v) => padL + (v / max) * (W - padL - padR)
  const rowH = (H - padT - padB) / COST.length
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Annual excess spending runs from 65.5 million dollars to 98.8 million, almost all of it excess emergency visits">
        <Hatch id="hm6" />
        {(nw ? [0, 50, 100] : [0, 25, 50, 75, 100]).map((t) => (
          <g key={t}><line className="grid" x1={x(t)} x2={x(t)} y1={padT - 10} y2={H - padB} /><text className="axt" x={x(t)} y={H - padB + 18} textAnchor="middle">${t}M</text></g>
        ))}
        <line className="axis" x1={padL} x2={padL} y1={padT - 10} y2={H - padB} />
        <g className="cr-area">
          {COST.map((c, i) => {
            const yTop = padT + i * rowH + (nw ? 24 : 12)
            const h = nw ? rowH - 42 : rowH - 34
            return (
              <g key={c.l}>
                <rect x={padL} y={yTop} width={x(c.ed) - padL} height={h} className={`${c.l === 'Central' ? 'bar' : 'bar-lite'} gbar`} style={{ '--o': Math.min(0.55, (i * 120) / 1500) }} />
                <rect x={x(c.ed)} y={yTop} width={Math.max(2, x(c.ed + c.adm) - x(c.ed))} height={h} fill="url(#hm6)" className="gbar" style={{ '--o': Math.min(0.55, (300 + i * 120) / 1500) }} />
              </g>
            )
          })}
        </g>
        <g className="cr-fade">
          {COST.map((c, i) => {
            const yMid = padT + i * rowH + rowH / 2 - 4
            return (
              <g key={c.l}>
                {nw ? (
                  <>
                    <text className={c.l === 'Central' ? 'clab' : 'clab-mute'} x={padL} y={padT + i * rowH + 16}>{c.l}</text>
                    <text className="vlab" x={W - padR} y={padT + i * rowH + 16} textAnchor="end">${(c.ed + c.adm).toFixed(1)}M</text>
                  </>
                ) : (
                  <>
                    <text className={c.l === 'Central' ? 'clab' : 'clab-mute'} x={padL - 14} y={yMid + 4} textAnchor="end">{c.l}</text>
                    <text className="vlab" x={x(c.ed + c.adm) + 10} y={yMid + 4}>${(c.ed + c.adm).toFixed(1)}M</text>
                  </>
                )}
              </g>
            )
          })}
          {nw ? (
            <>
              <text className="axt" x={padL} y={padT - 34}>solid: excess emergency visits</text>
              <text className="axt" x={padL} y={padT - 18}>hatched: excess preventable admissions</text>
            </>
          ) : (
            <text className="axt" x={padL} y={padT - 20}>solid: excess emergency visits · hatched: excess preventable admissions</text>
          )}
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   11 of 58
   ============================================================ */
const DESERTS = ['Tulare', 'Tehama', 'Fresno', 'Shasta', 'Kern', 'Imperial', 'Siskiyou', 'Glenn', 'Modoc', 'Yuba', 'Lake']
export function CountyGrid({ num = 'Figure 1. The bottom quintile of the access index, 11 counties out of 58' }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720
  const cols = nw ? 8 : 12, cell = nw ? 34 : 30, gap = nw ? 7 : 7
  const padL = nw ? 14 : 40, padT = nw ? 78 : 66
  const rowsN = Math.ceil(58 / cols)
  const H = padT + rowsN * (cell + gap) + (nw ? 118 : 86)
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Eleven of California's fifty-eight counties fall in the bottom quintile of the access index">
        {nw ? (
          <>
            <text className="axt" x={padL} y={30}>EVERY CALIFORNIA COUNTY, RANKED</text>
            <text className="axt" x={padL} y={46}>BY THE ACCESS RESOURCE INDEX</text>
          </>
        ) : (
          <text className="axt" x={padL} y={34}>EVERY CALIFORNIA COUNTY, RANKED BY THE ACCESS RESOURCE INDEX</text>
        )}
        <g className="cr-area">
          {Array.from({ length: 58 }, (_, i) => {
            const cxi = i % cols, cyi = Math.floor(i / cols)
            const isDesert = i < 11
            return (
              <rect
                key={i}
                x={padL + cxi * (cell + gap)}
                y={padT + cyi * (cell + gap)}
                width={cell}
                height={cell}
                className={`${isDesert ? 'bar' : 'bar-out'} pop`}
                style={{ '--o': Math.min(0.55, ((isDesert ? 0 : 260) + i * 14) / 1500) }}
              />
            )
          })}
        </g>
        <g className="cr-fade">
          {nw ? (
            <>
              <text className="clab" x={padL} y={padT + rowsN * (cell + gap) + 26}>{DESERTS.slice(0, 6).join(' · ')}</text>
              <text className="clab" x={padL} y={padT + rowsN * (cell + gap) + 44}>{DESERTS.slice(6).join(' · ')}</text>
              <text className="clab-mute" x={padL} y={padT + rowsN * (cell + gap) + 70}>Mostly Central Valley and rural</text>
              <text className="clab-mute" x={padL} y={padT + rowsN * (cell + gap) + 86}>Northern California. Stable across</text>
              <text className="clab-mute" x={padL} y={padT + rowsN * (cell + gap) + 102}>fifteen years of data.</text>
            </>
          ) : (
            <>
              <text className="clab" x={padL} y={padT + rowsN * (cell + gap) + 26}>{DESERTS.join(' · ')}</text>
              <text className="clab-mute" x={padL} y={padT + rowsN * (cell + gap) + 48}>
                Mostly Central Valley and rural Northern California. Stable across fifteen years of data.
              </text>
            </>
          )}
          <text className="annot-key" x={padL} y={padT - 12}>filled: desert counties</text>
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   Cost against expected impact, all seven recommendations
   ============================================================ */
const RECS = [
  { n: 1, l: 'Medicare parity payment', cost: 120, pqi: 15, ed: 22500 },
  { n: 2, l: 'Loan repayment tripling', cost: 56, pqi: 6, ed: 9000 },
  { n: 3, l: 'NP and PA independence', cost: 5, pqi: 4.5, ed: 6750 },
  { n: 4, l: 'Rural residency pipeline', cost: 15, pqi: 3.5, ed: 5250 },
  { n: 5, l: 'Telehealth investment', cost: 30, pqi: 3, ed: 4500 },
  { n: 6, l: 'Hospital sustainability fund', cost: 40, pqi: 2, ed: 3000 },
  { n: 7, l: 'Transportation expansion', cost: 20, pqi: 4.5, ed: 6750 },
]
export function CostImpact({ num = 'Figure 8. What each recommendation costs against what it is projected to buy' }) {
  const nw = useNarrow()
  /* seven legend entries only fit stacked one per line on a phone */
  const W = nw ? 380 : 720, H = nw ? 520 : 440
  const padL = nw ? 40 : 74, padR = nw ? 18 : 44
  const padT = nw ? 74 : 58, padB = nw ? 190 : 106
  const x = (v) => padL + (v / 135) * (W - padL - padR)
  const y = (v) => H - padB - (v / 18) * (H - padT - padB)
  const rad = (v) => (nw ? 9 : 11) + Math.sqrt(v / 22500) * (nw ? 9 : 11)
  const ref = useScene(0.6, nw)
  const legend = nw ? [RECS] : [RECS.slice(0, 4), RECS.slice(4)]
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Scope expansion and transportation deliver mid-sized reductions at low cost, while Medicare parity delivers the largest reduction at the highest cost">
        {[0, 5, 10, 15].map((t) => (
          <g key={t}><line className="grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} /><text className="axt" x={padL - 8} y={y(t) + 3} textAnchor="end">{t ? `\u2212${t}` : 0}</text></g>
        ))}
        {(nw ? [0, 60, 120] : [0, 40, 80, 120]).map((t) => (
          <text className="axt" key={t} x={x(t)} y={H - padB + 18} textAnchor="middle">${t}M</text>
        ))}
        <line className="axis" x1={padL} x2={padL} y1={padT - 14} y2={H - padB} />
        <line className="axis" x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} />
        <g className="cr-area">
          {RECS.map((r, i) => <circle key={r.n} cx={x(r.cost)} cy={y(r.pqi)} r={rad(r.ed)} className="bar-lite pop" style={{ '--o': Math.min(0.55, (i * 85) / 1500) }} />)}
        </g>
        <g className="cr-fade">
          {RECS.map((r) => <text key={r.n} className="vlab" x={x(r.cost)} y={y(r.pqi) + 4} textAnchor="middle">{r.n}</text>)}
          {nw ? (
            <>
              <text className="annot-key" x={padL - 26} y={padT - 40}>bubble size: emergency visits</text>
              <text className="annot-key" x={padL - 26} y={padT - 26}>averted per year</text>
            </>
          ) : (
            <text className="annot-key" x={padL} y={padT - 26}>bubble size: emergency visits averted per year</text>
          )}
          <text className="region-sub" x={nw ? x(2) : x(3)} y={nw ? y(8.4) : y(7.2)}>{nw ? 'cheap, still moves it' : 'cheap, and still moves the needle'}</text>
          {legend.map((group, gi) => (
            <g key={gi}>
              {group.map((r, i) => (
                <text key={r.n} className="clab-mute" x={nw ? padL - 26 : padL + i * 152} y={nw ? H - padB + 50 + i * 18 : H - padB + 48 + gi * 20}>
                  {r.n}  {r.l}
                </text>
              ))}
            </g>
          ))}
        </g>
        <text className="axt" x={(padL + W - padR) / 2} y={H - padB + 34} textAnchor="middle">estimated annual cost</text>
        <text className="axt" transform={`translate(${nw ? 14 : 22}, ${(padT + H - padB) / 2}) rotate(-90)`} textAnchor="middle">{nw ? 'PQI reduction' : 'projected PQI reduction (midpoint)'}</text>
      </svg>
    </figure>
  )
}

/* ============================================================
   Quality measures, side by side
   ============================================================ */
const QUAL = [
  { l: 'Diabetes under control', d: 44.3, n: 50.0 },
  { l: 'Childhood immunizations', d: 62.1, n: 65.8 },
  { l: 'Prenatal care', d: 71.5, n: 76.2 },
  { l: 'Breast cancer screening', d: 48.2, n: 52.4 },
]
export function QualityGap({ num = 'Figure 6. Medi-Cal quality measures, desert counties against the rest of the state' }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 400 : 300
  const padL = nw ? 14 : 184, padR = nw ? 14 : 54, padT = nw ? 74 : 52, padB = nw ? 46 : 50
  const x = (v) => padL + ((v - 38) / 46) * (W - padL - padR)
  const rowH = (H - padT - padB) / QUAL.length
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Desert counties score lower on all four quality measures, with the diabetes control gap the largest">
        {(nw ? [40, 60, 80] : [40, 50, 60, 70, 80]).map((t) => (
          <g key={t}><line className="grid" x1={x(t)} x2={x(t)} y1={padT - 16} y2={H - padB} /><text className="axt" x={x(t)} y={H - padB + 18} textAnchor="middle">{t}%</text></g>
        ))}
        <g className="cr-area">
          {QUAL.map((q, i) => {
            const yMid = padT + rowH * (i + 0.5) + (nw ? 10 : -8)
            return (
              <g key={q.l}>
                <line className="conn" x1={x(q.d)} x2={x(q.n)} y1={yMid} y2={yMid} />
                <circle className="dot pop" cx={x(q.d)} cy={yMid} r="5.5" style={{ '--o': Math.min(0.55, (i * 110) / 1500) }} />
                <circle className="dot-open pop" cx={x(q.n)} cy={yMid} r="5.5" style={{ '--o': Math.min(0.55, (90 + i * 110) / 1500) }} />
              </g>
            )
          })}
        </g>
        <g className="cr-fade">
          {QUAL.map((q, i) => {
            const yMid = padT + rowH * (i + 0.5) + (nw ? 10 : -8)
            const delta = `\u2212${(q.n - q.d).toFixed(1)} pts`
            return (
              <g key={q.l}>
                {nw ? (
                  <>
                    <text className={i === 0 ? 'clab' : 'clab-mute'} x={padL} y={yMid - 14}>{q.l}</text>
                    <text className="vlab" x={W - padR} y={yMid - 14} textAnchor="end">{delta}</text>
                  </>
                ) : (
                  <>
                    <text className={i === 0 ? 'clab' : 'clab-mute'} x={padL - 18} y={yMid + 4} textAnchor="end">{q.l}</text>
                    <text className="vlab" x={x(q.n) + 12} y={yMid + 4}>{delta}</text>
                  </>
                )}
              </g>
            )
          })}
          <g transform={`translate(${padL}, ${nw ? padT - 40 : padT - 28})`}>
            <circle className="dot" cx="5" cy="-4" r="5" /><text className="axt" x="16" y="0">Desert</text>
            <circle className="dot-open" cx={nw ? 78 : 95} cy="-4" r="5" /><text className="axt" x={nw ? 89 : 106} y="0">Everywhere else</text>
          </g>
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   Mortality ratio, and what COVID did to it
   ============================================================ */
const MORT = [
  { y: 2019, r: 1.21 },
  { y: 2020, r: 1.31 },
  { y: 2021, r: 1.34 },
  { y: 2022, r: 1.27 },
  { y: 2023, r: 1.23 },
]
export function MortalityRatio({ num = 'Figure 7. Deaths per desert county, relative to the rest of the state' }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 340 : 300
  const padL = nw ? 42 : 78, padR = nw ? 14 : 54, padT = nw ? 74 : 56, padB = nw ? 48 : 52
  const barW = nw ? 38 : 58
  const lo = 1.0, hi = 1.42
  const x = (i) => padL + (nw ? 28 : 44) + i * ((W - padL - padR - (nw ? 42 : 60)) / MORT.length)
  const y = (v) => H - padB - ((v - lo) / (hi - lo)) * (H - padT - padB)
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The per-county death ratio runs 1.21 in 2019, peaks at 1.34 in 2021, and settles at 1.23 by 2023">
        {[1.1, 1.2, 1.3, 1.4].map((t) => (
          <g key={t}><line className="grid" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} /><text className="axt" x={padL - 8} y={y(t) + 3} textAnchor="end">{t.toFixed(1)}×</text></g>
        ))}
        <g className="cr-area">
          {MORT.map((m, i) => (
            <rect key={m.y} x={x(i) - barW / 2} y={y(m.r)} width={barW} height={H - padB - y(m.r)} className={`${m.y === 2021 ? 'bar' : 'bar-lite'} gbar-v`} style={{ '--o': Math.min(0.55, (i * 110) / 1500) }} />
          ))}
        </g>
        <line className="axis" x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} />
        <g className="cr-fade">
          {MORT.map((m, i) => (
            <g key={m.y}>
              <text className="vlab" x={x(i)} y={y(m.r) - 10} textAnchor="middle">{m.r.toFixed(2)}&times;</text>
              <text className="axt" x={x(i)} y={H - padB + 18} textAnchor="middle">{m.y}</text>
            </g>
          ))}
          {nw ? (
            <>
              <text className="annot-key" x={padL - 28} y={padT - 38}>parity with the rest of the</text>
              <text className="annot-key" x={padL - 28} y={padT - 24}>state would be 1.00&times;</text>
            </>
          ) : (
            <text className="annot-key" x={padL} y={padT - 22}>parity with the rest of the state would be 1.00&times;</text>
          )}
          <text className="region-sub" x={x(2)} y={padT - 2} textAnchor="middle">COVID peak</text>
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   Telehealth: real growth, still the smallest user
   ============================================================ */
export function Telehealth({ num = 'Figure 10. Telehealth procedures, Medi-Cal against the other payers' }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 420 : 320
  const padL = nw ? 14 : 190, padR = nw ? 14 : 76, padT = nw ? 62 : 56, padB = nw ? 46 : 46
  const rows = [
    { l: 'Medi-Cal, 2018', v: 215102, mute: true },
    { l: 'Medi-Cal, 2020 peak', v: 2279027 },
    { l: 'Medi-Cal, 2023', v: 1869366 },
    { l: 'Medicare, 2023', v: 4513570, mute: true },
    { l: 'Commercial, 2023', v: 5371857, mute: true },
  ]
  const max = 5800000
  const x = (v) => padL + (v / max) * (W - padL - padR)
  const rowH = (H - padT - padB) / rows.length
  const fmt = (v) => (v >= 1000000 ? (v / 1000000).toFixed(2) + 'M' : (v / 1000).toFixed(0) + 'k')
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Medi-Cal telehealth grew nearly tenfold and still runs about a third of commercial and Medicare volume">
        {[0, 2000000, 4000000].map((t) => (
          <g key={t}><line className="grid" x1={x(t)} x2={x(t)} y1={padT - 18} y2={H - padB} /><text className="axt" x={x(t)} y={H - padB + 18} textAnchor="middle">{t ? fmt(t) : 0}</text></g>
        ))}
        <line className="axis" x1={padL} x2={padL} y1={padT - 18} y2={H - padB} />
        <g className="cr-area">
          {rows.map((r, i) => (
            <rect key={r.l} x={padL} y={padT + i * rowH + (nw ? 26 : 7)} width={x(r.v) - padL} height={nw ? 22 : rowH - 22} className={`${r.mute ? 'bar-lite' : 'bar'} gbar`} style={{ '--o': Math.min(0.55, (i * 100) / 1500) }} />
          ))}
        </g>
        <g className="cr-fade">
          {rows.map((r, i) => {
            const yMid = padT + i * rowH + (rowH - 22) / 2 + 7
            return (
              <g key={r.l}>
                {nw ? (
                  <>
                    <text className={r.mute ? 'clab-mute' : 'clab'} x={padL} y={padT + i * rowH + 16}>{r.l}</text>
                    <text className="vlab" x={W - padR} y={padT + i * rowH + 16} textAnchor="end">{fmt(r.v)}</text>
                  </>
                ) : (
                  <>
                    <text className={r.mute ? 'clab-mute' : 'clab'} x={padL - 16} y={yMid + 4} textAnchor="end">{r.l}</text>
                    <text className="vlab" x={x(r.v) + 10} y={yMid + 4}>{fmt(r.v)}</text>
                  </>
                )}
              </g>
            )
          })}
          <text className="annot-key" x={padL} y={padT - 30}>procedures per year</text>
        </g>
      </svg>
    </figure>
  )
}
