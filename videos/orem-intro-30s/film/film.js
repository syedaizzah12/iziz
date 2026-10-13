// OREM — introductory reel (30 s, 120 BPM). Shotlist: docs/shotlist.md (APPROVED). Review log: docs/review_log.md.
// Pure function of time: no timers, no Math.random, nothing mutated in run(). Seeded noise only.
// All copy and numbers are getorem.com's own. The dashboard cards are rebuilt element by element from the 3x captures
// in assets/cap/ (text, values, colours and layout copied) so their bars and intervals can animate.
// Palette: Orem's petrol (#0e5e63) and the demo's petrol → #34ad97 gradient (user-supplied demo recording).
// 9:16 is re-blocked, not cropped: everything that must read stays inside x 60–950, y 269–1536 (platform UI zones).
(() => {
  const { W, H, pick, put, reg, el, scene, sp, spHit, trk, seg, clamp, lerp, ease, bt, beatOf, mulberry32 } = C;
  const { line, rise } = TYPE;
  C.fonts = ['500 100px Display', '400 40px UI', '500 40px UI', '600 40px UI', '700 40px UI'];
  const TALL = C.FMT === '9x16';
  const PAD = pick(140, 90, 90);
  const TX = 60, TW = 890;                          // 9:16 card frame inside the safe area
  // captions: a firm, fast spring (no overshoot on type): motion starts ON the beat and the line is ≥ 95 % risen
  // ~3 frames later, so it reads on its sound. Whole lines rise together (no per-word stagger).
  const CAP = { response: 0.2, damping: 0.95 };

  // ------------------------------------------------------------------ helpers
  const box = (parent, css, html = '', cls = 'abs') => el('div', { class: cls, style: css }, parent, html);
  function lines(parent, texts, o) {
    return texts.map((tx, i) => line(parent, tx, { x: o.x, y: o.y + i * o.size * (o.lh || 1.12), size: o.size,
      accent: (o.accent || {})[i], cls: o.cls, color: o.color }));
  }
  // caption lines rise as units on the beat; outAt = the next caption's in-beat (the exit starts 0.14 beat before it)
  function cap(t, Ls, inAt, outAt = null, gap = 0.06) {
    Ls.forEach((L, i) => rise(t, L, beatOf(inAt) + i * gap, outAt, { stagger: 0, preset: CAP, exit: 0.28 }));
  }
  const pushHold = (t, S, b0, b1, amt = 0.04) => put(S.root, { s: 1 + amt * ease.inOut(seg(t, b0, b1)) });
  const snapIn = (p) => (p > 0.001 ? 1 : 0);       // opacity snaps in on the first frame of motion (never a fade)
  const pop = (t, b, preset = 'snappy') => sp(t, b, preset);   // visible from its first frame: released ON the beat
  const pct = (v) => `${Math.round(v)}%`;
  const ring = (size, col = '#5e6a74') => `<span style="display:inline-block;width:${size * 0.5}px;height:${size * 0.5}px;border-radius:50%;border:${Math.max(2, size * 0.1)}px solid ${col};box-sizing:border-box;flex:none"></span>`;
  const engineTag = (parent, name, size) => box(parent,
    `position:relative;display:inline-flex;align-items:center;gap:${size * 0.4}px;font:500 ${size}px UI;color:var(--ink-2)`, `${ring(size)}${name}`, '');
  // an underline that grows under a word; positioned from the word's own layout box (after() only)
  function underlineUnder(U, word, size, p) {
    put(U, { o: p > 0.01 ? 1 : 0, css: { left: word.offsetLeft + 'px', top: (word.offsetTop + size * 1.0) + 'px', width: Math.max(0, word.offsetWidth * p) + 'px' } });
  }

  // camera: zoom the scene root by s about its centre so that point P lands at T (k = 0..1 progress)
  function camTo(S, k, s, P, T) {
    const O = [W / 2, H / 2], sc = 1 + (s - 1) * k;
    const tx = P[0] + k * (T[0] - P[0]), ty = P[1] + k * (T[1] - P[1]);
    put(S.root, { s: sc, x: tx - O[0] - sc * (P[0] - O[0]), y: ty - O[1] - sc * (P[1] - O[1]) });
  }
  // a compact rebuild of the Perplexity interval row (sampling card, end card)
  function ciCard(parent, x, y, w, h, o = {}) {
    const P = {};
    P.card = box(parent, `left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform-origin:50% 60%`, '', 'card');
    const ip = o.ip || 56, fs = o.fs || 50;
    const tg = box(P.card, `left:${ip}px;top:${ip}px`); engineTag(tg, 'Perplexity', fs);
    P.val = box(P.card, `left:${w - ip - 320}px;width:320px;top:${ip - 12}px;font:700 ${fs * 1.66}px UI;color:var(--ink);font-variant-numeric:tabular-nums;text-align:right`, '33%');
    P.tx = ip; P.tw = w - 2 * ip; P.ty = h - (o.trackFromBottom || 160); P.th = o.th || 32;
    box(P.card, `left:${P.tx}px;top:${P.ty}px;width:${P.tw}px;height:${P.th}px;border-radius:${P.th / 2}px;background:var(--line)`);
    P.band = box(P.card, `left:${P.tx + P.tw * 0.24}px;top:${P.ty}px;width:${P.tw * 0.17}px;height:${P.th}px;border-radius:${P.th / 2}px;background:var(--accent-bar);transform-origin:${(100 * 9) / 17}% 50%`);
    P.mark = box(P.card, `left:${P.tx + P.tw * 0.33 - 4}px;top:${P.ty - 12}px;width:8px;height:${P.th + 24}px;border-radius:4px;background:var(--ink);transform-origin:50% 50%`);
    const ly = P.ty + P.th + 28, lf = `font:500 ${o.lf || 32}px UI;color:var(--fog)`;
    if (o.ends !== false) box(P.card, `left:${P.tx}px;top:${ly}px;${lf}`, '0%');
    P.l1 = box(P.card, `left:${P.tx + P.tw * 0.33}px;top:${ly}px;${lf}`, '<span style="display:inline-block;transform:translateX(-50%)">likely <i>24%–41%</i></span>');
    if (o.ends !== false) box(P.card, `left:${P.tx + P.tw}px;top:${ly}px;${lf}`, '<span style="display:inline-block;transform:translateX(-100%)">100%</span>');
    reg(P.card); reg(P.band, { o: 0 }); reg(P.mark, { o: 0 }); reg(P.l1, { o: 0 }); reg(P.val);
    return P;
  }

  // ================================================================== 1. HOOK  b0–8
  // Frame 0: the headline's first words AND the buyer's prompt (already typing). b4–6: the engines it's asked on.
  const PROMPT = ['Which', 'AI', 'visibility', 'tools', 'report', 'confidence', 'intervals?'];
  const ENGINES = ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'AI Overviews'];   // getorem.com meta description
  // the opening frame's elements (headline + buyer-prompt pill). Built by the hook, and again by the end card so the
  // film's last frame hands back to frame 0 (a seamless loop).
  function openingFrame(root) {
    const O = {};
    const size = pick(170, 170, 150), y0 = pick(118, 118, 440);
    O.head = TALL
      ? lines(root, ['Does AI', 'recommend', 'your brand?'], { x: PAD, y: y0, size, accent: { 2: [0, 1] } })
      : lines(root, ['Does AI recommend', 'your brand?'], { x: PAD, y: y0, size, accent: { 1: [0, 1] } });
    O.py = y0 + (TALL ? 3 : 2) * size * 1.12 + pick(52, 52, 64); O.pillH = pick(275, 275, 315);
    O.pill = box(root, `left:${PAD}px;top:${O.py}px;box-sizing:border-box;width:${pick(1640, 1640, 860)}px;height:${O.pillH}px;overflow:hidden;padding:36px ${pick(50, 50, 44)}px;
      background:var(--card);border:1px solid var(--line);border-radius:36px;box-shadow:0 30px 70px -30px rgba(20,27,33,.30);white-space:normal`);
    O.lab = reg(box(O.pill, `position:relative;font:600 ${pick(24, 24, 28)}px UI;letter-spacing:.14em;color:var(--fog);margin-bottom:14px`, 'A BUYER ASKS AI', ''));
    const q = O.q = box(O.pill, `position:relative;font:500 ${pick(64, 64, 52)}px/1.25 UI;color:var(--ink);letter-spacing:-.01em`, '', '');
    O.words = PROMPT.map((w, i) => reg(el('span', {}, q, w + (i < PROMPT.length - 1 ? ' ' : '')), { o: 0 }));
    O.caret = el('span', { style: `display:inline-block;width:5px;height:1.05em;background:var(--accent);vertical-align:-0.15em;margin-left:2px` }, q);
    reg(O.q); reg(O.pill); reg(O.caret, { o: 0 });
    return O;
  }
  scene({
    name: 'hook', from: 'hook', to: 'moved',
    build(root, S) {
      Object.assign(S, openingFrame(root));
      const { py, pillH } = S;
      const cy = py + pillH + 34, cf = pick(40, 40, 34);
      root.style.transformOrigin = `${pick(960, 960, PAD)}px ${pick(549, 549, py)}px`;
      S.row = box(root, `left:${PAD}px;top:${cy}px;width:${pick(1640, 1640, 860)}px;display:flex;flex-wrap:${TALL ? 'wrap' : 'nowrap'};gap:${pick(12, 12, 16)}px;align-items:center;white-space:normal`);
      S.lab = reg(el('span', { style: `font:600 ${cf * 0.66}px UI;letter-spacing:.14em;color:var(--fog);margin-right:6px` }, S.row, 'ASKED ON'), { o: 0 });
      S.chips = ENGINES.map((e) => reg(el('span', { style: `display:inline-flex;align-items:center;gap:${cf * 0.35}px;padding:${cf * 0.36}px ${cf * 0.6}px;border-radius:${cf}px;background:var(--card);border:1px solid var(--line);font:500 ${cf}px UI;color:var(--ink);transform-origin:50% 50%` },
        S.row, `${ring(cf, '#0e5e63')}${e}`), { o: 0 }));
    },
    run(t, b, S) {
      if (TALL) { cap(t, [S.head[0]], -0.6); cap(t, [S.head[1]], 'hook_w2'); cap(t, [S.head[2]], 'hook_w3'); }
      else { rise(t, S.head[0], [-0.6, -0.6, 1], null, { preset: CAP }); cap(t, [S.head[1]], 'hook_w3'); }
      let n = 0;
      S.words.forEach((w, i) => { const on = b >= i * 0.5 - 1e-6 || i === 0; if (on) n++; put(w, { o: on ? 1 : 0, css: { display: on ? 'inline' : 'none' } }); });
      const blink = n < PROMPT.length || Math.floor(b * 2) % 2 === 0;
      put(S.caret, { o: blink && b < 3.4 ? 1 : 0, css: { display: b < 3.4 ? 'inline-block' : 'none' } });   // caret leaves when the prompt is done
      put(S.pill, { y: 30 * (1 - sp(t, -0.6, 'default')) });
      put(S.lab, { o: b >= 4 - 0.02 ? 1 : 0 });
      S.chips.forEach((c, i) => { const p = pop(t, 4 + i * 0.5); put(c, { o: snapIn(p), s: 0.7 + 0.3 * p, y: 18 * (1 - p) }); });
      // camera punches onto the prompt as 'your brand?' lands (b2)
      put(S.root, { s: 1 + pick(0.08, 0.08, 0.06) * sp(t, 'hook_w3', 'default') + 0.015 * ease.inOut(seg(t, 'hook', 'moved')) });
    },
  });

  // ================================================================== 2. DID IT MOVE?  b8–16
  // Real numbers only: the site's weekly chart (Brand mention rate · weekly · 95% CI). Week 6 → week 7 is 32% → 36%.
  // From b12.5 a highlight sweeps the real weeks (39, 36, 33, 32, 32, 32, 36): the number moves every week. Noise?
  const WEEKS = [39, 36, 33, 32, 32, 32, 36, 36, 32], ERR = [6, 6, 6, 6, 7, 6, 6, 6, 6];
  scene({
    name: 'moved', from: 'moved', to: 'sample',
    build(root, S) {
      S.stack = box(root, `left:0;top:0;width:${W}px;height:${H}px;transform-origin:${PAD}px ${pick(560, 560, 700)}px`); reg(S.stack);
      const x = PAD, y = pick(150, 150, 540);
      S.label = box(S.stack, `left:${x + 8}px;top:${y}px;font:500 ${pick(46, 46, 46)}px UI;color:var(--ink-2)`, 'Brand mention rate · weekly');
      S.num = box(S.stack, `left:${x - 12}px;top:${y + 58}px;font:700 ${pick(420, 420, 380)}px/1 UI;letter-spacing:-.05em;color:var(--ink);font-variant-numeric:tabular-nums`, '32%');
      S.pill = box(S.stack, `left:${x + 10}px;top:${y + pick(500, 500, 460)}px;padding:16px 34px;border-radius:44px;background:var(--accent-soft);
        color:var(--accent);font:700 ${pick(58, 58, 60)}px UI;letter-spacing:-.01em;transform-origin:0 50%`, '+4 pts');
      reg(S.label); reg(S.num); reg(S.pill, { o: 0 });
      // mini weekly chart (the real nine weeks), current week highlighted
      const cx = x, cyy = y + pick(640, 640, 610), cw = pick(820, 820, 860), ch = pick(150, 150, 210), slot = cw / 9;
      S.mini = WEEKS.map((v, i) => {
        const h = ch * v / 40, bx = cx + slot * i + (slot - slot * 0.62) / 2;
        const bar = box(S.stack, `left:${bx}px;top:${cyy + ch - h}px;width:${slot * 0.62}px;height:${h}px;border-radius:8px 8px 0 0;background:var(--line2);transform-origin:50% 100%`);
        reg(bar);
        return { bar, cx: bx + slot * 0.31 };
      });
      S.sel = box(S.stack, `top:${cyy + ch + 14}px;height:8px;border-radius:4px;background:var(--accent)`); reg(S.sel, { o: 0 });
      S.slot = slot;
      const qx = pick(1060, 1060, PAD), qy = pick(380, 380, 1210), qs = pick(120, 120, 132);
      S.q1 = line(root, 'Real change?', { x: qx, y: qy, size: qs });
      S.q2 = line(root, 'Or just noise?', { x: qx, y: qy + qs * 1.25, size: qs, accent: [2] });
    },
    run(t, b, S) {
      const pl = spHit(t, 'moved', 'heavy');
      put(S.label, { y: 40 * (1 - pl) }); put(S.num, { y: 90 * (1 - pl), s: 0.92 + 0.08 * pl });
      // 9:16: the stack slides up to make room for the questions
      if (TALL) put(S.stack, { y: -200 * sp(t, 9.6, 'default') });
      // which week is current
      const sweepK = b >= 12.5 ? clamp(Math.floor((b - 12.5) / 0.5 + 1e-6), 0, 6) : null;
      const idx = sweepK != null ? sweepK : (b >= beatOf('moved_up') ? 6 : 5);
      const keys = [[0, 32], [beatOf('moved_up'), 36, 'snappy']];
      for (let k = 0; k <= 6; k++) keys.push([12.5 + k * 0.5, WEEKS[k], 'snappy']);
      const v = trk(t, keys);
      put(S.num, { text: pct(v) });
      const pp = pop(t, 'moved_up'), pout = sp(t, 12.4, 'snappy');
      put(S.pill, { o: snapIn(pp) * (pout < 0.98 ? 1 : 0), s: (0.7 + 0.3 * pp) * (1 - pout) });   // collapses as the sweep starts
      S.mini.forEach((M, i) => put(M.bar, { css: { background: i === idx ? 'var(--accent)' : (i < idx || sweepK != null ? 'var(--line2)' : 'var(--line2)') }, sy: 0.6 + 0.4 * sp(t, 8.1 + i * 0.06, 'default') }));
      const stops = [[0, S.mini[5].cx - 22, S.mini[5].cx + 22], [bt(beatOf('moved_up')), S.mini[6].cx - 22, S.mini[6].cx + 22]];
      for (let k = 0; k <= 6; k++) stops.push([bt(12.5 + k * 0.5), S.mini[k].cx - 22, S.mini[k].cx + 22]);
      const ind = Motion.indicator(t, stops);
      put(S.sel, { o: 1, x: ind.start, css: { width: Math.max(0, ind.size) + 'px' } });
      cap(t, [S.q1], 'real'); cap(t, [S.q2], 'noise');
      // 16:9: the stack steps back (0.8×, about its left edge) as 'Real change?' arrives, then drifts
      if (!TALL) put(S.stack, { s: (1 - 0.2 * sp(t, 9.6, 'default')) * (1 + 0.04 * ease.inOut(seg(t, 'moved', 'sample'))) });
    },
  });

  // ================================================================== 3. SAMPLING → INTERVAL  b16–24
  // Rebuild of the "Engine breakdown" Perplexity row: 33%, likely 24%–41%, on a 0–100% track.
  const LO = 24, HI = 41, MID = 33;
  scene({
    name: 'sample', from: 'sample', to: 'card',
    build(root, S) {
      const cs = pick(96, 96, 88), cy0 = pick(150, 150, 330);
      S.c1 = TALL
        ? lines(root, ['Orem samples every', 'prompt many times.'], { x: PAD, y: cy0, size: cs })
        : lines(root, ['Orem samples every prompt many times.'], { x: PAD, y: cy0, size: cs });
      S.c2 = TALL
        ? lines(root, ['Each rate gets a 95%', 'confidence interval.'], { x: PAD, y: cy0, size: cs, accent: { 0: [4], 1: [0, 1] } })
        : lines(root, ['Each rate gets a 95% confidence interval.'], { x: PAD, y: cy0, size: cs, accent: { 0: [4, 5, 6] } });
      const cw = pick(1640, 1640, 800), cx = pick(PAD, PAD, TX + 45), cy = pick(400, 400, 760), ch = pick(460, 460, 480);
      S.P = ciCard(root, cx, cy, cw, ch, { ip: pick(60, 60, 44), fs: pick(50, 50, 46) });
      const P = S.P;
      const r = mulberry32(2024), bins = {}, ds = pick(20, 20, 16), step = pick(24, 24, 19);
      S.dots = [];
      for (let i = 0; i < 42; i++) {
        const g = (r() + r() + r() + r() - 2) * 1.7;
        const v = clamp(MID + g * 4.4, 14, 54), bi = Math.round(v / 2);
        const k = (bins[bi] = (bins[bi] || 0) + 1) - 1;
        const d = box(P.card, `left:0;top:0;width:${ds}px;height:${ds}px;border-radius:50%;background:var(--accent);transform-origin:50% 50%`);
        reg(d, { o: 0 });
        const batch = Math.floor(i / 6);
        S.dots.push({ d, v, ds, x: P.tx + P.tw * (bi * 2) / 100 - ds / 2, y: P.ty - 30 - k * step, at: batch === 0 ? 15.9 : 16.5 + (batch - 1) * 0.5 });
      }
    },
    run(t, b, S) {
      const P = S.P;
      // camera pushes into the track as the whoosh plays (1.00 → 1.12 / 1.10 over b16–17)
      put(P.card, { s: 1 + pick(0.12, 0.12, 0.1) * sp(t, 'sample', 'default') });
      cap(t, S.c1, 15.85, 'band'); cap(t, S.c2, 'band');
      const col = sp(t, 'band', 'default');
      S.dots.forEach((D) => {
        const p = pop(t, D.at);
        const tx = P.tx + P.tw * clamp(D.v, LO, HI) / 100 - D.ds / 2;
        put(D.d, { o: snapIn(p) * (b < 21.25 ? 1 : 0), x: lerp(D.x, tx, col), y: lerp(D.y, P.ty + P.th / 2 - D.ds / 2, col), s: lerp(p, 0.4, col) });
      });
      put(P.val, { s: 1 + 0.08 * Math.exp(-Math.max(0, t - bt('band')) * 6) * (b >= 20 ? 1 : 0) });
      const pb = pop(t, 'band', 'default');
      put(P.band, { o: snapIn(pb), sx: pb });
      const pm = pop(t, 19.75);
      put(P.mark, { o: snapIn(pm), sy: pm });
      const pl = pop(t, 20.5);
      put(P.l1, { o: snapIn(pl), y: 20 * (1 - pl) });
      put(S.root, { s: 1 + 0.02 * ease.inOut(seg(t, 18, 'card')) });
    },
  });

  // ================================================================== 4. PROMPTS · MENTION RATE CARD  b24–32  (rises over the cut from b23.7)
  // Rebuild of the real card (assets/cap/prompts-mention-rate.png) in design units (1040 wide), scaled per format.
  const PROMPTS = [
    ['How often do Google AI Overviews citations change?', 'Perplexity', 75, 50, 92],
    ['Which AI visibility tools report confidence intervals?', 'ChatGPT', 50, 17, 83],
    ['What is answer engine optimization (AEO)?', 'ChatGPT', 42, 17, 67],
    ['Is my brand cited in Perplexity answers?', 'Perplexity', 42, 17, 67],
  ];
  const bandCol = (engine) => (engine === 'Perplexity' ? 'var(--accent-bar)' : '#363d44');
  function ciTrack(parent, x, y, w, h, v, lo, hi, col) {
    box(parent, `left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${h / 2}px;background:#dfe4e2`);
    const bd = box(parent, `left:${x + w * lo / 100}px;top:${y}px;width:${w * (hi - lo) / 100}px;height:${h}px;border-radius:${h / 2}px;background:${col};transform-origin:${(100 * (v - lo)) / (hi - lo)}% 50%`);
    const mk = box(parent, `left:${x + w * v / 100 - 3}px;top:${y - 8}px;width:6px;height:${h + 16}px;border-radius:3px;background:var(--ink);transform-origin:50% 50%`);
    reg(bd, { o: 0 }); reg(mk, { o: 0 });
    return { bd, mk };
  }
  scene({
    name: 'card', from: 'card', to: 'verdict', pre: 0.3, cut: true,
    build(root, S) {
      S.c1 = TALL ? lines(root, ['An error bar on', 'every number.'], { x: PAD, y: 320, size: 80, accent: { 1: [0] } })
                  : lines(root, ['An error bar', 'on every number.'], { x: PAD, y: 440, size: 80, accent: { 1: [1] } });
      S.c2 = TALL ? lines(root, ['Every rate comes with', 'an interval and a verdict.'], { x: PAD, y: 320, size: 74, accent: { 1: [4] } })
                  : lines(root, ['Every rate comes', 'with an interval', 'and a verdict.'], { x: PAD, y: 400, size: 80, accent: { 2: [2] } });
      S.k = pick(0.95, 0.95, TW / 1040);
      const cx = pick(840, 840, TX), cy = pick(165, 165, 640);
      S.card = box(root, `left:${cx}px;top:${cy}px;width:1040px;height:790px;transform-origin:${TALL ? '0 0' : '50% 0'}`, '', 'card');
      const C1 = S.card;
      box(C1, 'left:48px;top:44px;font:600 19px UI;letter-spacing:.14em;color:var(--fog)', 'AEO / GEO · OREM WORKSPACE · WEEK OF SEP 14');
      box(C1, 'left:48px;top:78px;font:700 36px UI;color:var(--ink);letter-spacing:-.01em', 'Prompts · mention rate');
      box(C1, 'left:48px;top:132px;width:660px;white-space:normal;font:400 23px/1.35 UI;color:var(--fog)', 'Four prompts put Orem in 42% or more of answers. The best is 75% on Perplexity.');
      box(C1, 'right:48px;left:auto;top:36px;font:700 78px UI;color:var(--ink);letter-spacing:-.03em', '75%');
      box(C1, 'right:48px;left:auto;top:126px;font:400 22px UI;color:var(--fog)', 'best mention rate');
      // all four prompts are on the card from its first frame; only the intervals build on the beats
      S.rows = PROMPTS.map(([q, eng, v, lo, hi], i) => {
        const r = box(C1, `left:40px;top:${214 + i * 140}px;width:960px;height:124px;border-radius:20px;background:var(--row)`);
        box(r, 'left:28px;top:22px;font:600 27px UI;color:var(--ink);letter-spacing:-.01em', q);
        const pv = box(r, 'right:28px;left:auto;top:18px;font:700 32px UI;color:var(--ink)', `${v}%`);
        const tg = box(r, 'left:28px;top:70px'); engineTag(tg, eng, 24);
        const rg = box(r, 'right:28px;left:auto;top:76px;font:400 22px UI;color:var(--fog)', `${lo}–${hi}%`);
        reg(pv, { o: 0 }); reg(rg, { o: 0 });
        return { pv, rg, ...ciTrack(r, 230, 80, 610, 18, v, lo, hi, bandCol(eng)) };
      });
      // b30: the best prompt (75% on Perplexity) gets a petrol outline
      S.best = box(C1, 'left:34px;top:208px;width:972px;height:136px;border:4px solid var(--accent);border-radius:24px;box-sizing:border-box;transform-origin:50% 50%');
      reg(S.best, { o: 0 });
      reg(S.card, { o: 0 });
    },
    run(t, b, S) {
      const pbst = pop(t, 30); put(S.best, { o: snapIn(pbst), s: 1.05 - 0.05 * pbst });
      // rises from +25% of frame height at a 14° X-tilt behind the outgoing shot (b23.7), settles to a 3° lean
      const pc = sp(t, 23.7, 'default');
      const y = 0.25 * H * (1 - pc) - 18 * seg(t, 'card', 'verdict'), tilt = 3 + 11 * (1 - pc), s = S.k * (0.95 + 0.05 * pc);
      put(S.card, { o: snapIn(pc), css: { transform: `translate(0px, ${y.toFixed(2)}px) perspective(1800px) rotateX(${(-tilt).toFixed(3)}deg) scale(${s.toFixed(5)})` } });
      S.rows.forEach((R, i) => {
        const at = beatOf('row1') + i * 0.25, pm = pop(t, at), pb = sp(t, at + 0.1, 'default');
        put(R.mk, { o: snapIn(pm), sy: pm });
        put(R.bd, { o: snapIn(pb), sx: pb });
        put(R.pv, { o: snapIn(pm) }); put(R.rg, { o: snapIn(pm) });
      });
      // c1 starts after the cut (never over the outgoing caption) and lifts out ON the punch beat, before the camera moves
      cap(t, S.c1, 24.1, TALL ? 'card_line' : 26.1); cap(t, S.c2, 'card_line');
      // camera: punch onto prompt rows 1–2 at b26, back by b27.3 for the b28 caption
      const k = clamp(trk(t, [[0, 0], [26, 1, 'default'], [27.2, 0, 'default']]), -0.05, 1.05);
      if (TALL) pushHold(t, S, 'card', 'verdict', 0.03);    // 9:16 keeps the whole card (values included) in frame
      else camTo(S, k, 1.6, [1360, 500], [960, 540]);
    },
  });

  // ================================================================== 5. VERDICTS  b32–40
  // Rebuild of the "Workspaces" table (assets/cap/cards/workspaces.png). 9:16 keeps Workspace · engine + Verdict.
  // At b36 row 3 ("Real gain") itself lifts out of the table toward camera: one continuous object, pill included.
  const ROWS = [
    ['Orem · Perplexity', '33%', '24–41%', false],
    ['Orem · ChatGPT', '30%', '22–39%', false],
    ['Brightleaf · ChatGPT', '29%', '21–38%', true],
    ['Nakhla · ChatGPT', '25%', '17–34%', false],
  ];
  const UP = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-${s * 0.14}px;margin-right:${s * 0.28}px"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg>`;
  const verdictPill = (parent, css, gain, fs) => box(parent, `${css};padding:${fs * 0.38}px ${fs * 0.8}px;border-radius:${fs * 0.55}px;font:600 ${fs}px UI;transform-origin:0 50%;${gain
    ? 'background:#d3ebdf;color:var(--gain)' : 'background:var(--noise-soft);color:var(--noise)'}`, gain ? `${UP(fs * 0.9)}Real gain` : 'Within noise');
  const RX = TALL ? { name: 64, pill: 540 } : { name: 64, rate: 440, ci: 575, pill: 705 };
  const RF = pick(31, 31, 38), PF = pick(28, 28, 32), RH = pick(112, 112, 124);
  function rowContent(r, i, [name, rate, ci, gain]) {
    const ty = (RH - RF * 1.2) / 2;
    box(r, `left:24px;top:${ty}px;font:500 ${RF - 3}px UI;color:var(--fog)`, String(i + 1));
    box(r, `left:${RX.name}px;top:${ty}px;font:600 ${RF}px UI;color:var(--ink);letter-spacing:-.01em`, name);
    if (!TALL) { box(r, `left:${RX.rate}px;top:${ty}px;font:500 ${RF}px UI;color:var(--ink)`, rate); box(r, `left:${RX.ci}px;top:${ty}px;font:500 ${RF}px UI;color:var(--ink)`, ci); }
    return verdictPill(r, `left:${RX.pill}px;top:${(RH - PF * 1.96) / 2}px`, gain, PF);
  }
  scene({
    name: 'verdict', from: 'verdict', to: 'trend',
    build(root, S) {
      S.c1 = TALL ? lines(root, ['Every change gets', 'a verdict.'], { x: PAD, y: 330, size: 84, accent: { 1: [1] } })
                  : lines(root, ['Every change gets a verdict.'], { x: PAD, y: 130, size: 92, accent: { 0: [4] } });
      S.c2 = TALL ? lines(root, ['No false alarms.'], { x: PAD, y: 360, size: 96, accent: { 0: [2] } })
                  : lines(root, ['No false alarms.'], { x: PAD, y: 130, size: 92, accent: { 0: [2] } });
      const cw = pick(1020, 1020, TW), ch = pick(650, 650, 700);
      S.T = { cw, ch, cx: pick(450, 450, TX), cy: pick(300, 300, 640) };
      S.table = box(root, `left:${S.T.cx}px;top:${S.T.cy}px;width:${cw}px;height:${ch}px;transform-origin:50% 50%`, '', 'card');
      box(S.table, `left:44px;top:40px;font:600 ${pick(30, 30, 36)}px UI;color:var(--ink)`, 'Workspaces');
      box(S.table, `right:44px;left:auto;top:44px;font:400 ${pick(24, 24, 30)}px UI;color:var(--fog)`, 'This week');
      const hd = `font:500 ${pick(20, 20, 28)}px UI;color:var(--fog)`, hy = pick(126, 126, 130);
      const COLS = TALL ? [[20 + RX.name, 'Workspace · engine'], [20 + RX.pill, 'Verdict']]
                        : [[20 + RX.name, 'Workspace · engine'], [20 + RX.rate, 'Mention rate'], [20 + RX.ci, '95% CI'], [20 + RX.pill, 'Verdict']];
      COLS.forEach(([x, h]) => box(S.table, `left:${x}px;top:${hy}px;${hd}`, h));
      S.rowY0 = pick(168, 168, 184);
      S.rows = ROWS.map((R, i) => {
        const r = box(S.table, `left:20px;top:${S.rowY0 + i * RH}px;width:${cw - 40}px;height:${RH}px;border-top:1px solid var(--line)`);
        let hl = null;
        if (R[3]) { hl = box(r, `left:4px;top:8px;width:${cw - 48}px;height:${RH - 16}px;border-radius:18px;background:var(--gain-soft);transform-origin:0 50%`); reg(hl, { o: 0 }); }
        const pill = rowContent(r, i, R);
        reg(r, { o: 0 }); reg(pill, { o: 0 });
        return { r, pill, hl };
      });
      reg(S.table);
      S.lw = cw - 40;
      S.lift = box(root, `left:0;top:0;width:${S.lw}px;height:${RH}px;border-radius:18px;transform-origin:0 0;background:var(--gain-soft)`);
      rowContent(S.lift, 2, ROWS[2]);
      reg(S.lift, { o: 0 });
      S.kF = pick(1.85, 1.85, 1.04);
      // 16:9: hovers over the table's middle; 9:16: pulled out below the table (y 1395–1525, inside the safe area)
      S.tgt = TALL ? { x: TX + (TW - S.lw * S.kF) / 2, y: 1395 } : { x: (W - S.lw * S.kF) / 2, y: 640 - RH * S.kF / 2 };
    },
    run(t, b, S) {
      const T = S.T;
      const pc = spHit(t, 31.75, 'default'), back = sp(t, 'gain', 'heavy');
      const ty = 40 * (1 - pc) + 40 * back, ts = 0.97 + 0.03 * pc - 0.07 * back;
      put(S.table, { y: ty, s: ts });
      S.rows.forEach((R, i) => {
        const p = pop(t, 32 + i * 0.12);
        const lifted = i === 2 && b >= beatOf('gain');
        put(R.r, { o: lifted ? 0 : snapIn(p), y: 34 * (1 - p) });
        const pv = pop(t, ['v1', 'v2', 'v3', 'v4'][i]);
        put(R.pill, { o: snapIn(pv), s: 0.6 + 0.4 * pv });
      });
      const ph = pop(t, 35.5);
      put(S.rows[2].hl, { o: snapIn(ph), sx: sp(t, 35.5, 'default') });
      const lx = T.cx + T.cw / 2 + (20 - T.cw / 2) * ts;
      const ly = T.cy + T.ch / 2 + (S.rowY0 + 2 * RH - T.ch / 2) * ts + ty;
      const pl = sp(t, 'gain', 'default');
      if (b >= beatOf('gain')) {
        put(S.lift, { o: 1, x: lerp(lx, S.tgt.x, pl), y: lerp(ly, S.tgt.y, pl), s: lerp(ts, S.kF, pl),
          css: { background: `color-mix(in srgb, var(--gain-soft) ${Math.round(100 * (1 - clamp(pl)))}%, var(--card))`,
                 boxShadow: `0 ${Math.round(40 * pl)}px ${Math.round(100 * pl)}px -30px rgba(20,27,33,${(0.4 * clamp(pl)).toFixed(3)})` } });
      }
      cap(t, S.c1, 31.75, 37); cap(t, S.c2, 37);
      pushHold(t, S, 'verdict', 'trend', 0.03);
    },
  });

  // ================================================================== 6a. TREND  b40–44   (6b covers it from ~b43.5)
  // 16:9 mirrors the earlier shots: card left, caption right. Bars use the petrol ramp.
  const RAMP = ['var(--accent)', 'var(--accent-2)'];
  const frame = () => ({ k: pick(1, 1, TW / 1020), x: pick(PAD, PAD, TX), y: pick(210, 210, 760) });
  const CX2 = 1240;   // 16:9 right caption column (left-aligned)
  scene({
    name: 'trend', from: 'trend', to: 'sources', post: 0.6,
    build(root, S) {
      S.c1 = lines(root, ['Track the trend,', 'not the noise.'], { x: pick(CX2, CX2, PAD), y: pick(300, 300, 330), size: pick(84, 84, 84), accent: { 1: [2] } });
      const A = frame();
      S.k = A.k;
      S.card = box(root, `left:${A.x}px;top:${A.y}px;width:1020px;height:660px;background:var(--row);transform-origin:0 0`, '', 'card');
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
        const bar = box(S.card, `left:${x}px;top:${top}px;width:62px;height:${h}px;border-radius:10px 10px 0 0;background:${RAMP[i % 2]};transform-origin:50% 100%`);
        const e = (ERR[i] / 75) * ph;
        const eb = box(S.card, `left:${x + 16}px;top:${top - e}px;width:30px;height:${2 * e}px;transform-origin:50% 50%`,
          `<div style="position:absolute;left:14px;top:0;width:3px;height:100%;background:#4a545c"></div><div style="position:absolute;left:0;top:0;width:30px;height:3px;background:#4a545c"></div><div style="position:absolute;left:0;bottom:0;width:30px;height:3px;background:#4a545c"></div>`);
        reg(bar, { o: 0 }); reg(eb, { o: 0 });
        return { bar, eb };
      });
      ['Jul 13', 'Jul 27', 'Aug 10', 'Aug 24', 'Sep 14'].forEach((d, j) => {
        const x = px + slot * (j * 2) + slot / 2;
        box(S.card, `left:${x}px;top:${py + ph + 22}px;font:400 23px UI;color:var(--fog)`, `<span style="display:inline-block;transform:translateX(-50%)">${d}</span>`);
      });
      reg(S.card);
    },
    run(t, b, S) {
      const pc = spHit(t, 39.75, 'default');
      put(S.card, { y: 40 * (1 - pc), s: S.k });
      S.bars.forEach((B, i) => {
        const p = sp(t, 39.9 + i * 0.2, 'default'), pe = pop(t, 40.4 + i * 0.2);
        put(B.bar, { o: snapIn(p), sy: p });
        put(B.eb, { o: snapIn(pe), sy: pe });
      });
      cap(t, S.c1, 'trend', 'sources');      // held until the sources card pushes in, then lifts with it
      pushHold(t, S, 'trend', 'sources', 0.03);
    },
  });

  // ================================================================== 6b. SOURCES  b44–48
  // Rebuild of "Most-cited sources · 240 answers" (assets/cap/cards/sources.png). Pushes in over the chart.
  const SOURCES = [['g2.com', 117], ['wikipedia.org', 105], ['reddit.com', 103], ['searchengineland.com', 89], ['getorem.com', 39]];
  scene({
    name: 'sources', from: 'sources', to: 'tag', pre: 0.75,
    build(root, S) {
      S.c1 = lines(root, ['See the sources', 'AI trusts.'], { x: pick(CX2, CX2, PAD), y: pick(620, 620, 330), size: 84, accent: { 1: [1] } });
      const A = frame();
      S.k = A.k;
      S.card = box(root, `left:${A.x}px;top:${A.y}px;width:1020px;height:660px;background:var(--row);transform-origin:0 0`, '', 'card');
      box(S.card, 'left:44px;top:40px;font:500 29px UI;color:var(--ink-2)', 'Most-cited sources · 240 answers');
      S.rows = SOURCES.map(([d, n], i) => {
        const me = d === 'getorem.com';
        const r = box(S.card, `left:32px;top:${112 + i * 104}px;width:956px;height:86px;border-radius:18px;background:var(--card);transform-origin:50% 50%`);
        const nm = box(r, `left:26px;top:22px;font:${me ? 700 : 500} 31px UI;color:var(--ink)`, d);
        box(r, 'left:560px;top:35px;width:300px;height:16px;border-radius:8px;background:var(--line)');
        const f = box(r, `left:560px;top:35px;width:${300 * n / 160}px;height:16px;border-radius:8px;background:${me ? 'var(--accent)' : 'var(--ink)'};transform-origin:0 50%`);
        const c = box(r, `right:26px;left:auto;top:22px;font:700 31px UI;color:var(--ink)`, String(n));
        reg(f, { o: 0 });
        if (me) { S.me = reg(r); S.meN = reg(nm); S.meC = reg(c); }
        return { r, f };
      });
      reg(S.card, { o: 0 });
    },
    run(t, b, S) {
      const A = frame();
      const p = spHit(t, 'sources', 'default');
      // pushes in from the left edge (16:9, over the chart) / from the right (9:16)
      const off = TALL ? (W - A.x + 80) : -(A.x + 1020 * S.k + 80);
      put(S.card, { o: snapIn(p), x: off * (1 - p), r: (TALL ? 2.5 : -2.5) * (1 - p), s: S.k });
      S.rows.forEach((R, i) => { const pf = sp(t, 44.1 + i * 0.18, 'default'); put(R.f, { o: snapIn(pf), sx: pf }); });
      const h = pop(t, 46);
      put(S.me, { css: { background: `color-mix(in srgb, var(--accent-soft) ${Math.round(100 * clamp(h))}%, var(--card))` }, s: 1 + 0.025 * h });
      put(S.meN, { css: { color: h > 0.5 ? 'var(--accent)' : 'var(--ink)' } });
      put(S.meC, { css: { color: h > 0.5 ? 'var(--accent)' : 'var(--ink)' } });
      cap(t, S.c1, 'sources', TALL ? null : 46.0);        // 16:9: lifts out on the punch beat
      const k = sp(t, 45.95, 'default');                  // punch onto the getorem.com row as it highlights (b46)
      if (TALL) pushHold(t, S, 'sources', 'tag', 0.03);
      else camTo(S, k, 1.5, [590, 781], [960, 540]);
    },
  });

  // ================================================================== 7. TAGLINE  b48–52  (build into the drop, gap 51.5)
  scene({
    name: 'tag', from: 'tag', to: 'logo',
    build(root, S) {
      S.size = pick(190, 190, 160);
      S.l = TALL ? lines(root, ['Statistically', 'honest', 'AI-search', 'visibility.'], { x: PAD, y: 600, size: S.size, accent: { 1: [0] } })
                 : lines(root, ['Statistically honest', 'AI-search visibility.'], { x: PAD, y: 310, size: S.size, lh: 1.15, accent: { 0: [1] } });
      S.word = TALL ? S.l[1].words[0] : S.l[0].words[1];       // "honest"
      S.u = box(TALL ? S.l[1].el : S.l[0].el, `height:${pick(12, 12, 11)}px;border-radius:6px;background:var(--accent)`); reg(S.u, { o: 0 });
    },
    run(t, b, S) {
      if (TALL) S.l.forEach((L, i) => rise(t, L, 48 + i * 0.25, null, { stagger: 0, preset: 'heavy' }));
      else { rise(t, S.l[0], 48, null, { stagger: 0.08, preset: 'heavy' }); rise(t, S.l[1], 48.5, null, { stagger: 0.08, preset: 'heavy' }); }
      put(S.root, { s: 1 + 0.05 * ease.inOut(seg(t, 'tag', 'logo')) + 0.06 * sp(t, 50.5, 'heavy') });
    },
    // the underline is measured from "honest"'s own layout box (inside its line's mask), never a fixed offset
    after(t, b, S) { underlineUnder(S.u, S.word, S.size, sp(t, 49.5, 'snappy')); },
  });

  // ================================================================== 8. END CARD  b52–60
  // The CTA is the largest UI text on the card. Outro (b59–60): one continuous hand-off to frame 0 for a seamless loop —
  // the lockup, tags, URL and interval card lift out through their own masks, the CTA pill itself morphs (rect, fill,
  // radius) into the opening's prompt pill while its label lifts out and "A BUYER ASKS AI / Which |" rises in, and
  // "Does AI" rises into its frame-0 slot. Every outro spring lands by the last frame, which then equals frame 0.
  const MORPH = { response: 0.3, damping: 0.95 };
  scene({
    name: 'end', from: 'logo', to: 'done',
    build(root, S) {
      const ms = pick(80, 80, 70), ws = pick(90, 90, 76), mx = PAD, top = pick(270, 270, 440);
      const my = top + (ws - ms) / 2 + 2;
      // the real mark from the site header: ink ring + petrol dot (assets/brand/logo_0.svg)
      S.ring = box(root, `left:${mx}px;top:${my}px;width:${ms}px;height:${ms}px;transform-origin:50% 50%`,
        `<svg width="${ms}" height="${ms}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#141b21" stroke-width="2.1"/></svg>`);
      S.dot = box(root, `left:${mx}px;top:${my}px;width:${ms}px;height:${ms}px;transform-origin:50% 50%`,
        `<svg width="${ms}" height="${ms}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.9" fill="#0e5e63"/></svg>`);
      reg(S.ring, { o: 0 }); reg(S.dot, { o: 0 });
      S.ms = ms;
      const wx = mx + ms + pick(26, 26, 22);
      S.word = line(root, 'Orem', { x: wx, y: top - ws * 0.08, size: ws });
      S.tags = box(root, `left:${wx + 3}px;top:${top + ws * 1.06}px;font:600 ${pick(26, 26, 24)}px UI;letter-spacing:.24em;color:var(--fog)`, 'GEO · AEO · AIEO');
      reg(S.tags, { o: 0 });
      const by = top + pick(190, 190, 160), bf = pick(88, 88, 66);
      S.bf = bf;
      S.btn = box(root, `left:${mx}px;top:${by}px;padding:${bf * 0.42}px ${bf * 0.72}px;border-radius:${bf * 1.2}px;background:var(--ink);color:#fff;font:600 ${bf}px UI;letter-spacing:-.015em;transform-origin:20% 50%`,
        'Start with $25 credit');
      reg(S.btn, { o: 0 });
      const uy = by + bf * 1.2 + bf * 0.84 + 30;
      S.url = box(root, `left:${mx + 6}px;top:${uy}px;padding-bottom:26px;font:500 64px UI;color:var(--ink-2)`, '<span class="u">getorem.com</span>');
      S.uspan = S.url.querySelector('.u');
      reg(S.url, { o: 0 });
      S.sweep = box(S.url, 'height:7px;border-radius:4px;background:var(--accent)'); reg(S.sweep, { o: 0 });
      S.P = TALL ? ciCard(root, TX, 940, TW, 420, { ip: 44, fs: 46, trackFromBottom: 170, lf: 40 })
                 : ciCard(root, 1330, 300, 520, 430, { ip: 36, fs: 42, trackFromBottom: 170, lf: 40, ends: false });
      reg(S.P.card, { o: 0 });
      // frame 0, rebuilt for the loop hand-off; its pill doubles as the morphing CTA
      S.O = openingFrame(root);
      S.ctaTxt = box(S.O.pill, `left:${bf * 0.72}px;top:${bf * 0.42}px;font:600 ${bf}px UI;letter-spacing:-.015em;color:#fff`, 'Start with $25 credit');
      reg(S.ctaTxt, { o: 0 });
      reg(S.O.pill, { o: 0 });
    },
    run(t, b, S) {
      // a masked lift-out for boxes: slides up while clipped at its own top edge (same grammar as the type masks)
      const liftOut = (e, p, h) => (p > 0.001 ? { y: -h * p, clip: `inset(${(100 * clamp(p)).toFixed(2)}% 0 -40px 0)`, hide: p >= 0.85 } : {});   // clip only while lifting; hide before a sliver
      const pr = spHit(t, 51.85, 'heavy'), pd = pop(t, 'logo'), lo = sp(t, 58.75, 'snappy');
      put(S.ring, { o: snapIn(pr), s: 0.55 + 0.45 * pr, r: -40 * (1 - pr), ...liftOut(S.ring, lo, S.ms) });
      const pulse = sp(t, 56.5, 'snappy') - sp(t, 56.9, 'default');
      put(S.dot, { o: snapIn(pd), s: pd * (1 + 0.6 * pulse), ...liftOut(S.dot, lo, S.ms) });
      rise(t, S.word, 51.75, 58.85, { stagger: 0.05, preset: CAP });
      const ptag = pop(t, 52.25), to = sp(t, 58.8, 'snappy');
      put(S.tags, { o: snapIn(ptag), ...liftOut(S.tags, to, 34), y: 16 * (1 - ptag) - 34 * to });
      const pb = pop(t, 'cta');
      const nudge = sp(t, 57.5, 'snappy') - sp(t, 57.85, 'default');
      put(S.btn, { o: snapIn(pb) * (b < 59.05 ? 1 : 0), y: 50 * (1 - pb), s: (0.94 + 0.06 * pb) * (1 + 0.06 * nudge) });
      const pu = pop(t, 52.75), uo = sp(t, 58.85, 'snappy');
      put(S.url, { o: snapIn(pu), ...liftOut(S.url, uo, 116), y: 30 * (1 - pu) - 116 * uo });
      const P = S.P, pc = pop(t, 53, 'default'), co = sp(t, 58.95, 'snappy');
      put(P.card, { o: snapIn(pc), ...liftOut(P.card, co, 430), y: 70 * (1 - pc) - 430 * co, s: 0.94 + 0.06 * pc });
      const pbnd = pop(t, 53.5, 'default'); put(P.band, { o: snapIn(pbnd), sx: pbnd });
      const pm = pop(t, 53.25) * (1 + 0.5 * (sp(t, 58.5, 'snappy') - sp(t, 58.75, 'default')));
      put(P.mark, { o: snapIn(pm), sy: pm });
      const pl = pop(t, 54); put(P.l1, { o: snapIn(pl), y: 16 * (1 - pl) });
      // frame 0 re-forms. "Does AI" follows the wordmark's exit (b59.15) and has fully landed by the last frame,
      // exactly as at t = 0 (released 0.6 beat early there); the later headline lines stay below their masks.
      const O = S.O;
      O.head.slice(1).forEach((L) => rise(t, L, 999));
      if (TALL) cap(t, [O.head[0]], 59.15);                 // after the lockup has cleared: never over it
      else rise(t, O.head[0], [59.15, 59.15, 999], null, { preset: CAP });
      // the pill's contents: the CTA label lifts out (b59.1, gone before the fill lightens), then the prompt rises in (b59.55)
      const tOut = sp(t, 59.1, 'snappy'), tIn = sp(t, 59.55, CAP);
      put(S.ctaTxt, { o: b >= 59.05 && tOut < 0.9 ? 1 : 0, y: -S.bf * 1.5 * tOut });
      const showIn = b >= 59.55;
      put(O.lab, { o: showIn ? 1 : 0, y: S.O.pillH * (1 - tIn) });
      put(O.q, { o: showIn ? 1 : 0, y: S.O.pillH * (1 - tIn) });
      O.words.forEach((w, i) => put(w, { o: i === 0 ? 1 : 0, css: { display: i === 0 ? 'inline' : 'none' } }));
      put(O.caret, { o: 1 });
    },
    after(t, b, S) {
      const p = sp(t, 55, 'snappy');
      put(S.sweep, { o: p > 0.01 ? 1 : 0, css: { left: S.uspan.offsetLeft + 'px', top: (S.uspan.offsetTop + S.uspan.offsetHeight + 6) + 'px', width: (S.uspan.offsetWidth * p) + 'px' } });
      // the morph: from b59.3 the CTA's own rect/fill/radius spring to the prompt pill's (layout read here, in after())
      if (b >= 59.05) {
        const m = sp(t, 59.2, MORPH), fill = sp(t, 59.32, { response: 0.2, damping: 0.95 }), O = S.O, B = S.btn;
        const from = { x: B.offsetLeft, y: B.offsetTop, w: B.offsetWidth, h: B.offsetHeight, r: B.offsetHeight / 2 };
        const yF = 30 * (1 - Motion.step(bt(C.beatAt(C.DUR - 1 / C.FPS)) - bt(C.beatAt(C.DUR - 1 / C.FPS) - 0.6), 'default'));
        const to = { x: PAD, y: O.py + yF, w: pick(1640, 1640, 860), h: O.pillH, r: 36 };
        const L = (a, z) => a + (z - a) * m;
        put(O.pill, { o: 1, css: {
          left: L(from.x, to.x).toFixed(2) + 'px', top: L(from.y, to.y).toFixed(2) + 'px',
          width: L(from.w, to.w).toFixed(2) + 'px', height: L(from.h, to.h).toFixed(2) + 'px', borderRadius: L(from.r, to.r).toFixed(2) + 'px',
          background: `color-mix(in srgb, #141b21 ${Math.round(100 * (1 - clamp(fill)))}%, #ffffff)`,
          boxShadow: `0 30px 70px -30px rgba(20,27,33,${(0.30 * clamp(fill)).toFixed(3)})` } });
      }
    },
  });

  C.start();
})();
