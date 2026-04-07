/**
 * Shared grid geometry utilities.
 * Single source of truth for direction deltas, coordinate formatting,
 * boundary checks, collision checks, adjacency, and pathfinding direction.
 */

import { Direction } from '../core/types/enums';
import type { GridPosition } from '../core/types';
import type { GridConfig } from './grid-config';
import type { GridEntity } from './entity';

/** Movement delta per direction */
export const DIRECTION_DELTA: Record<Direction, { dx: number; dy: number }> = {
  [Direction.Up]: { dx: 0, dy: -1 },
  [Direction.Down]: { dx: 0, dy: 1 },
  [Direction.Left]: { dx: -1, dy: 0 },
  [Direction.Right]: { dx: 1, dy: 0 },
};

/** Convert grid position to human-readable coordinate: column letter + 1-indexed row (e.g. "D4") */
export function toCoord(pos: GridPosition): string {
  return `${String.fromCharCode(65 + pos.x)}${pos.y + 1}`;
}

/** Check if a position is within grid boundaries */
export function isInBounds(pos: GridPosition, config: GridConfig): boolean {
  return pos.x >= 0 && pos.x < config.width && pos.y >= 0 && pos.y < config.height;
}

/** Check if any entity (optionally excluding one by ID) occupies a position */
export function isOccupied(
  pos: GridPosition,
  entities: GridEntity[],
  excludeId?: string,
): boolean {
  return entities.some(
    (e) => e.id !== excludeId && e.position.x === pos.x && e.position.y === pos.y,
  );
}

/** Check if two positions are cardinally adjacent (not diagonal) */
export function isAdjacent(a: GridPosition, b: GridPosition): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/** Get the cardinal direction from `from` toward `to` that reduces distance most */
export function directionToward(from: GridPosition, to: GridPosition): Direction | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) return null;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? Direction.Right : Direction.Left;
  }
  return dy > 0 ? Direction.Down : Direction.Up;
}
