import type { ArmorId, LocationId, WeaponId } from './enums';
import type { RealStats } from './stats';

export interface PlayerEquipment {
  weapon: WeaponId;
  armor: ArmorId;
}

export interface InventoryItem {
  id: string;
  quantity: number;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface PlayerState {
  stats: RealStats;
  equipment: PlayerEquipment;
  inventory: InventoryItem[];
  position: GridPosition;
  location: LocationId;
  silver: number;
}
