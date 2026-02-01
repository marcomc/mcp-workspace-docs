# Quality Gates

This file defines repository-wide quality expectations that apply to all
features and changes, not a single spec.

## Definition of Done

- All constitution principles satisfied without exception.
- Tool schemas documented with examples.
- Deterministic retrieval verified on unchanged repositories.
- No network access required for core functionality.
- Client smoke tests cover McpOne Local Server and at least one other MCP client.

## PR Checklist

- [ ] Constitution compliance confirmed (principles 1-8)
- [ ] Tool schemas unchanged or versioned with compatibility notes
- [ ] Deterministic ordering verified for `search`
- [ ] Read-only filesystem guard tested (no writes outside roots)
- [ ] stdio-only transport validated
- [ ] No network calls added to core paths
- [ ] Error messages actionable and include next steps
