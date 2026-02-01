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
    const timeout = setTimeout(() => {
      reject(new Error("list_dir test timed out"));
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

test("list_dir returns entries for docs root", async (t) => {
  if (shouldSkip) {
    t.skip("DOCS_ROOT and CODE_ROOT must be set");
    return;
  }

  const payload = await runTool({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "list_dir", arguments: { repo: "docs", path: "" } }
  });
  const envelope = payload.result?.data;

  if (VERBOSE_LEVEL >= 1) {
    console.log("[list_dir] response:", payload);
  }
  if (VERBOSE_LEVEL >= 2) {
    console.log("[list_dir] response (full):", JSON.stringify(payload, null, 2));
  }
  assert.equal(envelope.meta.repo, "docs");
  assert.ok(Array.isArray(envelope.result.entries));
});

test("list_dir returns virtual root when repo omitted", async (t) => {
  if (shouldSkip) {
    t.skip("DOCS_ROOT and CODE_ROOT must be set");
    return;
  }

  const payload = await runTool({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "list_dir", arguments: { path: "" } }
  });
  const envelope = payload.result?.data;

  if (VERBOSE_LEVEL >= 1) {
    console.log("[list_dir] response (virtual root):", payload);
  }
  if (VERBOSE_LEVEL >= 2) {
    console.log(
      "[list_dir] response (virtual root full):",
      JSON.stringify(payload, null, 2)
    );
  }
  assert.equal(envelope.meta.repo, "both");
  assert.ok(Array.isArray(envelope.result.entries));
  assert.ok(envelope.result.entries.find((entry) => entry.path === "docs"));
  assert.ok(envelope.result.entries.find((entry) => entry.path === "code"));
});
