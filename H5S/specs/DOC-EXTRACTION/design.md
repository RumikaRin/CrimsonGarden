# DOC-EXTRACTION Design

## Approach

Use a typed parser pipeline with explicit routing:

1. Client only selects and previews files. It sends file metadata plus either text content, JSON content or base64 payload.
2. Server validates extension, MIME, size and content shape.
3. Server routes to a parser by type:
   - TXT: deterministic text parser.
   - CSV: deterministic table parser.
   - DOCX: local DOCX parser.
   - PDF: local PDF parser first when available, Gemini fallback when local parser fails or scanned content is likely.
   - Image: Gemini parser.
   - JSON: strict schema import.
4. Parser returns `ParsedExamDraft`.
5. Normalizer validates and repairs safe defaults.
6. Persistence creates app IDs and saves to Prisma if DB exists.
7. API returns exam plus parser metadata.

This keeps local deterministic parsing for common teacher-upload formats while preserving AI fallback for scanned or image-heavy files.

## Files And Ownership

| File | Owner | Change |
| :--- | :--- | :--- |
| `src/components/UploadAutoGenerate.tsx` | Codex Coder or Antigravity UI after backend contract | Accept `.docx`, show accurate file support, keep UI states aligned with parser metadata. |
| `src/pages/api/generate-exam.ts` | Codex Coder | Refactor into parser routing, validation, safer temp/process execution and normalized output. |
| `src/lib/docx_parser.py` | Codex Coder | Stabilize DOCX extraction, images, correct-answer detection and JSON output. |
| `src/lib/pdf_parser.py` | Codex Coder | Remove hard-coded question swap, improve image mapping guardrails, preserve existing heuristics with tests. |
| `src/lib/exam-import/types.ts` | Codex Coder | New TypeScript types for parsed draft, parser metadata and normalized exam. |
| `src/lib/exam-import/normalize.ts` | Codex Coder | New normalizer for questions, answers, duration, image fields and validation errors. |
| `src/lib/exam-import/textParsers.ts` | Codex Coder | New tested TXT/CSV parsing shared by server and optionally client. |
| `src/lib/exam-import/pythonRunner.ts` | Codex Coder | New safe runner using isolated temp dirs and no shell interpolation. |
| `tests/exam-import/*.test.ts` | Codex Coder / Tester | Parser and normalizer tests. |
| `tests/fixtures/exam-import/*` | Codex Coder / Tester | Minimal TXT, CSV, DOCX, PDF or mocked fixture data. |

## Data Flow

```text
UploadAutoGenerate
  -> /api/generate-exam
    -> validate file metadata and payload
    -> choose parser
    -> parse document
    -> normalize ParsedExamDraft
    -> map to Exam IDs
    -> try Prisma persistence
    -> return { success, exam, parser }
```

Parser metadata should include:
- `sourceType`: `txt`, `csv`, `docx`, `pdf`, `image`, `json`, `ai-fallback`.
- `questionCount`.
- `warnings`.
- `fallbackUsed`.
- `imagesExtracted` where applicable.

## Alternatives Considered

| Option | Decision | Reason |
| :--- | :--- | :--- |
| Gemini-only extraction for all formats | rejected | High cost, nondeterministic, worse for simple TXT/CSV/DOCX teacher templates. |
| Local-only extraction | rejected | Scanned PDFs/images need AI/OCR fallback. |
| Keep parsing in React component | rejected | Hard to test, duplicates server validation, cannot support DOCX safely. |
| Parser router + normalizer | chosen | Clear ownership, safer upload handling, easier tests and confidence reporting. |
| Support legacy `.doc` immediately | deferred | Requires converter dependency and platform-specific risk. |

## Guardrails

- Files allowed:
  - `src/components/UploadAutoGenerate.tsx`
  - `src/pages/api/generate-exam.ts`
  - `src/lib/pdf_parser.py`
  - `src/lib/docx_parser.py`
  - `src/lib/exam-import/**`
  - `tests/exam-import/**`
  - `tests/fixtures/exam-import/**`
  - parser dependency manifests only after approval
- Do not touch:
  - Auth/session/RBAC code except shared upload guards after `SECURITY-HARDENING`
  - Prisma schema unless persistence shape changes are approved
  - quiz scoring, leaderboard scoring, game engine
  - `.env` secrets
- Upload safety:
  - Never trust client MIME alone.
  - Enforce server-side size limits.
  - Use isolated temp directories and cleanup in `finally`.
  - Avoid shell command strings for parser execution.
  - Do not write user-controlled filenames directly to paths.
  - Cap parser output size and image base64 payloads.
- Before editing Next.js code:
  - Check `node_modules/next/dist/docs/`. Current audit found this path absent.
  - If absent, document fallback source before coding.
- Verification:
  - `npm.cmd run lint`
  - `npm.cmd run test`
  - `npm.cmd run build`
  - targeted parser fixture tests
  - manual upload QA for TXT, CSV, DOCX, PDF, JSON and image where fixtures are available
