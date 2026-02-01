# Quality Gates

This file defines repository-wide quality expectations that apply to all
features and changes, not a single spec.

## Definition of Done

- All constitution principles satisfied without exception.
- Tool schemas documented with examples and versioned if changed.
- Deterministic retrieval verified on unchanged checkouts.
- Docs-only mode validated (no `code` roots required).
- Multi-root routing validated for `docs`, `code`, and `harness`.
- Explicit sync behavior verified (no implicit network access).
- Regression tests cover existing behavior and new features.
- Client smoke tests cover McpOne Local Server and at least one other MCP client.

## PR Checklist

- [ ] Constitution compliance confirmed (principles 0-10)
- [ ] Brownfield compatibility reviewed (tools, config, ordering)
- [ ] Tool schemas unchanged or versioned with compatibility notes
- [ ] Deterministic ordering verified for `search`
- [ ] Docs-only mode validated (no `code` roots)
- [ ] Harness roots covered in tests
- [ ] Sync/update behavior explicit and observable
- [ ] Read-only filesystem guard tested (no writes outside roots)
- [ ] stdio-only transport validated
- [ ] No network calls added to core paths
- [ ] Error messages actionable and include next steps
