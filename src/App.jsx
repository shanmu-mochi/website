import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ThesisLines, AITrapFig1, AITrapFig2 } from './components/Charts'
import './styles/globals.css'

/* curated cohesive painting set (Desktop/Paintings) for the moving gallery */
const PAINTINGS = [
  '/paintings/caitlins-world.jpg', '/paintings/dying-bird.jpg', '/paintings/w1.jpg',
  '/paintings/w2.jpg', '/paintings/w3.jpg', '/paintings/w4.jpg', '/paintings/w5.jpg',
  '/paintings/w6.jpg', '/paintings/w7.jpg', '/paintings/young-boy-blues.jpg',
]

const STORIES = [
  { title: 'Burnt Red Tongues', kind: 'Historical Fiction', venue: 'Medium', href: 'https://shanmuraja.medium.com/burnt-red-tongues-e5647e67d243' },
  { title: 'Fugue State', kind: 'Short Story', venue: 'Substack', href: 'https://open.substack.com/pub/shanmuraja/p/fugue-state?r=1hai5c&utm_medium=web' },
  { title: 'A Pound of Flesh', kind: 'Short Story', venue: 'Substack', href: 'https://open.substack.com/pub/shanmuraja/p/a-pound-of-flesh?r=1hai5c&utm_medium=web' },
  { title: 'a boring call', kind: 'A Short', venue: 'Substack', href: 'https://open.substack.com/pub/shanmuraja/p/a-boring-call?r=1hai5c&utm_medium=web' },
  { title: 'The Sound and the Fury', kind: 'Essay · Legacy, ethics, and the cost of progress', venue: 'Medium', href: 'https://shanmuraja.medium.com/the-sound-and-the-fury-b688bde9e526' },
  { title: 'Birds Do Not Sing in Caves', kind: 'Essay · Masculinity in medicine', venue: 'Medium', href: 'https://shanmuraja.medium.com/birds-do-not-sing-in-caves-ef64cb65c790' },
  { title: 'Young Boy Blues', kind: 'Essay · On caretaking', venue: 'Medium', href: 'https://shanmuraja.medium.com/young-boy-blues-0ce82e7971e0' },
  { title: 'I’ve Gone to the Country Spa', kind: 'Essay · Psychiatry and heredity', venue: 'Medium', href: 'https://shanmuraja.medium.com/ive-gone-to-the-country-spa-0b4313d7b8d7' },
  { title: 'Jack of All Trades, Master of None', kind: 'Essay · Choosing a specialty', venue: 'Medium', href: 'https://shanmuraja.medium.com/jack-of-all-trades-master-of-none-3e1be5a35d7b' },
  { title: 'Sonder', kind: 'Essay · My time in India', venue: 'Medium', href: 'https://shanmuraja.medium.com/sonder-c07feba361e0' },
  { title: 'Do You Lift, Bro?', kind: 'Essay · My time in orthopedics', venue: 'Medium', href: 'https://shanmuraja.medium.com/do-you-lift-bro-b2c620677895' },
  { title: 'Got Your Toe!', kind: 'Essay · A skilled nursing facility', venue: 'Medium', href: 'https://shanmuraja.medium.com/got-your-toe-472b0e2a74cb' },
]

const PAPERS = [
  { title: 'Same Result, Different Price', sub: 'Compounded vs branded tirzepatide — no effectiveness gap, conditional savings', authors: 'Erly & Raja · Mochi Health · 2026', href: '/papers/same-result-different-price-tirzepatide.pdf', badge: 'PDF' },
  { title: 'Off-Trial: Real-World Weight Loss on Tirzepatide & Semaglutide', sub: '13,507-patient telehealth cohort, propensity-score matched', authors: 'Erly & Raja · 2026', href: '/papers/off-trial-real-world-glp1.pdf', badge: 'PDF' },
  { title: 'Escalate or Switch? The Post-Titration GLP-1 Non-Responder', sub: 'Target-trial emulation, 68,969 patients, dose-equivalence reclassification', authors: 'Erly & Raja · 2026', href: '/papers/escalate-or-switch-glp1.pdf', badge: 'PDF' },
  { title: 'What Week 8 Knows: Forecasting Six-Month GLP-1 Outcomes', sub: 'Calibrated decision-support tool, 22,538 patients', authors: 'Erly & Raja · 2026', href: '/papers/what-week-8-knows.pdf', badge: 'PDF' },
  { title: 'Helical Classification of Type B Aortic Dissections', sub: 'The Journal of Thoracic and Cardiovascular Surgery', authors: 'Bondesson J, Raja S, Suh G-Y, Ullery BW, Dake MD, Lee JT, Cheng CP', badge: 'Pub.' },
  { title: 'Geometric Analysis of Aortic Remodeling After PETTICOAT (Type B Dissection)', sub: 'Journal of Vascular Surgery, Vol. 79(6), e149–e150', authors: 'Ullery BW, Suh G-Y, Bondesson J, Raja S, Cheng CP', badge: 'Pub.' },
  { title: 'Longitudinal Mapping of True Lumen Morphology for Endograft Oversizing', sub: 'Journal of Vascular Surgery, Vol. 77(4), 64S–65S', authors: 'Suh G-Y, Bondesson J, Raja S, Naqvi K, Cheng CP, Ullery BW', badge: 'Pub.' },
  { title: 'Aortic Remodeling after TEVAR and PETTICOAT (Complicated Type B Dissection)', sub: 'Journal of Vascular Surgery Cases, Innovations and Techniques', authors: 'Suh G-Y, Bondesson J, Raja S, Naqvi K, Cheng CP, Ullery BW', badge: 'Pub.' },
  { title: 'Concordance of LLMs with Guidelines at the Week-8 GLP-1 Follow-Up', sub: '714 telehealth encounters — Claude, GPT-4o, Gemini vs FDA & AGA guidance. Mochi Health.', authors: 'Raja S, et al. · in preparation', badge: 'WIP' },
  { title: 'Branded Wegovy™ vs. Compounded Semaglutide + Cyanocobalamin', sub: 'Retrospective observational study, Mochi Health — ACPM 2026 Finalist', authors: 'Raja S, Locke T', badge: 'WIP' },
  { title: 'Variation of Reimbursements within DRGs in Orthopedic Trauma', sub: 'Healthcare Economics and Policy', authors: 'Raja S, Wixted J', badge: 'WIP' },
]

const AI_CHIPS = ['Cream-skimming wedge', 'Cross-subsidy collapse', 'Einav–Finkelstein', 'Option value of training', 'Arrow–Fisher irreversibility', 'Vertical integration + risk adjustment']
const AWARDS = [
  { rn: 'I', title: 'Shortlist — The New Yorker', desc: <>For the historical short fiction <em>“Burnt Red Tongues.”</em></> },
  { rn: 'II', title: 'Shortlist — Paul Kalanithi Writing Competition', desc: <>Stanford’s national essay prize, in memory of the late neurosurgeon and author of <em>When Breath Becomes Air.</em></> },
  { rn: 'III', title: 'Winner — Massachusetts Undergraduate Poetry Festival', desc: <>First prize, statewide juried competition.</> },
  { rn: 'IV', title: 'Finalist — American College of Preventive Medicine', desc: <>Annual Meeting, Baltimore, MD. Selected abstract: <em>Branded Wegovy™ vs. Compounded Semaglutide + Cyanocobalamin.</em></> },
]
const SOCIALS = [['Medium', 'https://shanmuraja.medium.com/'], ['Substack', 'https://shanmuraja.substack.com/'], ['Instagram', 'https://instagram.com/'], ['LinkedIn', 'https://linkedin.com/'], ['X', 'https://x.com/']]

function GalleryItem({ src, i }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const d = 26 + (i % 3) * 26
  const y = useTransform(scrollYProgress, [0, 1], [d, -d])
  return (
    <motion.div ref={ref} className="g-item" style={{ y: reduce ? 0 : y }}>
      <div className="g-frame"><img src={src} alt="" loading="lazy" /></div>
    </motion.div>
  )
}

export default function App() {
  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <a href="#top" className="nav-left">Shanmu Raja™</a>
          <span className="nav-right"><a href="#top">Index</a>, <a href="#bio">Information</a></span>
        </div>
      </header>

      <main id="top" className="wrap">
        {/* MOVING GALLERY of paintings */}
        <section className="gallery">
          {PAINTINGS.map((src, i) => <GalleryItem src={src} i={i} key={src} />)}
        </section>

        {/* NAME MASTHEAD (Cargo "Writer's Retreat" style) */}
        <section className="masthead">
          <div className="mh-rule" />
          <h1>Shanmu Raja</h1>
          <div className="mh-rule" />
          <div className="mh-img"><img src="/paintings/w6.jpg" alt="" /></div>
        </section>

        {/* STORIES */}
        <section className="section" id="stories">
          <div className="section-head"><h2 className="section-title">Stories</h2><p className="section-lead">Fiction &amp; essays on medicine and humanity.</p></div>
          <div className="index-list">
            {STORIES.map((s, i) => (
              <a className="row" href={s.href} target="_blank" rel="noreferrer" key={s.title}>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <div><div className="rkick">{s.kind}</div><div className="title">{s.title}</div><span className="go">Read <span className="arrow">→</span></span></div>
                <span className="meta">{s.venue}</span>
              </a>
            ))}
          </div>
          <div className="archive-line">Full archive on <a href="https://shanmuraja.medium.com/" target="_blank" rel="noreferrer">Medium</a> · <a href="https://shanmuraja.substack.com/" target="_blank" rel="noreferrer">Substack</a></div>
        </section>

        <div className="prairie" />

        {/* PAPERS */}
        <section className="section" id="papers">
          <div className="section-head"><h2 className="section-title">Papers</h2><p className="section-lead">Peer-reviewed and working papers.</p></div>
          <div className="index-list">
            {PAPERS.map((p, i) => {
              const Tag = p.href ? 'a' : 'div'
              return (
                <Tag className="row" key={p.title} {...(p.href ? { href: p.href, target: '_blank', rel: 'noreferrer' } : { style: { cursor: 'default' } })}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="title" style={{ fontSize: 'clamp(1.05rem,2.3vw,1.4rem)' }}>{p.title}</div>
                    <div className="excerpt"><em>{p.sub}</em></div>
                    <div className="rkick" style={{ marginTop: '0.5rem', marginBottom: 0 }}>{p.authors}</div>
                    {p.href && <span className="go">Read PDF <span className="arrow">→</span></span>}
                  </div>
                  <span className="meta">{p.badge}</span>
                </Tag>
              )
            })}
          </div>
        </section>

        <div className="prairie" />

        {/* AWARDS */}
        <section className="section" id="awards">
          <div className="section-head"><h2 className="section-title">Awards</h2><p className="section-lead">A small archive of luck.</p></div>
          <div className="awards-list">{AWARDS.map((a) => <div className="award" key={a.rn}><span className="rn">{a.rn}</span><div><h4>{a.title}</h4><p>{a.desc}</p></div></div>)}</div>
        </section>

        <div className="prairie" />

        {/* FEATURES — illustrated deep-dives with the real figures */}
        <section className="section" id="features">
          <div className="section-head"><h2 className="section-title">Features</h2><p className="section-lead">Two pieces, explained with their figures.</p></div>

          <article className="feature-card">
            <div className="feature-tag"><span className="dot" /><span>Economics</span></div>
            <h3 className="feature-title">Healthcare’s AI Trap</h3>
            <p className="feature-sub">When automation skims the cream and starves the pipeline at once.</p>
            <p className="feature-byline">Shanmugesh Raja, MS · Mochi Health · June 2026</p>
            <p className="feature-summary">Routine cases do double duty: under a flat fee they cross-subsidize complex care, and they are the cases on which junior clinicians become senior. AI automates them first. The margin <em>r − w(c)</em> is positive on the routine cream and negative on the tail, so a standalone entrant skims up to its own break-even — past the point where the residual pool stays solvent.</p>
            <AITrapFig1 />
            <p className="feature-summary" style={{ marginTop: '1.4rem' }}>Residual profit then crosses zero at the unraveling threshold <em>θ̄ ≈ 0.32</em>, strictly before the social break-even <em>c† = 0.50</em> — the entrant over-skims, dumping the rescue cost of the abandoned tail onto everyone else.</p>
            <AITrapFig2 />
            <div className="chips">{AI_CHIPS.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
            <a className="feature-cta" href="/papers/healthcares-ai-trap.pdf" target="_blank" rel="noreferrer">Read the paper <span className="arrow">→</span></a>
          </article>

          <article className="thesis-card">
            <div className="thesis-eyebrow">UCSF · Health Policy & Law · April 2026 · Master’s Thesis</div>
            <h3 className="thesis-title">Mapping Medi-Cal Deserts in California</h3>
            <p className="thesis-desc">Provider shortages, preventable hospitalizations, and the limits of workforce policy in Medi-Cal — an empirical study of California’s 58 counties, with five causal identification strategies and a portfolio policy response.</p>
            <div className="stat-grid">
              <div className="stat"><div className="n">+37%</div><div className="l">Preventable hospitalization gap, desert vs. non-desert counties</div></div>
              <div className="stat"><div className="n">$82M</div><div className="l">Annual excess Medi-Cal cost attributable to the access deficit</div></div>
              <div className="stat"><div className="n">11</div><div className="l">Desert counties, stable across fifteen years (2010–2024)</div></div>
            </div>
            <ThesisLines />
            <p className="fig-caption">The post-2017 narrowing is concentrated in the Prop 56 payment-increase window — 81.8% of the eventual gap closure occurs after 2016.</p>
            <div className="signature">Shanmugesh Raja · UCSF Health Policy & Law · MMXXVI</div>
            <a className="feature-cta" href="mailto:shanmur@uclawsf.edu">Request the full report <span className="arrow">→</span></a>
          </article>
        </section>

        <div className="prairie" />

        {/* BIO */}
        <section className="section" id="bio">
          <div className="section-head"><h2 className="section-title">Bio</h2></div>
          <div className="about-grid">
            <div className="plate"><figure><img src="/profile.jpg" alt="Shanmu Raja" /><figcaption>Fig. 01 — Shanmu Raja</figcaption></figure></div>
            <div className="about-body">
              <p className="lead">I write fiction, essays, and the occasional poem.</p>
              <p>I have a master’s from UCSF in healthcare economics and health policy. My thesis looked at access deserts in Medi-Cal. My research lives in clinical medicine and surgery.</p>
              <p>My fiction has been recognized by <em>The New Yorker</em>, the Paul Kalanithi Writing Competition, and the Massachusetts Undergraduate Poetry Festival. My research has appeared in <em>The Journal of Thoracic and Cardiovascular Surgery</em> and <em>Journal of Vascular Surgery</em>.</p>
              <p>Off the page: squash, piano, slow dinners, a steady diet of cinema.</p>
            </div>
          </div>
          <div style={{ marginTop: '3rem' }}>
            <a className="contact-mail" href="mailto:shanmur@uclawsf.edu">shanmur@uclawsf.edu</a>
            <div className="contact-links">{SOCIALS.map(([label, href]) => <a href={href} target="_blank" rel="noreferrer" key={label}>{label}</a>)}</div>
          </div>
        </section>

        <div className="prairie" />
        <footer className="colophon">
          <span>Shanmu Raja™</span><span>Index, Information</span><span>© MMXXVI</span>
        </footer>
      </main>
    </>
  )
}
