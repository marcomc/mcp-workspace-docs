import fs from "node:fs";
import path from "node:path";

import { createError } from "../errors/errors.js";
import { getRepoCandidates, splitRepoPath } from "../core/paths.js";
import { isIgnored, loadIgnoreRules } from "../core/ignore.js";

function toPosix(value) {
  return value.split(path.sep).join("/");
}

export async function listDir({ params, config }) {
  let { repo, path: relPath } = params;

  if (!repo && (!relPath || relPath === ".")) {
    params.repo = "both";
    return {
      path: ".",
      entries: [
        { path: "docs", type: "directory" },
        { path: "code", type: "directory" }
      ]
    };
  }

  if (!repo) {
    const split = splitRepoPath(relPath);
    if (split.repo) {
      repo = split.repo;
      relPath = split.path;
      params.repo = repo;
    }
  }

  const candidates = getRepoCandidates(repo, relPath || "", config);
  const matches = [];

  for (const candidate of candidates) {
    let stats;
    try {
      stats = fs.statSync(candidate.absolutePath);
    } catch (error) {
      if (error?.code === "ENOENT") {
        continue;
      }
      throw createError("DIR_UNREADABLE", "Directory not readable", {
        repo: candidate.repo,
        path: relPath || "."
      });
    }

    if (stats.isDirectory()) {
      matches.push(candidate);
    }
  }

  if (matches.length === 0) {
    throw createError("DIR_NOT_FOUND", "Directory not found", {
      repo: repo || "both",
      path: relPath || "."
    });
  }

  if (matches.length > 1) {
    throw createError("PATH_AMBIGUOUS", "Path matches multiple repositories", {
      path: relPath || ".",
      repos: matches.map((match) => match.repo)
    });
  }

  const { absolutePath, relativePath, root, repo: resolvedRepo } = matches[0];
  params.repo = resolvedRepo;

  let entries;
  try {
    entries = fs.readdirSync(absolutePath, { withFileTypes: true });
  } catch (error) {
    throw createError("DIR_UNREADABLE", "Directory not readable", {
      repo: resolvedRepo,
      path: relPath || "."
    });
  }

  const ignoreRules = loadIgnoreRules(root);
  const results = [];

  const basePath = relativePath === "." ? "" : relativePath;

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const entryRelative = basePath
      ? path.join(basePath, entry.name)
      : entry.name;
    const entryRelativePosix = toPosix(entryRelative);
    const entryIsDir = entry.isDirectory();

    if (isIgnored(entryRelativePosix, entryIsDir, ignoreRules)) {
      continue;
    }

    results.push({
      path: entryRelativePosix,
      type: entryIsDir ? "directory" : "file"
    });
  }

  return {
    path: toPosix(relativePath),
    entries: results
  };
}
