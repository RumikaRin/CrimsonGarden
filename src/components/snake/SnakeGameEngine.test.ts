import { describe, expect, it } from 'vitest';
import { SnakeGameEngine } from './SnakeGameEngine';
import type { SnakeGameConfig } from './gameTypes';

const words = [
  { english: 'apple', vietnamese: 'quả táo' },
  { english: 'book', vietnamese: 'quyển sách' },
  { english: 'garden', vietnamese: 'khu vườn' },
];

const baseConfig: SnakeGameConfig = {
  cols: 8,
  rows: 6,
  obstacleCount: 0,
  initialSnake: [{ x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }],
  initialDirection: { x: 0, y: -1 },
  random: () => 0,
};

describe('SnakeGameEngine', () => {
  it('moves one grid cell per step', () => {
    const engine = new SnakeGameEngine(baseConfig);
    engine.start(words);

    engine.step();

    expect(engine.getSnapshot().snake[0]).toEqual({ x: 3, y: 2 });
  });

  it('rejects a direct reverse direction', () => {
    const engine = new SnakeGameEngine(baseConfig);
    engine.start(words);

    engine.queueDirection({ x: 0, y: 1 });
    engine.step();

    expect(engine.getSnapshot().direction).toEqual({ x: 0, y: -1 });
  });

  it('emits correct-food and adds twenty points', () => {
    const engine = new SnakeGameEngine({
      ...baseConfig,
      initialSnake: [{ x: 3, y: 3 }],
      initialFoods: [{ x: 3, y: 2, word: 'apple', isCorrect: true }],
    });
    engine.start(words);

    const events = engine.step();

    expect(events[0]?.type).toBe('correct-food');
    expect(engine.getSnapshot().score).toBe(20);
  });

  it('emits wrong-food and deducts ten points without going below zero', () => {
    const engine = new SnakeGameEngine({
      ...baseConfig,
      initialSnake: [{ x: 3, y: 3 }],
      initialFoods: [{ x: 3, y: 2, word: 'book', isCorrect: false }],
    });
    engine.start(words);

    const events = engine.step();

    expect(events[0]?.type).toBe('wrong-food');
    expect(engine.getSnapshot().score).toBe(0);
  });

  it('ends when the head hits a wall', () => {
    const engine = new SnakeGameEngine({
      ...baseConfig,
      initialSnake: [{ x: 3, y: 0 }],
    });
    engine.start(words);

    const events = engine.step();

    expect(events).toEqual([{ type: 'gameover', score: 0 }]);
    expect(engine.getSnapshot().status).toBe('gameover');
  });

  it('ends when the head hits an obstacle', () => {
    const engine = new SnakeGameEngine({
      ...baseConfig,
      initialObstacles: [{ x: 3, y: 2 }],
    });
    engine.start(words);

    expect(engine.step()).toEqual([{ type: 'gameover', score: 0 }]);
  });

  it('wins after collecting every vocabulary word', () => {
    const engine = new SnakeGameEngine({
      ...baseConfig,
      initialSnake: [{ x: 3, y: 3 }],
      initialFoods: [{ x: 3, y: 2, word: 'apple', isCorrect: true }],
    });
    engine.start([words[0]]);

    const events = engine.step();

    expect(events.at(-1)?.type).toBe('win');
    expect(engine.getSnapshot().status).toBe('win');
  });

  it('never places food on snake, obstacle, or another food', () => {
    const engine = new SnakeGameEngine({
      ...baseConfig,
      initialObstacles: [{ x: 0, y: 0 }],
    });
    engine.start(words);
    const snapshot = engine.getSnapshot();
    const occupied = [...snapshot.snake, ...snapshot.obstacles];

    expect(snapshot.foods).toHaveLength(3);
    expect(new Set(snapshot.foods.map((food) => `${food.x}:${food.y}`)).size).toBe(3);
    snapshot.foods.forEach((food) => {
      expect(occupied).not.toContainEqual({ x: food.x, y: food.y });
    });
  });
});
