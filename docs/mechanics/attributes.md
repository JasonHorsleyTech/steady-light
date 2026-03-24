---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Attribute System

## The Three Core Stats

### Drive
The ambition and initiative to pursue goals. Sub-traits: **Determination** + **Patience**.
- **In combat:** Gained by landing attacks. Lost by taking hits.
- **At zero:** You give up (lose the fight).
- **Unlock (Stage 3):** Fights move from abstract grid to overworld. Terrain matters. You and enemies can leave combat by moving out of range.

### Insight
Self-awareness and ability to see beyond your own perspective. Sub-traits: **Wisdom** + **Humility**.
- **In combat:** Gained by blocking attacks. Lost when your attack is blocked.
- **At zero:** You lose (exact flavor TBD — confusion? blindness?).
- **Unlock (Stage 2):** See enemy's next action type (Attack, Move, Defend). Dodge/block/parry becomes meaningfully possible.

### Stability
Emotional groundedness and consistency. Sub-traits: **Fortitude** + **Perception**.
- **In combat:** Gained by dodging attacks. Lost when you whiff into empty space (enemy dodged you).
- **At zero:** You enter a daze and flee.
- **Unlock (Stage 4):** Move+act on the same beat. Full 4-action chains available.

### Symmetry
Enemies follow the exact same gain/loss rules. If you dodge their attack, *they* lose stability. If you block, *they* lose insight. If you hit them, *they* lose drive.

---

## The Deception (Character Creation)

At character creation, the player sees three bars (red, green, blue) and is asked to distribute a few points from a 5-5-5 base. The UI presents them as positive traits:

| Player Sees     | Color | Actually A Lack Of | Real Stat      |
|----------------|-------|-------------------|----------------|
| **Calm**       | Blue  | Drive / Ambition  | **Drive**      |
| **Confidence** | Red   | Insight / Self-awareness | **Insight** |
| **Passion**    | Green | Stability / Groundedness | **Stability** |

The ego reinterpretation: a child reframes their deficits as strengths. "I'm calm" means "I lack drive." "I'm confident" means "I lack insight." "I'm passionate" means "I lack stability."

---

## The Flip Mechanic (Three-Night Reflection Arc)

### How It Works

After combat, your stats (shown as a single "Energy" bar early on) don't auto-restore. An NPC suggests drinking at the bar (1 silver). This creates a fork:

**If you drink:** Energy restores. But when you go to sleep:
> "You feel good and buzzed. You fall asleep the moment your head hits the pillow."
No reflection. No level-up. The drink blocks growth.

**If you DON'T drink:** When you go to sleep:
> "You lay down but can't seem to get to sleep. You think about your day."

You get a choice:
- Try to stay calm
- Try to stay confident
- Try to stay passionate

You level up the **opposite** stat (the real one). Choosing "try to stay calm" levels up Drive, because you're confronting the illusion that calm = peace when it's actually calm = stuck.

### Three Reflections Per Stat

Each stat flips after three nights of reflection:

#### Calm → Drive
1. "You remind yourself to stay calm. It helps, for a while."
2. "You take deep breaths. The quiet stretches on, and you wonder how long you've been here."
3. "You tell yourself this is fine. But maybe fine isn't what you want. Maybe you've been calling it calm so you don't have to call it stuck." **[FLIP]**

#### Confidence → Insight
1. "You tell yourself you know what you're doing. Even if you don't."
2. "You remember your bold choices today. And the mistakes you didn't admit."
3. "You've been calling it confidence. But maybe real confidence starts with humility." **[FLIP]**

#### Passion → Stability
1. "You throw yourself into the memory of the fight, heat still in your veins."
2. "Your pulse pounds in your ears. The fire feels good... until it doesn't."
3. "You've been calling it passion. But it burns too hot, too fast. Maybe it's time to stand your ground." **[FLIP]**

### Morning After Flip (Tone Anchors)
- **Drive:** "You've got somewhere to be, and you start moving."
- **Insight:** "You see yourself in it — just one part of the whole."
- **Stability:** "You plant your feet before you rise."

---

## Stage 0: The Energy Bar Illusion

Before any flips, the three stats are shown as a single combined "Energy" bar. An NPC mis-explains combat:
- "You have an energy bar. When it hits zero, you're done."
- "You're pretty beat up! Looks like you could use a drink at the bar here."

The player has no reason to think there are three separate stats. This is the first layer of deception.

**Stage 1** (after first flip): The UI splits Energy into three bars — Drive, Insight, Stability. Attacks now damage specific bars.

---

## Open Questions
- Exact number of redistribute points at character creation?
- Can you respec after flips?
- How do sub-stats (Determination/Patience, Wisdom/Humility, Fortitude/Perception) manifest mechanically beyond flavor?
- Do you need to flip all three stats to progress to Act 2, or can you leave town with partial flips?
