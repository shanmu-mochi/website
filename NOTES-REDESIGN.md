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

## Iteration 18

Built on iteration 16 (A24 system kept: tilted plates, expanded pages, white papers, pen circle, intro, Flip, header).

- Scroll: the stage follows the wheel or drag (`--pull`), then commits with a directional carry (out up/down, in from the other side) into the existing exit/fan. A short gesture eases back, and the edges rubber-band. Nav clicks and Back teleport (blur out, rise in) straight to the target. A right-edge section indicator plus the "Scroll down: next" cue. ART THAT I LOVE scrolls back up to Deep Dives (wheel or keys at the top, pull down on touch, or the "↑ Scroll up" button).
- Scroll-up root cause: Gallery's momentum-tail check treated any new gesture within 2.6s of a section change as the tail of the old one. It ignored direction, and it ignored the pause before the gesture. So an up swipe right after a down swipe, or a second notch of the same strength, was swallowed. Paintings also had no way back up. Fix: a tail now has to keep the same sign and follow a pause under 650ms. A switch that is still settling holds the gesture for up to 1.6s instead of dropping it. Reversing direction has a shorter cooldown (600ms).
- Home: Chekhov epigraph below the centred name. The first line is written in Pinyon Script, and the second line and attribution fade in.
- Deep Dives (`#/deep`): the White paper entries from the publications data, Healthcare's AI Trap and Mapping Medi-Cal Deserts.
- Hover: a story's real first line is written out by hand under its plate. The jittery pen circle redraws continuously. Nav items get a jittery pen underline.
- QA: /tmp/q.cjs (Puppeteer); screenshots in /workspace/redesign-shots-v18.

## Iteration 19 — one A24 row, with jumps

- **One row.** Home is a single continuous A24 diagonal of every piece, in order: Prose (15), Publications (16), Deep Dives (2), Luck (4), ART THAT I LOVE (125 paintings) = 162 plates. Staged at A24's -30°/-30°. There are no vertical section pages, no stage-follow, no scroll cue.
- **One axis.** Wheel (up/down/left/right), trackpad, arrow keys (Right/Down/PageDown = next, Left/Up/PageUp = previous), and mouse drag (horizontal or vertical) all travel along the row with the existing A24 inertia/spring and CustomEase 0.32,0.72,0,1. A wheel over the chrome (title block, nav, footer) also moves the row. Dragging the front plate moves the row; it no longer spins the plate (Flip/Space still turns it).
- **Jumps.** The nav (Prose · Publications · Deep Dives · Luck — SHANMU RAJA — Index · ART THAT I LOVE · About) and the new minimal **Index** dropdown (sections with counts) jump to a section start with a quick cut: the row falls back, the position is set, the row fans back in. The active nav item (pen underline) follows the piece in front, and the hash is updated with replaceState (#/prose, #/luck, …). A nav click on a page (About, a piece) opens the row at that section start.
- **Title block.** Top-left: uppercase Lora at 28px over a hairline table with tiny tracked labels and right-aligned values, using real data only. At ≤1380px it drops under the bar so it never meets the nav; at 390 it sits under the two-line mobile bar.
- **Removed:** the right-side section indicator, the home Chekhov epigraph, the scroll-down cue, the swipe hint, the side arrows, and the Paintings "up" button. The bottom-centre line is the piece's real line only.
- **Chekhov** now lives at the top of About: the first line is handwritten (Pinyon Script, animated), then line 2 and the attribution.
- **Background** is plain #F2F2F2 everywhere on the row.
- **Performance:** plate textures load lazily, when a plate comes within the render radius.
- **QA** (Puppeteer, 1440): all of these PASS — wheel ±x/±y, trackpad bursts both ways, 6 rapid notches = +6, keys, drag both ways, nav jumps ×4, Index jumps, wheeling up from Paintings into Luck, open then Back restoring the index, About → Deep Dives, and wheeling all the way back to piece 1. No page errors. 390 scrollWidth = 390. Lint 9 (5/4).
- **Not tested:** touch or swipe (synthetic touch doesn't work headless).
- **Remaining differences from A24:** plates are flat rectangles, not discs; the first screen shows about 2 plates because Prose 1 has nothing to its left; the bottom slot is one line, not two review quotes; the opening is the iteration-18 name flight, re-used.

## Iteration 20

- Home: one section at a time with a vertical section transition; wheel/drag/keys past the end of a section move to the next one, and momentum tails are swallowed. The order is Prose → Publications → Deep Dives → Luck. At the end of Luck the scroll stops with a nudge and shows an "ART THAT I LOVE →" link instead of jumping to another kind of page.
- ART moved to the nav (#/art). The Index block and the About BIO lead line are gone (the other bio paragraphs are kept). The first line is always shown, including on mobile.
- Handwriting font: Caveat 500 replaces Pinyon Script (OFL, self-hosted). The pen ring and underline were redrawn as variable-width filled strokes with a mask reveal.
- Story page (A24 film-page style): title, then the real first line written in Caveat below it. The painting opens out to the full width as you scroll; reduced motion keeps it static. Then the painting and its credit, the details (kind/venue/published), a double-ruled "Read on …" link, and previous/next.
- The opening paragraph and pull line come from src/storyTeasers.js, which is empty on purpose, so neither section shows yet. The painting note comes from src/pieceNotes.js, which is also empty.
- Gaps: no story has an opening paragraph or pull line in the repo. Fugue State has no first line and no link. Burnt Red Tongues, Sound and the Fury, Birds Do Not Sing in Caves and Fugue State have no publication date.

## Iteration 21

- **Scroll, root cause:** in the old one-axis wheel handler, a hand-off to the next section only happened if a gesture *started* while the row was already resting at the edge (`w.atEdge` was read at gesture start). A Mac trackpad's continuous/momentum stream never counted as a new gesture, and the tails were swallowed (`w.spent`) by locks and timers, so the next section never came.
- **New controller (Gallery.js `wheelOne`/`push`):** one target position T (in plates), chased by L each frame with a damped lerp. deltaMode normalised (line ×16, page ×innerHeight); the dominant axis is used; ctrl-pinch is ignored; mouse notches are detected (mode 1/2, or a whole delta ≥50 after a gap); input that arrives mid-transition is carried over, never dropped; snap to the nearest plate 140ms after input stops. Going 0.3 plate past either end of a section, or one notch, hands straight off to the next section. Page is overflow hidden with overscroll-behavior none, and the listeners are passive:false. Press D for the debug overlay (P, section, velocity, last delta/mode/kind, boundary state).
- **Stream test (/tmp/w21.cjs, headless):** trackpad swipes with decay tails, a reversal, notches and line mode, through every boundary in both directions, including publications plate 1 → prose last plate. Nothing ever moved backwards by more than 0.06. Not tested on a real Mac.
- **Nav:** Prose, Publications, Luck — SHANMU RAJA — Deep Dives, ART THAT I LOVE, About. The pen mark shows on hover or press only; the current item gets a 4px dot that eases in.
- **Handwriting:** Caveat is replaced everywhere with La Belle Aurore (OFL, self-hosted). The 6-font specimen is in the shots folder.
- **Home (t81):** under the front painting: its title, then its first line written in by hand (redrawn each time the front plate changes; respects reduced motion; wraps within the plate width), then one details line. The socials are 24px and centred under the name (on a phone, under the stacked nav). Checked with no overlaps at 1440/1280/390.
- **Story page:** Paris Review calm. Above the fold: title, rule, handwritten first line, details, and the READ ON … button. Scrolling brings the painting up from below with a torn edge and widens it to the full width; it appears once. Then the verbatim opening and one pull line (src/storyTeasers.js, each with its source URL), the button again, a tilted "More to read" row (other stories + publications; drag or wheel sideways), a small Previous/Next, and a "next story" block. Scrolling past the bottom moves to the next story and updates the URL; scrolling up past the top goes back to the previous one.
- **Teasers:** 14 published stories have them (5 Substack, 9 Medium). Fugue State is unpublished and has none, so its sections are hidden.

## Iteration 22

- **Handwriting font: Reenie Beanie** (your pick from the specimen sheet), self-hosted from public/fonts/reenie-beanie-latin-400-normal.woff2 under the SIL OFL 1.1 (licence: ReenieBeanie-OFL.txt). It replaces La Belle Aurore everywhere: the home row first line, the story-page first line, the Chekhov quote on About and the older epigraph rules. The La Belle Aurore files are removed; no other handwriting fonts are left.
- **Retuned for its smaller, narrower letters (src/styles/iter22.css):**
  - home line 25–31px (23px on a phone);
  - story first line 34–50px;
  - About quote 36–54px;
  - letter-spacing .015em, line-height 1.12–1.15, one weight (400) only.
- **Pen reveal:** the mask opens taller (−55%) and a little wider so the loops and tails aren't clipped, with a slightly more even ease. Reduced motion still shows the text at once.
- Shots of home, story top and About at 1440/1280/390 are in /workspace/redesign-shots-v22/.

## Iteration 23 — handwriting only in Prose; A24 section transition
- Handwriting (Reenie Beanie) now only on Prose: prose home plates, prose story pages, About Chekhov quote. Publications / Luck / Deep Dives use plain Lora (verified: 0 Reenie elements on those rows). Hover pen marks kept.
- SEC_ORDER now matches the nav: prose → publications → luck → deep.
- New section transition (src/styles/iter23.css, secRef/preRef in Browser.jsx): overflow past a row's end (0–0.3 plate) scrubs the row along the −30° diagonal and fades in a title card (section name in Lora, pen underline, "NN pieces", "0k / 04"), fully reversible. Past the handoff the row tilts/slides away, the card holds, and the new row springs in with cubic-bezier(0.32,0.72,0,1). Jump-nav uses a shorter version. Reduced motion: no tweens, no card.
- Caveat: once committed, reversal is applied after arrival via Gallery pend (not scrubbed mid-flight). Real Mac trackpad / phone untested.
- Shots: /workspace/redesign-shots-v23.

## Iteration 24 — section openings, story byline + CTA, header spacing, history, new hand
1. Section openings: every section has its own opening space. Scrolling past a row's end scrubs into the next section's title card; scrolling back past a row's start scrubs into *that* section's card (Publications → Prose shows "Publications" as you back out of it). Back past Prose's first plate replays the Prose opening and lands on plate 1. First load at a section start flashes that section's card as the row fans in. The card now holds ~0.38s on the plain ground and fades before the new row lands. Scrubbed part (0–0.3 plate overflow) is continuous and reversible; reduced motion: no card.
2. Story info: three boxed KIND/VENUE/PUBLISHED columns replaced by one centred tracked small-caps byline (Kind · Venue · Date, real data only); the double-rule CTA is now one solid black pill "Read on Substack/Medium ↗".
3. Header: social hover label sits under the icons; 761–1180px (and 125–150% zoom) puts the name on its own row with the sections centred beneath; socials always placed below the whole header with a 10px gap. No overlaps measured at 1440/1280/1024/768/390 and 125/150% zoom.
4. Nav label "art that I love" (also the in-gallery link); the page heading is unchanged.
5. History: openings already pushState and Back restores the exact plate; added seeding so a page loaded straight from a link (piece, paper, About, art) has the section beneath it in history.
6. Handwriting: Nothing You Could Do (Kimberly Geswein, OFL, self-hosted) replaces Reenie Beanie (removed). Sizes retuned. Specimen: redesign-shots-v24/handwriting-specimen-v24.png.
7. Pen marks: ink #1a1a1a at .9 opacity, 1.2–1.35 stroke, round caps to match the font's stroke.
8. All written reveals ×0.8 (Hand delay/speed, pen draw .56s, ring draw .5s, card underline, About fade-ins).

## Iteration 25 — two real hands
- Prose first lines (home plates + story pages): Tyrowo Inked (Tyler Crews, OFL-1.1, github.com/tylercrews/TyrowoInked), the author's own woff2 copied unmodified so its GSUB/calt variants are intact; 'calt' 1 + font-variant-ligatures: contextual on every handwritten element.
- Chekhov line on About: Mynerve (Carolina Short, OFL-1.1, Fontsource latin subset; GSUB calt/liga kept).
- Nothing You Could Do removed (font + licence). Licences: public/fonts/TyrowoInked-OFL.txt, Mynerve-OFL.txt.
- Retuned sizes/line-heights; pen-reveal mask widened (-60% top/bottom, -8% left) so ascenders, descenders and the lean are never clipped; reduced motion now shows the words outright (fixes a mask that could hide them). Reveal timings unchanged (0.8x). Pen marks #1a1a1a, 1.4 stroke.

## Iteration 26
- Home plate caption under the first line now reads only kind · date (e.g. "SHORT STORY · OCT 2026"), from the real Kind and Published/Date fields; venue, painting credit and other tags removed from it (data untouched; credit still on story page and flip side). Paintings keep artist · year.
- Caption is one line (nowrap) and now shown at 390 too; screenshots in /workspace/redesign-shots-v27.

## Iteration 27
- Story page top rebuilt to the A24 film-page order (Backrooms): huge Lora caps title, small-caps credit line (Written by Shanmu Raja · Painting: artist), full-width hairline rows label-left/value-right (Kind, Published, Published on, Painting — real fields only; "Unpublished" venue is not shown as "Published on"), handwritten first line in the open space (pen reveal 20% faster), two thick-ruled buttons (Read on Substack/Medium, Next story). Painting still rises once from below with the torn edge.
- The end-of-story "next" block is now a ruled transition card (A24 Tony): warm grey, evenly spaced full-width hairlines, next title between two lines, next painting rising from the bottom as a disc. Existing wheel/touch pull-through to the next story and pull-up-to-previous are kept.
- Home section title cards (.h-card) restyled to the same ruled-lines look (not visually verified).
- Optional full-bleed hero (screenshot a) skipped: the calm white story top is kept.

## Iteration 28 — gradual story crossing, resistance, single-step up
- Story end is a pinned `.tc27` card (230svh zone, sticky) with two parallax hairline layers driven by scroll velocity × progress (spacing compresses, settles on arrival), "Keep scrolling" cue, and a static painting disc (no spin) rising from below with curved ring text (kind · Shanmu Raja · date).
- Next story's top is rendered as a preview below the card; when it reaches the viewport top the route swaps to that story at the same offset (SEAM), no fade/out-animation, Hand shown already written. Up mirrors it, landing on the previous story's preview position.
- Resistance: wheel/touch over the card scroll at 0.42x; stopping in the first ~18% eases back to the card start after 900ms. Input is never dropped.
- Double scroll-up root cause: Gallery handoff carried leftover input (`pend`) into the next section, and the previous story mounted at top so the same momentum tail stepped again. Fixed with spent-gesture tracking (Gallery `spent`, Browser `GEST`). Tested: one step from story top, card, and home section first plate at 1440 (wheel stream + notch) and 390 (CDP touch).
- Reveal is lerped with a torn clip that bleeds up from below. Home section cards: ruled lines removed. Comment pill becomes a vertical right-edge tab at ≤720px. Reduced motion: static lines, no resistance, no image motion.

## Iteration 29 — no stall over "More to read"
- The story page's "More to read" row no longer turns vertical wheel/trackpad input into sideways scrolling. Vertical input always scrolls the page; the row scrolls sideways only with deltaX, shift+wheel (mapped explicitly), horizontal swipe, drag, or its arrows.
- Re-tested at 1440 with the pointer over the row and at 390 with touch: continuous scroll through the card into the next story, one-step-up from story top / card / home section unchanged, back/forward and reduced motion unchanged.

## Iteration 30 — ink-dot cursor
- `src/lib/inkCursor.js` + `src/styles/iter30.css`, wired into all four entries (site, papers index, both white papers).
- A 10px #1a1a1a dot with a thin white ring (chosen over mix-blend difference, which tinted the dot pink/blue over paintings) so it reads as ink on light pages and stays visible on dark paintings and the grey card.
- Follows the pointer with a 0.35 lerp on rAF using translate3d; scales to 1.8 over links/buttons/plates/nav, squashes to 0.8 when pressed; hides on window leave/blur; pointer-events: none.
- Only enabled when `(hover: hover) and (pointer: fine)` matches; JS adds `html.has-ink`, and only that class hides the system cursor, so if JS fails the normal cursor remains. Text inputs/textareas keep the I-beam (dot hides there). Reduced motion: no lag.

## Iteration 31 — section card names the destination
- Scrolling up across a section boundary now shows the section you are going TO (name, "NN pieces", "0k / 04"), same as going down. Both the scrubbed pre-card (back past a section's first plate) and the hand-off card use the destination; back past Prose's first plate still replays Prose's own opening.
- Tested with trackpad-style wheel streams at 1440 and CDP touch swipes at 390, reading the card DOM text mid-transition: every boundary both directions shows only the destination (Prose↔Publications, Publications↔Luck, Luck↔Deep Dives). One gesture up from a section's first plate = one section step. Shots: redesign-shots-v32.

## Iteration 32 — ink bloom crossing, one paper
- Removed the grey ruled card, the rising disc, its ring text, the moving hairlines and "Keep scrolling".
- Ink bloom: the pinned zone (still 0.42x resistance, same spring-back) is one SVG. The next story's painting is revealed through a mask whose top edge is a rect displaced by fractal noise (feTurbulence + feDisplacementMap, soft blur), rising from the bottom of the screen with scroll position; a slightly higher, blurrier copy of the same edge in #1a1a1a (72%) gives the wet ink fringe. Noise is fixed to the screen so the edge reshapes as it moves (no spin). Fully scroll-driven, so scrolling up un-blooms it exactly.
- Next title sits in the upper third, ink on paper until the bloom passes behind it, then paper-white. Past ~66% the full-bleed painting settles to an inset plate, then the zone scrolls away onto the next story's top.
- One paper: zone, card and next-story preview are all #fff (same as the story page) — no grey-to-white edge.
- Story top enters in a scroll-driven stagger: title, credit line, details, handwritten first line, buttons each fade + rise 12px as they come up the screen (reversible). Row boxes/rules removed; one thin rule left in the info block.
- Fixed: in dev (React StrictMode) the page layout effect ran twice and reset the scroll to 0 after an upward crossing, so the previous story opened at its top and the momentum tail stepped again (several stories per gesture). skipTop now clears on a timeout. Production was likely unaffected, but the dev preview had it.
- Reduced motion: zone 100svh, bloom shown full with a plain opacity fade, no stagger.
- Tested (headless Chrome, wheel streams at 1440, CDP touch at 390): down crosses once into the next story at the same visual position; up from the next story's top crosses once back onto the bloom and un-blooms it. Frames in redesign-shots-v33 (down-*, up-*, edge-*); no seam visible.

## Iteration 33 — Paris Review-style title block
- Story header restyled (src/styles/iter33.css, `pr33-*` classes): small-caps kind · date kicker, lighter 400-weight serif title, small-caps "by Shanmu Raja" byline, one quiet italic meta line (venue + painting credit, real data only) with a single thin rule. Tyrowo Inked handwritten line kept.
- "Read on Medium/Substack ↗" is now the dominant black pill; "Next story →" is a small muted italic link.
- Stagger reworked to be per-header and order-based so every element reaches full opacity once the header is at the top (fixes Read button at 0.55 opacity on load).
- Caveat: theparisreview.org blocks headless fetch (Cloudflare); the style is based on general knowledge of their pages, not a live reference.
- Checked at 1440 and 390 (headless), plus reduced-motion. Shots: /workspace/redesign-shots-v34.
