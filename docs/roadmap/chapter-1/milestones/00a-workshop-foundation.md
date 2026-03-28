---
last_reviewed: 2026-03-25
design_confidence: high
implementation_confidence: high
---

# Milestone 00a — Workshop Foundation

## Purpose

Build the factory floor before the first assembly worker arrives. Every agent from Milestone 00 onward needs these tools to create, test, and validate game content autonomously.

## Status: COMPLETE

Completed 2026-03-25.

## Deliverables

### Workshop Tools

| Tool | Path | Status |
|------|------|--------|
| Ink compiler | `workshop/dialogue/compile-ink.ts` | Done |
| Dialogue playtester | `workshop/dialogue/test-dialogue.ts` | Done |
| Dialogue linter | `workshop/dialogue/lint-dialogue.ts` | Done |
| Tiled map → ASCII | `workshop/maps/tiled-to-ascii.ts` | Done |
| Sprite packer | `workshop/sprites/pack-sprites.ts` | Done |
| Audio loop splitter | `workshop/audio/split-loop.sh` | Done |
| Audio sprite builder | `workshop/audio/build-sprite.sh` | Done |
| Canon validator | `workshop/canon/validate-canon.sh` | Done |
| SFX generator (API) | `workshop/audio/generate-sfx.sh` | Done (pre-existing) |
| SFX verifier | `workshop/audio/verify-audio.sh` | Done (pre-existing) |

### Canon & Content

| Deliverable | Path | Status |
|------------|------|--------|
| State manifest | `docs/canon/state-manifest.json` | Done (v1) |
| Sample dialogue | `assets/dialogue/farmer.ink` | Done |
| Sample map | `assets/maps/test-town.json` | Done |

### Skills

| Skill | Path | Status |
|-------|------|--------|
| Write Dialogue | `.claude/skills/write-dialogue/SKILL.md` | Done |
| Design Map | `.claude/skills/design-map/SKILL.md` | Done |
| Generate Sprites | `.claude/skills/generate-sprites/SKILL.md` | Done |
| Manage Audio | `.claude/skills/manage-audio/SKILL.md` | Done |
| Validate Canon | `.claude/skills/validate-canon/SKILL.md` | Done |
| Generate SFX (Browser) | `.claude/skills/generate-sfx-browser/SKILL.md` | Done (pre-existing) |

### Infrastructure

| Item | Status |
|------|--------|
| `package.json` with workshop deps | Done |
| `tsconfig.json` | Done |
| TypeScript mandate in CLAUDE.md | Done |

## Verification

All tools tested and working:

```bash
# Compile ink
npx tsx workshop/dialogue/compile-ink.ts assets/dialogue/farmer.ink
# → COMPILE OK

# Playtest dialogue
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "0,1"
# → Full transcript with choices

# Lint dialogue
npx tsx workshop/dialogue/lint-dialogue.ts assets/dialogue/farmer.ink
# → LINT OK (1 warning: unused drink_count, expected)

# View map as ASCII
npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/test-town.json
# → ASCII grid with ground, collision, and object layers

# Validate canon
bash workshop/canon/validate-canon.sh
# → VALIDATION PASSED (warnings for unwritten NPC dialogues)
```

## What's Next

Milestone 00 — Project Scaffolding:
- React + Vite + TypeScript project setup
- Zustand state management
- Core type definitions (`src/core/types.ts`)
- Dev route infrastructure
- Bridge framework
- Debug logging system
