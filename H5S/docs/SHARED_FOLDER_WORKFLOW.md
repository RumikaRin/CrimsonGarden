# Shared Folder Workflow: Codex + Antigravity

This document defines how Codex and Antigravity can work in the same repository
checkout without using separate git worktrees.

## 1. When To Use This Mode

Use shared-folder mode when:
- Codex is acting as Leader or Reviewer.
- Antigravity is acting as an assigned worker: UI/UX Designer, Frontend Coder,
  Coder, Tester, Docs Worker, Research Worker, or UI QA.
- Only one agent needs to write code at a time.

Do not use shared-folder mode for two simultaneous coding agents. If two agents
must edit code in parallel, use `docs/GIT_WORKTREE.md`.

## 2. Source Of Truth

The shared coordination files are:
- `progress.md` for active writer, current task, and short worklog.
- `specs/<feature-id>/` for feature scope, tasks, review, and evidence.
- `docs/TEAM_MAILBOX.md` for Codex-to-Antigravity task briefs and replies.
- `docs/session-handoff.md` for longer handoff between sessions.
- `docs/AGENT_LOG.md` for important decisions.
- `docs/ENFORCEMENT.md` for guard commands and hook integration.

Codex and Antigravity must read `progress.md` before starting any write
operation. When work is delegated across CLIs, they should also read
`docs/TEAM_MAILBOX.md`.

## 3. Active Writer Protocol

Add this block near the top of `progress.md` before editing files:

```markdown
## ACTIVE WRITER
- **Agent:** Codex / Antigravity
- **Role:** Leader / Coder / Reviewer / Tester / UI-UX
- **Task:** <short task>
- **Files claimed:**
  - path/to/file
- **Started:** YYYY-MM-DD HH:MM
- **Status:** editing
```

Rules:
- Only one active writer may have `Status: editing`.
- Reviewer and UI/UX may read while another writer is active, but must not edit.
- Tester may run read-only checks while another writer is active. If Tester needs
  to edit tests or `TEST_MATRIX.md`, Tester must claim the active writer slot.
- Leader resolves conflicts and decides who writes next.

When finished, change the block to:

```markdown
## ACTIVE WRITER
- **Agent:** none
- **Role:** none
- **Task:** none
- **Files claimed:** none
- **Started:** none
- **Status:** free
```

Then add a short worklog entry below the existing worklog.

Before editing files in Standard/Full mode, the active writer runs:

```bash
python H5S/scripts/h5s_guard.py preflight --mode standard --feature <feature-id> --require-active-writer
```

If the command fails, stop and ask the Leader to fix scope, spec folder, or
active-writer state before editing.

## 4. Recommended Terminal Layout

Open both CLIs from the same repository root:

```powershell
cd "D:\Path\To\NewProject"
```

Terminal 1: Codex Head / Leader

```powershell
codex -m gpt-5.5
```

Terminal 2: Antigravity UI/UX + Frontend Coder

```powershell
agy
```

Windows Terminal split-pane command for PowerShell:

```powershell
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "codex -m gpt-5.5" ';' split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy"
```

Windows Terminal split-pane command for CMD:

```bat
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "codex -m gpt-5.5" ; split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy"
```

Auto approve có sandbox, nên dùng khi workspace đã tin cậy:

```powershell
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "codex -m gpt-5.5 -a never -s workspace-write" ';' split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy --sandbox --dangerously-skip-permissions"
```

CMD:

```bat
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "codex -m gpt-5.5 -a never -s workspace-write" ; split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy --sandbox --dangerously-skip-permissions"
```

Auto approve + bỏ sandbox, chỉ dùng khi chấp nhận rủi ro:

```powershell
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "codex -m gpt-5.5 --dangerously-bypass-approvals-and-sandbox" ';' split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy --dangerously-skip-permissions"
```

CMD:

```bat
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "codex -m gpt-5.5 --dangerously-bypass-approvals-and-sandbox" ; split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy --dangerously-skip-permissions"
```

Ví dụ cho project thật:

```powershell
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "codex -m gpt-5.5 -a never -s workspace-write" ';' split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy --sandbox --dangerously-skip-permissions"
```

CMD:

```bat
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "codex -m gpt-5.5 -a never -s workspace-write" ; split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy --sandbox --dangerously-skip-permissions"
```

If the WindowsApps `codex` shim fails with `Access is denied`, find the
installed Codex binary path and replace `<CODEX_EXE>`:

```powershell
Get-Command codex -ErrorAction SilentlyContinue
Get-ChildItem "$env:LOCALAPPDATA\OpenAI\Codex\bin" -Recurse -Filter codex.exe |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 -ExpandProperty FullName
```

```powershell
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "& '<CODEX_EXE>' -m gpt-5.5 -a never -s workspace-write" ';' split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy --sandbox --dangerously-skip-permissions"
```

CMD:

```bat
wt -d "D:\Path\To\NewProject" powershell -NoExit -Command "& '<CODEX_EXE>' -m gpt-5.5 -a never -s workspace-write" ; split-pane -H -d "D:\Path\To\NewProject" powershell -NoExit -Command "agy --sandbox --dangerously-skip-permissions"
```

## 5. Startup Prompts

Codex prompt:

```text
harness

You are the H5S Leader. Read AGENTS.md and
H5S/docs/WORKFLOW_PLAYBOOK.md, H5S/docs/SHARED_FOLDER_WORKFLOW.md, and
H5S/docs/TEAM_MAILBOX.md.
Before reading more docs, choose Quick, Standard, or Full mode.
Use H5S/progress.md as the shared coordination board.
Use H5S/docs/SKILL_ROUTER.md to choose skills, then use
H5S/docs/TEAM_MAILBOX.md to delegate bounded worker tasks to Antigravity.
Do not write code directly unless the task is high-risk, blocked, or explicitly
assigned to Codex. Plan, assign, review, and keep the active writer protocol
clean.
```

Antigravity prompt:

```text
You are Antigravity in the H5S shared-folder workflow.
Read ANTIGRAVITY.md, H5S/docs/WORKFLOW_PLAYBOOK.md,
H5S/docs/SHARED_FOLDER_WORKFLOW.md, H5S/docs/SKILL_ROUTER.md, and
H5S/docs/TEAM_MAILBOX.md.
Default role: assigned worker. Read Task class, Risk, Worker role, Suggested
skills, Files allowed, Do not touch, Acceptance, and Verify before acting.
Do not edit files unless Codex Leader assigns you as active writer in
H5S/progress.md or sends a task in H5S/docs/TEAM_MAILBOX.md with files allowed.
```

## 6. Good Shared-Folder Flow

1. User gives feature request.
2. Codex Head creates or updates `specs/<feature-id>/spec.md` and `tasks.md`.
3. Codex Head writes a short plan and task brief.
4. Codex adds the task to `docs/TEAM_MAILBOX.md` with files allowed,
   acceptance criteria, verify command, and do-not-touch list.
5. Antigravity reads the mailbox, optionally produces UI/UX notes, then claims
   active writer in `progress.md`.
6. Antigravity runs `h5s_guard.py preflight --require-active-writer`.
7. Antigravity edits only claimed files, verifies, releases the slot, and replies
   in `docs/TEAM_MAILBOX.md`.
8. Codex reads the reply and diff, reviews risks, and either closes the task or
   sends a follow-up message.
9. Reviewer and Tester run checks when needed.
10. Codex Leader updates `TEST_MATRIX.md`, `test-evidence.md`, and handoff if
    needed.

## 6.5 Token-Saving Delegation Rules

Use this split by default:

| Work type | Default owner |
| :--- | :--- |
| Requirement intake, risk, architecture decision | Codex |
| UI/UX audit, visual direction, responsive notes | Antigravity |
| Frontend component/page implementation | Antigravity |
| Styling, spacing, animation polish | Antigravity |
| Auth, payment, Prisma, database, security | Codex or Codex-approved task |
| Final diff review and ship decision | Codex |

Codex should send concise briefs instead of pasting long code context into chat.
Antigravity should read the local files itself and report changed files back.

## 7. Visual QA Trong CLI

Khi chạy trong CLI, không phụ thuộc browser plugin của Codex app. Mặc định dùng
Playwright local làm đường kiểm tra giao diện:

```powershell
npx playwright open http://localhost:3000
npx playwright codegen http://localhost:3000
npx playwright test --headed
```

Nếu browser plugin của Codex app có sẵn, có thể dùng như bề mặt kiểm tra
optional. Nếu plugin fail, fallback sang Playwright headed/screenshot hoặc HTTP
smoke test và báo rõ đường dẫn evidence.

## 8. Conflict Recovery

If both agents edited at the same time:
- Stop both agents.
- Run `git status --short`.
- Use `git diff -- <file>` to inspect overlapping changes.
- Leader decides which change to keep.
- Do not run reset or checkout commands without user approval.
