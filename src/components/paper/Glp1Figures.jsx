import React from 'react'
import { useScene, useNarrow } from '../chartkit'

/* Every number below is copied from the paper (SSRN 7701298): Figure 1, Table 2, Section 4.2, Section 4.7. */

export function LinkageFlow({ num }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 470 : 330
  const ref = useScene(0.5, nw)
  const box = (x, y, w, h, n, t, s, k) => (
    <g key={t}>
      <rect x={x} y={y} width={w} height={h} rx="3" className={k === 'lite' ? 'bar-out lf-lite' : 'bar-out'} />
      <text className="g1-n" x={x + 14} y={y + 27}>{n}</text>
      <text className="clab" x={x + 14} y={y + 47}>{t}</text>
      {s ? <text className="clab-mute" x={x + 14} y={y + 64}>{s}</text> : null}
    </g>
  )
  const link = (d, i) => <path key={i} d={d} className="curve draw" />
  if (nw) {
    return (
      <figure className="figure pp-fig" ref={ref}>
        <div className="fig-num">{num}</div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="212,886 members linked to outside records; 193,932 with a dispensed GLP-1, split into a branded cohort of 6,451 and a compounded cohort of 187,481; 18,954 untreated">
          {box(20, 10, 340, 72, '212,886', 'members linked to outside records', 'Carequality and CommonWell, mid to late 2026')}
          {link('M 190 82 V 112', 0)}
          {box(20, 112, 340, 72, '193,932', 'with a dispensed GLP-1', '23.7 million outside readings in all')}
          {link('M 100 184 V 222', 1)}{link('M 280 184 V 222', 2)}
          <g className="cr-fade">
            {box(20, 222, 160, 86, '6,451', 'branded cohort', 'first fill branded')}
            {box(200, 222, 160, 86, '187,481', 'compounded cohort', 'first fill compounded')}
            {box(20, 340, 340, 72, '18,954', 'no GLP-1 yet', 'with members who start later: the controls', 'lite')}
            <text className="clab-mute" x="20" y="446">Each cohort is analyzed on its own. They are not compared.</text>
          </g>
        </svg>
      </figure>
    )
  }
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="212,886 members linked to outside records; 193,932 with a dispensed GLP-1, split into a branded cohort of 6,451 and a compounded cohort of 187,481; 18,954 untreated">
        {box(20, 14, 300, 72, '212,886', 'members linked to outside records', 'Carequality and CommonWell, mid to late 2026')}
        {link('M 170 86 V 122', 0)}
        {box(20, 122, 300, 72, '193,932', 'with a dispensed GLP-1', '23.7 million outside readings in all')}
        {link('M 320 50 C 380 50, 380 50, 420 50', 1)}
        {link('M 120 194 V 236', 2)}{link('M 220 194 C 220 220, 380 214, 380 236', 3)}
        <g className="cr-fade">
          {box(420, 14, 280, 72, '18,954', 'no GLP-1 yet', 'with members who start later: the controls', 'lite')}
          {box(20, 236, 200, 76, '6,451', 'branded cohort', 'first fill branded')}
          {box(280, 236, 200, 76, '187,481', 'compounded cohort', 'first fill compounded')}
          <text className="clab-mute" x="500" y="262">Each cohort is analyzed</text>
          <text className="clab-mute" x="500" y="279">on its own. They are</text>
          <text className="clab-mute" x="500" y="296">not compared.</text>
        </g>
      </svg>
    </figure>
  )
}

/* Section 4.2: members out of range at baseline, systolic pressure, 60 to 365 days */
export function RegressionBars({ num }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 300 : 250
  const padL = nw ? 20 : 250, padR = nw ? 60 : 90, top = nw ? 20 : 26
  const max = 15
  const x = (v) => padL + (v / max) * (W - padL - padR)
  const rows = [
    { v: 13.9, l: 'Started a GLP-1', s: 'the figure programs usually quote', k: 'bar-out' },
    { v: 10.1, l: 'Had not started, chosen the same way', s: 'the fall that happens anyway', k: 'bar-lite' },
    { v: 3.7, l: 'The difference', s: 'the effect of treatment', k: 'bar' },
  ]
  const ref = useScene(0.55, nw)
  const step = nw ? 92 : 70
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Systolic pressure fell 13.9 mmHg in treated members with high readings and 10.1 mmHg in untreated members chosen the same way; the difference is 3.7 mmHg">
        {rows.map((r, i) => {
          const y = top + i * step + (nw ? 34 : 0)
          return (
            <g key={r.l} className="g1-row" style={{ '--i': i }}>
              <text className="clab" x={nw ? padL : padL - 16} y={nw ? y - 22 : y + 15} textAnchor={nw ? 'start' : 'end'}>{r.l}</text>
              <text className="clab-mute" x={nw ? padL : padL - 16} y={nw ? y - 7 : y + 32} textAnchor={nw ? 'start' : 'end'}>{r.s}</text>
              <rect className={`${r.k} g1-grow`} x={padL} y={y} width={x(r.v) - padL} height="24" style={{ transformOrigin: `${padL}px 0` }} />
              <text className="vlab" x={x(r.v) + 8} y={y + 16}>{r.v.toFixed(1)} mmHg</text>
            </g>
          )
        })}
        {!nw ? <line className="axis" x1={padL} y1={top - 8} x2={padL} y2={top + 2 * step + 34} /> : null}
        <text className="axt" x={padL} y={H - 8}>fall in systolic blood pressure, members with a high reading at baseline</text>
      </svg>
    </figure>
  )
}

/* Figures 2 and 3: effect at 6-12 months in person-to-person standard deviations, signed so that right = lower than expected.
   Target SEs from Table 2, divided by the same SDs. Placebo effects have no SE in the text, so they are shown as dots only. */
const SD = { sbp: 11.0, a1c: 0.63, ldl: 29.6, tg: 68.4, wt: 49.0, na: 1.83, k: 0.32, hb: 1.44, plt: 65.6, tsh: 1.58 }
const TARGET = [
  { k: 'sbp', l: 'Systolic BP', u: '4.9 mmHg', b: [5.12, 0.33], c: [4.91, 0.06] },
  { k: 'a1c', l: 'HbA1c', u: '0.21 points', b: [0.19, 0.03], c: [0.21, 0.01] },
  { k: 'ldl', l: 'LDL cholesterol', u: '5 mg/dL', b: [6.19, 1.59], c: [5.02, 0.29] },
  { k: 'tg', l: 'Triglycerides', u: '19 mg/dL', b: [22.8, 3.3], c: [19.2, 0.6] },
  { k: 'wt', l: 'Weight', u: '22 lb', b: [22.7, 0.8], c: [22.2, 0.1] },
]
const PLACEBO = [
  { k: 'na', l: 'Sodium', b: -0.15, c: -0.05 },
  { k: 'k', l: 'Potassium', b: -0.02, c: 0.01 },
  { k: 'hb', l: 'Hemoglobin', b: -0.02, c: -0.15 },
  { k: 'plt', l: 'Platelets', b: -0.96, c: -3.19 },
  { k: 'tsh', l: 'TSH', b: 0.13, c: 0.2 },
]
export function EffectsDots({ num }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720
  const padL = nw ? 112 : 190, padR = nw ? 14 : 40, top = 40, row = nw ? 30 : 30, gap = 46
  const H = top + row * 10 + gap + 50
  const lo = -0.2, hi = 0.6
  const x = (v) => padL + ((v - lo) / (hi - lo)) * (W - padL - padR)
  const yT = (i) => top + i * row + 10
  const yP = (i) => top + 5 * row + gap + i * row + 10
  const ref = useScene(0.6, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Target measures fall by 0.2 to 0.5 standard deviations in both cohorts; placebo measures stay near zero">
        {[0, 0.2, 0.4, 0.6].map((t) => (
          <g key={t}>
            <line className={t === 0 ? 'zero' : 'dropline'} x1={x(t)} x2={x(t)} y1={top - 6} y2={yP(4) + 14} />
            <text className="axt" x={x(t)} y={top - 14} textAnchor="middle">{t === 0 ? '0' : t.toFixed(1)}</text>
          </g>
        ))}
        <text className="annot-key" x={nw ? 8 : padL - 14} y={top - 14} textAnchor={nw ? 'start' : 'end'}>Target measures</text>
        {TARGET.map((r, i) => {
          const y = yT(i), b = r.b[0] / SD[r.k], c = r.c[0] / SD[r.k]
          const be = 1.96 * r.b[1] / SD[r.k], ce = 1.96 * r.c[1] / SD[r.k]
          return (
            <g key={r.k} className="g1-row" style={{ '--i': i }}>
              <text className="clab" x={padL - 14} y={y + 4} textAnchor="end">{r.l}</text>
              {!nw ? <text className="clab-mute" x={padL - 14} y={y + 18} textAnchor="end">{r.u} lower</text> : null}
              <line className="ci" x1={x(b - be)} x2={x(b + be)} y1={y - 5} y2={y - 5} />
              <circle cx={x(b)} cy={y - 5} r="4.2" className="g1-hollow" />
              <line className="ci" x1={x(c - ce)} x2={x(c + ce)} y1={y + 5} y2={y + 5} />
              <circle cx={x(c)} cy={y + 5} r="4.2" className="mark" />
            </g>
          )
        })}
        <text className="annot-key" x={nw ? 8 : padL - 14} y={yP(0) - 26} textAnchor={nw ? 'start' : 'end'}>Placebo measures</text>
        {PLACEBO.map((r, i) => {
          const y = yP(i)
          return (
            <g key={r.k} className="g1-row" style={{ '--i': i + 5 }}>
              <text className="clab" x={padL - 14} y={y + 4} textAnchor="end">{r.l}</text>
              <circle cx={x(r.b / SD[r.k])} cy={y - 5} r="4.2" className="g1-hollow" />
              <circle cx={x(r.c / SD[r.k])} cy={y + 5} r="4.2" className="mark" />
            </g>
          )
        })}
        <g className="cr-fade">
          <circle cx={padL + 4} cy={H - 22} r="4.2" className="g1-hollow" />
          <text className="clab-mute" x={padL + 14} y={H - 18}>branded cohort</text>
          <circle cx={padL + (nw ? 120 : 130)} cy={H - 22} r="4.2" className="mark" />
          <text className="clab-mute" x={padL + (nw ? 130 : 140)} y={H - 18}>compounded cohort</text>
        </g>
        <text className="axt" x={x(0.2)} y={H - 2} textAnchor="middle">{nw ? 'lower than expected, in SDs' : 'lower than expected at 6 to 12 months, in person-to-person standard deviations'}</text>
      </svg>
    </figure>
  )
}

/* Section 4.7: the share of the systolic effect that runs through weight, by which slope you believe */
export function WeightShare({ num }) {
  const nw = useNarrow()
  const W = nw ? 380 : 720, H = nw ? 210 : 210
  const padL = nw ? 24 : 40, padR = nw ? 34 : 70, axY = nw ? 110 : 120
  const x = (v) => padL + (v / 110) * (W - padL - padR)
  const pts = [
    { v: 37, l: 'this data', s: 'ordinary weight swings', up: true },
    { v: 68, l: 'SURMOUNT-1', s: 'trial mediation analysis', up: false },
    { v: 104, l: 'more than all', s: 'slope from weight-loss trials', up: true },
  ]
  const ref = useScene(0.55, nw)
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The share of the systolic effect that runs through weight could be anywhere from about a third to all of it">
        <rect className="pos-area g1-band" x={x(33)} y={axY - 26} width={x(104) - x(33)} height="52" />
        <line className="axis" x1={padL} y1={axY} x2={W - padR} y2={axY} />
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line className="tick" x1={x(t)} x2={x(t)} y1={axY} y2={axY + 6} />
            <text className="axt" x={x(t)} y={axY + 22} textAnchor="middle">{t}%</text>
          </g>
        ))}
        {pts.map((p, i) => {
          const ty = p.up ? axY - 46 : axY + 48
          return (
            <g key={p.l} className="g1-row" style={{ '--i': i }}>
              <line className="dropline" x1={x(p.v)} x2={x(p.v)} y1={axY} y2={p.up ? ty + 8 : ty - 26} />
              <circle className="mark" cx={x(p.v)} cy={axY} r="5" />
              <text className="clab" x={x(p.v) + (nw && i === 2 ? 6 : 0)} y={p.up ? ty - 14 : ty} textAnchor={nw && i === 2 ? 'end' : 'middle'}>{p.l}</text>
              <text className="clab-mute" x={x(p.v) + (nw && i === 2 ? 6 : 0)} y={p.up ? ty + 2 : ty + 16} textAnchor={nw && i === 2 ? 'end' : 'middle'}>{p.s}</text>
            </g>
          )
        })}
        <text className="axt" x={padL} y={H - 6}>share of the systolic effect that runs through weight loss</text>
      </svg>
    </figure>
  )
}
