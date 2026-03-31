/**
 * Structured logging with per-category toggles.
 * All output uses `[STEADY-LIGHT:<CATEGORY>]` prefix with structured object payloads.
 */

export type LogCategory = 'STATE' | 'EVENT' | 'COMBAT' | 'NPC' | 'ECON' | 'DEBUG';

const ALL_CATEGORIES: readonly LogCategory[] = [
  'STATE', 'EVENT', 'COMBAT', 'NPC', 'ECON', 'DEBUG',
] as const;

type LogToggles = Record<LogCategory, boolean>;

class Logger {
  private toggles: LogToggles = {
    STATE: true,
    EVENT: true,
    COMBAT: true,
    NPC: true,
    ECON: true,
    DEBUG: true,
  };

  /**
   * Log a structured payload under a category.
   * No-ops if the category is disabled.
   */
  log(category: LogCategory, payload: Record<string, unknown>): void {
    if (!this.toggles[category]) return;
    console.log(`[STEADY-LIGHT:${category}]`, payload);
  }

  /** Enable a single log category. */
  enable(category: LogCategory): void {
    this.toggles[category] = true;
  }

  /** Disable a single log category. */
  disable(category: LogCategory): void {
    this.toggles[category] = false;
  }

  /** Check if a category is enabled. */
  isEnabled(category: LogCategory): boolean {
    return this.toggles[category];
  }

  /** Enable or disable all categories at once. */
  setAll(enabled: boolean): void {
    for (const cat of ALL_CATEGORIES) {
      this.toggles[cat] = enabled;
    }
  }

  /** Return current toggle state for all categories. */
  status(): LogToggles {
    return { ...this.toggles };
  }
}

/** Singleton logger instance */
export const logger = new Logger();
