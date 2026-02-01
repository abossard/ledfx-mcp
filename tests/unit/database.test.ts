/**
 * Unit tests for database module
 */

import { describe, expect, test, beforeEach, afterEach } from '@jest/globals';
import { PaletteDatabase } from '../../src/database.js';
import { unlinkSync, existsSync } from 'fs';

describe('Database', () => {
  let db: PaletteDatabase;
  const testDbPath = '/tmp/test-palettes.db';

  beforeEach(() => {
    // Clean up any existing test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    db = new PaletteDatabase(testDbPath);
  });

  afterEach(() => {
    db.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  describe('Palette Operations', () => {
    test('should create a palette', () => {
      const id = db.createPalette({
        name: 'Test Palette',
        colors: JSON.stringify(['#FF0000', '#00FF00', '#0000FF']),
        description: 'Test description',
        category: 'test',
      });

      expect(id).toBeGreaterThan(0);
    });

    test('should get all palettes', () => {
      db.createPalette({
        name: 'Palette 1',
        colors: JSON.stringify(['#FF0000']),
      });
      db.createPalette({
        name: 'Palette 2',
        colors: JSON.stringify(['#00FF00']),
      });

      const palettes = db.getAllPalettes();
      expect(palettes.length).toBe(2);
    });

    test('should get palette by ID', () => {
      const id = db.createPalette({
        name: 'Test Palette',
        colors: JSON.stringify(['#FF0000']),
      });

      const palette = db.getPalette(id);
      expect(palette).toBeDefined();
      expect(palette!.name).toBe('Test Palette');
    });

    test('should get palette by name', () => {
      db.createPalette({
        name: 'Unique Name',
        colors: JSON.stringify(['#FF0000']),
      });

      const palette = db.getPaletteByName('Unique Name');
      expect(palette).toBeDefined();
      expect(palette!.name).toBe('Unique Name');
    });

    test('should get palettes by category', () => {
      db.createPalette({
        name: 'Nature 1',
        colors: JSON.stringify(['#00FF00']),
        category: 'nature',
      });
      db.createPalette({
        name: 'Tech 1',
        colors: JSON.stringify(['#FF00FF']),
        category: 'tech',
      });

      const naturePalettes = db.getPalettesByCategory('nature');
      expect(naturePalettes.length).toBe(1);
      expect(naturePalettes[0].name).toBe('Nature 1');
    });

    test('should update palette', () => {
      const id = db.createPalette({
        name: 'Original Name',
        colors: JSON.stringify(['#FF0000']),
      });

      db.updatePalette(id, {
        name: 'Updated Name',
        description: 'New description',
      });

      const palette = db.getPalette(id);
      expect(palette!.name).toBe('Updated Name');
      expect(palette!.description).toBe('New description');
    });

    test('should delete palette', () => {
      const id = db.createPalette({
        name: 'To Delete',
        colors: JSON.stringify(['#FF0000']),
      });

      db.deletePalette(id);
      const palette = db.getPalette(id);
      expect(palette).toBeUndefined();
    });
  });

  describe('Playlist Operations', () => {
    test('should create a playlist', () => {
      const id = db.createPlaylist({
        name: 'Test Playlist',
        scenes: JSON.stringify(['scene1', 'scene2']),
        transition_time: 10,
        loop: true,
      });

      expect(id).toBeGreaterThan(0);
    });

    test('should get all playlists', () => {
      db.createPlaylist({
        name: 'Playlist 1',
        scenes: JSON.stringify(['scene1']),
      });
      db.createPlaylist({
        name: 'Playlist 2',
        scenes: JSON.stringify(['scene2']),
      });

      const playlists = db.getAllPlaylists();
      expect(playlists.length).toBe(2);
    });

    test('should get playlist by ID', () => {
      const id = db.createPlaylist({
        name: 'Test Playlist',
        scenes: JSON.stringify(['scene1']),
      });

      const playlist = db.getPlaylist(id);
      expect(playlist).toBeDefined();
      expect(playlist!.name).toBe('Test Playlist');
    });

    test('should update playlist', () => {
      const id = db.createPlaylist({
        name: 'Original',
        scenes: JSON.stringify(['scene1']),
      });

      db.updatePlaylist(id, {
        name: 'Updated',
        transition_time: 20,
      });

      const playlist = db.getPlaylist(id);
      expect(playlist!.name).toBe('Updated');
      expect(playlist!.transition_time).toBe(20);
    });

    test('should delete playlist', () => {
      const id = db.createPlaylist({
        name: 'To Delete',
        scenes: JSON.stringify(['scene1']),
      });

      db.deletePlaylist(id);
      const playlist = db.getPlaylist(id);
      expect(playlist).toBeUndefined();
    });
  });

  describe('Custom Preset Operations', () => {
    test('should create a custom preset', () => {
      const id = db.createCustomPreset({
        name: 'Test Preset',
        effect_type: 'rainbow',
        config: JSON.stringify({ speed: 50 }),
      });

      expect(id).toBeGreaterThan(0);
    });

    test('should get all custom presets', () => {
      db.createCustomPreset({
        name: 'Preset 1',
        effect_type: 'rainbow',
        config: JSON.stringify({}),
      });
      db.createCustomPreset({
        name: 'Preset 2',
        effect_type: 'pulse',
        config: JSON.stringify({}),
      });

      const presets = db.getAllCustomPresets();
      expect(presets.length).toBe(2);
    });

    test('should get presets by effect type', () => {
      db.createCustomPreset({
        name: 'Rainbow 1',
        effect_type: 'rainbow',
        config: JSON.stringify({}),
      });
      db.createCustomPreset({
        name: 'Pulse 1',
        effect_type: 'pulse',
        config: JSON.stringify({}),
      });

      const rainbowPresets = db.getCustomPresetsByEffect('rainbow');
      expect(rainbowPresets.length).toBe(1);
      expect(rainbowPresets[0].name).toBe('Rainbow 1');
    });

    test('should delete custom preset', () => {
      const id = db.createCustomPreset({
        name: 'To Delete',
        effect_type: 'rainbow',
        config: JSON.stringify({}),
      });

      db.deleteCustomPreset(id);
      const preset = db.getCustomPreset(id);
      expect(preset).toBeUndefined();
    });
  });
});
