/* Iteration 12: what the back of a paper card says. Every sentence here is taken (lightly trimmed,
   never reworded into a new claim) from the paper's own abstract:
   - GLP-1 preprints: src/data/paperDocs.json (Conclusions / Results / Methods paragraphs)
   - white papers: public/papers/healthcares-ai-trap.pdf, public/papers/medi-cal-deserts.pdf (abstract)
   Papers with no text in the repo (the vascular abstracts, works in progress) have no entry, and their
   card back simply omits the finding and N. Keyed by paper title. */
export const FINDINGS = {
  'Same Result, Different Price': {
    finding: 'Branded and compounded tirzepatide were statistically equivalent in six-month effectiveness, so the choice between them is essentially a cost decision.',
    n: '7,271 patients (718 matched pairs)',
  },
  'Off-Trial: Real-World Weight Loss on Tirzepatide & Semaglutide': {
    finding: 'Roughly three in five patients reach the 10% weight-loss threshold, and the tirzepatide advantage over semaglutide does not shrink under propensity-score matching.',
    n: '13,507 patients',
  },
  'Escalate or Switch? The Post-Titration GLP-1 Non-Responder': {
    finding: 'Among confirmed slow responders, within-class dose escalation adds about 0.6 percentage points at 24 weeks; class-switching evidence is inconclusive.',
    n: '24,876 slow responders (of 68,969)',
  },
  'What Week 8 Knows: Forecasting Six-Month GLP-1 Outcomes': {
    finding: 'Observed week-8 weight loss is the strongest predictor of six-month outcome.',
    n: '22,538 patients',
  },
  'Healthcare’s AI Trap': {
    finding: 'The cases AI takes first are at once the money that funds hard care and the making of the people who provide it.',
  },
  'Mapping Medi-Cal Deserts in California': {
    finding: 'Desert counties have 48.6 more preventable hospital admissions per 100,000 residents than non-desert counties, a rate 37% higher.',
    n: 'All 58 California counties',
  },
}
