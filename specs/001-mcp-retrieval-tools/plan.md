# Implementation Plan: MCP Retrieval Tools

**Branch**: `001-mcp-retrieval-tools` | **Date**: 2026-02-01 | **Spec**: /Users/mmassari/Development/MCP/mcp-workspace-docs/specs/001-mcp-retrieval-tools/spec.md
**Input**: Feature specification from `/specs/001-mcp-retrieval-tools/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Define a local MCP server that exposes deterministic, read-only retrieval tools
(`search`, `smart_search`, `open_file`, `get_snippet`, `list_dir`) over two
configured local repositories. The server runs over stdio, requires no network
access, and uses stable JSON schemas with a shared output envelope and structured
errors.

## Technical Context

**Language/Version**: Node.js 20 LTS  
**Primary Dependencies**: Node.js standard library (fs, path); no network deps  
**Storage**: Local filesystem (read-only)  
**Testing**: Node.js built-in test runner (`node --test`)  
**Target Platform**: macOS and Linux local execution  
**Project Type**: single  
**Performance Goals**: 95% of search requests <= 2 seconds on repos up to 1M lines  
**Constraints**: stdio-only, offline, deterministic ordering, read-only access  
**Scale/Scope**: two repo roots (`docs`, `code`) per server instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Evidence grounding: plan defines retrieval + citation format for all answers
- Deterministic retrieval: ordering rules documented and testable
- Repository model: `docs` and `code` roots configurable (no hard-coded paths)
- Filesystem constraints: read-only access with traversal/escape prevention
- MCP tool design: JSON schemas and pagination/chunking rules specified
- Execution model: local process, stdio-only, no network for core paths
- Indexing: no pre-built index required (future local-only optionality noted)
- Quality bar: DoD + PR checklist included for correctness and compatibility

Status: PASS

Post-design re-check: PASS (schemas, envelope, error shape, deterministic rules,
stdio-only, offline, and read-only constraints captured in design artifacts).

## Project Structure

### Documentation (this feature)

```text
specs/001-mcp-retrieval-tools/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── config/
├── core/
├── tools/
├── schemas/
└── errors/

tests/
├── integration/
└── unit/
```

**Structure Decision**: Single project layout for a local Node.js CLI-style
server, keeping tools, schemas, and config separated for clarity.

## Complexity Tracking

No constitution violations.
