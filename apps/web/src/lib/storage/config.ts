/**
 * LocalStorage utilities for storing Dirigera hub configuration
 *
 * This module provides type-safe utilities for storing and retrieving
 * the Dirigera hub IP address and authentication token from browser localStorage.
 */

import type { AuthConfig } from '@zigbee-visualizer/shared-types';

const STORAGE_KEYS = {
  HUB_ADDRESS: 'dirigera_hub_address',
  HUB_PORT: 'dirigera_hub_port',
  AUTH_TOKEN: 'dirigera_auth_token',
  TOKEN_CREATED_AT: 'dirigera_token_created_at',
  TOKEN_EXPIRES_AT: 'dirigera_token_expires_at',
} as const;

/**
 * Configuration stored in localStorage
 */
export interface StoredConfig {
  hubAddress: string;
  port: number;
  token?: string;
  tokenCreatedAt?: string;
  tokenExpiresAt?: string;
}

/**
 * Get the stored hub configuration from localStorage
 * @returns Stored configuration or null if not set
 */
export function getConfig(): StoredConfig | null {
  try {
    const hubAddress = localStorage.getItem(STORAGE_KEYS.HUB_ADDRESS);
    const port = localStorage.getItem(STORAGE_KEYS.HUB_PORT);
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const tokenCreatedAt = localStorage.getItem(STORAGE_KEYS.TOKEN_CREATED_AT);
    const tokenExpiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);

    if (!hubAddress) {
      return null;
    }

    return {
      hubAddress,
      port: port ? parseInt(port, 10) : 8443,
      token: token || undefined,
      tokenCreatedAt: tokenCreatedAt || undefined,
      tokenExpiresAt: tokenExpiresAt || undefined,
    };
  } catch (error) {
    console.error('Failed to get config from localStorage:', error);
    return null;
  }
}

/**
 * Get the hub address (IP:port) from localStorage
 * @returns Hub address string or null if not set
 */
export function getHubAddress(): string | null {
  try {
    const config = getConfig();
    if (!config) {
      return null;
    }
    return `${config.hubAddress}:${config.port}`;
  } catch (error) {
    console.error('Failed to get hub address:', error);
    return null;
  }
}

/**
 * Get the authentication token from localStorage
 * @returns Auth token string or null if not set
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Get the full auth configuration
 * @returns AuthConfig or null if not set
 */
export function getAuthConfig(): AuthConfig | null {
  try {
    const config = getConfig();
    if (!config) {
      return null;
    }

    return {
      hubAddress: config.hubAddress,
      port: config.port,
      token: config.token
        ? {
            token: config.token,
            createdAt: config.tokenCreatedAt || new Date().toISOString(),
            expiresAt: config.tokenExpiresAt,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Failed to get auth config:', error);
    return null;
  }
}

/**
 * Set the hub address in localStorage
 * @param hubAddress - IP address or hostname of the Dirigera hub
 * @param port - Port number (default: 8443)
 */
export function setHubAddress(hubAddress: string, port: number = 8443): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HUB_ADDRESS, hubAddress);
    localStorage.setItem(STORAGE_KEYS.HUB_PORT, port.toString());
  } catch (error) {
    console.error('Failed to set hub address:', error);
    throw new Error('Failed to save hub address to localStorage');
  }
}

/**
 * Set the authentication token in localStorage
 * @param token - Bearer token for API authentication
 * @param expiresAt - Optional expiration timestamp
 */
export function setAuthToken(token: string, expiresAt?: string): void {
  try {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.TOKEN_CREATED_AT, now);
    if (expiresAt) {
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    }
  } catch (error) {
    console.error('Failed to set auth token:', error);
    throw new Error('Failed to save auth token to localStorage');
  }
}

/**
 * Set the complete configuration in localStorage
 * @param config - Configuration to store
 */
export function setConfig(config: StoredConfig): void {
  try {
    setHubAddress(config.hubAddress, config.port);
    if (config.token) {
      setAuthToken(config.token, config.tokenExpiresAt);
    }
  } catch (error) {
    console.error('Failed to set config:', error);
    throw new Error('Failed to save configuration to localStorage');
  }
}

/**
 * Clear all stored configuration from localStorage
 */
export function clearConfig(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear config:', error);
    throw new Error('Failed to clear configuration from localStorage');
  }
}

/**
 * Check if the stored token is expired
 * @returns true if token is expired or expiration check is not applicable
 */
export function isTokenExpired(): boolean {
  try {
    const expiresAt = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    if (!expiresAt) {
      // No expiration set, consider token valid
      return false;
    }

    const expirationDate = new Date(expiresAt);
    const now = new Date();
    return now >= expirationDate;
  } catch (error) {
    console.error('Failed to check token expiration:', error);
    // On error, consider token expired for safety
    return true;
  }
}

/**
 * Check if configuration is complete and valid
 * @returns true if hub address and token are set and token is not expired
 */
export function isConfigured(): boolean {
  try {
    const config = getConfig();
    if (!config || !config.hubAddress || !config.token) {
      return false;
    }
    return !isTokenExpired();
  } catch (error) {
    console.error('Failed to check configuration:', error);
    return false;
  }
}
