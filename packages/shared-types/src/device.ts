/**
 * IKEA Dirigera API Device Type Definitions
 *
 * This module contains TypeScript type definitions for devices
 * managed by the IKEA Dirigera hub.
 */

/**
 * Base device type identifier
 */
export type DeviceType = 'environment_sensor' | 'light' | 'blinds' | 'outlet' | 'controller';

/**
 * Device type identifier (camelCase variant)
 */
export type DeviceTypeIdentifier = 'environmentSensor' | 'light' | 'blinds' | 'outlet' | 'controller';

/**
 * Supported sensor models
 */
export type SensorModel = 'VINDSTYRKA' | 'STARKVIND';

/**
 * Manufacturer information
 */
export type Manufacturer = 'IKEA of Sweden';

/**
 * Room information associated with a device
 */
export interface Room {
  /** Unique identifier for the room */
  id: string;
  /** Human-readable name of the room */
  name: string;
}

/**
 * Base attributes shared by all devices
 */
export interface BaseDeviceAttributes {
  /** Custom name assigned to the device */
  customName: string;
  /** Device model identifier */
  model: string;
  /** Device manufacturer */
  manufacturer: Manufacturer;
  /** Current firmware version */
  firmwareVersion: string;
  /** Hardware version identifier */
  hardwareVersion: string;
}

/**
 * Environment sensor specific attributes
 * Used for air quality and climate monitoring devices
 */
export interface EnvironmentSensorAttributes extends BaseDeviceAttributes {
  /** Current temperature in Celsius */
  currentTemperature?: number;
  /** Current relative humidity percentage (0-100) */
  currentRH?: number;
  /** Current PM2.5 particulate matter level in μg/m³ */
  currentPM25?: number;
  /** Volatile Organic Compounds index (1-500) */
  vocIndex?: number;
}

/**
 * Device capabilities defining what actions can be performed
 */
export interface DeviceCapabilities {
  /** Actions that can be sent to this device */
  canSend: string[];
  /** Properties that can be received/modified on this device */
  canReceive: string[];
}

/**
 * Base device interface shared by all device types
 */
export interface BaseDevice {
  /** Unique identifier for the device */
  id: string;
  /** Device type identifier (snake_case) */
  type: DeviceType;
  /** Device type identifier (camelCase) */
  deviceType: DeviceTypeIdentifier;
  /** Custom name assigned to the device */
  customName: string;
  /** Whether the device is currently reachable */
  isReachable: boolean;
  /** Device capabilities */
  capabilities: DeviceCapabilities;
  /** Room where the device is located */
  room?: Room;
}

/**
 * Environment sensor device
 * Represents air quality and climate monitoring sensors like VINDSTYRKA
 */
export interface EnvironmentSensorDevice extends BaseDevice {
  type: 'environment_sensor';
  deviceType: 'environmentSensor';
  /** Sensor-specific attributes including temperature, humidity, PM2.5, and VOC */
  attributes: EnvironmentSensorAttributes;
}

/**
 * Union type of all supported device types
 * Add additional device types here as they are implemented
 */
export type DirigeeraDevice = EnvironmentSensorDevice;

/**
 * Type guard to check if a device is an environment sensor
 */
export function isEnvironmentSensor(device: DirigeeraDevice): device is EnvironmentSensorDevice {
  return device.type === 'environment_sensor' && device.deviceType === 'environmentSensor';
}

/**
 * Type guard to check if a device has temperature readings
 */
export function hasTemperature(device: DirigeeraDevice): device is EnvironmentSensorDevice {
  return isEnvironmentSensor(device) &&
    typeof device.attributes.currentTemperature === 'number';
}

/**
 * Type guard to check if a device has humidity readings
 */
export function hasHumidity(device: DirigeeraDevice): device is EnvironmentSensorDevice {
  return isEnvironmentSensor(device) &&
    typeof device.attributes.currentRH === 'number';
}

/**
 * Type guard to check if a device has PM2.5 readings
 */
export function hasPM25(device: DirigeeraDevice): device is EnvironmentSensorDevice {
  return isEnvironmentSensor(device) &&
    typeof device.attributes.currentPM25 === 'number';
}

/**
 * Type guard to check if a device has VOC readings
 */
export function hasVOC(device: DirigeeraDevice): device is EnvironmentSensorDevice {
  return isEnvironmentSensor(device) &&
    typeof device.attributes.vocIndex === 'number';
}
