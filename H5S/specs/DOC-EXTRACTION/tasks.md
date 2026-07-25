# DOC-EXTRACTION Tasks

## Preflight

- [x] Chọn mode: Full.
- [x] Cập nhật `H5S/progress.md` current task.
- [x] Chạy `python H5S/scripts/h5s_guard.py preflight --mode full --feature DOC-EXTRACTION --require-active-writer`.
- [ ] Trước khi code, Codex phải tuyên bố chuyển từ Leader sang Coder cho phase file parsing/backend.
- [ ] Trước khi sửa Next.js code, kiểm tra `node_modules/next/dist/docs/` hoặc ghi rõ path này không tồn tại trong package hiện tại.
- [ ] Hỏi user trước khi thêm parser dependency mới hoặc tăng upload size limit.

## Task 1: Parser Contract And Fixtures

Owner: Codex Coder after role switch  
Files allowed:
- `src/lib/exam-import/types.ts`
- `src/lib/exam-import/normalize.ts`
- `tests/exam-import/normalize.test.ts`
- `tests/fixtures/exam-import/*`

Checklist:
- [ ] Define `ParsedExamDraft`, `ParsedQuestionDraft`, `ParsedAnswerDraft` and parser metadata.
- [ ] Implement normalizer that rejects empty exams and malformed questions.
- [ ] Normalize one correct answer policy and safe defaults.
- [ ] Add fixtures for valid TXT, malformed TXT and representative parsed drafts.

Verify:
- `npm.cmd run test -- tests/exam-import/normalize.test.ts`
- `npm.cmd run lint`

## Task 2: TXT And CSV Server Parser

Owner: Codex Coder  
Files allowed:
- `src/lib/exam-import/textParsers.ts`
- `src/components/UploadAutoGenerate.tsx`
- `src/pages/api/generate-exam.ts`
- `tests/exam-import/textParsers.test.ts`

Checklist:
- [ ] Move or mirror TXT/CSV parsing into tested shared code.
- [ ] Keep current sample TXT and CSV formats working.
- [ ] Return clear parser warnings for missing correct answer, missing option or unsupported line format.
- [ ] Ensure server validates client-supplied `parsedExam` with the normalizer.

Verify:
- `npm.cmd run test -- tests/exam-import/textParsers.test.ts`
- `npm.cmd run lint`

## Task 3: Safe Python Runner

Owner: Codex Coder  
Files allowed:
- `src/lib/exam-import/pythonRunner.ts`
- `src/pages/api/generate-exam.ts`
- `tests/exam-import/pythonRunner.test.ts`

Checklist:
- [ ] Replace shell command strings with safer process execution.
- [ ] Use random isolated temp directories under a controlled temp root.
- [ ] Write decoded bytes only after base64 and type checks pass.
- [ ] Always cleanup temp files and folders in `finally`.
- [ ] Limit stdout/stderr and parser timeout.

Verify:
- `npm.cmd run test -- tests/exam-import/pythonRunner.test.ts`
- `npm.cmd run lint`

## Task 4: DOCX Integration

Owner: Codex Coder  
Files allowed:
- `src/lib/docx_parser.py`
- `src/pages/api/generate-exam.ts`
- `src/components/UploadAutoGenerate.tsx`
- `tests/exam-import/docxParser.test.ts`

Checklist:
- [ ] Add `.docx` to UI accept list and visible copy.
- [ ] Route DOCX uploads to `docx_parser.py` or approved TypeScript parser.
- [ ] Preserve images when extracted and cap large image payloads.
- [ ] Detect correct answer markers by explicit text first, style heuristics second.
- [ ] Fail clearly when `python-docx` is missing.

Verify:
- `npm.cmd run test -- tests/exam-import/docxParser.test.ts`
- Manual upload QA with a DOCX fixture.
- `npm.cmd run build`

## Task 5: PDF Parser Cleanup

Owner: Codex Coder  
Files allowed:
- `src/lib/pdf_parser.py`
- `src/pages/api/generate-exam.ts`
- `tests/exam-import/pdfParser.test.ts`
- `tests/fixtures/exam-import/*`

Checklist:
- [ ] Remove hard-coded Q162/Q163 swap.
- [ ] Preserve existing Vietnamese spacing cleanup behavior where tests cover it.
- [ ] Add parser warnings when no answers or no correct answer can be confidently detected.
- [ ] Keep Gemini fallback for scanned/low-confidence PDFs.
- [ ] Cap extracted image payloads.

Verify:
- `npm.cmd run test -- tests/exam-import/pdfParser.test.ts`
- Manual upload QA with at least one text PDF and one image-heavy PDF if available.
- `npm.cmd run build`

## Task 6: Generate API Refactor

Owner: Codex Coder  
Files allowed:
- `src/pages/api/generate-exam.ts`
- `src/lib/exam-import/**`
- `src/types.ts` only if parser metadata requires a shared exported type

Checklist:
- [ ] Route by validated file type and extension.
- [ ] Reject unsupported file types with 400.
- [ ] Use normalizer before creating IDs.
- [ ] Return parser metadata to UI.
- [ ] Do not persist empty or low-confidence output silently.
- [ ] Keep Prisma persistence fallback behavior explicit.

Verify:
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`

## Task 7: Upload UI Alignment

Owner: Antigravity UI or Codex Coder after backend contract is stable  
Files allowed:
- `src/components/UploadAutoGenerate.tsx`

Do not touch:
- Parser internals
- Auth/security code

Checklist:
- [ ] Update supported format copy to DOCX, TXT, CSV, PDF, image and JSON.
- [ ] Show parser warnings and fallback-used status.
- [ ] Keep cancel, retry, success and error states mobile-safe.
- [ ] Do not change exam creation behavior outside the new API contract.

Verify:
- `npm.cmd run lint`
- `npm.cmd run build`
- Manual QA at 375px and 1440px.

## Task 8: Review And Evidence

Owner: Codex Reviewer / Tester  
Files allowed:
- `H5S/specs/DOC-EXTRACTION/review.md`
- `H5S/specs/DOC-EXTRACTION/test-evidence.md`
- `H5S/docs/TEST_MATRIX.md`

Checklist:
- [ ] Review upload safety, temp file handling and child process handling.
- [ ] Review parser output validation and AI fallback behavior.
- [ ] Run full verification and record evidence.
- [ ] Update TEST_MATRIX only after implementation tests pass.

Verify:
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`
- Manual upload QA results recorded.

## Closeout

- [ ] Release `ACTIVE WRITER`.
- [ ] Reviewer updates `review.md`.
- [ ] Tester updates `test-evidence.md` and `H5S/docs/TEST_MATRIX.md`.
- [ ] Leader updates `session-handoff.md` if implementation remains incomplete.
