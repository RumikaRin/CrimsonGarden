'use client';

import React from 'react';
import { useExamStore } from '../store/useExamStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Users, Library, Trophy, GraduationCap, Trash2, Calendar,
  Clock, BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useIsGreen } from '../lib/useThemeTokens';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminStatsDashboard() {
  const { exams, attempts, gameScores, deleteExam, theme } = useExamStore();
  const isGreenTheme = useIsGreen();
  const isDark = theme === 'dark';
  const accent = 'var(--accent)';
  const accentLight = 'var(--accent-light)';
  const chartText = isDark ? '#A3A3A3' : '#57534E';
  const chartGrid = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const chartSurface = isDark ? '#111111' : '#FAF9F6';

  // 1. Metric Calculations from real data
  const totalQuizzes = exams.length;
  const totalAttempts = attempts.length;
  const totalGames = gameScores.length;

  // Unique students from attempts + gameScores
  const uniqueStudentIds = new Set([
    ...attempts.map(a => a.userId),
    ...gameScores.map(g => g.userId)
  ]);
  const totalStudents = uniqueStudentIds.size || 0;

  // High scores calculation
  const highestScore = attempts.length > 0
    ? Math.max(...attempts.map(a => a.score)) * 10
    : 0;

  // Game high scores logic
  const highestSnake = gameScores.length > 0
    ? Math.max(...gameScores.map(g => g.score))
    : 0;

  // Class score average
  const avgTestScore = attempts.length > 0
    ? Math.round((attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) * 10)
    : 0;

  // Total questions across all exams
  const totalQuestions = exams.reduce((sum, e) => sum + e.questions.length, 0);

  // Helper helper to infer categories dynamically
  const getExamCategory = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes('anh') || t.includes('english') || t.includes('thpt')) return 'Tiếng Anh';
    if (t.includes('nextauth') || t.includes('database') || t.includes('prism') || t.includes('css') || t.includes('tin') || t.includes('html') || t.includes('excel')) return 'CNTT';
    return 'Tổng hợp';
  };

  // 2. Chart Config 1: Line Chart (Exam Attempts & Scores trend mapped to 100%)
  const lineChartData = {
    labels: attempts.map((_, i) => `Lượt ${i + 1}`).slice(-8),
    datasets: [
      {
        label: 'Điểm Số Bài Thi (%)',
        data: attempts.map(a => a.score * 10).slice(-8),
        borderColor: accent,
        backgroundColor: `${accent}14`,
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: accent,
        pointHoverRadius: 8,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#F5F5F5' : '#1A1814',
        titleColor: isDark ? '#0A0A0A' : '#F5F5F5',
        bodyColor: isDark ? '#262626' : '#F5F5F5',
        titleFont: { family: 'serif', size: 12 },
        bodyFont: { family: 'sans-serif', size: 12 },
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: chartGrid,
        },
        ticks: {
          color: chartText,
          font: { family: 'monospace', size: 10 }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: chartText,
          font: { family: 'sans-serif', size: 10 }
        }
      }
    }
  };

  // 3. Chart Config 2: Bar Chart (Vocab Highscores by Category)
  const categories = Array.from(new Set(gameScores.map(g => g.vocabularyCategory)));
  const highestCategoryScores = categories.map(cat => {
    const scores = gameScores.filter(g => g.vocabularyCategory === cat).map(g => g.score);
    return scores.length > 0 ? Math.max(...scores) : 0;
  });

  const barChartData = {
    labels: categories.length > 0 ? categories : ['Tiếng Anh B1', 'CNTT', 'THPT Quốc Gia'],
    datasets: [
      {
        label: 'Kỷ Lục Điểm Rắn Săn Mồi',
        data: highestCategoryScores.length > 0 ? highestCategoryScores : [120, 180, 140],
        backgroundColor: 'var(--accent)',
        hoverBackgroundColor: accent,
        borderRadius: 8,
        borderWidth: 0,
        barThickness: 24,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
    },
    scales: {
      y: {
        min: 0,
        grid: {
          color: chartGrid,
        },
        ticks: {
          color: chartText,
          font: { family: 'monospace', size: 10 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: chartText,
          font: { family: 'sans-serif', size: 11 }
        }
      }
    }
  };

  // 4. Chart Config 3: Doughnut (Exams breakdown)
  const categoriesInDb = Array.from(new Set(exams.map(e => getExamCategory(e.title))));
  const categoryCounts = categoriesInDb.map(cat => exams.filter(e => getExamCategory(e.title) === cat).length);

  const doughnutData = {
    labels: categoriesInDb.length > 0 ? categoriesInDb : ['Tổng hợp'],
    datasets: [
      {
        data: categoryCounts.length > 0 ? categoryCounts : [1],
        backgroundColor: isGreenTheme
          ? ['#224334', '#9ce5c1', '#79ab8e', '#e2f2d5'].slice(0, categoriesInDb.length || 1)
          : ['#DC143C', '#1A1814', '#F2EFE7', '#E2E8F0'].slice(0, categoriesInDb.length || 1),
        borderWidth: 2,
        borderColor: chartSurface,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: chartText,
          font: { family: 'sans-serif', size: 11 }
        }
      }
    }
  };

  return (
    <div className="card-layered p-3 space-y-5 sm:p-6 sm:space-y-8">
      {/* Introduction Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-sans font-bold tracking-widest uppercase block mb-1" style={{ color: accent }}>
            QUẢN TRỊ VIÊN ĐÀO TẠO & PHÂN TÍCH
          </span>
          <h2 className="text-3xl font-serif font-semibold text-[var(--text-primary)] tracking-tight">
            Dashboard Thống Kê & Quản Lý Đề Thi
          </h2>
          <p className="text-sm font-sans text-[var(--text-secondary)] mt-2 leading-relaxed">
            Xem báo cáo tổng quan về hiệu suất làm bài thi thử trắc nghiệm, lịch sử học từ vựng và quản lý ngân hàng câu hỏi.
          </p>
        </div>

        <div className="flex bg-[var(--surface-soft)] border border-[var(--border-default)] px-4 py-2 rounded-xl text-xs gap-2 items-center text-[var(--text-secondary)] font-sans shadow-sm shrink-0">
          <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
          <span>Học kỳ Hiện Tại: <strong>Spring 2026</strong></span>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">

        {/* KPI 1 */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-[var(--accent)]/40 transition-all">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accentLight, color: accent }}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-serif font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Tổng Học Sinh Active</span>
            <span className="text-2xl font-serif font-bold text-[var(--text-primary)]">{totalStudents || 1}</span>
            <span className="text-[10px] font-sans flex items-center gap-1.5 mt-0.5 text-[var(--text-secondary)]">
              <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }}></span> {totalAttempts + totalGames} lượt hoạt động
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-[var(--accent)]/40 transition-all">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accentLight, color: accent }}>
            <Library className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-serif font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Ngân Hàng Đề Thi</span>
            <span className="text-2xl font-serif font-bold text-[var(--text-primary)]">{totalQuizzes} bộ đề</span>
            <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-sans block">
              {totalQuestions} câu hỏi
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-[var(--accent)]/40 transition-all">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accentLight, color: accent }}>
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-serif font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Kỷ lục Snake cao nhất</span>
            <span className="text-2xl font-serif font-bold text-[var(--text-primary)]">{highestSnake} điểm</span>
            <span className="text-[10px] font-semibold mt-0.5 font-sans block" style={{ color: accent }}>
              Max: {highestScore}% bài thi
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-[var(--accent)]/40 transition-all">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accentLight, color: accent }}>
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-serif font-semibold text-[var(--text-secondary)] uppercase tracking-wider block">Trung Bình Lớp</span>
            <span className="text-2xl font-serif font-bold text-[var(--text-primary)]">{avgTestScore}%</span>
            <span className="text-[10px] font-sans flex items-center mt-0.5" style={{ color: avgTestScore >= 50 ? '#16a34a' : '#dc2626' }}>
              {avgTestScore >= 50 ? 'Đạt yêu cầu đào tạo' : 'Cần cải thiện'}
            </span>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">

        {/* Line Chart */}
        <div className="lg:col-span-8 bg-[var(--card-bg)] border border-[var(--border-default)] p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">Biểu đồ Xu Hướng Điểm Số</h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans">Lịch sử thống kê điểm số đạt được qua các lượt làm đề thi thử</p>
            </div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">CHART.JS LINE</span>
          </div>

          <div className="h-64 relative">
            {attempts.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-sans">
                Hãy làm bài trắc nghiệm trước khi xem xu hướng.
              </div>
            )}
          </div>
        </div>

        {/* Doughnut Categories breakdown */}
        <div className="lg:col-span-4 bg-[var(--card-bg)] border border-[var(--border-default)] p-4 sm:p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">Cơ Cấu Bộ Đề</h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans">Phân bổ bộ đề thi theo môn học</p>
            </div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">CHART.JS</span>
          </div>

          <div className="h-64 relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

      </div>

      {/* Main Database Table list of exams */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-[var(--border-default)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--surface-soft)]">
          <div>
            <h3 className="font-serif font-bold text-lg text-[var(--text-primary)]">Danh Sách & Quản Lý Đề Thi Đào Tạo</h3>
            <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">Danh sách các bộ đề thi thử được kết nối vào hệ thống Neon PostgreSQL qua Adapter</p>
          </div>
          <div className="bg-[#1A1814] text-[#F2EFE7] px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-2 border border-neutral-300">
            <BookOpen className="w-4 h-4" style={{ color: accent }} />
            <span>ACTIVE POSTGRESQL ENGINE</span>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--surface-soft)] border-b border-[var(--border-default)] text-[var(--text-secondary)] font-serif font-semibold text-xs tracking-wider uppercase">
                <th className="p-4 pl-6">TÊN BỘ ĐỀ THI</th>
                <th className="p-4">CHUYÊN MỤC</th>
                <th className="p-4">SỐ LƯỢNG CÂU HỎI</th>
                <th className="p-4">THỜI GIAN LÀM BÀI</th>
                <th className="p-4 text-right pr-6">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)] font-sans text-[var(--text-primary)]">
              {exams.map((exam) => {
                const inferredCat = getExamCategory(exam.title);
                return (
                  <tr key={exam.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                    <td className="p-4 pl-6">
                      <div className="space-y-0.5">
                        <p className="font-serif font-bold text-[var(--text-primary)] text-sm">{exam.title}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono italic max-w-sm truncate">{exam.id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-[var(--surface-soft)] border border-[var(--border-default)] text-[var(--text-primary)] px-2.5 py-1 rounded-full text-xs font-medium">
                        {inferredCat}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-medium">{exam.questions.length} câu hỏi</td>
                    <td className="p-4 font-mono font-medium">{exam.duration} phút</td>
                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="p-2 text-neutral-400 rounded-lg transition-colors cursor-pointer hover:bg-red-50 hover:text-red-500"
                        title="Xóa đề thi khỏi cơ sở dữ liệu"
                      >
                        <Trash2 className="w-4 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
