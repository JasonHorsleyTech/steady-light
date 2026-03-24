---
last_reviewed: 2026-03-24
type: brainstorm
---

# Brainstorm Session 001 — Initial Brain Dump

**Date:** 2026-03-23
**Source:** Voice-to-text stream of consciousness from Jason

## Raw Context

This is attempt #4+ at this game. Previous attempts were in Godot, which didn't work because:
- Learning curve too steep for repeated restarts
- No MCP server for Claude to interact with
- No closed-loop testing possible

## Key Decisions Made

1. **Browser-based, not Unity/Godot.** Claude can see and interact with browsers via Chrome DevTools MCP.
2. **Claude writes the engine.** Since Claude can test what it builds in-browser, it can iterate autonomously.
3. **Documentation-first approach.** Build complete game design docs through brainstorming sessions, then extract PRDs for autonomous implementation.
4. **Generic RPG aesthetics are intentional.** Boring = comfortable = vulnerable to subversion.

## The Ego Reinterpretation Mechanic

The core insight that drives the attribute system:

> When you're a child, your ego is fragile. A common defense mechanism is to reinterpret negatives as positives. A mean girl thinks she's a "straight shooter." A socially awkward nerd thinks he's "just really honest."

The game's attribute system does this mechanically:
- Player allocates points into what look like positive traits (Calm, Confidence, Passion)
- These are actually the ego's reinterpretation of deficits (lack of Drive, lack of Insight, lack of Stability)
- The paradigm shift reveals this

## The Development Loop Vision

Jason works his day job. In between, he records voice memos / brainstorm sessions that get transcribed and organized into docs. When docs are complete enough for a feature, a PRD is extracted and Claude implements it autonomously in a loop:

1. Claude reads the PRD
2. Claude writes code
3. Claude launches browser, tests via Chrome DevTools
4. Claude reads console logs, takes screenshots
5. Claude fixes issues
6. Repeat until feature works

This requires the game to have heavy debug logging — Claude's "eyes" are the console and screenshots.

## Unresolved Ideas

- The subscription trap / extraction economy as a game system (mentioned but not fleshed out)
- How NPCs mechanically embody the "confident ignorance" theme
- What the literal game world looks like (setting, art style specifics)
- Combat system (if any)
- How many acts / how long the game is
- What "growing up" looks like mechanically beyond the stat flip
- The specific moment/trigger for the paradigm shift
- Whether there are multiple paradigm shifts
