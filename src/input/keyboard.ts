/**
 * Keyboard input handler.
 * Maps arrow keys and WASD to Direction values.
 * Fires one move per keypress (ignores held/repeat events).
 */

import { Direction } from '../core/types/enums';

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: Direction.Up,
  ArrowDown: Direction.Down,
  ArrowLeft: Direction.Left,
  ArrowRight: Direction.Right,
  w: Direction.Up,
  W: Direction.Up,
  s: Direction.Down,
  S: Direction.Down,
  a: Direction.Left,
  A: Direction.Left,
  d: Direction.Right,
  D: Direction.Right,
};

/**
 * Listen for directional keyboard input.
 * Calls `onDirection` once per keypress (ignores key repeat).
 * Returns a cleanup function to remove the listener.
 */
export function listenKeyboard(onDirection: (dir: Direction) => void): () => void {
  const handler = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const dir = KEY_MAP[e.key];
    if (dir !== undefined) {
      e.preventDefault();
      onDirection(dir);
    }
  };

  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}

/**
 * Listen for attack key input (spacebar or enter).
 * Calls `onAttack` once per keypress (ignores key repeat).
 * Returns a cleanup function to remove the listener.
 */
export function listenAttack(onAttack: () => void): () => void {
  const handler = (e: KeyboardEvent) => {
    if (e.repeat) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onAttack();
    }
  };

  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
