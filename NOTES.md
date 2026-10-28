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

## Iteration 8 — readability, nav, white papers, Lora

- **Type:** Lora (Cyreal, SIL OFL 1.1, self-hosted variable woff2 in `public/fonts`, licence `lora-OFL.txt`) for all titles, body, pull quotes, nav, paper pages, About and gallery canvas titles. Titles 600–700, body 400 at ~1.6–1.65. Bodoni Moda and Newsreader removed. Archivo kept only for tiny labels (meta keys, kickers, small counts).
- **Comments:** About lead/body set in Lora at larger size; Young Boy Blues line/tease and Burnt Red Tongues quote in Lora italic 400 at 1.5 leading; Burnt Red Tongues shows "Shortlisted by The New Yorker" via HONOR.
- **Nav:** one top bar (Prose / Publications / Luck switch wheel sections, divider, Paintings, About; Contact quiet). Pen ring marks the active item; counts as superscripts. The bottom-left section list was removed as redundant. Socials 24px with hover labels, bottom-right and on About. Home caption moved below the bar.
- **Publications:** full white-paper pages (TOC scroll-spy, progress, figures, tables, refs) for the four medRxiv GLP-1 preprints extracted from their PDFs; AI Trap and Medi-Cal keep their hand-built pages embedded. JTCVS/JVS items and WIP get partial pages (citation/DOI only) — need PDFs or abstracts+figures from Shanmu.
