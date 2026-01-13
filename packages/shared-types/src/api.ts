/**
 * IKEA Dirigera API Response Type Definitions
 *
 * This module contains TypeScript type definitions for API responses
 * and authentication from the IKEA Dirigera hub.
 */

import { DirigeeraDevice } from './device';

/**
 * Authentication token storage
 */
export interface AuthToken {
  /** Access token for API authentication */
  token: string;
  /** Timestamp when the token was created (ISO 8601 format) */
  createdAt: string;
  /** Optional expiration timestamp (ISO 8601 format) */
  expiresAt?: string;
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  /** IP address or hostname of the Dirigera hub */
  hubAddress: string;
  /** Port number for the Dirigera hub API (default: 8443) */
  port?: number;
  /** Stored authentication token */
  token?: AuthToken;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** API endpoint path */
  path: string;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: unknown;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Base API response
 */
export interface ApiResponse<T = unknown> {
  /** Response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** Response headers */
  headers: Record<string, string>;
}

/**
 * API error response
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** HTTP status code */
  status: number;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: unknown;
}

/**
 * Device list response
 * Response from GET /v1/devices endpoint
 */
export interface DeviceListResponse {
  /** Array of devices managed by the hub */
  devices: DirigeeraDevice[];
}

/**
 * Single device response
 * Response from GET /v1/devices/{id} endpoint
 */
export interface DeviceResponse {
  /** Device information */
  device: DirigeeraDevice;
}

/**
 * Device update request
 * Request body for PATCH /v1/devices/{id} endpoint
 */
export interface DeviceUpdateRequest {
  /** Updated attributes */
  attributes?: {
    /** New custom name for the device */
    customName?: string;
  };
}

/**
 * Hub information response
 * Response from GET /v1/hub endpoint
 */
export interface HubInfoResponse {
  /** Hub unique identifier */
  id: string;
  /** Hub firmware version */
  firmwareVersion: string;
  /** Hub hardware version */
  hardwareVersion: string;
  /** Hub model */
  model: string;
  /** Hub serial number */
  serialNumber?: string;
  /** Whether the hub is online */
  isOnline: boolean;
}

/**
 * Room information response
 */
export interface RoomResponse {
  /** Unique identifier for the room */
  id: string;
  /** Room name */
  name: string;
  /** Icon identifier for the room */
  icon?: string;
  /** Color assigned to the room */
  color?: string;
}

/**
 * Room list response
 * Response from GET /v1/rooms endpoint
 */
export interface RoomListResponse {
  /** Array of rooms configured in the hub */
  rooms: RoomResponse[];
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Whether the hub is healthy */
  healthy: boolean;
  /** Timestamp of the health check (ISO 8601 format) */
  timestamp: string;
  /** Hub uptime in seconds */
  uptime?: number;
}

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 'deviceStateChanged' | 'deviceAdded' | 'deviceRemoved';

/**
 * WebSocket message for real-time updates
 */
export interface WebSocketMessage {
  /** Message type */
  type: WebSocketMessageType;
  /** Message payload */
  data: unknown;
  /** Timestamp when the message was sent (ISO 8601 format) */
  timestamp: string;
}

/**
 * Device state changed WebSocket message
 */
export interface DeviceStateChangedMessage extends WebSocketMessage {
  type: 'deviceStateChanged';
  /** Updated device information */
  data: DirigeeraDevice;
}

/**
 * Device added WebSocket message
 */
export interface DeviceAddedMessage extends WebSocketMessage {
  type: 'deviceAdded';
  /** New device information */
  data: DirigeeraDevice;
}

/**
 * Device removed WebSocket message
 */
export interface DeviceRemovedMessage extends WebSocketMessage {
  type: 'deviceRemoved';
  /** Device ID that was removed */
  data: {
    deviceId: string;
  };
}

/**
 * Union type of all WebSocket message types
 */
export type DirigeeraWebSocketMessage =
  | DeviceStateChangedMessage
  | DeviceAddedMessage
  | DeviceRemovedMessage;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Total number of items */
  total?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  items: T[];
  /** Pagination metadata */
  pagination: PaginationParams & {
    /** Total number of items */
    total: number;
    /** Current page number */
    page: number;
    /** Number of items per page */
    pageSize: number;
    /** Total number of pages */
    totalPages: number;
  };
}

/**
 * Type guard to check if a WebSocket message is a device state changed message
 */
export function isDeviceStateChangedMessage(
  message: DirigeeraWebSocketMessage
): message is DeviceStateChangedMessage {
  return message.type === 'deviceStateChanged';
}

/**
 * Type guard to check if a WebSocket message is a device added message
 */
export function isDeviceAddedMessage(
  message: DirigeeraWebSocketMessage
): message is DeviceAddedMessage {
  return message.type === 'deviceAdded';
}

/**
 * Type guard to check if a WebSocket message is a device removed message
 */
export function isDeviceRemovedMessage(
  message: DirigeeraWebSocketMessage
): message is DeviceRemovedMessage {
  return message.type === 'deviceRemoved';
}
