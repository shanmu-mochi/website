import React from 'react'
import '../styles/paper.css'
import { Progress, TopBar, Hero } from '../components/paper/Shell'
import { Rv } from '../components/paper/Bits'
import { PAPERS } from '../data/papers'

const DEEP = [
  {
    k: 'Health economics · Working paper',
    t: 'Healthcare’s AI Trap',
    d: 'Automating routine care is efficient and pays for itself. The way a competitive market captures that gain defunds complex care and starves the pipeline that produces the clinicians the system will still need.',
    href: '/papers/ai-trap',
  },
  {
    k: 'Health policy · Master’s thesis',
    t: 'Mapping Medicaid Deserts',
    d: 'Eleven California counties where 1.7 million people hold Medi-Cal cards and cannot reliably find a doctor. What it costs, which programs are working, and the one number that reframes the question.',
    href: '/papers/medi-cal-deserts',
  },
]

export default function PapersIndex() {
  return (
    <>
      <Progress />
      <TopBar actions={[{ label: 'Home', href: '/' }]} />
      <Hero
        eyebrow="Research"
        title="Papers"
        deck="Clinical research, health economics, and policy. Two of them have a full walkthrough here, with the figures rebuilt and the argument laid out section by section."
        facts={[
          { k: 'Walkthroughs', v: '2' },
          { k: 'Listed', v: String(PAPERS.length) },
        ]}
      />

      <section className="pp-index">
        <Rv className="pp-label">Walkthroughs</Rv>
        <Rv className="pp-feat">
          {DEEP.map((d) => (
            <a className="pp-feat-card" href={d.href} key={d.t}>
              <div className="pp-k">{d.k}</div>
              <h3>{d.t}</h3>
              <p>{d.d}</p>
              <div className="pp-go">Read the white paper here <span className="pp-arrow">→</span></div>
            </a>
          ))}
        </Rv>
      </section>

      <section className="pp-index">
        <Rv className="pp-label">Everything else</Rv>
        <Rv className="pp-rows">
          {PAPERS.map((p, i) => {
            const Row = p.href ? 'a' : 'div'
            return (
              <Row className="pp-row" href={p.href} key={p.title} target={p.href ? '_blank' : undefined} rel={p.href ? 'noreferrer' : undefined}>
                <span className="pp-rn">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <h4>{p.title}</h4>
                  <span className="pp-sub">{p.sub}</span>
                  <span className="pp-auth">{p.authors}</span>
                </span>
                <span className="pp-badge">{p.badge}</span>
              </Row>
            )
          })}
        </Rv>
      </section>

      <section className="pp-end">
        <div className="pp-end-in">
          <div className="pp-end-rule">
            <Rv className="pp-endlinks">
              <a href="/">Back to the site</a>
              <a href="mailto:shanmur@uclawsf.edu">shanmur@uclawsf.edu</a>
            </Rv>
          </div>
        </div>
      </section>
    </>
  )
}
