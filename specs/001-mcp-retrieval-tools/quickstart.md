# Quickstart: MCP Retrieval Tools

**Date**: 2026-02-01
**Feature**: /Users/mmassari/Development/MCP/mcp-workspace-docs/specs/001-mcp-retrieval-tools/spec.md

## Prerequisites

- Node.js 20 LTS installed
- Local checkouts for `docs` and `code` with read permissions

## Configure

Set repository roots using environment variables or a local config file:

- `DOCS_ROOT`: absolute path to documentation repo
- `CODE_ROOT`: absolute path to source code repo

## Run (stdio)

Start the server as a local process so MCP clients can connect over stdio. Use
this command structure (entrypoint to be implemented):

```bash
node ./src/index.js
```

## Register with McpOne (Local Server)

- Name: MCP Retrieval Tools
- Command: `node`
- Args: `./src/index.js`
- Environment: `DOCS_ROOT`, `CODE_ROOT`

## Smoke Test

1. Call `list_dir` for `docs` and confirm entries are relative to repo root.
2. Call `search` with a stable query twice and confirm identical ordering.
3. Call `open_file` for a known file and verify line numbers.

## Related Docs

- Quality gates: `docs/quality.md`
- Tool schema examples: `docs/schema-examples.md`
- Tool error cases: `docs/errors.md`
- Tool acceptance checklists: `docs/acceptance.md`
