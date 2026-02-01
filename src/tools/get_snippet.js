import fs from "node:fs";

import { createError } from "../errors/errors.js";
import { resolvePathForRepo } from "../core/paths.js";

export async function getSnippet({ params, config }) {
  const { repo, path, start_line: startLine, end_line: endLine } = params;

  if (!path || typeof path !== "string") {
    throw createError("PATH_EMPTY", "Path must be non-empty", { repo });
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

  const { absolutePath, relativePath } = resolvePathForRepo(repo, path, config);

  let stats;
  try {
    stats = fs.statSync(absolutePath);
  } catch (error) {
    throw createError("FILE_NOT_FOUND", "File not found", { repo, path });
  }

  if (!stats.isFile()) {
    throw createError("FILE_NOT_FOUND", "File not found", { repo, path });
  }

  let content;
  try {
    content = fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    throw createError("FILE_UNREADABLE", "File not readable", { repo, path });
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
