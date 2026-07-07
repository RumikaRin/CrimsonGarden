# Spec: Kế hoạch khôi phục thiết kế gốc của Crimson Academy (UI-RESTORE-THEME)

Kế hoạch này khôi phục lại hệ thống mã màu (design tokens) gốc của Crimson Theme (Cozy) và Garden Theme (Neon) trong [theme.ts](file:///d:/ProjectZ/Crimsonacademy/src/lib/theme.ts) về đúng định nghĩa ban đầu của [DESIGN.md](file:///d:/ProjectZ/Crimsonacademy/DESIGN.md) và website cũ (https://crimson-garden.vercel.app/) để khôi phục lại tính thẩm mỹ cao của giao diện.

## User Review Required

> [!IMPORTANT]
> - Các mã màu trong [theme.ts](file:///d:/ProjectZ/Crimsonacademy/src/lib/theme.ts) sẽ được khôi phục về trạng thái nguyên bản trước khi bị sửa đổi (ví dụ: khôi phục Crimson background `#F2EFE7` Chalk Canvas, accent `#DC143C`; khôi phục Garden background `#F4FAF0`, accent `#224334`).
> - Việc khôi phục này chỉ thay đổi các biến màu CSS và không làm ảnh hưởng đến cấu trúc layout hay logic hoạt động của các trang web.

## Open Questions

Không có câu hỏi mở.

## Proposed Changes

### [Theme System]

#### [MODIFY] [theme.ts](file:///d:/ProjectZ/Crimsonacademy/src/lib/theme.ts)
- Khôi phục các giá trị mã màu của `cozyTokens` (Crimson theme) về nguyên bản (background `#F2EFE7`, surface `#FFF9FA`, accent `#DC143C`, text `#1A1814`).
- Khôi phục các giá trị mã màu của `neonTokens` (Garden theme) về nguyên bản (background `#F4FAF0`, accent `#224334`, text `#1A1814`).

#### [MODIFY] [useThemeTokens.ts](file:///d:/ProjectZ/Crimsonacademy/src/lib/useThemeTokens.ts)
- Khôi phục các lớp class Tailwind tương ứng cho cozy và neon theme (accent `#DC143C`, pageBg `#F2EFE7`, v.v.).

## Verification Plan

### Automated Tests
- Chạy unit tests để đảm bảo tính ổn định:
  ```bash
  npm run test
  ```
- Chạy lint/typecheck:
  ```bash
  npm run lint
  ```

### Manual Verification
- Chạy build dự án Next.js:
  ```bash
  npm run build
  ```
- Chạy guard verify của H5S:
  ```bash
  python H5S/scripts/h5s_guard.py verify --mode full --feature UI-REDESIGN
  ```
