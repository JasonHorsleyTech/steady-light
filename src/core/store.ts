import { createStore } from 'zustand/vanilla';
import type {
  PlayerState,
  CombatState,
  EconomyState,
  DialogueState,
  ProgressionState,
  SceneState,
} from './types';
import {
  ArmorId,
  CombatPhase,
  CombatStage,
  DayPhase,
  GamePhase,
  LocationId,
  WeaponId,
} from './types';
import { DEFAULT_COMBAT_GRID, STAT_CONSTANTS } from './types';

// ── Game State ─────────────────────────────────────────────

export interface GameState {
  player: PlayerState;
  combat: CombatState;
  economy: EconomyState;
  dialogue: DialogueState;
  progression: ProgressionState;
  scene: SceneState;
}

// ── Defaults ───────────────────────────────────────────────

const BASE = STAT_CONSTANTS.BASE_VALUE;

const defaultPlayer: PlayerState = {
  stats: { drive: BASE, insight: BASE, stability: BASE },
  equipment: { weapon: WeaponId.Stick, armor: ArmorId.None },
  inventory: [],
  position: { x: 0, y: 0 },
  location: LocationId.Farm,
  silver: 0,
};

const defaultCombat: CombatState = {
  grid: DEFAULT_COMBAT_GRID,
  entities: [],
  playerActionQueue: [],
  phase: CombatPhase.Planning,
  beatPosition: { measure: 1, beat: 1 },
  timing: { timeSignature: '4/4', planningBars: 3, executionBar: 4, bpm: 120 },
  stage: CombatStage.Stage0,
  active: false,
};

const defaultEconomy: EconomyState = {
  silver: 0,
  transactions: [],
  currentDay: 1,
};

const defaultDialogue: DialogueState = {
  active: false,
  currentLine: null,
  choices: [],
  speaker: null,
  currentKnot: null,
  knotHistory: [],
  dialogueFile: null,
};

const defaultProgression: ProgressionState = {
  reflectionCounts: { calm: 0, confidence: 0, passion: 0 },
  flipStatus: { drive: false, insight: false, stability: false },
  currentStage: CombatStage.Stage0,
  storyFlags: { farmerMet: false, guildJoined: false, bankAccountOpened: false },
  economyFlags: { drinkCount: 0, daysInTown: 0 },
  activeReflection: null,
};

const defaultScene: SceneState = {
  currentLocation: LocationId.Farm,
  gamePhase: GamePhase.Exploration,
  dayPhase: DayPhase.Morning,
  day: 1,
};

// ── Store ──────────────────────────────────────────────────

export const gameStore = createStore<GameState>()(() => ({
  player: defaultPlayer,
  combat: defaultCombat,
  economy: defaultEconomy,
  dialogue: defaultDialogue,
  progression: defaultProgression,
  scene: defaultScene,
}));
