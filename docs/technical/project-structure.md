---
last_reviewed: 2026-03-28
design_confidence: high
implementation_confidence: high
---

# Project Structure

## Tech Stack (Locked)

**React 19 + Vite 8 + TypeScript 6 + PixiJS v8 + Zustand**

See `docs/technical/architecture.md` for the full stack table with rationale. Key points:
- **React** — UI layers (menus, dialogue, debug overlays) over PixiJS canvas
- **Vite** — Dev server, HMR, `import.meta.env.DEV` for dev-only code stripping
- **TypeScript** — Strict mode everywhere. Two tsconfigs: `tsconfig.app.json` (game, ESNext/bundler) and `tsconfig.json` (workshop, Node16)
- **PixiJS v8** — Pinned `~8.17.1`. Sprites, tilemaps, animation. Falls back to Canvas 2D if friction accumulates.
- **Zustand** — Vanilla stores accessible outside React (game loop, bridges, PixiJS callbacks)
- **inkjs** — Dialogue format (ink scripts compiled to `.ink.json`)
- **Howler.js** — SFX playback (audio sprites)
- **Raw Web Audio API** — Music playback (beat-synced scheduling)
- **Tiled JSON** — Tilemap format
- **TexturePacker JSON Hash** — Sprite sheet format (via free-tex-packer-core)

## Directory Layout

```
steady-light/
├── CLAUDE.md                    # Project instructions for AI agents
├── PLAN.md                      # High-level delivery plan
├── FRICTION.md                  # Recurring pain points log
├── docs/
│   ├── concept/                 # Game design philosophy, player psychology
│   ├── mechanics/               # Attributes, combat, economy, progression
│   ├── narrative/               # Story structure, characters, dialogue, tone
│   ├── technical/               # Architecture, project structure, dev workflow
│   ├── brainstorm/              # Raw session notes, unresolved ideas
│   ├── canon/                   # Single source of truth for game values
│   │   └── state-manifest.json  # Item prices, NPC IDs, stat thresholds, etc.
│   └── roadmap/
│       ├── overview.md
│       └── chapter-1/
│           ├── overview.md
│           └── milestones/
├── old-docs/                    # Previous iteration docs
│
├── src/
│   ├── core/                    # Foundation
│   │   ├── types/               # All shared TypeScript types (barrel index.ts)
│   │   │   ├── index.ts         # Barrel re-export
│   │   │   ├── enums.ts         # All game enums
│   │   │   ├── stats.ts         # RealStats, FalseStats, constants
│   │   │   ├── player.ts        # PlayerState, equipment, inventory
│   │   │   ├── combat.ts        # CombatState, grid, entities, timing
│   │   │   ├── economy.ts       # EconomyState, shops, transactions
│   │   │   ├── dialogue.ts      # DialogueState, lines, choices
│   │   │   ├── progression.ts   # ProgressionState, reflection, flips
│   │   │   ├── world.ts         # SceneState, NPCs, locations
│   │   │   └── events.ts        # GameEventMap, typed event payloads
│   │   ├── store.ts             # Zustand vanilla store (GameState)
│   │   ├── event-bus.ts         # Typed pub/sub (uses GameEventMap)
│   │   └── logger.ts            # Singleton structured [STEADY-LIGHT:*] logging
│   │
│   ├── combat/                  # Combat engine (future)
│   ├── dialogue/                # ink/inkjs dialogue system (future)
│   ├── economy/                 # Economy system (future)
│   ├── progression/             # Stat & growth systems (future)
│   ├── world/                   # Overworld & scenes (future)
│   ├── audio/                   # Audio system (future)
│   ├── input/                   # Input handling (future)
│   ├── ui/                      # React UI components (future)
│   │
│   ├── bridges/                 # AI testing infrastructure
│   │   └── bridge-manager.ts    # Bridge interface + BridgeManager with per-bridge toggles
│   │
│   ├── debug/                   # Debug tools
│   │   └── state-inspector.ts   # window.STEADY_LIGHT (state, bridges, logger, eventBus)
│   │
│   ├── dev/                     # Dev route harnesses
│   │   ├── DevLayout.tsx        # Layout wrapper (auto-enables bridges)
│   │   ├── DevIndex.tsx         # Index page listing all dev routes
│   │   ├── DevTest.tsx          # Test route (verifies system works)
│   │   └── scenarios/           # Automated test scenarios (future)
│   │
│   ├── App.tsx                  # Root component with BrowserRouter + lazy dev routes
│   └── main.tsx                 # Vite entry point
│
├── workshop/                    # Agent tools (not the game itself)
│   ├── dialogue/                # ink compile, test, lint
│   ├── maps/                    # Tiled JSON → ASCII
│   ├── sprites/                 # Sprite packing
│   ├── audio/                   # SFX split-loop, audio sprite building
│   └── canon/                   # Canonical state validation
│
├── assets/                      # Game assets (future)
│   ├── sprites/
│   ├── tiles/
│   ├── audio/
│   │   ├── music/
│   │   └── sfx/
│   └── ui/
│
├── index.html                   # Vite entry HTML
├── package.json
├── tsconfig.json                # Workshop scripts (Node16)
├── tsconfig.app.json            # Game code (ESNext/bundler, DOM, JSX)
├── vite.config.ts
└── .gitignore
```

## Module Boundaries

Each `src/` subdirectory is a self-contained module. Modules communicate via:
1. **EventBus** (`src/core/event-bus.ts`) — Typed pub/sub using `GameEventMap`. Use `eventBus.on()`, `.emit()`, `.once()`.
2. **Zustand Store** (`src/core/store.ts`) — Shared vanilla store. Modules read with `gameStore.getState()` and write with `gameStore.setState()`. For React components, use `useStore(gameStore, selector)`.
3. **Props** — Dev routes inject state directly as component props for isolation.

Modules must NOT import directly from each other's internal files. If `combat/` needs stat data, it reads from the Zustand store, not from `progression/` directly.

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

## Resolved Decisions
- **PixiJS v8** — Pinned `~8.17.1`. Handles sprites, tilemaps, animation. Falls back to Canvas 2D only if FRICTION.md hits accumulate.
- **Zustand (vanilla)** — Accessible outside React for game loop, bridges, PixiJS callbacks.
- **ink/inkjs** — Dialogue trees authored as `.ink` scripts, compiled to `.ink.json` for runtime.
- **TexturePacker JSON Hash** — Via `free-tex-packer-core` npm package (no GUI). PixiJS loads natively.

## Open Questions
- Input handling: keyboard primary? Mouse? Both?
- Mobile support? (Probably not for v1)
