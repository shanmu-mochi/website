import React from 'react'
import GlassLetter from './GlassLetter'

export default function GlassScene() {
  const letters = ['S', 'h', 'a', 'n', 'm', 'u', ' ', 'R', 'a', 'j', 'a']
  
  return (
    <>
      {letters.map((letter, index) => (
        <GlassLetter
          key={index}
          letter={letter}
          index={index}
          total={letters.length}
        />
      ))}
    </>
  )
}
