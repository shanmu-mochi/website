/* Redesign iteration 6: the home is a WebGL gallery of the paintings that moves the way the A24
   film browser moves (see src/gallery/Gallery.js and NOTES-A24-STUDY.md). Piece pages are white paper.
   Routes are hash-based so a plain static server works:
   #/prose  #/publications  #/luck  #/<cat>/<slug>  #/about  #/paintings */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { CATS, META, PAINTINGS, SOCIALS, variantFor, aspectOf, placeholderOf, tintOf, creditText } from './pieces'
import NOTES from './pieceNotes'
import gsap from 'gsap'
import Gallery from './gallery/Gallery'
import './styles/globals.css'
import './styles/a24.css'

const BIO = 'I’m a writer who works in medicine, or a medical person who writes. The order keeps changing.'
const pad2 = (n) => String(n).padStart(2, '0')
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isTouch = () => window.matchMedia('(max-width: 720px), (pointer: coarse)').matches
const catOf = (id) => CATS.find((c) => c.id === id) || CATS[0]
const lastIdx = { prose: 0, publications: 0, luck: 0 }
const lastCat = { current: 'prose' }
const session = { introDone: false, back: false }
const BG = 'rgb(242,242,240)'
const SERIF = '"Bodoni Moda", "Didot", "Bodoni 72", Georgia, serif'

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

/* ---------- canvas faces: "white paper" covers for pieces with no painting, and the back of every plate ---------- */
const fontsReady = () => (document.fonts ? Promise.all([document.fonts.load(`400 40px "Bodoni Moda"`), document.fonts.load('500 20px Inter')]).catch(() => {}) : Promise.resolve())
function wrap(ctx, text, maxW) {
  const words = String(text).split(/\s+/), lines = []
  let line = ''
  for (const w of words) { const t = line ? `${line} ${w}` : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w } else line = t }
  if (line) lines.push(line)
  return lines
}
function sheet(aspect, draw) {
  const H = 1024, W = Math.round(H * aspect)
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')
  draw(ctx, W, H)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}
function rule(ctx, x0, x1, y) { ctx.fillRect(x0, y, x1 - x0, 2) }
const coverTexture = (it, aspect) => fontsReady().then(() => sheet(aspect, (ctx, W, H) => {
  ctx.fillStyle = '#fdfcfa'; ctx.fillRect(0, 0, W, H)
  const m = W * 0.09
  ctx.fillStyle = '#141414'
  ctx.font = '600 22px Inter'; ctx.textBaseline = 'top'
  ctx.letterSpacing = '4px'
  ctx.fillText(String(it.cover || it.kind || '').toUpperCase().slice(0, 48), m, m)
  rule(ctx, m, W - m, m + 44)
  ctx.letterSpacing = '-2px'
  let fs = 96, lines
  for (; fs > 40; fs -= 4) { ctx.font = `400 ${fs}px ${SERIF}`; lines = wrap(ctx, it.title.toUpperCase(), W - 2 * m); if (lines.length * fs * 1.02 < H * 0.52) break }
  lines.forEach((l, k) => ctx.fillText(l, m, m + 92 + k * fs * 1.02))
  ctx.letterSpacing = '4px'; ctx.font = '600 22px Inter'
  rule(ctx, m, W - m, H - m - 44)
  ctx.fillText('SHANMU RAJA', m, H - m - 22)
  const tag = it.cat === 'luck' ? 'LUCK' : 'PUBLICATION'
  ctx.textAlign = 'right'; ctx.fillText(tag, W - m, H - m - 22)
}))
const versoTexture = (it, aspect) => fontsReady().then(() => sheet(aspect, (ctx, W, H) => {
  ctx.fillStyle = '#f7f5f0'; ctx.fillRect(0, 0, W, H)
  ctx.save(); ctx.translate(W, 0); ctx.scale(-1, 1)   // the box's back face is mirrored
  const m = W * 0.1
  ctx.fillStyle = '#1a1a1a'; ctx.textBaseline = 'top'; ctx.textAlign = 'center'
  ctx.font = `400 46px ${SERIF}`; ctx.letterSpacing = '-1px'
  const lines = wrap(ctx, it.title.toUpperCase(), W - 2 * m)
  const y0 = H / 2 - (lines.length * 50) / 2 - 40
  lines.forEach((l, k) => ctx.fillText(l, W / 2, y0 + k * 50))
  ctx.letterSpacing = '3px'; ctx.font = '500 19px Inter'
  const cr = it.src ? creditText(it.src) : it.by
  wrap(ctx, String(cr || '').toUpperCase(), W - 2 * m).slice(0, 3).forEach((l, k) => ctx.fillText(l, W / 2, y0 + lines.length * 50 + 30 + k * 28))
  ctx.font = '500 17px Inter'; ctx.fillText('SHANMU RAJA', W / 2, H - m)
  ctx.restore()
}))

function itemsFor(cat) {
  return catOf(cat).items.map((it) => ({
    ...it,
    url: it.src ? variantFor(it.src, 900) : null,
    aspect: it.src ? aspectOf(it.src) : 0.74,
    placeholder: it.src ? placeholderOf(it.src) : '#fdfcfa',
  }))
}

/* ---------- the pen ring: a hand-drawn loop redrawn ten times a second ---------- */
function scribblePath(w, h, seed) {
  let s = seed * 9301 + 49297
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const cx = w / 2, cy = h / 2, rx = w / 2, ry = h / 2, n = 24
  const turns = 1.12, a0 = -Math.PI * 0.62 + rnd() * 0.3
  const pts = []
  for (let k = 0; k <= n; k += 1) {
    const t = k / n, a = a0 + t * Math.PI * 2 * turns, j = 1 + (rnd() - 0.5) * 0.05 + (t > 1 / turns ? 0.035 : 0)
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j])
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let k = 1; k < pts.length - 1; k += 1) {
    const [x, y] = pts[k], [nx, ny] = pts[k + 1]
    d += ` Q${x.toFixed(1)} ${y.toFixed(1)} ${((x + nx) / 2).toFixed(1)} ${((y + ny) / 2).toFixed(1)}`
  }
  return d
}
function Scribble({ w, h, on, pad = 0.14 }) {
  const [seed, setSeed] = useState(1)
  useEffect(() => {
    if (!on || reduced()) return
    const t = setInterval(() => setSeed((x) => x + 1), 100)
    return () => clearInterval(t)
  }, [on])
  if (!w || !h) return null
  const W = w * (1 + pad * 2), H = h * (1 + pad * 2)
  return (
    <svg className={`scr${on ? ' is-on' : ''}`} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ left: -w * pad, top: -h * pad }} aria-hidden="true">
      <path d={scribblePath(W, H, seed)} pathLength="1" />
    </svg>
  )
}

/* ---------- loading counter: big rolling digits ---------- */
function Odometer({ value }) {
  const s = String(Math.round(value)).padStart(2, '0')
  return (
    <span className="odo" aria-label={`${Math.round(value)}%`}>
      {s.split('').map((d, k) => (
        <span className="odo-c" key={s.length - k}>
          <span className="odo-r" style={{ transform: `translateY(${-Number(d) * 10}%)` }}>
            {'0123456789'.split('').map((x) => <span key={x}>{x}</span>)}
          </span>
        </span>
      ))}
      <span className="odo-p">%</span>
    </span>
  )
}

/* ---------- the home browser ---------- */
function Home({ cat, go }) {
  const host = useRef(null), gal = useRef(null), ring = useRef(null)
  const items = catOf(cat).items
  const [cur, setCur] = useState(lastIdx[cat] || 0)
  const [hov, setHov] = useState(-1)
  const [phase, setPhase] = useState(session.introDone || reduced() ? 'ready' : 'loading')
  const [pct, setPct] = useState(0)
  const [box, setBox] = useState(null)
  const [catHover, setCatHover] = useState(null)
  const [busy, setBusy] = useState(false)
  const goRef = useRef(go); goRef.current = go

  useLayoutEffect(() => {
    const el = host.current
    const g = gal.current = new Gallery(el, itemsFor(cat), {
      start: lastIdx[cat] || 0, touch: isTouch, coverTexture, versoTexture,
      onChange: (i) => { lastIdx[cat] = i; setCur(i) },
      onHover: (i) => setHov(i),
      onOpen: (i) => open(i),
      onFrame: () => {
        const r = ring.current
        if (!r) return
        const b = g.rectOf(g.index())
        if (b) r.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`
        if (b && (!r._b || Math.abs(r._b.w - b.w) > 2 || Math.abs(r._b.h - b.h) > 2)) { r._b = b; setBox({ w: b.w, h: b.h }) }
      },
    })
    let live = true
    const near = g.plates.filter((p) => Math.abs(p.i - g.L) <= 3)
    if (!session.introDone && !reduced()) {
      // the counter follows the real texture loads; the rise starts once the front plates are in
      let n = 0
      near.forEach((p) => p.ready.then(() => { n += 1; if (live) setPct((x) => Math.max(x, (n / near.length) * 100)) }))
      const ready = Promise.race([Promise.all(near.map((p) => p.ready)), new Promise((r) => setTimeout(r, 4000))])
      g.G.active = 0.001; g.G.others = 0
      ready.then(() => {
        if (!live) return
        setPct(100); session.introDone = true
        setTimeout(() => { if (!live) return; setPhase('intro'); g.intro().then(() => live && setPhase('ready')) }, 420)
      })
    } else if (session.back) {
      session.back = false; g.inbound()
    } else if (!reduced()) {
      g.G.active = 0.001; g.G.others = 0; g.G.inbound = true; g.fan()
    }
    return () => { live = false; g.destroy(); gal.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat])

  const open = useCallback(() => {
    const g = gal.current
    if (!g || g.flight) return
    setBusy(true)
    g.flyOut().then(() => { session.back = true; goRef.current({ view: 'piece', cat, i: g.index() }) })
  }, [cat])

  const switchCat = (id) => {
    const g = gal.current
    if (id === cat || !g || g.flight) return
    if (reduced()) { goRef.current({ view: 'browse', cat: id }); return }
    g.flight = true; setBusy(true)
    gsap.to(g.G, { others: 0, active: 0, duration: 0.45, ease: 'power2.in', onComplete: () => { setBusy(false); goRef.current({ view: 'browse', cat: id }) } })
  }

  useEffect(() => {
    const on = (e) => {
      const g = gal.current
      if (!g || g.flight || g.q.active) return
      if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); g.step(1, 'key') }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); g.step(-1, 'key') }
      else if (e.key === 'Enter' && !(document.activeElement && document.activeElement.closest('a, button'))) { e.preventDefault(); open(g.index()) }
      else if (e.key === ' ' && !(document.activeElement && document.activeElement.closest('a, button'))) { e.preventDefault(); g.flip() }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [open])

  const it = items[cur]
  const bg = it.src ? tintOf(it.src, 0.06) : BG
  const meta = it.meta.filter(([, v]) => v)
  const show = phase === 'ready' && !busy
  return (
    <main className={`h h-${phase}${busy ? ' is-busy' : ''}`} style={{ background: bg }}
      aria-label={`${catOf(cat).label}. ${items.length} pieces. Arrow keys to move, Enter to open, Space to turn the painting over.`}>
      <div className="h-gl" ref={host} />
      <div className="h-ring" ref={ring} aria-hidden="true"><Scribble w={box && box.w} h={box && box.h} on={hov === cur && show} pad={0.09} /></div>

      <header className="h-top">
        <a className="h-mark" href="#/prose" onClick={(e) => { e.preventDefault(); switchCat('prose') }}>Shanmu Raja</a>
        <nav className="h-nav">
          <a href="#/paintings" onClick={(e) => { e.preventDefault(); go({ view: 'paintings' }) }}>Paintings</a>
          <a href="#/about" onClick={(e) => { e.preventDefault(); go({ view: 'about' }) }}>About</a>
        </nav>
      </header>

      <section className={`h-info${show ? ' is-on' : ''}`} key={`${cat}-${cur}`} aria-live="polite">
        <h1 className="h-title"><a href={`#/${cat}/${it.slug}`} onClick={(e) => { e.preventDefault(); open(cur) }}>{it.title}</a></h1>
        <dl className="h-meta">
          {meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>

      {it.line && <blockquote className={`h-quote${show ? ' is-on' : ''}`} key={`q-${cat}-${cur}`}>{it.line}</blockquote>}

      <nav className={`h-cats${phase === 'loading' ? '' : ' is-on'}`} aria-label="Categories">
        {CATS.map((c) => (
          <a key={c.id} href={`#/${c.id}`} className={c.id === cat ? 'is-on' : ''} aria-current={c.id === cat ? 'true' : undefined}
            onMouseEnter={() => setCatHover(c.id)} onMouseLeave={() => setCatHover(null)} onFocus={() => setCatHover(c.id)} onBlur={() => setCatHover(null)}
            onClick={(e) => { e.preventDefault(); switchCat(c.id) }}>
            <span className="h-cat-l">{c.label}<CatRing on={catHover === c.id || (catHover === null && c.id === cat)} /></span><sup>{c.items.length}</sup>
          </a>
        ))}
      </nav>

      <div className={`h-foot${phase === 'loading' ? '' : ' is-on'}`}>
        <span className="h-count">{pad2(cur + 1)} <i>/</i> {pad2(items.length)}</span>
        <nav className="h-social" aria-label="Elsewhere">
          {SOCIALS.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" aria-label={l} title={l}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{ICONS[l.toLowerCase()]}</svg></a>)}
        </nav>
      </div>

      {phase === 'loading' && <div className="h-load" aria-hidden="true"><Odometer value={pct} /></div>}
      <p className="h-hint" aria-hidden="true">{isTouch() ? 'Swipe' : 'Scroll, drag, or use the arrow keys'}</p>
    </main>
  )
}
function CatRing({ on }) {
  const ref = useRef(null)
  const [s, setS] = useState(null)
  useLayoutEffect(() => { const p = ref.current && ref.current.parentElement; if (p) setS({ w: p.offsetWidth, h: p.offsetHeight }) }, [])
  return <span ref={ref} className="h-cat-ring">{s && <Scribble w={s.w} h={s.h} on={on} pad={0.16} />}</span>
}

/* ---------- a piece: white paper, laid out like an A24 film page ---------- */
function Piece({ cat, i, go }) {
  const items = catOf(cat).items
  const it = items[i]
  const note = NOTES[`${cat}/${it.slug}`]
  const prev = items[(i - 1 + items.length) % items.length], next = items[(i + 1) % items.length]
  const [leaving, setLeaving] = useState(false)
  const back = () => {
    if (reduced()) { go({ view: 'browse', cat }); return }
    setLeaving(true); setTimeout(() => go({ view: 'browse', cat }), 400)
  }
  const backRef = useRef(back); backRef.current = back
  useEffect(() => { window.scrollTo(0, 0); session.back = true }, [cat, i])
  useEffect(() => {
    const on = (e) => { if (e.key === 'Escape') backRef.current() }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])
  const meta = it.meta.filter(([, v]) => v)
  const cta = it.href
    ? <a className="pg-cta-a" href={it.href} target="_blank" rel="noreferrer"><span>{it.cta}</span><b aria-hidden="true">↗</b></a>
    : it.internal ? <a className="pg-cta-a" href={it.internal}><span>{it.cta}</span><b aria-hidden="true">→</b></a>
      : it.cta ? <span className="pg-cta-a is-muted"><span>{it.cta}</span></span> : null
  return (
    <article className={`pg${leaving ? ' is-leaving' : ''}`} key={`${cat}-${i}`}>
      <header className="pg-top">
        <a href={`#/${cat}`} onClick={(e) => { e.preventDefault(); back() }}><span aria-hidden="true">←</span> {catOf(cat).label}</a>
        <a href="#/prose" className="pg-name" onClick={(e) => { e.preventDefault(); back() }}>Shanmu Raja</a>
        <span className="pg-count">{pad2(i + 1)} / {pad2(items.length)}</span>
      </header>
      <div className="pg-head">
        <i className="pg-x pg-x-l" aria-hidden="true" /><i className="pg-x pg-x-r" aria-hidden="true" />
        <h1 className="pg-title"><span>{it.title}</span></h1>
        <hr className="pg-rule" />
        <p className="pg-by"><span>{it.by}</span></p>
      </div>
      <div className="pg-cols">
        <dl className="pg-meta">
          {meta.map(([k, v], n) => <div key={k} style={{ '--n': n }}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        {cta && <div className="pg-cta">{cta}</div>}
      </div>
      {it.quote && <blockquote className="pg-quote"><span>{it.quote}</span></blockquote>}
      {it.src
        ? <figure className="pg-fig">
          <div className="pg-art" style={{ aspectRatio: String(aspectOf(it.src)), '--ar': aspectOf(it.src), background: placeholderOf(it.src) }}><img src={variantFor(it.src, 1400)} alt={creditText(it.src)} decoding="async" /></div>
          <figcaption>{creditText(it.src)}</figcaption>
        </figure>
        : <figure className="pg-fig is-type"><div className="pg-sheet"><span className="cv-k">{it.cover}</span><span className="cv-t">{it.title}</span><span className="cv-n">Shanmu Raja</span></div></figure>}
      {note ? <section className="pg-note"><h2>On the painting</h2><p>{note}</p></section> : null}
      <nav className="pg-nav">
        <a href={`#/${cat}/${prev.slug}`} onClick={(e) => { e.preventDefault(); go({ view: 'piece', cat, i: (i - 1 + items.length) % items.length }) }}><small>Previous</small>{prev.title}</a>
        <a href={`#/${cat}/${next.slug}`} onClick={(e) => { e.preventDefault(); go({ view: 'piece', cat, i: (i + 1) % items.length }) }}><small>Next</small>{next.title}</a>
      </nav>
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
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <article className="pg pg-paint">
      <header className="pg-top">
        <a href="#/prose" onClick={(e) => { e.preventDefault(); go({ view: 'browse', cat: lastCat.current }) }}><span aria-hidden="true">←</span> Back</a>
        <span className="pg-name">Shanmu Raja</span><span className="pg-count">{PAINTINGS.length}</span>
      </header>
      <div className="pg-head"><h1 className="pg-title"><span>Paintings</span></h1><hr className="pg-rule" /></div>
      <ul className="pt-grid">
        {PAINTINGS.map((s) => (
          <li key={s}><div style={{ aspectRatio: String(aspectOf(s)), background: placeholderOf(s) }}><img src={variantFor(s, 480)} alt={META[s].title} loading="lazy" decoding="async" /></div><span>{creditText(s)}</span></li>
        ))}
      </ul>
    </article>
  )
}

export default function Browser() {
  const [route, setRoute] = useState(() => parse(window.location.hash))
  if (route.cat) lastCat.current = route.cat
  const go = useCallback((r) => {
    const h = hashOf(r)
    if (r.view !== 'piece') session.back = r.view === 'browse' && session.back
    setRoute(r)
    if (window.location.hash !== h) history.pushState(null, '', h)
  }, [])
  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash))
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [])
  useEffect(() => {
    if (route.view === 'browse' || route.view === 'piece') return
    const on = (e) => { if (e.key === 'Escape') go({ view: 'browse', cat: lastCat.current }) }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [route.view, go])
  useEffect(() => { document.documentElement.classList.toggle('b-lock', route.view === 'browse') }, [route.view])

  if (route.view === 'piece') return <Piece cat={route.cat} i={route.i} go={go} />
  if (route.view === 'about') return <About go={go} />
  if (route.view === 'paintings') return <Paintings go={go} />
  return <Home key={route.cat} cat={route.cat} go={go} />
}
