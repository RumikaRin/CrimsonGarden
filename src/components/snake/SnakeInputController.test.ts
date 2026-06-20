import { describe, expect, it, vi } from 'vitest';
import { directionFromKey, directionFromSwipe, SnakeInputController } from './SnakeInputController';

describe('snake input helpers', () => {
  it('maps arrow and WASD keys to directions', () => {
    expect(directionFromKey('ArrowUp')).toEqual({ x: 0, y: -1 });
    expect(directionFromKey('d')).toEqual({ x: 1, y: 0 });
    expect(directionFromKey('S')).toEqual({ x: 0, y: 1 });
  });

  it('turns a horizontal swipe into left or right', () => {
    expect(directionFromSwipe({ x: 100, y: 30 }, { x: 20, y: 35 })).toEqual({ x: -1, y: 0 });
    expect(directionFromSwipe({ x: 20, y: 30 }, { x: 100, y: 35 })).toEqual({ x: 1, y: 0 });
  });

  it('turns a vertical swipe into up or down', () => {
    expect(directionFromSwipe({ x: 30, y: 100 }, { x: 35, y: 20 })).toEqual({ x: 0, y: -1 });
    expect(directionFromSwipe({ x: 30, y: 20 }, { x: 35, y: 100 })).toEqual({ x: 0, y: 1 });
  });

  it('ignores swipes shorter than the configured threshold', () => {
    expect(directionFromSwipe({ x: 0, y: 0 }, { x: 10, y: 5 }, 24)).toBeNull();
  });

  it('does not forward keys from a form control', () => {
    const onDirection = vi.fn();
    const controller = new SnakeInputController({ onDirection });
    const input = { tagName: 'INPUT' } as unknown as EventTarget;
    controller.handleKeyDown({
      key: 'ArrowUp',
      target: input,
      preventDefault: vi.fn(),
    });

    expect(onDirection).not.toHaveBeenCalled();
  });
});
