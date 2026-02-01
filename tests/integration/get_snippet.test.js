import { spawn } from "node:child_process";
import { strict as assert } from "node:assert";
import test from "node:test";

const DOCS_ROOT = process.env.DOCS_ROOT;
const CODE_ROOT = process.env.CODE_ROOT;

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
    const timeout = setTimeout(() => {
      reject(new Error("get_snippet test timed out"));
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
  return JSON.parse(response);
}

test("get_snippet clamps ranges and returns lines", async (t) => {
  if (shouldSkip) {
    t.skip("DOCS_ROOT and CODE_ROOT must be set");
    return;
  }

  const payload = await runTool({
    tool: "get_snippet",
    params: {
      repo: "docs",
      path: "README.md",
      start_line: 1,
      end_line: 1000
    }
  });

  assert.equal(payload.meta.repo, "docs");
  assert.ok(payload.result.lines.length >= 1);
  assert.ok(payload.result.start_line >= 1);
  assert.ok(payload.result.end_line >= payload.result.start_line);
});
