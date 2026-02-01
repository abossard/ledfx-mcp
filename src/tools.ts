/**
 * Comprehensive MCP Tools for LedFX
 * 
 * Provides advanced features including:
 * - Virtual and device management
 * - Palette management (SQLite-backed)
 * - Natural language scene creation
 * - Effect recommendations
 * - LedFX feature explanations
 * - Playlist management
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { LedFxClient } from "./ledfx-client.js";
import { getDatabase } from "./database.js";
import { findColor, findGradient, NAMED_COLORS, GRADIENTS, getColorCategories, getGradientCategories } from "./colors.js";
import { parseSceneDescription, recommendEffects, explainFeature, getFeatureCategories, EFFECT_TYPES } from "./ai-helper.js";

/**
 * Comprehensive tool definitions
 */
export const tools: Tool[] = [
  // ========== Server Information ==========
  {
    name: "ledfx_get_info",
    description: "Get information about the LedFX server including version and configuration",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },

  // ========== Device Management ==========
  {
    name: "ledfx_list_devices",
    description: "List all physical LED devices configured in LedFX (WLED, OpenRGB, etc.)",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_get_device",
    description: "Get detailed information about a specific LED device",
    inputSchema: {
      type: "object",
      properties: {
        device_id: {
          type: "string",
          description: "The unique identifier of the device",
        },
      },
      required: ["device_id"],
    },
  },

  // ========== Virtual Management (CORRECTED) ==========
  {
    name: "ledfx_list_virtuals",
    description: "List all virtual LED strips. Virtuals are logical strips where effects are applied.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_get_virtual",
    description: "Get detailed information about a specific virtual",
    inputSchema: {
      type: "object",
      properties: {
        virtual_id: {
          type: "string",
          description: "The unique identifier of the virtual",
        },
      },
      required: ["virtual_id"],
    },
  },
  {
    name: "ledfx_activate_virtual",
    description: "Activate or deactivate a virtual. Virtuals must be active to display effects.",
    inputSchema: {
      type: "object",
      properties: {
        virtual_id: {
          type: "string",
          description: "The unique identifier of the virtual",
        },
        active: {
          type: "boolean",
          description: "True to activate, false to deactivate",
        },
      },
      required: ["virtual_id", "active"],
    },
  },

  // ========== Effect Management (CORRECTED - uses virtuals) ==========
  {
    name: "ledfx_set_effect",
    description: "Set an effect on a virtual (NOT a device). Effects control how LEDs display.",
    inputSchema: {
      type: "object",
      properties: {
        virtual_id: {
          type: "string",
          description: "The unique identifier of the virtual",
        },
        effect_type: {
          type: "string",
          description: "Effect type: rainbow, pulse, wavelength, energy, singleColor, gradient, scroll, strobe, etc.",
        },
        config: {
          type: "object",
          description: "Effect configuration (speed, color, brightness, etc.)",
          additionalProperties: true,
        },
      },
      required: ["virtual_id", "effect_type"],
    },
  },
  {
    name: "ledfx_update_effect",
    description: "Update the configuration of the currently running effect on a virtual",
    inputSchema: {
      type: "object",
      properties: {
        virtual_id: {
          type: "string",
          description: "The unique identifier of the virtual",
        },
        config: {
          type: "object",
          description: "New configuration parameters",
          additionalProperties: true,
        },
      },
      required: ["virtual_id", "config"],
    },
  },
  {
    name: "ledfx_clear_effect",
    description: "Clear/stop the current effect on a virtual",
    inputSchema: {
      type: "object",
      properties: {
        virtual_id: {
          type: "string",
          description: "The unique identifier of the virtual",
        },
      },
      required: ["virtual_id"],
    },
  },
  {
    name: "ledfx_get_effect_schemas",
    description: "Get schemas for all available effect types with their parameters",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },

  // ========== Preset Management ==========
  {
    name: "ledfx_get_presets",
    description: "Get available presets for a virtual's current effect",
    inputSchema: {
      type: "object",
      properties: {
        virtual_id: {
          type: "string",
          description: "The unique identifier of the virtual",
        },
      },
      required: ["virtual_id"],
    },
  },
  {
    name: "ledfx_apply_preset",
    description: "Apply a preset to a virtual",
    inputSchema: {
      type: "object",
      properties: {
        virtual_id: {
          type: "string",
          description: "The unique identifier of the virtual",
        },
        category: {
          type: "string",
          description: "Preset category: 'ledfx_presets' or 'user_presets'",
          enum: ["ledfx_presets", "user_presets"],
        },
        effect_id: {
          type: "string",
          description: "The effect type",
        },
        preset_id: {
          type: "string",
          description: "The preset identifier",
        },
      },
      required: ["virtual_id", "category", "effect_id", "preset_id"],
    },
  },

  // ========== Scene Management (CORRECTED) ==========
  {
    name: "ledfx_list_scenes",
    description: "List all saved scenes. Scenes are complete lighting configurations.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_activate_scene",
    description: "Activate a saved scene by ID",
    inputSchema: {
      type: "object",
      properties: {
        scene_id: {
          type: "string",
          description: "The unique identifier of the scene",
        },
      },
      required: ["scene_id"],
    },
  },
  {
    name: "ledfx_create_scene",
    description: "Create a new scene from current virtual configurations",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name for the new scene",
        },
        tags: {
          type: "string",
          description: "Optional comma-separated tags (e.g., 'party,energetic')",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "ledfx_delete_scene",
    description: "Delete a saved scene",
    inputSchema: {
      type: "object",
      properties: {
        scene_id: {
          type: "string",
          description: "The unique identifier of the scene",
        },
      },
      required: ["scene_id"],
    },
  },

  // ========== AI-Powered Scene Creation ==========
  {
    name: "ledfx_create_scene_from_description",
    description: "Create a scene from a natural language description (e.g., 'calm blue ocean waves' or 'energetic party rainbow')",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "Natural language description of the desired scene",
        },
        virtual_ids: {
          type: "array",
          items: { type: "string" },
          description: "Optional list of virtual IDs to apply effects to. If not provided, uses all active virtuals.",
        },
      },
      required: ["description"],
    },
  },

  // ========== Palette Management (SQLite-backed) ==========
  {
    name: "ledfx_list_palettes",
    description: "List all saved color palettes (stored locally in SQLite)",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category filter",
        },
      },
      required: [],
    },
  },
  {
    name: "ledfx_create_palette",
    description: "Create a new color palette",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name for the palette",
        },
        colors: {
          type: "array",
          items: { type: "string" },
          description: "Array of hex color codes",
        },
        category: {
          type: "string",
          description: "Optional category (e.g., 'nature', 'tech', 'pastel')",
        },
        description: {
          type: "string",
          description: "Optional description",
        },
      },
      required: ["name", "colors"],
    },
  },
  {
    name: "ledfx_get_palette",
    description: "Get a specific palette by name or ID",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description: "Palette name or ID",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: "ledfx_delete_palette",
    description: "Delete a palette",
    inputSchema: {
      type: "object",
      properties: {
        palette_id: {
          type: "number",
          description: "Palette ID",
        },
      },
      required: ["palette_id"],
    },
  },

  // ========== Playlist Management ==========
  {
    name: "ledfx_list_playlists",
    description: "List all saved playlists (sequences of scenes)",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_create_playlist",
    description: "Create a new playlist of scenes",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name for the playlist",
        },
        scene_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of scene IDs in playback order",
        },
        transition_time: {
          type: "number",
          description: "Seconds to display each scene (default: 5)",
        },
        loop: {
          type: "boolean",
          description: "Whether to loop the playlist (default: true)",
        },
        description: {
          type: "string",
          description: "Optional description",
        },
      },
      required: ["name", "scene_ids"],
    },
  },
  {
    name: "ledfx_get_playlist",
    description: "Get a specific playlist",
    inputSchema: {
      type: "object",
      properties: {
        playlist_id: {
          type: "number",
          description: "Playlist ID",
        },
      },
      required: ["playlist_id"],
    },
  },
  {
    name: "ledfx_delete_playlist",
    description: "Delete a playlist",
    inputSchema: {
      type: "object",
      properties: {
        playlist_id: {
          type: "number",
          description: "Playlist ID",
        },
      },
      required: ["playlist_id"],
    },
  },

  // ========== Color Library ==========
  {
    name: "ledfx_list_colors",
    description: "List all named colors in the library with hex codes",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category filter (basic, extended, vivid, pastel, neon)",
        },
      },
      required: [],
    },
  },
  {
    name: "ledfx_find_color",
    description: "Find a color by name",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Color name (e.g., 'crimson', 'ocean-blue')",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "ledfx_list_gradients",
    description: "List all predefined gradients",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Optional category filter (classic, nature, energy, cool, cosmic, sweet, tech)",
        },
      },
      required: [],
    },
  },
  {
    name: "ledfx_find_gradient",
    description: "Find a gradient by name",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Gradient name (e.g., 'sunset', 'ocean', 'fire')",
        },
      },
      required: ["name"],
    },
  },

  // ========== Effect Recommendations ==========
  {
    name: "ledfx_recommend_effects",
    description: "Get effect recommendations based on description or mood",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "Description of desired mood or scene",
        },
        mood: {
          type: "string",
          description: "Mood keyword (party, chill, focus, romantic)",
        },
      },
      required: ["description"],
    },
  },

  // ========== Feature Explanations ==========
  {
    name: "ledfx_explain_feature",
    description: "Get detailed explanation of a LedFX feature or concept",
    inputSchema: {
      type: "object",
      properties: {
        feature: {
          type: "string",
          description: "Feature name (e.g., 'virtuals', 'effects', 'audio-reactive', 'wled')",
        },
      },
      required: ["feature"],
    },
  },
  {
    name: "ledfx_list_features",
    description: "List all explainable LedFX features organized by category",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_list_effect_types",
    description: "List all available effect types with descriptions",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },

  // ========== Audio Management ==========
  {
    name: "ledfx_list_audio_devices",
    description: "List available audio input devices",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_set_audio_device",
    description: "Set the active audio input device",
    inputSchema: {
      type: "object",
      properties: {
        device_index: {
          type: "number",
          description: "Audio device index",
        },
      },
      required: ["device_index"],
    },
  },
];

/**
 * Get the LedFX client instance from global context
 */
function getClient(): LedFxClient {
  const client = (global as any).ledfxClient;
  if (!client) {
    throw new Error("LedFX client not initialized");
  }
  return client;
}

/**
 * Format response data
 */
function formatResponse(data: any): { content: Array<{ type: string; text: string }> } {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Handle tool execution
 */
export async function handleToolCall(
  name: string,
  args: Record<string, any>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const client = getClient();
  const db = getDatabase();

  try {
    switch (name) {
      // ========== Server Info ==========
      case "ledfx_get_info": {
        const info = await client.getInfo();
        return formatResponse(info);
      }

      // ========== Devices ==========
      case "ledfx_list_devices": {
        const devices = await client.getDevices();
        return formatResponse(devices);
      }

      case "ledfx_get_device": {
        const device = await client.getDevice(args.device_id);
        return formatResponse(device);
      }

      // ========== Virtuals ==========
      case "ledfx_list_virtuals": {
        const virtuals = await client.getVirtuals();
        return formatResponse(virtuals);
      }

      case "ledfx_get_virtual": {
        const virtual = await client.getVirtual(args.virtual_id);
        return formatResponse(virtual);
      }

      case "ledfx_activate_virtual": {
        await client.setVirtualActive(args.virtual_id, args.active);
        return formatResponse({
          success: true,
          message: `Virtual '${args.virtual_id}' ${args.active ? "activated" : "deactivated"}`,
        });
      }

      // ========== Effects ==========
      case "ledfx_set_effect": {
        await client.setVirtualEffect(
          args.virtual_id,
          args.effect_type,
          args.config || {}
        );
        return formatResponse({
          success: true,
          message: `Effect '${args.effect_type}' set on virtual '${args.virtual_id}'`,
        });
      }

      case "ledfx_update_effect": {
        await client.updateVirtualEffect(args.virtual_id, args.config);
        return formatResponse({
          success: true,
          message: `Effect updated on virtual '${args.virtual_id}'`,
        });
      }

      case "ledfx_clear_effect": {
        await client.clearVirtualEffect(args.virtual_id);
        return formatResponse({
          success: true,
          message: `Effect cleared on virtual '${args.virtual_id}'`,
        });
      }

      case "ledfx_get_effect_schemas": {
        const schemas = await client.getEffectSchemas();
        return formatResponse(schemas);
      }

      // ========== Presets ==========
      case "ledfx_get_presets": {
        const presets = await client.getVirtualPresets(args.virtual_id);
        return formatResponse(presets);
      }

      case "ledfx_apply_preset": {
        await client.applyPreset(
          args.virtual_id,
          args.category,
          args.effect_id,
          args.preset_id
        );
        return formatResponse({
          success: true,
          message: `Preset '${args.preset_id}' applied to virtual '${args.virtual_id}'`,
        });
      }

      // ========== Scenes ==========
      case "ledfx_list_scenes": {
        const scenes = await client.getScenes();
        return formatResponse(scenes);
      }

      case "ledfx_activate_scene": {
        await client.activateScene(args.scene_id);
        return formatResponse({
          success: true,
          message: `Scene '${args.scene_id}' activated`,
        });
      }

      case "ledfx_create_scene": {
        await client.createScene(args.name, args.tags);
        return formatResponse({
          success: true,
          message: `Scene '${args.name}' created`,
        });
      }

      case "ledfx_delete_scene": {
        await client.deleteScene(args.scene_id);
        return formatResponse({
          success: true,
          message: `Scene '${args.scene_id}' deleted`,
        });
      }

      // ========== AI Scene Creation ==========
      case "ledfx_create_scene_from_description": {
        const parsed = parseSceneDescription(args.description);
        
        // Get target virtuals
        let targetVirtuals = args.virtual_ids;
        if (!targetVirtuals || targetVirtuals.length === 0) {
          const allVirtuals = await client.getVirtuals();
          targetVirtuals = allVirtuals.filter(v => v.active).map(v => v.id);
        }

        // Apply effects to virtuals
        const results = [];
        for (const virtualId of targetVirtuals) {
          if (parsed.virtuals.length > 0) {
            const effectConfig = parsed.virtuals[0];
            await client.setVirtualEffect(
              virtualId,
              effectConfig.effectType,
              effectConfig.config
            );
            results.push({ virtualId, effect: effectConfig });
          }
        }

        // Save as scene
        await client.createScene(parsed.sceneName, parsed.tags?.join(","));

        return formatResponse({
          success: true,
          sceneName: parsed.sceneName,
          parsed: parsed,
          appliedTo: results,
        });
      }

      // ========== Palettes ==========
      case "ledfx_list_palettes": {
        const palettes = args.category
          ? db.getPalettesByCategory(args.category)
          : db.getAllPalettes();
        return formatResponse(palettes);
      }

      case "ledfx_create_palette": {
        const id = db.createPalette({
          name: args.name,
          colors: JSON.stringify(args.colors),
          category: args.category,
          description: args.description,
        });
        return formatResponse({
          success: true,
          id,
          message: `Palette '${args.name}' created`,
        });
      }

      case "ledfx_get_palette": {
        const palette = isNaN(Number(args.identifier))
          ? db.getPaletteByName(args.identifier)
          : db.getPalette(Number(args.identifier));
        if (!palette) {
          return formatResponse({ error: "Palette not found" });
        }
        return formatResponse(palette);
      }

      case "ledfx_delete_palette": {
        db.deletePalette(args.palette_id);
        return formatResponse({
          success: true,
          message: `Palette deleted`,
        });
      }

      // ========== Playlists ==========
      case "ledfx_list_playlists": {
        const playlists = db.getAllPlaylists();
        return formatResponse(playlists);
      }

      case "ledfx_create_playlist": {
        const id = db.createPlaylist({
          name: args.name,
          scenes: JSON.stringify(args.scene_ids),
          transition_time: args.transition_time,
          loop: args.loop,
          description: args.description,
        });
        return formatResponse({
          success: true,
          id,
          message: `Playlist '${args.name}' created`,
        });
      }

      case "ledfx_get_playlist": {
        const playlist = db.getPlaylist(args.playlist_id);
        if (!playlist) {
          return formatResponse({ error: "Playlist not found" });
        }
        return formatResponse(playlist);
      }

      case "ledfx_delete_playlist": {
        db.deletePlaylist(args.playlist_id);
        return formatResponse({
          success: true,
          message: `Playlist deleted`,
        });
      }

      // ========== Colors ==========
      case "ledfx_list_colors": {
        const colors = args.category
          ? Object.values(NAMED_COLORS).filter(c => c.category === args.category)
          : Object.values(NAMED_COLORS);
        return formatResponse({ colors, categories: getColorCategories() });
      }

      case "ledfx_find_color": {
        const color = findColor(args.name);
        if (!color) {
          return formatResponse({ error: `Color '${args.name}' not found` });
        }
        return formatResponse(color);
      }

      case "ledfx_list_gradients": {
        const gradients = args.category
          ? Object.values(GRADIENTS).filter(g => g.category === args.category)
          : Object.values(GRADIENTS);
        return formatResponse({ gradients, categories: getGradientCategories() });
      }

      case "ledfx_find_gradient": {
        const gradient = findGradient(args.name);
        if (!gradient) {
          return formatResponse({ error: `Gradient '${args.name}' not found` });
        }
        return formatResponse(gradient);
      }

      // ========== Recommendations ==========
      case "ledfx_recommend_effects": {
        const recommendations = recommendEffects(args.description, args.mood);
        return formatResponse(recommendations);
      }

      // ========== Explanations ==========
      case "ledfx_explain_feature": {
        const explanation = explainFeature(args.feature);
        return formatResponse({ feature: args.feature, explanation });
      }

      case "ledfx_list_features": {
        const features = getFeatureCategories();
        return formatResponse(features);
      }

      case "ledfx_list_effect_types": {
        return formatResponse(EFFECT_TYPES);
      }

      // ========== Audio ==========
      case "ledfx_list_audio_devices": {
        const devices = await client.getAudioDevices();
        return formatResponse(devices);
      }

      case "ledfx_set_audio_device": {
        await client.setAudioDevice(args.device_index);
        return formatResponse({
          success: true,
          message: `Audio device set to index ${args.device_index}`,
        });
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return formatResponse({
      error: true,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
