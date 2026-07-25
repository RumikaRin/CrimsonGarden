# DOC-EXTRACTION Spec

## Goal

Tối ưu bóc tách đề để hỗ trợ ổn định file Word, TXT và PDF, đồng thời chuẩn hóa đầu ra thành `Exam` dùng được ngay trong app và lưu được qua Prisma khi database sẵn sàng.

Codex giữ vai trò Head/Leader trong planning. Khi sửa upload/parser/backend, Codex phải chuyển rõ sang Coder vì track này chạm file upload, child process, temp file và AI fallback.

## Context

- Project/module liên quan:
  - UI upload: `src/components/UploadAutoGenerate.tsx`.
  - API generation: `src/pages/api/generate-exam.ts`.
  - Local PDF parser: `src/lib/pdf_parser.py`.
  - Local DOCX parser: `src/lib/docx_parser.py`.
  - Shared exam shape: `src/types.ts`, Prisma `Exam`, `Question`, `Answer`.
- Current behavior:
  - UI accepts `.csv,.txt,.pdf,.png,.jpg,.jpeg,.json`.
  - UI text says Word support but currently maps Word-like content to `.txt`; `.docx` is not accepted in the file input.
  - `docx_parser.py` exists but is not wired into `generate-exam.ts`.
  - `generate-exam.ts` handles PDF via local Python parser when not on Vercel, else Gemini fallback; non-PDF binary inputs go to Gemini.
  - Server body parser allows `50mb`; response limit is `200mb`.
  - Local parser writes to `temp_uploads` and runs Python through shell command strings.
  - `pdf_parser.py` contains a hard-coded Q162/Q163 image swap and many heuristics without fixture tests.
- Desired behavior:
  - Word `.docx`, TXT, CSV, PDF, image and JSON ingestion have explicit routing and validation.
  - Parser output is normalized and validated before persistence.
  - Local parsers are deterministic where possible; AI is a fallback or enhancement with clear errors.
  - Upload handling is bounded, path-safe and test-covered.

## Scope

In scope:
- Add `.docx` support in UI and server pipeline.
- Move TXT/CSV parsing toward shared tested parsing logic or ensure server validates client-parsed exams.
- Add a parser router that chooses DOCX, TXT, CSV, PDF, JSON, image or Gemini fallback by MIME and extension.
- Replace shell-based Python execution with safer process execution and isolated temp directories.
- Normalize parser output into a strict `ParsedExam` contract before creating IDs and saving.
- Add confidence/error metadata where parser output is incomplete.
- Add fixtures and tests for TXT, CSV, DOCX and PDF parsing behavior.
- Remove or replace hard-coded PDF question-specific fixes.
- Keep file upload security requirements aligned with `SECURITY-HARDENING`.

Out of scope:
- Full OCR for scanned PDFs unless Gemini/image fallback already covers it.
- Legacy `.doc` binary Word format unless user approves a converter dependency.
- Rewriting the whole exam UI.
- Changing scoring, quiz taking behavior or leaderboard logic.
- Production email or auth changes, which belong to `SECURITY-HARDENING`.

## Acceptance Criteria

- [ ] Upload UI accepts `.docx`, `.txt`, `.csv`, `.pdf`, `.png`, `.jpg`, `.jpeg`, `.json` with accurate visible copy.
- [ ] Server rejects unsupported MIME/extension combinations and files over the approved limit with 400.
- [ ] DOCX files are parsed through `src/lib/docx_parser.py` or an approved TypeScript parser path.
- [ ] TXT parser supports current sample format and returns clear errors for malformed files.
- [ ] PDF parser has no question-number-specific hard-coded swap logic.
- [ ] Parsed output is normalized so every valid question has content, 2-4+ answers, exactly one correct answer unless explicitly allowed, points and explanation defaults.
- [ ] Temp files are created in an isolated directory and cleaned up on success/failure.
- [ ] AI fallback errors are actionable and do not silently save low-quality empty exams.
- [ ] Parser fixture tests cover at least one valid TXT, one malformed TXT, one DOCX fixture and one PDF fixture or mocked PDF parser.
- [ ] Verification command được ghi trong `test-evidence.md`.

## Risk

- Size: L
- Risk: high
- Sensitive areas: file upload, child process, temp files, AI API usage, user data, database writes
- User approval required: yes, before adding new parser dependencies or changing upload size limits materially
- Model decision:
  - mode: Full
  - task_class: backend/file parsing
  - risk: high
  - tier: strong for implementation, deep-review for upload/security review
  - note: CLI hiện tại không đổi model trong phiên này; implementation phase should use strongest available review tier for upload handling.
