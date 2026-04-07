import { useEffect, useRef } from 'react';
import { DEFAULT_GRID_CONFIG } from '../world/grid-config';
import { GridRenderer } from '../world/grid-renderer';

export function DevGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new GridRenderer(DEFAULT_GRID_CONFIG);
    renderer.init(container);

    return () => {
      renderer.destroy();
    };
  }, []);

  return (
    <div>
      <h2>Grid</h2>
      <p style={{ color: '#aaa', marginBottom: '1rem' }}>
        8×8 grid — {DEFAULT_GRID_CONFIG.cellSize}px cells
      </p>
      <div ref={containerRef} />
    </div>
  );
}
