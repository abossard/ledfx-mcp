import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { handleToolCall } from "../../src/tools.js";

const EMPTY_COLORS_RESPONSE = {
  colors: {
    builtin: {},
    user: {},
  },
  gradients: {
    builtin: {},
    user: {},
  },
};

describe("gradient and color validation", () => {
  afterEach(() => {
    delete (global as any).ledfxClient;
    jest.restoreAllMocks();
  });

  test("ledfx_upsert_color_or_gradient rejects invalid gradient stops", async () => {
    const upsertColors = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = { upsertColors };

    const result = await handleToolCall("ledfx_upsert_color_or_gradient", {
      type: "gradient",
      id: "bad-gradient",
      value: "linear-gradient(90deg, #FF0000, #00FF00)",
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.error).toContain("Invalid gradient");
    expect(payload.error).toContain("percentage stops");
    expect(upsertColors).not.toHaveBeenCalled();
  });

  test("ledfx_upsert_color_or_gradient rejects stop without color", async () => {
    const upsertColors = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = { upsertColors };

    const result = await handleToolCall("ledfx_upsert_color_or_gradient", {
      type: "gradient",
      id: "missing-color-stop",
      value: "linear-gradient(90deg, 0%, #00FF00 100%)",
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.error).toContain("Invalid gradient");
    expect(payload.error).toContain("missing color in stop");
    expect(upsertColors).not.toHaveBeenCalled();
  });

  test("ledfx_upsert_color_or_gradient accepts valid gradient stops", async () => {
    const upsertColors = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = { upsertColors };

    const result = await handleToolCall("ledfx_upsert_color_or_gradient", {
      type: "gradient",
      id: "good-gradient",
      value: "linear-gradient(90deg, #FF0000 0%, #00FF00 100%)",
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.success).toBe(true);
    expect(upsertColors).toHaveBeenCalledWith({
      "good-gradient": "linear-gradient(90deg, #FF0000 0%, #00FF00 100%)",
    });
  });

  test("ledfx_create_palette rejects invalid palette color values", async () => {
    const upsertColors = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = { upsertColors };

    const result = await handleToolCall("ledfx_create_palette", {
      name: "bad-palette",
      colors: ["#112233", "not-a-color"],
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.error).toContain("Invalid palette color");
    expect(upsertColors).not.toHaveBeenCalled();
  });

  test("ledfx_create_palette writes generated gradient with explicit stops", async () => {
    const upsertColors = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = { upsertColors };

    const result = await handleToolCall("ledfx_create_palette", {
      name: "good-palette",
      colors: ["#112233", "#445566", "#778899"],
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.success).toBe(true);
    expect(upsertColors).toHaveBeenCalledWith({
      "palette:good-palette":
        "linear-gradient(90deg, #112233 0%, #445566 50%, #778899 100%)",
    });
  });

  test("ledfx_set_effect rejects invalid literal gradients before LedFX write", async () => {
    const setVirtualEffect = jest
      .fn<(...args: any[]) => Promise<any>>()
      .mockResolvedValue(undefined);

    (global as any).ledfxClient = {
      getColors: jest
        .fn<() => Promise<typeof EMPTY_COLORS_RESPONSE>>()
        .mockResolvedValue(EMPTY_COLORS_RESPONSE),
      setVirtualEffect,
    };

    const result = await handleToolCall("ledfx_set_effect", {
      virtual_id: "virt-1",
      effect_type: "gradient",
      effect_config: {
        gradient: "linear-gradient(90deg, #FF0000, #00FF00)",
      },
    });
    const payload = JSON.parse(result.content[0].text);

    expect(payload.error).toContain("Invalid gradient");
    expect(setVirtualEffect).not.toHaveBeenCalled();
  });
});
