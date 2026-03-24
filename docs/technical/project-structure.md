---
last_reviewed: 2026-03-24
design_confidence: medium
implementation_confidence: medium
---

# Project Structure

## Tech Stack Decision

**React + Vite + TypeScript + Canvas (via PixiJS or raw 2D context)**

Rationale:
- **React** — Component model maps naturally to the dev route system. Each game system is a self-contained component with its own props/state. Jason mentioned React explicitly.
- **Vite** — Fast dev server, HMR, simple config. Already mentioned in architecture.md.
- **TypeScript** — Type safety helps Claude agents understand and modify code correctly. Catches bugs at compile time.
- **Canvas for game rendering** — The actual game view (grid, overworld, combat) renders to a `<canvas>`. React handles UI layers (menus, dialogue boxes, stat displays, debug overlay) on top.
- **PixiJS** — Likely best middle ground. Handles sprites, tilemaps, animation efficiently. Good WebGL/Canvas fallback. Well-documented enough for Claude to work with. Final decision deferred to Milestone 00.

## Directory Layout

```
steady-light/
├── CLAUDE.md                    # Project instructions for AI agents
├── docs/                        # All design documentation
│   ├── concept/
│   ├── mechanics/
│   ├── narrative/
│   ├── technical/
│   ├── brainstorm/
│   └── roadmap/
│       ├── overview.md
│       └── chapter-1/
│           ├── overview.md
│           └── milestones/
├── old-docs/                    # Previous iteration docs
│
├── src/
│   ├── core/                    # Foundation
│   │   ├── GameState.ts         # Central state management
│   │   ├── SceneManager.ts      # Scene loading/transitions
│   │   ├── EventBus.ts          # Pub/sub for system communication
│   │   ├── SaveSystem.ts        # localStorage serialization
│   │   └── types.ts             # Shared type definitions
│   │
│   ├── combat/                  # Combat engine
│   │   ├── CombatRunner.ts      # Core combat loop
│   │   ├── ActionQueue.ts       # Beat-aligned action queuing
│   │   ├── BeatSync.ts          # Music-to-combat timing
│   │   ├── EnemyAI.ts           # Enemy behavior patterns
│   │   └── CombatRenderer.ts    # Grid + sprite rendering
│   │
│   ├── dialogue/                # Dialogue system
│   │   ├── DialogueRunner.ts    # Tree traversal, choice handling
│   │   ├── DialogueRenderer.ts  # Text box, portrait, choices UI
│   │   └── trees/               # Dialogue data files (JSON)
│   │
│   ├── economy/                 # Economy system
│   │   ├── Wallet.ts            # Currency tracking
│   │   ├── Shop.ts              # Buy/sell transactions
│   │   └── DailyLedger.ts       # Rent, fees, auto-drafts
│   │
│   ├── progression/             # Stat & growth systems
│   │   ├── Attributes.ts        # Drive/Insight/Stability (real) + display labels
│   │   ├── Reflection.ts        # Sleep/drink/reflection arc
│   │   ├── FlipMechanic.ts      # Three-night flip logic + UI relabel
│   │   └── CharacterCreation.ts # Initial stat allocation (the deception)
│   │
│   ├── world/                   # Overworld & scenes
│   │   ├── Overworld.ts         # Tile-based movement
│   │   ├── NPCManager.ts        # NPC placement, interaction triggers
│   │   ├── SceneDefinitions.ts  # Scene data (town, barn, shop, etc.)
│   │   └── DayNightCycle.ts     # Time progression
│   │
│   ├── audio/                   # Audio system
│   │   ├── MusicPlayer.ts       # Web Audio API playback
│   │   ├── BPMTracker.ts        # Beat position tracking
│   │   └── SFX.ts               # Sound effects
│   │
│   ├── input/                   # Input handling
│   │   ├── InputManager.ts      # Keyboard + gamepad abstraction
│   │   └── InputMapping.ts      # Key/button → action mapping
│   │
│   ├── ui/                      # React UI components
│   │   ├── HUD.tsx              # In-game overlay (stats, silver, day)
│   │   ├── Menu.tsx             # Pause/inventory menus
│   │   ├── DialogueBox.tsx      # Dialogue text + choices
│   │   └── StatBars.tsx         # Energy bar / three-bar display
│   │
│   ├── bridges/                 # AI testing infrastructure
│   │   ├── BridgeManager.ts     # Toggle system, master control
│   │   ├── GridBridge.ts        # 8x8 grid → ASCII
│   │   ├── TimingBridge.ts      # Audio timing → readable beat log
│   │   ├── StateBridge.ts       # Full state dump → formatted text
│   │   ├── DialogueBridge.ts    # Dialogue state → text
│   │   ├── EconomyBridge.ts     # Transactions → log
│   │   └── CombatBridge.ts      # Combat actions → play-by-play
│   │
│   ├── debug/                   # Debug tools
│   │   ├── DebugOverlay.tsx     # Visual overlay component
│   │   ├── Logger.ts            # Structured [STEADY-LIGHT:*] logging
│   │   └── StateInspector.ts    # window.STEADY_LIGHT.* exposure
│   │
│   ├── dev/                     # Dev route harnesses
│   │   ├── DevRouter.tsx        # Route definitions for /dev/*
│   │   ├── DevCombat.tsx        # Isolated combat harness
│   │   ├── DevDialogue.tsx      # Isolated dialogue harness
│   │   ├── DevCharCreate.tsx    # Isolated char creation harness
│   │   ├── DevEconomy.tsx       # Isolated economy harness
│   │   ├── DevMusic.tsx         # Isolated music/beat harness
│   │   ├── DevOverworld.tsx     # Isolated overworld harness
│   │   └── scenarios/           # Automated test scenarios (JSON)
│   │
│   ├── App.tsx                  # Main app entry
│   ├── GameApp.tsx              # Full game boot (used in production route)
│   └── main.tsx                 # Vite entry point
│
├── assets/
│   ├── sprites/                 # Character + enemy sprites
│   ├── tiles/                   # Tileset images
│   ├── audio/                   # Music tracks + SFX
│   │   ├── music/
│   │   └── sfx/
│   └── ui/                      # UI element graphics
│
├── public/
│   └── index.html
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```

## Module Boundaries

Each `src/` subdirectory is a self-contained module. Modules communicate via:
1. **EventBus** — Pub/sub for cross-system events (e.g., combat emits "stat-changed", UI listens)
2. **GameState** — Shared state store that modules read from and write to via controlled methods
3. **Props** — Dev routes inject state directly as component props for isolation

Modules must NOT import directly from each other's internal files. If `combat/` needs stat data, it reads from `GameState`, not from `progression/Attributes.ts` directly.

## Routing

```
/                    → Title screen → full game
/dev                 → Dev route index (links to all harnesses)
/dev/combat/:stage   → Combat harness
/dev/dialogue/:tree  → Dialogue harness
/dev/char-create     → Character creation harness
/dev/economy/:scenario → Economy harness
/dev/music/:bpm      → Music/beat harness
/dev/overworld/:map  → Overworld harness
```

In production builds, `/dev/*` routes are stripped entirely.

## Open Questions
- PixiJS vs raw Canvas 2D? Need to evaluate Claude's ability to work with PixiJS.
- State management: plain React context + reducer, or Zustand/Jotai for lighter weight?
- Should dialogue trees be JSON or a custom DSL?
- Sprite sheet format: TexturePacker JSON? Custom?
