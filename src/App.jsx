import React from 'react'
import './styles/globals.css'

function App() {
  return (
    <div className="app">
      {/* Morphing Header/Navigation */}
      <div className="morphing-header" id="morphing-header">
        <div className="header-content">
          <div className="name-text" onClick={() => {
            document.getElementById('bio')?.scrollIntoView({ behavior: 'smooth' })
          }}>
            Shanmu Raja
          </div>
          <nav className="nav-menu" id="nav-menu">
            <a href="#bio">About</a>
            <a href="#essays">Essays</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-subtitle">Medical Student • Healthcare Economics • Research</p>
        </div>
      </section>

      {/* Bio Section */}
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

      {/* Essays Section */}
      <section id="essays" className="essays-section">
        <h2>Essays</h2>
        <div className="essays-grid">
          <article className="essay-box glass-box">
            <h3>The Art of Medicine</h3>
            <p className="essay-date">March 2024</p>
            <p className="essay-excerpt">Exploring the intersection of clinical practice and human connection in modern healthcare. This essay delves into how the art of medicine transcends technical knowledge to encompass empathy, communication, and the human touch that defines exceptional patient care.</p>
            <a href="#" className="essay-link">Read more →</a>
          </article>
          
          <article className="essay-box glass-box">
            <h3>Economics of Care</h3>
            <p className="essay-date">January 2024</p>
            <p className="essay-excerpt">A critical analysis of value-based care models and their impact on patient outcomes. This piece examines how economic incentives can be aligned with clinical excellence to create sustainable healthcare systems that prioritize both quality and efficiency.</p>
            <a href="#" className="essay-link">Read more →</a>
          </article>
          
          <article className="essay-box glass-box">
            <h3>Surgical Precision in Policy</h3>
            <p className="essay-date">November 2023</p>
            <p className="essay-excerpt">Drawing parallels between surgical methodology and healthcare policy development. This essay explores how the precision, planning, and systematic approach of surgery can inform more effective healthcare policy implementation.</p>
            <a href="#" className="essay-link">Read more →</a>
          </article>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <h2>Contact</h2>
        <div className="contact-content">
          <p>Let's connect and discuss healthcare innovation, research opportunities, or policy development.</p>
          <div className="contact-links">
            <a href="mailto:shanmu@example.com">Email</a>
            <a href="https://linkedin.com/in/shanmuraja">LinkedIn</a>
            <a href="https://twitter.com/shanmuraja">Twitter</a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App