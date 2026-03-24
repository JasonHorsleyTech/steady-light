---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Milestone 01: Grid & Movement

## Goal
Render an 8x8 grid on a canvas, place a player token, and allow keyboard movement. Build the ASCII grid bridge so an AI agent can verify grid state from the console.

## Depends On
- Milestone 00 (Project Scaffolding)

## Deliverables

### 1. Grid Renderer
- Canvas-based 8x8 grid with visible cell borders
- Configurable cell size (default 64px)
- Player token rendered as a colored square (placeholder — no sprite yet)
- Grid coordinates displayed (A-H columns, 1-8 rows)

### 2. Player Movement
- Arrow keys / WASD move the player one cell per input
- Movement blocked at grid boundaries
- Movement logged: `[STEADY-LIGHT:EVENT] {type: "player-move", from: "C3", to: "C4"}`

### 3. ASCII Grid Bridge
- On every state change, logs ASCII grid to console:
```
[STEADY-LIGHT:BRIDGE:GRID]
  A B C D E F G H
1 . . . . . . . .
2 . . . P . . . .
3 . . . . . . . .
...
Legend: P=Player(D2) .=Empty
```

### 4. Dev Route
- `/dev/grid` renders the grid with player at starting position (D4)
- Grid bridge enabled by default
- State accessible via `window.STEADY_LIGHT.grid.getState()`

## Acceptance Criteria

1. Navigate to `/dev/grid` — 8x8 grid renders with player token visible
2. Press arrow keys — player moves, stays within bounds
3. Console shows movement events with from/to coordinates
4. Console shows ASCII grid that matches the visual grid
5. `window.STEADY_LIGHT.grid.getState()` returns `{player: {x, y}, entities: []}`
6. Player cannot move outside grid boundaries (verified via ASCII bridge after attempting)

## Notes
- No enemies yet — that's Milestone 06
- No sprites yet — colored rectangles are fine
- The grid system built here will be reused directly by the combat system
