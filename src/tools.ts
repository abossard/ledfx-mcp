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
import { parseSceneDescription, recommendEffects, explainFeature, getFeatureCategories } from "./ai-helper.js";
import logger from "./logger.js";

// ========== Effect Types for Theme Application ==========
const THEME_EFFECT_TYPES = [
  "energy",
  "wavelength",
  "pulse",
  "scroll",
  "strobe",
  "real_strobe",
  "singleColor",
  "gradient",
  "blade_power_plus",
];

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
  {
    name: "ledfx_save_preset",
    description: "Save the current effect configuration on a virtual as a user preset",
    inputSchema: {
      type: "object",
      properties: {
        virtual_id: {
          type: "string",
          description: "The unique identifier of the virtual",
        },
        preset_name: {
          type: "string",
          description: "Name for the new preset",
        },
      },
      required: ["virtual_id", "preset_name"],
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

  // ========== Playlist Management (LedFX Native) ==========
  {
    name: "ledfx_list_playlists",
    description: "List all playlists stored in LedFX",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_get_playlist",
    description: "Get a specific LedFX playlist by ID",
    inputSchema: {
      type: "object",
      properties: {
        playlist_id: {
          type: "string",
          description: "Playlist ID (e.g., 'jungle', 'standby')",
        },
      },
      required: ["playlist_id"],
    },
  },
  {
    name: "ledfx_start_playlist",
    description: "Start playing a LedFX playlist",
    inputSchema: {
      type: "object",
      properties: {
        playlist_id: {
          type: "string",
          description: "Playlist ID to start",
        },
      },
      required: ["playlist_id"],
    },
  },
  {
    name: "ledfx_stop_playlist",
    description: "Stop the currently playing LedFX playlist",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_get_playlist_status",
    description: "Get the status of the currently playing LedFX playlist",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_create_playlist",
    description: "Create a new LedFX playlist with scenes",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unique playlist ID (lowercase, no spaces)",
        },
        name: {
          type: "string",
          description: "Display name for the playlist",
        },
        scene_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of scene IDs to include in the playlist",
        },
        mode: {
          type: "string",
          enum: ["sequence", "shuffle"],
          description: "Playback mode: 'sequence' or 'shuffle' (default: sequence)",
        },
        duration_ms: {
          type: "number",
          description: "Duration per scene in milliseconds (default: 15000)",
        },
      },
      required: ["id", "name", "scene_ids"],
    },
  },
  {
    name: "ledfx_update_playlist",
    description: "Update an existing LedFX playlist",
    inputSchema: {
      type: "object",
      properties: {
        playlist_id: {
          type: "string",
          description: "Playlist ID to update",
        },
        name: {
          type: "string",
          description: "New display name",
        },
        scene_ids: {
          type: "array",
          items: { type: "string" },
          description: "New array of scene IDs",
        },
        mode: {
          type: "string",
          enum: ["sequence", "shuffle"],
          description: "Playback mode",
        },
        duration_ms: {
          type: "number",
          description: "Duration per scene in milliseconds",
        },
      },
      required: ["playlist_id"],
    },
  },
  {
    name: "ledfx_delete_playlist",
    description: "Delete a LedFX playlist",
    inputSchema: {
      type: "object",
      properties: {
        playlist_id: {
          type: "string",
          description: "Playlist ID to delete",
        },
      },
      required: ["playlist_id"],
    },
  },
  {
    name: "ledfx_add_scene_to_playlist",
    description: "Add a scene to an existing playlist",
    inputSchema: {
      type: "object",
      properties: {
        playlist_id: {
          type: "string",
          description: "Playlist ID",
        },
        scene_id: {
          type: "string",
          description: "Scene ID to add",
        },
        duration_ms: {
          type: "number",
          description: "Duration for this scene in milliseconds (optional)",
        },
      },
      required: ["playlist_id", "scene_id"],
    },
  },

  // ========== Batch Operations ==========
  {
    name: "ledfx_create_theme",
    description: "Create a color theme that can be applied across multiple effects at once. Stores colors for lows/mids/highs and optional custom gradient.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Theme name",
        },
        color_lows: {
          type: "string",
          description: "Hex color for bass/low frequencies",
        },
        color_mids: {
          type: "string",
          description: "Hex color for mid frequencies",
        },
        color_high: {
          type: "string",
          description: "Hex color for high frequencies",
        },
        background_color: {
          type: "string",
          description: "Background color",
        },
        gradient: {
          type: "string",
          description: "Custom CSS gradient string (e.g., 'linear-gradient(90deg, #9900FF 0%, #00AA00 15%, #00AA00 85%, #FFFF00 100%)'). If not provided, auto-generated from colors.",
        },
        description: {
          type: "string",
          description: "Optional description",
        },
      },
      required: ["name", "color_lows", "color_mids", "color_high"],
    },
  },
  {
    name: "ledfx_apply_theme",
    description: "Apply a theme to create presets for ALL effect types and optionally create scenes for each",
    inputSchema: {
      type: "object",
      properties: {
        theme_name: {
          type: "string",
          description: "Name of theme to apply",
        },
        virtual_id: {
          type: "string",
          description: "Virtual to use for creating presets",
        },
        create_scenes: {
          type: "boolean",
          description: "Also create scenes for each effect (default: true)",
        },
      },
      required: ["theme_name", "virtual_id"],
    },
  },
  {
    name: "ledfx_list_themes",
    description: "List all saved color themes",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
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
  const startTime = Date.now();

  // Log incoming tool call
  logger.toolCall(name, args);

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

      case "ledfx_save_preset": {
        await client.savePreset(args.virtual_id, args.preset_name);
        return formatResponse({
          success: true,
          message: `Preset '${args.preset_name}' saved for virtual '${args.virtual_id}'`,
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

      // ========== Playlists (LedFX Native) ==========
      case "ledfx_list_playlists": {
        const playlists = await client.getPlaylists();
        return formatResponse(playlists);
      }

      case "ledfx_get_playlist": {
        const playlist = await client.getPlaylist(args.playlist_id);
        return formatResponse(playlist);
      }

      case "ledfx_start_playlist": {
        await client.startPlaylist(args.playlist_id);
        return formatResponse({
          success: true,
          message: `Playlist '${args.playlist_id}' started`,
        });
      }

      case "ledfx_stop_playlist": {
        await client.stopPlaylist();
        return formatResponse({
          success: true,
          message: "Playlist stopped",
        });
      }

      case "ledfx_get_playlist_status": {
        const status = await client.getPlaylistStatus();
        return formatResponse(status);
      }

      case "ledfx_create_playlist": {
        const items = (args.scene_ids as string[]).map((sceneId: string) => ({
          scene_id: sceneId,
          duration_ms: args.duration_ms || 15000,
        }));
        const playlist = await client.createPlaylist(
          args.id,
          args.name,
          items,
          {
            mode: args.mode || "sequence",
            default_duration_ms: args.duration_ms || 15000,
          }
        );
        return formatResponse({
          success: true,
          message: `Playlist '${args.name}' created`,
          playlist,
        });
      }

      case "ledfx_update_playlist": {
        const updates: Record<string, any> = {};
        if (args.name) updates.name = args.name;
        if (args.mode) updates.mode = args.mode;
        if (args.duration_ms) updates.default_duration_ms = args.duration_ms;
        if (args.scene_ids) {
          updates.items = (args.scene_ids as string[]).map((sceneId: string) => ({
            scene_id: sceneId,
            duration_ms: args.duration_ms || 15000,
          }));
        }
        await client.updatePlaylist(args.playlist_id, updates);
        return formatResponse({
          success: true,
          message: `Playlist '${args.playlist_id}' updated`,
        });
      }

      case "ledfx_delete_playlist": {
        await client.deletePlaylist(args.playlist_id);
        return formatResponse({
          success: true,
          message: `Playlist '${args.playlist_id}' deleted`,
        });
      }

      case "ledfx_add_scene_to_playlist": {
        await client.addSceneToPlaylist(
          args.playlist_id,
          args.scene_id,
          args.duration_ms
        );
        return formatResponse({
          success: true,
          message: `Scene '${args.scene_id}' added to playlist '${args.playlist_id}'`,
        });
      }

      // ========== Themes ==========
      case "ledfx_create_theme": {
        const id = db.createTheme({
          name: args.name,
          color_lows: args.color_lows,
          color_mids: args.color_mids,
          color_high: args.color_high,
          background_color: args.background_color || "#000000",
          gradient: args.gradient,
          description: args.description,
        });
        return formatResponse({
          success: true,
          id,
          message: `Theme '${args.name}' created`,
        });
      }

      case "ledfx_list_themes": {
        const themes = db.getAllThemes();
        return formatResponse(themes);
      }

      case "ledfx_apply_theme": {
        const theme = db.getThemeByName(args.theme_name);
        if (!theme) {
          return formatResponse({ error: `Theme '${args.theme_name}' not found` });
        }

        const virtualId = args.virtual_id;
        const createScenes = args.create_scenes !== false;
        const createdScenes: string[] = [];

        // Use custom gradient if provided, otherwise build from theme colors
        const gradient = theme.gradient || `linear-gradient(90deg, ${theme.color_lows} 0%, ${theme.color_mids} 50%, ${theme.color_high} 100%)`;

        // Apply theme to each effect type and save preset
        for (const effectType of THEME_EFFECT_TYPES) {
          let config: Record<string, any> = {
            background_color: theme.background_color,
            blur: 1.5,
            mirror: true,
          };

          // Effect-specific config
          if (effectType === "energy" || effectType === "wavelength") {
            config = {
              ...config,
              color_lows: theme.color_lows,
              color_mids: theme.color_mids,
              color_high: theme.color_high,
              frequency_range: "Lows (beat+bass)",
              sensitivity: 0.8,
            };
          } else if (effectType === "pulse") {
            config = {
              ...config,
              color: theme.color_mids,
              decay: 0.5,
              sensitivity: 0.8,
            };
          } else if (effectType === "scroll" || effectType === "gradient") {
            config = {
              ...config,
              gradient,
              speed: 3,
            };
          } else if (effectType === "strobe" || effectType === "real_strobe") {
            config = {
              ...config,
              gradient,
              strobe_color: theme.color_high,
              strobe_decay_rate: 0.5,
            };
          } else if (effectType === "singleColor") {
            config = {
              ...config,
              color: theme.color_mids,
              modulate: true,
              modulation_effect: "sine",
              modulation_speed: 0.5,
            };
          } else if (effectType === "blade_power_plus") {
            config = {
              ...config,
              gradient,
              frequency_range: "Lows (beat+bass)",
              decay: 0.5,
              background_brightness: 0.5,
            };
          }

          // Set effect and save preset
          await client.setVirtualEffect(virtualId, effectType, config);
          await client.savePreset(virtualId, theme.name);

          // Create scene if requested
          if (createScenes) {
            const sceneName = `${theme.name}-${effectType}`;
            try {
              await client.createScene(sceneName, `${theme.name},${effectType}`);
              createdScenes.push(sceneName);
            } catch {
              // Scene might already exist, try to delete and recreate
              try {
                await client.deleteScene(sceneName);
                await client.createScene(sceneName, `${theme.name},${effectType}`);
                createdScenes.push(sceneName);
              } catch {
                // Ignore if scene operations fail
              }
            }
          }
        }

        return formatResponse({
          success: true,
          theme: theme.name,
          presetsCreated: THEME_EFFECT_TYPES.length,
          scenesCreated: createdScenes.length,
          scenes: createdScenes,
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
        // Dynamically fetch all effect types from LedFX API
        const effectSchemas = await client.getEffectSchemas();
        const effectTypes = Object.entries(effectSchemas).map(([id, data]: [string, any]) => ({
          id,
          name: data.name || id,
          category: data.category || "Unknown",
          description: data.schema?.properties?.gradient?.description || "",
        }));
        // Sort by category then name
        effectTypes.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        return formatResponse({
          count: effectTypes.length,
          effects: effectTypes,
        });
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
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.toolResult(name, false, durationMs, errorMessage);
    
    return formatResponse({
      error: true,
      message: errorMessage,
    });
  }
}
