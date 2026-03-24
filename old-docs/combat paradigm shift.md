# Core Combat Loop

**Space**:

* At start: abstract 8×8 white-grid arena (Pokémon-style "otherworld").
* Later: fights happen in actual overworld (cornfield, streets, buildings, etc.).

**Time**:

* Combat follows the time signature of the background music (e.g., 4/4, 3/4).
**Planning Phase**: First (N−1) bars - player queues up actions.
**Execution Phase**: Final bar - actions execute one per beat in the order queued.

**Actions**:

* Movement only, or movement + action (attack/block/dodge in a direction).
* No real-time mashing - it's rhythm-synced simultaneous turns.

**Actions per Beat**:

* Move (direction via left stick)
* Move + Action (attack/block/dodge, with optional direction via right stick)
* Action in facing direction (if no right stick input given)

**Early Game**: Player can only do simple sequences (move OR action).
**Late Game**: Player can chain full combos (move+action per beat).

---

## Stat System

Three separate "health" stats. If any hits zero, you lose.
Each stat has gain and loss triggers for both you and enemies.

| **Stat**      | **Gain**                     | **Loss**                            |
| ------------- | ---------------------------- | ----------------------------------- |
| **Drive**     | Land an attack successfully  | Take damage (enemy attack connects) |
| **Insight**   | Block an attack successfully | Enemy blocks your attack            |
| **Stability** | Dodge an attack successfully |                                     |

### Symmetry

* Enemies follow the exact same rules for gain/loss.
* If you dodge, they lose stability; if you block, they lose insight; if you hit them, they lose drive.

---

## Controller Mapping (Xbox)

* **Left Stick**: Movement direction.
* **Right Stick**: Action direction (optional - if unused, uses facing direction).
* **Right Trigger (RT)**: Attack.
* **Right Bumper (RB)**: Block.
* **Left Trigger (LT)**: Dodge / evasive move.
* **A Button**: Confirm queued action (for slower, menu style tutorial phase).
* **B Button**: Cancel last queued action.

### Action Encoding Example

* Move left & attack up = Left Stick ← + Right Stick ↑ + RT.
* Move forward & block = Left Stick ↑ + RB.
* Stand still & attack = No left stick + RT (attacks in facing direction).

---

## Enemy Behavior

### Start of Game

* Enemies have simple, predictable plans (e.g., stand idle until hit, then move towards you and attack on last beat).
* One fixed attack pattern, same every time.

### Mid Game

* Enemies plan over multiple beats.
* May feint (move toward but attack later) or zone control (move into position to force your movement).
* Attacks target specific stats (Drive-hit, Insight-hit, Stability-hit).

### Late Game

* Enemies react mid-chain to your early moves.
* Some use alternate time signatures to break rhythm habits.
* Positioning and line-of-sight matter (cover, environmental hazards).

---

## Paradigm Shift Stages in Combat

Matches your overall narrative "stat flip" reveal structure:

1. **Stage 0 - Turn-Based Illusion**
    * Arena always 8×8 abstract space.
    * No simultaneous move+action.
    * Movement limited to inside arena.
    * Energy bar shown as a single stat.
    * Enemy AI inert unless provoked.

2. **Stage 1 - Stat Separation (First flip: Confidence → Insight)**
    * UI splits Energy into Drive/Insight/Stability bars.
    * Attacks now damage specific bars.
    * Still in abstract arena, still can't move+act.

3. **Stage 2 - Plan Awareness (Insight threshold)**
    * See enemy's next type of action (Attack, Move, Defend).
    * Dodge/block/parry becomes possible & grants stat recovery.
    * Still in abstract arena, but movement can influence combat flow.

4. **Stage 3 - Environmental Reality (Drive threshold)**
    * Battles now occur in overworld - arena overlay disappears.
    * Player/enemy can leave combat by moving out of visual range.
    * Solid objects now matter (cover, obstacles).
    * First enemies with multi-step chains.

5. **Stage 4 - Fluid Motion (Stability threshold)**
    * Player can move+act on the same beat.
    * Full 4-action chains available.
    * Position-specific attacks, dodges, and blocks now meaningful.
    * Enemy AI reactive to first half of your chain.

6. **Stage 5 - The Truth (Final narrative reveal)**
    * Complex enemies use odd meters (3/4, 6/8).
    * You see exactly how your planned chain will interact with theirs (if Insight high enough).
    * Fights are fully dynamic, reactive, and musical.

---

## Example Combat Flow (4/4 Early Game)

* **Measure 1 - 3**: Player queues actions (simple menu: Move, Attack, Block).
* **Measure 4**: Actions execute beat-by-beat:
  * **Beat 1**: Move → Step left
  * **Beat 2**: Move → Step left
  * **Beat 3**: Move → Step left
  * **Beat 4**: Attack → Swing at slime
* **Enemy AI**: Waits unless hit → Moves towards player → Attacks on last beat
