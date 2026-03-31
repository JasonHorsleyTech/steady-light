import type {
  GameEventMap,
  GameEventName,
  GameEventPayload,
  GameEventHandler,
} from './types';

type ListenerSet<T extends GameEventName> = Set<GameEventHandler<T>>;

/**
 * Typed pub/sub EventBus for cross-system communication.
 * Framework-agnostic — works from game loops, bridges, PixiJS, or React.
 */
class EventBus {
  private listeners = new Map<GameEventName, ListenerSet<GameEventName>>();
  private debugEnabled = false;

  /**
   * Subscribe to a typed event. Returns an unsubscribe function.
   */
  on<T extends GameEventName>(
    event: T,
    handler: GameEventHandler<T>,
  ): () => void {
    let set = this.listeners.get(event) as ListenerSet<T> | undefined;
    if (!set) {
      set = new Set();
      this.listeners.set(
        event,
        set as unknown as ListenerSet<GameEventName>,
      );
    }
    set.add(handler);

    return () => {
      set!.delete(handler);
      if (set!.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * Unsubscribe a specific handler from an event.
   */
  off<T extends GameEventName>(
    event: T,
    handler: GameEventHandler<T>,
  ): void {
    const set = this.listeners.get(event) as ListenerSet<T> | undefined;
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Publish an event to all registered listeners.
   */
  emit<T extends GameEventName>(
    event: T,
    payload: GameEventPayload<T>,
  ): void {
    if (this.debugEnabled) {
      console.log(
        `[STEADY-LIGHT:EVENT] ${JSON.stringify({ type: event, ...payload })}`,
      );
    }

    const set = this.listeners.get(event) as ListenerSet<T> | undefined;
    if (!set) return;

    for (const handler of set) {
      handler(payload);
    }
  }

  /**
   * Subscribe to an event for a single firing, then auto-unsubscribe.
   */
  once<T extends GameEventName>(
    event: T,
    handler: GameEventHandler<T>,
  ): () => void {
    const wrapper: GameEventHandler<T> = (payload) => {
      unsub();
      handler(payload);
    };
    const unsub = this.on(event, wrapper);
    return unsub;
  }

  /**
   * Remove all listeners, optionally for a specific event.
   */
  clear(event?: GameEventName): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Toggle debug logging of all published events.
   */
  setDebug(enabled: boolean): void {
    this.debugEnabled = enabled;
    console.log(
      `[STEADY-LIGHT:EVENT] Debug mode ${enabled ? 'ON' : 'OFF'}`,
    );
  }

  /**
   * Returns the number of listeners for an event (useful for leak detection in tests).
   */
  listenerCount(event: GameEventName): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

/** Singleton event bus instance for the game */
export const eventBus = new EventBus();

export type { GameEventMap, GameEventName, GameEventPayload, GameEventHandler };
