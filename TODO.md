# TODO

## Ideas

- Make the CODE_ROOT optional
- allow to use non local paths for DOCS_ROOT and CODE_ROOT (eg. git repos)
- allow multiple DOCS_ROOTs and CODE_ROOTs if the application has multiple repos
- allow to add a new root for workspace harnesses
- allow the MCP to download/update the repos if needed
- add caching layer for file access and search
- add more observability (metrics, tracing)
- make the MCP generic enough to be used for other projects beyond Workspace
  Docs so we can use it for other software docs/codebases
- add indexing for faster search inside the mcp to avoid scanning files on each
  search request and speed up response times and reduce resource usage and
  reduce context size for clients
