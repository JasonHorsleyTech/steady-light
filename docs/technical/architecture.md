---
last_reviewed: 2026-03-24
design_confidence: medium
implementation_confidence: medium
---

# Technical Architecture

## Why Browser-Based

Previous attempts used Godot — failed due to learning curve and no Claude integration. This iteration is browser-based because:

1. **Claude can test it.** Chrome DevTools MCP server gives Claude the ability to launch pages, read console logs, take screenshots, click elements, and evaluate JS.
2. **Closed loop development.** Claude writes code → tests it → sees errors → fixes them. No human needed for basic iteration.
3. **Home turf.** Jason is a web developer. No engine learning curve.

## Tech Stack (TBD)

Candidates:
- **Vanilla JS + Canvas** — Simplest, most controllable, Claude can understand every line
- **Phaser.js** — Established 2D game framework, good RPG support, handles sprites/tilemaps/audio
- **PixiJS** — Fast 2D rendering, good middle ground between vanilla and full framework

Decision criteria: whatever gives Claude the most visibility into game state via console logs and the simplest path to getting the combat loop running.

Previous iteration mentioned Vue.js + TypeScript. Still viable if we want component-based UI for menus/dialogue/inventory layered over a canvas game view.

## Debug & Breadcrumb System (Critical)

The game MUST have extensive structured logging. This is Claude's "eyes."

### Log Format
```
[STEADY-LIGHT:STATE]  — Game state snapshots (scene, phase, stats, position)
[STEADY-LIGHT:EVENT]  — Discrete events (stat change, action queued, action executed)
[STEADY-LIGHT:COMBAT] — Combat-specific (beat number, queued actions, execution results)
[STEADY-LIGHT:NPC]    — Dialogue state (NPC name, dialogue ID, text shown)
[STEADY-LIGHT:ECON]   — Economy events (silver earned/spent, balance, auto-drafts)
[STEADY-LIGHT:DEBUG]  — Internal state for troubleshooting
```

### Debug Overlay
Toggleable overlay showing:
- Current scene / phase
- All three stats (Drive/Insight/Stability) with real values
- Current beat / measure in combat
- Player position on grid
- Active quests / flags
- Economy balance

### Requirements
- All state changes logged before they happen
- Error boundaries that log to console rather than silently failing
- Game state queryable from browser console (e.g., `window.STEADY_LIGHT.getState()`)

## Asset Strategy

Generic RPG pixel art, 32-64 px tile scale. Sources:
- AI-generated via PixelLab or similar (with alpha backgrounds)
- Open-source / CC0 asset packs as base
- Aseprite for cleanup and palette control
- Sprite sheets for animation

### What We Need
- Character sprites (player, NPCs)
- Slime enemies (green, blue variants)
- Town tileset (barn, shops, guild, bar, bank, homes)
- Cornfield / farm tileset
- Wilds / road tileset
- Abstract white grid (combat early game)
- UI elements (stat bars, menus, dialogue boxes, queue indicators)
- NPC portraits (optional — may use dialogue-only)

## Audio Pipeline

Music is mechanically critical — it's the combat clock.

- Need loopable tracks at specific BPMs (84-96 early)
- Need to programmatically sync game events to beat positions
- Web Audio API for precise timing
- AI music generation tools may be viable now (evaluate Suno, Udio, etc.)
- SFX: minimal, functional (hit, block, dodge, menu confirm/cancel, flip bell)

## Save System

TBD. Likely localStorage for browser. Need to serialize:
- Player stats (all three, plus flip status for each)
- Inventory / equipment
- Economy state (silver, debts)
- Quest flags / NPC relationship stats
- Current act / scene
- Combat stage unlocks

## Build & Deploy

- Dev server: Vite (fast, simple, good HMR)
- Deploy: static host (Netlify/Vercel/GitHub Pages) for playtesting
- No backend needed (unless we add the AI dialogue system in Act 3)

## Open Questions
- Framework decision needed before implementation starts
- How to handle sprite sheet loading and animation
- Web Audio API vs. Howler.js for audio with beat sync
- How to represent the 8x8 grid + movement system
- Input handling: keyboard primary? Mouse? Both?
- Mobile support? (Probably not for v1)
