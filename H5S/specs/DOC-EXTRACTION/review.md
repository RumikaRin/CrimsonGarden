# DOC-EXTRACTION Review

## Status

planning-only

## Findings

| Severity | File | Finding | Recommendation |
| :--- | :--- | :--- | :--- |
| Critical | `src/pages/api/generate-exam.ts:35` | Upload parsing writes temp PDFs and executes Python through shell command strings. | Replace with safe process execution, isolated temp dirs, timeout and cleanup. |
| Important | `src/components/UploadAutoGenerate.tsx:440` | File input does not accept `.docx` although UI copy says Word support. | Add DOCX support after server parser route is ready. |
| Important | `src/lib/docx_parser.py` | DOCX parser exists but is not wired into the API. | Integrate through parser router and add fixture tests. |
| Important | `src/lib/pdf_parser.py:373` | PDF parser has substantial heuristics and no visible fixture tests. | Add tests around existing behavior before cleanup. |
| Important | `src/lib/pdf_parser.py` | Hard-coded Q162/Q163 image swap is content-specific. | Replace with general image association strategy or a documented parser warning. |
| Important | `src/pages/api/generate-exam.ts:15` | Body parser allows `50mb` and response limit `200mb`. | Reconfirm size limits and cap parser output/images before production. |
| Nit | root scratch scripts and parsed output files | Several root-level debug/parser scripts and parsed artifacts are untracked. | Decide cleanup separately after confirming which are useful fixtures. |

## Checks

- [x] Scope matches `spec.md`.
- [x] Files changed stay inside H5S planning artifacts so far.
- [x] No unrelated source-code refactor.
- [x] File upload and child process risks reviewed.
- [x] Baseline verification evidence exists.

## Ship Decision

Fix first. Planning is ready, but extraction should not be considered hardened until parser routing, safe process execution and fixtures are implemented.
