/**
 * Bridge infrastructure — lets AI agents read game state as text.
 *
 * Each bridge translates a game system (grid, timing, combat, etc.) into
 * structured console output. BridgeManager provides per-bridge toggles
 * and a consistent registration pattern for future bridge implementations.
 */

import { logger } from '../core/logger';

export type BridgeName = 'grid' | 'timing' | 'state' | 'dialogue' | 'economy' | 'combat';

const ALL_BRIDGE_NAMES: readonly BridgeName[] = [
  'grid', 'timing', 'state', 'dialogue', 'economy', 'combat',
] as const;

/**
 * Base interface that all bridges implement.
 * Future bridges (GridBridge, CombatBridge, etc.) extend this.
 */
export interface Bridge {
  readonly name: BridgeName;
  /** Called when the bridge is enabled — hook into game systems here. */
  init(): void;
  /** Called when the bridge is disabled — unhook and clean up. */
  dispose(): void;
}

type BridgeToggles = Record<BridgeName, boolean>;

/**
 * Manages bridge lifecycle and per-bridge toggle flags.
 * Disabled entirely in production builds.
 */
class BridgeManager {
  private bridges = new Map<BridgeName, Bridge>();
  private toggles: BridgeToggles = {
    grid: false,
    timing: false,
    state: false,
    dialogue: false,
    economy: false,
    combat: false,
  };

  /** Register a bridge implementation. Does not auto-enable. */
  register(bridge: Bridge): void {
    this.bridges.set(bridge.name, bridge);
    logger.log('DEBUG', { bridge: bridge.name, action: 'registered' });
  }

  /** Enable a single bridge by name. Calls init() if a bridge is registered. */
  enable(name: BridgeName): void {
    this.toggles[name] = true;
    const bridge = this.bridges.get(name);
    if (bridge) bridge.init();
    logger.log('DEBUG', { bridge: name, action: 'enabled' });
  }

  /** Disable a single bridge by name. Calls dispose() if a bridge is registered. */
  disable(name: BridgeName): void {
    this.toggles[name] = false;
    const bridge = this.bridges.get(name);
    if (bridge) bridge.dispose();
    logger.log('DEBUG', { bridge: name, action: 'disabled' });
  }

  /** Toggle a single bridge. */
  toggle(name: BridgeName): void {
    if (this.toggles[name]) {
      this.disable(name);
    } else {
      this.enable(name);
    }
  }

  /** Enable all bridges. */
  enableAll(): void {
    for (const name of ALL_BRIDGE_NAMES) {
      this.enable(name);
    }
  }

  /** Disable all bridges. */
  disableAll(): void {
    for (const name of ALL_BRIDGE_NAMES) {
      this.disable(name);
    }
  }

  /** Check if a bridge is enabled. */
  isEnabled(name: BridgeName): boolean {
    return this.toggles[name];
  }

  /** Get the registered bridge instance (if any). */
  get(name: BridgeName): Bridge | undefined {
    return this.bridges.get(name);
  }

  /** Return current toggle state for all bridges. */
  status(): BridgeToggles {
    return { ...this.toggles };
  }
}

/** Singleton bridge manager instance */
export const bridgeManager = new BridgeManager();
