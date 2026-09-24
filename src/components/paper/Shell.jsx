import React, { useEffect, useState } from 'react'
import { Rv } from './Bits'

export function Progress() {
  const [w, setW] = useState(0)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setW(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return <div className="pp-progress" style={{ width: `${w}%` }} aria-hidden="true" />
}

export function TopBar({ actions = [] }) {
  return (
    <div className="pp-top">
      <div className="pp-top-in">
        <a className="pp-back" href="/"><span className="pp-arrow">←</span> Shanmu Raja</a>
        <div className="pp-top-act">
          {actions.map((a) => (
            <a key={a.label} href={a.href} target={a.href.startsWith('http') ? '_blank' : undefined} rel={a.href.startsWith('http') ? 'noreferrer' : undefined}>{a.label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Hero({ eyebrow, title, deck, facts }) {
  return (
    <header className="pp-hero">
      <div className="pp-hero-in">
        <Rv className="pp-eyebrow">{eyebrow}</Rv>
        <Rv as="h1" className="pp-title">{title}</Rv>
        <Rv as="p" className="pp-deck" delay={90}>{deck}</Rv>
        <Rv className="pp-byline" delay={160}>
          {facts.map((f) => (
            <div key={f.k}>
              {f.k} {f.dt ? <strong><time dateTime={f.dt}>{f.v}</time></strong> : <strong>{f.v}</strong>}
            </div>
          ))}
        </Rv>
      </div>
    </header>
  )
}

export function Abstract({ label = 'The short version', children }) {
  return (
    <section className="pp-abstract">
      <div className="pp-abstract-in">
        <Rv className="pp-label">{label}</Rv>
        <Rv>{children}</Rv>
      </div>
    </section>
  )
}

export function Contents({ toc }) {
  return (
    <nav className="pp-toc" aria-label="Contents">
      <Rv className="pp-label">Contents</Rv>
      <Rv className="pp-toc-in">
        <ol>
          {toc.map((t) => (
            <li key={t.id}>
              <a href={`#${t.id}`}>
                <span className="pp-toc-n">{String(t.n).padStart(2, '0')}</span>
                <span className="pp-toc-t">{t.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </Rv>
    </nav>
  )
}

/* Numbers only. The chapter title does the labelling, once, at full size. */
export function Rail({ toc, foot }) {
  const [on, setOn] = useState(toc[0] && toc[0].id)
  useEffect(() => {
    const secs = toc.map((t) => document.getElementById(t.id)).filter(Boolean)
    if (!secs.length) return
    const pick = () => {
      const line = window.innerHeight * 0.34
      let cur = secs[0].id
      secs.forEach((s) => { if (s.getBoundingClientRect().top <= line) cur = s.id })
      setOn(cur)
    }
    pick()
    window.addEventListener('scroll', pick, { passive: true })
    window.addEventListener('resize', pick)
    return () => { window.removeEventListener('scroll', pick); window.removeEventListener('resize', pick) }
  }, [toc])
  return (
    <nav className="pp-rail" aria-label="Chapters">
      <ol>
        {toc.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`} className={on === t.id ? 'pp-on' : undefined} aria-label={t.label}>{t.n}</a>
          </li>
        ))}
      </ol>
      {foot ? <div className="pp-rail-foot">{foot}</div> : null}
    </nav>
  )
}

export function End({ cite, links, sources }) {
  return (
    <section className="pp-end">
      <div className="pp-end-in">
        <Rv className="pp-label">Cite as</Rv>
        <Rv as="p" className="pp-cite">{cite}</Rv>
        {links && links.length ? (
          <Rv className="pp-endlinks">
            {links.map((l) => (
              <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel={l.href.startsWith('http') ? 'noreferrer' : undefined}>{l.label}</a>
            ))}
          </Rv>
        ) : null}
        {sources && sources.length ? (
          <>
            <Rv className="pp-label" delay={80}>Sources</Rv>
            <Rv><ul className="pp-srcs">{sources.map((s, i) => <li key={i}>{s}</li>)}</ul></Rv>
          </>
        ) : null}
      </div>
    </section>
  )
}
