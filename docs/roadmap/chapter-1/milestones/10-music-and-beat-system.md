---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: medium
---

# Milestone 10: Music & Beat System

## Goal
Build the audio playback system with precise BPM tracking. This is the temporal backbone of combat — music IS the clock. Build the timing bridge so an AI agent can verify beat accuracy without hearing anything.

**This milestone can be built in parallel with Milestones 01-09** since it's independent until integration at Milestone 11.

## Depends On
- Milestone 00 (Project Scaffolding)

## Deliverables

### 1. Music Player
- Web Audio API based playback
- Load and loop audio tracks
- Configurable BPM (default 88)
- Time signature (default 4/4)
- Precise playback position tracking

### 2. BPM Tracker
- Calculates exact beat positions from BPM and time signature
- Fires events: `beat`, `measure-start`, `measure-end`, `bar-4-start` (execution bar)
- Events include: beat number, measure number, timestamp, deviation from ideal
- Compensates for audio API timing jitter

### 3. Planning/Execution Phase Sync
- Bars 1-3: planning phase (input accepted)
- Bar 4 (final bar): execution phase (actions play out)
- Phase transitions fire events: `phase-planning`, `phase-execution`
- Planning phase can extend (loop bars 1-3 until player confirms) in early game

### 4. Timing Bridge
The critical bridge — translates millisecond timing into readable beat accuracy:

```
[STEADY-LIGHT:BRIDGE:TIMING]
  Track: "early-combat-88bpm" | BPM: 88 | Sig: 4/4
  Measure: 2 | Phase: planning
  --- Beat Log (last measure) ---
  M1:B1 0.000ms — ON BEAT
  M1:B2 681.8ms — ON BEAT (0.2ms late)
  M1:B3 1363.6ms — ON BEAT (0.1ms early)
  M1:B4 2045.5ms — ON BEAT
  --- Threshold ---
  ON BEAT: ±5ms | CLOSE: ±15ms | OFF: >15ms
  --- Phase Transitions ---
  Planning started: M2:B1 (2727.3ms)
  Execution scheduled: M2:B4 (4090.9ms)
```

### 5. Placeholder Audio
- Generate a simple metronome click track at 88 BPM (can be procedural via Web Audio oscillator)
- Different click sound on beat 1 of each measure
- Different sound on bar 4 (execution bar) — slightly louder or different pitch
- No real music needed yet — just a reliable click track for timing verification

### 6. Dev Route
- `/dev/music/88bpm` — plays click track at 88 BPM, shows timing bridge
- `/dev/music/96bpm` — same at 96 BPM
- `/dev/music/phase-test` — shows planning/execution phase transitions
- Timing bridge enabled by default
- Visual beat indicator (blinking circle or bar that pulses on each beat)

## Acceptance Criteria

1. Navigate to `/dev/music/88bpm` — click track plays, visual beat indicator pulses
2. Timing bridge logs beat events with sub-5ms accuracy for each beat
3. All beats in a test run are "ON BEAT" (within ±5ms threshold)
4. Phase transitions fire at correct measure boundaries
5. `window.STEADY_LIGHT.music.getBeat()` returns current beat/measure/phase
6. Stopping and restarting playback resets timing correctly
7. BPM can be changed via `window.STEADY_LIGHT.music.setBPM(96)` and timing adjusts

## Notes
- Web Audio API's `AudioContext.currentTime` is high-resolution — use it, not `Date.now()` or `performance.now()` for audio timing
- The click track is temporary — real music replaces it during polish. The timing system stays.
- Timing accuracy is critical. If we can't hit ±5ms consistently, the entire combat rhythm system falls apart. This milestone should verify that we CAN before building on it.
- Consider: should we pre-schedule beat events using `AudioContext.currentTime` + offset, or use a tight rAF loop polling position? The former is more accurate.
