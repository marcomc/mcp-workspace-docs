# Installation & Client Wiring

Repository-wide setup instructions for wiring the MCP server into supported
clients.

## Prerequisites

- Node.js 20 LTS
- Local checkouts for `docs` and `code` with read permissions

## Environment Configuration

Set the repository roots before starting the server:

- `DOCS_ROOT`: absolute path to documentation repo
- `CODE_ROOT`: absolute path to source code repo

## McpOne (macOS) - Local Server

1. Open McpOne and navigate to **Local Servers**.
2. Click **Add**.
3. Fill in:
   - **Name**: MCP Workspace Docs 
   - **Command**: `node`
   - **Args**: `./src/index.js`
   - **Working Directory**: repository root
   - **Environment**: `DOCS_ROOT`, `CODE_ROOT`
4. Save and start the server.

**Config snippet (reference):**

```json
{ 
  "name": "MCP Workspace Docs",
  "command": "node",
  "args": ["./src/index.js"],
  "cwd": "/absolute/path/to/mcp-workspace-docs",
  "env": {
    "DOCS_ROOT": "/absolute/path/to/docs",
    "CODE_ROOT": "/absolute/path/to/code"
  }
}
```

## OpenAI Codex CLI / VS Code

Codex CLI and the Codex VS Code extension share the same MCP configuration in
`~/.codex/config.toml` (or a project-scoped `.codex/config.toml`).

### Option A: CLI (recommended)

```bash
codex mcp add mcp-workspace-doc \
  --env DOCS_ROOT=/absolute/path/to/docs \
  --env CODE_ROOT=/absolute/path/to/code \
  -- node ./src/index.js
```

### Option B: config.toml

```toml
[mcp_servers."MCP Workspace Doc"]
command = "node"
args = ["./src/index.js"]
cwd = "/absolute/path/to/mcp-workspace-docs"

[mcp_servers."MCP Workspace Doc".env]
DOCS_ROOT = "/absolute/path/to/docs"
CODE_ROOT = "/absolute/path/to/code"
```

## Gemini CLI

1. Open `~/.gemini/settings.json` (or `.gemini/settings.json` in the project).
2. Add an `mcpServers` entry for the stdio server.
3. Restart the client.

**Config snippet:**

```json
{
  "mcpServers": {
    "mcp-workspace-doc": {
      "command": "node",
      "args": ["./src/index.js"],
      "cwd": "/absolute/path/to/mcp-workspace-docs",
      "env": {
        "DOCS_ROOT": "/absolute/path/to/docs",
        "CODE_ROOT": "/absolute/path/to/code"
      }
    }
  }
}
```

## GitHub Copilot CLI

1. Open Copilot CLI and run the interactive command:
   `/mcp add`
2. Fill in the server details (command, args, env, cwd, tools).
3. Save with `Ctrl`+`S`.

The interactive flow writes to `~/.copilot/mcp-config.json` (or under
`XDG_CONFIG_HOME` if set).

**Config snippet (mcp-config.json):**

```json
{
  "mcpServers": {
    "mcp-workspace-doc": {
      "command": "node",
      "args": ["./src/index.js"],
      "cwd": "/absolute/path/to/mcp-workspace-docs",
      "env": {
        "DOCS_ROOT": "/absolute/path/to/docs",
        "CODE_ROOT": "/absolute/path/to/code"
      },
      "tools": [
        "list_dir",
        "open_file",
        "get_snippet",
        "search",
        "smart_search"
      ]
    }
  }
}
```

## Smoke Test

```bash
DOCS_ROOT=/path/to/docs CODE_ROOT=/path/to/code npm test
```

## Notes

- This server communicates only over stdio and performs read-only operations.
- Ensure the working directory is the repository root when launching.
