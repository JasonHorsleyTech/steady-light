import { useEffect, useRef } from 'react';
import { DEFAULT_GRID_CONFIG } from '../world/grid-config';
import { GridRenderer } from '../world/grid-renderer';
import { EntityManager } from '../world/entity';
import type { GridState } from '../world/entity';
import { initGridInspector, clearGridInspector } from '../debug/grid-inspector';
import { listenKeyboard } from '../input/keyboard';
import { movePlayer } from '../world/movement';

const PLAYER_COLOR = 0x4fc3f7;

export function DevGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new GridRenderer(DEFAULT_GRID_CONFIG);
    const entityManager = new EntityManager();
    let cleanupKeyboard: (() => void) | null = null;

    renderer.init(container).then(() => {
      entityManager.add({
        id: 'player',
        position: { x: 3, y: 3 },
        type: 'player',
        render: { color: PLAYER_COLOR },
      });

      renderer.renderEntities(entityManager.getAll());

      // Wire up keyboard → movement → re-render
      cleanupKeyboard = listenKeyboard((dir) => {
        movePlayer(dir, {
          entityManager,
          config: DEFAULT_GRID_CONFIG,
          onMoved: () => renderer.renderEntities(entityManager.getAll()),
        });
      });
    });

    const getState = (): GridState => ({
      config: renderer.getConfig(),
      entities: entityManager.getAll(),
      playerPosition: entityManager.getPlayer()?.position ?? null,
    });

    initGridInspector({ getState, entityManager, renderer });

    return () => {
      cleanupKeyboard?.();
      clearGridInspector();
      entityManager.clear();
      renderer.destroy();
    };
  }, []);

  return (
    <div>
      <h2>Grid</h2>
      <p style={{ color: '#aaa', marginBottom: '1rem' }}>
        8×8 grid — {DEFAULT_GRID_CONFIG.cellSize}px cells — Arrow keys or WASD to move
      </p>
      <div ref={containerRef} />
    </div>
  );
}
