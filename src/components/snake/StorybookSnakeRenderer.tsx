'use client';

import { useEffect, useRef } from 'react';
import type { Application, Container, Graphics } from 'pixi.js';
import { useExamStore } from '@/store/useExamStore';
import type { Direction, GridPoint } from './gameTypes';
import type { FoodItem, Particle } from './SnakeCanvas';
import { clampLabelPosition, getStorybookPalette } from './storybookTextures';

interface StorybookSnakeRendererProps {
  gameState: string;
  snakeRef: React.MutableRefObject<GridPoint[]>;
  prevSnakeRef: React.MutableRefObject<GridPoint[]>;
  directionRef: React.MutableRefObject<Direction>;
  foodsRef: React.MutableRefObject<FoodItem[]>;
  obstaclesRef: React.MutableRefObject<GridPoint[]>;
  particlesRef: React.MutableRefObject<Particle[]>;
  lastTickTimeRef: React.MutableRefObject<number>;
  tickInterval: number;
  onDirection?: (direction: Direction) => void;
}

const BOARD_WIDTH = 900;
const BOARD_HEIGHT = 600;
const GRID_SIZE = 30;

const colorNumber = (hex: string) => Number.parseInt(hex.slice(1), 16);

export function StorybookSnakeRenderer({
  gameState,
  snakeRef,
  prevSnakeRef,
  directionRef,
  foodsRef,
  obstaclesRef,
  particlesRef,
  lastTickTimeRef,
  tickInterval,
  onDirection,
}: StorybookSnakeRendererProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const swipeStartRef = useRef<GridPoint | null>(null);
  const theme = useExamStore((state) => state.theme);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    const palette = getStorybookPalette(theme);
    let app: Application | null = null;

    const setup = async () => {
      const pixi = await import('pixi.js');
      const currentApp = new pixi.Application();
      app = currentApp;
      await currentApp.init({
        preference: 'webgl',
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        backgroundAlpha: 0,
        resizeTo: host,
      });
      if (disposed) {
        currentApp.destroy(true, { children: true });
        return;
      }
      host.appendChild(currentApp.canvas);
      currentApp.canvas.style.width = '100%';
      currentApp.canvas.style.height = '100%';
      currentApp.canvas.style.touchAction = 'none';

      const world = new pixi.Container();
      const background = new pixi.Graphics();
      const scenery = new pixi.Graphics();
      const obstacleLayer = new pixi.Graphics();
      const foodLayer = new pixi.Container();
      const snakeLayer = new pixi.Graphics();
      const effectLayer = new pixi.Graphics();
      world.addChild(background, scenery, obstacleLayer, foodLayer, snakeLayer, effectLayer);
      currentApp.stage.addChild(world);

      drawBackground(background, scenery, palette);
      let obstacleSignature = '';
      let foodSignature = '';
      let quality: 'ultra' | 'high' = 'ultra';
      let lowFpsDuration = 0;
      let elapsedMeasure = 0;

      const resizeWorld = () => {
        const scale = Math.min(currentApp.screen.width / BOARD_WIDTH, currentApp.screen.height / BOARD_HEIGHT);
        world.scale.set(scale);
        world.position.set(
          (currentApp.screen.width - BOARD_WIDTH * scale) / 2,
          (currentApp.screen.height - BOARD_HEIGHT * scale) / 2,
        );
      };

      const render = (ticker: { deltaMS: number; FPS: number }) => {
        resizeWorld();
        elapsedMeasure += ticker.deltaMS;
        if (elapsedMeasure > 5000 && quality === 'ultra') {
          lowFpsDuration = ticker.FPS < 50 ? lowFpsDuration + ticker.deltaMS : 0;
          if (lowFpsDuration >= 3000) quality = 'high';
        }

        const nextObstacleSignature = obstaclesRef.current.map((item) => `${item.x}:${item.y}`).join('|');
        if (nextObstacleSignature !== obstacleSignature) {
          obstacleSignature = nextObstacleSignature;
          drawObstacles(obstacleLayer, obstaclesRef.current, palette);
        }
        const nextFoodSignature = foodsRef.current.map((item) => `${item.x}:${item.y}:${item.word}`).join('|');
        if (nextFoodSignature !== foodSignature) {
          foodSignature = nextFoodSignature;
          drawFoods(foodLayer, foodsRef.current, palette, pixi);
        }
        const progress = gameState === 'playing'
          ? Math.min(1, (performance.now() - lastTickTimeRef.current) / tickInterval)
          : 1;
        drawSnake(snakeLayer, snakeRef.current, prevSnakeRef.current, directionRef.current, progress, palette);
        drawParticles(effectLayer, particlesRef.current, palette, quality);
        scenery.alpha = quality === 'ultra' ? 1 : 0.45;
      };
      currentApp.ticker.add(render);
    };

    void setup();
    return () => {
      disposed = true;
      app?.destroy(true, { children: true, texture: true, textureSource: true });
    };
  }, [theme, gameState, tickInterval, snakeRef, prevSnakeRef, directionRef, foodsRef, obstaclesRef, particlesRef, lastTickTimeRef]);

  const finishSwipe = (point: GridPoint) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || !onDirection) return;
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    onDirection(Math.abs(dx) > Math.abs(dy)
      ? { x: dx > 0 ? 1 : -1, y: 0 }
      : { x: 0, y: dy > 0 ? 1 : -1 });
  };

  return (
    <div
      ref={hostRef}
      className="absolute inset-0"
      onPointerDown={(event) => { swipeStartRef.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={(event) => finishSwipe({ x: event.clientX, y: event.clientY })}
      onPointerCancel={() => { swipeStartRef.current = null; }}
    />
  );
}

function drawBackground(background: Graphics, scenery: Graphics, palette: ReturnType<typeof getStorybookPalette>) {
  background.clear()
    .roundRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT, 24)
    .fill({ color: colorNumber(palette.paper) })
    .stroke({ color: colorNumber(palette.ink), width: 4, alpha: 0.85 });

  for (let y = 12; y < BOARD_HEIGHT; y += 18) {
    for (let x = 12; x < BOARD_WIDTH; x += 18) {
      scenery.circle(x, y, 0.8).fill({ color: colorNumber(palette.mutedInk), alpha: 0.16 });
    }
  }
  for (let index = 0; index < 24; index += 1) {
    const x = 20 + ((index * 83) % 850);
    const y = 18 + ((index * 137) % 555);
    scenery.ellipse(x, y, 8, 3).fill({ color: colorNumber(palette.leaf), alpha: 0.28 });
  }
}

function drawObstacles(layer: Graphics, obstacles: GridPoint[], palette: ReturnType<typeof getStorybookPalette>) {
  layer.clear();
  obstacles.forEach((obstacle, index) => {
    const x = obstacle.x * GRID_SIZE + 4;
    const y = obstacle.y * GRID_SIZE + 4;
    if (index % 3 === 0) {
      layer.roundRect(x, y + 4, 22, 18, 8)
        .fill({ color: colorNumber(palette.obstacle) })
        .stroke({ color: colorNumber(palette.ink), width: 2 });
      layer.circle(x + 8, y + 10, 3).stroke({ color: colorNumber(palette.paperShade), width: 1.5 });
    } else if (index % 3 === 1) {
      layer.roundRect(x + 2, y + 2, 20, 22, 5)
        .fill({ color: colorNumber(palette.paperShade) })
        .stroke({ color: colorNumber(palette.ink), width: 2 });
      layer.moveTo(x + 5, y + 9).lineTo(x + 21, y + 9).stroke({ color: colorNumber(palette.accent), width: 2 });
    } else {
      layer.ellipse(x + 12, y + 15, 12, 10)
        .fill({ color: colorNumber(palette.obstacle) })
        .stroke({ color: colorNumber(palette.ink), width: 2 });
    }
  });
}

function drawFoods(
  layer: Container,
  foods: FoodItem[],
  palette: ReturnType<typeof getStorybookPalette>,
  pixi: typeof import('pixi.js'),
) {
  layer.removeChildren().forEach((child) => child.destroy());
  foods.forEach((food) => {
    const cx = food.x * GRID_SIZE + GRID_SIZE / 2;
    const cy = food.y * GRID_SIZE + GRID_SIZE / 2;
    const apple = new pixi.Graphics()
      .circle(cx - 5, cy + 1, 10)
      .circle(cx + 5, cy + 1, 10)
      .fill({ color: colorNumber(palette.apple) })
      .stroke({ color: colorNumber(palette.ink), width: 2 })
      .ellipse(cx + 5, cy - 12, 7, 3)
      .fill({ color: colorNumber(palette.leaf) })
      .stroke({ color: colorNumber(palette.ink), width: 1.5 });
    layer.addChild(apple);

    const label = new pixi.Text({
      text: food.word,
      style: {
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: colorNumber(palette.ink),
      },
    });
    const labelPosition = clampLabelPosition(
      { x: cx - label.width / 2, y: food.y === 0 ? cy + 22 : cy - 40 },
      { width: label.width + 16, height: 24 },
      { width: BOARD_WIDTH, height: BOARD_HEIGHT },
    );
    const paper = new pixi.Graphics()
      .roundRect(labelPosition.x, labelPosition.y, label.width + 16, 24, 7)
      .fill({ color: colorNumber(palette.paper) })
      .stroke({ color: colorNumber(palette.ink), width: 1.5 });
    label.position.set(labelPosition.x + 8, labelPosition.y + 4);
    layer.addChild(paper, label);
  });
}

function drawSnake(
  layer: Graphics,
  snake: GridPoint[],
  previousSnake: GridPoint[],
  direction: Direction,
  progress: number,
  palette: ReturnType<typeof getStorybookPalette>,
) {
  layer.clear();
  const positions = snake.map((segment, index) => {
    const previous = previousSnake[index] ?? segment;
    return {
      x: (previous.x + (segment.x - previous.x) * progress) * GRID_SIZE + GRID_SIZE / 2,
      y: (previous.y + (segment.y - previous.y) * progress) * GRID_SIZE + GRID_SIZE / 2,
    };
  });
  if (positions.length === 0) return;

  layer.moveTo(positions[0].x, positions[0].y);
  positions.slice(1).forEach((position) => layer.lineTo(position.x, position.y));
  layer.stroke({ color: colorNumber(palette.ink), width: 30, cap: 'round', join: 'round' });
  layer.moveTo(positions[0].x, positions[0].y);
  positions.slice(1).forEach((position) => layer.lineTo(position.x, position.y));
  layer.stroke({ color: colorNumber(palette.snake), width: 25, cap: 'round', join: 'round' });

  const head = positions[0];
  const bounce = Math.sin(progress * Math.PI) * 2;
  const hx = head.x + direction.x * bounce;
  const hy = head.y + direction.y * bounce;
  layer.circle(hx, hy, 16)
    .fill({ color: colorNumber(palette.snakeLight) })
    .stroke({ color: colorNumber(palette.ink), width: 2.5 });
  const sideX = -direction.y * 5;
  const sideY = direction.x * 5;
  [1, -1].forEach((side) => {
    const ex = hx + direction.x * 5 + sideX * side;
    const ey = hy + direction.y * 5 + sideY * side;
    layer.circle(ex, ey, 3.5).fill({ color: colorNumber(palette.paper) }).stroke({ color: colorNumber(palette.ink), width: 1 });
    layer.circle(ex + direction.x, ey + direction.y, 1.4).fill({ color: colorNumber(palette.ink) });
  });
}

function drawParticles(
  layer: Graphics,
  particles: Particle[],
  palette: ReturnType<typeof getStorybookPalette>,
  quality: 'ultra' | 'high',
) {
  layer.clear();
  const limit = quality === 'ultra' ? particles.length : Math.ceil(particles.length / 2);
  for (let index = particles.length - 1; index >= Math.max(0, particles.length - limit); index -= 1) {
    const particle = particles[index];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.96;
    particle.vy *= 0.96;
    particle.life -= particle.decay;
    if (particle.life <= 0) {
      particles.splice(index, 1);
      continue;
    }
    layer.ellipse(particle.x, particle.y, particle.radius * particle.life * 1.5, particle.radius * particle.life * 0.7)
      .fill({ color: particle.color === '#DC143C' ? colorNumber(palette.accent) : colorNumber(palette.leaf), alpha: particle.life });
  }
}
