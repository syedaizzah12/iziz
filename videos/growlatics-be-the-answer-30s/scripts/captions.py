# Word-timed captions: whisper word times (audio/vo/words.json) mapped through vo.json placements → film/captions.js
# Chunks of 2–4 words; each word appears at its spoken time; a chunk holds until the next chunk starts (or 0.5 s after its last word).
import json, re
from pathlib import Path
W = json.loads(Path('audio/vo/words.json').read_text())
VO = json.loads(Path('vo.json').read_text())['phrases']
P = {p['id']: p for p in json.loads(Path('audio/vo_placed.json').read_text())}
def norm(s): return re.sub(r"[^a-z']", '', s.lower().replace('’', "'"))
chunks = []
for ph in VO:
    t0 = P[ph['id']]['t0']; tempo = ph.get('tempo', 1.0)
    words = ph['text'].replace('…', '').split()
    ws = [w for w in W[ph['take']] if w[1] >= ph['from'] - 0.08 and w[1] < ph['to'] - 0.05]
    times = []
    for i, w in enumerate(words):
        # match by order; fall back to even spread
        src = ws[i][1] if i < len(ws) else (ph['from'] + (ph['to'] - ph['from']) * i / len(words))
        times.append(round(t0 + max(0, src - ph['from']) / tempo, 3))
    import math
    n = len(words); size = math.ceil(n / math.ceil(n / 4))
    groups = []; i = 0
    while i < n:
        k = min(size, n - i)
        groups.append(list(range(i, i + k))); i += k
    for g in groups:
        chunks.append({'words': [words[j] for j in g], 't': [times[j] for j in g], 'end': P[ph['id']]['t1']})
for a, b in zip(chunks, chunks[1:]):
    a['end'] = round(min(b['t'][0], max(a['end'], a['t'][-1] + 0.35) + 0.25), 3)
chunks[-1]['end'] = 29.9
for c in chunks:
    if c['t'][0] < 18.5 < c['end']: c['end'] = 18.47   # hard cut into Act 3
Path('film/captions.js').write_text('window.CAPS = ' + json.dumps(chunks) + ';\n')
for c in chunks: print(f"{c['t'][0]:6.2f}-{c['end']:6.2f}  {' '.join(c['words'])}   {c['t']}")
