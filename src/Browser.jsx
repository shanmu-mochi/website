/* Redesign iteration 4: the A24 film browser is the whole site.
   Routes are hash-based so a plain static server works:
   #/prose  #/publications  #/luck  #/<cat>/<slug>  #/about  #/paintings */
import React, { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { CATS, META, PAINTINGS, SOCIALS, variantFor, aspectOf, placeholderOf, tintOf, creditText } from './pieces'
import NOTES from './pieceNotes'
import './styles/globals.css'
import './styles/a24.css'

const BIO = 'I’m a writer who works in medicine, or a medical person who writes. The order keeps changing.'
const CAT_TONE = { prose: 'rgb(244,243,240)', publications: 'rgb(240,240,236)', luck: 'rgb(243,240,233)' }
const pad2 = (n) => String(n).padStart(2, '0')
const wrapD = (d, n) => { let x = ((d % n) + n) % n; if (x > n / 2) x -= n; return x }
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const catOf = (id) => CATS.find((c) => c.id === id) || CATS[0]
const lastIdx = { prose: 0, publications: 0, luck: 0 }

function parse(h) {
  const p = (h || '').replace(/^#\/?/, '').split('/').filter(Boolean)
  if (p[0] === 'about') return { view: 'about' }
  if (p[0] === 'paintings') return { view: 'paintings' }
  const cat = CATS.some((c) => c.id === p[0]) ? p[0] : 'prose'
  if (p[1]) {
    const i = catOf(cat).items.findIndex((x) => x.slug === p[1])
    if (i >= 0) { lastIdx[cat] = i; return { view: 'piece', cat, i } }
  }
  return { view: 'browse', cat }
}
const hashOf = (r) => r.view === 'piece' ? `#/${r.cat}/${catOf(r.cat).items[r.i].slug}` : r.view === 'browse' ? `#/${r.cat}` : `#/${r.view}`

function useFine() {
  const q = '(min-width: 721px) and (not (pointer: coarse))'
  const [fine, setFine] = useState(() => window.matchMedia(q).matches)
  useEffect(() => { const m = window.matchMedia(q); const on = () => setFine(m.matches); m.addEventListener('change', on); return () => m.removeEventListener('change', on) }, [])
  return fine
}

/* type-only cover for pieces with no painting */
function Cover({ it }) {
  return (
    <div className={`cv cv-${it.cat}`}>
      <span className="cv-k">{it.cover}</span>
      <span className="cv-t">{it.title}</span>
      <span className="cv-n">Shanmu Raja</span>
    </div>
  )
}
function Art({ it, w }) {
  return it.src
    ? <img src={variantFor(it.src, w)} alt="" draggable="false" decoding="async" />
    : <Cover it={it} />
}

/* ---------- the wheel ---------- */
function Wheel({ cat, onOpen, onCenter }) {
  const items = catOf(cat).items
  const N = items.length
  const [cur, setCur] = useState(lastIdx[cat] || 0)
  const pos = useRef(lastIdx[cat] || 0), target = useRef(lastIdx[cat] || 0)
  const els = useRef([])
  const drag = useRef(null), moved = useRef(false), dwell = useRef(null), stage = useRef(null)
  const goTo = (i) => { target.current = pos.current + wrapD(i - pos.current, N) }
  const step = (k) => { target.current = Math.round(target.current) + k }

  useEffect(() => {
    let raf
    const rm = reduced()
    const tick = () => {
      const t = target.current
      pos.current = rm ? t : pos.current + (t - pos.current) * 0.075
      if (Math.abs(t - pos.current) < 0.0008) pos.current = t
      const R = Math.min(window.innerWidth * 0.5, 760)
      els.current.forEach((el, i) => {
        if (!el) return
        const d = wrapD(i - pos.current, N), ad = Math.abs(d), a = d * 0.36
        const x = Math.sin(a) * R * 1.32, z = (Math.cos(a) - 1) * R
        el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, 0px, ${z.toFixed(1)}px) rotateY(${(-a * 28.6).toFixed(2)}deg) scale(${(1 - Math.min(ad, 3) * 0.1).toFixed(3)})`
        el.style.opacity = ad > 3.4 ? '0' : String(Math.max(0, ad <= 1 ? 1 - 0.12 * ad : ad <= 2 ? 0.88 - 0.38 * (ad - 1) : 0.5 - 0.32 * (ad - 2)))
        el.style.zIndex = String(100 - Math.round(ad * 10))
        el.style.pointerEvents = ad > 3.1 ? 'none' : ''
        el.classList.toggle('is-center', ad < 0.5)
        el.style.setProperty('--ink-a', String(Math.max(0, Math.min(1, 1 - (ad - 0.9) * 1.4))))
      })
      const c = ((Math.round(pos.current) % N) + N) % N
      setCur((o) => (o === c ? o : c))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [N])

  useEffect(() => { lastIdx[cat] = cur; onCenter(items[cur]) }, [cur, cat, items, onCenter])

  useEffect(() => {
    const el = stage.current
    let acc = 0, last = 0
    const onWheel = (e) => {
      e.preventDefault()
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      const now = performance.now()
      if (Math.abs(acc) > 40 && now - last > 420) { step(acc > 0 ? 1 : -1); acc = 0; last = now }
    }
    const onKey = (e) => {
      if (e.target.closest && e.target.closest('input, textarea')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1) }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1) }
      else if (e.key === 'Enter' && !(document.activeElement && document.activeElement.closest('.sw-cats, .top'))) {
        e.preventDefault(); const c = ((Math.round(target.current) % N) + N) % N; onOpen(c, els.current[c])
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => { el.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey) }
  }, [N, onOpen])

  const onDown = (e) => { if (e.button === 0) { drag.current = { x: e.clientX, t: target.current }; moved.current = false } }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 6) moved.current = true
    if (moved.current) { target.current = d.t - dx / 260; pos.current = target.current }
  }
  const onUp = () => { if (drag.current) { target.current = Math.round(target.current); drag.current = null } }
  const it = items[cur]

  return (
    <div className="b-stage" ref={stage} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      <div className="b-wheel">
        {items.map((x, i) => (
          <a key={x.slug} ref={(el) => { els.current[i] = el }} className={`b-plate${x.src ? '' : ' is-type'}`} href={`#/${cat}/${x.slug}`}
            style={{ aspectRatio: String(x.src ? aspectOf(x.src) : 0.74), background: x.src ? placeholderOf(x.src) : undefined }}
            aria-label={i === cur ? `Open ${x.title}` : `Show ${x.title}`} tabIndex={i === cur ? 0 : -1} draggable="false"
            onClick={(e) => { e.preventDefault(); if (moved.current) return; if (i === cur) onOpen(i, e.currentTarget); else goTo(i) }}
            onMouseEnter={() => { clearTimeout(dwell.current); if (i !== cur) dwell.current = setTimeout(() => { if (!drag.current) goTo(i) }, 320) }}
            onMouseLeave={() => clearTimeout(dwell.current)}>
            <Art it={x} w={700} />
            {i === cur && x.src && <span className="b-open">Open</span>}
          </a>
        ))}
      </div>
      <div className="b-cap" aria-live="polite" key={`${cat}${cur}`}>
        <a className="b-title" href={`#/${cat}/${it.slug}`} onClick={(e) => { e.preventDefault(); onOpen(cur, els.current[cur]) }}>{it.title}</a>
        <div className="b-by">{it.by}</div>
        {it.line && <p className="b-line">{it.line}</p>}
      </div>
    </div>
  )
}

/* ---------- touch: swipe track ---------- */
function Track({ cat, onCenter }) {
  const items = catOf(cat).items
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const first = el.children[lastIdx[cat] || 0]
    if (first) el.scrollLeft = first.offsetLeft - 20
    const on = () => {
      const w = el.children[0] ? el.children[0].offsetWidth : 1
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / (w + 16))))
      if (i !== lastIdx[cat]) { lastIdx[cat] = i; onCenter(items[i]) }
    }
    onCenter(items[lastIdx[cat] || 0])
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  }, [cat, items, onCenter])
  return (
    <ol className="t-track" ref={ref}>
      {items.map((x) => (
        <li key={x.slug} className="t-card">
          <a href={`#/${cat}/${x.slug}`}>
            <div className={`t-plate${x.src ? '' : ' is-type'}`} style={{ background: x.src ? placeholderOf(x.src) : undefined }}><Art it={x} w={520} /></div>
            <h2 className="t-title">{x.title}</h2>
            {x.line && <p className="t-line">{x.line}</p>}
            <span className="t-read">Open</span>
          </a>
        </li>
      ))}
    </ol>
  )
}

/* ---------- a piece: the "film page" ---------- */
function Piece({ cat, i, go }) {
  const items = catOf(cat).items
  const it = items[i]
  const note = NOTES[`${cat}/${it.slug}`]
  const prev = items[(i - 1 + items.length) % items.length], next = items[(i + 1) % items.length]
  const cta = it.href
    ? <a className="pg-cta" href={it.href} target="_blank" rel="noreferrer">{it.cta} ↗</a>
    : it.internal ? <a className="pg-cta" href={it.internal}>{it.cta} →</a>
      : it.cta ? <span className="pg-cta is-muted">{it.cta}</span> : null
  useEffect(() => { window.scrollTo(0, 0) }, [cat, i])
  return (
    <article className="pg">
      <header className="pg-top">
        <a href={`#/${cat}`} onClick={(e) => { e.preventDefault(); go({ view: 'browse', cat }) }}>← {catOf(cat).label}</a>
        <a href="#/prose" className="pg-name" onClick={(e) => { e.preventDefault(); go({ view: 'browse', cat: 'prose' }) }}>Shanmu Raja</a>
        <span className="pg-count">{pad2(i + 1)} / {pad2(items.length)}</span>
      </header>
      <h1 className="pg-title">{it.title}</h1>
      <p className="pg-by">{it.by}</p>
      <dl className="pg-meta">
        {it.meta.filter(([, v]) => v).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
      {cta && <div className="pg-cta-row">{cta}</div>}
      <figure className={`pg-fig${it.src ? '' : ' is-type'}`}>
        <div className="pg-art" style={{ aspectRatio: String(it.src ? aspectOf(it.src) : 0.74), "--ar": it.src ? aspectOf(it.src) : 0.74 }}><Art it={it} w={1100} /></div>
        {it.src && <figcaption>{creditText(it.src)}</figcaption>}
      </figure>
      {it.quote && <blockquote className="pg-quote">{it.quote}</blockquote>}
      {note ? <section className="pg-note"><h2>On the painting</h2><p>{note}</p></section> : null}
      <nav className="pg-nav">
        <a href={`#/${cat}/${prev.slug}`} onClick={(e) => { e.preventDefault(); go({ view: 'piece', cat, i: (i - 1 + items.length) % items.length }) }}>← {prev.title}</a>
        <a href={`#/${cat}/${next.slug}`} onClick={(e) => { e.preventDefault(); go({ view: 'piece', cat, i: (i + 1) % items.length }) }}>{next.title} →</a>
      </nav>
    </article>
  )
}

function About({ go }) {
  return (
    <article className="pg pg-about">
      <header className="pg-top">
        <a href="#/prose" onClick={(e) => { e.preventDefault(); go({ view: 'browse', cat: lastCat.current }) }}>← Back</a>
        <span className="pg-name">Shanmu Raja</span><span />
      </header>
      <div className="ab">
        <img src="/headshot-700.webp" alt="Shanmu Raja" width="700" height="1049" />
        <div>
          <p className="ab-lead">{BIO}</p>
          <p>I write fiction, essays, and the occasional poem.</p>
          <p>I have a master’s from UCSF in healthcare economics and health policy. My thesis looked at access deserts in Medi-Cal. My research lives in clinical medicine and surgery.</p>
          <p>My fiction has been recognized by <em>The New Yorker</em>, the Paul Kalanithi Writing Competition, and the Massachusetts Undergraduate Poetry Festival. My research has appeared in <em>The Journal of Thoracic and Cardiovascular Surgery</em> and <em>Journal of Vascular Surgery</em>.</p>
          <p>Off the page: squash, piano, a steady diet of cinema.</p>
          <p className="ab-links"><a href="mailto:shanmur@uclawsf.edu">shanmur@uclawsf.edu</a>{SOCIALS.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer">{l}</a>)}</p>
        </div>
      </div>
    </article>
  )
}

function Paintings({ go }) {
  return (
    <article className="pg pg-paint">
      <header className="pg-top">
        <a href="#/prose" onClick={(e) => { e.preventDefault(); go({ view: 'browse', cat: lastCat.current }) }}>← Back</a>
        <span className="pg-name">Paintings</span><span />
      </header>
      <ul className="pt-grid">
        {PAINTINGS.map((s) => (
          <li key={s}><div style={{ aspectRatio: String(aspectOf(s)), background: placeholderOf(s) }}><img src={variantFor(s, 360)} alt={META[s].title} loading="lazy" decoding="async" /></div><span>{creditText(s)}</span></li>
        ))}
      </ul>
    </article>
  )
}

const ICONS = {
  medium: <path d="M2.5 5.5h6.6l3.1 7.4 3-7.4H21.5v.4l-1.6 1.5v8.7l1.6 1.5v.4h-6.4v-.4l1.7-1.6v-7.6l-3.9 9.6h-.5l-4.4-9.6v6.6l1.9 2.2v.4H4.7v-.4l1.9-2.2V7.4L4.5 5.9v-.4z" />,
  substack: <path d="M5 4.5h14v2.2H5V4.5zM5 8.6h14v2.2H5V8.6zM5 12.7l7 3.9 7-3.9V20l-7-3.9L5 20v-7.3z" />,
  instagram: <><rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.4" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="17" cy="7" r="1.2" /></>,
  linkedin: <path d="M4.5 4.5h15v15h-15v-15zm3.1 5.6H6.1v7.3h1.5v-7.3zm-.75-2.5a.9.9 0 100 1.8.9.9 0 000-1.8zm9.65 4.6c0-1.7-1-2.4-2.2-2.4-1 0-1.5.55-1.7.95v-.85h-1.5v7.3h1.5v-4c0-1 .65-1.3 1.15-1.3.5 0 .95.35.95 1.25v4.05h1.5v-4.35z" />,
  x: <path d="M5 4.5h3.6l3.3 4.7 3.8-4.7H19l-5.2 6.3L19.6 19.5H16l-3.7-5.2-4.2 5.2H5.4l5.6-6.8L5 4.5zm2.1 1.2l9.1 12.6h1.6L8.7 5.7H7.1z" />,
}

const lastCat = { current: 'prose' }

export default function Browser() {
  const fine = useFine()
  const [route, setRoute] = useState(() => parse(window.location.hash))
  const [shown, setShown] = useState(route.cat || 'prose')   // the category the wheel is showing
  const [leaving, setLeaving] = useState(false)
  const [tint, setTint] = useState(CAT_TONE.prose)
  if (route.cat) lastCat.current = route.cat

  // one place that moves between views; a View Transition when the browser has it
  const go = (r, fromEl) => {
    const h = hashOf(r)
    const apply = () => { flushSync(() => setRoute(r)); if (window.location.hash !== h) history.pushState(null, '', h) }
    if (r.view === 'browse' && route.view === 'browse') { apply(); return }
    if (document.startViewTransition && !reduced()) {
      if (fromEl) fromEl.style.viewTransitionName = 'hero'
      const vt = document.startViewTransition(apply)
      vt.finished.finally(() => { if (fromEl) fromEl.style.viewTransitionName = '' })
    } else apply()
  }
  const goRef = useRef(go); goRef.current = go

  useEffect(() => {
    const on = () => {
      const r = parse(window.location.hash)
      if (document.startViewTransition && !reduced()) document.startViewTransition(() => flushSync(() => setRoute(r)))
      else setRoute(r)
    }
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [])

  // Esc on any page goes back to the browser
  useEffect(() => {
    if (route.view === 'browse') return
    const on = (e) => { if (e.key === 'Escape') goRef.current({ view: 'browse', cat: lastCat.current }) }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [route.view])

  // category swap: fade the wheel out, change its contents, fade back in
  useEffect(() => {
    if (route.view !== 'browse' || route.cat === shown) return
    if (reduced()) { setShown(route.cat); return }
    setLeaving(true)
    const t = setTimeout(() => { setShown(route.cat); setLeaving(false) }, 420)
    return () => clearTimeout(t)
  }, [route, shown])

  useEffect(() => { document.documentElement.classList.toggle('b-lock', route.view === 'browse') }, [route.view])

  const [ci, setCi] = useState(0)
  const onCenter = React.useCallback((it) => { setTint(it.src ? tintOf(it.src, 0.1) : CAT_TONE[it.cat]); setCi(catOf(it.cat).items.indexOf(it)) }, [])
  const onOpen = React.useCallback((i, el) => goRef.current({ view: 'piece', cat: lastCat.current, i }, el), [])

  if (route.view === 'piece') return <Piece cat={route.cat} i={route.i} go={go} />
  if (route.view === 'about') return <About go={go} />
  if (route.view === 'paintings') return <Paintings go={go} />

  const cat = catOf(shown)
  return (
    <main className={`b${fine ? '' : ' b-touch'}`} style={{ background: tint }}>
      <header className="top">
        <div className="top-l">
          <a className="top-name" href="#/prose" onClick={(e) => { e.preventDefault(); go({ view: 'browse', cat: 'prose' }) }}>Shanmu Raja</a>
          <p className="top-bio">{BIO}</p>
        </div>
        <nav className="top-r">
          <a href="#/paintings" onClick={(e) => { e.preventDefault(); go({ view: 'paintings' }) }}>Paintings</a>
          <a href="#/about" onClick={(e) => { e.preventDefault(); go({ view: 'about' }) }}>About</a>
        </nav>
      </header>

      <div className={`b-body${leaving ? ' is-leaving' : ''}`} key={shown}>
        {fine ? <Wheel cat={shown} onOpen={onOpen} onCenter={onCenter} /> : <Track cat={shown} onCenter={onCenter} />}
      </div>

      <nav className="sw-cats" aria-label="Categories">
        {CATS.map((c) => (
          <a key={c.id} href={`#/${c.id}`} className={c.id === route.cat ? 'is-on' : ''} aria-current={c.id === route.cat ? 'true' : undefined}
            onClick={(e) => { e.preventDefault(); go({ view: 'browse', cat: c.id }) }}>
            {c.label}<sup>{c.items.length}</sup>
          </a>
        ))}
      </nav>
      {fine && <div className="b-count">{pad2(ci + 1)} / {pad2(cat.items.length)}</div>}
      <nav className="b-social" aria-label="Elsewhere">
        {SOCIALS.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" aria-label={l} title={l}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{ICONS[l.toLowerCase()]}</svg></a>)}
      </nav>
    </main>
  )
}
