---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Combat System

## Core Concept

Rhythm-based simultaneous-turn combat **disguised as basic turn-based combat**. The player doesn't know it's rhythm-based until they've been playing long enough to notice the pattern.

---

## Space

- **Early game:** Abstract 8x8 white grid arena (Pokemon-style "otherworld"). Fights are visually separated from the overworld.
- **Later (Stage 3+):** Fights happen in the actual overworld — cornfields, streets, buildings. The white grid dissolves. Cover, obstacles, and line-of-sight matter.

## Time

Combat follows the **time signature of the background music** (4/4 early game, 3/4 and 6/8 later).

- **Planning Phase:** First (N-1) bars — player queues up actions. No time pressure early on; the beat loops until you've queued.
- **Execution Phase:** Final bar — actions execute one per beat in the order queued. Both player and enemy execute simultaneously.

Early game this looks turn-based because:
- Slimes don't act unless provoked, then only attack once
- The player queues all their moves, hits confirm, and watches them play out
- It *feels* like "my turn, their turn"

The reality: both sides have the same 4 beats to queue, and execution is simultaneous.

---

## Actions Per Beat

Each beat, you can do one of:
- **Move** (direction)
- **Move + Action** (attack/block/dodge with optional direction) — *unlocked at Stage 4*
- **Action in facing direction** (if standing still)

Action types:
| Action    | Input (Gamepad)         | Effect |
|-----------|------------------------|--------|
| **Attack** | RT + optional R-stick dir | Deal damage to target. Gain Drive if it lands. Lose Insight if blocked. |
| **Block**  | RB + optional direction   | Negate incoming attack. Gain Insight. Enemy loses Insight. |
| **Dodge**  | LT + optional direction   | Evade attack. Gain Stability. Enemy loses Stability. |

**A button:** Confirm queued action (early game menu-style).
**B button:** Cancel last queued action.

---

## Stat Interactions in Combat

| Event | You | Enemy |
|-------|-----|-------|
| You land an attack | +Drive | -Drive |
| Enemy lands an attack on you | -Drive | +Drive |
| You block an attack | +Insight | -Insight |
| Enemy blocks your attack | -Insight | +Insight |
| You dodge an attack | +Stability | -Stability |
| Enemy dodges your attack | -Stability | +Stability |

**If any stat hits zero, that fighter loses.**
- Drive zero = give up
- Insight zero = (TBD — confusion?)
- Stability zero = daze and flee

---

## Enemy Behavior

### Early Game (Slimes)
- Stand idle unless hit
- After being hit: move toward player, attack on last beat
- One fixed pattern, same every time
- Predictable, boring, safe — by design

### Mid Game
- Enemies plan over multiple beats
- May feint (move toward but attack later) or zone control
- Attacks target specific stats
- Some enemies have preferred stat they drain

### Late Game
- Enemies react mid-chain to your early moves
- Some use alternate time signatures (3/4, 6/8) — breaks rhythm habits
- Positioning and line-of-sight matter
- Full reactive AI

---

## Combat Paradigm Shift Stages

### Stage 0 — Turn-Based Illusion
- Abstract 8x8 white grid
- No simultaneous move+action
- Movement limited to inside arena
- Single "Energy" bar (three stats hidden)
- Enemy AI inert unless provoked
- Looks like a standard RPG Maker battle

### Stage 1 — Stat Separation (First flip: any stat)
- UI splits Energy into Drive/Insight/Stability bars
- Attacks now damage specific bars
- Still in abstract arena
- Still can't move+act simultaneously

### Stage 2 — Plan Awareness (Insight threshold)
- See enemy's next action type (Attack, Move, Defend)
- Dodge/block/parry becomes possible and grants stat recovery
- Still in abstract arena
- Movement starts influencing combat flow

### Stage 3 — Environmental Reality (Drive threshold)
- Battles occur in overworld — white grid overlay disappears
- Player/enemy can leave combat by moving out of visual range
- Solid objects matter (cover, obstacles)
- First enemies with multi-step chains

### Stage 4 — Fluid Motion (Stability threshold)
- Move+act on the same beat
- Full 4-action chains available
- Position-specific attacks, dodges, and blocks
- Enemy AI reactive to first half of your chain

### Stage 5 — The Truth (Final narrative reveal)
- Complex enemies use odd meters (3/4, 6/8)
- If Insight high enough: see exactly how your planned chain will interact with theirs
- Fights are fully dynamic, reactive, and musical

---

## Weapons & Armor (Simple Underneath)

The real system is simple. The shop descriptions lie.

**Weapons:**
- Short weapon = 1 beat attack, fast
- Heavy weapon = 2 beat attack, ~double damage
- That's it. Shop tiers (+10%, +20%, +50%) are negligible against anything beyond slimes.

**Armor:**
- Heavy = costs 2 MP/move. Good vs. rushers.
- Light = costs 1 MP/move. Good vs. runners.
- Shop tier differences are marginal.

**Energy Recovery:**
- "Do nothing" on a beat = +1 to lowest stat (Drive/Insight/Stability)
- Effectively 1/3 of an "energy" point per turn

---

## Example Combat Flow (4/4 Early Game)

**Measures 1-3** (Planning): Player queues via menu: Move, Attack, Block.

**Measure 4** (Execution):
- Beat 1: Move → Step left
- Beat 2: Move → Step left
- Beat 3: Move → Step left
- Beat 4: Attack → Swing at slime

**Enemy AI**: Was idle. After being hit → moves toward player → attacks on last beat of next cycle.

To the player, this looks like: "I moved and attacked. Then the slime moved and attacked. Turn-based."
In reality: simultaneous planning and execution on a musical grid.

---

## Open Questions
- How does the "do nothing = recovery" interact with the drink mechanic?
- Exact stat thresholds for each Stage unlock?
- How does browser input work for the planning phase? Click-to-queue? Keyboard?
- How do we handle the rhythm component without a gamepad in browser?
