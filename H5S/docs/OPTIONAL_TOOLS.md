# Optional Tools For H5S

File này liệt kê các tool/skill ngoài H5S có thể bật khi phù hợp. Không copy
source của các tool này vào từng dự án mới; hãy cài ở tầng CLI/plugin hoặc dùng
checkout local đã clone sẵn.

## Local Checkouts

Các repo phụ trợ đã được clone vào ổ D:

| Tool | Local path | Upstream |
| :--- | :--- | :--- |
| Ponytail | `D:\ProjectZ\ponytail` | `https://github.com/DietrichGebert/ponytail` |
| Understand Anything | `D:\ProjectZ\Understand-Anything` | `https://github.com/Egonex-AI/Understand-Anything` |

Các repo/MCP dưới đây nên cài ở tầng CLI/plugin/MCP server khi cần. Không copy
source của chúng vào từng dự án mới.

## 1. Ponytail

### Khi Nào Dùng

Dùng Ponytail khi agent chuẩn bị viết code, review code, hoặc tối giản code:
- `/build`
- `/code-simplify`
- `/review`
- Coder muốn thêm dependency mới.
- Reviewer thấy code có dấu hiệu over-engineering.

### Nguyên Tắc

Ponytail không thay H5S. H5S vẫn là source of truth cho role, progress, active
writer, test matrix và handoff. Ponytail chỉ là discipline phụ để giữ code nhỏ:
- Không viết code nếu yêu cầu không thật sự cần.
- Reuse codebase trước.
- Dùng stdlib/native platform trước.
- Dùng dependency đã có trước khi thêm dependency mới.
- Chỉ viết minimum code đủ đúng, không cắt validation/security/a11y.

### Cài Cho CLI

Antigravity CLI:

```powershell
agy plugin install https://github.com/DietrichGebert/ponytail
```

Sau đó mở Antigravity CLI, vào `/plugins` để xác nhận plugin đã được kích hoạt.
Nếu plugin chưa bật được, Leader có thể thêm vào brief:

```text
Áp dụng Ponytail: reuse trước, native/stdlib trước, dependency có sẵn trước,
chỉ viết minimum code cần thiết, không bỏ validation/security/a11y.
```

## 2. Understand Anything

### Khi Nào Dùng

Dùng Understand Anything cho codebase lớn hoặc khi cần hiểu kiến trúc:
- Onboarding dự án mới có nhiều file.
- Trước khi viết/sửa `H5S/docs/ARCHITECTURE.md`.
- Trước feature L/XL trong `FEATURE_INTAKE.md`.
- Trước review/ship khi cần phân tích ảnh hưởng diff.
- Khi Coder/Reviewer chưa chắc flow nghiệp vụ nằm ở đâu.

Không chạy mặc định cho task nhỏ vì lần đầu `/understand` có thể tốn nhiều
token và sinh thư mục `.understand-anything/`.

### Cài Cho CLI

Từ checkout local ở ổ D, set `UA_DIR` để installer dùng đúng repo đã clone:

```powershell
$env:UA_DIR = "D:\ProjectZ\Understand-Anything"
& "D:\ProjectZ\Understand-Anything\install.ps1"
```

Hoặc cài theo platform cụ thể:

```powershell
$env:UA_DIR = "D:\ProjectZ\Understand-Anything"
& "D:\ProjectZ\Understand-Anything\install.ps1" antigravity
Remove-Item Env:\UA_DIR
```

Nếu dùng command remote chính thức:

```powershell
iwr -useb https://raw.githubusercontent.com/Egonex-AI/Understand-Anything/main/install.ps1 | iex
```

### Lệnh Dùng Trong Phiên Agent

```text
/understand
/understand-dashboard
/understand-chat <câu hỏi về codebase>
/understand-diff
/understand-explain <path>
/understand-onboard
/understand-domain
```

### Quy Tắc Lưu Artifact

Understand Anything tạo `.understand-anything/`. Chỉ commit khi Leader quyết
định graph hữu ích cho cả team. Nếu commit graph, bỏ qua scratch files:

```gitignore
.understand-anything/intermediate/
.understand-anything/diff-overlay.json
```

## 3. agentmemory

Upstream: `https://github.com/rohitg00/agentmemory`

### Khi Nào Dùng

Dùng agentmemory khi dự án kéo dài nhiều phiên hoặc có nhiều agent cùng làm:
- Lưu quyết định kiến trúc, naming, design preference, business rule.
- Nhắc lại những điều dễ lặp lỗi trong các phiên làm việc trước.
- Tìm lại context cũ bằng semantic search.
- Tách memory theo project thay vì nhét hết vào prompt.

Không dùng agentmemory để thay `H5S/progress.md`. H5S vẫn là bảng trạng thái
ngắn hạn, active writer, test evidence và handoff bắt buộc.

### Cách Bật Trong Workflow

Ở đầu phiên dài, Leader có thể thêm brief:

```text
Nếu agentmemory MCP khả dụng, hãy đọc memory liên quan tới project này trước khi
lập kế hoạch. Sau khi có quyết định quan trọng, lưu memory ngắn gọn: quyết định,
lý do, file liên quan, ngày.
```

Trên Windows, kiểm tra README chính thức trước khi cài vì hỗ trợ native Windows
có thể thay đổi. Nếu hướng dẫn hiện tại khuyến nghị WSL2, dùng WSL2 cho memory
server thay vì cố ép chạy native.

### Quy Tắc Lưu Memory

Memory nên ngắn, có ích để tái dùng:
- `Decision: dùng Prisma migration thay vì db push cho production-like schema.`
- `Preference: UI dashboard ưu tiên density, không dùng marketing hero.`
- `Gotcha: Next.js version này có breaking changes, đọc node_modules/next/dist/docs trước.`

Không lưu secrets, token, credentials, private keys, hoặc dữ liệu người dùng nhạy cảm.

## 4. revfactory/harness

Upstream: `https://github.com/revfactory/harness`

### Kết Luận Cho H5S

Không nên tích hợp nguyên repo này vào H5S core vì nó thiên về hệ sinh thái
Claude và tạo các artifact như `.claude/agents`, `.claude/skills`,
`.claude/commands`, `.mcp.json`.

Nên lấy cảm hứng từ các pattern điều phối:
- `Pipeline`: spec -> design -> code -> test -> review.
- `Fan-out/Fan-in`: chia nhiều nhánh độc lập, Leader gom kết quả.
- `Expert Pool`: nhiều agent phân tích cùng một vấn đề, Leader chốt.
- `Producer-Reviewer`: một agent làm, một agent review.
- `Supervisor`: Leader giữ roadmap, risk, handoff.
- `Hierarchical Delegation`: epic lớn tách thành sub-feature.

Các pattern này đã được đưa vào [WORKFLOW_PLAYBOOK.md](WORKFLOW_PLAYBOOK.md) ở
phần Team Pattern Picker.

## 5. Serena

Upstream: `https://github.com/oraios/serena`

### Khi Nào Dùng

Dùng Serena khi cần code intelligence sâu:
- Tìm symbol, references, call graph trong codebase lớn.
- Refactor theo symbol thay vì grep text thô.
- Cho agent hiểu cấu trúc code trước khi sửa nhiều file.
- Hỗ trợ Coder/Reviewer khi feature L/XL chạm nhiều module.

Serena rất hợp làm MCP mặc định cho fullstack nếu project đủ lớn. Với task nhỏ,
đọc file bằng `rg`/editor vẫn nhanh hơn.

### Prompt Mẫu

```text
Nếu Serena MCP khả dụng, dùng symbol search để tìm entrypoint, references và
call graph trước khi sửa. Báo lại file/symbol chính trước khi implement.
```

## 6. Context7

Upstream: `https://github.com/upstash/context7`

### Khi Nào Dùng

Dùng Context7 khi cần docs đúng version hoặc thư viện có API hay đổi:
- Next.js, React, Prisma, Auth, Stripe, Tailwind, Playwright.
- Trước khi dùng API mà model có thể nhớ sai.
- Khi lỗi build/typecheck do API đổi.

Context7 nên là MCP ưu tiên cho docs. Với Next.js trong template này, vẫn phải
đọc thêm `node_modules/next/dist/docs/` khi viết code vì project có thể dùng bản
Next.js khác với kiến thức mặc định của model.

### Prompt Mẫu

```text
Dùng Context7 để kiểm tra docs chính xác của <library> trước khi code. Nếu là
Next.js, đọc thêm node_modules/next/dist/docs/ liên quan tới API đang sửa.
```

## 7. Playwright MCP

Upstream: `https://github.com/microsoft/playwright-mcp`

### Khi Nào Dùng

Dùng Playwright MCP cho UI QA và browser automation:
- Mở app local, click flow chính, kiểm tra state.
- Chụp screenshot desktop/mobile.
- Kiểm tra text overlap, layout vỡ, form state, navigation.
- Dùng accessibility snapshot để test theo cấu trúc trang thay vì chỉ nhìn ảnh.

Nên bật sau khi Coder đã chạy được dev server. Không dùng Playwright MCP để thay
unit test hoặc integration test.

### Prompt Mẫu

```text
Dùng Playwright MCP kiểm tra flow UI sau khi app chạy local. Chụp desktop và
mobile, kiểm tra text overlap, responsive, keyboard/a11y cơ bản, rồi báo finding.
```

## 8. Archon

Upstream: `https://github.com/coleam00/Archon`

### Khi Nào Dùng

Archon phù hợp để tham khảo khi muốn xây hệ agent/knowledge/task management lớn
hơn H5S:
- Cần project knowledge base riêng.
- Cần task orchestration có dashboard.
- Cần prototype một agent platform riêng.

Không nên bật mặc định trong H5S template vì nặng hơn nhu cầu thường ngày. Dùng
sau khi workflow H5S đã ổn và dự án thật sự cần hệ điều phối riêng.

## 9. MCP Server References

Upstream tham khảo: `https://github.com/modelcontextprotocol/servers`

Repo này hữu ích để xem server MCP phổ biến và cách cấu hình, nhưng không nên
clone/copy toàn bộ vào project. Chỉ chọn server đúng nhu cầu:
- GitHub MCP cho issue/PR/review automation.
- Filesystem MCP chỉ khi cần scope folder rõ ràng.
- Database MCP chỉ bật read-only hoặc quyền tối thiểu.
- Browser/Playwright MCP cho UI QA.

## 10. Stack Khuyến Nghị Cho Fullstack

### Nhẹ, dùng hằng ngày

1. H5S core.
2. Context7 cho docs.
3. Playwright MCP cho UI QA khi có frontend.
4. Ponytail khi build/review để giữ code nhỏ.

### Dự án lớn hoặc nhiều agent

1. H5S core.
2. Serena cho code intelligence.
3. Context7 cho docs.
4. Playwright MCP cho UI QA.
5. agentmemory cho memory dài hạn.
6. Understand Anything khi onboarding hoặc phân tích kiến trúc.

### Chỉ thử sau

- Kage hoặc memory repo tương tự: chỉ dùng khi đã xác nhận repo/installer chính
  xác và thấy phù hợp hơn agentmemory.
- Archon: dùng khi muốn agent platform riêng, không phải workflow nhẹ.
- revfactory/harness: dùng làm reference pattern, không thay H5S.

## 11. Thứ Tự Ưu Tiên Với H5S

1. `H5S/RULE.md` và yêu cầu người dùng.
2. `H5S/progress.md`, `feature_list.json`, `ACTIVE WRITER`.
3. [WORKFLOW_PLAYBOOK.md](WORKFLOW_PLAYBOOK.md) khi cần phối hợp các phase vai trò, skills và MCP trên Antigravity IDE.
4. Superpowers/local skills nếu task cần process skill.
5. Ponytail khi viết/review/tối giản code.
6. Serena/Context7/Playwright MCP khi cần code intelligence, docs hoặc UI QA.
7. agentmemory khi cần memory dài hạn.
8. Understand Anything khi cần hiểu codebase hoặc phân tích ảnh hưởng.

Nếu tool ngoài gây xung đột với H5S, H5S thắng.
