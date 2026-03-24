---
last_reviewed: 2026-03-24
design_confidence: high
implementation_confidence: high
---

# Milestone 07: Economy System

## Goal
Build the silver economy: earning from chores and slime clearing, spending at shops and the bar, barn rent auto-draft, bank with fees. The treadmill should be functional — a player following NPC advice should break even or slowly bleed.

## Depends On
- Milestone 05 (NPC System — shops are NPCs)
- Milestone 06 (Basic Combat — slime clearing earns silver)

## Deliverables

### 1. Wallet
- Silver currency tracked in GameState
- Starting amount: 0 (or small amount from intro)
- Cannot go negative (unless bank overdraft mechanic)

### 2. Income Sources
- Farm chores (talk to farmer after morning): 1 silver
- Slime clearing: 1 silver per slime (farmer pays after combat)
- Side jobs: 1 silver, random availability (25% per day)

### 3. Shops
- Weaponsmith: 2-3 items, increasing price, marginal damage improvement
- Armorer: 2-3 items, increasing price, marginal defense improvement
- Bar: drink for 1 silver ("restores energy" — blocks reflection)
- Fighters Guild: 1 silver/day membership, teaches slime-specific tips
- All shops use dialogue system for interaction

### 4. Auto-Expenses
- Barn rent: 3 silver/day, auto-drafted at day end
- Bank account fee: 5 silver/week (if player deposits)
- Guild membership: 1 silver/day (if joined)

### 5. Economy Bridge
```
[STEADY-LIGHT:BRIDGE:ECONOMY]
  Day: 4 | Silver: 6
  --- Today ---
  Income: chores(1) + slime×2(2) = 3
  Expenses: rent(3) + drink(1) = 4
  Net: -1
  --- Inventory ---
  Weapon: Basic Stick (tier 0)
  Armor: None
  --- Running Total ---
  Day 1: +3 -3 = 0
  Day 2: +2 -4 = -2 (cumulative: -2)
  Day 3: +3 -3 = 0 (cumulative: -2)
  Day 4: +3 -4 = -1 (cumulative: -3)
```

### 6. Dev Route
- `/dev/economy/day-cycle` — simulates multiple days with choices (drink/no-drink, buy/don't buy)
- Shows running ledger
- Economy bridge enabled by default

## Acceptance Criteria

1. After clearing a slime, farmer dialogue offers payment → silver increases
2. Enter shop, buy item → silver decreases, inventory updates
3. At day end, rent auto-deducted → logged with correct amount
4. Economy bridge shows accurate daily income/expense/net
5. A player who does chores + 1 slime + drinks + pays rent = net 0 or slightly negative
6. Cannot buy item if insufficient silver (dialogue says so)
7. `window.STEADY_LIGHT.getState().silver` reflects current balance

## Notes
- Shop dialogue should be friendly and persuasive — the NPCs are salespeople, not scammers
- Exact item prices and stats TBD — use placeholder values that create the correct treadmill feel
- The bank overdraft mechanic is optional for this milestone — implement if time allows
