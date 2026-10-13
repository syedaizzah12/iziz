# Style guide: Orem introductory reel

Source material: `assets/site/info.json` (:root tokens, headings, font families), `assets/site/hero.png`,
`assets/cap/prompts-mention-rate.png`, `assets/cap/cards/*.png` (3x element captures). No reference film.

## 1. Palette (measured from the site's :root tokens)
| Token | Hex | Source |
|---|---|---|
| `--bg` | `#f3f5f4` | `--paper`, the site canvas |
| `--card` | `#ffffff` | `--card` |
| `--ink` | `#141b21` | `--ink`, H1 and dark bars |
| `--ink-2` | `#46525b` | `--ink2`, body copy |
| `--fog` | `#7d8790` | `--fog`, axis labels and ranges |
| `--line` | `#e1e7e4` | `--line`, tracks and dividers |
| `--accent` | `#0e5e63` | `--petrol`, Orem's brand colour: the step circles, progress bar and verdict banner in Orem's own demo recording (supplied by the user; measures #146460 after video compression). The ONE accent. |
| `--accent-soft` | `#e3eeec` | `--petrol-soft`, highlight rows (getorem.com in sources) and the "+6 pts" tag |
| `--accent-2` | `#34ad97` | the light end of the demo's progress-bar gradient (#186663 → #36af99); only as the second step of the petrol ramp |
| `--gain` / `--gain-soft` | `#12805c` / `#e2f1ea` | real UI only: the "Real gain" verdict pill |
Corrected after the user's note ("pick the color right"): the earlier teal #028090 and cyan #20b8cd are gone.
Interval bands use the demo's petrol → sea-green gradient; the weekly chart alternates petrol and #34ad97.
Accent colour on type goes on the key word only. The site's weekly chart uses black, cyan, blue and orange bars;
here that becomes the petrol ramp (petrol and #34ad97, alternating).

## 2. Type
- Display face: **Newsreader** 500 (`assets/fonts/newsreader.woff2`, variable), tracking −0.025em, as the site's H1
  (54 px / 500 / −1.35 px). Sentence case. Full stop on statements, question mark on questions, as the site writes.
- UI face: **Inter** variable (`assets/fonts/inter.woff2`), 400–700, tabular numbers for percentages.
- Sizes at 1080p: hero lines 120–150 px, captions ≥ 64 px, card text scaled with the card (camera, not font).
  Nothing that must be read below 28 px; checked at 360 px wide.

## 3. Rhythm
120 BPM, 4/4, 15 bars. Hard cuts on bar lines (b8, b32, b40). Inner events on beats or half-beats.
Something new every 2–4 s; nothing holds longer than one bar without a new element.

## 4. Transitions (allowed vocabulary)
Hard cut on the bar · push-through into a track · card rise from below with perspective settling ·
collapse-reveal (the band contracts into the card's interval) · words lift out through their mask.
Never: crossfades, spins, glitches, light leaks.

## 5. Camera
Constant micro push on every hold (1.00 → 1.04). Punch-in on the 0–100% track. Cards settle from ~14° X-tilt
toward 2–3° (verified with render --verify; 2D skew fallback if it fails).

## 6. Texture & finish
Clean digital, the site's look: paper background, white cards with soft deep shadows, 1 px `--line` borders.
No grain, no glow.

## 7. Text in / out
Enter: rise through a mask (heavy, no overshoot) or type on (buyer prompts). Exit: lift through the mask, or
covered by the next card. Never a fade. Numbers count only where the real UI value changes (32% → 38%).

## 8. Sound
Synth score, Dm–Bb–F–C, 120 BPM: intro → full when Orem starts sampling (b16) → dark under the dense verdict
table (b32) → full for the montage (b40) → build, gap at b51.5, drop on the logo (b52).
SFX: pops for words and rows, ticks for typing and samples, clicks for verdicts, shutter on hard cuts,
whoosh on card rises, thump on the interval lock, "Real gain" and the logo. No voiceover.
