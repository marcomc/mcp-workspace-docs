export function loadConfig(env = process.env) {
  return {
    docsRoot: env.DOCS_ROOT || "",
    codeRoot: env.CODE_ROOT || ""
  };
}
