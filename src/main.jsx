import React from 'react'
import ReactDOM from 'react-dom/client'
import { inkCursor } from './lib/inkCursor.js'
import './styles/iter30.css'
import Browser from './Browser.jsx'

/* The browser restores the last scroll position on reload, which on a one-page
   site means opening halfway down instead of at the gallery. Paper pages keep
   the default, where coming back to where you were reading is the point. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (!window.location.hash) window.scrollTo(0, 0)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Browser />
  </React.StrictMode>,
)

// Preview-only feedback overlay. Statically false in `npm run build`, so it is tree-shaken out.
// eslint-disable-next-line no-undef
if (__FEEDBACK__) import('./feedback/mount.jsx').then((m) => m.mount())
inkCursor()
