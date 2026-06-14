import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exam, ExamAttempt, GameScore, VocabularyWord } from '../types';
import { initialExams } from '../data/initialExams';
import { initialVocabularyPacks } from '../data/initialVocabularyPacks';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  avatar?: string;
  bio?: string;
  phone?: string;
}

export { computeStreak } from '@/lib/leaderboard';

interface ExamStore {
  // Theme state
  theme: 'cozy' | 'neon' | 'dark';
  setTheme: (theme: 'cozy' | 'neon' | 'dark') => void;

  // Auth
  currentUser: AuthUser | null;
  activityDates: string[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  recordActivity: () => void;
  updateProfile: (data: Partial<Pick<AuthUser, 'name' | 'bio' | 'phone'>>) => Promise<{ success: boolean; error?: string }>;

  // Exams database
  exams: Exam[];
  vocabularyPacks: Record<string, VocabularyWord[]>;
  attempts: ExamAttempt[];
  gameScores: GameScore[];

  // Active exam session
  activeExamId: string | null;
  activeAnswers: Record<string, string>; // questionId -> chosen answerId
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  isExamActive: boolean;
  isExamSubmitted: boolean;

  // Exam settings
  examMode: 'exam' | 'practice';
  setExamMode: (mode: 'exam' | 'practice') => void;
  autoAdvance: boolean;
  setAutoAdvance: (val: boolean) => void;
  showExplanation: boolean;
  setShowExplanation: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  shuffleQuestions: boolean;
  setShuffleQuestions: (val: boolean) => void;
  shuffleAnswers: boolean;
  setShuffleAnswers: (val: boolean) => void;
  timerMode: 'timed' | 'unlimited';
  setTimerMode: (mode: 'timed' | 'unlimited') => void;
  shuffledExam: Exam | null;
  isExamsFetched: boolean;

  // Actions
  fetchCloudExams: () => Promise<void>;
  addExam: (exam: Exam) => void;
  startExam: (examId: string) => void;
  selectAnswer: (questionId: string, answerId: string) => void;
  setCurrentQuestionIndex: (index: number) => void;
  decrementTime: () => void;
  submitExam: (userId?: string) => void;
  resetExamSession: () => void;
  addGameScore: (score: GameScore) => void;
  addMockAttempt: (attempt: ExamAttempt) => void;
  deleteExam: (examId: string) => void;
  addVocabularyPack: (categoryName: string, words: VocabularyWord[]) => void;
  syncOfflineData: () => Promise<void>;
}

const initialAttempts: ExamAttempt[] = [];
const initialGameScores: GameScore[] = [];

async function executeAuth(
  url: string,
  body: Record<string, string>,
  buildUser: (data: any) => Omit<AuthUser, 'id'>,
  buildFallback: () => Omit<AuthUser, 'id'>,
  set: any,
  get: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        set({ currentUser: { id: data.user.id || `user-${Date.now()}`, ...buildUser(data) } });
        get().recordActivity();
        return { success: true };
      }
      if (data.error) return { success: false, error: data.error };
    }
  } catch (_) {}

  const user: AuthUser = { id: `user-${Date.now()}`, ...buildFallback() };
  set({ currentUser: user });
  get().recordActivity();
  return { success: true };
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      theme: 'cozy',
      setTheme: (theme) => set({ theme }),

      // Auth
      currentUser: null,
      activityDates: [],

      login: async (email, password) => {
        return executeAuth('/api/auth/login', { email, password }, 
          (data) => ({ ...data.user, role: data.user.role === 'ADMIN' ? 'ADMIN' : 'STUDENT' }),
          () => ({
            name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            email, role: 'STUDENT' as const
          }),
          set, get
        );
      },

      signup: async (name, email, password) => {
        return executeAuth('/api/auth/signup', { name, email, password },
          (data) => ({ ...data.user, role: 'STUDENT' }),
          () => ({ name, email, role: 'STUDENT' as const }),
          set, get
        );
      },

      logout: () => set({ currentUser: null }),

      recordActivity: () => {
        const today = new Date().toISOString();
        set((state) => ({ activityDates: [...state.activityDates, today] }));
      },

      updateProfile: async (data) => {
        const user = get().currentUser;
        if (!user) return { success: false, error: 'Chưa đăng nhập.' };
        try {
          const res = await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, ...data })
          });
          if (res.ok) {
            const result = await res.json();
            if (result.success) { set({ currentUser: { ...user, ...data } }); return { success: true }; }
          }
        } catch (_) {}
        set({ currentUser: { ...user, ...data } });
        return { success: true };
      },

      isExamsFetched: false,
      exams: initialExams,
      vocabularyPacks: initialVocabularyPacks,
      attempts: initialAttempts,
      gameScores: initialGameScores,

      examMode: 'exam',
      setExamMode: (mode) => set({ examMode: mode }),
      autoAdvance: false,
      setAutoAdvance: (val) => set({ autoAdvance: val }),
      showExplanation: true,
      setShowExplanation: (val) => set({ showExplanation: val }),
      soundEnabled: false,
      setSoundEnabled: (val) => set({ soundEnabled: val }),
      shuffleQuestions: false,
      setShuffleQuestions: (val) => set({ shuffleQuestions: val }),
      shuffleAnswers: false,
      setShuffleAnswers: (val) => set({ shuffleAnswers: val }),
      timerMode: 'timed',
      setTimerMode: (mode) => set({ timerMode: mode }),
      shuffledExam: null,

      // Initial active session state
      activeExamId: null,
      activeAnswers: {},
      currentQuestionIndex: 0,
      timeRemaining: 0,
      isExamActive: false,
      isExamSubmitted: false,

      fetchCloudExams: async () => {
        if (get().isExamsFetched) return;
        try {
          const res = await fetch('/api/exam/list');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.exams) {
              const currentExams = get().exams;
              const newExams = [...data.exams];
              currentExams.forEach(ce => {
                if (!newExams.find((ne: Exam) => ne.id === ce.id)) {
                  newExams.push(ce);
                }
              });
              set({ exams: newExams, isExamsFetched: true });
            }
          }
        } catch (err) {
          console.warn('Fetch cloud exams error:', err);
        }
      },

      addExam: (exam: Exam) => {
        set((state) => ({
          exams: [exam, ...state.exams]
        }));

        // Push exam to server for Neon persistence
        fetch('/api/exam/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exam })
        }).catch((err) => {
          console.warn('Exam server sync error:', err);
        });
      },

      startExam: (examId: string) => {
        const exam = get().exams.find((e) => e.id === examId);
        if (!exam) return;

        const { shuffleQuestions, shuffleAnswers, timerMode } = get();

        // Deep copy to avoid mutating original
        let processedExam: Exam = JSON.parse(JSON.stringify(exam));

        // Fisher-Yates shuffle helper
        const shuffleArray = (array: any[]) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
        };

        if (shuffleQuestions) {
          shuffleArray(processedExam.questions);
        }

        if (shuffleAnswers) {
          processedExam.questions.forEach((q) => {
            shuffleArray(q.answers);
          });
        }

        const initialTime = timerMode === 'unlimited' ? -1 : exam.duration * 60;

        set({
          activeExamId: examId,
          shuffledExam: processedExam,
          activeAnswers: {},
          currentQuestionIndex: 0,
          timeRemaining: initialTime,
          isExamActive: true,
          isExamSubmitted: false
        });
      },

      selectAnswer: (questionId: string, answerId: string) => {
        set((state) => ({
          activeAnswers: {
            ...state.activeAnswers,
            [questionId]: answerId
          }
        }));
      },

      setCurrentQuestionIndex: (index: number) => {
        set({ currentQuestionIndex: index });
      },

      decrementTime: () => {
        const current = get().timeRemaining;
        if (current === -1) return; // Unlimited time
        if (current <= 1) {
          set({ timeRemaining: 0 });
          get().submitExam();
        } else {
          set({ timeRemaining: current - 1 });
        }
      },

      submitExam: (userId?: string) => {
        const resolvedUserId = get().currentUser?.id || userId || 'guest';
        const { activeExamId, activeAnswers, shuffledExam, timeRemaining } = get();
        if (!activeExamId || !shuffledExam) return;

        const exam = shuffledExam;

        // Calculate score
        let totalPoints = 0;
        let gainedPoints = 0;

        exam.questions.forEach((q) => {
          totalPoints += q.points;
          const chosenAnswerId = activeAnswers[q.id];
          const correctAnswer = q.answers.find((a) => a.isCorrect);
          if (chosenAnswerId && correctAnswer && chosenAnswerId === correctAnswer.id) {
            gainedPoints += q.points;
          }
        });

        const calculatedScore = totalPoints > 0 ? (gainedPoints / totalPoints) * 10 : 0;
        const normalizedScore = parseFloat(calculatedScore.toFixed(2));
        
        const timeSpent = timeRemaining === -1 ? 0 : exam.duration * 60 - timeRemaining;

        const newAttempt: ExamAttempt = {
          id: `att-${Date.now()}`,
          userId: resolvedUserId,
          examId: activeExamId,
          score: normalizedScore,
          durationSec: timeSpent,
          answers: activeAnswers,
          startedAt: new Date(Date.now() - timeSpent * 1000).toISOString(),
          endedAt: new Date().toISOString()
        };

        set((state) => ({
          attempts: [newAttempt, ...state.attempts],
          isExamActive: false,
          isExamSubmitted: true
        }));

        // Record activity date for streak
        get().recordActivity();

        // Send results to our express server asynchronously for cloud persist
        fetch('/api/exam/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAttempt)
        }).then((res) => {
          if (res.ok) {
            res.json().then((data) => {
              if (data.success) {
                set((state) => ({
                  attempts: state.attempts.map((a) =>
                    a.id === newAttempt.id ? { ...a, synced: true } : a
                  )
                }));
              }
            });
          }
        }).catch((err) => {
          console.warn('Prisma DB sync error:', err);
        });

        // Also save structured result for leaderboard
        const correctAnswers = exam.questions.filter(q => {
          const chosenId = activeAnswers[q.id];
          const correctOpt = q.answers.find(a => a.isCorrect);
          return chosenId && correctOpt && chosenId === correctOpt.id;
        }).length;
        const wrongAnswers = exam.questions.length - correctAnswers;

        fetch('/api/exam/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: resolvedUserId,
            examId: activeExamId,
            examTitle: exam.title,
            score: normalizedScore,
            correctAnswers,
            wrongAnswers,
            timeSpent: timeSpent,
          })
        }).catch((err) => {
          console.warn('Leaderboard save error:', err);
        });
      },

      resetExamSession: () => {
        set({
          activeExamId: null,
          shuffledExam: null,
          activeAnswers: {},
          currentQuestionIndex: 0,
          timeRemaining: 0,
          isExamActive: false,
          isExamSubmitted: false
        });
      },

      addGameScore: (score: GameScore) => {
        set((state) => ({
          gameScores: [score, ...state.gameScores]
        }));

        // Record activity date for streak
        get().recordActivity();

        // Send score to postgresql server asynchronously 
        fetch('/api/game/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(score)
        }).then((res) => {
          if (res.ok) {
            res.json().then((data) => {
              if (data.success) {
                set((state) => ({
                  gameScores: state.gameScores.map((s) =>
                    s.id === score.id ? { ...s, synced: true } : s
                  )
                }));
              }
            });
          }
        }).catch((err) => {
          console.warn('Prisma DB sync warning:', err);
        });
      },

      addMockAttempt: (attempt: ExamAttempt) => {
        set((state) => ({
          attempts: [attempt, ...state.attempts]
        }));
      },

      deleteExam: (examId: string) => {
        set((state) => ({
          exams: state.exams.filter((e) => e.id !== examId)
        }));
      },

      addVocabularyPack: (categoryName: string, words: VocabularyWord[]) => {
        set((state) => ({
          vocabularyPacks: {
            ...state.vocabularyPacks,
            [categoryName]: words
          }
        }));
      },

      syncOfflineData: async () => {
        const { attempts, gameScores } = get();
        
        // 1. Sync attempts
        for (const att of attempts) {
          if (!att.synced) {
            try {
              const res = await fetch('/api/exam/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(att)
              });
              if (res.ok) {
                const data = await res.json();
                if (data.success) {
                  set((state) => ({
                    attempts: state.attempts.map((a) =>
                      a.id === att.id ? { ...a, synced: true } : a
                    )
                  }));
                }
              }
            } catch (err) {
              console.warn(`Sync attempt ${att.id} error:`, err);
            }
          }
        }

        // 2. Sync game scores
        for (const score of gameScores) {
          if (!score.synced) {
            try {
              const res = await fetch('/api/game/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(score)
              });
              if (res.ok) {
                const data = await res.json();
                if (data.success) {
                  set((state) => ({
                    gameScores: state.gameScores.map((s) =>
                      s.id === score.id ? { ...s, synced: true } : s
                    )
                  }));
                }
              }
            } catch (err) {
              console.warn(`Sync game score ${score.id} error:`, err);
            }
          }
        }
      }
    }),
    {
      name: 'crimson-chalk-exam-store',
      storage: {
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const userId = localStorage.getItem(`${name}-current-user-id`) || 'guest';
          const data = localStorage.getItem(`${name}-${userId}`);
          return data ? JSON.parse(data) : null;
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          const state = value?.state;
          const userId = state?.currentUser?.id || 'guest';
          localStorage.setItem(`${name}-current-user-id`, userId);
          localStorage.setItem(`${name}-${userId}`, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          const userId = localStorage.getItem(`${name}-current-user-id`) || 'guest';
          localStorage.removeItem(`${name}-${userId}`);
        }
      },
      partialize: (state) => ({
        theme: state.theme,
        currentUser: state.currentUser,
        activityDates: state.activityDates,
        exams: state.exams,
        vocabularyPacks: state.vocabularyPacks,
        attempts: state.attempts,
        gameScores: state.gameScores,
        examMode: state.examMode,
        autoAdvance: state.autoAdvance,
        showExplanation: state.showExplanation,
        soundEnabled: state.soundEnabled,
        shuffleQuestions: state.shuffleQuestions,
        shuffleAnswers: state.shuffleAnswers,
        timerMode: state.timerMode,
        shuffledExam: state.shuffledExam,
        activeExamId: state.activeExamId,
        activeAnswers: state.activeAnswers,
        currentQuestionIndex: state.currentQuestionIndex,
        timeRemaining: state.timeRemaining,
        isExamActive: state.isExamActive,
        isExamSubmitted: state.isExamSubmitted
      }) as any
    }
  )
);
