# Tool Schema Examples

Repository-wide reference for tool response shapes and ordering rules.

## Shared Response Envelope

```json
{
  "result": {},
  "meta": {
    "repo": "docs",
    "duration_ms": 12,
    "truncated": false
  }
}
```

All tools must wrap their payloads in the shared response envelope above.

## Deterministic Ordering

Search results are ordered by:

1. repo (`docs`, then `code`)
2. relative path (lexicographic)
3. line number (ascending)

## search

```json
{
  "result": [
    {
      "path": "README.md",
      "line": 12,
      "preview": "MCP server overview"
    }
  ],
  "meta": {
    "repo": "docs",
    "duration_ms": 8,
    "truncated": false
  }
}
```

## open_file

```json
{
  "result": {
    "path": "README.md",
    "lines": [
      { "line": 1, "text": "# Project" },
      { "line": 2, "text": "Overview" }
    ]
  },
  "meta": {
    "repo": "docs",
    "duration_ms": 5,
    "truncated": false
  }
}
```

## get_snippet

```json
{
  "result": {
    "path": "README.md",
    "start_line": 1,
    "end_line": 2,
    "lines": [
      { "line": 1, "text": "# Project" },
      { "line": 2, "text": "Overview" }
    ]
  },
  "meta": {
    "repo": "docs",
    "duration_ms": 4,
    "truncated": false
  }
}
```

## list_dir

```json
{
  "result": {
    "path": ".",
    "entries": [
      { "path": "README.md", "type": "file" },
      { "path": "docs", "type": "directory" }
    ]
  },
  "meta": {
    "repo": "docs",
    "duration_ms": 3,
    "truncated": false
  }
}
```

## Error Response

```json
{
  "error": {
    "code": "PATH_OUT_OF_ROOT",
    "message": "Path must be within repo root",
    "details": {
      "repo": "docs",
      "path": "../secrets.txt"
    }
  }
}
```
