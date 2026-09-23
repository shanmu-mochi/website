/* Renders the share cards. Run with `npm run og` after changing a paper title. */
const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

const CARDS = [
  { out: 'ai-trap.png', eyebrow: 'Working paper · Health economics', title: "Healthcare’s<br>AI Trap", deck: 'Automating routine care is efficient. The way a market captures that gain is what defunds complex care.' },
  { out: 'medi-cal-deserts.png', eyebrow: 'Master’s thesis · UCSF Health Policy and Law', title: 'Mapping<br>Medicaid Deserts', deck: 'Eleven California counties where 1.7 million people hold a Medi-Cal card and cannot reliably find a doctor.' },
  { out: 'papers.png', eyebrow: 'Research', title: 'Papers', deck: 'Clinical research, health economics, and policy.' },
]

const FONT = fs.readFileSync(path.join(__dirname, '..', 'public', 'fonts', 'inter-latin.woff2')).toString('base64')

const html = (c) => `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: 'Inter'; src: url(data:font/woff2;base64,${FONT}) format('woff2'); font-weight: 400 700; }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    background: #fdfcfa; color: #0b0b0b; padding: 72px 80px;
    font-family: 'Palatino', 'Palatino Linotype', Georgia, serif;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .eyebrow { font-family: 'Inter', sans-serif; font-size: 19px; text-transform: uppercase; letter-spacing: 0.2em; color: #8c8c8c; }
  h1 { font-size: 104px; line-height: 0.94; letter-spacing: -0.04em; text-transform: uppercase; }
  .deck { font-size: 26px; line-height: 1.45; color: #3a3a3a; max-width: 780px; }
  footer { display: flex; align-items: flex-end; justify-content: space-between; border-top: 3px solid #0b0b0b; padding-top: 22px; }
  .who { font-size: 27px; }
  .dom { font-family: 'Inter', sans-serif; font-size: 18px; letter-spacing: 0.14em; text-transform: uppercase; color: #8c8c8c; }
</style>
<div><div class="eyebrow">${c.eyebrow}</div><h1 style="margin-top:34px">${c.title}</h1></div>
<div class="deck">${c.deck}</div>
<footer><div class="who">Shanmu Raja</div><div class="dom">shanmuraja.com</div></footer>`

;(async () => {
  const b = await puppeteer.launch({ args: ['--no-sandbox'] })
  const p = await b.newPage()
  await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
  for (const c of CARDS) {
    await p.setContent(html(c), { waitUntil: 'load' })
    await p.evaluate(() => document.fonts.ready)
    const file = path.join(__dirname, '..', 'public', 'og', c.out)
    await p.screenshot({ path: file })
    console.log('wrote', path.relative(process.cwd(), file), (fs.statSync(file).size / 1024).toFixed(0) + ' KB')
  }
  await b.close()
})()
