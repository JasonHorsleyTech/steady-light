---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: medium
---

# Milestone 04: Scene Manager & Town Map

## Goal
Build the scene transition system and the small town overworld. Player can walk around the town map and enter/exit buildings. Each location is a scene with its own layout.

## Depends On
- Milestone 00 (Project Scaffolding)
- Milestone 01 (Grid & Movement — movement system reused for overworld)

## Deliverables

### 1. Scene Manager
- Manages scene stack (push/pop for entering/exiting buildings)
- Scene transitions with simple fade or cut
- Each scene defines: layout, entry points, exits, NPCs, interactables
- Events: `scene-enter`, `scene-exit`, `scene-transition`

### 2. Town Overworld
- Tile-based top-down map (placeholder colored rectangles for buildings)
- Locations: Barn, Farm/Field, Weaponsmith, Armorer, Fighters Guild, Bar, Bank, Library, Town Square
- Player walks between locations on the map
- Building entrances trigger scene transition
- Exits return to overworld at the correct position

### 3. Interior Scenes
- Each building has a simple interior layout (placeholder — can be a single room)
- Interactable spots (shop counter, bed, bar stool, etc.) marked visually
- Exit door returns to overworld

### 4. Map Bridge
```
[STEADY-LIGHT:BRIDGE:MAP]
  Scene: Town Overworld
  Player: (12, 8) facing N
  Buildings: Barn(4,2) Farm(16,4) Weaponsmith(8,12) Bar(14,12) Guild(10,14)
  Nearest exit: Farm entrance (4 tiles N)

[STEADY-LIGHT:BRIDGE:MAP]
  Scene: Barn (interior)
  Player: (3, 4) facing S
  Interactables: Bed(2,2) Door(3,6)
```

### 5. Dev Route
- `/dev/overworld/town` — town map, player can walk around, enter buildings
- `/dev/scene/barn` — barn interior in isolation
- Map bridge enabled by default

## Acceptance Criteria

1. Navigate to `/dev/overworld/town` — town map renders with labeled buildings
2. Player can walk to a building entrance and press Enter — scene transitions to interior
3. Inside a building, player can walk to exit — returns to overworld at correct position
4. Console bridge shows current scene, player position, and nearby interactables
5. Scene transitions logged: `[STEADY-LIGHT:EVENT] {type: "scene-transition", from: "overworld", to: "barn"}`
6. `window.STEADY_LIGHT.getState().scene` reflects current scene

## Notes
- All art is placeholder (colored rectangles, labeled text). Real tiles come during polish.
- The town layout doesn't need to be final — just functional with all required buildings accessible.
- The field where slimes appear should be a distinct area reachable from the farm.
