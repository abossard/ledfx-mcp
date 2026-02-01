# Installation Guide

Complete installation instructions for the LedFX MCP Server.

## Prerequisites

- **Node.js** 18.0.0 or higher (20.x or 22.x recommended)
- **npm** (comes with Node.js)
- **A running LedFX instance** (see [Running LedFX](#running-ledfx) below)
- **An MCP-compatible client** (e.g., Claude Desktop)

## Quick Start

### 1. Install the MCP Server

```bash
# Clone the repository
git clone https://github.com/abossard/ledfx-mcp.git
cd ledfx-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Verify installation
npm test
```

### 2. Set Up LedFX

Choose one of these methods to run LedFX:

#### Option A: Docker (Recommended for Testing)

```bash
# Using docker-compose (included in repository)
docker-compose up -d

# Verify LedFX is running
curl http://localhost:8888/api/info
```

#### Option B: Docker Run

```bash
# Run LedFX container
docker run -d \
  --name ledfx \
  -p 8888:8888 \
  ledfxorg/ledfx:latest

# Verify
curl http://localhost:8888/api/info
```

#### Option C: Install Locally with pip

```bash
# Install LedFX
pip install ledfx

# Run LedFX
ledfx --host 0.0.0.0 --port 8888
```

### 3. Configure Claude Desktop

Add the MCP server to your Claude Desktop configuration:

**macOS:**
```bash
# Edit configuration file
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```powershell
# Edit configuration file
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
# Edit configuration file
nano ~/.config/Claude/claude_desktop_config.json
```

Add this configuration (replace `/path/to/` with actual path):

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

### 4. Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

### 5. Verify Installation

In Claude, try:
```
"List all my LED virtuals"
"Show me all available colors"
"List all LedFX features you can explain"
```

## Detailed Installation

### Node.js Installation

#### macOS

```bash
# Using Homebrew
brew install node@20

# Or download from nodejs.org
```

#### Ubuntu/Debian

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Windows

Download and install from [nodejs.org](https://nodejs.org/)

### Building from Source

```bash
# Clone repository
git clone https://github.com/abossard/ledfx-mcp.git
cd ledfx-mcp

# Install dependencies
npm install

# Run linting
npm run lint

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Running LedFX

### Docker Setup (Detailed)

**Using the included docker-compose.yml:**

```bash
# Start LedFX
docker-compose up -d

# View logs
docker-compose logs -f ledfx

# Stop LedFX
docker-compose down

# Restart LedFX
docker-compose restart
```

**Manual Docker Setup:**

```bash
# Create a volume for persistent data
docker volume create ledfx-config

# Run LedFX with persistent config
docker run -d \
  --name ledfx \
  -p 8888:8888 \
  -v ledfx-config:/root/.ledfx \
  --restart unless-stopped \
  ledfxorg/ledfx:latest

# Check if LedFX is running
docker ps

# View LedFX logs
docker logs -f ledfx

# Stop LedFX
docker stop ledfx

# Start LedFX
docker start ledfx

# Remove LedFX container
docker rm -f ledfx
```

### Local Installation (pip)

```bash
# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install LedFX
pip install ledfx

# Run LedFX
ledfx --host 0.0.0.0 --port 8888

# Run with development mode
ledfx --dev --host 0.0.0.0 --port 8888

# Run with verbose logging
ledfx -v --host 0.0.0.0 --port 8888
```

## Configuration

### Environment Variables

The MCP server accepts these environment variables:

```bash
# LedFX connection
LEDFX_HOST=localhost      # Default: localhost
LEDFX_PORT=8888          # Default: 8888
```

You can set these in:
1. Claude Desktop config (recommended)
2. Shell environment
3. `.env` file (if you modify the code)

### Database Location

The MCP server stores palettes and playlists in:
- **Linux/macOS:** `~/.ledfx-mcp/palettes.db`
- **Windows:** `%USERPROFILE%\.ledfx-mcp\palettes.db`

To reset the database:
```bash
rm ~/.ledfx-mcp/palettes.db  # Linux/macOS
del %USERPROFILE%\.ledfx-mcp\palettes.db  # Windows
```

## Testing Installation

### Run Built-in Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# End-to-end tests only (requires running LedFX)
npm run test:e2e

# Watch mode (for development)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Manual Testing

```bash
# Test the demo script
node demo-parsing.js

# Test import functionality
node test-imports.js
```

### Test with LedFX

1. **Start LedFX:**
   ```bash
   docker-compose up -d
   ```

2. **Verify connection:**
   ```bash
   curl http://localhost:8888/api/info
   ```

3. **Expected response:**
   ```json
   {
     "url": "http://0.0.0.0:8888",
     "name": "LedFx",
     "version": "2.1.2"
   }
   ```

4. **Run E2E tests:**
   ```bash
   npm run test:e2e
   ```

## Troubleshooting

### Node.js Issues

**"node: command not found"**
```bash
# Verify Node.js installation
node --version
npm --version

# Reinstall if needed (see Node.js Installation above)
```

**"npm install" fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

### Build Issues

**TypeScript compilation errors**
```bash
# Make sure you have the latest dependencies
npm install

# Clean and rebuild
rm -rf dist
npm run build
```

**"better-sqlite3" build errors**
```bash
# Install build tools (Ubuntu/Debian)
sudo apt-get install build-essential python3

# Install build tools (macOS)
xcode-select --install

# Rebuild native dependencies
npm rebuild better-sqlite3
```

### LedFX Connection Issues

**"Failed to connect to LedFX"**

1. Verify LedFX is running:
   ```bash
   curl http://localhost:8888/api/info
   ```

2. Check Docker container:
   ```bash
   docker ps
   docker logs ledfx
   ```

3. Check firewall settings

4. Verify correct host/port in configuration

**"LedFX not responding"**

1. Restart LedFX:
   ```bash
   docker-compose restart
   # Or
   docker restart ledfx
   ```

2. Check LedFX logs for errors:
   ```bash
   docker logs -f ledfx
   ```

### Claude Desktop Issues

**"Tools not appearing in Claude"**

1. Restart Claude Desktop completely
2. Verify configuration file path is correct
3. Check the path to `dist/index.js` is absolute
4. Look at Claude Desktop logs:
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

**"MCP server not starting"**

1. Check the command in config:
   ```json
   "command": "node",
   "args": ["/absolute/path/to/ledfx-mcp/dist/index.js"]
   ```

2. Verify the file exists:
   ```bash
   ls -la /absolute/path/to/ledfx-mcp/dist/index.js
   ```

3. Test manually:
   ```bash
   node /absolute/path/to/ledfx-mcp/dist/index.js
   ```

## Updating

### Update the MCP Server

```bash
cd ledfx-mcp

# Pull latest changes
git pull origin main

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Run tests
npm test

# Restart Claude Desktop to load new version
```

### Update LedFX

**Docker:**
```bash
# Pull latest image
docker pull ledfxorg/ledfx:latest

# Restart with new image
docker-compose down
docker-compose up -d
```

**pip:**
```bash
pip install --upgrade ledfx
```

## Uninstallation

### Remove MCP Server

```bash
# Remove the repository
cd ..
rm -rf ledfx-mcp

# Remove database (optional)
rm -rf ~/.ledfx-mcp
```

### Remove from Claude Desktop

Edit the Claude configuration file and remove the `ledfx` entry.

### Remove LedFX

**Docker:**
```bash
# Stop and remove container
docker-compose down

# Remove image
docker rmi ledfxorg/ledfx:latest

# Remove volume (deletes config)
docker volume rm ledfx-config
```

**pip:**
```bash
pip uninstall ledfx
```

## Development Setup

For contributing to the project:

```bash
# Clone repository
git clone https://github.com/abossard/ledfx-mcp.git
cd ledfx-mcp

# Install dependencies
npm install

# Run in watch mode
npm run watch

# Run tests in watch mode
npm run test:watch

# Format and lint
npm run lint:fix

# Run demo
node demo-parsing.js
```

## Additional Resources

- **[Usage Guide](docs/USAGE_GUIDE.md)** - How to use all features
- **[API Specification](docs/API_SPECIFICATION.md)** - LedFX API reference
- **[Architecture](ARCHITECTURE.md)** - System design
- **[LedFX Documentation](https://docs.ledfx.app/)** - Official LedFX docs

## Getting Help

- **GitHub Issues:** [Report bugs or request features](https://github.com/abossard/ledfx-mcp/issues)
- **LedFX Discord:** [Join the community](https://discord.gg/ledfx)
- **Documentation:** Check the `docs/` directory

## Next Steps

After installation:

1. Read the [Usage Guide](docs/USAGE_GUIDE.md)
2. Try the examples in Claude
3. Create your first scene: "Create a calm ocean scene with slow blue waves"
4. Explore the color library: "List all neon colors"
5. Get help: "Explain what virtuals are in LedFX"
