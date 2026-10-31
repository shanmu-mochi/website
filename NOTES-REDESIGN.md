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

## Iteration 34 — ink-on-paper bloom, deliberate entry to the next story
- `src/lib/inkBloom.js`: WebGL fragment-shader bloom. Simplex noise is **ashima/webgl-noise** (MIT; (C) 2011 Ashima Arts, (C) 2011-2016 Stefan Gustavson), credited in the file header. The technique (fbm height-field thresholded by progress, a pooled darker rim, and a pale diffusion halo ahead of the front) is adapted from viberdy.dev/library/ink-bleed-reveal and ink.niccolofanton.dev; no code was copied from those two.
- The ink is #1a1a1a and wicks up from the bottom with a feathered fibrous edge, a darker pooled rim and a light halo, then resolves into the next painting and its title. The paper is flat #fdfcfa inside the shader, and the page-wide feTurbulence grain overlay (`.pg-story::after`) supplies the tooth, so there is no seam where the canvas meets the page.
- The bloom is scroll-driven and reversible. It redraws only when progress changes and renders at a reduced resolution. If WebGL is unavailable, the canvas is hidden and an `<img>` opacity fade takes over. Reduced motion gets a plain fade in a 100svh zone.
- B: a single "Next: <title>" line follows "More to read". The 250svh zone with 0.42x resistance needs sustained scrolling. Stopping before 92% eases back after 700ms, so one flick does not carry through (tested with a wheel stream at 1440 and touch at 390).
## Iteration 35 — Menu pill, back link, About font, top painting
- The "← Prose" back link is 17px. A fixed `← Menu` pill (`.mp35`) hides when you scroll down, slides in when you scroll up or near the top, and links to the section carousel. History is unchanged, so the browser back button still works.
- The About Chekhov quote now uses Tyrowo Inked with calt forced on; the second line stays in Lora. Mynerve was unused, so its files and @font-face are removed.
- Story top painting: the figure height and image scale shrink together with ease-out over 0.5 viewport and reach 0 at y=0.5H. The motion is monotonic, identical in both directions and never parks (sampled at 15 offsets at 1440 and 390). The header min-height was dropped so the title sits right under it.

## Iteration 36: scroll performance and the ink as a commit gesture

**Brief (pt116u):** "so glithcy since there are so many competing animations". Steering: remove the paintings between a story's buttons and the next section; the ink becomes a commit gesture (A24-like, no disc); full-res ink; one gap-free crossing.

**Measured on the Mac** (M5 Pro, Chrome headless with ANGLE Metal, DPR 2, 1440x900, the same wheel script before and after; rAF frame deltas, long-task observer, CDP metrics):

| segment | before (274a82a) p95 / max / >33ms / dropped / long tasks | after p95 / max / >33ms / dropped / long tasks |
|---|---|---|
| home | 16.7 / 133.4 / 2 / 12 / 0 (script 1640ms) | 16.8 / 16.8 / 0 / 0 / 0 (script 1254ms) |
| prose index | 16.7 / 16.8 / 0 / 0 / 0 (script 1210ms) | 16.7 / 16.8 / 0 / 0 / 0 (script 828ms) |
| story read | 16.8 / 133.3 / 2 / 19 / 0 | 16.8 / 33.4 / 1 / 4 / 0 (script 45ms, was 118) |
| crossing down | 16.7 / 16.8 / 0 / 0 / 0 | 16.7 / 16.8 / 0 / 0 / 0 |
| crossing up | 16.7 / 16.8 / 0 / 0 / 0 | 16.7 / 33.3 / 0 / 6 / 0 |

Headless rAF does not see compositor or raster cost (the blend-mode grain, backdrop-filter, image decode), and Safari/Arc were not measured.

**What changed**
- Gallery (home/index): the three.js frame skips render and the per-frame DOM label work (getBoundingClientRect/setAttribute) when nothing moved. It is marked dirty on texture load, tone, resize and pointer move, with a 500ms safety refresh.
- Story pages have no always-running rAF loop now. The Menu pill runs off scroll events. The ink WebGL context exists only near the Next screen (IntersectionObserver), is created at an idle moment, and draws only while the gesture moves.
- Grain overlay on stories: mix-blend removed (normal blend at .035).
- Removed the shrinking hero figure, the prewrap preview, and the intermediate painting zone. Order: handwritten line → Read → Next (centred, full screen) → next story.
- Ink (`src/lib/inkBloom.js`): the static fibrous field is rendered once per size; each frame is a threshold at 1:1 device pixels (DPR ≤ 2), 1.2px AA edge, hash dither, flat #1a1a1a.
- Commit gesture: input at the page bottom drives q. If you release below 0.6 it retracts (420ms); at 0.6 or more it fills, a fixed veil carries the title, and the next story lifts in (plate → title/info → line → Read). Up at the top goes back one story and lands pinned on its last screen. The leftover fling/tail of the same gesture is absorbed.
- The Next title uses difference blending so it reads on both paper and ink.

**Verified on the box:** frames at every 10% of q (1440 wheel, 390 touch) in `redesign-shots-v36/`; flick retracts; commit lands at y=0 of the next story; up lands at the bottom; partial and reverse retract; Menu pill and About checks pass; no page errors.

## Iteration 37 — story page redesign (one order, one spacing system)

Order, top to bottom (one continuous page, no second painting entrance, no shrink/vanish):
1. Hero `figure.s37-hero`: the clicked painting, static in flow; small-caps caption (title, artist, year). The gallery click now flies onto this hero (the `art` ref lives on `.s37-hero-f`), so the painting no longer rushes into a tiny box.
2. Title block `header.s37-head`: kind · date (small caps) → title → by Shanmu Raja → 128px hairline → "Published on {venue}".
3. Prose: handwritten first line (only if the story has one) → primary "Read on {venue} ↗" → small "Next story →".
4. Teaser `section.s37-teaser` (only if there is an opening/pull): opening paragraphs, pull line with a left rule, 640px column.
5. "More to read" row.
6. Next zone `section.nx36.s37-end` (100svh): next painting plate above, NEXT + title anchored near the bottom, "keep scrolling" hint. The iter-36 ink commit gesture is unchanged (0.6 commit, 170ms release, 420ms retract, one story per gesture). The ink shader now outputs premultiplied alpha, so the plate shows through the un-inked paper.

Tokens (on `.pg-story`, used only between blocks):
- Space, 8px base: --s1 8 · --s2 16 · --s3 24 · --s4 32 · --s5 48 · --s6 64 · --s7 96 · --s8 128.
- Rhythm: hero top s4 (s3 mobile); caption s2; head s6; kick→title s2; by s2; rule s3; meta s3; first line s6; actions s5 (gap s2); every section break s7.
- Type: --t-title clamp(40px,5.2vw,72px) · --t-body 19px (17 mobile) · --t-meta 11px small caps .14em · --t-hand clamp(26px,2.6vw,34px). Caption, kick, labels, card kinds, NEXT and the hint all share the meta style.
- Deliberate deviation: the painting credit appears once, in the hero caption. The meta line carries only the venue.

Mac (M5 Pro, Metal, temp build; the machine had load ~4–5 during the run), p95/max ms: home 16.8/150 · prose-index 16.7/16.8 · story-read 16.7/50 (1 long task, 64ms) · bloom-down 16.7/16.8 · bloom-up 16.8/83.3.

## Iteration 38 — story page rebuilt on the A24 film page

Ink removed (inkBloom.js, iter34/36/37.css deleted). One painting per page, behaving like A24's hero. All motion is one scroll-driven rAF system that is scrubbed and reversible. The only time-based parts are tiny hovers and the push drain, which A24 also has.

| Token | A24 1440 | Ours 1440 | A24 390 | Ours 390 |
|---|---|---|---|---|
| Page margin | 6px | 6px | 7px | 7px |
| H1 (heading-l) | 72px | 72px | 35.8px | 35.8px |
| H1 top | 72 | 72 token (91 measured, under nav) | 46 | 46 |
| Label | 7.5px | 7.5px | 8.14px | 8.14px |
| Value | 13.5px | 13.5px | 14.66px | 14.66px |
| Info row | 21.5px | 21px | 31px | 31px |
| Description | 24px | 24px | 26px | 26px |
| CTA area | 411px | 411px | — | 300px |
| Button h / w / rule | 53 / 231 / 4px | 53 / 231 / 4px | 40 / – / 3px | 40 / auto / 3px |
| Ruled section | 1116px (1.24×900, 5 rows) | 124vh, 5 rows | — | 88vh |
| Hero image | 158% of section, torn top | 158%, torn clip-path | | |
| Lower bg | #d8d5d2 | #d8d5d2 | | |
| Push wheel / touch / hold / drain | 620 / 380 / 180ms / 0.9 | same | | |

**Pill:** fixed at the bottom centre. It is hidden near the top and while scrolling down, and shown on an upward scroll, so it no longer overlaps "SHANMU RAJA".

**Home caption:** the first line had max-height 2.8em, which let it overlap. The title, first line and kind·date are now a flex column with 10px gaps. Bounding boxes show 0 overlaps on all 35 pieces at 1440 and at 390 (ov38.cjs).

**Crossing tests** (t38.cjs, wheel 1440 and touch 390):
- Down commits exactly one story.
- A flick that reaches q≈0.67 retracts to 0.
- Going up lands at the previous story's bottom.
- A partial push reverses.
- No errors.

**Remaining honest differences:**
- No WebGL disc or second image in the next zone; there is a fill line instead.
- Long titles wrap to two lines, so the hero block is taller.
- We have an extra "More to read" list.
- No trailer button.
- The handwritten line is static.
- The painting is cover-cropped.
- On mobile the buttons stay in the CTA.
- No Mac-GPU timing this iteration.

## Iteration 39
- Handwritten first lines are now static. Removed the Hand component, src/opening.js and the .hw/hw-write/ab-epi CSS. Tyrowo Inked is kept for Prose only.
- About: the Chekhov quote is gone; the bio is unchanged.
- Top resistant push: a fixed "Previous story" zone (40vh) with the previous title and a fill line. It springs back if you stop short and commits when the line fills. One story per gesture. From the first story it goes back to the section carousel. The Menu pill and the mouse back button still work.
- Overlap regression causes: .s38-paint had margin-top -26vh (painting over the buttons); the CTA had a fixed min-height of 411px plus a margin (the gap); the pull words were 72px with ±4vw drift (cut off at the left); A24-style double borders; + marks. All fixed.
- More to read: at most 6 items from the same section, excluding the current story, with wrapping titles in a grid.
- The next-story zone now previews the next story's real title, credit, info rows, first line, buttons and painting, so the crossing never shows an empty screen.
- Checked on the production build (vite build + static server) at 1024x640@2, 1280x720, 1440x900, 1728x1117 and 390x844: all 15 stories top to bottom, plus home, prose, publications, luck, deep, about and art, and the pill.
- Caveats: the next zone loads a second painting; at low pull only the prev kicker is visible; a gesture that continues after a commit keeps scrolling; Mac GPU timing is untested.

## Iteration 40
- Removed "More to read" from the story page (markup, the `others` data and all .s38-more CSS). The flow is now: description/teaser (or the painting, when there's no teaser) leading straight into the Next story push zone. The top and bottom resistant push zones are unchanged.
- Removed the torn edge: deleted torn()/seedOf() and the clipPath on .s38-paint and .s38-npaint. The story painting and the next-zone preview are now clean, straight-edged and full-width. Painting behaviour is unchanged.
- Verified on the production build at 1024x640@2, 1280x720, 1440x900, 1728x1117 and 390x844: fugue-state (no teaser), to-get-the-face-right, a-boring-call and publications/same-result-different-price (separate paper template, unaffected). Wheel and touch crossings (commit and spring back both ways, first-story-up to #/prose) pass at all five sizes. 1728 down-commit only passes with frame capture off, because the screenshots are slower than the 180ms hold.

## Iteration 41
- The story CTA is now just the Read button ("Read on Substack/Medium ↗", or the muted "Not yet published" for Fugue State). Removed the "Next story →" button from the story page and its replica in the next-story preview. The bottom push zone and its "Next story" label are unchanged.
- The button is centred with its styling unchanged: 24px below the handwritten line and 56px of padding below it, at every size. Fugue State has no handwritten line and shows only the centred button.
- Verified on the production build at 1024x640@2, 1280x720, 1440x900 and 390x844: measured all 15 prose stories and viewed screenshots of fugue-state, to-get-the-face-right and a-boring-call.
- Iteration 41, round 2 (same push):
  - **Order on the story page:** (1) the Read CTA only; (2) the teaser opening sits to the RIGHT of the first line and button (two-column grid on desktop; stacked below on ≤760px); (3) the painting with its lines; then (4) the commit zone. The standalone teaser section that came after the painting has been removed.
  - **Commit zone:** a separate full-viewport grey segment (100svh). It holds "End of {title}", the fill bar, "Keep scrolling", big "NEXT / STORY" words on the rules, the destination "05 / 15 · Prose" and "Hold the scroll to turn the page". The next story's head and painting live in `.s38-reveal`, which stays hidden (clip-path inset 100%) until the push starts. It then wipes up from the bottom as q fills, and the seam lands when it is complete. The resistance only begins once this segment fills the screen, so no next-story content shows before it.
  - **Top boundary:** the previous-story overlay is now 100svh, so the page is pushed a full viewport down. Going up lands on the previous story's painting end (scrollHeight − 2·vh) instead of its grey gate.
  - **Info rows:** labels don't shrink, values wrap (min-width 0), and the page has overflow-x: clip. Measured at 1024: scrollWidth 1024 and no clipped dt/dd on any of the 15 stories.
  - **Checks:** scripts in /workspace/v41b.cjs, shots in /workspace/redesign-shots-v41b. All 15 stories pass at 1024/1280/1440/390: reveal hidden at the bottom with q=0, teaser to the right on desktop, one button each, Fugue State shows "Not yet published" with no teaser.

## Iteration 42
- **Scroll: the end zones only take a fresh gesture.** Before this, the reading scroll's own momentum ran straight into the bottom push zone. One ordinary flick filled it in about 7 wheel events and turned the page, so Burnt Red Tongues went to Fugue State and then to A Pound of Flesh. `gestTail` only guarded the page after a commit; nothing guarded the page before it. Now the momentum that carries you to the end stops there, and a scroll after a pause of 180ms or more, or a sharp new swipe, turns the page. The same rule applies at the top zone. On touch, a drag only pushes if it started at the edge. For keys, a held key that started mid-page doesn't carry over. The post-commit tail swallow was widened to 150ms and 1.5x. A scrollbar drag now releases the up-landing pin.
- **Seam alignment.** The incoming story's title was wiped in about 5px below where its page puts it. Since the page can't scroll above 0, every desktop landing jumped up 5px, and at 1024 the page landed slightly scrolled. The preview title is now placed at the measured title position (`--t0`), so every landing is exact at scrollY 0.
- **Story page order:** title, an italic deck for essays (the subject), one facts line (kind · venue · date), the honour as a visible italic line, then one reading column. That column is the handwritten line, the opening in Lora 19/1.62 (17 on phone), then the Read button. After it come the painting and its credit as a caption under the image, then the commit zone.
- **Removed:** "Written by Shanmu Raja", the full-width label/value rows, and the two-column CTA/teaser grid.
- **The handwritten line is said once.** In all 13 published stories it is the excerpt's own first sentence (identical in 2, a prefix in 11). `restOf()` strips it off the front, so the Lora text continues from the next sentence.
- **The painting sentence is shown whole.** Before, `chunks(...).slice(0, 4)` cut it off in 14 of 14 stories on phone and 10 of 14 on desktop (A Pound of Flesh showed 4 of 9 lines). `fitPull()` keeps today's 16/12-character lines when they fit in 4 rows. Otherwise it adds rows (up to 6 on desktop, 7 on phone) and shrinks the type only as far as needed. Desktop stays at 72px for every story; phone goes to 27-30px only on the three longest sentences.
- **Verified on the preview build:**
  - Wheel: a long flick stops at the end; pause then scroll turns the page; momentum doesn't scroll the new story; the same both ways at the top; up from the first story goes to #/prose.
  - Touch: a drag past the end stays; a fresh drag turns.
  - Layout: all 15 stories at 1440/1024/390 (no duplicate, Lora, order, no x-overflow, one button, caption).
  - Painting sentence: whole, unclipped and uncrowded on 14 stories at 1440/1280/1024/390.
  - Seam: under 0.5px at 1440/1728/1280/1024/390.
  - No console errors on 22 routes.
- **Caveat:** headless Chrome can't reproduce real Mac trackpad momentum or GPU timing. The 180ms pause threshold is the setting to tune by feel.

## Iteration 43: A24's scrolling and page turns, from their source
- **Studied a24.raviklaassens.com's shipped bundle.** It's Astro + Barba.js page transitions + GSAP (ScrollTrigger, Observer, CustomEase, SplitText) + Lenis + three.js. The difference was never the look; it was the input layer. Their listeners are passive and never fight the browser. Ours intercepted and cancelled scrolling everywhere.
- **Page scroll: Lenis with their exact config.** That is `lerp 0.165` and `wheelMultiplier 1.25` on a mouse or trackpad, and `lerp 1` (native) on touch, plus `allowNestedScroll`, driven by `gsap.ticker` with `lagSmoothing(0)`. It runs on every page that scrolls and is destroyed on the home gallery, which owns its own input. Scroll resets go through `toTop()`.
- **Story footer = their "Next production" push.** Same constants (`NEXT`):
  - Wheel 620 and touch 380 per full push; a key press is 0.34.
  - Each event is clamped to ±140.
  - It arms only after 350ms at the end AND (a 140ms gap OR a 1.6x surge over 6).
  - It drains linearly at 0.9/s after a 180ms hold, and the bar follows at 10/s.
  - "At the end" means Lenis's target scroll is at the limit; leaving the end resets the push and disarms it.
  - Every listener is passive.
- **Page turn = theirs.** Over 0.45s the next-story copy rises out of its masks (stagger 0.03) and the plate pops out. The rules retract from the end from 0.05s (0.5s, stagger 0.04). At 0.48s it navigates: the old page fades for 0.4s, the new one fades in for 0.5s at the top, and its head rises out of masks (title 0.7s with stagger 0.08, text at 0.12, button at 0.38). The ease is "energy", `M0,0 C0.32,0.72 0,1 1,1`. The gap between pages fades through paper (#f2f2f2), not white. Measured from the fill completing: copy out at 18ms, fade at 485ms, swap at 869ms, new page fully in at 1.3s.
- **Footer layout = theirs.** "Next story" and the count on the first rule, the next title across the next three rules alternating sides, the next story's painting rising from the bottom edge where their disc is (it grows and lifts with the push), a fill bar along the bottom, and "Keep scrolling" once you're at the end.
- **Removed, because A24 doesn't have them:** the top "Previous story" pull zone, the seam (the clip-path wipe of the next head and its scroll alignment), "End of {title}", and "Hold the scroll to turn the page".
- **Home wheel = their disc-gallery step detector** (same constants, `WHEEL` in Gallery.js):
  - One piece per gesture. The rest of that swipe and its momentum are ignored until a pause (130ms), a fresh mouse tick (a 34ms gap at least 90ms after the step), a new flick (a 1.2x rise at least 190ms after the step) or held scrolling (one more every 480ms).
  - Noise floor 0.3, a step at 6, each event capped at 24, envelope tau 550ms, reset after 150ms idle, and the dominant axis needs 1.25x.
  - This replaces the continuous proportional `wheelOne`, whose six stacked models were the cause of the loose feel. Drag already matched A24 and is unchanged.
- **Beyond A24:**
  - Both detectors time gestures with `e.timeStamp`. A section load stalls the main thread about 170ms, and with `performance.now()` the queued momentum tail looked like a fresh gesture and took an extra step after a section handover. A24 never hands over between sections, so it never hits this.
  - While the row is busy, the gesture is kept spent but still tracked.
- **Verified with real-style input** (CDP wheel events sent with OS timing, not in-page timers, which stall with the page):
  - Home: a swipe is 1 step, 3 notches are 3, held scrolling for 1.5s is 4, a new flick in the tail is 2, noise is 0. Handover past the end of Prose lands on Publications 01 with no extra step, and back past the start returns to Prose 15.
  - Story: a long flick stops at the end; pause then scroll turns the page; a nudge drains back; nothing happens at the top; 3x Space turns; touch drag at the end turns; it lands at the top with the head risen.
  - Layout: all 15 stories at 1440 and 390 (no duplicate, no x-overflow, footer present, no top pull, Lenis on).
  - No errors on 22 routes.
- **Caveats:**
  - Headless can't reproduce a real Mac trackpad; the constants are A24's, so it should feel the same, but that is unconfirmed by hand.
  - Touch now follows A24: any drag at the end pushes. Iteration 42's "drag must start at the edge" gate is gone.
  - Lint is down to 1 pre-existing problem (`from`, unused, in Home).

## Iteration 44: no jump at either end of the painting's flight, nav circles, a second link, sideways back
- **Landing (gallery to story).** The flown copy was sized to the painting's frame (the whole oversized image, top-aligned), but the real painting shows through its section with the parallax offset, about 600px further down at the opening scroll position. So at the hand-off the picture jumped, and the words were already sitting on the real painting under the flight.
  - Now the parallax is applied to the frame, so the frame's box is where the image really shows. It is set in a layout effect before Piece measures it.
  - The copy flies to that box and is trimmed to the section as it lands (`flyTo({ clip })`).
  - The real frame stays hidden under the flight; its slot is the painting's own colour, not black.
  - The words rise out of their masks only after the copy is gone.
  - Measured: the copy's visible top equals the slot top to the pixel on three paintings.
- **Return (story to gallery).** The returning copy appeared unclipped over the story text (the blip). It now starts clipped to what the slot showed, in % of its box so the clip holds as the box changes, and the clip opens as it flies home. Measured: its first frame matches the slot to the pixel.
- **Nav.** Prose / Publications / Luck are circled on hover with the hand-drawn ring (`Scribble`, now with its own vertical padding). Deep Dives / art that I love / About keep the underline.
- **After the painting.** There's a band of room (120 + 168px; 72 + 112 on phone) with the story's link once more ("Read on Substack/Medium"), then Next story. Fugue State gets the room without a button.
- **Footer arrival.** The rules draw as soon as the footer is on screen, so it's never an empty band; the title rises and the plate pops at 30%. Footer progress now uses A24's range (top at the bottom of the screen to bottom at the bottom). Before, our range made "30%" mean 60% on screen.
- **Sideways swipe.** On a story, a left-to-right two-finger swipe (120px of travel, one per gesture, a 140ms pause starts a new one) goes back to the carousel with the fly-home. `overscroll-behavior-x: none` on story pages stops Mac's own swipe-back firing as well. A slightly diagonal vertical scroll still just scrolls.
- **Name.** SHANMU RAJA at the top already goes back to the carousel from any story (verified).
- **Verified:** landing and return on three paintings, the story push, the side swipe both ways, the home wheel, all 15 stories at 1440/390, and no errors.

## Iteration 45: Paris Review story page, contents (nav hover + counter), turn a painting over by hand
- **Story page = a Paris Review fiction page**, measured on theparisreview.org (a real browser passes their Cloudflare; a plain fetch gets 403):
  - White page. Title 48/1.08, regular, #414141, title case, left in a 754px column.
  - Essays get an italic subject line.
  - A byline row between a dark and a light rule: "Shanmu Raja" in their olive #5c5932, and kind · venue · date in 11.2px bold spaced caps.
  - The honour as a quiet italic olive line.
  - The opening set like a book: 20/1.5, paragraphs tight, the first flush and the rest indented 1.8em.
  - Then the olive button (white type; their black on olive is about 3:1).
  - Lora stands in for Heldane, Archivo for Founders Grotesk.
  - The handwritten first line is off the story page (still on the home caption); the opening now starts with that sentence in type. `restOf()` is gone.
  - The painting band, the second link and the footer are unchanged, now on white.
- **Contents (TOC).** One list (`Toc`), two doors:
  - Hovering a section in the nav (Prose, Publications, Luck, Deep Dives; fine pointers only) opens its contents under it. It's drawn in the page body, so the nav's nowrap link styles don't clip long titles, and it's clamped inside the screen. A 160ms close delay and a hover bridge let the pointer move into it; Esc closes it. A pick opens the piece directly (`go(..., { direct, fade })`, which skips the flight from the centred plate).
  - On home, the counter opens the current section's contents above it, with the current piece marked. A pick turns the carousel to it. Esc or a click elsewhere closes it.
- **Nav.** Every item is circled on hover (iteration 44 only circled the sections).
- **No Flip button.** The counter stays. A painting is turned over by hand, as on A24:
  - With a mouse, dragging the centred painting turns it; past half a turn it stays on its back, a short drag springs back, and dragging beside it still moves the row.
  - With a finger, a sideways swipe moves the row (A24's rule) and an up/down drag on the centred painting turns it.
  - A click without dragging still opens the story. Space still turns it over from the keyboard.
- **Verified:**
  - TOC: nav hover opens, stays as the pointer moves in, closes on leave, nothing clipped at 1440 and 1024; the counter marks the current piece and a pick turns the row; a nav pick opens the story.
  - Turning over: mouse long, short and back again, the row unmoved, dragging beside moves the row; touch sideways moves the row, up/down turns.
  - Landing and return exact; the story push and sideways back still work; all 15 stories at 1440/390 have the Paris Review head on white with no overflow; no errors.

## Iteration 46: the comment overlay is gone
- Deleted the preview comment overlay completely:
  - `src/feedback/` (Feedback.jsx, mount.jsx, feedback.css)
  - its import in `main.jsx` and the `__FEEDBACK__` define in `vite.config.js`
  - `VITE_FEEDBACK=1` from `build:preview`
  - the `/__feedback` save endpoint in `scripts/serve.py`
- `serve.py` is now a plain static server (no-store on HTML so a refresh shows the latest). `build:preview` still copies it into `dist/`, so `npm run live` works as before.
- The overlay how-to section is removed from these notes. Verified: no overlay code in the built bundle and no comment UI on home, story or About.
- "art that I love" is now "Art that I love" in the nav and the end-of-row link.

## Iteration 47: phones
- **Images.** On a phone (coarse pointer, short side ≤760px) one 1200px painting file serves the carousel texture, the flying copy and the story page (`PLATE_CSS` / `STORY_CSS` = 750 css px at the 1.6 density cap). It is cached once, so the flight and landing stay seamless; desktop sizes are unchanged. Home images went from 2.5 MB to 1.3 MB and the story page from 859 KB to 433 KB.
- **Render resolution.** The gallery renders at most 1.5x on touch screens (A24's cap; it was 2x), about half the pixels.
- **Thumb targets.** Every control is at least 44px: the nav (the rows now sit on the targets instead of an extra gap, with no two targets overlapping), the name, the back link, the counter (which opens the contents on a phone), the socials, the caption titles, the honour, the email and the next-story title. The padding is taken back with negative margins, so nothing moves visually.
- **Type.** Nothing under 11px on a phone: caption details, section card, story labels, byline caps, the button and the contents numbers/details.
- **Contents on a phone.** The details sit under each title, so titles get the full width: one line each, 62px rows (they were up to 85px, with 3-line titles).
- **End of a story.** On a phone the room after the second link is tighter (56 + 80px), and "Keep scrolling" sits under the count instead of on the next painting.
- **iOS.** No grey tap flash, and no text inflation in landscape.
- **Verified:**
  - All 10 pages at 375x667, 390x844 and 430x932: no sideways overflow, every target ≥44px, no text under 11px, the hint clear of the painting.
  - Phone interactions: tap opens with an exact landing, the same 1200px file for copy and page, touch push at the end, the counter contents on screen with ≥44px rows and a pick turns the row, a swipe moves the row, dragging up turns the painting over. No errors; desktop still gets 1800px.
- **Throttled phone** (4x CPU, Fast 4G): home is usable in about 0.4 to 1.5s; 6 frames over 50ms across 4 swipes (was 7 across 3). The rest likely comes from the caption re-rendering on each new painting, not images; worth a look next.
- **Not done:** three.js isn't split out of non-home routes. The main bundle is 199 KB gzipped and home needs it anyway.
