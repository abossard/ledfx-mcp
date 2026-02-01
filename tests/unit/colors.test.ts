/**
 * Unit tests for color library
 */

import { describe, expect, test } from '@jest/globals';
import {
  NAMED_COLORS,
  GRADIENTS,
  hexToRgb,
  rgbToHex,
  findColor,
  findGradient,
  blendColors,
  getColorCategories,
  getGradientCategories,
} from '../../src/colors.js';

describe('Color Library', () => {
  describe('Named Colors', () => {
    test('should have at least 40 named colors', () => {
      const colorCount = Object.keys(NAMED_COLORS).length;
      expect(colorCount).toBeGreaterThanOrEqual(40);
    });

    test('should have basic colors', () => {
      expect(NAMED_COLORS['red']).toBeDefined();
      expect(NAMED_COLORS['green']).toBeDefined();
      expect(NAMED_COLORS['blue']).toBeDefined();
      expect(NAMED_COLORS['white']).toBeDefined();
      expect(NAMED_COLORS['black']).toBeDefined();
    });

    test('should have correct structure', () => {
      const red = NAMED_COLORS['red'];
      expect(red).toHaveProperty('name');
      expect(red).toHaveProperty('hex');
      expect(red).toHaveProperty('rgb');
      expect(red).toHaveProperty('category');
      expect(red.rgb).toHaveLength(3);
    });

    test('should have neon colors', () => {
      expect(NAMED_COLORS['neon-pink']).toBeDefined();
      expect(NAMED_COLORS['neon-green']).toBeDefined();
      expect(NAMED_COLORS['neon-pink'].category).toBe('neon');
    });
  });

  describe('Gradients', () => {
    test('should have at least 10 gradients', () => {
      const gradientCount = Object.keys(GRADIENTS).length;
      expect(gradientCount).toBeGreaterThanOrEqual(10);
    });

    test('should have nature gradients', () => {
      expect(GRADIENTS['sunset']).toBeDefined();
      expect(GRADIENTS['ocean']).toBeDefined();
      expect(GRADIENTS['forest']).toBeDefined();
    });

    test('should have correct structure', () => {
      const rainbow = GRADIENTS['rainbow'];
      expect(rainbow).toHaveProperty('name');
      expect(rainbow).toHaveProperty('colors');
      expect(rainbow).toHaveProperty('category');
      expect(Array.isArray(rainbow.colors)).toBe(true);
      expect(rainbow.colors.length).toBeGreaterThan(0);
    });
  });

  describe('Color Utilities', () => {
    test('hexToRgb should convert correctly', () => {
      expect(hexToRgb('#FF0000')).toEqual([255, 0, 0]);
      expect(hexToRgb('#00FF00')).toEqual([0, 255, 0]);
      expect(hexToRgb('#0000FF')).toEqual([0, 0, 255]);
      expect(hexToRgb('#FFFFFF')).toEqual([255, 255, 255]);
      expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    });

    test('rgbToHex should convert correctly', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
    });

    test('findColor should find colors case-insensitively', () => {
      expect(findColor('red')).toBeDefined();
      expect(findColor('RED')).toBeDefined();
      expect(findColor('Red')).toBeDefined();
      expect(findColor('crimson')).toBeDefined();
      expect(findColor('nonexistent')).toBeNull();
    });

    test('findGradient should find gradients', () => {
      expect(findGradient('sunset')).toBeDefined();
      expect(findGradient('ocean')).toBeDefined();
      expect(findGradient('rainbow')).toBeDefined();
      expect(findGradient('nonexistent')).toBeNull();
    });

    test('blendColors should blend two colors', () => {
      const result = blendColors('#FF0000', '#0000FF', 0.5);
      expect(result).toBeDefined();
      expect(result.startsWith('#')).toBe(true);
    });

    test('getColorCategories should return categories', () => {
      const categories = getColorCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('basic');
    });

    test('getGradientCategories should return categories', () => {
      const categories = getGradientCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });
  });
});
