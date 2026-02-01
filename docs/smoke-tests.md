# Client Smoke Tests

Repository-wide smoke test checklists for supported MCP clients.

## Codex CLI (Local MCP)

- [x] Start server with `DOCS_ROOT` and `CODE_ROOT` set
- [x] Run `list_dir` on `docs` and confirm relative entries
- [x] Run `search` twice with the same query and confirm identical ordering
- [x] Run `smart_search` without `repo` and confirm results include `repo`
- [x] Run `open_file` and verify line numbers
- [x] Run `get_snippet` for a small range and verify lines

## Gemini CLI

- [x] Run `list_dir` on `docs` and confirm relative entries (MCP tool call)
- [x] Run `search` twice with the same query and confirm identical ordering
- [x] Run `smart_search` without `repo` and confirm results include `repo`
- [x] Run `open_file` and verify line numbers
- [x] Run `get_snippet` for a small range and verify lines


## Notes

- Record client version and environment details.
- Capture any errors and corresponding `code` values.
- Automated `npm test` run (2026-02-01) passed all integration tests; manual
  client UI smoke steps still pending.
