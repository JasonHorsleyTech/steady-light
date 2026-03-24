---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: medium
---

# Development Workflow & AI Testing Infrastructure

## The Core Problem

The game is built by AI agents that can't see the screen or hear the audio. Every system needs a parallel "bridge" — a text-based representation that an AI can read from the console to verify correctness.

## Dev Route System

Each major game system has an isolated dev route: a URL that boots just that component with injected test state. No full game boot required.

### Route Convention

```
/dev/{system}/{scenario}
```

Examples:
- `/dev/combat/stage-0` — Stage 0 combat with a green slime, pre-set stats
- `/dev/combat/stage-1` — Stage 1 combat (3 visible bars), slightly harder enemy
- `/dev/dialogue/farmer-intro` — Farmer's first dialogue tree
- `/dev/dialogue/reflection-calm-night-1` — First calm reflection dialogue
- `/dev/character-creation` — Stat allocation screen
- `/dev/economy/day-cycle` — Full day of earning/spending
- `/dev/music/beat-sync` — Music playback with beat bridge output
- `/dev/overworld/town` — Town map with movement

### Dev Route Requirements

Each dev route:
1. Instantiates the component with controlled, reproducible state
2. Enables all bridges for that system by default
3. Exposes state via `window.STEADY_LIGHT.getState()` and `window.STEADY_LIGHT.{system}`
4. Logs initialization to console with full starting state
5. Has a "run scenario" mode that auto-plays through a scripted sequence (for automated testing)

## Bridge System

Bridges translate visual/audio game state into text that an AI agent can read and reason about.

### Types of Bridges

#### ASCII State Bridge
Renders spatial game state as text.

**Grid example (combat):**
```
[STEADY-LIGHT:BRIDGE:GRID]
  A B C D E F G H
1 . . . . . . . .
2 . . . . . . . .
3 . . . P . . . .
4 . . . . . . . .
5 . . . . E . . .
6 . . . . . . . .
7 . . . . . . . .
8 . . . . . . . .
Legend: P=Player(C3) E=GreenSlime(E5) .=Empty
```

**Overworld example:**
```
[STEADY-LIGHT:BRIDGE:MAP]
  Current: Town Square
  Exits: N=Farm, E=Shop Row, S=Road Out, W=Barn
  NPCs: Farmer(3 tiles N), Bartender(inside Bar, E then N)
  Player: center of square, facing N
```

#### Timing Bridge
Translates audio timing into human-readable beat accuracy.

```
[STEADY-LIGHT:BRIDGE:TIMING]
  BPM: 88 | Time Sig: 4/4 | Measure: 3 of 4 (Planning)
  Beat 1: 2045.2ms — ON BEAT
  Beat 2: 2727.1ms — ON BEAT (1.2ms early)
  Beat 3: 3409.8ms — ON BEAT (0.9ms late)
  Beat 4: 4091.0ms — ON BEAT
  Threshold: ±5ms = ON BEAT, ±15ms = CLOSE, >15ms = OFF
```

#### State Bridge
Dumps game state in readable format.

```
[STEADY-LIGHT:BRIDGE:STATE]
  Scene: combat | Phase: planning | Day: 3
  --- Player ---
  Display Stats: Calm=7 Confidence=4 Passion=4 (pre-flip)
  Real Stats: Drive=4 Insight=4 Stability=4 (hidden)
  Energy Bar: 12/15 (combined display)
  Equipment: Basic Stick, No Armor
  Silver: 6
  --- Enemy ---
  Type: Green Slime | HP: 3/3
  Behavior: Idle (will react on hit)
  --- Reflection ---
  Calm: 1/3 nights | Confidence: 0/3 | Passion: 0/3
  Flipped: none
```

#### Dialogue Bridge
Shows dialogue tree state.

```
[STEADY-LIGHT:BRIDGE:DIALOGUE]
  NPC: Farmer | Node: intro_greeting
  Text: "Morning. You the new one? Barn's out back."
  Choices:
    [1] "Thanks. What do I do here?" → farmer_explain_work
    [2] "Where can I get stronger?" → farmer_suggest_guild
    [3] (Leave) → end_dialogue
  History: [intro_greeting] (first visit)
```

### Bridge Toggle System

Each bridge type has an independent flag:

```javascript
window.STEADY_LIGHT.bridges = {
  grid: true,      // ASCII grid renders
  timing: true,    // Beat accuracy logs
  state: true,     // State dumps
  dialogue: true,  // Dialogue tree state
  economy: true,   // Transaction logs
  combat: true,    // Combat action logs
  all: true        // Master toggle
}
```

Dev routes enable relevant bridges by default. Production disables all.

## Automated Testing Scenarios

Each dev route supports a "scenario" mode — a scripted sequence of inputs and expected states that runs automatically. This is what Ralph loop agents use to verify their work.

```javascript
// Example: combat scenario
window.STEADY_LIGHT.runScenario('combat-basic-slime', {
  actions: [
    { beat: 1, action: 'move', direction: 'right' },
    { beat: 2, action: 'move', direction: 'right' },
    { beat: 3, action: 'attack', direction: 'right' },
    { beat: 4, action: 'confirm' }
  ],
  expectations: [
    { after: 'execution', check: 'slime.drive < 3' },
    { after: 'execution', check: 'player.position == {x:5, y:3}' }
  ]
})
```

Output: PASS/FAIL per expectation, with full state dump on failure.

## Debug Overlay

A togglable in-browser overlay (not the console bridges — this is visual) showing:
- Current scene / phase / day
- All three real stats with values
- Current beat / measure in combat
- Player grid position
- Active quest flags
- Silver balance
- Bridge toggle checkboxes

Toggle with a keyboard shortcut or `window.STEADY_LIGHT.toggleDebug()`.

## Open Questions
- Exact keyboard shortcut for debug overlay toggle?
- Should scenarios be defined in JSON files or inline JS?
- Do we need visual regression testing (screenshot comparison) or is ASCII bridge sufficient?
- How do we handle async timing bridges (music) in automated scenarios?
