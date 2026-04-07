import { afterEach, describe, expect, test, jest } from "@jest/globals";
import { handleToolCall } from "../../src/tools.js";

describe("LedFX 2.1.7 tool handlers", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
    jest.restoreAllMocks();
  });

  test("ledfx_list_virtuals includes paused state", async () => {
    (global as any).ledfxClient = {
      getVirtualsWithState: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({
        virtuals: [{ id: "test", config: { name: "TEST" }, active: false }],
        paused: true,
      }),
    };

    const result = await handleToolCall("ledfx_list_virtuals", {});
    const payload = JSON.parse(result.content[0].text);

    expect(payload.paused).toBe(true);
    expect(payload.virtuals).toHaveLength(1);
  });

  test("ledfx_find_devices triggers discovery", async () => {
    (global as any).ledfxClient = {
      findDevices: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({ status: "success" }),
    };

    const result = await handleToolCall("ledfx_find_devices", {});
    const payload = JSON.parse(result.content[0].text);

    expect(payload.status).toBe("success");
    expect(payload.message).toBe("Device discovery triggered");
  });

  test("ledfx_get_global_brightness returns brightness", async () => {
    (global as any).ledfxClient = {
      getGlobalBrightness: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(0.8),
    };

    const result = await handleToolCall("ledfx_get_global_brightness", {});
    const payload = JSON.parse(result.content[0].text);

    expect(payload.global_brightness).toBe(0.8);
  });

  test("ledfx_set_global_brightness sets brightness", async () => {
    (global as any).ledfxClient = {
      setGlobalBrightness: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(undefined),
    };

    const result = await handleToolCall("ledfx_set_global_brightness", { brightness: 0.5 });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.success).toBe(true);
    expect((global as any).ledfxClient.setGlobalBrightness).toHaveBeenCalledWith(0.5);
  });

  test("ledfx_set_startup_scene sets scene", async () => {
    (global as any).ledfxClient = {
      setStartupScene: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(undefined),
    };

    const result = await handleToolCall("ledfx_set_startup_scene", { scene_id: "my-scene" });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.success).toBe(true);
    expect(payload.message).toContain("my-scene");
  });

  test("ledfx_set_startup_scene disables with empty string", async () => {
    (global as any).ledfxClient = {
      setStartupScene: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(undefined),
    };

    const result = await handleToolCall("ledfx_set_startup_scene", { scene_id: "" });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.message).toContain("disabled");
  });

  test("ledfx_get_paused_state returns paused", async () => {
    (global as any).ledfxClient = {
      getPausedState: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(false),
    };

    const result = await handleToolCall("ledfx_get_paused_state", {});
    const payload = JSON.parse(result.content[0].text);

    expect(payload.paused).toBe(false);
  });

  test("ledfx_send_notification sends notification", async () => {
    (global as any).ledfxClient = {
      sendNotification: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue(undefined),
    };

    const result = await handleToolCall("ledfx_send_notification", { title: "Hi", text: "Test" });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.success).toBe(true);
    expect((global as any).ledfxClient.sendNotification).toHaveBeenCalledWith("Hi", "Test");
  });

  test("ledfx_update_virtual_config supports new fields", async () => {
    (global as any).ledfxClient = {
      getVirtual: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({
        id: "test",
        active: true,
        config: { name: "TEST" },
      }),
      updateVirtualConfig: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({
        id: "test",
        config: { name: "TEST", max_brightness: 0.5, rows: 4 },
      }),
    };

    const result = await handleToolCall("ledfx_update_virtual_config", {
      virtual_id: "test",
      max_brightness: 0.5,
      rows: 4,
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.success).toBe(true);
    expect(payload.updated_fields).toEqual(["max_brightness", "rows"]);
  });
});
