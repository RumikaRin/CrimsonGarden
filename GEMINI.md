# Gemini Solo Agent Rules

Use `H5S/AGENTS.md` as the project harness and
`H5S/docs/GEMINI_SOLO_WORKFLOW.md` as the Gemini-only operating guide.

Mode defaults:
- No `harness`: Quick mode.
- `harness`: Standard mode.
- `harness full`: Full mode.

When the user says `harness`, read:
- `H5S/AGENTS.md`
- `H5S/RULE.md`
- `H5S/progress.md`
- `H5S/feature_list.json`
- `H5S/docs/FEATURE_INTAKE.md`
- `H5S/docs/GEMINI_SOLO_WORKFLOW.md`
- `H5S/docs/MODEL_ROUTER.md`

Only read these when needed:
- `H5S/docs/WORKFLOW_PLAYBOOK.md` for multi-agent or MCP routing.
- `H5S/docs/UI_PRESETS/CINEMATIC_LANDING_BUILDER.md` for cinematic landing pages.
- `H5S/docs/AGENT_TEAM.md` for detailed role definitions.
- `H5S/docs/OPTIONAL_TOOLS.md` when choosing external tools/MCP.
- `H5S/docs/CONTEXT_RULES.md` when context is getting large.

Solo role rule:
- Act as one role at a time.
- Prefer UI/UX brief before frontend implementation.
- For landing pages, use `H5S/docs/UI_PRESETS/CINEMATIC_LANDING_BUILDER.md`
  only after checking project stack and H5S mode/model tier.
- Do not edit broad files without first naming scope and verification.

Antigravity IDE Integration & Native Planning Mode:
- When running in Antigravity IDE, always use the native Planning Mode (`implementation_plan.md` and `task.md` in the `appData` brain directory) as the primary source of truth.
- Do not duplicate planning documents manually. First, write the implementation plan in `implementation_plan.md` and check-list in `task.md`. Once approved, copy/synchronize them to `H5S/specs/<feature-id>/spec.md` and `H5S/progress.md` before starting the execution.
- Prioritize native IDE tools (`view_file`, `grep_search`, `list_dir`, `replace_file_content`, `multi_replace_file_content`) over raw terminal command lines (`cat`, `grep`, `ls`, `sed`) to save context and speed up execution.
- Never propose or run a `cd` command in terminal executions.
- Format all file and symbol links using the proper `file:///` URI scheme (with forward slashes for Windows paths).

Model selection:
- Choose model tier by task using `H5S/docs/MODEL_ROUTER.md`.
- Quick -> fast, Standard -> balanced, Full -> strong.
- Security/auth/payment/DB/final ship -> deep-review.

Before writing Next.js code, read the relevant guide in
`node_modules/next/dist/docs/` because this project may use a version with
breaking changes.

Communication should be Vietnamese. Code, commands, variables, and git commit
messages stay in English.
