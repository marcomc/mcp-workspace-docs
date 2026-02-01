<!-- Sync Impact Report
Version change: 1.0.0 -> 2.0.0
Modified principles:
- Grounded, evidence-based answers -> Grounded, evidence-based answers (expanded)
- Deterministic local retrieval -> Determinism and reproducibility (expanded)
- Repository model -> Multi-root, multi-namespace model (redefined)
- Minimal filesystem constraints -> Minimal safety for filesystem and git operations (expanded)
- MCP tool design (client-agnostic) -> MCP tool stability (expanded)
- Installation and execution -> Brownfield compatibility first (shifted to P0)
- Indexing strategy -> Update/refresh behavior is explicit and controlled (reframed)
- Quality bar -> Quality bar (expanded with DoD/PR checklist requirements)
Added sections:
- Core Principles now includes P0 and new principles for optional code roots, git roots, explicit sync,
  testing, and compatibility safeguards.
Removed sections:
- None
Templates requiring updates:
- UPDATED: .specify/templates/plan-template.md
- UPDATED: .specify/templates/spec-template.md
- UPDATED: .specify/templates/tasks-template.md
- UPDATED: docs/quality.md
- N/A: .specify/templates/commands/*.md (directory not present)
Follow-up TODOs:
- None
-->
# MCP Workspace Docs Constitution

## Core Principles

### 0) Brownfield compatibility first
Treat existing behavior as a contract. Before proposing changes, the assistant
MUST inspect the current codebase and identify current tool names, inputs,
outputs, and error shapes; current configuration format; and current
search/open/snippet semantics and ordering. The assistant MUST NOT introduce
breaking changes unless the spec includes an explicit migration plan.
Rationale: protects existing clients and deployments.

### 1) Grounded, evidence-based answers
The assistant MUST answer only using retrieved snippets from configured roots.
Every factual claim MUST include a citation with root id/name, relative file
path, and heading or line range. If evidence is missing, respond
"Not found in docs/code" and suggest a follow-up query. The assistant MUST NOT
infer undocumented behavior or speculate beyond retrieved text. Rationale:
ensures verifiable, audit-ready responses.

### 2) Multi-root, multi-namespace model
The server MUST support multiple roots for `docs`, `code`, and `harness`
(namespaces for workspace harnesses). Each root MUST have a stable id. Tools
MUST allow targeting a specific root id, a namespace group, or all roots.
Existing single-root behavior MUST continue to work via backward-compatible
defaults or aliases. Rationale: enables scalable, multi-repo workflows.

### 3) Optional code root
`code` roots are optional; the server MUST function fully with docs-only
configuration. Tools MUST degrade gracefully when code roots are absent.
Rationale: supports documentation-only workspaces.

### 4) Root sources: local paths + remote git
Roots MAY be local filesystem paths or git sources (url + ref + optional
subdir). Git roots MUST be materialized as local checkouts in a managed cache
directory. Rationale: supports reproducible, versioned sources.

### 5) Update/refresh behavior is explicit and controlled
No implicit network operations are allowed during normal retrieval calls.
Fetch/update MUST happen only via explicit tools or explicit configured policy.
Sync operations MUST be observable (before/after commit, timestamps, status).
Rationale: preserves offline determinism and auditability.

### 6) Determinism and reproducibility
Retrieval results MUST be stable for identical inputs over unchanged checkouts.
Search results MUST be deterministically ordered. If tracking branches are
supported, they MUST be opt-in and clearly observable. Rationale: guarantees
repeatable outcomes across clients and runs.

### 7) Minimal safety for filesystem and git operations
Access MUST be restricted to configured roots and the managed cache directory.
Path traversal and root escape MUST be prevented. Git operations MUST be
controlled and MUST NOT execute arbitrary hooks. Rationale: protects local
machines and enforces least privilege.

### 8) Testing is mandatory
New features MUST include tests. Existing behavior MUST have regression tests
to prevent accidental breaks. Tests MUST cover root resolution, multi-root
routing, docs-only mode, harness roots, and sync behavior. The CI/local test
command MUST be documented and runnable. Rationale: prevents regressions and
ensures safe evolution.

### 9) MCP tool stability
Tool interfaces MUST remain stable across MCP clients. If schema changes are
necessary, add versioning or compatibility shims. Rationale: avoids breaking
client integrations.

### 10) Quality bar
Keep the codebase small, readable, and well documented. Errors MUST be explicit
and actionable. The project MUST include a Definition of Done and a PR
checklist focused on compatibility, determinism, and test coverage. Rationale:
maintains long-term maintainability and trust.

## Additional Constraints

- The server MUST run as a local process started by McpOne or VS Code.
- The server MUST communicate exclusively over stdio.
- The server MUST require no network access for core retrieval operations.
- The server MUST be reusable without modification across MCP-compatible
  clients (OpenAI Codex CLI/VS Code, Gemini CLI, GitHub Copilot CLI, VS Code).

## Development Workflow & Quality Gates

**Definition of Done**
- All constitution principles satisfied with no exceptions.
- Tool schemas documented with examples and versioned if changed.
- Deterministic retrieval verified on unchanged checkouts.
- Docs-only mode validated (no `code` roots required).
- Multi-root routing validated for `docs`, `code`, and `harness` namespaces.
- Explicit sync behavior verified (no implicit network access).
- Regression tests cover existing behavior and new features.
- Client smoke tests cover McpOne Local Server + at least one other MCP client.

**PR Checklist**
- [ ] Constitution compliance confirmed (principles 0-10)
- [ ] Brownfield compatibility reviewed (tools, config, ordering)
- [ ] Tool schemas unchanged or versioned with compatibility notes
- [ ] Deterministic ordering verified for `search`
- [ ] Docs-only mode validated (no `code` roots)
- [ ] Harness roots covered in tests
- [ ] Sync/update behavior explicit and observable
- [ ] Read-only filesystem + root escape guard tested
- [ ] stdio-only transport validated
- [ ] No implicit network calls added to core paths
- [ ] Error messages actionable and include next steps

## Governance

- The constitution supersedes all other practices and templates.
- Amendments require a documented change proposal, rationale, and impact notes.
- Versioning follows semantic rules: MAJOR for breaking governance changes or
  principle redefinitions, MINOR for new principles or material expansions,
  PATCH for clarifications.
- Every change MUST update the Sync Impact Report and review templates for
  alignment.
- Every PR MUST include an explicit compliance check against this constitution.

**Version**: 2.0.0 | **Ratified**: 2026-02-01 | **Last Amended**: 2026-02-01
