---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Milestone 05: NPC System

## Goal
Place NPCs in the world, allow the player to talk to them, and wire up the dialogue system. The farmer gives the first quest.

## Depends On
- Milestone 02 (Dialogue System)
- Milestone 04 (Scene Manager & Town)

## Deliverables

### 1. NPC Entity
- NPCs placed in scenes at defined positions
- Visual: labeled colored sprite (placeholder)
- Interaction trigger: player faces NPC + presses action key within 1 tile
- Each NPC has a dialogue tree ID that changes based on game flags

### 2. NPC Manager
- Tracks all NPCs per scene
- Handles interaction detection
- Routes to correct dialogue tree based on current game state / flags
- Events: `npc-interact`, `npc-dialogue-start`, `npc-dialogue-end`

### 3. Farmer NPC (First Quest)
- Placed at the farm
- Initial dialogue: introduces barn, explains slime clearing work, mentions the bar
- After first slime fight: pays player, suggests bar/shops
- Dialogue trees written in JSON format from Milestone 02

### 4. Quest Flag System (Minimal)
- Simple key-value flag store in GameState
- `flags.farmer_met`, `flags.first_slime_cleared`, etc.
- Dialogue tree selection can check flags
- No quest log UI yet — just the underlying flag system

### 5. NPC Bridge
```
[STEADY-LIGHT:BRIDGE:NPC]
  Scene: Farm
  NPCs: Farmer(8,4) facing S
  Player can interact: Farmer (1 tile away, facing)
  Active dialogue: none
  Flags: {farmer_met: false, first_slime_cleared: false}
```

### 6. Dev Route
- `/dev/npc/farmer-intro` — farm scene with farmer NPC, player nearby, no flags set
- `/dev/npc/farmer-post-combat` — same scene but `first_slime_cleared: true`

## Acceptance Criteria

1. Navigate to `/dev/npc/farmer-intro` — farmer NPC visible on the farm
2. Walk to farmer, face them, press action key — dialogue starts
3. Dialogue bridge shows farmer's dialogue tree with choices
4. Complete dialogue — flag `farmer_met` set to true
5. Navigate to `/dev/npc/farmer-post-combat` — farmer gives different dialogue
6. NPC bridge shows nearby NPCs and interaction availability
7. Cannot interact with NPC from 2+ tiles away

## Notes
- Only the farmer needs full dialogue for this milestone. Other NPCs can be placeholders ("Not implemented yet").
- The flag system is intentionally minimal — just a dict of booleans. Complex quest tracking isn't needed for Chapter 1.
