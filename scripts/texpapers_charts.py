# Native SVG charts drawn from the papers' own data files (real data only). Black-and-white, hairlines.
import json, csv
from html import escape
F = "font-family:var(--ui);"

def fda(d):
  rows = [r for r in json.load(open(d / 'data/live_implied_q.json')) if r.get('identified') and r.get('binary_signal')]
  rows.sort(key=lambda r: r['pdufa'])
  W, L, R, top, rh = 640, 150, 24, 34, 30; H = top + rh * len(rows) + 40
  x = lambda q: L + q * (W - L - R)
  o = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Implied approval probability for {len(rows)} pending FDA decisions" class="tx-svg">']
  for t in (0, .25, .5, .75, 1):
    o.append(f'<line x1="{x(t):.1f}" x2="{x(t):.1f}" y1="{top-10}" y2="{H-34}" stroke="{"#161616" if t==.5 else "#e4e1da"}" stroke-width="1" {"stroke-dasharray=\'4 3\'" if t==.5 else ""}/>')
    o.append(f'<text x="{x(t):.1f}" y="{H-14}" text-anchor="middle" style="{F}font-size:12px" fill="#555">{t:g}</text>')
  o.append(f'<text x="{x(.5)+6:.1f}" y="{top-14}" style="{F}font-size:11px;letter-spacing:.06em" fill="#161616">ONE-HALF</text>')
  for i, r in enumerate(rows):
    y = top + rh * i + rh / 2
    o.append(f'<text x="0" y="{y+4:.1f}" style="{F}font-size:12.5px;font-weight:600" fill="#161616">{escape(r["ticker"])}</text>')
    o.append(f'<text x="52" y="{y+4:.1f}" style="{F}font-size:12px" fill="#555">{escape(r["pdufa"])}</text>')
    o.append(f'<line x1="{x(0):.1f}" x2="{x(r["q_hat"]):.1f}" y1="{y:.1f}" y2="{y:.1f}" stroke="#161616" stroke-width="1"/>')
    o.append(f'<circle cx="{x(r["q_hat"]):.1f}" cy="{y:.1f}" r="5" fill="#161616"/>')
    o.append(f'<text x="{x(r["q_hat"])+10:.1f}" y="{y+4:.1f}" style="{F}font-size:12px" fill="#161616">{r["q_hat"]:.2f}</text>')
  o.append('</svg>')
  cap = (f'<b>Chart A. </b>Option-implied approval probability <i>q̂</i> for the {len(rows)} pending decisions with an identified binary signal, '
         'by decision date. The dashed line marks one-half. Values are those of Table {tab:live}.')
  src = 'Source: <code>data/live_implied_q.json</code> in the paper’s repository (live CBOE chains, 18 October 2026). Drawn for this page.'
  return 'tab:live', '\n'.join(o), cap, src, [(r['ticker'], r['pdufa'], r['q_hat']) for r in rows]

def cwm(d):
  rows = list(csv.DictReader(open(d / 'data/table_full_population.csv')))
  W, R, top, rh = 640, 250, 8, 52; H = top + rh * len(rows) + 34
  pc = [-100 * float(r['change']) / float(r['before']) for r in rows]
  hi = 5 * (int(max(pc) / 5) + 1)
  x = lambda v: v / hi * (W - R)
  o = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Paired decline as a percent of the before value, six measures" class="tx-svg tx-svg-narrow">']
  for t in range(0, hi + 1, 5):
    o.append(f'<line x1="{x(t):.1f}" x2="{x(t):.1f}" y1="{top}" y2="{H-30}" stroke="{"#161616" if t==0 else "#e4e1da"}" stroke-width="1"/>')
    o.append(f'<text x="{x(t):.1f}" y="{H-10}" text-anchor="{"start" if t==0 else "middle"}" style="{F}font-size:13px" fill="#555">{t}%</text>')
  for i, (r, v) in enumerate(zip(rows, pc)):
    y = top + rh * i
    o.append(f'<text x="6" y="{y+15:.1f}" style="{F}font-size:14px" fill="#161616"><tspan font-weight="600">{escape(r["group"])}</tspan><tspan fill="#555">  {escape(r["measure"])}, n = {int(r["n"]):,}</tspan></text>')
    o.append(f'<rect x="0" y="{y+22:.1f}" width="{x(v):.1f}" height="16" fill="#161616"/>')
    o.append(f'<text x="{x(v)+8:.1f}" y="{y+35:.1f}" style="{F}font-size:13.5px" fill="#161616">{float(r["change"]):g} {escape(r["unit"])} ({r["before"]} to {r["after"]})</text>')
  o.append('</svg>')
  cap = ('<b>Chart B. </b>The paired changes of Table {tab:fullpop}, each drawn as the decline as a percent of its before value so the six measures share one axis; '
         'the label gives the change and the before and after values in the measure’s own unit. Paired changes, not counterfactual effect estimates.')
  src = 'Source: <code>data/table_full_population.csv</code> in the paper’s repository (the de-identified aggregate table behind Table {tab:fullpop}). Percent computed for this page as −change ÷ before.'
  return 'tab:fullpop', '\n'.join(o), cap, src, None

CHARTS = {'fda': fda, 'cwm': cwm}
