// Growlatics — "Be the name AI says." 30 s, 9:16. Approved shotlist: docs/shotlist.md.
// Pure function of time: no timers, no Math.random, nothing carried between frames (lazy layout caches are
// deterministic: they only memoise measurements that never change once fonts are loaded).
(() => {
  const { W, H, put, reg, el, scene, canvas, sp, spHit, trk, seg, clamp, lerp, ease, bt, beatAt, beatOf, mulberry32 } = C;
  const { line, rise } = TYPE;
  C.fonts = ['340 100px Display', '500 40px UI', '800 46px UI', '700 40px UI'];
  const BEAT = bt(1) - bt(0);
  const PAD = 96;
  const DOT = '<i>.</i>';

  // ---------------------------------------------------------------- helpers
  // typed text by TIME (seconds): chars appear at cps from t0; erased from t1 (backspace) at ecps
  function typed(t, text, t0, cps = 22, t1 = Infinity, ecps = 40) {
    let n = clamp(Math.floor((t - t0) * cps) + 1, 0, text.length);
    if (t < t0) n = 0;
    if (t >= t1) n = Math.max(0, n - Math.floor((t - t1) * ecps) - 1);
    return text.slice(0, n);
  }
  const blink = (t) => Math.floor(beatAt(t) * 2) % 2 === 0;
  const cam = (root, w = W, h = H) => reg(el('div', { class: 'abs', style: `width:${w}px;height:${h}px;transform-origin:50% 45%` }, root));
  const push = (t, S, b0, b1, amt = 0.04) => put(S.cam, { s: 1 + amt * ease.inOut(seg(t, b0, b1)) });
  const svgNS = 'http://www.w3.org/2000/svg';
  const BARS = (s, c = 'var(--accent)') => `<svg width="${19 * s}" height="${20 * s}" viewBox="0 0 19 20" style="overflow:visible">${
    [[0, 14, 6], [4, 10, 10], [8, 6, 14], [12, 3, 17], [16, 0, 20]].map(([x, y, h], i) =>
      `<rect data-bar="${i}" x="${x}" y="${y}" width="3" height="${h}" rx="0.857" fill="${c}" style="transform-box:fill-box;transform-origin:50% 100%"/>`).join('')}</svg>`;
  const pop = (t, b, preset = 'snappy') => { const p = spHit(t, b, preset); return { o: p > 0.22 ? 1 : 0, s: Math.abs(1 - p) < 0.002 ? 1 : 0.86 + 0.14 * p, p }; };

  // ---------------------------------------------------------------- pixel squares (Act 1 texture, reference grammar)
  // Seeded squares that snap in/out on half-beats. Each half-beat slot spawns a few; each lives 1–3 slots.
  const PIX = ['#D2401A', '#0C0B0A', '#C0B8B0', '#E4DED7', '#A83216', '#C0B8B0'];
  function pixels(g, t, band, dens = 9, yr = [300, 1480]) {
    const hb = Math.max(0, Math.floor(beatAt(t) * 2 + 1e-6));
    for (let j = hb - 3; j <= hb; j++) {
      const r = mulberry32(9001 + j * 131);
      const n = dens + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) {
        const life = 1 + Math.floor(r() * 3), x = 40 + r() * (W - 80), y = yr[0] + r() * (yr[1] - yr[0]);
        const sz = [8, 12, 16, 22, 30, 44][Math.floor(r() * 6)], tall = r() < 0.25 ? 2 : 1, wide = r() < 0.2 ? 2.4 : 1;
        const col = PIX[Math.floor(r() * PIX.length)], dots = r() < 0.12;
        if (hb - j >= life) continue;
        if (y > band[0] - 40 && y < band[1] + 40) continue;
        g.fillStyle = col;
        if (dots) { g.fillStyle = '#D8D1C9'; for (let k = 0; k < 3; k++) g.fillRect(x + k * 16, y, 9, 9); g.fillStyle = '#D2401A'; g.fillRect(x + 48, y, 9, 9); }
        else g.fillRect(Math.round(x), Math.round(y), Math.round(sz * wide), Math.round(sz * tall));
      }
    }
  }

  // ================================================================ 1–2 · HOOK: Google / was / enough. → (once)   b0 → b3
  scene({
    name: 'hook', from: 'hook', to: 'run1',
    build(root, S) {
      S.ctx = canvas(root);
      S.cam = cam(root);
      S.word = el('div', { class: 'abs ser', style: `left:${PAD + 6}px;top:720px;font-size:258px;line-height:1;color:var(--ink)` }, S.cam);
      S.txt = el('span', {}, S.word); S.dot = el('span', { style: 'color:var(--accent)' }, S.word, '.');
      S.caret = el('span', { style: 'display:inline-block;width:8px;height:220px;margin-left:12px;vertical-align:-20px;background:var(--accent)' }, S.word);
      reg(S.txt); reg(S.dot); reg(S.caret);
    },
    run(t, b, S) {
      const g = S.ctx; g.clearRect(0, 0, W, H); pixels(g, t, [700, 1010], 20, [430, 1300]);
      push(t, S, 'hook', 'run1', 0.05);
      // word timings from the VO (window.CAPS chunk 0): Google 0.00 · was 0.21 · enough 0.59 · Once 1.32
      const w = window.CAPS[0].t, once = window.CAPS[1].t[0];
      let s = '', dot = false;
      if (t < w[1] - 0.02) s = typed(t, 'Google', -0.16, 40);
      else if (t < w[2] - 0.02) s = typed(t, 'was', w[1] - 0.06, 40);
      else if (t < once - 0.21) { s = typed(t, 'enough', w[2] - 0.06, 34, once - 0.33, 40); dot = s === 'enough'; }
      else s = typed(t, '(once)', once - 0.23, 24);
      put(S.txt, { text: s }); put(S.dot, { o: dot ? 1 : 0, css: { display: dot ? 'inline' : 'none' } });
      put(S.caret, { o: blink(t) || (s.length > 0 && s.length < 6) ? 1 : 0 });
    },
  });

  // ================================================================ 3–4 · SEARCH SCREEN → AI CHAT BOX   b3 → b15.5
  // Generic search results page (no real search-engine branding): search bar, tabs, map pack, three results.
  // Ranking (b3) → #1 badge · Reviews (b4.5) → stars fill · A website (b6.25) → Website button.
  // b7.75 results collapse into the bar · b8.25 the bar becomes the AI chat box · question types · trade word swaps.
  const RUN = [['Ranking was enough', 'run1'], ['Reviews were enough', 'run2'], ['A website was enough', 'run3']];
  const TRADES = [['plumber', 'hook'], ['handyman', 'q_handyman'], ['dentist', 'q_dentist'], ['roofer', 'q_roofer'], ['salon', 15]];
  const Q0 = "Who's the best ", Q1 = ' near me?';
  scene({
    name: 'search', from: 'run1', to: 'wall',
    build(root, S) {
      S.ctx = canvas(root);
      S.cam = cam(root);
      S.lines = RUN.map(([s]) => line(S.cam, s.split(' ').slice(0, -1).join(' ') + ' ' + s.split(' ').pop() + DOT, { x: PAD - 6, y: 272, size: 66 }));
      // card
      S.card = el('div', { class: 'abs', style: `left:60px;top:0;width:960px;height:980px;background:var(--card);border-radius:38px;box-shadow:0 2px 6px rgba(12,11,10,.05),0 40px 90px -30px rgba(12,11,10,.35)` }, S.cam);
      reg(S.card, { o: 0 });
      const C2 = S.card;
      S.bar = el('div', { class: 'abs ui', style: 'left:36px;top:36px;width:888px;height:116px;border-radius:58px;border:2px solid var(--line);background:#fff;box-sizing:border-box;display:flex;align-items:center;padding:0 34px;gap:22px' }, C2);
      reg(S.bar);
      S.icoS = el('div', { style: 'width:40px;height:40px;flex:none;position:relative' }, S.bar,
        `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6F6A64" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>`);
      reg(S.icoS);
      S.icoA = el('div', { class: 'abs', style: 'left:30px;top:50%;margin-top:-22px;width:44px;height:44px' }, S.bar,
        `<svg width="44" height="44" viewBox="0 0 24 24"><path d="M12 2.5c.5 4.6 2.9 7 7.5 7.5-4.6.5-7 2.9-7.5 7.5-.5-4.6-2.9-7-7.5-7.5 4.6-.5 7-2.9 7.5-7.5z" fill="#D2401A"/><path d="M19 15.5c.2 1.8 1.1 2.7 2.9 2.9-1.8.2-2.7 1.1-2.9 2.9-.2-1.8-1.1-2.7-2.9-2.9 1.8-.2 2.7-1.1 2.9-2.9z" fill="#D2401A"/></svg>`);
      reg(S.icoA, { o: 0 });
      S.q = el('div', { style: 'font:500 42px UI;color:var(--ink);white-space:nowrap' }, S.bar, 'plumber near me'); reg(S.q);
      // chat text (serif) inside the bar, absolutely placed so the bar can grow around it
      S.chat = el('div', { class: 'abs ser', style: 'left:92px;top:0;height:100%;display:flex;align-items:center;font-size:64px;line-height:1.18;color:var(--ink)' }, S.bar);
      S.inner = el('span', { style: 'white-space:pre' }, S.chat);
      S.ct = el('span', {}, S.inner); reg(S.ct);
      S.mask = el('span', { style: 'display:inline-block;position:relative;overflow:hidden;vertical-align:bottom;height:1.25em;line-height:1.25em;padding:0 .02em' }, S.inner);
      S.tw = TRADES.map(([w]) => reg(el('span', { class: 'abs', style: 'left:0;top:0;font-weight:520;white-space:nowrap' }, S.mask, w), { o: 0 }));
      S.postEl = el('span', {}, S.inner, '\n' + Q1.trim()); reg(S.postEl);
      S.ccaret = el('span', { style: 'display:inline-block;width:5px;height:66px;margin-left:6px;vertical-align:-8px;background:var(--accent)' }, S.inner); reg(S.ccaret, { o: 0 });
      reg(S.mask); reg(S.chat, { o: 0 });
      S.ask = el('div', { class: 'abs ui', style: 'left:104px;top:0;font:600 32px UI;color:var(--ink-3);letter-spacing:.01em;display:flex;align-items:center;gap:12px' }, S.cam,
        '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--accent)"></span>Ask AI anything');
      reg(S.ask, { o: 0 });
      S.hist = ['Best family dentist open Saturday?', 'Who fixes leaks fast near me?'].map((q) =>
        reg(el('div', { class: 'abs ui', style: 'left:auto;right:134px;top:0;padding:20px 28px;border-radius:28px 28px 8px 28px;background:#EFE9E3;color:#8F8983;font:500 30px UI;white-space:nowrap;transform-origin:100% 100%' }, S.cam, q), { o: 0 }));
      S.sugg = ['Emergency plumber tonight?', 'Dentist open Saturday?', 'Most trusted roofer?', 'Salon with best reviews?'].map((q, i) =>
        reg(el('div', { class: 'abs ui', style: `left:${i % 2 ? 530 : 96}px;top:0;height:72px;padding:0 26px;border-radius:36px;background:#ECE7E1;color:var(--ink-2);font:500 29px/72px UI;white-space:nowrap;transform-origin:0 50%` }, S.cam, q), { o: 0 }));
      // tabs, meta, map pack, results
      S.body = el('div', { class: 'abs', style: 'left:0;top:0;width:960px;height:980px' }, C2); reg(S.body);
      const B2 = S.body;
      S.tabs = el('div', { class: 'abs ui', style: 'left:58px;top:186px;display:flex;gap:46px;font:500 32px UI;color:var(--ink-3)' }, B2,
        '<span style="color:var(--ink);font-weight:600;border-bottom:4px solid var(--accent);padding-bottom:10px">All</span><span>Maps</span><span>Reviews</span><span>Images</span><span>News</span>');
      el('div', { class: 'abs', style: 'left:36px;top:250px;width:888px;height:2px;background:var(--line)' }, B2);
      S.meta = el('div', { class: 'abs ui', style: 'left:58px;top:270px;font:400 24px UI;color:var(--ink-4)' }, B2, 'About 1,240,000 results (0.41 seconds)');
      S.map = el('div', { class: 'abs', style: `left:36px;top:314px;width:888px;height:170px;border-radius:22px;overflow:hidden;background:#EEEAE4;
        background-image:linear-gradient(28deg,transparent 46%,#fff 46%,#fff 50%,transparent 50%),linear-gradient(-62deg,transparent 30%,#fff 30%,#fff 33%,transparent 33%),linear-gradient(90deg,transparent 70%,#E2DDD5 70%,#E2DDD5 71%,transparent 71%),linear-gradient(0deg,transparent 40%,#E2DDD5 40%,#E2DDD5 41.5%,transparent 41.5%)` }, B2);
      S.pins = [[160, 52, 1], [450, 94, 0], [720, 44, 0]].map(([x, y, a]) => reg(el('div', { class: 'abs', style: `left:${x}px;top:${y}px;width:40px;height:40px;border-radius:50% 50% 50% 0;transform-origin:0 100%;background:${a ? 'var(--accent)' : 'var(--ink-3)'};border:4px solid #fff;box-sizing:border-box` }, S.map), { r: -45 }));
      const RES = [['Your Business', 'yourbusiness.com', 'Plumbing & Drain Repair'], ['Competitor A', 'competitor-a.com', 'Plumbers · Free Quotes'], ['Competitor B', 'competitor-b.com', 'Emergency Plumbing Services']];
      S.res = RES.map(([n, u, ttl], i) => {
        const r = el('div', { class: 'abs ui', style: `left:36px;top:${506 + i * 156}px;width:888px;height:146px;border-radius:22px` }, B2);
        el('div', { class: 'abs', style: 'left:20px;top:16px;width:50px;height:50px;border-radius:50%;background:' + (i ? '#E4DED7' : 'var(--accent-soft)') }, r,
          i ? '' : `<div style="position:absolute;left:13px;top:12px">${BARS(1.25)}</div>`);
        el('div', { class: 'abs', style: 'left:84px;top:10px;font:600 32px UI;color:var(--ink)' }, r, n);
        el('div', { class: 'abs', style: 'left:84px;top:50px;font:400 24px UI;color:var(--ink-4)' }, r, u);
        el('div', { class: 'abs', style: 'left:20px;top:90px;font:500 36px UI;color:var(--ink-2);white-space:nowrap' }, r, ttl);
        return reg(r);
      });
      // result-1 highlights
      const r1 = S.res[0];
      S.hl = reg(el('div', { class: 'abs', style: 'left:0;top:0;width:888px;height:146px;border-radius:22px;background:var(--accent-soft);z-index:-1' }, r1), { o: 0 });
      r1.style.zIndex = 0;
      S.badge = reg(el('div', { class: 'abs ui', style: 'left:auto;right:18px;top:14px;height:54px;padding:0 22px;border-radius:27px;background:var(--accent);color:#fff;font:700 30px/54px UI' }, r1, '#1 result'), { o: 0 });
      S.stars = [0, 1, 2, 3, 4].map((i) => reg(el('div', { class: 'abs', style: `left:${506 + i * 38}px;top:90px;font:400 38px UI;color:var(--accent)` }, r1, '★'), { o: 0 }));
      S.rate = reg(el('div', { class: 'abs ui', style: 'left:704px;top:96px;font:600 30px UI;color:var(--ink-2)' }, r1, '4.9 (212)'), { o: 0 });
      S.site = reg(el('div', { class: 'abs ui', style: 'left:336px;top:16px;height:52px;padding:0 20px;border-radius:26px;border:3px solid var(--accent);color:var(--accent);font:700 28px/46px UI;box-sizing:border-box' }, r1, 'Website ↗'), { o: 0 });
    },
    run(t, b, S) {
      const g = S.ctx; g.clearRect(0, 0, W, H); if (b < 8.25) pixels(g, t, [230, 370], 6);
      put(S.cam, { s: 1 + 0.035 * ease.inOut(seg(t, 'run1', 'chat')) });
      // run lines: one per VO phrase, hard swap (outgoing fully gone first)
      rise(t, S.lines[0], 'run1', 4.5 - 0.2, { preset: 'snappy', stagger: 0.05, exit: 0.2 });
      rise(t, S.lines[1], 'run2', 6.25 - 0.2, { preset: 'snappy', stagger: 0.05, exit: 0.2 });
      rise(t, S.lines[2], 'run3', 7.75, { preset: 'snappy', stagger: 0.05, exit: 0.25 });
      if (b > 8.6) S.lines.forEach((L) => L.words.forEach((w) => put(w, { hide: true })));
      // card rises in on run1
      const cin = spHit(t, 'run1', 'default');
      // collapse (results fold into the bar) then move to the chat position
      const col = sp(t, 7.75, 'default');
      const edge = 980 - 792 * col;   // clip edge in card px
      const cy = trk(t, [[0, 370], [8.0, 520, 'default']]) + 560 * (1 - cin);
      const folded = col > 0.985;
      put(S.card, folded ? { o: 1, y: cy, css: { background: 'transparent', boxShadow: 'none' } }
        : { o: cin > 0.002 ? 1 : 0, y: cy, clip: `inset(0 0 ${(980 - 188) * col}px 0 round 38px)`, r: -2 * (1 - cin) });
      put(S.body, { o: folded ? 0 : 1 });
      [[S.tabs, 262], [S.meta, 300], [S.map, 484]].forEach(([e, bot]) => put(e, { o: edge < bot + 4 ? 0 : 1 }));
      // map pins drop in one after another
      S.pins.forEach((p, i) => { const q = spHit(t, 3.25 + i * 0.25, 'snappy'); put(p, { o: q > 0.002 ? 1 : 0, r: -45, s: 0.5 + 0.5 * q }); });
      S.res.forEach((r, i) => { const q = spHit(t, 3 + i * 0.25, 'default'); put(r, { y: 30 * (1 - q), o: q > 0.002 && edge >= 506 + i * 156 + 150 ? 1 : 0 }); });
      // Ranking → #1
      const hl = sp(t, 'run1', 'snappy'), bd = pop(t, 3.5);
      put(S.hl, { o: hl * 1 });
      put(S.badge, { o: bd.o, s: bd.s });
      // Reviews → stars fill one by one
      S.stars.forEach((s, i) => { const q = pop(t, beatOf('run2') + i * 0.15); put(s, q); });
      const rt = pop(t, beatOf('run2') + 0.8); put(S.rate, rt);
      // A website → Website button
      const ws = pop(t, 'run3'); put(S.site, ws);
      // ---- chat mode
      const ch = sp(t, 'chat', 'default');                    // 0 → 1 as the bar becomes a chat box
      const hgt = lerp(116, 270, ch), wid = lerp(888, 840, ch);
      put(S.bar, { css: { height: hgt + 'px', width: wid + 'px', borderRadius: lerp(58, 36, ch) + 'px', borderColor: ch > 0.5 ? '#fff' : '',
        boxShadow: ch > 0.02 ? `0 30px 70px -24px rgba(12,11,10,${0.35 * ch})` : '' } });
      const qOut = sp(t, 8.0, 'snappy');
      put(S.q, { y: -60 * qOut, o: qOut < 0.5 ? 1 : 0 });
      put(S.icoS, { o: ch < 0.5 ? 1 : 0, s: 1 - 0.3 * ch });
      const ia = pop(t, 'chat'); put(S.icoA, ia);
      const askp = spHit(t, 8.5, 'snappy'); put(S.ask, { o: askp > 0.002 ? 1 : 0, y: cy - 64 + 16 * (1 - askp) });
      S.hist.forEach((e, i) => { const q = pop(t, 8.5 + i * 0.35, 'default'); put(e, { o: q.o, y: Math.round(cy - 300 + i * 112 - 30 * seg(t, 8.5, 15.5)) }); });
      S.sugg.forEach((e, i) => { const q = pop(t, 9.75 + i * 0.25); put(e, { o: q.o, s: q.s, y: cy + 360 + Math.floor(i / 2) * 96 }); });
      // question types (b8.75 → b11.75), then trade words swap through a mask
      const full = Q0 + 'plumber\n' + Q1.trim();
      const t0 = bt(8.75), cps = full.length / (bt(11.75) - t0);
      const showChat = b >= 8.5;
      put(S.chat, { o: showChat ? 1 : 0 });
      if (b < 11.75) {
        const s = typed(t, full, t0, cps);
        put(S.ct, { text: s }); put(S.mask, { css: { display: 'none' } }); put(S.postEl, { css: { display: 'none' } });
        put(S.ccaret, { o: showChat && (blink(t) || s.length < full.length) ? 1 : 0 });
      } else {
        put(S.ct, { text: Q0 }); put(S.ccaret, { o: 0 });
        // mask width follows the current word (measured once fonts are in)
        if (!S.wid) { const m = document.createElement('canvas').getContext('2d'); m.font = "520 64px Display"; S.wid = TRADES.map(([w]) => m.measureText(w).width + 4); }
        const keys = [[0, S.wid[0]]].concat(TRADES.slice(1).map(([, m], i) => [beatOf(m) - 0.06, S.wid[i + 1], 'snappy']));
        put(S.mask, { css: { width: trk(t, keys).toFixed(1) + 'px' } });
        TRADES.forEach(([, m], i) => {
          const inB = i === 0 ? -9 : beatOf(m), outB = i < TRADES.length - 1 ? beatOf(TRADES[i + 1][1]) : 99;
          const a = i === 0 ? 1 : spHit(t, inB, 'snappy'), o = C.sp(t, outB - 0.12, 'snappy');
          const y = 70 * (1 - a) - 70 * o;
          put(S.tw[i], { o: a > 0.01 && o < 0.99 ? 1 : 0, y, css: { color: i === 0 ? 'var(--ink)' : 'var(--accent)' } });
        });
      }
    },
  });

  // ================================================================ 5–6 · QUESTION WALL → Your. Next. Customer.   b15.5 → b22
  const QS = ['Who fixes leaks fast | near me?', 'Best family dentist | open Saturday?', 'Most trusted roofer | in town?', 'Who does | same-day AC repair?',
    'Which salon | has the best reviews?', 'Is there a | lawyer open now?', "Who's the go-to | vet around here?", 'Best | handyman for small jobs?',
    'Who can | fix my roof today?', 'Which dentist | takes walk-ins?', "Who's the most | reliable mechanic?", 'Where can I | get braces fast?',
    'Who installs | water heaters today?', 'Best rated | electrician near me?', 'Who has the | best kids dentist?', 'Is it worth | calling a pro?'];
  scene({
    name: 'wall', from: 'wall', to: 'answer',
    build(root, S) {
      S.cam = cam(root);
      S.wall = reg(el('div', { class: 'abs', style: `left:0;top:0;width:${W}px;height:2000px` }, S.cam));
      S.rows = QS.map((q, i) => {
        const [a, c] = q.split(' | ');
        const r = el('div', { class: 'abs ser', style: `left:-34px;top:${330 + i * 84}px;width:${W}px;text-align:center;font-size:47px;color:var(--ink)` }, S.wall,
          `${a} <span data-d style="display:inline-block;width:.56em;height:.56em;border-radius:50%;background:var(--accent);vertical-align:-.02em;margin:0 .06em"></span> ${c}`);
        reg(r, { o: 0 });
        r._dot = reg(r.querySelector('[data-d]'), { s: 0 });
        return r;
      });
      S.stack = ['Your' + DOT, 'Next' + DOT, 'Customer' + DOT].map((w, i) => line(S.cam, w, { x: PAD + 10, y: 520 + i * 230, size: 200 }));
    },
    run(t, b, S) {
      push(t, S, 'wall', 'answer', 0.05);
      const scroll = ease.inOut(seg(t, 'wall', 'answer'));
      put(S.wall, { y: -560 * scroll });
      S.rows.forEach((r, i) => {
        const rb = i < 8 ? 15.3 + i * 0.03 : 15.6 + (i - 8) * 0.25;
        const q = spHit(t, rb, 'snappy');
        put(r, { o: q > 0.002 ? 1 : 0, y: 26 * (1 - q) });
        put(r._dot, { s: spHit(t, Math.max(15.5, rb) + 0.25 + (i < 8 ? i * 0.12 : 0), 'snappy') });
      });
      // the wall drops behind the statement (blurred, dimmed: it is a background, not an exit)
      const dim = sp(t, 18.5, 'default');
      put(S.wall, { y: -560 * scroll, clip: `inset(0 0 ${(2000 - (1300 + 560 * scroll)).toFixed(1)}px 0)`, filter: dim > 0.01 ? `blur(${(9 * dim).toFixed(2)}px)` : '', o: 1 - 0.75 * dim });
      rise(t, S.stack[0], 'stack1', null, { stagger: 0 });
      rise(t, S.stack[1], beatOf('stack2') - 0.1, null, { stagger: 0 });
      rise(t, S.stack[2], beatOf('stack3') - 0.14, null, { stagger: 0 });
    },
  });

  // ================================================================ 7 · AI ANSWER: top picks, Your Business falls out   b22 → b28
  scene({
    name: 'answer', from: 'answer', to: 'act3',
    build(root, S) {
      S.cam = cam(root);
      S.user = reg(el('div', { class: 'abs ui', style: 'left:auto;right:136px;top:300px;padding:22px 30px;border-radius:28px 28px 8px 28px;background:var(--accent-soft);font:500 32px UI;color:var(--ink);transform-origin:100% 100%' }, S.cam,
        "Who's the best plumber near me?"), { o: 0 });
      S.lead = el('div', { class: 'abs ui', style: 'left:96px;top:430px;font:500 30px UI;color:var(--ink-3);display:flex;align-items:center;gap:14px' }, S.cam);
      el('span', { style: 'display:inline-block;width:14px;height:14px;border-radius:50%;background:var(--accent)' }, S.lead);
      S.leadT = el('span', {}, S.lead); reg(S.leadT); reg(S.lead, { o: 0 });
      const tiles = (parent, seed) => {
        const r = mulberry32(seed), row = el('div', { class: 'abs', style: 'left:56px;top:70px;display:flex;gap:16px' }, parent);
        return [0, 1, 2].map(() => {
          const h1 = 18 + r() * 14, l1 = 70 + r() * 10, l2 = 58 + r() * 12;
          return reg(el('div', { style: `width:238px;height:132px;border-radius:16px;background:linear-gradient(${Math.floor(r() * 180)}deg,hsl(${h1} 22% ${l1}%),hsl(${h1 + 8} 18% ${l2}%));transform-origin:0 50%` }, row), { o: 0 });
        });
      };
      const skel = (parent) => el('div', { class: 'abs', style: 'left:56px;top:0;width:800px;height:210px' }, parent,
        '<div style="position:absolute;left:0;top:6px;width:230px;height:46px;border-radius:23px;background:#E9E4DE"></div>' + [0, 1, 2].map((k) => `<div style="position:absolute;left:${k * 254}px;top:70px;width:238px;height:132px;border-radius:16px;background:#EDE9E4"></div>`).join(''));
      S.items = ['Competitor A', 'Competitor B'].map((n, i) => {
        const it = el('div', { class: 'abs ui', style: `left:96px;top:${500 + i * 250}px;width:900px;height:220px` }, S.cam);
        el('div', { class: 'abs', style: 'left:0;top:8px;font:500 32px UI;color:var(--ink-4)' }, it, `${i + 1}.`);
        const pill = reg(el('div', { class: 'abs', style: `left:56px;top:0;height:58px;padding:0 26px;border-radius:29px;font:600 30px/58px UI;transform-origin:0 50%;${i ? 'background:#E4DED7;color:var(--ink)' : 'background:var(--ink);color:#fff'}` }, it, n), { o: 0 });
        const sk = reg(skel(it), { o: 1 });
        return { it, pill, sk, tiles: tiles(it, 40 + i) };
      });
      const it3 = el('div', { class: 'abs ui', style: 'left:96px;top:1000px;width:900px;height:260px' }, S.cam);
      el('div', { class: 'abs', style: 'left:0;top:8px;font:500 32px UI;color:var(--ink-4)' }, it3, '3.');
      S.think = reg(el('div', { class: 'abs', style: 'left:56px;top:10px;font:400 30px UI;color:var(--ink-4)' }, it3, 'Thinking…'), { o: 0 });
      S.yb = reg(el('div', { class: 'abs', style: 'z-index:3;left:56px;top:70px;height:58px;padding:0 26px;border-radius:29px;font:600 30px/58px UI;background:var(--accent);color:#fff;transform-origin:30% 50%' }, it3, 'Your Business'), { o: 0 });
      S.c3 = reg(el('div', { class: 'abs', style: 'left:56px;top:146px;height:58px;padding:0 26px;border-radius:29px;font:600 30px/58px UI;background:#E4DED7;color:var(--ink);transform-origin:0 50%' }, it3, 'Competitor C'), { o: 0 });
      S.sk3 = reg(skel(it3), { o: 1 }); S.sk3.style.transformOrigin = '0 0';
      S.t3 = tiles(it3, 77); S.t3row = S.t3[0].parentNode; S.t3row.style.top = '70px';
    },
    run(t, b, S) {
      push(t, S, 'answer', 'act3', 0.04);
      const u = pop(t, 21.7); put(S.user, u);
      put(S.lead, { o: 1 }); put(S.leadT, { text: typed(t, 'Here are my top picks:', bt(21.9), 34) });
      S.items.forEach((it, i) => {
        const m = beatOf('pick1') + i, p = pop(t, m); put(it.pill, p); put(it.sk, { o: p.p > 0.5 ? 0 : 1 });
        it.tiles.forEach((tl, k) => { const q = spHit(t, m + k * 0.06, 'snappy'); put(tl, { o: q > 0.002 ? 1 : 0, sx: 0.9 + 0.1 * q, y: 16 * (1 - q) }); });
      });
      // slot 3: Thinking… → two candidates → Your Business is dropped, Competitor C takes the slot
      const th = b >= 23.4 && b < 26.1; put(S.think, { o: th ? (Math.floor(b * 4) % 4 === 3 ? 0.55 : 1) : 0 });
      const yb = pop(t, 'pick3'), c3 = pop(t, 'pick3');
      const fold = sp(t, beatOf('pick3') - 0.3, 'snappy');
      put(S.sk3, { o: fold > 0.97 ? 0 : 1, sy: 1 - fold });
      const fall = sp(t, 'drop', 'default');
      put(S.yb, { o: yb.o, s: yb.s, y: 980 * fall, x: 40 * fall, r: 6 * fall, hide: fall > 0.995 });
      const up = sp(t, 26.1, 'snappy');
      put(S.c3, { o: c3.o, s: c3.s, y: -136 * up });
      S.t3.forEach((tl, k) => { const q = spHit(t, 26.5 + k * 0.12, 'default'); put(tl, { o: q > 0.002 ? 1 : 0, sx: 0.9 + 0.1 * q, y: 16 * (1 - q) }); });
    },
  });

  // ================================================================ 8 · ACT 3: dashboards on dark   b28 → b34
  const DARKBG = (k) => `radial-gradient(${120 + 20 * k}% ${70 + 10 * k}% at ${92 - 6 * k}% 108%, #7a2410 0%, #3a1208 30%, #160807 55%, #0C0B0A 78%)`;
  const card = (parent, x, y, w, h) => reg(el('div', { class: 'abs ui', style: `left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:30px;background:var(--card);box-shadow:0 50px 100px -30px rgba(0,0,0,.7);transform-origin:50% 100%` }, parent), { o: 0 });
  scene({
    name: 'act3', from: 'act3', to: 'check',
    build(root, S) {
      S.bg = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px` }, root));
      S.cam = cam(root);
      // secondary dashboard cards behind (blurred, dimmed): depth like the reference's layered UI
      S.ghost = [[330, 150, 620, 300, 'Share of voice'], [-160, 1180, 560, 330, 'Mentions by platform'], [620, 760, 520, 380, 'Citations']].map(([x, y, w, h, n]) => {
        const e = reg(el('div', { class: 'abs ui', style: `left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:26px;background:#1F1A17;border:2px solid #2E2723;filter:blur(3px);opacity:.75` }, S.cam));
        el('div', { class: 'abs', style: 'left:30px;top:26px;font:600 26px UI;color:#8A837B' }, e, n);
        for (let i = 0; i < 4; i++) el('div', { class: 'abs', style: `left:30px;top:${80 + i * 52}px;width:${(0.4 + ((i * 37) % 50) / 100) * (w - 60)}px;height:18px;border-radius:9px;background:${i ? '#3A322D' : '#7a2410'}` }, e);
        return e;
      });
      // gauge card
      S.g = card(S.cam, 80, 280, 870, 540);
      el('div', { class: 'abs', style: 'left:44px;top:36px;font:700 40px UI;color:var(--ink)' }, S.g, 'AI Visibility Score');
      el('div', { class: 'abs', style: 'left:44px;top:96px;display:flex;gap:24px;font:500 24px UI;color:var(--ink-3)' }, S.g,
        ['#E4DED7', '#E39A82', '#D2401A'].map((c, i) => `<span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c};margin-right:8px"></span>${['0–33 Low', '34–66 Medium', '67–100 High'][i]}</span>`).join(''));
      const R = 210, cx = 435, cy = 460;
      S.gsvg = el('div', { class: 'abs', style: 'left:0;top:0' }, S.g,
        `<svg width="870" height="540" viewBox="0 0 870 540"><path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" stroke="#ECE7E1" stroke-width="46" fill="none" stroke-linecap="round"/>
         <path id="garc" d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" stroke="#D2401A" stroke-width="46" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="0 200"/>
         <text x="${cx - R}" y="${cy + 56}" text-anchor="middle" font-family="UI" font-size="22" fill="#A39D96">0</text><text x="${cx + R}" y="${cy + 56}" text-anchor="middle" font-family="UI" font-size="22" fill="#A39D96">100</text></svg>`);
      S.arc = S.gsvg.querySelector('#garc'); reg(S.arc);
      S.num = el('div', { class: 'abs', style: `left:${cx - 200}px;top:${cy - 120}px;width:400px;text-align:center;font:700 104px UI;color:var(--ink);letter-spacing:-.03em` }, S.g);
      S.numT = el('span', {}, S.num); el('span', { style: 'font-size:52px;letter-spacing:0' }, S.num, '%'); reg(S.numT);
      el('div', { class: 'abs', style: `left:${cx - 200}px;top:${cy + 4}px;width:400px;text-align:center;font:600 24px UI;letter-spacing:.14em;color:var(--ink-3)` }, S.g, 'SCORE');
      // chart card
      S.k = card(S.cam, 80, 860, 870, 470);
      el('div', { class: 'abs', style: 'left:44px;top:34px;font:700 40px UI;color:var(--ink)' }, S.k, 'Who AI recommends');
      el('div', { class: 'abs', style: 'left:44px;top:92px;display:flex;flex-wrap:wrap;width:790px;gap:6px 22px;font:500 24px UI;color:var(--ink-3)' }, S.k,
        [['#D2401A', 'Your Business'], ['#6F6A64', 'Competitor A'], ['#A39D96', 'Competitor B'], ['#D3CCC4', 'Competitor C']].map(([c, n]) => `<span><span style="display:inline-block;width:22px;height:5px;border-radius:3px;background:${c};margin-right:8px;vertical-align:4px"></span>${n}</span>`).join(''));
      const X = (i) => 70 + i * 146, Y = (v) => 420 - v * 2.3;
      const L = { a: [62, 64, 60, 57, 52, 48], b: [48, 50, 47, 44, 41, 38], c: [36, 34, 35, 31, 29, 27], y: [14, 18, 30, 47, 66, 84] };
      const pl = (v) => v.map((y, i) => `${X(i)},${Y(y)}`).join(' ');
      S.ksvg = el('div', { class: 'abs', style: 'left:0;top:0' }, S.k,
        `<svg width="870" height="470" viewBox="0 0 870 470">${[0, 25, 50, 75, 100].map((v) => `<line x1="70" x2="800" y1="${Y(v)}" y2="${Y(v)}" stroke="#EFEBE6" stroke-width="2"/>`).join('')}
         ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => `<text x="${X(i)}" y="452" text-anchor="middle" font-family="UI" font-size="22" fill="#A39D96">${m}</text>`).join('')}
         <g id="klines"><polyline points="${pl(L.c)}" stroke="#D3CCC4" stroke-width="5" fill="none" stroke-linejoin="round"/><polyline points="${pl(L.b)}" stroke="#A39D96" stroke-width="5" fill="none" stroke-linejoin="round"/>
         <polyline points="${pl(L.a)}" stroke="#6F6A64" stroke-width="5" fill="none" stroke-linejoin="round"/><polyline points="${pl(L.y)}" stroke="#D2401A" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
         ${L.y.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="9" fill="#fff" stroke="#D2401A" stroke-width="5"/>`).join('')}</g></svg>`);
      S.klines = S.ksvg.querySelector('#klines'); reg(S.klines);
      S.ktag = reg(el('div', { class: 'abs', style: `left:${X(5) - 262}px;top:${Y(84) - 34}px;height:52px;padding:0 20px;border-radius:26px;background:var(--accent);color:#fff;font:700 26px/52px UI;transform-origin:100% 50%` }, S.k, 'Your Business ▲'), { o: 0 });
    },
    run(t, b, S) {
      put(S.bg, { css: { background: DARKBG(seg(t, 'act3', 'done')) } });
      const k = spHit(t, 'chart', 'default');
      const g0 = 0.6 + 0.4 * sp(t, 'act3', 'default');
      put(S.g, { o: 1, y: 220 * (1 - g0), s: 0.92 + 0.08 * g0 });
      S.ghost.forEach((e, i) => put(e, { x: 26 * Math.sin(t * 0.7 + i * 2), y: 14 * Math.cos(t * 0.5 + i) }));
      put(S.cam, { s: 1 + 0.05 * seg(t, 'act3', 'check'), x: trk(t, [[0, 0], [30.5, -16, 'default'], [32.5, 12, 'default']]) });
      put(S.k, { o: k > 0.002 ? 1 : 0, y: 36 * (1 - k), s: 0.9 + 0.1 * k });
      const v = trk(t, [[0, 12], [28.5 - 0.15, 17, 'snappy'], [29, 44, 'heavy'], [30, 78, 'heavy']]);
      put(S.arc, { css: { strokeDasharray: `${Math.max(0.5, v).toFixed(2)} 200` } });
      put(S.numT, { text: String(Math.round(v)) });
      const rv = ease.inOut(seg(t, 31.4, 33.4));
      put(S.klines, { clip: `inset(0 ${(100 - 100 * rv).toFixed(2)}% 0 0)` });
      const tg = pop(t, 33.5); put(S.ktag, tg);
    },
  });

  // ================================================================ 9 · FIX CHECKLIST   b34 → b40
  const FIX = ['Google profile fixed', 'Reviews flowing', 'Website AI-ready', 'Listings matched'];
  scene({
    name: 'check', from: 'check', to: 'end',
    build(root, S) {
      S.bg = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px` }, root));
      S.cam = cam(root);
      S.back = reg(el('div', { class: 'abs ui', style: 'display:none;left:150px;top:250px;width:740px;height:300px;border-radius:26px;background:var(--card);filter:blur(4px);opacity:.28' }, S.cam,
        '<div style="position:absolute;left:40px;top:30px;font:700 34px UI;color:#0C0B0A">AI Visibility Score</div><div style="position:absolute;left:40px;top:90px;font:700 120px UI;color:#D2401A">78%</div>'));
      S.card = card(S.cam, 80, 330, 870, 860);
      el('div', { class: 'abs', style: 'left:40px;top:40px;height:60px;padding:0 26px;border-radius:30px;background:var(--accent);color:#fff;font:700 30px/60px UI' }, S.card, 'Recommended fixes');
      el('div', { class: 'abs', style: 'left:auto;right:44px;top:54px;font:500 28px UI;color:var(--ink-3)' }, S.card, '4 actions');
      S.rows = FIX.map((f, i) => {
        const r = el('div', { class: 'abs', style: `left:40px;top:${146 + i * 172}px;width:790px;height:150px;border-radius:24px;background:#F4F1EC` }, S.card);
        const box = el('div', { class: 'abs', style: 'left:28px;top:44px;width:62px;height:62px;border-radius:16px;border:3px solid #CFC8C0;box-sizing:border-box;background:#fff' }, r);
        const fill = reg(el('div', { class: 'abs', style: 'left:28px;top:44px;width:62px;height:62px;border-radius:16px;background:var(--accent)' }, r,
          '<svg width="60" height="60" viewBox="-4 -4 60 60"><path d="M14 27 l8 8 l16 -18" stroke="#fff" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/></svg>'), { o: 0 });
        fill._p = fill.querySelector('path'); reg(fill._p);
        el('div', { class: 'abs', style: 'left:118px;top:48px;font:600 44px UI;color:var(--ink)' }, r, f);
        const done = reg(el('div', { class: 'abs', style: 'left:auto;right:26px;top:51px;height:48px;padding:0 18px;border-radius:24px;background:var(--accent-soft);color:var(--accent);font:700 26px/48px UI' }, r, 'Done'), { o: 0 });
        return { r, fill, done };
      });
      S.score = reg(el('div', { class: 'abs ui', style: 'left:80px;top:1226px;height:92px;padding:0 36px;border-radius:42px;background:rgba(253,252,250,.1);border:2px solid rgba(253,252,250,.22);color:#F5F3F0;font:600 32px/80px UI;transform-origin:0 50%' }, S.cam,
        'AI Visibility <b style="color:#fff">12%</b>'), { o: 0 });
    },
    run(t, b, S) {
      put(S.bg, { css: { background: DARKBG(seg(t, 'act3', 'done')) } });
      put(S.cam, { s: 1 + 0.05 * seg(t, 'check', 'end') });
      const c = spHit(t, 'check', 'default');
      put(S.card, { o: c > 0.002 ? 1 : 0, y: 140 * (1 - c), s: 0.94 + 0.06 * c });
      S.rows.forEach((r, i) => {
        const m = beatOf('tick1') + i, p = spHit(t, m, 'snappy');
        put(r.fill, { o: p > 0.002 ? 1 : 0, s: 0.6 + 0.4 * p });
        put(r.fill._p, { css: { strokeDashoffset: (1 - clamp(C.sp(t, m - 0.05, 'default'))).toFixed(3) } });
        const d = pop(t, m + 0.35); put(r.done, d);
      });
      const sc = pop(t, 34.5, 'default');
      const pct = Math.round(trk(t, [[0, 12], [35, 29, 'snappy'], [36, 45, 'snappy'], [37, 62, 'snappy'], [38, 78, 'snappy']]));
      put(S.score, { ...sc, html: `AI Visibility <b style="color:#fff">${pct}%</b>${pct >= 78 ? ' <span style="color:#E39A82">▲ +66</span>' : ''}` });
    },
  });

  // ================================================================ 10 · END CARD   b40 → done
  scene({
    name: 'end', from: 'end', to: 'done',
    build(root, S) {
      S.bg = reg(el('div', { class: 'abs', style: `width:${W}px;height:${H}px` }, root));
      S.cam = cam(root);
      S.l1 = line(S.cam, 'Be the name', { x: PAD + 14, y: 600, size: 150, color: '#F5F3F0' });
      S.l2 = line(S.cam, 'AI says' + DOT, { x: PAD + 14, y: 770, size: 150, color: '#F5F3F0' });
      S.logo = el('div', { class: 'abs', style: `left:${PAD + 20}px;top:1030px;display:flex;align-items:flex-end;gap:26px` }, S.cam);
      S.mark = el('div', { style: 'width:84px;height:88px' }, S.logo, BARS(4.4));
      S.bars = [...S.mark.querySelectorAll('rect')].map((r) => reg(r, { sy: 0 }));
      S.wmMask = el('div', { style: 'overflow:hidden;padding:0 6px 8px 0;margin-bottom:-12px' }, S.logo);
      S.wm = reg(el('div', { style: 'font:700 100px/1 UI;letter-spacing:-.035em;color:#F5F3F0' }, S.wmMask, 'Growlatics'));
      S.url = line(S.cam, 'growlatics.us', { x: PAD + 22, y: 1180, size: 58, cls: 'ui', color: '#F5F3F0' });
      S.url.el.style.fontWeight = 600;
    },
    run(t, b, S) {
      put(S.bg, { css: { background: DARKBG(seg(t, 'act3', 'done')) } });
      put(S.cam, { s: 1 + 0.07 * seg(t, 'end', 'done'), y: -24 * seg(t, 'end', 'done') });
      // words land with the voice: Be 26.55 · the · name 26.77 · AI 27.05 · says 27.41
      const vw = window.CAPS.find((c) => c.words[0] === 'Be' && c.words[1] === 'the');
      const ai = window.CAPS.find((c) => c.words[0] === 'AI' && c.words[1] === 'says.');
      const bw = [...vw.t, ...ai.t].map((x) => beatAt(x)); bw[0] = 39.55; bw[1] = Math.max(bw[1], 39.85);
      rise(t, S.l1, bw.slice(0, 3), null, { preset: 'heavy' });
      rise(t, S.l2, bw.slice(3, 5), null, { preset: 'heavy' });
      // logo builds bar by bar on the spoken "Growlatics", wordmark rises, URL last
      S.bars.forEach((r, i) => put(r, { sy: Math.max(0.001, spHit(t, beatOf('logo') + i * 0.12, 'snappy')) }));
      const wm = spHit(t, beatOf('logo') + 0.3, 'heavy'); put(S.wm, { y: 110 * (1 - wm), hide: wm < 0.002 });
      rise(t, S.url, 'url', null, { preset: 'snappy', stagger: 0 });
    },
  });

  // ================================================================ CAPTIONS (on top of everything, whole film)
  scene({
    name: 'captions', from: 'hook', to: 'done',
    build(root, S) {
      root.style.zIndex = 50;
      S.caps = window.CAPS.map((c) => {
        const d = el('div', { class: 'cap', style: 'top:1398px' }, root);
        const ws = c.words.map((w, i) => { const s = reg(el('span', {}, d, w), { o: 0 }); if (i < c.words.length - 1) d.appendChild(document.createTextNode(' ')); return s; });
        return { c, d: reg(d, { o: 0 }), ws };
      });
      S.caps.forEach((k, i) => { const nx = S.caps[i + 1]; k.stop = nx ? Math.min(k.c.end, nx.c.t[0] - 1 / 30) : k.c.end; });
    },
    run(t, b, S) {
      const L = 1 / 30;
      for (const k of S.caps) {
        const on = t >= k.c.t[0] - L && t < k.stop;
        put(k.d, { o: on ? 1 : 0 });
        if (on) k.ws.forEach((w, i) => put(w, { o: t >= k.c.t[i] - L ? 1 : 0 }));
      }
    },
  });

  C.start();
})();
