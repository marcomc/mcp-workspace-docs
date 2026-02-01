# Feature Specification: Multi-Root Sync Extensions

**Feature Branch**: `002-multi-root-sync`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Specify the requirements for extending the existing mcp-workspace-docs MCP server with new root capabilities and repo syncing."

## Compatibility Audit *(mandatory)*

### Current tools, schemas, and behavior
- Tools: `list_dir`, `open_file`, `get_snippet`, `search`, `smart_search`.
- Response envelope includes `result` plus `meta` with `repo`, `duration_ms`, and `truncated`.
- Deterministic ordering for search results is by repo, then path, then line.
- Configuration uses `DOCS_ROOT` and `CODE_ROOT` to point at local roots.
- Retrieval operates over docs and code roots; missing or invalid roots raise
  configuration errors.

### Preserved behaviors (no change)
- All existing tool names remain available and continue to accept their current
-  input shapes for non-targeting fields (e.g., query, path, limit) while
  targeting uses the new `scope` model.
- Response envelope and error response shape remain unchanged.
- Deterministic ordering rules remain unchanged for legacy modes.
- Retrieval does not perform network operations implicitly.

### Breaking changes and migration plan
- This feature introduces a breaking change by replacing `repo` with `scope`
  for targeting retrieval tools.
- Migration plan:
  - Provide a compatibility shim or versioned tool variant that accepts legacy
    `repo` inputs and maps them to `scope` during a deprecation window.
  - Document the deprecation timeline and include a warning when legacy inputs
    are used.

## Clarifications

### Session 2026-02-01

- Q: Should this feature add a config file option, or extend env vars only? → A: Extend env vars only (no config file in this feature).
- Q: What should be the default retrieval scope when no target is provided? → A: Default scope is all roots (docs+code+harness).
- Q: How should the git cache be organized on disk? → A: Single cache root with per-root subdirectories based on stable root id.
- Q: How should dirty git roots be handled? → A: Allow dirty roots but report `dirty: true`.
- Q: How should retrieval tool targeting be expressed? → A: Replace `repo` with `scope` everywhere (breaking legacy inputs).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preserve existing workflows (Priority: P1)

As an operator of the MCP server, I want current tools and configuration to
continue working without changes, so that existing MCP clients keep functioning.

**Why this priority**: Preserving compatibility prevents disruptions to current
users and client integrations.

**Independent Test**: Configure only `DOCS_ROOT` and `CODE_ROOT` and run the
existing tools; all prior acceptance checks must pass unchanged.

**Acceptance Scenarios**:

1. **Given** the server is configured with `DOCS_ROOT` and `CODE_ROOT`,
   **When** a client calls existing tools with current inputs,
   **Then** results and error shapes match the current documented behavior.
2. **Given** the server is configured as before,
   **When** a client runs search with identical inputs,
   **Then** results remain deterministically ordered and unchanged.

---

### User Story 2 - Configure multiple roots and namespaces (Priority: P1)

As an operator, I want to configure multiple docs, code, and harness roots so
that retrieval can target a specific root, a namespace, or all roots.

**Why this priority**: Multi-root support is the main feature expansion and must
work without disrupting existing behavior.

**Independent Test**: Configure multiple roots and verify targeted and
cross-root searches produce correct, deterministic results.

**Acceptance Scenarios**:

1. **Given** multiple docs roots are configured,
   **When** a search targets a specific root id,
   **Then** results only include matches from that root.
2. **Given** docs, code, and harness roots are configured,
   **When** a search targets a namespace or all roots,
   **Then** results include matches from the selected scope with stable ordering.

---

### User Story 3 - Explicitly sync git roots (Priority: P2)

As an operator, I want explicit repo management tools to inspect and sync git
roots so that updates are intentional and observable.

**Why this priority**: Explicit sync avoids unexpected network activity and
keeps retrieval deterministic.

**Independent Test**: Run repo status and sync operations against a git root
configured in the cache; verify that retrieval remains offline unless sync is
called.

**Acceptance Scenarios**:

1. **Given** a git root is configured,
   **When** I call `repo_status`,
   **Then** I receive current commit, configured ref, and last sync timestamp.
2. **Given** a git root is configured,
   **When** I call `repo_sync` in an explicit mode,
   **Then** the tool reports before/after commit and status without side effects
   on unrelated roots.

---

### Edge Cases

- Missing docs roots returns a structured error.
- Missing code roots is allowed and does not block retrieval.
- Invalid root definitions return a structured validation error with details.
- Path traversal attempts are rejected with a clear error.
- Git sync in offline mode returns an explicit error without changing state.

## Constitution Constraints *(mandatory)*

- Brownfield compatibility: existing tools, config, and ordering are a contract.
- Evidence grounding with citations in retrieval responses.
- Multi-root model with stable root ids for docs, code, and harness.
- Docs-only mode is supported (no code roots required).
- Roots may be local or git-backed with a managed cache directory.
- No implicit network operations during retrieval.
- Deterministic ordering for identical inputs over unchanged checkouts.
- Safety: root escape prevention and controlled git operations.
- Testing is mandatory for new features and regressions.
- Tool schemas remain stable or are versioned with compatibility shims.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST begin this feature with a compatibility audit that
  documents current tools, schemas, config mechanism, and behavior.
- **FR-002**: The system MUST preserve all existing tool names, input shapes,
  response envelopes, and documented error shapes, except for the explicit
  replacement of `repo` with `scope` for targeting.
- **FR-003**: The system MUST accept a configuration format that extends the
  current environment-variable configuration only; no new config file is added
  in this feature.
- **FR-004**: The system MUST support multiple docs roots, multiple code roots,
  and a new harness namespace with stable root ids.
- **FR-005**: The system MUST operate in docs-only mode without requiring code
  roots.
- **FR-006**: The system MUST allow roots to be local or git-backed, each with a
  stable id, type, and resolved workdir for retrieval.
- **FR-007**: The system MUST provide deterministic ordering for search results
  across single-root and multi-root scopes.
- **FR-008**: Retrieval tools MUST support targeting a specific root id, a
  namespace group, or all roots using `scope`. When no target is provided, the
  default scope MUST include all roots (docs, code, harness).
- **FR-009**: Retrieval results MUST include root id, relative path, line
  numbers, and preview text.
- **FR-010**: The system MUST provide explicit repo management tools
  (`roots_list`, `repo_status`, `repo_sync`) with structured reports.
- **FR-011**: Retrieval tools MUST NOT trigger any network operations.
- **FR-012**: Git sync operations MUST be limited to the managed cache
  directory and must be observable with before/after status. The cache MUST use
  a single cache root with per-root subdirectories keyed by stable root id.
- **FR-016**: Repo status and sync outputs MUST surface a `dirty` flag for git
  roots and MUST NOT fail solely due to uncommitted changes.
- **FR-013**: Validation MUST treat missing docs roots as an error and missing
  code roots as allowed.
- **FR-014**: Errors MUST be structured and include machine-readable error
  codes for root validation and git operations.
- **FR-015**: The system MUST include regression tests for existing behavior and
  new tests for multi-root, harness, and sync behaviors.
- **FR-017**: Retrieval tools MUST use `scope` to indicate target roots and
  MUST NOT accept legacy `repo` inputs.

### Key Entities *(include if feature involves data)*

- **Root Definition**: A configured entry with id, type, source details, and
  resolved workdir used for retrieval.
- **Root Set**: A collection of roots grouped by namespace (docs, code,
  harness).
- **Sync Report**: A structured summary with before/after commit, status,
  timestamps, and warnings.
- **Error Catalog**: Defined error codes and messages for invalid roots and git
  operations.

## Assumptions

- Existing clients rely on current tool names and response envelopes.
- Operators will use environment variables as the primary config method unless
  a config file is explicitly supported.
- Git sync operations can be executed in controlled environments with local
  cache storage.

## Dependencies

- Access to local docs and code checkouts for regression testing.
- Availability of local git fixtures for deterministic sync tests.

## Out of Scope

- Semantic search or embeddings.
- Executing builds or tests of target repos.
- Editing files inside target repos.
- Automatic sync on every request.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing tool acceptance checks pass without modification.
- **SC-002**: Docs-only configuration supports all retrieval tools without
  errors in at least 10 representative queries.
- **SC-003**: Multi-root searches return deterministically ordered results across
  3+ roots in 100% of repeated runs.
- **SC-004**: Explicit sync operations report before/after commit status for
  100% of configured git roots with no implicit syncs during retrieval.
