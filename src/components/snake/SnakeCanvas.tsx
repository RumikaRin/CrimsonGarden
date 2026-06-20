'use client';

import { useEffect, useRef } from 'react';
import { useExamStore } from '@/store/useExamStore';

export interface FoodItem {
  x: number; y: number; word: string; isCorrect: boolean;
}

export interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; decay: number;
  radius: number; color: string;
}

export interface SnakeCanvasRefs {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: string;
  snakeRef: React.MutableRefObject<{ x: number; y: number }[]>;
  prevSnakeRef: React.MutableRefObject<{ x: number; y: number }[]>;
  directionRef: React.MutableRefObject<{ x: number; y: number }>;
  foodsRef: React.MutableRefObject<FoodItem[]>;
  obstaclesRef: React.MutableRefObject<{ x: number; y: number }[]>;
  particlesRef: React.MutableRefObject<Particle[]>;
  lastTickTimeRef: React.MutableRefObject<number>;
  tickInterval: number;
}

const GRID_SIZE = 30;
const COLS = 30;
const ROWS = 20;

export function SnakeCanvasRenderer({ canvasRef, gameState, snakeRef, prevSnakeRef, directionRef, foodsRef, obstaclesRef, particlesRef, lastTickTimeRef, tickInterval }: SnakeCanvasRefs) {
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

    // --- Background with radial gradient ---
    drawBackground(ctx, canvas.width, canvas.height, isGreenTheme, isDarkTheme);

    // --- Dot grid ---
    drawDotGrid(ctx, isGreenTheme, isDarkTheme);

    // --- Obstacles ---
    drawObstacles(ctx, obstaclesRef.current, isGreenTheme, isDarkTheme);

    // --- Food ---
    drawFoods(ctx, foodsRef.current, now, isGreenTheme, isDarkTheme);

    // --- Snake with interpolation ---
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

    // --- Particles ---
    updateAndDrawParticles(ctx, particlesRef);
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

// ============================================================
// DRAWING FUNCTIONS
// ============================================================

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, isGreen: boolean, isDark: boolean) {
  const cx = w / 2, cy = h / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);

  if (isDark) {
    grad.addColorStop(0, '#242018');
    grad.addColorStop(1, '#121010');
  } else if (isGreen) {
    grad.addColorStop(0, '#F8FDF4');
    grad.addColorStop(1, '#EDF5E8');
  } else {
    grad.addColorStop(0, '#FAF8F3');
    grad.addColorStop(1, '#EEEBE2');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawDotGrid(ctx: CanvasRenderingContext2D, isGreen: boolean, isDark: boolean) {
  const dotColor = isDark ? 'rgba(255,255,255,0.06)' : (isGreen ? 'rgba(34,67,52,0.10)' : 'rgba(220,20,60,0.06)');
  const dotR = 1.2;
  ctx.fillStyle = dotColor;

  for (let col = 0; col <= COLS; col++) {
    for (let row = 0; row <= ROWS; row++) {
      ctx.beginPath();
      ctx.arc(col * GRID_SIZE, row * GRID_SIZE, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawObstacles(ctx: CanvasRenderingContext2D, obstacles: { x: number; y: number }[], isGreen: boolean, isDark: boolean) {
  obstacles.forEach((obs) => {
    const ox = obs.x * GRID_SIZE + 2;
    const oy = obs.y * GRID_SIZE + 2;
    const ow = GRID_SIZE - 4;
    const oh = GRID_SIZE - 4;
    const r = 5;

    ctx.save();

    // Drop shadow
    ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    // Gradient fill
    const grad = ctx.createLinearGradient(ox, oy, ox, oy + oh);
    if (isDark) {
      grad.addColorStop(0, '#4E342E');
      grad.addColorStop(1, '#3E2723');
    } else {
      grad.addColorStop(0, '#7B5B3A');
      grad.addColorStop(1, '#5C4033');
    }
    ctx.fillStyle = grad;

    // Rounded rect
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(ox, oy, ow, oh, r); }
    else { ctx.rect(ox, oy, ow, oh); }
    ctx.fill();

    // Reset shadow for border
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Inner highlight
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(ox + 1, oy + 1, ow - 2, oh - 2, r - 1); }
    else { ctx.rect(ox + 1, oy + 1, ow - 2, oh - 2); }
    ctx.stroke();

    // Cross-hatch marks
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(139,105,20,0.2)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(ox + 4, oy + 4); ctx.lineTo(ox + ow - 4, oy + oh - 4);
    ctx.moveTo(ox + ow - 4, oy + 4); ctx.lineTo(ox + 4, oy + oh - 4);
    ctx.stroke();

    ctx.restore();
  });
}

function drawFoods(ctx: CanvasRenderingContext2D, foods: FoodItem[], now: number, isGreen: boolean, isDark: boolean) {
  foods.forEach((food, fIdx) => {
    const cx = food.x * GRID_SIZE + GRID_SIZE / 2;
    const cy = food.y * GRID_SIZE + GRID_SIZE / 2;
    const pulse = 1 + 0.08 * Math.sin(now / 150 + fIdx * 1.3);
    const baseR = (GRID_SIZE / 2.6) * pulse;

    ctx.save();

    // Glow effect
    ctx.shadowColor = isGreen ? 'rgba(34,197,94,0.4)' : 'rgba(220,20,60,0.35)';
    ctx.shadowBlur = 12;

    // Radial gradient for fruit body
    const fruitGrad = ctx.createRadialGradient(cx - baseR * 0.2, cy - baseR * 0.25, baseR * 0.1, cx, cy, baseR);
    if (isGreen) {
      fruitGrad.addColorStop(0, '#86EFAC');
      fruitGrad.addColorStop(0.6, '#22C55E');
      fruitGrad.addColorStop(1, '#15803D');
    } else {
      fruitGrad.addColorStop(0, '#FCA5A5');
      fruitGrad.addColorStop(0.6, '#DC143C');
      fruitGrad.addColorStop(1, '#991B1B');
    }

    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.fillStyle = fruitGrad;
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Specular highlight
    ctx.beginPath();
    ctx.arc(cx - baseR * 0.25, cy - baseR * 0.28, baseR * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();

    // Stem
    ctx.beginPath();
    ctx.moveTo(cx, cy - baseR);
    ctx.quadraticCurveTo(cx + 1, cy - baseR - 5, cx + 3, cy - baseR - 6);
    ctx.strokeStyle = '#6B4423';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Leaf
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - baseR - 3, 5, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#4ADE80';
    ctx.fill();

    // --- Text label (pill badge) ---
    ctx.font = 'bold 13px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textY = food.y === 0 ? food.y * GRID_SIZE + GRID_SIZE + 16 : food.y * GRID_SIZE - 9;
    const textWidth = ctx.measureText(food.word).width;
    const pillW = textWidth + 16;
    const pillH = 20;
    const pillX = cx - pillW / 2;
    const pillY = textY - pillH / 2;
    const pillR = 6;

    // Pill shadow
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;

    // Pill background
    ctx.fillStyle = isDark ? '#2A2520' : (isGreen ? '#FFFFFF' : '#FFFAF8');
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(pillX, pillY, pillW, pillH, pillR); }
    else { ctx.rect(pillX, pillY, pillW, pillH); }
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Pill border
    ctx.strokeStyle = isDark
      ? (isGreen ? 'rgba(34,197,94,0.5)' : 'rgba(220,20,60,0.5)')
      : (isGreen ? '#224334' : '#DC143C');
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(pillX, pillY, pillW, pillH, pillR); }
    else { ctx.rect(pillX, pillY, pillW, pillH); }
    ctx.stroke();

    // Pill text
    ctx.fillStyle = isDark ? '#F9FAFB' : (isGreen ? '#224334' : '#DC143C');
    ctx.fillText(food.word, cx, textY);

    ctx.restore();
  });
}

function drawSnake(ctx: CanvasRenderingContext2D, segPositions: { x: number; y: number }[], direction: { x: number; y: number }, isGreen: boolean, isDark: boolean) {
  const len = segPositions.length;
  if (len === 0) return;

  // Define theme colors
  const headColor = isDark ? (isGreen ? '#4ADE80' : '#F87171') : (isGreen ? '#224334' : '#DC143C');
  const bodyStartColor = isDark ? (isGreen ? [74, 222, 128] : [248, 113, 113]) : (isGreen ? [34, 67, 52] : [220, 20, 60]);
  const bodyEndColor = isDark ? (isGreen ? [74, 222, 128, 0.3] : [248, 113, 113, 0.3]) : (isGreen ? [156, 229, 193] : [252, 165, 165]);

  // --- Body glow ---
  if (len > 1) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = GRID_SIZE + 4;
    ctx.beginPath();
    ctx.moveTo(segPositions[0].x, segPositions[0].y);
    for (let i = 1; i < len; i++) ctx.lineTo(segPositions[i].x, segPositions[i].y);
    ctx.strokeStyle = isGreen
      ? (isDark ? 'rgba(74,222,128,0.08)' : 'rgba(34,67,52,0.06)')
      : (isDark ? 'rgba(248,113,113,0.08)' : 'rgba(220,20,60,0.06)');
    ctx.stroke();
    ctx.restore();
  }

  // --- Body segments (circles with gradient fade) ---
  for (let i = len - 1; i >= 1; i--) {
    const t = len > 1 ? i / (len - 1) : 0; // 0 = head, 1 = tail
    const radius = (GRID_SIZE / 2 - 2) * (1 - t * 0.35); // taper toward tail

    const r = Math.round(bodyStartColor[0] + (bodyEndColor[0] - bodyStartColor[0]) * t);
    const g = Math.round(bodyStartColor[1] + (bodyEndColor[1] - bodyStartColor[1]) * t);
    const b = Math.round(bodyStartColor[2] + (bodyEndColor[2] - bodyStartColor[2]) * t);
    const alpha = 1 - t * 0.5;

    ctx.save();
    ctx.beginPath();
    ctx.arc(segPositions[i].x, segPositions[i].y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.fill();

    // Subtle inner highlight
    if (t < 0.5) {
      ctx.beginPath();
      ctx.arc(segPositions[i].x - radius * 0.2, segPositions[i].y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.15 * (1 - t * 2)})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // --- Head ---
  const head = segPositions[0];
  const headR = GRID_SIZE / 2 - 1;

  ctx.save();

  // Head glow
  ctx.shadowColor = isGreen
    ? (isDark ? 'rgba(74,222,128,0.4)' : 'rgba(34,67,52,0.25)')
    : (isDark ? 'rgba(248,113,113,0.4)' : 'rgba(220,20,60,0.25)');
  ctx.shadowBlur = 10;

  // Head gradient
  const headGrad = ctx.createRadialGradient(
    head.x - headR * 0.2, head.y - headR * 0.2, headR * 0.1,
    head.x, head.y, headR
  );
  if (isDark) {
    if (isGreen) {
      headGrad.addColorStop(0, '#86EFAC');
      headGrad.addColorStop(1, '#22C55E');
    } else {
      headGrad.addColorStop(0, '#FCA5A5');
      headGrad.addColorStop(1, '#EF4444');
    }
  } else {
    if (isGreen) {
      headGrad.addColorStop(0, '#3D7A56');
      headGrad.addColorStop(1, '#1A3327');
    } else {
      headGrad.addColorStop(0, '#EF4444');
      headGrad.addColorStop(1, '#991B1B');
    }
  }

  ctx.beginPath();
  ctx.arc(head.x, head.y, headR, 0, Math.PI * 2);
  ctx.fillStyle = headGrad;
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // --- Eyes ---
  const eyeWhiteColor = isDark ? '#1A1814' : '#FAFAF9';
  const pupilColor = isDark ? '#FAFAF9' : '#1A1814';
  const eyeR = 4;
  const pupilR = 2;
  const eyeOffset = 4.5;
  const eyeForward = 3.5;

  // Left eye position
  const leX = head.x + direction.x * eyeForward - direction.y * eyeOffset;
  const leY = head.y + direction.y * eyeForward + direction.x * eyeOffset;
  // Right eye position
  const reX = head.x + direction.x * eyeForward + direction.y * eyeOffset;
  const reY = head.y + direction.y * eyeForward - direction.x * eyeOffset;

  // Eye whites
  ctx.fillStyle = eyeWhiteColor;
  ctx.beginPath(); ctx.arc(leX, leY, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(reX, reY, eyeR, 0, Math.PI * 2); ctx.fill();

  // Pupils (offset slightly in direction of movement)
  ctx.fillStyle = pupilColor;
  const pupilShift = 1.2;
  ctx.beginPath(); ctx.arc(leX + direction.x * pupilShift, leY + direction.y * pupilShift, pupilR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(reX + direction.x * pupilShift, reY + direction.y * pupilShift, pupilR, 0, Math.PI * 2); ctx.fill();

  // --- Forked tongue ---
  const tongueBase = headR + 2;
  const tongueLen = 7;
  const forkSpread = 2.5;
  const tx = head.x + direction.x * tongueBase;
  const ty = head.y + direction.y * tongueBase;
  const ttx = head.x + direction.x * (tongueBase + tongueLen);
  const tty = head.y + direction.y * (tongueBase + tongueLen);

  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Tongue stem
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(ttx, tty);
  ctx.stroke();

  // Fork prongs
  ctx.beginPath();
  ctx.moveTo(ttx, tty);
  ctx.lineTo(ttx + direction.x * 3 - direction.y * forkSpread, tty + direction.y * 3 + direction.x * forkSpread);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ttx, tty);
  ctx.lineTo(ttx + direction.x * 3 + direction.y * forkSpread, tty + direction.y * 3 - direction.x * forkSpread);
  ctx.stroke();

  ctx.restore();
}

// ============================================================
// PARTICLE SYSTEM
// ============================================================

function updateAndDrawParticles(ctx: CanvasRenderingContext2D, particlesRef: React.MutableRefObject<Particle[]>) {
  const particles = particlesRef.current;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life -= p.decay;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
