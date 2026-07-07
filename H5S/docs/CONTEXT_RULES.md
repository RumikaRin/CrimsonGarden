# Quy Tắc Quản Lý Ngữ Cảnh (CONTEXT_RULES.md)

Tài liệu này định nghĩa chiến lược quản lý ngân sách token (context window) để Agent hoạt động hiệu quả mà không bị "context rot" — hiện tượng Agent mất tập trung hoặc bỏ sót chỉ dẫn khi ngữ cảnh quá dài.

---

## 📏 1. NGÂN SÁCH TOKEN THEO QUY MÔ FEATURE

### 1.A Mode Đọc Context

| Mode | Ngân sách đọc H5S | Khi dùng | Quy tắc |
| :--- | :--- | :--- | :--- |
| **Quick** | < 3K tokens | Task nhỏ, hỏi nhanh | Không đọc tài liệu team/optional nếu chưa cần. |
| **Standard** | 3K-8K tokens | Feature vừa, một writer | Đọc rule/state/risk; chỉ mở docs chi tiết theo nhu cầu. |
| **Full** | 8K-20K+ tokens | Nhiều agent, feature lớn, ship | Đọc team/shared-folder/context/test matrix và ghi handoff. |

Agent phải chọn mode trước khi đọc tài liệu dài. Nếu đang ở Quick hoặc Standard,
không tự nâng lên Full chỉ vì tò mò; chỉ nâng mode khi task có rủi ro hoặc có
nhiều agent/writer thật sự.

Sau khi chọn mode, Gemini/Antigravity chọn model tier bằng
[MODEL_ROUTER.md](MODEL_ROUTER.md). Không dùng model mạnh cho grep/docs/test
output dài nếu tier `fast` đủ xử lý.

### 1.B Ngân Sách Theo Quy Mô Feature

| Quy Mô (từ FEATURE_INTAKE) | Ngân Sách Token Ước Tính | Chiến Lược |
| :--- | :--- | :--- |
| **S (Small)** | < 20K tokens | Xử lý trực tiếp, không cần tách phase |
| **M (Medium)** | 20K–50K tokens | Tách thành 2-3 sub-task, mỗi sub-task có verify riêng |
| **L (Large)** | 50K–100K tokens | Bắt buộc tách phase, sử dụng Agent Team, handoff giữa phase |
| **XL (Extra Large)** | > 100K tokens | Tách thành nhiều phiên làm việc, mỗi phiên có session-handoff |

---

## 🧠 2. NGUYÊN TẮC QUẢN LÝ NGỮ CẢNH

### 2.A Tải trọng tối ưu (Context Load Optimization)
- **Chỉ đọc file cần thiết:** Không đọc toàn bộ codebase. Grep/search trước, đọc file sau.
- **Progressive Disclosure:** RULE.md chỉ chứa tóm tắt + link đến chi tiết trong `docs/RULES/`. Agent chỉ đọc file chi tiết khi cần.
- **Không đọc lại file đã đọc:** Nếu đã nắm nội dung file, không đọc lại trừ khi nghi ngờ có thay đổi.

### 2.B Nén ngữ cảnh (Context Compaction)
- **Tóm tắt khi chuyển phase:** Khi chuyển từ `/plan` sang `/build`, tóm tắt kế hoạch thành checklist ngắn gọn thay vì giữ toàn bộ phân tích.
- **Ghi ra file thay vì giữ trong đầu:** Kết quả phân tích phức tạp → ghi vào `progress.md` để Agent (hoặc Agent tiếp theo) đọc lại khi cần.
- **Loại bỏ noise:** Không giữ output terminal quá dài trong context. Chỉ giữ thông tin lỗi hoặc kết quả quan trọng.

### 2.C Ranh giới ngữ cảnh (Context Boundaries)
- **Mỗi Agent chỉ cần biết phần của mình:** Trong Agent Team, Leader không cần đọc toàn bộ code — chỉ cần file structure và plan. Coder không cần đọc toàn bộ test — chỉ cần viết code theo brief.
- **Tham chiếu thay vì copy:** Thay vì paste nội dung file vào brief, ghi đường dẫn file để Agent tự đọc.

---

## 📐 3. BẢNG FILE ĐỌC THEO VAI TRÒ

Khi chạy ở chế độ `harness` với Agent Team, mỗi vai trò chỉ cần đọc các file tương ứng:

| File | Leader | Coder | Reviewer | Tester |
| :--- | :---: | :---: | :---: | :---: |
| `AGENTS.md` | ✅ | ⬜ | ⬜ | ⬜ |
| `RULE.md` (tóm tắt) | ✅ | ✅ | ✅ | ⬜ |
| `docs/RULES/nextjs.md` | ⬜ | ✅ | ✅ | ⬜ |
| `docs/RULES/prisma.md` | ⬜ | ✅ | ✅ | ⬜ |
| `docs/RULES/ui-ux.md` | ⬜ | ✅ | ✅ | ⬜ |
| `feature_list.json` | ✅ | ⬜ | ⬜ | ⬜ |
| `progress.md` | ✅ | ✅ | ⬜ | ✅ |
| `docs/ARCHITECTURE.md` | ✅ | ✅ | ✅ | ⬜ |
| `docs/TEST_MATRIX.md` | ⬜ | ⬜ | ⬜ | ✅ |
| `agent_team.json` | ✅ | ⬜ | ⬜ | ⬜ |
| `docs/AGENT_TEAM.md` | ✅ | ⬜ | ⬜ | ⬜ |
| Source code files | ⬜ | ✅ | ✅ | ⬜ |
| Test files | ⬜ | ⬜ | ⬜ | ✅ |

> ✅ = Đọc bắt buộc &nbsp;&nbsp; ⬜ = Không cần đọc (trừ khi được yêu cầu cụ thể)

Vai trò UI/UX đọc tối thiểu: `H5S/RULE.md`, `docs/RULES/ui-ux.md`,
`docs/WORKFLOW_PLAYBOOK.md` phần Antigravity/UI, và file UI liên quan. UI/UX
không cần đọc backend, database, hoặc `AGENT_TEAM.md` đầy đủ nếu chỉ làm design
brief/QA.

---

## ⚠️ 4. DẤU HIỆU CONTEXT ROT

Agent phải tự nhận biết khi ngữ cảnh bắt đầu quá tải:
- Bắt đầu quên các chỉ dẫn từ RULE.md.
- Lặp lại câu hỏi đã được trả lời.
- Viết code vi phạm conventions đã nêu.
- Không nhớ kế hoạch đã lập ở bước trước.

**Khi phát hiện dấu hiệu:** Dừng lại, ghi trạng thái vào `progress.md`, yêu cầu bắt đầu phiên mới hoặc chuyển giao cho Agent khác qua `session-handoff.md`.
