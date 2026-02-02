# LedFX MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with and control a local [LedFX](https://ledfx.app/) instance.

## Overview

This MCP server provides a bridge between AI assistants (like Claude) and LedFX, allowing you to control your LED lighting setup through natural language. The server exposes LedFX's functionality as MCP tools that AI assistants can use to:

- Query device and virtual information
- List and manage LED devices and virtuals
- Apply effects to virtuals (virtual LED strips)
- Manage and activate scenes
- Create custom palettes and playlists
- Get AI-powered effect recommendations
- Get system information

## Features

- 🎨 Control LED effects through natural language
- 🔧 Manage multiple LED devices and virtuals
- 🎭 Activate pre-configured scenes
- 📊 Query device and system information
- 🔒 Type-safe TypeScript implementation
- 🏗️ Built following software design best practices
- 🎨 **Comprehensive color library** with 50+ named colors and gradients
- 🗄️ **Palette management** with local SQLite database
- 🤖 **AI-powered scene creation** from natural language descriptions
- 📝 **Playlist support** for scene sequences
- 💡 **Effect recommendations** based on mood and description
- 📚 **LedFX feature explanations** - learn about any LedFX concept
- 🔄 **Correct API implementation** - uses virtuals (not devices) for effects

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

## ✅ Implementation Status

**Current Status:** Implemented with Comprehensive Test Suite

This MCP server is fully implemented against the official LedFX 2.1.2 API and validated with 66 automated tests plus continuous integration checks. The implementation fixes critical API issues (virtuals vs devices) and adds advanced features like palette management, natural language scene creation, and AI-powered recommendations.

### Important Notes

1. **API Corrections Applied:** Effects are now correctly applied to virtuals (not devices), matching LedFX 2.1.2 API
2. **Comprehensive Testing:** 66 tests covering unit, integration, and E2E scenarios - all passing
3. **CI/CD Pipeline:** GitHub Actions workflow with lint, build, test, and coverage jobs
4. **Production Ready:** Fully documented with installation guide, usage examples, and architecture docs

### Documentation

- **[API Specification](docs/API_SPECIFICATION.md)** - Complete LedFX API reference
- **[Test Specification](docs/TEST_SPECIFICATION.md)** - Comprehensive test plans
- **[Implementation Notes](docs/IMPLEMENTATION_NOTES.md)** - Design decisions and technical notes
- **[References](docs/REFERENCES.md)** - LedFX resources and links
- **[Installation Guide](INSTALL.md)** - Step-by-step setup instructions
- **[Usage Guide](docs/USAGE_GUIDE.md)** - How to use all features

**Status:** Ready for production use with LedFX 2.1.2+

## Prerequisites

- Node.js 24 or 25
- A running [LedFX](https://ledfx.app/) instance (default: `localhost:8888`)
- An MCP-compatible AI assistant (e.g., Claude Desktop)

### Running LedFX for Testing

**Using Docker (Recommended):**
```bash
# Using docker-compose (included in this repository)
docker-compose up -d

# Or using docker run
docker run -d --name ledfx -p 8888:8888 ledfxorg/ledfx:latest
```

**Using pip:**
```bash
pip install ledfx
ledfx --host 0.0.0.0 --port 8888
```

See [REFERENCES.md](docs/REFERENCES.md) for detailed installation instructions.

## Installation

```bash
# Clone the repository
git clone https://github.com/abossard/ledfx-mcp.git
cd ledfx-mcp

# Install dependencies
npm install

# Build and run in one command
npm run dev

```

## Configuration

The server connects to LedFX using the following environment variables:

- `LEDFX_HOST`: LedFX server host (default: `localhost`)
- `LEDFX_PORT`: LedFX server port (default: `8888`)

You can set these in your MCP client configuration or as environment variables.

## Usage

### Claude Desktop Configuration

Add the following to your Claude Desktop configuration file:

- Claude Desktop launches this MCP server over stdio.
- Use Node.js 24 or 25.
- The path must be absolute when using `node` with `dist/index.js`.

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

If you prefer to run from Git without a local build, use `npx` as the command:

```json
{
  "mcpServers": {
    "ledfx": {
      "command": "npx",
      "args": ["github:abossard/ledfx-mcp"],
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

**Basic Operations:**
- "List all my LED virtuals"
- "Activate the rainbow effect on my desk light virtual"
- "Show me all available scenes"
- "Clear effects from all virtuals"

**Natural Language Scene Creation:**
- "Create a calm ocean scene with slow blue waves"
- "Make an energetic party scene with fast rainbow colors"
- "Create a romantic scene with dim pink and purple gradients"
- "Build a focus scene with steady white light at medium brightness"

**Color and Palette Management:**
- "Show me all neon colors"
- "Find the crimson color"
- "List all available gradients"
- "Create a new palette called 'Sunset Vibes' with orange, pink, and purple"
- "Save a playlist of my party scenes"

**Effect Recommendations:**
- "Recommend effects for a relaxing evening"
- "What effects work well with music?"
- "Suggest something energetic for a party"

**Learning LedFX:**
- "Explain what virtuals are in LedFX"
- "What's the difference between devices and virtuals?"
- "How do audio-reactive effects work?"
- "Tell me about WLED devices"
- "List all available effect types"

## Available Tools

The server exposes 35 MCP tools organized into categories:

### Core Management
| Tool | Description |
|------|-------------|
| `ledfx_get_info` | Get LedFX server information |
| `ledfx_list_devices` | List all physical LED devices |
| `ledfx_get_device` | Get details about a specific device |
| `ledfx_list_virtuals` | List all virtual LED strips |
| `ledfx_get_virtual` | Get details about a specific virtual |
| `ledfx_activate_virtual` | Activate/deactivate a virtual |

### Effect Control (CORRECTED - uses virtuals)
| Tool | Description |
|------|-------------|
| `ledfx_set_effect` | Apply an effect to a **virtual** (not device) |
| `ledfx_update_effect` | Update effect configuration |
| `ledfx_clear_effect` | Remove effects from a virtual |
| `ledfx_get_effect_schemas` | Get schemas for all effect types |

### Scene Management
| Tool | Description |
|------|-------------|
| `ledfx_list_scenes` | List all available scenes |
| `ledfx_activate_scene` | Activate a pre-configured scene |
| `ledfx_create_scene` | Create new scene from current config |
| `ledfx_delete_scene` | Delete a saved scene |
| `ledfx_create_scene_from_description` | **AI-powered scene creation from natural language** |

### Palette Management (SQLite-backed)
| Tool | Description |
|------|-------------|
| `ledfx_list_palettes` | List all saved palettes |
| `ledfx_create_palette` | Create a new color palette |
| `ledfx_get_palette` | Get specific palette |
| `ledfx_delete_palette` | Delete a palette |

### Playlist Management
| Tool | Description |
|------|-------------|
| `ledfx_list_playlists` | List all playlists |
| `ledfx_create_playlist` | Create scene sequence playlist |
| `ledfx_get_playlist` | Get specific playlist |
| `ledfx_delete_playlist` | Delete a playlist |

### Color Library
| Tool | Description |
|------|-------------|
| `ledfx_list_colors` | List 50+ named colors by category |
| `ledfx_find_color` | Find color by name |
| `ledfx_list_gradients` | List predefined gradients |
| `ledfx_find_gradient` | Find gradient by name |

### AI Features
| Tool | Description |
|------|-------------|
| `ledfx_recommend_effects` | Get effect recommendations based on mood/description |
| `ledfx_explain_feature` | Get detailed explanation of any LedFX feature |
| `ledfx_list_features` | List all explainable features |
| `ledfx_list_effect_types` | List all effect types with descriptions |

### Preset Management
| Tool | Description |
|------|-------------|
| `ledfx_get_presets` | Get presets for a virtual's effect |
| `ledfx_apply_preset` | Apply a preset to a virtual |

### Audio Management
| Tool | Description |
|------|-------------|
| `ledfx_list_audio_devices` | List audio input devices |
| `ledfx_set_audio_device` | Set active audio device |

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Build and run in one command
npm run dev

# Watch mode for development
npm run watch

# Build and run in one command
npm run dev

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
├── docs/                # Comprehensive documentation
│   ├── API_SPECIFICATION.md      # LedFX API reference
│   ├── TEST_SPECIFICATION.md     # Test plans and requirements
│   ├── IMPLEMENTATION_NOTES.md   # Known issues and fixes needed
│   └── REFERENCES.md             # LedFX resources and links
├── dist/                # Compiled JavaScript (generated)
├── docker-compose.yml   # Docker setup for testing
├── package.json         # Project configuration
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

### API Specification
**[docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md)**

Complete reference for LedFX REST API endpoints based on version 2.1.2:
- All endpoint paths, methods, and parameters
- Request/response examples
- Error handling patterns
- Effect types and configuration options
- WebSocket endpoints
- Version compatibility notes

### Test Specification
**[docs/TEST_SPECIFICATION.md](docs/TEST_SPECIFICATION.md)**

Comprehensive test requirements and test cases:
- Unit test cases for all components
- Integration test scenarios
- End-to-end workflows
- Performance test criteria
- Compatibility test matrix
- Mock strategies and test fixtures
- Docker-based test environment setup

### Implementation Notes
**[docs/IMPLEMENTATION_NOTES.md](docs/IMPLEMENTATION_NOTES.md)**

Critical analysis of current implementation vs actual API:
- **Known issues and bugs** (devices vs virtuals confusion)
- Required fixes before production use
- Missing features and functionality gaps
- Recommended implementation phases
- Migration path for future versions

### References
**[docs/REFERENCES.md](docs/REFERENCES.md)**

Complete resource guide:
- Official LedFX documentation links
- Installation methods (Docker, pip, source)
- API testing examples (curl, Python, JavaScript)
- Community resources and support channels
- Hardware recommendations
- Security best practices

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
