#!/usr/bin/env node

/**
 * LedFX MCP Server Entry Point
 * 
 * This server implements the Model Context Protocol (MCP) to provide
 * AI assistants with tools to interact with a local LedFX instance.
 * 
 * Following "Grokking Simplicity" principles:
 * - Separating actions (I/O operations) from calculations (pure functions)
 * - Stratified design for clear abstraction layers
 * 
 * Following "A Philosophy of Software Design":
 * - Deep modules with simple interfaces
 * - Minimize cognitive load through clear abstractions
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createLedFxClient } from "./ledfx-client.js";
import { tools, handleToolCall } from "./tools.js";

/**
 * Creates and configures the MCP server instance
 * This is a calculation - it creates objects but doesn't perform I/O
 */
function createServer(): Server {
  const server = new Server(
    {
      name: "ledfx-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler - returns available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Register tool execution handler - executes requested tools
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return await handleToolCall(name, args || {});
  });

  return server;
}

/**
 * Main application entry point
 * This is an action - it performs I/O and has side effects
 */
async function main(): Promise<void> {
  try {
    // Create server instance
    const server = createServer();

    // Initialize LedFX client (shared state)
    const ledfxClient = createLedFxClient();
    
    // Make client available to tools (injected dependency)
    (global as any).ledfxClient = ledfxClient;

    // Create stdio transport for communication
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    await server.connect(transport);

    // Log startup (stderr to not interfere with stdio protocol)
    console.error("LedFX MCP server running on stdio");
  } catch (error) {
    console.error("Fatal error starting server:", error);
    process.exit(1);
  }
}

// Start the server
main();
