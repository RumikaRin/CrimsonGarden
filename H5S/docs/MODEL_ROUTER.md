# H5S Model Router: Gemini / Antigravity Solo

File này cho phép Gemini hoặc Antigravity tự chọn model theo task trong bản
solo.

## 1. Tier

| Tier | Khi dùng | Gemini/Antigravity gợi ý |
| :--- | :--- | :--- |
| `fast` | Hỏi nhanh, grep, docs nhỏ, sửa typo/CSS nhỏ, test output ngắn | Flash / Flash-Lite / Auto fast |
| `balanced` | Feature vừa, một writer, code rõ scope, UI QA thường | Gemini 3.5 Flash / Auto |
| `strong` | Architecture, feature nhiều file, UI/UX quan trọng, debugging khó | Pro/high hoặc model mạnh nhất đang có |
| `deep-review` | Security, auth, payment, DB migration, final review | Pro/high hoặc strongest review model |

Nếu model gợi ý không có trong account/CLI, chọn model gần nhất theo capability
tier và ghi model note.

## 2. Quy Tắc Tự Chọn

1. Quick mode -> `fast`.
2. Standard mode -> `balanced`.
3. Full mode -> `strong`, riêng final review/security -> `deep-review`.
4. UI/UX brief mặc định `balanced`; nâng `strong` cho visual direction quan trọng.
5. Reviewer cho auth/security/payment/DB không được hạ dưới `deep-review`.

## 3. Theo Phase Solo

| Phase | Default tier |
| :--- | :--- |
| Leader | `balanced` |
| UI/UX | `balanced`, nâng `strong` nếu visual direction quan trọng |
| Coder | `balanced`, hạ `fast` cho sửa nhỏ |
| Tester | `fast`, nâng `balanced` cho flaky/debug khó |
| Reviewer | `balanced`, nâng `deep-review` cho risk cao |

## 4. Format Báo Ngắn

```text
Model decision:
- mode: Standard
- phase: UI/UX
- risk: medium
- tier: balanced
- reason: cần design brief + responsive/a11y states
```

Nếu không đổi model được trong phiên hiện tại:

```text
Model note: tiếp tục với model đang chạy; tier đề xuất cho task này là strong.
```

## 5. Lệnh

Gemini CLI:

```powershell
gemini -m "<model-name>"
```

Trong phiên:

```text
/model
```

Antigravity: dùng model selector/model settings của app/CLI nếu có. Nếu không
thấy selector, chạy với default/Auto và ghi model note.

