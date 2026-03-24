---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: medium
---

# Roadmap Overview

## Resolution Levels

The roadmap operates at three zoom levels:

| Level | Scope | Example |
|-------|-------|---------|
| **High** | Full chapter from start to finish | "Chapter 1: Small Town — character creation through departure" |
| **Medium** | A thematic chunk within a chapter | "First combat encounter + town loop establishment" |
| **Low** | A single overnight stepping stone | "8x8 grid renders, player moves, ASCII bridge works" |

Each low-level milestone is a single unit of work for an overnight Ralph loop — achievable by chained Claude agents in one session, with acceptance criteria verifiable by an AI agent.

## High-Level: Chapter Overview

### Chapter 1 — Small Town: "Don't Be an NPC"
**Design confidence: high | Implementation confidence: medium**

Player creates character, arrives in town, enters the false progression loop (farm → fight slimes → buy gear → drink → sleep → repeat), discovers the loop is a treadmill, undergoes stat flips via reflection, and eventually leaves.

This is the current focus. See [chapter-1/overview.md](chapter-1/overview.md) for the medium-level breakdown.

### Chapter 2 — The Wilds: "The Answer Is Not the Cabin"
**Design confidence: medium | Implementation confidence: low**

Player ventures outside, encounters real threats, discovers that isolation isn't the answer. Self-reliance has limits. Combat stages 2-3 unlock. New time signatures in music.

The emotional beats are clear. The mechanics for how "the answer isn't isolation" plays out are not fully specced.

### Chapter 3 — Big City: "Confidence"
**Design confidence: low | Implementation confidence: low**

Gameplay shifts from combat to social dynamics. Possible interactive dialogue system (LLM-driven — pricing and implementation are major open questions). This chapter is a significant left turn technically.

### Chapter 4 — Return: "Full Circle"
**Design confidence: low | Implementation confidence: low**

Player returns to small town with new understanding. Fixes systemic problems. Emotional payoff. Very little specced beyond the emotional arc.

## Development Phases

### Phase 1: The Warehouse (NOW)
Build the development infrastructure: project scaffolding, dev route system, bridge system, debug logging, modular architecture. No game content yet — just the factory floor.

### Phase 2: Chapter 1 Core Systems
Build the individual game systems (combat, dialogue, economy, progression, audio) as isolated modules, each testable via dev routes.

### Phase 3: Chapter 1 Integration
Wire the systems together into a playable Chapter 1 flow. Character creation → town → combat → economy → sleep → reflection → departure.

### Phase 4: Chapter 1 Polish
Content pass: all dialogue, all NPC interactions, all edge cases, paradigm shift moments tuned. Placeholder art/music replaced with real assets.

### Phase 5+: Chapters 2-4
Each subsequent chapter follows the same pattern: design docs → isolated systems → integration → polish.

## Stepping Stone Principles

Each overnight milestone must:
1. **Have clear acceptance criteria** — An AI agent can verify pass/fail
2. **Be achievable in one session** — ~4-8 hours of autonomous agent work
3. **Build on the previous stone** — No orphaned work
4. **Leave the project in a working state** — Nothing broken at the end
5. **Include bridge work** — If it adds a visual, it adds the ASCII equivalent

## Planning Cadence

Jason's target workflow:
- Each night: one Ralph loop runs, completing one milestone
- Each morning: Jason reviews the work, adjusts the next 2-3 milestones if needed
- Always 2-3 days of milestones queued ahead
- Monday → check Sunday night's work, have Mon/Tue/Wed milestones ready, plan Thursday's
