# LedFX MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with and control a local [LedFX](https://ledfx.app/) instance.

## Overview

This MCP server provides a bridge between AI assistants (like Claude) and LedFX, allowing you to control your LED lighting setup through natural language. The server exposes LedFX's functionality as MCP tools that AI assistants can use to:

- Query device information
- List and manage LED devices
- Apply effects to devices
- Manage and activate scenes
- Get system information

## Features

- 🎨 Control LED effects through natural language
- 🔧 Manage multiple LED devices
- 🎭 Activate pre-configured scenes
- 📊 Query device and system information
- 🔒 Type-safe TypeScript implementation
- 🏗️ Built following software design best practices

## Design Principles

This project follows principles from:

### Grokking Simplicity
- **Separation of Concerns**: Actions (I/O operations) are clearly separated from calculations (pure functions)
- **Stratified Design**: Clear abstraction layers (tools → client → API)
- **Immutability**: Data transformations use pure functions where possible

### A Philosophy of Software Design
- **Deep Modules**: Complex LedFX API interactions hidden behind simple interfaces
- **Information Hiding**: Implementation details abstracted from callers
- **Minimize Complexity**: Each module has a single, focused responsibility

## Prerequisites

- Node.js >= 18.0.0
- A running [LedFX](https://ledfx.app/) instance (default: `localhost:8888`)
- An MCP-compatible AI assistant (e.g., Claude Desktop)

## Installation

```bash
# Clone the repository
git clone https://github.com/abossard/ledfx-mcp.git
cd ledfx-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

The server connects to LedFX using the following environment variables:

- `LEDFX_HOST`: LedFX server host (default: `localhost`)
- `LEDFX_PORT`: LedFX server port (default: `8888`)

You can set these in your MCP client configuration or as environment variables.

## Usage

### Claude Desktop Configuration

Add the following to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ledfx": {
      "command": "node",
      "args": ["/absolute/path/to/ledfx-mcp/dist/index.js"],
      "env": {
        "LEDFX_HOST": "localhost",
        "LEDFX_PORT": "8888"
      }
    }
  }
}
```

### Example Interactions

Once configured, you can interact with your LedFX setup through natural language:

- "List all my LED devices"
- "Apply a rainbow effect to my desk light"
- "Activate my party scene"
- "What effects are currently running?"
- "Clear all effects from device XYZ"

## Available Tools

The server exposes the following MCP tools:

| Tool | Description |
|------|-------------|
| `ledfx_get_info` | Get LedFX server information |
| `ledfx_list_devices` | List all configured LED devices |
| `ledfx_get_device` | Get details about a specific device |
| `ledfx_set_effect` | Apply an effect to a device |
| `ledfx_clear_effect` | Remove effects from a device |
| `ledfx_list_scenes` | List all available scenes |
| `ledfx_activate_scene` | Activate a pre-configured scene |

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode for development
npm run watch

# Lint the code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project Structure

```
ledfx-mcp/
├── src/
│   ├── index.ts         # Main server entry point
│   ├── ledfx-client.ts  # LedFX API client
│   └── tools.ts         # MCP tool definitions and handlers
├── dist/                # Compiled JavaScript (generated)
├── package.json         # Project configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Architecture

The server is organized into three main layers:

1. **MCP Server Layer** (`index.ts`): Handles MCP protocol communication
2. **Tools Layer** (`tools.ts`): Defines available tools and routes requests
3. **Client Layer** (`ledfx-client.ts`): Abstracts LedFX HTTP API interactions

This layered architecture ensures:
- Clear separation of concerns
- Easy testing and maintenance
- Extensibility for new features

## Contributing

Contributions are welcome! Please ensure your code:

- Follows the existing code style
- Includes appropriate comments
- Passes linting (`npm run lint`)
- Builds successfully (`npm run build`)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Resources

- [LedFX Documentation](https://docs.ledfx.app/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## Troubleshooting

### Server won't connect to LedFX

- Ensure LedFX is running and accessible at the configured host/port
- Check firewall settings
- Verify the `LEDFX_HOST` and `LEDFX_PORT` environment variables

### Tools not appearing in Claude

- Restart Claude Desktop after configuration changes
- Verify the path to `dist/index.js` is absolute
- Check Claude Desktop logs for errors

## Support

For issues and questions:
- [GitHub Issues](https://github.com/abossard/ledfx-mcp/issues)
- [LedFX Community](https://discord.gg/ledfx)
