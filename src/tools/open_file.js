import fs from "node:fs";

import { createError } from "../errors/errors.js";
import { getRepoCandidates, splitRepoPath } from "../core/paths.js";

export async function openFile({ params, config }) {
  let { repo, path } = params;

  if (!path || typeof path !== "string") {
    throw createError("PATH_EMPTY", "Path must be non-empty", { repo });
  }

  if (!repo) {
    const split = splitRepoPath(path);
    if (split.repo) {
      repo = split.repo;
      path = split.path;
      params.repo = repo;
    }
  }

  const candidates = getRepoCandidates(repo, path, config);
  const matches = [];

  for (const candidate of candidates) {
    let stats;
    try {
      stats = fs.statSync(candidate.absolutePath);
    } catch (error) {
      if (error?.code === "ENOENT") {
        continue;
      }
      throw createError("FILE_UNREADABLE", "File not readable", {
        repo: candidate.repo,
        path
      });
    }

    if (stats.isFile()) {
      matches.push(candidate);
    }
  }

  if (matches.length === 0) {
    throw createError("FILE_NOT_FOUND", "File not found", {
      repo: repo || "both",
      path
    });
  }

  if (matches.length > 1) {
    throw createError("PATH_AMBIGUOUS", "Path matches multiple repositories", {
      path,
      repos: matches.map((match) => match.repo)
    });
  }

  const { absolutePath, relativePath, repo: resolvedRepo } = matches[0];
  params.repo = resolvedRepo;

  let content;
  try {
    content = fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    throw createError("FILE_UNREADABLE", "File not readable", {
      repo: resolvedRepo,
      path
    });
  }

  const lines = content.split(/\r?\n/).map((text, index) => ({
    line: index + 1,
    text
  }));

  return {
    path: relativePath,
    lines
  };
}
