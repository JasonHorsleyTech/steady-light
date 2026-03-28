---
description: "Manage game audio: generate SFX (API or browser), split loops into variants, build Howler.js audio sprites. Full pipeline from generation to game-ready."
---

# Manage Audio

Generate, process, and package audio for Steady Light. Covers the full pipeline from sound generation through to Howler.js-ready audio sprites.

## Quick Start

```bash
# Generate a sound effect via API
./workshop/audio/generate-sfx.sh "sword hitting jelly monster" hit-slime.mp3 1.0

# Generate via browser (higher quality, see generate-sfx-browser skill)
# Use the /generate-sfx-browser skill for browser-based generation

# Split a long loop into individual variants
npx tsx workshop/audio/split-loop.ts footsteps-wet-stone.mp3 assets/audio/sfx/footsteps --prefix foot-wet-stone

# Combine variants into a Howler.js audio sprite
npx tsx workshop/audio/build-sprite.ts assets/audio/sfx/footsteps/ --output footstep-wet-stone-sprites

# Verify any audio file
./workshop/audio/verify-audio.sh hit-slime.mp3
```

## Tools Overview

### generate-sfx.sh — API Sound Generation
Generates sound effects via the ElevenLabs API. Fast but lower quality than browser method.

```bash
./workshop/audio/generate-sfx.sh "description" [output.mp3] [duration_seconds] [variants]

# Best of 4 variants (recommended for important sounds)
./workshop/audio/generate-sfx.sh "sword clang" sword.mp3 1.0 4
```

- Requires `ELEVEN_LABS_UNRESTRICTED_API_KEY` in `.env`
- Uses opus_48000_128 format (matches web UI), converts to MP3
- Auto-trims silence and normalizes
- When variants > 1, keeps the one with highest RMS amplitude

### generate-sfx-browser skill — Browser Sound Generation
Higher quality generation via the ElevenLabs web UI. Use the `/generate-sfx-browser` skill.
Always generates 4 variants. Requires Chrome DevTools MCP.

### split-loop.ts — Loop Splitting
Splits a long audio file into individual sound variants by detecting silence gaps.

```bash
npx tsx workshop/audio/split-loop.ts <input> [output-dir] [--prefix name] [--threshold dB] [--min-silence sec]
```

**The key workflow:** Generate one long loop (e.g., 10s of "footsteps on wet stone"), split it into 10-15 individual footstep sounds. One API call, many usable variants.

Options:
- `--prefix`: output filename prefix (default: input filename)
- `--threshold`: silence detection in dB (default: -35, higher = more sensitive)
- `--min-silence`: minimum gap to count as silence in seconds (default: 0.05)

### build-sprite.ts — Audio Sprite Builder
Combines multiple MP3 files into a single audio sprite + Howler.js JSON manifest.

```bash
npx tsx workshop/audio/build-sprite.ts <dir-or-files> [--output name] [--gap ms] [--outdir dir]
```

Output is two files:
- `<name>.mp3` — combined audio sprite
- `<name>.json` — Howler.js manifest with start/duration for each sound

The JSON manifest format:
```json
{
  "src": ["combat-sprites.mp3"],
  "sprite": {
    "hit-slime": [0, 1200],
    "block": [1250, 800]
  }
}
```

### verify-audio.sh — Audio Verification
Verifies an audio file is valid, non-silent, and has reasonable properties. Outputs structured text for agent consumption.

```bash
./workshop/audio/verify-audio.sh hit-slime.mp3
```

## Workflows

### New sound effect (one-off)
```bash
# Generate
./workshop/audio/generate-sfx.sh "short digital menu click" assets/audio/sfx/ui/menu-click.mp3 0.5 4

# Verify
./workshop/audio/verify-audio.sh assets/audio/sfx/ui/menu-click.mp3
```

### Footstep/ambient variants (loop-and-split)
```bash
# 1. Generate a long loop
./workshop/audio/generate-sfx.sh "footsteps on wet stone floor in a dungeon, continuous walking" /tmp/foot-wet-stone-loop.mp3 10.0

# 2. Split into individual steps
npx tsx workshop/audio/split-loop.ts /tmp/foot-wet-stone-loop.mp3 assets/audio/sfx/footsteps --prefix foot-wet-stone

# 3. Pack into audio sprite
npx tsx workshop/audio/build-sprite.ts assets/audio/sfx/footsteps/ --output footstep-wet-stone-sprites --outdir assets/audio/sfx/footsteps
```

### Combat SFX pack
```bash
# Generate individual sounds
./workshop/audio/generate-sfx.sh "sword hitting jelly" assets/audio/sfx/combat/hit-slime.mp3 1.0 4
./workshop/audio/generate-sfx.sh "wooden shield blocking attack" assets/audio/sfx/combat/block.mp3 0.8 4
./workshop/audio/generate-sfx.sh "quick dodge whoosh" assets/audio/sfx/combat/dodge.mp3 0.5 4

# Pack into combat sprite
npx tsx workshop/audio/build-sprite.ts assets/audio/sfx/combat/ --output combat-sprites --outdir assets/audio/sfx/combat
```

## File Organization

```
assets/audio/
  sfx/
    ui/              — menu clicks, confirmations, navigation
    combat/          — hits, blocks, dodges, chains
    ambient/         — tavern, outdoors, night
    system/          — game start, save, load
    footsteps/       — terrain-specific variants
  music/
    tracks/          — music MP3 files
    beatmaps/        — beat timing JSON files
```

## Audio Requirements

| Category | Format | Sample Rate | Bitrate | Duration |
|----------|--------|------------|---------|----------|
| SFX (impacts) | MP3 | 44.1kHz | 128kbps | 0.3-2.0s |
| SFX (ambient) | MP3 | 44.1kHz | 128kbps | 3.0-10.0s |
| Music | MP3 | 44.1kHz | 192kbps | 30-120s loop |
| Audio sprites | MP3 | 44.1kHz | 128kbps | Combined |

All SFX are post-processed: silence-trimmed and peak-normalized to 0dB.
