import React from 'react'

// drawn arrows: the ← → ↗ characters come out as emoji, or in a fallback font, on iPhones
const D = { left: 'M13 8H3M7.5 3.5 3 8l4.5 4.5', right: 'M3 8h10M8.5 3.5 13 8l-4.5 4.5', ne: 'M4.5 11.5l7-7M5.5 4.5h6v6' }
export default function Arrow({ dir = 'right', className = '' }) {
  return (
    <svg className={`arw ${className}`} viewBox="0 0 16 16" width="0.85em" height="0.85em" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={D[dir]} />
    </svg>
  )
}
