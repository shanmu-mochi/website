import React, { useRef, useState, useLayoutEffect } from 'react'
import { register } from '../lib/scroll'

/* Shared by the home figures and the paper pages. Line draws run on the Web
   Animations API with fill forwards so a React re-render cannot cut them. */
/* Registers a figure with the scroll engine and measures its paths once, so
   every mark inside can be driven off the figure's --p. */
export function useScene(span = 0.6) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.querySelectorAll('.draw').forEach((path) => {
      let len = 0
      try { len = path.getTotalLength() } catch (e) { len = 0 }
      if (len) path.style.setProperty('--len', len.toFixed(1) + 'px')
    })
    return register(el, { span, startAt: 0.95 })
  }, [span])
  return ref
}

/* Catmull-Rom to cubic-bezier: a list of pixel points becomes one fluid curve */
export function smooth(pts) {
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

export function poly(pts) {
  return pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
}

export const Hatch = ({ id }) => (
  <defs>
    <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#0b0b0b" strokeWidth="1" opacity="0.26" />
    </pattern>
  </defs>
)

/* Marker-based arrowheads. One dart shape, oriented off the path tangent, so
   every arrow on every figure is identical and correctly aimed. */
export const ArrowDefs = () => (
  <defs>
    <marker id="ah" viewBox="0 0 12 12" refX="10.6" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse" markerUnits="strokeWidth">
      <path d="M1.2 1.4 L11 6 L1.2 10.6 L3.6 6 Z" fill="#0b0b0b" />
    </marker>
    <marker id="ah-sm" viewBox="0 0 12 12" refX="10.6" refY="6" markerWidth="6.4" markerHeight="6.4" orient="auto-start-reverse" markerUnits="strokeWidth">
      <path d="M1.2 1.4 L11 6 L1.2 10.6 L3.6 6 Z" fill="#0b0b0b" />
    </marker>
  </defs>
)

/* An arrow that draws itself, then lands its head. The head is a short tangent
   segment at the tip, so the marker aims itself correctly on straight lines,
   elbows and arcs alike. */
export function Arrow({ d, delay = 0, small }) {
  const ref = useRef(null)
  const [tip, setTip] = useState(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    let L = 0
    try { L = el.getTotalLength() } catch (e) { return }
    if (!L) return
    const a = el.getPointAtLength(Math.max(0, L - 5))
    const b = el.getPointAtLength(L)
    setTip(`M ${a.x.toFixed(2)} ${a.y.toFixed(2)} L ${b.x.toFixed(2)} ${b.y.toFixed(2)}`)
  }, [d])
  return (
    <g className="ar">
      <path ref={ref} d={d} className="ar-line draw" fill="none" />
      {tip ? (
        <path
          d={tip}
          className={small ? 'ar-head ar-head--sm' : 'ar-head'}
          style={{ '--o': Math.min(0.86, 0.66 + delay / 2600) }}
          fill="none"
        />
      ) : null}
    </g>
  )
}
