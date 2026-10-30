import React from 'react'
import ReactDOM from 'react-dom/client'
import { inkCursor } from './lib/inkCursor.js'
import './styles/iter30.css'
import MediCal from './pages/MediCal'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MediCal />
  </React.StrictMode>,
)
inkCursor()
