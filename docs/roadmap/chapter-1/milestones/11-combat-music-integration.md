---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: medium
---

# Milestone 11: Combat + Music Integration

## Goal
Wire the beat system into combat. Actions queue during planning bars (1-3) and execute on bar 4. Both player and enemy actions snap to beats. The combat should still LOOK turn-based (slimes are passive), but the underlying engine is now rhythm-driven.

## Depends On
- Milestone 06 (Basic Combat)
- Milestone 10 (Music & Beat System)

## Deliverables

### 1. Beat-Synced Action Queue
- During planning phase (bars 1-3): player queues actions via menu (same as Milestone 06)
- Planning phase loops bars 1-3 until player confirms (early game has no time pressure)
- On confirmation or bar 4 arrival: execution phase begins
- Each queued action executes on one beat of bar 4

### 2. Beat-Synced Execution
- Beat 1 of bar 4: first queued action executes
- Beat 2: second action
- Beat 3: third action
- Beat 4: fourth action (or enemy action if player queued fewer)
- Simultaneous resolution: if player and enemy both act on the same beat, resolve simultaneously
- Visual: actions visually snap to beat timing (move happens ON the beat, not between beats)

### 3. Enemy AI on Beats
- Slime AI queues its actions during the same planning bars
- At Stage 0: slime queues nothing (idle) until hit, then queues [move toward, attack] on next cycle
- Enemy actions execute on their assigned beats

### 4. Combined Combat + Timing Bridge
```
[STEADY-LIGHT:BRIDGE:COMBAT-MUSIC]
  BPM: 88 | Measure: 3 | Phase: execution (bar 4)
  --- Execution Timeline ---
  M3:B1 — Player: Move(right) C3→D3 | Slime: Idle | ON BEAT
  M3:B2 — Player: Attack(right) → HIT Slime | Slime: Idle | ON BEAT
  M3:B3 — Player: (empty) | Slime: Move(left) E5→D5 | ON BEAT
  M3:B4 — Player: (empty) | Slime: Attack(left) → MISS (player not adjacent) | ON BEAT
  --- Timing Accuracy ---
  All actions: ON BEAT (max deviation: 1.2ms)
```

### 5. Dev Route
- `/dev/combat/music-stage-0` — Stage 0 combat with music enabled
- Shows both combat bridge and timing bridge
- Auto-scenario: scripted fight with timing verification

## Acceptance Criteria

1. Navigate to `/dev/combat/music-stage-0` — combat with click track playing
2. Planning phase loops bars 1-3 while player queues
3. Confirm → execution on bar 4, actions snap to individual beats
4. Combined bridge shows action-to-beat mapping with timing accuracy
5. All actions execute within ±5ms of their target beat
6. Slime AI actions also execute on beats
7. Combat still feels turn-based (planning → watching execution → planning)
8. Auto-scenario confirms timing AND combat logic pass together

## Notes
- The "it still looks turn-based" quality is crucial. Nothing about the music integration should make the player suspicious yet. The click track plays in the background, actions just happen to line up with it.
- In early game, the planning phase has NO time pressure — it loops indefinitely until the player confirms. Time pressure comes later with harder enemies.
- This is where the "music = time" pillar gets real. If the timing is off, the whole thing feels wrong even if the player can't articulate why.
