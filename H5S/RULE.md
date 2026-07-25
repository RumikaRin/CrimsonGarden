# Quy Chuẩn Lập Trình & Thiết Kế H5S (RULE.md)

Tài liệu này định nghĩa quy chuẩn vận hành và phát triển phần mềm dùng chung cho toàn bộ dự án H5S. Tất cả AI Agent bắt buộc phải tuân thủ. Chi tiết từng lĩnh vực được tách thành module riêng trong `docs/RULES/`.

---

## 1. CÁC NGUYÊN TẮC VẬN HÀNH CỐT LÕI

### 1.A Ngôn Ngữ Giao Tiếp & Code
*   **Giao tiếp:** **LUÔN LUÔN** trò chuyện, giải thích, lập kế hoạch và báo cáo bằng **Tiếng Việt**.
*   **Kỹ thuật:** Code, tên biến, lệnh terminal, git commits giữ nguyên bằng **Tiếng Anh**.

### 1.B Môi Trường Terminal & Dòng Lệnh
*   **Tuyệt đối không sử dụng** cấu trúc `cd /path && command`. Luôn thực thi từ thư mục gốc dự án.
*   **Cảnh báo an toàn:** Không chạy lệnh phá hủy (`rm -rf`, `git reset --hard`) mà không có sự đồng ý từ người dùng.

### 1.C Triết Lý Tối Giản (YAGNI & Simplicity First)
*   Chỉ sửa đổi đúng các file cần thiết liên quan trực tiếp đến yêu cầu.
*   Không tự ý tái cấu trúc (refactor) các vùng code xung quanh không liên quan.
*   **YAGNI:** Không viết logic dự phòng hoặc bổ sung tính năng chưa có trong đặc tả.

---

## 2. QUY TRÌNH LÀM VIỆC (SUPERPOWERS WORKFLOW)

| Câu Lệnh | Tên Bước | Nguyên Tắc Cốt Lõi |
| :--- | :--- | :--- |
| `harness` | Kích hoạt Harness | Chạy init.sh, đồng bộ trạng thái, khởi tạo đội Agent. |
| `/spec` | Định nghĩa đặc tả | Thiết kế đặc tả trước khi code. Phải làm rõ yêu cầu. |
| `/plan` | Lập kế hoạch | Chia nhỏ nhiệm vụ thành các task độc lập. |
| `/build` | Thực thi code | Lập trình từng lát cắt nhỏ, đi kèm TDD. |
| `/test` | Xác minh chất lượng | Mọi tính năng phải có kiểm thử đi kèm. |
| `/review` | Đánh giá lại | Chạy phân tích tĩnh, tối ưu hóa code. |
| `/code-simplify` | Tối giản hóa | Ưu tiên sự rõ ràng, dễ đọc. |
| `/ship` | Triển khai | Đóng gói và phát hành an toàn. |

> [!TIP]
> **Tự động hóa:** Lệnh `/build auto` cho phép AI tự động thực thi tuần tự, chỉ dừng khi gặp lỗi hoặc rủi ro cao.

> [!TIP]
> **Playbook thực chiến:** Khi cần biết cách phân chia phase làm việc, chọn skill nào trong `%USERPROFILE%\.agents\skills`,
> hoặc bật MCP nào trên Antigravity IDE, xem [docs/WORKFLOW_PLAYBOOK.md](docs/WORKFLOW_PLAYBOOK.md).

> [!TIP]
> **Chọn model tự động:** Gemini/Antigravity tự chọn model tier theo task, mode
> và risk bằng [docs/MODEL_ROUTER.md](docs/MODEL_ROUTER.md). Việc nhẹ dùng
> `fast`; security, auth, payment, DB migration hoặc final ship dùng
> `deep-review`.

> [!IMPORTANT]
> **Chống biện minh:** Trước khi bỏ qua bất kỳ bước nào, Agent phải đối chiếu với [ANTI_RATIONALIZATION.md](docs/ANTI_RATIONALIZATION.md).

---

## 3. QUY TẮC KỸ THUẬT CHUYÊN SÂU (PROGRESSIVE DISCLOSURE)

Chi tiết được tách thành module riêng — **chỉ đọc khi cần**:

| Module | Nội Dung | Khi Nào Đọc |
| :--- | :--- | :--- |
| [docs/RULES/nextjs.md](docs/RULES/nextjs.md) | Async APIs, RSC/RCC boundaries, Hydration | Khi viết/sửa Next.js component |
| [docs/RULES/prisma.md](docs/RULES/prisma.md) | Schema evolution, migration workflow | Khi thay đổi database schema |
| [docs/RULES/ui-ux.md](docs/RULES/ui-ux.md) | Anti-Slop, 3 trục dial, layout, a11y | Khi thiết kế/sửa giao diện |

---

## 4. TÍCH HỢP VỚI CÁC SKILLS BÊN NGOÀI

### 4.A Xử Lý Tài Liệu & Báo Cáo
*   Ưu tiên sử dụng các skill `xlsx`, `docx`, `pdf` để phân tích dữ liệu đầu vào hoặc xuất báo cáo.

### 4.B Tự Động Hóa Workflow Qua MCP & API
*   **`github` skill:** Tự động tạo pull request, thêm tag và yêu cầu review.
*   **`postgres` skill:** Kết nối an toàn để đọc cấu trúc bảng DB thực tế.
*   **Workflow playbook:** Xem [docs/WORKFLOW_PLAYBOOK.md](docs/WORKFLOW_PLAYBOOK.md) để biết cách phối hợp các phase vai trò, sử dụng skill local và MCP trên Antigravity IDE.
*   **Model router:** Xem [docs/MODEL_ROUTER.md](docs/MODEL_ROUTER.md) để Gemini/Antigravity tự chọn model theo task mà không cần hỏi lại.
*   **Optional tools:** Xem [docs/OPTIONAL_TOOLS.md](docs/OPTIONAL_TOOLS.md) để biết khi nào dùng Superpowers, Ponytail, Understand Anything, agentmemory, Serena, Context7, Playwright MCP hoặc các tool tham khảo khác. Không copy source tool ngoài vào dự án mới nếu chưa cần.

### 4.C Kiểm Thử Trước Khi Ship
*   Trước `/ship`, bắt buộc chạy:
    ```bash
    npm run check
    ```
    Pipeline: Linting → Typecheck → Test → Build. Bất kỳ lỗi nào → chặn phát hành.

---

## 5. QUY TRÌNH HỒI PHẢN & CHỐT AN TOÀN

*   **Git Safety Net:** Sau mỗi task pass test → `git add` + `git commit`.
*   **Retry Limit:** Mặc định tối đa **2 lần tự sửa**. Người dùng có thể cấu hình (3, 5, 10, hoặc vô hạn). Vượt giới hạn → dừng, báo cáo, yêu cầu can thiệp.
*   **Skeptical Evaluation:** Không tự coi test 100% hoàn hảo. Đối chiếu độc lập với acceptance criteria.
*   **Observability:** Ghi nhận quyết định quan trọng vào [AGENT_LOG.md](docs/AGENT_LOG.md).
