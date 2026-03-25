---
description: "Design and verify tile maps using Tiled JSON format. Convert maps to ASCII for agent-readable visualization."
---

# Design Map

Create and verify tile maps for Steady Light using the Tiled JSON format. Agents generate maps programmatically (no GUI needed) and visualize them as ASCII.

## Quick Start

```bash
# View a map as ASCII
npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/town.json

# View a specific layer
npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/town.json --layer collision

# View with tile legend
npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/town.json --legend
```

## Tiled JSON Format

Maps are standard Tiled JSON exports. Agents generate them directly — it's just arrays of tile indices.

### Minimal Map Structure
```json
{
  "width": 20,
  "height": 15,
  "tilewidth": 32,
  "tileheight": 32,
  "layers": [
    {
      "name": "ground",
      "type": "tilelayer",
      "width": 20,
      "height": 15,
      "visible": true,
      "data": [1, 1, 1, ...]
    },
    {
      "name": "collision",
      "type": "tilelayer",
      "width": 20,
      "height": 15,
      "visible": false,
      "data": [0, 0, 17, ...]
    },
    {
      "name": "objects",
      "type": "objectgroup",
      "visible": true,
      "objects": [
        { "name": "farmer", "type": "npc", "x": 160, "y": 128, "width": 32, "height": 32 }
      ]
    }
  ],
  "tilesets": [
    { "firstgid": 1, "source": "town-tileset.json" }
  ]
}
```

### Layer Conventions
| Layer Name | Type | Purpose |
|-----------|------|---------|
| `ground` | tilelayer | Base terrain (grass, dirt, stone, water) |
| `objects` | tilelayer | Buildings, furniture, decorations |
| `collision` | tilelayer | Impassable tiles (walls, water edges) |
| `interactable` | objectgroup | NPCs, exits, interactable objects |

### Tile Index Ranges (ASCII mapping)
| Range | Meaning | ASCII Char |
|-------|---------|-----------|
| 0 | Empty | `.` |
| 1-16 | Ground (walkable) | ` ` (space) |
| 17-32 | Walls/buildings | `#` |
| 33-48 | Objects/furniture | `o` |
| 49-64 | Water/hazards | `~` |
| 65-80 | Decorations | `*` |
| 81-96 | Trees/nature | `T` |
| 97-112 | Elevation | `^` |

### Object Layer Properties
Objects in the `interactable` layer use custom properties:
```json
{
  "name": "farmer",
  "type": "npc",
  "x": 160,
  "y": 128,
  "width": 32,
  "height": 32,
  "properties": [
    { "name": "dialogue_file", "value": "farmer.ink", "type": "string" },
    { "name": "facing", "value": "south", "type": "string" }
  ]
}
```

Object types: `npc`, `exit`, `chest`, `sign`, `door`

## Workflow

### Creating a new map
1. Decide dimensions and layout
2. Write the Tiled JSON directly (see structure above)
3. Verify with ASCII view: `npx tsx workshop/maps/tiled-to-ascii.ts map.json`
4. Check each layer: `--layer ground`, `--layer collision`, `--layer interactable`
5. Verify all exits resolve, NPCs are on walkable tiles, collision is consistent

### Map design tips
- Keep town maps small (20x15 to 30x20) — the game is about interaction, not exploration
- Every building entrance should have an exit object pointing to the interior map
- NPCs must be placed on walkable tiles (not inside collision)
- Collision layer should fully enclose water/building interiors
- Put object layer objects at exact tile positions (x = tileX * tilewidth)

### Town layout reference
```
  Farm field (north) — slime encounters
  |
  Farm/Barn (north-center)
  |
  Town square (center) — hub connecting all buildings
  |-- Weapon shop (west)
  |-- Armor shop (east)
  |-- Fighters Guild (northwest)
  |-- Bar (southeast)
  |-- Bank (southwest)
  |-- Road south (exit to wilds)
```
