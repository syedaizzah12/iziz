# Style guide: Growlatics "Be the name AI says"

Sources: `assets/site/info.json` (growlatics.us CSS vars), `assets/brand/logo_0.svg` (bars mark), supplied logo jpg, reference `refs/ref.mp4` (frames in `refs/f4/` at 4 fps for 0–6 s and `refs/frames/` at 2 fps).

## 1. Palette (measured)
| Token | Hex | Source |
|---|---|---|
| `--paper` | #F5F3F0 | site `--c-bg` (replaces the reference's cream #F7F3EE) |
| `--ink` | #0C0B0A | site `--c-text` |
| `--ink-2` | #6F6A64 | site `--c-text-3` |
| `--accent` | #D2401A | site `--c-signal` (replaces the reference's orange) |
| `--accent-deep` | #A83216 | site `--c-signal-deep` (tonal ramp only) |
| `--dark` | #0C0B0A to #070605 | site dark canvas (replaces the reference's maroon in Act 3), lit by a low accent-deep glow |
| `--card` | #FDFCFA | site `--c-surface` |
The reference's lilac and olive squares become a tonal ramp: accent, ink, warm grey #C0B8B0, paper-white. No second hue.

## 2. Type
- Display: Newsreader (variable, opsz on), weight 300–400, tracking −0.01 em, sentence case, accent full stop. Hero 150–200 px, run lines 84 px, stack words 240 px.
- UI and captions: Inter (the site's face). Captions 800, 46 px. UI labels 500–600, 30–40 px.

## 3. Rhythm (reference, measured)
Reference: 30.1 s, 720x1280 at 23.976 fps. Music about 81 BPM (librosa doubles it to 161). Cuts: 18.56 (to dark), 19.35, 23.57, 28.86 (end card).
| Ref time | What happens |
|---|---|
| 0.0–3.5 | "Search / was / enough." one word at a time, about 0.5 s each, centred, accent full stop. Pixel squares change every 0.25–0.5 s |
| 3.5–4.6 | "(once)" plus an accent caret |
| 4.6–6.5 | fast run "SEO / Ranking / Advertising / Email / Social / Content was enough.", about 0.3 s each, smaller (about 40 % of hero) |
| 6.5–8.5 | white input bar types "Buyers ask AI" with an accent caret, horizontal pan following the text |
| 8.5–12 | "for every…", then a centred wall of questions with inline photos and accent dots, scrolling up |
| 12–13 | question bubbles float at depth |
| 13–15 | "Million. / Dollar. / Questions." stacked, blurred wall behind |
| 15–18.5 | AI answer: user bubble, "top picks", numbered competitor pills with image tiles, "Thinking…", the "Your Business" chip falls out |
| 18.5–28.9 | dark gradient, UI cards: gauge, lines, share of voice, Recommended Actions, a "✓ Create Blog" tick |
| 28.9–30.1 | end card: serif line, logo, URL |
Extracted rules: a new element every 0.3–1 s in Act 1 and every beat or two after. Act changes are hard cuts.

## 4. Transitions
Hard cuts on bar lines. Type-on with a caret. Hard line swaps. Card rise. Pills pop. Chip slides away. A whoosh on the Act 3 cut. No crossfades, spins or light leaks.

## 5. Camera
Constant micro push (1.00→1.04) on every hold. Slow vertical scroll on the question wall. Act 3 cards drift 10–20 px.

## 6. Texture
Clean and digital. Soft contact shadows on cards. No glow on UI; the accent glow lives only in the dark background.

## 7. Text in and out
Serif words type on (Act 1) or rise through a mask (stack, end card). Exits are hard swaps or covers. Captions: chunk swaps are hard cuts, and words appear word by word.

## 8. Sound
Synth score at 90.8 BPM. Key ticks on typing, a whoosh into Act 3, ticks on the checklist, a thump on the end card. Fish Audio VO, ducked −12 dB.
