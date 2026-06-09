'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useExamStore } from '../store/useExamStore';
import { VocabularyWord } from '../types';
import {
  Play, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  BookOpen, UploadCloud, Download, Target, Gamepad2, Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { getThemeTokens } from '@/lib/theme';
import { playSound } from '@/lib/snakeSound';
import { SnakeCanvasRenderer, FoodItem } from './snake/SnakeCanvas';
import { downloadFile } from '@/lib/download';

const GRID_SIZE = 25;
const COLS = 30;
const ROWS = 20;
const CANVAS_W = COLS * GRID_SIZE;
const CANVAS_H = ROWS * GRID_SIZE;
const TICK_INTERVAL = 220;
const NUM_OBSTACLES = 15;


const i18n = {
  vi: {
    correct: 'CHÍNH XÁC', wrong: 'SAI',
    plus20: '+20', minus10: '-10',
    gameOver: 'Game Over', win: 'Chiến thắng!',
    score: 'điểm', collected: 'Đã thu thập',
    words: 'từ vựng', noWords: 'Chưa có từ nào — bắt đầu chơi để thu thập!',
    hint: '↑↓←→ di chuyển · ăn đúng +20đ · tránh tường',
    hintDetail: 'Chi tiết', guideTitle: 'Hướng dẫn chơi',
    guide1: 'Ăn đúng từ → +20 điểm', guide2: 'Ăn sai → -10 điểm',
    guide3: 'Tránh tường, chướng ngại vật và đuôi rắn',
    guide4: 'Thu thập hết từ trong chủ đề để chiến thắng',
    importTitle: 'Import từ vựng', importPlaceholder: 'Tên chủ đề (tuù chọn)',
    importBtn: 'Chọn file (.csv / .txt)', downloadTemplate: 'Tải file mẫu',
    category: 'Chủ đề', score_: 'Điểm', time: 'Thời gian', sec: 'giây',
    start: 'BẮT ĐẦU', settings: 'Cài đặt',
  },
  en: {
    correct: 'CORRECT', wrong: 'WRONG',
    plus20: '+20', minus10: '-10',
    gameOver: 'Game Over', win: 'Victory!',
    score: 'pts', collected: 'Collected',
    words: 'words', noWords: 'No words yet — start playing to collect!',
    hint: '↑↓←→ move · eat correct +20 · avoid walls',
    hintDetail: 'Details', guideTitle: 'How to Play',
    guide1: 'Eat correct word → +20 points', guide2: 'Eat wrong → -10 points',
    guide3: 'Avoid walls, obstacles, and tail',
    guide4: 'Collect all words to win',
    importTitle: 'Import Vocabulary', importPlaceholder: 'Category name (optional)',
    importBtn: 'Choose file (.csv / .txt)', downloadTemplate: 'Download template',
    category: 'Category', score_: 'Score', time: 'Time', sec: 's',
    start: 'START', settings: 'Settings',
  }
};

export default function VocabularySnake() {
  const { vocabularyPacks, addGameScore, addVocabularyPack, currentUser, theme } = useExamStore();
  const tokens = getThemeTokens(theme);
  const isGreenTheme = theme === 'neon';
  const selectedCategoryList = Object.keys(vocabularyPacks);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'win'>('idle');
  const [score, setScore] = useState(0);
  const [targetWord, setTargetWord] = useState<VocabularyWord | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [eatenWords, setEatenWords] = useState<Set<string>>(new Set());
  const eatenWordsRef = useRef<Set<string>>(new Set());

  const [customCategoryName, setCustomCategoryName] = useState('');
  const [vocabError, setVocabError] = useState<string | null>(null);
  const [vocabSuccess, setVocabSuccess] = useState<string | null>(null);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const _t = useCallback((key: string): string => {
    try {
      return (i18n as any)[lang][key] || key;
    } catch { return key; }
  }, [lang]);

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

  vocabPacksRef.current = vocabularyPacks;

  useEffect(() => { selectedCategoryRef.current = selectedCategory; }, [selectedCategory]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isEditing = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLSelectElement;
      if (isEditing || gameState !== 'playing') return;
      const dirMap: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
      };
      if (dirMap[e.key]) { e.preventDefault(); changeDirection(dirMap[e.key]); }
      if (e.key === ' ' || e.key === 'Escape') { e.preventDefault(); endGame(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const changeDirection = (newDir: { x: number; y: number }) => {
    const currentDir = directionRef.current;
    if (newDir.x !== 0 && currentDir.x === -newDir.x) return;
    if (newDir.y !== 0 && currentDir.y === -newDir.y) return;
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
    playSound('start');
    if (typeof document !== 'undefined') (document.activeElement as HTMLElement)?.blur();

    snakeRef.current = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    prevSnakeRef.current = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    directionRef.current = { x: 0, y: -1 };
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
    gameIntervalRef.current = window.setInterval(gameTick, TICK_INTERVAL);
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
        playSound('correct');
        scoreRef.current += 20; setScore(scoreRef.current);
        triggerFeedback((lang === 'en' ? 'CORRECT!' : 'ĐÚNG!') + ' (+20đ)', '#22C55E'); if (true) { };
        const newEaten = new Set(eatenWordsRef.current);
        newEaten.add(food.word);
        eatenWordsRef.current = newEaten; setEatenWords(new Set(newEaten));
        if (totalWordsRef.current > 0 && newEaten.size >= totalWordsRef.current) {
          snakeRef.current = snake; winGame(); return;
        }
        setupTargets(selectedCategoryRef.current);
      } else {
        playSound('wrong');
        scoreRef.current = Math.max(0, scoreRef.current - 10); setScore(scoreRef.current);
        triggerFeedback((lang === 'en' ? 'WRONG!' : 'SAI!') + ' (-10đ)', '#DC143C');
        snake.pop();
        setupTargets(selectedCategoryRef.current);
      }
    } else { snake.pop(); }
    snakeRef.current = snake;
  };

  const endGame = () => {
    playSound('gameover');
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
    playSound('win');
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
        if (words.length === 0) throw new Error("Không tìm thấy cặp _t('words') hợp lệ.");
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
    'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-serif font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0',
    isGreenTheme ? 'bg-[#224334] hover:bg-[#1A3327]' : 'bg-[#DC143C] hover:bg-[#c91236]',
  );

  const dirBtn = cn('flex items-center justify-center w-12 h-12 rounded-xl border transition-all active:scale-95',
    isGreenTheme
      ? 'bg-[#F4FAF0] border-[#224334] text-[#224334] hover:bg-[#9CE5C1]/40'
      : 'bg-[#FFF5F7] border-[#DC143C] text-[#DC143C] hover:bg-[#DC143C]/10',);

  const renderPlayButton = () => {
    if (gameState === 'idle') {
      return (
        <button onClick={startGame} className={primaryBtn}>
          <Play className="w-4 h-4" /> Bắt đầu
        </button>
      );
    }
    if (gameState === 'gameover') {
      return (
        <button onClick={startGame} className={cn(primaryBtn, 'bg-[#1A1814] hover:bg-neutral-800')}>
          <RotateCcw className="w-4 h-4" /> Chơi lại
        </button>
      );
    }
    if (gameState === 'win') {
      return (
        <button onClick={startGame} className={primaryBtn}>
          <Trophy className="w-4 h-4" /> Chơi tiếp
        </button>
      );
    }
    return (
      <span className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-serif font-bold uppercase tracking-wider',
        isGreenTheme ? 'bg-[#9CE5C1]/30 text-[#224334]' : 'bg-[#DC143C]/10 text-[#DC143C]',
      )}>
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" /> Đang chơi
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="text-center space-y-2">
        <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase" style={{ color: tokens.accent }}>
          Mini Game
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
          Săn Từ Vựng
        </h2>
        <p className="text-sm text-[var(--text-secondary)] font-sans max-w-xl mx-auto leading-relaxed">
          Điều khiển rắn ăn đúng từ tiếng Anh theo nghĩa tiếng Việt. _t('collected') hết từ trong chủ đề để thắng.
        </p>
      </header>

      {/* Thanh điều khiển chính */}
      <div className={cn('rounded-2xl p-4 sm:p-5', cardFrame)}>
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <label className="text-[10px] font-serif font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Chủ đề từ vựng
            </label>
            <select
              value={selectedCategory}
              disabled={gameState === 'playing'}
              onChange={(e) => { setSelectedCategory(e.target.value); setupTargets(e.target.value); }}
              className={cn('w-full text-sm px-3 py-2.5 rounded-xl border outline-none font-sans transition-colors disabled:opacity-60',
                isGreenTheme
                  ? 'bg-[#F4FAF0] border-[#224334]/30 text-[#1A1814] focus:border-[#224334]'
                  : 'bg-white border-[#DC143C]/25 text-[#1A1814] focus:border-[#DC143C]',)}
            >
              {selectedCategoryList.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className={cn('flex items-center gap-3 px-4 py-2.5 rounded-xl border min-w-[120px]',
              isGreenTheme ? 'bg-[#F4FAF0] border-[#224334]/20' : 'bg-white border-[#DC143C]/15',)}>
              <div>
                <p className="text-[9px] font-serif font-bold uppercase tracking-wider text-[var(--text-muted)]">Điểm</p>
                <p className="text-2xl font-serif font-bold leading-none" style={{ color: tokens.accent }}>{score}</p>
              </div>
              {gameState !== 'idle' && (
                <div className="border-l pl-3" style={{ borderColor: isGreenTheme ? '#22433420' : '#DC143C20' }}>
                  <p className="text-[9px] font-serif font-bold uppercase tracking-wider text-[var(--text-muted)]">Tiến độ</p>
                  <p className="text-sm font-mono font-bold text-[var(--text-primary)]">{eatenWords.size}/{totalWords}</p>
                </div>
              )}
            </div>
            {renderPlayButton()}
          </div>
        </div>

        {gameState !== 'idle' && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-sans text-[var(--text-muted)] mb-1.5">
              <span>{eatenWords.size} từ đã thu thập</span>
              <span>{progressPct}% hoàn thành</span>
            </div>
            <div className={cn('h-2 rounded-full overflow-hidden', isGreenTheme ? 'bg-[#224334]/10' : 'bg-[#DC143C]/10')}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: tokens.accent }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Khu vực game — ưu tiên trung tâm */}
        <div className="xl:col-span-8 space-y-4 order-1">
          {/* Từ mục tiêu */}
          <div className={cn('rounded-2xl border px-5 py-4 text-center min-h-[88px] flex flex-col justify-center',
            gameState === 'playing' && targetWord
              ? (isGreenTheme ? 'bg-[#224334] border-[#9CE5C1] text-white' : 'bg-[#1A1814] border-[#DC143C] text-white')
              : (isGreenTheme ? 'bg-[#F4FAF0] border-[#224334]/30' : 'bg-[#FFF5F7] border-[#DC143C]/25'),
          )}>
            {gameState === 'playing' && targetWord ? (
              <>
                <span className="text-[10px] font-serif font-bold uppercase tracking-[0.25em] opacity-70 flex items-center justify-center gap-1.5">
                  <Target className="w-3 h-3" /> Tìm từ tiếng Anh cho
                </span>
                <p className="text-2xl sm:text-3xl font-serif font-bold mt-1">{targetWord.vietnamese}</p>
              </>
            ) : (
              <p className="text-sm font-sans text-[var(--text-muted)]">
                {gameState === 'idle' ? 'Chọn chủ đề và nhấn Bắt đầu để chơi' : 'Ván đấu đã kết thúc'}
              </p>
            )}
          </div>

          {/* Canvas */}
          <div className="card-layered overflow-hidden mx-auto w-fit">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="block max-w-full h-auto"
              style={{ width: '100%', maxWidth: CANVAS_W }}
            />
          </div>
          <SnakeCanvasRenderer
            canvasRef={canvasRef}
            gameState={gameState}
            snakeRef={snakeRef}
            prevSnakeRef={prevSnakeRef}
            directionRef={directionRef}
            foodsRef={foodsRef}
            obstaclesRef={obstaclesRef}
            lastTickTimeRef={lastTickTimeRef}
          />

          {/* Điều khiển */}
          <div className={cn('rounded-2xl p-4', cardFrame)}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] font-sans text-[var(--text-secondary)]">
                <Keyboard className="w-4 h-4 shrink-0" style={{ color: tokens.accent }} />
                <div className="flex flex-wrap items-center gap-1.5">
                  {[ArrowUp, ArrowDown, ArrowLeft, ArrowRight].map((Icon, i) => (
                    <kbd key={i} className={cn('px-1.5 py-1 rounded-md border', isGreenTheme ? 'bg-[#F4FAF0] border-[#224334]/25' : 'bg-white border-[#DC143C]/20')}>
                      <Icon className="w-3 h-3" />
                    </kbd>
                  ))}
                  <span className="text-[var(--text-muted)] mx-0.5">hoặc</span>
                  <kbd className={cn('px-2 py-1 rounded-md border font-semibold', isGreenTheme ? 'bg-[#F4FAF0] border-[#224334]/25' : 'bg-white border-[#DC143C]/20')}>W A S D</kbd>
                </div>
              </div>

              {gameState === 'playing' && (
                <div className="grid grid-cols-3 gap-1.5 sm:hidden">
                  <div />
                  <button type="button" aria-label="Lên" onClick={() => changeDirection({ x: 0, y: -1 })} className={dirBtn}><ArrowUp className="w-5 h-5" /></button>
                  <div />
                  <button type="button" aria-label="Trái" onClick={() => changeDirection({ x: -1, y: 0 })} className={dirBtn}><ArrowLeft className="w-5 h-5" /></button>
                  <button type="button" aria-label="Xuống" onClick={() => changeDirection({ x: 0, y: 1 })} className={dirBtn}><ArrowDown className="w-5 h-5" /></button>
                  <button type="button" aria-label="Phải" onClick={() => changeDirection({ x: 1, y: 0 })} className={dirBtn}><ArrowRight className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          </div>

          <details className={cn('rounded-2xl overflow-hidden group', cardFrame)}>
            <summary className="px-5 py-4 cursor-pointer list-none flex items-center justify-between text-[11px] font-serif font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              <span className="flex items-center gap-2"><Gamepad2 className="w-3.5 h-3.5" /> {_t('guideTitle')}</span>
              <span className="text-[var(--text-muted)] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <ul className="px-5 pb-5 text-xs text-[var(--text-secondary)] font-sans space-y-2 leading-relaxed border-t border-[var(--border-default)] pt-4">
              <li>{_t('guide1')}</li>
              <li>{_t('guide2')}</li>
              <li>{_t('guide3')}</li>
              <li>{_t('guide4')}</li>
            </ul>
          </details>
        </div>

        {/* Panel phụ */}
        <div className="xl:col-span-4 space-y-4 order-2">
          {(gameState === 'gameover' || gameState === 'win') && (
            <div className={cn('rounded-2xl border p-6 text-center space-y-3 animate-fade-in',
              gameState === 'win'
                ? 'bg-[var(--win-bg)] border-[var(--win-border)]'
                : 'bg-[var(--gameover-bg)] border-[var(--gameover-border)]',
            )}>
              <Trophy className={cn('w-10 h-10 mx-auto', gameState === 'win' ? 'text-[var(--success)]' : 'text-[var(--danger)]')} />
              <h4 className={cn('font-serif font-bold text-xl', gameState === 'win' ? 'text-[var(--win-text)]' : 'text-[var(--gameover-text)]')}>
                {gameState === 'win' ? _t('win') : _t('gameOver')}
              </h4>
              <p className="text-xs font-sans text-[var(--text-secondary)]">
                {gameState === 'win'
                  ? <>_t('collected') + ' tất cả' <strong>{totalWords}</strong> _t('words') + '!'</>
                  : <>Thu thập <strong>{eatenWords.size}/{totalWords}</strong> từ vựng</>}
              </p>
              <p className="text-3xl font-serif font-bold" style={{ color: tokens.accent }}>{score} điểm</p>
            </div>
          )}

          <div className={cn('rounded-2xl p-5', cardFrame)}>
            <h4 className="text-[11px] font-serif font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <Trophy className="w-3.5 h-3.5" style={{ color: tokens.accent }} /> Từ đã thu thập
            </h4>
            {eatenWords.size === 0 ? (
              <p className="text-xs text-[var(--text-muted)] font-sans">{_t('noWords')}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {Array.from(eatenWords).sort().map((w) => (
                  <span
                    key={w}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-serif font-semibold border',
                      isGreenTheme ? 'bg-[#9CE5C1]/25 text-[#224334] border-[#224334]/20' : 'bg-[#DC143C]/8 text-[#DC143C] border-[#DC143C]/15',
                    )}
                  >
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          <details className={cn('rounded-2xl overflow-hidden group', cardFrame)}>
            <summary className="px-5 py-4 cursor-pointer list-none flex items-center justify-between text-[11px] font-serif font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              <span className="flex items-center gap-2"><UploadCloud className="w-3.5 h-3.5" /> {_t('importTitle')}</span>
              <span className="text-[var(--text-muted)] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-5 pb-5 space-y-3 border-t border-[var(--border-default)] pt-4">
              <input
                type="text"
                placeholder={_t('importPlaceholder')}
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                className={cn('w-full text-xs px-3 py-2.5 rounded-xl border outline-none',
                  isGreenTheme ? 'bg-[#F4FAF0] border-[#224334]/25' : 'bg-white border-[#DC143C]/20',)}
              />
              <label className={cn('flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-serif font-bold uppercase tracking-wider cursor-pointer border transition-colors',
                isGreenTheme
                  ? 'border-[#224334]/30 text-[#224334] hover:bg-[#9CE5C1]/20'
                  : 'border-[#DC143C]/25 text-[#DC143C] hover:bg-[#DC143C]/5',)}>
                <UploadCloud className="w-3.5 h-3.5" /> {_t('importBtn')}
                <input type="file" accept=".csv,.txt" onChange={handleVocabImport} className="hidden" />
              </label>
              <button type="button" onClick={downloadVocabTemplate} className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-sans w-full transition-colors">
                <Download className="w-3 h-3" /> {_t('downloadTemplate')}
              </button>
              {vocabError && <p className="text-[11px] text-[var(--danger)] font-sans">{vocabError}</p>}
              {vocabSuccess && <p className="text-[11px] text-[var(--success)] font-sans">{vocabSuccess}</p>}
            </div>
          </details>
        </div>
      </div>

      {feedback && (
        <div className="fixed top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className={cn('inline-flex items-center gap-3 px-5 py-3 rounded-2xl border',
              feedback.color === '#22C55E'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200')}
          >
            <span className={cn(
              'text-2xl font-bold font-sans',
              feedback.color === '#22C55E' ? 'text-emerald-600' : 'text-red-500'
            )}>
              {feedback.color === '#22C55E' ? _t('plus20') : _t('minus10')}
            </span>
            <span className={cn(
              'text-sm font-serif font-semibold',
              feedback.color === '#22C55E' ? 'text-emerald-700' : 'text-red-600'
            )}>
              {feedback.text}
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
