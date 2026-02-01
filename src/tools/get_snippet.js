import fs from "node:fs";

import { createError } from "../errors/errors.js";
import { getRepoCandidates, splitRepoPath } from "../core/paths.js";

export async function getSnippet({ params, config }) {
  let { repo, path, start_line: startLine, end_line: endLine } = params;

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

  if (!Number.isInteger(startLine) || !Number.isInteger(endLine)) {
    throw createError("RANGE_INVALID", "Invalid line range", {
      repo,
      start_line: startLine,
      end_line: endLine
    });
  }

  if (startLine < 1 || endLine < 1) {
    throw createError("RANGE_INVALID", "Invalid line range", {
      repo,
      start_line: startLine,
      end_line: endLine
    });
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

  const allLines = content.split(/\r?\n/);
  const totalLines = allLines.length;

  const clampedStart = Math.max(1, Math.min(startLine, totalLines));
  const clampedEnd = Math.max(1, Math.min(endLine, totalLines));

  if (clampedStart > clampedEnd) {
    throw createError("RANGE_INVALID", "Invalid line range", {
      repo,
      start_line: startLine,
      end_line: endLine
    });
  }

  const lines = [];
  for (let index = clampedStart; index <= clampedEnd; index += 1) {
    lines.push({
      line: index,
      text: allLines[index - 1]
    });
  }

  return {
    path: relativePath,
    start_line: clampedStart,
    end_line: clampedEnd,
    lines
  };
}
