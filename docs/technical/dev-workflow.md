---
last_reviewed: 2026-03-31
design_confidence: high
implementation_confidence: medium
---

# Development Workflow & AI Testing Infrastructure

## Implementation Status

Everything below describes the **design intent** for the dev/bridge infrastructure. Most of it is speculative — written before any game systems exist. Check this table before relying on anything.

### Infrastructure Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Dev route framework** | Working | `/dev` index renders, `/dev/test` works. `DevLayout` auto-enables bridges on mount. Routes lazy-loaded and stripped from production. |
| **State inspector** | Working | `window.STEADY_LIGHT.getState()`, `.setState()`, `.toggleDebug()`, `.eventBus` all functional. |
| **Logger** | Working | 6 categories (STATE, EVENT, COMBAT, NPC, ECON, DEBUG), per-category toggles, `[STEADY-LIGHT:*]` prefix format. |
| **EventBus** | Working | Typed pub/sub with `GameEventMap`. `on`/`off`/`emit`/`once`/`clear`. No game systems use it yet. |
| **Zustand store** | Working (empty) | 6 state slices with defaults. No game logic writes to them. Types are speculative — expect changes when real systems exercise them. |
| **BridgeManager** | Working (empty) | Toggle framework with `register`/`enable`/`disable`/`toggle` API. **Zero bridges are registered.** Calling `enableAll()` flips 6 booleans but produces no output because no `Bridge` implementations exist. |
| **Debug overlay** | Not started | Described below but not built. |
| **Automated scenarios** | Not started | `runScenario()` API described below but not built. |

### Bridge Implementation Status

| Bridge | Status | What it should do |
|--------|--------|-------------------|
| `grid` | **Not implemented** | ASCII render of combat grid (P=player, E=enemy, .=empty). See example below. |
| `timing` | **Not implemented** | Translate audio timestamps to beat accuracy (ON BEAT / CLOSE / OFF). See example below. |
| `state` | **Not implemented** | Dump game state in readable format (stats, equipment, flags). See example below. |
| `dialogue` | **Not implemented** | Show current dialogue line, choices with indices, knot history. See example below. |
| `economy` | **Not implemented** | Log transactions, balance changes, auto-drafts. |
| `combat` | **Not implemented** | Log action queuing, execution, stat changes per beat. |

**If you're implementing a game system and the bridge for it doesn't exist: build the bridge first.** The bridge is how you and the next agent verify the system works. A game system without a bridge is untestable by AI agents.

Each bridge must implement the `Bridge` interface from `src/bridges/bridge-manager.ts`:
```typescript
interface Bridge {
  readonly name: BridgeName;
  init(): void;    // Hook into game systems (subscribe to events, store changes)
  dispose(): void; // Unhook and clean up
}
```
Register it with `bridgeManager.register(myBridge)`. The BridgeManager handles enable/disable lifecycle — calling `init()` when enabled and `dispose()` when disabled.

### Dev Route Status

| Route | Status | Notes |
|-------|--------|-------|
| `/dev` | Working | Index page listing all routes |
| `/dev/test` | Working | Stub that logs `[STEADY-LIGHT:STATE] {scene: "dev-test", status: "initialized"}` |
| `/dev/combat/:stage` | Not started | Listed in DevIndex as "coming soon" |
| `/dev/dialogue/:tree` | Not started | Listed in DevIndex as "coming soon" |
| `/dev/economy/:scenario` | Not started | Listed in DevIndex as "coming soon" |
| `/dev/audio/sfx-test` | Not started | Listed in DevIndex as "coming soon" |
| `/dev/world` | Not started | Listed in DevIndex as "coming soon" |

### Workshop Tool Status

| Tool | Status | Dependencies |
|------|--------|-------------|
| `workshop/audio/generate-sfx.sh` | Exists | Needs `ELEVEN_LABS_UNRESTRICTED_API_KEY` in `.env` |
| `workshop/audio/split-loop.ts` | Exists | Needs `sox` (installed) |
| `workshop/audio/build-sprite.ts` | Exists | Needs `sox` (installed) |
| `workshop/audio/verify-audio.sh` | Exists | Needs `sox` (installed) |
| `workshop/dialogue/compile-ink.ts` | Exists | Needs `inklecate` (**not installed**) |
| `workshop/dialogue/test-dialogue.ts` | Exists | Needs `inkjs` (installed) |
| `workshop/dialogue/lint-dialogue.ts` | Exists | Needs `inkjs` (installed) |
| `workshop/maps/tiled-to-ascii.ts` | Exists | No external deps |
| `workshop/canon/validate-canon.ts` | Exists | No external deps |
| `workshop/sprites/pack-sprites.ts` | Exists | Needs `free-tex-packer-core` (installed) |

"Exists" means the file is there and typechecks. Most tools have **not been tested end-to-end** against real data. Expect rough edges. Log friction to `FRICTION.md`.

### Type System Status

The types in `src/core/types/` were derived from `docs/canon/state-manifest.json` before any game code existed. They represent the **intended** data model, not a battle-tested one. When implementing a real system, you should:

- **Use the existing types as a starting point**, not gospel
- **Change them freely** if the implementation reveals they're wrong
- **Keep the state manifest in sync** if you change types that correspond to canonical values

There is no production code and no users. Restructuring is free.

---

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
