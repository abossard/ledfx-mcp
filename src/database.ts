/**
 * Database module for palette management
 * 
 * Uses SQLite to store user-defined palettes, playlists, and presets
 * that are not available in the LedFX API.
 */

import Database from "better-sqlite3";
import { join } from "path";
import { homedir } from "os";
import { mkdirSync, existsSync } from "fs";

export interface Palette {
  id?: number;
  name: string;
  description?: string;
  colors: string; // JSON array of hex colors
  gradient?: string; // JSON array for gradient definition
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Playlist {
  id?: number;
  name: string;
  description?: string;
  scenes: string; // JSON array of scene IDs
  transition_time?: number;
  loop?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomPreset {
  id?: number;
  name: string;
  effect_type: string;
  config: string; // JSON object
  palette_id?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Database manager for palettes and related data
 */
export class PaletteDatabase {
  private db: Database.Database;

  constructor(dbPath?: string) {
    // Default to user's home directory
    if (!dbPath) {
      const configDir = join(homedir(), ".ledfx-mcp");
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }
      dbPath = join(configDir, "palettes.db");
    }

    this.db = new Database(dbPath);
    this.initialize();
  }

  /**
   * Initialize database schema
   */
  private initialize(): void {
    // Create palettes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS palettes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        colors TEXT NOT NULL,
        gradient TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create playlists table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        scenes TEXT NOT NULL,
        transition_time INTEGER DEFAULT 5,
        loop BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create custom presets table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS custom_presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        effect_type TEXT NOT NULL,
        config TEXT NOT NULL,
        palette_id INTEGER,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (palette_id) REFERENCES palettes(id) ON DELETE SET NULL,
        UNIQUE(name, effect_type)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_palettes_category ON palettes(category);
      CREATE INDEX IF NOT EXISTS idx_presets_effect_type ON custom_presets(effect_type);
    `);
  }

  // ============= Palette Operations =============

  /**
   * Create a new palette
   */
  createPalette(palette: Omit<Palette, "id" | "created_at" | "updated_at">): number {
    const stmt = this.db.prepare(`
      INSERT INTO palettes (name, description, colors, gradient, category)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      palette.name,
      palette.description || null,
      palette.colors,
      palette.gradient || null,
      palette.category || null
    );
    
    return result.lastInsertRowid as number;
  }

  /**
   * Get all palettes
   */
  getAllPalettes(): Palette[] {
    const stmt = this.db.prepare("SELECT * FROM palettes ORDER BY name");
    return stmt.all() as Palette[];
  }

  /**
   * Get palette by ID
   */
  getPalette(id: number): Palette | null {
    const stmt = this.db.prepare("SELECT * FROM palettes WHERE id = ?");
    return stmt.get(id) as Palette | null;
  }

  /**
   * Get palette by name
   */
  getPaletteByName(name: string): Palette | null {
    const stmt = this.db.prepare("SELECT * FROM palettes WHERE name = ?");
    return stmt.get(name) as Palette | null;
  }

  /**
   * Get palettes by category
   */
  getPalettesByCategory(category: string): Palette[] {
    const stmt = this.db.prepare("SELECT * FROM palettes WHERE category = ? ORDER BY name");
    return stmt.all(category) as Palette[];
  }

  /**
   * Update palette
   */
  updatePalette(id: number, updates: Partial<Omit<Palette, "id" | "created_at">>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push("description = ?");
      values.push(updates.description);
    }
    if (updates.colors !== undefined) {
      fields.push("colors = ?");
      values.push(updates.colors);
    }
    if (updates.gradient !== undefined) {
      fields.push("gradient = ?");
      values.push(updates.gradient);
    }
    if (updates.category !== undefined) {
      fields.push("category = ?");
      values.push(updates.category);
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE palettes SET ${fields.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  /**
   * Delete palette
   */
  deletePalette(id: number): void {
    const stmt = this.db.prepare("DELETE FROM palettes WHERE id = ?");
    stmt.run(id);
  }

  // ============= Playlist Operations =============

  /**
   * Create a new playlist
   */
  createPlaylist(playlist: Omit<Playlist, "id" | "created_at" | "updated_at">): number {
    const stmt = this.db.prepare(`
      INSERT INTO playlists (name, description, scenes, transition_time, loop)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      playlist.name,
      playlist.description || null,
      playlist.scenes,
      playlist.transition_time || 5,
      playlist.loop !== undefined ? (playlist.loop ? 1 : 0) : 1
    );
    
    return result.lastInsertRowid as number;
  }

  /**
   * Get all playlists
   */
  getAllPlaylists(): Playlist[] {
    const stmt = this.db.prepare("SELECT * FROM playlists ORDER BY name");
    return stmt.all() as Playlist[];
  }

  /**
   * Get playlist by ID
   */
  getPlaylist(id: number): Playlist | null {
    const stmt = this.db.prepare("SELECT * FROM playlists WHERE id = ?");
    return stmt.get(id) as Playlist | null;
  }

  /**
   * Get playlist by name
   */
  getPlaylistByName(name: string): Playlist | null {
    const stmt = this.db.prepare("SELECT * FROM playlists WHERE name = ?");
    return stmt.get(name) as Playlist | null;
  }

  /**
   * Update playlist
   */
  updatePlaylist(id: number, updates: Partial<Omit<Playlist, "id" | "created_at">>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push("description = ?");
      values.push(updates.description);
    }
    if (updates.scenes !== undefined) {
      fields.push("scenes = ?");
      values.push(updates.scenes);
    }
    if (updates.transition_time !== undefined) {
      fields.push("transition_time = ?");
      values.push(updates.transition_time);
    }
    if (updates.loop !== undefined) {
      fields.push("loop = ?");
      values.push(updates.loop ? 1 : 0);
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE playlists SET ${fields.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  /**
   * Delete playlist
   */
  deletePlaylist(id: number): void {
    const stmt = this.db.prepare("DELETE FROM playlists WHERE id = ?");
    stmt.run(id);
  }

  // ============= Custom Preset Operations =============

  /**
   * Create a new custom preset
   */
  createCustomPreset(preset: Omit<CustomPreset, "id" | "created_at" | "updated_at">): number {
    const stmt = this.db.prepare(`
      INSERT INTO custom_presets (name, effect_type, config, palette_id, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      preset.name,
      preset.effect_type,
      preset.config,
      preset.palette_id || null,
      preset.description || null
    );
    
    return result.lastInsertRowid as number;
  }

  /**
   * Get all custom presets
   */
  getAllCustomPresets(): CustomPreset[] {
    const stmt = this.db.prepare("SELECT * FROM custom_presets ORDER BY effect_type, name");
    return stmt.all() as CustomPreset[];
  }

  /**
   * Get custom preset by ID
   */
  getCustomPreset(id: number): CustomPreset | null {
    const stmt = this.db.prepare("SELECT * FROM custom_presets WHERE id = ?");
    return stmt.get(id) as CustomPreset | null;
  }

  /**
   * Get custom presets by effect type
   */
  getCustomPresetsByEffect(effectType: string): CustomPreset[] {
    const stmt = this.db.prepare("SELECT * FROM custom_presets WHERE effect_type = ? ORDER BY name");
    return stmt.all(effectType) as CustomPreset[];
  }

  /**
   * Update custom preset
   */
  updateCustomPreset(id: number, updates: Partial<Omit<CustomPreset, "id" | "created_at">>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.effect_type !== undefined) {
      fields.push("effect_type = ?");
      values.push(updates.effect_type);
    }
    if (updates.config !== undefined) {
      fields.push("config = ?");
      values.push(updates.config);
    }
    if (updates.palette_id !== undefined) {
      fields.push("palette_id = ?");
      values.push(updates.palette_id);
    }
    if (updates.description !== undefined) {
      fields.push("description = ?");
      values.push(updates.description);
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE custom_presets SET ${fields.join(", ")} WHERE id = ?
    `);
    stmt.run(...values);
  }

  /**
   * Delete custom preset
   */
  deleteCustomPreset(id: number): void {
    const stmt = this.db.prepare("DELETE FROM custom_presets WHERE id = ?");
    stmt.run(id);
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

/**
 * Singleton instance for global access
 */
let dbInstance: PaletteDatabase | null = null;

export function getDatabase(): PaletteDatabase {
  if (!dbInstance) {
    dbInstance = new PaletteDatabase();
  }
  return dbInstance;
}

export function closeDatabaseConnection(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
