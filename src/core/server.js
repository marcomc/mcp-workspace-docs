import { wrapResult } from "./response.js";
import { createError } from "../errors/errors.js";
import { logRequest, logError } from "./logging.js";

export class MCPServer {
  constructor({ tools, config, toolSchemas, serverInfo }) {
    this.tools = tools;
    this.config = config;
    this.toolSchemas = toolSchemas || {};
    this.serverInfo = serverInfo || { name: "MCP Workspace Doc", version: "0.1.0" };
    this.toolDescriptions = {
      list_dir: "List files and directories in the workspace docs or code repos. Use when you need to discover structure before searching or opening files. Defaults to a virtual root when no repo/path is provided.",
      open_file: "Open a file from workspace docs or code and return the full contents with line numbers. Use for grounded citations and to inspect exact text.",
      get_snippet: "Return a specific line range from a file with line numbers. Use to quote exact evidence with minimal context and to clamp ranges safely.",
      search: "Deterministic keyword search across workspace docs/code. Use for exact string matches and repeatable results; respects file_glob filters. Example: search({query: \"ws commands\", file_glob: \"docs/**\", limit: 20}).",
      smart_search: "Repo-agnostic deterministic search across workspace docs and code. Returns repo-qualified matches to help answer questions without requiring repo knowledge. Example: smart_search({query: \"ws commands\", limit: 20})."
    };
  }

  async handleRequest(payload) {
    if (payload?.jsonrpc === "2.0" && payload?.method) {
      return this.handleJsonRpc(payload);
    }

    if (!payload || typeof payload !== "object") {
      return createError("INVALID_REQUEST", "Invalid request payload", {
        reason: "NOT_OBJECT"
      });
    }

    const { tool, params, id } = payload;
    if (!tool || typeof tool !== "string") {
      return createError("INVALID_REQUEST", "Invalid request payload", {
        reason: "MISSING_TOOL"
      });
    }

    const handler = this.tools[tool];
    if (!handler) {
      return createError("TOOL_NOT_FOUND", "Tool not found", { tool });
    }

    const start = Date.now();
    try {
      const result = await handler({ params: params || {}, config: this.config });
      const response = wrapResult(result, {
        repo: params?.repo ?? "both",
        duration_ms: Date.now() - start,
        truncated: false
      });

      logRequest({
        tool,
        repo: response.meta.repo,
        durationMs: response.meta.duration_ms
      });

      if (id !== undefined) {
        return { id, ...response };
      }
      return response;
    } catch (error) {
      if (error && error.error) {
        logError({
          tool,
          code: error.error.code,
          message: error.error.message
        });
        return id !== undefined ? { id, ...error } : error;
      }

      const wrapped = createError("INTERNAL_ERROR", "Unhandled error", {
        message: error?.message || String(error)
      });
      logError({
        tool,
        code: wrapped.error.code,
        message: wrapped.error.message
      });
      return id !== undefined ? { id, ...wrapped } : wrapped;
    }
  }

  async handleJsonRpc(payload) {
    const { id, method, params } = payload;

    if (method === "notifications/initialized" || method === "initialized") {
      return null;
    }

    if (method === "initialize") {
      if (id === undefined || id === null) {
        return null;
      }
      const protocolVersion = params?.protocolVersion || "2024-11-05";
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion,
          capabilities: { tools: { listChanged: true } },
          serverInfo: this.serverInfo
        }
      };
    }

    if (method === "tools/list") {
      if (id === undefined || id === null) {
        return null;
      }
      const tools = Object.keys(this.tools).map((name) => ({
        name,
        description: this.toolDescriptions[name] || "",
        inputSchema: this.toolSchemas[name]?.input_schema || {
          type: "object",
          additionalProperties: false,
          properties: {}
        }
      }));
      return {
        jsonrpc: "2.0",
        id,
        result: { tools }
      };
    }

    if (method === "tools/call") {
      if (id === undefined || id === null) {
        return null;
      }
      const toolName = params?.name;
      const args = params?.arguments || {};
      const handler = this.tools[toolName];

      if (!toolName || typeof toolName !== "string" || !handler) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: "Tool not found",
            data: { tool: toolName }
          }
        };
      }

      const start = Date.now();
      try {
        const result = await handler({ params: args, config: this.config });
        const envelope = wrapResult(result, {
          repo: args?.repo ?? "both",
          duration_ms: Date.now() - start,
          truncated: false
        });

        logRequest({
          tool: toolName,
          repo: envelope.meta.repo,
          durationMs: envelope.meta.duration_ms
        });

        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(envelope) }],
            data: envelope,
            isError: false
          }
        };
      } catch (error) {
        const wrapped = error && error.error
          ? error
          : createError("INTERNAL_ERROR", "Unhandled error", {
              message: error?.message || String(error)
            });

        logError({
          tool: toolName,
          code: wrapped.error.code,
          message: wrapped.error.message
        });

        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -32000,
            message: wrapped.error.message,
            data: wrapped
          }
        };
      }
    }

    if (id === undefined || id === null) {
      return null;
    }

    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: "Method not found",
        data: { method }
      }
    };
  }

  start() {
    let buffer = Buffer.alloc(0);
    let announcedTools = false;

    const tryHandlePayload = async (payload) => {
      const response = await this.handleRequest(payload);
      if (response !== null && response !== undefined) {
        process.stdout.write(`${JSON.stringify(response)}\n`);
      }
    };

    const announceToolsChanged = () => {
      if (announcedTools) {
        return;
      }
      announcedTools = true;
      const notification = {
        jsonrpc: "2.0",
        method: "notifications/tools/list_changed"
      };
      process.stdout.write(`${JSON.stringify(notification)}\n`);
    };

    const writeParseError = (message) => {
      const response = {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error",
          data: { message }
        }
      };
      process.stdout.write(`${JSON.stringify(response)}\n`);
    };

    const handleHeaderFramed = async () => {
      while (true) {
        const headerEnd = buffer.indexOf("\r\n\r\n");
        if (headerEnd === -1) {
          return;
        }
        const headerText = buffer.slice(0, headerEnd).toString("utf8");
        const match = headerText.match(/content-length:\s*(\d+)/i);
        if (!match) {
          writeParseError("Missing Content-Length header");
          buffer = buffer.slice(headerEnd + 4);
          continue;
        }
        const contentLength = Number(match[1]);
        const bodyStart = headerEnd + 4;
        const bodyEnd = bodyStart + contentLength;
        if (buffer.length < bodyEnd) {
          return;
        }
        const body = buffer.slice(bodyStart, bodyEnd).toString("utf8");
        buffer = buffer.slice(bodyEnd);
        if (!body.trim()) {
          continue;
        }
        try {
          const payload = JSON.parse(body);
          await tryHandlePayload(payload);
        } catch (error) {
          writeParseError(error.message);
        }
      }
    };

    const handleLineFramed = async () => {
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex).toString("utf8");
        buffer = buffer.slice(newlineIndex + 1);
        if (!line.trim()) {
          continue;
        }
        try {
          const payload = JSON.parse(line);
          await tryHandlePayload(payload);
        } catch (error) {
          writeParseError(error.message);
        }
      }
    };

    process.stdin.on("data", async (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.includes("\r\n\r\n")) {
        await handleHeaderFramed();
      } else if (buffer.includes("\n")) {
        await handleLineFramed();
      }
    });

    announceToolsChanged();
  }
}
