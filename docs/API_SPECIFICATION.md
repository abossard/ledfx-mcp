# LedFX API Specification

**Document Version:** 1.0  
**Target LedFX Version:** 2.1.2+  
**Last Updated:** 2026-02-01  
**Official API Documentation:** https://docs.ledfx.app/en/latest/apis/api.html

## Overview

This document specifies the LedFX REST API endpoints that the MCP server implementation should support. The specification is based on the official LedFX API documentation and validated against the latest version.

## Base Configuration

- **Default Host:** `localhost`
- **Default Port:** `8888`
- **Base URL:** `http://{host}:{port}/api`
- **Protocol:** HTTP/1.1
- **Content-Type:** `application/json`

## API Endpoints

### 1. Server Information

#### GET /api/info

Returns basic information about the LedFX instance.

**Request:**
- Method: `GET`
- Path: `/api/info`
- Body: None

**Response:**
```json
{
  "url": "http://127.0.0.1:8888",
  "name": "LedFx",
  "version": "2.1.2"
}
```

**Fields:**
- `url` (string): The base URL of the LedFX instance
- `name` (string): The name of the LedFX instance
- `version` (string): The LedFX version number

**Status Codes:**
- `200`: Success
- `500`: Server error

---

### 2. Devices Management

#### GET /api/devices

Get configuration of all devices.

**Request:**
- Method: `GET`
- Path: `/api/devices`
- Body: None

**Response:**
```json
{
  "status": "success",
  "devices": {
    "device-id-1": {
      "id": "device-id-1",
      "type": "wled",
      "config": {
        "name": "My LED Strip",
        "pixel_count": 144,
        "ip_address": "192.168.1.100"
      }
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

#### GET /api/devices/{device_id}

Get information about a specific device.

**Request:**
- Method: `GET`
- Path: `/api/devices/{device_id}`
- Parameters:
  - `device_id` (string): Unique identifier of the device

**Response:**
```json
{
  "id": "device-id-1",
  "type": "wled",
  "config": {
    "name": "My LED Strip",
    "pixel_count": 144,
    "ip_address": "192.168.1.100"
  },
  "active_virtuals": []
}
```

**Status Codes:**
- `200`: Success
- `404`: Device not found
- `500`: Server error

#### POST /api/devices

Add a new device to LedFX.

**Request:**
- Method: `POST`
- Path: `/api/devices`
- Body:
```json
{
  "type": "wled",
  "config": {
    "name": "New LED Strip",
    "pixel_count": 100,
    "ip_address": "192.168.1.101"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "device": {
    "id": "new-device-id",
    "type": "wled",
    "config": {
      "name": "New LED Strip",
      "pixel_count": 100,
      "ip_address": "192.168.1.101"
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid configuration
- `500`: Server error

#### PUT /api/devices/{device_id}

Update device configuration.

**Request:**
- Method: `PUT`
- Path: `/api/devices/{device_id}`
- Body:
```json
{
  "config": {
    "name": "Updated Name",
    "pixel_count": 150
  }
}
```

**Response:**
```json
{
  "status": "success",
  "device": {
    "id": "device-id",
    "type": "wled",
    "config": {
      "name": "Updated Name",
      "pixel_count": 150,
      "ip_address": "192.168.1.100"
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Device not found
- `400`: Invalid configuration
- `500`: Server error

#### DELETE /api/devices/{device_id}

Delete a device.

**Request:**
- Method: `DELETE`
- Path: `/api/devices/{device_id}`

**Response:**
```json
{
  "status": "success"
}
```

**Status Codes:**
- `200`: Success
- `404`: Device not found
- `500`: Server error

---

### 3. Virtuals Management

Virtuals are logical LED strips that can span multiple physical devices and have effects applied to them.

#### GET /api/virtuals

Get configuration of all virtuals.

**Request:**
- Method: `GET`
- Path: `/api/virtuals`

**Response:**
```json
{
  "status": "success",
  "virtuals": {
    "virtual-id-1": {
      "id": "virtual-id-1",
      "config": {
        "name": "Main Strip",
        "pixel_count": 200
      },
      "active": true,
      "effect": {
        "type": "rainbow",
        "config": {}
      }
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

#### POST /api/virtuals

Create a new virtual.

**Request:**
- Method: `POST`
- Path: `/api/virtuals`
- Body:
```json
{
  "config": {
    "name": "New Virtual",
    "pixel_count": 100
  },
  "segments": [
    ["device-id-1", 0, 99, false]
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "virtual": {
    "id": "new-virtual-id",
    "config": {
      "name": "New Virtual",
      "pixel_count": 100
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid configuration
- `500`: Server error

---

### 4. Effects Management

#### GET /api/virtuals/{virtual_id}/effects

Get the active effect configuration for a virtual.

**Request:**
- Method: `GET`
- Path: `/api/virtuals/{virtual_id}/effects`

**Response:**
```json
{
  "status": "success",
  "effect": {
    "type": "rainbow",
    "config": {
      "speed": 50,
      "brightness": 1.0
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Virtual not found
- `500`: Server error

#### POST /api/virtuals/{virtual_id}/effects

Set a new effect on a virtual.

**Request:**
- Method: `POST`
- Path: `/api/virtuals/{virtual_id}/effects`
- Body:
```json
{
  "type": "rainbow",
  "config": {
    "speed": 50,
    "brightness": 1.0
  }
}
```

**Optional Parameters:**
- `fallback` (boolean|number): Set fallback behavior
  - `true`: Enable fallback after 300 seconds
  - `false`: No fallback
  - Number: Fallback after N seconds

**Response:**
```json
{
  "status": "success",
  "effect": {
    "type": "rainbow",
    "config": {
      "speed": 50,
      "brightness": 1.0
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Virtual not found
- `400`: Invalid effect configuration
- `500`: Server error

#### PUT /api/virtuals/{virtual_id}/effects

Update the active effect configuration.

**Request:**
- Method: `PUT`
- Path: `/api/virtuals/{virtual_id}/effects`
- Body:
```json
{
  "config": {
    "speed": 75
  }
}
```

**Special Value:**
- `"RANDOMIZE"`: Generates random effect configuration

**Response:**
```json
{
  "status": "success",
  "effect": {
    "type": "rainbow",
    "config": {
      "speed": 75,
      "brightness": 1.0
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Virtual not found
- `400`: Invalid configuration
- `500`: Server error

#### DELETE /api/virtuals/{virtual_id}/effects

Clear the active effect from a virtual.

**Request:**
- Method: `DELETE`
- Path: `/api/virtuals/{virtual_id}/effects`

**Response:**
```json
{
  "status": "success"
}
```

**Status Codes:**
- `200`: Success
- `404`: Virtual not found
- `500`: Server error

---

### 5. Scenes Management

Scenes are pre-configured combinations of effects across multiple virtuals.

#### GET /api/scenes

List all available scenes.

**Request:**
- Method: `GET`
- Path: `/api/scenes`

**Response:**
```json
{
  "status": "success",
  "scenes": {
    "scene-id-1": {
      "id": "scene-id-1",
      "name": "Party Mode",
      "virtuals": {
        "virtual-id-1": {
          "effect": {
            "type": "rainbow",
            "config": {}
          }
        }
      }
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

#### PUT /api/scenes

Activate a scene.

**Request:**
- Method: `PUT`
- Path: `/api/scenes`
- Body:
```json
{
  "id": "scene-id-1",
  "action": "activate"
}
```

**Response:**
```json
{
  "status": "success",
  "scene": {
    "id": "scene-id-1",
    "name": "Party Mode"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Scene not found
- `500`: Server error

#### POST /api/scenes

Create a new scene from current configuration.

**Request:**
- Method: `POST`
- Path: `/api/scenes`
- Body:
```json
{
  "name": "New Scene",
  "scene_tags": "chill,ambient"
}
```

**Response:**
```json
{
  "status": "success",
  "scene": {
    "id": "new-scene-id",
    "name": "New Scene"
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid configuration
- `500`: Server error

#### DELETE /api/scenes

Delete a scene.

**Request:**
- Method: `DELETE`
- Path: `/api/scenes`
- Body:
```json
{
  "id": "scene-id-1"
}
```

**Response:**
```json
{
  "status": "success"
}
```

**Status Codes:**
- `200`: Success
- `404`: Scene not found
- `500`: Server error

---

### 6. Schema Queries

#### GET /api/schema

Get all schema definitions.

**Request:**
- Method: `GET`
- Path: `/api/schema`

**Response:**
```json
{
  "devices": { /* device schemas */ },
  "effects": { /* effect schemas */ },
  "virtuals": { /* virtual schemas */ },
  "audio": { /* audio schemas */ }
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

#### GET /api/schema/{schema_type}

Get a specific schema type.

**Request:**
- Method: `GET`
- Path: `/api/schema/{schema_type}`
- Parameters:
  - `schema_type`: One of `devices`, `effects`, `virtuals`, `audio`, `integrations`

**Response:**
```json
{
  "wled": {
    "schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "pixel_count": {"type": "integer"},
        "ip_address": {"type": "string"}
      }
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Schema type not found
- `500`: Server error

---

### 7. Audio Devices

#### GET /api/audio/devices

Get available audio input devices.

**Request:**
- Method: `GET`
- Path: `/api/audio/devices`

**Response:**
```json
{
  "status": "success",
  "active_device_index": 1,
  "devices": {
    "0": "Microsoft Sound Mapper - Input",
    "1": "Microphone (Realtek High Definition Audio)",
    "2": "Stereo Mix (Realtek High Definition Audio)"
  }
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

#### PUT /api/audio/devices

Set the active audio input device.

**Request:**
- Method: `PUT`
- Path: `/api/audio/devices`
- Body:
```json
{
  "audio_device": 2
}
```

**Response:**
```json
{
  "status": "success"
}
```

**Error Response:**
```json
{
  "status": "failed",
  "reason": "Invalid device index [99]"
}
```

**Status Codes:**
- `200`: Success (or failed status in body)
- `500`: Server error

---

### 8. Configuration

#### GET /api/config

Get LedFX configuration.

**Request:**
- Method: `GET`
- Path: `/api/config`
- Body (optional):
  - Single key: `"audio"`
  - Multiple keys: `["audio", "devices", "scenes"]`
  - No body: Returns full configuration

**Response:**
```json
{
  "host": "127.0.0.1",
  "port": 8888,
  "audio": {
    "min_volume": 0.3
  },
  "devices": {},
  "virtuals": {},
  "scenes": {}
}
```

**Status Codes:**
- `200`: Success
- `500`: Server error

#### PUT /api/config

Update LedFX configuration (may trigger restart).

**Request:**
- Method: `PUT`
- Path: `/api/config`
- Body:
```json
{
  "audio": {
    "min_volume": 0.5
  },
  "port": 8080
}
```

**Response:**
```json
{
  "status": "success"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid configuration
- `500`: Server error

---

## Effect Types

Common effect types available in LedFX (may vary by version):

- `rainbow`: Classic rainbow animation
- `pulse`: Pulsing effect to music
- `wavelength`: Wave-like patterns
- `energy`: Energy-based visualization
- `singleColor`: Single solid color
- `gradient`: Color gradient effect
- `strobe`: Strobe light effect
- `scroll`: Scrolling patterns

Each effect has its own configuration schema available via `/api/schema/effects`.

---

## Error Handling

All endpoints may return error responses in the following format:

```json
{
  "status": "failed",
  "reason": "Error description"
}
```

Or:

```json
{
  "status": "error",
  "error": "Error description"
}
```

---

## WebSocket Endpoints

### /api/log

Opens a WebSocket connection for real-time logging.

**Note:** This endpoint is not implemented in the current MCP server version as it requires WebSocket support.

---

## Version Compatibility

This specification is based on LedFX version 2.1.2 and later. Some endpoints may not be available in earlier versions. Always check the `/api/info` endpoint to verify the server version.

### Version History

- **2.1.x**: Current stable release
- **2.0.x**: Previous stable release
- **0.x.x**: Beta/development releases

---

## References

- [LedFX Official Documentation](https://docs.ledfx.app/en/latest/)
- [LedFX REST API Reference](https://docs.ledfx.app/en/latest/apis/api.html)
- [LedFX GitHub Repository](https://github.com/LedFx/LedFx)
- [LedFX Docker Image](https://hub.docker.com/r/ledfxorg/ledfx)
- [Postman API Collection](https://documenter.getpostman.com/view/5403870/TVzNHyyw)

---

## Notes for Implementation

1. **Virtuals vs Devices**: LedFX uses a two-tier model:
   - **Devices**: Physical LED hardware (WLED, ESP8266, etc.)
   - **Virtuals**: Logical LED strips that can span multiple devices
   - Effects are applied to **virtuals**, not directly to devices

2. **Effect Configuration**: Each effect type has its own configuration schema. Use `/api/schema/effects` to get valid parameters.

3. **Scene Activation**: Scenes can activate multiple virtuals with different effects simultaneously.

4. **Naming Conventions**: 
   - Device IDs are typically lowercase with hyphens
   - Virtual IDs follow the same convention
   - Scene IDs are user-defined

5. **Future Endpoints**: Some endpoints marked as "(upcoming)" in the official docs may not be available yet. Always verify availability against the target LedFX version.
