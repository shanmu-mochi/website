import React from 'react'
import ReactDOM from 'react-dom/client'
import { inkCursor } from './lib/inkCursor.js'
import './styles/iter30.css'
import AiTrap from './pages/AiTrap'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AiTrap />
  </React.StrictMode>,
)
inkCursor()
