import { afterEach, describe, expect, test, jest } from "@jest/globals";
import { handleToolCall } from "../../src/tools.js";

describe("scene and playlist reference validation", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
    jest.restoreAllMocks();
  });

  test("ledfx_create_playlist rejects unknown scene IDs before write", async () => {
    const createPlaylist = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue({ id: "p1" });

    (global as any).ledfxClient = {
      getScenes: jest
        .fn<() => Promise<any[]>>()
        .mockResolvedValue([{ id: "scene-1", name: "Scene 1" }]),
      createPlaylist,
    };

    const result = await handleToolCall("ledfx_create_playlist", {
      id: "p1",
      name: "Playlist 1",
      scene_ids: ["missing-scene"],
      duration_ms: 1000,
    });

    const payload = JSON.parse(result.content[0].text);
    expect(payload.error).toContain("Missing scene IDs");
    expect(createPlaylist).not.toHaveBeenCalled();
  });

  test("ledfx_refresh_blender_scenes rejects unknown virtual references before update", async () => {
    const updateScene = jest
      .fn<(...args: any[]) => Promise<void>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = {
      getScenes: jest.fn<() => Promise<any[]>>().mockResolvedValue([
        {
          id: "broken-blender",
          name: "Broken Blender",
          scene_tags: "blender",
          virtuals: {
            "missing-virtual": {
              type: "blender",
              config: {
                mask: "mask-v",
                foreground: "fore-v",
                background: "back-v",
              },
            },
          },
        },
      ]),
      getVirtuals: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
      getEffectSchemas: jest
        .fn<() => Promise<Record<string, any>>>()
        .mockResolvedValue({ blender: { schema: {} } }),
      updateScene,
    };

    const result = await handleToolCall("ledfx_refresh_blender_scenes", {});
    const payload = JSON.parse(result.content[0].text);

    expect(payload.success).toBe(true);
    expect(payload.updated).toBe(0);
    expect(payload.failed).toBe(1);
    expect(updateScene).not.toHaveBeenCalled();
    expect(payload.results[0].error).toContain("Unknown virtual");
  });
});
