# Khung Vận Hành Harness (HARNESS.md)

Tài liệu này mô tả chi tiết mô hình cộng tác Harness Engineering giữa Người và Máy trong dự án H5S.

---

## 🚀 1. ĐỊNH NGHĨA KHUNG VẬN HÀNH (HARNESS SYSTEM)

Khung Harness của H5S được xây dựng để đảm bảo tính an toàn, tự trị và kiểm soát chất lượng mã nguồn liên tục thông qua 10 thành phần:
1. **Chỉ dẫn (Instructions):** Định hướng hành vi qua [RULE.md](RULE.md), `AGENTS.md`, và chi tiết trong `docs/RULES/`.
2. **Trạng thái (State Tracking):** Đồng bộ hóa tiến độ thông qua `feature_list.json` và `progress.md`.
3. **Spec Artifacts:** Chuẩn hóa feature qua `specs/<feature-id>/` và `docs/SPEC_WORKFLOW.md`.
4. **Enforcement:** Kiểm tra gate bằng `scripts/h5s_guard.py` và `docs/ENFORCEMENT.md`.
5. **Xác minh (Verification):** Chạy `init.sh`, ghi kết quả tại `docs/TEST_MATRIX.md`, chống biện minh qua `docs/ANTI_RATIONALIZATION.md`.
6. **Phạm vi (Scope Control):** Kiểm soát kiến trúc qua `docs/ARCHITECTURE.md`, đánh giá đầu vào qua `docs/FEATURE_INTAKE.md`.
7. **Vòng đời (Lifecycle):** Bàn giao qua `docs/session-handoff.md`, observability qua `docs/AGENT_LOG.md`.
8. **Đội Agent (Agent Team):** Phối hợp qua `agent_team.json`, `docs/AGENT_TEAM.md`, và `.claude/agents/`.
9. **Ngữ cảnh (Context Management):** Quản lý token budget qua `docs/CONTEXT_RULES.md`.
10. **Kỹ năng (Skill Pack):** Quy trình tái sử dụng trong `skills/` (spec, build, test, review).

---

## ⚡ 2. CÂU LỆNH `harness` & CHẾ ĐỘ KÍCH HOẠT

Nhằm tối ưu hóa hiệu năng, giảm dung lượng ngữ cảnh (Context) và tránh việc chạy lại các tác vụ kiểm tra không cần thiết trên mỗi lượt hội thoại thường ngày, quy trình Harness được thiết kế theo dạng **kích hoạt có điều kiện**.

### 2.A Khi gõ `harness` (Chế độ Harness được bật)
Agent sẽ thực hiện đầy đủ các bước chuẩn hóa và kiểm tra an toàn hệ thống:
1. **Khởi động & Kiểm tra tính toàn vẹn:** Thực thi script `./init.sh` từ thư mục gốc để chuẩn bị môi trường chạy test, sinh mã Prisma Client, hoặc kiểm tra kết nối DB.
2. **Đồng bộ hóa Trạng thái:** Đọc và cập nhật các tệp tin `progress.md` và `feature_list.json` để đồng bộ tiến trình hiện tại. **LƯU Ý:** Các feature ban đầu trong `feature_list.json` chỉ là mẫu (sample). Agent bắt buộc phải hỏi người dùng dự án thực tế hiện tại là làm gì để cập nhật lại danh sách.
3. **Tạo Spec Artifact:** Với Standard/Full mode, tạo hoặc cập nhật `H5S/specs/<feature-id>/` theo [SPEC_WORKFLOW.md](SPEC_WORKFLOW.md).
4. **Khởi tạo Đội Agent:** Đọc `agent_team.json` để xác định thành phần đội và vai trò. Agent đầu tiên mặc định là **Leader**.
5. **Enforcement Gate:** Chạy `python H5S/scripts/h5s_guard.py preflight --mode standard --feature <feature-id>` trước khi sửa file.
6. **Xác minh & Đóng gói:** Yêu cầu chạy đầy đủ test cases và cập nhật kết quả vào bản đồ kiểm thử `docs/TEST_MATRIX.md` và `specs/<feature-id>/test-evidence.md`.
7. **Bàn giao:** Tạo hoặc cập nhật tệp tin `docs/session-handoff.md` để bàn giao phiên làm việc khi kết thúc.

### 2.B Khi không sử dụng `harness` (Chế độ Thông thường)
* Agent **bỏ qua** toàn bộ việc chạy `./init.sh` và không yêu cầu cập nhật các tài liệu trạng thái (`progress.md`, `feature_list.json`, `docs/TEST_MATRIX.md`, `docs/session-handoff.md`).
* Agent tập trung xử lý trực tiếp và nhanh chóng các yêu cầu cụ thể của người dùng (ví dụ: viết một hàm tiện ích, sửa lỗi giao diện, trả lời câu hỏi tìm hiểu code...).

---

## 👥 3. AGENT TEAM — ĐỘI AGENT CỘNG TÁC

Khi chạy ở chế độ `harness`, hệ thống hỗ trợ mô hình **Agent Team** — cho phép nhiều AI Agent cộng tác, phân vai và phối hợp trong một phiên làm việc.

### 3.A Kiến trúc đội

```text
                  ┌──────────────┐
                  │   LEADER     │  ← Phân tích, lập kế hoạch, phân công
                  │   (1 agent)  │
                  └──────┬───────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │  CODER   │   │ REVIEWER │   │  TESTER  │
   │ (1-3)    │   │  (1-2)   │   │  (1-2)   │
   └──────────┘   └──────────┘   └──────────┘
```

### 3.B Vai trò và trách nhiệm

| Vai Trò | Trách Nhiệm | Không Được Làm |
| :--- | :--- | :--- |
| 🟢 **Leader** | Phân tích yêu cầu, lập kế hoạch, phân công task, tổng hợp báo cáo, quản lý xung đột | Viết code trực tiếp |
| 🔵 **Coder** | Viết/sửa code, xử lý UI/UX, chạy verification | Thêm feature ngoài scope, refactor tiện tay |
| 🟡 **Reviewer** | Review code, phân loại bug (Critical/Important/Nit), kiểm tra security | Tự sửa code |
| 🟠 **Tester** | Viết test case, chạy test suite, cập nhật TEST_MATRIX.md | Xóa test để pass, suppress lỗi |

### 3.C Cấu hình đội

Thành phần đội được cấu hình tại [agent_team.json](agent_team.json). Tài liệu hướng dẫn chi tiết cho từng vai trò tại [docs/AGENT_TEAM.md](docs/AGENT_TEAM.md).

### 3.D Luồng phối hợp

1. **Leader** nhận yêu cầu → phân tích → lập kế hoạch → phân công.
2. **Coder** + **Tester** thực thi song song (nếu không conflict file).
3. **Reviewer** kiểm tra sau khi Coder hoàn thành.
4. **Leader** tổng hợp kết quả → cập nhật trạng thái → bàn giao.

### 3.E Quy tắc xung đột
- **Leader quyết định** khi có bất đồng kỹ thuật.
- **Không cho 2 Agent sửa cùng 1 file** cùng lúc. Xem [GIT_WORKTREE.md](docs/GIT_WORKTREE.md) để cách ly.
- **Escalation:** Nếu Leader không giải quyết được → dừng, hỏi người dùng.

---

## 📁 4. BẢN ĐỒ FILE TOÀN BỘ HỆ THỐNG

```text
<project-root>\H5S\
├── AGENTS.md                        ← 🔑 Entry point (Agent Shim)
├── RULE.md                          ← 📋 Quy tắc tối cao (~90 dòng, progressive disclosure)
├── agent_team.json                  ← 👥 Cấu hình đội Agent
├── feature_list.json                ← 📊 Registry feature
├── progress.md                      ← 📝 Nhật ký tiến độ
├── init.sh                          ← 🔧 Bootstrap script
├── scripts/
│   └── h5s_guard.py                  ← 🛡️ Guard check cho bootstrap/preflight/verify
├── specs/
│   ├── README.md                     ← 📁 Hướng dẫn feature spec
│   └── _template/                    ← 📄 Template spec/design/tasks/review/evidence
├── skills/                          ← ⚡ Skill Pack tái sử dụng
│   ├── spec/SKILL.md
│   ├── build/SKILL.md
│   ├── test/SKILL.md
│   └── review/SKILL.md
└── docs/
    ├── HARNESS.md                   ← 🏗️ File này
    ├── ARCHITECTURE.md              ← 🔒 Ranh giới kiến trúc
    ├── TEST_MATRIX.md               ← 🧪 Ma trận kiểm thử
    ├── SPEC_WORKFLOW.md             ← 📄 Feature artifact workflow
    ├── ENFORCEMENT.md               ← 🛡️ Guard script và hook integration
    ├── AGENT_TEAM.md                ← 👥 Hướng dẫn đội Agent
    ├── FEATURE_INTAKE.md            ← 📥 Phân loại rủi ro feature
    ├── CONTEXT_RULES.md             ← 🧠 Quản lý ngân sách token
    ├── ANTI_RATIONALIZATION.md      ← 🛡️ Bảng chống biện minh
    ├── AGENT_LOG.md                 ← 📖 Nhật ký quyết định
    ├── GIT_WORKTREE.md              ← 🌳 Hướng dẫn cách ly worktree
    ├── session-handoff.md           ← 🔄 Bàn giao phiên
    ├── RULES/                       ← 📐 Quy tắc kỹ thuật chi tiết
    │   ├── nextjs.md
    │   ├── prisma.md
    │   └── ui-ux.md
    └── templates/
        └── decision.md              ← 📄 Template ADR
```
