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

describe("LedFxClient playlist updates", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("updatePlaylist uses POST upsert and preserves existing metadata fields", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          playlists: {
            party: {
              id: "party",
              name: "Party",
              items: [{ scene_id: "s1", duration_ms: 1000 }],
              mode: "sequence",
              default_duration_ms: 1000,
              timing: { jitter: { enabled: true } },
              tags: ["dance"],
              image: "Wallpaper",
            },
          },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse({
          status: "success",
          data: {
            playlist: {
              id: "party",
              name: "Party Updated",
              items: [{ scene_id: "s1", duration_ms: 1000 }],
              mode: "sequence",
              default_duration_ms: 1000,
              timing: { jitter: { enabled: true } },
              tags: ["dance"],
              image: "Wallpaper",
            },
          },
        })
      );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    await client.updatePlaylist("party", { name: "Party Updated" });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstMethod = fetchMock.mock.calls[0]?.[1]?.method || "GET";
    const secondMethod = fetchMock.mock.calls[1]?.[1]?.method || "GET";

    expect(firstMethod).toBe("GET");
    expect(secondMethod).toBe("POST");

    const postBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body));
    expect(postBody.id).toBe("party");
    expect(postBody.name).toBe("Party Updated");
    expect(postBody.timing).toEqual({ jitter: { enabled: true } });
    expect(postBody.tags).toEqual(["dance"]);
    expect(postBody.image).toBe("Wallpaper");

    const methods = fetchMock.mock.calls.map((call) => call[1]?.method || "GET");
    expect(methods).not.toContain("DELETE");
  });

  test("getPlaylistStatus requests runtime state via playlist action endpoint", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        status: "success",
        data: {
          state: {
            active_playlist: "party",
            index: 2,
            paused: false,
            scene_id: "scene-3",
          },
        },
      })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const state = await client.getPlaylistStatus();

    expect(state.active_playlist).toBe("party");
    expect(state.index).toBe(2);
    expect(state.scene_id).toBe("scene-3");

    const [, requestOptions] = fetchMock.mock.calls[0];
    expect(requestOptions?.method).toBe("PUT");
    expect(JSON.parse(String(requestOptions?.body))).toEqual({ action: "state" });
  });
});
