/**
 * Dashboard Component
 *
 * Main screen showing all environment sensors with real-time data,
 * air quality indicators, and historical data storage.
 */

import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Clock,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useSensorData } from '@/lib/api/hooks/useSensorData';
import {
  formatTemperature,
  formatHumidity,
  formatPM25,
  formatVOCIndex,
  formatRelativeTime,
  getAirQualityDescription,
  getAirQualityColor,
  formatDeviceStatus,
} from '@/lib/utils/formatters';
import { storeDeviceSnapshot, cleanupOldReadings } from '@/lib/storage/history';
import type { EnvironmentSensorDevice } from '@zigbee-visualizer/shared-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Loading skeleton for sensor cards
 */
function SensorCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * Empty state when no sensors are found
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/20 p-6 mb-6">
        <Activity className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No Sensors Found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
        No environment sensors are currently connected to your Dirigera hub.
        Make sure your sensors are powered on and paired with the hub.
      </p>
    </div>
  );
}

/**
 * Error state with retry button
 */
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6 mb-6">
        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Failed to Load Sensors
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {error.message || 'An error occurred while fetching sensor data. Please try again.'}
      </p>
      <Button onClick={onRetry} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        Retry
      </Button>
    </div>
  );
}

/**
 * Stats overview card showing aggregate metrics
 */
function StatsOverview({ sensors }: { sensors: EnvironmentSensorDevice[] }) {
  // Calculate average temperature
  const temperatures = sensors
    .map((s) => s.attributes.currentTemperature)
    .filter((t): t is number => typeof t === 'number');
  const avgTemp = temperatures.length > 0
    ? temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length
    : null;

  // Count online sensors
  const onlineSensors = sensors.filter((s) => s.isReachable).length;

  // Calculate average air quality (PM2.5)
  const pm25Values = sensors
    .map((s) => s.attributes.currentPM25)
    .filter((p): p is number => typeof p === 'number');
  const avgPM25 = pm25Values.length > 0
    ? pm25Values.reduce((sum, p) => sum + p, 0) / pm25Values.length
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-3">
          <CardDescription className="text-indigo-600 dark:text-indigo-400">
            Total Sensors
          </CardDescription>
          <CardTitle className="text-3xl text-indigo-900 dark:text-indigo-100">
            {sensors.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
            <Activity className="w-4 h-4" />
            <span>{onlineSensors} online</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/20 border-teal-200 dark:border-teal-800">
        <CardHeader className="pb-3">
          <CardDescription className="text-teal-600 dark:text-teal-400">
            Average Temperature
          </CardDescription>
          <CardTitle className="text-3xl text-teal-900 dark:text-teal-100">
            {avgTemp !== null ? formatTemperature(avgTemp) : 'N/A'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-300">
            <TrendingUp className="w-4 h-4" />
            <span>Across all rooms</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardDescription className="text-purple-600 dark:text-purple-400">
            Air Quality
          </CardDescription>
          <CardTitle className="text-3xl text-purple-900 dark:text-purple-100">
            {avgPM25 !== null ? getAirQualityDescription(avgPM25) : 'N/A'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
            <Wind className="w-4 h-4" />
            <span>{avgPM25 !== null ? `${formatPM25(avgPM25)} avg` : 'No data'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Individual sensor card displaying all sensor metrics
 */
function SensorCard({ sensor }: { sensor: EnvironmentSensorDevice }) {
  const { attributes, room, customName, id, isReachable } = sensor;
  const { currentTemperature, currentRH, currentPM25, vocIndex } = attributes;

  // Determine air quality color based on PM2.5
  const airQualityColor = currentPM25 !== undefined
    ? getAirQualityColor(currentPM25)
    : '#808080';
  const airQualityDesc = currentPM25 !== undefined
    ? getAirQualityDescription(currentPM25)
    : 'Unknown';

  // Use a timestamp for "last updated" - in real scenarios this would come from the device
  const lastUpdated = new Date().toISOString();

  return (
    <Link
      to="/history/$deviceId"
      params={{ deviceId: id }}
      className="block group"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer">
        {/* Gradient header with device name */}
        <div className="bg-gradient-to-br from-indigo-500 to-teal-500 p-6 text-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">
                {customName || id}
              </h3>
              {room && (
                <p className="text-indigo-100 text-sm">
                  {room.name}
                </p>
              )}
            </div>
            <Badge
              className={cn(
                'ml-2',
                isReachable
                  ? 'bg-green-500 hover:bg-green-600 border-green-400'
                  : 'bg-gray-500 hover:bg-gray-600 border-gray-400'
              )}
            >
              {formatDeviceStatus(isReachable)}
            </Badge>
          </div>
        </div>

        <CardContent className="pt-6 space-y-4">
          {/* Temperature */}
          {currentTemperature !== undefined && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Temperature</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatTemperature(currentTemperature)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Humidity */}
          {currentRH !== undefined && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Humidity</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatHumidity(currentRH)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PM2.5 */}
          {currentPM25 !== undefined && (
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: `${airQualityColor}15`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-full"
                  style={{
                    backgroundColor: `${airQualityColor}30`,
                  }}
                >
                  <Wind className="w-5 h-5" style={{ color: airQualityColor }} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">PM2.5</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatPM25(currentPM25)}
                  </p>
                  <p className="text-xs font-medium mt-1" style={{ color: airQualityColor }}>
                    {airQualityDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VOC */}
          {vocIndex !== undefined && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">VOC Index</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatVOCIndex(vocIndex)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Clock className="w-4 h-4" />
            <span>Updated {formatRelativeTime(lastUpdated)}</span>
          </div>

          {/* View History Button */}
          <Button
            className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 group-hover:shadow-lg transition-all"
            asChild
          >
            <span>View History</span>
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Main Dashboard Component
 */
export function Dashboard() {
  const { data: devices, isLoading, error, refetch } = useSensorData();
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);

  // Filter only environment sensors
  const sensors = (devices || []).filter(
    (device): device is EnvironmentSensorDevice =>
      device.type === 'environment_sensor' && device.deviceType === 'environmentSensor'
  );

  // Auto-save sensor data to IndexedDB when data is fetched
  useEffect(() => {
    if (devices && devices.length > 0) {
      const saveData = async () => {
        try {
          for (const device of devices) {
            if (device.type === 'environment_sensor') {
              const sensor = device as EnvironmentSensorDevice;
              const snapshot = {
                deviceId: sensor.id,
                deviceName: sensor.customName,
                roomName: sensor.room?.name,
                timestamp: new Date().toISOString(),
                temperature: sensor.attributes.currentTemperature,
                humidity: sensor.attributes.currentRH,
                pm25: sensor.attributes.currentPM25,
                vocIndex: sensor.attributes.vocIndex,
              };
              await storeDeviceSnapshot(snapshot);
            }
          }
        } catch (error) {
          console.error('Failed to save sensor data to history:', error);
        }
      };
      saveData();
    }
  }, [devices]);

  // Cleanup old readings periodically (once per session or every hour)
  useEffect(() => {
    const shouldCleanup = !lastCleanup || Date.now() - lastCleanup.getTime() > 3600000; // 1 hour

    if (shouldCleanup) {
      const cleanup = async () => {
        try {
          const deletedCount = await cleanupOldReadings();
          console.log(`Cleaned up ${deletedCount} old sensor readings`);
          setLastCleanup(new Date());
        } catch (error) {
          console.error('Failed to cleanup old readings:', error);
        }
      };
      cleanup();
    }
  }, [lastCleanup]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SensorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  // Empty state
  if (sensors.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Environment Sensors
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor temperature, humidity, and air quality across your home
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        <EmptyState />
      </div>
    );
  }

  // Main content
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Environment Sensors
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor temperature, humidity, and air quality across your home
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="gap-2 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <StatsOverview sensors={sensors} />

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
    </div>
  );
}
