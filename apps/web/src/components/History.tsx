/**
 * History Component
 *
 * Displays historical sensor data for a specific device with interactive charts,
 * statistics, and device information. Features multiple time range options,
 * professional data visualization, and CSV export functionality.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, subDays, subHours } from 'date-fns';
import type { SensorReading } from '@zigbee-visualizer/shared-types';
import { querySensorReadings } from '@/lib/storage/history';
import {
  formatTemperature,
  formatHumidity,
  formatPM25,
  formatVOCIndex,
  formatDateTime,
  formatRelativeTime,
  getAirQualityColor,
  getAirQualityDescription,
} from '@/lib/utils/formatters';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HistoryProps {
  deviceId: string;
}

type TimeRangeOption = '24h' | '7d' | '30d';

interface ChartDataPoint {
  timestamp: string;
  time: string;
  temperature?: number;
  humidity?: number;
  pm25?: number;
  voc?: number;
}

interface MetricStats {
  min: number;
  max: number;
  average: number;
  minTime: string;
  maxTime: string;
  current?: number;
  previous?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface DeviceInfo {
  deviceName: string;
  roomName?: string;
  lastUpdated: string;
  currentReadings: {
    temperature?: number;
    humidity?: number;
    pm25?: number;
    voc?: number;
  };
}

export default function History({ deviceId }: HistoryProps) {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('24h');
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch historical data based on selected time range
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case '24h':
            startDate = subHours(now, 24);
            break;
          case '7d':
            startDate = subDays(now, 7);
            break;
          case '30d':
            startDate = subDays(now, 30);
            break;
        }

        const data = await querySensorReadings({
          deviceId,
          timeRange: {
            start: startDate.toISOString(),
            end: now.toISOString(),
          },
        });

        setReadings(data);
      } catch (err) {
        console.error('Failed to fetch historical data:', err);
        setError('Failed to load historical data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [deviceId, timeRange]);

  // Process readings into chart data
  const chartData = useMemo(() => {
    const dataMap = new Map<string, ChartDataPoint>();

    readings.forEach((reading) => {
      const timestamp = reading.timestamp;
      const existing = dataMap.get(timestamp) || {
        timestamp,
        time: formatDateTime(timestamp, 'short'),
      };

      switch (reading.type) {
        case 'temperature':
          existing.temperature = reading.value;
          break;
        case 'humidity':
          existing.humidity = reading.value;
          break;
        case 'pm25':
          existing.pm25 = reading.value;
          break;
        case 'voc':
          existing.voc = reading.value;
          break;
      }

      dataMap.set(timestamp, existing);
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [readings]);

  // Calculate statistics for each metric
  const statistics = useMemo(() => {
    const stats: Record<string, MetricStats> = {};

    const calculateStats = (
      type: 'temperature' | 'humidity' | 'pm25' | 'voc'
    ): MetricStats | null => {
      const values = chartData
        .map((d) => ({ value: d[type], timestamp: d.timestamp }))
        .filter((d) => d.value !== undefined) as { value: number; timestamp: string }[];

      if (values.length === 0) return null;

      const min = Math.min(...values.map((v) => v.value));
      const max = Math.max(...values.map((v) => v.value));
      const average = values.reduce((sum, v) => sum + v.value, 0) / values.length;

      const minReading = values.find((v) => v.value === min)!;
      const maxReading = values.find((v) => v.value === max)!;

      const current = values[values.length - 1]?.value;
      const previous = values.length > 1 ? values[0]?.value : undefined;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (current !== undefined && previous !== undefined) {
        const change = ((current - previous) / previous) * 100;
        if (change > 2) trend = 'up';
        else if (change < -2) trend = 'down';
      }

      return {
        min,
        max,
        average,
        minTime: minReading.timestamp,
        maxTime: maxReading.timestamp,
        current,
        previous,
        trend,
      };
    };

    const temp = calculateStats('temperature');
    if (temp) stats.temperature = temp;

    const humidity = calculateStats('humidity');
    if (humidity) stats.humidity = humidity;

    const pm25 = calculateStats('pm25');
    if (pm25) stats.pm25 = pm25;

    const voc = calculateStats('voc');
    if (voc) stats.voc = voc;

    return stats;
  }, [chartData]);

  // Extract device info from latest readings
  const deviceInfo = useMemo((): DeviceInfo | null => {
    if (readings.length === 0) return null;

    const latestByType = new Map<string, SensorReading>();
    readings.forEach((reading) => {
      const existing = latestByType.get(reading.type);
      if (
        !existing ||
        new Date(reading.timestamp) > new Date(existing.timestamp)
      ) {
        latestByType.set(reading.type, reading);
      }
    });

    const latestReading = readings[0]; // Already sorted by timestamp (newest first)

    return {
      deviceName: latestReading?.deviceName || 'Unknown Device',
      roomName: latestReading?.roomName,
      lastUpdated: latestReading?.timestamp || new Date().toISOString(),
      currentReadings: {
        temperature: latestByType.get('temperature')?.value,
        humidity: latestByType.get('humidity')?.value,
        pm25: latestByType.get('pm25')?.value,
        voc: latestByType.get('voc')?.value,
      },
    };
  }, [readings]);

  // Export data to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Temperature (°C)', 'Humidity (%)', 'PM2.5 (μg/m³)', 'VOC Index'];
    const rows = chartData.map((d) => [
      d.timestamp,
      d.temperature?.toFixed(1) ?? '',
      d.humidity?.toFixed(1) ?? '',
      d.pm25?.toFixed(0) ?? '',
      d.voc?.toFixed(0) ?? '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor-data-${deviceId}-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}
            {entry.unit}
          </p>
        ))}
      </div>
    );
  };

  // Get PM2.5 bar color based on air quality
  const getPM25BarColor = (value: number) => {
    return getAirQualityColor(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading historical data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-destructive text-4xl">⚠</div>
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-muted-foreground text-4xl">📊</div>
              <p className="text-lg font-medium">No historical data available</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Historical data will appear here once sensor readings are collected.
                This may take a few minutes after setup.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Historical Data</h2>
          <p className="text-sm text-muted-foreground">
            {deviceInfo?.deviceName}
            {deviceInfo?.roomName && ` • ${deviceInfo.roomName}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex border border-border rounded-lg p-1">
            <Button
              variant={timeRange === '24h' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('24h')}
            >
              Last 24h
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              Last 7 days
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              Last 30 days
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Device Info Card */}
      {deviceInfo && (
        <Card className="bg-gradient-to-br from-indigo-500/10 via-teal-500/10 to-emerald-500/10 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-lg">Current Readings</CardTitle>
            <CardDescription>
              Last updated {formatRelativeTime(deviceInfo.lastUpdated)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {deviceInfo.currentReadings.temperature !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatTemperature(deviceInfo.currentReadings.temperature)}
                  </p>
                </div>
              )}

              {deviceInfo.currentReadings.humidity !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                    {formatHumidity(deviceInfo.currentReadings.humidity)}
                  </p>
                </div>
              )}

              {deviceInfo.currentReadings.pm25 !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">PM2.5</p>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color: getAirQualityColor(deviceInfo.currentReadings.pm25),
                    }}
                  >
                    {formatPM25(deviceInfo.currentReadings.pm25)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getAirQualityDescription(deviceInfo.currentReadings.pm25)}
                  </p>
                </div>
              )}

              {deviceInfo.currentReadings.voc !== undefined && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">VOC Index</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatVOCIndex(deviceInfo.currentReadings.voc)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statistics.temperature && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Temperature Stats
                {statistics.temperature.trend && (
                  <span
                    className={cn(
                      'text-xs',
                      statistics.temperature.trend === 'up'
                        ? 'text-red-500'
                        : statistics.temperature.trend === 'down'
                        ? 'text-blue-500'
                        : 'text-muted-foreground'
                    )}
                  >
                    {statistics.temperature.trend === 'up' ? '↑' : statistics.temperature.trend === 'down' ? '↓' : '→'}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min:</span>
                <span className="font-medium">
                  {formatTemperature(statistics.temperature.min)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max:</span>
                <span className="font-medium">
                  {formatTemperature(statistics.temperature.max)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-medium">
                  {formatTemperature(statistics.temperature.average)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {statistics.humidity && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Humidity Stats
                {statistics.humidity.trend && (
                  <span
                    className={cn(
                      'text-xs',
                      statistics.humidity.trend === 'up'
                        ? 'text-blue-500'
                        : statistics.humidity.trend === 'down'
                        ? 'text-orange-500'
                        : 'text-muted-foreground'
                    )}
                  >
                    {statistics.humidity.trend === 'up' ? '↑' : statistics.humidity.trend === 'down' ? '↓' : '→'}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min:</span>
                <span className="font-medium">
                  {formatHumidity(statistics.humidity.min)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max:</span>
                <span className="font-medium">
                  {formatHumidity(statistics.humidity.max)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-medium">
                  {formatHumidity(statistics.humidity.average)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {statistics.pm25 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                PM2.5 Stats
                {statistics.pm25.trend && (
                  <span
                    className={cn(
                      'text-xs',
                      statistics.pm25.trend === 'up'
                        ? 'text-red-500'
                        : statistics.pm25.trend === 'down'
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    )}
                  >
                    {statistics.pm25.trend === 'up' ? '↑' : statistics.pm25.trend === 'down' ? '↓' : '→'}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min:</span>
                <span className="font-medium">{formatPM25(statistics.pm25.min)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max:</span>
                <span className="font-medium">{formatPM25(statistics.pm25.max)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-medium">
                  {formatPM25(statistics.pm25.average)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {statistics.voc && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                VOC Stats
                {statistics.voc.trend && (
                  <span
                    className={cn(
                      'text-xs',
                      statistics.voc.trend === 'up'
                        ? 'text-orange-500'
                        : statistics.voc.trend === 'down'
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    )}
                  >
                    {statistics.voc.trend === 'up' ? '↑' : statistics.voc.trend === 'down' ? '↓' : '→'}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min:</span>
                <span className="font-medium">{formatVOCIndex(statistics.voc.min)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max:</span>
                <span className="font-medium">{formatVOCIndex(statistics.voc.max)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-medium">{formatVOCIndex(statistics.voc.average)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Temperature Chart */}
      {chartData.some((d) => d.temperature !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
            <CardDescription>Temperature readings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  className="text-xs"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                  label={{
                    value: '°C',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: 'currentColor' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#temperatureGradient)"
                  name="Temperature"
                  unit="°C"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Humidity Chart */}
      {chartData.some((d) => d.humidity !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>Humidity</CardTitle>
            <CardDescription>Relative humidity readings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  className="text-xs"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                  domain={[0, 100]}
                  label={{
                    value: '%',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: 'currentColor' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={false}
                  name="Humidity"
                  unit="%"
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* PM2.5 Chart */}
      {chartData.some((d) => d.pm25 !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>PM2.5 Air Quality</CardTitle>
            <CardDescription>
              Particulate matter (PM2.5) concentration with EPA Air Quality Index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  className="text-xs"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                  label={{
                    value: 'μg/m³',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: 'currentColor' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="pm25"
                  name="PM2.5"
                  unit=" μg/m³"
                  animationDuration={1000}
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pm25 !== undefined ? getPM25BarColor(entry.pm25) : '#808080'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Air Quality Legend */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00e400' }} />
                <span>Good (0-12)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffff00' }} />
                <span>Moderate (13-35)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff7e00' }} />
                <span>Unhealthy (36-55)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ff0000' }} />
                <span>Unhealthy (56-150)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8f3f97' }} />
                <span>Very Unhealthy (151-250)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7e0023' }} />
                <span>Hazardous (250+)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VOC Chart */}
      {chartData.some((d) => d.voc !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>VOC Index</CardTitle>
            <CardDescription>
              Volatile Organic Compounds index over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  className="text-xs"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis
                  className="text-xs"
                  stroke="currentColor"
                  tick={{ fill: 'currentColor' }}
                  label={{
                    value: 'Index',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: 'currentColor' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="voc"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="VOC Index"
                  unit=""
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
