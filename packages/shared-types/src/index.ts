/**
 * @zigbee-visualizer/shared-types
 *
 * Shared TypeScript type definitions for IKEA Dirigera API
 *
 * This package provides comprehensive type definitions for working with
 * the IKEA Dirigera smart home hub API, including device types, sensor
 * readings, and API responses.
 *
 * @packageDocumentation
 */

// Export all device-related types
export {
  // Device types
  DeviceType,
  DeviceTypeIdentifier,
  SensorModel,
  Manufacturer,
  Room,
  BaseDeviceAttributes,
  EnvironmentSensorAttributes,
  DeviceCapabilities,
  BaseDevice,
  EnvironmentSensorDevice,
  DirigeeraDevice,
  // Device type guards
  isEnvironmentSensor,
  hasTemperature,
  hasHumidity,
  hasPM25,
  hasVOC,
} from './device';

// Export all sensor reading types
export {
  // Sensor reading types
  SensorReadingType,
  BaseSensorReading,
  TemperatureReading,
  HumidityReading,
  PM25Reading,
  VOCReading,
  SensorReading,
  DeviceSensorSnapshot,
  TimeRange,
  SensorDataQuery,
  SensorStatistics,
  // Sensor type guards
  isTemperatureReading,
  isHumidityReading,
  isPM25Reading,
  isVOCReading,
} from './sensor';

// Export all API-related types
export {
  // Authentication types
  AuthToken,
  AuthConfig,
  // API request/response types
  ApiRequestConfig,
  ApiResponse,
  ApiError,
  DeviceListResponse,
  DeviceResponse,
  DeviceUpdateRequest,
  HubInfoResponse,
  RoomResponse,
  RoomListResponse,
  HealthCheckResponse,
  // WebSocket types
  WebSocketMessageType,
  WebSocketMessage,
  DeviceStateChangedMessage,
  DeviceAddedMessage,
  DeviceRemovedMessage,
  DirigeeraWebSocketMessage,
  // Pagination types
  PaginationParams,
  PaginatedResponse,
  // API type guards
  isDeviceStateChangedMessage,
  isDeviceAddedMessage,
  isDeviceRemovedMessage,
} from './api';
