import type {
  DayPhase,
  EnemyId,
  GamePhase,
  LocationId,
  LocationType,
  NpcId,
  NpcRole,
} from './enums';

// ── NPCs ────────────────────────────────────────────────────

export interface NpcDefinition {
  id: NpcId;
  role: NpcRole;
  location: LocationId;
  offers?: string[];
  sells?: string[];
  dialogueFile: string;
}

// ── Locations ───────────────────────────────────────────────

export interface LocationDefinition {
  id: LocationId;
  type: LocationType;
  npcs?: NpcId[];
  services?: string[];
  encounters?: EnemyId[];
  connectsTo?: LocationId[];
}

// ── Scene ───────────────────────────────────────────────────

export interface SceneState {
  currentLocation: LocationId;
  gamePhase: GamePhase;
  dayPhase: DayPhase;
  day: number;
}
