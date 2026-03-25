---
description: "Write and test NPC dialogue using ink format. Compile, playtest, and lint dialogue without a browser."
---

# Write Dialogue

Write NPC dialogue for Steady Light using the ink scripting language (inkle's interactive fiction format). Compile, playtest via transcript, and lint — all without needing a browser.

## Quick Start

```bash
# Write your .ink file, then:
npx tsx workshop/dialogue/compile-ink.ts assets/dialogue/farmer.ink
npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "0,1,0"
npx tsx workshop/dialogue/lint-dialogue.ts assets/dialogue/farmer.ink
```

## Ink Conventions for This Project

### File Organization
- One `.ink` file per NPC per chapter: `assets/dialogue/<npc_name>.ink`
- Compiled output goes alongside: `assets/dialogue/<npc_name>.ink.json`
- Chapter-specific variants: `assets/dialogue/chapter-2/<npc_name>.ink`

### Tag Format
Every line of dialogue should have a speaker tag. Mood and SFX tags are optional:
```ink
# speaker: Farmer
# mood: friendly
Hey there. Barn's out back if you need a place to stay.

# speaker: Farmer
# mood: stern
# sfx: coin-clink
Rent's 3 silver a day. No exceptions.
```

### Variable Naming
- Snake_case, prefixed by context: `farmer_met`, `drink_count`, `guild_joined`
- Booleans: past tense verbs: `farmer_met`, `bank_account_opened`
- Counters: `_count` suffix: `drink_count`, `slime_kill_count`
- All variables MUST be listed in `docs/canon/state-manifest.json` under `flags`

### Knot Naming
- Snake_case: `farmer_morning_greeting`, `weaponsmith_pitch_sword`
- Start knot: always `start`
- Convention: `<npc>_<context>_<topic>`

### Tone Rules (from narrative docs)
- Line length: 4-18 words, present tense preferred, concrete images
- NPC speech: conviction that reveals ignorance through specifics
- No lecturing, diagnostics, therapy-speak, or overt stat names
- Use sensory anchors ("air feels cooler"), physical verbs ("plant your feet")
- Shop pitches exaggerate. Raw numbers are never shown to the player.

### Price References
Always reference `docs/canon/state-manifest.json` for prices. Never hardcode a number — if the manifest says a sword costs 8 silver, the dialogue says "8 silver."

After writing dialogue that mentions prices, run `workshop/canon/validate-canon.sh` to verify consistency.

## Workflow

### Writing a new dialogue
1. Check `docs/canon/state-manifest.json` for the NPC's role, location, and any referenced prices/flags
2. Write the `.ink` file following conventions above
3. Compile: `npx tsx workshop/dialogue/compile-ink.ts assets/dialogue/<npc>.ink`
4. Playtest all choice paths: `npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/<npc>.ink "0,0,0"`
5. Lint: `npx tsx workshop/dialogue/lint-dialogue.ts assets/dialogue/<npc>.ink`
6. Validate canon: `bash workshop/canon/validate-canon.sh`

### Editing existing dialogue
1. Read the `.ink` file (it reads like a screenplay)
2. Run `test-dialogue.ts` with the choice sequence you want to check
3. Edit the text
4. Recompile, re-test transcript, lint

### Testing all paths
Run test-dialogue with different choice sequences to cover branches:
```bash
# First choice at every fork
npx tsx workshop/dialogue/test-dialogue.ts farmer.ink "0,0,0,0"
# Second choice at every fork
npx tsx workshop/dialogue/test-dialogue.ts farmer.ink "1,1,1,1"
# Specific path
npx tsx workshop/dialogue/test-dialogue.ts farmer.ink "0,1,0,2"
```

## Ink Quick Reference

```ink
-> start

=== start ===
# speaker: Farmer
Morning. Field's got slimes again.
+ [Offer to help] -> offer_help
+ [Ask about pay] -> ask_pay
+ [Say nothing] -> say_nothing

=== offer_help ===
# speaker: Farmer
# mood: relieved
Good. Grab a stick from the barn.
-> END

=== ask_pay ===
# speaker: Farmer
# mood: practical
One silver per slime. Fair work for fair pay.
+ [Accept] -> offer_help
+ [Too low] -> haggle

=== haggle ===
# speaker: Farmer
# mood: firm
It's what they're worth. Take it or leave it.
-> END
```

### Key ink syntax
- `-> knot_name` — divert to knot
- `=== knot_name ===` — knot definition
- `+ [choice text]` — sticky choice (can revisit)
- `* [choice text]` — one-time choice (disappears after use)
- `{flag_name}` — read a variable
- `~ flag_name = value` — set a variable
- `{flag_name: text if true | text if false}` — conditional text
- `# tag_name: value` — tag (read by game engine)
- `-> END` — end dialogue
- `INCLUDE other_file.ink` — include another ink file
