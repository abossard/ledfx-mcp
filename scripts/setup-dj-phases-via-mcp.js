#!/usr/bin/env node

/**
 * DJPhases setup runner using MCP tool calls (not direct LedFX HTTP calls).
 *
 * Why this script:
 * - Uses LedFX MCP checks/guards (ledfx_set_effect, ledfx_set_blender, scene validation).
 * - Supports one or many main virtual targets.
 * - Defaults to resolving a "matrix" virtual if none is provided.
 * - Creates palettes, presets, scenes, and playlists in one pass.
 */

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const DEFAULT_MAIN_QUERY = "3lineMatrix";
const PHASE_ORDER = ["p1", "p2", "p3", "p4"];
const COMPANION_SUFFIXES = ["-background", "-foreground", "-mask"];
const DEFAULT_SCENE_DURATION_MS = 15000;
const STROBE_SCENE_DURATION_MS = 8000;
const RAPID_FLOW_SCENE_DURATION_MS = 10000;
const EFFECT_FALLBACKS = {
  energy2: ["energy", "wavelength"],
  real_strobe: ["strobe"],
  blade_power_plus: ["energy", "wavelength"],
  power: ["energy", "wavelength"],
  scan: ["scroll", "wavelength"],
  bands: ["energy", "wavelength"],
  pitchSpectrum: ["wavelength", "energy"],
  bar: ["wavelength", "energy"],
  plasma2d: ["gradient", "wavelength"],
};
const MOTION_PROFILES = {
  chill: {
    speedMultiplier: 0.55,
    brightnessDelta: -0.15,
    sensitivity: 0.6,
    frequencyRange: "Mids",
    mirror: true,
  },
  flow: {
    speedMultiplier: 0.8,
    brightnessDelta: -0.05,
    sensitivity: 0.72,
    frequencyRange: "Mids",
    mirror: true,
  },
  wobble: {
    speedMultiplier: 1.1,
    brightnessDelta: 0,
    sensitivity: 0.82,
    frequencyRange: "Mids",
    mirror: true,
  },
  drive: {
    speedMultiplier: 1.3,
    brightnessDelta: 0.06,
    sensitivity: 0.9,
    frequencyRange: "Lows (beat+bass)",
    mirror: false,
  },
  hard: {
    speedMultiplier: 1.55,
    brightnessDelta: 0.1,
    sensitivity: 0.95,
    frequencyRange: "Lows (beat+bass)",
    mirror: false,
  },
  chaos: {
    speedMultiplier: 1.85,
    brightnessDelta: 0.13,
    sensitivity: 0.98,
    frequencyRange: "Lows (beat+bass)",
    mirror: false,
  },
  bullet: {
    speedMultiplier: 2.3,
    brightnessDelta: 0.08,
    sensitivity: 0.96,
    frequencyRange: "Lows (beat+bass)",
    mirror: false,
  },
  strobe: {
    speedMultiplier: 1.75,
    brightnessDelta: 0.12,
    sensitivity: 0.95,
    frequencyRange: "Lows (beat+bass)",
    mirror: false,
  },
};
const ROLE_WEIGHTS = {
  entry: 10,
  wobble: 20,
  build: 30,
  flow: 40,
  statement: 50,
  bullet: 60,
  peak: 70,
  hard: 80,
  accent: 90,
  exit: 100,
};

const PHASES = {
  p1: {
    label: "Phase 1",
    tags: ["phase1", "jungle", "starter", "warmup"],
    background: "#001a00",
    colors: ["#228B22", "#00AA00", "#FFFF00", "#0096C8"],
    speed: 2,
    brightness: 0.7,
  },
  p2: {
    label: "Phase 2",
    tags: ["phase2", "buildup", "anticipation"],
    background: "#0A000A",
    colors: ["#0044AA", "#00FFFF", "#9900FF"],
    speed: 3,
    brightness: 0.85,
  },
  p3: {
    label: "Phase 3",
    tags: ["phase3", "peak", "drop", "climax"],
    background: "#000000",
    colors: ["#9900FF", "#FF00AA", "#FF0000"],
    speed: 5,
    brightness: 1.0,
  },
  p4: {
    label: "Phase 4",
    tags: ["phase4", "release", "cooldown"],
    background: "#000022",
    colors: ["#3366CC", "#CC99FF", "#00CCFF"],
    speed: 2,
    brightness: 0.8,
  },
};

const DIRECT_SCENE_SPECS = [
  { phase: "p1", order: 10, role: "entry", label: "P1-Entry-Canopy", mode: "normal", effect: "wavelength", profile: "flow", tags: ["entry", "flow"] },
  { phase: "p1", order: 30, role: "build", label: "P1-Groove-Wobble", mode: "normal", effect: "energy", profile: "wobble", tags: ["groove", "wobble"] },
  {
    phase: "p1",
    order: 50,
    role: "bullet",
    label: "P1-Lightning-Vines",
    mode: "crazy",
    effect: "scroll",
    profile: "bullet",
    tags: ["rapid", "bullet", "flow"],
    durationMs: RAPID_FLOW_SCENE_DURATION_MS,
    fallbackEffects: ["scan", "wavelength"],
  },
  { phase: "p1", order: 70, role: "statement", label: "P1-Disco-Bloom", mode: "normal", effect: "blade_power_plus", profile: "drive", tags: ["statement", "groove"] },
  {
    phase: "p1",
    order: 90,
    role: "accent",
    label: "P1-Snap-Accent",
    mode: "crazy",
    effect: "strobe",
    profile: "strobe",
    tags: ["strobe", "accent"],
    durationMs: STROBE_SCENE_DURATION_MS,
  },
  { phase: "p1", order: 110, role: "exit", label: "P1-Exit-Bridge", mode: "normal", effect: "gradient", profile: "chill", tags: ["exit", "bridge"] },

  { phase: "p2", order: 10, role: "entry", label: "P2-Entry-Tension-Mist", mode: "normal", effect: "gradient", profile: "chill", tags: ["entry", "tension"] },
  { phase: "p2", order: 30, role: "build", label: "P2-Build-Cyan-Blades", mode: "normal", effect: "blade_power_plus", profile: "drive", tags: ["build", "blades"] },
  { phase: "p2", order: 50, role: "flow", label: "P2-Riser-Helix", mode: "normal", effect: "bands", profile: "wobble", tags: ["riser", "helix"], fallbackEffects: ["energy", "wavelength"] },
  {
    phase: "p2",
    order: 60,
    role: "bullet",
    label: "P2-Bullet-Tunnel",
    mode: "crazy",
    effect: "scan",
    profile: "bullet",
    tags: ["rapid", "bullet", "tunnel"],
    durationMs: RAPID_FLOW_SCENE_DURATION_MS,
  },
  { phase: "p2", order: 80, role: "hard", label: "P2-Hard-Punch", mode: "crazy", effect: "power", profile: "hard", tags: ["impact", "hard"] },
  { phase: "p2", order: 110, role: "exit", label: "P2-Exit-Uplift", mode: "normal", effect: "wavelength", profile: "flow", tags: ["exit", "uplift"] },

  { phase: "p3", order: 10, role: "entry", label: "P3-Entry-Dark-Pressure", mode: "normal", effect: "energy", profile: "drive", tags: ["entry", "dark"] },
  { phase: "p3", order: 30, role: "build", label: "P3-Redline-Blades", mode: "crazy", effect: "blade_power_plus", profile: "hard", tags: ["redline", "blades"] },
  {
    phase: "p3",
    order: 50,
    role: "bullet",
    label: "P3-Laser-Bullet-Rush",
    mode: "crazy",
    effect: "scroll",
    profile: "bullet",
    tags: ["rapid", "bullet", "laser"],
    durationMs: RAPID_FLOW_SCENE_DURATION_MS,
    fallbackEffects: ["scan", "wavelength"],
  },
  { phase: "p3", order: 70, role: "hard", label: "P3-Chaos-Riptide", mode: "crazy", effect: "power", profile: "chaos", tags: ["chaos", "impact"] },
  {
    phase: "p3",
    order: 90,
    role: "accent",
    label: "P3-Blackout-Hits",
    mode: "crazy",
    effect: "real_strobe",
    profile: "strobe",
    tags: ["strobe", "blackout", "accent"],
    durationMs: STROBE_SCENE_DURATION_MS,
  },
  { phase: "p3", order: 110, role: "exit", label: "P3-Exit-Afterglow", mode: "normal", effect: "wavelength", profile: "flow", tags: ["exit", "afterglow"] },

  { phase: "p4", order: 10, role: "entry", label: "P4-Entry-Cool-Mist", mode: "normal", effect: "gradient", profile: "chill", tags: ["entry", "cool"] },
  { phase: "p4", order: 30, role: "wobble", label: "P4-Aqua-Wobble", mode: "normal", effect: "energy2", profile: "wobble", tags: ["wobble", "aqua"] },
  {
    phase: "p4",
    order: 60,
    role: "bullet",
    label: "P4-Comet-Bullets",
    mode: "crazy",
    effect: "scan",
    profile: "bullet",
    tags: ["rapid", "comet", "bullet"],
    durationMs: RAPID_FLOW_SCENE_DURATION_MS,
    fallbackEffects: ["scroll", "wavelength"],
  },
  { phase: "p4", order: 70, role: "flow", label: "P4-Aurora-Flow", mode: "normal", effect: "wavelength", profile: "flow", tags: ["aurora", "flow"] },
  {
    phase: "p4",
    order: 90,
    role: "accent",
    label: "P4-Soft-Spark",
    mode: "crazy",
    effect: "strobe",
    profile: "strobe",
    tags: ["strobe", "accent"],
    durationMs: STROBE_SCENE_DURATION_MS,
  },
  { phase: "p4", order: 110, role: "exit", label: "P4-Exit-Reset", mode: "normal", effect: "energy", profile: "chill", tags: ["exit", "reset"] },
];

const BLENDER_SCENE_SPECS = [
  {
    phase: "p1",
    order: 20,
    role: "wobble",
    label: "P1-Blender-Wobble-Roots",
    mode: "normal",
    tags: ["blender", "wobble"],
    background: { effect: "gradient", profile: "chill" },
    foreground: { effect: "wavelength", profile: "wobble" },
    mask: { effect: "singleColor", profile: "chill", overrides: { color: "#000000", brightness: 0 } },
  },
  {
    phase: "p1",
    order: 40,
    role: "flow",
    label: "P1-Blender-Flow-Mist",
    mode: "normal",
    tags: ["blender", "flow", "chill"],
    background: { effect: "singleColor", profile: "chill", overrides: { brightness: 0.25 } },
    foreground: { effect: "energy", profile: "flow" },
    mask: { effect: "gradient", profile: "chill" },
  },
  {
    phase: "p1",
    order: 60,
    role: "bullet",
    label: "P1-Blender-Bullet-Rain",
    mode: "crazy",
    tags: ["blender", "rapid", "bullet"],
    background: { effect: "gradient", profile: "drive" },
    foreground: { effect: "scroll", profile: "bullet", fallbackEffects: ["scan", "wavelength"] },
    mask: { effect: "energy", profile: "hard", mode: "crazy" },
    durationMs: RAPID_FLOW_SCENE_DURATION_MS,
  },
  {
    phase: "p1",
    order: 100,
    role: "hard",
    label: "P1-Blender-Crazy-Cut",
    mode: "crazy",
    tags: ["blender", "hard", "chaotic"],
    background: { effect: "singleColor", profile: "drive", overrides: { brightness: 0.35 } },
    foreground: { effect: "blade_power_plus", profile: "hard" },
    mask: { effect: "strobe", profile: "strobe", mode: "crazy" },
    durationMs: STROBE_SCENE_DURATION_MS,
  },
  {
    phase: "p2",
    order: 20,
    role: "wobble",
    label: "P2-Blender-Tension-Wobble",
    mode: "normal",
    tags: ["blender", "wobble", "tension"],
    background: { effect: "gradient", profile: "chill" },
    foreground: { effect: "energy", profile: "wobble" },
    mask: { effect: "singleColor", profile: "chill", overrides: { color: "#000000", brightness: 0 } },
  },
  {
    phase: "p2",
    order: 40,
    role: "flow",
    label: "P2-Blender-Lift-Helix",
    mode: "normal",
    tags: ["blender", "lift", "flow"],
    background: { effect: "singleColor", profile: "drive", overrides: { brightness: 0.3 } },
    foreground: { effect: "bands", profile: "drive", fallbackEffects: ["energy", "wavelength"] },
    mask: { effect: "energy", profile: "hard", mode: "crazy" },
  },
  {
    phase: "p2",
    order: 60,
    role: "bullet",
    label: "P2-Blender-Bullet-Tunnel",
    mode: "crazy",
    tags: ["blender", "rapid", "bullet"],
    background: { effect: "gradient", profile: "drive" },
    foreground: { effect: "scan", profile: "bullet", fallbackEffects: ["scroll", "wavelength"] },
    mask: { effect: "strobe", profile: "strobe", mode: "crazy" },
    durationMs: RAPID_FLOW_SCENE_DURATION_MS,
  },
  {
    phase: "p2",
    order: 100,
    role: "hard",
    label: "P2-Blender-Hard-Gate",
    mode: "crazy",
    tags: ["blender", "hard", "gate"],
    background: { effect: "singleColor", profile: "hard", overrides: { brightness: 0.4 } },
    foreground: { effect: "power", profile: "hard" },
    mask: { effect: "real_strobe", profile: "strobe", mode: "crazy", fallbackEffects: ["strobe"] },
    durationMs: STROBE_SCENE_DURATION_MS,
  },
  {
    phase: "p3",
    order: 20,
    role: "wobble",
    label: "P3-Blender-Wobble-Core",
    mode: "normal",
    tags: ["blender", "wobble", "core"],
    background: { effect: "singleColor", profile: "chill", overrides: { brightness: 0.2 } },
    foreground: { effect: "energy", profile: "hard" },
    mask: { effect: "gradient", profile: "flow" },
  },
  {
    phase: "p3",
    order: 40,
    role: "hard",
    label: "P3-Blender-Impact-Splitter",
    mode: "crazy",
    tags: ["blender", "impact", "hard"],
    background: { effect: "gradient", profile: "drive" },
    foreground: { effect: "blade_power_plus", profile: "hard" },
    mask: { effect: "energy", profile: "hard", mode: "crazy" },
  },
  {
    phase: "p3",
    order: 60,
    role: "bullet",
    label: "P3-Blender-Bullet-Storm",
    mode: "crazy",
    tags: ["blender", "rapid", "bullet", "storm"],
    background: { effect: "gradient", profile: "chaos" },
    foreground: { effect: "scan", profile: "bullet", fallbackEffects: ["scroll", "wavelength"] },
    mask: { effect: "strobe", profile: "strobe", mode: "crazy" },
    durationMs: RAPID_FLOW_SCENE_DURATION_MS,
  },
  {
    phase: "p3",
    order: 100,
    role: "hard",
    label: "P3-Blender-Chaos-Maskdown",
    mode: "crazy",
    tags: ["blender", "chaos", "hard"],
    background: { effect: "singleColor", profile: "hard", overrides: { brightness: 0.38 } },
    foreground: { effect: "power", profile: "chaos" },
    mask: { effect: "real_strobe", profile: "strobe", mode: "crazy", fallbackEffects: ["strobe"] },
    durationMs: STROBE_SCENE_DURATION_MS,
  },
  {
    phase: "p4",
    order: 20,
    role: "flow",
    label: "P4-Blender-Chill-Drift",
    mode: "normal",
    tags: ["blender", "chill", "flow"],
    background: { effect: "gradient", profile: "chill" },
    foreground: { effect: "energy2", profile: "flow" },
    mask: { effect: "singleColor", profile: "chill", overrides: { color: "#000000", brightness: 0 } },
  },
  {
    phase: "p4",
    order: 40,
    role: "wobble",
    label: "P4-Blender-Lavender-Wobble",
    mode: "normal",
    tags: ["blender", "wobble", "lavender"],
    background: { effect: "singleColor", profile: "chill", overrides: { brightness: 0.24 } },
    foreground: { effect: "wavelength", profile: "wobble" },
    mask: { effect: "energy", profile: "flow" },
  },
  {
    phase: "p4",
    order: 60,
    role: "bullet",
    label: "P4-Blender-Comet-Trails",
    mode: "crazy",
    tags: ["blender", "rapid", "comet", "bullet"],
    background: { effect: "gradient", profile: "flow" },
    foreground: { effect: "scroll", profile: "bullet", fallbackEffects: ["scan", "wavelength"] },
    mask: { effect: "energy", profile: "drive", mode: "crazy" },
    durationMs: RAPID_FLOW_SCENE_DURATION_MS,
  },
  {
    phase: "p4",
    order: 100,
    role: "exit",
    label: "P4-Blender-Night-Flow",
    mode: "crazy",
    tags: ["blender", "night", "exit"],
    background: { effect: "singleColor", profile: "chill", overrides: { brightness: 0.22 } },
    foreground: { effect: "wavelength", profile: "flow" },
    mask: { effect: "singleColor", profile: "chill", overrides: { color: "#000000", brightness: 0 } },
  },
];

function printHelp() {
  console.log(`Usage:
  node scripts/setup-dj-phases-via-mcp.js [options]

Options:
  --virtual <id-or-name>       Target one main virtual (repeatable)
  --virtuals <a,b,c>           Target multiple main virtuals
  --default-query <text>       Query used when no --virtual* is provided (default: ${DEFAULT_MAIN_QUERY})
  --profile <name>             Profile prefix for scenes/playlists/presets (default: DJPhases)
  --no-blender                 Skip blender scenes
  --strict-blender             Fail if any target lacks blender companion virtuals
  --skip-playlists             Skip playlist creation/upsert
  --dry-run                    Validate and print plan without writing
  --list-virtuals              List virtuals and exit
  --verbose                    Stream MCP server stderr
  --help                       Show this help

Examples:
  node scripts/setup-dj-phases-via-mcp.js
  node scripts/setup-dj-phases-via-mcp.js --virtual 3linematrix
  node scripts/setup-dj-phases-via-mcp.js --virtuals 3linematrix,baby --no-blender
`);
}

function parseArgs(argv) {
  const options = {
    profile: "DJPhases",
    defaultQuery: DEFAULT_MAIN_QUERY,
    virtualQueries: [],
    includeBlender: true,
    strictBlender: false,
    createPlaylists: true,
    dryRun: false,
    listVirtuals: false,
    verbose: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help") {
      options.help = true;
      continue;
    }
    if (arg === "--no-blender") {
      options.includeBlender = false;
      continue;
    }
    if (arg === "--strict-blender") {
      options.strictBlender = true;
      continue;
    }
    if (arg === "--skip-playlists") {
      options.createPlaylists = false;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--list-virtuals") {
      options.listVirtuals = true;
      continue;
    }
    if (arg === "--verbose") {
      options.verbose = true;
      continue;
    }
    if (arg === "--profile") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--profile requires a value");
      }
      options.profile = value;
      index += 1;
      continue;
    }
    if (arg === "--default-query") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--default-query requires a value");
      }
      options.defaultQuery = value;
      index += 1;
      continue;
    }
    if (arg === "--virtual") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--virtual requires a value");
      }
      options.virtualQueries.push(value);
      index += 1;
      continue;
    }
    if (arg === "--virtuals") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--virtuals requires a comma-separated value");
      }
      const values = value.split(",").map((item) => item.trim()).filter(Boolean);
      options.virtualQueries.push(...values);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function uniqueBy(array, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of array) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

function gradientFrom(colors) {
  if (colors.length === 1) {
    return `linear-gradient(90deg, ${colors[0]} 0%, ${colors[0]} 100%)`;
  }
  const stops = colors.map((color, index) => {
    const pct = Math.round((index / (colors.length - 1)) * 100);
    return `${color} ${pct}%`;
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
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
  const middle = Math.floor(colors.length / 2);
  return {
    low: colors[0],
    mid: colors[middle],
    high: colors[colors.length - 1],
  };
}

function buildPaletteName(profileSlug, phaseKey, mode) {
  return `${profileSlug}-${phaseKey}-${mode}`;
}

function effectCandidates(effectType) {
  return uniqueBy([effectType, ...(EFFECT_FALLBACKS[effectType] || [])], (item) => item);
}

function isStrobeEffect(effectType) {
  return String(effectType || "").toLowerCase().includes("strobe");
}

function effectProperties(effectSchemas, effectType) {
  return effectSchemas?.[effectType]?.schema?.properties || {};
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setSupportedValue(config, props, key, value) {
  if (props[key] && value !== undefined) {
    config[key] = value;
  }
}

function applySupportedOverrides(config, props, overrides) {
  if (!overrides || typeof overrides !== "object") {
    return;
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (props[key] && value !== undefined) {
      config[key] = value;
    }
  }
}

function resolveMotionProfile(profileName, mode) {
  if (profileName && MOTION_PROFILES[profileName]) {
    return MOTION_PROFILES[profileName];
  }
  return mode === "crazy" ? MOTION_PROFILES.hard : MOTION_PROFILES.flow;
}

function buildEffectConfig(effectType, phaseKey, mode, effectSchemas, profileSlug, options = {}) {
  const phase = PHASES[phaseKey];
  const palette = paletteFor(phaseKey, mode);
  const stops = paletteStops(palette.colors);
  const props = effectProperties(effectSchemas, effectType);
  const config = {};
  const profile = resolveMotionProfile(options.profile, mode);
  const paletteRef = `palette:${buildPaletteName(profileSlug, phaseKey, mode)}`;
  const baseSpeed = mode === "crazy" ? phase.speed + 1 : phase.speed;
  const speed = clamp(baseSpeed * profile.speedMultiplier, 0.25, 9);
  const brightness = clamp(phase.brightness + profile.brightnessDelta, 0.05, 1);

  setSupportedValue(config, props, "background_color", phase.background);
  setSupportedValue(config, props, "gradient", paletteRef);
  setSupportedValue(config, props, "color", stops.mid);
  setSupportedValue(config, props, "color_lows", stops.low);
  setSupportedValue(config, props, "color_mids", stops.mid);
  setSupportedValue(config, props, "color_high", stops.high);
  setSupportedValue(config, props, "strobe_color", stops.high);
  setSupportedValue(config, props, "mirror", profile.mirror);
  setSupportedValue(config, props, "speed", speed);
  setSupportedValue(config, props, "brightness", brightness);
  setSupportedValue(config, props, "frequency_range", profile.frequencyRange);
  setSupportedValue(config, props, "sensitivity", profile.sensitivity);

  applySupportedOverrides(config, props, options.overrides);

  return config;
}

function isCompanionVirtualId(virtualId) {
  const id = normalizeText(virtualId);
  return COMPANION_SUFFIXES.some((suffix) => id.endsWith(suffix));
}

function scoreVirtualMatch(virtual, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return -1;

  const id = normalizeText(virtual.id);
  const name = normalizeText(virtual.config?.name);
  let score = -1;

  if (id === normalizedQuery || name === normalizedQuery) {
    score = 100;
  } else if (id.startsWith(normalizedQuery) || name.startsWith(normalizedQuery)) {
    score = 80;
  } else if (id.includes(normalizedQuery) || name.includes(normalizedQuery)) {
    score = 60;
  }

  if (score < 0) return -1;
  if (!isCompanionVirtualId(id)) score += 10;
  if (virtual.active) score += 2;
  return score;
}

function resolveVirtualQuery(query, virtuals) {
  const ranked = virtuals
    .map((virtual) => ({ virtual, score: scoreVirtualMatch(virtual, query) }))
    .filter((candidate) => candidate.score >= 0)
    .sort((a, b) => b.score - a.score || String(a.virtual.id).localeCompare(String(b.virtual.id)));

  if (ranked.length === 0) {
    throw new Error(
      `No virtual matched '${query}'. Available: ${virtuals
        .map((item) => `${item.id} (${item.config?.name || item.id})`)
        .join(", ")}`
    );
  }

  if (ranked.length > 1 && ranked[0].score === ranked[1].score) {
    const top = ranked
      .filter((candidate) => candidate.score === ranked[0].score)
      .slice(0, 6)
      .map((candidate) => `${candidate.virtual.id} (${candidate.virtual.config?.name || candidate.virtual.id})`)
      .join(", ");
    throw new Error(`Ambiguous virtual query '${query}'. Top matches: ${top}`);
  }

  return ranked[0].virtual;
}

function findVirtualById(virtuals, id) {
  const normalized = normalizeText(id);
  return virtuals.find((virtual) => normalizeText(virtual.id) === normalized) || null;
}

function resolveTargetSet(mainVirtual, allVirtuals) {
  const background = findVirtualById(allVirtuals, `${mainVirtual.id}-background`);
  const foreground = findVirtualById(allVirtuals, `${mainVirtual.id}-foreground`);
  const mask = findVirtualById(allVirtuals, `${mainVirtual.id}-mask`);

  const missing = [];
  if (!background) missing.push(`${mainVirtual.id}-background`);
  if (!foreground) missing.push(`${mainVirtual.id}-foreground`);
  if (!mask) missing.push(`${mainVirtual.id}-mask`);

  return {
    main: mainVirtual,
    background,
    foreground,
    mask,
    blenderReady: missing.length === 0,
    missing,
  };
}

function buildSpawnEnv() {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      env[key] = value;
    }
  }
  return env;
}

function parseToolError(errorValue) {
  if (typeof errorValue === "string") return errorValue;
  if (errorValue && typeof errorValue === "object" && typeof errorValue.message === "string") {
    return errorValue.message;
  }
  try {
    return JSON.stringify(errorValue);
  } catch {
    return String(errorValue);
  }
}

function parseToolPayload(result, toolName) {
  const content = Array.isArray(result?.content) ? result.content : [];
  const textBlocks = content.filter((item) => item?.type === "text");
  if (textBlocks.length === 0) {
    return null;
  }

  const firstText = textBlocks[0]?.text;
  if (typeof firstText !== "string") {
    return null;
  }

  try {
    return JSON.parse(firstText);
  } catch (error) {
    throw new Error(
      `Tool '${toolName}' returned non-JSON text: ${firstText.slice(0, 300)} (${error instanceof Error ? error.message : String(error)})`
    );
  }
}

class LedfxMcpSession {
  constructor({ cwd, verbose = false }) {
    this.cwd = cwd;
    this.verbose = verbose;
    this.client = new Client(
      { name: "djphases-setup", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );
    this.transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
      cwd,
      env: buildSpawnEnv(),
      stderr: "pipe",
    });
  }

  async connect() {
    const stderr = this.transport.stderr;
    if (this.verbose && stderr) {
      stderr.on("data", (chunk) => {
        process.stderr.write(`[ledfx-mcp] ${String(chunk)}`);
      });
    }
    await this.client.connect(this.transport);
  }

  async close() {
    await this.client.close();
  }

  async call(toolName, args = {}, options = {}) {
    const result = await this.client.callTool({ name: toolName, arguments: args });
    const payload = parseToolPayload(result, toolName);

    if (!options.allowLogicalError && payload && typeof payload === "object" && !Array.isArray(payload)) {
      if (payload.ok === false) {
        throw new Error(`Tool '${toolName}' failed: ${parseToolError(payload.error)}`);
      }
      if ("error" in payload && payload.error) {
        throw new Error(`Tool '${toolName}' failed: ${parseToolError(payload.error)}`);
      }
    }

    return payload;
  }
}

function printVirtuals(virtuals) {
  console.log("Available virtuals:");
  for (const virtual of virtuals) {
    console.log(
      `- ${virtual.id} (name: ${virtual.config?.name || virtual.id}, active: ${virtual.active ? "yes" : "no"})`
    );
  }
}

function buildSceneName(profile, sceneLabel) {
  return `${profile} ${sceneLabel}`;
}

function buildSceneTags(profileSlug, phaseKey, mode, extra = []) {
  const phase = PHASES[phaseKey];
  return uniqueBy(
    ["djphases", profileSlug, phaseKey, mode, ...phase.tags, ...extra],
    (item) => item
  );
}

async function upsertPalette(session, profileSlug, phaseKey, mode, dryRun) {
  const name = buildPaletteName(profileSlug, phaseKey, mode);
  const palette = paletteFor(phaseKey, mode);
  const gradientId = `palette:${name}`;

  if (dryRun) return;
  await session.call("ledfx_upsert_color_or_gradient", {
    type: "gradient",
    id: gradientId,
    value: palette.gradient,
  });
}

async function getSceneByName(session, name) {
  const scenes = await session.call("ledfx_list_scenes", {});
  if (!Array.isArray(scenes)) {
    throw new Error("Unexpected response from ledfx_list_scenes");
  }
  return scenes.find((scene) => scene?.name === name) || null;
}

async function setEffectWithFallback({
  session,
  virtualId,
  requestedEffect,
  fallbackEffects,
  phaseKey,
  mode,
  effectSchemas,
  profileSlug,
  profile,
  dryRun,
  configOverrides,
  configCustomizer,
}) {
  const candidates = uniqueBy(
    [requestedEffect, ...(fallbackEffects || []), ...effectCandidates(requestedEffect)],
    (item) => item
  );
  let lastError = null;

  for (const candidate of candidates) {
    const effectConfig = buildEffectConfig(candidate, phaseKey, mode, effectSchemas, profileSlug, {
      profile,
      overrides: configOverrides,
    });
    if (typeof configCustomizer === "function") {
      configCustomizer(effectConfig, candidate);
    }

    if (dryRun) {
      return {
        effectType: candidate,
        effectConfig,
        fallbackUsed: candidate !== requestedEffect,
      };
    }

    try {
      await session.call("ledfx_set_effect", {
        virtual_id: virtualId,
        effect_type: candidate,
        effect_config: effectConfig,
      });
      return {
        effectType: candidate,
        effectConfig,
        fallbackUsed: candidate !== requestedEffect,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to set effect '${requestedEffect}' on '${virtualId}'. Tried: ${candidates.join(", ")}. Last error: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

async function buildSceneVirtualPayload(session, virtualIds) {
  const payload = {};
  for (const virtualId of uniqueBy(virtualIds, (id) => id)) {
    const virtual = await session.call("ledfx_get_virtual", { virtual_id: virtualId });
    const effect = virtual?.effect;
    if (!effect || !effect.type) {
      throw new Error(`Virtual '${virtualId}' has no active effect. Cannot write scene payload.`);
    }
    payload[virtualId] = {
      type: effect.type,
      config: effect.config || {},
      action: "activate",
    };
  }
  return payload;
}

async function upsertSceneByName(session, { sceneName, tags, virtualIds, dryRun }) {
  if (dryRun) {
    return `dryrun-${slugify(sceneName)}`;
  }

  const existing = await getSceneByName(session, sceneName);
  if (existing) {
    await session.call("ledfx_delete_scene", { scene_id: existing.id });
  }

  const tagsString = tags.join(",");
  await session.call("ledfx_create_scene", { name: sceneName, tags: tagsString });

  const created = await getSceneByName(session, sceneName);
  if (!created) {
    throw new Error(`Scene '${sceneName}' was not found after creation`);
  }

  const virtuals = await buildSceneVirtualPayload(session, virtualIds);
  await session.call("ledfx_update_scene", {
    scene_id: created.id,
    tags: tagsString,
    virtuals,
  });

  return created.id;
}

async function applyDirectScenes({
  session,
  profile,
  profileSlug,
  targets,
  effectSchemas,
  dryRun,
  createdScenes,
}) {
  const sceneVirtualIds = targets.map((target) => target.main.id);

  for (const spec of DIRECT_SCENE_SPECS) {
    const sceneName = buildSceneName(profile, spec.label);
    const tags = buildSceneTags(profileSlug, spec.phase, spec.mode, [
      "direct",
      spec.effect,
      ...(spec.tags || []),
    ]);
    let sceneUsesStrobe = false;
    let sceneUsesRapidFlow = spec.profile === "bullet" || (spec.tags || []).includes("rapid");

    for (const target of targets) {
      const selected = await setEffectWithFallback({
        session,
        virtualId: target.main.id,
        requestedEffect: spec.effect,
        fallbackEffects: spec.fallbackEffects,
        phaseKey: spec.phase,
        mode: spec.mode,
        effectSchemas,
        profileSlug,
        profile: spec.profile,
        dryRun,
        configOverrides: spec.overrides,
      });
      if (isStrobeEffect(selected.effectType)) {
        sceneUsesStrobe = true;
      }
      if (selected.effectType === "scroll" || selected.effectType === "scan") {
        sceneUsesRapidFlow = true;
      }
      if (selected.fallbackUsed) {
        console.log(
          `Fallback effect on ${target.main.id}: ${spec.effect} -> ${selected.effectType} (${sceneName})`
        );
      }
      if (!dryRun) {
        await session.call("ledfx_save_preset", {
          virtual_id: target.main.id,
          preset_name: slugify(`${profileSlug}-${target.main.id}-${spec.label}`),
        });
      }
    }

    const sceneId = await upsertSceneByName(session, {
      sceneName,
      tags,
      virtualIds: sceneVirtualIds,
      dryRun,
    });

    createdScenes.push({
      id: sceneId,
      name: sceneName,
      phase: spec.phase,
      kind: "direct",
      mode: spec.mode,
      role: spec.role || "statement",
      order: typeof spec.order === "number" ? spec.order : ROLE_WEIGHTS[spec.role] || 999,
      strobe: sceneUsesStrobe,
      durationMs:
        spec.durationMs
        || (sceneUsesStrobe ? STROBE_SCENE_DURATION_MS : sceneUsesRapidFlow ? RAPID_FLOW_SCENE_DURATION_MS : DEFAULT_SCENE_DURATION_MS),
    });
    console.log(`Created scene: ${sceneName}${dryRun ? " (dry-run)" : ""}`);
  }
}

async function applyBlenderScenes({
  session,
  profile,
  profileSlug,
  blenderTargets,
  effectSchemas,
  dryRun,
  createdScenes,
}) {
  const sceneVirtualIds = [];
  for (const target of blenderTargets) {
    sceneVirtualIds.push(target.main.id, target.background.id, target.foreground.id, target.mask.id);
  }

  for (const spec of BLENDER_SCENE_SPECS) {
    const sceneName = buildSceneName(profile, spec.label);
    const tags = buildSceneTags(profileSlug, spec.phase, spec.mode, ["blender", ...(spec.tags || [])]);
    let sceneUsesStrobe = false;
    let sceneUsesRapidFlow = (spec.tags || []).includes("rapid");

    for (const target of blenderTargets) {
      const backgroundSelected = await setEffectWithFallback({
        session,
        virtualId: target.background.id,
        requestedEffect: spec.background.effect,
        fallbackEffects: spec.background.fallbackEffects,
        phaseKey: spec.phase,
        mode: spec.background.mode || spec.mode,
        effectSchemas,
        profileSlug,
        profile: spec.background.profile,
        dryRun,
        configOverrides: spec.background.overrides,
        configCustomizer: (config, effectType) => {
          if (effectType === "singleColor" && !("color" in (config || {}))) {
            config.color = PHASES[spec.phase].background;
          }
          if (effectType === "singleColor" && !("brightness" in (config || {}))) {
            config.brightness = 0.3;
          }
        },
      });
      if (isStrobeEffect(backgroundSelected.effectType)) {
        sceneUsesStrobe = true;
      }
      if (backgroundSelected.effectType === "scroll" || backgroundSelected.effectType === "scan") {
        sceneUsesRapidFlow = true;
      }
      const foregroundSelected = await setEffectWithFallback({
        session,
        virtualId: target.foreground.id,
        requestedEffect: spec.foreground.effect,
        fallbackEffects: spec.foreground.fallbackEffects,
        phaseKey: spec.phase,
        mode: spec.foreground.mode || spec.mode,
        effectSchemas,
        profileSlug,
        profile: spec.foreground.profile,
        dryRun,
        configOverrides: spec.foreground.overrides,
      });
      if (isStrobeEffect(foregroundSelected.effectType)) {
        sceneUsesStrobe = true;
      }
      if (foregroundSelected.effectType === "scroll" || foregroundSelected.effectType === "scan") {
        sceneUsesRapidFlow = true;
      }
      const maskSelected = await setEffectWithFallback({
        session,
        virtualId: target.mask.id,
        requestedEffect: spec.mask.effect,
        fallbackEffects: [...(spec.mask.fallbackEffects || []), "singleColor"],
        phaseKey: spec.phase,
        mode: spec.mask.mode || "crazy",
        effectSchemas,
        profileSlug,
        profile: spec.mask.profile || "strobe",
        dryRun,
        configOverrides: spec.mask.overrides,
        configCustomizer: (config, effectType) => {
          if (effectType === "singleColor" && !("color" in (config || {}))) {
            config.color = "#000000";
          }
          if (effectType === "singleColor" && !("brightness" in (config || {}))) {
            config.brightness = 0;
          }
        },
      });
      if (isStrobeEffect(maskSelected.effectType)) {
        sceneUsesStrobe = true;
      }
      if (maskSelected.effectType === "scroll" || maskSelected.effectType === "scan") {
        sceneUsesRapidFlow = true;
      }

      if (backgroundSelected.fallbackUsed) {
        console.log(
          `Fallback blender background on ${target.background.id}: ${spec.background.effect} -> ${backgroundSelected.effectType} (${sceneName})`
        );
      }
      if (foregroundSelected.fallbackUsed) {
        console.log(
          `Fallback blender foreground on ${target.foreground.id}: ${spec.foreground.effect} -> ${foregroundSelected.effectType} (${sceneName})`
        );
      }
      if (maskSelected.fallbackUsed) {
        console.log(
          `Fallback blender mask on ${target.mask.id}: ${spec.mask.effect} -> ${maskSelected.effectType} (${sceneName})`
        );
      }

      if (!dryRun) {
        await session.call("ledfx_set_blender", {
          blender_virtual_id: target.main.id,
          background: {
            virtual_id: target.background.id,
            effect_type: backgroundSelected.effectType,
            effect_config: backgroundSelected.effectConfig,
          },
          foreground: {
            virtual_id: target.foreground.id,
            effect_type: foregroundSelected.effectType,
            effect_config: foregroundSelected.effectConfig,
          },
          mask: {
            virtual_id: target.mask.id,
            effect_type: maskSelected.effectType,
            effect_config: maskSelected.effectConfig,
          },
          blender_config: spec.blenderConfig || {},
        });
        await session.call("ledfx_save_preset", {
          virtual_id: target.main.id,
          preset_name: slugify(`${profileSlug}-${target.main.id}-${spec.label}`),
        });
      }
    }

    const sceneId = await upsertSceneByName(session, {
      sceneName,
      tags,
      virtualIds: sceneVirtualIds,
      dryRun,
    });

    createdScenes.push({
      id: sceneId,
      name: sceneName,
      phase: spec.phase,
      kind: "blender",
      mode: spec.mode,
      role: spec.role || "statement",
      order: typeof spec.order === "number" ? spec.order : ROLE_WEIGHTS[spec.role] || 999,
      strobe: sceneUsesStrobe,
      durationMs:
        spec.durationMs
        || (sceneUsesStrobe ? STROBE_SCENE_DURATION_MS : sceneUsesRapidFlow ? RAPID_FLOW_SCENE_DURATION_MS : DEFAULT_SCENE_DURATION_MS),
    });
    console.log(`Created blender scene: ${sceneName}${dryRun ? " (dry-run)" : ""}`);
  }
}

function sortScenesForPlaylist(scenes) {
  return [...scenes].sort((left, right) => {
    const leftOrder = Number.isFinite(left.order) ? left.order : 999;
    const rightOrder = Number.isFinite(right.order) ? right.order : 999;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    const leftRole = ROLE_WEIGHTS[left.role] || 999;
    const rightRole = ROLE_WEIGHTS[right.role] || 999;
    if (leftRole !== rightRole) return leftRole - rightRole;

    if (left.kind !== right.kind) {
      // Keep direct and blender interleaved naturally on tie.
      return left.kind === "direct" ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });
}

async function applySceneDurations(session, playlistId, orderedScenes) {
  for (let index = 0; index < orderedScenes.length; index += 1) {
    const durationMs = orderedScenes[index].durationMs;
    if (!durationMs || durationMs === DEFAULT_SCENE_DURATION_MS) {
      continue;
    }
    await session.call("ledfx_patch_playlist_items", {
      playlist_id: playlistId,
      operation: "replace_duration",
      index,
      duration_ms: durationMs,
    });
  }
}

async function upsertPlaylists({ session, profile, profileSlug, createdScenes, dryRun }) {
  const scenesByPhase = new Map(PHASE_ORDER.map((phase) => [phase, []]));
  const allScenes = [];

  for (const scene of createdScenes) {
    if (!scene.id) continue;
    allScenes.push(scene);
    const phaseList = scenesByPhase.get(scene.phase) || [];
    phaseList.push(scene);
    scenesByPhase.set(scene.phase, phaseList);
  }

  if (dryRun) {
    console.log("Playlists (dry-run):");
    for (const phase of PHASE_ORDER) {
      console.log(`- ${profile} ${PHASES[phase].label}: ${(scenesByPhase.get(phase) || []).length} scenes`);
    }
    console.log(`- ${profile} Full Show: ${allScenes.length} scenes`);
    return;
  }

  for (const phase of PHASE_ORDER) {
    const phaseScenes = sortScenesForPlaylist(scenesByPhase.get(phase) || []);
    if (phaseScenes.length === 0) continue;
    const phaseSceneIds = phaseScenes.map((scene) => scene.id);

    const playlistId = slugify(`${profileSlug}-${phase}`);
    await session.call("ledfx_upsert_playlist", {
      playlist_id: playlistId,
      name: `${profile} ${PHASES[phase].label}`,
      scene_ids: phaseSceneIds,
      mode: "sequence",
      default_duration_ms: DEFAULT_SCENE_DURATION_MS,
      tags: ["djphases", profileSlug, phase],
    });
    await applySceneDurations(session, playlistId, phaseScenes);
    console.log(`Upserted playlist: ${playlistId}`);
  }

  const orderedAllScenes = PHASE_ORDER.flatMap((phase) =>
    sortScenesForPlaylist((scenesByPhase.get(phase) || []).slice())
  );
  const allSceneIds = orderedAllScenes.map((scene) => scene.id);
  const allPlaylistId = slugify(`${profileSlug}-full-show`);
  await session.call("ledfx_upsert_playlist", {
    playlist_id: allPlaylistId,
    name: `${profile} Full Show`,
    scene_ids: allSceneIds,
    mode: "sequence",
    default_duration_ms: DEFAULT_SCENE_DURATION_MS,
    tags: ["djphases", profileSlug, "full"],
  });
  await applySceneDurations(session, allPlaylistId, orderedAllScenes);
  console.log(`Upserted playlist: ${allPlaylistId}`);
}

function summarizePlan({ options, targets, blenderTargets }) {
  console.log(`Profile: ${options.profile}`);
  console.log(`Main targets (${targets.length}): ${targets.map((target) => target.main.id).join(", ")}`);
  console.log(`Direct scenes: ${DIRECT_SCENE_SPECS.length}`);
  if (!options.includeBlender) {
    console.log("Blender scenes: disabled");
  } else {
    console.log(`Blender scenes: ${BLENDER_SCENE_SPECS.length} x ${blenderTargets.length} target(s)`);
  }
  console.log(`Playlists: ${options.createPlaylists ? "enabled" : "disabled"}`);
  if (options.dryRun) {
    console.log("Mode: dry-run");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, "..");

  const session = new LedfxMcpSession({ cwd: repoRoot, verbose: options.verbose });
  await session.connect();

  try {
    const virtuals = await session.call("ledfx_list_virtuals", {});
    if (!Array.isArray(virtuals)) {
      throw new Error("Unexpected response from ledfx_list_virtuals");
    }

    if (options.listVirtuals) {
      printVirtuals(virtuals);
      return;
    }

    const mainCandidates = virtuals.filter((virtual) => !isCompanionVirtualId(virtual.id));
    const queries = options.virtualQueries.length > 0
      ? options.virtualQueries
      : [options.defaultQuery];

    const mainTargets = uniqueBy(
      queries.map((query) => resolveVirtualQuery(query, mainCandidates)),
      (virtual) => virtual.id
    );
    if (mainTargets.length === 0) {
      throw new Error("No target virtuals resolved.");
    }

    const targets = mainTargets.map((mainVirtual) => resolveTargetSet(mainVirtual, virtuals));
    const blenderTargets = options.includeBlender
      ? targets.filter((target) => target.blenderReady)
      : [];

    if (options.includeBlender) {
      const missingBlender = targets.filter((target) => !target.blenderReady);
      for (const target of missingBlender) {
        console.log(
          `Blender skipped for '${target.main.id}' (missing: ${target.missing.join(", ")})`
        );
      }
      if (options.strictBlender && missingBlender.length > 0) {
        throw new Error(
          `Missing blender companions for: ${missingBlender.map((item) => item.main.id).join(", ")}`
        );
      }
    }

    summarizePlan({ options, targets, blenderTargets });

    const profileSlug = slugify(options.profile);
    for (const phase of PHASE_ORDER) {
      await upsertPalette(session, profileSlug, phase, "normal", options.dryRun);
      await upsertPalette(session, profileSlug, phase, "crazy", options.dryRun);
    }
    console.log(`Palettes prepared: ${PHASE_ORDER.length * 2}${options.dryRun ? " (dry-run)" : ""}`);

    const effectSchemas = await session.call("ledfx_get_effect_schemas", {});
    if (!effectSchemas || typeof effectSchemas !== "object") {
      throw new Error("Unexpected response from ledfx_get_effect_schemas");
    }

    const createdScenes = [];
    await applyDirectScenes({
      session,
      profile: options.profile,
      profileSlug,
      targets,
      effectSchemas,
      dryRun: options.dryRun,
      createdScenes,
    });

    if (options.includeBlender && blenderTargets.length > 0) {
      await applyBlenderScenes({
        session,
        profile: options.profile,
        profileSlug,
        blenderTargets,
        effectSchemas,
        dryRun: options.dryRun,
        createdScenes,
      });
    }

    if (options.createPlaylists) {
      await upsertPlaylists({
        session,
        profile: options.profile,
        profileSlug,
        createdScenes,
        dryRun: options.dryRun,
      });
    }

    console.log(
      `DJPhases setup complete.${options.dryRun ? " (dry-run)" : ""} Scenes: ${createdScenes.length}`
    );
  } finally {
    await session.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
