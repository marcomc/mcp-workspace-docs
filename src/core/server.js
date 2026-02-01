import readline from "node:readline";

import { wrapResult } from "./response.js";
import { createError } from "../errors/errors.js";

export class MCPServer {
  constructor({ tools, config }) {
    this.tools = tools;
    this.config = config;
  }

  async handleRequest(payload) {
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

      if (id !== undefined) {
        return { id, ...response };
      }
      return response;
    } catch (error) {
      if (error && error.error) {
        return id !== undefined ? { id, ...error } : error;
      }

      const wrapped = createError("INTERNAL_ERROR", "Unhandled error", {
        message: error?.message || String(error)
      });
      return id !== undefined ? { id, ...wrapped } : wrapped;
    }
  }

  start() {
    const rl = readline.createInterface({
      input: process.stdin,
      crlfDelay: Infinity
    });

    rl.on("line", async (line) => {
      if (!line.trim()) {
        return;
      }
      let payload;
      try {
        payload = JSON.parse(line);
      } catch (error) {
        const response = createError("INVALID_JSON", "Invalid JSON payload", {
          message: error.message
        });
        process.stdout.write(`${JSON.stringify(response)}\n`);
        return;
      }

      const response = await this.handleRequest(payload);
      process.stdout.write(`${JSON.stringify(response)}\n`);
    });
  }
}
