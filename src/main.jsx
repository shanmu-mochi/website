import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

/* The browser restores the last scroll position on reload, which on a one-page
   site means opening halfway down instead of at the gallery. Paper pages keep
   the default, where coming back to where you were reading is the point. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (!window.location.hash) window.scrollTo(0, 0)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
