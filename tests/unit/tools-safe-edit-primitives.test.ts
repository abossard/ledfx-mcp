import { afterEach, describe, expect, test, jest } from "@jest/globals";
import { handleToolCall } from "../../src/tools.js";

describe("safe edit primitives", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
    jest.restoreAllMocks();
  });

  test("ledfx_get_scene returns scene payload", async () => {
    (global as any).ledfxClient = {
      getScene: jest
        .fn<(...args: any[]) => Promise<any>>()
        .mockResolvedValue({ id: "scene-1", name: "Scene 1", virtuals: {} }),
    };

    const result = await handleToolCall("ledfx_get_scene", { scene_id: "scene-1" });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.id).toBe("scene-1");
    expect(payload.name).toBe("Scene 1");
  });

  test("ledfx_update_scene updates scene in place", async () => {
    const updateScene = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue({ id: "scene-1", name: "New Name", virtuals: {} });

    (global as any).ledfxClient = {
      updateScene,
    };

    const result = await handleToolCall("ledfx_update_scene", {
      scene_id: "scene-1",
      name: "New Name",
      tags: "updated",
    });
    const payload = JSON.parse(result.content[0].text);

    expect(updateScene).toHaveBeenCalledWith(
      "scene-1",
      expect.objectContaining({ name: "New Name", sceneTags: "updated" })
    );
    expect(payload.success).toBe(true);
  });

  test("ledfx_upsert_playlist creates a new playlist when missing", async () => {
    const createPlaylist = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue({ id: "p1", name: "Playlist 1", items: [] });

    (global as any).ledfxClient = {
      getPlaylist: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(null),
      getScenes: jest
        .fn<() => Promise<any[]>>()
        .mockResolvedValue([{ id: "scene-1", name: "Scene 1" }]),
      createPlaylist,
    };

    const result = await handleToolCall("ledfx_upsert_playlist", {
      playlist_id: "p1",
      name: "Playlist 1",
      scene_ids: ["scene-1"],
      default_duration_ms: 1500,
    });
    const payload = JSON.parse(result.content[0].text);

    expect(createPlaylist).toHaveBeenCalled();
    expect(payload.success).toBe(true);
    expect(payload.message).toContain("created");
  });

  test("ledfx_patch_playlist_items moves item positions safely", async () => {
    const updatePlaylist = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue({ id: "p1" });

    (global as any).ledfxClient = {
      getPlaylist: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({
        id: "p1",
        name: "Playlist 1",
        default_duration_ms: 1000,
        items: [
          { scene_id: "a", duration_ms: 1000 },
          { scene_id: "b", duration_ms: 1000 },
          { scene_id: "c", duration_ms: 1000 },
        ],
      }),
      updatePlaylist,
    };

    const result = await handleToolCall("ledfx_patch_playlist_items", {
      playlist_id: "p1",
      operation: "move",
      index: 0,
      to_index: 2,
    });
    const payload = JSON.parse(result.content[0].text);

    expect(updatePlaylist).toHaveBeenCalledWith("p1", {
      items: [
        { scene_id: "b", duration_ms: 1000 },
        { scene_id: "c", duration_ms: 1000 },
        { scene_id: "a", duration_ms: 1000 },
      ],
    });
    expect(payload.success).toBe(true);
  });
});
