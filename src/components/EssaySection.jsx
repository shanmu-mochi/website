import React from 'react'

export default function EssaySection() {
  const essays = [
    {
      title: "The Art of Medicine",
      date: "March 2024",
      excerpt: "Exploring the intersection of clinical practice and human connection in modern healthcare. This essay delves into how the art of medicine transcends technical knowledge to encompass empathy, communication, and the human touch that defines exceptional patient care.",
      wavelength: 650 // Red tint
    },
    {
      title: "Economics of Care",
      date: "January 2024",
      excerpt: "A critical analysis of value-based care models and their impact on patient outcomes. This piece examines how economic incentives can be aligned with clinical excellence to create sustainable healthcare systems that prioritize both quality and efficiency.",
      wavelength: 550 // Green tint
    },
    {
      title: "Surgical Precision in Policy",
      date: "November 2023",
      excerpt: "Drawing parallels between surgical methodology and healthcare policy development. This essay explores how the precision, planning, and systematic approach of surgery can inform more effective healthcare policy implementation.",
      wavelength: 450 // Blue tint
    }
  ]

  return (
    <section id="essays" className="essays-section">
      <h2>Essays</h2>
      <div className="essays-grid">
        {essays.map((essay, index) => (
          <article 
            key={index}
            className="essay-box glass-box"
            style={{
              '--wavelength': essay.wavelength
            }}
          >
            <h3>{essay.title}</h3>
            <p className="essay-date">{essay.date}</p>
            <p className="essay-excerpt">{essay.excerpt}</p>
            <a href="#" className="essay-link">Read more →</a>
          </article>
        ))}
      </div>
    </section>
  )
}
