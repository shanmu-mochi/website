import React from 'react'
import { useScene, smooth, Hatch, Arrow, ArrowDefs } from '../chartkit'

/* Same illustrative parametrization the paper uses for its figures:
   w(c) = 0.5 + 2c^2, r = 1, k = 0.2, f = Beta(2,4). */
const w = (c) => 0.5 + 2 * c * c
const f = (c) => 20 * c * Math.pow(1 - c, 3)
const K = 0.2, R = 1, SURPLUS = 0.6, LEAK = 0.4

function integrate(g, a, b, n = 400) {
  if (b <= a) return 0
  const h = (b - a) / n
  let s = 0
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h, x1 = x0 + h, xm = (x0 + x1) / 2
    s += (h / 6) * (g(x0) + 4 * g(xm) + g(x1))
  }
  return s
}
const residual = (t) => integrate((c) => (R - w(c)) * f(c), t, 1)

/* ============================================================
   Figure 3: welfare tracks the planner, then leaks past theta-bar
   ============================================================ */
export function AITrapFig3({ num = 'Figure 3. Nothing is lost until the leftover pool goes under' }) {
  const W = 720, H = 360, padL = 66, padR = 30, padT = 34, padB = 58
  const tMax = 0.5, tBar = 0.32
  const gross = integrate((c) => (w(c) + SURPLUS) * f(c), 0, 1)
  const eff = (t) => gross - integrate((c) => K * f(c), 0, t) - integrate((c) => w(c) * f(c), t, 1)
  const leak = (t) => {
    const deficit = Math.max(-residual(t), 0)
    const abandoned = integrate((c) => SURPLUS * f(c), t, 1)
    return Math.min(abandoned, LEAK * deficit)
  }
  const pts = Array.from({ length: 60 }, (_, i) => (i / 59) * tMax)
  const effVals = pts.map(eff)
  const mktVals = pts.map((t) => eff(t) - leak(t))
  const lo = Math.min(...mktVals) - 0.02, hi = Math.max(...effVals) + 0.02
  const x = (t) => padL + (t / tMax) * (W - padL - padR)
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB)
  const effPts = pts.map((t, i) => [x(t), y(effVals[i])])
  const mktPts = pts.map((t, i) => [x(t), y(mktVals[i])])
  const past = pts.map((t, i) => (t >= tBar ? [x(t), y(mktVals[i])] : null)).filter(Boolean)
  const pastEff = pts.map((t, i) => (t >= tBar ? [x(t), y(effVals[i])] : null)).filter(Boolean)
  const wedge = `${smooth(pastEff)} ${smooth([...past].reverse()).replace(/^M/, 'L')} Z`
  const ref = useScene()
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Market welfare tracks the planner until theta-bar, then leaks away">
        <Hatch id="h3" />
        <g className="cr-area"><path d={wedge} fill="url(#h3)" /></g>
        <line className="axis" x1={padL} y1={padT - 8} x2={padL} y2={H - padB} />
        <line className="axis" x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} />
        <path d={smooth(effPts)} className="curve dashed fade-line" />
        <path d={smooth(mktPts)} className="curve draw" />
        <g className="cr-fade">
          <line className="dropline" x1={x(tBar)} y1={padT} x2={x(tBar)} y2={H - padB} />
          <circle className="mark" cx={x(tBar)} cy={y(eff(tBar))} r="4.5" />
          <text className="annot-key" x={x(tBar)} y={padT - 12} textAnchor="middle">θ̄ ≈ 0.32</text>
          <text className="region-label" x={x(0.03)} y={y(eff(0.16)) - 26}>IDENTICAL</text>
          <text className="region-sub" x={x(0.03)} y={y(eff(0.16)) - 12}>skimming only moves money around</text>
          <text className="region-label" x={x(0.355)} y={y(eff(0.47)) + 4}>THE LEAK</text>
          <text className="region-sub" x={x(0.355)} y={y(eff(0.47)) + 18}>complex care loses its provider</text>
          <g transform={`translate(${padL + 8}, ${H - padB - 14})`}>
            <line className="curve" x1="0" y1="0" x2="20" y2="0" /><text className="axt" x="26" y="3">Market</text>
            <line className="curve dashed" x1="96" y1="0" x2="116" y2="0" /><text className="axt" x="122" y="3">Planner</text>
          </g>
        </g>
        <text className="axt" x={(padL + W - padR) / 2} y={H - 14} textAnchor="middle">share of cases automated   θ</text>
        <text className="axt" transform={`translate(20, ${(padT + H - padB) / 2}) rotate(-90)`} textAnchor="middle">social welfare</text>
      </svg>
    </figure>
  )
}

/* ============================================================
   Figure 4: capability runs, capacity walks
   ============================================================ */
export function AITrapFig4({ num = 'Figure 4. Capability runs, capacity walks' }) {
  const W = 720, H = 430, padL = 66, padR = 26
  const t1 = { top: 26, bot: 146 }, t2 = { top: 186, bot: 372 }
  const tb = 8, gamma = 0.12, hStar = 0.55, floor = 0.40, tMax = 30
  const ts = Array.from({ length: 121 }, (_, i) => (i / 120) * tMax)
  const x = (t) => padL + (t / tMax) * (W - padL - padR)
  const yA = (v) => t1.bot - v * (t1.bot - t1.top)
  const yB = (v) => t2.bot - v * (t2.bot - t2.top) * 0.95
  const theta = (t) => 0.85 / (1 + Math.exp(-0.45 * (t - 9)))
  const hMkt = (t) => (t < tb ? 1 : Math.exp(-gamma * (t - tb)))
  const hPlan = (t) => (t < tb ? 1 : hStar + (1 - hStar) * Math.exp(-gamma * (t - tb)))
  const cross = ts.find((t) => hMkt(t) <= floor) || tMax
  const shortfall = ts.filter((t) => t >= cross)
  const gapArea = `${shortfall.map((t, i) => `${i ? 'L' : 'M'} ${x(t).toFixed(1)} ${yB(floor).toFixed(1)}`).join(' ')} ${[...shortfall].reverse().map((t) => `L ${x(t).toFixed(1)} ${yB(hMkt(t)).toFixed(1)}`).join(' ')} Z`
  const ref = useScene()
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="AI capability rises and plateaus while clinician capacity decays below the permanent oversight floor">
        <Hatch id="h4" />
        <line className="axis" x1={padL} y1={t1.top - 6} x2={padL} y2={t1.bot} />
        <line className="axis" x1={padL} y1={t1.bot} x2={W - padR} y2={t1.bot} />
        <path d={smooth(ts.map((t) => [x(t), yA(theta(t))]))} className="curve draw" />
        <g className="cr-fade">
          <text className="region-label" x={x(17)} y={yA(0.72)}>WHAT AI CAN DO</text>
          <text className="region-sub" x={x(17)} y={yA(0.72) + 14}>rises fast, then plateaus</text>
        </g>
        <text className="axt" transform={`translate(20, ${(t1.top + t1.bot) / 2}) rotate(-90)`} textAnchor="middle">capability θt</text>

        <g className="cr-area"><path d={gapArea} fill="url(#h4)" /></g>
        <line className="axis" x1={padL} y1={t2.top - 6} x2={padL} y2={t2.bot} />
        <line className="axis" x1={padL} y1={t2.bot} x2={W - padR} y2={t2.bot} />
        <line className="dropline" x1={padL} y1={yB(floor)} x2={W - padR} y2={yB(floor)} />
        <path d={smooth(ts.map((t) => [x(t), yB(hPlan(t))]))} className="curve dashed fade-line" />
        <path d={smooth(ts.map((t) => [x(t), yB(hMkt(t))]))} className="curve draw" />
        <g className="cr-fade">
          <text className="annot-key" x={padL + 6} y={yB(floor) - 8}>the floor: doctors always needed</text>
          <circle className="mark" cx={x(cross)} cy={yB(floor)} r="4.5" />
          <text className="region-label" x={x(19.5)} y={yB(0.22)}>THE SHORTFALL</text>
          <text className="region-sub" x={x(19.5)} y={yB(0.22) + 14}>cannot be rebuilt inside the training lag</text>
          <text className="annot" x={x(12)} y={yB(0.86)}>if we keep training</text>
          <text className="annot" x={x(10.6)} y={yB(0.58)}>market path</text>
        </g>
        <text className="axt" x={(padL + W - padR) / 2} y={H - 12} textAnchor="middle">time   →</text>
        <text className="axt" transform={`translate(20, ${(t2.top + t2.bot) / 2}) rotate(-90)`} textAnchor="middle">senior clinician capacity</text>
      </svg>
    </figure>
  )
}

/* ============================================================
   Schematic: where the money actually goes inside one panel
   ============================================================ */
export function CrossSubsidyDiagram({ num = 'Figure 1. One panel, two kinds of encounter, one transfer between them' }) {
  const W = 720, H = 356, padL = 40, padR = 40, barH = 46
  const innerW = W - padL - padR
  const cream = innerW * 0.46
  const yA = 76, yB = 276
  const ax = padL + cream * 0.42, bx = padL + cream + (innerW - cream) * 0.45
  const ref = useScene()
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Profit on routine encounters is transferred to cover the loss on complex encounters">
        <Hatch id="hx1" />
        <ArrowDefs />
        <text className="axt" x={padL} y={34}>WHAT A CLINICIAN&rsquo;S PANEL LOOKS LIKE, PAID A FLAT RATE PER VISIT</text>
        <g className="cr-area">
          <rect x={padL} y={yA} width={cream} height={barH} className="bar-lite gbar" />
          <rect x={padL + cream} y={yA} width={innerW - cream} height={barH} fill="url(#hx1)" className="gbar" style={{ transitionDelay: '180ms' }} />
          <rect x={padL} y={yA} width={innerW} height={barH} className="bar-out" />
        </g>
        <g className="cr-fade">
          <text className="clab" x={padL + 14} y={yA + 28}>Routine encounters</text>
          <text className="clab" x={padL + cream + 14} y={yA + 28}>Complex encounters</text>
          <text className="vlab" x={padL + 14} y={yA + barH + 22}>pay more than they cost</text>
          <text className="vlab" x={padL + cream + 14} y={yA + barH + 22}>cost more than they pay</text>
        </g>
        <g className="cr-area">
          <Arrow d={`M ${ax.toFixed(1)} ${yA + barH + 42} Q ${((ax + bx) / 2).toFixed(1)} ${yA + barH + 96} ${bx.toFixed(1)} ${yA + barH + 42}`} />
        </g>
        <g className="cr-fade">
          <text className="annot-key" x={(ax + bx) / 2} y={yA + barH + 118} textAnchor="middle">the cross-subsidy</text>
          <text className="region-sub" x={(ax + bx) / 2} y={yA + barH + 134} textAnchor="middle">profit on the easy cases funds the hard ones</text>
        </g>
        <g className="cr-fade">
          <rect x={padL} y={yB} width={innerW} height={barH} className="bar-out" />
          <text className="clab" x={padL + 14} y={yB + 29}>Panel breaks even overall, and complex care has a provider</text>
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   Schematic: the same work, split two different ways
   ============================================================ */
export function AllocationSplit({ num = 'Figure 3. The efficient split and the competitive split are the same allocation with different owners' }) {
  const W = 720, H = 350
  const padL = 150, padR = 54, barH = 44
  const innerW = W - padL - padR
  const theta = 0.38
  const rows = [
    { y: 80, k: 'One integrated provider', s: 'the first best', a: 'AI runs the routine band', b: 'Clinicians hold the tail', note: 'Savings stay in the pool. The tail is still funded, and the provider is more profitable than before.', ok: true },
    { y: 216, k: 'A competitive market', s: 'what happens', a: 'Entrants take the routine band', b: 'Incumbent keeps only the tail', note: 'The profit leaves the pool entirely. Nothing is left to fund the tail.', ok: false },
  ]
  const ref = useScene()
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="An integrated provider keeps the automation savings in the pool while a competitive market moves them out of it">
        <Hatch id="hx2" />
        <ArrowDefs />
        <text className="axt" x={padL} y={40}>THE SAME BAND OF WORK, AUTOMATED EITHER WAY</text>
        {rows.map((r) => {
          const startX = padL + innerW * theta * 0.5
          const lineY = r.y + barH + 20
          const endX = r.ok ? padL + innerW * 0.72 : W - padR + 18
          return (
            <g key={r.k}>
              <g className="cr-area">
                <rect x={padL} y={r.y} width={innerW * theta} height={barH} className="bar-lite gbar" />
                <rect x={padL + innerW * theta} y={r.y} width={innerW * (1 - theta)} height={barH} fill="url(#hx2)" className="gbar" style={{ transitionDelay: '180ms' }} />
                <rect x={padL} y={r.y} width={innerW} height={barH} className="bar-out" />
                <Arrow
                  d={`M ${startX} ${r.y + barH + 7} L ${startX} ${lineY} L ${endX} ${lineY}${r.ok ? ` L ${endX} ${r.y + barH + 11}` : ''}`}
                  delay={r.ok ? 0 : 200}
                />
              </g>
              <g className="cr-fade">
                <text className="clab" x={padL - 16} y={r.y + 20} textAnchor="end">{r.k}</text>
                <text className="clab-mute" x={padL - 16} y={r.y + 36} textAnchor="end">{r.s}</text>
                <text className="vlab" x={padL + 12} y={r.y + 28}>{r.a}</text>
                <text className="vlab" x={padL + innerW * theta + 12} y={r.y + 28}>{r.b}</text>
                <text className="annot" x={startX + 8} y={lineY + 26}>{r.note}</text>
                {r.ok ? null : <text className="annot-key" x={endX - 16} y={lineY - 10} textAnchor="end">profit exits</text>}
              </g>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

/* ============================================================
   The loop that ends up biting the automators
   ============================================================ */
const LOOP = [
  'Entrants automate the routine cases',
  'Those cases leave teaching settings',
  'Fewer senior clinicians get produced',
  'Oversight and referral capacity thins',
]
export function CommonsLoop({ num = 'Figure 6. The externality turns back on the firms that caused it' }) {
  const W = 720, H = 400, cx = 336, cy = 206, r = 104
  const pos = LOOP.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / LOOP.length
    return [cx + r * Math.cos(a), cy + r * Math.sin(a), a]
  })
  const ref = useScene()
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Automating routine cases removes training throughput, which reduces senior capacity, which degrades the oversight the automators depend on">
        <ArrowDefs />
        <text className="axt" x={40} y={34}>A COMMONS NOBODY REPLENISHES</text>
        <g className="cr-area">
          {pos.map(([, , a], i) => {
            const a0 = a + 0.44, a1 = pos[(i + 1) % LOOP.length][2] - 0.44
            const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0)
            const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
            return (
              <Arrow
                key={i}
                d={`M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
                delay={i * 140}
              />
            )
          })}
        </g>
        <g>
          {pos.map(([px, py], i) => (
            <g key={i}>
              <circle cx={px} cy={py} r="17" className="dot-open pop" style={{ '--o': Math.min(0.55, (240 + i * 130) / 1500) }} />
              <text className="vlab lift" x={px} y={py + 4} textAnchor="middle" style={{ '--o': Math.min(0.55, (320 + i * 130) / 1500) }}>{i + 1}</text>
              <text
                className="clab lift"
                x={i === 1 ? px + 28 : i === 3 ? px - 28 : px}
                y={i === 0 ? py - 28 : i === 2 ? py + 38 : py + 4}
                textAnchor={i === 1 ? 'start' : i === 3 ? 'end' : 'middle'}
                style={{ '--o': Math.min(0.55, (400 + i * 130) / 1500) }}
              >
                {LOOP[i]}
              </text>
            </g>
          ))}
          <text className="region-label lift" x={cx} y={cy - 6} textAnchor="middle" style={{ transitionDelay: '900ms' }}>SENIOR</text>
          <text className="region-label lift" x={cx} y={cy + 12} textAnchor="middle" style={{ transitionDelay: '960ms' }}>CAPACITY</text>
          <text className="region-sub lift" x={cx} y={cy + 30} textAnchor="middle" style={{ transitionDelay: '1020ms' }}>everyone draws, nobody refills</text>
        </g>
      </svg>
    </figure>
  )
}

/* ============================================================
   The primitive: price is flat, cost is not
   ============================================================ */
export function PriceVsCost({ num = 'Figure 2. Price is flat. Cost is not.' }) {
  const W = 720, H = 400, padL = 70, padR = 116, padT = 44, padB = 58
  const yMax = 2.7
  const x = (c) => padL + c * (W - padL - padR)
  const y = (v) => padT + (1 - v / yMax) * (H - padT - padB)
  const pts = Array.from({ length: 60 }, (_, i) => i / 59).map((c) => [x(c), y(w(c))])
  const profit = `M ${x(0)} ${y(1)} L ${x(0.5)} ${y(1)} ${smooth(pts.filter((p) => p[0] <= x(0.5)).reverse()).replace(/^M/, 'L')} Z`
  const loss = `M ${x(0.5)} ${y(1)} L ${x(1)} ${y(1)} ${smooth(pts.filter((p) => p[0] >= x(0.5)).reverse()).replace(/^M/, 'L')} Z`
  const gap = (c, label, side) => {
    const gx = x(c), a = y(w(c)), b2 = y(1)
    const top = Math.min(a, b2), bot = Math.max(a, b2)
    return (
      <g key={label}>
        <line className="ci" x1={gx} x2={gx} y1={top} y2={bot} />
        <line className="ci" x1={gx - 6} x2={gx + 6} y1={top} y2={top} />
        <line className="ci" x1={gx - 6} x2={gx + 6} y1={bot} y2={bot} />
        <text className="vlab" x={gx + (side === 'left' ? -12 : 12)} y={(top + bot) / 2 + 4} textAnchor={side === 'left' ? 'end' : 'start'}>{label}</text>
      </g>
    )
  }
  const ref = useScene()
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="A flat price against a cost that rises with complexity, crossing at the break-even case">
        <Hatch id="hx5" />
        <g className="cr-area">
          <path d={profit} className="pos-area" />
          <path d={loss} fill="url(#hx5)" />
        </g>
        <line className="axis" x1={padL} y1={padT - 10} x2={padL} y2={H - padB} />
        <line className="axis" x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} />
        <line className="zero" x1={padL} y1={y(1)} x2={W - padR} y2={y(1)} />
        <path d={smooth(pts)} className="curve draw" />
        <g className="cr-fade">
          <text className="clab" x={W - padR + 10} y={y(1) + 4}>what a visit pays</text>
          <text className="clab" x={W - padR + 10} y={y(w(1)) + 4}>what it costs</text>
          <line className="dropline" x1={x(0.5)} y1={padT} x2={x(0.5)} y2={H - padB} />
          <circle className="mark" cx={x(0.5)} cy={y(1)} r="5" />
          <text className="annot-key" x={x(0.5)} y={padT - 16} textAnchor="middle">break-even case</text>
          {gap(0.12, 'profit +0.48', 'right')}
          {gap(0.82, 'loss \u22120.78', 'left')}
        </g>
        <text className="axt" x={(padL + W - padR) / 2} y={H - 16} textAnchor="middle">complexity of the encounter   (easy → hard)</text>
      </svg>
    </figure>
  )
}

/* ============================================================
   Failures on the left, instruments on the right
   ============================================================ */
const MAP = [
  { f: 'The cream gets skimmed', i: 'Risk-adjusted reimbursement', r: 'first best' },
  { f: 'Complexity cannot be priced', i: 'Pigouvian skimming tax', r: 'second best' },
  { f: 'The pipeline gets starved', i: 'Training-capacity mandate', r: 'restores the floor' },
  { f: 'Data entrenches one owner', i: 'Data-portability rule', r: 'neutralizes it' },
]
export function InstrumentMap({ num = 'Figure 8. Each failure needs its own instrument' }) {
  const W = 720, rowH = 62, padT = 58, padB = 74
  const H = padT + MAP.length * rowH + padB
  const lx = 24, lw = 250, rx = 396, rw = 300
  const ref = useScene()
  return (
    <figure className="figure pp-fig" ref={ref}>
      <div className="fig-num">{num}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Four market failures mapped to four corrective instruments, with distributional remedies failing to bind on any of them">
        <ArrowDefs />
        <text className="axt" x={lx} y={32}>THE FAILURE</text>
        <text className="axt" x={rx} y={32}>WHAT CORRECTS IT</text>
        {MAP.map((m, i) => {
          const yTop = padT + i * rowH
          const mid = yTop + 20
          return (
            <g key={m.f}>
              <g className="cr-area">
                <rect x={lx} y={yTop} width={lw} height={40} className="bar-out" />
                <rect x={rx} y={yTop} width={rw} height={40} className={i < 3 ? 'bar-lite gbar' : 'bar-out'} style={{ '--o': Math.min(0.55, (i * 90) / 1500) }} />
                <Arrow d={`M ${lx + lw + 10} ${mid} L ${rx - 10} ${mid}`} delay={i * 110} small />
              </g>
              <g className="cr-fade">
                <text className="clab" x={lx + 14} y={mid + 4}>{m.f}</text>
                <text className="clab" x={rx + 14} y={mid + 4}>{m.i}</text>
                <text className="clab-mute" x={rx + rw} y={yTop + 54} textAnchor="end">{m.r}</text>
              </g>
            </g>
          )
        })}
        <g className="cr-fade">
          <line className="grid" x1={lx} y1={H - padB + 14} x2={W - 24} y2={H - padB + 14} />
          <text className="clab-mute" x={lx} y={H - padB + 40}>Retraining, basic income, capital taxes, worker equity</text>
          <text className="annot" x={lx} y={H - padB + 58}>redistribute the surplus and bind on none of the four</text>
        </g>
      </svg>
    </figure>
  )
}
