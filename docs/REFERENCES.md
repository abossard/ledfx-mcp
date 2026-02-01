# LedFX References and Resources

**Last Updated:** 2026-02-01  
**Compiled for:** LedFX MCP Server Development

## Official LedFX Resources

### Documentation

- **Official Documentation (Latest):**  
  https://docs.ledfx.app/en/latest/
  
- **REST API Reference:**  
  https://docs.ledfx.app/en/latest/apis/api.html
  
- **Scenes API Documentation:**  
  https://docs.ledfx.app/en/latest/apis/scenes.html
  
- **Images and Cache API:**  
  https://docs.ledfx.app/en/latest/apis/cache.html

- **Getting Started Guide:**  
  https://docs.ledfx.app/en/latest/getting_started.html

- **Installation Guide:**  
  https://docs.ledfx.app/en/latest/installation.html

### Source Code

- **Main GitHub Repository:**  
  https://github.com/LedFx/LedFx
  
- **LedFx Organization (All Repos):**  
  https://github.com/orgs/LedFx/repositories

- **Frontend Repository:**  
  https://github.com/LedFx/frontend

- **Development Setup Guide:**  
  https://docs.ledfx.app/en/v2.0.110/developer/developer.html

### Package Distribution

- **PyPI Package:**  
  https://pypi.org/project/LedFx/
  
- **Docker Hub:**  
  https://hub.docker.com/r/ledfxorg/ledfx

### API Collections

- **Postman API Collection:**  
  https://documenter.getpostman.com/view/5403870/TVzNHyyw

### Community

- **Discord Community:**  
  https://discord.gg/ledfx
  
- **GitHub Discussions:**  
  https://github.com/LedFx/LedFx/discussions

- **Issue Tracker:**  
  https://github.com/LedFx/LedFx/issues

## Version Information

### Current Versions (as of 2026-02-01)

- **Latest Stable:** 2.1.2
- **Docker Image Tag:** `latest` (2.1.2)
- **Python Version Required:** 3.9+ (3.12 recommended for 2025+)

### Version History

- **2.1.x:** Current stable series
  - 2.1.2 - Latest stable release
  - 2.1.1 - Previous stable
  - 2.1.0 - First 2.1 series release

- **2.0.x:** Previous stable series
  - Various releases with significant API changes

- **0.x.x:** Beta/development releases
  - Not recommended for production use

### Checking LedFX Version

```bash
# Via API
curl http://localhost:8888/api/info

# Via pip (if installed locally)
pip show ledfx

# Via Docker
docker exec ledfx-container pip show ledfx
```

## Installation Methods

### 1. Docker Installation (Recommended for Testing)

**Official Docker Image:**
```bash
# Pull latest image
docker pull ledfxorg/ledfx:latest

# Run with default settings
docker run -d \
  --name ledfx \
  -p 8888:8888 \
  ledfxorg/ledfx:latest

# Run with custom port
docker run -d \
  --name ledfx \
  -p 9000:8888 \
  ledfxorg/ledfx:latest

# Run with volume for persistence
docker run -d \
  --name ledfx \
  -p 8888:8888 \
  -v ledfx-config:/root/.ledfx \
  ledfxorg/ledfx:latest
```

**Docker Compose:**
```yaml
version: '3.8'

services:
  ledfx:
    image: ledfxorg/ledfx:latest
    container_name: ledfx
    ports:
      - "8888:8888"
    volumes:
      - ledfx-config:/root/.ledfx
    environment:
      - LEDFX_HOST=0.0.0.0
      - LEDFX_PORT=8888
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8888/api/info"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  ledfx-config:
```

### 2. Python/pip Installation (Local Development)

**Install from PyPI:**
```bash
# Basic installation
pip install ledfx

# With development dependencies
pip install ledfx[dev]

# Specific version
pip install ledfx==2.1.2
```

**Run LedFX:**
```bash
# Default settings (localhost:8888)
ledfx

# Custom host/port
ledfx --host 0.0.0.0 --port 8888

# Development mode
ledfx --dev

# Verbose logging
ledfx -v
```

### 3. From Source (Advanced)

**Clone and Install:**
```bash
# Clone repository
git clone https://github.com/LedFx/LedFx.git
cd LedFx

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e .

# Or with development dependencies
pip install -e .[dev]

# Run LedFX
python -m ledfx
```

## API Endpoints Quick Reference

### Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/info` | GET | Server information |
| `/api/config` | GET/PUT/POST/DELETE | Configuration management |
| `/api/devices` | GET/POST | Device management |
| `/api/devices/{id}` | GET/PUT/DELETE | Specific device operations |
| `/api/virtuals` | GET/POST | Virtual management |
| `/api/virtuals/{id}` | GET/PUT/POST/DELETE | Specific virtual operations |
| `/api/virtuals/{id}/effects` | GET/POST/PUT/DELETE | Effect management |
| `/api/scenes` | GET/PUT/POST/DELETE | Scene management |
| `/api/schema` | GET | Schema definitions |
| `/api/schema/{type}` | GET | Specific schema |
| `/api/audio/devices` | GET/PUT | Audio device management |

### Extended Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/effects` | GET | List all effects |
| `/api/effects/{id}` | GET | Specific effect info |
| `/api/effects/{id}/presets` | GET/PUT/DELETE | Effect presets |
| `/api/virtuals/{id}/presets` | GET/PUT/POST/DELETE | Virtual presets |
| `/api/find_devices` | POST | Auto-discover WLED devices |
| `/api/find_openrgb` | GET/POST | Find OpenRGB devices |
| `/api/integrations` | GET/PUT/POST/DELETE | Integration management |
| `/api/log` | GET | WebSocket logging |

## Effect Types Reference

### Common Effects (Available in LedFX 2.1.x)

1. **rainbow** - Classic rainbow animation
   - Parameters: `speed`, `brightness`, `mirror`

2. **pulse** - Audio-reactive pulsing
   - Parameters: `color`, `speed`, `sensitivity`

3. **wavelength** - Wave-like patterns
   - Parameters: `color_lows`, `color_mids`, `color_high`, `speed`

4. **energy** - Energy-based visualization
   - Parameters: `color`, `sensitivity`, `blur`

5. **singleColor** - Solid color
   - Parameters: `color`, `brightness`

6. **gradient** - Color gradient
   - Parameters: `gradient`, `speed`, `direction`

7. **scroll** - Scrolling patterns
   - Parameters: `color`, `speed`, `direction`

8. **strobe** - Strobe light
   - Parameters: `color`, `frequency`

### Getting Effect Schemas

```bash
# Get all effect schemas
curl http://localhost:8888/api/schema/effects

# Get specific effect via frontend
curl http://localhost:8888/api/effects
```

## Device Types Reference

### Supported Device Types

1. **WLED** - Most common, ESP8266/ESP32-based
2. **OpenRGB** - For PC RGB components
3. **E1.31** - DMX over Ethernet
4. **UDP** - Generic UDP devices
5. **Nanoleaf** - Nanoleaf panels
6. **Razer Chroma** - Razer peripherals

### Device Discovery

```bash
# Auto-discover WLED devices
curl -X POST http://localhost:8888/api/find_devices

# Find OpenRGB devices
curl -X GET http://localhost:8888/api/find_openrgb
```

## Testing the API

### Using curl

```bash
# Get server info
curl http://localhost:8888/api/info

# List devices
curl http://localhost:8888/api/devices

# List virtuals
curl http://localhost:8888/api/virtuals

# Set effect on virtual
curl -X POST http://localhost:8888/api/virtuals/my-virtual/effects \
  -H "Content-Type: application/json" \
  -d '{"type":"rainbow","config":{"speed":50}}'

# List scenes
curl http://localhost:8888/api/scenes

# Activate scene
curl -X PUT http://localhost:8888/api/scenes \
  -H "Content-Type: application/json" \
  -d '{"id":"my-scene","action":"activate"}'
```

### Using Python

```python
import requests

# Base URL
base_url = "http://localhost:8888/api"

# Get info
response = requests.get(f"{base_url}/info")
print(response.json())

# List devices
response = requests.get(f"{base_url}/devices")
print(response.json())

# Set effect
effect_data = {
    "type": "rainbow",
    "config": {
        "speed": 50,
        "brightness": 1.0
    }
}
response = requests.post(
    f"{base_url}/virtuals/my-virtual/effects",
    json=effect_data
)
print(response.json())
```

### Using JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:8888/api';

// Get info
fetch(`${baseUrl}/info`)
  .then(res => res.json())
  .then(data => console.log(data));

// Set effect
fetch(`${baseUrl}/virtuals/my-virtual/effects`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'rainbow',
    config: { speed: 50 }
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

## Development Resources

### LedFX Development Environment

**Requirements:**
- Python 3.9+ (3.12 recommended)
- Node.js 16+ (for frontend)
- Git

**Setup:**
```bash
# Clone repository
git clone https://github.com/LedFx/LedFx.git
cd LedFx

# Backend setup
python -m venv venv
source venv/bin/activate
pip install -e .[dev]

# Frontend setup (separate terminal)
cd frontend
npm install
npm run dev

# Run LedFX backend
python -m ledfx --dev
```

### Contributing

- **Contributing Guide:** Check GitHub repository for CONTRIBUTING.md
- **Code Style:** PEP 8 for Python, ESLint for TypeScript
- **Testing:** pytest for backend, Jest for frontend

## Model Context Protocol (MCP) Resources

### MCP Documentation

- **MCP Specification:**  
  https://modelcontextprotocol.io/

- **MCP TypeScript SDK:**  
  https://github.com/modelcontextprotocol/typescript-sdk

- **MCP Python SDK:**  
  https://github.com/modelcontextprotocol/python-sdk

### Claude Desktop Configuration

**MacOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

## Troubleshooting Resources

### Common Issues

1. **LedFX won't start:**
   - Check Python version (3.9+ required)
   - Verify no other process using port 8888
   - Check logs: `~/.ledfx/logs/`

2. **Device not discovered:**
   - Ensure device on same network
   - Check firewall settings
   - Verify device IP address

3. **Effects not working:**
   - Check audio device configuration
   - Verify virtual is active
   - Check device connection

### Debug Mode

```bash
# Run with verbose logging
ledfx -v

# Run with development mode
ledfx --dev

# Check logs
tail -f ~/.ledfx/logs/ledfx.log
```

## Hardware Resources

### Recommended LED Controllers

- **WLED Controllers:**  
  - ESP8266 (D1 Mini, NodeMCU)
  - ESP32 (DevKit, Pico)
  
- **WLED Firmware:**  
  https://github.com/Aircoookie/WLED

### LED Strip Types

- **WS2812B** - Most common, individually addressable
- **SK6812** - Similar to WS2812B with RGBW variant
- **APA102** - Higher refresh rate, more expensive

## Additional Tools

### Browser Extensions

- **JSON Viewer:** For viewing API responses
- **REST Client:** For testing API endpoints

### Desktop Applications

- **Postman:** API testing and development
- **Insomnia:** Alternative to Postman
- **WebSocket King:** For WebSocket endpoint testing

## Related Projects

- **WLED:** https://github.com/Aircoookie/WLED
- **Home Assistant Integration:** Search "LedFX" in HA integrations
- **Node-RED Nodes:** Community-developed LedFX nodes
- **OpenRGB:** https://openrgb.org/

## Learning Resources

### Video Tutorials

Search YouTube for:
- "LedFX setup tutorial"
- "LedFX effect programming"
- "WLED LedFX integration"

### Blog Posts and Articles

- LedFX official blog (if available)
- Reddit: r/LedFx
- Smart home forums discussing LedFX

## Support Channels

### Getting Help

1. **Discord:** Most active community support
2. **GitHub Issues:** Bug reports and feature requests
3. **GitHub Discussions:** Q&A and general discussion
4. **Reddit:** r/LedFx for community tips

### Reporting Issues

**For LedFX bugs:**
- GitHub: https://github.com/LedFx/LedFx/issues

**For MCP server bugs:**
- This repository's issue tracker

## License Information

- **LedFX:** MIT License
- **This MCP Server:** MIT License
- **MCP SDK:** MIT License

## Changelog and Release Notes

- **LedFX Releases:**  
  https://github.com/LedFx/LedFx/releases

- **Release Notes:**  
  Check GitHub releases for detailed changelogs

## API Rate Limiting

**Note:** LedFX does not implement rate limiting by default, but:
- Be respectful with API calls
- Implement client-side throttling if making many requests
- Consider websocket for real-time updates instead of polling

## Security Considerations

### Network Security

- LedFX has no authentication by default
- Consider running on isolated network/VLAN
- Use firewall rules to restrict access
- Consider reverse proxy with authentication

### Best Practices

- Don't expose LedFX directly to internet
- Use VPN for remote access
- Keep LedFX updated to latest version
- Monitor logs for suspicious activity

## Future Development

### Planned Features (Check LedFX Roadmap)

- WebSocket API improvements
- Additional effect types
- Enhanced integration support
- Mobile app development

---

**Document Maintenance:**
- Review quarterly for updates
- Check LedFX releases for API changes
- Update version numbers as needed
- Add new resources as discovered
