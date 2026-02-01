# Tool Error Cases

Repository-wide catalog of error codes and messages for MCP tools.

## search

- `CONFIG_INVALID`: Invalid repository configuration
- `QUERY_EMPTY`: Query must be non-empty
- `LIMIT_INVALID`: Limit must be >= 1
- `REPO_INVALID`: Repo must be docs, code, or both (when provided)

## open_file

- `CONFIG_INVALID`: Invalid repository configuration
- `PATH_EMPTY`: Path must be non-empty
- `PATH_OUT_OF_ROOT`: Path must be within repo root
- `PATH_AMBIGUOUS`: Path matches multiple repositories
- `FILE_NOT_FOUND`: File not found
- `FILE_UNREADABLE`: File not readable

## get_snippet

- `CONFIG_INVALID`: Invalid repository configuration
- `PATH_EMPTY`: Path must be non-empty
- `PATH_OUT_OF_ROOT`: Path must be within repo root
- `PATH_AMBIGUOUS`: Path matches multiple repositories
- `FILE_NOT_FOUND`: File not found
- `FILE_UNREADABLE`: File not readable
- `RANGE_INVALID`: Invalid line range

## list_dir

- `CONFIG_INVALID`: Invalid repository configuration
- `PATH_OUT_OF_ROOT`: Path must be within repo root
- `PATH_AMBIGUOUS`: Path matches multiple repositories
- `DIR_NOT_FOUND`: Directory not found
- `DIR_UNREADABLE`: Directory not readable
