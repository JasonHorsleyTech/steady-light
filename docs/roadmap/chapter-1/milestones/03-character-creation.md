---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Milestone 03: Character Creation

## Goal
Build the character creation screen where the player allocates stats. The UI shows Calm/Confidence/Passion (the lie). Internally, high values map to LOW real stats (Drive/Insight/Stability). This is the first deception.

## Depends On
- Milestone 00 (Project Scaffolding)
- Milestone 02 (Dialogue System — for intro text)

## Deliverables

### 1. Attribute System
- Three display stats: Calm (blue), Confidence (red), Passion (green)
- Three real stats: Drive, Insight, Stability
- Base allocation: 5-5-5 display stats
- Player can redistribute N points (TBD — suggest 3 to start)
- Inverse mapping: display value of 7 in Calm → real Drive value of 3 (10 - display)
- Min 2, max 8 per display stat (so real stats range 2-8)

### 2. Character Creation UI
- Three colored bars with labels (Calm, Confidence, Passion)
- +/- buttons or slider to redistribute
- Point pool counter showing remaining redistribution points
- "Confirm" button to finalize
- Brief intro text above: "Who are you?" or similar (uses dialogue system)
- Deliberately generic — should feel like RPG Maker

### 3. State Integration
- On confirm, writes to GameState:
  - `displayStats: {calm: N, confidence: N, passion: N}`
  - `realStats: {drive: N, insight: N, stability: N}`
  - `flipped: {drive: false, insight: false, stability: false}`
- Logs: `[STEADY-LIGHT:EVENT] {type: "character-created", display: {calm: 7, confidence: 4, passion: 4}, real: {drive: 3, insight: 6, stability: 6}}`

### 4. State Bridge
```
[STEADY-LIGHT:BRIDGE:STATE]
  --- Character Creation ---
  Display: Calm=7 Confidence=4 Passion=4
  Real (hidden): Drive=3 Insight=6 Stability=6
  Redistribution points remaining: 0
  Status: confirmed
```

### 5. Dev Route
- `/dev/char-create` — character creation screen in isolation
- State bridge enabled by default
- After confirmation, shows the resulting state

## Acceptance Criteria

1. Navigate to `/dev/char-create` — three bars render with labels and values
2. Click +/- to redistribute — values change, pool counter updates
3. Cannot exceed max or go below min — buttons disabled appropriately
4. Console bridge shows display AND real stats (the inverse mapping is correct)
5. Confirm → state written to GameState with both display and real stat objects
6. `window.STEADY_LIGHT.getState().realStats.drive === 10 - displayStats.calm` (inverse holds)
7. If pool has remaining points, confirm button is disabled

## Notes
- The player should NOT see Drive/Insight/Stability labels at this point. The bridge shows them for developer/AI verification only.
- The inverse mapping formula should be simple and documented: `real = MAX - display` where MAX = 10
- Open question: exactly how many redistribution points? Start with 3 and adjust during playtesting.
