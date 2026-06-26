import { afterEach, describe, expect, test, jest } from "@jest/globals";
import { LedFxClient, NowPlayingConfigUpdate } from "../../src/ledfx-client.js";
import { handleToolCall } from "../../src/tools.js";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const SAMPLE_CONFIG = {
  gradient: { enabled: false, variant: "led_punchy", virtual_ids: [] },
  track_text: { enabled: true, duration: 60, virtual_ids: [], preset: "" },
  album_art: { enabled: true, duration: 10, virtual_ids: [] },
};

describe("LedFxClient now-playing", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
    jest.restoreAllMocks();
  });

  test("getNowPlaying GETs /api/now-playing and returns state + config", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        active_source_id: "sendspin",
        metadata: {
          source_id: "sendspin",
          title: "Song",
          artist: "Band",
          album: null,
          track_id: null,
          artwork_url: null,
          artwork_hash: null,
          updated_at: 123,
        },
        artwork: null,
        current_gradient: null,
        selected_gradient_variant: "led_punchy",
        updated_at: 123,
        config: SAMPLE_CONFIG,
      })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const state = await client.getNowPlaying();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8888/api/now-playing");
    expect(init?.method ?? "GET").toBe("GET");
    expect(state.metadata?.title).toBe("Song");
    expect(state.selected_gradient_variant).toBe("led_punchy");
    expect(state.config.track_text.duration).toBe(60);
  });

  test("updateNowPlaying PUTs the partial body and unwraps validated config from `data`", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    const validated = {
      ...SAMPLE_CONFIG,
      track_text: { ...SAMPLE_CONFIG.track_text, duration: 42 },
    };
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ status: "success", data: validated })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const result = await client.updateNowPlaying({
      track_text: { duration: 42 },
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8888/api/now-playing");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body as string)).toEqual({
      track_text: { duration: 42 },
    });
    expect(result.track_text.duration).toBe(42);
  });

  test("updateNowPlaying surfaces LedFX's HTTP-200 validation failure as an API error", async () => {
    // LedFX returns HTTP 200 with {status:"failed"} for invalid config — NOT a
    // 4xx — so the client must inspect the body, not just response.ok.
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        status: "failed",
        payload: {
          type: "error",
          reason: "value must be one of ['led_max','led_punchy','led_safe']",
        },
      })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    await expect(
      client.updateNowPlaying({ gradient: { variant: "led_max" } })
    ).rejects.toThrow(/led_punchy/);
  });

  test("ledfx_update_now_playing tool reports failure (not success) for rejected config", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        status: "failed",
        payload: { type: "error", reason: "bad variant" },
      })
    );
    (global as any).ledfxClient = new LedFxClient({
      host: "localhost",
      port: 8888,
    });

    const result = await handleToolCall("ledfx_update_now_playing", {
      gradient: { variant: "nope" },
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.success).toBeUndefined();
    expect(payload.ok).toBe(false);
    expect(JSON.stringify(payload)).toContain("bad variant");
  });
});

describe("now-playing tool handlers", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
    jest.restoreAllMocks();
  });

  test("ledfx_get_now_playing returns the client state payload", async () => {
    (global as any).ledfxClient = {
      getNowPlaying: jest
        .fn<() => Promise<any>>()
        .mockResolvedValue({ title: "Now", config: SAMPLE_CONFIG }),
    };

    const result = await handleToolCall("ledfx_get_now_playing", {});
    const payload = JSON.parse(result.content[0].text);

    expect(payload.title).toBe("Now");
    expect(payload.config.album_art.enabled).toBe(true);
  });

  // Partial passthrough: the handler must forward ONLY the sections the caller
  // supplied, so LedFX's per-section merge leaves the others untouched.
  test.each([
    [{ gradient: { enabled: true } }, ["gradient"]],
    [{ track_text: { duration: 30 }, album_art: { enabled: false } }, ["track_text", "album_art"]],
    [{}, []],
  ])("ledfx_update_now_playing forwards only provided sections (%j)", async (args, expectedKeys) => {
    const updateMock = jest
      .fn<(c: NowPlayingConfigUpdate) => Promise<any>>()
      .mockResolvedValue(SAMPLE_CONFIG);
    (global as any).ledfxClient = { updateNowPlaying: updateMock };

    const result = await handleToolCall("ledfx_update_now_playing", args as any);
    const payload = JSON.parse(result.content[0].text);

    expect(payload.success).toBe(true);
    const forwarded = updateMock.mock.calls[0][0];
    expect(Object.keys(forwarded).sort()).toEqual([...expectedKeys].sort());
    expect(forwarded).toEqual(args);
  });
});
