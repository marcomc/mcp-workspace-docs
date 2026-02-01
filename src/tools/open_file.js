import fs from "node:fs";

import { createError } from "../errors/errors.js";
import { resolvePathForRepo } from "../core/paths.js";

export async function openFile({ params, config }) {
  const { repo, path } = params;

  if (!path || typeof path !== "string") {
    throw createError("PATH_EMPTY", "Path must be non-empty", { repo });
  }

  const { absolutePath, relativePath } = resolvePathForRepo(repo, path, config);

  let stats;
  try {
    stats = fs.statSync(absolutePath);
  } catch (error) {
    throw createError("FILE_NOT_FOUND", "File not found", {
      repo,
      path
    });
  }

  if (!stats.isFile()) {
    throw createError("FILE_NOT_FOUND", "File not found", {
      repo,
      path
    });
  }

  let content;
  try {
    content = fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    throw createError("FILE_UNREADABLE", "File not readable", {
      repo,
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
