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

describe("LedFxClient virtual config updates", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("updateVirtualConfig uses POST /virtuals with id + config payload", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        status: "success",
        virtual: {
          id: "3linematrix",
          active: true,
          config: {
            name: "3lineMatrix",
            transition_mode: "Dissolve",
            transition_time: 0.75,
          },
        },
      })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    const updated = await client.updateVirtualConfig("3linematrix", {
      transition_mode: "Dissolve",
      transition_time: 0.75,
    });

    expect(updated.config.transition_mode).toBe("Dissolve");
    expect(updated.config.transition_time).toBe(0.75);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, requestOptions] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/api/virtuals");
    expect(requestOptions?.method).toBe("POST");
    expect(JSON.parse(String(requestOptions?.body))).toEqual({
      id: "3linematrix",
      config: {
        transition_mode: "Dissolve",
        transition_time: 0.75,
      },
    });
  });

  test("updateVirtualConfig can preserve active state when provided", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch");

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        status: "success",
        virtual: {
          id: "3linematrix",
          active: false,
          config: {
            name: "3lineMatrix",
            transition_mode: "None",
            transition_time: 0,
          },
        },
      })
    );

    const client = new LedFxClient({ host: "localhost", port: 8888 });
    await client.updateVirtualConfig(
      "3linematrix",
      { transition_mode: "None", transition_time: 0 },
      { active: false }
    );

    const [, requestOptions] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(requestOptions?.body))).toEqual({
      id: "3linematrix",
      active: false,
      config: {
        transition_mode: "None",
        transition_time: 0,
      },
    });
  });
});
