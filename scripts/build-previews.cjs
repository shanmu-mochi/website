/* Real mobile renderings of each linked story, captured ONCE (idempotent cache).
   Substack (CSP frame-ancestors) and Medium (X-Frame-Options: SAMEORIGIN) refuse iframes,
   so the Stories phone shows these screenshots. Re-run `npm run previews` to fetch only missing
   files; delete public/story-previews/<slug>.webp (or pass --force) to refresh one. */
const fs = require('fs'), path = require('path')
const sharp = require('sharp')
const src = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf8')
const block = src.slice(src.indexOf('const STORIES = ['), src.indexOf(']', src.indexOf('const STORIES = [')))
const hrefs = [...block.matchAll(/href: '([^']+)'/g)].map((m) => m[1])
const OUT = path.join(__dirname, '../public/story-previews')
const slugOf = (h) => new URL(h).pathname.split('/').filter(Boolean).pop()
const force = process.argv.includes('--force')
;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const todo = hrefs.filter((h) => force || !fs.existsSync(path.join(OUT, slugOf(h) + '.webp')))
  if (!todo.length) return console.log('story previews: all cached')
  const puppeteer = require('puppeteer')
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] })
  let fail = 0
  for (const h of todo) {
    const slug = slugOf(h)
    const page = await browser.newPage()
    try {
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
      const url = h.replace(/^https:\/\/open\.substack\.com\/pub\/(\w+)\/p\/([^?]+).*/, 'https://$1.substack.com/p/$2').replace(/\?.*$/, '')
      const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 })
      if (!res || res.status() >= 400) throw new Error('HTTP ' + (res && res.status()))
      await new Promise((r) => setTimeout(r, 1500))
      // walk the page so lazy images (the hero) load at their real size, then return to the top
      await page.evaluate(async () => { for (let y = 0; y < 844 * 4; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)) } window.scrollTo(0, 0) })
      await new Promise((r) => setTimeout(r, 1200))
      // drop cookie banners / subscribe modals / fixed bars (hidden, not made static, so they leave no gap)
      await page.evaluate(() => {
        document.querySelectorAll('[role=dialog],[aria-modal=true],.modal,.cookie-banner,[class*="Cookie"],[class*="paywall"]').forEach((e) => e.remove())
        document.querySelectorAll('body *').forEach((e) => { const p = getComputedStyle(e).position; if (p === 'fixed') e.style.display = 'none'; else if (p === 'sticky') e.style.position = 'relative' })
        document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'auto'
        window.scrollTo(0, 0)
      })
      const png = await page.screenshot({ fullPage: true, captureBeyondViewport: true })
      // cap at ~3 phone-screens of article: enough to read the opening, small enough to ship
      const img = sharp(png, { limitInputPixels: false }); const m = await img.metadata()
      await img.extract({ left: 0, top: 0, width: m.width, height: Math.min(m.height, 844 * 2 * 3) })
        .webp({ quality: 72 }).toFile(path.join(OUT, slug + '.webp'))
      console.log('captured', slug)
    } catch (e) { fail++; console.log('FAILED', slug, e.message) }
    await page.close()
  }
  await browser.close()
  if (fail) console.log(fail + ' failed (re-run to retry)')
})()
