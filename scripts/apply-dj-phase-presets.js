#!/usr/bin/env node

/**
 * Apply DJ phase palettes, presets, and scenes to LedFX.
 * Requires a running LedFX instance reachable by LEDFX_HOST/LEDFX_PORT.
 */

import { createLedFxClient } from "../dist/ledfx-client.js";

const client = createLedFxClient();

const MAIN_VIRTUAL = "3lineMatrix";
const BACKGROUND_VIRTUAL = "3linematrix-background";
const FOREGROUND_VIRTUAL = "3linematrix-foreground";
const MASK_VIRTUAL = "3linematrix-mask";

const PHASES = {
  p1: {
    name: "phase1",
    tags: ["phase1", "jungle", "starter", "warmup"],
    background: "#001a00",
    colors: ["#228b22", "#00aa00", "#ffff00", "#0096c8"],
    speed: 2,
    brightness: 0.7,
  },
  p2: {
    name: "phase2",
    tags: ["phase2", "buildup", "anticipation"],
    background: "#0a000a",
    colors: ["#0044aa", "#00ffff", "#9900ff"],
    speed: 3,
    brightness: 0.85,
  },
  p3: {
    name: "phase3",
    tags: ["phase3", "peak", "drop", "climax"],
    background: "#000000",
    colors: ["#9900ff", "#ff00aa", "#ff0000"],
    speed: 5,
    brightness: 1.0,
  },
  p4: {
    name: "phase4",
    tags: ["phase4", "release", "cooldown"],
    background: "#000022",
    colors: ["#3366cc", "#cc99ff", "#00ccff"],
    speed: 2,
    brightness: 0.8,
  },
};

const DJ_SCENES = [
  // Phase 1 normal
  { name: "P1-Wavelength", phase: "p1", mode: "normal", effect: "wavelength" },
  { name: "P1-Energy", phase: "p1", mode: "normal", effect: "energy" },
  { name: "P1-BladePower", phase: "p1", mode: "normal", effect: "blade_power_plus" },
  { name: "P1-Gradient", phase: "p1", mode: "normal", effect: "gradient" },
  { name: "P1-Scroll", phase: "p1", mode: "normal", effect: "scroll" },
  // Phase 1 crazy
  { name: "P1-Strobe", phase: "p1", mode: "crazy", effect: "strobe" },

  // Phase 2 normal
  { name: "P2-Wavelength", phase: "p2", mode: "normal", effect: "wavelength" },
  { name: "P2-Energy", phase: "p2", mode: "normal", effect: "energy" },
  { name: "P2-BladePower", phase: "p2", mode: "normal", effect: "blade_power_plus" },
  { name: "P2-Gradient", phase: "p2", mode: "normal", effect: "gradient" },
  { name: "P2-Scroll", phase: "p2", mode: "normal", effect: "scroll" },
  // Phase 2 crazy
  { name: "P2-Strobe", phase: "p2", mode: "crazy", effect: "strobe" },

  // Phase 3 normal
  { name: "P3-Wavelength", phase: "p3", mode: "normal", effect: "wavelength" },
  { name: "P3-Energy", phase: "p3", mode: "normal", effect: "energy" },
  { name: "P3-Power", phase: "p3", mode: "normal", effect: "power" },
  { name: "P3-BladePower", phase: "p3", mode: "normal", effect: "blade_power_plus" },
  { name: "P3-Scroll", phase: "p3", mode: "normal", effect: "scroll" },
  // Phase 3 crazy
  { name: "P3-RealStrobe", phase: "p3", mode: "crazy", effect: "real_strobe" },

  // Phase 4 normal
  { name: "P4-Wavelength", phase: "p4", mode: "normal", effect: "wavelength" },
  { name: "P4-Energy2", phase: "p4", mode: "normal", effect: "energy2" },
  { name: "P4-BladePower", phase: "p4", mode: "normal", effect: "blade_power_plus" },
  { name: "P4-Gradient", phase: "p4", mode: "normal", effect: "gradient" },
  { name: "P4-Scroll", phase: "p4", mode: "normal", effect: "scroll" },
  // Phase 4 crazy
  { name: "P4-Strobe", phase: "p4", mode: "crazy", effect: "strobe" },
  { name: "P4-Power", phase: "p4", mode: "crazy", effect: "power" },
];

const BLENDER_SCENES = [
  {
    name: "p1-blender-jungle",
    phase: "p1",
    background: { effect: "singleColor" },
    foreground: { effect: "wavelength" },
    mask: { effect: "singleColor", brightness: 0 },
  },
  {
    name: "p1-blender-disco",
    phase: "p1",
    background: { effect: "gradient" },
    foreground: { effect: "energy" },
    mask: { effect: "strobe" },
  },
  {
    name: "p2-blender-tension",
    phase: "p2",
    background: { effect: "singleColor" },
    foreground: { effect: "blade_power_plus" },
    mask: { effect: "singleColor", brightness: 0 },
  },
  {
    name: "p2-blender-rise",
    phase: "p2",
    background: { effect: "gradient" },
    foreground: { effect: "energy" },
    mask: { effect: "strobe" },
  },
  {
    name: "p3-blender-power",
    phase: "p3",
    background: { effect: "singleColor" },
    foreground: { effect: "power" },
    mask: { effect: "singleColor", brightness: 0 },
  },
  {
    name: "p3-blender-chaos",
    phase: "p3",
    background: { effect: "gradient" },
    foreground: { effect: "blade_power_plus" },
    mask: { effect: "real_strobe" },
  },
  {
    name: "p4-blender-flow",
    phase: "p4",
    background: { effect: "singleColor" },
    foreground: { effect: "energy2" },
    mask: { effect: "singleColor", brightness: 0 },
  },
  {
    name: "p4-blender-ethereal",
    phase: "p4",
    background: { effect: "gradient" },
    foreground: { effect: "wavelength" },
    mask: { effect: "strobe" },
  },
];

function gradientFrom(colors) {
  return `linear-gradient(90deg, ${colors.join(", ")})`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function paletteFor(phaseKey, mode) {
  const phase = PHASES[phaseKey];
  const colors = mode === "crazy" ? [...phase.colors].reverse() : [...phase.colors];
  return {
    colors,
    gradient: gradientFrom(colors),
  };
}

function paletteStops(colors) {
  const midIndex = Math.floor(colors.length / 2);
  return {
    low: colors[0],
    mid: colors[midIndex],
    high: colors[colors.length - 1],
  };
}

function buildEffectConfig(effect, phaseKey, mode, effectSchemas) {
  const phase = PHASES[phaseKey];
  const palette = paletteFor(phaseKey, mode);
  const stops = paletteStops(palette.colors);
  const schema = effectSchemas[effect]?.schema?.properties || {};
  const config = {};

  if (schema.background_color) {
    config.background_color = phase.background;
  }
  if (schema.mirror) {
    config.mirror = true;
  }
  if (schema.speed) {
    config.speed = mode === "crazy" ? phase.speed + 1 : phase.speed;
  }
  if (schema.brightness) {
    config.brightness = mode === "crazy" ? Math.min(1, phase.brightness + 0.15) : phase.brightness;
  }
  if (schema.gradient) {
    config.gradient = palette.gradient;
  }
  if (schema.color) {
    config.color = stops.mid;
  }
  if (schema.color_lows) {
    config.color_lows = stops.low;
  }
  if (schema.color_mids) {
    config.color_mids = stops.mid;
  }
  if (schema.color_high) {
    config.color_high = stops.high;
  }
  if (schema.strobe_color) {
    config.strobe_color = stops.high;
  }
  if (schema.frequency_range) {
    config.frequency_range = "Lows (beat+bass)";
  }
  if (schema.sensitivity) {
    config.sensitivity = mode === "crazy" ? 0.9 : 0.8;
  }

  return config;
}

async function ensureVirtualActive(virtualId) {
  await client.setVirtualActive(virtualId, true);
}

async function upsertPalette(phaseKey, mode) {
  const paletteId = `palette:${phaseKey}-${mode}`;
  const palette = paletteFor(phaseKey, mode);
  await client.upsertColors({
    [paletteId]: palette.gradient,
  });
  return { paletteId, gradient: palette.gradient, colors: palette.colors };
}

async function createPreset(virtualId, effect, presetId, config) {
  await client.setVirtualEffect(virtualId, effect, config);
  await client.savePreset(virtualId, presetId);
  await client.applyPreset(virtualId, "user_presets", effect, presetId);
}

async function recreateScene(sceneName, tags) {
  const scenes = await client.getScenes();
  const existing = scenes.find((scene) => scene.name === sceneName);
  if (existing) {
    await client.deleteScene(existing.id);
  }
  await client.createScene(sceneName, tags.join(","));
}

async function applyDirectScenes(effectSchemas) {
  for (const scene of DJ_SCENES) {
    const phase = PHASES[scene.phase];
    const presetId = slugify(`${scene.phase}-${scene.mode}-${scene.effect}`);
    const config = buildEffectConfig(scene.effect, scene.phase, scene.mode, effectSchemas);

    await createPreset(MAIN_VIRTUAL, scene.effect, presetId, config);
    await recreateScene(scene.name, [...phase.tags, scene.mode, scene.effect]);
  }
}

async function applyBlenderScenes(effectSchemas) {
  for (const scene of BLENDER_SCENES) {
    const phase = PHASES[scene.phase];
    const mode = scene.name.includes("crazy") ? "crazy" : "normal";

    const backgroundConfig = buildEffectConfig(
      scene.background.effect,
      scene.phase,
      mode,
      effectSchemas
    );
    if (scene.background.effect === "singleColor") {
      backgroundConfig.color = phase.background;
      backgroundConfig.brightness = 1;
    }

    const foregroundConfig = buildEffectConfig(
      scene.foreground.effect,
      scene.phase,
      mode,
      effectSchemas
    );

    const maskConfig = buildEffectConfig(scene.mask.effect, scene.phase, "crazy", effectSchemas);
    if (scene.mask.effect === "singleColor") {
      maskConfig.color = "#000000";
      maskConfig.brightness = scene.mask.brightness ?? 0;
    }

    const backgroundPreset = slugify(`${scene.name}-background`);
    const foregroundPreset = slugify(`${scene.name}-foreground`);
    const maskPreset = slugify(`${scene.name}-mask`);

    await createPreset(BACKGROUND_VIRTUAL, scene.background.effect, backgroundPreset, backgroundConfig);
    await createPreset(FOREGROUND_VIRTUAL, scene.foreground.effect, foregroundPreset, foregroundConfig);
    await createPreset(MASK_VIRTUAL, scene.mask.effect, maskPreset, maskConfig);

    const blenderConfig = {
      background: BACKGROUND_VIRTUAL,
      foreground: FOREGROUND_VIRTUAL,
      mask: MASK_VIRTUAL,
    };
    const blenderPreset = slugify(`${scene.name}-blender`);
    await createPreset(MAIN_VIRTUAL, "blender", blenderPreset, blenderConfig);

    await recreateScene(scene.name, [...phase.tags, "blender"]);
  }
}

async function main() {
  await ensureVirtualActive(MAIN_VIRTUAL);
  await ensureVirtualActive(BACKGROUND_VIRTUAL);
  await ensureVirtualActive(FOREGROUND_VIRTUAL);
  await ensureVirtualActive(MASK_VIRTUAL);

  await Promise.all([
    upsertPalette("p1", "normal"),
    upsertPalette("p1", "crazy"),
    upsertPalette("p2", "normal"),
    upsertPalette("p2", "crazy"),
    upsertPalette("p3", "normal"),
    upsertPalette("p3", "crazy"),
    upsertPalette("p4", "normal"),
    upsertPalette("p4", "crazy"),
  ]);

  const effectSchemas = await client.getEffectSchemas();

  await applyDirectScenes(effectSchemas);
  await applyBlenderScenes(effectSchemas);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
