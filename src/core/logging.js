export function logRequest({ tool, repo, durationMs }) {
  const entry = {
    level: "info",
    event: "tool_request",
    tool,
    repo,
    duration_ms: durationMs
  };
  process.stderr.write(`${JSON.stringify(entry)}\n`);
}

export function logError({ tool, code, message }) {
  const entry = {
    level: "error",
    event: "tool_error",
    tool,
    code,
    message
  };
  process.stderr.write(`${JSON.stringify(entry)}\n`);
}
