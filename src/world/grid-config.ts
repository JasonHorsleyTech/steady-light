/**
 * Grid configuration and state management.
 * Separated from the renderer so grid dimensions are managed, not hardcoded.
 */

export interface GridConfig {
  /** Number of columns */
  width: number;
  /** Number of rows */
  height: number;
  /** Pixel size of each cell */
  cellSize: number;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  width: 8,
  height: 8,
  cellSize: 64,
};

/** Derive total pixel dimensions from grid config */
export function getGridPixelSize(config: GridConfig) {
  return {
    pixelWidth: config.width * config.cellSize,
    pixelHeight: config.height * config.cellSize,
  };
}
