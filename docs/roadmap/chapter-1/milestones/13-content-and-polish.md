---
last_reviewed: 2026-03-24
design_confidence: medium
implementation_confidence: medium
---

# Milestone 13: Content & Polish

## Goal
Fill in all the content and polish the experience. Write all NPC dialogue, tune the economy numbers, refine the paradigm shift moments, handle edge cases, and replace placeholder visuals/audio where possible.

## Depends On
- Milestone 12 (Chapter 1 Integration)

## Deliverables

### 1. Full NPC Dialogue
- **Farmer:** All daily variations, pre/post combat, morning greetings, hints about the bar
- **Bartender:** Friendly, persuasive, makes drinking feel like self-care
- **Weaponsmith:** Sales-y, exaggerates gear benefits, marketing copy
- **Armorer:** Similar to weaponsmith
- **Guild Master:** Authoritative but limited, teaches slime-specific techniques with conviction
- **Banker:** Professional, buries fees in fine print
- **Librarian:** (if included) Quiet, doesn't push, has useful books if you look

### 2. Economy Tuning
- Final prices for all items
- Verify the treadmill: a "good player" following NPC advice breaks even
- Verify the escape: a clever player who skips drink + skips guild saves enough to notice
- Bank overdraft trap functional if included

### 3. Paradigm Shift Polish
- Reflection dialogues feel meaningful, not clinical
- Flip moment is visually/sonically distinct (even with placeholder assets)
- Morning-after text lands
- Stage 1 transition (Energy → 3 bars) is clear and noticeable
- First wolf encounter outside town is appropriately brutal

### 4. Edge Cases
- What if player can't afford rent? (kicked out? debt?)
- What if player never drinks? (faster progression, but misses some NPC dialogue)
- What if player tries to leave before any flip? (road blocked, gentle redirect)
- What if player flips all three stats in town? (allow it, but departure still requires walking south)
- What if player dies to a slime? (shouldn't be possible easily, but handle gracefully)

### 5. Placeholder Asset Replacement
- Replace colored rectangles with actual pixel art (AI-generated)
- Replace click track with actual music track (AI-generated, 88 BPM, 4/4)
- Basic SFX: attack hit, block, dodge, menu confirm, flip bell
- This may be its own separate milestone if asset generation takes significant work

### 6. Intro Sequence
- Title screen with game name
- "New Game" → brief text scroll setting the scene
- First-person arrival narration
- Walk to farm, meet farmer
- Should feel deliberately generic and familiar

## Acceptance Criteria

1. Play through Chapter 1 start to finish — all dialogue is written, no placeholder text
2. Economy feels like a treadmill: following NPC advice doesn't advance you
3. Reflection arcs feel emotionally resonant, not mechanical
4. Flip moment is a clear "oh shit" experience even in text
5. No crashes or softlocks on any path (drink/no-drink, buy/don't buy, fight/avoid)
6. A player's first playthrough should take 30-60 minutes
7. All bridges still work correctly with final content

## Notes
- This milestone might be too large for a single overnight run. Consider splitting:
  - 13a: Dialogue and economy tuning
  - 13b: Paradigm shift polish and edge cases
  - 13c: Asset replacement and intro sequence
- Content quality matters here more than technical correctness. The paradigm shifts need to land emotionally.
- The wolf encounter outside town is the first sign that the old rules don't apply. It should be shocking but not unfair.
