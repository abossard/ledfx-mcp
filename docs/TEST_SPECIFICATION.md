# LedFX MCP Server - Test Specification

**Document Version:** 1.0  
**Last Updated:** 2026-02-01  
**Target LedFX Version:** 2.1.2+

## Overview

This document outlines the test requirements and test cases for the LedFX MCP server. Tests should validate both the MCP protocol implementation and the LedFX API integration.

## Test Environment Setup

### Prerequisites

1. **LedFX Instance**: Running LedFX server (via Docker or local installation)
2. **Node.js**: Version 18+ for running the MCP server
3. **Test Framework**: Jest or similar for unit and integration tests
4. **MCP Client**: Test harness for MCP protocol validation

### Docker-Based Test Setup

For consistent testing, use the official LedFX Docker image:

```bash
# Pull the official LedFX Docker image
docker pull ledfxorg/ledfx:latest

# Run LedFX in a container
docker run -d \
  --name ledfx-test \
  -p 8888:8888 \
  ledfxorg/ledfx:latest
```

### Local Installation Setup

Alternative to Docker for development:

```bash
# Install LedFX via pip
pip install ledfx

# Run LedFX
ledfx --host 127.0.0.1 --port 8888
```

## Test Categories

### 1. Unit Tests

Test individual components in isolation.

#### 1.1 LedFxClient Tests

**Test File:** `tests/unit/ledfx-client.test.ts`

##### Test Cases:

1. **Constructor Initialization**
   - ✓ Should create client with default configuration
   - ✓ Should create client with custom host/port
   - ✓ Should read configuration from environment variables
   - ✓ Should construct correct base URL

2. **Request Method**
   - ✓ Should make HTTP GET request with correct headers
   - ✓ Should make HTTP POST request with JSON body
   - ✓ Should make HTTP PUT request
   - ✓ Should make HTTP DELETE request
   - ✓ Should handle successful responses (200)
   - ✓ Should throw error on HTTP error status (404, 500)
   - ✓ Should throw error on network failure
   - ✓ Should parse JSON response correctly
   - ✓ Should include Content-Type header

3. **getInfo Method**
   - ✓ Should call correct endpoint (/api/info)
   - ✓ Should return server information
   - ✓ Should handle connection errors gracefully

4. **getDevices Method**
   - ✓ Should call /api/devices endpoint
   - ✓ Should return array of devices
   - ✓ Should transform response.devices object to array
   - ✓ Should handle empty device list

5. **getDevice Method**
   - ✓ Should call /api/devices/{id} endpoint
   - ✓ Should return single device object
   - ✓ Should handle device not found (404)

6. **setEffect Method**
   - ✓ Should call /api/devices/{id}/effects with POST
   - ✓ Should send effect type and config
   - ✓ Should handle empty config object
   - ✓ Should validate effect type parameter

7. **clearEffect Method**
   - ✓ Should call /api/devices/{id}/effects with DELETE
   - ✓ Should handle device without active effect

8. **getScenes Method**
   - ✓ Should call /api/scenes endpoint
   - ✓ Should return array of scenes
   - ✓ Should transform response.scenes object to array

9. **activateScene Method**
   - ✓ Should call /api/scenes/{id}/activate with PUT
   - ✓ Should handle scene not found

#### 1.2 Tools Tests

**Test File:** `tests/unit/tools.test.ts`

##### Test Cases:

1. **Tool Definitions**
   - ✓ Should export valid tools array
   - ✓ All tools should have name, description, inputSchema
   - ✓ Tool names should follow naming convention (ledfx_*)
   - ✓ Input schemas should be valid JSON Schema
   - ✓ Required fields should be specified

2. **formatResponse Function**
   - ✓ Should return correct MCP response structure
   - ✓ Should stringify JSON with proper formatting
   - ✓ Should handle complex objects
   - ✓ Should handle null/undefined values

3. **handleToolCall Function**
   - ✓ Should route to correct handler by tool name
   - ✓ Should throw error for unknown tool
   - ✓ Should catch and format errors from client
   - ✓ Should pass correct arguments to client methods

### 2. Integration Tests

Test the MCP server with a real or mocked LedFX instance.

**Test File:** `tests/integration/mcp-server.test.ts`

#### 2.1 Server Initialization

##### Test Cases:

1. **Server Startup**
   - ✓ Should start MCP server without errors
   - ✓ Should initialize stdio transport
   - ✓ Should create global LedFxClient instance
   - ✓ Should handle startup errors gracefully

#### 2.2 MCP Protocol Tests

##### Test Cases:

1. **List Tools Request**
   - ✓ Should respond to ListTools request
   - ✓ Should return all defined tools
   - ✓ Should include correct tool schemas

2. **Call Tool Requests**
   - ✓ Should handle ledfx_get_info tool call
   - ✓ Should handle ledfx_list_devices tool call
   - ✓ Should handle ledfx_get_device tool call
   - ✓ Should handle ledfx_set_effect tool call
   - ✓ Should handle ledfx_clear_effect tool call
   - ✓ Should handle ledfx_list_scenes tool call
   - ✓ Should handle ledfx_activate_scene tool call
   - ✓ Should return error for invalid tool name
   - ✓ Should validate required arguments

### 3. API Integration Tests

Test against actual LedFX API.

**Test File:** `tests/integration/ledfx-api.test.ts`

#### 3.1 Prerequisites

- LedFX server running (Docker or local)
- At least one device configured
- At least one virtual configured
- At least one scene created

#### 3.2 Test Cases

1. **Server Information**
   - ✓ Should retrieve server info
   - ✓ Should return valid version number
   - ✓ Should return valid URL

2. **Device Operations**
   - ✓ Should list all devices
   - ✓ Should retrieve specific device by ID
   - ✓ Should handle non-existent device ID

3. **Virtual Operations**
   - ✓ Should list all virtuals
   - ✓ Should retrieve specific virtual by ID
   - ✓ Should get virtual effect configuration

4. **Effect Operations**
   - ✓ Should set effect on virtual
   - ✓ Should update effect configuration
   - ✓ Should clear effect from virtual
   - ✓ Should handle invalid effect type
   - ✓ Should validate effect configuration

5. **Scene Operations**
   - ✓ Should list all scenes
   - ✓ Should activate a scene
   - ✓ Should handle non-existent scene ID

6. **Schema Queries**
   - ✓ Should retrieve all schemas
   - ✓ Should retrieve devices schema
   - ✓ Should retrieve effects schema

### 4. End-to-End Tests

Test complete workflows through the MCP protocol.

**Test File:** `tests/e2e/workflows.test.ts`

#### 4.1 Test Scenarios

1. **Basic LED Control Workflow**
   ```
   1. List devices
   2. Get specific device details
   3. List virtuals
   4. Set rainbow effect on first virtual
   5. Verify effect is active
   6. Clear effect
   7. Verify effect is cleared
   ```

2. **Scene Activation Workflow**
   ```
   1. List available scenes
   2. Activate a specific scene
   3. Verify virtuals updated with scene config
   ```

3. **Effect Customization Workflow**
   ```
   1. Set effect with default config
   2. Update effect config with custom parameters
   3. Verify config changes applied
   ```

4. **Error Handling Workflow**
   ```
   1. Attempt to get non-existent device
   2. Verify error response
   3. Attempt to activate non-existent scene
   4. Verify error response
   ```

### 5. Performance Tests

Validate performance characteristics.

**Test File:** `tests/performance/load.test.ts`

#### 5.1 Test Cases

1. **Response Time**
   - ✓ API calls should complete within 100ms (local)
   - ✓ API calls should complete within 500ms (network)

2. **Concurrent Requests**
   - ✓ Should handle 10 concurrent tool calls
   - ✓ Should maintain response accuracy under load

3. **Memory Usage**
   - ✓ Should not leak memory during extended operation
   - ✓ Client instances should be reusable

### 6. Compatibility Tests

Verify compatibility with different LedFX versions.

**Test File:** `tests/compatibility/versions.test.ts`

#### 6.1 Test Matrix

| LedFX Version | Test Status | Notes |
|---------------|-------------|-------|
| 2.1.2         | ✓ Required  | Current stable |
| 2.1.1         | ✓ Required  | Previous stable |
| 2.0.x         | ⚠ Optional  | May have API differences |
| 0.x.x         | ✗ Not supported | Beta versions |

#### 6.2 Test Cases

1. **Version Detection**
   - ✓ Should detect LedFX version from /api/info
   - ✓ Should log warning for unsupported versions

2. **API Compatibility**
   - ✓ Core endpoints should work across 2.1.x versions
   - ✓ Should gracefully handle missing endpoints

### 7. Security Tests

Validate security aspects.

**Test File:** `tests/security/security.test.ts`

#### 7.1 Test Cases

1. **Input Validation**
   - ✓ Should reject invalid device IDs (injection attempts)
   - ✓ Should reject invalid effect types
   - ✓ Should sanitize configuration parameters

2. **Error Information Leakage**
   - ✓ Errors should not expose internal paths
   - ✓ Errors should not expose system information

3. **Connection Security**
   - ✓ Should handle connection failures gracefully
   - ✓ Should timeout on hung connections

## Test Data

### Sample Device Configuration

```json
{
  "id": "test-device-1",
  "type": "wled",
  "config": {
    "name": "Test LED Strip",
    "pixel_count": 100,
    "ip_address": "192.168.1.100"
  }
}
```

### Sample Virtual Configuration

```json
{
  "id": "test-virtual-1",
  "config": {
    "name": "Test Virtual",
    "pixel_count": 100
  },
  "segments": [
    ["test-device-1", 0, 99, false]
  ]
}
```

### Sample Effect Configuration

```json
{
  "type": "rainbow",
  "config": {
    "speed": 50,
    "brightness": 1.0
  }
}
```

### Sample Scene Configuration

```json
{
  "id": "test-scene-1",
  "name": "Test Scene",
  "virtuals": {
    "test-virtual-1": {
      "effect": {
        "type": "rainbow",
        "config": {}
      }
    }
  }
}
```

## Mocking Strategy

For unit tests without a live LedFX instance:

### Mock LedFX Server

Create a mock HTTP server that simulates LedFX API responses:

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockServer = setupServer(
  http.get('http://localhost:8888/api/info', () => {
    return HttpResponse.json({
      url: 'http://localhost:8888',
      name: 'LedFx Mock',
      version: '2.1.2'
    });
  }),
  
  http.get('http://localhost:8888/api/devices', () => {
    return HttpResponse.json({
      status: 'success',
      devices: {}
    });
  })
  // ... more endpoints
);
```

## Test Execution

### Running Tests

```bash
# Install test dependencies
npm install --save-dev jest @types/jest ts-jest msw

# Run all tests
npm test

# Run specific test suite
npm test -- tests/unit/

# Run with coverage
npm test -- --coverage

# Run integration tests (requires LedFX)
npm run test:integration

# Run e2e tests (requires LedFX and MCP client)
npm run test:e2e
```

### Continuous Integration

Tests should run in CI/CD pipeline:

1. Start LedFX Docker container
2. Wait for LedFX to be ready (health check)
3. Run unit tests
4. Run integration tests
5. Run e2e tests
6. Stop LedFX container

## Test Coverage Goals

- **Unit Tests:** >90% code coverage
- **Integration Tests:** All API endpoints covered
- **E2E Tests:** All MCP tools covered
- **Overall:** >80% code coverage

## Test Documentation

Each test should include:

1. **Description:** Clear description of what is being tested
2. **Setup:** Any required setup or preconditions
3. **Execution:** Step-by-step test execution
4. **Assertions:** Expected outcomes
5. **Cleanup:** Any required cleanup

## Future Test Enhancements

1. **Load Testing:** Stress test with high request volume
2. **WebSocket Testing:** When WebSocket support is added
3. **Multi-Instance Testing:** Test with multiple LedFX instances
4. **Fault Injection:** Test resilience to network failures
5. **Visual Regression:** Validate LED output patterns (if applicable)

## References

- [Jest Documentation](https://jestjs.io/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [MCP SDK Testing Guide](https://modelcontextprotocol.io/docs/testing)
- [LedFX API Documentation](https://docs.ledfx.app/en/latest/apis/api.html)

## Appendix: Test Fixtures

### A. Environment Variables for Testing

```bash
LEDFX_HOST=localhost
LEDFX_PORT=8888
TEST_TIMEOUT=30000
```

### B. Docker Compose for Test Environment

```yaml
version: '3.8'
services:
  ledfx:
    image: ledfxorg/ledfx:latest
    ports:
      - "8888:8888"
    environment:
      - LEDFX_HOST=0.0.0.0
      - LEDFX_PORT=8888
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8888/api/info"]
      interval: 5s
      timeout: 3s
      retries: 5
```

### C. Sample Test Configuration

```json
{
  "testEnvironment": "node",
  "roots": ["<rootDir>/tests"],
  "testMatch": ["**/*.test.ts"],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```
