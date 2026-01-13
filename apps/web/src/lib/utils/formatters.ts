/**
 * Formatting utilities for displaying sensor data
 *
 * This module provides utility functions for formatting temperature,
 * humidity, dates, and other values for display in the UI.
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Temperature unit options
 */
export type TemperatureUnit = 'celsius' | 'fahrenheit';

/**
 * Date format presets
 */
export type DateFormat = 'short' | 'medium' | 'long' | 'time' | 'datetime';

/**
 * Format temperature with unit
 * @param celsius - Temperature in Celsius
 * @param unit - Target unit (celsius or fahrenheit)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted temperature string with unit
 *
 * @example
 * ```ts
 * formatTemperature(21.5) // "21.5°C"
 * formatTemperature(21.5, 'fahrenheit') // "70.7°F"
 * formatTemperature(21.5, 'celsius', 0) // "22°C"
 * ```
 */
export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit = 'celsius',
  decimals: number = 1
): string {
  if (!isFinite(celsius)) {
    return 'N/A';
  }

  if (unit === 'fahrenheit') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(decimals)}°F`;
  }

  return `${celsius.toFixed(decimals)}°C`;
}

/**
 * Format humidity percentage
 * @param humidity - Humidity value (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted humidity string with unit
 *
 * @example
 * ```ts
 * formatHumidity(65.5) // "66%"
 * formatHumidity(65.5, 1) // "65.5%"
 * ```
 */
export function formatHumidity(humidity: number, decimals: number = 0): string {
  if (!isFinite(humidity) || humidity < 0 || humidity > 100) {
    return 'N/A';
  }

  return `${humidity.toFixed(decimals)}%`;
}

/**
 * Format PM2.5 value
 * @param pm25 - PM2.5 concentration in μg/m³
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted PM2.5 string with unit
 *
 * @example
 * ```ts
 * formatPM25(12.5) // "13 μg/m³"
 * formatPM25(12.5, 1) // "12.5 μg/m³"
 * ```
 */
export function formatPM25(pm25: number, decimals: number = 0): string {
  if (!isFinite(pm25) || pm25 < 0) {
    return 'N/A';
  }

  return `${pm25.toFixed(decimals)} μg/m³`;
}

/**
 * Format VOC index
 * @param vocIndex - VOC index value (1-500)
 * @returns Formatted VOC index string
 *
 * @example
 * ```ts
 * formatVOCIndex(150) // "150"
 * formatVOCIndex(1.5) // "2" (rounded to integer)
 * ```
 */
export function formatVOCIndex(vocIndex: number): string {
  if (!isFinite(vocIndex) || vocIndex < 0) {
    return 'N/A';
  }

  return Math.round(vocIndex).toString();
}

/**
 * Get air quality description based on PM2.5 value
 * Based on US EPA Air Quality Index
 * @param pm25 - PM2.5 concentration in μg/m³
 * @returns Air quality description
 *
 * @example
 * ```ts
 * getAirQualityDescription(10) // "Good"
 * getAirQualityDescription(35) // "Moderate"
 * getAirQualityDescription(75) // "Unhealthy for Sensitive Groups"
 * ```
 */
export function getAirQualityDescription(pm25: number): string {
  if (!isFinite(pm25) || pm25 < 0) {
    return 'Unknown';
  }

  if (pm25 <= 12.0) return 'Good';
  if (pm25 <= 35.4) return 'Moderate';
  if (pm25 <= 55.4) return 'Unhealthy for Sensitive Groups';
  if (pm25 <= 150.4) return 'Unhealthy';
  if (pm25 <= 250.4) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Get air quality color code based on PM2.5 value
 * @param pm25 - PM2.5 concentration in μg/m³
 * @returns CSS color value
 *
 * @example
 * ```ts
 * getAirQualityColor(10) // "#00e400" (green)
 * getAirQualityColor(75) // "#ff7e00" (orange)
 * ```
 */
export function getAirQualityColor(pm25: number): string {
  if (!isFinite(pm25) || pm25 < 0) {
    return '#808080'; // Gray for unknown
  }

  if (pm25 <= 12.0) return '#00e400'; // Green
  if (pm25 <= 35.4) return '#ffff00'; // Yellow
  if (pm25 <= 55.4) return '#ff7e00'; // Orange
  if (pm25 <= 150.4) return '#ff0000'; // Red
  if (pm25 <= 250.4) return '#8f3f97'; // Purple
  return '#7e0023'; // Maroon
}

/**
 * Format a date/time using date-fns
 * @param timestamp - ISO 8601 timestamp string or Date object
 * @param formatType - Format preset (default: 'medium')
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDateTime('2024-01-15T14:30:00Z') // "Jan 15, 2024"
 * formatDateTime('2024-01-15T14:30:00Z', 'long') // "January 15, 2024"
 * formatDateTime('2024-01-15T14:30:00Z', 'datetime') // "Jan 15, 2024 2:30 PM"
 * formatDateTime('2024-01-15T14:30:00Z', 'time') // "2:30 PM"
 * ```
 */
export function formatDateTime(
  timestamp: string | Date,
  formatType: DateFormat = 'medium'
): string {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;

    if (!isValid(date)) {
      return 'Invalid date';
    }

    switch (formatType) {
      case 'short':
        return format(date, 'MMM d');
      case 'medium':
        return format(date, 'MMM d, yyyy');
      case 'long':
        return format(date, 'MMMM d, yyyy');
      case 'time':
        return format(date, 'h:mm a');
      case 'datetime':
        return format(date, 'MMM d, yyyy h:mm a');
      default:
        return format(date, 'MMM d, yyyy');
    }
  } catch (error) {
    console.error('Failed to format date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param timestamp - ISO 8601 timestamp string or Date object
 * @param addSuffix - Whether to add "ago" suffix (default: true)
 * @returns Relative time string
 *
 * @example
 * ```ts
 * formatRelativeTime('2024-01-15T14:30:00Z') // "2 hours ago"
 * formatRelativeTime('2024-01-15T14:30:00Z', false) // "2 hours"
 * ```
 */
export function formatRelativeTime(
  timestamp: string | Date,
  addSuffix: boolean = true
): string {
  try {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;

    if (!isValid(date)) {
      return 'Invalid date';
    }

    return formatDistanceToNow(date, { addSuffix });
  } catch (error) {
    console.error('Failed to format relative time:', error);
    return 'Invalid date';
  }
}

/**
 * Format a number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 *
 * @example
 * ```ts
 * formatNumber(1234.5) // "1,235"
 * formatNumber(1234.5, 1) // "1,234.5"
 * formatNumber(1234567, 0) // "1,234,567"
 * ```
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (!isFinite(value)) {
    return 'N/A';
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a percentage
 * @param value - Number between 0 and 1 (or 0 and 100 if isDecimal is false)
 * @param decimals - Number of decimal places (default: 0)
 * @param isDecimal - Whether input is decimal (0-1) or percentage (0-100)
 * @returns Formatted percentage string
 *
 * @example
 * ```ts
 * formatPercentage(0.755, 1, true) // "75.5%"
 * formatPercentage(75.5, 1, false) // "75.5%"
 * ```
 */
export function formatPercentage(
  value: number,
  decimals: number = 0,
  isDecimal: boolean = true
): string {
  if (!isFinite(value)) {
    return 'N/A';
  }

  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Truncate text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append when truncated (default: '...')
 * @returns Truncated text
 *
 * @example
 * ```ts
 * truncateText('Hello World', 8) // "Hello..."
 * truncateText('Hello', 10) // "Hello"
 * ```
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format device connection status
 * @param isReachable - Whether device is reachable
 * @returns Formatted status string
 */
export function formatDeviceStatus(isReachable: boolean): string {
  return isReachable ? 'Online' : 'Offline';
}

/**
 * Get status color for device connection
 * @param isReachable - Whether device is reachable
 * @returns CSS color value
 */
export function getDeviceStatusColor(isReachable: boolean): string {
  return isReachable ? '#00e400' : '#808080';
}
