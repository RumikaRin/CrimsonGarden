#!/usr/bin/env python3
"""Codex-controlled runner for H5S team-agent handoffs.

The bus keeps Codex as the only user-facing leader. It reads task briefs from
TEAM_MAILBOX.md, builds a bounded worker prompt for Antigravity, optionally runs
the worker CLI, stores a log, and appends a reply for Codex to review.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import re
import shutil
import subprocess
import sys
from pathlib import Path


MESSAGE_RE = re.compile(
    r"(?ms)^### (?P<id>(?:MSG|REPLY)-\d+)\s*\n(?P<body>.*?)(?=^### |\n## |\Z)"
)
FIELD_RE = re.compile(r"(?m)^(?P<key>[A-Za-z][A-Za-z ]*):\s*(?P<value>.*)$")
STATUS_RE = re.compile(r"(?m)^Status:\s*.*$")
SECTION_RE = re.compile(r"(?ms)^%s:\s*\n(?P<body>.*?)(?=^[A-Za-z][A-Za-z /]*:\s*|\Z)")


class Message:
    def __init__(self, message_id: str, block: str, body: str) -> None:
        self.id = message_id
        self.block = block
        self.body = body
        self.fields = parse_fields(body)
        self.from_agent = self.fields.get("from", "")
        self.to = self.fields.get("to", "")
        self.role = self.fields.get("role", "")
        self.status = self.fields.get("status", "")
        self.task = self.fields.get("task", "")
        self.related = self.fields.get("related", "")
        self.task_class = self.fields.get("task class", "general")
        self.risk = self.fields.get("risk", "medium")
        self.worker_role = self.fields.get("worker role", self.role or "Worker")
        self.suggested_skills = self.fields.get("suggested skills", "none")
        self.codex_review_required = self.fields.get("codex review required", "yes")


class Mailbox:
    def __init__(self, messages: dict[str, Message], replies: dict[str, Message]) -> None:
        self.messages = messages
        self.replies = replies


def h5s_root() -> Path:
    return Path(__file__).resolve().parents[1]


def mailbox_path(root: Path | None = None) -> Path:
    base = root or h5s_root()
    return base / "docs" / "TEAM_MAILBOX.md"


def parse_fields(body: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    for match in FIELD_RE.finditer(body):
        fields[match.group("key").strip().lower()] = match.group("value").strip()
    return fields


def parse_mailbox(text: str) -> Mailbox:
    live_text = text.split("\n## Task Brief Template", 1)[0]
    messages: dict[str, Message] = {}
    replies: dict[str, Message] = {}
    for match in MESSAGE_RE.finditer(live_text):
        message_id = match.group("id").strip()
        block = match.group(0)
        body = match.group("body")
        message = Message(message_id, block, body)
        if message_id.startswith("MSG-"):
            messages[message_id] = message
        else:
            replies[message_id] = message
    return Mailbox(messages=messages, replies=replies)


def get_message(text: str, task_id: str) -> Message:
    mailbox = parse_mailbox(text)
    try:
        return mailbox.messages[task_id]
    except KeyError as exc:
        raise ValueError(f"Task {task_id} not found in TEAM_MAILBOX.md") from exc


def update_message_status(text: str, task_id: str, new_status: str) -> str:
    message = get_message(text, task_id)
    if not STATUS_RE.search(message.block):
        raise ValueError(f"Task {task_id} has no Status field")
    updated_block = STATUS_RE.sub(f"Status: {new_status}", message.block, count=1)
    return text.replace(message.block, updated_block, 1)


def reply_id_for_task(text: str, task_id: str) -> str:
    suffix = task_id.replace("MSG-", "", 1)
    preferred = f"REPLY-{suffix}"
    if f"### {preferred}" not in text:
        return preferred
    numbers = [int(num) for num in re.findall(r"^### REPLY-(\d+)", text, flags=re.M)]
    next_number = max(numbers or [0]) + 1
    return f"REPLY-{next_number:03d}"


def truncate_output(output: str, max_chars: int = 12000) -> str:
    clean = output.strip()
    if len(clean) <= max_chars:
        return clean
    omitted = len(clean) - max_chars
    return clean[:max_chars].rstrip() + f"\n\n[output truncated: {omitted} chars omitted]"


def append_worker_reply(
    text: str,
    task_id: str,
    worker: str,
    exit_code: int,
    output: str,
    log_path: str,
) -> str:
    reply_id = reply_id_for_task(text, task_id)
    status = "replied" if exit_code == 0 else "blocked"
    summary = "Worker finished successfully." if exit_code == 0 else "Worker stopped with an error."
    timestamp = _dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    body = f"""
### {reply_id}
From: {worker}
To: Codex Head
Status: {status}
Related: {task_id}

Summary:
- {summary}

Changed files:
- See worker output and git diff.

Verification:
- Worker exit code: {exit_code}
- Log: {log_path}

Worker output:
```text
{truncate_output(output) or "(no output)"}
```

Blockers:
- {"none" if exit_code == 0 else "Codex must inspect the log and decide the next step."}

Recorded: {timestamp}
"""
    marker = "\n## Task Brief Template"
    if marker in text:
        return text.replace(marker, "\n" + body.rstrip() + "\n" + marker, 1)
    return text.rstrip() + "\n\n" + body.rstrip() + "\n"


def build_worker_prompt(message: Message, worker: str, project_root: str) -> str:
    if worker.lower() != "antigravity":
        raise ValueError(f"Unsupported worker: {worker}")
    return f"""Bạn là Antigravity worker trong H5S Codex-Controlled Runner.

Codex Leader đã phân tích yêu cầu và giao task qua TEAM_MAILBOX. Nhiệm vụ của
bạn là làm đúng phạm vi task, dùng vai trò/skill được chỉ định, không tự mở
rộng scope, không sửa file ngoài phạm vi được giao và phải báo cáo lại cho
Codex Leader.

Project root:
{project_root}

Task ID:
{message.id}

Task title:
{message.task}

Task class:
{message.task_class}

Risk:
{message.risk}

Worker role:
{message.worker_role}

Suggested skills:
{message.suggested_skills}

Codex review required:
{message.codex_review_required}

Task brief từ TEAM_MAILBOX:
```markdown
### {message.id}
{message.body.strip()}
```

Quy tắc bắt buộc:
- Đọc `H5S/progress.md` và `H5S/docs/TEAM_MAILBOX.md` trước khi sửa.
- Claim `ACTIVE WRITER` trong `H5S/progress.md` trước khi edit.
- Dùng các skill được Codex Leader đề xuất trong `Suggested skills` nếu có.
- Chỉ sửa các file trong `Files allowed`.
- Tuyệt đối không sửa file ngoài phạm vi, auth, payment, Prisma, database,
  security hoặc kiến trúc lớn nếu task không liệt kê rõ.
- Nếu `Risk` là high/critical, ưu tiên phân tích, test và báo cáo bằng chứng;
  Codex Leader sẽ review trước khi báo user.
- Chạy các lệnh trong `Verify` nếu môi trường cho phép.
- Release `ACTIVE WRITER` khi hoàn thành.
- Trả lời cuối cùng theo đúng reply format: summary, changed files,
  verification output, blockers, notes theo task class.

Sau khi xong, không nói chuyện với user. Chỉ báo cáo cho Codex Leader.
"""


def write_prompt_file(root: Path, task_id: str, prompt: str) -> Path:
    prompt_dir = root / "team_bus" / "prompts"
    prompt_dir.mkdir(parents=True, exist_ok=True)
    path = prompt_dir / f"{task_id}-antigravity.prompt.md"
    path.write_text(prompt, encoding="utf-8")
    return path


def write_run_log(
    root: Path,
    task_id: str,
    command: list[str],
    exit_code: int,
    stdout: str,
    stderr: str,
) -> Path:
    run_dir = root / "team_bus" / "runs"
    run_dir.mkdir(parents=True, exist_ok=True)
    stamp = _dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    path = run_dir / f"{task_id}-antigravity-{stamp}.log"
    content = [
        f"Task: {task_id}",
        f"Command: {command!r}",
        f"Exit code: {exit_code}",
        "",
        "## STDOUT",
        stdout,
        "",
        "## STDERR",
        stderr,
        "",
    ]
    path.write_text("\n".join(content), encoding="utf-8")
    return path


def build_agy_command(args: argparse.Namespace, prompt: str) -> list[str]:
    agy = args.agy_command or shutil.which("agy") or shutil.which("agy.exe")
    if not agy:
        raise FileNotFoundError("Cannot find agy or agy.exe on PATH")

    command = [agy]
    if args.sandbox:
        command.append("--sandbox")
    if args.dangerously_skip_permissions:
        command.append("--dangerously-skip-permissions")
    if args.mode == "print":
        command.extend(["--print", "--print-timeout", args.print_timeout, prompt])
    elif args.mode == "interactive":
        command.extend(["--prompt-interactive", prompt])
    else:
        raise ValueError(f"Unsupported mode: {args.mode}")
    return command


def format_message_status(message: Message) -> str:
    return (
        f"{message.id}: {message.status} -> {message.to} :: {message.task} "
        f"[class={message.task_class}; risk={message.risk}; "
        f"role={message.worker_role}; skills={message.suggested_skills}]"
    )


def section_items(message: Message, section_name: str) -> list[str]:
    pattern = re.compile(
        rf"(?ms)^{re.escape(section_name)}:\s*\n(?P<body>.*?)(?=^[A-Za-z][A-Za-z /]*:\s*|\Z)"
    )
    match = pattern.search(message.body)
    if not match:
        return []
    items: list[str] = []
    for raw_line in match.group("body").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("-"):
            line = line[1:].strip()
        items.append(line)
    return items


def is_placeholder(value: str) -> bool:
    normalized = value.strip().lower()
    return (
        not normalized
        or normalized in {"none", "n/a", "na", "tbd", "todo", "<todo>", "<tbd>"}
        or "<" in normalized
        or ">" in normalized
    )


def validate_dispatch_ready(message: Message, allow_critical: bool = False) -> list[str]:
    errors: list[str] = []
    required_fields = [
        ("Task class", message.task_class),
        ("Risk", message.risk),
        ("Worker role", message.worker_role),
        ("Suggested skills", message.suggested_skills),
        ("Codex review required", message.codex_review_required),
    ]
    for label, value in required_fields:
        if is_placeholder(value):
            errors.append(f"Missing required field: {label}")

    if message.risk.strip().lower() == "critical" and not allow_critical:
        errors.append("Risk critical requires --allow-critical")

    required_sections = ["Files allowed", "Do not touch", "Acceptance", "Verify"]
    for section in required_sections:
        items = section_items(message, section)
        if not items:
            errors.append(f"Missing required section: {section}")
            continue
        if section == "Files allowed" and all(is_placeholder(item) for item in items):
            errors.append("Files allowed must list at least one concrete path")
        elif all(is_placeholder(item) for item in items):
            errors.append(f"{section} must not be placeholder-only")

    return errors


def cmd_status(args: argparse.Namespace) -> int:
    text = mailbox_path(args.h5s_root).read_text(encoding="utf-8")
    mailbox = parse_mailbox(text)
    for message in mailbox.messages.values():
        if message.status in {"waiting", "accepted", "blocked", "replied"}:
            print(format_message_status(message))
    return 0


def cmd_prompt(args: argparse.Namespace) -> int:
    root = args.h5s_root
    text = mailbox_path(root).read_text(encoding="utf-8")
    message = get_message(text, args.task)
    prompt = build_worker_prompt(message, worker=args.worker, project_root=str(args.project_root))
    prompt_path = write_prompt_file(root, args.task, prompt)
    print(prompt_path)
    return 0


def cmd_dispatch(args: argparse.Namespace) -> int:
    root = args.h5s_root
    path = mailbox_path(root)
    text = path.read_text(encoding="utf-8")
    message = get_message(text, args.task)

    if message.status != "waiting" and not args.force:
        raise ValueError(
            f"{args.task} status is {message.status!r}; expected 'waiting'. "
            "Use --force to dispatch anyway."
        )

    validation_errors = validate_dispatch_ready(
        message,
        allow_critical=args.allow_critical,
    )
    if validation_errors:
        joined = "\n- ".join(validation_errors)
        raise ValueError(f"{args.task} is not ready for dispatch:\n- {joined}")

    prompt = build_worker_prompt(message, worker=args.worker, project_root=str(args.project_root))
    prompt_path = write_prompt_file(root, args.task, prompt)
    print(f"Prompt written: {prompt_path}")

    if not args.execute:
        print("Dry-run only. Add --execute to run Antigravity.")
        print("Suggested command:")
        print(f"agy --print --print-timeout {args.print_timeout} \"<prompt from {prompt_path}>\"")
        return 0

    accepted_text = update_message_status(text, args.task, "accepted")
    path.write_text(accepted_text, encoding="utf-8")

    try:
        command = build_agy_command(args, prompt)
        completed = subprocess.run(
            command,
            cwd=args.project_root,
            text=True,
            capture_output=True,
            timeout=args.subprocess_timeout_seconds,
        )
        exit_code = completed.returncode
        stdout = completed.stdout
        stderr = completed.stderr
    except Exception as exc:  # noqa: BLE001 - CLI must capture worker startup failures.
        command = [args.agy_command or "agy", "<startup failed>"]
        exit_code = 1
        stdout = ""
        stderr = f"{type(exc).__name__}: {exc}"

    log_path = write_run_log(root, args.task, command, exit_code, stdout, stderr)
    latest_text = path.read_text(encoding="utf-8")
    next_status = "replied" if exit_code == 0 else "blocked"
    latest_text = update_message_status(latest_text, args.task, next_status)
    combined_output = (stdout + "\n" + stderr).strip()
    latest_text = append_worker_reply(
        latest_text,
        task_id=args.task,
        worker="Antigravity",
        exit_code=exit_code,
        output=combined_output,
        log_path=str(log_path.relative_to(root.parent)),
    )
    path.write_text(latest_text, encoding="utf-8")
    print(f"Worker exit code: {exit_code}")
    print(f"Log written: {log_path}")
    return exit_code


def cmd_collect(args: argparse.Namespace) -> int:
    text = mailbox_path(args.h5s_root).read_text(encoding="utf-8")
    mailbox = parse_mailbox(text)
    related = []
    for reply in mailbox.replies.values():
        if reply.related == args.task:
            related.append(reply)
    if not related:
        print(f"No replies found for {args.task}")
        return 1
    for reply in related:
        print(f"### {reply.id}")
        print(reply.body.strip())
        print()
    return 0


def build_parser() -> argparse.ArgumentParser:
    root = h5s_root()
    parser = argparse.ArgumentParser(description="H5S Codex-controlled team bus")
    parser.add_argument("--h5s-root", type=Path, default=root)
    parser.add_argument("--project-root", type=Path, default=root.parent)

    subparsers = parser.add_subparsers(dest="command", required=True)

    status = subparsers.add_parser("status", help="List active mailbox tasks")
    status.set_defaults(func=cmd_status)

    prompt = subparsers.add_parser("prompt", help="Render worker prompt for a task")
    prompt.add_argument("--task", required=True)
    prompt.add_argument("--worker", default="antigravity")
    prompt.set_defaults(func=cmd_prompt)

    dispatch = subparsers.add_parser("dispatch", help="Dispatch a task to Antigravity")
    dispatch.add_argument("--task", required=True)
    dispatch.add_argument("--worker", default="antigravity")
    dispatch.add_argument("--mode", choices=["print", "interactive"], default="print")
    dispatch.add_argument("--execute", action="store_true")
    dispatch.add_argument("--force", action="store_true")
    dispatch.add_argument("--allow-critical", action="store_true")
    dispatch.add_argument("--agy-command", default=None)
    dispatch.add_argument("--sandbox", action="store_true")
    dispatch.add_argument("--dangerously-skip-permissions", action="store_true")
    dispatch.add_argument("--print-timeout", default="30m0s")
    dispatch.add_argument("--subprocess-timeout-seconds", type=int, default=3600)
    dispatch.set_defaults(func=cmd_dispatch)

    collect = subparsers.add_parser("collect", help="Print replies for a task")
    collect.add_argument("--task", required=True)
    collect.set_defaults(func=cmd_collect)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except Exception as exc:  # noqa: BLE001 - user-facing CLI error boundary.
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
