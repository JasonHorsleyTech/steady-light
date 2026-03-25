#!/bin/bash
# Split a long audio loop into individual variants by detecting silence gaps.
#
# Usage:
#   ./workshop/audio/split-loop.sh <input.mp3> [output-dir] [--prefix <name>] [--threshold <dB>] [--min-silence <seconds>]
#
# Examples:
#   ./workshop/audio/split-loop.sh footsteps-wet-stone.mp3 assets/audio/sfx/footsteps
#   ./workshop/audio/split-loop.sh rain-loop.mp3 assets/audio/sfx/ambient --prefix rain --threshold -30
#   ./workshop/audio/split-loop.sh sword-clangs.mp3 . --prefix clang --min-silence 0.1
#
# Defaults:
#   output-dir: same directory as input file
#   prefix: input filename without extension
#   threshold: -35 dB (silence detection sensitivity)
#   min-silence: 0.05 seconds (minimum gap to count as silence)
#
# How it works:
#   1. Detects silence gaps in the audio using sox
#   2. Splits at each gap into individual files
#   3. Trims and normalizes each segment
#   4. Names output: <prefix>_01.mp3, <prefix>_02.mp3, etc.
#
# Requires: sox, ffmpeg

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Parse args
INPUT=""
OUTPUT_DIR=""
PREFIX=""
THRESHOLD="-35"
MIN_SILENCE="0.05"

while [[ $# -gt 0 ]]; do
  case $1 in
    --prefix) PREFIX="$2"; shift 2 ;;
    --threshold) THRESHOLD="$2"; shift 2 ;;
    --min-silence) MIN_SILENCE="$2"; shift 2 ;;
    --*) echo "Unknown flag: $1"; exit 1 ;;
    *)
      if [ -z "$INPUT" ]; then
        INPUT="$1"
      elif [ -z "$OUTPUT_DIR" ]; then
        OUTPUT_DIR="$1"
      fi
      shift
      ;;
  esac
done

if [ -z "$INPUT" ]; then
  echo "Usage: split-loop.sh <input.mp3> [output-dir] [--prefix <name>] [--threshold <dB>] [--min-silence <sec>]"
  echo ""
  echo "Splits a long audio loop into individual variants at silence gaps."
  echo ""
  echo "Options:"
  echo "  --prefix <name>        Output filename prefix (default: input filename)"
  echo "  --threshold <dB>       Silence threshold in dB (default: -35)"
  echo "  --min-silence <sec>    Minimum silence duration to split at (default: 0.05)"
  exit 1
fi

if [ ! -f "$INPUT" ]; then
  echo "ERROR: File not found: $INPUT"
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

# Defaults
INPUT_BASENAME="$(basename "$INPUT" .mp3)"
INPUT_BASENAME="$(basename "$INPUT_BASENAME" .wav)"
INPUT_BASENAME="$(basename "$INPUT_BASENAME" .ogg)"
[ -z "$OUTPUT_DIR" ] && OUTPUT_DIR="$(dirname "$INPUT")"
[ -z "$PREFIX" ] && PREFIX="$INPUT_BASENAME"

mkdir -p "$OUTPUT_DIR"

echo "=== Split Loop ==="
echo "Input:      $INPUT"
echo "Output dir: $OUTPUT_DIR"
echo "Prefix:     $PREFIX"
echo "Threshold:  ${THRESHOLD}dB"
echo "Min gap:    ${MIN_SILENCE}s"
echo ""

# Convert to WAV for sox processing
TEMP_DIR=$(mktemp -d /tmp/split-loop-XXXXXX)
trap "rm -rf $TEMP_DIR" EXIT

TEMP_WAV="$TEMP_DIR/input.wav"
ffmpeg -v quiet -y -i "$INPUT" "$TEMP_WAV"

# Get total duration
TOTAL_DURATION=$(soxi -D "$TEMP_WAV" 2>/dev/null || echo "unknown")
echo "Total duration: ${TOTAL_DURATION}s"

# Use sox to split on silence
# sox silence effect: split when silence is detected
# This creates multiple output files
echo "Detecting silence gaps and splitting..."

# Method: use sox's silence effect in "newfile" mode
# This creates output files: split001.wav, split002.wav, etc.
sox "$TEMP_WAV" "$TEMP_DIR/split.wav" \
  silence 1 "$MIN_SILENCE" "${THRESHOLD}d" 1 "$MIN_SILENCE" "${THRESHOLD}d" \
  : newfile : restart 2>/dev/null || true

# Find all split files
SPLIT_FILES=($(ls "$TEMP_DIR"/split*.wav 2>/dev/null | sort))

if [ ${#SPLIT_FILES[@]} -eq 0 ]; then
  echo "WARNING: No splits detected — the audio may not have silence gaps."
  echo "Try adjusting --threshold (higher = more sensitive) or --min-silence (lower = shorter gaps)."
  echo ""
  echo "Falling back: copying input as single segment."
  cp "$TEMP_WAV" "$TEMP_DIR/split001.wav"
  SPLIT_FILES=("$TEMP_DIR/split001.wav")
fi

echo "Found ${#SPLIT_FILES[@]} segments."
echo ""

# Process each segment: trim silence, normalize, convert to MP3
COUNT=0
GOOD_COUNT=0

for SPLIT_FILE in "${SPLIT_FILES[@]}"; do
  COUNT=$((COUNT + 1))
  PADDED=$(printf "%02d" "$COUNT")

  # Check if segment has actual content (not just silence)
  RMS=$(sox "$SPLIT_FILE" -n stat 2>&1 | grep "RMS.*amplitude" | head -1 | awk '{print $NF}')
  IS_SILENT=$(python3 -c "print('yes' if float('${RMS:-0}') < 0.001 else 'no')")

  if [ "$IS_SILENT" = "yes" ]; then
    echo "  Segment $PADDED: silent (RMS: ${RMS:-0}) — skipping"
    continue
  fi

  # Trim silence + normalize
  PROCESSED="$TEMP_DIR/processed_${PADDED}.wav"
  sox "$SPLIT_FILE" "$PROCESSED" \
    silence 1 0.01 -40d \
    reverse silence 1 0.01 -40d reverse \
    norm 2>/dev/null || continue

  # Check if result is too short (< 50ms)
  DURATION=$(soxi -D "$PROCESSED" 2>/dev/null || echo "0")
  IS_SHORT=$(python3 -c "print('yes' if float('$DURATION') < 0.05 else 'no')")
  if [ "$IS_SHORT" = "yes" ]; then
    echo "  Segment $PADDED: too short (${DURATION}s) — skipping"
    continue
  fi

  # Convert to MP3
  OUTPUT_FILE="$OUTPUT_DIR/${PREFIX}_${PADDED}.mp3"
  ffmpeg -v quiet -y -i "$PROCESSED" -codec:a libmp3lame -b:a 128k "$OUTPUT_FILE"

  FILE_SIZE=$(wc -c < "$OUTPUT_FILE" | tr -d ' ')
  echo "  ${PREFIX}_${PADDED}.mp3 — ${DURATION}s, ${FILE_SIZE} bytes, RMS: $RMS"
  GOOD_COUNT=$((GOOD_COUNT + 1))
done

echo ""
echo "=== SPLIT COMPLETE: ${GOOD_COUNT} segments from ${COUNT} detected ==="

# Auto-verify each output
if [ -x "$SCRIPT_DIR/verify-audio.sh" ] && [ "$GOOD_COUNT" -gt 0 ]; then
  echo ""
  echo "--- Quick verification ---"
  for f in "$OUTPUT_DIR"/${PREFIX}_*.mp3; do
    [ -f "$f" ] || continue
    RMS=$(sox "$f" -n stat 2>&1 | grep "RMS.*amplitude" | head -1 | awk '{print $NF}')
    PEAK=$(sox "$f" -n stat 2>&1 | grep "Maximum amplitude" | awk '{print $NF}')
    DUR=$(soxi -D "$f" 2>/dev/null || echo "?")
    echo "  $(basename "$f"): ${DUR}s, RMS=${RMS}, Peak=${PEAK}"
  done
fi
