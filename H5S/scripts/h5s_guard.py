#!/usr/bin/env python3
"""Lightweight guard checks for the H5S workflow."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


REQUIRED_CORE_PATHS = [
    "AGENTS.md",
    "RULE.md",
    "progress.md",
    "feature_list.json",
    "docs/FEATURE_INTAKE.md",
    "docs/TEST_MATRIX.md",
    "docs/SPEC_WORKFLOW.md",
    "docs/ENFORCEMENT.md",
    "scripts/h5s_guard.py",
    "specs/_template/spec.md",
    "specs/_template/tasks.md",
]

STANDARD_SPEC_FILES = ["spec.md", "tasks.md"]
FULL_SPEC_FILES = ["spec.md", "design.md", "tasks.md", "review.md", "test-evidence.md"]


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)

    def print(self) -> None:
        for warning in self.warnings:
            print(f"[WARN] {warning}")
        for error in self.errors:
            print(f"[FAIL] {error}")
        if not self.errors:
            print("[OK] H5S guard checks passed.")

    def exit_code(self) -> int:
        return 1 if self.errors else 0


def find_h5s_root(start: Path) -> Path:
    start = start.resolve()
    candidates = [start, *start.parents]
    for candidate in candidates:
        if candidate.name == "H5S" and (candidate / "AGENTS.md").exists():
            return candidate
        nested = candidate / "H5S"
        if (nested / "AGENTS.md").exists():
            return nested
    raise SystemExit("[FAIL] Could not find H5S root from current directory.")


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def bootstrap(report: Report, h5s: Path) -> None:
    for relative in REQUIRED_CORE_PATHS:
        path = h5s / relative
        if not path.exists():
            report.error(f"Missing required H5S path: {relative}")


def parse_active_writer(progress_text: str) -> dict[str, str]:
    match = re.search(r"## ACTIVE WRITER(?P<body>.*?)(?:\n---|\n## |\Z)", progress_text, re.S)
    if not match:
        return {}
    body = match.group("body")
    values: dict[str, str] = {}
    current_key: str | None = None
    file_claims: list[str] = []
    for raw_line in body.splitlines():
        line = raw_line.strip()
        key_match = re.match(r"[-*]\s+\*\*\s*([^:*]+)\s*:\*\*\s*(.*)", line)
        if key_match:
            current_key = key_match.group(1).strip().lower()
            values[current_key] = key_match.group(2).strip()
            continue
        if current_key == "files claimed" and line.startswith("- "):
            file_claims.append(line[2:].strip())
    if file_claims:
        values["files claimed"] = ", ".join(file_claims)
    return values


def current_feature_from_progress(progress_text: str) -> str | None:
    match = re.search(r"\*\*\s*Task ID/Feature ID\s*:\*\*\s*`?([^`\n]+)`?", progress_text)
    if not match:
        return None
    value = match.group(1).strip()
    if not value or value.upper() == "UNASSIGNED":
        return None
    return value


def require_spec_files(report: Report, h5s: Path, mode: str, feature: str) -> None:
    if mode == "quick":
        return

    spec_dir = h5s / "specs" / feature
    if not spec_dir.exists():
        report.error(f"Missing feature spec folder: specs/{feature}")
        return

    required = FULL_SPEC_FILES if mode == "full" else STANDARD_SPEC_FILES
    for filename in required:
        if not (spec_dir / filename).exists():
            report.error(f"Missing {mode} spec file: specs/{feature}/{filename}")


def preflight(report: Report, h5s: Path, args: argparse.Namespace) -> None:
    bootstrap(report, h5s)
    progress_path = h5s / "progress.md"
    progress_text = read_text(progress_path) if progress_path.exists() else ""
    active_writer = parse_active_writer(progress_text)
    if not active_writer:
        report.error("progress.md is missing the ACTIVE WRITER block.")
    elif args.require_active_writer:
        status = active_writer.get("status", "").lower()
        files = active_writer.get("files claimed", "").lower()
        if status != "editing":
            report.error("ACTIVE WRITER must have Status: editing before file edits.")
        if files in {"", "none"}:
            report.error("ACTIVE WRITER must list Files claimed before file edits.")

    feature = args.feature or current_feature_from_progress(progress_text)
    if args.mode != "quick" and not feature:
        report.error("Feature ID is required for Standard/Full mode.")
        return
    if feature:
        require_spec_files(report, h5s, args.mode, feature)


def matrix_line_for_feature(matrix_text: str, feature: str) -> str | None:
    for line in matrix_text.splitlines():
        if feature in line and "|" in line:
            return line
    return None


def verify(report: Report, h5s: Path, args: argparse.Namespace) -> None:
    bootstrap(report, h5s)
    progress_path = h5s / "progress.md"
    progress_text = read_text(progress_path) if progress_path.exists() else ""
    feature = args.feature or current_feature_from_progress(progress_text)
    if not feature:
        report.error("Feature ID is required for verify.")
        return

    matrix_path = h5s / "docs" / "TEST_MATRIX.md"
    matrix_text = read_text(matrix_path) if matrix_path.exists() else ""
    line = matrix_line_for_feature(matrix_text, feature)
    if not line:
        report.error(f"TEST_MATRIX.md has no row for {feature}.")
    elif "Pending" in line:
        report.error(f"TEST_MATRIX.md row for {feature} is still Pending.")

    if args.mode != "quick":
        evidence_path = h5s / "specs" / feature / "test-evidence.md"
        if not evidence_path.exists():
            report.error(f"Missing test evidence file: specs/{feature}/test-evidence.md")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="H5S workflow guard checks")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("bootstrap", help="Check H5S core files exist")

    preflight_parser = subparsers.add_parser("preflight", help="Check before editing files")
    preflight_parser.add_argument("--mode", choices=["quick", "standard", "full"], default="standard")
    preflight_parser.add_argument("--feature")
    preflight_parser.add_argument("--require-active-writer", action="store_true")

    verify_parser = subparsers.add_parser("verify", help="Check before closing/shipping")
    verify_parser.add_argument("--mode", choices=["quick", "standard", "full"], default="standard")
    verify_parser.add_argument("--feature")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    h5s = find_h5s_root(Path.cwd())
    report = Report()

    if args.command == "bootstrap":
        bootstrap(report, h5s)
    elif args.command == "preflight":
        preflight(report, h5s, args)
    elif args.command == "verify":
        verify(report, h5s, args)
    else:
        parser.error(f"Unknown command: {args.command}")

    report.print()
    return report.exit_code()


if __name__ == "__main__":
    sys.exit(main())
