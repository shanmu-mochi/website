import React from 'react'
import '../styles/paper.css'
import { Progress, TopBar, Hero, Abstract, Contents, Rail, End } from '../components/paper/Shell'
import { Sec, P, Eq, List, Cap, Stat, StepFigure, Aside } from '../components/paper/Bits'
import { AITrapFig2 } from '../components/Charts'
import { AITrapFig3, AITrapFig4, CrossSubsidyDiagram, AllocationSplit, CommonsLoop, PriceVsCost, InstrumentMap } from '../components/paper/AiTrapFigures'

const TOC = [
  { id: 'question', n: '1', label: 'The question' },
  { id: 'panel', n: '2', label: 'How a panel pays' },
  { id: 'skim', n: '3', label: 'What entry changes' },
  { id: 'cliff', n: '4', label: 'Where the loss lands' },
  { id: 'loop', n: '5', label: 'The loop closes' },
  { id: 'policy', n: '6', label: 'What fixes it' },
  { id: 'falsify', n: '7', label: 'How you would know' },
]

const SOURCES = [
  'Acemoglu, D., & Restrepo, P. (2018). The race between man and machine. American Economic Review, 108(6).',
  'Acemoglu, D., & Restrepo, P. (2019). Automation and new tasks. Journal of Economic Perspectives, 33(2).',
  'Arrow, K. J., & Fisher, A. C. (1974). Environmental preservation, uncertainty, and irreversibility. QJE, 88(2).',
  'Autor, D. H., Levy, F., & Murnane, R. J. (2003). The skill content of recent technological change. QJE, 118(4).',
  'Baumol, W. J., & Bowen, W. G. (1966). Performing Arts: The Economic Dilemma. Twentieth Century Fund.',
  'Dixit, A. K., & Pindyck, R. S. (1994). Investment Under Uncertainty. Princeton University Press.',
  'Dranove, D., & Garthwaite, C. (2022). AI, the healthcare value chain, and the future of the physician. NBER WP 30607.',
  'Faulhaber, G. R. (1975). Cross-subsidization: pricing in public enterprises. American Economic Review, 65(5).',
  'Hartwig, J. (2008). What drives health care expenditure? Journal of Health Economics, 27(3).',
  'Hemenway Falk, B., & Tsoukalas, G. (2026). The AI layoff trap. arXiv:2603.20617.',
  'Henry, C. (1974). Investment decisions under uncertainty: the irreversibility effect. American Economic Review, 64(6).',
  'Hong, M., et al. (2026). Risk of deskilling and loss of expertise among physicians. ESMO RWD and Digital Oncology.',
  'Rajpurkar, P., & Topol, E. J. (2025). The effect of AI on the radiologist workforce. medRxiv.',
  'Sahni, N., Stein, G., Zemmel, R., & Cutler, D. M. (2023). Potential impact of AI on healthcare spending. NBER WP 30857.',
  'Tinbergen, J. (1952). On the Theory of Economic Policy. North-Holland.',
]

export default function AiTrap() {
  return (
    <>
      <Progress />
      <TopBar
        actions={[
          { label: 'PDF', href: '/papers/healthcares-ai-trap.pdf' },
          { label: 'Essay', href: 'https://shanmuraja.substack.com/p/healthcares-ai-trap?r=1hai5c&utm_medium=web' },
          { label: 'All papers', href: '/papers/' },
        ]}
      />
      <Hero
        eyebrow="Working paper · Health economics"
        title={<>Healthcare&rsquo;s<br />AI Trap</>}
        deck="Automating routine clinical care is efficient and pays for itself. The way a competitive market captures that gain withdraws the cross-subsidy that funds complex care."
        facts={[
          { k: 'Author', v: 'Shanmugesh Raja, MS' },
          { k: 'Affiliation', v: 'UCSF' },
          { k: 'Version', v: 'Draft, June 2026', dt: '2026-06' },
          { k: 'DOI', v: '10.2139/ssrn.7119078', href: 'https://doi.org/10.2139/ssrn.7119078' },
        ]}
      />

      <Abstract>
        <p>
          Routine cases make money. Complex cases lose money. Because pay barely moves with complexity, the routine cases are quietly
          funding the complex ones inside every panel.
        </p>
        <p>
          AI automates the routine cases first, which is the right thing to automate. But the firms doing it are new entrants, and they
          take the profitable cases out of the pool without taking the unprofitable ones. Incumbents fail long before AI is good enough
          to treat the patients they were carrying.
        </p>
        <p>
          Then it closes on the automators. Routine cases are what trainees learn on, so skimming them dries up the pipeline that
          produces the senior clinicians the entrants need for oversight and referrals.
        </p>
      </Abstract>

      <Contents toc={TOC} />

      <div className="pp-shell">
        <Rail
          toc={TOC}
          foot={<>Full paper as a <a href="/papers/healthcares-ai-trap.pdf">PDF</a>.</>}
        />

        <article className="pp-art">
          <Sec id="question" title="The question" sub="Not whether AI replaces clinicians. What happens to the money while it does not.">
            <P>
              In 2016 a prominent computer scientist advised that we stop training radiologists. A decade on the workforce has grown,
              vacancies number in the thousands, and pay has risen. Nearly all of AI&rsquo;s measured value in medicine so far is
              administrative.
            </P>
            <Aside title="Why medicine got expensive without getting faster">
              <p>
                Some sectors resist productivity growth, and wages in them still have to track the rest of the economy. Their relative
                cost rises forever. Baumol and Bowen described it in 1966, and it accounts for most of the long rise in US health spending.
              </p>
            </Aside>
            <P>
              Medicine is also the textbook stagnant sector: wages have to track the rest of the economy even though output per clinician
              is flat, so its relative cost rises forever. AI is the first technology that plausibly breaks that pattern. The problem is
              the mechanism by which the saving gets captured.
            </P>
            <Stat n="0" l="Clinical occupations eliminated by AI so far. The trap does not need one to spring." />
            <P>
              Complex patients lose their provider not because AI can treat them. They lose their provider because AI took the cases that
              paid for them.
            </P>
          </Sec>

          <Sec id="panel" title="How a panel pays for itself" sub="One flat price against a cost that climbs. Everything follows from that.">
            <Aside label="Notation" title="What the frontier θ means">
              <p>
                Encounters are indexed from 0 to 1 by complexity. θ is the point up to which AI is safe and adequate, so it is the share of
                the complexity range that can be automated, not the share of clinicians replaced.
              </p>
              <p>
                It rises over time. Everything in the paper is about what happens on the way up.
              </p>
            </Aside>
            <P>
              A visit pays roughly the same whether it takes eight minutes or fifty, while the time and coordination it takes rise
              steadily with complexity. Below the crossover a case turns a profit. Above it, a case loses money.
            </P>
            <PriceVsCost num="Figure 1. Price is flat. Cost is not." />
            <Cap>
              At a flat price of 1, a routine case costs about half what it pays and a hard case nearly twice. The crossover sits at
              c† = 0.50 in the paper&rsquo;s illustrative numbers.
            </Cap>
            <P>
              So inside one clinician&rsquo;s panel there is a transfer running quietly from the easy cases to the hard ones. Nothing in
              the payment system marks it, which is why a panel that includes unprofitable patients can exist at all.
            </P>
            <CrossSubsidyDiagram num="Figure 2. One panel, two kinds of encounter, one transfer between them" />
            <Cap>
              That transfer is the thing at risk. Remove the profitable half and the panel stops covering the complex half.
            </Cap>
          </Sec>

          <Sec id="skim" title="What entry changes" sub="Automating the routine band is right. Taking it out of the pool is the problem.">
            <P>
              An AI-native firm serves routine encounters at near-zero marginal cost, collects the same administered rate a clinician
              would have collected, and never touches the complex tail. The incumbent cannot hold the routine patients to protect the
              subsidy, because it would have to hold them against a cheaper and more convenient alternative. They leave.
            </P>
            <AllocationSplit num="Figure 3. The same work, split two ways" />
            <Cap>
              Both rows automate the identical band. The only difference is whether the saving stays inside the pool that carries the
              complex patients. The inefficiency is organizational, not technological.
            </Cap>
            <P>
              The consequence is sharp. Profit on the leftover book falls with every case skimmed and crosses zero at θ̄ ≈ 0.32, well
              before the frontier reaches the complexity at which that book could ever support itself.
            </P>
            <AITrapFig2 num="Figure 4. The leftover pool goes broke early, before break-even" />
            <Cap>
              Incumbents exit while AI is still confined to genuinely routine work.
            </Cap>
            <StepFigure
              num="Figure 5. Push the frontier and watch the pool"
              head="The leftover book, at each frontier"
              steps={[
                { pill: 'θ = 0.10', rows: [['Caseload automated', '8.1%'], ['Leftover pool profit', '+0.174'], ['Complex tail', 'has a provider', 'mute']] },
                { pill: 'θ = 0.20', rows: [['Caseload automated', '26.3%'], ['Leftover pool profit', '+0.092'], ['Complex tail', 'has a provider', 'mute']] },
                { pill: 'θ = 0.32', rows: [['Caseload automated', '51.3%'], ['Leftover pool profit', '0.000'], ['Complex tail', 'on the edge', 'mute']], note: 'The collapse frontier. Half the caseload is automated, and all of it is still genuinely routine work.' },
                { pill: 'θ = 0.40', rows: [['Caseload automated', '66.3%'], ['Leftover pool profit', '−0.034'], ['Complex tail', 'loses its provider', 'bad']] },
                { pill: 'θ = 0.50', rows: [['Caseload automated', '81.2%'], ['Leftover pool profit', '−0.049'], ['Complex tail', 'loses its provider', 'bad']], note: 'Only here does a case finally cost exactly what it pays. The incumbent went under two steps ago.' },
              ]}
              caption="Scroll to sweep the frontier, or pick one. Profit on the residual book crosses zero at θ̄ ≈ 0.32, well before the complexity at which that book could support itself."
            />
          </Sec>

          <Sec id="cliff" title="Where the loss lands" sub="Nothing is destroyed until something breaks. Then a lot is, at once.">
            <P>
              Up to that point every encounter is still served by the cheapest adequate provider, and total welfare is unchanged.
              Skimming is purely a transfer: entrants capture rents that used to fund complex care. After it, incumbents exit and the
              complex tail either goes unserved or gets rescued publicly.
            </P>
            <AITrapFig3 num="Figure 5. Nothing is lost until the leftover pool goes under" />
            <Cap>
              Market welfare tracks the planner exactly until θ̄, then leaks. Which is why the problem stays invisible right up to the
              point it becomes unfixable.
            </Cap>
            <P>
              Note who holds the bill: complex patients, incumbents, and taxpayers. Not the entrants, who never served the tail and are
              unharmed by losing it.
            </P>
          </Sec>

          <Sec id="loop" title="The loop closes" sub="Routine cases are also the training set, and the automators need the graduates.">
            <P>
              Senior clinicians come from apprenticeship, which needs routine cases to learn on. Skimming moves those cases out of
              settings that train and into settings that cannot.
            </P>
            <CommonsLoop num="Figure 6. The externality turns back on the firms that caused it" />
            <Cap>
              Every firm draws on the existing stock of senior clinicians, for oversight and for referrals, and none of them replaces it.
            </Cap>
            <Eq note="Capacity builds only with a lag on the order of a decade, and decays at the retirement rate as soon as the inflow stops.">
              <em>Ḣ</em> = <em>g(R)</em> − <em>γH</em>
            </Eq>
            <P>
              Meanwhile the need for clinicians never reaches zero. As the frontier rises the complex tail shrinks, but the oversight
              requirement per unit of AI volume does not, and if AI plateaus short of everything the tail never disappears either.
            </P>
            <AITrapFig4 num="Figure 7. Capability runs, capacity walks" />
            <Cap>
              Under the market, capacity decays through that floor at a point from which it cannot be rebuilt inside the training lag.
            </Cap>
            <Stat n="10 years" l="From training inflow to a deployable senior clinician. No firm prices the option of keeping that pipeline open, because the stock is a commons nobody owns." />
          </Sec>

          <Sec id="policy" title="What fixes it" sub="Two failures with different structure, so no single instrument reaches both.">
            <P>
              The static failure is a pricing failure that AI exposed: pay tracks the visit rather than the difficulty. The dynamic
              failure is an unpriced option on human capacity. Distinct failures need distinct instruments.
            </P>
            <InstrumentMap num="Figure 8. Each failure needs its own instrument" />
            <Cap>
              Risk-adjusted reimbursement removes the cream at its source. A skimming tax does it second-best where complexity cannot be
              measured finely enough to price. A training-capacity mandate reaches the pipeline, which no price instrument touches.
            </Cap>
            <P>
              The tax and the mandate are both easy to route around, which argues for federal implementation and for tying the obligation
              to where the patient is. Risk-adjusted pricing sits inside the payment system rather than on the firm, so it is the one to
              reach for first.
            </P>
          </Sec>

          <Sec id="falsify" title="How you would know" sub="Four signatures that show up on the climb, none of which need a job to disappear.">
            <List
              ordered
              items={[
                <>Acuity and cost per encounter rise among providers who are not AI-native, long before any clinician is displaced.</>,
                <>Entry-level and training-eligible caseloads compress inside the settings that produce senior clinicians.</>,
                <>Measurable deskilling appears among clinicians with heavy AI exposure.</>,
                <>Utilization expands while cost per touch falls, as demand follows marginal cost down.</>,
              ]}
            />
            <P>
              The places to look are the settings with clean data and fast automation: AI-native GLP-1 and obesity telehealth,
              virtual-first primary care, behavioral health. The trap springs while the workforce numbers still look fine.
            </P>
            <Aside label="Caveat" title="The load-bearing assumption">
              <p>
                Where reimbursement is already well risk-adjusted, there is no cream and the mechanism does not fire. That is both the
                first-best policy and an empirical question that varies by setting.
              </p>
            </Aside>
            <P>
              Everything here rests on the cross-subsidy. Where reimbursement is already well risk-adjusted the mechanism does not fire,
              which is both the first-best policy and an empirical question by setting. Every other simplification runs the same
              direction, so the real problem is at least as bad as this.
            </P>
          </Sec>
        </article>
      </div>

      <End
        cite={<><strong>Raja, S.</strong> (2026). Healthcare&rsquo;s AI Trap: cream-skimming, cross-subsidy collapse, and the irreversible loss of clinical capacity. Working paper, University of California, San Francisco.</>}
        links={[
          { label: 'Read the full paper (PDF)', href: '/papers/healthcares-ai-trap.pdf' },
          { label: 'Essay version', href: 'https://shanmuraja.substack.com/p/healthcares-ai-trap?r=1hai5c&utm_medium=web' },
          { label: 'The Medi-Cal deserts paper', href: '/papers/medi-cal-deserts' },
        ]}
        sources={SOURCES}
      />
    </>
  )
}
