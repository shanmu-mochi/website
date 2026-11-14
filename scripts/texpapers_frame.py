# Iteration 16: page furniture for the three drafts. Every sentence marked V is checked to occur verbatim in the
# paper (abstract, body, or title footnote); every number in a headline row is checked to occur in the paper text.
# {tab:x}/{fig:x} resolve to the paper's own numbering. Nothing here is from outside the paper.
FRAME = {
 'scheduled-jumps-fda': {
  'status': 'Draft. Comments welcome.',
  'pull': 'Every one prices the chance of approval below one-half, between 0.08 and 0.36, even though most drugs that reach a decision are approved.',
  'head': [
   ['Pending FDA decisions with option chains liquid enough to fit', '13 of 21', 'Live CBOE chains, 18 October 2026 (Section 4)'],
   ['Decisions with a clear binary signal; implied approval probability 0.08 to 0.36', '8', 'Table {tab:live}, Figure {fig:live}'],
   ['Implied move 7.3% against a realized 3.4%; wedge 3.9% (t = 3.37)', '24 resolved', 'Table {tab:main}'],
   ['Short-straddle P&L 1.3% of spot (t = 1.67)', '24 resolved', 'Table {tab:main}'],
   ['Stock-side wedge on resolved decisions', '94 resolved', 'Figure {fig:stockside}'],
  ],
  'limits': [
   'What the pilot cannot do is confirm the premium itself, because the raw rejection gap also follows from time value alone, and the netted test is insignificant at nine rejections.',
   'The eight probabilities are registered but not yet scored, because their outcomes resolve over the coming months.',
   'A historical backfill that would score calibration today needs the paid options-history feed noted in the data section, which the free current-chain feed does not supply.',
  ],
  'chart': 'fda',
 },
 'ai-human-care': {
  'status': 'Draft. Comments welcome. This is a theory paper.',
  'pull': 'The task to automate first is the verifiable one, not the low-stakes one.',
  'head': None,  # theory paper: no measured results, so no headline-findings table
  'limits': [
   'This is a theory paper; the empirical figures it cites come from the public literature reviewed in the project repository, not from proprietary data.',
   'The model is built to be tested, and it says what to measure.',
  ],
 },
}
