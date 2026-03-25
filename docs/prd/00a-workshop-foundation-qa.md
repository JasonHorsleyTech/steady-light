---
milestone: 00a
title: Workshop Foundation QA Test Plan
status: draft
created: 2026-03-25
---

# Workshop Foundation — QA Test Plan

Every workshop tool must be tested for two things:

1. **Does it work?** — Given valid input, does it produce correct output?
2. **Is it agent-ready?** — Can a fresh agent, with zero prior context, read the skill doc and successfully use the tool on the first try?

Each tool below has a set of test cases. Run them in order. If any step fails, log the failure and the exact error output before moving on.

---

## Prerequisites

```bash
# From project root
npm install
which sox ffmpeg   # both required for audio tools
npx tsx --version  # should print a version number
```

If `sox` or `ffmpeg` are missing: `brew install sox ffmpeg`

---

## Tool 1: compile-ink

**Script:** `workshop/dialogue/compile-ink.ts`
**Skill:** `.claude/skills/write-dialogue/SKILL.md`

### Test 1.1 — Compile the sample dialogue

```bash
npx tsx workshop/dialogue/compile-ink.ts assets/dialogue/farmer.ink
```

**Expected:**
- Exit code 0
- Prints `=== COMPILE OK ===`
- Creates `assets/dialogue/farmer.ink.json`
- The .ink.json file is valid JSON (verify: `python3 -c "import json; json.load(open('assets/dialogue/farmer.ink.json'))"`)

### Test 1.2 — Compile with explicit output path

```bash
npx tsx workshop/dialogue/compile-ink.ts assets/dialogue/farmer.ink /tmp/test-farmer.ink.json
```

**Expected:**
- Exit code 0
- File created at `/tmp/test-farmer.ink.json`
- File is valid JSON

### Test 1.3 — Compile a broken ink file

Create a temp file with invalid ink syntax:
```bash
echo '-> nonexistent_knot' > /tmp/broken.ink
npx tsx workshop/dialogue/compile-ink.ts /tmp/broken.ink
```

**Expected:**
- Exit code 1
- Prints error message (compiler error or warning about the missing knot)
- Does NOT create a .ink.json file (or creates one that the compiler flags as problematic)

### Test 1.4 — No arguments

```bash
npx tsx workshop/dialogue/compile-ink.ts
```

**Expected:**
- Exit code 1
- Prints usage instructions

### Test 1.5 — File not found

```bash
npx tsx workshop/dialogue/compile-ink.ts nonexistent.ink
```

**Expected:**
- Exit code 1
- Prints `ERROR: File not found:`

---

## Tool 2: test-dialogue

**Script:** `workshop/dialogue/test-dialogue.ts`
**Skill:** `.claude/skills/write-dialogue/SKILL.md`

### Test 2.1 — Play through with auto-choices (always pick 0)

```bash
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink
```

**Expected:**
- Exit code 0
- Prints `=== Dialogue Transcript ===`
- Shows the farmer's first line about needing a place to sleep
- Shows choices with `<-- (auto)` marker on choice 0
- Follows choice 0 through to `--- END ---`
- The transcript reads like natural dialogue, not garbled data

### Test 2.2 — Specific choice sequence

```bash
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "1,1"
```

**Expected:**
- Exit code 0
- First choice picks "What's the catch?" (index 1)
- Second choice picks "What about rent?" (index 1)
- Shows the rent explanation dialogue (mentions "3 silver a day")
- Reaches END

### Test 2.3 — Works with compiled .ink.json

```bash
npx tsx workshop/dialogue/compile-ink.ts assets/dialogue/farmer.ink
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink.json "0,0"
```

**Expected:**
- Exit code 0
- Same transcript as running the .ink directly with choices "0,0"

### Test 2.4 — Invalid choice index

```bash
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "5"
```

**Expected:**
- Exit code 1
- Prints error about choice being out of range

### Test 2.5 — Verbose mode

```bash
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "0,0" --verbose
```

**Expected:**
- Exit code 0
- Shows tags like `[tags: speaker: Farmer]` after dialogue lines
- Shows summary at the end with turn count

### Test 2.6 — Every path reaches END

Run each of these and verify none hit the "max turn limit" warning:
```bash
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "0,0"
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "0,1,0"
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "0,1,1,0"
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "1,0"
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "1,1,0"
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "1,1,1"
```

**Expected:** All exit 0, all reach `--- END ---`

---

## Tool 3: lint-dialogue

**Script:** `workshop/dialogue/lint-dialogue.ts`
**Skill:** `.claude/skills/write-dialogue/SKILL.md`

### Test 3.1 — Lint the sample dialogue

```bash
npx tsx workshop/dialogue/lint-dialogue.ts assets/dialogue/farmer.ink
```

**Expected:**
- Exit code 0
- Prints `=== LINT OK ===`
- Reports a warning about `drink_count` being unused (this is expected — it's declared for cross-file use)

### Test 3.2 — Lint a file with a dead-end knot

Create a temp file:
```bash
cat > /tmp/dead-end.ink << 'INK'
-> start
=== start ===
Hello!
+ [Go to dead end] -> dead_end
+ [Go to end] -> END

=== dead_end ===
This knot has no way out.
INK
npx tsx workshop/dialogue/lint-dialogue.ts /tmp/dead-end.ink
```

**Expected:**
- Exit code 0 (warnings, not errors)
- Reports a warning about `dead_end` having no diverts (dead end)

### Test 3.3 — Lint a file with compiler errors

```bash
cat > /tmp/syntax-error.ink << 'INK'
-> start
=== start ===
Hello!
{ unclosed_brace
-> END
INK
npx tsx workshop/dialogue/lint-dialogue.ts /tmp/syntax-error.ink
```

**Expected:**
- Exit code 1
- Reports compiler error(s)
- Prints `=== LINT FAILED ===`

---

## Tool 4: tiled-to-ascii

**Script:** `workshop/maps/tiled-to-ascii.ts`
**Skill:** `.claude/skills/design-map/SKILL.md`

### Test 4.1 — Render full map

```bash
npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/test-town.json
```

**Expected:**
- Exit code 0
- Prints map metadata (16x12, 32x32)
- Shows ground layer with spaces (walkable), `#` (walls), `o` (objects), `~` (water)
- Shows collision layer with `#` walls forming a border and interior walls
- Shows interactable layer with objects listed by position
- Shows object grid with letters (A=farmer, B=weaponsmith, etc.)

### Test 4.2 — Filter to single layer

```bash
npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/test-town.json --layer collision
```

**Expected:**
- Only shows the collision layer
- Does NOT show ground or interactable layers

### Test 4.3 — Legend mode

```bash
npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/test-town.json --legend
```

**Expected:**
- Shows all layers as normal
- Additionally shows `=== Tile Legend ===` section mapping tile IDs to ASCII characters

### Test 4.4 — Invalid JSON file

```bash
echo "not json" > /tmp/bad-map.json
npx tsx workshop/maps/tiled-to-ascii.ts /tmp/bad-map.json
```

**Expected:**
- Exit code 1
- Prints `ERROR: Invalid JSON`

### Test 4.5 — Visual sanity check

Looking at the collision layer output, verify:
- Row 0 and row 11 are all `#` (border walls)
- Columns 0 and 15 are all `#` (border walls)
- Rows 5-7 have two 3x3 `#` blocks (buildings)
- Rows 9-10 have two 2x2 `#` blocks (water obstacles)
- Interior spaces are `.` (walkable)

This should match the test-town.json data array layout.

---

## Tool 5: pack-sprites

**Script:** `workshop/sprites/pack-sprites.ts`
**Skill:** `.claude/skills/generate-sprites/SKILL.md`

### Test 5.1 — Pack test PNGs

First, generate some test PNG frames:
```bash
mkdir -p /tmp/test-frames
for i in 1 2 3 4; do
  convert -size 32x32 "xc:rgb($((i*50)),$((i*30)),100)" "/tmp/test-frames/frame_00${i}.png" 2>/dev/null || \
  python3 -c "
import struct, zlib
def make_png(w,h,r,g,b,path):
    raw = b''
    for y in range(h):
        raw += b'\x00' + bytes([r,g,b]) * w
    compressed = zlib.compress(raw)
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))
make_png(32, 32, ${i}*50, ${i}*30, 100, '${path}')
" 2>/dev/null
done
# Fallback: create minimal PNGs with python if convert isn't available
python3 -c "
import struct, zlib, os
def make_png(w,h,r,g,b,path):
    raw = b''
    for y in range(h):
        raw += b'\x00' + bytes([r,g,b]) * w
    compressed = zlib.compress(raw)
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', compressed))
        f.write(chunk(b'IEND', b''))
os.makedirs('/tmp/test-frames', exist_ok=True)
for i in range(1,5):
    make_png(32, 32, min(i*50,255), min(i*30,255), 100, f'/tmp/test-frames/frame_00{i}.png')
print('Created 4 test PNGs')
"
```

Then pack:
```bash
npx tsx workshop/sprites/pack-sprites.ts /tmp/test-frames /tmp/test-atlas --name test-atlas
```

**Expected:**
- Exit code 0
- Creates `/tmp/test-atlas/test-atlas.png` (atlas image)
- Creates `/tmp/test-atlas/test-atlas.json` (manifest)
- Prints `=== PACK OK ===`
- The JSON manifest is valid and contains entries for all 4 frames

### Test 5.2 — Verify manifest format

```bash
python3 -c "
import json
m = json.load(open('/tmp/test-atlas/test-atlas.json'))
print('Format:', type(m))
print('Has frames:', 'frames' in m)
if 'frames' in m:
    print('Frame count:', len(m['frames']))
    for name in sorted(m['frames'].keys()):
        f = m['frames'][name]
        print(f'  {name}: {f[\"frame\"][\"w\"]}x{f[\"frame\"][\"h\"]}')
"
```

**Expected:**
- Manifest has `frames` key (TexturePacker JSON Hash format)
- 4 frames listed, each 32x32

### Test 5.3 — Empty directory

```bash
mkdir -p /tmp/empty-frames
npx tsx workshop/sprites/pack-sprites.ts /tmp/empty-frames
```

**Expected:**
- Exit code 1
- Prints `ERROR: No PNG files found`

---

## Tool 6: split-loop

**Script:** `workshop/audio/split-loop.sh`
**Skill:** `.claude/skills/manage-audio/SKILL.md`

### Test 6.1 — Split a generated test loop

First, create a test audio file with distinct sound/silence segments:
```bash
# Create a 3-second file: 0.5s tone, 0.3s silence, 0.5s tone, 0.3s silence, 0.5s tone, remainder silence
sox -n /tmp/test-loop.wav \
  synth 0.5 sine 440 : \
  pad 0 0.3 : \
  synth 0.5 sine 660 : \
  pad 0 0.3 : \
  synth 0.5 sine 880
ffmpeg -v quiet -y -i /tmp/test-loop.wav /tmp/test-loop.mp3
```

Then split:
```bash
./workshop/audio/split-loop.sh /tmp/test-loop.mp3 /tmp/split-output --prefix tone
```

**Expected:**
- Exit code 0
- Creates 3 files: `tone_01.mp3`, `tone_02.mp3`, `tone_03.mp3`
- Each file is non-empty and non-silent
- Prints segment details (duration, RMS)

### Test 6.2 — No silence gaps (single segment)

```bash
sox -n /tmp/continuous.wav synth 2.0 sine 440
ffmpeg -v quiet -y -i /tmp/continuous.wav /tmp/continuous.mp3
./workshop/audio/split-loop.sh /tmp/continuous.mp3 /tmp/split-continuous --prefix cont
```

**Expected:**
- Warns that no splits were detected
- Falls back to copying as a single segment
- Creates `cont_01.mp3`

### Test 6.3 — Missing input file

```bash
./workshop/audio/split-loop.sh /tmp/nonexistent.mp3
```

**Expected:**
- Exit code 1
- Prints `ERROR: File not found`

### Test 6.4 — No arguments

```bash
./workshop/audio/split-loop.sh
```

**Expected:**
- Exit code 1
- Prints usage instructions

---

## Tool 7: build-sprite

**Script:** `workshop/audio/build-sprite.sh`
**Skill:** `.claude/skills/manage-audio/SKILL.md`

### Test 7.1 — Build sprite from individual files

First, create 3 short test MP3s:
```bash
mkdir -p /tmp/test-sfx
for name in hit block dodge; do
  sox -n "/tmp/test-sfx/${name}.wav" synth 0.5 sine $((RANDOM % 500 + 300))
  ffmpeg -v quiet -y -i "/tmp/test-sfx/${name}.wav" "/tmp/test-sfx/${name}.mp3"
  rm "/tmp/test-sfx/${name}.wav"
done
```

Then build:
```bash
./workshop/audio/build-sprite.sh /tmp/test-sfx/ --output combat-sprites --outdir /tmp/test-sprite
```

**Expected:**
- Exit code 0
- Creates `/tmp/test-sprite/combat-sprites.mp3` (combined audio)
- Creates `/tmp/test-sprite/combat-sprites.json` (Howler manifest)
- Manifest has `src` array and `sprite` object
- Each entry in `sprite` has `[offset, duration]` as a 2-element array
- Entries for: `hit`, `block`, `dodge`
- Offsets are sequential (each starts after previous ends + gap)

### Test 7.2 — Verify manifest structure

```bash
python3 -c "
import json
m = json.load(open('/tmp/test-sprite/combat-sprites.json'))
print('src:', m.get('src'))
print('sprite entries:', len(m.get('sprite', {})))
for name, timing in sorted(m.get('sprite', {}).items()):
    print(f'  {name}: offset={timing[0]}ms, duration={timing[1]}ms')
assert 'hit' in m['sprite'], 'Missing hit'
assert 'block' in m['sprite'], 'Missing block'
assert 'dodge' in m['sprite'], 'Missing dodge'
# Verify offsets are ordered
offsets = [m['sprite'][k][0] for k in ['hit', 'block', 'dodge']]
assert offsets == sorted(offsets), f'Offsets not ordered: {offsets}'
print('\\nAll checks passed!')
"
```

**Expected:**
- All assertions pass
- 3 sprite entries with sequential offsets

### Test 7.3 — Empty directory

```bash
mkdir -p /tmp/empty-sfx
./workshop/audio/build-sprite.sh /tmp/empty-sfx/
```

**Expected:**
- Exit code 1
- Prints usage (no MP3 files found)

---

## Tool 8: validate-canon

**Script:** `workshop/canon/validate-canon.sh`
**Skill:** `.claude/skills/validate-canon/SKILL.md`

### Test 8.1 — Validate current state

```bash
bash workshop/canon/validate-canon.sh
```

**Expected:**
- Exit code 0
- Prints `=== VALIDATION PASSED ===`
- Reports farmer.ink exists
- Warns about missing dialogue files (weaponsmith, armorer, etc.) — these are expected warnings, not errors
- Cross-references pass

### Test 8.2 — Add a price mismatch

Create a dialogue file with a wrong price and verify the validator catches it:
```bash
cat > /tmp/test-price.ink << 'INK'
-> start
=== start ===
# speaker: Weaponsmith
This short sword is yours for just 5 silver!
+ [Buy it] -> END
INK
cp /tmp/test-price.ink assets/dialogue/weaponsmith.ink
bash workshop/canon/validate-canon.sh
```

The manifest says `short_sword` costs 8 silver, but the dialogue says 5.

**Expected:**
- Should report a price mismatch error or warning for weaponsmith.ink
- (After test, clean up: `rm assets/dialogue/weaponsmith.ink`)

### Test 8.3 — Broken manifest JSON

```bash
bash workshop/canon/validate-canon.sh --manifest /dev/null
```

**Expected:**
- Exit code 1
- Reports manifest is not valid JSON
- Prints `=== VALIDATION FAILED ===`

### Test 8.4 — Cross-reference integrity

Verify the validator checks that:
- Every NPC referenced in a location exists in the `npcs` section
- Every NPC's location exists in the `locations` section
- Every enemy referenced in encounters exists in the `enemies` section

The current manifest should pass all of these. To verify it's actually checking, temporarily break a reference:
```bash
python3 -c "
import json
m = json.load(open('docs/canon/state-manifest.json'))
m['locations']['farm']['npcs'] = ['ghost_npc']
json.dump(m, open('/tmp/broken-manifest.json', 'w'), indent=2)
"
bash workshop/canon/validate-canon.sh --manifest /tmp/broken-manifest.json
```

**Expected:**
- Reports an error about `ghost_npc` not being defined
- Exit code 1

---

## Agent-Readiness Checks

These aren't about individual tools — they're about the overall experience of a fresh agent picking up the workshop.

### Test A.1 — Skill descriptions load

Verify all skills have description frontmatter that would auto-load:
```bash
for skill in write-dialogue design-map generate-sprites manage-audio validate-canon; do
  echo "=== $skill ==="
  head -3 ".claude/skills/$skill/SKILL.md"
  echo ""
done
```

**Expected:** Each skill has `---` frontmatter with a `description:` field.

### Test A.2 — Skills reference correct file paths

Grep all skill docs for file paths and verify each referenced file exists:
```bash
grep -roh 'workshop/[^ ]*\.\(ts\|sh\)' .claude/skills/ | sort -u | while read f; do
  if [ -f "$f" ]; then
    echo "OK: $f"
  else
    echo "MISSING: $f"
  fi
done
```

**Expected:** All referenced files exist. No MISSING lines.

### Test A.3 — npm scripts work

```bash
npm run compile-ink -- assets/dialogue/farmer.ink 2>&1 | tail -1
npm run test-dialogue -- assets/dialogue/farmer.ink "0,0" 2>&1 | tail -1
npm run lint-dialogue -- assets/dialogue/farmer.ink 2>&1 | tail -1
npm run tiled-to-ascii -- assets/maps/test-town.json 2>&1 | tail -1
npm run validate-canon 2>&1 | tail -1
```

**Expected:** Each prints its final status line (COMPILE OK, END, LINT OK, DONE, VALIDATION PASSED).

### Test A.4 — State manifest is internally consistent

```bash
python3 -c "
import json
m = json.load(open('docs/canon/state-manifest.json'))

# Every NPC has a location that exists
for name, npc in m['npcs'].items():
    loc = npc.get('location')
    assert loc in m['locations'], f'NPC {name} at unknown location {loc}'

# Every location NPC reference resolves
for name, loc in m['locations'].items():
    for npc in loc.get('npcs', []):
        assert npc in m['npcs'], f'Location {name} references unknown NPC {npc}'

# Every item sold by an NPC exists somewhere
for name, npc in m['npcs'].items():
    for item in npc.get('sells', []):
        found = any(item in m['items'].get(cat, {}) for cat in ['weapons', 'armor'])
        found = found or item in m['economy'].get('expenses', {})
        assert found, f'NPC {name} sells unknown item {item}'

# Stat names are consistent
assert set(m['stats']['names']['real']) == {'drive', 'insight', 'stability'}
assert set(m['stats']['names']['false']) == {'calm', 'confidence', 'passion'}

# Character creation inverse mapping targets real stats
for false_name, real_name in m['stats']['character_creation']['inverse_mapping'].items():
    assert false_name in m['stats']['names']['false'], f'Unknown false stat {false_name}'
    assert real_name in m['stats']['names']['real'], f'Unknown real stat {real_name}'

print('All consistency checks passed!')
"
```

**Expected:** Prints `All consistency checks passed!`

---

## Cleanup

After all tests, remove temp files:
```bash
rm -rf /tmp/test-loop.mp3 /tmp/test-loop.wav /tmp/continuous.mp3 /tmp/continuous.wav
rm -rf /tmp/split-output /tmp/split-continuous
rm -rf /tmp/test-sfx /tmp/test-sprite
rm -rf /tmp/test-frames /tmp/test-atlas
rm -f /tmp/broken.ink /tmp/dead-end.ink /tmp/syntax-error.ink /tmp/test-price.ink
rm -f /tmp/test-farmer.ink.json /tmp/broken-manifest.json /tmp/bad-map.json
rm -f assets/dialogue/weaponsmith.ink  # if not cleaned up in 8.2
```
