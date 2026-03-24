#!/bin/bash
# Generate a placeholder sound effect via ElevenLabs Sound Generation API.
#
# Usage:
#   ./workshop/audio/generate-sfx.sh "description" [output.mp3] [duration_seconds] [variants]
#
# Examples:
#   ./workshop/audio/generate-sfx.sh "sword hitting jelly monster" hit-slime.mp3 1.0
#   ./workshop/audio/generate-sfx.sh "short digital menu click" ui-click.mp3 0.5
#   ./workshop/audio/generate-sfx.sh "ambient tavern background noise" tavern-ambient.mp3 5.0
#   ./workshop/audio/generate-sfx.sh "sword clang" sword.mp3 1.0 4   # generate 4, keep best
#
# Notes:
#   - Requires ELEVEN_LABS_UNRESTRICTED_API_KEY in .env at project root
#   - Generates in opus_48000_128 (48kHz Opus — what the web UI uses) then converts to mp3
#   - prompt_influence is 0.3 (the web UI default — allows richer, more varied results)
#   - When variants > 1, generates N versions and keeps the one with highest RMS amplitude
#   - Auto-runs verify-audio.sh on the result if sox/ffprobe are installed
#
# Post-processing (automatic, requires sox + ffmpeg):
#   - Converts from Opus 48kHz to MP3 44.1kHz/128kbps
#   - Trims leading/trailing silence (threshold -40dB)
#   - Normalizes to peak 0dB
#
# Why these settings:
#   The ElevenLabs web UI uses opus_48000_128, prompt_influence 0.3, and generates
#   4 variants for the user to pick from. The public API docs suggest mp3_44100_128
#   and prompt_influence 0.3-0.5, but that produces noticeably worse results.
#   These settings replicate what the web UI actually does.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Load .env
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  source "$PROJECT_ROOT/.env"
  set +a
fi

if [ -z "${ELEVEN_LABS_UNRESTRICTED_API_KEY:-}" ]; then
  echo "ERROR: ELEVEN_LABS_UNRESTRICTED_API_KEY not set. Add it to .env at project root."
  exit 1
fi

PROMPT="${1:-}"
OUTPUT="${2:-sfx-output.mp3}"
DURATION="${3:-}"
VARIANTS="${4:-1}"

if [ -z "$PROMPT" ]; then
  echo "Usage: generate-sfx.sh \"description of sound\" [output.mp3] [duration_seconds] [variants]"
  echo ""
  echo "Examples:"
  echo "  generate-sfx.sh \"sword hitting jelly\" hit-slime.mp3 1.0"
  echo "  generate-sfx.sh \"menu select beep\" ui-click.mp3 0.5"
  echo "  generate-sfx.sh \"sword clang\" sword.mp3 1.0 4   # best of 4"
  exit 1
fi

# Preflight: check for required tools
if ! command -v sox &>/dev/null; then
  echo "ERROR: sox is required for post-processing. Install with: brew install sox"
  exit 1
fi
if ! command -v ffmpeg &>/dev/null; then
  echo "ERROR: ffmpeg is required for format conversion. Install with: brew install ffmpeg"
  exit 1
fi

# Create output directory if needed
OUTPUT_DIR="$(dirname "$OUTPUT")"
if [ "$OUTPUT_DIR" != "." ] && [ ! -d "$OUTPUT_DIR" ]; then
  mkdir -p "$OUTPUT_DIR"
fi

# Build JSON body — use python3 for safe JSON encoding
# prompt_influence 0.3 matches the web UI (richer results than 0.5)
BODY=$(python3 -c "
import json, sys
body = {'text': sys.argv[1], 'prompt_influence': 0.3}
dur = sys.argv[2]
if dur:
    body['duration_seconds'] = float(dur)
print(json.dumps(body))
" "$PROMPT" "$DURATION")

echo "=== ElevenLabs Sound Generation ==="
echo "Prompt: \"$PROMPT\""
[ -n "$DURATION" ] && echo "Duration: ${DURATION}s" || echo "Duration: auto"
echo "Format: opus_48000_128 → mp3 (matches web UI pipeline)"
echo "Variants: $VARIANTS"
echo "Output: $OUTPUT"
echo ""

# --- Generate variant(s) ---

generate_one() {
  local OUT_PATH="$1"
  local HTTP_CODE
  HTTP_CODE=$(curl -s -w "%{http_code}" -o "$OUT_PATH" \
    -X POST "https://api.elevenlabs.io/v1/sound-generation?output_format=opus_48000_128" \
    -H "xi-api-key: $ELEVEN_LABS_UNRESTRICTED_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$BODY" \
    --max-time 180)

  if [ "$HTTP_CODE" != "200" ]; then
    echo "ERROR: ElevenLabs API returned HTTP $HTTP_CODE"
    cat "$OUT_PATH" 2>/dev/null || true
    rm -f "$OUT_PATH"
    return 1
  fi
  return 0
}

TEMP_DIR=$(mktemp -d /tmp/sfx-gen-XXXXXX)
trap "rm -rf $TEMP_DIR" EXIT

if [ "$VARIANTS" -eq 1 ]; then
  echo "Generating..."
  generate_one "$TEMP_DIR/variant-1.opus"
  BEST="$TEMP_DIR/variant-1.opus"
else
  echo "Generating $VARIANTS variants (keeping best by RMS amplitude)..."
  BEST=""
  BEST_RMS="0"

  for i in $(seq 1 "$VARIANTS"); do
    VFILE="$TEMP_DIR/variant-${i}.opus"
    echo -n "  Variant $i/$VARIANTS... "

    if ! generate_one "$VFILE"; then
      echo "failed"
      continue
    fi

    # Convert to wav for sox analysis
    VWAV="$TEMP_DIR/variant-${i}.wav"
    ffmpeg -v quiet -y -i "$VFILE" "$VWAV" 2>/dev/null

    # Get RMS amplitude
    RMS=$(sox "$VWAV" -n stat 2>&1 | grep "RMS.*amplitude" | head -1 | awk '{print $NF}')
    echo "RMS: $RMS"

    # Track best
    IS_BETTER=$(python3 -c "print('yes' if float('${RMS:-0}') > float('${BEST_RMS}') else 'no')")
    if [ "$IS_BETTER" = "yes" ]; then
      BEST="$VFILE"
      BEST_RMS="$RMS"
    fi

    rm -f "$VWAV"
  done

  if [ -z "$BEST" ]; then
    echo "ERROR: All variants failed to generate"
    exit 1
  fi

  echo ""
  echo "Best variant: $(basename "$BEST") (RMS: $BEST_RMS)"
fi

# --- Post-processing: convert opus→mp3, trim silence, normalize ---

echo ""
echo "--- Post-processing ---"

# Step 1: Convert Opus 48kHz → WAV (intermediate for sox processing)
TEMP_WAV="$TEMP_DIR/processing.wav"
ffmpeg -v quiet -y -i "$BEST" "$TEMP_WAV"

# Step 2: Trim leading/trailing silence + normalize to peak 0dB
sox "$TEMP_WAV" "$TEMP_DIR/processed.wav" \
  silence 1 0.01 -40d \
  reverse silence 1 0.01 -40d reverse \
  norm

# Step 3: Convert to final MP3
ffmpeg -v quiet -y -i "$TEMP_DIR/processed.wav" -codec:a libmp3lame -b:a 128k "$OUTPUT"

FINAL_SIZE=$(wc -c < "$OUTPUT" | tr -d ' ')
echo "Opus→WAV→trim silence→normalize→MP3"
echo "Final: $OUTPUT (${FINAL_SIZE} bytes)"
echo ""

# Auto-verify
if [ -x "$SCRIPT_DIR/verify-audio.sh" ]; then
  "$SCRIPT_DIR/verify-audio.sh" "$OUTPUT"
else
  echo "(verify-audio.sh not found or not executable — skipping verification)"
fi
