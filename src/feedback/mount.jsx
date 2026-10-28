/* GROK_FEEDBACK_OVERLAY entry */
import React from 'react'
import { createRoot } from 'react-dom/client'
import Overlay from './Feedback.jsx'

export function mount() {
  const d = document.createElement('div'); d.id = 'grok-feedback'; document.body.appendChild(d)
  createRoot(d).render(<Overlay />)
}
