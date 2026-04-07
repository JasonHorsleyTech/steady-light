/**
 * Grid entity system.
 * General-purpose entity model for placing, rendering, and tracking things on the grid.
 * Not player-specific — supports any entity type (player, enemy, NPC, object).
 */

import type { GridPosition } from '../core/types';
import { logger } from '../core/logger';

export interface EntityRenderProps {
  color: number;
}

export interface GridEntity {
  id: string;
  position: GridPosition;
  type: string;
  render: EntityRenderProps;
}

export interface GridState {
  config: { width: number; height: number; cellSize: number };
  entities: GridEntity[];
  playerPosition: GridPosition | null;
}

/**
 * Manages entities on the grid. Supports add/remove with structured logging.
 */
export class EntityManager {
  private entities: Map<string, GridEntity> = new Map();

  add(entity: GridEntity): void {
    this.entities.set(entity.id, entity);
    logger.log('STATE', {
      event: 'entity-added',
      id: entity.id,
      type: entity.type,
      position: entity.position,
    });
  }

  remove(id: string): GridEntity | undefined {
    const entity = this.entities.get(id);
    if (entity) {
      this.entities.delete(id);
      logger.log('STATE', {
        event: 'entity-removed',
        id: entity.id,
        type: entity.type,
        position: entity.position,
      });
    }
    return entity;
  }

  get(id: string): GridEntity | undefined {
    return this.entities.get(id);
  }

  getAll(): GridEntity[] {
    return Array.from(this.entities.values());
  }

  getByType(type: string): GridEntity[] {
    return this.getAll().filter((e) => e.type === type);
  }

  getPlayer(): GridEntity | undefined {
    return this.getAll().find((e) => e.type === 'player');
  }

  clear(): void {
    this.entities.clear();
  }
}
