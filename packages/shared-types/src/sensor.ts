/**
 * IKEA Dirigera API Sensor Reading Type Definitions
 *
 * This module contains TypeScript type definitions for storing
 * and managing historical sensor data from Dirigera devices.
 */

/**
 * Sensor reading type identifier
 */
export type SensorReadingType = 'temperature' | 'humidity' | 'pm25' | 'voc';

/**
 * Base sensor reading interface
 * Used for storing time-series data from sensors
 */
export interface BaseSensorReading {
  /** Unique identifier for the device */
  deviceId: string;
  /** Device name for easier identification */
  deviceName: string;
  /** Room where the device is located */
  roomName?: string;
  /** Timestamp when the reading was taken (ISO 8601 format) */
  timestamp: string;
  /** Type of sensor reading */
  type: SensorReadingType;
}

/**
 * Temperature sensor reading
 */
export interface TemperatureReading extends BaseSensorReading {
  type: 'temperature';
  /** Temperature value in Celsius */
  value: number;
  /** Unit of measurement */
  unit: '°C';
}

/**
 * Humidity sensor reading
 */
export interface HumidityReading extends BaseSensorReading {
  type: 'humidity';
  /** Relative humidity percentage (0-100) */
  value: number;
  /** Unit of measurement */
  unit: '%';
}

/**
 * PM2.5 particulate matter sensor reading
 */
export interface PM25Reading extends BaseSensorReading {
  type: 'pm25';
  /** PM2.5 concentration in micrograms per cubic meter */
  value: number;
  /** Unit of measurement */
  unit: 'μg/m³';
}

/**
 * VOC (Volatile Organic Compounds) sensor reading
 */
export interface VOCReading extends BaseSensorReading {
  type: 'voc';
  /** VOC index value (1-500) */
  value: number;
  /** Unit of measurement */
  unit: 'index';
}

/**
 * Union type of all sensor reading types
 */
export type SensorReading =
  | TemperatureReading
  | HumidityReading
  | PM25Reading
  | VOCReading;

/**
 * Aggregated sensor readings from a single device at a point in time
 */
export interface DeviceSensorSnapshot {
  /** Unique identifier for the device */
  deviceId: string;
  /** Device name for easier identification */
  deviceName: string;
  /** Room where the device is located */
  roomName?: string;
  /** Timestamp when the snapshot was taken (ISO 8601 format) */
  timestamp: string;
  /** Temperature reading in Celsius */
  temperature?: number;
  /** Relative humidity percentage (0-100) */
  humidity?: number;
  /** PM2.5 concentration in μg/m³ */
  pm25?: number;
  /** VOC index (1-500) */
  vocIndex?: number;
}

/**
 * Time range for querying historical data
 */
export interface TimeRange {
  /** Start time (ISO 8601 format) */
  start: string;
  /** End time (ISO 8601 format) */
  end: string;
}

/**
 * Query parameters for fetching historical sensor data
 */
export interface SensorDataQuery {
  /** Device ID to query */
  deviceId?: string;
  /** Room name to filter by */
  roomName?: string;
  /** Sensor types to include */
  types?: SensorReadingType[];
  /** Time range for the query */
  timeRange?: TimeRange;
  /** Limit the number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Statistical summary of sensor readings over a time period
 */
export interface SensorStatistics {
  /** Type of sensor reading */
  type: SensorReadingType;
  /** Minimum value in the period */
  min: number;
  /** Maximum value in the period */
  max: number;
  /** Average value in the period */
  average: number;
  /** Median value in the period */
  median: number;
  /** Number of readings in the period */
  count: number;
  /** Time range of the statistics */
  timeRange: TimeRange;
}

/**
 * Type guard to check if a reading is a temperature reading
 */
export function isTemperatureReading(reading: SensorReading): reading is TemperatureReading {
  return reading.type === 'temperature';
}

/**
 * Type guard to check if a reading is a humidity reading
 */
export function isHumidityReading(reading: SensorReading): reading is HumidityReading {
  return reading.type === 'humidity';
}

/**
 * Type guard to check if a reading is a PM2.5 reading
 */
export function isPM25Reading(reading: SensorReading): reading is PM25Reading {
  return reading.type === 'pm25';
}

/**
 * Type guard to check if a reading is a VOC reading
 */
export function isVOCReading(reading: SensorReading): reading is VOCReading {
  return reading.type === 'voc';
}
