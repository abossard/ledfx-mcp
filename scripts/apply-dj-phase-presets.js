#!/usr/bin/env node

/**
 * Compatibility wrapper for legacy DJ phase setup entrypoint.
 *
 * Single-source-of-truth:
 * - All DJ phase definitions now live in setup-dj-phases-via-mcp.js
 * - This file only forwards CLI arguments to avoid config drift.
 */

import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const setupScript = path.join(scriptDir, "setup-dj-phases-via-mcp.js");
const forwardedArgs = process.argv.slice(2);

console.error(
  "[deprecated] scripts/apply-dj-phase-presets.js now forwards to scripts/setup-dj-phases-via-mcp.js"
);

const child = spawn(process.execPath, [setupScript, ...forwardedArgs], {
  stdio: "inherit",
});

child.on("close", (code, signal) => {
  if (typeof code === "number") {
    process.exit(code);
  }
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(1);
});
