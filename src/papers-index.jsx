import React from 'react'
import ReactDOM from 'react-dom/client'
import { inkCursor } from './lib/inkCursor.js'
import './styles/iter30.css'
import PapersIndex from './pages/PapersIndex'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PapersIndex />
  </React.StrictMode>,
)
inkCursor()
