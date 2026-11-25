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

---

## Round 2: renders/draft_9x16.mp4 (30.0 s, 1080x1920, 30 fps), fresh critic pass on review/r2 + sheets/sheet_9x16 + extra stills (0, 3.0, 5.2–5.5, 14.3–14.9, 16.7–17.3, 19.5, 23.0, 24.5, 26.43–29.9 s)

Round 1 fixes, checked: the act-hit blank frames are FIXED. At f556 (18.53 s), the gauge card is already on screen at the hard cut, and at 26.43 s "Be" is on the hit frame. The caption double exposure at 12.20 s is FIXED (strip_fast2 f366: "Urgent questions." → "Questions" with no overlap). The chip exit is FIXED: at 17.1 s "Your Business" falls tilted in front of Competitor C, below the caption, and it is gone by 17.3 s with no in-place fade. The CTA is FIXED: `growlatics.us` is about 52 px at 1080 and reads in phone_9x16 at 29 s. The end card keeps moving: the frame diff at 26.4–30 s is 0.07–1.4/255 with no zero run. Act 3 has depth now (blurred secondary cards behind). NOT fixed: the Act 3 and end-card captions are still plain white Inter with no dark outline. The "Reviews flowing" tick is still +100 ms. The chat and checklist shots still leave a third of the frame empty. The loop seam is 218.4. The "enough." top-edge sliver is still there at 5.4–5.5 s.

| Criterion | Score | Evidence (timestamps, frame numbers, metric values) |
|---|---|---|
| Hook (first 2 s) | 7 | f0 reads: a ~170 px serif "Google" plus the "Google" caption (loop_seam B f0). "Google was enough." completes about 1.0 s, so the promise lands in time. But the hero word sits on ~75 % empty paper with scattered 4–30 px squares, and the caption only echoes the hero word. Nothing in f0–f30 shows why to keep watching (no UI, no tension). Unchanged from Round 1. |
| Readability at phone size | 7 | CAP (key text in UI zones): the AI chat box at 6–10 s runs to x ≈ 1050 and the "Who's the best plumber near me?" bubble at 15–18 s to x ≈ 1060, both inside the right 12 % zone (safe_9x16 at 7, 8, 15, 16 s). Act 1–2 captions: the heavy dark outline fills the word gaps, so lines read as one token ("Awebsitewasenough.", "builttoanswer.", "Butifyour" at 5.2, 14.3, 14.9 s; contact 12.5–13.0 "Questionsyourbusinesswas"). Good: CTA ~52 px, wordmark ~110 px, checklist rows ≈ 34 px and legible at 360 (phone 23–25 s), gauge % huge. Gauge legend "0–33 Low…", chart legend and "Done" tags are still ~6 px at 360. |
| Motion quality | 8 | The chip now falls out with tilt in front of the list (17.1 s), so the Round 1 cap is lifted. Clean act cuts (strip_fast f555→f556, 26.43 s). The trade-word mask roll (8.2–10 s), the gauge sweep 12→31→69→78 (18.6–21 s), the line draw with the "Your Business" flag (21.5–22 s), the heavy "Your. Next. Customer." rise, and the strip_fast2 wall scroll (smooth 3 px/frame, the dots grow in) are good. Weak spots: the "A website was enough." exit at 5.40–5.43 s lifts word by word off the top frame edge, clipping glyphs. The Act 1 squares jump position between f0 and f1 (loop_seam B f0→f1). |
| Variety / pacing | 8 | max_gap_between_visual_events 3.93 s (22.47→26.40), longest_static 0.87 s at 17.6 s, no near-blank frames. A new beat lands every 0.66–2 s through 0–22 s. Act 3 has layered cards and a 2-card stack. The checklist 22.5–26.4 s holds one shot size for 3.9 s, but four ticks land in it at 0.66 s spacing. The end card builds "Be"→headline→bars→wordmark→URL across 26.4–29.2 s and never freezes. |
| Brand accuracy | 7 | Palette exact (#F5F3F0 / #D2401A / #0C0B0A), Newsreader + Inter, real bars logo. No reference content copied. Still off-spec from Round 1, so it cannot score higher than 7: from 18.5 s to the end, captions switch to plain white Inter semibold with NO dark outline ("Growlatics shows" 19.5 s, "Be found." 24.5 s, "AI says." 27.5 s). The approved style is white bold with a dark outline. Two caption styles in one film. |
| Sound sync | 7 | hits_within_45ms 12/15 (up from 11/15), mean 26.6 ms. Out of window: Competitor A pop −67 ms (15.20 s), Competitor B +67 ms (15.86 s), gauge card −67 ms (18.67 s). The checklist ticks are scored as texture, but they are picture hits. "Reviews flowing" is still +100 ms (23.79 s; the Round 1 fix did not land), and "Website AI-ready" is −67 ms (24.45 s). Loudness −14.0 LUFS OK. Only the sample peak −1.3 dBFS is reported, so true peak (≤ −1 dBTP) is still unverified. |
| Composition (every format) | 6 | CAP (9:16 ⅓ empty > 1 s). 5.5–10.2 s (4.7 s): the chat box sits at y ≈ 33–45 % with chips under it, and y 0–32 % holds only the tiny "Ask AI anything" label. 22.5–26.4 s: the checklist card spans y ≈ 21–62 % (still 24.5 s), and the bottom 38 % is dark gradient plus a caption. 14.3–15.2 s: an empty "1. 2. 3." answer list, ~75 % of the frame empty. Improved: the SERP now spans y ≈ 15–52 % with readable rows (3.0 s). The Act 3 gauge + chart stack fills y 14–70 % with depth cards. |
| Polish | 7 | No blank frames. The 12.20 s caption swap is clean. But: (a) the caption outline eats word spaces through all of 0–18.5 s (see Readability). (b) The "enough." glyph sliver clipped at the top edge at 5.40–5.5 s (phone 5 s), a Round 1 item, is still visible. (c) loop_seam_jump 218.4: the dark end card hard-cuts to paper "Google", unchanged. (d) At 5.35 s the SERP tab row ("All Maps Reviews…") is left hanging under the collapsed bar, half-cropped, for ~3 frames. |

**3 worst problems** (ranked by damage to the film, each with timestamp + cause)
1. **Empty 9:16 frames remain in two long shots (composition).** Chat 5.5–10.2 s: a single ~150 px-tall box at y 33–45 %, with the top third empty for 4.7 s. Checklist 22.5–26.4 s: the card spans only y 21–62 %, with the bottom 38 % empty for 3.9 s. The empty answer list 14.3–15.2 s. Cause: the camera is not scaled to fill the 9:16 frame, and the chat scene has no secondary content above the box.
2. **Caption system is broken in two ways (readability, polish, brand).** At 0–18.5 s, the dark outline (stroke on the glyph, drawn over the fill) closes the word gaps, so captions read as one run-on word at phone size ("Awebsitewasenough."). At 18.5–30 s, captions drop the outline and weight completely. Cause: the stroke is centred on the glyph with no extra word spacing, and Act 3 and the end card use a different caption class.
3. **Hits off the grid, and key UI in the right zone (sync, readability).** Competitor A/B pops ±67 ms, gauge card −67 ms, "Reviews flowing" +100 ms (carried from Round 1), "Website AI-ready" −67 ms. The chat box (6–10 s) and question bubble (15–18 s) reach x ≈ 1050–1060, inside the right 12 % zone.

**Fixes for round 3** (concrete, testable, one per problem: what changes, where, and how to verify it)
1. **Fill the frame in the chat scene and the checklist.**
   - Chat 5.5–10.2 s: push the camera so the box is ≥ 900 px wide, at x 120–950 and y ≈ 560–760, with question type ≥ 64 px. Above it, at y 300–520, stack two dimmed previous questions ("Who's the best plumber near me?" style bubbles at 40 % opacity, drifting up 10 px/s). Keep the chips at y 800–1000.
   - Checklist 22.5–26.4 s: scale the card to span y ≈ 330–1300 with ≥ 110 px rows. Under it, keep the dimmed 78 % gauge or a "AI Visibility 12% → 78%" pill (already built at 25.5 s) visible from 22.5 s at y ≈ 1350.
   - Answer list 14.3–15.2 s: start the Competitor A image row with the "1." marker, or hold the zoomed question wall until 14.9 s, so the empty list is on screen for ≤ 6 frames.
   - Verify: in phone_9x16 at 6, 7, 8, 9, 23, 24, 25 s, no band of ≥ 33 % frame height outside the top 14 % / bottom 20 % zones is empty.
2. **One caption style with open word gaps.**
   - Draw the outline OUTSIDE the glyph: `paint-order: stroke fill` with stroke 2× the current width, or an 8-direction text-shadow. Add `word-spacing: 0.28em`.
   - Apply the same class (white Inter 800, dark #0C0B0A outline, same size) to the Act 3 and end-card captions, 18.5–30 s.
   - Verify: at 360 px wide (phone_9x16 at 5, 12, 14, 19, 24, 27 s), every inter-word gap is ≥ 3 px of clear background and the Act 3 captions show the outline.
3. **Re-time the off hits and pull the UI out of the right zone.**
   - Re-time with `C.spHit` lead so the picture reads on the audio grid: Competitor A (15.20 s, picture 2 frames late → lead +2f), Competitor B (15.86 s, lead −2f), gauge card (18.67 s, picture early → lag 2f), "Reviews flowing" check (23.79 s, lead 3f), "Website AI-ready" (24.45 s, lag 2f).
   - Clamp the right edge of the chat box and question bubble to x ≤ 950.
   - Kill the 5.40–5.5 s "enough." top-edge sliver: lift the whole headline line as one unit through a mask at y ≥ 200, not off the frame edge.
   - Report true peak (ffmpeg ebur128 peak=true) in metrics.
   - Verify: metrics sync ≥ 14/15 within 45 ms with "Reviews flowing" ≤ 45 ms, safe_9x16 at 7 and 16 s shows no UI in the right band, true peak ≤ −1 dBTP.

**Verdict:** ANOTHER ROUND
