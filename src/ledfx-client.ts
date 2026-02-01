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

export interface LedFxScene {
  id: string;
  name: string;
}

/**
 * Client for interacting with LedFX instance
 * Deep module with simple interface hiding HTTP complexity
 */
export class LedFxClient {
  private baseUrl: string;

  constructor(config: LedFxConfig) {
    this.baseUrl = `http://${config.host}:${config.port}/api`;
  }

  /**
   * Generic HTTP request method (action - performs I/O)
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(
          `LedFX API error: ${response.status} ${response.statusText}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      throw new Error(
        `Failed to connect to LedFX at ${url}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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
   * Set device effect (action)
   */
  async setEffect(
    deviceId: string,
    effectType: string,
    config: Record<string, any> = {}
  ): Promise<void> {
    await this.request(`/devices/${deviceId}/effects`, {
      method: "POST",
      body: JSON.stringify({
        type: effectType,
        config,
      }),
    });
  }

  /**
   * Clear device effect (action)
   */
  async clearEffect(deviceId: string): Promise<void> {
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
    return Object.values(response.scenes);
  }

  /**
   * Activate a scene (action)
   */
  async activateScene(sceneId: string): Promise<void> {
    await this.request(`/scenes/${sceneId}/activate`, {
      method: "PUT",
    });
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
