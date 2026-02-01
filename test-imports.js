#!/usr/bin/env node

/**
 * Simple test script to verify the MCP server can be loaded
 * This does not actually run the server, but checks for import errors
 */

console.error("Testing LedFX MCP Server imports...");

try {
  // Import the main module
  import('./dist/index.js')
    .then(() => {
      console.error("✓ All imports successful");
      console.error("Server is ready to run via MCP client");
    })
    .catch((err) => {
      console.error("✗ Import failed:", err.message);
      process.exit(1);
    });
} catch (error) {
  console.error("✗ Error:", error);
  process.exit(1);
}
