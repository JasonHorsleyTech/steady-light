---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Milestone 02: Dialogue System

## Goal
Build a reusable dialogue system that renders text boxes, supports branching dialogue trees, and handles player choices. Build the dialogue bridge for AI verification.

## Depends On
- Milestone 00 (Project Scaffolding)

## Deliverables

### 1. Dialogue Data Format
- JSON-based dialogue tree format:
```json
{
  "id": "farmer_intro",
  "nodes": {
    "greeting": {
      "speaker": "Farmer",
      "text": "Morning. You the new one? Barn's out back.",
      "choices": [
        {"text": "Thanks. What do I do here?", "next": "explain_work"},
        {"text": "Where can I get stronger?", "next": "suggest_guild"},
        {"text": "(Leave)", "next": null}
      ]
    },
    "explain_work": {
      "speaker": "Farmer",
      "text": "Slimes in the field. Clear 'em, I'll pay you. Simple work.",
      "choices": [
        {"text": "Got it.", "next": null}
      ]
    }
  },
  "start": "greeting"
}
```

### 2. Dialogue Runner
- Loads a dialogue tree by ID
- Tracks current node
- Handles player choice selection → advance to next node
- Emits events: `dialogue-started`, `dialogue-advanced`, `dialogue-ended`
- Handles `null` next → end dialogue

### 3. Dialogue Renderer (React)
- Text box at bottom of screen (classic RPG style)
- Speaker name displayed
- Text appears (instant for now — typewriter effect is polish)
- Numbered choices rendered when available
- Keyboard input: number keys to select, Enter to advance non-choice nodes

### 4. Dialogue Bridge
```
[STEADY-LIGHT:BRIDGE:DIALOGUE]
  NPC: Farmer | Node: greeting
  Text: "Morning. You the new one? Barn's out back."
  Choices:
    [1] "Thanks. What do I do here?" → explain_work
    [2] "Where can I get stronger?" → suggest_guild
    [3] "(Leave)" → END
  History: [greeting]
```

### 5. Dev Route
- `/dev/dialogue/farmer-intro` loads the farmer intro tree
- `/dev/dialogue/test` loads a test tree with branching paths
- Dialogue bridge enabled by default

## Acceptance Criteria

1. Navigate to `/dev/dialogue/test` — dialogue box renders with text and choices
2. Press "1" — dialogue advances to the correct next node
3. Console shows dialogue bridge with current node, text, and available choices
4. Reaching a `null` next node ends the dialogue and logs `dialogue-ended`
5. `window.STEADY_LIGHT.dialogue.getState()` returns current tree, node, and history
6. Multiple dialogue trees can be loaded by changing the URL path

## Notes
- No NPC portraits yet — just name + text
- No typewriter text effect yet — that's polish
- The tree format should support future features (conditions, flags) but doesn't need to implement them yet
