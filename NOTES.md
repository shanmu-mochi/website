# Notes

## Design reference
Primary template this site is modeled on:

- https://cargo.site/templates/preview/2826580

Other Cargo references used while building:

- https://0994931-a.cargo.site/
- https://0994931-e.cargo.site/
- Masthead style ("Writer's Retreat" heavy-grotesque headline + thin nav)

## Direction
Cargo-style art portfolio — **white background, strictly black & white**, heavy grotesque
display type (Archivo Black; Cargo uses ABC Diatype / Monument Grotesk), a minimal
two-corner nav, and an asymmetric **moving (parallax) painting gallery** whose images
bleed off the screen edges with generous whitespace.

Scroll order: **gallery → "Shanmu Raja" masthead → Stories → Papers → Awards → Features → Bio.**

## Content / assets
- Copy transferred from the live site (shanmuraja.com).
- Gallery uses a curated, single-aesthetic painting set from `~/Desktop/Paintings`
  (Wyeth / Sargent etc.), resized into `public/paintings/`.
- The "Features" figures recreate the actual graphs from `public/papers/healthcares-ai-trap.pdf`
  (Figure 1 cost-curve, Figure 2 residual profit) and the Medi-Cal thesis figure.

## Paintings pipeline (2026-09)
- **Sources:** `paintings-src/*.jpg` (full-size originals, tracked). Add a painting = drop a JPG here, add a
  `META` entry (title/artist/year) and put the filename in `POOL` in `src/App.jsx`.
- **Build:** `npm run paintings` (also runs as `prebuild`) uses `sharp` to write
  `public/paintings/<name>-{480,800,1200,1800}.webp` (never upscaled; largest = source width, max 1800),
  and regenerates `src/paintingsData.js` (dims + widths) and `src/colorsData.js` (dominant palette).
  Incremental: only missing/stale variants are re-encoded; orphans are deleted. `public/paintings/` is gitignored.
- **Runtime:** each gallery slot has a fixed width/height (vh) and a dominant-colour placeholder; the app picks
  the smallest variant covering the drawn size x min(devicePixelRatio, 1.6). The lightbox opens with the cached
  gallery variant and swaps in the largest once decoded. `public/_headers` gives `/paintings/*` and `/assets/*`
  a one-year immutable cache on Cloudflare.
- **Deploy:** `npm run build`, then rsync `dist/` into `public/` of the `shanmu-mochi/shanmuraja-site` repo
  (remote `cf`) and push `main`; Cloudflare Workers Builds deploys it.
