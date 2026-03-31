import type {
  CombatAction,
  CombatPhase,
  CombatStage,
  DayPhase,
  EnemyId,
  ExpenseType,
  FalseStat,
  GamePhase,
  IncomeSource,
  LocationId,
  NpcId,
  RealStat,
  WeaponId,
  ArmorId,
} from './enums';
import type { GridPosition } from './player';
import type { StatChange } from './combat';

// ── Event Map ───────────────────────────────────────────────
// Every cross-system event published/subscribed via the EventBus.
// Keys are event names, values are their payloads.

export interface GameEventMap {
  // ── Combat Events ───────────────────────────────────────
  'combat:started': { enemyId: EnemyId; location: LocationId };
  'combat:ended': { enemyId: EnemyId; playerWon: boolean; reason: string };
  'combat:phase-changed': { phase: CombatPhase; measure: number };
  'combat:action-queued': { action: CombatAction; beat: number; entityId: string };
  'combat:action-executed': { action: CombatAction; beat: number; entityId: string };
  'combat:attack-landed': { attackerId: string; targetId: string; statChange: StatChange };
  'combat:attack-blocked': { attackerId: string; targetId: string; statChange: StatChange };
  'combat:attack-dodged': { attackerId: string; targetId: string; statChange: StatChange };
  'combat:entity-moved': { entityId: string; from: GridPosition; to: GridPosition };
  'combat:stat-zeroed': { entityId: string; stat: RealStat; effect: string };
  'combat:recovery': { entityId: string; stat: RealStat; amount: number };

  // ── Stat Events ─────────────────────────────────────────
  'stats:changed': { stat: RealStat; oldValue: number; newValue: number };

  // ── Progression Events ──────────────────────────────────
  'progression:reflection-started': { falseStat: FalseStat; count: number };
  'progression:reflection-completed': { falseStat: FalseStat; count: number };
  'progression:stat-flipped': { falseStat: FalseStat; realStat: RealStat };
  'progression:stage-unlocked': { stage: CombatStage };

  // ── Economy Events ──────────────────────────────────────
  'economy:income-earned': { source: IncomeSource; amount: number };
  'economy:expense-paid': { type: ExpenseType; amount: number };
  'economy:purchase': { itemId: WeaponId | ArmorId | string; price: number };
  'economy:balance-changed': { oldBalance: number; newBalance: number };

  // ── Dialogue Events ─────────────────────────────────────
  'dialogue:started': { npcId: NpcId; dialogueFile: string };
  'dialogue:ended': { npcId: NpcId };
  'dialogue:choice-made': { choiceText: string; target: string };
  'dialogue:knot-entered': { knot: string };

  // ── World / Scene Events ────────────────────────────────
  'scene:location-changed': { from: LocationId; to: LocationId };
  'scene:game-phase-changed': { from: GamePhase; to: GamePhase };
  'scene:day-phase-changed': { phase: DayPhase; day: number };
  'scene:new-day': { day: number };

  // ── Player Events ───────────────────────────────────────
  'player:drink-taken': { day: number };
  'player:drink-refused': { day: number };
  'player:slept': { day: number; reflected: boolean };
  'player:equipment-changed': { slot: 'weapon' | 'armor'; itemId: string };

  // ── NPC Events ──────────────────────────────────────────
  'npc:interaction': { npcId: NpcId; type: string };
}

/** Union of all event names */
export type GameEventName = keyof GameEventMap;

/** Payload type for a given event name */
export type GameEventPayload<T extends GameEventName> = GameEventMap[T];

/** Generic event handler signature */
export type GameEventHandler<T extends GameEventName> = (
  payload: GameEventPayload<T>,
) => void;
