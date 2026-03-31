import type {
  CombatAction,
  CombatPhase,
  CombatStage,
  Direction,
  EnemyBehavior,
  EnemyId,
} from './enums';
import type { GridPosition } from './player';
import type { RealStats } from './stats';

// ── Grid ────────────────────────────────────────────────────

export interface CombatGrid {
  width: number;
  height: number;
}

/** Default 8x8 abstract white grid for early combat */
export const DEFAULT_COMBAT_GRID: CombatGrid = {
  width: 8,
  height: 8,
};

// ── Entities ────────────────────────────────────────────────

export interface CombatEntity {
  id: string;
  position: GridPosition;
  stats: RealStats;
  isPlayer: boolean;
}

export interface EnemyDefinition {
  id: EnemyId;
  stats: RealStats;
  behavior: EnemyBehavior;
  pattern: string[];
  loot: { silver: number };
}

// ── Actions ─────────────────────────────────────────────────

export interface QueuedAction {
  action: CombatAction;
  direction?: Direction;
  beat: number;
}

// ── Beat / Timing ───────────────────────────────────────────

export interface BeatPosition {
  measure: number;
  beat: number;
}

export interface CombatTiming {
  timeSignature: string;
  planningBars: number;
  executionBar: number;
  bpm: number;
}

// ── Stat Changes ────────────────────────────────────────────

export interface StatChange {
  drive?: number;
  insight?: number;
  stability?: number;
}

export interface CombatOutcome {
  attacker: StatChange;
  target: StatChange;
}

export type CombatOutcomeType =
  | 'attack_landed'
  | 'attack_blocked'
  | 'attack_dodged';

// ── Combat State ────────────────────────────────────────────

export interface CombatState {
  grid: CombatGrid;
  entities: CombatEntity[];
  playerActionQueue: QueuedAction[];
  phase: CombatPhase;
  beatPosition: BeatPosition;
  timing: CombatTiming;
  stage: CombatStage;
  active: boolean;
}
