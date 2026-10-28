# Redesign v2 — "The Reading Room" (branch `redesign-v2`, experiment)

- **Concept.** The page opens on type, not a carousel: a Paris Review–style contents page (serif title, byline, the real first sentence in grey, hairline rules, lots of white). Hovering a title turns the whole viewport into that story's painting, A24-style: full-bleed plate, tinted with the painting's own dominant colour (colorsData), type inverts to white, and a titanium iPhone carrying the real Substack/Medium page slides in at the right.
- **One click.** Every published row *is* the link (new tab). Hover/focus = instant preview, click = read. No selected state, no second step. The phone is also a link to the same story and can be wheel-scrolled; it drifts down the page on its own.
- **Keyboard.** Tab/↑/↓ walk the rows (focus = preview), Enter opens, Esc clears. A compact A24-style numeric index (01–15) sits at the right edge; hovering a number previews, clicking reads.
- **Touch / ≤720px.** No phone, no wash. Tap a row → its painting + first sentence open inline with a clearly labelled "Read on Substack/Medium ↗" link.
- **Papers.** A shelf of type-only chapbooks (no figures). Hover lifts a chapbook and fills the reading slip beside the shelf (title, kind, venue, abstract line); one click opens the paper.
- **Paintings.** The old moving carousel lives on, unchanged in behaviour, in its own later "Paintings" section.
- **Unchanged.** Nav, Awards, Deep dives, About, footer; reduced motion turns off the wash zoom, slide-ins and auto-drift.

## Iteration 2 — "The Wheel" (A24-style stories browser)
- Stories is now a full-viewport 3D wheel of all 15 story paintings (ref a24.raviklaassens.com). Centered plate is large, wears the hand-drawn pencil ring and a "Read ↗" badge; neighbours tilt back on the wheel.
- Turn it with scroll (stage-captured, releases to page at first/last story), drag (260px/step, snaps), ← → keys (when stage ≥45% visible), the ← → buttons, or hovering a neighbour for 320ms. Clicking a non-centred painting rotates it to centre; ONE click on the centred painting (or title / "Read on {venue} ↗") opens the story in a new tab.
- Page tint eases to the centred painting's colour. Hairline meta table (No., kind, venue, date, painting credit) top-left; monochrome titanium phone preview at right; big uppercase serif title + real first sentence beneath.
- Compact Paris-Review index under the wheel: hover/focus rotates the wheel, click opens.
- ≤720px / coarse pointer: swipeable scroll-snap card carousel with caption + Read button, no phone.
- Paintings keeps the original marquee carousel (tightened to 78svh, no extra gap); Papers chapbooks unchanged; masthead bio line kept with the wheel peeking in the first view; content padded so the fixed footer bar no longer covers it.
- prefers-reduced-motion: wheel jumps instantly, ring draw and tint transition disabled.

## Iteration 3 — "Quiet" (subtract)
Feedback: "too busy". Kept the wheel and the phone; removed almost everything else.
- Removed from Stories: info table (kind/venue/published/painting), pencil ring, ← → buttons, scroll/drag hint, "Read on …" button row, uppercase giant title, "New"/venue/Unpublished tags in the index, masthead kicker, mobile number/byline/credit/swipe hint.
- At rest: bio line → wheel → one caption (sentence-case serif title, gray "venue · date", one gray line of first sentence).
- Hover centred painting: small "Read ↗" chip, italic painting credit beneath it, and the monochrome phone slides in at right. Leave → all gone.
- Motion slower (lerp .075, 420ms scroll throttle), wider spacing, neighbours scale down and fade (≈.88/.5/.18), 3 each side, no tilt jitter. Tint halved (6%).
- Index: quiet 2-column number + title list.
- Rest of page: no hairline dividers between sections, no roman numerals on awards, no social labels, no feature tag pill, no "In progress" label/kind meta, Papers slip reduced to title + subtitle + authors, chapbooks without staples/hatching/kind/No., Paintings lead without the "drag" hint, no "Refresh carousel" tip.
- Mobile: painting, title, first sentence, Read ↗.

## Iteration 4: "A24 for my pieces"

- The site is now the browser. `src/main.jsx` renders `src/Browser.jsx`. `App.jsx` (iterations 1–3) is kept intact but unused.
- Hash routes, which work under `python3 -m http.server`: `#/prose`, `#/publications`, `#/luck`, `#/<cat>/<slug>`, `#/about`, `#/paintings`.
- The 3D wheel engine from v3 is generalised. The page tint follows the centred piece. A quiet switcher at the bottom left reads Prose / Publications / Luck, and the social icons sit at the bottom right.
- Piece pages are white A24 film pages: a huge uppercase title, hairline meta rows, a double-ruled CTA, the painting with its credit, and the first sentence as a pull quote. Prev/next links and Esc lead back. A View Transition plays when opening a page, except under reduced motion.
- Data lives in `src/pieces.js`, copied from App.jsx: Prose has 15 pieces, Publications 13 (11 papers and 2 white papers), and Luck 4 (the awards).
- `src/pieceNotes.js` holds the "On the painting" notes. **All of them are empty.** Shanmu has to write them.
- The phone is gone from the whole site.
- Screenshots are in /workspace/redesign-shots-v4/.

## Feedback overlay (preview builds only)

- `npm run build:preview` builds with `VITE_FEEDBACK=1` and copies `scripts/serve.py` into `dist/`. A plain `npm run build` has none of it: the `__FEEDBACK__` define folds to `false`, so the dynamic import is dropped. You can check with `grep -r GROK_FEEDBACK dist`, which should find nothing.
- Shanmu unzips the preview, runs `python3 serve.py`, and opens http://localhost:8000. To change the port, pass it as an argument: `python3 serve.py 8001`.
- To comment:
  - Press **C** (or click the "Comment · C" pill at top centre; on phones it sits low in the centre).
  - Click anything to drop a numbered pin, type, then press Enter to save. Shift+Enter adds a new line; Esc cancels.
  - **L** opens the list, where comments can be edited, resolved or deleted. The list also has a general note, Copy feedback for Grok, Download .md and Clear resolved.
- Comments live in localStorage. They also auto-POST to `/__feedback`, and serve.py writes `feedback.json` and `feedback.md` next to itself. If the browser has no comments yet, the page reloads them from the server with a GET.
- Reading the block: each line is `N. [route · category · piece (index/total) · viewport] "text" — on: <css path> aria/text, at x% y%`.
  - The route and the piece say which page or wheel item the comment is about.
  - The css path names the element: `b-*` is the browser, `pg-*` the piece and About pages, `cv-*` the type covers, `t-*` the phone track.
  - x% and y% are positions in the viewport.


## Iteration 6 — the real A24 motion, with the paintings
- Home is now a three.js gallery (src/gallery/Gallery.js) using the A24 browser's geometry, follow rates, lean/bank, discGlide easing, spring snap, intro (rolling counter → rise → fan), click-through flight and inbound return. Paintings are the plates; publications are white-paper sheets. Space turns a plate over to its credit.
- Chrome: top-left Bodoni title + hairline meta table, top-centre wordmark/Paintings/About, bottom-centre first line, bottom-left Prose/Publications/Luck with pen-scribble hover, counter + socials bottom-right.
- Piece pages: white paper, A24 film-page layout (centred title, drawn rules, crosshair marks, meta table, double-rule CTA, painting rising in).
- Fonts: Bodoni Moda (OFL, self-hosted) stands in for PP Eiko.
- Study + spec: /workspace/NOTES-A24-STUDY.md. Side-by-side sheets: /workspace/redesign-shots-v6/.

## Iteration 7

Feedback: angle a tad steep; each section should have its own presentation; flipped poster should travel
seamlessly into its spot on the page; fix details, smoothness and nav.

- **Angle.** `TILT` constant at the top of `src/gallery/Gallery.js`: −30° → −19° (both axes for prose).
- **Per-section presentation** (one engine, `SECTIONS` table):
  - Prose: painting plates on A24's diagonal arc, full tilt.
  - Publications: white-paper chapbooks (thicker box, spine face, seeded paper grain, type-only cover from
    real kind/title/venue); flatter, straighter shelf (tilt ×0.55/×0.7); cool background. Verso = abstract line,
    authors, venue, DOI.
  - Luck: square award cards (award name large, double rule frame), vertical drum (vertical drag turns it);
    warm background. Verso = citation line + meta incl. painting credit.
  - Switching: current row falls back (`exit`), new objects fan in, background and fog ease; the home stays
    mounted so nothing cuts.
- **Shared element.** `openFace()` turns the front object square to the camera (keeping the visible side), so its
  projection is an exact rect. A DOM clone (`.fly`, front+back faces, same image/canvas pixels) replaces it in the
  same frame, then FLIP-flies to the measured `.pg-art` rect while the page draws in (rotating from verso to front
  if flipped). Page image is revealed only after it decodes, then the clone is removed. Back (link, Esc, browser
  back) reverses it: clone lifts off the page art, page fades, gallery `prepareReturn()` gives the face-on rect,
  clone lands, `land()` turns the object back into the row. Prev/next = slide + crossfade. Direct URL = fade/reveal.
- **Nav.** Single navigation queue (`NAV`): one transition at a time, the latest request runs after; section switches
  cancel each other (token) instead of queueing; Esc during a transition is queued.
- Details: Bodoni kerning/optical sizing/word spacing, mark tracking, piece page is now a two-column body
  (art left within the viewport, meta/CTA/quote right), comment pill moved to bottom right, mobile counter + 16px
  section labels + larger meta rows, clickable counter, grab cursor.

## Iteration 10: socials move to the bottom-left

- The Medium, Substack, Instagram and LinkedIn icons leave the bottom-right corner, where they sat under the counter.
  They now live in their own `.h-sfoot` at the bottom-left of the gallery view, at 24px, dark, and with hover labels.
- **Desktop:** the icons sit on the left column's edge, on the caption's baseline row, clear of the centred quote and
  the details table. On Luck, the left-column quote moves up to bottom 80px so it stays above them.
- **Phone (≤760px):** one bottom row, icons on the left and the counter on the right, with `env(safe-area-inset-*)`
  padding via `max()`. Note that `viewport-fit=cover` is not set, so the insets read as 0 and the minimum padding applies.
- They fade in with the counter, on the same `foot` flag, so the intro brings them in with the rest of the UI.
  The About page icons are unchanged.

## Iteration 10b: the hint moves out of the nav row

- "Scroll, drag, or use the arrow keys" used to sit at top-right, on top of Paintings, About and Contact at 1280. It now sits bottom-right, just above the counter.
- It appears only once the intro is done (phase ready), fades in and out over about 6s, and disappears on the first wheel, pointer, key or touch.
- It is still hidden on phones and touch devices, so 390 is unaffected.

## Iteration 11: no Contact button

- The top bar Contact mailto link is gone at every viewport. The bar is now the name plus links: Prose / Publications / Luck | Paintings / About.
- Desktop: the links sit flush right on one row. Phone: the links share the second row evenly.
- The email stays reachable elsewhere and is untouched: the About page (ab-links), the papers index, and the legacy App.jsx contact section.

## Iteration 12

- **Scroll model:** clicking opens a piece, and scrolling browses only within the current section. At the end of a section the gallery resists, then shows a "Next: X →" or "← Back to: X" caption (`.h-edge`). You can click the caption, or push past it once more (after 550 ms) to move to the next section. Order: Selected → Prose → Publications → Luck. Reduced motion skips the nudge.
- **Home:** a "Selected" carousel of 8 pieces driven by `src/selected.js`. The wordmark returns home (`#/`) and the intro plays on home. A piece opened from home goes back to home.
- **Header:** the name is centered. Prose / Publications / Luck sit on the left and Paintings / About on the right, with 28px gutters on both sides at 1440 and 1280. At 390 the name is on top and the links are on a row below. The pen ring is kept.
- **Related links:** The New Yorker ↔ Burnt Red Tongues and ACPM ↔ Branded Wegovy vs Compounded Semaglutide, in both directions.
- **Card backs** (no title on the back; fields that can't be sourced are left out):
  - prose: kind, opening line and painting note.
  - publications: main finding from the abstract (`src/data/findings.js`), N, venue, DOI and PDF.
  - luck: event, related piece and painting.
- **Hover ring:** on non-prose cards the ring is about 0.34 of the card width, follows the pointer and is clamped inside the card.
- **QA:** screenshots and contact sheets are in `/workspace/redesign-shots-v12/`. No page errors. Lint is at 9.

## Iteration 13

- Renamed the "Paintings" nav item and the page heading to "ART THAT I LOVE" (uppercase, set slightly smaller and tracked so it fits the header). The route stays `#/paintings`. The "Painting" credit label on piece pages is unchanged. On mobile the header gaps and padding are tightened so it fits at 390. Screenshots are in `/workspace/redesign-shots-v13/`.

## Iteration 14 — navigation model, dedupe, Flip button [pt47u]
- Removed pen hover ring on gallery cards (nav active ring kept). Removed '+' crop marks (.pg-x).
- Piece pages: byline hidden when every part repeats a meta value; pg-line hidden when equal to the quote. Paper kicker shows kind only when a venue row exists.
- Navigation: sideways (deltaX, shift+wheel, ←/→, horizontal drag, swipe) browses pieces; vertical (wheel, ↑/↓/PgUp/PgDn, vertical drag/swipe) changes section in nav order home → prose → publications → luck → ART THAT I LOVE (last; a normal scrolling page). Each gesture locks to its dominant axis; one section change per gesture, 1100 ms cooldown, momentum-tail heuristic (220 ms gesture gap, decaying tail within 2.6 s stays spent).
- Persistent clickable "Scroll down: X ↓" caption ("Swipe up" on touch); first-visit hint "Swipe sideways to browse, scroll down for the next section"; small side arrows (hidden on mobile).
- Luck pose is now a sideways drum so all sections browse horizontally.
- Flip button (icon + "Flip", Lora, hairline box, aria-label) bottom right in every section, before the counter; Space still flips; visible on mobile; rect-checked for no overlap with hint/counter/caption.
- Verified with simulated wheel/drag/key/touch events (a24-study/s14.cjs); screenshots + contact sheets in /workspace/redesign-shots-v14/.

## Iteration 15 — fill out all papers
- New src/data/abstracts.js: verbatim published abstracts (structured: Objective/Methods/Results/Conclusions), keywords, full titles, citations, N and a main finding copied from each abstract, plus a front-of-card excerpt for every paper. Sources:
  - Helical classification: PubMed PMID 42305171 + Crossref. Venue corrected to JTCVS Structural and Endovascular 8:100069 (Dec 2025), not "The Journal of Thoracic and Cardiovascular Surgery".
  - PETTICOAT geometric analysis: J Vasc Surg 79(6):e149–e150 (poster IP057), abstract from the journal article page; not in PubMed.
  - Longitudinal mapping: J Vasc Surg 77(4 Suppl):64S–65S, abstract from the journal/doi page; author list corrected from Crossref/ORCID to Bondesson, Raja, Suh, Dake, Lee, Cheng. Public text breaks off at the end of the conclusions; shown with an ellipsis and a note.
  - TEVAR + PETTICOAT: J Vasc Surg Cases Innov Tech 12(5):102363 (Oct 2026), PubMed PMID 42494499.
  - Preprints / white papers: excerpt is the first abstract sentence from the repo PDFs.
- Card fronts now carry kicker, title, authors and an italic abstract excerpt. Backs: main finding, N, full citation, DOI, PubMed ID (or "In preparation").
- Paper pages for the journal papers: structured abstract, key points (the abstract's Results sentences), citation with DOI/PMID links, a source note. Works in progress get an honest "In preparation" page; the Wegovy study links its public "article in process" listing (J Obes Metab Dis, JScholar).
- Layout fix: the home caption line now sits above the "Scroll down" caption and the first-visit hint (they overlapped in v14); meta values stay on one line.
- Screenshots: /workspace/redesign-shots-v15/ ({W}-{k}-front/back/page.png, sheets).

## Iteration 16: three draft papers as white-paper pages
- New working papers (kind "Working paper", venue "Draft"), placed after the white papers, newest first: Third-Party Cardiometabolic Outcomes (21 Oct 2026, Mochi Health), Scheduled Jumps (19 Oct 2026), The Doctor Will See You Now (18 Oct 2026, theory paper). Publications count 13 → 16 (counts are computed).
- `scripts/build-texpapers.py` converts each `main.tex` with pandoc (citeproc + references.bib), prerenders math with KaTeX at build time (`scripts/katex-batch.cjs`), numbers equations, tables and figures from the paper's labels, and writes `src/data/texDocs/<slug>.json`. It copies only `main.pdf`, the two FDA supplements (worked_problem.pdf, derivations.pdf) and figures as webp into `public/papers/<slug>/`. It does not copy .env, notebooks, raw data, aux files, or the fda-wedge or pearl-benchmark folders.
- `src/components/paper/TexBody.jsx` (lazy chunk with KaTeX CSS) renders: status line, abstract, Summary (abstract sentences), headline-findings table (Finding / Members (N) / What it rests on), pull-quote, 01–04 method steps (cwm only), "What this does not show" box, the author's title footnote, numbered sections, notes, references, sticky contents and the progress bar.
- `scripts/texpapers_frame.py` holds that page furniture. The build checks every sentence in it against the paper text (verbatim) and every number in a headline row. AI paper: no headline table (theory paper, no measured results).
- Native SVG charts from the papers' own data files: Chart A (q̂ for the 8 decisions, from data/live_implied_q.json, values checked against Table 1) and Chart B (paired changes, from data/table_full_population.csv, drawn as percent of the before value). Every figure and table carries a Source line.
- Slop audit of the text we wrote: AI Trap card sub-line replaced with an abstract sentence; seven section sub-lines on AiTrap/MediCal rewritten plainly. Authors' abstracts not touched.
- The wheel meta for new papers is two rows (Kind, Authors · affiliation) so it clears the card stack. The duplicate PDF link is removed.
- QA: /workspace/redesign-shots-v16/ (1440, 1280, 390; card front/back, pages, sheet-*.png, chart crops). No page errors, no horizontal overflow. Lint is at 9. dist 96,708,924 → 100,231,138 bytes (+3.52 MB, mostly the PDFs, webp figures and texDocs JSON).

## Iteration 17

### Part 1: slower side scroll
Gallery.js CFG: dragSens .95->.6, dragMaxV .5->.32, glideTau .55->.36, glideMaxV .2->.125, mPower .8->.5, wheelPx 420->650, touchSpan 1.8->1.15, snapDuration .46->.62; key step duration cap .6->.82 (kick 4->2.5), click glide .45+.11d->.62+.15d (cap 1.4s), wheel-notch kick 2.5->1.6. Card spin-drag keeps its old feel.

### Part 2: one flowing page
- Home is now a single natively scrolling page: intro, Prose, Publications, Luck carousels, then ART THAT I LOVE. Each band has a heading, ~20vh of space above and a hairline.
- Each carousel has its own WebGL renderer (`opts.own`) and band mode (`opts.band`): a vertical wheel always goes to the page; only deltaX, shift+wheel or a horizontal drag moves the carousel. A vertical touch is left to the browser (`touch-action: pan-y`, and pointercancel never opens a piece).
- Bands pause their renderer when offscreen (IntersectionObserver). Nav glides to the band; the pen ring follows the band in view.
- Back from a piece restores the band and the exact scroll position.
