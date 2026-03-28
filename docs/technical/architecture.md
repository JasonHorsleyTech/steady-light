---
last_reviewed: 2026-03-28
design_confidence: high
implementation_confidence: high
---

# Technical Architecture

## Why Browser-Based

Previous attempts used Godot — failed due to learning curve and no Claude integration. This iteration is browser-based because:

1. **Claude can test it.** Chrome DevTools MCP server gives Claude the ability to launch pages, read console logs, take screenshots, click elements, and evaluate JS.
2. **Closed loop development.** Claude writes code → tests it → sees errors → fixes them. No human needed for basic iteration.
3. **Home turf.** Jason is a web developer. No engine learning curve.

## Tech Stack (Locked)

| System | Choice | Why |
|--------|--------|-----|
| **Language** | TypeScript (strict, everywhere) | Type safety helps AI agents understand and modify code correctly. No JavaScript, ever. |
| **UI Framework** | React 19 | Component model maps to dev routes. React handles UI layers (menus, dialogue, debug) over PixiJS canvas. |
| **Build** | Vite 8 | Fast dev server, HMR, simple config. `import.meta.env.DEV` for dev-only code stripping. |
| **Rendering** | PixiJS v8 (pinned ~8.17.1) | Sprite sheets, animation, texture atlas support out of the box. Pin version for stability — v8 API docs may have gaps. If FRICTION.md hits pile up, fall back to Canvas 2D. |
| **State Management** | Zustand (vanilla) | Plain object stores accessible outside React — from game loop, PixiJS callbacks, bridges, `window.STEADY_LIGHT`. React Context requires being inside the component tree; game engine code runs outside React. |
| **Dialogue** | ink (via inkjs) | Reads like a screenplay — agents author/edit naturally. Has CLI compiler (inklecate) for agent playtesting. Has browser runtime (inkjs, 40KB). Supports variables, conditions, tunnels. |
| **SFX Playback** | Howler.js | Audio sprites, codec fallback, volume/fade, mobile unlock. 10KB gzipped. |
| **Music Playback** | Raw Web Audio API | Howler abstracts away `AudioContext.currentTime`, which is the ONLY mechanism for sub-ms beat scheduling. Music system needs raw API. SFX system uses Howler. They share an `AudioContext` but never cross-import. |
| **Tilemap Format** | Tiled JSON export | Industry standard. PixiJS can render it. Agents can generate/modify it programmatically (it's just arrays of tile indices). |
| **Sprite Sheets** | TexturePacker JSON Hash (via free-tex-packer-core) | PixiJS loads this natively. free-tex-packer-core is an npm package — no GUI needed. |
| **Routing** | React Router | Dev routes at `/dev/*`, game at `/`. Dev routes lazy-loaded and tree-shaken from production. |

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

## Audio Architecture

Music is mechanically critical — it's the combat clock. Two separate audio systems share one `AudioContext`:

### Music (Raw Web Audio API)
- `MusicPlayer.ts` — loads/plays/loops tracks via `AudioBufferSourceNode`
- `BPMTracker.ts` — fires beat/measure events using `AudioContext.currentTime` (NOT `setInterval` or `requestAnimationFrame`)
- `BeatScheduler.ts` — pre-schedules events N beats ahead on the audio clock for sub-ms accuracy
- Beat maps: JSON alongside each track with exact beat timestamps, BPM, time signature

### SFX (Howler.js)
- Audio sprites (combined MP3 + JSON seek manifest) for grouped SFX
- Individual MP3s for one-offs (flip bell, menu confirm)
- Lazy-loaded by scene

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
- Input handling: keyboard primary? Mouse? Both?
- Mobile support? (Probably not for v1)
