/* Redesign iteration 7. The home is a WebGL gallery that moves like the A24 film browser
   (src/gallery/Gallery.js, NOTES-A24-STUDY.md); each section has its own object and staging.
   Opening a piece is one continuous shared-element flight from the gallery into the white-paper page.
   Routes are hash-based so a plain static server works:
   #/prose  #/publications  #/luck  #/<cat>/<slug>  #/about  #/paintings */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import OPENING from './opening'
import { CATS, META, PAINTINGS, SOCIALS, SELECTED_ITEMS, variantFor, aspectOf, placeholderOf, tintOf, creditText } from './pieces'
import NOTES from './pieceNotes'
import PaperPage from './PaperPage'
import Gallery, { GLIDE, imageTexture, texture, plateSize, SECTIONS } from './gallery/Gallery'
import './styles/globals.css'
import './styles/a24.css'
import './styles/flow.css'
import './styles/pages17.css'

const BIO = 'I’m a writer who works in medicine, or a medical person who writes. The order keeps changing.'
const norm = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const pad2 = (n) => String(n).padStart(2, '0')
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isTouch = () => window.matchMedia('(max-width: 720px), (pointer: coarse)').matches
// iteration 12: home is its own row, "Selected", a hand-picked mix (src/selected.js)
const HOME_CAT = { id: 'home', label: 'Selected', items: SELECTED_ITEMS }
const catOf = (id) => (id === 'home' ? HOME_CAT : CATS.find((c) => c.id === id) || CATS[0])
const lastIdx = { home: 0, prose: 0, publications: 0, deep: 0, luck: 0 }
const lastCat = { current: 'home' }
// a hash deep-link (#/prose/…, #/about…) skips the name-first opening
const session = { introDone: typeof location !== "undefined" && /^#\/./.test(location.hash) }
const WIDE = '"Lora", Georgia, serif'
const LABEL = '"Archivo", "Helvetica Neue", Arial, sans-serif'
const BOOK = '"Lora", Georgia, serif'
const TONE = { prose: 'rgb(242,242,240)', publications: 'rgb(235,238,241)', luck: 'rgb(244,238,228)', deep: 'rgb(238,236,231)' }
const bgFor = (it) => it.cat === 'prose' && it.src ? tintOf(it.src, 0.06) : TONE[it.cat]
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function parse(h) {
  const p = (h || '').replace(/^#\/?/, '').split('/').filter(Boolean)
  if (p[0] === 'about') return { view: 'about' }
  if (p[0] === 'paintings') return { view: 'browse', cat: 'paintings' }
  const cat = CATS.some((c) => c.id === p[0]) ? p[0] : 'home'
  if (p[1]) {
    const i = catOf(cat).items.findIndex((x) => x.slug === p[1])
    if (i >= 0) return { view: 'piece', cat, i }
  }
  return { view: 'browse', cat }
}
const hashOf = (r) => r.view === 'piece' ? `#/${r.cat}/${catOf(r.cat).items[r.i].slug}` : r.view === 'browse' ? (r.cat === 'home' ? '#/' : `#/${r.cat}`) : `#/${r.view}`

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
  const sec = SECTIONS[it.cat === 'deep' ? 'publications' : it.cat], [w, h] = plateSize({ aspect: it.src ? aspectOf(it.src) : 0.74 }, sec), aspect = w / h
  const key = faceKey(it, side)
  if ((it.cat === 'publications' || it.cat === 'deep') && side === 'front') return drawFace(key, aspect, (ctx, W, H) => {
    ctx.fillStyle = '#f9f8f4'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(0,0,0,.05)'; ctx.fillRect(0, 0, 14, H)            // the fold by the spine
    grain(ctx, W, H, 9)
    const m = W * 0.1
    ctx.fillStyle = '#151515'
    smallCaps(ctx, 20); ctx.fillText(String(it.kind || '').toUpperCase(), m, m)
    ctx.fillRect(m, m + 38, W - 2 * m, 2)
    ctx.letterSpacing = '0px'
    const { fs, lines } = fitTitle(ctx, it.title, W - 2 * m, H * (it.excerpt ? 0.34 : 0.5), 76, 32, 1.08)
    lines.forEach((l, k) => ctx.fillText(l, m, m + 80 + k * fs * 1.08))
    // iteration 15: who and where, then a line from the abstract, so no card front is near-empty
    let y = m + 80 + lines.length * fs * 1.08 + 4
    const who = String(it.authors || '').replace(/\s*·\s*in preparation$/, '')
    if (who) { ctx.font = `400 22px ${BOOK}`; ctx.fillStyle = '#4a4a4a'; wrap(ctx, who, W - 2 * m).slice(0, 2).forEach((l) => { ctx.fillText(l, m, y); y += 30 }); ctx.fillStyle = '#151515' }
    const room = H - m - 110 - y
    if (it.excerpt && room > 80) {
      y += 22; ctx.fillRect(m, y - 4, 60, 1.5); y += 34
      let efs = 28, ls
      for (; efs > 20; efs -= 2) { ctx.font = `italic 400 ${efs}px ${BOOK}`; ls = wrap(ctx, it.excerpt, W - 2 * m); if (ls.length * efs * 1.3 < room - 60) break }
      const max = Math.max(1, Math.floor((room - 60) / (efs * 1.3)))
      ls.slice(0, max).forEach((l, k) => ctx.fillText(k === max - 1 && ls.length > max ? `${l.replace(/[\s,.;:]+\S*$/, '')}…` : l, m, y + k * efs * 1.3))
    }
    ctx.fillRect(m, H - m - 78, W - 2 * m, 2)
    smallCaps(ctx, 18, 3)
    wrap(ctx, String(it.cover || '').toUpperCase(), W - 2 * m).slice(0, 2).forEach((l, k) => ctx.fillText(l, m, H - m - 60 + k * 26))
    ctx.textAlign = 'right'; ctx.fillText('SHANMU RAJA', W - m, H - m - 6)
  })
  if (it.cat === 'luck' && side === 'front') return drawFace(key, aspect, (ctx, W, H) => {
    // iteration 17: each recognition is a different object (plaque, certificate, placard, label)
    const form = LUCK_FORM[it.slug] || 'label'
    const bg = { plaque: '#141414', cert: '#ebeef1', placard: '#f6efe0', label: '#fbf6ea' }[form], fg = form === 'plaque' ? '#fbf6ea' : '#151515'
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
    grain(ctx, W, H, form === 'plaque' ? 5 : 7)
    ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.textAlign = 'center'
    if (form === 'cert') { ctx.lineWidth = 2; ctx.strokeRect(34, 34, W - 68, H - 68); ctx.lineWidth = 1; ctx.strokeRect(48, 48, W - 96, H - 96) }
    if (form === 'plaque') { ctx.globalAlpha = .55; ctx.lineWidth = 1.5; ctx.strokeRect(40, 40, W - 80, H - 80); ctx.globalAlpha = 1 }
    if (form === 'placard') ctx.fillRect(0, 0, W, 26)
    if (form === 'label') { ctx.lineWidth = 1; ctx.globalAlpha = .4; ctx.strokeRect(40, 40, W - 80, H - 80); ctx.globalAlpha = 1 }
    smallCaps(ctx, 20, 5); ctx.fillText(String(it.kind || '').toUpperCase(), W / 2, 110)
    ctx.fillRect(W / 2 - 40, 150, 80, 2)
    ctx.letterSpacing = '0px'
    const { fs, lines } = fitTitle(ctx, it.title.toUpperCase(), W - 220, H * 0.46, 104, 40, 1.0)
    const y0 = H / 2 - (lines.length * fs) / 2 + 10
    lines.forEach((l, k) => ctx.fillText(l, W / 2, y0 + k * fs))
    if (it.event) { ctx.font = `italic 400 30px ${BOOK}`; ctx.fillText(it.event, W / 2, y0 + lines.length * fs + 34) }
    smallCaps(ctx, 18, 4); ctx.fillText('SHANMU RAJA', W / 2, H - 120)
  })
  // iteration 12: the back of every object says something the front doesn't (never the title again).
  // Every field comes from the repo's own data; a field that isn't there is simply left off.
  return drawFace(key, aspect, (ctx, W, H) => {
    ctx.fillStyle = it.cat === 'luck' ? '#f6efe0' : '#f7f6f2'; ctx.fillRect(0, 0, W, H)
    grain(ctx, W, H, 6)
    const m = W * 0.1, maxW = W - 2 * m
    const { label, body, quoteIt, note, rows } = backOf(it)
    ctx.fillStyle = '#161616'
    smallCaps(ctx, 17, 4); ctx.fillText(label.toUpperCase(), m, m)
    ctx.fillRect(m, m + 34, maxW, 1.5)
    ctx.letterSpacing = '0px'
    const rs = rows.filter(([, v]) => v).slice(0, 5)
    const top = H - m - rs.length * 50
    let y = m + 70
    if (body) {
      // calm Lora, sized down until it fits the room above the rows
      let fs = 38, ls
      for (; fs > 24; fs -= 2) { ctx.font = `${quoteIt ? 'italic ' : ''}400 ${fs}px ${BOOK}`; ls = wrap(ctx, quoteIt ? `“${body}”` : body, maxW); if (ls.length * fs * 1.32 < (top - y) * (note ? 0.55 : 0.9)) break }
      ls.forEach((l, k) => ctx.fillText(l, m, y + k * fs * 1.32)); y += ls.length * fs * 1.32 + 30
    }
    if (note && top - y > 120) {
      smallCaps(ctx, 13, 3); ctx.fillText('ON THE PAINTING', m, y); ctx.letterSpacing = '0px'; y += 30
      ctx.font = `400 22px ${BOOK}`; ctx.fillStyle = '#3a3a3a'
      const ls = wrap(ctx, note, maxW), room = Math.max(1, Math.floor((top - y - 24) / 30))
      ls.slice(0, room).forEach((l, k) => ctx.fillText(k === room - 1 && ls.length > room ? `${l.replace(/[\s,.;:]+\S*$/, '')}…` : l, m, y + k * 30))
      ctx.fillStyle = '#161616'
    }
    rs.forEach(([k, v], n) => {
      const ry = top + n * 50
      ctx.fillRect(m, ry, maxW, 1)
      smallCaps(ctx, 13, 3); ctx.textAlign = 'left'; ctx.fillText(k.toUpperCase(), m, ry + 18)
      ctx.font = `400 20px ${BOOK}`; ctx.fontStretch = 'normal'; ctx.letterSpacing = '0px'; ctx.textAlign = 'right'
      let t = String(v); while (ctx.measureText(t).width > maxW * 0.68 && t.length > 4) t = t.slice(0, -2)
      ctx.fillText(t === String(v) ? t : `${t.trim()}…`, W - m, ry + 15)
    })
    ctx.textAlign = 'left'
  })
}
const metaOf = (it, k) => { const r = it.meta.find(([n]) => n === k); return r ? r[1] : '' }
const fileOf = (p) => (p ? p.split('/').pop() : '')
function backOf(it) {
  if (it.cat === 'prose') return {
    label: metaOf(it, 'Kind') || it.kind || 'Prose', body: it.line, quoteIt: true, note: NOTES[`prose/${it.slug}`] || '',
    rows: [['Recognition', metaOf(it, 'Recognition')], ['Venue', metaOf(it, 'Venue')], ['Published', metaOf(it, 'Published')], ['Painting', metaOf(it, 'Painting')]],
  }
  if (it.cat === 'publications' || it.cat === 'deep') {
    const body = it.finding || (it.line && it.line !== it.venueFull ? it.line : '')
    return {
      label: it.finding ? 'Main finding' : it.kind || 'Paper', body,
      rows: [['N', it.n], ['Venue', (it.ab && it.ab.cite) || it.venueFull || metaOf(it, 'Venue')], ['DOI', it.doi], ['Date', it.date], ['Status', it.status || ''], ['PDF', fileOf(it.pdfPath)], ['PubMed', it.ab && it.ab.pmid ? `PMID ${it.ab.pmid}` : ''], ['Status', it.ab && it.ab.wip ? 'In preparation' : ''], ['Recognition', metaOf(it, 'Recognition')]],
    }
  }
  return {
    label: it.kind || 'Recognition', body: it.line,
    rows: [['Event', it.event], ['Related', it.related ? it.related.title : ''], ['Painting', metaOf(it, 'Painting')]],
  }
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
      <a className="h-mark" href="#/" aria-label="Shanmu Raja, home" onClick={(e) => { e.preventDefault(); if (e.detail) e.currentTarget.blur(); go({ view: 'browse', cat: 'home' }) }}>Shanmu Raja</a>
      <nav className="sn-nav sn-l h-nav" aria-label="Sections">
        {CATS.map((c) => item(c.id, c.label, { view: 'browse', cat: c.id }, c.items.length))}
      </nav>
      <nav className="sn-nav sn-r h-nav" aria-label="Pages">
        {item('paintings', 'ART THAT I LOVE', { view: 'browse', cat: 'paintings' })}
        {item('about', 'About', { view: 'about' })}
      </nav>
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

/* ---------------- iteration 17: one flowing page ----------------
   Native vertical scroll, no snapping, no wheel lock. Bands in order: the intro (name, bio, Selected),
   the three carousels, then ART THAT I LOVE. A vertical wheel or swipe always scrolls the page; only a
   sideways gesture (drag, arrows, shift + wheel, trackpad swipe) moves a carousel. Each carousel owns its
   renderer and stops drawing while it is off screen. */
const LUCK_FORM = { 'the-new-yorker': 'label', 'paul-kalanithi-writing-competition': 'cert', 'massachusetts-undergraduate-poetry-festival': 'plaque', 'american-college-of-preventive-medicine': 'placard' }
const BANDS = ['prose', 'publications', 'deep', 'luck']
const FLOW = { y: null, restore: false, leftFrom: null, api: null, bands: {} }
const HEAD = () => (window.innerWidth <= 760 ? 96 : 76)
const bandTop = (c) => {
  if (c === 'home') return 0
  const el = document.getElementById(`b-${c}`)
  return el ? Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEAD()) : 0
}

function Band({ cat, go, returning }) {
  const host = useRef(null), gal = useRef(null)
  const items = catOf(cat).items
  const [cur, setCur] = useState(lastIdx[cat] || 0)
  const [ready, setReady] = useState(() => reduced())
  const goRef = useRef(go); goRef.current = go

  useLayoutEffect(() => {
    const g = gal.current = new Gallery(host.current, {
      own: true, band: true, touch: isTouch, frontTexture, backTexture,
      onChange: (i) => { lastIdx[cat] = i; setCur(i) },
      onHover: () => {},
      onOpen: (i) => goRef.current({ view: 'piece', cat, i }),
    })
    g.setSection(itemsFor(cat), cat, lastIdx[cat] || 0)
    g.tone(bgFor(items[g.index()]))
    FLOW.bands[cat] = g
    let live = true, shown = false
    if (returning) {
      // back from a page: put the page where it was, then land the page image on its object
      window.scrollTo(0, FLOW.restore && FLOW.y != null ? FLOW.y : bandTop(cat))
      shown = true
      const rect = g.prepareReturn(false)
      NAV.hold = Promise.race([g.plates[g.index()].ready, wait(600)]).then(() => flyTo(rect, { back: false, duration: 0.8 }))
        .then(() => frames(1)).then(() => { if (!live) return; const l = g.land(); return frames(2).then(() => { flyClear(); return l }) })
        .then(() => { if (live) setReady(true) })
    } else if (!reduced()) { g.G.active = 0.001; g.G.others = 0; g.G.inbound = true }
    const io = new IntersectionObserver(([en]) => {
      g.paused = !en.isIntersecting
      if (en.isIntersecting && !shown) { shown = true; g.fan().then(() => { if (live) setReady(true) }) }
    }, { rootMargin: '80px 0px' })
    io.observe(host.current)
    return () => { live = false; io.disconnect(); if (FLOW.bands[cat] === g) delete FLOW.bands[cat]; g.destroy(); gal.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const it = items[Math.min(cur, items.length - 1)]
  useEffect(() => { if (gal.current && it) gal.current.tone(bgFor(it)) }, [it])
  const meta = it.meta.filter(([, v]) => v).slice(0, 4)
  const act = (f) => () => { const g = gal.current; if (g && !g.busy()) f(g) }
  return (
    <section id={`b-${cat}`} data-band={cat} className={`fl-band fl-b-${cat}${ready ? ' is-ready' : ''}`}
      aria-label={`${catOf(cat).label}. ${items.length} pieces. Drag sideways or use the arrows to browse.`}>
      <header className="fl-head">
        <h2>{catOf(cat).label}</h2>
        <span className="fl-n">{items.length} {cat === 'luck' ? 'recognitions' : cat === 'prose' ? 'pieces' : 'papers'}</span>
      </header>
      <div className="fl-stage" style={{ background: bgFor(it) }}>
        <div className="fl-gl" ref={host} />
        {[-1, 1].map((sg) => (
          <button key={sg} type="button" className={`h-side h-side-${sg > 0 ? 'n' : 'p'}${ready && (sg > 0 ? cur < items.length - 1 : cur > 0) ? ' is-on' : ''}`}
            aria-label={sg > 0 ? 'Next piece' : 'Previous piece'} onClick={act((g) => g.step(sg, 'click'))}>
            <span aria-hidden="true">{sg > 0 ? '→' : '←'}</span>
          </button>))}
      </div>
      <div className="fl-info">
        <div className={`fl-txt${ready ? ' is-on' : ''}`} key={`t-${cur}`}>
          <h3 className="h-title"><a href={`#/${cat}/${it.slug}`} onClick={(e) => { e.preventDefault(); go({ view: 'piece', cat, i: cur }) }}>{it.title}</a></h3>
          <dl className="h-meta">{meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </div>
        {it.line ? <blockquote className={`fl-quote${ready ? ' is-on' : ''}`} key={`q-${cur}`}>{it.line}</blockquote> : <span />}
        <div className="fl-ctl">
          <button type="button" className="h-flip" aria-label="Flip the card over" onClick={act((g) => g.flip())}>
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M3.5 8.5a6.5 6.5 0 0 1 11.6-3.2M16.5 11.5a6.5 6.5 0 0 1-11.6 3.2" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M15.6 2.2v3.6H12M4.4 17.8v-3.6H8" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
            <span>Flip</span>
          </button>
          <button type="button" className="h-count" aria-label="Next piece" onClick={act((g) => g.to((g.settled() + 1) % g.N, 'click'))}>
            {pad2(cur + 1)} <i>/</i> {pad2(items.length)}
          </button>
        </div>
      </div>
    </section>
  )
}

function Flow({ cat, go }) {
  const returning = FLY.dir === 'out' && FLY.data && BANDS.includes(FLY.data.mode) ? FLY.data.mode : null
  const intro = !session.introDone && !reduced() && !returning && cat === 'home'
  const [nameOn, setNameOn] = useState(intro)
  const [fontOk, setFontOk] = useState(false)
  const [chrome, setChrome] = useState(!intro)
  const [leaving, setLeaving] = useState(false)
  const [active, setActive] = useState(cat)
  const activeRef = useRef(cat)
  const nameRef = useRef(null), mainRef = useRef(null)

  useLayoutEffect(() => {
    if (!returning) window.scrollTo(0, FLOW.restore && FLOW.y != null ? FLOW.y : bandTop(cat))
    FLOW.restore = false
    if (!intro) { session.introDone = true; return }
    let live = true
    const root = document.documentElement
    root.classList.add('b-lock')
    const t0 = performance.now()
    const fonts = Promise.race([document.fonts ? document.fonts.load('700 100px "Lora"') : null, wait(700)]).catch(() => {})
    fonts.then(() => live && setFontOk(true))
    NAV.hold = fonts.then(() => wait(Math.max(300, 1750 - (performance.now() - t0))))
      .then(() => { if (!live) return; session.introDone = true; setChrome(true); return frames(1) })
      .then(() => { if (!live) return; flipName(); return wait(1150) })
      .then(() => { if (live) setNameOn(false) })
      .finally(() => root.classList.remove('b-lock'))
    return () => { live = false; root.classList.remove('b-lock') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the pen ring follows the band under a line 40% down the screen
  useEffect(() => {
    const els = [...document.querySelectorAll('[data-band]')]
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { const c = e.target.dataset.band; activeRef.current = c; lastCat.current = c; setActive(c) } })
    }, { rootMargin: '-40% 0px -59% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const flipName = () => {
    const n = nameRef.current, m = mainRef.current && mainRef.current.querySelector('.sn .h-mark')
    if (!n || !m) return
    const ink = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect() }
    const o = n.getBoundingClientRect(), oi = ink(n.querySelector('.h-iname-m > span')), r = ink(m)
    const s = r.width / oi.width
    n.style.transition = 'transform 1.1s cubic-bezier(.32,.72,0,1)'
    n.style.transform = `translate(${(-o.width / 2 + (r.left - (oi.left - o.left) * s) - o.left).toFixed(2)}px, ${(-o.height / 2 + (r.top - (oi.top - o.top) * s) - o.top).toFixed(2)}px) scale(${s.toFixed(4)})`
  }

  useEffect(() => {
    FLOW.api = {
      // iteration 17: a nav jump never races past the bands in between. The view fades out with a soft
      // blur, the page jumps while hidden, and the target band rises in (~700ms, A24 easing).
      scrollTo: (c) => {
        const el = mainRef.current
        if (reduced() || !el) { window.scrollTo({ top: bandTop(c), behavior: 'instant' }); return }
        clearTimeout(FLOW.tp)
        el.classList.remove('fl-tp-in'); el.classList.add('fl-tp-out')
        FLOW.tp = setTimeout(() => {
          window.scrollTo({ top: bandTop(c), behavior: 'instant' })
          el.classList.remove('fl-tp-out'); void el.offsetWidth; el.classList.add('fl-tp-in')
          FLOW.tp = setTimeout(() => el.classList.remove('fl-tp-in'), 520)
        }, 240)
      },
      active: () => activeRef.current,
    }
    HOME.api = {
      // open a piece from its carousel: only when that carousel is on screen and showing it
      open: async (r) => {
        const g = FLOW.bands[r.cat], el = document.getElementById(`b-${r.cat}`)
        if (!g || !el || r.via) return false
        const b = el.querySelector('.fl-gl').getBoundingClientRect()
        if (b.bottom < 80 || b.top > window.innerHeight - 80 || g.index() !== r.i || g.busy()) return false
        const { i, back } = await g.openFace()
        const n = flyNode(g.rectOf(i), catOf(r.cat).items[i], back)
        await Promise.all([...n.querySelectorAll('img')].map(decoded))
        await frames(1)
        g.hidePlate(i)
        FLY.dir = 'in'; FLY.data = { cat: r.cat, i, back, mode: r.cat }
        setLeaving(true)
        return true
      },
      leave: async () => { setLeaving(true); if (!reduced()) await wait(380) },
    }
    return () => { HOME.api = null; FLOW.api = null }
  })

  useEffect(() => {
    const on = (e) => {
      if (NAV.busy) return
      if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return
      const c = activeRef.current, g = FLOW.bands[c]
      if (!g || g.busy()) return
      const free = !(document.activeElement && document.activeElement.closest('a, button'))
      if (e.key === 'ArrowRight') { e.preventDefault(); g.step(1, 'key') }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); g.step(-1, 'key') }
      else if (e.key === 'Enter' && free) { e.preventDefault(); go({ view: 'piece', cat: c, i: g.index() }) }
      else if (e.key === ' ' && free) { e.preventDefault(); g.flip() }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [go])

  return (
    <main ref={mainRef} className={`fl${leaving ? ' is-leaving' : ''}${nameOn ? ' h-naming' : ''}${chrome ? ' is-on' : ''}`}>
      <SiteNav go={go} active={active} className={`h-top fl-sn${chrome ? ' is-on' : ''}`} />

      <section id="b-home" data-band="home" className="fl-hero" aria-label="Opening">
        <figure className="fl-open">
          <blockquote className="fl-hand" aria-label={OPENING.lines.join(' ')}>
            {OPENING.lines.map((l, n) => <span key={n} className="fl-hl" style={{ '--n': n }} aria-hidden="true"><span>{l}</span></span>)}
          </blockquote>
          <figcaption className="fl-by">{OPENING.by}</figcaption>
        </figure>
        <button type="button" className="fl-more" onClick={() => FLOW.api.scrollTo && FLOW.api.scrollTo('prose')}>Scroll <b>↓</b></button>
      </section>

      {BANDS.map((c) => <Band key={c} cat={c} go={go} returning={returning === c} />)}

      <section id="b-paintings" data-band="paintings" className="fl-band fl-b-paintings" aria-label="ART THAT I LOVE">
        <header className="fl-head"><h2>ART THAT I LOVE</h2><span className="fl-n">{PAINTINGS.length} paintings</span></header>
        <ul className="pt-grid">
          {PAINTINGS.map((s) => (
            <li key={s}><div style={{ aspectRatio: String(aspectOf(s)), background: placeholderOf(s) }}><img src={variantFor(s, 480)} alt={META[s].title} loading="lazy" decoding="async" /></div><span>{creditText(s)}</span></li>
          ))}
        </ul>
      </section>

      <div className={`h-sfoot fl-sfoot${chrome && !nameOn ? ' is-on' : ''}`}><Socials /></div>

      {nameOn && (
        <div ref={nameRef} className={`h-iname${fontOk ? ' is-f' : ''}`} aria-hidden="true">
          <span className="h-iname-m"><span>Shanmu Raja</span></span>
        </div>
      )}
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

function Piece({ cat, i, go, via }) {
  const home = via === 'home' ? { view: 'browse', cat: 'home' } : { view: 'browse', cat }
  const items = catOf(cat).items
  const it = items[i]
  const note = NOTES[`${cat}/${it.slug}`]
  const prev = (i - 1 + items.length) % items.length, next = (i + 1) % items.length
  const art = useRef(null)
  const flying = FLY.dir === 'in' && FLY.data && FLY.data.cat === cat && FLY.data.i === i
  const [hold, setHold] = useState(flying)
  const dir = NAV.dir
  const face = useFaceURL(it)
  const ar = it.src ? aspectOf(it.src) : SECTIONS[cat === 'deep' ? 'publications' : cat].aspect
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
        FLY.dir = 'out'; FLY.data = { cat, i, back: false, mode: home.cat }
        lastIdx[home.cat] = home.cat === 'home' ? Math.max(0, SELECTED_ITEMS.indexOf(it)) : i
        return fadeOutPage()
      },
    }
    return () => { PAGE.api = null }
  })

  useEffect(() => {
    const on = (e) => { if (e.key === 'Escape') goRef.current(home) }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat])

  const meta = it.meta.filter(([, v]) => v)
  // iteration 14: say each thing once. The byline is dropped when every part of it is already a meta row.
  const showBy = !!it.by && !String(it.by).split('·').every((p) => meta.some(([, v]) => norm(v) === norm(p)))
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
  if (cat === 'publications' || cat === 'deep') {
    return (
      <PaperPage
        it={it} honors={honors} nav={pgNav}
        top={<PageTop back={() => go(home)} backLabel={catOf(home.cat).label} active={cat} go={go} right={`${pad2(i + 1)} / ${pad2(items.length)}`} />}
        cover={<div ref={art} className="pg-art" style={{ '--ar': ar, aspectRatio: String(ar), background: '#f9f8f4', visibility: hold ? 'hidden' : undefined }}>{face && <img src={face} alt={`${it.title}, cover`} decoding="async" />}</div>}
      />
    )
  }
  const flyCls = `${flying ? ' is-flown' : ' is-direct'}${dir ? ` is-step is-step-${dir > 0 ? 'n' : 'p'}` : ''}`
  const top = <PageTop back={() => go(home)} backLabel={catOf(home.cat).label} active={cat} go={go} right={`${pad2(i + 1)} / ${pad2(items.length)}`} />
  const artEl = (
    <div ref={art} className="pg-art" style={{ '--ar': ar, aspectRatio: String(ar), background: it.src ? placeholderOf(it.src) : '#f9f8f4', visibility: hold ? 'hidden' : undefined }}>
      {face && <img src={it.src ? variantFor(it.src, 1400) : face} alt={it.src ? credit : `${it.title}, plaque`} decoding="async" />}
    </div>
  )
  const related = it.related && <p className="pg-related"><small>Related</small><a href={it.related.href} onClick={(e) => { e.preventDefault(); go(parse(it.related.href)) }}>{it.related.title}</a> <em>· {it.related.kind}</em></p>
  if (cat === 'luck') {
    // iteration 17: each recognition gets its own ceremonial form; every line on it comes from src/pieces.js
    const form = LUCK_FORM[it.slug] || 'label'
    const story = it.related && CATS[0].items.find((x) => `#/prose/${x.slug}` === it.related.href)
    return (
      <article className={`pg pg-piece pg-c-luck lk lk-${form}${flyCls}`}>
        {top}
        <div className="lk-sheet">
          <p className="lk-k">{it.title}</p>
          <h1 className="lk-rec">{it.kind}</h1>
          {it.event && <p className="lk-ev">{it.event}</p>}
          <hr className="lk-rule" />
          <div className="lk-body">
            <figure className="lk-fig">
              {artEl}
              {it.src && credit && <figcaption className="lk-cap"><small>Painting</small>{credit}</figcaption>}
            </figure>
            <div className="lk-txt">
              <p className="lk-line">{it.line}</p>
              {story && story.line && <blockquote className="lk-quote"><small>The first line</small><span>{story.line}</span></blockquote>}
              {cta && <div className="pg-cta">{cta}</div>}
              {related}
            </div>
          </div>
        </div>
        {pgNav}
      </article>
    )
  }
  return (
    <article className={`pg pg-piece pg-c-${cat}${flyCls}`}>
      {top}
      <div className="pg-head">
        <h1 className="pg-title"><span>{it.title}</span></h1>
        {showBy && <p className="pg-by"><span>{it.by}</span></p>}
        {honors}
        <dl className="pg-meta pg-mt">
          {meta.filter(([k]) => k !== 'Painting' && !(k === 'Recognition' && honors)).map(([k, v], n) => <div key={k} style={{ '--n': n }}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </div>
      {it.quote && <blockquote className="pg-quote pg-hand"><span>{it.quote}</span></blockquote>}
      <div className="pg-body">
        <figure className="pg-fig">
          {artEl}
          {credit && <figcaption>{credit}</figcaption>}
        </figure>
        <div className="pg-side">
          {cta && <div className="pg-cta">{cta}</div>}
          {related}
          {it.line && norm(it.line) !== norm(it.quote) && <p className="pg-line">{it.line}</p>}
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
const same = (a, b) => hashOf(a) === hashOf(b)
export default function Browser() {
  useEffect(() => { document.documentElement.classList.remove('pre') }, [])
  const [route, setRoute] = useState(() => parse(window.location.hash))
  const routeRef = useRef(route); routeRef.current = route
  if (route.view === 'browse') lastCat.current = route.cat

  const go = useCallback(async (r, opts = {}) => {
    if (NAV.busy) { NAV.pending = [r, opts]; return }
    const from = routeRef.current
    // iteration 17: within the flowing page a nav item just glides the page to its band
    if (from.view === 'browse' && r.view === 'browse' && FLOW.api) {
      FLOW.api.scrollTo(r.cat)
      routeRef.current = r; setRoute(r)
      const h = hashOf(r)
      if (window.location.hash !== h) history.replaceState(null, '', h)
      return
    }
    if (same(from, r)) { if (opts.pop) return; return }
    NAV.busy = true; NAV.to = r
    try {
      if (NAV.hold && !(from.view === 'browse' && r.view === 'browse')) { await Promise.race([NAV.hold, wait(2500)]); NAV.hold = null }
      if (from.view === 'browse') {
        FLOW.y = window.scrollY; FLOW.leftFrom = FLOW.api ? FLOW.api.active() : from.cat
        const flown = r.view === 'piece' && HOME.api && !reduced() ? await HOME.api.open(r) : false
        if (!flown && HOME.api) await HOME.api.leave()
      } else if (from.view === 'piece' && r.view === 'piece' && r.cat === from.cat) {
        NAV.dir = (r.i > from.i && !(from.i === 0 && r.i === catOf(r.cat).items.length - 1)) || (from.i === catOf(r.cat).items.length - 1 && r.i === 0) ? 1 : -1
        if (!reduced()) { const el = document.querySelector('.pg'); if (el) { el.classList.add(NAV.dir > 0 ? 'is-out-n' : 'is-out-p'); await wait(240) } }
      } else if (from.view === 'piece' && r.view === 'browse' && r.cat === from.cat && !from.via && PAGE.api) await PAGE.api.toGallery()
      else if (from.view !== 'browse') await fadeOutPage()
    } catch (e) { void e }
    // coming back to the flowing page: land where you left it (Back, or the band you left from)
    if (r.view === 'browse' && from.view !== 'browse') FLOW.restore = !!opts.pop || r.cat === FLOW.leftFrom || (from.view === 'piece' && r.cat === (from.via || from.cat))
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

  if (route.view === 'piece') return <Piece key={`${route.cat}-${route.i}`} cat={route.cat} i={route.i} via={route.via} go={go} />
  if (route.view === 'about') return <About go={go} />
  return <Flow cat={route.cat} go={go} />
}
