# Steady Light: Full Game Delivery & Assembly-Line Plan

## Context

Jason wants to build an entire video game using autonomous AI agents. No human writes code, art, or music — agents do everything overnight via Ralph loops, and Jason reviews each morning.

The existing docs cover *what the game is* (design, mechanics, narrative) and *what to build first* (14 Chapter 1 milestones). What's missing is the **factory plan**: for every game system, what format/tool delivers it in the final game, AND what workshop tooling lets agents build, test, and improve it autonomously?

This plan answers both questions for every system, then revises the milestone sequence to incorporate the factory infrastructure.

---

## The Abstract Pattern

Every game system follows this same five-layer structure:

1. **Delivery** — Format/library that ships in the final game
2. **Workshop tool** — Script agents run to create/modify content for that system
3. **Dev route** — Isolated URL where agents test that system without booting the full game
4. **Bridge** — Text-based output that lets agents verify correctness without seeing/hearing
5. **Skill** — `.claude/skills/` doc teaching any fresh-context agent the workflow

If any layer is missing, agents can't work on that system autonomously. All five must exist before a system is "agent-ready."

---

## Tech Stack Decisions (Lock These Now)

These are currently "TBD" in the docs. Locking them prevents every future agent from re-debating.

| Decision | Choice | Why |
|----------|--------|-----|
| **Rendering** | PixiJS v8 (pinned version) | Sprite sheets, animation, texture atlas support out of the box. Raw Canvas 2D means reimplementing all of this. Risk: v8 API docs may have gaps — if FRICTION.md hits pile up, fall back to Canvas 2D. |
| **State management** | Zustand | Stores are plain objects accessible outside React (from game loop, PixiJS callbacks, bridges, `window.STEADY_LIGHT`). React Context requires being inside the component tree. Game engine code runs outside React. |
| **Dialogue format** | ink (via inkjs) | Reads like a screenplay — agents author/edit naturally. Has CLI runner (`inklecate`) for agent playtesting. Has browser runtime (inkjs, 40KB). Supports variables, conditions, tunnels. Custom JSON would reimplement all of this. **Replaces the JSON format in Milestone 02.** |
| **SFX playback** | Howler.js | Audio sprites, codec fallback, volume/fade, mobile unlock. 10KB gzipped. |
| **Music playback** | Raw Web Audio API | Howler abstracts away `AudioContext.currentTime`, which is the ONLY mechanism for sub-ms beat scheduling. Music system needs raw API. SFX system uses Howler. They share an `AudioContext` but never cross-import. |
| **Tilemap format** | Tiled JSON export | Industry standard. PixiJS can render it. Agents can generate/modify it programmatically (it's just arrays of tile indices). |
| **Sprite sheets** | TexturePacker JSON Hash (via free-tex-packer-core) | PixiJS loads this natively. free-tex-packer-core is an npm package — no GUI needed. |

---

## System-by-System Factory Plan

### 1. Dialogue

| Layer | Implementation |
|-------|---------------|
| **Delivery** | inkjs runtime + compiled `.ink.json` files in `assets/dialogue/`. `DialogueRunner.ts` wraps inkjs `Story` class. |
| **Workshop** | `workshop/dialogue/compile-ink.sh` — compiles `.ink` to `.ink.json`, validates syntax. `workshop/dialogue/test-dialogue.sh` — takes an ink file + choice sequence (e.g., `1,2,1`), outputs full transcript of what the player would see. `workshop/dialogue/lint-dialogue.sh` — checks for dead-end knots, missing tags, unused variables. |
| **Dev route** | `/dev/dialogue/:tree` — loads compiled ink, renders dialogue box, accepts choices. `/dev/dialogue/transcript/:tree` — auto-plays with specified choices, dumps transcript to console. |
| **Bridge** | `DialogueBridge.ts` — logs current text, speaker tag, available choices with indices, knot history, variable changes. |
| **Skill** | `.claude/skills/write-dialogue/SKILL.md` — ink syntax conventions, tag format (`# speaker: Farmer`, `# mood: friendly`, `# sfx: coin-clink`), variable naming (`farmer_met`, `drink_count`), file organization (one `.ink` per NPC per chapter), tone rules from narrative docs. |

**Why ink over custom JSON:** An agent improving dialogue reads `-> farmer_explain_work` vs `"next": "farmer_explain_work"`. The ink version reads like a script. The JSON version reads like a database. For a game where dialogue quality IS the product, agents need to work in a format that surfaces story, not structure. ink also handles Chapter 2's conditional branching and Chapter 3's complexity without engine rewrites.

**Agent workflow for "punch up the dialogue":** Agent reads the `.ink` file (it's a screenplay), runs `test-dialogue.sh` with choice sequences to see the transcript, edits the text, recompiles, re-runs transcript, verifies it reads well. No browser needed for the writing pass.

### 2. Audio / SFX

| Layer | Implementation |
|-------|---------------|
| **Delivery** | Howler.js + audio sprites (combined MP3 + JSON seek manifest). Grouped by category: `combat-sprites.mp3`, `footstep-dirt-sprites.mp3`, etc. Individual MP3s for one-offs (flip bell, menu confirm). Lazy-loaded by scene. |
| **Workshop** | Existing: `generate-sfx.sh`, `verify-audio.sh`, `generate-sfx-browser` skill. New: `workshop/audio/split-loop.sh` — takes a long SFX loop (10s of "walking on gravel"), peak-detects silence gaps via sox, splits into N individual variants. This is the efficient path for footstep/ambient variants. New: `workshop/audio/build-sprite.sh` — combines a directory of individual MP3s into one audio sprite + Howler-compatible JSON manifest. New: `workshop/audio/generate-batch.sh` — takes a manifest JSON listing sounds to generate (prompt, filename, duration, variants), generates all, verifies, reports. |
| **Dev route** | `/dev/audio/sfx-test` — lists all loaded SFX by category, play buttons, console logs play events with timing. |
| **Bridge** | `AudioBridge.ts` — logs every SFX play (name, sprite, timestamp), load events, cache misses, inventory of loaded vs missing vs placeholder. |
| **Skill** | Extend existing `generate-sfx-browser` skill with batch workflow, loop-and-split workflow, sprite packing workflow. |

**The split-loop insight (Jason's idea):** Generate one 10-second ElevenLabs loop of "footsteps on wet stone" -> `split-loop.sh` detects 15 silence gaps -> outputs `foot-wet-stone_01.mp3` through `foot-wet-stone_15.mp3` -> `build-sprite.sh` packs them into `footstep-wet-stone-sprites.mp3` + manifest. One generation, fifteen unique variants. When we add a new terrain type, same pipeline: generate loop, split, pack.

### 3. Music / Beat System

| Layer | Implementation |
|-------|---------------|
| **Delivery** | Raw Web Audio API (`AudioBufferSourceNode`). `MusicPlayer.ts` loads/plays/loops tracks. `BPMTracker.ts` fires beat/measure events using `AudioContext.currentTime`. Beat maps: JSON alongside each track with exact beat timestamps, BPM, time signature. `BeatScheduler.ts` pre-schedules events N beats ahead on the audio clock. |
| **Workshop** | `workshop/audio/generate-beatmap.sh` — for constant-BPM tracks, pure math (time = beat * 60/bpm). For variable BPM, uses aubio or librosa for onset detection. `workshop/audio/verify-beatmap.sh` — extracts onsets from the audio file, compares to beat map, reports deviation stats and confidence score. |
| **Dev route** | `/dev/music/click/:bpm` — procedural click track at specified BPM + visual metronome. `/dev/music/track/:name` — real track with beat map overlay. `/dev/music/phase-test` — planning/execution phase transitions. |
| **Bridge** | `TimingBridge.ts` — logs every beat event (measure, beat, AudioContext.currentTime, deviation from ideal), phase transitions, accuracy stats (mean/max deviation, % on-beat). |
| **Skill** | `.claude/skills/manage-music/SKILL.md` — how to add a track (place MP3, generate beat map, verify, register), BPM requirements per combat stage, Web Audio scheduling patterns. |

**Critical:** BPMTracker must NOT use `setInterval` or `requestAnimationFrame`. Must schedule using `AudioContext.currentTime + offset` for sub-ms accuracy. This is the only way to hit the +-5ms target.

### 4. Pixel Art / Sprites

| Layer | Implementation |
|-------|---------------|
| **Delivery** | PixiJS `Spritesheet` from TexturePacker JSON Hash format. Atlas PNGs in `assets/sprites/` (one per category). Animation definitions in JSON (frame sequence, duration, loop). |
| **Workshop** | `workshop/sprites/generate-sprite.sh` — calls image generation API (DALL-E 3 or similar), post-processes with ImageMagick (resize to pixel grid, palette normalize, bg remove). `workshop/sprites/normalize-palette.sh` — remaps all colors to the project's locked palette via ImageMagick. `workshop/sprites/pack-sprites.sh` — runs free-tex-packer-core on a frame directory, outputs atlas PNG + JSON manifest. `workshop/sprites/verify-sprite.sh` — reports dimensions, color count, palette compliance %, transparency. `workshop/sprites/render-ascii.sh` — converts sprite to ASCII art so agents can "see" it. |
| **Dev route** | `/dev/sprites/viewer` — shows all atlases, individual frames, animations. `/dev/animation/viewer` — play animations, adjust frame rate. |
| **Bridge** | `SpriteBridge.ts` — loaded sprites inventory, placeholder vs final status, animation events, missing sprite warnings. |
| **Skill** | `.claude/skills/generate-sprites/SKILL.md` — locked palette hex values, dimension requirements per category, prompt templates, how to generate/normalize/pack/verify. |

**Placeholder strategy:** `workshop/sprites/generate-placeholders.sh` creates colored rectangles with text labels for any missing assets in the manifest. The game always boots, even with zero real art.

### 5. Tile Maps / Level Design

| Layer | Implementation |
|-------|---------------|
| **Delivery** | Tiled JSON maps loaded via custom renderer (reads Tiled JSON, places PixiJS sprites). Layers: ground, objects, collision, interactable. Object layers: NPC spawns, exits/entrances. |
| **Workshop** | `workshop/maps/generate-map.ts` — Node script, takes high-level description (grid dims, building positions, paths, NPC positions, exits), outputs valid Tiled JSON. No GUI needed. `workshop/maps/tiled-to-ascii.sh` — renders each map layer as ASCII with legend. This is the agent's "eyes" for level design. `workshop/maps/validate-map.sh` — all exits resolve, no unreachable areas, collision consistent, NPC spawns on walkable tiles. |
| **Dev route** | `/dev/overworld/:map` — renders map, player walks, collision works. `/dev/maps/viewer/:map` — static view with layer toggles. |
| **Bridge** | `MapBridge.ts` — scene name, dimensions, building/NPC/exit positions. On player move: current tile, nearby interactables, nearest exit. Simplified ASCII of area around player. |
| **Skill** | `.claude/skills/design-map/SKILL.md` — how to use generate-map.ts, layer conventions, tile index standards, town layout reference. |

### 6. Combat Engine

| Layer | Implementation |
|-------|---------------|
| **Delivery** | `CombatRunner.ts`, `ActionQueue.ts`, `BeatSync.ts`, `EnemyAI.ts`, `StatResolver.ts`, `CombatRenderer.ts`. |
| **Workshop** | `workshop/combat/simulate.ts` — headless combat simulator, runs in Node (no browser). Takes player stats, enemy def, optional action sequence. Runs N simulations, reports win rate, avg turns, stat distribution, death causes. `workshop/combat/define-enemy.ts` — JSON schema for enemy behavior patterns, outputs EnemyAI-compatible definitions. |
| **Dev route** | `/dev/combat/stage-0` through `/dev/combat/stage-5`. `/dev/combat/custom` — load custom enemy + player stats via URL params. `/dev/combat/replay/:scenario` — auto-play recorded action sequences. |
| **Bridge** | `CombatBridge.ts` — ASCII grid per turn, action-by-action log, stat changes per interaction, beat timing. |
| **Skill** | `.claude/skills/tune-combat/SKILL.md` — enemy definition format, how to run simulations, balance targets (slime dies in 2-3 turns, player rarely loses). |

### 7. Economy

| Layer | Implementation |
|-------|---------------|
| **Delivery** | `Wallet.ts`, `Shop.ts`, `DailyLedger.ts`, `InventoryManager.ts`. |
| **Workshop** | `workshop/economy/simulate-days.ts` — takes starting silver + player behavior pattern (always drink, buy weapon day 3, etc.), simulates N days, reports silver trajectory and whether the treadmill works (NPC-following player breaks even or slowly bleeds). |
| **Dev route** | `/dev/economy/day-cycle`, `/dev/economy/fast-forward/:days`, `/dev/economy/shop/:name`. |
| **Bridge** | `EconomyBridge.ts` — daily ledger, every transaction, inventory state, rolling 5-day net income. |
| **Skill** | `.claude/skills/tune-economy/SKILL.md` — price tables, treadmill verification criteria, simulation workflow. |

### 8. Scene / Story Flow

| Layer | Implementation |
|-------|---------------|
| **Delivery** | `SceneManager.ts` (scene stack, transitions), `StoryFlow.ts` (chapter progression), `DayNightCycle.ts`, `Reflection.ts`, `FlipMechanic.ts`. |
| **Workshop** | `workshop/story/playthrough-script.ts` — takes a sequence of high-level actions ("talk farmer", "fight slime", "buy drink", "sleep"), runs through game logic headlessly, outputs complete narrative transcript + state at each step. `workshop/story/validate-flow.ts` — static analysis: all scene references resolve, no orphan scenes, every flag set is checked somewhere, every flag checked is set somewhere. |
| **Dev route** | `/dev/integration/full-chapter-1`, `/dev/integration/mid-game`, `/dev/day-cycle/drink-path`, `/dev/day-cycle/sober-path`. |
| **Bridge** | `StoryBridge.ts` — full state dump (day, phase, scene, flags, reflection progress, flip status), scene transition log, daily action summary. |
| **Skill** | `.claude/skills/test-playthrough/SKILL.md` — how to write playthrough scripts, common scenarios (fastest flip, longest loop, all-drink, no-drink). |

### 9-12. Simpler Systems (NPC, Save/Load, Input, UI/HUD)

These don't need dedicated workshop tools — they're standard code work:

- **NPC System** — Behavior defined by ink scripts + map position data. Tested via dialogue dev routes + map dev routes. Bridge: `NPCBridge.ts` (scene NPCs, positions, flags).
- **Save/Load** — localStorage + Zustand serialization. Dev route: `/dev/save/test`. Bridge: logs save/load operations with state diffs.
- **Input** — `InputManager.ts` + `InputMapping.ts`. Tested implicitly through every dev route. Bridge: logs every input event with context.
- **UI/HUD** — React components over PixiJS canvas. Dev routes: `/dev/ui/stat-bars`, `/dev/ui/hud`, `/dev/ui/flip-demo`. Bridge: DebugOverlay IS the visual bridge.

---

## Content Coherence Across Agents

**Problem:** Agent A writes dialogue referencing "a sword costs 5 silver." Agent B sets sword price to 8 silver. Agent C writes reflection text that doesn't match the player's actual experience.

**Solution: Canonical State Manifest** — `docs/canon/state-manifest.json`

Single source of truth for interconnected values:
- All item names, prices, stat effects
- All NPC names and roles
- All flag names and what sets/checks them
- All stat thresholds for stage unlocks
- Silver amounts for income/expenses

Workshop tools and agents reference this file. Dialogue agents read prices from it. Economy agents update it when changing prices. `workshop/canon/validate-canon.sh` checks ink files, economy configs, and enemy definitions for consistency against the manifest.

---

## Integration Testing

Canonical playthrough scripts verify the full game works end-to-end:

- `playthroughs/optimal.json` — fastest Chapter 1 path (skip drinks, flip one stat, leave)
- `playthroughs/treadmill.json` — follow NPC advice for 10 days (verify treadmill)
- `playthroughs/edge-broke.json` — run out of money
- `playthroughs/all-flips.json` — flip all three stats before leaving

Run as part of Milestone 12. Add new scripts as content is written. In-browser, Chrome DevTools MCP can automate playthroughs via `window.STEADY_LIGHT.runScenario()`.

---

## Agent Onboarding

A fresh-context agent starts every session by reading CLAUDE.md (auto-loaded) and skill descriptions (auto-loaded). To zero in on a specific system:

1. Read the relevant milestone doc for acceptance criteria
2. Read the relevant skill for workflow specifics
3. Go to the relevant dev route to see current state
4. Use workshop tools to create/test content
5. Verify via bridges

Each milestone doc should include a "Context You Need" header listing: source files to modify, systems you depend on, workshop tools available. CLAUDE.md should include a "Quick Start" section: `npm run dev`, `/dev` index, `window.STEADY_LIGHT.getState()`, bridge toggles.

---

## Revised Milestone Sequence

### Addition: Milestone 00a — Workshop Foundation

Before the game scaffolding, build the tools agents need from night one:

**Deliverables:**
- Install inklecate (ink compiler) + `workshop/dialogue/compile-ink.sh` + `workshop/dialogue/test-dialogue.sh`
- `workshop/maps/tiled-to-ascii.sh`
- `workshop/sprites/pack-sprites.sh` (with free-tex-packer-core)
- `workshop/audio/split-loop.sh` + `workshop/audio/build-sprite.sh`
- `docs/canon/state-manifest.json` (initial version)
- `workshop/canon/validate-canon.sh`
- All corresponding skills in `.claude/skills/`

**Rationale:** Agents from Milestone 01 onward need these tools. Building them first means the factory floor has tools on it before the first assembly worker arrives.

### Addition: Type Foundation (fold into Milestone 00)

Define all shared TypeScript types BEFORE any game code:

- `src/core/types.ts` — complete type definitions for `GameState`, `PlayerState`, `CombatState`, `EconomyState`, `DialogueState`, all enums (`StatName`, `SceneName`, `Action`, `Direction`), all event types
- All Zustand store slices typed

**Rationale:** Types are the contract between systems built by different agents on different nights. Without them upfront, every agent invents their own interfaces and Milestone 12 integration becomes a type-mismatch nightmare.

### Updated Milestone 02

Replace custom JSON dialogue with ink/inkjs. `DialogueRunner` wraps inkjs `Story` class. Dev route loads compiled `.ink.json`. Bridge reads `currentText`, `currentChoices`, `currentTags`.

### Full Revised Sequence

```
00a  Workshop Foundation ............. tools, skills, canon manifest
 00  Project Scaffolding ............. React/TS/Vite, types, Zustand, dev routes, bridges
 01  Grid & Movement ................. 8x8 grid, player token, ASCII bridge
 02  Dialogue System ................. ink/inkjs, dialogue box, dialogue bridge
 03  Character Creation .............. stat allocation UI, inverse mapping deception
 04  Scene Manager & Town ............ scene transitions, overworld, interiors
 05  NPC System ...................... entities, interaction, farmer dialogue
 06  Basic Combat (Stage 0) ......... action queue, execution, slime AI, combat bridge
 07  Economy System .................. silver, shops, rent, treadmill
 08  Day Cycle & Sleep ............... time phases, drink fork, sleep logic
 09  Reflection & Flip ............... three-night arcs, flip event, UI relabel
 10  Music & Beat System ............. Web Audio, BPM tracking, timing bridge (parallel track)
 11  Combat + Music Integration ...... beat-synced actions, simultaneous resolution
 12  Chapter 1 Integration ........... full flow, save/load, playthrough verification
13a  Content: Dialogue & Economy ..... all NPC dialogue, price tuning
13b  Content: Paradigm Shift Polish .. flip moments, combat stage transitions, edge cases
13c  Content: Asset Replacement ...... placeholder art -> generated art, placeholder SFX -> real SFX
```

Music (10) can start in parallel after 00. Dialogue (02) and Character Creation (03) can run in parallel. 13a-13c can run in parallel.

---

## Scaling Beyond Chapter 1

Systems built for Chapter 1 that pay forward without rewrites:

| System | Ch1 | Ch2+ Change |
|--------|-----|-------------|
| ink dialogue | Basic trees | Add variables, conditions, game-state branches — same engine |
| Combat engine | Stage 0 | Stages 1-5 are config (new enemy defs, new AI patterns) — same engine |
| Economy | Town loop | Different numbers, same Wallet/Shop/Ledger code |
| Beat system | 4/4 constant BPM | 3/4, 6/8, variable BPM = config changes in beat maps |
| Map tools | Town + interiors | Same Tiled JSON pipeline, new tilesets |
| Playthrough runner | Ch1 flow | Longer scripts, same runner |
| Asset pipeline | Town assets | Same generate/normalize/pack/verify pipeline |

**Chapter 3 (AI dialogue) is the one system that requires a new delivery mechanism.** Design `DialogueRunner` with a swappable backend now — `DialogueBox.tsx` receives text and choices and doesn't care if they come from inkjs or Claude API.

---

## Key Risks

| Risk | Mitigation |
|------|-----------|
| PixiJS v8 API friction (new, docs may have gaps) | Pin version, add Pixi-specific notes to CLAUDE.md. If FRICTION.md hits pile up, fall back to Canvas 2D. |
| Web Audio timing accuracy (+-5ms target) | Build verification into TimingBridge. Test early in Milestone 10 dev route. Fallback: AudioWorklet for separate-thread scheduling. |
| AI-generated art inconsistency | Palette normalization tool. Strict dimensions. Accept Ch1 art is rough; plan a 13c polish pass. |
| Integration complexity at Milestone 12 | Zustand store is single source of truth. Types defined upfront. EventBus for cross-system events. Canonical playthrough scripts catch regressions. |
| Overnight session exceeds one milestone | Each milestone has "checkpoint" states where the project is working even if incomplete. Agent commits at checkpoint, next agent continues. |

---

## Docs to Update After Approval

- `docs/technical/project-structure.md` — lock tech stack (PixiJS v8, Zustand, inkjs, Howler, Tiled JSON), add `docs/canon/` dir, expand workshop structure
- `docs/technical/architecture.md` — replace "TBD" stack section with locked decisions, add Howler/Web Audio split explanation
- `docs/roadmap/chapter-1/milestones/02-dialogue-system.md` — rewrite for ink/inkjs instead of custom JSON
- `docs/roadmap/chapter-1/milestones/00-project-scaffolding.md` — add type foundation, lock Zustand
- `docs/roadmap/chapter-1/overview.md` — add milestone 00a, split milestone 13
- `CLAUDE.md` — add Quick Start section, pinned PixiJS version, ink conventions
- New: `docs/roadmap/chapter-1/milestones/00a-workshop-foundation.md`

---

## Verification

After implementation begins, verify the factory works by checking:

1. Every dev route boots independently (`/dev/dialogue/test`, `/dev/combat/stage-0`, etc.)
2. Every bridge produces readable output an agent can parse
3. Every workshop tool runs without errors and produces expected output
4. `workshop/canon/validate-canon.sh` passes
5. At least one canonical playthrough script runs end-to-end by Milestone 12
6. Fresh agent can pick up a milestone doc, read the skill, and start producing work without asking Jason questions
