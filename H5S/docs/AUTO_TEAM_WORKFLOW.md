# H5S Auto Delegation Mode

Tài liệu này mô tả **Codex-Controlled Runner** cho mọi loại task: người dùng
chỉ nói chuyện với Codex Leader, còn Codex phân tích yêu cầu, chọn skill, giao
việc cho Antigravity qua `TEAM_MAILBOX.md` và `h5s_team_bus.py`.

Đây chưa phải full auto watcher. V1 giữ Codex làm Leader thật sự: Codex phân
tích, chọn `task_class`, chọn `risk`, chọn skill bằng
[SKILL_ROUTER.md](SKILL_ROUTER.md), dispatch Antigravity, collect report, review
diff/test rồi mới báo người dùng hoặc giao vòng fix tiếp.

## Mức 1: Codex Auto-Dispatch (Tự động kích hoạt ở mọi chế độ)

**Auto Delegation tự động kích hoạt mặc định ở MỌI chế độ (Quick, Standard, Full)**. Người dùng không cần gõ từ khóa kích hoạt thủ công, Codex Leader sẽ tự động chạy bus để giao việc và phân phối công việc cho Antigravity.


Codex Leader phải làm tuần tự:

1. Phân tích project và chọn skill bằng [SKILL_ROUTER.md](SKILL_ROUTER.md).
2. Ghi `MSG-xxx` hợp lệ vào `H5S/docs/TEAM_MAILBOX.md`.
3. Chạy dry-run để kiểm tra prompt:

   ```powershell
   python H5S\scripts\h5s_team_bus.py dispatch --task MSG-001
   ```

4. Nếu dry-run không báo lỗi, chạy dispatch thật:

   ```powershell
   python H5S\scripts\h5s_team_bus.py dispatch --task MSG-001 --execute --mode print --sandbox --dangerously-skip-permissions --print-timeout 30m0s
   ```

5. Collect reply:

   ```powershell
   python H5S\scripts\h5s_team_bus.py collect --task MSG-001
   ```

6. Codex tự review diff, log và verify command trước khi báo người dùng.

Codex không được yêu cầu người dùng tự chạy bus trừ khi CLI/tool bị lỗi môi
trường hoặc cần xác nhận rủi ro.

## Luồng Chuẩn

```text
User
  -> Codex Leader
  -> Codex phân tích project/spec/risk/skill
  -> Codex ghi MSG-xxx vào H5S/docs/TEAM_MAILBOX.md
  -> Codex chạy h5s_team_bus.py dispatch
  -> Antigravity làm worker
  -> h5s_team_bus.py ghi log và append REPLY-xxx
  -> Codex collect reply, review diff/test
  -> Codex báo user nếu đạt, hoặc tạo MSG tiếp theo nếu cần fix
```

## Khi Nào Dùng

Dùng Auto Delegation Mode khi:

- Người dùng giao task bất kỳ cho Codex Leader và task có thể tách thành phần
  worker rõ ràng.
- Codex cần tiết kiệm token bằng cách giao Antigravity làm worker.
- Chỉ một agent được sửa file tại một thời điểm.
- Task có `Task class`, `Risk`, `Worker role`, `Suggested skills`,
  `Files allowed`, `Do not touch`, `Acceptance`, `Verify` rõ ràng.

Không dùng khi:

- Hai agent cần sửa code song song. Khi đó dùng `GIT_WORKTREE.md`.
- Task chạm auth, payment, Prisma, database, security hoặc kiến trúc lớn mà
  chưa có quyết định rõ từ Codex.
- Chưa biết file nào được phép sửa.

## Lệnh Cho Codex Leader

Xem trạng thái mailbox:

```powershell
python H5S\scripts\h5s_team_bus.py status
```

Render prompt worker để kiểm tra trước:

```powershell
python H5S\scripts\h5s_team_bus.py prompt --task MSG-001
```

Dispatch khô, chỉ tạo prompt và in lệnh gợi ý:

```powershell
python H5S\scripts\h5s_team_bus.py dispatch --task MSG-001
```

Dispatch thật bằng Antigravity print mode:

```powershell
python H5S\scripts\h5s_team_bus.py dispatch --task MSG-001 --execute --mode print --sandbox --dangerously-skip-permissions --print-timeout 30m0s
```

Task `critical` bị chặn theo mặc định. Chỉ dùng override khi người dùng đã đồng
ý rõ:

```powershell
python H5S\scripts\h5s_team_bus.py dispatch --task MSG-001 --execute --allow-critical --mode print --sandbox --dangerously-skip-permissions --print-timeout 30m0s
```

Nếu `--print` không phù hợp cho task cần thao tác dài, dùng interactive mode:

```powershell
python H5S\scripts\h5s_team_bus.py dispatch --task MSG-001 --execute --mode interactive --sandbox --dangerously-skip-permissions
```

Collect reply cho Codex review:

```powershell
python H5S\scripts\h5s_team_bus.py collect --task MSG-001
```

Prompt và log được lưu ở:

```text
H5S/team_bus/prompts/
H5S/team_bus/runs/
```

## Quy Tắc Giao Task Cho Antigravity

Codex chỉ dispatch khi message có status `waiting` và đủ các phần:

```markdown
Task class: planning / frontend-ui / redesign / backend-api / security-hardening / document-extraction / debugging / testing / docs / research / fullstack
Risk: low / medium / high / critical
Worker role: UI/UX Designer / Frontend Coder / Coder / Tester / Docs Worker / Research Worker
Suggested skills: design-taste-frontend, test-driven-development
Codex review required: yes

Files allowed:
- path/to/file.tsx

Do not touch:
- auth / payment / Prisma / database / security unless explicitly listed
- unrelated files

Acceptance:
- observable result
- mobile 375px has no horizontal overflow

Verify:
- npm run lint
- npm run build
```

`h5s_team_bus.py dispatch` sẽ chặn tự động nếu thiếu các field/section trên,
nếu `Files allowed` chỉ là `none`/placeholder, hoặc nếu `Risk: critical` mà
không có `--allow-critical`.

Sau khi `dispatch --execute`:

- `MSG-xxx` chuyển sang `accepted`.
- Worker chạy xong thì chuyển sang `replied` hoặc `blocked`.
- Runner append `REPLY-xxx` vào `Inbox For Codex`.
- Codex đọc reply, kiểm tra diff, chạy verify cần thiết.

## Vòng Fix Có Kiểm Soát

Nếu Codex review thấy chưa đạt:

1. Không bảo user là xong.
2. Ghi finding rõ ràng.
3. Tạo `MSG-002` với phạm vi fix nhỏ hơn.
4. Dispatch Antigravity tiếp.
5. Lặp tối đa 2 vòng nếu user không cho phép nhiều hơn.

## Prompt Mẫu Cho User

Người dùng chỉ cần nói với Codex:

```text
harness

Làm tính năng bóc tách đề từ Word/PDF/TXT, tối ưu bảo mật và cập nhật giao diện.
Bạn là Codex Leader. Hãy tự phân tích project, chọn skill phù hợp bằng
H5S/docs/SKILL_ROUTER.md, chia task cho Antigravity bằng H5S Auto Delegation
Mode, review kết quả và chỉ báo mình khi đã có evidence.
```

Codex Leader tự làm phần còn lại.
