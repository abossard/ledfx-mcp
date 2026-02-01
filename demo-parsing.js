#!/usr/bin/env node

/**
 * Demo script to test natural language scene parsing
 * Run with: node demo-parsing.js
 */

import { parseSceneDescription, recommendEffects, explainFeature } from './dist/ai-helper.js';
import { findColor, findGradient } from './dist/colors.js';

console.log('=== LedFX MCP Natural Language Demo ===\n');

// Demo 1: Scene Parsing
console.log('📝 DEMO 1: Natural Language Scene Parsing\n');

const descriptions = [
  "Create a calm ocean scene with slow blue waves",
  "Make an energetic party scene with fast rainbow colors",
  "Build a romantic scene with dim pink and purple gradients",
  "Create a focus scene with steady white light at medium brightness"
];

descriptions.forEach(desc => {
  console.log(`Input: "${desc}"`);
  const parsed = parseSceneDescription(desc);
  console.log('Parsed:', JSON.stringify(parsed, null, 2));
  console.log('---\n');
});

// Demo 2: Effect Recommendations
console.log('\n🎯 DEMO 2: Effect Recommendations\n');

const moods = [
  { desc: "relaxing evening", mood: "chill" },
  { desc: "party with music", mood: "party" }
];

moods.forEach(({ desc, mood }) => {
  console.log(`Query: "${desc}"`);
  const recommendations = recommendEffects(desc, mood);
  console.log('Recommendations:');
  recommendations.forEach(rec => {
    console.log(`  - ${rec.effectType}: ${rec.reason} (${Math.round(rec.confidence * 100)}%)`);
  });
  console.log('---\n');
});

// Demo 3: Color Lookups
console.log('\n🎨 DEMO 3: Color Library\n');

const colorNames = ['crimson', 'neon-pink', 'turquoise', 'pastel-blue'];
colorNames.forEach(name => {
  const color = findColor(name);
  if (color) {
    console.log(`${name}: ${color.hex} RGB(${color.rgb.join(',')}) [${color.category}]`);
  }
});

console.log('\n📊 DEMO 4: Gradient Library\n');

const gradientNames = ['sunset', 'ocean', 'fire', 'aurora'];
gradientNames.forEach(name => {
  const gradient = findGradient(name);
  if (gradient) {
    console.log(`${name}: ${gradient.description} [${gradient.category}]`);
    console.log(`  Colors: ${gradient.colors.join(', ')}`);
  }
});

// Demo 5: Feature Explanations
console.log('\n📚 DEMO 5: LedFX Feature Explanations\n');

const features = ['virtuals', 'audio-reactive', 'wled'];
features.forEach(feature => {
  console.log(`Feature: ${feature}`);
  const explanation = explainFeature(feature);
  console.log(`${explanation}\n`);
});

console.log('\n✅ Demo complete! The MCP server is ready to use.\n');
