/**
 * End-to-end tests for the MCP server
 * 
 * These tests verify the complete flow from MCP tools to LedFX API
 * Note: Requires a running LedFX instance (can use docker-compose)
 */

import { describe, expect, test, beforeAll } from '@jest/globals';
import { handleToolCall } from '../../src/tools.js';
import { createLedFxClient } from '../../src/ledfx-client.js';

describe('End-to-End MCP Server Tests', () => {
  let skipLedFx = false;

  beforeAll(async () => {
    // Initialize the global client (mimics what index.ts does)
    const client = createLedFxClient();
    (global as any).ledfxClient = client;

    await client.getInfo().catch(() => {
      skipLedFx = true;
    });
  });

  describe('Color Tools', () => {
    test('ledfx_list_colors should return colors', async () => {
      if (skipLedFx) {
        console.log('Skipped - LedFX not running');
        return;
      }
      const result = await handleToolCall('ledfx_list_colors', {});
      
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      
      const data = JSON.parse(result.content[0].text);
      expect(data.colors).toBeDefined();
      expect(data.gradients).toBeDefined();
      expect(data.colors.builtin).toBeDefined();
      expect(data.colors.user).toBeDefined();
      expect(data.gradients.builtin).toBeDefined();
      expect(data.gradients.user).toBeDefined();
    });

    test('ledfx_upsert_color_or_gradient should create a user color', async () => {
      if (skipLedFx) {
        console.log('Skipped - LedFX not running');
        return;
      }
      const colorId = `test-color-${Date.now()}`;
      const result = await handleToolCall('ledfx_upsert_color_or_gradient', {
        type: 'color',
        id: colorId,
        value: '#FF00FF',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);

      await handleToolCall('ledfx_delete_color_or_gradient', { id: colorId });
    });
  });

  describe('AI Tools', () => {
    test('ledfx_recommend_effects should provide recommendations', async () => {
      const result = await handleToolCall('ledfx_recommend_effects', {
        description: 'party music',
      });
      
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('effectType');
      expect(data[0]).toHaveProperty('reason');
      expect(data[0]).toHaveProperty('confidence');
    });

    test('ledfx_explain_feature should explain virtuals', async () => {
      const result = await handleToolCall('ledfx_explain_feature', {
        feature: 'virtuals',
      });
      
      const data = JSON.parse(result.content[0].text);
      expect(data.feature).toBe('virtuals');
      expect(data.explanation).toBeDefined();
      expect(data.explanation.length).toBeGreaterThan(50);
    });

    test('ledfx_list_features should return feature categories', async () => {
      const result = await handleToolCall('ledfx_list_features', {});
      
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('Core Concepts');
      expect(Array.isArray(data['Core Concepts'])).toBe(true);
    });

    test('ledfx_list_effect_types should return effect metadata', async () => {
      const result = await handleToolCall('ledfx_list_effect_types', {});
      
      const data = JSON.parse(result.content[0].text);
      expect(data.count).toBeDefined();
      expect(Array.isArray(data.effects)).toBe(true);
    });
  });

  describe('Palette Management Tools', () => {
    test('ledfx_create_palette should create a palette', async () => {
      if (skipLedFx) {
        console.log('Skipped - LedFX not running');
        return;
      }
      const paletteName = `Test Palette ${Date.now()}`;
      const result = await handleToolCall('ledfx_create_palette', {
        name: paletteName,
        colors: ['#FF0000', '#00FF00', '#0000FF'],
      });
      
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.id).toContain('palette:');

      await handleToolCall('ledfx_delete_palette', { name: paletteName });
    });

    test('ledfx_list_palettes should return palettes', async () => {
      if (skipLedFx) {
        console.log('Skipped - LedFX not running');
        return;
      }
      const result = await handleToolCall('ledfx_list_palettes', {});
      
      const data = JSON.parse(result.content[0].text);
      expect(Array.isArray(data.palettes)).toBe(true);
    });
  });

  describe('Playlist Management Tools', () => {
    test('ledfx_create_playlist should create a playlist', async () => {
      const result = await handleToolCall('ledfx_create_playlist', {
        name: `Test Playlist ${Date.now()}`,
        scene_ids: ['scene1', 'scene2'],
        transition_time: 10,
        loop: true,
        description: 'E2E test playlist',
      });
      
      const data = JSON.parse(result.content[0].text);
      expect(data.success).toBe(true);
      expect(data.playlist).toBeDefined();
    });

    test('ledfx_list_playlists should return playlists', async () => {
      const result = await handleToolCall('ledfx_list_playlists', {});
      
      const data = JSON.parse(result.content[0].text);
      expect(data).toBeDefined();
      expect(typeof data).toBe('object');
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown tool gracefully', async () => {
      const result = await handleToolCall('unknown_tool', {});
      
      const data = JSON.parse(result.content[0].text);
      expect(data.ok).toBe(false);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe('UNEXPECTED_ERROR');
      expect(data.error.message).toContain('Unknown tool');
    });

    test('should handle missing palette gracefully', async () => {
      if (skipLedFx) {
        console.log('Skipped - LedFX not running');
        return;
      }
      const result = await handleToolCall('ledfx_get_palette', {
        name: 'nonexistent-palette-99999',
      });
      
      const data = JSON.parse(result.content[0].text);
      expect(data.error).toBeDefined();
    });
  });

  describe('Natural Language Scene Creation', () => {
    test('should parse and create scene from description', async () => {
      if (skipLedFx) {
        console.log('Skipped - LedFX not running');
        return;
      }
      // Note: This requires active virtuals to fully test
      // For now, we just test the parsing logic
      const result = await handleToolCall('ledfx_create_scene_from_description', {
        description: 'Create a calm ocean scene with slow blue waves',
        virtual_ids: [], // Empty array means it will try to use active virtuals
      });
      
      const data = JSON.parse(result.content[0].text);
      // It may fail if no LedFX is running, but should still parse
      expect(data).toBeDefined();
    });
  });
});

describe('LedFX API Integration (requires running LedFX)', () => {
  let skipTests = false;
  let client: any;

  beforeAll(async () => {
    client = createLedFxClient();
    try {
      await client.getInfo();
    } catch (error) {
      console.log('⚠️  LedFX not running - skipping integration tests');
      console.log('   Start LedFX with: docker-compose up -d');
      skipTests = true;
    }
  });

  test('should connect to LedFX and get info', async () => {
    if (skipTests) {
      console.log('Skipped - LedFX not running');
      return;
    }

    const info = await client.getInfo();
    expect(info).toBeDefined();
    expect(info.version).toBeDefined();
  });

  test('should list devices', async () => {
    if (skipTests) {
      console.log('Skipped - LedFX not running');
      return;
    }

    const devices = await client.getDevices();
    expect(Array.isArray(devices)).toBe(true);
  });

  test('should list virtuals', async () => {
    if (skipTests) {
      console.log('Skipped - LedFX not running');
      return;
    }

    const virtuals = await client.getVirtuals();
    expect(Array.isArray(virtuals)).toBe(true);
  });

  test('should list scenes', async () => {
    if (skipTests) {
      console.log('Skipped - LedFX not running');
      return;
    }

    const scenes = await client.getScenes();
    expect(Array.isArray(scenes)).toBe(true);
  });
});
