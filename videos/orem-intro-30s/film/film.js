// ORE M — introductory reel (30 s, 120 BPM). Shotlist: docs/shotlist.md (APPROVED).
// Pure function of time: no timers, no Math.random, nothing mutated in run(). Seeded noise only.
// All copy and numbers are getorem.com's own. The dashboard cards are rebuilt element by element from the 3x captures
// in assets/cap/ (text, values, colours and layout copied) so their bars and intervals can animate.
(() => {
  const { W, H, pick, put, reg, el, scene, sp, spHit, trk, seg, clamp, lerp, ease, bt, beatOf, mulberry32, noise1 } = C;
  const { line, rise, type } = TYPE;
  C.fonts = ['500 100px Display', '400 40px UI', '600 40px UI', '700 40px UI'];
  const TALL = C.FMT === '9x16';
  const PAD = pick(140, 90, 90);

  // ------------------------------------------------------------------ helpers
  const box = (parent, css, html = '', cls = 'abs') => el('div', { class: cls, style: css }, parent, html);
  // several masked lines; accent: { lineIndex: [wordIndices] }
  function lines(parent, texts, o) {
    return texts.map((tx, i) => line(parent, tx, { x: o.x, y: o.y + i * o.size * (o.lh || 1.12), size: o.size,
      accent: (o.accent || {})[i], cls: o.cls, color: o.color }));
  }
  // lines rise one after another (lineGap beats apart) and lift out together
  function riseLines(t, Ls, inAt, outAt = null, o = {}) {
    const gap = o.lineGap ?? 0.25;
    Ls.forEach((L, i) => rise(t, L, Array.isArray(inAt) ? inAt[i] : beatOf(inAt) + i * gap, outAt, o));
  }
  const pushHold = (t, S, b0, b1, amt = 0.04) => put(S.root, { s: 1 + amt * ease.inOut(seg(t, b0, b1)) });
  const snapIn = (p) => (p > 0.001 ? 1 : 0);       // opacity snaps in on the first frame of motion (never a fade)
  const pct = (v) => `${Math.round(v)}%`;

  // engine glyphs: plain colour marks keyed to the real UI's engine colours (no third-party logos redrawn)
  const ENGINE = { Perplexity: '#20b8cd', ChatGPT: '#12805c' };
  const engineTag = (parent, name, size) => box(parent,
    `position:relative;display:inline-flex;align-items:center;gap:${size * 0.4}px;font:500 ${size}px UI;color:var(--ink-2)`,
    `<span style="width:${size * 0.55}px;height:${size * 0.55}px;border-radius:50%;border:${size * 0.12}px solid ${ENGINE[name]};box-sizing:border-box"></span>${name}`, '');

  // ================================================================== 1. HOOK  b0–8
  scene({
    name: 'hook', from: 'hook', to: 'moved',
    build(root, S) {
      const size = pick(150, 130, 140);
      S.head = TALL
        ? lines(root, ['Does AI', 'recommend', 'your brand?'], { x: PAD, y: 330, size, accent: { 2: [0, 1] } })
        : lines(root, ['Does AI recommend', 'your brand?'], { x: PAD, y: 250, size, accent: { 1: [0, 1] } });
      // buyer prompt pill (the chat-question style from Orem's "Ask about this workspace" panel)
      S.pill = box(root, `left:${PAD}px;top:${pick(690, 690, 920)}px;max-width:${W - 2 * PAD - 80}px;padding:${pick(34, 34, 36)}px ${pick(48, 48, 44)}px;
        background:var(--card);border:1px solid var(--line);border-radius:36px;box-shadow:0 30px 70px -30px rgba(20,27,33,.30);white-space:normal`);
      S.lab = box(S.pill, `position:relative;font:600 ${pick(22, 22, 26)}px UI;letter-spacing:.14em;color:var(--fog);margin-bottom:14px`, 'A BUYER ASKS AI', '');
      S.q = box(S.pill, `position:relative;font:500 ${pick(50, 50, 54)}px/1.25 UI;color:var(--ink);letter-spacing:-.01em`, '', '');
      S.txt = el('span', {}, S.q, '');
      S.caret = el('span', { style: `display:inline-block;width:5px;height:1.05em;background:var(--accent);vertical-align:-0.15em;margin-left:4px` }, S.q);
      reg(S.pill, { o: 0 }); reg(S.txt); reg(S.caret, { o: 0 });
    },
    run(t, b, S) {
      if (TALL) riseLines(t, S.head, [[-0.4, -0.3], [1], [2, 2.08]]);
      else riseLines(t, S.head, [[-0.4, -0.3, 1], [2, 2.08]]);
      const p = spHit(t, 'ask', 'snappy');
      put(S.pill, { o: snapIn(p), y: 60 * (1 - p), s: 0.94 + 0.06 * p });
      type(t, S.txt, 'Which AI visibility tools report confidence intervals?', 4.5, 6.5, S.caret, 'moved');
      pushHold(t, S, 'hook', 'moved');
    },
  });

  // ================================================================== 2. DID IT MOVE?  b8–16
  scene({
    name: 'moved', from: 'moved', to: 'sample',
    build(root, S) {
      const x = PAD, y = pick(230, 230, 330);
      S.label = box(root, `left:${x + 8}px;top:${y}px;font:500 ${pick(44, 44, 46)}px UI;color:var(--ink-2)`, 'Your AI mention rate');
      S.num = box(root, `left:${x - 10}px;top:${y + 50}px;font:700 ${pick(330, 330, 300)}px/1 UI;letter-spacing:-.05em;color:var(--ink);font-variant-numeric:tabular-nums`, '32%');
      S.pill = box(root, `left:${x + 10}px;top:${y + pick(420, 420, 380)}px;padding:14px 30px;border-radius:40px;background:var(--accent-soft);
        color:var(--accent);font:700 ${pick(50, 50, 52)}px UI;letter-spacing:-.01em`, '+6 pts');
      reg(S.label); reg(S.num); reg(S.pill, { o: 0 });
      const qx = pick(1040, 1040, PAD), qy = pick(330, 330, 1130), qs = pick(118, 118, 120);
      S.q1 = line(root, 'Real change?', { x: qx, y: qy, size: qs });
      S.q2 = line(root, 'Or just noise?', { x: qx, y: qy + qs * 1.25, size: qs, accent: [2] });
      S.noise = mulberry32(31);
      S.jit = Array.from({ length: 64 }, () => 31 + Math.floor(S.noise() * 11));   // seeded 31–41
    },
    run(t, b, S) {
      const pl = spHit(t, 'moved', 'heavy');
      put(S.label, { y: 40 * (1 - pl) }); put(S.num, { y: 90 * (1 - pl), s: 0.92 + 0.08 * pl });
      // b10: 32 → 38, the +6 pts pill pops
      let v = trk(t, [[0, 32], [beatOf('moved_up') - 0.15, 38, 'snappy']]);
      let label = '+6 pts';
      // from b14.5 the number won't sit still: seeded jumps every quarter beat (that's the noise)
      if (b >= 14.5) { const k = Math.floor((b - 14.5) * 4); v = S.jit[k % S.jit.length]; const d = v - 32; label = `${d >= 0 ? '+' : '−'}${Math.abs(d)} pts`; }
      put(S.num, { text: pct(v) });
      const pp = spHit(t, 'moved_up', 'snappy');
      put(S.pill, { o: snapIn(pp), s: 0.7 + 0.3 * pp, text: label });
      rise(t, S.q1, 'real'); rise(t, S.q2, 'noise');
      pushHold(t, S, 'moved', 'sample', 0.05);
    },
  });

  // ================================================================== 3. SAMPLING → INTERVAL  b16–24
  // Rebuild of the "Engine breakdown" Perplexity row: 33%, likely 24%–41%, on a 0–100% track.
  const LO = 24, HI = 41, MID = 33;
  scene({
    name: 'sample', from: 'sample', to: 'card',
    build(root, S) {
      const cs = pick(92, 92, 84);
      S.c1 = TALL
        ? lines(root, ['Orem samples every', 'prompt many times.'], { x: PAD, y: 300, size: cs })
        : lines(root, ['Orem samples every prompt many times.'], { x: PAD, y: 150, size: cs });
      S.c2 = TALL
        ? lines(root, ['Each rate gets a 95%', 'confidence interval.'], { x: PAD, y: 300, size: cs, accent: { 0: [4], 1: [0, 1] } })
        : lines(root, ['Each rate gets a 95% confidence interval.'], { x: PAD, y: 150, size: cs, accent: { 0: [4, 5, 6] } });
      // the card
      const cw = W - 2 * pick(PAD, PAD, 60), cx = pick(PAD, PAD, 60), cy = pick(420, 420, 760), ch = pick(420, 420, 460);
      S.card = box(root, `left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px`, '', 'card');
      S.cardY = cy; S.cardW = cw;
      const ip = pick(56, 56, 44);
      S.tag = box(S.card, `left:${ip}px;top:${ip}px`); engineTag(S.tag, 'Perplexity', pick(46, 46, 44));
      S.val = box(S.card, `right:${ip}px;top:${ip - 10}px;left:auto;font:700 ${pick(76, 76, 72)}px UI;color:var(--ink);font-variant-numeric:tabular-nums;text-align:right;transform-origin:100% 0`, '—');
      // track geometry (inside card)
      S.tx = ip; S.tw = cw - 2 * ip; S.ty = ch - pick(150, 150, 150); S.th = pick(30, 30, 30);
      S.track = box(S.card, `left:${S.tx}px;top:${S.ty}px;width:${S.tw}px;height:${S.th}px;border-radius:${S.th / 2}px;background:var(--line)`);
      S.band = box(S.card, `left:${S.tx + S.tw * LO / 100}px;top:${S.ty}px;width:${S.tw * (HI - LO) / 100}px;height:${S.th}px;border-radius:${S.th / 2}px;background:var(--accent-bar);transform-origin:${S.tw * (MID - LO) / (HI - LO) / 100 * 100}% 50%`);
      S.mark = box(S.card, `left:${S.tx + S.tw * MID / 100 - 4}px;top:${S.ty - 12}px;width:8px;height:${S.th + 24}px;border-radius:4px;background:var(--ink)`);
      const ly = S.ty + S.th + 26, lf = `font:500 ${pick(30, 30, 30)}px UI;color:var(--fog)`;
      S.l0 = box(S.card, `left:${S.tx}px;top:${ly}px;${lf}`, '0%');
      S.l1 = box(S.card, `left:${S.tx + S.tw * MID / 100}px;top:${ly}px;${lf}`, '<span style="display:inline-block;transform:translateX(-50%)">likely <i>24%–41%</i></span>');
      S.l2 = box(S.card, `left:${S.tx + S.tw - 70}px;top:${ly}px;${lf}`, '100%');
      reg(S.card); reg(S.band, { o: 0 }); reg(S.mark, { o: 0 }); reg(S.l1, { o: 0 }); reg(S.val);
      // samples: seeded, roughly normal around 33 with the spread of a 24–41% interval
      const r = mulberry32(2024), bins = {};
      S.dots = [];
      const N = 42, binW = 2;
      for (let i = 0; i < N; i++) {
        const g = (r() + r() + r() + r() - 2) * 1.7;           // ~N(0,1)
        const v = clamp(MID + g * 4.4, 14, 54), bi = Math.round(v / binW);
        const k = (bins[bi] = (bins[bi] || 0) + 1) - 1;
        const d = box(S.card, `left:0;top:0;width:18px;height:18px;border-radius:50%;background:var(--accent)`);
        reg(d, { o: 0 });
        S.dots.push({ d, v, x: S.tx + S.tw * (bi * binW) / 100 - 9, y: S.ty - 30 - k * 22, at: 16.5 + Math.floor(i / 3) * 0.25 });
      }
    },
    run(t, b, S) {
      // push-through: the card arrives from deep and settles (whoosh peaks on the landing at b16)
      const pin = spHit(t, 'sample', 'default');
      put(S.card, { y: 260 * (1 - pin), s: 1.18 - 0.18 * pin });
      riseLines(t, S.c1, 16.5, 19.6); riseLines(t, S.c2, 20.25);
      // dots drop in batches of three per quarter beat (a tick each)
      let n = 0, sum = 0;
      const col = sp(t, 'band', 'default');
      S.dots.forEach((D) => {
        const p = spHit(t, D.at, 'snappy');
        if (p > 0.001) { n++; sum += D.v; }
        const tx = S.tx + S.tw * clamp(D.v, LO, HI) / 100 - 9;
        put(D.d, {
          o: snapIn(p) * (b < 21.5 ? 1 : 0),
          x: lerp(D.x, tx, col), y: lerp(D.y - 50 * (1 - p), S.ty + S.th / 2 - 9, col), s: lerp(p, 0.4, col),
        });
      });
      if (b < beatOf('band')) put(S.val, { text: n ? pct(sum / n) : '—' });
      else put(S.val, { text: '33%' });
      // b20: the band locks to the real interval, marker on 33%
      const pb = spHit(t, 'band', 'default');
      put(S.band, { o: snapIn(pb), sx: pb });
      put(S.mark, { o: snapIn(spHit(t, 19.75, 'snappy')), sy: spHit(t, 19.75, 'snappy') });
      const pl = spHit(t, 20.5, 'snappy');
      put(S.l1, { o: snapIn(pl), y: 20 * (1 - pl) });
      put(S.val, { s: 1 + 0.08 * Math.exp(-Math.max(0, t - bt('band')) * 6) * snapIn(pb) });
      pushHold(t, S, 'sample', 'card', 0.03);
    },
  });

  // ================================================================== 4. PROMPTS · MENTION RATE CARD  b24–32
  // Rebuild of the real card (assets/cap/prompts-mention-rate.png) in design units (1040 wide), scaled per format.
  const PROMPTS = [
    ['How often do Google AI Overviews citations change?', 'Perplexity', 75, 50, 92],
    ['Which AI visibility tools report confidence intervals?', 'ChatGPT', 50, 17, 83],
    ['What is answer engine optimization (AEO)?', 'ChatGPT', 42, 17, 67],
    ['Is my brand cited in Perplexity answers?', 'Perplexity', 42, 17, 67],
  ];
  const bandCol = (engine) => (engine === 'Perplexity' ? 'var(--accent-bar)' : '#363d44');
  // a 0–100% track with an interval band and a marker; returns parts to animate
  function ciTrack(parent, x, y, w, h, v, lo, hi, col) {
    const tr = box(parent, `left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${h / 2}px;background:#dfe4e2`);
    const bd = box(parent, `left:${x + w * lo / 100}px;top:${y}px;width:${w * (hi - lo) / 100}px;height:${h}px;border-radius:${h / 2}px;background:${col};transform-origin:${(100 * (v - lo)) / (hi - lo)}% 50%`);
    const mk = box(parent, `left:${x + w * v / 100 - 3}px;top:${y - 8}px;width:6px;height:${h + 16}px;border-radius:3px;background:var(--ink)`);
    reg(bd, { o: 0 }); reg(mk, { o: 0 });
    return { tr, bd, mk };
  }
  scene({
    name: 'card', from: 'card', to: 'verdict',
    build(root, S) {
      const cs = pick(84, 84, 80);
      S.c1 = TALL ? lines(root, ['An error bar on', 'every number.'], { x: PAD, y: 290, size: cs, accent: { 1: [0] } })
                  : lines(root, ['An error bar', 'on every number.'], { x: PAD, y: 300, size: cs, accent: { 1: [1] } });
      S.c2 = TALL ? lines(root, ['Every rate comes with', 'an interval and a verdict.'], { x: PAD, y: 290, size: cs * 0.92, accent: { 1: [4] } })
                  : lines(root, ['Every rate comes', 'with an interval', 'and a verdict.'], { x: PAD, y: 260, size: cs, accent: { 2: [2] } });
      const k = pick(1, 1, 0.92), cx = pick(780, 780, 60), cy = pick(140, 140, 600);
      S.card = box(root, `left:${cx}px;top:${cy}px;width:1040px;height:790px;transform-origin:50% 0`, '', 'card');
      S.k = k;
      const C1 = S.card;
      box(C1, 'left:48px;top:44px;font:600 19px UI;letter-spacing:.14em;color:var(--fog)', 'AEO / GEO · OREM WORKSPACE · WEEK OF SEP 14');
      box(C1, 'left:48px;top:78px;font:700 36px UI;color:var(--ink);letter-spacing:-.01em', 'Prompts · mention rate');
      box(C1, 'left:48px;top:132px;width:660px;white-space:normal;font:400 23px/1.35 UI;color:var(--fog)', 'Four prompts put Orem in 42% or more of answers. The best is 75% on Perplexity.');
      box(C1, 'right:48px;left:auto;top:36px;font:700 78px UI;color:var(--ink);letter-spacing:-.03em', '75%');
      box(C1, 'right:48px;left:auto;top:126px;font:400 22px UI;color:var(--fog)', 'best mention rate');
      S.rows = PROMPTS.map(([q, eng, v, lo, hi], i) => {
        const r = box(C1, `left:40px;top:${214 + i * 140}px;width:960px;height:124px;border-radius:20px;background:var(--row)`);
        box(r, 'left:28px;top:22px;font:600 27px UI;color:var(--ink);letter-spacing:-.01em', q);
        box(r, 'right:28px;left:auto;top:18px;font:700 32px UI;color:var(--ink)', `${v}%`);
        const tg = box(r, 'left:28px;top:70px'); engineTag(tg, eng, 24);
        box(r, 'right:28px;left:auto;top:76px;font:400 22px UI;color:var(--fog)', `${lo}–${hi}%`);
        const ct = ciTrack(r, 230, 80, 610, 18, v, lo, hi, bandCol(eng));
        reg(r, { o: 0 });
        return { r, ...ct };
      });
      reg(S.card, { o: 0 });
    },
    run(t, b, S) {
      const pc = spHit(t, 'card', 'default');
      put(S.card, { o: snapIn(pc), y: 640 * (1 - pc) - 18 * seg(t, 'card', 'verdict'), r: 3.5 * (1 - pc), s: S.k * (0.94 + 0.06 * pc) });
      S.rows.forEach((R, i) => {
        const at = beatOf('row1') + i * 0.5, p = spHit(t, at, 'snappy');
        put(R.r, { o: snapIn(p), x: 50 * (1 - p) });
        const pm = spHit(t, at + 0.25, 'snappy'), pb = sp(t, at + 0.3, 'default');
        put(R.mk, { o: snapIn(pm), sy: pm });
        put(R.bd, { o: snapIn(pb), sx: pb });
      });
      riseLines(t, S.c1, 24.25, 27.65); riseLines(t, S.c2, 'card_line');
      pushHold(t, S, 'card', 'verdict', 0.03);
    },
  });

  // ================================================================== 5. VERDICTS  b32–40
  // Rebuild of the "Workspaces" table (assets/cap/cards/workspaces.png).
  const ROWS = [
    ['Orem · Perplexity', '33%', '24–41%', false],
    ['Orem · ChatGPT', '30%', '22–39%', false],
    ['Brightleaf · ChatGPT', '29%', '21–38%', true],
    ['Nakhla · ChatGPT', '25%', '17–34%', false],
  ];
  const UP = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px;margin-right:6px"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg>';
  scene({
    name: 'verdict', from: 'verdict', to: 'trend',
    build(root, S) {
      const cs = pick(88, 88, 84);
      S.c1 = TALL ? lines(root, ['Every change gets', 'a verdict.'], { x: PAD, y: 300, size: cs, accent: { 1: [1] } })
                  : lines(root, ['Every change', 'gets a verdict.'], { x: PAD, y: 330, size: cs, accent: { 1: [2] } });
      S.c2 = TALL ? lines(root, ['No false alarms.'], { x: PAD, y: 300, size: cs, accent: { 0: [2] } })
                  : lines(root, ['No false', 'alarms.'], { x: PAD, y: 330, size: cs, accent: { 1: [0] } });
      const k = pick(1, 1, 0.94), cx = pick(780, 780, 60), cy = pick(220, 220, 680);
      S.card = box(root, `left:${cx}px;top:${cy}px;width:1020px;height:650px`, '', 'card');
      S.k = k;
      box(S.card, 'left:44px;top:40px;font:600 30px UI;color:var(--ink)', 'Workspaces');
      box(S.card, 'right:44px;left:auto;top:44px;font:400 24px UI;color:var(--fog)', 'This week');
      const HX = [44, 84, 520, 680, 830], hd = 'font:500 22px UI;color:var(--fog)';
      ['Workspace · engine', 'Mention rate', '95% CI', 'Verdict'].forEach((h, i) => box(S.card, `left:${HX[i + 1]}px;top:124px;${hd}`, h));
      S.rows = ROWS.map(([name, rate, ci, gain], i) => {
        const y = 168 + i * 112;
        const r = box(S.card, `left:20px;top:${y}px;width:980px;height:112px;border-top:1px solid var(--line)`);
        S.hl = S.hl || [];
        const hl = gain ? box(r, 'left:4px;top:8px;width:972px;height:96px;border-radius:18px;background:var(--gain-soft);transform-origin:0 50%') : null;
        if (hl) { reg(hl, { o: 0 }); S.hlr = hl; }
        box(r, `left:24px;top:38px;font:500 28px UI;color:var(--fog)`, String(i + 1));
        box(r, `left:64px;top:36px;font:600 31px UI;color:var(--ink);letter-spacing:-.01em`, name);
        box(r, `left:500px;top:36px;font:500 31px UI;color:var(--ink)`, rate);
        box(r, `left:660px;top:36px;font:500 31px UI;color:var(--ink)`, ci);
        const pill = box(r, `left:810px;top:28px;padding:10px 20px;border-radius:14px;font:600 25px UI;transform-origin:0 50%;${gain
          ? 'background:#d3ebdf;color:var(--gain)' : 'background:var(--noise-soft);color:var(--noise)'}`, gain ? `${UP}Real gain` : 'Within noise');
        reg(r, { o: 0 }); reg(pill, { o: 0 });
        return { r, pill, y };
      });
      reg(S.card);
    },
    run(t, b, S) {
      const pc = spHit(t, 'verdict', 'default');
      S.rows.forEach((R, i) => {
        const p = spHit(t, 32.1 + i * 0.15, 'snappy');
        put(R.r, { o: snapIn(p), y: 34 * (1 - p) });
        const pv = spHit(t, ['v1', 'v2', 'v3', 'v4'][i], 'snappy');
        put(R.pill, { o: snapIn(pv), s: 0.6 + 0.4 * pv });
      });
      // b36: the one real gain lights up, the camera leans in on it
      const g = spHit(t, 'gain', 'default');
      put(S.hlr, { o: snapIn(g), sx: g });
      const lean = sp(t, 35.9, 'heavy');
      put(S.card, { y: 40 * (1 - pc) - 60 * lean, s: S.k * (0.97 + 0.03 * pc + 0.05 * lean), css: { transformOrigin: '50% 72%' } });
      riseLines(t, S.c1, 32.5, 36.65); riseLines(t, S.c2, 37);
      pushHold(t, S, 'verdict', 'trend', 0.03);
    },
  });

  // ================================================================== 6a. TREND  b40–44   (6b covers it from b43.3)
  // Rebuild of "Brand mention rate · weekly · 95% CI". The site's black/cyan/blue/orange bars → ink + accent ramp.
  const WEEKS = [39, 36, 33, 32, 32, 32, 36, 36, 32], ERR = [6, 6, 6, 6, 7, 6, 6, 6, 6];
  const RAMP = ['var(--ink)', 'var(--accent-bar)', 'var(--accent)'];
  const cardAt = () => ({ k: pick(1, 1, 0.94), x: pick(780, 780, 60), y: pick(200, 200, 680) });
  scene({
    name: 'trend', from: 'trend', to: 'sources', post: 0.6,
    build(root, S) {
      const cs = pick(88, 88, 84);
      S.c1 = TALL ? lines(root, ['Track the trend,', 'not the noise.'], { x: PAD, y: 300, size: cs, accent: { 1: [2] } })
                  : lines(root, ['Track the trend,', 'not the noise.'], { x: PAD, y: 330, size: cs, accent: { 1: [2] } });
      const A = cardAt();
      S.k = A.k;
      S.card = box(root, `left:${A.x}px;top:${A.y}px;width:1020px;height:660px;background:var(--row)`, '', 'card');
      box(S.card, 'left:44px;top:40px;font:500 29px UI;color:var(--ink-2)', 'Brand mention rate · weekly · 95% CI');
      const px = 120, py = 120, pw = 850, ph = 420;
      [0, 25, 50, 75].forEach((g) => {
        const y = py + ph - (g / 75) * ph;
        box(S.card, `left:${px}px;top:${y}px;width:${pw}px;height:2px;background:#e3e7e5`);
        box(S.card, `left:${px - 70}px;top:${y - 15}px;width:56px;text-align:right;font:400 23px UI;color:var(--fog)`, `${g}%`);
      });
      const slot = pw / WEEKS.length;
      S.bars = WEEKS.map((v, i) => {
        const x = px + slot * i + (slot - 62) / 2, h = (v / 75) * ph, top = py + ph - h;
        const bar = box(S.card, `left:${x}px;top:${top}px;width:62px;height:${h}px;border-radius:10px 10px 0 0;background:${RAMP[i % 3]};transform-origin:50% 100%`);
        const e = (ERR[i] / 75) * ph;
        const eb = box(S.card, `left:${x + 31 - 15}px;top:${top - e}px;width:30px;height:${2 * e}px;transform-origin:50% 50%`,
          `<div style="position:absolute;left:14px;top:0;width:3px;height:100%;background:#4a545c"></div><div style="position:absolute;left:0;top:0;width:30px;height:3px;background:#4a545c"></div><div style="position:absolute;left:0;bottom:0;width:30px;height:3px;background:#4a545c"></div>`);
        reg(bar, { o: 0 }); reg(eb, { o: 0 });
        return { bar, eb };
      });
      ['Jul 13', 'Jul 27', 'Aug 10', 'Aug 24', 'Sep 14'].forEach((d, j) => {
        const i = j * 2, x = px + slot * i + slot / 2;
        box(S.card, `left:${x}px;top:${py + ph + 22}px;font:400 23px UI;color:var(--fog)`, `<span style="display:inline-block;transform:translateX(-50%)">${d}</span>`);
      });
      reg(S.card);
    },
    run(t, b, S) {
      const pc = spHit(t, 'trend', 'default');
      put(S.card, { y: 30 * (1 - pc), s: S.k });
      S.bars.forEach((B, i) => {
        const p = sp(t, 40.15 + i * 0.25, 'default'), pe = spHit(t, 40.65 + i * 0.25, 'snappy');
        put(B.bar, { o: snapIn(p), sy: p });
        put(B.eb, { o: snapIn(pe), sy: pe });
      });
      riseLines(t, S.c1, 40.25, 43.5);
      pushHold(t, S, 'trend', 'sources', 0.03);
    },
  });

  // ================================================================== 6b. SOURCES  b44–48
  // Rebuild of "Most-cited sources · 240 answers" (assets/cap/cards/sources.png).
  const SOURCES = [['g2.com', 117], ['wikipedia.org', 105], ['reddit.com', 103], ['searchengineland.com', 89], ['getorem.com', 39]];
  scene({
    name: 'sources', from: 'sources', to: 'tag', pre: 0.75,
    build(root, S) {
      const cs = pick(88, 88, 84);
      S.c1 = lines(root, ['See the sources', 'AI trusts.'], { x: PAD, y: pick(330, 330, 300), size: cs, accent: { 1: [1] } });
      const A = cardAt();
      S.k = A.k;
      S.card = box(root, `left:${A.x}px;top:${A.y}px;width:1020px;height:660px;background:var(--row)`, '', 'card');
      box(S.card, 'left:44px;top:40px;font:500 29px UI;color:var(--ink-2)', 'Most-cited sources · 240 answers');
      S.rows = SOURCES.map(([d, n], i) => {
        const me = d === 'getorem.com';
        const r = box(S.card, `left:32px;top:${112 + i * 104}px;width:956px;height:86px;border-radius:18px;background:var(--card)`);
        const nm = box(r, `left:26px;top:22px;font:${me ? 700 : 500} 31px UI;color:var(--ink)`, d);
        box(r, 'left:560px;top:35px;width:300px;height:16px;border-radius:8px;background:var(--line)');
        const f = box(r, `left:560px;top:35px;width:${300 * n / 160}px;height:16px;border-radius:8px;background:${me ? 'var(--accent)' : 'var(--ink)'};transform-origin:0 50%`);
        const c = box(r, `right:26px;left:auto;top:22px;font:700 31px UI;color:var(--ink)`, String(n));
        reg(f, { o: 0 }); reg(r);
        if (me) { S.me = r; S.meN = nm; S.meC = c; }
        return { r, f };
      });
      reg(S.card, { o: 0 }); reg(S.me); reg(S.meN); reg(S.meC);
    },
    run(t, b, S) {
      const A = cardAt();
      const p = spHit(t, 'sources', 'default');
      put(S.card, { o: snapIn(p), x: (W - A.x + 80) * (1 - p), r: 2.5 * (1 - p), s: S.k });
      S.rows.forEach((R, i) => { const pf = sp(t, 44.25 + i * 0.2, 'default'); put(R.f, { o: snapIn(pf), sx: pf }); });
      const h = spHit(t, 46, 'snappy');
      put(S.me, { css: { background: `color-mix(in srgb, var(--accent-soft) ${Math.round(100 * h)}%, var(--card))` }, x: -8 * h, sx: 1 + 0.016 * h });
      put(S.meN, { css: { color: h > 0.5 ? 'var(--accent)' : 'var(--ink)' } });
      put(S.meC, { css: { color: h > 0.5 ? 'var(--accent)' : 'var(--ink)' } });
      riseLines(t, S.c1, 44.25);
      pushHold(t, S, 'sources', 'tag', 0.03);
    },
  });

  // ================================================================== 7. TAGLINE  b48–52  (gap at 51.5, hard cut on the drop)
  scene({
    name: 'tag', from: 'tag', to: 'logo',
    build(root, S) {
      const size = pick(170, 170, 150);
      S.l = TALL ? lines(root, ['Statistically', 'honest', 'AI-search', 'visibility.'], { x: PAD, y: 420, size, accent: { 1: [0] } })
                 : lines(root, ['Statistically honest', 'AI-search visibility.'], { x: PAD, y: 330, size, lh: 1.15, accent: { 0: [1] } });
    },
    run(t, b, S) {
      if (TALL) riseLines(t, S.l, [[48], [48.5], [49.5], [50]]);
      else riseLines(t, S.l, [[48, 48.5], [49.5, 50]]);
      pushHold(t, S, 'tag', 'logo', 0.05);
    },
  });

  // ================================================================== 8. END CARD  b52–60
  scene({
    name: 'end', from: 'logo', to: 'done',
    build(root, S) {
      S.push = box(root, `width:${W}px;height:${H}px;transform-origin:${PAD}px ${H / 2}px`); reg(S.push);
      const ms = pick(170, 170, 150), mx = PAD, my = pick(300, 300, 470);
      // the real mark from the site header: ink ring + petrol dot (assets/brand/logo_0.svg)
      S.ring = box(S.push, `left:${mx}px;top:${my}px;width:${ms}px;height:${ms}px;transform-origin:50% 50%`,
        `<svg width="${ms}" height="${ms}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#141b21" stroke-width="2.1"/></svg>`);
      S.dot = box(S.push, `left:${mx}px;top:${my}px;width:${ms}px;height:${ms}px;transform-origin:50% 50%`,
        `<svg width="${ms}" height="${ms}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.9" fill="#0e5e63"/></svg>`);
      reg(S.ring, { o: 0 }); reg(S.dot, { o: 0 });
      const ws = pick(220, 220, 190);
      S.word = line(S.push, 'Orem', { x: mx + ms + pick(44, 44, 36), y: my + ms / 2 - ws * 0.58, size: ws });
      S.tags = line(S.push, 'GEO · AEO · AIEO', { x: mx + ms + pick(50, 50, 40), y: my + ms / 2 + ws * 0.48, size: pick(34, 34, 32), cls: 'ui' });
      S.tags.el.style.letterSpacing = '.24em'; S.tags.el.style.color = 'var(--fog)'; S.tags.el.style.fontWeight = '600';
      const by = pick(680, 680, 1000);
      S.btn = box(S.push, `left:${mx}px;top:${by}px;padding:30px 52px;border-radius:70px;background:var(--ink);color:#fff;font:600 ${pick(44, 44, 46)}px UI;letter-spacing:-.01em`,
        'Start with $25 credit&nbsp;&nbsp;→');
      reg(S.btn, { o: 0 });
      const ux = pick(mx + 720, mx + 720, mx + 6), uy = pick(by + 28, by + 28, by + 170);
      S.url = line(S.push, 'getorem.com', { x: ux, y: uy, size: pick(52, 52, 54), cls: 'ui', color: 'var(--ink-2)' });
      S.ux = ux; S.uw = pick(300, 300, 312); S.uy = uy + pick(74, 74, 76);
      S.sweep = box(S.push, `top:${S.uy}px;height:6px;border-radius:3px;background:var(--accent)`); reg(S.sweep, { o: 0 });
    },
    run(t, b, S) {
      put(S.push, { s: 1 + 0.06 * ease.inOut(seg(t, 'logo', 'done')) });
      const pr = spHit(t, 'logo', 'heavy'), pd = spHit(t, 52.5, 'snappy');
      put(S.ring, { o: snapIn(pr), s: 0.55 + 0.45 * pr, r: -40 * (1 - pr) });
      put(S.dot, { o: snapIn(pd), s: pd });
      rise(t, S.word, 52.25, null, { stagger: 0.05 });
      rise(t, S.tags, 53.5, null, { stagger: 0.06, preset: 'snappy' });
      const pb = spHit(t, 'cta', 'snappy');
      put(S.btn, { o: snapIn(pb), y: 60 * (1 - pb), s: 0.94 + 0.06 * pb });
      rise(t, S.url, 56.5, null, { stagger: 0.04, preset: 'snappy' });
      const x0 = S.ux + 4, x1 = S.ux + S.uw;
      const sw = Motion.indicator(t, [[0, x0, x0], [bt(58), x0, x1], [bt(59.2), x1, x1]]);
      put(S.sweep, { o: sw.size > 0.5 ? 1 : 0, x: sw.start, css: { width: sw.size + 'px' } });
    },
  });

  C.start();
})();
