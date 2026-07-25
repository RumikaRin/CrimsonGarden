import type { VocabularyWord } from '@/types';
import type {
  Direction,
  GridPoint,
  SnakeFood,
  SnakeGameConfig,
  SnakeGameEvent,
  SnakeGameStatus,
  SnakeSnapshot,
} from './gameTypes';

const samePoint = (a: GridPoint, b: GridPoint) => a.x === b.x && a.y === b.y;
const clonePoints = (points: GridPoint[]) => points.map((point) => ({ ...point }));
const isReverse = (a: Direction, b: Direction) => a.x === -b.x && a.y === -b.y;

export class SnakeGameEngine {
  private readonly config: SnakeGameConfig;
  private readonly random: () => number;
  private words: VocabularyWord[] = [];
  private snake: GridPoint[];
  private previousSnake: GridPoint[];
  private direction: Direction;
  private directionQueue: Direction[] = [];
  private foods: SnakeFood[] = [];
  private obstacles: GridPoint[] = [];
  private collectedWords = new Set<string>();
  private targetWord: VocabularyWord | null = null;
  private score = 0;
  private status: SnakeGameStatus = 'idle';

  constructor(config: SnakeGameConfig) {
    this.config = config;
    this.random = config.random ?? Math.random;
    this.snake = clonePoints(config.initialSnake);
    this.previousSnake = clonePoints(config.initialSnake);
    this.direction = { ...config.initialDirection };
  }

  start(words: VocabularyWord[]): void {
    this.words = [...words];
    this.snake = clonePoints(this.config.initialSnake);
    this.previousSnake = clonePoints(this.config.initialSnake);
    this.direction = { ...this.config.initialDirection };
    this.directionQueue = [];
    this.collectedWords = new Set();
    this.score = 0;
    this.status = 'playing';
    this.obstacles = this.config.initialObstacles
      ? clonePoints(this.config.initialObstacles)
      : this.createObstacles();
    this.foods = this.config.initialFoods
      ? this.config.initialFoods.map((food) => ({ ...food }))
      : this.createFoods();
    this.targetWord = this.resolveTargetFromFoods();
  }

  pause(): void {
    if (this.status === 'playing') this.status = 'paused';
  }

  resume(): void {
    if (this.status === 'paused') this.status = 'playing';
  }

  queueDirection(direction: Direction): void {
    if (this.status !== 'playing' || this.directionQueue.length >= 3) return;
    const reference = this.directionQueue.at(-1) ?? this.direction;
    if (isReverse(reference, direction) || samePoint(reference, direction)) return;
    this.directionQueue.push({ ...direction });
  }

  step(): SnakeGameEvent[] {
    if (this.status !== 'playing') return [];
    this.previousSnake = clonePoints(this.snake);
    const queuedDirection = this.directionQueue.shift();
    if (queuedDirection) this.direction = queuedDirection;

    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y,
    };
    if (this.isCollision(head)) {
      this.status = 'gameover';
      return [{ type: 'gameover', score: this.score }];
    }

    const nextSnake = [head, ...clonePoints(this.snake)];
    const food = this.foods.find((item) => samePoint(item, head));
    const events: SnakeGameEvent[] = [];

    if (!food) {
      nextSnake.pop();
      this.snake = nextSnake;
      return events;
    }

    if (food.isCorrect) {
      this.score += 20;
      this.collectedWords.add(food.word);
      events.push({ type: 'correct-food', food: { ...food }, score: this.score });
      this.snake = nextSnake;
      if (this.collectedWords.size >= this.words.length) {
        this.status = 'win';
        events.push({ type: 'win', score: this.score });
        return events;
      }
    } else {
      this.score = Math.max(0, this.score - 10);
      nextSnake.pop();
      this.snake = nextSnake;
      events.push({ type: 'wrong-food', food: { ...food }, score: this.score });
    }

    this.foods = this.createFoods();
    this.targetWord = this.resolveTargetFromFoods();
    return events;
  }

  getSnapshot(): SnakeSnapshot {
    return {
      status: this.status,
      snake: clonePoints(this.snake),
      previousSnake: clonePoints(this.previousSnake),
      direction: { ...this.direction },
      foods: this.foods.map((food) => ({ ...food })),
      obstacles: clonePoints(this.obstacles),
      score: this.score,
      collectedWords: [...this.collectedWords],
      targetWord: this.targetWord ? { ...this.targetWord } : null,
      progress: this.words.length > 0 ? this.collectedWords.size / this.words.length : 0,
    };
  }

  private isCollision(head: GridPoint): boolean {
    return head.x < 0
      || head.x >= this.config.cols
      || head.y < 0
      || head.y >= this.config.rows
      || this.snake.some((segment) => samePoint(segment, head))
      || this.obstacles.some((obstacle) => samePoint(obstacle, head));
  }

  private createObstacles(): GridPoint[] {
    const obstacles: GridPoint[] = [];
    for (let index = 0; index < this.config.obstacleCount; index += 1) {
      const point = this.findFreeCell(obstacles);
      if (!point) break;
      obstacles.push(point);
    }
    return obstacles;
  }

  private createFoods(): SnakeFood[] {
    const available = this.words.filter((word) => !this.collectedWords.has(word.english));
    const pool = available.length > 0 ? available : this.words;
    if (pool.length === 0) return [];
    const correct = pool[Math.floor(this.random() * pool.length) % pool.length];
    const wrong = this.words.filter((word) => word.english !== correct.english).slice(0, 2);
    const foods: SnakeFood[] = [];

    [correct, ...wrong].forEach((word, index) => {
      const point = this.findFreeCell([...this.obstacles, ...foods]);
      if (point) foods.push({ ...point, word: word.english, isCorrect: index === 0 });
    });
    return foods;
  }

  private findFreeCell(extraOccupied: GridPoint[]): GridPoint | null {
    const total = this.config.cols * this.config.rows;
    const start = Math.floor(this.random() * total) % total;
    for (let offset = 0; offset < total; offset += 1) {
      const index = (start + offset) % total;
      const point = { x: index % this.config.cols, y: Math.floor(index / this.config.cols) };
      const occupied = this.snake.some((item) => samePoint(item, point))
        || extraOccupied.some((item) => samePoint(item, point));
      if (!occupied) return point;
    }
    return null;
  }

  private resolveTargetFromFoods(): VocabularyWord | null {
    const correctFood = this.foods.find((food) => food.isCorrect);
    return this.words.find((word) => word.english === correctFood?.word) ?? null;
  }
}
