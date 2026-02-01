import { spawn } from "node:child_process";
import { strict as assert } from "node:assert";
import test from "node:test";

const DOCS_ROOT = process.env.DOCS_ROOT;
const CODE_ROOT = process.env.CODE_ROOT;

const shouldSkip = !DOCS_ROOT || !CODE_ROOT;

(test)("ping returns status and version", async (t) => {
  if (shouldSkip) {
    t.skip("DOCS_ROOT and CODE_ROOT must be set");
    return;
  }

  const child = spawn("node", ["./src/index.js"], {
    env: {
      ...process.env,
      DOCS_ROOT,
      CODE_ROOT
    },
    stdio: ["pipe", "pipe", "pipe"]
  });

  const request = JSON.stringify({ tool: "ping", params: {} });
  child.stdin.write(`${request}\n`);

  const response = await new Promise((resolve, reject) => {
    let buffer = "";
    const timeout = setTimeout(() => {
      reject(new Error("ping test timed out"));
    }, 2000);

    child.stdout.on("data", (data) => {
      buffer += data.toString();
      const line = buffer.trim().split("\n")[0];
      if (!line) {
        return;
      }
      clearTimeout(timeout);
      resolve(line);
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });

  child.kill();

  const payload = JSON.parse(response);
  assert.equal(payload.result.status, "ok");
  assert.equal(typeof payload.result.version, "string");
  assert.equal(typeof payload.meta.duration_ms, "number");
});
