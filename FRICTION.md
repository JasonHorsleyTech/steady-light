# Friction Log

**Purpose:** When you (an AI agent) hit friction during development — a wrong API flag, confusing docs, an unexpected behavior, a workaround that took multiple attempts — log it here. This prevents the next agent from wasting focus on the same problem.

**When to log:** Any time you spend more than one attempt figuring something out. If you tried something, it failed, you had to read docs or experiment to find the fix — that's friction. Log it.

**When to fix instead:** If the friction can be resolved in under 2 minutes (add a comment, update a flag in a script, fix a default), just fix it and note what you did. The next agent should never even encounter it.

---

## Format

```
### [YYYY-MM-DD] Short description
**Where:** file or system involved
**What happened:** what went wrong or was confusing
**Resolution:** how you fixed it
**Prevention:** what was done (or should be done) so the next agent doesn't hit this
**Status:** resolved | todo
```

---

## Log

### [2026-03-24] ElevenLabs API returns very quiet sound effects
**Where:** `workshop/audio/generate-sfx.sh`, ElevenLabs `/v1/sound-generation` endpoint
**What happened:** Sound effects generated via the API had RMS amplitude ~0.005 and peak ~0.06 — essentially whisper-quiet. The same prompt on the ElevenLabs web UI produced RMS ~0.14 and peak 1.0 (30x louder). Longer generations (8s lo-fi track) came back at normal volume — the issue is specific to short SFX. The API has no volume/normalization parameter for sound effects. The web UI applies normalization server-side that the API does not.
**Resolution:** Added automatic post-processing to `generate-sfx.sh`: trim leading/trailing silence (below -40dB threshold) + normalize to peak 0dB using sox. Tested and confirmed output matches web UI volume levels.
**Prevention:** Already fixed in the script. Future agents don't need to do anything — normalization is automatic.
**Status:** resolved

### [2026-03-24] ElevenLabs API produces lower quality audio than web UI
**Where:** ElevenLabs `/v1/sound-generation` API vs `elevenlabs.io/app/sound-effects` web UI
**What happened:** Same prompt, same settings — API output sounds noticeably worse than web UI. Three root causes found: (1) Web UI uses `opus_48000_128` format, API default was `mp3_44100_128`; (2) Web UI uses `prompt_influence: 0.3`, we were using `0.5`; (3) Web UI generates 4 variants and user picks best — API generates 1.
**Resolution:** Updated `generate-sfx.sh` to use opus_48000_128, prompt_influence 0.3, and optional multi-variant generation with best-of-N by RMS. Also created `/generate-sfx-browser` skill for browser-based generation (higher quality).
**Prevention:** API script now matches web UI settings. For best quality, use the browser skill.
**Status:** resolved

### [2026-03-24] Chrome DevTools MCP: downloads don't save to disk — use Play instead
**Where:** Chrome DevTools MCP server, ElevenLabs download buttons
**What happened:** Clicking "MP3 44.1kHz" in the download menu triggers ffmpeg-wasm conversion which creates blob URLs, but (a) the file doesn't save to disk in automated Chrome, and (b) the blob bodies get garbage collected before you can grab them via `get_network_request`. The download path is unreliable.
**Resolution:** Use the **Play button** instead of the download menu. Clicking Play on a variant creates a `blob:https://elevenlabs.io/...` media request that's capturable immediately via `list_network_requests` (filter `resourceTypes: ["media"]`) + `get_network_request` with `responseFilePath`. Grab it right after clicking Play — blobs get GC'd quickly.
**Prevention:** Documented in `/generate-sfx-browser` skill. Use Play→capture→sox, not Download→intercept.
**Status:** resolved

### [2026-03-24] Chrome DevTools MCP: duration slider not automatable
**Where:** ElevenLabs sound effects page, duration slider control
**What happened:** The duration slider (`role="slider"`) does not respond to `fill()` — times out after 5 seconds. JavaScript manipulation of aria-valuenow also doesn't trigger React's state update.
**Resolution:** Skip precise duration control. Leave on Auto or accept the current setting.
**Prevention:** Documented in `/generate-sfx-browser` skill. Don't waste context fighting the slider.
**Status:** accepted (won't fix)

### [2026-03-24] Web UI raw audio is also quiet — normalization is client-side
**Where:** ElevenLabs web UI audio blobs
**What happened:** Captured the raw audio blob from the web UI's network requests. RMS was 0.004 — just as quiet as the API. The web UI's player applies gain during playback, and the download function uses ffmpeg-wasm to normalize before saving to disk. When intercepting the blob directly, you get the raw quiet version.
**Resolution:** Apply the same sox normalization pipeline to browser-captured audio as to API-generated audio.
**Prevention:** Documented in skill. Always post-process regardless of source.
**Status:** resolved
