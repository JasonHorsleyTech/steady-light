# PixelLab Experiment Log

Tracking MCP generation attempts, settings used, and visual results.

## 001 — Slime Humanoid Character

- **Tool:** `create_character`
- **Mode:** standard
- **Body type:** humanoid
- **Size:** 32px (canvas 48x48)
- **Directions:** 4
- **View:** low top-down
- **Prompt:** "green slime blob monster, translucent gelatinous body, simple cute face with beady eyes, RPG enemy"
- **Style:** medium shading, single color black outline, medium detail, ai_freedom 800
- **Generation time:** ~2-3 minutes
- **Verdict:** ❌ Slime *man*, not a slime blob. Humanoid skeleton forced it into a bipedal shape. Looks like a green alien. The tool doesn't have a "blob" body type — only humanoid and quadruped.

## 002 — Slime Map Object

- **Tool:** `create_map_object`
- **Mode:** basic (no background image)
- **Size:** 64x64
- **View:** low top-down
- **Prompt:** "green slime blob, amorphous gelatinous creature, RPG enemy, translucent green body with simple beady eyes, no arms no legs"
- **Style:** medium shading, single color outline, medium detail
- **Generation time:** ~50 seconds
- **Verdict:** ✅ Actually looks like a slime blob! Amorphous ghost/blob shape, green, no limbs. Much better than the character tool for non-humanoid creatures. Single image though — no directional views.
