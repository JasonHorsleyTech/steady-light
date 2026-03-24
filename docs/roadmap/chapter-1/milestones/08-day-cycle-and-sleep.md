---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Milestone 08: Day Cycle & Sleep

## Goal
Build the day/night cycle, the sleep mechanic, and the critical drink/no-drink fork. This is the gateway to the reflection system — the player's choice to drink or not drink determines whether they can grow.

## Depends On
- Milestone 07 (Economy System — drink costs silver, rent auto-drafts)

## Deliverables

### 1. Day/Night Cycle
- Day counter in GameState
- Time-of-day phases: Morning → Daytime → Evening → Night
- Actions advance time: chores = morning, combat = daytime, shops = evening
- At night, player is directed to the barn
- Visual: subtle palette shift or overlay tint (placeholder — can be text label)

### 2. Bar Drink Mechanic
- Available at bar during evening
- Costs 1 silver
- Restores displayed "Energy" to full (resets combined stat display)
- Sets flag: `drank_today: true`
- NPC dialogue: warm, friendly, makes you feel good about drinking

### 3. Sleep Mechanic
- Triggered at barn bed
- **If `drank_today: true`:**
  - "You feel good and buzzed. You fall asleep the moment your head hits the pillow."
  - No reflection. Day ends. Advance to morning.
- **If `drank_today: false`:**
  - "You lay down but can't seem to get to sleep. You think about your day."
  - Reflection choice offered (see Milestone 09)
  - For this milestone: just show the prompt and log the fork. Actual reflection logic is Milestone 09.
- Either way: new day starts, rent auto-drafts, `drank_today` resets

### 4. Morning
- Day counter increments
- Farmer has morning dialogue (varies slightly by day)
- Stats partially restored from sleep (exact formula TBD — sleep heals more than drink in the long run)
- Player can begin daily activities

### 5. Day Cycle Bridge
```
[STEADY-LIGHT:BRIDGE:DAYCYCLE]
  Day: 5 | Phase: evening
  Drank today: false
  Actions completed: chores(morning), slime×2(daytime), shop(evening)
  Sleep status: not yet
  --- Sleep Preview ---
  Will trigger: reflection choice (no drink)
  Reflection progress: Calm 1/3, Confidence 0/3, Passion 0/3
```

### 6. Dev Route
- `/dev/day-cycle/full-day` — plays through a full day with choice points
- `/dev/day-cycle/drink-path` — evening → bar → drink → sleep → morning
- `/dev/day-cycle/sober-path` — evening → barn → sober sleep → reflection prompt → morning

## Acceptance Criteria

1. Time advances through phases as player does activities
2. Going to bar + buying drink → `drank_today` flag set, energy restored
3. Sleeping after drinking → instant sleep text, no reflection prompt
4. Sleeping without drinking → "can't sleep" text, reflection prompt appears
5. Day ends → rent auto-drafts, day counter increments, phase resets to morning
6. Day cycle bridge accurately shows current phase, drink status, and sleep preview
7. `window.STEADY_LIGHT.getState().day` increments correctly

## Notes
- The reflection CHOICE appears here but the actual reflection LOGIC (stat leveling, flip tracking) is Milestone 09
- The drink should feel like the correct choice early on — the NPC sells it well, the energy refill is immediate and visible
- Sleeping without drinking should feel slightly uncomfortable/uncertain — the player isn't sure they made the right call
