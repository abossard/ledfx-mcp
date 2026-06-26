import { afterEach, describe, expect, test, jest } from "@jest/globals";
import { LedFxClient } from "../../src/ledfx-client.js";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const FULL_CONFIG = {
  audio: { audio_device: 0 },
  melbanks: { max_frequencies: [] },
  wled_preferences: {},
  configuration_version: "2.1.9",
};

describe("LedFxClient.getConfig", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Regression: GET /api/config must never carry a request body — undici's
  // fetch rejects GET-with-body with "Request with GET/HEAD method cannot have body".
  test("requests /config with GET and no body, then filters keys client-side", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockImplementation(async () => jsonResponse(FULL_CONFIG));

    const client = new LedFxClient({ host: "localhost", port: 8888 });

    const filtered = await client.getConfig(["audio"]);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8888/api/config");
    expect(init?.method ?? "GET").toBe("GET");
    expect(init?.body).toBeUndefined();
    expect(filtered).toEqual({ audio: { audio_device: 0 } });

    // No keys -> full config returned unfiltered.
    const full = await client.getConfig();
    expect(full).toEqual(FULL_CONFIG);

    // Unknown key -> omitted, no throw.
    const missing = await client.getConfig(["does_not_exist"]);
    expect(missing).toEqual({});
  });
});
