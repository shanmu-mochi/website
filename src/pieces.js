/* Data for the A24-style browser (redesign iteration 4). Copied verbatim from App.jsx; nothing invented. */
import DIMS from './paintingsData'
import { FINDINGS } from './data/findings'
import { ABSTRACTS } from './data/abstracts'
import SELECTED from './selected'
import COLORS from './colorsData'
import { PAPERS } from './data/papers'

export const META = {
  'ravivarma2.jpg':     { title: 'Lady in a Black Saree', artist: 'Raja Ravi Varma', year: 'c. 1893' },
  'ravivarma.jpg':      { title: 'Radha in the Moonlight', artist: 'Raja Ravi Varma', year: 'c. 1890' },
  'ravivarma3.jpg':     { title: 'There Comes Papa', artist: 'Raja Ravi Varma', year: '1893' },
  'ravivarma-shakuntala.jpg': { title: 'Shakuntala', artist: 'Raja Ravi Varma', year: '1898' },
  'ravivarma-fruit.jpg': { title: 'Woman Holding a Fruit', artist: 'Raja Ravi Varma', year: 'late 19th c.' },
  'shergil-brahmacharis.jpg': { title: 'Brahmacharis', artist: 'Amrita Sher-Gil', year: '1937', minH: 46 },
  'shergil-bridestoilet.jpg': { title: 'The Bride\u2019s Toilet', artist: 'Amrita Sher-Gil', year: '1937', minH: 46 },
  'shergil-threegirls.jpg': { title: 'Group of Three Girls', artist: 'Amrita Sher-Gil', year: '1935' },
  'shergil-fruitvendors.jpg': { title: 'Fruit Vendors', artist: 'Amrita Sher-Gil', year: '1937' },
  'tagore-staircase.jpg': { title: 'Meeting at the Staircase', artist: 'Gaganendranath Tagore', year: 'c. 1920\u201325' },
  'vishnu-shesha.jpg':  { title: 'Vishnu Narayana on the Serpent Shesha', artist: 'Chromolithograph, Mumbai', year: '1886' },
  'gwenjohn-convalescent.jpg': { title: 'The Convalescent', artist: 'Gwen John', year: 'c. 1923\u201324' },
  'barracoon.jpg':      { title: 'Barracoon', artist: 'Andrew Wyeth', year: '1976' },
  'caitlins-world.jpg': { title: 'Caitlin', artist: 'Andrew Wyeth', year: '1996' },
  'christinas.jpg':     { title: "Christina's World", artist: 'Andrew Wyeth', year: '1948', minH: 50 },
  'wyeth-adrift.jpg':   { title: 'Bonaparte Before the Sphinx', artist: 'Jean-Léon Gérôme', year: 'c. 1868' },
  'wyeth-maypole.jpg':  { title: 'Maypole', artist: 'Andrew Wyeth', year: '1972', minH: 48 },
  'dying-bird.jpg':     { title: 'Dead Bird', artist: '', year: '' },
  'hammershoi.jpg':     { title: 'Interior with a Woman', artist: 'Vilhelm Hammershøi', year: 'c. 1904' },
  'schjerfbeck-convalescent.jpg': { title: 'The Convalescent', artist: 'Helene Schjerfbeck', year: '1888' },
  'sohlberg-winternight.jpg': { title: 'Winter Night in the Mountains', artist: 'Harald Sohlberg', year: '1914' },
  'sickert-ennui.jpg':  { title: 'Ennui', artist: 'Walter Sickert', year: 'c. 1914', minH: 48 },
  'tagore-journeysend.jpg': { title: 'Journey\u2019s End', artist: 'Abanindranath Tagore', year: 'c. 1913', minH: 46 },
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
  'munch-deadmother.jpg': { title: 'The Dead Mother and the Child', artist: 'Edvard Munch', year: 'c. 1899', minH: 44 },
  'vonmax-anatom.jpg':  { title: 'The Anatomist', artist: 'Gabriel von Max', year: '1869', minH: 42 },
  'lautrec.jpg':        { title: 'La Toilette', artist: 'Henri de Toulouse-Lautrec', year: '1889' },
  'kollwitz.jpg':       { title: 'Woman with Dead Child', artist: 'Käthe Kollwitz', year: '1903' },
  'schiele.jpg':        { title: 'Death and the Maiden', artist: 'Egon Schiele', year: '1915' },
  'schiele2.jpg':       { title: 'The Embrace', artist: 'Egon Schiele', year: '1917' },
  'schiele-hermits.jpg': { title: 'The Hermits', artist: 'Egon Schiele', year: '1912' },
  'schiele-bentknee.jpg': { title: 'Seated Woman with Bent Knee', artist: 'Egon Schiele', year: '1917' },
  'peschka.jpg':        { title: 'Portrait of Anton Peschka', artist: 'Egon Schiele', year: '1909' },
  'labsinthe.jpg':      { title: "L'Absinthe", artist: 'Edgar Degas', year: 'c. 1876', minH: 46 },
  'degas-photographer.jpg': { title: 'Dancer Posing for a Photographer', artist: 'Edgar Degas', year: '1875' },
  'manet-bar.jpg':      { title: 'A Bar at the Folies-Bergère', artist: 'Édouard Manet', year: '1882', minH: 50 },
  'cezanne-cards.jpg':  { title: 'The Card Players', artist: 'Paul Cézanne', year: 'c. 1894', minH: 48 },
  'ensor.jpg':          { title: 'The Drunkards', artist: 'James Ensor', year: '1883', minH: 48 },
  'monet-parasol.jpg':  { title: 'Woman with a Parasol', artist: 'Claude Monet', year: '1875' },
  'monet-camille.jpg':  { title: 'Camille Monet on her Deathbed', artist: 'Claude Monet', year: '1879' },
  'malevich-redcavalry.jpg': { title: 'Red Cavalry Riding', artist: 'Kazimir Malevich', year: 'c. 1932', minH: 44 },
  'taeuberarp-verticalhorizontal.jpg': { title: 'Vertical-Horizontal Composition', artist: 'Sophie Taeuber-Arp', year: '1916' },
  'bellows-club.jpg':   { title: 'Club Night', artist: 'George Bellows', year: '1907', minH: 50 },
  'bellows-stag.jpg':   { title: "Stag at Sharkey's", artist: 'George Bellows', year: '1909', minH: 50 },
  'magritte.jpg':       { title: 'The Lovers', artist: 'René Magritte', year: '1928', minH: 46 },
  'magritte-assassin.jpg': { title: 'The Menaced Assassin', artist: 'Ren\u00e9 Magritte', year: '1927', minH: 40 },
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
  'vallotton-ballon.jpg':   { title: 'The Ball', artist: 'Félix Vallotton', year: '1899', minH: 46 },
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

export const STORIES = [
  { title: 'A Young Lady’s Photograph Album', kind: 'Short Story', venue: 'Substack', excerpt: 'The painter had lettered the board from hearing.', href: 'https://open.substack.com/pub/shanmuraja/p/a-young-ladys-photograph-album?r=1hai5c&utm_medium=web', latest: true, first: "The painter had lettered the board from hearing.", published: 'Oct 2026' },
  { title: 'To Get the Face Right', kind: 'Short Story', venue: 'Substack', excerpt: 'I drew a dick on a girl’s face one time.', href: 'https://open.substack.com/pub/shanmuraja/p/to-get-the-face-right?r=1hai5c&utm_medium=web', first: "I drew a dick on a girl’s face one time.", published: 'Oct 2026' },
  { title: 'How to Be Thanked', kind: 'Short Story', venue: 'Substack', excerpt: 'The onions were distractingly pungent. But he kept reading.', href: 'https://open.substack.com/pub/shanmuraja/p/how-to-be-thanked?r=1hai5c&utm_medium=web', first: "The onions were pungent.", published: 'Sep 2026' },
  { title: 'Burnt Red Tongues', kind: 'Historical Fiction', venue: 'Medium', excerpt: 'The fire came for the temple first, and the language second.', href: 'https://shanmuraja.medium.com/burnt-red-tongues-e5647e67d243', first: "Shall we try once more tonight?" },
  { title: 'Fugue State', kind: 'Short Story', venue: 'Unpublished', excerpt: 'She woke in a city she had never agreed to live in.' },
  { title: 'A Pound of Flesh', kind: 'Short Story', venue: 'Substack', excerpt: 'Everyone wanted their share, and the body was only so large.', href: 'https://open.substack.com/pub/shanmuraja/p/a-pound-of-flesh?r=1hai5c&utm_medium=web', first: "I did not leave home so much as get counted out.", published: 'Oct 2025' },
  { title: 'a boring call', kind: 'A Short', venue: 'Substack', excerpt: 'Nothing happened on the call, which was the whole of it.', href: 'https://open.substack.com/pub/shanmuraja/p/a-boring-call?r=1hai5c&utm_medium=web', first: "Arun stares blankly back at the mustache.", published: 'Feb 2026' },
  { title: 'The Sound and the Fury', kind: 'Essay · Legacy, ethics, and the cost of progress', venue: 'Medium', excerpt: 'Progress keeps a ledger, and someone always settles it.', href: 'https://shanmuraja.medium.com/the-sound-and-the-fury-b688bde9e526', first: "Clara usually loved the beach or the collection of pebbles that formed the rough shoreline where waves flirted and fought." },
  { title: 'Birds Do Not Sing in Caves', kind: 'Essay · Masculinity in medicine', venue: 'Medium', excerpt: 'They taught us to suture in silence, and to feel the same way.', href: 'https://shanmuraja.medium.com/birds-do-not-sing-in-caves-ef64cb65c790', first: "In the brutalist geometry of the ward, the doctor thought of the man with the green apple over his face." },
  { title: 'Young Boy Blues', kind: 'Essay · On caretaking', venue: 'Medium', excerpt: 'Caretaking is a love that arrives dressed as obligation.', href: 'https://shanmuraja.medium.com/young-boy-blues-0ce82e7971e0', first: "We were sitting in this lush backyard filled with lavender, poppies, mint, and an apple tree in the far-right corner.", published: 'Oct 2024' },
  { title: 'I’ve Gone to the Country Spa', kind: 'Essay · Psychiatry and heredity', venue: 'Medium', excerpt: 'Madness, in my family, was always discussed in the past tense.', href: 'https://shanmuraja.medium.com/ive-gone-to-the-country-spa-0b4313d7b8d7', first: "I never bathed in the Ganges like my granduncle.", published: 'Oct 2024' },
  { title: 'Jack of All Trades, Master of None', kind: 'Essay · Choosing a specialty', venue: 'Medium', excerpt: 'Every specialty asks you to amputate the others.', href: 'https://shanmuraja.medium.com/jack-of-all-trades-master-of-none-3e1be5a35d7b', first: "I was watching something special without realizing it in the moment.", published: 'Feb 2024' },
  { title: 'Sonder', kind: 'Essay · My time in India', venue: 'Medium', excerpt: 'In India, every passing stranger carried a life as vivid as my own.', href: 'https://shanmuraja.medium.com/sonder-c07feba361e0', first: "In the office, I pulled up the X-ray and the MRI of bilateral knees so the doctor could take a look.", published: 'Feb 2024' },
  { title: 'Do You Lift, Bro?', kind: 'Essay · My time in orthopedics', venue: 'Medium', excerpt: 'On the orthopedics ward, strength was both the question and the cure.', href: 'https://shanmuraja.medium.com/do-you-lift-bro-b2c620677895', first: "My hand surprisingly wasn’t shaking as I drew the blood from the patient.", published: 'Jun 2024' },
  { title: 'Got Your Toe!', kind: 'Essay · A skilled nursing facility', venue: 'Medium', excerpt: 'At the nursing home, the body keeps a longer memory than the mind.', href: 'https://shanmuraja.medium.com/got-your-toe-472b0e2a74cb', first: "The doctor and I walk down the long dreary-colored hallway, an indication that you’re in a hospital, a reason for the goosebumps and anxious memories many others have.", published: 'Aug 2023' },
]

export const STORY_PAINTING = {
  'A Young Lady’s Photograph Album': 'degas-photographer.jpg',
  'To Get the Face Right': 'peschka.jpg',
  'How to Be Thanked': 'sargent-dinner.jpg',
  'Burnt Red Tongues': 'vishnu-shesha.jpg',
  'Fugue State': 'automat.jpg',
  'A Pound of Flesh': 'vonmax-anatom.jpg',
  'a boring call': 'hopper-elevenam.jpg',
  'The Sound and the Fury': 'turner-rain.jpg',
  'Birds Do Not Sing in Caves': 'sargent-gassed.jpg',
  'Young Boy Blues': 'munch-sick.jpg',
  'I’ve Gone to the Country Spa': 'vangogh-oldman.jpg',
  'Jack of All Trades, Master of None': 'vangogh-ward.jpg',
  'Sonder': 'shergil-fruitvendors.jpg',
  'Do You Lift, Bro?': 'bellows-stag.jpg',
  'Got Your Toe!': 'schjerfbeck-convalescent.jpg',
}

const WHITE_PAPERS = [
  { title: 'Healthcare’s AI Trap', sub: 'AI automates them first, severing both supports at once.', authors: 'Shanmugesh Raja, MS', href: '/papers/ai-trap', doi: '10.2139/ssrn.7119078', pdf: '/papers/healthcares-ai-trap.pdf', kindLabel: 'White paper', venue: 'Economics' },
  { title: 'Mapping Medi-Cal Deserts in California', sub: 'Provider shortages, preventable hospitalizations, and the limits of workforce policy in Medi-Cal: an empirical study of California’s 58 counties, with five causal identification strategies and a portfolio policy response.', authors: 'Shanmugesh Raja', href: '/papers/medi-cal-deserts', pdf: '/papers/medi-cal-deserts.pdf', kindLabel: 'White paper · Master’s Thesis', venue: 'UCSF · Health Policy & Law · April 2026' },
]

// iteration 16: three drafts rendered from their own main.tex (scripts/build-texpapers.py -> src/data/texDocs/).
// Every string below is quoted or condensed from that paper's abstract/title block; nothing added.
const TEX_PAPERS = [
  { tex: 'cwm-cardiometabolic', title: 'Third-Party Cardiometabolic Outcomes in a GLP-1 Telehealth Cohort', authors: 'Shanmu Raja, MS', affil: 'Mochi Health',
    excerpt: 'With member consent we linked a U.S. telehealth obesity program to outside clinical records.',
    finding: 'Across the full diagnosed groups, systolic blood pressure fell 4.85 mmHg among 16,008 members with hypertension; these are paired changes, not causal effect estimates.',
    n: '49,896 paired of 417,307 members', date: '21 October 2026' },
  { tex: 'scheduled-jumps-fda', title: 'Scheduled Jumps: Recovering the Option-Implied Probability of FDA Approval', authors: 'Shanmu Raja, MS',
    excerpt: 'The options that trade into the decision carry the market’s probability that the drug is approved.',
    finding: 'All eight pending FDA decisions with a clear signal price the chance of approval below one-half, between 0.08 and 0.36.',
    n: '21 pending decisions; 8 with signal', date: '19 October 2026',
    supp: [{ label: 'Worked problem (PDF)', href: '/papers/scheduled-jumps-fda/worked_problem.pdf' }, { label: 'Derivations (PDF)', href: '/papers/scheduled-jumps-fda/derivations.pdf' }] },
  { tex: 'ai-human-care', title: 'The Doctor Will See You Now: Stakes, Verifiability, and the Supervision of Clinical AI', authors: 'Shanmu Raja, MS',
    excerpt: 'Which rung a decision belongs on is set by two properties of the decision, not by the technology.',
    finding: 'The task to automate first is the verifiable one, not the low-stakes one.',
    n: 'Theory paper', date: '18 October 2026' },
].map((p) => ({ ...p, kindLabel: 'Working paper', venue: 'Draft', status: 'Draft', sub: p.excerpt, pdf: `/papers/${p.tex}/main.pdf` }))

const BADGE_LABEL = { 'Pub.': 'Peer-reviewed', PDF: 'Preprint', WIP: 'Work in progress' }

export const AWARDS = [
  { kind: 'Shortlist', title: 'The New Yorker', desc: 'For the historical short fiction “Burnt Red Tongues.”', story: 'Burnt Red Tongues' },
  { kind: 'Shortlist', title: 'Paul Kalanithi Writing Competition', desc: 'Stanford’s national essay prize, in memory of the late neurosurgeon and author of When Breath Becomes Air.' },
  { kind: 'Winner', title: 'Massachusetts Undergraduate Poetry Festival', desc: 'First prize, statewide juried competition.' },
  { kind: 'Finalist', title: 'American College of Preventive Medicine', desc: 'Annual Meeting, Baltimore, MD. Selected abstract: Branded Wegovy™ vs. Compounded Semaglutide + Cyanocobalamin.', event: 'ACPM Annual Meeting 2026', paper: 'Branded Wegovy™ vs. Compounded Semaglutide + Cyanocobalamin' },
]

export const slugify = (t) => t.toLowerCase().normalize('NFKD').replace(/[’'™]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const fileBase = (src) => src.replace(/\.jpe?g$/i, '')
export function variantFor(src, cssWidthPx) {
  const d = DIMS[src]
  if (!d) return ''
  const dpr = Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 1.6)
  const need = cssWidthPx * dpr
  const w = d.widths.find((x) => x >= need) || d.widths[d.widths.length - 1]
  return `/paintings/${fileBase(src)}-${w}.webp`
}
export const aspectOf = (src) => { const d = DIMS[src]; return d ? Math.max(0.62, Math.min(1.45, d.w / d.h)) : 0.75 }
export const placeholderOf = (src) => { const c = COLORS[src] && COLORS[src][0]; return c ? `rgb(${c.join(',')})` : '#e9e6df' }
const P = [244, 243, 240]
export const tintOf = (src, k = 0.1) => {
  const c = (COLORS[src] && (COLORS[src][1] || COLORS[src][0])) || null
  if (!c) return `rgb(${P.join(',')})`
  return `rgb(${P.map((v, j) => Math.round(v * (1 - k) + c[j] * k)).join(',')})`
}
export const creditText = (src) => { const m = META[src]; return m && m.title ? [m.title, m.artist, m.year].filter(Boolean).join(', ') : '' }
export const PAINTINGS = Object.keys(META).filter((k) => DIMS[k])

const prose = STORIES.map((s) => {
  const src = STORY_PAINTING[s.title]
  const kind = s.kind.split(' · ')[0]
  return {
    cat: 'prose', slug: slugify(s.title), title: s.title, src, kind,
    subject: s.kind.includes(' · ') ? s.kind.split(' · ')[1] : '',
    by: [s.venue, s.published].filter(Boolean).join(' · '),
    line: s.first || '', quote: s.first || '',
    href: s.href || null, cta: s.href ? `Read on ${s.venue}` : 'Not yet published',
    meta: [['Kind', s.kind.replace(' · ', ', ')], ['Venue', s.venue], ['Published', s.published], ['Painting', creditText(src)]],
  }
})
const pubs = [...PAPERS.map((p) => ({ ...p, kindLabel: BADGE_LABEL[p.badge] || p.badge })), ...WHITE_PAPERS, ...TEX_PAPERS].map((p) => {
  const href = p.href ? p.href.replace(/^\/papers\/(ai-trap|medi-cal-deserts)$/, '/papers/$1.html') : p.doi ? `https://doi.org/${p.doi}` : null
  return {
    cat: 'publications', slug: slugify(p.title), title: p.title, src: null, kind: p.kindLabel,
    by: p.kindLabel, line: p.sub, quote: p.sub, cover: p.doiVia || p.venue || p.kindLabel,
    authors: p.authors, doi: p.doi, pdf: p.pdf, venueFull: p.venue || (p.doiVia === 'medRxiv' ? 'medRxiv preprint' : p.badge === 'Pub.' ? p.sub : null),
    pdfDoc: !!(p.href && p.href.endsWith('.pdf')),
    pdfPath: p.pdf || (p.href && p.href.endsWith('.pdf') ? p.href : null),
    finding: (FINDINGS[p.title] || ABSTRACTS[p.title] || {}).finding || '', n: (FINDINGS[p.title] || ABSTRACTS[p.title] || {}).n || '',
    ab: ABSTRACTS[p.title] || null, excerpt: (ABSTRACTS[p.title] || {}).excerpt || '',
    href, cta: !href ? 'In preparation' : p.href && p.href.endsWith('.pdf') ? 'Open the PDF' : p.href ? 'Read the white paper' : `Read via DOI`,
    ...(p.tex ? { tex: p.tex, affil: p.affil, date: p.date, status: p.status, supp: p.supp, finding: p.finding, n: p.n, excerpt: p.excerpt, venueFull: null, href: p.pdf, cta: 'Read the paper' } : {}),
    meta: [['Kind', p.kindLabel], ['Authors', p.authors], ['Venue', (ABSTRACTS[p.title] || {}).journal || p.doiVia || p.venue], ['DOI', p.doi]],
  }
})
// wheel meta stays two rows (Kind, Authors + affiliation) so it clears the card stack; date and status are on the card back and the page
pubs.forEach((x) => { if (x.tex) x.meta = x.meta.filter(([k]) => k === 'Kind' || k === 'Authors').map(([k, v]) => [k, k === 'Authors' && x.affil ? `${v} · ${x.affil}` : v]) })
const luck = AWARDS.map((a) => {
  const st = a.story && prose.find((x) => x.title === a.story)
  const pp = a.paper && pubs.find((x) => x.title === a.paper)
  return {
    cat: 'luck', slug: slugify(a.title), title: a.title, src: st ? st.src : null, kind: a.kind,
    by: a.kind, line: a.desc, quote: a.desc, cover: a.kind,
    href: st ? st.href : null, cta: st ? `Read “${st.title}” on Medium` : pp ? 'See the abstract' : '',
    internal: pp ? `#/publications/${pp.slug}` : null,
    // iteration 12: the piece this recognition belongs to, linked from the Luck page and card back
    related: st ? { href: `#/prose/${st.slug}`, title: st.title, kind: st.kind } : pp ? { href: `#/publications/${pp.slug}`, title: pp.title, kind: 'Abstract' } : null,
    event: a.event || '',   // only where the repo states it (ACPM: "ACPM 2026 Finalist", src/data/papers.js)
    meta: [['Recognition', a.kind], ['Painting', st ? creditText(st.src) : '']],
  }
})
// any piece with a matching Luck award shows its recognition on its own page
const HONOR = { Shortlist: 'Shortlisted by', Finalist: 'Finalist at', Winner: 'Winner,' }
AWARDS.forEach((a, n) => {
  const it = (a.story && prose.find((x) => x.title === a.story)) || (a.paper && pubs.find((x) => x.title === a.paper))
  if (!it) return
  const text = `${HONOR[a.kind] || `${a.kind},`} ${a.title}`
  ;(it.honors = it.honors || []).push({ text, href: `#/luck/${luck[n].slug}` })
  it.meta.splice(1, 0, ['Recognition', text])
})
export const CATS = [
  { id: 'prose', label: 'Prose', items: prose },
  { id: 'publications', label: 'Publications', items: pubs },
  { id: 'luck', label: 'Luck', items: luck },
  // iteration 18: Deep Dives, the economics takes. Only the two white papers qualify from the data:
  // Healthcare's AI Trap (venue "Economics") and the Medi-Cal deserts thesis (UCSF Health Policy & Law,
  // workforce economics). Same records as in Publications, so each opens its own white-paper page.
  { id: 'deep', label: 'Deep Dives', items: pubs.filter((x) => /^White paper/.test(x.kind || '')).map((x) => ({ ...x, cat: 'deep' })) },
]
// iteration 12: the home carousel, a hand-picked mix across sections (edit src/selected.js)
const all = [...prose, ...pubs, ...luck]
export const SELECTED_ITEMS = SELECTED.map((k) => all.find((x) => `${x.cat}/${x.slug}` === k)).filter(Boolean)
export const SOCIALS = [
  ['Medium', 'https://shanmuraja.medium.com/'],
  ['Substack', 'https://shanmuraja.substack.com/'],
  ['Instagram', 'https://instagram.com/shanmuraja_'],
  ['LinkedIn', 'https://www.linkedin.com/in/shanmuraja'],
]
