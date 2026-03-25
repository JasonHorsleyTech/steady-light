#!/bin/bash
# Combine individual MP3 files into a single audio sprite + Howler.js-compatible JSON manifest.
#
# Usage:
#   ./workshop/audio/build-sprite.sh <input-dir | file1.mp3 file2.mp3 ...> [--output <name>] [--gap <ms>]
#
# Examples:
#   ./workshop/audio/build-sprite.sh assets/audio/sfx/combat/ --output combat-sprites
#   ./workshop/audio/build-sprite.sh hit-slime.mp3 block.mp3 dodge.mp3 --output combat-sprites
#   ./workshop/audio/build-sprite.sh assets/audio/sfx/footsteps/ --output footstep-dirt-sprites --gap 100
#
# Options:
#   --output <name>   Output filename without extension (default: "sprite")
#   --gap <ms>        Silence gap between sounds in milliseconds (default: 50)
#   --outdir <dir>    Output directory (default: same as input directory or cwd)
#
# Output:
#   <name>.mp3   — Combined audio sprite file
#   <name>.json  — Howler.js-compatible sprite manifest
#
# The JSON manifest looks like:
#   {
#     "src": ["combat-sprites.mp3"],
#     "sprite": {
#       "hit-slime": [0, 1200],
#       "block": [1250, 800],
#       "dodge": [2100, 600]
#     }
#   }
#
# Requires: sox, ffmpeg

set -euo pipefail

# Parse args
FILES=()
OUTPUT_NAME="sprite"
GAP_MS=50
OUTPUT_DIR=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --output) OUTPUT_NAME="$2"; shift 2 ;;
    --gap) GAP_MS="$2"; shift 2 ;;
    --outdir) OUTPUT_DIR="$2"; shift 2 ;;
    --*) echo "Unknown flag: $1"; exit 1 ;;
    *)
      # If it's a directory, expand to all MP3s in it
      if [ -d "$1" ]; then
        for f in "$1"/*.mp3; do
          [ -f "$f" ] && FILES+=("$f")
        done
        [ -z "$OUTPUT_DIR" ] && OUTPUT_DIR="$1"
      elif [ -f "$1" ]; then
        FILES+=("$1")
      else
        echo "ERROR: Not a file or directory: $1"
        exit 1
      fi
      shift
      ;;
  esac
done

if [ ${#FILES[@]} -eq 0 ]; then
  echo "Usage: build-sprite.sh <input-dir | file1.mp3 ...> [--output <name>] [--gap <ms>]"
  echo ""
  echo "Combines MP3 files into an audio sprite + Howler.js JSON manifest."
  echo ""
  echo "Options:"
  echo "  --output <name>   Output filename (default: 'sprite')"
  echo "  --gap <ms>        Silence between sounds in ms (default: 50)"
  echo "  --outdir <dir>    Output directory (default: input dir or cwd)"
  exit 1
fi

# Check dependencies
if ! command -v sox &>/dev/null; then
  echo "ERROR: sox is required. Install with: brew install sox"
  exit 1
fi
if ! command -v ffmpeg &>/dev/null; then
  echo "ERROR: ffmpeg is required. Install with: brew install ffmpeg"
  exit 1
fi

[ -z "$OUTPUT_DIR" ] && OUTPUT_DIR="."

echo "=== Audio Sprite Builder ==="
echo "Files:  ${#FILES[@]}"
echo "Output: ${OUTPUT_DIR}/${OUTPUT_NAME}.{mp3,json}"
echo "Gap:    ${GAP_MS}ms"
echo ""

TEMP_DIR=$(mktemp -d /tmp/build-sprite-XXXXXX)
trap "rm -rf $TEMP_DIR" EXIT

# Step 1: Convert all inputs to WAV at consistent sample rate
echo "Preparing files..."
WAVS=()
NAMES=()
DURATIONS=()

for FILE in "${FILES[@]}"; do
  BASENAME=$(basename "$FILE" .mp3)
  WAV_FILE="$TEMP_DIR/${BASENAME}.wav"

  ffmpeg -v quiet -y -i "$FILE" -ar 44100 -ac 1 "$WAV_FILE"

  DURATION_SEC=$(soxi -D "$WAV_FILE" 2>/dev/null || echo "0")
  DURATION_MS=$(python3 -c "print(int(float('$DURATION_SEC') * 1000))")

  echo "  ${BASENAME}: ${DURATION_MS}ms"

  WAVS+=("$WAV_FILE")
  NAMES+=("$BASENAME")
  DURATIONS+=("$DURATION_MS")
done

echo ""

# Step 2: Generate silence gap
GAP_SEC=$(python3 -c "print(${GAP_MS} / 1000)")
GAP_FILE="$TEMP_DIR/_gap.wav"
sox -n -r 44100 -c 1 "$GAP_FILE" trim 0 "$GAP_SEC"

# Step 3: Concatenate with gaps
echo "Concatenating..."
CONCAT_LIST=()
for i in "${!WAVS[@]}"; do
  CONCAT_LIST+=("${WAVS[$i]}")
  # Add gap after each file except the last
  if [ "$i" -lt "$((${#WAVS[@]} - 1))" ]; then
    CONCAT_LIST+=("$GAP_FILE")
  fi
done

COMBINED_WAV="$TEMP_DIR/combined.wav"
sox "${CONCAT_LIST[@]}" "$COMBINED_WAV"

# Step 4: Convert to MP3
mkdir -p "$OUTPUT_DIR"
OUTPUT_MP3="${OUTPUT_DIR}/${OUTPUT_NAME}.mp3"
ffmpeg -v quiet -y -i "$COMBINED_WAV" -codec:a libmp3lame -b:a 128k "$OUTPUT_MP3"

TOTAL_SIZE=$(wc -c < "$OUTPUT_MP3" | tr -d ' ')
TOTAL_DURATION=$(soxi -D "$COMBINED_WAV" 2>/dev/null || echo "0")
echo "Combined: ${TOTAL_DURATION}s, ${TOTAL_SIZE} bytes"
echo ""

# Step 5: Build Howler.js manifest
echo "Building manifest..."
OUTPUT_JSON="${OUTPUT_DIR}/${OUTPUT_NAME}.json"

# Calculate offsets
python3 -c "
import json

names = $(python3 -c "import json; print(json.dumps([$(printf '"%s",' "${NAMES[@]}" | sed 's/,$//')]))")
durations = [$(printf '%s,' "${DURATIONS[@]}" | sed 's/,$//')]
gap_ms = ${GAP_MS}

sprite = {}
offset = 0

for name, dur in zip(names, durations):
    sprite[name] = [offset, dur]
    offset += dur + gap_ms

manifest = {
    'src': ['${OUTPUT_NAME}.mp3'],
    'sprite': sprite
}

print(json.dumps(manifest, indent=2))
" > "$OUTPUT_JSON"

echo "Manifest:"
cat "$OUTPUT_JSON"
echo ""

echo "=== SPRITE BUILD OK ==="
echo "Files:"
echo "  ${OUTPUT_MP3} (${TOTAL_SIZE} bytes)"
echo "  ${OUTPUT_JSON}"

# Verify combined file
if [ -x "$(dirname "$0")/verify-audio.sh" ]; then
  echo ""
  "$(dirname "$0")/verify-audio.sh" "$OUTPUT_MP3"
fi
