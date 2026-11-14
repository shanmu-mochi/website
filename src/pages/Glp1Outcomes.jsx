import React from 'react'
import '../styles/paper.css'
import { Progress, TopBar, Hero, Abstract, Contents, Rail, End } from '../components/paper/Shell'
import { Sec, P, Cap, List, Stat, DataTable, Aside } from '../components/paper/Bits'
import { LinkageFlow, RegressionBars, EffectsDots, WeightShare } from '../components/paper/Glp1Figures'

const PDF = '/papers/glp1-blood-pressure-hba1c-lipids.pdf'
const SSRN = 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7701298'

const TOC = [
  { id: 'question', n: '1', label: 'The question' },
  { id: 'records', n: '2', label: 'Outside records' },
  { id: 'design', n: '3', label: 'A comparison group' },
  { id: 'effects', n: '4', label: 'What moved' },
  { id: 'mean', n: '5', label: 'The fall that happens anyway' },
  { id: 'checks', n: '6', label: 'Checks' },
  { id: 'weight', n: '7', label: 'How much is weight' },
  { id: 'health', n: '8', label: 'What it means' },
  { id: 'limits', n: '9', label: 'Limits and asks' },
]

const SOURCES = [
  'Barnett, A. G., van der Pols, J. C., & Dobson, A. J. (2005). Regression to the mean: what it is and how to deal with it. International Journal of Epidemiology, 34(1).',
  'Blood Pressure Lowering Treatment Trialists’ Collaboration. (2021). Pharmacological blood pressure lowering for primary and secondary prevention of cardiovascular disease across different levels of blood pressure. The Lancet, 397.',
  'Borusyak, K., Jaravel, X., & Spiess, J. (2024). Revisiting event-study designs: robust and efficient estimation. Review of Economic Studies, 91(6).',
  'Callaway, B., & Sant’Anna, P. H. C. (2021). Difference-in-differences with multiple time periods. Journal of Econometrics, 225(2).',
  'Cholesterol Treatment Trialists’ Collaboration. (2010). Efficacy and safety of more intensive lowering of LDL cholesterol. The Lancet, 376.',
  'Krumholz, H. M., de Lemos, J. A., Sattar, N., et al. (2024). Tirzepatide and blood pressure reduction: stratified analyses of the SURMOUNT-1 randomised controlled trial. Heart, 110(19).',
  'Colhoun, H. M., Lincoff, A. M., Ryan, D., et al. (2026). Semaglutide and cardiovascular risk reduction: a mediation analysis of the SELECT trial. European Heart Journal.',
  'Lincoff, A. M., et al. (2023). Semaglutide and cardiovascular outcomes in obesity without diabetes (SELECT). New England Journal of Medicine, 389.',
  'Lipsitch, M., Tchetgen Tchetgen, E., & Cohen, T. (2010). Negative controls: a tool for detecting confounding and bias in observational studies. Epidemiology, 21(3).',
  'Lu, Y., et al. (2025). Changes in cardiovascular risk factors and health care expenditures among patients prescribed semaglutide. JAMA Network Open, 8(8).',
  'Neter, J. E., Stam, B. E., Kok, F. J., Grobbee, D. E., & Geleijnse, J. M. (2003). Influence of weight reduction on blood pressure: a meta-analysis of randomized controlled trials. Hypertension, 42(5).',
]

export default function Glp1Outcomes() {
  return (
    <>
      <Progress />
      <TopBar
        actions={[
          { label: 'PDF', href: PDF },
          { label: 'SSRN', href: SSRN },
          { label: 'All papers', href: '/papers/' },
        ]}
      />
      <Hero
        eyebrow="Preprint · Real-world evidence"
        title={<>GLP-1s and the<br />Numbers Outside</>}
        deck="Blood pressure, HbA1c and lipids for 193,932 telehealth patients, measured by their own outside clinicians and set against patients who had not started yet."
        facts={[
          { k: 'Author', v: 'Shanmu Raja, MS' },
          { k: 'Affiliation', v: 'Mochi Health' },
          { k: 'Version', v: 'Preprint, November 2026', dt: '2026-11' },
          { k: 'DOI', v: '10.2139/ssrn.7701298', href: 'https://doi.org/10.2139/ssrn.7701298' },
        ]}
      />

      <Abstract>
        <p>
          Telehealth GLP-1 programs usually grade themselves: weights the patient reports, labs the program ordered, and no one to
          compare against.
        </p>
        <p>
          This paper pulls each member&rsquo;s readings from the clinicians they see outside the program, and uses members who start
          later as the comparison. Six to twelve months in, systolic pressure is 4.9 mmHg lower than expected, HbA1c 0.21 points,
          LDL 5 mg/dL, triglycerides 19 mg/dL and weight 22 lb.
        </p>
        <p>
          Those effects are real, and 11% to 28% smaller than the simple before-and-after numbers. In patients picked for a high
          reading, most of the drop is regression to the mean.
        </p>
      </Abstract>

      <Contents toc={TOC} />

      <div className="pp-shell">
        <Rail toc={TOC} foot={<>Full paper as a <a href={PDF}>PDF</a>, or on <a href={SSRN}>SSRN</a>.</>} />

        <article className="pp-art">
          <Sec id="question" title="The question" sub="What patients get for the money, measured by someone other than the program.">
            <P>
              Telehealth companies now prescribe GLP-1s to hundreds of thousands of Americans, and employers, payers and regulators want
              to know what those patients get. The evidence so far answers a narrower question. Program cohorts report weight, often
              self-reported, and sometimes labs the program ordered itself. Health-system studies use clinician values but mostly compare
              patients with their own past.
            </P>
            <P>
              The one large study that used patients not yet treated as controls found a systolic effect of 1.1 mmHg, far below the
              uncontrolled figures.
            </P>
          </Sec>

          <Sec id="records" title="Outside records" sub="Readings from care that would have happened without the program.">
            <P>
              With consent, the program retrieved each member&rsquo;s records through national health-information exchange: lab panels,
              vital signs and diagnoses held by the health systems they already use. No one at the program ordered, took or recorded
              these readings.
            </P>
            <LinkageFlow num="Figure 1. Who is in the study" />
            <Cap>
              The median member with any outside reading has records from two outside organizations and 87 readings. Members were mostly
              women in their early forties, with a BMI of about 34 and near-normal average blood pressure, HbA1c and lipids.
            </Cap>
            <Stat n="23.7 million" l="Outside readings across 168,819 members. No GLP-1 or telehealth study we know of has measured outcomes this way." />
          </Sec>

          <Sec id="design" title="A comparison group" sub="Members who start later stand in for what would have happened.">
            <P>
              Members start at different times, and the exchange returns years of earlier records. So for every reading after a
              member&rsquo;s first fill, a model fit only on untreated readings predicts what the value would have been, and the gap is
              the effect. Readings from the year before the first fill are left out of the fit and serve as a placebo period.
            </P>
            <Aside label="Design" title="Why the two cohorts are kept apart">
              <p>
                Members who started on branded medication and those who started on compounded medication differ in start dates, agent
                mix, and possibly how they pay. Pooling them would mix those differences into one number, so every model is fit within
                each cohort on its own.
              </p>
              <p>The paper does not compare branded with compounded medication, and nothing here should be read that way.</p>
            </Aside>
            <P>
              A simpler check stacks members by month of first fill, gives treated and not-yet-treated members the same windows and the
              same selection rule, and reports both changes and their difference.
            </P>
          </Sec>

          <Sec id="effects" title="What moved" sub="Six to twelve months after the first fill.">
            <P>
              Systolic pressure falls about 2.8 mmHg in the first quarter and 4.9 mmHg at six to twelve months, and is still 5.1 mmHg
              lower at one to two years. HbA1c falls 0.21 points, 0.25 in members diagnosed with diabetes or prediabetes. Weight recorded
              by outside clinicians is 22.2 lb lower at six to twelve months and 28.9 lb lower at one to two years.
            </P>
            <EffectsDots num="Figure 2. Target measures moved. Placebo measures did not." />
            <Cap>
              Each measure in its own person-to-person standard deviations, so they share one scale. Bars are 95% intervals. The two
              cohorts sit on adjacent lines to save space; they are not a comparison.
            </Cap>
            <DataTable
              num="Table 1. Effects at six to twelve months"
              head={['Measure', 'Branded cohort', 'Compounded cohort']}
              rows={[
                ['Systolic BP (mmHg)', '−5.1', '−4.9'],
                ['Diastolic BP (mmHg)', '−2.6', '−2.3'],
                ['HbA1c (points)', '−0.19', '−0.21'],
                ['Fasting glucose (mg/dL)', '−7.7', '−7.1'],
                ['LDL cholesterol (mg/dL)', '−6.2', '−5.0'],
                ['Triglycerides (mg/dL)', '−22.8', '−19.2'],
                ['Weight, outside scales (lb)', '−22.7', '−22.2'],
              ]}
              note="Imputation event study, each cohort fit separately. The branded cohort is small, so its estimates are less precise."
            />
            <P>
              Tirzepatide shows larger effects than semaglutide on weight, systolic pressure, HbA1c and triglycerides within each cohort,
              the same order the trials found. Effects appear in every sex, age, BMI and race group large enough to estimate.
            </P>
          </Sec>

          <Sec id="mean" title="The fall that happens anyway" sub="Pick people at a high reading and they come down, treated or not.">
            <P>
              Among members with high systolic pressure at baseline, those who started a GLP-1 fell 13.9 mmHg. That is the size of figure
              programs usually quote. Members picked the same way who had not started fell 10.1 mmHg on their own.
            </P>
            <RegressionBars num="Figure 3. Most of the quoted drop happens without the drug" />
            <Cap>
              The difference is about 3.7 mmHg whichever way the group is chosen: high at baseline, in range, everyone. Reports that
              pick a high baseline and present the fall as the outcome overstate the effect roughly fourfold.
            </Cap>
            <DataTable
              num="Table 2. How much smaller the controlled effect is than the raw before-and-after change"
              head={['Measure', 'Smaller by']}
              rows={[
                ['Systolic BP, everyone', '14%'],
                ['Systolic BP, diagnosed hypertension', '28%'],
                ['HbA1c', '14%'],
                ['LDL cholesterol', '27%'],
                ['Triglycerides', '21%'],
                ['Fasting glucose', '11%'],
              ]}
            />
          </Sec>

          <Sec id="checks" title="Checks" sub="Measures the drug should not touch, and the program&rsquo;s own scale.">
            <P>
              Sodium and potassium are tightly regulated and should not change. They do not: sodium is 0.05 mmol/L above prediction at
              six to twelve months against 0.07 in the 90 days before the first fill. Hemoglobin, platelets and TSH drift a little, in
              ways weight loss explains, with no step at the start of treatment.
            </P>
            <P>
              The program&rsquo;s weights agree with outside clinicians&rsquo; weights taken within a week: 95,694 pairs, a mean
              difference under a pound, and a correlation of 0.96. In the linked cohort, program weights fell 10.2% at six months and
              14.3% at twelve.
            </P>
            <Stat n="0.96" l="Correlation between program-recorded and outside-recorded weights, across 95,694 pairs." />
          </Sec>

          <Sec id="weight" title="How much is weight" sub="The data cannot say, and the paper says so.">
            <P>
              Within a member, a pound of weight moves systolic pressure by about 0.08 to 0.09 mmHg. Applied to the 22 lb effect, that
              covers 37% to 40% of the systolic effect. But that slope comes from ordinary swings in weight. Trials of sustained weight
              loss find more than five times as much, which would explain more than the whole effect.
            </P>
            <WeightShare num="Figure 4. A third of the effect, or all of it" />
            <Cap>
              Depending on which slope you believe, the weight share of the systolic effect is anywhere from about a third to all of it.
              Observational claims that most of the benefit arrives &ldquo;beyond weight&rdquo; should be read in that light.
            </Cap>
          </Sec>

          <Sec id="health" title="What it means" sub="Small shifts in people who are close to normal.">
            <P>
              In 48 blood-pressure trials with 344,716 people, each 5 mmHg lower systolic pressure cut major cardiovascular events by
              about 10%, at every starting pressure. Each 38.7 mg/dL lower LDL cut major vascular events by about 22%. Applied here, and
              assuming the two act independently, the effects correspond to roughly 12% fewer major cardiovascular events.
            </P>
            <Stat n="12%" l="Fewer major cardiovascular events, if the blood pressure and LDL changes last. A projection from trials, not events counted in this cohort." />
            <P>
              The effects appear in members whose starting values were close to normal, the range where few people are treated for blood
              pressure or cholesterol, and they come from ordinary telehealth care rather than a trial.
            </P>
          </Sec>

          <Sec id="limits" title="Limits and asks" sub="Who this describes, and what programs should report.">
            <Aside label="Caveat" title="These are people who stayed on treatment">
              <p>
                Records were linked for members active in 2026. Among everyone who started by October 2025, 51% were still filling twelve
                months later; among linked members it is 99%. The estimates describe persistent users, not everyone who starts.
              </p>
            </Aside>
            <P>
              Outside readings happen when patients see clinicians, so testing frequency carries information. Outside prescriptions are
              not observed consistently, so a new statin or blood pressure drug could account for part of an effect. The author works for
              the program studied, which prescribes both branded and compounded GLP-1s.
            </P>
            <List
              ordered
              items={[
                <>Report outcomes measured outside the program, against patients who have not started yet.</>,
                <>Stop reporting changes in groups picked for a high baseline reading.</>,
                <>Report persistence next to outcomes.</>,
                <>Treat observational claims about how much benefit runs through weight as unknown.</>,
              ]}
            />
          </Sec>
        </article>
      </div>

      <End
        cite={<><strong>Raja, S.</strong> (2026). GLP-1s and Reductions in Blood Pressure, HbA1c and Lipids in US Telehealth Patients. SSRN preprint 7701298. doi:10.2139/ssrn.7701298</>}
        links={[
          { label: 'Read the full paper (PDF)', href: PDF },
          { label: 'On SSRN', href: SSRN },
          { label: 'Healthcare’s AI Trap', href: '/papers/ai-trap' },
        ]}
        sources={SOURCES}
      />
    </>
  )
}
