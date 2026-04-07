/**
 * PixiJS grid renderer.
 * Draws an 8x8 grid with visible cell borders on a neutral background.
 * Reads dimensions from GridConfig — does not hardcode sizes.
 */

import { Application, Container, Graphics, Text } from 'pixi.js';
import { logger } from '../core/logger';
import { type GridConfig, getGridPixelSize } from './grid-config';
import type { GridEntity } from './entity';

const BACKGROUND_COLOR = 0x1a1a2e;
const BORDER_COLOR = 0x444466;
const BORDER_ALPHA = 0.8;
const ENTITY_PADDING = 4;
const LABEL_STYLE = { fontSize: 10, fill: 0x888899, fontFamily: 'monospace' };

export class GridRenderer {
  readonly app: Application;
  private gridGraphics: Graphics | null = null;
  private entityGraphics: Graphics | null = null;
  private labelContainer: Container | null = null;
  private config: GridConfig;
  private initialized = false;

  constructor(config: GridConfig) {
    this.config = config;
    this.app = new Application();
  }

  /** Initialize the PixiJS application and draw the grid. */
  async init(container: HTMLElement): Promise<void> {
    const { pixelWidth, pixelHeight } = getGridPixelSize(this.config);

    await this.app.init({
      width: pixelWidth,
      height: pixelHeight,
      background: BACKGROUND_COLOR,
      antialias: false,
      resolution: 1,
    });

    container.appendChild(this.app.canvas);
    this.drawGrid();
    this.initialized = true;

    logger.log('DEBUG', {
      component: 'GridRenderer',
      event: 'initialized',
      gridWidth: this.config.width,
      gridHeight: this.config.height,
      cellSize: this.config.cellSize,
      canvasWidth: pixelWidth,
      canvasHeight: pixelHeight,
    });
  }

  /** Draw the grid lines. */
  private drawGrid(): void {
    if (this.gridGraphics) {
      this.app.stage.removeChild(this.gridGraphics);
      this.gridGraphics.destroy();
    }

    const g = new Graphics();
    const { width, height, cellSize } = this.config;
    const { pixelWidth, pixelHeight } = getGridPixelSize(this.config);

    // Draw cell fills (subtle alternating pattern for visibility)
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const isLight = (row + col) % 2 === 0;
        g.rect(col * cellSize, row * cellSize, cellSize, cellSize);
        g.fill({ color: isLight ? 0x22223a : 0x1e1e34 });
      }
    }

    // Draw vertical lines
    for (let col = 0; col <= width; col++) {
      const x = col * cellSize;
      g.moveTo(x, 0);
      g.lineTo(x, pixelHeight);
      g.stroke({ color: BORDER_COLOR, alpha: BORDER_ALPHA, width: 1 });
    }

    // Draw horizontal lines
    for (let row = 0; row <= height; row++) {
      const y = row * cellSize;
      g.moveTo(0, y);
      g.lineTo(pixelWidth, y);
      g.stroke({ color: BORDER_COLOR, alpha: BORDER_ALPHA, width: 1 });
    }

    this.app.stage.addChild(g);
    this.gridGraphics = g;
  }

  /** Render all entities as colored squares at their grid positions. */
  renderEntities(entities: GridEntity[]): void {
    if (!this.initialized) return;

    if (this.entityGraphics) {
      this.app.stage.removeChild(this.entityGraphics);
      this.entityGraphics.destroy();
    }

    const g = new Graphics();
    const { cellSize } = this.config;

    for (const entity of entities) {
      const px = entity.position.x * cellSize + ENTITY_PADDING;
      const py = entity.position.y * cellSize + ENTITY_PADDING;
      const size = cellSize - ENTITY_PADDING * 2;
      g.rect(px, py, size, size);
      g.fill({ color: entity.render.color });
    }

    this.app.stage.addChild(g);
    this.entityGraphics = g;
  }

  /** Show A-H column and 1-8 row labels as a debug overlay. */
  showCoordinateLabels(): void {
    if (!this.initialized || this.labelContainer) return;

    const container = new Container();
    const { width, height, cellSize } = this.config;

    // Column labels (A-H) centered at top of each column
    for (let col = 0; col < width; col++) {
      const label = new Text({ text: String.fromCharCode(65 + col), style: LABEL_STYLE });
      label.x = col * cellSize + (cellSize - label.width) / 2;
      label.y = 2;
      container.addChild(label);
    }

    // Row labels (1-8) at left of each row
    for (let row = 0; row < height; row++) {
      const label = new Text({ text: String(row + 1), style: LABEL_STYLE });
      label.x = 3;
      label.y = row * cellSize + (cellSize - label.height) / 2;
      container.addChild(label);
    }

    this.app.stage.addChild(container);
    this.labelContainer = container;
  }

  /** Hide coordinate labels overlay. */
  hideCoordinateLabels(): void {
    if (!this.labelContainer) return;
    if (this.initialized) {
      this.app.stage.removeChild(this.labelContainer);
      this.labelContainer.destroy({ children: true });
    }
    this.labelContainer = null;
  }

  /** Clean up PixiJS resources. */
  destroy(): void {
    if (this.initialized) {
      this.app.destroy(true, { children: true });
      this.initialized = false;
    }
  }

  /** Current grid config (read-only). */
  getConfig(): Readonly<GridConfig> {
    return this.config;
  }
}
