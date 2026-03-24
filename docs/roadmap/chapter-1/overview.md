---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: medium
---

# Chapter 1: Small Town — "Don't Be an NPC"

## High-Level Flow

Player creates a character (setting stat allocations that are secretly inverted) → intro text scroll → arrives in small town → meets the farmer → enters the daily loop (chores → slime combat → shops/bar/guild → sleep) → gets stuck in the treadmill → experiments → discovers the drink suppresses growth → undergoes stat flips via reflection → realizes the town is a bubble → leaves.

## Medium-Resolution Chunks

### Chunk A: Arrival (Character Creation → First Dialogue)
- **Character creation screen:** Three bars (Calm/Confidence/Passion), 5-5-5 base, redistribute a few points. UI lies — high Calm = low Drive internally.
- **Intro text scroll:** Sets the scene. Deliberately generic RPG opening.
- **Arrive in town:** Brief overworld moment — walk to the farm.
- **Farmer dialogue:** First NPC interaction. "Morning. You the new one? Barn's out back." Explains the work, points you to the field.

**Ends with:** Player has stats set, knows they have a barn and a job.

### Chunk B: The Loop (First Combat → Town Economy → Daily Cycle)
- **First slime fight:** Stage 0 combat on the white grid. Single "Energy" bar. Looks completely turn-based. Slime barely fights back. Player wins easily.
- **Return to farmer:** Get paid. Told about the bar ("You look beat"), the shops ("Weaponsmith can fix you up"), the guild ("They teach real fighting").
- **Town exploration:** Visit shops, buy a drink, join guild, sleep at barn. Economy bleeds you.
- **Daily loop:** Chores → slimes → spend → drink → sleep → repeat. Days pass. Marginal upgrades. Running in place.

**Ends with:** Player has been through the loop multiple times. Boredom or frustration building.

### Chunk C: The Awakening (Paradigm Shifts → Departure)
- **Skip the drink:** Player experiments (or runs out of money). Goes to bed sober. Gets the reflection choice.
- **Reflection arcs:** Three nights per stat → flip. UI relabels. Energy bar splits into three.
- **Realizations cascade:**
  - Sleeping heals you (didn't need the potion)
  - The drink is alcohol (blocks growth)
  - The guild teaches slime-only moves
  - Slimes aren't a real threat — they're a nuisance
  - Nobody in town has real combat experience
  - The weaponsmith's "upgrades" are marketing
  - The first wolf encounter destroys you
- **Departure:** Player has enough Drive/Insight to leave. Leaves the small town map.

**Ends with:** Chapter 1 complete. Player enters the wilds.

## Development Milestones (Low-Resolution)

Each milestone is one stepping stone — achievable by an overnight Ralph loop.

| # | Milestone | Key Deliverable | Depends On |
|---|-----------|----------------|------------|
| 00 | [Project Scaffolding](milestones/00-project-scaffolding.md) | Dev server runs, dev routes work, bridge system exists | Nothing |
| 01 | [Grid & Movement](milestones/01-grid-and-movement.md) | 8x8 grid renders, player moves, ASCII bridge works | 00 |
| 02 | [Dialogue System](milestones/02-dialogue-system.md) | Text box, dialogue trees, player choices | 00 |
| 03 | [Character Creation](milestones/03-character-creation.md) | Stat allocation with inverse mapping | 00, 02 |
| 04 | [Scene Manager & Town](milestones/04-scene-manager-and-town.md) | Scene transitions, town overworld, enter/exit buildings | 00, 01 |
| 05 | [NPC System](milestones/05-npc-system.md) | NPCs on overworld, talk triggers, farmer dialogue | 02, 04 |
| 06 | [Basic Combat (Stage 0)](milestones/06-basic-combat.md) | Full Stage 0 fight: queue actions, execute, stat changes, win/lose | 01, 05 |
| 07 | [Economy System](milestones/07-economy-system.md) | Silver, shops, purchases, rent, bank | 05, 06 |
| 08 | [Day Cycle & Sleep](milestones/08-day-cycle-and-sleep.md) | Time progression, drink/no-drink fork, energy restore | 07 |
| 09 | [Reflection & Flip](milestones/09-reflection-and-flip.md) | Three-night arcs, stat flip, UI relabel, Stage 1 trigger | 08 |
| 10 | [Music & Beat System](milestones/10-music-and-beat-system.md) | Audio playback, BPM tracking, timing bridge | 00 |
| 11 | [Combat + Music Integration](milestones/11-combat-music-integration.md) | Combat actions on beats, planning/execution phases | 06, 10 |
| 12 | [Chapter 1 Integration](milestones/12-chapter-1-integration.md) | Full flow: creation → town → combat → economy → sleep → flip → departure | All above |
| 13 | [Content & Polish](milestones/13-content-and-polish.md) | All NPC dialogue, paradigm shift tuning, edge cases | 12 |

### Dependency Graph (simplified)

```
00 (Scaffolding)
├── 01 (Grid)
│   ├── 04 (Scenes/Town) ← also needs 01
│   │   └── 05 (NPCs) ← also needs 02
│   │       ├── 06 (Combat) ← also needs 01
│   │       │   ├── 07 (Economy) ← also needs 05
│   │       │   │   └── 08 (Day/Sleep) ← needs 07
│   │       │   │       └── 09 (Reflection) ← needs 08
│   │       │   └── 11 (Combat+Music) ← also needs 10
│   │       └── ...
│   └── ...
├── 02 (Dialogue)
│   └── 03 (Char Creation) ← also needs 02
└── 10 (Music) — independent track, can parallel with 01-09
```

Note: Milestone 10 (Music) can be built in parallel with the main track since it's independent until integration at Milestone 11.

## Critical Path

The fastest path to a playable Chapter 1:
`00 → 01 → 04 → 05 → 06 → 07 → 08 → 09 → 12 → 13`

Dialogue (02, 03) and Music (10, 11) can develop in parallel on a second track and merge at integration.

## Open Questions
- Should we do placeholder beep-boop music for early milestones and real AI music later?
- How many redistribution points at character creation? (Currently unspecified)
- What triggers the departure from town? Stat threshold? Story flag? Player choice?
- Do we need a tutorial or does the farmer dialogue serve as one?
