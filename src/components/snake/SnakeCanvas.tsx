'use client';

import { useEffect, useRef } from 'react';
import { useExamStore } from '@/store/useExamStore';

export interface FoodItem {
  x: number; y: number; word: string; isCorrect: boolean;
}

export interface SnakeCanvasRefs {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: string;
  snakeRef: React.MutableRefObject<{ x: number; y: number }[]>;
  prevSnakeRef: React.MutableRefObject<{ x: number; y: number }[]>;
  directionRef: React.MutableRefObject<{ x: number; y: number }>;
  foodsRef: React.MutableRefObject<FoodItem[]>;
  obstaclesRef: React.MutableRefObject<{ x: number; y: number }[]>;
  lastTickTimeRef: React.MutableRefObject<number>;
  tickInterval: number;
}

const GRID_SIZE = 30;
const COLS = 30;
const ROWS = 20;

export function SnakeCanvasRenderer({ canvasRef, gameState, snakeRef, prevSnakeRef, directionRef, foodsRef, obstaclesRef, lastTickTimeRef, tickInterval }: SnakeCanvasRefs) {
  const animRef = useRef<number>(0);
  const { theme } = useExamStore();
  const isGreenTheme = theme === 'neon';
  const isDarkTheme = theme === 'dark';

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    const elapsed = now - lastTickTimeRef.current;
    const progress = gameState === 'playing' ? Math.min(1, elapsed / tickInterval) : 1;


    ctx.fillStyle = isDarkTheme ? '#1A1814' : (isGreenTheme ? '#F4FAF0' : '#F2EFE7');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, isGreenTheme, isDarkTheme);
    drawObstacles(ctx, obstaclesRef.current, isGreenTheme, isDarkTheme);
    drawFoods(ctx, foodsRef.current, now, isGreenTheme, isDarkTheme);

    const snake = snakeRef.current;
    const prevSnake = prevSnakeRef.current;
    const segPositions = snake.map((seg, i) => {
      const prev = prevSnake[i] || seg;
      return {
        x: (prev.x + (seg.x - prev.x) * progress) * GRID_SIZE + GRID_SIZE / 2,
        y: (prev.y + (seg.y - prev.y) * progress) * GRID_SIZE + GRID_SIZE / 2,
      };
    });

    drawSnake(ctx, segPositions, directionRef.current, isGreenTheme, isDarkTheme);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const loop = () => { draw(); animRef.current = requestAnimationFrame(loop); };
      animRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animRef.current);
    } else {
      draw();
    }
  }, [gameState, isGreenTheme, isDarkTheme, tickInterval]);

  return null;
}

function drawGrid(ctx: CanvasRenderingContext2D, isGreen: boolean, isDark: boolean) {
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : (isGreen ? 'rgba(34, 67, 52, 0.12)' : 'rgba(220, 20, 60, 0.08)');
  ctx.lineWidth = 1;
  for (let i = 0; i <= COLS; i++) {
    ctx.beginPath(); ctx.moveTo(i * GRID_SIZE, 0); ctx.lineTo(i * GRID_SIZE, ROWS * GRID_SIZE); ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * GRID_SIZE); ctx.lineTo(COLS * GRID_SIZE, i * GRID_SIZE); ctx.stroke();
  }
}

function drawObstacles(ctx: CanvasRenderingContext2D, obstacles: { x: number; y: number }[], isGreen: boolean, isDark: boolean) {
  obstacles.forEach((obs) => {
    const ox = obs.x * GRID_SIZE, oy = obs.y * GRID_SIZE;
    ctx.save();
    ctx.fillStyle = isDark ? '#3E2723' : '#5c4033';
    ctx.fillRect(ox + 1, oy + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    ctx.strokeStyle = isDark ? '#5D4037' : '#8b6914';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox + 1, oy + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    ctx.strokeStyle = 'rgba(139,105,20,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox + 2, oy + 2); ctx.lineTo(ox + GRID_SIZE - 2, oy + GRID_SIZE - 2);
    ctx.moveTo(ox + GRID_SIZE - 2, oy + 2); ctx.lineTo(ox + 2, oy + GRID_SIZE - 2);
    ctx.stroke();
    ctx.restore();
  });
}

function drawFoods(ctx: CanvasRenderingContext2D, foods: FoodItem[], now: number, isGreen: boolean, isDark: boolean) {
  foods.forEach((food, fIdx) => {
    const cx = food.x * GRID_SIZE + GRID_SIZE / 2;
    const cy = food.y * GRID_SIZE + GRID_SIZE / 2;
    const scale = 1 + 0.08 * Math.sin(now / 150 + fIdx);
    const r = (GRID_SIZE / 2.8) * scale;

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = isGreen ? '#22C55E' : '#DC143C';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1; ctx.stroke();

    ctx.beginPath(); ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill();

    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + 2, cy - r - 4);
    ctx.strokeStyle = '#5c3a1e'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.beginPath(); ctx.ellipse(cx + 3, cy - r - 2, 4, 2, 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = '#4a9c59'; ctx.fill();

    ctx.font = 'bold 14px Inter, system-ui';
    ctx.textAlign = 'center';
    const textY = food.y === 0 ? food.y * GRID_SIZE + GRID_SIZE + 14 : food.y * GRID_SIZE - 7;
    const textWidth = ctx.measureText(food.word).width;

    ctx.fillStyle = isDark ? '#1A1814' : (isGreen ? '#FFFFFF' : '#FFF9FA');
    ctx.strokeStyle = isDark ? (isGreen ? '#22C55E' : '#EF4444') : (isGreen ? '#224334' : '#DC143C');
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(cx - textWidth / 2 - 7, textY - 12, textWidth + 14, 18, 5); }
    else { ctx.rect(cx - textWidth / 2 - 7, textY - 12, textWidth + 14, 18); }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isDark ? '#F9FAFB' : (isGreen ? '#224334' : '#DC143C');
    ctx.fillText(food.word, cx, textY + 2);
    ctx.restore();
  });
}

function drawSnake(ctx: CanvasRenderingContext2D, segPositions: { x: number; y: number }[], direction: { x: number; y: number }, isGreen: boolean, isDark: boolean) {
  if (segPositions.length > 1) {
    ctx.save();
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.lineWidth = GRID_SIZE - 3; ctx.beginPath();
    ctx.moveTo(segPositions[0].x, segPositions[0].y);
    for (let i = 1; i < segPositions.length; i++) ctx.lineTo(segPositions[i].x, segPositions[i].y);
    ctx.strokeStyle = isGreen ? 'rgba(121, 171, 142, 0.7)' : 'rgba(220, 20, 60, 0.7)';
    ctx.stroke();
    ctx.lineWidth = GRID_SIZE - 5;
    ctx.strokeStyle = isGreen ? 'rgba(121, 171, 142, 0.25)' : 'rgba(220, 20, 60, 0.15)';
    ctx.stroke();
    ctx.restore();
  }

  if (segPositions.length > 0) {
    const head = segPositions[0];
    const headR = GRID_SIZE / 2 - 1.5;
    ctx.save();
    ctx.beginPath(); ctx.arc(head.x, head.y, headR, 0, 2 * Math.PI);
    ctx.fillStyle = isDark ? (isGreen ? '#4ADE80' : '#F87171') : (isGreen ? '#224334' : '#DC143C'); ctx.fill();
    ctx.fillStyle = isDark ? '#1A1814' : (isGreen ? '#9ce5c1' : '#FAF9F6');
    ctx.beginPath(); ctx.arc(head.x + direction.x * 3 - direction.y * 4, head.y + direction.y * 3 + direction.x * 4, 2.5, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(head.x + direction.x * 3 + direction.y * 4, head.y + direction.y * 3 - direction.x * 4, 2.5, 0, 2 * Math.PI); ctx.fill();
    ctx.restore();
  }
}
