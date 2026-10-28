/* Redesign iteration 7. The home is a WebGL gallery that moves like the A24 film browser
   (src/gallery/Gallery.js, NOTES-A24-STUDY.md); each section has its own object and staging.
   Opening a piece is one continuous shared-element flight from the gallery into the white-paper page.
   Routes are hash-based so a plain static server works:
   #/prose  #/publications  #/luck  #/<cat>/<slug>  #/about  #/paintings */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { CATS, META, PAINTINGS, SOCIALS, variantFor, aspectOf, placeholderOf, tintOf, creditText } from './pieces'
import NOTES from './pieceNotes'
import PaperPage from './PaperPage'
import Gallery, { GLIDE, imageTexture, texture, plateSize, SECTIONS } from './gallery/Gallery'
import './styles/globals.css'
import './styles/a24.css'

const BIO = 'I’m a writer who works in medicine, or a medical person who writes. The order keeps changing.'
const pad2 = (n) => String(n).padStart(2, '0')
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isTouch = () => window.matchMedia('(max-width: 720px), (pointer: coarse)').matches
const catOf = (id) => CATS.find((c) => c.id === id) || CATS[0]
const lastIdx = { prose: 0, publications: 0, luck: 0 }
const lastCat = { current: 'prose' }
// a hash deep-link (#/prose/…, #/about…) skips the name-first opening
const session = { introDone: typeof location !== "undefined" && /^#\/./.test(location.hash) }
const WIDE = '"Lora", Georgia, serif'
const LABEL = '"Archivo", "Helvetica Neue", Arial, sans-serif'
const BOOK = '"Lora", Georgia, serif'
const TONE = { prose: 'rgb(242,242,240)', publications: 'rgb(235,238,241)', luck: 'rgb(244,238,228)' }
const bgFor = (it) => it.cat === 'prose' && it.src ? tintOf(it.src, 0.06) : TONE[it.cat]
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function parse(h) {
  const p = (h || '').replace(/^#\/?/, '').split('/').filter(Boolean)
  if (p[0] === 'about') return { view: 'about' }
  if (p[0] === 'paintings') return { view: 'paintings' }
  const cat = CATS.some((c) => c.id === p[0]) ? p[0] : 'prose'
  if (p[1]) {
    const i = catOf(cat).items.findIndex((x) => x.slug === p[1])
    if (i >= 0) return { view: 'piece', cat, i }
  }
  return { view: 'browse', cat }
}
const hashOf = (r) => r.view === 'piece' ? `#/${r.cat}/${catOf(r.cat).items[r.i].slug}` : r.view === 'browse' ? `#/${r.cat}` : `#/${r.view}`

/* ---------------- canvas faces (only real data) ---------------- */
let fontsP = null
const fontsReady = () => fontsP || (fontsP = document.fonts ? Promise.all([document.fonts.load(`700 40px "Archivo"`), document.fonts.load('600 20px "Archivo"'), document.fonts.load('400 20px "Archivo"'), document.fonts.load('italic 400 30px "Lora"'), document.fonts.load('700 40px "Lora"'), document.fonts.load('600 30px "Lora"'), document.fonts.ready]).catch(() => {}) : Promise.resolve())
const CANVAS = new Map()
function wrap(ctx, text, maxW) {
  const words = String(text || '').split(/\s+/).filter(Boolean), lines = []
  let line = ''
  for (const w of words) { const t = line ? `${line} ${w}` : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w } else line = t }
  if (line) lines.push(line)
  return lines
}
function grain(ctx, W, H, k) {
  // a fixed, seeded paper grain so a face never shimmers between renders
  const img = ctx.getImageData(0, 0, W, H), d = img.data
  let s = 7
  for (let j = 0; j < d.length; j += 4) { s = (s * 16807) % 2147483647; const n = ((s / 2147483647) - 0.5) * k; d[j] += n; d[j + 1] += n; d[j + 2] += n }
  ctx.putImageData(img, 0, 0)
}
function fitTitle(ctx, text, maxW, maxH, from, min, lh, weight = 700) {
  let fs = from, lines
  for (; fs > min; fs -= 3) { ctx.font = `${weight} ${fs}px ${WIDE}`; ctx.fontStretch = 'normal'; lines = wrap(ctx, text, maxW); if (lines.length * fs * lh < maxH && lines.every((l) => ctx.measureText(l).width <= maxW)) break }
  return { fs, lines }
}
const smallCaps = (ctx, size, track = 4) => { ctx.font = `600 ${size}px ${LABEL}`; ctx.fontStretch = 'normal'; ctx.letterSpacing = `${track}px` }
function drawFace(key, aspect, draw) {
  if (CANVAS.has(key)) return CANVAS.get(key)
  const H = 1024, W = Math.round(H * aspect)
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.textBaseline = 'top'
  draw(ctx, W, H)
  CANVAS.set(key, c)
  return c
}
const faceKey = (it, side) => `${it.cat}:${it.slug}:${side}`
function faceCanvas(it, side) {
  const sec = SECTIONS[it.cat], [w, h] = plateSize({ aspect: it.src ? aspectOf(it.src) : 0.74 }, sec), aspect = w / h
  const key = faceKey(it, side)
  if (it.cat === 'publications' && side === 'front') return drawFace(key, aspect, (ctx, W, H) => {
    ctx.fillStyle = '#f9f8f4'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(0,0,0,.05)'; ctx.fillRect(0, 0, 14, H)            // the fold by the spine
    grain(ctx, W, H, 9)
    const m = W * 0.1
    ctx.fillStyle = '#151515'
    smallCaps(ctx, 20); ctx.fillText(String(it.kind || '').toUpperCase(), m, m)
    ctx.fillRect(m, m + 38, W - 2 * m, 2)
    ctx.letterSpacing = '0px'
    const { fs, lines } = fitTitle(ctx, it.title, W - 2 * m, H * 0.56, 84, 34, 1.08)
    lines.forEach((l, k) => ctx.fillText(l, m, m + 80 + k * fs * 1.08))
    ctx.fillRect(m, H - m - 78, W - 2 * m, 2)
    smallCaps(ctx, 18, 3)
    wrap(ctx, String(it.cover || '').toUpperCase(), W - 2 * m).slice(0, 2).forEach((l, k) => ctx.fillText(l, m, H - m - 60 + k * 26))
    ctx.textAlign = 'right'; ctx.fillText('SHANMU RAJA', W - m, H - m - 6)
  })
  if (it.cat === 'luck' && side === 'front') return drawFace(key, aspect, (ctx, W, H) => {
    ctx.fillStyle = '#fbf6ea'; ctx.fillRect(0, 0, W, H)
    grain(ctx, W, H, 7)
    ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.strokeRect(34, 34, W - 68, H - 68); ctx.lineWidth = 1; ctx.strokeRect(46, 46, W - 92, H - 92)
    ctx.fillStyle = '#151515'; ctx.textAlign = 'center'
    smallCaps(ctx, 20, 5); ctx.fillText(String(it.kind || '').toUpperCase(), W / 2, 110)
    ctx.fillRect(W / 2 - 40, 150, 80, 2)
    ctx.letterSpacing = '0px'
    const { fs, lines } = fitTitle(ctx, it.title.toUpperCase(), W - 220, H * 0.5, 104, 40, 1.0)
    const y0 = H / 2 - (lines.length * fs) / 2 + 20
    lines.forEach((l, k) => ctx.fillText(l, W / 2, y0 + k * fs))
    smallCaps(ctx, 18, 4); ctx.fillText('SHANMU RAJA', W / 2, H - 120)
  })
  // the back of every object: a label in the language of its section
  return drawFace(key, aspect, (ctx, W, H) => {
    ctx.fillStyle = it.cat === 'luck' ? '#f6efe0' : '#f7f6f2'; ctx.fillRect(0, 0, W, H)
    grain(ctx, W, H, 6)
    const m = W * 0.1, maxW = W - 2 * m
    ctx.fillStyle = '#161616'
    smallCaps(ctx, 18, 4); ctx.fillText(it.cat === 'prose' ? String(it.kind || 'Prose').toUpperCase() : it.cat === 'publications' ? 'ABSTRACT' : 'CITATION', m, m)
    ctx.fillRect(m, m + 34, maxW, 2)
    ctx.letterSpacing = '0px'
    const t = fitTitle(ctx, it.title.toUpperCase(), maxW, H * 0.24, 56, 28, 1.02)
    t.lines.forEach((l, k) => ctx.fillText(l, m, m + 66 + k * t.fs * 1.02))
    let y = m + 66 + t.lines.length * t.fs * 1.02 + 30
    const body = it.cat === 'prose' ? it.line : it.line
    if (body) {
      ctx.font = `italic 400 32px ${BOOK}`; ctx.fontStretch = 'normal'; ctx.letterSpacing = '0px'
      const ls = wrap(ctx, it.cat === 'prose' ? `“${body}”` : body, maxW)
      ls.slice(0, 9).forEach((l, k) => ctx.fillText(l, m, y + k * 38)); y += Math.min(9, ls.length) * 38 + 24
    }
    const rows = it.meta.filter(([, v]) => v).slice(0, 4)
    const top = H - m - rows.length * 52
    rows.forEach(([k, v], n) => {
      const ry = top + n * 52
      ctx.fillRect(m, ry, maxW, 1)
      smallCaps(ctx, 14, 3); ctx.textAlign = 'left'; ctx.fillText(k.toUpperCase(), m, ry + 18)
      ctx.font = `400 21px ${WIDE}`; ctx.fontStretch = 'normal'; ctx.letterSpacing = '0px'; ctx.textAlign = 'right'
      let s = String(v); while (ctx.measureText(s).width > maxW * 0.7 && s.length > 4) s = s.slice(0, -2)
      ctx.fillText(s === String(v) ? s : `${s.trim()}…`, W - m, ry + 15)
    })
    ctx.textAlign = 'left'
  })
}
const canvasTexture = (c) => { const t = new THREE.CanvasTexture(c); return t }
const frontTexture = (it) => it.cat === 'prose' && it.src ? imageTexture(variantFor(it.src, 900)) : texture(faceKey(it, 'front'), () => fontsReady().then(() => canvasTexture(faceCanvas(it, 'front'))))
const backTexture = (it) => texture(faceKey(it, 'back'), () => fontsReady().then(() => canvasTexture(faceCanvas(it, 'back'))))
const URLS = new Map()
const faceURL = (it, side) => {
  if (side === 'front' && it.cat === 'prose' && it.src) return variantFor(it.src, 900)
  const k = faceKey(it, side)
  if (!URLS.has(k)) URLS.set(k, faceCanvas(it, side).toDataURL('image/jpeg', 0.92))
  return URLS.get(k)
}
/* the page shows the very same face the gallery showed, so the hand-off is invisible */
function useFaceURL(it) {
  const [u, setU] = useState(() => (it.cat === 'prose' && it.src) || CANVAS.has(faceKey(it, 'front')) ? faceURL(it, 'front') : null)
  useEffect(() => { let on = true; if (!u) fontsReady().then(() => on && setU(faceURL(it, 'front'))); return () => { on = false } }, [it, u])
  return u
}

function itemsFor(cat) {
  return catOf(cat).items.map((it) => ({ ...it, aspect: it.src ? aspectOf(it.src) : 0.74, placeholder: it.cat === 'prose' && it.src ? placeholderOf(it.src) : '#f9f8f4' }))
}

/* ---------------- the shared-element flight ----------------
   A DOM clone of the object's face(s) that rides between the WebGL plate and the page image.
   It starts exactly over the face-on plate (same image, same pixels), so the swap at either end is invisible. */
const FLY = { node: null, dir: null, data: null }
function flyNode(rect, it, back) {
  flyClear()
  const n = document.createElement('div')
  n.className = 'fly'
  n.innerHTML = '<div class="fly-in"><img class="fly-f" alt=""><img class="fly-b" alt=""></div>'
  n.querySelector('.fly-f').src = faceURL(it, 'front')
  n.querySelector('.fly-b').src = faceURL(it, 'back')
  Object.assign(n.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` })
  n.querySelector('.fly-in').style.transform = back ? 'rotateY(180deg)' : 'none'
  document.body.appendChild(n)
  FLY.node = n
  return n
}
function flyClear() { if (FLY.node) { gsap.killTweensOf(FLY.node); gsap.killTweensOf(FLY.node.firstChild); FLY.node.remove() } FLY.node = null; FLY.dir = null; FLY.data = null }
function flyTo(rect, { back = false, duration = 0.85 } = {}) {
  const n = FLY.node
  if (!n) return Promise.resolve()
  const r0 = n.getBoundingClientRect()
  Object.assign(n.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` })
  // FLIP: animate transform from the old box to the new one, then flatten
  const sx = r0.width / rect.w, sy = r0.height / rect.h, dx = r0.left - rect.x, dy = r0.top - rect.y
  return new Promise((done) => {
    if (reduced()) { done(); return }
    gsap.fromTo(n, { x: dx, y: dy, scaleX: sx, scaleY: sy }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration, ease: GLIDE, transformOrigin: '0 0', onComplete: done })
    gsap.to(n.firstChild, { rotateY: back ? 180 : 0, duration: duration * 0.95, ease: GLIDE })
  })
}
const rectOfEl = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height } }
const decoded = (img) => img && img.decode ? Promise.race([img.decode().catch(() => {}), wait(1200)]) : Promise.resolve()
const frames = (n = 2) => new Promise((r) => { const f = (k) => (k ? requestAnimationFrame(() => f(k - 1)) : r()); f(n) })

function scribblePath(w, h, seed) {
  let s = seed * 9301 + 49297
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const cx = w / 2, cy = h / 2, rx = w / 2, ry = h / 2, n = 24
  const turns = 1.14, a0 = -Math.PI * 0.62 + rnd() * 0.3
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
function Scribble({ w, h, on, pad = 0.14, redraw }) {
  const [seed, setSeed] = useState(1)
  // every time the ring turns on, or the route/section under it changes, the pen draws the whole
  // closed loop again from nothing (fresh key = the CSS draw animation restarts from dashoffset 1)
  const [pass, setPass] = useState(0)
  useEffect(() => { if (on) setPass((x) => x + 1) }, [on, redraw])
  useEffect(() => {
    if (!on || reduced()) return
    const t = setInterval(() => setSeed((x) => x + 1), 100)
    return () => clearInterval(t)
  }, [on])
  if (!w || !h) return null
  const W = w * (1 + pad * 2), H = h * (1 + pad * 2)
  return (
    <svg className={`scr${on ? ' is-on' : ''}`} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ left: -w * pad, top: -h * pad }} aria-hidden="true">
      <path key={pass} d={scribblePath(W, H, seed)} pathLength="1" />
    </svg>
  )
}
function CatRing({ on, redraw }) {
  const ref = useRef(null)
  const [s, setS] = useState(null)
  useLayoutEffect(() => { const p = ref.current && ref.current.parentElement; if (p) setS({ w: p.offsetWidth, h: p.offsetHeight }) }, [])
  return <span ref={ref} className="h-cat-ring">{s && <Scribble w={s.w} h={s.h} on={on} redraw={redraw} pad={0.16} />}</span>
}
/* One top bar everywhere: name left, the three wheel sections + the two pages right, contact quiet at the end */
function SiteNav({ go, active, className = '', onHover }) {
  const [hov, setHov] = useState(null)
  const h = (id) => { setHov(id); if (onHover) onHover(id) }
  const item = (id, label, r, n) => (
    <a key={id} href={`#/${id}`} className={id === active ? 'is-on' : ''} aria-current={id === active ? 'page' : undefined}
      onMouseEnter={() => h(id)} onMouseLeave={() => h(null)} onFocus={() => h(id)} onBlur={() => h(null)}
      onClick={(e) => { e.preventDefault(); if (e.detail) e.currentTarget.blur(); go(r) }}>
      <span className="h-cat-l">{label}<CatRing on={hov === id || (hov === null && id === active)} redraw={active} /></span>{n != null && <sup>{n}</sup>}
    </a>
  )
  return (
    <header className={`sn ${className}`}>
      <a className="h-mark" href="#/prose" onClick={(e) => { e.preventDefault(); if (e.detail) e.currentTarget.blur(); go({ view: 'browse', cat: 'prose' }) }}>Shanmu Raja</a>
      <nav className="sn-nav h-nav" aria-label="Sections">
        {CATS.map((c) => item(c.id, c.label, { view: 'browse', cat: c.id }, c.items.length))}
        <i className="sn-sep" aria-hidden="true" />
        {item('paintings', 'Paintings', { view: 'paintings' })}
        {item('about', 'About', { view: 'about' })}
      </nav>
      <a className="sn-mail" href="mailto:shanmur@uclawsf.edu">Contact</a>
    </header>
  )
}
function Socials({ className = '' }) {
  return (
    <nav className={`h-social ${className}`} aria-label="Elsewhere">
      {SOCIALS.map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" aria-label={l} data-l={l}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{ICONS[l.toLowerCase()]}</svg></a>)}
    </nav>
  )
}
const ICONS = {
  medium: <path d="M2.5 5.5h6.6l3.1 7.4 3-7.4H21.5v.4l-1.6 1.5v8.7l1.6 1.5v.4h-6.4v-.4l1.7-1.6v-7.6l-3.9 9.6h-.5l-4.4-9.6v6.6l1.9 2.2v.4H4.7v-.4l1.9-2.2V7.4L4.5 5.9v-.4z" />,
  substack: <path d="M5 4.5h14v2.2H5V4.5zM5 8.6h14v2.2H5V8.6zM5 12.7l7 3.9 7-3.9V20l-7-3.9L5 20v-7.3z" />,
  instagram: <><rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.4" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="17" cy="7" r="1.2" /></>,
  linkedin: <path d="M4.5 4.5h15v15h-15v-15zm3.1 5.6H6.1v7.3h1.5v-7.3zm-.75-2.5a.9.9 0 100 1.8.9.9 0 000-1.8zm9.65 4.6c0-1.7-1-2.4-2.2-2.4-1 0-1.5.55-1.7.95v-.85h-1.5v7.3h1.5v-4c0-1 .65-1.3 1.15-1.3.5 0 .95.35.95 1.25v4.05h1.5v-4.35z" />,
  x: <path d="M5 4.5h3.6l3.3 4.7 3.8-4.7H19l-5.2 6.3L19.6 19.5H16l-3.7-5.2-4.2 5.2H5.4l5.6-6.8L5 4.5zm2.1 1.2l9.1 12.6h1.6L8.7 5.7H7.1z" />,
}
/* ---------------- navigation: one transition at a time; the latest request waits its turn ---------------- */
const NAV = { busy: false, pending: null, hold: null, dir: 0 }
const HOME = { api: null }
const PAGE = { api: null }
function fadeOutPage() {
  const el = document.querySelector('.pg')
  if (!el || reduced()) return Promise.resolve()
  el.classList.add('is-leaving')
  return wait(360)
}

function Home({ cat, go }) {
  const host = useRef(null), gal = useRef(null), ring = useRef(null), mainRef = useRef(null)
  const items = catOf(cat).items
  const returning = FLY.dir === 'out' && FLY.data && FLY.data.cat === cat
  const [cur, setCur] = useState(lastIdx[cat] || 0)
  const [shown, setShown] = useState(cat)            // the section whose objects are on screen
  const [hov, setHov] = useState(-1)
  const [phase, setPhase] = useState(session.introDone || reduced() ? (returning ? 'return' : 'enter') : 'loading')
  const [box, setBox] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const [bgOn, setBgOn] = useState(false)
  // name-first opening: the wordmark sits alone, centred, then flies to its place in the bar
  const [nameOn, setNameOn] = useState(() => !session.introDone && !reduced() && !returning)
  const [fontOk, setFontOk] = useState(false)
  const nameRef = useRef(null)
  const hovRef = useRef(-1)
  const goRef = useRef(go); goRef.current = go
  const token = useRef(0)

  useLayoutEffect(() => {
    const el = host.current
    const g = gal.current = new Gallery(el, {
      touch: isTouch, frontTexture, backTexture,
      onChange: (i) => { lastIdx[g.mode] = i; setCur(i) },
      onHover: (i) => { hovRef.current = i; setHov(i) },
      onOpen: (i) => goRef.current({ view: 'piece', cat: g.mode, i }),
      onFrame: () => {
        const r = ring.current
        if (!r || hovRef.current < 0 || hovRef.current !== g.index()) return
        const b = g.rectOf(g.index())
        if (!b) return
        r.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`
        if (!r._b || Math.abs(r._b.w - b.w) > 2 || Math.abs(r._b.h - b.h) > 2) { r._b = { w: b.w, h: b.h }; setBox(r._b) }
      },
    })
    g.setSection(itemsFor(cat), cat, lastIdx[cat] || 0)
    g.tone(bgFor(items[g.index()]))
    let live = true
    requestAnimationFrame(() => live && setBgOn(true))
    if (returning) {
      // coming back from a page: the page image is already in the air (FLY); land it on its object
      const d = FLY.data
      const rect = g.prepareReturn(false)
      const p = g.plates[g.index()]
      NAV.hold = Promise.race([p.ready, wait(600)]).then(() => flyTo(rect, { back: false, duration: 0.8 }))
        .then(() => frames(1)).then(() => { if (!live) return; const l = g.land(); return frames(2).then(() => { flyClear(); return l }) })
        .then(() => { if (live) setPhase('ready') })
      void d
    } else if (!session.introDone && !reduced()) {
      const near = g.plates.filter((p) => Math.abs(p.i - g.L) <= 3)
      const ready = Promise.race([Promise.all(near.map((p) => p.ready)), wait(4000)])
      g.G.active = 0.001; g.G.others = 0
      const fonts = Promise.race([document.fonts ? document.fonts.load('700 100px "Lora"') : null, wait(700)]).catch(() => {})
      const t0 = performance.now()
      fonts.then(() => live && setFontOk(true))
      NAV.hold = Promise.all([ready, fonts]).then(() => {
        if (!live) return
        session.introDone = true
        try { g.warm() } catch { /* best effort */ }
        // hold: rise (0.15 + 0.9s) plus a beat, at least ~1.7s from first paint
        return wait(Math.max(300, 1750 - (performance.now() - t0)))
          .then(() => { if (!live) return; setPhase('fly'); return frames(1) })
          .then(() => { if (!live) return; flipName(); return wait(380) })
          .then(() => { if (!live) return; setPhase('intro'); wait(760).then(() => live && setNameOn(false)); return g.intro() })
          .then(() => live && setPhase('ready'))
      })
    } else {
      g.G.active = reduced() ? 1 : 0.001; g.G.others = reduced() ? 1 : 0; g.G.inbound = true
      NAV.hold = g.fan().then(() => live && setPhase('ready'))
    }
    return () => { live = false; HOME.api = null; g.destroy(); gal.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* section switch: the row falls back, the new objects fan in, the background eases across */
  useEffect(() => {
    const g = gal.current
    if (!g || g.mode === cat) return
    const t = ++token.current
    setPhase('switch')
    NAV.hold = g.exit().then(() => {
      if (t !== token.current || !gal.current) return
      g.setSection(itemsFor(cat), cat, lastIdx[cat] || 0)
      g.G.active = reduced() ? 1 : 0.001; g.G.others = reduced() ? 1 : 0
      g.tone(bgFor(catOf(cat).items[g.index()]))
      setShown(cat); setCur(g.index())
      return g.fan().then(() => { if (t === token.current) setPhase('ready') })
    })
  }, [cat])

  // FLIP: measure the centred name and the real wordmark, then glide one onto the other
  const flipName = () => {
    const n = nameRef.current, m = mainRef.current && mainRef.current.querySelector('.sn .h-mark')
    if (!n || !m) return
    // measure the glyphs, not the boxes: the wordmark's link can be stretched by its grid cell
    const ink = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect() }
    const o = n.getBoundingClientRect(), oi = ink(n.querySelector('.h-iname-m > span')), r = ink(m)
    const s = r.width / oi.width
    n.style.transition = 'transform 1.1s cubic-bezier(.32,.72,0,1)'
    n.style.transform = `translate(${(-o.width / 2 + (r.left - (oi.left - o.left) * s) - o.left).toFixed(2)}px, ${(-o.height / 2 + (r.top - (oi.top - o.top) * s) - o.top).toFixed(2)}px) scale(${s.toFixed(4)})`
  }

  useEffect(() => {
    HOME.api = {
      // open the front object: it turns face-on, the DOM clone takes over in exactly the same spot
      open: async () => {
        const g = gal.current
        if (!g || !g.N) return null
        const { i, back } = await g.openFace()
        const it = catOf(g.mode).items[i]
        const n = flyNode(g.rectOf(i), it, back)
        await Promise.all([...n.querySelectorAll('img')].map(decoded))
        await frames(1)
        g.hidePlate(i)
        FLY.dir = 'in'; FLY.data = { cat: g.mode, i, back }
        setLeaving(true)
        return i
      },
      leave: async () => { const g = gal.current; setLeaving(true); if (g) await g.exit() },
      index: () => (gal.current ? gal.current.index() : 0),
    }
  })

  useEffect(() => {
    const on = (e) => {
      const g = gal.current
      if (!g || g.busy() || NAV.busy) return
      if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return
      const free = !(document.activeElement && document.activeElement.closest('a, button'))
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); g.step(1, 'key') }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); g.step(-1, 'key') }
      else if (e.key === 'Enter' && free) { e.preventDefault(); goRef.current({ view: 'piece', cat: g.mode, i: g.index() }) }
      else if (e.key === ' ' && free) { e.preventDefault(); g.flip() }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  const list = catOf(shown).items
  const it = list[Math.min(cur, list.length - 1)]
  useEffect(() => { if (gal.current && it) gal.current.tone(bgFor(it)) }, [it])
  const meta = it.meta.filter(([, v]) => v).slice(0, 4)
  const show = phase === 'ready' && !leaving
  const chrome = phase !== 'loading' && !leaving
  const foot = chrome && phase !== 'fly' && phase !== 'intro'
  return (
    <main ref={mainRef} className={`h h-${phase} h-m-${shown}${leaving ? ' is-leaving' : ''}${nameOn ? ' h-naming' : ''}`} style={{ background: (bgOn || nameOn) && !leaving ? bgFor(it) : '#fff' }}
      aria-label={`${catOf(shown).label}. ${list.length} pieces. Arrow keys to move, Enter to open, Space to turn it over.`}>
      <div className="h-gl" ref={host} />
      <div className="h-ring" ref={ring} aria-hidden="true"><Scribble w={box && box.w} h={box && box.h} on={hov >= 0 && hov === cur && show} redraw={cur} pad={0.09} /></div>

      <SiteNav go={go} active={cat} className={`h-top${chrome ? ' is-on' : ''}`} />

      <section className={`h-info${show ? ' is-on' : ''}`} key={`${shown}-${cur}`} aria-live="polite">
        <h1 className="h-title"><a href={`#/${shown}/${it.slug}`} onClick={(e) => { e.preventDefault(); go({ view: 'piece', cat: shown, i: cur }) }}>{it.title}</a></h1>
        <dl className="h-meta">
          {meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>

      {it.line && <blockquote className={`h-quote${show ? ' is-on' : ''}`} key={`q-${shown}-${cur}`}>{it.line}</blockquote>}


      <div className={`h-foot${foot ? ' is-on' : ''}`}>
        <button type="button" className="h-count" aria-label="Next piece" onClick={() => { const g = gal.current; if (g && !g.busy()) g.to((g.settled() + 1) % g.N, 'click') }}>
          {pad2(cur + 1)} <i>/</i> {pad2(list.length)}
        </button>
      </div>
      {/* iteration 10: socials live bottom-left, away from the counter and the screen corner */}
      <div className={`h-sfoot${foot ? ' is-on' : ''}`}><Socials /></div>

      {nameOn && (
        <div ref={nameRef} className={`h-iname${fontOk ? ' is-f' : ''}`} aria-hidden="true">
          <span className="h-iname-m"><span>Shanmu Raja</span></span>
        </div>
      )}
      <p className={`h-hint${foot ? ' is-on' : ''}`} aria-hidden="true">{isTouch() ? 'Swipe' : shown === 'luck' ? 'Scroll or drag up and down' : 'Scroll, drag, or use the arrow keys'}</p>
    </main>
  )
}

function PageTop({ back, backLabel, go, right, active }) {
  return (
    <>
      <SiteNav go={go} active={active} className="pg-sn" />
      <div className="pg-top">
        <a href="#/" className="pg-back" onClick={(e) => { e.preventDefault(); back() }}><span aria-hidden="true">←</span> {backLabel}</a>
        <span className="pg-count">{right}</span>
      </div>
    </>
  )
}

function Piece({ cat, i, go }) {
  const items = catOf(cat).items
  const it = items[i]
  const note = NOTES[`${cat}/${it.slug}`]
  const prev = (i - 1 + items.length) % items.length, next = (i + 1) % items.length
  const art = useRef(null)
  const flying = FLY.dir === 'in' && FLY.data && FLY.data.cat === cat && FLY.data.i === i
  const [hold, setHold] = useState(flying)
  const dir = NAV.dir
  const face = useFaceURL(it)
  const ar = it.src ? aspectOf(it.src) : SECTIONS[cat].aspect
  const goRef = useRef(go); goRef.current = go

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    NAV.dir = 0
    if (!flying) return
    let live = true
    const back = FLY.data.back
    NAV.hold = flyTo(rectOfEl(art.current), { back: false, duration: back ? 0.95 : 0.85 })
      .then(() => decoded(art.current && art.current.querySelector('img')))
      .then(() => { if (!live) return; setHold(false); return frames(2) })
      .then(() => { if (FLY.dir === 'in') flyClear() })
    void back
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    PAGE.api = {
      // leaving for the gallery: the page image lifts off and rides back to its object
      toGallery: async () => {
        const a = art.current, img = a && a.querySelector('img')
        if (!a || !img || reduced()) return fadeOutPage()
        const b = a.getBoundingClientRect()
        if (b.bottom < 0 || b.top > window.innerHeight) return fadeOutPage()
        const n = flyNode(rectOfEl(a), it, false)
        await Promise.all([...n.querySelectorAll('img')].map(decoded))
        a.style.visibility = 'hidden'
        FLY.dir = 'out'; FLY.data = { cat, i, back: false }
        lastIdx[cat] = i
        return fadeOutPage()
      },
    }
    return () => { PAGE.api = null }
  })

  useEffect(() => {
    const on = (e) => { if (e.key === 'Escape') goRef.current({ view: 'browse', cat }) }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [cat])

  const meta = it.meta.filter(([, v]) => v)
  const cta = it.href
    ? <a className="pg-cta-a" href={it.href} target="_blank" rel="noreferrer"><span>{it.cta}</span><b aria-hidden="true">↗</b></a>
    : it.internal ? <a className="pg-cta-a" href={it.internal}><span>{it.cta}</span><b aria-hidden="true">→</b></a>
      : it.cta ? <span className="pg-cta-a is-muted"><span>{it.cta}</span></span> : null
  const credit = it.src ? creditText(it.src) : ''
  const honors = it.honors && it.honors.map((h) => <p key={h.href} className="pg-honor"><a href={h.href} onClick={(e) => { e.preventDefault(); go(parse(h.href)) }}>{h.text}</a></p>)
  const pgNav = (
    <nav className="pg-nav">
      <a href={`#/${cat}/${items[prev].slug}`} onClick={(e) => { e.preventDefault(); go({ view: 'piece', cat, i: prev }) }}><small>Previous</small>{items[prev].title}</a>
      <a href={`#/${cat}/${items[next].slug}`} onClick={(e) => { e.preventDefault(); go({ view: 'piece', cat, i: next }) }}><small>Next</small>{items[next].title}</a>
    </nav>
  )
  if (cat === 'publications') {
    return (
      <PaperPage
        it={it} honors={honors} nav={pgNav}
        top={<PageTop back={() => go({ view: 'browse', cat })} backLabel={catOf(cat).label} active={cat} go={go} right={`${pad2(i + 1)} / ${pad2(items.length)}`} />}
        cover={<div ref={art} className="pg-art" style={{ '--ar': ar, aspectRatio: String(ar), background: '#f9f8f4', visibility: hold ? 'hidden' : undefined }}>{face && <img src={face} alt={`${it.title}, cover`} decoding="async" />}</div>}
      />
    )
  }
  return (
    <article className={`pg pg-piece pg-c-${cat}${flying ? ' is-flown' : ' is-direct'}${dir ? ` is-step is-step-${dir > 0 ? 'n' : 'p'}` : ''}`}>
      <PageTop back={() => go({ view: 'browse', cat })} backLabel={catOf(cat).label} active={cat} go={go} right={`${pad2(i + 1)} / ${pad2(items.length)}`} />
      <div className="pg-head">
        <i className="pg-x pg-x-l" aria-hidden="true" /><i className="pg-x pg-x-r" aria-hidden="true" />
        <h1 className="pg-title"><span>{it.title}</span></h1>
        <hr className="pg-rule" />
        <p className="pg-by"><span>{it.by}</span></p>
        {honors}
      </div>
      <div className="pg-body">
        <figure className="pg-fig">
          <div ref={art} className="pg-art" style={{ '--ar': ar, aspectRatio: String(ar), background: it.src && cat === 'prose' ? placeholderOf(it.src) : '#f9f8f4', visibility: hold ? 'hidden' : undefined }}>
            {face && <img src={it.src && cat === 'prose' ? variantFor(it.src, 1400) : face} alt={cat === 'prose' ? credit : `${it.title}, cover`} decoding="async" />}
          </div>
          {cat === 'prose' && credit && <figcaption>{credit}</figcaption>}
        </figure>
        <div className="pg-side">
          <dl className="pg-meta">
            {meta.map(([k, v], n) => <div key={k} style={{ '--n': n }}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          {cta && <div className="pg-cta">{cta}</div>}
          {it.quote && <blockquote className="pg-quote"><span>{it.quote}</span></blockquote>}
          {cat !== 'prose' && it.line && <p className="pg-line">{it.line}</p>}
          {cat !== 'prose' && it.src && credit && <p className="pg-credit">Painting: {credit}</p>}
        </div>
      </div>
      {note ? <section className="pg-note"><h2>On the painting</h2><p>{note}</p></section> : null}
      {pgNav}
    </article>
  )
}

function About({ go }) {
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <article className="pg pg-about">
      <PageTop back={() => go({ view: 'browse', cat: lastCat.current })} backLabel="Back" go={go} active="about" right="" />
      <div className="pg-head"><h1 className="pg-title"><span>About</span></h1><hr className="pg-rule" /></div>
      <div className="ab">
        <img src="/headshot-700.webp" alt="Shanmu Raja" width="700" height="1049" />
        <div>
          <p className="ab-lead">{BIO}</p>
          <p>I write fiction, essays, and the occasional poem.</p>
          <p>I have a master’s from UCSF in healthcare economics and health policy. My thesis looked at access deserts in Medi-Cal. My research lives in clinical medicine and surgery.</p>
          <p>My fiction has been recognized by <em>The New Yorker</em>, the Paul Kalanithi Writing Competition, and the Massachusetts Undergraduate Poetry Festival. My research has appeared in <em>The Journal of Thoracic and Cardiovascular Surgery</em> and <em>Journal of Vascular Surgery</em>.</p>
          <p>Off the page: squash, piano, a steady diet of cinema.</p>
          <p className="ab-links"><a href="mailto:shanmur@uclawsf.edu">shanmur@uclawsf.edu</a></p>
          <Socials className="ab-social" />
        </div>
      </div>
    </article>
  )
}
function Paintings({ go }) {
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <article className="pg pg-paint">
      <PageTop back={() => go({ view: 'browse', cat: lastCat.current })} backLabel="Back" go={go} active="paintings" right={`${PAINTINGS.length} paintings`} />
      <div className="pg-head"><h1 className="pg-title"><span>Paintings</span></h1><hr className="pg-rule" /></div>
      <ul className="pt-grid">
        {PAINTINGS.map((s, n) => (
          <li key={s} style={{ '--n': Math.min(n, 12) }}><div style={{ aspectRatio: String(aspectOf(s)), background: placeholderOf(s) }}><img src={variantFor(s, 480)} alt={META[s].title} loading="lazy" decoding="async" /></div><span>{creditText(s)}</span></li>
        ))}
      </ul>
    </article>
  )
}

const same = (a, b) => hashOf(a) === hashOf(b)
export default function Browser() {
  useEffect(() => { document.documentElement.classList.remove('pre') }, [])
  const [route, setRoute] = useState(() => parse(window.location.hash))
  const routeRef = useRef(route); routeRef.current = route
  if (route.cat) lastCat.current = route.cat

  const go = useCallback(async (r, opts = {}) => {
    if (NAV.busy) { NAV.pending = [r, opts]; return }
    const from = routeRef.current
    if (same(from, r)) { if (opts.pop) return; return }
    NAV.busy = true; NAV.to = r
    try {
      if (NAV.hold && !(from.view === 'browse' && r.view === 'browse')) { await Promise.race([NAV.hold, wait(2500)]); NAV.hold = null }
      if (from.view === 'browse') {
        if (r.view === 'piece' && HOME.api && r.cat === from.cat) {
          if (HOME.api.index() !== r.i) r = { ...r, i: HOME.api.index() }
          if (!reduced()) await HOME.api.open()
        } else if (r.view !== 'browse' && HOME.api && !reduced()) await HOME.api.leave()
      } else if (from.view === 'piece' && r.view === 'piece' && r.cat === from.cat) {
        NAV.dir = (r.i > from.i && !(from.i === 0 && r.i === catOf(r.cat).items.length - 1)) || (from.i === catOf(r.cat).items.length - 1 && r.i === 0) ? 1 : -1
        if (!reduced()) { const el = document.querySelector('.pg'); if (el) { el.classList.add(NAV.dir > 0 ? 'is-out-n' : 'is-out-p'); await wait(240) } }
      } else if (from.view === 'piece' && r.view === 'browse' && r.cat === from.cat && PAGE.api) await PAGE.api.toGallery()
      else if (from.view !== 'browse') await fadeOutPage()
    } catch (e) { void e }
    const h = hashOf(r)
    routeRef.current = r
    setRoute(r)
    if (!opts.pop && window.location.hash !== h) history.pushState(null, '', h)
    else if (opts.pop && window.location.hash !== h) history.replaceState(null, '', h)
    await frames(2)
    NAV.busy = false; NAV.to = null
    if (NAV.pending) { const [p, o] = NAV.pending; NAV.pending = null; go(p, o) }
  }, [])

  useEffect(() => {
    const on = () => go(parse(window.location.hash), { pop: true })
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [go])
  useEffect(() => {
    if (route.view === 'browse' || route.view === 'piece') return
    const on = (e) => { if (e.key === 'Escape') go({ view: 'browse', cat: lastCat.current }) }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [route.view, go])
  useEffect(() => { document.documentElement.classList.toggle('b-lock', route.view === 'browse') }, [route.view])
  useEffect(() => {
    // Esc pressed while a transition is still running: queue the way back instead of dropping it
    const on = (e) => {
      if (e.key !== 'Escape' || !NAV.busy) return
      const pend = NAV.pending && NAV.pending[0]
      const to = pend || NAV.to || routeRef.current
      if (to.view !== 'browse') NAV.pending = [{ view: 'browse', cat: to.cat || lastCat.current }, {}]
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  if (route.view === 'piece') return <Piece key={`${route.cat}-${route.i}`} cat={route.cat} i={route.i} go={go} />
  if (route.view === 'about') return <About go={go} />
  if (route.view === 'paintings') return <Paintings go={go} />
  return <Home cat={route.cat} go={go} />
}
