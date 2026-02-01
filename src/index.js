import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config/config.js";
import { validateConfig } from "./config/validate.js";
import { MCPServer } from "./core/server.js";
import { listDir } from "./tools/list_dir.js";
import { openFile } from "./tools/open_file.js";
import { getSnippet } from "./tools/get_snippet.js";
import { search } from "./tools/search.js";
import { smartSearch } from "./tools/smart_search.js";

function loadToolSchemas() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const schemaDir = path.join(moduleDir, "schemas");
  if (!fs.existsSync(schemaDir)) {
    return {};
  }
  const schemas = {};
  for (const file of fs.readdirSync(schemaDir)) {
    if (!file.endsWith(".json")) {
      continue;
    }
    const filePath = path.join(schemaDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (data?.tool) {
      schemas[data.tool] = data;
    }
  }
  return schemas;
}

const config = loadConfig();
validateConfig(config);

const server = new MCPServer({
  config,
  toolSchemas: loadToolSchemas(),
  serverInfo: { name: "MCP Workspace Doc", version: "0.1.0" },
  tools: {
    list_dir: listDir,
    open_file: openFile,
    get_snippet: getSnippet,
    search,
    smart_search: smartSearch
  }
});

server.start();
