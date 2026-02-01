import { spawn } from "node:child_process";
import { strict as assert } from "node:assert";
import test from "node:test";

const DOCS_ROOT = process.env.DOCS_ROOT;
const CODE_ROOT = process.env.CODE_ROOT;

const shouldSkip = !DOCS_ROOT || !CODE_ROOT;

async function runPingAndCaptureLogs() {
  const child = spawn("node", ["./src/index.js"], {
    env: {
      ...process.env,
      DOCS_ROOT,
      CODE_ROOT
    },
    stdio: ["pipe", "pipe", "pipe"]
  });

  child.stdin.write(`${JSON.stringify({ tool: "ping", params: {} })}\n`);

  const logLine = await new Promise((resolve, reject) => {
    let buffer = "";
    const timeout = setTimeout(() => {
      reject(new Error("logging test timed out"));
    }, 2000);

    child.stderr.on("data", (data) => {
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
  return JSON.parse(logLine);
}

test("logging emits structured tool_request entries", async (t) => {
  if (shouldSkip) {
    t.skip("DOCS_ROOT and CODE_ROOT must be set");
    return;
  }

  const entry = await runPingAndCaptureLogs();

  assert.equal(entry.level, "info");
  assert.equal(entry.event, "tool_request");
  assert.equal(entry.tool, "ping");
  assert.equal(entry.repo, "both");
  assert.ok(typeof entry.duration_ms === "number");
});
