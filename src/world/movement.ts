/**
 * Movement system.
 * Processes directional input into grid moves with boundary and collision checks.
 * Emits events and logs each move.
 */

import { Direction } from '../core/types/enums';
import type { GridPosition } from '../core/types';
import type { GridConfig } from './grid-config';
import type { EntityManager } from './entity';
import { eventBus } from '../core/event-bus';
import { logger } from '../core/logger';

const DIRECTION_DELTA: Record<Direction, { dx: number; dy: number }> = {
  [Direction.Up]: { dx: 0, dy: -1 },
  [Direction.Down]: { dx: 0, dy: 1 },
  [Direction.Left]: { dx: -1, dy: 0 },
  [Direction.Right]: { dx: 1, dy: 0 },
};

/** Convert a GridPosition to human-readable format: column letter + 1-indexed row (e.g. "D4") */
function toCoord(pos: GridPosition): string {
  const col = String.fromCharCode(65 + pos.x); // A=0, B=1, ..., H=7
  const row = pos.y + 1;
  return `${col}${row}`;
}

export interface MovementDeps {
  entityManager: EntityManager;
  config: GridConfig;
  onMoved: () => void; // called after a successful move so the caller can re-render
}

/**
 * Attempt to move the player one cell in the given direction.
 * Returns true if the move was executed, false if blocked.
 */
export function movePlayer(dir: Direction, deps: MovementDeps): boolean {
  const { entityManager, config, onMoved } = deps;
  const player = entityManager.getPlayer();
  if (!player) return false;

  const delta = DIRECTION_DELTA[dir];
  const to: GridPosition = {
    x: player.position.x + delta.dx,
    y: player.position.y + delta.dy,
  };

  // Boundary check
  if (to.x < 0 || to.x >= config.width || to.y < 0 || to.y >= config.height) {
    return false;
  }

  // Collision check — blocked if any other entity occupies the target cell
  const occupied = entityManager.getAll().some(
    (e) => e.id !== player.id && e.position.x === to.x && e.position.y === to.y,
  );
  if (occupied) return false;

  const from = { ...player.position };
  player.position = to;

  // Emit typed event
  eventBus.emit('combat:entity-moved', { entityId: player.id, from, to });

  // Log in human-readable coordinates
  logger.log('EVENT', {
    type: 'player-move',
    from: toCoord(from),
    to: toCoord(to),
  });

  onMoved();
  return true;
}
