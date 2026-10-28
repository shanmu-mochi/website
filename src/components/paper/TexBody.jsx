/* Iteration 16: the three draft papers, rendered from their own main.tex by scripts/build-texpapers.py.
   Math is prerendered with KaTeX at build time (no runtime KaTeX, no CDN); only its CSS + fonts ship, in this lazy chunk. */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import 'katex/dist/katex.min.css'
import '../../styles/tex.css'
import { Toc } from '../../PaperPage.jsx'
import { useSpy, useReveal, sentences } from '../../lib/wpHooks.js'

const LOAD = import.meta.glob('../../data/texDocs/*.json', { import: 'default' })
const Html = ({ html, className, as = 'div' }) => React.createElement(as, { className, dangerouslySetInnerHTML: { __html: html } })
const plain = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim() }

export default function TexBody({ tex }) {
  const [doc, setDoc] = useState(null)
  useEffect(() => { let live = true; LOAD[`../../data/texDocs/${tex}.json`]().then((d) => { if (live) setDoc(d) }); return () => { live = false } }, [tex])
  const toc = useMemo(() => doc ? [{ id: 'abstract', title: 'Abstract' }, ...doc.secs.map((s) => ({ id: s.id, title: s.n ? `${s.n}. ${s.title}` : s.title })),
    ...(doc.notes.length ? [{ id: 'tx-notes', title: 'Notes' }] : []), ...(doc.refs ? [{ id: 'tx-refs', title: 'References' }] : [])] : [], [doc])
  const ids = useMemo(() => toc.map((t) => t.id), [toc])
  const on = useSpy(ids)
  const root = useRef(null)
  useReveal(root, doc)
  if (!doc) return <div className="wp-loading" aria-busy="true" />
  const key = doc.key ? (doc.keySplit ? doc.key.flatMap((k) => sentences(plain(k))) : doc.key) : []
  const f = doc.frame
  return (
    <div className="wp-grid tx" ref={root}>
      <Toc secs={toc} on={on} />
      <div className="wp-main">
        <section id="abstract" className="wp-sec wp-abstract">
          {doc.frame && <p className="tx-status"><span>Status</span> {doc.frame.status}</p>}
          <h2 className="wp-h2">Abstract</h2>
          <Html className="tx-abs" html={doc.abstract} />
          {key.length > 0 && (
            <aside className="wp-key wp-rv" aria-label="Key findings">
              <p className="wp-label">Summary <small>sentences from the abstract</small></p>
              <ol>{key.map((t) => <li key={t}>{t}</li>)}</ol>
            </aside>
          )}
          {f?.head && (
            <figure className="tx-table tx-head wp-rv" aria-label="Headline findings">
              <figcaption><b>Headline findings.</b> Numbers as reported in the paper.</figcaption>
              <div className="tx-scroll"><table><thead><tr><th>Finding</th><th>Members (N)</th><th>What it rests on</th></tr></thead>
                <tbody>{f.head.map((r) => <tr key={r[0]}><td>{r[0]}</td><td className="tx-num">{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table></div>
              <p className="tx-source">Source: the paper’s abstract, results tables and data section.</p>
            </figure>
          )}
          {f?.pull && <blockquote className="tx-pull wp-rv"><p>{f.pull}</p><cite>From the paper</cite></blockquote>}
          {f?.steps && (
            <div className="tx-steps wp-rv" aria-label="How the analysis runs">
              <p className="wp-label">How the analysis runs <small>the paper’s methods, in its words</small></p>
              <ol>{f.steps.map(([h, t], i) => <li key={h}><span className="tx-step-n">{String(i + 1).padStart(2, '0')}</span><b>{h}</b><p>{t}</p></li>)}</ol>
            </div>
          )}
          {f?.limits && (
            <aside className="tx-limits wp-rv" aria-label="What this does not show">
              <p className="wp-label">What this does not show <small>the paper’s own limits, verbatim</small></p>
              <ul>{f.limits.map((t) => <li key={t}>{t}</li>)}</ul>
            </aside>
          )}
          {doc.thanks && (
            <aside className="tx-thanks wp-rv" aria-label="Author’s note">
              <p className="wp-label">Author’s note <small>the paper’s title footnote, verbatim</small></p>
              <Html as="p" className="wp-p" html={doc.thanks.replace(/^<p>|<\/p>$/g, '')} />
            </aside>
          )}
        </section>
        {doc.secs.map((s) => (
          <section key={s.id} id={s.id} className="wp-sec">
            <h2 className="wp-h2 wp-rv">{s.n && <span className="tx-n">{s.n}</span>}{s.title}</h2>
            <Html className="tx-body" html={s.html} />
          </section>
        ))}
        {doc.notes.length > 0 && (
          <section id="tx-notes" className="wp-sec">
            <h2 className="wp-h2">Notes</h2>
            <ol className="wp-refs tx-notes">{doc.notes.map((n) => <li key={n.id} id={n.id} dangerouslySetInnerHTML={{ __html: n.html.replace(/^<p>|<\/p>$/g, '') }} />)}</ol>
          </section>
        )}
        {doc.refs && (
          <section id="tx-refs" className="wp-sec">
            <h2 className="wp-h2">References</h2>
            <Html className="tx-refs" html={doc.refs} />
          </section>
        )}
        <p className="wp-src">Text, equations, tables and figures are rendered from the paper’s LaTeX source (main.tex), with citations resolved from its references.bib. This is a draft; the PDF is the version of record for this page.</p>
      </div>
    </div>
  )
}
