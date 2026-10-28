#!/usr/bin/env python3
"""Iteration 16: main.tex -> lazily-loaded JSON (KaTeX-prerendered) for the three draft papers.
Copies ONLY: main.pdf (+ FDA supplements) and figures (web-optimized webp). Never .env, notebooks, data/raw."""
import json, re, subprocess, sys, shutil, os, tempfile
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from texpapers_frame import FRAME
from texpapers_charts import CHARTS

SRC = Path('/workspace/research-papers/papers')
WEB = Path(__file__).resolve().parent.parent
PANDOC = '/home/box/.local/lib/python3.13/site-packages/pypandoc/files/pandoc'
PAPERS = {
  'scheduled-jumps-fda': {'date': '2026-10-19', 'supp': ['worked_problem.pdf', 'derivations.pdf']},
  'ai-human-care': {'date': '2026-10-18', 'supp': []},
  'cwm-cardiometabolic': {'date': '2026-10-21', 'supp': []},
}
issues = []
# Key findings: verbatim sentences of each abstract (cwm: its own Results paragraph, split by the page)
KEY = {
  'scheduled-jumps-fda': ['Of 21 decisions, 13 have options liquid enough to fit, and 8 show a clear up-or-down signal; the rest are large firms whose one drug is too small to move the stock, and the model correctly finds no signal there.',
    'Every one prices the chance of approval below one-half, between 0.08 and 0.36, even though most drugs that reach a decision are approved.',
    'These decisions have not happened yet, they resolve between November 2026 and June 2027, so the eight numbers are forecasts recorded in advance that we will score when the outcomes arrive.',
    'The option priced a 7.3% move against an actual 3.4%, so options looked expensive, but the part a seller could keep after buying the position back is only 1.3% of the stock, not statistically different from zero (t=1.67), and it rests on a single event.'],
  'ai-human-care': ['Patients accept AI below a complexity threshold and want a human above it.',
    'The clinic’s best policy is to review every decision above a cutoff in the same index, which is why risk tiers look as they do.',
    'The task to automate first is the verifiable one, not the low-stakes one.',
    'So better AI can raise the right amount of reliance on a human decision-maker for unverifiable, high-stakes decisions rather than lower it.',
    'A human in the loop collapses the gap by raising acceptance and lowering risk at once.'],
}

def webimg(src: Path, dst: Path):
  dst.parent.mkdir(parents=True, exist_ok=True)
  if src.suffix == '.pdf':
    with tempfile.TemporaryDirectory() as t:
      subprocess.run(['pdftocairo', '-png', '-r', '220', '-singlefile', str(src), f'{t}/o'], check=True)
      im = Image.open(f'{t}/o.png'); im.load()
  else:
    im = Image.open(src); im.load()
  if im.mode in ('RGBA', 'LA', 'P'):
    bg = Image.new('RGB', im.size, 'white'); im = im.convert('RGBA'); bg.paste(im, mask=im.split()[-1]); im = bg
  else: im = im.convert('RGB')
  if im.width > 1600: im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
  im.save(dst, 'WEBP', quality=86, method=6)
  return im.width, im.height

def convert(slug, cfg):
  d = SRC / slug; tex = (d / 'main.tex').read_text()
  html = subprocess.run([PANDOC, 'main.tex', '-f', 'latex', '-s', '--citeproc', '--bibliography', 'references.bib',
    '-M', 'link-citations=true', '--section-divs', '--number-sections', '--mathjax', '-t', 'html5'], cwd=d, capture_output=True, text=True, check=True).stdout
  S = BeautifulSoup(html, 'html.parser')
  pub = WEB / 'public' / 'papers' / slug
  if pub.exists(): shutil.rmtree(pub)
  pub.mkdir(parents=True)
  labels = {}  # label -> display number
  # ---- equations: number every equation env in order, as LaTeX would
  n = 0
  for sp in S.select('span.math.display'):
    t = sp.get_text()
    m = re.search(r'\\begin\{equation\}(.*)\\end\{equation\}', t, re.S)
    if m:
      n += 1; body = m.group(1); lab = re.search(r'\\label\{([^}]*)\}', body)
      body = re.sub(r'\\label\{[^}]*\}', '', body)
      sp.string = '\\[' + body.strip() + ' \\tag{%d}\\]' % n
      if lab: labels[lab.group(1)] = str(n); sp['id'] = lab.group(1)
  # ---- tables (LaTeX order of tab: labels)
  tlabs = re.findall(r'\\begin\{table\}.*?\\label\{(tab:[^}]*)\}', tex, re.S)
  for i, tb in enumerate(S.find_all('table'), 1):
    wrap = S.new_tag('figure', attrs={'class': 'tx-table'})
    host = tb.parent if (tb.parent.name == 'div' and not tb.parent.get('class')) else tb
    cap = tb.find('caption')
    fc = S.new_tag('figcaption'); b = S.new_tag('b'); b.string = f'Table {i}. '; fc.append(b)
    if cap:
      for c in list(cap.contents): fc.append(c.extract())
      cap.decompose()
    if i <= len(tlabs): wrap['id'] = tlabs[i-1]; labels[tlabs[i-1]] = str(i)
    host.insert_before(wrap); wrap.append(fc); tsrc = S.new_tag('p', attrs={'class': 'tx-source'}); tsrc.string = f'Source: the paper, Table {i}.'
    scr = S.new_tag('div', attrs={'class': 'tx-scroll'}); wrap.append(scr)
    if host is tb: scr.append(tb.extract())
    else:
      kids = list(host.contents)
      for k in kids:
        k = k.extract()
        if getattr(k, 'name', None) == 'table': scr.append(k)
        elif getattr(k, 'name', None): wrap.append(k)
      host.decompose()
    wrap.append(tsrc)
  # ---- figures
  for i, fg in enumerate(S.find_all('figure', id=re.compile('^fig:')), 1):
    labels[fg['id']] = str(i); img = fg.find(['img', 'embed']); cap = fg.find('figcaption')
    srcp = d / img['src']
    if not srcp.exists() and (d / (img['src'] + '.pdf')).exists(): srcp = d / (img['src'] + '.pdf')
    name = Path(img['src']).stem + '.webp'; w, h = webimg(srcp, pub / name)
    if img.name == 'embed': img.name = 'img'
    img.attrs = {'src': f'/papers/{slug}/{name}', 'width': str(w), 'height': str(h), 'loading': 'lazy', 'decoding': 'async',
                 'alt': 'Figure %d: %s' % (i, re.sub(r'\s+', ' ', cap.get_text()).strip()[:220] if cap else '')}
    fg.attrs = {'id': fg['id'], 'class': 'tx-fig'}
    if cap:
      b = S.new_tag('b'); b.string = f'Figure {i}. '; cap.insert(0, b)
      sl = S.new_tag('p', attrs={'class': 'tx-source'}); sl.string = f'Source: the paper, Figure {i} ({Path(img["src"]).name if False else srcp.relative_to(d)}).'
      fg.append(sl)
  # ---- section labels -> numbers from resolved refs
  for a in S.select('a[data-reference-type]'):
    lab = a.get('data-reference'); txt = a.get_text()
    if not txt.startswith('[') and lab not in labels: labels[lab] = txt
  for a in S.select('a[data-reference-type]'):
    lab = a['data-reference']; num = labels.get(lab)
    if num is None: issues.append(f'{slug}: unresolved ref {lab}'); num = '?'
    a.string = f'({num})' if a['data-reference-type'] == 'eqref' else num
    if lab.startswith('sec:'):  # point at the numbered section
      for sec in S.select('section'):
        h = sec.find(re.compile('^h[1-3]$'))
        hn = h and h.find('span', class_='header-section-number')
        if hn and hn.get_text() == num: a['href'] = '#' + sec['id']; break
    for k in ('data-reference-type', 'data-reference'): del a[k]
  fr = FRAME[slug]
  fill = lambda t: re.sub(r'\{((?:tab|fig):[^}]*)\}', lambda m: labels.get(m.group(1), '?'), t)
  if fr.get('chart'):
    after, svg, cap, src, chk = CHARTS[fr['chart']](d)
    if chk:  # chart values must round to the paper's own Table 1 values
      for tk, dt, q in chk:
        if not re.search(rf'{tk} & {dt} & {q:.2f}', tex): issues.append(f'{slug}: chart value {tk} {dt} {q} not in table')
    fig = BeautifulSoup(f'<figure class="tx-fig tx-chart" id="chart-{fr["chart"]}"><div class="tx-chart-in">{svg}</div><figcaption>{fill(cap)}</figcaption><p class="tx-source">{fill(src)}</p></figure>', 'html.parser')
    S.find(id=after).insert_after(fig)
  # ---- math -> KaTeX
  spans = S.select('span.math')
  jobs = []
  for sp in spans:
    t = sp.get_text(); disp = 'display' in sp['class']
    t = re.sub(r'^\\[\[(]|\\[\])]$', '', t.strip())
    t = re.sub(r'\\label\{[^}]*\}', '', t)
    t = re.sub(r'\\begin\{equation\*?\}|\\end\{equation\*?\}', '', t)
    jobs.append({'tex': t, 'display': disp})
  res = json.loads(subprocess.run(['node', str(WEB / 'scripts/katex-batch.cjs')], input=json.dumps(jobs), capture_output=True, text=True, check=True, cwd=WEB).stdout)
  for sp, r, j in zip(spans, res, jobs):
    if r.get('err'): issues.append(f'{slug}: KaTeX could not render `{j["tex"][:80]}`: {r["err"][:120]}')
    frag = BeautifulSoup(r['html'], 'html.parser')
    sp.clear(); sp.append(frag); sp['class'] = ['tx-eq'] if j['display'] else ['tx-m']
  # ---- theorem-like and proofs
  for cls in ('proposition', 'assumption', 'lemma', 'theorem', 'corollary', 'definition', 'remark', 'proof'):
    for dv in S.select(f'div.{cls}'): dv['class'] = ['tx-thm', f'tx-{cls}']
  # ---- front matter
  title = re.sub(r'\s+', ' ', S.select_one('h1.title').get_text(' ')).replace(' - ', '-').strip()
  author = S.select_one('p.author'); fnref = author.find('a', class_='footnote-ref')
  if fnref: fnref.decompose()
  author = re.sub(r'\s+', ' ', author.get_text()).strip()
  ab = S.select_one('div.abstract'); ab.select_one('.abstract-title').decompose(); ab_html = ''.join(str(c) for c in ab.contents).strip()
  fns = S.select_one('section#footnotes')
  thanks = None; notes = []
  if fns:
    for a in fns.select('a.footnote-back'): a.decompose()
    for li in fns.select('li'):
      inner = ''.join(str(c) for c in li.contents).strip()
      if li['id'] == 'fn1' and S.select_one('header a[href="#fn1"]') is None and thanks is None and 'fn1' not in str(S.select_one('main') or ''):
        pass
      notes.append({'id': li['id'], 'html': inner})
  # thanks = the footnote referenced from the title block (pandoc numbers it fn1)
  if notes and S.select_one('a#fnref1') is None: thanks = notes.pop(0)['html']
  for a in S.select('a.footnote-ref'):
    a['class'] = ['tx-fn']; k = int(a['href'][3:]) - 1; a['href'] = f'#fn{k}'; a['id'] = f'fnref{k}'
    if a.sup: a.sup.string = str(k)
  for i, nt in enumerate(notes, 1): nt['id'] = f'fn{i}'
  refs = S.select_one('div#refs'); refs_html = None
  if refs:
    for e in refs.select('div.csl-entry'): e['class'] = ['tx-ref']
    refs_html = ''.join(str(c) for c in refs.contents).strip(); refs.decompose()
  if fns: fns.decompose()
  S.select_one('header').decompose()
  body = S.body
  secs = []
  for sec in body.find_all('section', class_='level1', recursive=False):
    h = sec.find('h1'); num = h.find('span', class_='header-section-number')
    numt = num.get_text() if num else None
    if num: num.decompose()
    t = re.sub(r'\s+', ' ', h.get_text()).strip(); h.decompose()
    if t.lower() == 'references' and not sec.get_text(strip=True): continue
    for h2 in sec.find_all(['h2', 'h3']):
      hn = h2.find('span', class_='header-section-number')
      if hn: hn['class'] = ['tx-sn']
    secs.append({'id': sec['id'], 'n': numt, 'title': t, 'html': ''.join(str(c) for c in sec.contents).strip()})
  leftover = [c for c in body.contents if getattr(c, 'name', None) and c.name != 'section']
  if leftover: issues.append(f'{slug}: {len(leftover)} body nodes outside sections')
  # ---- PDFs
  shutil.copy2(d / 'main.pdf', pub / 'main.pdf')
  supp = []
  for s in cfg['supp']: shutil.copy2(d / s, pub / s); supp.append(f'/papers/{slug}/{s}')
  abt = re.sub(r'\s+', ' ', BeautifulSoup(ab_html, 'html.parser').get_text())
  key = KEY.get(slug)
  if key is None:
    m = re.search(r'Results\. (.*?) Conclusions\.', abt); key = m and [m.group(1)]
  for k in key or []:
    if k not in abt: issues.append(f'{slug}: key finding not verbatim: {k[:60]}')
  full = re.sub(r'\s+', ' ', abt + ' ' + BeautifulSoup(''.join(x['html'] for x in secs) + (thanks or ''), 'html.parser').get_text()).lower()
  for k in [fr['status'], fr['pull']] + fr['limits'] + [t for _, t in fr.get('steps', [])]:
    for sent in re.split(r'(?<=\.) ', k):
      if sent.lower().rstrip('.') not in full: issues.append(f'{slug}: NOT VERBATIM: {sent[:70]}')
  head = [[fill(c) for c in r] for r in fr['head']] if fr['head'] else None
  for r in head or []:
    for num in re.findall(r'\d[\d,.]*\d|\d', r[0] + ' ' + r[1]):
      if num.rstrip('.') not in full: issues.append(f'{slug}: number {num} not in paper')
  doc = {'frame': {'status': fr['status'], 'pull': fr['pull'], 'head': head, 'limits': fr['limits'], 'steps': fr.get('steps')}, 'key': key, 'keySplit': slug not in KEY, 'slug': slug, 'title': title, 'author': author, 'date': cfg['date'], 'thanks': thanks,
         'abstract': ab_html, 'secs': secs, 'refs': refs_html, 'notes': notes,
         'pdf': f'/papers/{slug}/main.pdf', 'supp': supp}
  return doc

out = {s: convert(s, c) for s, c in PAPERS.items()}
od = WEB / 'src' / 'data' / 'texDocs'; od.mkdir(exist_ok=True)
for s, doc in out.items():
  p = od / f'{s}.json'; p.write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':'))); print('wrote', p, p.stat().st_size)
for s, d in out.items(): print(s, '|', d['title'], '|', d['author'], '| secs', [x['title'] for x in d['secs']], '| notes', len(d['notes']), '| thanks', bool(d['thanks']))
print('\n'.join(issues) or 'no issues')
