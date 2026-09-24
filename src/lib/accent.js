/* Picks one usable accent out of a painting's dominant colours. Dominant
   colours skew near-black, so this hunts for the most chromatic one and then
   forces it into a band that stays legible on the cream paper. */

function toHsl([r, g, b]) {
  const R = r / 255, G = g / 255, B = b / 255
  const max = Math.max(R, G, B), min = Math.min(R, G, B)
  const l = (max + min) / 2
  const d = max - min
  if (!d) return [0, 0, l]
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6
  else if (max === G) h = ((B - R) / d + 2) / 6
  else h = ((R - G) / d + 4) / 6
  return [h * 360, s, l]
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function pickAccent(palette) {
  if (!palette || !palette.length) return null
  let best = null, bestScore = -1
  palette.forEach((rgb) => {
    const [h, s, l] = toHsl(rgb)
    // chroma is what we want; punish anything so dark or so pale it cannot be pushed into range
    const usable = 1 - Math.abs(l - 0.42) * 1.4
    const score = s * 1.6 + Math.max(0, usable)
    if (score > bestScore) { bestScore = score; best = [h, s, l] }
  })
  const [h, s, l] = best
  /* A near-monochrome painting has no colour to lend. Clamping its saturation up
     would invent one, so hand back a neutral instead and let the page stay ink. */
  if (s < 0.12) return `hsl(${h.toFixed(0)} 6% ${(clamp(l, 0.22, 0.34) * 100).toFixed(0)}%)`
  return `hsl(${h.toFixed(0)} ${(clamp(s, 0.34, 0.74) * 100).toFixed(0)}% ${(clamp(l, 0.3, 0.44) * 100).toFixed(0)}%)`
}
