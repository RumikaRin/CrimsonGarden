import type { Direction, GridPoint } from './gameTypes';

interface KeyLike {
  key: string;
  target?: EventTarget | null;
  preventDefault(): void;
}

interface SnakeInputControllerOptions {
  onDirection: (direction: Direction) => void;
  onPauseToggle?: () => void;
  swipeThreshold?: number;
}

const keyDirections: Record<string, Direction> = {
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  S: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 },
};

export function directionFromKey(key: string): Direction | null {
  return keyDirections[key] ? { ...keyDirections[key] } : null;
}

export function directionFromSwipe(start: GridPoint, end: GridPoint, threshold = 24): Direction | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return null;
  if (Math.abs(dx) > Math.abs(dy)) return { x: dx > 0 ? 1 : -1, y: 0 };
  return { x: 0, y: dy > 0 ? 1 : -1 };
}

function isFormControl(target?: EventTarget | null): boolean {
  const tagName = (target as { tagName?: string } | null)?.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

export class SnakeInputController {
  private readonly options: SnakeInputControllerOptions;
  private swipeStart: GridPoint | null = null;

  constructor(options: SnakeInputControllerOptions) {
    this.options = options;
  }

  attach(): void {
    if (typeof window !== 'undefined') window.addEventListener('keydown', this.handleWindowKeyDown);
  }

  detach(): void {
    if (typeof window !== 'undefined') window.removeEventListener('keydown', this.handleWindowKeyDown);
  }

  beginSwipe(point: GridPoint): void {
    this.swipeStart = { ...point };
  }

  endSwipe(point: GridPoint): void {
    if (!this.swipeStart) return;
    const direction = directionFromSwipe(this.swipeStart, point, this.options.swipeThreshold);
    this.swipeStart = null;
    if (direction) this.options.onDirection(direction);
  }

  handleKeyDown(event: KeyLike): void {
    if (isFormControl(event.target)) return;
    if (event.key === ' ' || event.key === 'Escape') {
      event.preventDefault();
      this.options.onPauseToggle?.();
      return;
    }
    const direction = directionFromKey(event.key);
    if (!direction) return;
    event.preventDefault();
    this.options.onDirection(direction);
  }

  private readonly handleWindowKeyDown = (event: KeyboardEvent) => {
    this.handleKeyDown(event);
  };
}
