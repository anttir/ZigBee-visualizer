# @zigbee-visualizer/shared-types

Shared TypeScript type definitions for the IKEA Dirigera API and ZigBee sensor devices.

## Overview

This package provides comprehensive TypeScript type definitions for working with the IKEA Dirigera smart home hub API. It includes types for devices, sensor readings, API responses, authentication, and real-time WebSocket messages.

## Installation

```bash
npm install @zigbee-visualizer/shared-types
```

## Usage

### Device Types

Import device types to work with Dirigera devices:

```typescript
import {
  DirigeeraDevice,
  EnvironmentSensorDevice,
  isEnvironmentSensor,
  hasTemperature,
} from '@zigbee-visualizer/shared-types';

// Type-safe device handling
function handleDevice(device: DirigeeraDevice) {
  if (isEnvironmentSensor(device)) {
    console.log(`Temperature: ${device.attributes.currentTemperature}°C`);
    console.log(`Humidity: ${device.attributes.currentRH}%`);
    console.log(`PM2.5: ${device.attributes.currentPM25} μg/m³`);
    console.log(`VOC Index: ${device.attributes.vocIndex}`);
  }
}

// Check for specific capabilities
function displayTemperature(device: DirigeeraDevice) {
  if (hasTemperature(device)) {
    console.log(`Current temperature: ${device.attributes.currentTemperature}°C`);
  }
}
```

### Sensor Readings

Use sensor reading types for storing and managing historical data:

```typescript
import {
  SensorReading,
  TemperatureReading,
  DeviceSensorSnapshot,
  isTemperatureReading,
} from '@zigbee-visualizer/shared-types';

// Create a temperature reading
const reading: TemperatureReading = {
  deviceId: 'sensor-123',
  deviceName: 'Living Room Sensor',
  roomName: 'Living Room',
  timestamp: new Date().toISOString(),
  type: 'temperature',
  value: 22.5,
  unit: '°C',
};

// Create a device snapshot with all readings
const snapshot: DeviceSensorSnapshot = {
  deviceId: 'sensor-123',
  deviceName: 'Living Room Sensor',
  roomName: 'Living Room',
  timestamp: new Date().toISOString(),
  temperature: 22.5,
  humidity: 45,
  pm25: 3,
  vocIndex: 100,
};

// Type-safe reading handling
function processReading(reading: SensorReading) {
  if (isTemperatureReading(reading)) {
    console.log(`Temperature: ${reading.value}${reading.unit}`);
  }
}
```

### API Responses

Work with API responses in a type-safe manner:

```typescript
import {
  DeviceListResponse,
  AuthConfig,
  ApiResponse,
  ApiError,
} from '@zigbee-visualizer/shared-types';

// Configure authentication
const authConfig: AuthConfig = {
  hubAddress: '192.168.1.100',
  port: 8443,
  token: {
    token: 'your-auth-token',
    createdAt: new Date().toISOString(),
  },
};

// Handle API responses
async function fetchDevices(): Promise<DirigeeraDevice[]> {
  try {
    const response: ApiResponse<DirigeeraDevice[]> = await fetch(
      `https://${authConfig.hubAddress}:${authConfig.port}/v1/devices`
    ).then(res => res.json());

    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`API Error: ${apiError.message}`);
    throw error;
  }
}
```

### WebSocket Messages

Handle real-time updates with WebSocket message types:

```typescript
import {
  DirigeeraWebSocketMessage,
  isDeviceStateChangedMessage,
  isDeviceAddedMessage,
  isDeviceRemovedMessage,
} from '@zigbee-visualizer/shared-types';

function handleWebSocketMessage(message: DirigeeraWebSocketMessage) {
  if (isDeviceStateChangedMessage(message)) {
    console.log('Device state changed:', message.data);
  } else if (isDeviceAddedMessage(message)) {
    console.log('New device added:', message.data);
  } else if (isDeviceRemovedMessage(message)) {
    console.log('Device removed:', message.data.deviceId);
  }
}
```

## Type Categories

### Device Types (`device.ts`)

- **DirigeeraDevice**: Union type of all supported devices
- **EnvironmentSensorDevice**: Air quality and climate sensors
- **BaseDevice**: Shared device properties
- **EnvironmentSensorAttributes**: Sensor-specific attributes
- **DeviceCapabilities**: Device action capabilities
- **Room**: Room information

Type guards:
- `isEnvironmentSensor()`: Check if device is an environment sensor
- `hasTemperature()`: Check if device has temperature readings
- `hasHumidity()`: Check if device has humidity readings
- `hasPM25()`: Check if device has PM2.5 readings
- `hasVOC()`: Check if device has VOC readings

### Sensor Reading Types (`sensor.ts`)

- **SensorReading**: Union type of all sensor readings
- **TemperatureReading**: Temperature sensor data
- **HumidityReading**: Humidity sensor data
- **PM25Reading**: PM2.5 particulate matter data
- **VOCReading**: Volatile Organic Compounds data
- **DeviceSensorSnapshot**: Aggregated readings from a device
- **SensorDataQuery**: Query parameters for historical data
- **SensorStatistics**: Statistical summary of readings
- **TimeRange**: Time period specification

Type guards:
- `isTemperatureReading()`: Check if reading is temperature
- `isHumidityReading()`: Check if reading is humidity
- `isPM25Reading()`: Check if reading is PM2.5
- `isVOCReading()`: Check if reading is VOC

### API Response Types (`api.ts`)

- **AuthToken**: Authentication token storage
- **AuthConfig**: Authentication configuration
- **ApiResponse**: Generic API response wrapper
- **ApiError**: API error information
- **DeviceListResponse**: List of all devices
- **DeviceResponse**: Single device response
- **DeviceUpdateRequest**: Device update payload
- **HubInfoResponse**: Hub information
- **RoomListResponse**: List of all rooms
- **WebSocketMessage**: Real-time update messages
- **PaginatedResponse**: Paginated data wrapper

Type guards:
- `isDeviceStateChangedMessage()`: Check WebSocket message type
- `isDeviceAddedMessage()`: Check WebSocket message type
- `isDeviceRemovedMessage()`: Check WebSocket message type

## Sensor Data

### Supported Sensor Types

1. **Temperature** (°C)
   - Range: Typical indoor range -10°C to 50°C
   - Source: `currentTemperature` attribute

2. **Humidity** (%)
   - Range: 0-100%
   - Source: `currentRH` attribute

3. **PM2.5** (μg/m³)
   - Particulate matter smaller than 2.5 micrometers
   - Source: `currentPM25` attribute

4. **VOC Index** (1-500)
   - Volatile Organic Compounds air quality index
   - Source: `vocIndex` attribute

### Supported Devices

- **VINDSTYRKA**: Air quality sensor (temperature, humidity, PM2.5, VOC)
- **STARKVIND**: Air purifier with sensors

## API Endpoints

Common Dirigera API endpoints that use these types:

- `GET /v1/devices` - List all devices (returns `DirigeeraDevice[]`)
- `GET /v1/devices/{id}` - Get single device (returns `DirigeeraDevice`)
- `PATCH /v1/devices/{id}` - Update device (accepts `DeviceUpdateRequest`)
- `GET /v1/hub` - Get hub information (returns `HubInfoResponse`)
- `GET /v1/rooms` - List all rooms (returns `RoomListResponse`)

## Building

Build the TypeScript types to JavaScript:

```bash
npm run build
```

This will generate the compiled files in the `dist/` directory with TypeScript declaration files.

## Development

The package structure:

```
packages/shared-types/
├── src/
│   ├── index.ts      # Main export file
│   ├── device.ts     # Device type definitions
│   ├── sensor.ts     # Sensor reading types
│   └── api.ts        # API response types
├── package.json
├── tsconfig.json
└── README.md
```

## Type Safety

All types include comprehensive JSDoc comments for better IDE support and documentation. The package uses strict TypeScript settings to ensure maximum type safety.

## Contributing

When adding new device types or sensor capabilities:

1. Add the type definitions in the appropriate module
2. Export the types from `index.ts`
3. Add type guards if applicable
4. Update this README with usage examples

## License

MIT
