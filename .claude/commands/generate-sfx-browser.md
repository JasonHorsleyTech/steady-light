Generate high-quality sound effects using the ElevenLabs web UI via Chrome DevTools MCP.

**This command should be delegated to a background sub-agent.** The browser automation takes 1-2 minutes and involves waiting. Don't burn your main context on it.

## How to Use

Spawn a background sub-agent with this prompt template. Fill in the bracketed values:

```
Use the Agent tool:
  description: "Generate SFX: [short name]"
  run_in_background: true
  prompt: (the full sub-agent prompt below, with values filled in)
```

### Sub-agent Prompt Template

```
Generate a sound effect via the ElevenLabs web UI using Chrome DevTools MCP tools.

WHAT TO GENERATE:
- Prompt: "[description of the sound]"
- Output directory: "[e.g. assets/audio/sfx/combat]"
- Base filename: "[e.g. hit-slime]" (will produce hit-slime_1.mp3 through hit-slime_4.mp3)

STEP-BY-STEP PROCEDURE:

1. OPEN THE PAGE
   - Use list_pages to check if elevenlabs.io is already open
   - If not, use new_page with url "https://elevenlabs.io/app/sound-effects"
   - Use wait_for with text ["Generate sound effect"] and timeout 15000
   - Take a snapshot. If you see login/signup instead of the sound effects UI, STOP and return an error — the user needs to log in manually.

2. ENTER THE PROMPT
   - Find the textbox with placeholder "Describe a sound..."
   - Click it, then press Meta+A to select all
   - Use fill to enter the prompt text

3. SET DURATION (if specified)
   - The duration button shows current value (e.g. "Auto" or "2.0s")
   - Click it to open the popover
   - If Auto switch is checked and you want a specific duration, click the switch to uncheck it
   - The slider does NOT respond to fill(). Skip it — use whatever duration is shown.
   - Press Escape to close the popover

4. GENERATE
   - Click the "Generate sound effect" button
   - Use wait_for with text ["Generate sound effect"] and timeout 60000
   - This waits for the button to re-enable (it shows "Loading" during generation)

5. CAPTURE ALL 4 VARIANTS
   After generation, 4 variants appear in a panel. For EACH variant (#1 through #4):

   a. Click the Play button for that variant to trigger audio loading
      - Variant buttons are labeled "Play #N <duration>"
      - The Play button is the child button inside each variant row

   b. Immediately check network requests:
      - Use list_network_requests with resourceTypes ["media"] and pageSize 10
      - Look for the most recent blob:https://elevenlabs.io/... request with status 200 or 206
      - Use get_network_request with that reqid and responseFilePath set to:
        "[output_directory]/[base_filename]_[N]_raw.mp3"
      - Verify the response has content-type "audio/mpeg" and reasonable size (>1000 bytes)
      - If the response body says "not available anymore", the blob was garbage collected.
        Click Play again and grab it faster.

   c. Repeat for variants 2, 3, and 4

6. POST-PROCESS ALL FILES
   For each captured raw file, run:
   ```bash
   sox "[output_dir]/[name]_N_raw.mp3" "[output_dir]/[name]_N.mp3" \
     silence 1 0.01 -40d reverse silence 1 0.01 -40d reverse norm
   rm "[output_dir]/[name]_N_raw.mp3"
   ```

7. VERIFY AND PICK THE BEST
   For each processed file, run:
   ```bash
   sox "[output_dir]/[name]_N.mp3" -n stat 2>&1
   ```
   Check that:
   - RMS amplitude > 0.01 (not silence)
   - Peak amplitude > 0.5 (normalized)
   - File exists and has reasonable size

   Then pick the best variant and copy it as the default file:
   - For **impact/action SFX** (hits, clicks, splashes, etc): pick the variant with the **highest RMS amplitude**. Higher RMS = meatier, more full-bodied sound. This heuristic is right more often than not for punchy sounds.
   - For **ambient/atmospheric sounds** (wind, rain, tavern noise): pick any variant at random. RMS doesn't meaningfully indicate quality for sustained textures.
   - **When unsure**: pick one at random. You're deaf — any heuristic is a guess. The human can always swap it.

   Copy the winner as the default:
   ```bash
   cp "[output_dir]/[name]_N.mp3" "[output_dir]/[name].mp3"
   ```

   So the final output is:
   - `[name].mp3` — the default (best pick)
   - `[name]_1.mp3` through `[name]_4.mp3` — all variants preserved

8. RETURN RESULTS
   Report back with:
   - How many variants were successfully captured (out of 4)
   - Which variant was selected as the default and why
   - File paths and sizes for each
   - RMS and peak amplitude for each
   - Any errors encountered

CRITICAL FRICTION POINTS:
- The download menu ("MP3 44.1kHz") triggers a blob but Chrome can't save it to disk. Use the Play button instead — it creates a media blob you CAN capture via network requests.
- The unlabeled button next to the three-dot menu is favorite, NOT download.
- Raw audio is very quiet (RMS ~0.004). ALWAYS post-process with sox norm.
- Blob responses get garbage collected quickly. Capture immediately after clicking Play.
- If list_pages shows no pages, use new_page to create one.
- The duration slider cannot be automated. Don't waste time on it.
```

## Example Usage

To generate a slime hit sound:
```
Agent tool:
  description: "Generate SFX: slime hit"
  run_in_background: true
  prompt: "Generate a sound effect via the ElevenLabs web UI...
    Prompt: 'hitting a green slime monster with a wooden stick, wet squelchy impact, video game sound effect'
    Output directory: 'assets/audio/sfx/combat'
    Base filename: 'hit-slime'
    ..."
```

The sub-agent runs in the background. You get notified when it's done. Your main conversation stays focused.

## When to Use This vs the API Script
- **Use this (browser via sub-agent)**: Primary method. Best quality. Runs in background.
- **Use the API script** (`workshop/audio/generate-sfx.sh`): Fallback when browser isn't available or login expired.

## File Organization
```
assets/audio/sfx/
  ui/          — menu clicks, confirmations, navigation
  combat/      — hits, blocks, dodges, chains
  music/       — metronome ticks, beat markers, placeholder loops
  ambient/     — tavern, outdoors, night
  system/      — game start, save, load
```
