---
last_reviewed: 2026-03-24
type: brainstorm
---

# Brainstorm Session 002 — Warehouse Planning

**Date:** 2026-03-24
**Source:** Voice-to-text from Jason + Claude structuring session

## Key Decisions Made

1. **Document metadata convention adopted.** All docs get `last_reviewed`, `design_confidence`, and `implementation_confidence` frontmatter.
2. **Three-resolution roadmap structure.** High (full chapter) → Medium (thematic chunks) → Low (overnight stepping stones).
3. **Chapter 1 broken into 14 milestones (00-13).** Each achievable by one overnight Ralph loop. See `docs/roadmap/chapter-1/`.
4. **Music (Milestone 10) can parallel the main track.** Independent until integration at Milestone 11.
5. **Islands & Bridges philosophy formalized.** ~80% of code is AI testing infrastructure. ASCII bridges, timing translators, dev routes, debug flags.
6. **React + Vite + TypeScript + Canvas as likely tech stack.** Final call deferred to Milestone 00 implementation.
7. **Dev route system designed.** `/dev/{system}/{scenario}` for isolated component testing.

## Confidence Assessment (as of this session)

| Area | Design | Implementation |
|------|--------|---------------|
| Chapter 1 flow (char creation → departure) | High | Medium |
| Stat system + flip mechanic | High | High |
| Combat Stage 0 | High | High |
| Economy treadmill | High | Medium |
| Music/rhythm combat | High | Medium |
| Chapter 2 (wilds) | Medium | Low |
| Chapter 3 (big city / AI dialogue) | Low | Low |
| Chapter 4 (return) | Low | Low |

## Planning Cadence Target

- Each night: one Ralph loop completes one milestone
- Each morning: Jason reviews, adjusts next 2-3 milestones
- Always 2-3 days queued ahead
- Monday example: check Sunday's work, have Mon/Tue/Wed ready, plan Thursday

## Unresolved From This Session

- Exact redistribution points at character creation (suggested 3)
- Departure trigger: stat threshold vs story flag vs player choice
- PixiJS vs raw Canvas 2D (deferred to Milestone 00)
- State management approach (Zustand vs React Context — deferred)
- Whether to split Milestone 13 into sub-milestones (likely yes)
- Wolf encounter mechanics for the departure sequence
- How to generate consistent pixel art across assets (pipeline TBD)
