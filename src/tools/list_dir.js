import fs from "node:fs";
import path from "node:path";

import { createError } from "../errors/errors.js";
import { resolvePathForRepo } from "../core/paths.js";
import { isIgnored, loadIgnoreRules } from "../core/ignore.js";

function toPosix(value) {
  return value.split(path.sep).join("/");
}

export async function listDir({ params, config }) {
  const { repo, path: relPath } = params;
  const { absolutePath, relativePath, root } = resolvePathForRepo(
    repo,
    relPath || "",
    config
  );

  let stats;
  try {
    stats = fs.statSync(absolutePath);
  } catch (error) {
    throw createError("DIR_NOT_FOUND", "Directory not found", {
      repo,
      path: relPath || "."
    });
  }

  if (!stats.isDirectory()) {
    throw createError("DIR_NOT_FOUND", "Directory not found", {
      repo,
      path: relPath || "."
    });
  }

  let entries;
  try {
    entries = fs.readdirSync(absolutePath, { withFileTypes: true });
  } catch (error) {
    throw createError("DIR_UNREADABLE", "Directory not readable", {
      repo,
      path: relPath || "."
    });
  }

  const ignoreRules = loadIgnoreRules(root);
  const results = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const entryRelative = path.join(relativePath, entry.name);
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
