// Ink-dot cursor (iteration 30). Fine-pointer/hover devices only. The system cursor is hidden only
// once this runs and adds html.has-ink, so if JS fails the normal cursor stays.
const HOVER = 'a, button, [role="button"], label, summary, select, .st-plate, .h-plate, .plate, nav a, [data-hover]'
const TEXT = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]'
export function inkCursor() {
  if (typeof window === 'undefined' || !window.matchMedia) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const red = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const dot = document.createElement('div')
  dot.className = 'ink-dot'; dot.setAttribute('aria-hidden', 'true')
  document.body.appendChild(dot)
  document.documentElement.classList.add('has-ink')
  let tx = -100, ty = -100, x = -100, y = -100, s = 1, ts = 1, raf = 0, on = false
  const paint = () => {
    raf = 0
    const k = red ? 1 : 0.35
    x += (tx - x) * k; y += (ty - y) * k; s += (ts - s) * (red ? 1 : 0.25)
    dot.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${s.toFixed(3)})`
    if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 || Math.abs(ts - s) > 0.005) raf = requestAnimationFrame(paint)
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(paint) }
  let hov = false, down = false, txt = false
  const scale = () => { ts = txt ? 0 : (hov ? 1.8 : 1) * (down ? 0.8 : 1); kick() }
  const show = (v) => { if (v !== on) { on = v; dot.classList.toggle('is-on', v) } }
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    tx = e.clientX; ty = e.clientY
    if (!on) { x = tx; y = ty; show(true) }
    const t = e.target instanceof Element ? e.target : null
    const h = !!(t && t.closest(HOVER)), te = !!(t && t.closest(TEXT))
    if (h !== hov || te !== txt) { hov = h; txt = te; scale() } else kick()
  }, { passive: true })
  window.addEventListener('pointerdown', () => { down = true; scale() }, { passive: true })
  window.addEventListener('pointerup', () => { down = false; scale() }, { passive: true })
  document.addEventListener('mouseleave', () => show(false))
  document.documentElement.addEventListener('mouseleave', () => show(false))
  window.addEventListener('blur', () => show(false))
}
