/* A publication opened as a white paper. Three sources, all from the repo:
   1. the two hand-built papers (AI Trap, Medi-Cal) mounted in place,
   2. the four medRxiv PDFs, extracted to paperDocs.json + figure crops by a script,
   3. everything else: a typeset partial page with what we hold and a link to the full paper. */
import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'

const EMBED = {
  'healthcares-ai-trap': lazy(() => import('./pages/AiTrap.jsx')),
  'mapping-medi-cal-deserts-in-california': lazy(() => import('./pages/MediCal.jsx')),
}
let DOCS = null
const loadDocs = () => DOCS || (DOCS = import('./data/paperDocs.json').then((m) => m.default))

const plain = (x) => x.runs.map((r) => r[1]).join('')
function Runs({ runs }) {
  return runs.map(([k, t], n) => k === 'b' ? <strong key={n}>{t}</strong> : k === 'i' ? <em key={n}>{t}</em> : k === 'sup' ? <sup key={n}>{t}</sup> : <React.Fragment key={n}>{t}</React.Fragment>)
}
const sentences = (s) => s.split(/(?<!\b[A-Z]\.)(?<=[.;])\s+(?=[A-Z(])/).map((x) => x.trim()).filter(Boolean)

function shape(flow) {
  const abstract = [], secs = []
  let cur = null
  for (const x of flow) {
    if (x.t === 'h' && x.lvl === 1) {
      if (x.text === 'Abstract') { cur = { abstract: true }; continue }
      cur = { id: `s${secs.length + 1}`, title: x.text, items: [] }; secs.push(cur); continue
    }
    if (cur && cur.abstract) { if (x.t === 'p') abstract.push(x); continue }
    if (cur) cur.items.push(x)
  }
  const parts = abstract.map((p) => {
    const lead = p.runs[0] && p.runs[0][0] === 'b' ? p.runs[0][1].replace(/[.:]\s*$/, '') : ''
    return { lead, runs: lead ? p.runs.slice(1) : p.runs, text: lead ? plain({ runs: p.runs.slice(1) }) : plain(p) }
  })
  return { parts, secs }
}

function useSpy(ids) {
  const [on, setOn] = useState(ids[0])
  useEffect(() => {
    const pick = () => {
      let a = ids[0]
      for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.3) a = id }
      setOn(a)
    }
    pick()
    window.addEventListener('scroll', pick, { passive: true })
    return () => window.removeEventListener('scroll', pick)
  }, [ids])
  return on
}
function Progress() {
  const ref = useRef(null)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (ref.current) ref.current.style.transform = `scaleX(${h > 0 ? Math.min(1, window.scrollY / h) : 0})`
    }
    on(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return <div className="wp-progress" aria-hidden="true"><i ref={ref} /></div>
}
// subtle reveal as blocks enter; nothing moves with reduced motion (CSS)
function useReveal(root, dep) {
  useEffect(() => {
    const el = root.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    el.querySelectorAll('.wp-rv').forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [root, dep])
}
const jump = (e) => {
  const a = e.target.closest && e.target.closest('a[href^="#"]')
  if (!a) return
  const h = a.getAttribute('href')
  if (h.startsWith('#/')) return
  const t = document.getElementById(decodeURIComponent(h.slice(1)))
  if (!t) return
  e.preventDefault()
  t.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
}

function Toc({ secs, on }) {
  return (
    <nav className="wp-toc" aria-label="Contents">
      <p className="wp-label">Contents</p>
      <ol>
        {secs.map((s) => <li key={s.id}><a href={`#${s.id}`} className={on === s.id ? 'is-on' : undefined}>{s.title}</a></li>)}
      </ol>
    </nav>
  )
}

function Block({ x }) {
  if (x.t === 'h') return <h3 className="wp-h3 wp-rv">{x.text}</h3>
  if (x.t === 'fig') {
    const cap = <figcaption><b>{x.kind} {x.n}.</b> {x.cap}</figcaption>
    return (
      <figure className={`wp-fig wp-rv wp-${x.kind.toLowerCase()}`} id={`${x.kind[0].toLowerCase()}${x.n}`}>
        {x.kind === 'Table' && cap}
        <div className="wp-fig-in"><img src={x.src} width={x.w} height={x.h} alt={`${x.kind} ${x.n}: ${x.cap}`} loading="lazy" decoding="async" /></div>
        {x.kind === 'Figure' && cap}
      </figure>
    )
  }
  if (x.t === 'ref') return null
  return <p className="wp-p"><Runs runs={x.runs} /></p>
}

function PdfBody({ slug, it }) {
  const [doc, setDoc] = useState(null)
  useEffect(() => { let live = true; loadDocs().then((d) => { if (live) setDoc(d[slug]) }); return () => { live = false } }, [slug])
  const s = useMemo(() => doc ? shape(doc.flow) : null, [doc])
  const ids = useMemo(() => s ? ['abstract', ...s.secs.map((x) => x.id)] : [], [s])
  const on = useSpy(ids)
  const root = useRef(null)
  useReveal(root, s)
  if (!s) return <div className="wp-loading" aria-busy="true" />
  const results = s.parts.find((p) => /^Results?$/i.test(p.lead))
  const rest = s.parts.filter((p) => p !== results)
  const toc = [{ id: 'abstract', title: 'Abstract' }, ...s.secs]
  return (
    <div className="wp-grid" ref={root}>
      <Toc secs={toc} on={on} />
      <div className="wp-main">
        <section id="abstract" className="wp-sec wp-abstract">
          <h2 className="wp-h2">Abstract</h2>
          {rest.map((p) => <p key={p.lead} className="wp-p wp-rv">{p.lead && <span className="wp-sc">{p.lead}</span>} <Runs runs={p.runs} /></p>)}
          {results && (
            <aside className="wp-key wp-rv" aria-label="Key findings">
              <p className="wp-label">Key findings <small>from the abstract</small></p>
              <ol>{sentences(results.text).map((t) => <li key={t}>{t}</li>)}</ol>
            </aside>
          )}
        </section>
        {s.secs.map((sec) => {
          const refs = sec.items.filter((x) => x.t === 'ref').flatMap((x) => x.text.split(/\s(?=\[\d+\]\s)/))
          return (
            <section key={sec.id} id={sec.id} className="wp-sec">
              <h2 className="wp-h2 wp-rv">{sec.title}</h2>
              {sec.items.map((x, n) => <Block key={n} x={x} />)}
              {refs.length > 0 && <ol className="wp-refs">{refs.map((r) => { const m = r.match(/^\[(\d+)\]\s*(.*)$/); return <li key={r} value={m ? +m[1] : undefined}>{m ? m[2] : r}</li> })}</ol>}
            </section>
          )
        })}
        <p className="wp-src">Text, figures and tables are taken from the preprint PDF{it.doi ? ` (medRxiv, doi ${it.doi})` : ''}. The PDF is the version of record for this page.</p>
      </div>
    </div>
  )
}

function Partial({ it }) {
  const ab = it.ab || {}
  const wip = !it.href
  const parts = ab.abstract || []
  const results = parts.find(([l]) => /^Results?$/i.test(l))
  const toc = parts.length ? [{ id: 'abstract', title: 'Abstract' }, results && { id: 'key', title: 'Key points' }, { id: 'cite', title: 'Citation' }].filter(Boolean) : []
  const on = useSpy(useMemo(() => toc.map((t) => t.id), [toc.length]))  // eslint-disable-line react-hooks/exhaustive-deps
  if (!parts.length) return (
    <div className="wp-grid wp-partial">
      <div className="wp-toc" />
      <div className="wp-main">
        <section className="wp-sec" id="summary">
          {it.line && it.line !== it.venueFull && <><h2 className="wp-h2">Summary</h2><p className="wp-p wp-lede">{it.line}</p></>}
          <aside className="wp-key">
            <p className="wp-label">{wip ? 'In preparation' : 'Full paper'}</p>
            <p className="wp-p">{wip ? 'This study is in preparation. No abstract has been published yet; it will appear here once it is out.' : 'The full text is published with the journal.'}</p>
            {ab.status && <p className="wp-p">{ab.status}{ab.statusHref && <> <a href={ab.statusHref} target="_blank" rel="noreferrer">Journal listing ↗</a></>}</p>}
            {it.href && <a className="wp-btn" href={it.href} target="_blank" rel="noreferrer">Full paper{it.doi ? ` · doi ${it.doi}` : ''} <b aria-hidden="true">↗</b></a>}
          </aside>
        </section>
      </div>
    </div>
  )
  return (
    <div className="wp-grid">
      <Toc secs={toc} on={on} />
      <div className="wp-main">
        <section id="abstract" className="wp-sec wp-abstract">
          <h2 className="wp-h2">Abstract</h2>
          {ab.fullTitle && ab.fullTitle !== it.title && <p className="wp-p wp-lede">{ab.fullTitle}</p>}
          {parts.map(([lead, text]) => <p key={lead} className="wp-p">{lead && <span className="wp-sc">{lead}</span>} {text}</p>)}
          {ab.keywords && <p className="wp-p wp-kw"><span className="wp-sc">Keywords</span> {ab.keywords.join(' · ')}</p>}
        </section>
        {results && (
          <section id="key" className="wp-sec">
            <aside className="wp-key" aria-label="Key points">
              <p className="wp-label">Key points <small>from the abstract</small></p>
              <ol>{sentences(results[1]).map((t) => <li key={t}>{t}</li>)}</ol>
            </aside>
          </section>
        )}
        <section id="cite" className="wp-sec">
          <h2 className="wp-h2">Citation</h2>
          <p className="wp-p">{ab.authors || it.authors}. {ab.fullTitle || it.title}. <em>{ab.cite || it.venueFull}</em>.{it.doi && <> doi:<a href={`https://doi.org/${it.doi}`} target="_blank" rel="noreferrer">{it.doi}</a></>}{ab.pmid && <> · PMID <a href={`https://pubmed.ncbi.nlm.nih.gov/${ab.pmid}/`} target="_blank" rel="noreferrer">{ab.pmid}</a></>}</p>
          {it.href && <p><a className="wp-btn" href={it.href} target="_blank" rel="noreferrer">Read at the journal <b aria-hidden="true">↗</b></a></p>}
        </section>
        <p className="wp-src">{ab.source} Only the published abstract is shown here; the full text is with the publisher.</p>
      </div>
    </div>
  )
}

function Embedded({ slug }) {
  const C = EMBED[slug]
  return (
    <div className="wp-embed" onClickCapture={jump}>
      <Suspense fallback={<div className="wp-loading" aria-busy="true" />}><C /></Suspense>
    </div>
  )
}


export default function PaperPage({ it, top, cover, nav, honors }) {
  const kind = EMBED[it.slug] ? 'embed' : it.pdfDoc ? 'pdf' : 'partial'
  const stat = (it.line || '').match(/(\d{1,3}(?:,\d{3})+)[- ]patient/)
  const links = [
    it.pdf && { label: 'PDF', href: it.pdf },
    it.href && it.href.endsWith('.pdf') && { label: 'PDF', href: it.href },
    !it.pdf && !(it.href && it.href.endsWith('.pdf')) && it.href && { label: it.doi ? 'Full paper' : 'Read', href: it.href },
  ].filter(Boolean)
  return (
    <article className={`pg wp wp-${kind}`} onClickCapture={kind === 'pdf' ? jump : undefined}>
      <Progress />
      {top}
      <header className="wp-head">
        <div className="wp-cover">{cover}</div>
        <div className="wp-title">
          <p className="wp-kicker">{it.venueFull || it.cover ? it.kind : [it.kind, it.cover].filter(Boolean).join(' · ')}</p>
          <h1>{it.title}</h1>
          {kind !== 'partial' && it.line && <p className="wp-deck">{it.line}</p>}
          <dl className="wp-facts">
            {it.authors && <div><dt>Authors</dt><dd>{it.authors}</dd></div>}
            {(it.venueFull || it.cover) && <div><dt>Venue</dt><dd>{(it.ab && it.ab.cite) || it.venueFull || it.cover}</dd></div>}
            {it.doi && <div><dt>DOI</dt><dd><a href={`https://doi.org/${it.doi}`} target="_blank" rel="noreferrer">{it.doi}</a></dd></div>}
          </dl>
          {honors}
          {stat && <p className="wp-stat"><b>{stat[1]}</b><span>patients in the cohort</span></p>}
          {links.length > 0 && <p className="wp-links">{links.map((l) => <a key={l.label} href={l.href} target="_blank" rel="noreferrer">{l.label} <b aria-hidden="true">↗</b></a>)}</p>}
        </div>
      </header>
      {kind === 'embed' ? <Embedded slug={it.slug} /> : kind === 'pdf' ? <PdfBody slug={it.slug} it={it} /> : <Partial it={it} />}
      {nav}
    </article>
  )
}
