/* Iteration 15: published abstracts for the papers whose text is not in the repo, plus a short
   front-of-card excerpt for every paper. Every sentence is copied from a public source (never reworded
   into a new claim). Sources, checked 28 Oct 2026:
   - Helical: PubMed PMID 42305171 + Crossref 10.1016/j.xjse.2025.100069
   - PETTICOAT geometric (JVS 79(6) e149–e150, poster IP057): jvascsurg.org article page + Crossref
   - Longitudinal mapping (JVS 77(4) 64S–65S, April 2023 supplement): jvascsurg.org / doi page + Crossref + ORCID (WOS:000994639100142)
   - TEVAR + PETTICOAT (JVS-CIT 12(5) 102363): PubMed PMID 42494499 + Crossref
   - Preprints and white papers: excerpt = first sentence of the abstract in the repo PDF.
   Works in progress: only what the repo already says. Keyed by paper title. */
export const ABSTRACTS = {
  'Same Result, Different Price': { excerpt: 'Compounded tirzepatide is prescribed at scale as a cheaper substitute for branded Mounjaro and Zepbound.' },
  'Off-Trial: Real-World Weight Loss on Tirzepatide & Semaglutide': { excerpt: 'GLP-1 receptor agonist trials are tightly controlled. The real world is none of those things.' },
  'Escalate or Switch? The Post-Titration GLP-1 Non-Responder': { excerpt: 'When a GLP-1 patient stops responding, should the clinician push the dose or change the drug?' },
  'What Week 8 Knows: Forecasting Six-Month GLP-1 Outcomes': { excerpt: 'Patients on GLP-1 medications lose very different amounts of weight.' },
  'Healthcare’s AI Trap': { excerpt: 'In clinical care the routine cases do double duty. AI automates them first, severing both supports at once.' },
  'Mapping Medi-Cal Deserts in California': { excerpt: 'Having health insurance does not guarantee access to healthcare.' },
  'Helical Classification of Type B Aortic Dissections': {
    fullTitle: 'Helical classification of type B aortic dissections',
    authors: 'Bondesson J, Raja S, Suh G-Y, Ullery BW, Dake MD, Lee JT, Cheng CP',
    journal: 'JTCVS Structural and Endovascular', cite: 'JTCVS Struct Endovasc. 2025 Dec;8:100069', year: '2025', pmid: '42305171',
    n: '102 patients',
    excerpt: 'From computed tomography of 102 patients, type B dissections were geometrically modeled and helical properties were quantified.',
    finding: 'There were 4 distinct helical groups: right-hand chiral, left-hand chiral, mixed-chiral, and nonhelical.',
    keywords: ['false lumen', 'ostial avulsion', 'renovisceral perfusion', 'spiral morphology', 'thoracic aortic dissection', 'true lumen'],
    abstract: [
      ['Objective', 'Although anecdotal findings of spiraling aortic dissections have been reported, the mechanisms of dissection propagation are unclear; hence, we categorized type B dissection helicity and mechanistically explain distinct propagation patterns.'],
      ['Methods', 'From computed tomography of 102 patients, type B dissections were geometrically modeled from entry tear to renovisceral aorta and helical properties were quantified.'],
      ['Results', 'There were 4 distinct helical groups: right-hand chiral, left-hand chiral, mixed-chiral, and nonhelical. Right- and left-hand chiral cases exhibit true lumen blood supply to the celiac artery (CA) from the left side, whereas mixed-chiral and nonhelical cases supply the CA from the right, with only a few exceptions of CA ostial avulsion.'],
      ['Conclusions', 'Although left-hand chiral dissections make a gentle twist to have the true lumen supplying the CA from the left side, the right-hand cases must twist in the opposite direction much more dramatically to supply the CA also from the left. The prevalence of mixed-chiral cases suggests that chirality in the proximal descending thoracic aorta tends to reverse spiraling direction to supply the CA via the true lumen. This mechanistic description of dissection propagation improves the understanding of aortic dissection anatomy and pathophysiology, paving the way for better diagnostics and treatments.'],
    ],
    source: 'Abstract from PubMed (PMID 42305171).',
  },
  'Geometric Analysis of Aortic Remodeling After PETTICOAT (Type B Dissection)': {
    fullTitle: 'Geometric Analysis of Aortic Remodeling After PETTICOAT Technique in Type B Aortic Dissection',
    authors: 'Ullery BW, Suh G-Y, Bondesson J, Raja S, Cheng C',
    journal: 'Journal of Vascular Surgery', cite: 'J Vasc Surg. 2024 Jun;79(6):e149–e150. Interactive poster IP057', year: '2024',
    n: '10 patients',
    excerpt: 'We aim to examine the impact of TEVAR with the PETTICOAT technique on remodeling as it relates to geometric changes of the aorta.',
    finding: 'The aortic true lumen appeared to have greater early geometric remodeling potential compared with the false lumen in the descending and abdominal aorta.',
    abstract: [
      ['Objectives', 'We aim to examine the impact of thoracic endovascular aortic repair (TEVAR) with provisional extension to induce complete attachment (PETTICOAT) technique on remodeling as it relates to geometric changes of the aorta.'],
      ['Methods', 'Clinical and radiographic data for 10 patients (all male; mean age, 68.3 years) with type B aortic dissection (TBAD) treated with TEVAR + PETTICOAT at a single institution were examined. Indications for intervention included malperfusion (n = 5), false lumen aneurysmal degeneration (n = 3), or refractory pain (n = 2). Geometric analysis of the dissected aorta and associated deformation induced by TEVAR + PETTICOAT were analyzed using patient-specific computational modeling. Utilizing pre- and post-intervention computed tomographic angiography, centerline and cross-section measurements were obtained along the entire aortic wall, as well as true and false lumens. Anatomic locations of the supra-aortic arch and renovisceral branches were extracted. Aortic arclength, curvature, cross-sectional area, and circumferences of the ascending aorta, aortic arch, descending thoracic, and abdominal aorta were computed to quantify pre-to-post-TEVAR + PETTICOAT remodeling.'],
      ['Results', 'From pre- to post-TEVAR + PETTICOAT, the true lumen exhibited a significant reduction of the peak curvature at the aortic arch (pre: 0.043/mm vs post: 0.030/mm; P = .05) and descending thoracic aorta (pre: 0.038/mm vs post: 0.034/mm; P = .02). Ascending aortic whole lumen had significantly decreased area and circumference (pre: 1136 mm² vs post: 1062 mm² [−6.5%]; P = .01 and pre: 119 mm vs post: 116 mm [−2.6%]; P = .01, respectively) post-intervention. Conversely, increased area and circumference of the true lumen was noted in the descending thoracic (pre: 366 mm² vs post: 657 mm² [+79.5%]; P = .0001 and pre: 71 mm vs post: 90 mm [+26.8%]; P = .0002, respectively) and abdominal (pre: 229 mm² vs post: 293 mm² [+27.9%]; P = .002 and pre: 56 mm vs post: 61 mm [+8.9%]; P = .007, respectively) aorta as a result of TEVAR + PETTICOAT. The false lumen area decreased in the aortic arch (pre: 192 mm² vs post: 70 mm² [−63.5%]; P = .03) and descending thoracic aorta (pre: 690 mm² vs post: 505 mm² [−26.8%]; P = .01). False lumen geometric remodeling in the abdominal aorta was not significant across any parameter.'],
      ['Conclusions', 'TEVAR + PETTICOAT results in geometric deformations of both the treated thoracoabdominal aorta and untreated ascending and aortic arch. Based on percentage change and statistical significance, the aortic true lumen appeared to have greater early geometric remodeling potential compared with the false lumen in the descending and abdominal aorta.'],
    ],
    source: 'Meeting abstract as published in the Journal of Vascular Surgery (jvascsurg.org, doi 10.1016/j.jvs.2024.03.183). Not indexed in PubMed.',
  },
  'Longitudinal Mapping of True Lumen Morphology for Endograft Oversizing': {
    fullTitle: 'Longitudinal Mapping of True Lumen Morphology for Accurate Endograft Oversizing in Patients with Type B Aortic Dissections',
    authors: 'Bondesson J, Raja S, Suh G-Y, Dake MD, Lee JT, Cheng CP',
    journal: 'Journal of Vascular Surgery', cite: 'J Vasc Surg. 2023 Apr;77(4 Suppl):64S–65S', year: '2023',
    n: '20 patients',
    excerpt: 'This study maps preoperative aortic morphology and incorporates device specifications to analyze longitudinal oversizing variation using two different methods.',
    finding: 'Oversizing increases distally as the proximal landing zone is in the nondissected aorta and the true lumen tends to taper; tapered devices may be preferable.',
    abstract: [
      ['Objective', 'When planning thoracic endovascular aortic repair (TEVAR), proper selection of endograft size is important to achieve adequate seal in landing zones and avoid complications. This study maps preoperative aortic morphology and incorporates device specifications to analyze longitudinal oversizing variation using two different methods.'],
      ['Methods', 'Computed tomography angiograms of patients before and after TEVAR of type B aortic dissection were used to construct geometric models of the aorta, endograft, and arch branch vessels. Using the left common carotid artery as a fiducial marker, the endograft-covered aortic segment was indexed to the pre-TEVAR anatomy. In this region, true lumen major diameter, as well as diameter derived from circumference, were measured. Longitudinally mapped oversizing was defined along the whole length using the localized measured diameter and the endograft device diameter specification. Two-tailed, paired t tests were used to compare between the two methods, as well as between longitudinal regions.'],
      ['Results', 'Twenty patients with type B aortic dissection (62.8 ± 9.9 years; 15.0% female) were treated with TEVAR with one or two endografts (W. L. Gore & Associates, Newark, DE). Length-averaged oversizing was lower in the proximal landing zone compared with the distal landing zone and the whole stented region irrespective of methods (P < .05), except for whole stented region versus proximal landing zone using the major diameter method (P = .07). Length-averaged oversizing differed significantly between methods in all regions (P < .05).'],
      ['Conclusions', 'Oversizing increases distally as the proximal landing zone is in the nondissected aorta and the true lumen tends to taper. Therefore, tapered devices may be preferable to avoid excessive distal oversizing. The fact that both methods had significantly different oversizing levels in all comparisons confirms the theoretical difference for the methods. For a circular cross-section, the methods are identical, while the discrepancy increases with eccentricity. Since the circumference-based method accounts for irregular cross-sections accurately, it is superior for sizing …'],
    ],
    source: 'Meeting abstract as published in the J Vasc Surg April 2023 supplement (doi 10.1016/j.jvs.2023.01.171). The public text breaks off mid-sentence at the end of the conclusions; it is shown as far as it goes. Not indexed in PubMed.',
  },
  'Aortic Remodeling after TEVAR and PETTICOAT (Complicated Type B Dissection)': {
    fullTitle: 'Aortic remodeling after thoracic endovascular aortic repair and Provisional ExTension To Induce COmplete ATtachment to treat complicated type B aortic dissection',
    authors: 'Suh G-Y, Bondesson J, Raja S, Naqvi K, Cheng CP, Ullery BW',
    journal: 'Journal of Vascular Surgery Cases, Innovations and Techniques', cite: 'J Vasc Surg Cases Innov Tech. 2026 Oct;12(5):102363', year: '2026', pmid: '42494499',
    n: '20 patients',
    excerpt: 'This study evaluated early geometric remodeling of the true and false lumens and the whole aorta following TEVAR with PETTICOAT using patient-specific computational modeling.',
    finding: 'TEVAR with PETTICOAT results in measurable geometric remodeling in the first 30 days, most pronounced within the true lumen.',
    keywords: ['Computed tomography', 'Dissection', 'PETTICOAT', 'Remodeling', 'TEVAR'],
    abstract: [
      ['Objective', 'Aortic remodeling after thoracic endovascular aortic repair (TEVAR) for complicated type B aortic dissection remains insufficiently characterized, particularly when the Provisional ExTension To Induce COmplete ATtachment (PETTICOAT) technique is applied. This study evaluated early geometric remodeling of the true and false lumens and the whole aorta following TEVAR with PETTICOAT using patient-specific computational modeling.'],
      ['Methods', 'A single-center retrospective review of 20 patients (16 men; age, 65 ± 11 years; nine acute, seven subacute, and four chronic) with type B aortic dissection treated with TEVAR and PETTICOAT was performed. Pre- and postintervention computed tomography angiography was used to extract centerlines and cross-sectional measurements along the entire aorta. Patient-specific computational simulations quantified changes in aortic arclength, curvature, cross-sectional area, and circumference across the ascending aorta, arch, descending thoracic aorta, and abdominal aorta. Remodeling was assessed by comparing geometric parameters from preoperative and the first available postoperative computed tomography angiography (mean interval from surgery, 82 ± 305 days; median, 14 days).'],
      ['Results', 'In the first 30 days, one patient died, and the rest were free from reintervention. False lumen thrombosis was documented in 10 patients (50%) during early (<30 day) imaging and in 14 patients (70%) within 24-month surveillance. TEVAR with PETTICOAT produced significant true lumen expansion, including reduced curvature in the aortic arch and descending thoracic aorta (P < .05), and increased abdominal aortic arclength (13.1 ± 2.6 to 13.8 ± 2.3 cm; P < .05). True-lumen circumference increased at the arch (10.1 ± 1.7 to 10.5 ± 1.4 cm), descending thoracic aorta (7.1 ± 1.2 to 9.1 ± 1.2 cm), and abdominal aorta (5.7 ± 1.0 to 6.5 ± 1.0 cm; P < .05). The whole aorta circumference increased only in the descending thoracic segment (P < .05), whereas the false lumen cross-sectional area showed no significant change.'],
      ['Conclusions', 'TEVAR with the PETTICOAT technique results in measurable geometric remodeling in the first 30 days, most pronounced within the true lumen across thoracic and abdominal segments. Whole aorta and false lumen changes were limited, suggesting a preferential true lumen response to intervention.'],
    ],
    source: 'Abstract from PubMed (PMID 42494499).',
  },
  // works in progress: no public abstract found; only what the repo already states
  'Concordance of LLMs with Guidelines at the Week-8 GLP-1 Follow-Up': { wip: true, excerpt: '714 telehealth encounters. Claude, GPT-4o, Gemini vs FDA & AGA guidance.' },
  'Branded Wegovy™ vs. Compounded Semaglutide + Cyanocobalamin': {
    wip: true, excerpt: 'Retrospective observational study, Mochi Health.',
    status: 'Listed as an article in process at the Journal of Obesity and Metabolic Diseases (JScholar) under the title “Effectiveness, Adherence, and Safety of Branded Wegovy™ vs. Compounded Semaglutide + Cyanocobalamin (CSC)”; no abstract is public yet.',
    statusHref: 'https://www.jscholaronline.org/journals/journal-of-obesity-and-metabolic-diseases/articles-in-process.php',
  },
  'Variation of Reimbursements within DRGs in Orthopedic Trauma': { wip: true, excerpt: 'Healthcare economics and policy.' },
}
