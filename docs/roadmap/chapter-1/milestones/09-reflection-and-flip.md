---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: medium
---

# Milestone 09: Reflection & Stat Flip

## Goal
Build the three-night reflection arcs that lead to stat flips. This is the core paradigm shift mechanic: the player chooses to "stay calm" three times, and on the third night realizes they've been calling stagnation "calm." The UI relabels. The Energy bar splits into three. Everything changes.

## Depends On
- Milestone 08 (Day Cycle & Sleep — reflection triggers on sober sleep)

## Deliverables

### 1. Reflection System
- On sober sleep, player gets choice: "Try to stay calm" / "Try to stay confident" / "Try to stay passionate"
- Each choice levels up the OPPOSITE real stat:
  - "Stay calm" → +1 Drive (you're confronting the illusion)
  - "Stay confident" → +1 Insight
  - "Stay passionate" → +1 Stability
- Track reflection count per stat: `reflection_progress: {calm: 0, confidence: 0, passion: 0}`

### 2. Three-Night Dialogue Arcs
Per stat, three distinct dialogue beats (from `docs/mechanics/attributes.md`):

**Calm → Drive (nights 1, 2, 3):**
1. "You remind yourself to stay calm. It helps, for a while."
2. "You take deep breaths. The quiet stretches on, and you wonder how long you've been here."
3. "You tell yourself this is fine. But maybe fine isn't what you want. Maybe you've been calling it calm so you don't have to call it stuck." **[FLIP]**

**Confidence → Insight (nights 1, 2, 3):**
1. "You tell yourself you know what you're doing. Even if you don't."
2. "You remember your bold choices today. And the mistakes you didn't admit."
3. "You've been calling it confidence. But maybe real confidence starts with humility." **[FLIP]**

**Passion → Stability (nights 1, 2, 3):**
1. "You throw yourself into the memory of the fight, heat still in your veins."
2. "Your pulse pounds in your ears. The fire feels good... until it doesn't."
3. "You've been calling it passion. But it burns too hot, too fast. Maybe it's time to stand your ground." **[FLIP]**

### 3. Flip Mechanic
On the third reflection of any stat:
- `flipped.{stat}` set to true
- UI relabels that stat (Calm → Drive, Confidence → Insight, Passion → Stability)
- Real stat value becomes the displayed value
- If this is the FIRST flip of any stat → trigger Stage 1: Energy bar splits into three visible bars
- Morning-after dialogue plays (Drive: "You've got somewhere to be..." etc.)
- Sound/visual flip moment: subtle but distinct (bell + UI whoosh — placeholder for now)

### 4. Stage 1 Trigger
- First flip → Stage 1 combat unlocked
- Energy bar splits into Drive / Insight / Stability (three colored bars)
- Combat now shows damage to specific stats
- Log: `[STEADY-LIGHT:EVENT] {type: "stage-unlock", stage: 1, trigger: "first-flip"}`

### 5. Reflection Bridge
```
[STEADY-LIGHT:BRIDGE:REFLECTION]
  Night: sober sleep → reflection active
  Choice made: "Stay calm" (night 2 of 3)
  Effect: Drive +1 (was 4, now 5)
  Progress: Calm 2/3, Confidence 0/3, Passion 1/3
  Flipped: none
  Next calm reflection: FLIP (night 3)

[STEADY-LIGHT:BRIDGE:REFLECTION]
  *** FLIP EVENT ***
  Calm → Drive | Night 3 of 3
  Display label changed: "Calm" → "Drive"
  Real stat now visible: Drive = 5
  Stage unlock: 1 (Energy bar → three bars)
  Morning text: "You've got somewhere to be, and you start moving."
```

### 6. Dev Route
- `/dev/reflection/calm-night-1` — sober sleep, choose calm, night 1 dialogue
- `/dev/reflection/calm-night-3-flip` — sober sleep, choose calm, night 3 → FLIP triggers
- `/dev/reflection/full-arc` — scripted: 3 sober nights choosing calm, watch the full arc

## Acceptance Criteria

1. Sober sleep → reflection choice appears with three options
2. Choosing "Stay calm" → console shows Drive +1, reflection progress updated
3. Third "Stay calm" → flip event fires, UI relabels Calm → Drive
4. First flip of any stat → Stage 1 triggers, Energy bar splits into 3
5. Morning-after dialogue matches the flipped stat
6. Reflection bridge accurately tracks progress and announces flips
7. Auto-scenario `/dev/reflection/full-arc` runs through 3 nights → flip → all checks pass
8. After flip, `window.STEADY_LIGHT.getState().flipped.drive === true`

## Notes
- The flip moment should feel significant even with placeholder visuals. A console beep, a pause, something.
- Player can mix and match which stat they reflect on each night — they don't have to do 3 consecutive calm nights
- Open question: can you reflect on an already-flipped stat? Probably not — choice should be grayed out.
