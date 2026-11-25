# Review log

Every check is made from the rendered MP4s (`python3 scripts/review.py <round>`) plus the per-beat contact sheets
(`node scripts/render.mjs --sheet`). Nothing is judged from the page. Critic prompt: the skill's `reference/CRITIQUE.md`.

Scores 1–10. Ship only when EVERY score is ≥ 8, after at least 3 rounds.

---

## Round 1: renders/draft_9x16.mp4 (30.0 s, 1080x1920, 30 fps), critic pass on review/r1 + sheets/sheet_9x16

| Criterion | Score | Evidence (timestamps, frame numbers, metric values) |
|---|---|---|
| Hook (first 2 s) | 7 | f0 already shows "Google" (≈170 px serif) plus the "Google" caption, so frame 0 reads. "Google was enough." completes at ~1.0 s. But the hero word sits on ~75 % empty paper with only scattered 10–30 px squares around it, and the caption repeats the hero word, so there is no visual promise to stop a scroll. |
| Readability at phone size | 6 | CAP: the CTA URL `growlatics.us` is ~30 px at 1080, which is ~10 px grey on dark in phone_9x16 29 s. That is the smallest text in the film, when it should be the most legible. SERP microtext 2–5 s ("#1 result", results count, star rating, listing subtitles) and Act 3 card text 19–26 s (legend "0–33 Low…", chart axes, "Done" tags, "4 actions") are illegible at 360 px. Question-wall lines at 11–12 s and the right edge of the AI-answer tiles and Act 3 cards (safe_9x16 at 16–22 s) run into the right 12 % UI zone. The captions (46 px) and the Act 1 and end-card serif read fine. |
| Motion quality | 6 | CAP: the "Your Business" chip exit at 16.93–17.30 s (f508–519) is an opacity fade in place. It drops ~20 px, slides UNDER the Competitor C pill and dissolves, so it never "falls out" (the shotlist promised y +260). Act cuts land on empty frames (see Polish). Good: the typing and caret, the trade-word mask roll (8.2–10 s), the gauge sweep 12→78 % (18.6–21 s), the line-chart draw, the card rise in strip_fast (f558–566 settles with no pop), and the heavy rise on "Your. Next. Customer." |
| Variety / pacing | 7 | max_gap_between_visual_events 3.93 s (22.47 → 26.40, checklist), inside the 4 s rule. longest_static 1.47 s at 5.63. But Act 3 (18.5–26.4 s, 8 s) is one or two flat cards at the same shot size with no camera move, where the reference stacks many layered cards with parallax and push-ins. The end card is near-frozen 29.1–30.0 s (frame diff ≤ 0.1/255, the push is not visible) and 27.7–28.5 s (≈0.15). The build does not accelerate into the logo. |
| Brand accuracy | 7 | Palette exact (#F5F3F0, #D2401A one accent, #0C0B0A); Newsreader + Inter; real bars logo + wordmark; no HubSpot content copied. Off-spec: Act 3 + end-card captions (18.6–30 s) drop the dark outline and change to a smaller weight, which breaks the approved caption style. The Act 3 cards read as flat, generic white boxes with no depth, unlike the site's surface style. |
| Sound sync | 6 | CAP: hits_within_45ms 11/15, mean 31.1 ms. The "Reviews flowing" tick (23.79 s) is +133 ms picture-late, and the Act 3 whoosh (18.50) is +100 ms because the picture is black on the hit frame. Competitor A/B pops are ±67 ms and "Next." is +67 ms. Loudness −14.1 LUFS OK. Peak −1.4 dBFS is sample peak only, so measure true peak. |
| Composition (every format) | 5 | CAP (9:16 with ⅓+ empty for >1 s), several times. 2.0–5.4 s: the SERP card fills y 15–45 %, and the bottom 55 % is empty paper with stray squares. 5.5–10.2 s: a single 90 px-tall chat box with about 70 % of the frame empty for 4.7 s. 14.5–15.2 s: an empty "1. 2. 3." list. 18.5–22.4 s: the cards sit in the top 55 %, and the bottom 40 % is only glow. 22.5–26.4 s: the checklist card fills y 22–45 %, and the bottom half is empty for 4 s. The depth is flat: stickers on a flat ground, against the reference's layered dashboards. |
| Polish | 6 | Double-exposed captions at chunk swaps: f366 (12.20 s) reads "Questionsnt questions." and f510 (17.00 s) reads "issomeone answers". Near-black frames on both act hits: f556–557 (18.53–18.57 s) and f793–794 (26.43–26.47 s) show only the dark gradient (near_blank_frames misses them because of the glow). A glyph sliver of the outgoing "…enough." peeks at the top edge at 5.5 s (phone 5 s, sheet b8). loop_seam_jump is 219.3: the dark end card hard-cuts to paper "Google". Spoken word and caption are otherwise in step. |

**3 worst problems** (ranked by damage to the film, each with timestamp + cause)
1. **Empty 9:16 frames for most of Acts 1–3 (composition).** 2.0–5.4 s: the SERP fills less than half the height. 5.5–10.2 s: a single small chat box. 18.5–26.4 s: one or two small flat cards in the top half. The UI is laid out at desktop scale inside a phone frame, so it reads as a small sticker on an empty field, and it also makes the UI text illegible.
2. **The CTA and the UI microtext are illegible at phone size (readability).** `growlatics.us` is ~10 px at 360 px wide, and the SERP and dashboard labels are 5–8 px at 360. The key UI also runs into the right 12 % zone.
3. **Handoff defects (polish, motion, sync).** Two empty dark frames on each act hit (18.53 and 26.43 s) make the picture land 67–100 ms after the whoosh and thump. Captions double-expose at chunk swaps (12.20 and 17.00 s). The "Your Business" chip fades out in place behind Competitor C instead of falling.

**Fixes for round 2** (concrete, testable, one per problem: what changes, where, and how to verify it)
1. **Re-block 9:16 with the camera, not the font.**
   - SERP (2.0–5.4 s): scale it to a card ~960 px wide spanning y ≈ 330–1300. Show 4 result rows plus the map, with the "#1 result" row as the hero.
   - Chat (5.5–10.2 s): centre the box at y ≈ 800, ~960 px wide, with 64–72 px serif type. Add 3 suggestion chips or a faint previous-question stack under it so nothing is empty above the caption.
   - Act 3: show the gauge and chart cards together from y ≈ 280 to 1320. Add 2–3 secondary cards at depth (scale 0.8, 30 % darker, blur 4–6 px, drift 10–20 px), and add a slow heavy push-in plus one lateral camera move per card beat.
   - Checklist (22.5–26.4 s): make it ~960 px wide with 90 px rows over the dimmed 78 % gauge.
   - Verify: no tile in phone_9x16 has ⅓ of the frame empty for more than 1 s, except the end card.
2. **Size for 360 px.**
   - End card: `growlatics.us` in Inter 600, ≥ 52 px, colour paper, not grey. Wordmark ≥ 96 px.
   - UI: any label that must read (pill names, "#1 result", gauge label, chart legend, checklist rows) is ≥ 32 px after camera scale. Keep the rest decorative.
   - Pull all key content inside x ≤ 950 (right 12 % zone): question wall, competitor tiles, Act 3 cards.
   - Verify in phone_9x16 and safe_9x16 at 2–5, 15–17, 19–26 and 29 s.
3. **Clean every handoff.**
   - Act cuts: the Act 3 gauge card and the end-card "Be the" must be ≥ 60 % risen on the hit frame (f555 and f793) via spHit lead/pre-roll, so there are zero near-black frames from f554–560 or f791–797.
   - Captions: make chunk swaps strictly sequential, so the outgoing chunk is 0 % visible on the frame the incoming one paints. Check every chunk boundary, especially 12.20 s and 17.00 s.
   - Chip: drop it in front of Competitor C with the default spring, y +260 and ≤ 6° tilt, and exit it under a mask or past the frame edge with no opacity fade.
   - Act 1: kill the "enough." top-edge sliver at 5.5 s.
   - Sync: re-time the "Reviews flowing" check so it reads on 23.79 s (≤ 45 ms).
   - Also: make the end-card push visible (1.00→1.05 over 3.6 s, plus a slow drift of the logo bars or glow) so frame diff is > 0.3/255 every frame from 27.5 to 30 s. Restore the caption dark outline in Act 3.
   - Verify: strip frames at 18.47–18.83 and 26.40–26.80, metrics sync ≥ 14/15 within 45 ms.

**Verdict:** ANOTHER ROUND
