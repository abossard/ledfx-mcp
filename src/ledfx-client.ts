/**
 * LedFX Client
 * 
 * Provides a clean interface for interacting with a LedFX HTTP API.
 * 
 * Following "A Philosophy of Software Design":
 * - Deep module: Complex HTTP interactions hidden behind simple interface
 * - Information hiding: Implementation details abstracted from callers
 * 
 * Following "Grokking Simplicity":
 * - Clear separation between actions (HTTP calls) and calculations (data transformation)
 */

import logger from "./logger.js";

export interface LedFxConfig {
  host: string;
  port: number;
}

export type LedFxTransitionMode =
  | "Add"
  | "Dissolve"
  | "Push"
  | "Slide"
  | "Iris"
  | "Through White"
  | "Through Black"
  | "None";

export interface LedFxDevice {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
}

export interface LedFxVirtual {
  id: string;
  config: {
    name: string;
    pixel_count?: number;
    transition_mode?: LedFxTransitionMode;
    transition_time?: number;
    [key: string]: unknown;
  };
  active: boolean;
  effect?: {
    type: string;
    config: Record<string, unknown>;
  };
  segments?: Array<[string, number, number, boolean]>;
}

export interface LedFxSceneVirtual {
  type?: string;
  config?: Record<string, unknown>;
  action?: "activate" | "ignore" | "stop" | "forceblack";
  preset?: string;
  preset_category?: "ledfx_presets" | "user_presets";
}

export interface LedFxSceneConfig {
  name: string;
  scene_tags?: string | null;
  scene_image?: string | null;
  scene_puturl?: string | null;
  scene_payload?: string | null;
  scene_midiactivate?: string | null;
  virtuals?: Record<string, LedFxSceneVirtual>;
  active?: boolean;
}

export interface LedFxScene extends LedFxSceneConfig {
  id: string;
}

export interface LedFxPreset {
  name: string;
  config: Record<string, unknown>;
}

export interface LedFxPlaylistItem {
  scene_id: string;
  duration_ms?: number;
}

export interface LedFxPlaylist {
  id: string;
  name: string;
  items: LedFxPlaylistItem[];
  mode?: "sequence" | "shuffle";
  default_duration_ms?: number;
  timing?: Record<string, any>;
  tags?: string[];
  image?: string | null;
  [key: string]: unknown;
}

export interface LedFxPlaylistState {
  active_playlist: string | null;
  index: number;
  paused: boolean;
  order?: number[];
  scenes?: string[];
  scene_id?: string;
  mode?: "sequence" | "shuffle";
  timing?: Record<string, unknown>;
  effective_duration_ms?: number;
  remaining_ms?: number;
}

export interface EffectSchema {
  schema: {
    type: string;
    properties: Record<string, unknown>;
  };
}

export interface LedFxColorsResponse {
  colors: {
    builtin: Record<string, string>;
    user: Record<string, string>;
  };
  gradients: {
    builtin: Record<string, string>;
    user: Record<string, string>;
  };
}

// ========== Backup/Restore Types ==========

export interface BackupVirtualEffect {
  type: string;
  config: Record<string, unknown>;
}

export interface BackupVirtual {
  id: string;
  config: {
    name: string;
    pixel_count?: number;
    [key: string]: unknown;
  };
  active: boolean;
  effect?: BackupVirtualEffect;
}

export interface BackupScene {
  id: string;
  name: string;
  scene_tags?: string;
  virtuals: Record<string, {
    effect: BackupVirtualEffect;
  }>;
}

export interface BackupPlaylist {
  id: string;
  name: string;
  items: Array<{
    scene_id: string;
    duration_ms: number;
  }>;
  mode: "sequence" | "shuffle";
  default_duration_ms: number;
  timing?: Record<string, any>;
  tags?: string[];
  image?: string;
}

export interface BackupAudioConfig {
  active_device_index: number;
  devices: Record<string, string>;
}

export interface LedFxBackup {
  version: string;
  timestamp: string;
  ledfx_version?: string;
  virtuals: BackupVirtual[];
  scenes: BackupScene[];
  playlists: BackupPlaylist[];
  audio?: BackupAudioConfig;
  metadata?: {
    description?: string;
    created_by?: string;
  };
}

export interface RestoreOptions {
  restore_virtuals?: boolean;
  restore_scenes?: boolean;
  restore_playlists?: boolean;
  restore_audio?: boolean;
  clear_existing?: boolean;
  dry_run?: boolean;
}

export interface RestoreResult {
  success: boolean;
  dry_run: boolean;
  virtuals: {
    restored: number;
    skipped: number;
    errors: string[];
  };
  scenes: {
    restored: number;
    skipped: number;
    deleted: number;
    errors: string[];
  };
  playlists: {
    restored: number;
    skipped: number;
    deleted: number;
    errors: string[];
  };
  audio: {
    restored: boolean;
    error?: string;
  };
}

export interface LedFxErrorContext {
  method: string;
  endpoint: string;
  url: string;
  durationMs: number;
  status?: number;
  statusText?: string;
  responseBody?: string;
  cause?: string;
}

export class LedFxRequestError extends Error {
  readonly context: LedFxErrorContext;

  constructor(message: string, context: LedFxErrorContext) {
    super(message);
    this.name = "LedFxRequestError";
    this.context = context;
  }
}

export class LedFxApiError extends LedFxRequestError {
  constructor(message: string, context: LedFxErrorContext) {
    super(message, context);
    this.name = "LedFxApiError";
  }
}

export class LedFxConnectionError extends LedFxRequestError {
  constructor(message: string, context: LedFxErrorContext) {
    super(message, context);
    this.name = "LedFxConnectionError";
  }
}

/**
 * Client for interacting with LedFX instance
 * Deep module with simple interface hiding HTTP complexity
 */
export class LedFxClient {
  private baseUrl: string;

  constructor(config: LedFxConfig) {
    this.baseUrl = `http://${config.host}:${config.port}/api`;
    logger.debug(`LedFX client initialized`, { baseUrl: this.baseUrl });
  }

  /**
   * Generic HTTP request method (action - performs I/O)
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    
    // Log request
    logger.httpRequest(method, endpoint, body);
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        // Include status and body in API error
        let errorBody = "";
        try {
          const jsonError = await response.json();
          errorBody = JSON.stringify(jsonError);
        } catch {
          errorBody = await response.text().catch(() => "");
        }
        
        logger.httpResponse(method, endpoint, response.status, durationMs, errorBody);
        
        throw new LedFxApiError(
          `LedFX API error: ${response.status} ${response.statusText}${
            errorBody ? ` - ${errorBody}` : ""
          }`,
          {
            method,
            endpoint,
            url,
            durationMs,
            status: response.status,
            statusText: response.statusText,
            responseBody: errorBody,
          }
        );
      }

      const data = (await response.json()) as T;
      logger.httpResponse(method, endpoint, response.status, durationMs);
      
      return data;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      
      // Only wrap network/connection errors, not API errors
      if (error instanceof LedFxRequestError) {
        throw error; // Re-throw API errors as-is
      }
      
      const errorMessage = `Failed to connect to LedFX at ${url}: ${
        error instanceof Error ? error.message : String(error)
      }`;
      
      logger.error(`HTTP request failed`, { endpoint, error: errorMessage, durationMs });
      
      throw new LedFxConnectionError(errorMessage, {
        method,
        endpoint,
        url,
        durationMs,
        cause: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get server information (action)
   */
  async getInfo(): Promise<Record<string, any>> {
    return await this.request("/info");
  }

  /**
   * Get all devices (action)
   */
  async getDevices(): Promise<LedFxDevice[]> {
    const response = await this.request<{ devices: Record<string, LedFxDevice> }>(
      "/devices"
    );
    return Object.values(response.devices);
  }

  /**
   * Get a specific device (action)
   */
  async getDevice(deviceId: string): Promise<LedFxDevice> {
    return await this.request(`/devices/${deviceId}`);
  }

  /**
   * Get all virtuals (action)
   */
  async getVirtuals(): Promise<LedFxVirtual[]> {
    const response = await this.request<{ virtuals: Record<string, LedFxVirtual> }>(
      "/virtuals"
    );
    return Object.values(response.virtuals || {});
  }

  /**
   * Get a specific virtual (action)
   */
  async getVirtual(virtualId: string): Promise<LedFxVirtual> {
    const response = await this.request<any>(`/virtuals/${virtualId}`);

    if (response && typeof response === "object") {
      if (response.effect) {
        return response as LedFxVirtual;
      }
      if (response.virtual) {
        return response.virtual as LedFxVirtual;
      }
      if (response[virtualId]) {
        return response[virtualId] as LedFxVirtual;
      }
    }

    return response as LedFxVirtual;
  }

  /**
   * Set virtual active/inactive (action)
   */
  async setVirtualActive(virtualId: string, active: boolean): Promise<void> {
    await this.request(`/virtuals/${virtualId}`, {
      method: "PUT",
      body: JSON.stringify({ active }),
    });
  }

  /**
   * Update virtual configuration fields (action)
   */
  async updateVirtualConfig(
    virtualId: string,
    config: Record<string, unknown>,
    options?: {
      active?: boolean;
    }
  ): Promise<LedFxVirtual> {
    const response = await this.request<{
      status?: string;
      virtual?: LedFxVirtual;
    }>("/virtuals", {
      method: "POST",
      body: JSON.stringify({
        id: virtualId,
        ...(options?.active !== undefined ? { active: options.active } : {}),
        config,
      }),
    });

    if (response?.virtual) {
      return response.virtual;
    }

    return await this.getVirtual(virtualId);
  }

  /**
   * Set effect on virtual (CORRECTED - was incorrectly using devices) (action)
   */
  async setVirtualEffect(
    virtualId: string,
    effectType: string,
    config: Record<string, any> = {}
  ): Promise<void> {
    await this.request(`/virtuals/${virtualId}/effects`, {
      method: "POST",
      body: JSON.stringify({
        type: effectType,
        config,
      }),
    });
  }

  /**
   * Update effect config on virtual (action)
   */
  async updateVirtualEffect(
    virtualId: string,
    config: Record<string, any>
  ): Promise<void> {
    await this.request(`/virtuals/${virtualId}/effects`, {
      method: "PUT",
      body: JSON.stringify({ config }),
    });
  }

  /**
   * Clear virtual effect (CORRECTED - was incorrectly using devices) (action)
   */
  async clearVirtualEffect(virtualId: string): Promise<void> {
    await this.request(`/virtuals/${virtualId}/effects`, {
      method: "DELETE",
    });
  }

  /**
   * Get effect presets for a virtual (action)
   */
  async getVirtualPresets(virtualId: string): Promise<Record<string, Record<string, LedFxPreset>>> {
    const response = await this.request<{
      ledfx_presets: Record<string, LedFxPreset>;
      user_presets: Record<string, LedFxPreset>;
    }>(`/virtuals/${virtualId}/presets`);
    return {
      ledfx_presets: response.ledfx_presets || {},
      user_presets: response.user_presets || {},
    };
  }

  /**
   * Apply preset to virtual (action)
   */
  async applyPreset(
    virtualId: string,
    category: "ledfx_presets" | "user_presets",
    effectId: string,
    presetId: string
  ): Promise<void> {
    await this.request(`/virtuals/${virtualId}/presets`, {
      method: "PUT",
      body: JSON.stringify({
        category,
        effect_id: effectId,
        preset_id: presetId,
      }),
    });
  }

  /**
   * Get presets for a specific effect type (action)
   */
  async getEffectPresets(effectId: string): Promise<{
    ledfx_presets: Record<string, LedFxPreset>;
    user_presets: Record<string, LedFxPreset>;
  }> {
    const response = await this.request<{
      ledfx_presets: Record<string, LedFxPreset>;
      user_presets: Record<string, LedFxPreset>;
    }>(`/effects/${encodeURIComponent(effectId)}/presets`);

    return {
      ledfx_presets: response.ledfx_presets || {},
      user_presets: response.user_presets || {},
    };
  }

  /**
   * Save current effect config as a user preset (action)
   */
  async savePreset(
    virtualId: string,
    presetName: string
  ): Promise<void> {
    await this.request(`/virtuals/${virtualId}/presets`, {
      method: "POST",
      body: JSON.stringify({
        name: presetName,
      }),
    });
  }

  /**
   * Delete a preset on a virtual (action)
   */
  async deletePreset(
    virtualId: string,
    category: "ledfx_presets" | "user_presets",
    effectId: string,
    presetId: string
  ): Promise<void> {
    await this.request(`/virtuals/${virtualId}/presets`, {
      method: "DELETE",
      body: JSON.stringify({
        category,
        effect_id: effectId,
        preset_id: presetId,
      }),
    });
  }

  /**
   * DEPRECATED: Use setVirtualEffect instead
   * @deprecated This method uses the wrong endpoint. Use setVirtualEffect.
   */
  async setEffect(
    deviceId: string,
    effectType: string,
    config: Record<string, any> = {}
  ): Promise<void> {
    console.error("WARNING: setEffect is deprecated. Use setVirtualEffect instead.");
    // Keep for backwards compatibility but log warning
    await this.request(`/devices/${deviceId}/effects`, {
      method: "POST",
      body: JSON.stringify({
        type: effectType,
        config,
      }),
    });
  }

  /**
   * DEPRECATED: Use clearVirtualEffect instead
   * @deprecated This method uses the wrong endpoint. Use clearVirtualEffect.
   */
  async clearEffect(deviceId: string): Promise<void> {
    console.error("WARNING: clearEffect is deprecated. Use clearVirtualEffect instead.");
    await this.request(`/devices/${deviceId}/effects`, {
      method: "DELETE",
    });
  }

  /**
   * Get all scenes (action)
   */
  async getScenes(): Promise<LedFxScene[]> {
    const response = await this.request<{
      scenes: Record<string, Partial<LedFxSceneConfig>>;
    }>(
      "/scenes"
    );
    return Object.entries(response.scenes || {}).map(([sceneId, scene]) =>
      this.normalizeScene(sceneId, scene)
    );
  }

  /**
   * Get a specific scene (action)
   */
  async getScene(sceneId: string): Promise<LedFxScene> {
    const response = await this.request<any>(`/scenes/${encodeURIComponent(sceneId)}`);

    if (response?.scene?.id && response?.scene?.config) {
      return this.normalizeScene(response.scene.id, response.scene.config);
    }

    if (response?.scene?.id) {
      return this.normalizeScene(response.scene.id, response.scene);
    }

    if (response?.[sceneId]) {
      return this.normalizeScene(sceneId, response[sceneId]);
    }

    throw new Error(`Unexpected scene response payload for '${sceneId}'`);
  }

  /**
   * Activate a scene (CORRECTED endpoint format) (action)
   */
  async activateScene(sceneId: string): Promise<void> {
    await this.request(`/scenes`, {
      method: "PUT",
      body: JSON.stringify({
        id: sceneId,
        action: "activate",
      }),
    });
  }

  /**
   * Create a new scene (action)
   */
  async createScene(
    name: string,
    sceneTags?: string,
    virtuals?: Record<string, LedFxSceneVirtual>
  ): Promise<void> {
    await this.request(`/scenes`, {
      method: "POST",
      body: JSON.stringify({
        name,
        scene_tags: sceneTags,
        ...(virtuals ? { virtuals } : {}),
      }),
    });
  }

  /**
   * Update an existing scene (action)
   */
  async updateScene(
    sceneId: string,
    updates: {
      name?: string;
      sceneTags?: string | null;
      virtuals?: Record<string, LedFxSceneVirtual>;
      snapshot?: boolean;
    }
  ): Promise<LedFxScene> {
    const response = await this.request<{
      status: string;
      scene?: {
        id?: string;
        config?: Partial<LedFxSceneConfig>;
      };
    }>("/scenes", {
      method: "POST",
      body: JSON.stringify({
        id: sceneId,
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.sceneTags !== undefined ? { scene_tags: updates.sceneTags } : {}),
        ...(updates.virtuals !== undefined ? { virtuals: updates.virtuals } : {}),
        ...(updates.snapshot !== undefined ? { snapshot: updates.snapshot } : {}),
      }),
    });

    if (response.scene?.id && response.scene.config) {
      return this.normalizeScene(response.scene.id, response.scene.config);
    }

    // Fallback to fresh read if server response omitted scene payload
    return await this.getScene(sceneId);
  }

  /**
   * Delete a scene (action)
   */
  async deleteScene(sceneId: string): Promise<void> {
    await this.request(`/scenes`, {
      method: "DELETE",
      body: JSON.stringify({
        id: sceneId,
      }),
    });
  }

  /**
   * Convert a scene payload to a normalized model with explicit id.
   */
  private normalizeScene(sceneId: string, scene: Partial<LedFxSceneConfig>): LedFxScene {
    return {
      id: sceneId,
      name: scene.name || sceneId,
      scene_tags: scene.scene_tags,
      scene_image: scene.scene_image,
      scene_puturl: scene.scene_puturl,
      scene_payload: scene.scene_payload,
      scene_midiactivate: scene.scene_midiactivate,
      virtuals: scene.virtuals || {},
      active: scene.active ?? false,
    };
  }

  /**
   * Get full schema including all effect types (action)
   */
  async getSchema(): Promise<Record<string, any>> {
    return await this.request("/schema");
  }

  /**
   * Get effect schemas/types (action)
   */
  async getEffectSchemas(): Promise<Record<string, EffectSchema>> {
    const schema = await this.getSchema();
    return schema.effects || {};
  }

  /**
   * Get all available effects (action)
   */
  async getEffects(): Promise<Record<string, any>> {
    return await this.request("/effects");
  }

  /**
   * Get audio devices (action)
   */
  async getAudioDevices(): Promise<{
    active_device_index: number;
    devices: Record<string, string>;
  }> {
    return await this.request("/audio/devices");
  }

  /**
   * Get all colors and gradients (action)
   */
  async getColors(): Promise<LedFxColorsResponse> {
    return await this.request("/colors");
  }

  /**
   * Create or update user-defined colors or gradients (action)
   */
  async upsertColors(payload: Record<string, string>): Promise<void> {
    await this.request("/colors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Delete a specific user-defined color or gradient (action)
   */
  async deleteColor(colorId: string): Promise<void> {
    await this.request(`/colors/${encodeURIComponent(colorId)}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Set audio device (action)
   */
  async setAudioDevice(deviceIndex: number): Promise<void> {
    await this.request("/audio/devices", {
      method: "PUT",
      body: JSON.stringify({
        audio_device: deviceIndex,
      }),
    });
  }

  // ========== LedFX Native Playlist Management ==========

  /**
   * Get all playlists from LedFX (action)
   */
  async getPlaylists(): Promise<Record<string, LedFxPlaylist>> {
    const response = await this.request<{ playlists: Record<string, LedFxPlaylist> }>("/playlists");
    return response.playlists || {};
  }

  /**
   * Get a specific playlist (action)
   */
  async getPlaylist(playlistId: string): Promise<LedFxPlaylist | null> {
    const playlists = await this.getPlaylists();
    return playlists[playlistId] || null;
  }

  /**
   * Start a playlist (action)
   */
  async startPlaylist(playlistId: string): Promise<void> {
    await this.request("/playlists", {
      method: "PUT",
      body: JSON.stringify({
        action: "start",
        id: playlistId,
      }),
    });
  }

  /**
   * Stop the active playlist (action)
   */
  async stopPlaylist(): Promise<void> {
    await this.request("/playlists", {
      method: "PUT",
      body: JSON.stringify({
        action: "stop",
      }),
    });
  }

  /**
   * Get playlist playback status (action)
   */
  async getPlaylistStatus(): Promise<LedFxPlaylistState> {
    const response = await this.request<{
      status: string;
      data?: {
        state?: LedFxPlaylistState;
      };
    }>("/playlists", {
      method: "PUT",
      body: JSON.stringify({
        action: "state",
      }),
    });
    return response.data?.state || {
      active_playlist: null,
      index: 0,
      paused: false,
    };
  }

  /**
   * Create a new playlist (action)
   */
  async createPlaylist(
    id: string,
    name: string,
    items: LedFxPlaylistItem[],
    options?: {
      mode?: "sequence" | "shuffle";
      default_duration_ms?: number;
      timing?: Record<string, any>;
      tags?: string[];
      image?: string | null;
    }
  ): Promise<LedFxPlaylist> {
    const response = await this.request<{
      status: string;
      data?: {
        playlist?: LedFxPlaylist;
      };
    }>("/playlists", {
      method: "POST",
      body: JSON.stringify({
        id,
        name,
        items,
        mode: options?.mode || "sequence",
        default_duration_ms: options?.default_duration_ms || 15000,
        ...(options?.timing ? { timing: options.timing } : {}),
        ...(options?.tags ? { tags: options.tags } : {}),
        ...(options?.image !== undefined ? { image: options.image } : {}),
      }),
    });
    return response.data?.playlist || {
      id,
      name,
      items,
      mode: options?.mode || "sequence",
      default_duration_ms: options?.default_duration_ms || 15000,
      timing: options?.timing,
      tags: options?.tags,
      image: options?.image,
    };
  }

  /**
   * Update an existing playlist (action)
   * Uses LedFX playlist upsert semantics (POST create_or_replace)
   */
  async updatePlaylist(
    id: string,
    updates: {
      name?: string;
      items?: LedFxPlaylistItem[];
      mode?: "sequence" | "shuffle";
      default_duration_ms?: number;
      timing?: Record<string, any>;
      tags?: string[];
      image?: string | null;
    }
  ): Promise<LedFxPlaylist> {
    // Get current playlist
    const current = await this.getPlaylist(id);
    if (!current) throw new Error(`Playlist '${id}' not found`);

    // Upsert existing with merged values (safe in-place replacement)
    const merged: LedFxPlaylist = {
      ...current,
      ...updates,
      id,
      name: updates.name || current.name,
      items: updates.items || current.items || [],
      mode: updates.mode || current.mode || "sequence",
      default_duration_ms:
        updates.default_duration_ms || current.default_duration_ms || 15000,
      timing: updates.timing !== undefined ? updates.timing : current.timing,
      tags: updates.tags !== undefined ? updates.tags : current.tags,
      image: updates.image !== undefined ? updates.image : current.image,
    };

    const response = await this.request<{
      status: string;
      data?: {
        playlist?: LedFxPlaylist;
      };
    }>("/playlists", {
      method: "POST",
      body: JSON.stringify(merged),
    });

    return response.data?.playlist || merged;
  }

  /**
   * Delete a playlist (action)
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    await this.request("/playlists", {
      method: "DELETE",
      body: JSON.stringify({
        id: playlistId,
      }),
    });
  }

  /**
   * Add scene to playlist (action)
   */
  async addSceneToPlaylist(
    playlistId: string,
    sceneId: string,
    durationMs?: number
  ): Promise<void> {
    const playlist = await this.getPlaylist(playlistId);
    if (!playlist) throw new Error(`Playlist '${playlistId}' not found`);
    
    const items = [...(playlist.items || []), { scene_id: sceneId, duration_ms: durationMs }];
    await this.updatePlaylist(playlistId, { items });
  }

  // ========== Backup/Restore ==========

  /**
   * Create a complete backup of LedFX configuration (action)
   */
  async createBackup(description?: string): Promise<LedFxBackup> {
    // Get LedFX version
    let ledfxVersion: string | undefined;
    try {
      const info = await this.getInfo();
      ledfxVersion = info.version;
    } catch {
      // Version info not critical
    }

    // Get all virtuals with their current effects
    const virtualsResponse = await this.request<{ virtuals: Record<string, any> }>("/virtuals");
    const virtuals: BackupVirtual[] = Object.entries(virtualsResponse.virtuals || {}).map(
      ([id, v]: [string, any]) => ({
        id,
        config: v.config || { name: v.config?.name || id },
        active: v.active ?? false,
        effect: v.effect ? {
          type: v.effect.type,
          config: v.effect.config || {},
        } : undefined,
      })
    );

    // Get all scenes with their virtual configurations
    const scenesResponse = await this.request<{ scenes: Record<string, any> }>("/scenes");
    const scenes: BackupScene[] = Object.entries(scenesResponse.scenes || {}).map(
      ([id, s]: [string, any]) => ({
        id,
        name: s.name || id,
        scene_tags: s.scene_tags,
        virtuals: s.virtuals || {},
      })
    );

    // Get all playlists
    const playlistsResponse = await this.getPlaylists();
    const playlists: BackupPlaylist[] = Object.entries(playlistsResponse).map(
      ([id, p]: [string, any]) => ({
        id,
        name: p.name || id,
        items: p.items || [],
        mode: p.mode || "sequence",
        default_duration_ms: p.default_duration_ms || 15000,
        timing: p.timing,
        tags: p.tags,
        image: p.image,
      })
    );

    // Get audio config
    let audio: BackupAudioConfig | undefined;
    try {
      audio = await this.getAudioDevices();
    } catch {
      // Audio config not critical
    }

    return {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      ledfx_version: ledfxVersion,
      virtuals,
      scenes,
      playlists,
      audio,
      metadata: {
        description,
        created_by: "ledfx-mcp",
      },
    };
  }

  /**
   * Restore LedFX configuration from a backup (action)
   */
  async restoreBackup(
    backup: LedFxBackup,
    options: RestoreOptions = {}
  ): Promise<RestoreResult> {
    const {
      restore_virtuals = true,
      restore_scenes = true,
      restore_playlists = true,
      restore_audio = false,
      clear_existing = false,
      dry_run = false,
    } = options;

    const result: RestoreResult = {
      success: true,
      dry_run,
      virtuals: { restored: 0, skipped: 0, errors: [] },
      scenes: { restored: 0, skipped: 0, deleted: 0, errors: [] },
      playlists: { restored: 0, skipped: 0, deleted: 0, errors: [] },
      audio: { restored: false },
    };

    // Clear existing if requested
    if (clear_existing && !dry_run) {
      // Delete existing scenes (except those not in backup if not clearing)
      if (restore_scenes) {
        const currentScenes = await this.getScenes();
        for (const scene of currentScenes) {
          try {
            await this.deleteScene(scene.id);
            result.scenes.deleted++;
          } catch (e) {
            result.scenes.errors.push(`Failed to delete scene '${scene.id}': ${e}`);
          }
        }
      }

      // Delete existing playlists
      if (restore_playlists) {
        const currentPlaylists = await this.getPlaylists();
        for (const playlistId of Object.keys(currentPlaylists)) {
          try {
            await this.deletePlaylist(playlistId);
            result.playlists.deleted++;
          } catch (e) {
            result.playlists.errors.push(`Failed to delete playlist '${playlistId}': ${e}`);
          }
        }
      }
    }

    // Restore virtual effects
    if (restore_virtuals) {
      for (const virtual of backup.virtuals) {
        if (dry_run) {
          result.virtuals.restored++;
          continue;
        }

        try {
          // Set virtual active state
          await this.setVirtualActive(virtual.id, virtual.active);

          // Set effect if present
          if (virtual.effect) {
            await this.setVirtualEffect(
              virtual.id,
              virtual.effect.type,
              virtual.effect.config
            );
          } else {
            // Clear effect if none in backup
            try {
              await this.clearVirtualEffect(virtual.id);
            } catch {
              // Ignore if no effect to clear
            }
          }
          result.virtuals.restored++;
        } catch (e) {
          result.virtuals.errors.push(`Failed to restore virtual '${virtual.id}': ${e}`);
          result.virtuals.skipped++;
        }
      }
    }

    // Restore scenes
    if (restore_scenes) {
      for (const scene of backup.scenes) {
        if (dry_run) {
          result.scenes.restored++;
          continue;
        }

        try {
          // First, apply the virtual effects from the scene
          for (const [virtualId, virtualConfig] of Object.entries(scene.virtuals)) {
            if (virtualConfig.effect) {
              await this.setVirtualEffect(
                virtualId,
                virtualConfig.effect.type,
                virtualConfig.effect.config
              );
            }
          }

          // Delete existing scene if it exists (to update it)
          try {
            await this.deleteScene(scene.id);
          } catch {
            // Scene might not exist, that's fine
          }

          // Create the scene
          await this.createScene(scene.name || scene.id, scene.scene_tags);
          result.scenes.restored++;
        } catch (e) {
          result.scenes.errors.push(`Failed to restore scene '${scene.id}': ${e}`);
          result.scenes.skipped++;
        }
      }
    }

    // Restore playlists
    if (restore_playlists) {
      for (const playlist of backup.playlists) {
        if (dry_run) {
          result.playlists.restored++;
          continue;
        }

        try {
          // Delete existing playlist if it exists
          try {
            await this.deletePlaylist(playlist.id);
          } catch {
            // Playlist might not exist, that's fine
          }

          // Create the playlist
          await this.createPlaylist(
            playlist.id,
            playlist.name,
            playlist.items,
            {
              mode: playlist.mode,
              default_duration_ms: playlist.default_duration_ms,
            }
          );
          result.playlists.restored++;
        } catch (e) {
          result.playlists.errors.push(`Failed to restore playlist '${playlist.id}': ${e}`);
          result.playlists.skipped++;
        }
      }
    }

    // Restore audio config
    if (restore_audio && backup.audio) {
      if (dry_run) {
        result.audio.restored = true;
      } else {
        try {
          await this.setAudioDevice(backup.audio.active_device_index);
          result.audio.restored = true;
        } catch (e) {
          result.audio.error = `Failed to restore audio config: ${e}`;
        }
      }
    }

    // Check overall success
    result.success =
      result.virtuals.errors.length === 0 &&
      result.scenes.errors.length === 0 &&
      result.playlists.errors.length === 0 &&
      !result.audio.error;

    return result;
  }

  /**
   * Validate a backup file structure (calculation)
   */
  validateBackup(backup: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!backup || typeof backup !== "object") {
      return { valid: false, errors: ["Backup must be an object"] };
    }

    const b = backup as Record<string, any>;

    if (!b.version || typeof b.version !== "string") {
      errors.push("Missing or invalid 'version' field");
    }

    if (!b.timestamp || typeof b.timestamp !== "string") {
      errors.push("Missing or invalid 'timestamp' field");
    }

    if (!Array.isArray(b.virtuals)) {
      errors.push("Missing or invalid 'virtuals' field (must be array)");
    } else {
      b.virtuals.forEach((v: any, i: number) => {
        if (!v.id) errors.push(`Virtual at index ${i} missing 'id'`);
      });
    }

    if (!Array.isArray(b.scenes)) {
      errors.push("Missing or invalid 'scenes' field (must be array)");
    } else {
      b.scenes.forEach((s: any, i: number) => {
        if (!s.id) errors.push(`Scene at index ${i} missing 'id'`);
      });
    }

    if (!Array.isArray(b.playlists)) {
      errors.push("Missing or invalid 'playlists' field (must be array)");
    } else {
      b.playlists.forEach((p: any, i: number) => {
        if (!p.id) errors.push(`Playlist at index ${i} missing 'id'`);
      });
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Factory function to create LedFX client with default configuration
 * This is a calculation that returns an action-capable object
 */
export function createLedFxClient(config?: Partial<LedFxConfig>): LedFxClient {
  const defaultConfig: LedFxConfig = {
    host: process.env.LEDFX_HOST || "localhost",
    port: parseInt(process.env.LEDFX_PORT || "8888", 10),
  };

  return new LedFxClient({ ...defaultConfig, ...config });
}
