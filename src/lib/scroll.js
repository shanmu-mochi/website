/* Scroll-linked animation. Every registered element gets a --p from 0 to 1
   driven purely by scroll position, so scrolling back rewinds it. */

const items = new Map()
let vh = 0
let queued = false
const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function measure(entry) {
  const top = entry.el.getBoundingClientRect().top + window.scrollY
  entry.start = top - vh * entry.startAt
  entry.end = top - vh * (entry.startAt - entry.span)
}

function write(entry) {
  const range = entry.end - entry.start
  const raw = range > 0 ? (window.scrollY - entry.start) / range : 1
  const p = raw < 0 ? 0 : raw > 1 ? 1 : raw
  if (p === entry.last) return
  entry.last = p
  entry.el.style.setProperty('--p', p.toFixed(4))
  if (entry.onProgress) entry.onProgress(p)
}

function tick() {
  queued = false
  items.forEach(write)
}

function onScroll() {
  if (queued) return
  queued = true
  requestAnimationFrame(tick)
}

function remeasure() {
  vh = window.innerHeight || 1
  items.forEach((entry) => { entry.last = -1; measure(entry) })
  tick()
}

let wired = false
function wire() {
  if (wired || typeof window === 'undefined') return
  wired = true
  vh = window.innerHeight || 1
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', remeasure)
  window.addEventListener('load', remeasure)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure)
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(remeasure).observe(document.documentElement)
  }
}

/* span and startAt are fractions of a viewport: the element begins animating
   when its top sits at startAt down the screen, and finishes span later. */
export function register(el, { span = 0.45, startAt = 0.92, onProgress } = {}) {
  if (!el) return () => {}
  if (reduced) {
    el.style.setProperty('--p', '1')
    if (onProgress) onProgress(1)
    return () => {}
  }
  wire()
  const entry = { el, span, startAt, onProgress, start: 0, end: 1, last: -1 }
  measure(entry)
  write(entry)
  items.set(el, entry)
  return () => { items.delete(el) }
}

export function refresh() { remeasure() }
