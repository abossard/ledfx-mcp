/**
 * Color Library
 * 
 * Comprehensive collection of named colors, gradients, and color utilities
 * for LedFX MCP server.
 */

export interface NamedColor {
  name: string;
  hex: string;
  rgb: [number, number, number];
  category: string;
}

export interface Gradient {
  name: string;
  colors: string[];
  category: string;
  description?: string;
}

/**
 * Comprehensive named colors library
 */
export const NAMED_COLORS: Record<string, NamedColor> = {
  // Basic colors
  "black": { name: "black", hex: "#000000", rgb: [0, 0, 0], category: "basic" },
  "white": { name: "white", hex: "#FFFFFF", rgb: [255, 255, 255], category: "basic" },
  "red": { name: "red", hex: "#FF0000", rgb: [255, 0, 0], category: "basic" },
  "green": { name: "green", hex: "#00FF00", rgb: [0, 255, 0], category: "basic" },
  "blue": { name: "blue", hex: "#0000FF", rgb: [0, 0, 255], category: "basic" },
  "yellow": { name: "yellow", hex: "#FFFF00", rgb: [255, 255, 0], category: "basic" },
  "cyan": { name: "cyan", hex: "#00FFFF", rgb: [0, 255, 255], category: "basic" },
  "magenta": { name: "magenta", hex: "#FF00FF", rgb: [255, 0, 255], category: "basic" },
  
  // Extended colors
  "orange": { name: "orange", hex: "#FFA500", rgb: [255, 165, 0], category: "extended" },
  "purple": { name: "purple", hex: "#800080", rgb: [128, 0, 128], category: "extended" },
  "pink": { name: "pink", hex: "#FFC0CB", rgb: [255, 192, 203], category: "extended" },
  "brown": { name: "brown", hex: "#A52A2A", rgb: [165, 42, 42], category: "extended" },
  "gray": { name: "gray", hex: "#808080", rgb: [128, 128, 128], category: "extended" },
  "silver": { name: "silver", hex: "#C0C0C0", rgb: [192, 192, 192], category: "extended" },
  "gold": { name: "gold", hex: "#FFD700", rgb: [255, 215, 0], category: "extended" },
  
  // Vivid colors
  "crimson": { name: "crimson", hex: "#DC143C", rgb: [220, 20, 60], category: "vivid" },
  "scarlet": { name: "scarlet", hex: "#FF2400", rgb: [255, 36, 0], category: "vivid" },
  "vermillion": { name: "vermillion", hex: "#E34234", rgb: [227, 66, 52], category: "vivid" },
  "coral": { name: "coral", hex: "#FF7F50", rgb: [255, 127, 80], category: "vivid" },
  "salmon": { name: "salmon", hex: "#FA8072", rgb: [250, 128, 114], category: "vivid" },
  "peach": { name: "peach", hex: "#FFE5B4", rgb: [255, 229, 180], category: "vivid" },
  "amber": { name: "amber", hex: "#FFBF00", rgb: [255, 191, 0], category: "vivid" },
  "lime": { name: "lime", hex: "#00FF00", rgb: [0, 255, 0], category: "vivid" },
  "emerald": { name: "emerald", hex: "#50C878", rgb: [80, 200, 120], category: "vivid" },
  "jade": { name: "jade", hex: "#00A86B", rgb: [0, 168, 107], category: "vivid" },
  "turquoise": { name: "turquoise", hex: "#40E0D0", rgb: [64, 224, 208], category: "vivid" },
  "teal": { name: "teal", hex: "#008080", rgb: [0, 128, 128], category: "vivid" },
  "aqua": { name: "aqua", hex: "#00FFFF", rgb: [0, 255, 255], category: "vivid" },
  "sky": { name: "sky", hex: "#87CEEB", rgb: [135, 206, 235], category: "vivid" },
  "azure": { name: "azure", hex: "#007FFF", rgb: [0, 127, 255], category: "vivid" },
  "sapphire": { name: "sapphire", hex: "#0F52BA", rgb: [15, 82, 186], category: "vivid" },
  "cobalt": { name: "cobalt", hex: "#0047AB", rgb: [0, 71, 171], category: "vivid" },
  "navy": { name: "navy", hex: "#000080", rgb: [0, 0, 128], category: "vivid" },
  "indigo": { name: "indigo", hex: "#4B0082", rgb: [75, 0, 130], category: "vivid" },
  "violet": { name: "violet", hex: "#8F00FF", rgb: [143, 0, 255], category: "vivid" },
  "lavender": { name: "lavender", hex: "#E6E6FA", rgb: [230, 230, 250], category: "vivid" },
  "plum": { name: "plum", hex: "#8E4585", rgb: [142, 69, 133], category: "vivid" },
  "rose": { name: "rose", hex: "#FF007F", rgb: [255, 0, 127], category: "vivid" },
  "burgundy": { name: "burgundy", hex: "#800020", rgb: [128, 0, 32], category: "vivid" },
  "maroon": { name: "maroon", hex: "#800000", rgb: [128, 0, 0], category: "vivid" },
  
  // Pastel colors
  "pastel-pink": { name: "pastel-pink", hex: "#FFD1DC", rgb: [255, 209, 220], category: "pastel" },
  "pastel-blue": { name: "pastel-blue", hex: "#AEC6CF", rgb: [174, 198, 207], category: "pastel" },
  "pastel-green": { name: "pastel-green", hex: "#77DD77", rgb: [119, 221, 119], category: "pastel" },
  "pastel-yellow": { name: "pastel-yellow", hex: "#FDFD96", rgb: [253, 253, 150], category: "pastel" },
  "pastel-purple": { name: "pastel-purple", hex: "#B19CD9", rgb: [177, 156, 217], category: "pastel" },
  "pastel-orange": { name: "pastel-orange", hex: "#FFB347", rgb: [255, 179, 71], category: "pastel" },
  
  // Neon colors
  "neon-pink": { name: "neon-pink", hex: "#FF10F0", rgb: [255, 16, 240], category: "neon" },
  "neon-green": { name: "neon-green", hex: "#39FF14", rgb: [57, 255, 20], category: "neon" },
  "neon-blue": { name: "neon-blue", hex: "#1B03A3", rgb: [27, 3, 163], category: "neon" },
  "neon-yellow": { name: "neon-yellow", hex: "#FFFF00", rgb: [255, 255, 0], category: "neon" },
  "neon-orange": { name: "neon-orange", hex: "#FF6600", rgb: [255, 102, 0], category: "neon" },
  "neon-purple": { name: "neon-purple", hex: "#BC13FE", rgb: [188, 19, 254], category: "neon" },
};

/**
 * Common gradients library
 */
export const GRADIENTS: Record<string, Gradient> = {
  "rainbow": {
    name: "rainbow",
    colors: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"],
    category: "classic",
    description: "Classic rainbow gradient"
  },
  "sunset": {
    name: "sunset",
    colors: ["#FF6B6B", "#FF8E53", "#FFA94D", "#FFD93D", "#FFE66D"],
    category: "nature",
    description: "Warm sunset colors"
  },
  "ocean": {
    name: "ocean",
    colors: ["#003973", "#0066CC", "#0099FF", "#00CCFF", "#00FFFF"],
    category: "nature",
    description: "Deep ocean to turquoise"
  },
  "forest": {
    name: "forest",
    colors: ["#0B5345", "#186A3B", "#239B56", "#52BE80", "#7DCEA0"],
    category: "nature",
    description: "Forest greens"
  },
  "fire": {
    name: "fire",
    colors: ["#8B0000", "#B22222", "#DC143C", "#FF4500", "#FF6347", "#FFA500", "#FFD700"],
    category: "energy",
    description: "Burning fire gradient"
  },
  "ice": {
    name: "ice",
    colors: ["#E0F2F7", "#B3E5FC", "#81D4FA", "#4FC3F7", "#29B6F6"],
    category: "cool",
    description: "Icy blue gradient"
  },
  "aurora": {
    name: "aurora",
    colors: ["#00FF87", "#60EFFF", "#00D4FF", "#7B68EE", "#FF1493"],
    category: "cosmic",
    description: "Aurora borealis colors"
  },
  "galaxy": {
    name: "galaxy",
    colors: ["#000428", "#004e92", "#663399", "#9B59B6", "#E74C3C"],
    category: "cosmic",
    description: "Deep space galaxy"
  },
  "candy": {
    name: "candy",
    colors: ["#FF6B9D", "#FFC1E3", "#FFF5BA", "#C7CEEA", "#B5EAD7"],
    category: "sweet",
    description: "Sweet candy colors"
  },
  "tropical": {
    name: "tropical",
    colors: ["#FF6B6B", "#FFE66D", "#4ECDC4", "#44A08D", "#FF6B9D"],
    category: "nature",
    description: "Tropical paradise"
  },
  "cyber": {
    name: "cyber",
    colors: ["#FF00FF", "#00FFFF", "#FF0080", "#0080FF", "#8000FF"],
    category: "tech",
    description: "Cyberpunk neon"
  },
  "lava": {
    name: "lava",
    colors: ["#1a1a1a", "#8B0000", "#FF4500", "#FF6347", "#FFA500"],
    category: "energy",
    description: "Molten lava flow"
  },
  "spring": {
    name: "spring",
    colors: ["#FFB6C1", "#FFD1DC", "#FFF68F", "#90EE90", "#87CEEB"],
    category: "nature",
    description: "Spring blooms"
  },
  "autumn": {
    name: "autumn",
    colors: ["#8B4513", "#A0522D", "#CD853F", "#D2691E", "#FF8C00"],
    category: "nature",
    description: "Autumn leaves"
  },
  "neon-nights": {
    name: "neon-nights",
    colors: ["#FF10F0", "#39FF14", "#1B03A3", "#FFFF00", "#FF6600"],
    category: "tech",
    description: "Vibrant neon lights"
  },
};

/**
 * Color utility functions (calculations - pure functions)
 */

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b]
    .map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
}

/**
 * Find color by name (case-insensitive)
 */
export function findColor(name: string): NamedColor | null {
  const normalized = name.toLowerCase().replace(/\s+/g, "-");
  return NAMED_COLORS[normalized] || null;
}

/**
 * Get all colors in a category
 */
export function getColorsByCategory(category: string): NamedColor[] {
  return Object.values(NAMED_COLORS).filter(c => c.category === category);
}

/**
 * Find gradient by name
 */
export function findGradient(name: string): Gradient | null {
  const normalized = name.toLowerCase().replace(/\s+/g, "-");
  return GRADIENTS[normalized] || null;
}

/**
 * Get all gradients in a category
 */
export function getGradientsByCategory(category: string): Gradient[] {
  return Object.values(GRADIENTS).filter(g => g.category === category);
}

/**
 * Blend two colors
 */
export function blendColors(
  color1: string,
  color2: string,
  ratio: number = 0.5
): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error("Invalid color format");
  }
  
  const r = Math.round(rgb1[0] * (1 - ratio) + rgb2[0] * ratio);
  const g = Math.round(rgb1[1] * (1 - ratio) + rgb2[1] * ratio);
  const b = Math.round(rgb1[2] * (1 - ratio) + rgb2[2] * ratio);
  
  return rgbToHex(r, g, b);
}

/**
 * Create a gradient between multiple colors
 */
export function createGradient(colors: string[], steps: number): string[] {
  if (colors.length < 2) {
    return colors;
  }
  
  const gradient: string[] = [];
  const sectionCount = colors.length - 1;

  // If steps is not positive, fall back to a minimal gradient of endpoints
  if (steps <= 0) {
    gradient.push(colors[0], colors[colors.length - 1]);
    return gradient;
  }

  // Ensure we have at least one step per section to avoid division by zero
  const totalSteps = Math.max(steps, sectionCount);
  const baseStepsPerSection = Math.floor(totalSteps / sectionCount);
  const remainder = totalSteps % sectionCount;

  for (let i = 0; i < sectionCount; i++) {
    const sectionSteps = baseStepsPerSection + (i < remainder ? 1 : 0);

    // sectionSteps is guaranteed to be at least 1, so this division is safe
    for (let j = 0; j < sectionSteps; j++) {
      const ratio = j / sectionSteps;
      gradient.push(blendColors(colors[i], colors[i + 1], ratio));
    }
  }

  gradient.push(colors[colors.length - 1]);
  return gradient;
}

/**
 * Get color categories
 */
export function getColorCategories(): string[] {
  const categories = new Set<string>();
  Object.values(NAMED_COLORS).forEach(c => categories.add(c.category));
  return Array.from(categories).sort();
}

/**
 * Get gradient categories
 */
export function getGradientCategories(): string[] {
  const categories = new Set<string>();
  Object.values(GRADIENTS).forEach(g => categories.add(g.category));
  return Array.from(categories).sort();
}
