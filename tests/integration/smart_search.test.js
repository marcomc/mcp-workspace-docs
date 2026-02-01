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
      reject(new Error("smart_search test timed out"));
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

test("smart_search defaults to both repos and returns repo-qualified results", async (t) => {
  if (shouldSkip) {
    t.skip("DOCS_ROOT and CODE_ROOT must be set");
    return;
  }

  const payload = await runTool({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "smart_search", arguments: { query: "Workspace", limit: 5 } }
  });
  const envelope = payload.result?.data;

  if (VERBOSE_LEVEL >= 1) {
    console.log("[smart_search] response:", payload);
  }
  if (VERBOSE_LEVEL >= 2) {
    console.log("[smart_search] response (full):", JSON.stringify(payload, null, 2));
  }

  assert.equal(envelope.meta.repo, "both");
  assert.ok(Array.isArray(envelope.result));
  if (envelope.result.length > 0) {
    assert.ok(["docs", "code"].includes(envelope.result[0].repo));
  }
});

test("smart_search honors repo-prefixed file_glob patterns", async (t) => {
  if (shouldSkip) {
    t.skip("DOCS_ROOT and CODE_ROOT must be set");
    return;
  }

  const payload = await runTool({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "smart_search",
      arguments: {
        repo: "both",
        query: "Workspace",
        file_glob: "docs/**/*.md",
        limit: 5
      }
    }
  });
  const envelope = payload.result?.data;

  if (VERBOSE_LEVEL >= 1) {
    console.log("[smart_search] repo-prefixed glob response:", payload);
  }
  if (VERBOSE_LEVEL >= 2) {
    console.log(
      "[smart_search] repo-prefixed glob response (full):",
      JSON.stringify(payload, null, 2)
    );
  }

  assert.equal(envelope.meta.repo, "both");
  assert.ok(Array.isArray(envelope.result));
  assert.ok(envelope.result.length > 0);
  assert.ok(envelope.result.every((match) => match.repo === "docs"));
});
