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

---

## Round 3: renders/draft_9x16.mp4 (30.0 s, 1080x1920, 30 fps), fresh critic pass on review/r3 + extra stills pulled at every act/caption boundary (f0–15, f36–63, f148–172, f302–320, f372–450, f459–490, f504–532, f556–620, f665–756, f788–899)

Round 2 fixes, checked. Caption word gaps are FIXED: strip_fast2 f356–367 "Urgent questions." has a clear gap, and so do phone 1, 2, 12 and 14 s. The caption class is now one class: at f602 (20.07 s), where the caption crosses the white chart card, it shows the same dark outline. The chat scene is FIXED: dimmed previous bubbles at y ≈ 6–12 %, the box at x ≤ 950 and y ≈ 26–40 %, and chips under it (phone 6–9 s). The checklist is FIXED: the card spans y ≈ 17–62 %, with the "AI Visibility 12 % → 78 %" pill under it from 23.0 s. The right zone is FIXED: the chat box and question bubble end at x ≈ 935–950 (safe 7, 15 s). The "enough." top-edge sliver is FIXED: it now lifts word by word through a mask at y ≈ 250 (f152–156). True peak was measured: −1.3 dBTP (ebur128 peak=true), −14.0 LUFS. NOT fixed: the answer-list pops are still off the grid. Competitor A, B and C, and the gauge card, are all still outside ±45 ms, so hits_within_45ms has dropped to 11/15 from 12/15. The SERP tab row is still left half-cropped under the collapsing card at f162 (5.40 s).

| Criterion | Score | Evidence (timestamps, frame numbers, metric values) |
|---|---|---|
| Hook (first 2 s) | 7 | f0 reads: "Google" (~590 px wide serif, y ≈ 45 %) plus the "Google" caption. The promise completes at 0.9 s ("Google was enough." caption, f27). "(once)" types f36–48. The SERP card grows in at f60 (2.0 s). But f0–f59 is still one serif word at a time on ~75 % empty paper with 4–30 px squares. That is the same picture as Rounds 1–2, so the stop-scroll problem noted last round is still visible and the score stays at 7. Also, the square layout jumps between f0 and f1 (loop_seam B f0→f1: a different set of squares, and a black square at the right edge vanishes). |
| Readability at phone size | 8 | All captions read at 360 px with open word gaps (phone 1–29 s). The CTA `growlatics.us` is ~52 px at 1080 and the wordmark ~110 px. Both are legible in phone 29 s and loop_seam A, and the headline is the largest element on the end card. Checklist rows ≈ 34 px, competitor pills and gauge % read. The right UI zone is clear of key content (safe 7, 15, 23 s). Remaining: the gauge legend "0–33 Low…", chart legend, and "Done" tags are ~6 px at 360. They are decorative, so no cap. |
| Motion quality | 8 | The pills grow ~0.9→1.0 over 3 frames with no pop (full-res f443–447). The chip falls tilted out of slot 3, past the caption and off frame, in f511–514 with no fade. Heavy rises through the mask on "Your. Next. Customer." (f375–417) and on the end-card words (f796–812). The card rise at the Act 3 cut is clean (strip_fast f556–565). The wall scroll is smooth (strip_fast2). The check fills are snappy (f711–717). Weak: the chart card rises THROUGH the caption at f602–605 (20.07–20.17 s), and the SERP collapse at f160–162 leaves the tab row sliced (see Polish). |
| Variety / pacing | 8 | max_gap_between_visual_events 2.57 s (23.83), longest_static 0.90 s (22.87), near_blank_frames none. The end card keeps moving: tblend frame diff 0.07–1.6/255 on every frame from f793 to f899, with no zero run. It builds Be→the→name→AI says (26.43–27.5), then bars (28.33), then wordmark (28.6), then URL (29.1). One soft spot: the gauge holds at 12 % from 18.53 to ~19.4 s while only the caption changes. |
| Brand accuracy | 8 | Palette exact (#F5F3F0, #D2401A as the single accent, #0C0B0A). Newsreader + Inter. Real bars logo + wordmark. One caption class throughout (the outline is visible at f602 over the white card, and on dark it is low-contrast by nature; the soft shadow was user-approved). No HubSpot wording, imagery or colour: refs/f4 "Search/SEO was enough" is the structure only. The Round 2 cap (two caption styles) is lifted. |
| Sound sync | 6 | CAP: hits off by > 80 ms. hits_within_45ms 11/15 (down from 12/15), mean 33.3 ms. Verified on frames. **Competitor B**: the label pops at f463 (15.43 s) and the tiles at f468, against a cue at 15.529 (f466). That is −100 ms and +67 ms: the sound falls between two picture events. **Competitor C**: the label pops at f488 (16.27 s) against a cue at 16.173 (f485), so +93 ms late. The "Your Business" chip lands ~f481–484 (−100 ms), so neither event reads on the pop. **Gauge card pop** 18.668 (f560): the card is already fully up at the cut (f556) and only settles, so the pop has no picture. **Competitor A** reads at f444–445 vs f446 (−67/−33 ms), acceptable as an spHit lead. Checklist ticks are fine on frames: the fill is solid at f712–713 for 23.79 and f732–733 for 24.45, so the +100 metric is the "Be found." caption bias. Act cut f556 vs 18.502 = +33 ms. Loudness −14.0 LUFS, true peak −1.3 dBTP: OK. |
| Composition (every format) | 7 | Chat (5.5–10.2 s) and checklist (22.5–26.4 s) are now filled. The Act 3 gauge + chart stack fills y 14–70 % with depth cards. CAP-adjacent: the answer list cuts in at f437 (14.57 s) as an empty bubble + "1. 2. 3." until f444. Then only the Competitor A row sits until B's tiles land at f468 (15.60 s). So for ~1.0 s, y ≈ 35–72 % holds only two grey numerals. The question wall also starts as a single line on empty paper at f308–313 (10.27–10.43 s). The end card bottom 45 % is glow only (end card, so tolerated). |
| Polish | 7 | No blank frames, no double-exposed captions (the 12.20 s swap is clean, f366→367), no caret leaks. But: (a) f602–605 (20.07–20.17 s): the rising "Who AI recommends" card passes over the caption, so white "where" sits on a white card and does not read for 3 frames. (b) f160–162 (5.33–5.40 s): the SERP tab row "All Maps Reviews Images News" is sliced in half by the collapsing card edge. This is Round 2 item (d), still visible, so the score cannot exceed 7. (c) Square layout jump f0→f1. loop_seam_jump 217.7 is informational (one-shot ad). |

**3 worst problems** (ranked by damage to the film, each with timestamp + cause)
1. **Answer-list pops are off the grid (sync, capped at 6).** Three causes. Competitor B splits into a label pop (f463, −100 ms) and a tile pop (f468, +67 ms). Competitor C's label lands f488, +93 ms after the 16.173 s pop, while the "Your Business" chip lands ~3 frames before it. The 18.668 s gauge pop has no picture event, because the card is already up at the cut. This is the third round that these exact cues have been missed.
2. **The hook is still one serif word on empty paper (hook 7).** f0–f59: ~75 % of the frame is paper with tiny squares, and the caption echoes the hero word. Nothing in the first 2 s shows the product or the tension (the AI answer / "Your Business" missing). The square field also re-scatters between f0 and f1.
3. **Handoff defects around the answer list and Act 3 (composition 7, polish 7).** The empty "1. 2. 3." list at f437–444 is followed by a ~1 s thin build to f468. The chart card rises through the caption at f602–605. The SERP tab row is sliced at f160–162.

**Fixes for round 4** (concrete, testable, one per problem: what changes, where, and how to verify it)
1. **Put one picture event on each pop.**
   - Competitor B: drive the label AND its 3 tiles from one `C.spHit` on the 15.529 s cue, with the tiles staggered ≤ 1 frame after the label. The label should be ≥ 90 % scale at f465–466 and the tiles at f466–467.
   - Competitor C: move the label spHit so it reads at f485 (lead 1–2 frames, not lag 3).
   - "Your Business" chip: put it on its own beat (b23.5 or earlier, with its own soft pop declared in timeline.json `sfx`), or land it on the same frame as C.
   - Gauge pop at 18.668 s: either attach it to a visible event (the needle kick 12→17 % or the "AI Visibility Score" header slam starting f558–560), or delete the cue from `sfx`.
   - Verify: metrics sync ≥ 14/15 within 45 ms, and stills at f463–468 and f483–488 show exactly one new element arriving on the cue frame ±1.
2. **Make the first 2 s stop a scroll.**
   - Push the Act 1 camera ~1.35× so the hero word spans x 120–950 (≥ 230 px cap height), at y ≈ 38–48 %.
   - Cluster the squares into a tighter ring around the word: 2–3× the current density inside a 700 px radius, sizes 12–48 px, and none on the bare edges.
   - Seed the f0 square layout so f0 equals the layout of f1–f7 (no re-scatter until the first half-beat).
   - Verify: contact 0.0–1.5 s shows ≤ 50 % empty paper per tile, and loop_seam B f0→f1 squares are identical.
3. **Clean the three handoffs.**
   - Answer list: start "Here are my top picks:" typing and the Competitor A row at the cut (f437), and give rows 2 and 3 a skeleton (grey pill + 3 grey tiles at 30 % tone) from f437. The list then reads as building from frame one, and y 35–72 % is never bare.
   - Chart card: raise the caption layer z-index above Act 3 cards, or start the card rise from y ≤ 1250 so it never crosses the caption band (y 1360–1440) at f600–606.
   - SERP collapse: clip the tabs row with the card (`overflow:hidden` on the card), or lift the tabs row out through the mask 2 frames before the card collapses past it, so f158–164 shows no sliced text.
   - Verify: stills at f437, f444, f602–605, f160–162.

**Verdict:** ANOTHER ROUND

## Round 4: renders/draft_9x16.mp4 (30.0 s, 1080x1920, 30 fps), fresh critic pass on review/r4 + extra stills (f0–7, f52–63, f154–169, f304–313, f430–489, f472–477 full-res crop, f505–516, f550–615, f666–677, f708–715, f788–807) + end-card tblend frame diff

Round 3 fixes, checked.
- Answer-list sync: mostly FIXED. Competitor B is now one event: first tile f454, label + tiles f455, all three f456, against the 15.198 s cue (f455.9). That is a −33 ms spHit lead; the metric's −67 is the first tile. The gauge pop at 18.668 s is gone from the cues. NOT fixed: the "Your Business" chip is still not on the frame with C (see problem 1).
- Hook fullness: FIXED in part. "Google" now spans x ≈ 110–890 at y ≈ 37–50 %. The squares are clustered in a band at y 23–68 %, and the f0 layout equals f1–f7 (loop_seam B f0–f5 identical). The paper above 22 % and below 75 % is still empty.
- Handoffs: FIXED. The answer list cuts in at f437 (14.57 s) with "Here a…" typing, the Competitor A row and grey skeletons for rows 2–3, so y 35–72 % is never bare. The chart card rises at f602–606 and stops above the caption band ("where" at y ≈ 1400 is never covered). The SERP tabs row now clips with the card, f158–160 show no sliced text, and the bar carries on into the chat box (f161–169).

| Criterion | Score | Evidence (timestamps, frame numbers, metric values) |
|---|---|---|
| Hook (first 2 s) | 8 | f0 reads at once: "Google" is ~780 px wide serif plus the "Google" caption, with no blank frames. "Google was enough." completes by 0.9 s (f27) and "(once)" by 1.3 s. The SERP card enters at f58 (1.93 s). The squares are denser and stable f0→f7. Still text-only for 1.9 s, with ~45 % empty paper (y 0–22 %, 75–100 %), so it reaches 8 but not 9. |
| Readability at phone size | 8 | Every caption reads in phone_9x16 1–29 s, with word gaps open. `growlatics.us` (~52 px at 1080) and the wordmark (~110 px) are legible at 29 s and in loop_seam A. Checklist rows, competitor pills and the gauge % read. The only unreadable text is decorative: the gauge legend, chart legend and "Done" tags, ~6 px at 360. Safe zones are clear apart from the Act 3 card edges at x ≈ 980 (decorative). |
| Motion quality | 7 | CAP: a visible jump. At f473 (15.77 s) the "Your Business" chip grows in at ~90 % INSIDE the row-3 skeleton (y ≈ 1080). At f475 it teleports ~300 px down under "Thinking…" while the skeleton tiles vanish in one frame. Good elsewhere: Competitor B's tiles stagger 1 frame (f454–456), the chip drop arcs and tilts out of frame (f511–516) with no fade, the heavy rises on "Your. Next. Customer." and the end-card words land through the mask (f793–807), and the chart card rises cleanly (f602–606). Weak: the gauge card at the Act 3 cut only settles ~10 px f556–559, then holds at 12 % to f588. |
| Variety / pacing | 8 | max_gap_between_visual_events 2.57 s (23.83), longest_static 0.87 s (17.6), near_blank_frames none. The end card moves on every frame: tblend diff 0.07–1.59/255 from f793 to f899, with no zero run, building Be→the→name→AI says, then bars (28.33), wordmark, URL (29.1). Soft spots: the gauge holds at 12 % for 18.53–19.60 s, and the completed checklist holds for 25.5–26.43 s with only the caption changing. |
| Brand accuracy | 8 | Palette exact: #F5F3F0 paper, #D2401A as the single accent, #0C0B0A dark. Newsreader display + Inter UI. The real bars logo and wordmark. One caption class throughout. No HubSpot wording, logo or colour. Nothing changed from Round 3. |
| Sound sync | 6 | The Round 3 problem is still visible, so the score cannot rise. The 15.859 s cue (f475.8) "Your Business + Competitor C" still splits: the chip reads at f473 (−93 ms, no sound) and the relayout + C land at f475 (−27 ms). Everything else is now clean. hits_within_45ms 13/14, mean 23.6 ms. The only miss, Competitor B −67, is −33 on frames (label f455). Act cut f556 vs 18.502 = +33 ms on frames (the +100 is the whoosh, by design). The checklist fill at 23.79 starts f711 and is solid f713, so the +100 is the "Be found." caption bias. The end-card thump is 0 ms, logo bars +33. Loudness −14.0 LUFS, true peak −1.4 dBTP: OK. |
| Composition (every format) | 7 | Round 3's empty answer list is fixed (skeleton rows from f437). But the question wall, noted last round, is unchanged: f308 (10.27 s) is one line at y ≈ 13 % on empty paper. It is 3 lines at f313, and at contact 10.5 s only y 20–35 % is filled, so ~65 % of the frame is empty for ~0.5 s. Also a bare search bar on empty paper f162–165 (5.40–5.50 s, short). Act 3 fills y 14–70 % with depth cards. The end card's lower 45 % is glow only (tolerated on an end card). |
| Polish | 8 | No blank frames, no caret leaks, no double-exposed captions. All three Round 3 polish defects are fixed: the chart card no longer crosses the caption (f602–605), the SERP tabs are not sliced (f158–162), and the squares no longer re-scatter between f0 and f1. Minor: the chip overlaps the grey skeleton for 2 frames (f473–474) before the relayout, which is counted under motion. loop_seam_jump 216.4 is informational (one-shot ad). |

**3 worst problems** (ranked by damage to the film, each with timestamp + cause)
1. **Row 3 of the AI answer resolves with a split and a teleport (f473–475, 15.77–15.83 s).**
   - The "Your Business" chip grows in at f473, 3 frames before its pop (15.859 s), on top of the row-3 skeleton.
   - On f475 it jumps ~300 px to below "Thinking…" while the skeleton tiles vanish in one frame.
   - This is the last unsynced cue (sync 6), and it is a visible jump in motion (cap 7).
2. **The question wall opens on empty paper (f308–~320, 10.27–10.65 s).**
   - The wall builds line by line from the top, so for ~0.5 s it is 1–5 lines at y 13–35 % with ~65 % empty paper.
   - This was noted in Round 3 and is unchanged (composition 7).
3. **Act 3 opens on a frozen gauge (f556–f588, 18.53–19.60 s).**
   - The card arrives fully composed at the hard cut. It only settles ~10 px, and the needle holds at 12 % for 1.07 s while the VO starts "Growlatics shows you…".
   - The biggest act change in the film lands on its most static second.

**Fixes for round 5** (concrete, testable, one per problem: what changes, where, and how to verify it)
1. **Make row 3 one event, in one place.**
   - Delete the chip's early in-skeleton entrance.
   - From f473, collapse the skeleton row (scaleY 1→0 on a snappy spring, ~3 frames) into the "Thinking…" line. It must not vanish in one frame.
   - Drive the chip AND Competitor C from one `C.spHit` on 15.859 s, each growing 0.85→1 in its FINAL slot. The chip should be ≥ 90 % at f475, and C stagger ≤ 1 frame (f476).
   - Verify: stills f470–478 show the chip in exactly one position and first visible at f474–475; metrics sync shows this cue within ±45 ms on frames.
2. **Pre-fill the question wall at the cut.**
   - At the 10.242 s shutter, start the wall pre-scrolled so ≥ 8 lines already fill y ≈ 15–70 % on f308.
   - Keep the scroll and the beat dot pops, with new lines entering from the bottom mask.
   - Verify: contact 10.0–10.5 s and stills f308, f312 and f318 each show ≤ 1/3 empty paper.
3. **Give the Act 3 opener motion from frame one.**
   - On the cut (f556), let the header and legend rise in (snappy, ~4 frames).
   - Kick the needle 12→17 % with an spHit on b28.5 (18.83 s, the VO entry), then start the 17→78 % sweep at b29 (19.16 s).
   - Verify: card-region tblend diff > 0.3/255 on every frame f556–f600, and the gauge reads ≥ 17 % by f566.

**Verdict:** ANOTHER ROUND
