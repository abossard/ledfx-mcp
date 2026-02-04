#!/usr/bin/env node

/**
 * Demo script to test natural language scene parsing
 * Run with: node demo-parsing.js
 */

import { parseSceneDescription, recommendEffects, explainFeature } from './dist/ai-helper.js';
import { createLedFxClient } from './dist/ledfx-client.js';

console.log('=== LedFX MCP Natural Language Demo ===\n');

const client = createLedFxClient();

async function loadCatalog() {
  const colorsResponse = await client.getColors();
  return {
    colors: {
      ...colorsResponse.colors.builtin,
      ...colorsResponse.colors.user,
    },
    gradients: {
      ...colorsResponse.gradients.builtin,
      ...colorsResponse.gradients.user,
    },
  };
}

// Demo 1: Scene Parsing
console.log('📝 DEMO 1: Natural Language Scene Parsing\n');

const descriptions = [
  "Create a calm ocean scene with slow blue waves",
  "Make an energetic party scene with fast rainbow colors",
  "Build a romantic scene with dim pink and purple gradients",
  "Create a focus scene with steady white light at medium brightness"
];

const catalog = await loadCatalog();

descriptions.forEach(desc => {
  console.log(`Input: "${desc}"`);
  const parsed = parseSceneDescription(desc, catalog);
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
  const recommendations = recommendEffects(desc, mood, catalog);
  console.log('Recommendations:');
  recommendations.forEach(rec => {
    console.log(`  - ${rec.effectType}: ${rec.reason} (${Math.round(rec.confidence * 100)}%)`);
  });
  console.log('---\n');
});

// Demo 3: Colors and Gradients from LedFX
console.log('\n🎨 DEMO 3: LedFX Colors & Gradients\n');

Object.entries(catalog.colors).slice(0, 4).forEach(([name, value]) => {
  console.log(`${name}: ${value}`);
});

console.log('\n📊 DEMO 4: LedFX Gradients\n');

Object.entries(catalog.gradients).slice(0, 4).forEach(([name, value]) => {
  console.log(`${name}: ${value}`);
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
