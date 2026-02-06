import { afterEach, describe, expect, test, jest } from "@jest/globals";
import { handleToolCall } from "../../src/tools.js";

describe("ledfx_refresh_blender_scenes", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
    jest.restoreAllMocks();
  });

  test("refreshes blender scenes with updateScene instead of delete/create", async () => {
    const updateScene = jest
      .fn<(...args: any[]) => Promise<void>>()
      .mockResolvedValue(undefined);
    const getScenes = jest
      .fn<() => Promise<any[]>>()
      .mockResolvedValue([
        {
          id: "blender-scene",
          name: "Blender Scene",
          scene_tags: "blender",
          virtuals: {
            "3linematrix": {
              type: "blender",
              config: {
                mask: "mask-v",
                foreground: "fore-v",
                background: "back-v",
              },
            },
          },
        },
        {
          id: "plain-scene",
          name: "Plain Scene",
          virtuals: {
            "3linematrix": {
              type: "singleColor",
              config: { color: "#ff0000" },
            },
          },
        },
      ]);

    (global as any).ledfxClient = {
      getScenes,
      getVirtuals: jest
        .fn<() => Promise<any[]>>()
        .mockResolvedValue([{ id: "3linematrix" }]),
      getEffectSchemas: jest
        .fn<() => Promise<Record<string, any>>>()
        .mockResolvedValue({ blender: { schema: {} } }),
      updateScene,
    };

    const result = await handleToolCall("ledfx_refresh_blender_scenes", {});
    const payload = JSON.parse(result.content[0].text);

    expect(updateScene).toHaveBeenCalledTimes(1);
    expect(updateScene).toHaveBeenCalledWith(
      "blender-scene",
      expect.objectContaining({
        name: "Blender Scene",
        sceneTags: "blender",
      })
    );

    expect(payload.success).toBe(true);
    expect(payload.updated).toBe(1);
    expect(payload.failed).toBe(0);
  });
});
