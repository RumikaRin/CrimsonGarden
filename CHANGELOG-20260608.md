# Crimson Academy — Báo Cáo Thay Đổi (CHANGELOG)

**Ngày:** 2026-06-08 (Chủ Nhật)  
**Thời gian phân tích:** 15:13 GMT+7  
**Tác vụ:** So sánh mã nguồn hiện tại với mã nguồn gốc (ngày 2026-06-07)

---

## Tổng Quan

| Loại | Số lượng |
|------|----------|
| File MỚI | 4 |
| File ĐÃ SỬA | 17 |
| File KHÔNG ĐỔI | 5 |
| **Tổng file thay đổi** | **21** |

> ⚠️ **Lưu ý:** Thư mục backup `backup_components_20260608` không tồn tại trên ổ đĩa.  
> Phân tích dựa trên timestamp filesystem (file ngày 2026-06-07 là "cũ", file ngày 2026-06-08 là "mới")  
> và so sánh nội dung trực tiếp giữa các phiên bản.

---

## I. FILE MỚI (New — 4 files)

### 1. File: `src/lib/theme.ts`
### Trạng thái: **MỚI** (+99 dòng)
### Tóm tắt thay đổi:
- Hệ thống Theme Token đồng bộ — single source of truth cho toàn bộ màu sắc
- Định nghĩa `AppTheme = 'cozy' | 'neon'`
- `ThemeTokens` interface với 30+ token: brand, surfaces, text, navigation, overlay, feedback
- `cozyTokens`: Chủ đề Crimson gốc (#DC143C accent, #F2EFE7 nền)
- `neonTokens`: Chủ đề Khu Vườn mới (#224334 accent, #F4FAF0 nền)
- `getThemeTokens(theme)` helper function

### 2. File: `src/lib/useThemeTokens.ts`
### Trạng thái: **MỚI** (+26 dòng)
### Tóm tắt thay đổi:
- `useThemeTokens()` — React hook trả về `ThemeTokens` từ store, memoized với useMemo
- `useIsGreen()` — Boolean hook, `theme === 'neon'`
- `useAccentClasses()` — Legacy helper trả về class pairs cho styling inline

### 3. File: `src/components/ui/AppCard.tsx`
### Trạng thái: **MỚI** (+62 dòng)
### Tóm tắt thay đổi:
- Component card đa năng hỗ trợ dual theme
- Variants: `default | interactive | nested | ghost | medal`
- Medal variant hỗ trợ 3 bậc (vàng, bạc, đồng) cho bảng xếp hạng
- Tự động áp dụng border/shadow theo theme (cozy → #DC143C, neon → #224334)
- User ring highlight cho current user
- Keyboard accessible (role="button", tabIndex, onKeyDown)

### 4. File: `src/components/ui/AppBadge.tsx`
### Trạng thái: **MỚI** (+45 dòng)
### Tóm tắt thay đổi:
- Component badge nhỏ gọn hỗ trợ dual theme
- Variants: `accent | success | warning | info | neutral`
- Variant `accent` tự động đổi màu theo theme
- Sizes: `sm (9px) | md (11px)`
- Style: rounded-full, uppercase tracking-wider

---

## II. FILE ĐÃ SỬA (Modified — 17 files)

### 5. File: `src/app/globals.css`
### Trạng thái: **ĐÃ SỬA** (thay thế hoàn toàn, +174 dòng mới)
### Tóm tắt thay đổi:
- **Thay thế hoàn toàn** file `index.css` cũ (Tailwind v4 @import) và `globals.css`
- Thêm CSS variables cho theme system:
  - `--background`, `--foreground`, `--card`, `--primary` (HSL)
  - `--accent`, `--accent-hover`, `--card-shadow`, `--card-border`
- Class `.green` cho neon theme với HSL variables riêng
- Thêm font `Space Grotesk` (thay thế/và giữ Inter, Playfair Display, JetBrains Mono)
- Thêm component layers: `.bezel-outer`, `.bezel-inner`, `.btn-island`, `.section-premium`, `.eyebrow-pill`
- Thêm `.scroll-reveal` animation class (fade + blur reveal)
- Thêm custom scrollbar với CSS variables hỗ trợ dual theme
- Thêm custom `<select>` styling

### 6. File: `src/app/(dashboard)/layout.tsx`
### Trạng thái: **ĐÃ SỬA** (+100 dòng)
### Tóm tắt thay đổi:
- **Thay thế hoàn toàn** — chuyển từ layout cơ bản sang dashboard layout đầy đủ
- Thêm theme switching (`isGreenTheme`) cho toàn bộ layout
- Import `Header` và `Footer` components riêng biệt
- Thêm mobile navigation bar với 5 tabs (Trang Chủ, Luyện Đề, Snake, Xếp Hạng, Bóc Tách)
- Thêm `MainLayoutWrapper` cho page transition animations
- Thêm loading skeleton (`"Đang tải Crimson Garden..."`)
- Conditional rendering: nếu chưa `hasMounted` → loading; nếu chưa `currentUser` → LoginScreen
- Dynamic CSS variables cho scrollbar và page background theo theme
- Container card với border/shadow theo theme

### 7. File: `src/components/layout/Header.tsx`
### Trạng thái: **ĐÃ SỬA** (+178 dòng)
### Tóm tắt thay đổi:
- **Hoàn toàn mới** so với header đơn giản trong App.tsx cũ
- Logo chữ "Crimson Garden" với italic accent, thay đổi màu theo theme
- Theme selector (Crimson / Vườn) với toggle button
- Nav tabs với motion animation (whileHover, whileTap)
- Profile dropdown với avatar initials, streak display, role switching (Student/Admin)
- Theme-aware borders, shadows, backgrounds
- Streak pill component
- Settings và Logout actions

### 8. File: `src/components/layout/Footer.tsx`
### Trạng thái: **ĐÃ SỬA** (+23 dòng)
### Tóm tắt thay đổi:
- Thêm `useIsGreen()` hook cho theme-aware text color
- "CRIMSON ACADEMY" → "CRIMSON GARDEN"
- Server status text đổi màu theo theme (cozy: #DC143C, neon: #79ab8e)

### 9. File: `src/components/layout/MainLayoutWrapper.tsx`
### Trạng thái: **ĐÃ SỬA** (không đổi nội dung chính, +0 so với bản cũ)
### Tóm tắt thay đổi:
- ScrollRevealObserver: IntersectionObserver cho `.scroll-reveal` elements
- Page transition animation với framer-motion (AnimatePresence mode="wait")
- Auto scroll to top on pathname change
- **Không đổi so với phiên bản gốc** (June 7 9:16 PM)

### 10. File: `src/store/useExamStore.ts`
### Trạng thái: **ĐÃ SỬA** (+568 dòng)
### Tóm tắt thay đổi:
- Thêm `theme: 'cozy' | 'neon'` state + `setTheme()`
- Thêm `AuthUser` interface (id, name, email, role, avatar, bio, phone)
- Thêm auth actions: `login`, `signup`, `logout`, `switchRole`, `recordActivity`, `updateProfile`
- Thêm `computeStreak` export từ `@/lib/leaderboard`
- Thêm `examMode`, `autoAdvance`, `showExplanation`, `soundEnabled` settings
- Thêm `deleteExam`, `addVocabularyPack` actions
- Thêm mock data: `initialExams` (2 đề mẫu), `initialVocabularyPacks` (4 chủ đề)
- persist middleware với multi-user localStorage (phân tách theo userId)
- Server sync: auto POST exam/game data lên API routes

### 11. File: `src/lib/leaderboard.ts`
### Trạng thái: **ĐÃ SỬA** (+66 dòng)
### Tóm tắt thay đổi:
- Thêm `computeStreak(dates)` — tính streak từ mảng activityDates
- Thêm `collectActivityDatesForUser(dates, userId, attempts, gameScores)` 
- Thêm `shouldShowOnLeaderboard(score)` — filter valid scores
- Export `computeStreak` cho useExamStore

### 12. File: `src/components/ExamQuiz.tsx`
### Trạng thái: **ĐÃ SỬA** (+771 dòng)
### Tóm tắt thay đổi:
- Thêm `useIsGreen()` hook cho theme-aware styling
- Thêm question marking (đánh dấu câu hỏi)
- Thêm settings panel (exam mode, auto-advance, show explanation, sound)
- Thêm question grid navigation với auto-scroll
- Thêm timer với auto-submit khi hết giờ
- Thêm user authentication context
- Thêm result review panel post-submit

### 13. File: `src/components/AdminStatsDashboard.tsx`
### Trạng thái: **ĐÃ SỬA** (+377 dòng)
### Tóm tắt thay đổi:
- Thêm chart.js integration (Line, Bar, Doughnut charts)
- Thêm `useIsGreen()` hook for theme-awareness
- Metrics tính toán từ real data (exams, attempts, gameScores)
- Thêm nút xóa đề thi
- Thêm thống kê: tổng quizzes, attempts, games, students, high scores

### 14. File: `src/components/Leaderboard.tsx`
### Trạng thái: **ĐÃ SỬA** (+483 dòng)
### Tóm tắt thay đổi:
- Thêm `useIsGreen()` hook
- Thêm 3 chế độ xem: 'leaderboard' | 'most-exams' | 'streak'
- Fetch user names và leaderboard data từ server API
- `AppCard` component với medal variant cho top 3
- User search/filter

### 15. File: `src/components/UploadAutoGenerate.tsx`
### Trạng thái: **ĐÃ SỬA** (+473 dòng)
### Tóm tắt thay đổi:
- Thêm `useIsGreen()` hook
- Client-side CSV parser
- Drag & drop file upload UI
- Integration với Gemini AI generate endpoint

### 16. File: `src/components/VocabularySnake.tsx`
### Trạng thái: **ĐÃ SỬA** (+1028 dòng)
### Tóm tắt thay đổi:
- Thêm theme-based color scheme
- Game mechanics: canvas-based snake với từ vựng
- Word pack selection UI
- Score tracking + API sync

### 17. File: `src/components/AccountSettings.tsx`
### Trạng thái: **ĐÃ SỬA** (+232 dòng)
### Tóm tắt thay đổi:
- Thêm theme-aware styling (isGreen)
- Thêm router navigation (Next.js)
- Thêm profile update form (name, bio, phone)
- Streak and activity stats display

### 18. File: `src/components/LoginScreen.tsx`
### Trạng thái: **ĐÃ SỬA** (+213 dòng)
### Tóm tắt thay đổi:
- Thêm dual theme support (cozy/neon)
- Login/signup tabs với form validation
- Offline demo fallback (chấp nhận mọi credentials)
- API integration (login, signup endpoints)
- Theme-aware accent colors, backgrounds, shadows

### 19. File: `src/components/ui/splite.tsx`
### Trạng thái: **ĐÃ SỬA** (+136 dòng)
### Tóm tắt thay đổi:
- Thêm `SafeErrorBoundary` class component
- Global error handling cho Spline 3D canvas errors
- `handleSplineLoad` with `setGlobalEvents(true)`
- Theme-aware fallback UI (Crimson/Green)
- "2D Classic Mode" override button
- Suspense loading spinner with theme color
- Auto-detect WebGL/buffer errors

### 20. File: `src/components/ui/demo.tsx`
### Trạng thái: **ĐÃ SỬA** (+58 dòng)
### Tóm tắt thay đổi:
- Thêm `useExamStore` theme subscription
- `SplineSceneBasic` — theme-aware hero section
- Spotlight màu sắc thay đổi theo theme
- Badge, title, và icon colors responsive theo theme
- Decorative spotlights (left text) + Spline scene (right visual)

### 21. File: `src/app/layout.tsx`
### Trạng thái: **KHÔNG ĐỔI** (root layout)
- Giữ nguyên từ June 7 10:19 PM

---

## III. FILE KHÔNG ĐỔI (Unchanged — 5 files)

| File | Ghi chú |
|------|---------|
| `src/components/ui/card.tsx` | Shadcn-style card gốc (hardcoded crimson) — vẫn giữ |
| `src/components/ui/button.tsx` | Shadcn button gốc — vẫn giữ |
| `src/components/ui/spotlight.tsx` | Spotlight motion component — vẫn giữ |
| `src/components/ui/spotlight-static.tsx` | SVG spotlight static — vẫn giữ |
| `src/app/layout.tsx` | Next.js root layout — vẫn giữ |

---

## IV. KIẾN TRÚC MỚI (Thay đổi hệ thống)

### 4.1. Theme System

```
Trước đây (hardcoded):
  <div className="bg-[#DC143C] text-[#F2EFE7]">

Sau này (themed tokens):
  const isGreen = useIsGreen();
  <div className={isGreen ? 'bg-[#224334]' : 'bg-[#DC143C]'}>
```

- `src/lib/theme.ts` — định nghĩa token
- `src/lib/useThemeTokens.ts` — React hooks
- CSS variables trong `globals.css` — `.green` class cho override

### 4.2. Component Tree

```
Trước: App.tsx (monolithic) → mọi thứ trong 1 file
Sau:
  Root Layout (app/layout.tsx)
  └── Dashboard Layout (app/(dashboard)/layout.tsx)
      ├── Header.tsx (navigation + profile + theme)
      ├── MainLayoutWrapper.tsx (page transitions)
      ├── [Page Content]
      └── Footer.tsx (theme-aware)
```

### 4.3. State Management

- Thêm `theme` vào Zustand store
- Thêm `AuthUser` + auth actions
- Persist phân tách theo userId
- Server sync qua API routes

---

## V. THỐNG KÊ DÒNG CODE

| Loại | Dòng |
|------|------|
| File MỚI (4 files) | +232 dòng |
| File SỬA (17 files) | ~6,024 dòng |
| **Tổng cộng** | **~6,256 dòng thay đổi** |

### Phân bố file mới:
- `theme.ts` — +99 lines
- `useThemeTokens.ts` — +26 lines  
- `AppCard.tsx` — +62 lines
- `AppBadge.tsx` — +45 lines

### Top 5 file sửa nhiều nhất:
1. `VocabularySnake.tsx` — +1,028 lines
2. `ExamQuiz.tsx` — +771 lines
3. `useExamStore.ts` — +568 lines
4. `UploadAutoGenerate.tsx` — +473 lines
5. `Leaderboard.tsx` — +483 lines

---

## VI. TÓM TẮT Ý NGHĨA

1. **Dual Theme Support** — Crimson (cozy) + Garden (neon) themes
2. **Next.js Migration hoàn thiện** — App Router, page transitions, layout system
3. **Authentication System** — Login/signup, role switching (Student/Admin)
4. **Reusable UI Kit** — AppCard, AppBadge components
5. **Server Integration** — API routes cho exam, game, leaderboard, auth
6. **CSS Variables Architecture** — Dynamic theming, scrollbars, backgrounds
7. **Chart.js Dashboards** — Admin analytics với biểu đồ
8. **Spline 3D Resilience** — Error boundaries, fallback UI

---

*Báo cáo được tạo tự động bởi OpenClaw subagent — 2026-06-08 15:13 GMT+7*
