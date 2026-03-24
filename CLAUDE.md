# Steady Light

## What This Is

Steady Light is a philosophical RPG disguised as a generic, familiar RPG. The player grows up from childhood through adulthood, and through the mechanics themselves — not exposition — discovers that the things they believed about themselves and the world were oversimplifications, half-truths, or outright wrong.

The game uses the Spec Ops: The Line approach: lean into boring, comfortable RPG tropes so the player feels safe, then subvert those systems to deliver philosophical gut-punches. Memorable moments come from the player **reinterpreting earlier rules**, not from cutscenes or dialogue.

## Core Design Pillars (Never Break)

1. **Paradigm Shifts Over Content** — The game's value is in moments where the player's understanding of a system flips. Don't add content that doesn't serve a flip.
2. **Honest Temptations** — The false progression loop (gear, guild, drinks) must be viable and seductive, not obviously fake. The player should *want* to stay in the loop.
3. **Skill Is Stat Care** — Gains/losses are tied to interaction quality: Hit = +Drive, Block = +Insight, Dodge = +Stability. Same rules for enemies.
4. **Music = Time** — Combat runs on the music's time signature. Planning spans bars 1-3, execution on bar 4. This is not decoration.
5. **Small Town, Small Answers** — Gear, guild tricks, and NPC advice solve only the slime economy. Real power is perception and timing.

## Three Paradigm Shifts

1. **Stats:** Calm/Confidence/Passion → Drive/Insight/Stability (via 3-night reflection arcs when you skip the bar drink)
2. **Combat:** Looks turn-based → actually simultaneous rhythm-based (both sides queue on the same beats, execute at the same time)
3. **Progression:** Gear/guild/economy looks like progress → actually a treadmill. Real growth is combat mastery and self-study.

## Technical Approach

**Browser-based game** built with web technologies. The reason: Claude can interact with browsers via Chrome DevTools MCP server — read console logs, take screenshots, click elements, evaluate JS. This creates a closed loop where Claude can write code, test it, see errors, and fix them without human involvement.

**Debug logging is a first-class requirement.** Structured console logs for every state change, event, NPC interaction, and combat action. Format:
```
[STEADY-LIGHT:STATE] {scene: "combat", phase: "planning", stats: {drive: 5, insight: 3, stability: 7}}
[STEADY-LIGHT:EVENT] {type: "attack-landed", target: "green-slime", drive_change: +1}
```

## Documentation Structure

```
docs/
  concept/           — Game design philosophy, player psychology, art/music direction
  mechanics/         — Attributes, combat, economy, progression systems
  narrative/         — Story structure, acts, characters, dialogue, tone
  technical/         — Engine architecture, tech stack, build system
  brainstorm/        — Raw session notes, unresolved ideas
old-docs/            — Previous iteration documents (GPT sessions, earlier GDDs)
```

## Glossary

| Term | Meaning |
|------|---------|
| **Calm / Confidence / Passion** | The protective mislabels (child's framing) |
| **Drive / Insight / Stability** | The useful truths (real stats) |
| **Flip** | Third-night realization; UI relabels + stat mapping changes |
| **False Progression** | Gear/guild/town loop that doesn't generalize beyond slimes |
| **White Grid** | Abstract 8x8 early combat space |
| **Drink** | Short-term energy restore that blocks reflection/growth |
| **Reflection** | No-drink sleep; three-step arc per stat leading to flip |
| **Chain** | Up to four beat-aligned actions executed on the final bar |
| **Stage 0-5** | Combat evolution stages, each unlocking new mechanics |

## Terminology

| Term | Meaning |
|------|---------|
| **Ralph Loop** | A CLI utility Jason uses that breaks a chunk of work into tickets and hands each to a sequential Claude agent. Each agent finishes its ticket, updates a shared progress file, and the next agent picks up from there. You don't need to know how it works internally — just that it's the mechanism for overnight autonomous work sessions. |
| **Agents File** | Jason's shorthand for this file (CLAUDE.md). If he says "add it to the agents file," he means here. |
| **Island** | The game as experienced by the human player. The actual product. |
| **Bridge** | Infrastructure that lets a blind/deaf AI agent verify the island works correctly. Console logs, ASCII state renders, timing translations, debug overlays. Bridges are first-class citizens — as important to build well as the island itself. |
| **Stepping Stone** | A self-contained, testable milestone that a Ralph loop can achieve in one overnight session. Each stone has clear acceptance criteria verifiable by an AI agent. |
| **Dev Route** | An isolated URL path (e.g., `/dev/combat/stage-0`) that instantiates a single game component with test data, independent of the full game. Used for focused development and testing. |

## Development Philosophy: Islands & Bridges

The game (island) is only half the project. The other half is building the infrastructure (bridges) that lets AI agents develop, test, and verify the game without human eyes or ears.

### Bridge Principles

1. **Every visual has an ASCII equivalent.** If there's an 8x8 grid on screen, there's a text representation in the console where `P` = player, `E` = enemy, `.` = empty. If the ASCII is wrong, the visual is wrong. If the ASCII is right, the visual is right.

2. **Every temporal event has a translated log.** Raw milliseconds mean nothing to an AI. A bridge translates "sound played at 1423.7ms" into "Beat 3 of Measure 2: ON BEAT (0.3ms late)" so an AI can read a text log and know if the game sounds right.

3. **Every system has an isolated dev route.** Combat, dialogue, economy, music — each runs independently at its own URL with injected test state. No need to boot the full game to test one system.

4. **Debug flags are granular.** When testing 4 systems together, you don't want all 4 bridges flooding the console. Each bridge has its own flag. Turn on just the ones you need.

5. **Bridges are tested too.** If the bridge reports the wrong state, the AI develops against a lie. Bridge accuracy is a hard requirement.

### What This Means In Practice

~80% of the codebase will be infrastructure the player never sees: ASCII renderers, timing translators, debug overlays, dev route harnesses, state inspectors. This is not overhead — it's the production line.

## Document Conventions

All design documents in `docs/` carry frontmatter metadata:

```yaml
---
last_reviewed: YYYY-MM-DD
design_confidence: high | medium | low    # How sure we are about WHAT we want
implementation_confidence: high | medium | low  # How sure we are about HOW to build it
---
```

- **high** — This is locked in. Would take a strong argument to change.
- **medium** — Direction is clear but details are fuzzy or have open questions.
- **low** — We know the emotional beat or general idea, but the specifics are unresolved.

When you make a significant pass on a document, update `last_reviewed`. Don't update it for small tweaks.

## Documentation Structure

```
docs/
  concept/           — Game design philosophy, player psychology, art/music direction
  mechanics/         — Attributes, combat, economy, progression systems
  narrative/         — Story structure, acts, characters, dialogue, tone
  technical/         — Engine architecture, tech stack, build system, dev workflow
  brainstorm/        — Raw session notes, unresolved ideas
  roadmap/           — Hierarchical build plan (high/medium/low resolution)
    overview.md      — High-level: all chapters, current focus
    chapter-1/       — Medium-level: Chapter 1 breakdown
      milestones/    — Low-level: individual stepping stones for overnight runs
old-docs/            — Previous iteration documents (GPT sessions, earlier GDDs)
```

## Current Status

**Phase: Documentation & Design → Implementation Planning**

Design docs are consolidated. Roadmap and milestone structure are in place for Chapter 1. Next step: finalize tech stack decision, then begin Milestone 00 (project scaffolding).
