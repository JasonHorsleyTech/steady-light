/**
 * Green slime behavior system.
 * Implements EnemyBehavior.PassiveUntilHit: idles until attacked,
 * retaliates once (move toward player + attack), then returns to idle.
 */

import type { GridPosition } from '../core/types';
import type { StatChange } from '../core/types/combat';
import { EnemyBehavior } from '../core/types/enums';
import type { EntityManager, GridEntity } from '../world/entity';
import type { GridConfig } from '../world/grid-config';
import { eventBus } from '../core/event-bus';
import { logger } from '../core/logger';
import {
  DIRECTION_DELTA,
  toCoord,
  isAdjacent,
  directionToward,
  isInBounds,
  isOccupied,
} from '../world/grid-utils';

type SlimeState = 'idle' | 'retaliating';

export interface SlimeBehaviorDeps {
  entityManager: EntityManager;
  config: GridConfig;
  onStateChanged: () => void;
}

export class SlimeBehavior {
  readonly behavior = EnemyBehavior.PassiveUntilHit;

  private entityManager: EntityManager;
  private config: GridConfig;
  private onStateChanged: () => void;
  private states: Map<string, SlimeState> = new Map();
  private retaliationTimers: Map<string, number> = new Map();

  constructor(deps: SlimeBehaviorDeps) {
    this.entityManager = deps.entityManager;
    this.config = deps.config;
    this.onStateChanged = deps.onStateChanged;
  }

  /** Register a slime entity for behavior tracking */
  track(slimeId: string): void {
    this.states.set(slimeId, 'idle');
    logger.log('COMBAT', {
      event: 'slime-tracked',
      slimeId,
      state: 'idle',
      behavior: this.behavior,
    });
  }

  /** Untrack a slime (cleanup) */
  untrack(slimeId: string): void {
    this.states.delete(slimeId);
    const timer = this.retaliationTimers.get(slimeId);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.retaliationTimers.delete(slimeId);
    }
  }

  /** Get current state of a slime */
  getState(slimeId: string): SlimeState | undefined {
    return this.states.get(slimeId);
  }

  /**
   * Player attempts to attack an adjacent enemy.
   * Returns true if an attack was performed.
   */
  playerAttack(): boolean {
    const player = this.entityManager.getPlayer();
    if (!player) return false;

    // Find an adjacent slime that can be attacked
    const enemies = this.entityManager.getByType('enemy');
    const target = enemies.find((e) => isAdjacent(player.position, e.position));
    if (!target) return false;

    const state = this.states.get(target.id);
    if (state === undefined) return false;

    // Player hits slime — emit combat:attack-landed
    const statChange: StatChange = { drive: 1 };
    eventBus.emit('combat:attack-landed', {
      attackerId: player.id,
      targetId: target.id,
      statChange,
    });

    logger.log('COMBAT', {
      event: 'player-attack',
      attacker: player.id,
      target: target.id,
      targetPosition: toCoord(target.position),
      statChange,
    });

    // Transition slime to retaliating if idle
    if (state === 'idle') {
      this.states.set(target.id, 'retaliating');
      logger.log('COMBAT', {
        event: 'slime-state-change',
        slimeId: target.id,
        from: 'idle',
        to: 'retaliating',
      });

      // Schedule retaliation after a short delay
      const timer = window.setTimeout(() => {
        this.retaliationTimers.delete(target.id);
        this.retaliate(target.id);
      }, 500);
      this.retaliationTimers.set(target.id, timer);
    }

    return true;
  }

  /** Slime retaliates: move toward player (if not adjacent) then attack */
  private retaliate(slimeId: string): void {
    const slime = this.entityManager.get(slimeId);
    const player = this.entityManager.getPlayer();
    if (!slime || !player) return;

    logger.log('COMBAT', {
      event: 'slime-retaliate-start',
      slimeId,
      slimePosition: toCoord(slime.position),
      playerPosition: toCoord(player.position),
    });

    // Move toward player if not adjacent
    if (!isAdjacent(slime.position, player.position)) {
      this.moveToward(slime, player.position);
    }

    // Attack if now adjacent
    if (isAdjacent(slime.position, player.position)) {
      const statChange: StatChange = { stability: -1 };
      eventBus.emit('combat:attack-landed', {
        attackerId: slime.id,
        targetId: player.id,
        statChange,
      });

      logger.log('COMBAT', {
        event: 'slime-attack',
        attacker: slime.id,
        target: player.id,
        playerPosition: toCoord(player.position),
        statChange,
      });
    } else {
      logger.log('COMBAT', {
        event: 'slime-retaliate-out-of-range',
        slimeId,
        slimePosition: toCoord(slime.position),
        playerPosition: toCoord(player.position),
      });
    }

    // Return to idle
    this.states.set(slimeId, 'idle');
    logger.log('COMBAT', {
      event: 'slime-state-change',
      slimeId,
      from: 'retaliating',
      to: 'idle',
    });

    this.onStateChanged();
  }

  /** Move entity one step toward target position */
  private moveToward(entity: GridEntity, target: GridPosition): void {
    const dir = directionToward(entity.position, target);
    if (!dir) return;

    const delta = DIRECTION_DELTA[dir];
    const to: GridPosition = {
      x: entity.position.x + delta.dx,
      y: entity.position.y + delta.dy,
    };

    if (!isInBounds(to, this.config)) return;
    if (isOccupied(to, this.entityManager.getAll(), entity.id)) return;

    const from = { ...entity.position };
    entity.position = to;

    eventBus.emit('combat:entity-moved', { entityId: entity.id, from, to });

    logger.log('COMBAT', {
      event: 'slime-move',
      slimeId: entity.id,
      from: toCoord(from),
      to: toCoord(to),
    });
  }

  /** Clean up all timers */
  dispose(): void {
    for (const timer of this.retaliationTimers.values()) {
      clearTimeout(timer);
    }
    this.retaliationTimers.clear();
    this.states.clear();
  }
}
