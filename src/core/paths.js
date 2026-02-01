import path from "node:path";

import { createError } from "../errors/errors.js";

function getRootForRepo(repo, config) {
  if (repo === "docs") {
    return config.docsRoot;
  }
  if (repo === "code") {
    return config.codeRoot;
  }
  throw createError("REPO_INVALID", "Repo must be docs or code", { repo });
}

export function resolvePathForRepo(repo, relPath, config) {
  const root = getRootForRepo(repo, config);
  const normalized = relPath ? relPath.replace(/^\/+/, "") : "";

  if (relPath && path.isAbsolute(relPath)) {
    throw createError("PATH_OUT_OF_ROOT", "Path must be within repo root", {
      repo,
      path: relPath
    });
  }

  const resolved = path.resolve(root, normalized || ".");
  const rootWithSep = root.endsWith(path.sep) ? root : `${root}${path.sep}`;

  if (resolved !== root && !resolved.startsWith(rootWithSep)) {
    throw createError("PATH_OUT_OF_ROOT", "Path must be within repo root", {
      repo,
      path: relPath
    });
  }

  return {
    root,
    absolutePath: resolved,
    relativePath: normalized || "."
  };
}
