---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Milestone 06: Basic Combat (Stage 0)

## Goal
Build the full Stage 0 combat system: the 8x8 white grid, action queuing, simultaneous execution, stat changes from actions, win/lose conditions, and the slime AI. At this stage it should look and feel like a basic turn-based RPG fight — the rhythm/music component comes later (Milestone 10-11).

## Depends On
- Milestone 01 (Grid & Movement — reuses grid system)
- Milestone 05 (NPC System — combat triggered from overworld)

## Deliverables

### 1. Combat Runner
- Initiates combat with defined combatants (player + enemies)
- Two phases: Planning (player queues actions) → Execution (actions play out sequentially-looking)
- At Stage 0, execution appears sequential: player actions first, then enemy. (Reality: simultaneous, but slimes are so passive it looks turn-based.)
- Ends when any combatant's "Energy" (combined stat total) hits zero, or enemy energy hits zero

### 2. Action System
- Available actions: Attack, Block, Dodge, Move, Do Nothing
- Player queues 1-4 actions during planning phase via menu
- Each action has a direction (facing or chosen)
- Actions resolve in queue order during execution
- Stat interactions per `docs/mechanics/combat.md`:
  - Attack lands → attacker +Drive, defender -Drive
  - Attack blocked → blocker +Insight, attacker -Insight
  - Attack dodged → dodger +Stability, attacker -Stability
  - Do nothing → +1 to lowest stat

### 3. Energy Bar (Stage 0 Display)
- Single combined "Energy" bar shown to player: sum of Drive + Insight + Stability
- Internally tracks all three separately
- At zero (any single stat hits zero OR combined threshold) → lose condition

### 4. Green Slime AI
- Idle until hit
- After hit: move toward player, attack on next execution
- Fixed, predictable, same every time
- Very low stat values — easy to kill in 2-3 hits with no strategy

### 5. Combat Flow
1. Transition from overworld to combat scene (white grid)
2. Player and slime placed on grid
3. Planning phase: player queues actions from menu
4. Confirm → execution phase: actions animate sequentially
5. Check win/lose conditions
6. If neither: next planning phase
7. On win: return to overworld, stats persisted, event logged
8. On lose: return to overworld at barn (carried back), event logged

### 6. Combat Bridge
```
[STEADY-LIGHT:BRIDGE:COMBAT]
  Phase: planning | Turn: 1
  --- Grid ---
  A B C D E F G H
  . . . . . . . .
  . . . P . . . .
  . . . . . E . .
  ...
  --- Player ---
  Energy (display): 15/15
  Real stats: Drive=5 Insight=5 Stability=5
  Queued: [Move(right), Attack(right)]
  --- Enemy: Green Slime ---
  Energy: 6/6
  Real stats: Drive=2 Insight=2 Stability=2
  Plan: [Idle]
  --- Last Execution ---
  Beat 1: Player moved right (C3→D3)
  Beat 2: Player attacked right → HIT slime → Player +1 Drive, Slime -1 Drive
  Beat 3: Slime idle
  Beat 4: (empty)
```

### 7. Dev Route
- `/dev/combat/stage-0` — combat with one green slime, pre-set stats
- Auto-scenario: scripted fight where player wins in 3 turns
- Combat bridge enabled by default

## Acceptance Criteria

1. Navigate to `/dev/combat/stage-0` — white grid with player and slime renders
2. Queue Attack action, confirm — execution plays out, slime takes damage
3. After hitting slime, slime moves toward player and attacks next turn
4. Combat bridge shows correct grid state, stat values, and action results
5. Stat changes match the rules: attack lands = +Drive attacker, -Drive defender
6. Killing the slime (any stat → 0) ends combat, logs victory
7. If player loses, combat ends, logs defeat
8. `window.STEADY_LIGHT.combat.getState()` returns full combat state
9. Auto-scenario runs and reports PASS for all checks

## Notes
- No music/rhythm timing at this point — that's Milestones 10-11. Planning phase just waits for input indefinitely.
- No sprites — player is one color, slime is another color, grid cells are clear.
- The "it looks turn-based" effect comes naturally from slime passivity, not from code faking turns.
- Menu-style action selection (list of options, press to select, confirm to execute) is fine. No real-time input yet.
