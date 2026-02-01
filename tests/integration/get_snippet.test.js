import { spawn } from "node:child_process";
import { strict as assert } from "node:assert";
import test from "node:test";

const DOCS_ROOT = process.env.DOCS_ROOT;
const CODE_ROOT = process.env.CODE_ROOT;
const VERBOSE_LEVEL = Number(process.env.TEST_VERBOSE || "0");

const shouldSkip = !DOCS_ROOT || !CODE_ROOT;

async function runTool(request) {
  const child = spawn("node", ["./src/index.js"], {
    env: {
      ...process.env,
      DOCS_ROOT,
      CODE_ROOT
    },
    stdio: ["pipe", "pipe", "pipe"]
  });

  child.stdin.write(`${JSON.stringify(request)}\n`);

  const response = await new Promise((resolve, reject) => {
    let buffer = "";
    const expectedId = request.id;
    const timeout = setTimeout(() => {
      reject(new Error("get_snippet test timed out"));
    }, 2000);

    child.stdout.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }
        let parsed;
        try {
          parsed = JSON.parse(line);
        } catch (error) {
          continue;
        }
        if (parsed?.method?.startsWith("notifications/")) {
          continue;
        }
        if (expectedId !== undefined && parsed?.id !== expectedId) {
          continue;
        }
        clearTimeout(timeout);
        resolve(line);
        return;
      }
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });

  child.kill();
  return JSON.parse(response);
}

test("get_snippet clamps ranges and returns lines", async (t) => {
  if (shouldSkip) {
    t.skip("DOCS_ROOT and CODE_ROOT must be set");
    return;
  }

  const payload = await runTool({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "get_snippet",
      arguments: {
        repo: "docs",
        path: "README.md",
        start_line: 1,
        end_line: 1000
      }
    }
  });
  const envelope = payload.result?.data;

  if (VERBOSE_LEVEL >= 1) {
    console.log("[get_snippet] response:", payload);
  }
  if (VERBOSE_LEVEL >= 2) {
    console.log("[get_snippet] response (full):", JSON.stringify(payload, null, 2));
  }
  assert.equal(envelope.meta.repo, "docs");
  assert.ok(envelope.result.lines.length >= 1);
  assert.ok(envelope.result.start_line >= 1);
  assert.ok(envelope.result.end_line >= envelope.result.start_line);
});
