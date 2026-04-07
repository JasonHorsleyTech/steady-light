import { useEffect, useRef } from 'react';
import { DEFAULT_GRID_CONFIG } from '../world/grid-config';
import { GridRenderer } from '../world/grid-renderer';
import { EntityManager } from '../world/entity';
import type { GridState } from '../world/entity';
import { initGridInspector, clearGridInspector } from '../debug/grid-inspector';

const PLAYER_COLOR = 0x4fc3f7;

export function DevGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new GridRenderer(DEFAULT_GRID_CONFIG);
    const entityManager = new EntityManager();

    renderer.init(container).then(() => {
      entityManager.add({
        id: 'player',
        position: { x: 3, y: 3 },
        type: 'player',
        render: { color: PLAYER_COLOR },
      });

      renderer.renderEntities(entityManager.getAll());
    });

    const getState = (): GridState => ({
      config: renderer.getConfig(),
      entities: entityManager.getAll(),
      playerPosition: entityManager.getPlayer()?.position ?? null,
    });

    initGridInspector({ getState, entityManager, renderer });

    return () => {
      clearGridInspector();
      entityManager.clear();
      renderer.destroy();
    };
  }, []);

  return (
    <div>
      <h2>Grid</h2>
      <p style={{ color: '#aaa', marginBottom: '1rem' }}>
        8×8 grid — {DEFAULT_GRID_CONFIG.cellSize}px cells — Player at D4
      </p>
      <div ref={containerRef} />
    </div>
  );
}
