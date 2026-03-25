---
description: "Generate, normalize, and pack sprite sheets for the game. Includes palette enforcement and ASCII preview for agents."
---

# Generate Sprites

Generate pixel art sprites, normalize them to the project palette, and pack them into texture atlases for PixiJS.

## Quick Start

```bash
# Pack frames into an atlas
npx tsx workshop/sprites/pack-sprites.ts assets/sprites/slime/frames assets/sprites/slime --name slime

# Output: slime.png (atlas) + slime.json (PixiJS-compatible manifest)
```

## Sprite Packing

The packer uses free-tex-packer-core to combine individual PNG frames into a single atlas with a JSON manifest in TexturePacker JSON Hash format (PixiJS loads this natively).

```bash
# Basic usage — pack all PNGs in a directory
npx tsx workshop/sprites/pack-sprites.ts <frame-directory> [output-directory] [--name <atlas-name>]

# Examples
npx tsx workshop/sprites/pack-sprites.ts assets/sprites/player/walk assets/sprites/player --name player-walk
npx tsx workshop/sprites/pack-sprites.ts assets/sprites/slime/frames assets/sprites/slime --name green-slime
```

### Frame naming convention
Name frames sequentially: `frame_001.png`, `frame_002.png`, etc. The packer sorts alphabetically, so zero-padded numbers ensure correct order.

For animations: `walk_down_001.png`, `walk_down_002.png`, `walk_left_001.png`, etc.

## Sprite Specifications

### Dimensions by category
| Category | Frame Size | Notes |
|----------|-----------|-------|
| Characters | 32x32 or 32x48 | 32x32 for overworld, 32x48 for combat (taller) |
| Enemies | 32x32 to 64x64 | Slimes 32x32, bosses up to 64x64 |
| Tiles | 32x32 | Must match tilewidth/tileheight in maps |
| UI elements | Variable | Power-of-two preferred |
| Items | 16x16 | Inventory icons |

### Palette (locked)
The project uses a constrained pixel art palette. All sprites must use only these colors. Exact hex values TBD — will be locked when art direction is finalized.

For now: use any 16-color palette that reads well at 32x32. GameBoy-style 4-color palettes are fine for prototyping.

### Transparency
- All sprites must have transparent backgrounds (PNG alpha channel)
- No colored backgrounds — the game composites sprites over the tilemap

## Placeholder Strategy

Until real art is generated, use colored rectangles with text labels:
- Player: blue rectangle, "P" label
- Slime: green rectangle, "S" label
- NPC: yellow rectangle, first letter of name
- Items: small colored square

Placeholders should be the correct dimensions so layout/positioning work is accurate even before real art arrives.

## File Organization

```
assets/sprites/
  player/
    frames/          — individual animation frames
    player-walk.png  — packed atlas
    player-walk.json — atlas manifest
  enemies/
    slime/
      frames/
      green-slime.png
      green-slime.json
  npcs/
    farmer/
      frames/
      farmer.png
      farmer.json
  ui/
    stat-bars/
    menus/
  tiles/
    town-tileset.png
    town-tileset.json
```

## Workflow

### Generating new sprites (with AI image generation)
1. Use an image generation API (DALL-E, etc.) with a specific prompt
2. Post-process with ImageMagick: resize to pixel grid, remove background
3. Apply palette normalization (when palette tool exists)
4. Verify dimensions and transparency
5. Pack into atlas

### Packing workflow
1. Put all frames for one animation/category in a directory
2. Run `pack-sprites.ts` with a meaningful atlas name
3. Verify the output JSON references the correct frame names
4. The atlas PNG + JSON pair is what PixiJS loads at runtime

### Adding placeholder art
For rapid prototyping, generate colored rectangles with ImageMagick:
```bash
# 32x32 blue player placeholder
convert -size 32x32 xc:blue -fill white -gravity center -pointsize 16 -annotate 0 "P" player_idle.png

# 32x32 green slime placeholder
convert -size 32x32 xc:green -fill white -gravity center -pointsize 12 -annotate 0 "S" slime_idle.png
```
