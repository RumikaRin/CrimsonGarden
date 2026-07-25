import type { VocabularyWord } from '@/types';

export type GridPoint = { x: number; y: number };
export type Direction = GridPoint;
export type SnakeGameStatus = 'idle' | 'playing' | 'paused' | 'gameover' | 'win';
export type SnakeQuality = 'ultra' | 'high';

export interface SnakeFood extends GridPoint {
  word: string;
  isCorrect: boolean;
}

export type SnakeGameEvent =
  | { type: 'correct-food'; food: SnakeFood; score: number }
  | { type: 'wrong-food'; food: SnakeFood; score: number }
  | { type: 'gameover'; score: number }
  | { type: 'win'; score: number };

export interface SnakeSnapshot {
  status: SnakeGameStatus;
  snake: GridPoint[];
  previousSnake: GridPoint[];
  direction: Direction;
  foods: SnakeFood[];
  obstacles: GridPoint[];
  score: number;
  collectedWords: string[];
  targetWord: VocabularyWord | null;
  progress: number;
}

export interface SnakeGameConfig {
  cols: number;
  rows: number;
  obstacleCount: number;
  initialSnake: GridPoint[];
  initialDirection: Direction;
  random?: () => number;
  initialFoods?: SnakeFood[];
  initialObstacles?: GridPoint[];
}

export interface SnakeRenderState {
  snapshot: SnakeSnapshot;
  previousStepAt: number;
  stepDuration: number;
  quality: SnakeQuality;
  effects: SnakeGameEvent[];
}
