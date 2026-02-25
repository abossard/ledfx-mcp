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
 * Common effect types and their characteristics.
 * Derived from LedFX source CATEGORY values and AudioReactiveEffect base class analysis.
 *
 * Categories (from LedFX source):
 *   "BPM"          - beat-locked, tempo-driven
 *   "Classic"      - direct audio-reactive, frequency visualization
 *   "Atmospheric"  - flowing, texture-based, audio-modulated
 *   "Simple"       - minimal config, direct reactivity
 *   "2D"           - 1D audio-reactive (misleading name in LedFX)
 *   "Matrix"       - requires 2D virtual / matrix display (all AudioReactive via Twod)
 *   "Non-Reactive" - no audio response (ambient / static)
 *   "Diagnostic"   - dev/utility effects
 */
export const EFFECT_TYPES: Record<string, {
  name: string;
  category: string;
  description: string;
  commonParams: string[];
  audioReactive: boolean;
  hasGradient: boolean;
  is2D: boolean;
  blenderRoles: string[];
}> = {
  // ── BPM ────────────────────────────────────────────────────────────────────
  "bar": {
    name: "Bar", category: "BPM",
    description: "Beat-locked bar sweep across the strip",
    commonParams: ["gradient", "beat_offset", "beat_skip", "mode"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  "multiBar": {
    name: "Multicolor Bar", category: "BPM",
    description: "Multiple colored bars sweeping on beat",
    commonParams: ["gradient", "mode", "ease_method"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  "strobe": {
    name: "BPM Strobe", category: "BPM",
    description: "Beat-locked strobe flash",
    commonParams: ["gradient", "strobe_color", "strobe_width"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask"],
  },
  // ── Classic ────────────────────────────────────────────────────────────────
  "bands": {
    name: "Bands", category: "Classic",
    description: "Per-band columns driven by melbank frequency analysis",
    commonParams: ["gradient", "band_count", "align"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  "bands_matrix": {
    name: "Bands Matrix", category: "Classic",
    description: "Melbank frequency bands displayed on a 2D matrix",
    commonParams: ["gradient", "band_count"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground"],
  },
  "blade_power_plus": {
    name: "Blade Power+", category: "Classic",
    description: "Sharp frequency spike effect",
    commonParams: ["frequency_range", "multiplier", "decay"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["foreground", "mask"],
  },
  "energy": {
    name: "Energy", category: "Classic",
    description: "Three-band color zone reactivity (lows/mids/highs). Best all-round mask.",
    commonParams: ["color_lows", "color_mids", "color_high", "sensitivity", "mixing_mode"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  "equalizer": {
    name: "Equalizer", category: "Classic",
    description: "Full-spectrum EQ bar graph",
    commonParams: ["gradient", "align", "gradient_repeat"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  "filter": {
    name: "Filter", category: "Classic",
    description: "Frequency-filtered color roll",
    commonParams: ["frequency_range", "roll_speed", "boost", "gradient"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  "magnitude": {
    name: "Magnitude", category: "Classic",
    description: "Single frequency band power meter",
    commonParams: ["frequency_range", "gradient"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask"],
  },
  "pitchSpectrum": {
    name: "Pitch Spectrum", category: "Classic",
    description: "MIDI pitch-mapped spectrum visualizer",
    commonParams: ["gradient", "responsiveness", "fade_rate"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  "power": {
    name: "Power", category: "Classic",
    description: "Bass-driven sparks and glow",
    commonParams: ["gradient", "bass_decay_rate", "sparks_color", "sparks_decay_rate"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["foreground"],
  },
  "rain": {
    name: "Rain", category: "Classic",
    description: "Audio droplets per frequency band",
    commonParams: ["lows_color", "mids_color", "high_color", "lows_sensitivity"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["foreground", "mask"],
  },
  "real_strobe": {
    name: "Strobe", category: "Classic",
    description: "Audio-triggered strobe, softer than BPM strobe",
    commonParams: ["gradient", "strobe_color", "strobe_rate", "strobe_decay_rate"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask"],
  },
  "scan": {
    name: "Scan", category: "Classic",
    description: "Frequency-driven scanner beam",
    commonParams: ["frequency_range", "gradient", "bounce", "speed"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["foreground", "mask"],
  },
  "scan_and_flare": {
    name: "Scan and Flare", category: "Classic",
    description: "Scanner with burst flare on beat",
    commonParams: ["frequency_range", "gradient"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["foreground"],
  },
  "scan_multi": {
    name: "Scan Multi", category: "Classic",
    description: "Multiple simultaneous scanner beams",
    commonParams: ["gradient", "speed"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["foreground"],
  },
  "scroll": {
    name: "Scroll", category: "Classic",
    description: "3-band color scroll. Classic and reliable mask.",
    commonParams: ["color_lows", "color_mids", "color_high", "speed", "decay", "threshold"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  "scroll_plus": {
    name: "Scroll+", category: "Classic",
    description: "Improved scroll with per-second speed control",
    commonParams: ["color_lows", "color_mids", "color_high", "scroll_per_sec", "decay_per_sec"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  "spectrum": {
    name: "Spectrum", category: "Classic",
    description: "Full-spectrum RGB mix, no config needed",
    commonParams: ["rgb_mix"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["mask"],
  },
  "wavelength": {
    name: "Wavelength", category: "Classic",
    description: "Melbank mapped to gradient. Simple and effective mask.",
    commonParams: ["gradient", "blur"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  // ── Atmospheric ────────────────────────────────────────────────────────────
  "block_reflections": {
    name: "Block Reflections", category: "Atmospheric",
    description: "Slow audio-textured reflecting blocks",
    commonParams: ["reactivity", "speed"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["background", "foreground"],
  },
  "crawler": {
    name: "Crawler", category: "Atmospheric",
    description: "Audio-reactive crawler motion",
    commonParams: ["reactivity", "speed", "chop", "sway"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["foreground"],
  },
  "energy2": {
    name: "Energy 2", category: "Atmospheric",
    description: "Smoother energy bands, good primary visual",
    commonParams: ["reactivity", "speed"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["foreground"],
  },
  "fire": {
    name: "Fire", category: "Atmospheric",
    description: "Ambient flame; not strongly reactive but visually rich",
    commonParams: ["speed", "intensity", "fade_chance", "gradient"],
    audioReactive: true, hasGradient: true, is2D: false,
    blenderRoles: ["background", "foreground"],
  },
  "glitch": {
    name: "Glitch", category: "Atmospheric",
    description: "Audio-reactive color glitch effect",
    commonParams: ["reactivity", "speed", "saturation_threshold"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["foreground", "mask"],
  },
  "lava_lamp": {
    name: "Lava lamp", category: "Atmospheric",
    description: "Bubbly lava motion, audio-modulated",
    commonParams: ["reactivity", "speed", "contrast"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["background", "foreground"],
  },
  "marching": {
    name: "Marching", category: "Atmospheric",
    description: "Marching gradient pulses",
    commonParams: ["reactivity", "speed"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["foreground"],
  },
  "melt": {
    name: "Melt", category: "Atmospheric",
    description: "Melting color effect, pairs well with reactive mask",
    commonParams: ["reactivity", "speed"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["foreground"],
  },
  "melt_and_sparkle": {
    name: "Melt and Sparkle", category: "Atmospheric",
    description: "Melt with audio-driven sparkle bursts",
    commonParams: ["reactivity", "speed", "strobe_threshold", "strobe_blur"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["foreground"],
  },
  "water": {
    name: "Water", category: "Atmospheric",
    description: "Ripple droplets per frequency band (bass/mids/highs)",
    commonParams: ["bass_size", "mids_size", "high_size", "viscosity"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["foreground"],
  },
  // ── Simple ─────────────────────────────────────────────────────────────────
  "hierarchy": {
    name: "Hierarchy", category: "Simple",
    description: "Layered frequency color zones; very clean mask",
    commonParams: ["color_lows", "color_mids", "color_high", "threshold_lows", "threshold_mids"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["mask", "foreground"],
  },
  // ── Matrix (2D, all AudioReactive via Twod base) ───────────────────────────
  "bleep": {
    name: "Bleep", category: "Matrix",
    description: "Rolling spectrogram display (frequency_range driven)",
    commonParams: ["frequency_range", "gradient", "scroll_time"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground"],
  },
  "concentric": {
    name: "Concentric", category: "Matrix",
    description: "Beat-expanding concentric rings",
    commonParams: ["frequency_range", "gradient", "idle_speed"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground"],
  },
  "digitalrain2d": {
    name: "Digital Rain", category: "Matrix",
    description: "Matrix rain; audio modulates intensity via impulse_decay",
    commonParams: ["gradient", "count", "tail", "impulse_decay"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground", "background"],
  },
  "equalizer2d": {
    name: "Equalizer2d", category: "Matrix",
    description: "Full EQ bar graph on 2D matrix",
    commonParams: ["gradient", "bands", "frequency_range"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground"],
  },
  "flame2d": {
    name: "Flame", category: "Matrix",
    description: "2D flame; height driven by bass/mid/high energy",
    commonParams: ["low_band", "mid_band", "high_band", "intensity", "velocity"],
    audioReactive: true, hasGradient: false, is2D: true,
    blenderRoles: ["foreground", "background"],
  },
  "game_of_life": {
    name: "Game of Life", category: "Matrix",
    description: "Conway's Game of Life with beat-injected cells",
    commonParams: ["base_game_speed", "beat_inject", "frequency_range"],
    audioReactive: true, hasGradient: false, is2D: true,
    blenderRoles: ["foreground"],
  },
  "gifplayer": {
    name: "GIF Player", category: "Matrix",
    description: "Plays an animated GIF. No audio reactivity.",
    commonParams: ["image_location", "gif_fps", "bounce"],
    audioReactive: false, hasGradient: false, is2D: true,
    blenderRoles: ["background", "foreground"],
  },
  "imagespin": {
    name: "Image", category: "Matrix",
    description: "Image that spins; frequency controls rotation speed",
    commonParams: ["frequency_range", "multiplier", "spin", "image_source"],
    audioReactive: true, hasGradient: false, is2D: true,
    blenderRoles: ["foreground"],
  },
  "keybeat2d": {
    name: "Keybeat2d", category: "Matrix",
    description: "Beat-timed image/animation playback",
    commonParams: ["beat_frames", "image_location", "ping_pong"],
    audioReactive: true, hasGradient: false, is2D: true,
    blenderRoles: ["foreground"],
  },
  "noise2d": {
    name: "Noise", category: "Matrix",
    description: "Perlin noise; audio modulates via impulse_decay",
    commonParams: ["gradient", "speed", "intensity", "zoom", "impulse_decay"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["background", "foreground"],
  },
  "plasma2d": {
    name: "Plasma2d", category: "Matrix",
    description: "Plasma animated by frequency range",
    commonParams: ["frequency_range", "gradient", "density", "twist"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground", "background"],
  },
  "plasmawled": {
    name: "PlasmaWled2d", category: "Matrix",
    description: "WLED-style plasma with audio frequency modulation",
    commonParams: ["frequency_range", "gradient", "speed", "size_multiplication"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground", "background"],
  },
  "radial": {
    name: "Radial", category: "Matrix",
    description: "Radial frequency visualizer (polygon/star shapes)",
    commonParams: ["frequency_range", "polygon", "star", "rotation"],
    audioReactive: true, hasGradient: false, is2D: true,
    blenderRoles: ["foreground"],
  },
  "soap2d": {
    name: "Soap", category: "Matrix",
    description: "Soap bubble simulation driven by frequency",
    commonParams: ["frequency_range", "gradient", "speed"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground"],
  },
  "texter2d": {
    name: "Texter", category: "Matrix",
    description: "Scrolling text; audio modulates via impulse_decay",
    commonParams: ["text", "gradient", "text_effect", "speed_option_1"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground"],
  },
  "waterfall2d": {
    name: "Waterfall", category: "Matrix",
    description: "Classic audio waterfall spectrogram",
    commonParams: ["gradient", "drop_secs", "bands", "fade_out"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: ["foreground"],
  },
  "clone": {
    name: "Clone", category: "Matrix",
    description: "Clones pixels from another virtual. No audio reactivity.",
    commonParams: ["screen", "width", "height"],
    audioReactive: false, hasGradient: false, is2D: true,
    blenderRoles: ["background", "foreground"],
  },
  // ── Non-Reactive ───────────────────────────────────────────────────────────
  "fade": {
    name: "Fade", category: "Non-Reactive",
    description: "Slow color cycling through a gradient. Ideal background.",
    commonParams: ["gradient", "speed"],
    audioReactive: false, hasGradient: true, is2D: false,
    blenderRoles: ["background"],
  },
  "gradient": {
    name: "Gradient", category: "Non-Reactive",
    description: "Scrolling color gradient. Best background effect.",
    commonParams: ["gradient", "gradient_roll", "speed"],
    audioReactive: false, hasGradient: true, is2D: false,
    blenderRoles: ["background"],
  },
  "rainbow": {
    name: "Rainbow", category: "Non-Reactive",
    description: "Classic rolling rainbow. Background use only.",
    commonParams: ["speed", "frequency", "brightness"],
    audioReactive: false, hasGradient: false, is2D: false,
    blenderRoles: ["background"],
  },
  "random_flash": {
    name: "Random Flash", category: "Non-Reactive",
    description: "Random sparkle/lightning flashes at configurable rate",
    commonParams: ["speed", "hit_probability_per_sec", "hit_color", "hit_duration"],
    audioReactive: false, hasGradient: false, is2D: false,
    blenderRoles: ["background", "foreground"],
  },
  "singleColor": {
    name: "Single Color", category: "Non-Reactive",
    description: "Solid color across all LEDs. Pure background base.",
    commonParams: ["color", "brightness"],
    audioReactive: false, hasGradient: false, is2D: false,
    blenderRoles: ["background"],
  },
  // ── Diagnostic ─────────────────────────────────────────────────────────────
  "metro": {
    name: "Metro", category: "Diagnostic",
    description: "Metronome pulse display (dev/diagnostic tool)",
    commonParams: ["pulse_period", "flash_color"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: [],
  },
  "vumeter": {
    name: "VuMeter", category: "Diagnostic",
    description: "Volume meter; can serve as subtle mask",
    commonParams: ["peak_decay", "color_min", "color_max", "color_peak"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: ["mask"],
  },
  "pixels": {
    name: "Pixels", category: "Diagnostic",
    description: "Random pixel sparkle (non-reactive)",
    commonParams: ["speed", "pixel_color", "pixels"],
    audioReactive: false, hasGradient: false, is2D: false,
    blenderRoles: ["background"],
  },
  "number": {
    name: "Number", category: "Diagnostic",
    description: "Numeric overlay display (diagnostic)",
    commonParams: ["value_source", "gradient"],
    audioReactive: true, hasGradient: true, is2D: true,
    blenderRoles: [],
  },
  // ── Special ────────────────────────────────────────────────────────────────
  "blender": {
    name: "Blender", category: "Matrix",
    description: "Meta-effect: combines background + foreground using a mask. Do not nest.",
    commonParams: ["background", "foreground", "mask", "invert_mask", "mask_cutoff"],
    audioReactive: true, hasGradient: false, is2D: false,
    blenderRoles: [],
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

/**
 * Get effects suitable for a specific blender role.
 * Calculation: filters EFFECT_TYPES by blenderRoles membership.
 */
export function getEffectsForBlenderRole(role: "background" | "foreground" | "mask"): Array<{
  id: string;
  name: string;
  category: string;
  audioReactive: boolean;
  hasGradient: boolean;
  is2D: boolean;
}> {
  return Object.entries(EFFECT_TYPES)
    .filter(([, info]) => info.blenderRoles.includes(role))
    .map(([id, info]) => ({
      id,
      name: info.name,
      category: info.category,
      audioReactive: info.audioReactive,
      hasGradient: info.hasGradient,
      is2D: info.is2D,
    }));
}

/**
 * Get audio-reactive effects only.
 * Calculation: filters EFFECT_TYPES by audioReactive flag.
 */
export function getAudioReactiveEffects(): string[] {
  return Object.entries(EFFECT_TYPES)
    .filter(([, info]) => info.audioReactive)
    .map(([id]) => id);
}

/**
 * Get non-reactive effects (safe for blender background only).
 * Calculation: filters EFFECT_TYPES by !audioReactive.
 */
export function getNonReactiveEffects(): string[] {
  return Object.entries(EFFECT_TYPES)
    .filter(([, info]) => !info.audioReactive)
    .map(([id]) => id);
}
