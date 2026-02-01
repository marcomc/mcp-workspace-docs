# Data Model: MCP Retrieval Tools

**Date**: 2026-02-01
**Feature**: specs/001-mcp-retrieval-tools/spec.md

## Entities

### RepositoryRoot

**Fields**:

- `name`: `docs` or `code`
- `root_path`: absolute directory path

**Validation**:

- Must exist and be readable at startup.
- Must not be a file.

### SearchMatch

**Fields**:

- `path`: relative file path
- `line`: line number (1-based)
- `preview`: matched text preview

**Validation**:

- `path` must be within repo root.
- `line` must be >= 1.

### SmartSearchMatch

**Fields**:

- `repo`: `docs` or `code`
- `path`: relative file path
- `line`: line number (1-based)
- `preview`: matched text preview

**Validation**:

- `repo` must be `docs` or `code`.
- `path` must be within repo root.
- `line` must be >= 1.

### FileContent

**Fields**:

- `path`: relative file path
- `lines`: array of `{ line, text }`

**Validation**:

- `path` must be within repo root.
- `lines` must be ordered by line number ascending.

### Snippet

**Fields**:

- `path`: relative file path
- `start_line`: requested start line
- `end_line`: requested end line
- `lines`: array of `{ line, text }`

**Validation**:

- Range must be clamped to file bounds.
- `start_line` must be <= `end_line` after clamping.

### DirectoryEntry

**Fields**:

- `path`: relative path
- `type`: `file` or `directory`

**Validation**:

- Hidden dotfiles/directories are excluded.
- Ignored files are excluded (e.g., `.gitignore`).

### ToolError

**Fields**:

- `code`: machine-readable error code
- `message`: human-readable summary
- `details`: object with context (e.g., `path`, `repo`, `reason`)

**Validation**:

- `code` must be one of the documented error codes.
- `message` must be non-empty.

### ToolResponseMeta

**Fields**:

- `repo`: `docs`, `code`, or `both`
- `duration_ms`: non-negative integer
- `truncated`: boolean

**Validation**:

- `duration_ms` >= 0

## Relationships

- `RepositoryRoot` is referenced by all tool requests.
- `SearchMatch`, `FileContent`, `Snippet`, and `DirectoryEntry` are results for
  their respective tools, wrapped in a shared response envelope.
