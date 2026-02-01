<!-- Sync Impact Report
Version: template -> 1.0.0
Modified principles: None (initial adoption)
Added sections: Core Principles (8 principles), Additional Constraints,
Development Workflow & Quality Gates, Governance (filled)
Removed sections: None
Templates requiring updates:
- UPDATED: .specify/templates/plan-template.md
- UPDATED: .specify/templates/spec-template.md
- UPDATED: .specify/templates/tasks-template.md
- PENDING: .specify/templates/commands/*.md (not found)
Follow-up TODOs: None
-->
# Local MCP Server Constitution

## Core Principles

### 1) Grounded, evidence-based answers
The assistant MUST answer only using retrieved snippets from the configured local
repositories. Every factual claim MUST include a citation with a file path and a
heading or line range. If no supporting evidence exists, respond with
"Not found in docs/code" and suggest a follow-up query. The assistant MUST NOT
infer undocumented behavior or speculate beyond retrieved text. Rationale:
ensures verifiable, audit-ready responses.

### 2) Deterministic local retrieval
All retrieval MUST be performed against the local filesystem roots provided at
runtime. Default retrieval MUST use live text search and file reads (ripgrep
style). Identical queries over unchanged files MUST produce identical result
ordering. Rationale: guarantees reproducibility across clients and runs.

### 3) Repository model
The MCP server MUST operate over multiple logical repositories: `docs` for local
project documentation and `code` for the upstream open-source source code.
Repository roots MUST be provided via configuration (environment variables or a
local config file) and MUST NOT be hard-coded. Rationale: keeps the server
portable and reusable across workspaces.

### 4) Minimal filesystem constraints
Filesystem access MUST be restricted to the configured repository roots. Path
traversal and root escape MUST be prevented. Filesystem access MUST be strictly
read-only. Rationale: protects local machines and enforces least privilege.

### 5) MCP tool design (client-agnostic)
The server MUST expose composable tools usable by any MCP client:
`search(repo, query, file_glob?, limit?)`, `open_file(repo, path)`,
`get_snippet(repo, path, start_line, end_line)`, and `list_dir(repo, path?)`.
Tools MUST return structured JSON with clear, stable schemas. Large outputs MUST
be chunked or paginated. Rationale: ensures interoperability across MCP clients.

### 6) Installation and execution
The MCP server MUST be runnable directly from source using a standard Node.js
runtime. Primary execution MUST be a single command suitable for McpOne "Local
Server" configuration. Configuration MUST be provided via environment variables
or a local config file. No packaging, installers, or binaries are required for
initial versions. Rationale: favors simple local setup and reuse.

### 7) Indexing strategy
The initial implementation MUST NOT require a pre-built index. Any future index
MUST be local-only, rebuildable, and never uploaded. Rationale: preserves
simplicity and offline privacy.

### 8) Quality bar
The codebase MUST remain small, readable, and well-documented. Errors MUST be
explicit and actionable. The project MUST include a Definition of Done and a PR
checklist covering correctness, determinism, tool schemas, and client
compatibility. Rationale: maintains long-term maintainability and trust.

## Additional Constraints

- The server MUST run as a local process started by McpOne or VS Code.
- The server MUST communicate exclusively over stdio.
- The server MUST require no network access for core functionality.
- The server MUST be reusable without modification across MCP-compatible
  clients (OpenAI Codex CLI/VS Code, Gemini CLI, GitHub Copilot CLI, VS Code).

## Development Workflow & Quality Gates

**Definition of Done**
- All constitution principles satisfied with no exceptions.
- Tool schemas documented with examples and validated in tests or fixtures.
- Deterministic retrieval verified on unchanged repositories.
- No network access required for core functionality (offline runnable).
- Client smoke tests cover McpOne Local Server + at least one other MCP client.

**PR Checklist**
- [ ] Constitution compliance confirmed (principles 1-8)
- [ ] Tool schemas unchanged or versioned with compatibility notes
- [ ] Deterministic ordering verified for `search`
- [ ] Read-only filesystem guard tested (no writes outside roots)
- [ ] stdio-only transport validated
- [ ] No network calls added to core paths
- [ ] Error messages actionable and include next steps

## Governance

- The constitution supersedes all other practices and templates.
- Amendments require a documented change proposal, rationale, and impact notes.
- Versioning follows semantic rules: MAJOR for breaking governance changes,
  MINOR for new principles or material expansions, PATCH for clarifications.
- Every change MUST update the Sync Impact Report and review templates for
  alignment.
- Every PR MUST include an explicit compliance check against this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-02-01 | **Last Amended**: 2026-02-01
