import { afterEach, describe, expect, test, jest } from "@jest/globals";
import { handleToolCall } from "../../src/tools.js";

describe("virtual transition config tool", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
    jest.restoreAllMocks();
  });

  test("rejects invalid transition mode", async () => {
    (global as any).ledfxClient = {
      getVirtual: jest.fn<(...args: any[]) => Promise<any>>(),
      updateVirtualConfig: jest.fn<(...args: any[]) => Promise<any>>(),
    };

    const result = await handleToolCall("ledfx_update_virtual_config", {
      virtual_id: "3linematrix",
      transition_mode: "FadeToPink",
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.error).toContain("Invalid transition_mode");
  });

  test("rejects transition time outside allowed range", async () => {
    (global as any).ledfxClient = {
      getVirtual: jest.fn<(...args: any[]) => Promise<any>>(),
      updateVirtualConfig: jest.fn<(...args: any[]) => Promise<any>>(),
    };

    const result = await handleToolCall("ledfx_update_virtual_config", {
      virtual_id: "3linematrix",
      transition_time: 9,
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.error).toContain("transition_time must be a finite number between 0 and 5");
  });

  test("updates virtual transition config and returns effective values", async () => {
    const getVirtual = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue({
        id: "3linematrix",
        active: true,
        config: { transition_mode: "None", transition_time: 0 },
      });

    const updateVirtualConfig = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue({
        id: "3linematrix",
        config: { transition_mode: "Add", transition_time: 0.8 },
      });

    (global as any).ledfxClient = {
      getVirtual,
      updateVirtualConfig,
    };

    const result = await handleToolCall("ledfx_update_virtual_config", {
      virtual_id: "3linematrix",
      transition_mode: "Add",
      transition_time: 0.8,
    });
    const payload = JSON.parse(result.content[0].text);

    expect(getVirtual).toHaveBeenCalledWith("3linematrix");
    expect(updateVirtualConfig).toHaveBeenCalledWith(
      "3linematrix",
      {
        transition_mode: "Add",
        transition_time: 0.8,
      },
      { active: true }
    );
    expect(payload.success).toBe(true);
    expect(payload.transition_mode).toBe("Add");
    expect(payload.transition_time).toBe(0.8);
  });
});
