/**
 * Dirigera API Client
 *
 * Axios-based HTTP client for communicating with the IKEA Dirigera hub API.
 * Configured with base URL from localStorage and Bearer token authentication.
 *
 * IMPORTANT: CORS Limitations
 * ----------------------------
 * The Dirigera hub uses self-signed HTTPS certificates and does not include
 * CORS headers in its responses. This means direct browser requests will fail
 * due to browser security policies.
 *
 * Workarounds for development:
 * 1. Use a CORS proxy (e.g., cors-anywhere, local proxy server)
 * 2. Use a browser extension to disable CORS (NOT recommended for production)
 * 3. Use a backend API that proxies requests to the Dirigera hub
 * 4. Disable web security in Chrome: chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome"
 *
 * For production, option 3 (backend proxy) is the recommended approach.
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import type {
  DirigeeraDevice,
  ApiError,
  HubInfoResponse,
  RoomResponse,
  HealthCheckResponse,
} from '@zigbee-visualizer/shared-types';
import { getAuthToken, getHubAddress } from '../storage/config';

/**
 * Custom error class for Dirigera API errors
 */
export class DirigeeraApiError extends Error implements ApiError {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'DirigeeraApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Dirigera API client class
 */
export class DirigeeraClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(hubAddress?: string, token?: string) {
    // Get from localStorage if not provided
    const address = hubAddress || getHubAddress();
    const authToken = token || getAuthToken();

    if (!address) {
      throw new Error(
        'Hub address not configured. Please set the hub address in settings.'
      );
    }

    // Construct base URL with HTTPS
    this.baseURL = `https://${address}/v1`;

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      // IMPORTANT: This is required for self-signed certificates
      // In a real browser environment, you may need to handle this differently
      validateStatus: (status) => status >= 200 && status < 300,
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = authToken || getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle axios errors and convert to DirigeeraApiError
   */
  private handleError(error: AxiosError): DirigeeraApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return new DirigeeraApiError(
        data?.message || error.message || 'API request failed',
        error.response.status,
        data?.code,
        data
      );
    } else if (error.request) {
      // Request made but no response received
      // This is common with CORS issues
      return new DirigeeraApiError(
        'Unable to connect to Dirigera hub. Please check:\n' +
          '1. Hub IP address is correct\n' +
          '2. Hub is online and accessible\n' +
          '3. CORS proxy is configured (browser limitation)\n' +
          '4. Network connection is stable',
        0,
        'NETWORK_ERROR',
        { originalError: error.message }
      );
    } else {
      // Something else happened
      return new DirigeeraApiError(
        error.message || 'Unknown error occurred',
        0,
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Get all devices from the hub
   * @returns Array of Dirigera devices
   */
  async getDevices(): Promise<DirigeeraDevice[]> {
    try {
      const response = await this.client.get<DirigeeraDevice[]>('/devices');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      throw error;
    }
  }

  /**
   * Get a specific device by ID
   * @param deviceId - Unique device identifier
   * @returns Device information
   */
  async getDevice(deviceId: string): Promise<DirigeeraDevice> {
    try {
      const response = await this.client.get<DirigeeraDevice>(`/devices/${deviceId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Get hub information
   * @returns Hub information
   */
  async getHubInfo(): Promise<HubInfoResponse> {
    try {
      const response = await this.client.get<HubInfoResponse>('/hub');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch hub info:', error);
      throw error;
    }
  }

  /**
   * Get all rooms configured in the hub
   * @returns Array of rooms
   */
  async getRooms(): Promise<RoomResponse[]> {
    try {
      const response = await this.client.get<RoomResponse[]>('/rooms');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      throw error;
    }
  }

  /**
   * Perform a health check on the hub
   * @returns Health check response
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await this.client.get<HealthCheckResponse>('/health');
      return response.data;
    } catch (error) {
      // Health check failures should not throw, just return unhealthy status
      return {
        healthy: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Update the hub address and recreate the client
   * @param hubAddress - New hub address (IP:port)
   */
  updateHubAddress(hubAddress: string): void {
    this.baseURL = `https://${hubAddress}/v1`;
    this.client.defaults.baseURL = this.baseURL;
  }

  /**
   * Update the authentication token
   * @param token - New authentication token
   */
  updateToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get the current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

/**
 * Create a singleton instance of the Dirigera client
 * This can be used throughout the application
 */
let clientInstance: DirigeeraClient | null = null;

/**
 * Get the singleton Dirigera client instance
 * Creates a new instance if one doesn't exist
 * @returns DirigeeraClient instance
 */
export function getDirigeraClient(): DirigeeraClient {
  if (!clientInstance) {
    clientInstance = new DirigeeraClient();
  }
  return clientInstance;
}

/**
 * Reset the singleton client instance
 * Useful when configuration changes
 */
export function resetDirigeraClient(): void {
  clientInstance = null;
}

/**
 * Create a new Dirigera client instance
 * @param hubAddress - Hub address (IP:port)
 * @param token - Authentication token
 * @returns New DirigeeraClient instance
 */
export function createDirigeraClient(hubAddress?: string, token?: string): DirigeeraClient {
  return new DirigeeraClient(hubAddress, token);
}
