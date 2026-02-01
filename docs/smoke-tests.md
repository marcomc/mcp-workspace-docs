# Client Smoke Tests

Repository-wide smoke test checklists for supported MCP clients.

## Codex CLI (Local MCP)

- [ ] Start server with `DOCS_ROOT` and `CODE_ROOT` set
- [ ] Run `list_dir` on `docs` and confirm relative entries
- [ ] Run `search` twice with the same query and confirm identical ordering
- [ ] Run `smart_search` without `repo` and confirm results include `repo`
- [ ] Run `open_file` and verify line numbers
- [ ] Run `get_snippet` for a small range and verify lines

## GitHub Copilot CLI

- [ ] Start server with `DOCS_ROOT` and `CODE_ROOT` set
- [ ] Run `list_dir` on `docs` and confirm relative entries
- [ ] Run `search` twice with the same query and confirm identical ordering
- [ ] Run `smart_search` without `repo` and confirm results include `repo`
- [ ] Run `open_file` and verify line numbers
- [ ] Run `get_snippet` for a small range and verify lines

## Notes

- Record client version and environment details.
- Capture any errors and corresponding `code` values.
