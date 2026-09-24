/* Bakes the React output into dist HTML so crawlers that do not run JS still see the text. */
const http = require('http')
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

const DIST = path.resolve(__dirname, '..', 'dist')
const PORT = 4711

const ROUTES = [
  { url: '/', file: 'index.html' },
  { url: '/papers/', file: 'papers/index.html' },
  { url: '/papers/ai-trap', file: 'papers/ai-trap.html', md: 'papers/ai-trap.md' },
  { url: '/papers/medi-cal-deserts', file: 'papers/medi-cal-deserts.html', md: 'papers/medi-cal-deserts.md' },
]

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml', '.map': 'application/json',
  '.pdf': 'application/pdf', '.txt': 'text/plain', '.bin': 'application/octet-stream',
}

/* mirrors the Cloudflare clean-URL behaviour so the pages resolve the same way they do in production */
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0])
  if (clean === '/' ) return path.join(DIST, 'index.html')
  if (clean === '/papers' || clean === '/papers/') return path.join(DIST, 'papers/index.html')
  const direct = path.join(DIST, clean)
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct
  if (!/\.[a-z0-9]+$/i.test(clean)) {
    const asHtml = path.join(DIST, clean + '.html')
    if (fs.existsSync(asHtml)) return asHtml
  }
  return null
}

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const file = resolveFile(req.url)
      if (!file) { res.writeHead(404); res.end('not found'); return }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' })
      fs.createReadStream(file).pipe(res)
    })
    server.listen(PORT, () => resolve(server))
  })
}

const TO_MARKDOWN = () => {
  const sel = [
    'h1.pp-title', '.pp-deck', '.pp-byline',
    '.pp-abstract .pp-label', '.pp-abstract p',
    'h2.pp-h2', 'p.pp-h2-sub', 'h3.pp-h3', 'p.pp-p',
    '.pp-eq', '.pp-cap', 'ol.pp-list', 'table.pp-t', '.pp-aside', '.pp-stat',
  ].join(',')
  /* textContent glues adjacent elements together, so break on <br> and block children first */
  const txt = (e) => {
    const c = e.cloneNode(true)
    for (const br of c.querySelectorAll('br')) br.replaceWith(' ')
    for (const blk of c.querySelectorAll('p,div,li,h1,h2,h3,h4,h5,h6')) blk.append(' ')
    return c.textContent.replace(/\s+/g, ' ').trim()
  }
  const out = []
  for (const e of document.querySelectorAll(sel)) {
    if (e.closest('.pp-toc')) continue
    if (e.matches('h1.pp-title')) out.push('# ' + txt(e))
    else if (e.matches('.pp-deck')) out.push('**' + txt(e) + '**')
    else if (e.matches('.pp-byline')) out.push([...e.children].map(txt).join('  \n'))
    else if (e.matches('.pp-abstract .pp-label')) out.push('## ' + txt(e))
    else if (e.matches('h2.pp-h2')) out.push('## ' + txt(e))
    else if (e.matches('p.pp-h2-sub')) out.push('*' + txt(e) + '*')
    else if (e.matches('h3.pp-h3')) out.push('### ' + txt(e))
    else if (e.matches('.pp-eq')) out.push('```\n' + txt(e) + '\n```')
    else if (e.matches('.pp-cap')) out.push('*' + txt(e) + '*')
    else if (e.matches('ol.pp-list')) out.push([...e.querySelectorAll('li')].map((li) => {
      const n = li.querySelector('.pp-li-n'); const n0 = n ? txt(n) : ''
      const body = [...li.children].filter((c) => c !== n).map(txt).join(' ') || txt(li)
      return (/^\d/.test(n0) ? n0 + ' ' : '- ') + body
    }).join('\n'))
    else if (e.matches('table.pp-t')) {
      const rows = [...e.querySelectorAll('tr')].map((tr) => [...tr.children].map(txt))
      if (!rows.length) continue
      const w = rows[0].length
      out.push([`| ${rows[0].join(' | ')} |`, `| ${Array(w).fill('---').join(' | ')} |`,
        ...rows.slice(1).map((r) => `| ${r.join(' | ')} |`)].join('\n'))
    }
    else if (e.matches('.pp-aside')) {
      const k = e.querySelector('.pp-aside-k')
      const t = e.querySelector('.pp-aside-t span:first-child')
      const body = e.querySelector('.pp-aside-body')
      const head = [k && txt(k), t && txt(t)].filter(Boolean).join(': ')
      const paras = body ? [...body.querySelectorAll('p')].map(txt).filter(Boolean) : []
      const lines = paras.length ? paras : (body ? [txt(body)] : [])
      out.push([head && '> ' + head, ...lines.map((l) => '> ' + l)].filter(Boolean).join('\n>\n'))
    }
    else if (e.matches('.pp-stat')) {
      const n = e.querySelector('.pp-stat-n'); const l = e.querySelector('.pp-stat-l')
      const nv = n ? (n.dataset.n || txt(n)) : ''
      out.push('- ' + [nv, l && txt(l)].filter(Boolean).join(' \u2014 '))
    }
    else out.push(txt(e))
  }
  return out.filter(Boolean).join('\n\n')
}

;(async () => {
  const server = await serve()
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1000 })

  for (const r of ROUTES) {
    await page.goto(`http://127.0.0.1:${PORT}${r.url}`, { waitUntil: 'networkidle0' })
    await page.waitForFunction(() => {
      const root = document.getElementById('root')
      return root && root.children.length > 0
    }, { timeout: 20000 })
    await page.evaluate(() => document.fonts && document.fonts.ready)

    const html = await page.evaluate(() => {
      for (const n of document.querySelectorAll('.pp-stat-n[data-n]')) n.textContent = n.dataset.n
      return document.getElementById('root').innerHTML
    })
    const target = path.join(DIST, r.file)
    const src = fs.readFileSync(target, 'utf8')
    const marker = '<div id="root"></div>'
    if (!src.includes(marker)) throw new Error(`no empty #root to fill in ${r.file}`)
    fs.writeFileSync(target, src.replace(marker, `<div id="root">${html}</div>`))

    let note = ''
    if (r.md) {
      const md = await page.evaluate(TO_MARKDOWN)
      const canonical = 'https://shanmuraja.com' + r.url
      fs.writeFileSync(path.join(DIST, r.md), `${md}\n\n---\n\nCanonical version: ${canonical}\n`)
      note = `, ${(md.length / 1024).toFixed(0)}kb md`
    }
    console.log(`  ${r.url} -> ${(html.length / 1024).toFixed(0)}kb html${note}`)
  }

  await browser.close()
  server.close()
})().catch((e) => { console.error(e); process.exit(1) })
