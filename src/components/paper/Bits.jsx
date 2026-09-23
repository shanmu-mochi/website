import React, { useLayoutEffect, useRef, useState } from 'react'
import { register } from '../../lib/scroll'

/* Reveal wrapper. Progress is tied to scroll position, so it rewinds. */
export function Rv({ children, as: Tag = 'div', delay = 0, className = '' }) {
  const ref = useRef(null)
  useLayoutEffect(() => register(ref.current, { span: 0.34 }), [])
  return React.createElement(Tag, {
    ref,
    className: `pp-rv${className ? ' ' + className : ''}`,
    style: delay ? { '--o': Math.min(0.5, delay / 900) } : undefined,
  }, children)
}

export function Sec({ id, title, sub, children }) {
  return (
    <section className="pp-sec" id={id} data-sec={id}>
      <Rv className="pp-sec-head">
        <h2 className="pp-h2">{title}</h2>
        {sub ? <p className="pp-h2-sub">{sub}</p> : null}
      </Rv>
      {children}
    </section>
  )
}

export function H3({ children }) {
  return <Rv as="h3" className="pp-h3">{children}</Rv>
}

export function P({ children }) {
  return <Rv as="p" className="pp-p">{children}</Rv>
}

export function Eq({ children, note }) {
  return <Rv className="pp-eq">{children}{note ? <span className="pp-eq-note">{note}</span> : null}</Rv>
}

export function Cap({ children }) {
  return <Rv className="pp-cap">{children}</Rv>
}

export function List({ items, ordered }) {
  return (
    <Rv>
      <ol className="pp-list">
        {items.map((it, i) => (
          <li key={i}>
            <span className="pp-li-n">{ordered ? `${i + 1}.` : '—'}</span>
            <span>{it}</span>
          </li>
        ))}
      </ol>
    </Rv>
  )
}

export function DataTable({ num, head, rows, note }) {
  return (
    <Rv className="pp-tw">
      {num ? <div className="pp-tnum">{num}</div> : null}
      <table className="pp-t">
        <thead>
          <tr>{head.map((h, i) => <th key={i} className={i ? 'pp-r' : undefined}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={r.sum ? 'pp-sum' : undefined}>
              {(r.cells || r).map((c, j) => <td key={j} className={j ? 'pp-r' : undefined}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {note ? <div className="pp-tnote">{note}</div> : null}
    </Rv>
  )
}

/* One number at display size. The count is scrubbed by scroll, not timed. */
export function Stat({ n, l }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(n)
  useLayoutEffect(() => {
    const m = /^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/.exec(n)
    if (!m) return register(ref.current, { span: 0.4 })
    const [, pre, digits, post] = m
    const target = parseFloat(digits.replace(/,/g, ''))
    const decimals = (digits.split('.')[1] || '').length
    const grouped = digits.includes(',')
    const fmt = (v) => {
      const f = v.toFixed(decimals)
      return grouped ? Number(f).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : f
    }
    return register(ref.current, {
      span: 0.4,
      onProgress: (p) => setShown(p >= 1 ? n : pre + fmt(target * (1 - Math.pow(1 - p, 2.2))) + post),
    })
  }, [n])
  return (
    <Rv className="pp-stat">
      <div className="pp-stat-n" ref={ref}>{shown}</div>
      <div className="pp-stat-l">{l}</div>
    </Rv>
  )
}

/* Pills that step themselves as you scroll, and can also be clicked. */
export function StepFigure({ num, head, steps, caption }) {
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const manual = useRef(false)
  useLayoutEffect(() => register(ref.current, {
    span: 0.8,
    startAt: 0.82,
    onProgress: (p) => {
      if (manual.current) return
      setI(Math.max(0, Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999))))
    },
  }), [steps.length])
  const s = steps[i]
  return (
    <Rv className="pp-stepfig">
      <div ref={ref}>
        {num ? <div className="fig-num">{num}</div> : null}
        <div className="pp-pills" role="tablist">
          {steps.map((st, k) => (
            <button
              key={st.pill}
              type="button"
              role="tab"
              aria-selected={k === i}
              className={`pp-pill${k === i ? ' pp-pill-on' : ''}`}
              onClick={() => { manual.current = true; setI(k) }}
            >
              {st.pill}
            </button>
          ))}
        </div>
        <div className="pp-panel">
          {head ? <div className="pp-panel-k">{head}</div> : null}
          <dl className="pp-panel-rows">
            {s.rows.map(([k, v, tone]) => (
              <div className="pp-panel-row" key={k}>
                <dt>{k}</dt>
                <dd className={tone ? `pp-tone-${tone}` : undefined}>{v}</dd>
              </div>
            ))}
          </dl>
          {s.note ? <div className="pp-panel-note">{s.note}</div> : null}
        </div>
      </div>
      {caption ? <div className="pp-cap">{caption}</div> : null}
    </Rv>
  )
}

/* A card that lives out in the right margin and expands in place. */
export function Aside({ label = 'Primer', title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="pp-aside-anchor">
      <aside className={`pp-aside${open ? ' pp-aside-open' : ''}`}>
        <div className="pp-aside-k">{label}</div>
        <button type="button" className="pp-aside-t" onClick={() => setOpen(!open)} aria-expanded={open}>
          <span>{title}</span>
          <span className="pp-aside-x" aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        <div className="pp-aside-body"><div>{children}</div></div>
      </aside>
    </div>
  )
}
