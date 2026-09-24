import React, { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { ThesisLines, AITrapFig2 } from './components/Charts'
import { PAPERS } from './data/papers'
import DIMS from './paintingsData'
import COLORS from './colorsData'
import { pickAccent } from './lib/accent'
import { register } from './lib/scroll'
import './styles/globals.css'

/* ============================================================
   DYNAMIC gallery. Sizing is computed from each painting's real pixel
   dimensions (auto-measured into paintingsData.js): aspect ratio and a
   quality cap (never upscale a low-res image past what its pixels support).
   No hand-tuned per-image sizes. `minH` is the only hint, for a few
   detail-heavy pieces that shouldn't read too small.
   ============================================================ */
const META = {
  'ravivarma2.jpg':     { title: 'Lady in a Black Saree', artist: 'Raja Ravi Varma', year: 'c. 1893' },
  'ravivarma.jpg':      { title: 'Radha in the Moonlight', artist: 'Raja Ravi Varma', year: 'c. 1890' },
  'ravivarma3.jpg':     { title: 'There Comes Papa', artist: 'Raja Ravi Varma', year: '1893' },
  'barracoon.jpg':      { title: 'Barracoon', artist: 'Andrew Wyeth', year: '1976' },
  'caitlins-world.jpg': { title: 'Caitlin', artist: 'Andrew Wyeth', year: '1996' },
  'christinas.jpg':     { title: "Christina's World", artist: 'Andrew Wyeth', year: '1948', minH: 50 },
  'wyeth-adrift.jpg':   { title: 'Bonaparte Before the Sphinx', artist: 'Jean-Léon Gérôme', year: 'c. 1868' },
  'wyeth-maypole.jpg':  { title: 'Maypole', artist: 'Andrew Wyeth', year: '1972', minH: 48 },
  'dying-bird.jpg':     { title: 'Dead Bird', artist: '', year: '' },
  'hammershoi.jpg':     { title: 'Interior with a Woman', artist: 'Vilhelm Hammershøi', year: 'c. 1904' },
  'schjerfbeck-convalescent.jpg': { title: 'The Convalescent', artist: 'Helene Schjerfbeck', year: '1888' },
  'sickert-ennui.jpg':  { title: 'Ennui', artist: 'Walter Sickert', year: 'c. 1914', minH: 48 },
  'nonchaloir.jpg':     { title: 'Nonchaloir (Repose)', artist: 'John Singer Sargent', year: '1911' },
  'venice.jpg':         { title: 'A Street in Venice', artist: 'John Singer Sargent', year: 'c. 1882', minH: 56 },
  'carnation.jpg':      { title: 'Carnation, Lily, Lily, Rose', artist: 'John Singer Sargent', year: '1886' },
  'granada.jpg':        { title: 'Hospital at Granada', artist: 'John Singer Sargent', year: 'c. 1912', minH: 48 },
  'sargent-dinner.jpg': { title: 'A Dinner Table at Night', artist: 'John Singer Sargent', year: '1884', minH: 48 },
  'eljaleo.jpg':        { title: 'Kiss by the Window', artist: 'Edvard Munch', year: '1892', minH: 54 },
  'sargent-gassed.jpg': { title: 'Gassed', artist: 'John Singer Sargent', year: '1919', minH: 52 },
  'automat.jpg':        { title: 'Automat', artist: 'Edward Hopper', year: '1927', minH: 48 },
  'hopper-roomny.jpg':  { title: 'Room in New York', artist: 'Edward Hopper', year: '1932', minH: 48 },
  'hopper-elevenam.jpg':{ title: 'Eleven A.M.', artist: 'Edward Hopper', year: '1926', minH: 48 },
  'hopper-soirbleu.jpg':{ title: 'Soir Bleu', artist: 'Edward Hopper', year: '1914', minH: 50 },
  'hopper-nymovie.jpg': { title: 'New York Movie', artist: 'Edward Hopper', year: '1939', minH: 48 },
  'hopper-nyinterior.jpg': { title: 'New York Interior', artist: 'Edward Hopper', year: 'c. 1921', minH: 46 },
  'hopper-gas.jpg':     { title: 'Gas', artist: 'Edward Hopper', year: '1940', minH: 48 },
  'hopper-hotelrr.jpg': { title: 'Hotel by a Railroad', artist: 'Edward Hopper', year: '1952', minH: 48 },
  'munch-sick.jpg':     { title: 'The Sick Child', artist: 'Edvard Munch', year: '1886' },
  'munch-kiss.jpg':     { title: 'In the Luxembourg Gardens', artist: 'John Singer Sargent', year: '1879', minH: 46 },
  'munch-peonies.jpg':  { title: 'Woman with Peonies', artist: 'Edvard Munch', year: 'c. 1925' },
  'lautrec.jpg':        { title: 'La Toilette', artist: 'Henri de Toulouse-Lautrec', year: '1889' },
  'kollwitz.jpg':       { title: 'Woman with Dead Child', artist: 'Käthe Kollwitz', year: '1903' },
  'schiele.jpg':        { title: 'Death and the Maiden', artist: 'Egon Schiele', year: '1915' },
  'schiele2.jpg':       { title: 'The Embrace', artist: 'Egon Schiele', year: '1917' },
  'peschka.jpg':        { title: 'Portrait of Anton Peschka', artist: 'Egon Schiele', year: '1909' },
  'labsinthe.jpg':      { title: "L'Absinthe", artist: 'Edgar Degas', year: 'c. 1876', minH: 46 },
  'manet-bar.jpg':      { title: 'A Bar at the Folies-Bergère', artist: 'Édouard Manet', year: '1882', minH: 50 },
  'cezanne-cards.jpg':  { title: 'The Card Players', artist: 'Paul Cézanne', year: 'c. 1894', minH: 48 },
  'ensor.jpg':          { title: 'The Drunkards', artist: 'James Ensor', year: '1883', minH: 48 },
  'monet-parasol.jpg':  { title: 'Woman with a Parasol', artist: 'Claude Monet', year: '1875' },
  'bellows-club.jpg':   { title: 'Club Night', artist: 'George Bellows', year: '1907', minH: 50 },
  'bellows-stag.jpg':   { title: "Stag at Sharkey's", artist: 'George Bellows', year: '1909', minH: 50 },
  'magritte.jpg':       { title: 'The Lovers', artist: 'René Magritte', year: '1928', minH: 46 },
  'bellei.jpg':         { title: 'An Embrace', artist: 'Gaetano Bellei', year: 'c. 1900', minH: 44 },
  'bastien.jpg':        { title: 'Rural Love', artist: 'Jules Bastien-Lepage', year: '1882', minH: 46 },
  'paolo.jpg':          { title: 'Paolo and Francesca', artist: 'Alexandre Cabanel', year: '1870', minH: 42 },
  'millet.jpg':         { title: 'The Angelus', artist: 'Jean-François Millet', year: 'c. 1859', minH: 46 },
  'calypso.jpg':        { title: "Calypso's Isle", artist: 'Herbert Draper', year: 'c. 1897', minH: 44 },
  'vangogh-oldman.jpg': { title: 'At Eternity’s Gate', artist: 'Vincent van Gogh', year: '1890' },
  'repin.jpg':          { title: 'Ivan the Terrible and His Son', artist: 'Ilya Repin', year: '1885', minH: 50 },
  'apothecary.jpg':     { title: 'The Apothecary', artist: '', year: 'c. 1932', minH: 50 },
  'tiger.jpg':          { title: 'Tiger in a Tropical Storm', artist: 'Henri Rousseau', year: '1891', minH: 54 },
  'wyeth-donkey.jpg':   { title: 'The Langlois Bridge at Arles', artist: 'Vincent van Gogh', year: '1888' },
  'whistler-nocturne.jpg': { title: 'Nocturne in Black and Gold', artist: 'James McNeill Whistler', year: 'c. 1875', minH: 46 },
  'russian-couple.jpg': { title: 'By the Cottage', artist: 'Edvard Munch', year: 'c. 1881' },
  'pollock-west.jpg':   { title: 'Adrift', artist: 'Andrew Wyeth', year: '1982', minH: 46 },
  'blume-head.jpg':     { title: 'Going West', artist: 'Jackson Pollock', year: 'c. 1934' },
  'vangogh-ward.jpg':   { title: 'Ward in the Hospital at Arles', artist: 'Vincent van Gogh', year: '1889', minH: 48 },
  'vangogh-courtyard.jpg': { title: 'Courtyard of the Hospital at Arles', artist: 'Vincent van Gogh', year: '1889', minH: 48 },
  // — pool widened: more of the collection in rotation —
  'blue-morning.jpg':     { title: 'Blue Morning', artist: 'George Bellows', year: '1909', minH: 46 },
  'boar-lane.jpg':        { title: 'Boar Lane, Leeds', artist: 'John Atkinson Grimshaw', year: '1881', minH: 46 },
  'homer-hurricane.jpg':  { title: 'After the Hurricane, Bahamas', artist: 'Winslow Homer', year: '1899', minH: 44 },
  'simplon.jpg':          { title: 'Simplon Pass', artist: 'John Singer Sargent', year: 'c. 1911', minH: 44 },
  'klimt-beech.jpg':      { title: 'Beech Grove I', artist: 'Gustav Klimt', year: '1902' },
  'friedrich-abbey.jpg':  { title: 'The Abbey in the Oakwood', artist: 'Caspar David Friedrich', year: 'c. 1810', minH: 44 },
  'turner-rain.jpg':      { title: 'Rain, Steam and Speed', artist: 'J. M. W. Turner', year: '1844', minH: 46 },
  'monet-poppies.jpg':    { title: 'Poppies', artist: 'Claude Monet', year: '1873', minH: 46 },
  'monet-parliament.jpg': { title: 'Houses of Parliament, Sunset', artist: 'Claude Monet', year: '1903', minH: 46 },
  'monet-waterloo.jpg':   { title: 'Waterloo Bridge, Grey Day', artist: 'Claude Monet', year: '1903', minH: 46 },
  'matisse-conv.jpg':     { title: 'The Conversation', artist: 'Henri Matisse', year: 'c. 1909', minH: 48 },
  'hitchcock-tulip.jpg':  { title: 'Tulip Culture', artist: 'George Hitchcock', year: '1889', minH: 46 },
  'bellows-newyork.jpg':  { title: 'New York', artist: 'George Bellows', year: '1911', minH: 48 },
  'bellows-summernight.jpg': { title: 'Summer Night, Riverside Drive', artist: 'George Bellows', year: '1909', minH: 46 },
  'mondrian-tableau.jpg': { title: 'Tableau I', artist: 'Piet Mondrian', year: '1921', minH: 44 },
  'kandinsky-akhtyrka.jpg': { title: 'Akhtyrka', artist: 'Wassily Kandinsky', year: '1901', minH: 46 },
  'klimt-hygieia.jpg':    { title: 'Hygieia', artist: 'Gustav Klimt', year: 'c. 1907' },
  'ravivarma-mirror.jpg': { title: 'Looking into the Mirror', artist: 'Raja Ravi Varma', year: 'c. 1890' },
  // — second wave: more of the collection catalogued (vision-identified) —
  'ryder-racetrack.jpg':    { title: 'The Race Track (Death on a Pale Horse)', artist: 'Albert Pinkham Ryder', year: 'c. 1896–1908', minH: 46 },
  'hitchcock-vanquished.jpg': { title: 'Vanquished', artist: 'George Hitchcock', year: '1895', minH: 46 },
  'wyeth-bluedoor.jpg':     { title: 'The Blue Door', artist: 'Andrew Wyeth', year: '1952', minH: 46 },
  'mondrian-castle.jpg':    { title: 'Spring Sun: Castle Ruin, Brederode', artist: 'Piet Mondrian', year: 'c. 1909–10', minH: 44 },
  'munch-horsecart.jpg':    { title: 'Horse and Cart on a Country Road', artist: 'Edvard Munch', year: 'c. 1881', minH: 44 },
  'hitchcock-flight.jpg':   { title: 'The Flight into Egypt', artist: 'George Hitchcock', year: '1892', minH: 46 },
  'kandinsky-composition.jpg': { title: 'Composition VIII', artist: 'Wassily Kandinsky', year: '1923', minH: 46 },
  'hopper-paintermodel.jpg':{ title: 'Painter and Model', artist: 'Edward Hopper', year: 'c. 1903', minH: 46 },
  'hopper-railroad.jpg':    { title: 'Railroad Train', artist: 'Edward Hopper', year: '1908', minH: 46 },
  'hopper-sundaymorning.jpg': { title: 'Early Sunday Morning', artist: 'Edward Hopper', year: '1930', minH: 46 },
  'rojas-miseria.jpg':      { title: 'La Miseria', artist: 'Cristóbal Rojas', year: '1886', minH: 46 },
  'wyeth-floodplain.jpg':   { title: 'Flood Plain', artist: 'Andrew Wyeth', year: '1986', minH: 44 },
  'wyeth-perpetualcare.jpg':{ title: 'Perpetual Care', artist: 'Andrew Wyeth', year: '1961', minH: 48 },
  'vallotton-wind.jpg':     { title: 'The Wind', artist: 'Félix Vallotton', year: '1910', minH: 46 },
  'henri-volendam.jpg':     { title: 'Volendam Street Scene', artist: 'Robert Henri', year: '1910', minH: 46 },
  'sargent-olive.jpg':      { title: 'Wild Olive, Majorca', artist: 'John Singer Sargent', year: 'c. 1908', minH: 46 },
  'monadnock.jpg':          { title: 'Mount Monadnock', artist: 'Abbott Handerson Thayer', year: 'c. 1914', minH: 46 },
  'lake-nemi.jpg':          { title: 'View of Lake Nemi', artist: 'Jules Coignet', year: '1843', minH: 46 },
  'seine.jpg':              { title: 'The Seine', artist: 'Henry Ossawa Tanner', year: 'c. 1902', minH: 46 },
  // — third wave (2026-09): from ~/Desktop/Paintings —
  'vangogh-girlinwhite.jpg': { title: 'Girl in White', artist: 'Vincent van Gogh', year: '1890' },
  'vangogh-irises.jpg':     { title: 'Irises', artist: 'Vincent van Gogh', year: '1889', minH: 46 },
  'vangogh-poppyfield.jpg': { title: 'Poppy Field', artist: 'Vincent van Gogh', year: '1890', minH: 46 },
  'matisse-goldfish.jpg':   { title: 'The Goldfish', artist: 'Henri Matisse', year: '1912' },
  'matisse-redstudio.jpg':  { title: 'The Red Studio', artist: 'Henri Matisse', year: '1911', minH: 46 },
  'pollock-bluepoles.jpg':  { title: 'Blue Poles', artist: 'Jackson Pollock', year: '1952', minH: 40 },
  'sargent-jaleo.jpg':      { title: 'El Jaleo', artist: 'John Singer Sargent', year: '1882', minH: 50 },
  'munch-landscape.jpg':    { title: 'Landscape', artist: 'Edvard Munch', year: '', minH: 44 },
}

/* which way the subject faces: 'L' looks toward viewer-left, 'R' toward viewer-right,
   anything unlisted is 'F' (frontal / back / ambiguous). Used to alternate gaze so
   consecutive figures tend to look toward each other or out to opposite sides. */
const GAZE = {
  'ravivarma2.jpg': 'R', 'ravivarma.jpg': 'R', 'ravivarma3.jpg': 'R',
  'barracoon.jpg': 'L', 'caitlins-world.jpg': 'L', 'christinas.jpg': 'R',
  'nonchaloir.jpg': 'L', 'eljaleo.jpg': 'L', 'sargent-gassed.jpg': 'R',
  'hopper-elevenam.jpg': 'L', 'hopper-nymovie.jpg': 'R', 'hopper-gas.jpg': 'L',
  'munch-sick.jpg': 'L', 'peschka.jpg': 'R', 'labsinthe.jpg': 'R', 'monet-parasol.jpg': 'L',
  'vangogh-girlinwhite.jpg': 'L',
  /* added after looking at all 102: only these have a single unambiguous facing
     direction. The rest are landscapes, abstractions, frontal portraits, or
     two-figure scenes already facing each other, where 'F' is the right answer. */
  'wyeth-adrift.jpg': 'R', 'sargent-jaleo.jpg': 'L', 'munch-kiss.jpg': 'L', 'munch-peonies.jpg': 'L',
  'vangogh-oldman.jpg': 'L', 'rojas-miseria.jpg': 'R', 'ryder-racetrack.jpg': 'L',
  'sickert-ennui.jpg': 'R', 'schjerfbeck-convalescent.jpg': 'R',
  'calypso.jpg': 'L', 'repin.jpg': 'L', 'tiger.jpg': 'L',
}
const gazeOf = (s) => GAZE[s] || 'F'

const SHOWN = 14                     // paintings per gallery
const LEAD = 'ravivarma2.jpg'        // the Indian lady leads the first gallery
const AREA = 2600, GMIN = 34, GMAX = 76         // Cargo-flavored ribbon: moderate size range
const RHY = [1.28, 0.82, 1.08, 0.92, 1.2, 0.8, 1.0, 0.95, 1.15, 0.86]   // size cadence by position (big -> small rhythm)
const GAPS = [4.6, 1.5, 2.8, 1.8, 4.2, 1.4, 2.3, 2.0, 3.8, 1.6]          // whitespace cadence (vw): generous around big pieces
const NUDGE = [0, -6, 5, 7, -4, 6, -7, 4, -5, 6]                          // subtle fixed vertical nudge (vh), eased onto smaller pieces
/* Cargo-flavored centered ribbon (deterministic — fixed rhythms, no randomness, so it never looks messy):
   each painting is sized by EQUAL VISUAL AREA from its real shape times a repeating size cadence
   (moderate contrast). Whitespace follows its own cadence (more air around the big pieces). All sit on
   the mid-line, with a small fixed vertical nudge eased onto the smaller pieces. Never upscaled. */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[r[i], r[j]] = [r[j], r[i]] } return r }

/* WebP variants live at /paintings/<name>-<width>.webp (see scripts/build-paintings.cjs).
   Pick the smallest one that covers how large the painting is drawn (CSS px x device pixels, capped:
   paintings don't need full 2-3x density, and it keeps a 14-painting gallery to ~1-3 MB instead of ~10). */
const DPR_CAP = 1.6
const fileBase = (src) => src.replace(/\.jpe?g$/i, '')
function variantFor(src, cssWidthPx) {
  const d = DIMS[src]
  if (!d) return ''
  const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, DPR_CAP)
  const need = cssWidthPx * dpr
  const w = d.widths.find((x) => x >= need) || d.widths[d.widths.length - 1]
  return `/paintings/${fileBase(src)}-${w}.webp`
}
const largestSrc = (src) => { const d = DIMS[src]; return d ? `/paintings/${fileBase(src)}-${d.widths[d.widths.length - 1]}.webp` : '' }
/* The dominant colour holds each slot before its image decodes, but a handful of
   near-white paintings produce a chip that vanishes against the paper. Those get
   walked toward the ink until the slot is visible. */
const placeholderOf = (src) => {
  const c = COLORS[src] && COLORS[src][0]
  if (!c) return 'var(--paper-2)'
  const lum = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  if (lum < 196) return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
  const k = Math.min(1, (lum - 196) / 60) * 0.34
  const mix = (v) => Math.round(v * (1 - k) + 11 * k)
  return `rgb(${mix(c[0])}, ${mix(c[1])}, ${mix(c[2])})`
}

/* equal-area sizing x a size cadence; whitespace + a small vertical nudge follow their own cadences.
   Every slot gets an explicit width AND height (vh) so the strip has its final footprint before any
   image arrives: no layout shift, and the dominant-colour placeholder shows the painting's shape. */
function sizeSet(srcs) {
  const vhPx = (typeof window !== 'undefined' && window.innerHeight) || 900
  const vwPx = (typeof window !== 'undefined' && window.innerWidth) || 1400
  const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 2)
  const scale = vwPx <= 900 ? 0.85 : 1                // phones: paintings 15% smaller
  return srcs.filter((s) => DIMS[s]).map((src, i) => {
    const d = DIMS[src]
    const ar = d.w / d.h                              // computed from real pixels
    const qMax = (d.h * 100) / (dpr * vhPx)           // never upscale past native resolution
    const meta = META[src] || { title: '', artist: '' }
    // equal visual area x a repeating cadence -> structured big/small variation
    const base = clamp(Math.sqrt(AREA / ar) * RHY[i % RHY.length], Math.max(GMIN, meta.minH || 0), Math.min(GMAX, qMax))
    const h = base * scale, w = h * ar
    const tallness = clamp((base - GMIN) / (GMAX - GMIN), 0, 1)
    const y = NUDGE[i % NUDGE.length] * (1 - tallness)   // small pieces nudged up/down, big ones stay centred
    const url = variantFor(src, (w / 100) * vhPx)
    return { src, url, title: meta.title, artist: meta.artist, year: meta.year, h, w, y, gap: GAPS[i % GAPS.length], bg: placeholderOf(src) }
  })
}
/* category = artist (so 3 Ravi Varmas / 3 Hoppers never stack); blanks stay unique */
/* No browser exposes "the user bypassed the cache", so infer it: a reload whose
   immutable /assets/* came back over the wire instead of out of the disk cache.
   Only ever gates the hint, so a false positive costs one extra pill. */
function hardReloaded() {
  try {
    const nav = performance.getEntriesByType('navigation')[0]
    if (!nav || nav.type !== 'reload') return false
    return performance.getEntriesByType('resource')
      .some((r) => r.name.includes('/assets/') && r.transferSize > 0)
  } catch (e) {
    return false
  }
}

const catOf = (s) => (META[s] && META[s].artist) || s
/* the same category never appears within 2 of itself (gap >= 2): if A is Ravi Varma,
   the next two paintings can't be Ravi Varma. */
const COOLDOWN = 2
/* the whole cohesive pool (muted figure / scene paintings), drawn from for every gallery */
const POOL = [
  'ravivarma2.jpg', 'ravivarma.jpg', 'ravivarma3.jpg',
  'barracoon.jpg', 'caitlins-world.jpg', 'christinas.jpg', 'wyeth-adrift.jpg', 'wyeth-maypole.jpg', 'wyeth-donkey.jpg', 'dying-bird.jpg',
  'venice.jpg', 'nonchaloir.jpg', 'carnation.jpg', 'granada.jpg', 'sargent-dinner.jpg', 'eljaleo.jpg', 'sargent-gassed.jpg',
  'automat.jpg', 'hopper-roomny.jpg', 'hopper-elevenam.jpg', 'hopper-soirbleu.jpg', 'hopper-nymovie.jpg', 'hopper-nyinterior.jpg', 'hopper-gas.jpg', 'hopper-hotelrr.jpg',
  'munch-sick.jpg', 'munch-kiss.jpg', 'munch-peonies.jpg',
  'schiele.jpg', 'schiele2.jpg', 'peschka.jpg',
  'bellows-club.jpg', 'bellows-stag.jpg',
  'labsinthe.jpg', 'lautrec.jpg', 'manet-bar.jpg', 'cezanne-cards.jpg', 'ensor.jpg', 'monet-parasol.jpg', 'magritte.jpg', 'whistler-nocturne.jpg',
  'vangogh-oldman.jpg', 'vangogh-girlinwhite.jpg', 'vangogh-ward.jpg', 'vangogh-courtyard.jpg', 'pollock-west.jpg', 'blume-head.jpg', 'russian-couple.jpg',
  'bellei.jpg', 'bastien.jpg', 'paolo.jpg', 'millet.jpg', 'calypso.jpg', 'kollwitz.jpg', 'hammershoi.jpg', 'schjerfbeck-convalescent.jpg', 'sickert-ennui.jpg', 'repin.jpg', 'apothecary.jpg', 'tiger.jpg',
  // — newly catalogued, widening the pool —
  'blue-morning.jpg', 'boar-lane.jpg', 'homer-hurricane.jpg', 'simplon.jpg',
  'klimt-beech.jpg', 'friedrich-abbey.jpg', 'turner-rain.jpg', 'monet-poppies.jpg', 'monet-parliament.jpg', 'monet-waterloo.jpg',
  'matisse-conv.jpg', 'matisse-redstudio.jpg', 'hitchcock-tulip.jpg', 'bellows-newyork.jpg', 'bellows-summernight.jpg',
  'mondrian-tableau.jpg', 'kandinsky-akhtyrka.jpg', 'klimt-hygieia.jpg', 'ravivarma-mirror.jpg',
  // — second wave —
  'ryder-racetrack.jpg', 'hitchcock-vanquished.jpg', 'wyeth-bluedoor.jpg', 'mondrian-castle.jpg', 'munch-horsecart.jpg',
  'hitchcock-flight.jpg', 'kandinsky-composition.jpg',
  'hopper-paintermodel.jpg', 'hopper-railroad.jpg', 'hopper-sundaymorning.jpg', 'rojas-miseria.jpg',
  'wyeth-floodplain.jpg', 'wyeth-perpetualcare.jpg', 'vallotton-wind.jpg', 'henri-volendam.jpg', 'sargent-olive.jpg',
  'monadnock.jpg', 'lake-nemi.jpg', 'seine.jpg',
  // — third wave —
  'vangogh-irises.jpg', 'vangogh-poppyfield.jpg', 'matisse-goldfish.jpg', 'pollock-bluepoles.jpg', 'sargent-jaleo.jpg', 'munch-landscape.jpg',
].filter((s) => DIMS[s])

/* choose SHOWN paintings, unseen ones first (novelty); opener leads with Ravi Varma */
function pickSrcs(seen, opener) {
  const all = shuffle(POOL)
  const chosen = [...all.filter((s) => !seen.has(s)), ...all.filter((s) => seen.has(s))]
  const out = opener ? [LEAD, ...chosen.filter((s) => s !== LEAD)] : chosen
  return out.slice(0, SHOWN)
}
/* color cohesion: how many of one painting's dominant colors have a near match in another's.
   Manhattan distance in RGB; SIM is the "these two colors read as the same" threshold. */
const SIM = 96
const cdist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2])
function sharedColors(s1, s2) {
  const A = COLORS[s1] || [], B = COLORS[s2] || []
  let n = 0
  for (const a of A) if (B.some((b) => cdist(a, b) < SIM)) n++
  return n
}
/* sophisticated ordering: greedy chain that, from the current painting, picks the next one to
   (1) share at least ~2 colors (cohesion), (2) face the opposite way (gaze dialogue), while
   keeping the same artist at least 2 apart (gap >= 2). Small jitter keeps redo galleries varied. */
function orderCohesive(srcs, lead) {
  const pool = srcs.slice()
  const start = lead && pool.includes(lead) ? lead : pool[0]
  const res = [start]; pool.splice(pool.indexOf(start), 1)
  while (pool.length) {
    const prev = res[res.length - 1]
    const recent = res.slice(-COOLDOWN).map(catOf)
    const pg = gazeOf(prev)
    let best = null, bestScore = -Infinity
    for (const s of pool) {
      if (recent.includes(catOf(s))) continue            // gap >= 2 between same artist
      const shared = sharedColors(prev, s)
      let score = shared * 10                             // cohesion dominates
      if (shared >= 2) score += 8                         // bonus once they truly cohere
      const g = gazeOf(s)
      if ((pg === 'L' && g === 'R') || (pg === 'R' && g === 'L')) score += 7   // facing each other
      else if (pg !== 'F' && g === pg) score -= 5                              // both look the same way
      score += Math.random() * 4                          // tie-break variety across redos
      if (score > bestScore) { bestScore = score; best = s }
    }
    if (best === null) {                                  // everything left is on cooldown: relax
      best = pool.find((s) => catOf(s) !== catOf(prev)) || pool[0]
    }
    res.push(best); pool.splice(pool.indexOf(best), 1)
  }
  return res
}
function buildGallery(seen, opener) {
  return sizeSet(orderCohesive(pickSrcs(seen, opener), opener ? LEAD : null))
}

/* excerpt = draft opening line (placeholder voice; edit freely or I can pull the real first lines) */
const STORIES = [
  { title: 'How to Be Thanked', kind: 'Short Story', venue: 'Substack', excerpt: 'The onions were distractingly pungent. But he kept reading.', href: 'https://open.substack.com/pub/shanmuraja/p/how-to-be-thanked?r=1hai5c&utm_medium=web', latest: true },
  { title: 'Burnt Red Tongues', kind: 'Historical Fiction', venue: 'Medium', excerpt: 'The fire came for the temple first, and the language second.', href: 'https://shanmuraja.medium.com/burnt-red-tongues-e5647e67d243' },
  { title: 'Fugue State', kind: 'Short Story', venue: 'Unpublished', excerpt: 'She woke in a city she had never agreed to live in.' },
  { title: 'A Pound of Flesh', kind: 'Short Story', venue: 'Substack', excerpt: 'Everyone wanted their share, and the body was only so large.', href: 'https://open.substack.com/pub/shanmuraja/p/a-pound-of-flesh?r=1hai5c&utm_medium=web' },
  { title: 'a boring call', kind: 'A Short', venue: 'Substack', excerpt: 'Nothing happened on the call, which was the whole of it.', href: 'https://open.substack.com/pub/shanmuraja/p/a-boring-call?r=1hai5c&utm_medium=web' },
  { title: 'The Sound and the Fury', kind: 'Essay · Legacy, ethics, and the cost of progress', venue: 'Medium', excerpt: 'Progress keeps a ledger, and someone always settles it.', href: 'https://shanmuraja.medium.com/the-sound-and-the-fury-b688bde9e526' },
  { title: 'Birds Do Not Sing in Caves', kind: 'Essay · Masculinity in medicine', venue: 'Medium', excerpt: 'They taught us to suture in silence, and to feel the same way.', href: 'https://shanmuraja.medium.com/birds-do-not-sing-in-caves-ef64cb65c790' },
  { title: 'Young Boy Blues', kind: 'Essay · On caretaking', venue: 'Medium', excerpt: 'Caretaking is a love that arrives dressed as obligation.', href: 'https://shanmuraja.medium.com/young-boy-blues-0ce82e7971e0' },
  { title: 'I’ve Gone to the Country Spa', kind: 'Essay · Psychiatry and heredity', venue: 'Medium', excerpt: 'Madness, in my family, was always discussed in the past tense.', href: 'https://shanmuraja.medium.com/ive-gone-to-the-country-spa-0b4313d7b8d7' },
  { title: 'Jack of All Trades, Master of None', kind: 'Essay · Choosing a specialty', venue: 'Medium', excerpt: 'Every specialty asks you to amputate the others.', href: 'https://shanmuraja.medium.com/jack-of-all-trades-master-of-none-3e1be5a35d7b' },
  { title: 'Sonder', kind: 'Essay · My time in India', venue: 'Medium', excerpt: 'In India, every passing stranger carried a life as vivid as my own.', href: 'https://shanmuraja.medium.com/sonder-c07feba361e0' },
  { title: 'Do You Lift, Bro?', kind: 'Essay · My time in orthopedics', venue: 'Medium', excerpt: 'On the orthopedics ward, strength was both the question and the cure.', href: 'https://shanmuraja.medium.com/do-you-lift-bro-b2c620677895' },
  { title: 'Got Your Toe!', kind: 'Essay · A skilled nursing facility', venue: 'Medium', excerpt: 'At the nursing home, the body keeps a longer memory than the mind.', href: 'https://shanmuraja.medium.com/got-your-toe-472b0e2a74cb' },
]

const AWARDS = [
  { rn: 'I', title: 'Shortlist · The New Yorker', desc: <>For the historical short fiction <em>“Burnt Red Tongues.”</em></> },
  { rn: 'II', title: 'Shortlist · Paul Kalanithi Writing Competition', desc: <>Stanford’s national essay prize, in memory of the late neurosurgeon and author of <em>When Breath Becomes Air.</em></> },
  { rn: 'III', title: 'Winner · Massachusetts Undergraduate Poetry Festival', desc: <>First prize, statewide juried competition.</> },
  { rn: 'IV', title: 'Finalist · American College of Preventive Medicine', desc: <>Annual Meeting, Baltimore, MD. Selected abstract: <em>Branded Wegovy™ vs. Compounded Semaglutide + Cyanocobalamin.</em></> },
]
const ICONS = {
  medium: <path d="M2.5 5.5h6.6l3.1 7.4 3-7.4H21.5v.4l-1.6 1.5v8.7l1.6 1.5v.4h-6.4v-.4l1.7-1.6v-7.6l-3.9 9.6h-.5l-4.4-9.6v6.6l1.9 2.2v.4H4.7v-.4l1.9-2.2V7.4L4.5 5.9v-.4z" />,
  substack: <path d="M5 4.5h14v2.2H5V4.5zM5 8.6h14v2.2H5V8.6zM5 12.7l7 3.9 7-3.9V20l-7-3.9L5 20v-7.3z" />,
  instagram: <><rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.4" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="17" cy="7" r="1.2" /></>,
  linkedin: <path d="M4.5 4.5h15v15h-15v-15zm3.1 5.6H6.1v7.3h1.5v-7.3zm-.75-2.5a.9.9 0 100 1.8.9.9 0 000-1.8zm9.65 4.6c0-1.7-1-2.4-2.2-2.4-1 0-1.5.55-1.7.95v-.85h-1.5v7.3h1.5v-4c0-1 .65-1.3 1.15-1.3.5 0 .95.35.95 1.25v4.05h1.5v-4.35z" />,
  x: <path d="M5 4.5h3.6l3.3 4.7 3.8-4.7H19l-5.2 6.3L19.6 19.5H16l-3.7-5.2-4.2 5.2H5.4l5.6-6.8L5 4.5zm2.1 1.2l9.1 12.6h1.6L8.7 5.7H7.1z" />,
}
const SOCIALS = [
  ['Medium', 'medium', 'https://shanmuraja.medium.com/'],
  ['Substack', 'substack', 'https://shanmuraja.substack.com/'],
  ['Instagram', 'instagram', 'https://instagram.com/shanmuraja_'],
  ['LinkedIn', 'linkedin', 'https://www.linkedin.com/in/shanmuraja'],
]

const NAVLINKS = [['Stories', '#stories'], ['Papers', '#papers'], ['Awards', '#awards'], ['Deep dives', '#features'], ['Contact', '#bio']]

export default function App() {
  const seenRef = useRef(new Set())          // paintings the visitor has already seen
  const [gallery, setGallery] = useState(() => {
    const g = buildGallery(seenRef.current, true)   // opener leads with Ravi Varma
    g.forEach((x) => seenRef.current.add(x.src))
    return g
  })
  const [active, setActive] = useState(null) // lightbox target (+ origin rect)
  const [closing, setClosing] = useState(false)
  const [fading, setFading] = useState(false)
  const [hint, setHint] = useState('none')          // one-time nudge toward the reshuffle button
  const hintSpent = useRef(false)
  const [scrolled, setScrolled] = useState(false)   // nav: newspaper masthead -> floating pill on scroll
  const [hiddenSrc, setHiddenSrc] = useState(null)  // painting currently lifted into the lightbox (its gallery copies hide)
  const [hiRes, setHiRes] = useState(null)          // full-size variant, swapped into the lightbox once decoded
  const trackRef = useRef(null)
  const cardRef = useRef(null)        // lightbox glass card (animated from the clicked painting)
  const glassRef = useRef(null)       // the glass overlay (fades in on open, out on close)
  const openAnimRef = useRef(null)    // the open (rise) animations, cancelled before the close tracking
  const draggedRef = useRef(false)   // true right after a drag, so it doesn't open the modal

  // one motion model across the whole site: everything marked .rv is driven by
  // scroll position, same as the paper pages, so it rewinds when you scroll back
  useEffect(() => {
    const offs = Array.from(document.querySelectorAll('.rv')).map((el) => register(el, { span: 0.3 }))
    return () => offs.forEach((off) => off())
  }, [gallery])

  // the reshuffle button is easy to miss, so point at it once per visitor and never again
  const retireHint = () => {
    hintSpent.current = true
    try { localStorage.setItem('sr-gallery-hint', '1') } catch (e) { /* private mode */ }
    setHint((h) => (h === 'in' ? 'out' : 'none'))
  }
  useEffect(() => {
    let spent = true
    try { spent = localStorage.getItem('sr-gallery-hint') === '1' } catch (e) { spent = true }
    if (spent && !hardReloaded() && window.location.hash !== '#hint') { hintSpent.current = true; return }
    const show = setTimeout(() => { if (!hintSpent.current) setHint('in') }, 3200)
    return () => clearTimeout(show)
  }, [])
  useEffect(() => {
    if (hint === 'in') { const t = setTimeout(retireHint, 6500); return () => clearTimeout(t) }
    if (hint === 'out') { const t = setTimeout(() => setHint('none'), 420); return () => clearTimeout(t) }
  }, [hint])

  // accent: whichever painting is nearest the middle of the screen lends the page its one colour
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const gal = track.parentElement
    let raf = 0, current = null, running = false
    const step = () => {
      const mid = window.innerWidth / 2
      let nearest = null, best = Infinity
      track.querySelectorAll('.m-item').forEach((it) => {
        const r = it.getBoundingClientRect()
        const d = Math.abs((r.left + r.right) / 2 - mid)
        if (d < best) { best = d; nearest = it.dataset.src }
      })
      if (nearest && nearest !== current) {
        current = nearest
        const accent = pickAccent(COLORS[nearest])
        if (accent) document.documentElement.style.setProperty('--accent', accent)
      }
      if (running) raf = requestAnimationFrame(step)
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(step) }
        else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf) }
      })
    }, { threshold: 0 })
    io.observe(gal)
    return () => { running = false; cancelAnimationFrame(raf); io.disconnect() }
  }, [])

  // gallery drift: slow auto-scroll + weighted momentum from horizontal wheel AND click/touch drag.
  // physics is time-based (px/second), so the weight feels identical at 60 and 120 Hz.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const gal = track.parentElement
    const AUTO = -21           // px/s, resting leftward drift
    // exponential decay, the model iOS/Framer/Lenis all use. TAU sits between UIScrollView
    // normal (0.50s) and Framer's inertia (0.70s); POWER is Framer's release scaling.
    const TAU = 0.55           // s, coast time constant: raise for a longer glide
    const POWER = 0.8          // fling launches at this share of hand speed
    const MAX = 3800           // px/s, only a genuinely hard flick ever gets near this
    const STOP = 25            // px/s, below this it's indistinguishable from the drift, so just settle
    const SAMPLE_MS = 110      // release speed is averaged over this much of the drag
    const REF = 1200           // px/s, the hand speed treated as an ordinary swipe
    const GAMMA = 1.5          // >1 so an aggressive flick gains more than proportionally
    const clamp = (v) => Math.max(-MAX, Math.min(MAX, v))
    // pressure: map hand speed to launch speed on a curve, so a soft swipe stays soft and a
    // hard one is rewarded well beyond proportional. Shared by trackpad and touch for one feel.
    const pressure = (v) => {
      const m = Math.abs(v)
      return m < 1 ? 0 : clamp(Math.sign(v) * REF * Math.pow(m / REF, GAMMA) * POWER)
    }
    let offset = 0, vel = AUTO, copyW = 1, raf, last = performance.now()
    let down = false, dragging = false, lastX = 0, moved = 0
    let wheelV = 0, wheelT = 0
    const samples = []
    const N = gallery.length                 // first painting of the 2nd copy = exactly one loop wide
    const measure = () => { const s = track.children[N]; copyW = (s && s.offsetLeft) || track.scrollWidth / 2 || 1 }
    measure()
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)   // clamp so a backgrounded tab doesn't teleport the track
      last = now
      const s = track.children[N]            // exact loop width each frame -> wrap is perfectly seamless
      if (s && s.offsetLeft) copyW = s.offsetLeft
      if (!dragging) {
        const rel = (vel - AUTO) * Math.exp(-dt / TAU)            // speed measured against the resting drift
        vel = AUTO + (Math.abs(rel) < STOP ? 0 : rel)             // snap the last crawl away, no endless tail
        offset += vel * dt
      }
      offset = ((offset % copyW) + copyW) % copyW - copyW   // seamless loop
      track.style.transform = `translateX(${offset.toFixed(2)}px)`
      raf = requestAnimationFrame(tick)
    }
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      const now = performance.now()
      const fresh = now - wheelT > 140            // a pause means a new gesture, don't inherit the old speed
      const dt = fresh ? 0.016 : Math.max(0.008, Math.min(0.05, (now - wheelT) / 1000))
      wheelT = now
      const inst = -e.deltaX / dt                 // the px/s this event represents
      wheelV = fresh ? inst : wheelV * 0.7 + inst * 0.3   // smooth the event stream into a hand speed
      const p = pressure(wheelV)
      if (Math.abs(p) > Math.abs(vel) || Math.sign(p) !== Math.sign(vel)) vel = p
    }
    const onDown = (e) => {
      down = true; dragging = false; lastX = e.clientX; moved = 0; draggedRef.current = false
      samples.length = 0; samples.push({ t: performance.now(), x: e.clientX })
      // don't touch velocity yet: a plain click must NOT stop the drift
    }
    const onMove = (e) => {
      if (!down) return
      const dx = e.clientX - lastX
      moved += Math.abs(dx); lastX = e.clientX
      if (!dragging && moved > 4) { dragging = true; gal.classList.add('grabbing') }   // real drag begins
      if (dragging) {
        offset += dx
        const t = performance.now()
        samples.push({ t, x: e.clientX })
        while (samples.length > 2 && t - samples[0].t > SAMPLE_MS) samples.shift()
      }
    }
    const onUp = () => {
      if (!down) return
      down = false
      if (dragging) {                                    // it was a drag -> release with momentum
        dragging = false; gal.classList.remove('grabbing')
        draggedRef.current = moved > 6
        // speed over the tail of the drag, not one frame: a stall before lift really does stop it
        const t = performance.now()
        while (samples.length > 2 && t - samples[0].t > SAMPLE_MS) samples.shift()
        const a = samples[0], b = samples[samples.length - 1]
        const span = a && b ? (b.t - a.t) / 1000 : 0
        const stale = !b || t - b.t > SAMPLE_MS
        const v = (!stale && span > 0.008) ? (b.x - a.x) / span : 0
        vel = pressure(v)   // no ramp: the response is instant, the curve decides how hard it launches
      }
      // a plain click leaves vel untouched, so the gallery keeps drifting without a pause
    }
    gal.addEventListener('wheel', onWheel, { passive: false })
    gal.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('resize', measure)
    const imgs = [...track.querySelectorAll('img')]
    imgs.forEach((im) => im.addEventListener('load', measure))
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      gal.removeEventListener('wheel', onWheel); gal.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('resize', measure); imgs.forEach((im) => im.removeEventListener('load', measure))
    }
  }, [gallery])

  // nav morphs from full-width masthead to a floating pill once you scroll past the hero a little
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // smooth redo: fade out, pick a gallery with the most unseen paintings, fade the new one in
  const redo = () => {
    if (fading) return
    if (!hintSpent.current) retireHint()
    setFading(true)
    if (seenRef.current.size >= POOL.length) seenRef.current = new Set()   // all seen -> refresh novelty
    const g = buildGallery(seenRef.current, false)   // fresh paintings, no forced first
    g.forEach((x) => seenRef.current.add(x.src))
    // PRELOAD the new paintings during the fade-out so they don't pop in / make the strip jump
    // after the swap. Reveal only once BOTH the fade-out is done AND the images are decoded.
    let faded = false, ready = false, done = false
    const reveal = () => {
      if (done || !(faded && ready)) return
      done = true
      setGallery(g)
      requestAnimationFrame(() => requestAnimationFrame(() => setFading(false)))
    }
    setTimeout(() => { faded = true; reveal() }, 340)            // let the fade-out finish
    const imgs = g.map((x) => { const im = new Image(); im.src = x.url; return im })
    let left = imgs.length || 1
    const tick = () => { if (--left <= 0) { ready = true; reveal() } }
    imgs.forEach((im) => { (im.decode ? im.decode() : Promise.resolve()).then(tick, tick) })   // a failed image counts too
    setTimeout(() => { ready = true; reveal() }, 6000)           // safety: never hang on a slow connection
  }
  const loop = [...gallery, ...gallery]

  const openItem = (p, e) => {
    if (draggedRef.current) { draggedRef.current = false; return }   // ignore the click that ends a drag
    const fig = e.currentTarget
    if (fig.classList.contains('broken')) return                       // image never loaded: nothing to show
    const img = fig.querySelector('img')
    const r = img.getBoundingClientRect()
    if (!r.width || !r.height) return
    setHiddenSrc(p.src)                            // hide the original(s) -> only the rising card shows
    setClosing(false)
    setActive({ ...p, shown: img.currentSrc || p.url, rect: { left: r.left, top: r.top, width: r.width, height: r.height } })
  }
  // every laid-out copy of a painting as an img rect (the strip renders two copies for the seamless loop)
  const copyRects = (src) => {
    const out = []
    document.querySelectorAll('.m-item').forEach((it) => {
      if (it.dataset.src !== src) return
      const im = it.querySelector('img')
      if (!im) return
      const r = im.getBoundingClientRect()
      if (r.width) out.push({ left: r.left, top: r.top, width: r.width, height: r.height })
    })
    return out
  }
  // find the most-centered on-screen copy of a painting (the strip keeps drifting), as an img rect
  const liveRect = (src) => {
    let best = null, bestD = Infinity
    copyRects(src).forEach((r) => {
      if (r.left + r.width < 4 || r.left > window.innerWidth - 4) return
      const d = Math.abs((r.left + r.width / 2) - window.innerWidth / 2)
      if (d < bestD) { bestD = d; best = r }
    })
    return best
  }
  // the copy nearest a point: on a wrap the other copy is already sitting where this one was,
  // so following the nearest one hands over silently instead of lurching a whole loop width.
  const nearestRect = (src, cx, cy) => {
    let best = null, bestD = Infinity
    copyRects(src).forEach((r) => {
      const d = Math.hypot((r.left + r.width / 2) - cx, (r.top + r.height / 2) - cy)
      if (d < bestD) { bestD = d; best = r }
    })
    return best
  }
  // OPEN: the clicked painting RISES from its gallery spot into the card while the glass FORMS around it.
  // FLIP is driven off the IMAGE rects, so the painting maps exactly onto its thumbnail (no size jump).
  const openFlip = (el, glass, f) => {
    const img = el.querySelector('img')
    const last = img.getBoundingClientRect()
    const s = last.width ? f.width / last.width : 1
    const dx = (f.left + f.width / 2) - (last.left + last.width / 2)
    const dy = (f.top + f.height / 2) - (last.top + last.height / 2)
    const at = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${s.toFixed(4)})`
    const a1 = el.animate([{ transform: at }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' })
    const a2 = glass && glass.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 440, easing: 'ease', fill: 'backwards' })
    return [a1, a2].filter(Boolean)
  }
  const closeItem = () => {
    if (closing) return
    const el = cardRef.current, glass = glassRef.current
    const src = active && active.src
    const finish = () => { setHiddenSrc(null); setActive(null); setClosing(false) }
    if (!el || !active) { finish(); return }
    setClosing(true)
    if (openAnimRef.current) { openAnimRef.current.forEach((a) => a.cancel()); openAnimRef.current = null }   // hand off cleanly
    // catch-up close: each frame aim the IMAGE at its LIVE thumbnail (the strip keeps moving) and dissolve
    // the glass, so the painting melts back into the gallery exactly where it has drifted to.
    const base = el.querySelector('img').getBoundingClientRect()   // centred image rect (fixed)
    const D = 480, ease = (t) => 1 - Math.pow(1 - t, 3)            // easeOutCubic
    let startT = null
    let aim = liveRect(src) || active.rect            // lock on once, then follow the same copy as it drifts
    const step = (now) => {
      if (startT === null) startT = now
      const t = Math.min(1, (now - startT) / D), e = ease(t)
      aim = nearestRect(src, aim.left + aim.width / 2, aim.top + aim.height / 2) || aim
      const tr = aim
      const s = base.width ? tr.width / base.width : 1
      const dx = (tr.left + tr.width / 2) - (base.left + base.width / 2)
      const dy = (tr.top + tr.height / 2) - (base.top + base.height / 2)
      el.style.transform = `translate(${(dx * e).toFixed(2)}px, ${(dy * e).toFixed(2)}px) scale(${(1 + (s - 1) * e).toFixed(4)})`
      if (glass) glass.style.opacity = (1 - e).toFixed(3)         // glass dissolves as the painting lands
      if (t < 1) requestAnimationFrame(step)
      else finish()
    }
    requestAnimationFrame(step)
  }
  useLayoutEffect(() => {
    if (!active || closing) return
    const el = cardRef.current
    if (el && active.rect) openAnimRef.current = openFlip(el, glassRef.current, active.rect)
  }, [active, closing])
  // Escape closes the lightbox, and the page can't scroll behind it while it's open
  useEffect(() => {
    if (!active) return
    const onKey = (e) => {
      if (e.key === 'Escape') { closeItem(); return }
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
      if (!step) return
      e.preventDefault()
      const i = gallery.findIndex((p) => p.src === active.src)
      if (i < 0) return
      const next = gallery[(i + step + gallery.length) % gallery.length]
      const el = document.querySelector(`.m-item[data-src="${next.src}"]`)
      setHiRes(null)
      setActive({ ...next, rect: el ? el.getBoundingClientRect() : active.rect })
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [active, closing])  // eslint-disable-line react-hooks/exhaustive-deps
  // the card opens with the (cached) gallery variant, then swaps in the full-size one once it has decoded
  useEffect(() => {
    setHiRes(null)
    if (!active) return
    const big = largestSrc(active.src)
    if (!big || big === active.shown) return
    let alive = true
    const im = new Image(); im.src = big
    const done = () => { if (alive) setHiRes(big) }
    if (im.decode) im.decode().then(done, () => {}); else im.onload = done
    return () => { alive = false }
  }, [active])

  return (
    <>
      {active && (
        <div className={`lightbox${closing ? ' closing' : ''}`} onClick={closeItem} role="dialog" aria-modal="true">
          <div className="lb-scrim" aria-hidden="true" />
          <button className="lightbox-close" aria-label="Close" onClick={closeItem}>&times;</button>
          <figure className="lightbox-fig" onClick={(e) => e.stopPropagation()}>
            <div className="lb-card" ref={cardRef}>
              <div className="lb-glass" ref={glassRef} aria-hidden="true">
                <div className="lb-glass-effect" />
                <div className="lb-glass-tint" />
                <div className="lb-glass-shine" />
              </div>
              <img src={hiRes || active.shown} alt={active.title} width={DIMS[active.src].w} height={DIMS[active.src].h}
                style={{ '--ar': DIMS[active.src].w / DIMS[active.src].h, background: active.bg }} decoding="async" />
            </div>
            <figcaption className="lb-cap">
              <span className="lb-title">{active.title}</span>
              {(active.artist || active.year) && <span className="lb-artist">{[active.artist, active.year].filter(Boolean).join(' · ')}</span>}
            </figcaption>
          </figure>
        </div>
      )}
      {/* SVG displacement map that refracts whatever is behind the bar (the paintings) — iOS liquid glass */}
      <svg className="lg-filter" aria-hidden="true" focusable="false">
        <filter id="liquid-glass" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="2" seed="17" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.6" result="smooth" />
          <feDisplacementMap in="SourceGraphic" in2="smooth" scale="46" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* gentler version for small floating controls (buttons) so the refraction stays subtle */}
        <filter id="liquid-glass-soft" x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="11" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.2" result="smooth" />
          <feDisplacementMap in="SourceGraphic" in2="smooth" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* strong version for the lightbox card: pronounced diffraction / refraction */}
        <filter id="liquid-glass-strong" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.013" numOctaves="3" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="1.4" result="smooth" />
          <feDisplacementMap in="SourceGraphic" in2="smooth" scale="72" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="lg-effect" aria-hidden="true" />
        <div className="lg-tint" aria-hidden="true" />
        <div className="lg-shine" aria-hidden="true" />
        <div className="nav-inner">
          <a href="#top" className="nav-left">Shanmu Raja</a>
          <nav className="nav-right">
            {NAVLINKS.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
        </div>
      </header>

      <main id="top" className="wrap">
        {/* LANDING GALLERY — full-viewport horizontal montage, Cargo-style */}
        <section className="gallery" aria-label="Selected paintings">
          <div className={`marquee-track${fading ? ' fading' : ''}`} ref={trackRef}>
            {loop.map((p, i) => {
              const copy = i >= gallery.length          // 2nd copy makes the loop seamless; it is decorative
              return (
                <figure
                  className="m-item" key={`${p.src}:${copy ? 'b' : 'a'}`} data-src={p.src}
                  aria-hidden={copy || undefined} role={copy ? undefined : 'button'} tabIndex={copy ? -1 : 0}
                  aria-label={copy ? undefined : ([p.title, p.artist].filter(Boolean).join(', ') || 'Painting')}
                  style={{ width: `${p.w}vh`, height: `${p.h}vh`, marginRight: `${p.gap}vw`, transform: `translateY(${p.y}vh)`, background: p.bg, visibility: hiddenSrc === p.src ? 'hidden' : '' }}
                  onClick={(e) => openItem(p, e)}
                  onKeyDown={(e) => { if (!copy && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openItem(p, e) } }}
                >
                  <img src={p.url} alt={p.title} loading="eager" decoding="async"
                    onError={(e) => e.currentTarget.closest('figure').classList.add('broken')} />
                </figure>
              )
            })}
          </div>
          {hint !== 'none' && (
            <div className={`gallery-hint${hint === 'in' ? ' gh-on' : ''}`} role="status" aria-live="polite">Explore more paintings</div>
          )}
          <button className="gallery-redo" onClick={redo} aria-label="Show another gallery">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 11a8 8 0 1 0-.6 4M20 4v5h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </section>

        {/* STORIES */}
        <section className="section" id="stories">
          <div className="section-head rv"><h2 className="section-title">Stories</h2><p className="section-lead">Fiction &amp; essays on medicine and humanity.</p></div>
          <div className="contents">
            {STORIES.map((s, i) => {
              const Tag = s.href ? 'a' : 'div'   // unlinked pieces (unpublished / in submission) are plain rows
              return (
                <Tag className="story rv" key={s.title} {...(s.href ? { href: s.href, target: '_blank', rel: 'noreferrer' } : {})}>
                  <span className="st-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="st-body">
                    <div className="st-kicker">{s.kind}</div>
                    <div className="st-head">
                      <span className="st-title">{s.title}</span>
                      {s.latest && (
                        <span className="st-new">
                          <i className="st-new-dot" aria-hidden="true" />
                          Just Published
                        </span>
                      )}
                      <span className="st-leader" aria-hidden="true" />
                      <span className="st-venue">{s.venue}</span>
                    </div>
                    {s.excerpt && (
                      <div className="st-excerpt-wrap"><p className="st-excerpt">{s.excerpt}</p></div>
                    )}
                  </div>
                </Tag>
              )
            })}
          </div>
          <div className="archive-line">Full archive on <a href="https://shanmuraja.medium.com/" target="_blank" rel="noreferrer">Medium</a> · <a href="https://shanmuraja.substack.com/" target="_blank" rel="noreferrer">Substack</a></div>
        </section>

        <div className="prairie" />

        {/* PAPERS */}
        <section className="section" id="papers">
          <div className="section-head rv"><h2 className="section-title">Papers</h2><p className="section-lead">Peer-reviewed and working papers.</p></div>
          <div className="index-list">
            {PAPERS.map((p, i) => {
              const Tag = p.href ? 'a' : 'div'
              return (
                <Tag className="row rv" key={p.title} {...(p.href ? { href: p.href, target: '_blank', rel: 'noreferrer' } : { style: { cursor: 'default' } })}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="title">{p.title}</div>
                    <div className="excerpt"><em>{p.sub}</em></div>
                    <div className="rkick" style={{ marginTop: '0.5rem', marginBottom: 0 }}>{p.authors}</div>
                    {p.href && <span className="go">Read PDF <span className="arrow">→</span></span>}
                  </div>
                  <span className="meta">{p.badge}</span>
                </Tag>
              )
            })}
          </div>
        </section>

        <div className="prairie" />

        {/* AWARDS */}
        <section className="section" id="awards">
          <div className="section-head rv"><h2 className="section-title">Awards</h2><p className="section-lead">A small archive of luck.</p></div>
          <div className="awards-list">{AWARDS.map((a) => <div className="award rv" key={a.rn}><span className="rn">{a.rn}</span><div><h4>{a.title}</h4><p>{a.desc}</p></div></div>)}</div>
        </section>

        <div className="prairie" />

        {/* FEATURES — illustrated deep-dives with the real figures */}
        <section className="section" id="features">
          <div className="section-head rv"><h2 className="section-title">Deep dives</h2></div>

          <article className="feature-card rv">
            <div className="feature-tag"><span className="dot" /><span>Economics</span></div>
            <h3 className="feature-title">Healthcare’s AI Trap</h3>
            <p className="feature-sub">When automation skims the cream and starves the pipeline at once.</p>
            <a className="deep-cta" href="/papers/ai-trap">
              <span className="deep-cta-t">Read the white paper here</span>
              <span className="deep-cta-arrow">→</span>
            </a>
            <p className="feature-summary">Routine cases do double duty: under a flat fee they cross-subsidize complex care, and they are the cases on which junior clinicians become senior. AI automates them first, creaming the easy cases. As <em>θ</em> climbs from the easy cases toward the hard ones, the leftover pool’s profit crosses zero at the unraveling threshold <em>θ̄ ≈ 0.32</em>, strictly before the social break-even <em>c† = 0.50</em>. The entrant over-skims, dumping the rescue cost of the abandoned tail onto everyone else.</p>
            <AITrapFig2 />
          </article>

          <article className="thesis-card rv">
            <div className="thesis-eyebrow">UCSF · Health Policy & Law · April 2026 · Master’s Thesis</div>
            <h3 className="thesis-title">Mapping Medi-Cal Deserts in California</h3>
            <p className="thesis-desc">Provider shortages, preventable hospitalizations, and the limits of workforce policy in Medi-Cal: an empirical study of California’s 58 counties, with five causal identification strategies and a portfolio policy response.</p>
            <a className="deep-cta" href="/papers/medi-cal-deserts">
              <span className="deep-cta-t">Read the white paper here</span>
              <span className="deep-cta-arrow">→</span>
            </a>
            <div className="stat-grid">
              <div className="stat"><div className="n">+37%</div><div className="l">Preventable hospitalization gap, desert vs. non-desert counties</div></div>
              <div className="stat"><div className="n">$82M</div><div className="l">Annual excess Medi-Cal cost attributable to the access deficit</div></div>
              <div className="stat"><div className="n">11</div><div className="l">Desert counties, stable across fifteen years (2010–2024)</div></div>
            </div>
            <ThesisLines />
            <p className="fig-caption">The post-2017 narrowing is concentrated in the Prop 56 payment-increase window: 81.8% of the eventual gap closure occurs after 2016.</p>
            <div className="signature">Shanmugesh Raja · UCSF Health Policy & Law · MMXXVI</div>
          </article>
        </section>

        <div className="prairie" />

        {/* BIO */}
        <section className="section" id="bio">
          <div className="about-grid rv">
            <div className="plate"><figure><img src="/headshot.jpg" alt="Shanmu Raja" /></figure></div>
            <div className="about-body">
              <p className="lead">I’m a writer who works in medicine, or a medical person who writes. The order keeps changing.</p>
              <p>I write fiction, essays, and the occasional poem.</p>
              <p>I have a master’s from UCSF in healthcare economics and health policy. My thesis looked at access deserts in Medi-Cal. My research lives in clinical medicine and surgery.</p>
              <p>My fiction has been recognized by <em>The New Yorker</em>, the Paul Kalanithi Writing Competition, and the Massachusetts Undergraduate Poetry Festival. My research has appeared in <em>The Journal of Thoracic and Cardiovascular Surgery</em> and <em>Journal of Vascular Surgery</em>.</p>
              <p>Off the page: squash, piano, a steady diet of cinema.</p>
            </div>
          </div>
          <div style={{ marginTop: '3rem' }}>
            <a className="contact-mail" href="mailto:shanmur@uclawsf.edu">shanmur@uclawsf.edu</a>
            <div className="social-grid">{SOCIALS.map(([label, icon, href]) => (
              <a className="social" href={href} target="_blank" rel="noreferrer" key={label} aria-label={label}>
                <span className="social-box"><svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[icon]}</svg></span>
                <span className="social-label">{label}</span>
              </a>
            ))}</div>
          </div>
        </section>

        <div className="prairie" />
        <footer className="colophon">
          <div className="lg-effect" aria-hidden="true" />
          <div className="lg-tint" aria-hidden="true" />
          <div className="lg-shine" aria-hidden="true" />
          <div className="colo-inner">
            <a className="colo-contact" href="#bio">Contact</a>
            <span className="colo-social">{SOCIALS.map(([label, icon, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}><svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[icon]}</svg></a>
            ))}</span>
          </div>
        </footer>
      </main>
    </>
  )
}
