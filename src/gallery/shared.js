/* The plain parts of the gallery, with no three.js in them: the ease, the tilt, each section's staging and a
   plate's size. Pages import these directly; the gallery itself (and three.js) loads only on the home row. */
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)
export const GLIDE = CustomEase.create('discGlide', '0.32, 0.72, 0, 1')

/* The diagonal. A24 uses -30° on both axes; Shanmu found that a tad steep (iteration 7). */
export const TILT = -19

export const SECTIONS = {
  prose: { tiltX: TILT, tiltY: TILT, area: 2.9, maxSide: 2.1, depth: 0.07, edge: 0xf1ede4, spine: 0xffffff, book: true },
  publications: { tiltX: TILT * 0.55, tiltY: TILT * 0.7, aspect: 0.72, area: 2.2, maxSide: 2, depth: 0.075, edge: 0xf3f0e8, spine: 0xe6e1d6 },
  // iteration 12: the home "Selected" row stages like prose; each plate keeps its own section's shape
  // iteration 19: the one row of everything, staged exactly like A24 (-30° on both axes)
  home: { tiltX: -30, tiltY: -30, area: 2.35, maxSide: 1.85, depth: 0.07, edge: 0xf1ede4, spine: 0xffffff, book: true },
  get deep() { return this.publications },
  get paintings() { return this.prose },
  luck: { tiltX: TILT * 0.45, tiltY: TILT * 0.85, aspect: 1, area: 1.9, maxSide: 1.5, depth: 0.04, edge: 0xefe6d2, spine: 0xefe6d2 },
}

export function plateSize(it, sec) {
  const a = sec.aspect || it.aspect
  let h = Math.sqrt(sec.area / a), w = a * h
  const m = Math.max(w, h)
  if (m > sec.maxSide) { w *= sec.maxSide / m; h *= sec.maxSide / m }
  return [w, h]
}
