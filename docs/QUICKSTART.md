# Quick Start Guide for Developers

**Target Audience:** Developers implementing fixes based on specifications  
**Last Updated:** 2026-02-01  
**Status:** Specification Phase Complete

## TL;DR - What You Need to Know

1. ⚠️ **Current code has critical bugs** - won't work with real LedFX
2. 📚 **Complete specs are ready** - see `docs/` directory
3. 🐳 **Test environment included** - Docker Compose ready to use
4. 🔧 **Fixes are documented** - see IMPLEMENTATION_NOTES.md
5. ⏱️ **Estimated fix time: 8-13 hours**

## Quick Navigation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [SUMMARY.md](SUMMARY.md) | Executive overview | Start here |
| [IMPLEMENTATION_NOTES.md](IMPLEMENTATION_NOTES.md) | Bug list & fixes | Before coding |
| [API_SPECIFICATION.md](API_SPECIFICATION.md) | API reference | During coding |
| [TEST_SPECIFICATION.md](TEST_SPECIFICATION.md) | Test plans | Writing tests |
| [REFERENCES.md](REFERENCES.md) | External links | As needed |

## 5-Minute Setup

### 1. Start LedFX Test Server

```bash
# From project root
docker-compose up -d

# Verify it's running
curl http://localhost:8888/api/info
```

Expected response:
```json
{
  "url": "http://0.0.0.0:8888",
  "name": "LedFx",
  "version": "2.1.2"
}
```

### 2. Build Current Code

```bash
npm install
npm run build
```

### 3. Review Critical Issues

Open `docs/IMPLEMENTATION_NOTES.md` and read "Critical Issues Found" section.

## What's Wrong (In 3 Minutes)

### Issue #1: Wrong Endpoints

**Current code uses:**
```typescript
POST /api/devices/{device_id}/effects  // ❌ WRONG
```

**Should use:**
```typescript
POST /api/virtuals/{virtual_id}/effects  // ✅ CORRECT
```

### Issue #2: Missing Concepts

Current code doesn't understand **virtuals**.

**LedFX Architecture:**
```
Physical Devices → Virtuals → Effects
```

- ❌ Effects don't go on devices
- ✅ Effects go on virtuals
- Virtuals map to device segments

### Issue #3: Scene Activation

**Current:**
```typescript
PUT /api/scenes/{scene_id}/activate  // ❌ Wrong
```

**Should be:**
```typescript
PUT /api/scenes
Body: {"id": "scene_id", "action": "activate"}  // ✅ Correct
```

## Implementation Roadmap

### Phase 1: Critical Fixes (2-4 hours)

**File:** `src/ledfx-client.ts`

1. Add interface for virtuals:
```typescript
export interface LedFxVirtual {
  id: string;
  config: {
    name: string;
    pixel_count: number;
  };
  active: boolean;
  effect?: {
    type: string;
    config: Record<string, any>;
  };
  segments: Array<[string, number, number, boolean]>;
}
```

2. Add virtual methods:
```typescript
async getVirtuals(): Promise<LedFxVirtual[]> { /* ... */ }
async getVirtual(virtualId: string): Promise<LedFxVirtual> { /* ... */ }
async setVirtualActive(virtualId: string, active: boolean): Promise<void> { /* ... */ }
```

3. Fix effect methods:
```typescript
// OLD: setEffect(deviceId, ...)
// NEW:
async setVirtualEffect(
  virtualId: string,  // Changed from deviceId
  effectType: string,
  config: Record<string, any> = {}
): Promise<void> {
  await this.request(`/virtuals/${virtualId}/effects`, {  // Changed endpoint
    method: "POST",
    body: JSON.stringify({ type: effectType, config }),
  });
}
```

4. Fix scene activation:
```typescript
async activateScene(sceneId: string): Promise<void> {
  await this.request(`/scenes`, {  // Changed from /scenes/{id}/activate
    method: "PUT",
    body: JSON.stringify({
      id: sceneId,
      action: "activate"
    }),
  });
}
```

**File:** `src/tools.ts`

5. Update tool definitions:
```typescript
// OLD: device_id
// NEW: virtual_id
{
  name: "ledfx_set_effect",
  description: "Set an effect on a virtual",  // Updated
  inputSchema: {
    properties: {
      virtual_id: {  // Changed from device_id
        type: "string",
        description: "The unique identifier of the virtual",
      },
      effect_type: { /* ... */ },
      config: { /* ... */ }
    },
    required: ["virtual_id", "effect_type"],  // Updated
  }
}
```

6. Update handler:
```typescript
case "ledfx_set_effect": {
  await client.setVirtualEffect(  // Updated method name
    args.virtual_id,  // Changed from device_id
    args.effect_type,
    args.config || {}
  );
  return formatResponse({
    success: true,
    message: `Effect '${args.effect_type}' set on virtual '${args.virtual_id}'`
  });
}
```

### Phase 2: New Features (4-6 hours)

Add virtual management tools:

```typescript
// In tools.ts
const newTools = [
  {
    name: "ledfx_list_virtuals",
    description: "List all virtual LED strips",
    inputSchema: { /* ... */ }
  },
  {
    name: "ledfx_get_virtual",
    description: "Get details about a specific virtual",
    inputSchema: { /* ... */ }
  },
  // ... more tools
];
```

### Phase 3: Testing (2-3 hours)

Write tests per `TEST_SPECIFICATION.md`.

## Testing Your Changes

### Manual Test Sequence

1. **Start LedFX:**
```bash
docker-compose up -d
```

2. **Create a test virtual (via curl):**
```bash
# First, make sure you have a device
curl http://localhost:8888/api/devices

# Create a virtual
curl -X POST http://localhost:8888/api/virtuals \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "name": "Test Virtual",
      "pixel_count": 100
    },
    "segments": [["your-device-id", 0, 99, false]]
  }'
```

3. **Test effect setting:**
```bash
# Using the MCP server (once fixed)
# The virtual_id will be returned from the previous step
curl -X POST http://localhost:8888/api/virtuals/test-virtual/effects \
  -H "Content-Type: application/json" \
  -d '{
    "type": "rainbow",
    "config": {
      "speed": 50
    }
  }'
```

4. **Test scene activation:**
```bash
# List scenes first
curl http://localhost:8888/api/scenes

# Activate a scene
curl -X PUT http://localhost:8888/api/scenes \
  -H "Content-Type: application/json" \
  -d '{
    "id": "your-scene-id",
    "action": "activate"
  }'
```

### Automated Tests

```bash
# Once you've written tests
npm test
```

## Common Pitfalls

### ❌ Don't Do This

```typescript
// Don't apply effects to devices
await client.setEffect("device-id", "rainbow");

// Don't use this endpoint format
PUT /api/scenes/{id}/activate
```

### ✅ Do This Instead

```typescript
// Apply effects to virtuals
await client.setVirtualEffect("virtual-id", "rainbow");

// Use correct scene endpoint
PUT /api/scenes
Body: {"id": "scene-id", "action": "activate"}
```

## Debugging Tips

### Check LedFX Logs

```bash
# Docker logs
docker-compose logs -f ledfx

# Local LedFX
tail -f ~/.ledfx/logs/ledfx.log
```

### Test API Directly

```bash
# Info
curl http://localhost:8888/api/info

# Devices
curl http://localhost:8888/api/devices

# Virtuals (the important one!)
curl http://localhost:8888/api/virtuals

# Scenes
curl http://localhost:8888/api/scenes
```

### Common Errors

**"Device not found"**
- You're probably using a virtual ID on a device endpoint
- Check if you meant to use `/virtuals/` instead

**"Virtual is not active"**
- Virtual must be activated before applying effects
- Use `setVirtualActive(id, true)` first

**"Effect type not found"**
- Check available effects: `curl http://localhost:8888/api/schema/effects`
- Common types: rainbow, pulse, wavelength, gradient

## Resources While Coding

### Quick API Reference

```typescript
// Server info
GET /api/info

// Devices (physical hardware)
GET /api/devices
GET /api/devices/{id}

// Virtuals (logical strips - THIS IS WHERE EFFECTS GO!)
GET /api/virtuals
GET /api/virtuals/{id}
PUT /api/virtuals/{id}  // activate/deactivate
POST /api/virtuals/{id}/effects  // SET EFFECTS HERE!
DELETE /api/virtuals/{id}/effects

// Scenes
GET /api/scenes
PUT /api/scenes  // activate scene
```

### TypeScript Types You'll Need

```typescript
interface LedFxVirtual {
  id: string;
  config: {
    name: string;
    pixel_count: number;
  };
  active: boolean;
  effect?: {
    type: string;
    config: Record<string, any>;
  };
  segments: Array<[string, number, number, boolean]>;
}

interface EffectConfig {
  type: string;
  config: Record<string, any>;
}

interface Scene {
  id: string;
  name: string;
  virtuals: Record<string, {
    effect: EffectConfig;
  }>;
}
```

## Getting Help

### Documentation
1. Read `IMPLEMENTATION_NOTES.md` for detailed issue analysis
2. Check `API_SPECIFICATION.md` for endpoint details
3. Review `TEST_SPECIFICATION.md` for testing guidance

### External Resources
- LedFX API Docs: https://docs.ledfx.app/en/latest/apis/api.html
- LedFX GitHub: https://github.com/LedFx/LedFx
- Discord: https://discord.gg/ledfx

### Testing Questions
- Is LedFX running? `docker-compose ps`
- Can you reach it? `curl http://localhost:8888/api/info`
- Do you have virtuals? `curl http://localhost:8888/api/virtuals`

## Success Checklist

Before considering your work done:

- [ ] All critical issues from IMPLEMENTATION_NOTES.md fixed
- [ ] Code builds without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Manual tests with real LedFX work
- [ ] At least basic unit tests written
- [ ] Documentation updated (if APIs changed)
- [ ] No TypeScript errors
- [ ] Code reviewed against API_SPECIFICATION.md

## Next Steps After Implementation

1. **Test thoroughly** with real LedFX instance
2. **Update documentation** based on findings
3. **Write comprehensive tests** per TEST_SPECIFICATION.md
4. **Update version** to 1.0.0
5. **Create release** with changelog

---

**Remember:** The specifications are your guide. The current code is wrong. Trust the specs!

**Good luck! 🚀**
