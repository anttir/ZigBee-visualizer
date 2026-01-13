/**
 * TanStack Query hook for fetching sensor data from Dirigera hub
 *
 * Provides auto-refreshing sensor data with caching, error handling,
 * and loading states using TanStack Query (React Query).
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { DirigeeraDevice } from '@zigbee-visualizer/shared-types';
import { getDirigeraClient, DirigeeraApiError } from '../dirigera-client';

/**
 * Query key factory for sensor data queries
 */
export const sensorQueryKeys = {
  all: ['sensor-data'] as const,
  devices: () => [...sensorQueryKeys.all, 'devices'] as const,
  device: (id: string) => [...sensorQueryKeys.all, 'device', id] as const,
  rooms: () => [...sensorQueryKeys.all, 'rooms'] as const,
  hubInfo: () => [...sensorQueryKeys.all, 'hub-info'] as const,
  health: () => [...sensorQueryKeys.all, 'health'] as const,
};

/**
 * Hook options for customizing sensor data fetching
 */
export interface UseSensorDataOptions {
  /**
   * Auto-refresh interval in milliseconds
   * @default 30000 (30 seconds)
   */
  refetchInterval?: number;

  /**
   * Whether to enable auto-refresh
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to refetch on window focus
   * @default true
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Whether to retry failed requests
   * @default 3
   */
  retry?: number | boolean;

  /**
   * Stale time in milliseconds
   * @default 0 (always consider stale, but cache is used)
   */
  staleTime?: number;
}

/**
 * Hook to fetch all devices from the Dirigera hub
 * Auto-refreshes every 30 seconds by default
 *
 * @param options - Query options
 * @returns Query result with devices data
 *
 * @example
 * ```tsx
 * function DeviceList() {
 *   const { data: devices, isLoading, error } = useSensorData();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <ul>
 *       {devices?.map(device => (
 *         <li key={device.id}>{device.customName}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useSensorData(
  options: UseSensorDataOptions = {}
): UseQueryResult<DirigeeraDevice[], DirigeeraApiError> {
  const {
    refetchInterval = 30000, // 30 seconds
    enabled = true,
    refetchOnWindowFocus = true,
    retry = 3,
    staleTime = 0,
  } = options;

  return useQuery<DirigeeraDevice[], DirigeeraApiError>({
    queryKey: sensorQueryKeys.devices(),
    queryFn: async () => {
      const client = getDirigeraClient();
      return await client.getDevices();
    },
    refetchInterval: enabled ? refetchInterval : false,
    refetchOnWindowFocus,
    retry,
    staleTime,
    enabled,
  });
}

/**
 * Hook to fetch a specific device by ID
 *
 * @param deviceId - Device ID to fetch
 * @param options - Query options
 * @returns Query result with device data
 *
 * @example
 * ```tsx
 * function DeviceDetails({ deviceId }: { deviceId: string }) {
 *   const { data: device, isLoading } = useDevice(deviceId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!device) return <div>Device not found</div>;
 *
 *   return <div>{device.customName}</div>;
 * }
 * ```
 */
export function useDevice(
  deviceId: string,
  options: UseSensorDataOptions = {}
): UseQueryResult<DirigeeraDevice, DirigeeraApiError> {
  const {
    refetchInterval = 30000,
    enabled = true,
    refetchOnWindowFocus = true,
    retry = 3,
    staleTime = 0,
  } = options;

  return useQuery<DirigeeraDevice, DirigeeraApiError>({
    queryKey: sensorQueryKeys.device(deviceId),
    queryFn: async () => {
      const client = getDirigeraClient();
      return await client.getDevice(deviceId);
    },
    refetchInterval: enabled ? refetchInterval : false,
    refetchOnWindowFocus,
    retry,
    staleTime,
    enabled: enabled && !!deviceId,
  });
}

/**
 * Hook to fetch all rooms from the Dirigera hub
 *
 * @param options - Query options
 * @returns Query result with rooms data
 *
 * @example
 * ```tsx
 * function RoomList() {
 *   const { data: rooms, isLoading } = useRooms();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <ul>
 *       {rooms?.map(room => (
 *         <li key={room.id}>{room.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useRooms(options: UseSensorDataOptions = {}) {
  const {
    refetchInterval = 60000, // 1 minute (rooms change less frequently)
    enabled = true,
    refetchOnWindowFocus = false,
    retry = 3,
    staleTime = 30000, // Consider stale after 30 seconds
  } = options;

  return useQuery({
    queryKey: sensorQueryKeys.rooms(),
    queryFn: async () => {
      const client = getDirigeraClient();
      return await client.getRooms();
    },
    refetchInterval: enabled ? refetchInterval : false,
    refetchOnWindowFocus,
    retry,
    staleTime,
    enabled,
  });
}

/**
 * Hook to fetch hub information
 *
 * @param options - Query options
 * @returns Query result with hub info
 *
 * @example
 * ```tsx
 * function HubInfo() {
 *   const { data: hubInfo } = useHubInfo();
 *
 *   return (
 *     <div>
 *       <p>Model: {hubInfo?.model}</p>
 *       <p>Firmware: {hubInfo?.firmwareVersion}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useHubInfo(options: UseSensorDataOptions = {}) {
  const {
    refetchInterval = false, // Hub info changes rarely
    enabled = true,
    refetchOnWindowFocus = false,
    retry = 3,
    staleTime = 300000, // Consider stale after 5 minutes
  } = options;

  return useQuery({
    queryKey: sensorQueryKeys.hubInfo(),
    queryFn: async () => {
      const client = getDirigeraClient();
      return await client.getHubInfo();
    },
    refetchInterval,
    refetchOnWindowFocus,
    retry,
    staleTime,
    enabled,
  });
}

/**
 * Hook to perform hub health check
 *
 * @param options - Query options
 * @returns Query result with health status
 *
 * @example
 * ```tsx
 * function HealthIndicator() {
 *   const { data: health, isLoading } = useHubHealth();
 *
 *   if (isLoading) return <div>Checking...</div>;
 *
 *   return (
 *     <div>
 *       Status: {health?.healthy ? 'Online' : 'Offline'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useHubHealth(options: UseSensorDataOptions = {}) {
  const {
    refetchInterval = 60000, // 1 minute
    enabled = true,
    refetchOnWindowFocus = true,
    retry = 1, // Only retry once for health checks
    staleTime = 0,
  } = options;

  return useQuery({
    queryKey: sensorQueryKeys.health(),
    queryFn: async () => {
      const client = getDirigeraClient();
      return await client.healthCheck();
    },
    refetchInterval: enabled ? refetchInterval : false,
    refetchOnWindowFocus,
    retry,
    staleTime,
    enabled,
  });
}

/**
 * Type guard to check if an error is a DirigeeraApiError
 */
export function isDirigeraApiError(error: unknown): error is DirigeeraApiError {
  return error instanceof DirigeeraApiError;
}
