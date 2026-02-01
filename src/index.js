import { loadConfig } from "./config/config.js";
import { validateConfig } from "./config/validate.js";
import { MCPServer } from "./core/server.js";
import { ping } from "./tools/ping.js";
import { listDir } from "./tools/list_dir.js";
import { openFile } from "./tools/open_file.js";
import { getSnippet } from "./tools/get_snippet.js";
import { search } from "./tools/search.js";

const config = loadConfig();
validateConfig(config);

const server = new MCPServer({
  config,
  tools: {
    ping,
    list_dir: listDir,
    open_file: openFile,
    get_snippet: getSnippet,
    search
  }
});

server.start();
