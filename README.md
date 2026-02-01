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

## Tool Routing Guidance

To get repo-agnostic answers from supported clients, add a routing rule in your
client prompt such as: "For any question about Workspace docs or code, call
smart_search first." This encourages the assistant to use the MCP tools before
answering.

## Feature Specs

- MCP Retrieval Tools: `specs/001-mcp-retrieval-tools/spec.md`
