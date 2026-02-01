# Tool Acceptance Checklists

Repository-wide acceptance criteria for MCP tool behavior.

## search

- [ ] Accepts `repo` as `docs`, `code`, or `both` (defaults to `both`)
- [ ] Rejects empty `query`
- [ ] Applies default limit (200) when omitted
- [ ] Returns per-match results with `path`, `line`, `preview`
- [ ] Returns stable ordering for identical inputs
- [ ] Uses shared response envelope with `meta`

## open_file

- [ ] Rejects paths outside repo root
- [ ] Resolves repo automatically when `repo` is omitted
- [ ] Errors when path matches both repos
- [ ] Returns full file contents with line numbers
- [ ] Uses shared response envelope with `meta`

## get_snippet

- [ ] Clamps line ranges to file bounds
- [ ] Rejects invalid ranges
- [ ] Resolves repo automatically when `repo` is omitted
- [ ] Errors when path matches both repos
- [ ] Returns snippet lines with line numbers
- [ ] Uses shared response envelope with `meta`

## list_dir

- [ ] Lists entries relative to repo root
- [ ] Excludes hidden dotfiles/directories
- [ ] Respects ignore rules (e.g., `.gitignore`)
- [ ] Returns a virtual root when `repo` is omitted
- [ ] Uses shared response envelope with `meta`
