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

export interface Theme {
  id?: number;
  name: string;
  color_lows: string;
  color_mids: string;
  color_high: string;
  background_color: string;
  gradient?: string; // Custom gradient CSS string (optional)
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

    // Create themes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS themes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color_lows TEXT NOT NULL,
        color_mids TEXT NOT NULL,
        color_high TEXT NOT NULL,
        background_color TEXT DEFAULT '#000000',
        gradient TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add gradient column if missing (migration for existing DBs)
    try {
      this.db.exec(`ALTER TABLE themes ADD COLUMN gradient TEXT`);
    } catch {
      // Column already exists
    }

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_palettes_category ON palettes(category);
      CREATE INDEX IF NOT EXISTS idx_presets_effect_type ON custom_presets(effect_type);
      CREATE INDEX IF NOT EXISTS idx_themes_name ON themes(name);
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

  // ============= Theme Operations =============

  /**
   * Create a new theme
   */
  createTheme(theme: Omit<Theme, "id" | "created_at" | "updated_at">): number {
    const stmt = this.db.prepare(`
      INSERT INTO themes (name, color_lows, color_mids, color_high, background_color, gradient, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      theme.name,
      theme.color_lows,
      theme.color_mids,
      theme.color_high,
      theme.background_color || "#000000",
      theme.gradient || null,
      theme.description || null
    );
    
    return result.lastInsertRowid as number;
  }

  /**
   * Get all themes
   */
  getAllThemes(): Theme[] {
    const stmt = this.db.prepare("SELECT * FROM themes ORDER BY name");
    return stmt.all() as Theme[];
  }

  /**
   * Get theme by ID
   */
  getTheme(id: number): Theme | null {
    const stmt = this.db.prepare("SELECT * FROM themes WHERE id = ?");
    return stmt.get(id) as Theme | null;
  }

  /**
   * Get theme by name
   */
  getThemeByName(name: string): Theme | null {
    const stmt = this.db.prepare("SELECT * FROM themes WHERE name = ?");
    return stmt.get(name) as Theme | null;
  }

  /**
   * Delete theme
   */
  deleteTheme(id: number): void {
    const stmt = this.db.prepare("DELETE FROM themes WHERE id = ?");
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
    // Use in-memory database for tests, persistent for production
    const dbPath = process.env.NODE_ENV === 'test' || process.env.LEDFX_MCP_DB_PATH === ':memory:'
      ? ':memory:'
      : process.env.LEDFX_MCP_DB_PATH || undefined;
    
    dbInstance = new PaletteDatabase(dbPath);
  }
  return dbInstance;
}

export function closeDatabaseConnection(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
