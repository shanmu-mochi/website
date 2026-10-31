/* Redesign iteration 7. The home is a WebGL gallery that moves like the A24 film browser
   (src/gallery/Gallery.js, NOTES-A24-STUDY.md); each section has its own object and staging.
   Opening a piece is one continuous shared-element flight from the gallery into the white-paper page.
   Routes are hash-based so a plain static server works:
   #/prose  #/publications  #/luck  #/<cat>/<slug>  #/about  #/paintings */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { CATS, META, PAINTINGS, SOCIALS, SELECTED_ITEMS, variantFor, aspectOf, placeholderOf, tintOf, creditText } from './pieces'
import NOTES from './pieceNotes'
import PaperPage from './PaperPage'
import TEASERS from './storyTeasers'
import { GLIDE, plateSize, SECTIONS } from './gallery/shared'
import './styles/globals.css'
import './styles/a24.css'
import './styles/iter18.css'
import './styles/iter19.css'
import './styles/iter20.css'
import './styles/iter21.css'
import './styles/iter22.css'
import './styles/iter23.css'
import './styles/iter24.css'
import './styles/iter25.css'
import './styles/iter27.css'
import './styles/iter28.css'
import './styles/iter32.css'
import './styles/iter33.css'
import './styles/iter38.css'

const norm = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const pad2 = (n) => String(n).padStart(2, '0')
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isTouch = () => window.matchMedia('(max-width: 720px), (pointer: coarse)').matches
// iteration 12: home is its own row, "Selected", a hand-picked mix (src/selected.js)
// iteration 19: one continuous A24 row of everything, in nav order. A section is a stretch of the row.
const PAINT_ITEMS = PAINTINGS.map((src) => ({ cat: 'paintings', slug: src.replace(/\.[a-z]+$/, ''), src, title: META[src].title, kind: 'Painting', line: '',
  meta: [['Artist', META[src].artist], ['Year', META[src].year]] }))
const PAINT_CAT = { id: 'paintings', label: 'ART THAT I LOVE', items: PAINT_ITEMS }
const SEC_ORDER = ['prose', 'publications', 'luck', 'deep']   // iteration 20: ART THAT I LOVE is its own static page again
const catOf0 = (id) => (id === 'paintings' ? PAINT_CAT : CATS.find((c) => c.id === id) || CATS[0])
const ROW = SEC_ORDER.flatMap((c) => catOf0(c).items.map((it) => ({ ...it, rowCat: c })))
const SEC_START = {}; SEC_ORDER.forEach((c) => { SEC_START[c] = ROW.findIndex((x) => x.rowCat === c) })
const HOME_CAT = { id: 'home', label: 'Shanmu Raja', items: ROW }
const catOf = (id) => (id === 'home' ? HOME_CAT : catOf0(id))
void SELECTED_ITEMS
const ROWPOS = { set: false }
// iteration 14: scrolling down walks the sections in nav order (Selected first); the last stop is the
// ART THAT I LOVE page, which scrolls as a normal page
// iteration 18: Deep Dives sits between Luck and ART THAT I LOVE
const ORDER = ['home', 'prose', 'publications', 'luck', 'deep', 'paintings']
const lastIdx = { home: 0, prose: 0, publications: 0, luck: 0, deep: 0 }
const lastCat = { current: 'home' }
// the piece behind slot i of a row (home slots point into the real sections)
const pieceRoute = (mode, i) => {
  if (mode !== 'home') return { view: 'piece', cat: mode, i }
  const it = HOME_CAT.items[i]
  if (it.cat === 'paintings') return { view: 'paintings' }
  return { view: 'piece', cat: it.cat, i: catOf(it.cat).items.findIndex((x) => x.slug === it.slug), via: 'home' }
}
// a hash deep-link (#/prose/…, #/about…) skips the name-first opening
const session = { introDone: typeof location !== "undefined" && /^#\/./.test(location.hash) }
const WIDE = '"Lora", Georgia, serif'
const LABEL = '"Archivo", "Helvetica Neue", Arial, sans-serif'
const BOOK = '"Lora", Georgia, serif'
const TONE = { prose: 'rgb(242,242,240)', publications: 'rgb(235,238,241)', luck: 'rgb(244,238,228)', deep: 'rgb(236,236,232)' }
// iteration 19: A24's plain light grey, never tinted
const bgFor = () => '#f2f2f2'
void tintOf; void TONE
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

function parse(h) {
  const p = (h || '').replace(/^#\/?/, '').split('/').filter(Boolean)
  if (p[0] === 'about') return { view: 'about' }
  if (p[0] === 'art' || p[0] === 'paintings') return { view: 'paintings' }
  const cat = CATS.some((c) => c.id === p[0]) ? p[0] : 'home'
  if (p[1]) {
    const i = catOf(cat).items.findIndex((x) => x.slug === p[1])
    if (i >= 0) return { view: 'piece', cat, i }
  }
  return { view: 'browse', cat }
}
const hashOf = (r) => r.view === 'piece' ? `#/${r.cat}/${catOf(r.cat).items[r.i].slug}` : r.view === 'browse' ? (r.cat === 'home' ? '#/' : `#/${r.cat}`) : r.view === 'paintings' ? '#/art' : `#/${r.view}`

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
// iteration 49: the cloth colour of a book: the cover's own colour, darkened in linear light exactly as the 3D spine is
function clothOf(css) {
  const m = String(css || '').match(/\d+(\.\d+)?/g) || [119, 119, 119]
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }, srgb = (v) => Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055))
  return `rgb(${m.slice(0, 3).map((v) => srgb(lin(+v) * 0.58)).join(',')})`
}
// a story's back is a book's back cover: the author, the opening line as the blurb, the honour, the cover credit,
// a small mark, and a barcode with the details under it. The cloth spine wraps on at the right (the spine side, seen
// from the back).
function bookBack(ctx, W, H, it) {
  ctx.fillStyle = '#f5f2ea'; ctx.fillRect(0, 0, W, H)
  grain(ctx, W, H, 5)
  const band = Math.round(W * 0.022)
  ctx.fillStyle = clothOf(it.placeholder || (it.src ? placeholderOf(it.src) : '')); ctx.fillRect(W - band, 0, band, H)
  const cr = ctx.createLinearGradient(W - band - 10, 0, W - band, 0); cr.addColorStop(0, 'rgba(0,0,0,0)'); cr.addColorStop(1, 'rgba(0,0,0,0.16)')
  ctx.fillStyle = cr; ctx.fillRect(W - band - 10, 0, 10, H)
  const m = W * 0.1, maxW = W - 2 * m - band, ink = '#1b1a17', soft = '#6a665d'
  ctx.fillStyle = ink; smallCaps(ctx, 17, 4); ctx.fillText('SHANMU RAJA', m, m); ctx.letterSpacing = '0px'
  ctx.fillRect(m, m + 34, maxW, 1.2)
  // the bottom block first, so the blurb knows its room
  const bar = { w: Math.round(W * 0.27), h: Math.round(H * 0.07) }
  const bx = W - band - m - bar.w, by = H - m - bar.h - 26
  let s = (it.slug || 'x').split('').reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 233280, 7)
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  ctx.fillStyle = '#fbfaf6'; ctx.fillRect(bx - 10, by - 10, bar.w + 20, bar.h + 58)
  ctx.fillStyle = ink
  for (let x = 0; x < bar.w - 2;) { const bw = 1 + Math.floor(rnd() * 3.2); if (rnd() > 0.42) ctx.fillRect(bx + x, by, bw, bar.h); x += bw + 1 + Math.floor(rnd() * 2) }
  const details = [it.kind, metaOf(it, 'Venue'), metaOf(it, 'Published')].filter(Boolean).join(' \u00b7 ').toUpperCase()
  // the details under the bars, on two lines if they need them (kind, then venue and date)
  smallCaps(ctx, 11, 2)
  const dl = ctx.measureText(details).width <= bar.w + 14 ? [details] : [String(it.kind || '').toUpperCase(), [metaOf(it, 'Venue'), metaOf(it, 'Published')].filter(Boolean).join(' \u00b7 ').toUpperCase()].filter(Boolean)
  dl.forEach((l, k) => ctx.fillText(l, bx - 4, by + bar.h + 10 + k * 16)); ctx.letterSpacing = '0px'
  // the mark: SR in a ring
  const r = 30, cx = m + r, cy = by + bar.h / 2 + 8
  ctx.strokeStyle = ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  ctx.font = `400 24px ${BOOK}`; ctx.textAlign = 'center'; ctx.fillText('SR', cx, cy - 12); ctx.textAlign = 'left'
  // the cover credit, above the mark
  const credit = metaOf(it, 'Painting')
  let y1 = by - 26
  if (credit) {
    ctx.font = `400 18px ${BOOK}`; ctx.fillStyle = soft
    const ls = wrap(ctx, `Cover: ${credit}`, maxW).slice(0, 2); y1 = by - 30 - ls.length * 24
    ls.forEach((l, k) => ctx.fillText(l, m, y1 + 4 + k * 24)); ctx.fillStyle = ink
  }
  // the blurb (the story's opening line) and the honour, in the room above
  let y = m + 74
  const honour = metaOf(it, 'Recognition'), room = y1 - y - (honour ? 90 : 30)
  if (it.line) {
    let fs = 44, ls = []
    for (; fs > 26; fs -= 2) { ctx.font = `italic 400 ${fs}px ${BOOK}`; ls = wrap(ctx, `\u201c${it.line}\u201d`, maxW); if (ls.length * fs * 1.3 < room) break }
    ls.forEach((l, k) => ctx.fillText(l, m, y + k * fs * 1.3)); y += ls.length * fs * 1.3 + 30
  }
  if (honour) { ctx.fillRect(m, y, 48, 1.4); y += 18; smallCaps(ctx, 14, 3); ctx.fillText(honour.toUpperCase(), m, y); ctx.letterSpacing = '0px' }
}
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
  const sec = SECTIONS[it.cat === 'deep' ? 'publications' : it.cat] || SECTIONS.prose, [w, h] = plateSize({ aspect: it.src ? aspectOf(it.src) : 0.74 }, sec), aspect = w / h
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
  if (it.cat === 'prose' && side === 'back') return drawFace(key, aspect, (ctx, W, H) => bookBack(ctx, W, H, it))
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
  if (it.cat === 'paintings') return { label: 'Painting', body: '', rows: [['Title', it.title], ['Artist', metaOf(it, 'Artist')], ['Year', metaOf(it, 'Year')]] }
  return {
    label: it.kind || 'Recognition', body: it.line,
    rows: [['Event', it.event], ['Related', it.related ? it.related.title : ''], ['Painting', metaOf(it, 'Painting')]],
  }
}
// iteration 48: the 3D gallery and three.js are their own chunk. Home fetches it at start-up (alongside the first
// render); every other page fetches it in idle time after it has shown, so going back to the row never waits.
const GAL = { mod: null, p: null }
const loadGallery = () => GAL.p || (GAL.p = import('./gallery/Gallery').then((m) => { GAL.mod = m; return m }))
const canvasTexture = (c) => new GAL.mod.CanvasTexture(c)
// iteration 47: on a phone one 1200px file serves the carousel, the flight and the story page (cached once, so the
// hand-offs stay seamless); on a desktop the sizes are unchanged
const PHONE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) <= 760
const PLATE_CSS = PHONE ? 750 : 900, STORY_CSS = PHONE ? 750 : 2000
const frontTexture = (it) => (it.cat === 'prose' || it.cat === 'paintings') && it.src ? GAL.mod.imageTexture(variantFor(it.src, PLATE_CSS)) : GAL.mod.texture(faceKey(it, 'front'), () => fontsReady().then(() => canvasTexture(faceCanvas(it, 'front'))))
const backTexture = (it) => GAL.mod.texture(faceKey(it, 'back'), () => fontsReady().then(() => canvasTexture(faceCanvas(it, 'back'))))
const URLS = new Map()
const faceURL = (it, side) => {
  if (side === 'front' && (it.cat === 'prose' || it.cat === 'paintings') && it.src) return variantFor(it.src, PLATE_CSS)
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
  return catOf(cat).items.map((it) => ({ ...it, aspect: it.src ? aspectOf(it.src) : 0.74, placeholder: (it.cat === 'prose' || it.cat === 'paintings') && it.src ? placeholderOf(it.src) : '#f9f8f4' }))
}

/* ---------------- the shared-element flight ----------------
   A DOM clone of the object's face(s) that rides between the WebGL plate and the page image.
   It starts exactly over the face-on plate (same image, same pixels), so the swap at either end is invisible. */
const FLY = { node: null, dir: null, data: null }
function flyNode(rect, it, back, band = 1) {
  flyClear()
  const n = document.createElement('div')
  n.className = 'fly'
  n.innerHTML = '<div class="fly-in"><img class="fly-f" alt=""><img class="fly-b" alt=""></div>'
  if (it.src && (it.cat === 'prose' || it.cat === 'paintings')) { const b = document.createElement('i'); b.className = 'fly-band'; b.style.background = clothOf(it.placeholder || placeholderOf(it.src)); b.style.opacity = String(band); n.firstChild.appendChild(b) }
  n.querySelector('.fly-f').src = faceURL(it, 'front')
  n.querySelector('.fly-b').src = faceURL(it, 'back')
  Object.assign(n.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` })
  n.querySelector('.fly-in').style.transform = back ? 'rotateY(180deg)' : 'none'
  document.body.appendChild(n)
  FLY.node = n
  return n
}
function flyClear() { if (FLY.node) { gsap.killTweensOf(FLY.node); gsap.killTweensOf(FLY.node.firstChild); FLY.node.remove() } FLY.node = null; FLY.dir = null; FLY.data = null }
function flyTo(rect, { back = false, duration = 0.85, clip = null } = {}) {
  const n = FLY.node
  if (!n) return Promise.resolve()
  const r0 = n.getBoundingClientRect(), c0 = n.style.clipPath
  Object.assign(n.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` })
  // landing inside a clip box: the parts of the copy outside the slot are trimmed away as it arrives
  const inset = clip && [Math.max(0, clip.y - rect.y), Math.max(0, rect.x + rect.w - clip.x - clip.w), Math.max(0, rect.y + rect.h - clip.y - clip.h), Math.max(0, clip.x - rect.x)].map((v) => `${v.toFixed(1)}px`).join(' ')
  // FLIP: animate transform from the old box to the new one, then flatten
  const sx = r0.width / rect.w, sy = r0.height / rect.h, dx = r0.left - rect.x, dy = r0.top - rect.y
  return new Promise((done) => {
    if (reduced()) { done(); return }
    gsap.fromTo(n, { x: dx, y: dy, scaleX: sx, scaleY: sy }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration, ease: GLIDE, transformOrigin: '0 0', onComplete: done })
    gsap.to(n.firstChild, { rotateY: back ? 180 : 0, duration: duration * 0.95, ease: GLIDE })
    const band = n.querySelector('.fly-band'); if (band) gsap.to(band, { opacity: FLY.dir === 'out' ? 1 : 0, duration: duration * 0.8, ease: GLIDE })
    if (inset) gsap.fromTo(n, { clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: `inset(${inset})`, duration, ease: GLIDE })
    else if (c0 && c0.startsWith('inset(')) gsap.fromTo(n, { clipPath: c0 }, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: GLIDE, onComplete: () => { n.style.clipPath = '' } })
  })
}
const rectOfEl = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height } }
const decoded = (img) => img && img.decode ? Promise.race([img.decode().catch(() => {}), wait(1200)]) : Promise.resolve()
const frames = (n = 2) => new Promise((r) => { const f = (k) => (k ? requestAnimationFrame(() => f(k - 1)) : r()); f(n) })

/* iteration 20: a real pen. The centreline is drawn in by a stroke-dash mask; what shows is a filled
   variable-width outline (pressure swells mid-stroke, tapers at both ends), a fainter second pass a hair
   off the first, and a rough-ink displacement filter. The shape is fixed per draw (`base`); the live
   jitter only nudges it by a fraction of a pixel. */
const prng = (seed) => { let s = (seed * 9301 + 49297) % 233280; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 } }
const fmt = (v) => v.toFixed(1)
function outline(pts, wmax, rnd) {
  const n = pts.length, L = [], R = []
  const ph = rnd() * 6.28
  for (let k = 0; k < n; k += 1) {
    const t = k / (n - 1), [x, y] = pts[k]
    const [ax, ay] = pts[Math.max(0, k - 1)], [bx, by] = pts[Math.min(n - 1, k + 1)]
    let nx = -(by - ay), ny = bx - ax; const m = Math.hypot(nx, ny) || 1; nx /= m; ny /= m
    // pressure: quick press-in, long body with slow swells, quicker lift-off
    const taper = Math.min(1, t / 0.12) ** 0.8 * Math.min(1, (1 - t) / 0.2) ** 1.1
    const w = wmax * (0.22 + 0.78 * taper) * (0.82 + 0.18 * Math.sin(t * 9 + ph)) / 2
    L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w])
  }
  const all = L.concat(R.reverse())
  let d = `M${fmt(all[0][0])} ${fmt(all[0][1])}`
  for (let k = 1; k < all.length - 1; k += 1) { const [x, y] = all[k], [nx, ny] = all[k + 1]; d += ` Q${fmt(x)} ${fmt(y)} ${fmt((x + nx) / 2)} ${fmt((y + ny) / 2)}` }
  return d + 'Z'
}
const centre = (pts) => { let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`; for (let k = 1; k < pts.length; k += 1) d += ` L${fmt(pts[k][0])} ${fmt(pts[k][1])}`; return d }
function ringPts(W, H, base, seed) {
  const r = prng(base), j = prng(seed + 7)
  const cx = W / 2, cy = H / 2, rx = W / 2 * 0.94, ry = H / 2 * 0.92, n = 64
  // an open loop: starts upper left, runs a little past a full turn, spiralling out so it never closes
  const a0 = -Math.PI * (0.7 + r() * 0.15), turns = 1.06 + r() * 0.06, tilt = (r() - 0.5) * 0.08
  const f1 = r() * 6.28, f2 = r() * 6.28, out = 0.045 + r() * 0.03
  const pts = []
  for (let k = 0; k < n; k += 1) {
    const t = k / (n - 1), a = a0 + t * Math.PI * 2 * turns
    const wob = 1 + 0.022 * Math.sin(a * 2 + f1) + 0.012 * Math.sin(a * 5 + f2) + (t - 0.5) * out + (j() - 0.5) * 0.006
    const x = Math.cos(a) * rx * wob, y = Math.sin(a) * ry * wob
    pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)])
  }
  return pts
}
function linePts(W, H, base, seed) {
  const r = prng(base), j = prng(seed + 3), n = 28, y0 = H * 0.55, rise = 1 + r() * 1.4, f = r() * 6.28, pts = []
  for (let k = 0; k < n; k += 1) { const t = k / (n - 1); pts.push([2 + t * (W - 4), y0 - t * rise + Math.sin(t * 5 + f) * 0.6 + (j() - 0.5) * 0.25 + (t > 0.9 ? (t - 0.9) * 8 : 0)]) }
  return pts
}
let penIds = 0
function Pen({ W, H, pts, pts2, wmax, on, pass, className, style }) {
  const id = useRef(null); if (id.current == null) id.current = `pen${(penIds += 1)}`
  const r = prng(pass + 11)
  return (
    <svg className={`scr pen ${className || ''}${on ? ' is-on' : ''}`} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={style} aria-hidden="true">
      <defs>
        <filter id={`${id.current}f`} x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={pass % 50} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" />
        </filter>
        <mask id={`${id.current}m`} maskUnits="userSpaceOnUse" x="-20" y="-20" width={W + 40} height={H + 40}>
          <path key={pass} className="pen-m" d={centre(pts)} pathLength="1" />
        </mask>
      </defs>
      <g mask={`url(#${id.current}m)`} filter={`url(#${id.current}f)`}>
        <path className="pen-a" d={outline(pts, wmax, r)} />
        <path className="pen-b" d={outline(pts2, wmax * 0.55, r)} />
      </g>
    </svg>
  )
}
function useJitter(on, redraw) {
  const [seed, setSeed] = useState(1), [pass, setPass] = useState(0)
  useEffect(() => { if (on) setPass((x) => x + 1) }, [on, redraw])
  useEffect(() => {
    if (!on || reduced()) return
    const t = setInterval(() => setSeed((x) => x + 1), 110)
    return () => clearInterval(t)
  }, [on])
  return [seed, pass]
}
function Scribble({ w, h, on, pad = 0.14, padY = pad, redraw }) {
  const [seed, pass] = useJitter(on, redraw)
  if (!w || !h) return null
  const W = w * (1 + pad * 2), H = h * (1 + padY * 2)
  const base = 17 + pass * 13
  const pts = ringPts(W, H, base, seed)
  // the second pass: same hand, a touch smaller and rotated, only over part of the loop
  const pts2 = ringPts(W * 0.985, H * 0.98, base, seed + 1).slice(8, 50).map(([x, y]) => [x + W * 0.006, y + H * 0.008])
  return <Pen W={W} H={H} pts={pts} pts2={pts2} wmax={Math.max(2.6, Math.min(5, Math.min(W, H) / 110))} on={on} pass={pass} className="pen-ring" style={{ left: -w * pad, top: -h * padY }} />
}
function PenLine({ w, on, redraw }) {
  const [seed, pass] = useJitter(on, redraw)
  if (!w) return null
  const W = w * 1.1, H = 12, base = 5 + pass * 7
  const pts = linePts(W, H, base, seed)
  const pts2 = linePts(W, H, base, seed + 1).slice(4, 24).map(([x, y]) => [x + 1.5, y + 1.1])
  return <Pen W={W} H={H} pts={pts} pts2={pts2} wmax={2.3} on={on} pass={pass} className="scr-line" style={{ left: -w * 0.05, bottom: -10 }} />
}
function CatRing({ on, redraw, ring }) {
  const ref = useRef(null)
  const [s, setS] = useState(null)
  useLayoutEffect(() => { const p = ref.current && ref.current.parentElement; if (p) setS({ w: p.offsetWidth, h: p.offsetHeight }) }, [])
  return <span ref={ref} className="h-cat-ring">{s && (ring ? <Scribble w={s.w} h={s.h} on={on} pad={0.16} padY={0.62} redraw={redraw} /> : <PenLine w={s.w} on={on} redraw={redraw} />)}</span>
}
// iteration 45: a section's table of contents. One list, two doors: hovering a section in the nav, and the counter.
const TOC_CATS = ['prose', 'publications', 'luck', 'deep']
const yearOf = (x) => ((x.meta || []).find(([k]) => k === 'Published' || k === 'Date') || [])[1] || x.date || ''
function Toc({ cat, current = -1, onPick, className = '', style, onMouseEnter, onMouseLeave }) {
  const items = catOf0(cat).items || []
  return (
    <div className={`toc ${className}`} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="toc-h"><span>{catOf0(cat).label}</span><span>{pad2(items.length)}</span></div>
      <ol className="toc-l">
        {items.map((x, k) => (
          <li key={x.slug}>
            <a href={`#/${cat}/${x.slug}`} className={k === current ? 'is-cur' : undefined} aria-current={k === current ? 'true' : undefined} onClick={(e) => { e.preventDefault(); onPick(k) }}>
              <span className="toc-i">{pad2(k + 1)}</span><span className="toc-t">{x.title}</span><span className="toc-m">{[x.kind, yearOf(x)].filter(Boolean).join(' · ')}</span>
            </a>
          </li>))}
      </ol>
    </div>
  )
}
/* One top bar everywhere: name left, the three wheel sections + the two pages right, contact quiet at the end */
function SiteNav({ go, active, className = '', onHover, onJump }) {
  const [hov, setHov] = useState(null)
  const h = (id) => { setHov(id); if (onHover) onHover(id) }
  // the hover table of contents: opens on a section, stays while the pointer moves into it, closes a beat after it leaves
  const [menu, setMenu] = useState(null), shut = useRef(0)
  const fine = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const [at, setAt] = useState(null)
  const openMenu = (id, el) => {
    clearTimeout(shut.current)
    if (!fine || !TOC_CATS.includes(id)) { setMenu(null); return }
    if (el) { const r = el.getBoundingClientRect(), w = Math.min(440, window.innerWidth - 24); setAt({ left: Math.round(Math.max(12, Math.min(window.innerWidth - w - 12, r.left + r.width / 2 - w / 2))), top: Math.round(r.bottom + 12) }) }
    setMenu(id)
  }
  const closeMenu = () => { clearTimeout(shut.current); shut.current = setTimeout(() => setMenu(null), 160) }
  useEffect(() => () => clearTimeout(shut.current), [])
  useEffect(() => { if (!menu) return; const k = (e) => { if (e.key === 'Escape') setMenu(null) }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [menu])
  const pick = (cat, k) => { setMenu(null); go({ view: 'piece', cat, i: k }, { direct: true, fade: true }) }
  const jump = (id) => { if (id === 'paintings') { go({ view: 'paintings' }); return } if (onJump && SEC_START[id] >= 0) { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); onJump(id) } else { if (SEC_START[id] >= 0) ROWPOS.jumpTo = id; go(id === 'about' ? { view: 'about' } : { view: 'browse', cat: id }) } }
  const item = (id, label) => (
    <span key={id} className="sn-it" onMouseEnter={(e) => openMenu(id, e.currentTarget)} onMouseLeave={closeMenu}>
    <a href={id === 'about' ? '#/about' : id === 'paintings' ? '#/art' : `#/${id}`} className={id === active ? 'is-on' : ''} aria-current={id === active ? 'true' : undefined}
      onMouseEnter={() => h(id)} onMouseLeave={() => h(null)} onFocus={() => h(id)} onBlur={() => h(null)}
      onClick={(e) => { e.preventDefault(); if (e.detail) e.currentTarget.blur(); jump(id) }}>
      <span className="h-cat-l">{label}<CatRing on={hov === id || menu === id} redraw={active} ring /></span>
    </a>
    {menu === id && at && createPortal(<Toc cat={id} current={-1} onPick={(k) => pick(id, k)} className="toc-drop" style={at} onMouseEnter={() => openMenu(id)} onMouseLeave={closeMenu} />, document.body)}
    </span>
  )
  return (
    <header className={`sn ${className}`}>
      <nav className="sn-nav sn-l h-nav" aria-label="Sections">
        {['prose', 'publications', 'luck'].map((c) => item(c, catOf(c).label))}
      </nav>
      <a className="h-mark" href="#/" aria-label="Shanmu Raja, home" onClick={(e) => { e.preventDefault(); if (e.detail) e.currentTarget.blur(); if (onJump) onJump('prose'); else go({ view: 'browse', cat: 'home' }) }}>Shanmu Raja</a>
      <nav className="sn-nav sn-r h-nav" aria-label="Pages">
        {item('deep', catOf('deep').label)}
        {item('paintings', 'Art that I love')}
        {item('about', 'About')}
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
// iteration 43: the A24 scroll layer (a24.raviklaassens.com). Pages scroll through Lenis, eased on a mouse or
// trackpad and left native on touch, with their exact settings. Lenis is the only thing that handles the wheel.
gsap.registerPlugin(CustomEase)
CustomEase.create('energy', 'M0,0 C0.32,0.72 0,1 1,1')
const SCROLL = { lenis: null, tick: null }
function startLenis() {
  if (SCROLL.lenis || reduced()) return
  const coarse = window.matchMedia('(pointer: coarse)').matches
  SCROLL.lenis = new Lenis({ lerp: coarse ? 1 : 0.165, wheelMultiplier: coarse ? 1 : 1.25, touchMultiplier: 1, allowNestedScroll: true })
  SCROLL.tick = (s) => { if (SCROLL.lenis) SCROLL.lenis.raf(s * 1000) }
  gsap.ticker.add(SCROLL.tick); gsap.ticker.lagSmoothing(0)
}
function stopLenis() { if (!SCROLL.lenis) return; gsap.ticker.remove(SCROLL.tick); SCROLL.lenis.destroy(); SCROLL.lenis = null }
function toTop() { if (SCROLL.lenis) SCROLL.lenis.scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0) }
// A24's "Next production" push (their scroll-next constants, unchanged)
const SIDE = 120   // px of sideways travel that counts as a swipe back
const NEXT = { wheel: 620, touch: 380, key: 0.34, hold: 180, drain: 0.9, settle: 350, gap: 140, surge: 1.6, surgeMin: 6, clamp: 140, ease: 10, arrive: 0.3, grow: 1.15, exitGo: 0.48 }
// A24's production hero reveal timings
const RISE = { dur: 0.7, shift: 120, titleStagger: 0.08, text: 0.12, textStagger: 0.03, cta: 0.38, pop: 0.5 }
const NAV = { busy: false, pending: null, hold: null, dir: 0 }
// SEAM.skipTop lets a page keep its scroll position on arrival instead of starting at the top
const SEAM = { to: null, dir: 0, off: 0, skipTop: false }
const HOME = { api: null }
const PAGE = { api: null }
function fadeOutPage() {
  const el = document.querySelector('.pg')
  if (!el || reduced()) return Promise.resolve()
  el.classList.add('is-leaving')
  return wait(360)
}

function Home({ cat, go }) {
  const host = useRef(null), gal = useRef(null), mainRef = useRef(null)
  const items = ROW
  const returning = FLY.dir === 'out' && FLY.data && FLY.data.mode === 'home'
  // where the row starts: a section asked for by a nav click on another page, else where you left it,
  // else the start of the section in the link (#/luck), else the beginning
  const start0 = useRef(null)
  if (start0.current == null) {
    const j = ROWPOS.jumpTo; ROWPOS.jumpTo = null
    start0.current = j ? SEC_START[j] : ROWPOS.set ? lastIdx.home : cat !== 'home' && SEC_START[cat] >= 0 ? SEC_START[cat] : 0
  }
  const [cur, setCur] = useState(start0.current)
  // iteration 20: the gallery holds one section at a time; `cur` stays a ROW index, base = section start
  const base = useRef(SEC_START[ROW[start0.current].rowCat])
  const secItems = (c) => itemsFor(c)
  const shown = 'home'
  const [phase, setPhase] = useState(session.introDone || reduced() ? (returning ? 'return' : 'enter') : 'loading')
  const [leaving, setLeaving] = useState(false)
  const [bgOn, setBgOn] = useState(false)
  // name-first opening: the wordmark sits alone, centred, then flies to its place in the bar
  // the hint fades away on the first wheel / drag / key, or by itself after a few seconds (CSS)
  const [hintGone, setHintGone] = useState(false)
  useEffect(() => {
    if (hintGone) return
    const off = () => setHintGone(true)
    const ev = ['wheel', 'pointerdown', 'keydown', 'touchstart']
    ev.forEach((e) => window.addEventListener(e, off, { passive: true, once: true }))
    return () => ev.forEach((e) => window.removeEventListener(e, off))
  }, [hintGone])
  const [nameOn, setNameOn] = useState(() => !session.introDone && !reduced() && !returning)
  const [tocOn, setTocOn] = useState(false)
  useEffect(() => {   // the counter's contents close on Escape or a click anywhere else
    if (!tocOn) return
    const k = (e) => { if (e.key === 'Escape') setTocOn(false) }, c = (e) => { if (!e.target.closest || !e.target.closest('.toc-pop, .h-count')) setTocOn(false) }
    window.addEventListener('keydown', k); window.addEventListener('pointerdown', c, true)
    return () => { window.removeEventListener('keydown', k); window.removeEventListener('pointerdown', c, true) }
  }, [tocOn])
  const [fontOk, setFontOk] = useState(false)
  const nameRef = useRef(null)
  const goRef = useRef(go); goRef.current = go
  const token = useRef(0)
  // iteration 20: the site is vertical. Down runs sideways through a section; past its last plate the
  // row eases off upward and the next section's row rises in from below (and the reverse going up).
  // A nav click is the same move, landing on the section's first plate.
  /* iteration 23: the section change, A24-calm. Past the end of a row (the last 0.3 plate before the hand-off)
     the row starts to lean off along its diagonal and the next section's title card starts to show, scrubbed
     by the scroll position, so pulling back undoes it. At the hand-off the row slides away along the -30deg
     diagonal, the card holds the section's name with a pen line drawing in and its count, and the new row
     comes in from the other end of the diagonal and fans out. Input during the change is kept (Gallery pend)
     and applied the moment the new row is ready, so a reversal mid-change turns straight back. */
  const cardRef = useRef(null)
  const phaseRef = useRef(phase); phaseRef.current = phase
  const setCard = (c) => {
    const el = cardRef.current; if (!el || !c) return
    if (el.dataset.c === c) return
    el.dataset.c = c
    el.querySelector('.h-card-n').textContent = catOf0(c).label
    el.querySelector('.h-card-k').textContent = `${pad2(catOf0(c).items.length)} pieces`
    el.querySelector('.h-card-i').textContent = `${pad2(SEC_ORDER.indexOf(c) + 1)} / ${pad2(SEC_ORDER.length)}`
  }
  // iteration 24: a section's opening card, played on its own (first load at a section start)
  const flashCard = (c) => {
    const cd = cardRef.current; if (!cd || reduced()) return
    setCard(c); gsap.killTweensOf(cd); cd.classList.remove('is-draw'); void cd.offsetWidth; cd.classList.add('is-draw')
    gsap.fromTo(cd, { opacity: 0, '--cp': 0.4 }, { opacity: 1, '--cp': 1, duration: 0.4, ease: 'power1.out' })
    cd.dataset.fl = '1'
    gsap.to(cd, { opacity: 0, duration: 0.5, delay: 1.05, ease: 'power1.in', onComplete: () => { delete cd.dataset.fl } })
  }
  const preRef = useRef(() => {})
  preRef.current = () => {
    const g = gal.current, el = host.current, cd = cardRef.current
    if (!g || !el || !cd || phaseRef.current === 'switch' || reduced()) return
    const hi = g.N - 1, ov = g.L > hi ? g.L - hi : g.L < 0 ? g.L : 0
    const now = ROW[base.current] ? ROW[base.current].rowCat : 'prose', k = SEC_ORDER.indexOf(now) + 1
    // iteration 24: every section has its own opening space before its first plate. Past the end you scrub
    // into the next section's opening; back past the start you scrub into this section's own opening
    // iteration 31: back past the start scrubs into the previous section's card (destination), not this one's
    const p = (ov > 0 && k < SEC_ORDER.length) || ov < 0 ? Math.min(1, Math.abs(ov) / 0.3) : 0
    if (!p && cd.dataset.fl) return
    if (p > 0) { if (cd.dataset.fl) { gsap.killTweensOf(cd); delete cd.dataset.fl } setCard(ov > 0 ? SEC_ORDER[k] : (k > 1 ? SEC_ORDER[k - 2] : now)) }
    const d = Math.sign(ov) || 1, e = p * p
    el.style.transform = p ? `translate(${(-d * 3.4 * e).toFixed(3)}vw, ${(-d * 2 * e).toFixed(3)}vw)` : ''
    cd.style.opacity = (p * 0.55).toFixed(3); cd.style.setProperty('--cp', (p * 0.35).toFixed(3))
  }
  const secRef = useRef(null)
  secRef.current = (c, dir, local = 0, jump = false) => {
    const g = gal.current, el = host.current, cd = cardRef.current
    if (!g || !el || SEC_START[c] == null) return
    const from = ROW[base.current] ? ROW[base.current].rowCat : c
    const t = ++token.current
    setPhase('switch'); setHv(-1)
    try { history.replaceState(null, '', `#/${c}`) } catch { /* ignore */ }
    const red = reduced(), E = 'cubic-bezier(0.32,0.72,0,1)', X = 'power2.inOut'
    // going on you pass through the next section's opening; going back, back out through this one's
    // iteration 31: the card always names the destination section, in both directions
    setCard(c)
    gsap.killTweensOf([el, cd]); if (cd) delete cd.dataset.fl
    // along the row's diagonal (up-left going on, down-right going back): cos30, sin30
    const dx = 26, dy = 15
    const out = red ? null : gsap.to(el, { x: `${-dir * dx}vw`, y: `${-dir * dy}vw`, rotate: -dir * 1.5, opacity: 0, duration: jump ? 0.38 : 0.55, ease: X })
    if (cd) {
      cd.classList.remove('is-draw'); void cd.offsetWidth; cd.classList.add('is-draw')
      if (red) gsap.set(cd, { opacity: 0 })
      else gsap.to(cd, { opacity: 1, '--cp': 1, duration: 0.45, ease: 'power1.out' })
    }
    el.style.transform = ''
    NAV.hold = Promise.all([g.exit(), out]).then(() => {
      if (t !== token.current || !gal.current) return
      base.current = SEC_START[c]
      g.setSection(secItems(c), 'home', local)
      g.G.active = red ? 1 : 0.001; g.G.others = red ? 1 : 0; g.G.inbound = true
      setCur(SEC_START[c] + local); lastIdx.home = SEC_START[c] + local; ROWPOS.set = true
      if (!red) gsap.set(el, { x: `${dir * dx * 0.6}vw`, y: `${dir * dy * 0.6}vw`, rotate: dir * 1, opacity: 0 })
      // iteration 24: the card holds on the plain ground a beat longer and is gone before the new row lands
      const hold = red || jump ? 0 : 0.38
      if (cd && !red) gsap.to(cd, { opacity: 0, duration: 0.38, delay: Math.max(0, hold - 0.12), ease: 'power1.in' })
      return Promise.all([g.fan(), red ? null : gsap.to(el, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 0.9, delay: hold, ease: E })])
        .then(() => { if (t === token.current) { gsap.set(el, { clearProps: 'transform,opacity' }); setPhase('ready') } })
    })
  }
  const jumpRef = useRef(null)
  jumpRef.current = (c) => {
    const now = ROW[base.current] ? ROW[base.current].rowCat : 'prose'
    const g = gal.current
    if (!g || SEC_START[c] == null) return
    if (now === c) { if (g.index() !== 0) g.to(0, 'click'); return }
    secRef.current(c, SEC_ORDER.indexOf(c) > SEC_ORDER.indexOf(now) ? 1 : -1, 0, true)
  }
  const edgeRef = useRef(null)
  edgeRef.current = (dir) => {
    const now = ROW[base.current].rowCat, k = SEC_ORDER.indexOf(now) + dir
    // iteration 24: back past the very first plate replays Prose's own opening and lands on its first plate
    if (k < 0) { secRef.current(now, -1, 0); return }
    if (k >= SEC_ORDER.length) { const g = gal.current; if (g) g.nudge(dir); return }
    const c = SEC_ORDER[k]
    secRef.current(c, dir, dir > 0 ? 0 : catOf0(c).items.length - 1)
  }
  const [hv, setHv] = useState(-1)
  const [hr, setHr] = useState(null)
  const qRef = useRef(null)
  /* iteration 21: press D for a live readout of the scroll controller (to diagnose a real machine) */
  const dbgEl = useRef(null)
  const dbgRef = useRef(() => {})
  dbgRef.current = () => {
    const el = dbgEl.current, g = gal.current
    if (!el || !g || el.hidden) return
    const sec = ROW[base.current] ? ROW[base.current].rowCat : '?', P = base.current + g.L
    const vel = (g.L - (g._pl == null ? g.L : g._pl)) * 60; g._pl = g.L
    el.textContent = `P ${P.toFixed(3)}  (global plate ${Math.round(P) + 1}/${ROW.length})\nsection ${SEC_ORDER.indexOf(sec)} ${sec}  local ${g.L.toFixed(3)} → T ${g.T.toFixed(3)} of ${g.N - 1}\nvel ${vel.toFixed(2)} pl/s  pend ${g.pend.toFixed(2)}  busy ${g.busy() ? 'yes' : 'no'}\nlast delta ${(+g.dbg.d).toFixed(1)} mode ${g.dbg.mode} ${g.dbg.kind}\nboundary ${g.atEdge(1) ? 'at last plate' : g.atEdge(-1) ? 'at first plate' : '—'} ${g.dbg.edge || ''}`
  }
  useEffect(() => {
    const k = (e) => { if ((e.key === 'd' || e.key === 'D') && !e.metaKey && !e.ctrlKey && !e.altKey && !/input|textarea/i.test(e.target.tagName)) { const el = dbgEl.current; if (el) el.hidden = !el.hidden } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
  /* keep the line under the front plate's bottom edge, centred on it, plate-wide, never over the foot */
  // iteration 48: every frame this only reads (the plate's box is projected maths, the rest is measured once per
  // layout) and then writes; it used to write the caption and then read the nav, forcing a layout every frame
  const lay = useRef({ key: '' })
  const placeQ = () => {
    const q = qRef.current, g = gal.current, m = mainRef.current
    if (!q || !g || !m) return
    const r = g.rectOf(g.index()); if (!r) return
    const L = lay.current, key = `${window.innerWidth}x${window.innerHeight}|${phase}|${cur}|${sec}|${tocOn}`
    if (L.key !== key) {
      L.key = key; L.mb = m.getBoundingClientRect()
      L.feet = [...m.querySelectorAll('.h-flip, .h-count, .h-end')].map((e) => e.getBoundingClientRect()).filter((b) => b.width)
      const mk = m.querySelector('.h-mark'), hd = m.querySelector('.sn')
      L.sfY = mk ? (hd ? Math.max(mk.getBoundingClientRect().bottom, hd.getBoundingClientRect().bottom) : mk.getBoundingClientRect().bottom) : null
      L.sfSet = false
    }
    const mb = L.mb, W = mb.width, H = mb.height, qh = q.offsetHeight
    const mob = W <= 760, w = Math.max(mob ? 240 : 260, Math.min(r.w * (mob ? 1.05 : 1), 560, W - 24))
    const cx = Math.min(W - w / 2 - 12, Math.max(w / 2 + 12, r.x - mb.left + r.w / 2))
    let floor = H - 8
    L.feet.forEach((b) => {
      const l = b.left - mb.left, rr = b.right - mb.left
      if (rr > cx - w / 2 - 8 && l < cx + w / 2 + 8) floor = Math.min(floor, b.top - mb.top - 8)
    })
    const top = Math.max(0, Math.min(r.y - mb.top + r.h + (mob ? 10 : 14), floor - qh))
    q.style.left = `${cx.toFixed(1)}px`; q.style.top = `${top.toFixed(1)}px`; q.style.width = `${w.toFixed(0)}px`
    // the socials sit centred right under the name (on a phone, under the stacked nav so they never touch it)
    const sf = m.querySelector('.h-sfoot')
    if (sf && L.sfY != null && !L.sfSet) { L.sfSet = true; sf.style.top = `${(L.sfY - mb.top + (mob ? 8 : 10)).toFixed(1)}px` }
  }
  const placeRef = useRef(placeQ); placeRef.current = placeQ

  useLayoutEffect(() => {
    const el = host.current
    const g = gal.current = new GAL.mod.default(el, {
      touch: isTouch, frontTexture, backTexture,
      onChange: (i) => { const n = base.current + i; lastIdx.home = n; ROWPOS.set = true; setCur(n) },
      onHover: (i) => setHv(isTouch() ? -1 : i),
      onOpen: (i) => goRef.current(pieceRoute('home', base.current + i)),
      onEdge: (d) => edgeRef.current(d),
      onFrame: () => { placeRef.current(); preRef.current(); dbgRef.current() },
    })
    g.setSection(secItems(ROW[start0.current].rowCat), 'home', start0.current - base.current)
    // one axis everywhere: a wheel over the title block, nav or footer still moves the row (A24 does too)
    const mw = (e) => { if (!g.el.contains(e.target)) g.onWheel(e) }
    const mEl = mainRef.current
    if (mEl) mEl.addEventListener('wheel', mw, { passive: false })
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
          .then(() => { if (!live) return; setPhase('intro'); if (start0.current === base.current) flashCard(ROW[base.current].rowCat); wait(760).then(() => live && setNameOn(false)); return g.intro() })
          .then(() => live && setPhase('ready'))
      })
    } else {
      g.G.active = reduced() ? 1 : 0.001; g.G.others = reduced() ? 1 : 0; g.G.inbound = true
      if (start0.current === base.current) flashCard(ROW[base.current].rowCat)
      NAV.hold = g.fan().then(() => live && setPhase('ready'))
    }
    return () => { live = false; HOME.api = null; if (mEl) mEl.removeEventListener('wheel', mw); g.destroy(); gal.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* a Back / link to a section hash while the row is up: jump there unless already inside it */
  useEffect(() => {
    const g = gal.current
    if (!g || cat === 'home' || SEC_START[cat] == null) return
    if (ROW[base.current] && ROW[base.current].rowCat === cat) return
    jumpRef.current(cat)
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
        const it = ROW[base.current + i]
        const n = flyNode(g.rectOf(i), it, back)
        await Promise.all([...n.querySelectorAll('img')].map(decoded))
        await frames(1)
        g.hidePlate(i)
        const pr = pieceRoute('home', base.current + i)
        FLY.dir = 'in'; FLY.data = { cat: pr.cat, i: pr.i, back, mode: g.mode }
        setLeaving(true)
        return i
      },
      leave: async () => { const g = gal.current; setLeaving(true); if (g) await g.exit() },
      index: () => base.current + (gal.current ? gal.current.index() : 0),
    }
  })

  useEffect(() => {
    const on = (e) => {
      const g = gal.current
      if (!g || g.busy() || NAV.busy) return
      if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return
      const free = !(document.activeElement && document.activeElement.closest('a, button'))
      if (e.key === 'ArrowRight') { e.preventDefault(); g.step(1, 'key') }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); g.step(-1, 'key') }
      else if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); g.step(1, 'key') }
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); g.step(-1, 'key') }
      else if (e.key === 'Enter' && free) { e.preventDefault(); goRef.current(pieceRoute('home', base.current + g.index())) }
      else if (e.key === ' ' && free) { e.preventDefault(); g.flip() }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  useEffect(() => {
    if (hv < 0) { setHr(null); return }
    let raf = 0, last = ''
    const tick = () => {
      const g = gal.current, b = mainRef.current && mainRef.current.getBoundingClientRect()
      const r = g && b && g.rectOf(hv)
      if (r) { const k = `${r.x | 0},${r.y | 0},${r.w | 0},${r.h | 0}`; if (k !== last) { last = k; setHr({ x: r.x - b.left, y: r.y - b.top, w: r.w, h: r.h }) } }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [hv])
  const list = ROW
  const it = list[Math.min(cur, list.length - 1)]
  const hIt = hv >= 0 && phase === 'ready' && !leaving ? list[hv] : null
  useEffect(() => { if (gal.current && it) gal.current.tone(bgFor(it)) }, [it])
  // the nav follows the row: the section of the piece in front is the active one (and the hash)
  const sec = it.rowCat
  useEffect(() => {
    if (phase !== 'ready' || leaving) return
    const h = `#/${sec}`
    if (/^#\/?$|^#\/(prose|publications|deep|luck|paintings)$/.test(location.hash || '#/') && location.hash !== h) { try { history.replaceState(null, '', h) } catch { /* ignore */ } }
  }, [sec, phase, leaving])
  const meta = it.meta.filter(([, v]) => v).slice(0, 4)
  const show = phase === 'ready' && !leaving
  const chrome = phase !== 'loading' && !leaving
  const foot = chrome && phase !== 'fly' && phase !== 'intro'
  return (
    <main ref={mainRef} className={`h h-${phase} h-m-${shown}${leaving ? ' is-leaving' : ''}${nameOn ? ' h-naming' : ''}`} style={{ background: (bgOn || nameOn) && !leaving ? bgFor(it) : '#f2f2f2' }}
      aria-label={`${catOf(shown).label}. ${list.length} pieces. Arrow keys to move, Enter to open, Space to turn it over.`}>
      <div className="h-gl" ref={host} />

      <SiteNav go={go} active={sec} onJump={(c) => jumpRef.current(c)} className={`h-top${chrome ? ' is-on' : ''}`} />

      {/* iteration 21 (t81): under the front painting, in reading order: its title, then its first line written in by hand, then the details */}
      <div ref={qRef} className={`h-under${show ? ' is-on' : ''}`} key={`u-${shown}-${cur}`} aria-live="polite">
        <h1 className="h-title"><a href={`#/${it.cat}/${it.slug}`} onClick={(e) => { e.preventDefault(); go(pieceRoute('home', cur)) }}>{it.title}</a></h1>
        {it.line && it.cat === 'prose' && <blockquote className="h-quote h-quote-hw is-on">{it.line}</blockquote>}
        <p className="h-umeta">{(it.cat === 'paintings' ? meta.map(([, v]) => v) : [it.kind || (it.meta.find(([k]) => k === 'Kind' || k === 'Recognition') || [])[1], (it.meta.find(([k]) => k === 'Published' || k === 'Date') || [])[1] || it.date]).filter(Boolean).join(' \u00b7 ')}</p>
      </div>

      {/* iteration 18: the pen circles the plate under the pointer, and a story writes out its first line */}
      {hIt && hr && (
        <div className="h-hov" style={{ left: hr.x, top: hr.y, width: hr.w, height: hr.h }} aria-hidden="true">
          <Scribble w={hr.w} h={hr.h} on pad={0.07} redraw={hv} />
        </div>)}

      {/* iteration 20: the vertical run stops at the end of Luck; the art page is one clear click away */}
      {sec === SEC_ORDER[SEC_ORDER.length - 1] && cur === ROW.length - 1 && (
        <a className={`h-end${show ? ' is-on' : ''}`} href="#/art" onClick={(e) => { e.preventDefault(); go({ view: 'paintings' }) }}>Art that I love <span aria-hidden="true">→</span></a>)}
      <div className={`h-foot${foot ? ' is-on' : ''}`}>
        <button type="button" className={`h-count${tocOn ? ' is-open' : ''}`} aria-label={`${catOf(sec).label}, contents`} aria-expanded={tocOn} onClick={() => setTocOn((v) => !v)}>
          {pad2(cur - SEC_START[sec] + 1)} <i>/</i> {pad2(catOf0(sec).items.length)}
        </button>
      </div>
      {tocOn && foot && <Toc cat={sec} current={cur - SEC_START[sec]} className="toc-pop" onPick={(k) => { setTocOn(false); const g = gal.current; if (g && !g.busy()) g.to(SEC_START[sec] + k - base.current, 'click') }} />}
      {/* iteration 10: socials live bottom-left, away from the counter and the screen corner */}
      <div ref={cardRef} className="h-card" aria-hidden="true">
        <small className="h-card-i" />
        <span className="h-card-t"><span className="h-card-n" />
          <svg className="h-card-u" viewBox="0 0 300 18" preserveAspectRatio="none"><path d="M4 11 C 60 5, 120 15, 180 9 S 270 6, 296 10" pathLength="1" /></svg></span>
        <small className="h-card-k" />
      </div>
      <pre ref={dbgEl} className="h-dbg" hidden aria-hidden="true" />
      <div className={`h-sfoot${foot ? ' is-on' : ''}`}><Socials /></div>

      {nameOn && (
        <div ref={nameRef} className={`h-iname${fontOk ? ' is-f' : ''}`} aria-hidden="true">
          <span className="h-iname-m"><span>Shanmu Raja</span></span>
        </div>
      )}
    </main>
  )
}

function HomeGate(props) {
  const [ready, setReady] = useState(!!GAL.mod)
  useEffect(() => { if (!ready) { let live = true; loadGallery().then(() => live && setReady(true)); return () => { live = false } } }, [ready])
  if (ready) return <Home {...props} />
  const intro = !session.introDone && !reduced()
  return (
    <main className="h h-loading h-naming" style={{ background: '#f2f2f2' }} aria-busy="true">
      {intro && <div className="h-iname is-f" aria-hidden="true"><span className="h-iname-m"><span>Shanmu Raja</span></span></div>}
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
    // iteration 32: keep skipTop for this commit (StrictMode re-runs layout effects in dev, which used to reset to 0)
    if (SEAM.skipTop) setTimeout(() => { SEAM.skipTop = false }, 0); else toTop()
    NAV.dir = 0
    if (!flying) return
    let live = true
    const back = FLY.data.back
    const slot = cat === 'prose' && art.current.parentElement ? rectOfEl(art.current.parentElement) : null
    NAV.hold = flyTo(rectOfEl(art.current), { back: false, duration: back ? 0.95 : 0.85, clip: slot })
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
        const n = flyNode(rectOfEl(a), it, false, 0)
        if (cat === 'prose' && a.parentElement) {
          const s = a.parentElement.getBoundingClientRect(), f = a.getBoundingClientRect(), pc = (v, d) => `${Math.max(0, (v / d) * 100).toFixed(3)}%`
          n.style.clipPath = `inset(${pc(s.top - f.top, f.height)} ${pc(f.right - s.right, f.width)} ${pc(f.bottom - s.bottom, f.height)} ${pc(s.left - f.left, f.width)})`
        }
        await Promise.all([...n.querySelectorAll('img')].map(decoded))
        a.style.visibility = 'hidden'
        FLY.dir = 'out'; FLY.data = { cat, i, back: false, mode: 'home' }
        // iteration 19: the row comes back with this piece in front
        lastIdx.home = Math.max(0, ROW.findIndex((x) => x.cat === cat && x.slug === it.slug)); ROWPOS.set = true
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
  if (cat === 'prose') return <Story key={it.slug} {...{ it, cat, i, items, go, art, meta, honors, credit, hold }} />
  return (
    <article className={`pg pg-piece pg-c-${cat}${flying ? ' is-flown' : ' is-direct'}${dir ? ` is-step is-step-${dir > 0 ? 'n' : 'p'}` : ''}`}>
      <PageTop back={() => go(home)} backLabel={catOf(home.cat).label} active={cat} go={go} right={`${pad2(i + 1)} / ${pad2(items.length)}`} />
      <div className="pg-head">
        <h1 className="pg-title"><span>{it.title}</span></h1>
        <hr className="pg-rule" />
        {showBy && <p className="pg-by"><span>{it.by}</span></p>}
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
          {it.related && <p className="pg-related"><small>Related</small><a href={it.related.href} onClick={(e) => { e.preventDefault(); go(parse(it.related.href)) }}>{it.related.title}</a> <em>· {it.related.kind}</em></p>}
          {it.quote && <blockquote className="pg-quote"><span>{it.quote}</span></blockquote>}
          {cat !== 'prose' && it.line && norm(it.line) !== norm(it.quote) && <p className="pg-line">{it.line}</p>}
          {cat !== 'prose' && it.src && credit && <p className="pg-credit">Painting: {credit}</p>}
        </div>
      </div>
      {note ? <section className="pg-note"><h2>On the painting</h2><p>{note}</p></section> : null}
      {pgNav}
    </article>
  )
}

/* iteration 38: the story page, laid out like an A24 film page (a24.raviklaassens.com, measured at 1440 and 390).
   1 title block: big caps title, hairline, credit line, ruled info rows, then the handwritten first line and the
     double-ruled buttons between plus-stroke corner marks.
   2 the painting: the one image on the page, full bleed behind five ruled rows, taller than its section so
     scroll moves it (parallax); the pull line sits on the rules.
   3 the opening, 4 more to read as ruled rows, 5 the next story on the rules of a greyer section.
   Motion: one scroll handler computes every transform from scroll position (scrubbed, reversible). At the bottom
   further input fills a push value q (wheel 620px, touch 380px, as A24); q drives the rules and the title in the
   next section; at q = 1 the next story opens at its top. Let go early and q drains back. Up at a story's top goes
   back one story, landing on its last screen. */
const PUSH38 = { wheel: 620, touch: 380, hold: 180, drain: 0.9 }
const clamp01 = (v) => Math.min(1, Math.max(0, v))
// break a line into a few chunks that fit a row at the display size
function chunks(text, max) {
  const out = []; let cur = ''
  for (const w of String(text || '').split(/\s+/).filter(Boolean)) { if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w } else cur = cur ? cur + ' ' + w : w }
  if (cur) out.push(cur)
  return out
}
// the sentence over the painting is shown whole: as many rows as it needs, the type only as small as it must be.
// Mirrors the painting rows in iter38.css (side padding 9vw / 4vw, section 124vh / 88vh, display size 5.2vw / 8.4vw).
function fitPull(text, mobile) {
  const vw = window.innerWidth, vh = window.innerHeight
  const base = mobile ? Math.min(35.8, vw * 0.084) : Math.min(72, vw * 0.052)
  const keep = chunks(text, mobile ? 12 : 16)
  if (!text || keep.length <= 4) return { rows: keep, n: 4, f: null }
  const W = vw - 2 * (mobile ? 7 + vw * 0.04 : 6 + vw * 0.09), Hs = (mobile ? 0.88 : 1.24) * vh, most = mobile ? 7 : 6
  for (let f = base; f >= 12; f -= 1) {
    const rows = chunks(text, Math.floor(W / (f * 0.64)))
    const n = Math.max(4, rows.length)
    if (rows.length <= most && f <= (Hs / (n + 1)) * 0.62) return { rows, n, f }
  }
  return { rows: chunks(text, Math.floor(W / (12 * 0.64))), n: most, f: 12 }
}
const factsOf = (x) => { const v = (k) => ((x.meta || []).find(([y]) => y === k) || [])[1]; return [x.kind || v('Kind'), v('Venue'), v('Published')].filter(Boolean).join(' · ') }
function Story({ it, cat, i, items, go, art, meta, honors, credit, hold }) {
  const t = TEASERS[it.slug] || {}
  const root = useRef(null), zone = useRef(null), pillRef = useRef(null)
  const flown = useRef(hold)
  // the painting's parallax, on its frame: the frame's box is then exactly where the image shows
  const parallax = () => {
    const f = art.current, sec = f && f.parentElement; if (!f || !sec || reduced()) return
    const b = sec.getBoundingClientRect(), H = window.innerHeight, p = clamp01((H - b.top) / (H + b.height))
    f.style.transform = `translate3d(0,${((p - 1) * (f.offsetHeight - b.height)).toFixed(1)}px,0)`
  }
  const N = items.length, next = (i + 1) % N
  const nx = items[next]
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 760
  // the story arrives the way A24's film page does: the page fades in, then the head rises out of its masks
  useLayoutEffect(() => {
    toTop()
    const el = root.current; if (!el || reduced()) return
    const q = (s) => [...el.querySelectorAll(s)]
    parallax()
    if (flown.current) gsap.set(q('.s38-paint .s38-w > .s42-r'), { yPercent: RISE.shift })
    const tl = gsap.timeline()
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
    tl.fromTo(q('.s42-head .s38-title .s42-r'), { yPercent: RISE.shift }, { yPercent: 0, duration: RISE.dur, ease: 'energy', stagger: RISE.titleStagger }, 0.05)
    tl.fromTo(q('.s42-head > :not(.s38-title):not(.s42-open) .s42-r'), { yPercent: RISE.shift }, { yPercent: 0, duration: RISE.dur, ease: 'energy', stagger: RISE.textStagger }, RISE.text)
    tl.fromTo(q('.s42-head .s42-open > :not(.s42-btns)'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: RISE.dur, ease: 'energy', stagger: RISE.textStagger }, RISE.text + 0.08)
    tl.fromTo(q('.s42-head .s42-btns'), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: RISE.pop, ease: 'energy' }, RISE.cta)
    return () => { tl.kill() }
  }, [it.slug]) // eslint-disable-line react-hooks/exhaustive-deps
  // arriving from the gallery: the copy has landed exactly on the real painting, so nothing moves at the hand-off;
  // once it is gone, the words rise in, as the title did
  useEffect(() => {
    const el = root.current
    if (!el || hold || !flown.current) return
    flown.current = false
    const ws = el.querySelectorAll('.s38-paint .s38-w > .s42-r')
    if (reduced()) { gsap.set(ws, { yPercent: 0 }); return }
    let live = true, tw = null
    Promise.race([Promise.resolve(NAV.hold), wait(1500)]).then(() => { if (live) tw = gsap.to(ws, { yPercent: 0, duration: RISE.dur, ease: 'energy', stagger: RISE.titleStagger, delay: 0.05 }) })
    return () => { live = false; if (tw) tw.kill() }
  }, [hold])
  // THE scroll driver. Its listeners are all passive and never cancel anything; Lenis does the scrolling. At the end of the
  // page a deliberate push fills the bar and turns to the next story, with A24's rules for what counts as one.
  useEffect(() => {
    const el = root.current; if (!el) return
    const red = reduced()
    let ruled = false, raf = 0, lastY = window.scrollY, P = 0, D = 0, lastPush = 0, loopRaf = 0, loopT = 0, leaving = false, armed = false, endSince = 0, lastT = 0, lastAbs = 0, arrived = false, ty = null
    const q$ = (s) => el.querySelectorAll(s)
    const hero = el.querySelector('.s38-paint'), img = el.querySelector('.s38-paint-img'), words = q$('.s38-paint .s38-w')
    const nx$ = zone.current, nlines = q$('.s42-nx .s42-r'), nrules = q$('.s42-nx .s38-rule'), fill = el.querySelector('.s42-nx .s38-fill'), plate = el.querySelector('.s42-nplate'), plateIn = el.querySelector('.s42-nplate-in'), hint = el.querySelector('.s42-nx .s42-hint')
    const prog = (node) => { const b = node.getBoundingClientRect(), H = window.innerHeight; return { p: clamp01((H - b.top) / (H + b.height)), h: b.height } }
    const atEnd = () => { const l = SCROLL.lenis; if (l && typeof l.limit === 'number') return (typeof l.targetScroll === 'number' ? l.targetScroll : l.scroll) >= l.limit - 2; return window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2 }
    if (!red) { gsap.set(nrules, { scaleX: 0, transformOrigin: 'left center' }); gsap.set(nlines, { yPercent: RISE.shift }); if (plate) gsap.set(plate, { scale: 0.35, autoAlpha: 0 }) }
    // the footer comes in: its rules draw as soon as it is on screen, so it is never an empty band; then the next
    // title rises and the plate pops once it is 30% in (A24 arriveStart .3)
    const rule = () => { ruled = true; if (!red) gsap.to(nrules, { scaleX: 1, duration: 0.9, ease: 'energy', stagger: 0.06 }) }
    const arrive = () => {
      arrived = true
      if (!ruled) rule()
      if (red) return
      gsap.to(nlines, { yPercent: 0, duration: RISE.dur, ease: 'energy', stagger: 0.05, delay: 0.08 })
      if (plate) gsap.to(plate, { scale: 1, autoAlpha: 1, duration: 1.05, ease: 'energy', delay: 0.12 })
    }
    const paint = () => {
      raf = 0
      const y = window.scrollY, dy = y - lastY; lastY = y
      const pl = pillRef.current
      if (pl) { if (y < window.innerHeight * 0.6 || dy > 1 || (nx$ && nx$.getBoundingClientRect().top < window.innerHeight - 40)) pl.classList.remove('is-on'); else if (dy < -1) pl.classList.add('is-on') }
      if (!red && hero && img) {
        const { p } = prog(hero)
        parallax()
        words.forEach((w, k) => { const s = k % 2 ? -1 : 1; w.style.transform = `translate3d(${(s * (p - 0.5) * (window.innerWidth <= 760 ? 3 : 8)).toFixed(2)}vw,0,0)` })
      }
      if (nx$) {
        // A24's range for the footer: from its top at the bottom of the screen to its bottom there
        const nb = nx$.getBoundingClientRect(), p = clamp01((window.innerHeight - nb.top) / Math.max(1, nb.height))
        if (!ruled && p > 0.02) rule()
        if (!arrived && p >= NEXT.arrive) arrive()
        if (fill) fill.style.transform = `scaleX(${D.toFixed(4)})`
        if (plateIn && !red) plateIn.style.transform = `translate3d(0,${(-D * 10).toFixed(2)}%,0) scale(${(1 + D * (NEXT.grow - 1)).toFixed(4)})`
      }
      const end = atEnd()
      if (end) { if (!endSince) endSince = performance.now() } else { endSince = 0; armed = false; if (P > 0) P = 0 }
      if (hint) hint.classList.toggle('is-on', end && !leaving)
    }
    const kickP = () => { if (!raf) raf = requestAnimationFrame(paint) }
    // after 180ms without input the push drains at 0.9 per second; the bar follows it at 10 per second
    const step = (now) => {
      loopRaf = 0
      const dt = Math.min(0.05, Math.max(0, (now - loopT) / 1000)); loopT = now
      if (now - lastPush > NEXT.hold) P = Math.max(0, P - dt * NEXT.drain)
      D += (P - D) * Math.min(1, dt * NEXT.ease); if (Math.abs(P - D) < 0.0015) D = P
      kickP()
      if (!leaving && (P > 0 || D > 0)) loopRaf = requestAnimationFrame(step)
    }
    const loop = () => { if (!loopRaf) { loopT = performance.now(); loopRaf = requestAnimationFrame(step) } }
    const commit = () => {
      if (leaving) return
      leaving = true; P = 1; D = 1; kickP()
      const turn = () => go({ view: 'piece', cat, i: next }, { fade: true })
      if (red) { turn(); return }
      const tl = gsap.timeline()
      if (plate) tl.to(plate, { scale: 0.35, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 0)
      tl.to(nlines, { yPercent: -RISE.shift, duration: 0.45, ease: 'energy', stagger: 0.03, overwrite: 'auto' }, 0)
      tl.to(nrules, { scaleX: 0, duration: 0.5, ease: 'energy', stagger: { each: 0.04, from: 'end' }, overwrite: 'auto' }, 0.05)
      tl.call(turn, null, NEXT.exitGo)
    }
    const push = (v) => {
      if (leaving || !atEnd()) return
      P = clamp01(P + v); lastPush = performance.now()
      if (P >= 1) { commit(); return }
      loop()
    }
    const wh = (e) => {
      if (e.ctrlKey) return
      const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerWidth : 1, dx = e.deltaX * k
      if (Math.abs(dx) > Math.abs(e.deltaY * k) * 1.25) { side(dx, e.timeStamp || performance.now()); return }
      const d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1)
      if (!d) return
      const now = e.timeStamp || performance.now(), prev = lastT; lastT = now
      const a = Math.abs(d), surge = a > NEXT.surgeMin && a > lastAbs * NEXT.surge; lastAbs = a
      if (!atEnd()) return
      if (!endSince) endSince = now
      if (!armed) { if (now - endSince < NEXT.settle || !(now - prev >= NEXT.gap || surge)) return; armed = true }
      push(Math.max(-NEXT.clamp, Math.min(NEXT.clamp, d)) / NEXT.wheel)
    }
    // sideways: a gesture that travels SIDE px to the right (fingers left to right) goes back to the carousel.
    // A pause of 140ms starts a new gesture; one gesture goes back at most once.
    let sAcc = 0, sT = 0, sSpent = false
    const side = (dx, now) => {
      if (now - sT > NEXT.gap) { sAcc = 0; sSpent = false }
      sT = now
      if (sSpent || leaving) return
      sAcc = dx < 0 ? sAcc - dx : 0
      if (sAcc >= SIDE) { sSpent = true; leaving = true; go({ view: 'browse', cat }) }
    }
    const ts = (e) => { ty = e.touches[0] ? e.touches[0].clientY : null }
    const tmv = (e) => { const yy = e.touches[0] && e.touches[0].clientY; if (ty == null || yy == null) return; const dy = ty - yy; ty = yy; push(dy / NEXT.touch) }
    const te = () => { ty = null }
    const key = (e) => {
      if (e.defaultPrevented || (e.target && e.target !== document.body && e.target.closest && e.target.closest('input, textarea, select, [contenteditable]'))) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') push(NEXT.key)
    }
    paint()
    const L = SCROLL.lenis; if (L) L.on('scroll', kickP)
    window.addEventListener('scroll', kickP, { passive: true }); window.addEventListener('resize', kickP)
    window.addEventListener('wheel', wh, { passive: true }); window.addEventListener('touchstart', ts, { passive: true }); window.addEventListener('touchmove', tmv, { passive: true }); window.addEventListener('touchend', te, { passive: true }); window.addEventListener('keydown', key)
    return () => {
      cancelAnimationFrame(raf); cancelAnimationFrame(loopRaf); if (L) L.off('scroll', kickP)
      gsap.killTweensOf([...nlines, ...nrules, plate].filter(Boolean))
      window.removeEventListener('scroll', kickP); window.removeEventListener('resize', kickP); window.removeEventListener('wheel', wh); window.removeEventListener('touchstart', ts); window.removeEventListener('touchmove', tmv); window.removeEventListener('touchend', te); window.removeEventListener('keydown', key)
    }
  }, [it.slug]) // eslint-disable-line react-hooks/exhaustive-deps
  const mv = (k) => (meta.find(([x]) => x === k) || [])[1]
  const venue = mv('Venue')
  const facts = factsOf(it)
  const op = t.opening || []
  const fit = fitPull(t.pull, mobile), pull = fit.rows
  const nxHref = `#/${cat}/${nx.slug}`, toNext = (e) => { e.preventDefault(); go({ view: 'piece', cat, i: next }, { fade: true }) }
  const nxLines = (() => { const c = chunks(nx.title, mobile ? 14 : 16); return c.length > 3 ? [c[0], c[1], c.slice(2).join(' ')] : c })()
  const read = it.href
    ? <a className="s38-btn" href={it.href} target="_blank" rel="noreferrer">{`Read on ${venue || ''}`.trim()} <b aria-hidden="true">↗</b></a>
    : <span className="s38-btn is-muted">Not yet published</span>
  return (
    <article ref={root} className={`pg pg-piece pg-story s38 pg-c-${cat} is-direct`}>
      <PageTop back={() => go({ view: 'browse', cat })} backLabel={catOf(cat).label} active={cat} go={go} right={`${pad2(i + 1)} / ${pad2(N)}`} />
      <a ref={pillRef} className="mp35" href={`#/${cat}`} onClick={(e) => { e.preventDefault(); go({ view: 'browse', cat }) }}><span aria-hidden="true">←</span> Menu</a>
      {/* iteration 45: a Paris Review fiction page (theparisreview.org, measured): title, a byline row between two rules,
          the opening set like a book (first paragraph flush, the rest indented), then the link */}
      <header className="s38-head s42-head pr45">
        <h1 className="s38-title pr45-title"><span className="s42-m"><span className="s42-r">{it.title}</span></span></h1>
        {it.subject && <p className="pr45-deck"><span className="s42-m"><span className="s42-r">{it.subject}</span></span></p>}
        <div className="pr45-by"><span className="s42-m"><span className="s42-r pr45-by-in"><span className="pr45-author">Shanmu Raja</span>{facts && <span className="pr45-facts">{facts}</span>}</span></span></div>
        {honors && <div className="s42-honors pr45-honor"><div className="s42-m"><div className="s42-r">{honors}</div></div></div>}
        <div className={`s42-open pr45-text${op.length ? '' : ' is-bare'}`}>
          {op.map((x, k) => <p key={k} className="s42-p">{x}</p>)}
          <div className="s38-btns s42-btns">{read}</div>
        </div>
      </header>
      {it.src && (
        <section className="s38-paint s38-sec" aria-label={credit || it.title} style={{ background: placeholderOf(it.src), ...(fit.n > 4 ? { gridTemplateRows: `repeat(${fit.n + 1}, 1fr)` } : {}) }}>
          <div ref={art} className="s38-paint-f" style={{ visibility: hold ? 'hidden' : undefined }}><img className="s38-paint-img" src={variantFor(it.src, STORY_CSS)} alt={credit || it.title} decoding="async" fetchpriority="high" /></div>
          {Array.from({ length: fit.n + 1 }, (_, k) => <div key={k} className="s38-row">{k > 0 && pull[k - 1] && <span className={`s38-w ${k % 2 ? 'is-l' : 'is-r'}`} style={fit.f ? { fontSize: `${fit.f}px` } : undefined}><span className="s42-r">{pull[k - 1]}</span></span>}</div>)}
        </section>)}
      {it.src && credit && <p className="s42-cap"><span className="s38-lab">Painting</span><span className="s42-cap-v">{credit}</span></p>}
      <div className="s42-again">{it.href && <a className="s38-btn" href={it.href} target="_blank" rel="noreferrer">{`Read on ${venue || ''}`.trim()} <b aria-hidden="true">↗</b></a>}</div>
      <section className="s38-next s42-nx" ref={zone} aria-label={`Next story: ${nx.title}`}>
        {[0, 1, 2, 3, 4].map((k) => (
          <div key={k} className="s38-row"><i className="s38-rule" aria-hidden="true" />
            {k === 0 && <span className="s42-m s42-dest"><span className="s42-r s38-lab">{pad2(next + 1)} / {pad2(N)}</span></span>}
            {k >= 1 && k <= 3 && nxLines[k - 1] && <a className={`s42-m s42-line ${k % 2 ? 'is-l' : 'is-r'}`} href={nxHref} onClick={toNext}><span className="s42-r">{nxLines[k - 1]}</span></a>}
          </div>))}
        {nx.src && <a className="s42-nplate" href={nxHref} onClick={toNext} aria-hidden="true" tabIndex={-1}><span className="s42-nplate-in"><img src={variantFor(nx.src, 1200)} alt="" loading="lazy" decoding="async" /></span></a>}
        <div className="s42-bar" aria-hidden="true"><i className="s38-fill" /></div>
        <span className="s38-lab s42-hint" aria-hidden="true">Keep scrolling</span>
      </section>
    </article>
  )
}

function About({ go }) {
  useLayoutEffect(() => { toTop() }, [])
  return (
    <article className="pg pg-about">
      <PageTop back={() => go({ view: 'browse', cat: lastCat.current })} backLabel="Back" go={go} active="about" right="" />
      <div className="pg-head"><h1 className="pg-title"><span>About</span></h1><hr className="pg-rule" /></div>
      <div className="ab">
        <img src="/headshot-700.webp" alt="Shanmu Raja" width="700" height="1049" />
        <div>
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
  useLayoutEffect(() => { toTop() }, [])
  return (
    <article className="pg pg-paint">
      <PageTop back={() => go({ view: 'browse', cat: lastCat.current })} backLabel="Back" go={go} active="paintings" right={`${PAINTINGS.length} paintings`} />
      <div className="pg-head"><h1 className="pg-title"><span>ART THAT I LOVE</span></h1><hr className="pg-rule" /></div>
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
  useEffect(() => {
    if (parse(window.location.hash).view === 'browse') { loadGallery(); return }
    // after the page has fully loaded (its painting included), in idle time, so it never competes with what is on screen
    let id = 0
    const later = () => loadGallery()
    const kick = () => { id = window.requestIdleCallback ? window.requestIdleCallback(later, { timeout: 4000 }) : setTimeout(later, 1500) }
    if (document.readyState === 'complete') kick(); else window.addEventListener('load', kick, { once: true })
    return () => { window.removeEventListener('load', kick); if (window.cancelIdleCallback) window.cancelIdleCallback(id); clearTimeout(id) }
  }, [])
  // iteration 24: a page opened straight from a link still has somewhere to go Back to: seed the section
  // underneath it (at that very plate) so the mouse back button / swipe / Alt+Left land in the gallery
  useEffect(() => {
    const r = parse(window.location.hash)
    if (r.view === 'browse' || (history.state && history.state.seeded)) return
    const h = window.location.hash
    const c = r.view === 'piece' && SEC_START[r.cat] >= 0 ? r.cat : 'prose'
    if (r.view === 'piece') { const k = ROW.findIndex((x) => x.cat === r.cat && x.slug === catOf(r.cat).items[r.i]?.slug); if (k >= 0) { lastIdx.home = k; ROWPOS.set = true } }
    try { history.replaceState({ seeded: 1 }, '', `#/${c}`); history.pushState({ seeded: 1 }, '', h) } catch { /* ignore */ }
  }, [])
  const [route, setRoute] = useState(() => parse(window.location.hash))
  const routeRef = useRef(route); routeRef.current = route
  if (route.view === 'browse') lastCat.current = route.cat

  const go = useCallback(async (r, opts = {}) => {
    if (NAV.busy) { NAV.pending = [r, opts]; return }
    const from = routeRef.current
    if (same(from, r)) { if (opts.pop) return; return }
    NAV.busy = true; NAV.to = r
    try {
      if (NAV.hold && !(from.view === 'browse' && r.view === 'browse')) { await Promise.race([NAV.hold, wait(2500)]); NAV.hold = null }
      if (from.view === 'browse') {
        if (r.view === 'piece' && HOME.api && !opts.direct) {
          const now = pieceRoute('home', HOME.api.index())
          if (!same(now, r)) r = now
          if (!reduced()) await HOME.api.open()
        } else if (r.view !== 'browse' && HOME.api && !reduced()) await HOME.api.leave()
      } else if (from.view === 'piece' && r.view === 'piece' && r.cat === from.cat) {
        NAV.dir = (r.i > from.i && !(from.i === 0 && r.i === catOf(r.cat).items.length - 1)) || (from.i === catOf(r.cat).items.length - 1 && r.i === 0) ? 1 : -1
        if (!reduced() && opts.fade) { const el = document.querySelector('.pg'); if (el) await gsap.to(el, { autoAlpha: 0, duration: 0.4 }) }
        else if (!reduced() && !opts.seam) { const el = document.querySelector('.pg'); if (el) { el.classList.add(NAV.dir > 0 ? 'is-out-n' : 'is-out-p'); await wait(240) } }
      } else if (from.view === 'piece' && r.view === 'browse' && PAGE.api) await PAGE.api.toGallery()
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
  useEffect(() => { if (route.view === 'browse') stopLenis(); else startLenis() }, [route.view])
  useEffect(() => { document.documentElement.classList.toggle('is-story', route.view === 'piece' && route.cat === 'prose') }, [route.view, route.cat])
  useEffect(() => () => stopLenis(), [])
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
  if (route.view === 'paintings') return <Paintings go={go} />
  return <HomeGate cat={route.cat} go={go} />
}
