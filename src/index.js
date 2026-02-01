import { loadConfig } from "./config/config.js";
import { validateConfig } from "./config/validate.js";
import { MCPServer } from "./core/server.js";
import { ping } from "./tools/ping.js";

const config = loadConfig();
validateConfig(config);

const server = new MCPServer({
  config,
  tools: {
    ping
  }
});

server.start();
