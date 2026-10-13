// Project-local helper: 3x element screenshots of specific dashboard cards on getorem.com, for faithful rebuilds.
//   node scripts/cap_cards.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const { chromium } = require('playwright');
const LABELS = {
  weekly: 'Brand mention rate · weekly · 95% CI',
  pillar: 'MENTION RATE',
  engines: 'Engine breakdown · mention rate this week',
  sources: 'Most-cited sources',
  halluc: 'Nothing wrong about Orem this week',
  workspaces: 'Workspace · engine',
  chat: 'Ask about this workspace',
};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 3 });
await p.goto('https://getorem.com/', { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
await p.waitForTimeout(800);
fs.mkdirSync('assets/cap/cards', { recursive: true });
for (const [k, label] of Object.entries(LABELS)) {
  const h = await p.evaluateHandle((label) => {
    const all = [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && (e.textContent || '').trim().toUpperCase().startsWith(label.toUpperCase()));
    let e = all[0]; if (!e) return null;
    while (e && e.parentElement) {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      const bg = cs.backgroundColor, rad = parseFloat(cs.borderTopLeftRadius);
      if (r.width >= 300 && r.height >= 160 && rad > 4 && bg !== 'rgba(0, 0, 0, 0)') return e;
      e = e.parentElement;
    }
    return null;
  }, label);
  const el = h.asElement();
  if (!el) { console.log(k, 'not found'); continue; }
  try { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await el.screenshot({ path: `assets/cap/cards/${k}.png` }); const bb = await el.boundingBox(); console.log(k, Math.round(bb.width), 'x', Math.round(bb.height)); }
  catch (e) { console.log(k, 'failed', e.message.split('\n')[0]); }
}
await b.close();
