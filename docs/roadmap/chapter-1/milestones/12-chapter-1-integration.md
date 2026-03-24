---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: medium
---

# Milestone 12: Chapter 1 Integration

## Goal
Wire all systems together into a playable Chapter 1 flow. A player (or AI agent) can go from character creation through the full town loop, trigger reflections, undergo stat flips, and eventually depart. This is the first end-to-end playthrough.

## Depends On
- All milestones 00-11

## Deliverables

### 1. Full Game Flow
1. Title screen → "New Game"
2. Character creation (Milestone 03)
3. Intro text scroll (brief, generic RPG opening)
4. Arrive at farm → farmer dialogue (Milestone 05)
5. First slime fight (Milestone 06 + 11)
6. Return to farmer → payment (Milestone 07)
7. Town exploration: shops, bar, guild (Milestone 07)
8. Evening → drink/no-drink choice (Milestone 08)
9. Sleep → reflection or instant sleep (Milestone 08 + 09)
10. Morning → next day begins
11. Loop days 2-N
12. Stat flips → Stage 1 (Milestone 09)
13. Departure trigger → Chapter 1 ends

### 2. Departure Trigger
- Requires: at least one stat flipped (Drive or Insight)
- Road south from town unlocked after first flip
- Walking south → "You look at the road ahead. The town is behind you." → Chapter 1 ends
- If no flip: road is blocked ("You don't feel ready to leave")

### 3. Save/Load (Minimal)
- Auto-save to localStorage at end of each day
- Load on page refresh
- "New Game" clears save

### 4. Full State Bridge
```
[STEADY-LIGHT:BRIDGE:FULL]
  Day: 7 | Phase: morning | Scene: farm
  --- Player ---
  Display: Calm=5(→Drive) Confidence=5 Passion=5
  Real: Drive=5 Insight=5 Stability=5
  Flipped: Drive=true, Insight=false, Stability=false
  Stage: 1 | Silver: 4
  Equipment: Wooden Sword, No Armor
  --- Progress ---
  Farmer quest: complete
  Reflections: Calm 3/3(FLIPPED) Confidence 1/3 Passion 0/3
  Days in town: 7
  Slimes killed: 12
  Drinks purchased: 4
  --- Departure ---
  Eligible: true (Drive flipped)
  Road status: unlocked
```

### 5. Integration Dev Route
- `/dev/integration/full-chapter-1` — starts from character creation, all systems active
- `/dev/integration/mid-game` — starts at day 5 with some progress
- `/dev/integration/pre-departure` — starts with one flip, ready to leave

### 6. Automated Playthrough Scenario
A scripted scenario that plays through the entire chapter:
1. Create character (7/4/4 distribution)
2. Talk to farmer
3. Fight 2 slimes
4. Buy a drink, sleep (days 1-3)
5. Skip drink, reflect on calm (days 4-6)
6. Flip calm → Drive
7. Walk to road, depart

Verify at each step that state is correct.

## Acceptance Criteria

1. New Game → character creation → arrive in town → farmer dialogue → all work seamlessly
2. Complete a full day cycle: chores → combat → shop → drink → sleep → morning
3. Complete a sober night: combat → skip drink → sleep → reflection → morning
4. Trigger a stat flip after 3 reflections → UI updates, Stage 1 unlocks
5. After flip, road south is accessible → departure sequence plays
6. Auto-save works — refresh page, game resumes at last save
7. Full state bridge shows accurate comprehensive state at any point
8. Automated playthrough scenario runs to completion and all checks pass

## Notes
- This is the big one. Everything before this was building isolated pieces. This is the assembly line.
- Expect bugs at system boundaries — where combat hands off to economy, where sleep hands off to reflection, etc.
- Polish is NOT the goal here. Working flow is the goal. Rough edges are fine.
- If the automated playthrough passes, Chapter 1 is structurally complete.
