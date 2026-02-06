import { afterEach, describe, expect, test, jest } from "@jest/globals";
import { handleToolCall } from "../../src/tools.js";

describe("scene and playlist mutation coverage", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
    jest.restoreAllMocks();
  });

  test("ledfx_update_playlist rejects unknown scenes before update", async () => {
    const updatePlaylist = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = {
      getScenes: jest.fn<() => Promise<any[]>>().mockResolvedValue([{ id: "scene-1" }]),
      updatePlaylist,
    };

    const result = await handleToolCall("ledfx_update_playlist", {
      playlist_id: "p1",
      scene_ids: ["missing-scene"],
      duration_ms: 1000,
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.error).toContain("Missing scene IDs");
    expect(updatePlaylist).not.toHaveBeenCalled();
  });

  test("ledfx_add_scene_to_playlist rejects missing scene ID before write", async () => {
    const addSceneToPlaylist = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = {
      getScenes: jest.fn<() => Promise<any[]>>().mockResolvedValue([{ id: "scene-1" }]),
      addSceneToPlaylist,
    };

    const result = await handleToolCall("ledfx_add_scene_to_playlist", {
      playlist_id: "p1",
      scene_id: "missing-scene",
      duration_ms: 1000,
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.error).toContain("Missing scene ID");
    expect(addSceneToPlaylist).not.toHaveBeenCalled();
  });

  test("ledfx_update_scene rejects unresolved preset references before update", async () => {
    const updateScene = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = {
      getVirtuals: jest.fn<() => Promise<any[]>>().mockResolvedValue([{ id: "v1" }]),
      getEffectSchemas: jest
        .fn<() => Promise<Record<string, any>>>()
        .mockResolvedValue({ energy: { schema: {} } }),
      getEffectPresets: jest
        .fn<(...args: any[]) => Promise<any>>()
        .mockResolvedValue({ ledfx_presets: {}, user_presets: {} }),
      updateScene,
    };

    const result = await handleToolCall("ledfx_update_scene", {
      scene_id: "scene-1",
      virtuals: {
        v1: {
          type: "energy",
          preset: "does-not-exist",
          preset_category: "user_presets",
        },
      },
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.error).toContain("Preset 'does-not-exist' not found");
    expect(updateScene).not.toHaveBeenCalled();
  });

  test("ledfx_patch_playlist_items supports replace_duration operation", async () => {
    const updatePlaylist = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue({ id: "p1" });

    (global as any).ledfxClient = {
      getPlaylist: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({
        id: "p1",
        name: "Playlist",
        default_duration_ms: 1000,
        items: [
          { scene_id: "a", duration_ms: 1000 },
          { scene_id: "b", duration_ms: 1000 },
        ],
      }),
      updatePlaylist,
    };

    const result = await handleToolCall("ledfx_patch_playlist_items", {
      playlist_id: "p1",
      operation: "replace_duration",
      index: 1,
      duration_ms: 2500,
    });
    const payload = JSON.parse(result.content[0].text);

    expect(updatePlaylist).toHaveBeenCalledWith("p1", {
      items: [
        { scene_id: "a", duration_ms: 1000 },
        { scene_id: "b", duration_ms: 2500 },
      ],
    });
    expect(payload.success).toBe(true);
  });
});
