import { type FalseStat, type RealStat } from './enums';

/** Values for all three real stats */
export interface RealStats {
  drive: number;
  insight: number;
  stability: number;
}

/** Values for all three false/display stats */
export interface FalseStats {
  calm: number;
  confidence: number;
  passion: number;
}

/** Maps each false stat to its corresponding real stat */
export const INVERSE_MAPPING: Record<FalseStat, RealStat> = {
  calm: 'drive' as RealStat,
  confidence: 'insight' as RealStat,
  passion: 'stability' as RealStat,
};

/** Stat constants from the canonical manifest */
export const STAT_CONSTANTS = {
  BASE_VALUE: 5,
  MAX_VALUE: 20,
  CHARACTER_CREATION_REDISTRIBUTE_POINTS: 3,
} as const;

/** What happens when a stat reaches zero */
export interface ZeroStatEffect {
  drive: 'give_up';
  insight: 'confusion';
  stability: 'daze_and_flee';
}
