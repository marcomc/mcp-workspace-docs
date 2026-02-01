import fs from "node:fs";
import path from "node:path";

const GLOB_SPECIALS = /[.+^${}()|[\]\\]/g;

function escapeRegex(value) {
  return value.replace(GLOB_SPECIALS, "\\$&");
}

function globToRegex(pattern) {
  let source = escapeRegex(pattern);
  source = source
    .replace(/\\\*\\\*/g, ".*")
    .replace(/\\\*/g, "[^/]*")
    .replace(/\\\?/g, ".");

  return new RegExp(source);
}

function parsePattern(raw) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("!")) {
    return null;
  }

  const dirOnly = trimmed.endsWith("/");
  const normalized = dirOnly ? trimmed.slice(0, -1) : trimmed;
  const anchored = normalized.startsWith("/");
  const patternBody = anchored ? normalized.slice(1) : normalized;

  const regexBody = globToRegex(patternBody).source;
  const prefix = anchored ? "^" : "(^|/)";
  const suffix = "($|/)";

  return {
    dirOnly,
    regex: new RegExp(`${prefix}${regexBody}${suffix}`)
  };
}

export function loadIgnoreRules(root) {
  const ignoreFile = path.join(root, ".gitignore");
  if (!fs.existsSync(ignoreFile)) {
    return [];
  }

  const content = fs.readFileSync(ignoreFile, "utf8");
  return content
    .split(/\r?\n/)
    .map(parsePattern)
    .filter(Boolean);
}

export function isIgnored(relPath, isDir, rules) {
  if (!rules || rules.length === 0) {
    return false;
  }
  return rules.some((rule) => {
    if (rule.dirOnly && !isDir) {
      return false;
    }
    return rule.regex.test(relPath);
  });
}
