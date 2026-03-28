---
description: "Validate game content consistency against the canonical state manifest. Run after changing prices, dialogue, flags, or NPC data."
---

# Validate Canon

Ensure all game content is consistent with the single source of truth: `docs/canon/state-manifest.json`.

## Quick Start

```bash
npm run validate-canon
```

## When to Run

Run canon validation after:
- Changing item prices or economy values
- Writing or editing dialogue that mentions silver amounts
- Adding or renaming NPCs
- Adding or renaming flags/variables
- Modifying enemy definitions
- Changing location connections

## What It Checks

1. **Manifest structure** — Is the JSON valid?
2. **Dialogue files** — Do all NPC dialogue files referenced in the manifest exist?
3. **Price consistency** — Do silver amounts in ink dialogue match manifest prices?
4. **Flag consistency** — Are ink variables listed in the manifest?
5. **Cross-references** — Do NPC locations, enemy locations, and item references all resolve?

## The State Manifest

`docs/canon/state-manifest.json` is the single source of truth for:

- All item names, prices, and stat effects
- All NPC names, roles, and locations
- All flag/variable names and what sets/checks them
- All stat thresholds for stage unlocks
- Silver amounts for income and expenses
- Enemy definitions (stats, behavior, loot)
- Location definitions and connections

### Updating the Manifest

When you change a game value, update the manifest FIRST, then update any dialogue or code that references it. This ensures the manifest is always authoritative.

```json
{
  "items": {
    "weapons": {
      "short_sword": {
        "price": 8,
        "damage_multiplier": 1.1,
        "beats_per_attack": 1,
        "shop_description": "A fine blade! Can end combat in up to five fewer turns!",
        "description": "Marginally sharper than a stick."
      }
    }
  }
}
```

### Adding a New NPC

1. Add to `npcs` section with role, location, offers/sells, dialogue_file
2. Ensure the location exists in `locations`
3. Create the dialogue file listed in `dialogue_file`
4. Run validation

### Adding a New Flag

1. Add to the appropriate `flags` subsection (story_progression, reflection, economy)
2. Document what sets it and what checks it
3. Use the same name in ink files
4. Run validation

### Adding a New Item

1. Add to the appropriate `items` subsection (weapons, armor)
2. Include price, effects, and both `shop_description` (what the vendor says) and `description` (the truth)
3. If an NPC sells it, add to that NPC's `sells` array
4. Run validation
