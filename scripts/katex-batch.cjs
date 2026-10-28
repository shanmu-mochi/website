// reads [{tex, display}] JSON on stdin, writes [{html, err}] — KaTeX prerender for the tex papers
const katex = require('katex')
const xs = JSON.parse(require('fs').readFileSync(0, 'utf8'))
const macros = { '\\sign': '\\operatorname{sign}' }
const out = xs.map(({ tex, display }) => {
  try { return { html: katex.renderToString(tex, { displayMode: display, throwOnError: true, output: 'html', macros, strict: 'ignore', trust: false }) } }
  catch (e) { return { html: katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html', macros, strict: 'ignore' }), err: String(e.message) } }
})
process.stdout.write(JSON.stringify(out))
