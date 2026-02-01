# Feature Specification: MCP Retrieval Tools

**Feature Branch**: `001-mcp-retrieval-tools`  
**Created**: 2026-02-01  
**Status**: Draft  
**Input**: User description: "Specify the requirements for a **Node.js-based local MCP server** that exposes **read-only retrieval tools** over two local repositories: - `docs`: a local checkout of project documentation - `code`: a local checkout of the upstream open-source project source code The MCP server will be run via **stdio** and registered as a **Local Server in McpOne (macOS)**, and must be reusable without modification by **Codex CLI / VS Code, Gemini CLI, and GitHub Copilot CLI**. --- ## Required MCP tools Define precise inputs, outputs, and error conditions for the following tools. ### 1. `search` **Parameters** - `repo`: \"docs\" | \"code\" | \"both\" - `query`: string - `file_glob` (optional): string - `limit` (optional): number **Behavior** - Perform deterministic keyword search over the selected repository roots. - Return ordered results including: - relative file path - line number(s) - matched text preview --- ### 2. `open_file` **Parameters** - `repo`: \"docs\" | \"code\" - `path`: string (relative to repo root) **Behavior** - Return full file contents with line numbers. - Reject paths outside the configured root. - Return structured errors for missing or unreadable files. --- ### 3. `get_snippet` **Parameters** - `repo`: \"docs\" | \"code\" - `path`: string - `start_line`: number - `end_line`: number **Behavior** - Return only the requested line range. - Clamp line ranges to file bounds. - Reject invalid ranges with clear errors. --- ### 4. `list_dir` **Parameters** - `repo`: \"docs\" | \"code\" - `path` (optional): string **Behavior** - List files and directories relative to the repo root. - Exclude hidden or ignored files if applicable. --- ## Configuration Specify runtime configuration via environment variables or a local config file: - `DOCS_ROOT` - `CODE_ROOT` Define validation rules for: - missing configuration - non-existent directories - non-readable paths --- ## Non-functional requirements - Deterministic output ordering for identical inputs. - Read-only filesystem access. - Clear, structured error responses. - Reasonable defaults (e.g. search result limits). --- ## Out of scope - Semantic search / embeddings - Network access - Authentication - Code modification or execution --- ## Deliverables - Functional specification for each MCP tool - JSON schemas for inputs and outputs - Enumerated error cases and expected messages - Acceptance checklist for each tool"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retrieve content with deterministic search (Priority: P1)

As a developer using an MCP client, I want to search and retrieve content from
`docs` and `code` repositories with deterministic ordering so I can rely on
repeatable answers across clients.

**Why this priority**: This is the primary capability required for MCP clients to
surface evidence-backed answers.

**Independent Test**: Provide a fixed query against a static repository snapshot
and confirm identical ordered results across multiple runs.

**Acceptance Scenarios**:

1. **Given** a configured `docs` root and a query string, **When** I run
   `search` with the same inputs twice, **Then** I receive identical ordered
   results including file path, line number(s), and matched text preview.
2. **Given** a configured `code` root and a file path, **When** I run
   `open_file`, **Then** I receive the full file content with line numbers.

---

### User Story 2 - Enforce safe, read-only access (Priority: P2)

As a security-conscious operator, I want the server to reject invalid or unsafe
paths so that clients cannot access data outside the configured repositories.

**Why this priority**: Prevents data leakage and enforces least-privilege access.

**Independent Test**: Attempt to access a path outside the repo root and verify a
structured error response.

**Acceptance Scenarios**:

1. **Given** a path with traversal segments, **When** I call `open_file`,
   **Then** the request is rejected with a clear, structured error.
2. **Given** missing or unreadable `DOCS_ROOT`/`CODE_ROOT` configuration,
   **When** I start the server or call a tool, **Then** I receive a structured
   configuration error describing the missing or invalid root.

---

### User Story 3 - Discover repository structure (Priority: P3)

As a developer, I want to list directories within `docs` or `code` so I can
navigate to relevant files before searching or opening them.

**Why this priority**: Improves discoverability and reduces trial-and-error.

**Independent Test**: List a known directory and confirm returned entries match
the filesystem and are relative to the repo root.

**Acceptance Scenarios**:

1. **Given** a valid repo root, **When** I call `list_dir` with no path,
   **Then** I receive the top-level entries relative to the repo root.
2. **Given** a path to a subdirectory, **When** I call `list_dir`, **Then** I
   receive only entries within that directory and exclude hidden/ignored files.

### Edge Cases

- What happens when `search` is called with an empty query or a limit of zero?
- How does the system handle binary or non-text files in the repository roots?
- What happens when `get_snippet` requests a range beyond file bounds?
- How does the system respond when a repo name is invalid or unsupported?

## Constitution Constraints *(mandatory)*

- The server MUST run as a local process started by MCP clients and communicate
  exclusively via stdio.
- The server MUST require no network access for core functionality.
- All filesystem access MUST be read-only and confined to configured roots.
- Retrieval MUST be deterministic for identical inputs on unchanged files.
- Repository roots MUST be provided via configuration, not hard-coded.

## Assumptions

- The `docs` and `code` repositories are local checkouts with read permissions.
- Client tools provide configuration via environment variables or a local config
  file before tool calls.

## Dependencies

- MCP clients support stdio-based local server execution.
- Local repositories are available at configured roots when tools are invoked.
## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose MCP tools: `search`, `open_file`, `get_snippet`,
  and `list_dir`.
- **FR-002**: `search` MUST accept `repo` as `docs`, `code`, or `both` and perform
  deterministic keyword search over the selected roots.
- **FR-003**: `search` results MUST include relative file path, line number(s),
  and matched text preview, returned in a stable order for identical inputs.
- **FR-004**: `open_file` MUST return full file contents with line numbers and
  reject paths outside the configured repo root.
- **FR-005**: `get_snippet` MUST return only the requested line range, clamping
  to file bounds and rejecting invalid ranges with clear errors.
- **FR-006**: `list_dir` MUST return files and directories relative to the repo
  root and exclude hidden or ignored files when applicable.
- **FR-007**: Each tool MUST define JSON schemas for inputs and outputs, and
  errors MUST be structured with stable, documented fields.
- **FR-008**: Configuration MUST support `DOCS_ROOT` and `CODE_ROOT` via
  environment variables or a local config file.
- **FR-009**: The system MUST validate missing configuration, non-existent
  directories, and non-readable paths with explicit error messages.
- **FR-010**: The system MUST be read-only and MUST NOT modify files.
- **FR-011**: The system MUST communicate exclusively over stdio for MCP
  compatibility.
- **FR-012**: The system MUST NOT require network access for core functionality.
- **FR-013**: Reasonable defaults MUST be defined for optional parameters such as
  `search` result limits.
- **FR-014**: The specification MUST enumerate error cases and expected messages
  for each tool.
- **FR-015**: The specification MUST include an acceptance checklist for each
  tool.

### Key Entities *(include if feature involves data)*

- **RepositoryRoot**: Logical repo name (`docs` or `code`) mapped to a local root
  directory.
- **SearchMatch**: A result containing relative path, line number(s), and matched
  text preview.
- **FileContent**: Full file content paired with line numbers.
- **Snippet**: A bounded subset of file lines with start/end line numbers.
- **DirectoryEntry**: A file or directory item listed relative to repo root.
- **ToolError**: Structured error object describing type, message, and context.
- **ToolSchema**: JSON schema describing tool input and output shapes.

## Out of Scope

- Semantic search or embeddings
- Network access
- Authentication or authorization
- Code modification or execution

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Repeating the same `search` query against unchanged files produces
  identical ordered results 100% of the time in validation runs.
- **SC-002**: 95% of standard retrieval operations complete successfully without
  errors when inputs are valid.
- **SC-003**: For repositories up to 1 million lines, 95% of `search` requests
  return results within 2 seconds on a typical developer machine.
- **SC-004**: 100% of invalid path attempts are blocked with a structured error
  that identifies the reason (missing, unreadable, or out-of-root).
