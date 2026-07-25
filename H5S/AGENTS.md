# Chào mừng AI Agent đến với Dự Án H5S!

Tệp tin này là điểm đón tiếp (Agent Shim) và chỉ dẫn đầu tiên bắt buộc bạn phải đọc khi bắt đầu bất kỳ phiên làm việc nào trong dự án này.

---

## 🗺️ BẢN ĐỒ KHUNG VẬN HÀNH (HARNESS MAP)

Dự án này sử dụng mô hình **Harness Engineering** để đảm bảo tính an toàn và tự trị tối đa. Hệ thống được chia làm 10 phân hệ:

1.  **Instructions (Chỉ dẫn):**
    *   [RULE.md](RULE.md): Quy tắc tối cao (~90 dòng, progressive disclosure).
    *   [docs/HARNESS.md](docs/HARNESS.md): Mô tả chi tiết mô hình cộng tác.
    *   [docs/GEMINI_SOLO_WORKFLOW.md](docs/GEMINI_SOLO_WORKFLOW.md): Quy trình khi chỉ có Gemini hoặc Antigravity.
    *   [docs/MODEL_ROUTER.md](docs/MODEL_ROUTER.md): Quy tắc Gemini/Antigravity tự chọn model theo task, mode và risk.
    *   [docs/UI_PRESETS/CINEMATIC_LANDING_BUILDER.md](docs/UI_PRESETS/CINEMATIC_LANDING_BUILDER.md): Optional preset cho landing page cinematic.
    *   [docs/WORKFLOW_PLAYBOOK.md](docs/WORKFLOW_PLAYBOOK.md): Sơ đồ điều phối các phase vai trò, sử dụng skill cục bộ và các MCP.
    *   [docs/RULES/](docs/RULES/): Chi tiết kỹ thuật: `nextjs.md`, `prisma.md`, `ui-ux.md`.
2.  **State (Trạng thái công việc):**
    *   [feature_list.json](feature_list.json): Danh sách tính năng và trạng thái.
    *   [progress.md](progress.md): Trạng thái chi tiết task hiện tại.
3.  **Spec Artifacts (Đặc tả tính năng):**
    *   [specs/](specs/): Feature artifact theo `spec.md`, `design.md`, `tasks.md`, `review.md`, `test-evidence.md`.
    *   [docs/SPEC_WORKFLOW.md](docs/SPEC_WORKFLOW.md): Quy trình spec-driven cho Standard/Full mode.
4.  **Enforcement (Cổng kiểm tra):**
    *   [scripts/h5s_guard.py](scripts/h5s_guard.py): Guard bootstrap/preflight/verify.
    *   [docs/ENFORCEMENT.md](docs/ENFORCEMENT.md): Cách nối guard với Claude Hooks/ClaudeKit/tool ngoài.
5.  **Verification (Xác minh):**
    *   [init.sh](init.sh): Script bootstrap môi trường.
    *   [docs/TEST_MATRIX.md](docs/TEST_MATRIX.md): Ma trận kiểm thử.
    *   [docs/ANTI_RATIONALIZATION.md](docs/ANTI_RATIONALIZATION.md): Bảng chống biện minh khi bỏ qua bước.
6.  **Scope (Phạm vi):**
    *   [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): Ranh giới kiến trúc module.
    *   [docs/FEATURE_INTAKE.md](docs/FEATURE_INTAKE.md): Phân loại rủi ro feature đầu vào.
7.  **Lifecycle (Vòng đời):**
    *   [docs/session-handoff.md](docs/session-handoff.md): Bàn giao phiên làm việc.
    *   [docs/AGENT_LOG.md](docs/AGENT_LOG.md): Nhật ký quyết định (observability).
    *   [docs/GIT_WORKTREE.md](docs/GIT_WORKTREE.md): Cách ly môi trường song song.
8.  **Agent Team (Đội Agent):**
    *   [agent_team.json](agent_team.json): Cấu hình đội và vai trò.
    *   [docs/AGENT_TEAM.md](docs/AGENT_TEAM.md): Hướng dẫn vận hành đội.
    *   Agent definitions có thể bổ sung sau nếu dự án cần runner riêng cho từng vai trò.
9.  **Context Management (Quản lý ngữ cảnh):**
    *   [docs/CONTEXT_RULES.md](docs/CONTEXT_RULES.md): Ngân sách token, context boundaries.
10. **Skill Pack (Kỹ năng tái sử dụng):**
    *   [skills/](skills/): Quy trình chuẩn — `spec`, `build`, `test`, `review`.

---

## ⚡ NHIỆM VỤ ĐẦU TIÊN KHI BẮT ĐẦU PHIÊN (FIRST MOVES)

Khi khởi động hoặc nhận được một yêu cầu mới từ người dùng, trước tiên phải chọn
mode để tránh tốn token không cần thiết:

| Mode | Trigger | Cách đọc context |
| :--- | :--- | :--- |
| **Quick** | Không có `harness`, task nhỏ | Đọc file liên quan trực tiếp; không chạy `init.sh`, không cập nhật trạng thái H5S trừ khi cần. |
| **Standard** | Có `harness` hoặc feature vừa | Đọc `RULE.md`, `progress.md`, `feature_list.json`, `FEATURE_INTAKE.md`, `SPEC_WORKFLOW.md`, `GEMINI_SOLO_WORKFLOW.md`, `MODEL_ROUTER.md`; chỉ đọc playbook nếu thêm CLI thứ hai hoặc MCP phức tạp. |
| **Full** | `harness full`, feature lớn, role switching chặt | Đọc thêm `AGENT_TEAM.md`, `CONTEXT_RULES.md`, `TEST_MATRIX.md`, `ENFORCEMENT.md`. |

*   **Nếu có `harness`:** Hãy thực hiện quy trình Harness theo mode phù hợp:
    1.  Đọc kỹ file `AGENTS.md` này để nắm cấu trúc.
    2.  Chọn mode `Standard` hoặc `Full`. Nếu người dùng chỉ gõ `harness`, mặc định là `Standard`.
    3.  Đọc `progress.md` để xem có công việc nào đang làm dở từ phiên trước không.
    4.  Truy vấn trạng thái trong `feature_list.json` để xác định task cần triển khai. **LƯU Ý:** Các feature hiện tại trong `feature_list.json` chỉ là mẫu (sample). Agent **bắt buộc** phải hỏi người dùng dự án thực tế hiện tại là làm gì trước khi tiếp tục, sau đó cập nhật lại danh sách này cho đúng thực tế.
    5.  Phân loại độ rủi ro dựa trên `docs/FEATURE_INTAKE.md` và chọn model tier bằng [docs/MODEL_ROUTER.md](docs/MODEL_ROUTER.md).
    6.  Với `Standard`/`Full`, tạo hoặc cập nhật `H5S/specs/<feature-id>/` theo [docs/SPEC_WORKFLOW.md](docs/SPEC_WORKFLOW.md).
    7.  Đọc [docs/GEMINI_SOLO_WORKFLOW.md](docs/GEMINI_SOLO_WORKFLOW.md) để chạy đúng solo workflow. Chỉ trong `Full mode`: đọc `agent_team.json`, [docs/AGENT_TEAM.md](docs/AGENT_TEAM.md), [docs/CONTEXT_RULES.md](docs/CONTEXT_RULES.md) và [docs/TEST_MATRIX.md](docs/TEST_MATRIX.md).
    8.  Chạy script `./init.sh` khi chuẩn bị code/test, hoặc khi `Full mode` cần kiểm tra môi trường trước khi chia việc.
    9.  Trước khi sửa file, chạy `python H5S/scripts/h5s_guard.py preflight --mode standard --feature <feature-id>` hoặc kiểm tra tương đương nếu không có Python.
*   **Nếu KHÔNG có `harness`:** Bỏ qua toàn bộ quy trình Harness này (không chạy `./init.sh`, không cập nhật tài liệu trạng thái Harness) và tập trung xử lý trực tiếp yêu cầu phát triển của người dùng.

---

## 👥 VẬN HÀNH TRÊN ANTIGRAVITY IDE (SOLO WORKFLOW)

Dự án chạy hoàn toàn độc lập trên **Antigravity IDE** với một Agent duy nhất (Antigravity/Gemini). Không có sự tham gia của Codex hay việc chia nhỏ sang các CLI khác. 

Để giữ kỷ luật và đảm bảo chất lượng, Agent thực hiện **Chuyển đổi Vai trò (Role Switching)** theo từng pha làm việc:
1. 🟢 **Leader (Pha Lập Kế Hoạch):** Viết `implementation_plan.md` và `task.md` tích hợp của IDE, sau đó tự động đồng bộ sang `H5S/specs/<feature-id>/spec.md` và `H5S/progress.md`.
2. 🟣 **UI/UX (Pha Thiết Kế Giao Diện):** Xác định visual direction, các trạng thái responsive, loading, empty, error trước khi code.
3. 🔵 **Coder (Pha Lập Trình):** Claim `ACTIVE WRITER` trong `progress.md`, chạy `preflight` guard, thực hiện sửa code trong phạm vi cho phép (`Files allowed`) bằng các công cụ IDE.
4. 🟠 **Tester (Pha Kiểm Thử):** Viết test case, chạy test, cập nhật kết quả vào `test-evidence.md`.
5. 🟡 **Reviewer (Pha Đánh Giá):** Đọc lại git diff, phân tích rủi ro và an ninh một cách độc lập trước khi ship.
6. 🟢 **Leader (Pha Đóng Tác Vụ):** Chạy `verify` guard, viết `walkthrough.md` của IDE và giải phóng quyền ghi `ACTIVE WRITER`.

---

## 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE)

Một nhiệm vụ chỉ được coi là hoàn thành khi và chỉ khi:
- Code chạy chính xác và đã giải quyết triệt để yêu cầu.
- Đã bổ sung/cập nhật unit test và chạy lệnh test xác minh thành công.
- **Nếu là Standard/Full mode**: Đã cập nhật `H5S/specs/<feature-id>/` tối thiểu gồm `spec.md`, `tasks.md`, và `test-evidence.md`.
- **Nếu chạy trong chế độ `harness`**: Đã ghi nhận bằng chứng chạy test thành công vào [docs/TEST_MATRIX.md](docs/TEST_MATRIX.md), cập nhật trạng thái tính năng trong `feature_list.json` và `progress.md`.
- Đã chạy `python H5S/scripts/h5s_guard.py verify --mode standard --feature <feature-id>` (hoặc tương đương) thành công.
- Đã ghi nhận đầy đủ bằng chứng và báo cáo vào file `walkthrough.md` của IDE.
- Báo cáo rõ những gì đã làm và những gì không thực hiện cho người dùng.
