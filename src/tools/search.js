import fs from "node:fs";
import path from "node:path";

import { createError } from "../errors/errors.js";
import { resolvePathForRepo } from "../core/paths.js";
import { loadIgnoreRules, isIgnored } from "../core/ignore.js";
import { sortMatches } from "../core/order.js";
import { DEFAULT_SEARCH_LIMIT } from "../core/limits.js";

const GLOB_SPECIALS = /[.+^${}()|[\]\\]/g;

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function escapeRegex(value) {
  return value.replace(GLOB_SPECIALS, "\\$&");
}

function globToRegex(pattern) {
  let source = escapeRegex(pattern);
  source = source
    .replace(/\\\*\\\*/g, ".*")
    .replace(/\\\*/g, "[^/]*")
    .replace(/\\\?/g, ".");

  return new RegExp(`^${source}$`);
}

function shouldInclude(relPath, globRegex) {
  if (!globRegex) {
    return true;
  }
  return globRegex.test(relPath);
}

function isBinary(buffer) {
  return buffer.includes(0);
}

function walkFiles(root, ignoreRules) {
  const results = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }

      const absolute = path.join(current, entry.name);
      const relative = toPosix(path.relative(root, absolute) || ".");
      const isDir = entry.isDirectory();

      if (isIgnored(relative, isDir, ignoreRules)) {
        continue;
      }

      if (isDir) {
        stack.push(absolute);
      } else {
        results.push({ absolute, relative });
      }
    }
  }

  return results;
}

function searchInFile(file, query, matches, limit) {
  const buffer = fs.readFileSync(file.absolute);
  if (isBinary(buffer)) {
    return;
  }

  const content = buffer.toString("utf8");
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    if (matches.length >= limit) {
      return;
    }
    if (lines[index].includes(query)) {
      matches.push({
        path: file.relative,
        line: index + 1,
        preview: lines[index]
      });
    }
  }
}

function searchRepo(repo, query, fileGlob, limit, config) {
  const root = repo === "docs" ? config.docsRoot : config.codeRoot;
  const ignoreRules = loadIgnoreRules(root);
  const globRegex = fileGlob ? globToRegex(fileGlob) : null;
  const files = walkFiles(root, ignoreRules)
    .filter((file) => shouldInclude(file.relative, globRegex))
    .sort((a, b) => (a.relative < b.relative ? -1 : a.relative > b.relative ? 1 : 0));

  const matches = [];
  for (const file of files) {
    if (matches.length >= limit) {
      break;
    }
    searchInFile(file, query, matches, limit);
  }

  return sortMatches(matches);
}

export async function search({ params, config }) {
  let { repo, query, file_glob: fileGlob, limit } = params;

  if (!query || typeof query !== "string" || query.trim() === "") {
    throw createError("QUERY_EMPTY", "Query must be non-empty", { repo });
  }

  const resolvedLimit = limit === undefined ? DEFAULT_SEARCH_LIMIT : limit;
  if (!Number.isInteger(resolvedLimit) || resolvedLimit < 1) {
    throw createError("LIMIT_INVALID", "Limit must be >= 1", {
      repo,
      limit: resolvedLimit
    });
  }

  if (!repo) {
    repo = "both";
    params.repo = repo;
  }

  if (!["docs", "code", "both"].includes(repo)) {
    throw createError("REPO_INVALID", "Repo must be docs, code, or both", {
      repo
    });
  }

  if (fileGlob !== undefined && typeof fileGlob !== "string") {
    throw createError("FILE_GLOB_INVALID", "file_glob must be a string", {
      repo
    });
  }

  const matches = [];
  if (repo === "docs" || repo === "both") {
    matches.push(...searchRepo("docs", query, fileGlob, resolvedLimit, config));
  }
  if (matches.length < resolvedLimit && (repo === "code" || repo === "both")) {
    matches.push(
      ...searchRepo("code", query, fileGlob, resolvedLimit - matches.length, config)
    );
  }

  return matches;
}
