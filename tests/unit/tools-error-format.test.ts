import { afterEach, describe, expect, test } from "@jest/globals";
import { handleToolCall } from "../../src/tools.js";
import { LedFxApiError, LedFxConnectionError } from "../../src/ledfx-client.js";

describe("tool error transparency", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
  });

  test("formats LedFxApiError into structured error envelope", async () => {
    (global as any).ledfxClient = {
      getInfo: async () => {
        throw new LedFxApiError("LedFX API error: 400 Bad Request", {
          method: "POST",
          endpoint: "/playlists",
          url: "http://localhost:8888/api/playlists",
          durationMs: 12,
          status: 400,
          statusText: "Bad Request",
          responseBody: "{\"reason\":\"invalid\"}",
        });
      },
    };

    const result = await handleToolCall("ledfx_get_info", {});
    const payload = JSON.parse(result.content[0].text);

    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("LEDFX_API_ERROR");
    expect(payload.error.status).toBe(400);
    expect(payload.error.endpoint).toBe("/playlists");
  });

  test("formats LedFxConnectionError into structured error envelope", async () => {
    (global as any).ledfxClient = {
      getInfo: async () => {
        throw new LedFxConnectionError("Failed to connect", {
          method: "GET",
          endpoint: "/info",
          url: "http://localhost:8888/api/info",
          durationMs: 30,
          cause: "ECONNREFUSED",
        });
      },
    };

    const result = await handleToolCall("ledfx_get_info", {});
    const payload = JSON.parse(result.content[0].text);

    expect(payload.ok).toBe(false);
    expect(payload.error.code).toBe("LEDFX_CONNECTION_ERROR");
    expect(payload.error.method).toBe("GET");
    expect(payload.error.endpoint).toBe("/info");
    expect(payload.error.cause).toBe("ECONNREFUSED");
  });
});
