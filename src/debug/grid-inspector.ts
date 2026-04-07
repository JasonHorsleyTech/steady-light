/**
 * Extends window.STEADY_LIGHT with grid-specific state inspection.
 * Wired up by the DevGrid component when it mounts.
 */

import type { GridState, GridEntity, EntityManager } from '../world/entity';
import type { GridRenderer } from '../world/grid-renderer';
import { bridgeManager } from '../bridges/bridge-manager';
import type { GridBridge } from '../bridges/grid-bridge';

export interface GridControls {
  getState: () => GridState;
  addEntity: (entity: GridEntity) => void;
  removeEntity: (id: string) => GridEntity | undefined;
}

interface GridInspectorDeps {
  getState: () => GridState;
  entityManager: EntityManager;
  renderer: GridRenderer;
}

/** Trigger ASCII bridge render if the grid bridge is active. */
function notifyBridge(): void {
  if (!bridgeManager.isEnabled('grid')) return;
  const bridge = bridgeManager.get('grid') as GridBridge | undefined;
  bridge?.render();
}

export function initGridInspector({ getState, entityManager, renderer }: GridInspectorDeps): void {
  if (import.meta.env.PROD) return;
  if (!window.STEADY_LIGHT) return;

  window.STEADY_LIGHT.grid = {
    getState,
    addEntity: (entity: GridEntity) => {
      entityManager.add(entity);
      renderer.renderEntities(entityManager.getAll());
      notifyBridge();
    },
    removeEntity: (id: string) => {
      const removed = entityManager.remove(id);
      renderer.renderEntities(entityManager.getAll());
      notifyBridge();
      return removed;
    },
  };
}

export function clearGridInspector(): void {
  if (window.STEADY_LIGHT) {
    delete window.STEADY_LIGHT.grid;
  }
}
