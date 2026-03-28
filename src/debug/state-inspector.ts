import { gameStore } from '../core/store';
import type { GameState } from '../core/store';

export interface SteadyLightDebug {
  getState: () => GameState;
  setState: (partial: Partial<GameState>) => void;
  toggleDebug: () => void;
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
    getState: () => gameStore.getState(),
    setState: (partial) => gameStore.setState(partial),
    toggleDebug: () => {
      debugEnabled = !debugEnabled;
      console.log(
        `[STEADY-LIGHT:DEBUG] Debug mode ${debugEnabled ? 'ON' : 'OFF'}`,
      );
    },
  };

  console.log(
    '[STEADY-LIGHT:DEBUG] State inspector ready — use window.STEADY_LIGHT.getState()',
  );
}
