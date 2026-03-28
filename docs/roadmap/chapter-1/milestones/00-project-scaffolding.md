---
last_reviewed: 2026-03-28
design_confidence: high
implementation_confidence: high
---

# Milestone 00: Project Scaffolding

**Status: Complete** (implemented across US-001 through US-006)

## Goal
Set up the development environment, build system, dev route infrastructure, bridge system foundation, and structured logging. After this milestone, the factory floor exists — no game content yet, but all the tools are charged and ready.

## What Was Built

### 1. Project Init (US-001)
- React 19 + TypeScript 6 + Vite 8 project initialized
- Full directory structure under `src/`: core, combat, dialogue, economy, progression, world, audio, input, ui, bridges, debug, dev (with scenarios/)
- PixiJS v8 pinned at `~8.17.1`, Zustand, Howler.js, React Router installed
- Two tsconfigs: `tsconfig.app.json` (game code, ESNext/bundler/DOM) and `tsconfig.json` (workshop scripts, Node16)
- `npm run dev`, `npm run build`, `npm run typecheck` scripts

**Deviation from plan:** ESLint + Prettier were NOT configured. Can be added later if needed.

### 2. Core Type Definitions (US-002)
- Comprehensive types in `src/core/types/` (8 files + barrel index)
- All enums: stats, locations, combat, NPCs, weapons, armor, enemies, economy
- All state interfaces: PlayerState, CombatState, EconomyState, DialogueState, ProgressionState, SceneState
- `GameEventMap` with 30+ typed events across all systems
- Types derived from `docs/canon/state-manifest.json`

**Deviation from plan:** Types split across 8 focused files instead of single `types.ts` — better for maintainability.

### 3. State Management (US-003)
- Zustand vanilla store (`src/core/store.ts`) with typed `GameState` containing 6 slices
- State inspector (`src/debug/state-inspector.ts`) exposing `window.STEADY_LIGHT` with `getState()`, `setState()`, `toggleDebug()`
- Production-guarded via `import.meta.env.PROD` — tree-shaken from production builds

**Decision made:** Zustand over React Context. Game engine code runs outside React (PixiJS callbacks, bridges, game loop) and needs store access.

### 4. EventBus (US-004)
- Typed EventBus (`src/core/event-bus.ts`) using `GameEventMap` from US-002
- Methods: `on()` (returns unsubscribe), `off()`, `emit()`, `once()`, `clear()`, `setDebug()`, `listenerCount()`
- Empty listener sets cleaned up on unsubscribe (no memory leaks)
- Exposed on `window.STEADY_LIGHT.eventBus` for dev console access

### 5. Structured Logging & Bridge Foundation (US-005)
- Logger singleton (`src/core/logger.ts`) with 6 categories (STATE, EVENT, COMBAT, NPC, ECON, DEBUG), each independently toggleable
- Bridge interface and BridgeManager (`src/bridges/bridge-manager.ts`) with per-bridge toggles for 6 bridge types
- State inspector extended with `window.STEADY_LIGHT.bridges` (enable/disable/toggle/status) and `window.STEADY_LIGHT.logger` controls

### 6. Dev Route System (US-006)
- `/dev` index page listing all dev routes
- `/dev/test` route rendering "Dev route system working" with structured log
- `DevLayout` wrapper auto-enables all bridges on mount, disables on unmount
- Lazy-loaded via `React.lazy()` + `import.meta.env.DEV` — verified zero dev route content in production build

## Tech Stack Decisions (Locked)

| Decision | Choice |
|----------|--------|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Language | TypeScript 6 (strict) |
| Rendering | PixiJS v8 (~8.17.1) |
| State Management | Zustand (vanilla) |
| Dialogue | ink/inkjs |
| SFX | Howler.js |
| Music | Raw Web Audio API |
| Tilemaps | Tiled JSON |
| Sprite Sheets | TexturePacker JSON Hash (free-tex-packer-core) |

## Acceptance Criteria (All Verified)

1. `npm run dev` starts the dev server without errors
2. Navigate to `/dev` — page renders with a list of harness links
3. Navigate to `/dev/test` — page renders "Dev route system working"
4. Console shows: `[STEADY-LIGHT:STATE] {scene: "dev-test", status: "initialized"}`
5. `window.STEADY_LIGHT.getState()` returns a state object
6. `window.STEADY_LIGHT.bridges.toggle('grid')` toggles without error
7. `npm run build` completes without errors
8. Production build does NOT include `/dev` routes

## Files Created
- `src/main.tsx`, `src/App.tsx`, `index.html`, `vite.config.ts`, `tsconfig.app.json`
- `src/core/types/` (10 files), `src/core/store.ts`, `src/core/event-bus.ts`, `src/core/logger.ts`
- `src/bridges/bridge-manager.ts`
- `src/debug/state-inspector.ts`
- `src/dev/DevLayout.tsx`, `src/dev/DevIndex.tsx`, `src/dev/DevTest.tsx`
