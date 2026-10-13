// OREM — introductory reel (30 s, 120 BPM). Shotlist: docs/shotlist.md (APPROVED). Review log: docs/review_log.md.
// Pure function of time: no timers, no Math.random, nothing mutated in run(). Seeded noise only.
// All copy and numbers are getorem.com's own. The dashboard cards are rebuilt element by element from the 3x captures
// in assets/cap/ (text, values, colours and layout copied) so their bars and intervals can animate.
// 9:16 is re-blocked, not cropped: everything that must read stays inside x 60–950, y 269–1536 (platform UI zones).
(() => {
  const { W, H, pick, put, reg, el, scene, sp, spHit, trk, seg, clamp, lerp, ease, bt, beatOf, mulberry32 } = C;
  const { line, rise } = TYPE;
  C.fonts = ['500 100px Display', '400 40px UI', '500 40px UI', '600 40px UI', '700 40px UI'];
  const TALL = C.FMT === '9x16';
  const PAD = pick(140, 90, 90);
  // 9:16 card frame inside the safe area
  const TX = 60, TW = 890;

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
  // things that are visible from their first frame (pops, dots, pills) need no lead: one frame keeps them on the beat
  const pop = (t, b, preset = 'snappy') => spHit(t, b, preset, 1 / 60);
  const pct = (v) => `${Math.round(v)}%`;

  // engine glyphs: plain colour marks keyed to the real UI's engine colours (no third-party logos redrawn)
  const ENGINE = { Perplexity: '#5e6a74', ChatGPT: '#5e6a74' };
  const engineTag = (parent, name, size) => box(parent,
    `position:relative;display:inline-flex;align-items:center;gap:${size * 0.4}px;font:500 ${size}px UI;color:var(--ink-2)`,
    `<span style="width:${size * 0.55}px;height:${size * 0.55}px;border-radius:50%;border:${size * 0.12}px solid ${ENGINE[name]};box-sizing:border-box"></span>${name}`, '');

  // ================================================================== 1. HOOK  b0–8
  const PROMPT = ['Which', 'AI', 'visibility', 'tools', 'report', 'confidence', 'intervals?'];
  scene({
    name: 'hook', from: 'hook', to: 'moved',
    build(root, S) {
      const size = pick(165, 165, 150);
      const y0 = pick(227, 227, 476);
      S.head = TALL
        ? lines(root, ['Does AI', 'recommend', 'your brand?'], { x: PAD, y: y0, size, accent: { 2: [0, 1] } })
        : lines(root, ['Does AI recommend', 'your brand?'], { x: PAD, y: y0, size, accent: { 1: [0, 1] } });
      // buyer prompt pill (the chat-question style from Orem's "Ask about this workspace" panel)
      const py = y0 + (TALL ? 3 : 2) * size * 1.12 + pick(90, 90, 100);
      S.pill = box(root, `left:${PAD}px;top:${py}px;box-sizing:border-box;max-width:${pick(1640, 1640, 860)}px;padding:${pick(36, 36, 36)}px ${pick(50, 50, 44)}px;
        background:var(--card);border:1px solid var(--line);border-radius:36px;box-shadow:0 30px 70px -30px rgba(20,27,33,.30);white-space:normal`);
      box(S.pill, `position:relative;font:600 ${pick(24, 24, 28)}px UI;letter-spacing:.14em;color:var(--fog);margin-bottom:14px`, 'A BUYER ASKS AI', '');
      const q = box(S.pill, `position:relative;font:500 ${pick(56, 56, 58)}px/1.25 UI;color:var(--ink);letter-spacing:-.01em`, '', '');
      // words stream in one per tick (the tick SFX lands on each word)
      S.words = PROMPT.map((w, i) => reg(el('span', {}, q, w + (i < PROMPT.length - 1 ? ' ' : '')), { o: 0 }));
      S.caret = el('span', { style: `display:inline-block;width:5px;height:1.05em;background:var(--accent);vertical-align:-0.15em;margin-left:2px` }, q);
      reg(S.pill, { o: 0 }); reg(S.caret, { o: 0 });
    },
    run(t, b, S) {
      if (TALL) riseLines(t, S.head, [[-0.4, -0.3], [1], [2, 2.08]]);
      else riseLines(t, S.head, [[-0.4, -0.3, 1], [2, 2.08]]);
      const p = pop(t, 'ask', 'snappy');
      put(S.pill, { o: snapIn(p), y: 60 * (1 - p), s: 0.94 + 0.06 * p });
      let n = 0;
      S.words.forEach((w, i) => { const on = b >= 4.5 + i * 0.25 - 1 / 120; if (on) n++; put(w, { o: on ? 1 : 0, css: { display: on ? 'inline' : 'none' } }); });
      const blink = n < PROMPT.length || Math.floor(b * 2) % 2 === 0;
      put(S.caret, { o: b >= 4 && blink ? 1 : 0 });
      pushHold(t, S, 'hook', 'moved');
    },
  });

  // ================================================================== 2. DID IT MOVE?  b8–16
  scene({
    name: 'moved', from: 'moved', to: 'sample',
    build(root, S) {
      const x = PAD, y = pick(230, 230, 380);
      S.label = box(root, `left:${x + 8}px;top:${y}px;font:500 ${pick(52, 52, 54)}px UI;color:var(--ink-2)`, 'Your AI mention rate');
      S.num = box(root, `left:${x - 12}px;top:${y + 64}px;font:700 ${pick(420, 420, 380)}px/1 UI;letter-spacing:-.05em;color:var(--ink);font-variant-numeric:tabular-nums`, '32%');
      S.pill = box(root, `left:${x + 10}px;top:${y + pick(510, 510, 470)}px;padding:16px 34px;border-radius:44px;background:var(--accent-soft);
        color:var(--accent);font:700 ${pick(58, 58, 60)}px UI;letter-spacing:-.01em`, '+6 pts');
      reg(S.label); reg(S.num); reg(S.pill, { o: 0 });
      const qx = pick(1060, 1060, PAD), qy = pick(380, 380, 1080), qs = pick(120, 120, 140);
      S.q1 = line(root, 'Real change?', { x: qx, y: qy, size: qs });
      S.q2 = line(root, 'Or just noise?', { x: qx, y: qy + qs * 1.25, size: qs, accent: [2] });
    },
    run(t, b, S) {
      const pl = spHit(t, 'moved', 'heavy');
      put(S.label, { y: 40 * (1 - pl) }); put(S.num, { y: 90 * (1 - pl), s: 0.92 + 0.08 * pl });
      // b10: 32 → 38 with the +6 pts pill. From b14 the number won't sit still: sprung retargets every half beat,
      // staying inside the range the site's own weekly chart shows (32–39%). That's the noise.
      const v = trk(t, [[0, 32], [beatOf('moved_up') - 0.15, 38, 'snappy'], [14, 35, 'snappy'], [14.5, 39, 'snappy'], [15, 34, 'snappy'], [15.5, 37, 'snappy']]);
      const d = Math.round(v) - 32;
      put(S.num, { text: pct(v) });
      const pp = pop(t, 'moved_up', 'snappy');
      put(S.pill, { o: snapIn(pp), s: 0.7 + 0.3 * pp, text: `${d >= 0 ? '+' : '−'}${Math.abs(d)} pts` });
      rise(t, S.q1, 11.85); rise(t, S.q2, 13.85);
      pushHold(t, S, 'moved', 'sample', 0.05);
    },
  });

  // ================================================================== 3. SAMPLING → INTERVAL  b16–24
  // Rebuild of the "Engine breakdown" Perplexity row: 33%, likely 24%–41%, on a 0–100% track.
  const LO = 24, HI = 41, MID = 33;
  scene({
    name: 'sample', from: 'sample', to: 'card',
    build(root, S) {
      const cs = pick(96, 96, 88), cy0 = pick(180, 180, 330);
      S.c1 = TALL
        ? lines(root, ['Orem samples every', 'prompt many times.'], { x: PAD, y: cy0, size: cs })
        : lines(root, ['Orem samples every prompt many times.'], { x: PAD, y: cy0, size: cs });
      S.c2 = TALL
        ? lines(root, ['Each rate gets a 95%', 'confidence interval.'], { x: PAD, y: cy0, size: cs, accent: { 0: [4], 1: [0, 1] } })
        : lines(root, ['Each rate gets a 95% confidence interval.'], { x: PAD, y: cy0, size: cs, accent: { 0: [4, 5, 6] } });
      const cw = pick(1640, 1640, TW), cx = pick(PAD, PAD, TX), cy = pick(400, 400, 740), ch = pick(460, 460, 500);
      S.card = box(root, `left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px;transform-origin:50% 50%`, '', 'card');
      const ip = pick(60, 60, 44);
      const tg = box(S.card, `left:${ip}px;top:${ip}px`); engineTag(tg, 'Perplexity', pick(50, 50, 48));
      S.val = box(S.card, `left:${cw - ip - 320}px;width:320px;top:${ip - 12}px;font:700 ${pick(84, 84, 80)}px UI;color:var(--ink);font-variant-numeric:tabular-nums;text-align:right;transform-origin:100% 0`, '—');
      S.tx = ip; S.tw = cw - 2 * ip; S.ty = ch - 160; S.th = 32;
      box(S.card, `left:${S.tx}px;top:${S.ty}px;width:${S.tw}px;height:${S.th}px;border-radius:${S.th / 2}px;background:var(--line)`);
      S.band = box(S.card, `left:${S.tx + S.tw * LO / 100}px;top:${S.ty}px;width:${S.tw * (HI - LO) / 100}px;height:${S.th}px;border-radius:${S.th / 2}px;background:var(--accent-bar);transform-origin:${(100 * (MID - LO)) / (HI - LO)}% 50%`);
      S.mark = box(S.card, `left:${S.tx + S.tw * MID / 100 - 4}px;top:${S.ty - 12}px;width:8px;height:${S.th + 24}px;border-radius:4px;background:var(--ink);transform-origin:50% 50%`);
      const ly = S.ty + S.th + 28, lf = `font:500 ${pick(32, 32, 32)}px UI;color:var(--fog)`;
      box(S.card, `left:${S.tx}px;top:${ly}px;${lf}`, '0%');
      S.l1 = box(S.card, `left:${S.tx + S.tw * MID / 100}px;top:${ly}px;${lf}`, '<span style="display:inline-block;transform:translateX(-50%)">likely <i>24%–41%</i></span>');
      box(S.card, `left:${S.tx + S.tw}px;top:${ly}px;${lf}`, '<span style="display:inline-block;transform:translateX(-100%)">100%</span>');
      reg(S.card); reg(S.band, { o: 0 }); reg(S.mark, { o: 0 }); reg(S.l1, { o: 0 }); reg(S.val);
      // samples: seeded, roughly normal around 33 with the spread of a 24–41% interval, stacked as a dot plot
      const r = mulberry32(2024), bins = {}, ds = pick(18, 18, 15), step = pick(22, 22, 18);
      S.dots = [];
      for (let i = 0; i < 42; i++) {
        const g = (r() + r() + r() + r() - 2) * 1.7;           // ~N(0,1)
        const v = clamp(MID + g * 4.4, 14, 54), bi = Math.round(v / 2);
        const k = (bins[bi] = (bins[bi] || 0) + 1) - 1;
        const d = box(S.card, `left:0;top:0;width:${ds}px;height:${ds}px;border-radius:50%;background:var(--accent)`);
        reg(d, { o: 0 });
        S.dots.push({ d, v, ds, x: S.tx + S.tw * (bi * 2) / 100 - ds / 2, y: S.ty - 28 - k * step, at: 16 + Math.floor(i / 3) * 0.25 });
      }
    },
    run(t, b, S) {
      // push-through: the card arrives from deep and settles (whoosh peaks on the landing at b16)
      const pin = spHit(t, 15.75, 'default');
      put(S.card, { y: 220 * (1 - pin), s: 1.3 - 0.3 * pin });
      riseLines(t, S.c1, 15.8, 19.4); riseLines(t, S.c2, 19.85);
      // dots drop in batches of three per quarter beat (a tick each), then collapse into the interval at b20
      let n = 0, sum = 0;
      const col = sp(t, 'band', 'default');
      S.dots.forEach((D) => {
        const p = pop(t, D.at, 'snappy');
        if (p > 0.001) { n++; sum += D.v; }
        const tx = S.tx + S.tw * clamp(D.v, LO, HI) / 100 - D.ds / 2;
        put(D.d, {
          o: snapIn(p) * (b < 21.25 ? 1 : 0),
          x: lerp(D.x, tx, col), y: lerp(D.y, S.ty + S.th / 2 - D.ds / 2, col), s: lerp(p, 0.4, col),   // pop in place: one clear onset per tick
        });
      });
      put(S.val, { text: b < beatOf('band') ? (n ? pct(sum / n) : '—') : '33%' });
      const pb = pop(t, 'band', 'default');
      put(S.band, { o: snapIn(pb), sx: pb });
      const pm = pop(t, 19.75, 'snappy');
      put(S.mark, { o: snapIn(pm), sy: pm });
      const pl = pop(t, 20.25, 'snappy');
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
  const bandCol = (engine) => (engine === 'Perplexity' ? 'var(--accent-bar)' : '#363d44');   // petrol gradient as in Orem's demo
  function ciTrack(parent, x, y, w, h, v, lo, hi, col) {
    box(parent, `left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${h / 2}px;background:#dfe4e2`);
    const bd = box(parent, `left:${x + w * lo / 100}px;top:${y}px;width:${w * (hi - lo) / 100}px;height:${h}px;border-radius:${h / 2}px;background:${col};transform-origin:${(100 * (v - lo)) / (hi - lo)}% 50%`);
    const mk = box(parent, `left:${x + w * v / 100 - 3}px;top:${y - 8}px;width:6px;height:${h + 16}px;border-radius:3px;background:var(--ink);transform-origin:50% 50%`);
    reg(bd, { o: 0 }); reg(mk, { o: 0 });
    return { bd, mk };
  }
  scene({
    name: 'card', from: 'card', to: 'verdict',
    build(root, S) {
      const cs = pick(80, 80, 80);
      S.c1 = TALL ? lines(root, ['An error bar on', 'every number.'], { x: PAD, y: 320, size: cs, accent: { 1: [0] } })
                  : lines(root, ['An error bar', 'on every number.'], { x: PAD, y: 440, size: cs, accent: { 1: [1] } });
      S.c2 = TALL ? lines(root, ['Every rate comes with', 'an interval and a verdict.'], { x: PAD, y: 320, size: 74, accent: { 1: [4] } })
                  : lines(root, ['Every rate comes', 'with an interval', 'and a verdict.'], { x: PAD, y: 392, size: cs, accent: { 2: [2] } });
      S.k = pick(0.95, 0.95, TW / 1040);
      const cx = pick(840, 840, TX), cy = pick(165, 165, 640);
      S.card = box(root, `left:${cx}px;top:${cy}px;width:1040px;height:790px;transform-origin:${TALL ? '0 0' : '50% 0'}`, '', 'card');
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
      const pc = spHit(t, 23.5, 'default');
      put(S.card, { o: snapIn(pc), y: 640 * (1 - pc) - 18 * seg(t, 'card', 'verdict'), r: 3.5 * (1 - pc), s: S.k * (0.94 + 0.06 * pc) });
      S.rows.forEach((R, i) => {
        const at = beatOf('row1') + i * 0.25, p = pop(t, at, 'snappy');
        put(R.r, { o: snapIn(p), x: 50 * (1 - p) });
        const pm = pop(t, at + 0.25, 'snappy'), pb = sp(t, at + 0.3, 'default');
        put(R.mk, { o: snapIn(pm), sy: pm });
        put(R.bd, { o: snapIn(pb), sx: pb });
      });
      riseLines(t, S.c1, 23.8, 27.5); riseLines(t, S.c2, 27.85);
      pushHold(t, S, 'card', 'verdict', 0.03);
    },
  });

  // ================================================================== 5. VERDICTS  b32–40
  // Rebuild of the "Workspaces" table (assets/cap/cards/workspaces.png). 9:16 keeps the Workspace · engine and Verdict
  // columns. At b36 the one "Real gain" row lifts out of the table at a size that reads on a phone.
  const ROWS = [
    ['Orem · Perplexity', '33%', '24–41%', false],
    ['Orem · ChatGPT', '30%', '22–39%', false],
    ['Brightleaf · ChatGPT', '29%', '21–38%', true],
    ['Nakhla · ChatGPT', '25%', '17–34%', false],
  ];
  const UP = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-${s * 0.14}px;margin-right:${s * 0.28}px"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg>`;
  const verdictPill = (parent, css, gain, fs) => box(parent, `${css};padding:${fs * 0.38}px ${fs * 0.8}px;border-radius:${fs * 0.55}px;font:600 ${fs}px UI;transform-origin:0 50%;${gain
    ? 'background:#d3ebdf;color:var(--gain)' : 'background:var(--noise-soft);color:var(--noise)'}`, gain ? `${UP(fs * 0.9)}Real gain` : 'Within noise');
  scene({
    name: 'verdict', from: 'verdict', to: 'trend',
    build(root, S) {
      const cs = pick(88, 88, 84);
      S.c1 = TALL ? lines(root, ['Every change gets', 'a verdict.'], { x: PAD, y: 330, size: cs, accent: { 1: [1] } })
                  : lines(root, ['Every change', 'gets a verdict.'], { x: PAD, y: 440, size: cs, accent: { 1: [2] } });
      S.c2 = TALL ? lines(root, ['No false alarms.'], { x: PAD, y: 360, size: 96, accent: { 0: [2] } })
                  : lines(root, ['No false alarms.'], { x: PAD, y: 200, size: 88, accent: { 0: [2] } });
      // the table
      const cw = pick(1020, 1020, TW), cx = pick(780, 780, TX), cy = pick(215, 215, 640), ch = pick(650, 650, 700);
      S.table = box(root, `left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px;transform-origin:50% 50%`, '', 'card');
      const F = pick(31, 31, 38), RH = pick(112, 112, 124);
      box(S.table, `left:44px;top:40px;font:600 ${pick(30, 30, 36)}px UI;color:var(--ink)`, 'Workspaces');
      box(S.table, `right:44px;left:auto;top:44px;font:400 ${pick(24, 24, 30)}px UI;color:var(--fog)`, 'This week');
      const hd = `font:500 ${pick(22, 22, 28)}px UI;color:var(--fog)`;
      const COLS = TALL ? [[84, 'Workspace · engine'], [560, 'Verdict']] : [[84, 'Workspace · engine'], [520, 'Mention rate'], [680, '95% CI'], [830, 'Verdict']];
      COLS.forEach(([x, h]) => box(S.table, `left:${x}px;top:${pick(124, 124, 130)}px;${hd}`, h));
      S.rows = ROWS.map(([name, rate, ci, gain], i) => {
        const y = pick(168, 168, 184) + i * RH;
        const r = box(S.table, `left:20px;top:${y}px;width:${cw - 40}px;height:${RH}px;border-top:1px solid var(--line)`);
        if (gain) { S.hl = box(r, `left:4px;top:8px;width:${cw - 48}px;height:${RH - 16}px;border-radius:18px;background:var(--gain-soft);transform-origin:0 50%`); reg(S.hl, { o: 0 }); }
        const ty = (RH - F * 1.2) / 2;
        box(r, `left:24px;top:${ty}px;font:500 ${F - 3}px UI;color:var(--fog)`, String(i + 1));
        box(r, `left:64px;top:${ty}px;font:600 ${F}px UI;color:var(--ink);letter-spacing:-.01em`, name);
        if (!TALL) { box(r, `left:500px;top:${ty}px;font:500 ${F}px UI;color:var(--ink)`, rate); box(r, `left:660px;top:${ty}px;font:500 ${F}px UI;color:var(--ink)`, ci); }
        const pill = verdictPill(r, `left:${pick(810, 810, 540)}px;top:${(RH - pick(25, 25, 32) * 1.96) / 2}px`, gain, pick(25, 25, 32));
        reg(r, { o: 0 }); reg(pill, { o: 0 });
        return { r, pill };
      });
      reg(S.table);
      // the lifted row
      const lw = pick(1700, 1700, TW), lx = pick(110, 110, TX), ly = pick(430, 430, 860), lh = pick(300, 300, 470);
      S.lift = box(root, `left:${lx}px;top:${ly}px;width:${lw}px;height:${lh}px;transform-origin:50% 50%;box-shadow:0 2px 6px rgba(20,27,33,.05),0 50px 110px -30px rgba(20,27,33,.38)`, '', 'card');
      const lab = `font:500 ${pick(28, 28, 30)}px UI;color:var(--fog)`;
      if (TALL) {
        box(S.lift, `left:52px;top:48px;${lab}`, 'Workspace · engine');
        box(S.lift, `left:52px;top:94px;font:600 64px UI;color:var(--ink);letter-spacing:-.02em`, 'Brightleaf · ChatGPT');
        box(S.lift, `left:52px;top:190px;font:500 56px UI;color:var(--ink)`, '29% <span style="color:var(--fog)">·</span> 21–38%');
        S.lp = verdictPill(S.lift, 'left:52px;top:300px', true, 64);
      } else {
        [[64, 'Workspace · engine'], [720, 'Mention rate'], [940, '95% CI'], [1180, 'Verdict']].forEach(([x, h]) => box(S.lift, `left:${x}px;top:56px;${lab}`, h));
        const vy = 128, vf = 'font:600 60px UI;color:var(--ink);letter-spacing:-.02em';
        box(S.lift, `left:64px;top:${vy}px;${vf}`, 'Brightleaf · ChatGPT');
        box(S.lift, `left:720px;top:${vy}px;${vf}`, '29%');
        box(S.lift, `left:940px;top:${vy}px;${vf}`, '21–38%');
        S.lp = verdictPill(S.lift, `left:1180px;top:${vy - 12}px`, true, 60);
      }
      reg(S.lift, { o: 0 }); reg(S.lp, { o: 0 });
    },
    run(t, b, S) {
      const pc = spHit(t, 31.75, 'default');
      S.rows.forEach((R, i) => {
        const p = pop(t, 32 + i * 0.12, 'snappy');
        put(R.r, { o: snapIn(p), y: 34 * (1 - p) });
        const pv = pop(t, ['v1', 'v2', 'v3', 'v4'][i], 'snappy');
        put(R.pill, { o: snapIn(pv), s: 0.6 + 0.4 * pv });
      });
      put(S.hl, { o: snapIn(pop(t, 35.5, 'snappy')), sx: pop(t, 35.5, 'default') });
      // b36: the table leans back and the gain row lifts toward camera (covering it)
      const back = sp(t, 35.8, 'heavy');
      put(S.table, { y: 40 * (1 - pc) + 30 * back, s: 0.97 + 0.03 * pc - 0.05 * back });
      const lf = spHit(t, 'gain', 'heavy');
      put(S.lift, { o: snapIn(lf), y: 260 * (1 - lf), s: 0.82 + 0.18 * lf });
      const lp = pop(t, 36.5, 'snappy');
      put(S.lp, { o: snapIn(lp), s: 0.6 + 0.4 * lp });
      riseLines(t, S.c1, 31.8, 35.55); riseLines(t, S.c2, 36.85);
      pushHold(t, S, 'verdict', 'trend', 0.03);
    },
  });

  // ================================================================== 6a. TREND  b40–44   (6b covers it from ~b43.5)
  // Rebuild of "Brand mention rate · weekly · 95% CI". The site's multi-colour bars → ink + the one accent.
  const WEEKS = [39, 36, 33, 32, 32, 32, 36, 36, 32], ERR = [6, 6, 6, 6, 7, 6, 6, 6, 6];
  const RAMP = ['var(--accent)', 'var(--accent-2)'];   // the demo's petrol → sea-green ramp
  const frame = () => ({ k: pick(1, 1, TW / 1020), x: pick(780, 780, TX), y: pick(210, 210, 700) });
  const capY = () => pick(440, 440, 330);
  scene({
    name: 'trend', from: 'trend', to: 'sources', post: 0.6,
    build(root, S) {
      S.c1 = lines(root, ['Track the trend,', 'not the noise.'], { x: PAD, y: capY(), size: pick(88, 88, 84), accent: { 1: [2] } });
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
        const p = sp(t, 39.9 + i * 0.2, 'default'), pe = pop(t, 40.4 + i * 0.2, 'snappy');
        put(B.bar, { o: snapIn(p), sy: p });
        put(B.eb, { o: snapIn(pe), sy: pe });
      });
      riseLines(t, S.c1, 39.8, 43.4);
      pushHold(t, S, 'trend', 'sources', 0.03);
    },
  });

  // ================================================================== 6b. SOURCES  b44–48
  // Rebuild of "Most-cited sources · 240 answers" (assets/cap/cards/sources.png).
  const SOURCES = [['g2.com', 117], ['wikipedia.org', 105], ['reddit.com', 103], ['searchengineland.com', 89], ['getorem.com', 39]];
  scene({
    name: 'sources', from: 'sources', to: 'tag', pre: 0.75,
    build(root, S) {
      S.c1 = lines(root, ['See the sources', 'AI trusts.'], { x: PAD, y: capY(), size: pick(88, 88, 84), accent: { 1: [1] } });
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
      put(S.card, { o: snapIn(p), x: (W - A.x + 80) * (1 - p), r: 2.5 * (1 - p), s: S.k });
      S.rows.forEach((R, i) => { const pf = sp(t, 44.1 + i * 0.18, 'default'); put(R.f, { o: snapIn(pf), sx: pf }); });
      const h = pop(t, 46, 'snappy');
      put(S.me, { css: { background: `color-mix(in srgb, var(--accent-soft) ${Math.round(100 * clamp(h))}%, var(--card))` }, s: 1 + 0.025 * h });
      put(S.meN, { css: { color: h > 0.5 ? 'var(--accent)' : 'var(--ink)' } });
      put(S.meC, { css: { color: h > 0.5 ? 'var(--accent)' : 'var(--ink)' } });
      riseLines(t, S.c1, 43.85);
      pushHold(t, S, 'sources', 'tag', 0.03);
    },
  });

  // ================================================================== 7. TAGLINE  b48–52  (gap at 51.5, hard cut on the drop)
  scene({
    name: 'tag', from: 'tag', to: 'logo',
    build(root, S) {
      S.l = TALL ? lines(root, ['Statistically', 'honest', 'AI-search', 'visibility.'], { x: PAD, y: 566, size: 150, accent: { 1: [0] } })
                 : lines(root, ['Statistically honest', 'AI-search visibility.'], { x: PAD, y: 310, size: 190, lh: 1.15, accent: { 0: [1] } });
    },
    run(t, b, S) {
      if (TALL) riseLines(t, S.l, [[47.7], [48.5], [49.5], [50]]);
      else riseLines(t, S.l, [[47.7, 48.5], [49.5, 50]]);
      pushHold(t, S, 'tag', 'logo', 0.05);
    },
  });

  // ================================================================== 8. END CARD  b52–60
  scene({
    name: 'end', from: 'logo', to: 'done',
    build(root, S) {
      S.push = box(root, `width:${W}px;height:${H}px;transform-origin:${PAD}px ${H / 2}px`); reg(S.push);
      const ms = pick(140, 140, 130), ws = pick(175, 175, 165), mx = PAD, top = pick(250, 250, 624);
      const my = top + (ws - ms) / 2;
      // the real mark from the site header: ink ring + petrol dot (assets/brand/logo_0.svg)
      S.ring = box(S.push, `left:${mx}px;top:${my}px;width:${ms}px;height:${ms}px;transform-origin:50% 50%`,
        `<svg width="${ms}" height="${ms}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#141b21" stroke-width="2.1"/></svg>`);
      S.dot = box(S.push, `left:${mx}px;top:${my}px;width:${ms}px;height:${ms}px;transform-origin:50% 50%`,
        `<svg width="${ms}" height="${ms}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.9" fill="#0e5e63"/></svg>`);
      reg(S.ring, { o: 0 }); reg(S.dot, { o: 0 });
      const wx = mx + ms + pick(40, 40, 34);
      S.word = line(S.push, 'Orem', { x: wx, y: top - ws * 0.08, size: ws });
      S.tags = line(S.push, 'GEO · AEO · AIEO', { x: wx + 6, y: top + ws * 1.02, size: pick(34, 34, 32), cls: 'ui' });
      S.tags.el.style.letterSpacing = '.24em'; S.tags.el.style.color = 'var(--fog)'; S.tags.el.style.fontWeight = '600';
      const by = top + pick(330, 330, 330), bf = pick(72, 72, 64);
      S.btn = box(S.push, `left:${mx}px;top:${by}px;padding:${bf * 0.46}px ${bf * 0.8}px;border-radius:${bf * 1.2}px;background:var(--ink);color:#fff;font:600 ${bf}px UI;letter-spacing:-.015em`,
        TALL ? 'Start with $25 credit' : 'Start with $25 credit&nbsp;<span class="arw" style="display:inline-block">→</span>');
      S.arw = S.btn.querySelector('.arw');
      reg(S.btn, { o: 0 }); if (S.arw) reg(S.arw);
      const uy = by + bf * 1.2 + bf * 0.92 + 36, us = pick(64, 64, 64);
      S.url = line(S.push, 'getorem.com', { x: mx + 6, y: uy, size: us, cls: 'ui', color: 'var(--ink-2)' });
      S.ux = mx + 8; S.uw = us * 5.6; S.uy = uy + us * 1.32;
      S.sweep = box(S.push, `top:${S.uy}px;height:7px;border-radius:4px;background:var(--accent)`); reg(S.sweep, { o: 0 });
    },
    run(t, b, S) {
      put(S.push, { s: 1 + 0.06 * ease.inOut(seg(t, 'logo', 'done')) });
      const pr = spHit(t, 51.85, 'heavy'), pd = pop(t, 'logo', 'snappy');
      put(S.ring, { o: snapIn(pr), s: 0.55 + 0.45 * pr, r: -40 * (1 - pr) });
      put(S.dot, { o: snapIn(pd), s: pd });
      rise(t, S.word, 51.75, null, { stagger: 0.05 });
      rise(t, S.tags, 53, null, { stagger: 0.06, preset: 'snappy' });
      const pb = spHit(t, 'cta', 'snappy');
      // b59: the button nudges (and its arrow pushes right) so the hold never goes static
      const nudge = sp(t, 59, 'snappy') - sp(t, 59.35, 'default');
      put(S.btn, { o: snapIn(pb), y: 60 * (1 - pb), s: (0.94 + 0.06 * pb) * (1 + 0.035 * nudge) });
      if (S.arw) put(S.arw, { x: 14 * nudge });
      rise(t, S.url, 56.5, null, { stagger: 0.04, preset: 'snappy' });
      const x0 = S.ux, x1 = S.ux + S.uw;
      const sw = Motion.indicator(t, [[0, x0, x0], [bt(57.6), x0, x1]]);
      put(S.sweep, { o: sw.size > 1 ? 1 : 0, x: sw.start, css: { width: sw.size + 'px' } });
    },
  });

  C.start();
})();
