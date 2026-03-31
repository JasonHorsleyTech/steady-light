import type { CombatStage, FalseStat, RealStat } from './enums';

// ── Reflection ──────────────────────────────────────────────

/** Tracks reflection progress for each false stat (0-3, flip at 3) */
export interface ReflectionCounts {
  calm: number;
  confidence: number;
  passion: number;
}

/** Whether each real stat has been flipped (unlocked its true name) */
export interface FlipStatus {
  drive: boolean;
  insight: boolean;
  stability: boolean;
}

export const REFLECTIONS_PER_FLIP = 3;

// ── Stage Unlocks ───────────────────────────────────────────

export type StageUnlockCondition =
  | { type: 'any_stat_flipped' }
  | { type: 'stat_threshold'; stat: RealStat; threshold: number };

export interface StageUnlockDefinition {
  stage: CombatStage;
  condition: StageUnlockCondition;
  description: string;
}

// ── Story Flags ─────────────────────────────────────────────

export interface StoryFlags {
  farmerMet: boolean;
  guildJoined: boolean;
  bankAccountOpened: boolean;
}

export interface EconomyFlags {
  drinkCount: number;
  daysInTown: number;
}

// ── Progression State ───────────────────────────────────────

export interface ProgressionState {
  reflectionCounts: ReflectionCounts;
  flipStatus: FlipStatus;
  currentStage: CombatStage;
  storyFlags: StoryFlags;
  economyFlags: EconomyFlags;
  /** Which false stat the player is currently reflecting on (null if not in a reflection arc) */
  activeReflection: FalseStat | null;
}
