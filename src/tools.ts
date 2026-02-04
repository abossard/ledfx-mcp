/**
 * Comprehensive MCP Tools for LedFX
 * 
 * Provides advanced features including:
 * - Virtual and device management
 * - Palette management (LedFX /api/colors)
 * - Natural language scene creation
 * - Effect recommendations
 * - LedFX feature explanations
 * - Playlist management
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { LedFxClient, LedFxBackup, RestoreOptions, LedFxColorsResponse, LedFxVirtual, LedFxSceneVirtual } from "./ledfx-client.js";
import { parseSceneDescription, recommendEffects, explainFeature, getFeatureCategories, LedFxColorCatalog } from "./ai-helper.js";
import logger from "./logger.js";
import * as fs from "fs";
import * as path from "path";

const PALETTE_PREFIX = "palette:";

function buildPaletteGradient(colors: string[]): string {
  const stops = colors.join(", ");
  return `linear-gradient(90deg, ${stops})`;
}

function buildColorCatalog(colorsResponse: LedFxColorsResponse): LedFxColorCatalog {
  return {
    colors: {
      ...colorsResponse.colors.builtin,
      ...colorsResponse.colors.user,
    },
    gradients: {
      ...colorsResponse.gradients.builtin,
      ...colorsResponse.gradients.user,
    },
  };
}

function getPaletteId(name: string): string {
  return `${PALETTE_PREFIX}${name}`;
}

function listPalettes(colorsResponse: LedFxColorsResponse): Array<{ id: string; name: string; gradient: string }> {
  const palettes: Array<{ id: string; name: string; gradient: string }> = [];
  for (const [id, gradient] of Object.entries(colorsResponse.gradients.user)) {
    if (id.startsWith(PALETTE_PREFIX)) {
      palettes.push({
        id,
        name: id.slice(PALETTE_PREFIX.length),
        gradient,
      });
    }
  }
  return palettes.sort((a, b) => a.name.localeCompare(b.name));
}

interface BlenderSourceInput {
  virtual_id: string;
  effect_type: string;
  effect_config?: Record<string, any>;
}

interface PaletteResolutionResult {
  config: Record<string, any>;
  errors: string[];
}

interface SceneVirtualSnapshot {
  type?: string;
  config?: Record<string, any>;
  action?: "activate" | "ignore" | "stop" | "forceblack";
}

// calculation: determine blender-related virtual IDs that must be active
function getBlenderActivationIds(virtuals: LedFxVirtual[]): string[] {
  const blenderVirtual = virtuals.find(
    virtual => virtual.effect?.type?.toLowerCase() === "blender"
  );
  if (!blenderVirtual || !blenderVirtual.effect?.config) {
    return [];
  }

  const config = blenderVirtual.effect.config as Record<string, unknown>;
  const ids = [
    blenderVirtual.id,
    config.background,
    config.foreground,
    config.mask,
  ].filter((id): id is string => typeof id === "string" && id.length > 0);

  return Array.from(new Set(ids));
}

// calculation: build explicit per-virtual scene payload with activate actions for active virtuals
function buildSceneVirtualsPayload(virtuals: LedFxVirtual[]): Record<string, LedFxSceneVirtual> {
  const payload: Record<string, LedFxSceneVirtual> = {};
  for (const virtual of virtuals) {
    if (!virtual.effect || !virtual.effect.type) continue;
    payload[virtual.id] = {
      type: virtual.effect.type,
      config: virtual.effect.config || {},
      ...(virtual.active ? { action: "activate" } : {}),
    };
  }
  return payload;
}

// calculation: determine whether a scene uses a blender virtual
function isBlenderScene(virtuals: Record<string, SceneVirtualSnapshot> | undefined): boolean {
  if (!virtuals) return false;
  return Object.values(virtuals).some(virtual =>
    (virtual.type || "").toLowerCase() === "blender"
  );
}

// calculation: build per-virtual scene payload from an existing scene snapshot
function buildSceneVirtualsFromSnapshot(
  virtuals: Record<string, SceneVirtualSnapshot>
): Record<string, LedFxSceneVirtual> {
  const payload: Record<string, LedFxSceneVirtual> = {};
  for (const [virtualId, snapshot] of Object.entries(virtuals)) {
    const type = snapshot.type || "";
    const config = snapshot.config || {};
    if (!type) {
      payload[virtualId] = {
        type: "",
        config: {},
        action: snapshot.action || "ignore",
      };
      continue;
    }
    payload[virtualId] = {
      type,
      config,
      ...(snapshot.action ? { action: snapshot.action } : {}),
    };
  }
  return payload;
}

function resolvePaletteGradient(
  paletteId: string,
  colorsResponse: LedFxColorsResponse
): string | null {
  return (
    colorsResponse.gradients.user[paletteId] ??
    colorsResponse.gradients.builtin[paletteId] ??
    null
  );
}

function resolvePalettesInConfig(
  config: Record<string, any>,
  colorsResponse: LedFxColorsResponse
): PaletteResolutionResult {
  const errors: string[] = [];
  const nextConfig = { ...config };

  if (typeof nextConfig.gradient === "string" && nextConfig.gradient.startsWith(PALETTE_PREFIX)) {
    const resolved = resolvePaletteGradient(nextConfig.gradient, colorsResponse);
    if (!resolved) {
      errors.push(`Unknown gradient palette '${nextConfig.gradient}'.`);
    } else {
      nextConfig.gradient = resolved;
    }
  }

  return { config: nextConfig, errors };
}

function ensureEffectConfig(value: unknown): Record<string, any> | null {
  if (value === undefined) return {};
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, any>;
}


// action: verifies LedFX applied the expected effect type to a virtual
async function waitForEffectApplied(
  client: LedFxClient,
  virtualId: string,
  expectedEffectType: string,
  attempts = 3,
  delayMs = 150
): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const virtual = await client.getVirtual(virtualId);
    const applied = virtual.effect?.type;
    if (applied && applied.toLowerCase() === expectedEffectType.toLowerCase()) {
      return true;
    }
    if (attempt < attempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return false;
}

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
    description: "Set an effect on a virtual (NOT a device). Effects control how LEDs display. Use ledfx_set_blender for blender.",
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
        effect_config: {
          type: "object",
          description: "Effect configuration (speed, color, brightness, etc.)",
          additionalProperties: true,
        },
      },
      required: ["virtual_id", "effect_type"],
    },
  },
  {
    name: "ledfx_set_blender",
    description: "Safely set a blender effect by configuring source virtuals first. Blender mixes background + foreground using a mask; mask should be audio reactive, and at least one of background/foreground should be audio reactive. Static colors are rarely useful.",
    inputSchema: {
      type: "object",
      properties: {
        blender_virtual_id: {
          type: "string",
          description: "The blender virtual id (typically 3linematrix)",
        },
        background: {
          type: "object",
          description: "Background source configuration (base layer). Prefer audio-reactive effects; static colors are rarely useful.",
          properties: {
            virtual_id: { type: "string" },
            effect_type: { type: "string" },
            effect_config: { type: "object", additionalProperties: true },
          },
          required: ["virtual_id", "effect_type"],
        },
        foreground: {
          type: "object",
          description: "Foreground source configuration (top layer). Prefer audio-reactive effects; static colors are rarely useful.",
          properties: {
            virtual_id: { type: "string" },
            effect_type: { type: "string" },
            effect_config: { type: "object", additionalProperties: true },
          },
          required: ["virtual_id", "effect_type"],
        },
        mask: {
          type: "object",
          description: "Mask source configuration (controls reveal/occlusion). Should be audio reactive for meaningful blending.",
          properties: {
            virtual_id: { type: "string" },
            effect_type: { type: "string" },
            effect_config: { type: "object", additionalProperties: true },
          },
          required: ["virtual_id", "effect_type"],
        },
        blender_config: {
          type: "object",
          description: "Additional blender configuration (stretch, cutoff, invert, brightness)",
          additionalProperties: true,
        },
      },
      required: ["blender_virtual_id", "background", "foreground", "mask"],
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
  {
    name: "ledfx_get_effect_schema",
    description: "Get the schema for a single effect type",
    inputSchema: {
      type: "object",
      properties: {
        effect_type: {
          type: "string",
          description: "Effect type id (e.g., blender, wavelength, energy)",
        },
      },
      required: ["effect_type"],
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
    name: "ledfx_refresh_blender_scenes",
    description: "Recreate all blender scenes using their stored virtual configurations (no scene activation)",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
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

  // ========== Color Management (LedFX /api/colors) ==========
  {
    name: "ledfx_list_colors",
    description: "List all colors and gradients from LedFX /api/colors. Returns LedFX native response types.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_get_color_or_gradient",
    description: "Get a single color or gradient by ID from LedFX /api/colors.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Color or gradient ID (LedFX name key)",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "ledfx_upsert_color_or_gradient",
    description: "Create or update a user-defined color or gradient in LedFX /api/colors.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["color", "gradient"],
          description: "Whether this value is a color or gradient",
        },
        id: {
          type: "string",
          description: "Color or gradient ID (LedFX name key)",
        },
        value: {
          type: "string",
          description: "LedFX color string (#RRGGBB) or gradient string (CSS linear-gradient)",
        },
      },
      required: ["type", "id", "value"],
    },
  },
  {
    name: "ledfx_delete_color_or_gradient",
    description: "Delete a user-defined color or gradient by ID in LedFX /api/colors.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Color or gradient ID (LedFX name key)",
        },
      },
      required: ["id"],
    },
  },

  // ========== Palette Management (LedFX /api/colors) ==========
  {
    name: "ledfx_list_palettes",
    description: "List all palettes stored as user gradients in LedFX /api/colors.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_create_palette",
    description: "Create or update a palette by saving a user gradient in LedFX /api/colors.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Palette name (stored as 'palette:<name>' in LedFX)",
        },
        colors: {
          type: "array",
          items: { type: "string" },
          description: "Array of LedFX color strings (#RRGGBB)",
        },
      },
      required: ["name", "colors"],
    },
  },
  {
    name: "ledfx_get_palette",
    description: "Get a palette by name (stored as a user gradient in LedFX /api/colors).",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Palette name (without the 'palette:' prefix)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "ledfx_delete_palette",
    description: "Delete a palette by name (removes the user gradient from LedFX /api/colors).",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Palette name (without the 'palette:' prefix)",
        },
      },
      required: ["name"],
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

  // ========== Backup/Restore ==========
  {
    name: "ledfx_create_backup",
    description: "Create a complete backup of LedFX configuration (virtuals, scenes, playlists, audio). Optionally saves to a local file path.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Local file path to save the backup (e.g., '/Users/me/backups/ledfx-backup.json'). If not provided, returns backup in response.",
        },
        description: {
          type: "string",
          description: "Optional description for the backup (e.g., 'Before major changes', 'DJ setup v2')",
        },
      },
      required: [],
    },
  },
  {
    name: "ledfx_restore_backup",
    description: "Restore LedFX configuration from a backup JSON. Can selectively restore virtuals, scenes, and/or playlists.",
    inputSchema: {
      type: "object",
      properties: {
        backup: {
          type: "object",
          description: "The backup object to restore (from ledfx_create_backup)",
        },
        restore_virtuals: {
          type: "boolean",
          description: "Restore virtual effects (default: true)",
        },
        restore_scenes: {
          type: "boolean",
          description: "Restore scenes (default: true)",
        },
        restore_playlists: {
          type: "boolean",
          description: "Restore playlists (default: true)",
        },
        restore_audio: {
          type: "boolean",
          description: "Restore audio device setting (default: false)",
        },
        clear_existing: {
          type: "boolean",
          description: "Delete all existing scenes/playlists before restoring (default: false)",
        },
        dry_run: {
          type: "boolean",
          description: "Simulate restore without making changes (default: false)",
        },
      },
      required: ["backup"],
    },
  },
  {
    name: "ledfx_validate_backup",
    description: "Validate a backup JSON structure without restoring it",
    inputSchema: {
      type: "object",
      properties: {
        backup: {
          type: "object",
          description: "The backup object to validate",
        },
      },
      required: ["backup"],
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
        if (args.active) {
          const virtual = await client.getVirtual(args.virtual_id);
          if (!virtual.effect || !virtual.effect.type) {
            return formatResponse({
              error: `Virtual '${args.virtual_id}' has no effect. Set an effect before activation.`,
            });
          }
        }
        await client.setVirtualActive(args.virtual_id, args.active);
        return formatResponse({
          success: true,
          message: `Virtual '${args.virtual_id}' ${args.active ? "activated" : "deactivated"}`,
        });
      }

      // ========== Effects ==========
      case "ledfx_set_effect": {
        if (args.effect_type === "blender") {
          return formatResponse({
            error: "Blender must be set using ledfx_set_blender.",
          });
        }

        const effectConfig = ensureEffectConfig(args.effect_config);
        if (!effectConfig) {
          return formatResponse({
            error: "effect_config must be an object.",
          });
        }

        const colorsResponse = await client.getColors();
        const resolved = resolvePalettesInConfig(effectConfig, colorsResponse);
        if (resolved.errors.length > 0) {
          return formatResponse({ error: resolved.errors.join(" ") });
        }

        await client.setVirtualEffect(args.virtual_id, args.effect_type, resolved.config);
        const applied = await waitForEffectApplied(
          client,
          args.virtual_id,
          args.effect_type
        );
        if (!applied) {
          return formatResponse({
            error: `LedFX did not apply '${args.effect_type}' to '${args.virtual_id}'.`,
          });
        }
        return formatResponse({
          success: true,
          message: `Effect '${args.effect_type}' set on virtual '${args.virtual_id}'`,
        });
      }

      case "ledfx_set_blender": {
        const background = args.background as BlenderSourceInput;
        const foreground = args.foreground as BlenderSourceInput;
        const mask = args.mask as BlenderSourceInput;
        const sources = [background, foreground, mask];

        for (const source of sources) {
          if (!source.virtual_id || !source.effect_type) {
            return formatResponse({
              error: "Each blender source must include virtual_id and effect_type.",
            });
          }
          if (source.effect_type === "blender") {
            return formatResponse({
              error: "Blender sources cannot use the blender effect.",
            });
          }
        }

        const colorsResponse = await client.getColors();

        for (const source of sources) {
          const effectConfig = ensureEffectConfig(source.effect_config);
          if (!effectConfig) {
            return formatResponse({
              error: `effect_config must be an object for source '${source.virtual_id}'.`,
            });
          }
          const resolved = resolvePalettesInConfig(effectConfig, colorsResponse);
          if (resolved.errors.length > 0) {
            return formatResponse({ error: resolved.errors.join(" ") });
          }

          await client.setVirtualEffect(
            source.virtual_id,
            source.effect_type,
            resolved.config
          );
          await client.setVirtualActive(source.virtual_id, true);

          const applied = await waitForEffectApplied(
            client,
            source.virtual_id,
            source.effect_type
          );
          if (!applied) {
            return formatResponse({
              error: `LedFX did not apply '${source.effect_type}' to '${source.virtual_id}'.`,
            });
          }
        }

        const blenderConfig = {
          background: background.virtual_id,
          foreground: foreground.virtual_id,
          mask: mask.virtual_id,
          ...(args.blender_config || {}),
        } as Record<string, any>;

        await client.setVirtualEffect(args.blender_virtual_id, "blender", blenderConfig);
        const blenderApplied = await waitForEffectApplied(
          client,
          args.blender_virtual_id,
          "blender"
        );
        if (!blenderApplied) {
          return formatResponse({
            error: `LedFX did not apply 'blender' to '${args.blender_virtual_id}'.`,
          });
        }
        return formatResponse({
          success: true,
          message: `Blender set on virtual '${args.blender_virtual_id}'`,
          sources: {
            background: background.virtual_id,
            foreground: foreground.virtual_id,
            mask: mask.virtual_id,
          },
        });
      }

      case "ledfx_update_effect": {
        const effectConfig = ensureEffectConfig(args.config);
        if (!effectConfig) {
          return formatResponse({
            error: "config must be an object.",
          });
        }

        const colorsResponse = await client.getColors();
        const resolved = resolvePalettesInConfig(effectConfig, colorsResponse);
        if (resolved.errors.length > 0) {
          return formatResponse({ error: resolved.errors.join(" ") });
        }

        await client.updateVirtualEffect(args.virtual_id, resolved.config);
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

      case "ledfx_get_effect_schema": {
        const schemas = await client.getEffectSchemas();
        const effectType = String(args.effect_type);
        const schema = schemas[effectType];
        if (!schema) {
          return formatResponse({
            error: `Effect schema '${effectType}' not found`,
          });
        }
        return formatResponse(schema);
      }

      // ========== Presets ==========
      case "ledfx_get_presets": {
        const presets = await client.getVirtualPresets(args.virtual_id);
        return formatResponse(presets);
      }

      case "ledfx_apply_preset": {
        const presets = await client.getVirtualPresets(args.virtual_id);
        const category = args.category as "ledfx_presets" | "user_presets";
        const effectId = String(args.effect_id);
        const presetId = String(args.preset_id);
        const effectPresets = presets[category]?.[effectId];
        if (!effectPresets || !(presetId in effectPresets)) {
          return formatResponse({
            error: `Preset '${presetId}' not found for effect '${effectId}' in ${category}.`,
          });
        }
        await client.applyPreset(
          args.virtual_id,
          args.category,
          effectId,
          presetId
        );
        return formatResponse({
          success: true,
          message: `Preset '${presetId}' applied to virtual '${args.virtual_id}'`,
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
        const virtuals = await client.getVirtuals();
        const blenderActivationIds = getBlenderActivationIds(virtuals);
        if (blenderActivationIds.length > 0) {
          for (const virtualId of blenderActivationIds) {
            await client.setVirtualActive(virtualId, true);
          }
        }
        const sceneVirtuals = buildSceneVirtualsPayload(virtuals);
        await client.createScene(args.name, args.tags, sceneVirtuals);
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

      case "ledfx_refresh_blender_scenes": {
        const scenes = await client.getScenes();
        const blenderScenes = scenes.filter(scene => isBlenderScene(scene.virtuals as Record<string, SceneVirtualSnapshot> | undefined));
        const results: Array<{ name: string; status: string; error?: string }> = [];

        for (const scene of blenderScenes) {
          try {
            const virtuals = buildSceneVirtualsFromSnapshot(scene.virtuals as Record<string, SceneVirtualSnapshot>);
            await client.deleteScene(scene.id);
            await client.createScene(scene.name, scene.scene_tags, virtuals);
            results.push({ name: scene.name, status: "updated" });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            results.push({ name: scene.name, status: "failed", error: errorMessage });
          }
        }

        return formatResponse({
          success: true,
          updated: results.filter(r => r.status === "updated").length,
          failed: results.filter(r => r.status === "failed").length,
          results,
        });
      }

      // ========== AI Scene Creation ==========
      case "ledfx_create_scene_from_description": {
        const colorsResponse = await client.getColors();
        const catalog = buildColorCatalog(colorsResponse);
        const parsed = parseSceneDescription(args.description, catalog);
        
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
            if (effectConfig.effectType === "blender") {
              return formatResponse({
                error: "Blender must be set using ledfx_set_blender.",
              });
            }
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

      // ========== Colors (LedFX /api/colors) ==========
      case "ledfx_list_colors": {
        const colors = await client.getColors();
        return formatResponse(colors);
      }

      case "ledfx_get_color_or_gradient": {
        const colors = await client.getColors();
        const id = args.id as string;

        const colorValue = colors.colors.user[id] ?? colors.colors.builtin[id];
        if (colorValue) {
          return formatResponse({
            id,
            type: "color",
            scope: colors.colors.user[id] ? "user" : "builtin",
            value: colorValue,
          });
        }

        const gradientValue = colors.gradients.user[id] ?? colors.gradients.builtin[id];
        if (gradientValue) {
          return formatResponse({
            id,
            type: "gradient",
            scope: colors.gradients.user[id] ? "user" : "builtin",
            value: gradientValue,
          });
        }

        return formatResponse({ error: `Color or gradient '${id}' not found` });
      }

      case "ledfx_upsert_color_or_gradient": {
        await client.upsertColors({
          [args.id]: args.value,
        });
        return formatResponse({
          success: true,
          type: args.type,
          message: `Color or gradient '${args.id}' upserted`,
        });
      }

      case "ledfx_delete_color_or_gradient": {
        await client.deleteColor(args.id);
        return formatResponse({
          success: true,
          message: `Color or gradient '${args.id}' deleted`,
        });
      }

      // ========== Palettes (LedFX /api/colors) ==========
      case "ledfx_list_palettes": {
        const colors = await client.getColors();
        return formatResponse({
          palettes: listPalettes(colors),
        });
      }

      case "ledfx_create_palette": {
        const paletteId = getPaletteId(args.name);
        const gradient = buildPaletteGradient(args.colors as string[]);
        await client.upsertColors({
          [paletteId]: gradient,
        });
        return formatResponse({
          success: true,
          id: paletteId,
          name: args.name,
          gradient,
        });
      }

      case "ledfx_get_palette": {
        const colors = await client.getColors();
        const paletteId = getPaletteId(args.name);
        const gradient = colors.gradients.user[paletteId];
        if (!gradient) {
          return formatResponse({ error: `Palette '${args.name}' not found` });
        }
        return formatResponse({
          id: paletteId,
          name: args.name,
          gradient,
        });
      }

      case "ledfx_delete_palette": {
        const paletteId = getPaletteId(args.name);
        await client.deleteColor(paletteId);
        return formatResponse({
          success: true,
          message: `Palette '${args.name}' deleted`,
        });
      }

      // ========== Recommendations ==========
      case "ledfx_recommend_effects": {
        const colorsResponse = await client.getColors();
        const catalog = buildColorCatalog(colorsResponse);
        const recommendations = recommendEffects(args.description, args.mood, catalog);
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

      // ========== Backup/Restore ==========
      case "ledfx_create_backup": {
        const backup = await client.createBackup(args.description);
        
        // Save to file if path provided
        if (args.file_path) {
          const filePath = path.resolve(args.file_path);
          const dir = path.dirname(filePath);
          
          // Create directory if it doesn't exist
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(filePath, JSON.stringify(backup, null, 2), "utf-8");
          
          return formatResponse({
            success: true,
            message: `Backup saved to ${filePath}`,
            file_path: filePath,
            summary: {
              virtuals: backup.virtuals.length,
              scenes: backup.scenes.length,
              playlists: backup.playlists.length,
              timestamp: backup.timestamp,
            },
          });
        }
        
        return formatResponse({
          success: true,
          message: "Backup created successfully",
          backup,
          summary: {
            virtuals: backup.virtuals.length,
            scenes: backup.scenes.length,
            playlists: backup.playlists.length,
            timestamp: backup.timestamp,
          },
        });
      }

      case "ledfx_restore_backup": {
        // Validate backup first
        const validation = client.validateBackup(args.backup);
        if (!validation.valid) {
          return formatResponse({
            success: false,
            error: "Invalid backup format",
            validation_errors: validation.errors,
          });
        }

        const restoreOptions: RestoreOptions = {
          restore_virtuals: args.restore_virtuals,
          restore_scenes: args.restore_scenes,
          restore_playlists: args.restore_playlists,
          restore_audio: args.restore_audio,
          clear_existing: args.clear_existing,
          dry_run: args.dry_run,
        };

        const result = await client.restoreBackup(args.backup as LedFxBackup, restoreOptions);
        return formatResponse({
          success: result.success,
          dry_run: result.dry_run,
          message: result.dry_run 
            ? "Dry run completed - no changes made" 
            : "Restore completed",
          result,
        });
      }

      case "ledfx_validate_backup": {
        const validation = client.validateBackup(args.backup);
        const backup = args.backup as Partial<LedFxBackup>;
        return formatResponse({
          valid: validation.valid,
          errors: validation.errors,
          summary: validation.valid ? {
            version: backup.version,
            timestamp: backup.timestamp,
            ledfx_version: backup.ledfx_version,
            virtuals: backup.virtuals?.length || 0,
            scenes: backup.scenes?.length || 0,
            playlists: backup.playlists?.length || 0,
            description: backup.metadata?.description,
          } : undefined,
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
