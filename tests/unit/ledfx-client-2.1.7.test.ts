import { describe, expect, test, afterEach, jest } from "@jest/globals";
import { LedFxClient } from "../../src/ledfx-client.js";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("LedFxClient 2.1.7 features", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getInfo returns typed LedFxInfo with features", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        url: "http://localhost:8888",
        name: "LedFx Controller",
        version: "2.1.7",
        github_sha: "unknown",
        is_release: "false",
        developer_mode: false,
        features: { sendspin: true },
      })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const info = await client.getInfo();

    expect(info.version).toBe("2.1.7");
    expect(info.features).toEqual({ sendspin: true });
    expect(info.name).toBe("LedFx Controller");
  });

  test("getVirtualsWithState returns virtuals and paused state", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        status: "success",
        virtuals: {
          test: {
            id: "test",
            config: { name: "TEST" },
            active: false,
            effect: {},
            streaming: true,
            last_effect: null,
          },
        },
        paused: true,
      })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const result = await client.getVirtualsWithState();

    expect(result.paused).toBe(true);
    expect(result.virtuals).toHaveLength(1);
    expect(result.virtuals[0].streaming).toBe(true);
    expect(result.virtuals[0].last_effect).toBeNull();
  });

  test("findDevices triggers POST /find_devices", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ status: "success" })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const result = await client.findDevices();

    expect(result.status).toBe("success");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8888/api/find_devices",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("getGlobalBrightness reads from config", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ global_brightness: 0.75 })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const brightness = await client.getGlobalBrightness();

    expect(brightness).toBe(0.75);
  });

  test("setGlobalBrightness clamps and sends config update", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: "success" }));

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    await client.setGlobalBrightness(1.5);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8888/api/config",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ global_brightness: 1 }),
      })
    );
  });

  test("setStartupScene sends config update", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: "success" }));

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    await client.setStartupScene("my-scene");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8888/api/config",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ startup_scene_id: "my-scene" }),
      })
    );
  });

  test("getPausedState returns boolean", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ status: "success", virtuals: {}, paused: false })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const paused = await client.getPausedState();

    expect(paused).toBe(false);
  });

  test("sendNotification posts to /notify", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(jsonResponse({}));

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    await client.sendNotification("Test", "Hello world");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8888/api/notify",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Test", text: "Hello world" }),
      })
    );
  });
});
