import { describe, expect, test, afterEach, jest } from "@jest/globals";
import { LedFxClient } from "../../src/ledfx-client.js";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("LedFxClient scene parsing", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getScenes preserves scene IDs from map keys", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        jsonResponse({
          status: "success",
          scenes: {
            "scene-alpha": { name: "Alpha" },
            "scene-beta": { name: "Beta", id: "wrong-id" },
          },
        })
      );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const scenes = await client.getScenes();

    expect(scenes).toHaveLength(2);
    expect(scenes[0].id).toBe("scene-alpha");
    expect(scenes[1].id).toBe("scene-beta");
  });

  test("getScene parses /api/scenes/{id} response shape", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        jsonResponse({
          status: "success",
          scene: {
            id: "andre-1",
            config: {
              name: "andre",
              scene_tags: "blender",
              virtuals: {
                "3linematrix": {
                  type: "blender",
                  config: { mask: "3linematrix-mask" },
                },
              },
            },
          },
        })
      );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const scene = await client.getScene("andre-1");

    expect(scene.id).toBe("andre-1");
    expect(scene.name).toBe("andre");
    expect(scene.scene_tags).toBe("blender");
    expect(scene.virtuals?.["3linematrix"]?.type).toBe("blender");
  });
});
