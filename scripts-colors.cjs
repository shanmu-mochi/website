// Extract a dominant-color palette (top 6 RGB colors) for every painting,
// so the gallery can order them for color cohesion. Auto-writes src/colorsData.js.
const puppeteer = require('puppeteer')
const fs = require('fs'), path = require('path')
const dir = path.join(__dirname, 'public', 'paintings')
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f))
;(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
  const p = await b.newPage()
  const out = {}
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f))
    const src = 'data:image/jpeg;base64,' + buf.toString('base64')
    try {
      out[f] = await p.evaluate(async (src) => {
        const img = new Image(); img.src = src; await img.decode()
        const S = 56, c = document.createElement('canvas'); c.width = S; c.height = S
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, S, S)
        const d = ctx.getImageData(0, 0, S, S).data, bins = {}
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], bl = d[i + 2]
          const k = (r >> 5) + ',' + (g >> 5) + ',' + (bl >> 5)   // 8 levels/channel
          const o = bins[k] || (bins[k] = { n: 0, r: 0, g: 0, b: 0 })
          o.n++; o.r += r; o.g += g; o.b += bl
        }
        return Object.values(bins).sort((a, b) => b.n - a.n).slice(0, 6)
          .map((o) => [Math.round(o.r / o.n), Math.round(o.g / o.n), Math.round(o.b / o.n)])
      }, src)
    } catch (e) { out[f] = [] }
  }
  await b.close()
  fs.writeFileSync(path.join(__dirname, 'src', 'colorsData.js'),
    '// auto-generated dominant palettes — top 6 colors [r,g,b] per painting\nexport default ' + JSON.stringify(out) + '\n')
  console.log('wrote palettes for', Object.keys(out).length, 'paintings')
})().catch((e) => { console.error(e.message); process.exit(1) })
