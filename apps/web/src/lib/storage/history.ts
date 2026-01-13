/**
 * IndexedDB wrapper for storing historical sensor data
 *
 * This module provides utilities for storing and querying sensor readings
 * using IndexedDB for local persistence. Automatically cleans up data older
 * than 30 days to prevent excessive storage usage.
 */

import type {
  SensorReading,
  DeviceSensorSnapshot,
  SensorDataQuery,
  SensorReadingType,
} from '@zigbee-visualizer/shared-types';

const DB_NAME = 'dirigera_sensor_history';
const DB_VERSION = 1;
const STORE_NAME = 'sensor_readings';
const MAX_AGE_DAYS = 30;

/**
 * IndexedDB database instance
 */
let db: IDBDatabase | null = null;

/**
 * Initialize the IndexedDB database
 * Creates the database and object stores if they don't exist
 */
export async function initDatabase(): Promise<IDBDatabase> {
  if (db) {
    return db;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB database'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object store for sensor readings
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });

        // Create indexes for efficient querying
        store.createIndex('deviceId', 'deviceId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('deviceId_timestamp', ['deviceId', 'timestamp'], {
          unique: false,
        });
        store.createIndex('type_timestamp', ['type', 'timestamp'], {
          unique: false,
        });
      }
    };
  });
}

/**
 * Store a sensor reading in IndexedDB
 * @param reading - Sensor reading to store
 */
export async function storeSensorReading(reading: SensorReading): Promise<void> {
  try {
    const database = await initDatabase();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.add(reading);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to store sensor reading'));
      };
    });
  } catch (error) {
    console.error('Failed to store sensor reading:', error);
    throw error;
  }
}

/**
 * Store multiple sensor readings in a batch
 * More efficient than storing readings one at a time
 * @param readings - Array of sensor readings to store
 */
export async function storeSensorReadings(readings: SensorReading[]): Promise<void> {
  try {
    const database = await initDatabase();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      let completed = 0;
      const total = readings.length;

      if (total === 0) {
        resolve();
        return;
      }

      readings.forEach((reading) => {
        const request = store.add(reading);

        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            resolve();
          }
        };

        request.onerror = () => {
          reject(new Error('Failed to store sensor readings'));
        };
      });
    });
  } catch (error) {
    console.error('Failed to store sensor readings:', error);
    throw error;
  }
}

/**
 * Store a device sensor snapshot (all readings from a device at once)
 * @param snapshot - Device sensor snapshot to store
 */
export async function storeDeviceSnapshot(snapshot: DeviceSensorSnapshot): Promise<void> {
  const readings: SensorReading[] = [];

  // Convert snapshot to individual readings
  if (snapshot.temperature !== undefined) {
    readings.push({
      deviceId: snapshot.deviceId,
      deviceName: snapshot.deviceName,
      roomName: snapshot.roomName,
      timestamp: snapshot.timestamp,
      type: 'temperature',
      value: snapshot.temperature,
      unit: '°C',
    });
  }

  if (snapshot.humidity !== undefined) {
    readings.push({
      deviceId: snapshot.deviceId,
      deviceName: snapshot.deviceName,
      roomName: snapshot.roomName,
      timestamp: snapshot.timestamp,
      type: 'humidity',
      value: snapshot.humidity,
      unit: '%',
    });
  }

  if (snapshot.pm25 !== undefined) {
    readings.push({
      deviceId: snapshot.deviceId,
      deviceName: snapshot.deviceName,
      roomName: snapshot.roomName,
      timestamp: snapshot.timestamp,
      type: 'pm25',
      value: snapshot.pm25,
      unit: 'μg/m³',
    });
  }

  if (snapshot.vocIndex !== undefined) {
    readings.push({
      deviceId: snapshot.deviceId,
      deviceName: snapshot.deviceName,
      roomName: snapshot.roomName,
      timestamp: snapshot.timestamp,
      type: 'voc',
      value: snapshot.vocIndex,
      unit: 'index',
    });
  }

  if (readings.length > 0) {
    await storeSensorReadings(readings);
  }
}

/**
 * Query sensor readings from IndexedDB
 * @param query - Query parameters
 * @returns Array of sensor readings matching the query
 */
export async function querySensorReadings(
  query: SensorDataQuery = {}
): Promise<SensorReading[]> {
  try {
    const database = await initDatabase();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      let request: IDBRequest;

      // Use appropriate index based on query
      if (query.deviceId && query.timeRange) {
        const index = store.index('deviceId_timestamp');
        const range = IDBKeyRange.bound(
          [query.deviceId, query.timeRange.start],
          [query.deviceId, query.timeRange.end]
        );
        request = index.getAll(range);
      } else if (query.deviceId) {
        const index = store.index('deviceId');
        request = index.getAll(query.deviceId);
      } else if (query.timeRange) {
        const index = store.index('timestamp');
        const range = IDBKeyRange.bound(query.timeRange.start, query.timeRange.end);
        request = index.getAll(range);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        let results = request.result as SensorReading[];

        // Apply additional filters
        if (query.types && query.types.length > 0) {
          results = results.filter((reading) => query.types!.includes(reading.type));
        }

        if (query.roomName) {
          results = results.filter((reading) => reading.roomName === query.roomName);
        }

        // Sort by timestamp (newest first)
        results.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        // Apply pagination
        if (query.offset !== undefined || query.limit !== undefined) {
          const offset = query.offset || 0;
          const limit = query.limit || results.length;
          results = results.slice(offset, offset + limit);
        }

        resolve(results);
      };

      request.onerror = () => {
        reject(new Error('Failed to query sensor readings'));
      };
    });
  } catch (error) {
    console.error('Failed to query sensor readings:', error);
    throw error;
  }
}

/**
 * Get the latest reading for a specific device and sensor type
 * @param deviceId - Device ID
 * @param type - Sensor reading type
 * @returns Latest sensor reading or null if not found
 */
export async function getLatestReading(
  deviceId: string,
  type: SensorReadingType
): Promise<SensorReading | null> {
  try {
    const readings = await querySensorReadings({
      deviceId,
      types: [type],
      limit: 1,
    });

    return readings.length > 0 && readings[0] ? readings[0] : null;
  } catch (error) {
    console.error('Failed to get latest reading:', error);
    return null;
  }
}

/**
 * Clean up old sensor readings (older than MAX_AGE_DAYS)
 * Should be called periodically to prevent excessive storage usage
 */
export async function cleanupOldReadings(): Promise<number> {
  try {
    const database = await initDatabase();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);
    const cutoffTimestamp = cutoffDate.toISOString();

    return new Promise((resolve, reject) => {
      let deletedCount = 0;

      // Get all readings older than cutoff
      const range = IDBKeyRange.upperBound(cutoffTimestamp);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          // No more entries
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        reject(new Error('Failed to cleanup old readings'));
      };
    });
  } catch (error) {
    console.error('Failed to cleanup old readings:', error);
    throw error;
  }
}

/**
 * Clear all sensor readings from the database
 * USE WITH CAUTION - This deletes all historical data
 */
export async function clearAllReadings(): Promise<void> {
  try {
    const database = await initDatabase();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear all readings'));
      };
    });
  } catch (error) {
    console.error('Failed to clear all readings:', error);
    throw error;
  }
}

/**
 * Get storage statistics
 * @returns Storage statistics including total count and date range
 */
export async function getStorageStats(): Promise<{
  totalCount: number;
  oldestTimestamp: string | null;
  newestTimestamp: string | null;
  deviceCount: number;
}> {
  try {
    const database = await initDatabase();
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const countRequest = store.count();
      const getAllRequest = store.getAll();

      let totalCount = 0;
      let allReadings: SensorReading[] = [];

      countRequest.onsuccess = () => {
        totalCount = countRequest.result;
      };

      getAllRequest.onsuccess = () => {
        allReadings = getAllRequest.result as SensorReading[];

        if (allReadings.length === 0) {
          resolve({
            totalCount: 0,
            oldestTimestamp: null,
            newestTimestamp: null,
            deviceCount: 0,
          });
          return;
        }

        // Sort by timestamp
        allReadings.sort((a, b) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

        const oldestTimestamp = allReadings[0]?.timestamp || new Date().toISOString();
        const newestTimestamp = allReadings[allReadings.length - 1]?.timestamp || new Date().toISOString();

        // Count unique devices
        const deviceIds = new Set(allReadings.map((r) => r.deviceId));
        const deviceCount = deviceIds.size;

        resolve({
          totalCount,
          oldestTimestamp,
          newestTimestamp,
          deviceCount,
        });
      };

      countRequest.onerror = () => {
        reject(new Error('Failed to get storage stats'));
      };

      getAllRequest.onerror = () => {
        reject(new Error('Failed to get storage stats'));
      };
    });
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    throw error;
  }
}

/**
 * Close the database connection
 * Should be called when the application is closing
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
