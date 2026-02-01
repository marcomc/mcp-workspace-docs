# Quickstart

Repository-wide quickstart for running the MCP retrieval tools locally.

## Prerequisites

- Node.js 20 LTS
- Local checkouts for `docs` and `code` with read permissions

## Configure

Set repository roots using environment variables or a local config file:

- `DOCS_ROOT`: absolute path to documentation repo
- `CODE_ROOT`: absolute path to source code repo

## Run (stdio)

```bash
node ./src/index.js
```

## Smoke Test

```bash
DOCS_ROOT=/path/to/docs CODE_ROOT=/path/to/code npm test
```

## Related Docs

- Quality gates: `docs/quality.md`
- Installation: `docs/installation.md`
- Tool schema examples: `docs/schema-examples.md`
- Tool error cases: `docs/errors.md`
- Tool acceptance checklists: `docs/acceptance.md`
- Client smoke tests: `docs/smoke-tests.md`
