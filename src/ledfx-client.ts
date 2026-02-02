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

export interface LedFxDevice {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
}

export interface LedFxVirtual {
  id: string;
  config: {
    name: string;
    pixel_count: number;
  };
  active: boolean;
  effect?: {
    type: string;
    config: Record<string, any>;
  };
  segments?: Array<[string, number, number, boolean]>;
}

export interface LedFxScene {
  id: string;
  name: string;
  scene_tags?: string;
  virtuals?: Record<string, {
    effect: {
      type: string;
      config: Record<string, any>;
    };
  }>;
}

export interface LedFxPreset {
  name: string;
  config: Record<string, any>;
}

export interface EffectSchema {
  schema: {
    type: string;
    properties: Record<string, any>;
  };
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
        
        throw new Error(
          `LedFX API error: ${response.status} ${response.statusText}${
            errorBody ? ` - ${errorBody}` : ""
          }`
        );
      }

      const data = (await response.json()) as T;
      logger.httpResponse(method, endpoint, response.status, durationMs);
      
      return data;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      
      // Only wrap network/connection errors, not API errors
      if (error instanceof Error && error.message.startsWith("LedFX API error:")) {
        throw error; // Re-throw API errors as-is
      }
      
      const errorMessage = `Failed to connect to LedFX at ${url}: ${
        error instanceof Error ? error.message : String(error)
      }`;
      
      logger.error(`HTTP request failed`, { endpoint, error: errorMessage, durationMs });
      
      throw new Error(errorMessage);
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
    return await this.request(`/virtuals/${virtualId}`);
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
    const response = await this.request<{ scenes: Record<string, LedFxScene> }>(
      "/scenes"
    );
    return Object.values(response.scenes || {});
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
  async createScene(name: string, sceneTags?: string): Promise<void> {
    await this.request(`/scenes`, {
      method: "POST",
      body: JSON.stringify({
        name,
        scene_tags: sceneTags,
      }),
    });
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
   * Get effect schemas (action)
   */
  async getEffectSchemas(): Promise<Record<string, EffectSchema>> {
    return await this.request("/schema/effects");
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
  async getPlaylists(): Promise<Record<string, any>> {
    const response = await this.request<{ playlists: Record<string, any> }>("/playlists");
    return response.playlists || {};
  }

  /**
   * Get a specific playlist (action)
   */
  async getPlaylist(playlistId: string): Promise<Record<string, any> | null> {
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
  async getPlaylistStatus(): Promise<Record<string, any>> {
    // LedFX doesn't have a dedicated status endpoint, but we can try to get info
    const playlists = await this.getPlaylists();
    return { playlists };
  }

  /**
   * Create a new playlist (action)
   */
  async createPlaylist(
    id: string,
    name: string,
    items: Array<{ scene_id: string; duration_ms?: number }>,
    options?: {
      mode?: "sequence" | "shuffle";
      default_duration_ms?: number;
    }
  ): Promise<Record<string, any>> {
    const response = await this.request<{ status: string; data: { playlist: Record<string, any> } }>("/playlists", {
      method: "POST",
      body: JSON.stringify({
        id,
        name,
        items,
        mode: options?.mode || "sequence",
        default_duration_ms: options?.default_duration_ms || 15000,
      }),
    });
    return response.data?.playlist || {};
  }

  /**
   * Update an existing playlist (action)
   */
  async updatePlaylist(
    id: string,
    updates: {
      name?: string;
      items?: Array<{ scene_id: string; duration_ms?: number }>;
      mode?: "sequence" | "shuffle";
      default_duration_ms?: number;
    }
  ): Promise<void> {
    await this.request("/playlists", {
      method: "PUT",
      body: JSON.stringify({
        action: "update",
        id,
        ...updates,
      }),
    });
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
