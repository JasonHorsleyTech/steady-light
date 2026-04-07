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
import { DIRECTION_DELTA, toCoord, isInBounds, isOccupied } from './grid-utils';

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

  if (!isInBounds(to, config)) return false;
  if (isOccupied(to, entityManager.getAll(), player.id)) return false;

  const from = { ...player.position };
  player.position = to;

  eventBus.emit('combat:entity-moved', { entityId: player.id, from, to });

  logger.log('EVENT', {
    type: 'player-move',
    from: toCoord(from),
    to: toCoord(to),
  });

  onMoved();
  return true;
}
