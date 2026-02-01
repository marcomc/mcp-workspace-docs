import fs from "node:fs";

import { createError } from "../errors/errors.js";

function assertReadableDir(pathValue, label) {
  if (!pathValue) {
    throw createError("CONFIG_INVALID", "Invalid repository configuration", {
      reason: "MISSING_ROOT",
      repo: label
    });
  }

  let stats;
  try {
    stats = fs.statSync(pathValue);
  } catch (error) {
    throw createError("CONFIG_INVALID", "Invalid repository configuration", {
      reason: "ROOT_NOT_FOUND",
      repo: label,
      path: pathValue
    });
  }

  if (!stats.isDirectory()) {
    throw createError("CONFIG_INVALID", "Invalid repository configuration", {
      reason: "ROOT_NOT_DIRECTORY",
      repo: label,
      path: pathValue
    });
  }

  try {
    fs.accessSync(pathValue, fs.constants.R_OK);
  } catch (error) {
    throw createError("CONFIG_INVALID", "Invalid repository configuration", {
      reason: "ROOT_NOT_READABLE",
      repo: label,
      path: pathValue
    });
  }
}

export function validateConfig(config) {
  assertReadableDir(config.docsRoot, "docs");
  assertReadableDir(config.codeRoot, "code");
}
