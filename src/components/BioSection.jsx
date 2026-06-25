import React from 'react'

export default function BioSection() {
  return (
    <section id="bio" className="bio-section">
      <div className="bio-container">
        <div className="bio-text">
          <p>
            I'm an aspiring medical student with a Master's in Healthcare Economics 
            and Legal Policy at UCSF. My interests include surgical research, 
            healthcare economics, and creative medical writing.
          </p>
          <p>
            I'm passionate about understanding the intersection of clinical practice, 
            healthcare policy, and economic principles to improve patient outcomes 
            and healthcare delivery systems.
          </p>
        </div>
        <div className="bio-image">
          <img 
            src="/Image 12-14-23 at 4.48 PM.jpg" 
            alt="Shanmu Raja"
            className="profile-image"
          />
        </div>
      </div>
    </section>
  )
}
