# MCP Workspace Docs

## Overview

This repository captures specifications, plans, and supporting documents for the
local MCP retrieval tools server.

## Key Documents

- Quality gates: `docs/quality.md`
- Quickstart: `docs/quickstart.md`
- Installation: `docs/installation.md`
- Tool schema examples: `docs/schema-examples.md`
- Tool error cases: `docs/errors.md`
- Tool acceptance checklists: `docs/acceptance.md`

## Testing (Regression Prevention)

Run the minimal regression suite with repository roots set:

```bash
DOCS_ROOT=/path/to/docs CODE_ROOT=/path/to/code npm test
```

The smoke tests validate stdio wiring and JSON response shape. Add more
tests under `tests/integration/` as new tools are implemented.

## Feature Specs

- MCP Retrieval Tools: `specs/001-mcp-retrieval-tools/spec.md`
