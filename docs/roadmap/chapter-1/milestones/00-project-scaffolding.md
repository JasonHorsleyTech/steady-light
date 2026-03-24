---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Milestone 00: Project Scaffolding

## Goal
Set up the development environment, build system, dev route infrastructure, bridge system foundation, and structured logging. After this milestone, the factory floor exists — no game content yet, but all the tools are charged and ready.

## Deliverables

### 1. Project Init
- React + TypeScript + Vite project initialized
- Basic directory structure created (see `docs/technical/project-structure.md`)
- ESLint + Prettier configured
- `.gitignore` set up properly

### 2. Dev Route System
- React Router with `/dev` index page listing all available harnesses
- Each dev route renders a placeholder component with its name
- `/dev/test` route that renders "Dev route system working" and logs to console
- Dev routes stripped from production builds via environment variable

### 3. Bridge System Foundation
- `BridgeManager` class with toggle flags per bridge type
- `Logger` class implementing structured `[STEADY-LIGHT:*]` log format
- Bridge output goes to `console.log` with structured prefixes
- All bridges toggleable via `window.STEADY_LIGHT.bridges`

### 4. State Inspector
- `window.STEADY_LIGHT` global object exposed
- `.getState()` returns current game state
- `.bridges` object for toggle control
- `.toggleDebug()` placeholder

### 5. Game State Foundation
- Basic `GameState` store (React context + reducer, or Zustand — decide during implementation)
- EventBus for pub/sub
- Type definitions for core types (Stats, Scene, CombatState, etc.)

## Acceptance Criteria

An AI agent can verify all of the following:

1. `npm run dev` starts the dev server without errors
2. Navigate to `/dev` — page renders with a list of harness links
3. Navigate to `/dev/test` — page renders "Dev route system working"
4. Console shows: `[STEADY-LIGHT:STATE] {scene: "dev-test", status: "initialized"}`
5. `window.STEADY_LIGHT.getState()` returns a state object
6. `window.STEADY_LIGHT.bridges.grid = false` toggles without error
7. `npm run build` completes without errors
8. Production build does NOT include `/dev` routes

## Estimated Scope
- ~15-20 files created
- No game logic, no visuals beyond placeholder text
- Foundation that every subsequent milestone builds on

## Notes
- This is the ONLY milestone that needs to make a tech stack decision (React vs Preact, Zustand vs Context, PixiJS vs raw Canvas). Document the decision in a commit message.
- Keep dependencies minimal. Every added dependency is something Claude agents need to understand.
