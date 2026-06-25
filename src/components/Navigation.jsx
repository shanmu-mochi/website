import React from 'react'

export default function Navigation({ visible }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className={`navigation ${visible ? 'visible' : ''}`}>
      <a 
        href="#bio" 
        onClick={(e) => {
          e.preventDefault()
          scrollToSection('bio')
        }}
      >
        Shanmu Raja
      </a>
      <a 
        href="#essays" 
        onClick={(e) => {
          e.preventDefault()
          scrollToSection('essays')
        }}
      >
        Essays
      </a>
      <a 
        href="#contact" 
        onClick={(e) => {
          e.preventDefault()
          scrollToSection('contact')
        }}
      >
        Contact
      </a>
    </nav>
  )
}
