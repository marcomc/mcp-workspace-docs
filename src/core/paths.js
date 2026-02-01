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

export function splitRepoPath(relPath) {
  if (typeof relPath !== "string" || relPath.trim() === "") {
    return { repo: null, path: relPath };
  }

  if (relPath === "docs" || relPath === "code") {
    return { repo: relPath, path: "" };
  }

  if (relPath.startsWith("docs/")) {
    return { repo: "docs", path: relPath.slice("docs/".length) };
  }

  if (relPath.startsWith("code/")) {
    return { repo: "code", path: relPath.slice("code/".length) };
  }

  return { repo: null, path: relPath };
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

export function getRepoCandidates(repo, relPath, config) {
  if (repo) {
    const resolved = resolvePathForRepo(repo, relPath, config);
    return [{ repo, ...resolved }];
  }

  const { repo: inferred, path: inferredPath } = splitRepoPath(relPath);
  if (inferred) {
    const resolved = resolvePathForRepo(inferred, inferredPath, config);
    return [{ repo: inferred, ...resolved }];
  }

  return ["docs", "code"].map((candidate) => ({
    repo: candidate,
    ...resolvePathForRepo(candidate, relPath || "", config)
  }));
}
