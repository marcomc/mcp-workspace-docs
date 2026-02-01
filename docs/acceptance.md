# Tool Acceptance Checklists

## search

- [ ] Accepts `repo` as `docs`, `code`, or `both`
- [ ] Rejects empty `query`
- [ ] Applies default limit (200) when omitted
- [ ] Returns per-match results with `path`, `line`, `preview`
- [ ] Returns stable ordering for identical inputs
- [ ] Uses shared response envelope with `meta`

## ping

- [ ] Returns `status` and `version`
- [ ] Uses shared response envelope with `meta`

## open_file

- [ ] Rejects paths outside repo root
- [ ] Returns full file contents with line numbers
- [ ] Uses shared response envelope with `meta`

## get_snippet

- [ ] Clamps line ranges to file bounds
- [ ] Rejects invalid ranges
- [ ] Returns snippet lines with line numbers
- [ ] Uses shared response envelope with `meta`

## list_dir

- [ ] Lists entries relative to repo root
- [ ] Excludes hidden dotfiles/directories
- [ ] Respects ignore rules (e.g., `.gitignore`)
- [ ] Uses shared response envelope with `meta`
