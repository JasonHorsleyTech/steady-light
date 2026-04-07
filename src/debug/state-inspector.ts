import { gameStore } from '../core/store';
import type { GameState } from '../core/store';
import { eventBus } from '../core/event-bus';
import { logger } from '../core/logger';
import type { LogCategory } from '../core/logger';
import { bridgeManager } from '../bridges/bridge-manager';
import type { BridgeName } from '../bridges/bridge-manager';
import type { GridControls } from './grid-inspector';
import type { GridState } from '../world/entity';

export interface BridgeControls {
  enable: (name: BridgeName | 'all') => void;
  disable: (name: BridgeName | 'all') => void;
  toggle: (name: BridgeName | 'all') => void;
  status: () => Record<BridgeName, boolean>;
}

export interface LoggerControls {
  enable: (category: LogCategory) => void;
  disable: (category: LogCategory) => void;
  setAll: (enabled: boolean) => void;
  status: () => Record<LogCategory, boolean>;
}

export interface SteadyLightDebug {
  getState: () => GameState & { grid?: GridState };
  setState: (partial: Partial<GameState>) => void;
  toggleDebug: () => void;
  eventBus: typeof eventBus;
  logger: LoggerControls;
  bridges: BridgeControls;
  grid?: GridControls;
}

declare global {
  interface Window {
    STEADY_LIGHT?: SteadyLightDebug;
  }
}

let debugEnabled = false;

/**
 * Expose the state inspector on `window.STEADY_LIGHT` in development builds.
 * Call once at app startup.
 */
export function initStateInspector(): void {
  if (import.meta.env.PROD) return;

  window.STEADY_LIGHT = {
    getState: () => {
      const state = gameStore.getState();
      const grid = window.STEADY_LIGHT?.grid?.getState();
      return grid ? { ...state, grid } : state;
    },
    setState: (partial) => gameStore.setState(partial),
    toggleDebug: () => {
      debugEnabled = !debugEnabled;
      logger.log('DEBUG', { debugMode: debugEnabled ? 'ON' : 'OFF' });
    },
    eventBus,
    logger: {
      enable: (cat) => logger.enable(cat),
      disable: (cat) => logger.disable(cat),
      setAll: (enabled) => logger.setAll(enabled),
      status: () => logger.status(),
    },
    bridges: {
      enable: (name) => {
        if (name === 'all') bridgeManager.enableAll();
        else bridgeManager.enable(name);
      },
      disable: (name) => {
        if (name === 'all') bridgeManager.disableAll();
        else bridgeManager.disable(name);
      },
      toggle: (name) => {
        if (name === 'all') {
          // Toggle all: if any are on, disable all; otherwise enable all
          const s = bridgeManager.status();
          const anyOn = Object.values(s).some(Boolean);
          if (anyOn) bridgeManager.disableAll();
          else bridgeManager.enableAll();
        } else {
          bridgeManager.toggle(name);
        }
      },
      status: () => bridgeManager.status(),
    },
  };

  logger.log('DEBUG', { message: 'State inspector ready — use window.STEADY_LIGHT.getState()' });
}
