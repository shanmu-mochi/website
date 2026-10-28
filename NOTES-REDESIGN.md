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
