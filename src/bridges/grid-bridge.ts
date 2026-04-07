/**
 * ASCII Grid Bridge — translates visual grid state into console-readable text.
 * Outputs an ASCII grid with entity positions on every grid state change.
 *
 * Symbols: P = Player, E = Enemy, . = Empty
 * Extend ENTITY_SYMBOLS for new entity types.
 */

import type { Bridge } from './bridge-manager';
import type { EntityManager, GridEntity } from '../world/entity';
import type { GridConfig } from '../world/grid-config';
import type { GridRenderer } from '../world/grid-renderer';
import { eventBus } from '../core/event-bus';
import { logger } from '../core/logger';
import { toCoord } from '../world/grid-utils';

/** Map entity types to single-character symbols for ASCII output */
const ENTITY_SYMBOLS: Record<string, string> = {
  player: 'P',
  enemy: 'E',
};

function getSymbol(entity: GridEntity): string {
  return ENTITY_SYMBOLS[entity.type] ?? entity.type[0].toUpperCase();
}

export interface GridBridgeDeps {
  entityManager: EntityManager;
  config: GridConfig;
  renderer: GridRenderer;
}

export class GridBridge implements Bridge {
  readonly name = 'grid' as const;

  private entityManager: EntityManager;
  private config: GridConfig;
  private renderer: GridRenderer;
  private unsubMove: (() => void) | null = null;
  private unsubAttack: (() => void) | null = null;

  constructor(deps: GridBridgeDeps) {
    this.entityManager = deps.entityManager;
    this.config = deps.config;
    this.renderer = deps.renderer;
  }

  init(): void {
    // Clean up any existing subscriptions first (idempotent — prevents listener leaks)
    this.unsubMove?.();
    this.unsubAttack?.();

    this.unsubMove = eventBus.on('combat:entity-moved', () => {
      this.render();
    });

    this.unsubAttack = eventBus.on('combat:attack-landed', () => {
      this.render();
    });

    // Show coordinate labels on PixiJS canvas (no-op if renderer not ready yet)
    this.renderer.showCoordinateLabels();

    // Output initial ASCII state
    this.render();

    logger.log('DEBUG', { bridge: 'grid', event: 'initialized' });
  }

  dispose(): void {
    this.unsubMove?.();
    this.unsubMove = null;
    this.unsubAttack?.();
    this.unsubAttack = null;

    this.renderer.hideCoordinateLabels();

    logger.log('DEBUG', { bridge: 'grid', event: 'disposed' });
  }

  /** Output current grid state as ASCII to console. */
  render(): void {
    const { width, height } = this.config;
    const entities = this.entityManager.getAll();

    // Build position → entity lookup
    const posMap = new Map<string, GridEntity>();
    for (const entity of entities) {
      posMap.set(`${entity.position.x},${entity.position.y}`, entity);
    }

    const lines: string[] = [];

    // Column headers
    const cols = Array.from({ length: width }, (_, i) =>
      String.fromCharCode(65 + i),
    ).join(' ');
    lines.push(`     ${cols}`);

    // Grid rows
    for (let y = 0; y < height; y++) {
      const rowNum = String(y + 1).padStart(2, ' ');
      let row = `${rowNum}   `;
      for (let x = 0; x < width; x++) {
        const entity = posMap.get(`${x},${y}`);
        row += entity ? getSymbol(entity) : '.';
        if (x < width - 1) row += ' ';
      }
      lines.push(row);
    }

    // Legend
    if (entities.length > 0) {
      lines.push('');
      lines.push('Legend:');
      for (const entity of entities) {
        const sym = getSymbol(entity);
        const coord = toCoord(entity.position);
        lines.push(`  ${sym} = ${entity.type} @ ${coord}`);
      }
    }

    const ascii = lines.join('\n');
    logger.log('DEBUG', {
      bridge: 'grid',
      event: 'state-update',
      ascii: '\n' + ascii,
    });
  }
}
