/**
 * AI Helper Module
 * 
 * Provides intelligent parsing and explanation capabilities for LedFX features
 */

export interface LedFxColorCatalog {
  colors: Record<string, string>;
  gradients: Record<string, string>;
}

/**
 * Scene description parser result
 */
export interface ParsedSceneDescription {
  sceneName: string;
  virtuals: Array<{
    virtualId?: string;
    effectType: string;
    config: Record<string, any>;
    description: string;
  }>;
  colors?: string[];
  gradient?: string;
  speed?: number;
  brightness?: number;
  tags?: string[];
}

/**
 * Effect recommendation
 */
export interface EffectRecommendation {
  effectType: string;
  config: Record<string, any>;
  reason: string;
  confidence: number;
}

/**
 * LedFX feature explanations
 */
export const FEATURE_EXPLANATIONS: Record<string, string> = {
  "virtuals": `Virtuals are logical LED strips that can span one or more physical devices. They are the primary way to organize and control your LED setup in LedFX. Effects are applied to virtuals, not directly to physical devices.`,
  
  "devices": `Devices are the physical LED hardware (like WLED controllers, ESP8266/ESP32 boards, OpenRGB devices, etc.). Devices provide the actual LEDs that will display effects, but they must be mapped to virtuals before effects can be applied.`,
  
  "effects": `Effects are visual patterns and animations that make your LEDs come alive. LedFX includes many built-in effects like rainbow, pulse, wavelength, and more. Each effect has configurable parameters like speed, color, and brightness.`,
  
  "scenes": `Scenes are saved configurations that can apply multiple effects to multiple virtuals at once. Think of them as presets for your entire LED setup. You can create a scene, save it, and activate it later to instantly recreate a specific lighting configuration.`,
  
  "presets": `Presets are saved effect configurations. Instead of manually configuring an effect each time, you can save your favorite settings as a preset and quickly apply them later. Both built-in (LedFX presets) and custom (user presets) are available.`,
  
  "audio-reactive": `Many LedFX effects are audio-reactive, meaning they respond to music and sound in real-time. The effects analyze audio input (from your system's audio device) and create visualizations that dance to the beat, change with the melody, and pulse with the bass.`,
  
  "segments": `Segments allow you to map portions of a virtual to specific ranges of LEDs on physical devices. This lets you create complex arrangements where a single virtual spans multiple devices or where multiple virtuals share the same device.`,
  
  "colors": `LedFX supports user-defined colors and gradients through the /api/colors endpoint. Colors are hex strings like #FF00FF, and gradients are CSS gradient strings like "linear-gradient(90deg, #ff0000, #0000ff)".`,
  
  "gradients": `Gradients are smooth transitions between multiple colors. Many effects can use gradients instead of single colors, creating more dynamic and visually interesting patterns.`,
  
  "brightness": `Brightness controls the overall intensity of your LED effects, from 0.0 (off) to 1.0 (maximum brightness). This is a global setting that affects all effects without changing their color or pattern.`,
  
  "speed": `Speed controls how fast an effect animates. Lower values create slow, relaxing movements while higher values create fast, energetic displays. The exact meaning varies by effect type.`,
  
  "integration": `LedFX supports integrations with other software like QLC+, Spotify, and more. Integrations allow LedFX to respond to external events, such as changing effects when a specific song plays.`,
  
  "wled": `WLED is one of the most popular firmware for ESP8266/ESP32-based LED controllers. It's highly compatible with LedFX and provides excellent performance for addressable LED strips.`,
  
  "ddp": `DDP (Distributed Display Protocol) is a network protocol used to send LED data from LedFX to devices. It's efficient and works well with WLED and other compatible controllers.`,
  
  "fps": `FPS (Frames Per Second) determines how many times per second LedFX updates your LEDs. Higher FPS creates smoother animations but requires more processing power. Default is typically 60 FPS.`,
  
  "pixel-count": `Pixel count is the number of individual LEDs in your strip or device. Accurate pixel count is essential for effects to display correctly. Each addressable LED is one pixel.`,
};

/**
 * Common effect types and their characteristics
 */
export const EFFECT_TYPES: Record<string, {
  name: string;
  category: string;
  description: string;
  commonParams: string[];
  audioReactive: boolean;
}> = {
  "rainbow": {
    name: "Rainbow",
    category: "classic",
    description: "Displays a moving rainbow pattern across your LEDs",
    commonParams: ["speed", "brightness", "mirror"],
    audioReactive: false
  },
  "pulse": {
    name: "Pulse",
    category: "audio",
    description: "Pulses to the beat of music with configurable colors",
    commonParams: ["color", "speed", "sensitivity"],
    audioReactive: true
  },
  "wavelength": {
    name: "Wavelength",
    category: "audio",
    description: "Creates wave-like patterns that respond to different frequencies",
    commonParams: ["color_lows", "color_mids", "color_high", "speed"],
    audioReactive: true
  },
  "energy": {
    name: "Energy",
    category: "audio",
    description: "Displays energy levels across the frequency spectrum",
    commonParams: ["color", "sensitivity", "blur"],
    audioReactive: true
  },
  "singleColor": {
    name: "Single Color",
    category: "static",
    description: "Displays a solid color across all LEDs",
    commonParams: ["color", "brightness"],
    audioReactive: false
  },
  "gradient": {
    name: "Gradient",
    category: "classic",
    description: "Displays a smooth color gradient",
    commonParams: ["gradient", "speed", "direction"],
    audioReactive: false
  },
  "scroll": {
    name: "Scroll",
    category: "classic",
    description: "Scrolls a pattern across your LEDs",
    commonParams: ["color", "speed", "direction"],
    audioReactive: false
  },
  "strobe": {
    name: "Strobe",
    category: "energy",
    description: "Creates a strobe light effect",
    commonParams: ["color", "frequency"],
    audioReactive: false
  },
};

/**
 * Parse natural language scene description
 */
export function parseSceneDescription(
  description: string,
  catalog: LedFxColorCatalog
): ParsedSceneDescription {
  const result: ParsedSceneDescription = {
    sceneName: "",
    virtuals: [],
  };

  // Extract scene name from first part or use description
  const nameMatch = description.match(/(?:create|make|build)\s+(?:a\s+)?(?:scene\s+)?(?:called|named)?\s*["']?([^"']+)["']?/i);
  result.sceneName = nameMatch ? nameMatch[1].trim() : `Scene from: ${description.substring(0, 30)}...`;

  // Look for effect types
  let effectType = "rainbow"; // default
  for (const [key, info] of Object.entries(EFFECT_TYPES)) {
    if (description.toLowerCase().includes(key.toLowerCase()) ||
        description.toLowerCase().includes(info.name.toLowerCase())) {
      effectType = key;
      break;
    }
  }

  // Look for colors
  const colors: string[] = [];
  for (const [name, value] of Object.entries(catalog.colors)) {
    if (description.toLowerCase().includes(name.toLowerCase())) {
      colors.push(value);
    }
  }

  // Look for gradients
  let gradient: string | undefined;
  for (const [name] of Object.entries(catalog.gradients)) {
    if (description.toLowerCase().includes(name.toLowerCase())) {
      gradient = name;
      break;
    }
  }

  // Extract speed keywords
  let speed = 50; // default
  if (/\b(slow|slowly|gentle|calm)\b/i.test(description)) {
    speed = 20;
  } else if (/\b(fast|quick|rapid|energetic)\b/i.test(description)) {
    speed = 80;
  } else if (/\b(medium|moderate)\b/i.test(description)) {
    speed = 50;
  }

  // Extract brightness keywords
  let brightness = 1.0; // default
  if (/\b(dim|dimmed|low)\b/i.test(description)) {
    brightness = 0.5;
  } else if (/\b(bright|maximum|max|full)\b/i.test(description)) {
    brightness = 1.0;
  } else if (/\b(medium)\b/i.test(description)) {
    brightness = 0.7;
  }

  // Build effect config
  const config: Record<string, any> = {
    speed,
    brightness,
  };

  // Add colors to config
  if (colors.length > 0) {
    config.color = colors[0]; // Use first color found
  }

  // Add gradient if found
  if (gradient) {
    const gradientValue = catalog.gradients[gradient];
    if (gradientValue) {
      config.gradient = gradientValue;
    }
  }

  // Create virtual configuration
  result.virtuals.push({
    effectType,
    config,
    description: `${effectType} effect with ${JSON.stringify(config)}`,
  });

  result.colors = colors;
  result.gradient = gradient;
  result.speed = speed;
  result.brightness = brightness;

  // Extract tags
  const tags: string[] = [];
  if (/\b(party|energetic|dance)\b/i.test(description)) tags.push("party");
  if (/\b(relax|calm|chill|ambient)\b/i.test(description)) tags.push("chill");
  if (/\b(work|focus|concentrate)\b/i.test(description)) tags.push("focus");
  if (/\b(romantic|mood)\b/i.test(description)) tags.push("mood");
  
  result.tags = tags;

  return result;
}

/**
 * Recommend effects based on description or mood
 */
export function recommendEffects(
  description: string,
  mood: string | undefined,
  catalog: LedFxColorCatalog
): EffectRecommendation[] {
  const recommendations: EffectRecommendation[] = [];

  // Audio-reactive recommendations
  if (/\b(music|audio|sound|beat|bass)\b/i.test(description)) {
    recommendations.push({
      effectType: "pulse",
      config: { color: "#FF00FF", sensitivity: 0.7 },
      reason: "Pulse effect responds well to music beats",
      confidence: 0.9
    });
    recommendations.push({
      effectType: "wavelength",
      config: { color_lows: "#FF0000", color_mids: "#00FF00", color_high: "#0000FF" },
      reason: "Wavelength visualizes different frequency ranges",
      confidence: 0.85
    });
  }

  // Party/energetic recommendations
  if (/\b(party|energetic|dance|club)\b/i.test(description) || mood === "party") {
    recommendations.push({
      effectType: "rainbow",
      config: { speed: 80, brightness: 1.0 },
      reason: "Fast rainbow creates energetic atmosphere",
      confidence: 0.8
    });
    recommendations.push({
      effectType: "strobe",
      config: { color: "#FFFFFF", frequency: 10 },
      reason: "Strobe effect adds excitement",
      confidence: 0.7
    });
  }

  // Calm/relaxing recommendations
  if (/\b(relax|calm|chill|ambient|sleep)\b/i.test(description) || mood === "chill") {
    const oceanGradient = catalog.gradients["ocean"];
    if (oceanGradient) {
      recommendations.push({
        effectType: "gradient",
        config: { gradient: oceanGradient, speed: 20 },
        reason: "Slow ocean gradient creates calming atmosphere",
        confidence: 0.85
      });
    }
    recommendations.push({
      effectType: "singleColor",
      config: { color: "#4B0082", brightness: 0.5 },
      reason: "Dim indigo promotes relaxation",
      confidence: 0.75
    });
  }

  // If no specific recommendations, add defaults
  if (recommendations.length === 0) {
    recommendations.push({
      effectType: "rainbow",
      config: { speed: 50, brightness: 0.8 },
      reason: "Rainbow is a versatile, visually appealing default",
      confidence: 0.6
    });
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Explain a specific LedFX feature
 */
export function explainFeature(feature: string): string {
  const normalized = feature.toLowerCase().replace(/\s+/g, "-");
  
  // Check exact match
  if (FEATURE_EXPLANATIONS[normalized]) {
    return FEATURE_EXPLANATIONS[normalized];
  }

  // Check partial matches
  for (const [key, explanation] of Object.entries(FEATURE_EXPLANATIONS)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return explanation;
    }
  }

  // Check if it's an effect type
  if (EFFECT_TYPES[normalized]) {
    const effect = EFFECT_TYPES[normalized];
    return `${effect.name}: ${effect.description}. Category: ${effect.category}. ${
      effect.audioReactive ? "This effect is audio-reactive." : "This effect is not audio-reactive."
    } Common parameters: ${effect.commonParams.join(", ")}.`;
  }

  return `I don't have specific information about "${feature}". LedFX has many features including: ${
    Object.keys(FEATURE_EXPLANATIONS).slice(0, 5).join(", ")
  }, and more. Try asking about one of these, or visit https://docs.ledfx.app/ for comprehensive documentation.`;
}

/**
 * Get all feature categories
 */
export function getFeatureCategories(): Record<string, string[]> {
  return {
    "Core Concepts": ["virtuals", "devices", "effects", "scenes", "presets"],
    "Audio Features": ["audio-reactive", "integration"],
    "Visual Elements": ["colors", "gradients", "brightness", "speed"],
    "Technical": ["wled", "ddp", "fps", "pixel-count", "segments"],
  };
}

/**
 * Get effect categories
 */
export function getEffectCategories(): Record<string, string[]> {
  const categories: Record<string, string[]> = {};
  
  for (const [key, info] of Object.entries(EFFECT_TYPES)) {
    if (!categories[info.category]) {
      categories[info.category] = [];
    }
    categories[info.category].push(key);
  }
  
  return categories;
}
