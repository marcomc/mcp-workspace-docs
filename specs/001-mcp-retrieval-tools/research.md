# Research: MCP Retrieval Tools

**Date**: 2026-02-01
**Feature**: /Users/mmassari/Development/MCP/mcp-workspace-docs/specs/001-mcp-retrieval-tools/spec.md

## Decisions

### 1) Runtime and execution model

**Decision**: Node.js 20 LTS, local stdio execution only.

**Rationale**: Matches the requirement for a local Node.js server and provides a
stable, widely available runtime for MCP clients.

**Alternatives considered**:
- Node.js 18 LTS (older baseline, shorter runway)
- Other runtimes (not allowed by spec)

### 2) Deterministic ordering rules

**Decision**: Order results deterministically by repo (docs, code), then by
relative path (lexicographic), then by line number ascending.

**Rationale**: Provides stable ordering across runs and environments for
identical inputs.

**Alternatives considered**:
- Filesystem traversal order (non-deterministic across platforms)
- Relevance scoring (adds complexity and non-determinism)

### 3) Startup validation behavior

**Decision**: Fail fast on startup when `DOCS_ROOT` or `CODE_ROOT` is missing or
invalid.

**Rationale**: Prevents partial functionality and avoids hidden runtime errors.

**Alternatives considered**:
- Per-tool validation on call (more runtime error paths)
- Allowing only one root (inconsistent behavior across repos)

### 4) Error schema

**Decision**: Structured error object with `code`, `message`, and `details`.

**Rationale**: Consistent client handling and easy troubleshooting.

**Alternatives considered**:
- Plain text errors only
- Extended error schema with retryable flags (not required)

### 5) Output envelope

**Decision**: All tool outputs use a shared envelope with `result` plus `meta`
containing `repo`, `duration_ms`, and `truncated`.

**Rationale**: Consistent response format across tools and clients while keeping
payloads lightweight.

**Alternatives considered**:
- No shared envelope
- Expanded envelope with pagination structures (not required yet)

### 6) Hidden and ignored files

**Decision**: `list_dir` excludes hidden dotfiles/directories and respects ignore
rules (e.g., `.gitignore`).

**Rationale**: Avoids noise and respects common developer expectations.

**Alternatives considered**:
- Include hidden/ignored files by default
- Exclude dotfiles only (ignore rules not applied)

### 7) Repo-agnostic discovery

**Decision**: Add `smart_search` and make `repo` optional for tools where safe,
defaulting to both repos and auto-resolving paths.

**Rationale**: Allows chat users to stay repo-agnostic while preserving
deterministic behavior and clear ambiguity errors.

**Alternatives considered**:
- Require `repo` for all tools (more friction for users)
- Add client-side routing only (inconsistent across clients)
