/* The home browser: a three.js gallery that moves like the A24 disc browser (a24.raviklaassens.com).
   Behaviour was studied from frame captures and its parameters; the code is our own. Spec: NOTES-A24-STUDY.md.

   One continuous position L (0..N-1). Every object has a target pose from its offset m = index - L,
   computed by the section's arrangement inside a tilted group. Objects chase their targets at a rate that
   falls with distance, so far ones trail. Steps (wheel, keys, clicks) are tweens of L on the "discGlide"
   curve with a velocity kick that leans and banks the row; a drag release coasts, then settles on a spring.

   Sections share the engine but not the object or the staging:
     prose        framed painting plates on A24's diagonal arc
     publications white-paper chapbooks with a spine, on a flatter, straighter shelf
     luck         square award cards on a vertical drum */
import * as THREE from 'three'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)
export const GLIDE = CustomEase.create('discGlide', '0.32, 0.72, 0, 1')

/* The diagonal. A24 uses -30° on both axes; Shanmu found that a tad steep (iteration 7). */
export const TILT = -19

const pressure = (v) => {
  // soft swipe stays soft, a hard one gains more than proportionally (main site, App.jsx)
  const m = Math.abs(v)
  return m < 1 ? 0 : Math.max(-CFG.mMax, Math.min(CFG.mMax, Math.sign(v) * CFG.mRef * Math.pow(m / CFG.mRef, CFG.mGamma) * CFG.mPower))
}
export const CFG = {
  galleryScale: 1.08, camDist: 4.4, fov: 40,
  hoverTilt: 0.21, dragSens: 0.6, dragSmooth: 0.32, dragMaxV: 0.32, dragStart: 5,
  glideTau: 0.36, glideMaxV: 0.125,              // release coast: the original carousel's TAU
  snapDuration: 0.62, snapFreq: 9.5, snapDamping: 12,
  flowLean: 0.055, flowLeanMax: 0.3, flowBank: 0.32, flowDip: 0.014, flowDipMax: 0.09,
  followTight: 15, followBase: 11, followFalloff: 1.15, followMin: 6.5,
  flightRecede: 2.2, flightStagger: 0.45, flightStaggerIn: 0.28, flightStaggerMax: 4, popOut: 0.35, popIn: 0.02,
  preloadBoost: 0.8, preloadGrowBy: 0.5, preloadSpin: 1.1, preloadRise: 3, preloadDepth: 0.7, fanDuration: 1.15,
  touchGap: 2.2, touchDepth: 0.5, touchDrop: 1, touchActive: 1.5, touchInactive: 0.6, touchFlick: 0.035, touchSpan: 1.15,
  resetDuration: 1.2, renderRadius: 6,
  wheelFloor: 0.3,
  // iteration 14: vertical intent. A gesture ends after gestureGap ms without events; sectionPx of
  // vertical travel inside one gesture (or one mouse-wheel notch) asks for the next section.
  gestureGap: 220, sectionPx: 70, sectionDrag: 90,
  // iteration 17: side scroll slowed ~35-40% (dragSens .95->.6, dragMaxV .5->.32, glideTau .55->.36,
  // glideMaxV .2->.125, mPower .8->.5, wheelPx 420->650, touchSpan 1.8->1.15, snapDuration .46->.62)
  // momentum ported from the deployed site (main: src/App.jsx gallery drift): px/s hand speed ->
  // pressure curve -> exponential coast (glideTau). wheelPx = screen px that count as one piece.
  mPower: 0.5, mMax: 3800, mRef: 1200, mGamma: 1.5, mSample: 110, mFresh: 140, wheelPx: 650,
}

/* per-section staging: group tilt, object proportions, arrangement */
export const SECTIONS = {
  prose: { tiltX: TILT, tiltY: TILT, area: 2.9, maxSide: 2.1, depth: 0.024, edge: 0xffffff, spine: 0xffffff },
  publications: { tiltX: TILT * 0.55, tiltY: TILT * 0.7, aspect: 0.72, area: 2.2, maxSide: 2, depth: 0.075, edge: 0xf3f0e8, spine: 0xe6e1d6 },
  // iteration 12: the home "Selected" row stages like prose; each plate keeps its own section's shape
  get home() { return this.prose },
  luck: { tiltX: TILT * 0.45, tiltY: TILT * 0.85, aspect: 1, area: 1.9, maxSide: 1.5, depth: 0.04, edge: 0xefe6d2, spine: 0xefe6d2 },
}

const rad = THREE.MathUtils.degToRad
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const outCubic = (t) => 1 - (1 - t) ** 3

/* ---- one renderer for the life of the page, so leaving and coming back never makes a new GL context ---- */
let RENDERER = null
function renderer() {
  if (!RENDERER) {
    RENDERER = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    RENDERER.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    RENDERER.outputColorSpace = THREE.SRGBColorSpace
    RENDERER.setClearColor(0x000000, 0)
    RENDERER.domElement.className = 'gl'
  }
  return RENDERER
}

/* ---- textures live as long as the page: a section you come back to is instant ---- */
const TEX = new Map()
const loader = new THREE.TextureLoader()
export function texture(key, make) {
  if (!TEX.has(key)) TEX.set(key, Promise.resolve(make()).then((t) => { if (t) { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4 } return t }))
  return TEX.get(key)
}
export const imageTexture = (url) => texture(url, () => new Promise((res) => loader.load(url, res, undefined, () => res(null))))

export function plateSize(it, sec) {
  const a = sec.aspect || it.aspect
  let h = Math.sqrt(sec.area / a), w = a * h
  const m = Math.max(w, h)
  if (m > sec.maxSide) { w *= sec.maxSide / m; h *= sec.maxSide / m }
  return [w, h]
}

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _qi = new THREE.Quaternion()

export default class Gallery {
  constructor(el, opts) {
    this.el = el; this.o = opts
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.items = []; this.N = 0; this.plates = []; this.mode = 'prose'
    this.L = 0; this.Se = 0; this.Te = 0; this.Ce = 0; this.we = 0
    this.G = { active: 1, others: 1, inbound: false }
    this.q = { active: false, rise: 1, turn: 1 }
    this.tw = { value: 0 }; this.tweening = false; this.target = -1
    this.hover = -1; this.U = 0; this.Ue = 0
    this.drag = null; this.flight = false; this.cur = -1
    this.wheel = { v: 0, t: 0 }
    this.tls = new Set()

    const r = this.renderer = renderer()
    el.appendChild(r.domElement)
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0xf2f2f2, 7, 14)
    this.cam = new THREE.PerspectiveCamera(CFG.fov, 1, 0.1, 60)
    this.cam.position.set(0, 0, CFG.camDist); this.cam.lookAt(0, 0, 0)
    this.root = new THREE.Group()
    this.scene.add(this.root)
    this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2()
    this.geos = []
    this.bind()
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  get touch() { return this.o.touch() }
  tl(vars) { const t = gsap.timeline({ ...vars, onComplete: () => { this.tls.delete(t); vars && vars.onComplete && vars.onComplete() } }); this.tls.add(t); return t }

  /* ---------------- sections ---------------- */
  setSection(items, mode, start = 0) {
    this.clearPlates()
    this.items = items; this.N = items.length; this.mode = mode
    this.sec = SECTIONS[mode] || SECTIONS.prose
    this.root.rotation.set(rad(this.sec.tiltX), rad(this.sec.tiltY), 0)
    this.L = clamp(start, 0, this.N - 1); this.we = this.L; this.Se = 0; this.Te = 0; this.Ce = 0
    this.target = -1; this.tweening = false; this.cur = -1; this.hover = -1; this.flight = false
    this.plates = items.map((it, i) => this.makePlate(it, i))
    this.resize()
    this.layout(1, true)
  }
  clearPlates() {
    gsap.killTweensOf(this.tw)
    for (const p of this.plates) { gsap.killTweensOf(p); this.root.remove(p.group); p.mesh.geometry.dispose(); p.mats.forEach((m) => m.dispose()) }
    this.plates = []
  }
  makePlate(it, i) {
    const sec = this.mode === 'home' ? (SECTIONS[it.cat] || this.sec) : this.sec, [w, h] = plateSize(it, sec)
    const geo = new THREE.BoxGeometry(w, h, sec.depth)
    const edge = new THREE.MeshBasicMaterial({ color: sec.edge })
    const spine = new THREE.MeshBasicMaterial({ color: sec.spine })
    const front = new THREE.MeshBasicMaterial({ color: new THREE.Color(it.placeholder) })
    const back = new THREE.MeshBasicMaterial({ color: 0xfbfaf8 })
    // box faces: +x, -x (the spine on a chapbook), +y, -y, front, back
    const mesh = new THREE.Mesh(geo, [edge, spine, edge, edge, front, back])
    mesh.userData.i = i
    const spin = new THREE.Group(); spin.add(mesh)
    const group = new THREE.Group(); group.add(spin)
    group.scale.setScalar(0.0001)
    this.root.add(group)
    const p = { it, i, w, h, mesh, spin, group, front, back, mats: [edge, spine, front, back], hover: 0, spinX: 0, spinY: 0, face: 0, fresh: true, hidden: false }
    p.ready = Promise.resolve(this.o.frontTexture(it, this.mode, w / h)).then((t) => { if (t && this.plates[i] === p) { front.map = t; front.color.set(0xffffff); front.needsUpdate = true } })
    Promise.resolve(this.o.backTexture(it, this.mode, w / h)).then((t) => { if (t && this.plates[i] === p) { back.map = t; back.needsUpdate = true } })
    return p
  }

  /* ---------------- state ---------------- */
  index() { return Math.round(clamp(this.L, 0, this.N - 1)) }
  settled() { return this.target >= 0 ? this.target : this.index() }
  flipped(i = this.index()) { const p = this.plates[i]; return !!p && Math.cos(p.spinY) < 0 }

  to(i, source = 'snap') {
    if (!this.N) return
    const n = clamp(i, 0, this.N - 1), dist = Math.abs(n - this.L), d = CFG.snapDuration
    const a = source === 'wheel' ? { duration: d + 0.07, kick: 1.6 }
      : source === 'key' ? { duration: Math.min(0.82, d - 0.04 + dist * 0.07), kick: 2.5 }
        : source === 'click' ? { duration: clamp(0.62 + dist * 0.15, d, 1.4), kick: Math.min(3.2, dist * 0.9) }
          : source === 'flick' ? { duration: d + 0.1, kick: 0 } : { duration: d, kick: 0, ease: 'power3.out' }
    this.target = n; this.Se = 0; this.Te = 0
    gsap.killTweensOf(this.tw)
    if (this.reduced) { this.L = n; this.we = n; this.Ce = 0; this.target = -1; return }
    if (a.kick) { const s = Math.sign(n - this.L); if (s) this.Ce = clamp(this.Ce + s * a.kick, -12, 12) }
    this.tw.value = this.L; this.tweening = true
    gsap.to(this.tw, {
      value: n, duration: a.duration, ease: a.ease || GLIDE, overwrite: true,
      onUpdate: () => { this.L = this.tw.value },
      onComplete: () => { this.L = n; this.tweening = false; this.target = -1 },
    })
  }
  step(k, source) {
    const n = this.settled() + k
    if (n < 0 || n > this.N - 1) { this.nudge(Math.sign(k)); return }
    this.to(n, source)
  }
  // a small give at the end of the row: the line leans out a little and springs back
  nudge(s) {
    if (this.reduced || this.tweening || Math.abs(this.Te) > 0.3) return
    this.Te += s * 0.9
  }

  /* upload textures + compile shaders ahead of the intro so the first frames don't stall */
  warm() {
    const r = this.renderer
    for (const p of this.plates) {
      if (Math.abs(p.i - this.L) > 4) continue
      p.group.traverse((o) => { const ms = o.material ? [].concat(o.material) : []; ms.forEach((m) => { if (m.map) r.initTexture(m.map) }) })
    }
    const vis = this.plates.map((p) => p.group.visible)
    this.plates.forEach((p) => { p.group.visible = true })
    r.compile(this.scene, this.cam)
    this.plates.forEach((p, k) => { p.group.visible = vis[k] })
  }
  /* ---------------- choreography ---------------- */
  intro(progress) {
    if (this.reduced) { this.G.active = 1; this.G.others = 1; return Promise.resolve() }
    this.G.active = 0.001; this.G.others = 0; this.G.inbound = true
    this.q = { active: true, rise: 0, turn: 0 }
    const q = this.q
    return new Promise((done) => {
      this.tl({ onComplete: done })
        .to(q, { rise: 1, turn: 1, duration: 1.7, ease: GLIDE, onUpdate: () => { progress && progress(q.rise) } }, 0)
        .call(() => { this.fan() }, null, 1.55)
    }).then(() => new Promise((r) => setTimeout(r, CFG.fanDuration * 800)))
  }
  fan() {
    const t = CFG.fanDuration
    this.G.inbound = true; this.flight = false
    if (this.reduced) { this.G.active = 1; this.G.others = 1; return Promise.resolve() }
    return new Promise((done) => {
      this.tl({ onComplete: () => { this.q.active = false; this.G.active = 1; this.G.others = 1; done() } })
        .to(this.G, { active: 1, duration: t, ease: GLIDE }, 0)
        .to(this.G, { others: 1, duration: t * 0.85, ease: 'none' }, t * 0.1)
    })
  }
  /* the whole row falls back, A24-style, before a section change or a route change */
  exit() {
    this.cancel()
    this.flight = true; this.setHover(-1)
    if (this.reduced) return Promise.resolve()
    this.G.inbound = false
    return new Promise((done) => {
      this.tl({ onComplete: done })
        .to(this.G, { others: 0, duration: 0.42, ease: 'none' }, 0)
        .to(this.G, { active: 0, duration: 0.42, ease: 'power2.in' }, 0.04)
    })
  }
  /* stop anything mid-flight and leave every object in a clean pose */
  cancel() {
    for (const t of this.tls) t.kill()
    this.tls.clear()
    gsap.killTweensOf(this.tw); gsap.killTweensOf(this.G)
    this.tweening = false; this.target = -1; this.Se = 0; this.Te = 0
    this.q.active = false
    for (const p of this.plates) {
      gsap.killTweensOf(p)
      p.spinX = 0; p.spinY = Math.round(p.spinY / Math.PI) * Math.PI
    }
  }

  /* Opening: the front object settles, its neighbours fall back, and it turns to face the camera square-on
     (keeping whichever side is showing). Face-on, its projection is an exact rectangle, which is where the
     DOM takes over (see Browser.jsx Flight). */
  openFace() {
    const i = this.index(), p = this.plates[i]
    const back = this.flipped(i)
    for (const t of this.tls) t.kill()
    this.tls.clear()
    gsap.killTweensOf(this.tw); gsap.killTweensOf(p)
    this.flight = true; this.setHover(-1); this.Se = 0; this.Te = 0; this.Ce = 0
    p.spinY = back ? Math.PI : 0
    const off = Math.abs(this.L - i), c = off < 0.002 ? 0 : clamp(0.12 + off * 0.25, 0.12, 0.4)
    this.G.inbound = false
    if (this.reduced) { this.L = i; p.face = 1; p.spinX = 0; this.G.others = 0; this.layout(1, true); return Promise.resolve({ i, back }) }
    return new Promise((done) => {
      const t = this.tl({ onComplete: () => done({ i, back }) })
      if (c) { this.tw.value = this.L; t.to(this.tw, { value: i, duration: c, ease: 'power2.out', onUpdate: () => { this.L = this.tw.value } }, 0) }
      t.to(this.G, { others: 0, duration: 0.5, ease: 'none' }, c * 0.5)
        .to(p, { face: 1, spinX: 0, duration: 0.55, ease: GLIDE }, c * 0.5)
    })
  }
  /* coming back from a page: put the front object face-on, alone, and report where it is on screen */
  prepareReturn(back) {
    this.cancel()
    const i = this.index(), p = this.plates[i]
    this.flight = true
    p.face = 1; p.spinY = back ? Math.PI : 0; p.spinX = 0; p.hidden = true
    this.G.active = 1; this.G.others = 0; this.G.inbound = true
    this.layout(1, true)
    return this.rectOf(i)
  }
  /* ...then, once the page image has landed on it, turn it back into its slot and re-fan the row */
  land() {
    const p = this.plates[this.index()]
    p.hidden = false
    if (this.reduced) { p.face = 0; this.G.others = 1; this.flight = false; return Promise.resolve() }
    return new Promise((done) => {
      this.tl({ onComplete: () => { this.flight = false; done() } })
        .to(p, { face: 0, duration: 0.8, ease: GLIDE }, 0.02)
        .to(this.G, { others: 1, duration: 0.75, ease: 'none' }, 0.06)
    })
  }
  tone(css) { this.scene.fog.color.set(css) }
  hidePlate(i, v = true) { const p = this.plates[i]; if (p) p.hidden = v }
  flip() {
    if (this.reduced || this.flight) return
    const p = this.plates[this.index()]
    const goal = Math.round(p.spinY / Math.PI) * Math.PI + Math.PI
    gsap.to(p, { spinY: goal, spinX: 0, duration: 0.9, ease: GLIDE, overwrite: true })
  }

  /* ---------------- input ---------------- */
  bind() {
    const c = this.renderer.domElement
    this.h = {
      wheel: (e) => this.onWheel(e), down: (e) => this.onDown(e), move: (e) => this.onMove(e),
      up: (e) => this.onUp(e), leave: () => { if (!this.drag) this.setHover(-1) }, resize: () => this.resize(),
    }
    this.el.addEventListener('wheel', this.h.wheel, { passive: false })
    c.addEventListener('pointerdown', this.h.down)
    window.addEventListener('pointermove', this.h.move)
    window.addEventListener('pointerup', this.h.up)
    window.addEventListener('pointercancel', this.h.up)
    c.addEventListener('pointerleave', this.h.leave)
    window.addEventListener('resize', this.h.resize)
  }
  pick(x, y) {
    const r = this.renderer.domElement.getBoundingClientRect()
    this.ptr.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1)
    this.ray.setFromCamera(this.ptr, this.cam)
    const meshes = this.pickList || (this.pickList = [])
    meshes.length = 0
    for (const p of this.plates) if (p.group.visible) meshes.push(p.mesh)
    const hit = this.ray.intersectObjects(meshes, false)[0]
    if (!hit) return null
    const p = this.plates[hit.object.userData.i]
    const lp = p.mesh.worldToLocal(hit.point.clone())
    return { i: p.i, u: clamp(lp.x / (p.w / 2), -1, 1), v: clamp(lp.y / (p.h / 2), -1, 1) }
  }
  setHover(i) {
    if (i === this.hover) return
    this.hover = i
    this.renderer.domElement.style.cursor = i >= 0 ? 'pointer' : ''
    this.o.onHover && this.o.onHover(i)
  }
  busy() { return this.flight || this.q.active || !this.N }
  onWheel(e) {
    e.preventDefault()
    const w = this.wheel, now = performance.now()
    // iteration 14: two axes. Sideways (deltaX, or shift + wheel) browses the pieces; up / down asks the
    // page for the next or previous section. Each gesture locks to its dominant axis on its first
    // events, so a diagonal trackpad swipe does one or the other, never both. A gesture lasts while
    // events keep arriving (the momentum tail included), and fires a section change at most once.
    const lm = e.deltaMode === 1 ? 16 : 1
    let dx = e.deltaX * lm, dy = e.deltaY * lm
    if (e.shiftKey && !dx) { dx = dy; dy = 0 }
    const newG = now - (w.g || 0) > CFG.gestureGap
    w.g = now
    const mag = Math.max(Math.abs(dx), Math.abs(dy))
    // a momentum tail that stalls (the page is busy loading the next section) can look like a new
    // gesture; a real new swipe starts harder than the tail it follows, so a weaker start stays spent
    if (newG) { const tail = w.fired && now - (w.ft || 0) < 2600 && mag <= (w.last || 0) * 1.5 + 2; w.ax = tail ? 'y' : null; w.ay = 0; w.axx = 0; w.fired = tail; w.sy = 0 }
    w.last = mag
    if (!w.ax) {
      w.axx += Math.abs(dx); w.ay += Math.abs(dy)
      if (w.axx + w.ay < 4) return
      w.ax = w.axx > w.ay ? 'x' : 'y'; w.sy = 0
    }
    if (w.ax === 'y') {
      if (w.fired || this.busy()) return
      w.sy += dy
      if (Math.abs(w.sy) >= CFG.sectionPx || (e.deltaMode === 1 && dy)) { w.fired = true; w.ft = now; this.o.onSection && this.o.onSection(Math.sign(w.sy)) }
      return
    }
    if (this.busy()) return
    const d = dx
    if (Math.abs(d) < CFG.wheelFloor) return
    const fresh = now - w.t > CFG.mFresh                 // a pause means a new gesture, don't inherit the old speed
    // the ends of a row resist; the next section lives below, not beyond the last piece
    const sg = Math.sign(d), edge = (sg > 0 && this.L >= this.N - 1 - 0.02) || (sg < 0 && this.L <= 0.02)
    if (edge && Math.abs(this.Se) < 0.02) { w.t = now; w.v = 0; this.Se = 0; if (fresh) this.nudge(sg); return }
    // a mouse wheel notch (big, whole, isolated delta) moves exactly one piece; trackpads coast
    if (fresh && (e.deltaMode === 1 || (Math.abs(d) >= 50 && Number.isInteger(d)))) { w.t = now; w.v = 0; this.step(Math.sign(d), 'wheel'); return }
    const dt = fresh ? 0.016 : Math.max(0.008, Math.min(0.05, (now - w.t) / 1000))
    w.t = now
    const inst = d / dt                                   // the px/s this event represents
    w.v = fresh ? inst : w.v * 0.7 + inst * 0.3           // smooth the event stream into a hand speed
    const v = clamp(pressure(w.v) / CFG.wheelPx / 60, -CFG.glideMaxV, CFG.glideMaxV)   // pieces per 60 Hz frame
    if (this.tweening) { gsap.killTweensOf(this.tw); this.tweening = false; this.target = -1 }
    this.Te = 0
    if (Math.abs(v) > Math.abs(this.Se) || Math.sign(v) !== Math.sign(this.Se)) this.Se = v
  }
  onDown(e) {
    if (e.button !== 0 || this.busy()) return
    const h = this.pick(e.clientX, e.clientY)
    this.drag = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t: performance.now(), on: false, hit: h, spin: h && h.i === this.index() && !this.touch ? h.i : -1, w: this.el.clientWidth, h: this.el.clientHeight }
  }
  onMove(e) {
    const d = this.drag
    if (!d) {
      if (this.busy() || e.pointerType === 'touch') return
      const h = this.pick(e.clientX, e.clientY)
      if (h) { this.U = h.u; this.Ue = -h.v }
      this.setHover(h ? h.i : -1)
      return
    }
    if (this.flight) { this.drag = null; return }
    if (!d.on) {
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < CFG.dragStart) return
      d.ax = Math.abs(e.clientX - d.x0) >= Math.abs(e.clientY - d.y0) ? 'x' : 'y'
      if (d.ax === 'y' && d.spin < 0) { d.on = true; this.setHover(-1); return }
      d.on = true; gsap.killTweensOf(this.tw); this.tweening = false; this.target = -1; this.Te = 0
      this.setHover(-1); this.el.classList.add('is-dragging')
    }
    if (d.ax === 'y' && d.spin < 0) {
      // a vertical drag / swipe: once it has travelled far enough, it asks for the next section, once
      const ty = e.clientY - d.y0
      if (!d.fired && Math.abs(ty) > Math.min(CFG.sectionDrag, d.h * 0.12)) { d.fired = true; this.o.onSection && this.o.onSection(ty < 0 ? 1 : -1) }
      return
    }
    const now = performance.now(), dx = e.clientX - d.x, dy = e.clientY - d.y, dt = Math.max(8, now - d.t)
    d.x = e.clientX; d.y = e.clientY; d.t = now
    d.px = (d.px || 0) + dx
    ;(d.sm || (d.sm = [])).push({ t: now, p: d.px })
    while (d.sm.length > 2 && now - d.sm[0].t > CFG.mSample) d.sm.shift()
    if (d.spin >= 0) {
      const p = this.plates[d.spin], k = 0.95 * 0.0045
      gsap.killTweensOf(p)
      p.spinY = clamp(p.spinY + dx * k, -Math.PI * 2, Math.PI * 2); p.spinX = clamp(p.spinX + dy * k, -Math.PI, Math.PI)
      return
    }
    const along = dx / d.w
    const span = this.touch ? CFG.touchSpan : 6 * CFG.dragSens
    const s = -along * span
    this.L = clamp(this.L + s, 0, this.N - 1)
    const v = clamp((16.667 / dt) * s, -CFG.dragMaxV, CFG.dragMaxV)
    this.Se += (v - this.Se) * CFG.dragSmooth
  }
  onUp(e) {
    const d = this.drag
    if (!d) return
    this.drag = null; this.el.classList.remove('is-dragging')
    if (this.flight) return
    if (!d.on) {
      const h = d.hit
      if (!h) return
      if (h.i === this.index() && Math.abs(this.L - h.i) < 0.3) this.o.onOpen(h.i)
      else this.to(h.i, 'click')
      return
    }
    if (d.ax === 'y' && d.spin < 0) return
    if (d.spin >= 0) {
      const p = this.plates[d.spin]
      gsap.to(p, { spinX: 0, spinY: Math.round(p.spinY / Math.PI) * Math.PI, duration: CFG.resetDuration, ease: 'elastic.out(1, 0.6)' })
      return
    }
    if (performance.now() - d.t > 110) this.Se = 0
    if (this.touch) {
      const v = this.Se; this.Se = 0
      const tgt = Math.round(this.L + Math.sign(v) * 0.5)
      if (Math.abs(v) > CFG.touchFlick && (tgt < 0 || tgt > this.N - 1)) this.to(clamp(tgt, 0, this.N - 1))
      else if (Math.abs(v) > CFG.touchFlick) this.to(tgt, 'flick')
      else this.to(Math.round(this.L))
      return
    }
    // release speed over the tail of the drag (main site's SAMPLE_MS), launched on the pressure curve
    const t = performance.now(), sm = d.sm || []
    while (sm.length > 2 && t - sm[0].t > CFG.mSample) sm.shift()
    const a = sm[0], b = sm[sm.length - 1], span = a && b ? (b.t - a.t) / 1000 : 0
    const hv = b && t - b.t <= CFG.mSample && span > 0.008 ? (b.p - a.p) / span : 0
    const per = d.w / (6 * CFG.dragSens)     // px per piece while dragging
    this.Se = clamp(-pressure(hv) / per / 60, -CFG.glideMaxV, CFG.glideMaxV)
    if (e && e.pointerType === 'touch') this.Se *= 0.6
  }

  resize() {
    const w = Math.max(1, this.el.clientWidth), h = Math.max(1, this.el.clientHeight)
    this.renderer.setSize(w, h, false)
    this.cam.aspect = w / h
    this.cam.updateProjectionMatrix()
    const vw = 2 * CFG.camDist * Math.tan(rad(CFG.fov / 2)) * this.cam.aspect
    const big = this.mode === 'prose' ? 1.55 * CFG.touchActive : this.mode === 'publications' ? 1.3 * 1.25 : 1.4 * 1.25
    this.scale = this.touch ? Math.min(CFG.galleryScale, (0.64 * vw) / big) : CFG.galleryScale
    if (!this.touch && w / h < 1.25) this.scale = CFG.galleryScale * clamp((w / h) / 1.6, 0.62, 1)
    this.root.scale.setScalar(this.scale)
    this.root.updateMatrixWorld()
    _qi.copy(this.root.quaternion).invert()
    this.qInv = this.qInv || new THREE.Quaternion()
    this.qInv.copy(_qi)
  }

  /* ---------------- arrangements ---------------- */
  pose(m, g, lean, dip, out) {
    const h = Math.abs(m), touch = this.touch
    if (this.mode === 'publications') {
      // a shelf: nearly straight, booklets turned a little so the spine shows as they pass
      const a = m * 0.2
      out.x = Math.sin(a) * 1.55 * 5 * (touch ? 0.62 : 1)
      out.z = -(1 - Math.cos(a)) * 4 - Math.min(h, 1) * 0.25
      out.y = (g ? 0.05 : 0) - dip * (g ? 0.7 : 1)
      out.rx = 0
      out.ry = -clamp(m, -1.2, 1.2) * 0.42 + lean * (g ? 1 : 1.12)
      out.rz = -lean * CFG.flowBank * 0.6
      out.S = g ? (touch ? 1.25 : 1) : Math.max(0.74, 1 - h * 0.13)
      return out
    }
    if (this.mode === 'luck') {
      // iteration 14: a carousel drum seen from outside, turning sideways like the other rows
      const a = m * 0.62, R = 2.6 * (touch ? 0.8 : 1)
      out.x = Math.sin(a) * R * 1.35
      out.y = (g ? 0.05 : 0) - dip * 0.5
      out.z = -(1 - Math.cos(a)) * R
      out.rx = 0
      out.ry = -a * 0.9 + lean * (g ? 0.8 : 1)
      out.rz = -lean * CFG.flowBank * 0.4
      out.S = g ? (touch ? 1.25 : 1) : Math.max(0.7, 1 - h * 0.15)
      return out
    }
    if (touch) {
      const n = Math.min(h, 2.5)
      _v.set(m * CFG.touchGap, -n * CFG.touchDrop, -n * CFG.touchDepth).applyQuaternion(this.qInv)
      out.x = _v.x; out.y = _v.y + (g ? 0.06 : 0) - dip; out.z = _v.z
      out.rx = 0; out.ry = clamp(-m, 0, 1) * -2 * rad(this.sec.tiltY) + lean * (g ? 1 : 1.12)
      out.rz = -lean * CFG.flowBank * (g ? 0.7 : 1)
      out.S = g ? CFG.touchActive : CFG.touchInactive
      return out
    }
    const a = m * 0.35
    out.x = Math.sin(a) * 2.3 * 2.4
    out.y = (g ? 0.06 : 0) - dip * (g ? 0.7 : 1)
    out.z = -(Math.cos(a) - 1) * 2.4
    out.rx = 0
    out.ry = -a + lean * (g ? 1 : 1.12)
    out.rz = -lean * CFG.flowBank * (g ? 0.7 : 1)
    out.S = g ? 1 : Math.max(0.8, 1 - h * 0.12)
    return out
  }

  layout(dt, instant = false) {
    if (!this.N) return
    const n = this.index(), G = this.G, red = this.reduced
    const free = !red && !this.flight
    const lean = free ? clamp(Math.sign(this.Ce) * Math.sqrt(Math.abs(this.Ce)) * CFG.flowLean, -CFG.flowLeanMax, CFG.flowLeanMax) : 0
    const dip = free ? Math.min(CFG.flowDipMax, Math.abs(this.Ce) * CFG.flowDip) : 0
    const base = this.drag && this.drag.on ? CFG.followTight : CFG.followBase
    const T = this._t || (this._t = {})
    for (const p of this.plates) {
      const m = p.i - this.L, h = Math.abs(m), g = p.i === n
      if (h > CFG.renderRadius + 1) { p.group.visible = false; p.fresh = true; continue }
      this.pose(m, g, lean, dip, T)
      let { x, y, z, rx, ry, rz, S } = T, s, vis = true
      if (g) s = S * G.active
      else {
        const e = clamp(G.others, 0, 2), inb = G.inbound
        const st = inb ? CFG.flightStaggerIn : CFG.flightStagger
        const r = CFG.flightStaggerMax, lag = (Math.min(h, r) / r) * st
        const o = clamp((Math.min(1, e) - lag) / Math.max(0.1, 1 - st), 0, 1)
        const k = (inb ? outCubic(o) : o * (2 - o)) + Math.max(0, e - 1)
        vis = k > (inb ? CFG.popIn : CFG.popOut) || G.others >= 1
        s = S * k
        const c = 1 - Math.min(1, k)
        if (c > 1e-4) z -= c * CFG.flightRecede
      }
      p.group.visible = vis && s > 0.002 && !p.hidden
      const want = +(this.hover === p.i && !(this.drag && this.drag.on))
      p.hover += (want - p.hover) * Math.min(1, dt * 10)
      if (p.hover > 0.001) { rx += p.hover * CFG.hoverTilt * this.Ue; ry += p.hover * CFG.hoverTilt * this.U }
      if (this.q.active && g) {
        const k = 1 - clamp(this.q.rise, 0, 1)
        if (k) { _v.set(0, -CFG.preloadRise * k, -CFG.preloadDepth * k).applyQuaternion(this.qInv).divideScalar(this.scale || 1); x += _v.x; y += _v.y; z += _v.z }
        const t = 1 - this.q.turn
        p.spinY = (-Math.PI / 2) * t; p.spin.rotation.z = CFG.preloadSpin * t * t
        const gk = clamp(this.q.rise / CFG.preloadGrowBy, 0, 1)
        if (G.active < 0.99) s = S * Math.max(G.active, CFG.preloadBoost * (1 - (1 - gk) ** 2))
        p.group.visible = !p.hidden && s > 0.002 // visibility must follow the boosted scale, or the rise is never seen
      } else p.spin.rotation.z = 0
      const k = clamp(base - h * CFG.followFalloff, CFG.followMin, CFG.followTight)
      const A = instant || red || this.flight || p.fresh ? 1 : Math.min(1, dt * k)
      const P = p.group.position, R = p.group.rotation
      if (p.face > 0) {
        // face-on: cancel the group tilt, pull it a little toward you, grow it a touch
        const f = p.face
        y = y * (1 - f); s *= 1 + 0.1 * f
        x *= 1 - f * 0.9
        z += f * 0.35
        _e.set(rx, ry, rz); _q.setFromEuler(_e).slerp(this.qInv, f)
        P.set(x, y, z); p.group.quaternion.copy(_q)
      } else {
        P.x += (x - P.x) * A; P.y += (y - P.y) * A; P.z += (z - P.z) * A
        R.x += (rx - R.x) * A; R.y += (ry - R.y) * A; R.z += (rz - R.z) * A
      }
      const sc = p.face > 0 ? s : p.group.scale.x + (s - p.group.scale.x) * A
      p.group.scale.setScalar(Math.max(1e-4, sc))
      if (p.fresh && !instant && !red && this.cur >= 0 && G.others >= 1) {
        const side = Math.sign(m)
        P.x += side * 0.9; P.z -= 0.45; R.y -= side * 0.3; p.group.scale.multiplyScalar(0.72)
      }
      p.fresh = false
      if (!(this.drag && this.drag.spin === p.i) && !gsap.isTweening(p)) p.spinX += (0 - p.spinX) * Math.min(1, dt * 2.5)
      p.spin.rotation.x = p.spinX; p.spin.rotation.y = p.spinY
    }
  }

  frame = (now) => {
    if (this.dead) return
    this.raf = requestAnimationFrame(this.frame)
    if (document.hidden) { this.last = now; return }
    const t = (now - this.last) / 1000, dt = Math.min(0.05, t)
    this.last = now
    if (!this.N) return
    const r = Math.min(3, dt * 60)
    const dragging = this.drag && this.drag.on && this.drag.spin < 0
    if (!dragging && !this.flight) {
      if (Math.abs(this.Se) > 1e-5) {
        this.L += this.Se * r
        this.Se *= this.reduced ? 0 : Math.exp(-dt / CFG.glideTau)
        if (Math.abs(this.Se) < 4e-3) this.Se = 0
      }
      if (this.Se === 0 && !this.tweening) {
        const e = Math.round(this.L), d = e - this.L
        if (this.reduced) this.L = e
        else if (d !== 0 || Math.abs(this.Te) > 1e-5) {
          this.Te += d * CFG.snapFreq * CFG.snapFreq * dt
          this.Te *= Math.exp(-CFG.snapDamping * dt)
          this.L += this.Te * dt
          if (Math.abs(e - this.L) < 8e-4 && Math.abs(this.Te) < 0.004) { this.L = e; this.Te = 0 }
        }
      }
    }
    // resistance past the ends: any coast that runs over the edge is braked hard
    if ((this.L > this.N - 1 && this.Se > 0) || (this.L < 0 && this.Se < 0)) this.Se *= 0.5
    this.L = clamp(this.L, -0.08, this.N - 0.92)
    if (this.reduced || this.flight) { this.Ce = 0; this.we = this.L } else {
      const e = clamp((this.L - this.we) / Math.max(dt, 0.001), -40, 40)
      this.we = this.L
      const k = Math.abs(e) > Math.abs(this.Ce) ? 14 : 6
      this.Ce += (e - this.Ce) * Math.min(1, dt * k)
      if (Math.abs(this.Ce) < 0.01) this.Ce = 0
    }
    const c = this.index()
    if (c !== this.cur) { this.cur = c; this.o.onChange && this.o.onChange(c) }
    this.layout(dt)
    this.renderer.render(this.scene, this.cam)
    if (this.o.onFrame) this.o.onFrame()
  }

  /* screen-space box of an object (exact when it is face-on) */
  rectOf(i) {
    const p = this.plates[i]; if (!p) return null
    p.group.updateMatrixWorld(true)
    const W = this.el.clientWidth, H = this.el.clientHeight
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (let k = 0; k < 4; k += 1) {
      const sx = k === 1 || k === 2 ? 1 : -1, sy = k >= 2 ? 1 : -1
      _v.set((sx * p.w) / 2, (sy * p.h) / 2, this.sec.depth / 2); p.mesh.localToWorld(_v); _v.project(this.cam)
      const X = (_v.x + 1) * 0.5 * W, Y = (1 - _v.y) * 0.5 * H
      if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y
    }
    const b = this.el.getBoundingClientRect()
    return { x: x0 + b.left, y: y0 + b.top, w: x1 - x0, h: y1 - y0 }
  }

  destroy() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    this.cancel()
    this.clearPlates()
    const c = this.renderer.domElement
    this.el.removeEventListener('wheel', this.h.wheel)
    c.removeEventListener('pointerdown', this.h.down)
    window.removeEventListener('pointermove', this.h.move)
    window.removeEventListener('pointerup', this.h.up)
    window.removeEventListener('pointercancel', this.h.up)
    c.removeEventListener('pointerleave', this.h.leave)
    window.removeEventListener('resize', this.h.resize)
    c.style.cursor = ''
    this.renderer.renderLists.dispose()
    c.remove()
  }
}
