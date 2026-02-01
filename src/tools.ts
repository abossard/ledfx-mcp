/**
 * MCP Tools for LedFX
 * 
 * Defines the tools available to AI assistants for controlling LedFX.
 * 
 * Following "Grokking Simplicity":
 * - Tools definitions are pure data (calculations)
 * - Tool handlers are actions that use the LedFX client
 * 
 * Following "A Philosophy of Software Design":
 * - Each tool has a clear, focused purpose
 * - Tool interface is simple and well-documented
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { LedFxClient } from "./ledfx-client.js";

/**
 * Tool definitions (pure data - calculations)
 */
export const tools: Tool[] = [
  {
    name: "ledfx_get_info",
    description:
      "Get information about the LedFX server including version and configuration",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_list_devices",
    description:
      "List all available LED devices configured in LedFX. Returns device IDs, names, types, and configurations.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_get_device",
    description:
      "Get detailed information about a specific LED device by its ID",
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
  {
    name: "ledfx_set_effect",
    description:
      "Set an effect on a specific device. Effects control how the LEDs display (e.g., rainbow, pulse, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        device_id: {
          type: "string",
          description: "The unique identifier of the device",
        },
        effect_type: {
          type: "string",
          description: "The type of effect to apply (e.g., 'rainbow', 'pulse', 'wavelength')",
        },
        config: {
          type: "object",
          description: "Effect-specific configuration options",
          additionalProperties: true,
        },
      },
      required: ["device_id", "effect_type"],
    },
  },
  {
    name: "ledfx_clear_effect",
    description: "Clear/stop the current effect on a specific device",
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
  {
    name: "ledfx_list_scenes",
    description:
      "List all available scenes. Scenes are pre-configured combinations of effects across multiple devices.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "ledfx_activate_scene",
    description: "Activate a pre-configured scene by its ID",
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
];

/**
 * Get the LedFX client instance from global context
 * In a production app, we'd use proper dependency injection
 */
function getClient(): LedFxClient {
  const client = (global as any).ledfxClient;
  if (!client) {
    throw new Error("LedFX client not initialized");
  }
  return client;
}

/**
 * Format response data (calculation - pure function)
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
 * Handle tool execution (action - performs I/O)
 * 
 * This is the main dispatcher that routes tool calls to appropriate handlers
 */
export async function handleToolCall(
  name: string,
  args: Record<string, any>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const client = getClient();

  try {
    switch (name) {
      case "ledfx_get_info": {
        const info = await client.getInfo();
        return formatResponse(info);
      }

      case "ledfx_list_devices": {
        const devices = await client.getDevices();
        return formatResponse(devices);
      }

      case "ledfx_get_device": {
        const device = await client.getDevice(args.device_id);
        return formatResponse(device);
      }

      case "ledfx_set_effect": {
        await client.setEffect(
          args.device_id,
          args.effect_type,
          args.config || {}
        );
        return formatResponse({
          success: true,
          message: `Effect '${args.effect_type}' set on device '${args.device_id}'`,
        });
      }

      case "ledfx_clear_effect": {
        await client.clearEffect(args.device_id);
        return formatResponse({
          success: true,
          message: `Effect cleared on device '${args.device_id}'`,
        });
      }

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
