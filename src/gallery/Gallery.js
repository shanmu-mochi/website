/* The home browser: a three.js gallery of paintings that moves like the A24 disc browser
   (a24.raviklaassens.com). The behaviour was studied from frame captures and its parameters;
   the code here is our own. See NOTES-A24-STUDY.md for the spec.

   Model: a continuous position L (0..N-1). Every plate has a target pose computed from its
   offset m = index - L on an arc that lives inside a group rotated -30deg on X and Y (that
   rotation is what makes the diagonal). Plates chase their targets at a per-plate rate that
   drops with distance, so far plates trail. Steps (wheel, keys, clicks) are tweens of L on the
   "discGlide" curve with a velocity kick that leans and banks the row; free motion (drag release)
   coasts and then settles on a spring. */
import * as THREE from 'three'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)
export const GLIDE = CustomEase.create('discGlide', '0.32, 0.72, 0, 1')
export const GLIDE_CSS = 'cubic-bezier(.32,.72,0,1)'

export const CFG = {
  galleryScale: 1.08, hGap: 2.3, depthGap: 1, activeY: 0.06, rotX: -30, rotY: -30,
  inactiveScale: 0.8, camDist: 4.4, fov: 40,
  hoverTilt: 0.21, dragSens: 0.95, dragSmooth: 0.32, dragMaxV: 0.5, dragStart: 5,
  // release glide: the coast of the original drifting carousel (TAU 0.55 s), then the spring
  glideTau: 0.55, glideMaxV: 0.2,
  snapDuration: 0.46, snapFreq: 9.5, snapDamping: 12,
  flowLean: 0.055, flowLeanMax: 0.3, flowBank: 0.32, flowDip: 0.014, flowDipMax: 0.09,
  followTight: 15, followBase: 11, followFalloff: 1.15, followMin: 6.5,
  flightRecede: 2.2, flightStagger: 0.45, flightStaggerIn: 0.28, flightStaggerMax: 4, popOut: 0.35, popIn: 0.02,
  preloadBoost: 0.8, preloadGrowBy: 0.5, preloadSpin: 1.1, preloadRise: 3, preloadDepth: 0.7, fanDuration: 1.15,
  touchGap: 2.2, touchDepth: 0.5, touchDrop: 1, touchActive: 1.5, touchInactive: 0.6, touchFlick: 0.035, touchSpan: 1.8,
  resetDuration: 1.2, renderRadius: 6,
  wheelFloor: 0.3, wheelStep: 6, wheelGap: 170, wheelPause: 150,
}
const rad = THREE.MathUtils.degToRad
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const outCubic = (t) => 1 - (1 - t) ** 3

const texCache = new Map()
const loader = new THREE.TextureLoader()
function loadTex(url) {
  if (!texCache.has(url)) {
    texCache.set(url, new Promise((res) => loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; res(t) }, undefined, () => res(null))))
  }
  return texCache.get(url)
}

/* plate size: paintings keep their proportions at roughly the area of A24's 2-unit disc */
export function plateSize(a) {
  let h = Math.sqrt(2.9 / a), w = a * h
  const m = Math.max(w, h)
  if (m > 2.1) { w *= 2.1 / m; h *= 2.1 / m }
  return [w, h]
}

export default class Gallery {
  constructor(el, items, opts) {
    this.el = el; this.items = items; this.o = opts
    this.N = items.length
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.L = clamp(opts.start || 0, 0, this.N - 1)
    this.Se = 0; this.Te = 0; this.Ce = 0; this.we = this.L
    this.G = { active: 1, others: 1, inbound: false }
    this.q = { active: false, rise: 1, turn: 1 }
    this.tw = { value: this.L }; this.tweening = false; this.target = -1
    this.hover = -1; this.U = 0; this.Ue = 0
    this.drag = null; this.flight = false; this.cur = -1
    this.wheel = { acc: 0, last: 0, step: 0 }

    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    r.outputColorSpace = THREE.SRGBColorSpace
    r.setClearColor(0x000000, 0)
    el.appendChild(r.domElement)
    r.domElement.className = 'gl'
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0xf2f2f2, 7, 14)
    this.cam = new THREE.PerspectiveCamera(CFG.fov, 1, 0.1, 60)
    this.cam.position.set(0, 0, CFG.camDist); this.cam.lookAt(0, 0, 0)
    this.root = new THREE.Group()
    this.root.rotation.set(rad(CFG.rotX), rad(CFG.rotY), 0)
    this.scene.add(this.root)
    this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2()

    this.plates = items.map((it, i) => this.makePlate(it, i))
    this.resize()
    this.bind()
    this.layout(1, true)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  get touch() { return this.o.touch() }

  makePlate(it, i) {
    const [w, h] = plateSize(it.aspect)
    const geo = new THREE.BoxGeometry(w, h, 0.024)
    const edge = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const front = new THREE.MeshBasicMaterial({ color: new THREE.Color(it.placeholder) })
    const back = new THREE.MeshBasicMaterial({ color: 0xfbfaf8 })
    const mesh = new THREE.Mesh(geo, [edge, edge, edge, edge, front, back])
    mesh.userData.i = i
    const spin = new THREE.Group(); spin.add(mesh)
    const group = new THREE.Group(); group.add(spin)
    group.scale.setScalar(0.0001)
    this.root.add(group)
    const p = { it, i, w, h, mesh, spin, group, front, back, hover: 0, spinX: 0, spinY: 0, fresh: true, loaded: false }
    const ready = it.url ? loadTex(it.url) : Promise.resolve(this.o.coverTexture(it, w / h))
    p.ready = ready.then((t) => { if (t && !this.dead) { front.map = t; front.color.set(0xffffff); front.needsUpdate = true } p.loaded = true })
    Promise.resolve(this.o.versoTexture(it, w / h)).then((t) => { if (t && !this.dead) { back.map = t; back.needsUpdate = true } })
    return p
  }

  /* -------- state -------- */
  index() { return Math.round(clamp(this.L, 0, this.N - 1)) }
  settled() { return this.target >= 0 ? this.target : this.index() }

  to(i, source = 'snap') {
    const n = clamp(i, 0, this.N - 1), dist = Math.abs(n - this.L)
    const d = CFG.snapDuration
    const a = source === 'wheel' ? { duration: d + 0.05, kick: 2.5 }
      : source === 'key' ? { duration: Math.min(0.6, d - 0.04 + dist * 0.05), kick: 4 }
        : source === 'click' ? { duration: clamp(0.45 + dist * 0.11, d, 1.05), kick: Math.min(5, dist * 1.4) }
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
  step(k, source) { this.to(this.settled() + k, source) }

  /* -------- the intro: one plate rises edge-on, turns to face you, then the row fans out -------- */
  intro(progress) {
    if (this.reduced) { this.G.active = 1; this.G.others = 1; return Promise.resolve() }
    this.G.active = 0.001; this.G.others = 0; this.G.inbound = true
    this.q = { active: true, rise: 0, turn: 0 }
    const q = this.q
    return new Promise((done) => {
      gsap.timeline({ onComplete: done })
        .to(q, { rise: 1, turn: 1, duration: 1.7, ease: GLIDE, onUpdate: () => { progress && progress(q.rise) } }, 0)
        .call(() => this.fan().then(() => {}), null, 1.55)
    }).then(() => new Promise((r) => setTimeout(r, CFG.fanDuration * 800)))
  }
  fan() {
    const t = CFG.fanDuration
    this.G.inbound = true
    return new Promise((done) => {
      gsap.timeline({ onComplete: () => { this.q.active = false; this.G.active = 1; this.G.others = 1; done() } })
        .to(this.G, { active: 1, duration: t, ease: GLIDE }, 0)
        .to(this.G, { others: 1, duration: t * 0.85, ease: 'none' }, t * 0.1)
    })
  }
  /* coming back from a piece page: the front plate grows in place and the rest pop in behind it */
  inbound() {
    if (this.reduced) return Promise.resolve()
    this.G.active = 0.001; this.G.others = 0; this.G.inbound = true
    const p = this.plates[this.index()]
    p.spinY = Math.PI / 2
    return new Promise((done) => {
      gsap.timeline({ onComplete: done })
        .to(this.G, { active: 1, duration: 0.7, ease: GLIDE }, 0)
        .to(p, { spinY: 0, duration: 0.7, ease: GLIDE }, 0)
        .to(this.G, { others: 1, duration: 0.6, ease: 'none' }, 0.07)
    })
  }
  /* opening the front plate: the row recedes in a stagger, the plate swells and turns edge-on */
  flyOut() {
    this.flight = true; this.hover = -1
    const i = this.index(), p = this.plates[i]
    gsap.killTweensOf(p); p.spinY = Math.atan2(Math.sin(p.spinY), Math.cos(p.spinY))
    gsap.killTweensOf(this.tw); this.Se = 0; this.Te = 0; this.Ce = 0
    if (this.reduced) return Promise.resolve()
    const off = Math.abs(this.L - i), c = off < 0.002 ? 0 : clamp(0.12 + off * 0.25, 0.12, 0.4)
    this.G.inbound = false
    return new Promise((done) => {
      const tl = gsap.timeline({ onComplete: done })
      if (c) { this.tw.value = this.L; tl.to(this.tw, { value: i, duration: c, ease: 'power2.out', onUpdate: () => { this.L = this.tw.value } }, 0) }
      const a = c * 0.6, d = 0.5
      tl.to(this.G, { others: 0, duration: d, ease: 'none' }, a)
        .to(this.G, { active: 1.45, duration: d, ease: 'power2.in' }, a)
        .to(p, { spinY: Math.PI / 2, spinX: 0, duration: d, ease: 'power2.in' }, a)
    })
  }
  flip() {
    if (this.reduced) return
    const p = this.plates[this.index()]
    const goal = Math.round(p.spinY / Math.PI) * Math.PI + Math.PI
    gsap.to(p, { spinY: goal, spinX: 0, duration: 0.9, ease: GLIDE, overwrite: true })
  }

  /* -------- input -------- */
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
    const hit = this.ray.intersectObjects(this.plates.filter((p) => p.group.visible).map((p) => p.mesh), false)[0]
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
  onWheel(e) {
    e.preventDefault()
    if (this.flight || this.q.active) return
    let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (e.deltaMode === 1) d *= 16
    if (Math.abs(d) < CFG.wheelFloor) return
    const w = this.wheel, now = performance.now()
    if (now - w.last > CFG.wheelPause || Math.sign(d) !== Math.sign(w.acc)) w.acc = 0
    w.last = now
    w.acc += clamp(d, -24, 24)
    if (Math.abs(w.acc) >= CFG.wheelStep && now - w.step >= CFG.wheelGap) {
      w.step = now; const k = Math.sign(w.acc); w.acc = 0
      this.step(k, 'wheel')
    }
  }
  onDown(e) {
    if (e.button !== 0 || this.flight || this.q.active) return
    const h = this.pick(e.clientX, e.clientY)
    this.drag = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t: performance.now(), on: false, hit: h, spin: h && h.i === this.index() && !this.touch ? h.i : -1, w: this.el.clientWidth }
  }
  onMove(e) {
    const d = this.drag
    if (!d) {
      if (this.flight || this.q.active || e.pointerType === 'touch') return
      const h = this.pick(e.clientX, e.clientY)
      if (h) { this.U = h.u; this.Ue = -h.v }
      this.setHover(h ? h.i : -1)
      return
    }
    if (!d.on) {
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < CFG.dragStart) return
      d.on = true; gsap.killTweensOf(this.tw); this.tweening = false; this.target = -1; this.Te = 0
      this.setHover(-1); this.el.classList.add('is-dragging')
    }
    const now = performance.now(), dx = e.clientX - d.x, dy = e.clientY - d.y, dt = Math.max(8, now - d.t)
    d.x = e.clientX; d.y = e.clientY; d.t = now
    if (d.spin >= 0) {
      const p = this.plates[d.spin], k = CFG.dragSens * 0.0045
      p.spinY = clamp(p.spinY + dx * k, -Math.PI, Math.PI); p.spinX = clamp(p.spinX + dy * k, -Math.PI, Math.PI)
      return
    }
    const span = this.touch ? CFG.touchSpan : 6 * CFG.dragSens
    const s = -(dx / d.w) * span
    this.L = clamp(this.L + s, 0, this.N - 1)
    const v = clamp((16.667 / dt) * s, -CFG.dragMaxV, CFG.dragMaxV)
    this.Se += (v - this.Se) * CFG.dragSmooth
  }
  onUp(e) {
    const d = this.drag
    if (!d) return
    this.drag = null; this.el.classList.remove('is-dragging')
    if (!d.on) {   // a click
      const h = d.hit
      if (!h) return
      if (h.i === this.index() && Math.abs(this.L - h.i) < 0.3) this.o.onOpen(h.i)
      else this.to(h.i, 'click')
      return
    }
    if (d.spin >= 0) {
      const p = this.plates[d.spin]
      gsap.to(p, { spinX: 0, spinY: Math.round(p.spinY / Math.PI) * Math.PI, duration: CFG.resetDuration, ease: 'elastic.out(1, 0.6)' })
      return
    }
    if (performance.now() - d.t > 110) this.Se = 0      // a stall before lift really does stop it
    if (this.touch) {
      const v = this.Se; this.Se = 0
      if (Math.abs(v) > CFG.touchFlick) this.to(Math.round(this.L + Math.sign(v) * 0.5), 'flick')
      else this.to(Math.round(this.L))
      return
    }
    this.Se = clamp(this.Se, -CFG.glideMaxV, CFG.glideMaxV)
    if (e && e.pointerType === 'touch') this.Se *= 0.6
  }

  resize() {
    const w = Math.max(1, this.el.clientWidth), h = Math.max(1, this.el.clientHeight)
    this.renderer.setSize(w, h, false)
    this.cam.aspect = w / h
    this.cam.updateProjectionMatrix()
    // touch: fit the front plate to ~64% of the width so its neighbours peek in from the sides
    const vw = 2 * CFG.camDist * Math.tan(rad(CFG.fov / 2)) * this.cam.aspect
    this.scale = this.touch ? Math.min(CFG.galleryScale, (0.64 * vw) / (1.55 * CFG.touchActive)) : CFG.galleryScale
    if (!this.touch && w / h < 1.25) this.scale = CFG.galleryScale * clamp((w / h) / 1.6, 0.62, 1)
    this.root.scale.setScalar(this.scale)
    this.root.updateMatrixWorld()
  }

  /* -------- layout: the heart of it -------- */
  touchPos(m, out) {
    const n = Math.min(Math.abs(m), 2.5)
    out.set(m * CFG.touchGap, -n * CFG.touchDrop, -n * CFG.touchDepth)
    const qi = this.root.quaternion.clone().invert()
    return out.applyQuaternion(qi)
  }
  risePos(t, out) {
    const k = 1 - clamp(t, 0, 1)
    out.set(0, -CFG.preloadRise * k, -CFG.preloadDepth * k)
    if (!k) return out
    out.applyQuaternion(this.root.quaternion.clone().invert())
    return out.divideScalar(this.scale || 1)
  }
  layout(dt, instant = false) {
    const n = this.index(), touch = this.touch, G = this.G, red = this.reduced
    const free = !red && !this.flight
    const lean = free ? clamp(Math.sign(this.Ce) * Math.sqrt(Math.abs(this.Ce)) * CFG.flowLean, -CFG.flowLeanMax, CFG.flowLeanMax) : 0
    const dip = free ? Math.min(CFG.flowDipMax, Math.abs(this.Ce) * CFG.flowDip) : 0
    const base = this.drag && this.drag.on ? CFG.followTight : CFG.followBase
    const aS = touch ? CFG.touchActive : 1, iS = touch ? CFG.touchInactive : CFG.inactiveScale
    const tmp = this._v || (this._v = new THREE.Vector3())
    let motion = 0
    for (const p of this.plates) {
      const m = p.i - this.L, h = Math.abs(m), g = p.i === n
      if (h > CFG.renderRadius + 1) { p.group.visible = false; p.fresh = true; continue }
      const a = m * 0.35, v = CFG.depthGap
      let x = Math.sin(a) * CFG.hGap * 2.4
      let y = (g ? CFG.activeY : 0) - dip * (g ? 0.7 : 1)
      let z = -Math.cos(a) * v * 2.4 + v * 2.4
      if (touch) { this.touchPos(m, tmp); x = tmp.x; y += tmp.y; z = tmp.z }
      let rx = 0
      let ry = touch ? clamp(-m, 0, 1) * -2 * rad(CFG.rotY) + lean * (g ? 1 : 1.12) : -a + lean * (g ? 1 : 1.12)
      const rz = -lean * CFG.flowBank * (g ? 0.7 : 1)
      const S = g ? aS : Math.max(iS, 1 - h * (1 - iS) * (touch ? 1 : 0.6))
      let s, vis = true
      if (g) s = S * G.active
      else {
        const e = clamp(G.others, 0, 2), inb = G.inbound
        const st = clamp(inb ? CFG.flightStaggerIn : CFG.flightStagger, 0, 0.9)
        const r = CFG.flightStaggerMax, lag = (Math.min(h, r) / r) * st
        const o = clamp((Math.min(1, e) - lag) / Math.max(0.1, 1 - st), 0, 1)
        const k = (inb ? outCubic(o) : o * (2 - o)) + Math.max(0, e - 1)
        vis = k > (inb ? CFG.popIn : CFG.popOut) || G.others >= 1
        s = S * k
        const c = 1 - Math.min(1, k)
        if (c > 1e-4) z -= c * CFG.flightRecede
      }
      p.group.visible = vis && s > 0.002
      const want = +(this.hover === p.i && !(this.drag && this.drag.on))
      p.hover += (want - p.hover) * Math.min(1, dt * 10)
      if (p.hover > 0.001) { rx += p.hover * CFG.hoverTilt * this.Ue; ry += p.hover * CFG.hoverTilt * this.U }
      if (this.q.active && g) {
        this.risePos(this.q.rise, tmp); x += tmp.x; y += tmp.y; z += tmp.z
        const t = 1 - this.q.turn
        p.spinY = (-Math.PI / 2) * t; p.spin.rotation.z = CFG.preloadSpin * t * t
        const gk = clamp(this.q.rise / CFG.preloadGrowBy, 0, 1)
        if (G.active < 0.99) s = S * Math.max(G.active, CFG.preloadBoost * (1 - (1 - gk) ** 2))
      } else p.spin.rotation.z = 0
      const k = clamp(base - h * CFG.followFalloff, CFG.followMin, CFG.followTight)
      const A = instant || red || this.flight || p.fresh ? 1 : Math.min(1, dt * k)
      const P = p.group.position, R = p.group.rotation
      motion += Math.abs(x - P.x) + Math.abs(y - P.y) + Math.abs(z - P.z)
      P.x += (x - P.x) * A; P.y += (y - P.y) * A; P.z += (z - P.z) * A
      R.x += (rx - R.x) * A; R.y += (ry - R.y) * A; R.z += (rz - R.z) * A
      const sc = p.group.scale.x + (s - p.group.scale.x) * A
      p.group.scale.setScalar(Math.max(1e-4, sc))
      if (p.fresh && !instant && !red && this.cur >= 0 && G.others >= 1) {
        // a plate entering the render window slides in from its side, a little small
        const side = Math.sign(m)
        P.x += side * 0.9; P.z -= 0.45; R.y -= side * 0.3; p.group.scale.multiplyScalar(0.72)
      }
      p.fresh = false
      if (!(this.drag && this.drag.spin === p.i) && !gsap.isTweening(p)) p.spinX += (0 - p.spinX) * Math.min(1, dt * 2.5)
      p.spin.rotation.x = p.spinX; p.spin.rotation.y = p.spinY
    }
    return motion
  }

  frame = (now) => {
    if (this.dead) return
    this.raf = requestAnimationFrame(this.frame)
    if (document.hidden) { this.last = now; return }
    const t = (now - this.last) / 1000, dt = Math.min(0.05, t)
    this.last = now
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
    this.L = clamp(this.L, -0.05, this.N - 0.95)
    if (this.reduced || this.flight) { this.Ce = 0; this.we = this.L } else {
      const e = clamp((this.L - this.we) / Math.max(dt, 0.001), -40, 40)
      this.we = this.L
      const k = Math.abs(e) > Math.abs(this.Ce) ? 14 : 6
      this.Ce += (e - this.Ce) * Math.min(1, dt * k)
      if (Math.abs(this.Ce) < 0.01) this.Ce = 0
    }
    const c = this.index()
    if (c !== this.cur) { this.cur = c; this.o.onChange && this.o.onChange(c) }
    if (this.o.fog) this.scene.fog.color.set(this.o.fog())
    this.layout(dt)
    this.renderer.render(this.scene, this.cam)
    if (this.o.onFrame) this.o.onFrame()
  }

  /* screen-space box of the front plate, for the scribble ring */
  rectOf(i) {
    const p = this.plates[i]; if (!p || !p.group.visible) return null
    const v = new THREE.Vector3(), W = this.el.clientWidth, H = this.el.clientHeight
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      v.set((sx * p.w) / 2, (sy * p.h) / 2, 0); p.mesh.localToWorld(v); v.project(this.cam)
      const X = (v.x + 1) * 0.5 * W, Y = (1 - v.y) * 0.5 * H
      x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y)
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
  }

  destroy() {
    this.dead = true
    cancelAnimationFrame(this.raf)
    gsap.killTweensOf(this.tw); gsap.killTweensOf(this.G); gsap.killTweensOf(this.q)
    this.plates.forEach((p) => { gsap.killTweensOf(p); p.mesh.geometry.dispose(); p.front.dispose(); p.back.dispose() })
    const c = this.renderer.domElement
    this.el.removeEventListener('wheel', this.h.wheel)
    c.removeEventListener('pointerdown', this.h.down)
    window.removeEventListener('pointermove', this.h.move)
    window.removeEventListener('pointerup', this.h.up)
    window.removeEventListener('pointercancel', this.h.up)
    c.removeEventListener('pointerleave', this.h.leave)
    window.removeEventListener('resize', this.h.resize)
    this.renderer.dispose(); c.remove()
  }
}
