/* GROK_FEEDBACK_OVERLAY: preview-only comment layer. Loaded only when built with VITE_FEEDBACK=1. */
import React, { useEffect, useRef, useState } from 'react'
import './feedback.css'

const KEY = 'grok-feedback-v1'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null } }
const blank = () => ({ comments: [], general: '' })
const vp = () => `${window.innerWidth}x${window.innerHeight}`

function pieceState() {
  const h = location.hash || '#/'
  const title = document.querySelector('.b-title')
  const count = document.querySelector('.b-count')
  const on = document.querySelector('.sw-cats .is-on')
  if (title) return `${on ? on.textContent.replace(/\d+$/, '') : ''} · ${title.textContent}${count ? ` (${count.textContent.replace(/\s/g, '')})` : ''}`
  const h1 = document.querySelector('.pg-title')
  return h1 ? h1.textContent : h.replace('#/', '') || 'home'
}
function describe(el) {
  const path = []
  for (let e = el; e && e !== document.body && path.length < 4; e = e.parentElement) {
    const c = [...e.classList].filter((x) => !x.startsWith('is-')).slice(0, 2).join('.')
    path.unshift(e.tagName.toLowerCase() + (c ? '.' + c : ''))
  }
  const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80)
  const aria = el.getAttribute('aria-label') || el.getAttribute('alt') || (el.closest('[aria-label]') && el.closest('[aria-label]').getAttribute('aria-label')) || ''
  return { tag: el.tagName.toLowerCase(), path: path.join(' > '), text, aria }
}
const descText = (d) => [d.path, d.aria && `aria "${d.aria}"`, d.text && `"${d.text}"`].filter(Boolean).join(' ')

function toMarkdown(st) {
  const open = st.comments.filter((c) => !c.resolved)
  const L = [`### Feedback (${open.length} open)`, '']
  open.forEach((c, i) => L.push(`${i + 1}. [${c.route} · ${c.piece} · ${c.viewport}] "${c.text}" — on: ${descText(c.el)}, at ${c.x}% ${c.y}%`))
  if (st.general && st.general.trim()) L.push('', '**General note:** ' + st.general.trim())
  const res = st.comments.filter((c) => c.resolved).length
  if (res) L.push('', `_(${res} resolved, not listed)_`)
  return L.join('\n')
}

export default function Overlay() {
  const [st, setSt] = useState(() => load() || blank())
  const [mode, setMode] = useState(false)
  const [panel, setPanel] = useState(false)
  const [draft, setDraft] = useState(null)
  const [hash, setHash] = useState(location.hash)
  const [hover, setHover] = useState(null)
  const [msg, setMsg] = useState('')
  const [fallback, setFallback] = useState('')
  const [editing, setEditing] = useState(null)
  const first = useRef(true)

  // restore from the local server when this browser has nothing yet
  useEffect(() => {
    if (load()) return
    fetch('/__feedback', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((j) => { if (j && j.comments) setSt({ comments: j.comments, general: j.general || '' }) }).catch(() => {})
  }, [])
  // persist + sync (debounced, silent on failure)
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(st))
    if (first.current) { first.current = false; return }
    const body = () => JSON.stringify({ ...st, markdown: toMarkdown(st), savedAt: new Date().toISOString() })
    let sent = false
    const send = () => { if (sent) return; sent = true; fetch('/__feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body(), keepalive: true }).catch(() => {}) }
    const t = setTimeout(send, 400)
    window.addEventListener('pagehide', send)
    return () => { clearTimeout(t); window.removeEventListener('pagehide', send) }
  }, [st])

  useEffect(() => { const on = () => setHash(location.hash); window.addEventListener('hashchange', on); window.addEventListener('popstate', on); const iv = setInterval(on, 500); return () => { window.removeEventListener('hashchange', on); window.removeEventListener('popstate', on); clearInterval(iv) } }, [])

  useEffect(() => {
    const typing = (e) => e.target.closest && e.target.closest('input, textarea, [contenteditable]')
    const onKey = (e) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'c' || e.key === 'C') { e.preventDefault(); setMode((m) => !m); setDraft(null) }
      else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); setPanel((p) => !p) }
      else if (e.key === 'Escape' && (mode || draft)) { e.stopImmediatePropagation(); e.preventDefault(); setDraft(null); setMode(false) }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [mode, draft])

  // comment mode: swallow the app's clicks/drags, drop a pin
  useEffect(() => {
    document.documentElement.classList.toggle('fb-mode', mode)
    if (!mode) { setHover(null); return }
    const mine = (e) => e.target.closest && e.target.closest('.fb-ui')
    const block = (e) => { if (mine(e)) return; e.preventDefault(); e.stopPropagation() }
    const onClick = (e) => {
      if (mine(e)) return
      e.preventDefault(); e.stopPropagation()
      const el = document.elementFromPoint(e.clientX, e.clientY) || e.target
      setDraft({ px: Math.round(e.clientX), py: Math.round(e.clientY + window.scrollY), x: +(e.clientX / innerWidth * 100).toFixed(1), y: +(e.clientY / innerHeight * 100).toFixed(1), el: describe(el), piece: pieceState(), text: '' })
    }
    const onMove = (e) => { if (mine(e)) { setHover(null); return } const r = e.target.getBoundingClientRect(); setHover({ l: r.left, t: r.top, w: r.width, h: r.height }) }
    const evs = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'dblclick', 'auxclick']
    evs.forEach((t) => window.addEventListener(t, block, true))
    const onWheel = (e) => { if (!mine(e)) e.stopPropagation() }
    window.addEventListener('wheel', onWheel, true)
    window.addEventListener('click', onClick, true)
    window.addEventListener('mousemove', onMove, true)
    return () => { evs.forEach((t) => window.removeEventListener(t, block, true)); window.removeEventListener('wheel', onWheel, true); window.removeEventListener('click', onClick, true); window.removeEventListener('mousemove', onMove, true) }
  }, [mode])

  const save = () => {
    if (!draft || !draft.text.trim()) { setDraft(null); return }
    const c = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: draft.text.trim(), route: location.hash || '#/', piece: draft.piece, viewport: vp(), x: draft.x, y: draft.y, px: draft.px, py: draft.py, el: draft.el, at: new Date().toISOString(), resolved: false }
    setSt((s) => ({ ...s, comments: [...s.comments, c] })); setDraft(null); setMode(false)
  }
  const upd = (id, f) => setSt((s) => ({ ...s, comments: s.comments.map((c) => c.id === id ? { ...c, ...f } : c) }))
  const del = (id) => setSt((s) => ({ ...s, comments: s.comments.filter((c) => c.id !== id) }))
  const copy = async () => {
    const md = toMarkdown(st)
    try { await navigator.clipboard.writeText(md); setMsg('Copied'); setFallback('') } catch { setFallback(md); setMsg('Clipboard blocked: copy below') }
    setTimeout(() => setMsg(''), 2500)
  }
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toMarkdown(st)], { type: 'text/markdown' })); a.download = 'feedback.md'; a.click() }

  const route = hash || '#/'
  const nOpen = st.comments.filter((c) => !c.resolved).length
  const here = st.comments.map((c, i) => [c, i]).filter(([c]) => c.route === route && !c.resolved && (!document.querySelector('.b-title') || c.piece === pieceState()))
  const groups = [...new Set(st.comments.map((c) => c.route))]
  const pin = (x, y, n, extra) => <div className={`fb-ui fb-pin ${extra || ''}`} style={{ left: `${x}%`, top: `${y}%` }}>{n}</div>

  return (
    <>
      {mode && hover && <div className="fb-hover" style={{ left: hover.l, top: hover.t, width: hover.w, height: hover.h }} />}
      {here.map(([c, i]) => <React.Fragment key={c.id}>{pin(c.x, c.y, i + 1)}</React.Fragment>)}
      {draft && (
        <>
          {pin(draft.x, draft.y, st.comments.length + 1, 'is-draft')}
          <div className="fb-ui fb-box" style={{ left: `min(${draft.x}%, calc(100vw - 300px))`, top: `min(calc(${draft.y}% + 18px), calc(100vh - 150px))` }}>
            <textarea autoFocus placeholder="What should change?" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setDraft(null) } }} />
            <div className="fb-row"><span>{draft.el.path.split(' > ').pop()}</span><button onClick={() => setDraft(null)}>Cancel</button><button className="is-pri" onClick={save}>Save ↵</button></div>
          </div>
        </>
      )}
      <div className="fb-ui fb-pill">
        <button className={mode ? 'is-on' : ''} onClick={() => { setMode(!mode); setDraft(null) }} title="Toggle comment mode (C)">{mode ? 'Commenting… Esc' : 'Comment · C'}</button>
        <button onClick={() => setPanel(!panel)} title="List (L)">{nOpen}</button>
      </div>
      {panel && (
        <aside className="fb-ui fb-panel">
          <header><strong>Feedback</strong><span>{nOpen} open · {st.comments.length - nOpen} resolved</span><button onClick={() => setPanel(false)}>×</button></header>
          <div className="fb-list">
            {groups.length === 0 && <p className="fb-empty">Press C, then click anything to leave a note.</p>}
            {groups.map((g) => (
              <section key={g}>
                <h4>{g}</h4>
                {st.comments.map((c, i) => [c, i]).filter(([c]) => c.route === g).map(([c, i]) => (
                  <div key={c.id} className={`fb-item${c.resolved ? ' is-res' : ''}`}>
                    <span className="fb-n">{i + 1}</span>
                    <div>
                      {editing === c.id
                        ? <textarea defaultValue={c.text} autoFocus onBlur={(e) => { upd(c.id, { text: e.target.value }); setEditing(null) }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.blur() } }} />
                        : <p>{c.text}</p>}
                      <small>{c.piece} · {c.viewport}</small>
                      <div className="fb-acts">
                        <button onClick={() => setEditing(c.id)}>Edit</button>
                        <button onClick={() => upd(c.id, { resolved: !c.resolved })}>{c.resolved ? 'Reopen' : 'Resolve'}</button>
                        <button onClick={() => del(c.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            ))}
            <section><h4>General note</h4><textarea className="fb-general" value={st.general} placeholder="Anything not tied to one spot" onChange={(e) => setSt({ ...st, general: e.target.value })} /></section>
          </div>
          <footer>
            <button className="is-pri" onClick={copy}>Copy feedback for Grok</button>
            <button onClick={download}>Download .md</button>
            <button onClick={() => setSt((s) => ({ ...s, comments: s.comments.filter((c) => !c.resolved) }))}>Clear resolved</button>
            {msg && <span className="fb-msg">{msg}</span>}
            {fallback && <textarea className="fb-fallback" readOnly value={fallback} onFocus={(e) => e.target.select()} />}
          </footer>
        </aside>
      )}
    </>
  )
}
