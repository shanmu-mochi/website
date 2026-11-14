import React from 'react'
import ReactDOM from 'react-dom/client'
import { inkCursor } from './lib/inkCursor.js'
import './styles/iter30.css'
import Glp1Outcomes from './pages/Glp1Outcomes'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Glp1Outcomes />
  </React.StrictMode>,
)
inkCursor()
