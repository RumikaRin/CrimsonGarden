'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useExamStore } from '@/store/useExamStore';
import { VocabularyWord } from '@/types';
import {
  Play, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  BookOpen, UploadCloud, Download, Target, Gamepad2, Keyboard,
  Pause, Volume2, VolumeX, Flame, Zap, Award, Info, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getThemeTokens } from '@/lib/theme';
import { playSound } from '@/lib/snakeSound';
import { SnakeCanvasRenderer, FoodItem } from './snake/SnakeCanvas';
import { downloadFile } from '@/lib/download';

const GRID_SIZE = 30;
const COLS = 30;
const ROWS = 20;
const CANVAS_W = COLS * GRID_SIZE;
const CANVAS_H = ROWS * GRID_SIZE;
const NUM_OBSTACLES = 15;

const DIFFICULTY_SPEEDS = {
  slow: 320,
  normal: 220,
  fast: 130,
};

const i18n = {
  vi: {
    correct: 'CHÍNH XÁC', wrong: 'SAI',
    plus20: '+20', minus10: '-10',
    gameOver: 'Game Over', win: 'Chiến thắng!',
    score: 'điểm', collected: 'Đã thu thập',
    words: 'từ vựng', noWords: 'Chưa có từ nào — bắt đầu chơi để thu thập!',
    hint: '↑↓←→ di chuyển · ăn đúng +20đ · tránh tường',
    hintDetail: 'Chi tiết', guideTitle: 'Hướng dẫn chơi',
    guide1: 'Ăn đúng từ tiếng Anh tương ứng với nghĩa tiếng Việt ở trên → +20 điểm.',
    guide2: 'Ăn sai từ tiếng Anh → bị trừ -10 điểm.',
    guide3: 'Tránh đâm vào tường, chướng ngại vật màu nâu hoặc đuôi rắn.',
    guide4: 'Thu thập hết toàn bộ từ trong chủ đề đã chọn để chiến thắng.',
    importTitle: 'Import từ vựng', importPlaceholder: 'Tên chủ đề (tuỳ chọn)',
    importBtn: 'Chọn file (.csv / .txt)', downloadTemplate: 'Tải file mẫu',
    category: 'Chủ đề', score_: 'Điểm', time: 'Thời gian', sec: 'giây',
    start: 'BẮT ĐẦU', settings: 'Cài đặt',
    pausedTitle: 'Đã Tạm Dừng', pausedDesc: 'Nhấn Space hoặc nút Tiếp tục để chơi tiếp',
    resume: 'Tiếp tục',
  },
  en: {
    correct: 'CORRECT', wrong: 'WRONG',
    plus20: '+20', minus10: '-10',
    gameOver: 'Game Over', win: 'Victory!',
    score: 'pts', collected: 'Collected',
    words: 'words', noWords: 'No words yet — start playing to collect!',
    hint: '↑↓←→ move · eat correct +20 · avoid walls',
    hintDetail: 'Details', guideTitle: 'How to Play',
    guide1: 'Eat the correct English word matching the Vietnamese meaning → +20 pts.',
    guide2: 'Eating the wrong word → deducts -10 pts.',
    guide3: 'Avoid hitting walls, brown obstacles, or your own tail.',
    guide4: 'Collect all words in the selected pack to win.',
    importTitle: 'Import Vocabulary', importPlaceholder: 'Category name (optional)',
    importBtn: 'Choose file (.csv / .txt)', downloadTemplate: 'Download template',
    category: 'Category', score_: 'Score', time: 'Time', sec: 's',
    start: 'START', settings: 'Settings',
    pausedTitle: 'Paused', pausedDesc: 'Press Space or Resume button to continue playing',
    resume: 'Resume',
  }
};

export default function VocabularySnake() {
  const { vocabularyPacks, addGameScore, addVocabularyPack, currentUser, theme, soundEnabled, setSoundEnabled, gameScores } = useExamStore();
  const tokens = getThemeTokens(theme);
  const isGreenTheme = theme === 'neon';
  const isDarkTheme = theme === 'dark';
  const selectedCategoryList = Object.keys(vocabularyPacks);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover' | 'win'>('idle');
  const [score, setScore] = useState(0);
  const [targetWord, setTargetWord] = useState<VocabularyWord | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [eatenWords, setEatenWords] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState<'slow' | 'normal' | 'fast'>('normal');

  const [customCategoryName, setCustomCategoryName] = useState('');
  const [vocabError, setVocabError] = useState<string | null>(null);
  const [vocabSuccess, setVocabSuccess] = useState<string | null>(null);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  const _t = useCallback((key: string): string => {
    try {
      return (i18n as any)[lang][key] || key;
    } catch { return key; }
  }, [lang]);

  const tickInterval = DIFFICULTY_SPEEDS[difficulty];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snakeRef = useRef<{ x: number; y: number }[]>([
    { x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 },
  ]);
  const prevSnakeRef = useRef<{ x: number; y: number }[]>([
    { x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 },
  ]);
  const directionRef = useRef<{ x: number; y: number }>({ x: 0, y: -1 });
  const foodsRef = useRef<FoodItem[]>([]);
  const obstaclesRef = useRef<{ x: number; y: number }[]>([]);
  const gameIntervalRef = useRef<number | null>(null);
  const durationRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);
  const scoreRef = useRef<number>(0);
  const vocabPacksRef = useRef<Record<string, VocabularyWord[]>>(vocabularyPacks);
  const totalWordsRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);
  const selectedCategoryRef = useRef<string>('');
  const gameStateRef = useRef(gameState);
  const lastProcessedDirectionRef = useRef<{ x: number; y: number }>({ x: 0, y: -1 });

  vocabPacksRef.current = vocabularyPacks;

  useEffect(() => { selectedCategoryRef.current = selectedCategory; }, [selectedCategory]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Derived Category High Score
  const categoryScores = gameScores.filter(s => s.vocabularyCategory === selectedCategory);
  const categoryHighScore = categoryScores.length > 0 ? Math.max(...categoryScores.map(s => s.score)) : 0;

  useEffect(() => {
    if (selectedCategoryList.length > 0) {
      const initialCat = selectedCategory || selectedCategoryList[0];
      if (initialCat && selectedCategory !== initialCat) setSelectedCategory(initialCat);
      if (!targetWord) setupTargets(initialCat);
    }
  }, [vocabularyPacks]);

  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, []);

  const changeDirection = (newDir: { x: number; y: number }) => {
    const lastDir = lastProcessedDirectionRef.current;
    if (newDir.x !== 0 && lastDir.x === -newDir.x) return;
    if (newDir.y !== 0 && lastDir.y === -newDir.y) return;
    directionRef.current = newDir;
  };

  const setupTargets = (category?: string) => {
    const activeCat = category || selectedCategoryRef.current || selectedCategory || Object.keys(vocabPacksRef.current)[0];
    if (!activeCat) return;
    const list = vocabPacksRef.current[activeCat];
    if (!list || list.length === 0) return;

    let uneaten = list.filter((w) => !eatenWordsRef.current.has(w.english));
    if (uneaten.length === 0) uneaten = list;
    const correct = uneaten[Math.floor(Math.random() * uneaten.length)];
    setTargetWord(correct);
    totalWordsRef.current = list.length;

    const incorrects = list.filter((w) => w.english !== correct.english);
    const badOptions = [...incorrects].sort(() => 0.5 - Math.random()).slice(0, 2);

    const placedFoods: FoodItem[] = [];
    [correct.english, ...badOptions.map((o) => o.english)].forEach((word, index) => {
      let x = 0, y = 0, valid = false;
      while (!valid) {
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        const hitSnake = snakeRef.current.some((seg) => seg.x === x && seg.y === y);
        const hitFood = placedFoods.some((f) => f.x === x && f.y === y);
        const hitWall = obstaclesRef.current.some((o) => o.x === x && o.y === y);
        if (!hitSnake && !hitFood && !hitWall) valid = true;
      }
      placedFoods.push({ x, y, word, isCorrect: index === 0 });
    });
    foodsRef.current = placedFoods;
  };

  const startGame = () => {
    if (soundEnabled) playSound('start');
    if (typeof document !== 'undefined') (document.activeElement as HTMLElement)?.blur();

    snakeRef.current = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    prevSnakeRef.current = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    directionRef.current = { x: 0, y: -1 };
    lastProcessedDirectionRef.current = { x: 0, y: -1 };
    scoreRef.current = 0; setScore(0);
    durationRef.current = 0;
    eatenWordsRef.current = new Set(); setEatenWords(new Set());

    const walls: { x: number; y: number }[] = [];
    for (let i = 0; i < NUM_OBSTACLES; i++) {
      let wx = 0, wy = 0, valid = false, attempts = 0;
      while (!valid && attempts < 100) {
        wx = Math.floor(Math.random() * COLS);
        wy = Math.floor(Math.random() * ROWS);
        attempts++;
        if (!snakeRef.current.some(s => Math.abs(s.x - wx) + Math.abs(s.y - wy) < 4)) valid = true;
      }
      if (valid) walls.push({ x: wx, y: wy });
    }
    obstaclesRef.current = walls;

    setGameState('playing'); setFeedback(null);
    lastTickTimeRef.current = performance.now();
    const activeCat = selectedCategory || Object.keys(vocabularyPacks)[0];
    setupTargets(activeCat);

    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    gameIntervalRef.current = window.setInterval(gameTick, tickInterval);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = window.setInterval(() => { durationRef.current += 1; }, 1000);
  };

  const pauseGame = () => {
    if (gameStateRef.current !== 'playing') return;
    setGameState('paused');
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const resumeGame = () => {
    if (gameStateRef.current !== 'paused') return;
    setGameState('playing');
    lastTickTimeRef.current = performance.now();
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    gameIntervalRef.current = window.setInterval(gameTick, tickInterval);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = window.setInterval(() => { durationRef.current += 1; }, 1000);
  };

  const triggerFeedback = (text: string, color: string) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 1500);
  };

  const gameTick = () => {
    prevSnakeRef.current = [...snakeRef.current];
    lastTickTimeRef.current = performance.now();

    const snake = [...snakeRef.current];
    const head = { ...snake[0] };
    const dir = directionRef.current;
    lastProcessedDirectionRef.current = dir;
    head.x += dir.x; head.y += dir.y;

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) { endGame(); return; }
    if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) { endGame(); return; }
    if (obstaclesRef.current.some((o) => o.x === head.x && o.y === head.y)) { endGame(); return; }

    snake.unshift(head);
    let ateSomething = false, hitIndex = -1;
    for (let i = 0; i < foodsRef.current.length; i++) {
      const f = foodsRef.current[i];
      if (head.x === f.x && head.y === f.y) { ateSomething = true; hitIndex = i; break; }
    }

    if (ateSomething && hitIndex !== -1) {
      const food = foodsRef.current[hitIndex];
      if (food.isCorrect) {
        if (soundEnabled) playSound('correct');
        scoreRef.current += 20; setScore(scoreRef.current);
        triggerFeedback((lang === 'en' ? 'CORRECT!' : 'ĐÚNG!') + ' (+20đ)', '#22C55E');
        const newEaten = new Set(eatenWordsRef.current);
        newEaten.add(food.word);
        eatenWordsRef.current = newEaten; setEatenWords(new Set(newEaten));
        if (totalWordsRef.current > 0 && newEaten.size >= totalWordsRef.current) {
          snakeRef.current = snake; winGame(); return;
        }
        setupTargets(selectedCategoryRef.current);
      } else {
        if (soundEnabled) playSound('wrong');
        scoreRef.current = Math.max(0, scoreRef.current - 10); setScore(scoreRef.current);
        triggerFeedback((lang === 'en' ? 'WRONG!' : 'SAI!') + ' (-10đ)', '#DC143C');
        snake.pop();
        setupTargets(selectedCategoryRef.current);
      }
    } else { snake.pop(); }
    snakeRef.current = snake;
  };

  const endGame = () => {
    if (soundEnabled) playSound('gameover');
    setGameState('gameover');
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    addGameScore({
      id: `game-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      score: scoreRef.current,
      vocabularyCategory: selectedCategoryRef.current || selectedCategory,
      durationSeconds: durationRef.current,
      playedAt: new Date().toISOString(),
    });
  };

  const winGame = () => {
    if (soundEnabled) playSound('win');
    setGameState('win');
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    addGameScore({
      id: `game-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      score: scoreRef.current,
      vocabularyCategory: selectedCategoryRef.current || selectedCategory,
      durationSeconds: durationRef.current,
      playedAt: new Date().toISOString(),
    });
  };

  // Setup keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isEditing = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLSelectElement;
      if (isEditing) return;

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (gameStateRef.current === 'playing') {
          pauseGame();
        } else if (gameStateRef.current === 'paused') {
          resumeGame();
        } else if (gameStateRef.current === 'idle' || gameStateRef.current === 'gameover' || gameStateRef.current === 'win') {
          startGame();
        }
        return;
      }

      if (gameStateRef.current !== 'playing') return;

      const dirMap: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
      };

      if (dirMap[e.key]) {
        e.preventDefault();
        changeDirection(dirMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [difficulty]); // re-run only when difficulty (and thus tick speed) changes to update logic references if needed

  const eatenWordsRef = useRef<Set<string>>(new Set());
  eatenWordsRef.current = eatenWords;

  const handleVocabImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVocabError(null); setVocabSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const nameToUse = customCategoryName.trim() || `Chủ đề tự tạo ${selectedCategoryList.length + 1}`;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const words: VocabularyWord[] = [];
        const isCSV = file.name.endsWith('.csv');
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line || (i === 0 && line.toLowerCase().includes('english'))) continue;
          const sep = isCSV ? /[,;]/ : /[:-]/;
          const parts = line.split(sep);
          if (parts.length >= 2) {
            const eng = parts[0].trim().replace(/^["']|["']$/g, '');
            const vie = isCSV ? parts[1].trim().replace(/^["']|["']$/g, '') : parts.slice(1).join('-').trim();
            if (eng && vie) words.push({ english: eng, vietnamese: vie });
          }
        }
        if (words.length === 0) throw new Error("Không tìm thấy cặp từ vựng hợp lệ.");
        addVocabularyPack(nameToUse, words);
        setSelectedCategory(nameToUse);
        setupTargets(nameToUse);
        setVocabSuccess(`Đã thêm thành công ${words.length} từ vào chủ đề "${nameToUse}"!`);
        setCustomCategoryName('');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Lỗi bóc tách file từ vựng.';
        setVocabError(message);
      }
    };
    reader.readAsText(file);
  };

  const downloadVocabTemplate = () => downloadFile(
    "\uFEFFenglish,vietnamese\ncomputer,Máy tính\nscreen,Màn hình\ninternet,Mạng internet\nprogramming,Lập trình\nmouse,Con chuột máy tính",
    "mau_tu_vung_snake.csv", "text/csv;charset=utf-8;"
  );

  const totalWords = vocabularyPacks[selectedCategory]?.length ?? 0;
  const progressPct = totalWords > 0 ? Math.round((eatenWords.size / totalWords) * 100) : 0;

  const cardFrame = 'card-layered';

  const primaryBtn = cn(
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 shadow-sm cursor-pointer',
    isGreenTheme ? 'bg-[#224334] hover:bg-[#1A3327]' : 'bg-[#DC143C] hover:bg-[#c91236]',
  );

  const dirBtn = cn('flex items-center justify-center w-12 h-12 rounded-xl border transition-all active:scale-95 shadow-sm',
    isGreenTheme
      ? 'bg-[#F4FAF0] border-[#224334] text-[#224334] hover:bg-[#9CE5C1]/40'
      : 'bg-[#FFF5F7] border-[#DC143C] text-[#DC143C] hover:bg-[#DC143C]/10',
  );

  // Digital format score utility
  const formatScore = (num: number) => {
    return String(num).padStart(4, '0');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Game Dashboard Sub-Header */}
      <div className="flex flex-col gap-5 border-b border-[var(--border-default)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.22em]" style={{ color: tokens.accent }}>Game học tập</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
            Săn Từ Vựng
          </h2>
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Rèn phản xạ từ vựng và tích điểm thi đua sau mỗi lượt chơi.
          </p>
        </div>

        {/* Digital Stats area */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Score Counter */}
          <div className="flex min-w-[100px] flex-col border-l border-[var(--border-default)] px-4 py-1">
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)]">Điểm Số</span>
            <span className="text-2xl font-mono font-bold leading-none tracking-wider text-[var(--text-primary)]">
              {formatScore(score)}
            </span>
          </div>

          {/* High Score Pill */}
          <div className="flex min-w-[100px] flex-col border-l border-[var(--border-default)] px-4 py-1">
            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-500" /> Điểm Cao Nhất
            </span>
            <span className="text-2xl font-mono font-bold leading-none tracking-wider text-amber-600 dark:text-amber-500">
              {formatScore(categoryHighScore)}
            </span>
          </div>

          {/* Sound settings and Pause control toggles */}
          <div className="flex items-center gap-1.5 border-l pl-3 border-[var(--border-default)]">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              className={cn('p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer',
                soundEnabled
                  ? (isGreenTheme ? 'bg-[#224334]/10 border-[#224334]/30 text-[#224334]' : 'bg-[#DC143C]/10 border-[#DC143C]/30 text-[#DC143C]')
                  : 'bg-zinc-100 border-zinc-200 text-zinc-400'
              )}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {gameState === 'playing' && (
              <button
                onClick={pauseGame}
                className={cn('p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer',
                  isGreenTheme ? 'bg-[#224334] text-white border-transparent hover:bg-[#1A3327]' : 'bg-[#DC143C] text-white border-transparent hover:bg-[#c91236]'
                )}
              >
                <Pause className="w-4 h-4" />
              </button>
            )}

            {gameState === 'paused' && (
              <button
                onClick={resumeGame}
                className={cn('p-2.5 rounded-xl border transition-all active:scale-95 cursor-pointer',
                  isGreenTheme ? 'bg-[#224334] text-white border-transparent hover:bg-[#1A3327]' : 'bg-[#DC143C] text-white border-transparent hover:bg-[#c91236]'
                )}
              >
                <Play className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Column 1: Cột Trái (Main Stage) */}
        <div className="xl:col-span-8 space-y-4">
          {/* Target Word Card (Flashcard style) */}
          <div className={cn('rounded-2xl border p-5 text-center min-h-[96px] flex flex-col justify-center relative overflow-hidden transition-all duration-300',
            gameState === 'playing' && targetWord
              ? (isGreenTheme ? 'bg-[#224334] border-[#224334] text-white' : 'bg-[#1A1814] border-[#1A1814] text-white')
              : (isGreenTheme ? 'bg-[#FAF9F6] border-[#224334]/30' : 'bg-[#FFF9F6] border-[#DC143C]/25'),
          )}>
            {gameState === 'playing' && targetWord ? (
              <div className="space-y-1 animate-fade-in">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] opacity-70 flex items-center justify-center gap-1.5">
                  <Target className="w-3.5 h-3.5 animate-pulse text-amber-400" /> Săn từ tiếng Anh có nghĩa:
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-extrabold mt-0.5 tracking-wide text-amber-50">
                  {targetWord.vietnamese}
                </p>
              </div>
            ) : gameState === 'paused' ? (
              <div className="space-y-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-amber-500">TRẠNG THÁI</span>
                <p className="text-2xl font-serif font-bold text-[var(--text-primary)]">Đã Tạm Dừng</p>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-zinc-400">HỌC VIỆN THƯ THÁI</span>
                <p className="text-sm font-sans font-semibold text-[var(--text-muted)]">
                  {gameState === 'idle' ? 'Vui lòng chọn chủ đề từ vựng & bấm Bắt đầu để chơi' : 'Ván đấu đã kết thúc'}
                </p>
              </div>
            )}
          </div>

          {/* Canvas Wrapper Board */}
          <div className="relative w-full aspect-[15/10] max-w-[900px] mx-auto rounded-2xl border bg-white overflow-hidden transition-all duration-300"
            style={{
              borderColor: tokens.accent,
              boxShadow: '0 18px 42px rgba(26, 24, 20, 0.12)'
            }}
          >
            {/* The HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="block w-full h-full"
            />
            
            <SnakeCanvasRenderer
              canvasRef={canvasRef}
              gameState={gameState}
              snakeRef={snakeRef}
              prevSnakeRef={prevSnakeRef}
              directionRef={directionRef}
              foodsRef={foodsRef}
              obstaclesRef={obstaclesRef}
              lastTickTimeRef={lastTickTimeRef}
              tickInterval={tickInterval}
            />

            {/* Overlays inside the Board boundary */}
            <AnimatePresence>
              {/* IDLE SCREEN OVERLAY */}
              {gameState === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[var(--page-bg)]/96 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-md space-y-5 flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[var(--accent)]" style={{ backgroundColor: 'var(--card-bg)' }}>
                      <Gamepad2 className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)]">
                        Rắn Săn Từ Vựng
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-sans max-w-xs mx-auto leading-relaxed">
                        Hãy điều khiển chú rắn để săn các từ tiếng Anh chính xác tương ứng với nghĩa tiếng Việt hiển thị ở bảng điều khiển phía trên.
                      </p>
                    </div>

                    <button onClick={startGame} className={primaryBtn}>
                      <Play className="w-4 h-4 fill-current" /> {_t('start')} GAME
                    </button>

                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-sans">
                      <Keyboard className="w-3.5 h-3.5" />
                      <span>Sử dụng các phím mũi tên hoặc W, A, S, D để điều khiển</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* PAUSED OVERLAY */}
              {gameState === 'paused' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-[var(--card-bg)] border-2 rounded-2xl p-6 shadow-xl text-center space-y-4 max-w-xs flex flex-col items-center"
                    style={{ borderColor: tokens.accent }}
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                      <Pause className="w-6 h-6 fill-current animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-serif font-bold text-[var(--text-primary)]">
                        {_t('pausedTitle')}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] font-sans">
                        {_t('pausedDesc')}
                      </p>
                    </div>
                    <button onClick={resumeGame} className={primaryBtn}>
                      <Play className="w-3.5 h-3.5 fill-current" /> {_t('resume')}
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* GAME OVER OR VICTORY OVERLAY */}
              {(gameState === 'gameover' || gameState === 'win') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-30"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    className={cn('border-2 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-4 max-w-sm w-[90%] mx-auto flex flex-col items-center',
                      gameState === 'win'
                        ? (isDarkTheme ? 'bg-emerald-950/80 border-emerald-900 text-emerald-400' : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]')
                        : isDarkTheme
                          ? 'bg-red-950/80 border-red-900 text-red-400'
                          : isGreenTheme
                            ? 'bg-[#F4FAF0] border-[#224334]/30 text-[#224334]'
                            : 'bg-[#FFF5F7] border-[#DC143C]/20 text-[#DC143C]'
                    )}
                  >
                    <div className={cn('w-14 h-14 rounded-full flex items-center justify-center shadow-md',
                      gameState === 'win'
                        ? (isDarkTheme ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                        : isDarkTheme
                          ? 'bg-red-900/50 text-red-400'
                          : isGreenTheme
                            ? 'bg-[#224334]/10 text-[#224334]'
                            : 'bg-red-100 text-red-600'
                    )}>
                      {gameState === 'win' ? <Trophy className="w-7 h-7" /> : <Flame className="w-7 h-7" />}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xl sm:text-2xl font-serif font-bold">
                        {gameState === 'win' ? _t('win') : _t('gameOver')}
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans">
                        {gameState === 'win'
                          ? `Chúc mừng bạn đã hoàn thành xuất sắc tất cả ${totalWords} từ vựng!`
                          : `Rất tiếc, rắn đã va chạm. Bạn đã thu thập được ${eatenWords.size}/${totalWords} từ.`}
                      </p>
                    </div>

                    {/* Stats details grid */}
                    <div className={cn('grid grid-cols-2 gap-3 w-full p-3 rounded-xl border',
                      isDarkTheme ? 'bg-black/40 border-white/10 text-[var(--text-primary)]' : (isGreenTheme ? 'bg-[#FAF9F6]/80 border-[#224334]/10 text-[#224334]' : 'bg-white/65 border-zinc-200/50 text-[var(--text-primary)]')
                    )}>
                      <div className="text-center">
                        <span className="text-[10px] text-zinc-400 font-sans font-bold uppercase block">Điểm số</span>
                        <span className="text-lg font-mono font-bold">{score}đ</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-zinc-400 font-sans font-bold uppercase block">Thời gian</span>
                        <span className="text-lg font-mono font-bold">{durationRef.current} giây</span>
                      </div>
                    </div>

                    <button onClick={startGame} className={primaryBtn}>
                      {gameState === 'win' ? <Trophy className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                      {gameState === 'win' ? 'CHƠI TIẾP' : 'CHƠI LẠI'}
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress bar inside the main stage (Only when playing/paused) */}
          {(gameState === 'playing' || gameState === 'paused') && (
            <div className={cn('p-4 rounded-xl space-y-2', cardFrame)}>
              <div className="flex justify-between text-[10px] font-sans font-bold text-[var(--text-secondary)]">
                <span>TIẾN ĐỘ THU THẬP: {eatenWords.size}/{totalWords} từ vựng</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200/50 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: tokens.accent }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Mobile controllers d-pad */}
          {(gameState === 'playing' || gameState === 'paused') && (
            <div className={cn('rounded-2xl p-4 sm:hidden flex flex-col items-center gap-2', cardFrame)}>
              <span className="text-[10px] text-zinc-400 font-bold uppercase font-sans tracking-widest">Phím Điều Khiển Ảo</span>
              <div className="grid grid-cols-3 gap-2">
                <div />
                <button type="button" aria-label="Lên" onClick={() => changeDirection({ x: 0, y: -1 })} className={dirBtn}><ArrowUp className="w-5 h-5" /></button>
                <div />
                <button type="button" aria-label="Trái" onClick={() => changeDirection({ x: -1, y: 0 })} className={dirBtn}><ArrowLeft className="w-5 h-5" /></button>
                <button type="button" aria-label="Tạm dừng" onClick={gameState === 'playing' ? pauseGame : resumeGame} className={dirBtn}>
                  {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button type="button" aria-label="Phải" onClick={() => changeDirection({ x: 1, y: 0 })} className={dirBtn}><ArrowRight className="w-5 h-5" /></button>
                <div />
                <button type="button" aria-label="Xuống" onClick={() => changeDirection({ x: 0, y: 1 })} className={dirBtn}><ArrowDown className="w-5 h-5" /></button>
                <div />
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Cột Phải (Sidebar Panels) */}
        <div className="xl:col-span-4 space-y-4">
          {/* Category Pack Selector */}
          <div className={cn('p-5 rounded-2xl space-y-3.5', cardFrame)}>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: tokens.accent }} /> Chủ Đề Từ Vựng
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                Chọn gói từ vựng muốn rèn luyện
              </p>
            </div>
            
            <div className="relative">
              <select
                value={selectedCategory}
                disabled={gameState === 'playing' || gameState === 'paused'}
                onChange={(e) => { setSelectedCategory(e.target.value); setupTargets(e.target.value); }}
                className={cn('w-full text-xs px-3 py-3 rounded-xl border outline-none font-sans font-semibold transition-colors disabled:opacity-60 cursor-pointer shadow-inner',
                  isGreenTheme
                    ? 'bg-[#F4FAF0] border-[#224334]/30 text-[var(--text-primary)] focus:border-[#224334]'
                    : 'bg-white border-[#DC143C]/25 text-[var(--text-primary)] focus:border-[#DC143C]',)}
              >
                {selectedCategoryList.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className={cn('p-5 rounded-2xl space-y-3.5', cardFrame)}>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: tokens.accent }} /> Cấu Hình Tốc Độ
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                Thay đổi độ khó của trò chơi
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'normal', 'fast'] as const).map((diff) => {
                const isActive = difficulty === diff;
                const labels = { slow: 'Chậm', normal: 'Vừa', fast: 'Nhanh' };
                const colors = {
                  slow: isGreenTheme ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800' : 'border-emerald-500 bg-emerald-50/50 text-emerald-800',
                  normal: isGreenTheme ? 'border-amber-500 bg-amber-50/50 text-amber-800' : 'border-amber-500 bg-amber-50/50 text-amber-800',
                  fast: isGreenTheme ? 'border-red-500 bg-red-50/50 text-red-800' : 'border-red-500 bg-red-50/50 text-red-800',
                };
                
                return (
                  <button
                    key={diff}
                    type="button"
                    disabled={gameState === 'playing' || gameState === 'paused'}
                    onClick={() => setDifficulty(diff)}
                    className={cn(
                      'py-2 px-1 text-center rounded-xl border-2 font-sans text-xs font-bold transition-all disabled:opacity-50 cursor-pointer',
                      isActive
                        ? `${colors[diff]} scale-[1.02] shadow-sm`
                        : 'border-transparent bg-zinc-50 hover:bg-zinc-100 text-zinc-500'
                    )}
                  >
                    {labels[diff]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Eaten/Collected Words List */}
          <div className={cn('p-5 rounded-2xl space-y-3.5', cardFrame)}>
            <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Award className="w-4 h-4" style={{ color: tokens.accent }} /> Từ Đã Thu Thập
            </h4>
            
            {eatenWords.size === 0 ? (
              <div className="text-center py-6 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                <p className="text-xs text-[var(--text-muted)] font-sans px-2">
                  {_t('noWords')}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {Array.from(eatenWords).sort().map((w) => (
                  <span
                    key={w}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold border transition-all hover:scale-105 shadow-sm',
                      isGreenTheme ? 'bg-[#9CE5C1]/20 text-[#224334] border-[#224334]/20' : 'bg-[#DC143C]/8 text-[#DC143C] border-[#DC143C]/15',
                    )}
                  >
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rules & Instructions */}
          <div className={cn('p-5 rounded-2xl space-y-3.5', cardFrame)}>
            <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Info className="w-4 h-4" style={{ color: tokens.accent }} /> Hướng dẫn & Luật chơi
            </h4>

            <ul className="text-xs text-[var(--text-secondary)] font-sans space-y-3.5 leading-relaxed">
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{_t('guide1')}</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <span>{_t('guide2')}</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                <span>{_t('guide3')}</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{_t('guide4')}</span>
              </li>
            </ul>

            <div className="border-t pt-3 border-zinc-200/50 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-sans">
                <kbd className="px-1.5 py-0.5 border rounded bg-zinc-50 font-bold font-mono">Space</kbd>
                <span>Tạm dừng / Chơi tiếp</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-sans">
                <kbd className="px-1.5 py-0.5 border rounded bg-zinc-50 font-bold font-mono">Escape</kbd>
                <span>Tạm dừng / Thoát</span>
              </div>
            </div>
          </div>

          {/* Vocabulary Pack Import */}
          <div className={cn('p-5 rounded-2xl space-y-3.5', cardFrame)}>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <UploadCloud className="w-4 h-4" style={{ color: tokens.accent }} /> {_t('importTitle')}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                Thêm danh sách từ vựng riêng từ máy tính (.csv / .txt)
              </p>
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                placeholder={_t('importPlaceholder')}
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                disabled={gameState === 'playing' || gameState === 'paused'}
                className={cn('w-full text-xs px-3 py-2.5 rounded-xl border outline-none font-sans font-medium',
                  isGreenTheme ? 'bg-[#F4FAF0] border-[#224334]/25 focus:border-[#224334]' : 'bg-white border-[#DC143C]/20 focus:border-[#DC143C]',)}
              />
              
              <label className={cn('flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-sans font-bold uppercase tracking-wider cursor-pointer border transition-colors shadow-sm',
                gameState === 'playing' || gameState === 'paused' ? 'opacity-50 pointer-events-none' : '',
                isGreenTheme
                  ? 'border-[#224334]/30 text-[#224334] hover:bg-[#9CE5C1]/20'
                  : 'border-[#DC143C]/25 text-[#DC143C] hover:bg-[#DC143C]/5',)}>
                <UploadCloud className="w-3.5 h-3.5" /> {_t('importBtn')}
                <input type="file" accept=".csv,.txt" onChange={handleVocabImport} className="hidden" disabled={gameState === 'playing' || gameState === 'paused'} />
              </label>

              <button
                type="button"
                onClick={downloadVocabTemplate}
                className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-sans font-bold w-full transition-colors mt-1"
              >
                <Download className="w-3 h-3" /> {_t('downloadTemplate')}
              </button>

              {vocabError && <p className="text-[11px] text-red-600 font-sans font-semibold text-center">{vocabError}</p>}
              {vocabSuccess && <p className="text-[11px] text-emerald-600 font-sans font-semibold text-center">{vocabSuccess}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Instant visual scoring feedback overlay */}
      {feedback && (
        <div className="fixed top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className={cn('inline-flex items-center gap-3 px-5 py-3 rounded-2xl border-2 shadow-lg',
              feedback.color === '#22C55E'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-red-300 text-red-800')}
          >
            <span className="text-2xl font-bold font-mono">
              {feedback.color === '#22C55E' ? _t('plus20') : _t('minus10')}
            </span>
            <span className="text-sm font-serif font-extrabold">
              {feedback.text}
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
