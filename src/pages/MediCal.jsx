import React from 'react'
import '../styles/paper.css'
import { Progress, TopBar, Hero, Abstract, Contents, Rail, End } from '../components/paper/Shell'
import { Sec, P, Eq, List, Cap, DataTable, Stat, StepFigure, Aside } from '../components/paper/Bits'
import { PqiGap, DepthOfCare, PcpGap, LamaTrend, CausalForest, CostStack, CountyGrid, CostImpact, QualityGap, Telehealth } from '../components/paper/MediCalFigures'

const TOC = [
  { id: 'access', n: '1', label: 'Insurance is not access' },
  { id: 'define', n: '2', label: 'Defining a desert' },
  { id: 'damage', n: '3', label: 'What it does to people' },
  { id: 'depth', n: '4', label: 'Through the door' },
  { id: 'cycle', n: '5', label: 'Why it persists' },
  { id: 'programs', n: '6', label: 'Do the programs work' },
  { id: 'bill', n: '7', label: 'What it costs' },
  { id: 'fix', n: '8', label: 'What to do' },
  { id: 'limits', n: '9', label: 'What this cannot show' },
]

const SOURCES = [
  'Brooks, R. G., et al. (2002). Practice location of National Health Service Corps scholars.',
  'Cabral, M., Carey, C., & Miller, S. (2021). The impact of provider payments on access.',
  'Clemens, J., & Gottlieb, J. D. (2017). In the shadow of a giant: Medicare’s influence on private payment.',
  'Decker, S. L. (2012). Physician acceptance of new Medicaid patients. Health Affairs.',
  'HRSA (2024). State of the Primary Care Workforce Report.',
  'MACPAC (2022). Medicaid physician payment policy and access to care.',
  'Morgan, A. U., et al. (2019). Community health worker programs and emergency department use.',
  'Pathman, D. E., et al. (2004). Outcomes of states’ scholarship and loan repayment programs.',
  'Polsky, D., et al. (2015). Appointment availability after increases in Medicaid primary care payment. NEJM.',
  'Rabinowitz, H. K., et al. (2008). Medical school programs to increase the rural physician supply.',
  'Traczynski, J., & Udalova, V. (2018). Nurse practitioner independence, utilization, and outcomes.',
  'Xue, Y., et al. (2016). Scope-of-practice regulation and nurse practitioner supply.',
  'Zuckerman, S., et al. (2021). Medicaid physician fees relative to Medicare.',
  'Primary data: AHRQ/OSHPD prevention quality indicators, HCAI emergency encounters and hospital financials, CDPH death profiles, CA Healthcare Payments Database, DHCS enrollment, CHCF quality measures, HRSA provider files, Census ACS.',
]

export default function MediCal() {
  return (
    <>
      <Progress />
      <TopBar
        actions={[
          { label: 'PDF', href: '/papers/medi-cal-deserts.pdf' },
          { label: 'All papers', href: '/papers/' },
        ]}
      />
      <Hero
        eyebrow="Master's thesis · UCSF Health Policy and Law"
        title={<>Mapping<br />Medicaid Deserts</>}
        deck="Eleven California counties where 1.7 million people hold a Medi-Cal card and cannot reliably find a doctor."
        facts={[
          { k: 'Author', v: 'Shanmugesh Raja' },
          { k: 'Program', v: 'UCSF Health Policy and Law' },
          { k: 'Date', v: 'February 2026', dt: '2026-02' },
        ]}
      />

      <Abstract>
        <p>
          California solved coverage. Enrollment went from 8 million to more than 14 million, and one in three Californians is now on
          Medi-Cal. It did not solve supply.
        </p>
        <p>
          In eleven counties there are not enough primary care doctors for the people enrolled. Preventable hospitalizations run 37%
          higher, patients walk out of emergency rooms untreated 38% more often, and hospitals operate at a loss. The excess cost is
          about $82 million a year.
        </p>
        <p>
          Five causal methods test whether the programs aimed at these counties work. None reaches significance, which with 58 counties
          is a power problem rather than a verdict. The number that reframes it: 81.8% of the original gap has already closed.
        </p>
      </Abstract>

      <Contents toc={TOC} />

      <div className="pp-shell">
        <Rail toc={TOC} foot={<>Full thesis as a <a href="/papers/medi-cal-deserts.pdf">PDF</a>.</>} />

        <article className="pp-art">
          <Sec id="access" title="Insurance is not access" sub="The coverage question was settled. The supply question was not.">
            <P>
              Medi-Cal patients still wait longer, still struggle to find a doctor who takes their insurance, and still use emergency
              rooms for what a primary care visit would have handled. The cause is not plan design. California enrolls almost everyone in
              managed care and those plans work tolerably in most of the state.
            </P>
            <P>
              The cause is distribution. Where a physician shortage meets high enrollment, a hospital that loses money, no transit, and
              concentrated poverty, the result is self-reinforcing. This paper calls those counties Medi-Cal deserts.
            </P>
          </Sec>

          <Sec id="define" title="Defining a desert" sub="Built from physician supply alone, which is what makes the rest of the paper non-circular.">
            <P>
              Federal shortage designations sit below the county level and update irregularly. Raw physician counts ignore whether those
              physicians accept Medi-Cal. Averaging both catches the counties that look staffed on paper and are not in practice.
            </P>
            <Aside title="What a PQI actually counts">
              <p>
                Preventable admissions per 100,000 enrollees, for conditions like diabetes, heart failure, and asthma that good outpatient
                care manages without a hospital stay.
              </p>
              <p>
                A high rate is a statement about primary care, not about the hospital.
              </p>
            </Aside>
            <Eq note="Higher is better. The bottom quintile is classified as desert, which picks out counties scoring poorly on both components rather than just one. No health outcome goes into the index, so finding worse outcomes later is a result rather than an artifact.">
              ARI<sub>c</sub> = [ <em>z</em>(physician density) + <em>z</em>(federal shortage score) ] / 2
            </Eq>
            <Aside label="Design note" title="Why this is not circular">
              <p>
                Admissions, emergency use, and mortality are not inputs to the index. It is built from physician supply alone, so finding
                worse outcomes in deserts later is a result rather than arithmetic.
              </p>
            </Aside>
            <CountyGrid num="Figure 1. The bottom quintile of the access index, 11 counties out of 58" />
            <Cap>
              The same eleven appear in the bottom quintile across fifteen years. They are among the poorest counties in the state, with
              large agricultural workforces and high Medi-Cal enrollment.
            </Cap>
          </Sec>

          <Sec id="damage" title="What it does to people" sub="Worse on every dimension that was measured.">
            <P>
              Desert counties run 48.6 more preventable hospital admissions per 100,000 enrollees, a rate 37% higher (p = 0.003). Desert
              status alone explains 14% of the variation across all 58 counties.
            </P>
            <PqiGap num="Figure 2. Preventable hospitalizations per 100,000 Medi-Cal enrollees" />
            <Cap>
              Trajectory anchored to the reported figures: mean rates of 180.2 against 131.7, and 81.8% of the baseline gap closed by the
              end of the period. Both groups improved. Deserts improved faster.
            </Cap>
            <Stat n="+37%" l="More preventable hospital admissions per 100,000 enrollees than the rest of the state, at 180.2 against 131.7." />
            <StepFigure
              num="Figure 3. One year at a time"
              head="Desert counties against the rest of the state"
              steps={[
                { pill: '2020', rows: [['Walked out of the ER', '3.11% vs 2.05%'], ['Gap', '+1.06 pts'], ['Deaths per county', '1.31×', 'mute']] },
                { pill: '2021', rows: [['Walked out of the ER', '3.63% vs 2.44%'], ['Gap', '+1.19 pts'], ['Deaths per county', '1.34×', 'mute']], note: 'The COVID peak. Both gaps are at their widest, which is what happens when the weakest infrastructure meets the period of maximum stress.' },
                { pill: '2022', rows: [['Walked out of the ER', '3.62% vs 2.63%'], ['Gap', '+0.99 pts'], ['Deaths per county', '1.27×', 'mute']] },
                { pill: '2023', rows: [['Walked out of the ER', '3.52% vs 2.54%'], ['Gap', '+0.98 pts'], ['Deaths per county', '1.23×', 'mute']] },
                { pill: '2024', rows: [['Walked out of the ER', '3.26% vs 2.36%'], ['Gap', '+0.90 pts'], ['Deaths per county', 'not yet reported', 'mute']], note: 'Five years on, the gap has narrowed by 0.16 points.' },
              ]}
              caption="Scroll to step through the years, or pick one. The walk-out gap has never closed below 0.90 points, and the mortality ratio has not returned to where it started."
            />
            <P>
              The measure that reads least like a statistic is the share of emergency patients who leave before being treated. People who
              walk out are under pressure they cannot negotiate: cannot miss the shift, cannot cover the bill, nobody to watch the kids.
            </P>
            <LamaTrend num="Figure 4. Share of emergency patients who leave before being treated" />
            <Cap>
              The gap has held between 0.90 and 1.19 points every year since 2020. Emergency admission rates are higher too, consistent
              with patients arriving sicker because they waited.
            </Cap>
          </Sec>

          <Sec id="depth" title="Through the door, and then not much further" sub="The most clinically revealing result in the paper.">
            <P>
              Desert patients actually have slightly more primary care visits than everyone else. What they do not get is what a visit is
              supposed to lead to.
            </P>
            <DepthOfCare num="Figure 5. Service use in desert counties, percent difference from everywhere else" />
            <Cap>
              The appointment is not the bottleneck. The doctor in the room has limited capacity to follow through, and the referral
              network is thin because the local hospital cannot afford specialists.
            </Cap>
            <PcpGap num="Figure 6. Primary care supply, desert counties against the rest of the state" />
            <Cap>
              The deficit is worst for exactly the conditions that generate the most preventable admissions.
            </Cap>
            <QualityGap num="Figure 7. Medi-Cal quality measures, desert counties against the rest of the state" />
            <Cap>
              Only the diabetes control gap reaches statistical significance. The rest trend the same way.
            </Cap>
          </Sec>

          <Sec id="cycle" title="Why it persists" sub="Not a shortage of will or of coverage. A loop that closes on itself.">
            <P>
              High enrollment means low reimbursement, which means fewer doctors, which means hospitals with that payer mix lose money,
              which means no specialists, which makes the primary care that exists less effective, which pushes patients into emergency
              rooms, which raises cost. Then it starts again. Workforce programs act on exactly one link in that chain.
            </P>
            <DataTable
              num="Hospital financial health"
              head={['Metric', 'Desert', 'Rest of state', 'Gap']}
              rows={[
                ['Average operating margin', '−0.3%', '+1.8%', '−2.1 pts'],
                ['Share below −5% margin', '30.4%', '12.1%', '+18.3 pts'],
                ['Share below −15% margin', '15.0%', '4.2%', '+10.8 pts'],
                ['Medi-Cal inpatient share', '39.0%', '28.4%', '+10.6 pts'],
              ]}
              note="Medi-Cal reimburses roughly half of commercial rates for the same service. These hospitals are not badly run. They are penalized for their payer mix, and the inpatient share gap grew from 6.1 points in 2020 to 10.5 in 2024."
            />
            <P>
              Coverage was never the binding constraint: enrollment rates are comparable across desert and non-desert counties. Income
              explains more than desert status does, at 42% of cross-county variation, and transit use runs 0.7% against 3.1%. Telehealth
              is the one bright spot, and a partial one.
            </P>
            <Telehealth num="Figure 8. Telehealth procedures, Medi-Cal against the other payers" />
            <Cap>
              Real growth, and still the smallest user among the payers whose patients need it most. Telehealth also cannot deliver a
              procedure, an exam, or an image.
            </Cap>
          </Sec>

          <Sec id="programs" title="Do the programs work" sub="Five identification strategies, none significant, and a specific reason why.">
            <Aside title="Why the raw numbers read backwards">
              <p>
                Counties with loan repayment awards average a PQI of 273.3 against 252.0 for counties without. That is the programs being
                aimed correctly, not doing harm.
              </p>
              <p>
                They go where outcomes are already worst, so the raw comparison cannot separate cause from targeting.
              </p>
            </Aside>
            <P>
              In raw data, counties with programs look sicker than counties without, because programs go where outcomes are already
              worst. Each method exists to break that confound, and each buys its credibility with a different assumption.
            </P>
            <CausalForest num="Figure 9. Estimated change in preventable hospitalizations per 100,000" />
            <Cap>
              Filled markers are significant, hollow are not, and intervals are reconstructed from the reported estimates and p-values.
              Regression discontinuity and instrumental variables are excluded because both recover targeting rather than effect.
            </Cap>
            <P>
              Detecting the 6.6-point loan repayment signal at 80% power would take about 210 counties. California has 58, and 11 are
              treated. So the honest reading is not that the programs fail. It is that the study cannot resolve them.
            </P>
            <Stat n="81.8%" l="Of the baseline access gap has already closed. No single program can be credited with that. The portfolio together can." />
          </Sec>

          <Sec id="bill" title="What it costs" sub="More spending, less care. The signature of reactive medicine.">
            <P>
              Desert counties cost more per enrollee and deliver fewer procedures, fewer referrals, and worse outcomes. That is what it
              looks like when emergency care substitutes for primary care.
            </P>
            <CostStack num="Figure 10. Annual excess spending attributable to desert conditions" />
            <Cap>
              Nearly all of the excess is emergency utilization: about 124,000 excess visits a year at the Medi-Cal rate of $656 each.
            </Cap>
            <Stat n="$82M" l="Spent every year on the downstream consequences of an access deficit, against a full policy portfolio costing $286M." />
            <DataTable
              num="Annual excess cost, decomposed"
              head={['Category', 'Conservative', 'Central', 'Liberal']}
              rows={[
                ['Excess emergency visits', '$65.2M', '$81.6M', '$97.9M'],
                ['Excess preventable admissions', '$0.3M', '$0.6M', '$0.9M'],
                { sum: true, cells: ['Total', '$65.5M', '$82.2M', '$98.8M'] },
                ['Per desert county', '$5.95M', '$7.47M', '$8.98M'],
                ['Per excess enrollee', '$36.80', '$46.16', '$55.51'],
              ]}
              note="Lost wages, transportation, and caregiving burden are excluded and would raise the total. The state cannot decline to reimburse a preventable admission. It can decline to prevent it."
            />
          </Sec>

          <Sec id="fix" title="What to do" sub="Priced against what each is projected to buy, and meant to run together.">
            <P>
              No single intervention is large enough. These seven address the payment, workforce, hospital, and access barriers at the
              same time, and the effects are not additive because the mechanisms partly overlap.
            </P>
            <CostImpact num="Figure 11. What each recommendation costs against what it is projected to buy" />
            <Cap>
              Scope expansion and transportation are the cheap wins. Payment parity is the expensive one that moves the most.
            </Cap>
            <List
              ordered
              items={[
                <><strong>Raise primary care rates to Medicare parity in shortage counties.</strong> Medi-Cal pays roughly half of Medicare, and a 10% increase is associated with 3.5% more physician participation. Rates retain existing doctors better than they attract new ones.</>,
                <><strong>Triple loan repayment funding and keep the service obligation.</strong> From $28 million a year to $84 million, directed at the eleven counties. The geographic condition is the active ingredient.</>,
                <><strong>Let nurse practitioners and physician assistants practice independently.</strong> The supervision requirement is hardest to satisfy where physicians are scarcest, and independence laws show no quality reduction.</>,
                <><strong>Attach geographic requirements to residency funding.</strong> 55% of physicians trained rurally stay rural, against 15 to 20% of urban-trained physicians who later relocate.</>,
                <><strong>Fund Medi-Cal telehealth properly.</strong> Keep payment parity, fund broadband in the eleven counties, and cut the billing burden that keeps providers out.</>,
                <><strong>Create a sustainability fund for desert county hospitals.</strong> Preventing one closure is worth more than the annual subsidy.</>,
                <><strong>Expand non-emergency medical transportation.</strong> Transport coordination has cut emergency visits about 20% in comparable populations, and the benefit already exists.</>,
              ]}
            />
            <DataTable
              num="Full implementation, projected over ten years"
              head={['Recommendation', 'Annual cost', 'PQI reduction', 'Visits averted', 'Net savings']}
              rows={[
                ['Medicare parity payment', '$120M', '−12 to −18', '18,000–27,000', '$12–18M'],
                ['Loan repayment tripling', '$56M', '−4 to −8', '6,000–12,000', '$4–8M'],
                ['NP and PA independence', '$5M', '−3 to −6', '4,500–9,000', '$3–6M'],
                ['Rural residency pipeline', '$15M', '−2 to −5', '3,000–7,500', '$2–5M'],
                ['Telehealth investment', '$30M', '−2 to −4', '3,000–6,000', '$2–4M'],
                ['Hospital sustainability fund', '$40M', '−1 to −3', '1,500–4,500', '$1–3M'],
                ['Transportation expansion', '$20M', '−3 to −6', '4,500–9,000', '$3–6M'],
                { sum: true, cells: ['Combined portfolio', '$286M', '−27 to −50', '40,500–75,000', '$27–50M'] },
              ]}
              note="Order-of-magnitude estimates grounded in external effect sizes, not forecasts. Net annual cost against the $82 million baseline is about $204 million, before the excluded indirect costs and the closure risk the hospital fund insures against."
            />
          </Sec>

          <Sec id="limits" title="What this cannot show" sub="Stated plainly, because the honest version is the useful one.">
            <List
              items={[
                <><strong>Sample size, above all.</strong> 58 counties, 11 treated. Non-significant results are inconclusive, not null.</>,
                <><strong>The index does not move over time.</strong> Which rules out county fixed effects, the best control for stable differences between places.</>,
                <><strong>Every identification assumption is contestable.</strong> The instrument in particular assumes rurality touches health only through provider access, which is false.</>,
                <><strong>The cost estimates are approximations.</strong> Average reimbursement rates, and no indirect costs at all.</>,
                <><strong>County averages hide what happens inside a county.</strong> Some deserts hold a small city with decent access surrounded by areas with almost none.</>,
              ]}
            />
          </Sec>
        </article>
      </div>

      <End
        cite={<><strong>Raja, S.</strong> (2026). Mapping Medicaid Deserts: Provider Shortages, Preventable Hospitalizations, and the Limits of Workforce Policy in California&rsquo;s Medi-Cal System. Master&rsquo;s thesis, UCSF Health Policy and Law.</>}
        links={[
          { label: 'Read the full thesis (PDF)', href: '/papers/medi-cal-deserts.pdf' },
          { label: 'Healthcare’s AI Trap', href: '/papers/ai-trap' },
        ]}
        sources={SOURCES}
      />
    </>
  )
}
