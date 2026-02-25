/**
 * Unit tests for AI helper module
 */

import { describe, expect, test } from '@jest/globals';
import {
  parseSceneDescription,
  recommendEffects,
  explainFeature,
  getFeatureCategories,
  EFFECT_TYPES,
} from '../../src/ai-helper.js';

describe('AI Helper', () => {
  const catalog = {
    colors: {
      blue: '#0000FF',
      purple: '#800080',
      red: '#FF0000',
      green: '#00FF00',
    },
    gradients: {
      sunset: 'linear-gradient(90deg, #ff0000, #0000ff)',
      ocean: 'linear-gradient(90deg, #003973, #0066CC)',
    },
  };

  describe('parseSceneDescription', () => {
    test('should parse calm ocean scene', () => {
      const result = parseSceneDescription(
        'Create a calm ocean scene with slow blue waves',
        catalog
      );
      
      expect(result.sceneName).toBeDefined();
      expect(result.speed).toBe(20); // slow
      expect(result.virtuals).toBeDefined();
      expect(result.virtuals.length).toBeGreaterThan(0);
      expect(result.tags).toContain('chill');
    });

    test('should parse energetic party scene', () => {
      const result = parseSceneDescription(
        'Make an energetic party scene with fast rainbow',
        catalog
      );
      
      expect(result.speed).toBe(80); // fast
      expect(result.tags).toContain('party');
    });

    test('should extract colors', () => {
      const result = parseSceneDescription(
        'Create scene with blue and purple colors',
        catalog
      );
      
      expect(result.colors).toBeDefined();
      expect(result.colors!.length).toBeGreaterThan(0);
    });

    test('should recognize gradients', () => {
      const result = parseSceneDescription('Apply sunset gradient', catalog);
      
      expect(result.gradient).toBe('sunset');
    });

    test('should detect brightness keywords', () => {
      const dimResult = parseSceneDescription('Create dim lighting', catalog);
      expect(dimResult.brightness).toBe(0.5);

      const brightResult = parseSceneDescription('Create bright lighting', catalog);
      expect(brightResult.brightness).toBe(1.0);
    });
  });

  describe('recommendEffects', () => {
    test('should recommend effects for party mood', () => {
      const recommendations = recommendEffects('party music', 'party', catalog);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('effectType');
      expect(recommendations[0]).toHaveProperty('config');
      expect(recommendations[0]).toHaveProperty('reason');
      expect(recommendations[0]).toHaveProperty('confidence');
    });

    test('should recommend audio-reactive effects for music', () => {
      const recommendations = recommendEffects('music visualization', undefined, catalog);
      
      const audioEffects = recommendations.filter(r => 
        r.effectType === 'pulse' || r.effectType === 'wavelength'
      );
      expect(audioEffects.length).toBeGreaterThan(0);
    });

    test('should recommend calm effects for relaxation', () => {
      const recommendations = recommendEffects('relaxing evening', 'chill', catalog);
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].confidence).toBeGreaterThan(0);
      expect(recommendations[0].confidence).toBeLessThanOrEqual(1);
    });

    test('should sort by confidence', () => {
      const recommendations = recommendEffects('party', undefined, catalog);
      
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i-1].confidence).toBeGreaterThanOrEqual(
          recommendations[i].confidence
        );
      }
    });
  });

  describe('explainFeature', () => {
    test('should explain virtuals', () => {
      const explanation = explainFeature('virtuals');
      
      expect(explanation).toBeDefined();
      expect(explanation.length).toBeGreaterThan(50);
      expect(explanation.toLowerCase()).toContain('virtual');
    });

    test('should explain audio-reactive', () => {
      const explanation = explainFeature('audio-reactive');
      
      expect(explanation).toBeDefined();
      expect(explanation.toLowerCase()).toContain('audio');
    });

    test('should provide generic response for unknown feature', () => {
      const explanation = explainFeature('completely-unknown-feature');
      
      expect(explanation).toBeDefined();
      expect(explanation).toContain("don't have specific information");
    });

    test('should explain effect types', () => {
      const explanation = explainFeature('rainbow');
      
      expect(explanation).toBeDefined();
      expect(explanation.toLowerCase()).toContain('rainbow');
    });
  });

  describe('getFeatureCategories', () => {
    test('should return categorized features', () => {
      const categories = getFeatureCategories();
      
      expect(categories).toBeDefined();
      expect(typeof categories).toBe('object');
      expect(categories['Core Concepts']).toBeDefined();
      expect(Array.isArray(categories['Core Concepts'])).toBe(true);
    });
  });

  describe('EFFECT_TYPES', () => {
    test('should have common effect types', () => {
      expect(EFFECT_TYPES['rainbow']).toBeDefined();
      expect(EFFECT_TYPES['energy']).toBeDefined();
      expect(EFFECT_TYPES['wavelength']).toBeDefined();
    });

    test('should have correct metadata', () => {
      const rainbow = EFFECT_TYPES['rainbow'];
      
      expect(rainbow).toHaveProperty('name');
      expect(rainbow).toHaveProperty('category');
      expect(rainbow).toHaveProperty('description');
      expect(rainbow).toHaveProperty('commonParams');
      expect(rainbow).toHaveProperty('audioReactive');
      expect(Array.isArray(rainbow.commonParams)).toBe(true);
    });

    test('should mark audio-reactive effects correctly', () => {
      expect(EFFECT_TYPES['energy'].audioReactive).toBe(true);
      expect(EFFECT_TYPES['wavelength'].audioReactive).toBe(true);
      expect(EFFECT_TYPES['rainbow'].audioReactive).toBe(false);
    });
  });
});
