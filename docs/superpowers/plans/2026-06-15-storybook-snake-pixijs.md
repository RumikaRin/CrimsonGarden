# Illustrated Storybook Snake PixiJS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the vocabulary snake's CPU-heavy Canvas 2D renderer with a PixiJS 8 WebGL storybook renderer while preserving existing vocabulary, score, import, difficulty, and leaderboard behavior.

**Architecture:** Extract deterministic grid gameplay into a pure TypeScript `SnakeGameEngine`, connect all keyboard/touch input through one controller, and render immutable engine snapshots through a PixiJS scene. React remains responsible for surrounding UI and receives only meaningful game events rather than frame-by-frame updates.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zustand, PixiJS 8/WebGL, Vitest, Tailwind CSS 3.

---

## File Structure

- Create `src/components/snake/gameTypes.ts`: shared engine, renderer, direction, food, obstacle, quality, and event types.
- Create `src/components/snake/SnakeGameEngine.ts`: pure fixed-grid gameplay and deterministic snapshots.
- Create `src/components/snake/SnakeGameEngine.test.ts`: engine regression tests.
- Create `src/components/snake/SnakeInputController.ts`: keyboard, swipe, and direction queue adapter.
- Create `src/components/snake/SnakeInputController.test.ts`: input normalization tests.
- Create `src/components/snake/storybookTextures.ts`: generated storybook textures and labels.
- Create `src/components/snake/StorybookSnakeRenderer.tsx`: PixiJS application lifecycle and scene rendering.
- Create `src/components/snake/useSnakeGame.ts`: React adapter between engine, renderer events, HUD, audio, and Zustand.
- Modify `src/components/VocabularySnake.tsx`: use the new hook and storybook renderer; keep setup/import/sidebar UI.
- Modify `src/lib/snakeSound.ts`: reuse one `AudioContext`.
- Modify `package.json`: add PixiJS, Vitest, and test scripts.
- Delete `src/components/snake/SnakeCanvas.tsx` after the new renderer is integrated.

### Task 1: Install PixiJS and establish the test harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install runtime and test dependencies**

Run:

```powershell
npm.cmd install pixi.js
npm.cmd install -D vitest
```

Expected: `pixi.js` appears under dependencies and `vitest` under devDependencies.

- [ ] **Step 2: Add focused test scripts**

Add to `scripts`:

```json
"test": "vitest run",
"test:snake": "vitest run src/components/snake"
```

- [ ] **Step 3: Verify the empty snake suite command**

Run:

```powershell
npm.cmd run test:snake
```

Expected: Vitest reports no test files and exits non-zero until Task 2 adds the first test.

- [ ] **Step 4: Commit**

```powershell
git add package.json package-lock.json
git commit -m "build: add pixijs and snake test harness"
```

### Task 2: Extract deterministic snake engine

**Files:**
- Create: `src/components/snake/gameTypes.ts`
- Create: `src/components/snake/SnakeGameEngine.ts`
- Create: `src/components/snake/SnakeGameEngine.test.ts`

- [ ] **Step 1: Write failing engine tests**

Cover these behaviors with deterministic food placement and obstacle inputs:

```ts
it('moves one grid cell per step');
it('rejects a direct reverse direction');
it('emits correct-food and adds twenty points');
it('emits wrong-food and deducts ten points without going below zero');
it('ends when the head hits a wall, obstacle, or its body');
it('wins after collecting every vocabulary word');
it('never places food on snake, obstacle, or another food');
```

- [ ] **Step 2: Verify tests fail**

Run:

```powershell
npm.cmd run test:snake -- SnakeGameEngine.test.ts
```

Expected: FAIL because `SnakeGameEngine` and shared types do not exist.

- [ ] **Step 3: Implement shared types**

Define:

```ts
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
  targetWord: string | null;
  progress: number;
}
```

- [ ] **Step 4: Implement minimal pure engine**

Implement a class with this public API:

```ts
export class SnakeGameEngine {
  constructor(config: SnakeGameConfig);
  start(words: VocabularyWord[]): void;
  pause(): void;
  resume(): void;
  queueDirection(direction: Direction): void;
  step(): SnakeGameEvent[];
  getSnapshot(): SnakeSnapshot;
}
```

Use injected `random: () => number` for deterministic tests. Keep score rules at `+20/-10`, cap direction queue at three, and preserve the existing 30×20 grid.

- [ ] **Step 5: Run tests**

Run:

```powershell
npm.cmd run test:snake -- SnakeGameEngine.test.ts
```

Expected: all engine tests PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/snake/gameTypes.ts src/components/snake/SnakeGameEngine.ts src/components/snake/SnakeGameEngine.test.ts
git commit -m "feat: extract deterministic snake game engine"
```

### Task 3: Add unified input controller

**Files:**
- Create: `src/components/snake/SnakeInputController.ts`
- Create: `src/components/snake/SnakeInputController.test.ts`

- [ ] **Step 1: Write failing input tests**

Test:

```ts
it('maps arrow and WASD keys to directions');
it('ignores keyboard input while editing a form control');
it('turns a horizontal swipe into left or right');
it('turns a vertical swipe into up or down');
it('ignores swipes shorter than the configured threshold');
```

- [ ] **Step 2: Verify tests fail**

Run:

```powershell
npm.cmd run test:snake -- SnakeInputController.test.ts
```

Expected: FAIL because the controller does not exist.

- [ ] **Step 3: Implement input helpers**

Expose pure helpers and a browser adapter:

```ts
export function directionFromKey(key: string): Direction | null;
export function directionFromSwipe(start: GridPoint, end: GridPoint, threshold?: number): Direction | null;

export class SnakeInputController {
  attach(): void;
  detach(): void;
  beginSwipe(point: GridPoint): void;
  endSwipe(point: GridPoint): void;
}
```

- [ ] **Step 4: Run tests and commit**

Run:

```powershell
npm.cmd run test:snake -- SnakeInputController.test.ts
```

Expected: PASS.

```powershell
git add src/components/snake/SnakeInputController.ts src/components/snake/SnakeInputController.test.ts
git commit -m "feat: unify snake keyboard and swipe input"
```

### Task 4: Build generated storybook texture system

**Files:**
- Create: `src/components/snake/storybookTextures.ts`
- Create: `src/components/snake/storybookTextures.test.ts`

- [ ] **Step 1: Write failing tests for deterministic asset descriptors**

Test that the palette resolver returns complete cozy, garden, and dark storybook palettes, and that word labels are clamped to the board bounds.

- [ ] **Step 2: Verify tests fail**

Run:

```powershell
npm.cmd run test:snake -- storybookTextures.test.ts
```

- [ ] **Step 3: Implement palette and label layout helpers**

Use PixiJS `Graphics` and generated textures at renderer initialization, not inside the frame loop. Include:

- paper grain tile
- illustrated apple with leaf and ink outline
- snake head/body/tail textures
- rock, tree stump, and book-stack obstacle textures
- leaf, paper-star, dust, and crimson-ink particle textures
- paper word-label layout helper

- [ ] **Step 4: Run tests and commit**

```powershell
npm.cmd run test:snake -- storybookTextures.test.ts
git add src/components/snake/storybookTextures.ts src/components/snake/storybookTextures.test.ts
git commit -m "feat: add illustrated storybook snake textures"
```

### Task 5: Implement PixiJS storybook renderer

**Files:**
- Create: `src/components/snake/StorybookSnakeRenderer.tsx`

- [ ] **Step 1: Create renderer lifecycle**

Initialize PixiJS with production WebGL preference:

```ts
const app = new Application();
await app.init({
  preference: 'webgl',
  antialias: true,
  autoDensity: true,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  backgroundAlpha: 0,
  resizeTo: host,
});
```

Destroy the app, ticker listeners, textures, observers, and pointer listeners on unmount.

- [ ] **Step 2: Create retained scene graph**

Build stable layers once:

```ts
backgroundLayer
parallaxLayer
obstacleLayer
foodLayer
snakeLayer
effectLayer
labelLayer
```

Update object transforms from snapshots without recreating gradients, textures, or containers each frame.

- [ ] **Step 3: Add hybrid movement and effects**

- interpolate body positions between engine steps
- add head bounce on direction change
- animate apples and paper labels
- correct event: leaf/star burst and `+20`
- wrong event: crimson ink burst, camera shake, and `-10`
- gameover: paper dust
- win: leaf and paper-star rain

- [ ] **Step 4: Add quality monitor**

Start measuring after five seconds. If average FPS remains below 50 for three seconds, switch from `ultra` to `high` for the rest of the run. `High` disables one parallax layer and halves particle counts.

- [ ] **Step 5: Run type check**

Run:

```powershell
npm.cmd run lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/snake/StorybookSnakeRenderer.tsx
git commit -m "feat: render storybook snake with pixijs"
```

### Task 6: Add React game adapter and reusable audio

**Files:**
- Create: `src/components/snake/useSnakeGame.ts`
- Modify: `src/lib/snakeSound.ts`

- [ ] **Step 1: Refactor audio context**

Create one lazily initialized audio context and reuse it:

```ts
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  audioContext ??= new AudioContext();
  return audioContext;
}
```

Add a short `turn` sound while preserving existing sound names.

- [ ] **Step 2: Implement the hook**

The hook owns engine lifecycle, fixed timestep scheduling, input controller, duration, meaningful HUD state, event effects, pause/resume on visibility change, and score persistence. Public API:

```ts
export interface UseSnakeGameResult {
  snapshot: SnakeSnapshot;
  renderStateRef: React.MutableRefObject<SnakeRenderState>;
  durationSeconds: number;
  start(): void;
  pause(): void;
  resume(): void;
  changeDirection(direction: Direction): void;
}
```

Do not update React state every animation frame.

- [ ] **Step 3: Run tests and type check**

```powershell
npm.cmd run test:snake
npm.cmd run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add src/components/snake/useSnakeGame.ts src/lib/snakeSound.ts
git commit -m "feat: connect snake engine to react and audio"
```

### Task 7: Integrate Storybook renderer into the existing screen

**Files:**
- Modify: `src/components/VocabularySnake.tsx`
- Delete: `src/components/snake/SnakeCanvas.tsx`

- [ ] **Step 1: Replace local gameplay refs and intervals**

Remove duplicated movement, collision, food placement, particle, and interval logic from `VocabularySnake.tsx`. Use `useSnakeGame` for all gameplay state and actions.

- [ ] **Step 2: Replace Canvas renderer**

Replace:

```tsx
<canvas ref={canvasRef} ... />
<SnakeCanvasRenderer ... />
```

with:

```tsx
<StorybookSnakeRenderer
  renderStateRef={renderStateRef}
  theme={theme}
  onSwipeDirection={changeDirection}
/>
```

- [ ] **Step 3: Apply storybook HUD**

- paper-tab target word panel
- illustrated score/time labels
- storybook loading and WebGL error state
- storybook pause, win, and gameover overlays
- retain category, difficulty, import, collected words, and mobile controls

- [ ] **Step 4: Verify functionality**

Run:

```powershell
npm.cmd run test:snake
npm.cmd run lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/components/VocabularySnake.tsx src/components/snake/SnakeCanvas.tsx
git commit -m "feat: integrate illustrated storybook snake game"
```

### Task 8: Final verification and performance audit

**Files:**
- Review all snake files and dependency changes.

- [ ] **Step 1: Run full automated verification**

```powershell
npm.cmd run test
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected: all commands PASS.

- [ ] **Step 2: Verify browser behavior**

At 375px and 1440px:

- start, pause, resume, win, and gameover
- arrow/WASD, mobile controls, and swipe
- correct/wrong apple effects
- long word labels remain visible
- cozy, garden, and dark themes
- renderer releases when leaving `/snake`
- quality changes to `High` only after the defined sustained FPS threshold

- [ ] **Step 3: Review scope**

Confirm no power-ups, bosses, multiple levels, multiplayer, or unrelated UI changes were introduced.

- [ ] **Step 4: Commit verification fixes**

```powershell
git add package.json package-lock.json src/components/VocabularySnake.tsx src/components/snake src/lib/snakeSound.ts
git commit -m "test: verify pixijs storybook snake"
```
