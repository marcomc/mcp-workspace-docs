# Changelog

All notable changes for this project will be documented in this file.

## Unreleased

### Added

- Initialized project documentation and specs.
- Skeleton MCP server over stdio.
- Config loading and startup validation for `DOCS_ROOT`/`CODE_ROOT`.
- Shared response envelope and structured error shape.
- Path guard utility for repo-root enforcement.
- Default search limit constant (200).
- Ignore rules loader for dotfiles and `.gitignore`.
- `open_file` and `list_dir` tools with schemas.
- Smoke tests for `list_dir` and `open_file`.
- `get_snippet` tool with schema and smoke test.
- Deterministic search tool, schema, and smoke test.
- Documentation alignment for quality gates, error catalog, acceptance checks, and ordering rules.
- Structured request and error logging (stderr).
- Logging smoke test for structured request entries.
- Added validation checklists for determinism, schema shape, stdio/offline, and read-only guards.
- MCP JSON-RPC protocol support (initialize, tools/list, tools/call).
- JSON-RPC protocol smoke test.

### Changed

- `.gitignore` expanded for Node.js and common editor artifacts.

### Removed

- `ping` tool, schema, contract, and smoke test.

### Fixed

- Load tool schemas relative to server file location to avoid missing schemas in client runtimes.
- Provide default input schema in MCP `tools/list` when schema is unavailable.
- Support Content-Length framed JSON-RPC messages over stdio.
- Ignore MCP initialization notifications and avoid responding to notification messages.
