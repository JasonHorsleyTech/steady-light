#!/bin/bash
# Verify an audio file is valid, non-silent, and has reasonable properties.
# Designed for AI agents who can't hear — all output is structured text.
#
# Usage:
#   ./workshop/audio/verify-audio.sh <audio-file>
#
# Requires: sox and ffmpeg (brew install sox ffmpeg)
# Optional: audiowaveform for amplitude-over-time data (brew install audiowaveform)
#
# Exit codes:
#   0 — file is valid and non-silent
#   1 — file is missing, corrupt, or silent

set -euo pipefail

FILE="${1:-}"

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "Usage: verify-audio.sh <audio-file>"
  [ -n "$FILE" ] && echo "ERROR: File not found: $FILE"
  exit 1
fi

echo "=== Audio Verification: $FILE ==="
echo ""

PASS=true

# --- File size check ---
FILE_SIZE=$(wc -c < "$FILE" | tr -d ' ')
echo "File size: ${FILE_SIZE} bytes"
if [ "$FILE_SIZE" -lt 100 ]; then
  echo "FAIL: File is suspiciously small (< 100 bytes)"
  PASS=false
fi

# --- Format validation via ffprobe ---
if command -v ffprobe &>/dev/null; then
  echo ""
  echo "--- Format Info ---"

  # Quick validity check — ffprobe exits non-zero on corrupt files
  if ! ffprobe -v error "$FILE" 2>&1; then
    echo "FAIL: ffprobe reports file is corrupt or unreadable"
    PASS=false
  else
    ffprobe -v quiet -print_format json -show_format -show_streams "$FILE" 2>/dev/null | \
      python3 -c "
import json, sys
data = json.load(sys.stdin)
fmt = data.get('format', {})
print(f'  Format: {fmt.get(\"format_long_name\", \"unknown\")}')
print(f'  Duration: {fmt.get(\"duration\", \"unknown\")}s')
print(f'  Bit rate: {fmt.get(\"bit_rate\", \"unknown\")} bps')
for s in data.get('streams', []):
    print(f'  Codec: {s.get(\"codec_name\")} | Sample rate: {s.get(\"sample_rate\")}Hz | Channels: {s.get(\"channels\")}')
" 2>/dev/null || echo "  (Could not parse ffprobe output)"
  fi
else
  echo ""
  echo "WARNING: ffprobe not found — install with: brew install ffmpeg"
fi

# --- Amplitude analysis via sox ---
if command -v sox &>/dev/null; then
  echo ""
  echo "--- Amplitude Analysis ---"

  # sox stat writes to stderr
  STATS=$(sox "$FILE" -n stat 2>&1) || true
  echo "$STATS" | head -15

  # Extract RMS amplitude for silence check
  RMS=$(echo "$STATS" | grep "RMS.*amplitude" | head -1 | awk '{print $NF}')
  PEAK=$(echo "$STATS" | grep "Maximum amplitude" | awk '{print $NF}')

  if [ -n "$RMS" ]; then
    echo ""
    IS_SILENT=$(python3 -c "
rms = float('$RMS')
peak = float('${PEAK:-0}')
if rms < 0.001:
    print('FAIL: Audio is silence (RMS amplitude < 0.001)')
elif rms < 0.01:
    print(f'WARNING: Audio is very quiet (RMS: {rms:.6f})')
else:
    print(f'OK: Audio has content (RMS: {rms:.6f}, Peak: {peak:.6f})')
")
    echo "Silence check: $IS_SILENT"
    if echo "$IS_SILENT" | grep -q "^FAIL"; then
      PASS=false
    fi
  fi
else
  echo ""
  echo "WARNING: sox not found — install with: brew install sox"
fi

# --- Volume detection via ffmpeg (backup method) ---
if command -v ffmpeg &>/dev/null && ! command -v sox &>/dev/null; then
  echo ""
  echo "--- Volume Detection (ffmpeg fallback) ---"
  ffmpeg -i "$FILE" -af volumedetect -f null /dev/null 2>&1 | grep -E "mean_volume|max_volume" || true
fi

# --- Duration via soxi ---
if command -v soxi &>/dev/null; then
  DURATION=$(soxi -D "$FILE" 2>/dev/null || echo "unknown")
  echo ""
  echo "Duration (precise): ${DURATION}s"
fi

# --- Waveform shape via audiowaveform (if available) ---
if command -v audiowaveform &>/dev/null; then
  echo ""
  echo "--- Waveform Shape (10 samples/sec) ---"
  # Convert to wav first if needed, then get waveform data
  TEMP_WAV=$(mktemp /tmp/verify-XXXXXX.wav)
  if ffmpeg -v quiet -y -i "$FILE" "$TEMP_WAV" 2>/dev/null; then
    audiowaveform -i "$TEMP_WAV" --output-format json --pixels-per-second 10 2>/dev/null | \
      python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    samples = data.get('data', [])
    # Pairs of (min, max) amplitude values
    pairs = [(samples[i], samples[i+1]) for i in range(0, len(samples), 2)]
    for i, (lo, hi) in enumerate(pairs):
        t = i * 0.1
        bar_len = max(0, int((hi - lo) / 32768 * 40))
        bar = '#' * bar_len
        print(f'  {t:5.1f}s | {bar:<40} | range: [{lo:6d}, {hi:6d}]')
except Exception as e:
    print(f'  (Could not render waveform: {e})')
" 2>/dev/null || echo "  (audiowaveform parsing failed)"
  fi
  rm -f "$TEMP_WAV"
fi

# --- Final verdict ---
echo ""
if $PASS; then
  echo "=== RESULT: PASS ==="
else
  echo "=== RESULT: FAIL ==="
  exit 1
fi
