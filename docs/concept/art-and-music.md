---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: medium
---

# Art & Music Direction

## Art Style

Low-signal pixel art. 8-bit/16-bit RPG Maker aesthetic — intentionally generic to lull the player into familiarity.

### Palette
- Muted earths + two accent highlights
- Low saturation
- Dusk golds, cool interiors
- Rural feel: worn wood, cheap signage, scuffed tile, cornfields

### Rules
- Clear, readable silhouettes
- Thick clustering, avoid noisy dithering unless intentional mood
- 32-64 px tile scale
- Plenty of negative space
- UI: 1-2 px stroke, high contrast, generous padding, no skeuomorphism

### Environment Progression
- **Early:** Abstract (white grid for combat, simple overworld)
- **Mid:** More detailed overworld, combat in real environments
- **Late:** Full environmental detail, terrain impacts gameplay

### Asset Generation Prompts (for AI art tools)
- **Enemy (green slime):** "Low-signal pixel art slime, soft green gel body, single highlight, 32-64 px, alpha background, muted rural palette, clean silhouette, readable at small size, slight light-from-left, no outline clutter."
- **Cornfield tile:** "Pixel art corn rows at dusk, muted yellows/greens, subtle texture bands, 16 px tile repeatable, low contrast, alpha background."
- **UI panel:** "Minimal pixel UI panel, 1-2 px border, high-contrast text area, soft drop shadow, neutral gray fill, fits 3 lines of text, 240 px width baseline."

---

## Music

Music is **mechanically critical** — it IS the combat clock. This isn't ambient decoration.

### Early Game
- 4/4 time signature, 84-96 BPM
- Soft metronome embedded in percussion (brushed snare)
- Gentle arpeggio synth, upright bass pulse
- Subtle tape hiss
- Bar-divider shimmer at measure 4
- Loopable

### Flip Moments
- Tonal shift + sparse instrumentation
- Single pure bell + subtle UI whoosh

### Late Game
- Odd meters (3/4, 6/8) — breaks rhythm habits
- More complex layering
- Reactive to combat state (TBD)

### Diegetic Tie-ins
- Bar ambience: warm
- Bed ambience: cool
- Reflection: low breath pad

### Music Brief (Early Fight)
"4/4, 88 BPM, brushed snare metronome, gentle arpeggio synth, upright bass pulse, subtle tape hiss, bar-divider shimmer at measure 4, loopable."

---

## Open Questions
- AI music generation: is it good enough now? Tools to evaluate?
- How to procedurally shift time signatures during combat?
- Asset pipeline for browser: sprite sheets? Individual PNGs? Tiled maps?
- Can we use open-source/CC0 asset packs as a starting point?
